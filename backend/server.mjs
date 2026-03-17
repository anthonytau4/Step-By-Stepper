import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { OAuth2Client } from "google-auth-library";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "gpt-5";
const googleClientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;
const adminEmail = String(process.env.ADMIN_EMAIL || "Anthonytau4@gmail.com").trim().toLowerCase();
const onlineWindowMs = Math.max(30_000, Number(process.env.ONLINE_WINDOW_MS || 120_000));
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, "data");
const dbPath = path.join(dataDir, "stepper-db.json");
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

function parseAllowedOrigins(value) {
  const raw = String(value || "*").trim();
  if (!raw || raw === "*") return "*";
  const list = raw.split(",").map(item => item.trim()).filter(Boolean);
  return list.length ? list : "*";
}

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGIN || "*");
app.use(cors({
  origin(origin, callback) {
    if (allowedOrigins === "*" || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed by Step-By-Stepper backend."));
  }
}));
app.use(express.json({ limit: "2mb" }));

function blankDb() {
  return {
    users: {},
    featuredChoreo: [],
    presence: {}
  };
}

async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(blankDb(), null, 2), "utf8");
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return blankDb();
    if (!parsed.users || typeof parsed.users !== "object") parsed.users = {};
    if (!Array.isArray(parsed.featuredChoreo)) parsed.featuredChoreo = [];
    if (!parsed.presence || typeof parsed.presence !== "object") parsed.presence = {};
    return parsed;
  } catch {
    return blankDb();
  }
}

async function writeDb(payload) {
  await ensureDb();
  await fs.writeFile(dbPath, JSON.stringify(payload, null, 2), "utf8");
}

function userKeyFromClaims(claims) {
  return String(claims?.sub || claims?.email || "").trim();
}

function pickProfile(claims) {
  const email = String(claims?.email || "").trim();
  return {
    sub: String(claims?.sub || "").trim(),
    email,
    name: String(claims?.name || email || "").trim(),
    picture: String(claims?.picture || "").trim(),
    isAdmin: isAdminEmail(email)
  };
}

function isAdminEmail(email) {
  return String(email || "").trim().toLowerCase() === adminEmail;
}

function readBearerToken(req) {
  const auth = String(req.headers.authorization || "").trim();
  if (auth.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const alt = String(req.headers["x-stepper-google-token"] || req.headers["x-google-credential"] || "").trim();
  return alt;
}

async function verifyGoogleToken(idToken) {
  if (!googleClient || !googleClientId) {
    const error = new Error("Google sign-in is not configured on the backend.");
    error.status = 503;
    throw error;
  }
  if (!idToken) {
    const error = new Error("Missing Google credential.");
    error.status = 401;
    throw error;
  }
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: googleClientId
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    const error = new Error("Google token did not contain a usable email address.");
    error.status = 401;
    throw error;
  }
  return payload;
}

