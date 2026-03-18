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

console.log('[Stepper] RENDER_DISK_MOUNT_PATH =', process.env.RENDER_DISK_MOUNT_PATH || '(not set)');
console.log('[Stepper] DATA_DIR =', process.env.DATA_DIR || '(not set)');
console.log('[Stepper] resolved dataDir =', dataDir);
console.log('[Stepper] resolved dbPath =', dbPath);

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

function normalizeUsername(value) {
  return String(value || '').trim();
}

function isValidUsername(value) {
  return /^(?=.*\d)[A-Za-z0-9]{6,}$/.test(String(value || '').trim());
}

function findUserKeyByUsername(db, username) {
  const wanted = normalizeUsername(username).toLowerCase();
  if (!wanted) return '';
  return Object.keys(db.users || {}).find((key) => String(db.users?.[key]?.username || '').trim().toLowerCase() === wanted) || '';
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

function clearExpiredSuspension(bucket) {
  if (!bucket || typeof bucket !== 'object') return null;
  const suspension = bucket.suspension && typeof bucket.suspension === 'object' ? bucket.suspension : null;
  if (!suspension) return null;
  const untilMs = Date.parse(suspension.untilAt || 0);
  if (Number.isFinite(untilMs) && untilMs > Date.now()) return suspension;
  bucket.suspension = null;
  return null;
}

function getActiveSuspension(bucket, profile = null) {
  if (isAdminProfile(profile || bucket?.profile)) return null;
  return clearExpiredSuspension(bucket);
}

function suspensionPayload(bucket) {
  const suspension = bucket && bucket.suspension && typeof bucket.suspension === 'object' ? bucket.suspension : null;
  if (!suspension) return null;
  return {
    reason: String(suspension.reason || '').trim(),
    untilAt: String(suspension.untilAt || '').trim() || null,
    startedAt: String(suspension.startedAt || '').trim() || null,
    durationLabel: String(suspension.durationLabel || '').trim() || null,
    byEmail: String(suspension.byEmail || '').trim() || null,
    active: true
  };
}

function assertNotSuspended(bucket, profile = null) {
  const suspension = getActiveSuspension(bucket, profile);
  if (!suspension) return;
  const error = new Error(`You have been barred for ${String(suspension.durationLabel || 'a while')} because of ${String(suspension.reason || 'an admin decision')}`);
  error.status = 403;
  error.code = 'SUSPENDED';
  error.suspension = suspensionPayload({ suspension });
  throw error;
}

function getRoleForBucket(bucket, profile = null) {
  if (isAdminProfile(profile || bucket?.profile)) return 'admin';
  return isModeratorBucket(bucket) ? 'moderator' : 'member';
}

function createSecurityAlert(db, payload = {}) {
  if (!Array.isArray(db.securityAlerts)) db.securityAlerts = [];
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'open',
    email: String(payload.email || '').trim(),
    name: String(payload.name || payload.email || '').trim(),
    userKey: String(payload.userKey || '').trim(),
    reason: String(payload.reason || 'Security warning').trim(),
    detail: String(payload.detail || '').trim().slice(0, 1200),
    createdAt: new Date().toISOString(),
    strikeCount: Math.max(0, Number(payload.strikeCount || 0)),
    trigger: String(payload.trigger || '').trim().slice(0, 120),
    notes: []
  };
  db.securityAlerts.unshift(item);
  db.securityAlerts = db.securityAlerts.slice(0, 500);
  return item;
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
    moderatorApplications: [],
    glossaryRequests: [],
    approvedGlossarySteps: [],
    siteMemory: [],
    securityAlerts: [],
    staffChat: [],
    pendingModeratorInvites: []
  };
}

async function ensureDb() {
  if (renderDiskRoot) {
    const mountRoot = path.resolve(renderDiskRoot);
    try {
      await fs.access(mountRoot);
    } catch (error) {
      console.error('[Stepper] Persistent disk mount root is not accessible:', mountRoot, error?.code || error);
      throw error;
    }

    try {
      await fs.access(dataDir);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      await fs.mkdir(dataDir);
      console.log('[Stepper] Created app data directory on persistent disk:', dataDir);
    }
  } else {
    await fs.mkdir(dataDir, { recursive: true });
  }
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
    if (!Array.isArray(parsed.glossaryRequests)) parsed.glossaryRequests = [];
    if (!Array.isArray(parsed.approvedGlossarySteps)) parsed.approvedGlossarySteps = [];
    if (!Array.isArray(parsed.siteMemory)) parsed.siteMemory = [];
    if (!Array.isArray(parsed.securityAlerts)) parsed.securityAlerts = [];
    if (!Array.isArray(parsed.staffChat)) parsed.staffChat = [];
    if (!Array.isArray(parsed.pendingModeratorInvites)) parsed.pendingModeratorInvites = [];
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

function isSignupComplete(bucket) {
  return !!(bucket && bucket.signupCompleted && normalizeUsername(bucket.username));
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
    const db = await readDb();
    const key = userKeyFromClaims(claims);
    const bucket = touchUser(db, req.stepperUser, key);
    assertNotSuspended(bucket, req.stepperUser);
    await writeDb(db);
    req.stepperUserBucket = bucket;
    next();
  } catch (error) {
    res.status(error.status || 401).json({
      ok: false,
      error: error?.message || "Google authentication failed.",
      code: error?.code || '',
      suspension: error?.suspension || null
    });
  }
}


