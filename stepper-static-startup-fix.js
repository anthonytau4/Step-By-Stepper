(function(){
  if (window.__stepperStaticStartupInstalled) return;
  window.__stepperStaticStartupInstalled = true;

  function removeStartupSplash(){
    try { sessionStorage.setItem('__stepper_startup_seen', '1'); } catch(e){}
    try {
      var splash = document.getElementById('stepper-static-startup');
      if (splash) {
        splash.hidden = true;
        splash.setAttribute('data-stepper-startup-disabled', 'true');
        splash.remove();
      }
    } catch(e){}
    window.__stepperStartupAudio = null;
    window.__stepperGetStartupAudioDurationMs = function(){ return 0; };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeStartupSplash, { once: true });
  } else {
    removeStartupSplash();
  }
})();