async function requireGoogleUser(req, res, next) {
  try {
    const token = readBearerToken(req);
    const claims = await verifyGoogleToken(token);
    req.stepperUser = pickProfile(claims);
    req.stepperClaims = claims;
    req.stepperToken = token;
    next();
  } catch (error) {
    res.status(error.status || 401).json({
      ok: false,
      error: error?.message || "Google authentication failed."
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.stepperUser?.isAdmin) {
    res.status(403).json({ ok: false, error: "Admin access only." });
    return;
  }
  next();
}

function sanitizeSnapshot(snapshot) {
  const safe = snapshot && typeof snapshot === "object" ? snapshot : {};
  return {
    data: safe.data && typeof safe.data === "object" ? safe.data : {},
    phrasedTools: safe.phrasedTools && typeof safe.phrasedTools === "object" ? safe.phrasedTools : {}
  };
}

function sanitizeCloudEntry(entry) {
  const safe = entry && typeof entry === "object" ? entry : {};
  const snapshot = sanitizeSnapshot(safe.snapshot);
  return {
    id: String(safe.id || `${Date.now()}`).trim().slice(0, 160),
    title: String(safe.title || "Untitled Dance").trim().slice(0, 200),
    choreographer: String(safe.choreographer || "Uncredited").trim().slice(0, 200),
    country: String(safe.country || "").trim().slice(0, 120),
    level: String(safe.level || "Unlabelled").trim().slice(0, 60),
    counts: String(safe.counts || "-").trim().slice(0, 40),
    walls: String(safe.walls || "-").trim().slice(0, 40),
    music: String(safe.music || "").trim().slice(0, 240),
    sections: Number.isFinite(Number(safe.sections)) ? Number(safe.sections) : 0,
    steps: Number.isFinite(Number(safe.steps)) ? Number(safe.steps) : 0,
    updatedAt: new Date().toISOString(),
    snapshot
  };
}

function sanitizeBadgeTone(value) {
  const tone = String(value || "bronze").trim().toLowerCase();
  return tone === "gold" || tone === "silver" ? tone : "bronze";
}

function badgeLabelForTone(tone) {
  const fixed = sanitizeBadgeTone(tone);
  return fixed.charAt(0).toUpperCase() + fixed.slice(1);
}

function sanitizeFeaturedEntry(entry) {
  const safe = entry && typeof entry === "object" ? entry : {};
  const badgeTone = sanitizeBadgeTone(safe.badgeTone);
  const title = String(safe.title || "Untitled Dance").trim().slice(0, 200) || "Untitled Dance";
  return {
    featureId: String(safe.featureId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).trim().slice(0, 120),
    danceId: String(safe.danceId || safe.id || title).trim().slice(0, 160),
    ownerKey: String(safe.ownerKey || "").trim().slice(0, 160),
    ownerEmail: String(safe.ownerEmail || "").trim().slice(0, 200),
    ownerName: String(safe.ownerName || "").trim().slice(0, 200),
    title,
    choreographer: String(safe.choreographer || "Uncredited").trim().slice(0, 200),
    country: String(safe.country || "").trim().slice(0, 120),
    level: String(safe.level || "Unlabelled").trim().slice(0, 60),
    counts: String(safe.counts || "-").trim().slice(0, 40),
    walls: String(safe.walls || "-").trim().slice(0, 40),
    music: String(safe.music || "").trim().slice(0, 240),
    sections: Number.isFinite(Number(safe.sections)) ? Number(safe.sections) : 0,
    steps: Number.isFinite(Number(safe.steps)) ? Number(safe.steps) : 0,
    badgeTone,
    badgeLabel: String(safe.badgeLabel || badgeLabelForTone(badgeTone)).trim().slice(0, 60) || badgeLabelForTone(badgeTone),
    featuredAt: String(safe.featuredAt || new Date().toISOString()),
    featuredBy: String(safe.featuredBy || "").trim().slice(0, 200),
    updatedAt: String(safe.updatedAt || new Date().toISOString()),
    snapshot: sanitizeSnapshot(safe.snapshot)
  };
}

function featuredFromDance({ dance, ownerKey, ownerProfile, featuredBy, existing }) {
  return sanitizeFeaturedEntry({
    featureId: existing?.featureId,
    danceId: dance.id,
    ownerKey,
    ownerEmail: ownerProfile?.email || "",
    ownerName: ownerProfile?.name || ownerProfile?.email || "",
    title: dance.title,
    choreographer: dance.choreographer,
    country: dance.country,
    level: dance.level,
    counts: dance.counts,
    walls: dance.walls,
    music: dance.music,
    sections: dance.sections,
    steps: dance.steps,
    badgeTone: existing?.badgeTone || "bronze",
    badgeLabel: existing?.badgeLabel || badgeLabelForTone(existing?.badgeTone || "bronze"),
    featuredAt: existing?.featuredAt || new Date().toISOString(),
    featuredBy: featuredBy || existing?.featuredBy || "",
    updatedAt: new Date().toISOString(),
    snapshot: dance.snapshot
  });
}

function prunePresence(db) {
  const now = Date.now();
  const presence = db.presence && typeof db.presence === "object" ? db.presence : {};
  const next = {};
  Object.entries(presence).forEach(([key, value]) => {
    const lastSeen = Number(value?.lastSeen || 0);
    if (lastSeen && now - lastSeen <= onlineWindowMs) next[key] = value;
  });
  db.presence = next;
  return next;
}

function collectAdminDanceRows(db) {
  const rows = [];
  const featuredIndex = new Map(
    (Array.isArray(db.featuredChoreo) ? db.featuredChoreo : []).map(item => [
      `${String(item.ownerKey || "")}|${String(item.danceId || "")}`,
      item
    ])
  );
  Object.entries(db.users || {}).forEach(([ownerKey, bucket]) => {
    const profile = bucket?.profile || {};
    const cloudSaves = Array.isArray(bucket?.cloudSaves) ? bucket.cloudSaves : [];
    cloudSaves.forEach((dance) => {
      const featured = featuredIndex.get(`${ownerKey}|${String(dance?.id || "")}`) || null;
      rows.push({
        ownerKey,
        ownerEmail: String(profile.email || "").trim(),
        ownerName: String(profile.name || profile.email || "").trim(),
        dance: sanitizeCloudEntry(dance),
        featured: featured ? sanitizeFeaturedEntry(featured) : null
      });
    });
  });
  rows.sort((a, b) => new Date(b.dance.updatedAt || 0) - new Date(a.dance.updatedAt || 0));
  return rows;
}

app.get("/api/health", async (_req, res) => {
  const db = await readDb();
  const presence = prunePresence(db);
  await writeDb(db);
  res.json({
    ok: true,
    service: "step-by-stepper-backend",
    googleEnabled: !!googleClientId,
    openaiEnabled: !!openaiClient,
    cloudStorage: "json-file",
    membersOnline: Object.keys(presence).length
  });
});

app.get("/api/auth/config", (_req, res) => {
  res.json({
    ok: true,
    googleEnabled: !!googleClientId,
    googleClientId: googleClientId || "",
    adminEmail,
    openaiEnabled: !!openaiClient,
    cloudStorage: "json-file",
    authMode: googleClientId ? "google-id-token" : "none"
  });
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const credential = String(req.body?.credential || "").trim();
    const claims = await verifyGoogleToken(credential);
    const profile = pickProfile(claims);
    res.json({ ok: true, profile });
  } catch (error) {
    res.status(error.status || 401).json({ ok: false, error: error?.message || "Google sign-in failed." });
  }
});

app.get("/api/auth/me", requireGoogleUser, (req, res) => {
  res.json({ ok: true, profile: req.stepperUser });
});

app.get("/api/presence", async (_req, res) => {
  const db = await readDb();
  const presence = prunePresence(db);
  await writeDb(db);
  res.json({
    ok: true,
    count: Object.keys(presence).length,
    membersOnline: Object.keys(presence).length
  });
});

app.post("/api/presence/ping", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  db.presence[userKeyFromClaims(req.stepperClaims)] = {
    profile: req.stepperUser,
    lastSeen: Date.now()
  };
  const presence = prunePresence(db);
  await writeDb(db);
  res.json({ ok: true, count: Object.keys(presence).length, membersOnline: Object.keys(presence).length });
});

