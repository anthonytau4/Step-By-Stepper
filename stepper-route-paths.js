(function(){
  if (window.__stepperRoutePathsInstalled) return;
  window.__stepperRoutePathsInstalled = true;

  const ROUTE_STORAGE_KEY = 'stepperRouteBootstrap';

  const ROUTES = {
    editor: '/editor/',
    preview: '/sheet/',
    whatsnew: '/whats-new/',
    saveddances: '/my-saved-dances/',
    featured: '/featured-choreo/',
    friends: '/friends/',
    glossary: '/glossary/',
    pdfimport: '/pdf-import/',
    settings: '/settings/',
    music: '/music/',
    templates: '/templates/',
    tips: '/tips/'
  };

  const PATH_TO_ROUTE = {
    '/': 'editor',
    '/index.html': 'editor',
    '/editor': 'editor',
    '/editor/': 'editor',
    '/sheet': 'preview',
    '/sheet/': 'preview',
    '/whats-new': 'whatsnew',
    '/whats-new/': 'whatsnew',
    '/my-saved-dances': 'saveddances',
    '/my-saved-dances/': 'saveddances',
    '/featured-choreo': 'featured',
    '/featured-choreo/': 'featured',
    '/friends': 'friends',
    '/friends/': 'friends',
    '/glossary': 'glossary',
    '/glossary/': 'glossary',
    '/pdf-import': 'pdfimport',
    '/pdf-import/': 'pdfimport',
    '/settings': 'settings',
    '/settings/': 'settings',
    '/music': 'music',
    '/music/': 'music',
    '/templates': 'templates',
    '/templates/': 'templates',
    '/tips': 'tips',
    '/tips/': 'tips',
    '/editor/index.html': 'editor',
    '/sheet/index.html': 'preview',
    '/whats-new/index.html': 'whatsnew',
    '/my-saved-dances/index.html': 'saveddances',
    '/featured-choreo/index.html': 'featured',
    '/Editor': 'editor',
    '/Editor/': 'editor',
    '/Editor/index.html': 'editor',
    '/Sheet': 'preview',
    '/Sheet/': 'preview',
    '/Sheet/index.html': 'preview'
  };

  let applyingRoute = false;
  let bindingsReady = false;
  let observer = null;



  function readBootstrapRoute(){
    try {
      const params = new URLSearchParams(window.location.search || '');
      const queryRoute = params.get('stepperRoute');
      if (queryRoute && ROUTES[queryRoute]) return queryRoute;
    } catch {}
    try {
      const hash = String(window.location.hash || '').replace(/^#/, '');
      if (hash && ROUTES[hash]) return hash;
    } catch {}
    return null;
  }

  function persistBootstrapRoute(routeName){
    if (!ROUTES[routeName]) return;
    try { sessionStorage.setItem(ROUTE_STORAGE_KEY, routeName); } catch {}
  }
  function normalizePath(pathname){
    const raw = String(pathname || '/').replace(/\/+/, '/');
    if (raw === '/') return '/';
    return raw.endsWith('/') ? raw : raw + '/';
  }

  function isLocalFileRoute(){
    return String(window.location.protocol || '').toLowerCase() === 'file:';
  }

  function inferRouteFromLoosePath(pathname){
    const path = normalizePath(String(pathname || '/')).toLowerCase();
    if (path.includes('/sheet/') || path.endsWith('/sheet/index.html/')) return 'preview';
    if (path.includes('/whats-new/') || path.endsWith('/whats-new/index.html/')) return 'whatsnew';
    if (path.includes('/my-saved-dances/') || path.endsWith('/my-saved-dances/index.html/')) return 'saveddances';
    if (path.includes('/featured-choreo/') || path.endsWith('/featured-choreo/index.html/')) return 'featured';
    if (path.includes('/friends/')) return 'friends';
    if (path.includes('/glossary/')) return 'glossary';
    if (path.includes('/pdf-import/')) return 'pdfimport';
    if (path.includes('/settings/')) return 'settings';
    if (path.includes('/music/')) return 'music';
    if (path.includes('/templates/')) return 'templates';
    if (path.includes('/editor/') || path.endsWith('/editor/index.html/')) return 'editor';
    return null;
  }

  function currentRouteFromPath(){
    const bootstrap = readBootstrapRoute();
    if (bootstrap) return bootstrap;
    const path = window.location.pathname || '/';
    return inferRouteFromLoosePath(path) || PATH_TO_ROUTE[path] || PATH_TO_ROUTE[normalizePath(path)] || null;
  }

  function reflectRouteState(routeName){
    const safe = ROUTES[routeName] ? routeName : 'editor';
    try { document.documentElement.setAttribute('data-stepper-route', safe); } catch {}
    try { if (document.body) document.body.setAttribute('data-stepper-route', safe); } catch {}
  }

  function canonicalPathFor(routeName){
    return ROUTES[routeName] || ROUTES.editor;
  }

  function setCanonicalPath(routeName, replace){
    reflectRouteState(routeName);
    if (isLocalFileRoute()) return;
    const target = canonicalPathFor(routeName);
    if (!target) return;
    const current = normalizePath(window.location.pathname || '/');
    if (current === normalizePath(target)) return;
    const fn = replace ? 'replaceState' : 'pushState';
    try {
      history[fn]({ stepperRoute: routeName }, '', target);
    } catch {}
    try {
      const params = new URLSearchParams(window.location.search || '');
      if (params.has('stepperRoute')) {
        params.delete('stepperRoute');
        const query = params.toString();
        history.replaceState({ stepperRoute: routeName }, '', target + (query ? '?' + query : '') + (window.location.hash && !ROUTES[window.location.hash.replace(/^#/, '')] ? window.location.hash : ''));
      }
      if (ROUTES[window.location.hash.replace(/^#/, '')]) history.replaceState({ stepperRoute: routeName }, '', target);
    } catch {}
  }

  function buttonByText(text){
    return Array.from(document.querySelectorAll('button')).find((button) => (button.textContent || '').trim() === text) || null;
  }

  function getRouteButton(routeName){
    if (routeName === 'editor') return buttonByText('Build');
    if (routeName === 'preview') return buttonByText('Sheet');
    if (routeName === 'whatsnew') return buttonByText("What's New");
    if (routeName === 'saveddances') return document.getElementById('stepper-saved-dances-tab') || buttonByText('My Saved Dances');
    if (routeName === 'featured') return document.getElementById('stepper-featured-choreo-tab') || buttonByText('Featured Choreo');
    if (routeName === 'friends') return document.getElementById('stepper-friends-tab');
    if (routeName === 'glossary') return document.getElementById('stepper-glossary-tab');
    if (routeName === 'pdfimport') return document.getElementById('stepper-pdf-tab');
    if (routeName === 'settings') return document.getElementById('stepper-settings-tab');
    if (routeName === 'music') return document.getElementById('stepper-music-tab');
    if (routeName === 'templates') return document.getElementById('stepper-templates-tab');
    if (routeName === 'tips') return document.getElementById('stepper-tips-tab');
    return null;
  }

  function attachPathBinding(button, routeName){
    if (!button || button.__stepperRouteBound === routeName) return;
    button.__stepperRouteBound = routeName;
    button.addEventListener('click', function(){
      if (applyingRoute) return;
      setCanonicalPath(routeName, false);
    }, true);
  }

  function bindButtons(){
    attachPathBinding(getRouteButton('editor'), 'editor');
    attachPathBinding(getRouteButton('preview'), 'preview');
    attachPathBinding(getRouteButton('whatsnew'), 'whatsnew');
    attachPathBinding(getRouteButton('saveddances'), 'saveddances');
    attachPathBinding(getRouteButton('featured'), 'featured');
    attachPathBinding(getRouteButton('friends'), 'friends');
    attachPathBinding(getRouteButton('glossary'), 'glossary');
    attachPathBinding(getRouteButton('pdfimport'), 'pdfimport');
    attachPathBinding(getRouteButton('settings'), 'settings');
    attachPathBinding(getRouteButton('music'), 'music');
    attachPathBinding(getRouteButton('templates'), 'templates');
    attachPathBinding(getRouteButton('tips'), 'tips');
    bindingsReady = !!(getRouteButton('editor') && getRouteButton('preview') && getRouteButton('whatsnew'));
    return bindingsReady;
  }

  function clickRoute(routeName){
    const button = getRouteButton(routeName);
    if (!button) return false;
    applyingRoute = true;
    try {
      button.click();
    } finally {
      window.setTimeout(() => { applyingRoute = false; }, 50);
    }
    return true;
  }

  function goToRoute(routeName, replace){
    if (!ROUTES[routeName]) return false;
    reflectRouteState(routeName);
    setCanonicalPath(routeName, !!replace);
    if (routeName === 'editor') {
      const build = getRouteButton('editor');
      if (!build) return false;
      applyingRoute = true;
      try { build.click(); } finally { window.setTimeout(() => { applyingRoute = false; }, 50); }
      return true;
    }
    return clickRoute(routeName);
  }

  function applyInitialRoute(replace){
    const routeName = currentRouteFromPath() || 'editor';
    reflectRouteState(routeName);
    persistBootstrapRoute(routeName);
    setCanonicalPath(routeName, !!replace);
    if (routeName === 'editor') return true;
    return clickRoute(routeName);
  }

  function kickRouteSync(replace){
    bindButtons();
    if (!applyInitialRoute(replace)) return false;
    return true;
  }

  function startWatching(){
    if (observer) return;
    observer = new MutationObserver(() => {
      bindButtons();
    });
    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

  function boot(){
    /* On every page load / reload, always navigate to the editor (main page) */
    reflectRouteState('editor');
    setCanonicalPath('editor', true);
    startWatching();
    bindButtons();
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      bindButtons();
      const build = getRouteButton('editor');
      if (build && !build.__stepperBootClicked) {
        build.__stepperBootClicked = true;
        applyingRoute = true;
        try { build.click(); } finally { window.setTimeout(() => { applyingRoute = false; }, 50); }
      }
      if ((build && tries > 2) || tries > 40) window.clearInterval(timer);
    }, 250);
  }

  window.__stepperRoutePaths = {
    go: function(routeName, opts){
      return goToRoute(routeName, !!(opts && opts.replace));
    },
    paths: Object.assign({}, ROUTES),
    current: function(){
      return currentRouteFromPath() || 'editor';
    }
  };

  window.addEventListener('popstate', () => {
    const routeName = currentRouteFromPath() || 'editor';
    reflectRouteState(routeName);
    bindButtons();
    if (routeName === 'editor') {
      const build = getRouteButton('editor');
      if (build) {
        applyingRoute = true;
        try { build.click(); } finally { window.setTimeout(() => { applyingRoute = false; }, 50); }
      }
      return;
    }
    clickRoute(routeName);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

(function(){
  if (window.__stepperAutosaveUploadCacheInstalled) return;
  window.__stepperAutosaveUploadCacheInstalled = true;
  var DATA_KEY = 'linedance_builder_data_v13';
  var PHR_TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  var SESSION_KEY = 'stepper_google_auth_session_v2';
  var GOOGLE_SIGNIN_CACHE_KEY = 'stepper_google_signin_cache_v1';
  var AUTOSAVE_CACHE_KEY = 'stepper_pending_autosaves_v1';
  var LAST_SAVED_SIGNATURE_KEY = 'stepper_last_saved_signature_v1';
  var API_BASE_KEY = 'stepper_api_base_v1';
  var DEFAULT_BACKEND_BASE = 'https://step-by-stepper.onrender.com';
  var busy = false;
  function readJson(key, fallback){ try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } }
  function writeJson(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function normalizeApiBase(value){ return String(value || '').trim().replace(/\/+$/, ''); }
  function apiBase(){ var saved = normalizeApiBase(window.STEPPER_API_BASE || localStorage.getItem(API_BASE_KEY) || ''); if (saved) return saved; if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return 'http://localhost:3000'; return DEFAULT_BACKEND_BASE; }
  function normalizePending(list){ var map = {}; (Array.isArray(list) ? list : []).forEach(function(item){ if (!item || !item.entry || !item.signature) return; map[String(item.signature)] = { entry:item.entry, signature:String(item.signature), reason:String(item.reason || 'autosave'), autosavedAt:String(item.autosavedAt || new Date().toISOString()), uploadAttempts:Math.max(0, Number(item.uploadAttempts || 0) || 0) }; }); return Object.keys(map).map(function(key){ return map[key]; }).sort(function(a,b){ return new Date(b.autosavedAt || 0) - new Date(a.autosavedAt || 0); }).slice(0, 24); }
  function readSession(){ var active = readJson(SESSION_KEY, null); if (active && active.credential) { writeJson(GOOGLE_SIGNIN_CACHE_KEY, Object.assign({}, active, { cachedAt:new Date().toISOString() })); return active; } var cached = readJson(GOOGLE_SIGNIN_CACHE_KEY, null); if (cached && cached.credential) { writeJson(SESSION_KEY, cached); return cached; } return null; }
  function readDanceEntry(){ var data = readJson(DATA_KEY, null); if (!data || !data.meta) return null; var meta = data.meta || {}; var sections = Array.isArray(data.sections) ? data.sections : []; var steps = sections.reduce(function(sum, section){ return sum + (section && Array.isArray(section.steps) ? section.steps.length : 0); }, 0); var title = String(meta.title || '').trim(); var choreographer = String(meta.choreographer || '').trim(); if (!title && !choreographer && !steps) return null; title = title || 'Untitled Dance'; choreographer = choreographer || 'Uncredited'; return { id:title.toLowerCase() + '|' + choreographer.toLowerCase(), title:title, choreographer:choreographer, country:String(meta.country || '').trim(), level:String(meta.level || 'Unlabelled').trim() || 'Unlabelled', counts:String(meta.counts || '-').trim() || '-', walls:String(meta.walls || '-').trim() || '-', music:String(meta.music || '').trim(), sections:sections.length, steps:steps, updatedAt:new Date().toISOString(), snapshot:{ data:data, phrasedTools:readJson(PHR_TOOLS_KEY, {}) } }; }
  function signature(entry){ if (!entry) return ''; try { return JSON.stringify({ title:entry.title, choreographer:entry.choreographer, counts:entry.counts, walls:entry.walls, steps:entry.steps, sections:entry.sections, data:entry.snapshot && entry.snapshot.data ? entry.snapshot.data : {} }); } catch (_) { return entry.id + '|' + entry.updatedAt; } }
  function writePending(list){ var normalized = normalizePending(list); if (normalized.length) writeJson(AUTOSAVE_CACHE_KEY, normalized); else localStorage.removeItem(AUTOSAVE_CACHE_KEY); try { window.dispatchEvent(new CustomEvent('stepper:pending-autosaves-changed', { detail:{ count:normalized.length } })); } catch (_) {} }
  function cacheCurrent(reason){ var entry = readDanceEntry(); var sig = signature(entry); if (!entry || !sig) return false; var session = readSession(); var profile = session && session.profile ? session.profile : {}; entry.ownerEmail = String(entry.ownerEmail || profile.email || '').trim(); entry.ownerName = String(entry.ownerName || (session && session.displayName) || profile.name || '').trim(); entry.autosavedAt = new Date().toISOString(); var next = normalizePending(readJson(AUTOSAVE_CACHE_KEY, [])).filter(function(item){ return item.signature !== sig; }); next.unshift({ entry:entry, signature:sig, reason:String(reason || 'autosave'), autosavedAt:entry.autosavedAt, uploadAttempts:0 }); writePending(next); return true; }
  async function uploadPending(){ if (busy) return false; var session = readSession(); if (!session || !session.credential) return false; var pending = normalizePending(readJson(AUTOSAVE_CACHE_KEY, [])); if (!pending.length) return false; busy = true; var remaining = []; var uploaded = false; try { for (var i = pending.length - 1; i >= 0; i -= 1) { var item = pending[i]; try { var response = await fetch(apiBase() + '/api/cloud-saves/upsert', { method:'POST', mode:'cors', credentials:'omit', headers:{ 'Content-Type':'application/json', Authorization:'Bearer ' + session.credential }, body:JSON.stringify({ entry:item.entry }) }); if (!response.ok) throw new Error('Upload failed'); uploaded = true; if (item.signature) localStorage.setItem(LAST_SAVED_SIGNATURE_KEY, item.signature); } catch (_) { remaining.push(Object.assign({}, item, { uploadAttempts:Math.max(0, Number(item.uploadAttempts || 0) || 0) + 1 })); } } writePending(remaining.reverse()); return uploaded; } finally { busy = false; } }
  function maybeCacheDirty(reason){ var entry = readDanceEntry(); var sig = signature(entry); if (!sig) return false; if (sig === String(localStorage.getItem(LAST_SAVED_SIGNATURE_KEY) || '')) return false; return cacheCurrent(reason); }
  window.StepperAutosaveUploadCache = { cacheCurrent:cacheCurrent, uploadPending:uploadPending, pending:function(){ return normalizePending(readJson(AUTOSAVE_CACHE_KEY, [])); } };
  readSession();
  window.addEventListener('beforeunload', function(){ maybeCacheDirty('before-close'); });
  window.addEventListener('storage', function(){ maybeCacheDirty('local-change'); uploadPending(); });
  window.addEventListener('stepper:access-changed', function(){ readSession(); uploadPending(); });
  window.setInterval(function(){ maybeCacheDirty('autosave'); uploadPending(); }, 6000);
})();
