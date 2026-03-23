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
  const LIVE_QUEUE_SYNC_INTERVAL_MS = 4000;

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
    moderatorApplications: [],
    activeModerators: [],
    moderatorQueue: [],
    suspensions: [],
    securityAlerts: [],
    glossaryApproved: [],
    glossaryRequests: [],
    siteMemories: [],
    aiDance: { busy: false, mode: 'judge', prompt: '', result: null },
    communityGlossaryOpen: false,
    subscription: { isPremium: false, plan: 'free', status: 'free', source: 'unknown' },
    savedDancesUiSignature: '',
    suspension: null,
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


  function createLocalId(prefix){
    return `${String(prefix || 'id').trim() || 'id'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  }

  function createBlankAppData(){
    return {
      meta: { title:'', choreographer:'', country:'', level:'Beginner', counts:'32', walls:'4', music:'', type:'4-Wall' },
      sections: [{ id:createLocalId('section'), name:'Section 1', steps:[] }],
      tags: [],
      isDarkMode: isDarkMode()
    };
  }

  function writeAppData(data){
    writeJson(DATA_KEY, data);
    window.dispatchEvent(new Event('storage'));
  }

  function ensureAppData(){
    const existing = readAppData();
    if (existing && typeof existing === 'object') return existing;
    const created = createBlankAppData();
    writeAppData(created);
    return created;
  }

  function buildGlossaryApplyStep(step){
    return {
      id: createLocalId('step'),
      type: 'step',
      count: String(step && (step.count || step.counts) || '1').trim() || '1',
      name: String(step && step.name || 'Custom Step').trim() || 'Custom Step',
      description: String(step && (step.description || step.desc) || '').trim(),
      foot: String(step && step.foot || '').trim(),
      weight: true,
      showNote: !!(step && step.note),
      note: String(step && step.note || '').trim()
    };
  }


  function buildSectionCountLabels(stepCount){
    const total = Math.max(1, Number(stepCount) || 1);
    const labels = [];
    for (let i = 0; i < total; i += 1) {
      const start = Math.floor((i * 8) / total) + 1;
      const end = Math.floor((((i + 1) * 8) - 1) / total) + 1;
      labels.push(start === end ? String(start) : `${start}-${end}`);
    }
    return labels;
  }

  function autoGenerateCountsForWorksheet(){
    const data = ensureAppData();
    if (!data.meta || typeof data.meta !== 'object') data.meta = createBlankAppData().meta;
    if (!Array.isArray(data.sections)) data.sections = [];
    let sectionCounter = 0;
    data.sections.forEach((section) => {
      const steps = Array.isArray(section && section.steps) ? section.steps : [];
      if (!steps.length) return;
      sectionCounter += 1;
      const labels = buildSectionCountLabels(steps.length);
      steps.forEach((step, index) => {
        if (!step || typeof step !== 'object') return;
        step.count = String(labels[index] || `${index + 1}`).trim();
      });
    });
    const totalCounts = Math.max(8, sectionCounter * 8);
    data.meta.counts = String(totalCounts);
    writeAppData(data);
    updateSavedSignature('');
    renderPages();
    openBuildWorksheet();
    return { totalCounts, sections: sectionCounter };
  }

  function applyGeneratedCountLines(countLines, totalCounts){
    const data = ensureAppData();
    if (!data.meta || typeof data.meta !== 'object') data.meta = createBlankAppData().meta;
    if (!Array.isArray(data.sections)) data.sections = [];
    const lines = Array.isArray(countLines) ? countLines : [];
    const flatSteps = [];
    data.sections.forEach((section) => {
      const steps = Array.isArray(section && section.steps) ? section.steps : [];
      steps.forEach((step) => { if (step && typeof step === 'object') flatSteps.push(step); });
    });
    flatSteps.forEach((step, index) => {
      const label = String(lines[index] || '').trim();
      if (label) step.count = label;
    });
    if (String(totalCounts || '').trim()) data.meta.counts = String(totalCounts).trim();
    writeAppData(data);
    updateSavedSignature('');
    renderPages();
    openBuildWorksheet();
    return true;
  }

  function applyStepToCurrentWorksheet(step){
    const data = ensureAppData();
    if (!data.meta || typeof data.meta !== 'object') data.meta = createBlankAppData().meta;
    if (!Array.isArray(data.sections)) data.sections = [];
    if (!data.sections.length) data.sections.push({ id:createLocalId('section'), name:'Section 1', steps:[] });
    const target = data.sections[data.sections.length - 1];
    if (!Array.isArray(target.steps)) target.steps = [];
    target.steps.push(buildGlossaryApplyStep(step));
    writeAppData(data);
    updateSavedSignature('');
    renderPages();
    openBuildWorksheet();
    return true;
  }

  function approvedGlossaryPromptList(limit){
    return (state.glossaryApproved || []).slice(0, limit || 80).map(item => `${item.name} [${item.foot || 'Either'}] - ${item.description || item.desc || ''}`).join('\n');
  }

  function saveSession(session){
    state.session = session && typeof session === 'object' ? session : null;
    if (state.session) writeJson(SESSION_KEY, state.session);
    else localStorage.removeItem(SESSION_KEY);
    state.suspension = state.session && state.session.suspension ? state.session.suspension : null;
    updateAdminTabVisibility();
  }

  function clearSession(){
    state.cloudSaves = [];
    state.suspension = null;
    saveSession(null);
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch {}
  }


  function suspensionMessage(suspension){
    if (!suspension) return '';
    const duration = String(suspension.durationLabel || 'a while').trim() || 'a while';
    const reason = String(suspension.reason || 'an admin decision').trim() || 'an admin decision';
    return `You have been barred for ${duration} long because of ${reason}`;
  }

  function renderSuspensionBanner(){
    const anchor = state.ui.tabStrip && state.ui.tabStrip.parentNode ? state.ui.tabStrip.parentNode : null;
    if (!anchor) return;
    let banner = document.getElementById('stepper-suspension-banner');
    if (!state.suspension) {
      if (banner) banner.remove();
      return;
    }
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'stepper-suspension-banner';
      banner.style.margin = '10px 0 0';
      banner.style.borderRadius = '18px';
      banner.style.padding = '12px 16px';
      banner.style.fontWeight = '800';
      banner.style.lineHeight = '1.35';
      anchor.insertAdjacentElement('afterend', banner);
    }
    banner.style.background = '#fee2e2';
    banner.style.border = '1px solid #ef4444';
    banner.style.color = '#7f1d1d';
    banner.textContent = suspensionMessage(state.suspension);
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
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
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
    const activeBg = accentColor || '#4f46e5';
    const idleBg = dark ? '#262626' : '#4b5563';
    button.style.color = '#ffffff';
    button.style.opacity = '1';
    button.style.transform = isActive ? 'translateY(-1px)' : '';
    button.style.boxShadow = isActive ? '0 8px 24px rgba(79,70,229,.22)' : '0 6px 18px rgba(0,0,0,.08)';
    button.style.background = isActive ? activeBg : idleBg;
    button.style.borderColor = isActive ? activeBg : idleBg;
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
    const parent = (state.ui.mainEl && state.ui.mainEl.parentNode) || (document.getElementById('root') && document.getElementById('root').parentNode) || document.body;
    const anchor = state.ui.footerWrap || (state.ui.mainEl ? state.ui.mainEl.nextSibling : null);
    if (state.ui.host && parent && state.ui.host.parentNode !== parent) {
      parent.insertBefore(state.ui.host, anchor || null);
    }
    if (state.ui.host && document.body.contains(state.ui.host)) return state.ui.host;
    const host = document.createElement('div');
    host.id = HOST_ID;
    host.hidden = true;
    host.className = 'max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 sm:pb-32 print:hidden';
    host.innerHTML = `<div class="space-y-5"><section id="${SIGNIN_PAGE_ID}" hidden style="display:none"></section><section id="${SUBSCRIPTION_PAGE_ID}" hidden style="display:none"></section><section id="${ADMIN_PAGE_ID}" hidden style="display:none"></section></div>`;
    if (parent) parent.insertBefore(host, anchor || null);
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
    if (state.ui.mainEl) state.ui.mainEl.style.display = '';
    if (state.ui.footerWrap) state.ui.footerWrap.style.display = ''; // keep native layout stable; extra pages render inline without blanking the app
    renderPages();
    updateTabButtons();
    refreshLiveQueues().then(() => {
      if (state.activePage) renderPages();
    }).catch(() => {});
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
        error.data = data;
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
      } else if (error && error.status === 403 && error.data && error.data.code === 'SUSPENDED') {
        state.suspension = error.data.suspension || null;
        if (state.session) saveSession(Object.assign({}, state.session, { suspension: state.suspension }));
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
        isModerator: !!data.isModerator,
        role: data.role || (data.isAdmin ? 'admin' : (data.isModerator ? 'moderator' : 'member')),
        suspension: data.suspension || null,
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
        saveSession(Object.assign({}, state.session, {
          isAdmin: !!data.isAdmin,
          isModerator: !!data.isModerator,
          role: data.role || (data.isAdmin ? 'admin' : (data.isModerator ? 'moderator' : 'member')),
          suspension: data.suspension || null,
          updatedAt: new Date().toISOString()
        }));
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
        isModerator: !!data.isModerator,
        role: data.role || (data.isAdmin ? 'admin' : (data.isModerator ? 'moderator' : 'member')),
        suspension: data.suspension || null,
        updatedAt: new Date().toISOString()
      });
      await refreshSession();
      await heartbeat();
      await refreshCloudSaves();
    state.savedDancesUiSignature = '';
      await restoreLatestCloudSaveIfNeeded();
      await syncCurrentDanceToBackend(true);
      await refreshNotifications();
      await refreshSubscription();
      await syncFeaturedFromBackend();
    await ensureStaffChatLoaded(true);
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
        container.innerHTML = `<button type="button" disabled class="stepper-google-cta ${theme.button}" style="width:280px;max-width:100%;opacity:.65;cursor:not-allowed">Sign in with Google</button><p class="mt-3 text-sm ${theme.subtle}">Google sign-in script could not load on this device.</p><button type="button" data-stepper-google-retry="1" class="stepper-google-cta ${theme.button}" style="margin-top:12px;">Retry Google sign-in</button>`;
        const retryBtn = container.querySelector('[data-stepper-google-retry="1"]');
        if (retryBtn) retryBtn.addEventListener('click', async () => { state.gisPromise = null; state.gisReady = false; await refreshConfig().catch(() => null); renderGoogleButton(); });
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
      container.innerHTML = `<button type="button" disabled class="stepper-google-cta ${theme.button}" style="width:280px;max-width:100%;opacity:.65;cursor:not-allowed">Sign in with Google</button><p class="mt-3 text-sm ${theme.subtle}">${escapeHtml(error.message || 'Google button could not load.')}</p><button type="button" data-stepper-google-retry="1" class="stepper-google-cta ${theme.button}" style="margin-top:12px;">Retry Google sign-in</button>`;
      const retryBtn = container.querySelector('[data-stepper-google-retry="1"]');
      if (retryBtn) retryBtn.addEventListener('click', async () => { state.gisPromise = null; state.gisReady = false; await refreshConfig().catch(() => null); renderGoogleButton(); });
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

  function buildPreviewSectionsFromEntry(entry){
    if (entry && Array.isArray(entry.previewSections) && entry.previewSections.length) {
      return entry.previewSections.filter(section => section && Array.isArray(section.lines) && section.lines.length).slice(0, 8);
    }
    const sections = Array.isArray(entry && entry.snapshot && entry.snapshot.data && entry.snapshot.data.sections) ? entry.snapshot.data.sections : [];
    return sections.slice(0, 8).map((section, index) => {
      const steps = Array.isArray(section && section.steps) ? section.steps : [];
      const lines = steps.slice(0, 12).map((step) => {
        const count = String((step && (step.count || step.counts)) || '').trim();
        const name = String((step && step.name) || '').trim();
        const description = String((step && (step.description || step.desc)) || '').trim();
        const note = step && step.showNote ? String(step.note || '').trim() : '';
        return [count, name, description, note ? `(${note})` : ''].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      }).filter(Boolean);
      return {
        name: String((section && section.name) || `Section ${index + 1}`).trim(),
        lines
      };
    }).filter(section => Array.isArray(section.lines) && section.lines.length);
  }

  function buildPreviewSheetHtml(entry, theme, emptyText){
    const sections = buildPreviewSectionsFromEntry(entry);
    if (!sections.length) {
      return `<div class="rounded-2xl border p-4 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Preview sheet</div><p class="mt-2 text-sm ${theme.subtle}">${escapeHtml(emptyText || 'No preview sheet has been saved for this dance yet.')}</p></div>`;
    }
    const blocks = sections.map((section) => `
      <div class="rounded-2xl border p-4 ${theme.soft}">
        <div class="text-xs font-black uppercase tracking-widest ${theme.subtle}">${escapeHtml(section.name || 'Section')}</div>
        <div class="mt-2 space-y-2">${section.lines.map((line) => `<p class="text-sm leading-relaxed">${escapeHtml(line)}</p>`).join('')}</div>
      </div>
    `).join('');
    return `<div class="rounded-2xl border p-4 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Preview sheet</div><div class="mt-3 grid gap-3">${blocks}</div></div>`;
  }

  function confirmReplaceUnsavedDance(nextTitle){
    if (!hasUnsavedChanges()) return true;
    return window.confirm(`You have changes in the current worksheet that are not saved to cloud yet. If you load "${String(nextTitle || 'this dance').trim() || 'this dance'}" now, that unsaved progress will not be kept unless you press Save Changes first. Load it anyway?`);
  }

  function openBuildWorksheet(){
    const open = () => {
      if (state.ui.buildBtn) state.ui.buildBtn.click();
      else closePages();
      window.requestAnimationFrame(() => {
        try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0, 0); }
      });
    };
    if (window.__stepperRunFaviconTransition) window.__stepperRunFaviconTransition(open, { target: 'editor' });
    else open();
  }

  function loadDanceIntoWorksheet(item){
    const entry = item && item.snapshot ? item : (item && item.source && item.source.snapshot ? item.source : null);
    if (!entry || !entry.snapshot) {
      alert('That dance does not have a saved worksheet to load yet.');
      return false;
    }
    const nextTitle = entry.title || item.title || 'this dance';
    if (!confirmReplaceUnsavedDance(nextTitle)) return false;
    const restored = restoreDanceSnapshot(entry);
    if (!restored) {
      alert('Could not load that dance into the worksheet.');
      return false;
    }
    const registryId = String((item && item.registryId) || entry.registryId || '').trim();
    setCurrentRegistryId(registryId);
    const signature = buildDanceSignature(entry);
    updateSavedSignature(signature);
    state.lastSyncedSignature = signature;
    renderPages();
    openBuildWorksheet();
    return true;
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



  function cleanWorksheetText(value){
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function inferWorksheetFoot(value){
    const lower = ` ${String(value || '').toLowerCase()} `;
    if (lower.includes(' left ') && lower.includes(' right ')) return 'Either';
    if (lower.includes(' left ')) return 'L';
    if (lower.includes(' right ')) return 'R';
    if (lower.includes(' both ')) return 'Both';
    return 'Either';
  }

  function parsePreviewLineToStep(line, index){
    const cleaned = cleanWorksheetText(line).replace(/^[-•·]+\s*/, '');
    if (!cleaned) return null;
    let rest = cleaned;
    let count = '';
    const countMatch = rest.match(/^((?:counts?\s*)?(?:\d+(?:\s*[&-]\s*\d+)*|[&a-z](?:\s*[&-]\s*\d+)*))(?:\s*[:.)-]|\s{2,}|\s+(?=[A-Z]))/i);
    if (countMatch) {
      count = cleanWorksheetText(countMatch[1].replace(/^counts?\s*/i, ''));
      rest = cleanWorksheetText(rest.slice(countMatch[0].length));
    }
    let name = '';
    let description = rest;
    const splitMatch = rest.match(/^([^:–—-]{2,80})\s*[:–—-]\s*(.+)$/);
    if (splitMatch) {
      name = cleanWorksheetText(splitMatch[1]);
      description = cleanWorksheetText(splitMatch[2]);
    } else {
      const bits = rest.split(/,\s*/);
      if (bits[0] && bits[0].length <= 80) name = cleanWorksheetText(bits[0]);
    }
    const glossary = Array.isArray(state.glossaryApproved) ? state.glossaryApproved : [];
    const lowerDesc = cleanWorksheetText(description || rest).toLowerCase();
    const lowerName = cleanWorksheetText(name).toLowerCase();
    const matched = glossary.find((item) => {
      const itemName = cleanWorksheetText(item && item.name).toLowerCase();
      const itemDesc = cleanWorksheetText(item && item.description).toLowerCase();
      return (itemName && (itemName === lowerName || itemName === lowerDesc || lowerDesc.includes(itemName)))
        || (itemDesc && (itemDesc === lowerDesc || lowerDesc.includes(itemDesc) || itemDesc.includes(lowerDesc)));
    }) || null;
    const finalName = cleanWorksheetText(matched && matched.name || name || rest.split(/[.,;:]/)[0]).slice(0, 120) || `Imported Step ${index + 1}`;
    const finalDescription = cleanWorksheetText(matched && matched.description || description || rest || finalName);
    return {
      id: createLocalId('step'),
      type: 'step',
      count: cleanWorksheetText(count || (matched && (matched.counts || matched.count)) || String(index + 1)) || String(index + 1),
      name: finalName,
      description: finalDescription,
      foot: cleanWorksheetText(matched && matched.foot || inferWorksheetFoot(finalDescription)) || 'Either',
      weight: true,
      showNote: false,
      note: ''
    };
  }

  function buildAppDataFromStoredEntry(entry){
    const normalized = normalizeStoredEntry(entry) || {};
    const snapshotData = normalized && normalized.snapshot && normalized.snapshot.data && typeof normalized.snapshot.data === 'object'
      ? normalized.snapshot.data
      : null;
    if (snapshotData && Array.isArray(snapshotData.sections) && snapshotData.sections.length) return snapshotData;
    const parsed = normalized.jsonPayload ? parseStoredJsonPayload(normalized.jsonPayload) : null;
    const dance = parsed && parsed.dance && typeof parsed.dance === 'object' ? parsed.dance : {};
    const previewSections = (Array.isArray(normalized.previewSections) && normalized.previewSections.length)
      ? normalized.previewSections
      : (parsed && Array.isArray(parsed.previewSections) ? parsed.previewSections : []);
    const meta = {
      title: cleanWorksheetText(normalized.title || dance.title || ''),
      choreographer: cleanWorksheetText(normalized.choreographer || dance.choreographer || ''),
      country: cleanWorksheetText(normalized.country || dance.country || ''),
      level: cleanWorksheetText(normalized.level || dance.level || 'Beginner') || 'Beginner',
      counts: cleanWorksheetText(normalized.counts || dance.counts || '32') || '32',
      walls: cleanWorksheetText(normalized.walls || dance.walls || '4') || '4',
      music: cleanWorksheetText(normalized.music || dance.music || ''),
      type: '4-Wall'
    };
    const sections = previewSections.length
      ? previewSections.map((section, sectionIndex) => ({
          id: createLocalId('section'),
          name: cleanWorksheetText(section && section.name || `Section ${sectionIndex + 1}`) || `Section ${sectionIndex + 1}`,
          steps: (Array.isArray(section && section.lines) ? section.lines : []).map((line, lineIndex) => parsePreviewLineToStep(line, lineIndex)).filter(Boolean)
        })).filter((section) => Array.isArray(section.steps) && section.steps.length)
      : [{ id: createLocalId('section'), name: 'Section 1', steps: [] }];
    return { meta, sections, tags: [], isDarkMode: isDarkMode() };
  }
  function restoreDanceSnapshot(item){
    const normalized = normalizeStoredEntry(item) || item || {};
    const data = buildAppDataFromStoredEntry(normalized);
    const phrasedTools = normalized && normalized.snapshot && normalized.snapshot.phrasedTools && typeof normalized.snapshot.phrasedTools === 'object' ? normalized.snapshot.phrasedTools : {};
    if (!data || typeof data !== 'object') return false;
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
    state.savedDancesUiSignature = '';
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

  async function deleteCloudSave(saveId){
    if (!saveId || !state.session || !state.session.credential) return false;
    if (!window.confirm('Delete this cloud save from your Google account?')) return false;
    try {
      await authFetch(`/api/cloud-saves/${encodeURIComponent(saveId)}`, { method: 'DELETE' });
      await refreshCloudSaves();
    state.savedDancesUiSignature = '';
      renderPages();
      return true;
    } catch (error) {
      alert(error.message || 'Could not delete that cloud save.');
      return false;
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


  async function refreshGlossaryApproved(){
    try {
      const data = await fetchJson('/api/glossary/steps');
      state.glossaryApproved = Array.isArray(data.items) ? data.items : [];
      return state.glossaryApproved;
    } catch {
      state.glossaryApproved = [];
      return [];
    }
  }


  async function refreshSiteMemories(){
    try {
      const data = await fetchJson('/api/site-memory');
      state.siteMemories = Array.isArray(data.items) ? data.items : [];
      return state.siteMemories;
    } catch (_error) {
      state.siteMemories = [];
      return [];
    }
  }

  async function addSiteMemory(textValue){
    const text = String(textValue || '').trim();
    if (!text) return false;
    try {
      await authFetch('/api/admin/site-memory', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text })
      });
      await refreshSiteMemories();
      renderPages();
      return true;
    } catch (error) {
      alert(error.message || 'Could not add that helper memory.');
      return false;
    }
  }

  async function deleteSiteMemory(id){
    try {
      await authFetch(`/api/admin/site-memory/${encodeURIComponent(id)}`, { method:'DELETE' });
      await refreshSiteMemories();
      renderPages();
      return true;
    } catch (error) {
      alert(error.message || 'Could not delete that helper memory.');
      return false;
    }
  }

  async function refreshGlossaryRequests(){
    if (!isAdminSession()) {
      state.glossaryRequests = [];
      return [];
    }
    try {
      const data = await authFetch('/api/admin/glossary-requests');
      state.glossaryRequests = Array.isArray(data.items) ? data.items : [];
      return state.glossaryRequests;
    } catch {
      state.glossaryRequests = [];
      return [];
    }
  }

  async function requestGlossaryStep(payload){
    if (!(state.session && state.session.credential)) {
      alert('Sign in with Google first so the glossary request can be attached to your account.');
      return false;
    }
    try {
      const data = await authFetch('/api/glossary/request', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ step: payload })
      });
      alert(data && data.message ? data.message : 'Glossary step request sent to Admin.');
      return true;
    } catch (error) {
      alert(error.message || 'Could not send that glossary step request.');
      return false;
    }
  }

  async function decideGlossaryRequest(id, decision){
    const note = window.prompt(decision === 'approve' ? 'Optional approval note for this glossary step:' : 'Why are you declining this glossary step?', '');
    try {
      await authFetch(`/api/admin/glossary-requests/${encodeURIComponent(id)}/${decision}`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ note: note || '' })
      });
      await refreshGlossaryRequests();
      await refreshGlossaryApproved();
      renderPages();
      return true;
    } catch (error) {
      alert(error.message || 'Could not update that glossary request.');
      return false;
    }
  }

  function normalizeAiSuggestion(item){
    if (!item || typeof item !== 'object') return null;
    const name = String(item.name || '').trim();
    const description = String(item.description || item.desc || '').trim();
    if (!name && !description) return null;
    return {
      name: name || 'Suggested Step',
      description,
      count: String(item.count || item.counts || '1').trim() || '1',
      foot: String(item.foot || '').trim(),
      note: String(item.reason || item.note || '').trim()
    };
  }

  async function runAiDanceTool(mode){
    if (!(state.session && state.session.credential)) {
      alert('Sign in with Google first so the AI can judge or add to this dance.');
      return;
    }
    const dance = buildCurrentDanceEntry();
    if (!dance) {
      alert('Build or load a dance first so the AI has something to work with.');
      return;
    }
    state.aiDance.busy = true;
    renderPages();
    try {
      const data = await authFetch('/api/ai/dance-tools', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          mode,
          prompt: String(state.aiDance.prompt || '').trim(),
          dance,
          approvedGlossary: (state.glossaryApproved || []).slice(0, 120)
        })
      });
      state.aiDance.result = {
        mode,
        text: String(data.text || '').trim(),
        score: data.flowScore,
        suggestions: Array.isArray(data.suggestions) ? data.suggestions.map(normalizeAiSuggestion).filter(Boolean) : [],
        countLines: Array.isArray(data.countLines) ? data.countLines.map(item => String(item || '').trim()).filter(Boolean) : [],
        totalCounts: String(data.totalCounts || '').trim()
      };
      if (mode === 'counts' && state.aiDance.result.countLines.length) {
        applyGeneratedCountLines(state.aiDance.result.countLines, state.aiDance.result.totalCounts || data.totalCounts || '');
      } else if (mode === 'counts' && !state.aiDance.result.countLines.length) {
        const local = autoGenerateCountsForWorksheet();
        state.aiDance.result.text = state.aiDance.result.text || `I generated worksheet counts locally and set the dance to ${local.totalCounts} counts.`;
        state.aiDance.result.totalCounts = String(local.totalCounts);
      }
    } catch (error) {
      state.aiDance.result = { mode, text: error.message || 'AI dance tool failed.', score: null, suggestions: [], countLines: [], totalCounts: '' };
      if (mode === 'counts') {
        const local = autoGenerateCountsForWorksheet();
        state.aiDance.result.text = `AI count generation had a wobble, so the site generated worksheet counts locally and set the dance to ${local.totalCounts} counts.`;
        state.aiDance.result.totalCounts = String(local.totalCounts);
      }
    } finally {
      state.aiDance.busy = false;
      renderPages();
    }
  }

  function renderCommunityGlossary(){
    let host = document.getElementById('stepper-community-glossary-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'stepper-community-glossary-host';
      host.style.position = 'fixed';
      host.style.left = '14px';
      host.style.bottom = '18px';
      host.style.zIndex = '8600';
      document.body.appendChild(host);
    }
    if (state.activePage || state.chatOpen || window.innerWidth < 900) {
      host.style.display = 'none';
      host.innerHTML = '';
      return;
    }
    host.style.display = '';
    if (!state.communityGlossaryOpen) {
      host.innerHTML = `<button type="button" data-open-community-glossary="1" style="border:1px solid rgba(99,102,241,.18);background:#fff;color:#111827;padding:.8rem 1rem;border-radius:999px;font-weight:900;box-shadow:0 12px 30px rgba(0,0,0,.14);">Glossary+</button>`;
      const btn = host.querySelector('[data-open-community-glossary="1"]');
      if (btn) btn.addEventListener('click', ()=>{ state.communityGlossaryOpen = true; renderCommunityGlossary(); });
      return;
    }
    const items = (state.glossaryApproved || []).slice(0, 18);
    host.innerHTML = `<div style="width:min(420px, calc(100vw - 28px));background:#f8fafc;border:1px solid rgba(99,102,241,.16);border-radius:24px;box-shadow:0 18px 40px rgba(0,0,0,.18);overflow:hidden;"><div style="padding:.9rem 1rem;background:#4f46e5;color:#fff;display:flex;align-items:center;gap:.6rem;"><div style="font-weight:900;">Community glossary</div><button type="button" data-close-community-glossary="1" style="margin-left:auto;border:none;background:rgba(255,255,255,.18);color:#fff;border-radius:999px;padding:.35rem .65rem;font-weight:900;">Close</button></div><div style="padding:1rem;max-height:min(55vh,420px);overflow:auto;display:grid;gap:.75rem;">${items.length ? items.map(item => `<div style="background:#fff;border:1px solid rgba(99,102,241,.14);border-radius:18px;padding:.9rem;"><div style="display:flex;justify-content:space-between;gap:.75rem;align-items:start;"><div><div style="font-weight:900;">${escapeHtml(item.name || 'Step')}</div><div style="font-size:12px;color:#6b7280;margin-top:.2rem;">${escapeHtml(item.foot || 'Either')} • ${escapeHtml(item.counts || '1')}</div></div><button type="button" data-apply-community-step="${escapeHtml(item.id || item.name || '')}" style="border:none;background:#4f46e5;color:#fff;border-radius:999px;padding:.55rem .9rem;font-weight:900;white-space:nowrap;">Apply</button></div><p style="margin-top:.55rem;font-size:13px;line-height:1.45;color:#374151;">${escapeHtml(item.description || item.desc || '')}</p></div>`).join('') : '<div style="font-size:13px;color:#6b7280;">No admin-approved custom steps yet.</div>'}</div></div>`;
    const closeBtn = host.querySelector('[data-close-community-glossary="1"]');
    if (closeBtn) closeBtn.addEventListener('click', ()=>{ state.communityGlossaryOpen = false; renderCommunityGlossary(); });
    host.querySelectorAll('[data-apply-community-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = (state.glossaryApproved || []).find(entry => String(entry.id || entry.name || '') === String(btn.getAttribute('data-apply-community-step') || ''));
        if (item) applyStepToCurrentWorksheet(item);
      });
    });
  }

  function localSiteHelp(prompt){
    const text = String(prompt || '').toLowerCase();
    if (!text) return 'Ask about saving, featuring, premium, moderators, or which tab to use.';
    if (text.includes('save') || text.includes('changes')) return state.session && state.session.credential ? 'Use Save Changes in My Saved Dances to lock the newest version into your Google-linked cloud save. Your latest signed-in dance also auto-syncs in the background.' : 'Open My Saved Dances and use Save Changes there. Sign in with Google first if you want that save to follow you onto other devices.';
    if (text.includes('premium') || text.includes('subscription') || text.includes('pay')) return 'Open Subscription after signing in. Premium is NZ$12.50 monthly or NZ$100 yearly and gets priority review plus the paid site helper.';
    if (text.includes('feature') || text.includes('badge') || text.includes('bronze') || text.includes('silver') || text.includes('gold')) return 'Use Send to host for featuring. Premium requests go to the top of the admin queue, and the admin can approve them with Bronze, Silver, or Gold for Featured Choreo. Removing a feature takes it back off that public page.';
    if (text.includes('upload') || text.includes('site')) return 'Use Upload to site to send your dance into the admin moderation queue. The admin can approve it for the site or delete it.';
    if (text.includes('signin') || text.includes('google') || text.includes('sign in')) return 'Open the Sign In tab and use Sign in with Google. Once signed in, your dances can sync to the backend and the admin tab appears only for the admin email.';
    if (text.includes('moderator')) return 'Open Sign In and use Apply for moderator. You need a Google account first. Approved moderators get moderator tools but not the Admin tab.';
    if (text.includes('glossary') || text.includes('step request')) return 'Use the Community Glossary button while building to apply admin-approved custom steps. Signed-in members can request new glossary steps from the Sign In tab, and Admin reviews them under Requested dance steps.';
    if (text.includes('judge') || text.includes('flow')) return 'Open Sign In and use AI Dance Judge. It can score flowability, suggest tidy-ups, propose glossary-style step additions, and generate counts for the current worksheet.';
    if (text.includes('count')) return 'Open Sign In and use Generate counts in the AI dance panel. It fills worksheet step counts and updates the dance count total for you.';
    if (text.includes('tab') || text.includes('where') || text.includes('go')) return 'Use Build to make or edit a dance, Sheet for the clean sheet view, My Saved Dances for your cloud saves, Featured Choreo for public featured dances, and Sign In for Google saving and moderation actions.';
    return 'Tell me what you are trying to do and I will point you to the exact tab or button.';
  }

  function sanitizeHelperReply(reply, prompt){
    const text = String(reply || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    const boringGreeting = /^(hi|hello|hey)( there)?[!,. ]*(what can i help you with( today)?( on step by stepper)?)?/i;
    if (/^hi there!? what can i help you with today on step by stepper\??/i.test(text)) return '';
    if (/feel free to ask about any tab or feature\.?$/i.test(text)) return '';
    if (/^need help using the site\?/i.test(text)) return '';
    if ((/step by stepper/i.test(text) || /any tab or feature/i.test(text) || /what can i help you with/i.test(text)) && boringGreeting.test(text)) return '';
    if (/^(hi|hello|hey)( there)?[!,. ]*$/i.test(text)) return '';
    return text;
  }

  async function askSiteHelper(question){
    const prompt = String(question || '').trim();
    if (!prompt) return;
    state.chatBusy = true;
    renderSiteHelper();
    const currentTab = state.activePage || 'main';
    const appData = readAppData();
    const payload = {
      prompt,
      history: (state.chatMessages || []).slice(-8).map(message => ({ role: message.role, text: message.text })),
      context: {
        currentTab,
        signedIn: !!(state.session && state.session.credential),
        isAdmin: isAdminSession(),
        onlineCount: (state.presence && state.presence.onlineCount) || 0,
        currentDanceTitle: appData && appData.meta ? String(appData.meta.title || '').trim() : ''
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
        text = sanitizeHelperReply(data.text || '', prompt);
      } catch (primaryError) {
        const backup = await fetchJson('/api/openai/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: 'You are the Step By Stepper site helper. Answer briefly and practically. Explain which tab or button to use. Mention Build, Sheet, Sign In, My Saved Dances, Featured Choreo, Save Changes, Send to host for featuring, and Upload to site when useful. Never invent hidden features.',
            prompt: `Current tab: ${currentTab}\nSigned in: ${payload.context.signedIn ? 'yes' : 'no'}\nAdmin: ${payload.context.isAdmin ? 'yes' : 'no'}\nOnline count: ${payload.context.onlineCount}\nQuestion: ${prompt}`
          })
        });
        text = sanitizeHelperReply(backup.text || '', prompt);
      }
      const clean = sanitizeHelperReply(text, prompt);
      state.chatMessages.push({ role:'assistant', text: clean || 'AI helper error: the backend returned a blank or canned reply.' });
    } catch (error) {
      const message = String(error && error.message || '').trim();
      state.chatMessages.push({ role:'assistant', text: message ? `AI helper error: ${message}` : 'AI helper error: the backend could not produce a usable reply.' });
    } finally {
      state.chatBusy = false;
      renderSiteHelper();
    }
  }

  function getSiteHelperTopOffset(){
    const strip = state.ui && state.ui.tabStrip ? state.ui.tabStrip : null;
    if (strip && strip.getBoundingClientRect) {
      const rect = strip.getBoundingClientRect();
      return `${Math.max(18, Math.round(rect.bottom + 12))}px`;
    }
    return '96px';
  }

  function ensureSiteHelperHost(){
    let host = document.getElementById('stepper-site-helper-host');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'stepper-site-helper-host';
    host.style.position = 'fixed';
    host.style.right = '14px';
    host.style.top = getSiteHelperTopOffset();
    host.style.bottom = 'auto';
    host.style.zIndex = '8700';
    document.body.appendChild(host);
    return host;
  }

  function renderSiteHelper(){
    const activeInput = document.activeElement;
    if (state.chatOpen && activeInput && activeInput.matches && activeInput.matches('[data-chat-input=\"1\"]')) return;
    const host = ensureSiteHelperHost();
    host.style.right = '14px';
    host.style.top = getSiteHelperTopOffset();
    host.style.bottom = 'auto';
    host.style.zIndex = '8700';
    if (!state.chatOpen) {
      host.innerHTML = `<button type="button" data-chat-open="1" aria-label="Open site helper" style="border:none;background:#4f46e5;color:#fff;width:58px;height:58px;border-radius:999px;font-size:26px;box-shadow:0 12px 30px rgba(0,0,0,.18);">💬</button>`;
      host.querySelector('[data-chat-open="1"]').addEventListener('click', ()=>{ state.chatOpen = true; renderSiteHelper(); });
      return;
    }
    const messages = state.chatMessages.length ? state.chatMessages.slice(-10).map(msg => `<div style="align-self:${msg.role==='user'?'flex-end':'stretch'};max-width:100%;background:${msg.role==='user'?'#4f46e5':'#ffffff'};color:${msg.role==='user'?'#ffffff':'#111827'};border:1px solid rgba(79,70,229,.12);padding:.75rem .85rem;border-radius:18px;font-size:14px;line-height:1.45;box-shadow:0 8px 24px rgba(0,0,0,.08);word-break:break-word;">${escapeHtml(msg.text)}</div>`).join('') : `<div style="font-size:13px;color:#6b7280;background:#ffffff;border:1px dashed rgba(99,102,241,.18);padding:.8rem .9rem;border-radius:16px;">Ask what button to press, where to save, how featuring works, or anything else about the site.</div>`;
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

  function getSavedDancesUiSignature(){
    const signedIn = !!(state.session && state.session.credential);
    const profile = signedIn ? (state.session.profile || {}) : null;
    const cloudSig = (state.cloudSaves || []).slice(0, 12).map(item => [
      item && item.id || '',
      item && item.updatedAt || '',
      item && item.title || '',
      item && item.steps || 0,
      item && item.sections || 0
    ].join('~')).join('|');
    return JSON.stringify({
      signedIn,
      activePage: state.activePage || '',
      email: signedIn ? normalizeEmail(profile && profile.email) : '',
      cloudCount: (state.cloudSaves || []).length,
      cloudSig
    });
  }

  function patchSavedDancesPage(force){
    const page = document.getElementById('stepper-saved-dances-page');
    if (!page) return;
    const isVisible = !!(page.offsetParent || page.getClientRects().length) && getComputedStyle(page).display !== 'none' && getComputedStyle(page).visibility !== 'hidden';
    const focused = document.activeElement;
    const focusInside = !!(focused && page.contains(focused));
    if (!force && (!isVisible || focusInside)) return;
    const body = page.querySelector('[class*="p-6"]') || page;
    if (!body) return;
    let wrap = page.querySelector('[data-stepper-cloud-save-wrap="true"]');
    if (!wrap) {
      wrap = document.createElement('section');
      wrap.setAttribute('data-stepper-cloud-save-wrap', 'true');
      wrap.style.marginBottom = '20px';
      body.insertBefore(wrap, body.firstElementChild || null);
    }
    const theme = themeClasses();
    const signedIn = !!(state.session && state.session.credential);
    const profile = signedIn ? state.session.profile || {} : null;
    const uiSignature = getSavedDancesUiSignature();
    if (!force && wrap && state.savedDancesUiSignature === uiSignature) return;
    state.savedDancesUiSignature = uiSignature;
    const cloudCards = signedIn && state.cloudSaves.length ? state.cloudSaves.slice(0, 12).map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-stepper-cloud-id="${escapeHtml(item.id)}">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <h3 class="text-lg font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer || 'Uncredited')}${item.country ? ` • ${escapeHtml(item.country)}` : ''}</p>
            <p class="mt-2 text-sm ${theme.subtle}">Updated ${escapeHtml(formatDate(item.updatedAt))}</p>
          </div>
          <div class="stepper-google-badge-row">
            <span class="stepper-google-pill ${theme.orange}">${escapeHtml(item.level || 'Unlabelled')}</span>
            <button type="button" class="stepper-google-cta ${theme.button}" data-action="load-cloud">Load to worksheet</button>
            <button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="delete-cloud">Delete</button>
          </div>
        </div>
        <div class="mt-4 stepper-google-grid text-sm">
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts || '-')}</div></div>
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls || '-')}</div></div>
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections || 0))}</div></div>
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        <div class="mt-4">${buildPreviewSheetHtml(item, theme, 'Save this dance once and the sheet preview will show here.')}</div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-black">${signedIn ? 'No cloud saves yet.' : 'Sign in to use cloud saves.'}</p><p class="mt-2 text-sm ${theme.subtle}">${signedIn ? 'Use Save Changes to push the current worksheet into your Google-linked cloud saves. Loading a different dance will replace the current worksheet.' : 'Local saves still work without signing in, but Google cloud saves follow you onto other devices.'}</p></div>`;

    wrap.className = 'space-y-4';
    wrap.innerHTML = `
      <section class="rounded-3xl border p-5 sm:p-6 ${theme.panel}">
        <div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Cloud saves</div><p class="mt-1 text-sm ${theme.subtle}">Load any saved dance straight into the current worksheet. You will get a warning first if the worksheet you are on still has unsaved changes.</p></div>${signedIn ? `<span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.cloudSaves.length))} saved</span>` : ''}</div>
        <div class="mt-4 space-y-4">${cloudCards}</div>
      </section>
    `;

    const openBtn = wrap.querySelector('[data-stepper-open-signin="1"]');
    if (openBtn) openBtn.addEventListener('click', ()=> openPage('signin'));
    const subBtn = wrap.querySelector('[data-stepper-open-subscription="1"]');
    if (subBtn) subBtn.addEventListener('click', ()=> openPage('subscription'));
    const saveBtn = wrap.querySelector('[data-stepper-saved-save-now="1"]');
    if (saveBtn) saveBtn.addEventListener('click', async ()=>{
      const ok = await saveChangesNow({ force:true });
      if (!ok) alert('Could not save to the backend just now.');
      state.savedDancesUiSignature = '';
      patchSavedDancesPage(true);
    });
    wrap.querySelectorAll('[data-stepper-cloud-id]').forEach(card => {
      const saveId = card.getAttribute('data-stepper-cloud-id');
      const item = (state.cloudSaves || []).find(entry => String((entry && entry.id) || '') === String(saveId || ''));
      const loadBtn = card.querySelector('[data-action="load-cloud"]');
      if (loadBtn) loadBtn.addEventListener('click', () => { if (item) loadDanceIntoWorksheet(item); });
      const deleteBtn = card.querySelector('[data-action="delete-cloud"]');
      if (deleteBtn) deleteBtn.addEventListener('click', () => { if (item) deleteCloudSave(item.id); });
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
    const moderatorStatus = isAdminSession()
      ? 'Admin already has the full site controls.'
      : (isModeratorSession()
        ? 'This account already has moderator access and premium helper perks.'
        : 'Apply for moderator here. A Google account is required before the request can be sent.');

    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;

    if (profile) {
      page.innerHTML = `
        <div class="px-6 py-5 border-b ${theme.panel}">
          <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconUser()}</span> Sign In</h2>
        </div>
        <div class="p-6 sm:p-8 space-y-5">
          <div class="mx-auto max-w-3xl rounded-3xl border p-5 sm:p-6 ${theme.soft}">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-lg font-black tracking-tight">Apply for moderator</div>
                <p class="mt-2 text-sm ${theme.subtle}">${escapeHtml(moderatorStatus)}</p>
              </div>
              <div class="flex flex-wrap gap-3">
                ${isAdminSession() ? `<span class="stepper-google-pill ${theme.orange}">${iconShield()} Admin</span>` : ''}
                ${isModeratorSession() ? `<span class="stepper-google-pill ${theme.orange}">${iconShield()} Moderator</span>` : `<button type="button" data-stepper-action="apply-moderator" class="stepper-google-cta ${theme.button}">Apply for moderator</button>`}
              </div>
            </div>
          </div>
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
          <div class="mx-auto max-w-3xl rounded-3xl border p-5 sm:p-6 ${theme.soft}">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-lg font-black tracking-tight">AI dance judge & flowability</div>
                <p class="mt-2 text-sm ${theme.subtle}">Judge the current worksheet, or ask AI to add some extra flavour through glossary-style steps. Suggestions can be applied straight into the current worksheet.</p>
              </div>
              <span class="stepper-google-pill ${theme.orange}">${escapeHtml((state.glossaryApproved || []).length)} community steps</span>
            </div>
            <div class="mt-4 ${theme.panel} rounded-3xl border p-4"><textarea data-stepper-ai-prompt="1" class="stepper-google-input" rows="3" placeholder="Optional: e.g. make the chorus flow better, add a smoother travelling step, judge whether this dance is clunky, or generate counts for the worksheet.">${escapeHtml(state.aiDance.prompt || '')}</textarea><div class="mt-4 flex flex-wrap gap-3"><button type="button" data-stepper-action="ai-judge" class="stepper-google-cta ${theme.button}">${state.aiDance.busy && state.aiDance.mode === 'judge' ? 'Judging…' : 'Judge dance'}</button><button type="button" data-stepper-action="ai-add" class="stepper-google-cta ${theme.button}">${state.aiDance.busy && state.aiDance.mode === 'add' ? 'Thinking…' : 'Add with glossary AI'}</button><button type="button" data-stepper-action="ai-counts" class="stepper-google-cta ${theme.button}">${state.aiDance.busy && state.aiDance.mode === 'counts' ? 'Counting…' : 'Generate counts'}</button></div></div>
            ${state.aiDance.result ? `<div class="mt-4 rounded-3xl border p-5 ${theme.panel}"><div class="flex flex-wrap items-center gap-3"><div class="text-lg font-black tracking-tight">${state.aiDance.result.mode === 'add' ? 'AI add-on result' : (state.aiDance.result.mode === 'counts' ? 'AI count result' : 'AI judging result')}</div>${state.aiDance.result.score ? `<span class="stepper-google-pill ${theme.orange}">Flow ${escapeHtml(String(state.aiDance.result.score))}/10</span>` : ''}${state.aiDance.result.totalCounts ? `<span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.aiDance.result.totalCounts))} counts</span>` : ''}</div><p class="mt-3 text-sm leading-relaxed ${theme.subtle}">${escapeHtml(state.aiDance.result.text || '')}</p>${state.aiDance.result.suggestions && state.aiDance.result.suggestions.length ? `<div class="mt-4 grid gap-3">${state.aiDance.result.suggestions.map((item, index) => `<article class="rounded-2xl border p-4 ${theme.soft}" data-stepper-ai-suggestion="${index}"><div class="flex flex-wrap items-start justify-between gap-3"><div><div class="text-base font-black">${escapeHtml(item.name || 'Suggested Step')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.count || '1')} • ${escapeHtml(item.foot || 'Either')}</p></div><button type="button" class="stepper-google-cta ${theme.button}" data-action="apply-ai-suggestion">Apply to worksheet</button></div><p class="mt-3 text-sm leading-relaxed ${theme.subtle}">${escapeHtml(item.description || '')}</p>${item.note ? `<p class="mt-2 text-xs font-semibold ${theme.subtle}">${escapeHtml(item.note)}</p>` : ''}</article>`).join('')}</div>` : ''}</div>` : ''}
          </div>
          <div class="mx-auto max-w-3xl rounded-3xl border p-5 sm:p-6 ${theme.soft}">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-lg font-black tracking-tight">Request dance step for the glossary</div>
                <p class="mt-2 text-sm ${theme.subtle}">Send a custom step to Admin. If it is approved, it becomes a community glossary step for everyone else. Right-foot requests automatically preview a left-foot twin and vice versa.</p>
              </div>
            </div>
            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <input data-stepper-glossary-name="1" class="stepper-google-input" placeholder="Step name" />
              <input data-stepper-glossary-counts="1" class="stepper-google-input" placeholder="Counts, e.g. 1&2" />
              <input data-stepper-glossary-foot="1" class="stepper-google-input" placeholder="Foot: Right, Left, or Either" />
              <input data-stepper-glossary-tags="1" class="stepper-google-input" placeholder="Tags or aliases (optional)" />
            </div>
            <div class="mt-4 ${theme.panel} rounded-3xl border p-4"><textarea data-stepper-glossary-description="1" class="stepper-google-input" rows="4" placeholder="Describe the step clearly so Admin can preview it."></textarea></div>
            <div class="mt-4 flex flex-wrap gap-3"><button type="button" data-stepper-action="request-glossary-step" class="stepper-google-cta ${theme.button}">Send glossary step request</button></div>
          </div>
          <div class="mx-auto max-w-3xl rounded-3xl border p-5 sm:p-6 ${theme.soft}">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-lg font-black tracking-tight">Cloud save status</div>
                <p class="mt-2 text-sm ${theme.subtle}">Signed in as ${escapeHtml(profile.name || profile.email || 'Member')}. Google cloud save follows you onto other devices. Use Save Changes in My Saved Dances when you want to lock the newest version in straight away.</p>
                <p class="mt-2 text-sm ${theme.subtle}">If you load another dance before saving the one you are editing now, that unsaved worksheet progress will not be kept.</p>
              </div>
              <div class="flex flex-wrap gap-3">
                <span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.cloudSaves.length || 0))} cloud saves</span>
                <button type="button" data-stepper-open-saved="1" class="stepper-google-cta ${theme.button}">Open My Saved Dances</button>
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
        <div class="p-6 sm:p-8 space-y-5">
          <div class="mx-auto max-w-2xl rounded-3xl border p-5 sm:p-6 ${theme.soft}">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-lg font-black tracking-tight">Apply for moderator</div>
                <p class="mt-2 text-sm ${theme.subtle}">Must have a Google account to do so. Sign in first, then send the moderator request from this same page.</p>
              </div>
              <button type="button" data-stepper-action="apply-moderator-needs-signin" class="stepper-google-cta ${theme.button}">Apply for moderator</button>
            </div>
          </div>
          <div class="mx-auto max-w-2xl rounded-3xl border p-6 sm:p-8 ${theme.soft}">
            <div class="text-center">
              <div class="text-2xl font-black tracking-tight">Sign in with Google</div>
              <p class="mt-3 text-sm leading-relaxed ${theme.subtle}">Use your Google account to sign in. The admin tab appears only for <strong>${escapeHtml(ADMIN_EMAIL)}</strong>.</p>
            </div>
            <div id="stepper-google-button-slot" class="stepper-google-google-btn mt-6 flex justify-center"></div>
          </div>
          <div class="mx-auto max-w-2xl rounded-3xl border p-5 sm:p-6 ${theme.soft}">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div class="text-lg font-black tracking-tight">Cloud save status</div>
                <p class="mt-2 text-sm ${theme.subtle}">Google cloud save sits behind sign-in and lives in My Saved Dances, not as a popup. Once you sign in, your saves can follow you onto other devices.</p>
              </div>
              <button type="button" data-stepper-open-saved="1" class="stepper-google-cta ${theme.button}">Open My Saved Dances</button>
            </div>
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
    const openSavedBtn = page.querySelector('[data-stepper-open-saved="1"]');
    if (openSavedBtn) openSavedBtn.addEventListener('click', () => {
      const btn = state.ui && state.ui.savedBtn;
      if (btn && typeof btn.click === 'function') btn.click();
      else openPage('signin');
    });
    const applyModBtn = page.querySelector('[data-stepper-action="apply-moderator"]');
    if (applyModBtn) applyModBtn.addEventListener('click', () => applyForModerator());
    const applyNeedsSignInBtn = page.querySelector('[data-stepper-action="apply-moderator-needs-signin"]');
    if (applyNeedsSignInBtn) applyNeedsSignInBtn.addEventListener('click', () => { alert('Sign in with Google first, then press Apply for moderator.'); });
    const aiPrompt = page.querySelector('[data-stepper-ai-prompt="1"]');
    if (aiPrompt) aiPrompt.addEventListener('input', () => { state.aiDance.prompt = aiPrompt.value; });
    const aiJudgeBtn = page.querySelector('[data-stepper-action="ai-judge"]');
    if (aiJudgeBtn) aiJudgeBtn.addEventListener('click', () => { state.aiDance.mode = 'judge'; runAiDanceTool('judge'); });
    const aiAddBtn = page.querySelector('[data-stepper-action="ai-add"]');
    if (aiAddBtn) aiAddBtn.addEventListener('click', () => { state.aiDance.mode = 'add'; runAiDanceTool('add'); });
    const aiCountsBtn = page.querySelector('[data-stepper-action="ai-counts"]');
    if (aiCountsBtn) aiCountsBtn.addEventListener('click', () => { state.aiDance.mode = 'counts'; runAiDanceTool('counts'); });
    page.querySelectorAll('[data-stepper-ai-suggestion]').forEach(card => {
      const idx = Number(card.getAttribute('data-stepper-ai-suggestion'));
      const btn = card.querySelector('[data-action="apply-ai-suggestion"]');
      if (btn) btn.addEventListener('click', () => {
        const item = state.aiDance && state.aiDance.result && Array.isArray(state.aiDance.result.suggestions) ? state.aiDance.result.suggestions[idx] : null;
        if (item) applyStepToCurrentWorksheet(item);
      });
    });
    const glossaryBtn = page.querySelector('[data-stepper-action="request-glossary-step"]');
    if (glossaryBtn) glossaryBtn.addEventListener('click', () => {
      const payload = {
        name: page.querySelector('[data-stepper-glossary-name="1"]')?.value || '',
        counts: page.querySelector('[data-stepper-glossary-counts="1"]')?.value || '',
        foot: page.querySelector('[data-stepper-glossary-foot="1"]')?.value || '',
        tags: page.querySelector('[data-stepper-glossary-tags="1"]')?.value || '',
        description: page.querySelector('[data-stepper-glossary-description="1"]')?.value || ''
      };
      requestGlossaryStep(payload).then((ok)=>{
        if (ok) {
          ['[data-stepper-glossary-name="1"]','[data-stepper-glossary-counts="1"]','[data-stepper-glossary-foot="1"]','[data-stepper-glossary-tags="1"]','[data-stepper-glossary-description="1"]'].forEach(sel => {
            const el = page.querySelector(sel);
            if (el) el.value = '';
          });
        }
      });
    });

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

  function buildStaffChatHtml(theme, roleLabel){
    const messages = Array.isArray(state.staffChat) ? state.staffChat : [];
    const bannerClass = roleLabel === 'Admin'
      ? (theme.dark ? 'bg-amber-500/20 text-amber-100 border-amber-400/40' : 'bg-amber-100 text-amber-800 border-amber-300')
      : (theme.dark ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300');
    const items = messages.length ? messages.slice(-40).map(item => {
      const isAdmin = String(item && item.role || '').toLowerCase() === 'admin';
      const pill = isAdmin
        ? `<span class="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${theme.dark ? 'bg-amber-500/20 text-amber-100 border-amber-400/40' : 'bg-amber-100 text-amber-800 border-amber-300'}">Admin</span>`
        : `<span class="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${theme.dark ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}">Moderator</span>`;
      return `<article class="rounded-2xl border p-4 ${theme.soft}"><div class="flex flex-wrap items-center justify-between gap-3"><div class="flex flex-wrap items-center gap-2"><span class="text-sm font-black">${escapeHtml(item && (item.name || item.email) || 'Staff')}</span>${pill}</div><span class="text-xs ${theme.subtle}">${escapeHtml(formatDate(item && item.createdAt || Date.now()))}</span></div><p class="mt-3 text-sm whitespace-pre-wrap">${escapeHtml(item && item.text || '')}</p></article>`;
    }).join('') : `<p class="text-sm ${theme.subtle}">No staff chat messages yet.</p>`;
    return `<div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-staff-chat="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Staff chat</div><p class="mt-1 text-sm ${theme.subtle}">Admins and moderators can talk here about approvals, notes, and moderation decisions.</p></div><span class="inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${bannerClass}">${escapeHtml(roleLabel || 'Staff')}</span></div><div class="mt-4 grid gap-3">${items}</div><div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><textarea data-stepper-staff-chat-input="1" class="stepper-google-input" rows="3" placeholder="Leave a staff note..."></textarea><button type="button" class="stepper-google-cta ${theme.button}" data-action="send-staff-chat">Send</button></div></div>`;
  }

  async function ensureStaffChatLoaded(force){
    if (!isModeratorSession() && !isAdminSession()) return [];
    if (!force && Array.isArray(state.staffChat)) return state.staffChat;
    const res = await authFetch('/api/staff-chat', {}).catch(() => null);
    state.staffChat = res && Array.isArray(res.messages) ? res.messages : [];
    return state.staffChat;
  }

  async function sendStaffChat(text){
    const clean = String(text || '').trim();
    if (!clean) return;
    const res = await authFetch('/api/staff-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean })
    }).catch(() => null);
    if (!res || res.ok === false) {
      flash('Staff chat could not send right now.', 'error');
      return;
    }
    state.staffChat = Array.isArray(res.messages) ? res.messages : (Array.isArray(state.staffChat) ? state.staffChat : []);
    renderPages();
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
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-stepper-submission-id="${escapeHtml(item.id)}" data-stepper-submission-registry-id="${escapeHtml(item.registryId || '')}">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3"><h3 class="text-lg font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}</h3><span class="stepper-google-pill ${theme.orange}">${escapeHtml(item.requestType || 'request')}</span></div>
            <p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.ownerName || item.ownerEmail || 'Member')} • ${escapeHtml(item.ownerEmail || '')}${item.priority ? ' • Premium priority' : ''}</p>
            <p class="mt-2 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer || 'Uncredited')}${item.country ? ` • ${escapeHtml(item.country)}` : ''}</p>
          </div>
          <div class="stepper-google-badge-row">
            <button type="button" class="stepper-google-cta ${theme.button}" data-action="load-request">Load to worksheet</button>
            ${item.requestType === 'site' ? `<button type="button" class="stepper-google-cta ${theme.button}" data-action="approve-site">Approve upload</button>` : `<button type="button" class="stepper-google-badge-btn" data-action="feature-request" data-tone="bronze">Bronze</button><button type="button" class="stepper-google-badge-btn" data-action="feature-request" data-tone="silver">Silver</button><button type="button" class="stepper-google-badge-btn" data-action="feature-request" data-tone="gold">Gold</button>`}
            <button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="reject-submission">Delete confirmation</button>
          </div>
        </div>
        <div class="mt-4 stepper-google-grid text-sm">
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts || '-')}</div></div>
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls || '-')}</div></div>
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections || 0))}</div></div>
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        <div class="mt-4">${buildPreviewSheetHtml(item, theme, 'Once the member saves the worksheet, the preview sheet will show here for admin review.')}</div>
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
          <div class="mt-4">${buildPreviewSheetHtml(item, theme, 'Save this dance once and its preview sheet will show here.')}</div>
          <div class="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" class="stepper-google-cta ${theme.button}" data-action="load-registry">Load to worksheet</button>
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
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Pending member requests</div><p class="mt-1 text-sm ${theme.subtle}">Approve uploads, reject requests, or feature dances with a badge. This queue refreshes automatically.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.submissions.length))} pending</span></div></div>
        ${pendingCards}
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-moderator-apps="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Moderator applications</div><p class="mt-1 text-sm ${theme.subtle}">People apply from the Sign In tab. Approve or decline them here. This list refreshes automatically.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.moderatorApplications.length))} pending</span></div><div class="mt-4 grid gap-3">${state.moderatorApplications.length ? state.moderatorApplications.map(item => `
          <article class="rounded-2xl border p-4 ${theme.soft}" data-stepper-modapp-id="${escapeHtml(item.id)}">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div><div class="text-base font-black">${escapeHtml(item.ownerName || item.ownerEmail || 'Member')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.ownerEmail || '')}</p></div>
              <div class="flex flex-wrap gap-3"><button type="button" class="stepper-google-cta ${theme.button}" data-action="approve-modapp">Approve moderator</button><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="decline-modapp">Decline</button></div>
            </div>
          </article>`).join('') : `<p class="text-sm ${theme.subtle}">No pending moderator applications.</p>`}</div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-active-moderators="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Moderator management</div><p class="mt-1 text-sm ${theme.subtle}">Add moderators by Google email, approve applications, or remove moderators immediately.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.activeModerators || []).length))} active</span></div><div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><input data-add-moderator-email="1" class="stepper-google-input" placeholder="person@gmail.com" /><button type="button" class="stepper-google-cta ${theme.button}" data-action="add-moderator-email">Add moderator from Gmail</button></div><div class="mt-4 grid gap-3">${(state.activeModerators || []).length ? state.activeModerators.map(item => `
          <article class="rounded-2xl border p-4 ${theme.soft}" data-stepper-active-mod-key="${escapeHtml(item.userKey)}">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div><div class="text-base font-black">${escapeHtml(item.name || item.email || 'Moderator')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.email || '')}</p></div>
              <span class="stepper-google-pill ${theme.orange}">Moderator</span>
            </div>
            <div class="mt-4 ${theme.panel} rounded-2xl border p-4"><label class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Removal note</label><textarea data-remove-mod-note="1" class="stepper-google-input mt-3" rows="3" placeholder="Tell them why they were removed as moderator."></textarea></div>
            <div class="mt-4 flex flex-wrap gap-3"><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="remove-moderator">Delete moderator</button></div>
          </article>`).join('') : `<p class="text-sm ${theme.subtle}">No active moderators yet.</p>`}</div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-suspension-management="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Suspend persons</div><p class="mt-1 text-sm ${theme.subtle}">Enter a Google email to bar someone for a set time. Admins cannot be banned.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.suspensions || []).length))} barred</span></div><div class="mt-4 grid gap-3 sm:grid-cols-2"><input data-suspend-email="1" class="stepper-google-input" placeholder="person@gmail.com" /><select data-suspend-duration="1" class="stepper-google-input"><option value="300000">5 minutes</option><option value="1200000">20 minutes</option><option value="3600000">1 hour</option><option value="18000000">5 hours</option><option value="86400000">1 day</option><option value="259200000">3 days</option><option value="604800000">1 week</option><option value="1814400000">3 weeks</option><option value="2592000000">1 month</option><option value="5184000000">2 months</option><option value="31536000000">1 Year</option><option value="157680000000">5 years</option></select></div><div class="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"><textarea data-suspend-reason="1" class="stepper-google-input" rows="3" placeholder="Reason for the bar"></textarea><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="suspend-person">Bar account</button></div><div class="mt-4 grid gap-3">${(state.suspensions || []).length ? state.suspensions.map(item => `<article class="rounded-2xl border p-4 ${theme.soft}" data-stepper-suspension-key="${escapeHtml(item.userKey)}"><div class="flex flex-wrap items-center justify-between gap-3"><div><div class="text-base font-black">${escapeHtml(item.name || item.email || 'Member')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.email || '')}</p><p class="mt-2 text-xs font-semibold ${theme.subtle}">${escapeHtml((item.suspension && item.suspension.durationLabel) || '')} • ${escapeHtml((item.suspension && item.suspension.reason) || '')}</p></div><button type="button" class="stepper-google-cta ${theme.button}" data-action="lift-suspension">Turn back on</button></div></article>`).join('') : `<p class="text-sm ${theme.subtle}">Nobody is currently barred.</p>`}</div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-security-alerts="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Security alerts</div><p class="mt-1 text-sm ${theme.subtle}">Client-side inspection warnings show here after 3 strikes. This is only a nuisance detector, not perfect protection.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.securityAlerts || []).length))} alerts</span></div><div class="mt-4 grid gap-3">${(state.securityAlerts || []).length ? state.securityAlerts.slice(0,20).map(item => `<article class="rounded-2xl border p-4 ${theme.soft}"><div class="flex flex-wrap items-center justify-between gap-3"><div><div class="text-base font-black">${escapeHtml(item.name || item.email || 'User')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.email || '')}</p><p class="mt-2 text-xs font-semibold ${theme.subtle}">${escapeHtml(item.reason || '')} • ${escapeHtml(String(item.strikeCount || 0))} strikes</p></div></div>${item.detail ? `<p class="mt-3 text-sm ${theme.subtle}">${escapeHtml(item.detail)}</p>` : ''}</article>`).join('') : `<p class="text-sm ${theme.subtle}">No security alerts yet.</p>`}</div></div>
        ${cards}

        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-site-memory="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Helper memory</div><p class="mt-1 text-sm ${theme.subtle}">Add site facts or rules the AI helper should keep using for everyone. This is how the website learns approved things over time.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.siteMemories || []).length))} learned</span></div><div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><textarea data-stepper-site-memory-input="1" class="stepper-google-input" rows="3" placeholder="Example: Featured dances should feel polished but not over-written. Counts should be generated in 8-count blocks whenever possible."></textarea><button type="button" class="stepper-google-cta ${theme.button}" data-action="add-site-memory">Add memory</button></div><div class="mt-4 grid gap-3">${(state.siteMemories || []).length ? state.siteMemories.slice(0,30).map(item => `<div class="rounded-2xl border p-4 ${theme.soft}" data-stepper-site-memory-id="${escapeHtml(item.id)}"><div class="flex flex-wrap items-start justify-between gap-3"><div><div class="text-sm font-black">${escapeHtml(item.text || '')}</div><p class="mt-1 text-xs ${theme.subtle}">${escapeHtml(item.createdByName || item.createdByEmail || 'Admin')}</p></div><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="delete-site-memory">Delete</button></div></div>`).join('') : `<p class="text-sm ${theme.subtle}">No saved helper memory yet.</p>`}</div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-glossary-requests="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Requested dance steps</div><p class="mt-1 text-sm ${theme.subtle}">Admin approves custom glossary steps here. If a request is clearly right-footed or left-footed, the mirrored version is created automatically too.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.glossaryRequests || []).length))} pending</span></div><div class="mt-4 grid gap-4">${(state.glossaryRequests || []).length ? state.glossaryRequests.map(item => `<article class="rounded-2xl border p-4 ${theme.soft}" data-stepper-glossary-request-id="${escapeHtml(item.id)}"><div class="flex flex-wrap items-start justify-between gap-3"><div><div class="text-base font-black">${escapeHtml(item.name || 'Requested Step')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.ownerName || item.ownerEmail || 'Member')} • ${escapeHtml(item.counts || '1')} • ${escapeHtml(item.foot || 'Either')}</p></div><div class="flex flex-wrap gap-3"><button type="button" class="stepper-google-cta ${theme.button}" data-action="approve-glossary-request">Approve</button><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="reject-glossary-request">Decline</button></div></div><div class="mt-4 grid gap-3 sm:grid-cols-2"><div class="rounded-2xl border p-4 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Requested step</div><p class="mt-3 text-sm font-bold">${escapeHtml(item.name || '')}</p><p class="mt-2 text-sm ${theme.subtle}">${escapeHtml(item.description || '')}</p>${item.tags ? `<p class="mt-2 text-xs font-semibold ${theme.subtle}">Tags: ${escapeHtml(item.tags)}</p>` : ''}</div><div class="rounded-2xl border p-4 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Auto twin preview</div>${item.autoMirror ? `<p class="mt-3 text-sm font-bold">${escapeHtml(item.autoMirror.name || '')}</p><p class="mt-2 text-sm ${theme.subtle}">${escapeHtml(item.autoMirror.description || '')}</p><p class="mt-2 text-xs font-semibold ${theme.subtle}">${escapeHtml(item.autoMirror.foot || '')} • ${escapeHtml(item.autoMirror.counts || '')}</p>` : `<p class="mt-3 text-sm ${theme.subtle}">No forced opposite-foot twin for this request.</p>`}</div></div></article>`).join('') : `<p class="text-sm ${theme.subtle}">No pending dance step requests.</p>`}</div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-approved-glossary="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Approved community glossary</div><p class="mt-1 text-sm ${theme.subtle}">These are the admin-approved custom steps everyone can apply from Glossary+ while building.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.glossaryApproved || []).length))} live</span></div><div class="mt-4 grid gap-3">${(state.glossaryApproved || []).length ? state.glossaryApproved.slice(0, 20).map(item => `<div class="rounded-2xl border p-4 ${theme.soft}"><div class="flex flex-wrap items-start justify-between gap-3"><div><div class="text-base font-black">${escapeHtml(item.name || 'Step')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.foot || 'Either')} • ${escapeHtml(item.counts || '1')}</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(item.status || 'approved')}</span></div><p class="mt-3 text-sm ${theme.subtle}">${escapeHtml(item.description || '')}</p></div>`).join('') : `<p class="text-sm ${theme.subtle}">No approved custom glossary steps yet.</p>`}</div></div>
        ${cards}
      </div>
    `;

    page.querySelectorAll('[data-stepper-submission-id]').forEach(card => {
      const submissionId = card.getAttribute('data-stepper-submission-id');
      const registryId = card.getAttribute('data-stepper-submission-registry-id');
      const submission = (state.submissions || []).find(item => String((item && item.id) || '') === String(submissionId || ''));
      const rejectBtn = card.querySelector('[data-action="reject-submission"]');
      if (rejectBtn) rejectBtn.addEventListener('click', () => rejectSubmission(submissionId));
      const approveBtn = card.querySelector('[data-action="approve-site"]');
      if (approveBtn) approveBtn.addEventListener('click', () => approveSiteSubmission(submissionId));
      const loadBtn = card.querySelector('[data-action="load-request"]');
      if (loadBtn) loadBtn.addEventListener('click', () => { if (submission) loadDanceIntoWorksheet(submission); });
      card.querySelectorAll('[data-action="feature-request"]').forEach(button => {
        button.addEventListener('click', () => {
          featureDance(registryId, button.getAttribute('data-tone') || 'bronze');
        });
      });
    });

    page.querySelectorAll('[data-stepper-modapp-id]').forEach(card => {
      const id = card.getAttribute('data-stepper-modapp-id');
      const approve = card.querySelector('[data-action="approve-modapp"]');
      const decline = card.querySelector('[data-action="decline-modapp"]');
      if (approve) approve.addEventListener('click', () => decideModeratorApplication(id, 'approve'));
      if (decline) decline.addEventListener('click', () => decideModeratorApplication(id, 'decline'));
    });

    page.querySelectorAll('[data-stepper-active-mod-key]').forEach(card => {
      const userKey = card.getAttribute('data-stepper-active-mod-key');
      const noteEl = card.querySelector('[data-remove-mod-note="1"]');
      const removeBtn = card.querySelector('[data-action="remove-moderator"]');
      if (removeBtn) removeBtn.addEventListener('click', () => removeModeratorAccess(userKey, noteEl && noteEl.value));
    });
    const staffSendBtn = page.querySelector('[data-action="send-staff-chat"]');
    if (staffSendBtn) staffSendBtn.addEventListener('click', () => {
      const input = page.querySelector('[data-stepper-staff-chat-input="1"]');
      const text = input && input.value;
      sendStaffChat(text);
      if (input) input.value = '';
    });

    const addModeratorBtn = page.querySelector('[data-action="add-moderator-email"]');
    if (addModeratorBtn) addModeratorBtn.addEventListener('click', () => {
      const emailEl = page.querySelector('[data-add-moderator-email="1"]');
      addModeratorByEmail(emailEl && emailEl.value);
      if (emailEl) emailEl.value = '';
    });
    const suspendBtn = page.querySelector('[data-action="suspend-person"]');
    if (suspendBtn) suspendBtn.addEventListener('click', () => {
      const emailEl = page.querySelector('[data-suspend-email="1"]');
      const durationEl = page.querySelector('[data-suspend-duration="1"]');
      const reasonEl = page.querySelector('[data-suspend-reason="1"]');
      const durationMs = Number(durationEl && durationEl.value || 300000);
      const durationLabel = durationEl && durationEl.options && durationEl.selectedIndex >= 0 ? durationEl.options[durationEl.selectedIndex].text : '5 minutes';
      suspendMember(emailEl && emailEl.value, durationMs, durationLabel, reasonEl && reasonEl.value);
    });
    page.querySelectorAll('[data-stepper-suspension-key]').forEach(card => {
      const userKey = card.getAttribute('data-stepper-suspension-key');
      const btn = card.querySelector('[data-action="lift-suspension"]');
      if (btn) btn.addEventListener('click', () => liftSuspension(userKey));
    });

    const addMemoryBtn = page.querySelector('[data-action="add-site-memory"]');
    if (addMemoryBtn) addMemoryBtn.addEventListener('click', async () => {
      const input = page.querySelector('[data-stepper-site-memory-input="1"]');
      const value = input ? input.value : '';
      const ok = await addSiteMemory(value);
      if (ok && input) input.value = '';
    });
    page.querySelectorAll('[data-stepper-site-memory-id]').forEach(card => {
      const id = card.getAttribute('data-stepper-site-memory-id') || '';
      const del = card.querySelector('[data-action="delete-site-memory"]');
      if (del) del.addEventListener('click', () => deleteSiteMemory(id));
    });
    page.querySelectorAll('[data-stepper-glossary-request-id]').forEach(card => {
      const id = card.getAttribute('data-stepper-glossary-request-id');
      const approve = card.querySelector('[data-action="approve-glossary-request"]');
      const reject = card.querySelector('[data-action="reject-glossary-request"]');
      if (approve) approve.addEventListener('click', () => decideGlossaryRequest(id, 'approve'));
      if (reject) reject.addEventListener('click', () => decideGlossaryRequest(id, 'reject'));
    });

    page.querySelectorAll('[data-stepper-registry-id]').forEach(card => {
      const registryId = card.getAttribute('data-stepper-registry-id');
      const item = (state.adminDances || []).find(entry => String((entry && entry.registryId) || '') === String(registryId || ''));
      const loadBtn = card.querySelector('[data-action="load-registry"]');
      if (loadBtn) loadBtn.addEventListener('click', () => { if (item) loadDanceIntoWorksheet(item); });
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
    if (!state.activePage) {
      showNativeExtraHost();
      if (state.ui.mainEl) state.ui.mainEl.style.display = '';
      if (state.ui.footerWrap) state.ui.footerWrap.style.display = '';
    } else {
      hideNativeExtraHost();
      if (state.ui.mainEl) state.ui.mainEl.style.display = '';
      if (state.ui.footerWrap) state.ui.footerWrap.style.display = '';
    }
  }

  function patchFeaturedPageCopy(){
    const page = document.getElementById('stepper-featured-choreo-page');
    if (!page) return;
    const BAD_TEXT_SNIPPETS = [
      'Featured dances now come from the admin workflow instead of Gmail submissions.',
      'Signed-in members can have their work auto-synced to the registry',
      'Public members can still browse everything here once it has been featured.',
      'Contact information'
    ];
    const scrub = () => {
      const noteCard = page.querySelector('.rounded-2xl.border.p-5');
      if (noteCard && !noteCard.dataset.stepperAdminPatched) {
        noteCard.dataset.stepperAdminPatched = 'true';
        const noteText = String(noteCard.textContent || '').replace(/\s+/g, ' ').trim();
        if (BAD_TEXT_SNIPPETS.some(snippet => noteText.includes(snippet)) || /gmail submissions|auto-synced to the registry|bronze, silver, or gold/i.test(noteText)) {
          noteCard.remove();
        }
      }
      page.querySelectorAll('p, div, section, article, aside, span').forEach(node => {
        if (!node || node === page || node.children.length > 12) return;
        const text = String(node.textContent || '').replace(/\s+/g, ' ').trim();
        if (!text) return;
        if (BAD_TEXT_SNIPPETS.some(snippet => text.includes(snippet)) || /gmail submissions|auto-synced to the registry|bronze, silver, or gold feature badge/i.test(text)) {
          node.remove();
        }
      });
    };
    scrub();
    if (page.dataset.stepperFeaturedScrubber === 'true') return;
    page.dataset.stepperFeaturedScrubber = 'true';
    const observer = new MutationObserver(() => scrub());
    observer.observe(page, { childList: true, subtree: true, characterData: true });
  }

  function renderPages(){
    locateUi();
    ensureHost();
    renderSignInPage();
    renderSubscriptionPage();
    renderAdminPage();
    syncPageVisibility();
    renderPresenceOnly();
    renderSuspensionBanner();
    patchFeaturedPageCopy();
    updateAdminTabVisibility();
    updateTabButtons();
    renderQuickActions();
    if (document.getElementById('stepper-saved-dances-page') && ((document.getElementById('stepper-saved-dances-page').offsetParent || document.getElementById('stepper-saved-dances-page').getClientRects().length) && getComputedStyle(document.getElementById('stepper-saved-dances-page')).display !== 'none')) patchSavedDancesPage();
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
    wireSecurityDeterrent();
    await refreshConfig();
    await refreshPresence();
    if (state.session && state.session.credential) {
      await refreshSession();
      await heartbeat();
      await refreshCloudSaves();
    state.savedDancesUiSignature = '';
      await restoreLatestCloudSaveIfNeeded();
      await syncCurrentDanceToBackend(false);
      await refreshNotifications();
      await refreshSubscription();
      await confirmCheckoutIfPresent();
      if (isAdminSession()) { await refreshAdminDances(); await refreshSubmissions(); await refreshGlossaryRequests(); }
    }
    await refreshGlossaryApproved();
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
    wireSecurityDeterrent();
    updateAdminTabVisibility();
    updateTabButtons();
    renderPresenceOnly();
    renderSuspensionBanner();
    patchFeaturedPageCopy();
    const __savedPage = document.getElementById('stepper-saved-dances-page');
    if (__savedPage && ((__savedPage.offsetParent || __savedPage.getClientRects().length) && getComputedStyle(__savedPage).display !== 'none' && getComputedStyle(__savedPage).visibility !== 'hidden')) patchSavedDancesPage();
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
    refreshGlossaryApproved();
    if (isAdminSession()) { refreshAdminDances(); refreshSubmissions(); refreshGlossaryRequests(); }
  }, FEATURED_SYNC_INTERVAL_MS);

  window.addEventListener('beforeunload', (event) => {
    if (!hasUnsavedChanges()) return;
    event.preventDefault();
    event.returnValue = '';
  });

  window.addEventListener('storage', () => {
    if (state.session && state.session.credential) syncCurrentDanceToBackend(false);
    state.savedDancesUiSignature = '';
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
      const existing = state.subscription && typeof state.subscription === 'object' ? state.subscription : {};
      const keepModerator = !!((state.session && state.session.isModerator) || existing.isModerator || existing.role === 'moderator');
      const keepAdmin = isAdminSession() || existing.role === 'admin';
      state.subscription = Object.assign({}, existing, {
        isPremium: keepAdmin || keepModerator || !!existing.isPremium,
        plan: keepAdmin ? 'admin' : (keepModerator ? 'moderator' : (existing.plan || 'free')),
        status: keepAdmin || keepModerator ? 'active' : (existing.status || 'free'),
        source: 'fallback',
        isModerator: keepModerator,
        role: keepAdmin ? 'admin' : (keepModerator ? 'moderator' : (existing.role || 'member'))
      });
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
      saveApiBase(state.apiBase || DEFAULT_BACKEND_BASE);
      await saveChangesNow({ force:true }).catch(() => false);
      localStorage.setItem('stepper_pending_checkout_plan_v1', String(plan || '').trim());
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
      localStorage.removeItem('stepper_pending_checkout_plan_v1');
      await saveChangesNow({ force:true }).catch(() => false);
      url.searchParams.delete('checkout_session_id');
      url.searchParams.delete('session_id');
      history.replaceState({}, '', url.toString());
      renderPages();
      return true;
    } catch (error) {
      return false;
    }
  }

  const MODERATOR_PAGE_ID = 'stepper-google-moderator-page';
  const MODERATOR_TAB_ID = 'stepper-google-moderator-tab';
  state.moderatorQueue = Array.isArray(state.moderatorQueue) ? state.moderatorQueue : [];
  state.moderatorApplications = Array.isArray(state.moderatorApplications) ? state.moderatorApplications : [];
  state.activeModerators = Array.isArray(state.activeModerators) ? state.activeModerators : [];
  state.ui.moderatorBtn = state.ui.moderatorBtn || null;

  function isModeratorSession(){
    return !isAdminSession() && !!((state.session && state.session.isModerator) || (state.subscription && (state.subscription.isModerator || state.subscription.role === 'moderator')));
  }

  const __origPaymentStatusLabel = paymentStatusLabel;
  paymentStatusLabel = function(){
    if (isModeratorSession()) return 'Moderator access';
    return __origPaymentStatusLabel();
  };

  function buildPreviewSectionsFromData(data){
    const sections = Array.isArray(data && data.sections) ? data.sections : [];
    return sections.slice(0, 8).map((section, index) => {
      const steps = Array.isArray(section && section.steps) ? section.steps : [];
      const lines = steps.slice(0, 12).map((step) => {
        const count = String((step && (step.count || step.counts)) || '').trim();
        const name = String((step && step.name) || '').trim();
        const description = String((step && (step.description || step.desc)) || '').trim();
        const note = step && step.showNote ? String(step.note || '').trim() : '';
        return [count, name, description, note ? `(${note})` : ''].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
      }).filter(Boolean);
      return { name: String((section && section.name) || `Section ${index + 1}`).trim(), lines };
    }).filter(section => Array.isArray(section.lines) && section.lines.length);
  }

  function buildStoredJsonPayload(entry){
    if (!entry) return '';
    try {
      return JSON.stringify({
        schemaVersion: 2,
        savedAt: new Date().toISOString(),
        dance: {
          id: entry.id,
          title: entry.title,
          choreographer: entry.choreographer,
          country: entry.country,
          level: entry.level,
          counts: entry.counts,
          walls: entry.walls,
          music: entry.music,
          sections: entry.sections,
          steps: entry.steps,
          updatedAt: entry.updatedAt || new Date().toISOString(),
          ownerEmail: entry.ownerEmail || '',
          ownerName: entry.ownerName || ''
        },
        previewSections: Array.isArray(entry.previewSections) ? entry.previewSections : [],
        snapshot: entry.snapshot && typeof entry.snapshot === 'object' ? entry.snapshot : { data: {}, phrasedTools: {} }
      });
    } catch {
      return '';
    }
  }

  function parseStoredJsonPayload(value){
    const raw = String(value || '').trim();
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  function coerceStoredObject(value){
    if (!value) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      try {
        const parsed = JSON.parse(trimmed);
        return parsed && typeof parsed === 'object' ? parsed : null;
      } catch {
        return null;
      }
    }
    return typeof value === 'object' ? value : null;
  }

  function normalizeRestoredSections(rawSections){
    if (!Array.isArray(rawSections)) return [];
    return rawSections.map((section, sectionIndex) => {
      if (!section || typeof section !== 'object') return null;
      const rawSteps = Array.isArray(section.steps) ? section.steps : (Array.isArray(section.lines) ? section.lines.map((line, lineIndex) => buildRestoredStepFromLine(line, lineIndex)) : []);
      const steps = rawSteps.map((step, stepIndex) => {
        if (!step) return null;
        if (typeof step === 'string') return buildRestoredStepFromLine(step, stepIndex);
        const count = String(step.count || step.counts || '').trim();
        const name = String(step.name || '').trim();
        const description = String(step.description || step.desc || '').trim();
        const note = String(step.note || '').trim();
        return {
          id: String(step.id || `restored-${Date.now().toString(36)}-${sectionIndex}-${stepIndex}-${Math.random().toString(36).slice(2, 7)}`),
          type: 'step',
          count,
          counts: count || String(step.counts || '').trim(),
          name,
          description: description || name,
          foot: normalizeFootForRestore(step.foot),
          weight: !!step.weight,
          showNote: !!(step.showNote || note),
          note
        };
      }).filter(Boolean);
      return {
        id: String(section.id || `restored-section-${sectionIndex}-${Math.random().toString(36).slice(2, 7)}`),
        name: String(section.name || section.title || `Section ${sectionIndex + 1}`).trim(),
        steps
      };
    }).filter(section => section && Array.isArray(section.steps));
  }

  function extractStoredSnapshotData(entry, parsed){
    const candidates = [
      entry && entry.snapshot && entry.snapshot.data,
      parsed && parsed.snapshot && parsed.snapshot.data,
      parsed && parsed.snapshot,
      parsed && parsed.data,
      parsed && parsed.worksheet,
      parsed && parsed.sheet,
      parsed && parsed.editorData,
      parsed && parsed.appData,
      parsed && parsed.dance && parsed.dance.data,
      parsed && parsed.dance && parsed.dance.snapshot && parsed.dance.snapshot.data
    ];
    for (const candidate of candidates) {
      const obj = coerceStoredObject(candidate);
      if (!obj) continue;
      const sections = normalizeRestoredSections(obj.sections || obj.mainSections || obj.parts || obj.sheetSections);
      const tags = Array.isArray(obj.tags) ? obj.tags : [];
      if (obj.meta || sections.length || tags.length) {
        return {
          meta: Object.assign({}, obj.meta || {}, obj.metaData || {}),
          sections,
          tags,
          isDarkMode: !!obj.isDarkMode
        };
      }
    }
    return null;
  }


  function normalizeFootForRestore(value){
    const raw = String(value || '').trim();
    if (!raw) return 'Either';
    const lower = raw.toLowerCase();
    if (lower === 'r' || lower === 'right') return 'R';
    if (lower === 'l' || lower === 'left') return 'L';
    if (lower === 'both') return 'Both';
    if (lower === 'either') return 'Either';
    return raw;
  }

  function deriveStepNameFromText(text){
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    const withoutLeadCount = clean.replace(/^\s*(?:count(?:s)?[:\s-]*)?(?:\d+\s*(?:[,&-]\s*\d+)*[&a-z]*)\s+/i, '').trim();
    const head = withoutLeadCount.split(/\s*[–—:\-]\s*/)[0].trim();
    const words = head.split(/\s+/).filter(Boolean);
    return words.slice(0, Math.min(words.length, 5)).join(' ');
  }

  function deriveCountsFromText(text){
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    const match = clean.match(/^\s*((?:count(?:s)?[:\s-]*)?(?:\d+[a-z&]*(?:\s*[\-–—,&]\s*\d+[a-z&]*)*))/i);
    if (!match) return '';
    return String(match[1] || '').replace(/^count(?:s)?[:\s-]*/i, '').trim();
  }

  function findGlossaryMatchForText(text){
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return null;
    const lower = clean.toLowerCase();
    const stripped = lower.replace(/^\s*(?:count(?:s)?[:\s-]*)?(?:\d+[a-z&]*(?:\s*[\-–—,&]\s*\d+[a-z&]*)*)\s+/i, '').trim();
    const items = Array.isArray(state.glossaryApproved) ? state.glossaryApproved : [];
    let best = null;
    let bestScore = 0;
    items.forEach((item) => {
      const name = String(item && item.name || '').trim();
      const desc = String(item && (item.description || item.desc) || '').trim();
      if (!name && !desc) return;
      let score = 0;
      const nameLower = name.toLowerCase();
      const descLower = desc.toLowerCase();
      if (stripped === nameLower) score = 100;
      else if (stripped.startsWith(nameLower)) score = 85;
      else if (nameLower && stripped.includes(nameLower)) score = 72;
      else if (descLower && (stripped === descLower || stripped.includes(descLower) || descLower.includes(stripped))) score = 60;
      const nameWords = nameLower.split(/\s+/).filter(Boolean);
      const overlap = nameWords.filter((word) => stripped.includes(word)).length;
      if (overlap >= 2) score = Math.max(score, 45 + overlap * 8);
      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    });
    return bestScore >= 45 ? best : null;
  }

  function buildRestoredStepFromLine(line, index){
    const clean = String(line || '').replace(/\s+/g, ' ').trim();
    const glossary = findGlossaryMatchForText(clean);
    const counts = deriveCountsFromText(clean) || String(glossary && glossary.counts || '').trim();
    const name = String(glossary && glossary.name || '').trim() || deriveStepNameFromText(clean) || `Step ${index + 1}`;
    const description = String(glossary && (glossary.description || glossary.desc) || '').trim() || clean || name;
    const foot = normalizeFootForRestore(glossary && glossary.foot);
    return {
      id: `restored-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 7)}`,
      type: 'step',
      count: counts,
      counts,
      name,
      description,
      foot,
      weight: false,
      showNote: false,
      note: ''
    };
  }

  function buildSnapshotDataFromEntry(entry){
    if (!entry || typeof entry !== 'object') return null;
    const parsed = parseStoredJsonPayload(entry.jsonPayload);
    const dance = parsed && parsed.dance && typeof parsed.dance === 'object' ? parsed.dance : {};
    const existingData = extractStoredSnapshotData(entry, parsed);
    const previewSections = (Array.isArray(entry.previewSections) && entry.previewSections.length)
      ? entry.previewSections
      : (parsed && Array.isArray(parsed.previewSections) ? parsed.previewSections : []);
    const metaSource = Object.assign({}, dance, entry, existingData && existingData.meta ? existingData.meta : {});
    const fallbackSectionBlocks = previewSections.length ? previewSections : [{
      name: String(entry.title || dance.title || 'Loaded Dance').trim(),
      lines: []
    }];
    const rebuiltSections = fallbackSectionBlocks.map((section, sectionIndex) => {
      const lines = Array.isArray(section && section.lines) ? section.lines.filter(Boolean) : [];
      const steps = lines.map((line, lineIndex) => buildRestoredStepFromLine(line, lineIndex))
        .filter(step => String(step.description || '').trim() || String(step.name || '').trim());
      return {
        id: `restored-section-${sectionIndex}-${Math.random().toString(36).slice(2, 7)}`,
        name: String(section && section.name || `Section ${sectionIndex + 1}`).trim(),
        steps: steps.length ? steps : []
      };
    }).filter(Boolean);
    const sections = (existingData && Array.isArray(existingData.sections) && existingData.sections.length)
      ? existingData.sections
      : rebuiltSections;
    return {
      meta: {
        title: String(metaSource.title || '').trim(),
        choreographer: String(metaSource.choreographer || '').trim(),
        country: String(metaSource.country || '').trim(),
        level: String(metaSource.level || '').trim(),
        counts: String(metaSource.counts || metaSource.count || '').trim(),
        walls: String(metaSource.walls || metaSource.wall || '').trim(),
        music: String(metaSource.music || '').trim()
      },
      sections: sections.length ? sections : [{
        id: 'restored-section-0',
        name: String(metaSource.title || 'Loaded Dance').trim() || 'Loaded Dance',
        steps: []
      }],
      tags: Array.isArray(existingData && existingData.tags) ? existingData.tags : [],
      isDarkMode: !!(existingData && existingData.isDarkMode)
    };
  }

  function normalizeStoredEntry(entry){
    if (!entry || typeof entry !== 'object') return null;
    const parsed = parseStoredJsonPayload(entry.jsonPayload);
    const dance = parsed && parsed.dance && typeof parsed.dance === 'object' ? parsed.dance : {};
    const snapshot = entry.snapshot || (parsed && parsed.snapshot && typeof parsed.snapshot === 'object' ? parsed.snapshot : null);
    const previewSections = (Array.isArray(entry.previewSections) && entry.previewSections.length)
      ? entry.previewSections
      : (parsed && Array.isArray(parsed.previewSections) ? parsed.previewSections : []);
    return Object.assign({}, entry, {
      id: entry.id || dance.id || '',
      title: entry.title || dance.title || 'Untitled Dance',
      choreographer: entry.choreographer || dance.choreographer || 'Uncredited',
      country: entry.country || dance.country || '',
      level: entry.level || dance.level || 'Unlabelled',
      counts: entry.counts || dance.counts || '-',
      walls: entry.walls || dance.walls || '-',
      music: entry.music || dance.music || '',
      sections: Number.isFinite(Number(entry.sections)) ? Number(entry.sections) : (Number.isFinite(Number(dance.sections)) ? Number(dance.sections) : 0),
      steps: Number.isFinite(Number(entry.steps)) ? Number(entry.steps) : (Number.isFinite(Number(dance.steps)) ? Number(dance.steps) : 0),
      snapshot,
      previewSections,
      jsonPayload: entry.jsonPayload || (parsed ? JSON.stringify(parsed) : '')
    });
  }

  const __origBuildCurrentDanceEntry = buildCurrentDanceEntry;
  buildCurrentDanceEntry = function(){
    const entry = __origBuildCurrentDanceEntry();
    if (!entry) return null;
    entry.previewSections = buildPreviewSectionsFromData(entry.snapshot && entry.snapshot.data ? entry.snapshot.data : {});
    entry.jsonPayload = buildStoredJsonPayload(entry);
    return entry;
  };

  const __origBuildPreviewSectionsFromEntry = buildPreviewSectionsFromEntry;
  buildPreviewSectionsFromEntry = function(entry){
    const normalized = normalizeStoredEntry(entry);
    if (normalized && Array.isArray(normalized.previewSections) && normalized.previewSections.length) {
      return normalized.previewSections.filter(section => section && Array.isArray(section.lines) && section.lines.length).slice(0, 8);
    }
    return __origBuildPreviewSectionsFromEntry(normalized || entry);
  };

  const __origRestoreDanceSnapshot = restoreDanceSnapshot;
  restoreDanceSnapshot = function(item){
    const normalized = normalizeStoredEntry(item);
    const rebuiltData = buildSnapshotDataFromEntry(normalized || item);
    if (rebuiltData && typeof rebuiltData === 'object') {
      writeJson(DATA_KEY, rebuiltData);
      const phrasedTools = normalized && normalized.snapshot && normalized.snapshot.phrasedTools && typeof normalized.snapshot.phrasedTools === 'object'
        ? normalized.snapshot.phrasedTools
        : {};
      writeJson(PHR_TOOLS_KEY, phrasedTools);
      try { sessionStorage.setItem('stepper_force_loaded_worksheet_v1', '1'); } catch {}
      window.dispatchEvent(new StorageEvent('storage', { key: DATA_KEY, newValue: JSON.stringify(rebuiltData) }));
      window.dispatchEvent(new CustomEvent('stepper:worksheet-loaded', { detail: { data: rebuiltData } }));
      return true;
    }
    return __origRestoreDanceSnapshot(item);
  };

  const __origLoadDanceIntoWorksheet = loadDanceIntoWorksheet;
  loadDanceIntoWorksheet = function(item){
    const ok = __origLoadDanceIntoWorksheet(normalizeStoredEntry(item) || item);
    if (ok) {
      window.setTimeout(() => {
        try {
          if (sessionStorage.getItem('stepper_force_loaded_worksheet_v1') === '1') {
            sessionStorage.removeItem('stepper_force_loaded_worksheet_v1');
            window.location.reload();
          }
        } catch {}
      }, 120);
    }
    return ok;
  };

  const __origRefreshSession = refreshSession;
  refreshSession = async function(){
    const data = await __origRefreshSession();
    if (data && state.session) {
      saveSession(Object.assign({}, state.session, {
        isAdmin: !!data.isAdmin,
        isModerator: !!data.isModerator,
        role: data.role || (data.isAdmin ? 'admin' : (data.isModerator ? 'moderator' : 'member'))
      }));
    }
    return data;
  };

  const __origHeartbeat = heartbeat;
  heartbeat = async function(){
    const data = await __origHeartbeat();
    if (data && state.session) {
      saveSession(Object.assign({}, state.session, {
        isAdmin: !!data.isAdmin,
        isModerator: !!data.isModerator,
        role: data.role || (data.isAdmin ? 'admin' : (data.isModerator ? 'moderator' : 'member'))
      }));
    }
    return data;
  };

  const __origRefreshSubscription = refreshSubscription;
  refreshSubscription = async function(){
    const wasAdmin = isAdminSession();
    const wasModerator = isModeratorSession();
    const data = await __origRefreshSubscription();
    state.subscription = Object.assign({ role: 'member', isModerator: false }, state.subscription || {}, data || {});
    const nowAdmin = isAdminSession();
    const nowModerator = isModeratorSession();
    if ((wasAdmin && !nowAdmin) || (wasModerator && !nowModerator)) {
      if (state.activePage === 'admin' || state.activePage === 'moderator') state.activePage = 'signin';
      renderPages();
    }
    return state.subscription;
  };

  const __origHandleGoogleCredential = handleGoogleCredential;
  handleGoogleCredential = async function(response){
    await __origHandleGoogleCredential(response);
    await refreshSession().catch(() => null);
    await refreshSubscription().catch(() => null);
    if (isModeratorSession()) await refreshModeratorQueue().catch(() => []);
    if (isAdminSession()) {
      await refreshModeratorApplications().catch(() => []);
      await refreshActiveModerators().catch(() => []);
      await refreshSuspensions().catch(() => []);
      await refreshSecurityAlerts().catch(() => []);
    }
    renderPages();
  };

  async function refreshModeratorQueue(){
    if (!(state.session && state.session.credential) || !isModeratorSession()) { state.moderatorQueue = []; return []; }
    try {
      const data = await authFetch('/api/moderator/submissions');
      state.moderatorQueue = Array.isArray(data.items) ? data.items : [];
      return state.moderatorQueue;
    } catch {
      state.moderatorQueue = [];
      return [];
    }
  }

  async function refreshModeratorApplications(){
    if (!isAdminSession()) { state.moderatorApplications = []; return []; }
    try {
      const data = await authFetch('/api/admin/moderator-applications');
      state.moderatorApplications = Array.isArray(data.items) ? data.items : [];
      return state.moderatorApplications;
    } catch {
      state.moderatorApplications = [];
      return [];
    }
  }

  async function refreshActiveModerators(){
    if (!isAdminSession()) { state.activeModerators = []; return []; }
    try {
      const data = await authFetch('/api/admin/moderators');
      state.activeModerators = Array.isArray(data.items) ? data.items : [];
      return state.activeModerators;
    } catch {
      state.activeModerators = [];
      return [];
    }
  }

  async function refreshSuspensions(){
    if (!isAdminSession()) { state.suspensions = []; return []; }
    try {
      const data = await authFetch('/api/admin/suspensions');
      state.suspensions = Array.isArray(data.items) ? data.items : [];
      return state.suspensions;
    } catch {
      state.suspensions = [];
      return [];
    }
  }

  async function refreshSecurityAlerts(){
    if (!isAdminSession()) { state.securityAlerts = []; return []; }
    try {
      const data = await authFetch('/api/admin/security-alerts');
      state.securityAlerts = Array.isArray(data.items) ? data.items : [];
      return state.securityAlerts;
    } catch {
      state.securityAlerts = [];
      return [];
    }
  }

  async function suspendMember(email, durationMs, durationLabel, reason){
    try {
      await authFetch('/api/admin/suspend', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ email, durationMs, durationLabel, reason })
      });
      await Promise.all([refreshSuspensions(), refreshSecurityAlerts()]);
      renderPages();
      alert('Bar saved.');
    } catch (error) {
      alert(error.message || 'Could not bar that person.');
    }
  }

  async function liftSuspension(userKey){
    try {
      await authFetch(`/api/admin/suspensions/${encodeURIComponent(userKey)}/lift`, { method:'POST' });
      await refreshSuspensions();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not lift that bar.');
    }
  }

  async function addModeratorByEmail(email){
    try {
      await authFetch('/api/admin/moderators/add', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ email })
      });
      await Promise.all([refreshActiveModerators(), refreshModeratorApplications()]);
      renderPages();
      alert('Moderator added.');
    } catch (error) {
      alert(error.message || 'Could not add moderator.');
    }
  }

  let __stepperSecuritySent = false;
  async function sendSecurityStrike(trigger, detail){
    if (__stepperSecuritySent) return;
    __stepperSecuritySent = true;
    try {
      await authFetch('/api/security-alerts/strike', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ trigger, detail })
      });
    } catch {}
    setTimeout(() => { __stepperSecuritySent = false; }, 8000);
  }

  function wireSecurityDeterrent(){
    if (window.__stepperSecurityDeterrentWired) return;
    window.__stepperSecurityDeterrentWired = true;
    const strike = (trigger, detail) => {
      if (!state.session || !state.session.credential || isAdminSession()) return;
      sendSecurityStrike(trigger, detail);
    };
    window.addEventListener('keydown', (event) => {
      const key = String(event.key || '').toLowerCase();
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) strike('devtools-shortcut', `${key} shortcut`);
      if ((event.ctrlKey || event.metaKey) && key === 'u') strike('view-source-shortcut', 'Ctrl/Cmd+U');
    }, true);
    window.addEventListener('contextmenu', () => strike('contextmenu', 'Right click on live site'), true);
  }


  async function removeModeratorAccess(userKey, reason){
    const note = String(reason || '').trim();
    if (!userKey) return;
    if (!note) {
      alert('Add a reason so the removed moderator can see why on next startup.');
      return;
    }
    try {
      await authFetch(`/api/admin/moderators/${encodeURIComponent(userKey)}/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: note })
      });
      await refreshActiveModerators().catch(() => []);
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not remove moderator access.');
    }
  }

  async function applyForModerator(){
    if (!(state.session && state.session.credential)) {
      openPage('signin');
      renderPages();
      return false;
    }
    try {
      const data = await authFetch('/api/moderator/apply', { method: 'POST' });
      alert(data && data.alreadyPending ? 'Moderator application already sent.' : (data && data.alreadyApproved ? 'This account already has moderator access.' : 'Moderator application sent to admin.'));
      return true;
    } catch (error) {
      alert(error.message || 'Could not send moderator application.');
      return false;
    }
  }

  async function decideModeratorApplication(applicationId, decision){
    try {
      const path = decision === 'decline' ? `/api/admin/moderator-applications/${encodeURIComponent(applicationId)}/decline` : `/api/admin/moderator-applications/${encodeURIComponent(applicationId)}/approve`;
      await authFetch(path, { method: 'POST' });
      await refreshModeratorApplications();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not update moderator application.');
    }
  }

  async function moderatorReviewSubmission(submissionId, decision, note){
    try {
      await authFetch(`/api/moderator/submissions/${encodeURIComponent(submissionId)}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, note })
      });
      await refreshModeratorQueue();
      if (isAdminSession()) await refreshSubmissions();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not send moderator review.');
    }
  }

  const __origUpdateTabButtons = updateTabButtons;
  updateTabButtons = function(){
    __origUpdateTabButtons();
    applyTabStyles(state.ui.moderatorBtn, state.activePage === 'moderator', '#f59e0b');
  };

  const __origEnsureHost = ensureHost;
  ensureHost = function(){
    const host = __origEnsureHost();
    if (!document.getElementById(MODERATOR_PAGE_ID)) {
      const page = document.createElement('section');
      page.id = MODERATOR_PAGE_ID;
      page.hidden = true;
      page.style.display = 'none';
      const adminPage = document.getElementById('stepper-google-admin-page');
      if (adminPage && adminPage.parentNode) adminPage.parentNode.insertBefore(page, adminPage);
      else host.querySelector('div')?.appendChild(page);
    }
    return host;
  };

  const __origLocateUi = locateUi;
  locateUi = function(){
    const ok = __origLocateUi();
    if (!ok || !state.ui.tabStrip) return ok;
    if (!state.ui.moderatorBtn || !document.getElementById(MODERATOR_TAB_ID)) {
      state.ui.moderatorBtn = makeTabButton('Moderator', iconShield(), 'moderator', MODERATOR_TAB_ID);
    }
    const adminBtn = state.ui.adminBtn;
    if (state.ui.moderatorBtn && !state.ui.moderatorBtn.parentNode) {
      if (adminBtn && adminBtn.parentNode === state.ui.tabStrip) adminBtn.insertAdjacentElement('beforebegin', state.ui.moderatorBtn);
      else if (state.ui.subscriptionBtn && state.ui.subscriptionBtn.parentNode === state.ui.tabStrip) state.ui.subscriptionBtn.insertAdjacentElement('afterend', state.ui.moderatorBtn);
      else state.ui.tabStrip.appendChild(state.ui.moderatorBtn);
    }
    return ok;
  };

  const __origOpenPage = openPage;
  openPage = function(pageName){
    if (pageName === 'moderator') {
      state.activePage = 'moderator';
      const host = ensureHost();
      host.hidden = false;
      host.style.display = '';
      hideNativeExtraHost();
      if (state.ui.mainEl) state.ui.mainEl.style.display = 'none';
      if (state.ui.footerWrap) state.ui.footerWrap.style.display = 'none';
      renderPages();
      updateTabButtons();
      return;
    }
    return __origOpenPage(pageName);
  };

  const __origUpdateAdminTabVisibility = updateAdminTabVisibility;
  updateAdminTabVisibility = function(){
    __origUpdateAdminTabVisibility();
    if (state.ui.moderatorBtn) {
      const visible = isModeratorSession();
      state.ui.moderatorBtn.style.display = visible ? '' : 'none';
      state.ui.moderatorBtn.hidden = !visible;
      if (!visible && state.activePage === 'moderator') state.activePage = 'signin';
    }
  };

  function renderModeratorPage(){
    const page = document.getElementById(MODERATOR_PAGE_ID);
    if (!page) return;
    const theme = themeClasses();
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    if (!(state.session && state.session.credential) || !isModeratorSession()) {
      page.innerHTML = `
        <div class="px-6 py-5 border-b ${theme.panel}">
          <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconShield()}</span> Moderator</h2>
        </div>
        <div class="p-6 sm:p-8"><div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-black">Moderator access only.</p><p class="mt-2 text-sm ${theme.subtle}">Apply in Subscription. Once admin approves it, this tab appears and the premium helper perks come with it.</p></div></div>`;
      return;
    }
    const cards = state.moderatorQueue.length ? state.moderatorQueue.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-stepper-moderator-id="${escapeHtml(item.id)}">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3"><h3 class="text-lg font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}</h3><span class="stepper-google-pill ${theme.orange}">${escapeHtml(item.requestType || 'request')}</span>${item.priority ? `<span class="stepper-google-pill ${theme.orange}">Priority</span>` : ''}</div>
            <p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.ownerName || item.ownerEmail || 'Member')} • ${escapeHtml(item.ownerEmail || '')}</p>
            <p class="mt-2 text-sm ${theme.subtle}">Leave a note when you approve or disapprove so admin can see exactly what you put on it.</p>
          </div>
        </div>
        <div class="mt-4 ${theme.panel} rounded-2xl border p-4">
          <label class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Moderator note</label>
          <textarea data-moderator-note="1" class="stepper-google-input mt-3" rows="3" placeholder="Explain why you approved or disapproved this dance.">${escapeHtml(item.moderatorNote || '')}</textarea>
        </div>
        <div class="mt-4">${buildPreviewSheetHtml(item, theme, 'The saved JSON preview will show here once the member has saved the worksheet.')}</div>
        <div class="mt-5 flex flex-wrap gap-3">
          <button type="button" class="stepper-google-cta ${theme.button}" data-action="load-moderator">Load to worksheet</button>
          <button type="button" class="stepper-google-cta ${theme.button}" data-action="approve-moderator" style="background:#fef3c7;color:#92400e;border-color:#f59e0b;">Approve • Yellow badge</button>
          <button type="button" class="stepper-google-cta ${theme.button}" data-action="disapprove-moderator" style="background:#fee2e2;color:#991b1b;border-color:#ef4444;">Disapprove • Red badge</button>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-black">No dances waiting on moderator review.</p><p class="mt-2 text-sm ${theme.subtle}">When members send dances to admin, they will appear here for moderator checks.</p></div>`;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconShield()}</span> Moderator</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}">
          <div class="text-lg font-black tracking-tight">Rules of moderating</div>
          <ol class="mt-3 space-y-2 text-sm ${theme.subtle}">
            <li>1. No abusing rights. Do not falsely disapprove a good post.</li>
            <li>2. Fairness is key. If you do not like someone, their work stays untouched.</li>
            <li>3. Approvals and disapprovals need notes so admin can see exactly what you put on them.</li>
          </ol>
        </div>
        ${cards}
      </div>`;
    page.querySelectorAll('[data-stepper-moderator-id]').forEach(card => {
      const submissionId = card.getAttribute('data-stepper-moderator-id');
      const item = (state.moderatorQueue || []).find(entry => String((entry && entry.id) || '') === String(submissionId || ''));
      const noteEl = card.querySelector('[data-moderator-note="1"]');
      const getNote = () => String(noteEl && noteEl.value || '').trim();
      const loadBtn = card.querySelector('[data-action="load-moderator"]');
      if (loadBtn) loadBtn.addEventListener('click', () => { if (item) loadDanceIntoWorksheet(item); });
      const approveBtn = card.querySelector('[data-action="approve-moderator"]');
      if (approveBtn) approveBtn.addEventListener('click', () => moderatorReviewSubmission(submissionId, 'approve', getNote()));
      const disapproveBtn = card.querySelector('[data-action="disapprove-moderator"]');
      if (disapproveBtn) disapproveBtn.addEventListener('click', () => moderatorReviewSubmission(submissionId, 'disapprove', getNote()));
    });
  }

  function decorateSubscriptionPage(){
    const page = document.getElementById(SUBSCRIPTION_PAGE_ID);
    if (!page || !(state.session && state.session.credential)) return;
    const theme = themeClasses();
    if (isModeratorSession() || isAdminSession()) return;
    if (page.querySelector('[data-stepper-moderator-apply="1"]')) return;
    const wrap = document.createElement('div');
    wrap.className = `rounded-3xl border p-5 sm:p-6 ${theme.soft}`;
    wrap.innerHTML = `<div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Apply for moderator</div><p class="mt-2 text-sm ${theme.subtle}">Moderators get the premium helper perks without the Admin tab. Admin can approve or decline your request.</p></div><button type="button" data-stepper-moderator-apply="1" class="stepper-google-cta ${theme.button}">Apply for moderator</button></div>`;
    page.querySelector('.p-6, .p-6.sm\:p-8')?.appendChild(wrap);
    const btn = wrap.querySelector('[data-stepper-moderator-apply="1"]');
    if (btn) btn.addEventListener('click', () => applyForModerator());
  }

  function decorateAdminPage(){
    const page = document.getElementById(ADMIN_PAGE_ID);
    if (!page || !isAdminSession()) return;
    const theme = themeClasses();
    page.querySelectorAll('[data-stepper-submission-id]').forEach(card => {
      const submissionId = card.getAttribute('data-stepper-submission-id');
      const item = (state.submissions || []).find(entry => String((entry && entry.id) || '') === String(submissionId || ''));
      if (!item) return;
      if (!card.querySelector('[data-moderator-badges="1"]')) {
        const row = card.querySelector('.stepper-google-badge-row');
        if (row) {
          const badges = document.createElement('div');
          badges.setAttribute('data-moderator-badges', '1');
          badges.style.display = 'contents';
          row.prepend(badges);
        }
      }
      const badges = card.querySelector('[data-moderator-badges="1"]');
      if (badges) {
        if (String(item.moderatorReviewStatus || '') === 'approved') badges.innerHTML = `<span class="stepper-google-pill ${theme.orange}" style="background:#fef3c7;color:#92400e;border:1px solid #f59e0b;">Moderator approved</span>`;
        else if (String(item.moderatorReviewStatus || '') === 'disapproved') badges.innerHTML = `<span class="stepper-google-pill ${theme.orange}" style="background:#fee2e2;color:#991b1b;border:1px solid #ef4444;">Moderator disapproved</span>`;
        else badges.innerHTML = '';
      }
      if (item.moderatorNote && !card.querySelector('[data-moderator-note-view="1"]')) {
        const note = document.createElement('div');
        note.setAttribute('data-moderator-note-view', '1');
        note.className = `mt-3 rounded-2xl border p-4 ${theme.panel}`;
        note.innerHTML = `<div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Moderator note</div><p class="mt-2 text-sm ${theme.subtle}">${escapeHtml(item.moderatorNote)}</p>`;
        const grid = card.querySelector('.mt-4.stepper-google-grid');
        if (grid && grid.parentNode) grid.parentNode.insertBefore(note, grid);
      }
    });
  }

  const __origAskSiteHelper = askSiteHelper;

  function buildAiHelperSystemPrompt(){
    return 'You are the premium Step By Stepper site helper. Reply like a natural AI assistant, not a canned bot. Stay focused on this site only. Give specific, practical guidance using the real tabs and buttons: Build, Sheet, Sign In, My Saved Dances, Featured Choreo, Subscription, Admin, Moderator, Save Changes, Send to host for featuring, Upload to site, and Apply for moderator. Mention cloud saving, moderator rules, badges, and premium perks when relevant. Keep answers helpful and concrete.';
  }

  function buildAiHelperPrompt(question, payload){
    const historyText = (payload.history || []).map(message => `${message.role}: ${message.text}`).join('\n') || '(none)';
    return `Current tab: ${payload.context.currentTab}