async function requireCompletedGoogleUser(req, res, next) {
  requireCompletedGoogleUser(req, res, async () => {
    if (!isSignupComplete(req.stepperUserBucket)) {
      res.status(403).json({ ok: false, error: 'Finish signing up with a locked username before using the site.', code: 'SIGNUP_REQUIRED', signupCompleted: false });
      return;
    }
    next();
  });
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
    assertNotSuspended(bucket, req.stepperUser);
    await writeDb(db);
    if (isAdminProfile(req.stepperUser) || isModeratorBucket(bucket)) {
      req.stepperUserBucket = bucket;
      next();
      return;
    }
    res.status(403).json({ ok: false, error: 'Moderator access only.' });
  } catch (error) {
    res.status(error.status || 401).json({ ok: false, error: error?.message || 'Google authentication failed.', code: error?.code || '', suspension: error?.suspension || null });
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
  const email = normalizeEmail(profile?.email);
  const existingKey = email ? findUserKeyByEmail(db, email) : "";
  const existingBucket = existingKey && db.users[existingKey] && typeof db.users[existingKey] === "object" ? db.users[existingKey] : null;
  const ownBucket = db.users[key] && typeof db.users[key] === "object" ? db.users[key] : null;
  const bucket = ownBucket || existingBucket || {};
  const createdAt = String(bucket.createdAt || "").trim() || new Date().toISOString();
  const username = normalizeUsername(bucket.username || '');
  const signupCompleted = !!(bucket.signupCompleted && username);
  const googleName = String(profile?.name || bucket?.profile?.googleName || bucket?.profile?.name || profile?.email || "").trim();
  const merged = {
    ...bucket,
    username,
    signupCompleted,
    signupCompletedAt: signupCompleted ? (String(bucket.signupCompletedAt || '').trim() || new Date().toISOString()) : null,
    profile: {
      sub: String(profile?.sub || bucket?.profile?.sub || "").trim(),
      email: String(profile?.email || bucket?.profile?.email || "").trim(),
      name: String(username || googleName || profile?.email || "").trim(),
      googleName,
      picture: String(profile?.picture || bucket?.profile?.picture || "").trim()
    },
    createdAt,
    updatedAt: new Date().toISOString(),
    authProvider: 'google',
    lastSeenAt: new Date().toISOString(),
    cloudSaves: Array.isArray(bucket.cloudSaves) ? bucket.cloudSaves : [],
    notifications: Array.isArray(bucket.notifications) ? bucket.notifications : [],
    role: isModeratorBucket(bucket) ? 'moderator' : '',
    membership: getUserMembership(bucket, profile),
    suspension: bucket.suspension && typeof bucket.suspension === 'object' ? bucket.suspension : null,
    securityStrikes: Math.max(0, Number(bucket.securityStrikes || 0))
  };
  db.users[key] = merged;
  if (existingKey && existingKey !== key) delete db.users[existingKey];
  applyPendingModeratorInvite(db, profile, db.users[key]);
  db.users[key].membership = getUserMembership(db.users[key], profile);
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

function getPendingModeratorInvite(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return null;
  if (!Array.isArray(db.pendingModeratorInvites)) db.pendingModeratorInvites = [];
  return db.pendingModeratorInvites.find(item => normalizeEmail(item?.email) === wanted) || null;
}

function listPendingModeratorInvites(db) {
  if (!Array.isArray(db.pendingModeratorInvites)) db.pendingModeratorInvites = [];
  return db.pendingModeratorInvites
    .map(item => ({
      email: String(item?.email || '').trim(),
      createdAt: String(item?.createdAt || '').trim() || null,
      updatedAt: String(item?.updatedAt || '').trim() || null,
      invitedByEmail: String(item?.invitedByEmail || '').trim() || null,
      invitedByName: String(item?.invitedByName || '').trim() || null,
      status: String(item?.status || 'pending-signin').trim() || 'pending-signin'
    }))
    .filter(item => item.email)
    .sort((a,b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
}

function applyPendingModeratorInvite(db, profile, bucket) {
  const email = normalizeEmail(profile?.email || bucket?.profile?.email);
  if (!email) return false;
  const invite = getPendingModeratorInvite(db, email);
  if (!invite) return false;
  bucket.role = 'moderator';
  bucket.membership = getUserMembership({ ...bucket, role: 'moderator' }, bucket.profile || profile);
  bucket.suspension = null;
  db.pendingModeratorInvites = (Array.isArray(db.pendingModeratorInvites) ? db.pendingModeratorInvites : []).filter(item => normalizeEmail(item?.email) !== email);
  pushNotification(db, { email }, {
    kind: 'Moderator',
    title: 'Moderator access granted',
    message: 'Your approved Gmail now has moderator access on sign-in.'
  });
  return true;
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



function createId(prefix = 'id') {
  return `${String(prefix || 'id').trim() || 'id'}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function swapLeftRight(text) {
  return String(text || '').replace(/right/gi, '__TMP_RIGHT__').replace(/left/gi, 'right').replace(/__TMP_RIGHT__/g, 'left');
}

function buildGlossaryTwin(step) {
  const foot = String(step?.foot || '').trim().toLowerCase();
  if (!foot) return null;
  if (!(foot === 'right' || foot === 'left' || foot === 'r' || foot === 'l')) return null;
  const nextFoot = foot.startsWith('r') ? 'Left' : 'Right';
  return {
    name: swapLeftRight(String(step?.name || '')),
    description: swapLeftRight(String(step?.description || '')),
    counts: String(step?.counts || '').trim(),
    foot: nextFoot,
    tags: swapLeftRight(String(step?.tags || ''))
  };
}

function normalizeGlossaryStepPayload(step, owner = {}) {
  return {
    id: createId('gstep'),
    name: String(step?.name || '').trim().slice(0, 120),
    description: String(step?.description || step?.desc || '').trim().slice(0, 1200),
    counts: String(step?.counts || step?.count || '').trim().slice(0, 40) || '1',
    foot: String(step?.foot || 'Either').trim().slice(0, 24) || 'Either',
    tags: String(step?.tags || '').trim().slice(0, 240),
    ownerEmail: String(owner?.email || '').trim(),
    ownerName: String(owner?.name || owner?.email || '').trim(),
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function serializeDanceForAi(dance = {}) {
  const title = String(dance?.title || '').trim() || 'Untitled Dance';
  const choreographer = String(dance?.choreographer || '').trim() || 'Uncredited';
  const meta = `Title: ${title}
Choreographer: ${choreographer}
Level: ${String(dance?.level || '').trim()}
Counts: ${String(dance?.counts || '').trim()}
Walls: ${String(dance?.walls || '').trim()}`;
  const sections = Array.isArray(dance?.snapshot?.data?.sections) ? dance.snapshot.data.sections : [];
  const sectionText = sections.slice(0, 10).map((section, index) => {
    const lines = (Array.isArray(section?.steps) ? section.steps : []).slice(0, 16).map((step) => {
      return [String(step?.count || step?.counts || '').trim(), String(step?.name || '').trim(), String(step?.description || step?.desc || '').trim()].filter(Boolean).join(' - ');
    }).filter(Boolean).join('\n');
    return `Section ${index + 1}: ${String(section?.name || '').trim() || `Section ${index + 1}`}
${lines}`;
  }).join('\n\n');
  return `${meta}

${sectionText}`.trim();
}

function parseJsonFromAiText(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fence ? fence[1].trim() : raw;
  try { return JSON.parse(source); } catch {}
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try { return JSON.parse(source.slice(start, end + 1)); } catch {}
  }
  return null;
}


function buildFallbackCountLines(dance) {
  const sections = Array.isArray(dance?.snapshot?.data?.sections) ? dance.snapshot.data.sections : [];
  const lines = [];
  let sectionCount = 0;
  for (const section of sections) {
    const steps = Array.isArray(section?.steps) ? section.steps : [];
    if (!steps.length) continue;
    sectionCount += 1;
    const total = Math.max(1, steps.length);
    for (let i = 0; i < total; i += 1) {
      const start = Math.floor((i * 8) / total) + 1;
      const end = Math.floor((((i + 1) * 8) - 1) / total) + 1;
      lines.push(start === end ? String(start) : `${start}-${end}`);
    }
  }
  return { countLines: lines, totalCounts: String(Math.max(8, sectionCount * 8 || 8)) };
}

function fallbackDanceTool(mode, dance, prompt) {
  const sections = Array.isArray(dance?.snapshot?.data?.sections) ? dance.snapshot.data.sections : [];
  const stepCount = sections.reduce((sum, section) => sum + (Array.isArray(section?.steps) ? section.steps.length : 0), 0);
  if (mode === 'add') {
    return {
      text: `I could not get a clean AI tool reply, so here is a safe fallback. Add one smoother travelling step near the end of the current worksheet and keep the count simple so the flow stays readable. ${prompt ? `You asked for: ${prompt}` : ''}`.trim(),
      flowScore: null,
      suggestions: [{ name: 'Travelling Brush Step', description: 'Step forward with control, brush the free foot through, then settle into the next travelling action so the phrase breathes more cleanly.', count: '7&8', foot: 'Right', reason: 'Fallback glossary-style add-on while the AI response was messy.' }],
      countLines: [],
      totalCounts: ''
    };
  }
  if (mode === 'counts') {
    const generated = buildFallbackCountLines(dance);
    return {
      text: 'I generated worksheet counts in 8-count blocks and set the dance total for you.',
      flowScore: null,
      suggestions: [],
      countLines: generated.countLines,
      totalCounts: generated.totalCounts
    };
  }
  const score = Math.max(5, Math.min(9, stepCount ? Math.round(Math.min(10, 5 + stepCount / 12)) : 5));
  return {
    text: 'Fallback judging result: the worksheet structure is readable, but tighten any overcrowded phrases and keep repeated travelling patterns balanced so the dance feels smoother to teach and dance.',
    flowScore: score,
    suggestions: [],
    countLines: [],
    totalCounts: ''
  };
}

const SITE_HELP_CONTEXT = `You are the Step By Stepper site helper. Keep answers short, practical, and human. Only answer about using this site.
Tabs and actions available: Build, Sheet, What's New, My Saved Dances, Featured Choreo, Sign In, and Admin for anthonytau4@gmail.com only.
Important behaviours: users sign in with Google, Save Changes pushes the current dance to cloud save, Send to host for featuring creates a feature request, Upload to site creates a site-upload request, Featured Choreo shows public featured dances, removing a feature removes it from Featured Choreo, signed-in users can get notifications when admin approves or rejects requests, and Admin reviews custom glossary step requests under Requested dance steps.
The site can also remember admin-approved helper memory notes, and those learned notes should be treated as true for future helper replies.
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
    danceCount: Array.isArray(db.danceRegistry) ? db.danceRegistry.length : 0,
    glossaryCount: Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps.length : 0
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
    stripePublishableKey,
    glossaryCount: 0
  });
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const credential = String(req.body?.credential || "").trim();
    const claims = await verifyGoogleToken(credential);
    const profile = pickProfile(claims);
    const db = await readDb();
    const userKey = userKeyFromClaims(claims);
    const hadUserBefore = !!findUserKeyByEmail(db, profile?.email);
    const bucket = touchUser(db, profile, userKey);
    assertNotSuspended(bucket, profile);
    await writeDb(db);
    res.json({ ok: true, profile: bucket?.profile || profile, createdUser: !hadUserBefore, isAdmin: isAdminProfile(profile), isModerator: isModeratorBucket(bucket), role: getRoleForBucket(bucket, profile), username: String(bucket?.username || '').trim(), signupCompleted: isSignupComplete(bucket), needsSignup: !isSignupComplete(bucket), onlineCount: getOnlineUsers(db).length, membership: bucket?.membership || getUserMembership(null, profile), suspension: suspensionPayload(bucket) });
  } catch (error) {
    res.status(error.status || 401).json({ ok: false, error: error?.message || "Google sign-in failed." });
  }
});

