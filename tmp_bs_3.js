
(function(){
  if (window.__stepperExtraTabsInstalled) return;
  window.__stepperExtraTabsInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const FEATURED_KEY = 'stepper_featured_dances_v2';
  const SETTINGS_KEY = 'stepper_sound_settings_v1';
  const SAVE_LATER_KEY = 'stepper_save_for_later_v1';
  const SAVE_LATER_SESSION_KEY = 'stepper_save_for_later_session_v1';
  const PHR_TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  const GOOGLE_FRONTEND_KEY = 'stepper_google_frontend_profile_v1';
  const CLOUD_SAVES_KEY = 'stepper_cloud_saves_frontend_v1';
  const FEATURED_CHOREO_KEY = 'stepper_featured_choreo_v1';
  const WHATSNEW_PAGE_ID = 'stepper-whatsnew-page';
  const SAVED_PAGE_ID = 'stepper-saved-dances-page';
  const FEATURED_PAGE_ID = 'stepper-featured-choreo-page';
  const DEFAULT_FEATURED_CHOREO = [
    {
      id: 'featured-whats-golden',
      title: "What's Golden?",
      choreographer: 'Anthony Tautarj',
      country: 'NZ',
      level: 'Improver',
      counts: '32',
      walls: '4',
      sections: 4,
      steps: 32,
      music: "What's golden - Jurassic 5",
      copperknobUrl: 'https://www.copperknob.co.uk/stepsheets/V4RD2QR/whats-golden',
      note: 'First Dance made with Step by Stepper',
      badgeLabel: 'First Dance made with Step by Stepper',
      badgeTone: 'bronze',
      previewSections: [
        {
          name: 'Section 1',
          subtitle: 'R and L Vaudevilles, Syncopated Applejacks, R Fwd Step, 1/2 Pivot L',
          lines: [
            '1 and 2 and: Cross Right over Left, Step Left slightly back, Touch Right heel diagonally forward, Step Right together.',
            '3 and 4 and: Cross Left over Right, Step Right slightly back, Touch Left heel diagonally forward, Step Left together.',
            '5 and 6 and: Swivel Left toe and Right heel to the left side, Return to center; Swivel Right toe and Left heel to the right side, Return to center.',
            '7 - 8: Step Right forward, Pivot 1/2 turn Left.'
          ]
        },
        {
          name: 'Section 2',
          subtitle: 'R Fwd Press, Recover/Sweep, R Sailor Step, L Behind-Side-Cross, R Side Point, 1/4 Turn R Hitch',
          lines: [
            '1 - 2: Press Right ball heavy forward, Recover weight back onto Left while sweeping Right foot from front to back.',
            '3 and 4: Cross Right behind Left, Step Left to left side, Step Right to right side.',
            '5 and 6: Cross Left behind Right, Step Right to right side, Cross Left tightly over Right.',
            '7 - 8: Point Right toe out to right side, Make a sharp 1/4 turn Right on ball of Left foot while hitching Right knee high.'
          ]
        },
        {
          name: 'Section 3',
          subtitle: 'R Dorothy Step, L Dorothy Step, R Fwd Rock, Recover, Full Traveling Turn R',
          lines: [
            '1 - 2 and: Step Right diagonally forward right, Lock Left tightly behind Right, Step Right slightly forward.',
            '3 - 4 and: Step Left diagonally forward left, Lock Right tightly behind Left, Step Left slightly forward.',
            '5 - 6: Rock Right forward, Recover weight back onto Left.',
            '7 - 8: Make 1/2 turn Right stepping Right forward, Make 1/2 turn Right stepping Left back.'
          ]
        },
        {
          name: 'Section 4',
          subtitle: 'R Coaster Step, L Kick-Cross-Side Rock, R Kick-Cross-Side Rock, L Stomp, R Scuff',
          lines: [
            '1 and 2: Step Right back, Step Left together, Step Right forward.',
            '3 and 4 and: Kick Left forward, Cross Left over Right, Rock Right to right side, Recover weight onto Left.',
            '5 and 6 and: Kick Right forward, Cross Right over Left, Rock Left to left side, Recover weight onto Right.',
            '7 - 8: Heavy stomp Left in place, Scuff Right heel heavily across Left.'
          ]
        }
      ]
    }
  ];
  const INLINE_HOST_ID = 'stepper-editor-inline-host';
  const CHOREO_PANEL_ID = 'stepper-inline-choreography';
  const SETTINGS_PANEL_ID = 'stepper-inline-settings';
  const EXTRA_NOTES = [
    'New: tab changes now run destination-based loading states, so Editor, Sheet, Whats New, Featured Choreo, and My Saved Dances each show their own status pass during the switch.',
    'New Featured choreography! Check it out in the Featured Choreography tab!',
    'New: Counts and Walls can stay on Auto now, and the Sheet view shows the real detected numbers instead of printing AUTO.',
    'New: counts now auto-sync from the built step content, and tags are left out of that total on purpose.',
    'New: phrased dance tools now support editable Parts, a Sequence tab, and tag-aware phrased building inspired by CopperKnob-style A/B/C + Tag sheets.',
    'New: right-click a section header to add that section straight into a new Part, and the labels start at A, B, C but stay editable.',
    'New: Settings now gives you three quick font style buttons, and each one previews its look before you press it.',
    'New: Android dark-mode buttons and black UI strips now keep white text, the B / I / U controls wrap selected text instantly, and page switches now start right when the transition animation kicks off.',
    'Fix: Thinking Music no longer restarts itself every few seconds like a broken jukebox.',
    'Fix: the title screen now fits short phone screens properly instead of dropping below the viewport.',
    'Fix: the page switch GIF now loads properly on Android without the blank image nonsense.',
    'New: Settings and Choreography now sit right above the editor instead of being shoved into extra page-strip tabs.',
    'New: Choreography shows the dances you build with the app on this device, so the saved work is easier to reach.',
    'New: Settings still includes SFX and Thinking Music toggles, now tucked into the editor where they belong.',
    'Fix: Choreography and Settings now show there from startup as well, instead of waiting around like fools.'
  ];


  function getUniqueExtraNotes(){
    return Array.from(new Set(EXTRA_NOTES.map(note => String(note || '').trim()).filter(Boolean)));
  }
  const sfxFiles = ['light-mode.mp3','dark-mode.mp3','tab-change.wav','ui-action.mp3','open-right-click.mp3','delete.mp3'];
  let activeExtraPage = null;
  let tabStrip = null;
  let buildBtn = null;
  let sheetBtn = null;
  let whatsNewBtn = null;
  let savedDancesBtn = null;
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

  function readJson(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value){
    localStorage.setItem(key, JSON.stringify(value));
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

  function iconBell(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18H5.5a1.5 1.5 0 0 1-1.2-2.4L6 13.5V10a6 6 0 1 1 12 0v3.5l1.7 2.1A1.5 1.5 0 0 1 18.5 18H17"></path><path d="M10 21a2 2 0 0 0 4 0"></path></svg>';
  }

  function iconStepperMark(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16h5v-4h5V8h6"></path><circle cx="20" cy="8" r="2.2" fill="currentColor" stroke="none"></circle></svg>';
  }

  function renderWhatsNewBadge(iconSvg, tone='stepper'){
    const cls = tone === 'gold' ? 'stepper-note-badge is-gold' : 'stepper-note-badge is-stepper';
    return `<span class="${cls}">${iconSvg}</span>`;
  }

  function iconShoe(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h5.426a1 1 0 0 1 .863.496l1.064 1.823a3 3 0 0 0 1.896 1.407l4.677 1.114A4 4 0 0 1 21 14.73V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"></path><path d="m14 13 1-2"></path><path d="M8 18v-1a4 4 0 0 0-4-4H3"></path><path d="m10 12 1.5-3"></path></svg>';
  }

  function iconCog(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.4a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.97 4.1a1.7 1.7 0 0 0 1.03-1.56V2.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.33 1.82 1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z"></path></svg>';
  }

  function iconCloud(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 1 0-.62-8.96A6 6 0 0 0 5 11a4 4 0 0 0 0 8h12.5Z"></path></svg>';
  }

  function iconFolder(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"></path></svg>';
  }

  function iconGoogle(){
    return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24"><path fill="#ff808c" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m20.0157 4.47237 -2.7835 2.62086c-0.7631 -0.81506 -1.7062 -1.44047 -2.754 -1.82632 -1.0477 -0.38585 -2.1712 -0.52146 -3.2807 -0.39602 -1.1095 0.12544 -2.17428 0.50848 -3.10944 1.11853 -0.93517 0.61005 -1.7148 1.43024 -2.27669 2.39511l-3.01303 -2.3913c0.90798 -1.39584 2.12153 -2.56691 3.54884 -3.42459 1.4273 -0.85768 3.03097 -1.37953 4.68972 -1.52605 1.6587 -0.146517 3.329 0.08612 4.8846 0.68032 1.5555 0.5942 2.9556 1.5344 4.0942 2.74946Z" stroke-width="1"></path><path fill="#ffef5e" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m5.8496 15.6732 -2.87912 2.5922c-1.2527 -1.7938 -1.93871 -3.922 -1.9694 -6.1097 -0.030695 -2.18766 0.59534 -4.33427 1.79723 -6.16247l3.01303 2.39129c-0.65148 1.10544 -0.99188 2.36648 -0.98514 3.64958 0.00674 1.2831 0.36035 2.5406 1.0234 3.6391Z" stroke-width="1"></path><path fill="#78eb7b" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M18.8298 20.6376c-1.1798 0.9299 -2.5374 1.6084 -3.9893 1.9939 -1.4519 0.3854 -2.9673 0.4696 -4.4529 0.2474 -1.48566 -0.2222 -2.9101 -0.7462 -4.18565 -1.5396 -1.27554 -0.7934 -2.37519 -1.8395 -3.23125 -3.0739l2.87912 -2.5921c0.51308 0.8604 1.20068 1.6039 2.01853 2.1825 0.81785 0.5785 1.74782 0.9794 2.73005 1.1767 0.9821 0.1974 1.9948 0.1868 2.9726 -0.031 0.9779 -0.2178 1.8993 -0.6379 2.7049 -1.2334l2.5539 2.8695Z" stroke-width="1"></path><path fill="#66e1ff" stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M22.9998 10.5654v2.0087c-0.0814 1.5634 -0.4954 3.0915 -1.2146 4.482 -0.7192 1.3906 -1.727 2.6116 -2.9559 3.5815l-2.5539 -2.8696c1.1579 -0.8459 2.0317 -2.0233 2.5061 -3.3765h-5.3469v-3.8261h9.5652Z" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m2.79857 5.9937 -0.01 -0.01" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m2.97045 18.2654 -0.01 0.01" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m5.85961 15.6637 -0.01 0.01" stroke-width="1"></path></svg>`;
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

  function createAudioElement(sources){
    const audio = document.createElement('audio');
    audio.preload = 'auto';
    try { audio.playsInline = true; } catch {}
    (Array.isArray(sources) ? sources : [sources]).forEach((src) => {
      const source = document.createElement('source');
      source.src = src;
      if (src.endsWith('.mp3')) source.type = 'audio/mpeg';
      else if (src.endsWith('.m4a')) source.type = 'audio/mp4';
      else if (src.endsWith('.wav')) source.type = 'audio/wav';
      audio.appendChild(source);
    });
    return audio;
  }

  function applyThinkingMusic(restart = false){
    const settings = getSettings();
    if (!thinkingAudio) {
      thinkingAudio = createAudioElement(['./thinking-music.mp3','./thinking-music.wav']);
      thinkingAudio.loop = true;
      thinkingAudio.volume = 0.55;
    }
    if (settings.thinkingMusicEnabled) {
      try {
        if (restart) {
          thinkingAudio.pause();
          thinkingAudio.currentTime = 0;
        }
        if (thinkingAudio.paused) {
          const playPromise = thinkingAudio.play();
          if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(() => {});
        }
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


  function buildCloudBackupGmailLink(source){
    const entry = buildFeaturedSubmissionEntry(source || getCurrentDanceEntry() || null);
    const subject = `Step by Stepper Cloud Backup – ${entry.title}`;
    const body = [
      'Hello,',
      '',
      'This is a Step by Stepper cloud backup email.',
      'Keep it in Gmail so the dance is easier to pull back up on computer later.',
      '',
      `Dance Title: ${entry.title}`,
      `Choreographer: ${entry.choreographer}`,
      `Country: ${entry.country || '-'}`,
      `Level: ${entry.level}`,
      `Counts: ${entry.counts}`,
      `Walls: ${entry.walls}`,
      `Sections: ${entry.sections || '-'}`,
      `Steps: ${entry.steps || '-'}`,
      `Music: ${entry.music || '-'}`,
      `Copperknob Link: ${entry.copperknobUrl || 'Add a Copperknob link here if you have one.'}`,
      '',
      'Attach the PDF if you want the full sheet with it.',
      '',
      'Sent from Step by Stepper.'
    ].join('\n');
    return `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    host.innerHTML = `<div class="space-y-5"><section id="${WHATSNEW_PAGE_ID}" hidden style="display:none"></section><section id="${SAVED_PAGE_ID}" hidden style="display:none"></section><section id="${FEATURED_PAGE_ID}" hidden style="display:none"></section></div>`;
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

  function buildFeaturedSubmissionEntry(source){
    const fallback = { title:'Untitled Dance', choreographer:'Uncredited', country:'', level:'Unlabelled', counts:'-', walls:'-', music:'', sections:0, steps:0, updatedAt:new Date().toISOString() };
    if (!source) return fallback;
    return {
      title: String(source.title || source.meta?.title || fallback.title).trim() || fallback.title,
      choreographer: String(source.choreographer || source.meta?.choreographer || fallback.choreographer).trim() || fallback.choreographer,
      country: String(source.country || source.meta?.country || '').trim(),
      level: String(source.level || source.meta?.level || fallback.level).trim() || fallback.level,
      counts: String(source.counts || source.meta?.counts || fallback.counts).trim() || fallback.counts,
      walls: String(source.walls || source.meta?.walls || fallback.walls).trim() || fallback.walls,
      music: String(source.music || source.meta?.music || '').trim(),
      copperknobUrl: String(source.copperknobUrl || source.meta?.copperknobUrl || '').trim(),
      sections: Number(source.sections || 0) || 0,
      steps: Number(source.steps || 0) || 0,
      updatedAt: source.updatedAt || new Date().toISOString()
    };
  }

  function getCurrentDanceEntry(){
    const data = readAppData();
    if (!data || !data.meta) return null;
    const meta = data.meta || {};
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    const title = String(meta.title || '').trim();
    const choreographer = String(meta.choreographer || '').trim();
    if (!(title || choreographer || stepCount > 0)) return null;
    return buildFeaturedSubmissionEntry({ meta, title, choreographer, country:String(meta.country || '').trim(), level:String(meta.level || '').trim(), counts:String(meta.counts || '').trim(), walls:String(meta.walls || '').trim(), music:String(meta.music || '').trim(), sections:sections.length, steps:stepCount, updatedAt:new Date().toISOString() });
  }

  function buildFeaturedSubmissionLink(source){
    const entry = buildFeaturedSubmissionEntry(source || getCurrentDanceEntry() || getFeaturedDances()[0] || null);
    const subject = `Step by Stepper Featured Dance Submission – ${entry.title}`;
    const body = [
      'Hello,',
      '',
      'I would like to submit this dance for the Featured Dances section in Step by Stepper.',
      '',
      `Dance Title: ${entry.title}`,
      `Choreographer: ${entry.choreographer}`,
      `Country: ${entry.country || '-'}`,
      `Level: ${entry.level}`,
      `Counts: ${entry.counts}`,
      `Walls: ${entry.walls}`,
      `Sections: ${entry.sections || '-'}`,
      `Steps: ${entry.steps || '-'}`,
      `Music: ${entry.music || '-'}`,
      `Copperknob Link: ${entry.copperknobUrl || 'Add a Copperknob link here if you have one.'}`,
      '',
      'Please review it for featuring.',
      '',
      'Sent from Step by Stepper.'
    ].join('\n');
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function getFeaturedDances(){
    const featured = readJson(FEATURED_KEY, []);
    return Array.isArray(featured) ? featured : [];
  }

  function getFeaturedChoreoEntries(){
    const featured = readJson(FEATURED_CHOREO_KEY, []);
    const saved = Array.isArray(featured) ? featured : [];
    const merged = [];
    const seen = new Set();
    DEFAULT_FEATURED_CHOREO.concat(saved).forEach(item => {
      if (!item || typeof item !== 'object') return;
      const key = String(item.id || item.title || Math.random());
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(item);
    });
    return merged;
  }

  function iconBronzeMedal(){
    return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path fill="#d48a6a" d="M8.54785 1v4.44086c0.03494 0.61822 0.30253 1.2003 0.74903 1.62931L12.0019 9.3883V1H8.54785Z" stroke-width="1"></path><path fill="#7cc7ff" d="M15.455 5.44086V1h-3.454v8.3883l2.705 -2.31813c0.4464 -0.42901 0.7141 -1.01109 0.749 -1.62931Z" stroke-width="1"></path><path fill="#a66143" d="m16.4409 18.7635 2.1178 -2.1188c0.0924 -0.0925 0.1445 -0.218 0.1445 -0.3488 0 -0.1309 -0.0521 -0.2563 -0.1445 -0.3489l-2.1178 -2.1178 0.3947 -1.9836c0.018 -0.0538 0.0205 -0.1117 0.0074 -0.1669 -0.013 -0.0553 -0.0412 -0.1058 -0.0813 -0.1459 -0.0402 -0.0402 -0.0907 -0.0684 -0.1459 -0.0814 -0.0553 -0.0131 -0.1131 -0.0106 -0.167 0.0074l-1.9836 0.3947L12 9.38837 9.53286 11.8555l-1.98359 -0.3947c-0.05387 -0.018 -0.11168 -0.0206 -0.16693 -0.0074 -0.05526 0.013 -0.1058 0.0412 -0.14595 0.0814 -0.04015 0.0401 -0.06833 0.0906 -0.0814 0.1458 -0.01305 0.0553 -0.01049 0.1131 0.00743 0.167l0.39475 1.9836 -2.11583 2.1158c-0.0925 0.0926 -0.14446 0.218 -0.14446 0.3489 0 0.1308 0.05196 0.2563 0.14446 0.3488l2.1178 2.1188 -0.39474 1.9836c-0.01792 0.0539 -0.02049 0.1117 -0.00743 0.167 0.01306 0.0553 0.04125 0.1058 0.08139 0.146 0.04016 0.04 0.0907 0.0682 0.14595 0.0813 0.05525 0.0131 0.11306 0.0105 0.16694 -0.0074l1.98359 -0.3948 2.11586 2.1159c0.0458 0.0459 0.1002 0.0824 0.1602 0.1072 0.0599 0.0249 0.1242 0.0377 0.1891 0.0377 0.0649 0 0.1292 -0.0128 0.1891 -0.0377 0.06 -0.0248 0.1145 -0.0613 0.1603 -0.1072l2.1178 -2.1178 1.9835 0.3947c0.0539 0.018 0.1118 0.0205 0.167 0.0074 0.0553 -0.013 0.1058 -0.0413 0.146 -0.0813 0.04 -0.0402 0.0683 -0.0907 0.0813 -0.146 0.0131 -0.0552 0.0106 -0.1131 -0.0074 -0.167l-0.3967 -1.9816Z" stroke-width="1"></path><path fill="#d89d80" d="M7.1644 20.7471c-0.01483 0.0537 -0.01601 0.1104 -0.00343 0.1646 0.01259 0.0543 0.03852 0.1045 0.07547 0.1463l9.52716 -9.5272c-0.0418 -0.0369 -0.092 -0.0628 -0.1463 -0.0755 -0.0542 -0.0125 -0.1109 -0.0113 -0.1646 0.0035l-1.9836 0.3947L12 9.38837 9.53286 11.8555l-1.98359 -0.3947c-0.05387 -0.018 -0.11168 -0.0206 -0.16693 -0.0074 -0.05526 0.013 -0.1058 0.0412 -0.14595 0.0814 -0.04015 0.0401 -0.06833 0.0906 -0.0814 0.1458 -0.01305 0.0553 -0.01049 0.1131 0.00743 0.167l0.39475 1.9836 -2.11583 2.1158c-0.0925 0.0926 -0.14446 0.218 -0.14446 0.3489 0 0.1308 0.05196 0.2563 0.14446 0.3488l2.1178 2.1188 -0.39474 1.9836Z" stroke-width="1"></path><path fill="#8e4f34" d="M12.0004 18.7635c1.3625 0 2.4671 -1.1046 2.4671 -2.4671 0 -1.3626 -1.1046 -2.4672 -2.4671 -2.4672 -1.3626 0 -2.4672 1.1046 -2.4672 2.4672 0 1.3625 1.1046 2.4671 2.4672 2.4671Z" stroke-width="1"></path><path fill="#c98260" d="M10.2559 18.0411c-0.46273 -0.4628 -0.7227 -1.0903 -0.7227 -1.7448 0 -0.6544 0.25997 -1.282 0.7227 -1.7448 0.4628 -0.4627 1.0904 -0.7226 1.7448 -0.7226 0.6544 0 1.282 0.2599 1.7448 0.7226l-3.4896 3.4896Z" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="m16.4409 18.7635 2.1178 -2.1188c0.0924 -0.0925 0.1445 -0.218 0.1445 -0.3488 0 -0.1309 -0.0521 -0.2563 -0.1445 -0.3489l-2.1178 -2.1178 0.3947 -1.9836c0.018 -0.0538 0.0205 -0.1117 0.0074 -0.1669 -0.013 -0.0553 -0.0412 -0.1058 -0.0813 -0.1459 -0.0402 -0.0402 -0.0907 -0.0684 -0.1459 -0.0814 -0.0553 -0.0131 -0.1131 -0.0106 -0.167 0.0074l-1.9836 0.3947L12 9.38837 9.53286 11.8555l-1.98359 -0.3947c-0.05387 -0.018 -0.11168 -0.0206 -0.16693 -0.0074 -0.05526 0.013 -0.1058 0.0412 -0.14595 0.0814 -0.04015 0.0401 -0.06833 0.0906 -0.0814 0.1458 -0.01305 0.0553 -0.01049 0.1131 0.00743 0.167l0.39475 1.9836 -2.11583 2.1158c-0.0925 0.0926 -0.14446 0.218 -0.14446 0.3489 0 0.1308 0.05196 0.2563 0.14446 0.3488l2.1178 2.1188 -0.39474 1.9836c-0.01792 0.0539 -0.02049 0.1117 -0.00743 0.167 0.01306 0.0553 0.04125 0.1058 0.08139 0.146 0.04016 0.04 0.0907 0.0682 0.14595 0.0813 0.05525 0.0131 0.11306 0.0105 0.16694 -0.0074l1.98359 -0.3948 2.11586 2.1159c0.0458 0.0459 0.1002 0.0824 0.1602 0.1072 0.0599 0.0249 0.1242 0.0377 0.1891 0.0377 0.0649 0 0.1292 -0.0128 0.1891 -0.0377 0.06 -0.0248 0.1145 -0.0613 0.1603 -0.1072l2.1178 -2.1178 1.9835 0.3947c0.0539 0.018 0.1118 0.0205 0.167 0.0074 0.0553 -0.013 0.1058 -0.0413 0.146 -0.0813 0.04 -0.0402 0.0683 -0.0907 0.0813 -0.146 0.0131 -0.0552 0.0106 -0.1131 -0.0074 -0.167l-0.3967 -1.9816Z" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M15.4559 5.44086c-0.035 0.61822 -0.3026 1.2003 -0.7491 1.62931L12.0019 9.3883 9.29688 7.07017c-0.4465 -0.42901 -0.71409 -1.01109 -0.74903 -1.62931V1h6.90805v4.44086Z" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M12.001 1v8.3883" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M5.58691 1H18.4161" stroke-width="1"></path><path stroke="#191919" stroke-linecap="round" stroke-linejoin="round" d="M12.0004 18.7635c1.3625 0 2.4671 -1.1046 2.4671 -2.4671 0 -1.3626 -1.1046 -2.4672 -2.4671 -2.4672 -1.3626 0 -2.4672 1.1046 -2.4672 2.4672 0 1.3625 1.1046 2.4671 2.4672 2.4671Z" stroke-width="1"></path></svg>`;
  }

  function renderFeaturedPreviewCard(item, theme){
    const bronzeBadge = item.badgeLabel ? `
      <div class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] ${theme.dark ? 'border-amber-700/60 bg-amber-900/20 text-amber-100' : 'border-amber-300 bg-amber-50 text-amber-900'}">
        <span class="h-6 w-6 shrink-0">${iconBronzeMedal()}</span>
        <span>${escapeHtml(item.badgeLabel)}</span>
      </div>
    ` : '';
    const sections = Array.isArray(item.previewSections) ? item.previewSections.map((section, idx) => `
      <section class="space-y-4">
        <div>
          <h4 class="text-lg font-black italic border-b-2 border-current pb-1 mb-2 uppercase tracking-[0.18em] ${theme.dark ? 'text-neutral-100 border-neutral-200' : 'text-neutral-900 border-neutral-900'}">${escapeHtml(section.name || `Section ${idx + 1}`)}</h4>
          ${section.subtitle ? `<p class="text-sm font-semibold leading-relaxed ${theme.dark ? 'text-neutral-300' : 'text-neutral-700'}">${escapeHtml(section.subtitle)}</p>` : ''}
        </div>
        <div class="space-y-3">
          ${(Array.isArray(section.lines) ? section.lines : []).map(line => `<p class="text-sm sm:text-[15px] leading-relaxed ${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">${escapeHtml(line)}</p>`).join('')}
        </div>
      </section>
    `).join('') : '';
    return `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="space-y-3 min-w-0">
            ${bronzeBadge}
            <div>
              <h3 class="text-3xl sm:text-4xl font-black text-center sm:text-left tracking-tighter uppercase leading-tight ${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">${escapeHtml(item.title || 'Featured Dance')}</h3>
            </div>
          </div>
          <span class="shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.dark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(item.level || 'Featured')}</span>
        </div>
        <div class="mt-6 border-y py-6 uppercase text-[10px] font-black tracking-[0.24em] ${theme.dark ? 'border-neutral-700 text-neutral-300' : 'border-neutral-300 text-neutral-500'}">
          <div class="flex flex-wrap gap-4 sm:gap-8 justify-center text-center">
            <div>Count: <span class="text-sm font-bold ${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">${escapeHtml(item.counts || '-')}</span></div>
            <div>Wall: <span class="text-sm font-bold ${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">${escapeHtml(item.walls || '-')}</span></div>
            <div>Level: <span class="text-sm font-bold ${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">${escapeHtml(item.level || '-')}</span></div>
            <div class="basis-full text-center mt-2">Choreographer: <span class="text-sm font-bold ${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">${escapeHtml(item.choreographer || '-')} ${item.country ? `(${escapeHtml(item.country)})` : ''}</span></div>
            <div class="basis-full text-center">Music: <span class="text-sm font-bold italic normal-case tracking-normal ${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">${escapeHtml(item.music || '-')}</span></div>
          </div>
        </div>
        <div class="mt-8 space-y-10 font-serif">${sections}</div>
        ${item.copperknobUrl ? `<div class="mt-8 flex flex-wrap gap-3"><a href="${escapeHtml(item.copperknobUrl)}" target="_blank" rel="noopener noreferrer" class="stepper-mini-btn ${theme.orange}">Open on Copperknob</a><a href="${escapeHtml(buildFeaturedSubmissionLink(item))}" target="_blank" rel="noopener noreferrer" class="stepper-mini-btn ${theme.button}">Gmail this sheet</a></div>` : ''}
      </article>
    `;
  }

  function getGoogleFrontendProfile(){
    const profile = readJson(GOOGLE_FRONTEND_KEY, null);
    if (!profile || typeof profile !== 'object') return null;
    const email = String(profile.email || '').trim();
    if (!email) return null;
    const name = String(profile.name || '').trim() || email.split('@')[0];
    return { name, email, updatedAt: profile.updatedAt || new Date().toISOString() };
  }

  function getActiveCloudProfile(){
    const profile = getGoogleFrontendProfile();
    if (profile && profile.email) return profile;
    return { name: 'This device', email: 'device@stepbystepper.local', updatedAt: new Date().toISOString(), localOnly: true };
  }

  function saveGoogleFrontendProfile(profile){
    writeJson(GOOGLE_FRONTEND_KEY, {
      name: String(profile && profile.name || '').trim(),
      email: String(profile && profile.email || '').trim(),
      updatedAt: new Date().toISOString()
    });
  }

  function clearGoogleFrontendProfile(){
    localStorage.removeItem(GOOGLE_FRONTEND_KEY);
  }

  function getCloudSaveMap(){
    const payload = readJson(CLOUD_SAVES_KEY, {});
    return payload && typeof payload === 'object' ? payload : {};
  }

  function saveCloudSaveMap(payload){
    writeJson(CLOUD_SAVES_KEY, payload || {});
  }

  function currentDanceIdentity(data){
    const meta = data && data.meta ? data.meta : {};
    const title = String(meta.title || '').trim();
    const choreographer = String(meta.choreographer || '').trim();
    return {
      id: (title || 'untitled').toLowerCase() + '|' + (choreographer || 'unknown').toLowerCase(),
      title: title || 'Untitled Dance',
      choreographer: choreographer || 'Uncredited'
    };
  }

  function hasDanceContent(data){
    if (!data || !data.meta) return false;
    const identity = currentDanceIdentity(data);
    const sections = Array.isArray(data.sections) ? data.sections : [];
    return !!(identity.title !== 'Untitled Dance' || identity.choreographer !== 'Uncredited' || sections.some(section => Array.isArray(section && section.steps) && section.steps.length));
  }

  function buildLocalSnapshotEntry(data){
    const identity = currentDanceIdentity(data || {});
    const sections = Array.isArray(data && data.sections) ? data.sections : [];
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    return {
      id: identity.id,
      title: identity.title,
      choreographer: identity.choreographer,
      country: String((data && data.meta && data.meta.country) || '').trim(),
      level: String((data && data.meta && data.meta.level) || 'Unlabelled').trim() || 'Unlabelled',
      counts: String((data && data.meta && data.meta.counts) || '-').trim() || '-',
      walls: String((data && data.meta && data.meta.walls) || '-').trim() || '-',
      music: String((data && data.meta && data.meta.music) || '').trim(),
      sections: sections.length,
      steps: stepCount,
      updatedAt: new Date().toISOString(),
      snapshot: {
        data: JSON.parse(JSON.stringify(data || {})),
        phrasedTools: readJson(PHR_TOOLS_KEY, {})
      }
    };
  }

  function getCloudEntriesForProfile(profile){
    if (!profile || !profile.email) return [];
    const map = getCloudSaveMap();
    const list = Array.isArray(map[profile.email]) ? map[profile.email] : [];
    return list.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }

  function loadSnapshotEntry(entry){
    if (!entry || !entry.snapshot) return;
    const snapshotData = entry.snapshot.data || entry.snapshot;
    writeJson(DATA_KEY, snapshotData);
    writeJson(PHR_TOOLS_KEY, entry.snapshot.phrasedTools || {});
    location.reload();
  }

  function deleteLocalSavedDance(id){
    const featured = getFeaturedDances().filter(item => item && item.id !== id);
    writeJson(FEATURED_KEY, featured);
  }

  function saveCurrentDanceToCloud(){
    const profile = getActiveCloudProfile();
    const data = readAppData();
    if (!hasDanceContent(data)) {
      alert('Build a dance first, then save it to the cloud front end.');
      return false;
    }
    const entry = buildLocalSnapshotEntry(data);
    const map = getCloudSaveMap();
    let list = Array.isArray(map[profile.email]) ? map[profile.email] : [];
    const existingIndex = list.findIndex(item => item && item.id === entry.id);
    if (existingIndex >= 0) list[existingIndex] = Object.assign({}, list[existingIndex], entry);
    else list.unshift(entry);
    list = list.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 120);
    map[profile.email] = list;
    saveCloudSaveMap(map);
    return true;
  }

  function deleteCloudDance(profile, id){
    if (!profile || !profile.email) return;
    const map = getCloudSaveMap();
    const list = Array.isArray(map[profile.email]) ? map[profile.email] : [];
    map[profile.email] = list.filter(item => item && item.id !== id);
    saveCloudSaveMap(map);
  }

  function renderSavedDancesPage(){
    const page = document.getElementById(SAVED_PAGE_ID);
    if (!page) return;
    const theme = themeClasses();
    const profile = getActiveCloudProfile();
    const localDances = getFeaturedDances();
    const cloudDances = getCloudEntriesForProfile(profile);
    const cloudShelfCard = `
      <div class="rounded-2xl border p-5 sm:p-6 ${theme.panel}">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0">
            <div class="flex items-center gap-3">
              <span class="stepper-extra-tab-icon">${iconCloud()}</span>
              <div>
                <div class="text-lg font-black tracking-tight">Cloud save shelf</div>
                <p class="mt-1 text-sm ${theme.subtle}">Attached to ${escapeHtml(profile.name)}</p>
              </div>
            </div>
            <p class="mt-4 text-sm leading-relaxed ${theme.subtle}">This shelf keeps cloud-style saves grouped on this device, and on computer you can also kick the current dance over to Gmail in a new tab for an easy backup trail.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <button type="button" data-action="save-current-cloud" class="stepper-mini-btn ${theme.orange}">Save current dance to cloud</button>
            <a href="${escapeHtml(buildCloudBackupGmailLink())}" target="_blank" rel="noopener noreferrer" class="stepper-mini-btn ${theme.button}">Backup in Gmail (new tab)</a>
          </div>
        </div>
      </div>`;

    const localCards = localDances.length ? localDances.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-local-dance-id="${escapeHtml(item.id)}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer || 'Uncredited')}${item.country ? ` (${escapeHtml(item.country)})` : ''}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.dark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">On this device</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections || 0))}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" data-action="load-local" class="stepper-mini-btn ${theme.button}">Load</button>
          <button type="button" data-action="delete-local" class="stepper-danger-btn ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">Delete</button>
          <button type="button" data-action="push-local-cloud" class="stepper-mini-btn ${theme.orange}">Push to cloud</button>
          <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Updated ${escapeHtml(formatDate(item.updatedAt))}</span>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-bold">No saved dances yet.</p><p class="mt-2 ${theme.subtle}">Step by Stepper already remembers what people make on this device. Once a dance has a title or a few steps, it will show up here automatically.</p></div>`;

    const cloudCards = cloudDances.length ? cloudDances.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-cloud-dance-id="${escapeHtml(item.id)}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title || 'Untitled Dance')}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer || 'Uncredited')}</p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.dark ? 'bg-emerald-900/40 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}">Cloud front end</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections || 0))}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" data-action="load-cloud" class="stepper-mini-btn ${theme.button}">Load</button>
          <button type="button" data-action="delete-cloud" class="stepper-danger-btn ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">Delete</button>
          <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Saved ${escapeHtml(formatDate(item.updatedAt))}</span>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-bold">No cloud saves yet.</p><p class="mt-2 ${theme.subtle}">Use the cloud button above or push one of your saved dances up into the cloud shelf.</p></div>`;

    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconFolder()}</span> My Saved Dances</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        ${cloudShelfCard}
        <div class="rounded-2xl border p-5 ${theme.panel}">
          <div class="flex items-center gap-3">
            <span class="stepper-extra-tab-icon">${iconCloud()}</span>
            <div>
              <div class="text-lg font-black tracking-tight">Cloud save front end</div>
              <p class="mt-1 text-sm ${theme.subtle}">Your saved dances stay here on this device, and the cloud shelf plus Gmail backup button give computer users an extra way to keep copies without mixing them into the showcase shelf.</p>
            </div>
          </div>
        </div>
        <section class="space-y-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <h3 class="text-lg font-black uppercase tracking-widest">Saved on this device</h3>
            <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">${localDances.length} saved</span>
          </div>
          ${localCards}
        </section>
        <section class="space-y-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <h3 class="text-lg font-black uppercase tracking-widest">Cloud saves</h3>
            <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">${cloudDances.length} saved</span>
          </div>
          ${cloudCards}
        </section>
      </div>
    `;

    const saveCurrentBtn = page.querySelector('[data-action="save-current-cloud"]');
    if (saveCurrentBtn) saveCurrentBtn.addEventListener('click', () => {
      if (saveCurrentDanceToCloud()) renderSavedDancesPage();
    });

    page.querySelectorAll('[data-local-dance-id]').forEach(card => {
      const id = card.getAttribute('data-local-dance-id');
      const entry = localDances.find(item => item && item.id === id);
      const loadBtn = card.querySelector('[data-action="load-local"]');
      const deleteBtn = card.querySelector('[data-action="delete-local"]');
      const pushBtn = card.querySelector('[data-action="push-local-cloud"]');
      if (loadBtn) loadBtn.addEventListener('click', () => loadSnapshotEntry(entry));
      if (deleteBtn) deleteBtn.addEventListener('click', () => {
        if (confirm(`Delete saved dance "${(entry && entry.title) || 'this dance'}" from this device?`)) {
          deleteLocalSavedDance(id);
          renderSavedDancesPage();
        }
      });
      if (pushBtn) pushBtn.addEventListener('click', () => {
        const profile = getActiveCloudProfile();
        const map = getCloudSaveMap();
        let list = Array.isArray(map[profile.email]) ? map[profile.email] : [];
        const existingIndex = list.findIndex(item => item && item.id === id);
        if (existingIndex >= 0) list[existingIndex] = Object.assign({}, list[existingIndex], entry, { updatedAt: new Date().toISOString() });
        else list.unshift(Object.assign({}, entry, { updatedAt: new Date().toISOString() }));
        map[profile.email] = list.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 120);
        saveCloudSaveMap(map);
        renderSavedDancesPage();
      });
    });

    page.querySelectorAll('[data-cloud-dance-id]').forEach(card => {
      const id = card.getAttribute('data-cloud-dance-id');
      const entry = cloudDances.find(item => item && item.id === id);
      const loadBtn = card.querySelector('[data-action="load-cloud"]');
      const deleteBtn = card.querySelector('[data-action="delete-cloud"]');
      if (loadBtn) loadBtn.addEventListener('click', () => loadSnapshotEntry(entry));
      if (deleteBtn) deleteBtn.addEventListener('click', () => {
        if (!profile) return;
        if (confirm(`Delete cloud save "${(entry && entry.title) || 'this dance'}"?`)) {
          deleteCloudDance(profile, id);
          renderSavedDancesPage();
        }
      });
    });
  }

  function renderWhatsNewPage(){
    const page = document.getElementById(WHATSNEW_PAGE_ID);
    if (!page) return;
    const theme = themeClasses();
    const notes = getUniqueExtraNotes();
    const cards = notes.map((note, index) => {
      const badge = index < 3
        ? renderWhatsNewBadge(iconBell(), 'gold')
        : renderWhatsNewBadge(iconStepperMark(), 'stepper');
      return `
        <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
          <div class="flex items-start gap-3">
            <span class="mt-0.5 shrink-0">${badge}</span>
            <p class="font-medium leading-relaxed">${escapeHtml(note)}</p>
          </div>
        </article>
      `;
    }).join('');
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.dataset.stepperNotesManaged = 'rendered';
    page.style.display = '';
    page.hidden = false;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconMusic(true)}</span> What's New</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5 stepper-whatsnew-list">
        ${cards}
      </div>
    `;
  }

  function renderChoreographyPanel(targetId){
    const page = document.getElementById(targetId);
    if (!page) return;
    if (targetId === CHOREO_PANEL_ID) {
      page.innerHTML = '';
      page.className = '';
      page.hidden = true;
      return;
    }
    const featured = getFeaturedChoreoEntries();
    const theme = themeClasses();
    const cards = featured.length ? featured.map(item => item && item.previewSections ? renderFeaturedPreviewCard(item, theme) : `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title || 'Featured Dance')}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer || 'Featured choreographer')}${item.country ? ` (${escapeHtml(item.country)})` : ''}</p>
          </div>
          <span class="shrink-0 rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.dark ? 'bg-indigo-900/50 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(item.level || 'Featured')}</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls || '-')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections</div><div class="mt-1 font-bold">${escapeHtml(String(item.sections || 0))}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        ${item.music ? `<p class="mt-4 text-sm leading-relaxed ${theme.subtle}"><strong class="${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">Music:</strong> ${escapeHtml(item.music)}</p>` : ''}
        ${item.note ? `<p class="mt-2 text-sm leading-relaxed ${theme.subtle}">${escapeHtml(item.note)}</p>` : ''}
      </article>
    `).join('') : `
      <div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}">
        <p class="text-lg font-bold">No choreography's Featured yet</p>
      </div>
    `;
    page.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    page.hidden = false;
    page.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-extra-tab-icon">${iconShoe()}</span> Featured Choreo</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${theme.panel}">
          <p class="text-base sm:text-lg font-bold leading-relaxed">Featured dancers are best of the best for flowability. Send a PDF Via Gmail at <a href="mailto:anthonytau4@gmail.com" target="_blank" rel="noopener noreferrer" class="underline ${theme.dark ? 'text-orange-300' : 'text-orange-600'}">anthonytau4@gmail.com</a>, and if the dance has a live stepsheet you can drop the Copperknob link into the Gmail draft as well.</p>
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
      applyThinkingMusic(current.thinkingMusicEnabled);
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

  function syncExtraPageVisibility(){
    ensureHost();
    const whatsNewPage = document.getElementById(WHATSNEW_PAGE_ID);
    const savedPage = document.getElementById(SAVED_PAGE_ID);
    const featuredPage = document.getElementById(FEATURED_PAGE_ID);
    const isWhatsNew = activeExtraPage === 'whatsnew';
    const isSaved = activeExtraPage === 'saveddances';
    const isFeatured = activeExtraPage === 'featured';
    if (whatsNewPage) {
      whatsNewPage.hidden = !isWhatsNew;
      whatsNewPage.style.display = isWhatsNew ? '' : 'none';
      whatsNewPage.setAttribute('aria-hidden', isWhatsNew ? 'false' : 'true');
    }
    if (savedPage) {
      savedPage.hidden = !isSaved;
      savedPage.style.display = isSaved ? '' : 'none';
      savedPage.setAttribute('aria-hidden', isSaved ? 'false' : 'true');
    }
    if (featuredPage) {
      featuredPage.hidden = !isFeatured;
      featuredPage.style.display = isFeatured ? '' : 'none';
      featuredPage.setAttribute('aria-hidden', isFeatured ? 'false' : 'true');
    }
    if (host) host.hidden = !activeExtraPage;
  }

  function renderExtraPages(){
    if (!mainEl || !tabStrip) return;
    ensureHost();
    renderSavedDancesPage();
    renderChoreographyPanel(FEATURED_PAGE_ID);
    renderWhatsNewPage();
    syncExtraPageVisibility();
    renderInlineEditorPanels();
    updateButtonState();
  }

  function setActiveExtra(pageName){
    activeExtraPage = pageName === 'whatsnew' ? 'whatsnew' : pageName === 'saveddances' ? 'saveddances' : pageName === 'featured' ? 'featured' : null;
    ensureHost();
    if (!activeExtraPage) {
      if (mainEl) mainEl.style.display = '';
      if (footerWrap) footerWrap.style.display = '';
      syncExtraPageVisibility();
    } else {
      renderExtraPages();
      if (mainEl) mainEl.style.display = 'none';
      if (footerWrap) footerWrap.style.display = 'none';
      syncExtraPageVisibility();
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
    if (window.__stepperRunFaviconTransition) window.__stepperRunFaviconTransition(openPage, { target: pageName });
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
    const applyTabStyles = (button, isActive, accentColor) => {
      if (!button) return;
      button.style.color = dark ? '#ffffff' : '';
      button.style.opacity = isActive ? '1' : (dark ? '.92' : '');
      button.style.transform = isActive ? 'translateY(-1px)' : '';
      button.style.boxShadow = isActive ? '0 8px 24px rgba(79,70,229,.18)' : '';
      button.style.background = isActive ? (dark ? '#2f2f2f' : '#ffffff') : '';
      button.style.borderColor = isActive ? (dark ? '#525252' : '#d4d4d8') : '';
      if (!dark && isActive && accentColor) button.style.color = accentColor;
    };
    if (tabStrip) tabStrip.style.color = dark ? '#ffffff' : '';
    applyTabStyles(buildBtn, !activeExtraPage, '#4f46e5');
    applyTabStyles(sheetBtn, !activeExtraPage && !!document.querySelector('main'), '#4f46e5');
    if (whatsNewBtn) {
      whatsNewBtn.dataset.stepperOwnPage = 'true';
      applyTabStyles(whatsNewBtn, activeExtraPage === 'whatsnew', '#4f46e5');
    }
    if (savedDancesBtn) {
      savedDancesBtn.dataset.stepperOwnPage = 'true';
      applyTabStyles(savedDancesBtn, activeExtraPage === 'saveddances', '#4f46e5');
    }
    if (featuredBtn) {
      featuredBtn.dataset.stepperOwnPage = 'true';
      applyTabStyles(featuredBtn, activeExtraPage === 'featured', '#4f46e5');
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
      .stepper-note-badge {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:2rem;
        height:2rem;
        border-radius:.9rem;
        border:1px solid rgba(255,255,255,.1);
        box-shadow:0 10px 24px rgba(15,23,42,.18), inset 0 1px 0 rgba(255,255,255,.16);
      }
      .stepper-note-badge svg { width:1rem; height:1rem; }
      .stepper-note-badge.is-stepper {
        background:linear-gradient(180deg,#1f2a44 0%,#312e81 100%);
        color:#f8fafc;
      }
      .stepper-note-badge.is-gold {
        background:linear-gradient(180deg,#facc15 0%,#f59e0b 100%);
        color:#5b3200;
        border-color:rgba(180,83,9,.28);
        box-shadow:0 10px 24px rgba(180,83,9,.2), inset 0 1px 0 rgba(255,255,255,.32);
      }
      .stepper-setting-icon.is-on { color:#4f46e5; }
      .stepper-setting-icon.is-off { color:#737373; }
      .stepper-setting-toggle { transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
      .stepper-setting-toggle:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(0,0,0,.08); }
      .dark .stepper-extra-tab,
      .dark .stepper-extra-tab span,
      .dark .stepper-extra-tab-icon,
      .dark .stepper-extra-tab-icon svg,
      .dark .stepper-tools-tab,
      .dark .stepper-tools-tab span,
      .dark .stepper-tools-tab svg,
      .dark .stepper-font-choice,
      .dark .stepper-font-choice strong,
      .dark .stepper-font-choice span,
      .dark .stepper-setting-toggle,
      .dark .stepper-setting-toggle span,
      .dark .stepper-help-panel,
      .dark .stepper-help-panel * { color:#f5f5f5 !important; }
      .dark .stepper-extra-tab-icon svg,
      .dark .stepper-setting-icon svg,
      .dark .stepper-tools-tab svg { stroke: currentColor; }
      #stepper-extra-page-host,
      #${INLINE_HOST_ID} { width: 100%; }
      #${INLINE_HOST_ID} section + section { margin-top: 1.25rem; }
    `;
    document.head.appendChild(style);
  }

  function injectWhatsNewNotes(){
    return false;
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
    footerWrap = mainEl && mainEl.parentElement ? Array.from(mainEl.parentElement.querySelectorAll('div')).find(node => { const cls = node.className || ''; return typeof cls === 'string' && cls.includes('max-w-4xl') && cls.includes('mx-auto') && cls.includes('px-3') && cls.includes('pb-10'); }) || null : null;
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
    if (buildBtn && !buildBtn.__stepperTransitionWired) {
      buildBtn.__stepperTransitionWired = true;
      buildBtn.addEventListener('click', () => {
        if (window.__stepperRunFaviconTransition) window.__stepperRunFaviconTransition(null, { target: 'editor' });
      }, true);
    }
    if (sheetBtn && !sheetBtn.__stepperScrollWired) {
      sheetBtn.__stepperScrollWired = true;
      sheetBtn.addEventListener('click', () => scrollButtonIntoView(sheetBtn));
    }
    if (sheetBtn && !sheetBtn.__stepperTransitionWired) {
      sheetBtn.__stepperTransitionWired = true;
      sheetBtn.addEventListener('click', () => {
        if (window.__stepperRunFaviconTransition) window.__stepperRunFaviconTransition(null, { target: 'preview' });
      }, true);
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
    savedDancesBtn = document.getElementById('stepper-saved-dances-tab');
    if (!savedDancesBtn) {
      savedDancesBtn = makeExtraButton('My Saved Dances', iconFolder(), 'saveddances');
      savedDancesBtn.id = 'stepper-saved-dances-tab';
      if (whatsNewBtn && whatsNewBtn.parentNode === tabStrip) whatsNewBtn.insertAdjacentElement('afterend', savedDancesBtn);
      else tabStrip.appendChild(savedDancesBtn);
    }
    featuredBtn = document.getElementById('stepper-featured-choreo-tab');
    if (!featuredBtn) {
      featuredBtn = makeExtraButton('Featured Choreo', iconShoe(), 'featured');
      featuredBtn.id = 'stepper-featured-choreo-tab';
      if (savedDancesBtn && savedDancesBtn.parentNode === tabStrip) savedDancesBtn.insertAdjacentElement('afterend', featuredBtn);
      else if (whatsNewBtn && whatsNewBtn.parentNode === tabStrip) whatsNewBtn.insertAdjacentElement('afterend', featuredBtn);
      else tabStrip.appendChild(featuredBtn);
    }
    if (settingsBtn && settingsBtn.parentNode) settingsBtn.remove();
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

    const primeStartupPanels = () => {
      const ready = locateUi();
      injectWhatsNewNotes();
      syncInlineHostVisibility();
      return ready;
    };

    primeStartupPanels();

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const ready = primeStartupPanels();
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
