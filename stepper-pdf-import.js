/**
 * stepper-pdf-import.js
 * Stable PDF import loader for editor pages.
 */
(function() {
  'use strict';

  if (window.__stepperPdfImportLoaderStarted) return;
  window.__stepperPdfImportLoaderStarted = true;

  function buildRuntimeSrc() {
    const path = window.location.pathname.replace(/\/+/g, '/');
    const onSheetPage = /(^|\/)sheet(\/|\/index\.html)?$/.test(path);
    return (onSheetPage ? '../' : './') + 'stepper-pdf-import-runtime.js';
  }

  function initRuntime() {
    if (window.__stepperPdfImportRuntimeInitialized) return;
    if (typeof window.StepperPdfImportRuntimeInit !== 'function') return;
    window.__stepperPdfImportRuntimeInitialized = true;
    window.StepperPdfImportRuntimeInit();
  }

  function bindRuntimeLoad(script) {
    if (!script || script.__stepperPdfImportBound) return;
    script.__stepperPdfImportBound = true;
    script.addEventListener('load', initRuntime, { once: true });
    script.addEventListener('error', function() {
      window.__stepperPdfImportRuntimeInitialized = false;
      console.error('Failed to load stepper-pdf-import-runtime.js');
    }, { once: true });
  }

  function ensureRuntime() {
    if (typeof window.StepperPdfImportRuntimeInit === 'function') {
      initRuntime();
      return;
    }

    const existing = document.querySelector('script[data-stepper-pdf-import-runtime], script[src*="stepper-pdf-import-runtime.js"]');
    if (existing) {
      bindRuntimeLoad(existing);
      if (existing.dataset.loaded === 'true' || existing.readyState === 'complete') {
        initRuntime();
      }
      return;
    }

    const script = document.createElement('script');
    script.src = buildRuntimeSrc();
    script.async = false;
    script.dataset.stepperPdfImportRuntime = 'true';
    bindRuntimeLoad(script);
    script.addEventListener('load', function() {
      script.dataset.loaded = 'true';
    }, { once: true });
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureRuntime, { once: true });
  } else {
    ensureRuntime();
  }
})();