app.get("/api/auth/me", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const bucket = touchUser(db, req.stepperUser, userKeyFromClaims(req.stepperClaims));
  assertNotSuspended(bucket, req.stepperUser);
  await writeDb(db);
  res.json({ ok: true, profile: bucket?.profile || req.stepperUser, isAdmin: isAdminProfile(req.stepperUser), isModerator: isModeratorBucket(bucket), role: getRoleForBucket(bucket, req.stepperUser), username: String(bucket?.username || '').trim(), signupCompleted: isSignupComplete(bucket), needsSignup: !isSignupComplete(bucket), onlineCount: getOnlineUsers(db).length, membership: bucket?.membership || getUserMembership(null, req.stepperUser), suspension: suspensionPayload(bucket) });
});


app.post("/api/auth/signup", requireGoogleUser, async (req, res) => {
  const username = normalizeUsername(req.body?.username);
  const confirmUsername = normalizeUsername(req.body?.confirmUsername);
  if (username !== confirmUsername) return res.status(400).json({ ok:false, error:'Usernames must match exactly.' });
  if (!isValidUsername(username)) return res.status(400).json({ ok:false, error:'Username must be at least 6 characters, letters/numbers only, and include at least 1 number.' });
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = touchUser(db, req.stepperUser, key);
  if (isSignupComplete(bucket)) return res.status(409).json({ ok:false, error:'This username is locked and cannot be changed.' });
  const existingKey = findUserKeyByUsername(db, username);
  if (existingKey && existingKey !== key) return res.status(409).json({ ok:false, error:'That username is already taken.' });
  bucket.username = username;
  bucket.signupCompleted = true;
  bucket.signupCompletedAt = new Date().toISOString();
  if (!bucket.profile || typeof bucket.profile !== 'object') bucket.profile = {};
  bucket.profile.name = username;
  if (!String(bucket.profile.googleName || '').trim()) bucket.profile.googleName = String(req.stepperUser?.name || req.stepperUser?.email || '').trim();
  db.users[key] = bucket;
  await writeDb(db);
  res.json({ ok:true, username, signupCompleted:true, profile: bucket.profile, isAdmin: isAdminProfile(req.stepperUser), isModerator: isModeratorBucket(bucket), role: getRoleForBucket(bucket, req.stepperUser), membership: bucket?.membership || getUserMembership(bucket, req.stepperUser), suspension: suspensionPayload(bucket) });
});

