/**
 * stepper-sheet-format.js
 * ───────────────────────
 * Automatically formats every section on the printable Sheet as:
 *
 *   Section 1: Step Name A, Step Name B, Step Name C
 *   ────────────────────────────────────────────────
 *   1-2   Step right to right side, rock back on left
 *   3&4   Cross shuffle right over left
 *   …
 *
 * i.e. each section heading becomes the section label plus its step names in
 * order, followed by a divider rule, with the existing count/description rows
 * underneath. It reads the current dance from localStorage and re-applies
 * after the React sheet re-renders. Purely additive DOM augmentation.
 */
(function () {
  'use strict';
  if (window.__stepperSheetFormatInstalled) return;
  window.__stepperSheetFormatInstalled = true;

  var DATA_KEY = 'linedance_builder_data_v13';
  var RULE_CLASS = 'stepper-sf-rule';
  var STYLE_ID = 'stepper-sheet-format-style';
  var observer = null;
  var scheduled = 0;
  var applying = false;

  function readDance() {
    try {
      var raw = localStorage.getItem(DATA_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function cleanText(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function titleCaseWords(value) {
    return cleanText(value)
      .split(' ')
      .filter(Boolean)
      .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
      .join(' ');
  }

  /* Derive a short step name from a description when no name is stored. */
  function nameFromDescription(description) {
    var source = cleanText(description);
    if (!source) return '';
    var firstClause = source.split(/[.,;:]/)[0].trim();
    var words = firstClause.split(' ').slice(0, 5).join(' ');
    return titleCaseWords(words);
  }

  function isMarkerStep(step) {
    return !!(step && (step.type === 'marker' || step.marker || step.markerType));
  }

  function markerLabel(step) {
    var kind = cleanText(step && step.markerType) || 'tag';
    return titleCaseWords(kind);
  }

  /* Step names for one data section, in order (markers included as labels). */
  function stepNamesFromData(section) {
    var steps = section && Array.isArray(section.steps) ? section.steps : [];
    var names = [];
    steps.forEach(function (step) {
      if (isMarkerStep(step)) { names.push(markerLabel(step)); return; }
      var name = cleanText(step && step.name) || nameFromDescription(step && (step.description || step.name));
      if (name) names.push(name);
    });
    return names;
  }

  /* Fallback: derive step names from the rendered rows inside a section block.
     Each row renders the description inside `.flex-1 .font-bold`, with the
     foot in a trailing dim span and the count in a leading `.w-12` cell. */
  function stepNamesFromDom(block, headingEl) {
    var names = [];
    var host = headingEl && headingEl.nextElementSibling;
    while (host && host.classList && host.classList.contains(RULE_CLASS)) host = host.nextElementSibling;
    var scope = host || block;
    var rows = scope.querySelectorAll('.flex-1');
    Array.prototype.forEach.call(rows, function (cell) {
      var boldEl = cell.querySelector('.font-bold');
      var desc = cleanText((boldEl ? boldEl.textContent : cell.textContent) || '')
        .replace(/^:\s*/, '')
        .replace(/\[[^\]]*\]\s*$/, '')
        .trim();
      var name = nameFromDescription(desc);
      if (name) names.push(name);
    });
    return names;
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    /* The section heading itself carries the divider (its bottom border), so
       we don't add a second rule. We just guarantee the border is present and
       let the step-name list wrap nicely. */
    style.textContent = [
      '#print-sheet h2.stepper-sf-heading {',
      '  border-bottom: 2px solid currentColor;',
      '  padding-bottom: 4px;',
      '  text-transform: none;',
      '  word-break: break-word;',
      '}',
      '@media print { #print-sheet h2.stepper-sf-heading { border-color: #000; } }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  function applyFormat() {
    var printSheet = document.getElementById('print-sheet');
    if (!printSheet) return;
    var headings = Array.prototype.slice.call(printSheet.querySelectorAll('h2'));
    if (!headings.length) return;

    var dance = readDance();
    var dataSections = dance && Array.isArray(dance.sections) ? dance.sections : [];
    var alignByData = dataSections.length === headings.length;

    injectStyle();

    headings.forEach(function (heading, index) {
      var block = heading.parentElement || heading;
      var dataSection = alignByData ? dataSections[index] : null;

      var label = '';
      if (dataSection) label = cleanText(dataSection.name || dataSection.title);
      if (!label) label = 'Section ' + (index + 1);

      var names = dataSection ? stepNamesFromData(dataSection) : stepNamesFromDom(block, heading);
      // de-dupe consecutive repeats for readability but keep order
      names = names.filter(function (n, i) { return n && n !== names[i - 1]; });

      var desired = names.length ? (label + ': ' + names.join(', ')) : label;

      heading.classList.add('stepper-sf-heading');
      if (cleanText(heading.textContent) !== desired) heading.textContent = desired;
    });
  }

  function runApply() {
    if (applying) return;
    applying = true;
    if (observer) observer.disconnect();
    try { applyFormat(); } catch (_) {}
    if (observer) observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    applying = false;
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = window.setTimeout(function () {
      scheduled = 0;
      runApply();
    }, 120);
  }

  function start() {
    if (!document.body) { window.setTimeout(start, 60); return; }
    observer = new MutationObserver(function () { scheduleApply(); });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener('storage', function (e) { if (!e || e.key === DATA_KEY) scheduleApply(); });
    window.addEventListener('stepper:worksheet-loaded', scheduleApply);
    window.addEventListener('stepper-pdf-live-apply', scheduleApply);
    // Safety re-apply for renders the observer may miss.
    window.setInterval(scheduleApply, 2000);
    scheduleApply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
