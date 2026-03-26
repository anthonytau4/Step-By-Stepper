(function(){
  if (window.__stepperStaticStartupInstalled) return;
  window.__stepperStaticStartupInstalled = true;
  const STARTUP_MIN_MS = 8400;
  const STARTUP_FALLBACK_MS = 9800;
  const STARTUP_FADE_MS = 340;
  const STARTUP_AUDIO_FALLBACK_DURATION_MS = 8411;
  const SETTINGS_KEY = 'stepper_sound_settings_v1';
  const STARTUP_AUDIO_VERSION = '20260327-startup-refresh-1';
  const STARTUP_AUDIO_SOURCES = [
    (window.__stepperResolveAssetUrl ? window.__stepperResolveAssetUrl('./startup-song.mp3?v=' + STARTUP_AUDIO_VERSION) : './startup-song.mp3?v=' + STARTUP_AUDIO_VERSION),
    (window.__stepperResolveAssetUrl ? window.__stepperResolveAssetUrl('./startup-song.m4a?v=' + STARTUP_AUDIO_VERSION) : './startup-song.m4a?v=' + STARTUP_AUDIO_VERSION)
  ];
  function readSettings(){
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  function areSoundsEnabled(){
    return readSettings().sfxEnabled !== false;
  }
  function pickStartupAudioSource(){
    try {
      const probe = document.createElement('audio');
      const preferred = STARTUP_AUDIO_SOURCES.find((src) => /\.mp3(?:\?|$)/i.test(src) && typeof probe.canPlayType === 'function' && probe.canPlayType('audio/mpeg'));
      if (preferred) return preferred;
      const fallback = STARTUP_AUDIO_SOURCES.find((src) => /\.m4a(?:\?|$)|\.mp4(?:\?|$)/i.test(src) && typeof probe.canPlayType === 'function' && probe.canPlayType('audio/mp4'));
      if (fallback) return fallback;
    } catch {}
    return STARTUP_AUDIO_SOURCES[0];
  }
  function buildStartupAudio(){
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    audio.autoplay = false;
    audio.loop = false;
    audio.volume = 1;
    audio.muted = false;
    audio.crossOrigin = 'anonymous';
    try { audio.playsInline = true; } catch {}
    audio.src = pickStartupAudioSource();
    try { audio.load(); } catch {}
    try {
      audio.setAttribute('aria-hidden', 'true');
      audio.style.position = 'absolute';
      audio.style.width = '0';
      audio.style.height = '0';
      audio.style.opacity = '0';
      audio.style.pointerEvents = 'none';
    } catch {}
    return audio;
  }
  function init(){
    const splash = document.getElementById('stepper-static-startup');
    if (!splash) return;
    const button = splash.querySelector('.stepper-static-startup__button');
    const audio = buildStartupAudio();
    try { if (!audio.parentNode) document.body.appendChild(audio); } catch {}
    window.__stepperStartupAudio = audio;
    window.__stepperGetStartupAudioDurationMs = function(){
      const duration = Number(audio.duration);
      return Number.isFinite(duration) && duration > 0 ? Math.round(duration * 1000) : STARTUP_AUDIO_FALLBACK_DURATION_MS;
    };
    let started = false;
    let audioPrimed = false;
    let firstPlaySucceeded = false;
    function prewarmAudio(){
      try { audio.preload = 'auto'; audio.load(); } catch {}
    }
    function unlockAudio(){
      if (audioPrimed) return;
      audioPrimed = true;
      try {
        const priorMuted = audio.muted;
        const priorVolume = audio.volume;
        audio.muted = true;
        audio.volume = 0;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(() => {
            try { audio.pause(); audio.currentTime = 0; } catch {}
            audio.muted = priorMuted;
            audio.volume = priorVolume;
          }).catch(() => {
            audio.muted = priorMuted;
            audio.volume = priorVolume;
          });
        } else {
          try { audio.pause(); audio.currentTime = 0; } catch {}
          audio.muted = priorMuted;
          audio.volume = priorVolume;
        }
      } catch {}
    }
    let leaving = false;
    let fallbackTimer = null;
    function leave(){
      if (leaving) return;
      leaving = true;
      splash.classList.add('is-leaving');
      window.setTimeout(() => {
        try { audio.pause(); audio.currentTime = 0; } catch {}
        try { if (audio.parentNode) audio.parentNode.removeChild(audio); } catch {}
        splash.hidden = true;
        splash.remove();
      }, STARTUP_FADE_MS);
    }
    function getDurationMs(){
      const duration = Number(audio.duration);
      if (Number.isFinite(duration) && duration > 0) return Math.max(STARTUP_MIN_MS, Math.round(duration * 1000) + 240);
      return STARTUP_FALLBACK_MS;
    }
    function queueLeave(){
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      fallbackTimer = window.setTimeout(leave, getDurationMs());
    }
    function begin(){
      if (started) return;
      started = true;
      splash.classList.add('is-playing');
      audio.addEventListener('ended', leave, { once: true });
      audio.addEventListener('loadedmetadata', queueLeave, { once: true });
      audio.addEventListener('durationchange', queueLeave);
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        audio.volume = 1;
        if (areSoundsEnabled()) {
          const playPromise = audio.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(() => { firstPlaySucceeded = true; }).catch(() => {
              try { audio.load(); } catch {}
              window.setTimeout(() => {
                if (firstPlaySucceeded || !document.body.contains(splash)) return;
                try {
                  const retryPromise = audio.play();
                  if (retryPromise && typeof retryPromise.then === 'function') retryPromise.then(() => { firstPlaySucceeded = true; }).catch(() => {});
                } catch {}
              }, 120);
            });
          } else {
            firstPlaySucceeded = true;
          }
        }
      } catch {}
      try {
        if (typeof window.__stepperPrimeLoadingAudio === 'function') window.__stepperPrimeLoadingAudio({ randomize: true });
      } catch {}
      queueLeave();
    }
    prewarmAudio();
    window.addEventListener('pointerdown', unlockAudio, true);
    window.addEventListener('touchstart', unlockAudio, true);
    window.addEventListener('keydown', unlockAudio, true);
    if (button) button.addEventListener('click', begin, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
