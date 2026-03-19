(function(){
  if (window.__stepperRoutePathsInstalled) return;
  window.__stepperRoutePathsInstalled = true;

  const ROUTES = {
    editor: '/editor/',
    preview: '/sheet/',
    whatsnew: '/whats-new/',
    saveddances: '/my-saved-dances/',
    featured: '/featured-choreo/'
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

  function normalizePath(pathname){
    const raw = String(pathname || '/').replace(/\/+/g, '/');
    if (raw === '/') return '/';
    return raw.endsWith('/') ? raw : raw + '/';
  }

  function currentRouteFromPath(){
    const path = window.location.pathname || '/';
    return PATH_TO_ROUTE[path] || PATH_TO_ROUTE[normalizePath(path)] || null;
  }

  function canonicalPathFor(routeName){
    return ROUTES[routeName] || ROUTES.editor;
  }

  function setCanonicalPath(routeName, replace){
    const target = canonicalPathFor(routeName);
    if (!target) return;
    const current = normalizePath(window.location.pathname || '/');
    if (current === normalizePath(target)) return;
    const fn = replace ? 'replaceState' : 'pushState';
    try {
      history[fn]({ stepperRoute: routeName }, '', target);
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
    startWatching();
    bindButtons();
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      const ready = kickRouteSync(tries === 1);
      if ((ready && tries > 2) || tries > 40) window.clearInterval(timer);
    }, 250);
  }

  window.addEventListener('popstate', () => {
    const routeName = currentRouteFromPath() || 'editor';
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