app.get("/api/presence", async (_req, res) => {
  const db = await readDb();
  const onlineUsers = getOnlineUsers(db);
  res.json({ ok: true, onlineCount: onlineUsers.length, members: onlineUsers });
});

app.post("/api/presence/heartbeat", requireCompletedGoogleUser, async (req, res) => {
  const db = await readDb();
  touchUser(db, req.stepperUser, userKeyFromClaims(req.stepperClaims));
  await writeDb(db);
  const onlineUsers = getOnlineUsers(db);
  const bucket = db.users[userKeyFromClaims(req.stepperClaims)] || null;
  res.json({ ok: true, onlineCount: onlineUsers.length, members: onlineUsers, isAdmin: isAdminProfile(req.stepperUser), isModerator: isModeratorBucket(bucket), role: getRoleForBucket(bucket, req.stepperUser), suspension: suspensionPayload(bucket) });
});

app.get("/api/cloud-saves", requireCompletedGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  await writeDb(db);
  const bucket = db.users[key] && Array.isArray(db.users[key].cloudSaves) ? db.users[key].cloudSaves : [];
  res.json({ ok: true, items: bucket.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)) });
});

app.post("/api/cloud-saves/upsert", requireCompletedGoogleUser, async (req, res) => {
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

app.delete("/api/cloud-saves/:id", requireCompletedGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const list = db.users[key] && Array.isArray(db.users[key].cloudSaves) ? db.users[key].cloudSaves : [];
  db.users[key].cloudSaves = list.filter(item => item && item.id !== String(req.params.id || "").trim());
  await writeDb(db);
  res.json({ ok: true, deletedId: String(req.params.id || "").trim() });
});

app.post("/api/submissions/request", requireCompletedGoogleUser, async (req, res) => {
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

app.get("/api/notifications", requireCompletedGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  await writeDb(db);
  const items = Array.isArray(db.users[key]?.notifications) ? db.users[key].notifications.slice().sort((a,b)=> new Date(b.createdAt||0)-new Date(a.createdAt||0)) : [];
  res.json({ ok: true, items, unreadCount: items.filter(item => !item.readAt).length });
});

app.post("/api/notifications/mark-read", requireCompletedGoogleUser, async (req, res) => {
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

app.post('/api/moderator/apply', requireCompletedGoogleUser, async (req, res) => {
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


app.get('/api/admin/moderators', requireAdmin, async (_req, res) => {
  const db = await readDb();
  const items = Object.entries(db.users || {}).map(([userKey, bucket]) => {
    const profile = bucket?.profile || {};
    const activeSuspension = getActiveSuspension(bucket, profile);
    return {
      userKey,
      email: String(profile.email || '').trim(),
      name: String(profile.name || profile.email || '').trim(),
      role: getRoleForBucket(bucket, profile),
      suspension: activeSuspension ? suspensionPayload({ suspension: activeSuspension }) : null
    };
  }).filter(item => item.role === 'moderator').sort((a, b) => a.name.localeCompare(b.name));
  await writeDb(db);
  res.json({ ok: true, items, pendingInvites: listPendingModeratorInvites(db) });
});

app.post('/api/admin/moderators/add', requireAdmin, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ ok: false, error: 'Enter a Google email address.' });
  if (email === adminEmail) return res.status(400).json({ ok: false, error: 'Admin already has admin access.' });
  const db = await readDb();
  const userKey = findUserKeyByEmail(db, email);
  const bucket = userKey && db.users[userKey] && typeof db.users[userKey] === 'object' ? db.users[userKey] : null;
  if (!Array.isArray(db.pendingModeratorInvites)) db.pendingModeratorInvites = [];
  const existingInvite = getPendingModeratorInvite(db, email);
  if (!bucket) {
    const now = new Date().toISOString();
    const invite = existingInvite || {
      email,
      createdAt: now,
      invitedByEmail: String(req.stepperUser?.email || '').trim(),
      invitedByName: String(req.stepperUser?.name || req.stepperUser?.email || 'Admin').trim(),
      status: 'pending-signin'
    };
    invite.updatedAt = now;
    invite.status = 'pending-signin';
    if (!existingInvite) db.pendingModeratorInvites.unshift(invite);
    await writeDb(db);
    return res.json({ ok: true, invited: true, pending: true, item: invite, pendingInvites: listPendingModeratorInvites(db) });
  }
  bucket.role = 'moderator';
  bucket.membership = getUserMembership({ ...bucket, role: 'moderator' }, bucket.profile);
  bucket.suspension = null;
  db.users[userKey] = { ...bucket, role: 'moderator', membership: bucket.membership };
  db.pendingModeratorInvites = db.pendingModeratorInvites.filter(item => normalizeEmail(item?.email) !== email);
  pushNotification(db, { userKey, email }, {
    kind: 'Moderator',
    title: 'Moderator access granted',
    message: 'Admin added moderator access to your account.'
  });
  await writeDb(db);
  res.json({ ok: true, item: { userKey, email, name: String(bucket.profile?.name || email).trim(), role: 'moderator' }, pendingInvites: listPendingModeratorInvites(db) });
});

app.post('/api/admin/moderators/:userKey/remove', requireAdmin, async (req, res) => {
  const db = await readDb();
  const userKey = String(req.params.userKey || '').trim();
  const bucket = db.users[userKey] && typeof db.users[userKey] === 'object' ? db.users[userKey] : null;
  if (!bucket) return res.status(404).json({ ok: false, error: 'Moderator not found.' });
  if (isAdminProfile(bucket.profile)) return res.status(400).json({ ok: false, error: 'Admins cannot be removed here.' });
  const note = String(req.body?.note || '').trim().slice(0, 800);
  bucket.role = '';
  bucket.membership = getUserMembership({ ...bucket, role: '' }, bucket.profile);
  db.users[userKey] = { ...bucket, role: '', membership: bucket.membership };
  pushNotification(db, { userKey, email: bucket.profile?.email }, {
    kind: 'Moderator',
    title: 'Moderator access removed',
    message: `You were removed as moderator because: ${note || 'No admin reason was supplied.'}`
  });
  await writeDb(db);
  res.json({ ok: true, pendingInvites: listPendingModeratorInvites(db) });
});

app.post('/api/admin/moderators/invites/remove', requireAdmin, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ ok: false, error: 'Enter a Google email address.' });
  const db = await readDb();
  const before = Array.isArray(db.pendingModeratorInvites) ? db.pendingModeratorInvites.length : 0;
  db.pendingModeratorInvites = (Array.isArray(db.pendingModeratorInvites) ? db.pendingModeratorInvites : []).filter(item => normalizeEmail(item?.email) !== email);
  await writeDb(db);
  res.json({ ok: true, removed: before !== db.pendingModeratorInvites.length, pendingInvites: listPendingModeratorInvites(db) });
});

