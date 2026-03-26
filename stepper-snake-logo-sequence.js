(function(){
  if (window.__stepperSnakeLogoSequenceInstalled) return;
  window.__stepperSnakeLogoSequenceInstalled = true;

  var FRAME_COUNT = 96;
  var FALLBACK_TOTAL_DURATION_MS = 8411;
  var FRAME_FOLDER = './snake-logo-animation-frames';

  function resolveAsset(path){
    try {
      if (window.__stepperResolveAssetUrl) return window.__stepperResolveAssetUrl(path);
    } catch (error) {}
    return path;
  }

  function frameSrc(index){
    return resolveAsset(FRAME_FOLDER + '/wide_frame_' + String(index).padStart(3, '0') + '.png');
  }

  function primeFrames(srcs){
    srcs.forEach(function(src, index){
      try {
        var img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        if (index === 0) {
          try { img.fetchPriority = 'high'; } catch (error) {}
        }
        img.src = src;
      } catch (error) {}
    });
  }

  function readAudio(){
    try {
      if (window.__stepperStartupAudio) return window.__stepperStartupAudio;
    } catch (error) {}
    return null;
  }

  function readAudioDurationMs(){
    try {
      if (typeof window.__stepperGetStartupAudioDurationMs === 'function') {
        var durationMs = Number(window.__stepperGetStartupAudioDurationMs());
        if (Number.isFinite(durationMs) && durationMs > 0) return durationMs;
      }
    } catch (error) {}
    var audio = readAudio();
    if (!audio) return null;
    var duration = Number(audio.duration);
    if (Number.isFinite(duration) && duration > 0) return Math.round(duration * 1000);
    return null;
  }

  function init(){
    var splash = document.getElementById('stepper-static-startup');
    if (!splash) return;

    var introLogo = splash.querySelector('.stepper-static-startup__logo');
    var playbackLogo = splash.querySelector('.stepper-static-startup__playback-logo');
    var button = splash.querySelector('.stepper-static-startup__button');
    if (!introLogo || !playbackLogo || !button) return;

    var frames = Array.from({ length: FRAME_COUNT }, function(_, index){ return frameSrc(index); });
    var firstFrame = frames[0];
    var started = false;
    var rafId = null;
    var startedAt = 0;
    var lastIndex = -1;

    function setFrame(index){
      var safeIndex = Math.max(0, Math.min(FRAME_COUNT - 1, index));
      if (safeIndex === lastIndex) return;
      lastIndex = safeIndex;
      var src = frames[safeIndex];
      if (introLogo.getAttribute('src') !== src) introLogo.setAttribute('src', src);
      if (playbackLogo.getAttribute('src') !== src) playbackLogo.setAttribute('src', src);
    }

    function computeProgress(now){
      var audio = readAudio();
      if (audio) {
        var duration = Number(audio.duration);
        var currentTime = Number(audio.currentTime);
        if (Number.isFinite(duration) && duration > 0 && Number.isFinite(currentTime) && currentTime >= 0) {
          return Math.max(0, Math.min(1, currentTime / duration));
        }
      }
      var durationMs = readAudioDurationMs() || FALLBACK_TOTAL_DURATION_MS;
      var elapsed = Math.max(0, now - startedAt);
      return Math.max(0, Math.min(1, elapsed / durationMs));
    }

    function tick(now){
      if (!started) return;
      var progress = computeProgress(now);
      var index = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
      setFrame(index);
      if (progress < 1 && document.body.contains(splash)) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rafId = null;
        setFrame(FRAME_COUNT - 1);
      }
    }

    function playSequence(){
      if (started) return;
      started = true;
      startedAt = performance.now();
      splash.classList.add('is-playing');
      setFrame(0);
      rafId = window.requestAnimationFrame(tick);
    }

    setFrame(0);
    primeFrames(frames);
    button.addEventListener('click', playSequence, { once: true });
    window.addEventListener('pagehide', function(){
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
