/**
 * stepper-pdf-import-ui.js
 * PDF Import UI wiring for Step By Stepper.
 */
(function() {
  'use strict';

  window.StepperPdfImportUiInit = function StepperPdfImportUiInit() {

  let injected = false;
  let parsedData = null;

  // --- Tab / page awareness ---
  const PAGE_IDS = [
    'stepper-whatsnew-page',
    'stepper-saved-dances-page',
    'stepper-featured-choreo-page'
  ];

  function isEditorVisible() {
    // If any overlay page is visible, editor is NOT the active page
    for (const id of PAGE_IDS) {
      const el = document.getElementById(id);
      if (el && !el.hidden && el.style.display !== 'none') return false;
    }
    return true;
  }

  function startImportUiWatcher() {
    const ensure = () => {
      let btn = document.getElementById('stepper-pdf-import-btn');
      if (!btn && typeof injectUi === 'function') { try { injectUi(); } catch (_) {} btn = document.getElementById('stepper-pdf-import-btn'); }
      if (btn) { btn.style.display = 'inline-flex'; btn.style.visibility = 'visible'; }
      updateButtonVisibility();
    };
    ensure();
    try { new MutationObserver(() => ensure()).observe(document.body, { childList:true, subtree:true }); } catch (_) {}
    setInterval(ensure, 1200);
  }

  function updateButtonVisibility() {
    const btn = document.getElementById('stepper-pdf-import-btn');
    if (!btn) return;
    const show = isEditorVisible();
    btn.style.opacity = show ? '1' : '0';
    btn.style.pointerEvents = show ? 'auto' : 'none';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(20px)';
  }

  // Poll for tab changes (React state isn't accessible from outside)
  function startTabWatcher() {
    setInterval(updateButtonVisibility, 400);
  }

  // --- Wait for app ---
  function waitForApp(cb, maxWait) {
    maxWait = maxWait || 20000;
    const start = Date.now();
    const check = () => {
      const root = document.getElementById('root');
      if (root && root.children.length > 0) { setTimeout(cb, 600); return; }
      if (Date.now() - start < maxWait) setTimeout(check, 300);
    };
    check();
  }

  // --- Inject UI ---
  function injectPdfImportUI() {
    if (injected) return;
    injected = true;

    const container = document.createElement('div');
    container.id = 'stepper-pdf-import-container';
    container.setAttribute('data-testid', 'pdf-import-container');
    container.innerHTML = `
      <style>
        #stepper-pdf-import-btn {
          position: fixed;
          bottom: 90px;
          right: 20px;
          z-index: 9998;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 48%, #7c3aed 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(79,70,229,0.45), inset 0 1px 0 rgba(255,255,255,0.2);
          transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s, opacity 0.35s, pointer-events 0s;
          overflow: hidden;
        }
        #stepper-pdf-import-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%);
          pointer-events: none;
        }
        #stepper-pdf-import-btn:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 14px 40px rgba(79,70,229,0.55), inset 0 1px 0 rgba(255,255,255,0.25);
        }
        #stepper-pdf-import-btn:active { transform: translateY(0) scale(0.98); }
        #stepper-pdf-import-btn svg { width: 18px; height: 18px; fill: currentColor; flex-shrink: 0; }

        /* Modal overlay */
        #stepper-pdf-modal-overlay {
          display: none; position: fixed; inset: 0; z-index: 10000;
          background: rgba(0,0,0,0.65); backdrop-filter: blur(8px);
          align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.25s;
        }
        #stepper-pdf-modal-overlay.active { display: flex; opacity: 1; }

        /* Modal box */
        #stepper-pdf-modal {
          background: linear-gradient(160deg, #1e1e38 0%, #161625 100%);
          border: 1px solid rgba(165,180,252,0.15);
          border-radius: 24px; padding: 32px; max-width: 540px; width: 92%;
          color: #e0e0e0;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
          transform: translateY(20px) scale(0.97); opacity: 0;
          transition: transform 0.3s cubic-bezier(.4,0,.2,1), opacity 0.3s;
        }
        #stepper-pdf-modal-overlay.active #stepper-pdf-modal {
          transform: translateY(0) scale(1); opacity: 1;
        }
        #stepper-pdf-modal h2 {
          margin: 0 0 6px; font-size: 20px; font-weight: 800; color: #a5b4fc;
          background: linear-gradient(135deg, #a5b4fc, #818cf8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        #stepper-pdf-modal p { margin: 0 0 20px; font-size: 13px; color: #888; line-height: 1.6; }

        /* Dropzone */
        #stepper-pdf-dropzone {
          border: 2px dashed rgba(99,102,241,0.35); border-radius: 16px;
          padding: 40px 20px; text-align: center; cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          margin-bottom: 16px; position: relative; overflow: hidden;
        }
        #stepper-pdf-dropzone::after {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, rgba(99,102,241,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        #stepper-pdf-dropzone:hover, #stepper-pdf-dropzone.dragover {
          border-color: #6366f1; background: rgba(99,102,241,0.08);
          transform: scale(1.01);
        }
        #stepper-pdf-dropzone svg { width: 36px; height: 36px; fill: #6366f1; margin: 0 auto 10px; display: block; }
        #stepper-pdf-dropzone .label { font-size: 14px; font-weight: 700; color: #c4b5fd; }
        #stepper-pdf-dropzone .sublabel { font-size: 11px; color: #555; margin-top: 6px; }
        #stepper-pdf-file-input { display: none; }

        /* Status */
        #stepper-pdf-status {
          display: none; padding: 10px 14px; border-radius: 12px;
          font-size: 13px; margin-bottom: 14px; font-weight: 600;
        }
        #stepper-pdf-status.loading { display: block; background: rgba(99,102,241,0.12); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.25); }
        #stepper-pdf-status.success { display: block; background: rgba(34,197,94,0.1); color: #86efac; border: 1px solid rgba(34,197,94,0.2); }
        #stepper-pdf-status.error { display: block; background: rgba(239,68,68,0.1); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }

        /* Results */
        #stepper-pdf-results {
          display: none; max-height: 260px; overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
          padding: 14px; margin-bottom: 14px; background: rgba(0,0,0,0.25);
        }
        #stepper-pdf-results::-webkit-scrollbar { width: 6px; }
        #stepper-pdf-results::-webkit-scrollbar-track { background: transparent; }
        #stepper-pdf-results::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
        #stepper-pdf-results .meta-row { display: flex; gap: 8px; margin-bottom: 5px; font-size: 12px; }
        #stepper-pdf-results .meta-label { color: #666; min-width: 90px; }
        #stepper-pdf-results .meta-value { color: #ddd; font-weight: 600; }
        #stepper-pdf-results .steps-header { margin-top: 10px; font-size: 13px; font-weight: 700; color: #a5b4fc; margin-bottom: 6px; }
        #stepper-pdf-results .step-item { display: flex; gap: 8px; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 11px; }
        #stepper-pdf-results .step-count { color: #818cf8; font-weight: 700; min-width: 32px; }
        #stepper-pdf-results .step-desc { color: #bbb; flex: 1; }
        #stepper-pdf-results .step-foot { color: #666; font-size: 10px; min-width: 36px; text-align: right; }

        /* Buttons */
        .stepper-pdf-btn-row { display: flex; gap: 10px; justify-content: flex-end; }
        .stepper-pdf-btn {
          padding: 10px 22px; border: none; border-radius: 999px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          transition: transform 0.15s, opacity 0.15s, box-shadow 0.2s;
        }
        .stepper-pdf-btn:hover { transform: translateY(-1px); }
        .stepper-pdf-btn:active { transform: translateY(0); }
        .stepper-pdf-btn-cancel { background: rgba(255,255,255,0.08); color: #999; }
        .stepper-pdf-btn-cancel:hover { background: rgba(255,255,255,0.12); color: #ccc; }
        .stepper-pdf-btn-apply {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff; display: none;
          box-shadow: 0 4px 16px rgba(79,70,229,0.4), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .stepper-pdf-btn-apply:hover { box-shadow: 0 8px 24px rgba(79,70,229,0.55); }

        @media (max-width: 640px) {
          #stepper-pdf-import-btn { bottom: 70px; right: 12px; padding: 10px 16px; font-size: 12px; }
        }
        @media print { #stepper-pdf-import-container { display: none !important; } }
      </style>

      <button id="stepper-pdf-import-btn" data-testid="pdf-import-button" title="Import dance steps from a PDF stepsheet">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-5-6v4h-2v-4H9l3-3 3 3h-2z"/></svg>
        Import PDF
      </button>

      <div id="stepper-pdf-modal-overlay" data-testid="pdf-import-modal">
        <div id="stepper-pdf-modal">
          <h2>Import from PDF</h2>
          <p>Upload a PDF stepsheet and the dance steps will be extracted into the editor automatically.</p>
          <div id="stepper-pdf-dropzone" data-testid="pdf-dropzone">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-5-6v4h-2v-4H9l3-3 3 3h-2z"/></svg>
            <div class="label">Drop your PDF here or click to browse</div>
            <div class="sublabel">Supports standard line-dance stepsheets (max 10MB)</div>
          </div>
          <input type="file" id="stepper-pdf-file-input" accept=".pdf" data-testid="pdf-file-input" />
          <div id="stepper-pdf-status"></div>
          <div id="stepper-pdf-results" data-testid="pdf-results"></div>
          <div class="stepper-pdf-btn-row">
            <button class="stepper-pdf-btn stepper-pdf-btn-cancel" id="stepper-pdf-cancel" data-testid="pdf-cancel-button">Cancel</button>
            <button class="stepper-pdf-btn stepper-pdf-btn-apply" id="stepper-pdf-apply" data-testid="pdf-apply-button">Apply to Editor</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    bindEvents();
    startTabWatcher();
    startImportUiWatcher();
    updateButtonVisibility();
  }

  function bindEvents() {
    const btn = document.getElementById('stepper-pdf-import-btn');
    const overlay = document.getElementById('stepper-pdf-modal-overlay');
    const dropzone = document.getElementById('stepper-pdf-dropzone');
    const fileInput = document.getElementById('stepper-pdf-file-input');
    const cancelBtn = document.getElementById('stepper-pdf-cancel');
    const applyBtn = document.getElementById('stepper-pdf-apply');

    btn.addEventListener('click', () => { overlay.classList.add('active'); resetModal(); });
    cancelBtn.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if (fileInput.files.length > 0) handleFile(fileInput.files[0]); });

    applyBtn.addEventListener('click', () => {
      if (parsedData) { applyToEditor(parsedData); overlay.classList.remove('active'); }
    });
  }

  function resetModal() {
    parsedData = null;
    const status = document.getElementById('stepper-pdf-status');
    const results = document.getElementById('stepper-pdf-results');
    const applyBtn = document.getElementById('stepper-pdf-apply');
    status.className = ''; status.style.display = 'none'; status.textContent = '';
    results.style.display = 'none'; results.innerHTML = '';
    applyBtn.style.display = 'none';
    document.getElementById('stepper-pdf-file-input').value = '';
  }

  function setStatus(type, msg) {
    const s = document.getElementById('stepper-pdf-status');
    s.className = type; s.textContent = msg; s.style.display = 'block';
  }

  function getImportCore() {
    const core = window.StepperPdfImportCore;
    if (!core) throw new Error('Stepper PDF import core is missing.');
    return core;
  }

  async function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) { setStatus('error', 'Please select a PDF file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setStatus('error', 'File too large (max 10MB).'); return; }

    setStatus('loading', 'Parsing PDF...');
    document.getElementById('stepper-pdf-results').style.display = 'none';
    document.getElementById('stepper-pdf-apply').style.display = 'none';

    try {
      const importCore = getImportCore();
      const result = await importCore.requestPdfParse(file);
      const data = await importCore.enrichImportedData(result.data, result.base);

      parsedData = data;
      const n = (data.steps || []).length;
      setStatus('success', `Found ${n} step${n !== 1 ? 's' : ''}${data.title ? ' in "' + data.title + '"' : ''}.`);
      renderResults(data);
      document.getElementById('stepper-pdf-apply').style.display = 'inline-block';
    } catch (err) {
      const message = err && err.message ? err.message : 'Could not reach the server.';
      const isNetworkError = !err || !err.status;
      setStatus('error', isNetworkError ? ('Network error: ' + message) : message);
    }
  }

  function renderResults(data) {
    const results = document.getElementById('stepper-pdf-results');
    let html = '';
    if (data.title) html += row('Title', data.title);
    if (data.choreographer) html += row('Choreographer', data.choreographer);
    if (data.music) html += row('Music', data.music);
    if (data.count) html += row('Counts', data.count);
    if (data.level) html += row('Level', data.level);

    if (data.steps && data.steps.length > 0) {
      html += `<div class="steps-header">Extracted Steps (${data.steps.length})</div>`;
      data.steps.forEach((step, i) => {
        html += `<div class="step-item"><span class="step-count">${esc(step.counts || String(i + 1))}</span><span class="step-desc">${esc(step.description || step.name)}</span><span class="step-foot">${esc(step.foot)}</span></div>`;
      });
    }
    results.innerHTML = html;
    results.style.display = 'block';
  }

  function row(label, val) { return `<div class="meta-row"><span class="meta-label">${label}</span><span class="meta-value">${esc(val)}</span></div>`; }
  function esc(str) { const d = document.createElement('div'); d.textContent = String(str || ''); return d.innerHTML; }

  function applyToEditor(data) {
    const importCore = getImportCore();
    const snapshot = importCore.buildEditorSnapshot(data);
    importCore.writeEditorSnapshot(snapshot);
    try {
      localStorage.setItem('stepper_last_loaded_source', JSON.stringify({
        source: 'pdf-import',
        title: String((data && data.title) || 'Untitled'),
        updatedAt: new Date().toISOString()
      }));
    } catch {}
    window.__STEPPER_PDF_DATA = data;
    window.dispatchEvent(new CustomEvent('stepper-pdf-import', { detail: data }));
    window.dispatchEvent(new CustomEvent('stepper:worksheet-loaded', { detail: { data: snapshot } }));
    window.dispatchEvent(new CustomEvent('stepper-pdf-live-apply', { detail: snapshot }));
    try { if (typeof window.__stepperRefreshWorksheetFromStorage === 'function') window.__stepperRefreshWorksheetFromStorage(); } catch (_) {}
    tryDirectPopulate(data);
    setStatus('success', 'Imported into the editor live. No reload needed.');
  }

  function tryDirectPopulate(data) {
    const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
    inputs.forEach(input => {
      const ph = (input.placeholder || '').toLowerCase();
      const nm = (input.name || '').toLowerCase();
      if ((ph.includes('title') || ph.includes('dance name') || nm.includes('title')) && data.title) setNative(input, data.title);
      if ((ph.includes('choreographer') || ph.includes('choreo') || nm.includes('choreographer')) && data.choreographer) setNative(input, data.choreographer);
      if ((ph.includes('music') || ph.includes('song') || nm.includes('music')) && data.music) setNative(input, data.music);
    });
  }

  function setNative(el, val) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }



  // Only inject on pages that have the editor
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/sheet' || path === '' || path === '/index.html' || path === '/index') {
    waitForApp(injectPdfImportUI);
  }
  };
})();