app.get('/api/admin/suspensions', requireAdmin, async (_req, res) => {
  const db = await readDb();
  const items = Object.entries(db.users || {}).map(([userKey, bucket]) => {
    const profile = bucket?.profile || {};
    const suspension = getActiveSuspension(bucket, profile);
    if (!suspension) return null;
    return {
      userKey,
      email: String(profile.email || '').trim(),
      name: String(profile.name || profile.email || '').trim(),
      suspension: suspensionPayload({ suspension })
    };
  }).filter(Boolean).sort((a, b) => new Date(b.suspension?.startedAt || 0) - new Date(a.suspension?.startedAt || 0));
  await writeDb(db);
  res.json({ ok: true, items });
});

app.post('/api/admin/suspend', requireAdmin, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const durationMs = Math.max(60_000, Number(req.body?.durationMs || 300_000));
  const durationLabel = String(req.body?.durationLabel || '').trim() || `${Math.round(durationMs / 60000)} minutes`;
  const reason = String(req.body?.reason || '').trim().slice(0, 800);
  if (!email) return res.status(400).json({ ok: false, error: 'Enter a Google email address.' });
  if (email === adminEmail) return res.status(400).json({ ok: false, error: 'Admins cannot be banned.' });
  const db = await readDb();
  const userKey = findUserKeyByEmail(db, email);
  const bucket = userKey && db.users[userKey] && typeof db.users[userKey] === 'object' ? db.users[userKey] : null;
  if (!bucket) return res.status(404).json({ ok: false, error: 'That Google account has not signed into the site yet.' });
  const untilAt = new Date(Date.now() + durationMs).toISOString();
  bucket.suspension = {
    startedAt: new Date().toISOString(),
    untilAt,
    reason: reason || 'an admin decision',
    durationLabel,
    byEmail: String(req.stepperUser?.email || '').trim()
  };
  db.users[userKey] = bucket;
  pushNotification(db, { userKey, email }, {
    kind: 'Suspension',
    title: 'You were barred',
    message: `You have been barred for ${durationLabel} long because of ${reason || 'an admin decision'}`
  });
  await writeDb(db);
  res.json({ ok: true, item: { userKey, email, name: String(bucket.profile?.name || email).trim(), suspension: suspensionPayload(bucket) } });
});

