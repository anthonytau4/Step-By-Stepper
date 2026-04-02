import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { OAuth2Client } from "google-auth-library";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execFile } from "child_process";
import { promisify } from "util";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const execFileAsync = promisify(execFile);
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "gpt-5";
const googleClientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;
const renderDiskRoot = String(process.env.RENDER_DISK_MOUNT_PATH || '').trim();
const isRenderDiskMode = !process.env.DATA_DIR && !!renderDiskRoot;
const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : isRenderDiskMode
    ? path.resolve(renderDiskRoot)
    : path.join(__dirname, "data");
const dbPath = path.join(dataDir, "stepper-db.json");
const dbBackupPath = `${dbPath}.bak`;
const dbTempPath = `${dbPath}.tmp`;
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
  const admin = isAdminProfile(profile || bucket?.profile, null) || String(bucket?.role || '').trim().toLowerCase() === 'admin';
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

function isFutureIso(value) {
  const ms = Date.parse(value || 0);
  return Number.isFinite(ms) && ms > Date.now();
}

function pruneExpiredPendingSuspensions(db) {
  if (!db || !Array.isArray(db.pendingSuspensions)) return 0;
  const before = db.pendingSuspensions.length;
  db.pendingSuspensions = db.pendingSuspensions.filter(item => isFutureIso(item?.untilAt));
  return before - db.pendingSuspensions.length;
}

function pruneExpiredUserSuspensions(db) {
  if (!db || !db.users || typeof db.users !== 'object') return 0;
  let cleared = 0;
  Object.keys(db.users).forEach((userKey) => {
    const bucket = db.users[userKey];
    if (!bucket || typeof bucket !== 'object' || !bucket.suspension) return;
    if (!clearExpiredSuspension(bucket)) {
      db.users[userKey] = bucket;
      cleared += 1;
    }
  });
  return cleared;
}

function syncAndPruneDb(db) {
  return pruneDbState(db);
}

function pruneDbState(db) {
  if (!db || typeof db !== 'object') return db;
  pruneExpiredPendingSuspensions(db);
  pruneExpiredUserSuspensions(db);
  return db;
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

function getRoleForBucket(bucket, profile = null, db = null) {
  if (String(bucket?.role || '').trim().toLowerCase() === 'admin' || isAdminProfile(profile || bucket?.profile, db)) return 'admin';
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
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Stepper-Google-Token", "X-Google-Credential"],
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: "20mb" }));

function emptyDb() {
  return {
    users: {},
    featuredChoreo: [],
    danceRegistry: [],
    submissions: [],
    moderatorApplications: [],
    moderatorRegistry: [],
    adminRegistry: [],
    pendingModeratorInvites: [],
    pendingSuspensions: [],
    glossaryRequests: [],
    approvedGlossarySteps: [],
    siteMemory: [],
    securityAlerts: [],
    staffChat: []
  };
}

