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
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, "data");
const dbPath = path.join(dataDir, "stepper-db.json");
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || "anthonytau4@gmail.com");
const onlineWindowMs = Math.max(30_000, Number(process.env.ONLINE_WINDOW_MS || 180_000));

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

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
app.use(express.json({ limit: "4mb" }));

function emptyDb() {
  return {
    users: {},
    featuredChoreo: [],
    danceRegistry: []
  };
}

async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(emptyDb(), null, 2), "utf8");
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf8");
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyDb();
    if (!parsed.users || typeof parsed.users !== "object") parsed.users = {};
    if (!Array.isArray(parsed.featuredChoreo)) parsed.featuredChoreo = [];
    if (!Array.isArray(parsed.danceRegistry)) parsed.danceRegistry = [];
    return parsed;
  } catch {
    return emptyDb();
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
  return {
    sub: String(claims?.sub || "").trim(),
    email: String(claims?.email || "").trim(),
    name: String(claims?.name || claims?.email || "").trim(),
    picture: String(claims?.picture || "").trim()
  };
}

function isAdminProfile(profile) {
  return normalizeEmail(profile?.email) === adminEmail;
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

async function requireAdmin(req, res, next) {
  requireGoogleUser(req, res, async () => {
    if (!isAdminProfile(req.stepperUser)) {
      res.status(403).json({ ok: false, error: "Admin access only." });
      return;
    }
    next();
  });
}

function sanitizeSnapshot(snapshot) {
  const safe = snapshot && typeof snapshot === "object" ? snapshot : {};
  return {
    data: safe.data && typeof safe.data === "object" ? safe.data : {},
    phrasedTools: safe.phrasedTools && typeof safe.phrasedTools === "object" ? safe.phrasedTools : {}
  };
}

function sanitizeCloudEntry(entry, ownerProfile = null, ownerKey = "") {
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
    ownerKey: String(ownerKey || "").trim(),
    ownerEmail: String(ownerProfile?.email || safe.ownerEmail || "").trim(),
    ownerName: String(ownerProfile?.name || safe.ownerName || "").trim(),
    ownerPicture: String(ownerProfile?.picture || safe.ownerPicture || "").trim(),
    snapshot
  };
}

function buildPreviewSections(entry) {
  const sections = Array.isArray(entry?.snapshot?.data?.sections) ? entry.snapshot.data.sections : [];
  return sections.slice(0, 8).map((section, index) => {
    const steps = Array.isArray(section?.steps) ? section.steps : [];
    const lines = steps.slice(0, 12).map((step) => {
      const count = String(step?.count || "").trim();
      const name = String(step?.name || "").trim();
      const description = String(step?.description || "").trim();
      const note = step?.showNote ? String(step?.note || "").trim() : "";
      return [count, name, description, note ? `(${note})` : ""].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    }).filter(Boolean);

    return {
      name: String(section?.name || `Section ${index + 1}`).trim(),
      subtitle: "",
      lines
    };
  }).filter(section => Array.isArray(section.lines) && section.lines.length);
}

function buildBadgeLabel(tone, explicitLabel = "") {
  const custom = String(explicitLabel || "").trim();
  if (custom) return custom.slice(0, 120);
  if (tone === "gold") return "Gold Feature";
  if (tone === "silver") return "Silver Feature";
  return "Bronze Feature";
}

function sanitizeBadgeTone(value) {
  const tone = String(value || "bronze").trim().toLowerCase();
  return ["bronze", "silver", "gold"].includes(tone) ? tone : "bronze";
}

function upsertDanceRegistry(db, entry, userKey, profile) {
  const safeEntry = sanitizeCloudEntry(entry, profile, userKey);
  const registryId = `${normalizeEmail(profile?.email) || userKey}::${safeEntry.id}`;
  const registryEntry = {
    ...safeEntry,
    registryId,
    ownerKey: userKey,
    ownerEmail: String(profile?.email || safeEntry.ownerEmail || "").trim(),
    ownerName: String(profile?.name || safeEntry.ownerName || "").trim(),
    ownerPicture: String(profile?.picture || safeEntry.ownerPicture || "").trim()
  };

  const list = Array.isArray(db.danceRegistry) ? db.danceRegistry : [];
  const index = list.findIndex(item => item && item.registryId === registryId);
  if (index >= 0) list[index] = { ...list[index], ...registryEntry, updatedAt: new Date().toISOString() };
  else list.unshift(registryEntry);
  db.danceRegistry = list
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 4000);

  return db.danceRegistry.find(item => item && item.registryId === registryId) || registryEntry;
}

