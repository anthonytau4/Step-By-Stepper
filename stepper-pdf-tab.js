/**
 * stepper-pdf-tab.js
 * ─────────────────────────────────────────────────────────────
 * Dedicated PDF Import tab for Step-By-Stepper.
 * Provides a full visual UI for:
 *   • Drag-and-drop PDF upload
 *   • Parse progress indicator
 *   • Parsed results preview (title, choreographer, steps)
 *   • One-click "Apply to Editor" action
 *   • Import history (recent imports)
 *
 * Works with the existing stepper-pdf-import-core.js for
 * actual parsing and normalization.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperPdfTabInstalled) return;
  window.__stepperPdfTabInstalled = true;

  /* ── Constants ── */
  var PAGE_ID = 'stepper-pdf-page';
  var TAB_ID  = 'stepper-pdf-tab';
  var HISTORY_KEY = 'stepper_pdf_import_history_v1';

  /* ── Local state ── */
  var pdfState = {
    status: 'idle', /* idle | uploading | parsing | enriching | success | error */
    statusMessage: '',
    file: null,
    fileName: '',
    parsedData: null,
    importHistory: [],
    dragging: false,
    error: null
  };

  /* ── Persistence ── */
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveHistory(history) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify((history || []).slice(0, 20))); } catch (e) { /* quota */ }
  }

  pdfState.importHistory = loadHistory();

  /* ── Theme helper ── */
  function isDarkMode() {
    try {
      var data = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || 'null');
      return !!(data && data.isDarkMode);
    } catch (e) { return false; }
  }
  function themeClasses() {
    var dark = isDarkMode();
    return {
      dark: dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500',
      success: dark ? 'bg-green-500/15 border-green-400/30 text-green-200' : 'bg-green-50 border-green-200 text-green-700',
      danger: dark ? 'bg-red-500/15 border-red-400/30 text-red-200' : 'bg-red-50 border-red-200 text-red-700',
      cardBg: dark ? 'background:#1a1a2e;border-color:#2d2d44;' : 'background:#ffffff;border-color:#e5e7eb;',
      inputBg: dark ? 'background:#111827;border-color:#374151;color:#f3f4f6;' : 'background:#ffffff;border-color:#d1d5db;color:#111827;',
      dropzone: dark ? 'border-color:#374151;background:#111827;' : 'border-color:#d1d5db;background:#fafbfc;',
      dropzoneActive: 'border-color:#4f46e5!important;background:rgba(79,70,229,.06)!important;'
    };
  }
  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = String(text || '');
    return el.innerHTML;
  }

  /* ── Get import core reference ── */
  function getImportCore() {
    return window.StepperPdfImportCore || null;
  }
  function getImportRuntime() {
    return window.StepperPdfImportRuntime || null;
  }

  /* ════════════════════════════════════════════════════════════
     RENDER
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
    html += '<span style="font-size:28px;">📄</span>';
    html += '<div>';
    html += '<h2 style="font-size:20px;font-weight:900;margin:0;">Import PDF Stepsheet</h2>';
    html += '<p class="' + theme.subtle + '" style="font-size:12px;margin:2px 0 0;">Upload a PDF dance stepsheet and auto-import all steps</p>';
    html += '</div></div></div>';

    /* ── Body ── */
    html += '<div class="p-5 sm:p-6">';

    if (pdfState.status === 'idle' || pdfState.status === 'error') {
      html += renderDropzone(theme);
      if (pdfState.error) {
        html += '<div class="' + theme.danger + '" style="border:1px solid;border-radius:14px;padding:12px 16px;margin-top:16px;font-size:13px;display:flex;align-items:center;gap:8px;">';
        html += '<span>⚠️</span><span>' + escapeHtml(pdfState.error) + '</span>';
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

  function renderDropzone(theme) {
    var html = '';
    html += '<div data-pdf-dropzone style="border:2px dashed;border-radius:20px;padding:48px 24px;text-align:center;cursor:pointer;transition:all .3s ease;' + theme.dropzone;
    if (pdfState.dragging) html += theme.dropzoneActive;
    html += '">';
    html += '<div style="font-size:56px;margin-bottom:14px;">📋</div>';
    html += '<h3 style="font-size:18px;font-weight:800;margin:0 0 8px;">Drop Your PDF Stepsheet Here</h3>';
    html += '<p class="' + theme.subtle + '" style="font-size:14px;margin:0 0 20px;">or click to browse files</p>';
    html += '<button data-pdf-browse class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:12px 28px;border-radius:14px;font-weight:800;">📁 Choose PDF File</button>';
    html += '<input data-pdf-file type="file" accept=".pdf,application/pdf" style="display:none;" />';
    html += '</div>';

    /* Tips */
    html += '<div style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">';
    var tips = [
      { icon: '✅', text: 'Works with standard stepsheet PDFs' },
      { icon: '📝', text: 'Auto-detects title, choreographer & steps' },
      { icon: '🎯', text: 'Smart step matching with 100+ terms' },
      { icon: '⚡', text: 'One-click apply to your worksheet' }
    ];
    for (var i = 0; i < tips.length; i++) {
      html += '<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;' + (theme.dark ? 'background:#1e293b;' : 'background:#f0f4ff;') + '">';
      html += '<span style="font-size:16px;">' + tips[i].icon + '</span>';
      html += '<span style="font-size:12px;font-weight:600;">' + tips[i].text + '</span>';
      html += '</div>';
    }
    html += '</div>';

    return html;
  }

  function renderProgress(theme) {
    var messages = {
      uploading: '📤 Uploading PDF…',
      parsing: '🔍 Parsing stepsheet…',
      enriching: '✨ Matching steps to glossary…'
    };
    var msg = messages[pdfState.status] || pdfState.statusMessage || 'Processing…';
    var pct = pdfState.status === 'uploading' ? 33 : (pdfState.status === 'parsing' ? 66 : 90);

    var html = '';
    html += '<div style="text-align:center;padding:48px 24px;">';
    html += '<div class="stepper-pdf-spinner" style="margin:0 auto 20px;"></div>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0 0 8px;">' + escapeHtml(msg) + '</h3>';
    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 16px;">' + escapeHtml(pdfState.fileName || 'Processing file') + '</p>';

    /* Progress bar */
    html += '<div style="max-width:300px;margin:0 auto;height:6px;border-radius:999px;' + (theme.dark ? 'background:#374151;' : 'background:#e5e7eb;') + 'overflow:hidden;">';
    html += '<div style="width:' + pct + '%;height:100%;background:#4f46e5;border-radius:999px;transition:width .5s ease;"></div>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderResults(theme) {
    var data = pdfState.parsedData;
    var meta = data.meta || {};
    var steps = data.steps || [];

    var html = '';

    /* Success banner */
    html += '<div class="' + theme.success + '" style="border:1px solid;border-radius:14px;padding:14px 18px;margin-bottom:18px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
    html += '<span style="font-size:20px;">🎉</span>';
    html += '<div style="flex:1;min-width:150px;">';
    html += '<div style="font-weight:800;font-size:14px;">Successfully parsed!</div>';
    html += '<div style="font-size:12px;opacity:.8;">Found ' + steps.length + ' steps</div>';
    html += '</div>';
    html += '<button data-pdf-apply class="stepper-google-cta" style="background:#22c55e;color:#fff;padding:10px 20px;border-radius:12px;font-weight:800;">✅ Apply to Editor</button>';
    html += '<button data-pdf-reset class="stepper-google-cta" style="padding:10px 16px;border-radius:12px;font-weight:800;' + (theme.dark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#6b7280;') + '">↩️ Start Over</button>';
    html += '</div>';

    /* Meta info */
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:18px;">';
    var metaItems = [
      { label: 'Title', value: meta.title || 'Untitled' },
      { label: 'Choreographer', value: meta.choreographer || 'Unknown' },
      { label: 'Music', value: meta.music || '—' },
      { label: 'Counts', value: meta.counts || '—' },
      { label: 'Walls', value: meta.walls || '—' },
      { label: 'Level', value: meta.level || '—' }
    ];
    for (var i = 0; i < metaItems.length; i++) {
      var m = metaItems[i];
      html += '<div style="padding:12px 14px;border-radius:12px;border:1px solid;' + theme.cardBg + '">';
      html += '<div class="' + theme.subtle + '" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">' + m.label + '</div>';
      html += '<div style="font-weight:800;font-size:14px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(m.value) + '</div>';
      html += '</div>';
    }
    html += '</div>';

    /* Step list preview */
    html += '<h3 style="font-size:14px;font-weight:800;margin:0 0 10px;">Extracted Steps (' + steps.length + ')</h3>';
    html += '<div style="max-height:350px;overflow-y:auto;border-radius:14px;border:1px solid;' + theme.cardBg + '">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
    html += '<thead><tr style="' + (theme.dark ? 'background:#1e293b;' : 'background:#f9fafb;') + '">';
    html += '<th style="padding:10px 14px;text-align:left;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.08em;">#</th>';
    html += '<th style="padding:10px 14px;text-align:left;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.08em;">Step</th>';
    html += '<th style="padding:10px 14px;text-align:left;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.08em;">Count</th>';
    html += '<th style="padding:10px 14px;text-align:left;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.08em;">Foot</th>';
    html += '</tr></thead><tbody>';
    for (var j = 0; j < steps.length; j++) {
      var s = steps[j];
      var rowBg = j % 2 === 0 ? '' : (theme.dark ? 'background:#111827;' : 'background:#f9fafb;');
      html += '<tr style="' + rowBg + '">';
      html += '<td style="padding:8px 14px;opacity:.5;">' + (j + 1) + '</td>';
      html += '<td style="padding:8px 14px;font-weight:700;">' + escapeHtml(s.name || s.description || '—') + '</td>';
      html += '<td style="padding:8px 14px;">' + escapeHtml(s.count || '—') + '</td>';
      html += '<td style="padding:8px 14px;">' + escapeHtml(s.foot || '—') + '</td>';
      html += '</tr>';
    }
    html += '</tbody></table></div>';

    return html;
  }

  function renderHistory(theme) {
    var history = pdfState.importHistory;
    var html = '';
    html += '<div style="margin-top:24px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">';
    html += '<h3 style="font-size:14px;font-weight:800;margin:0;">📂 Recent Imports</h3>';
    html += '<button data-pdf-clear-history class="' + theme.subtle + '" style="background:none;border:none;cursor:pointer;font-size:12px;font-weight:700;">Clear</button>';
    html += '</div>';
    html += '<div style="display:grid;gap:8px;">';
    for (var i = 0; i < Math.min(history.length, 5); i++) {
      var h = history[i];
      html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;border:1px solid;' + theme.cardBg + '">';
      html += '<span style="font-size:18px;">📄</span>';
      html += '<div style="flex:1;min-width:0;">';
      html += '<div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(h.title || h.fileName || 'Untitled') + '</div>';
      html += '<div class="' + theme.subtle + '" style="font-size:11px;">' + escapeHtml(h.date || '') + ' · ' + (h.stepCount || 0) + ' steps</div>';
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
    if (file.size > 10 * 1024 * 1024) {
      pdfState.error = 'File is too large (max 10 MB).';
      renderPdfPage();
      return;
    }

    pdfState.file = file;
    pdfState.fileName = name;
    pdfState.error = null;
    pdfState.status = 'uploading';
    renderPdfPage();

    /* Use the existing PDF import core if available */
    var core = getImportCore();
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
          pdfState.parsedData = enriched;
          pdfState.status = 'success';

          /* Save to history */
          var meta = enriched.meta || {};
          pdfState.importHistory.unshift({
            title: meta.title || name.replace(/\.pdf$/i, ''),
            fileName: name,
            stepCount: (enriched.steps || []).length,
            date: new Date().toLocaleDateString()
          });
          saveHistory(pdfState.importHistory);

          renderPdfPage();
        })
        .catch(function (err) {
          pdfState.status = 'error';
          pdfState.error = (err && err.message) || 'Failed to parse the PDF. Please try again.';
          renderPdfPage();
        });
    } else if (runtime && typeof runtime.requestPdfParse === 'function') {
      /* Try runtime as fallback */
      pdfState.status = 'parsing';
      renderPdfPage();

      var formData2 = new FormData();
      formData2.append('file', file);

      runtime.requestPdfParse(formData2)
        .then(function (data) {
          pdfState.parsedData = data;
          pdfState.status = 'success';
          pdfState.importHistory.unshift({
            title: (data.meta || {}).title || name.replace(/\.pdf$/i, ''),
            fileName: name,
            stepCount: (data.steps || []).length,
            date: new Date().toLocaleDateString()
          });
          saveHistory(pdfState.importHistory);
          renderPdfPage();
        })
        .catch(function (err) {
          pdfState.status = 'error';
          pdfState.error = (err && err.message) || 'Failed to parse the PDF.';
          renderPdfPage();
        });
    } else {
      /* Fallback: direct API call */
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
          pdfState.parsedData = data;
          pdfState.status = 'success';
          pdfState.importHistory.unshift({
            title: (data.meta || {}).title || file.name.replace(/\.pdf$/i, ''),
            fileName: file.name,
            stepCount: (data.steps || []).length,
            date: new Date().toLocaleDateString()
          });
          saveHistory(pdfState.importHistory);
          renderPdfPage();
        })
        .catch(function (err) {
          pdfState.status = 'error';
          pdfState.error = (err && err.message) || 'Failed to parse the PDF.';
          renderPdfPage();
        });
    };
    reader.onerror = function () {
      pdfState.status = 'error';
      pdfState.error = 'Could not read the file.';
      renderPdfPage();
    };
    reader.readAsDataURL(file);
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
        /* Manual application */
        snapshot = pdfState.parsedData;
      }

      if (snapshot) {
        localStorage.setItem('linedance_builder_data_v13', JSON.stringify(snapshot));
        try { window.dispatchEvent(new StorageEvent('storage', { key: 'linedance_builder_data_v13' })); } catch (e) { /* noop */ }
        try { window.dispatchEvent(new CustomEvent('stepper-data-changed')); } catch (e) { /* noop */ }
        if (typeof window.__stepperRefreshWorksheetFromStorage === 'function') window.__stepperRefreshWorksheetFromStorage();

        /* Navigate to Build tab */
        var buildBtn = Array.from(document.querySelectorAll('button')).find(function (b) { return (b.textContent || '').trim() === 'Build'; });
        if (buildBtn) buildBtn.click();
      }
    } catch (e) {
      pdfState.error = 'Could not apply the parsed data to the editor.';
      renderPdfPage();
    }
  }

  /* ════════════════════════════════════════════════════════════
     EVENT WIRING
     ════════════════════════════════════════════════════════════ */
  function wireEvents(page) {
    if (!page) return;

    /* Dropzone */
    var dropzone = page.querySelector('[data-pdf-dropzone]');
    var fileInput = page.querySelector('[data-pdf-file]');
    var browseBtn = page.querySelector('[data-pdf-browse]');

    if (dropzone) {
      dropzone.addEventListener('dragover', function (e) { e.preventDefault(); e.stopPropagation(); pdfState.dragging = true; renderPdfPage(); });
      dropzone.addEventListener('dragleave', function (e) { e.preventDefault(); e.stopPropagation(); pdfState.dragging = false; renderPdfPage(); });
      dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        e.stopPropagation();
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
      fileInput.addEventListener('change', function () { if (fileInput.files && fileInput.files.length) handleFile(fileInput.files[0]); });
    }

    /* Apply */
    var applyBtn = page.querySelector('[data-pdf-apply]');
    if (applyBtn) applyBtn.addEventListener('click', function () { applyToEditor(); });

    /* Reset */
    var resetBtn = page.querySelector('[data-pdf-reset]');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      pdfState.status = 'idle';
      pdfState.parsedData = null;
      pdfState.file = null;
      pdfState.fileName = '';
      pdfState.error = null;
      renderPdfPage();
    });

    /* Clear history */
    var clearHistBtn = page.querySelector('[data-pdf-clear-history]');
    if (clearHistBtn) clearHistBtn.addEventListener('click', function () {
      pdfState.importHistory = [];
      saveHistory([]);
      renderPdfPage();
    });
  }

  /* ════════════════════════════════════════════════════════════
     STYLE INJECTION
     ════════════════════════════════════════════════════════════ */
  function ensurePdfStyles() {
    if (document.getElementById('stepper-pdf-tab-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-pdf-tab-style';
    style.textContent = [
      '@keyframes stepper-pdf-spin { to { transform: rotate(360deg); } }',
      '.stepper-pdf-spinner { width:40px;height:40px;border:4px solid rgba(99,102,241,.15);border-top-color:#4f46e5;border-radius:50%;animation:stepper-pdf-spin .8s linear infinite; }',
      '#' + PAGE_ID + ' [data-pdf-dropzone]:hover { border-color:rgba(99,102,241,.4)!important;background:rgba(99,102,241,.03)!important; }',
      '#' + PAGE_ID + ' table th { position:sticky;top:0;z-index:1; }'
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