app.post('/api/admin/suspensions/:userKey/lift', requireAdmin, async (req, res) => {
  const db = await readDb();
  const userKey = String(req.params.userKey || '').trim();
  const bucket = db.users[userKey] && typeof db.users[userKey] === 'object' ? db.users[userKey] : null;
  if (!bucket) return res.status(404).json({ ok: false, error: 'Suspended user not found.' });
  bucket.suspension = null;
  db.users[userKey] = bucket;
  pushNotification(db, { userKey, email: bucket.profile?.email }, {
    kind: 'Suspension',
    title: 'Bar lifted',
    message: 'Admin restored access to your account.'
  });
  await writeDb(db);
  res.json({ ok: true });
});


app.get('/api/staff-chat', requireModerator, async (_req, res) => {
  const db = await readDb();
  const messages = (Array.isArray(db.staffChat) ? db.staffChat : []).slice().sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  res.json({ ok: true, messages });
});

app.post('/api/staff-chat', requireModerator, async (req, res) => {
  const text = String(req.body?.text || '').trim();
  if (!text) {
    res.status(400).json({ ok: false, error: 'Message text is required.' });
    return;
  }
  const db = await readDb();
  if (!Array.isArray(db.staffChat)) db.staffChat = [];
  const item = {
    id: randomUUID(),
    text: text.slice(0, 4000),
    createdAt: new Date().toISOString(),
    role: isAdminProfile(req.stepperUser) ? 'admin' : 'moderator',
    email: req.stepperUser?.email || '',
    name: req.stepperUser?.name || req.stepperUser?.email || 'Staff'
  };
  db.staffChat.push(item);
  db.staffChat = db.staffChat.slice(-200);
  await writeDb(db);
  res.json({ ok: true, messages: db.staffChat.slice().sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)) });
});

app.get('/api/admin/security-alerts', requireAdmin, async (_req, res) => {
  const db = await readDb();
  const items = (Array.isArray(db.securityAlerts) ? db.securityAlerts : []).slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  res.json({ ok: true, items });
});

app.post('/api/security-alerts/strike', requireCompletedGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = touchUser(db, req.stepperUser, key);
  if (isAdminProfile(req.stepperUser)) return res.json({ ok: true, strikeCount: 0, alert: null });
  const trigger = String(req.body?.trigger || 'client-inspection').trim().slice(0, 120);
  const detail = String(req.body?.detail || '').trim().slice(0, 1200);
  bucket.securityStrikes = Math.max(0, Number(bucket.securityStrikes || 0)) + 1;
  let alert = null;
  if (bucket.securityStrikes >= 3) {
    alert = createSecurityAlert(db, {
      userKey: key,
      email: req.stepperUser?.email,
      name: req.stepperUser?.name,
      strikeCount: bucket.securityStrikes,
      reason: 'Possible code inspection on the live site',
      detail,
      trigger
    });
    bucket.securityStrikes = 0;
    pushNotification(db, { email: adminEmail }, {
      kind: 'Security',
      title: 'Security alert',
      message: `${req.stepperUser?.email || 'A user'} hit 3 client-side inspection strikes.`
    });
  }
  db.users[key] = bucket;
  await writeDb(db);
  res.json({ ok: true, strikeCount: bucket.securityStrikes, alert });
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

app.get('/api/subscription/status', requireCompletedGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = touchUser(db, req.stepperUser, key);
  await writeDb(db);
  const membership = getUserMembership(bucket, req.stepperUser);
  res.json({ ok: true, ...membership, role: getRoleForBucket(bucket, req.stepperUser), isModerator: isModeratorBucket(bucket), stripeEnabled: !!stripeSecretKey, stripePublishableKey, suspension: suspensionPayload(bucket) });
});

