/**
 * stepper-pdf-import.js
 * PDF Import feature for Step By Stepper
 * Adds a "Import from PDF" button to the sheet editor page.
 * Parses uploaded PDFs via the backend and populates the dance editor.
 */
(function() {
  'use strict';

  const API_BASE = window.STEPPER_API_BASE || '';

  function getApiBase() {
    // Use the configured API base, or fall back to same-origin
    return API_BASE || window.location.origin;
  }

  // Wait for the app to be ready
  function waitForApp(cb, maxWait) {
    maxWait = maxWait || 15000;
    const start = Date.now();
    const check = () => {
      // Look for the main app container or the React root
      const root = document.getElementById('root');
      if (root && root.children.length > 0) {
        // Give React a moment to finish rendering
        setTimeout(cb, 500);
        return;
      }
      if (Date.now() - start < maxWait) {
        setTimeout(check, 300);
      }
    };
    check();
  }

  // Create and inject the PDF import UI
  function injectPdfImportUI() {
    // Don't inject if already present
    if (document.getElementById('stepper-pdf-import-container')) return;

    // Create floating action button
    const container = document.createElement('div');
    container.id = 'stepper-pdf-import-container';
    container.setAttribute('data-testid', 'pdf-import-container');
    container.innerHTML = `
      <style>
        #stepper-pdf-import-btn {
          position: fixed;
          bottom: 90px;
          right: 20px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 48%, #7c3aed 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(79,70,229,0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        #stepper-pdf-import-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(79,70,229,0.5);
        }
        #stepper-pdf-import-btn:active {
          transform: translateY(0);
        }
        #stepper-pdf-import-btn svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }
        #stepper-pdf-modal-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 10000;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          align-items: center;
          justify-content: center;
        }
        #stepper-pdf-modal-overlay.active {
          display: flex;
        }
        #stepper-pdf-modal {
          background: #1a1a2e;
          border: 1px solid rgba(165,180,252,0.2);
          border-radius: 24px;
          padding: 32px;
          max-width: 520px;
          width: 90%;
          color: #e0e0e0;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
        }
        #stepper-pdf-modal h2 {
          margin: 0 0 8px;
          font-size: 20px;
          font-weight: 800;
          color: #a5b4fc;
        }
        #stepper-pdf-modal p {
          margin: 0 0 20px;
          font-size: 14px;
          color: #999;
          line-height: 1.5;
        }
        #stepper-pdf-dropzone {
          border: 2px dashed rgba(99,102,241,0.4);
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          margin-bottom: 16px;
        }
        #stepper-pdf-dropzone:hover,
        #stepper-pdf-dropzone.dragover {
          border-color: #6366f1;
          background: rgba(99,102,241,0.08);
        }
        #stepper-pdf-dropzone svg {
          width: 40px;
          height: 40px;
          fill: #6366f1;
          margin: 0 auto 12px;
          display: block;
        }
        #stepper-pdf-dropzone .label {
          font-size: 15px;
          font-weight: 600;
          color: #c4b5fd;
        }
        #stepper-pdf-dropzone .sublabel {
          font-size: 12px;
          color: #666;
          margin-top: 6px;
        }
        #stepper-pdf-file-input {
          display: none;
        }
        #stepper-pdf-status {
          display: none;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 16px;
        }
        #stepper-pdf-status.loading {
          display: block;
          background: rgba(99,102,241,0.15);
          color: #a5b4fc;
          border: 1px solid rgba(99,102,241,0.3);
        }
        #stepper-pdf-status.success {
          display: block;
          background: rgba(34,197,94,0.15);
          color: #86efac;
          border: 1px solid rgba(34,197,94,0.3);
        }
        #stepper-pdf-status.error {
          display: block;
          background: rgba(239,68,68,0.15);
          color: #fca5a5;
          border: 1px solid rgba(239,68,68,0.3);
        }
        #stepper-pdf-results {
          display: none;
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          background: rgba(0,0,0,0.2);
        }
        #stepper-pdf-results .meta-row {
          display: flex;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 13px;
        }
        #stepper-pdf-results .meta-label {
          color: #888;
          min-width: 100px;
        }
        #stepper-pdf-results .meta-value {
          color: #e0e0e0;
          font-weight: 600;
        }
        #stepper-pdf-results .steps-header {
          margin-top: 12px;
          font-size: 14px;
          font-weight: 700;
          color: #a5b4fc;
          margin-bottom: 8px;
        }
        #stepper-pdf-results .step-item {
          display: flex;
          gap: 8px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-size: 12px;
        }
        #stepper-pdf-results .step-count {
          color: #6366f1;
          font-weight: 700;
          min-width: 30px;
        }
        #stepper-pdf-results .step-desc {
          color: #ccc;
          flex: 1;
        }
        #stepper-pdf-results .step-foot {
          color: #888;
          font-size: 11px;
        }
        .stepper-pdf-btn-row {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .stepper-pdf-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .stepper-pdf-btn:hover { opacity: 0.85; }
        .stepper-pdf-btn-cancel {
          background: rgba(255,255,255,0.1);
          color: #ccc;
        }
        .stepper-pdf-btn-apply {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          color: #fff;
          display: none;
        }
        @media (max-width: 640px) {
          #stepper-pdf-import-btn {
            bottom: 70px;
            right: 12px;
            padding: 10px 16px;
            font-size: 12px;
          }
        }
        @media print {
          #stepper-pdf-import-container { display: none !important; }
        }
      </style>
      <button id="stepper-pdf-import-btn" data-testid="pdf-import-button" title="Import dance steps from a PDF stepsheet">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-5-6v4h-2v-4H9l3-3 3 3h-2z"/></svg>
        Import PDF
      </button>
      <div id="stepper-pdf-modal-overlay" data-testid="pdf-import-modal">
        <div id="stepper-pdf-modal">
          <h2>Import from PDF</h2>
          <p>Upload a PDF stepsheet to automatically extract dance steps and populate the editor.</p>
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

    // State
    let parsedData = null;

    // Elements
    const btn = document.getElementById('stepper-pdf-import-btn');
    const overlay = document.getElementById('stepper-pdf-modal-overlay');
    const dropzone = document.getElementById('stepper-pdf-dropzone');
    const fileInput = document.getElementById('stepper-pdf-file-input');
    const status = document.getElementById('stepper-pdf-status');
    const results = document.getElementById('stepper-pdf-results');
    const cancelBtn = document.getElementById('stepper-pdf-cancel');
    const applyBtn = document.getElementById('stepper-pdf-apply');

    // Open modal
    btn.addEventListener('click', () => {
      overlay.classList.add('active');
      resetModal();
    });

    // Close modal
    cancelBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });

    // Dropzone
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    });
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });

    // Apply button
    applyBtn.addEventListener('click', () => {
      if (parsedData) {
        applyToEditor(parsedData);
        overlay.classList.remove('active');
      }
    });

    function resetModal() {
      parsedData = null;
      status.className = '';
      status.style.display = 'none';
      status.textContent = '';
      results.style.display = 'none';
      results.innerHTML = '';
      applyBtn.style.display = 'none';
      fileInput.value = '';
    }

    function setStatus(type, msg) {
      status.className = type;
      status.textContent = msg;
      status.style.display = 'block';
    }

    async function handleFile(file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setStatus('error', 'Please select a PDF file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setStatus('error', 'File too large (max 10MB).');
        return;
      }

      setStatus('loading', 'Parsing PDF... This may take a moment.');
      results.style.display = 'none';
      applyBtn.style.display = 'none';

      const formData = new FormData();
      formData.append('file', file);

      try {
        const resp = await fetch(getApiBase() + '/api/pdf/parse', {
          method: 'POST',
          body: formData
        });
        const data = await resp.json();

        if (!resp.ok || !data.ok) {
          setStatus('error', data.detail || data.error || 'Failed to parse PDF.');
          return;
        }

        parsedData = data;
        const stepCount = (data.steps || []).length;
        setStatus('success', `Found ${stepCount} step${stepCount !== 1 ? 's' : ''}${data.title ? ' in "' + data.title + '"' : ''}.`);
        renderResults(data);
        applyBtn.style.display = 'inline-block';

      } catch (err) {
        setStatus('error', 'Network error: ' + (err.message || 'Could not reach the server.'));
      }
    }

    function renderResults(data) {
      let html = '';
      if (data.title) html += `<div class="meta-row"><span class="meta-label">Title</span><span class="meta-value">${esc(data.title)}</span></div>`;
      if (data.choreographer) html += `<div class="meta-row"><span class="meta-label">Choreographer</span><span class="meta-value">${esc(data.choreographer)}</span></div>`;
      if (data.music) html += `<div class="meta-row"><span class="meta-label">Music</span><span class="meta-value">${esc(data.music)}</span></div>`;
      if (data.count) html += `<div class="meta-row"><span class="meta-label">Counts</span><span class="meta-value">${esc(data.count)}</span></div>`;
      if (data.level) html += `<div class="meta-row"><span class="meta-label">Level</span><span class="meta-value">${esc(data.level)}</span></div>`;

      if (data.steps && data.steps.length > 0) {
        html += `<div class="steps-header">Extracted Steps (${data.steps.length})</div>`;
        data.steps.forEach((step, i) => {
          html += `<div class="step-item">
            <span class="step-count">${esc(step.counts || String(i + 1))}</span>
            <span class="step-desc">${esc(step.description || step.name)}</span>
            <span class="step-foot">${esc(step.foot)}</span>
          </div>`;
        });
      }

      results.innerHTML = html;
      results.style.display = 'block';
    }

    function esc(str) {
      const d = document.createElement('div');
      d.textContent = String(str || '');
      return d.innerHTML;
    }

    function applyToEditor(data) {
      // Dispatch a custom event that the React app can listen to
      // This is the cleanest way to communicate with the pre-built React app
      const event = new CustomEvent('stepper-pdf-import', {
        detail: {
          title: data.title || '',
          choreographer: data.choreographer || '',
          music: data.music || '',
          count: data.count || '',
          level: data.level || '',
          wall: data.wall || '',
          steps: data.steps || [],
          rawText: data.rawText || ''
        }
      });
      window.dispatchEvent(event);

      // Also try to directly populate if we can find React state setters
      // by using window.__STEPPER_PDF_DATA for the app to pick up
      window.__STEPPER_PDF_DATA = data;

      // Fallback: try to find and fill form inputs directly
      tryDirectPopulate(data);
    }

    function tryDirectPopulate(data) {
      // Try to find the dance title input and set it
      const inputs = document.querySelectorAll('input[type="text"], input:not([type])');
      inputs.forEach(input => {
        const placeholder = (input.placeholder || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        if ((placeholder.includes('title') || placeholder.includes('dance name') || name.includes('title')) && data.title) {
          setNativeValue(input, data.title);
        }
        if ((placeholder.includes('choreographer') || placeholder.includes('choreo') || name.includes('choreographer')) && data.choreographer) {
          setNativeValue(input, data.choreographer);
        }
        if ((placeholder.includes('music') || placeholder.includes('song') || name.includes('music')) && data.music) {
          setNativeValue(input, data.music);
        }
      });

      // Show a notification that data is ready
      showImportToast(data);
    }

    function setNativeValue(el, value) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function showImportToast(data) {
      const stepCount = (data.steps || []).length;
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;padding:14px 24px;border-radius:999px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-size:14px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,0.3);transition:opacity 0.3s;';
      toast.textContent = `PDF imported: ${stepCount} steps${data.title ? ' from "' + data.title + '"' : ''}. Check the editor!`;
      toast.setAttribute('data-testid', 'pdf-import-toast');
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }
  }

  // Only inject on the sheet page (or all pages if we can't determine)
  const path = window.location.pathname.replace(/\/$/, '');
  if (path === '/sheet' || path === '' || path === '/index.html') {
    waitForApp(injectPdfImportUI);
  }
})();
