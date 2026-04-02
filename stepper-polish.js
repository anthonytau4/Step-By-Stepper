/**
 * stepper-polish.js
 * Global finishing touches: shine effects, smooth transitions, page consistency.
 */
(function() {
  'use strict';

  function injectPolishStyles() {
    if (document.getElementById('stepper-polish-styles')) return;
    const style = document.createElement('style');
    style.id = 'stepper-polish-styles';
    style.textContent = `
      /* ═══════════════════════════════════════════════════════
         GLOBAL FOUNDATION
         ═══════════════════════════════════════════════════════ */
      html { scroll-behavior: smooth; }
      body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

      /* ── Tab content isolation: prevent editor/sheet bleeding ── */
      main > div > div[class*="flex"][class*="flex-col"] { overflow: hidden; contain: layout paint; }
      #root main { contain: layout style; overflow-x: hidden; }
      [role="tabpanel"], [data-tab-panel], main > section,
      #stepper-google-admin-host { contain: layout paint; overflow: hidden; }
      #stepper-google-admin-host[hidden] { display: none !important; height: 0 !important; overflow: hidden !important; }
      section[id^="stepper-"][hidden] {
        display: none !important; height: 0 !important; overflow: hidden !important;
        pointer-events: none !important; visibility: hidden !important;
      }

      /* ═══════════════════════════════════════════════════════
         SHINE + GLINT ON INTERACTIVE ELEMENTS
         ═══════════════════════════════════════════════════════ */
      button, [role="button"], a.nav-link, .tab-button,
      .stepper-glint, [class*="rounded-3xl"], [class*="rounded-2xl"] {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }
      button::before, [role="button"]::before,
      .stepper-glint::before, [class*="rounded-3xl"]::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03) 38%, transparent 62%);
        pointer-events: none;
        opacity: 0.8;
        z-index: 1;
      }
      button::after, [role="button"]::after,
      .stepper-glint::after, [class*="rounded-3xl"]::after {
        content: '';
        position: absolute;
        top: -65%;
        left: -120%;
        width: 55%;
        height: 240%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), rgba(255,255,255,0.08), transparent);
        transform: skewX(-24deg);
        transition: left 0.8s ease, opacity 0.25s ease;
        pointer-events: none;
        opacity: 0.65;
        z-index: 2;
      }
      button:hover::after, [role="button"]:hover::after,
      .stepper-glint:hover::after, [class*="rounded-3xl"]:hover::after {
        left: 135%;
      }

      /* ═══════════════════════════════════════════════════════
         SMOOTH PAGE & SECTION TRANSITIONS
         ═══════════════════════════════════════════════════════ */
      section[id^="stepper-"]:not([hidden]) {
        opacity: 1;
        transform: translateY(0);
        transition: opacity 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1) !important;
      }

      /* ═══════════════════════════════════════════════════════
         CARD & PANEL STYLING
         ═══════════════════════════════════════════════════════ */
      .stepper-card, [class*="bg-white/"], [class*="rounded-xl"], article[class*="rounded-3xl"] {
        transition: transform 0.2s ease, box-shadow 0.25s ease;
      }
      article[class*="rounded-3xl"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 16px 40px rgba(0,0,0,.10);
      }
      .dark article[class*="rounded-3xl"]:hover {
        box-shadow: 0 16px 40px rgba(0,0,0,.28);
      }

      /* ═══════════════════════════════════════════════════════
         TAB STRIP POLISH
         ═══════════════════════════════════════════════════════ */
      [role="tablist"], .tab-strip, .tabs-strip {
        gap: 4px !important;
        padding: 4px;
        border-radius: 16px;
        background: rgba(99,102,241,.06);
      }
      .dark [role="tablist"], .dark .tab-strip, .dark .tabs-strip {
        background: rgba(99,102,241,.10);
      }
      [role="tab"], [role="tablist"] button, .tab-strip button {
        border-radius: 12px !important;
        padding: 8px 16px !important;
        font-weight: 800 !important;
        font-size: 13px !important;
        letter-spacing: .02em;
        transition: background .2s ease, color .2s ease, box-shadow .2s ease !important;
      }
      [role="tab"][aria-selected="true"], [role="tablist"] button[aria-selected="true"],
      [role="tab"].active, .tab-strip button.active {
        background: #4f46e5 !important;
        color: #fff !important;
        box-shadow: 0 4px 14px rgba(79,70,229,.25) !important;
      }
      .dark [role="tab"][aria-selected="true"], .dark [role="tab"].active {
        background: #6366f1 !important;
        box-shadow: 0 4px 14px rgba(99,102,241,.30) !important;
      }

      /* ═══════════════════════════════════════════════════════
         FORM INPUTS
         ═══════════════════════════════════════════════════════ */
      input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible {
        outline: 2px solid rgba(99,102,241,0.5);
        outline-offset: 2px;
      }
      input, textarea, select {
        transition: border-color .2s ease, box-shadow .2s ease;
      }
      input:focus, textarea:focus, select:focus {
        border-color: rgba(99,102,241,.45) !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,.12) !important;
      }

      /* ═══════════════════════════════════════════════════════
         STAT CARDS & GRIDS
         ═══════════════════════════════════════════════════════ */
      .stepper-google-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 10px;
      }
      .stepper-google-stat {
        border-radius: 16px !important;
        padding: 14px 16px !important;
        text-align: center;
        transition: transform .15s ease, box-shadow .15s ease;
      }
      .stepper-google-stat:hover {
        transform: translateY(-1px);
      }

      /* ═══════════════════════════════════════════════════════
         PILL BADGES
         ═══════════════════════════════════════════════════════ */
      .stepper-google-pill {
        border-radius: 999px;
        padding: 5px 12px;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
        transition: transform .15s ease;
      }
      .stepper-google-pill:hover {
        transform: scale(1.04);
      }

      /* ═══════════════════════════════════════════════════════
         CTA BUTTONS
         ═══════════════════════════════════════════════════════ */
      .stepper-google-cta {
        border-radius: 14px !important;
        padding: 10px 18px !important;
        font-weight: 800;
        font-size: 13px;
        transition: transform .15s ease, box-shadow .2s ease, background .15s ease;
        cursor: pointer;
      }
      .stepper-google-cta:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(0,0,0,.10);
      }
      .stepper-google-cta:active {
        transform: scale(.97);
      }
      .stepper-google-danger:hover {
        background: rgba(239,68,68,.08) !important;
      }
      .dark .stepper-google-cta:hover {
        box-shadow: 0 6px 20px rgba(0,0,0,.25);
      }

      /* ═══════════════════════════════════════════════════════
         HELPER CHAT POLISH
         ═══════════════════════════════════════════════════════ */
      #stepper-site-helper-host, #stepper-community-glossary-host {
        max-width: calc(100vw - 24px);
      }
      .stepper-helper-panel {
        backdrop-filter: blur(16px) saturate(1.6);
        -webkit-backdrop-filter: blur(16px) saturate(1.6);
      }
      .stepper-helper-msg {
        animation: stepper-msg-in .25s cubic-bezier(.4,0,.2,1);
      }
      @keyframes stepper-msg-in {
        from { opacity: 0; transform: translateY(8px) scale(.97); }
        to   { opacity: 1; transform: translateY(0)  scale(1); }
      }
      .stepper-helper-chip {
        transition: transform .12s ease, box-shadow .12s ease;
      }
      .stepper-helper-chip:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(99,102,241,.18);
      }

      /* ═══════════════════════════════════════════════════════
         SAVE BUTTON POLISH
         ═══════════════════════════════════════════════════════ */
      #stepper-save-host button {
        transition: transform .18s ease, box-shadow .18s ease, background .18s ease !important;
      }
      #stepper-save-host button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 14px 36px rgba(0,0,0,.16) !important;
      }
      #stepper-save-host button:active {
        transform: scale(.96) !important;
      }

      /* ═══════════════════════════════════════════════════════
         ARCHIVE STYLES
         ═══════════════════════════════════════════════════════ */
      [data-archived="true"] {
        opacity: .45;
        filter: grayscale(.5);
        transition: opacity .25s ease, filter .25s ease;
      }
      [data-archived="true"]:hover {
        opacity: .75;
        filter: grayscale(.2);
      }

      /* ═══════════════════════════════════════════════════════
         ANIMATIONS
         ═══════════════════════════════════════════════════════ */
      @keyframes stepper-slide-in {
        from { opacity: 0; transform: translateY(-16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes stepper-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      .stepper-loading { animation: stepper-pulse 1.5s ease-in-out infinite; }
      @keyframes stepper-fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      /* ═══════════════════════════════════════════════════════
         RESPONSIVE FIXES
         ═══════════════════════════════════════════════════════ */
      @media (max-width: 640px) {
        .stepper-google-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
        }
        .stepper-google-cta {
          padding: 8px 12px !important;
          font-size: 12px !important;
        }
        article[class*="rounded-3xl"] {
          padding: 14px !important;
          border-radius: 20px !important;
        }
      }

      /* ═══════════════════════════════════════════════════════
         SCROLLBAR POLISH (Webkit)
         ═══════════════════════════════════════════════════════ */
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(99,102,241,.22); border-radius: 999px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,.38); }
      .dark ::-webkit-scrollbar-thumb { background: rgba(148,163,184,.22); }
      .dark ::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,.38); }
    `;
    document.head.appendChild(style);
  }


  function init() {
    injectPolishStyles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