app.post('/api/subscription/create-checkout-session', requireCompletedGoogleUser, async (req, res) => {
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

app.post('/api/subscription/confirm', requireCompletedGoogleUser, async (req, res) => {
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


app.get('/api/glossary/steps', async (_req, res) => {
  const db = await readDb();
  const items = (Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps : []).slice().sort((a,b)=> String(a?.name || '').localeCompare(String(b?.name || '')));
  res.json({ ok:true, items });
});

app.post('/api/glossary/request', requireCompletedGoogleUser, async (req, res) => {
  const raw = req.body?.step && typeof req.body.step === 'object' ? req.body.step : {};
  const name = String(raw.name || '').trim();
  const description = String(raw.description || raw.desc || '').trim();
  if (!name || !description) return res.status(400).json({ ok:false, error:'Step name and description are required.' });
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const item = {
    id: createId('glossary_request'),
    ownerKey: key,
    ownerEmail: req.stepperUser.email,
    ownerName: req.stepperUser.name,
    name: name.slice(0, 120),
    description: description.slice(0, 1200),
    counts: String(raw.counts || raw.count || '1').trim().slice(0, 40) || '1',
    foot: String(raw.foot || 'Either').trim().slice(0, 24) || 'Either',
    tags: String(raw.tags || '').trim().slice(0, 240),
    autoMirror: buildGlossaryTwin(raw),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.glossaryRequests = [item, ...(Array.isArray(db.glossaryRequests) ? db.glossaryRequests : [])].slice(0, 1000);
  await writeDb(db);
  res.json({ ok:true, item, message:'Glossary step request sent to Admin.' });
});

app.get('/api/admin/glossary-requests', requireAdmin, async (_req, res) => {
  const db = await readDb();
  const items = (Array.isArray(db.glossaryRequests) ? db.glossaryRequests : []).filter(item => String(item?.status || '') === 'pending').sort((a,b)=> new Date(b.updatedAt||0)-new Date(a.updatedAt||0));
  res.json({ ok:true, items });
});

app.post('/api/admin/glossary-requests/:id/approve', requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || '').trim();
  const item = (Array.isArray(db.glossaryRequests) ? db.glossaryRequests : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok:false, error:'Glossary request not found.' });
  item.status = 'approved';
  item.updatedAt = new Date().toISOString();
  item.adminNote = String(req.body?.note || '').trim().slice(0, 600);
  const approved = normalizeGlossaryStepPayload(item, { email:item.ownerEmail, name:item.ownerName });
  approved.status = 'approved';
  approved.sourceRequestId = item.id;
  const additions = [approved];
  if (item.autoMirror) {
    const twin = normalizeGlossaryStepPayload({ ...item.autoMirror, counts:item.autoMirror.counts || item.counts, tags:item.autoMirror.tags || item.tags }, { email:item.ownerEmail, name:item.ownerName });
    twin.status = 'approved';
    twin.sourceRequestId = item.id;
    twin.isAutoMirror = true;
    additions.push(twin);
  }
  db.approvedGlossarySteps = [...additions, ...(Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps : [])].slice(0, 4000);
  notifyUser(db, item.ownerKey, { kind:'glossary-approved', title:'Glossary step approved', message: item.autoMirror ? 'Admin approved your glossary step and created the opposite-foot twin too.' : 'Admin approved your glossary step.' });
  await writeDb(db);
  res.json({ ok:true, item, added:additions });
});

app.post('/api/admin/glossary-requests/:id/reject', requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || '').trim();
  const item = (Array.isArray(db.glossaryRequests) ? db.glossaryRequests : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok:false, error:'Glossary request not found.' });
  item.status = 'rejected';
  item.updatedAt = new Date().toISOString();
  item.adminNote = String(req.body?.note || '').trim().slice(0, 600);
  notifyUser(db, item.ownerKey, { kind:'glossary-rejected', title:'Glossary step declined', message: item.adminNote ? `Admin declined your glossary step request: ${item.adminNote}` : 'Admin declined your glossary step request this time.' });
  await writeDb(db);
  res.json({ ok:true, item });
});


app.get('/api/site-memory', async (_req, res) => {
  const db = await readDb();
  res.json({ ok:true, items: (Array.isArray(db.siteMemory) ? db.siteMemory : []).slice(0, 60) });
});