app.get("/api/cloud-saves", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = db.users[key] && Array.isArray(db.users[key].cloudSaves) ? db.users[key].cloudSaves : [];
  res.json({ ok: true, items: bucket.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)) });
});

app.post("/api/cloud-saves/upsert", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  if (!db.users[key]) db.users[key] = { profile: req.stepperUser, cloudSaves: [] };
  db.users[key].profile = req.stepperUser;
  const entry = sanitizeCloudEntry(req.body?.entry);
  const list = Array.isArray(db.users[key].cloudSaves) ? db.users[key].cloudSaves : [];
  const index = list.findIndex(item => item && item.id === entry.id);
  if (index >= 0) list[index] = { ...list[index], ...entry, updatedAt: new Date().toISOString() };
  else list.unshift(entry);
  db.users[key].cloudSaves = list
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 200);

  const featuredIndex = Array.isArray(db.featuredChoreo)
    ? db.featuredChoreo.findIndex(item => item && item.ownerKey === key && item.danceId === entry.id)
    : -1;
  if (featuredIndex >= 0) {
    const existingFeatured = db.featuredChoreo[featuredIndex];
    db.featuredChoreo[featuredIndex] = featuredFromDance({
      dance: entry,
      ownerKey: key,
      ownerProfile: req.stepperUser,
      featuredBy: existingFeatured?.featuredBy,
      existing: existingFeatured
    });
  }

  db.presence[key] = { profile: req.stepperUser, lastSeen: Date.now() };
  prunePresence(db);
  await writeDb(db);
  res.json({ ok: true, item: entry, items: db.users[key].cloudSaves });
});

app.delete("/api/cloud-saves/:id", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const id = String(req.params.id || "").trim();
  const list = db.users[key] && Array.isArray(db.users[key].cloudSaves) ? db.users[key].cloudSaves : [];
  db.users[key] = db.users[key] || { profile: req.stepperUser, cloudSaves: [] };
  db.users[key].profile = req.stepperUser;
  db.users[key].cloudSaves = list.filter(item => item && item.id !== id);
  db.featuredChoreo = (Array.isArray(db.featuredChoreo) ? db.featuredChoreo : []).filter(item => !(item && item.ownerKey === key && item.danceId === id));
  await writeDb(db);
  res.json({ ok: true, deletedId: id });
});

