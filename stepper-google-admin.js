(function(){
  if (window.__stepperGoogleAdminInstalled) return;
  window.__stepperGoogleAdminInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const PHR_TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  const FEATURED_CHOREO_KEY = 'stepper_featured_choreo_v1';
  const SESSION_KEY = 'stepper_google_auth_session_v2';
  const API_BASE_KEY = 'stepper_api_base_v1';
  const SIGNIN_PAGE_ID = 'stepper-google-signin-page';
  const ADMIN_PAGE_ID = 'stepper-google-admin-page';
  const HOST_ID = 'stepper-google-admin-host';
  const SIGNIN_TAB_ID = 'stepper-google-signin-tab';
  const ADMIN_TAB_ID = 'stepper-google-admin-tab';
  const ADMIN_EMAIL = 'anthonytau4@gmail.com';
  const DEFAULT_RENDER_SERVICE_ID = 'srv-d6ss4295pdvs73e1iifg';
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
    lastSyncedSignature: '',
    ui: {
      buildBtn: null,
      sheetBtn: null,
      tabStrip: null,
      mainEl: null,
      footerWrap: null,
      host: null,
      signInBtn: null,
      adminBtn: null
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
    if (location.protocol === 'http:' || location.protocol === 'https:') return normalizeApiBase(location.origin);
    return 'http://localhost:3000';
  }

  function saveApiBase(value){
    const normalized = normalizeApiBase(value);
    state.apiBase = normalized || 'http://localhost:3000';
    localStorage.setItem(API_BASE_KEY, state.apiBase);
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
    saveSession(null);
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch {}
  }

  function isAdminSession(){
    return normalizeEmail(state.session && state.session.profile && state.session.profile.email) === normalizeEmail(ADMIN_EMAIL)
      || !!(state.session && state.session.isAdmin);
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
    if (!button || typeof button.scrollIntoView !== 'function') return;
    try {
      button.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' });
    } catch {}
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
      .stepper-google-google-btn > div { display:flex; justify-content:flex-start; }
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

    state.ui.adminBtn = makeTabButton('Admin', iconShield(), 'admin', ADMIN_TAB_ID);
    if (!state.ui.adminBtn.parentNode) {
      if (state.ui.signInBtn && state.ui.signInBtn.parentNode === tabStrip) state.ui.signInBtn.insertAdjacentElement('afterend', state.ui.adminBtn);
      else tabStrip.appendChild(state.ui.adminBtn);
    }

    if (!tabStrip.__stepperGoogleAdminCloseWired) {
      tabStrip.__stepperGoogleAdminCloseWired = true;
      tabStrip.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const own = button.id === SIGNIN_TAB_ID || button.id === ADMIN_TAB_ID;
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
    host.innerHTML = `<div class="space-y-5"><section id="${SIGNIN_PAGE_ID}" hidden style="display:none"></section><section id="${ADMIN_PAGE_ID}" hidden style="display:none"></section></div>`;
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
    state.activePage = pageName === 'admin' ? 'admin' : 'signin';
    const host = ensureHost();
    host.hidden = false;
    host.style.display = '';
    hideNativeExtraHost();
    if (state.ui.mainEl) state.ui.mainEl.style.display = 'none';
    if (state.ui.footerWrap) state.ui.footerWrap.style.display = 'none';
    renderPages();
    updateTabButtons();
    host.scrollIntoView({ block:'start', behavior:'smooth' });
  }

  function updateAdminTabVisibility(){
    if (!state.ui.adminBtn) return;
    const visible = isAdminSession();
    state.ui.adminBtn.style.display = visible ? '' : 'none';
    state.ui.adminBtn.hidden = !visible;
    if (!visible && state.activePage === 'admin') {
      state.activePage = 'signin';
    }
  }

  async function fetchJson(path, options){
    const url = `${normalizeApiBase(state.apiBase)}${path}`;
    const response = await fetch(url, options || {});
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    if (!response.ok || !data || data.ok === false) {
      const message = data && data.error ? data.error : `Request failed (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }
    return data;
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
      state.config = await fetchJson('/api/auth/config');
      if (state.config && state.config.adminEmail) {
        // purely informational, not authoritative on the client.
      }
      return state.config;
    } catch (error) {
      state.config = {
        ok: false,
        googleEnabled: false,
        googleClientId: '',
        error: error.message || 'Could not reach backend.'
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
      await syncCurrentDanceToBackend(true);
      await syncFeaturedFromBackend();
      if (isAdminSession()) await refreshAdminDances();
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
    if (!state.config || !state.config.googleEnabled || !state.config.googleClientId) {
      container.innerHTML = `
        <button type="button" disabled class="stepper-google-cta ${theme.button}" style="width:280px;max-width:100%;opacity:.65;cursor:not-allowed">Sign in with Google</button>
        <p class="mt-3 text-sm ${theme.subtle}">Google sign-in is not ready on the backend yet.</p>
      `;
      return;
    }
    try {
      await ensureGsiLoaded();
      if (!(window.google && window.google.accounts && window.google.accounts.id)) {
        container.innerHTML = `<p class="text-sm ${theme.subtle}">Google sign-in could not load right now.</p>`;
        return;
      }
      if (state.gisClientId !== state.config.googleClientId) {
        window.google.accounts.id.initialize({
          client_id: state.config.googleClientId,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true
        });
        state.gisClientId = state.config.googleClientId;
      }
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: isDarkMode() ? 'filled_black' : 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 280
      });
    } catch (error) {
      container.innerHTML = `<p class="text-sm ${theme.subtle}">${escapeHtml(error.message || 'Google button could not load.')}</p>`;
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

  async function syncCurrentDanceToBackend(force){
    if (state.busy.sync) return false;
    if (!state.session || !state.session.credential) return false;
    const entry = buildCurrentDanceEntry();
    if (!entry) return false;
    const signature = buildDanceSignature(entry);
    if (!force && signature && signature === state.lastSyncedSignature) return false;
    state.busy.sync = true;
    try {
      await authFetch('/api/cloud-saves/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entry })
      });
      state.lastSyncedSignature = signature;
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

  async function featureDance(registryId, tone){
    if (!registryId || state.busy.feature) return;
    state.busy.feature = true;
    try {
      await authFetch('/api/admin/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registryId,
          badgeTone: tone,
          badgeLabel: badgeLabelForTone(tone)
        })
      });
      await refreshAdminDances();
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
    const backendError = state.config && state.config.error ? state.config.error : '';
    const onlineCount = (state.presence && state.presence.onlineCount) || 0;
    const setupTrouble = !!backendError || !(state.config && state.config.googleEnabled);

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
                <p class="mt-3 text-sm ${theme.subtle}">Your dances now sync into the backend registry automatically.</p>
              </div>
              <div class="stepper-google-badge-row">
                <span class="stepper-google-pill ${theme.orange}"><span data-stepper-online-count>${escapeHtml(onlineCount)}</span> online</span>
                ${isAdminSession() ? `<span class="stepper-google-pill ${theme.orange}">${iconShield()} Admin</span>` : ''}
                <button type="button" data-stepper-action="signout" class="stepper-google-cta stepper-google-danger ${theme.button}">Sign out</button>
              </div>
            </div>
            ${setupTrouble ? `
              <details class="mt-5 rounded-2xl border p-4 ${theme.panel}">
                <summary class="cursor-pointer text-sm font-black uppercase tracking-widest">Connection help</summary>
                ${backendError ? `<p class="mt-3 text-sm text-red-500">${escapeHtml(backendError)}</p>` : ''}
                ${!(state.config && state.config.googleEnabled) ? `<p class="mt-3 text-sm ${theme.subtle}">Google sign-in is not ready on the backend yet.</p>` : ''}
                <div class="mt-4 flex flex-col sm:flex-row gap-3">
                  <input id="stepper-api-base-input" class="stepper-google-input ${theme.button}" value="${escapeHtml(state.apiBase)}" placeholder="https://your-backend.onrender.com" />
                  <button type="button" data-stepper-action="save-api-base" class="stepper-google-cta ${theme.button}">Save backend URL</button>
                </div>
              </details>
            ` : ''}
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
            ${setupTrouble ? `
              <details class="mt-5 rounded-2xl border p-4 ${theme.panel}">
                <summary class="cursor-pointer text-sm font-black uppercase tracking-widest">Connection help</summary>
                ${backendError ? `<p class="mt-3 text-sm text-red-500">${escapeHtml(backendError)}</p>` : ''}
                ${!(state.config && state.config.googleEnabled) ? `<p class="mt-3 text-sm ${theme.subtle}">Google sign-in is not ready on the backend yet.</p>` : ''}
                <div class="mt-4 flex flex-col sm:flex-row gap-3">
                  <input id="stepper-api-base-input" class="stepper-google-input ${theme.button}" value="${escapeHtml(state.apiBase)}" placeholder="https://your-backend.onrender.com" />
                  <button type="button" data-stepper-action="save-api-base" class="stepper-google-cta ${theme.button}">Save backend URL</button>
                </div>
              </details>
            ` : ''}
          </div>
        </div>
      `;
    }

    const saveBtn = page.querySelector('[data-stepper-action="save-api-base"]');
    const apiInput = page.querySelector('#stepper-api-base-input');
    if (saveBtn && apiInput) {
      saveBtn.addEventListener('click', async () => {
        saveApiBase(apiInput.value || '');
        await refreshConfig();
        await refreshPresence();
        if (state.session) await refreshSession();
        renderPages();
      });
    }

    const signoutBtn = page.querySelector('[data-stepper-action="signout"]');
    if (signoutBtn) {
      signoutBtn.addEventListener('click', () => {
        clearSession();
        renderPages();
      });
    }

    renderGoogleButton();
    renderPresenceOnly();
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
        ${cards}
      </div>
    `;

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
    const showSignIn = state.activePage === 'signin';
    const showAdmin = state.activePage === 'admin';
    setVisibility(signInPage, showSignIn);
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
    renderAdminPage();
    syncPageVisibility();
    renderPresenceOnly();
    patchFeaturedPageCopy();
    updateAdminTabVisibility();
    updateTabButtons();
  }

  async function prime(){
    ensureStyles();
    if (!locateUi()) return;
    ensureHost();
    await refreshConfig();
    await refreshPresence();
    if (state.session && state.session.credential) {
      await refreshSession();
      await heartbeat();
      await syncCurrentDanceToBackend(false);
      if (isAdminSession()) await refreshAdminDances();
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
    updateAdminTabVisibility();
    updateTabButtons();
    renderPresenceOnly();
    patchFeaturedPageCopy();
    if (state.activePage) renderPages();
  }, 2200);

  setInterval(() => {
    syncCurrentDanceToBackend(false);
  }, SYNC_INTERVAL_MS);

  setInterval(() => {
    refreshPresence();
    if (state.session && state.session.credential) heartbeat();
  }, PRESENCE_INTERVAL_MS);

  setInterval(() => {
    syncFeaturedFromBackend();
    patchFeaturedPageCopy();
    if (isAdminSession()) refreshAdminDances();
  }, FEATURED_SYNC_INTERVAL_MS);

  window.addEventListener('storage', () => {
    if (state.session && state.session.credential) syncCurrentDanceToBackend(false);
    renderPages();
  });
})();