function buildFeaturedItemFromRegistry(entry, featuredBy, badgeTone, badgeLabel) {
  return {
    id: entry.registryId,
    registryId: entry.registryId,
    title: entry.title,
    choreographer: entry.choreographer,
    country: entry.country,
    level: entry.level,
    counts: entry.counts,
    walls: entry.walls,
    music: entry.music,
    sections: entry.sections,
    steps: entry.steps,
    updatedAt: entry.updatedAt,
    badgeTone,
    badgeLabel,
    note: `${badgeLabel} • Featured by ${featuredBy?.name || featuredBy?.email || "Admin"}`,
    ownerEmail: entry.ownerEmail,
    ownerName: entry.ownerName,
    ownerPicture: entry.ownerPicture,
    featuredAt: new Date().toISOString(),
    featuredBy: {
      email: String(featuredBy?.email || "").trim(),
      name: String(featuredBy?.name || featuredBy?.email || "").trim()
    },
    previewSections: buildPreviewSections(entry)
  };
}

function touchUser(db, profile, userKey) {
  const key = String(userKey || profile?.sub || profile?.email || "").trim();
  if (!key) return null;
  const bucket = db.users[key] && typeof db.users[key] === "object" ? db.users[key] : {};
  db.users[key] = {
    ...bucket,
    profile: {
      sub: String(profile?.sub || bucket?.profile?.sub || "").trim(),
      email: String(profile?.email || bucket?.profile?.email || "").trim(),
      name: String(profile?.name || bucket?.profile?.name || profile?.email || "").trim(),
      picture: String(profile?.picture || bucket?.profile?.picture || "").trim()
    },
    lastSeenAt: new Date().toISOString(),
    cloudSaves: Array.isArray(bucket.cloudSaves) ? bucket.cloudSaves : []
  };
  return db.users[key];
}

function getOnlineUsers(db) {
  const now = Date.now();
  return Object.values(db.users || {}).filter((user) => {
    const email = normalizeEmail(user?.profile?.email);
    if (!email) return false;
    const seen = Date.parse(user?.lastSeenAt || 0);
    return Number.isFinite(seen) && (now - seen) <= onlineWindowMs;
  }).map((user) => ({
    name: String(user?.profile?.name || user?.profile?.email || "").trim(),
    email: String(user?.profile?.email || "").trim(),
    picture: String(user?.profile?.picture || "").trim(),
    lastSeenAt: user?.lastSeenAt || null
  })).sort((a, b) => a.name.localeCompare(b.name));
}

app.get("/api/health", async (_req, res) => {
  const db = await readDb();
  res.json({
    ok: true,
    service: "step-by-stepper-backend",
    googleEnabled: !!googleClientId,
    openaiEnabled: !!openaiClient,
    cloudStorage: "json-file",
    onlineCount: getOnlineUsers(db).length,
    danceCount: Array.isArray(db.danceRegistry) ? db.danceRegistry.length : 0
  });
});

app.get("/api/auth/config", (_req, res) => {
  res.json({
    ok: true,
    googleEnabled: !!googleClientId,
    googleClientId: googleClientId || "",
    openaiEnabled: !!openaiClient,
    cloudStorage: "json-file",
    authMode: googleClientId ? "google-id-token" : "none",
    adminEmail,
    onlineWindowMs
  });
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const credential = String(req.body?.credential || "").trim();
    const claims = await verifyGoogleToken(credential);
    const profile = pickProfile(claims);
    const db = await readDb();
    touchUser(db, profile, userKeyFromClaims(claims));
    await writeDb(db);
    res.json({ ok: true, profile, isAdmin: isAdminProfile(profile), onlineCount: getOnlineUsers(db).length });
  } catch (error) {
    res.status(error.status || 401).json({ ok: false, error: error?.message || "Google sign-in failed." });
  }
});

app.get("/api/auth/me", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  touchUser(db, req.stepperUser, userKeyFromClaims(req.stepperClaims));
  await writeDb(db);
  res.json({ ok: true, profile: req.stepperUser, isAdmin: isAdminProfile(req.stepperUser), onlineCount: getOnlineUsers(db).length });
});

app.get("/api/presence", async (_req, res) => {
  const db = await readDb();
  const onlineUsers = getOnlineUsers(db);
  res.json({ ok: true, onlineCount: onlineUsers.length, members: onlineUsers });
});