Signed in: ${payload.context.signedIn ? 'yes' : 'no'}
Admin: ${payload.context.isAdmin ? 'yes' : 'no'}
Moderator: ${payload.context.isModerator ? 'yes' : 'no'}
Premium: ${payload.context.isPremium ? 'yes' : 'no'}
Online count: ${payload.context.onlineCount}
Current dance title: ${payload.context.currentDanceTitle || 'none'}
Current dance has unsaved changes: ${payload.context.hasUnsavedChanges ? 'yes' : 'no'}
Conversation so far:
${historyText}

Newest user question: ${question}`;
  }

  askSiteHelper = async function(question){
    const prompt = String(question || '').trim();
    if (!prompt) return;
    state.chatBusy = true;
    renderSiteHelper();
    await refreshSession().catch(() => null);
    await refreshSubscription().catch(() => null);
    const currentTab = state.activePage || 'main';
    const appData = readAppData();
    const payload = {
      prompt,
      preferredModel: 'gemini',
      history: (state.chatMessages || []).slice(-8).map(message => ({ role: message.role, text: message.text })),
      context: {
        currentTab,
        signedIn: !!(state.session && state.session.credential),
        isAdmin: isAdminSession(),
        isModerator: isModeratorSession(),
        isPremium: isPremiumSession(),
        onlineCount: (state.presence && state.presence.onlineCount) || 0,
        currentDanceTitle: appData && appData.meta ? String(appData.meta.title || '').trim() : '',
        hasUnsavedChanges: hasUnsavedChanges()
      }
    };
    try {
      let text = '';
      let helperError = null;
      if (!payload.context.signedIn) {
        text = 'Sign in with Google first. The AI helper and moderator applications both need a signed-in Google account.';
      } else if (!(payload.context.isPremium || payload.context.isModerator || payload.context.isAdmin)) {
        text = 'Premium or moderator access is needed for the AI helper. Open Subscription to upgrade, or apply for moderator from the top of the Sign In tab.';
      } else {
        const loweredPrompt = prompt.toLowerCase();
        const wantsDanceJudge = /\b(judge|score|rate|flow|flowability|clunky|smooth)\b/.test(loweredPrompt) && /\b(dance|sheet|worksheet|routine|choreo|choreography)\b/.test(loweredPrompt);
        const wantsDanceAdd = /\b(add|generate|suggest|improve|fix|tidy)\b/.test(loweredPrompt) && /\b(step|steps|dance|sheet|worksheet|routine|choreo|choreography|glossary)\b/.test(loweredPrompt);
        const danceToolMode = wantsDanceAdd ? 'add' : (wantsDanceJudge ? 'judge' : '');
        if (danceToolMode) {
          const dance = buildCurrentDanceEntry();
          if (!dance) {
            text = 'Build or load a dance first, then ask me to judge it or add glossary-style ideas.';
          } else {
            try {
              const danceData = await authFetch('/api/ai/dance-tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  mode: danceToolMode,
                  prompt,
                  dance,
                  approvedGlossary: (state.glossaryApproved || []).slice(0, 120)
                })
              });
              const score = Number(danceData && danceData.flowScore || 0) || null;
              const suggestions = Array.isArray(danceData && danceData.suggestions) ? danceData.suggestions.map(normalizeAiSuggestion).filter(Boolean) : [];
              const suggestionText = suggestions.length
                ? '\n\nSuggestions:\n' + suggestions.slice(0, 3).map((item, index) => `${index + 1}. ${item.name || 'Suggestion'}${item.count ? ` (${item.count})` : ''}${item.foot ? ` [${item.foot}]` : ''} — ${item.description || item.reason || 'No extra description.'}`).join('\n')
                : '';
              text = `${String(danceData && danceData.text || '').trim() || (danceToolMode === 'add' ? 'I added some glossary-style improvement ideas for this worksheet.' : 'I judged the worksheet for flowability.')}${score ? `\n\nFlowability score: ${score}/10` : ''}${suggestionText}`.trim();
            } catch (error) {
              helperError = error;
            }
          }
        }
        if (!text && !helperError) {
          try {
            const data = await authFetch('/api/chatbot/help', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            text = sanitizeHelperReply((data && data.text) || '', prompt);
            if (!text) {
              const error = new Error('AI helper returned a blank or generic response.');
              error.status = 502;
              throw error;
            }
          } catch (error) {
            helperError = error;
          }
        }
        if (!text && helperError) {
          try {
            const backup = await authFetch('/api/openai/respond', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                system: buildAiHelperSystemPrompt(),
                prompt: buildAiHelperPrompt(prompt, payload),
                preferredModel: 'gemini'
              })
            });
            text = sanitizeHelperReply((backup && (backup.text || backup.output_text)) || '', prompt);
            if (!text) {
              const fallbackError = new Error('AI helper fallback returned a blank or generic response.');
              fallbackError.status = 502;
              throw fallbackError;
            }
          } catch (backupError) {
            helperError = backupError || helperError;
          }
        }
        if (!text && helperError) {
          const status = Number(helperError && helperError.status || 0);
          const detail = String(helperError && helperError.message || '').trim() || 'Unknown backend helper error.';
          if (status === 402) text = `AI helper error (402): ${detail}`;
          else if (status === 401) text = `AI helper error (401): ${detail}`;
          else if (status) text = `AI helper error (${status}): ${detail}`;
          else text = `AI helper error: ${detail}`;
        }
      }
      state.chatMessages.push({ role:'assistant', text: text || 'AI helper error: no usable AI response came back from the backend. Check Render logs for /api/chatbot/help and /api/openai/respond.' });
    } catch (error) {
      const message = String(error && error.message || '').trim();
      state.chatMessages.push({ role:'assistant', text: message ? `AI helper error: ${message}` : 'AI helper error: the backend could not produce a usable response.' });
    } finally {
      state.chatBusy = false;
      renderSiteHelper();
    }
  };

  async function refreshLiveQueues(){
    const jobs = [];
    jobs.push(refreshPresence().catch(() => null));
    if (state.session && state.session.credential) {
      jobs.push(refreshSubscription().catch(() => null));
      jobs.push(refreshNotifications().catch(() => null));
      jobs.push(refreshGlossaryApproved().catch(() => null));
      jobs.push(refreshSiteMemories().catch(() => null));
      if (isAdminSession()) {
        jobs.push(refreshAdminDances().catch(() => null));
        jobs.push(refreshSubmissions().catch(() => null));
        jobs.push(refreshModeratorApplications().catch(() => null));
        jobs.push(refreshActiveModerators().catch(() => null));
        jobs.push(refreshGlossaryRequests().catch(() => null));
      }
      if (isModeratorSession()) jobs.push(refreshModeratorQueue().catch(() => null));
    }
    await Promise.all(jobs);
  }

  const __origRenderPages = renderPages;
  renderPages = function(){
    __origRenderPages();
    ensureHost();
    renderModeratorPage();
    decorateSubscriptionPage();
    decorateAdminPage();
    renderCommunityGlossary();
    setVisibility(document.getElementById(MODERATOR_PAGE_ID), state.activePage === 'moderator');
    window.StepByStepperGlobals = {
      buildCurrentDanceEntry,
      normalizeStoredEntry,
      restoreDanceSnapshot,
      loadDanceIntoWorksheet,
      buildPreviewSectionsFromEntry,
      paymentStatusLabel,
      isModeratorSession,
      isAdminSession,
      applyStepToCurrentWorksheet,
      autoGenerateCountsForWorksheet
    };
  };

  let __stepperLiveQueueRefreshBusy = false;
  setInterval(() => {
    if (__stepperLiveQueueRefreshBusy || !(state.session && state.session.credential)) return;
    __stepperLiveQueueRefreshBusy = true;
    refreshLiveQueues().then(() => {
      if (state.activePage === 'admin' || state.activePage === 'moderator' || state.activePage === 'signin' || state.activePage === 'subscription') renderPages();
    }).catch(() => {}).finally(() => { __stepperLiveQueueRefreshBusy = false; });
  }, LIVE_QUEUE_SYNC_INTERVAL_MS);

})();
