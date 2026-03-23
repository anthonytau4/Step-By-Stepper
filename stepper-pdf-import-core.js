/**
 * stepper-pdf-import-core.js
 * Shared parsing/import helpers extracted from stepper-pdf-import.js to reduce merge conflicts.
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

  async function fileToBase64(file) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read that PDF file.'));
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64 = result.includes(',') ? result.split(',').pop() : result;
        resolve(base64 || '');
      };
      reader.readAsDataURL(file);
    });
  }

  async function requestPdfParse(file) {
    const retryableStatuses = new Set([0, 404, 405, 413, 422, 502, 503, 504]);
    const candidates = getApiBaseCandidates(window.STEPPER_API_BASE);
    let lastError = null;
    const fileBase64 = await fileToBase64(file);

    for (const base of candidates) {
      const endpoint = base + '/api/pdf/parse';
      try {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: String(file && file.name || 'stepsheet.pdf'), fileBase64 })
        });
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
          || /Failed to fetch|NetworkError|Load failed/i.test(String(err && err.message || ''));
        if (retryable && base !== candidates[candidates.length - 1]) continue;
        throw err;
      }
    }

    throw lastError || new Error('Could not reach the PDF import backend.');
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
      walls: String(data && data.wall || (existing.meta && existing.meta.walls) || '').trim()
    });
    const importedSteps = Array.isArray(data && data.steps) ? data.steps : [];
    const sections = [{
      id: makeId(),
      name: String(data && data.title || 'Imported PDF').trim(),
      steps: importedSteps.length
        ? importedSteps
        : [{ id: makeId(), type: 'step', count: '', name: '', description: '', foot: 'Either', weight: false, showNote: false, note: '' }]
    }];
    return {
      meta,
      sections,
      tags: [],
      isDarkMode: !!existing.isDarkMode
    };
  }

  window.StepperPdfImportCore = {
    requestPdfParse,
    enrichImportedData,
    buildEditorSnapshot,
    writeEditorSnapshot
  };
})();
