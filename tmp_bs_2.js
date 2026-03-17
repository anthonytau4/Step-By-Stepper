
(function(){
  if (window.__stepperFaviconTransitionInstalled) return;
  window.__stepperFaviconTransitionInstalled = true;

  const GIF_PLAY_MS = 1830;
  const HOLD_MS = 180;
  const FADE_MS = 160;
  const TOTAL_MS = GIF_PLAY_MS + HOLD_MS + FADE_MS;
  const CHANGE_MS = GIF_PLAY_MS;
  const STARTUP_AUDIO_MS = 4064;
  const STARTUP_MS = Math.max(GIF_PLAY_MS + 220, STARTUP_AUDIO_MS + 260);
  const overlayId = 'stepper-snake-transition-overlay';
  const transitionGifSrc = './1000035328.gif';
  const startupSongSrc = './startup-song.m4a';
  const TRANSITION_MESSAGE_SETS = {
    editor: [
      'Recalculating glossary',
      'Refreshing dance tools',
      'Rebuilding section flow',
      'Loading editor surface'
    ],
    preview: [
      'Updating assets',
      'Updating step preview',
      'Configuring counts',
      'Rebuilding print layout'
    ],
    whatsnew: [
      'Loading whats new',
      'Checking whats new updates',
      'Rebuilding release notes',
      'Syncing update feed'
    ],
    featured: [
      'Finding choreographers',
      'Checking for updates',
      'Getting up to date',
      'Contacting choreographer sheets'
    ],
    saveddances: [
      'Whats a dino?',
      'Counting leprechauns',
      'Eating cereal',
      'Business business'
    ]
  };
  const TRANSITION_LABELS = {
    editor: 'Editor',
    preview: 'Sheet',
    whatsnew: 'Whats New',
    featured: 'Featured Choreography',
    saveddances: 'My Saved Dances'
  };
  let overlay = null;
  let burstHost = null;
  let statusWrap = null;
  let statusCard = null;
  let statusKicker = null;
  let statusLine = null;
  let statusTimer = 0;
  let running = false;
  let startupShown = false;
  let warmGif = null;
  let startupAudio = null;

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
      .stepper-favicon-burst-host {
        position: absolute;
        inset: 0;
      }
      .stepper-favicon-status {
        position: absolute;
        left: 50%;
        bottom: clamp(24px, 7vh, 72px);
        transform: translateX(-50%);
        width: min(92vw, 640px);
        display: flex;
        justify-content: center;
        padding: 0 12px;
      }
      .stepper-favicon-status-card {
        min-width: min(82vw, 320px);
        max-width: min(92vw, 540px);
        border-radius: 28px;
        padding: 16px 18px 15px;
        background: linear-gradient(180deg, rgba(20,20,24,.88), rgba(9,9,12,.94));
        border: 1px solid rgba(255,255,255,.12);
        box-shadow: 0 24px 68px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.06);
        backdrop-filter: blur(12px);
        text-align: center;
        color: #fff;
      }
      .stepper-favicon-status-kicker {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 10px;
        padding: 7px 12px;
        border-radius: 999px;
        border: 1px solid rgba(165,180,252,.26);
        background: rgba(99,102,241,.16);
        color: rgba(224,231,255,.95);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .16em;
        text-transform: uppercase;
      }
      .stepper-favicon-status-line {
        margin: 0;
        font-size: clamp(17px, 2.8vw, 24px);
        line-height: 1.18;
        font-weight: 900;
        letter-spacing: -.02em;
        color: #fff;
        text-wrap: balance;
      }
      .stepper-favicon-transition.is-running .stepper-favicon-status-card {
        animation: stepperStatusCard ${TOTAL_MS}ms ease forwards;
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
        width: 100vw;
        height: 100dvh;
        min-height: 100vh;
        background: #000;
        pointer-events: auto;
        opacity: 1;
      }
      .stepper-startup-splash.is-intro {
        opacity: 1;
      }
      .stepper-startup-splash.is-running {
        animation: stepperStartupOverlay ${STARTUP_MS}ms ease forwards;
      }
      .stepper-startup-intro {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: stretch;
        justify-content: center;
        padding: clamp(18px, 3vw, 34px);
        background:
          radial-gradient(circle at 18% 14%, rgba(99,102,241,.22), transparent 30%),
          radial-gradient(circle at 82% 22%, rgba(56,189,248,.14), transparent 24%),
          linear-gradient(180deg, #0d0f17 0%, #050608 58%, #000 100%);
        transition: opacity 200ms ease, transform 200ms ease;
        overflow: hidden;
      }
      .stepper-startup-intro::before,
      .stepper-startup-intro::after {
        content: '';
        position: absolute;
        inset: auto;
        border-radius: 999px;
        pointer-events: none;
        filter: blur(16px);
        opacity: .45;
      }
      .stepper-startup-intro::before {
        width: 38vmax;
        height: 38vmax;
        right: -12vmax;
        top: -10vmax;
        background: radial-gradient(circle, rgba(79,70,229,.35), rgba(79,70,229,0));
      }
      .stepper-startup-intro::after {
        width: 30vmax;
        height: 30vmax;
        left: -8vmax;
        bottom: -10vmax;
        background: radial-gradient(circle, rgba(34,211,238,.2), rgba(34,211,238,0));
      }
      .stepper-startup-splash.is-running .stepper-startup-intro {
        opacity: 0;
        transform: scale(.985);
        pointer-events: none;
      }
      .stepper-startup-shell {
        position: relative;
        z-index: 1;
        width: min(1200px, 100%);
        min-height: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1.08fr) minmax(280px, .92fr);
        gap: clamp(24px, 4vw, 54px);
        align-items: center;
      }
      .stepper-startup-copywrap {
        color: #fff;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .stepper-startup-intro-card {
        width: 100%;
        border-radius: 36px;
        padding: clamp(26px, 4vw, 42px);
        background: linear-gradient(180deg, rgba(18,20,28,.84), rgba(10,10,14,.92));
        border: 1px solid rgba(165,180,252,.28);
        box-shadow: 0 30px 100px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07);
        text-align: left;
        color: #fff;
        backdrop-filter: blur(10px);
      }
      .stepper-startup-kicker {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin: 0;
        padding: 10px 14px;
        border-radius: 999px;
        font-size: clamp(11px, 2vw, 13px);
        font-weight: 900;
        letter-spacing: .22em;
        text-transform: uppercase;
        color: rgba(224,231,255,.96);
        background: rgba(99,102,241,.14);
        border: 1px solid rgba(165,180,252,.2);
        width: fit-content;
      }
      .stepper-startup-headline {
        margin: 0;
        font-size: clamp(40px, 7vw, 74px);
        line-height: .92;
        font-weight: 950;
        letter-spacing: -.05em;
        text-wrap: balance;
      }
      .stepper-startup-headline span {
        display: block;
        color: #a5b4fc;
      }
      .stepper-startup-copy {
        margin: 0;
        max-width: 32rem;
        font-size: clamp(15px, 2.5vw, 19px);
        line-height: 1.5;
        color: rgba(255,255,255,.8);
      }
      .stepper-startup-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .stepper-startup-chip {
        padding: 10px 14px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.05);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: .04em;
        color: rgba(255,255,255,.9);
      }
      .stepper-startup-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 14px;
        align-items: center;
        margin-top: 8px;
      }
      .stepper-startup-button {
        min-width: 220px;
        border: 0;
        border-radius: 999px;
        padding: 16px 26px;
        font-size: 16px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: #fff;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 48%, #7c3aed 100%);
        box-shadow: 0 20px 44px rgba(79,70,229,.42);
        cursor: pointer;
      }
      .stepper-startup-button:active {
        transform: translateY(1px) scale(.99);
      }
      .stepper-startup-subbutton {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: .04em;
        color: rgba(224,231,255,.82);
      }
      .stepper-startup-stage {
        position: relative;
        min-height: min(74vh, 680px);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stepper-startup-stage::before {
        content: '';
        position: absolute;
        inset: auto;
        width: min(70vw, 700px);
        height: min(70vw, 700px);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(99,102,241,.22) 0%, rgba(99,102,241,.08) 34%, rgba(0,0,0,0) 68%);
        filter: blur(8px);
        opacity: .95;
      }
      .stepper-startup-stage::after {
        content: '';
        position: absolute;
        width: min(60vw, 560px);
        height: min(60vw, 560px);
        border-radius: 50%;
        border: 1px solid rgba(165,180,252,.22);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.03), 0 0 60px rgba(99,102,241,.16);
      }
      .stepper-startup-logo {
        position: relative;
        z-index: 1;
        width: min(84vw, 620px);
        height: min(84vw, 620px);
        max-width: none;
        max-height: none;
        object-fit: contain;
        filter: drop-shadow(0 28px 60px rgba(0,0,0,.42));
        transform: scale(.98);
        opacity: .95;
        will-change: transform, opacity, filter;
      }
      .stepper-startup-splash.is-running .stepper-startup-logo {
        animation: stepperStartupLogo ${STARTUP_MS}ms cubic-bezier(.22,.61,.36,1) forwards;
      }
      @media (max-width: 900px) {
        .stepper-startup-shell {
          grid-template-columns: 1fr;
          gap: 16px;
          align-content: center;
        }
        .stepper-startup-intro-card {
          text-align: center;
        }
        .stepper-startup-kicker,
        .stepper-startup-chip-row,
        .stepper-startup-actions {
          justify-content: center;
          margin-left: auto;
          margin-right: auto;
        }
        .stepper-startup-copy {
          margin-left: auto;
          margin-right: auto;
        }
        .stepper-startup-stage {
          min-height: min(38vh, 360px);
          order: -1;
        }
        .stepper-startup-stage::before { width: min(90vw, 520px); height: min(90vw, 520px); }
        .stepper-startup-stage::after { width: min(78vw, 420px); height: min(78vw, 420px); }
        .stepper-startup-logo { width: min(76vw, 360px); height: min(76vw, 360px); }
      }
      @keyframes stepperSnakeOverlay {
        0% { opacity: 0; }
        2% { opacity: 1; }
        92% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes stepperSnakePresence {
        0% { opacity: 0; filter: drop-shadow(0 0 16px rgba(255,168,64,.16)) brightness(.98) saturate(.98); }
        2% { opacity: 1; filter: drop-shadow(0 0 28px rgba(255,175,70,.24)) brightness(1.02) saturate(1.02); }
        89% { opacity: 1; filter: drop-shadow(0 0 30px rgba(255,175,70,.22)) brightness(1.03) saturate(1.03); }
        100% { opacity: 0; filter: drop-shadow(0 0 16px rgba(255,160,60,.14)) brightness(.96) saturate(.96); }
      }
      @keyframes stepperStartupOverlay {
        0% { opacity: 0; }
        10% { opacity: 1; }
        82% { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes stepperStatusCard {
        0% { opacity: 0; transform: translateY(14px) scale(.98); }
        10% { opacity: 1; transform: translateY(0) scale(1); }
        84% { opacity: 1; transform: translateY(0) scale(1); }
        100% { opacity: 0; transform: translateY(8px) scale(.985); }
      }
      @keyframes stepperStartupLogo {
        0% { opacity: 0; transform: scale(.78); filter: drop-shadow(0 10px 24px rgba(0,0,0,.32)); }
        10% { opacity: 1; transform: scale(.96); filter: drop-shadow(0 18px 42px rgba(0,0,0,.42)); }
        24% { opacity: 1; transform: scale(1); filter: drop-shadow(0 22px 48px rgba(0,0,0,.46)); }
        84% { opacity: 1; transform: scale(1); filter: drop-shadow(0 18px 42px rgba(0,0,0,.42)); }
        100% { opacity: 0; transform: scale(.95); filter: drop-shadow(0 10px 20px rgba(0,0,0,.28)); }
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'stepper-favicon-transition';
    overlay.hidden = true;

    burstHost = document.createElement('div');
    burstHost.className = 'stepper-favicon-burst-host';
    overlay.appendChild(burstHost);

    statusWrap = document.createElement('div');
    statusWrap.className = 'stepper-favicon-status';
    statusWrap.setAttribute('aria-hidden', 'true');
    statusCard = document.createElement('div');
    statusCard.className = 'stepper-favicon-status-card';
    statusKicker = document.createElement('div');
    statusKicker.className = 'stepper-favicon-status-kicker';
    statusLine = document.createElement('p');
    statusLine.className = 'stepper-favicon-status-line';
    statusCard.appendChild(statusKicker);
    statusCard.appendChild(statusLine);
    statusWrap.appendChild(statusCard);
    overlay.appendChild(statusWrap);

    document.body.appendChild(overlay);
    return overlay;
  }

  function createBurstImage(){
    ensureOverlay();
    burstHost.innerHTML = '';
    const img = document.createElement('img');
    img.className = 'stepper-favicon-burst';
    img.setAttribute('aria-hidden', 'true');
    img.alt = '';
    img.decoding = 'sync';
    img.src = transitionGifSrc;
    burstHost.appendChild(img);
    return img;
  }

  function resetTransitionAnimation(){
    ensureOverlay();
    overlay.classList.remove('is-running');
    burstHost.innerHTML = '';
    clearTransitionStatus();
    void overlay.offsetWidth;
  }

  function getTransitionKey(target){
    const key = String(target || 'editor').toLowerCase();
    return Object.prototype.hasOwnProperty.call(TRANSITION_MESSAGE_SETS, key) ? key : 'editor';
  }

  function clearTransitionStatus(){
    if (statusTimer) {
      window.clearInterval(statusTimer);
      statusTimer = 0;
    }
    if (statusKicker) statusKicker.textContent = '';
    if (statusLine) statusLine.textContent = '';
  }

  function applyTransitionStatus(target){
    ensureOverlay();
    clearTransitionStatus();
    const key = getTransitionKey(target);
    const messages = TRANSITION_MESSAGE_SETS[key] || TRANSITION_MESSAGE_SETS.editor;
    const label = TRANSITION_LABELS[key] || 'Loading';
    if (statusKicker) statusKicker.textContent = label;
    let index = Math.floor(Math.random() * messages.length);
    const paint = () => {
      if (!statusLine) return;
      statusLine.textContent = messages[index % messages.length];
      index += 1;
    };
    paint();
    if (messages.length > 1) {
      statusTimer = window.setInterval(paint, 260);
    }
  }

  function prepareTransitionAssets(){
    if (warmGif) return warmGif;
    warmGif = new Image();
    warmGif.decoding = 'async';
    warmGif.src = transitionGifSrc;
    return warmGif;
  }

  function ensureStartupAudio(){
    if (startupAudio) return startupAudio;
    startupAudio = new Audio(startupSongSrc);
    startupAudio.preload = 'auto';
    startupAudio.loop = false;
    startupAudio.volume = 1;
    try { startupAudio.playsInline = true; } catch {}
    return startupAudio;
  }

  function runStartupSplash(){ return; }

  window.__stepperRunFaviconTransition = function(changePage, options){
    ensureOverlay();
    if (running) return;
    running = true;

    const target = typeof options === 'string'
      ? options
      : options && typeof options === 'object'
        ? (options.target || options.page || 'editor')
        : 'editor';

    prepareTransitionAssets();
    resetTransitionAnimation();
    createBurstImage();
    applyTransitionStatus(target);
    overlay.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add('is-running');
      try { if (typeof changePage === 'function') changePage(); } catch (error) { console.error(error); }
    });

    window.setTimeout(() => {
      overlay.hidden = true;
      overlay.classList.remove('is-running');
      burstHost.innerHTML = '';
      clearTransitionStatus();
      running = false;
    }, TOTAL_MS + 34);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      prepareTransitionAssets();
    }, { once: true });
  } else {
    prepareTransitionAssets();
  }
})();
