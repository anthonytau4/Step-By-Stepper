(function(){
  if (window.__stepperGoogleAdminInstalled) return;
  window.__stepperGoogleAdminInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const PHR_TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  const GOOGLE_FRONTEND_KEY = 'stepper_google_frontend_profile_v1';
  const FEATURED_CHOREO_KEY = 'stepper_featured_choreo_v1';
  const API_BASE_KEY = 'stepper_api_base_v1';
  const TOKEN_KEY = 'stepper_google_id_token_v1';
  const PROFILE_KEY = 'stepper_google_backend_profile_v1';
  const ONLINE_COUNT_KEY = 'stepper_online_members_v1';
  const SIGN_IN_PAGE_ID = 'stepper-google-signin-page';
  const ADMIN_PAGE_ID = 'stepper-google-admin-page';
  const SIGN_IN_TAB_ID = 'stepper-google-signin-tab';
  const ADMIN_TAB_ID = 'stepper-google-admin-tab';
  const ADMIN_EMAIL = 'anthonytau4@gmail.com';

  let activeOwnPage = null;
  let host = null;
  let hostStack = null;
  let signInPage = null;
  let adminPage = null;
  let tabStrip = null;
  let buildBtn = null;
  let sheetBtn = null;
  let whatsNewBtn = null;
  let savedBtn = null;
  let featuredBtn = null;
  let signInBtn = null;
  let adminBtn = null;
  let mainEl = null;
  let footerWrap = null;
  let configCache = null;
  let configPromise = null;
  let adminDanceCache = [];
  let authMessage = '';
  let onlineMembers = Number(localStorage.getItem(ONLINE_COUNT_KEY) || '0') || 0;
  let lastSyncSignature = '';
  let syncBusy = false;

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

  function readAppData(){
    return readJson(DATA_KEY, null);
  }

  function isDarkMode(){
    const data = readAppData();
    return !!(data && data.isDarkMode);
  }

  function theme(){
    const dark = isDarkMode();
    return {
      dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500',
      button: dark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      accent: dark ? 'bg-indigo-900/40 text-indigo-200 border border-indigo-700/70' : 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      orange: dark ? 'bg-orange-500/15 text-orange-200 border border-orange-400/30' : 'bg-orange-50 text-orange-700 border border-orange-200'
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

  function formatDate(iso){
    try { return new Date(iso).toLocaleString(); } catch { return 'Recently'; }
  }

  function iconGoogle(){
    return '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24"><path fill="#ff808c" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m20.0157 4.47237 -2.7835 2.62086c-0.7631 -0.81506 -1.7062 -1.44047 -2.754 -1.82632 -1.0477 -0.38585 -2.1712 -0.52146 -3.2807 -0.39602 -1.1095 0.12544 -2.17428 0.50848 -3.10944 1.11853 -0.93517 0.61005 -1.7148 1.43024 -2.27669 2.39511l-3.01303 -2.3913c0.90798 -1.39584 2.12153 -2.56691 3.54884 -3.42459 1.4273 -0.85768 3.03097 -1.37953 4.68972 -1.52605 1.6587 -0.146517 3.329 0.08612 4.8846 0.68032 1.5555 0.5942 2.9556 1.5344 4.0942 2.74946Z" stroke-width="1"></path><path fill="#ffef5e" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m5.8496 15.6732 -2.87912 2.5922c-1.2527 -1.7938 -1.93871 -3.922 -1.9694 -6.1097 -0.030695 -2.18766 0.59534 -4.33427 1.79723 -6.16247l3.01303 2.39129c-0.65148 1.10544 -0.99188 2.36648 -0.98514 3.64958 0.00674 1.2831 0.36035 2.5406 1.0234 3.6391Z" stroke-width="1"></path><path fill="#78eb7b" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M18.8298 20.6376c-1.1798 0.9299 -2.5374 1.6084 -3.9893 1.9939 -1.4519 0.3854 -2.9673 0.4696 -4.4529 0.2474 -1.48566 -0.2222 -2.9101 -0.7462 -4.18565 -1.5396 -1.27554 -0.7934 -2.37519 -1.8395 -3.23125 -3.0739l2.87912 -2.5921c0.51308 0.8604 1.20068 1.6039 2.01853 2.1825 0.81785 0.5785 1.74782 0.9794 2.73005 1.1767 0.9821 0.1974 1.9948 0.1868 2.9726 -0.031 0.9779 -0.2178 1.8993 -0.6379 2.7049 -1.2334l2.5539 2.8695Z" stroke-width="1"></path><path fill="#66e1ff" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M22.9998 10.5654v2.0087c-0.0814 1.5634 -0.4954 3.0915 -1.2146 4.482 -0.7192 1.3906 -1.727 2.6116 -2.9559 3.5815l-2.5539 -2.8696c1.1579 -0.8459 2.0317 -2.0233 2.5061 -3.3765h-5.3469v-3.8261h9.5652Z" stroke-width="1"></path></svg>';
  }
  function iconUser(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="8" r="4"></circle></svg>';
  }
  function iconUsers(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
  }
  function iconShield(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="M9 12l2 2 4-4"></path></svg>';
  }

  function injectStyles(){
    if (document.getElementById('stepper-google-admin-style')) return;
    const style = document.createElement('style');
    style.id = 'stepper-google-admin-style';
    style.textContent = `
      .stepper-google-admin-icon { display:inline-flex; align-items:center; justify-content:center; width:1.4rem; height:1.4rem; }
      .stepper-google-admin-icon svg { width:100%; height:100%; }
      .stepper-google-admin-tab { flex-shrink:0; }
      .stepper-google-admin-actions button,
      .stepper-google-admin-actions a,
      .stepper-google-admin-btn,
      .stepper-google-admin-danger {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:.5rem;
        min-height:2.75rem;
        border-radius:1rem;
        padding:.7rem 1rem;
        font-weight:800;
        line-height:1;
        transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease;
      }
      .stepper-google-admin-btn:hover,
      .stepper-google-admin-danger:hover { transform:translateY(-1px); }
      .stepper-google-admin-google-slot > div { display:flex; justify-content:flex-start; }
    `;
    document.head.appendChild(style);
  }

  function getApiBase(){
    const local = String(localStorage.getItem(API_BASE_KEY) || '').trim();
    const global = String(window.STEPPER_API_BASE || '').trim();
    return (global || local).replace(/\/+$/, '');
  }

  function setApiBase(value){
    const safe = String(value || '').trim().replace(/\/+$/, '');
    if (safe) localStorage.setItem(API_BASE_KEY, safe);
    else localStorage.removeItem(API_BASE_KEY);
    configCache = null;
  }

  function getToken(){ return String(localStorage.getItem(TOKEN_KEY) || '').trim(); }
  function setToken(value){
    const safe = String(value || '').trim();
    if (safe) localStorage.setItem(TOKEN_KEY, safe);
    else localStorage.removeItem(TOKEN_KEY);
  }

  function getProfile(){
    const profile = readJson(PROFILE_KEY, null);
    if (!profile || typeof profile !== 'object') return null;
    const email = String(profile.email || '').trim();
    if (!email) return null;
    return {
      name: String(profile.name || email.split('@')[0] || 'Member').trim(),
      email,
      picture: String(profile.picture || '').trim(),
      isAdmin: String(email).toLowerCase() === ADMIN_EMAIL || !!profile.isAdmin
    };
  }

  function saveFrontendProfile(profile){
    if (!profile || !profile.email) return;
    writeJson(GOOGLE_FRONTEND_KEY, {
      name: String(profile.name || '').trim(),
      email: String(profile.email || '').trim(),
      updatedAt: new Date().toISOString()
    });
  }

  function setProfile(profile){
    const safe = profile && profile.email ? {
      name: String(profile.name || '').trim(),
      email: String(profile.email || '').trim(),
      picture: String(profile.picture || '').trim(),
      isAdmin: String(profile.email || '').trim().toLowerCase() === ADMIN_EMAIL || !!profile.isAdmin
    } : null;
    if (!safe) {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(GOOGLE_FRONTEND_KEY);
      return null;
    }
    writeJson(PROFILE_KEY, safe);
    saveFrontendProfile(safe);
    return safe;
  }

  function clearSession(){
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(GOOGLE_FRONTEND_KEY);
    adminDanceCache = [];
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try { window.google.accounts.id.disableAutoSelect(); } catch {}
    }
  }

  function setOnlineCount(value){
    onlineMembers = Math.max(0, Number(value) || 0);
    localStorage.setItem(ONLINE_COUNT_KEY, String(onlineMembers));
  }

  function getOnlineCount(){
    return Math.max(0, Number(localStorage.getItem(ONLINE_COUNT_KEY) || String(onlineMembers)) || 0);
  }

  async function fetchJson(path, { method = 'GET', auth = false, body, headers = {} } = {}){
    const base = getApiBase();
    if (!base) throw new Error('Add your backend URL first.');
    const requestHeaders = Object.assign({}, headers);
    if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
    if (auth) {
      const token = getToken();
      if (!token) throw new Error('You are not signed in yet.');
      requestHeaders.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(base + path, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    let data = null;
    try { data = await response.json(); } catch { data = null; }
    if (!response.ok || !data || data.ok === false) {
      throw new Error((data && data.error) || `Request failed (${response.status})`);
    }
    return data;
  }

  async function getConfig(force = false){
    if (configCache && !force) return configCache;
    if (configPromise && !force) return configPromise;
    configPromise = (async () => {
      const base = getApiBase();
      if (!base) {
        configCache = { ok: false, googleEnabled: false, googleClientId: '', adminEmail: ADMIN_EMAIL };
        return configCache;
      }
      try {
        configCache = await fetchJson('/api/auth/config');
      } catch {
        configCache = { ok: false, googleEnabled: false, googleClientId: '', adminEmail: ADMIN_EMAIL };
      }
      return configCache;
    })();
    const result = await configPromise;
    configPromise = null;
    return result;
  }

  async function loadGoogleScript(){
    if (window.google && window.google.accounts && window.google.accounts.id) return true;
    const existing = document.getElementById('stepper-google-gsi-script');
    if (existing) {
      return await new Promise((resolve) => {
        const started = Date.now();
        const check = () => {
          if (window.google && window.google.accounts && window.google.accounts.id) return resolve(true);
          if (Date.now() - started > 7000) return resolve(false);
          setTimeout(check, 120);
        };
        check();
      });
    }
    return await new Promise((resolve) => {
      const script = document.createElement('script');
      script.id = 'stepper-google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  async function ensureGoogleReady(){
    const config = await getConfig();
    if (!config.googleEnabled || !config.googleClientId) return false;
    const ready = await loadGoogleScript();
    if (!ready || !(window.google && window.google.accounts && window.google.accounts.id)) return false;
    if (window.__stepperGoogleAdminClientId !== config.googleClientId) {
      window.__stepperGoogleAdminClientId = config.googleClientId;
      window.google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: async (response) => {
          const credential = String(response && response.credential || '').trim();
          if (!credential) return;
          try {
            const result = await fetchJson('/api/auth/google', { method: 'POST', body: { credential } });
            setToken(credential);
            const profile = setProfile(result.profile || {});
            authMessage = profile ? `Signed in as ${profile.email}.` : 'Signed in.';
            await pingPresence();
            await refreshFeatured(true);
            if (profile && profile.isAdmin) await fetchAdminDances(true);
            renderOwnPages();
            ensureTabs();
          } catch (error) {
            authMessage = error && error.message ? error.message : 'Google sign-in failed.';
            renderOwnPages();
          }
        }
      });
    }
    return true;
  }

  async function renderGoogleButton(slot){
    if (!slot) return;
    const ready = await ensureGoogleReady();
    if (!ready) {
      slot.innerHTML = `<p class="text-sm font-semibold ${theme().subtle}">Google sign-in will appear here once your backend URL is set and GOOGLE_CLIENT_ID is live on Render.</p>`;
      return;
    }
    slot.innerHTML = '';
    window.google.accounts.id.renderButton(slot, {
      theme: isDarkMode() ? 'filled_black' : 'outline',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      logo_alignment: 'left'
    });
  }

  async function tryRestoreSession(){
    const token = getToken();
    if (!token || !getApiBase()) return null;
    try {
      const data = await fetchJson('/api/auth/me', { auth: true });
      return setProfile(data.profile || {});
    } catch {
      clearSession();
      return null;
    }
  }

  async function refreshPresence(){
    if (!getApiBase()) return getOnlineCount();
    try {
      const data = await fetchJson('/api/presence');
      setOnlineCount(data.count || data.membersOnline || 0);
    } catch {}
    return getOnlineCount();
  }

  async function pingPresence(){
    if (!getToken() || !getApiBase()) return refreshPresence();
    try {
      const data = await fetchJson('/api/presence/ping', { method: 'POST', auth: true, body: {} });
      setOnlineCount(data.count || data.membersOnline || 0);
    } catch (error) {
      const message = String(error && error.message || '');
      if (/signed in|credential|auth|401|403/i.test(message)) clearSession();
    }
    return getOnlineCount();
  }

  async function refreshFeatured(force = false){
    if (!getApiBase()) return readJson(FEATURED_CHOREO_KEY, []);
    if (!force) {
      const cached = readJson(FEATURED_CHOREO_KEY, []);
      if (Array.isArray(cached) && cached.length) return cached;
    }
    try {
      const data = await fetchJson('/api/featured-choreo');
      writeJson(FEATURED_CHOREO_KEY, Array.isArray(data.items) ? data.items : []);
      window.dispatchEvent(new Event('storage'));
    } catch {}
    return readJson(FEATURED_CHOREO_KEY, []);
  }

  async function fetchAdminDances(force = false){
    const profile = getProfile();
    if (!(profile && profile.isAdmin) || !getApiBase()) {
      adminDanceCache = [];
      return adminDanceCache;
    }
    if (!force && adminDanceCache.length) return adminDanceCache;
    try {
      const data = await fetchJson('/api/admin/dances', { auth: true });
      adminDanceCache = Array.isArray(data.items) ? data.items : [];
    } catch (error) {
      authMessage = error && error.message ? error.message : authMessage;
    }
    return adminDanceCache;
  }

  async function featureDance(ownerKey, danceId, badgeTone){
    const data = await fetchJson('/api/admin/feature', {
      method: 'POST',
      auth: true,
      body: { ownerKey, danceId, badgeTone, badgeLabel: String(badgeTone || 'bronze').replace(/^./, m => m.toUpperCase()) }
    });
    adminDanceCache = Array.isArray(data.items) ? data.items : adminDanceCache;
    await refreshFeatured(true);
    authMessage = 'Featured list updated.';
    renderOwnPages();
  }

  async function unfeatureDance(ownerKey, danceId){
    const data = await fetchJson('/api/admin/feature', {
      method: 'DELETE',
      auth: true,
      body: { ownerKey, danceId }
    });
    adminDanceCache = Array.isArray(data.items) ? data.items : adminDanceCache;
    await refreshFeatured(true);
    authMessage = 'Featured dance removed.';
    renderOwnPages();
  }

  function currentDanceIdentity(data){
    const meta = data && data.meta ? data.meta : {};
    const title = String(meta.title || '').trim();
    const choreographer = String(meta.choreographer || '').trim();
    return {
      id: (title || 'untitled').toLowerCase() + '|' + (choreographer || 'unknown').toLowerCase(),
      title: title || 'Untitled Dance',
      choreographer: choreographer || 'Uncredited'
    };
  }

  function hasDanceContent(data){
    if (!data || !data.meta) return false;
    const identity = currentDanceIdentity(data);
    const sections = Array.isArray(data.sections) ? data.sections : [];
    return !!(identity.title !== 'Untitled Dance' || identity.choreographer !== 'Uncredited' || sections.some(section => Array.isArray(section && section.steps) && section.steps.length));
  }

  function buildSnapshotEntry(data){
    const identity = currentDanceIdentity(data || {});
    const sections = Array.isArray(data && data.sections) ? data.sections : [];
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    return {
      id: identity.id,
      title: identity.title,
      choreographer: identity.choreographer,
      country: String((data && data.meta && data.meta.country) || '').trim(),
      level: String((data && data.meta && data.meta.level) || 'Unlabelled').trim() || 'Unlabelled',
      counts: String((data && data.meta && data.meta.counts) || '-').trim() || '-',
      walls: String((data && data.meta && data.meta.walls) || '-').trim() || '-',
      music: String((data && data.meta && data.meta.music) || '').trim(),
      sections: sections.length,
      steps: stepCount,
      updatedAt: new Date().toISOString(),
      snapshot: {
        data: JSON.parse(JSON.stringify(data || {})),
        phrasedTools: readJson(PHR_TOOLS_KEY, {})
      }
    };
  }

  async function syncCurrentDance(force = false){
    if (!getToken() || !getApiBase() || syncBusy) return false;
    const data = readAppData();
    if (!hasDanceContent(data)) return false;
    const entry = buildSnapshotEntry(data);
    const signature = JSON.stringify({
      id: entry.id,
      title: entry.title,
      choreographer: entry.choreographer,
      counts: entry.counts,
      walls: entry.walls,
      level: entry.level,
      music: entry.music,
      snapshot: entry.snapshot
    });
    if (!force && signature === lastSyncSignature) return false;
    syncBusy = true;
    try {
      await fetchJson('/api/cloud-saves/upsert', { method: 'POST', auth: true, body: { entry } });
      lastSyncSignature = signature;
      await refreshFeatured(true);
      const profile = getProfile();
      if (profile && profile.isAdmin) await fetchAdminDances(true);
      return true;
    } catch (error) {
      const message = String(error && error.message || '');
      authMessage = message || authMessage;
      if (/signed in|credential|auth|401|403/i.test(message)) clearSession();
      return false;
    } finally {
      syncBusy = false;
    }
  }

  function ensureHost(){
    host = document.getElementById('stepper-extra-page-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'stepper-extra-page-host';
      host.hidden = true;
      host.className = 'max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 sm:pb-32 print:hidden';
      host.innerHTML = '<div class="space-y-5"></div>';
      if (mainEl && mainEl.parentNode) mainEl.parentNode.insertBefore(host, footerWrap || mainEl.nextSibling);
      else document.body.appendChild(host);
    }
    hostStack = host.querySelector(':scope > div') || host.firstElementChild;
    if (!hostStack) {
      hostStack = document.createElement('div');
      hostStack.className = 'space-y-5';
      host.appendChild(hostStack);
    }
    signInPage = document.getElementById(SIGN_IN_PAGE_ID);
    if (!signInPage) {
      signInPage = document.createElement('section');
      signInPage.id = SIGN_IN_PAGE_ID;
      signInPage.hidden = true;
      signInPage.style.display = 'none';
      hostStack.appendChild(signInPage);
    }
    adminPage = document.getElementById(ADMIN_PAGE_ID);
    if (!adminPage) {
      adminPage = document.createElement('section');
      adminPage.id = ADMIN_PAGE_ID;
      adminPage.hidden = true;
      adminPage.style.display = 'none';
      hostStack.appendChild(adminPage);
    }
  }

  function locateUi(){
    buildBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'Build') || null;
    sheetBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'Sheet') || null;
    whatsNewBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === "What's New") || null;
    savedBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'My Saved Dances') || null;
    featuredBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'Featured Choreo') || null;
    tabStrip = buildBtn ? buildBtn.parentElement : null;
    mainEl = document.querySelector('main');
    footerWrap = mainEl && mainEl.parentElement ? Array.from(mainEl.parentElement.querySelectorAll('div')).find(node => {
      const cls = node.className || '';
      return typeof cls === 'string' && cls.includes('max-w-4xl') && cls.includes('mx-auto') && cls.includes('pb-10');
    }) || null : null;
    ensureHost();
    return !!(tabStrip && mainEl && signInPage && adminPage);
  }

  function makeTab(label, iconSvg, id){
    const btn = document.createElement('button');
    btn.id = id;
    btn.type = 'button';
    btn.className = 'stepper-google-admin-tab shrink-0 px-2.5 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap opacity-50 hover:opacity-100';
    btn.innerHTML = `<span class="stepper-google-admin-icon">${iconSvg}</span><span>${escapeHtml(label)}</span>`;
    return btn;
  }

  function applyTabState(btn, active){
    if (!btn) return;
    const dark = isDarkMode();
    btn.style.color = dark ? '#ffffff' : (active ? '#4f46e5' : '');
    btn.style.opacity = active ? '1' : (dark ? '.92' : '');
    btn.style.transform = active ? 'translateY(-1px)' : '';
    btn.style.boxShadow = active ? '0 8px 24px rgba(79,70,229,.18)' : '';
    btn.style.background = active ? (dark ? '#2f2f2f' : '#ffffff') : '';
    btn.style.borderColor = active ? (dark ? '#525252' : '#d4d4d8') : '';
  }

  function updateTabStyles(){
    applyTabState(signInBtn, activeOwnPage === 'signin');
    applyTabState(adminBtn, activeOwnPage === 'admin');
    if (adminBtn) adminBtn.style.display = (getProfile() && getProfile().isAdmin) ? '' : 'none';
  }

  function ensureTabs(){
    if (!locateUi()) return false;
    signInBtn = document.getElementById(SIGN_IN_TAB_ID);
    if (!signInBtn) {
      signInBtn = makeTab('Sign In', iconGoogle(), SIGN_IN_TAB_ID);
      if (whatsNewBtn && whatsNewBtn.parentNode === tabStrip) whatsNewBtn.insertAdjacentElement('afterend', signInBtn);
      else tabStrip.appendChild(signInBtn);
      signInBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openOwnPage('signin');
      }, true);
    }

    adminBtn = document.getElementById(ADMIN_TAB_ID);
    if (!adminBtn) {
      adminBtn = makeTab('Admin', iconShield(), ADMIN_TAB_ID);
      if (featuredBtn && featuredBtn.parentNode === tabStrip) featuredBtn.insertAdjacentElement('afterend', adminBtn);
      else if (signInBtn && signInBtn.parentNode === tabStrip) signInBtn.insertAdjacentElement('afterend', adminBtn);
      else tabStrip.appendChild(adminBtn);
      adminBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openOwnPage('admin');
      }, true);
    }

    if (!tabStrip.__stepperGoogleAdminWire) {
      tabStrip.__stepperGoogleAdminWire = true;
      tabStrip.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const text = (button.textContent || '').trim();
        if (text === 'Build' || text === 'Sheet') {
          closeOwnPages(true);
        } else if (text === "What's New" || text === 'My Saved Dances' || text === 'Featured Choreo') {
          closeOwnPages(false);
        }
      }, true);
    }

    updateTabStyles();
    return true;
  }

  function hideOwnSections(){
    ensureHost();
    [signInPage, adminPage].forEach((page) => {
      if (!page) return;
      page.hidden = true;
      page.style.display = 'none';
      page.setAttribute('aria-hidden', 'true');
    });
  }

  function closeOwnPages(showMain){
    activeOwnPage = null;
    hideOwnSections();
    if (showMain) {
      if (mainEl) mainEl.style.display = '';
      if (footerWrap) footerWrap.style.display = '';
      const builtinVisible = hostStack && Array.from(hostStack.children).some((node) => {
        if (!(node instanceof HTMLElement)) return false;
        if (node.id === SIGN_IN_PAGE_ID || node.id === ADMIN_PAGE_ID) return false;
        return !node.hidden && node.style.display !== 'none';
      });
      if (!builtinVisible && host) host.hidden = true;
    }
    updateTabStyles();
  }

  function openOwnPage(pageName){
    const go = async () => {
      if (!ensureTabs()) return;
      activeOwnPage = pageName === 'admin' ? 'admin' : 'signin';
      hideOwnSections();
      if (mainEl) mainEl.style.display = 'none';
      if (footerWrap) footerWrap.style.display = 'none';
      if (host) host.hidden = false;
      const page = activeOwnPage === 'admin' ? adminPage : signInPage;
      if (page) {
        page.hidden = false;
        page.style.display = '';
        page.setAttribute('aria-hidden', 'false');
      }
      if (activeOwnPage === 'admin') await fetchAdminDances(true);
      await refreshPresence();
      renderOwnPages();
      updateTabStyles();
      if (host) host.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    if (window.__stepperRunFaviconTransition) window.__stepperRunFaviconTransition(go, { target: pageName });
    else go();
  }

  function patchFeaturedCopy(){
    const page = document.getElementById('stepper-featured-choreo-page');
    if (!page) return;
    const paragraph = Array.from(page.querySelectorAll('p')).find(node => (node.textContent || '').includes('Featured dancers are best of the best'));
    if (paragraph) {
      paragraph.innerHTML = 'Featured dances are chosen in the admin tab now. Once Anthony signs in, every synced dance can be marked Bronze, Silver, or Gold and it will show up here automatically.';
    }
  }

  function renderSignInPage(){
    ensureHost();
    const ui = theme();
    const config = configCache || { googleEnabled: false, googleClientId: '' };
    const profile = getProfile();
    signInPage.className = `rounded-3xl border shadow-sm overflow-hidden ${ui.shell}`;
    signInPage.innerHTML = `
      <div class="px-6 py-5 border-b ${ui.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-google-admin-icon">${iconGoogle()}</span> Sign In</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${ui.panel}">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="text-lg font-black tracking-tight">Members online</div>
              <p class="mt-1 text-sm ${ui.subtle}">Signed-in members ping the backend while they are using the builder.</p>
            </div>
            <div class="rounded-2xl border px-4 py-3 text-center ${ui.accent}">
              <div class="text-[10px] font-black uppercase tracking-widest">Online now</div>
              <div class="mt-1 text-2xl font-black">${escapeHtml(String(getOnlineCount()))}</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border p-5 ${ui.panel}">
          <label class="block text-[10px] font-black uppercase tracking-widest ${ui.subtle}">Backend URL</label>
          <div class="mt-2 flex flex-col sm:flex-row gap-3">
            <input id="stepper-api-base-input" value="${escapeHtml(getApiBase())}" placeholder="https://your-backend.onrender.com" class="flex-1 px-4 py-3 rounded-2xl border outline-none ${ui.button}" />
            <button type="button" id="stepper-api-base-save" class="stepper-google-admin-btn ${ui.accent}">Save backend URL</button>
          </div>
          <p class="mt-3 text-sm ${ui.subtle}">That Render service ID you sent helps identify the service in your dashboard, but the site still needs the actual public backend URL here.</p>
        </div>

        <div class="rounded-2xl border p-5 ${ui.soft}">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div class="text-lg font-black tracking-tight">Google account</div>
              <p class="mt-1 text-sm ${ui.subtle}">${profile ? `Signed in as ${escapeHtml(profile.email)}` : 'Sign in with Google so your current dance can sync to the backend automatically.'}</p>
              <p class="mt-2 text-xs font-semibold uppercase tracking-widest ${ui.subtle}">Google ready: ${config.googleEnabled ? 'Yes' : 'No'}${config.googleClientId ? ' • Client ID live' : ''}</p>
            </div>
            ${profile ? `<button type="button" id="stepper-google-signout" class="stepper-google-admin-danger ${ui.orange}">Sign out</button>` : ''}
          </div>
          ${profile ? `
            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div class="rounded-2xl border px-4 py-4 ${ui.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${ui.subtle}">Member</div><div class="mt-1 font-bold">${escapeHtml(profile.name || profile.email)}</div></div>
              <div class="rounded-2xl border px-4 py-4 ${ui.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${ui.subtle}">Role</div><div class="mt-1 font-bold">${profile.isAdmin ? 'Admin' : 'Member'}</div></div>
            </div>
          ` : `<div id="stepper-google-button-slot" class="stepper-google-admin-google-slot mt-5"></div>`}
        </div>

        <div class="rounded-2xl border p-5 ${ui.panel}">
          <div class="text-lg font-black tracking-tight">Automatic dance sync</div>
          <p class="mt-2 text-sm leading-relaxed ${ui.subtle}">While a member is signed in, the current dance is sent to the backend automatically. Anthony's admin tab then shows every synced dance, and he can feature it with a Bronze, Silver, or Gold badge.</p>
        </div>

        ${authMessage ? `<div class="rounded-2xl border p-4 ${ui.panel}"><p class="text-sm font-semibold">${escapeHtml(authMessage)}</p></div>` : ''}
      </div>
    `;

    const saveBtn = signInPage.querySelector('#stepper-api-base-save');
    const apiInput = signInPage.querySelector('#stepper-api-base-input');
    if (saveBtn && apiInput) saveBtn.addEventListener('click', async () => {
      setApiBase(apiInput.value);
      authMessage = getApiBase() ? `Backend URL saved as ${getApiBase()}.` : 'Backend URL cleared.';
      await getConfig(true);
      await tryRestoreSession();
      await refreshPresence();
      await refreshFeatured(true);
      if (getProfile() && getProfile().isAdmin) await fetchAdminDances(true);
      renderOwnPages();
    });

    const signOutBtn = signInPage.querySelector('#stepper-google-signout');
    if (signOutBtn) signOutBtn.addEventListener('click', () => {
      clearSession();
      authMessage = 'Signed out.';
      renderOwnPages();
      updateTabStyles();
    });

    const googleSlot = signInPage.querySelector('#stepper-google-button-slot');
    if (googleSlot && !profile) renderGoogleButton(googleSlot);
  }

  function renderAdminPage(){
    ensureHost();
    const ui = theme();
    const profile = getProfile();
    adminPage.className = `rounded-3xl border shadow-sm overflow-hidden ${ui.shell}`;

    if (!(profile && profile.isAdmin)) {
      adminPage.innerHTML = `
        <div class="px-6 py-5 border-b ${ui.panel}">
          <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-google-admin-icon">${iconShield()}</span> Admin</h2>
        </div>
        <div class="p-6 sm:p-8">
          <div class="rounded-2xl border p-6 ${ui.soft}">
            <p class="text-lg font-bold">This tab is only for ${escapeHtml(ADMIN_EMAIL)}.</p>
            <p class="mt-2 text-sm ${ui.subtle}">Sign in with the admin Google account and the full featuring controls will show up here.</p>
          </div>
        </div>
      `;
      return;
    }

    const cards = adminDanceCache.length ? adminDanceCache.map((item) => {
      const dance = item && item.dance ? item.dance : {};
      const featured = item && item.featured ? item.featured : null;
      const badge = featured ? `<span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${ui.orange}">${escapeHtml(featured.badgeLabel || featured.badgeTone || 'Featured')}</span>` : `<span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${ui.accent}">Not featured</span>`;
      return `
        <article class="rounded-3xl border p-5 sm:p-6 ${ui.soft}" data-owner-key="${escapeHtml(item.ownerKey || '')}" data-dance-id="${escapeHtml(dance.id || '')}">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="min-w-0">
              <div class="flex items-center gap-3 flex-wrap">${badge}</div>
              <h3 class="mt-3 text-xl font-black tracking-tight">${escapeHtml(dance.title || 'Untitled Dance')}</h3>
              <p class="mt-1 text-sm font-semibold ${ui.subtle}">${escapeHtml(dance.choreographer || 'Uncredited')}${dance.country ? ` (${escapeHtml(dance.country)})` : ''}</p>
              <p class="mt-2 text-xs font-semibold uppercase tracking-widest ${ui.subtle}">Made by ${escapeHtml(item.ownerName || item.ownerEmail || 'Member')}</p>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-2xl border px-3 py-3 ${ui.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${ui.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(dance.counts || '-')}</div></div>
              <div class="rounded-2xl border px-3 py-3 ${ui.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${ui.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(dance.walls || '-')}</div></div>
              <div class="rounded-2xl border px-3 py-3 ${ui.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${ui.subtle}">Level</div><div class="mt-1 font-bold">${escapeHtml(dance.level || '-')}</div></div>
              <div class="rounded-2xl border px-3 py-3 ${ui.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${ui.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(dance.steps || 0))}</div></div>
            </div>
          </div>
          ${dance.music ? `<p class="mt-4 text-sm leading-relaxed ${ui.subtle}"><strong class="${ui.dark ? 'text-neutral-100' : 'text-neutral-900'}">Music:</strong> ${escapeHtml(dance.music)}</p>` : ''}
          <div class="stepper-google-admin-actions mt-5 flex flex-wrap gap-3">
            <button type="button" data-action="feature" data-badge="bronze" class="stepper-google-admin-btn ${ui.orange}">Bronze</button>
            <button type="button" data-action="feature" data-badge="silver" class="stepper-google-admin-btn ${ui.button}">Silver</button>
            <button type="button" data-action="feature" data-badge="gold" class="stepper-google-admin-btn ${ui.accent}">Gold</button>
            ${featured ? `<button type="button" data-action="unfeature" class="stepper-google-admin-danger ${ui.button}">Remove feature</button>` : ''}
          </div>
        </article>
      `;
    }).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${ui.soft}"><p class="text-lg font-bold">No synced dances yet.</p><p class="mt-2 ${ui.subtle}">Members need to sign in first. Once they do, the current dance starts showing up here automatically.</p></div>`;

    adminPage.innerHTML = `
      <div class="px-6 py-5 border-b ${ui.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-google-admin-icon">${iconShield()}</span> Admin</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${ui.panel}">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="text-lg font-black tracking-tight">Every synced dance</div>
              <p class="mt-1 text-sm ${ui.subtle}">Click Bronze, Silver, or Gold to feature the dance instantly.</p>
            </div>
            <button type="button" id="stepper-admin-refresh" class="stepper-google-admin-btn ${ui.accent}">Refresh list</button>
          </div>
        </div>
        ${cards}
        ${authMessage ? `<div class="rounded-2xl border p-4 ${ui.panel}"><p class="text-sm font-semibold">${escapeHtml(authMessage)}</p></div>` : ''}
      </div>
    `;

    const refreshBtn = adminPage.querySelector('#stepper-admin-refresh');
    if (refreshBtn) refreshBtn.addEventListener('click', async () => {
      await fetchAdminDances(true);
      renderOwnPages();
    });

    adminPage.querySelectorAll('[data-action="feature"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const card = button.closest('[data-owner-key][data-dance-id]');
        if (!card) return;
        await featureDance(card.getAttribute('data-owner-key'), card.getAttribute('data-dance-id'), button.getAttribute('data-badge') || 'bronze');
      });
    });
    adminPage.querySelectorAll('[data-action="unfeature"]').forEach((button) => {
      button.addEventListener('click', async () => {
        const card = button.closest('[data-owner-key][data-dance-id]');
        if (!card) return;
        await unfeatureDance(card.getAttribute('data-owner-key'), card.getAttribute('data-dance-id'));
      });
    });
  }

  function renderOwnPages(){
    ensureHost();
    renderSignInPage();
    renderAdminPage();
    updateTabStyles();
    patchFeaturedCopy();
  }

  async function refreshBackendBits(){
    await getConfig();
    await tryRestoreSession();
    await refreshPresence();
    await refreshFeatured(true);
    const profile = getProfile();
    if (profile && profile.isAdmin) await fetchAdminDances(true);
    renderOwnPages();
    ensureTabs();
  }

  function scheduleLoops(){
    setInterval(async () => {
      await refreshPresence();
      await syncCurrentDance(false);
      if (getProfile() && getProfile().isAdmin) await fetchAdminDances(true);
      if (activeOwnPage === 'signin' || activeOwnPage === 'admin') renderOwnPages();
      patchFeaturedCopy();
    }, 25000);

    window.addEventListener('storage', () => {
      if (activeOwnPage === 'signin' || activeOwnPage === 'admin') renderOwnPages();
      patchFeaturedCopy();
      ensureTabs();
    });

    window.addEventListener('focus', async () => {
      await refreshPresence();
      await syncCurrentDance(false);
      if (getProfile() && getProfile().isAdmin) await fetchAdminDances(true);
      if (activeOwnPage === 'signin' || activeOwnPage === 'admin') renderOwnPages();
    });
  }

  async function boot(){
    injectStyles();
    let tries = 0;
    const timer = setInterval(async () => {
      tries += 1;
      const ready = ensureTabs();
      renderOwnPages();
      patchFeaturedCopy();
      if (ready) {
        clearInterval(timer);
        await refreshBackendBits();
        scheduleLoops();
      }
      if (tries > 40) clearInterval(timer);
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
