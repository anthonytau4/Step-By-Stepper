
(function(){
  if (window.__stepperSettingsTextureInstalled) return;
  window.__stepperSettingsTextureInstalled = true;

  const SETTINGS_KEY = "stepper_audio_settings_v2";
  const BUILDER_KEY = "linedance_builder_data_v13";
  const THINKING_TRACK = "./thinking-music.wav";
  const SFX_FILES = ["light-mode.mp3","dark-mode.mp3","tab-change.wav","ui-action.mp3","open-right-click.mp3","delete.mp3"];
  const originalPlay = HTMLMediaElement.prototype.play;
  let thinkingAudio = null;
  let settings = Object.assign({ sfxEnabled: true, thinkingMusicEnabled: false }, safeReadJSON(SETTINGS_KEY, {}));

  function safeReadJSON(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveSettings(){
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (error) {}
  }

  function isDarkMode(){
    const appState = safeReadJSON(BUILDER_KEY, {});
    return !!appState.isDarkMode;
  }

  function srcOf(media){
    return String((media && (media.currentSrc || media.src)) || '');
  }

  function isSfx(src){
    return SFX_FILES.some(file => src.includes(file));
  }

  function isThinking(src){
    return src.includes('thinking-music.wav');
  }

  HTMLMediaElement.prototype.play = function(){
    const src = srcOf(this);
    if (isThinking(src) && !settings.thinkingMusicEnabled) {
      try { this.pause(); this.currentTime = 0; } catch (error) {}
      return Promise.resolve();
    }
    if (isSfx(src) && !settings.sfxEnabled) {
      try { this.pause(); this.currentTime = 0; } catch (error) {}
      return Promise.resolve();
    }
    return originalPlay.apply(this, arguments);
  };

  function buildThinkingAudio(){
    if (thinkingAudio) return thinkingAudio;
    thinkingAudio = new Audio(THINKING_TRACK);
    thinkingAudio.loop = true;
    thinkingAudio.preload = 'auto';
    thinkingAudio.volume = 0.35;
    return thinkingAudio;
  }

  function stopDomAudio(){
    document.querySelectorAll('audio,video').forEach(media => {
      const src = srcOf(media);
      if (isSfx(src) || isThinking(src)) {
        try { media.pause(); media.currentTime = 0; } catch (error) {}
      }
    });
  }

  function syncThinkingMusic(){
    const audio = buildThinkingAudio();
    if (settings.thinkingMusicEnabled && !document.hidden) {
      const playResult = audio.play();
      if (playResult && typeof playResult.catch === 'function') playResult.catch(() => {});
    } else {
      try { audio.pause(); audio.currentTime = 0; } catch (error) {}
    }
  }

  function playFeedback(file){
    if (!settings.sfxEnabled) return;
    try {
      const audio = new Audio(file);
      audio.preload = 'auto';
      const playResult = audio.play();
      if (playResult && typeof playResult.catch === 'function') playResult.catch(() => {});
    } catch (error) {}
  }

  document.addEventListener('visibilitychange', syncThinkingMusic);
  ['pointerdown','touchstart','keydown'].forEach(eventName => {
    document.addEventListener(eventName, function wakeAudio(){
      if (settings.thinkingMusicEnabled) syncThinkingMusic();
    }, { once: true, capture: true, passive: eventName !== 'keydown' });
  });

  const style = document.createElement('style');
  style.textContent = `
    button,
    .stepper-settings-mark,
    .stepper-setting-icon-box,
    [class~="inline-flex"][class~="items-center"][class~="justify-center"][class~="rounded-xl"][class*="bg-indigo-100"] {
      position: relative;
      overflow: hidden;
      isolation: isolate;
    }
    button::before,
    .stepper-settings-mark::before,
    .stepper-setting-icon-box::before,
    [class~="inline-flex"][class~="items-center"][class~="justify-center"][class~="rounded-xl"][class*="bg-indigo-100"]::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background:
        linear-gradient(135deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,0) 28%, rgba(0,0,0,.08) 62%, rgba(255,255,255,.08) 100%),
        repeating-linear-gradient(135deg, rgba(255,255,255,.05) 0 4px, rgba(0,0,0,.05) 4px 8px),
        radial-gradient(circle at 18% 22%, rgba(255,255,255,.22) 0 1px, transparent 1.5px),
        radial-gradient(circle at 72% 70%, rgba(0,0,0,.14) 0 1px, transparent 1.8px),
        radial-gradient(circle at 38% 78%, rgba(255,255,255,.12) 0 1px, transparent 1.6px);
      opacity: .42;
      mix-blend-mode: soft-light;
      z-index: 0;
    }
    button::after,
    .stepper-settings-mark::after,
    .stepper-setting-icon-box::after,
    [class~="inline-flex"][class~="items-center"][class~="justify-center"][class~="rounded-xl"][class*="bg-indigo-100"]::after {
      content: '';
      position: absolute;
      top: -120%;
      bottom: -120%;
      left: -52%;
      width: 38%;
      transform: translateX(-170%) rotate(28deg);
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,.08) 18%, rgba(255,255,255,.48) 50%, rgba(255,255,255,.08) 82%, transparent 100%);
      opacity: 0;
      pointer-events: none;
      transition: transform .62s ease, opacity .24s ease;
      z-index: 0;
      filter: blur(.4px);
    }
    button:hover::after,
    .stepper-settings-mark:hover::after,
    .stepper-setting-icon-box:hover::after,
    [class~="inline-flex"][class~="items-center"][class~="justify-center"][class~="rounded-xl"][class*="bg-indigo-100"]:hover::after {
      opacity: .95;
      transform: translateX(365%) rotate(28deg);
    }
    button > *,
    .stepper-settings-mark > *,
    .stepper-setting-icon-box > *,
    [class~="inline-flex"][class~="items-center"][class~="justify-center"][class~="rounded-xl"][class*="bg-indigo-100"] > * {
      position: relative;
      z-index: 1;
    }
    .stepper-settings-tab {
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      border-radius: 14px;
      padding: 8px 12px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: .01em;
      transition: background-color .18s ease, color .18s ease, box-shadow .18s ease, transform .18s ease;
      box-shadow: inset 0 0 0 1px rgba(99,102,241,.10), 0 6px 18px rgba(17,24,39,.08);
    }
    .stepper-settings-tab:hover { transform: translateY(-1px); }
    .stepper-settings-tab[data-dark="false"] { color: #404040; }
    .stepper-settings-tab[data-dark="false"]:hover { background: rgba(99,102,241,.10); color: #4338ca; }
    .stepper-settings-tab[data-dark="true"] { color: #d4d4d8; }
    .stepper-settings-tab[data-dark="true"]:hover { background: rgba(99,102,241,.18); color: #c7d2fe; }
    .stepper-settings-tab[data-active="true"][data-dark="false"] {
      background: #ffffff;
      color: #312e81;
      box-shadow: 0 10px 28px rgba(79,70,229,.14), inset 0 0 0 1px rgba(129,140,248,.28);
    }
    .stepper-settings-tab[data-active="true"][data-dark="true"] {
      background: rgba(24,24,27,.95);
      color: #eef2ff;
      box-shadow: 0 10px 28px rgba(0,0,0,.24), inset 0 0 0 1px rgba(129,140,248,.28);
    }
    .stepper-settings-icon {
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
    }
    .stepper-settings-overlay[hidden] { display: none !important; }
    .stepper-settings-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      background: rgba(10,10,14,.60);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 12px;
    }
    .stepper-settings-page {
      width: min(100%, 960px);
      min-height: 100%;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(0,0,0,.32);
      display: flex;
      flex-direction: column;
      border: 1px solid rgba(255,255,255,.12);
    }
    .stepper-settings-page[data-dark="false"] {
      background: #f8fafc;
      color: #171717;
      border-color: rgba(23,23,23,.08);
    }
    .stepper-settings-page[data-dark="true"] {
      background: #0a0a0f;
      color: #f5f5f5;
      border-color: rgba(255,255,255,.08);
    }
    .stepper-settings-header {
      padding: 20px 20px 18px;
      border-bottom: 1px solid rgba(127,127,127,.18);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .stepper-settings-heading {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }
    .stepper-settings-mark {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6b7280, #e5e7eb 45%, #6b7280 100%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 12px 28px rgba(31,41,55,.24), inset 0 0 0 1px rgba(255,255,255,.18);
      flex: 0 0 auto;
    }
    .stepper-settings-title {
      margin: 0;
      font-size: clamp(24px, 4vw, 32px);
      line-height: 1;
      font-weight: 900;
      letter-spacing: -.04em;
      text-transform: uppercase;
    }
    .stepper-settings-subtitle {
      margin: 6px 0 0;
      font-size: 14px;
      line-height: 1.45;
      opacity: .72;
      max-width: 40rem;
    }
    .stepper-settings-close {
      border: 0;
      background: transparent;
      color: inherit;
      border-radius: 16px;
      width: 46px;
      height: 46px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background-color .18s ease, transform .18s ease;
      flex: 0 0 auto;
    }
    .stepper-settings-close:hover { transform: translateY(-1px); }
    .stepper-settings-page[data-dark="false"] .stepper-settings-close:hover { background: rgba(23,23,23,.06); }
    .stepper-settings-page[data-dark="true"] .stepper-settings-close:hover { background: rgba(255,255,255,.08); }
    .stepper-settings-body {
      padding: 20px;
      display: grid;
      gap: 18px;
    }
    .stepper-settings-card {
      border-radius: 24px;
      padding: 18px;
      border: 1px solid rgba(127,127,127,.18);
      display: grid;
      gap: 16px;
    }
    .stepper-settings-page[data-dark="false"] .stepper-settings-card {
      background: #ffffff;
      border-color: rgba(23,23,23,.08);
    }
    .stepper-settings-page[data-dark="true"] .stepper-settings-card {
      background: #111114;
      border-color: rgba(255,255,255,.08);
    }
    .stepper-setting-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 14px;
    }
    .stepper-setting-copy {
      display: grid;
      gap: 6px;
      min-width: 0;
    }
    .stepper-setting-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -.03em;
      margin: 0;
    }
    .stepper-setting-desc {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      opacity: .72;
    }
    .stepper-setting-toggle {
      border: 0;
      color: inherit;
      font: inherit;
      cursor: pointer;
      border-radius: 999px;
      padding: 8px 10px 8px 8px;
      min-height: 56px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: background-color .18s ease, transform .18s ease, box-shadow .18s ease;
      white-space: nowrap;
      justify-self: end;
      box-shadow: inset 0 0 0 1px rgba(99,102,241,.12), 0 10px 24px rgba(17,24,39,.08);
    }
    .stepper-setting-toggle:hover { transform: translateY(-1px); }
    .stepper-settings-page[data-dark="false"] .stepper-setting-toggle {
      background: #eef2ff;
    }
    .stepper-settings-page[data-dark="true"] .stepper-setting-toggle {
      background: rgba(79,70,229,.14);
      box-shadow: inset 0 0 0 1px rgba(129,140,248,.18), 0 10px 24px rgba(0,0,0,.22);
    }
    .stepper-setting-toggle[data-on="false"] {
      opacity: .9;
    }
    .stepper-setting-toggle[data-on="true"] {
      box-shadow: 0 12px 28px rgba(79,70,229,.20), inset 0 0 0 1px rgba(129,140,248,.18);
    }
    .stepper-setting-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #6b7280, #f3f4f6 46%, #6b7280 100%);
      color: #111827;
      flex: 0 0 auto;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.24), 0 8px 18px rgba(17,24,39,.18);
    }
    .stepper-setting-text {
      display: grid;
      line-height: 1.05;
      text-align: left;
    }
    .stepper-setting-state {
      font-size: 12px;
      font-weight: 900;
      letter-spacing: .12em;
      text-transform: uppercase;
      opacity: .68;
    }
    .stepper-setting-value {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: -.02em;
    }
    .stepper-settings-note {
      font-size: 13px;
      line-height: 1.6;
      opacity: .72;
      padding-top: 4px;
    }
    @media (max-width: 720px) {
      .stepper-settings-overlay { padding: 0; }
      .stepper-settings-page { width: 100%; min-height: 100%; border-radius: 0; }
      .stepper-setting-row { grid-template-columns: 1fr; }
      .stepper-setting-toggle { justify-self: stretch; }
    }
  `;
  document.head.appendChild(style);

  function iconSettings(){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-.33-1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1-.33H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1-.33 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 .33 1 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.25.3.46.65.6 1 .14.35.21.72.21 1.09s-.07.74-.21 1.09c-.14.35-.35.7-.6 1.02Z"></path></svg>`;
  }

  function iconClose(){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>`;
  }

  function iconSpeaker(muted){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path>${muted ? `<path d="M4 4 20 20"></path>` : ``}</svg>`;
  }

  function iconMusic(muted){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><path d="M10 15V9l6-1v6"></path><circle cx="9" cy="16" r="1.75"></circle><circle cx="15" cy="15" r="1.75"></circle>${muted ? `<path d="M5 5 19 19"></path>` : ``}</svg>`;
  }

  function cleanText(text){
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  const overlay = document.createElement('div');
  overlay.className = 'stepper-settings-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="stepper-settings-page" data-dark="false" role="dialog" aria-modal="true" aria-labelledby="stepper-settings-title">
      <div class="stepper-settings-header">
        <div class="stepper-settings-heading">
          <div class="stepper-settings-mark">${iconSettings()}</div>
          <div>
            <h2 class="stepper-settings-title" id="stepper-settings-title">Settings</h2>
            <p class="stepper-settings-subtitle">Tidy little sound controls, because not every tap needs to shout at you.</p>
          </div>
        </div>
        <button class="stepper-settings-close" type="button" aria-label="Close settings">${iconClose()}</button>
      </div>
      <div class="stepper-settings-body">
        <section class="stepper-settings-card">
          <div class="stepper-setting-row">
            <div class="stepper-setting-copy">
              <h3 class="stepper-setting-title">SFX Sounds</h3>
              <p class="stepper-setting-desc">Turns button taps, tab clicks, delete sounds, and the little UI noises on or off. Starts on.</p>
            </div>
            <button class="stepper-setting-toggle" type="button" data-setting="sfxEnabled">
              <span class="stepper-setting-icon-box"></span>
              <span class="stepper-setting-text">
                <span class="stepper-setting-state">Status</span>
                <span class="stepper-setting-value"></span>
              </span>
            </button>
          </div>
          <div class="stepper-setting-row">
            <div class="stepper-setting-copy">
              <h3 class="stepper-setting-title">Thinking Music</h3>
              <p class="stepper-setting-desc">Plays your uploaded lobby track in a loop while you work. Starts off.</p>
            </div>
            <button class="stepper-setting-toggle" type="button" data-setting="thinkingMusicEnabled">
              <span class="stepper-setting-icon-box"></span>
              <span class="stepper-setting-text">
                <span class="stepper-setting-state">Status</span>
                <span class="stepper-setting-value"></span>
              </span>
            </button>
          </div>
          <div class="stepper-settings-note">Thinking Music uses <strong>Polished Stone Lobby.wav</strong> in this build so the toggle actually controls a real track instead of a dead empty promise.</div>
        </section>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const page = overlay.querySelector('.stepper-settings-page');
  const closeButton = overlay.querySelector('.stepper-settings-close');
  const toggleButtons = Array.from(overlay.querySelectorAll('.stepper-setting-toggle'));

  function updateOverlay(){
    const dark = isDarkMode();
    page.dataset.dark = dark ? 'true' : 'false';
    toggleButtons.forEach(button => {
      const key = button.getAttribute('data-setting');
      const enabled = !!settings[key];
      button.dataset.on = enabled ? 'true' : 'false';
      button.querySelector('.stepper-setting-icon-box').innerHTML = key === 'sfxEnabled' ? iconSpeaker(!enabled) : iconMusic(!enabled);
      button.querySelector('.stepper-setting-value').textContent = enabled ? 'On' : 'Off';
    });
  }

  function closeSettingsPage(){
    overlay.hidden = true;
    document.body.style.overflow = '';
    refreshSettingsTab();
  }

  function openSettingsPage(){
    updateOverlay();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    refreshSettingsTab();
  }

  overlay.addEventListener('click', event => {
    if (event.target === overlay) {
      if (window.__stepperRunFaviconTransition) {
        window.__stepperRunFaviconTransition(() => {
          closeSettingsPage();
        });
      } else {
        closeSettingsPage();
      }
    }
  });
  closeButton.addEventListener('click', () => {
    playFeedback('./ui-action.mp3');
    if (window.__stepperRunFaviconTransition) {
      window.__stepperRunFaviconTransition(() => {
        closeSettingsPage();
      });
    } else {
      closeSettingsPage();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !overlay.hidden) {
      if (window.__stepperRunFaviconTransition) {
        window.__stepperRunFaviconTransition(() => {
          closeSettingsPage();
        });
      } else {
        closeSettingsPage();
      }
    }
  });

  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const key = button.getAttribute('data-setting');
      settings[key] = !settings[key];
      saveSettings();
      if (key === 'sfxEnabled' && !settings.sfxEnabled) stopDomAudio();
      if (key === 'thinkingMusicEnabled') syncThinkingMusic();
      if (settings.sfxEnabled) playFeedback('./ui-action.mp3');
      updateOverlay();
      refreshSettingsTab();
    });
  });

  function findTabRail(){
    return Array.from(document.querySelectorAll('header div')).find(element => {
      const labels = Array.from(element.querySelectorAll(':scope > button')).map(button => cleanText(button.textContent));
      return labels.includes('Build') && labels.includes('Sheet') && labels.includes("What's New");
    }) || null;
  }

  function refreshSettingsTab(){
    const rail = findTabRail();
    if (!rail) return false;
    let button = rail.querySelector('.stepper-settings-tab');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'stepper-settings-tab';
      button.innerHTML = `<span class="stepper-settings-icon">${iconSettings()}</span><span>Settings</span>`;
      button.addEventListener('click', () => {
        const openNow = () => {
          playFeedback('./tab-change.wav');
          openSettingsPage();
        };
        if (window.__stepperRunFaviconTransition) {
          window.__stepperRunFaviconTransition(openNow);
        } else {
          openNow();
        }
      });
      rail.appendChild(button);
    }
    button.dataset.dark = isDarkMode() ? 'true' : 'false';
    button.dataset.active = overlay.hidden ? 'false' : 'true';
    return true;
  }

  let attempts = 0;
  const finder = setInterval(() => {
    attempts += 1;
    const found = refreshSettingsTab();
    updateOverlay();
    if (found || attempts > 30) clearInterval(finder);
  }, 350);

  setInterval(() => {
    refreshSettingsTab();
    updateOverlay();
  }, 2000);

  updateOverlay();
  refreshSettingsTab();
  syncThinkingMusic();
})();