async function ensureDb() {
  if (isRenderDiskMode) {
    try {
      await fs.access(dataDir);
      console.log('[Stepper] Persistent disk mount is accessible:', dataDir);
    } catch (error) {
      console.error('[Stepper] Persistent disk mount root is not accessible:', dataDir, error?.code || error?.message || error);
      throw error;
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

async function readDbFromPath(targetPath) {
  const raw = await fs.readFile(targetPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") throw new Error("Database file did not contain an object.");
  if (!parsed.users || typeof parsed.users !== "object") parsed.users = {};
  if (!Array.isArray(parsed.featuredChoreo)) parsed.featuredChoreo = [];
  if (!Array.isArray(parsed.danceRegistry)) parsed.danceRegistry = [];
  if (!Array.isArray(parsed.submissions)) parsed.submissions = [];
  if (!Array.isArray(parsed.moderatorApplications)) parsed.moderatorApplications = [];
  if (!Array.isArray(parsed.moderatorRegistry)) parsed.moderatorRegistry = [];
  if (!Array.isArray(parsed.adminRegistry)) parsed.adminRegistry = [];
  if (!Array.isArray(parsed.pendingModeratorInvites)) parsed.pendingModeratorInvites = [];
  if (!Array.isArray(parsed.pendingSuspensions)) parsed.pendingSuspensions = [];
  if (!Array.isArray(parsed.glossaryRequests)) parsed.glossaryRequests = [];
  if (!Array.isArray(parsed.approvedGlossarySteps)) parsed.approvedGlossarySteps = [];
  if (!Array.isArray(parsed.siteMemory)) parsed.siteMemory = [];
  if (!Array.isArray(parsed.securityAlerts)) parsed.securityAlerts = [];
  if (!Array.isArray(parsed.collaborators)) parsed.collaborators = [];

  if (Array.isArray(parsed.submissions)) {
    parsed.submissions = parsed.submissions.map((item) => {
      if (!item || typeof item !== 'object') return item;
      const votes = Array.isArray(item.moderatorVotes) ? item.moderatorVotes : [];
      item.moderatorVotes = votes
        .map((vote) => ({
          email: normalizeEmail(vote?.email),
          name: String(vote?.name || vote?.email || '').trim(),
          decision: String(vote?.decision || '').trim().toLowerCase() === 'disapprove' ? 'disapprove' : 'approve',
          note: String(vote?.note || '').trim().slice(0, 800),
          at: String(vote?.at || vote?.moderatorApprovedAt || item?.updatedAt || item?.createdAt || '').trim() || new Date().toISOString()
        }))
        .filter((vote) => vote.email);
      return item;
    });
  }
  return parsed;
}

function summarizeModeratorVotes(item) {
  const votes = Array.isArray(item?.moderatorVotes) ? item.moderatorVotes : [];
  let approve = 0;
  let disapprove = 0;
  for (const vote of votes) {
    if (String(vote?.decision || '').trim().toLowerCase() === 'disapprove') disapprove += 1;
    else approve += 1;
  }
  return {
    approve,
    disapprove,
    total: approve + disapprove,
    text: `${approve} moderators approve and ${disapprove} disapprove`
  };
}

function syncModeratorRegistry(db) {
  if (!db || typeof db !== 'object') return db;
  const list = Array.isArray(db.moderatorRegistry) ? db.moderatorRegistry : [];
  const byEmail = new Map();
  list.forEach((item) => {
    const email = normalizeEmail(item?.email);
    if (!email) return;
    byEmail.set(email, {
      email,
      userKey: String(item?.userKey || '').trim(),
      name: String(item?.name || item?.email || '').trim(),
      addedAt: String(item?.addedAt || new Date().toISOString()).trim(),
      addedByEmail: String(item?.addedByEmail || '').trim(),
      addedByName: String(item?.addedByName || '').trim()
    });
  });
  Object.entries(db.users || {}).forEach(([userKey, bucket]) => {
    if (!isModeratorBucket(bucket)) return;
    const email = normalizeEmail(bucket?.profile?.email);
    if (!email) return;
    byEmail.set(email, {
      email,
      userKey: String(userKey || '').trim(),
      name: String(bucket?.profile?.name || bucket?.profile?.email || '').trim(),
      addedAt: String(bucket?.updatedAt || bucket?.lastSeenAt || bucket?.createdAt || new Date().toISOString()).trim(),
      addedByEmail: String(byEmail.get(email)?.addedByEmail || '').trim(),
      addedByName: String(byEmail.get(email)?.addedByName || '').trim()
    });
  });
  db.moderatorRegistry = Array.from(byEmail.values()).sort((a, b) => a.name.localeCompare(b.name));
  return db;
}

async function readDb() {
  await ensureDb();
  try {
    const parsed = await readDbFromPath(dbPath);
    return syncAndPruneDb(parsed);
  } catch (error) {
    try {
      const fallback = await readDbFromPath(dbBackupPath);
      console.warn('[Stepper] Main database file could not be read, using backup copy instead.', error?.message || error);
      return syncAndPruneDb(fallback);
    } catch {
      console.error('[Stepper] Database files were unreadable. Refusing to silently reset persistent data.', error?.message || error);
      throw error;
    }
  }
}


function syncAdminRegistry(db) {
  if (!db || typeof db !== 'object') return db;
  const byEmail = new Map();
  const list = Array.isArray(db.adminRegistry) ? db.adminRegistry : [];
  list.forEach((item) => {
    const email = normalizeEmail(item?.email);
    if (!email) return;
    byEmail.set(email, {
      email,
      userKey: String(item?.userKey || '').trim(),
      name: String(item?.name || email).trim().slice(0, 200),
      grantedAt: String(item?.grantedAt || new Date().toISOString()).trim(),
      grantedBy: {
        email: String(item?.grantedBy?.email || '').trim(),
        name: String(item?.grantedBy?.name || item?.grantedBy?.email || '').trim()
      },
      note: String(item?.note || '').trim().slice(0, 800)
    });
  });
  if (adminEmail) {
    const existing = byEmail.get(adminEmail) || {};
    byEmail.set(adminEmail, {
      email: adminEmail,
      userKey: String(existing.userKey || '').trim(),
      name: String(existing.name || adminEmail).trim().slice(0, 200),
      grantedAt: String(existing.grantedAt || new Date().toISOString()).trim(),
      grantedBy: existing.grantedBy && typeof existing.grantedBy === 'object' ? existing.grantedBy : { email: adminEmail, name: 'System' },
      note: String(existing.note || 'Configured admin email').trim().slice(0, 800)
    });
  }
  Object.entries(db.users || {}).forEach(([userKey, bucket]) => {
    const email = normalizeEmail(bucket?.profile?.email);
    if (!email) return;
    const role = String(bucket?.role || '').trim().toLowerCase();
    if (role !== 'admin' && email !== adminEmail) return;
    const existing = byEmail.get(email) || {};
    byEmail.set(email, {
      email,
      userKey: String(userKey || existing.userKey || '').trim(),
      name: String(bucket?.profile?.name || existing.name || email).trim().slice(0, 200),
      grantedAt: String(existing.grantedAt || bucket?.updatedAt || bucket?.createdAt || new Date().toISOString()).trim(),
      grantedBy: existing.grantedBy && typeof existing.grantedBy === 'object' ? existing.grantedBy : { email: adminEmail, name: 'System' },
      note: String(existing.note || (email === adminEmail ? 'Configured admin email' : 'Persisted admin account')).trim().slice(0, 800)
    });
  });
  db.adminRegistry = Array.from(byEmail.values()).sort((a, b) => a.name.localeCompare(b.name));
  return db;
}

let writeDbQueue = Promise.resolve();

async function writeDb(payload) {
  const prepared = syncAdminRegistry(syncModeratorRegistry(syncAndPruneDb(payload)));
  writeDbQueue = writeDbQueue.then(async () => {
    await ensureDb();
    const data = JSON.stringify(prepared, null, 2);
    const tempPath = `${dbPath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
    try {
      try {
        await fs.copyFile(dbPath, dbBackupPath);
      } catch {}
      await fs.writeFile(tempPath, data, 'utf8');
      await fs.rename(tempPath, dbPath);
      try {
        await fs.copyFile(dbPath, dbBackupPath);
      } catch {}
    } finally {
      try { await fs.unlink(tempPath); } catch {}
    }
  }).catch((error) => {
    console.error('[Stepper] queued DB write failed', error);
    throw error;
  });
  return writeDbQueue;
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

function hasPersistentAdminAccess(db, value) {
  const email = normalizeEmail(value?.email || value?.profile?.email || value);
  if (!email) return false;
  if (email === adminEmail) return true;
  const list = Array.isArray(db?.adminRegistry) ? db.adminRegistry : [];
  return list.some((item) => normalizeEmail(item?.email) === email);
}

function isAdminProfile(profile, db = null) {
  const email = normalizeEmail(profile?.email);
  if (!email) return false;
  if (email === adminEmail) return true;
  return !!(db && hasPersistentAdminAccess(db, email));
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

async function requireAdmin(req, res, next) {
  requireGoogleUser(req, res, async () => {
    const db = await readDb();
    const bucket = touchUser(db, req.stepperUser, userKeyFromClaims(req.stepperClaims));
    if (!isAdminProfile(req.stepperUser, db) && String(bucket?.role || '').trim().toLowerCase() !== 'admin') {
      await writeDb(db);
      res.status(403).json({ ok: false, error: "Admin access only." });
      return;
    }
    await writeDb(db);
    req.stepperUserBucket = bucket;
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


function findPendingModeratorInviteIndex(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return -1;
  const list = Array.isArray(db?.pendingModeratorInvites) ? db.pendingModeratorInvites : [];
  return list.findIndex(item => normalizeEmail(item?.email) === wanted);
}

function upsertPendingModeratorInvite(db, payload = {}) {
  if (!Array.isArray(db.pendingModeratorInvites)) db.pendingModeratorInvites = [];
  const email = normalizeEmail(payload.email);
  if (!email) return null;
  const item = {
    id: String(payload.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).trim(),
    email,
    name: String(payload.name || email).trim().slice(0, 200),
    invitedAt: String(payload.invitedAt || new Date().toISOString()).trim(),
    invitedBy: {
      email: String(payload.invitedBy?.email || '').trim(),
      name: String(payload.invitedBy?.name || payload.invitedBy?.email || '').trim()
    },
    note: String(payload.note || '').trim().slice(0, 800)
  };
  const idx = findPendingModeratorInviteIndex(db, email);
  if (idx >= 0) db.pendingModeratorInvites[idx] = { ...db.pendingModeratorInvites[idx], ...item, id: String(db.pendingModeratorInvites[idx]?.id || item.id).trim() };
  else db.pendingModeratorInvites.unshift(item);
  db.pendingModeratorInvites = db.pendingModeratorInvites.slice(0, 1000);
  return db.pendingModeratorInvites.find(entry => normalizeEmail(entry?.email) === email) || item;
}

function removePendingModeratorInvite(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return false;
  const before = Array.isArray(db.pendingModeratorInvites) ? db.pendingModeratorInvites.length : 0;
  db.pendingModeratorInvites = (Array.isArray(db.pendingModeratorInvites) ? db.pendingModeratorInvites : []).filter(item => normalizeEmail(item?.email) !== wanted);
  return db.pendingModeratorInvites.length !== before;
}


function findModeratorRegistryIndex(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return -1;
  const list = Array.isArray(db?.moderatorRegistry) ? db.moderatorRegistry : [];
  return list.findIndex(item => normalizeEmail(item?.email) === wanted);
}

function upsertModeratorRegistryEntry(db, payload = {}) {
  if (!Array.isArray(db.moderatorRegistry)) db.moderatorRegistry = [];
  const email = normalizeEmail(payload.email);
  if (!email) return null;
  const item = {
    email,
    userKey: String(payload.userKey || '').trim(),
    name: String(payload.name || payload.email || '').trim(),
    addedAt: String(payload.addedAt || new Date().toISOString()).trim(),
    addedByEmail: String(payload.addedByEmail || '').trim(),
    addedByName: String(payload.addedByName || payload.addedByEmail || '').trim()
  };
  const idx = findModeratorRegistryIndex(db, email);
  if (idx >= 0) db.moderatorRegistry[idx] = { ...db.moderatorRegistry[idx], ...item };
  else db.moderatorRegistry.unshift(item);
  db.moderatorRegistry = db.moderatorRegistry.slice(0, 5000);
  return db.moderatorRegistry.find(entry => normalizeEmail(entry?.email) === email) || item;
}

function removeModeratorRegistryEntry(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return false;
  const before = Array.isArray(db.moderatorRegistry) ? db.moderatorRegistry.length : 0;
  db.moderatorRegistry = (Array.isArray(db.moderatorRegistry) ? db.moderatorRegistry : []).filter(item => normalizeEmail(item?.email) !== wanted);
  return db.moderatorRegistry.length !== before;
}

function hasPersistentModeratorAccess(db, profileOrBucket) {
  const email = normalizeEmail(profileOrBucket?.email || profileOrBucket?.profile?.email);
  if (!email) return false;
  return findModeratorRegistryIndex(db, email) >= 0;
}

function findPendingSuspensionIndex(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return -1;
  const list = Array.isArray(db?.pendingSuspensions) ? db.pendingSuspensions : [];
  return list.findIndex(item => normalizeEmail(item?.email) === wanted);
}

function upsertPendingSuspension(db, payload = {}) {
  if (!Array.isArray(db.pendingSuspensions)) db.pendingSuspensions = [];
  const email = normalizeEmail(payload.email);
  if (!email) return null;
  const item = {
    id: String(payload.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).trim(),
    email,
    reason: String(payload.reason || 'an admin decision').trim().slice(0, 800) || 'an admin decision',
    durationLabel: String(payload.durationLabel || 'a while').trim().slice(0, 120) || 'a while',
    startedAt: String(payload.startedAt || new Date().toISOString()).trim(),
    untilAt: String(payload.untilAt || '').trim(),
    byEmail: String(payload.byEmail || '').trim(),
    byName: String(payload.byName || payload.byEmail || '').trim()
  };
  const idx = findPendingSuspensionIndex(db, email);
  if (idx >= 0) db.pendingSuspensions[idx] = { ...db.pendingSuspensions[idx], ...item, id: String(db.pendingSuspensions[idx]?.id || item.id).trim() };
  else db.pendingSuspensions.unshift(item);
  db.pendingSuspensions = db.pendingSuspensions.slice(0, 1000);
  return db.pendingSuspensions.find(entry => normalizeEmail(entry?.email) === email) || item;
}

function removePendingSuspension(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return false;
  const before = Array.isArray(db.pendingSuspensions) ? db.pendingSuspensions.length : 0;
  db.pendingSuspensions = (Array.isArray(db.pendingSuspensions) ? db.pendingSuspensions : []).filter(item => normalizeEmail(item?.email) !== wanted);
  return db.pendingSuspensions.length !== before;
}

function applyPendingAccountState(db, bucket, profile) {
  if (!db || !bucket || !profile) return bucket;
  const email = normalizeEmail(profile?.email || bucket?.profile?.email);
  if (!email) return bucket;
  const inviteIndex = findPendingModeratorInviteIndex(db, email);
  if (inviteIndex >= 0 && !isAdminProfile(profile)) {
    bucket.role = 'moderator';
    bucket.membership = getUserMembership({ ...bucket, role: 'moderator' }, profile);
    upsertModeratorRegistryEntry(db, { email, userKey: String(profile?.sub || bucket?.profile?.sub || '').trim(), name: String(profile?.name || bucket?.profile?.name || email).trim() });
    removePendingModeratorInvite(db, email);
  }
  const suspensionIndex = findPendingSuspensionIndex(db, email);
  if (suspensionIndex >= 0 && !isAdminProfile(profile)) {
    const pending = db.pendingSuspensions[suspensionIndex];
    const untilMs = Date.parse(pending?.untilAt || 0);
    if (Number.isFinite(untilMs) && untilMs > Date.now()) {
      bucket.suspension = {
        startedAt: String(pending?.startedAt || new Date().toISOString()).trim(),
        untilAt: String(pending?.untilAt || '').trim(),
        reason: String(pending?.reason || 'an admin decision').trim() || 'an admin decision',
        durationLabel: String(pending?.durationLabel || 'a while').trim() || 'a while',
        byEmail: String(pending?.byEmail || '').trim()
      };
    }
    removePendingSuspension(db, email);
  }
  return bucket;
}

function findAdminRegistryIndex(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return -1;
  const list = Array.isArray(db?.adminRegistry) ? db.adminRegistry : [];
  return list.findIndex(item => normalizeEmail(item?.email) === wanted);
}

function upsertAdminRegistryEntry(db, payload = {}) {
  if (!Array.isArray(db.adminRegistry)) db.adminRegistry = [];
  const email = normalizeEmail(payload.email);
  if (!email) return null;
  const item = {
    email,
    userKey: String(payload.userKey || '').trim(),
    name: String(payload.name || email).trim().slice(0, 200),
    grantedAt: String(payload.grantedAt || new Date().toISOString()).trim(),
    grantedBy: {
      email: String(payload.grantedBy?.email || adminEmail || '').trim(),
      name: String(payload.grantedBy?.name || payload.grantedBy?.email || 'System').trim()
    },
    note: String(payload.note || '').trim().slice(0, 800)
  };
  const idx = findAdminRegistryIndex(db, email);
  if (idx >= 0) db.adminRegistry[idx] = { ...db.adminRegistry[idx], ...item };
  else db.adminRegistry.unshift(item);
  db.adminRegistry = db.adminRegistry.slice(0, 1000);
  return db.adminRegistry.find(entry => normalizeEmail(entry?.email) === email) || item;
}

function removeAdminRegistryEntry(db, email) {
  const wanted = normalizeEmail(email);
  if (!wanted || wanted === adminEmail) return false;
  const before = Array.isArray(db.adminRegistry) ? db.adminRegistry.length : 0;
  db.adminRegistry = (Array.isArray(db.adminRegistry) ? db.adminRegistry : []).filter(item => normalizeEmail(item?.email) !== wanted);
  return db.adminRegistry.length !== before;
}

function touchUser(db, profile, userKey) {
  const key = String(userKey || profile?.sub || profile?.email || "").trim();
  if (!key) return null;
  const email = normalizeEmail(profile?.email);
  const emailKey = email ? findUserKeyByEmail(db, email) : '';
  const keyBucket = db.users[key] && typeof db.users[key] === "object" ? db.users[key] : null;
  const emailBucket = emailKey && db.users[emailKey] && typeof db.users[emailKey] === "object" ? db.users[emailKey] : null;
  const baseBucket = keyBucket || emailBucket || {};
  const migratedBucket = keyBucket && emailBucket && emailKey !== key ? emailBucket : (!keyBucket && emailBucket && emailKey !== key ? emailBucket : null);
  const mergedCloudSaves = [
    ...(Array.isArray(baseBucket.cloudSaves) ? baseBucket.cloudSaves : []),
    ...(Array.isArray(migratedBucket?.cloudSaves) ? migratedBucket.cloudSaves : [])
  ];
  const mergedNotifications = [
    ...(Array.isArray(baseBucket.notifications) ? baseBucket.notifications : []),
    ...(Array.isArray(migratedBucket?.notifications) ? migratedBucket.notifications : [])
  ];
  const hasAdmin = isAdminProfile(profile, db) || String(baseBucket?.role || '').trim().toLowerCase() === 'admin' || String(migratedBucket?.role || '').trim().toLowerCase() === 'admin' || hasPersistentAdminAccess(db, profile) || hasPersistentAdminAccess(db, baseBucket) || hasPersistentAdminAccess(db, migratedBucket);
  const mergedRole = hasAdmin ? 'admin' : ((isModeratorBucket(baseBucket) || isModeratorBucket(migratedBucket) || hasPersistentModeratorAccess(db, profile) || hasPersistentModeratorAccess(db, baseBucket) || hasPersistentModeratorAccess(db, migratedBucket)) ? 'moderator' : '');
  const mergedSuspension = (baseBucket.suspension && typeof baseBucket.suspension === 'object')
    ? baseBucket.suspension
    : (migratedBucket?.suspension && typeof migratedBucket.suspension === 'object' ? migratedBucket.suspension : null);
  db.users[key] = {
    ...migratedBucket,
    ...baseBucket,
    profile: {
      sub: String(profile?.sub || baseBucket?.profile?.sub || migratedBucket?.profile?.sub || "").trim(),
      email: String(profile?.email || baseBucket?.profile?.email || migratedBucket?.profile?.email || "").trim(),
      name: String(profile?.name || baseBucket?.profile?.name || migratedBucket?.profile?.name || profile?.email || "").trim(),
      picture: String(profile?.picture || baseBucket?.profile?.picture || migratedBucket?.profile?.picture || "").trim()
    },
    lastSeenAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cloudSaves: mergedCloudSaves,
    notifications: mergedNotifications,
    role: mergedRole,
    membership: getUserMembership({ ...migratedBucket, ...baseBucket, role: mergedRole }, profile),
    suspension: mergedSuspension,
    securityStrikes: Math.max(0, Number(baseBucket.securityStrikes || 0), Number(migratedBucket?.securityStrikes || 0))
  };
  if (emailKey && emailKey !== key) delete db.users[emailKey];
  applyPendingAccountState(db, db.users[key], profile);
  if (email && (hasAdmin || String(db.users[key]?.role || '').trim().toLowerCase() === 'admin')) {
    db.users[key].role = 'admin';
    upsertAdminRegistryEntry(db, { email, userKey: key, name: String(profile?.name || db.users[key]?.profile?.name || email).trim(), note: email === adminEmail ? 'Configured admin email' : 'Persisted admin account' });
  }
  if (isModeratorBucket(db.users[key]) && email) {
    upsertModeratorRegistryEntry(db, { email, userKey: key, name: String(profile?.name || db.users[key]?.profile?.name || email).trim() });
  }
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



async function runWorksheetBuilderPython(payload = {}) {
  const helperUrl = String(process.env.AI_STEP_HELPER_URL || '').trim().replace(/\/$/, '');
  if (helperUrl) {
    const response = await fetch(`${helperUrl}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const raw = await response.text();
    let data = null;
    try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
    if (!response.ok) {
      const message = String(data?.error || raw || `Worksheet helper failed (${response.status}).`).trim();
      const error = new Error(message || 'Worksheet helper failed.');
      error.status = response.status;
      throw error;
    }
    return data || {};
  }
  const pythonBin = String(process.env.PYTHON_BIN || 'python3').trim() || 'python3';
  const scriptPath = path.join(__dirname, 'ai_step_helper.py');
  const { stdout } = await execFileAsync(pythonBin, [scriptPath], {
    input: JSON.stringify(payload || {}),
    maxBuffer: 5 * 1024 * 1024,
    timeout: 12000,
  });
  return JSON.parse(String(stdout || '{}'));
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



function decodeBase64Pdf(value) {
  const raw = String(value || '').trim();
  if (!raw) return Buffer.alloc(0);
  const cleaned = raw.replace(/^data:application\/pdf;base64,/i, '').replace(/\s+/g, '');
  return Buffer.from(cleaned, 'base64');
}

async function extractPdfTextWithPython(pdfBuffer) {
  const encoded = pdfBuffer.toString('base64');
  const script = `import base64, io, json, sys
import pdfplumber
pdf_bytes = base64.b64decode(sys.stdin.read())
text_parts = []
with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
    for page in pdf.pages:
        page_text = page.extract_text() or ''
        if page_text:
            text_parts.append(page_text)
print(json.dumps({"text": "\n\n".join(text_parts)}))`;
  const { stdout } = await execFileAsync('python3', ['-c', script], { input: encoded, maxBuffer: 20 * 1024 * 1024 });
  const parsed = JSON.parse(String(stdout || '{}'));
  return String(parsed && parsed.text || '').trim();
}

async function extractPdfTextWithService(pdfBuffer) {
  const baseUrl = String(process.env.PDF_PARSER_URL || '').trim().replace(/\/$/, '');
  if (!baseUrl) throw new Error('PDF_PARSER_URL is not configured');
  const formData = new FormData();
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  formData.append('file', blob, 'stepsheet.pdf');
  const response = await fetch(`${baseUrl}/parse`, {
    method: 'POST',
    body: formData,
  });
  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }
  if (!response.ok) {
    const message = String(data?.error || raw || `PDF parser failed with status ${response.status}`).trim();
    throw new Error(message || 'PDF parser failed.');
  }
  return String(data?.text || '').trim();
}

async function extractPdfText(pdfBuffer) {
  if (String(process.env.PDF_PARSER_URL || '').trim()) {
    return extractPdfTextWithService(pdfBuffer);
  }
  return extractPdfTextWithPython(pdfBuffer);
}

function cleanPdfLine(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function titleCaseWords(value) {
  return String(value || '').split(/\s+/).filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function normalizeStepName(name, description) {
  const raw = cleanPdfLine(name || '');
  if (raw) return raw.slice(0, 120);
  const source = cleanPdfLine(description || '');
  const firstClause = source.split(/[.;:]/)[0].trim();
  if (!firstClause) return 'Imported Step';
  return titleCaseWords(firstClause.split(/\s+/).slice(0, 6).join(' ')).slice(0, 120) || 'Imported Step';
}

function inferFootFromPdfText(text) {
  const lower = ` ${String(text || '').toLowerCase()} `;
  if (lower.includes(' left ') && lower.includes(' right ')) return 'Either';
  if (lower.includes(' left ')) return 'L';
  if (lower.includes(' right ')) return 'R';
  if (lower.includes(' both ')) return 'Both';
  return 'Either';
}

function parseStepLine(line, fallbackIndex) {
  const cleaned = cleanPdfLine(line).replace(/^[-•·]+\s*/, '');
  if (!cleaned) return null;
  let rest = cleaned;
  let counts = '';
  const countMatch = rest.match(/^((?:counts?\s*)?(?:\d+(?:\s*[&-]\s*\d+)*|[&a-z](?:\s*[&-]\s*\d+)*))(?:\s*[:.)-]|\s{2,}|\s+(?=[A-Z]))/i);
  if (countMatch) {
    counts = cleanPdfLine(countMatch[1].replace(/^counts?\s*/i, ''));
    rest = cleanPdfLine(rest.slice(countMatch[0].length));
  }
  let name = '';
  let description = rest;
  const splitMatch = rest.match(/^([^:–—-]{2,80})\s*[:–—-]\s*(.+)$/);
  if (splitMatch) {
    name = cleanPdfLine(splitMatch[1]);
    description = cleanPdfLine(splitMatch[2]);
  }
  if (!description) description = rest;
  if (!name && /,/.test(description)) {
    const clause = description.split(',')[0];
    if (clause && clause.length <= 80) name = titleCaseWords(clause);
  }
  const finalName = normalizeStepName(name, description);
  const finalDescription = cleanPdfLine(description || rest || finalName);
  return {
    counts: counts || String(fallbackIndex + 1),
    count: counts || String(fallbackIndex + 1),
    name: finalName,
    description: finalDescription,
    foot: inferFootFromPdfText(finalDescription)
  };
}

function guessDanceFeel(meta, rawText) {
  const blob = `${String(meta?.title || '')}
${String(meta?.music || '')}
${String(meta?.level || '')}
${String(rawText || '')}`.toLowerCase();
  if (/waltz|vals|viennese/.test(blob)) return 'Waltz';
  if (/6\s*\/\s*8|3\s*\/\s*4/.test(blob)) return 'Waltz';
  return '8-count';
}

function parseCountCeiling(value) {
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const matches = [...raw.matchAll(/\d+/g)].map((match) => Number(match[0])).filter(Number.isFinite);
  return matches.length ? Math.max(...matches) : 0;
}

function buildPdfMarker(line, kindHint = '') {
  const cleaned = cleanPdfLine(line);
  const kind = /restart/i.test(cleaned) ? 'restart' : (/tag/i.test(cleaned) ? 'tag' : (kindHint || 'marker'));
  const label = cleaned || titleCaseWords(kind);
  return {
    counts: '',
    count: '',
    name: titleCaseWords(kind),
    description: label,
    foot: 'Either',
    marker: true,
    markerType: kind,
    rawLine: cleaned
  };
}

function autoSectionizeSteps(parsedSteps, size) {
  const steps = Array.isArray(parsedSteps) ? parsedSteps.slice() : [];
  const sectionSize = Math.max(1, Number(size) || 8);
  if (!steps.length) return [{ id: 'pdfsec_1', title: '', kind: 'section', steps: [] }];
  const sections = [];
  let current = { id: 'pdfsec_1', title: '', kind: 'section', steps: [] };
  let currentBoundary = sectionSize;
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i];
    current.steps.push(step);
    if (step && step.marker) continue;
    const ceiling = parseCountCeiling(step?.counts || step?.count || '');
    const countsText = String(step?.counts || step?.count || '');
    const reachedBoundary = current.steps.length > 0 && (
      ceiling >= currentBoundary ||
      new RegExp(`(?:^|\D)${currentBoundary}(?:\D|$)`).test(countsText)
    );
    const isLast = i === steps.length - 1;
    if ((reachedBoundary || isLast) && current.steps.length) {
      sections.push(current);
      currentBoundary += sectionSize;
      if (!isLast) current = { id: `pdfsec_${sections.length + 1}`, title: '', kind: 'section', steps: [] };
    }
  }
  if (current.steps.length && sections[sections.length - 1] !== current) sections.push(current);
  return sections.filter((section) => Array.isArray(section.steps) && section.steps.length);
}

function detectPdfSections(lines, parsedSteps, meta = {}, rawText = '') {
  const sections = [];
  let current = null;
  let stepCursor = 0;
  let sawExplicitSection = false;
  const sectionSplitPattern = /section/i;
  const partPattern = /^\s*part/i;
  const markerPattern = /(tag|restart)s?/i;
  const stepishPattern = /^(\d|[&])/.test.bind(/^(\d|[&])/);
  const namedStepPattern = /^((side|step|walk|rock|cross|behind|together|touch|tap|point|heel|toe|kick|shuffle|sailor|mambo|weave|vine|nightclub|lunge|lock|scissor|scissors|coaster|skate|pivot|turn|charleston|monterey|stomp|swivel|twinkle|roll|drag|brush|flick|hitch|run|slide|ball|hold|syncopated|wizard|diamond))/i;

  function ensureCurrent(kind = 'section', title = '') {
    if (!current) {
      current = { id: `pdfsec_${sections.length + 1}`, title: String(title || '').trim(), kind, steps: [] };
      sections.push(current);
    }
    return current;
  }

  function pushNewSection(kind = 'section', title = '') {
    current = { id: `pdfsec_${sections.length + 1}`, title: kind === 'part' ? String(title || '').trim() : '', kind, steps: [] };
    sections.push(current);
    return current;
  }

  for (const rawLine of lines) {
    const line = cleanPdfLine(rawLine);
    if (!line) continue;

    if (markerPattern.test(line)) {
      ensureCurrent();
      current.steps.push(buildPdfMarker(line));
      continue;
    }

    if (partPattern.test(line)) {
      sawExplicitSection = true;
      pushNewSection('part', line);
      continue;
    }

    if (sectionSplitPattern.test(line) && line.length <= 80) {
      sawExplicitSection = true;
      pushNewSection('section', '');
      continue;
    }

    const stepish = stepishPattern(line) || namedStepPattern.test(line);
    if (!stepish) continue;
    ensureCurrent();
    const step = parsedSteps[stepCursor] || parseStepLine(line, stepCursor);
    if (step) {
      current.steps.push(step);
      stepCursor += 1;
    }
  }

  if (!sections.length) {
    sections.push({ id: 'pdfsec_1', title: '', kind: 'section', steps: Array.isArray(parsedSteps) ? parsedSteps.slice() : [] });
  } else if (stepCursor < parsedSteps.length) {
    const tail = sections[sections.length - 1];
    tail.steps = tail.steps.concat(parsedSteps.slice(stepCursor));
  }

  const danceFeel = guessDanceFeel(meta, rawText);
  const phraseCounts = danceFeel === 'Waltz' ? 6 : 8;
  const explicitSections = sections
    .map((section, index) => ({
      id: `pdfsec_${index + 1}`,
      title: section.kind === 'part' ? String(section.title || '').trim() : '',
      kind: section.kind || 'section',
      steps: Array.isArray(section.steps) ? section.steps : []
    }))
    .filter((section) => section.steps.length);

  const normalizedSections = sawExplicitSection
    ? explicitSections
    : autoSectionizeSteps(parsedSteps, phraseCounts).map((section, index) => ({ ...section, id: `pdfsec_${index + 1}`, title: '' }));
  const normalizedPartCount = normalizedSections.filter((section) => section.kind === 'part').length;
  const sectionCount = normalizedSections.length;
  const tagCount = normalizedSections.reduce((sum, section) => sum + (Array.isArray(section.steps) ? section.steps.filter((step) => step && step.markerType === 'tag').length : 0), 0);
  const restartCount = normalizedSections.reduce((sum, section) => sum + (Array.isArray(section.steps) ? section.steps.filter((step) => step && step.markerType === 'restart').length : 0), 0);
  return {
    sections: normalizedSections,
    partCount: normalizedPartCount,
    sectionCount,
    tagCount,
    restartCount,
    danceType: normalizedPartCount > 0 ? 'Part dance' : 'Non part dance',
    danceFeel,
    phraseCounts
  };
}

function buildPdfImportLog(meta, sectionMeta) {
  return {
    danceType: sectionMeta.danceType,
    danceFeel: String(sectionMeta.danceFeel || '').trim(),
    smartSectionSize: String(sectionMeta.phraseCounts || '').trim(),
    sectionCount: sectionMeta.sectionCount,
    partCount: sectionMeta.partCount,
    counts: String(meta.count || meta.counts || '').trim(),
    walls: String(meta.wall || meta.walls || '').trim(),
    level: String(meta.level || '').trim(),
    choreographer: String(meta.choreographer || '').trim(),
    music: String(meta.music || '').trim(),
    tagCount: Number(sectionMeta.tagCount || 0),
    restartCount: Number(sectionMeta.restartCount || 0)
  };
}

function parsePdfTextToDance(rawText) {
  const text = String(rawText || '').replace(/\r/g, '');
  const lines = text.split('\n').map(cleanPdfLine).filter(Boolean);
  const title = lines[0] || 'Imported PDF';
  const joined = lines.join('\n');
  const meta = {
    title: cleanPdfLine(title),
    choreographer: '',
    music: '',
    level: '',
    count: '',
    counts: '',
    wall: '',
    walls: ''
  };
  for (const line of lines.slice(0, 24)) {
    let match = line.match(/^(?:choreographer|choreographed by)\s*[:.-]?\s*(.+)$/i);
    if (match && !meta.choreographer) meta.choreographer = cleanPdfLine(match[1]);
    match = line.match(/^(?:music|song)\s*[:.-]?\s*(.+)$/i);
    if (match && !meta.music) meta.music = cleanPdfLine(match[1]);
    match = line.match(/^(?:level)\s*[:.-]?\s*(.+)$/i);
    if (match && !meta.level) meta.level = cleanPdfLine(match[1]);
    match = line.match(/^(?:count|counts)\s*[:.-]?\s*(\d+)/i);
    if (match && !meta.count) meta.count = meta.counts = String(match[1]);
    match = line.match(/^(?:wall|walls)\s*[:.-]?\s*(\d+)/i);
    if (match && !meta.wall) meta.wall = meta.walls = String(match[1]);
  }
  if (!meta.count) {
    const match = joined.match(/(\d{1,3})\s*count/i);
    if (match) meta.count = meta.counts = String(match[1]);
  }
  if (!meta.wall) {
    const match = joined.match(/(\d{1,2})\s*wall/i);
    if (match) meta.wall = meta.walls = String(match[1]);
  }
  if (!meta.level) {
    const match = joined.match(/(absolute beginner|beginner|improver|intermediate|advanced)/i);
    if (match) meta.level = titleCaseWords(match[1]);
  }
  const steps = [];
  let inSteps = false;
  for (const line of lines) {
    if (/^(section|part)/i.test(line)) { inSteps = true; continue; }
    if (/^steps?/i.test(line)) { inSteps = true; continue; }
    if (!inSteps && /^(count|counts|wall|walls|level|music|song|choreographer|choreographed by)/i.test(line)) continue;
    if (!inSteps && line === title) continue;
    const stepish = /^(\d|[&])/.test(line) || /^((side|step|walk|rock|cross|behind|together|touch|tap|point|heel|toe|kick|shuffle|sailor|mambo|weave|vine|nightclub|lunge|lock|scissor|scissors|coaster|skate|pivot|turn|charleston|monterey|stomp|swivel|twinkle|roll|drag|brush|flick|hitch|run|slide|ball|hold|syncopated|wizard|diamond))/i.test(line);
    if (!stepish) continue;
    inSteps = true;
    const parsed = parseStepLine(line, steps.length);
    if (parsed) steps.push(parsed);
  }
  const sectionMeta = detectPdfSections(lines, steps, meta, text);
  return { ok: true, ...meta, title: meta.title || 'Imported PDF', steps, sections: sectionMeta.sections, importLog: buildPdfImportLog(meta, sectionMeta), danceType: sectionMeta.danceType, danceFeel: sectionMeta.danceFeel, phraseCounts: sectionMeta.phraseCounts, partCount: sectionMeta.partCount, sectionCount: sectionMeta.sectionCount, tagCount: sectionMeta.tagCount, restartCount: sectionMeta.restartCount };
}

async function enhanceParsedPdfDance(parsed, rawText) {
  const base = parsed && typeof parsed === 'object' ? JSON.parse(JSON.stringify(parsed)) : { ok: true, title: 'Imported PDF', steps: [] };
  if (!rawText || (!openaiClient && !geminiApiKey)) return base;
  const trimmedText = String(rawText || '').slice(0, 24000);
  const prompt = `Clean this imported line-dance PDF parse into strict JSON only. Keep it factual and based on the supplied text.\nReturn an object with keys: title, choreographer, music, level, count, counts, wall, walls, steps, sections, importLog, danceType, danceFeel, phraseCounts, partCount, sectionCount.\nEach step must be an object with keys: counts, count, name, description, foot.\nNever invent steps that are not supported by the PDF text. Merge broken lines when obvious.\nIf something is unknown, leave it as an empty string.\nPDF text:\n${trimmedText}\n\nCurrent heuristic parse:\n${JSON.stringify(base).slice(0, 12000)}`;
  try {
    const ai = await runSiteHelperAI({
      preferredModel: 'gemini',
      system: 'You repair imported line-dance worksheet data. Output JSON only. No markdown. No commentary.',
      prompt
    });
    const cleanedText = String(ai && ai.text || '').trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const repaired = JSON.parse(cleanedText);
    const merged = Object.assign({}, base, repaired || {});
    const safeSteps = Array.isArray(merged.steps) ? merged.steps : [];
    merged.steps = safeSteps.map((step, index) => ({
      counts: String(step && (step.counts || step.count) || index + 1).trim() || String(index + 1),
      count: String(step && (step.count || step.counts) || index + 1).trim() || String(index + 1),
      name: normalizeStepName(step && step.name, step && step.description),
      description: cleanPdfLine(step && (step.description || step.name) || ''),
      foot: inferFootFromPdfText(step && (step.description || step.name || step.foot) || '') || 'Either'
    })).filter(step => step.description);
    if (!merged.steps.length) merged.steps = base.steps || [];
    const fallbackSectionMeta = detectPdfSections(String(rawText || '').replace(/\r/g, '').split('\n').map(cleanPdfLine).filter(Boolean), merged.steps, merged, rawText);
    const aiSections = Array.isArray(merged.sections) ? merged.sections : [];
    merged.sections = aiSections.length ? aiSections.map((section, index) => ({
      id: `pdfsec_${index + 1}`,
      title: cleanPdfLine(section && (section.title || section.name) || ''),
      kind: /^part$/i.test(String(section && section.kind || '')) || /^part\b/i.test(String(section && (section.title || section.name) || '')) ? 'part' : 'section',
      steps: Array.isArray(section && section.steps) ? section.steps.map((step, stepIndex) => {
        if (step && (step.marker || step.markerType)) {
          return buildPdfMarker(step.rawLine || step.description || step.name || '', step.markerType || 'marker');
        }
        return {
          counts: String(step && (step.counts || step.count) || stepIndex + 1).trim() || String(stepIndex + 1),
          count: String(step && (step.count || step.counts) || stepIndex + 1).trim() || String(stepIndex + 1),
          name: normalizeStepName(step && step.name, step && step.description),
          description: cleanPdfLine(step && (step.description || step.name) || ''),
          foot: inferFootFromPdfText(step && (step.description || step.name || step.foot) || '') || 'Either'
        };
      }).filter(step => step.description) : []
    })) : fallbackSectionMeta.sections;
    merged.partCount = Number.isFinite(Number(merged.partCount)) ? Number(merged.partCount) : merged.sections.filter(section => section.kind === 'part').length;
    merged.sectionCount = Number.isFinite(Number(merged.sectionCount)) ? Number(merged.sectionCount) : merged.sections.length;
    merged.danceType = String(merged.danceType || (merged.partCount > 0 ? 'Part dance' : 'Non part dance')).trim() || 'Non part dance';
    merged.danceFeel = String(merged.danceFeel || fallbackSectionMeta.danceFeel || '').trim() || '8-count';
    merged.phraseCounts = Number.isFinite(Number(merged.phraseCounts)) ? Number(merged.phraseCounts) : Number(fallbackSectionMeta.phraseCounts || (merged.danceFeel === 'Waltz' ? 6 : 8));
    if (!merged.partCount) {
      merged.sections = autoSectionizeSteps(merged.steps, merged.phraseCounts).map((section, index) => ({ ...section, id: `pdfsec_${index + 1}`, title: '' }));
      merged.sectionCount = merged.sections.length;
      merged.partCount = merged.sections.filter(section => section.kind === 'part').length;
      merged.danceType = merged.partCount > 0 ? 'Part dance' : 'Non part dance';
    }
    merged.tagCount = Number.isFinite(Number(merged.tagCount)) ? Number(merged.tagCount) : merged.sections.reduce((sum, section) => sum + (Array.isArray(section.steps) ? section.steps.filter((step) => step && step.markerType === 'tag').length : 0), 0);
    merged.restartCount = Number.isFinite(Number(merged.restartCount)) ? Number(merged.restartCount) : merged.sections.reduce((sum, section) => sum + (Array.isArray(section.steps) ? section.steps.filter((step) => step && step.markerType === 'restart').length : 0), 0);
    merged.importLog = Object.assign({}, buildPdfImportLog(merged, { danceType: merged.danceType, danceFeel: merged.danceFeel, phraseCounts: merged.phraseCounts, partCount: merged.partCount, sectionCount: merged.sectionCount, tagCount: merged.tagCount, restartCount: merged.restartCount }), merged.importLog || {});
    merged.ok = true;
    merged.aiEnhanced = true;
    return merged;
  } catch (_) {
    return base;
  }
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

const SITE_HELP_CONTEXT = `You are the Step By Stepper AI site helper — a knowledgeable, friendly assistant for a line dance choreography editor. You are an expert in line dance terminology, step patterns, choreography structure, and every feature of this site.

SITE TABS & FEATURES:
• Build — Create and edit dance choreography step-by-step. Set dance title, counts, walls, type, and level. Add sections (Intro, Verse, Chorus, Tag, Bridge, Restart). Add steps with name, counts, foot, and description.
• Sheet — Clean, print-ready view of the dance. Import PDF stepsheets with the Import PDF button. Print or save-as-PDF to export.
• What's New — Site changelog with latest updates and features.
• My Saved Dances — Cloud saves linked to Google sign-in. Use Save Changes to push current dance to cloud. Auto-syncs in background when signed in.
• Featured Choreo — Public gallery of admin-featured dances with Bronze, Silver, and Gold badges.
• Sign In — Google authentication. Access to AI Dance Judge, Generate Counts, Apply for Moderator, Subscription management, Request glossary steps.
• Admin — Only for anthonytau4@gmail.com. Manages featured dances, submissions, moderator applications, glossary requests, site memory, user accounts.

KEY ACTIONS:
• Save Changes — Pushes current dance to cloud save (requires sign-in)
• Send to host for featuring — Submits dance for admin review for Featured Choreo
• Upload to site — Submits dance to admin moderation queue for site collection
• Import PDF — Parses PDF stepsheets and populates the editor
• AI Dance Judge — Scores flowability, suggests improvements, generates counts
• Community Glossary — Browse and apply admin-approved dance steps
• Phrasing Tools — Set up phrased dance structures (AABB, ABAB patterns)
• Undo/Redo — Ctrl+Z / Ctrl+Y (⌘Z / ⌘Shift+Z on Mac), 120-step history

KEYBOARD SHORTCUTS: Ctrl+Z (undo), Ctrl+Y / Ctrl+Shift+Z (redo), Ctrl+S (save when signed in), Tab (move fields), Enter (confirm), Escape (close panels).

PREMIUM (NZ$12.50/month or NZ$100/year): Full AI chat helper, AI dance building, AI dance judging, priority feature review, PRO badge.

LINE DANCE TERMINOLOGY (use these when discussing steps):
• Vine/Grapevine (4 counts) — Side-traveling: step side, cross behind, step side, touch
• Coaster Step (3 counts in 2 beats) — Step back, step together, step forward
• Jazz Box (4 counts) — Cross over, step back, step side, step forward
• Pivot Turn (2 counts) — Step forward, pivot half-turn
• Rock Step (2 counts) — Rock forward/back, recover weight
• Shuffle/Cha-Cha (3 counts in 2 beats) — Step, close, step
• Weave (4-8 counts) — Crossing steps front and behind while traveling sideways
• Kick Ball Change (3 counts in 2 beats) — Kick forward, ball, change weight
• Sailor Step (3 counts) — Cross behind, step side, step in place
• Monterey Turn (4 counts) — Point side, pivot turn, point side, step together
• Heel Touch/Dig — Touch heel forward, step back in place
• Stomp — Forceful step down with or without weight transfer
• Hitch — Lift knee up, foot off floor
• Flick — Quick backward kick, heel up behind
• Scuff — Brush heel forward along floor
• Slide — Gliding step to side, other foot meets it
• Cross — Step one foot across the other (front or behind)
• Touch — Tap toe/ball to floor without weight transfer
• Hip Bump — Hip movement to one side

DANCE LEVELS:
• Beginner: 16-32 counts, 2 or 4 walls, basic steps, no restarts/tags
• Intermediate: 32-64 counts, more complex steps, syncopation, tags, restarts
• Advanced: 48-96+ counts, intricate footwork, multiple restarts, phrased structures

RULES:
• Be specific, warm, and practical. Tell users the exact tab or button.
• Reference the community glossary steps when building or suggesting dances.
• When explaining dance steps, include counts and foot directions.
• If someone asks where to go, name the exact tab and button.
• Never invent features that don't exist.
• Never open with generic greetings. Just answer the question directly.
• Keep answers concise but complete. Use bullet points for lists.
• If asked to build a dance, ask for: name, counts, walls, level, and step pattern.`;

function fallbackSiteHelp(prompt, context = {}) {
  const q = String(prompt || '').toLowerCase();
  /* Saving */
  if (q.includes('save')) return context.signedIn ? 'Use the Save Changes button in My Saved Dances to push your dance to cloud save. It also auto-syncs while signed in.' : 'Sign in with Google first, then use Save Changes in My Saved Dances to save to the cloud. Your dance is also saved locally in your browser.';
  /* Featuring */
  if (q.includes('feature') || q.includes('featured')) return context.isAdmin ? 'Open Admin, find the dance, then press Bronze, Silver, or Gold to feature it. Remove feature there if you want it gone from Featured Choreo.' : 'Sign in, then use Send to host for featuring. The admin reviews it and can award Bronze 🥉, Silver 🥈, or Gold 🥇 badges. Premium members get priority review.';
  /* Upload */
  if (q.includes('upload')) return 'Sign in, then use Upload to site. That sends the current dance into the admin review queue for the site collection.';
  /* Admin */
  if (q.includes('admin')) return 'The Admin tab only appears for anthonytau4@gmail.com after Google sign-in. It manages featured dances, submissions, moderator applications, glossary requests, and user accounts.';
  /* Sign in */
  if (q.includes('sign in') || q.includes('google') || q.includes('login')) return 'Open the Sign In tab and press Sign in with Google. Once signed in, you can save to cloud, submit for featuring, use AI tools, and apply for moderator.';
  /* Saved dances */
  if (q.includes('saved')) return 'Use My Saved Dances for your saved items, and Save Changes to push the current one to cloud save. Dances are listed by most recently updated.';
  /* PDF import */
  if (q.includes('pdf') || q.includes('import')) return 'On the Sheet tab, click the Import PDF button (bottom-right). Drop or select your PDF stepsheet, review the extracted steps, then click Apply to Editor to populate the dance.';
  /* Glossary */
  if (q.includes('glossary')) return 'The Community Glossary has admin-approved dance steps. Click Glossary+ in the Build tab to browse and apply them. Request new steps from the Sign In tab.';
  /* Premium */
  if (q.includes('premium') || q.includes('subscription') || q.includes('upgrade')) return 'Premium is NZ$12.50/month or NZ$100/year. Benefits: full AI chat helper, AI dance building and judging, priority feature review, and a PRO badge. Go to Sign In → Subscription.';
  /* Moderator */
  if (q.includes('moderator')) return 'Sign in with Google, then use Apply for moderator in the Sign In tab. Approved moderators help review featured dance submissions.';
  /* Undo/redo */
  if (q.includes('undo')) return 'Press Ctrl+Z (⌘Z on Mac) to undo. The history holds up to 120 steps.';
  if (q.includes('redo')) return 'Press Ctrl+Y or Ctrl+Shift+Z (⌘Shift+Z on Mac) to redo.';
  /* Dark mode */
  if (q.includes('dark') || q.includes('theme')) return 'Toggle dark/light mode using the theme button (🌙/☀️) in the navigation bar.';
  /* Steps/terminology */
  if (q.includes('vine') || q.includes('grapevine')) return 'Vine (Grapevine): A 4-count side-traveling step. Step side, cross behind, step side, touch. Can go left or right.';
  if (q.includes('coaster')) return 'Coaster Step: A 3-count step (in 2 beats): step back, step together, step forward. Smooth direction change.';
  if (q.includes('jazz box')) return 'Jazz Box: A 4-count step: cross over, step back, step side, step forward. Creates a box pattern.';
  if (q.includes('pivot')) return 'Pivot Turn: A 2-count turning step: step forward, pivot 180° on both feet.';
  if (q.includes('shuffle') || q.includes('cha cha')) return 'Shuffle (Cha-Cha): A 3-count step in 2 beats: step, close, step. Can travel forward, back, or sideways.';
  /* Shortcuts */
  if (q.includes('shortcut') || q.includes('keyboard') || q.includes('hotkey')) return 'Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y / Ctrl+Shift+Z (redo), Ctrl+S (save), Tab (move fields), Enter (confirm), Escape (close panels).';
  /* Troubleshooting */
  if (q.includes('not working') || q.includes('broken') || q.includes('error') || q.includes('bug')) return 'Try refreshing the page (Ctrl+R), clearing browser cache, or signing out and back in. For persistent issues, try a different browser.';
  /* Help */
  if (q.includes('help') || q.includes('what can')) return 'I can help with: building dances, saving, featuring, PDF import, AI tools, dance terminology, keyboard shortcuts, and troubleshooting. Just ask!';
  /* Navigation */
  if (q.includes('tab') || q.includes('where') || q.includes('navigate')) return 'Tabs: Build (create/edit), Sheet (preview/print/PDF import), What\'s New (changelog), My Saved Dances (cloud saves), Featured Choreo (public gallery), Sign In (auth/AI/subscription).';
  /* Default */
  return 'Use Build to make or edit a dance, Sheet to preview and print, Save Changes at the top to keep it, Sign In for Google saving and AI tools, My Saved Dances for your saved work, and Featured Choreo to browse featured dances.';
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
    const bucket = touchUser(db, profile, userKey);
    assertNotSuspended(bucket, profile);
    await writeDb(db);
    res.json({ ok: true, profile, displayName: bucket.displayName || "", isAdmin: isAdminProfile(profile, db) || String(bucket?.role || '').trim().toLowerCase() === 'admin', isModerator: isModeratorBucket(bucket), role: getRoleForBucket(bucket, profile), onlineCount: getOnlineUsers(db).length, membership: bucket?.membership || getUserMembership(null, profile), suspension: suspensionPayload(bucket) });
  } catch (error) {
    res.status(error.status || 401).json({ ok: false, error: error?.message || "Google sign-in failed." });
  }
});

app.get("/api/auth/me", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const bucket = touchUser(db, req.stepperUser, userKeyFromClaims(req.stepperClaims));
  assertNotSuspended(bucket, req.stepperUser);
  await writeDb(db);
  res.json({ ok: true, profile: req.stepperUser, displayName: bucket.displayName || "", isAdmin: isAdminProfile(req.stepperUser, db) || String(bucket?.role || '').trim().toLowerCase() === 'admin', isModerator: isModeratorBucket(bucket), role: getRoleForBucket(bucket, req.stepperUser), onlineCount: getOnlineUsers(db).length, membership: bucket?.membership || getUserMembership(null, req.stepperUser), suspension: suspensionPayload(bucket) });
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
  res.json({ ok: true, onlineCount: onlineUsers.length, members: onlineUsers, isAdmin: isAdminProfile(req.stepperUser, db) || String(bucket?.role || '').trim().toLowerCase() === 'admin', isModerator: isModeratorBucket(bucket), role: getRoleForBucket(bucket, req.stepperUser), suspension: suspensionPayload(bucket) });
});



app.post('/api/pdf/parse', async (req, res) => {
  try {
    const pdfBase64 = String(req.body?.fileBase64 || '').trim();
    const filename = String(req.body?.filename || 'stepsheet.pdf').trim();
    const buffer = decodeBase64Pdf(pdfBase64);
    if (!buffer.length) return res.status(400).json({ ok:false, error:'Missing PDF file data.' });
    if (buffer.length > 10 * 1024 * 1024) return res.status(413).json({ ok:false, error:'PDF file is too large. Max 10MB.' });
    if (!/\.pdf$/i.test(filename)) return res.status(400).json({ ok:false, error:'Please upload a PDF file.' });
    const text = await extractPdfText(buffer);
    if (!text) return res.status(422).json({ ok:false, error:'Could not extract readable text from that PDF.' });
    const parsed = await enhanceParsedPdfDance(parsePdfTextToDance(text), text);
    parsed.sourceTextLength = text.length;
    parsed.filename = filename;
    return res.json(parsed);
  } catch (error) {
    return res.status(error.status || 500).json({ ok:false, error: error?.message || 'Could not parse that PDF.' });
  }
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

/* ═══════════════════════════════════════════════════════════
   COLLABORATOR ENDPOINTS
   ═══════════════════════════════════════════════════════════ */
app.post("/api/collaborators/invite", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const danceId = String(req.body?.danceId || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!danceId) return res.status(400).json({ ok: false, error: "Missing dance ID." });
  if (!email || email.length > 254 || email.indexOf("@") < 1 || email.indexOf("@") !== email.lastIndexOf("@") || email.indexOf(".") < 3) return res.status(400).json({ ok: false, error: "Invalid email address." });
  if (email === normalizeEmail(req.stepperUser?.email)) return res.status(400).json({ ok: false, error: "You can't invite yourself." });
  if (!db.collaborators) db.collaborators = [];
  const existing = db.collaborators.find(c => c && c.danceId === danceId && c.email === email && c.ownerKey === key);
  if (existing) return res.json({ ok: true, message: "Already invited.", item: existing });
  const invite = {
    id: `collab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    danceId,
    ownerKey: key,
    ownerEmail: normalizeEmail(req.stepperUser?.email),
    ownerName: String(req.stepperUser?.name || "").trim(),
    email,
    name: "",
    status: "invited",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.collaborators.push(invite);
  db.collaborators = db.collaborators.slice(-2000);
  await writeDb(db);
  res.json({ ok: true, message: "Invite sent.", item: invite });
});

app.get("/api/collaborators", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const email = normalizeEmail(req.stepperUser?.email);
  const danceId = String(req.query?.danceId || "").trim();
  const list = Array.isArray(db.collaborators) ? db.collaborators : [];
  const filtered = list.filter(c => {
    if (!c) return false;
    if (danceId && c.danceId !== danceId) return false;
    return c.ownerKey === key || c.email === email;
  });
  res.json({ ok: true, items: filtered });
});

app.post("/api/collaborators/respond", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const email = normalizeEmail(req.stepperUser?.email);
  const inviteId = String(req.body?.inviteId || "").trim();
  const accept = req.body?.accept === true;
  if (!db.collaborators) db.collaborators = [];
  const invite = db.collaborators.find(c => c && c.id === inviteId && c.email === email);
  if (!invite) return res.status(404).json({ ok: false, error: "Invite not found." });
  invite.status = accept ? "accepted" : "declined";
  invite.name = String(req.stepperUser?.name || invite.name || "").trim();
  invite.updatedAt = new Date().toISOString();
  await writeDb(db);
  res.json({ ok: true, item: invite });
});

/* ═══════════════════════════════════════════════════════════
   FRIENDS ENDPOINTS (no dance ID required)
   ═══════════════════════════════════════════════════════════ */
app.post("/api/friends/add", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!email || email.length > 254 || email.indexOf("@") < 1 || email.indexOf("@") !== email.lastIndexOf("@") || email.indexOf(".") < 3)
    return res.status(400).json({ ok: false, error: "Invalid email address." });
  if (email === normalizeEmail(req.stepperUser?.email))
    return res.status(400).json({ ok: false, error: "You can't add yourself as a friend." });
  if (!db.friends) db.friends = [];
  const existing = db.friends.find(f => f && f.fromKey === key && f.toEmail === email);
  if (existing) return res.json({ ok: true, message: "Already sent a friend request.", item: existing });
  const item = {
    id: `friend-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fromKey: key,
    fromEmail: normalizeEmail(req.stepperUser?.email),
    fromName: String(db.users[key]?.displayName || req.stepperUser?.name || "").trim(),
    toEmail: email,
    toName: "",
    status: "invited",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.friends.push(item);
  db.friends = db.friends.slice(-5000);
  await writeDb(db);
  res.json({ ok: true, message: "Friend request sent!", item });
});

app.get("/api/friends/list", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const email = normalizeEmail(req.stepperUser?.email);
  const list = Array.isArray(db.friends) ? db.friends : [];
  const lookupDisplayName = (userKey, userEmail) => {
    if (userKey && db.users[userKey]?.displayName) return db.users[userKey].displayName;
    const normalized = normalizeEmail(userEmail);
    const found = Object.values(db.users || {}).find(b => normalizeEmail(b?.profile?.email) === normalized);
    return found?.displayName || "";
  };
  const items = list.filter(f => f && (f.fromKey === key || f.toEmail === email)).map(f => {
    const isSender = f.fromKey === key;
    return Object.assign({}, f, {
      direction: isSender ? "sent" : "received",
      fromDisplayName: lookupDisplayName(f.fromKey, f.fromEmail),
      toDisplayName: lookupDisplayName("", f.toEmail)
    });
  });
  res.json({ ok: true, items });
});

app.post("/api/friends/respond", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const email = normalizeEmail(req.stepperUser?.email);
  const friendId = String(req.body?.friendId || "").trim();
  const accept = req.body?.accept === true;
  if (!db.friends) db.friends = [];
  const item = db.friends.find(f => f && f.id === friendId && f.toEmail === email);
  if (!item) return res.status(404).json({ ok: false, error: "Friend request not found." });
  item.status = accept ? "accepted" : "declined";
  item.toName = String(req.stepperUser?.name || item.toName || "").trim();
  item.updatedAt = new Date().toISOString();
  await writeDb(db);
  res.json({ ok: true, item });
});

app.post("/api/friends/remove", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const email = normalizeEmail(req.stepperUser?.email);
  const friendId = String(req.body?.friendId || "").trim();
  if (!db.friends) db.friends = [];
  const idx = db.friends.findIndex(f => f && f.id === friendId && (f.fromKey === key || f.toEmail === email));
  if (idx === -1) return res.status(404).json({ ok: false, error: "Friend not found." });
  db.friends.splice(idx, 1);
  await writeDb(db);
  res.json({ ok: true, removedId: friendId });
});

/* ═══════════════════════════════════════════════════════════
   FRIEND CHAT ENDPOINTS
   ═══════════════════════════════════════════════════════════ */
app.get("/api/friends/chat", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const email = normalizeEmail(req.stepperUser?.email);
  const friendId = String(req.query?.friendId || "").trim();
  if (!friendId) return res.status(400).json({ ok: false, error: "Missing friendId." });
  if (!db.friends) db.friends = [];
  const friendship = db.friends.find(f => f && f.id === friendId && f.status === "accepted" && (f.fromKey === key || f.toEmail === email));
  if (!friendship) return res.status(403).json({ ok: false, error: "You are not friends with this person." });
  if (!db.friendChat) db.friendChat = [];
  const messages = db.friendChat
    .filter(m => m && m.friendshipId === friendId)
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  res.json({ ok: true, messages });
});