app.post('/api/admin/site-memory', requireAdmin, async (req, res) => {
  const db = await readDb();
  const textValue = String(req.body?.text || '').trim();
  if (!textValue) return res.status(400).json({ ok:false, error:'Missing memory text.' });
  const item = {
    id: createId('site_memory'),
    text: textValue.slice(0, 1200),
    createdAt: new Date().toISOString(),
    createdByEmail: req.stepperUser.email,
    createdByName: req.stepperUser.name
  };
  db.siteMemory = [item, ...(Array.isArray(db.siteMemory) ? db.siteMemory : [])].slice(0, 200);
  await writeDb(db);
  res.json({ ok:true, item, items: db.siteMemory });
});

app.delete('/api/admin/site-memory/:id', requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params?.id || '').trim();
  db.siteMemory = (Array.isArray(db.siteMemory) ? db.siteMemory : []).filter(item => String(item?.id || '') !== id);
  await writeDb(db);
  res.json({ ok:true, items: db.siteMemory });
});

app.post('/api/ai/dance-tools', requireCompletedGoogleUser, async (req, res) => {
  const requestedMode = String(req.body?.mode || 'judge').trim().toLowerCase();
  const mode = requestedMode === 'add' ? 'add' : (requestedMode === 'counts' ? 'counts' : 'judge');
  const prompt = String(req.body?.prompt || '').trim();
  const dance = req.body?.dance && typeof req.body.dance === 'object' ? req.body.dance : null;
  if (!dance || typeof dance !== 'object') return res.status(400).json({ ok:false, error:'Missing dance payload.' });
  const db = await readDb();
  const approved = (Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps : []).slice(0, 120).map(item => ({ name:item.name, description:item.description, counts:item.counts, foot:item.foot, tags:item.tags }));
  const danceText = serializeDanceForAi(dance);
  const system = mode === 'add'
    ? 'You are an expert line-dance editor. Use the provided dance sheet and community glossary to propose 1 to 3 additions that improve flow. Return strict JSON with keys text, flowScore, suggestions, countLines, totalCounts. Each suggestion must have name, description, count, foot, reason. Avoid markdown.'
    : (mode === 'counts'
      ? 'You are an expert line-dance worksheet assistant. Generate count labels for each step in order, grouped naturally into 8-count phrasing. Return strict JSON with keys text, flowScore, suggestions, countLines, totalCounts. countLines must be an array of count labels matching the number of steps exactly. suggestions can be empty. Avoid markdown.'
      : 'You are an expert line-dance judge. Score the dance for flowability and teaching clarity. Return strict JSON with keys text, flowScore, suggestions, countLines, totalCounts. flowScore is 1-10. suggestions can be empty or contain tidy-up suggestions with name, description, count, foot, reason. Avoid markdown.');
  const userPrompt = `Mode: ${mode}
User request: ${prompt || '(none)'}

Current dance:
${danceText}

Community glossary steps:
${approved.map(item => `- ${item.name} [${item.foot}] ${item.counts}: ${item.description}`).join('\n') || '(none)'}`;
  try {
    const ai = await runSiteHelperAI({ system, prompt: userPrompt, history: [], preferredModel: 'gemini' });
    const parsed = parseJsonFromAiText(ai.text);
    if (!parsed || (!parsed.text && !Array.isArray(parsed.suggestions))) {
      const fallback = fallbackDanceTool(mode, dance, prompt);
      return res.json({ ok:true, provider: ai.provider, ...fallback, fallback:true });
    }
    const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions.map(item => ({
      name: String(item?.name || '').trim(),
      description: String(item?.description || item?.desc || '').trim(),
      count: String(item?.count || item?.counts || '1').trim(),
      foot: String(item?.foot || '').trim(),
      reason: String(item?.reason || item?.note || '').trim()
    })).filter(item => item.name || item.description) : [];
    res.json({ ok:true, provider: ai.provider, text: String(parsed.text || '').trim() || fallbackDanceTool(mode, dance, prompt).text, flowScore: Number(parsed.flowScore || 0) || null, suggestions, countLines: Array.isArray(parsed.countLines) ? parsed.countLines.map(item => String(item || '').trim()).filter(Boolean) : [], totalCounts: String(parsed.totalCounts || '').trim() });
  } catch (error) {
    const fallback = fallbackDanceTool(mode, dance, prompt);
    res.json({ ok:true, provider:'fallback', ...fallback, fallback:true, error: error.message || 'AI dance tool failed.' });
  }
});

app.post('/api/chatbot/help', requireCompletedGoogleUser, async (req, res) => {
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
    const learnedNotes = (Array.isArray(db.siteMemory) ? db.siteMemory : []).slice(0, 30).map(item => `- ${String(item?.text || '').trim()}`).filter(Boolean).join('\n') || '(none)';
    const system = `${SITE_HELP_CONTEXT}\nReply like a natural AI helper for the Step By Stepper site. Be specific, warm, and practical. Use the conversation history when it matters, and do not keep repeating the exact same canned answer.\nAdmin-approved helper memory:\n${learnedNotes}`;
    const userPrompt = `Current tab: ${context.currentTab || 'unknown'}
Signed in: ${context.signedIn ? 'yes' : 'no'}
Admin: ${context.isAdmin ? 'yes' : 'no'}
Moderator: ${context.isModerator ? 'yes' : 'no'}
Premium: ${context.isPremium ? 'yes' : 'no'}
Online count: ${context.onlineCount || 0}
Current dance title: ${context.currentDanceTitle || 'none'}
Community glossary count: ${Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps.length : 0}
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
