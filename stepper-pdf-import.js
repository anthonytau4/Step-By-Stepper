/**
 * stepper-pdf-import.js
 * Small loader that keeps page HTML stable and lazy-loads the PDF import runtime.
 */
(function() {
  'use strict';

  function getRuntimeSrc() {
    const script = document.currentScript;
    if (script) {
      const url = new URL(script.src, window.location.href);
      url.pathname = url.pathname.replace(/stepper-pdf-import\.js$/, 'stepper-pdf-import-runtime.js');
      url.search = '?v=20260320-pdf-import-runtime-2';
      return url.toString();
    }
    const prefix = window.location.pathname.startsWith('/sheet/') ? '../' : './';
    return prefix + 'stepper-pdf-import-runtime.js?v=20260320-pdf-import-runtime-2';
  }

  function boot() {
    if (typeof window.StepperPdfImportRuntimeInit === 'function') {
      window.StepperPdfImportRuntimeInit();
      return true;
    }
    return false;
  }

  if (boot()) return;

  const src = getRuntimeSrc();
  const existing = Array.from(document.scripts).find((item) => item.src && item.src.indexOf('stepper-pdf-import-runtime.js') !== -1);
  if (existing) {
    existing.addEventListener('load', boot, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = src;
  script.async = false;
  script.onload = boot;
  script.onerror = function() {
    console.error('Stepper PDF import runtime failed to load.');
  };
  document.head.appendChild(script);
})();
