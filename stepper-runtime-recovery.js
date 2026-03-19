(function(){
  if (window.__stepperRuntimeRecoveryInstalled) return;
  window.__stepperRuntimeRecoveryInstalled = true;

  const ROUTE_STORAGE_KEY = 'stepperRouteBootstrap';
  const SETTINGS_KEY = 'stepper_sound_settings_v1';
  const overlayId = 'stepper-runtime-recovery-overlay';
  const transitionGifSrc = window.__stepperResolveAssetUrl ? window.__stepperResolveAssetUrl('./stepper_loading_bar_dark_preview.gif') : './stepper_loading_bar_dark_preview.gif';
  const transitionEndFrameSrc = window.__stepperResolveAssetUrl ? window.__stepperResolveAssetUrl('./stepper_loading_bar_dark_end.png') : './stepper_loading_bar_dark_end.png';
  const loadingSongSrc = window.__stepperResolveAssetUrl ? window.__stepperResolveAssetUrl('./loading-screen-song.m4a') : './loading-screen-song.m4a';
  const TRANSITION_LABELS = {
    editor: 'Editor',
    preview: 'Sheet',
    whatsnew: "What's New",
    saveddances: 'My Saved Dances',
    featured: 'Featured Choreo'
  };
  let overlay = null;
  let labelEl = null;
  let visualEl = null;
  let teardownTimer = 0;
  let loadingAudio = null;
  let audioStopTimer = 0;
  let loadingAudioPrimed = false;
  let loadingAudioSeeded = false;


  function readSettings(){
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function soundsEnabled(){
    return readSettings().sfxEnabled !== false;
  }

  function ensureLoadingAudio(){
    if (typeof window.__stepperPrimeLoadingAudio === 'function') return window.__stepperPrimeLoadingAudio();
    if (loadingAudio) return loadingAudio;
    loadingAudio = document.createElement('audio');
    loadingAudio.preload = 'auto';
    loadingAudio.src = loadingSongSrc;
    loadingAudio.loop = true;
    loadingAudio.volume = 0;
    loadingAudio.muted = true;
    try { loadingAudio.playsInline = true; } catch {}
    return loadingAudio;
  }

  function seedLoadingAudio(force = false){
    const audio = ensureLoadingAudio();
    if (loadingAudioSeeded && !force) return audio;
    const applySeed = () => {
      try {
        const duration = Number(audio.duration);
        if (!Number.isFinite(duration) || duration <= 1.2) return false;
        const safeDuration = Math.max(0, duration - 0.35);
        audio.currentTime = safeDuration > 0 ? Math.random() * safeDuration : 0;
        loadingAudioSeeded = true;
        return true;
      } catch {
        return false;
      }
    };
    if (!applySeed() && !audio.__stepperRandomSeedBound) {
      audio.__stepperRandomSeedBound = true;
      audio.addEventListener('loadedmetadata', () => { applySeed(); }, { once: true });
    }
    return audio;
  }

  function muteLoadingAudio(){
    if (typeof window.__stepperStopLoadingAudio === 'function') {
      window.__stepperStopLoadingAudio();
      return;
    }
    if (!loadingAudio) return;
    try {
      loadingAudio.muted = true;
      loadingAudio.volume = 0;
    } catch {}
  }

  function stopLoadingAudio(){
    if (audioStopTimer) {
      window.clearTimeout(audioStopTimer);
      audioStopTimer = 0;
    }
    muteLoadingAudio();
  }

  function playLoadingAudio(durationMs){
    if (typeof window.__stepperPrimeLoadingAudio === 'function') {
      window.__stepperPrimeLoadingAudio();
      if (soundsEnabled() && typeof window.__stepperSyncLoadingAudioMute === 'function') window.__stepperSyncLoadingAudioMute();
      audioStopTimer = window.setTimeout(stopLoadingAudio, Math.max(400, Number(durationMs) || 1400));
      return;
    }
    const audio = ensureLoadingAudio();
    if (!loadingAudioPrimed) {
      seedLoadingAudio(true);
      loadingAudioPrimed = true;
    }
    try {
      audio.muted = !soundsEnabled();
      audio.volume = soundsEnabled() ? 1 : 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
    } catch {}
    audioStopTimer = window.setTimeout(stopLoadingAudio, Math.max(400, Number(durationMs) || 1400));
  }

  function ensureOverlay(){
    if (overlay && overlay.isConnected) return overlay;
    const styleId = 'stepper-runtime-recovery-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        #${overlayId}[hidden]{display:none !important;}
        #${overlayId}{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 18%, rgba(129,140,248,.18), transparent 34%),radial-gradient(circle at 50% 82%, rgba(29,78,216,.16), transparent 34%),linear-gradient(180deg, #0d153a 0%, #0a1330 42%, #09102a 100%);opacity:0;pointer-events:none;transition:opacity 180ms ease;}
        #${overlayId}.is-visible{opacity:1;}
        #${overlayId} .stepper-runtime-card{display:flex;flex-direction:column;align-items:center;gap:18px;padding:22px;}
        #${overlayId} .stepper-runtime-visual{width:min(88vw, 520px);max-width:520px;filter:drop-shadow(0 18px 40px rgba(0,0,0,.32));}
        #${overlayId} .stepper-runtime-label{padding:12px 18px;border-radius:999px;background:rgba(10,14,32,.72);border:1px solid rgba(186,194,255,.18);color:#fff;font:900 12px/1.2 Inter, ui-sans-serif, system-ui, sans-serif;letter-spacing:.16em;text-transform:uppercase;text-align:center;box-shadow:0 20px 44px rgba(0,0,0,.22);}
      `;
      document.head.appendChild(style);
    }
    overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.hidden = true;
    overlay.innerHTML = '<div class="stepper-runtime-card"><img class="stepper-runtime-visual" alt="" /><div class="stepper-runtime-label">Loading</div></div>';
    document.body.appendChild(overlay);
    labelEl = overlay.querySelector('.stepper-runtime-label');
    visualEl = overlay.querySelector('.stepper-runtime-visual');
    return overlay;
  }

  function showFallbackTransition(changePage, options){
    const host = ensureOverlay();
    const target = options && options.target ? String(options.target) : 'editor';
    const label = TRANSITION_LABELS[target] || 'Loading';
    if (teardownTimer) window.clearTimeout(teardownTimer);
    playLoadingAudio(1420);
    host.hidden = false;
    if (labelEl) labelEl.textContent = 'Loading ' + label;
    if (visualEl) {
      visualEl.src = transitionGifSrc + '?v=' + Date.now();
      visualEl.onerror = function(){ this.onerror = null; this.src = transitionEndFrameSrc; };
    }
    requestAnimationFrame(() => host.classList.add('is-visible'));
    window.setTimeout(() => {
      try { if (typeof changePage === 'function') changePage(); } catch {}
    }, 190);
    teardownTimer = window.setTimeout(() => {
      if (visualEl) visualEl.src = transitionEndFrameSrc;
      stopLoadingAudio();
      host.classList.remove('is-visible');
      window.setTimeout(() => {
        host.hidden = true;
      }, 200);
    }, 1380);
  }

  function ensureTransitionFunction(){
    window.__stepperRunFaviconTransition = function(changePage, options){
      return showFallbackTransition(changePage, options || {});
    };
  }

  function ensurePhrasedMountVisible(){
    const host = document.getElementById('stepper-editor-inline-host');
    if (!host) return false;
    let stack = host.querySelector('div.space-y-5');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'space-y-5';
      while (host.firstChild) stack.appendChild(host.firstChild);
      host.appendChild(stack);
    }
    const ensureSection = (id, beforeId) => {
      let section = document.getElementById(id);
      if (section) return section;
      section = document.createElement('section');
      section.id = id;
      const before = beforeId ? document.getElementById(beforeId) : null;
      if (before && before.parentNode === stack) stack.insertBefore(section, before);
      else stack.appendChild(section);
      return section;
    };
    ensureSection('stepper-inline-phrased-tools', 'stepper-inline-choreography-panel');
    ensureSection('stepper-inline-choreography-panel', 'stepper-inline-settings-panel');
    ensureSection('stepper-inline-settings-panel');
    const main = document.querySelector('main');
    if (main && /Dance Title/.test(main.textContent || '')) host.hidden = false;
    return true;
  }

  function kickBootstrapRoute(){
    try {
      const raw = sessionStorage.getItem(ROUTE_STORAGE_KEY) || '';
      if (!raw) return;
      sessionStorage.removeItem(ROUTE_STORAGE_KEY);
      const map = {
        editor: '/editor/',
        preview: '/sheet/',
        whatsnew: '/whats-new/',
        saveddances: '/my-saved-dances/',
        featured: '/featured-choreo/'
      };
      const target = map[raw];
      if (!target) return;
      history.replaceState({ stepperRoute: raw }, '', target);
    } catch {}
  }

  function boot(){
    kickBootstrapRoute();
    ensureTransitionFunction();
    ensurePhrasedMountVisible();
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      ensureTransitionFunction();
      ensurePhrasedMountVisible();
      const phrased = document.getElementById('stepper-inline-phrased-tools');
      const ready = phrased && /Phrased Dance Tools/i.test(phrased.textContent || '');
      if (ready || tries > 40) window.clearInterval(timer);
    }, 350);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
