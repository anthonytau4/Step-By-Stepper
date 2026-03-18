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
const renderDiskRoot = String(process.env.RENDER_DISK_MOUNT_PATH || '').trim();
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : renderDiskRoot
    ? path.join(path.resolve(renderDiskRoot), 'stepper-data')
    : path.join(__dirname, "data");
const dbPath = path.join(dataDir, "stepper-db.json");
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;
const geminiApiKey = String(process.env.GEMINI_API_KEY || '').trim();
const geminiModel = String(process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim() || 'gemini-2.5-flash';
const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL || "anthonytau4@gmail.com");
const onlineWindowMs = Math.max(30_000, Number(process.env.ONLINE_WINDOW_MS || 180_000));
const stripeSecretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
const stripePublishableKey = String(process.env.STRIPE_PUBLISHABLE_KEY || '').trim();
const monthlyAmountNzd = 1250;
const yearlyAmountNzd = 10000;
const builtInAllowedOrigins = [
  'https://step-by-stepper.com',
  'https://www.step-by-stepper.com',
  'https://step-by-stepper.onrender.com',
  'http://localhost:3000'
];

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function safeOrigin(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try { return new URL(raw).origin; } catch { return ''; }
}

function buildStripeAuthHeaders() {
  return { Authorization: `Bearer ${stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' };
}

async function stripeRequest(endpoint, params = null, method = 'POST') {
  if (!stripeSecretKey) {
    const error = new Error('Stripe is not configured on the backend yet.');
    error.status = 503;
    throw error;
  }
  const body = params ? new URLSearchParams(params).toString() : undefined;
  const response = await fetch(`https://api.stripe.com${endpoint}`, { method, headers: buildStripeAuthHeaders(), body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Stripe request failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function geminiGenerate({ system = '', prompt = '', history = [] } = {}) {
  if (!geminiApiKey) {
    const error = new Error('GEMINI_API_KEY is not set on the backend yet.');
    error.status = 503;
    throw error;
  }
  const contents = [];
  const safeHistory = Array.isArray(history) ? history.slice(-8) : [];
  for (const item of safeHistory) {
    const role = String(item?.role || 'user').trim().toLowerCase() === 'assistant' ? 'model' : 'user';
    const text = String(item?.text || '').trim().slice(0, 4000);
    if (!text) continue;
    contents.push({ role, parts: [{ text }] });
  }
  if (prompt) contents.push({ role: 'user', parts: [{ text: String(prompt) }] });
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: system ? { role: 'system', parts: [{ text: String(system).slice(0, 12000) }] } : undefined,
      contents,
      generationConfig: { temperature: 0.55 }
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || `Gemini request failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  const text = Array.isArray(data?.candidates)
    ? data.candidates.map(candidate => Array.isArray(candidate?.content?.parts) ? candidate.content.parts.map(part => String(part?.text || '')).join('') : '').join('\n').trim()
    : '';
  if (!text) {
    const error = new Error('Gemini returned no usable text.');
    error.status = 502;
    throw error;
  }
  return text;
}

async function runSiteHelperAI({ system, prompt, history = [], preferredModel = '' } = {}) {
  const order = [];
  const pref = String(preferredModel || '').trim().toLowerCase();
  if (pref === 'gemini') {
    if (geminiApiKey) order.push('gemini');
    if (openaiClient) order.push('openai');
  } else {
    if (openaiClient) order.push('openai');
    if (geminiApiKey) order.push('gemini');
  }
  if (!order.length) {
    const error = new Error('No AI provider is configured on the backend.');
    error.status = 503;
    throw error;
  }
  let lastError = null;
  for (const provider of order) {
    try {
      if (provider === 'gemini') {
        const text = await geminiGenerate({ system, prompt, history });
        return { provider, text };
      }
      const response = await openaiClient.responses.create({
        model,
        input: [
          { role: 'system', content: [{ type: 'input_text', text: String(system || '').slice(0, 12000) }] },
          ...history.slice(-8).map(item => ({ role: String(item?.role || 'user').trim().toLowerCase() === 'assistant' ? 'assistant' : 'user', content: [{ type: 'input_text', text: String(item?.text || '').trim().slice(0, 4000) }] })),
          { role: 'user', content: [{ type: 'input_text', text: String(prompt || '').slice(0, 12000) }] }
        ]
      });
      const text = String(response.output_text || '').trim();
      if (!text) {
        const error = new Error('OpenAI returned no usable text.');
        error.status = 502;
        throw error;
      }
      return { provider, text };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('AI request failed.');
}

function getUserMembership(bucket, profile = null) {
  const current = bucket && bucket.membership && typeof bucket.membership === 'object' ? bucket.membership : {};
  const admin = normalizeEmail(profile?.email || bucket?.profile?.email) === adminEmail;
  const role = String(bucket?.role || '').trim().toLowerCase();
  if (admin) {
    return { isPremium: true, status: 'active', plan: 'admin', source: 'admin', updatedAt: new Date().toISOString() };
  }
  if (role === 'moderator') {
    return {
      isPremium: true,
      status: 'active',
      plan: 'moderator',
      source: 'moderator',
      updatedAt: String(current.updatedAt || '').trim() || new Date().toISOString(),
      stripeCustomerId: String(current.stripeCustomerId || '').trim(),
      stripeSubscriptionId: String(current.stripeSubscriptionId || '').trim(),
      checkoutSessionId: String(current.checkoutSessionId || '').trim()
    };
  }
  return {
    isPremium: !!current.isPremium,
    status: String(current.status || 'free').trim() || 'free',
    plan: String(current.plan || 'free').trim() || 'free',
    source: String(current.source || 'free').trim() || 'free',
    updatedAt: String(current.updatedAt || '').trim() || null,
    stripeCustomerId: String(current.stripeCustomerId || '').trim(),
    stripeSubscriptionId: String(current.stripeSubscriptionId || '').trim(),
    checkoutSessionId: String(current.checkoutSessionId || '').trim()
  };
}

function isPremiumUser(bucket, profile = null) {
  const membership = getUserMembership(bucket, profile);
  return !!membership.isPremium;
}

function parseAllowedOrigins(value) {
  const raw = String(value || '*').trim();
  if (!raw || raw === '*') return '*';
  const list = raw.split(',').map(item => safeOrigin(item) || item.trim()).filter(Boolean);
  return Array.from(new Set([...builtInAllowedOrigins, ...list]));
}

const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGIN || "*");
const corsOptions = {
  origin(origin, callback) {
    if (allowedOrigins === "*" || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed by Step-By-Stepper backend."));
  },
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Stepper-Google-Token", "X-Google-Credential"],
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: "4mb" }));

function emptyDb() {
  return {
    users: {},
    featuredChoreo: [],
    danceRegistry: [],
    submissions: [],
    moderatorApplications: []
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
    if (!Array.isArray(parsed.submissions)) parsed.submissions = [];
    if (!Array.isArray(parsed.moderatorApplications)) parsed.moderatorApplications = [];
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

function isModeratorBucket(bucket) {
  return String(bucket?.role || '').trim().toLowerCase() === 'moderator';
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

async function requireModerator(req, res, next) {
  try {
    const token = readBearerToken(req);
    const claims = await verifyGoogleToken(token);
    req.stepperUser = pickProfile(claims);
    req.stepperClaims = claims;
    req.stepperToken = token;
    const db = await readDb();
    const key = userKeyFromClaims(claims);
    const bucket = touchUser(db, req.stepperUser, key);
    await writeDb(db);
    if (isAdminProfile(req.stepperUser) || isModeratorBucket(bucket)) {
      req.stepperUserBucket = bucket;
      next();
      return;
    }
    res.status(403).json({ ok: false, error: 'Moderator access only.' });
  } catch (error) {
    res.status(error.status || 401).json({ ok: false, error: error?.message || 'Google authentication failed.' });
  }
}

function sanitizeSnapshot(snapshot) {
  const safe = snapshot && typeof snapshot === "object" ? snapshot : {};
  return {
    data: safe.data && typeof safe.data === "object" ? safe.data : {},
    phrasedTools: safe.phrasedTools && typeof safe.phrasedTools === "object" ? safe.phrasedTools : {}
  };
}

function sanitizePreviewSections(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((section, index) => {
    const lines = Array.isArray(section?.lines)
      ? section.lines.slice(0, 16).map((line) => String(line || '').trim()).filter(Boolean)
      : [];
    return {
      name: String(section?.name || `Section ${index + 1}`).trim().slice(0, 120),
      subtitle: String(section?.subtitle || '').trim().slice(0, 200),
      lines
    };
  }).filter((section) => section.lines.length);
}

function buildStoredJsonPayload(entryLike) {
  const safe = entryLike && typeof entryLike === 'object' ? entryLike : {};
  const snapshot = sanitizeSnapshot(safe.snapshot);
  const payload = {
    schemaVersion: 2,
    savedAt: new Date().toISOString(),
    dance: {
      id: String(safe.id || '').trim().slice(0, 160),
      title: String(safe.title || 'Untitled Dance').trim().slice(0, 200),
      choreographer: String(safe.choreographer || 'Uncredited').trim().slice(0, 200),
      country: String(safe.country || '').trim().slice(0, 120),
      level: String(safe.level || 'Unlabelled').trim().slice(0, 60),
      counts: String(safe.counts || '-').trim().slice(0, 40),
      walls: String(safe.walls || '-').trim().slice(0, 40),
      music: String(safe.music || '').trim().slice(0, 240),
      sections: Number.isFinite(Number(safe.sections)) ? Number(safe.sections) : 0,
      steps: Number.isFinite(Number(safe.steps)) ? Number(safe.steps) : 0,
      ownerKey: String(safe.ownerKey || '').trim(),
      ownerEmail: String(safe.ownerEmail || '').trim(),
      ownerName: String(safe.ownerName || '').trim(),
      ownerPicture: String(safe.ownerPicture || '').trim(),
      updatedAt: String(safe.updatedAt || new Date().toISOString()).trim()
    },
    previewSections: sanitizePreviewSections(safe.previewSections),
    snapshot
  };
  return JSON.stringify(payload);
}

function sanitizeCloudEntry(entry, ownerProfile = null, ownerKey = "") {
  const safe = entry && typeof entry === "object" ? entry : {};
  const snapshot = sanitizeSnapshot(safe.snapshot);
  const base = {
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
    ownerKey: String(ownerKey || safe.ownerKey || "").trim(),
    ownerEmail: String(ownerProfile?.email || safe.ownerEmail || "").trim(),
    ownerName: String(ownerProfile?.name || safe.ownerName || "").trim(),
    ownerPicture: String(ownerProfile?.picture || safe.ownerPicture || "").trim(),
    snapshot
  };
  const previewSections = sanitizePreviewSections(safe.previewSections).length
    ? sanitizePreviewSections(safe.previewSections)
    : buildPreviewSections({ snapshot });
  return {
    ...base,
    previewSections,
    jsonPayload: String(safe.jsonPayload || '').trim() || buildStoredJsonPayload({ ...base, previewSections })
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
    snapshot: sanitizeSnapshot(entry?.snapshot),
    previewSections: sanitizePreviewSections(entry?.previewSections).length ? sanitizePreviewSections(entry?.previewSections) : buildPreviewSections(entry),
    jsonPayload: String(entry?.jsonPayload || '').trim() || buildStoredJsonPayload(entry)
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
    cloudSaves: Array.isArray(bucket.cloudSaves) ? bucket.cloudSaves : [],
    notifications: Array.isArray(bucket.notifications) ? bucket.notifications : [],
    role: isModeratorBucket(bucket) ? 'moderator' : '',
    membership: getUserMembership(bucket, profile)
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


function findUserKeyByEmail(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return "";
  return Object.keys(db.users || {}).find((key) => normalizeEmail(db.users?.[key]?.profile?.email) === wanted) || "";
}

function pushNotification(db, target, payload) {
  const userKey = String(target?.userKey || findUserKeyByEmail(db, target?.email) || "").trim();
  if (!userKey) return null;
  const bucket = db.users[userKey] && typeof db.users[userKey] === "object" ? db.users[userKey] : null;
  if (!bucket) return null;
  if (!Array.isArray(bucket.notifications)) bucket.notifications = [];
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: String(payload?.kind || "Notice").trim() || "Notice",
    title: String(payload?.title || "Update").trim() || "Update",
    message: String(payload?.message || "").trim(),
    createdAt: new Date().toISOString(),
    readAt: null
  };
  bucket.notifications.unshift(item);
  bucket.notifications = bucket.notifications.slice(0, 100);
  return item;
}

function sanitizeRequestType(value) {
  const type = String(value || "feature").trim().toLowerCase();
  return ["feature", "site"].includes(type) ? type : "feature";
}

function upsertSubmission(db, payload) {
  const entry = payload && typeof payload === "object" ? payload : {};
  const item = {
    id: String(entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).trim(),
    registryId: String(entry.registryId || "").trim(),
    ownerKey: String(entry.ownerKey || "").trim(),
    ownerEmail: String(entry.ownerEmail || "").trim(),
    ownerName: String(entry.ownerName || entry.ownerEmail || "").trim(),
    ownerPicture: String(entry.ownerPicture || "").trim(),
    priority: !!entry.priority,
    title: String(entry.title || "Untitled Dance").trim(),
    choreographer: String(entry.choreographer || "Uncredited").trim(),
    requestType: sanitizeRequestType(entry.requestType),
    status: String(entry.status || "pending").trim(),
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    snapshot: sanitizeSnapshot(entry.snapshot),
    previewSections: sanitizePreviewSections(entry.previewSections),
    jsonPayload: String(entry.jsonPayload || '').trim(),
    moderatorApproved: !!entry.moderatorApproved,
    moderatorApprovedAt: entry.moderatorApprovedAt || null,
    moderatorApprovedBy: entry.moderatorApprovedBy && typeof entry.moderatorApprovedBy === 'object' ? {
      email: String(entry.moderatorApprovedBy.email || '').trim(),
      name: String(entry.moderatorApprovedBy.name || '').trim()
    } : null,
    moderatorReviewStatus: String(entry.moderatorReviewStatus || '').trim(),
    moderatorNote: String(entry.moderatorNote || '').trim().slice(0, 800)
  };
  if (!item.jsonPayload) item.jsonPayload = buildStoredJsonPayload(item);
  const list = Array.isArray(db.submissions) ? db.submissions : [];
  const index = list.findIndex(row => row && row.registryId === item.registryId && row.requestType === item.requestType && row.status === "pending");
  if (index >= 0) list[index] = { ...list[index], ...item, id: list[index].id || item.id, updatedAt: new Date().toISOString() };
  else list.unshift(item);
  db.submissions = list.sort((a,b)=> new Date(b.updatedAt||0)-new Date(a.updatedAt||0)).slice(0, 2000);
  return db.submissions.find(row => row && row.id === item.id) || item;
}

function markMatchingSubmissions(db, registryId, nextStatus) {
  const items = Array.isArray(db.submissions) ? db.submissions : [];
  const touched = [];
  items.forEach((item) => {
    if (String(item?.registryId || "") === String(registryId || "") && String(item?.status || "") === "pending") {
      item.status = nextStatus;
      item.updatedAt = new Date().toISOString();
      touched.push(item);
    }
  });
  return touched;
}

function buildFeatureSummary(source, badgeLabel) {
  return `${source?.title || 'Your dance'} was featured with ${badgeLabel}.`;
}


const SITE_HELP_CONTEXT = `You are the Step By Stepper site helper. Keep answers short, practical, and human. Only answer about using this site.
Tabs and actions available: Build, Sheet, What's New, My Saved Dances, Featured Choreo, Sign In, and Admin for anthonytau4@gmail.com only.
Important behaviours: users sign in with Google, Save Changes pushes the current dance to cloud save, Send to host for featuring creates a feature request, Upload to site creates a site-upload request, Featured Choreo shows public featured dances, removing a feature removes it from Featured Choreo, and signed-in users can get notifications when admin approves or rejects requests.
If someone asks where to go, tell them the exact tab or button to use.
Do not open with generic greetings like "Hi there! What can I help you with today on Step By Stepper?" and do not tell people to ask about any tab or feature. Just answer the actual question.`;

function fallbackSiteHelp(prompt, context = {}) {
  const q = String(prompt || '').toLowerCase();
  if (q.includes('save')) return 'Use the Save Changes button at the top. Sign in first so the dance can save into your Google-linked cloud save.';
  if (q.includes('feature') || q.includes('featured')) return context.isAdmin ? 'Open Admin, find the dance, then press Bronze, Silver, or Gold. Remove feature there if you want it gone from Featured Choreo.' : 'Use Send to host for featuring after signing in. Admin reviews it from the Admin tab.';
  if (q.includes('upload')) return 'Sign in, then use Upload to site. That sends the current dance into the admin review queue.';
  if (q.includes('admin')) return 'The Admin tab only appears for anthonytau4@gmail.com after Google sign-in.';
  if (q.includes('sign in') || q.includes('google')) return 'Open the Sign In tab and press Sign in with Google.';
  if (q.includes('saved')) return 'Use My Saved Dances for your saved items, and Save Changes at the top to push the current one to cloud save.';
  return 'Use Build to make or edit a dance, Save Changes at the top to keep it, Sign In for Google saving, My Saved Dances for your saved work, and Featured Choreo to browse featured dances.';
}

function sanitizeHelperText(text, prompt, context = {}) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (/^hi there!? what can i help you with today on step by stepper\??/i.test(clean)) return '';
  if (/feel free to ask about any tab or feature\.?$/i.test(clean)) return '';
  if (/^need help using the site\?/i.test(clean)) return '';
  if ((/what can i help you with/i.test(clean) || /any tab or feature/i.test(clean)) && /step by stepper/i.test(clean)) return '';
  return clean;
}


app.get("/api/health", async (_req, res) => {
  const db = await readDb();
  res.json({
    ok: true,
    service: "step-by-stepper-backend",
    googleEnabled: !!googleClientId,
    openaiEnabled: !!openaiClient,
    geminiEnabled: !!geminiApiKey,
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
    geminiEnabled: !!geminiApiKey,
    cloudStorage: "json-file",
    authMode: googleClientId ? "google-id-token" : "none",
    adminEmail,
    onlineWindowMs,
    stripeEnabled: !!stripeSecretKey,
    stripePublishableKey
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
    const bucket = db.users[userKeyFromClaims(claims)] || null;
    res.json({ ok: true, profile, isAdmin: isAdminProfile(profile), isModerator: isModeratorBucket(bucket), role: isAdminProfile(profile) ? 'admin' : (isModeratorBucket(bucket) ? 'moderator' : 'member'), onlineCount: getOnlineUsers(db).length, membership: bucket?.membership || getUserMembership(null, profile) });
  } catch (error) {
    res.status(error.status || 401).json({ ok: false, error: error?.message || "Google sign-in failed." });
  }
});

app.get("/api/auth/me", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  touchUser(db, req.stepperUser, userKeyFromClaims(req.stepperClaims));
  await writeDb(db);
  const bucket = db.users[userKeyFromClaims(req.stepperClaims)] || null;
  res.json({ ok: true, profile: req.stepperUser, isAdmin: isAdminProfile(req.stepperUser), isModerator: isModeratorBucket(bucket), role: isAdminProfile(req.stepperUser) ? 'admin' : (isModeratorBucket(bucket) ? 'moderator' : 'member'), onlineCount: getOnlineUsers(db).length, membership: bucket?.membership || getUserMembership(null, req.stepperUser) });
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
  const bucket = db.users[userKeyFromClaims(req.stepperClaims)] || null;
  res.json({ ok: true, onlineCount: onlineUsers.length, members: onlineUsers, isAdmin: isAdminProfile(req.stepperUser), isModerator: isModeratorBucket(bucket), role: isAdminProfile(req.stepperUser) ? 'admin' : (isModeratorBucket(bucket) ? 'moderator' : 'member') });
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

app.post("/api/submissions/request", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const registryId = String(req.body?.registryId || "").trim();
  const source = (Array.isArray(db.danceRegistry) ? db.danceRegistry : []).find(item => item && item.registryId === registryId);
  if (!source) {
    return res.status(404).json({ ok: false, error: "Dance not found in registry." });
  }
  const requestType = sanitizeRequestType(req.body?.requestType);
  const submission = upsertSubmission(db, {
    registryId,
    ownerKey: key,
    ownerEmail: req.stepperUser.email,
    ownerName: req.stepperUser.name,
    ownerPicture: req.stepperUser.picture,
    title: source.title,
    choreographer: source.choreographer,
    requestType,
    status: 'pending',
    priority: isPremiumUser(db.users[key], req.stepperUser),
    snapshot: source.snapshot,
    previewSections: source.previewSections,
    jsonPayload: source.jsonPayload
  });
  await writeDb(db);
  res.json({ ok: true, submission });
});

app.get("/api/notifications", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  await writeDb(db);
  const items = Array.isArray(db.users[key]?.notifications) ? db.users[key].notifications.slice().sort((a,b)=> new Date(b.createdAt||0)-new Date(a.createdAt||0)) : [];
  res.json({ ok: true, items, unreadCount: items.filter(item => !item.readAt).length });
});

app.post("/api/notifications/mark-read", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(value => String(value || "").trim()).filter(Boolean) : [];
  const list = Array.isArray(db.users[key]?.notifications) ? db.users[key].notifications : [];
  list.forEach(item => {
    if (!item || item.readAt) return;
    if (!ids.length || ids.includes(String(item.id || ""))) item.readAt = new Date().toISOString();
  });
  await writeDb(db);
  res.json({ ok: true, ids });
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
      isFeatured: featuredIds.has(String(item?.registryId || "")),
      previewSections: sanitizePreviewSections(item?.previewSections).length ? sanitizePreviewSections(item?.previewSections) : buildPreviewSections(item),
      jsonPayload: String(item?.jsonPayload || '').trim() || buildStoredJsonPayload(item)
    }));
  res.json({ ok: true, items, featuredIds: Array.from(featuredIds), adminEmail, onlineCount: getOnlineUsers(db).length });
});

app.get("/api/admin/submissions", requireAdmin, async (_req, res) => {
  const db = await readDb();
  const registry = Array.isArray(db.danceRegistry) ? db.danceRegistry : [];
  const featuredIds = new Set((db.featuredChoreo || []).map(item => String(item?.registryId || item?.id || "")).filter(Boolean));
  const items = (Array.isArray(db.submissions) ? db.submissions : [])
    .filter(item => String(item?.status || 'pending') === 'pending')
    .map(item => {
      const source = registry.find(row => row && row.registryId === String(item?.registryId || '').trim()) || null;
      return {
        ...item,
        title: source?.title || item?.title,
        choreographer: source?.choreographer || item?.choreographer || '',
        country: source?.country || item?.country || '',
        level: source?.level || item?.level || 'Unlabelled',
        counts: source?.counts || item?.counts || '-',
        walls: source?.walls || item?.walls || '-',
        sections: source?.sections || item?.sections || 0,
        steps: source?.steps || item?.steps || 0,
        updatedAt: source?.updatedAt || item?.updatedAt,
        snapshot: item?.snapshot || source?.snapshot || null,
        previewSections: sanitizePreviewSections(item?.previewSections).length ? sanitizePreviewSections(item?.previewSections) : (source ? buildPreviewSections(source) : []),
        jsonPayload: String(item?.jsonPayload || source?.jsonPayload || '').trim() || buildStoredJsonPayload(source || item || {}),
        isFeatured: featuredIds.has(String(source?.registryId || item?.registryId || '')),
        source
      };
    })
    .sort((a, b) => {
      const ap = a?.priority ? 1 : 0;
      const bp = b?.priority ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });
  res.json({ ok: true, items });
});

app.post("/api/admin/submissions/:id/reject", requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || "").trim();
  const item = (Array.isArray(db.submissions) ? db.submissions : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok: false, error: 'Submission not found.' });
  item.status = 'rejected';
  item.updatedAt = new Date().toISOString();
  pushNotification(db, { userKey: item.ownerKey, email: item.ownerEmail }, {
    kind: 'Request update',
    title: 'Feature request declined',
    message: `${item.title || 'Your dance'} was not approved this time.`
  });
  await writeDb(db);
  res.json({ ok: true, item });
});

app.post("/api/admin/submissions/:id/approve-site", requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || "").trim();
  const item = (Array.isArray(db.submissions) ? db.submissions : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok: false, error: 'Submission not found.' });
  item.status = 'approved';
  item.updatedAt = new Date().toISOString();
  pushNotification(db, { userKey: item.ownerKey, email: item.ownerEmail }, {
    kind: 'Site upload',
    title: 'Upload approved',
    message: `${item.title || 'Your dance'} was approved for the site.`
  });
  await writeDb(db);
  res.json({ ok: true, item });
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

  const touched = markMatchingSubmissions(db, registryId, 'approved');
  pushNotification(db, { userKey: source.ownerKey, email: source.ownerEmail }, {
    kind: 'Featured',
    title: 'Your dance was featured',
    message: buildFeatureSummary(source, badgeLabel)
  });
  await writeDb(db);
  res.json({ ok: true, item: featuredItem, items: db.featuredChoreo, resolvedSubmissions: touched.map(item => item.id) });
});

app.delete("/api/admin/feature/:registryId", requireAdmin, async (req, res) => {
  const registryId = String(req.params.registryId || "").trim();
  const db = await readDb();
  db.featuredChoreo = (Array.isArray(db.featuredChoreo) ? db.featuredChoreo : []).filter(item => String(item?.registryId || item?.id || "") !== registryId);
  await writeDb(db);
  res.json({ ok: true, registryId });
});

app.post('/api/moderator/apply', requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = touchUser(db, req.stepperUser, key);
  if (isAdminProfile(req.stepperUser) || isModeratorBucket(bucket)) {
    await writeDb(db);
    return res.json({ ok: true, alreadyApproved: true, role: isAdminProfile(req.stepperUser) ? 'admin' : 'moderator' });
  }
  const list = Array.isArray(db.moderatorApplications) ? db.moderatorApplications : [];
  const existing = list.find(item => item && item.ownerKey === key && String(item.status || 'pending') === 'pending');
  if (existing) {
    await writeDb(db);
    return res.json({ ok: true, application: existing, alreadyPending: true });
  }
  const application = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ownerKey: key,
    ownerEmail: req.stepperUser.email,
    ownerName: req.stepperUser.name,
    ownerPicture: req.stepperUser.picture,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  list.unshift(application);
  db.moderatorApplications = list.slice(0, 500);
  await writeDb(db);
  res.json({ ok: true, application });
});

app.get('/api/admin/moderator-applications', requireAdmin, async (_req, res) => {
  const db = await readDb();
  const items = (Array.isArray(db.moderatorApplications) ? db.moderatorApplications : [])
    .filter(item => String(item?.status || 'pending') === 'pending')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  res.json({ ok: true, items });
});

app.post('/api/admin/moderator-applications/:id/approve', requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || '').trim();
  const item = (Array.isArray(db.moderatorApplications) ? db.moderatorApplications : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok: false, error: 'Moderator application not found.' });
  item.status = 'approved';
  item.updatedAt = new Date().toISOString();
  const bucket = db.users[item.ownerKey] && typeof db.users[item.ownerKey] === 'object' ? db.users[item.ownerKey] : { profile: { email: item.ownerEmail, name: item.ownerName, picture: item.ownerPicture } };
  bucket.role = 'moderator';
  bucket.membership = getUserMembership({ ...bucket, role: 'moderator' }, bucket.profile);
  db.users[item.ownerKey] = { ...bucket, membership: getUserMembership({ ...bucket, role: 'moderator' }, bucket.profile), role: 'moderator' };
  pushNotification(db, { userKey: item.ownerKey, email: item.ownerEmail }, {
    kind: 'Moderator',
    title: 'Moderator request approved',
    message: 'You now have moderator access and the premium helper perks, without the Admin tab.'
  });
  await writeDb(db);
  res.json({ ok: true, item, user: db.users[item.ownerKey] });
});

app.post('/api/admin/moderator-applications/:id/decline', requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || '').trim();
  const item = (Array.isArray(db.moderatorApplications) ? db.moderatorApplications : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok: false, error: 'Moderator application not found.' });
  item.status = 'declined';
  item.updatedAt = new Date().toISOString();
  pushNotification(db, { userKey: item.ownerKey, email: item.ownerEmail }, {
    kind: 'Moderator',
    title: 'Moderator request declined',
    message: 'The admin declined your moderator request this time.'
  });
  await writeDb(db);
  res.json({ ok: true, item });
});

app.get('/api/moderator/submissions', requireModerator, async (_req, res) => {
  const db = await readDb();
  const registry = Array.isArray(db.danceRegistry) ? db.danceRegistry : [];
  const items = (Array.isArray(db.submissions) ? db.submissions : [])
    .filter(item => String(item?.status || 'pending') === 'pending')
    .map(item => {
      const source = registry.find(row => row && row.registryId === String(item?.registryId || '').trim()) || null;
      return {
        ...item,
        title: source?.title || item?.title,
        choreographer: source?.choreographer || item?.choreographer || '',
        country: source?.country || item?.country || '',
        level: source?.level || item?.level || 'Unlabelled',
        counts: source?.counts || item?.counts || '-',
        walls: source?.walls || item?.walls || '-',
        sections: source?.sections || item?.sections || 0,
        steps: source?.steps || item?.steps || 0,
        updatedAt: source?.updatedAt || item?.updatedAt,
        snapshot: item?.snapshot || source?.snapshot || null,
        previewSections: sanitizePreviewSections(item?.previewSections).length ? sanitizePreviewSections(item?.previewSections) : (source ? buildPreviewSections(source) : []),
        jsonPayload: String(item?.jsonPayload || source?.jsonPayload || '').trim() || buildStoredJsonPayload(source || item || {}),
        source
      };
    })
    .sort((a, b) => {
      const ap = a?.priority ? 1 : 0;
      const bp = b?.priority ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });
  res.json({ ok: true, items });
});

app.post('/api/moderator/submissions/:id/approve', requireModerator, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || '').trim();
  const item = (Array.isArray(db.submissions) ? db.submissions : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok: false, error: 'Submission not found.' });
  const decision = String(req.body?.decision || 'approve').trim().toLowerCase() === 'disapprove' ? 'disapprove' : 'approve';
  const note = String(req.body?.note || '').trim().slice(0, 800);
  item.moderatorApproved = decision === 'approve';
  item.moderatorReviewStatus = decision === 'approve' ? 'approved' : 'disapproved';
  item.moderatorApprovedAt = new Date().toISOString();
  item.moderatorApprovedBy = {
    email: String(req.stepperUser?.email || '').trim(),
    name: String(req.stepperUser?.name || req.stepperUser?.email || '').trim()
  };
  item.moderatorNote = note;
  item.updatedAt = new Date().toISOString();
  await writeDb(db);
  res.json({ ok: true, item });
});

app.get('/api/subscription/status', requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = touchUser(db, req.stepperUser, key);
  await writeDb(db);
  const membership = getUserMembership(bucket, req.stepperUser);
  res.json({ ok: true, ...membership, role: isAdminProfile(req.stepperUser) ? 'admin' : (isModeratorBucket(bucket) ? 'moderator' : 'member'), isModerator: isModeratorBucket(bucket), stripeEnabled: !!stripeSecretKey, stripePublishableKey });
});

app.post('/api/subscription/create-checkout-session', requireGoogleUser, async (req, res) => {
  try {
    const plan = String(req.body?.plan || 'monthly').trim().toLowerCase() === 'yearly' ? 'yearly' : 'monthly';
    const db = await readDb();
    const key = userKeyFromClaims(req.stepperClaims);
    const bucket = touchUser(db, req.stepperUser, key);
    if (isPremiumUser(bucket, req.stepperUser)) {
      return res.json({ ok: true, alreadyPremium: true, plan: getUserMembership(bucket, req.stepperUser).plan });
    }
    const requestOrigin = safeOrigin(req.headers.origin);
    const requestedOrigin = safeOrigin(req.body?.returnOrigin);
    const fallbackOrigin = safeOrigin(req.body?.backendBase) || (Array.isArray(allowedOrigins) && allowedOrigins[0]) || '';
    const origin = requestOrigin || requestedOrigin || fallbackOrigin;
    if (!origin) return res.status(400).json({ ok:false, error:'Missing return origin.' });
    const successUrl = `${origin}${String(req.body?.returnPath || '/')}${String(req.body?.returnPath || '/').includes('?') ? '&' : '?'}checkout_session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}${String(req.body?.returnPath || '/')}`;
    const amount = plan === 'yearly' ? yearlyAmountNzd : monthlyAmountNzd;
    const interval = plan === 'yearly' ? 'year' : 'month';
    const params = {
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      'line_items[0][price_data][currency]': 'nzd',
      'line_items[0][price_data][unit_amount]': String(amount),
      'line_items[0][price_data][recurring][interval]': interval,
      'line_items[0][price_data][product_data][name]': `Step By Stepper Premium (${plan})`,
      'line_items[0][quantity]': '1',
      customer_email: req.stepperUser.email,
      'metadata[userKey]': key,
      'metadata[email]': req.stepperUser.email,
      'metadata[plan]': plan
    };
    const session = await stripeRequest('/v1/checkout/sessions', params);
    bucket.membership = { ...getUserMembership(bucket, req.stepperUser), checkoutSessionId: String(session.id || '').trim(), plan, source: 'checkout-pending', updatedAt: new Date().toISOString() };
    await writeDb(db);
    res.json({ ok: true, id: session.id, url: session.url, plan, publishableKey: stripePublishableKey });
  } catch (error) {
    res.status(error.status || 500).json({ ok:false, error: error.message || 'Could not create checkout session.' });
  }
});

app.post('/api/subscription/confirm', requireGoogleUser, async (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId || '').trim();
    if (!sessionId) return res.status(400).json({ ok:false, error:'Missing sessionId.' });
    const session = await stripeRequest(`/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, null, 'GET');
    const db = await readDb();
    const key = userKeyFromClaims(req.stepperClaims);
    const bucket = touchUser(db, req.stepperUser, key);
    const plan = String(session?.metadata?.plan || req.body?.plan || 'monthly').trim().toLowerCase() === 'yearly' ? 'yearly' : 'monthly';
    const paid = String(session?.payment_status || '').toLowerCase() === 'paid' || String(session?.status || '').toLowerCase() === 'complete';
    if (!paid) return res.status(409).json({ ok:false, error:'Checkout session is not paid yet.' });
    bucket.membership = {
      isPremium: true,
      status: 'active',
      plan,
      source: 'stripe',
      updatedAt: new Date().toISOString(),
      stripeCustomerId: String(session?.customer || '').trim(),
      stripeSubscriptionId: String(session?.subscription || '').trim(),
      checkoutSessionId: sessionId
    };
    await writeDb(db);
    res.json({ ok:true, ...bucket.membership });
  } catch (error) {
    res.status(error.status || 500).json({ ok:false, error: error.message || 'Could not confirm subscription.' });
  }
});

