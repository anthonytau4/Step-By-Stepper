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
    /* ── Light surfaces → warm paper ─────────────────────────── */
    '.bg-white { background-color: #faf3e1 !important; }',
    '.bg-neutral-50 { background-color: #f7eed8 !important; }',
    '.bg-neutral-100 { background-color: #f1e5c8 !important; }',
    '.bg-neutral-200 { background-color: #e7d7b2 !important; }',
    '.bg-neutral-300 { background-color: #d9c493 !important; }',
    '.hover\\:bg-neutral-100:hover { background-color: #eee0bf !important; }',
    '.hover\\:bg-neutral-200:hover { background-color: #e2d1a6 !important; }',
    '.hover\\:bg-neutral-300:hover { background-color: #d2bc87 !important; }',
    '.border-neutral-200 { border-color: #ddca9f !important; }',
    '.border-neutral-300 { border-color: #cbb27f !important; }',

    /* ── Dark surfaces → aged leather ────────────────────────── */
    /* Let the app shell show the textured parchment on <body> instead
       of painting a flat panel over it. */
    '#root > .min-h-screen { background-color: transparent !important; }',
    '.bg-black { background-color: #17100a !important; }',
    '.bg-neutral-700 { background-color: #4a3a25 !important; }',
    '.bg-neutral-800 { background-color: #372a19 !important; }',
    '.bg-neutral-900 { background-color: #2b2013 !important; }',
    '.bg-neutral-950 { background-color: #1f160c !important; }',
    '.hover\\:bg-neutral-700:hover { background-color: #564630 !important; }',
    '.hover\\:bg-neutral-800:hover { background-color: #413221 !important; }',
    '.border-neutral-700 { border-color: #503f28 !important; }',
    '.border-neutral-800 { border-color: #3c2e1c !important; }',
    '.border-neutral-900 { border-color: #2f2414 !important; }',
    'html.dark .dark\\:bg-neutral-700 { background-color: #4a3a25 !important; }',
    'html.dark .dark\\:bg-neutral-800 { background-color: #372a19 !important; }',
    'html.dark .dark\\:bg-neutral-900 { background-color: #2b2013 !important; }',

    /* ── File/Edit menubar ───────────────────────────────────── */
    '#stepper-docstyle-menubar { background: #f7eed8 !important; border-bottom-color: #d8c194 !important; }',
    /* Menubar/dropdown text colours are set inline at render time, which can
       happen before the dark class lands — force readable ink both ways. */
    'html:not(.dark) #stepper-docstyle-menubar { color: #3b2f1b !important; }',
    'html.dark #stepper-docstyle-menubar { background: #2b2013 !important; border-bottom-color: #3c2e1c !important; color: #e7d9b6 !important; }',
    '.stepper-menu-dropdown { background: #fbf4e3 !important; border-color: #cbb27f !important; }',
    'html:not(.dark) .stepper-menu-dropdown { color: #3b2f1b !important; }',
    'html.dark .stepper-menu-dropdown { background: #2b2013 !important; border-color: #503f28 !important; color: #e7d9b6 !important; }',

    /* ── FORMAT toolbar ──────────────────────────────────────── */
    '#stepper-docstyle-toolbar { background: #f7eed8 !important; border-bottom-color: #d8c194 !important; }',
    'html:not(.dark) #stepper-docstyle-toolbar { color: #3b2f1b !important; }',
    'html.dark #stepper-docstyle-toolbar { background: #241b11 !important; border-bottom-color: #3c2e1c !important; color: #d8c9a6 !important; }',
    '.stepper-docstyle-tool-btn { background: #fbf4e3 !important; border-color: #cbb27f !important; }',
    'html:not(.dark) .stepper-docstyle-tool-btn { color: #3b2f1b !important; }',
    'html.dark .stepper-docstyle-tool-btn { background: #372a19 !important; border-color: #503f28 !important; color: #ead9b4 !important; }',

    /* ── Status bar ──────────────────────────────────────────── */
    '.stepper-status-bar { background: rgba(247,238,216,.9) !important; border-color: #d8c194 !important; }',
    'html.dark .stepper-status-bar { background: rgba(43,32,19,.9) !important; border-color: #3c2e1c !important; }',

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
