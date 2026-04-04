/* ═══════════════════════════════════════════════════════════════════════════
   stepper-hamburger-nav.js  –  Premium slide-out navigation drawer
   ═══════════════════════════════════════════════════════════════════════════
   Replaces the visible tab strip with a fixed hamburger button (top-right)
   that opens a glassmorphism slide-out drawer.  Each menu item
   programmatically clicks the original tab button so routing, state, and
   analytics all work exactly as before — no page reload.

   Features: animated hamburger→X morph, frosted glass drawer, search bar,
   sectioned menu with icons/badges, recently-visited pills, staggered
   entrance animations, keyboard navigation with focus trap, ripple effect,
   quick-action footer, full dark/light mode support, reduced-motion support.

   Pattern: IIFE with install-guard, CSS-in-JS, MutationObserver for re-inject.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__stepperHamburgerNavInstalled) return;
  window.__stepperHamburgerNavInstalled = true;

  /* ── Constants ──────────────────────────────────────────────────────── */
  var HAMBURGER_ID  = 'stepper-hamburger-btn';
  var DRAWER_ID     = 'stepper-hamburger-drawer';
  var BACKDROP_ID   = 'stepper-hamburger-backdrop';
  var STYLE_ID      = 'stepper-hamburger-nav-style';
  var TABSTRIP_HIDE = 'stepper-hamburger-tabstrip-hide';
  var BUILDER_KEY   = 'linedance_builder_data_v13';
  var SESSION_KEY   = 'stepper_google_auth_session_v2';
  var RECENT_KEY    = 'stepper_nav_recent';

  /* ── Helpers ────────────────────────────────────────────────────────── */

  function buttonByText(text) {
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      if ((btns[i].textContent || '').trim() === text) return btns[i];
    }
    return null;
  }

  function safeClick(el) {
    if (!el) return false;
    try {
      if (typeof PointerEvent === 'function') {
        el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'touch' }));
        el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, pointerType: 'touch' }));
      }
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    } catch (e) { /* ignore */ }
    if (typeof el.click === 'function') el.click();
    return true;
  }

  function safeClickWithRetry(resolveFn, tries, delayMs) {
    var maxTries = Math.max(1, Number(tries || 24));
    var wait = Math.max(40, Number(delayMs || 180));
    var attempt = 0;
    function run() {
      attempt++;
      var ok = false;
      try { ok = safeClick(resolveFn()); } catch (e) { ok = false; }
      if (ok || attempt >= maxTries) return;
      setTimeout(run, wait);
    }
    run();
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch (e) { return null; }
  }

  function isSignedIn() {
    var s = getSession();
    return !!(s && s.email);
  }

  /* ── SVG icon builder (24×24 stroke-based) ─────────────────────────── */

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" class="shn-icon">' + paths + '</svg>';
  }

  /* ── Recently visited ──────────────────────────────────────────────── */

  function getRecent() {
    try { return JSON.parse(sessionStorage.getItem(RECENT_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function pushRecent(key) {
    var list = getRecent().filter(function (k) { return k !== key; });
    list.unshift(key);
    if (list.length > 3) list.length = 3;
    try { sessionStorage.setItem(RECENT_KEY, JSON.stringify(list)); }
    catch (e) { /* quota */ }
  }

  /* ── Menu sections ─────────────────────────────────────────────────── */

  function getMenuSections() {
    return [
      {
        id: 'create', title: 'Create', items: [
          {
            key: 'editor', label: 'Build', desc: 'Choreography editor',
            icon: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
            action: function () { safeClickWithRetry(function(){ return buttonByText('Build'); }); }
          },
          {
            key: 'preview', label: 'Sheet', desc: 'Print-ready view',
            icon: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>'),
            action: function () { safeClickWithRetry(function(){ return buttonByText('Sheet'); }); }
          }
        ]
      },
      {
        id: 'discover', title: 'Discover', items: [
          {
            key: 'whatsnew', label: "What's New", desc: 'Latest updates',
            icon: svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
            action: function () { safeClickWithRetry(function(){ return buttonByText("What's New"); }); }
          },
          {
            key: 'featured', label: 'Featured Choreo', desc: 'Community picks',
            icon: svg('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>'),
            action: function () {
              safeClickWithRetry(function(){ return document.getElementById('stepper-featured-choreo-tab') || buttonByText('Featured Choreo'); });
            }
          },
          {
            key: 'saveddances', label: 'My Saved Dances', desc: 'Your library',
            icon: svg('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'),
            action: function () {
              safeClickWithRetry(function(){ return document.getElementById('stepper-saved-dances-tab') || buttonByText('My Saved Dances'); });
            }
          }
        ]
      },
      {
        id: 'tools', title: 'Tools', items: [
          {
            key: 'glossary', label: 'Glossary', desc: 'Step dictionary',
            icon: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
            action: function () { safeClickWithRetry(function(){ return document.getElementById('stepper-glossary-tab'); }); }
          },
          {
            key: 'pdfimport', label: 'PDF Import', desc: 'Upload sheets',
            icon: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
            action: function () { safeClickWithRetry(function(){ return document.getElementById('stepper-pdf-tab'); }); }
          },
          {
            key: 'friends', label: 'Friends', desc: 'Dance community',
            icon: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
            action: function () { safeClickWithRetry(function(){ return document.getElementById('stepper-friends-tab'); }); }
            action: function () { safeClick(document.getElementById('stepper-friends-tab')); }
          },
          {
            key: 'music', label: 'Music', desc: 'BPM & metronome',
            icon: svg('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
            action: function () { safeClickWithRetry(function(){ return document.getElementById('stepper-music-tab'); }); }
            action: function () { safeClick(document.getElementById('stepper-music-tab')); }
          },
          {
            key: 'templates', label: 'Templates', desc: 'Dance starters',
            icon: svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'),
            action: function () { safeClickWithRetry(function(){ return document.getElementById('stepper-templates-tab'); }); }
            action: function () { safeClick(document.getElementById('stepper-templates-tab')); }
          },
          {
            key: 'notifications', label: 'Notifications', desc: 'Alerts & invites',
            icon: svg('<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'),
            action: function () {
              if (window.__stepperNotificationsTab && typeof window.__stepperNotificationsTab.open === 'function') {
                window.__stepperNotificationsTab.open();
                return;
              }
              safeClickWithRetry(function(){ return document.getElementById('stepper-notifications-tab'); });
              safeClick(document.getElementById('stepper-notifications-tab'));
            }
          }
        ]
      },
      {
        id: 'account', title: 'Account', items: [
          {
            key: 'settings', label: 'Settings', desc: 'Preferences',
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
            key: 'signin', label: 'Sign In', desc: 'Google account',
            icon: svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>'),
            action: function () { safeClickWithRetry(function(){ return document.getElementById('stepper-google-signin-tab'); }); }
          },
          {
            key: 'subscription', label: 'Subscription', desc: 'Manage plan',
            icon: svg('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),
            condition: function () { return isSignedIn(); },
            action: function () { safeClickWithRetry(function(){ return document.getElementById('stepper-google-subscription-tab'); }); }
          },
          {
            key: 'admin', label: 'Admin', desc: 'Dashboard',
            icon: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
            condition: function () { return !!window.__stepperGoogleAdminInstalled; },
            action: function () { safeClickWithRetry(function(){ return document.getElementById('stepper-google-admin-tab'); }); }
          }
        ]
      }
    ];
  }

  /* Flat list helper for keyboard nav */
  function flatItems() {
    var out = [];
    var sections = getMenuSections();
    for (var s = 0; s < sections.length; s++) {
      var items = sections[s].items;
      for (var i = 0; i < items.length; i++) {
        if (!items[i].condition || items[i].condition()) out.push(items[i]);
      }
    }
    return out;
  }

  /* ── Active-tab detection ───────────────────────────────────────────── */
  var _lastSelected = '';

  function detectActiveTab() {
    var route = (document.documentElement.getAttribute('data-stepper-route') || '').toLowerCase();
    if (route) { _lastSelected = route; return route; }

    var pageMap = {
      glossary:  'stepper-glossary-page',
      friends:   'stepper-friends-page',
      pdfimport: 'stepper-pdf-page',
      notifications: 'stepper-notifications-page'
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
    s.textContent = buildCSS();
    document.head.appendChild(s);
  }

  function buildCSS() {
    /* CSS custom properties for theming */
    return [
      /* ── Custom properties ── */
      ':root {',
      '  --shn-accent: #6366f1;',
      '  --shn-accent-glow: rgba(99,102,241,0.35);',
      '  --shn-drawer-w: 320px;',
      '  --shn-transition: cubic-bezier(0.32, 0.72, 0, 1);',
      '}',

      /* ── Hamburger button ── */
      '#' + HAMBURGER_ID + ' {',
      '  position: fixed; top: max(10px, env(safe-area-inset-top, 0px)); right: max(14px, env(safe-area-inset-right, 0px)); z-index: 10001;',
      '  width: 44px; height: 44px; border: none; border-radius: 14px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  cursor: pointer; padding: 0;',
      '  transition: transform .2s var(--shn-transition), box-shadow .3s;',
      '  -webkit-tap-highlight-color: transparent;',
      '  animation: shn-pulse 3s ease-in-out infinite;',
      '}',
      '#' + HAMBURGER_ID + '.shn-open { animation: none; }',
      '#' + HAMBURGER_ID + ':hover { transform: scale(1.08); }',
      '#' + HAMBURGER_ID + ':active { transform: scale(0.93); }',
      'html.stepper-focus-mode #' + HAMBURGER_ID + ' { opacity: 1 !important; pointer-events: auto !important; }',
      '@keyframes shn-pulse {',
      '  0%, 100% { box-shadow: 0 0 0 0 var(--shn-accent-glow); }',
      '  50% { box-shadow: 0 0 0 8px transparent; }',
      '}',

      /* Hamburger bars → X morph */
      '.shn-bar { display: block; width: 20px; height: 2px; border-radius: 2px;',
      '  position: absolute; left: 12px;',
      '  transition: transform .35s var(--shn-transition), opacity .25s, width .3s var(--shn-transition); }',
      '.shn-bar:nth-child(1) { top: 14px; }',
      '.shn-bar:nth-child(2) { top: 21px; }',
      '.shn-bar:nth-child(3) { top: 28px; }',
      '.shn-open .shn-bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }',
      '.shn-open .shn-bar:nth-child(2) { opacity: 0; width: 0; }',
      '.shn-open .shn-bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }',

      /* Light hamburger */
      'html:not(.dark) #' + HAMBURGER_ID + ' {',
      '  background: rgba(255,255,255,0.65);',
      '  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);',
      '  box-shadow: 0 2px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.5) inset;',
      '}',
      'html:not(.dark) .shn-bar { background: #374151; }',
      'html:not(.dark) #' + HAMBURGER_ID + ':hover { background: rgba(255,255,255,0.85); }',
      'html:not(.dark) #' + HAMBURGER_ID + '.shn-open .shn-bar { background: #4f46e5; }',

      /* Dark hamburger */
      'html.dark #' + HAMBURGER_ID + ' {',
      '  background: rgba(30,30,35,0.65);',
      '  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);',
      '  box-shadow: 0 2px 12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06) inset;',
      '}',
      'html.dark .shn-bar { background: #d1d5db; }',
      'html.dark #' + HAMBURGER_ID + ':hover { background: rgba(45,45,50,0.8); }',
      'html.dark #' + HAMBURGER_ID + '.shn-open .shn-bar { background: #a5b4fc; }',

      /* ── Backdrop ── */
      '#' + BACKDROP_ID + ' {',
      '  position: fixed; inset: 0; z-index: 9999;',
      '  background: rgba(0,0,0,0.4);',
      '  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);',
      '  opacity: 0; transition: opacity .35s var(--shn-transition);',
      '}',
      '#' + BACKDROP_ID + '.shn-visible { opacity: 1; }',

      /* ── Drawer ── */
      '#' + DRAWER_ID + ' {',
      '  position: fixed; top: 0; right: 0; bottom: 0; z-index: 10000;',
      '  width: var(--shn-drawer-w); max-width: 90vw;',
      '  display: flex; flex-direction: column;',
      '  transform: translateX(100%);',
      '  transition: transform .4s var(--shn-transition), box-shadow .4s;',
      '  overflow: hidden;',
      '}',
      '#' + DRAWER_ID + '.shn-visible {',
      '  transform: translateX(0);',
      '  box-shadow: -8px 0 40px rgba(0,0,0,0.18);',
      '}',

      /* Light drawer */
      'html:not(.dark) #' + DRAWER_ID + ' {',
      '  background: rgba(255,255,255,0.82);',
      '  backdrop-filter: blur(24px) saturate(1.6); -webkit-backdrop-filter: blur(24px) saturate(1.6);',
      '  border-left: 1px solid rgba(0,0,0,0.06);',
      '}',
      /* Dark drawer */
      'html.dark #' + DRAWER_ID + ' {',
      '  background: rgba(20,20,25,0.85);',
      '  backdrop-filter: blur(24px) saturate(1.4); -webkit-backdrop-filter: blur(24px) saturate(1.4);',
      '  border-left: 1px solid rgba(255,255,255,0.06);',
      '}',

      /* ── Drawer header ── */
      '.shn-header {',
      '  padding: 20px 20px 12px; flex-shrink: 0;',
      '  display: flex; align-items: flex-start; justify-content: space-between;',
      '}',
      '.shn-brand {',
      '  font-size: 20px; font-weight: 800; letter-spacing: -0.02em;',
      '  background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);',
      '  -webkit-background-clip: text; -webkit-text-fill-color: transparent;',
      '  background-clip: text;',
      '}',
      '.shn-user-info {',
      '  font-size: 12px; margin-top: 2px; opacity: 0.6; font-weight: 400;',
      '  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
      '  max-width: calc(var(--shn-drawer-w) - 100px);',
      '}',
      'html:not(.dark) .shn-user-info { color: #6b7280; }',
      'html.dark .shn-user-info { color: #9ca3af; }',
      '.shn-close-btn {',
      '  width: 36px; height: 36px; padding: 4px; border: none; border-radius: 10px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  cursor: pointer; flex-shrink: 0; margin-top: -2px;',
      '  transition: background .15s, transform .15s;',
      '}',
      '.shn-close-btn:hover { transform: scale(1.1); }',
      '.shn-close-btn:active { transform: scale(0.9); }',
      'html:not(.dark) .shn-close-btn { background: rgba(0,0,0,0.05); color: #6b7280; }',
      'html:not(.dark) .shn-close-btn:hover { background: rgba(0,0,0,0.1); }',
      'html.dark .shn-close-btn { background: rgba(255,255,255,0.06); color: #9ca3af; }',
      'html.dark .shn-close-btn:hover { background: rgba(255,255,255,0.12); }',

      /* ── Search ── */
      '.shn-search-wrap {',
      '  padding: 0 16px 8px; flex-shrink: 0;',
      '}',
      '.shn-search {',
      '  position: relative; display: flex; align-items: center;',
      '}',
      '.shn-search-icon {',
      '  position: absolute; left: 12px; pointer-events: none; opacity: 0.4;',
      '  transition: opacity .2s, color .2s;',
      '}',
      '.shn-search input {',
      '  width: 100%; height: 44px; border-radius: 12px;',
      '  padding: 0 14px 0 38px; font-size: 13px; font-family: inherit;',
      '  border: 1.5px solid transparent; outline: none;',
      '  transition: border-color .2s, box-shadow .2s, background .2s;',
      '}',
      '.shn-search input:focus { border-color: var(--shn-accent); box-shadow: 0 0 0 3px var(--shn-accent-glow); }',
      '.shn-search input:focus ~ .shn-search-icon { opacity: 0.8; color: var(--shn-accent); }',
      'html:not(.dark) .shn-search input { background: rgba(0,0,0,0.04); color: #1f2937; }',
      'html:not(.dark) .shn-search input::placeholder { color: #9ca3af; }',
      'html.dark .shn-search input { background: rgba(255,255,255,0.06); color: #f3f4f6; }',
      'html.dark .shn-search input::placeholder { color: #6b7280; }',

      /* ── Recent pills ── */
      '.shn-recent-wrap { padding: 0 16px 6px; flex-shrink: 0; display: flex; gap: 6px; flex-wrap: wrap; }',
      '.shn-recent-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.45; font-weight: 700; width: 100%; margin-bottom: 2px; }',
      '.shn-pill {',
      '  font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px;',
      '  cursor: pointer; border: none; font-family: inherit;',
      '  transition: transform .15s, box-shadow .15s, background .15s;',
      '}',
      '.shn-pill:hover { transform: translateY(-1px); }',
      '.shn-pill:active { transform: scale(0.96); }',
      'html:not(.dark) .shn-pill { background: rgba(99,102,241,0.08); color: #4f46e5; }',
      'html:not(.dark) .shn-pill:hover { background: rgba(99,102,241,0.15); box-shadow: 0 2px 8px rgba(99,102,241,0.15); }',
      'html.dark .shn-pill { background: rgba(99,102,241,0.12); color: #a5b4fc; }',
      'html.dark .shn-pill:hover { background: rgba(99,102,241,0.22); box-shadow: 0 2px 8px rgba(99,102,241,0.2); }',

      /* ── Scrollable area ── */
      '.shn-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 4px 0; ',
      '  scrollbar-width: thin; }',
      'html:not(.dark) .shn-scroll { scrollbar-color: rgba(0,0,0,0.15) transparent; }',
      'html.dark .shn-scroll { scrollbar-color: rgba(255,255,255,0.12) transparent; }',
      '.shn-scroll::-webkit-scrollbar { width: 5px; }',
      '.shn-scroll::-webkit-scrollbar-track { background: transparent; }',
      'html:not(.dark) .shn-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }',
      'html.dark .shn-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }',

      /* ── Section header ── */
      '.shn-section-title {',
      '  font-size: 10px; font-weight: 700; text-transform: uppercase;',
      '  letter-spacing: 0.08em; padding: 14px 20px 6px; opacity: 0.45;',
      '}',

      /* ── Menu items ── */
      '.shn-item {',
      '  display: flex; align-items: center; gap: 12px;',
      '  padding: 10px 20px 10px 16px; cursor: pointer; font-size: 14px;',
      '  font-weight: 500; border: none; background: none; width: 100%;',
      '  text-align: left; color: inherit; font-family: inherit; line-height: 1.3;',
      '  position: relative; overflow: hidden;',
      '  border-left: 3px solid transparent;',
      '  transition: background .15s, transform .15s, border-color .2s;',
      '  opacity: 0; transform: translateX(16px);',
      '  animation: shn-slide-in .35s var(--shn-transition) forwards;',
      '}',
      '.shn-item:focus-visible { outline: 2px solid var(--shn-accent); outline-offset: -2px; border-radius: 4px; }',
      'html:not(.dark) .shn-item:hover { background: rgba(99,102,241,0.06); transform: scale(1.01); }',
      'html.dark .shn-item:hover { background: rgba(99,102,241,0.08); transform: scale(1.01); }',
      '.shn-item:active { transform: scale(0.98) !important; }',

      /* Active item */
      '.shn-item--active {',
      '  font-weight: 700;',
      '  border-left-color: var(--shn-accent);',
      '  background: linear-gradient(90deg, rgba(99,102,241,0.08), transparent) !important;',
      '}',
      '.shn-item--active .shn-item-border {',
      '  position: absolute; left: 0; top: 0; bottom: 0; width: 3px;',
      '  background: linear-gradient(180deg, #6366f1, #a855f7, #6366f1);',
      '  background-size: 100% 200%;',
      '  animation: shn-border-flow 2s linear infinite;',
      '}',
      '@keyframes shn-border-flow {',
      '  0% { background-position: 0 0; }',
      '  100% { background-position: 0 200%; }',
      '}',
      'html:not(.dark) .shn-item--active { color: #4338ca; }',
      'html.dark .shn-item--active { color: #a5b4fc; }',

      /* Staggered entrance */
      '@keyframes shn-slide-in {',
      '  to { opacity: 1; transform: translateX(0); }',
      '}',

      /* Icon wrapper */
      '.shn-icon { flex-shrink: 0; }',
      '.shn-item-text { display: flex; flex-direction: column; min-width: 0; }',
      '.shn-item-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.shn-item-desc {',
      '  font-size: 11px; font-weight: 400; opacity: 0.5;',
      '  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;',
      '}',

      /* Ripple effect */
      '.shn-ripple {',
      '  position: absolute; border-radius: 50%; pointer-events: none;',
      '  background: var(--shn-accent-glow); transform: scale(0); opacity: 0.5;',
      '  animation: shn-ripple-expand .5s ease-out forwards;',
      '}',
      '@keyframes shn-ripple-expand {',
      '  to { transform: scale(4); opacity: 0; }',
      '}',

      /* ── No results ── */
      '.shn-no-results {',
      '  text-align: center; padding: 32px 20px; opacity: 0.4; font-size: 13px;',
      '}',

      /* ── Quick actions footer ── */
      '.shn-footer {',
      '  flex-shrink: 0; padding: 12px 16px;',
      '  display: flex; align-items: center; justify-content: center; gap: 8px;',
      '}',
      'html:not(.dark) .shn-footer { border-top: 1px solid rgba(0,0,0,0.06); }',
      'html.dark .shn-footer { border-top: 1px solid rgba(255,255,255,0.06); }',
      '.shn-qa-btn {',
      '  width: 44px; height: 44px; border: none; border-radius: 12px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  cursor: pointer; font-family: inherit;',
      '  transition: background .15s, transform .15s;',
      '}',
      '.shn-qa-btn:hover { transform: scale(1.1); }',
      '.shn-qa-btn:active { transform: scale(0.9); }',
      'html:not(.dark) .shn-qa-btn { background: rgba(0,0,0,0.04); color: #6b7280; }',
      'html:not(.dark) .shn-qa-btn:hover { background: rgba(99,102,241,0.1); color: #4f46e5; }',
      'html.dark .shn-qa-btn { background: rgba(255,255,255,0.06); color: #9ca3af; }',
      'html.dark .shn-qa-btn:hover { background: rgba(99,102,241,0.15); color: #a5b4fc; }',
      '.shn-qa-tooltip {',
      '  font-size: 10px; position: absolute; bottom: calc(100% + 6px);',
      '  background: #1f2937; color: #fff; padding: 4px 8px; border-radius: 6px;',
      '  white-space: nowrap; pointer-events: none; opacity: 0;',
      '  transition: opacity .15s; font-weight: 500;',
      '}',
      'html.dark .shn-qa-tooltip { background: #f3f4f6; color: #1f2937; }',
      '.shn-qa-btn:hover .shn-qa-tooltip { opacity: 1; }',
      '.shn-qa-btn { position: relative; }',

      /* ── Mobile adjustments ── */
      '@media (max-width: 480px) {',
      '  :root { --shn-drawer-w: 85vw; }',
      '  #' + HAMBURGER_ID + ' { top: 6px; right: 8px; width: 40px; height: 40px; }',
      '  .shn-bar { width: 18px; left: 11px; }',
      '  .shn-bar:nth-child(1) { top: 13px; }',
      '  .shn-bar:nth-child(2) { top: 19px; }',
      '  .shn-bar:nth-child(3) { top: 25px; }',
      '  .shn-open .shn-bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }',
      '  .shn-open .shn-bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }',
      '}',

      /* ── Reduced motion ── */
      '@media (prefers-reduced-motion: reduce) {',
      '  #' + HAMBURGER_ID + ' { animation: none; }',
      '  #' + BACKDROP_ID + ' { transition-duration: 0.01ms; }',
      '  #' + DRAWER_ID + ' { transition-duration: 0.01ms; }',
      '  .shn-bar { transition-duration: 0.01ms; }',
      '  .shn-item { animation-duration: 0.01ms; }',
      '  .shn-ripple { animation-duration: 0.01ms; }',
      '  .shn-pill, .shn-close-btn, .shn-qa-btn, .shn-search input { transition-duration: 0.01ms; }',
      '  @keyframes shn-border-flow { 0%, 100% { background-position: 0 0; } }',
      '}',
      '@media (max-width: 480px) {',
      '  .shn-brand { font-size: 17px; }',
      '}'
    ].join('\n');
  }

  /* ── Tab-strip hiding ───────────────────────────────────────────────── */

  function hideTabStrip() {
    var candidates = [];
    var buildBtn = buttonByText('Build');
    if (buildBtn && buildBtn.parentElement) candidates.push(buildBtn.parentElement);
    var knownIds = [
      'stepper-saved-dances-tab',
      'stepper-google-signin-tab',
      'stepper-google-subscription-tab',
      'stepper-google-admin-tab',
      'stepper-friends-tab',
      'stepper-glossary-tab',
      'stepper-pdf-tab',
      'stepper-settings-tab',
      'stepper-music-tab',
      'stepper-templates-tab',
      'stepper-notifications-tab'
    ];
    for (var k = 0; k < knownIds.length; k++) {
      var tab = document.getElementById(knownIds[k]);
      if (tab && tab.parentElement) candidates.push(tab.parentElement);
    }
    for (var c = 0; c < candidates.length; c++) {
      if (candidates[c]) candidates[c].setAttribute('data-stepper-tabstrip', 'true');
    }

    if (!document.getElementById(TABSTRIP_HIDE)) {
      var s = document.createElement('style');
      s.id = TABSTRIP_HIDE;
      s.textContent =
        '[data-stepper-tabstrip="true"], .nav-tabs {\n' +
        '  position: absolute !important;\n' +
        '  width: 1px !important; height: 1px !important;\n' +
        '  overflow: hidden !important; clip: rect(0,0,0,0) !important;\n' +
        '  white-space: nowrap !important; border: 0 !important;\n' +
        '  padding: 0 !important; margin: -1px !important;\n' +
        '}';
      document.head.appendChild(s);
    }
    var s = document.createElement('style');
    s.id = TABSTRIP_HIDE;
    s.textContent =
      '[data-stepper-tabstrip="true"] {\n' +
      '  position: absolute !important;\n' +
      '  width: 1px !important; height: 1px !important;\n' +
      '  overflow: hidden !important; clip: rect(0,0,0,0) !important;\n' +
      '  white-space: nowrap !important; border: 0 !important;\n' +
      '  padding: 0 !important; margin: -1px !important;\n' +
      '}';
    document.head.appendChild(s);
  }

  /* ── Ripple helper ─────────────────────────────────────────────────── */

  function createRipple(e, container) {
    var rect = container.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 2;
    var rip = document.createElement('span');
    rip.className = 'shn-ripple';
    rip.style.width = rip.style.height = size + 'px';
    rip.style.left = (e.clientX - rect.left - size / 2) + 'px';
    rip.style.top = (e.clientY - rect.top - size / 2) + 'px';
    container.appendChild(rip);
    setTimeout(function () { if (rip.parentNode) rip.remove(); }, 550);
  }

  /* ── Drawer open / close ───────────────────────────────────────────── */
  var _open = false;
  var _focusedIndex = -1;

  function closeDrawer() {
    var drawer = document.getElementById(DRAWER_ID);
    var backdrop = document.getElementById(BACKDROP_ID);
    var btn = document.getElementById(HAMBURGER_ID);

    if (drawer) {
      drawer.classList.remove('shn-visible');
      setTimeout(function () { if (drawer.parentNode) drawer.remove(); }, 420);
    }
    if (backdrop) {
      backdrop.classList.remove('shn-visible');
      setTimeout(function () { if (backdrop.parentNode) backdrop.remove(); }, 360);
    }
    if (btn) {
      btn.classList.remove('shn-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    _open = false;
    _focusedIndex = -1;
    document.removeEventListener('keydown', drawerKeyHandler);
  }

  function openDrawer() {
    if (_open) { closeDrawer(); return; }
    _open = true;

    var btn = document.getElementById(HAMBURGER_ID);
    if (btn) {
      btn.classList.add('shn-open');
      btn.setAttribute('aria-expanded', 'true');
    }

    /* Backdrop */
    var backdrop = document.createElement('div');
    backdrop.id = BACKDROP_ID;
    backdrop.addEventListener('click', closeDrawer);
    document.body.appendChild(backdrop);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { backdrop.classList.add('shn-visible'); });
    });

    /* Drawer container */
    var drawer = document.createElement('div');
    drawer.id = DRAWER_ID;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Navigation menu');

    var active = detectActiveTab();
    var sections = getMenuSections();
    var allRendered = []; // for keyboard nav
    var staggerIdx = 0;

    /* ── Header ── */
    var header = document.createElement('div');
    header.className = 'shn-header';

    var brandCol = document.createElement('div');
    var brandText = document.createElement('div');
    brandText.className = 'shn-brand';
    brandText.textContent = 'Step by Stepper';
    brandCol.appendChild(brandText);

    var sess = getSession();
    if (sess && (sess.displayName || sess.email)) {
      var userInfo = document.createElement('div');
      userInfo.className = 'shn-user-info';
      userInfo.textContent = sess.displayName || sess.email;
      brandCol.appendChild(userInfo);
    }

    var closeBtn = document.createElement('button');
    closeBtn.className = 'shn-close-btn';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.addEventListener('click', closeDrawer);

    header.appendChild(brandCol);
    header.appendChild(closeBtn);
    drawer.appendChild(header);

    /* ── Search bar ── */
    var searchWrap = document.createElement('div');
    searchWrap.className = 'shn-search-wrap';
    var searchInner = document.createElement('div');
    searchInner.className = 'shn-search';
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search pages\u2026';
    searchInput.setAttribute('aria-label', 'Search navigation');
    var searchIcon = document.createElement('span');
    searchIcon.className = 'shn-search-icon';
    searchIcon.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    searchInner.appendChild(searchInput);
    searchInner.appendChild(searchIcon);
    searchWrap.appendChild(searchInner);
    drawer.appendChild(searchWrap);

    /* ── Recent pills ── */
    var recentWrap = document.createElement('div');
    recentWrap.className = 'shn-recent-wrap';
    recentWrap.style.display = 'none';

    function buildRecentPills() {
      recentWrap.innerHTML = '';
      var recent = getRecent();
      var flat = flatItems();
      var shown = 0;
      if (recent.length === 0) { recentWrap.style.display = 'none'; return; }
      var lbl = document.createElement('div');
      lbl.className = 'shn-recent-label';
      lbl.textContent = 'Recent';
      recentWrap.appendChild(lbl);
      for (var r = 0; r < recent.length; r++) {
        for (var f = 0; f < flat.length; f++) {
          if (flat[f].key === recent[r]) {
            var pill = document.createElement('button');
            pill.className = 'shn-pill';
            pill.textContent = flat[f].label;
            pill.setAttribute('data-key', flat[f].key);
            (function (item) {
              pill.addEventListener('click', function (ev) {
                createRipple(ev, pill);
                closeDrawer();
                pushRecent(item.key);
                _lastSelected = item.key;
                item.action();
              });
            })(flat[f]);
            recentWrap.appendChild(pill);
            shown++;
            break;
          }
        }
      }
      recentWrap.style.display = shown > 0 ? '' : 'none';
    }
    buildRecentPills();
    drawer.appendChild(recentWrap);

    /* ── Scrollable menu area ── */
    var scroll = document.createElement('div');
    scroll.className = 'shn-scroll';

    for (var si = 0; si < sections.length; si++) {
      var sec = sections[si];
      var secEl = document.createElement('div');
      secEl.setAttribute('data-section', sec.id);

      var titleEl = document.createElement('div');
      titleEl.className = 'shn-section-title';
      titleEl.textContent = sec.title;
      secEl.appendChild(titleEl);

      for (var ii = 0; ii < sec.items.length; ii++) {
        var item = sec.items[ii];
        if (item.condition && !item.condition()) continue;

        var row = document.createElement('button');
        row.className = 'shn-item' + (item.key === active ? ' shn-item--active' : '');
        row.setAttribute('role', 'menuitem');
        row.setAttribute('data-key', item.key);
        row.setAttribute('tabindex', '-1');
        row.style.animationDelay = (staggerIdx * 30) + 'ms';
        staggerIdx++;

        if (item.key === active) {
          row.innerHTML = '<span class="shn-item-border"></span>';
        } else {
          row.innerHTML = '';
        }

        var iconSpan = document.createElement('span');
        iconSpan.innerHTML = item.icon;
        row.appendChild(iconSpan.firstChild || iconSpan);

        var textWrap = document.createElement('span');
        textWrap.className = 'shn-item-text';
        var labelSpan = document.createElement('span');
        labelSpan.className = 'shn-item-label';
        labelSpan.textContent = item.label;
        textWrap.appendChild(labelSpan);
        if (item.desc) {
          var descSpan = document.createElement('span');
          descSpan.className = 'shn-item-desc';
          descSpan.textContent = item.desc;
          textWrap.appendChild(descSpan);
        }
        row.appendChild(textWrap);

        (function (itm) {
          row.addEventListener('click', function (ev) {
            createRipple(ev, row);
            setTimeout(function () {
              closeDrawer();
              pushRecent(itm.key);
              _lastSelected = itm.key;
              itm.action();
            }, 120);
          });
        })(item);

        secEl.appendChild(row);
        allRendered.push(row);
      }

      scroll.appendChild(secEl);
    }

    drawer.appendChild(scroll);

    /* ── Quick actions footer ── */
    var footer = document.createElement('div');
    footer.className = 'shn-footer';

    var qaItems = [
      {
        tip: 'Toggle Dark Mode',
        icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        action: function () {
          window.dispatchEvent(new CustomEvent('stepper-toggle-dark-mode'));
          try {
            var raw = localStorage.getItem(BUILDER_KEY);
            var data = raw ? JSON.parse(raw) : {};
            if (!data || typeof data !== 'object') data = {};
            data.isDarkMode = !data.isDarkMode;
            localStorage.setItem(BUILDER_KEY, JSON.stringify(data));
            document.documentElement.classList.toggle('dark', data.isDarkMode);
          } catch (e) { /* ignore */ }
        }
      },
      {
        tip: 'Toggle Fullscreen',
        icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
        action: function () {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(function () {});
          } else {
            document.exitFullscreen().catch(function () {});
          }
        }
      },
      {
        tip: 'Keyboard Shortcuts',
        icon: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><line x1="6" y1="10" x2="6" y2="10"/><line x1="10" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="14" y2="10"/><line x1="18" y1="10" x2="18" y2="10"/><line x1="8" y1="14" x2="16" y2="14"/></svg>',
        action: function () {
          window.dispatchEvent(new CustomEvent('stepper-show-keyboard-shortcuts'));
        }
      }
    ];

    for (var q = 0; q < qaItems.length; q++) {
      var qaBtn = document.createElement('button');
      qaBtn.className = 'shn-qa-btn';
      qaBtn.setAttribute('aria-label', qaItems[q].tip);
      qaBtn.innerHTML = qaItems[q].icon + '<span class="shn-qa-tooltip">' + qaItems[q].tip + '</span>';
      (function (act) {
        qaBtn.addEventListener('click', function (ev) {
          ev.stopPropagation();
          act();
        });
      })(qaItems[q].action);
      footer.appendChild(qaBtn);
    }

    drawer.appendChild(footer);
    document.body.appendChild(drawer);

    /* Trigger entrance animation */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { drawer.classList.add('shn-visible'); });
    });

    /* ── Search filtering ── */
    searchInput.addEventListener('input', function () {
      var q = searchInput.value.toLowerCase().trim();
      var anyVisible = false;

      var sectionEls = scroll.querySelectorAll('[data-section]');
      for (var se = 0; se < sectionEls.length; se++) {
        var secItems = sectionEls[se].querySelectorAll('.shn-item');
        var secVisible = false;
        for (var si2 = 0; si2 < secItems.length; si2++) {
          var label = (secItems[si2].querySelector('.shn-item-label') || {}).textContent || '';
          var desc = (secItems[si2].querySelector('.shn-item-desc') || {}).textContent || '';
          var match = !q || label.toLowerCase().indexOf(q) !== -1 || desc.toLowerCase().indexOf(q) !== -1;
          secItems[si2].style.display = match ? '' : 'none';
          if (match) { secVisible = true; anyVisible = true; }
        }
        var secTitle = sectionEls[se].querySelector('.shn-section-title');
        if (secTitle) secTitle.style.display = secVisible ? '' : 'none';
      }

      /* No results message */
      var noRes = scroll.querySelector('.shn-no-results');
      if (!anyVisible && q) {
        if (!noRes) {
          noRes = document.createElement('div');
          noRes.className = 'shn-no-results';
          noRes.textContent = 'No pages found';
          scroll.appendChild(noRes);
        }
        noRes.style.display = '';
      } else if (noRes) {
        noRes.style.display = 'none';
      }

      /* Hide recent pills when searching */
      recentWrap.style.display = q ? 'none' : '';
      if (!q) buildRecentPills();

      /* Reset keyboard focus index */
      _focusedIndex = -1;
      allRendered = [];
      var visItems = scroll.querySelectorAll('.shn-item');
      for (var vi = 0; vi < visItems.length; vi++) {
        if (visItems[vi].style.display !== 'none') allRendered.push(visItems[vi]);
      }
    });

    /* ── Keyboard navigation & focus trap ── */
    document.addEventListener('keydown', drawerKeyHandler);

    /* Focus the search input after a brief delay so transition looks smooth */
    setTimeout(function () {
      if (searchInput && _open) searchInput.focus();
    }, 200);
  }

  /* ── Drawer keyboard handler ───────────────────────────────────────── */

  function drawerKeyHandler(e) {
    if (!_open) return;

    var drawer = document.getElementById(DRAWER_ID);
    if (!drawer) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeDrawer();
      var hamburger = document.getElementById(HAMBURGER_ID);
      if (hamburger) hamburger.focus();
      return;
    }

    /* Focus trap: Tab / Shift+Tab */
    if (e.key === 'Tab') {
      var focusable = drawer.querySelectorAll('button, input, [tabindex]');
      var arr = [];
      for (var fi = 0; fi < focusable.length; fi++) {
        if (focusable[fi].offsetParent !== null && focusable[fi].style.display !== 'none') {
          arr.push(focusable[fi]);
        }
      }
      if (arr.length === 0) return;
      var first = arr[0];
      var last = arr[arr.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      return;
    }

    /* Arrow keys for menu items */
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      var items = drawer.querySelectorAll('.shn-item');
      var visible = [];
      for (var vi = 0; vi < items.length; vi++) {
        if (items[vi].style.display !== 'none') visible.push(items[vi]);
      }
      if (visible.length === 0) return;

      if (e.key === 'ArrowDown') {
        _focusedIndex = (_focusedIndex + 1) % visible.length;
      } else {
        _focusedIndex = (_focusedIndex - 1 + visible.length) % visible.length;
      }
      visible[_focusedIndex].focus();
    }
  }

  /* ── Global keyboard shortcut ──────────────────────────────────────── */

  function onGlobalKey(e) {
    if (e.key === 'Escape' && _open) {
      closeDrawer();
      var hamburger = document.getElementById(HAMBURGER_ID);
      if (hamburger) hamburger.focus();
    }
  }

  /* ── Render hamburger button ────────────────────────────────────────── */

  function renderHamburger() {
    var existing = document.getElementById(HAMBURGER_ID);
    if (existing) {
      existing.style.display = 'flex';
      existing.style.visibility = 'visible';
      existing.style.opacity = '1';
      existing.style.pointerEvents = 'auto';
      existing.style.zIndex = '10001';
      return;
    }
    var btn = document.createElement('button');
    btn.id = HAMBURGER_ID;
    btn.setAttribute('aria-label', 'Navigation menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('title', 'Navigation menu');

    /* Three bars that morph to X via CSS */
    btn.innerHTML =
      '<span class="shn-bar"></span>' +
      '<span class="shn-bar"></span>' +
      '<span class="shn-bar"></span>';
    btn.style.display = 'flex';
    btn.style.visibility = 'visible';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.style.zIndex = '10001';

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openDrawer();
    });
    document.body.appendChild(btn);
  }

  /* ── Boot ────────────────────────────────────────────────────────────── */

  function boot() {
    injectStyles();
    renderHamburger();
    hideTabStrip();
    document.addEventListener('keydown', onGlobalKey);

    var observer = new MutationObserver(function () {
      renderHamburger();
      if (!document.getElementById(TABSTRIP_HIDE)) hideTabStrip();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('storage', function () {
      if (!document.getElementById(TABSTRIP_HIDE)) hideTabStrip();
    });

    var settleTicks = 0;
    var settleTimer = setInterval(function () {
      settleTicks++;
      hideTabStrip();
      renderHamburger();
      if (settleTicks > 30) clearInterval(settleTimer);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ── Public API ──────────────────────────────────────────────────────── */
  window.__stepperHamburgerNav = {
    open:  openDrawer,
    close: closeDrawer,
    isOpen: function () { return _open; }
  };
})();