app.post('/api/chatbot/help', requireGoogleUser, async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();
  const context = req.body?.context && typeof req.body.context === 'object' ? req.body.context : {};
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  const preferredModel = String(req.body?.preferredModel || 'gemini').trim().toLowerCase();
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = touchUser(db, req.stepperUser, key);
  await writeDb(db);
  if (!isPremiumUser(bucket, req.stepperUser)) {
    return res.status(402).json({ ok:false, error:'Premium subscription required for the AI site helper.' });
  }
  if (!prompt) {
    return res.status(400).json({ ok:false, error:'Missing prompt.' });
  }
  const trimmedHistory = history.slice(-8).map((item) => ({
    role: String(item?.role || 'user').trim().toLowerCase() === 'assistant' ? 'assistant' : 'user',
    text: String(item?.text || '').trim().slice(0, 2000)
  })).filter(item => item.text);
  try {
    const system = `${SITE_HELP_CONTEXT}
Reply like a natural AI helper for the Step By Stepper site. Be specific, warm, and practical. Use the conversation history when it matters, and do not keep repeating the exact same canned answer.`;
    const userPrompt = `Current tab: ${context.currentTab || 'unknown'}
Signed in: ${context.signedIn ? 'yes' : 'no'}
Admin: ${context.isAdmin ? 'yes' : 'no'}
Moderator: ${context.isModerator ? 'yes' : 'no'}
Premium: ${context.isPremium ? 'yes' : 'no'}
Online count: ${context.onlineCount || 0}
Current dance title: ${context.currentDanceTitle || 'none'}
Conversation so far:
${trimmedHistory.map(item => `${item.role}: ${item.text}`).join('\n') || '(none)'}
Newest user question: ${prompt}`;
    const ai = await runSiteHelperAI({ system, prompt: userPrompt, history: trimmedHistory, preferredModel });
    const text = sanitizeHelperText(String(ai.text || '').trim(), prompt, context);
    if (!text) {
      return res.status(502).json({ ok:false, error:'AI helper returned a blank or generic response.', provider: ai.provider });
    }
    res.json({ ok:true, text, mode: ai.provider });
  } catch (error) {
    res.status(error.status || 502).json({ ok:false, error: error.message || 'AI helper request failed.', provider: preferredModel });
  }
});


app.post("/api/openai/respond", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    const system = String(req.body?.system || "You are Step-By-Stepper assistant logic.").trim();
    const preferredModel = String(req.body?.preferredModel || '').trim().toLowerCase();
    if (!prompt) {
      return res.status(400).json({ ok: false, error: "Missing prompt." });
    }
    const history = Array.isArray(req.body?.history) ? req.body.history : [];
    const ai = await runSiteHelperAI({ system, prompt, history, preferredModel });
    const text = sanitizeHelperText(String(ai.text || '').trim(), prompt, {});
    if (!text) {
      return res.status(502).json({ ok:false, error:'AI returned a blank or generic response.', provider: ai.provider });
    }
    res.json({ ok: true, text, provider: ai.provider });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
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
