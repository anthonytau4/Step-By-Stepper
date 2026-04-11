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
  const FRIENDS_PAGE_ID = 'stepper-friends-page';
  const FRIENDS_TAB_ID = 'stepper-friends-tab';
  const GLOSSARY_PAGE_ID = 'stepper-glossary-page';
  const GLOSSARY_TAB_ID = 'stepper-glossary-tab';
  const PDF_PAGE_ID = 'stepper-pdf-page';
  const PDF_TAB_ID = 'stepper-pdf-tab';
  const SETTINGS_PAGE_ID = 'stepper-settings-page';
  const SETTINGS_TAB_ID = 'stepper-settings-tab';
  const MUSIC_PAGE_ID = 'stepper-music-page';
  const MUSIC_TAB_ID = 'stepper-music-tab';
  const TEMPLATES_PAGE_ID = 'stepper-templates-page';
  const TEMPLATES_TAB_ID = 'stepper-templates-tab';
  const NOTIFICATIONS_PAGE_ID = 'stepper-notifications-page';
  const NOTIFICATIONS_TAB_ID = 'stepper-notifications-tab';
  const TIPS_PAGE_ID = 'stepper-tips-page';
  const TIPS_TAB_ID = 'stepper-tips-tab';
  const ADMIN_EMAIL = 'anthonytau4@gmail.com';
  const DEFAULT_RENDER_SERVICE_ID = 'srv-d6ss4295pdvs73e1iifg';
  const DEFAULT_BACKEND_BASE = 'https://step-by-stepper.onrender.com';
  const ALT_BACKEND_BASE = 'https://api.step-by-stepper.com';
  const FALLBACK_GOOGLE_CLIENT_ID = '1038282546217-a7qv2i1puevmtjf38f6sv761vt7he26s.apps.googleusercontent.com';
  const SYNC_INTERVAL_MS = 6000;
  const PRESENCE_INTERVAL_MS = 30000;
  const FEATURED_SYNC_INTERVAL_MS = 18000;
  const LIVE_QUEUE_SYNC_INTERVAL_MS = 4000;
  const EXTRA_PAGE_PATHS = {
    signin: '/signin',
    subscription: '/subscription',
    admin: '/admin',
    friends: '/friends',
    glossary: '/glossary',
    pdfimport: '/pdf-import',
    settings: '/settings',
    music: '/music',
    templates: '/templates',
    notifications: '/notifications',
    moderator: '/moderator'
  };
  const LOADING_SPLASH_LINES = [
    'Every tab is negotiating snack rights with the loading bar...',
    'Polishing invisible cowboy boots with quantum glitter...',
    'Translating dance counts into dolphin legalese...',
    'Rehearsing with three polite raccoons and a fog machine...',
    'Calibrating moonwalk gravity to exactly 87% noodle...',
    'Summoning BPM from a haunted toaster oven...',
    'Checking if penguins approve this layout update...',
    'Aligning disco lasers with certified banana geometry...',
    'Teaching pixels how to yeehaw responsibly...',
    'Any tab you open is powered by dramatic jazz hands and glitter math...'
  ];

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
    adminSummary: { users: 0, moderators: 0, barred: 0, pendingBars: 0, pendingInvites: 0, pendingApplications: 0, pendingSubmissions: 0 },
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
    chatPending: null,
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
      subscriptionBtn: null,
      friendsBtn: null,
      glossaryBtn: null,
      pdfBtn: null
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
    },
    renderTimer: null,
    _helperSignature: '',
    _helperLastMsgCount: -1,
    danceGroups: {},
    collaborators: {},
    collabInvites: []
  };

  function isTextEntryElement(node){
    if (!node || node.nodeType !== 1) return false;
    if (node.isContentEditable) return true;
    const tag = String(node.tagName || '').toUpperCase();
    if (tag === 'TEXTAREA') return true;
    if (tag !== 'INPUT') return false;
    const type = String(node.getAttribute('type') || 'text').toLowerCase();
    return !['button','submit','reset','checkbox','radio','range','file','color','hidden','image'].includes(type);
  }

  function getTextEntryValue(node){
    if (!node || node.nodeType !== 1) return '';
    if (node.isContentEditable) return String(node.textContent || '').trim();
    if ('value' in node) return String(node.value || '').trim();
    return '';
  }

  function adminDraftExists(){
    const host = document.getElementById(HOST_ID);
    if (!host) return false;
    const fields = host.querySelectorAll('input, textarea, [contenteditable="true"], [contenteditable="plaintext-only"]');
    for (const field of fields) {
      if (getTextEntryValue(field)) return true;
    }
    return false;
  }

  function shouldDeferAdminAutoRender(){
    const active = document.activeElement;
    if (isTextEntryElement(active) && getTextEntryValue(active)) return true;
    return adminDraftExists();
  }

  function scheduleRenderPages(delay){
    const wait = Number.isFinite(delay) ? Math.max(0, delay) : 2000;
    if (state.renderTimer) clearTimeout(state.renderTimer);
    state.renderTimer = setTimeout(() => {
      state.renderTimer = null;
      if (shouldDeferAdminAutoRender()) {
        scheduleRenderPages(wait);
        return;
      }
      renderPages(true);
    }, wait);
  }

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
      meta: { title:'', choreographer:'', country:'', level:'Beginner', counts:'32', walls:'4', music:'', type:'4-Wall', danceStyle:'8-count' },
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

  function compactWhitespace(value){
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function calculateCountSpan(step){
    var cl = compactWhitespace(step && (step.count || step.counts) || '');
    var nums = (cl.match(/\d+/g) || []).map(Number).filter(Number.isFinite);
    return nums.length >= 2 ? Math.max(1, nums[nums.length - 1] - nums[0] + 1) : (nums.length === 1 ? nums[0] : 1);
  }

  /* ── Split a section at a specific step index ── */
  function splitSectionAtStep(sectionIndex, stepIndex) {
    var data = ensureAppData();
    if (!Array.isArray(data.sections)) return;
    var section = data.sections[sectionIndex];
    if (!section || !Array.isArray(section.steps)) return;
    if (stepIndex < 1 || stepIndex >= section.steps.length) return;
    var beforeSteps = section.steps.slice(0, stepIndex);
    var afterSteps = section.steps.slice(stepIndex);
    section.steps = beforeSteps;
    var newSection = {
      id: createLocalId('section'),
      name: 'Section ' + (sectionIndex + 2),
      steps: afterSteps
    };
    data.sections.splice(sectionIndex + 1, 0, newSection);
    /* Renumber sections after the split */
    for (var i = 0; i < data.sections.length; i++) {
      var sec = data.sections[i];
      if (!sec.name || /^Section \d+$/i.test(sec.name)) {
        sec.name = 'Section ' + (i + 1);
      }
    }
    writeAppData(data);
    renderPages();
    openBuildWorksheet();
  }

  /* ── Move a step within or across sections ── */
  function moveStep(sectionIndex, stepIndex, direction) {
    var data = ensureAppData();
    if (!Array.isArray(data.sections)) return;
    var section = data.sections[sectionIndex];
    if (!section || !Array.isArray(section.steps)) return;
    if (stepIndex < 0 || stepIndex >= section.steps.length) return;
    var step = section.steps[stepIndex];

    if (direction === 'up') {
      if (stepIndex > 0) {
        /* Move up within the same section */
        section.steps.splice(stepIndex, 1);
        section.steps.splice(stepIndex - 1, 0, step);
      } else if (sectionIndex > 0) {
        /* Move to end of previous section */
        section.steps.splice(stepIndex, 1);
        var prevSection = data.sections[sectionIndex - 1];
        if (!Array.isArray(prevSection.steps)) prevSection.steps = [];
        prevSection.steps.push(step);
        /* Remove empty section */
        if (!section.steps.length) data.sections.splice(sectionIndex, 1);
      }
    } else if (direction === 'down') {
      if (stepIndex < section.steps.length - 1) {
        /* Move down within the same section */
        section.steps.splice(stepIndex, 1);
        section.steps.splice(stepIndex + 1, 0, step);
      } else if (sectionIndex < data.sections.length - 1) {
        /* Move to start of next section */
        section.steps.splice(stepIndex, 1);
        var nextSection = data.sections[sectionIndex + 1];
        if (!Array.isArray(nextSection.steps)) nextSection.steps = [];
        nextSection.steps.unshift(step);
        /* Remove empty section */
        if (!section.steps.length) data.sections.splice(sectionIndex, 1);
      }
    }
    writeAppData(data);
    renderPages();
    openBuildWorksheet();
  }

  /* ── Context menu for splitting sections and moving steps ── */
  function _initSectionContextMenu() {
    if (window.__stepperSectionContextMenuInstalled) return;
    window.__stepperSectionContextMenuInstalled = true;

    var menu = document.createElement('div');
    menu.id = 'stepper-section-context-menu';
    menu.style.cssText = 'display:none;position:fixed;z-index:99999;background:#1f2937;color:#f3f4f6;border:1px solid #374151;border-radius:12px;padding:6px 0;box-shadow:0 8px 24px rgba(0,0,0,.3);min-width:180px;font-size:13px;font-family:inherit;';
    menu.innerHTML = '<button data-ctx-split style="display:flex;align-items:center;gap:8px;width:100%;padding:10px 16px;background:none;border:none;color:inherit;cursor:pointer;font-size:13px;font-weight:600;text-align:left;transition:background .15s;">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'
      + 'Split Section Here</button>'
      + '<button data-ctx-move-up style="display:flex;align-items:center;gap:8px;width:100%;padding:10px 16px;background:none;border:none;color:inherit;cursor:pointer;font-size:13px;font-weight:600;text-align:left;transition:background .15s;">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><polyline points="18 15 12 9 6 15"/></svg>'
      + 'Move Step Up</button>'
      + '<button data-ctx-move-down style="display:flex;align-items:center;gap:8px;width:100%;padding:10px 16px;background:none;border:none;color:inherit;cursor:pointer;font-size:13px;font-weight:600;text-align:left;transition:background .15s;">'
      + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:15px;height:15px;"><polyline points="6 9 12 15 18 9"/></svg>'
      + 'Move Step Down</button>';
    document.body.appendChild(menu);

    menu.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('mouseenter', function () { btn.style.background = 'rgba(99,102,241,.2)'; });
      btn.addEventListener('mouseleave', function () { btn.style.background = 'none'; });
    });

    var ctxState = { sectionIndex: -1, stepIndex: -1 };

    document.addEventListener('click', function () { menu.style.display = 'none'; }, true);
    document.addEventListener('scroll', function () { menu.style.display = 'none'; }, true);

    /* ── Identify which section/step was right-clicked ── */
    function identifyStepFromClick(target) {
      var data = readAppData();
      if (!data || !Array.isArray(data.sections)) return null;

      /* Walk up from click target to find the main content area */
      var mainEl = document.querySelector('main');
      if (!mainEl) return null;

      /* Find all section containers — they are the rounded-3xl bordered sections under main */
      var sectionWrappers = [];
      var candidates = mainEl.querySelectorAll('.rounded-3xl');
      for (var c = 0; c < candidates.length; c++) {
        var cand = candidates[c];
        /* Section wrappers contain step inputs and have the section header pattern */
        if (cand.querySelector('input[placeholder*="Section"], input[value*="Section"], [class*="space-y"]')) {
          sectionWrappers.push(cand);
        }
      }
      if (!sectionWrappers.length) {
        /* Broader fallback: look for bordered shadow containers */
        candidates = mainEl.querySelectorAll('[class*="rounded"][class*="border"][class*="shadow"]');
        for (var c2 = 0; c2 < candidates.length; c2++) {
          if (candidates[c2].querySelector('input, select, textarea')) sectionWrappers.push(candidates[c2]);
        }
      }

      /* Determine which section contains the click target */
      var clickedSection = null;
      var sectionIdx = -1;
      for (var s = 0; s < sectionWrappers.length; s++) {
        if (sectionWrappers[s].contains(target)) {
          clickedSection = sectionWrappers[s];
          sectionIdx = s;
          break;
        }
      }
      if (!clickedSection || sectionIdx < 0 || sectionIdx >= data.sections.length) return null;

      /* Find the step row within the section. Steps are typically in space-y-1 containers
         each having input fields for count, step name, description etc. */
      var stepContainers = clickedSection.querySelectorAll('.space-y-1 > div, [class*="space-y"] > div');
      if (!stepContainers.length) {
        stepContainers = clickedSection.querySelectorAll('[class*="step"], [class*="row"]');
      }
      /* Filter to actual step rows (those containing inputs for step data) */
      var stepRows = [];
      for (var r = 0; r < stepContainers.length; r++) {
        var row = stepContainers[r];
        /* A step row typically has inputs for step name, count, etc. */
        if (row.querySelector('input, select, textarea') && row.offsetHeight > 20) {
          stepRows.push(row);
        }
      }

      /* Find which step row contains the click target */
      var stepIdx = -1;
      for (var si = 0; si < stepRows.length; si++) {
        if (stepRows[si].contains(target)) {
          stepIdx = si;
          break;
        }
      }

      if (stepIdx < 0) return null;
      return { sectionIndex: sectionIdx, stepIndex: stepIdx };
    }

    document.addEventListener('contextmenu', function (e) {
      /* Only activate in the editor/worksheet area */
      var mainEl = document.querySelector('main');
      if (!mainEl || !mainEl.contains(e.target)) return;

      var result = identifyStepFromClick(e.target);
      if (!result) return;

      e.preventDefault();
      ctxState.sectionIndex = result.sectionIndex;
      ctxState.stepIndex = result.stepIndex;

      /* Show/hide split option — only valid between steps (not the first step) */
      var splitBtn = menu.querySelector('[data-ctx-split]');
      if (splitBtn) splitBtn.style.display = ctxState.stepIndex > 0 ? 'flex' : 'none';

      menu.style.display = 'block';
      menu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
      menu.style.top = Math.min(e.clientY, window.innerHeight - 140) + 'px';
    });

    menu.querySelector('[data-ctx-split]').addEventListener('click', function () {
      menu.style.display = 'none';
      if (ctxState.sectionIndex >= 0 && ctxState.stepIndex > 0) {
        splitSectionAtStep(ctxState.sectionIndex, ctxState.stepIndex);
      }
    });
    menu.querySelector('[data-ctx-move-up]').addEventListener('click', function () {
      menu.style.display = 'none';
      if (ctxState.sectionIndex >= 0 && ctxState.stepIndex >= 0) {
        moveStep(ctxState.sectionIndex, ctxState.stepIndex, 'up');
      }
    });
    menu.querySelector('[data-ctx-move-down]').addEventListener('click', function () {
      menu.style.display = 'none';
      if (ctxState.sectionIndex >= 0 && ctxState.stepIndex >= 0) {
        moveStep(ctxState.sectionIndex, ctxState.stepIndex, 'down');
      }
    });
  }

  /* Expose on window for the React editor to use */
  window.__stepperSplitSectionAtStep = splitSectionAtStep;
  window.__stepperMoveStep = moveStep;

  var HELPER_SQUIRCLE_ICON = '<span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#1F2A44,#312E81);box-shadow:0 2px 6px rgba(0,0,0,.18);position:relative;flex-shrink:0;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" fill="none"><rect x="24" y="24" width="464" height="464" rx="112" fill="url(#_hfg)"/><defs><linearGradient id="_hfg" x1="64" y1="56" x2="448" y2="456" gradientUnits="userSpaceOnUse"><stop stop-color="#1F2A44"/><stop offset="1" stop-color="#312E81"/></linearGradient><linearGradient id="_hfa" x1="110" y1="392" x2="408" y2="160" gradientUnits="userSpaceOnUse"><stop stop-color="#F97316"/><stop offset="1" stop-color="#FDBA74"/></linearGradient></defs><path d="M116 344C116 326.327 130.327 312 148 312H230V392H148C130.327 392 116 377.673 116 360V344Z" fill="#F8FAFC" fill-opacity=".96"/><path d="M196 264C196 246.327 210.327 232 228 232H310V312H228C210.327 312 196 297.673 196 280V264Z" fill="#F8FAFC" fill-opacity=".96"/><path d="M276 184C276 166.327 290.327 152 308 152H390C407.673 152 422 166.327 422 184V232H308C290.327 232 276 217.673 276 200V184Z" fill="#F8FAFC" fill-opacity=".96"/><path d="M148 392L148 360C148 342.327 162.327 328 180 328H230V312H228C210.327 312 196 297.673 196 280V264C196 246.327 210.327 232 228 232H310V216C310 198.327 324.327 184 342 184H390" stroke="url(#_hfa)" stroke-width="36" stroke-linecap="round" stroke-linejoin="round"/><circle cx="390" cy="184" r="26" fill="#FDBA74"/><circle cx="390" cy="184" r="10" fill="#FFF7ED"/></svg><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" style="position:absolute;bottom:-1px;right:-1px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.3));"><circle cx="12" cy="12" r="12" fill="#a78bfa"/><path d="M7 13l2-5h6l2 5M8 16h8M10 13v3M14 13v3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';

  function titleCaseWords(value){
    return compactWhitespace(value).replace(/\b([a-z])/g, (match, char) => char.toUpperCase());
  }

  function isCompactViewport(){
    return window.innerWidth < 980;
  }

  function getHelperDockTopPx(){
    const strip = state.ui && state.ui.tabStrip ? state.ui.tabStrip : null;
    if (strip && strip.getBoundingClientRect) {
      const rect = strip.getBoundingClientRect();
      return Math.max(18, Math.round(rect.bottom + 12));
    }
    return 96;
  }

  /* ── Drag state for the site helper ── */
  var _helperDragPos = { x: null, y: null, dragged: false };

  function placeFloatingHost(host, side){
    if (!host) return;
    host.style.position = 'fixed';
    host.style.maxWidth = 'calc(100vw - 24px)';
    host.style.zIndex = side === 'right' ? '8700' : '8600';
    /* If user has dragged the helper, honour that position */
    if (_helperDragPos.dragged && _helperDragPos.x !== null && _helperDragPos.y !== null) {
      host.style.left = _helperDragPos.x + 'px';
      host.style.top  = _helperDragPos.y + 'px';
      host.style.right  = 'auto';
      host.style.bottom = 'auto';
      return;
    }
    host.style.top = `${getHelperDockTopPx()}px`;
    host.style.bottom = 'auto';
    host.style.left = side === 'left' ? '12px' : 'auto';
    host.style.right = side === 'right' ? '12px' : 'auto';
  }

  function stabilizeTabStrip(){
    const strip = state.ui && state.ui.tabStrip ? state.ui.tabStrip : null;
    if (!strip) return false;
    const savedLeft = Number(strip.dataset.stepperScrollLeft || strip.scrollLeft || 0) || 0;
    strip.dataset.stepperUnsmooshed = '1';
    strip.style.display = 'flex';
    strip.style.flexWrap = 'nowrap';
    strip.style.alignItems = 'stretch';
    strip.style.gap = window.innerWidth < 640 ? '8px' : '10px';
    strip.style.overflowX = 'auto';
    strip.style.overflowY = 'hidden';
    strip.style.webkitOverflowScrolling = 'touch';
    strip.style.whiteSpace = 'nowrap';
    strip.style.flex = '1 1 auto';
    strip.style.minWidth = '300px';
    strip.style.maxWidth = '100%';
    strip.style.width = 'auto';
    strip.style.paddingBottom = '2px';
    if (strip.parentElement) {
      strip.parentElement.style.flex = '1 1 0';
      strip.parentElement.style.minWidth = '0';
    }
    strip.style.scrollbarWidth = 'none';
    strip.querySelectorAll('button, a, [role="tab"]').forEach((button) => {
      button.style.flex = '0 0 auto';
      button.style.minWidth = window.innerWidth < 640 ? '92px' : '104px';
      button.style.maxWidth = 'none';
      button.style.whiteSpace = 'nowrap';
    });
    if (!strip.__stepperUnsmooshScrollBound) {
      strip.__stepperUnsmooshScrollBound = true;
      strip.addEventListener('scroll', () => {
        strip.dataset.stepperScrollLeft = String(strip.scrollLeft || 0);
      }, { passive: true });
    }
    window.requestAnimationFrame(() => {
      try { strip.scrollLeft = savedLeft; } catch {}
    });
    return true;
  }

  function extractHelperMeta(text){
    const source = String(text || '');
    const meta = {};
    const titleMatch = source.match(/\b(?:called|named|title(?:d)?|dance name is|name is)\s+"?([^"\n,.!?]+)"?/i);
    if (titleMatch && titleMatch[1]) meta.title = titleCaseWords(titleMatch[1]);
    const countsMatch = source.match(/\b(\d{1,3})\s*counts?\b/i);
    if (countsMatch) meta.counts = String(countsMatch[1]);
    const wallsMatch = source.match(/\b(\d{1,2})\s*walls?\b/i);
    if (wallsMatch) {
      meta.walls = String(wallsMatch[1]);
      meta.type = `${meta.walls}-Wall`;
    }
    const levelMatch = source.match(/\b(beginner|improver|intermediate|advanced)\b/i);
    if (levelMatch) meta.level = titleCaseWords(levelMatch[1]);
    return meta;
  }

  function cleanStepIdeaToken(token){
    let value = compactWhitespace(token);
    value = value.replace(/^[\-•*]+\s*/, '');
    value = value.replace(/^\d+[.)]\s*/, '');
    value = value.replace(/^(please\s+)?(?:can you\s+)?(?:help me\s+)?(?:add|put in|put|insert|make|create|build|write|give me)\s+/i, '');
    value = value.replace(/^(?:a|an|the)\s+/i, '');
    value = value.replace(/\b(?:for the dance|to the dance|into the dance|to the worksheet|into the worksheet|please|thanks|babes)\b/ig, '');
    return compactWhitespace(value.replace(/[.]+$/g, ''));
  }

  function localHelperNumberWord(value){
    const map = { 0:'zero', 1:'one', 2:'two', 3:'three', 4:'four', 5:'five', 6:'six', 7:'seven', 8:'eight', 9:'nine', 10:'ten', 11:'eleven', 12:'twelve' };
    const num = Number(String(value || '').trim());
    return Number.isFinite(num) && map[num] ? map[num] : String(value || '').trim();
  }

  function normalizeLocalMotionText(text){
    const words = { zero:'0', one:'1', two:'2', three:'3', four:'4', five:'5', six:'6', seven:'7', eight:'8', nine:'9', ten:'10', eleven:'11', twelve:'12' };
    let value = compactWhitespace(String(text || '').toLowerCase());
    Object.entries(words).forEach(([word, num]) => {
      value = value.replace(new RegExp(`\\b${word}\\b`, 'g'), num);
    });
    value = value
      .replace(/\bfoward\b/g, 'forward')
      .replace(/\bforwards\b/g, 'forward')
      .replace(/\bfwd\b/g, 'forward')
      .replace(/\bbackwards\b/g, 'back')
      .replace(/\bbackward\b/g, 'back')
      .replace(/\bto the side\b/g, 'side')
      .replace(/\bwith a touch\b/g, 'with touch');
    return compactWhitespace(value);
  }

  function flipLocalFoot(value){
    const foot = compactWhitespace(value).toUpperCase();
    if (foot === 'R') return 'L';
    if (foot === 'L') return 'R';
    return '';
  }

  function getLocalExpectedStartFoot(){
    const data = readAppData();
    const sections = Array.isArray(data && data.sections) ? data.sections : [];
    let lastWeightFoot = '';
    sections.forEach((section) => {
      const steps = Array.isArray(section && section.steps) ? section.steps : [];
      steps.forEach((step) => {
        if (!step || typeof step !== 'object') return;
        if (step.weight === false) return;
        const foot = compactWhitespace(step.foot || '').toUpperCase();
        if (foot === 'R' || foot === 'L') lastWeightFoot = foot;
      });
    });
    return flipLocalFoot(lastWeightFoot);
  }

  function parseLocalRepeatedWalk(body){
    const source = normalizeLocalMotionText(body);
    const patterns = [
      /^walk\s*(?:x\s*)?(\d+)\s*(?:times?)?\s*(forward|back|left|right|side)?(?:\s+with\s+touch)?$/i,
      /^walk\s+(\d+)\s*(?:times?)?\s*(forward|back|left|right|side)?(?:\s+with\s+touch)?$/i,
      /^walk\s+(forward|back|left|right|side)\s+(\d+)\s*(?:times?)?(?:\s+with\s+touch)?$/i,
      /^(\d+)\s+walks?\s+(forward|back|left|right|side)(?:\s+with\s+touch)?$/i,
      /^walk\s*x\s*(\d+)\s+with\s+touch$/i,
    ];
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (!match) continue;
      if (/^walk\s*x\s*(\d+)\s+with\s+touch$/i.test(source)) {
        return { repeats:Number(match[1]), direction:'forward', touch:true };
      }
      if (/^walk\s+(forward|back|left|right|side)\s+(\d+)/i.test(source)) {
        return { repeats:Number(match[2]), direction:compactWhitespace(match[1] || 'forward') || 'forward', touch:/\bwith\s+touch\b/i.test(source) };
      }
      if (/^(\d+)\s+walks?\s+(forward|back|left|right|side)/i.test(source)) {
        return { repeats:Number(match[1]), direction:compactWhitespace(match[2] || 'forward') || 'forward', touch:/\bwith\s+touch\b/i.test(source) };
      }
      return { repeats:Number(match[1]), direction:compactWhitespace(match[2] || 'forward') || 'forward', touch:/\bwith\s+touch\b/i.test(source) };
    }
    return null;
  }

  function extractExplicitLocalStepName(text){
    const source = String(text || '');
    const match = source.match(/\b(?:step called|step named|name the step|call the step|step name\s*[:=-])\s+"?([^"\n,.!?]+)"?/i);
    return match && match[1] ? titleCaseWords(match[1]) : '';
  }

  function extractLocalStepCountLabel(text){
    const source = compactWhitespace(text);
    const match = source.match(/\b(?:counts?\s*[:=-]\s*|(?:use|put|set|on)\s+counts?\s+)?((?:\d+\s*[&,-]\s*)+\d+|\d+\s*&\s*\d+)\b/i);
    return match && match[1] ? compactWhitespace(String(match[1]).replace(/\bto\b/ig, '-')) : '';
  }

  function extractLocalFootHint(text){
    const source = normalizeLocalMotionText(text);
    if (!source) return null;
    if (/\b(?:either|any)\b/.test(source)) return '';
    if (/\b(?:right|r)\b/.test(source)) return 'R';
    if (/\b(?:left|l)\b/.test(source)) return 'L';
    return null;
  }

  function stripLocalFootHintText(text){
    return compactWhitespace(String(text || '')
      .replace(/\((?:right|left|r|l|either|any)\)/ig, '')
      .replace(/\b(?:start|starting|on|foot)\s*[:=-]?\s*(?:right|left|r|l|either|any)\b/ig, '')
      .replace(/\b(?:right|left)\s+foot\b/ig, '')
      .replace(/\s+[-–]\s*(?:right|left|r|l|either|any)\s*$/ig, '')
      .replace(/\s+(?:right|left|r|l|either|any)\s*$/ig, ''));
  }

  function inferLocalStepCount(body){
    const lowered = normalizeLocalMotionText(body);
    const repeatedWalk = parseLocalRepeatedWalk(lowered);
    if (repeatedWalk) return `1-${Number(repeatedWalk.repeats) + (repeatedWalk.touch ? 1 : 0)}`;
    if (/\bcross\s+side\b/.test(lowered)) return '1-2';
    if (/\b(?:grapevine|vine)\b/.test(lowered)) return '1-4';
    if (/rock\s+back(?:,|\s+)recover/.test(lowered)) return '1-2';
    if (/\b(?:coaster|sailor|shuffle|triple step|triple|chasse|kick ball change|mambo)\b/.test(lowered)) return '1&2';
    if (/\b(?:jazz box|rumba box|monterey|charleston)\b/.test(lowered)) return '1-4';
    if (/\b(?:step touch|side touch|touch side|heel touch|toe touch|tap touch|step tap|pivot)\b/.test(lowered)) return '1-2';
    return '';
  }

  function inferLocalStepName(body, explicitName){
    if (explicitName) return { name:titleCaseWords(explicitName), confident:true };
    const source = normalizeLocalMotionText(body);
    if (!source) return { name:'', confident:false };
    const repeatedWalk = parseLocalRepeatedWalk(source);
    if (repeatedWalk) {
      const direction = repeatedWalk.direction ? titleCaseWords(repeatedWalk.direction) : 'Forward';
      return { name:`Walk ${direction} x${repeatedWalk.repeats}${repeatedWalk.touch ? ' with a Touch' : ''}`, confident:true };
    }
    const patterns = [
      [/^(?:grapevine|vine)\s+(right|left)$/i, (m) => ({ name:`Grapevine ${titleCaseWords(m[1])}`, confident:true })],
      [/^rock\s+back(?:,|\s+)recover$/i, () => ({ name:'Rock Back Recover', confident:true })],
      [/^coaster(?:\s+step)?$/i, () => ({ name:'Coaster Step', confident:true })],
      [/^sailor(?:\s+step)?$/i, () => ({ name:'Sailor Step', confident:true })],
      [/^jazz\s+box$/i, () => ({ name:'Jazz Box', confident:true })],
      [/^rumba\s+box$/i, () => ({ name:'Rumba Box', confident:true })],
      [/^kick\s+ball\s+change$/i, () => ({ name:'Kick Ball Change', confident:true })],
      [/^step\s+touch$/i, () => ({ name:'Step Touch', confident:true })],
      [/^side\s+touch$/i, () => ({ name:'Side Touch', confident:true })],
      [/^cross\s+side$/i, () => ({ name:'Cross Side', confident:true })],
      [/^step\s+lock\s+step$/i, () => ({ name:'Step Lock Step', confident:true })],
      [/^shuffle\s+(forward|back|left|right)$/i, (m) => ({ name:`Shuffle ${titleCaseWords(m[1])}`, confident:true })],
      [/^pivot(?:\s+\d+)?(?:\s*(?:1\/4|1\/2|1\/8|quarter|half))?\s*(left|right)?$/i, () => ({ name:'Pivot Turn', confident:true })],
    ];
    for (const [pattern, builder] of patterns) {
      const match = source.match(pattern);
      if (match) return builder(match);
    }
    if (source.split(/\s+/).length <= 6 && /\b(step|rock|recover|vine|grapevine|shuffle|triple|stomp|clap|kick|toe|heel|cross|side|back|forward|turn|pivot|coaster|sailor|weave|mambo|swivel|skate|scuff|brush|hitch|hop|touch|monterey|jazz|rumba|charleston|syncopated|walk|lock)\b/i.test(source)) {
      return { name:titleCaseWords(source).replace(/\bX(\d+)\b/g, 'x$1'), confident:true };
    }
    return { name:'', confident:false };
  }

  function buildLocalWalkSequence(repeats, direction, startFoot){
    const dir = compactWhitespace(direction || 'forward') || 'forward';
    const list = [];
    for (let index = 0; index < Number(repeats || 0); index += 1) {
      let footLabel = '';
      if (startFoot === 'R' || startFoot === 'L') {
        const foot = index % 2 === 0 ? startFoot : flipLocalFoot(startFoot);
        footLabel = foot === 'R' ? 'right' : 'left';
      } else {
        footLabel = index % 2 === 0 ? 'right/left' : 'left/right';
      }
      if (dir === 'back') list.push(`step ${footLabel} back`);
      else if (dir === 'left') list.push(`step ${footLabel} left`);
      else if (dir === 'right') list.push(`step ${footLabel} right`);
      else if (dir === 'side') list.push(`step ${footLabel} to the side`);
      else list.push(`step ${footLabel} forward`);
    }
    return list.join(', ');
  }

  function localWeightChangeCount(body, count){
    const source = normalizeLocalMotionText(body);
    const repeatedWalk = parseLocalRepeatedWalk(source);
    if (repeatedWalk) return Number(repeatedWalk.repeats || 0) || 1;
    if (/rock\s+back(?:,|\s+)recover/.test(source)) return 2;
    if (/\b(?:coaster|sailor|shuffle|triple step|triple|chasse|kick ball change|mambo)\b/.test(source)) return 3;
    if (/\b(?:grapevine|vine|jazz box|rumba box|monterey|charleston)\b/.test(source)) return 4;
    if (/\b(?:step touch|side touch|touch side|heel touch|toe touch|tap touch)\b/.test(source)) return 1;
    if (/\bpivot\b/.test(source)) return 2;
    const numbers = String(count || '').match(/\d+/g);
    if (numbers && numbers.length) {
      const values = numbers.map((item) => Number(item)).filter((item) => Number.isFinite(item));
      if (values.length >= 2) return Math.max(1, values[values.length - 1] - values[0] + 1);
    }
    return 1;
  }

  function estimateLocalNextFoot(currentStart, body, count){
    if (!(currentStart === 'R' || currentStart === 'L')) return '';
    return localWeightChangeCount(body, count) % 2 === 1 ? flipLocalFoot(currentStart) : currentStart;
  }

  function localGlossarySimilarity(body, item){
    const target = compactWhitespace(String(body || '').toLowerCase()).replace(/[^a-z0-9]+/g, ' ').trim();
    const name = compactWhitespace(String(item && item.name || '').toLowerCase()).replace(/[^a-z0-9]+/g, ' ').trim();
    if (!target || !name) return 0;
    if (target === name) return 1;
    if (target.includes(name) || name.includes(target)) return 0.92;
    const targetWords = new Set(target.split(/\s+/).filter(Boolean));
    const nameWords = new Set(name.split(/\s+/).filter(Boolean));
    const overlap = [...targetWords].filter((word) => nameWords.has(word)).length;
    if (!overlap) return 0;
    return overlap / Math.max(targetWords.size, nameWords.size);
  }

  function findBestLocalGlossaryMatch(body, glossary, currentStart){
    let best = null;
    let bestScore = 0;
    (Array.isArray(glossary) ? glossary : []).forEach((item) => {
      if (!item || typeof item !== 'object') return;
      let score = localGlossarySimilarity(body, item);
      if (score <= 0.72) return;
      const foot = compactWhitespace(item.foot || '').toUpperCase();
      if (currentStart === 'R' || currentStart === 'L') {
        if (foot === currentStart) score += 0.08;
        else if (foot && foot !== currentStart) score -= 0.05;
      }
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    });
    return best;
  }

  function buildLocalRandomGlossaryFlow(prompt){
    const glossary = Array.isArray(state.glossaryApproved) ? state.glossaryApproved : [];
    if (!glossary.length) return [];
    const source = normalizeLocalMotionText(prompt);
    const countsMatch = source.match(/\b(\d{1,3})\s*counts?\b/i);
    let remaining = countsMatch ? Math.max(2, Number(countsMatch[1])) : 8;
    const stepsMatch = source.match(/\b(\d{1,2})\s*(?:steps?|moves?)\b/i);
    const targetSteps = stepsMatch ? Math.max(1, Math.min(8, Number(stepsMatch[1]))) : 0;
    let currentStart = getLocalExpectedStartFoot();
    const results = [];
    let previousName = '';
    let guard = 0;
    while (remaining > 0 && guard < 12 && (!targetSteps || results.length < targetSteps)) {
      guard += 1;
      let best = null;
      let bestScore = -Infinity;
      glossary.forEach((item) => {
        if (!item || typeof item !== 'object' || !compactWhitespace(item.name)) return;
        const countLabel = compactWhitespace(item.counts || item.count || '1') || '1';
        const numbers = countLabel.match(/\d+/g);
        let span = 1;
        if (numbers && numbers.length) {
          const values = numbers.map((n) => Number(n)).filter((n) => Number.isFinite(n));
          if (values.length >= 2) span = Math.max(1, values[values.length - 1] - values[0] + 1);
        }
        let score = span <= remaining ? 3 : -(span - remaining) * 2.2;
        const foot = compactWhitespace(item.foot || '').toUpperCase();
        if (currentStart === 'R' || currentStart === 'L') {
          if (foot === currentStart) score += 3;
          else if (foot === 'R' || foot === 'L') score -= 1.4;
          else score += 1.5;
        } else {
          score += foot === 'R' || foot === 'L' ? 0.5 : 1;
        }
        if (compactWhitespace(item.name).toLowerCase() === compactWhitespace(previousName).toLowerCase()) score -= 3.5;
        const noiseSeed = `${prompt}|${item.name}|${results.length}`;
        let noise = 0;
        for (let i = 0; i < noiseSeed.length; i += 1) noise = (noise + noiseSeed.charCodeAt(i) * (i + 1)) % 1000;
        score += noise / 1000;
        if (score > bestScore) {
          bestScore = score;
          best = item;
        }
      });
      if (!best) break;
      const step = {
        name: compactWhitespace(best.name || 'Custom Step') || 'Custom Step',
        description: compactWhitespace(best.description || best.desc || '') || inferLocalStepDescription(best.name || 'step', best.counts || best.count || '1', currentStart),
        count: compactWhitespace(best.counts || best.count || '1') || '1',
        foot: /^(R|L)$/i.test(compactWhitespace(best.foot || '')) ? compactWhitespace(best.foot || '').toUpperCase() : currentStart,
        fromGlossary: true,
        needsName: false,
        needsCount: false,
        source: compactWhitespace(best.name || '')
      };
      results.push(step);
      previousName = step.name;
      const numbers = step.count.match(/\d+/g);
      let span = 1;
      if (numbers && numbers.length) {
        const values = numbers.map((n) => Number(n)).filter((n) => Number.isFinite(n));
        if (values.length >= 2) span = Math.max(1, values[values.length - 1] - values[0] + 1);
      }
      remaining = Math.max(0, remaining - span);
      const nextStart = step.foot || currentStart;
      currentStart = nextStart ? estimateLocalNextFoot(nextStart, step.source || step.name, step.count) : currentStart;
      if (!targetSteps && remaining <= 0) break;
    }
    return results;
  }

  function inferLocalStepDescription(body, count, startFoot){
    const source = normalizeLocalMotionText(body);
    const repeatedWalk = parseLocalRepeatedWalk(source);
    if (repeatedWalk) {
      const sequence = buildLocalWalkSequence(repeatedWalk.repeats, repeatedWalk.direction, startFoot);
      const sentence = sequence ? `${sequence.charAt(0).toUpperCase()}${sequence.slice(1)}` : 'Walk forward.';
      return repeatedWalk.touch ? `${sentence}, then touch beside with no weight change.` : `${sentence}.`;
    }
    if (/rock\s+back(?:,|\s+)recover/.test(source)) return 'Rock back onto the stepping foot and recover back onto the other foot.';
    if (/\bcross\s+side\b/.test(source)) return 'Cross over, then step to the side.';
    if (/\b(?:grapevine|vine)\b/.test(source)) {
      const direction = /right/.test(source) ? 'right' : (/left/.test(source) ? 'left' : 'to the side');
      return `Step ${direction}, cross behind, step ${direction}, then touch or step to finish.`;
    }
    if (/coaster/.test(source)) return 'Step back, step together, then step forward.';
    if (/sailor/.test(source)) return 'Cross behind, step to the side, then recover onto the other foot.';
    if (/jazz box/.test(source)) return 'Cross over, step back, step to the side, then step forward.';
    if (/rumba box/.test(source)) return 'Step to the side, close, step forward, then hold or touch to finish.';
    if (/kick ball change/.test(source)) return 'Kick, step onto the ball of the foot, then change weight back.';
    if (/pivot/.test(source)) return 'Step forward and pivot the stated amount before recovering your weight.';
    if (/\b(?:step touch|side touch)\b/.test(source)) return 'Step, then touch beside with no weight change.';
    let sentence = source
      .replace(/\bx\s*(\d+)\b/ig, (_, value) => ` ${localHelperNumberWord(value)} times`)
      .replace(/\btouch\b/ig, 'touch with no weight')
      .replace(/\bbrush\b/ig, 'brush the foot forward')
      .replace(/\bscuff\b/ig, 'scuff the heel forward')
      .replace(/\s+/g, ' ')
      .trim();
    if (!sentence) sentence = 'Custom step';
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    if (!/[.!?]$/.test(sentence)) sentence += '.';
    return sentence;
  }

  function applyLocalFollowUpToPendingSteps(steps, prompt){
    const list = Array.isArray(steps) ? steps.map((item) => ({ ...item })) : [];
    if (list.length !== 1) return list;
    const step = list[0];
    const explicitName = extractExplicitLocalStepName(prompt);
    const explicitCount = extractLocalStepCountLabel(prompt);
    const source = compactWhitespace(step.source || step.name || prompt);
    const startFoot = compactWhitespace(step.foot || '').toUpperCase() || getLocalExpectedStartFoot();
    if (explicitName) {
      step.name = explicitName;
      step.needsName = false;
    } else if (step.needsName && source && !/\b(count|wall|dance|title|level|step pattern|steps?)\b/i.test(prompt)) {
      const candidate = compactWhitespace(String(prompt || '').replace(/^(?:call it|name it|step name\s*[:=-])\s*/i, ''));
      if (candidate && candidate.split(/\s+/).length <= 6) {
        step.name = titleCaseWords(candidate);
        step.needsName = false;
      }
    }
    if (explicitCount) {
      step.count = explicitCount;
      step.needsCount = false;
    } else if (step.needsCount) {
      const inferredCount = inferLocalStepCount(source);
      if (inferredCount) {
        step.count = inferredCount;
        step.needsCount = false;
      }
    }
    if (!compactWhitespace(step.name)) {
      const inferred = inferLocalStepName(source);
      if (inferred.name) {
        step.name = inferred.name;
        step.needsName = !inferred.confident && step.needsName;
      }
    }
    step.description = inferLocalStepDescription(source, step.count || '', startFoot);
    return list;
  }

  function splitStepIdeasFromText(text){
    const source = String(text || '');
    if (!source.trim()) return [];
    let candidate = source;
    const explicitStepName = extractExplicitLocalStepName(source);
    const randomPrompt = /\b(?:random(?:ly)?|any|whatever)\b.*\b(?:steps?|moves?|sequence|section|part)\b|\b(?:random(?:ly)?\s+put|pick|choose|give me)\b.*\b(?:steps?|moves?)\b/i;
    if (randomPrompt.test(candidate)) return buildLocalRandomGlossaryFlow(candidate);
    const stepsLabelMatch = candidate.match(/\b(?:steps?|sequence|section)\s*[:\-]\s*([\s\S]+)$/i);
    if (stepsLabelMatch && stepsLabelMatch[1]) candidate = stepsLabelMatch[1];
    candidate = candidate
      .replace(/\band then\b/ig, ',')
      .replace(/\bthen\b/ig, ',')
      .replace(/\bafter that\b/ig, ',')
      .replace(/\bnext\b/ig, ',')
      .replace(/[|]/g, ',');
    const rawTokens = candidate.split(/[\n;,]+/).map(cleanStepIdeaToken).filter(Boolean);
    const glossary = Array.isArray(state.glossaryApproved) ? state.glossaryApproved : [];
    const glossaryMap = new Map(glossary.map((item) => [compactWhitespace(item && item.name).toLowerCase(), item]));
    const actionWord = /\b(step|rock|recover|vine|grapevine|shuffle|triple|stomp|clap|kick|toe|heel|cross|side|back|forward|turn|pivot|coaster|sailor|weave|mambo|swivel|skate|scuff|brush|hitch|hop|touch|monterey|jazz box|rumba box|charleston|syncopated|walk|lock)\b/i;
    const singleToken = rawTokens.length === 1;
    let currentStart = getLocalExpectedStartFoot();
    return rawTokens.map((token) => {
      const explicitCount = extractLocalStepCountLabel(token);
      const footHint = extractLocalFootHint(token);
      const body = compactWhitespace(stripLocalFootHintText(token).replace(/\(([^)]*\d[^)]*)\)\s*$/i, '').replace(/\b((?:\d+\s*[&,-]\s*)+\d+)\b\s*$/i, '').replace(/\b(?:use|put|set|on)\s+counts?\b\s*$/i, '').trim() || token);
      if (!body) return null;
      let glossaryItem = glossaryMap.get(compactWhitespace(body).toLowerCase());
      if (!glossaryItem) glossaryItem = findBestLocalGlossaryMatch(body, glossary, currentStart);
      if (glossaryItem) {
        const foot = footHint === 'R' || footHint === 'L'
          ? footHint
          : (/^(R|L)$/i.test(compactWhitespace(glossaryItem.foot || '')) ? compactWhitespace(glossaryItem.foot || '').toUpperCase() : currentStart);
        const step = {
          name: compactWhitespace(glossaryItem.name || body),
          description: compactWhitespace(glossaryItem.description || glossaryItem.desc || '') || inferLocalStepDescription(body, compactWhitespace(explicitCount || glossaryItem.counts || glossaryItem.count || inferLocalStepCount(body) || '1'), foot),
          count: compactWhitespace(explicitCount || glossaryItem.counts || glossaryItem.count || inferLocalStepCount(body) || '1') || '1',
          foot,
          fromGlossary: true,
          needsName: false,
          needsCount: false,
          source: body,
        };
        currentStart = foot ? estimateLocalNextFoot(foot, step.source, step.count) : currentStart;
        return step;
      }
      if (!actionWord.test(body) && singleToken) return null;
      const inferredName = inferLocalStepName(body, singleToken ? explicitStepName : '');
      const count = compactWhitespace(explicitCount || inferLocalStepCount(body));
      const needsName = singleToken && !inferredName.confident && !compactWhitespace(inferredName.name);
      const needsCount = singleToken && !count;
      const foot = footHint === 'R' || footHint === 'L' ? footHint : (currentStart === 'R' || currentStart === 'L' ? currentStart : '');
      const step = {
        name: compactWhitespace(inferredName.name || (needsName ? '' : titleCaseWords(body.split(/\s+/).slice(0, 5).join(' '))) || 'Custom Step'),
        description: inferLocalStepDescription(body, count, foot),
        count: count || '',
        foot,
        fromGlossary: false,
        needsName,
        needsCount,
        source: body,
      };
      if (foot) currentStart = estimateLocalNextFoot(foot, body, count);
      return step;
    }).filter(Boolean);
  }

  function looksLikeDanceBuildPrompt(text){
    const value = String(text || '').toLowerCase();
    if (/^\s*(how|where|what|which|why|can i|do i|is there|when)\b/.test(value)) return false;
    if (!/(add|insert|put|make|create|build|write|start|give me)/.test(value)) return false;
    if (/(dance|worksheet|section|part|steps?|sequence|count)/.test(value)) return true;
    return splitStepIdeasFromText(value).length > 0;
  }

  function currentWorksheetHasSteps(){
    const data = readAppData();
    return !!(data && Array.isArray(data.sections) && data.sections.some((section) => Array.isArray(section && section.steps) && section.steps.length));
  }

  function shouldStartFreshWorksheet(text){
    const value = String(text || '').toLowerCase();
    return /\b(new dance|new worksheet|fresh dance|fresh worksheet|start a dance|create a dance|build a dance)\b/.test(value);
  }

  function applyHelperPlanToWorksheet(plan){
    if (!plan || !Array.isArray(plan.steps) || !plan.steps.length) return { applied: false, message: '' };
    const sectionSize = _getDanceStyleCountLimit();
    let data = ensureAppData();
    const forceFresh = !!(plan && plan.resetDance);
    if ((forceFresh || shouldStartFreshWorksheet(plan.prompt)) && !currentWorksheetHasSteps()) {
      data = createBlankAppData();
    }
    if (!data.meta || typeof data.meta !== 'object') data.meta = createBlankAppData().meta;
    if (!Array.isArray(data.sections)) data.sections = [];
    if (!data.sections.length) data.sections.push({ id:createLocalId('section'), name:'Section 1', steps:[] });
    if (plan.meta && typeof plan.meta === 'object') {
      if (plan.meta.title) data.meta.title = plan.meta.title;
      if (plan.meta.counts) data.meta.counts = plan.meta.counts;
      if (plan.meta.walls) data.meta.walls = plan.meta.walls;
      if (plan.meta.type) data.meta.type = plan.meta.type;
      if (plan.meta.level) data.meta.level = plan.meta.level;
    }
    let target = data.sections[data.sections.length - 1];
    const wantsNewSection = !!(plan && plan.createSection) || /\b(new section|add a section|another section|new part|add a part)\b/i.test(String(plan.prompt || ''));
    if (!target || wantsNewSection) {
      target = { id:createLocalId('section'), name:`Section ${data.sections.length + 1}`, steps:[] };
      data.sections.push(target);
    }
    if (!Array.isArray(target.steps)) target.steps = [];
    /* ── Count existing steps to know when to create new section ── */
    let countAccum = 0;
    target.steps.forEach(function(step){
      if (!step || step.type !== 'step') return;
      countAccum += calculateCountSpan(step);
    });
    plan.steps.forEach(function(step){
      var span = calculateCountSpan(step);
      if (plan.steps.length > sectionSize && countAccum > 0 && countAccum + span > sectionSize) {
        target = { id:createLocalId('section'), name:'Section ' + (data.sections.length + 1), steps:[] };
        data.sections.push(target);
        countAccum = 0;
      }
      target.steps.push(buildGlossaryApplyStep(step));
      countAccum += span;
    });
    writeAppData(data);
    updateSavedSignature('');
    renderPages();
    openBuildWorksheet();
    const customCount = plan.steps.filter((step) => !step.fromGlossary).length;
    const summary = plan.steps.slice(0, 6).map((step) => step.name).join(', ');
    const bits = [`Done. I added ${plan.steps.length} step${plan.steps.length === 1 ? '' : 's'}.`];
    if (plan.meta && plan.meta.title) bits.push(`Dance name set to ${plan.meta.title}.`);
    if (plan.meta && plan.meta.counts) bits.push(`Counts set to ${plan.meta.counts}.`);
    if (plan.meta && plan.meta.walls) bits.push(`Walls set to ${plan.meta.walls}.`);
    if (summary) bits.push(`Added: ${summary}${plan.steps.length > 6 ? ', …' : '.'}`);
    if (customCount) bits.push(`${customCount} of those step${customCount === 1 ? ' was' : 's were'} added as custom worksheet step${customCount === 1 ? '' : 's'} rather than glossary matches.`);
    return { applied: true, message: bits.join(' ') };
  }

  function buildHelperFollowUp(plan){
    const needs = Array.isArray(plan && plan.needs) ? plan.needs : [];
    if (!needs.length) return 'Tell me the dance name, counts, walls, and the step pattern you want added.';
    const labels = {
      title: 'dance name',
      counts: 'counts',
      walls: 'walls',
      steps: 'step pattern',
      step_name: 'step name',
      step_count: 'step counts'
    };
    const readable = needs.map((key) => labels[key] || key);
    const joined = readable.length === 1
      ? readable[0]
      : `${readable.slice(0, -1).join(', ')} and ${readable[readable.length - 1]}`;
    return `I can build that, but I still need the ${joined}. Send it like: Name: Midnight Run. Counts: 32. Walls: 4. Steps: vine right, vine left, rock back recover, coaster step.`;
  }

  function isVagueStepRequest(steps){
    if (!Array.isArray(steps) || !steps.length) return false;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step) continue;
      if (!step.fromGlossary && !step.needsName && !step.needsCount) {
        const name = compactWhitespace(step.name || '').toLowerCase();
        const desc = compactWhitespace(step.description || '').toLowerCase();
        if (/^(custom step|step|move|something|anything|idk)$/i.test(name)) return true;
        if (name.split(/\s+/).length <= 1 && !step.fromGlossary && !/\b(vine|rock|coaster|sailor|shuffle|pivot|kick|jazz|rumba|mambo|charleston|weave|stomp|clap|touch|heel|toe|walk|turn|cross|monterey|lock|swivel|scuff|brush|hitch|hop)\b/i.test(name)) return true;
        if (!desc || desc === 'custom step.' || desc === name + '.') return true;
      }
    }
    return false;
  }

  function buildStepPreviewMessage(steps, meta){
    const lines = [];
    if (meta && meta.title) lines.push('**Dance:** ' + meta.title);
    if (meta && meta.counts) lines.push('**Counts:** ' + meta.counts);
    if (meta && meta.walls) lines.push('**Walls:** ' + meta.walls);
    if (lines.length) lines.push('');
    let currentFoot = getLocalExpectedStartFoot();
    const sectionSize = 8;
    let countAccum = 0;
    let sectionNum = 1;
    const data = readAppData();
    const existingSections = (data && Array.isArray(data.sections)) ? data.sections.length : 0;
    steps.forEach(function(step, idx){
      const foot = compactWhitespace(step.foot || '').toUpperCase();
      const startLabel = (foot === 'R' || foot === 'L') ? (foot === 'R' ? 'Right' : 'Left') : '';
      const countLabel = compactWhitespace(step.count || step.counts || '');
      const span = calculateCountSpan(step);
      if (steps.length > sectionSize && countAccum > 0 && countAccum + span > sectionSize) {
        sectionNum += 1;
        countAccum = 0;
        lines.push('');
        lines.push('**--- Section ' + (existingSections + sectionNum) + ' ---**');
      }
      if (idx === 0 && steps.length > sectionSize) {
        lines.push('**--- Section ' + (existingSections + 1) + ' ---**');
      }
      countAccum += span;
      const badge = step.fromGlossary ? ' ✅' : ' ✏️';
      const footNote = startLabel ? ' (starts ' + startLabel + ')' : '';
      lines.push((idx + 1) + '. **' + compactWhitespace(step.name || 'Custom Step') + '**' + badge + footNote + (countLabel ? ' — counts ' + countLabel : ''));
      if (step.description && step.description !== (step.name + '.')) {
        lines.push('   _' + step.description + '_');
      }
    });
    lines.push('');
    lines.push('Confirm sheet addition?');
    return lines.join('\n');
  }

  function resolveHelperWorksheetIntent(input){
    const prompt = compactWhitespace(input);
    if (!prompt) return null;
    const pending = state.chatPending && state.chatPending.type === 'worksheet-build' ? state.chatPending : null;
    const mergedPrompt = pending ? compactWhitespace(`${pending.prompt} ${prompt}`) : prompt;
    const meta = Object.assign({}, pending && pending.meta ? pending.meta : {}, extractHelperMeta(mergedPrompt));
    let steps = [];
    if (pending && Array.isArray(pending.steps) && pending.steps.length) {
      steps = applyLocalFollowUpToPendingSteps(pending.steps, prompt);
      const current = splitStepIdeasFromText(prompt);
      if (current.length) steps = steps.concat(current);
    } else {
      steps = splitStepIdeasFromText(mergedPrompt);
    }
    const creatingDance = shouldStartFreshWorksheet(mergedPrompt) || /\b(make|create|build)\b.*\bdance\b/i.test(mergedPrompt);
    const needs = [];
    if (creatingDance && !meta.title) needs.push('title');
    if (creatingDance && !meta.counts) needs.push('counts');
    if (creatingDance && !meta.walls) needs.push('walls');
    if (!steps.length) needs.push('steps');
    if (steps.length === 1 && !steps[0].fromGlossary) {
      if (steps[0].needsName) needs.push('step_name');
      if (steps[0].needsCount) needs.push('step_count');
    }
    if (needs.length) {
      const plan = { type:'worksheet-build', prompt: mergedPrompt, meta, steps, needs };
      state.chatPending = plan;
      return { handled: true, message: buildHelperFollowUp(plan), applied: false };
    }
    /* ── Detect vague / non-specific step requests ── */
    if (isVagueStepRequest(steps)) {
      const vagueNames = steps.filter(function(s){ return !s.fromGlossary; }).map(function(s){ return '"' + compactWhitespace(s.name || s.source || '') + '"'; }).join(', ');
      const plan = { type:'worksheet-build', prompt: mergedPrompt, meta, steps, needs: [] };
      state.chatPending = plan;
      return { handled: true, message: 'I want to make sure I get this right. ' + (vagueNames ? 'The step ' + vagueNames + ' isn\'t specific enough for me to match confidently.' : 'That step isn\'t specific enough.') + ' Could you describe the footwork, direction, or give a standard name? For example: "vine right", "rock back recover", "coaster step", or describe it like "step right, cross behind, step right, touch".', applied: false };
    }
    /* ── Show confirmation preview instead of applying immediately ── */
    state.chatPending = { type:'worksheet-confirm', prompt: mergedPrompt, meta: meta, steps: steps, createSection: !!(pending && pending.createSection) };
    const preview = buildStepPreviewMessage(steps, meta);
    return { handled: true, message: preview, applied: false, showConfirmButtons: true };
  }

  function applyConfirmedHelperPlan(pending){
    if (!pending || !Array.isArray(pending.steps) || !pending.steps.length) return { applied: false, message: '' };
    /* ── Smart section splitting: respects 8-count / waltz ── */
    const sectionSize = _getDanceStyleCountLimit();
    let data = ensureAppData();
    const forceFresh = !!(pending.resetDance);
    if ((forceFresh || shouldStartFreshWorksheet(pending.prompt)) && !currentWorksheetHasSteps()) {
      data = createBlankAppData();
    }
    if (!data.meta || typeof data.meta !== 'object') data.meta = createBlankAppData().meta;
    if (!Array.isArray(data.sections)) data.sections = [];
    if (!data.sections.length) data.sections.push({ id:createLocalId('section'), name:'Section 1', steps:[] });
    if (pending.meta && typeof pending.meta === 'object') {
      if (pending.meta.title) data.meta.title = pending.meta.title;
      if (pending.meta.counts) data.meta.counts = pending.meta.counts;
      if (pending.meta.walls) data.meta.walls = pending.meta.walls;
      if (pending.meta.type) data.meta.type = pending.meta.type;
      if (pending.meta.level) data.meta.level = pending.meta.level;
    }
    let target = data.sections[data.sections.length - 1];
    const wantsNewSection = !!(pending.createSection) || /\b(new section|add a section|another section|new part|add a part)\b/i.test(String(pending.prompt || ''));
    if (!target || wantsNewSection) {
      target = { id:createLocalId('section'), name:'Section ' + (data.sections.length + 1), steps:[] };
      data.sections.push(target);
    }
    if (!Array.isArray(target.steps)) target.steps = [];
    /* ── Count existing steps to know when to create new section ── */
    let countAccum = 0;
    target.steps.forEach(function(step){
      if (!step || step.type !== 'step') return;
      countAccum += calculateCountSpan(step);
    });
    pending.steps.forEach(function(step){
      var span = calculateCountSpan(step);
      if (pending.steps.length > sectionSize && countAccum > 0 && countAccum + span > sectionSize) {
        target = { id:createLocalId('section'), name:'Section ' + (data.sections.length + 1), steps:[] };
        data.sections.push(target);
        countAccum = 0;
      }
      target.steps.push(buildGlossaryApplyStep(step));
      countAccum += span;
    });
    writeAppData(data);
    updateSavedSignature('');
    renderPages();
    openBuildWorksheet();
    var customCount = pending.steps.filter(function(step){ return !step.fromGlossary; }).length;
    var summary = pending.steps.slice(0, 6).map(function(step){ return step.name; }).join(', ');
    var bits = ['Done. I added ' + pending.steps.length + ' step' + (pending.steps.length === 1 ? '' : 's') + '.'];
    if (pending.meta && pending.meta.title) bits.push('Dance name set to ' + pending.meta.title + '.');
    if (pending.meta && pending.meta.counts) bits.push('Counts set to ' + pending.meta.counts + '.');
    if (pending.meta && pending.meta.walls) bits.push('Walls set to ' + pending.meta.walls + '.');
    if (summary) bits.push('Added: ' + summary + (pending.steps.length > 6 ? ', …' : '.'));
    if (customCount) bits.push(customCount + ' of those step' + (customCount === 1 ? ' was' : 's were') + ' added as custom worksheet step' + (customCount === 1 ? '' : 's') + ' rather than glossary matches.');
    return { applied: true, message: bits.join(' ') };
  }

  function tryHandleSiteHelperLocally(question){
    const prompt = compactWhitespace(question);
    const hasPendingBuild = !!(state.chatPending && state.chatPending.type === 'worksheet-build');
    const hasPendingConfirm = !!(state.chatPending && state.chatPending.type === 'worksheet-confirm');
    if (!prompt) return null;
    /* ── Handle approve / deny for pending confirmation ── */
    if (hasPendingConfirm) {
      const lower = prompt.toLowerCase();
      if (/\b(yes|approve|confirm|ok|go ahead|do it|apply|add it|sure|yep|yeah)\b/.test(lower)) {
        const pending = state.chatPending;
        state.chatPending = null;
        const result = applyConfirmedHelperPlan(pending);
        playDecisionSound('approve');
        return { handled: true, message: '✅ ' + result.message, applied: !!result.applied };
      }
      if (/\b(no|deny|cancel|nope|nah|stop|nevermind|never mind|reject)\b/.test(lower)) {
        state.chatPending = null;
        playDecisionSound('deny');
        return { handled: true, message: 'No worries — I cancelled that addition. Let me know if you want to try something different!', applied: false };
      }
      /* User sent something else while confirm is pending — treat as a new build request that replaces the pending one */
      state.chatPending = null;
    }
    if (hasPendingBuild || hasPendingConfirm || looksLikeDanceBuildPrompt(prompt)) {
      const result = resolveHelperWorksheetIntent(prompt);
      if (result && result.handled) return result;
    }
    return null;
  }

  /* ── Page action commands the helper can execute ── */
  /* ── Infer last-mentioned page from chat context ── */
  function _inferLastMentionedPage(){
    var msgs = (state.chatMessages || []).slice(-6);
    var pagePatterns = [
      { re: /\b(build|editor|worksheet)\b/i, page: null, btn: function(){ return state.ui.buildBtn; } },
      { re: /\b(sheet|preview)\b/i, page: null, btn: function(){ return state.ui.sheetBtn; } },
      { re: /\b(friends?|people|contacts|collab)\b/i, page: 'friends' },
      { re: /\b(glossary|dictionary|step.?list)\b/i, page: 'glossary' },
      { re: /\b(pdf|import)\b/i, page: 'pdfimport' },
      { re: /\b(settings?|preferences?)\b/i, page: 'settings' },
      { re: /\b(music|song|bpm|tempo)\b/i, page: 'music' },
      { re: /\b(templates?|starter)\b/i, page: 'templates' },
      { re: /\b(sign.?in|login|account)\b/i, page: 'signin' },
      { re: /\b(subscription|premium|upgrade)\b/i, page: 'subscription' },
      { re: /\b(saved|my dances)\b/i, page: null, btn: function(){ return document.getElementById('stepper-saved-dances-tab'); } },
      { re: /\b(featured|choreo)\b/i, page: null, btn: function(){ return document.getElementById('stepper-featured-choreo-tab'); } },
      { re: /\b(what'?s new)\b/i, page: null, btn: function(){ var b = Array.from(document.querySelectorAll('button')).find(function(b2){ return (b2.textContent||'').trim()==="What's New"; }); return b; } }
    ];
    for (var mi = msgs.length - 1; mi >= 0; mi--) {
      var text = (msgs[mi].text || '').toLowerCase();
      for (var pi = 0; pi < pagePatterns.length; pi++) {
        if (pagePatterns[pi].re.test(text)) {
          if (pagePatterns[pi].page) return { page: pagePatterns[pi].page };
          if (pagePatterns[pi].btn) { var el = pagePatterns[pi].btn(); if (el) return { click: el }; }
        }
      }
    }
    return null;
  }

  function tryHelperPageAction(question){
    var q = String(question || '').toLowerCase().trim();
    /* ── Navigate to tabs ── */
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(build|editor|worksheet)\b/.test(q)) {
      openBuildWorksheet();
      return { handled: true, message: '✅ Opened the **Build** tab for you.' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(sheet|preview)\b/.test(q)) {
      if (state.ui.sheetBtn) state.ui.sheetBtn.click();
      return { handled: true, message: '✅ Opened the **Sheet** preview tab.' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(saved|my dances|my saves)\b/.test(q)) {
      var savedPage = document.getElementById('stepper-saved-dances-page');
      var savedBtn = document.querySelector('[data-tab="saved-dances"]') || document.querySelector('[data-tab="my-saved-dances"]') || document.querySelector('button[class*="saved"]');
      if (savedBtn) { savedBtn.click(); return { handled: true, message: '✅ Opened your **Saved Dances** page.' }; }
      if (savedPage) { savedPage.hidden = false; savedPage.style.display = ''; closePages(); patchSavedDancesPage(true); return { handled: true, message: '✅ Opened your **Saved Dances** page.' }; }
      return { handled: true, message: 'I couldn\'t find the Saved Dances page. Try clicking the My Saved Dances tab manually.' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(sign.?in|login|account)\b/.test(q)) {
      openPage('signin');
      return { handled: true, message: '✅ Opened the **Sign In** page.' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(subscription|premium|upgrade)\b/.test(q)) {
      openPage('subscription');
      return { handled: true, message: '✅ Opened the **Subscription** page.' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(featured|choreo)\b/.test(q)) {
      var featBtn = document.querySelector('[data-tab="featured-choreo"]') || document.querySelector('button[class*="featured"]');
      if (featBtn) featBtn.click();
      return { handled: true, message: '✅ Opened the **Featured Choreo** page.' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(admin)\b/.test(q)) {
      if (isAdminSession()) { openPage('admin'); return { handled: true, message: '✅ Opened the **Admin** page.' }; }
      return { handled: true, message: 'You need admin access to open that page.' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(friend|friends|people|contacts)\b/.test(q)) {
      openPage('friends');
      if (window.__stepperFriendsTab) window.__stepperFriendsTab.refresh();
      return { handled: true, message: '✅ Opened the **Friends** tab. Add friends by their Gmail or email address!' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(glossary|dictionary|step.?list|step.?dictionary)\b/.test(q)) {
      openPage('glossary');
      return { handled: true, message: '✅ Opened the **Glossary** tab. Browse and search 100+ standard dance steps!' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(pdf|import|upload)\b/.test(q)) {
      openPage('pdfimport');
      return { handled: true, message: '✅ Opened the **PDF Import** tab. Drop a stepsheet PDF to auto-import!' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(settings?|preferences?|config)\b/.test(q)) {
      openPage('settings');
      return { handled: true, message: '✅ Opened the **Settings** tab. Customize fonts, theme, and more!' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(music|song|bpm|tempo|metronome)\b/.test(q)) {
      openPage('music');
      return { handled: true, message: '✅ Opened the **Music** tab. Manage BPM, tap tempo, and music info!' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(template|templates|starter|blank)\b/.test(q)) {
      openPage('templates');
      return { handled: true, message: '✅ Opened the **Templates** tab. Browse pre-built dance templates by level!' };
    }
    if (/\b(go to|open|show|switch to|navigate to)\b.*\b(notification|notifications|alerts|invites)\b/.test(q)) {
      openPage('notifications');
      return { handled: true, message: '✅ Opened the **Notifications** tab. Check your dance invites and updates!' };
    }
    /* ── Natural language navigation: "take me there", "yes go there", "please take me" ── */
    if (/\b(take me|bring me|go)\b.*\b(there|to it|to that)\b/.test(q) || /\b(yes|sure|please)\b.*\b(take me|go there|navigate|open it)\b/.test(q)) {
      /* Scan recent assistant messages for a page/tab mention */
      var lastMentioned = _inferLastMentionedPage();
      if (lastMentioned) {
        if (lastMentioned.click) { lastMentioned.click(); return { handled: true, message: '✅ Taking you there now!' }; }
        if (lastMentioned.page) { openPage(lastMentioned.page); return { handled: true, message: '✅ Taking you there now!' }; }
      }
      return { handled: true, message: 'I\'m not sure which page you mean — could you tell me where you\'d like to go? For example: "open settings", "go to friends", or "show glossary".' };
    }
    /* ── Toggle dark mode ── */
    if (/\b(dark mode|night mode|toggle dark|toggle theme|switch theme)\b/.test(q) || (/\b(turn on|enable|activate)\b.*\bdark\b/.test(q))) {
      var htmlEl = document.documentElement;
      var isDark = htmlEl.classList.contains('dark') || document.body.classList.contains('dark');
      var toggleBtn = document.querySelector('[data-dark-toggle]') || document.querySelector('button[aria-label*="dark"]') || document.querySelector('button[aria-label*="theme"]') || document.querySelector('.dark-mode-toggle');
      if (toggleBtn) { toggleBtn.click(); return { handled: true, message: isDark ? '☀️ Switched to **light mode**.' : '🌙 Switched to **dark mode**.' }; }
      if (isDark) { htmlEl.classList.remove('dark'); document.body.classList.remove('dark'); }
      else { htmlEl.classList.add('dark'); document.body.classList.add('dark'); }
      return { handled: true, message: isDark ? '☀️ Switched to **light mode**.' : '🌙 Switched to **dark mode**.' };
    }
    if (/\b(light mode|day mode)\b/.test(q) || (/\b(turn off|disable)\b.*\bdark\b/.test(q))) {
      document.documentElement.classList.remove('dark'); document.body.classList.remove('dark');
      var toggleBtn2 = document.querySelector('[data-dark-toggle]') || document.querySelector('button[aria-label*="dark"]');
      if (toggleBtn2 && (document.documentElement.classList.contains('dark') || document.body.classList.contains('dark'))) toggleBtn2.click();
      return { handled: true, message: '☀️ Switched to **light mode**.' };
    }
    /* ── Save dance ── */
    if (/\b(save|sync|push|upload)\b.*\b(dance|worksheet|changes|work|progress)\b/.test(q) || /\b(save now|save it|save this|cloud save)\b/.test(q)) {
      if (!state.session || !state.session.credential) return { handled: true, message: 'You need to **sign in** first before saving. Say "open sign in" and I\'ll take you there!' };
      saveChangesNow({ force: true }).then(function(ok){ if (!ok) { state.chatMessages.push({ role:'assistant', text:'⚠️ Save failed — the backend might be down. Try again in a moment.'}); state._helperSignature=''; renderSiteHelper(); } });
      return { handled: true, message: '💾 Saving your dance to the cloud now…' };
    }
    /* ── Load a saved dance by name ── */
    var loadMatch = q.match(/\b(?:load|open|restore|pull up)\b\s+(?:dance\s+)?["']?([^"']+?)["']?\s*(?:into|to|on)?\s*(?:the\s+)?(?:worksheet)?$/i);
    if (!loadMatch) loadMatch = q.match(/\b(?:load|open|restore)\b\s+["']([^"']+)["']/i);
    if (loadMatch && loadMatch[1]) {
      var searchTerm = loadMatch[1].trim().toLowerCase();
      var found = (state.cloudSaves || []).find(function(s){ return s && s.title && s.title.toLowerCase().indexOf(searchTerm) !== -1; });
      if (found) { loadDanceIntoWorksheet(found); return { handled: true, message: '✅ Loaded **' + escapeHtml(found.title) + '** into the worksheet.' }; }
      return { handled: true, message: 'I couldn\'t find a saved dance matching "' + escapeHtml(loadMatch[1].trim()) + '". Try saying "list my saves" to see what you have.' };
    }
    /* ── List saved dances ── */
    if (/\b(list|show|what are)\b.*\b(saves?|dances?|cloud)\b/.test(q) || /\b(my saves|my dances|saved dances)\b/.test(q)) {
      if (!state.session || !state.session.credential) return { handled: true, message: 'Sign in first to see your cloud saves.' };
      var saves = state.cloudSaves || [];
      if (!saves.length) return { handled: true, message: 'You don\'t have any cloud saves yet. Use the **Save** button or say "save my dance" to create one.' };
      var list = saves.slice(0, 10).map(function(s, i){ return (i+1) + '. **' + escapeHtml(s.title || 'Untitled') + '** (' + (s.steps || 0) + ' steps, ' + (s.sections || 0) + ' sections)'; }).join('\n');
      return { handled: true, message: 'Your saved dances:\n' + list + (saves.length > 10 ? '\n…and ' + (saves.length - 10) + ' more.' : '') + '\n\nSay "load [dance name]" to open one.' };
    }
    /* ── New / clear worksheet ── */
    if (/\b(new|blank|empty|clear|reset)\b.*\b(dance|worksheet|sheet|everything)\b/.test(q) || /\b(start over|start fresh|clear all)\b/.test(q)) {
      if (hasUnsavedChanges()) return { handled: true, message: '⚠️ You have unsaved changes. Say "save my dance" first, or say "force clear worksheet" to discard.' };
      var blankData = createBlankAppData();
      writeAppData(blankData);
      updateSavedSignature('');
      renderPages();
      return { handled: true, message: '🆕 Worksheet cleared! You\'re starting fresh.' };
    }
    if (/\bforce clear\b/.test(q)) {
      var blankData2 = createBlankAppData();
      writeAppData(blankData2);
      updateSavedSignature('');
      renderPages();
      return { handled: true, message: '🆕 Worksheet cleared! All changes discarded.' };
    }
    /* ── Set dance metadata ── */
    var titleMatch = q.match(/\b(?:set|change|rename)\b.*\btitle\b.*\bto\b\s+["']?(.+?)["']?\s*$/i);
    if (!titleMatch) titleMatch = q.match(/\btitle\b\s*[:=]\s*["']?(.+?)["']?\s*$/i);
    if (titleMatch && titleMatch[1]) {
      var data = ensureAppData(); if (!data.meta) data.meta = createBlankAppData().meta;
      data.meta.title = titleCaseWords(titleMatch[1].trim());
      writeAppData(data); updateSavedSignature(''); renderPages();
      return { handled: true, message: '✅ Dance title set to **' + escapeHtml(data.meta.title) + '**.' };
    }
    var countsMatch = q.match(/\b(?:set|change)\b.*\bcounts?\b.*\bto\b\s+["']?(\d+)["']?/i);
    if (countsMatch && countsMatch[1]) {
      var data2 = ensureAppData(); if (!data2.meta) data2.meta = createBlankAppData().meta;
      data2.meta.counts = countsMatch[1].trim();
      writeAppData(data2); updateSavedSignature(''); renderPages();
      return { handled: true, message: '✅ Counts set to **' + escapeHtml(data2.meta.counts) + '**.' };
    }
    var wallsMatch = q.match(/\b(?:set|change)\b.*\bwalls?\b.*\bto\b\s+["']?(\d+)["']?/i);
    if (wallsMatch && wallsMatch[1]) {
      var data3 = ensureAppData(); if (!data3.meta) data3.meta = createBlankAppData().meta;
      data3.meta.walls = wallsMatch[1].trim();
      writeAppData(data3); updateSavedSignature(''); renderPages();
      return { handled: true, message: '✅ Walls set to **' + escapeHtml(data3.meta.walls) + '**.' };
    }
    var levelMatch = q.match(/\b(?:set|change)\b.*\blevel\b.*\bto\b\s+["']?(.+?)["']?\s*$/i);
    if (levelMatch && levelMatch[1]) {
      var data4 = ensureAppData(); if (!data4.meta) data4.meta = createBlankAppData().meta;
      data4.meta.level = titleCaseWords(levelMatch[1].trim());
      writeAppData(data4); updateSavedSignature(''); renderPages();
      return { handled: true, message: '✅ Level set to **' + escapeHtml(data4.meta.level) + '**.' };
    }
    /* ── Delete a specific step by description ── */
    var deleteStepMatch = q.match(/\b(?:delete|remove)\b.*\bstep\b\s+(?:#?\s*)?(\d+)/i);
    if (deleteStepMatch && deleteStepMatch[1]) {
      var stepIdx = parseInt(deleteStepMatch[1], 10) - 1;
      var ddata = ensureAppData();
      var allSteps = [];
      (ddata.sections || []).forEach(function(sec){ (sec.steps || []).forEach(function(st){ allSteps.push({ step: st, section: sec }); }); });
      if (stepIdx >= 0 && stepIdx < allSteps.length) {
        var target = allSteps[stepIdx];
        var idx = target.section.steps.indexOf(target.step);
        if (idx >= 0) target.section.steps.splice(idx, 1);
        writeAppData(ddata); updateSavedSignature(''); renderPages();
        return { handled: true, message: '✅ Deleted step #' + (stepIdx + 1) + ' (' + escapeHtml(target.step.name || target.step.step || 'unnamed') + ').' };
      }
      return { handled: true, message: 'Step #' + (stepIdx + 1) + ' doesn\'t exist. You have ' + allSteps.length + ' steps total.' };
    }
    /* ── Delete a section ── */
    var deleteSectionMatch = q.match(/\b(?:delete|remove)\b.*\bsection\b\s+(?:#?\s*)?(\d+)/i);
    if (deleteSectionMatch && deleteSectionMatch[1]) {
      var secIdx = parseInt(deleteSectionMatch[1], 10) - 1;
      var ddata2 = ensureAppData();
      if (secIdx >= 0 && secIdx < (ddata2.sections || []).length) {
        var secName = ddata2.sections[secIdx].name || 'Section ' + (secIdx + 1);
        ddata2.sections.splice(secIdx, 1);
        writeAppData(ddata2); updateSavedSignature(''); renderPages();
        return { handled: true, message: '✅ Deleted **' + escapeHtml(secName) + '**.' };
      }
      return { handled: true, message: 'Section #' + (secIdx + 1) + ' doesn\'t exist. You have ' + (ddata2.sections || []).length + ' sections.' };
    }
    /* ── Undo / Redo ── */
    if (/\bundo\b/.test(q)) {
      var undoBtn = document.querySelector('[data-undo]') || document.querySelector('button[aria-label*="undo"]');
      if (undoBtn) { undoBtn.click(); return { handled: true, message: '↩️ Undo applied.' }; }
      return { handled: true, message: 'No undo button found. Try pressing **Ctrl+Z**.' };
    }
    if (/\bredo\b/.test(q)) {
      var redoBtn = document.querySelector('[data-redo]') || document.querySelector('button[aria-label*="redo"]');
      if (redoBtn) { redoBtn.click(); return { handled: true, message: '↪️ Redo applied.' }; }
      return { handled: true, message: 'No redo button found. Try pressing **Ctrl+Y**.' };
    }
    /* ── Open community glossary ── */
    if (/\b(glossary|community glossary|open glossary|show glossary)\b/.test(q)) {
      state.communityGlossaryOpen = true;
      renderCommunityGlossary();
      return { handled: true, message: '📖 Opened the **Community Glossary** panel.' };
    }
    /* ── Scroll to top/bottom ── */
    if (/\b(scroll to top|go to top|back to top)\b/.test(q)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return { handled: true, message: '⬆️ Scrolled to the top.' };
    }
    if (/\b(scroll to bottom|go to bottom)\b/.test(q)) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      return { handled: true, message: '⬇️ Scrolled to the bottom.' };
    }
    /* ── Generate counts ── */
    if (/\b(generate|auto|fill)\b.*\bcounts?\b/.test(q) || /\bauto.?count\b/.test(q)) {
      var result = autoGenerateCountsForWorksheet();
      return { handled: true, message: '✅ Auto-generated counts for ' + result.sections + ' section' + (result.sections === 1 ? '' : 's') + '. Total: ' + result.totalCounts + ' counts.' };
    }
    /* ── Archive current dance ── */
    if (/\barchive\b.*\b(dance|this|current|worksheet)\b/.test(q) || /\barchive it\b/.test(q)) {
      var archEntry = buildCurrentDanceEntry();
      if (!archEntry) return { handled: true, message: 'No dance loaded to archive.' };
      var nowArch = _toggleArchive(archEntry.id);
      state.savedDancesUiSignature = '';
      return { handled: true, message: nowArch ? '📦 Dance **archived**. It won\'t show in your main saves list but you can find it under the Archived filter.' : '📤 Dance **unarchived**. It\'s back in your main saves list.' };
    }
    /* ── Create folder (alias for group) ── */
    if (/\b(create|new|make)\b.*\b(folder|group)\b\s+["']?(.+?)["']?\s*$/i.test(q)) {
      var folderMatch = q.match(/\b(?:folder|group)\b\s+["']?(.+?)["']?\s*$/i);
      if (folderMatch && folderMatch[1]) {
        var fn = folderMatch[1].trim();
        var fgroups = _getDanceGroups();
        if (!fgroups[fn]) fgroups[fn] = [];
        _saveDanceGroups(fgroups);
        state.savedDancesUiSignature = '';
        renderPages();
        return { handled: true, message: '📁 Created folder **' + escapeHtml(fn) + '**. Move dances into it from the Saved Dances page.' };
      }
    }
    if (/\b(list|show)\b.*\b(folder|group)/.test(q) || /\bmy (folders|groups)\b/.test(q)) {
      var fgroups2 = _getDanceGroups();
      var fnames = Object.keys(fgroups2);
      if (!fnames.length) return { handled: true, message: 'You don\'t have any folders yet. Say "create folder [name]" to make one.' };
      return { handled: true, message: '📁 Your folders:\n' + fnames.map(function(n){ return '- **' + escapeHtml(n) + '** (' + (fgroups2[n] || []).length + ' dances)'; }).join('\n') };
    }
    /* ── Dance info summary ── */
    if (/\b(dance info|current dance|what am i|worksheet info|what\'s loaded)\b/.test(q) || /\btell me about\b.*\b(current|this)\b.*\b(dance|worksheet)\b/.test(q)) {
      var appd = readAppData();
      var meta = (appd && appd.meta) || {};
      var secs = Array.isArray(appd && appd.sections) ? appd.sections : [];
      var tots = secs.reduce(function(s,sec){ return s + (Array.isArray(sec.steps) ? sec.steps.length : 0); }, 0);
      if (!tots) return { handled: true, message: 'The worksheet is currently empty. Start building or say "load [dance name]" to load a saved dance.' };
      var lines = ['📋 **Current Dance Info:**'];
      if (meta.title) lines.push('- **Title:** ' + escapeHtml(meta.title));
      if (meta.choreographer) lines.push('- **Choreographer:** ' + escapeHtml(meta.choreographer));
      if (meta.counts) lines.push('- **Counts:** ' + escapeHtml(meta.counts));
      if (meta.walls) lines.push('- **Walls:** ' + escapeHtml(meta.walls));
      if (meta.level) lines.push('- **Level:** ' + escapeHtml(meta.level));
      lines.push('- **Sections:** ' + secs.length);
      lines.push('- **Total Steps:** ' + tots);
      if (hasUnsavedChanges()) lines.push('- ⚠️ *Unsaved changes*');
      return { handled: true, message: lines.join('\n') };
    }
    /* ── Collaboration commands ── */
    var collabMatch = q.match(/\b(?:invite|add)\b.*\b(?:collaborator|collab)\b.*?[\s:]+([^\s@]+@[^\s]+)/i);
    if (collabMatch && collabMatch[1]) {
      var email = collabMatch[1].trim().toLowerCase();
      return _sendCollabInvite(email);
    }
    if (/\b(list|show|who)\b.*\b(collaborator|collab)\b/.test(q) || /\bmy collaborators\b/.test(q)) {
      return _listCollaborators();
    }
    /* ── Group management commands ── */
    var groupMatch = q.match(/\b(?:move|add|put)\b.*?["'](.+?)["'].*\b(?:to|into|in)\b.*\bgroup\b\s+["']?(.+?)["']?\s*$/i);
    if (!groupMatch) groupMatch = q.match(/\b(?:move|add|put)\b.*\bto\b.*\bgroup\b\s+["']?(.+?)["']?\s*$/i);
    if (groupMatch) {
      var gname = (groupMatch[2] || groupMatch[1] || '').trim();
      if (gname) return { handled: true, message: 'To move a dance into a group, go to **My Saved Dances** and use the group dropdown on each dance card. Or say "create group [name]" to make a new group.' };
    }
    if (/\b(create|new|make)\b.*\bgroup\b\s+["']?(.+?)["']?\s*$/i.test(q)) {
      var newGroupName = q.match(/\bgroup\b\s+["']?(.+?)["']?\s*$/i);
      if (newGroupName && newGroupName[1]) {
        var gn = newGroupName[1].trim();
        var groups = JSON.parse(localStorage.getItem('stepper_dance_groups') || '{}');
        if (!groups[gn]) groups[gn] = [];
        localStorage.setItem('stepper_dance_groups', JSON.stringify(groups));
        state.danceGroups = groups;
        state.savedDancesUiSignature = '';
        renderPages();
        return { handled: true, message: '📁 Created group **' + escapeHtml(gn) + '**. You can now move dances into it from your Saved Dances page.' };
      }
    }
    if (/\b(list|show)\b.*\bgroup/.test(q) || /\bmy groups\b/.test(q)) {
      var groups2 = JSON.parse(localStorage.getItem('stepper_dance_groups') || '{}');
      var names = Object.keys(groups2);
      if (!names.length) return { handled: true, message: 'You don\'t have any groups yet. Say "create group [name]" to make one.' };
      return { handled: true, message: '📁 Your dance groups:\n' + names.map(function(n){ return '- **' + escapeHtml(n) + '** (' + (groups2[n] || []).length + ' dances)'; }).join('\n') };
    }
    /* ── Help / what can you do ── */
    if (/\bwhat can you do\b/.test(q) || /\byour (?:capabilities|abilities|features)\b/.test(q) || /\bhelp me\b.*\bwhat\b/.test(q)) {
      return { handled: true, message: '🧠 **I can do a lot!** Here\'s what I can help with:\n\n' +
        '**Navigation:** "Go to Build", "Open sheet", "Open saved dances", "Open featured", "Open friends", "Open glossary", "Open PDF import"\n' +
        '**Dance editing:** "Add a vine right", "Delete step 3", "Delete section 2", "Clear worksheet"\n' +
        '**Metadata:** "Set title to My Dance", "Set counts to 32", "Set walls to 4", "Set level to beginner"\n' +
        '**Saving:** "Save my dance", "List my saves", "Load [dance name]"\n' +
        '**Tools:** "Generate counts", "Undo", "Redo", "Open glossary"\n' +
        '**Dance type:** "Set dance type 8-count", "Set dance type waltz"\n' +
        '**Random dance:** "Generate a random 10/10 dance", "Random perfect flow section"\n' +
        '**Quick add:** "Add to worksheet vine right", "Put on sheet coaster step"\n' +
        '**Groups & Folders:** "Create folder [name]", "List folders", "Archive this dance"\n' +
        '**Friends:** Open the **Friends tab** to add friends by Gmail, or "Invite collaborator user@email.com"\n' +
        '**Step Dictionary:** Open the **Glossary tab** to browse 100+ standard dance steps\n' +
        '**PDF Import:** Open the **PDF Import tab** to upload a stepsheet PDF\n' +
        '**Display:** "Dark mode", "Light mode", "Scroll to top"\n' +
        '**Info:** "Dance info", "What\'s loaded"\n\n' +
        'Just tell me what you need!' };
    }
    /* ── Set dance type: 8-count or waltz ── */
    if (/\b(?:set|change|make)\b.*\b(?:dance\s*type|type)\b.*\b(?:8.?count|eight.?count|standard)\b/i.test(q) || /\b8.?count\s+dance\b/i.test(q)) {
      var d8 = ensureAppData(); if (!d8.meta) d8.meta = createBlankAppData().meta;
      d8.meta.danceStyle = '8-count';
      d8.meta.type = d8.meta.type || '4-Wall';
      writeAppData(d8); updateSavedSignature(''); renderPages();
      return { handled: true, message: '✅ Dance type set to **8-count**. Sections will auto-split at 8 counts.' };
    }
    if (/\b(?:set|change|make)\b.*\b(?:dance\s*type|type)\b.*\b(?:waltz|6.?count|six.?count|3\/4)\b/i.test(q) || /\bwaltz\s+dance\b/i.test(q) || /\bwaltz\b/.test(q) && /\b(?:set|make|switch|change)\b/.test(q)) {
      var dw = ensureAppData(); if (!dw.meta) dw.meta = createBlankAppData().meta;
      dw.meta.danceStyle = 'waltz';
      dw.meta.type = dw.meta.type || '4-Wall';
      writeAppData(dw); updateSavedSignature(''); renderPages();
      return { handled: true, message: '✅ Dance type set to **waltz** (6-count). Sections will auto-split at 6 counts.' };
    }
    /* ── Generate a random 10/10 flowability dance ── */
    if (/\b(?:random|generate|make me|create|give me)\b.*\b(?:10\/10|perfect|amazing|best|fire|sick)\b.*\b(?:dance|flow|section|routine)\b/i.test(q) ||
        /\b(?:random|generate)\b.*\b(?:dance|section|flow)\b/i.test(q) && /\b(?:perfect|10|best)\b/i.test(q) ||
        /\brandom perfect flow\b/i.test(q) || /\brandom 10\b/i.test(q) || /\bgenerate.*random.*dance\b/i.test(q)) {
      return _generatePerfectFlowDance(q);
    }
    /* ── Quick-add step to worksheet ── */
    var quickAddMatch = q.match(/\b(?:add|submit|send|put)\b.*\b(?:to\s+)?(?:glossary|worksheet|sheet)\b(?:\s*:?\s*)(.+)/i);
    if (!quickAddMatch) quickAddMatch = q.match(/\b(?:worksheet|sheet)\b.*\b(?:add|put)\b(?:\s*:?\s*)(.+)/i);
    if (quickAddMatch && quickAddMatch[1]) {
      return _quickAddStepToWorksheet(quickAddMatch[1].trim());
    }
    return null;
  }

  /* ── Get section count limit based on dance style ── */
  function _getDanceStyleCountLimit(){
    var data = readAppData();
    var style = (data && data.meta && data.meta.danceStyle) || '';
    if (style === 'waltz') return 6;
    return 8;
  }

  /* ── Perfect-flow dance generator ── */
  function _generatePerfectFlowDance(prompt){
    var glossary = Array.isArray(state.glossaryApproved) ? state.glossaryApproved : [];
    var countLimit = _getDanceStyleCountLimit();
    var data = ensureAppData();
    if (!data.meta) data.meta = createBlankAppData().meta;
    var style = (data.meta.danceStyle) || '8-count';

    /* Use curated high-flow step combos if glossary is sparse */
    var PERFECT_FLOW_8 = [
      { name:'Vine Right', count:'1-2', foot:'R', description:'Step right, cross left behind, step right, touch left beside.' },
      { name:'Vine Left', count:'3-4', foot:'L', description:'Step left, cross right behind, step left, touch right beside.' },
      { name:'Rock Forward', count:'5-6', foot:'R', description:'Rock forward on right foot, recover weight back onto left.' },
      { name:'Coaster Step', count:'7&8', foot:'R', description:'Step back right, step left together, step forward right.' },
      { name:'Shuffle Forward', count:'1&2', foot:'L', description:'Step left forward, close right, step left forward.' },
      { name:'Rock Back', count:'3-4', foot:'R', description:'Rock back on right foot, recover weight forward onto left.' },
      { name:'Step Pivot 1/2 Turn', count:'5-6', foot:'R', description:'Step forward right, pivot half turn left taking weight on left.' },
      { name:'Triple Step', count:'7&8', foot:'R', description:'Step right, close left, step right in place.' },
      { name:'Cross Rock', count:'1-2', foot:'L', description:'Cross left over right and rock, recover weight back onto right.' },
      { name:'Side Shuffle', count:'3&4', foot:'L', description:'Step left to side, close right, step left to side.' },
      { name:'Jazz Box', count:'5-8', foot:'R', description:'Cross right over left, step back left, step right to side, step left forward.' },
      { name:'Monterey Turn', count:'1-4', foot:'R', description:'Point right to side, half turn right stepping right beside left, point left to side, step left beside right.' },
      { name:'Kick Ball Change', count:'5&6', foot:'R', description:'Kick right forward, step ball of right beside left, change weight to left.' },
      { name:'Sailor Step', count:'7&8', foot:'R', description:'Cross right behind left, step left to side, step right to side.' },
      { name:'Weave Right', count:'1-4', foot:'R', description:'Step right, cross left behind, step right, cross left in front.' },
      { name:'Heel Grind', count:'5-6', foot:'R', description:'Touch right heel forward, swivel heel inward taking weight.' },
      { name:'Stomp Up', count:'7', foot:'L', description:'Stomp left beside right without weight change.' },
      { name:'Scuff', count:'8', foot:'R', description:'Scuff right heel forward.' }
    ];
    var PERFECT_FLOW_WALTZ = [
      { name:'Waltz Forward', count:'1-3', foot:'R', description:'Step forward right, step forward left, close right to left.' },
      { name:'Waltz Back', count:'4-6', foot:'L', description:'Step back left, step back right, close left to right.' },
      { name:'Waltz Turn Right', count:'1-3', foot:'R', description:'Step forward right turning 1/4 right, step left to side, close right to left.' },
      { name:'Balance Forward', count:'1-3', foot:'L', description:'Step forward left, close right to left, hold.' },
      { name:'Balance Back', count:'4-6', foot:'R', description:'Step back right, close left to right, hold.' },
      { name:'Twinkle Right', count:'1-3', foot:'R', description:'Cross right over left, step left to side, step right to side.' },
      { name:'Twinkle Left', count:'4-6', foot:'L', description:'Cross left over right, step right to side, step left to side.' },
      { name:'Box Step Forward', count:'1-6', foot:'L', description:'Step forward left, step right to side, close left to right. Step back right, step left to side, close right to left.' }
    ];
    var pool = style === 'waltz' ? PERFECT_FLOW_WALTZ : PERFECT_FLOW_8;

    /* If glossary has enough items, merge them in for variety */
    if (glossary.length >= 6) {
      var glossaryPool = glossary.filter(function(g){ return g && g.name && (g.counts || g.count); });
      pool = pool.concat(glossaryPool.map(function(g){
        return { name: g.name, count: g.counts || g.count || '1', foot: g.foot || '', description: g.description || g.desc || '', fromGlossary: true };
      }));
    }

    /* Build a high-flow section using alternating feet and variety */
    var sectionSteps = [];
    var currentFoot = 'R';
    var usedNames = {};
    var remaining = countLimit;
    var guard = 0;
    while (remaining > 0 && guard < 16) {
      guard++;
      var best = null; var bestScore = -Infinity;
      for (var i = 0; i < pool.length; i++) {
        var p = pool[i];
        var span = _parseStepSpan(p.count);
        if (span > remaining) continue;
        var score = 0;
        var pFoot = (p.foot || '').toUpperCase();
        if (pFoot === currentFoot) score += 5;
        else if (pFoot && pFoot !== currentFoot) score -= 2;
        else score += 2;
        if (usedNames[p.name]) score -= 4;
        /* Seeded randomness for variety */
        var seedStr = p.name + sectionSteps.length + prompt;
        var seed = 0;
        for (var si = 0; si < seedStr.length; si++) {
          seed = (seed + seedStr.charCodeAt(si % seedStr.length) * (si + 1)) % 997;
        }
        score += (seed / 997) * 2;
        if (score > bestScore) { bestScore = score; best = p; }
      }
      if (!best) break;
      sectionSteps.push({
        name: best.name,
        description: best.description || inferLocalStepDescription(best.name, best.count, currentFoot),
        count: best.count,
        foot: (best.foot || currentFoot).toUpperCase() || currentFoot,
        fromGlossary: !!best.fromGlossary,
        needsName: false,
        needsCount: false,
        source: best.name
      });
      usedNames[best.name] = true;
      remaining -= _parseStepSpan(best.count);
      currentFoot = estimateLocalNextFoot(currentFoot, best.name, best.count);
    }
    if (!sectionSteps.length) return { handled: true, message: 'I need more glossary steps to generate a dance. Add some steps to the community glossary first!' };

    /* Apply to worksheet using the smart section splitting */
    var plan = {
      prompt: prompt,
      meta: data.meta.title ? {} : { title: 'Perfect Flow ' + (style === 'waltz' ? 'Waltz' : 'Dance') },
      steps: sectionSteps,
      createSection: true
    };
    var result = _applyStepsWithSmartSections(plan);
    return { handled: true, message: '🔥 **Generated a 10/10 flow ' + (style === 'waltz' ? 'waltz' : '8-count') + ' section!**\n\n' + result.message + '\n\nSay "generate another random section" to keep building!' };
  }

  function _parseStepSpan(countLabel){
    var cl = compactWhitespace(countLabel || '');
    if (/&/.test(cl)) {
      var parts = cl.split(/&/);
      var nums = [];
      parts.forEach(function(p){ var m = p.match(/\d+/); if (m) nums.push(Number(m[0])); });
      if (nums.length >= 2) return Math.max(1, nums[nums.length - 1] - nums[0] + 1);
      return 1;
    }
    var nums2 = (cl.match(/\d+/g) || []).map(Number).filter(Number.isFinite);
    return nums2.length >= 2 ? Math.max(1, nums2[nums2.length - 1] - nums2[0] + 1) : (nums2.length === 1 ? nums2[0] : 1);
  }

  /* ── Smart section splitter that respects 8-count / waltz ── */
  function _applyStepsWithSmartSections(plan){
    var countLimit = _getDanceStyleCountLimit();
    var data = ensureAppData();
    if (!data.meta || typeof data.meta !== 'object') data.meta = createBlankAppData().meta;
    if (!Array.isArray(data.sections)) data.sections = [];
    if (!data.sections.length) data.sections.push({ id: createLocalId('section'), name: 'Section 1', steps: [] });
    if (plan.meta && typeof plan.meta === 'object') {
      if (plan.meta.title) data.meta.title = plan.meta.title;
      if (plan.meta.counts) data.meta.counts = plan.meta.counts;
      if (plan.meta.walls) data.meta.walls = plan.meta.walls;
      if (plan.meta.type) data.meta.type = plan.meta.type;
      if (plan.meta.level) data.meta.level = plan.meta.level;
    }
    var target = data.sections[data.sections.length - 1];
    var wantsNew = !!(plan.createSection) || /\b(new section|add a section|another section)\b/i.test(String(plan.prompt || ''));
    if (!target || wantsNew) {
      target = { id: createLocalId('section'), name: 'Section ' + (data.sections.length + 1), steps: [] };
      data.sections.push(target);
    }
    if (!Array.isArray(target.steps)) target.steps = [];
    var countAccum = 0;
    target.steps.forEach(function(step){
      if (!step || step.type !== 'step') return;
      countAccum += calculateCountSpan(step);
    });
    var steps = Array.isArray(plan.steps) ? plan.steps : [];
    steps.forEach(function(step){
      var span = calculateCountSpan(step);
      /* Auto-split into new section when count limit exceeded */
      if (countAccum > 0 && countAccum + span > countLimit) {
        target = { id: createLocalId('section'), name: 'Section ' + (data.sections.length + 1), steps: [] };
        data.sections.push(target);
        countAccum = 0;
      }
      target.steps.push(buildGlossaryApplyStep(step));
      countAccum += span;
    });
    writeAppData(data);
    updateSavedSignature('');
    renderPages();
    openBuildWorksheet();
    var summary = steps.slice(0, 6).map(function(s){ return s.name; }).join(', ');
    return { applied: true, message: 'Added ' + steps.length + ' step' + (steps.length === 1 ? '' : 's') + (summary ? ': ' + summary : '') + '.' };
  }

  /* ── Add a step to the worksheet from the helper ── */
  function _quickAddStepToWorksheet(stepText){
    var parts = stepText.split(/[,;|]/).map(function(s){ return s.trim(); }).filter(Boolean);
    var stepName = parts[0] || stepText;
    var stepDesc = parts[1] || inferLocalStepDescription(stepName, '1', 'R');
    var stepCount = '1';
    var countMatch = stepText.match(/\b(\d+(?:\s*[-&]\s*\d+)?)\s*(?:count|cts?)?\b/i);
    if (countMatch) stepCount = countMatch[1];
    var stepFoot = 'R';
    if (/\bleft\b/i.test(stepText)) stepFoot = 'L';
    var plan = {
      prompt: stepText,
      meta: {},
      steps: [{
        name: titleCaseWords(stepName),
        description: stepDesc,
        count: stepCount,
        foot: stepFoot,
        fromGlossary: false,
        needsName: false,
        needsCount: false,
        source: stepName
      }]
    };
    var result = _applyStepsWithSmartSections(plan);
    return { handled: true, message: '✅ Added **' + escapeHtml(titleCaseWords(stepName)) + '** to the worksheet. ' + result.message };
  }

  /* ── Collaboration helpers ── */
  function _sendCollabInvite(email){
    if (!state.session || !state.session.credential) return { handled: true, message: 'You need to sign in first.' };
    var entry = buildCurrentDanceEntry();
    if (!entry) return { handled: true, message: 'Load or create a dance first before inviting collaborators.' };
    authFetch('/api/collaborators/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ danceId: entry.id, email: email })
    }).then(function(data){
      if (data && data.ok) {
        state.chatMessages.push({ role:'assistant', text: '✅ Collaboration invite sent to **' + escapeHtml(email) + '**!' });
      } else {
        state.chatMessages.push({ role:'assistant', text: '⚠️ Could not send invite: ' + escapeHtml((data && data.error) || 'Unknown error') });
      }
      state._helperSignature = '';
      renderSiteHelper();
    }).catch(function(){
      state.chatMessages.push({ role:'assistant', text: '⚠️ Could not send the invite. The server might be down.' });
      state._helperSignature = '';
      renderSiteHelper();
    });
    return { handled: true, message: '📨 Sending collaboration invite to **' + escapeHtml(email) + '**…' };
  }

  function _listCollaborators(){
    if (!state.session || !state.session.credential) return { handled: true, message: 'Sign in first to manage collaborators.' };
    var entry = buildCurrentDanceEntry();
    if (!entry) return { handled: true, message: 'No dance loaded. Load a dance first.' };
    authFetch('/api/collaborators?danceId=' + encodeURIComponent(entry.id)).then(function(data){
      var items = (data && Array.isArray(data.items)) ? data.items : [];
      if (!items.length) {
        state.chatMessages.push({ role:'assistant', text: 'No collaborators on this dance yet. Say "invite collaborator user@email.com" to add one.' });
      } else {
        var lines = items.map(function(c){ return '- **' + escapeHtml(c.name || c.email) + '** (' + escapeHtml(c.status || 'invited') + ')'; });
        state.chatMessages.push({ role:'assistant', text: '👥 Collaborators on **' + escapeHtml(entry.title) + '**:\n' + lines.join('\n') });
      }
      state._helperSignature = '';
      renderSiteHelper();
    }).catch(function(){
      state.chatMessages.push({ role:'assistant', text: '⚠️ Could not fetch collaborators.' });
      state._helperSignature = '';
      renderSiteHelper();
    });
    return { handled: true, message: '🔄 Fetching collaborators…' };
  }

  async function tryHandleSiteHelperWithBackend(question){
    const prompt = compactWhitespace(question);
    const hasPendingBuild = !!(state.chatPending && state.chatPending.type === 'worksheet-build');
    const hasPendingConfirm = !!(state.chatPending && state.chatPending.type === 'worksheet-confirm');
    if (!prompt) return null;
    /* ── Confirmation is handled locally, skip backend ── */
    if (hasPendingConfirm) return tryHandleSiteHelperLocally(prompt);
    if (!(hasPendingBuild || looksLikeDanceBuildPrompt(prompt))) return null;
    try {
      const data = await authFetch('/api/ai/worksheet-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history: (state.chatMessages || []).slice(-8).map((message) => ({ role: message.role, text: message.text })),
          pending: state.chatPending,
          dance: buildCurrentDanceEntry(),
          approvedGlossary: (state.glossaryApproved || []).slice(0, 200),
        })
      });
      if (data && data.pending && typeof data.pending === 'object') state.chatPending = data.pending;
      else if (data && !data.needsFollowUp) state.chatPending = null;
      if (data && data.applyNow) {
        const applied = applyHelperPlanToWorksheet({
          prompt,
          meta: data.meta,
          steps: Array.isArray(data.steps) ? data.steps : [],
          resetDance: !!data.resetDance,
          createSection: !!data.createSection,
        });
        return { handled: true, message: applied.message || String(data.reply || 'Done.').trim(), applied: true };
      }
      return { handled: true, message: String((data && data.reply) || 'Tell me the dance name, counts, walls, and the step pattern you want added.').trim(), applied: false };
    } catch (_error) {
      return tryHandleSiteHelperLocally(prompt);
    }
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
    renderPages(true);
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



  const APPROVAL_SOUND_SRC = './moderator-approved-admin-approved.m4a';
  const DENIAL_SOUND_SRC = './denied-sound.m4a';
  let __stepperDecisionAudioApprove = null;
  let __stepperDecisionAudioDeny = null;
  let __stepperDecisionAudioUnlocked = false;

  function resolveDecisionSoundSrc(src){
    try {
      if (window.__stepperResolveAssetUrl) return window.__stepperResolveAssetUrl(src);
    } catch (_error) {}
    return src;
  }

  function ensureDecisionAudio(kind){
    try {
      const isApprove = kind === 'approve';
      let audio = isApprove ? __stepperDecisionAudioApprove : __stepperDecisionAudioDeny;
      if (!audio) {
        audio = new Audio(resolveDecisionSoundSrc(isApprove ? APPROVAL_SOUND_SRC : DENIAL_SOUND_SRC));
        audio.preload = 'auto';
        audio.setAttribute('playsinline', '');
        audio.playsInline = true;
        audio.crossOrigin = 'anonymous';
        try { audio.load(); } catch (_error) {}
        if (isApprove) __stepperDecisionAudioApprove = audio;
        else __stepperDecisionAudioDeny = audio;
      }
      return audio;
    } catch (_error) {
      return null;
    }
  }

  function unlockDecisionAudio(){
    if (__stepperDecisionAudioUnlocked) return;
    __stepperDecisionAudioUnlocked = true;
    ['approve', 'deny'].forEach((kind) => {
      try {
        const audio = ensureDecisionAudio(kind);
        if (!audio) return;
        const attempt = audio.play();
        if (attempt && typeof attempt.then === 'function') {
          attempt.then(() => {
            try {
              audio.pause();
              audio.currentTime = 0;
            } catch (_error) {}
          }).catch(() => {
            try {
              audio.pause();
              audio.currentTime = 0;
            } catch (_error) {}
          });
        }
      } catch (_error) {}
    });
  }

  try {
    window.addEventListener('pointerdown', unlockDecisionAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockDecisionAudio, { once: true });
    window.addEventListener('touchstart', unlockDecisionAudio, { once: true, passive: true });
  } catch (_error) {}

  function playDecisionSound(kind){
    try {
      const audio = ensureDecisionAudio(kind === 'approve' ? 'approve' : 'deny');
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
      try { audio.load(); } catch (_error) {}
      const playAttempt = audio.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(() => {
          try {
            const retry = new Audio(resolveDecisionSoundSrc(kind === 'approve' ? APPROVAL_SOUND_SRC : DENIAL_SOUND_SRC));
            retry.preload = 'auto';
            retry.setAttribute('playsinline', '');
            retry.playsInline = true;
            const retryAttempt = retry.play();
            if (retryAttempt && typeof retryAttempt.catch === 'function') retryAttempt.catch(() => {});
          } catch (_error) {}
        });
      }
    } catch (_error) {}
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
    try { window.dispatchEvent(new Event('stepper:access-changed')); } catch (e) {}
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


  function formatRemainingTime(untilAt){
    const targetMs = Date.parse(untilAt || 0);
    const ms = targetMs - Date.now();
    if (!Number.isFinite(targetMs) || ms <= 0) return 'expired';
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    if (ms >= day) {
      const n = Math.ceil(ms / day);
      return `${n} day${n === 1 ? '' : 's'} left`;
    }
    if (ms >= hour) {
      const n = Math.ceil(ms / hour);
      return `${n} hour${n === 1 ? '' : 's'} left`;
    }
    const n = Math.max(1, Math.ceil(ms / minute));
    return `${n} minute${n === 1 ? '' : 's'} left`;
  }

  function formatSuspensionWindow(suspension){
    if (!suspension) return '';
    const untilAt = String(suspension.untilAt || '').trim();
    if (!untilAt) return '';
    const date = new Date(untilAt);
    if (Number.isNaN(date.getTime())) return '';
    return `Ends ${date.toLocaleString()} • ${formatRemainingTime(untilAt)}`;
  }

  function suspensionMessage(suspension){
    if (!suspension) return '';
    const duration = String(suspension.durationLabel || 'a while').trim() || 'a while';
    const reason = String(suspension.reason || 'an admin decision').trim() || 'an admin decision';
    const window = formatSuspensionWindow(suspension);
    return `You have been barred for ${duration} because of ${reason}${window ? `. ${window}` : ''}`;
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
    const role = String(state.session && state.session.role || '').trim().toLowerCase();
    return role === 'admin' || normalizeEmail(state.session && state.session.profile && state.session.profile.email) === normalizeEmail(ADMIN_EMAIL)
      || !!(state.session && state.session.isAdmin);
  }

  function isPremiumSession(){
    return isAdminSession() || !!(state.subscription && state.subscription.isPremium);
  }

  function hasPremiumExtensionAccess(){
    return isAdminSession() || isModeratorSession() || isPremiumSession();
  }

  window.__stepperIsPremium = function(){
    return hasPremiumExtensionAccess();
  };
  window.__stepperGetPremiumAccessStatus = function(){
    return {
      hasAccess: hasPremiumExtensionAccess(),
      isPremium: isPremiumSession(),
      isModerator: isModeratorSession(),
      isAdmin: isAdminSession(),
      role: String(state.session && state.session.role || '').trim().toLowerCase() || (isAdminSession() ? 'admin' : (isModeratorSession() ? 'moderator' : (isPremiumSession() ? 'premium' : 'member')))
    };
  };

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
    const rootAccent = getComputedStyle(document.documentElement).getPropertyValue('--stepper-accent-color').trim() || '#4f46e5';
    const activeBg = (accentColor && accentColor !== '#4f46e5') ? accentColor : rootAccent;
    const rgb = (getComputedStyle(document.documentElement).getPropertyValue('--stepper-accent-rgb').trim() || '79 70 229').replace(/\s+/g, ',');
    const idleBg = dark ? '#262626' : '#4b5563';
    button.style.color = '#ffffff';
    button.style.opacity = '1';
    button.style.transform = isActive ? 'translateY(-1px)' : '';
    button.style.boxShadow = isActive ? ('0 8px 24px rgba(' + rgb + ',.22)') : '0 6px 18px rgba(0,0,0,.08)';
    button.style.background = isActive ? activeBg : idleBg;
    button.style.borderColor = isActive ? activeBg : idleBg;
  }

  function updateTabButtons(){
    applyTabStyles(state.ui.signInBtn, state.activePage === 'signin', '#4f46e5');
    applyTabStyles(state.ui.subscriptionBtn, state.activePage === 'subscription', '#4f46e5');
    applyTabStyles(state.ui.adminBtn, state.activePage === 'admin', '#4f46e5');
    if (state.ui.friendsBtn) applyTabStyles(state.ui.friendsBtn, state.activePage === 'friends', '#4f46e5');
    if (state.ui.glossaryBtn) applyTabStyles(state.ui.glossaryBtn, state.activePage === 'glossary', '#4f46e5');
    if (state.ui.pdfBtn) applyTabStyles(state.ui.pdfBtn, state.activePage === 'pdfimport', '#4f46e5');
    if (state.ui.settingsBtn) applyTabStyles(state.ui.settingsBtn, state.activePage === 'settings', '#4f46e5');
    if (state.ui.notificationsBtn) applyTabStyles(state.ui.notificationsBtn, state.activePage === 'notifications', '#4f46e5');
    if (state.ui.tipsBtn) applyTabStyles(state.ui.tipsBtn, state.activePage === 'tips', '#4f46e5');
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
      /* ── Host layout ── */
      #${HOST_ID} { width: 100%; }
      #${HOST_ID}[hidden] { display: none !important; height: 0 !important; overflow: hidden !important; }

      /* ── Tab content isolation: prevent editor/sheet bleeding ── */
      #${HOST_ID} > .space-y-5 > section[hidden] {
        display: none !important; height: 0 !important; overflow: hidden !important;
        pointer-events: none; visibility: hidden;
      }

      /* ── Grid & stat cards ── */
      .stepper-google-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:10px; }
      .stepper-google-pill { display:inline-flex; align-items:center; gap:.45rem; border-radius:999px; padding:5px 12px; font-size:11px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; }
      .stepper-google-stat { border-radius:16px; border:1px solid rgba(99,102,241,.12); padding:14px 16px; text-align:center; }
      .stepper-google-badge-row { display:flex; flex-wrap:wrap; gap:.65rem; align-items:center; }

      /* ── Badge buttons ── */
      .stepper-google-badge-btn { border-radius:999px; padding:.6rem .95rem; font-weight:900; letter-spacing:.08em; text-transform:uppercase; border:1px solid transparent; transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease; }
      .stepper-google-badge-btn:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(0,0,0,.12); }
      .stepper-google-badge-btn[data-tone="bronze"] { background:#f7eadf; color:#8a4b25; border-color:#e4c4ad; }
      .stepper-google-badge-btn[data-tone="silver"] { background:#eef2f7; color:#4b5563; border-color:#d5dbe4; }
      .stepper-google-badge-btn[data-tone="gold"] { background:#fff3c4; color:#8a5800; border-color:#f1d36a; }
      .dark .stepper-google-badge-btn[data-tone="bronze"] { background:rgba(180,83,9,.16); color:#fed7aa; border-color:rgba(251,146,60,.28); }
      .dark .stepper-google-badge-btn[data-tone="silver"] { background:rgba(148,163,184,.12); color:#e5e7eb; border-color:rgba(148,163,184,.25); }
      .dark .stepper-google-badge-btn[data-tone="gold"] { background:rgba(250,204,21,.16); color:#fde68a; border-color:rgba(250,204,21,.3); }

      /* ── Form inputs ── */
      .stepper-google-input { width:100%; border-radius:14px; border:1px solid rgba(148,163,184,.22); padding:.85rem 1rem; background:transparent; transition:border-color .2s ease, box-shadow .2s ease; }
      .stepper-google-input:focus { border-color:rgba(99,102,241,.45); box-shadow:0 0 0 3px rgba(99,102,241,.12); }

      /* ── CTA buttons ── */
      .stepper-google-cta { display:inline-flex; align-items:center; justify-content:center; gap:.55rem; border-radius:14px; padding:10px 18px; font-weight:800; font-size:13px; border:1px solid rgba(99,102,241,.14); cursor:pointer; transition:transform .15s ease, box-shadow .2s ease, background .15s ease; }
      .stepper-google-cta:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(0,0,0,.10); }
      .stepper-google-cta:active { transform:scale(.97); }
      .stepper-google-danger { border-color:rgba(239,68,68,.18); }
      .stepper-google-danger:hover { background:rgba(239,68,68,.06) !important; }

      /* ── Member & list items ── */
      .stepper-google-muted-list { display:grid; gap:.85rem; }
      .stepper-google-member-item { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
      .stepper-google-google-btn > div { display:flex; justify-content:center; }

      /* ── Extra tabs ── */
      .stepper-extra-tab { min-width: 108px; justify-content:center; font-weight:900; border-radius:12px !important; transition: background .2s ease, color .2s ease; }
      .dark .stepper-extra-tab { color:#f5f5f5 !important; }
      .stepper-extra-tab-icon svg { width:18px; height:18px; }

      /* ── Floating hosts ── */
      #stepper-site-helper-host, #stepper-community-glossary-host { max-width: calc(100vw - 24px); }

      /* ── Archive styles ── */
      .stepper-cloud-archived { opacity:.45; filter:grayscale(.5); order: 999; transition: opacity .25s ease, filter .25s ease; }
      .stepper-cloud-archived:hover { opacity:.7; filter:grayscale(.2); }

      /* ── Responsive ── */
      @media (max-width: 980px) {
        .stepper-extra-tab { min-width: 94px; }
      }
      @media (max-width: 640px) {
        .stepper-extra-tab { min-width: 88px; }
        .stepper-google-badge-row { gap: .4rem; }
      }
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

    /* ── New feature tabs ── */
    var friendsIcon = (window.__stepperFriendsTab && window.__stepperFriendsTab.icon) ? window.__stepperFriendsTab.icon() : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
    state.ui.friendsBtn = makeTabButton('Friends', friendsIcon, 'friends', FRIENDS_TAB_ID);
    if (!state.ui.friendsBtn.parentNode) {
      if (state.ui.signInBtn && state.ui.signInBtn.parentNode === tabStrip) state.ui.signInBtn.insertAdjacentElement('beforebegin', state.ui.friendsBtn);
      else tabStrip.appendChild(state.ui.friendsBtn);
    }

    var glossaryIcon = (window.__stepperGlossaryTab && window.__stepperGlossaryTab.icon) ? window.__stepperGlossaryTab.icon() : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
    state.ui.glossaryBtn = makeTabButton('Glossary', glossaryIcon, 'glossary', GLOSSARY_TAB_ID);
    if (!state.ui.glossaryBtn.parentNode) {
      if (state.ui.friendsBtn && state.ui.friendsBtn.parentNode === tabStrip) state.ui.friendsBtn.insertAdjacentElement('beforebegin', state.ui.glossaryBtn);
      else tabStrip.appendChild(state.ui.glossaryBtn);
    }

    var pdfIcon = (window.__stepperPdfTab && window.__stepperPdfTab.icon) ? window.__stepperPdfTab.icon() : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
    state.ui.pdfBtn = makeTabButton('PDF Import', pdfIcon, 'pdfimport', PDF_TAB_ID);
    if (!state.ui.pdfBtn.parentNode) {
      if (state.ui.glossaryBtn && state.ui.glossaryBtn.parentNode === tabStrip) state.ui.glossaryBtn.insertAdjacentElement('beforebegin', state.ui.pdfBtn);
      else tabStrip.appendChild(state.ui.pdfBtn);
    }

    var settingsIcon = (window.__stepperSettingsTab && window.__stepperSettingsTab.icon) ? window.__stepperSettingsTab.icon() : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/></svg>';
    state.ui.settingsBtn = makeTabButton('Settings', settingsIcon, 'settings', SETTINGS_TAB_ID);
    if (!state.ui.settingsBtn.parentNode) {
      if (state.ui.pdfBtn && state.ui.pdfBtn.parentNode === tabStrip) state.ui.pdfBtn.insertAdjacentElement('beforebegin', state.ui.settingsBtn);
      else tabStrip.appendChild(state.ui.settingsBtn);
    }

    var musicIcon = (window.__stepperMusicTab && window.__stepperMusicTab.icon) ? window.__stepperMusicTab.icon() : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    state.ui.musicBtn = makeTabButton('Music', musicIcon, 'music', MUSIC_TAB_ID);
    if (!state.ui.musicBtn.parentNode) {
      if (state.ui.settingsBtn && state.ui.settingsBtn.parentNode === tabStrip) state.ui.settingsBtn.insertAdjacentElement('beforebegin', state.ui.musicBtn);
      else tabStrip.appendChild(state.ui.musicBtn);
    }

    var templatesIcon = (window.__stepperTemplatesTab && window.__stepperTemplatesTab.icon) ? window.__stepperTemplatesTab.icon() : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>';
    state.ui.templatesBtn = makeTabButton('Templates', templatesIcon, 'templates', TEMPLATES_TAB_ID);
    if (!state.ui.templatesBtn.parentNode) {
      if (state.ui.musicBtn && state.ui.musicBtn.parentNode === tabStrip) state.ui.musicBtn.insertAdjacentElement('beforebegin', state.ui.templatesBtn);
      else tabStrip.appendChild(state.ui.templatesBtn);
    }

    var notificationsIcon = (window.__stepperNotificationsTab && window.__stepperNotificationsTab.icon) ? window.__stepperNotificationsTab.icon() : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
    state.ui.notificationsBtn = makeTabButton('Notifications', notificationsIcon, 'notifications', NOTIFICATIONS_TAB_ID);
    if (!state.ui.notificationsBtn.parentNode) {
      if (state.ui.friendsBtn && state.ui.friendsBtn.parentNode === tabStrip) state.ui.friendsBtn.insertAdjacentElement('afterend', state.ui.notificationsBtn);
      else tabStrip.appendChild(state.ui.notificationsBtn);
    }

    var tipsIcon = (window.__stepperTipsTab && window.__stepperTipsTab.icon) ? window.__stepperTipsTab.icon() : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
    state.ui.tipsBtn = makeTabButton('Tips', tipsIcon, 'tips', TIPS_TAB_ID);
    if (!state.ui.tipsBtn.parentNode) {
      if (state.ui.musicBtn && state.ui.musicBtn.parentNode === tabStrip) state.ui.musicBtn.insertAdjacentElement('afterend', state.ui.tipsBtn);
      else tabStrip.appendChild(state.ui.tipsBtn);
    }

    if (!tabStrip.__stepperGoogleAdminCloseWired) {
      tabStrip.__stepperGoogleAdminCloseWired = true;
      tabStrip.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const own = button.id === SIGNIN_TAB_ID || button.id === SUBSCRIPTION_TAB_ID || button.id === ADMIN_TAB_ID || button.id === FRIENDS_TAB_ID || button.id === GLOSSARY_TAB_ID || button.id === PDF_TAB_ID || button.id === SETTINGS_TAB_ID || button.id === MUSIC_TAB_ID || button.id === TEMPLATES_TAB_ID || button.id === NOTIFICATIONS_TAB_ID || button.id === TIPS_TAB_ID;
        if (!own && state.activePage) closePages();
      }, true);
    }

    stabilizeTabStrip();
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
    host.innerHTML = `<div class="space-y-5"><section id="${SIGNIN_PAGE_ID}" hidden style="display:none"></section><section id="${SUBSCRIPTION_PAGE_ID}" hidden style="display:none"></section><section id="${ADMIN_PAGE_ID}" hidden style="display:none"></section><section id="${FRIENDS_PAGE_ID}" hidden style="display:none"></section><section id="${GLOSSARY_PAGE_ID}" hidden style="display:none"></section><section id="${PDF_PAGE_ID}" hidden style="display:none"></section><section id="${SETTINGS_PAGE_ID}" hidden style="display:none"></section><section id="${MUSIC_PAGE_ID}" hidden style="display:none"></section><section id="${TEMPLATES_PAGE_ID}" hidden style="display:none"></section><section id="${NOTIFICATIONS_PAGE_ID}" hidden style="display:none"></section><section id="${TIPS_PAGE_ID}" hidden style="display:none"></section></div>`;
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

  try {
    window.__stepperIsDedicatedPageOpen = function () {
      return !!state.activePage;
    };
  } catch (e) { /* noop */ }

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
    syncBrowserPathForActivePage();
    updateTabButtons();
  }

  function openPage(pageName){
    var validPages = { admin: 1, subscription: 1, signin: 1, friends: 1, glossary: 1, pdfimport: 1, settings: 1, music: 1, templates: 1, notifications: 1, tips: 1 };
    state.activePage = validPages[pageName] ? pageName : 'signin';
    const host = ensureHost();
    host.hidden = false;
    host.style.display = '';
    hideNativeExtraHost();
    if (state.ui.mainEl) state.ui.mainEl.style.display = 'none';
    if (state.ui.footerWrap) state.ui.footerWrap.style.display = 'none';
    syncBrowserPathForActivePage();
    renderPages(true);
    updateTabButtons();
    refreshLiveQueues().then(() => {
      if (state.activePage) scheduleRenderPages(2000);
    }).catch(() => {});
  }

  function pathToExtraPage(pathname){
    const clean = String(pathname || '/').replace(/\/+$/, '') || '/';
    const entries = Object.entries(EXTRA_PAGE_PATHS);
    for (let i = 0; i < entries.length; i++) {
      if (entries[i][1] === clean) return entries[i][0];
    }
    return null;
  }

  function syncBrowserPathForActivePage(){
    const target = state.activePage ? (EXTRA_PAGE_PATHS[state.activePage] || '/') : '/';
    const current = String(location.pathname || '/').replace(/\/+$/, '') || '/';
    if (target === current) return;
    try { history.pushState({ stepperPage: state.activePage || null }, '', target + location.search + location.hash); } catch (e) { /* ignore */ }
  }

  function openPageFromCurrentPathIfNeeded(){
    const page = pathToExtraPage(location.pathname);
    if (!page) return;
    openPage(page);
  }

  function installPathRouting(){
    if (window.__stepperExtraPathRoutingInstalled) return;
    window.__stepperExtraPathRoutingInstalled = true;
    window.addEventListener('popstate', function () {
      const page = pathToExtraPage(location.pathname);
      if (page) openPage(page);
      else closePages();
    });
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
        const protectedAuthPath = /^\/api\/auth(\/|$)/.test(String(path || ''));
        if (protectedAuthPath) {
          clearSession();
          renderPages();
        }
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
        displayName: data.displayName || '',
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
        displayName: data.displayName || '',
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
      /* ── Prompt for username if not set ── */
      if (!state.session.displayName) {
        openPage('signin');
      }
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
    state.savedDancesUiSignature = '';
    renderPages();
    void refreshCloudSaves().then(() => { state.savedDancesUiSignature = ''; renderPages(); }).catch(() => {});
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
      state.savedDancesUiSignature = '';
      renderPages();
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
      playDecisionSound('deny');
      await refreshSubmissions();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not reject that request.');
    }
  }

  async function approveSiteSubmission(submissionId){
    try {
      await authFetch(`/api/admin/submissions/${encodeURIComponent(submissionId)}/approve-site`, { method: 'POST' });
      playDecisionSound('approve');
      await refreshSubmissions();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not approve that upload.');
    }
  }

  async function deleteSubmissionRequest(submissionId){
    if (!window.confirm('Delete this request from the queue?')) return;
    try {
      await authFetch(`/api/admin/submissions/${encodeURIComponent(submissionId)}/reject`, { method: 'POST' });
      playDecisionSound('deny');
      await refreshSubmissions();
      renderPages();
    } catch (error) {
      alert(error.message || 'Could not delete that request.');
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
    host.style.right = '88px'; /* offset right to avoid overlapping the 64px chat bubble at right:12px */
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

  async function requestGlossaryEditSuggestion(payload){
    const originalName = String(payload && payload.originalName || '').trim();
    const approvedList = Array.isArray(state.glossaryApproved) ? state.glossaryApproved : [];
    const existing = approvedList.find((item) => String(item && item.id || '').trim() === String(payload && payload.originalStepId || '').trim())
      || approvedList.find((item) => String(item && item.name || '').trim().toLowerCase() === originalName.toLowerCase());
    const merged = {
      ...(payload || {}),
      requestType: 'edit',
      originalStepId: String(payload && payload.originalStepId || (existing && existing.id) || '').trim(),
      originalName: originalName || String(existing && existing.name || '').trim(),
      originalDescription: String(payload && payload.originalDescription || (existing && existing.description) || '').trim(),
      originalCounts: String(payload && payload.originalCounts || (existing && existing.counts) || '').trim(),
      originalFoot: String(payload && payload.originalFoot || (existing && existing.foot) || '').trim(),
      originalTags: String(payload && payload.originalTags || (existing && existing.tags) || '').trim()
    };
    if (!merged.originalName) {
      alert('The original glossary step could not be matched yet. Open Glossary+ once so the latest glossary list loads, then try again.');
      return false;
    }
    return requestGlossaryStep(merged);
  }

  async function decideGlossaryRequest(id, decision){
    const note = window.prompt(decision === 'approve' ? 'Optional approval note for this glossary step:' : 'Why are you declining this glossary step?', '');
    try {
      await authFetch(`/api/admin/glossary-requests/${encodeURIComponent(id)}/${decision}`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ note: note || '' })
      });
      playDecisionSound(decision === 'approve' ? 'approve' : 'deny');
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
      document.body.appendChild(host);
    }
    placeFloatingHost(host, 'left');
    if (state.activePage) {
      host.style.display = 'none';
      host.innerHTML = '';
      return;
    }
    host.style.display = '';
    if (!state.communityGlossaryOpen) {
      host.innerHTML = `<button type="button" data-open-community-glossary="1" style="border:1px solid rgba(99,102,241,.18);background:#fff;color:#111827;padding:.8rem 1rem;border-radius:999px;font-weight:900;box-shadow:0 12px 30px rgba(0,0,0,.14);">Glossary+</button>`;
      const btn = host.querySelector('[data-open-community-glossary="1"]');
      if (btn) btn.addEventListener('click', ()=>{ if (isCompactViewport()) state.chatOpen = false; state.communityGlossaryOpen = true; renderSiteHelper(); renderCommunityGlossary(); });
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
    if (!text) return 'Ask about saving, featuring, premium, moderators, dance steps, or which tab to use.';
    /* ── Try the enhanced brain first ── */
    if (window.__stepperHelperBrain && window.__stepperHelperBrain.findLocalAnswer) {
      const richCtx = window.__stepperHelperBrain.gatherRichContext ? window.__stepperHelperBrain.gatherRichContext() : {};
      richCtx.signedIn = !!(state.session && state.session.credential);
      richCtx.isPremium = isPremiumSession();
      richCtx.currentTab = state.activePage || 'main';
      const brainAnswer = window.__stepperHelperBrain.findLocalAnswer(prompt, richCtx);
      if (brainAnswer) return brainAnswer;
    }
    /* ── Legacy fallback patterns ── */
    if (text.includes('save') || text.includes('changes')) return state.session && state.session.credential ? 'Use Save Changes in My Saved Dances to lock the newest version into your Google-linked cloud save. Your latest signed-in dance also auto-syncs in the background.' : 'Open My Saved Dances and use Save Changes there. Sign in with Google first if you want that save to follow you onto other devices.';
    if (text.includes('premium') || text.includes('subscription') || text.includes('pay')) return 'Open Subscription after signing in. Premium is NZ$12.50 monthly or NZ$100 yearly and gets priority review plus the paid site helper.';
    if (text.includes('feature') || text.includes('badge') || text.includes('bronze') || text.includes('silver') || text.includes('gold')) return 'Use Send to host for featuring. Premium requests go to the top of the admin queue, and the admin can approve them with Bronze, Silver, or Gold for Featured Choreo. Removing a feature takes it back off that public page.';
    if (text.includes('upload') || text.includes('site')) return 'Use Upload to site to send your dance into the admin moderation queue. The admin can approve it for the site or delete it.';
    if (text.includes('signin') || text.includes('google') || text.includes('sign in')) return 'Open the Sign In tab and use Sign in with Google. Once signed in, your dances can sync to the backend and the admin tab appears only for the admin email.';
    if (text.includes('moderator')) return 'Open Sign In and use Apply for moderator. You need a Google account first. Approved moderators get moderator tools but not the Admin tab.';
    if (text.includes('glossary') || text.includes('step request')) return 'Use the Community Glossary button while building to apply admin-approved custom steps. Signed-in members can request new glossary steps from the Sign In tab, and Admin reviews them under Requested dance steps.';
    if (text.includes('judge') || text.includes('flow')) return 'Open Sign In and use AI Dance Judge. It can score flowability, suggest tidy-ups, propose glossary-style step additions, and generate counts for the current worksheet.';
    if (text.includes('count')) return 'Open Sign In and use Generate counts in the AI dance panel. It fills worksheet step counts and updates the dance count total for you.';
    if (text.includes('tab') || text.includes('where') || text.includes('go')) return 'Use Build to make or edit a dance, Sheet for the clean sheet view, My Saved Dances for your cloud saves, Featured Choreo for public featured dances, Sign In for Google saving, Friends for collaboration, Glossary for step lookup, PDF Import for stepsheet imports, Music for BPM tools, Templates for starter dances, and Settings for app customization.';
    return 'I can help you find things on the site and answer questions! Try asking "where do I find…" or "go to [tab name]". 💡 **Upgrade to Premium** for the AI assistant that can build dances, add steps, and take actions for you.';
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
    const brain = window.__stepperHelperBrain;

    /* ── Try local worksheet-build handler first ── */
    const localHandled = tryHandleSiteHelperLocally(prompt);
    if (localHandled && localHandled.handled) {
      state.chatMessages.push({ role:'assistant', text: localHandled.message || 'Done.' });
      state.chatBusy = false;
      if (brain && brain.saveChatHistory) brain.saveChatHistory(state.chatMessages);
      renderCommunityGlossary();
      state._helperSignature = '';
      renderSiteHelper();
      return;
    }

    /* ── Try page action commands (navigate, dark mode, save, etc.) ── */
    const actionResult = tryHelperPageAction(prompt);
    if (actionResult && actionResult.handled) {
      state.chatMessages.push({ role:'assistant', text: actionResult.message || 'Done.' });
      state.chatBusy = false;
      if (brain && brain.saveChatHistory) brain.saveChatHistory(state.chatMessages);
      state._helperSignature = '';
      renderSiteHelper();
      return;
    }

    /* ── Try enhanced brain local knowledge base (free for all users) ── */
    if (brain && brain.findLocalAnswer) {
      const richCtx = brain.gatherRichContext ? brain.gatherRichContext() : {};
      richCtx.signedIn = !!(state.session && state.session.credential);
      richCtx.isPremium = isPremiumSession();
      richCtx.currentTab = state.activePage || 'main';
      const localAnswer = brain.findLocalAnswer(prompt, richCtx);
      if (localAnswer) {
        state.chatMessages.push({ role:'assistant', text: localAnswer });
        state.chatBusy = false;
        if (brain.saveChatHistory) brain.saveChatHistory(state.chatMessages);
        renderSiteHelper();
        return;
      }
    }

    /* ── For non-premium users without a local answer, try legacy local help ── */
    if (!isPremiumSession()) {
      const fallback = localSiteHelp(prompt);
      state.chatMessages.push({ role:'assistant', text: fallback });
      state.chatBusy = false;
      if (brain && brain.saveChatHistory) brain.saveChatHistory(state.chatMessages);
      renderSiteHelper();
      return;
    }

    /* ── Premium path: call backend AI with enriched context ── */
    state.chatBusy = true;
    renderSiteHelper();
    const currentTab = state.activePage || 'main';
    const appData = readAppData();
    const sections = (appData && Array.isArray(appData.sections)) ? appData.sections : [];
    const totalSteps = sections.reduce(function (sum, sec) { return sum + (Array.isArray(sec.steps) ? sec.steps.length : 0); }, 0);
    const meta = (appData && appData.meta) || {};
    const payload = {
      prompt,
      history: (state.chatMessages || []).slice(-12).map(message => ({ role: message.role, text: message.text })),
      context: {
        currentTab,
        signedIn: !!(state.session && state.session.credential),
        isAdmin: isAdminSession(),
        isPremium: isPremiumSession(),
        onlineCount: (state.presence && state.presence.onlineCount) || 0,
        currentDanceTitle: meta.title ? String(meta.title).trim() : '',
        currentDanceCounts: meta.counts ? String(meta.counts).trim() : '',
        currentDanceWalls: meta.walls ? String(meta.walls).trim() : '',
        currentDanceType: meta.type ? String(meta.type).trim() : '',
        currentDanceLevel: meta.level ? String(meta.level).trim() : '',
        sectionCount: sections.length,
        totalSteps: totalSteps,
        hasUnsavedChanges: !!(brain && brain.gatherRichContext && brain.gatherRichContext().hasUnsavedChanges),
        isPhrased: !!(appData && appData.phrased),
        glossaryCount: (state.glossaryApproved || []).length,
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
            system: 'You are the Step By Stepper site helper. Answer briefly and practically. Explain which tab or button to use. Mention Build, Sheet, Sign In, My Saved Dances, Featured Choreo, Save Changes, Send to host for featuring, and Upload to site when useful. Never invent hidden features. If asked about dance terminology, explain the step clearly with counts and foot directions.',
            prompt: `Current tab: ${currentTab}\nSigned in: ${payload.context.signedIn ? 'yes' : 'no'}\nAdmin: ${payload.context.isAdmin ? 'yes' : 'no'}\nDance: ${payload.context.currentDanceTitle || 'none'} (${totalSteps} steps, ${sections.length} sections)\nQuestion: ${prompt}`
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
      if (brain && brain.saveChatHistory) brain.saveChatHistory(state.chatMessages);
      renderSiteHelper();
    }
  }

  function getSiteHelperTopOffset(){
    return `${getHelperDockTopPx()}px`;
  }

  function ensureSiteHelperHost(){
    let host = document.getElementById('stepper-site-helper-host');
    if (host) return host;
    host = document.createElement('div');
    host.id = 'stepper-site-helper-host';
    document.body.appendChild(host);
    return host;
  }

  function _buildHelperSignature(){
    return JSON.stringify([
      state.chatOpen,
      state.chatBusy,
      state.chatMessages.length,
      state.chatMessages.length ? state.chatMessages[state.chatMessages.length - 1].text : '',
      state.chatPending ? state.chatPending.type : '',
      isPremiumSession() ? 1 : 0
    ]);
  }

  function renderSiteHelper(){
    /* ── Skip render when the user is typing ── */
    const activeInput = document.activeElement;
    if (state.chatOpen && activeInput && activeInput.matches && activeInput.matches('[data-chat-input="1"]')) return;
    /* ── Skip render when nothing changed (prevents constant re-renders from interval) ── */
    var sig = _buildHelperSignature();
    if (sig === state._helperSignature) return;
    state._helperSignature = sig;
    const host = ensureSiteHelperHost();
    placeFloatingHost(host, 'right');
    const brain = window.__stepperHelperBrain;
    if (brain && brain.injectHelperStyles) brain.injectHelperStyles();

    /* ── Set up delegated event handler once ── */
    _ensureHelperDelegation(host);

    /* ── Restore persisted chat history on first open ── */
    if (brain && !state._chatHistoryRestored) {
      state._chatHistoryRestored = true;
      const saved = brain.loadChatHistory();
      if (saved.length && !state.chatMessages.length) state.chatMessages = saved;
    }

    /* ── Closed state: floating button with pulse ── */
    if (!state.chatOpen) {
      const isNew = !(brain && brain.hasCompletedOnboarding && brain.hasCompletedOnboarding());
      host.innerHTML = `<button type="button" data-chat-open="1" aria-label="Open site helper" style="border:none;background:#4f46e5;color:#fff;width:58px;height:58px;border-radius:999px;font-size:26px;box-shadow:0 12px 30px rgba(0,0,0,.18);position:relative;transition:transform .15s;cursor:pointer;"${isNew ? ' title="Click for help!"' : ''}>💬${isNew ? '<span style="position:absolute;top:-2px;right:-2px;width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid #fff;"></span>' : ''}</button>`;
      return;
    }

    /* ── Gather context for suggestions ── */
    const richCtx = (brain && brain.gatherRichContext) ? brain.gatherRichContext() : {};
    richCtx.signedIn = !!(state.session && state.session.credential);
    richCtx.isPremium = isPremiumSession();
    richCtx.currentTab = state.activePage || 'main';

    /* ── Build message HTML with markdown + feedback ── */
    const renderMd = (brain && brain.renderMarkdown) ? brain.renderMarkdown : escapeHtml;
    const msgs = state.chatMessages.length ? state.chatMessages.slice(-15) : [];
    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');

    let messagesHtml = '';
    if (!msgs.length) {
      messagesHtml = `<div class="stepper-helper-empty" style="font-size:13px;color:#6b7280;background:#ffffff;border:1px dashed rgba(99,102,241,.18);padding:.9rem 1rem;border-radius:16px;line-height:1.5;">
        <strong>Hi! I'm your dance helper.</strong> I can answer questions about:
        <ul style="margin:.4rem 0 0;padding-left:1.1rem;"><li>Creating & editing dances</li><li>Saving, syncing & exporting</li><li>Featured Choreo & badges</li><li>Line dance step terminology</li><li>PDF import & AI tools</li><li>Troubleshooting & tips</li></ul></div>`;
    } else {
      messagesHtml = msgs.map(function (msg, idx) {
        const isUser = msg.role === 'user';
        const globalIdx = state.chatMessages.length - msgs.length + idx;
        const content = isUser ? escapeHtml(msg.text) : renderMd(msg.text);
        const feedbackHtml = !isUser ? `<div class="stepper-helper-feedback"><button class="stepper-helper-fb-btn" data-fb-idx="${globalIdx}" data-fb-val="up" title="Helpful">👍</button><button class="stepper-helper-fb-btn" data-fb-idx="${globalIdx}" data-fb-val="down" title="Not helpful">👎</button></div>` : '';
        return `<div class="stepper-helper-msg ${isUser ? 'stepper-helper-msg-user' : 'stepper-helper-msg-assistant'}" style="align-self:${isUser ? 'flex-end' : 'stretch'};max-width:${isUser ? '85%' : '100%'};background:${isUser ? '#4f46e5' : '#ffffff'};color:${isUser ? '#ffffff' : '#111827'};border:1px solid rgba(79,70,229,.12);padding:.75rem .85rem;border-radius:${isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};font-size:14px;line-height:1.5;box-shadow:0 4px 16px rgba(0,0,0,.06);word-break:break-word;">${content}${feedbackHtml}</div>`;
      }).join('');
    }

    /* ── Typing indicator ── */
    const typingHtml = state.chatBusy
      ? `<div class="stepper-helper-msg" style="align-self:stretch;background:#ffffff;border:1px solid rgba(79,70,229,.12);padding:.65rem .85rem;border-radius:18px 18px 18px 4px;box-shadow:0 4px 16px rgba(0,0,0,.06);">${(brain && brain.typingIndicatorHtml) ? brain.typingIndicatorHtml() : '<span style="color:#6b7280;font-size:13px;">Thinking…</span>'}</div>`
      : '';

    /* ── Quick-action suggestion chips ── */
    const suggestions = (brain && brain.getQuickSuggestions) ? brain.getQuickSuggestions(richCtx) : [];
    const hasPendingConfirm = !!(state.chatPending && state.chatPending.type === 'worksheet-confirm');
    const confirmBtnsHtml = hasPendingConfirm
      ? `<div data-confirm-actions="1" style="padding:.5rem 1rem 0;display:flex;gap:8px;justify-content:center;"><button type="button" data-helper-approve="1" style="border:none;background:#16a34a;color:#fff;padding:.65rem 1.2rem;border-radius:999px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(22,163,74,.25);transition:background .15s;">✓ Approve</button><button type="button" data-helper-deny="1" style="border:none;background:#dc2626;color:#fff;padding:.65rem 1.2rem;border-radius:999px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(220,38,38,.25);transition:background .15s;">✕ Deny</button></div>`
      : '';
    const chipsHtml = !hasPendingConfirm && suggestions.length && !state.chatBusy
      ? `<div data-chat-chips="1" style="padding:.5rem 1rem 0;display:flex;flex-wrap:wrap;gap:6px;">${suggestions.map(function (s) { return `<button type="button" class="stepper-helper-chip" data-chip-text="${escapeHtml(s)}">${escapeHtml(s)}</button>`; }).join('')}</div>`
      : '';

    /* ── Header with clear chat button ── */
    const clearBtn = state.chatMessages.length
      ? `<button type="button" class="stepper-helper-clear-btn" data-chat-clear="1" title="Clear chat history">Clear</button>`
      : '';

    /* ── Full panel ── */
    host.innerHTML = `<div class="stepper-helper-panel" style="width:min(400px, calc(100vw - 24px));max-width:calc(100vw - 24px);background:#f8fafc;border:1px solid rgba(99,102,241,.16);border-radius:24px;box-shadow:0 18px 48px rgba(0,0,0,.2);overflow:hidden;">
      <div class="stepper-helper-header" data-helper-drag-handle="1" style="padding:.85rem 1rem;background:#4f46e5;color:#fff;display:flex;align-items:center;gap:.5rem;cursor:move;user-select:none;-webkit-user-select:none;">
        ${HELPER_SQUIRCLE_ICON}
        <div style="font-weight:900;flex:1;">Site Helper${isPremiumSession() ? ' <span style="font-size:11px;background:rgba(255,255,255,.22);padding:2px 8px;border-radius:999px;margin-left:4px;">PRO</span>' : ''}</div>
        ${clearBtn}
        <button type="button" data-chat-close="1" style="border:none;background:rgba(255,255,255,.18);color:#fff;border-radius:999px;padding:.3rem .6rem;font-weight:900;cursor:pointer;transition:background .15s;" title="Close">✕</button>
      </div>
      <div data-chat-messages="1" style="padding:.85rem;display:flex;flex-direction:column;gap:.6rem;max-height:min(50vh, 380px);overflow:auto;overscroll-behavior:contain;scroll-behavior:smooth;">
        ${messagesHtml}${typingHtml}
      </div>
      ${chipsHtml}
      ${confirmBtnsHtml}
      <form data-chat-form="1" style="padding:.6rem 1rem .85rem;display:flex;gap:.5rem;align-items:center;">
        <input data-chat-input="1" type="text" autocomplete="off" autocapitalize="sentences" spellcheck="true" placeholder="${isPremiumSession() ? 'Ask me anything about the site…' : (state.session && state.session.credential ? 'Upgrade to Premium for AI chat' : 'Ask a question…')}" value="${escapeHtml(state.chatDraft || '')}" style="flex:1 1 200px;border:1px solid rgba(99,102,241,.18);border-radius:999px;padding:.8rem 1rem;background:#fff;font-size:15px;min-width:0;transition:border-color .15s;" />
        <button type="submit" style="border:none;background:#4f46e5;color:#fff;border-radius:999px;padding:.8rem 1rem;font-weight:900;white-space:nowrap;cursor:pointer;transition:background .15s;">Send</button>
      </form>
    </div>`;

    /* ── Auto-scroll to bottom ── */
    const list = host.querySelector('[data-chat-messages="1"]');
    if (list) list.scrollTop = list.scrollHeight;
  }

  function _ensureHelperDelegation(host) {
    if (host._stepperDelegated) return;
    host._stepperDelegated = true;
    host.addEventListener('click', function (e) {
      const target = e.target.closest ? e.target.closest('[data-chat-open="1"],[data-chat-close="1"],[data-chat-clear="1"],[data-chip-text],[data-fb-idx],[data-helper-approve="1"],[data-helper-deny="1"]') : null;
      if (!target) return;
      if (target.hasAttribute('data-helper-approve')) {
        state.chatMessages.push({ role:'user', text: 'Approve' });
        const brain2 = window.__stepperHelperBrain;
        if (brain2 && brain2.saveChatHistory) brain2.saveChatHistory(state.chatMessages);
        renderSiteHelper();
        askSiteHelper('approve');
        return;
      }
      if (target.hasAttribute('data-helper-deny')) {
        state.chatMessages.push({ role:'user', text: 'Deny' });
        const brain2 = window.__stepperHelperBrain;
        if (brain2 && brain2.saveChatHistory) brain2.saveChatHistory(state.chatMessages);
        renderSiteHelper();
        askSiteHelper('deny');
        return;
      }
      if (target.hasAttribute('data-chat-open')) {
        if (isCompactViewport()) state.communityGlossaryOpen = false;
        state.chatOpen = true;
        const brain2 = window.__stepperHelperBrain;
        if (brain2 && brain2.getOnboardingMessage) {
          const welcome = brain2.getOnboardingMessage({});
          if (welcome) state.chatMessages.unshift(welcome);
        }
        renderCommunityGlossary(); renderSiteHelper();
      } else if (target.hasAttribute('data-chat-close')) {
        state.chatOpen = false;
        const brain2 = window.__stepperHelperBrain;
        if (brain2 && brain2.saveChatHistory) brain2.saveChatHistory(state.chatMessages);
        renderSiteHelper();
      } else if (target.hasAttribute('data-chat-clear')) {
        state.chatMessages = [];
        state.chatDraft = '';
        const brain2 = window.__stepperHelperBrain;
        if (brain2 && brain2.clearChatHistory) brain2.clearChatHistory();
        renderSiteHelper();
      } else if (target.hasAttribute('data-chip-text')) {
        const chipText = target.getAttribute('data-chip-text');
        if (!chipText) return;
        state.chatMessages.push({ role:'user', text: chipText });
        state.chatDraft = '';
        const brain2 = window.__stepperHelperBrain;
        if (brain2 && brain2.saveChatHistory) brain2.saveChatHistory(state.chatMessages);
        renderSiteHelper();
        askSiteHelper(chipText);
      } else if (target.hasAttribute('data-fb-idx')) {
        const idx = parseInt(target.getAttribute('data-fb-idx'), 10);
        const val = target.getAttribute('data-fb-val');
        const brain2 = window.__stepperHelperBrain;
        if (brain2 && brain2.saveFeedback) brain2.saveFeedback(idx, val);
        target.classList.add('voted');
        target.style.opacity = '1';
        const parent = target.parentElement;
        if (parent) {
          const siblings = parent.querySelectorAll('.stepper-helper-fb-btn');
          for (let s = 0; s < siblings.length; s++) {
            if (siblings[s] !== target) { siblings[s].style.opacity = '.2'; siblings[s].style.pointerEvents = 'none'; }
          }
        }
      }
    });
    host.addEventListener('submit', function (e) {
      const form = e.target.closest ? e.target.closest('[data-chat-form="1"]') : null;
      if (!form) return;
      e.preventDefault();
      const value = String(state.chatDraft || '').trim();
      if (!value) return;
      state.chatMessages.push({ role:'user', text:value });
      state.chatDraft = '';
      const brain2 = window.__stepperHelperBrain;
      if (brain2 && brain2.saveChatHistory) brain2.saveChatHistory(state.chatMessages);
      renderSiteHelper();
      askSiteHelper(value);
    });
    host.addEventListener('input', function (e) {
      if (e.target && e.target.matches && e.target.matches('[data-chat-input="1"]')) {
        state.chatDraft = e.target.value;
      }
    });

    /* ── Drag-to-move logic (mouse + touch) ── */
    (function initDrag() {
      var dragging = false;
      var startX = 0, startY = 0, origX = 0, origY = 0;
      var moved = false;

      function pointerDown(clientX, clientY, target) {
        /* Allow drag from the header handle (open panel) or the FAB button (closed state) */
        if (!target || !target.closest) return false;
        var isHandle = target.closest('[data-helper-drag-handle="1"]');
        var isFab = !isHandle && target.closest('[data-chat-open="1"]');
        if (!isHandle && !isFab) return false;
        /* Don't drag when clicking non-FAB buttons inside the header */
        if (isHandle && target.closest('button')) return false;
        var rect = host.getBoundingClientRect();
        startX = clientX;
        startY = clientY;
        origX = rect.left;
        origY = rect.top;
        dragging = true;
        moved = false;
        return true;
      }

      function pointerMove(clientX, clientY) {
        if (!dragging) return;
        var dx = clientX - startX;
        var dy = clientY - startY;
        if (!moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return; /* ignore micro-movements */
        moved = true;
        var newX = Math.max(0, Math.min(window.innerWidth - 60, origX + dx));
        var newY = Math.max(0, Math.min(window.innerHeight - 40, origY + dy));
        host.style.left = newX + 'px';
        host.style.top  = newY + 'px';
        host.style.right  = 'auto';
        host.style.bottom = 'auto';
        _helperDragPos.x = newX;
        _helperDragPos.y = newY;
        _helperDragPos.dragged = true;
      }

      function pointerUp() {
        dragging = false;
      }

      /* Mouse events */
      host.addEventListener('mousedown', function (e) {
        if (pointerDown(e.clientX, e.clientY, e.target)) {
          e.preventDefault();
        }
      });
      document.addEventListener('mousemove', function (e) {
        if (dragging) { e.preventDefault(); pointerMove(e.clientX, e.clientY); }
      });
      document.addEventListener('mouseup', pointerUp);

      /* Touch events */
      host.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        var t = e.touches[0];
        pointerDown(t.clientX, t.clientY, e.target);
      }, { passive: true });
      document.addEventListener('touchmove', function (e) {
        if (!dragging) return;
        var t = e.touches[0];
        if (moved) { e.preventDefault(); }
        pointerMove(t.clientX, t.clientY);
      }, { passive: false });
      document.addEventListener('touchend', pointerUp);

      /* Suppress click after drag to prevent toggling buttons */
      host.addEventListener('click', function (e) {
        if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
      }, true);
    })();
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
    const btnStyle = 'border:1px solid rgba(99,102,241,.18);background:#fff;padding:.75rem 1rem;border-radius:999px;font-weight:900;box-shadow:0 10px 30px rgba(0,0,0,.12);';
    host.innerHTML = '<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;">' +
      '<button type="button" data-quick="invite" style="' + btnStyle + 'background:#7c3aed;color:#fff;">&#x1F57A; Invite friends to current project</button>' +
      '<button type="button" data-quick="feature" style="' + btnStyle + '">Send to host for featuring</button>' +
      '<button type="button" data-quick="site" style="' + btnStyle + '">Upload to site</button>' +
      '</div>';
    host.querySelector('[data-quick="feature"]').addEventListener('click', ()=>requestModeration('feature'));
    host.querySelector('[data-quick="site"]').addEventListener('click', ()=>requestModeration('site'));
    host.querySelector('[data-quick="invite"]').addEventListener('click', ()=>showInviteFriendsOverlay());
  }

  /* ── Invite friends to current project overlay ── */
  function showInviteFriendsOverlay(){
    let overlay = document.getElementById('stepper-invite-friends-overlay');
    if (overlay) { overlay.remove(); }
    overlay = document.createElement('div');
    overlay.id = 'stepper-invite-friends-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);';
    const dark = !!(readAppData() || {}).isDarkMode;
    const bg = dark ? '#1e1e2e' : '#fff';
    const fg = dark ? '#e5e7eb' : '#1f2937';
    const subtle = dark ? '#9ca3af' : '#6b7280';
    const cardBg = dark ? 'background:#262639;border-color:#3f3f5c;color:#e5e7eb;' : 'background:#f9fafb;border-color:#e5e7eb;color:#1f2937;';

    const entry = buildCurrentDanceEntry();
    const danceName = entry ? entry.title : 'Untitled Dance';

    const ft = window.__stepperFriendsTab;
    const friends = ft ? ft.getFriends() : [];

    let inner = '<div style="width:400px;max-width:92vw;max-height:80vh;border-radius:20px;padding:28px;position:relative;background:' + bg + ';color:' + fg + ';box-shadow:0 20px 60px rgba(0,0,0,.25);overflow-y:auto;" onclick="event.stopPropagation();">';
    inner += '<button data-invite-overlay-close style="position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;font-size:20px;color:' + fg + ';opacity:.5;">&times;</button>';
    inner += '<h3 style="font-size:16px;font-weight:900;margin:0 0 4px;">&#x1F57A; Invite Friends</h3>';
    inner += '<p style="font-size:13px;margin:0 0 16px;color:' + subtle + ';">Invite a friend to collaborate on <strong>' + escapeHtml(danceName) + '</strong></p>';

    if (!friends.length) {
      inner += '<div style="text-align:center;padding:24px;">';
      inner += '<p style="font-size:13px;color:' + subtle + ';margin:0 0 12px;">No friends yet. Add friends in the Friends tab first!</p>';
      inner += '<button data-invite-overlay-goto-friends style="background:#4f46e5;color:#fff;border:none;padding:10px 20px;border-radius:999px;font-weight:800;cursor:pointer;">Open Friends Tab</button>';
      inner += '</div>';
    } else {
      inner += '<div style="display:grid;gap:8px;">';
      for (let i = 0; i < friends.length; i++) {
        const f = friends[i];
        const name = f.name || f.email || 'Friend';
        const email = f.email || '';
        const initial = String(name).charAt(0).toUpperCase();
        const colors = ['#4f46e5','#7c3aed','#db2777','#ea580c','#059669','#0891b2','#6366f1'];
        const avatarBg = colors[initial.charCodeAt(0) % colors.length];
        inner += '<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:14px;border:1px solid;' + cardBg + '">';
        inner += '<div style="width:36px;height:36px;border-radius:999px;background:' + avatarBg + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;flex-shrink:0;">' + escapeHtml(initial) + '</div>';
        inner += '<div style="flex:1;min-width:0;">';
        inner += '<div style="font-weight:800;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(name) + '</div>';
        inner += '<div style="font-size:11px;opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(email) + '</div>';
        inner += '</div>';
        inner += '<button data-invite-overlay-send="' + escapeHtml(email) + '" style="background:#7c3aed;color:#fff;border:none;padding:8px 16px;border-radius:999px;font-weight:800;font-size:12px;cursor:pointer;white-space:nowrap;">Send Invite</button>';
        inner += '</div>';
      }
      inner += '</div>';
    }
    inner += '<div id="stepper-invite-overlay-status" style="margin-top:12px;font-size:13px;text-align:center;"></div>';
    inner += '</div>';
    overlay.innerHTML = inner;
    document.body.appendChild(overlay);

    /* Close handlers */
    overlay.addEventListener('click', function(e){ if (e.target === overlay) overlay.remove(); });
    const closeBtn = overlay.querySelector('[data-invite-overlay-close]');
    if (closeBtn) closeBtn.addEventListener('click', function(){ overlay.remove(); });

    /* Go to friends tab */
    const gotoBtn = overlay.querySelector('[data-invite-overlay-goto-friends]');
    if (gotoBtn) gotoBtn.addEventListener('click', function(){ overlay.remove(); openPage('friends'); });

    /* Send invite buttons */
    overlay.querySelectorAll('[data-invite-overlay-send]').forEach(function(btn){
      btn.addEventListener('click', function(){
        const email = btn.getAttribute('data-invite-overlay-send');
        if (!email) return;
        btn.disabled = true;
        btn.textContent = 'Sending…';
        const statusEl = document.getElementById('stepper-invite-overlay-status');

        const danceEntry = buildCurrentDanceEntry();
        if (!danceEntry) {
          btn.textContent = 'No dance';
          return;
        }
        var currentDanceData = null;
        try { currentDanceData = readAppData(); } catch(e){ /* ignore */ }
        authFetch('/api/collaborators/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ danceId: danceEntry.id, email: email, danceData: currentDanceData })
        }).then(function(data){
          if (data && data.ok) {
            btn.textContent = '✓ Sent!';
            btn.style.background = '#059669';
            if (statusEl) statusEl.innerHTML = '<span style="color:#059669;">✅ Invite sent to ' + escapeHtml(email) + '</span>';
          } else {
            btn.textContent = 'Retry';
            btn.disabled = false;
            btn.style.background = '#dc2626';
            if (statusEl) statusEl.innerHTML = '<span style="color:#dc2626;">⚠️ ' + escapeHtml((data && data.error) || 'Failed') + '</span>';
          }
        }).catch(function(){
          btn.textContent = 'Retry';
          btn.disabled = false;
          btn.style.background = '#dc2626';
          if (statusEl) statusEl.innerHTML = '<span style="color:#dc2626;">⚠️ Server might be down.</span>';
        });
      });
    });
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

  function _getDanceGroups(){
    try { return JSON.parse(localStorage.getItem('stepper_dance_groups') || '{}'); } catch { return {}; }
  }
  function _saveDanceGroups(groups){
    try { localStorage.setItem('stepper_dance_groups', JSON.stringify(groups || {})); } catch { /* noop */ }
    state.danceGroups = groups || {};
  }
  function _getDanceGroup(danceId){
    var groups = _getDanceGroups();
    for (var gn in groups) {
      if (Array.isArray(groups[gn]) && groups[gn].indexOf(danceId) !== -1) return gn;
    }
    return '';
  }
  function _getArchivedDances(){
    try { return JSON.parse(localStorage.getItem('stepper_archived_dances') || '[]'); } catch { return []; }
  }
  function _setArchivedDances(list){
    try { localStorage.setItem('stepper_archived_dances', JSON.stringify(list || [])); } catch { /* noop */ }
  }
  function _isDanceArchived(danceId){
    return _getArchivedDances().indexOf(danceId) !== -1;
  }
  function _toggleArchive(danceId){
    var archived = _getArchivedDances();
    var idx = archived.indexOf(danceId);
    if (idx !== -1) archived.splice(idx, 1);
    else archived.push(danceId);
    _setArchivedDances(archived);
    return idx === -1; /* returns true if now archived */
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

    /* ── Group management ── */
    const groups = _getDanceGroups();
    const groupNames = Object.keys(groups);
    const archivedList = _getArchivedDances();
    const archivedCount = signedIn ? state.cloudSaves.filter(function(it){ return archivedList.indexOf(it.id) !== -1; }).length : 0;
    if (typeof state.savedGroupFilter === 'undefined') state.savedGroupFilter = '';
    var folderIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z"/></svg>';
    var archiveIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M10 13h4"/></svg>';
    var groupTiles = ['<button type="button" data-group-filter="" data-selected="' + (state.savedGroupFilter === '' ? 'true' : 'false') + '" class="stepper-saved-group-tile"><span class="stepper-saved-group-icon">' + folderIcon + '</span><span class="stepper-saved-group-copy"><strong>All dances</strong><small>' + escapeHtml(String(state.cloudSaves.length || 0)) + ' items</small></span></button>'];
    groupNames.forEach(function(gn){
      var count = (groups[gn] || []).length;
      groupTiles.push('<button type="button" data-group-filter="' + escapeHtml(gn) + '" data-selected="' + (state.savedGroupFilter === gn ? 'true' : 'false') + '" class="stepper-saved-group-tile"><span class="stepper-saved-group-icon">' + folderIcon + '</span><span class="stepper-saved-group-copy"><strong>' + escapeHtml(gn) + '</strong><small>' + escapeHtml(String(count)) + ' items</small></span></button>');
    });
    if (archivedCount) {
      groupTiles.push('<button type="button" data-group-filter="__archived" data-selected="' + (state.savedGroupFilter === '__archived' ? 'true' : 'false') + '" class="stepper-saved-group-tile"><span class="stepper-saved-group-icon">' + archiveIcon + '</span><span class="stepper-saved-group-copy"><strong>Archived</strong><small>' + escapeHtml(String(archivedCount)) + ' items</small></span></button>');
    }
    const groupFilterHtml = signedIn ? `<div class="stepper-saved-group-shell"><div class="stepper-saved-group-grid">${groupTiles.join('')}</div></div>` : '';

    const cloudCards = signedIn && state.cloudSaves.length ? state.cloudSaves.slice(0, 30).map(item => {
      const itemGroup = _getDanceGroup(item.id);
      const isArchived = archivedList.indexOf(item.id) !== -1;
      const groupOptions = groupNames.map(function(gn){ return '<option value="' + escapeHtml(gn) + '"' + (gn === itemGroup ? ' selected' : '') + '>' + escapeHtml(gn) + '</option>'; }).join('');
      return `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}${isArchived ? ' stepper-cloud-archived' : ''}" data-stepper-cloud-id="${escapeHtml(item.id)}" data-dance-group="${escapeHtml(itemGroup)}" data-archived="${isArchived ? 'true' : 'false'}" style="${isArchived ? 'display:none;' : ''}">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0" style="flex:1 1 200px;">
            <h3 class="text-lg font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}${isArchived ? ' <span style="font-size:11px;opacity:.6;">archived</span>' : ''}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer || 'Uncredited')}${item.country ? ` • ${escapeHtml(item.country)}` : ''}</p>
            <p class="mt-2 text-sm ${theme.subtle}">Updated ${escapeHtml(formatDate(item.updatedAt))}</p>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
            <span class="stepper-google-pill ${theme.orange}">${escapeHtml(item.level || 'Unlabelled')}</span>
            ${groupNames.length ? `<select data-action="set-group" style="font-size:11px;padding:3px 8px;border-radius:999px;border:1px solid rgba(99,102,241,.18);background:transparent;cursor:pointer;"><option value="">No group</option>${groupOptions}</select>` : ''}
            <button type="button" class="stepper-google-cta ${theme.button}" data-action="load-cloud" style="white-space:nowrap;padding:6px 12px;font-size:12px;">Load</button>
            <button type="button" class="stepper-google-cta ${theme.button}" data-action="archive-cloud" style="white-space:nowrap;padding:6px 12px;font-size:12px;opacity:.7;display:inline-flex;align-items:center;gap:6px;" title="${isArchived ? 'Unarchive' : 'Archive'}">${archiveIcon}<span>${isArchived ? 'Restore' : 'Archive'}</span></button>
            <button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="delete-cloud" style="white-space:nowrap;padding:6px 12px;font-size:12px;">✕</button>
          </div>
        </div>
        ${isArchived ? '' : `<div class="mt-4 stepper-google-grid text-sm">
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts || '-')}</div></div>
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls || '-')}</div></div>
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections || 0))}</div></div>
          <div class="stepper-google-stat ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        <div class="mt-4">${buildPreviewSheetHtml(item, theme, 'Save this dance once and the sheet preview will show here.')}</div>`}
      </article>`;
    }).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-black">${signedIn ? 'No cloud saves yet.' : 'Sign in to use cloud saves.'}</p><p class="mt-2 text-sm ${theme.subtle}">${signedIn ? 'Use Save Changes to push the current worksheet into your Google-linked cloud saves. Loading a different dance will replace the current worksheet.' : 'Local saves still work without signing in, but Google cloud saves follow you onto other devices.'}</p></div>`;

    wrap.className = 'space-y-4';
    wrap.innerHTML = `
      <section class="rounded-3xl border p-5 sm:p-6 ${theme.panel}">
        <div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Cloud saves</div><p class="mt-1 text-sm ${theme.subtle}">Load any saved dance straight into the current worksheet. You will get a warning first if the worksheet you are on still has unsaved changes.</p></div>${signedIn ? `<span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.cloudSaves.length))} saved</span>` : ''}</div>
        ${groupFilterHtml}
        <div class="mt-4 space-y-4" data-cloud-cards-list="1">${cloudCards}</div>
      </section>
    `;

    if (!document.getElementById('stepper-saved-group-style')) {
      var gs = document.createElement('style');
      gs.id = 'stepper-saved-group-style';
      gs.textContent = '.stepper-saved-group-shell{margin-top:14px}.stepper-saved-group-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.stepper-saved-group-tile{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:22px;border:1px solid rgba(99,102,241,.2);cursor:pointer;background:rgba(99,102,241,.07);text-align:left;transition:all .18s ease}.stepper-saved-group-tile:hover{transform:translateY(-1px);border-color:rgba(99,102,241,.45)}.stepper-saved-group-tile:active{transform:scale(.985)}.stepper-saved-group-tile[data-selected=\"true\"]{background:rgba(99,102,241,.18);border-color:rgba(99,102,241,.6);box-shadow:0 8px 22px rgba(99,102,241,.17)}.stepper-saved-group-icon{width:36px;height:36px;border-radius:13px;display:inline-flex;align-items:center;justify-content:center;background:rgba(99,102,241,.12);flex-shrink:0}.stepper-saved-group-copy{display:flex;flex-direction:column;min-width:0}.stepper-saved-group-copy strong{font-size:13px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stepper-saved-group-copy small{font-size:11px;opacity:.7;}';
      document.head.appendChild(gs);
    }

    /* ── Group & archive filter buttons ── */
    wrap.querySelectorAll('[data-group-filter]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var gf = btn.getAttribute('data-group-filter') || '';
        state.savedGroupFilter = gf;
        wrap.querySelectorAll('[data-group-filter]').forEach(function(other){
          other.setAttribute('data-selected', (other.getAttribute('data-group-filter') || '') === gf ? 'true' : 'false');
        });
        var cards = wrap.querySelectorAll('[data-stepper-cloud-id]');
        cards.forEach(function(card){
          var cg = card.getAttribute('data-dance-group') || '';
          var isArch = card.getAttribute('data-archived') === 'true';
          if (gf === '__archived') {
            card.style.display = isArch ? '' : 'none';
          } else if (!gf) {
            card.style.display = isArch ? 'none' : '';
          } else {
            card.style.display = (!isArch && cg === gf) ? '' : 'none';
          }
        });
      });
    });
    var initialFilterBtn = null;
    var targetFilter = String(state.savedGroupFilter || '');
    wrap.querySelectorAll('[data-group-filter]').forEach(function(btn){
      if (!initialFilterBtn && String(btn.getAttribute('data-group-filter') || '') === targetFilter) initialFilterBtn = btn;
    });
    if (!initialFilterBtn) initialFilterBtn = wrap.querySelector('[data-group-filter=""]');
    if (initialFilterBtn) initialFilterBtn.click();

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
      /* ── Archive toggle ── */
      const archiveBtn = card.querySelector('[data-action="archive-cloud"]');
      if (archiveBtn) archiveBtn.addEventListener('click', function(){
        var nowArchived = _toggleArchive(saveId);
        state.savedDancesUiSignature = '';
        patchSavedDancesPage(true);
      });
      /* ── Group dropdown ── */
      const groupSelect = card.querySelector('[data-action="set-group"]');
      if (groupSelect) groupSelect.addEventListener('change', function(){
        var newGroup = groupSelect.value;
        var allGroups = _getDanceGroups();
        /* Remove from all groups first */
        for (var gn in allGroups) {
          if (Array.isArray(allGroups[gn])) allGroups[gn] = allGroups[gn].filter(function(id){ return id !== saveId; });
        }
        /* Add to new group */
        if (newGroup && allGroups[newGroup]) {
          allGroups[newGroup].push(saveId);
        }
        _saveDanceGroups(allGroups);
        card.setAttribute('data-dance-group', newGroup || '');
        state.savedDancesUiSignature = '';
      });
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
        : 'Apply for moderator here. A Google account is required first, but invites are optional and anyone can apply after signing in.');

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
          <div class="mx-auto max-w-3xl rounded-3xl border p-5 sm:p-6 ${session.displayName ? theme.soft : theme.accent}" data-stepper-username-section>
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div style="flex:1;min-width:200px;">
                <div class="text-lg font-black tracking-tight">${session.displayName ? 'Your username' : '⚡ Choose a username'}</div>
                ${session.displayName
                  ? `<p class="mt-1 text-sm ${theme.subtle}">Your username is <strong>${escapeHtml(session.displayName)}</strong>. This is the name friends see when you send a request.</p>`
                  : `<p class="mt-2 text-sm ${theme.subtle}">Pick a unique username so friends can recognise you. Usernames must be 2–30 characters and are first-come-first-served.</p>`
                }
                <div class="mt-4 flex flex-wrap gap-3 items-end">
                  <div style="flex:1;min-width:180px;">
                    <input data-stepper-username-input class="stepper-google-input" placeholder="Enter a username…" value="${escapeHtml(session.displayName || '')}" maxlength="30" style="width:100%;" />
                    <div data-stepper-username-status class="mt-1 text-xs ${theme.subtle}" style="min-height:18px;"></div>
                  </div>
                  <button type="button" data-stepper-action="save-username" class="stepper-google-cta ${theme.button}" style="white-space:nowrap;">Save username</button>
                </div>
              </div>
              ${session.displayName ? `<span class="stepper-google-pill ${theme.orange}">@${escapeHtml(session.displayName)}</span>` : ''}
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
                <p class="mt-2 text-sm ${theme.subtle}">Must have a Google account to do so. Sign in first, then send the moderator request from this same page. It is not invite-only anymore.</p>
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

    /* ── Username input: live availability check ── */
    const usernameInput = page.querySelector('[data-stepper-username-input]');
    const usernameStatus = page.querySelector('[data-stepper-username-status]');
    const _usernameDisallowed = /[<>"'&\\\/]/;
    const _validateUsername = (raw) => {
      if (!raw || raw.length < 2) return raw && raw.length === 1 ? 'Must be at least 2 characters.' : '';
      if (raw.length > 30) return 'Must be 30 characters or fewer.';
      if (_usernameDisallowed.test(raw)) return 'Contains disallowed characters.';
      return null;
    };
    let _usernameCheckTimer = null;
    if (usernameInput && usernameStatus) {
      usernameInput.addEventListener('input', () => {
        clearTimeout(_usernameCheckTimer);
        const raw = String(usernameInput.value || '').trim();
        const validationError = _validateUsername(raw);
        if (validationError !== null) { usernameStatus.textContent = validationError; usernameStatus.style.color = ''; return; }
        if (state.session && state.session.displayName && raw === state.session.displayName) { usernameStatus.textContent = 'This is your current username.'; usernameStatus.style.color = ''; return; }
        usernameStatus.textContent = 'Checking…';
        usernameStatus.style.color = '';
        _usernameCheckTimer = setTimeout(async () => {
          try {
            const result = await authFetch('/api/user/check-display-name?name=' + encodeURIComponent(raw));
            if (String(usernameInput.value || '').trim() !== raw) return;
            usernameStatus.textContent = result.available ? '✅ Available!' : '❌ Already taken. Try another.';
            usernameStatus.style.color = result.available ? '#22c55e' : '#ef4444';
          } catch { usernameStatus.textContent = 'Could not check availability.'; usernameStatus.style.color = ''; }
        }, 400);
      });
    }
    const saveUsernameBtn = page.querySelector('[data-stepper-action="save-username"]');
    if (saveUsernameBtn) {
      saveUsernameBtn.addEventListener('click', async () => {
        const raw = String((usernameInput || {}).value || '').trim();
        const validationError = _validateUsername(raw);
        if (validationError) { alert(validationError); return; }
        saveUsernameBtn.disabled = true;
        saveUsernameBtn.textContent = 'Saving…';
        try {
          const result = await authFetch('/api/user/display-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName: raw })
          });
          if (result.ok !== false) {
            if (state.session) { state.session.displayName = result.displayName || raw; saveSession(state.session); }
            renderPages();
          } else {
            alert(result.error || 'Could not save username.');
          }
        } catch (err) {
          alert(err.message || 'Could not save username.');
        } finally {
          saveUsernameBtn.disabled = false;
          saveUsernameBtn.textContent = 'Save username';
        }
      });
    }
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
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-admin-power-tools="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Admin power tools</div><p class="mt-1 text-sm ${theme.subtle}">Live backend totals from the disk-backed database. Anything registered here stays saved until acted on or deleted.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.adminSummary && state.adminSummary.users) || 0))} users</span></div><div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div class="rounded-2xl border p-4 ${theme.soft}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Pending submissions</div><div class="mt-2 text-2xl font-black">${escapeHtml(String((state.adminSummary && state.adminSummary.pendingSubmissions) || 0))}</div></div><div class="rounded-2xl border p-4 ${theme.soft}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Moderator requests</div><div class="mt-2 text-2xl font-black">${escapeHtml(String((state.adminSummary && ((state.adminSummary.pendingApplications || 0) + (state.adminSummary.pendingInvites || 0))) || 0))}</div></div><div class="rounded-2xl border p-4 ${theme.soft}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Active moderators</div><div class="mt-2 text-2xl font-black">${escapeHtml(String((state.adminSummary && state.adminSummary.moderators) || 0))}</div></div><div class="rounded-2xl border p-4 ${theme.soft}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Bars running</div><div class="mt-2 text-2xl font-black">${escapeHtml(String((state.adminSummary && ((state.adminSummary.barred || 0) + (state.adminSummary.pendingBars || 0))) || 0))}</div></div></div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Pending member requests</div><p class="mt-1 text-sm ${theme.subtle}">Approve uploads, reject requests, or feature dances with a badge. This queue refreshes automatically.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.submissions.length))} pending</span></div></div>
        ${pendingCards}
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-moderator-apps="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Moderator applications</div><p class="mt-1 text-sm ${theme.subtle}">People apply from the Sign In tab. Approve or decline them here. This list refreshes automatically.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(state.moderatorApplications.length))} pending</span></div><div class="mt-4 grid gap-3">${state.moderatorApplications.length ? state.moderatorApplications.map(item => `
          <article class="rounded-2xl border p-4 ${theme.soft}" data-stepper-modapp-id="${escapeHtml(item.id)}">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div><div class="text-base font-black">${escapeHtml(item.ownerName || item.ownerEmail || 'Member')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.ownerEmail || '')}</p></div>
              <div class="flex flex-wrap gap-3"><button type="button" class="stepper-google-cta ${theme.button}" data-action="approve-modapp">Approve moderator</button><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="decline-modapp">Decline</button></div>
            </div>
          </article>`).join('') : `<p class="text-sm ${theme.subtle}">No pending moderator applications.</p>`}</div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-active-moderators="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Moderator management</div><p class="mt-1 text-sm ${theme.subtle}">Add moderators by Google email, approve applications, or remove moderators immediately.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String(((state.activeModerators || []).length + (state.pendingModeratorInvites || []).length)))} saved</span></div><div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><input data-add-moderator-email="1" class="stepper-google-input" placeholder="person@gmail.com" /><button type="button" class="stepper-google-cta ${theme.button}" data-action="add-moderator-email">Add moderator from Gmail</button></div><div class="mt-4 grid gap-3">${(state.activeModerators || []).length ? state.activeModerators.map(item => `
          <article class="rounded-2xl border p-4 ${theme.soft}" data-stepper-active-mod-key="${escapeHtml(item.userKey)}">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div><div class="text-base font-black">${escapeHtml(item.name || item.email || 'Moderator')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.email || '')}</p></div>
              <span class="stepper-google-pill ${theme.orange}">Moderator</span>
            </div>
            <div class="mt-4 ${theme.panel} rounded-2xl border p-4"><label class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Removal note</label><textarea data-remove-mod-note="1" class="stepper-google-input mt-3" rows="3" placeholder="Tell them why they were removed as moderator."></textarea></div>
            <div class="mt-4 flex flex-wrap gap-3"><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="remove-moderator">Delete moderator</button></div>
          </article>`).join('') : `<p class="text-sm ${theme.subtle}">No active moderators yet.</p>`}</div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-suspension-management="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Suspend persons</div><p class="mt-1 text-sm ${theme.subtle}">Enter a Google email to bar someone for a set time. Admins cannot be banned.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.suspensions || []).length))} barred</span></div><div class="mt-4 grid gap-3 sm:grid-cols-2"><input data-suspend-email="1" class="stepper-google-input" placeholder="person@gmail.com" /><select data-suspend-duration="1" class="stepper-google-input"><option value="300000">5 minutes</option><option value="1200000">20 minutes</option><option value="3600000">1 hour</option><option value="18000000">5 hours</option><option value="86400000">1 day</option><option value="259200000">3 days</option><option value="604800000">1 week</option><option value="1814400000">3 weeks</option><option value="2592000000">1 month</option><option value="5184000000">2 months</option><option value="31536000000">1 Year</option><option value="157680000000">5 years</option></select></div><div class="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]"><textarea data-suspend-reason="1" class="stepper-google-input" rows="3" placeholder="Reason for the bar"></textarea><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="suspend-person">Bar account</button></div><div class="mt-4 grid gap-3">${(state.suspensions || []).length ? state.suspensions.map(item => `<article class="rounded-2xl border p-4 ${theme.soft}" data-stepper-suspension-key="${escapeHtml(item.userKey || '')}" data-stepper-suspension-email="${escapeHtml(item.email || '')}"><div class="flex flex-wrap items-center justify-between gap-3"><div><div class="text-base font-black">${escapeHtml(item.name || item.email || 'Member')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.email || '')}</p><p class="mt-2 text-xs font-semibold ${theme.subtle}">${escapeHtml((item.suspension && item.suspension.durationLabel) || '')} • ${escapeHtml((item.suspension && item.suspension.reason) || '')}</p><p class="mt-1 text-xs ${theme.subtle}">${escapeHtml(formatSuspensionWindow(item.suspension))}</p></div><button type="button" class="stepper-google-cta ${theme.button}" data-action="lift-suspension">${item.pending ? 'Delete pending bar' : 'Turn back on'}</button></div></article>`).join('') : `<p class="text-sm ${theme.subtle}">Nobody is currently barred.</p>`}</div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-security-alerts="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Security alerts</div><p class="mt-1 text-sm ${theme.subtle}">Client-side inspection warnings show here after 3 strikes. This is only a nuisance detector, not perfect protection.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.securityAlerts || []).length))} alerts</span></div><div class="mt-4 grid gap-3">${(state.securityAlerts || []).length ? state.securityAlerts.slice(0,20).map(item => `<article class="rounded-2xl border p-4 ${theme.soft}"><div class="flex flex-wrap items-center justify-between gap-3"><div><div class="text-base font-black">${escapeHtml(item.name || item.email || 'User')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.email || '')}</p><p class="mt-2 text-xs font-semibold ${theme.subtle}">${escapeHtml(item.reason || '')} • ${escapeHtml(String(item.strikeCount || 0))} strikes</p></div></div>${item.detail ? `<p class="mt-3 text-sm ${theme.subtle}">${escapeHtml(item.detail)}</p>` : ''}</article>`).join('') : `<p class="text-sm ${theme.subtle}">No security alerts yet.</p>`}</div></div>
        ${cards}

        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-site-memory="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Helper memory</div><p class="mt-1 text-sm ${theme.subtle}">Add site facts or rules the AI helper should keep using for everyone. This is how the website learns approved things over time.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.siteMemories || []).length))} learned</span></div><div class="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]"><textarea data-stepper-site-memory-input="1" class="stepper-google-input" rows="3" placeholder="Example: Featured dances should feel polished but not over-written. Counts should be generated in 8-count blocks whenever possible."></textarea><button type="button" class="stepper-google-cta ${theme.button}" data-action="add-site-memory">Add memory</button></div><div class="mt-4 grid gap-3">${(state.siteMemories || []).length ? state.siteMemories.slice(0,30).map(item => `<div class="rounded-2xl border p-4 ${theme.soft}" data-stepper-site-memory-id="${escapeHtml(item.id)}"><div class="flex flex-wrap items-start justify-between gap-3"><div><div class="text-sm font-black">${escapeHtml(item.text || '')}</div><p class="mt-1 text-xs ${theme.subtle}">${escapeHtml(item.createdByName || item.createdByEmail || 'Admin')}</p></div><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="delete-site-memory">Delete</button></div></div>`).join('') : `<p class="text-sm ${theme.subtle}">No saved helper memory yet.</p>`}</div></div>
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.panel}" data-stepper-glossary-requests="1"><div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Requested dance steps</div><p class="mt-1 text-sm ${theme.subtle}">Admin approves custom glossary steps here. If a request is clearly right-footed or left-footed, the mirrored version is created automatically too.</p></div><span class="stepper-google-pill ${theme.orange}">${escapeHtml(String((state.glossaryRequests || []).length))} pending</span></div><div class="mt-4 grid gap-4">${(state.glossaryRequests || []).length ? state.glossaryRequests.map(item => `<article class="rounded-2xl border p-4 ${theme.soft}" data-stepper-glossary-request-id="${escapeHtml(item.id)}"><div class="flex flex-wrap items-start justify-between gap-3"><div><div class="text-base font-black">${escapeHtml(item.name || 'Requested Step')}</div><p class="mt-1 text-sm ${theme.subtle}">${escapeHtml(item.ownerName || item.ownerEmail || 'Member')} • ${escapeHtml(item.counts || '1')} • ${escapeHtml(item.foot || 'Either')}</p></div><div class="flex flex-wrap gap-3"><button type="button" class="stepper-google-cta ${theme.button}" data-action="approve-glossary-request">Approve</button><button type="button" class="stepper-google-cta stepper-google-danger ${theme.button}" data-action="reject-glossary-request">Decline</button></div></div><div class="mt-4 grid gap-3 sm:grid-cols-2"><div class="rounded-2xl border p-4 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">${item.requestType === 'edit' ? 'Current glossary step' : 'Requested step'}</div><p class="mt-3 text-sm font-bold">${escapeHtml(item.requestType === 'edit' ? (item.originalName || '') : (item.name || ''))}</p><p class="mt-2 text-sm ${theme.subtle}">${escapeHtml(item.requestType === 'edit' ? (item.originalDescription || '') : (item.description || ''))}</p><p class="mt-2 text-xs font-semibold ${theme.subtle}">${escapeHtml(item.requestType === 'edit' ? (item.originalFoot || item.foot || '') : (item.foot || ''))} • ${escapeHtml(item.requestType === 'edit' ? (item.originalCounts || item.counts || '') : (item.counts || ''))}</p>${(item.requestType === 'edit' ? item.originalTags : item.tags) ? `<p class="mt-2 text-xs font-semibold ${theme.subtle}">Tags: ${escapeHtml(item.requestType === 'edit' ? item.originalTags : item.tags)}</p>` : ''}</div><div class="rounded-2xl border p-4 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">${item.requestType === 'edit' ? 'Suggested replacement' : 'Auto twin preview'}</div>${item.requestType === 'edit' ? `<p class="mt-3 text-sm font-bold">${escapeHtml(item.name || '')}</p><p class="mt-2 text-sm ${theme.subtle}">${escapeHtml(item.description || '')}</p><p class="mt-2 text-xs font-semibold ${theme.subtle}">${escapeHtml(item.foot || '')} • ${escapeHtml(item.counts || '')}</p>${item.tags ? `<p class="mt-2 text-xs font-semibold ${theme.subtle}">Tags: ${escapeHtml(item.tags)}</p>` : ''}` : (item.autoMirror ? `<p class="mt-3 text-sm font-bold">${escapeHtml(item.autoMirror.name || '')}</p><p class="mt-2 text-sm ${theme.subtle}">${escapeHtml(item.autoMirror.description || '')}</p><p class="mt-2 text-xs font-semibold ${theme.subtle}">${escapeHtml(item.autoMirror.foot || '')} • ${escapeHtml(item.autoMirror.counts || '')}</p>` : `<p class="mt-3 text-sm ${theme.subtle}">No forced opposite-foot twin for this request.</p>`)}</div></div></article>`).join('') : `<p class="text-sm ${theme.subtle}">No pending dance step requests.</p>`}</div></div>
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
      const deleteBtn = card.querySelector('[data-action="delete-submission"]');
      if (deleteBtn) deleteBtn.addEventListener('click', () => deleteSubmissionRequest(submissionId));
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
    const friendsPage = document.getElementById(FRIENDS_PAGE_ID);
    const glossaryPage = document.getElementById(GLOSSARY_PAGE_ID);
    const pdfPage = document.getElementById(PDF_PAGE_ID);
    const settingsPage = document.getElementById(SETTINGS_PAGE_ID);
    const musicPage = document.getElementById(MUSIC_PAGE_ID);
    const templatesPage = document.getElementById(TEMPLATES_PAGE_ID);
    const notificationsPage = document.getElementById(NOTIFICATIONS_PAGE_ID);
    const tipsPage = document.getElementById(TIPS_PAGE_ID);
    const showSignIn = state.activePage === 'signin';
    const showSubscription = state.activePage === 'subscription';
    const showAdmin = state.activePage === 'admin';
    const showFriends = state.activePage === 'friends';
    const showGlossary = state.activePage === 'glossary';
    const showPdf = state.activePage === 'pdfimport';
    const showSettings = state.activePage === 'settings';
    const showMusic = state.activePage === 'music';
    const showTemplates = state.activePage === 'templates';
    const showNotifications = state.activePage === 'notifications';
    const showTips = state.activePage === 'tips';
    setVisibility(signInPage, showSignIn);
    setVisibility(subscriptionPage, showSubscription);
    setVisibility(adminPage, showAdmin);
    setVisibility(friendsPage, showFriends);
    setVisibility(glossaryPage, showGlossary);
    setVisibility(pdfPage, showPdf);
    setVisibility(settingsPage, showSettings);
    setVisibility(musicPage, showMusic);
    setVisibility(templatesPage, showTemplates);
    setVisibility(notificationsPage, showNotifications);
    setVisibility(tipsPage, showTips);
    host.hidden = !state.activePage;
    host.style.display = state.activePage ? '' : 'none';
    /* ── Enforce contain on hidden pages to prevent bleed ── */
    [signInPage, adminPage, subscriptionPage, friendsPage, glossaryPage, pdfPage, settingsPage, musicPage, templatesPage, notificationsPage, tipsPage].forEach(function(el){
      if (!el) return;
      if (el.hidden) { el.style.overflow = 'hidden'; el.style.height = '0'; el.style.pointerEvents = 'none'; }
      else { el.style.overflow = ''; el.style.height = ''; el.style.pointerEvents = ''; }
    });
    if (!state.activePage) {
      showNativeExtraHost();
      if (state.ui.mainEl) state.ui.mainEl.style.display = '';
      if (state.ui.footerWrap) state.ui.footerWrap.style.display = '';
    } else {
      hideNativeExtraHost();
      if (state.ui.mainEl) state.ui.mainEl.style.display = 'none';
      if (state.ui.footerWrap) state.ui.footerWrap.style.display = 'none';
    }
    try {
      window.__stepperIsDedicatedPageOpen = function () {
        return !!state.activePage;
      };
    } catch (e) { /* noop */ }
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

  function renderPages(force){
    if (!force && shouldDeferAdminAutoRender()) {
      scheduleRenderPages(2000);
      return false;
    }
    locateUi();
    ensureHost();
    renderSignInPage();
    renderSubscriptionPage();
    renderAdminPage();
    syncPageVisibility();
    /* ── New tab rendering (after syncPageVisibility so sections are visible) ── */
    if (state.activePage === 'friends' && window.__stepperFriendsTab) window.__stepperFriendsTab.render();
    if (state.activePage === 'glossary' && window.__stepperGlossaryTab) window.__stepperGlossaryTab.render();
    if (state.activePage === 'pdfimport' && window.__stepperPdfTab) window.__stepperPdfTab.render();
    if (state.activePage === 'settings' && window.__stepperSettingsTab) window.__stepperSettingsTab.render();
    if (state.activePage === 'music' && window.__stepperMusicTab) window.__stepperMusicTab.render();
    if (state.activePage === 'templates' && window.__stepperTemplatesTab) window.__stepperTemplatesTab.render();
    if (state.activePage === 'notifications' && window.__stepperNotificationsTab) window.__stepperNotificationsTab.render();
    if (state.activePage === 'tips' && window.__stepperTipsTab) window.__stepperTipsTab.render();
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
    return true;
  }

  function showWeirdLoadingSplash() {
    if (document.getElementById('stepper-weird-loading-splash')) return function () {};
    const splash = document.createElement('div');
    splash.id = 'stepper-weird-loading-splash';
    splash.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f172a,#312e81);color:#fff;font-family:Inter,system-ui,sans-serif;';
    const line = LOADING_SPLASH_LINES[Math.floor(Math.random() * LOADING_SPLASH_LINES.length)];
    splash.innerHTML = '<div style="text-align:center;padding:24px;max-width:min(680px,92vw);"><div style="font-size:22px;font-weight:900;letter-spacing:.04em;margin-bottom:12px;">Step By Stepper is booting every tab...</div><div style="font-size:15px;opacity:.92;">' + escapeHtml(line) + '</div></div>';
    document.body.appendChild(splash);
    return function hide() {
      if (!splash || !splash.parentNode) return;
      splash.style.transition = 'opacity .25s ease';
      splash.style.opacity = '0';
      setTimeout(function () { try { splash.remove(); } catch (e) { /* ignore */ } }, 260);
    };
  }

  async function prime(){
    const hideLoadingSplash = showWeirdLoadingSplash();
    installPathRouting();
    try {
      ensureStyles();
      if (location.protocol === 'http:' || location.protocol === 'https:') {
        const savedBase = normalizeApiBase(localStorage.getItem(API_BASE_KEY) || '');
        const preferredBase = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:3000' : DEFAULT_BACKEND_BASE;
        if (!savedBase || savedBase === 'http://localhost:3000' || savedBase === 'https://localhost:3000' || savedBase === normalizeApiBase(location.origin)) saveApiBase(preferredBase);
        await chooseWorkingApiBase(state.apiBase || preferredBase);
      }
      if (!locateUi()) return;
      ensureHost();
      _initSectionContextMenu();
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
      openPageFromCurrentPathIfNeeded();
    } finally {
      hideLoadingSplash();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', prime, { once:true });
  } else {
    prime();
  }

  setInterval(() => {
    if (shouldDeferAdminAutoRender()) {
      scheduleRenderPages(2000);
      return;
    }
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
    scheduleRenderPages(2000);
  });

  /* ── Settings page integration ── */
  window.addEventListener('stepper-open-settings', () => {
    openPage('settings');
  });

  window.addEventListener('stepper-pdf-import-complete', () => {
    state.savedDancesUiSignature = '';
    if (state.session && state.session.credential) {
      syncCurrentDanceToBackend(true).catch(() => {});
      refreshCloudSaves().then(() => { state.savedDancesUiSignature = ''; renderPages(); }).catch(() => {});
      refreshGlossaryApproved().then(() => { renderPages(); }).catch(() => {});
    }
    scheduleRenderPages(200);
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
          }
        } catch {}
        try { if (typeof window.__stepperRefreshWorksheetFromStorage === 'function') window.__stepperRefreshWorksheetFromStorage(); } catch {}
        try { window.dispatchEvent(new Event('storage')); } catch {}
        try { window.dispatchEvent(new CustomEvent('stepper:worksheet-loaded', { detail: { data: readJson(DATA_KEY, {}) } })); } catch {}
        try { window.dispatchEvent(new CustomEvent('stepper-pdf-live-apply', { detail: readJson(DATA_KEY, {}) })); } catch {}
      }, 40);
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
    try { window.dispatchEvent(new Event('stepper:subscription-changed')); } catch (e) {}
    try { window.dispatchEvent(new Event('stepper:access-changed')); } catch (e) {}
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
      await Promise.all([refreshActiveModerators().catch(() => []), refreshAdminPowerTools().catch(() => ({}))]);
      await refreshSuspensions().catch(() => []);
      await refreshSecurityAlerts().catch(() => []);
      await refreshAdminPowerTools().catch(() => ({}));
    }
    renderPages();
  };

  async function refreshModeratorQueue(){
    if (!(state.session && state.session.credential) || !isModeratorSession()) { state.moderatorQueue = []; return []; }
    try {
      const data = await authFetch('/api/moderator/submissions');
      state.moderatorQueue = Array.isArray(data.items) ? data.items : [];
      state.__moderatorDirty = true;
      return state.moderatorQueue;
    } catch {
      state.moderatorQueue = [];
      state.__moderatorDirty = true;
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
    if (!isAdminSession()) { state.activeModerators = []; state.pendingModeratorInvites = []; return []; }
    try {
      const data = await authFetch('/api/admin/moderators');
      state.activeModerators = Array.isArray(data.items) ? data.items : [];
      state.pendingModeratorInvites = Array.isArray(data.pendingInvites) ? data.pendingInvites : [];
      return state.activeModerators;
    } catch {
      state.activeModerators = [];
      state.pendingModeratorInvites = [];
      return [];
    }
  }

  async function refreshSuspensions(){
    if (!isAdminSession()) { state.suspensions = []; return []; }
    try {
      const data = await authFetch('/api/admin/suspensions');
      const active = Array.isArray(data.items) ? data.items : [];
      const pending = Array.isArray(data.pending) ? data.pending : [];
      state.suspensions = [...active, ...pending];
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

  async function refreshAdminPowerTools(){
    if (!isAdminSession()) { state.adminSummary = { users: 0, moderators: 0, barred: 0, pendingBars: 0, pendingInvites: 0, pendingApplications: 0, pendingSubmissions: 0 }; return state.adminSummary; }
    try {
      const data = await authFetch('/api/admin/power-tools');
      state.adminSummary = data && data.summary && typeof data.summary === 'object' ? data.summary : state.adminSummary;
      return state.adminSummary;
    } catch {
      return state.adminSummary;
    }
  }

  async function suspendMember(email, durationMs, durationLabel, reason){
    try {
      await authFetch('/api/admin/suspend', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ email, durationMs, durationLabel, reason })
      });
      await Promise.all([refreshSuspensions(), refreshSecurityAlerts(), refreshAdminPowerTools()]);
      renderPages();
      alert('Bar saved.');
    } catch (error) {
      alert(error.message || 'Could not bar that person.');
    }
  }

  async function liftSuspension(userKey, email){
    try {
      if (userKey) {
        await authFetch(`/api/admin/suspensions/${encodeURIComponent(userKey)}/lift`, { method:'POST' });
      } else {
        await authFetch('/api/admin/suspensions/remove-by-email', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email }) });
      }
      await Promise.all([refreshSuspensions(), refreshAdminPowerTools()]);
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
      await Promise.all([refreshActiveModerators(), refreshModeratorApplications(), refreshAdminPowerTools()]);
      renderPages();
      alert('Moderator saved to the backend. If they have not signed in yet, the invite stays pending on disk until they do.');
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


  async function removeModeratorAccess(userKey, reason, email){
    const note = String(reason || '').trim();
    try {
      if (userKey) {
        if (!note) {
          alert('Add a reason so the removed moderator can see why on next startup.');
          return;
        }
        await authFetch(`/api/admin/moderators/${encodeURIComponent(userKey)}/remove`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: note })
        });
      } else {
        await authFetch('/api/admin/moderators/remove-by-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
      }
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
      playDecisionSound(decision === 'decline' ? 'deny' : 'approve');
      await Promise.all([refreshModeratorApplications(), refreshAdminPowerTools()]);
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
      playDecisionSound(decision === 'disapprove' ? 'deny' : 'approve');
      await refreshModeratorQueue();
      if (isAdminSession()) await refreshSubmissions();
      renderPages(true);
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
            <p class="mt-2 text-sm font-semibold ${theme.subtle}">${escapeHtml((item.moderatorVoteSummary && item.moderatorVoteSummary.text) || '0 moderators approve and 0 disapprove')}</p>
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
    wrap.innerHTML = `<div class="flex flex-wrap items-center justify-between gap-4"><div><div class="text-lg font-black tracking-tight">Apply for moderator</div><p class="mt-2 text-sm ${theme.subtle}">Moderators get the premium helper perks without the Admin tab. Admin can approve or decline your request, and if they decline you can apply again later.</p></div><button type="button" data-stepper-moderator-apply="1" class="stepper-google-cta ${theme.button}">Apply for moderator</button></div>`;
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
        const summaryText = (item.moderatorVoteSummary && item.moderatorVoteSummary.text) || '0 moderators approve and 0 disapprove';
        if (String(item.moderatorReviewStatus || '') === 'approved') badges.innerHTML = `<span class="stepper-google-pill ${theme.orange}" style="background:#fef3c7;color:#92400e;border:1px solid #f59e0b;">Moderator approved</span><span class="stepper-google-pill ${theme.orange}">${escapeHtml(summaryText)}</span>`;
        else if (String(item.moderatorReviewStatus || '') === 'disapproved') badges.innerHTML = `<span class="stepper-google-pill ${theme.orange}" style="background:#fee2e2;color:#991b1b;border:1px solid #ef4444;">Moderator disapproved</span><span class="stepper-google-pill ${theme.orange}">${escapeHtml(summaryText)}</span>`;
        else if ((item.moderatorVoteSummary && item.moderatorVoteSummary.total)) badges.innerHTML = `<span class="stepper-google-pill ${theme.orange}">${escapeHtml(summaryText)}</span>`;
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
    const brain = window.__stepperHelperBrain;

    /* ── Try local worksheet-build handler first (approve/deny, step-adding) ── */
    const localHandled = tryHandleSiteHelperLocally(prompt);
    if (localHandled && localHandled.handled) {
      state.chatMessages.push({ role:'assistant', text: localHandled.message || 'Done.' });
      state.chatBusy = false;
      if (brain && brain.saveChatHistory) brain.saveChatHistory(state.chatMessages);
      renderCommunityGlossary();
      state._helperSignature = '';
      renderSiteHelper();
      return;
    }

    /* ── Try page action commands (navigate, dark mode, save, etc.) ── */
    const actionResult = tryHelperPageAction(prompt);
    if (actionResult && actionResult.handled) {
      state.chatMessages.push({ role:'assistant', text: actionResult.message || 'Done.' });
      state.chatBusy = false;
      if (brain && brain.saveChatHistory) brain.saveChatHistory(state.chatMessages);
      state._helperSignature = '';
      renderSiteHelper();
      return;
    }

    /* ── Try enhanced brain local knowledge base (free for all users) ── */
    if (brain && brain.findLocalAnswer) {
      const richCtx = brain.gatherRichContext ? brain.gatherRichContext() : {};
      richCtx.signedIn = !!(state.session && state.session.credential);
      richCtx.isPremium = isPremiumSession();
      richCtx.currentTab = state.activePage || 'main';
      const localAnswer = brain.findLocalAnswer(prompt, richCtx);
      if (localAnswer) {
        state.chatMessages.push({ role:'assistant', text: localAnswer });
        state.chatBusy = false;
        if (brain.saveChatHistory) brain.saveChatHistory(state.chatMessages);
        renderSiteHelper();
        return;
      }
    }

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
        const builderHandled = await tryHandleSiteHelperWithBackend(prompt);
        if (builderHandled && builderHandled.handled) {
          text = String(builderHandled.message || 'Done.').trim();
        }
        const loweredPrompt = prompt.toLowerCase();
        const wantsDanceJudge = !text && /\b(judge|score|rate|flow|flowability|clunky|smooth)\b/.test(loweredPrompt) && /\b(dance|sheet|worksheet|routine|choreo|choreography)\b/.test(loweredPrompt);
        const wantsDanceAdd = !text && /\b(add|generate|suggest|improve|fix|tidy)\b/.test(loweredPrompt) && /\b(step|steps|dance|sheet|worksheet|routine|choreo|choreography|glossary)\b/.test(loweredPrompt);
        const danceToolMode = wantsDanceAdd ? 'add' : (wantsDanceJudge ? 'judge' : '');
        if (!text && danceToolMode) {
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
      if (brain && brain.saveChatHistory) brain.saveChatHistory(state.chatMessages);
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
  renderPages = function(force){
    const forced = !!force;
    const previousPage = state.__lastRenderedPage || '';
    __origRenderPages(forced);
    ensureHost();
    if (state.activePage === 'moderator' && (forced || previousPage !== 'moderator' || state.__moderatorDirty)) {
      renderModeratorPage();
      state.__moderatorDirty = false;
    }
    decorateSubscriptionPage();
    decorateAdminPage();
    renderCommunityGlossary();
    setVisibility(document.getElementById(MODERATOR_PAGE_ID), state.activePage === 'moderator');
    state.__lastRenderedPage = state.activePage;
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
      autoGenerateCountsForWorksheet,
      requestGlossaryStep,
      requestGlossaryEditSuggestion
    };
  };

  window.__stepperOpenPage = function(pageName){
    try {
      var safe = String(pageName || '').toLowerCase().trim();
      if (!safe) return false;
      var allowed = {
        signin: 1, subscription: 1, admin: 1, moderator: 1,
        friends: 1, glossary: 1, pdfimport: 1, settings: 1,
        music: 1, templates: 1, notifications: 1
      };
      if (!allowed[safe]) return false;
      openPage(safe);
      renderPages(true);
      return true;
    } catch (e) {
      return false;
    }
  };

  let __stepperLiveQueueRefreshBusy = false;
  setInterval(() => {
    if (__stepperLiveQueueRefreshBusy || !(state.session && state.session.credential)) return;
    __stepperLiveQueueRefreshBusy = true;
    refreshLiveQueues().then(() => {
      if (state.activePage === 'admin' || state.activePage === 'signin' || state.activePage === 'subscription' || state.activePage === 'friends' || state.activePage === 'glossary' || state.activePage === 'pdfimport') renderPages();
    }).catch(() => {}).finally(() => { __stepperLiveQueueRefreshBusy = false; });
  }, LIVE_QUEUE_SYNC_INTERVAL_MS);

})();
