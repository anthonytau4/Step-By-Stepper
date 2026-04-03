/**
 * stepper-settings-tab.js
 * ─────────────────────────────────────────────────────────────
 * Dedicated Settings tab for Step-By-Stepper.
 * Provides a comprehensive visual UI for:
 *   • Appearance — theme, accent color, fonts, layout, animations
 *   • Editor Behavior — auto-save, defaults, smart features
 *   • Sheet / Print — paper, orientation, headers, margins
 *   • Notifications — sounds, volume, alert preferences
 *   • Data & Privacy — cloud sync, export/import, clear data
 *   • Accessibility — motion, screen reader, keyboard, dyslexia
 *   • Advanced — dev mode, performance, debug, reset
 *
 * All settings persist to localStorage (stepper_settings_v1).
 * Changes dispatch 'stepper-settings-changed' CustomEvent.
 * Real-time preview for visual settings (theme, font, etc.).
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperSettingsTabInstalled) return;
  window.__stepperSettingsTabInstalled = true;

  /* ════════════════════════════════════════════════════════════
     CONSTANTS
     ════════════════════════════════════════════════════════════ */
  var PAGE_ID = 'stepper-settings-page';
  var TAB_ID  = 'stepper-settings-tab';
  var LS_KEY  = 'stepper_settings_v1';
  var BUILDER_DATA_KEY = 'linedance_builder_data_v13';
  var _queuedSettingsRender = 0;
  var _queuedAccentNotify = 0;

  /* ════════════════════════════════════════════════════════════
     DEFAULT SETTINGS
     ════════════════════════════════════════════════════════════ */
  var DEFAULTS = {
    /* Appearance */
    theme: 'system',
    accentColor: 'indigo',
    fontSize: 14,
    fontFamily: 'system',
    editorWidth: 'normal',
    showLineNumbers: true,
    showStepCounts: true,
    showWeightIndicators: false,
    compactStepView: false,
    showSectionDividers: true,
    animationSpeed: 'normal',
    highContrastMode: false,

    /* Editor Behavior */
    autoSaveInterval: '15',
    defaultDanceStyle: '8-count',
    defaultLevel: 'beginner',
    autoNumberSections: true,
    autoGenerateCounts: true,
    smartSectionSplitting: true,
    confirmBeforeDelete: true,
    spellCheckStepNames: false,
    defaultWalls: '4',
    defaultCounts: '32',
    showStepSuggestions: true,
    undoHistoryLimit: '50',

    /* Sheet / Print */
    paperSize: 'letter',
    orientation: 'portrait',
    showHeaderOnPrint: true,
    showFooterOnPrint: true,
    includeChoreographerName: true,
    includeMusicInfo: true,
    printFontSize: '12',
    pageMargins: 'normal',

    /* Notifications */
    enableNotifications: true,
    soundEffects: true,
    volume: 70,
    notifyFriendRequests: true,
    notifyCollabInvites: true,
    notifyFeaturedDances: false,

    /* Data & Privacy */
    autoSyncToCloud: false,
    cloudSyncInterval: '30',

    /* Accessibility */
    reduceMotion: false,
    screenReaderDescriptions: false,
    keyboardNavigationMode: false,
    focusIndicators: 'default',
    textSpacing: 'normal',
    cursorSize: 'default',
    tabSize: 'normal',
    dyslexiaFriendlyFont: false,

    /* Advanced */
    developerMode: false,
    showPerformanceStats: false,
    enableExperimentalFeatures: false,
    apiServer: 'default',
    customApiUrl: '',
    debugLogLevel: 'off'
  };

  /* ════════════════════════════════════════════════════════════
     SECTION DEFINITIONS
     ════════════════════════════════════════════════════════════ */
  var ACCENT_COLORS = [
    { id: 'indigo',  hex: '#4f46e5', label: 'Indigo' },
    { id: 'blue',    hex: '#2563eb', label: 'Blue' },
    { id: 'green',   hex: '#16a34a', label: 'Green' },
    { id: 'red',     hex: '#dc2626', label: 'Red' },
    { id: 'purple',  hex: '#9333ea', label: 'Purple' },
    { id: 'orange',  hex: '#ea580c', label: 'Orange' },
    { id: 'teal',    hex: '#0d9488', label: 'Teal' },
    { id: 'pink',    hex: '#db2777', label: 'Pink' }
  ];

  function getAccentById(id) {
    for (var i = 0; i < ACCENT_COLORS.length; i++) {
      if (ACCENT_COLORS[i].id === id) return ACCENT_COLORS[i];
    }
    return ACCENT_COLORS[0];
  }

  function getAccentTone(percent, against) {
    var accent = getAccentById(getSetting('accentColor'));
    var bg = against || 'transparent';
    return 'color-mix(in srgb, ' + accent.hex + ' ' + percent + '%, ' + bg + ')';
  }

  function getAccentRing(alpha) {
    var rgb = hexToRgbString(getAccentById(getSetting('accentColor')).hex).replace(/\s+/g, ',');
    return 'rgba(' + rgb + ',' + String(alpha == null ? 0.22 : alpha) + ')';
  }

  /* ── Comprehensive Font List (60+) ── */
  var FONT_LIST = [
    /* System Fonts */
    { id: 'system',           label: 'System Default',       family: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', category: 'system', google: false },
    { id: 'arial',            label: 'Arial',                family: 'Arial,Helvetica,sans-serif',      category: 'system', google: false },
    { id: 'helvetica-neue',   label: 'Helvetica Neue',       family: '"Helvetica Neue",Helvetica,Arial,sans-serif', category: 'system', google: false },
    { id: 'times-new-roman',  label: 'Times New Roman',      family: '"Times New Roman",Times,serif',   category: 'system', google: false },
    { id: 'georgia',          label: 'Georgia',              family: 'Georgia,"Times New Roman",serif',  category: 'system', google: false },
    { id: 'courier-new',      label: 'Courier New',          family: '"Courier New",Courier,monospace', category: 'system', google: false },
    { id: 'verdana',          label: 'Verdana',              family: 'Verdana,Geneva,sans-serif',       category: 'system', google: false },
    { id: 'trebuchet-ms',     label: 'Trebuchet MS',         family: '"Trebuchet MS",Helvetica,sans-serif', category: 'system', google: false },
    { id: 'palatino',         label: 'Palatino Linotype',    family: '"Palatino Linotype","Book Antiqua",Palatino,serif', category: 'system', google: false },
    { id: 'lucida-console',   label: 'Lucida Console',       family: '"Lucida Console","Lucida Sans Typewriter",monospace', category: 'system', google: false },
    { id: 'tahoma',           label: 'Tahoma',               family: 'Tahoma,Verdana,sans-serif',       category: 'system', google: false },
    { id: 'garamond',         label: 'Garamond',             family: 'Garamond,"Times New Roman",serif', category: 'system', google: false },
    { id: 'comic-sans',       label: 'Comic Sans MS',        family: '"Comic Sans MS","Comic Sans",cursive', category: 'system', google: false },
    /* Sans-Serif (Google Fonts) */
    { id: 'roboto',           label: 'Roboto',               family: '"Roboto",sans-serif',              category: 'sans-serif', google: true },
    { id: 'open-sans',        label: 'Open Sans',            family: '"Open Sans",sans-serif',           category: 'sans-serif', google: true },
    { id: 'lato',             label: 'Lato',                 family: '"Lato",sans-serif',                category: 'sans-serif', google: true },
    { id: 'montserrat',       label: 'Montserrat',           family: '"Montserrat",sans-serif',          category: 'sans-serif', google: true },
    { id: 'poppins',          label: 'Poppins',              family: '"Poppins",sans-serif',             category: 'sans-serif', google: true },
    { id: 'raleway',          label: 'Raleway',              family: '"Raleway",sans-serif',             category: 'sans-serif', google: true },
    { id: 'inter',            label: 'Inter',                family: '"Inter",sans-serif',               category: 'sans-serif', google: true },
    { id: 'nunito',           label: 'Nunito',               family: '"Nunito",sans-serif',              category: 'sans-serif', google: true },
    { id: 'oswald',           label: 'Oswald',               family: '"Oswald",sans-serif',              category: 'sans-serif', google: true },
    { id: 'fira-sans',        label: 'Fira Sans',            family: '"Fira Sans",sans-serif',           category: 'sans-serif', google: true },
    { id: 'noto-sans',        label: 'Noto Sans',            family: '"Noto Sans",sans-serif',           category: 'sans-serif', google: true },
    { id: 'pt-sans',          label: 'PT Sans',              family: '"PT Sans",sans-serif',             category: 'sans-serif', google: true },
    { id: 'rubik',            label: 'Rubik',                family: '"Rubik",sans-serif',               category: 'sans-serif', google: true },
    { id: 'work-sans',        label: 'Work Sans',            family: '"Work Sans",sans-serif',           category: 'sans-serif', google: true },
    { id: 'quicksand',        label: 'Quicksand',            family: '"Quicksand",sans-serif',           category: 'sans-serif', google: true },
    { id: 'barlow',           label: 'Barlow',               family: '"Barlow",sans-serif',              category: 'sans-serif', google: true },
    { id: 'karla',            label: 'Karla',                family: '"Karla",sans-serif',               category: 'sans-serif', google: true },
    { id: 'josefin-sans',     label: 'Josefin Sans',         family: '"Josefin Sans",sans-serif',        category: 'sans-serif', google: true },
    { id: 'cabin',            label: 'Cabin',                family: '"Cabin",sans-serif',               category: 'sans-serif', google: true },
    { id: 'dosis',            label: 'Dosis',                family: '"Dosis",sans-serif',               category: 'sans-serif', google: true },
    { id: 'archivo',          label: 'Archivo',              family: '"Archivo",sans-serif',             category: 'sans-serif', google: true },
    { id: 'mulish',           label: 'Mulish',               family: '"Mulish",sans-serif',              category: 'sans-serif', google: true },
    { id: 'ubuntu',           label: 'Ubuntu',               family: '"Ubuntu",sans-serif',              category: 'sans-serif', google: true },
    { id: 'source-sans-3',    label: 'Source Sans 3',        family: '"Source Sans 3",sans-serif',       category: 'sans-serif', google: true },
    { id: 'manrope',          label: 'Manrope',              family: '"Manrope",sans-serif',             category: 'sans-serif', google: true },
    { id: 'dm-sans',          label: 'DM Sans',              family: '"DM Sans",sans-serif',             category: 'sans-serif', google: true },
    { id: 'lexend',           label: 'Lexend',               family: '"Lexend",sans-serif',              category: 'sans-serif', google: true },
    /* Serif (Google Fonts) */
    { id: 'playfair-display', label: 'Playfair Display',     family: '"Playfair Display",serif',         category: 'serif', google: true },
    { id: 'merriweather',     label: 'Merriweather',         family: '"Merriweather",serif',             category: 'serif', google: true },
    { id: 'bitter',           label: 'Bitter',               family: '"Bitter",serif',                   category: 'serif', google: true },
    { id: 'libre-baskerville',label: 'Libre Baskerville',    family: '"Libre Baskerville",serif',        category: 'serif', google: true },
    { id: 'crimson-text',     label: 'Crimson Text',         family: '"Crimson Text",serif',             category: 'serif', google: true },
    { id: 'eb-garamond',      label: 'EB Garamond',          family: '"EB Garamond",serif',              category: 'serif', google: true },
    { id: 'cormorant-garamond',label:'Cormorant Garamond',   family: '"Cormorant Garamond",serif',       category: 'serif', google: true },
    { id: 'spectral',         label: 'Spectral',             family: '"Spectral",serif',                 category: 'serif', google: true },
    { id: 'vollkorn',         label: 'Vollkorn',             family: '"Vollkorn",serif',                 category: 'serif', google: true },
    { id: 'pt-serif',         label: 'PT Serif',             family: '"PT Serif",serif',                 category: 'serif', google: true },
    { id: 'noto-serif',       label: 'Noto Serif',           family: '"Noto Serif",serif',               category: 'serif', google: true },
    { id: 'lora',             label: 'Lora',                 family: '"Lora",serif',                     category: 'serif', google: true },
    /* Display / Decorative */
    { id: 'abril-fatface',    label: 'Abril Fatface',        family: '"Abril Fatface",serif',            category: 'display', google: true },
    { id: 'bebas-neue',       label: 'Bebas Neue',           family: '"Bebas Neue",sans-serif',          category: 'display', google: true },
    { id: 'comfortaa',        label: 'Comfortaa',            family: '"Comfortaa",cursive',              category: 'display', google: true },
    { id: 'lobster',          label: 'Lobster',              family: '"Lobster",cursive',                category: 'display', google: true },
    { id: 'permanent-marker', label: 'Permanent Marker',     family: '"Permanent Marker",cursive',       category: 'display', google: true },
    { id: 'righteous',        label: 'Righteous',            family: '"Righteous",sans-serif',           category: 'display', google: true },
    { id: 'fredoka',          label: 'Fredoka',              family: '"Fredoka",sans-serif',             category: 'display', google: true },
    { id: 'bangers',          label: 'Bangers',              family: '"Bangers",cursive',                category: 'display', google: true },
    /* Handwriting / Script */
    { id: 'dancing-script',   label: 'Dancing Script',       family: '"Dancing Script",cursive',         category: 'handwriting', google: true },
    { id: 'pacifico',         label: 'Pacifico',             family: '"Pacifico",cursive',               category: 'handwriting', google: true },
    { id: 'caveat',           label: 'Caveat',               family: '"Caveat",cursive',                 category: 'handwriting', google: true },
    { id: 'sacramento',       label: 'Sacramento',           family: '"Sacramento",cursive',             category: 'handwriting', google: true },
    { id: 'great-vibes',      label: 'Great Vibes',          family: '"Great Vibes",cursive',            category: 'handwriting', google: true },
    { id: 'satisfy',          label: 'Satisfy',              family: '"Satisfy",cursive',                category: 'handwriting', google: true },
    { id: 'cookie',           label: 'Cookie',               family: '"Cookie",cursive',                 category: 'handwriting', google: true },
    { id: 'indie-flower',     label: 'Indie Flower',         family: '"Indie Flower",cursive',           category: 'handwriting', google: true },
    { id: 'kalam',            label: 'Kalam',                family: '"Kalam",cursive',                  category: 'handwriting', google: true },
    /* Monospace */
    { id: 'jetbrains-mono',   label: 'JetBrains Mono',       family: '"JetBrains Mono",monospace',      category: 'monospace', google: true },
    { id: 'fira-code',        label: 'Fira Code',            family: '"Fira Code",monospace',            category: 'monospace', google: true },
    { id: 'source-code-pro',  label: 'Source Code Pro',      family: '"Source Code Pro",monospace',      category: 'monospace', google: true },
    { id: 'ibm-plex-mono',    label: 'IBM Plex Mono',        family: '"IBM Plex Mono",monospace',       category: 'monospace', google: true },
    { id: 'space-mono',       label: 'Space Mono',           family: '"Space Mono",monospace',           category: 'monospace', google: true },
    { id: 'roboto-mono',      label: 'Roboto Mono',          family: '"Roboto Mono",monospace',          category: 'monospace', google: true }
  ];

  var FONT_CATEGORIES = [
    { id: 'all',          label: 'All' },
    { id: 'system',       label: 'System' },
    { id: 'sans-serif',   label: 'Sans-Serif' },
    { id: 'serif',        label: 'Serif' },
    { id: 'display',      label: 'Display' },
    { id: 'handwriting',  label: 'Handwriting' },
    { id: 'monospace',    label: 'Monospace' }
  ];

  var _loadedGoogleFonts = {};
  function loadGoogleFont(fontObj) {
    if (!fontObj.google || _loadedGoogleFonts[fontObj.id]) return;
    _loadedGoogleFonts[fontObj.id] = true;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fontObj.label) + ':wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }

  function getFontById(id) {
    for (var i = 0; i < FONT_LIST.length; i++) {
      if (FONT_LIST[i].id === id) return FONT_LIST[i];
    }
    return FONT_LIST[0]; // fallback to system
  }

  var _fontSearchQuery = '';
  var _fontCategoryFilter = 'all';

  var SECTIONS = [
    { id: 'appearance',    label: 'Appearance',       icon: 'palette',       desc: 'Theme, colors, fonts & layout' },
    { id: 'editor',        label: 'Editor Behavior',  icon: 'edit',          desc: 'Auto-save, defaults & smart features' },
    { id: 'print',         label: 'Sheet / Print',    icon: 'printer',       desc: 'Paper size, orientation & margins' },
    { id: 'notifications', label: 'Notifications',    icon: 'bell',          desc: 'Sounds, alerts & updates' },
    { id: 'data',          label: 'Data & Privacy',   icon: 'shield',        desc: 'Sync, export, import & cleanup' },
    { id: 'accessibility', label: 'Accessibility',    icon: 'accessibility', desc: 'Motion, screen reader & navigation' },
    { id: 'advanced',      label: 'Advanced',         icon: 'code',          desc: 'Developer tools & debug options' }
  ];

  /* ════════════════════════════════════════════════════════════
     STATE
     ════════════════════════════════════════════════════════════ */
  var settingsState = {
    settings: loadSettings(),
    expandedSection: 'appearance',
    searchQuery: '',
    error: null,
    success: null,
    confirmAction: null,   // 'clearData' | 'deleteAccount' | 'resetSettings' | null
    confirmStep: 0         // for double-confirm
  };

  /* ════════════════════════════════════════════════════════════
     UTILITY HELPERS
     ════════════════════════════════════════════════════════════ */
  function loadSettings() {
    try {
      var raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if (raw && typeof raw === 'object') {
        var merged = {};
        for (var k in DEFAULTS) {
          if (DEFAULTS.hasOwnProperty(k)) {
            merged[k] = raw.hasOwnProperty(k) ? raw[k] : DEFAULTS[k];
          }
        }
        return merged;
      }
    } catch (e) { /* corrupted */ }
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  function saveSettings() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(settingsState.settings)); }
    catch (e) { /* quota */ }
  }

  function setSetting(key, value) {
    settingsState.settings[key] = value;
    saveSettings();
    try {
      window.dispatchEvent(new CustomEvent('stepper-settings-changed', { detail: { key: key, value: value } }));
    } catch (e) { /* noop */ }
    applyLiveSetting(key, value);
  }

  function getSetting(key) {
    return settingsState.settings.hasOwnProperty(key) ? settingsState.settings[key] : DEFAULTS[key];
  }

  function queueSettingsRender() {
    if (_queuedSettingsRender) return;
    _queuedSettingsRender = window.requestAnimationFrame(function () {
      _queuedSettingsRender = 0;
      renderSettingsPage();
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(text)));
    return div.innerHTML;
  }

  function isDarkMode() {
    try {
      var data = JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || 'null');
      return !!(data && data.isDarkMode);
    } catch (e) { return false; }
  }

  function themeClasses() {
    var dark = isDarkMode();
    var accent = getAccentById(getSetting('accentColor'));
    var accentRgb = hexToRgbString(accent.hex);
    return {
      dark: dark,
      shell:    dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      panel:    dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      soft:     dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      subtle:   dark ? 'text-neutral-400' : 'text-neutral-500',
      accent:   dark ? ('background:rgba(' + accentRgb + ',.15);border-color:rgba(' + accentRgb + ',.30);color:' + accent.hex + ';') : ('background:rgba(' + accentRgb + ',.08);border-color:rgba(' + accentRgb + ',.24);color:' + accent.hex + ';'),
      cardBg:   dark ? 'background:#1a1a2e;border-color:#2d2d44;' : 'background:#ffffff;border-color:#e5e7eb;',
      inputBg:  dark ? 'background:#111827;border-color:#374151;color:#f3f4f6;' : 'background:#ffffff;border-color:#d1d5db;color:#111827;',
      chipBg:   dark ? 'background:#1f2937;border-color:#374151;color:#d1d5db;' : 'background:#f9fafb;border-color:#e5e7eb;color:#374151;',
      chipActive: 'background:' + accent.hex + ';border-color:' + accent.hex + ';color:#ffffff;',
      border:   dark ? '#374151' : '#e5e7eb',
      hoverBg:  dark ? '#1f2937' : '#f3f4f6',
      dangerBg: dark ? 'background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.3);color:#fca5a5;' : 'background:#fef2f2;border-color:#fecaca;color:#dc2626;',
      successBg: dark ? 'background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.3);color:#86efac;' : 'background:#f0fdf4;border-color:#bbf7d0;color:#16a34a;'
    };
  }

  /* ════════════════════════════════════════════════════════════
     ICONS
     ════════════════════════════════════════════════════════════ */
  function icon(name) {
    var icons = {
      palette:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>',
      edit:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
      printer:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
      bell:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
      shield:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      accessibility: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><circle cx="12" cy="4" r="1.5"/><path d="M7 8l5 0 5 0"/><path d="M12 8l0 4"/><path d="M12 12l-3 7"/><path d="M12 12l3 7"/></svg>',
      code:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
      settings:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
      chevronDown:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="6 9 12 15 18 9"/></svg>',
      chevronUp:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="18 15 12 9 6 15"/></svg>',
      search:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
      download:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      upload:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      trash:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
      refresh:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
      warning:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      check:         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><polyline points="20 6 9 17 4 12"/></svg>',
      database:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
      x:             '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
    };
    return icons[name] || '';
  }

  /* ════════════════════════════════════════════════════════════
     LIVE SETTING APPLICATION
     ════════════════════════════════════════════════════════════ */
  function applyLiveSetting(key, value) {
    var root = document.documentElement;
    switch (key) {
      case 'fontSize':
        root.style.setProperty('--stepper-font-size', value + 'px');
        break;
      case 'fontFamily':
        var fontObj = getFontById(value);
        if (fontObj.google) loadGoogleFont(fontObj);
        root.style.setProperty('--stepper-font-family', fontObj.family);
        break;
      case 'reduceMotion':
        if (value) root.classList.add('stepper-reduce-motion');
        else root.classList.remove('stepper-reduce-motion');
        break;
      case 'highContrastMode':
        if (value) root.classList.add('stepper-high-contrast');
        else root.classList.remove('stepper-high-contrast');
        break;
      case 'dyslexiaFriendlyFont':
        if (value) root.classList.add('stepper-dyslexia-font');
        else root.classList.remove('stepper-dyslexia-font');
        break;
      case 'theme':
        applyTheme(value);
        break;
      case 'accentColor':
        applyAccentColor(value);
        break;
      case 'textSpacing':
        root.setAttribute('data-stepper-text-spacing', String(value || 'normal'));
        break;
      case 'tabSize':
        root.setAttribute('data-stepper-tab-size', String(value || 'normal'));
        break;
    }
  }

  function applyAccentColor(value) {
    var root = document.documentElement;
    var accent = getAccentById(value);
    var accentRgb = hexToRgbString(accent.hex);
    root.style.setProperty('--stepper-accent-color', accent.hex);
    root.style.setProperty('--stepper-accent-rgb', accentRgb);
    root.style.setProperty('--stepper-accent-soft', 'color-mix(in srgb, ' + accent.hex + ' 12%, white)');
    root.style.setProperty('--stepper-accent-soft-strong', 'color-mix(in srgb, ' + accent.hex + ' 18%, white)');
    root.style.setProperty('--stepper-accent-dark-soft', 'color-mix(in srgb, ' + accent.hex + ' 22%, transparent)');
    root.style.setProperty('--stepper-accent-hover', 'color-mix(in srgb, ' + accent.hex + ' 88%, black)');
    root.style.setProperty('--stepper-accent-ring', 'rgba(' + accentRgb.replace(/\s+/g, ',') + ',0.24)');
    root.setAttribute('data-stepper-accent', accent.id);
    try {
      var meta = document.getElementById('stepper-theme-color');
      if (meta) meta.setAttribute('content', accent.hex);
    } catch (e) { /* noop */ }
    if (_queuedAccentNotify) return;
    _queuedAccentNotify = window.requestAnimationFrame(function () {
      _queuedAccentNotify = 0;
      try { window.dispatchEvent(new Event('stepper-theme-updated')); } catch (e2) { /* noop */ }
    });
  }

  function hexToRgbString(hex) {
    var safe = String(hex || '').replace('#', '');
    if (safe.length === 3) safe = safe.replace(/(.)/g, '$1$1');
    var num = parseInt(safe, 16);
    if (!isFinite(num)) return '79 70 229';
    return ((num >> 16) & 255) + ' ' + ((num >> 8) & 255) + ' ' + (num & 255);
  }

  function applyTheme(value) {
    try {
      var data = JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || '{}');
      if (value === 'dark') data.isDarkMode = true;
      else if (value === 'light') data.isDarkMode = false;
      else {
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        data.isDarkMode = prefersDark;
      }
      localStorage.setItem(BUILDER_DATA_KEY, JSON.stringify(data));
      document.documentElement.classList.toggle('dark', !!data.isDarkMode);
      document.body.classList.toggle('dark', !!data.isDarkMode);
      try { window.dispatchEvent(new Event('stepper-theme-updated')); } catch (err) { /* noop */ }
      window.dispatchEvent(new StorageEvent('storage', { key: BUILDER_DATA_KEY }));
    } catch (e) { /* noop */ }
  }

  function applyAllLiveSettings(settings) {
    settings = settings || settingsState.settings || loadSettings();
    for (var key in settings) {
      if (settings.hasOwnProperty(key)) applyLiveSetting(key, settings[key]);
    }
    try { window.dispatchEvent(new Event('stepper-theme-updated')); } catch (e) { /* noop */ }
  }

  function applyAppearanceLiveSettings(settings) {
    settings = settings || settingsState.settings || loadSettings();
    var keys = ['theme', 'accentColor', 'fontFamily', 'fontSize', 'highContrastMode', 'reduceMotion', 'dyslexiaFriendlyFont', 'textSpacing', 'tabSize'];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      applyLiveSetting(key, settings.hasOwnProperty(key) ? settings[key] : DEFAULTS[key]);
    }
  }

  /* ════════════════════════════════════════════════════════════
     DATA UTILITIES
     ════════════════════════════════════════════════════════════ */
  function getLocalStorageSize() {
    var total = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        var v = localStorage.getItem(k);
        total += (k.length + v.length) * 2; // UTF-16
      }
    } catch (e) { /* noop */ }
    return total;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  function exportAllData() {
    try {
      var data = {};
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        data[k] = localStorage.getItem(k);
      }
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'stepper-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      settingsState.success = 'Data exported successfully!';
    } catch (e) {
      settingsState.error = 'Failed to export data: ' + e.message;
    }
    renderSettingsPage();
  }

  function importData(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (typeof data !== 'object' || data === null) throw new Error('Invalid format');
        var count = 0;
        for (var k in data) {
          if (data.hasOwnProperty(k)) {
            localStorage.setItem(k, data[k]);
            count++;
          }
        }
        settingsState.settings = loadSettings();
        settingsState.success = 'Imported ' + count + ' items successfully! Reload recommended.';
      } catch (err) {
        settingsState.error = 'Failed to import: ' + err.message;
      }
      renderSettingsPage();
    };
    reader.readAsText(file);
  }

  function clearLocalData() {
    try {
      var settingsBackup = localStorage.getItem(LS_KEY);
      localStorage.clear();
      if (settingsBackup) localStorage.setItem(LS_KEY, settingsBackup);
      settingsState.success = 'Local data cleared (settings preserved).';
      settingsState.confirmAction = null;
      settingsState.confirmStep = 0;
    } catch (e) {
      settingsState.error = 'Failed to clear data: ' + e.message;
    }
    renderSettingsPage();
  }

  function clearCache() {
    try {
      if ('caches' in window) {
        caches.keys().then(function (names) {
          names.forEach(function (name) { caches.delete(name); });
        });
      }
      settingsState.success = 'Cache cleared successfully!';
    } catch (e) {
      settingsState.error = 'Failed to clear cache.';
    }
    renderSettingsPage();
  }

  function resetAllSettings() {
    settingsState.settings = JSON.parse(JSON.stringify(DEFAULTS));
    saveSettings();
    settingsState.success = 'All settings have been reset to defaults.';
    settingsState.confirmAction = null;
    settingsState.confirmStep = 0;
    try {
      window.dispatchEvent(new CustomEvent('stepper-settings-changed', { detail: { key: '_all', value: null } }));
    } catch (e) { /* noop */ }
    renderSettingsPage();
  }

  /* ════════════════════════════════════════════════════════════
     SEARCH MATCHING
     ════════════════════════════════════════════════════════════ */
  var SETTING_LABELS = {
    theme: 'Theme',
    accentColor: 'Accent Color',
    fontSize: 'Font Size',
    fontFamily: 'Font Family',
    editorWidth: 'Editor Width',
    showLineNumbers: 'Show Line Numbers',
    showStepCounts: 'Show Step Counts',
    showWeightIndicators: 'Show Weight Indicators',
    compactStepView: 'Compact Step View',
    showSectionDividers: 'Show Section Dividers',
    animationSpeed: 'Animation Speed',
    highContrastMode: 'High Contrast Mode',
    autoSaveInterval: 'Auto-Save Interval',
    defaultDanceStyle: 'Default Dance Style',
    defaultLevel: 'Default Level',
    autoNumberSections: 'Auto-Number Sections',
    autoGenerateCounts: 'Auto-Generate Counts',
    smartSectionSplitting: 'Smart Section Splitting',
    confirmBeforeDelete: 'Confirm Before Delete',
    spellCheckStepNames: 'Spell Check Step Names',
    defaultWalls: 'Default Walls',
    defaultCounts: 'Default Counts',
    showStepSuggestions: 'Show Step Suggestions',
    undoHistoryLimit: 'Undo History Limit',
    paperSize: 'Paper Size',
    orientation: 'Orientation',
    showHeaderOnPrint: 'Show Header on Print',
    showFooterOnPrint: 'Show Footer on Print',
    includeChoreographerName: 'Include Choreographer Name',
    includeMusicInfo: 'Include Music Info',
    printFontSize: 'Print Font Size',
    pageMargins: 'Page Margins',
    enableNotifications: 'Enable Notifications',
    soundEffects: 'Sound Effects',
    volume: 'Volume',
    notifyFriendRequests: 'Notify on Friend Requests',
    notifyCollabInvites: 'Notify on Collaboration Invites',
    notifyFeaturedDances: 'Notify on Featured Dances',
    autoSyncToCloud: 'Auto-Sync to Cloud',
    cloudSyncInterval: 'Cloud Sync Interval',
    reduceMotion: 'Reduce Motion',
    screenReaderDescriptions: 'Screen Reader Descriptions',
    keyboardNavigationMode: 'Keyboard Navigation Mode',
    focusIndicators: 'Focus Indicators',
    textSpacing: 'Text Spacing',
    cursorSize: 'Cursor Size',
    tabSize: 'Tab Size',
    dyslexiaFriendlyFont: 'Dyslexia-Friendly Font',
    developerMode: 'Developer Mode',
    showPerformanceStats: 'Show Performance Stats',
    enableExperimentalFeatures: 'Enable Experimental Features',
    apiServer: 'API Server',
    debugLogLevel: 'Debug Log Level'
  };

  var SETTING_SECTION_MAP = {
    theme: 'appearance', accentColor: 'appearance', fontSize: 'appearance', fontFamily: 'appearance',
    editorWidth: 'appearance', showLineNumbers: 'appearance', showStepCounts: 'appearance',
    showWeightIndicators: 'appearance', compactStepView: 'appearance', showSectionDividers: 'appearance',
    animationSpeed: 'appearance', highContrastMode: 'appearance',
    autoSaveInterval: 'editor', defaultDanceStyle: 'editor', defaultLevel: 'editor',
    autoNumberSections: 'editor', autoGenerateCounts: 'editor', smartSectionSplitting: 'editor',
    confirmBeforeDelete: 'editor', spellCheckStepNames: 'editor', defaultWalls: 'editor',
    defaultCounts: 'editor', showStepSuggestions: 'editor', undoHistoryLimit: 'editor',
    paperSize: 'print', orientation: 'print', showHeaderOnPrint: 'print', showFooterOnPrint: 'print',
    includeChoreographerName: 'print', includeMusicInfo: 'print', printFontSize: 'print', pageMargins: 'print',
    enableNotifications: 'notifications', soundEffects: 'notifications', volume: 'notifications',
    notifyFriendRequests: 'notifications', notifyCollabInvites: 'notifications', notifyFeaturedDances: 'notifications',
    autoSyncToCloud: 'data', cloudSyncInterval: 'data',
    reduceMotion: 'accessibility', screenReaderDescriptions: 'accessibility',
    keyboardNavigationMode: 'accessibility', focusIndicators: 'accessibility',
    textSpacing: 'accessibility', cursorSize: 'accessibility', tabSize: 'accessibility',
    dyslexiaFriendlyFont: 'accessibility',
    developerMode: 'advanced', showPerformanceStats: 'advanced',
    enableExperimentalFeatures: 'advanced', apiServer: 'advanced', debugLogLevel: 'advanced'
  };

  function matchesSearch(sectionId) {
    if (!settingsState.searchQuery) return true;
    var q = settingsState.searchQuery.toLowerCase();
    var sec = SECTIONS.find(function (s) { return s.id === sectionId; });
    if (sec && (sec.label.toLowerCase().indexOf(q) !== -1 || sec.desc.toLowerCase().indexOf(q) !== -1)) return true;
    for (var key in SETTING_SECTION_MAP) {
      if (SETTING_SECTION_MAP[key] === sectionId && SETTING_LABELS[key] && SETTING_LABELS[key].toLowerCase().indexOf(q) !== -1) {
        return true;
      }
    }
    return false;
  }

  function settingMatchesSearch(key) {
    if (!settingsState.searchQuery) return true;
    var q = settingsState.searchQuery.toLowerCase();
    return (SETTING_LABELS[key] || key).toLowerCase().indexOf(q) !== -1;
  }

  /* ════════════════════════════════════════════════════════════
     RENDER HELPERS — SETTING CONTROLS
     ════════════════════════════════════════════════════════════ */
  function renderToggle(key, label, desc, theme) {
    if (!settingMatchesSearch(key)) return '';
    var val = !!getSetting(key);
    var html = '';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid ' + theme.border + ';" data-setting-row="' + key + '">';
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:13px;font-weight:600;">' + escapeHtml(label) + '</div>';
    if (desc) html += '<div class="' + theme.subtle + '" style="font-size:11px;margin-top:2px;">' + escapeHtml(desc) + '</div>';
    html += '</div>';
    html += '<button data-settings-toggle="' + key + '" aria-pressed="' + val + '" role="switch" style="';
    html += 'position:relative;width:44px;height:24px;border-radius:12px;border:none;cursor:pointer;transition:all .2s ease;flex-shrink:0;margin-left:12px;';
    html += val ? 'background:#4f46e5;' : 'background:' + (theme.dark ? '#374151' : '#d1d5db') + ';';
    html += '">';
    html += '<span style="position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s ease;box-shadow:0 1px 3px rgba(0,0,0,.2);';
    html += val ? 'transform:translateX(22px);' : 'transform:translateX(2px);';
    html += '"></span>';
    html += '</button>';
    html += '</div>';
    return html;
  }

  function renderSelect(key, label, desc, options, theme) {
    if (!settingMatchesSearch(key)) return '';
    var val = String(getSetting(key));
    var html = '';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid ' + theme.border + ';gap:12px;" data-setting-row="' + key + '">';
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:13px;font-weight:600;">' + escapeHtml(label) + '</div>';
    if (desc) html += '<div class="' + theme.subtle + '" style="font-size:11px;margin-top:2px;">' + escapeHtml(desc) + '</div>';
    html += '</div>';
    html += '<select data-settings-select="' + key + '" style="';
    html += 'padding:6px 28px 6px 10px;border-radius:8px;border:1px solid;font-size:12px;cursor:pointer;flex-shrink:0;appearance:none;';
    html += '-webkit-appearance:none;background-image:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>\');';
    html += 'background-repeat:no-repeat;background-position:right 8px center;';
    html += theme.inputBg + '">';
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      html += '<option value="' + escapeHtml(opt.value) + '"' + (val === opt.value ? ' selected' : '') + '>' + escapeHtml(opt.label) + '</option>';
    }
    html += '</select>';
    html += '</div>';
    return html;
  }

  function renderRadioGroup(key, label, desc, options, theme) {
    if (!settingMatchesSearch(key)) return '';
    var val = String(getSetting(key));
    var html = '';
    html += '<div style="padding:12px 0;border-bottom:1px solid ' + theme.border + ';" data-setting-row="' + key + '">';
    html += '<div style="font-size:13px;font-weight:600;">' + escapeHtml(label) + '</div>';
    if (desc) html += '<div class="' + theme.subtle + '" style="font-size:11px;margin-top:2px;">' + escapeHtml(desc) + '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">';
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      var active = val === opt.value;
      html += '<button data-settings-radio="' + key + '" data-value="' + escapeHtml(opt.value) + '" style="';
      html += 'padding:5px 14px;border-radius:999px;border:1px solid;font-size:12px;font-weight:500;cursor:pointer;transition:all .15s ease;';
      html += active ? theme.chipActive : theme.chipBg;
      html += '">' + escapeHtml(opt.label) + '</button>';
    }
    html += '</div></div>';
    return html;
  }

  function renderSlider(key, label, desc, min, max, unit, theme) {
    if (!settingMatchesSearch(key)) return '';
    var val = Number(getSetting(key));
    var html = '';
    html += '<div style="padding:12px 0;border-bottom:1px solid ' + theme.border + ';" data-setting-row="' + key + '">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;">';
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-size:13px;font-weight:600;">' + escapeHtml(label) + '</div>';
    if (desc) html += '<div class="' + theme.subtle + '" style="font-size:11px;margin-top:2px;">' + escapeHtml(desc) + '</div>';
    html += '</div>';
    html += '<span data-settings-slider-val="' + key + '" style="font-size:12px;font-weight:700;min-width:40px;text-align:right;">' + val + (unit || '') + '</span>';
    html += '</div>';
    html += '<input data-settings-slider="' + key + '" type="range" min="' + min + '" max="' + max + '" value="' + val + '" style="';
    html += 'width:100%;margin-top:8px;accent-color:' + getAccentById(getSetting('accentColor')).hex + ';height:6px;cursor:pointer;';
    html += '">';
    html += '</div>';
    return html;
  }

  function renderColorPicker(key, label, desc, colors, theme) {
    if (!settingMatchesSearch(key)) return '';
    var val = getSetting(key);
    var html = '';
    html += '<div style="padding:12px 0;border-bottom:1px solid ' + theme.border + ';" data-setting-row="' + key + '">';
    html += '<div style="font-size:13px;font-weight:600;">' + escapeHtml(label) + '</div>';
    if (desc) html += '<div class="' + theme.subtle + '" style="font-size:11px;margin-top:2px;">' + escapeHtml(desc) + '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
    for (var i = 0; i < colors.length; i++) {
      var c = colors[i];
      var active = val === c.id;
      html += '<button data-settings-color="' + key + '" data-value="' + c.id + '" title="' + escapeHtml(c.label) + '" style="';
      html += 'width:32px;height:32px;border-radius:50%;border:3px solid;cursor:pointer;transition:all .15s ease;';
      html += 'background:' + c.hex + ';';
      html += active ? 'border-color:' + c.hex + ';box-shadow:0 0 0 2px ' + c.hex + ';transform:scale(1.15);' : 'border-color:' + (theme.dark ? '#374151' : '#e5e7eb') + ';';
      html += '"></button>';
    }
    html += '</div></div>';
    return html;
  }

  function renderButton(actionId, label, iconName, style, theme) {
    var btnStyle = 'padding:8px 16px;border-radius:10px;border:1px solid;font-size:12px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:all .15s ease;';
    if (style === 'danger') {
      btnStyle += theme.dark
        ? 'background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);color:#fca5a5;'
        : 'background:#fef2f2;border-color:#fecaca;color:#dc2626;';
    } else if (style === 'primary') {
      var accent = getAccentById(getSetting('accentColor')).hex;
      btnStyle += 'background:' + accent + ';border-color:' + accent + ';color:#fff;';
    } else {
      btnStyle += theme.chipBg;
    }
    return '<button data-settings-action="' + actionId + '" style="' + btnStyle + '">' +
      (iconName ? '<span style="flex-shrink:0;">' + icon(iconName) + '</span>' : '') +
      escapeHtml(label) + '</button>';
  }

  /* ════════════════════════════════════════════════════════════
     FONT PICKER
     ════════════════════════════════════════════════════════════ */
  function renderFontPicker(theme) {
    if (!settingMatchesSearch('fontFamily')) return '';
    var currentFont = getSetting('fontFamily');
    var html = '';
    html += '<div style="padding:12px 0;border-bottom:1px solid ' + theme.border + ';" data-setting-row="fontFamily">';
    html += '<div style="font-size:13px;font-weight:600;">Font Family</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:11px;margin-top:2px;">Choose from ' + FONT_LIST.length + ' fonts — click to preview &amp; apply</div>';

    /* Category filter pills */
    html += '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:10px;">';
    for (var ci = 0; ci < FONT_CATEGORIES.length; ci++) {
      var cat = FONT_CATEGORIES[ci];
      var catActive = _fontCategoryFilter === cat.id;
      html += '<button data-font-category="' + cat.id + '" style="';
      html += 'padding:4px 12px;border-radius:999px;border:1px solid;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s ease;';
      html += catActive ? theme.chipActive : theme.chipBg;
      html += '">' + escapeHtml(cat.label) + '</button>';
    }
    html += '</div>';

    /* Font search */
    html += '<div style="position:relative;margin-top:8px;">';
    html += '<input data-font-search type="text" placeholder="Search fonts…" value="' + escapeHtml(_fontSearchQuery) + '" style="';
    html += 'width:100%;padding:8px 12px 8px 32px;border-radius:10px;border:1px solid;font-size:12px;box-sizing:border-box;' + theme.inputBg + '">';
    html += '<span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);opacity:.4;">' + icon('search') + '</span>';
    html += '</div>';

    /* Font grid */
    html += '<div data-font-grid style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-top:10px;max-height:320px;overflow-y:auto;padding:4px 2px;">';
    var query = _fontSearchQuery.toLowerCase();
    var visibleCount = 0;
    for (var fi = 0; fi < FONT_LIST.length; fi++) {
      var f = FONT_LIST[fi];
      /* Category filter */
      if (_fontCategoryFilter !== 'all' && f.category !== _fontCategoryFilter) continue;
      /* Search filter */
      if (query && f.label.toLowerCase().indexOf(query) === -1 && f.category.indexOf(query) === -1) continue;
      visibleCount++;
      var isActive = currentFont === f.id;
      /* Preload Google Font for preview */
      if (f.google) loadGoogleFont(f);
      html += '<button data-font-pick="' + f.id + '" title="' + escapeHtml(f.label) + '" style="';
      html += 'padding:10px 12px;border-radius:12px;border:2px solid;cursor:pointer;text-align:left;transition:all .15s ease;';
      html += isActive
        ? 'border-color:' + getAccentById(getSetting('accentColor')).hex + ';background:' + (theme.dark ? getAccentTone(15, '#0f172a') : getAccentTone(8, '#ffffff')) + ';box-shadow:0 0 0 2px ' + getAccentRing(0.25) + ';'
        : 'border-color:' + theme.border + ';background:' + (theme.dark ? '#1a1a2e' : '#fafafa') + ';';
      html += '">';
      html += '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;opacity:.5;">' + escapeHtml(f.category) + '</div>';
      html += '<div style="font-family:' + f.family + ';font-size:15px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(f.label) + '</div>';
      html += '<div style="font-family:' + f.family + ';font-size:12px;opacity:.6;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">The quick brown fox</div>';
      html += '</button>';
    }
    if (visibleCount === 0) {
      html += '<div style="grid-column:1/-1;text-align:center;padding:20px;opacity:.5;font-size:13px;">No fonts match your search</div>';
    }
    html += '</div>';

    /* Current selection label */
    var cur = getFontById(currentFont);
    html += '<div style="margin-top:8px;font-size:12px;opacity:.7;">Currently using: <strong style="font-family:' + cur.family + ';">' + escapeHtml(cur.label) + '</strong></div>';
    html += '</div>';
    return html;
  }

  /* ════════════════════════════════════════════════════════════
     RENDER SECTIONS
     ════════════════════════════════════════════════════════════ */
  function renderAppearanceSection(theme) {
    var html = '';

    html += renderRadioGroup('theme', 'Theme', 'Choose your preferred color scheme', [
      { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'system', label: 'System' }
    ], theme);

    html += renderColorPicker('accentColor', 'Accent Color', 'Choose the primary accent color used throughout the app', ACCENT_COLORS, theme);

    html += renderSlider('fontSize', 'Font Size', 'Adjust the base font size for the editor', 10, 24, 'px', theme);

    // Font size preview
    if (settingMatchesSearch('fontSize')) {
      html += '<div style="padding:8px 12px;margin:4px 0 8px;border-radius:10px;border:1px solid ' + theme.border + ';font-size:' + getSetting('fontSize') + 'px;">';
      html += '<span class="' + theme.subtle + '" style="font-size:10px;display:block;margin-bottom:4px;">Preview</span>';
      html += 'The quick brown fox jumps over the lazy dog';
      html += '</div>';
    }

    html += renderFontPicker(theme);

    html += renderRadioGroup('editorWidth', 'Editor Width', 'Set the maximum width of the editor area', [
      { value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }
    ], theme);

    html += renderToggle('showLineNumbers', 'Show Line Numbers', 'Display line numbers alongside steps', theme);
    html += renderToggle('showStepCounts', 'Show Step Counts', 'Display count numbers on each step', theme);
    html += renderToggle('showWeightIndicators', 'Show Weight Indicators', 'Show weight-change markers on steps', theme);
    html += renderToggle('compactStepView', 'Compact Step View', 'Use a denser layout with less spacing between steps', theme);
    html += renderToggle('showSectionDividers', 'Show Section Dividers', 'Display visual dividers between sections of a dance', theme);

    html += renderRadioGroup('animationSpeed', 'Animation Speed', 'Control UI animation speed', [
      { value: 'off', label: 'Off' }, { value: 'fast', label: 'Fast' }, { value: 'normal', label: 'Normal' }, { value: 'slow', label: 'Slow' }
    ], theme);

    html += renderToggle('highContrastMode', 'High Contrast Mode', 'Increase contrast for better visibility', theme);

    return html;
  }

  function renderEditorSection(theme) {
    var html = '';

    html += renderSelect('autoSaveInterval', 'Auto-Save Interval', 'How often to automatically save your work', [
      { value: 'off', label: 'Off' }, { value: '5', label: '5 seconds' }, { value: '15', label: '15 seconds' },
      { value: '30', label: '30 seconds' }, { value: '60', label: '60 seconds' }
    ], theme);

    html += renderRadioGroup('defaultDanceStyle', 'Default Dance Style', 'Set the default counting style for new dances', [
      { value: '8-count', label: '8-Count' }, { value: 'waltz', label: 'Waltz' }
    ], theme);

    html += renderSelect('defaultLevel', 'Default Level', 'Set the default difficulty for new dances', [
      { value: 'beginner', label: 'Beginner' }, { value: 'improver', label: 'Improver' },
      { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }
    ], theme);

    html += renderToggle('autoNumberSections', 'Auto-Number Sections', 'Automatically number sections (A1, A2, B1…)', theme);
    html += renderToggle('autoGenerateCounts', 'Auto-Generate Counts', 'Automatically generate count numbers for new steps', theme);
    html += renderToggle('smartSectionSplitting', 'Smart Section Splitting', 'Intelligently split sections when inserting breaks', theme);
    html += renderToggle('confirmBeforeDelete', 'Confirm Before Delete', 'Show a confirmation dialog before deleting steps or sections', theme);
    html += renderToggle('spellCheckStepNames', 'Spell Check Step Names', 'Highlight misspelled or unrecognized step names', theme);

    html += renderRadioGroup('defaultWalls', 'Default Walls', 'Default number of walls for new dances', [
      { value: '1', label: '1 Wall' }, { value: '2', label: '2 Wall' }, { value: '4', label: '4 Wall' }
    ], theme);

    html += renderSelect('defaultCounts', 'Default Counts', 'Default total counts per sequence', [
      { value: '16', label: '16 counts' }, { value: '32', label: '32 counts' },
      { value: '48', label: '48 counts' }, { value: '64', label: '64 counts' }
    ], theme);

    html += renderToggle('showStepSuggestions', 'Show Step Suggestions', 'Display suggested steps as you type', theme);

    html += renderSelect('undoHistoryLimit', 'Undo History Limit', 'Maximum number of undo steps stored in memory', [
      { value: '20', label: '20 steps' }, { value: '50', label: '50 steps' },
      { value: '100', label: '100 steps' }, { value: 'unlimited', label: 'Unlimited' }
    ], theme);

    return html;
  }

  function renderPrintSection(theme) {
    var html = '';

    html += renderRadioGroup('paperSize', 'Paper Size', 'Set the default paper size for printing and PDF export', [
      { value: 'letter', label: 'Letter' }, { value: 'a4', label: 'A4' }, { value: 'legal', label: 'Legal' }
    ], theme);

    html += renderRadioGroup('orientation', 'Orientation', 'Set the default page orientation', [
      { value: 'portrait', label: 'Portrait' }, { value: 'landscape', label: 'Landscape' }
    ], theme);

    html += renderToggle('showHeaderOnPrint', 'Show Header on Print', 'Include the dance title header when printing', theme);
    html += renderToggle('showFooterOnPrint', 'Show Footer on Print', 'Include page numbers and footer when printing', theme);
    html += renderToggle('includeChoreographerName', 'Include Choreographer Name', 'Print the choreographer name on the sheet', theme);
    html += renderToggle('includeMusicInfo', 'Include Music Info', 'Print song title, artist, and BPM on the sheet', theme);

    html += renderRadioGroup('printFontSize', 'Print Font Size', 'Set the font size for printed sheets', [
      { value: '10', label: '10pt' }, { value: '12', label: '12pt' }, { value: '14', label: '14pt' }
    ], theme);

    html += renderRadioGroup('pageMargins', 'Page Margins', 'Set the margin size for printed pages', [
      { value: 'narrow', label: 'Narrow' }, { value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }
    ], theme);

    return html;
  }

  function renderNotificationsSection(theme) {
    var html = '';

    html += renderToggle('enableNotifications', 'Enable Notifications', 'Allow the app to show notifications', theme);
    html += renderToggle('soundEffects', 'Sound Effects', 'Play sound effects for UI actions', theme);
    html += renderSlider('volume', 'Volume', 'Adjust the volume of sound effects and notifications', 0, 100, '%', theme);
    html += renderToggle('notifyFriendRequests', 'Notify on Friend Requests', 'Get notified when someone sends you a friend request', theme);
    html += renderToggle('notifyCollabInvites', 'Notify on Collaboration Invites', 'Get notified when invited to collaborate on a dance', theme);
    html += renderToggle('notifyFeaturedDances', 'Notify on Featured Dances', 'Get notified about new featured choreographies', theme);

    return html;
  }

  function renderDataSection(theme) {
    var html = '';

    html += renderToggle('autoSyncToCloud', 'Auto-Sync to Cloud', 'Automatically sync your data to the cloud when signed in', theme);

    html += renderSelect('cloudSyncInterval', 'Cloud Sync Interval', 'How often to sync data with the cloud', [
      { value: '5', label: '5 seconds' }, { value: '15', label: '15 seconds' },
      { value: '30', label: '30 seconds' }, { value: '60', label: '60 seconds' }
    ], theme);

    // Data usage display
    var storageUsed = getLocalStorageSize();
    html += '<div style="padding:12px 0;border-bottom:1px solid ' + theme.border + ';">';
    html += '<div style="font-size:13px;font-weight:600;">Data Usage</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:11px;margin-top:2px;">Current localStorage usage</div>';
    html += '<div style="margin-top:8px;display:flex;align-items:center;gap:10px;">';
    html += '<div style="flex:1;height:8px;border-radius:4px;background:' + (theme.dark ? '#1f2937' : '#e5e7eb') + ';overflow:hidden;">';
    var pct = Math.min(100, (storageUsed / 5242880) * 100);
    html += '<div style="height:100%;border-radius:4px;background:#4f46e5;width:' + pct.toFixed(1) + '%;transition:width .3s ease;"></div>';
    html += '</div>';
    html += '<span style="font-size:12px;font-weight:600;white-space:nowrap;">' + formatBytes(storageUsed) + ' / 5 MB</span>';
    html += '</div></div>';

    // Action buttons
    html += '<div style="padding:12px 0;border-bottom:1px solid ' + theme.border + ';">';
    html += '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">Data Management</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
    html += renderButton('export-data', 'Export All Data', 'download', 'default', theme);
    html += renderButton('import-data', 'Import Data', 'upload', 'default', theme);
    html += '<input type="file" data-settings-import-file accept=".json" style="display:none;">';
    html += '</div></div>';

    html += '<div style="padding:12px 0;border-bottom:1px solid ' + theme.border + ';">';
    html += '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">Danger Zone</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
    html += renderButton('clear-local-data', 'Clear Local Data', 'trash', 'danger', theme);
    html += renderButton('clear-cache', 'Clear Cache', 'refresh', 'danger', theme);
    html += renderButton('delete-account', 'Delete Account', 'warning', 'danger', theme);
    html += '</div></div>';

    return html;
  }

  function renderAccessibilitySection(theme) {
    var html = '';

    html += renderToggle('reduceMotion', 'Reduce Motion', 'Minimize animations and transitions throughout the app', theme);
    html += renderToggle('screenReaderDescriptions', 'Screen Reader Descriptions', 'Add detailed ARIA labels and descriptions for screen readers', theme);
    html += renderToggle('keyboardNavigationMode', 'Keyboard Navigation Mode', 'Enable enhanced keyboard navigation with visible focus outlines', theme);

    html += renderRadioGroup('focusIndicators', 'Focus Indicators', 'Choose the style of focus outlines for keyboard navigation', [
      { value: 'default', label: 'Default' }, { value: 'enhanced', label: 'Enhanced' }, { value: 'high-contrast', label: 'High Contrast' }
    ], theme);

    html += renderRadioGroup('textSpacing', 'Text Spacing', 'Adjust letter and line spacing for readability', [
      { value: 'normal', label: 'Normal' }, { value: 'relaxed', label: 'Relaxed' }, { value: 'extra-relaxed', label: 'Extra Relaxed' }
    ], theme);

    html += renderRadioGroup('cursorSize', 'Cursor Size', 'Choose the size of the text cursor', [
      { value: 'default', label: 'Default' }, { value: 'large', label: 'Large' }
    ], theme);

    html += renderRadioGroup('tabSize', 'Tab Size', 'Adjust the size of navigation tabs', [
      { value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' }, { value: 'large', label: 'Large' }
    ], theme);

    html += renderToggle('dyslexiaFriendlyFont', 'Dyslexia-Friendly Font', 'Use OpenDyslexic or similar font optimized for dyslexic readers', theme);

    return html;
  }

  function renderAdvancedSection(theme) {
    var html = '';

    html += renderToggle('developerMode', 'Developer Mode', 'Show developer-only tools and options in the app', theme);
    html += renderToggle('showPerformanceStats', 'Show Performance Stats', 'Display FPS counter and render times', theme);
    html += renderToggle('enableExperimentalFeatures', 'Enable Experimental Features', 'Turn on features that are still in development', theme);

    html += renderRadioGroup('apiServer', 'API Server', 'Choose which server to connect to', [
      { value: 'default', label: 'Default' }, { value: 'custom', label: 'Custom URL' }
    ], theme);

    // Show custom URL input when 'custom' is selected
    if (getSetting('apiServer') === 'custom' && settingMatchesSearch('apiServer')) {
      html += '<div style="padding:4px 0 12px;border-bottom:1px solid ' + theme.border + ';">';
      html += '<input data-settings-custom-url type="url" placeholder="https://your-api-server.com" value="' + escapeHtml(getSetting('customApiUrl') || '') + '" style="';
      html += 'width:100%;padding:8px 12px;border-radius:8px;border:1px solid;font-size:12px;box-sizing:border-box;' + theme.inputBg + '">';
      html += '</div>';
    }

    html += renderSelect('debugLogLevel', 'Debug Log Level', 'Set the verbosity of debug logging in the console', [
      { value: 'off', label: 'Off' }, { value: 'error', label: 'Error' },
      { value: 'warn', label: 'Warn' }, { value: 'info', label: 'Info' }, { value: 'debug', label: 'Debug' }
    ], theme);

    // Reset button
    html += '<div style="padding:12px 0;">';
    html += '<div style="font-size:13px;font-weight:600;margin-bottom:8px;">Reset</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
    html += renderButton('reset-all-settings', 'Reset All Settings', 'refresh', 'danger', theme);
    html += '</div></div>';

    return html;
  }

  /* ════════════════════════════════════════════════════════════
     SECTION RENDERERS MAP
     ════════════════════════════════════════════════════════════ */
  var sectionRenderers = {
    appearance:    renderAppearanceSection,
    editor:        renderEditorSection,
    print:         renderPrintSection,
    notifications: renderNotificationsSection,
    data:          renderDataSection,
    accessibility: renderAccessibilitySection,
    advanced:      renderAdvancedSection
  };

  /* ════════════════════════════════════════════════════════════
     CONFIRMATION OVERLAY
     ════════════════════════════════════════════════════════════ */
  function renderConfirmOverlay(theme) {
    if (!settingsState.confirmAction) return '';
    var messages = {
      'clearData':      { title: 'Clear Local Data?', body: 'This will remove all saved dances, preferences, and cached data. Your settings will be preserved. This action cannot be undone.', confirm: 'Clear Data', danger: true },
      'deleteAccount':  settingsState.confirmStep === 0
        ? { title: 'Delete Account?', body: 'This will permanently delete your account and all associated data. Are you sure you want to continue?', confirm: 'Yes, Continue', danger: true }
        : { title: 'Are you absolutely sure?', body: 'This is your final confirmation. Your account and all data will be permanently and irreversibly deleted. Type "DELETE" to confirm. (Note: account deletion is not yet implemented — this is a placeholder.)', confirm: 'Delete Forever', danger: true },
      'resetSettings':  { title: 'Reset All Settings?', body: 'This will reset every setting on this page back to its default value. Your saved dances and other data will not be affected.', confirm: 'Reset Settings', danger: true }
    };
    var msg = messages[settingsState.confirmAction];
    if (!msg) return '';

    var html = '';
    html += '<div data-settings-overlay style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);">';
    html += '<div style="width:420px;max-width:90vw;border-radius:20px;border:1px solid;padding:28px;' + theme.cardBg + '">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">';
    html += '<span style="color:#ef4444;">' + icon('warning') + '</span>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0;">' + msg.title + '</h3>';
    html += '</div>';
    html += '<p style="font-size:13px;line-height:1.6;margin:0 0 20px;' + (theme.dark ? 'color:#d1d5db;' : 'color:#4b5563;') + '">' + msg.body + '</p>';
    html += '<div style="display:flex;gap:10px;justify-content:flex-end;">';
    html += '<button data-settings-action="cancel-confirm" style="padding:8px 20px;border-radius:10px;border:1px solid;font-size:13px;font-weight:600;cursor:pointer;' + theme.chipBg + '">Cancel</button>';
    html += '<button data-settings-action="do-confirm" style="padding:8px 20px;border-radius:10px;border:1px solid;font-size:13px;font-weight:600;cursor:pointer;background:#ef4444;border-color:#ef4444;color:#fff;">' + msg.confirm + '</button>';
    html += '</div></div></div>';
    return html;
  }

  /* ════════════════════════════════════════════════════════════
     MAIN RENDER
     ════════════════════════════════════════════════════════════ */
  function renderSettingsPage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) return;
    if (page.hidden || page.style.display === 'none') return;

    var theme = themeClasses();
    var html = '';

    /* Outer shell */
    html += '<div class="rounded-3xl border shadow-sm overflow-hidden ' + theme.shell + '" style="transition:all .3s ease;">';

    /* Header */
    html += '<div class="px-6 py-5 border-b ' + theme.panel + '">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<span style="font-size:28px;">' + icon('settings') + '</span>';
    html += '<div>';
    html += '<h2 style="font-size:20px;font-weight:900;margin:0;">Settings</h2>';
    html += '<p class="' + theme.subtle + '" style="font-size:12px;margin:2px 0 0;">Customize your Step-By-Stepper experience</p>';
    html += '</div></div>';
    // Settings count chip
    var totalSettings = Object.keys(DEFAULTS).length;
    var changedCount = 0;
    for (var ck in DEFAULTS) {
      if (DEFAULTS.hasOwnProperty(ck) && JSON.stringify(getSetting(ck)) !== JSON.stringify(DEFAULTS[ck])) changedCount++;
    }
    html += '<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid;font-size:11px;' + theme.chipBg + '">';
    html += '<span style="text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">' + totalSettings + ' settings';
    if (changedCount > 0) html += ' · ' + changedCount + ' customized';
    html += '</span></div>';
    html += '</div></div>';

    /* Search bar */
    html += '<div class="px-6 py-3 border-b" style="border-color:' + theme.border + ';">';
    html += '<div style="position:relative;">';
    html += '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);' + (theme.dark ? 'color:#6b7280;' : 'color:#9ca3af;') + '">' + icon('search') + '</span>';
    html += '<input data-settings-search type="text" placeholder="Search settings…" value="' + escapeHtml(settingsState.searchQuery) + '" style="';
    html += 'width:100%;padding:10px 12px 10px 36px;border-radius:12px;border:1px solid;font-size:13px;box-sizing:border-box;outline:none;transition:border-color .15s ease;';
    html += theme.inputBg + '">';
    if (settingsState.searchQuery) {
      html += '<button data-settings-action="clear-search" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);border:none;background:none;cursor:pointer;padding:4px;' + (theme.dark ? 'color:#9ca3af;' : 'color:#6b7280;') + '">' + icon('x') + '</button>';
    }
    html += '</div></div>';

    /* Alerts */
    html += '<div class="px-6 pt-4">';
    if (settingsState.error) {
      html += '<div style="border:1px solid;border-radius:14px;padding:12px 16px;margin-bottom:12px;font-size:13px;display:flex;align-items:center;gap:8px;' + theme.dangerBg + '">';
      html += '<span>' + icon('warning') + '</span>';
      html += '<span style="flex:1;">' + escapeHtml(settingsState.error) + '</span>';
      html += '<button data-settings-action="dismiss-error" style="border:none;background:none;cursor:pointer;padding:2px;opacity:.7;">' + icon('x') + '</button>';
      html += '</div>';
    }
    if (settingsState.success) {
      html += '<div style="border:1px solid;border-radius:14px;padding:12px 16px;margin-bottom:12px;font-size:13px;display:flex;align-items:center;gap:8px;' + theme.successBg + '">';
      html += '<span>' + icon('check') + '</span>';
      html += '<span style="flex:1;">' + escapeHtml(settingsState.success) + '</span>';
      html += '<button data-settings-action="dismiss-success" style="border:none;background:none;cursor:pointer;padding:2px;opacity:.7;">' + icon('x') + '</button>';
      html += '</div>';
    }
    html += '</div>';

    /* Sections */
    html += '<div class="px-5 sm:px-6 pb-6">';
    var hasResults = false;
    for (var si = 0; si < SECTIONS.length; si++) {
      var sec = SECTIONS[si];
      if (!matchesSearch(sec.id)) continue;
      hasResults = true;
      var isExpanded = settingsState.expandedSection === sec.id;

      html += '<div style="margin-top:12px;border:1px solid ' + theme.border + ';border-radius:16px;overflow:hidden;transition:all .2s ease;';
      if (isExpanded) html += 'box-shadow:0 4px 16px rgba(79,70,229,.08);';
      html += '">';

      // Section header
      html += '<button data-settings-section="' + sec.id + '" style="';
      html += 'width:100%;display:flex;align-items:center;gap:12px;padding:14px 16px;border:none;cursor:pointer;text-align:left;transition:background .15s ease;';
      html += 'background:' + (theme.dark ? (isExpanded ? '#1f2937' : 'transparent') : (isExpanded ? '#f9fafb' : 'transparent')) + ';';
      html += 'color:inherit;';
      html += '">';
      html += '<span style="width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
      html += isExpanded
        ? 'background:#4f46e5;color:#fff;'
        : 'background:' + (theme.dark ? '#1f2937' : '#f3f4f6') + ';color:' + (theme.dark ? '#a5b4fc' : '#4f46e5') + ';';
      html += '">' + icon(sec.icon) + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-size:14px;font-weight:700;">' + escapeHtml(sec.label) + '</div>';
      html += '<div style="font-size:11px;' + (theme.dark ? 'color:#9ca3af;' : 'color:#6b7280;') + '">' + escapeHtml(sec.desc) + '</div>';
      html += '</div>';
      html += '<span style="flex-shrink:0;transition:transform .2s ease;' + (isExpanded ? 'transform:rotate(180deg);' : '') + '">' + icon('chevronDown') + '</span>';
      html += '</button>';

      // Section content
      if (isExpanded && sectionRenderers[sec.id]) {
        html += '<div style="padding:4px 16px 16px;border-top:1px solid ' + theme.border + ';">';
        html += sectionRenderers[sec.id](theme);
        html += '</div>';
      }

      html += '</div>';
    }

    if (!hasResults && settingsState.searchQuery) {
      html += '<div style="text-align:center;padding:40px 20px;">';
      html += '<div style="font-size:32px;margin-bottom:8px;">🔍</div>';
      html += '<div style="font-size:14px;font-weight:600;">No settings found</div>';
      html += '<div class="' + theme.subtle + '" style="font-size:12px;margin-top:4px;">Try a different search term</div>';
      html += '</div>';
    }

    html += '</div>'; // end sections wrapper
    html += '</div>'; // end outer shell

    /* Confirmation overlay */
    html += renderConfirmOverlay(theme);

    page.innerHTML = html;
    wireEvents(page);
  }

  /* ════════════════════════════════════════════════════════════
     EVENT WIRING
     ════════════════════════════════════════════════════════════ */
  function wireEvents(page) {
    // Search
    var searchInput = page.querySelector('[data-settings-search]');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        settingsState.searchQuery = searchInput.value;
        // Expand all matching sections during search
        if (settingsState.searchQuery) {
          for (var i = 0; i < SECTIONS.length; i++) {
            if (matchesSearch(SECTIONS[i].id)) {
              settingsState.expandedSection = SECTIONS[i].id;
              break;
            }
          }
        }
        renderSettingsPage();
        // Restore focus
        var newInput = document.querySelector('#' + PAGE_ID + ' [data-settings-search]');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        }
      });
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          settingsState.searchQuery = '';
          renderSettingsPage();
        }
      });
    }

    // Section toggle
    page.querySelectorAll('[data-settings-section]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-settings-section');
        settingsState.expandedSection = settingsState.expandedSection === id ? null : id;
        renderSettingsPage();
      });
    });

    // Font picker: category pills
    page.querySelectorAll('[data-font-category]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _fontCategoryFilter = btn.getAttribute('data-font-category');
        renderSettingsPage();
      });
    });

    // Font picker: search
    var fontSearch = page.querySelector('[data-font-search]');
    if (fontSearch) {
      fontSearch.addEventListener('input', function () {
        _fontSearchQuery = fontSearch.value;
        renderSettingsPage();
        var nf = document.querySelector('#' + PAGE_ID + ' [data-font-search]');
        if (nf) { nf.focus(); nf.setSelectionRange(nf.value.length, nf.value.length); }
      });
    }

    // Font picker: card selection
    page.querySelectorAll('[data-font-pick]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fontId = btn.getAttribute('data-font-pick');
        var fontObj = getFontById(fontId);
        if (fontObj.google) loadGoogleFont(fontObj);
        setSetting('fontFamily', fontId);
        renderSettingsPage();
      });
    });

    // Toggle switches
    page.querySelectorAll('[data-settings-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-settings-toggle');
        setSetting(key, !getSetting(key));
        renderSettingsPage();
      });
    });

    // Select dropdowns
    page.querySelectorAll('[data-settings-select]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var key = sel.getAttribute('data-settings-select');
        setSetting(key, sel.value);
        renderSettingsPage();
      });
    });

    // Radio buttons
    page.querySelectorAll('[data-settings-radio]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-settings-radio');
        var val = btn.getAttribute('data-value');
        setSetting(key, val);
        renderSettingsPage();
      });
    });

    // Sliders
    page.querySelectorAll('[data-settings-slider]').forEach(function (slider) {
      slider.addEventListener('input', function () {
        var key = slider.getAttribute('data-settings-slider');
        var val = Number(slider.value);
        var valDisplay = page.querySelector('[data-settings-slider-val="' + key + '"]');
        if (valDisplay) {
          var unit = key === 'volume' ? '%' : 'px';
          valDisplay.textContent = val + unit;
        }
        setSetting(key, val);
        // Font size preview update without full re-render
        if (key === 'fontSize') {
          var preview = page.querySelector('[data-setting-row="fontSize"]');
          if (preview) {
            var previewBox = preview.nextElementSibling;
            if (previewBox) previewBox.style.fontSize = val + 'px';
          }
        }
      });
    });

    // Color picker
    page.querySelectorAll('[data-settings-color]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-settings-color');
        var val = btn.getAttribute('data-value');
        if (String(getSetting(key)) === String(val)) return;
        setSetting(key, val);
        queueSettingsRender();
      });
    });

    // Custom API URL
    var customUrlInput = page.querySelector('[data-settings-custom-url]');
    if (customUrlInput) {
      customUrlInput.addEventListener('input', function () {
        setSetting('customApiUrl', customUrlInput.value);
      });
    }

    // Action buttons
    page.querySelectorAll('[data-settings-action]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var action = btn.getAttribute('data-settings-action');

        switch (action) {
          case 'export-data':
            exportAllData();
            break;
          case 'import-data':
            var fileInput = page.querySelector('[data-settings-import-file]');
            if (fileInput) fileInput.click();
            break;
          case 'clear-local-data':
            settingsState.confirmAction = 'clearData';
            settingsState.confirmStep = 0;
            renderSettingsPage();
            break;
          case 'clear-cache':
            clearCache();
            break;
          case 'delete-account':
            settingsState.confirmAction = 'deleteAccount';
            settingsState.confirmStep = 0;
            renderSettingsPage();
            break;
          case 'reset-all-settings':
            settingsState.confirmAction = 'resetSettings';
            settingsState.confirmStep = 0;
            renderSettingsPage();
            break;
          case 'cancel-confirm':
            settingsState.confirmAction = null;
            settingsState.confirmStep = 0;
            renderSettingsPage();
            break;
          case 'do-confirm':
            if (settingsState.confirmAction === 'clearData') {
              clearLocalData();
            } else if (settingsState.confirmAction === 'deleteAccount') {
              if (settingsState.confirmStep === 0) {
                settingsState.confirmStep = 1;
                renderSettingsPage();
              } else {
                settingsState.confirmAction = null;
                settingsState.confirmStep = 0;
                settingsState.success = 'Account deletion is not yet implemented. Your data is safe.';
                renderSettingsPage();
              }
            } else if (settingsState.confirmAction === 'resetSettings') {
              resetAllSettings();
            }
            break;
          case 'clear-search':
            settingsState.searchQuery = '';
            renderSettingsPage();
            break;
          case 'dismiss-error':
            settingsState.error = null;
            renderSettingsPage();
            break;
          case 'dismiss-success':
            settingsState.success = null;
            renderSettingsPage();
            break;
        }
      });
    });

    // File import input
    var fileInput = page.querySelector('[data-settings-import-file]');
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) {
          importData(fileInput.files[0]);
        }
      });
    }

    // Overlay background click to dismiss
    var overlay = page.querySelector('[data-settings-overlay]');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          settingsState.confirmAction = null;
          settingsState.confirmStep = 0;
          renderSettingsPage();
        }
      });
    }
  }

  /* ════════════════════════════════════════════════════════════
     ENSURE PAGE ELEMENT EXISTS
     ════════════════════════════════════════════════════════════ */
  function ensurePage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) {
      var host = document.querySelector('#stepper-google-admin-host .space-y-5');
      if (!host) return null;
      page = document.createElement('section');
      page.id = PAGE_ID;
      page.hidden = true;
      page.style.display = 'none';
      host.appendChild(page);
    }
    return page;
  }

  /* ════════════════════════════════════════════════════════════
     STYLE INJECTION
     ════════════════════════════════════════════════════════════ */
  function ensureSettingsStyles() {
    if (document.getElementById('stepper-settings-tab-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-settings-tab-style';
    style.textContent = [
      '#' + PAGE_ID + ' input:focus { border-color: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 50%, transparent) !important; box-shadow: 0 0 0 3px var(--stepper-accent-ring, rgba(79,70,229,.12)) !important; }',
      '#' + PAGE_ID + ' select:focus { border-color: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 50%, transparent) !important; box-shadow: 0 0 0 3px var(--stepper-accent-ring, rgba(79,70,229,.12)) !important; outline:none; }',
      '#' + PAGE_ID + ' [data-settings-section]:hover { background: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 4%, transparent) !important; }',
      '#' + PAGE_ID + ' [data-settings-toggle]:hover { opacity:.9;transform:scale(1.04); }',
      '#' + PAGE_ID + ' [data-settings-action]:hover { opacity:.85;transform:scale(1.02); }',
      '#' + PAGE_ID + ' [data-settings-radio]:hover { opacity:.85;transform:scale(1.04); }',
      '#' + PAGE_ID + ' [data-settings-color]:hover { transform:scale(1.2)!important; }',
      '#' + PAGE_ID + ' [data-setting-row] { transition:background .15s ease; }',
      '#' + PAGE_ID + ' [data-setting-row]:hover { background: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 3%, transparent); }',
      'body, #root, #root main, #root main *, #stepper-google-admin-host, #stepper-google-admin-host *, #stepper-extra-page-host, #stepper-extra-page-host *, #stepper-editor-inline-host, #stepper-editor-inline-host *, #stepper-docstyle-menubar, #stepper-docstyle-menubar * { font-family: var(--stepper-font-family, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif) !important; }',
      'body, #root, #stepper-google-admin-host, #stepper-extra-page-host { font-size: var(--stepper-font-size, 14px); }',
      ':root { --shn-accent: var(--stepper-accent-color, #4f46e5); --shn-accent-glow: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 35%, transparent); }',
      '.stepper-settings-accent, [data-stepper-theme-accent="true"] { color: var(--stepper-accent-color, #4f46e5) !important; }',
      '.stepper-menu-trigger:hover, .stepper-menu-trigger--open { background: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 14%, transparent) !important; color: var(--stepper-accent-color, #4f46e5) !important; }',
      '#stepper-docstyle-menubar .stepper-menu-dropdown button:hover { background: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 14%, transparent) !important; }',
      '.bg-indigo-600, .bg-indigo-500 { background-color: var(--stepper-accent-color, #4f46e5) !important; }',
      '.hover\\:bg-indigo-700:hover, .hover\\:bg-indigo-500:hover { background-color: var(--stepper-accent-hover, color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 88%, black)) !important; }',
      '.text-indigo-600, .text-indigo-500, .text-indigo-700, .text-indigo-800, .dark\\:text-indigo-400, .dark\\:text-indigo-300, .text-indigo-300 { color: var(--stepper-accent-color, #4f46e5) !important; }',
      '.border-indigo-600, .border-indigo-500, .border-indigo-200, .border-indigo-100, .hover\\:border-indigo-500:hover { border-color: var(--stepper-accent-color, #4f46e5) !important; }',
      '.bg-indigo-100, .hover\\:bg-indigo-100:hover, .hover\\:bg-indigo-50:hover, .bg-indigo-50\\/50 { background-color: var(--stepper-accent-soft, color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 12%, white)) !important; }',
      '.bg-indigo-200 { background-color: var(--stepper-accent-soft-strong, color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 18%, white)) !important; }',
      '.bg-indigo-500\\/10, .bg-indigo-500\\/15, .border-indigo-500\\/30, .bg-indigo-900\\/10, .dark\\:hover\\:bg-indigo-900\\/30:hover, .dark\\:hover\\:bg-indigo-900\\/50:hover, .bg-indigo-900\\/40, .dark\\:bg-indigo-900\\/40 { background-color: var(--stepper-accent-dark-soft, color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 22%, transparent)) !important; border-color: var(--stepper-accent-color, #4f46e5) !important; }',
      '.focus\\:ring-indigo-500:focus { --tw-ring-color: var(--stepper-accent-color, #4f46e5) !important; }',
      '.accent-indigo-600 { accent-color: var(--stepper-accent-color, #4f46e5) !important; }',
      '.stepper-reduce-motion * { animation-duration:0s!important;transition-duration:0s!important; }',
      '.stepper-high-contrast { filter:contrast(1.25); }',
      '.stepper-dyslexia-font, .stepper-dyslexia-font * { font-family:OpenDyslexic,sans-serif!important; }',
      '[data-stepper-text-spacing="relaxed"] body, [data-stepper-text-spacing="relaxed"] #root { letter-spacing:.015em; line-height:1.7; }',
      '[data-stepper-text-spacing="wide"] body, [data-stepper-text-spacing="wide"] #root { letter-spacing:.04em; line-height:1.9; }',
      '[data-stepper-tab-size="large"] #root, [data-stepper-tab-size="large"] #stepper-google-admin-host { tab-size:8; }',
      '@media print { #' + PAGE_ID + ' { display:none!important; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  applyAllLiveSettings(settingsState.settings);
  window.addEventListener('storage', function (event) {
    if (!event || (event.key !== LS_KEY && event.key !== BUILDER_DATA_KEY)) return;
    settingsState.settings = loadSettings();
    applyAllLiveSettings(settingsState.settings);
  });
  window.addEventListener('stepper-theme-updated', function () {
    settingsState.settings = loadSettings();
    applyAppearanceLiveSettings(settingsState.settings);
  });

  /* ════════════════════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════════════════════ */
  window.__stepperSettingsTab = {
    PAGE_ID: PAGE_ID,
    TAB_ID: TAB_ID,
    render: function () {
      ensurePage();
      ensureSettingsStyles();
      renderSettingsPage();
    },
    open: function () {
      window.dispatchEvent(new CustomEvent('stepper-open-settings'));
    },
    getState: function () { return settingsState; },
    getSetting: getSetting,
    setSetting: function (key, value) {
      setSetting(key, value);
      renderSettingsPage();
    },
    icon: function () {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
    }
  };

})();
