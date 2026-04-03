/**
 * stepper-pdf-tab.js
 * ─────────────────────────────────────────────────────────────
 * Dedicated PDF Import tab for Step-By-Stepper.
 *
 * Capabilities:
 *   - Drag-and-drop PDF upload with enhanced visual overlay
 *   - Multi-phase parse progress with elapsed-time indicator
 *   - Parsed results preview (title, choreographer, steps table)
 *   - Step confidence indicator via dictionary lookup
 *   - Inline step name editing with direct parsedData mutation
 *   - File information panel (size, type, timestamp)
 *   - Step statistics panel (unique, total, most common, average)
 *   - Compare view against current worksheet steps
 *   - Download parsed data as JSON
 *   - Copy steps to clipboard (tab-separated)
 *   - Export steps as Markdown stepsheet
 *   - Re-import from history snapshots
 *   - Keyboard shortcuts (Escape to reset, Enter to apply)
 *   - One-click "Apply to Editor" action
 *   - Import history with snapshot reload
 *
 * Works with stepper-pdf-import-core.js for actual parsing
 * and normalization.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperPdfTabInstalled) return;
  window.__stepperPdfTabInstalled = true;

  var _ic = window.__stepperIcons || {};

  /* ── Constants ────────────────────────────────────────────── */
  var PAGE_ID     = 'stepper-pdf-page';
  var TAB_ID      = 'stepper-pdf-tab';
  var HISTORY_KEY = 'stepper_pdf_import_history_v1';
  var EDITOR_KEY  = 'linedance_builder_data_v13';
  var MAX_HISTORY = 20;
  var MAX_FILE_MB = 10;

  /* Header style constants */
  var TH_STYLE = 'padding:10px 14px;text-align:left;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.08em;';

  /* ── Local state ──────────────────────────────────────────── */
  var pdfState = {
    status: 'idle',
    statusMessage: '',
    file: null,
    fileName: '',
    fileSize: 0,
    fileType: '',
    uploadTimestamp: null,
    parsedData: null,
    importHistory: [],
    dragging: false,
    error: null,
    parseStartTime: null
  };

  /* ── Persistence ──────────────────────────────────────────── */
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch (_) { return fallback; }
  }
  function saveJSON(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) { /* quota */ }
  }
  function loadHistory() { return loadJSON(HISTORY_KEY, []); }
  function saveHistory(history) {
    saveJSON(HISTORY_KEY, (history || []).slice(0, MAX_HISTORY));
  }

  pdfState.importHistory = loadHistory();

  /* ── Theme helper ─────────────────────────────────────────── */
  function isDarkMode() {
    try {
      var data = JSON.parse(localStorage.getItem(EDITOR_KEY) || 'null');
      return !!(data && data.isDarkMode);
    } catch (_) { return false; }
  }

  function themeClasses() {
    var dark = isDarkMode();
    return {
      dark: dark,
      shell:   dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      panel:   dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      soft:    dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      subtle:  dark ? 'text-neutral-400' : 'text-neutral-500',
      success: dark ? 'bg-green-500/15 border-green-400/30 text-green-200' : 'bg-green-50 border-green-200 text-green-700',
      danger:  dark ? 'bg-red-500/15 border-red-400/30 text-red-200'      : 'bg-red-50 border-red-200 text-red-700',
      cardBg:  dark ? 'background:#1a1a2e;border-color:#2d2d44;' : 'background:#ffffff;border-color:#e5e7eb;',
      inputBg: dark ? 'background:#111827;border-color:#374151;color:#f3f4f6;' : 'background:#ffffff;border-color:#d1d5db;color:#111827;',
      dropzone:       dark ? 'border-color:#374151;background:#111827;' : 'border-color:#d1d5db;background:#fafbfc;',
      dropzoneActive: 'border-color:#4f46e5!important;background:rgba(79,70,229,.06)!important;',
      chipBg:  dark ? 'background:#1f2937;border-color:#374151;color:#d1d5db;' : 'background:#f9fafb;border-color:#e5e7eb;color:#374151;',
      rowAlt:  dark ? 'background:#111827;' : 'background:#f9fafb;',
      headBg:  dark ? 'background:#1e293b;' : 'background:#f9fafb;',
      tipBg:   dark ? 'background:#1e293b;' : 'background:#f0f4ff;',
      hoverBg: dark ? 'background:#1e293b;' : 'background:#f0f4ff;'
    };
  }

  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = String(text || '');
    return el.innerHTML;
  }

  /* ── Utility helpers ──────────────────────────────────────── */
  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '0 B';
    var units = ['B', 'KB', 'MB', 'GB'];
    var i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
  }

  function formatElapsed(ms) {
    if (!ms || ms < 0) return '0s';
    var s = Math.floor(ms / 1000);
    return s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + (s % 60) + 's';
  }

  function ic(name) {
    return _ic[name] || '';
  }

  /* ── Import-core references ───────────────────────────────── */
  function getImportCore() { return window.StepperPdfImportCore || null; }
  function getImportRuntime() { return window.StepperPdfImportRuntime || null; }

  /* ── Step dictionary lookup ───────────────────────────────── */
  function getStepConfidence(stepName) {
    var dict = window.__stepperStepDictionary;
    if (!dict || typeof dict.findBestMatch !== 'function') return { level: 'low', label: 'Low', color: '#ef4444' };
    var normalized = String(stepName || '').trim();
    if (!normalized) return { level: 'low', label: 'Low', color: '#ef4444' };
    var result = dict.findBestMatch(normalized);
    if (!result) return { level: 'low', label: 'Low', color: '#ef4444' };
    var score = result.score || 0;
    if (score >= 0.72) return { level: 'high', label: 'High', color: '#22c55e' };
    if (score >= 0.4)  return { level: 'medium', label: 'Medium', color: '#f59e0b' };
    return { level: 'low', label: 'Low', color: '#ef4444' };
  }

  /* ── Worksheet comparison ─────────────────────────────────── */
  function getWorksheetSteps() {
    try {
      var raw = JSON.parse(localStorage.getItem(EDITOR_KEY) || 'null');
      if (!raw || !raw.sections) return [];
      var names = [];
      for (var i = 0; i < raw.sections.length; i++) {
        var sec = raw.sections[i];
        if (!sec.steps) continue;
        for (var j = 0; j < sec.steps.length; j++) {
          var n = (sec.steps[j].name || sec.steps[j].description || '').trim().toLowerCase();
          if (n) names.push(n);
        }
      }
      return names;
    } catch (_) { return []; }
  }

  function computeComparison(steps) {
    var wsSteps = getWorksheetSteps();
    if (!wsSteps.length || !steps.length) return null;
    var wsSet = {};
    for (var i = 0; i < wsSteps.length; i++) wsSet[wsSteps[i]] = true;
    var matching = 0, different = 0;
    var importedNames = {};
    for (var j = 0; j < steps.length; j++) {
      var n = (steps[j].name || steps[j].description || '').trim().toLowerCase();
      if (!n) continue;
      importedNames[n] = true;
      if (wsSet[n]) matching++; else different++;
    }
    var newInWs = 0;
    for (var k in wsSet) {
      if (wsSet.hasOwnProperty(k) && !importedNames[k]) newInWs++;
    }
    return { matching: matching, different: different, onlyInWorksheet: newInWs, total: steps.length };
  }

  /* ── Step statistics ──────────────────────────────────────── */
  function computeStats(steps) {
    if (!steps || !steps.length) return null;
    var freq = {};
    for (var i = 0; i < steps.length; i++) {
      var n = (steps[i].name || steps[i].description || '').trim();
      if (!n) continue;
      freq[n] = (freq[n] || 0) + 1;
    }
    var keys = Object.keys(freq);
    var unique = keys.length;
    var total = steps.length;
    var mostCommon = '';
    var mostCount = 0;
    for (var j = 0; j < keys.length; j++) {
      if (freq[keys[j]] > mostCount) { mostCommon = keys[j]; mostCount = freq[keys[j]]; }
    }
    return {
      unique: unique,
      total: total,
      mostCommon: mostCommon,
      mostCommonCount: mostCount,
      avgPerStep: unique > 0 ? (total / unique).toFixed(1) : '0'
    };
  }

  /* ════════════════════════════════════════════════════════════
     RENDER — MAIN
     ════════════════════════════════════════════════════════════ */
  function renderPdfPage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) return;
    if (page.hidden || page.style.display === 'none') return;

    var theme = themeClasses();
    var html = '';

    html += '<div class="rounded-3xl border shadow-sm overflow-hidden ' + theme.shell + '" style="transition:all .3s ease;">';

    /* ── Header ── */
    html += '<div class="px-6 py-5 border-b ' + theme.panel + '">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<span style="font-size:28px;">' + ic('document') + '</span>';
    html += '<div style="flex:1;">';
    html += '<h2 style="font-size:20px;font-weight:900;margin:0;letter-spacing:-.01em;">IMPORT PDF STEPSHEET</h2>';
    html += '<p class="' + theme.subtle + '" style="font-size:12px;margin:2px 0 0;">Upload a PDF dance stepsheet and auto-import all steps</p>';
    html += '</div>';
    /* Keyboard shortcut hints */
    html += '<div style="display:flex;gap:6px;align-items:center;">';
    html += renderKbdPill('ESC', 'Reset', theme);
    html += renderKbdPill('ENTER', 'Apply', theme);
    html += '</div>';
    html += '</div></div>';

    /* ── Body ── */
    html += '<div class="p-5 sm:p-6">';

    if (pdfState.status === 'idle' || pdfState.status === 'error') {
      html += renderDropzone(theme);
      if (pdfState.error) {
        html += '<div class="' + theme.danger + '" style="border:1px solid;border-radius:14px;padding:12px 16px;margin-top:16px;font-size:13px;display:flex;align-items:center;gap:8px;">';
        html += '<span>' + ic('warning') + '</span><span>' + escapeHtml(pdfState.error) + '</span>';
        html += '</div>';
      }
    } else if (pdfState.status === 'uploading' || pdfState.status === 'parsing' || pdfState.status === 'enriching') {
      html += renderProgress(theme);
    } else if (pdfState.status === 'success' && pdfState.parsedData) {
      html += renderResults(theme);
    }

    /* ── Import History ── */
    if (pdfState.importHistory.length > 0 && (pdfState.status === 'idle' || pdfState.status === 'error')) {
      html += renderHistory(theme);
    }

    html += '</div></div>';

    page.innerHTML = html;
    wireEvents(page);
  }

  /* ── Keyboard pill badge ── */
  function renderKbdPill(key, label, theme) {
    var bg = theme.dark ? 'background:#1f2937;color:#9ca3af;border-color:#374151;' : 'background:#f3f4f6;color:#6b7280;border-color:#e5e7eb;';
    return '<span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;border:1px solid;letter-spacing:.06em;' + bg + '">' +
      escapeHtml(key) + '<span style="opacity:.6;margin-left:3px;">' + escapeHtml(label) + '</span></span>';
  }

  /* ════════════════════════════════════════════════════════════
     RENDER — DROPZONE
     ════════════════════════════════════════════════════════════ */
  function renderDropzone(theme) {
    var html = '';
    var baseStyle = 'border:2px dashed;border-radius:20px;padding:48px 24px;text-align:center;cursor:pointer;transition:all .3s ease;position:relative;overflow:hidden;';
    html += '<div data-pdf-dropzone style="' + baseStyle + theme.dropzone;
    if (pdfState.dragging) html += theme.dropzoneActive;
    html += '">';

    /* Drag overlay: pulsing border, animated icon */
    if (pdfState.dragging) {
      html += '<div class="stepper-pdf-drag-overlay" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:2;pointer-events:none;">';
      html += '<div class="stepper-pdf-pulse-icon" style="font-size:64px;margin-bottom:12px;">' + ic('upload') + '</div>';
      html += '<div style="font-size:16px;font-weight:800;letter-spacing:.04em;">RELEASE TO UPLOAD</div>';
      html += '</div>';
    }

    html += '<div style="font-size:48px;margin-bottom:14px;' + (pdfState.dragging ? 'opacity:0;' : '') + '">' + ic('clipboard') + '</div>';
    html += '<h3 style="font-size:18px;font-weight:800;margin:0 0 8px;' + (pdfState.dragging ? 'opacity:0;' : '') + '">Drop Your PDF Stepsheet Here</h3>';
    html += '<p class="' + theme.subtle + '" style="font-size:14px;margin:0 0 20px;' + (pdfState.dragging ? 'opacity:0;' : '') + '">or click to browse files</p>';
    html += '<button data-pdf-browse class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:14px;font-weight:800;display:inline-flex;align-items:center;gap:8px;' + (pdfState.dragging ? 'opacity:0;' : '') + '">' + ic('folder') + ' Choose PDF File</button>';
    html += '<input data-pdf-file type="file" accept=".pdf,application/pdf" style="display:none;" />';
    html += '</div>';

    /* Feature tips */
    html += '<div style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">';
    var tips = [
      { icon: ic('check'),  text: 'Works with standard stepsheet PDFs' },
      { icon: ic('search'), text: 'Auto-detects title, choreographer and steps' },
      { icon: ic('target'), text: 'Smart step matching with 100+ terms' },
      { icon: ic('zap'),    text: 'One-click apply to your worksheet' }
    ];
    for (var i = 0; i < tips.length; i++) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;' + theme.tipBg + '">';
      html += '<span style="font-size:16px;">' + tips[i].icon + '</span>';
      html += '<span style="font-size:12px;font-weight:600;">' + escapeHtml(tips[i].text) + '</span>';
      html += '</div>';
    }
    html += '</div>';

    return html;
  }

  /* ════════════════════════════════════════════════════════════
     RENDER — PROGRESS
     ════════════════════════════════════════════════════════════ */
  function renderProgress(theme) {
    var stageInfo = {
      uploading: { icon: ic('upload'),   label: 'Uploading PDF',             pct: 25 },
      parsing:   { icon: ic('search'),   label: 'Parsing stepsheet',         pct: 55 },
      enriching: { icon: ic('embellish'), label: 'Matching steps to glossary', pct: 85 }
    };
    var info = stageInfo[pdfState.status] || { icon: ic('search'), label: 'Processing', pct: 50 };
    var label = info.icon + ' ' + info.label;
    var pct = info.pct;

    /* Elapsed time */
    var elapsed = '';
    if (pdfState.parseStartTime) {
      elapsed = formatElapsed(Date.now() - pdfState.parseStartTime);
    }

    /* Estimated step range */
    var estimate = 'Analysing document structure';
    if (pdfState.status === 'parsing') estimate = 'Typically 20 - 80 steps per stepsheet';
    if (pdfState.status === 'enriching') estimate = 'Cross-referencing with step dictionary';

    var html = '';
    html += '<div style="text-align:center;padding:48px 24px;">';
    html += '<div class="stepper-pdf-spinner" style="margin:0 auto 20px;"></div>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0 0 6px;">' + label + '</h3>';
    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 4px;">' + escapeHtml(pdfState.fileName || 'Processing file') + '</p>';
    html += '<p class="' + theme.subtle + '" style="font-size:11px;margin:0 0 16px;font-style:italic;">' + escapeHtml(estimate) + '</p>';

    /* Progress bar */
    html += '<div style="max-width:340px;margin:0 auto;height:6px;border-radius:999px;' + (theme.dark ? 'background:#374151;' : 'background:#e5e7eb;') + 'overflow:hidden;">';
    html += '<div class="stepper-pdf-bar-fill" style="width:' + pct + '%;height:100%;background:#4f46e5;border-radius:999px;transition:width .5s ease;"></div>';
    html += '</div>';

    /* Elapsed + stage indicator */
    html += '<div style="display:flex;justify-content:center;gap:16px;margin-top:12px;">';
    if (elapsed) {
      html += '<span class="' + theme.subtle + '" style="font-size:11px;display:inline-flex;align-items:center;gap:4px;">' + ic('clock') + ' ' + escapeHtml(elapsed) + ' elapsed</span>';
    }
    html += '<span class="' + theme.subtle + '" style="font-size:11px;">' + pct + '% complete</span>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  /* ════════════════════════════════════════════════════════════
     RENDER — RESULTS
     ════════════════════════════════════════════════════════════ */
  function renderResults(theme) {
    var data  = pdfState.parsedData;
    var meta  = data.meta || {};
    var steps = data.steps || [];
    var html  = '';

    /* ── Success banner ── */
    html += '<div class="' + theme.success + '" style="border:1px solid;border-radius:14px;padding:14px 18px;margin-bottom:18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
    html += '<span style="font-size:20px;">' + ic('celebrate') + '</span>';
    html += '<div style="flex:1;min-width:150px;">';
    html += '<div style="font-weight:800;font-size:14px;">Successfully parsed</div>';
    html += '<div style="font-size:12px;opacity:.8;">Found ' + steps.length + ' steps</div>';
    html += '</div>';
    html += '<button data-pdf-apply class="stepper-google-cta" style="background:#22c55e;color:#fff;padding:10px 20px;border-radius:12px;font-weight:800;display:inline-flex;align-items:center;gap:6px;">' + ic('check') + ' Apply to Editor</button>';
    html += '<button data-pdf-reset class="stepper-google-cta" style="padding:10px 16px;border-radius:12px;font-weight:800;display:inline-flex;align-items:center;gap:6px;' + (theme.dark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#6b7280;') + '">' + ic('undo') + ' Start Over</button>';
    html += '</div>';

    /* ── File info panel (F) ── */
    html += renderFileInfoPanel(theme);

    /* ── Meta info ── */
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:18px;">';
    var metaItems = [
      { label: 'Title',         value: meta.title || 'Untitled' },
      { label: 'Choreographer', value: meta.choreographer || 'Unknown' },
      { label: 'Music',         value: meta.music || '\u2014' },
      { label: 'Counts',        value: meta.counts || '\u2014' },
      { label: 'Walls',         value: meta.walls || '\u2014' },
      { label: 'Level',         value: meta.level || '\u2014' }
    ];
    for (var i = 0; i < metaItems.length; i++) {
      var m = metaItems[i];
      html += '<div style="padding:12px 14px;border-radius:12px;border:1px solid;' + theme.cardBg + '">';
      html += '<div class="' + theme.subtle + '" style="' + TH_STYLE + 'padding:0;margin:0;">' + escapeHtml(m.label) + '</div>';
      html += '<div style="font-weight:800;font-size:14px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(m.value) + '</div>';
      html += '</div>';
    }
    html += '</div>';

    /* ── Step statistics panel (E) ── */
    html += renderStatsPanel(steps, theme);

    /* ── Compare view (H) ── */
    html += renderCompareView(steps, theme);

    /* ── Action toolbar ── */
    html += renderActionToolbar(theme);

    /* ── Step table ── */
    html += '<h3 style="font-size:14px;font-weight:800;margin:0 0 10px;display:flex;align-items:center;gap:6px;">' + ic('list') + ' EXTRACTED STEPS (' + steps.length + ')</h3>';
    html += '<div style="max-height:400px;overflow-y:auto;border-radius:14px;border:1px solid;' + theme.cardBg + '">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
    html += '<thead><tr style="' + theme.headBg + '">';
    html += '<th style="' + TH_STYLE + '">#</th>';
    html += '<th style="' + TH_STYLE + '">STEP</th>';
    html += '<th style="' + TH_STYLE + '">COUNT</th>';
    html += '<th style="' + TH_STYLE + '">FOOT</th>';
    html += '<th style="' + TH_STYLE + '">MATCH</th>';
    html += '</tr></thead><tbody>';

    for (var j = 0; j < steps.length; j++) {
      var s = steps[j];
      var rowBg = j % 2 === 0 ? '' : theme.rowAlt;
      var stepName = s.name || s.description || '\u2014';
      var conf = getStepConfidence(stepName);

      html += '<tr style="' + rowBg + '" data-step-row="' + j + '">';
      html += '<td style="padding:8px 14px;opacity:.5;">' + (j + 1) + '</td>';

      /* Editable step name cell (B) */
      html += '<td style="padding:8px 14px;font-weight:700;cursor:pointer;" data-step-edit="' + j + '" title="Click to edit step name">';
      html += '<span style="display:inline-flex;align-items:center;gap:6px;">';
      html += '<span data-step-label="' + j + '">' + escapeHtml(stepName) + '</span>';
      html += '<span style="opacity:.35;font-size:12px;" class="stepper-pdf-edit-hint">' + ic('edit') + '</span>';
      html += '</span></td>';

      html += '<td style="padding:8px 14px;">' + escapeHtml(s.count || '\u2014') + '</td>';
      html += '<td style="padding:8px 14px;">' + escapeHtml(s.foot || '\u2014') + '</td>';

      /* Confidence indicator (A) */
      html += '<td style="padding:8px 14px;">';
      html += '<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.04em;';
      html += 'background:' + conf.color + '18;color:' + conf.color + ';border:1px solid ' + conf.color + '40;">';
      html += escapeHtml(conf.label);
      html += '</span></td>';

      html += '</tr>';
    }
    html += '</tbody></table></div>';

    return html;
  }

  /* ── File info panel ── */
  function renderFileInfoPanel(theme) {
    if (!pdfState.file && !pdfState.fileSize) return '';
    var html = '';
    html += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px;">';

    var chips = [
      { icon: ic('document'), label: 'FILE', value: escapeHtml(pdfState.fileName || 'Unknown') },
      { icon: ic('database'), label: 'SIZE', value: formatBytes(pdfState.fileSize) },
      { icon: ic('tag'),      label: 'TYPE', value: escapeHtml(pdfState.fileType || 'application/pdf') }
    ];
    if (pdfState.uploadTimestamp) {
      chips.push({ icon: ic('clock'), label: 'UPLOADED', value: new Date(pdfState.uploadTimestamp).toLocaleTimeString() });
    }

    for (var i = 0; i < chips.length; i++) {
      var c = chips[i];
      html += '<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;border:1px solid;font-size:12px;' + theme.chipBg + '">';
      html += '<span style="font-size:13px;">' + c.icon + '</span>';
      html += '<span style="font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.6;font-size:10px;">' + c.label + '</span>';
      html += '<span style="font-weight:600;">' + c.value + '</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  /* ── Step statistics panel ── */
  function renderStatsPanel(steps, theme) {
    var stats = computeStats(steps);
    if (!stats) return '';

    var html = '';
    html += '<div style="border-radius:14px;border:1px solid;padding:16px 18px;margin-bottom:18px;' + theme.cardBg + '">';
    html += '<h4 style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 12px;display:flex;align-items:center;gap:6px;">' + ic('trending') + ' STEP STATISTICS</h4>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;">';

    var statItems = [
      { label: 'UNIQUE STEPS',  value: stats.unique,          icon: ic('layers') },
      { label: 'TOTAL COUNT',   value: stats.total,           icon: ic('hashtag') },
      { label: 'MOST COMMON',   value: stats.mostCommon || '\u2014', icon: ic('fire') },
      { label: 'AVG PER STEP',  value: stats.avgPerStep,      icon: ic('percent') }
    ];

    for (var i = 0; i < statItems.length; i++) {
      var si = statItems[i];
      html += '<div style="text-align:center;padding:10px;border-radius:12px;' + theme.tipBg + '">';
      html += '<div style="font-size:18px;margin-bottom:4px;">' + si.icon + '</div>';
      html += '<div style="font-weight:900;font-size:16px;">' + escapeHtml(String(si.value)) + '</div>';
      html += '<div class="' + theme.subtle + '" style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-top:2px;">' + si.label + '</div>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  /* ── Compare view ── */
  function renderCompareView(steps, theme) {
    var cmp = computeComparison(steps);
    if (!cmp) return '';

    var html = '';
    html += '<div style="border-radius:14px;border:1px solid;padding:14px 18px;margin-bottom:18px;' + theme.cardBg + '">';
    html += '<h4 style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;display:flex;align-items:center;gap:6px;">' + ic('layers') + ' WORKSHEET COMPARISON</h4>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:10px;">';

    var badges = [
      { label: 'Matching',           value: cmp.matching,        color: '#22c55e' },
      { label: 'New in import',      value: cmp.different,       color: '#3b82f6' },
      { label: 'Only in worksheet',  value: cmp.onlyInWorksheet, color: '#f59e0b' }
    ];
    for (var i = 0; i < badges.length; i++) {
      var b = badges[i];
      html += '<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;';
      html += 'background:' + b.color + '15;color:' + b.color + ';border:1px solid ' + b.color + '30;">';
      html += escapeHtml(String(b.value)) + ' ' + escapeHtml(b.label);
      html += '</span>';
    }

    html += '</div></div>';
    return html;
  }

  /* ── Action toolbar (C, D, K) ── */
  function renderActionToolbar(theme) {
    var btnStyle = 'display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:12px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid;transition:all .15s ease;';
    var btnColors = theme.dark
      ? 'background:#1f2937;border-color:#374151;color:#d1d5db;'
      : 'background:#f9fafb;border-color:#e5e7eb;color:#374151;';

    var html = '';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">';
    html += '<button data-pdf-download-json style="' + btnStyle + btnColors + '">' + ic('download') + ' Download JSON</button>';
    html += '<button data-pdf-copy-steps style="' + btnStyle + btnColors + '">' + ic('copy') + ' Copy Steps</button>';
    html += '<button data-pdf-export-md style="' + btnStyle + btnColors + '">' + ic('export') + ' Export Markdown</button>';
    html += '</div>';
    return html;
  }

  /* ════════════════════════════════════════════════════════════
     RENDER — HISTORY
     ════════════════════════════════════════════════════════════ */
  function renderHistory(theme) {
    var history = pdfState.importHistory;
    var html = '';
    html += '<div style="margin-top:24px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">';
    html += '<h3 style="font-size:14px;font-weight:800;margin:0;display:flex;align-items:center;gap:6px;">' + ic('folderOpen') + ' RECENT IMPORTS</h3>';
    html += '<button data-pdf-clear-history class="' + theme.subtle + '" style="background:none;border:none;cursor:pointer;font-size:12px;font-weight:700;">Clear</button>';
    html += '</div>';
    html += '<div style="display:grid;gap:8px;">';
    for (var i = 0; i < Math.min(history.length, 5); i++) {
      var h = history[i];
      var hasSnapshot = !!(h.snapshot);
      html += '<div data-pdf-history-item="' + i + '" style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;border:1px solid;cursor:' + (hasSnapshot ? 'pointer' : 'default') + ';transition:background .15s ease;' + theme.cardBg + '">';
      html += '<span style="font-size:18px;">' + ic('document') + '</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(h.title || h.fileName || 'Untitled') + '</div>';
      html += '<div class="' + theme.subtle + '" style="font-size:11px;">' + escapeHtml(h.date || '') + ' \u00b7 ' + (h.stepCount || 0) + ' steps';
      if (hasSnapshot) html += ' \u00b7 ' + ic('import') + ' <span style="font-weight:700;">Click to reload</span>';
      html += '</div>';
      html += '</div></div>';
    }
    html += '</div></div>';
    return html;
  }

  /* ════════════════════════════════════════════════════════════
     FILE HANDLING & PARSING
     ════════════════════════════════════════════════════════════ */
  function handleFile(file) {
    if (!file) return;
    var name = String(file.name || '');
    if (!name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      pdfState.error = 'Please select a PDF file.';
      renderPdfPage();
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      pdfState.error = 'File is too large (max ' + MAX_FILE_MB + ' MB).';
      renderPdfPage();
      return;
    }

    pdfState.file = file;
    pdfState.fileName = name;
    pdfState.fileSize = file.size || 0;
    pdfState.fileType = file.type || 'application/pdf';
    pdfState.uploadTimestamp = Date.now();
    pdfState.error = null;
    pdfState.status = 'uploading';
    pdfState.parseStartTime = Date.now();
    renderPdfPage();

    var core    = getImportCore();
    var runtime = getImportRuntime();

    if (core && typeof core.requestPdfParse === 'function') {
      pdfState.status = 'parsing';
      renderPdfPage();

      var formData = new FormData();
      formData.append('file', file);

      core.requestPdfParse(formData)
        .then(function (data) {
          pdfState.status = 'enriching';
          renderPdfPage();
          return core.enrichImportedData ? core.enrichImportedData(data) : data;
        })
        .then(function (enriched) {
          finalizeParse(enriched, name);
        })
        .catch(function (err) {
          handleParseError(err);
        });
    } else if (runtime && typeof runtime.requestPdfParse === 'function') {
      pdfState.status = 'parsing';
      renderPdfPage();

      var formData2 = new FormData();
      formData2.append('file', file);

      runtime.requestPdfParse(formData2)
        .then(function (data) {
          finalizeParse(data, name);
        })
        .catch(function (err) {
          handleParseError(err);
        });
    } else {
      parsePdfDirect(file);
    }
  }

  function parsePdfDirect(file) {
    pdfState.status = 'parsing';
    renderPdfPage();

    var reader = new FileReader();
    reader.onload = function () {
      var base64 = reader.result.split(',')[1] || '';
      var apiBase = (window.STEPPER_API_BASE || 'https://step-by-stepper.onrender.com').replace(/\/+$/, '');

      fetch(apiBase + '/api/pdf/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf: base64, fileName: file.name }),
        mode: 'cors',
        credentials: 'omit'
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.error) throw new Error(data.error);
          finalizeParse(data, file.name);
        })
        .catch(function (err) {
          handleParseError(err);
        });
    };
    reader.onerror = function () {
      pdfState.status = 'error';
      pdfState.error = 'Could not read the file.';
      renderPdfPage();
    };
    reader.readAsDataURL(file);
  }

  function finalizeParse(data, fileName) {
    pdfState.parsedData = data;
    pdfState.status = 'success';

    var meta = data.meta || {};
    var historyEntry = {
      title: meta.title || String(fileName || '').replace(/\.pdf$/i, ''),
      fileName: fileName,
      stepCount: (data.steps || []).length,
      date: new Date().toLocaleDateString(),
      snapshot: data
    };
    pdfState.importHistory.unshift(historyEntry);
    saveHistory(pdfState.importHistory);
    renderPdfPage();
  }

  function handleParseError(err) {
    pdfState.status = 'error';
    pdfState.error = (err && err.message) || 'Failed to parse the PDF. Please try again.';
    renderPdfPage();
  }

  function applyToEditor() {
    if (!pdfState.parsedData) return;
    var core = getImportCore();
    var runtime = getImportRuntime();

    try {
      var snapshot;
      if (core && typeof core.buildEditorSnapshot === 'function') {
        snapshot = core.buildEditorSnapshot(pdfState.parsedData);
      } else if (runtime && typeof runtime.buildEditorSnapshot === 'function') {
        snapshot = runtime.buildEditorSnapshot(pdfState.parsedData);
      } else {
        snapshot = pdfState.parsedData;
      }

      if (snapshot) {
        localStorage.setItem(EDITOR_KEY, JSON.stringify(snapshot));
        try { window.dispatchEvent(new StorageEvent('storage', { key: EDITOR_KEY })); } catch (_) { /* noop */ }
        try { window.dispatchEvent(new CustomEvent('stepper-data-changed')); } catch (_) { /* noop */ }
        if (typeof window.__stepperRefreshWorksheetFromStorage === 'function') window.__stepperRefreshWorksheetFromStorage();

        var buildBtn = Array.from(document.querySelectorAll('button')).find(function (b) { return (b.textContent || '').trim() === 'Build'; });
        if (buildBtn) buildBtn.click();
      }
    } catch (_) {
      pdfState.error = 'Could not apply the parsed data to the editor.';
      renderPdfPage();
    }
  }

  /* ── Export: Download JSON (C) ── */
  function downloadAsJson() {
    if (!pdfState.parsedData) return;
    var json = JSON.stringify(pdfState.parsedData, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (pdfState.fileName || 'stepsheet').replace(/\.pdf$/i, '') + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Export: Copy to clipboard (D) ── */
  function copyStepsToClipboard() {
    if (!pdfState.parsedData) return;
    var steps = pdfState.parsedData.steps || [];
    var lines = ['#\tStep\tCount\tFoot'];
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      lines.push((i + 1) + '\t' + (s.name || s.description || '') + '\t' + (s.count || '') + '\t' + (s.foot || ''));
    }
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Steps copied to clipboard');
      });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('Steps copied to clipboard'); } catch (_) { /* silent */ }
      document.body.removeChild(ta);
    }
  }

  /* ── Export: Markdown (K) ── */
  function exportAsMarkdown() {
    if (!pdfState.parsedData) return;
    var data = pdfState.parsedData;
    var meta = data.meta || {};
    var steps = data.steps || [];
    var md = '';
    md += '# ' + (meta.title || 'Untitled Stepsheet') + '\n\n';
    if (meta.choreographer) md += '**Choreographer:** ' + meta.choreographer + '\n';
    if (meta.music)         md += '**Music:** ' + meta.music + '\n';
    if (meta.counts)        md += '**Counts:** ' + meta.counts + '\n';
    if (meta.walls)         md += '**Walls:** ' + meta.walls + '\n';
    if (meta.level)         md += '**Level:** ' + meta.level + '\n';
    md += '\n---\n\n';
    md += '| # | Step | Count | Foot |\n';
    md += '|---|------|-------|------|\n';
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      md += '| ' + (i + 1) + ' | ' + (s.name || s.description || '') + ' | ' + (s.count || '') + ' | ' + (s.foot || '') + ' |\n';
    }

    var blob = new Blob([md], { type: 'text/markdown' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (pdfState.fileName || 'stepsheet').replace(/\.pdf$/i, '') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ── Toast notification ── */
  function showToast(msg) {
    var existing = document.getElementById('stepper-pdf-toast');
    if (existing) existing.remove();
    var el = document.createElement('div');
    el.id = 'stepper-pdf-toast';
    el.textContent = msg;
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 24px;border-radius:12px;background:#4f46e5;color:#fff;font-size:13px;font-weight:700;z-index:99999;opacity:0;transition:opacity .3s ease;pointer-events:none;';
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.style.opacity = '1'; });
    setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 2200);
  }

  /* ── Inline step editing (B) ── */
  function beginInlineEdit(index, cell) {
    if (!pdfState.parsedData || !pdfState.parsedData.steps) return;
    var steps = pdfState.parsedData.steps;
    if (index < 0 || index >= steps.length) return;

    var current = steps[index].name || steps[index].description || '';
    var theme = themeClasses();
    var input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    input.style.cssText = 'width:100%;padding:4px 8px;border-radius:8px;border:2px solid #4f46e5;font-size:13px;font-weight:700;outline:none;box-sizing:border-box;' + theme.inputBg;

    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();

    function commit() {
      var val = input.value.trim();
      if (val && val !== current) {
        steps[index].name = val;
      }
      renderPdfPage();
    }

    input.addEventListener('blur', commit);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      if (e.key === 'Escape') { e.preventDefault(); renderPdfPage(); }
    });
  }

  /* ── History re-import (G) ── */
  function reloadFromHistory(index) {
    var h = pdfState.importHistory[index];
    if (!h || !h.snapshot) return;
    pdfState.parsedData = h.snapshot;
    pdfState.fileName = h.fileName || '';
    pdfState.status = 'success';
    pdfState.error = null;
    renderPdfPage();
  }

  /* ── State reset ── */
  function resetState() {
    pdfState.status = 'idle';
    pdfState.parsedData = null;
    pdfState.file = null;
    pdfState.fileName = '';
    pdfState.fileSize = 0;
    pdfState.fileType = '';
    pdfState.uploadTimestamp = null;
    pdfState.error = null;
    pdfState.parseStartTime = null;
    renderPdfPage();
  }

  /* ════════════════════════════════════════════════════════════
     EVENT WIRING
     ════════════════════════════════════════════════════════════ */
  function wireEvents(page) {
    if (!page) return;

    /* ── Dropzone ── */
    var dropzone  = page.querySelector('[data-pdf-dropzone]');
    var fileInput = page.querySelector('[data-pdf-file]');
    var browseBtn = page.querySelector('[data-pdf-browse]');

    if (dropzone) {
      dropzone.addEventListener('dragover', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (!pdfState.dragging) { pdfState.dragging = true; renderPdfPage(); }
      });
      dropzone.addEventListener('dragleave', function (e) {
        e.preventDefault(); e.stopPropagation();
        pdfState.dragging = false; renderPdfPage();
      });
      dropzone.addEventListener('drop', function (e) {
        e.preventDefault(); e.stopPropagation();
        pdfState.dragging = false;
        var files = e.dataTransfer && e.dataTransfer.files;
        if (files && files.length) handleFile(files[0]);
      });
      dropzone.addEventListener('click', function (e) {
        if (e.target.closest('[data-pdf-browse]') || e.target.closest('[data-pdf-file]')) return;
        if (fileInput) fileInput.click();
      });
    }

    if (browseBtn && fileInput) {
      browseBtn.addEventListener('click', function (e) { e.stopPropagation(); fileInput.click(); });
    }
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files.length) handleFile(fileInput.files[0]);
      });
    }

    /* ── Apply ── */
    var applyBtn = page.querySelector('[data-pdf-apply]');
    if (applyBtn) applyBtn.addEventListener('click', function () { applyToEditor(); });

    /* ── Reset ── */
    var resetBtn = page.querySelector('[data-pdf-reset]');
    if (resetBtn) resetBtn.addEventListener('click', function () { resetState(); });

    /* ── Clear history ── */
    var clearHistBtn = page.querySelector('[data-pdf-clear-history]');
    if (clearHistBtn) clearHistBtn.addEventListener('click', function () {
      pdfState.importHistory = [];
      saveHistory([]);
      renderPdfPage();
    });

    /* ── Action toolbar ── */
    var jsonBtn = page.querySelector('[data-pdf-download-json]');
    if (jsonBtn) jsonBtn.addEventListener('click', function () { downloadAsJson(); });
    var copyBtn = page.querySelector('[data-pdf-copy-steps]');
    if (copyBtn) copyBtn.addEventListener('click', function () { copyStepsToClipboard(); });
    var mdBtn = page.querySelector('[data-pdf-export-md]');
    if (mdBtn) mdBtn.addEventListener('click', function () { exportAsMarkdown(); });

    /* ── Inline step editing (B) ── */
    var editCells = page.querySelectorAll('[data-step-edit]');
    for (var i = 0; i < editCells.length; i++) {
      (function (cell) {
        cell.addEventListener('click', function () {
          var idx = parseInt(cell.getAttribute('data-step-edit'), 10);
          beginInlineEdit(idx, cell);
        });
      })(editCells[i]);
    }

    /* ── History re-import (G) ── */
    var histItems = page.querySelectorAll('[data-pdf-history-item]');
    for (var h = 0; h < histItems.length; h++) {
      (function (el) {
        el.addEventListener('click', function () {
          var idx = parseInt(el.getAttribute('data-pdf-history-item'), 10);
          reloadFromHistory(idx);
        });
      })(histItems[h]);
    }

    /* ── Keyboard shortcuts (J) ── */
    if (!page._pdfKbBound) {
      page._pdfKbBound = true;
      document.addEventListener('keydown', handleGlobalKeydown);
    }
  }

  /* ── Global keyboard handler (J) ── */
  function handleGlobalKeydown(e) {
    var pageEl = document.getElementById(PAGE_ID);
    if (!pageEl || pageEl.hidden || pageEl.style.display === 'none') return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      resetState();
    }
    if (e.key === 'Enter' && pdfState.status === 'success' && pdfState.parsedData) {
      e.preventDefault();
      applyToEditor();
    }
  }

  /* ════════════════════════════════════════════════════════════
     STYLE INJECTION
     ════════════════════════════════════════════════════════════ */
  function ensurePdfStyles() {
    if (document.getElementById('stepper-pdf-tab-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-pdf-tab-style';
    style.textContent = [
      '@keyframes stepper-pdf-spin { to { transform:rotate(360deg); } }',
      '@keyframes stepper-pdf-pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }',
      '@keyframes stepper-pdf-border-pulse { 0%,100% { border-color:#4f46e5; } 50% { border-color:#818cf8; } }',
      '.stepper-pdf-spinner { width:40px;height:40px;border:4px solid rgba(99,102,241,.15);border-top-color:#4f46e5;border-radius:50%;animation:stepper-pdf-spin .8s linear infinite; }',
      '#' + PAGE_ID + ' [data-pdf-dropzone]:hover { border-color:rgba(99,102,241,.4)!important;background:rgba(99,102,241,.03)!important; }',
      '#' + PAGE_ID + ' table th { position:sticky;top:0;z-index:1; }',
      '.stepper-pdf-pulse-icon { animation:stepper-pdf-pulse 1.2s ease-in-out infinite; }',
      '#' + PAGE_ID + ' [data-pdf-dropzone].stepper-pdf-drag-active { animation:stepper-pdf-border-pulse 1s ease-in-out infinite; }',
      '.stepper-pdf-edit-hint { transition:opacity .15s ease; }',
      '#' + PAGE_ID + ' [data-step-edit]:hover .stepper-pdf-edit-hint { opacity:.7!important; }',
      '#' + PAGE_ID + ' [data-step-edit]:hover { background:rgba(79,70,229,.04); }',
      '#' + PAGE_ID + ' [data-pdf-history-item]:hover { filter:brightness(1.05); }',
      '#' + PAGE_ID + ' button:hover { filter:brightness(1.08); }',
      '.stepper-pdf-bar-fill { background:linear-gradient(90deg,#4f46e5,#818cf8)!important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ════════════════════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════════════════════ */
  window.__stepperPdfTab = {
    PAGE_ID: PAGE_ID,
    TAB_ID: TAB_ID,
    render: function () { ensurePdfStyles(); renderPdfPage(); },
    getState: function () { return pdfState; },
    icon: function () {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>';
    }
  };

})();
