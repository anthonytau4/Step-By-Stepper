/**
 * stepper-pdf-import.js
 * Stable bridge kept intentionally tiny to avoid merge conflicts.
 */
(function() {
  'use strict';

  function initBridge() {
    if (typeof window.StepperPdfImportLoaderCoreInit === 'function') {
      window.StepperPdfImportLoaderCoreInit();
      return;
    }

    const existing = document.querySelector('script[data-stepper-pdf-import-loader-core], script[src*="stepper-pdf-import-loader-core.js"]');
    if (existing) {
      existing.addEventListener('load', function() {
        if (typeof window.StepperPdfImportLoaderCoreInit === 'function') window.StepperPdfImportLoaderCoreInit();
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = ((/(^|\/)sheet(\/|\/index\.html)?$/).test(window.location.pathname.replace(/\/+/g, '/')) ? '../' : './') + 'stepper-pdf-import-loader-core.js';
    script.async = false;
    script.dataset.stepperPdfImportLoaderCore = 'true';
    script.addEventListener('load', function() {
      if (typeof window.StepperPdfImportLoaderCoreInit === 'function') window.StepperPdfImportLoaderCoreInit();
    }, { once: true });
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBridge, { once: true });
  } else {
    initBridge();
  }
})();
