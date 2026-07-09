/**
 * stepper-parchment-theme.js
 * ──────────────────────────
 * Warms the whole UI so it works with the parchment-scroll background:
 *
 *  - Remaps the app's neutral Tailwind surfaces (bg-white / bg-neutral-*)
 *    to warm paper tones in light mode and aged-leather tones in dark
 *    mode. The app swaps class names when the theme changes, so the
 *    remaps can be unconditional.
 *  - Reskins the injected chrome that paints its own colours: the
 *    File/Edit menubar, the FORMAT toolbar, menu dropdowns, the status
 *    bar, and the hamburger button.
 *
 * Everything is !important on purpose: several of these surfaces are set
 * via inline styles (element.style.cssText) or stylesheets that are
 * re-injected after this one, and !important is the only reliable way to
 * win against both.
 */
(function () {
  if (window.__stepperParchmentThemeInstalled) return;
  window.__stepperParchmentThemeInstalled = true;

  /* ── Keep html.dark in sync with the app's saved theme ──────
     The React app only flips isDarkMode in localStorage and swaps its own
     class names; nothing reliably maintains the `dark` class on <html>
     that the base CSS, theme-color meta, hamburger nav, and the overrides
     below all key off. Mirror the setting onto <html> here. */
  var STORAGE_KEY = 'linedance_builder_data_v13';
  function readIsDark() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return !!(data && data.isDarkMode);
    } catch (e) { return false; }
  }
  function syncDarkClass() {
    var dark = readIsDark();
    var el = document.documentElement;
    if (el.classList.contains('dark') !== dark) el.classList.toggle('dark', dark);
  }
  syncDarkClass();
  window.addEventListener('storage', syncDarkClass);
  window.setInterval(syncDarkClass, 1000);

  var css = [
    /* ── Light surfaces → translucent paper ─────────────────────
       Semi-transparent so the parchment grain and mottling shine
       through the panels instead of them sitting on the page as
       opaque boxes. */
    '.bg-white { background-color: rgba(252,246,229,.62) !important; }',
    '.bg-neutral-50 { background-color: rgba(247,238,216,.55) !important; }',
    '.bg-neutral-100 { background-color: rgba(240,228,197,.6) !important; }',
    '.bg-neutral-200 { background-color: rgba(231,215,178,.65) !important; }',
    '.bg-neutral-300 { background-color: rgba(217,196,147,.68) !important; }',
    '.hover\\:bg-neutral-100:hover { background-color: rgba(238,224,191,.8) !important; }',
    '.hover\\:bg-neutral-200:hover { background-color: rgba(226,209,166,.82) !important; }',
    '.hover\\:bg-neutral-300:hover { background-color: rgba(210,188,135,.82) !important; }',
    '.border-neutral-200 { border-color: rgba(203,178,127,.55) !important; }',
    '.border-neutral-300 { border-color: rgba(183,153,96,.6) !important; }',
    /* The sticky app header already has backdrop-blur; give it frosted
       parchment instead of translucent white. */
    '#root header.sticky { background-color: rgba(247,238,216,.65) !important; }',
    'html.dark #root header.sticky { background-color: rgba(36,27,17,.7) !important; }',
    /* Soften the floating-box shadows into faint warm ink so panels
       feel printed on the scroll rather than hovering over it. */
    '.shadow-sm { box-shadow: 0 1px 2px rgba(87,55,20,.10) !important; }',
    '.shadow-md { box-shadow: 0 3px 8px rgba(87,55,20,.10) !important; }',
    '.shadow-lg { box-shadow: 0 6px 16px rgba(87,55,20,.12) !important; }',
    '.shadow-2xl { box-shadow: 0 14px 30px rgba(87,55,20,.16) !important; }',

    /* ── Dark surfaces → translucent aged leather ────────────── */
    /* Let the app shell show the textured parchment on <body> instead
       of painting a flat panel over it. */
    '#root > .min-h-screen { background-color: transparent !important; }',
    '.bg-black { background-color: rgba(23,16,10,.72) !important; }',
    '.bg-neutral-700 { background-color: rgba(74,58,37,.62) !important; }',
    '.bg-neutral-800 { background-color: rgba(55,42,25,.6) !important; }',
    '.bg-neutral-900 { background-color: rgba(43,32,19,.62) !important; }',
    '.bg-neutral-950 { background-color: rgba(31,22,12,.66) !important; }',
    '.hover\\:bg-neutral-700:hover { background-color: rgba(86,70,48,.78) !important; }',
    '.hover\\:bg-neutral-800:hover { background-color: rgba(65,50,33,.78) !important; }',
    '.border-neutral-700 { border-color: rgba(80,63,40,.7) !important; }',
    '.border-neutral-800 { border-color: rgba(60,46,28,.7) !important; }',
    '.border-neutral-900 { border-color: rgba(47,36,20,.7) !important; }',
    'html.dark .dark\\:bg-neutral-700 { background-color: rgba(74,58,37,.62) !important; }',
    'html.dark .dark\\:bg-neutral-800 { background-color: rgba(55,42,25,.6) !important; }',
    'html.dark .dark\\:bg-neutral-900 { background-color: rgba(43,32,19,.62) !important; }',

    /* ── File/Edit menubar ───────────────────────────────────── */
    '#stepper-docstyle-menubar { background: rgba(247,238,216,.8) !important; border-bottom-color: rgba(216,193,148,.7) !important; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }',
    /* Menubar/dropdown text colours are set inline at render time, which can
       happen before the dark class lands — force readable ink both ways. */
    'html:not(.dark) #stepper-docstyle-menubar { color: #3b2f1b !important; }',
    'html.dark #stepper-docstyle-menubar { background: rgba(43,32,19,.8) !important; border-bottom-color: rgba(60,46,28,.8) !important; color: #e7d9b6 !important; }',
    '.stepper-menu-dropdown { background: #fbf4e3 !important; border-color: #cbb27f !important; }',
    'html:not(.dark) .stepper-menu-dropdown { color: #3b2f1b !important; }',
    'html.dark .stepper-menu-dropdown { background: #2b2013 !important; border-color: #503f28 !important; color: #e7d9b6 !important; }',

    /* ── FORMAT toolbar ──────────────────────────────────────── */
    '#stepper-docstyle-toolbar { background: rgba(247,238,216,.75) !important; border-bottom-color: rgba(216,193,148,.7) !important; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }',
    'html:not(.dark) #stepper-docstyle-toolbar { color: #3b2f1b !important; }',
    'html.dark #stepper-docstyle-toolbar { background: rgba(36,27,17,.78) !important; border-bottom-color: rgba(60,46,28,.8) !important; color: #d8c9a6 !important; }',
    '.stepper-docstyle-tool-btn { background: rgba(251,244,227,.65) !important; border-color: rgba(203,178,127,.6) !important; }',
    'html:not(.dark) .stepper-docstyle-tool-btn { color: #3b2f1b !important; }',
    'html.dark .stepper-docstyle-tool-btn { background: rgba(55,42,25,.65) !important; border-color: rgba(80,63,40,.7) !important; color: #ead9b4 !important; }',

    /* ── Status bar ──────────────────────────────────────────── */
    '.stepper-status-bar { background: rgba(247,238,216,.72) !important; border-color: rgba(216,193,148,.7) !important; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }',
    'html.dark .stepper-status-bar { background: rgba(43,32,19,.75) !important; border-color: rgba(60,46,28,.8) !important; }',

    /* ── Hamburger button ────────────────────────────────────── */
    'html:not(.dark) #stepper-hamburger-btn { background: rgba(250,243,225,.78) !important; }',
    'html:not(.dark) #stepper-hamburger-btn:hover { background: rgba(250,243,225,.94) !important; }',
    'html.dark #stepper-hamburger-btn { background: rgba(43,32,19,.78) !important; }',
    'html.dark #stepper-hamburger-btn:hover { background: rgba(54,41,25,.92) !important; }'
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'stepper-parchment-theme-style';
  style.textContent = css;
  document.head.appendChild(style);
})();
