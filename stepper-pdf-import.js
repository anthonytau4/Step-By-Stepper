/**
 * stepper-pdf-import.js
 * Stable PDF import loader for editor pages.
 */
(function() {
  'use strict';

  if (window.__stepperPdfImportLoaderStarted) return;
  window.__stepperPdfImportLoaderStarted = true;

  const src = ((/(^|\/)sheet(\/|\/index\.html)?$/).test(window.location.pathname.replace(/\/+/g, '/'))
    ? '../'
    : './') + 'stepper-pdf-import-runtime.js';

  function initRuntime() {
    if (window.__stepperPdfImportRuntimeInitialized) return;
    if (typeof window.StepperPdfImportRuntimeInit !== 'function') return;
    window.__stepperPdfImportRuntimeInitialized = true;
    window.StepperPdfImportRuntimeInit();
  }

  function ensureRuntime() {
    const existing = document.querySelector('script[data-stepper-pdf-import-runtime], script[src*="stepper-pdf-import-runtime.js"]');
    if (existing) {
      if (typeof window.StepperPdfImportRuntimeInit === 'function' || existing.dataset.loaded === 'true' || existing.readyState === 'complete') {
        initRuntime();
      } else {
        existing.addEventListener('load', initRuntime, { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.stepperPdfImportRuntime = 'true';
    script.addEventListener('load', function() {
      script.dataset.loaded = 'true';
      initRuntime();
    }, { once: true });
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureRuntime, { once: true });
  } else {
    ensureRuntime();
  }
})();
