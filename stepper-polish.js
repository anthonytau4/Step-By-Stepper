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
      /* --- Global shine on interactive elements --- */
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
      }
      button:hover::after, [role="button"]:hover::after,
      .stepper-glint:hover::after, [class*="rounded-3xl"]:hover::after {
        left: 135%;
      }

      /* --- Smooth page transitions --- */
      section[id^="stepper-"] {
        transition: opacity 0.3s ease, transform 0.3s ease !important;
      }
      section[id^="stepper-"][hidden] {
        opacity: 0 !important;
        transform: translateY(8px) !important;
      }
      section[id^="stepper-"]:not([hidden]) {
        opacity: 1;
        transform: translateY(0);
      }

      /* --- Card hover effects --- */
      .stepper-card, [class*="bg-white/"], [class*="bg-gray"], [class*="rounded-xl"] {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      /* --- Focus ring for accessibility + style --- */
      input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible {
        outline: 2px solid rgba(99,102,241,0.5);
        outline-offset: 2px;
      }

      /* --- Smooth scroll everywhere --- */
      html { scroll-behavior: smooth; }

      /* --- Toast / notification animation --- */
      @keyframes stepper-slide-in {
        from { opacity: 0; transform: translateY(-16px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* --- Subtle loading pulse --- */
      @keyframes stepper-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      .stepper-loading { animation: stepper-pulse 1.5s ease-in-out infinite; }
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