app.get("/api/featured-choreo", async (_req, res) => {
  const db = await readDb();
  const items = (Array.isArray(db.featuredChoreo) ? db.featuredChoreo : [])
    .map(item => sanitizeFeaturedEntry(item))
    .sort((a, b) => new Date(b.featuredAt || 0) - new Date(a.featuredAt || 0));
  res.json({ ok: true, items });
});

app.get("/api/admin/dances", requireGoogleUser, requireAdmin, async (_req, res) => {
  const db = await readDb();
  const rows = collectAdminDanceRows(db);
  res.json({
    ok: true,
    items: rows,
    featuredCount: (Array.isArray(db.featuredChoreo) ? db.featuredChoreo : []).length
  });
});

app.post("/api/admin/feature", requireGoogleUser, requireAdmin, async (req, res) => {
  const db = await readDb();
  const ownerKey = String(req.body?.ownerKey || "").trim();
  const danceId = String(req.body?.danceId || "").trim();
  const badgeTone = sanitizeBadgeTone(req.body?.badgeTone || "bronze");
  const badgeLabel = String(req.body?.badgeLabel || badgeLabelForTone(badgeTone)).trim().slice(0, 60) || badgeLabelForTone(badgeTone);
  const ownerBucket = db.users[ownerKey];
  const ownerProfile = ownerBucket?.profile || null;
  const dance = Array.isArray(ownerBucket?.cloudSaves)
    ? ownerBucket.cloudSaves.find(item => item && String(item.id || "") === danceId)
    : null;

  if (!ownerKey || !danceId || !dance) {
    res.status(404).json({ ok: false, error: "Dance not found for featuring." });
    return;
  }

  const existingIndex = (Array.isArray(db.featuredChoreo) ? db.featuredChoreo : []).findIndex(
    item => item && item.ownerKey === ownerKey && item.danceId === danceId
  );
  const existing = existingIndex >= 0 ? db.featuredChoreo[existingIndex] : null;
  const featuredEntry = sanitizeFeaturedEntry({
    ...featuredFromDance({
      dance: sanitizeCloudEntry(dance),
      ownerKey,
      ownerProfile,
      featuredBy: req.stepperUser.email,
      existing
    }),
    badgeTone,
    badgeLabel,
    featuredBy: req.stepperUser.email,
    featuredAt: existing?.featuredAt || new Date().toISOString()
  });

  if (!Array.isArray(db.featuredChoreo)) db.featuredChoreo = [];
  if (existingIndex >= 0) db.featuredChoreo[existingIndex] = featuredEntry;
  else db.featuredChoreo.unshift(featuredEntry);

  db.featuredChoreo = db.featuredChoreo
    .map(item => sanitizeFeaturedEntry(item))
    .sort((a, b) => new Date(b.featuredAt || 0) - new Date(a.featuredAt || 0));

  await writeDb(db);
  res.json({ ok: true, item: featuredEntry, items: collectAdminDanceRows(db) });
});

app.delete("/api/admin/feature", requireGoogleUser, requireAdmin, async (req, res) => {
  const db = await readDb();
  const ownerKey = String(req.body?.ownerKey || "").trim();
  const danceId = String(req.body?.danceId || "").trim();
  db.featuredChoreo = (Array.isArray(db.featuredChoreo) ? db.featuredChoreo : []).filter(
    item => !(item && item.ownerKey === ownerKey && item.danceId === danceId)
  );
  await writeDb(db);
  res.json({ ok: true, items: collectAdminDanceRows(db) });
});

app.post("/api/openai/respond", async (req, res) => {
  if (!openaiClient) {
    res.status(503).json({
      ok: false,
      error: "OPENAI_API_KEY is not set on the backend yet."
    });
    return;
  }
  try {
    const prompt = String(req.body?.prompt || "").trim();
    const system = String(req.body?.system || "You are Step-By-Stepper assistant logic.").trim();

    if (!prompt) {
      return res.status(400).json({ ok: false, error: "Missing prompt." });
    }

    const response = await openaiClient.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: system }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }]
        }
      ]
    });

    res.json({
      ok: true,
      text: response.output_text,
      raw: response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      error: error?.message || "Backend request failed."
    });
  }
});

ensureDb().then(() => {
  app.listen(port, () => {
    console.log(`Step-By-Stepper backend running on http://localhost:${port}`);
  });
}).catch(error => {
  console.error("Failed to start Step-By-Stepper backend", error);
  process.exit(1);
});
