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
    pdfimport: '/pdf-import/'
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
    const raw = String(pathname || '/').replace(/\/+/g, '/');
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
