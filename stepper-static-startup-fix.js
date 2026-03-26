(function(){
  if (window.__stepperStaticStartupInstalled) return;
  window.__stepperStaticStartupInstalled = true;
  const STARTUP_MIN_MS = 8400;
  const STARTUP_FALLBACK_MS = 9800;
  const STARTUP_FADE_MS = 340;
  const SETTINGS_KEY = 'stepper_sound_settings_v1';
  const STARTUP_AUDIO_SOURCES = [
    (window.__stepperResolveAssetUrl ? window.__stepperResolveAssetUrl('./startup-song.mp3') : './startup-song.mp3'),
    (window.__stepperResolveAssetUrl ? window.__stepperResolveAssetUrl('./startup-song.m4a') : './startup-song.m4a')
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
  function buildStartupAudio(){
    if (window.createAudioElement) {
      const audio = window.createAudioElement(STARTUP_AUDIO_SOURCES);
      audio.loop = false;
      audio.volume = 1;
      return audio;
    }
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    try { audio.playsInline = true; } catch {}
    STARTUP_AUDIO_SOURCES.map((src) => [src, src.endsWith('.mp3') ? 'audio/mpeg' : 'audio/mp4']).forEach(([src,type]) => {
      const source = document.createElement('source');
      source.src = src;
      source.type = type;
      audio.appendChild(source);
    });
    try { audio.load(); } catch {}
    return audio;
  }
  function init(){
    const splash = document.getElementById('stepper-static-startup');
    if (!splash) return;
    const button = splash.querySelector('.stepper-static-startup__button');
    const audio = buildStartupAudio();
    let started = false;
    let leaving = false;
    let fallbackTimer = null;
    function leave(){
      if (leaving) return;
      leaving = true;
      splash.classList.add('is-leaving');
      window.setTimeout(() => {
        try { audio.pause(); audio.currentTime = 0; } catch {}
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
        if (areSoundsEnabled()) {
          const playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
        }
      } catch {}
      try {
        if (typeof window.__stepperPrimeLoadingAudio === 'function') window.__stepperPrimeLoadingAudio({ randomize: true });
      } catch {}
      queueLeave();
    }
    if (button) button.addEventListener('click', begin, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