app.post("/api/presence/heartbeat", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  touchUser(db, req.stepperUser, userKeyFromClaims(req.stepperClaims));
  await writeDb(db);
  const onlineUsers = getOnlineUsers(db);
  res.json({ ok: true, onlineCount: onlineUsers.length, members: onlineUsers, isAdmin: isAdminProfile(req.stepperUser) });
});

app.get("/api/cloud-saves", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  await writeDb(db);
  const bucket = db.users[key] && Array.isArray(db.users[key].cloudSaves) ? db.users[key].cloudSaves : [];
  res.json({ ok: true, items: bucket.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)) });
});

app.post("/api/cloud-saves/upsert", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const entry = sanitizeCloudEntry(req.body?.entry, req.stepperUser, key);
  const list = Array.isArray(db.users[key].cloudSaves) ? db.users[key].cloudSaves : [];
  const index = list.findIndex(item => item && item.id === entry.id);
  if (index >= 0) list[index] = { ...list[index], ...entry, updatedAt: new Date().toISOString() };
  else list.unshift(entry);
  db.users[key].cloudSaves = list
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 200);

  const registryItem = upsertDanceRegistry(db, entry, key, req.stepperUser);
  await writeDb(db);
  res.json({ ok: true, item: entry, registryItem, items: db.users[key].cloudSaves });
});

app.delete("/api/cloud-saves/:id", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const list = db.users[key] && Array.isArray(db.users[key].cloudSaves) ? db.users[key].cloudSaves : [];
  db.users[key].cloudSaves = list.filter(item => item && item.id !== String(req.params.id || "").trim());
  await writeDb(db);
  res.json({ ok: true, deletedId: String(req.params.id || "").trim() });
});

app.get("/api/featured-choreo", async (_req, res) => {
  const db = await readDb();
  const items = Array.isArray(db.featuredChoreo) ? db.featuredChoreo : [];
  res.json({ ok: true, items: items.sort((a, b) => new Date(b.featuredAt || b.updatedAt || 0) - new Date(a.featuredAt || a.updatedAt || 0)) });
});

app.get("/api/admin/dances", requireAdmin, async (_req, res) => {
  const db = await readDb();
  const featuredIds = new Set((db.featuredChoreo || []).map(item => String(item?.registryId || item?.id || "")).filter(Boolean));
  const items = (Array.isArray(db.danceRegistry) ? db.danceRegistry : [])
    .slice()
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .map(item => ({
      ...item,
      isFeatured: featuredIds.has(String(item?.registryId || ""))
    }));
  res.json({ ok: true, items, featuredIds: Array.from(featuredIds), adminEmail, onlineCount: getOnlineUsers(db).length });
});

app.post("/api/admin/feature", requireAdmin, async (req, res) => {
  const registryId = String(req.body?.registryId || "").trim();
  const badgeTone = sanitizeBadgeTone(req.body?.badgeTone);
  const badgeLabel = buildBadgeLabel(badgeTone, req.body?.badgeLabel);
  if (!registryId) {
    res.status(400).json({ ok: false, error: "Missing registryId." });
    return;
  }

  const db = await readDb();
  const source = (Array.isArray(db.danceRegistry) ? db.danceRegistry : []).find(item => item && item.registryId === registryId);
  if (!source) {
    res.status(404).json({ ok: false, error: "Dance not found in registry." });
    return;
  }

  const featuredItem = buildFeaturedItemFromRegistry(source, req.stepperUser, badgeTone, badgeLabel);
  const items = Array.isArray(db.featuredChoreo) ? db.featuredChoreo : [];
  const index = items.findIndex(item => item && String(item.registryId || item.id || "") === registryId);
  if (index >= 0) items[index] = { ...items[index], ...featuredItem, featuredAt: new Date().toISOString() };
  else items.unshift(featuredItem);
  db.featuredChoreo = items
    .sort((a, b) => new Date(b.featuredAt || b.updatedAt || 0) - new Date(a.featuredAt || a.updatedAt || 0))
    .slice(0, 300);

  await writeDb(db);
  res.json({ ok: true, item: featuredItem, items: db.featuredChoreo });
});

app.delete("/api/admin/feature/:registryId", requireAdmin, async (req, res) => {
  const registryId = String(req.params.registryId || "").trim();
  const db = await readDb();
  db.featuredChoreo = (Array.isArray(db.featuredChoreo) ? db.featuredChoreo : []).filter(item => String(item?.registryId || item?.id || "") !== registryId);
  await writeDb(db);
  res.json({ ok: true, registryId });
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
