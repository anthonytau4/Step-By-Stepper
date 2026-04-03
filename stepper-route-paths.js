(function(){
  if (window.__stepperRoutePathsInstalled) return;
  window.__stepperRoutePathsInstalled = true;

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
    templates: '/templates/'
  };

  function routeNameFromPath(path){
    const value = String(path || location.pathname || '/').toLowerCase();
    if (value.includes('/sheet')) return 'preview';
    if (value.includes('/whats-new')) return 'whatsnew';
    if (value.includes('/my-saved-dances')) return 'saveddances';
    if (value.includes('/featured-choreo')) return 'featured';
    if (value.includes('/friends')) return 'friends';
    if (value.includes('/glossary')) return 'glossary';
    if (value.includes('/pdf-import')) return 'pdfimport';
    if (value.includes('/settings')) return 'settings';
    if (value.includes('/music')) return 'music';
    if (value.includes('/templates')) return 'templates';
    return 'editor';
  }

  function reflect(routeName){
    const safe = ROUTES[routeName] ? routeName : 'editor';
    try { document.documentElement.setAttribute('data-stepper-route', safe); } catch {}
    try { if (document.body) document.body.setAttribute('data-stepper-route', safe); } catch {}
  }

  function updatePath(routeName, replace){
    if (String(location.protocol || '').toLowerCase() === 'file:') return;
    const target = ROUTES[routeName] || ROUTES.editor;
    try {
      history[replace ? 'replaceState' : 'pushState']({ stepperRoute: routeName }, '', target);
    } catch {}
  }

  function buttonMap(){
    return {
      editor: Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').trim() === 'Build'),
      preview: Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').trim() === 'Sheet'),
      whatsnew: Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').trim() === "What's New"),
      saveddances: document.getElementById('stepper-saved-dances-tab') || Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').trim() === 'My Saved Dances'),
      featured: document.getElementById('stepper-featured-choreo-tab') || Array.from(document.querySelectorAll('button')).find((b) => (b.textContent || '').trim() === 'Featured Choreo'),
      friends: document.getElementById('stepper-friends-tab'),
      glossary: document.getElementById('stepper-glossary-tab'),
      pdfimport: document.getElementById('stepper-pdf-tab'),
      settings: document.getElementById('stepper-settings-tab'),
      music: document.getElementById('stepper-music-tab'),
      templates: document.getElementById('stepper-templates-tab')
    };
  }

  function bind(){
    const map = buttonMap();
    Object.entries(map).forEach(([route, button]) => {
      if (!button || button.__stepperRouteBound) return;
      button.__stepperRouteBound = true;
      button.addEventListener('click', () => {
        reflect(route);
        updatePath(route, false);
      }, true);
    });
  }

  function applyRouteFromPath(){
    const route = routeNameFromPath();
    reflect(route);
    if (route === 'editor') return;
    const map = buttonMap();
    const button = map[route];
    if (button && !button.__stepperRouteOpening) {
      button.__stepperRouteOpening = true;
      window.setTimeout(() => {
        try { button.click(); } catch {}
        button.__stepperRouteOpening = false;
      }, 0);
    }
  }

  function boot(){
    bind();
    reflect(routeNameFromPath());
    window.setTimeout(bind, 600);
    window.setTimeout(applyRouteFromPath, 900);
  }

  window.addEventListener('popstate', applyRouteFromPath);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
