(function(){
  if (window.__stepperSnakeLogoSequenceInstalled) return;
  window.__stepperSnakeLogoSequenceInstalled = true;

  var FRAME_COUNT = 96;
  var FRAME_DELAY_MS = 40;
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
    var timerId = null;

    function setFrame(src){
      if (introLogo.getAttribute('src') !== src) introLogo.setAttribute('src', src);
      if (playbackLogo.getAttribute('src') !== src) playbackLogo.setAttribute('src', src);
    }

    function playSequence(){
      if (started) return;
      started = true;
      setFrame(firstFrame);
      splash.classList.add('is-playing');
      var index = 0;
      function advance(){
        setFrame(frames[index]);
        index += 1;
        if (index < frames.length) {
          timerId = window.setTimeout(advance, FRAME_DELAY_MS);
        } else {
          setFrame(frames[frames.length - 1]);
        }
      }
      advance();
    }

    setFrame(firstFrame);
    primeFrames(frames);
    button.addEventListener('click', playSequence, { once: true });
    window.addEventListener('pagehide', function(){
      if (timerId) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