app.post("/api/friends/chat", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const email = normalizeEmail(req.stepperUser?.email);
  const friendId = String(req.body?.friendId || "").trim();
  const text = String(req.body?.text || "").trim();
  if (!friendId) return res.status(400).json({ ok: false, error: "Missing friendId." });
  if (!text) return res.status(400).json({ ok: false, error: "Message text is required." });
  if (!db.friends) db.friends = [];
  const friendship = db.friends.find(f => f && f.id === friendId && f.status === "accepted" && (f.fromKey === key || f.toEmail === email));
  if (!friendship) return res.status(403).json({ ok: false, error: "You are not friends with this person." });
  if (!db.friendChat) db.friendChat = [];
  const item = {
    id: `fchat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    friendshipId: friendId,
    senderKey: key,
    senderEmail: email,
    senderName: String(req.stepperUser?.name || "").trim(),
    text: text.slice(0, 4000),
    createdAt: new Date().toISOString()
  };
  db.friendChat.push(item);
  db.friendChat = db.friendChat.slice(-10000);
  await writeDb(db);
  const messages = db.friendChat
    .filter(m => m && m.friendshipId === friendId)
    .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  res.json({ ok: true, messages });
});

/* ── Display Name endpoints ── */

app.get("/api/user/display-name", requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = db.users[key] || {};
  res.json({ ok: true, displayName: bucket.displayName || "" });
});

app.post("/api/user/display-name", requireGoogleUser, async (req, res) => {
  const raw = String(req.body?.displayName || "").trim();
  if (!raw || raw.length < 2) return res.status(400).json({ ok: false, error: "Display name must be at least 2 characters." });
  if (raw.length > 30) return res.status(400).json({ ok: false, error: "Display name must be 30 characters or fewer." });
  if (/[<>"'&\\\/]/.test(raw)) return res.status(400).json({ ok: false, error: "Display name contains disallowed characters." });
  const displayName = raw;
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const lowerName = displayName.toLowerCase();
  const taken = Object.entries(db.users || {}).some(([k, bucket]) => {
    if (k === key) return false;
    return String(bucket?.displayName || "").trim().toLowerCase() === lowerName;
  });
  if (taken) return res.status(409).json({ ok: false, error: "That display name is already taken. Please choose another." });
  db.users[key].displayName = displayName;
  await writeDb(db);
  res.json({ ok: true, displayName });
});

app.get("/api/user/check-display-name", requireGoogleUser, async (req, res) => {
  const raw = String(req.query?.name || "").trim();
  if (!raw) return res.json({ ok: true, available: false, error: "Name is empty." });
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const lowerName = raw.toLowerCase();
  const taken = Object.entries(db.users || {}).some(([k, bucket]) => {
    if (k === key) return false;
    return String(bucket?.displayName || "").trim().toLowerCase() === lowerName;
  });
  res.json({ ok: true, available: !taken });
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
        moderatorVoteSummary: summarizeModeratorVotes(item),
        source
      };
    })
    .sort((a, b) => {
      const ap = a?.priority ? 1 : 0;
      const bp = b?.priority ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });
  res.json({ ok: true, items, pendingInvites: (Array.isArray(db.pendingModeratorInvites) ? db.pendingModeratorInvites.slice().sort((a,b)=> new Date(b.invitedAt||0)-new Date(a.invitedAt||0)) : []) });
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
  db.submissions = (Array.isArray(db.submissions) ? db.submissions : []).filter(row => row && row.id !== id);
  await writeDb(db);
  res.json({ ok: true, removedId: id, item });
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
  db.submissions = (Array.isArray(db.submissions) ? db.submissions : []).filter(row => row && row.id !== id);
  await writeDb(db);
  res.json({ ok: true, removedId: id, item });
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
  const resolvedIds = new Set(touched.map(item => String(item?.id || '').trim()).filter(Boolean));
  pushNotification(db, { userKey: source.ownerKey, email: source.ownerEmail }, {
    kind: 'Featured',
    title: 'Your dance was featured',
    message: buildFeatureSummary(source, badgeLabel)
  });
  db.submissions = (Array.isArray(db.submissions) ? db.submissions : []).filter(item => !resolvedIds.has(String(item?.id || '').trim()));
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


app.get('/api/moderator/application-status', requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = touchUser(db, req.stepperUser, key);
  const pending = (Array.isArray(db.moderatorApplications) ? db.moderatorApplications : []).find(item => String(item?.ownerKey || '').trim() === key && String(item?.status || '').trim() === 'pending');
  await writeDb(db);
  res.json({ ok: true, status: isAdminProfile(req.stepperUser) ? 'admin' : isModeratorBucket(bucket) ? 'approved' : pending ? 'pending' : 'none', pending: !!pending, isModerator: isModeratorBucket(bucket), isAdmin: isAdminProfile(req.stepperUser), canApply: !isAdminProfile(req.stepperUser) && !isModeratorBucket(bucket) && !pending });
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
  const db = pruneDbState(await readDb());
  const items = (Array.isArray(db.moderatorApplications) ? db.moderatorApplications : [])
    .filter(item => String(item?.status || 'pending') === 'pending')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
  res.json({ ok: true, items, pending: (Array.isArray(db.pendingSuspensions) ? db.pendingSuspensions.slice().sort((a,b)=> new Date(b.startedAt||0)-new Date(a.startedAt||0)) : []).map(item => ({ userKey: '', email: String(item.email || '').trim(), name: String(item.name || item.email || '').trim(), suspension: { reason: String(item.reason || '').trim(), untilAt: String(item.untilAt || '').trim() || null, startedAt: String(item.startedAt || '').trim() || null, durationLabel: String(item.durationLabel || '').trim() || null, byEmail: String(item.byEmail || '').trim() || null, active: true }, pending: true })) });
});

app.post('/api/admin/moderator-applications/:id/approve', requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || '').trim();
  const item = (Array.isArray(db.moderatorApplications) ? db.moderatorApplications : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok: false, error: 'Moderator request not found.' });
  const bucket = db.users[item.ownerKey] && typeof db.users[item.ownerKey] === 'object' ? db.users[item.ownerKey] : null;
  if (!bucket) return res.status(404).json({ ok: false, error: 'User account no longer exists.' });
  bucket.role = 'moderator';
  bucket.membership = getUserMembership({ ...bucket, role: 'moderator' }, bucket.profile);
  db.users[item.ownerKey] = { ...bucket, membership: getUserMembership({ ...bucket, role: 'moderator' }, bucket.profile), role: 'moderator' };
  upsertModeratorRegistryEntry(db, { email: bucket?.profile?.email, userKey: item.ownerKey, name: String(bucket?.profile?.name || bucket?.profile?.email || '').trim(), addedByEmail: String(req.stepperUser?.email || '').trim(), addedByName: String(req.stepperUser?.name || req.stepperUser?.email || '').trim() });
  db.moderatorApplications = (Array.isArray(db.moderatorApplications) ? db.moderatorApplications : []).filter(row => row && row.id !== id);
  removePendingModeratorInvite(db, bucket.profile?.email);
  pushNotification(db, { userKey: item.ownerKey, email: item.ownerEmail }, {
    kind: 'Moderator',
    title: 'Moderator request approved',
    message: 'You now have moderator access and the premium helper perks, without the Admin tab.'
  });
  await writeDb(db);
  res.json({ ok: true });
});

app.post('/api/admin/moderator-applications/:id/decline', requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || '').trim();
  const item = (Array.isArray(db.moderatorApplications) ? db.moderatorApplications : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok: false, error: 'Moderator request not found.' });
  db.moderatorApplications = (Array.isArray(db.moderatorApplications) ? db.moderatorApplications : []).filter(row => row && row.id !== id);
  pushNotification(db, { userKey: item.ownerKey, email: item.ownerEmail }, {
    kind: 'Moderator',
    title: 'Moderator request declined',
    message: 'The admin declined your moderator request this time.'
  });
  await writeDb(db);
  res.json({ ok: true });
});


app.get('/api/admin/power-tools', requireAdmin, async (_req, res) => {
  const db = pruneDbState(await readDb());
  const users = db.users && typeof db.users === 'object' ? Object.values(db.users).filter(Boolean) : [];
  const moderators = Array.isArray(db.moderatorRegistry) ? db.moderatorRegistry.length : users.filter(bucket => isModeratorBucket(bucket)).length;
  const barred = users.filter(bucket => !!getActiveSuspension(bucket, bucket?.profile)).length;
  const pendingBars = Array.isArray(db.pendingSuspensions) ? db.pendingSuspensions.length : 0;
  const pendingInvites = Array.isArray(db.pendingModeratorInvites) ? db.pendingModeratorInvites.length : 0;
  const pendingApplications = Array.isArray(db.moderatorApplications) ? db.moderatorApplications.filter(item => String(item?.status || 'pending') === 'pending').length : 0;
  const pendingSubmissions = Array.isArray(db.submissions) ? db.submissions.filter(item => String(item?.status || 'pending') === 'pending').length : 0;
  await writeDb(db);
  res.json({ ok: true, summary: { users: users.length, moderators, barred, pendingBars, pendingInvites, pendingApplications, pendingSubmissions } });
});

app.get('/api/admin/moderators', requireAdmin, async (_req, res) => {
  const db = await readDb();
  const list = Array.isArray(db.moderatorRegistry) ? db.moderatorRegistry : [];
  const items = list.map((entry) => {
    const email = normalizeEmail(entry?.email);
    const userKey = String(entry?.userKey || findUserKeyByEmail(db, email) || '').trim();
    const bucket = userKey ? db.users?.[userKey] : null;
    return {
      userKey,
      email,
      name: String(bucket?.profile?.name || entry?.name || email).trim(),
      role: 'moderator',
      addedAt: String(entry?.addedAt || '').trim() || null,
      lastSeenAt: bucket?.lastSeenAt || null
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
  res.json({ ok: true, items });
});

app.post('/api/admin/moderators/add', requireAdmin, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ ok: false, error: 'Enter a Google email address.' });
  if (email === adminEmail) return res.status(400).json({ ok: false, error: 'That Google account is already the admin.' });
  const db = await readDb();
  const userKey = findUserKeyByEmail(db, email);
  const bucket = userKey && db.users[userKey] && typeof db.users[userKey] === 'object' ? db.users[userKey] : null;
  if (!bucket) {
    const invite = upsertPendingModeratorInvite(db, {
      email,
      name: String(req.body?.name || email).trim(),
      invitedBy: req.stepperUser,
      note: 'Admin granted moderator access before first sign-in.'
    });
    await writeDb(db);
    return res.json({ ok: true, pending: true, item: { userKey: '', email, name: String(invite?.name || email).trim(), role: 'moderator-pending' } });
  }
  bucket.role = 'moderator';
  bucket.membership = getUserMembership({ ...bucket, role: 'moderator' }, bucket.profile);
  db.users[userKey] = { ...bucket, role: 'moderator', membership: bucket.membership };
  upsertModeratorRegistryEntry(db, { email, userKey, name: String(bucket.profile?.name || email).trim(), addedByEmail: String(req.stepperUser?.email || '').trim(), addedByName: String(req.stepperUser?.name || req.stepperUser?.email || '').trim() });
  removePendingModeratorInvite(db, email);
  pushNotification(db, { userKey, email }, {
    kind: 'Moderator',
    title: 'Moderator access granted',
    message: 'Admin added moderator access to your account.'
  });
  await writeDb(db);
  res.json({ ok: true, item: { userKey, email, name: String(bucket.profile?.name || email).trim(), role: 'moderator' } });
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
  removeModeratorRegistryEntry(db, bucket?.profile?.email);
  pushNotification(db, { userKey, email: bucket.profile?.email }, {
    kind: 'Moderator',
    title: 'Moderator access removed',
    message: `You were removed as moderator because: ${note || 'No admin reason was supplied.'}`
  });
  await writeDb(db);
  res.json({ ok: true });
});


app.post('/api/admin/moderators/remove-by-email', requireAdmin, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ ok: false, error: 'Enter a Google email address.' });
  const db = await readDb();
  const removed = removePendingModeratorInvite(db, email);
  removeModeratorRegistryEntry(db, email);
  if (!removed) return res.status(404).json({ ok: false, error: 'Pending moderator invite not found.' });
  await writeDb(db);
  res.json({ ok: true, email });
});

app.get('/api/admin/suspensions', requireAdmin, async (_req, res) => {
  const db = pruneDbState(await readDb());
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
  const untilAt = new Date(Date.now() + durationMs).toISOString();
  if (!bucket) {
    const pending = upsertPendingSuspension(db, {
      email,
      reason: reason || 'an admin decision',
      durationLabel,
      startedAt: new Date().toISOString(),
      untilAt,
      byEmail: String(req.stepperUser?.email || '').trim(),
      byName: String(req.stepperUser?.name || req.stepperUser?.email || '').trim()
    });
    await writeDb(db);
    return res.json({ ok: true, pending: true, item: { userKey: '', email, name: email, suspension: suspensionPayload({ suspension: pending }) } });
  }
  bucket.suspension = {
    startedAt: new Date().toISOString(),
    untilAt,
    reason: reason || 'an admin decision',
    durationLabel,
    byEmail: String(req.stepperUser?.email || '').trim()
  };
  db.users[userKey] = bucket;
  removePendingSuspension(db, email);
  pushNotification(db, { userKey, email }, {
    kind: 'Suspension',
    title: 'You were barred',
    message: `You have been barred for ${durationLabel} long because of ${reason || 'an admin decision'}`
  });
  await writeDb(db);
  res.json({ ok: true, item: { userKey, email, name: String(bucket.profile?.name || email).trim(), suspension: suspensionPayload(bucket) } });
});


app.post('/api/admin/suspensions/remove-by-email', requireAdmin, async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) return res.status(400).json({ ok: false, error: 'Enter a Google email address.' });
  const db = await readDb();
  const removed = removePendingSuspension(db, email);
  if (!removed) return res.status(404).json({ ok: false, error: 'Pending bar not found.' });
  await writeDb(db);
  res.json({ ok: true, email });
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

app.post('/api/security-alerts/strike', requireGoogleUser, async (req, res) => {
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
        moderatorVoteSummary: summarizeModeratorVotes(item),
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
  const reviewerEmail = normalizeEmail(req.stepperUser?.email);
  const reviewerName = String(req.stepperUser?.name || req.stepperUser?.email || '').trim();
  const reviewedAt = new Date().toISOString();
  if (!Array.isArray(item.moderatorVotes)) item.moderatorVotes = [];
  item.moderatorVotes = item.moderatorVotes.filter(vote => normalizeEmail(vote?.email) !== reviewerEmail);
  item.moderatorVotes.push({
    email: reviewerEmail,
    name: reviewerName,
    decision,
    note,
    at: reviewedAt
  });
  const summary = summarizeModeratorVotes(item);
  item.moderatorApproved = decision === 'approve';
  item.moderatorReviewStatus = decision === 'approve' ? 'approved' : 'disapproved';
  item.moderatorApprovedAt = reviewedAt;
  item.moderatorApprovedBy = {
    email: reviewerEmail,
    name: reviewerName
  };
  item.moderatorNote = note;
  item.moderatorVoteSummary = summary;
  item.updatedAt = reviewedAt;
  await writeDb(db);
  res.json({ ok: true, item, moderatorVoteSummary: summary });
});

app.get('/api/subscription/status', requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  const bucket = touchUser(db, req.stepperUser, key);
  await writeDb(db);
  const membership = getUserMembership(bucket, req.stepperUser);
  res.json({ ok: true, ...membership, role: getRoleForBucket(bucket, req.stepperUser), isModerator: isModeratorBucket(bucket), stripeEnabled: !!stripeSecretKey, stripePublishableKey, suspension: suspensionPayload(bucket) });
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


app.get('/api/glossary/steps', async (_req, res) => {
  const db = await readDb();
  const items = (Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps : []).slice().sort((a,b)=> String(a?.name || '').localeCompare(String(b?.name || '')));
  res.json({ ok:true, items });
});

app.post('/api/glossary/auto-add', requireGoogleUser, async (req, res) => {
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const steps = Array.isArray(req.body?.steps) ? req.body.steps : [];
  if (!steps.length) return res.status(400).json({ ok:false, error:'No steps were supplied.' });
  const approved = Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps : [];
  const seen = new Set(approved.map(step => `${String(step?.name || '').trim().toLowerCase()}::${String(step?.description || '').trim().toLowerCase()}`));
  const additions = [];
  for (const raw of steps.slice(0, 80)) {
    const normalized = normalizeGlossaryStepPayload({
      name: String(raw?.name || '').trim(),
      description: String(raw?.description || raw?.name || '').trim(),
      counts: String(raw?.counts || raw?.count || '1').trim() || '1',
      foot: String(raw?.foot || 'Either').trim() || 'Either',
      tags: String(raw?.tags || req.body?.tags || 'Imported PDF').trim()
    }, { email:req.stepperUser.email, name:req.stepperUser.name });
    const dedupeKey = `${String(normalized?.name || '').trim().toLowerCase()}::${String(normalized?.description || '').trim().toLowerCase()}`;
    if (!normalized.name || !normalized.description || seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    normalized.source = 'pdf-import';
    normalized.ownerKey = key;
    additions.push(normalized);
  }
  if (!additions.length) return res.json({ ok:true, added:0, items: [] });
  db.approvedGlossarySteps = [...additions, ...approved].slice(0, 4000);
  await writeDb(db);
  res.json({ ok:true, added:additions.length, items:additions });
});

app.post('/api/glossary/request', requireGoogleUser, async (req, res) => {
  const raw = req.body?.step && typeof req.body.step === 'object' ? req.body.step : {};
  const name = String(raw.name || '').trim();
  const description = String(raw.description || raw.desc || '').trim();
  if (!name || !description) return res.status(400).json({ ok:false, error:'Step name and description are required.' });
  const requestType = String(raw.requestType || '').trim().toLowerCase() === 'edit' ? 'edit' : 'new';
  const db = await readDb();
  const key = userKeyFromClaims(req.stepperClaims);
  touchUser(db, req.stepperUser, key);
  const item = {
    id: createId('glossary_request'),
    ownerKey: key,
    ownerEmail: req.stepperUser.email,
    ownerName: req.stepperUser.name,
    requestType,
    originalStepId: String(raw.originalStepId || '').trim().slice(0, 120),
    originalName: String(raw.originalName || '').trim().slice(0, 120),
    originalDescription: String(raw.originalDescription || '').trim().slice(0, 1200),
    originalCounts: String(raw.originalCounts || '').trim().slice(0, 40),
    originalFoot: String(raw.originalFoot || '').trim().slice(0, 24),
    originalTags: String(raw.originalTags || '').trim().slice(0, 240),
    name: name.slice(0, 120),
    description: description.slice(0, 1200),
    counts: String(raw.counts || raw.count || '1').trim().slice(0, 40) || '1',
    foot: String(raw.foot || 'Either').trim().slice(0, 24) || 'Either',
    tags: String(raw.tags || '').trim().slice(0, 240),
    autoMirror: requestType === 'new' ? buildGlossaryTwin(raw) : null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.glossaryRequests = [item, ...(Array.isArray(db.glossaryRequests) ? db.glossaryRequests : [])].slice(0, 1000);
  await writeDb(db);
  res.json({ ok:true, item, message: requestType === 'edit' ? 'Glossary edit suggestion sent to Admin.' : 'Glossary step request sent to Admin.' });
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
  let additions = [];
  let updatedStep = null;
  if (String(item.requestType || '') === 'edit') {
    const approvedList = Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps : [];
    const existing = approvedList.find((step) => String(step?.id || '') === String(item.originalStepId || ''))
      || approvedList.find((step) => String(step?.name || '').trim().toLowerCase() === String(item.originalName || '').trim().toLowerCase());
    if (!existing) return res.status(404).json({ ok:false, error:'The original glossary step could not be found for this edit suggestion.' });
    existing.name = String(item.name || existing.name || '').trim().slice(0, 120);
    existing.description = String(item.description || existing.description || '').trim().slice(0, 1200);
    existing.counts = String(item.counts || existing.counts || '1').trim().slice(0, 40) || '1';
    existing.foot = String(item.foot || existing.foot || 'Either').trim().slice(0, 24) || 'Either';
    existing.tags = String(item.tags || existing.tags || '').trim().slice(0, 240);
    existing.updatedAt = new Date().toISOString();
    existing.updatedBy = { email: req.stepperUser.email, name: req.stepperUser.name };
    existing.sourceRequestId = item.id;
    updatedStep = existing;
  } else {
    const approved = normalizeGlossaryStepPayload(item, { email:item.ownerEmail, name:item.ownerName });
    approved.status = 'approved';
    approved.sourceRequestId = item.id;
    additions = [approved];
    if (item.autoMirror) {
      const twin = normalizeGlossaryStepPayload({ ...item.autoMirror, counts:item.autoMirror.counts || item.counts, tags:item.autoMirror.tags || item.tags }, { email:item.ownerEmail, name:item.ownerName });
      twin.status = 'approved';
      twin.sourceRequestId = item.id;
      twin.isAutoMirror = true;
      additions.push(twin);
    }
    db.approvedGlossarySteps = [...additions, ...(Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps : [])].slice(0, 4000);
  }
  pushNotification(db, { userKey: item.ownerKey, email: item.ownerEmail }, {
    kind: 'glossary-approved',
    title: String(item.requestType || '') === 'edit' ? 'Glossary edit approved' : 'Glossary step approved',
    message: String(item.requestType || '') === 'edit' ? 'Admin approved your glossary edit suggestion.' : (item.autoMirror ? 'Admin approved your glossary step and created the opposite-foot twin too.' : 'Admin approved your glossary step.')
  });
  await writeDb(db);
  res.json({ ok:true, item, added:additions, updatedStep });
});

app.post('/api/admin/glossary-requests/:id/reject', requireAdmin, async (req, res) => {
  const db = await readDb();
  const id = String(req.params.id || '').trim();
  const item = (Array.isArray(db.glossaryRequests) ? db.glossaryRequests : []).find(row => row && row.id === id);
  if (!item) return res.status(404).json({ ok:false, error:'Glossary request not found.' });
  item.status = 'rejected';
  item.updatedAt = new Date().toISOString();
  item.adminNote = String(req.body?.note || '').trim().slice(0, 600);
  pushNotification(db, { userKey: item.ownerKey, email: item.ownerEmail }, { kind:'glossary-rejected', title:'Glossary step declined', message: item.adminNote ? `Admin declined your glossary step request: ${item.adminNote}` : 'Admin declined your glossary step request this time.' });
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


app.post('/api/ai/worksheet-builder', requireGoogleUser, async (req, res) => {
  const prompt = String(req.body?.prompt || '').trim();
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  const pending = req.body?.pending && typeof req.body.pending === 'object' ? req.body.pending : null;
  const dance = req.body?.dance && typeof req.body.dance === 'object' ? req.body.dance : null;
  const approvedGlossary = Array.isArray(req.body?.approvedGlossary) ? req.body.approvedGlossary : [];
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
  try {
    const glossary = approvedGlossary.length
      ? approvedGlossary
      : (Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps : []).slice(0, 200).map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          desc: item.desc,
          counts: item.counts,
          count: item.count,
          foot: item.foot,
        }));
    const result = await runWorksheetBuilderPython({ prompt, history, pending, dance, approvedGlossary: glossary });
    if (!result || typeof result !== 'object') {
      return res.status(502).json({ ok:false, error:'Worksheet builder returned no usable data.' });
    }
    res.json({ ok:true, ...result });
  } catch (error) {
    res.status(error.status || 502).json({ ok:false, error: error.message || 'Worksheet builder failed.' });
  }
});

app.post('/api/ai/dance-tools', requireGoogleUser, async (req, res) => {
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
    const learnedNotes = (Array.isArray(db.siteMemory) ? db.siteMemory : []).slice(0, 30).map(item => `- ${String(item?.text || '').trim()}`).filter(Boolean).join('\n') || '(none)';
    const glossarySteps = (Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps : []).slice(0, 80).map(item => `- ${item.name} [${item.foot || 'Either'}] ${item.counts || '1'}: ${item.description || ''}`).filter(Boolean).join('\n') || '(none)';
    const system = `${SITE_HELP_CONTEXT}\nReply like a natural AI helper for the Step By Stepper site. Be specific, warm, and practical. Use the conversation history when it matters, and do not keep repeating the exact same canned answer.\nAdmin-approved helper memory:\n${learnedNotes}\nCommunity glossary dance steps (use these when building or suggesting dance steps):\n${glossarySteps}`;
    const userPrompt = `Current tab: ${context.currentTab || 'unknown'}
Signed in: ${context.signedIn ? 'yes' : 'no'}
Admin: ${context.isAdmin ? 'yes' : 'no'}
Moderator: ${context.isModerator ? 'yes' : 'no'}
Premium: ${context.isPremium ? 'yes' : 'no'}
Online count: ${context.onlineCount || 0}
Current dance title: ${context.currentDanceTitle || 'none'}
Current dance counts: ${context.currentDanceCounts || 'not set'}
Current dance walls: ${context.currentDanceWalls || 'not set'}
Current dance type: ${context.currentDanceType || 'not set'}
Current dance level: ${context.currentDanceLevel || 'not set'}
Sections: ${context.sectionCount || 0}
Total steps: ${context.totalSteps || 0}
Has unsaved changes: ${context.hasUnsavedChanges ? 'yes' : 'no'}
Is phrased dance: ${context.isPhrased ? 'yes' : 'no'}
Community glossary count: ${context.glossaryCount || (Array.isArray(db.approvedGlossarySteps) ? db.approvedGlossarySteps.length : 0)}
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
