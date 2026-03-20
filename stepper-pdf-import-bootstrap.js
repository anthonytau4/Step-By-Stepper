/**
 * stepper-pdf-import-bootstrap.js
 * Thin bootstrap kept intentionally small to avoid repeated merge conflicts on stepper-pdf-import.js.
 */
(function() {
  'use strict';

  if (typeof window.StepperPdfImportRuntimeInit === 'function') {
    window.StepperPdfImportRuntimeInit();
    return;
  }

  console.error('Stepper PDF import runtime is missing.');
})();
