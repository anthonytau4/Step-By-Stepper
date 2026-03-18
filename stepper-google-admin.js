(function(){
  if (window.__stepperGoogleAdminInstalled) return;
  window.__stepperGoogleAdminInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const PHR_TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  const FEATURED_CHOREO_KEY = 'stepper_featured_choreo_v1';
  const CURRENT_REGISTRY_KEY = 'stepper_current_registry_id_v1';
  const SESSION_KEY = 'stepper_google_auth_session_v2';
  const LAST_SAVED_SIGNATURE_KEY = 'stepper_last_saved_signature_v1';
  const API_BASE_KEY = 'stepper_api_base_v1';
  const SIGNIN_PAGE_ID = 'stepper-google-signin-page';
  const ADMIN_PAGE_ID = 'stepper-google-admin-page';
  const SUBSCRIPTION_PAGE_ID = 'stepper-google-subscription-page';
  const HOST_ID = 'stepper-google-admin-host';
  const SIGNIN_TAB_ID = 'stepper-google-signin-tab';
  const ADMIN_TAB_ID = 'stepper-google-admin-tab';
  const SUBSCRIPTION_TAB_ID = 'stepper-google-subscription-tab';
  const ADMIN_EMAIL = 'anthonytau4@gmail.com';
  const DEFAULT_RENDER_SERVICE_ID = 'srv-d6ss4295pdvs73e1iifg';
  const DEFAULT_BACKEND_BASE = 'https://step-by-stepper.onrender.com';
  const ALT_BACKEND_BASE = 'https://api.step-by-stepper.com';
  const FALLBACK_GOOGLE_CLIENT_ID = '1038282546217-a7qv2i1puevmtjf38f6sv761vt7he26s.apps.googleusercontent.com';
  const SYNC_INTERVAL_MS = 6000;
  const PRESENCE_INTERVAL_MS = 30000;
  const FEATURED_SYNC_INTERVAL_MS = 18000;

  const state = {
    activePage: null,
    apiBase: readApiBase(),
    config: null,
    presence: { onlineCount: 0, members: [] },
    session: readJson(SESSION_KEY, null),
    adminDances: [],
    featured: [],
    submissions: [],
    notifications: [],
    cloudSaves: [],
    subscription: { isPremium: false, plan: 'free', status: 'free', source: 'unknown' },
    chatOpen: false,
    chatBusy: false,
    chatMessages: [],
    chatDraft: '',
    lastSyncedSignature: '',
    lastSavedSignature: String(localStorage.getItem(LAST_SAVED_SIGNATURE_KEY) || ''),
    ui: {
      buildBtn: null,
      sheetBtn: null,
      tabStrip: null,
      mainEl: null,
      footerWrap: null,
      host: null,
      signInBtn: null,
      adminBtn: null,
      subscriptionBtn: null
    },
    gisReady: false,
    gisPromise: null,
    gisClientId: '',
    busy: {
      config: false,
      session: false,
      admin: false,
      feature: false,
      sync: false
    }
  };

  function normalizeEmail(value){
    return String(value || '').trim().toLowerCase();
  }

  function normalizeApiBase(value){
    return String(value || '').trim().replace(/\/+$/, '');
  }

  function readApiBase(){
    const explicit = normalizeApiBase(window.STEPPER_API_BASE || '');
    if (explicit) return explicit;
    const saved = normalizeApiBase(localStorage.getItem(API_BASE_KEY) || '');
    if (saved) return saved;
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return 'http://localhost:3000';
    return DEFAULT_BACKEND_BASE;
  }

  function saveApiBase(value){
    const normalized = normalizeApiBase(value);
    state.apiBase = normalized || DEFAULT_BACKEND_BASE;
    localStorage.setItem(API_BASE_KEY, state.apiBase);
    window.STEPPER_API_BASE = state.apiBase;
  }

  function getApiBaseCandidates(preferred){
    const list = [];
    const push = (value) => {
      const normalized = normalizeApiBase(value);
      if (!normalized) return;
      if (!list.includes(normalized)) list.push(normalized);
    };
    const saved = normalizeApiBase(localStorage.getItem(API_BASE_KEY) || '');
    const explicit = normalizeApiBase(window.STEPPER_API_BASE || '');
    const currentOrigin = (location.protocol === 'http:' || location.protocol === 'https:') ? normalizeApiBase(location.origin) : '';
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      push(preferred);
      push(explicit);
      push(saved);
      push('http://localhost:3000');
      push(currentOrigin);
      return list;
    }
    push(preferred);
    push(explicit);
    push(saved);
    push(DEFAULT_BACKEND_BASE);
    push(ALT_BACKEND_BASE);
    if (currentOrigin && !/step-by-stepper\.com$/i.test(location.hostname)) push(currentOrigin);
    return list;
  }

  async function probeApiBaseCandidate(base){
    const normalized = normalizeApiBase(base);
    if (!normalized) return null;
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 2800) : null;
      const response = await fetch(`${normalized}/api/health`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        mode: 'cors',
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
      if (!response.ok) return null;
      const data = await response.json().catch(() => null);
      return data && data.ok ? normalized : null;
    } catch {
      return null;
    }
  }

  async function chooseWorkingApiBase(preferred){
    const candidates = getApiBaseCandidates(preferred);
    for (const candidate of candidates) {
      const working = await probeApiBaseCandidate(candidate);
      if (working) {
        saveApiBase(working);
        return working;
      }
    }
    return normalizeApiBase(preferred) || DEFAULT_BACKEND_BASE;
  }

  function wireStartupBackendBase(){
    const button = document.querySelector('.stepper-static-startup__button');
    if (!button || button.dataset.stepperApiWired === 'true') return;
    button.dataset.stepperApiWired = 'true';
    button.addEventListener('click', () => {
      chooseWorkingApiBase(state.apiBase).catch(() => {});
    });
  }

  function readJson(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function saveSession(session){
    state.session = session && typeof session === 'object' ? session : null;
    if (state.session) writeJson(SESSION_KEY, state.session);
    else localStorage.removeItem(SESSION_KEY);
    updateAdminTabVisibility();
  }

  function clearSession(){
    state.cloudSaves = [];
    saveSession(null);
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch {}
  }

  function getCurrentRegistryId(){
    return String(localStorage.getItem(CURRENT_REGISTRY_KEY) || '').trim();
  }

  function setCurrentRegistryId(value){
    const safe = String(value || '').trim();
    if (safe) localStorage.setItem(CURRENT_REGISTRY_KEY, safe);
    else localStorage.removeItem(CURRENT_REGISTRY_KEY);
  }

  function isAdminSession(){
    return normalizeEmail(state.session && state.session.profile && state.session.profile.email) === normalizeEmail(ADMIN_EMAIL)
      || !!(state.session && state.session.isAdmin);
  }

  function isPremiumSession(){
    return isAdminSession() || !!(state.subscription && state.subscription.isPremium);
  }

  function paymentStatusLabel(){
    if (isAdminSession()) return 'Admin access';
    if (state.subscription && state.subscription.plan === 'yearly' && isPremiumSession()) return 'Premium yearly';
    if (state.subscription && state.subscription.plan === 'monthly' && isPremiumSession()) return 'Premium monthly';
    return 'Free member';
  }

  function isDarkMode(){
    const data = readJson(DATA_KEY, null);
    return !!(data && data.isDarkMode);
  }

  function themeClasses(){
    const dark = isDarkMode();
    return {
      dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500',
      button: dark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      orange: dark ? 'bg-orange-500/10 border-orange-400/30 text-orange-200' : 'bg-orange-50 border-orange-200 text-orange-700'
    };
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value){
    if (!value) return 'Recently';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return 'Recently';
    }
  }

  function iconUser(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="8" r="4"></circle></svg>';
  }

  function iconShield(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>';
  }

  function iconMembers(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
  }

  function iconMedal(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="14" r="6"></circle><path d="M12 8V2"></path><path d="M8 2h8"></path></svg>';
  }

  function scrollButtonIntoView(button){
    return;
  }

  function applyTabStyles(button, isActive, accentColor){
    if (!button) return;
    const dark = isDarkMode();
    button.style.color = dark ? '#ffffff' : '';
    button.style.opacity = isActive ? '1' : (dark ? '.92' : '');
    button.style.transform = isActive ? 'translateY(-1px)' : '';
    button.style.boxShadow = isActive ? '0 8px 24px rgba(79,70,229,.18)' : '';
    button.style.background = isActive ? (dark ? '#2f2f2f' : '#ffffff') : '';
    button.style.borderColor = isActive ? (dark ? '#525252' : '#d4d4d8') : '';
    if (!dark && isActive && accentColor) button.style.color = accentColor;
  }

  function updateTabButtons(){
    applyTabStyles(state.ui.signInBtn, state.activePage === 'signin', '#4f46e5');
    applyTabStyles(state.ui.subscriptionBtn, state.activePage === 'subscription', '#4f46e5');
    applyTabStyles(state.ui.adminBtn, state.activePage === 'admin', '#4f46e5');
  }

  function makeTabButton(label, iconSvg, pageName, id){
    let button = document.getElementById(id);
    if (button) return button;
    button = document.createElement('button');
    button.type = 'button';
    button.id = id;
    button.className = 'stepper-extra-tab shrink-0 px-2.5 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap opacity-50 hover:opacity-100';
    button.innerHTML = `<span class="stepper-extra-tab-icon">${iconSvg}</span><span>${escapeHtml(label)}</span>`;
    button.addEventListener('click', () => {
      scrollButtonIntoView(button);
      const open = () => openPage(pageName);
      if (window.__stepperRunFaviconTransition) window.__stepperRunFaviconTransition(open, { target: pageName });
      else open();
    });
    return button;
  }

  function ensureStyles(){
    if (document.getElementById('stepper-google-admin-style')) return;
    const style = document.createElement('style');
    style.id = 'stepper-google-admin-style';
    style.textContent = `
      #${HOST_ID} { width: 100%; }
      #${HOST_ID}[hidden] { display: none !important; }
      .stepper-google-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; }
      .stepper-google-pill { display:inline-flex; align-items:center; gap:.45rem; border-radius:999px; padding:.5rem .85rem; font-size:.72rem; font-weight:900; letter-spacing:.16em; text-transform:uppercase; }
      .stepper-google-stat { border-radius:1rem; border:1px solid rgba(99,102,241,.16); padding:1rem; }
      .stepper-google-badge-row { display:flex; flex-wrap:wrap; gap:.65rem; }
      .stepper-google-badge-btn { border-radius:999px; padding:.6rem .95rem; font-weight:900; letter-spacing:.08em; text-transform:uppercase; border:1px solid transparent; transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease; }
      .stepper-google-badge-btn:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(0,0,0,.12); }
      .stepper-google-badge-btn[data-tone="bronze"] { background:#f7eadf; color:#8a4b25; border-color:#e4c4ad; }
      .stepper-google-badge-btn[data-tone="silver"] { background:#eef2f7; color:#4b5563; border-color:#d5dbe4; }
      .stepper-google-badge-btn[data-tone="gold"] { background:#fff3c4; color:#8a5800; border-color:#f1d36a; }
      .dark .stepper-google-badge-btn[data-tone="bronze"] { background:rgba(180,83,9,.16); color:#fed7aa; border-color:rgba(251,146,60,.28); }
      .dark .stepper-google-badge-btn[data-tone="silver"] { background:rgba(148,163,184,.12); color:#e5e7eb; border-color:rgba(148,163,184,.25); }
      .dark .stepper-google-badge-btn[data-tone="gold"] { background:rgba(250,204,21,.16); color:#fde68a; border-color:rgba(250,204,21,.3); }
      .stepper-google-input { width:100%; border-radius:1rem; border:1px solid rgba(148,163,184,.28); padding:.9rem 1rem; background:transparent; }
      .stepper-google-cta { display:inline-flex; align-items:center; justify-content:center; gap:.65rem; border-radius:1rem; padding:.85rem 1.1rem; font-weight:900; border:1px solid rgba(99,102,241,.18); }
      .stepper-google-danger { border-color:rgba(239,68,68,.22); }
      .stepper-google-muted-list { display:grid; gap:.85rem; }
      .stepper-google-member-item { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
      .stepper-google-google-btn > div { display:flex; justify-content:center; }
      .stepper-extra-tab { min-width: 114px; justify-content:center; font-weight:900; }
      .dark .stepper-extra-tab { color:#f5f5f5 !important; }
      .stepper-extra-tab-icon svg { width:18px; height:18px; }
      @media (max-width: 640px) { .stepper-extra-tab { min-width: 104px; } }
    `;
    document.head.appendChild(style);
  }

  function locateUi(){
    const buildBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'Build') || null;
    const sheetBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'Sheet') || null;
    const featuredBtn = document.getElementById('stepper-featured-choreo-tab');
    const tabStrip = buildBtn ? buildBtn.parentElement : null;
    const mainEl = document.querySelector('main');
    const footerWrap = mainEl && mainEl.parentElement
      ? Array.from(mainEl.parentElement.querySelectorAll('div')).find(node => {
          const cls = node.className || '';
          return typeof cls === 'string' && cls.includes('max-w-4xl') && cls.includes('mx-auto') && cls.includes('px-3') && cls.includes('pb-10');
        }) || null
      : null;

    if (!tabStrip || !mainEl) return false;

    state.ui.buildBtn = buildBtn;
    state.ui.sheetBtn = sheetBtn;
    state.ui.tabStrip = tabStrip;
    state.ui.mainEl = mainEl;
    state.ui.footerWrap = footerWrap;

    state.ui.signInBtn = makeTabButton('Sign In', iconUser(), 'signin', SIGNIN_TAB_ID);
    if (!state.ui.signInBtn.parentNode) {
      if (featuredBtn && featuredBtn.parentNode === tabStrip) featuredBtn.insertAdjacentElement('afterend', state.ui.signInBtn);
      else tabStrip.appendChild(state.ui.signInBtn);
    }

    state.ui.subscriptionBtn = makeTabButton('Subscription', iconMedal(), 'subscription', SUBSCRIPTION_TAB_ID);
    if (!state.ui.subscriptionBtn.parentNode) {
      if (state.ui.signInBtn && state.ui.signInBtn.parentNode === tabStrip) state.ui.signInBtn.insertAdjacentElement('afterend', state.ui.subscriptionBtn);
      else tabStrip.appendChild(state.ui.subscriptionBtn);
    }

    state.ui.adminBtn = makeTabButton('Admin', iconShield(), 'admin', ADMIN_TAB_ID);
    if (!state.ui.adminBtn.parentNode) {
      if (state.ui.subscriptionBtn && state.ui.subscriptionBtn.parentNode === tabStrip) state.ui.subscriptionBtn.insertAdjacentElement('afterend', state.ui.adminBtn);
      else tabStrip.appendChild(state.ui.adminBtn);
    }

    if (!tabStrip.__stepperGoogleAdminCloseWired) {
      tabStrip.__stepperGoogleAdminCloseWired = true;
      tabStrip.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const own = button.id === SIGNIN_TAB_ID || button.id === SUBSCRIPTION_TAB_ID || button.id === ADMIN_TAB_ID;
        if (!own && state.activePage) closePages();
      }, true);
    }

    updateAdminTabVisibility();
    updateTabButtons();
    return true;
  }

  function ensureHost(){
    if (state.ui.host && document.body.contains(state.ui.host)) return state.ui.host;
    const host = document.createElement('div');
    host.id = HOST_ID;
    host.hidden = true;
    host.className = 'max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 sm:pb-32 print:hidden';
    host.innerHTML = `<div class="space-y-5"><section id="${SIGNIN_PAGE_ID}" hidden style="display:none"></section><section id="${SUBSCRIPTION_PAGE_ID}" hidden style="display:none"></section><section id="${ADMIN_PAGE_ID}" hidden style="display:none"></section></div>`;
    const root = document.getElementById('root');
    if (root && root.parentNode) root.insertAdjacentElement('afterend', host);
    else document.body.appendChild(host);
    state.ui.host = host;
    return host;
  }

  function setVisibility(el, visible){
    if (!el) return;
    el.hidden = !visible;
    el.style.display = visible ? '' : 'none';
    el.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function hideNativeExtraHost(){
    const nativeHost = document.getElementById('stepper-extra-page-host');
    if (!nativeHost) return;
    nativeHost.hidden = true;
    nativeHost.style.display = 'none';
  }

  function showNativeExtraHost(){
    const nativeHost = document.getElementById('stepper-extra-page-host');
    if (!nativeHost) return;
    nativeHost.hidden = false;
    nativeHost.style.display = '';
  }

  function closePages(){
    state.activePage = null;
    const host = ensureHost();
    host.hidden = true;
    host.style.display = 'none';
    showNativeExtraHost();
    if (state.ui.mainEl) state.ui.mainEl.style.display = '';
    if (state.ui.footerWrap) state.ui.footerWrap.style.display = '';
    updateTabButtons();
  }

  function openPage(pageName){
    state.activePage = pageName === 'admin' ? 'admin' : (pageName === 'subscription' ? 'subscription' : 'signin');
    const host = ensureHost();
    host.hidden = false;
    host.style.display = '';
    hideNativeExtraHost();
    if (state.ui.mainEl) state.ui.mainEl.style.display = 'none';
    if (state.ui.footerWrap) state.ui.footerWrap.style.display = 'none';
    renderPages();
    updateTabButtons();
  }

  function updateAdminTabVisibility(){
    if (state.ui.subscriptionBtn) {
      const subVisible = !!(state.session && state.session.credential);
      state.ui.subscriptionBtn.style.display = subVisible ? '' : 'none';
      state.ui.subscriptionBtn.hidden = !subVisible;
      if (!subVisible && state.activePage === 'subscription') state.activePage = 'signin';
    }
    if (!state.ui.adminBtn) return;
    const visible = isAdminSession();
    state.ui.adminBtn.style.display = visible ? '' : 'none';
    state.ui.adminBtn.hidden = !visible;
    if (!visible && state.activePage === 'admin') {
      state.activePage = 'signin';
    }
  }

  async function fetchJson(path, options){
    const retryableStatuses = new Set([0, 404, 405, 502, 503, 504]);
    const bases = String(path || '').startsWith('/api/') ? getApiBaseCandidates(state.apiBase) : [normalizeApiBase(state.apiBase) || DEFAULT_BACKEND_BASE];
    let lastError = null;
    for (const base of bases) {
      const url = `${normalizeApiBase(base)}${path}`;
      try {
        const headers = Object.assign({ Accept: 'application/json' }, options && options.headers ? options.headers : {});
        const response = await fetch(url, Object.assign({}, options || {}, { headers, mode: 'cors', credentials: 'omit' }));
        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }
        if (response.ok && data && data.ok !== false) {
          if (base && base !== state.apiBase) saveApiBase(base);
          return data;
        }
        const message = data && data.error ? data.error : `Request failed (${response.status})`;
        const error = new Error(message);
        error.status = response.status;
        error.base = base;
        lastError = error;
        if (retryableStatuses.has(Number(response.status)) && base !== bases[bases.length - 1]) continue;
        throw error;
      } catch (error) {
        lastError = error;
        const status = Number(error && error.status || 0);
        const retryable = !status || retryableStatuses.has(status) || /Failed to fetch|NetworkError|Load failed/i.test(String(error && error.message || ''));
        if (retryable && base !== bases[bases.length - 1]) continue;
        throw error;
      }
    }
    throw lastError || new Error('Could not reach backend.');
  }

  async function authFetch(path, options){
    const session = state.session;
    if (!session || !session.credential) {
      const error = new Error('Please sign in with Google first.');
      error.status = 401;
      throw error;
    }
    const headers = Object.assign({}, options && options.headers ? options.headers : {}, {
      Authorization: `Bearer ${session.credential}`
    });
    try {
      return await fetchJson(path, Object.assign({}, options || {}, { headers }));
    } catch (error) {
      if (error && error.status === 401) {
        clearSession();
        renderPages();
      }
      throw error;
    }
  }

  async function refreshConfig(){
    if (state.busy.config) return state.config;
    state.busy.config = true;
    try {
      const config = await fetchJson('/api/auth/config');
      state.config = config;
      return state.config;
    } catch (error) {
      state.config = {
        ok: false,
        googleEnabled: !!FALLBACK_GOOGLE_CLIENT_ID,
        googleClientId: FALLBACK_GOOGLE_CLIENT_ID,
        error: error && error.message ? error.message : 'Could not reach backend.',
        source: 'frontend-fallback'
      };
      return state.config;
    } finally {
      state.busy.config = false;
    }
  }

  async function refreshPresence(){
    try {
      state.presence = await fetchJson('/api/presence');
    } catch {
      state.presence = { ok:false, onlineCount: 0, members: [] };
    }
    renderPresenceOnly();
    return state.presence;
  }

  async function refreshSession(){
    if (!state.session || !state.session.credential || state.busy.session) return null;
    state.busy.session = true;
    try {
      const data = await authFetch('/api/auth/me');
      saveSession({
        credential: state.session.credential,
        profile: data.profile,
        isAdmin: !!data.isAdmin,
        updatedAt: new Date().toISOString()
      });
      return data;
    } catch {
      return null;
    } finally {
      state.busy.session = false;
    }
  }

  async function heartbeat(){
    if (!state.session || !state.session.credential) return null;
    try {
      const data = await authFetch('/api/presence/heartbeat', { method:'POST' });
      state.presence = data;
      if (state.session) {
        saveSession(Object.assign({}, state.session, { isAdmin: !!data.isAdmin, updatedAt: new Date().toISOString() }));
      }
      renderPresenceOnly();
      return data;
    } catch {
      return null;
    }
  }

  function ensureGsiLoaded(){
    if (state.gisPromise) return state.gisPromise;
    state.gisPromise = new Promise((resolve, reject) => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        state.gisReady = true;
        resolve(window.google);
        return;
      }
      const existing = document.querySelector('script[data-stepper-gsi="true"]');
      if (existing) {
        existing.addEventListener('load', () => {
          state.gisReady = true;
          resolve(window.google);
        }, { once:true });
        existing.addEventListener('error', () => reject(new Error('Could not load Google Identity Services.')), { once:true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.stepperGsi = 'true';
      script.onload = () => {
        state.gisReady = true;
        resolve(window.google);
      };
      script.onerror = () => reject(new Error('Could not load Google Identity Services.'));
      document.head.appendChild(script);
    });
    return state.gisPromise;
  }

  async function handleGoogleCredential(response){
    const credential = response && response.credential ? String(response.credential) : '';
    if (!credential) return;
    try {
      const data = await fetchJson('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      saveSession({
        credential,
        profile: data.profile,
        isAdmin: !!data.isAdmin,
        updatedAt: new Date().toISOString()
      });
      await refreshSession();
      await heartbeat();
      await refreshCloudSaves();
      await restoreLatestCloudSaveIfNeeded();
      await syncCurrentDanceToBackend(true);
      await refreshNotifications();
      await refreshSubscription();
      await syncFeaturedFromBackend();
      if (isAdminSession()) { await refreshAdminDances(); await refreshSubmissions(); }
    } catch (error) {
      alert(error.message || 'Google sign in failed.');
    }
    renderPages();
  }

  async function renderGoogleButton(){
    const container = document.getElementById('stepper-google-button-slot');
    if (!container) return;
    const theme = themeClasses();
    container.innerHTML = '';
    const effectiveClientId = (state.config && state.config.googleClientId) || FALLBACK_GOOGLE_CLIENT_ID;
    if (!effectiveClientId) {
      container.innerHTML = `
        <button type="button" disabled class="stepper-google-cta ${theme.button}" style="width:280px;max-width:100%;opacity:.65;cursor:not-allowed">Sign in with Google</button>
      `;
      return;
    }
    try {
      if (!normalizeApiBase(state.apiBase)) {
        const preferredBase = await chooseWorkingApiBase(window.STEPPER_API_BASE || state.apiBase || DEFAULT_BACKEND_BASE);
        if (preferredBase) saveApiBase(preferredBase);
      }
      await ensureGsiLoaded();
      if (!(window.google && window.google.accounts && window.google.accounts.id)) {
        container.innerHTML = `<button type="button" disabled class="stepper-google-cta ${theme.button}" style="width:280px;max-width:100%;opacity:.65;cursor:not-allowed">Sign in with Google</button><p class="mt-3 text-sm ${theme.subtle}">Google sign-in script could not load on this device.</p>`;
        return;
      }
      if (state.gisClientId !== effectiveClientId) {
        window.google.accounts.id.initialize({
          client_id: effectiveClientId,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true
        });
        state.gisClientId = effectiveClientId;
      }
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: isDarkMode() ? 'filled_black' : 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 280
      });
      const helper = document.createElement('div');
      helper.className = `mt-3 text-xs ${theme.subtle}`;
      helper.textContent = state.config && state.config.source === 'frontend-fallback'
        ? 'Using the built-in Google sign-in fallback while the site checks the backend.'
        : 'Google sign-in should be ready here. If the button still does nothing, the backend URL or Google origin is mismatched.';
      container.appendChild(helper);
    } catch (error) {
      container.innerHTML = `<button type="button" disabled class="stepper-google-cta ${theme.button}" style="width:280px;max-width:100%;opacity:.65;cursor:not-allowed">Sign in with Google</button><p class="mt-3 text-sm ${theme.subtle}">${escapeHtml(error.message || 'Google button could not load.')}</p>`;
    }
  }

  function readAppData(){
    return readJson(DATA_KEY, null);
  }

  function hasDanceContent(data){
    if (!data || !data.meta) return false;
    const title = String(data.meta.title || '').trim();
    const choreographer = String(data.meta.choreographer || '').trim();
    const sections = Array.isArray(data.sections) ? data.sections : [];
    return !!(title || choreographer || sections.some(section => Array.isArray(section && section.steps) && section.steps.length));
  }

  function buildCurrentDanceEntry(){
    const data = readAppData();
    if (!hasDanceContent(data)) return null;
    const meta = data && data.meta ? data.meta : {};
    const sections = Array.isArray(data && data.sections) ? data.sections : [];
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    const title = String(meta.title || '').trim() || 'Untitled Dance';
    const choreographer = String(meta.choreographer || '').trim() || 'Uncredited';
    return {
      id: `${title.toLowerCase()}|${choreographer.toLowerCase()}`,
      title,
      choreographer,
      country: String(meta.country || '').trim(),
      level: String(meta.level || 'Unlabelled').trim() || 'Unlabelled',
      counts: String(meta.counts || '-').trim() || '-',
      walls: String(meta.walls || '-').trim() || '-',
      music: String(meta.music || '').trim(),
      sections: sections.length,
      steps: stepCount,
      updatedAt: new Date().toISOString(),
      snapshot: {
        data: data,
        phrasedTools: readJson(PHR_TOOLS_KEY, {})
      }
    };
  }

  function buildDanceSignature(entry){
    if (!entry) return '';
    try {
      return JSON.stringify({
        title: entry.title,
        choreographer: entry.choreographer,
        counts: entry.counts,
        walls: entry.walls,
        steps: entry.steps,
        sections: entry.sections,
        data: entry.snapshot && entry.snapshot.data ? entry.snapshot.data : {}
      });
    } catch {
      return `${entry.id}|${entry.updatedAt}`;
    }
  }


  function getCurrentDanceSignature(){
    const entry = buildCurrentDanceEntry();
    return buildDanceSignature(entry);
  }

  function hasUnsavedChanges(){
    const current = getCurrentDanceSignature();
    if (!current) return false;
    return current !== String(state.lastSavedSignature || '');
  }

  function updateSavedSignature(signature){
    const safe = String(signature || '');
    state.lastSavedSignature = safe;
    if (safe) localStorage.setItem(LAST_SAVED_SIGNATURE_KEY, safe);
    else localStorage.removeItem(LAST_SAVED_SIGNATURE_KEY);
  }

  function restoreDanceSnapshot(item){
    const data = item && item.snapshot && item.snapshot.data && typeof item.snapshot.data === 'object' ? item.snapshot.data : null;
    const phrasedTools = item && item.snapshot && item.snapshot.phrasedTools && typeof item.snapshot.phrasedTools === 'object' ? item.snapshot.phrasedTools : {};
    if (!data) return false;
    writeJson(DATA_KEY, data);
    writeJson(PHR_TOOLS_KEY, phrasedTools);
    window.dispatchEvent(new Event('storage'));
    return true;
  }

  async function refreshCloudSaves(){
    if (!state.session || !state.session.credential) {
      state.cloudSaves = [];
      return [];
    }
    try {
      const data = await authFetch('/api/cloud-saves');
      state.cloudSaves = Array.isArray(data.items) ? data.items : [];
      return state.cloudSaves;
    } catch {
      state.cloudSaves = [];
      return [];
    }
  }

  async function restoreLatestCloudSaveIfNeeded(){
    const localEntry = buildCurrentDanceEntry();
    if (localEntry) return false;
    const items = state.cloudSaves && state.cloudSaves.length ? state.cloudSaves : await refreshCloudSaves();
    const latest = Array.isArray(items) ? items[0] : null;
    if (!latest) return false;
    const restored = restoreDanceSnapshot(latest);
    if (restored) {
      setCurrentRegistryId(latest.registryId || '');
      updateSavedSignature(buildDanceSignature(latest));
      state.lastSyncedSignature = buildDanceSignature(latest);
    }
    return restored;
  }

  async function saveChangesNow(opts){
    const force = !!(opts && opts.force);
    const synced = await syncCurrentDanceToBackend(force || true);
    if (synced) {
      await refreshCloudSaves();
      renderSaveButton();
      return true;
    }
    renderSaveButton();
    return false;
  }

  async function syncCurrentDanceToBackend(force){
    if (state.busy.sync) return false;
    if (!state.session || !state.session.credential) return false;
    const entry = buildCurrentDanceEntry();
    if (!entry) return false;
    const signature = buildDanceSignature(entry);
    if (!force && signature && signature === state.lastSyncedSignature) return false;
    state.busy.sync = true;
    try {
      const data = await authFetch('/api/cloud-saves/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry })
      });
      if (data && data.registryItem && data.registryItem.registryId) setCurrentRegistryId(data.registryItem.registryId);
      state.lastSyncedSignature = signature;
      updateSavedSignature(signature);
      if (data && Array.isArray(data.items)) state.cloudSaves = data.items;
      return true;
    } catch {
      return false;
    } finally {
      state.busy.sync = false;
    }
  }

  async function syncFeaturedFromBackend(){
    try {
      const data = await fetchJson('/api/featured-choreo');
      state.featured = Array.isArray(data.items) ? data.items : [];
      writeJson(FEATURED_CHOREO_KEY, state.featured);
      window.dispatchEvent(new Event('storage'));
      return state.featured;
    } catch {
      return state.featured;
    }
  }

  async function refreshAdminDances(){
    if (!isAdminSession() || state.busy.admin) return [];
    state.busy.admin = true;
    try {
      const data = await authFetch('/api/admin/dances');
      state.adminDances = Array.isArray(data.items) ? data.items : [];
      return state.adminDances;
    } catch {
      state.adminDances = [];
      return [];
    } finally {
      state.busy.admin = false;
    }
  }

  function badgeLabelForTone(tone){
    if (tone === 'gold') return 'Gold Feature';
    if (tone === 'silver') return 'Silver Feature';
    return 'Bronze Feature';
  }

  async function buildAiBadgeLabel(registryId, tone){
    const fallback = badgeLabelForTone(tone);
    try {
      const match = (state.adminDances || []).find(item => item.registryId === registryId);
      const prompt = `Write one short human-sounding featured choreography badge label for a line dance called "${match?.title || 'this dance'}" by "${match?.choreographer || 'Unknown'}". Tone: ${tone}. Return only the label, max 4 words.`;
      const data = await fetchJson('/api/openai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, system: 'You write short plainspoken labels for featured line dances.' })
      });
      const label = String((data && data.text) || '').trim().replace(/^['"]|['"]$/g, '');
      return label || fallback;
    } catch {
      return fallback;
    }
  }

  async function featureDance(registryId, tone){
    if (!registryId || state.busy.feature) return;
    state.busy.feature = true;
    try {
      const aiLabel = await buildAiBadgeLabel(registryId, tone);
      await authFetch('/api/admin/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registryId,
          badgeTone: tone,
          badgeLabel: aiLabel
        })
      });
      await refreshAdminDances();
      await refreshSubmissions();
      await syncFeaturedFromBackend();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not feature that dance.');
    } finally {
      state.busy.feature = false;
    }
  }

  async function unfeatureDance(registryId){
    if (!registryId || state.busy.feature) return;
    state.busy.feature = true;
    try {
      await authFetch(`/api/admin/feature/${encodeURIComponent(registryId)}`, { method:'DELETE' });
      await refreshAdminDances();
      await syncFeaturedFromBackend();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not remove that feature.');
    } finally {
      state.busy.feature = false;
    }
  }


  async function refreshNotifications(){
    if (!state.session || !state.session.credential) {
      state.notifications = [];
      return [];
    }
    try {
      const data = await authFetch('/api/notifications');
      state.notifications = Array.isArray(data.items) ? data.items : [];
      return state.notifications;
    } catch {
      state.notifications = [];
      return [];
    }
  }

  async function markNotificationsRead(ids){
    if (!state.session || !state.session.credential) return false;
    try {
      await authFetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.isArray(ids) ? ids : [] })
      });
      state.notifications = state.notifications.map(item => ids.includes(item.id) ? Object.assign({}, item, { readAt: new Date().toISOString() }) : item);
      return true;
    } catch {
      return false;
    }
  }

  function ensureToastHost(){
    let host = document.getElementById('stepper-google-toast-host');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'stepper-google-toast-host';
    host.style.position = 'fixed';
    host.style.top = '16px';
    host.style.right = '16px';
    host.style.zIndex = '9999';
    host.style.display = 'grid';
    host.style.gap = '10px';
    host.style.maxWidth = 'min(420px, calc(100vw - 24px))';
    document.body.appendChild(host);
    return host;
  }

  function showNotificationToasts(){
    const unread = state.notifications.filter(item => item && !item.readAt);
    if (!unread.length) return;
    const host = ensureToastHost();
    const theme = themeClasses();
    unread.slice(0, 4).forEach(item => {
      if (host.querySelector(`[data-toast-id="${item.id}"]`)) return;
      const card = document.createElement('div');
      card.setAttribute('data-toast-id', item.id);
      card.className = `rounded-3xl border shadow-xl p-4 ${theme.shell}`;
      card.innerHTML = `<div class="flex items-start gap-3"><div class="stepper-google-pill ${theme.orange}">${escapeHtml(item.kind || 'Notice')}</div><button type="button" class="ml-auto text-xs font-black uppercase tracking-widest" data-close="1">Close</button></div><div class="mt-3 text-base font-black tracking-tight">${escapeHtml(item.title || 'Update')}</div><p class="mt-2 text-sm ${theme.subtle}">${escapeHtml(item.message || '')}</p></div>`;
      card.querySelector('[data-close="1"]').addEventListener('click', async () => {
        card.remove();
        await markNotificationsRead([item.id]);
      });
      host.appendChild(card);
    });
  }

  function renderFeatureBadge(){
    let badge = document.getElementById('stepper-feature-owner-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'stepper-feature-owner-badge';
      badge.style.position = 'fixed';
      badge.style.left = '12px';
      badge.style.top = '12px';
      badge.style.zIndex = '9000';
      badge.style.pointerEvents = 'none';
      document.body.appendChild(badge);
    }
    const currentRegistryId = getCurrentRegistryId();
    const currentEmail = normalizeEmail(state.session && state.session.profile && state.session.profile.email);
    const item = (state.featured || []).find(entry => String(entry.registryId || entry.id || '') === currentRegistryId && normalizeEmail(entry.ownerEmail) === currentEmail);
    if (!item) { badge.style.display = 'none'; badge.innerHTML = ''; return; }
    const tone = String(item.badgeTone || 'bronze');
    const label = String(item.badgeLabel || badgeLabelForTone(tone));
    const bg = tone === 'gold' ? '#fff3c4' : tone === 'silver' ? '#eef2f7' : '#f7eadf';
    const fg = tone === 'gold' ? '#8a5800' : tone === 'silver' ? '#4b5563' : '#8a4b25';
    badge.style.display = '';
    badge.innerHTML = `<div style="display:inline-flex;align-items:center;gap:.45rem;padding:.58rem .9rem;border-radius:999px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;background:${bg};color:${fg};box-shadow:0 8px 24px rgba(0,0,0,.12);border:1px solid rgba(0,0,0,.06);font-size:11px;">⭐ ${escapeHtml(label)}</div>`;
  }

  async function refreshSubmissions(){
    if (!isAdminSession()) { state.submissions = []; return []; }
    try {
      const data = await authFetch('/api/admin/submissions');
      state.submissions = Array.isArray(data.items) ? data.items : [];
      return state.submissions;
    } catch {
      state.submissions = [];
      return [];
    }
  }

  async function requestModeration(requestType){
    const entry = buildCurrentDanceEntry();
    if (!entry) {
      alert('Build a dance first so there is something to send.');
      return false;
    }
    try {
      const sync = await authFetch('/api/cloud-saves/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry })
      });
      if (sync && sync.registryItem && sync.registryItem.registryId) setCurrentRegistryId(sync.registryItem.registryId);
      await authFetch('/api/submissions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestType, registryId: sync && sync.registryItem ? sync.registryItem.registryId : '' })
      });
      alert(requestType === 'site' ? 'Uploaded to the site review queue.' : 'Sent to host for featuring.');
      return true;
    } catch (error) {
      alert(error.message || 'Could not send that request.');
      return false;
    }
  }

  async function rejectSubmission(submissionId){
    try {
      await authFetch(`/api/admin/submissions/${encodeURIComponent(submissionId)}/reject`, { method: 'POST' });
      await refreshSubmissions();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not reject that request.');
    }
  }

  async function approveSiteSubmission(submissionId){
    try {
      await authFetch(`/api/admin/submissions/${encodeURIComponent(submissionId)}/approve-site`, { method: 'POST' });
      await refreshSubmissions();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not approve that upload.');
    }
  }


  function ensureSaveHost(){
    let host = document.getElementById('stepper-google-save-host');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'stepper-google-save-host';
    host.style.position = 'fixed';
    host.style.top = '14px';
    host.style.left = '50%';
    host.style.transform = 'translateX(-50%)';
    host.style.zIndex = '8600';
    document.body.appendChild(host);
    return host;
  }

  function renderSaveButton(){
    const host = ensureSaveHost();
    const entry = buildCurrentDanceEntry();
    const hasSession = !!(state.session && state.session.credential);
    const wide = window.innerWidth >= 980;
    const shouldShow = !!entry && hasSession && wide && !state.activePage;
    host.style.position = 'fixed';
    host.style.top = 'auto';
    host.style.left = 'auto';
    host.style.transform = 'none';
    host.style.right = '18px';
    host.style.bottom = state.chatOpen ? '92px' : '18px';
    host.style.zIndex = '8500';
    if (!shouldShow) { host.style.display='none'; host.innerHTML=''; return; }
    const dirty = hasUnsavedChanges();
    host.style.display='';
    host.innerHTML = `<button type="button" data-save-now="1" style="border:1px solid rgba(79,70,229,.25);background:${dirty ? '#4f46e5' : '#ffffff'};color:${dirty ? '#ffffff' : '#111827'};padding:.72rem 1rem;border-radius:999px;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.12);display:inline-flex;align-items:center;gap:.55rem;max-width:min(280px,calc(100vw - 28px));">${dirty ? 'Save changes' : 'Saved'}<span style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.78;">${dirty ? 'cloud needed' : 'cloud up to date'}</span></button>`;
    host.querySelector('[data-save-now="1"]').addEventListener('click', async () => {
      const ok = await saveChangesNow({ force:true });
      if (!ok) alert('Could not save to the backend just now.');
    });
  }

  function localSiteHelp(prompt){
    const text = String(prompt || '').toLowerCase();
    if (!text) return 'Try asking where to save, how sign-in works, how featuring works, or what tab to use.';
    if (text.includes('save') || text.includes('changes')) return state.session && state.session.credential ? 'Use Save Changes in My Saved Dances to lock the newest version into your Google-linked cloud save. Your latest signed-in dance also auto-syncs in the background.' : 'Open My Saved Dances and use Save Changes there. Sign in with Google first if you want that save to follow you onto other devices.';
    if (text.includes('premium') || text.includes('subscription') || text.includes('pay')) return 'Open Subscription after signing in. Premium is NZ$12.50 monthly or NZ$100 yearly and gets priority review plus the paid site helper.';
    if (text.includes('feature') || text.includes('badge') || text.includes('bronze') || text.includes('silver') || text.includes('gold')) return 'Use Send to host for featuring. Premium requests go to the top of the admin queue, and the admin can approve them with Bronze, Silver, or Gold for Featured Choreo. Removing a feature takes it back off that public page.';
    if (text.includes('upload') || text.includes('site')) return 'Use Upload to site to send your dance into the admin moderation queue. The admin can approve it for the site or delete it.';
    if (text.includes('signin') || text.includes('google') || text.includes('sign in')) return 'Open the Sign In tab and use Sign in with Google. Once signed in, your dances can sync to the backend and the admin tab appears only for the admin email.';
    if (text.includes('tab') || text.includes('where') || text.includes('go')) return 'Use Build to make or edit a dance, Sheet for the clean sheet view, My Saved Dances for your cloud saves, Featured Choreo for public featured dances, and Sign In for Google saving and moderation actions.';
    return 'Use Build to create or edit a dance, then open My Saved Dances to use Save Changes for cloud saving. Featured Choreo shows public featured dances and Sign In handles Google saving.';
  }

  async function askSiteHelper(question){
    const prompt = String(question || '').trim();
    if (!prompt) return;
    state.chatBusy = true;
    renderSiteHelper();
    const currentTab = state.activePage || 'main';
    const payload = {
      prompt,
      context: {
        currentTab,
        signedIn: !!(state.session && state.session.credential),
        isAdmin: isAdminSession(),
        onlineCount: (state.presence && state.presence.onlineCount) || 0
      }
    };
    try {
      let text = '';
      try {
        const data = await fetchJson('/api/chatbot/help', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        text = String(data.text || '').trim();
      } catch (primaryError) {
        const backup = await fetchJson('/api/openai/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: 'You are the Step By Stepper site helper. Answer briefly and practically. Explain which tab or button to use. Mention Build, Sheet, Sign In, My Saved Dances, Featured Choreo, Save Changes, Send to host for featuring, and Upload to site when useful. Never invent hidden features.',
            prompt: `Current tab: ${currentTab}\nSigned in: ${payload.context.signedIn ? 'yes' : 'no'}\nAdmin: ${payload.context.isAdmin ? 'yes' : 'no'}\nOnline count: ${payload.context.onlineCount}\nQuestion: ${prompt}`
          })
        });
        text = String(backup.text || '').trim();
      }
      state.chatMessages.push({ role:'assistant', text: text || localSiteHelp(prompt) });
    } catch (error) {
      state.chatMessages.push({ role:'assistant', text: localSiteHelp(prompt) });
    } finally {
      state.chatBusy = false;
      renderSiteHelper();
    }
  }

  function ensureSiteHelperHost(){
    let host = document.getElementById('stepper-site-helper-host');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'stepper-site-helper-host';
    host.style.position = 'fixed';
    host.style.right = '14px';
    host.style.bottom = '96px';
    host.style.zIndex = '8700';
    document.body.appendChild(host);
    return host;
  }

  function renderSiteHelper(){
    const activeInput = document.activeElement;
    if (state.chatOpen && activeInput && activeInput.matches && activeInput.matches('[data-chat-input=\"1\"]')) return;
    const host = ensureSiteHelperHost();
    host.style.right = '14px';
    host.style.bottom = '20px';
    host.style.zIndex = '8700';
    if (!state.chatMessages.length) {
      state.chatMessages = [{ role:'assistant', text:'Need help using the site? Ask me what tab to use, how featuring works, or how to save your dance.' }];
    }
    if (!state.chatOpen) {
      host.innerHTML = `<button type="button" data-chat-open="1" aria-label="Open site helper" style="border:none;background:#4f46e5;color:#fff;width:58px;height:58px;border-radius:999px;font-size:26px;box-shadow:0 12px 30px rgba(0,0,0,.18);">💬</button>`;
      host.querySelector('[data-chat-open="1"]').addEventListener('click', ()=>{ state.chatOpen = true; renderSiteHelper(); });
      return;
    }
    const messages = state.chatMessages.slice(-10).map(msg => `<div style="align-self:${msg.role==='user'?'flex-end':'stretch'};max-width:100%;background:${msg.role==='user'?'#4f46e5':'#ffffff'};color:${msg.role==='user'?'#ffffff':'#111827'};border:1px solid rgba(79,70,229,.12);padding:.75rem .85rem;border-radius:18px;font-size:14px;line-height:1.45;box-shadow:0 8px 24px rgba(0,0,0,.08);word-break:break-word;">${escapeHtml(msg.text)}</div>`).join('');
    host.innerHTML = `<div style="width:min(380px, calc(100vw - 24px));max-width:calc(100vw - 24px);background:#f8fafc;border:1px solid rgba(99,102,241,.16);border-radius:24px;box-shadow:0 18px 40px rgba(0,0,0,.18);overflow:hidden;"><div style="padding:.9rem 1rem;background:#4f46e5;color:#fff;display:flex;align-items:center;gap:.6rem;"><div style="font-weight:900;">Site helper${isPremiumSession() ? ' • Premium' : ''}</div><button type="button" data-chat-close="1" style="margin-left:auto;border:none;background:rgba(255,255,255,.18);color:#fff;border-radius:999px;padding:.35rem .65rem;font-weight:900;">Close</button></div><div data-chat-messages="1" style="padding:1rem;display:flex;flex-direction:column;gap:.7rem;max-height:min(45vh, 340px);overflow:auto;overscroll-behavior:contain;">${messages}${state.chatBusy ? '<div style="font-size:13px;color:#6b7280;">Thinking…</div>' : ''}</div><form data-chat-form="1" style="padding:0 1rem 1rem;display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;"><input data-chat-input="1" type="text" autocomplete="off" autocapitalize="sentences" spellcheck="true" placeholder="${isPremiumSession() ? 'Ask where to go or what to press' : 'Premium helper lives in Subscription'}" value="${escapeHtml(state.chatDraft || '')}" style="flex:1 1 220px;border:1px solid rgba(99,102,241,.18);border-radius:999px;padding:.9rem 1rem;background:#fff;font-size:16px;min-width:0;" /><button type="submit" ${isPremiumSession() ? '' : 'disabled'} style="border:none;background:#4f46e5;color:#fff;border-radius:999px;padding:.85rem 1rem;font-weight:900;white-space:nowrap;${isPremiumSession() ? '' : 'opacity:.5;cursor:not-allowed;'}">Send</button></form></div>`;
    const list = host.querySelector('[data-chat-messages="1"]');
    if (list) list.scrollTop = list.scrollHeight;
    host.querySelector('[data-chat-close="1"]').addEventListener('click', ()=>{ state.chatOpen = false; renderSiteHelper(); });
    const input = host.querySelector('[data-chat-input="1"]');
    if (input) {
      input.addEventListener('input', ()=>{ state.chatDraft = input.value; });
    }
    host.querySelector('[data-chat-form="1"]').addEventListener('submit', (event)=>{
      event.preventDefault();
      const value = String(state.chatDraft || '').trim();
      if (!value) return;
      state.chatMessages.push({ role:'user', text:value });
      state.chatDraft = '';
      renderSiteHelper();
      askSiteHelper(value);
    });
  }

  function renderQuickActions(){
    let host = document.getElementById('stepper-google-quick-actions');
    if (!host) {
      host = document.createElement('div');
      host.id = 'stepper-google-quick-actions';
      host.style.position = 'fixed';
      host.style.right = '14px';
      host.style.bottom = state.chatOpen ? '92px' : '18px';
      host.style.zIndex = '8500';
      document.body.appendChild(host);
    }
    const hasSession = !!(state.session && state.session.credential);
    const entry = buildCurrentDanceEntry();
    const wide = window.innerWidth >= 980;
    if (!hasSession || !entry || !wide || state.activePage) { host.style.display='none'; host.innerHTML=''; return; }
    host.style.display='';
    host.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;"><button type="button" data-quick="feature" style="border:1px solid rgba(99,102,241,.18);background:#fff;padding:.75rem 1rem;border-radius:999px;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.12);">Send to host for featuring</button><button type="button" data-quick="site" style="border:1px solid rgba(99,102,241,.18);background:#fff;padding:.75rem 1rem;border-radius:999px;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.12);">Upload to site</button></div>`;
    host.querySelector('[data-quick="feature"]').addEventListener('click', ()=>requestModeration('feature'));
    host.querySelector('[data-quick="site"]').addEventListener('click', ()=>requestModeration('site'));
  }

  function patchSavedDancesPage(){
    const page = document.getElementById('stepper-saved-dances-page');
    if (!page) return;
    const body = page.querySelector('[class*="p-6"]') || page;
    if (!body) return;
    let card = page.querySelector('[data-stepper-cloud-save-card="true"]');
    if (!card) {
      card = document.createElement('section');
      card.setAttribute('data-stepper-cloud-save-card', 'true');
      card.style.marginBottom = '20px';
      body.insertBefore(card, body.firstElementChild || null);
    }
    const theme = themeClasses();
    const signedIn = !!(state.session && state.session.credential);
    const profile = signedIn ? state.session.profile || {} : null;
    card.className = `rounded-3xl border p-5 sm:p-6 ${theme.soft}`;
    card.innerHTML = signedIn
      ? `<div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Google cloud save is on</div><p class="mt-1 text-sm ${theme.subtle}">Signed in as ${escapeHtml(profile.name || profile.email || 'Member')}. Use Save Changes here to push the latest version to your Google-linked save so it is still there next time you open the site.</p></div><div class="flex flex-wrap gap-3"><button type="button" data-stepper-saved-save-now="1" class="stepper-google-cta ${theme.button}">Save Changes</button><button type="button" data-stepper-open-subscription="1" class="stepper-google-cta ${theme.button}">Subscription</button><button type="button" data-stepper-open-signin="1" class="stepper-google-cta ${theme.button}">Account</button></div></div>`
      : `<div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Sign in to save across devices</div><p class="mt-1 text-sm ${theme.subtle}">Local device saves still work without signing in. Use Google sign-in when you want the same dance to come back on other phones, tablets, and computers.</p></div><div class="flex flex-wrap gap-3"><button type="button" data-stepper-open-signin="1" class="stepper-google-cta ${theme.button}">Sign in with Google</button></div></div>`;
    const openBtn = card.querySelector('[data-stepper-open-signin="1"]');
    if (openBtn) openBtn.addEventListener('click', ()=> openPage('signin'));
    const subBtn = card.querySelector('[data-stepper-open-subscription="1"]');
    if (subBtn) subBtn.addEventListener('click', ()=> openPage('subscription'));
    const saveBtn = card.querySelector('[data-stepper-saved-save-now="1"]');
    if (saveBtn) saveBtn.addEventListener('click', async ()=>{
      const ok = await saveChangesNow({ force:true });
      if (!ok) alert('Could not save to the backend just now.');
      patchSavedDancesPage();
    });
  }

  function renderPresenceOnly(){
    const countNodes = document.querySelectorAll('[data-stepper-online-count]');
    countNodes.forEach(node => {
      node.textContent = String((state.presence && state.presence.onlineCount) || 0);
    });
  }

  function renderSignInPage(){
    const page = document.getElementById(SIGNIN_PAGE_ID);
    if (!page) return;
    const theme = themeClasses();
    const session = state.session;
    const profile = session && session.profile ? session.profile : null;
    const onlineCount = (state.presence && state.presence.onlineCount) || 0;

    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;

    if (profile) {
      page.innerHTML = `
        <div class="px-6 py-5 border-b ${theme.panel}">
          <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconUser()}</span> Sign In</h2>
        </div>
        <div class="p-6 sm:p-8">
          <div class="mx-auto max-w-3xl rounded-3xl border p-5 sm:p-6 ${theme.soft}">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div class="text-lg font-black tracking-tight">Signed in as ${escapeHtml(profile.name || profile.email || 'Member')}</div>
                <p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(profile.email || '')}</p>
                <p class="mt-3 text-sm ${theme.subtle}">Your dances sync into your Google-linked cloud save automatically. Use Save Changes before leaving if you want the newest version locked in straight away.</p>
                <div class="mt-4 flex flex-wrap gap-3">
                  <button type="button" data-stepper-action="send-host" class="stepper-google-cta ${theme.button}">Send to host for featuring</button>
                  <button type="button" data-stepper-action="upload-site" class="stepper-google-cta ${theme.button}">Upload to site</button>
                  <button type="button" data-stepper-action="open-subscription" class="stepper-google-cta ${theme.button}">Subscription</button>
                </div>
              </div>
              <div class="stepper-google-badge-row">
                <span class="stepper-google-pill ${theme.orange}"><span data-stepper-online-count>${escapeHtml(onlineCount)}</span> online</span>
                <span class="stepper-google-pill ${theme.orange}">${escapeHtml(paymentStatusLabel())}</span>
                ${isAdminSession() ? `<span class="stepper-google-pill ${theme.orange}">${iconShield()} Admin</span>` : ''}
                <button type="button" data-stepper-action="signout" class="stepper-google-cta stepper-google-danger ${theme.button}">Sign out</button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      page.innerHTML = `
        <div class="px-6 py-5 border-b ${theme.panel}">
          <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconUser()}</span> Sign In</h2>
        </div>
        <div class="p-6 sm:p-8">
          <div class="mx-auto max-w-2xl rounded-3xl border p-6 sm:p-8 ${theme.soft}">
            <div class="text-center">
              <div class="text-2xl font-black tracking-tight">Sign in with Google</div>
              <p class="mt-3 text-sm leading-relaxed ${theme.subtle}">Use your Google account to sign in. The admin tab appears only for <strong>${escapeHtml(ADMIN_EMAIL)}</strong>.</p>
            </div>
            <div id="stepper-google-button-slot" class="stepper-google-google-btn mt-6 flex justify-center"></div>
          </div>
        </div>
      `;
    }

    const signoutBtn = page.querySelector('[data-stepper-action="signout"]');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', () => {
        clearSession();
        renderPages();
      });
    }
    const sendHostBtn = page.querySelector('[data-stepper-action="send-host"]');
    if (sendHostBtn) sendHostBtn.addEventListener('click', () => requestModeration('feature'));
    const uploadSiteBtn = page.querySelector('[data-stepper-action="upload-site"]');
    if (uploadSiteBtn) uploadSiteBtn.addEventListener('click', () => requestModeration('site'));
    const openSubBtn = page.querySelector('[data-stepper-action="open-subscription"]');
    if (openSubBtn) openSubBtn.addEventListener('click', () => { openPage('subscription'); renderPages(); });

    renderGoogleButton();
    renderPresenceOnly();
  }


  function renderSubscriptionPage(){
    const page = document.getElementById(SUBSCRIPTION_PAGE_ID);
    if (!page) return;
    const theme = themeClasses();
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    if (!(state.session && state.session.credential)) {
      page.innerHTML = `
        <div class="px-6 py-5 border-b ${theme.panel}">
          <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconMedal()}</span> Subscription</h2>
        </div>
        <div class="p-6 sm:p-8"><div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-black">Sign in first.</p><p class="mt-2 text-sm ${theme.subtle}">Subscription and Premium tools show up after Google sign-in.</p></div></div>`;
      return;
    }
    const sub = state.subscription || { isPremium:false, plan:'free', status:'free' };
    const active = isPremiumSession();
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconMedal()}</span> Subscription</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div><div class="text-lg font-black tracking-tight">Your plan</div><p class="mt-1 text-sm ${theme.subtle}">${active ? 'Premium is active. Priority feature requests go to the top of the admin queue and the AI site helper is unlocked.' : 'Free members can sign in and save. Premium unlocks the AI site helper and priority review.'}</p></div>
            <span class="stepper-google-pill ${theme.orange}">${escapeHtml(paymentStatusLabel())}</span>
          </div>
        </div>
        <div class="stepper-google-grid">
          <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
            <div class="text-lg font-black tracking-tight">Premium monthly</div>
            <p class="mt-2 text-sm ${theme.subtle}">NZ$12.50 per month. Priority admin review, premium recognition, and the paid AI site helper.</p>
            <button type="button" data-subscribe-plan="monthly" class="stepper-google-cta ${theme.button}" style="margin-top:16px;">Start monthly</button>
          </article>
          <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
            <div class="text-lg font-black tracking-tight">Premium yearly</div>
            <p class="mt-2 text-sm ${theme.subtle}">NZ$100 per year. Same perks, cheaper across the year, and priority review stays active.</p>
            <button type="button" data-subscribe-plan="yearly" class="stepper-google-cta ${theme.button}" style="margin-top:16px;">Start yearly</button>
          </article>
        </div>
      </div>`;
    page.querySelectorAll('[data-subscribe-plan]').forEach((button)=>{
      button.addEventListener('click', ()=> createCheckout(button.getAttribute('data-subscribe-plan') || 'monthly'));
    });
  }

  function renderAdminPage(){
    const page = document.getElementById(ADMIN_PAGE_ID);
    if (!page) return;
    const theme = themeClasses();
    if (!isAdminSession()) {
      page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
      page.innerHTML = `
        <div class="px-6 py-5 border-b ${theme.panel}">
          <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconShield()}</span> Admin</h2>
        </div>
        <div class="p-6 sm:p-8">
          <div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}">
            <p class="text-lg font-black">Admin access only.</p>
            <p class="mt-2 text-sm ${theme.subtle}">Sign in as ${escapeHtml(ADMIN_EMAIL)} to see the full dance registry and feature dances.</p>
          </div>
        </div>
      `;
      return;
    }

    const pendingCards = state.submissions.length ? state.submissions.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-stepper-submission-id="${escapeHtml(item.id)}">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap items-center gap-3"><h3 class="text-lg font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}</h3><span class="stepper-google-pill ${theme.orange}">${escapeHtml(item.requestType || 'request')}</span></div>
            <p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.ownerName || item.ownerEmail || 'Member')} • ${escapeHtml(item.ownerEmail || '')}${item.priority ? ' • Premium priority' : ''}</p>
          </div>
          <div class="stepper-google-badge-row">
            ${item.requestType === 'site' ? `<button type="button" class="stepper-google-cta ${theme.button}" data-action="approve-site">Approve upload</button>` : ''}
            <button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="reject-submission">Delete confirmation</button>
          </div>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-black">No pending requests.</p><p class="mt-2 text-sm ${theme.subtle}">Feature and upload requests from members will show here.</p></div>`;

    const cards = state.adminDances.length ? state.adminDances.map(item => {
      const featurePill = item.isFeatured ? `<span class="stepper-google-pill ${theme.orange}">${iconMedal()} Featured</span>` : '';
      return `
        <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-stepper-registry-id="${escapeHtml(item.registryId)}">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-3">
                <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}</h3>
                ${featurePill}
              </div>
              <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer || 'Uncredited')}${item.country ? ` (${escapeHtml(item.country)})` : ''}</p>
              <p class="mt-2 text-sm ${theme.subtle}">By ${escapeHtml(item.ownerName || item.ownerEmail || 'Unknown member')} • ${escapeHtml(item.ownerEmail || '')}</p>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.dark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(item.level || 'Unlabelled')}</span>
          </div>
          <div class="mt-4 stepper-google-grid text-sm">
            <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts || '-')}</div></div>
            <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls || '-')}</div></div>
            <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections || 0))}</div></div>
            <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
          </div>
          <p class="mt-4 text-sm ${theme.subtle}">Updated ${escapeHtml(formatDate(item.updatedAt))}</p>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" class="stepper-google-badge-btn" data-action="feature" data-tone="bronze">Bronze</button>
            <button type="button" class="stepper-google-badge-btn" data-action="feature" data-tone="silver">Silver</button>
            <button type="button" class="stepper-google-badge-btn" data-action="feature" data-tone="gold">Gold</button>
            ${item.isFeatured ? `<button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="unfeature">Remove feature</button>` : ''}
          </div>
        </article>
      `;
    }).join('') : `
      <div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}">
        <p class="text-lg font-black">No dances in the registry yet.</p>
        <p class="mt-2 text-sm ${theme.subtle}">Once signed-in members build dances, they will start appearing here automatically.</p>
      </div>
    `;

    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconShield()}</span> Admin</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="text-lg font-black tracking-tight">Registry overview</div>
              <p class="mt-1 text-sm ${theme.subtle}">Click a badge to feature a dance. The public Featured Choreo tab refreshes from the backend list.</p>
            </div>
            <div class="stepper-google-badge-row">
              <span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.adminDances.length))} dances</span>
              <span class="stepper-google-pill ${theme.orange}"><span data-stepper-online-count>${escapeHtml((state.presence && state.presence.onlineCount) || 0)}</span> online</span>
            </div>
          </div>
        </div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Pending member requests</div><p class="mt-1 text-sm ${theme.subtle}">Approve uploads, reject requests, or feature dances with a badge.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.submissions.length))} pending</span></div></div>
        ${pendingCards}
        ${cards}
      </div>
    `;

    page.querySelectorAll('[data-stepper-submission-id]').forEach(card => {
      const submissionId = card.getAttribute('data-stepper-submission-id');
      const rejectBtn = card.querySelector('[data-action="reject-submission"]');
      if (rejectBtn) rejectBtn.addEventListener('click', () => rejectSubmission(submissionId));
      const approveBtn = card.querySelector('[data-action="approve-site"]');
      if (approveBtn) approveBtn.addEventListener('click', () => approveSiteSubmission(submissionId));
    });

    page.querySelectorAll('[data-stepper-registry-id]').forEach(card => {
      const registryId = card.getAttribute('data-stepper-registry-id');
      card.querySelectorAll('[data-action="feature"]').forEach(button => {
        button.addEventListener('click', () => {
          featureDance(registryId, button.getAttribute('data-tone') || 'bronze');
        });
      });
      const unfeatureBtn = card.querySelector('[data-action="unfeature"]');
      if (unfeatureBtn) {
        unfeatureBtn.addEventListener('click', () => {
          unfeatureDance(registryId);
        });
      }
    });
  }

  function syncPageVisibility(){
    const host = ensureHost();
    const signInPage = document.getElementById(SIGNIN_PAGE_ID);
    const adminPage = document.getElementById(ADMIN_PAGE_ID);
    const subscriptionPage = document.getElementById(SUBSCRIPTION_PAGE_ID);
    const showSignIn = state.activePage === 'signin';
    const showSubscription = state.activePage === 'subscription';
    const showAdmin = state.activePage === 'admin';
    setVisibility(signInPage, showSignIn);
    setVisibility(subscriptionPage, showSubscription);
    setVisibility(adminPage, showAdmin);
    host.hidden = !state.activePage;
    host.style.display = state.activePage ? '' : 'none';
  }

  function patchFeaturedPageCopy(){
    const page = document.getElementById('stepper-featured-choreo-page');
    if (!page) return;
    const noteCard = page.querySelector('.rounded-2xl.border.p-5');
    if (!noteCard) return;
    if (noteCard.dataset.stepperAdminPatched === 'true') return;
    noteCard.dataset.stepperAdminPatched = 'true';
    const theme = themeClasses();
    noteCard.innerHTML = `<p class="text-base sm:text-lg font-bold leading-relaxed">Featured dances now come from the admin workflow instead of Gmail submissions. Signed-in members can have their work auto-synced to the registry, and the admin account decides what gets a Bronze, Silver, or Gold feature badge.</p><p class="mt-3 text-sm ${theme.subtle}">Public members can still browse everything here once it has been featured.</p>`;
  }

  function renderPages(){
    locateUi();
    ensureHost();
    renderSignInPage();
    renderSubscriptionPage();
    renderAdminPage();
    syncPageVisibility();
    renderPresenceOnly();
    patchFeaturedPageCopy();
    updateAdminTabVisibility();
    updateTabButtons();
    renderQuickActions();
    patchSavedDancesPage();
    renderSaveButton();
    renderFeatureBadge();
    renderSiteHelper();
    showNotificationToasts();
  }

  async function prime(){
    ensureStyles();
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      const savedBase = normalizeApiBase(localStorage.getItem(API_BASE_KEY) || '');
      const preferredBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000' : DEFAULT_BACKEND_BASE;
      if (!savedBase || savedBase === 'http://localhost:3000' || savedBase === 'https://localhost:3000' || savedBase === normalizeApiBase(location.origin)) saveApiBase(preferredBase);
      await chooseWorkingApiBase(state.apiBase || preferredBase);
    }
    if (!locateUi()) return;
    ensureHost();
    wireStartupBackendBase();
    await refreshConfig();
    await refreshPresence();
    if (state.session && state.session.credential) {
      await refreshSession();
      await heartbeat();
      await refreshCloudSaves();
      await restoreLatestCloudSaveIfNeeded();
      await syncCurrentDanceToBackend(false);
      await refreshNotifications();
      await refreshSubscription();
      await confirmCheckoutIfPresent();
      if (isAdminSession()) { await refreshAdminDances(); await refreshSubmissions(); }
    }
    await syncFeaturedFromBackend();
    renderPages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prime, { once:true });
  } else {
    prime();
  }

  setInterval(() => {
    if (!locateUi()) return;
    ensureHost();
    wireStartupBackendBase();
    updateAdminTabVisibility();
    updateTabButtons();
    renderPresenceOnly();
    patchFeaturedPageCopy();
    patchSavedDancesPage();
    renderSaveButton();
  }, 2200);

  setInterval(() => {
    syncCurrentDanceToBackend(false);
    renderSaveButton();
  }, SYNC_INTERVAL_MS);

  setInterval(() => {
    refreshPresence();
    if (state.session && state.session.credential) heartbeat();
  }, PRESENCE_INTERVAL_MS);

  setInterval(() => {
    syncFeaturedFromBackend();
    patchFeaturedPageCopy();
    if (state.session && state.session.credential) { refreshNotifications(); refreshSubscription(); }
    if (isAdminSession()) { refreshAdminDances(); refreshSubmissions(); }
  }, FEATURED_SYNC_INTERVAL_MS);

  window.addEventListener('beforeunload', (event) => {
    if (!hasUnsavedChanges()) return;
    event.preventDefault();
    event.returnValue = '';
  });

  window.addEventListener('storage', () => {
    if (state.session && state.session.credential) syncCurrentDanceToBackend(false);
    renderPages();
  });

  async function refreshSubscription(){
    if (!state.session || !state.session.credential) {
      state.subscription = { isPremium: false, plan: 'free', status: 'free', source: 'signed-out' };
      return state.subscription;
    }
    try {
      const data = await authFetch('/api/subscription/status');
      state.subscription = Object.assign({ isPremium: false, plan: 'free', status: 'free', source: 'backend' }, data || {});
      return state.subscription;
    } catch (error) {
      state.subscription = { isPremium: isAdminSession(), plan: isAdminSession() ? 'admin' : 'free', status: isAdminSession() ? 'active' : 'free', source: 'fallback' };
      return state.subscription;
    }
  }

  async function createCheckout(plan){
    if (!state.session || !state.session.credential) {
      openPage('signin');
      renderPages();
      return;
    }
    try {
      const data = await authFetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          returnOrigin: location.origin,
          returnPath: location.pathname + location.search,
          backendBase: state.apiBase || DEFAULT_BACKEND_BASE
        })
      });
      if (data && data.alreadyPremium) {
        await refreshSubscription();
        renderPages();
        alert('Premium is already active on this account.');
        return;
      }
      if (data && data.url) {
        location.href = data.url;
        return;
      }
      throw new Error((data && data.error) || 'Checkout link could not be created.');
    } catch (error) {
      alert(error.message || 'Could not start checkout.');
    }
  }

  async function confirmCheckoutIfPresent(){
    if (!state.session || !state.session.credential) return false;
    const url = new URL(location.href);
    const sessionId = url.searchParams.get('checkout_session_id') || url.searchParams.get('session_id');
    if (!sessionId) return false;
    try {
      await authFetch('/api/subscription/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      await refreshSubscription();
      url.searchParams.delete('checkout_session_id');
      url.searchParams.delete('session_id');
      history.replaceState({}, '', url.toString());
      renderPages();
      return true;
    } catch (error) {
      return false;
    }
  }
})();
