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
    return (onSheetPage ? '../' : './') + 'stepper-pdf-import-runtime.js?v=20260320-pdf-import-runtime-3';
  }

  function initRuntime() {
    if (typeof window.StepperPdfImportRuntimeInit === 'function') {
      window.StepperPdfImportRuntimeInit();
    }
  }

  function ensureRuntime() {
    if (typeof window.StepperPdfImportRuntimeInit === 'function') {
      initRuntime();
      return;
    }

    const existing = Array.from(document.scripts).find((script) =>
      script.src && script.src.indexOf('stepper-pdf-import-runtime.js') !== -1
    );
    if (existing) {
      existing.addEventListener('load', initRuntime, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = buildRuntimeSrc();
    script.async = false;
    script.addEventListener('load', initRuntime, { once: true });
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureRuntime, { once: true });
  } else {
    ensureRuntime();
  }
})();
