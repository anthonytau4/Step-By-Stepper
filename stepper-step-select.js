/**
 * stepper-step-select.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive step selection, clipboard, find & replace, and insert system
 * for the Step-By-Stepper dance builder.
 *
 * Public API exposed on  window.__stepperStepSelect
 * Install guard:          window.__stepperStepSelectInstalled
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  /* ═══════════════════════════ Install Guard ═══════════════════════════════ */
  if (window.__stepperStepSelectInstalled) return;
  window.__stepperStepSelectInstalled = true;

  /* ═══════════════════════════ Constants ══════════════════════════════════= */
  var DATA_KEY    = 'linedance_builder_data_v13';
  var STYLE_ID    = 'stepper-step-select-styles';
  var TOAST_HOST  = 'stepper-step-select-toast-host';
  var FR_PANEL_ID = 'stepper-find-replace-panel';
  var MAX_TOASTS  = 5;
  var TOAST_TTL   = 2500;      // ms
  var REMAP_DEBOUNCE = 200;    // ms

  /* ═══════════════════════════ Module State ═══════════════════════════════ */
  var selectedSteps   = [];    // [{ sectionIndex, stepIndex }]
  var lastClickedStep = null;  // { sectionIndex, stepIndex } – anchor for shift-click
  var clipboard       = [];    // cloned step objects
  var domMap          = null;  // { rows: [[el, …], …], sectionEls: [el, …] }
  var remapTimer      = null;
  var toastQueue      = [];
  var toastTimer      = null;
  var frState         = { open: false, query: '', replace: '', idx: -1, matches: [], caseSensitive: false };
  var dragState       = { from: null, dragging: false, justDropped: false };

  /* ══════════════════════════ Utility Helpers ═════════════════════════════ */

  function safeParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; }
  }

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function generateId(prefix) {
    return prefix + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  }

  function readData() {
    var d = safeParse(localStorage.getItem(DATA_KEY), null);
    if (!d || typeof d !== 'object') return null;
    return d;
  }

  function writeData(d) {
    if (!d) return;
    localStorage.setItem(DATA_KEY, JSON.stringify(d));
    try { window.dispatchEvent(new Event('storage')); } catch (_) {}
    try { window.dispatchEvent(new CustomEvent('stepper-data-changed')); } catch (_) {}
  }

  function getSections(d) {
    if (!d) return [];
    if (Array.isArray(d.sections)) return d.sections;
    if (Array.isArray(d.dances)) return d.dances;
    return [];
  }

  function setSections(d, secs) {
    if (Array.isArray(d.sections)) { d.sections = secs; return; }
    if (Array.isArray(d.dances))   { d.dances   = secs; return; }
    d.sections = secs;
  }

  function snapshot() {
    var h = window.__stepperHistoryUndoRedo || window.StepByStepperHistory;
    if (h && typeof h.snapshot === 'function') h.snapshot();
    else if (h && typeof h.queueSnapshot === 'function') h.queueSnapshot(0);
  }

  function isDarkMode() {
    try {
      var d = JSON.parse(localStorage.getItem(DATA_KEY) || 'null');
      return !!(d && d.isDarkMode);
    } catch (_) { return false; }
  }

  /* ══════════════════════════ CSS Injection ═══════════════════════════════ */

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = [
      /* ── Selection highlight ── */
      '[data-step-selected="true"] {',
      '  position: relative;',
      '  outline: 2px solid rgba(99,102,241,.55);',
      '  outline-offset: -2px;',
      '  border-left: 3px solid #6366f1;',
      '  background: rgba(99,102,241,.07) !important;',
      '  box-shadow: inset 4px 0 0 #6366f1, 0 0 12px rgba(99,102,241,.12);',
      '  transition: background .18s ease, box-shadow .18s ease, outline .18s ease;',
      '  z-index: 1;',
      '}',
      '.dark [data-step-selected="true"],',
      'body.dark [data-step-selected="true"],',
      'html.dark [data-step-selected="true"] {',
      '  background: rgba(99,102,241,.15) !important;',
      '  outline-color: rgba(129,140,248,.55);',
      '  box-shadow: inset 4px 0 0 #818cf8, 0 0 16px rgba(129,140,248,.18);',
      '}',
      /* ── Checkmark badge ── */
      '[data-step-selected="true"]::after {',
      '  content: "\\2713";',
      '  position: absolute;',
      '  right: 8px;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  width: 22px; height: 22px;',
      '  display: flex; align-items: center; justify-content: center;',
      '  font-size: 13px; font-weight: 700;',
      '  border-radius: 50%;',
      '  background: #6366f1; color: #fff;',
      '  pointer-events: none;',
      '  animation: stepSelPop .22s ease;',
      '}',
      '@keyframes stepSelPop {',
      '  0%   { transform: translateY(-50%) scale(0); }',
      '  60%  { transform: translateY(-50%) scale(1.15); }',
      '  100% { transform: translateY(-50%) scale(1); }',
      '}',
      /* ── Find match highlight ── */
      '[data-step-find-match="true"] {',
      '  box-shadow: 0 0 0 2px rgba(251,191,36,.6), 0 0 10px rgba(251,191,36,.25);',
      '  transition: box-shadow .2s ease;',
      '}',
      '[data-step-find-current="true"] {',
      '  box-shadow: 0 0 0 3px rgba(245,158,11,.85), 0 0 18px rgba(245,158,11,.35);',
      '  background: rgba(251,191,36,.10) !important;',
      '}',
      '.dark [data-step-find-match="true"],',
      'body.dark [data-step-find-match="true"],',
      'html.dark [data-step-find-match="true"] {',
      '  box-shadow: 0 0 0 2px rgba(251,191,36,.45), 0 0 12px rgba(251,191,36,.18);',
      '}',
      /* ── Step dragger handle ── */
      '[data-section-idx] { position: relative; }',
      '.stepper-step-dragger {',
      '  position: absolute;',
      '  left: 8px;',
      '  top: 50%;',
      '  transform: translateY(-50%);',
      '  width: 24px; height: 24px;',
      '  border-radius: 999px;',
      '  border: 1px solid rgba(99,102,241,.25);',
      '  background: rgba(255,255,255,.92);',
      '  color: #4f46e5;',
      '  display: flex; align-items: center; justify-content: center;',
      '  font-size: 13px; font-weight: 900;',
      '  cursor: grab; user-select: none;',
      '  z-index: 3;',
      '}',
      '.stepper-step-dragger:active { cursor: grabbing; }',
      '.dark .stepper-step-dragger,',
      'body.dark .stepper-step-dragger,',
      'html.dark .stepper-step-dragger {',
      '  background: rgba(30,30,46,.92);',
      '  border-color: rgba(129,140,248,.34);',
      '  color: #a5b4fc;',
      '}',
      '[data-step-drop-target="true"] {',
      '  box-shadow: inset 0 0 0 2px rgba(79,70,229,.35), 0 0 0 2px rgba(79,70,229,.12);',
      '}',
      /* ── Toast host ── */
      '#' + TOAST_HOST + ' {',
      '  position: fixed; bottom: max(24px, env(safe-area-inset-bottom, 0px) + 16px); left: 50%; transform: translateX(-50%);',
      '  z-index: 10100; display: flex; flex-direction: column-reverse;',
      '  align-items: center; gap: 8px; pointer-events: none;',
      '}',
      '.stepper-sel-toast {',
      '  pointer-events: auto;',
      '  padding: 10px 22px; border-radius: 14px;',
      '  font-size: 14px; font-weight: 600;',
      '  background: #1e293b; color: #f1f5f9;',
      '  box-shadow: 0 8px 30px rgba(0,0,0,.22);',
      '  animation: stepToastIn .28s ease forwards;',
      '  opacity: 0;',
      '}',
      '.dark .stepper-sel-toast,',
      'body.dark .stepper-sel-toast,',
      'html.dark .stepper-sel-toast {',
      '  background: #334155; color: #e2e8f0;',
      '}',
      '.stepper-sel-toast.out {',
      '  animation: stepToastOut .25s ease forwards;',
      '}',
      '@keyframes stepToastIn {',
      '  0%   { opacity: 0; transform: translateY(14px); }',
      '  100% { opacity: 1; transform: translateY(0); }',
      '}',
      '@keyframes stepToastOut {',
      '  0%   { opacity: 1; transform: translateY(0); }',
      '  100% { opacity: 0; transform: translateY(10px); }',
      '}',
      /* ── Find / Replace panel (glassmorphism) ── */
      '#' + FR_PANEL_ID + ' {',
      '  position: fixed; top: max(14px, env(safe-area-inset-top, 0px) + 8px); left: 50%; transform: translateX(-50%);',
      '  z-index: 10050; width: 440px; max-width: calc(100vw - 24px);',
      '  padding: 16px 20px; border-radius: 18px;',
      '  background: rgba(255,255,255,.82);',
      '  backdrop-filter: blur(18px) saturate(1.4);',
      '  -webkit-backdrop-filter: blur(18px) saturate(1.4);',
      '  border: 1px solid rgba(99,102,241,.18);',
      '  box-shadow: 0 12px 40px rgba(0,0,0,.12);',
      '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      '  animation: frSlideIn .22s ease;',
      '}',
      '.dark #' + FR_PANEL_ID + ',',
      'body.dark #' + FR_PANEL_ID + ',',
      'html.dark #' + FR_PANEL_ID + ' {',
      '  background: rgba(30,30,46,.85);',
      '  border-color: rgba(129,140,248,.22);',
      '  color: #e2e8f0;',
      '}',
      '@keyframes frSlideIn {',
      '  0%   { opacity: 0; transform: translateX(-50%) translateY(-12px); }',
      '  100% { opacity: 1; transform: translateX(-50%) translateY(0); }',
      '}',
      '#' + FR_PANEL_ID + ' input[type="text"] {',
      '  width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #d1d5db;',
      '  font-size: 14px; outline: none; background: #fff; color: #111827; min-height: 40px;',
      '  transition: border-color .15s ease;',
      '}',
      '#' + FR_PANEL_ID + ' input[type="text"]:focus {',
      '  border-color: #6366f1;',
      '}',
      '.dark #' + FR_PANEL_ID + ' input[type="text"],',
      'body.dark #' + FR_PANEL_ID + ' input[type="text"],',
      'html.dark #' + FR_PANEL_ID + ' input[type="text"] {',
      '  background: #1e1e2e; color: #e2e8f0; border-color: #404040;',
      '}',
      '#' + FR_PANEL_ID + ' button {',
      '  padding: 8px 14px; border-radius: 8px; border: 1px solid #d1d5db;',
      '  font-size: 13px; font-weight: 600; cursor: pointer; min-height: 40px;',
      '  background: #f9fafb; color: #374151;',
      '  transition: background .15s, border-color .15s;',
      '}',
      '#' + FR_PANEL_ID + ' button:hover {',
      '  background: #e0e7ff; border-color: #6366f1;',
      '}',
      '.dark #' + FR_PANEL_ID + ' button,',
      'body.dark #' + FR_PANEL_ID + ' button,',
      'html.dark #' + FR_PANEL_ID + ' button {',
      '  background: #2d2d44; color: #e2e8f0; border-color: #404040;',
      '}',
      '.dark #' + FR_PANEL_ID + ' button:hover,',
      'body.dark #' + FR_PANEL_ID + ' button:hover,',
      'html.dark #' + FR_PANEL_ID + ' button:hover {',
      '  background: #3730a3; border-color: #818cf8;',
      '}',
      '#' + FR_PANEL_ID + ' .fr-row {',
      '  display: flex; gap: 6px; align-items: center; margin-bottom: 8px;',
      '}',
      '#' + FR_PANEL_ID + ' .fr-label {',
      '  font-size: 12px; font-weight: 600; min-width: 54px; color: #6b7280;',
      '}',
      '.dark #' + FR_PANEL_ID + ' .fr-label { color: #9ca3af; }',
      '#' + FR_PANEL_ID + ' .fr-status {',
      '  font-size: 12px; color: #6b7280; margin-top: 2px; min-height: 18px;',
      '}',
      '#' + FR_PANEL_ID + ' .fr-close {',
      '  position: absolute; top: 10px; right: 14px;',
      '  background: none; border: none; font-size: 18px; cursor: pointer;',
      '  color: #9ca3af; line-height: 1; padding: 8px; min-width: 36px; min-height: 36px;',
      '  display: flex; align-items: center; justify-content: center;',
      '}',
      '#' + FR_PANEL_ID + ' .fr-close:hover { color: #ef4444; }',
      '#' + FR_PANEL_ID + ' .fr-toggle {',
      '  display: inline-flex; align-items: center; gap: 4px;',
      '  font-size: 11px; cursor: pointer; user-select: none; color: #6b7280;',
      '}',
      '#' + FR_PANEL_ID + ' .fr-toggle input { margin: 0; }',
      '@media (max-width: 480px) {',
      '  #' + FR_PANEL_ID + ' { width: calc(100vw - 16px); padding: 12px 14px; border-radius: 12px; }',
      '  #' + FR_PANEL_ID + ' .fr-row { flex-wrap: wrap; }',
      '  #' + FR_PANEL_ID + ' .fr-label { min-width: 42px; font-size: 11px; }',
      '  #' + FR_PANEL_ID + ' button { font-size: 12px; padding: 8px 10px; }',
      '}',
      '@media (prefers-reduced-motion: reduce) {',
      '  #' + FR_PANEL_ID + ' { animation: none !important; }',
      '  .stepper-sel-toast { animation: none !important; opacity: 1 !important; }',
      '}',
      ''
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ═══════════════════════════ Toast System ═══════════════════════════════ */

  function ensureToastHost() {
    var host = document.getElementById(TOAST_HOST);
    if (host) return host;
    host = document.createElement('div');
    host.id = TOAST_HOST;
    document.body.appendChild(host);
    return host;
  }

  function showToast(msg) {
    if (!msg) return;
    var host = ensureToastHost();
    var el = document.createElement('div');
    el.className = 'stepper-sel-toast';
    el.textContent = msg;
    host.appendChild(el);

    // Enforce max visible toasts
    while (host.children.length > MAX_TOASTS) {
      host.removeChild(host.firstChild);
    }

    // Auto dismiss
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, TOAST_TTL);
  }

  /* ═══════════════════════ DOM-to-Data Mapping ════════════════════════════ */

  /**
   * Scans <main> and identifies section containers + step rows.
   * Tags each step row with data-section-idx / data-step-idx.
   * Returns { rows: [[el,…],…], sectionEls: [el,…] }
   */
  function mapDomSteps() {
    var main = document.querySelector('main');
    if (!main) return null;

    var sectionEls = [];
    var rows = [];

    // Sections are the top-level bordered containers inside main.
    // They typically have .rounded-3xl or .rounded-2xl with a border or shadow.
    var candidates = main.querySelectorAll(
      '.rounded-3xl, .rounded-2xl, [class*="border"][class*="rounded"]'
    );

    // Deduplicate: keep only outermost section containers that are direct-ish children of main
    var seen = new Set();
    var sectionNodes = [];
    for (var i = 0; i < candidates.length; i++) {
      var node = candidates[i];
      // Walk up to ensure no ancestor is also a candidate (pick outermost)
      var dominated = false;
      for (var p = node.parentElement; p && p !== main; p = p.parentElement) {
        if (seen.has(p)) { dominated = true; break; }
      }
      if (!dominated) {
        sectionNodes.push(node);
        seen.add(node);
      }
    }

    // For each section, find step rows.  Step rows are the repeated child divs
    // that represent individual steps – typically inside a space-y container.
    for (var si = 0; si < sectionNodes.length; si++) {
      var sec = sectionNodes[si];
      sectionEls.push(sec);
      var stepRows = [];

      // Look for a space-y container holding individual step rows
      var container = sec.querySelector('[class*="space-y"]') || sec;
      var children = container.children;
      for (var ri = 0; ri < children.length; ri++) {
        var row = children[ri];
        // Skip obvious non-step elements (buttons, headings, inputs used as section title)
        var tag = row.tagName;
        if (tag === 'BUTTON' || tag === 'H1' || tag === 'H2' || tag === 'H3') continue;
        if (row.querySelector('input[placeholder*="Section"]')) continue;
        // Must have some visible content or child inputs to be a step row
        if (row.offsetHeight < 8) continue;

        row.setAttribute('data-section-idx', si);
        row.setAttribute('data-step-idx', stepRows.length);
        ensureDragHandle(row, si, stepRows.length);
        stepRows.push(row);
      }
      rows.push(stepRows);
    }

    domMap = { rows: rows, sectionEls: sectionEls };
    return domMap;
  }

  function scheduleRemap() {
    if (remapTimer) clearTimeout(remapTimer);
    remapTimer = setTimeout(function () {
      remapTimer = null;
      mapDomSteps();
      paintSelection();
    }, REMAP_DEBOUNCE);
  }

  function clearDropTargets() {
    var marks = document.querySelectorAll('[data-step-drop-target="true"]');
    for (var i = 0; i < marks.length; i++) marks[i].removeAttribute('data-step-drop-target');
  }

  function ensureDragHandle(row, si, ri) {
    if (!row || !row.querySelector) return;
    var handle = row.querySelector('.stepper-step-dragger');
    if (!handle) {
      handle = document.createElement('div');
      handle.className = 'stepper-step-dragger';
      handle.textContent = '⋮⋮';
      handle.setAttribute('title', 'Drag step');
      handle.setAttribute('draggable', 'true');
      row.insertBefore(handle, row.firstChild);
    }
    handle.setAttribute('data-drag-sec', String(si));
    handle.setAttribute('data-drag-step', String(ri));
  }

  /* ══════════════════════ Selection Painting ═════════════════════════════ */

  function paintSelection() {
    // Clear all current highlights
    var prev = document.querySelectorAll('[data-step-selected="true"]');
    for (var i = 0; i < prev.length; i++) {
      prev[i].removeAttribute('data-step-selected');
    }

    if (!domMap || !domMap.rows) return;

    for (var k = 0; k < selectedSteps.length; k++) {
      var s = selectedSteps[k];
      if (domMap.rows[s.sectionIndex] && domMap.rows[s.sectionIndex][s.stepIndex]) {
        domMap.rows[s.sectionIndex][s.stepIndex].setAttribute('data-step-selected', 'true');
      }
    }
  }

  /* ═══════════════════════ Selection Helpers ══════════════════════════════ */

  function selectionContains(secIdx, stepIdx) {
    for (var i = 0; i < selectedSteps.length; i++) {
      if (selectedSteps[i].sectionIndex === secIdx && selectedSteps[i].stepIndex === stepIdx) return i;
    }
    return -1;
  }

  /** Compute a flat linear index for a { sectionIndex, stepIndex } to support range selection. */
  function flatIndex(pos) {
    if (!domMap || !domMap.rows) return -1;
    var idx = 0;
    for (var si = 0; si < domMap.rows.length; si++) {
      if (si === pos.sectionIndex) return idx + pos.stepIndex;
      idx += domMap.rows[si].length;
    }
    return -1;
  }

  /** Convert flat index back to { sectionIndex, stepIndex }. */
  function unflatIndex(flat) {
    if (!domMap || !domMap.rows) return null;
    var remaining = flat;
    for (var si = 0; si < domMap.rows.length; si++) {
      if (remaining < domMap.rows[si].length) {
        return { sectionIndex: si, stepIndex: remaining };
      }
      remaining -= domMap.rows[si].length;
    }
    return null;
  }

  function totalStepCount() {
    if (!domMap || !domMap.rows) return 0;
    var c = 0;
    for (var i = 0; i < domMap.rows.length; i++) c += domMap.rows[i].length;
    return c;
  }

  function clearSelection() {
    selectedSteps = [];
    lastClickedStep = null;
    paintSelection();
  }

  function selectAllSteps() {
    if (!domMap || !domMap.rows) mapDomSteps();
    if (!domMap || !domMap.rows) return;
    selectedSteps = [];
    for (var si = 0; si < domMap.rows.length; si++) {
      for (var ri = 0; ri < domMap.rows[si].length; ri++) {
        selectedSteps.push({ sectionIndex: si, stepIndex: ri });
      }
    }
    paintSelection();
    showToast('Selected all ' + selectedSteps.length + ' steps');
  }

  /* ═══════════════════════ Click Handler ══════════════════════════════════ */

  function handleStepClick(e) {
    if (dragState.justDropped) {
      dragState.justDropped = false;
      e.preventDefault();
      return;
    }
    // Walk up from target to find a step row with data-section-idx
    var row = e.target.closest('[data-section-idx]');
    if (!row) return;

    // Don't intercept clicks on inputs, buttons, textareas, selects inside the row
    var targetTag = e.target.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT' ||
        targetTag === 'BUTTON' || e.target.closest('button')) {
      return;
    }

    var secIdx  = parseInt(row.getAttribute('data-section-idx'), 10);
    var stepIdx = parseInt(row.getAttribute('data-step-idx'), 10);
    if (isNaN(secIdx) || isNaN(stepIdx)) return;

    var pos = { sectionIndex: secIdx, stepIndex: stepIdx };

    if (e.ctrlKey || e.metaKey) {
      // Toggle individual step
      var existing = selectionContains(secIdx, stepIdx);
      if (existing >= 0) {
        selectedSteps.splice(existing, 1);
      } else {
        selectedSteps.push(pos);
      }
      lastClickedStep = pos;
    } else if (e.shiftKey && lastClickedStep) {
      // Range select from lastClickedStep to pos
      var startFlat = flatIndex(lastClickedStep);
      var endFlat   = flatIndex(pos);
      if (startFlat < 0 || endFlat < 0) {
        selectedSteps = [pos];
      } else {
        var lo = Math.min(startFlat, endFlat);
        var hi = Math.max(startFlat, endFlat);
        selectedSteps = [];
        for (var f = lo; f <= hi; f++) {
          var p = unflatIndex(f);
          if (p) selectedSteps.push(p);
        }
      }
    } else {
      // Single select
      selectedSteps = [pos];
      lastClickedStep = pos;
    }

    paintSelection();
    e.preventDefault();
  }

  /* ═══════════════════ Clipboard Operations ══════════════════════════════ */

  function sortedSelection() {
    return selectedSteps.slice().sort(function (a, b) {
      return a.sectionIndex !== b.sectionIndex
        ? a.sectionIndex - b.sectionIndex
        : a.stepIndex - b.stepIndex;
    });
  }

  function copySelectedSteps() {
    if (!selectedSteps.length) { showToast('No steps selected'); return; }
    var data = readData();
    if (!data) return;
    var secs = getSections(data);
    clipboard = [];
    var textLines = [];
    var sorted = sortedSelection();

    for (var i = 0; i < sorted.length; i++) {
      var s = sorted[i];
      var sec = secs[s.sectionIndex];
      if (!sec || !sec.steps || !sec.steps[s.stepIndex]) continue;
      var step = clone(sec.steps[s.stepIndex]);
      clipboard.push(step);
      textLines.push((step.name || '(unnamed)') + (step.description ? ' – ' + step.description : ''));
    }

    // Attempt system clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { navigator.clipboard.writeText(textLines.join('\n')); } catch (_) {}
    }

    showToast('Copied ' + clipboard.length + ' step' + (clipboard.length !== 1 ? 's' : ''));
  }

  function cutSelectedSteps() {
    if (!selectedSteps.length) { showToast('No steps selected'); return; }
    copySelectedSteps();
    var count = clipboard.length;
    deleteSelectedStepsInternal(false);
    showToast('Cut ' + count + ' step' + (count !== 1 ? 's' : ''));
  }

  function pasteSteps() {
    if (!clipboard.length) { showToast('Clipboard is empty'); return; }
    var data = readData();
    if (!data) return;
    var secs = getSections(data);
    if (!secs.length) return;

    snapshot();

    // Determine insertion point: after last selected step, or end of first section
    var insertSec = 0;
    var insertIdx = secs[0] && secs[0].steps ? secs[0].steps.length : 0;

    if (selectedSteps.length) {
      var sorted = sortedSelection();
      var last = sorted[sorted.length - 1];
      insertSec = last.sectionIndex;
      insertIdx = last.stepIndex + 1;
    }

    if (!secs[insertSec]) return;
    if (!secs[insertSec].steps) secs[insertSec].steps = [];

    // Clone clipboard items with fresh IDs
    var newSteps = [];
    for (var i = 0; i < clipboard.length; i++) {
      var s = clone(clipboard[i]);
      s.id = generateId('step-');
      newSteps.push(s);
    }

    // Splice into section
    var args = [insertIdx, 0].concat(newSteps);
    Array.prototype.splice.apply(secs[insertSec].steps, args);

    setSections(data, secs);
    writeData(data);
    clearSelection();

    // Select newly pasted steps
    for (var j = 0; j < newSteps.length; j++) {
      selectedSteps.push({ sectionIndex: insertSec, stepIndex: insertIdx + j });
    }
    scheduleRemap();
    showToast('Pasted ' + newSteps.length + ' step' + (newSteps.length !== 1 ? 's' : ''));
  }

  /**
   * Internal delete – skips toast when called from cutSelectedSteps.
   */
  function deleteSelectedStepsInternal(showMsg) {
    if (!selectedSteps.length) {
      if (showMsg) showToast('No steps selected');
      return 0;
    }
    var data = readData();
    if (!data) return 0;
    var secs = getSections(data);

    snapshot();

    // Group by section, then delete in reverse order to keep indices stable
    var sorted = sortedSelection().reverse();
    var count = 0;
    for (var i = 0; i < sorted.length; i++) {
      var s = sorted[i];
      var sec = secs[s.sectionIndex];
      if (!sec || !sec.steps) continue;
      if (s.stepIndex >= 0 && s.stepIndex < sec.steps.length) {
        sec.steps.splice(s.stepIndex, 1);
        count++;
      }
    }

    setSections(data, secs);
    writeData(data);
    clearSelection();
    scheduleRemap();

    if (showMsg && count) {
      showToast('Deleted ' + count + ' step' + (count !== 1 ? 's' : ''));
    }
    return count;
  }

  function deleteSelectedSteps() {
    deleteSelectedStepsInternal(true);
  }

  function moveStep(fromSec, fromIdx, toSec, toIdx) {
    var data = readData();
    if (!data) return false;
    var secs = getSections(data);
    var srcSec = secs[fromSec];
    var dstSec = secs[toSec];
    if (!srcSec || !Array.isArray(srcSec.steps) || !dstSec || !Array.isArray(dstSec.steps)) return false;
    if (fromIdx < 0 || fromIdx >= srcSec.steps.length) return false;
    if (toIdx < 0) toIdx = 0;
    if (toIdx > dstSec.steps.length) toIdx = dstSec.steps.length;

    snapshot();
    var moved = srcSec.steps.splice(fromIdx, 1)[0];
    if (fromSec === toSec && fromIdx < toIdx) toIdx--;
    moved.count = 'x';
    if (typeof moved.counts === 'string') moved.counts = 'x';
    dstSec.steps.splice(toIdx, 0, moved);

    setSections(data, secs);
    writeData(data);
    selectedSteps = [{ sectionIndex: toSec, stepIndex: toIdx }];
    scheduleRemap();
    showToast('Step moved');
    return true;
  }

  /* ═══════════════════════ Insert Operations ═════════════════════════════ */

  function makeStepTemplate() {
    return {
      id: generateId('step-'),
      type: 'step',
      count: '1',
      name: '',
      description: '',
      foot: 'Right',
      weight: true,
      showNote: false,
      note: ''
    };
  }

  function makeSectionTemplate() {
    return {
      id: generateId('section-'),
      name: 'New Section',
      steps: []
    };
  }

  function insertStep(afterSectionIdx, afterStepIdx) {
    var data = readData();
    if (!data) return;
    var secs = getSections(data);
    if (!secs.length) return;

    snapshot();

    // Default: after selection or at end of first section
    var secIdx  = 0;
    var stepIdx = secs[0] && secs[0].steps ? secs[0].steps.length : 0;

    if (typeof afterSectionIdx === 'number' && typeof afterStepIdx === 'number') {
      secIdx  = afterSectionIdx;
      stepIdx = afterStepIdx + 1;
    } else if (selectedSteps.length) {
      var sorted = sortedSelection();
      var last = sorted[sorted.length - 1];
      secIdx  = last.sectionIndex;
      stepIdx = last.stepIndex + 1;
    }

    if (!secs[secIdx]) return;
    if (!secs[secIdx].steps) secs[secIdx].steps = [];

    var newStep = makeStepTemplate();
    secs[secIdx].steps.splice(stepIdx, 0, newStep);

    setSections(data, secs);
    writeData(data);
    clearSelection();
    selectedSteps = [{ sectionIndex: secIdx, stepIndex: stepIdx }];
    scheduleRemap();
    showToast('Inserted new step');
  }

  function insertSection() {
    var data = readData();
    if (!data) return;
    var secs = getSections(data);

    snapshot();

    var insertIdx = secs.length;
    if (selectedSteps.length) {
      var sorted = sortedSelection();
      insertIdx = sorted[sorted.length - 1].sectionIndex + 1;
    }

    var sec = makeSectionTemplate();
    secs.splice(insertIdx, 0, sec);

    setSections(data, secs);
    writeData(data);
    clearSelection();
    scheduleRemap();
    showToast('Inserted new section');
  }

  /* ═══════════════════════ Format Operations ═════════════════════════════ */

  function toggleDescriptionMarkers(prefix, suffix) {
    if (!selectedSteps.length) { showToast('No steps selected'); return; }
    var data = readData();
    if (!data) return;
    var secs = getSections(data);

    snapshot();

    var sorted = sortedSelection();
    for (var i = 0; i < sorted.length; i++) {
      var s = sorted[i];
      var sec = secs[s.sectionIndex];
      if (!sec || !sec.steps || !sec.steps[s.stepIndex]) continue;
      var step = sec.steps[s.stepIndex];
      var desc = step.description || '';
      if (desc.startsWith(prefix) && desc.endsWith(suffix) && desc.length >= prefix.length + suffix.length) {
        step.description = desc.slice(prefix.length, desc.length - suffix.length);
      } else {
        step.description = prefix + desc + suffix;
      }
    }

    setSections(data, secs);
    writeData(data);
    scheduleRemap();
  }

  function formatBold()       { toggleDescriptionMarkers('**', '**'); }
  function formatItalic()     { toggleDescriptionMarkers('*', '*'); }
  function formatUnderline()  { toggleDescriptionMarkers('__', '__'); }
  function formatStrikethrough() { toggleDescriptionMarkers('~~', '~~'); }

  function clearFormatting() {
    if (!selectedSteps.length) { showToast('No steps selected'); return; }
    var data = readData();
    if (!data) return;
    var secs = getSections(data);

    snapshot();

    var sorted = sortedSelection();
    for (var i = 0; i < sorted.length; i++) {
      var s = sorted[i];
      var sec = secs[s.sectionIndex];
      if (!sec || !sec.steps || !sec.steps[s.stepIndex]) continue;
      var step = sec.steps[s.stepIndex];
      if (step.description) {
        step.description = String(step.description)
          .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
          .replace(/(^|[^*])\*([^*][\s\S]*?)\*(?!\*)/g, '$1$2')
          .replace(/__([\s\S]*?)__/g, '$1')
          .replace(/~~([\s\S]*?)~~/g, '$1')
          .replace(/==([\s\S]*?)==/g, '$1')
          .replace(/`([^`]+)`/g, '$1')
          .replace(/\/\*([\s\S]*?)\*\//g, '$1')
          .replace(/_([^_][\s\S]*?)_/g, '$1');
      }
    }

    setSections(data, secs);
    writeData(data);
    scheduleRemap();
    showToast('Cleared formatting');
  }

  /* ══════════════════════ Find & Replace System ══════════════════════════ */

  function buildMatchList() {
    var data = readData();
    if (!data) { frState.matches = []; return; }
    var secs = getSections(data);
    var q = frState.query;
    if (!q) { frState.matches = []; return; }
    if (!frState.caseSensitive) q = q.toLowerCase();

    var matches = [];
    for (var si = 0; si < secs.length; si++) {
      var sec = secs[si];
      if (!sec || !sec.steps) continue;
      for (var ri = 0; ri < sec.steps.length; ri++) {
        var step = sec.steps[ri];
        var hayName = frState.caseSensitive ? (step.name || '') : (step.name || '').toLowerCase();
        var hayDesc = frState.caseSensitive ? (step.description || '') : (step.description || '').toLowerCase();
        if (hayName.indexOf(q) >= 0 || hayDesc.indexOf(q) >= 0) {
          matches.push({ sectionIndex: si, stepIndex: ri });
        }
      }
    }
    frState.matches = matches;
  }

  function paintFindHighlights() {
    // Clear previous highlights
    var prevMatch   = document.querySelectorAll('[data-step-find-match]');
    var prevCurrent = document.querySelectorAll('[data-step-find-current]');
    for (var i = 0; i < prevMatch.length; i++)   prevMatch[i].removeAttribute('data-step-find-match');
    for (var j = 0; j < prevCurrent.length; j++) prevCurrent[j].removeAttribute('data-step-find-current');

    if (!domMap || !domMap.rows || !frState.matches.length) return;

    for (var k = 0; k < frState.matches.length; k++) {
      var m = frState.matches[k];
      var row = domMap.rows[m.sectionIndex] && domMap.rows[m.sectionIndex][m.stepIndex];
      if (row) {
        row.setAttribute('data-step-find-match', 'true');
        if (k === frState.idx) {
          row.setAttribute('data-step-find-current', 'true');
          try { row.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (_) {}
        }
      }
    }
  }

  function updateFrStatus() {
    var panel = document.getElementById(FR_PANEL_ID);
    if (!panel) return;
    var statusEl = panel.querySelector('.fr-status');
    if (!statusEl) return;

    if (!frState.query) {
      statusEl.textContent = '';
    } else if (!frState.matches.length) {
      statusEl.textContent = 'No matches found';
    } else {
      statusEl.textContent = (frState.idx + 1) + ' of ' + frState.matches.length + ' matches';
    }
  }

  function findNext() {
    buildMatchList();
    if (!frState.matches.length) { frState.idx = -1; paintFindHighlights(); updateFrStatus(); return; }
    frState.idx = (frState.idx + 1) % frState.matches.length;
    paintFindHighlights();
    updateFrStatus();
  }

  function findPrev() {
    buildMatchList();
    if (!frState.matches.length) { frState.idx = -1; paintFindHighlights(); updateFrStatus(); return; }
    frState.idx = (frState.idx - 1 + frState.matches.length) % frState.matches.length;
    paintFindHighlights();
    updateFrStatus();
  }

  function replaceCurrent() {
    if (frState.idx < 0 || frState.idx >= frState.matches.length) { showToast('No match selected'); return; }
    var data = readData();
    if (!data) return;
    var secs = getSections(data);

    snapshot();

    var m    = frState.matches[frState.idx];
    var sec  = secs[m.sectionIndex];
    if (!sec || !sec.steps || !sec.steps[m.stepIndex]) return;
    var step = sec.steps[m.stepIndex];

    var q = frState.query;
    var r = frState.replace;
    step.name        = replaceInString(step.name || '',        q, r, frState.caseSensitive);
    step.description = replaceInString(step.description || '', q, r, frState.caseSensitive);

    setSections(data, secs);
    writeData(data);
    scheduleRemap();

    // Rebuild matches (one replaced — it may no longer match)
    buildMatchList();
    if (frState.idx >= frState.matches.length) frState.idx = Math.max(0, frState.matches.length - 1);
    paintFindHighlights();
    updateFrStatus();
    showToast('Replaced 1 match');
  }

  function replaceAll() {
    buildMatchList();
    if (!frState.matches.length) { showToast('No matches to replace'); return; }
    var data = readData();
    if (!data) return;
    var secs = getSections(data);

    snapshot();

    var count = 0;
    var q = frState.query;
    var r = frState.replace;

    for (var i = 0; i < frState.matches.length; i++) {
      var m = frState.matches[i];
      var sec = secs[m.sectionIndex];
      if (!sec || !sec.steps || !sec.steps[m.stepIndex]) continue;
      var step = sec.steps[m.stepIndex];
      step.name        = replaceInString(step.name || '',        q, r, frState.caseSensitive);
      step.description = replaceInString(step.description || '', q, r, frState.caseSensitive);
      count++;
    }

    setSections(data, secs);
    writeData(data);
    scheduleRemap();

    frState.matches = [];
    frState.idx = -1;
    paintFindHighlights();
    updateFrStatus();
    showToast('Replaced ' + count + ' match' + (count !== 1 ? 'es' : ''));
  }

  /** Case-aware first-occurrence replacement. */
  function replaceInString(str, query, replacement, caseSensitive) {
    if (!str || !query) return str;
    if (caseSensitive) {
      var idx = str.indexOf(query);
      if (idx < 0) return str;
      return str.slice(0, idx) + replacement + str.slice(idx + query.length);
    }
    var lower = str.toLowerCase();
    var qLower = query.toLowerCase();
    var idx2 = lower.indexOf(qLower);
    if (idx2 < 0) return str;
    return str.slice(0, idx2) + replacement + str.slice(idx2 + query.length);
  }

  /* ── Find / Replace Panel DOM ── */

  function openFindReplace() {
    if (document.getElementById(FR_PANEL_ID)) {
      // Already open — focus search input
      var existingInput = document.querySelector('#' + FR_PANEL_ID + ' input[data-fr-search]');
      if (existingInput) existingInput.focus();
      return;
    }

    frState.open = true;
    frState.idx = -1;
    frState.matches = [];

    var panel = document.createElement('div');
    panel.id = FR_PANEL_ID;
    panel.innerHTML = [
      '<button class="fr-close" title="Close (Esc)">&times;</button>',
      '<div class="fr-row">',
      '  <span class="fr-label">Find</span>',
      '  <input type="text" data-fr-search placeholder="Search steps\u2026" autocomplete="off" />',
      '</div>',
      '<div class="fr-row">',
      '  <span class="fr-label">Replace</span>',
      '  <input type="text" data-fr-replace placeholder="Replace with\u2026" autocomplete="off" />',
      '</div>',
      '<div class="fr-row" style="flex-wrap:wrap;">',
      '  <button data-fr-prev title="Find Previous (Shift+Enter)">&lsaquo; Prev</button>',
      '  <button data-fr-next title="Find Next (Enter)">Next &rsaquo;</button>',
      '  <button data-fr-replace-btn>Replace</button>',
      '  <button data-fr-replace-all>Replace All</button>',
      '  <label class="fr-toggle"><input type="checkbox" data-fr-case /> Aa</label>',
      '</div>',
      '<div class="fr-status"></div>'
    ].join('\n');

    document.body.appendChild(panel);

    // Wire events
    var searchInput  = panel.querySelector('[data-fr-search]');
    var replaceInput = panel.querySelector('[data-fr-replace]');
    var caseCheck    = panel.querySelector('[data-fr-case]');

    searchInput.addEventListener('input', function () {
      frState.query = searchInput.value;
      frState.idx = -1;
      buildMatchList();
      paintFindHighlights();
      updateFrStatus();
    });

    replaceInput.addEventListener('input', function () {
      frState.replace = replaceInput.value;
    });

    caseCheck.addEventListener('change', function () {
      frState.caseSensitive = caseCheck.checked;
      frState.idx = -1;
      buildMatchList();
      paintFindHighlights();
      updateFrStatus();
    });

    // Keyboard inside search: Enter = next, Shift+Enter = prev
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) findPrev(); else findNext();
      }
      if (e.key === 'Escape') { e.preventDefault(); closeFindReplace(); }
    });

    replaceInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeFindReplace(); }
    });

    panel.querySelector('[data-fr-next]').addEventListener('click', findNext);
    panel.querySelector('[data-fr-prev]').addEventListener('click', findPrev);
    panel.querySelector('[data-fr-replace-btn]').addEventListener('click', replaceCurrent);
    panel.querySelector('[data-fr-replace-all]').addEventListener('click', replaceAll);
    panel.querySelector('.fr-close').addEventListener('click', closeFindReplace);

    searchInput.focus();
  }

  function closeFindReplace() {
    var panel = document.getElementById(FR_PANEL_ID);
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    frState.open = false;
    frState.query = '';
    frState.replace = '';
    frState.idx = -1;
    frState.matches = [];
    paintFindHighlights();
  }

  /* ═══════════════════ Keyboard Shortcuts ════════════════════════════════ */

  function isEditorVisible() {
    var main = document.querySelector('main');
    return !!(main && main.offsetHeight > 0);
  }

  function isTypingInField(e) {
    if (!e || !e.target) return false;
    var tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (e.target.isContentEditable) return true;
    return false;
  }

  function handleKeydown(e) {
    // Allow Find/Replace panel-specific shortcuts to pass through
    if (e.target && e.target.closest('#' + FR_PANEL_ID)) return;

    var ctrl = e.ctrlKey || e.metaKey;

    // Ctrl+A – Select all steps
    if (ctrl && e.key === 'a' && !e.shiftKey && isEditorVisible() && !isTypingInField(e)) {
      e.preventDefault();
      selectAllSteps();
      return;
    }

    // Ctrl+C – Copy
    if (ctrl && e.key === 'c' && !e.shiftKey && selectedSteps.length && !isTypingInField(e)) {
      e.preventDefault();
      copySelectedSteps();
      return;
    }

    // Ctrl+X – Cut
    if (ctrl && e.key === 'x' && !e.shiftKey && selectedSteps.length && !isTypingInField(e)) {
      e.preventDefault();
      cutSelectedSteps();
      return;
    }

    // Ctrl+V – Paste
    if (ctrl && e.key === 'v' && !e.shiftKey && clipboard.length && !isTypingInField(e)) {
      e.preventDefault();
      pasteSteps();
      return;
    }

    // Ctrl+H – Find & Replace
    if (ctrl && e.key === 'h' && !e.shiftKey) {
      e.preventDefault();
      openFindReplace();
      return;
    }

    // Ctrl+F – Find
    if (ctrl && e.key === 'f' && !e.shiftKey && isEditorVisible()) {
      e.preventDefault();
      openFindReplace();
      return;
    }

    // Delete / Backspace – Delete selected steps
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSteps.length && !isTypingInField(e)) {
      e.preventDefault();
      deleteSelectedSteps();
      return;
    }

    // Ctrl+B – Bold
    if (ctrl && e.key === 'b' && !e.shiftKey && selectedSteps.length && !isTypingInField(e)) {
      e.preventDefault();
      formatBold();
      return;
    }

    // Ctrl+I – Italic
    if (ctrl && e.key === 'i' && !e.shiftKey && selectedSteps.length && !isTypingInField(e)) {
      e.preventDefault();
      formatItalic();
      return;
    }

    // Ctrl+U – Underline
    if (ctrl && e.key === 'u' && !e.shiftKey && selectedSteps.length && !isTypingInField(e)) {
      e.preventDefault();
      formatUnderline();
      return;
    }

    // Ctrl+Shift+X – Strikethrough
    if (ctrl && (e.key === 'X' || (e.key === 'x' && e.shiftKey)) && selectedSteps.length && !isTypingInField(e)) {
      e.preventDefault();
      formatStrikethrough();
      return;
    }

    // Escape – close find/replace or clear selection
    if (e.key === 'Escape') {
      if (frState.open) {
        closeFindReplace();
      } else if (selectedSteps.length) {
        clearSelection();
      }
      return;
    }
  }

  /* ═════════════════════ Initialization ══════════════════════════════════ */

  function init() {
    injectStyles();

    // Click handler on main for step selection
    document.addEventListener('click', handleStepClick, true);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeydown, true);

    document.addEventListener('dragstart', function (e) {
      var handle = e.target && e.target.closest ? e.target.closest('.stepper-step-dragger') : null;
      if (!handle) return;
      var sec = parseInt(handle.getAttribute('data-drag-sec'), 10);
      var step = parseInt(handle.getAttribute('data-drag-step'), 10);
      if (isNaN(sec) || isNaN(step)) return;
      dragState.from = { sectionIndex: sec, stepIndex: step };
      dragState.dragging = true;
      try { e.dataTransfer.effectAllowed = 'move'; } catch (_) {}
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }, true);

    document.addEventListener('dragover', function (e) {
      if (!dragState.dragging) return;
      var row = e.target && e.target.closest ? e.target.closest('[data-section-idx]') : null;
      if (!row) return;
      e.preventDefault();
      clearDropTargets();
      row.setAttribute('data-step-drop-target', 'true');
      try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}
    }, true);

    document.addEventListener('drop', function (e) {
      if (!dragState.dragging || !dragState.from) return;
      var row = e.target && e.target.closest ? e.target.closest('[data-section-idx]') : null;
      clearDropTargets();
      if (row) {
        e.preventDefault();
        var toSec = parseInt(row.getAttribute('data-section-idx'), 10);
        var toStep = parseInt(row.getAttribute('data-step-idx'), 10);
        if (!isNaN(toSec) && !isNaN(toStep)) {
          moveStep(dragState.from.sectionIndex, dragState.from.stepIndex, toSec, toStep);
          dragState.justDropped = true;
        }
      }
      dragState.dragging = false;
      dragState.from = null;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }, true);

    document.addEventListener('dragend', function () {
      clearDropTargets();
      dragState.dragging = false;
      dragState.from = null;
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }, true);

    // Initial DOM mapping (retry until main exists)
    function tryMap() {
      var main = document.querySelector('main');
      if (!main) { setTimeout(tryMap, 500); return; }
      mapDomSteps();

      // MutationObserver to re-map when React re-renders
      if (!main.__stepperStepSelectObserver) {
        main.__stepperStepSelectObserver = new MutationObserver(function () {
          scheduleRemap();
        });
        main.__stepperStepSelectObserver.observe(main, {
          childList: true,
          subtree: true,
          attributes: false
        });
      }
    }
    tryMap();

    // Also listen for storage/data changes to remap
    window.addEventListener('storage', scheduleRemap);
    window.addEventListener('stepper-data-changed', scheduleRemap);
  }

  /* ═══════════════════════ Public API ════════════════════════════════════ */

  window.__stepperStepSelect = {
    copySelectedSteps:   copySelectedSteps,
    cutSelectedSteps:    cutSelectedSteps,
    pasteSteps:          pasteSteps,
    deleteSelectedSteps: deleteSelectedSteps,
    selectAllSteps:      selectAllSteps,
    clearSelection:      clearSelection,
    openFindReplace:     openFindReplace,
    closeFindReplace:    closeFindReplace,
    insertStep:          insertStep,
    insertSection:       insertSection,
    formatBold:          formatBold,
    formatItalic:        formatItalic,
    formatUnderline:     formatUnderline,
    formatStrikethrough: formatStrikethrough,
    clearFormatting:     clearFormatting,
    getSelection:        function () { return selectedSteps; },
    hasSelection:        function () { return selectedSteps.length > 0; },
    showToast:           showToast
  };

  /* ── Boot ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
