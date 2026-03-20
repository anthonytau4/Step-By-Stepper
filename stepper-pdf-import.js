/**
 * stepper-pdf-import.js
 * Thin bootstrap kept intentionally small to avoid repeated merge conflicts.
 */
(function() {
  'use strict';

  if (typeof window.StepperPdfImportUiInit === 'function') {
    window.StepperPdfImportUiInit();
    return;
  }

  console.error('Stepper PDF import UI is missing.');
})();
