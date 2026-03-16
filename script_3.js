
(function(){
  if (window.__stepperFaviconTransitionInstalled) return;
  window.__stepperFaviconTransitionInstalled = true;

  const TOTAL_MS = 500;
  const HALF_MS = TOTAL_MS / 2;
  let overlay = null;
  let logo = null;
  let running = false;

  function ensureOverlay(){
    if (overlay) return overlay;
    const style = document.createElement('style');
    style.textContent = `
      .stepper-favicon-transition[hidden] { display: none !important; }
      .stepper-favicon-transition {
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .stepper-favicon-transition::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(99,102,241,.18) 0%, rgba(99,102,241,.12) 16%, rgba(15,23,42,.08) 42%, rgba(15,23,42,0) 70%);
        opacity: 0;
        transition: opacity ${HALF_MS}ms ease;
      }
      .stepper-favicon-transition.is-expanding::before { opacity: 1; }
      .stepper-favicon-transition.is-shrinking::before { opacity: 0; }
      .stepper-favicon-transition img {
        width: var(--stepper-favicon-size, 88px);
        height: auto;
        opacity: 0;
        transform: translateZ(0) rotate(-140deg) scale(0.0001);
        transform-origin: center center;
        will-change: transform, opacity;
        filter: drop-shadow(0 0 18px rgba(255,255,255,.22)) drop-shadow(0 0 50px rgba(79,70,229,.28));
        transition: transform ${HALF_MS}ms cubic-bezier(.2,.82,.18,1), opacity 90ms linear;
      }
      .stepper-favicon-transition.is-expanding img {
        opacity: 1;
        transform: translateZ(0) rotate(520deg) scale(var(--stepper-favicon-scale, 28));
      }
      .stepper-favicon-transition.is-shrinking img {
        opacity: 0;
        transform: translateZ(0) rotate(1000deg) scale(0.0001);
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.className = 'stepper-favicon-transition';
    overlay.hidden = true;

    logo = document.createElement('img');
    logo.src = './favicon.png';
    logo.alt = '';
    logo.setAttribute('aria-hidden', 'true');
    overlay.appendChild(logo);
    document.body.appendChild(overlay);
    return overlay;
  }

  function setScale(){
    ensureOverlay();
    const baseSize = Math.max(68, Math.min(window.innerWidth * 0.16, 110));
    const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
    const targetScale = Math.max(18, (diagonal / baseSize) * 2.35);
    overlay.style.setProperty('--stepper-favicon-size', `${baseSize}px`);
    overlay.style.setProperty('--stepper-favicon-scale', String(targetScale));
  }

  window.__stepperRunFaviconTransition = function(changePage){
    if (running) return;
    setScale();
    running = true;
    overlay.hidden = false;
    overlay.classList.remove('is-shrinking');
    overlay.classList.remove('is-expanding');
    void overlay.offsetWidth;
    overlay.classList.add('is-expanding');

    window.setTimeout(() => {
      try { if (typeof changePage === 'function') changePage(); } catch (error) { console.error(error); }
      overlay.classList.remove('is-expanding');
      overlay.classList.add('is-shrinking');
    }, HALF_MS);

    window.setTimeout(() => {
      overlay.hidden = true;
      overlay.classList.remove('is-shrinking');
      running = false;
    }, TOTAL_MS + 34);
  };

  window.addEventListener('resize', setScale, { passive: true });
})();
