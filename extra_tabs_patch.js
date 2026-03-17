(function(){
  if (window.__stepperExtraTabsInstalled) return;
  window.__stepperExtraTabsInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const FEATURED_KEY = 'stepper_featured_dances_v1';
  const SETTINGS_KEY = 'stepper_sound_settings_v1';
  const WHATSNEW_PAGE_ID = 'stepper-whatsnew-page';
  const INLINE_HOST_ID = 'stepper-editor-inline-host';
  const CHOREO_PANEL_ID = 'stepper-inline-choreography';
  const SETTINGS_PANEL_ID = 'stepper-inline-settings';
  const EXTRA_NOTES = [
    'Fix: the page switch GIF now loads properly on Android without the blank image nonsense.',
    'New: Settings and Choreography now sit right above the editor instead of being shoved into extra page-strip tabs.',
    'New: Choreography shows the dances you build with the app on this device, so the saved work is easier to reach.',
    'New: Settings still includes SFX and Thinking Music toggles, now tucked into the editor where they belong.'
  ];
  const sfxFiles = ['light-mode.mp3','dark-mode.mp3','tab-change.wav','ui-action.mp3','open-right-click.mp3','delete.mp3'];
  let activeExtraPage = null;
  let tabStrip = null;
  let buildBtn = null;
  let sheetBtn = null;
  let whatsNewBtn = null;
  let featuredBtn = null;
  let settingsBtn = null;
  let dragState = null;
  let mainEl = null;
  let footerWrap = null;
  let host = null;
  let inlineHost = null;
  let thinkingAudio = null;
  let lastSyncedSignature = '';

  function readAppData(){
    try {
      const raw = localStorage.getItem(DATA_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function isDarkMode(){
    const data = readAppData();
    return !!(data && data.isDarkMode);
  }

  function getSettings(){
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      return {
        sfxEnabled: saved.sfxEnabled !== false,
        thinkingMusicEnabled: saved.thinkingMusicEnabled === true
      };
    } catch {
      return { sfxEnabled: true, thinkingMusicEnabled: false };
    }
  }

  function saveSettings(settings){
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function iconSpeaker(on){
    return on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  }

  function iconMusic(on){
    return on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect><path d="M10 16V9l7-1.5V14"></path><circle cx="8" cy="16" r="2"></circle><circle cx="17" cy="14" r="2"></circle></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect><path d="M10 16V9l7-1.5V14"></path><circle cx="8" cy="16" r="2"></circle><circle cx="17" cy="14" r="2"></circle><line x1="5" y1="19" x2="19" y2="5"></line></svg>';
  }

  function iconSparkles(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"></path><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"></path><path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z"></path></svg>';
  }

  function iconCog(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.4a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.97 4.1a1.7 1.7 0 0 0 1.03-1.56V2.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.33 1.82 1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z"></path></svg>';
  }

  function ensureAudioPatch(){
    if (window.__stepperAudioSettingsPatched) return;
    window.__stepperAudioSettingsPatched = true;
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(){
      try {
        const src = (this.currentSrc || this.src || '').toLowerCase();
        const settings = getSettings();
        if (!settings.sfxEnabled && sfxFiles.some(file => src.includes(file))) {
          return Promise.resolve();
        }
      } catch {}
      return originalPlay.apply(this, arguments);
    };
  }

  function applyThinkingMusic(){
    const settings = getSettings();
    if (!thinkingAudio) {
      thinkingAudio = new Audio('./thinking-music.wav');
      thinkingAudio.loop = true;
      thinkingAudio.preload = 'auto';
      thinkingAudio.volume = 0.55;
    }
    if (settings.thinkingMusicEnabled) {
      try {
        thinkingAudio.currentTime = 0;
        const playPromise = thinkingAudio.play();
        if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
      } catch {}
    } else {
      try {
        thinkingAudio.pause();
        thinkingAudio.currentTime = 0;
      } catch {}
    }
  }

  function saveFeaturedSnapshot(){
    const data = readAppData();
    if (!data || !data.meta) return;
    const meta = data.meta || {};
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const title = String(meta.title || '').trim();
    const choreographer = String(meta.choreographer || '').trim();
    const hasContent = title || choreographer || sections.some(section => Array.isArray(section.steps) && section.steps.some(step => step && (step.name || step.description)));
    if (!hasContent) return;
    const signature = JSON.stringify({meta, sections, tags});
    if (signature === lastSyncedSignature) return;
    lastSyncedSignature = signature;

    let featured = [];
    try {
      featured = JSON.parse(localStorage.getItem(FEATURED_KEY) || '[]');
      if (!Array.isArray(featured)) featured = [];
    } catch {
      featured = [];
    }

    const id = (title || 'untitled').toLowerCase() + '|' + (choreographer || 'unknown').toLowerCase();
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    const entry = {
      id,
      title: title || 'Untitled Dance',
      choreographer: choreographer || 'Uncredited',
      country: String(meta.country || '').trim(),
      level: String(meta.level || '').trim() || 'Unlabelled',
      counts: String(meta.counts || '').trim() || '-',
      walls: String(meta.walls || '').trim() || '-',
      music: String(meta.music || '').trim(),
      sections: sections.length,
      tags: tags.length,
      steps: stepCount,
      updatedAt: new Date().toISOString()
    };

    const existingIndex = featured.findIndex(item => item && item.id === id);
    if (existingIndex >= 0) featured[existingIndex] = entry;
    else featured.unshift(entry);

    featured.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    featured = featured.slice(0, 120);
    localStorage.setItem(FEATURED_KEY, JSON.stringify(featured));
    renderExtraPages();
  }

  function getFeaturedDances(){
    try {
      const featured = JSON.parse(localStorage.getItem(FEATURED_KEY) || '[]');
      return Array.isArray(featured) ? featured : [];
    } catch {
      return [];
    }
  }

  function ensureHost(){
    if (host) return host;
    host = document.createElement('div');
    host.id = 'stepper-extra-page-host';
    host.hidden = true;
    host.className = 'max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-28 sm:pb-32 print:hidden';
    host.innerHTML = `<section id="${WHATSNEW_PAGE_ID}" hidden></section>`;
    if (mainEl && mainEl.parentNode) {
      mainEl.parentNode.insertBefore(host, footerWrap || mainEl.nextSibling);
    } else {
      document.body.appendChild(host);
    }
    return host;
  }

  function ensureInlineHost(){
    if (inlineHost) return inlineHost;
    inlineHost = document.createElement('div');
    inlineHost.id = INLINE_HOST_ID;
    inlineHost.hidden = true;
    inlineHost.className = 'max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-0 print:hidden';
    inlineHost.innerHTML = `<div class="space-y-5"><section id="${CHOREO_PANEL_ID}"></section><section id="${SETTINGS_PANEL_ID}"></section></div>`;
    if (mainEl && mainEl.parentNode) {
      mainEl.parentNode.insertBefore(inlineHost, mainEl);
    } else {
      document.body.appendChild(inlineHost);
    }
    return inlineHost;
  }

  function themeClasses(){
    const dark = isDarkMode();
    return {
      dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      button: dark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500'
    };
  }

  function formatDate(iso){
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return 'Recently';
    }
  }

  function renderWhatsNewPage(){
    const page = document.getElementById(WHATSNEW_PAGE_ID);
    if (!page) return;
    const theme = themeClasses();
    const cards = EXTRA_NOTES.map((note, index) => {
      const icon = index === 2 ? iconSparkles() : index === 3 ? iconCog() : iconMusic(true);
      return `
        <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
          <div class="flex items-start gap-3">
            <span class="stepper-extra-tab-icon mt-0.5 shrink-0">${icon}</span>
            <p class="font-medium leading-relaxed">${escapeHtml(note)}</p>
          </div>
        </article>
      `;
    }).join('');
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconMusic(true)}</span> What's New</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        ${cards}
      </div>
    `;
  }

  function renderChoreographyPanel(targetId){
    const page = document.getElementById(targetId);
    if (!page) return;
    const featured = getFeaturedDances();
    const theme = themeClasses();
    const cards = featured.length ? featured.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title)}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer)}${item.country ? ` (${escapeHtml(item.country)})` : ''}</p>
          </div>
          <span class="shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.dark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(item.level)}</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts)}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls)}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections))}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps))}</div></div>
        </div>
        ${item.music ? `<p class="mt-4 text-sm leading-relaxed ${theme.subtle}"><strong class="${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">Music:</strong> ${escapeHtml(item.music)}</p>` : ''}
        <p class="mt-4 text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Updated ${escapeHtml(formatDate(item.updatedAt))}</p>
      </article>
    `).join('') : `
      <div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}">
        <p class="text-lg font-bold">No choreography saved yet.</p>
        <p class="mt-2 ${theme.subtle}">Start building a dance, give it a title, and it will appear here on this device.</p>
      </div>
    `;
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconSparkles()}</span> Choreography</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${theme.panel}">
          <p class="text-base sm:text-lg font-bold leading-relaxed">Dances you make with Step by Stepper are collected here automatically on this device, so your choreography sits right above the editor instead of hiding off in another tab.</p>
        </div>
        ${cards}
      </div>
    `;
  }

  function renderSettingsPanel(targetId){
    const page = document.getElementById(targetId);
    if (!page) return;
    const theme = themeClasses();
    const settings = getSettings();
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconCog()}</span> Settings</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <button type="button" data-stepper-setting="sfx" class="stepper-setting-toggle rounded-3xl border w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 ${theme.soft}">
          <div class="min-w-0">
            <div class="text-lg font-black tracking-tight">SFX Sounds</div>
            <p class="mt-1 text-sm ${theme.subtle}">Menu clicks, tab changes, dark mode toggles and other little UI noises.</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="stepper-setting-icon ${settings.sfxEnabled ? 'is-on' : 'is-off'}">${iconSpeaker(settings.sfxEnabled)}</span>
            <span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">${settings.sfxEnabled ? 'On' : 'Off'}</span>
          </div>
        </button>
        <button type="button" data-stepper-setting="thinking" class="stepper-setting-toggle rounded-3xl border w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 ${theme.soft}">
          <div class="min-w-0">
            <div class="text-lg font-black tracking-tight">Thinking Music</div>
            <p class="mt-1 text-sm ${theme.subtle}">Loops the lobby track while you work. Starts off, because mercy still exists.</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="stepper-setting-icon ${settings.thinkingMusicEnabled ? 'is-on' : 'is-off'}">${iconMusic(settings.thinkingMusicEnabled)}</span>
            <span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">${settings.thinkingMusicEnabled ? 'On' : 'Off'}</span>
          </div>
        </button>
      </div>
    `;
    page.querySelector('[data-stepper-setting="sfx"]').addEventListener('click', () => {
      const current = getSettings();
      current.sfxEnabled = !current.sfxEnabled;
      saveSettings(current);
      renderSettingsPanel(targetId);
    });
    page.querySelector('[data-stepper-setting="thinking"]').addEventListener('click', () => {
      const current = getSettings();
      current.thinkingMusicEnabled = !current.thinkingMusicEnabled;
      saveSettings(current);
      applyThinkingMusic();
      renderSettingsPanel(targetId);
    });
  }

  function isEditorSurfaceVisible(){
    if (!mainEl || activeExtraPage) return false;
    if (mainEl.style.display === 'none') return false;
    const text = (mainEl.textContent || '').replace(/\s+/g, ' ');
    return text.includes('Dance Title') && text.includes('Choreographer') && text.includes('Country');
  }

  function syncInlineHostVisibility(){
    ensureInlineHost();
    inlineHost.hidden = !isEditorSurfaceVisible();
  }

  function renderInlineEditorPanels(){
    ensureInlineHost();
    renderChoreographyPanel(CHOREO_PANEL_ID);
    renderSettingsPanel(SETTINGS_PANEL_ID);
    syncInlineHostVisibility();
  }

  function renderExtraPages(){
    if (!mainEl || !tabStrip) return;
    ensureHost();
    renderWhatsNewPage();
    renderInlineEditorPanels();
    updateButtonState();
  }

  function setActiveExtra(pageName){
    activeExtraPage = pageName === 'whatsnew' ? 'whatsnew' : null;
    ensureHost();
    const whatsNewPage = document.getElementById(WHATSNEW_PAGE_ID);
    if (!activeExtraPage) {
      host.hidden = true;
      if (mainEl) mainEl.style.display = '';
      if (footerWrap) footerWrap.style.display = '';
      if (whatsNewPage) whatsNewPage.hidden = true;
    } else {
      renderExtraPages();
      host.hidden = false;
      if (mainEl) mainEl.style.display = 'none';
      if (footerWrap) footerWrap.style.display = 'none';
      if (whatsNewPage) whatsNewPage.hidden = false;
      host.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    syncInlineHostVisibility();
    updateButtonState();
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function scrollButtonIntoView(button){
    if (!button || typeof button.scrollIntoView !== 'function') return;
    try {
      button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } catch {}
  }

  function openExtraPage(pageName, button){
    scrollButtonIntoView(button);
    const openPage = () => setActiveExtra(pageName);
    if (window.__stepperRunFaviconTransition) window.__stepperRunFaviconTransition(openPage);
    else openPage();
  }

  function makeExtraButton(label, iconSvg, pageName){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'stepper-extra-tab shrink-0 px-2.5 sm:px-4 py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap opacity-50 hover:opacity-100';
    btn.innerHTML = `<span class="stepper-extra-tab-icon">${iconSvg}</span><span>${escapeHtml(label)}</span>`;
    btn.addEventListener('click', () => {
      openExtraPage(pageName, btn);
    });
    return btn;
  }

  function updateButtonState(){
    const dark = isDarkMode();
    if (whatsNewBtn) {
      whatsNewBtn.dataset.stepperOwnPage = 'true';
      whatsNewBtn.style.opacity = activeExtraPage === 'whatsnew' ? '1' : '';
      whatsNewBtn.style.transform = activeExtraPage === 'whatsnew' ? 'translateY(-1px)' : '';
      whatsNewBtn.style.boxShadow = activeExtraPage === 'whatsnew' ? '0 8px 24px rgba(79,70,229,.18)' : '';
      whatsNewBtn.style.background = activeExtraPage === 'whatsnew' ? (dark ? '#404040' : '#ffffff') : '';
      whatsNewBtn.style.color = activeExtraPage === 'whatsnew' ? '#4f46e5' : '';
    }
  }

  function injectStyles(){
    if (document.getElementById('stepper-extra-tabs-style')) return;
    const style = document.createElement('style');
    style.id = 'stepper-extra-tabs-style';
    style.textContent = `
      .stepper-extra-tab-icon,
      .stepper-setting-icon { display:inline-flex; align-items:center; justify-content:center; width:1.4rem; height:1.4rem; }
      .stepper-extra-tab-icon svg,
      .stepper-setting-icon svg { width:100%; height:100%; }
      .stepper-setting-icon.is-on { color:#4f46e5; }
      .stepper-setting-icon.is-off { color:#737373; }
      .stepper-setting-toggle { transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
      .stepper-setting-toggle:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(0,0,0,.08); }
      #stepper-extra-page-host,
      #${INLINE_HOST_ID} { width: 100%; }
      #${INLINE_HOST_ID} section + section { margin-top: 1.25rem; }
    `;
    document.head.appendChild(style);
  }

  function injectWhatsNewNotes(){
    const ownPage = document.getElementById(WHATSNEW_PAGE_ID);
    const candidates = ownPage ? [ownPage] : Array.from(document.querySelectorAll('section, div, article'));
    const target = candidates.find(node => (node.textContent || '').includes("What's New"));
    if (!target) return false;
    EXTRA_NOTES.forEach((note, index) => {
      const id = `stepper-extra-note-${index}`;
      if (target.querySelector('#' + id)) return;
      const theme = themeClasses();
      const noteEl = document.createElement('div');
      noteEl.id = id;
      noteEl.className = `rounded-2xl border px-4 py-4 flex gap-3 ${theme.soft}`;
      noteEl.innerHTML = `<div class="mt-0.5 shrink-0"><span class="stepper-extra-tab-icon">${index === 1 ? iconSparkles() : index === 2 ? iconCog() : iconMusic(true)}</span></div><p class="font-medium leading-relaxed">${escapeHtml(note)}</p>`;
      const list = target.querySelector('.space-y-3') || target;
      list.prepend(noteEl);
    });
    return true;
  }

  function wireStripDragScroll(){
    if (!tabStrip || tabStrip.__stepperDragScrollWired) return;
    tabStrip.__stepperDragScrollWired = true;

    tabStrip.addEventListener('touchstart', (event) => {
      const touch = event.touches && event.touches[0];
      if (!touch) return;
      dragState = { x: touch.clientX, y: touch.clientY, left: tabStrip.scrollLeft, horizontal: false };
    }, { passive: true });

    tabStrip.addEventListener('touchmove', (event) => {
      if (!dragState) return;
      const touch = event.touches && event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - dragState.x;
      const dy = touch.clientY - dragState.y;
      if (!dragState.horizontal && Math.abs(dx) > Math.abs(dy) + 6) dragState.horizontal = true;
      if (!dragState.horizontal) return;
      tabStrip.scrollLeft = dragState.left - dx;
      event.preventDefault();
    }, { passive: false });

    const clearDrag = () => { dragState = null; };
    tabStrip.addEventListener('touchend', clearDrag, { passive: true });
    tabStrip.addEventListener('touchcancel', clearDrag, { passive: true });
  }

  function wireNativeTabClose(){
    if (!tabStrip || tabStrip.__stepperExtraWired) return;
    tabStrip.__stepperExtraWired = true;
    tabStrip.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      const text = (button.textContent || '').trim();
      if (/^Build$|^Sheet$/.test(text) && activeExtraPage) {
        setActiveExtra(null);
      }
    }, true);
  }

  function locateUi(){
    buildBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'Build') || null;
    sheetBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === 'Sheet') || null;
    whatsNewBtn = Array.from(document.querySelectorAll('button')).find(btn => (btn.textContent || '').trim() === "What's New") || null;
    tabStrip = buildBtn ? buildBtn.parentElement : null;
    mainEl = document.querySelector('main');
    footerWrap = mainEl && mainEl.parentElement ? mainEl.parentElement.querySelector('div.max-w-4xl.mx-auto.px-3.sm\:px-4.pb-10') : null;
    if (!tabStrip || !mainEl) return false;
    tabStrip.classList.remove('stepper-tab-strip-scroll');
    tabStrip.style.maxWidth = '';
    tabStrip.style.width = '';
    tabStrip.style.paddingRight = '';
    tabStrip.style.gap = '';
    if (tabStrip.parentElement) tabStrip.parentElement.style.minWidth = '0';
    if (buildBtn && !buildBtn.__stepperScrollWired) {
      buildBtn.__stepperScrollWired = true;
      buildBtn.addEventListener('click', () => scrollButtonIntoView(buildBtn));
    }
    if (sheetBtn && !sheetBtn.__stepperScrollWired) {
      sheetBtn.__stepperScrollWired = true;
      sheetBtn.addEventListener('click', () => scrollButtonIntoView(sheetBtn));
    }
    if (whatsNewBtn && !whatsNewBtn.__stepperOwnPageWired) {
      whatsNewBtn.__stepperOwnPageWired = true;
      whatsNewBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        openExtraPage('whatsnew', whatsNewBtn);
      }, true);
    }
    if (featuredBtn && featuredBtn.parentNode) featuredBtn.remove();
    if (settingsBtn && settingsBtn.parentNode) settingsBtn.remove();
    featuredBtn = null;
    settingsBtn = null;
    ensureHost();
    ensureInlineHost();
    wireNativeTabClose();
    renderExtraPages();
    return true;
  }

  function boot(){
    injectStyles();
    ensureAudioPatch();
    applyThinkingMusic();
    saveFeaturedSnapshot();
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const ready = locateUi();
      injectWhatsNewNotes();
      syncInlineHostVisibility();
      if (ready && tries > 2) clearInterval(timer);
      if (tries > 40) clearInterval(timer);
    }, 500);
    setInterval(() => {
      saveFeaturedSnapshot();
      applyThinkingMusic();
      renderExtraPages();
      injectWhatsNewNotes();
      syncInlineHostVisibility();
    }, 1800);
    window.addEventListener('storage', () => {
      saveFeaturedSnapshot();
      applyThinkingMusic();
      renderExtraPages();
      injectWhatsNewNotes();
      syncInlineHostVisibility();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();