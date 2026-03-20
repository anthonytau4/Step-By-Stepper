/**
 * stepper-pdf-import-bootstrap.js
 * Thin bootstrap kept intentionally small to avoid repeated merge conflicts on stepper-pdf-import.js.
 */
(function() {
  'use strict';

  if (typeof window.StepperPdfImportUiInit === 'function') {
    window.StepperPdfImportUiInit();
    return;
  }

  console.error('Stepper PDF import UI is missing.');
})();
