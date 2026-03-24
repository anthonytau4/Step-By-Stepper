/**
 * stepper-pdf-import-runtime.js
 * Unified PDF import runtime kept on a new path to avoid merge conflicts on prior split files.
 */
(function() {
  'use strict';


    const API_BASE_KEY = 'stepper_api_base_v1';
    const DEFAULT_BACKEND_BASE = 'https://step-by-stepper.onrender.com';
    const ALT_BACKEND_BASE = 'https://api.step-by-stepper.com';
    const DATA_KEY = 'linedance_builder_data_v13';

    function normalizeApiBase(value) {
      return String(value || '').trim().replace(/\/+$/, '');
    }

    function rememberApiBase(value) {
      const normalized = normalizeApiBase(value);
      if (!normalized) return;
      window.STEPPER_API_BASE = normalized;
      try { localStorage.setItem(API_BASE_KEY, normalized); } catch (_) {}
    }

    function makeId() {
      return Math.random().toString(36).slice(2, 11);
    }

    function readEditorSnapshot() {
      try {
        const raw = localStorage.getItem(DATA_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    }

    function writeEditorSnapshot(snapshot) {
      const raw = JSON.stringify(snapshot);
      localStorage.setItem(DATA_KEY, raw);
      try {
        window.dispatchEvent(new StorageEvent('storage', { key: DATA_KEY, newValue: raw }));
      } catch (_) {}
      try { window.dispatchEvent(new Event('storage')); } catch (_) {}
      try { window.dispatchEvent(new CustomEvent('stepper-pdf-live-apply', { detail: snapshot })); } catch (_) {}
      try { if (typeof window.__stepperRefreshWorksheetFromStorage === 'function') window.__stepperRefreshWorksheetFromStorage(); } catch (_) {}
    }

    function readSessionCredential() {
      try {
        const raw = localStorage.getItem('stepper_google_auth_session_v2');
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && parsed.credential ? String(parsed.credential).trim() : '';
      } catch (_) {
        return '';
      }
    }

    function getAudioUrl() {
      const path = window.location.pathname.replace(/\/+/g, '/');
      return (/^\/sheet(\/|$)/).test(path) ? '../loading-screen-song.m4a' : './loading-screen-song.m4a';
    }

    let loadingAudio = null;
    function startLoadingAudio() {
      try {
        if (!loadingAudio) {
          loadingAudio = new Audio(getAudioUrl());
          loadingAudio.loop = true;
          loadingAudio.preload = 'auto';
          loadingAudio.volume = 0.45;
        }
        loadingAudio.currentTime = 0;
        const playAttempt = loadingAudio.play();
        if (playAttempt && typeof playAttempt.catch === 'function') playAttempt.catch(() => {});
      } catch (_) {}
    }

    function stopLoadingAudio() {
      try {
        if (loadingAudio) { loadingAudio.pause(); loadingAudio.currentTime = 0; }
      } catch (_) {}
    }

    function setProgress(percent, label, detail) {
      const wrap = document.getElementById('stepper-pdf-progress-wrap');
      const bar = document.getElementById('stepper-pdf-progress-bar');
      const text = document.getElementById('stepper-pdf-progress-text');
      const line = document.getElementById('stepper-pdf-progress-detail');
      if (wrap) wrap.style.display = 'block';
      if (bar) bar.style.width = `${Math.max(0, Math.min(100, Number(percent) || 0))}%`;
      if (text) text.textContent = label || '';
      if (line) line.textContent = detail || '';
    }

    function resetProgress() {
      setProgress(0, '', '');
      const wrap = document.getElementById('stepper-pdf-progress-wrap');
      if (wrap) wrap.style.display = 'none';
    }

    function delayFrame(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function autoAddGlossarySteps(data, preferredBase) {
      const credential = readSessionCredential();
      if (!credential) return { skipped: true, reason: 'not-signed-in' };
      const payload = buildGlossaryRequestPayload(data);
      if (!payload.length) return { skipped: true, reason: 'no-steps' };
      const candidates = getApiBaseCandidates(preferredBase);
      let lastError = null;
      for (const base of candidates) {
        try {
          const resp = await fetch(base + '/api/glossary/auto-add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${credential}` },
            body: JSON.stringify({ steps: payload, tags: String(data && data.title || 'Imported PDF').trim() })
          });
          const json = await resp.json().catch(() => null);
          if (resp.ok && json && json.ok) {
            rememberApiBase(base);
            return { ok: true, added: Number(json.added || 0) };
          }
          lastError = new Error(json && (json.error || json.detail) || 'Glossary auto-add failed.');
        } catch (err) {
          lastError = err;
        }
      }
      return { skipped: true, reason: lastError ? String(lastError.message || lastError) : 'failed' };
    }

    function getApiBaseCandidates(preferred) {
      const candidates = [];
      const push = (value) => {
        const normalized = normalizeApiBase(value);
        if (!normalized || candidates.includes(normalized)) return;
        candidates.push(normalized);
      };
      const currentOrigin = (location.protocol === 'http:' || location.protocol === 'https:')
        ? normalizeApiBase(location.origin)
        : '';

      push(preferred);
      push(window.STEPPER_API_BASE);
      try { push(localStorage.getItem(API_BASE_KEY)); } catch (_) {}
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        push('http://localhost:3000');
        push(currentOrigin);
        return candidates;
      }
      push(DEFAULT_BACKEND_BASE);
      push(ALT_BACKEND_BASE);
      if (currentOrigin && !/step-by-stepper\.com$/i.test(location.hostname)) push(currentOrigin);
      return candidates;
    }


    async function probeApiBaseCandidate(base) {
      const normalized = normalizeApiBase(base);
      if (!normalized) return null;
      try {
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 2800) : null;
        const resp = await fetch(normalized + '/api/health', {
          headers: { Accept: 'application/json' },
          signal: controller ? controller.signal : undefined
        });
        if (timeoutId) clearTimeout(timeoutId);
        if (!resp.ok) return null;
        const data = await resp.json().catch(() => null);
        if (data && data.ok) {
          rememberApiBase(normalized);
          return normalized;
        }
      } catch (_) {}
      return null;
    }

    async function warmApiBase(preferred) {
      const candidates = getApiBaseCandidates(preferred);
      for (const candidate of candidates) {
        const working = await probeApiBaseCandidate(candidate);
        if (working) return working;
      }
      return null;
    }

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function requestPdfParse(formData) {
      const retryableStatuses = new Set([0, 404, 405, 408, 425, 429, 500, 502, 503, 504]);
      await warmApiBase(window.STEPPER_API_BASE).catch(() => null);
      let lastError = null;

      for (let pass = 0; pass < 2; pass += 1) {
        const candidates = getApiBaseCandidates(window.STEPPER_API_BASE);
        for (const base of candidates) {
          const endpoint = base + '/api/pdf/parse';
          try {
            const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
            const timeoutId = controller ? setTimeout(() => controller.abort(), pass === 0 ? 15000 : 25000) : null;
            const resp = await fetch(endpoint, {
              method: 'POST',
              body: formData,
              headers: { Accept: 'application/json' },
              signal: controller ? controller.signal : undefined
            });
            if (timeoutId) clearTimeout(timeoutId);
            const contentType = (resp.headers.get('content-type') || '').toLowerCase();
            const isJson = contentType.includes('application/json');
            const data = isJson ? await resp.json().catch(() => null) : null;

            if (resp.ok && data && data.ok) {
              rememberApiBase(base);
              return { base, endpoint, data };
            }

            const bodyPreview = data
            ? ''
            : (await resp.text().catch(() => '')).trim().replace(/\s+/g, ' ').slice(0, 120);
            const message = data && (data.detail || data.error)
            ? (data.detail || data.error)
            : `PDF import hit ${endpoint}, but the server responded with ${contentType || 'non-JSON content'}${bodyPreview ? `. Received ${bodyPreview}.` : '.'}`;
            const error = new Error(message);
            error.status = resp.status;
            error.endpoint = endpoint;
            error.retryable = !isJson || retryableStatuses.has(Number(resp.status));
            lastError = error;
            if (error.retryable && base !== candidates[candidates.length - 1]) continue;
            throw error;
          } catch (err) {
            lastError = err;
            const status = Number(err && err.status || 0);
            const retryable = Boolean(err && err.retryable)
              || !status
              || retryableStatuses.has(status)
              || /Failed to fetch|NetworkError|Load failed|abort/i.test(String(err && err.message || ''));
            if (retryable && base !== candidates[candidates.length - 1]) continue;
            throw err;
          }
        }

        await delay(pass === 0 ? 1400 : 2200);
        await warmApiBase(window.STEPPER_API_BASE).catch(() => null);
      }

      throw lastError || new Error('Could not reach the PDF import backend after retrying every known server.');
    }

    async function fetchJsonAcrossCandidates(path, preferredBase) {
      const candidates = getApiBaseCandidates(preferredBase);
      for (const base of candidates) {
        const endpoint = base + path;
        try {
          const resp = await fetch(endpoint, { headers: { Accept: 'application/json' } });
            const contentType = (resp.headers.get('content-type') || '').toLowerCase();
          if (!resp.ok || !contentType.includes('application/json')) continue;
          const data = await resp.json().catch(() => null);
          if (data && data.ok) return { base, data };
        } catch (_) {}
      }
      return null;
    }

    async function enrichImportedData(data, preferredBase) {
      const [glossaryResult, memoryResult] = await Promise.all([
        fetchJsonAcrossCandidates('/api/glossary/steps', preferredBase),
        fetchJsonAcrossCandidates('/api/site-memory', preferredBase)
      ]);
      const glossaryItems = glossaryResult && Array.isArray(glossaryResult.data.items)
        ? glossaryResult.data.items
        : [];
      const siteMemory = memoryResult && Array.isArray(memoryResult.data.items)
        ? memoryResult.data.items
        : [];
      return Object.assign({}, data, {
        steps: normalizeImportedSteps(data.steps || [], glossaryItems, siteMemory)
      });
    }

    function buildGlossaryRequestPayload(data) {
      const seen = new Set();
      return (Array.isArray(data && data.steps) ? data.steps : []).map((step) => ({
        name: String(step && step.name || '').trim(),
        description: String(step && (step.description || step.name) || '').trim(),
        counts: String(step && (step.counts || step.count) || '1').trim() || '1',
        foot: normalizeEditorFoot(step && step.foot),
        tags: String(data && data.title || 'Imported PDF').trim()
      })).filter((step) => {
        const key = `${step.name}::${step.description}`.toLowerCase();
        if (!step.name || !step.description || seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 12);
    }

    async function submitGlossaryRequests(data, preferredBase) {
      const payload = buildGlossaryRequestPayload(data);
      if (!payload.length) throw new Error('No imported steps were available to send to the glossary.');
      const candidates = getApiBaseCandidates(preferredBase);
      let authError = null;
      let lastError = null;
      for (const base of candidates) {
        for (const step of payload) {
          try {
            const resp = await fetch(base + '/api/glossary/request', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ step })
            });
            const data = await resp.json().catch(() => null);
            if (resp.ok && data && data.ok) {
              rememberApiBase(base);
              continue;
            }
            if (resp.status === 401 || resp.status === 403) {
              authError = new Error('Sign in with Google first, then send the imported AI steps to the glossary.');
              authError.status = resp.status;
              break;
            }
            lastError = new Error(data && (data.error || data.detail) || 'Could not send imported steps to the glossary.');
            lastError.status = resp.status;
            break;
          } catch (err) {
            lastError = err;
            break;
          }
        }
        if (authError) throw authError;
        if (!lastError) return payload.length;
      }
      throw authError || lastError || new Error('Could not send imported steps to the glossary.');
    }

    async function copyGlossaryPayload(data) {
      const payload = buildGlossaryRequestPayload(data);
      const text = JSON.stringify(payload, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return payload.length;
      }
      throw new Error('Clipboard copy is not available in this browser.');
    }

    function normalizeImportedSteps(steps, glossaryItems, siteMemory) {
      const glossaryByName = new Map();
      const glossaryByDescription = [];
      (glossaryItems || []).forEach((item) => {
        const nameKey = String(item && item.name || '').trim().toLowerCase();
        const descKey = String(item && item.description || '').trim().toLowerCase();
        if (nameKey && !glossaryByName.has(nameKey)) glossaryByName.set(nameKey, item);
        if (descKey) glossaryByDescription.push([descKey, item]);
      });

      return (steps || []).map((step, index) => {
        const rawName = String(step && step.name || '').trim();
        const rawDescription = String(step && (step.description || step.name) || '').trim().replace(/\s+/g, ' ');
        const matched = glossaryByName.get(rawName.toLowerCase())
          || glossaryByName.get(deriveStepName(rawDescription).toLowerCase())
          || glossaryByDescription.find(([desc]) => {
            const lowerDescription = rawDescription.toLowerCase();
            return desc === lowerDescription || lowerDescription.includes(desc) || desc.includes(lowerDescription);
          });
        const glossaryMatch = Array.isArray(matched) ? matched[1] : matched;
        const memoryHint = findRelevantSiteMemory(rawDescription, siteMemory);
        const name = glossaryMatch && glossaryMatch.name ? glossaryMatch.name : deriveStepName(rawName || rawDescription);
        const description = glossaryMatch && glossaryMatch.description ? glossaryMatch.description : rawDescription;
        const foot = normalizeEditorFoot(step && step.foot || (glossaryMatch && glossaryMatch.foot) || inferFootFromText(description));
        const counts = String(step && step.counts || (glossaryMatch && (glossaryMatch.counts || glossaryMatch.count)) || index + 1 || '1').trim() || '1';
        return {
          id: makeId(),
          type: 'step',
          count: counts,
          counts,
          name,
          description,
          foot,
          weight: foot === 'L' || foot === 'R',
          showNote: !!memoryHint,
          note: memoryHint
        };
      });
    }

    function deriveStepName(text) {
      const source = String(text || '').trim().replace(/\s+/g, ' ');
      if (!source) return 'Imported Step';
      const firstClause = source.split(/[.,;:]/)[0].trim();
      const words = firstClause.split(/\s+/).slice(0, 6).map((word) => word.charAt(0).toUpperCase() + word.slice(1));
      return words.join(' ') || 'Imported Step';
    }

    function inferFootFromText(text) {
      const lower = String(text || '').toLowerCase();
      if (lower.includes(' right ') || lower.startsWith('right ') || lower.endsWith(' right')) return 'R';
      if (lower.includes(' left ') || lower.startsWith('left ') || lower.endsWith(' left')) return 'L';
      if (lower.includes('both')) return 'Both';
      return 'Either';
    }

    function normalizeEditorFoot(value) {
      const lower = String(value || '').trim().toLowerCase();
      if (lower === 'right' || lower === 'r') return 'R';
      if (lower === 'left' || lower === 'l') return 'L';
      if (lower === 'both') return 'Both';
      return 'Either';
    }

    function findRelevantSiteMemory(description, items) {
      const text = String(description || '').toLowerCase();
      const memories = (items || []).map((item) => String(item && item.text || '').trim()).filter(Boolean);
      const hit = memories.find((entry) => {
        const lower = entry.toLowerCase();
        return lower.includes('glossary') || lower.includes('counts') || lower.includes('foot') || lower.includes('write');
      });
      return hit && text ? `AI helper memory: ${hit.slice(0, 220)}` : '';
    }

    function buildEditorSnapshot(data) {
      const existing = readEditorSnapshot() || {};
      const meta = Object.assign({}, existing.meta || {}, {
        title: String(data && data.title || '').trim(),
        choreographer: String(data && data.choreographer || '').trim(),
        music: String(data && data.music || '').trim(),
        level: String(data && data.level || (existing.meta && existing.meta.level) || '').trim(),
        counts: String(data && (data.count || data.counts) || (existing.meta && existing.meta.counts) || '').trim(),
        walls: String(data && (data.wall || data.walls) || (existing.meta && existing.meta.walls) || '').trim()
      });
      const importedSteps = Array.isArray(data && data.steps) ? data.steps : [];
      const sourceSections = Array.isArray(data && data.sections) && data.sections.length
        ? data.sections
        : [{ title: String(data && data.title || 'Imported PDF').trim(), kind: 'section', steps: importedSteps }];
      const sections = sourceSections.map((section, index) => ({
        id: makeId(),
        name: String(section && (section.title || section.name) || (index === 0 ? (data && data.title || 'Imported PDF') : `Section ${index + 1}`)).trim(),
        steps: []
      }));
      return {
        meta,
        sections,
        tags: [],
        isDarkMode: !!existing.isDarkMode
      };
    }

  window.StepperPdfImportRuntimeInit = function StepperPdfImportRuntimeInit() {

    warmApiBase(window.STEPPER_API_BASE).catch(() => {});

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
          <div id="stepper-pdf-progress-wrap" style="display:none;margin-bottom:14px;">
            <div id="stepper-pdf-progress-text" style="font-size:12px;font-weight:800;color:#c7d2fe;margin-bottom:6px;"></div>
            <div style="height:10px;border-radius:999px;background:rgba(255,255,255,0.08);overflow:hidden;"><div id="stepper-pdf-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#6366f1,#7c3aed,#22c55e);transition:width .2s ease;"></div></div>
            <div id="stepper-pdf-progress-detail" style="font-size:11px;color:#8b8b99;margin-top:6px;min-height:16px;"></div>
          </div>
          <div id="stepper-pdf-results" data-testid="pdf-results"></div>
          <div class="stepper-pdf-btn-row">
            <button class="stepper-pdf-btn stepper-pdf-btn-cancel" id="stepper-pdf-cancel" data-testid="pdf-cancel-button">Cancel</button>
            <button class="stepper-pdf-btn" id="stepper-pdf-glossary" data-testid="pdf-glossary-button" style="display:none;background:rgba(99,102,241,0.16);color:#c4b5fd;border:1px solid rgba(99,102,241,0.28);">Send AI Steps to Glossary</button>
            <button class="stepper-pdf-btn" id="stepper-pdf-copy-glossary" data-testid="pdf-copy-glossary-button" style="display:none;background:rgba(255,255,255,0.08);color:#ddd;border:1px solid rgba(255,255,255,0.1);">Copy Glossary JSON</button>
            <button class="stepper-pdf-btn stepper-pdf-btn-apply" id="stepper-pdf-apply" data-testid="pdf-apply-button">Apply to Editor</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    bindEvents();
    startTabWatcher();
    updateButtonVisibility();
  }

  function bindEvents() {
    const btn = document.getElementById('stepper-pdf-import-btn');
    const overlay = document.getElementById('stepper-pdf-modal-overlay');
    const dropzone = document.getElementById('stepper-pdf-dropzone');
    const fileInput = document.getElementById('stepper-pdf-file-input');
    const cancelBtn = document.getElementById('stepper-pdf-cancel');
    const glossaryBtn = document.getElementById('stepper-pdf-glossary');
    const copyGlossaryBtn = document.getElementById('stepper-pdf-copy-glossary');
    const applyBtn = document.getElementById('stepper-pdf-apply');

    btn.addEventListener('click', () => { overlay.classList.add('active'); resetModal(); });
    cancelBtn.addEventListener('click', () => { stopLoadingAudio(); overlay.classList.remove('active'); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) { stopLoadingAudio(); overlay.classList.remove('active'); } });

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if (fileInput.files.length > 0) handleFile(fileInput.files[0]); });

    glossaryBtn.addEventListener('click', async () => {
      if (!parsedData) return;
      try {
        setStatus('loading', 'Sending imported AI steps to the glossary...');
        const count = await submitGlossaryRequests(parsedData, window.STEPPER_API_BASE);
        setStatus('success', `Sent ${count} imported AI step${count !== 1 ? 's' : ''} to the glossary for approval.`);
      } catch (err) {
        setStatus('error', err && err.message ? err.message : 'Could not send imported steps to the glossary.');
      }
    });

    copyGlossaryBtn.addEventListener('click', async () => {
      if (!parsedData) return;
      try {
        const count = await copyGlossaryPayload(parsedData);
        setStatus('success', `Copied ${count} imported AI glossary step payload${count !== 1 ? 's' : ''} to the clipboard.`);
      } catch (err) {
        setStatus('error', err && err.message ? err.message : 'Could not copy glossary payload.');
      }
    });

    applyBtn.addEventListener('click', () => {
      if (parsedData) { Promise.resolve(applyToEditor(parsedData)).then(() => { overlay.classList.remove('active'); }).catch((error) => { console.error('[Stepper PDF Import] Apply failed', error); setStatus('error', error && error.message ? error.message : 'Could not apply that import live.'); stopLoadingAudio(); }); }
    });
  }

  function resetModal() {
    parsedData = null;
    stopLoadingAudio();
    resetProgress();
    const status = document.getElementById('stepper-pdf-status');
    const results = document.getElementById('stepper-pdf-results');
    const applyBtn = document.getElementById('stepper-pdf-apply');
    const glossaryBtn = document.getElementById('stepper-pdf-glossary');
    const copyGlossaryBtn = document.getElementById('stepper-pdf-copy-glossary');
    status.className = ''; status.style.display = 'none'; status.textContent = '';
    results.style.display = 'none'; results.innerHTML = '';
    applyBtn.style.display = 'none';
    glossaryBtn.style.display = 'none';
    copyGlossaryBtn.style.display = 'none';
    document.getElementById('stepper-pdf-file-input').value = '';
  }

  function setStatus(type, msg) {
    const s = document.getElementById('stepper-pdf-status');
    s.className = type; s.textContent = msg; s.style.display = 'block';
  }

  async function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.pdf')) { setStatus('error', 'Please select a PDF file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setStatus('error', 'File too large (max 10MB).'); return; }

    startLoadingAudio();
    setProgress(6, 'Parsing PDF', 'Starting the Python parser and AI cleanup.');
    setStatus('loading', 'Waking the AI PDF importer and parsing your file...');
    document.getElementById('stepper-pdf-results').style.display = 'none';
    document.getElementById('stepper-pdf-apply').style.display = 'none';

    try {
      const result = await requestPdfParse(file);
      setProgress(58, 'Cleaning parse', 'Python finished. Matching glossary steps and rebuilding sections.');
      const data = await enrichImportedData(result.data, result.base);

      parsedData = data;
      const n = (data.steps || []).length;
      const danceType = String(data && data.danceType || '').trim();
      setProgress(100, 'Parse complete', danceType ? `${danceType}. ${n} step${n !== 1 ? 's' : ''} ready to apply.` : `${n} step${n !== 1 ? 's' : ''} ready to apply.`);
      setStatus('success', `Found ${n} step${n !== 1 ? 's' : ''}${data.title ? ' in "' + data.title + '"' : ''}.`);
      renderResults(data);
      document.getElementById('stepper-pdf-apply').style.display = 'inline-block';
      document.getElementById('stepper-pdf-glossary').style.display = 'inline-block';
      document.getElementById('stepper-pdf-copy-glossary').style.display = 'inline-block';
    } catch (err) {
      stopLoadingAudio();
      resetProgress();
      const message = err && err.message ? err.message : 'Could not reach the server.';
      const isNetworkError = !err || !err.status;
      setStatus('error', isNetworkError ? (`Network error: ${message} The importer retried every known backend. If the server was asleep, wait a moment and try again.`) : message);
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
    if (data.walls || data.wall) html += row('Walls', data.walls || data.wall);

    const sections = Array.isArray(data.sections) ? data.sections : [];
    if (sections.length) {
      html += `<div class="steps-header">Detected Sections / Parts (${sections.length})</div>`;
      sections.forEach((section, index) => {
        const kind = section && section.kind ? String(section.kind) : 'section';
        const count = Array.isArray(section && section.steps) ? section.steps.length : 0;
        html += `<div class="meta-row"><span class="meta-label">${esc(kind === 'part' ? 'Part' : 'Section')}</span><span class="meta-value">${count ? `${count} steps` : 'Ready'}</span></div>`;
      });
    }

    if (data.steps && data.steps.length > 0) {
      html += `<div class="steps-header">Extracted Steps (${data.steps.length})</div>`;
      data.steps.forEach((step, i) => {
        html += `<div class="step-item"><span class="step-count">${esc(step.counts || String(i + 1))}</span><span class="step-desc">${esc(step.description || step.name)}</span><span class="step-foot">${esc(step.foot)}</span></div>`;
      });
    }

    const log = data && data.importLog ? data.importLog : null;
    if (log) {
      html += `<div class="steps-header">Import Log</div>`;
      html += row('Dance Type', log.danceType || data.danceType || 'Non part dance');
      html += row('Sections', String(log.sectionCount ?? data.sectionCount ?? sections.length ?? 0));
      html += row('Parts', String(log.partCount ?? data.partCount ?? sections.filter(section => section.kind === 'part').length ?? 0));
      html += row('Tags', String(log.tagCount ?? data.tagCount ?? 0));
      html += row('Restarts', String(log.restartCount ?? data.restartCount ?? 0));
      if (log.danceFeel) html += row('Feel', log.danceFeel);
      if (log.smartSectionSize) html += row('Smart Section Size', log.smartSectionSize);
      if (log.counts) html += row('Counts', log.counts);
      if (log.walls) html += row('Walls', log.walls);
      if (log.level) html += row('Level', log.level);
      if (log.choreographer) html += row('Choreographer', log.choreographer);
      if (log.music) html += row('Music', log.music);
    }
    results.innerHTML = html;
    results.style.display = 'block';
  }

  function row(label, val) { return `<div class="meta-row"><span class="meta-label">${label}</span><span class="meta-value">${esc(val)}</span></div>`; }
  function esc(str) { const d = document.createElement('div'); d.textContent = String(str || ''); return d.innerHTML; }

  async function applyToEditor(data) {
    startLoadingAudio();
    const structuredSections = Array.isArray(data && data.sections) && data.sections.length
      ? data.sections
      : [{ title: String(data && data.title || 'Imported PDF').trim() || 'Imported PDF', kind: 'section', steps: Array.isArray(data && data.steps) ? data.steps : [] }];
    const snapshot = buildEditorSnapshot(Object.assign({}, data, { steps: [] }));
    writeEditorSnapshot(snapshot);
    tryDirectPopulate(data);
    setStatus('loading', 'Pushing imported steps live into the worksheet...');
    setProgress(8, 'Applying metadata', 'Title, counts, choreographer, and music are going into the editor.');
    await delayFrame(120);
    const totalSteps = structuredSections.reduce((sum, section) => sum + (Array.isArray(section && section.steps) ? section.steps.length : 0), 0);
    let applied = 0;
    for (let s = 0; s < structuredSections.length; s += 1) {
      const sourceSection = structuredSections[s] || {};
      const targetSection = snapshot.sections && snapshot.sections[s] ? snapshot.sections[s] : null;
      if (targetSection) {
        targetSection.name = String(sourceSection.kind === 'part' ? (sourceSection.title || sourceSection.name || '') : '').trim();
        targetSection.steps = [];
      }
      const sourceSteps = Array.isArray(sourceSection.steps) ? sourceSection.steps : [];
      setProgress(10 + Math.round((applied / Math.max(totalSteps, 1)) * 70), sourceSection.kind === 'part' ? `Loading part ${s + 1}` : `Loading section ${s + 1}`, String(sourceSection.title || sourceSection.name || ''));
      await delayFrame(60);
      for (let i = 0; i < sourceSteps.length; i += 1) {
        const step = sourceSteps[i];
        if (targetSection) targetSection.steps.push(step);
        applied += 1;
        writeEditorSnapshot(snapshot);
        tryDirectPopulate(Object.assign({}, data, { steps: sourceSteps.slice(0, i + 1) }));
        const label = step && step.markerType ? `${String(step.markerType).replace(/^./, (m) => m.toUpperCase())}: ${step.description || step.name || ''}` : (step && (step.name || step.description || 'Imported step'));
        setProgress(10 + Math.round((applied / Math.max(totalSteps, 1)) * 70), 'Adding steps in real time', `Adding ${sourceSection.kind === 'part' ? 'part' : 'section'} ${s + 1}, step ${i + 1}: ${label}`);
        await delayFrame(Math.min(65, totalSteps > 28 ? 20 : 38));
      }
    }
    writeEditorSnapshot(snapshot);
    window.__STEPPER_PDF_DATA = data;
    window.dispatchEvent(new CustomEvent('stepper-pdf-import', { detail: data }));
    window.dispatchEvent(new CustomEvent('stepper:worksheet-loaded', { detail: { data: snapshot } }));
    const glossaryResult = await autoAddGlossarySteps(data, window.STEPPER_API_BASE).catch(() => ({ skipped: true }));
    setProgress(92, 'Syncing cloud + glossary', glossaryResult && glossaryResult.ok ? `Added ${glossaryResult.added} imported step${glossaryResult.added === 1 ? '' : 's'} into Glossary+.` : 'Glossary+ skipped or unchanged.');
    window.dispatchEvent(new CustomEvent('stepper-pdf-import-complete', { detail: { data, snapshot, glossaryResult } }));
    setStatus('success', glossaryResult && glossaryResult.ok ? `Imported live with ${totalSteps} steps and added ${glossaryResult.added} step${glossaryResult.added === 1 ? '' : 's'} to Glossary+.` : `Imported live with ${totalSteps} steps. Glossary+ was left alone.`);
    setProgress(100, 'Import finished', `${data && data.danceType ? data.danceType + '. ' : ''}Everything is live in the worksheet now.`);
    stopLoadingAudio();
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
