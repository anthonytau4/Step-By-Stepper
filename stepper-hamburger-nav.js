/* ═══════════════════════════════════════════════════════════════════════════
   stepper-hamburger-nav.js  –  Hamburger navigation overlay
   ═══════════════════════════════════════════════════════════════════════════
   Replaces the visible tab strip with a fixed hamburger (☰) button in the
   top-right corner.  Clicking it opens a dropdown that lists every available
   page / tab.  Each item programmatically clicks the original tab button so
   routing, state, and analytics all work exactly as before — no page reload.

   Pattern: IIFE with install-guard, CSS-in-JS, MutationObserver for re-inject.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__stepperHamburgerNavInstalled) return;
  window.__stepperHamburgerNavInstalled = true;

  /* ── Constants ──────────────────────────────────────────────────────── */
  var HAMBURGER_ID    = 'stepper-hamburger-btn';
  var DROPDOWN_ID     = 'stepper-hamburger-dropdown';
  var STYLE_ID        = 'stepper-hamburger-nav-style';
  var TABSTRIP_HIDE   = 'stepper-hamburger-tabstrip-hide';
  var BUILDER_KEY     = 'linedance_builder_data_v13';
  var _ic             = window.__stepperIcons || {};

  /* ── Helpers ────────────────────────────────────────────────────────── */

  /** Read dark-mode flag from the builder localStorage blob. */
  function isDarkMode() {
    try {
      var data = JSON.parse(localStorage.getItem(BUILDER_KEY) || 'null');
      return !!(data && data.isDarkMode);
    } catch (e) { return false; }
  }

  /** Find a <button> by its visible text content. */
  function buttonByText(text) {
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].textContent || '').trim() === text) return btns[i];
    }
    return null;
  }

  /** Safely click a DOM element. */
  function safeClick(el) {
    if (el && typeof el.click === 'function') el.click();
  }

  /* ── Menu definition ────────────────────────────────────────────────── */
  /* Each entry: { key, label, icon (inline SVG string), action, condition }
     condition() → true/false controls visibility (omitted = always show).
     action()   → fires when the item is selected. */

  /* Reusable mini-SVG builder (24×24 viewBox, stroke-based). */
  function svg(paths) {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" style="flex-shrink:0;">' + paths + '</svg>';
  }

  function getMenuItems() {
    return [
      {
        key: 'editor',
        label: 'Build',
        icon: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
        action: function () { safeClick(buttonByText('Build')); }
      },
      {
        key: 'preview',
        label: 'Sheet',
        icon: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>'),
        action: function () { safeClick(buttonByText('Sheet')); }
      },
      {
        key: 'whatsnew',
        label: "What's New",
        icon: svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
        action: function () { safeClick(buttonByText("What's New")); }
      },
      {
        key: 'saveddances',
        label: 'My Saved Dances',
        icon: svg('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'),
        action: function () {
          safeClick(document.getElementById('stepper-saved-dances-tab') || buttonByText('My Saved Dances'));
        }
      },
      {
        key: 'featured',
        label: 'Featured Choreo',
        icon: svg('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>'),
        action: function () {
          safeClick(document.getElementById('stepper-featured-choreo-tab') || buttonByText('Featured Choreo'));
        }
      },
      {
        key: 'glossary',
        label: 'Glossary',
        icon: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
        action: function () { safeClick(document.getElementById('stepper-glossary-tab')); }
      },
      {
        key: 'pdfimport',
        label: 'PDF Import',
        icon: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
        action: function () { safeClick(document.getElementById('stepper-pdf-tab')); }
      },
      {
        key: 'friends',
        label: 'Friends',
        icon: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
        action: function () { safeClick(document.getElementById('stepper-friends-tab')); }
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z"/>'),
        action: function () {
          if (window.__stepperSettingsTab && typeof window.__stepperSettingsTab.open === 'function') {
            window.__stepperSettingsTab.open();
          } else {
            window.dispatchEvent(new CustomEvent('stepper-open-settings'));
          }
        }
      },
      {
        key: 'signin',
        label: 'Sign In',
        icon: svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>'),
        action: function () { safeClick(document.getElementById('stepper-google-signin-tab')); }
      },
      {
        key: 'subscription',
        label: 'Subscription',
        icon: svg('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),
        condition: function () {
          /* Only show if user is signed in */
          try {
            var sess = JSON.parse(localStorage.getItem('stepper_google_auth_session_v2') || 'null');
            return !!(sess && sess.email);
          } catch (e) { return false; }
        },
        action: function () { safeClick(document.getElementById('stepper-google-subscription-tab')); }
      },
      {
        key: 'admin',
        label: 'Admin',
        icon: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
        condition: function () {
          return !!window.__stepperGoogleAdminInstalled;
        },
        action: function () { safeClick(document.getElementById('stepper-google-admin-tab')); }
      }
    ];
  }

  /* ── Active-tab detection ───────────────────────────────────────────── */
  var _lastSelected = '';

  function detectActiveTab() {
    /* 1. data-stepper-route on <html> (set by stepper-route-paths.js) */
    var route = (document.documentElement.getAttribute('data-stepper-route') || '').toLowerCase();
    if (route) { _lastSelected = route; return route; }

    /* 2. Fallback: check which page container is visible */
    var pageMap = {
      glossary:   'stepper-glossary-page',
      friends:    'stepper-friends-page',
      pdfimport:  'stepper-pdf-page'
    };
    for (var key in pageMap) {
      var el = document.getElementById(pageMap[key]);
      if (el && el.offsetParent !== null) { _lastSelected = key; return key; }
    }

    return _lastSelected || 'editor';
  }

  /* ── Style injection ────────────────────────────────────────────────── */

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      /* ── Hamburger button ── */
      '#' + HAMBURGER_ID + ' {',
      '  position: fixed; top: 4px; right: 12px; z-index: 9999;',
      '  width: 38px; height: 38px; border: none; border-radius: 8px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  cursor: pointer; font-size: 22px; line-height: 1;',
      '  transition: background .15s, transform .15s;',
      '  -webkit-tap-highlight-color: transparent;',
      '}',
      '#' + HAMBURGER_ID + ':hover { transform: scale(1.08); }',
      '#' + HAMBURGER_ID + ':active { transform: scale(0.95); }',

      /* ── Light mode ── */
      'html:not(.dark) #' + HAMBURGER_ID + ' {',
      '  background: rgba(255,255,255,0.85); color: #374151;',
      '  box-shadow: 0 1px 4px rgba(0,0,0,0.10);',
      '}',
      'html:not(.dark) #' + HAMBURGER_ID + ':hover { background: rgba(99,102,241,0.10); color: #4f46e5; }',

      /* ── Dark mode ── */
      'html.dark #' + HAMBURGER_ID + ' {',
      '  background: rgba(55,55,55,0.90); color: #d1d5db;',
      '  box-shadow: 0 1px 6px rgba(0,0,0,0.30);',
      '}',
      'html.dark #' + HAMBURGER_ID + ':hover { background: rgba(99,102,241,0.18); color: #a5b4fc; }',

      /* ── Backdrop (click-outside catcher) ── */
      '#stepper-hamburger-backdrop {',
      '  position: fixed; inset: 0; z-index: 9998; background: transparent;',
      '}',

      /* ── Dropdown panel ── */
      '#' + DROPDOWN_ID + ' {',
      '  position: fixed; top: 46px; right: 12px; z-index: 9999;',
      '  min-width: 220px; max-width: 280px; border-radius: 12px;',
      '  padding: 6px 0; overflow: hidden;',
      '  animation: stepper-ham-drop .15s ease;',
      '}',
      '@keyframes stepper-ham-drop {',
      '  from { opacity: 0; transform: translateY(-6px) scale(0.97); }',
      '  to   { opacity: 1; transform: translateY(0) scale(1); }',
      '}',

      /* Light dropdown */
      'html:not(.dark) #' + DROPDOWN_ID + ' {',
      '  background: #fff; color: #1f2937;',
      '  box-shadow: 0 8px 30px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.08);',
      '  border: 1px solid rgba(0,0,0,0.06);',
      '}',

      /* Dark dropdown */
      'html.dark #' + DROPDOWN_ID + ' {',
      '  background: #2a2a2a; color: #e5e5e5;',
      '  box-shadow: 0 8px 30px rgba(0,0,0,0.40), 0 1px 3px rgba(0,0,0,0.20);',
      '  border: 1px solid rgba(255,255,255,0.08);',
      '}',

      /* ── Menu items ── */
      '.stepper-ham-item {',
      '  display: flex; align-items: center; gap: 10px;',
      '  padding: 9px 16px; cursor: pointer; font-size: 14px;',
      '  font-weight: 500; transition: background .12s;',
      '  border: none; background: none; width: 100%; text-align: left;',
      '  color: inherit; font-family: inherit; line-height: 1.3;',
      '}',
      'html:not(.dark) .stepper-ham-item:hover { background: rgba(99,102,241,0.08); }',
      'html.dark .stepper-ham-item:hover { background: rgba(99,102,241,0.14); }',

      /* Active indicator */
      '.stepper-ham-item--active {',
      '  font-weight: 700;',
      '}',
      'html:not(.dark) .stepper-ham-item--active {',
      '  background: rgba(99,102,241,0.08); color: #4f46e5;',
      '}',
      'html.dark .stepper-ham-item--active {',
      '  background: rgba(99,102,241,0.14); color: #a5b4fc;',
      '}',
      '.stepper-ham-item--active::before {',
      '  content: ""; display: block; width: 3px; height: 18px;',
      '  border-radius: 2px; background: #6366f1; flex-shrink: 0;',
      '  margin-right: -4px;',
      '}',

      /* Separator */
      '.stepper-ham-sep {',
      '  height: 1px; margin: 4px 12px;',
      '}',
      'html:not(.dark) .stepper-ham-sep { background: rgba(0,0,0,0.07); }',
      'html.dark .stepper-ham-sep { background: rgba(255,255,255,0.08); }'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ── Tab-strip hiding ───────────────────────────────────────────────── */

  function hideTabStrip() {
    if (document.getElementById(TABSTRIP_HIDE)) return;
    var buildBtn = buttonByText('Build');
    if (!buildBtn) return;
    var parent = buildBtn.parentElement;
    if (!parent) return;

    /* Tag the parent so our CSS selector can target it */
    parent.setAttribute('data-stepper-tabstrip', 'true');

    var s = document.createElement('style');
    s.id = TABSTRIP_HIDE;
    s.textContent = [
      '/* Hide the tab strip visually but keep buttons in DOM */',
      '[data-stepper-tabstrip="true"] {',
      '  position: absolute !important;',
      '  width: 1px !important; height: 1px !important;',
      '  overflow: hidden !important; clip: rect(0,0,0,0) !important;',
      '  white-space: nowrap !important; border: 0 !important;',
      '  padding: 0 !important; margin: -1px !important;',
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ── Dropdown open / close ──────────────────────────────────────────── */
  var _open = false;

  function closeDropdown() {
    var dd = document.getElementById(DROPDOWN_ID);
    var bd = document.getElementById('stepper-hamburger-backdrop');
    if (dd) dd.remove();
    if (bd) bd.remove();
    _open = false;
    /* Remove open styling from hamburger */
    var btn = document.getElementById(HAMBURGER_ID);
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function openDropdown() {
    if (_open) { closeDropdown(); return; }
    _open = true;

    var btn = document.getElementById(HAMBURGER_ID);
    if (btn) btn.setAttribute('aria-expanded', 'true');

    /* Backdrop */
    var bd = document.createElement('div');
    bd.id = 'stepper-hamburger-backdrop';
    bd.addEventListener('click', closeDropdown);
    document.body.appendChild(bd);

    /* Dropdown */
    var dd = document.createElement('div');
    dd.id = DROPDOWN_ID;
    dd.setAttribute('role', 'menu');

    var items = getMenuItems();
    var active = detectActiveTab();

    /* Groups: main nav items, then a separator, then account items */
    var mainKeys  = ['editor', 'preview', 'whatsnew', 'saveddances', 'featured',
                     'glossary', 'pdfimport', 'friends'];
    var acctKeys  = ['settings', 'signin', 'subscription', 'admin'];

    function renderItem(item) {
      if (item.condition && !item.condition()) return;

      var row = document.createElement('button');
      row.className = 'stepper-ham-item' + (item.key === active ? ' stepper-ham-item--active' : '');
      row.setAttribute('role', 'menuitem');
      row.setAttribute('data-key', item.key);
      row.innerHTML = item.icon + '<span>' + item.label + '</span>';
      row.addEventListener('click', function () {
        closeDropdown();
        _lastSelected = item.key;
        item.action();
      });
      dd.appendChild(row);
    }

    for (var m = 0; m < mainKeys.length; m++) {
      for (var j = 0; j < items.length; j++) {
        if (items[j].key === mainKeys[m]) { renderItem(items[j]); break; }
      }
    }

    /* Separator */
    var sep = document.createElement('div');
    sep.className = 'stepper-ham-sep';
    sep.setAttribute('role', 'separator');
    dd.appendChild(sep);

    for (var a = 0; a < acctKeys.length; a++) {
      for (var k = 0; k < items.length; k++) {
        if (items[k].key === acctKeys[a]) { renderItem(items[k]); break; }
      }
    }

    document.body.appendChild(dd);
  }

  /* ── Keyboard handling ──────────────────────────────────────────────── */

  function onKeyDown(e) {
    if (e.key === 'Escape' && _open) {
      closeDropdown();
      var btn = document.getElementById(HAMBURGER_ID);
      if (btn) btn.focus();
    }
  }

  /* ── Render hamburger button ────────────────────────────────────────── */

  function renderHamburger() {
    if (document.getElementById(HAMBURGER_ID)) return;
    var btn = document.createElement('button');
    btn.id = HAMBURGER_ID;
    btn.setAttribute('aria-label', 'Navigation menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('title', 'Navigation menu');
    /* Three-line hamburger icon via inline SVG for crispness */
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" ' +
      'stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
      '<line x1="3" y1="6" x2="21" y2="6"/>' +
      '<line x1="3" y1="12" x2="21" y2="12"/>' +
      '<line x1="3" y1="18" x2="21" y2="18"/>' +
      '</svg>';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openDropdown();
    });
    document.body.appendChild(btn);
  }

  /* ── Boot ────────────────────────────────────────────────────────────── */

  function boot() {
    injectStyles();
    renderHamburger();
    hideTabStrip();
    document.addEventListener('keydown', onKeyDown);

    /* Re-inject if hamburger or tab-strip-hide gets removed */
    var observer = new MutationObserver(function () {
      if (!document.getElementById(HAMBURGER_ID)) {
        renderHamburger();
      }
      if (!document.getElementById(TABSTRIP_HIDE)) {
        hideTabStrip();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    /* Re-render on theme change so the dark class toggles take effect */
    window.addEventListener('storage', function () {
      /* Styles use html.dark selectors so they adapt automatically;
         but we need to re-hide tab strip in case it was re-created. */
      if (!document.getElementById(TABSTRIP_HIDE)) {
        hideTabStrip();
      }
    });
  }

  /* Wait for DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ── Public API ──────────────────────────────────────────────────────── */
  window.__stepperHamburgerNav = {
    open:  openDropdown,
    close: closeDropdown,
    isOpen: function () { return _open; }
  };
})();
