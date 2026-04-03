(function(){
  if (window.__stepperMaxPerformanceLoaderInstalled) return;
  window.__stepperMaxPerformanceLoaderInstalled = true;

  const VERSION = '20260404-max-perf-1';
  const loadedGroups = new Set();
  const loadedScripts = new Set();
  const loadingScripts = new Map();
  const groupPromises = new Map();
  let retryClickLock = false;

  const CORE = [
    './stepper-menubar.js?v=' + VERSION,
    './stepper-hamburger-nav.js?v=' + VERSION,
    './stepper-step-select.js?v=' + VERSION
  ];

  const IDLE_EDITOR = [
    './stepper-phrased-tools-fix.js?v=' + VERSION,
    './stepper-editor-phrasing-repair.js?v=' + VERSION,
    './stepper-step-dictionary.js?v=' + VERSION,
    './stepper-site-helper-brain.js?v=' + VERSION
  ];

  const IDLE_LIGHT = [
    './stepper-route-paths.js?v=' + VERSION
  ];

  const GROUPS = {
    settings: ['./stepper-settings-tab.js?v=' + VERSION],
    friends: ['./stepper-friends-tab.js?v=' + VERSION],
    glossary: ['./stepper-glossary-tab.js?v=' + VERSION],
    pdf: [
      './stepper-pdf-tab.js?v=' + VERSION,
      './stepper-pdf-import-core.js?v=' + VERSION,
      './stepper-pdf-import-ui.js?v=' + VERSION,
      './stepper-pdf-import-bootstrap.js?v=' + VERSION
    ],
    admin: ['./stepper-google-admin.ai-hardstop.js?v=' + VERSION],
    music: ['./stepper-music-tab.js?v=' + VERSION],
    templates: ['./stepper-templates-tab.js?v=' + VERSION]
  };

  function whenIdle(fn, timeout){
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(fn, { timeout: timeout || 1500 });
    } else {
      window.setTimeout(fn, Math.min(timeout || 1500, 1200));
    }
  }

  function loadScript(src){
    if (loadedScripts.has(src)) return Promise.resolve();
    if (loadingScripts.has(src)) return loadingScripts.get(src);
    const promise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.dataset.stepperPerf = '1';
      s.onload = () => { loadedScripts.add(src); loadingScripts.delete(src); resolve(); };
      s.onerror = () => { loadingScripts.delete(src); reject(new Error('Failed to load ' + src)); };
      (document.body || document.head || document.documentElement).appendChild(s);
    });
    loadingScripts.set(src, promise);
    return promise;
  }

  async function loadGroup(name){
    if (!name) return;
    if (loadedGroups.has(name)) return;
    if (groupPromises.has(name)) return groupPromises.get(name);
    const list = GROUPS[name] || [];
    const promise = (async () => {
      await ensureCore();
      for (const src of list) await loadScript(src);
      loadedGroups.add(name);
      groupPromises.delete(name);
    })().catch((err) => {
      console.error('[stepper-perf] group load failed:', name, err);
      groupPromises.delete(name);
    });
    groupPromises.set(name, promise);
    return promise;
  }

  let corePromise = null;
  function ensureCore(){
    if (corePromise) return corePromise;
    corePromise = (async () => {
      for (const src of CORE) await loadScript(src);
    })().catch((err) => {
      console.error('[stepper-perf] core load failed:', err);
      corePromise = null;
    });
    return corePromise;
  }

  function scheduleEditorHelpers(){
    if (loadedGroups.has('editor')) return;
    loadedGroups.add('editor');
    whenIdle(async () => {
      await ensureCore();
      for (const src of IDLE_EDITOR) await loadScript(src);
    }, 2200);
  }

  function scheduleLightIdle(){
    whenIdle(async () => {
      for (const src of IDLE_LIGHT) await loadScript(src);
    }, 2800);
  }

  function matchGroupFromElement(el){
    const node = el && el.closest ? el.closest('button,[role="button"],a,[id]') : null;
    if (!node) return null;
    const id = String(node.id || '').toLowerCase();
    const text = String(node.textContent || '').trim().toLowerCase();
    if (id === 'stepper-settings-tab' || text === 'settings') return 'settings';
    if (id === 'stepper-friends-tab' || text === 'friends') return 'friends';
    if (id === 'stepper-glossary-tab' || text === 'glossary') return 'glossary';
    if (id === 'stepper-pdf-tab' || /pdf/.test(text)) return 'pdf';
    if (id === 'stepper-music-tab' || text === 'music') return 'music';
    if (id === 'stepper-templates-tab' || text === 'templates') return 'templates';
    if (/admin|moderator|sign in|signin|log in|login|subscription/.test(text) || /admin|moderator|signin|subscription/.test(id)) return 'admin';
    return null;
  }

  function routeGroup(){
    const route = String(document.documentElement.getAttribute('data-stepper-route') || location.pathname || location.hash || '').toLowerCase();
    if (route.includes('settings')) return 'settings';
    if (route.includes('friends')) return 'friends';
    if (route.includes('glossary')) return 'glossary';
    if (route.includes('pdf')) return 'pdf';
    if (route.includes('music')) return 'music';
    if (route.includes('template')) return 'templates';
    if (route.includes('admin') || route.includes('moderator') || route.includes('signin') || route.includes('subscription')) return 'admin';
    return null;
  }

  function cleanupStartupJunk(){
    try {
      const splash = document.getElementById('stepper-static-startup');
      if (splash) splash.remove();
    } catch {}
    try {
      const overlay = document.getElementById('stepper-runtime-recovery-overlay');
      if (overlay) overlay.remove();
    } catch {}
  }

  document.addEventListener('click', async function(ev){
    if (retryClickLock) return;
    const group = matchGroupFromElement(ev.target);
    if (!group || loadedGroups.has(group)) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (typeof ev.stopImmediatePropagation === 'function') ev.stopImmediatePropagation();
    const target = ev.target && ev.target.closest ? ev.target.closest('button,[role="button"],a,[id]') : null;
    await loadGroup(group);
    retryClickLock = true;
    window.setTimeout(() => {
      retryClickLock = false;
      try { if (target && typeof target.click === 'function') target.click(); } catch {}
    }, 0);
  }, true);

  document.addEventListener('focusin', function(ev){
    const node = ev.target;
    if (!node) return;
    const tag = String(node.tagName || '').toLowerCase();
    const editable = node.isContentEditable || tag === 'textarea' || tag === 'input';
    if (editable) scheduleEditorHelpers();
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  function boot(){
    cleanupStartupJunk();
    ensureCore();
    scheduleLightIdle();
    const currentGroup = routeGroup();
    if (currentGroup) {
      window.setTimeout(() => { loadGroup(currentGroup); }, 80);
    } else {
      window.setTimeout(scheduleEditorHelpers, 3200);
    }
  }
})();
