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
      button, [role="button"], a.nav-link, .tab-button {
        position: relative;
        overflow: hidden;
      }
      button::after, [role="button"]::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -100%;
        width: 60%;
        height: 200%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        transform: skewX(-20deg);
        transition: left 0.6s ease;
        pointer-events: none;
      }
      button:hover::after, [role="button"]:hover::after {
        left: 120%;
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
