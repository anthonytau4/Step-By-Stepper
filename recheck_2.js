
(function(){
  if (window.__stepperFaviconTransitionInstalled) return;
  window.__stepperFaviconTransitionInstalled = true;

  const PLAY_MS = 460;
  const HOLD_MS = 170;
  const FADE_MS = 110;
  const TOTAL_MS = PLAY_MS + HOLD_MS + FADE_MS;
  const CHANGE_MS = PLAY_MS;
  const STARTUP_MS = 1350;
  const overlayId = 'stepper-snake-transition-overlay';
  const transitionGifSrc = './favicon-snake-steps-animation.gif';
  let overlay = null;
  let burst = null;
  let running = false;
  let startupShown = false;
  let startupGifReady = null;

  function ensureOverlay(){
    if (overlay) return overlay;
    const style = document.createElement('style');
    style.textContent = `
      .stepper-favicon-transition[hidden],
      .stepper-startup-splash[hidden] { display: none !important; }
      .stepper-favicon-transition,
      .stepper-startup-splash {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        pointer-events: none;
        overflow: hidden;
        opacity: 0;
      }
      .stepper-favicon-transition {
        background: #000;
      }
      .stepper-favicon-burst {
        position: absolute;
        left: 50%;
        top: 50%;
        width: min(92vmin, 620px);
        height: min(92vmin, 620px);
        object-fit: contain;
        transform: translate(-50%, -50%);
        opacity: 0;
        filter: drop-shadow(0 0 34px rgba(255,170,65,.22));
        will-change: opacity, filter;
      }
      .stepper-favicon-transition.is-running {
        animation: stepperSnakeOverlay ${TOTAL_MS}ms linear forwards;
      }
      .stepper-favicon-transition.is-running .stepper-favicon-burst {
        animation: stepperSnakePresence ${TOTAL_MS}ms linear forwards;
      }
      .stepper-startup-splash {
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #000;
      }
      .stepper-startup-splash.is-running {
        animation: stepperStartupOverlay ${STARTUP_MS}ms ease forwards;
      }
      .stepper-startup-logo {
        position: relative;
        width: min(82vmin, 512px);
        height: min(82vmin, 512px);
        object-fit: contain;
        filter: drop-shadow(0 18px 42px rgba(0,0,0,.42));
        transform: scale(.78);
        opacity: 0;
        will-change: transform, opacity, filter;
      }
      .stepper-startup-splash.is-running .stepper-startup-logo {
        animation: stepperStartupLogo ${STARTUP_MS}ms cubic-bezier(.22,.61,.36,1) forwards;
      }
      @keyframes stepperSnakeOverlay {
        0% { opacity: 0; }
        4% { opacity: 1; }
        92% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes stepperSnakePresence {
        0% { opacity: 0; filter: drop-shadow(0 0 16px rgba(255,168,64,.16)) brightness(.98) saturate(.98); }
        5% { opacity: 1; filter: drop-shadow(0 0 28px rgba(255,175,70,.24)) brightness(1.02) saturate(1.02); }
        86% { opacity: 1; filter: drop-shadow(0 0 30px rgba(255,175,70,.22)) brightness(1.03) saturate(1.03); }
        100% { opacity: 0; filter: drop-shadow(0 0 16px rgba(255,160,60,.14)) brightness(.96) saturate(.96); }
      }
      @keyframes stepperStartupOverlay {
        0% { opacity: 0; }
        10% { opacity: 1; }
        82% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes stepperStartupLogo {
        0% { opacity: 0; transform: scale(.72); filter: drop-shadow(0 10px 24px rgba(0,0,0,.32)); }
        12% { opacity: 1; transform: scale(.92); filter: drop-shadow(0 18px 42px rgba(0,0,0,.42)); }
        30% { opacity: 1; transform: scale(1); filter: drop-shadow(0 22px 48px rgba(0,0,0,.46)); }
        78% { opacity: 1; transform: scale(1); filter: drop-shadow(0 18px 42px rgba(0,0,0,.42)); }
        100% { opacity: 0; transform: scale(.9); filter: drop-shadow(0 10px 20px rgba(0,0,0,.28)); }
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'stepper-favicon-transition';
    overlay.hidden = true;

    burst = document.createElement('img');
    burst.className = 'stepper-favicon-burst';
    burst.setAttribute('aria-hidden', 'true');
    burst.alt = '';
    overlay.appendChild(burst);

    document.body.appendChild(overlay);
    return overlay;
  }

  function restartGif(imgEl, src){
    const token = Date.now() + '-' + Math.random().toString(36).slice(2,7);
    imgEl.removeAttribute('src');
    imgEl.src = `${src}?restart=${token}`;
  }

  function resetTransitionAnimation(){
    ensureOverlay();
    overlay.classList.remove('is-running');
    burst.style.animation = 'none';
    void burst.offsetWidth;
    burst.style.animation = '';
    void overlay.offsetWidth;
  }

  function preloadImage(src){
    return new Promise(resolve => {
      const img = new Image();
      const finish = () => resolve(img);
      img.onload = finish;
      img.onerror = () => resolve(null);
      img.src = src;
      if (img.complete) finish();
    });
  }

  function prepareTransitionAssets(){
    if (!startupGifReady) {
      startupGifReady = preloadImage(transitionGifSrc).catch(() => null);
    }
    return startupGifReady;
  }

  function runStartupSplash(){
    if (startupShown) return;
    startupShown = true;
    const splash = document.createElement('div');
    splash.className = 'stepper-startup-splash';
    splash.hidden = true;
    splash.innerHTML = `<img class="stepper-startup-logo" src="${transitionGifSrc}" alt="Step by Stepper startup animation" />`;
    document.body.appendChild(splash);
    splash.hidden = false;
    void splash.offsetWidth;
    splash.classList.add('is-running');
    window.setTimeout(() => {
      splash.hidden = true;
      splash.remove();
    }, STARTUP_MS + 40);
  }

  window.__stepperRunFaviconTransition = function(changePage){
    ensureOverlay();
    if (running) return;
    running = true;

    prepareTransitionAssets();
    resetTransitionAnimation();
    restartGif(burst, transitionGifSrc);
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add('is-running');
    });

    window.setTimeout(() => {
      try { if (typeof changePage === 'function') changePage(); } catch (error) { console.error(error); }
    }, CHANGE_MS);

    window.setTimeout(() => {
      overlay.hidden = true;
      overlay.classList.remove('is-running');
      burst.removeAttribute('src');
      running = false;
    }, TOTAL_MS + 34);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      prepareTransitionAssets();
      runStartupSplash();
    }, { once: true });
  } else {
    prepareTransitionAssets();
    runStartupSplash();
  }
})();
