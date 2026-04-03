(function(){
  if (window.__stepperPhrasedToolsInstalled) return;
  window.__stepperPhrasedToolsInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const FEATURED_KEY = 'stepper_featured_dances_v2';
  const PHR_TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  const SETTINGS_KEY = 'stepper_sound_settings_v1';
  const SAVE_LATER_KEY = 'stepper_save_for_later_v1';
  const SAVE_LATER_SESSION_KEY = 'stepper_save_for_later_session_v1';
  const PHR_PANEL_ID = 'stepper-inline-phrased-tools';
  const MENU_ID = 'stepper-part-context-menu';
  const PREVIEW_NOTE_ID = 'stepper-preview-phrased-summary';
  const FEATURED_EMAIL_KEY = 'stepper_featured_email_v1';
  const FONT_FAMILIES = {
    system: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    rounded: '"Trebuchet MS", "Avenir Next", "Segoe UI", sans-serif',
    elegant: 'Georgia, "Times New Roman", serif'
  };
  const EXTRA_NOTES = [
    'New: Counts and Walls can stay on Auto, and Sheet now shows the detected values instead of printing AUTO.',
    'New: Glossary+ suggestions can help add missing step names and cleaner wording from real step sheets.',
    'New: phrased dance tools support editable Parts, a Sequence tab, and tag-aware phrased building for A/B/C plus Tag-style layouts.',
    'New: right-clicking a section header can drop that section straight into a new Part, with editable labels from the start.',
    'New: Settings and Choreography now sit above the editor, keeping the main build tools closer to where the work happens.',
    'New: Choreography surfaces dances built on this device so in-progress work is easier to reach.',
    'Fix: pages are less likely to interrupt typing while you work through longer edits.',
    'Fix: Thinking Music no longer keeps restarting itself, the title screen fits short phone screens better, and the page-switch GIF behaves properly on Android.'
  ];


  function getUniqueExtraNotes(){
    return Array.from(new Set(EXTRA_NOTES.map(note => String(note || '').trim()).filter(Boolean)));
  }
  let lastFeaturedSignature = '';
  let contextMenuState = null;

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function readJson(key, fallback){
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readAppData(){
    return readJson(DATA_KEY, null);
  }

  function writeAppData(data){
    if (!data) return;
    writeJson(DATA_KEY, data);
  }

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function buildEditableDanceProject(data, suppliedTools){
    const safeData = data || {};
    const tools = suppliedTools ? clone(suppliedTools) : clone(normalizePhrasedTools(safeData));
    return {
      version: 1,
      data: clone(safeData),
      phrasedTools: tools
    };
  }

  function restoreEditableDanceProject(payload, fallbackSnapshot){
    let parsed = payload;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch { parsed = null; }
    }
    const source = parsed && typeof parsed === 'object' ? parsed : null;
    const snapshot = fallbackSnapshot && typeof fallbackSnapshot === 'object' ? fallbackSnapshot : null;
    const nextData = source && source.data ? source.data : (snapshot && snapshot.data ? snapshot.data : snapshot);
    const nextTools = source && source.phrasedTools ? source.phrasedTools : (snapshot && snapshot.phrasedTools ? snapshot.phrasedTools : {});
    if (!nextData || typeof nextData !== 'object') return false;
    writeAppData(nextData);
    writeStoredPhrasedTools(nextTools || {});
    return true;
  }

  function getSettings(){
    const saved = readJson(SETTINGS_KEY, {});
    return {
      sfxEnabled: saved.sfxEnabled !== false,
      thinkingMusicEnabled: saved.thinkingMusicEnabled === true
    };
  }

  function saveSettings(settings){
    const current = getSettings();
    writeJson(SETTINGS_KEY, Object.assign({}, current, settings));
  }

  function getUpgradedFontFamily(){
    try {
      const upgraded = JSON.parse(localStorage.getItem('stepper_settings_v1') || '{}');
      const chosen = String((upgraded && upgraded.fontFamily) || '').trim();
      if (chosen) {
        const published = getComputedStyle(document.documentElement).getPropertyValue('--stepper-font-family').trim();
        if (published) return published;
      }
    } catch {}
    return getComputedStyle(document.documentElement).getPropertyValue('--stepper-font-family').trim() || '';
  }

  function isDarkMode(){
    const data = readAppData();
    return !!(data && data.isDarkMode);
  }

  function themeClasses(){
    const dark = isDarkMode();
    return {
      dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      button: dark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500',
      accent: dark ? 'bg-indigo-500 text-neutral-950' : 'bg-indigo-600 text-white',
      orange: dark ? 'bg-orange-500 text-neutral-950' : 'bg-orange-500 text-white'
    };
  }

  function getFeaturedRecipient(){
    return localStorage.getItem(FEATURED_EMAIL_KEY) || '';
  }

  function alphaLabel(index){
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (index < letters.length) return letters[index];
    const major = Math.floor(index / letters.length);
    const minor = index % letters.length;
    return letters[minor] + String(major + 1);
  }

  function readStoredPhrasedTools(){
    return readJson(PHR_TOOLS_KEY, {});
  }

  function writeStoredPhrasedTools(value){
    writeJson(PHR_TOOLS_KEY, value || {});
  }

  function normalizePhrasedTools(data, suppliedRaw){
    if (!data) return { danceFormat:'regular', uiTab:'parts', parts:[], sequence:[] };
    const sectionIds = new Set((Array.isArray(data.sections) ? data.sections : []).map(section => section && section.id).filter(Boolean));
    const tagIds = new Set((Array.isArray(data.tags) ? data.tags : []).map(tag => tag && tag.id).filter(Boolean));
    const raw = suppliedRaw || readStoredPhrasedTools() || {};
    const parts = Array.isArray(raw.parts) ? raw.parts.map((part, index) => ({
      id: part && part.id ? String(part.id) : 'part-' + alphaLabel(index).toLowerCase() + '-' + index,
      label: String((part && part.label) || alphaLabel(index)).trim() || alphaLabel(index),
      title: String((part && part.title) || '').trim(),
      sectionIds: Array.isArray(part && part.sectionIds) ? part.sectionIds.filter(id => sectionIds.has(id)) : []
    })).filter(part => part.sectionIds.length > 0 || part.title || part.label) : [];
    const sequence = Array.isArray(raw.sequence) ? raw.sequence.filter(item => item && ((item.kind === 'part' && parts.some(part => part.id === item.id)) || (item.kind === 'tag' && tagIds.has(item.id)))) : [];
    return {
      danceFormat: raw.danceFormat === 'phrased' ? 'phrased' : 'regular',
      uiTab: raw.uiTab === 'sequence' ? 'sequence' : 'parts',
      parts,
      sequence
    };
  }

  function writePhrasedTools(mutator){
    const data = readAppData();
    if (!data) return;
    const current = normalizePhrasedTools(data);
    const next = typeof mutator === 'function' ? mutator(clone(current), clone(data)) : current;
    writeStoredPhrasedTools(next);
  }

  function getMainSections(data){
    return Array.isArray(data && data.sections) ? data.sections : [];
  }

  function getTags(data){
    return Array.isArray(data && data.tags) ? data.tags : [];
  }

  function numericTokens(text){
    const matches = String(text || '').match(/\d+/g);
    return matches ? matches.map(Number).filter(Number.isFinite) : [];
  }

  function deriveSectionCount(section, data){
    const steps = Array.isArray(section && section.steps) ? section.steps : [];
    let maxValue = 0;
    for (const step of steps) {
      const nums = numericTokens(step && step.count);
      for (const value of nums) maxValue = Math.max(maxValue, value || 0);
    }
    if (maxValue > 0) return maxValue;
    const danceType = (data && data.meta && data.meta.type) === 'waltz' ? 6 : 8;
    if (!steps.length) return 0;
    return Math.min(danceType, Math.max(1, steps.length));
  }

  function derivePartCount(part, data){
    const sections = getMainSections(data);
    const map = new Map(sections.map(section => [section.id, section]));
    return (Array.isArray(part && part.sectionIds) ? part.sectionIds : []).reduce((sum, sectionId) => sum + deriveSectionCount(map.get(sectionId), data), 0);
  }

  function deriveCounts(data){
    if (!data) return '-';
    const tools = normalizePhrasedTools(data);
    if (tools.danceFormat === 'phrased' && tools.parts.length) {
      return String(tools.parts.reduce((sum, part) => sum + derivePartCount(part, data), 0) || '-');
    }
    const total = getMainSections(data).reduce((sum, section) => sum + deriveSectionCount(section, data), 0);
    return String(total || '-');
  }

  function turnFractionToEighths(value){
    const key = String(value || '').toLowerCase().trim();
    if (key === 'full') return 8;
    if (key === '1/2') return 4;
    if (key === '1/4') return 2;
    if (key === '3/4') return 6;
    if (key === '1/8') return 1;
    if (key === '3/8') return 3;
    if (key === '5/8') return 5;
    if (key === '7/8') return 7;
    return 0;
  }

  function deriveWalls(data){
    if (!data) return '-';
    const tools = normalizePhrasedTools(data);
    if (tools.danceFormat === 'phrased' && tools.parts.length) return '1';
    const sections = getMainSections(data);
    let totalTurnInEighths = 0;
    sections.forEach((section) => {
      (Array.isArray(section && section.steps) ? section.steps : []).forEach((step) => {
        if (!step || step.type !== 'step') return;
        const descriptionText = String(step.description || '').toLowerCase();
        const nameText = String(step.name || '').toLowerCase();
        const turnPattern = /(?:turn(?:ing)?\s+(full|[1357]\/8|1\/4|1\/2|3\/4)|\b(full|[1357]\/8|1\/4|1\/2|3\/4)\s+turn\b)/g;
        const descriptionMatches = descriptionText.match(turnPattern) || [];
        const nameMatches = descriptionMatches.length ? [] : (nameText.match(turnPattern) || []);
        [...descriptionMatches, ...nameMatches].forEach((match) => {
          const fractionMatch = match.match(/full|[1357]\/8|1\/4|1\/2|3\/4/);
          if (fractionMatch) totalTurnInEighths += turnFractionToEighths(fractionMatch[0]);
        });
      });
    });
    const normalized = ((totalTurnInEighths % 8) + 8) % 8;
    if (normalized === 0) return '1';
    if (normalized === 4) return '2';
    if (normalized > 0) return '4';
    const current = String((data.meta && data.meta.walls) || '').trim();
    return current || '4';
  }

  function levelDisplay(data){
    const meta = (data && data.meta) || {};
    const tools = normalizePhrasedTools(data);
    const level = String(meta.level || 'Unlabelled').trim() || 'Unlabelled';
    return tools.danceFormat === 'phrased' ? level + ' Phrased' : level;
  }

  function sequenceLabel(item, data){
    if (!item) return '';
    const tools = normalizePhrasedTools(data);
    if (item.kind === 'part') {
      const part = tools.parts.find(entry => entry.id === item.id);
      return part ? (part.label || part.title || 'Part') : 'Part';
    }
    if (item.kind === 'tag') {
      const tag = getTags(data).find(entry => entry.id === item.id);
      return tag ? (String(tag.name || 'Tag').trim() || 'Tag') : 'Tag';
    }
    return '';
  }

  function deriveSequenceString(data){
    const tools = normalizePhrasedTools(data);
    if (tools.danceFormat !== 'phrased' || !tools.sequence.length) return '';
    return tools.sequence.map(item => sequenceLabel(item, data)).filter(Boolean).join(', ');
  }

  function currentDanceIdentity(data){
    const meta = (data && data.meta) || {};
    const title = String(meta.title || '').trim();
    const choreographer = String(meta.choreographer || '').trim();
    return {
      id: (title || 'untitled').toLowerCase() + '|' + (choreographer || 'unknown').toLowerCase(),
      title: title || 'Untitled Dance',
      choreographer: choreographer || 'Uncredited'
    };
  }

  function hasDanceContent(data){
    if (!data || !data.meta) return false;
    const identity = currentDanceIdentity(data);
    return !!(identity.title !== 'Untitled Dance' || identity.choreographer !== 'Uncredited' || getMainSections(data).some(section => Array.isArray(section && section.steps) && section.steps.length));
  }

  function buildSnapshotEntry(data){
    const identity = currentDanceIdentity(data);
    const tools = normalizePhrasedTools(data);
    const sections = getMainSections(data);
    const sectionCount = sections.length;
    const stepCount = sections.reduce((sum, section) => sum + ((section && Array.isArray(section.steps)) ? section.steps.length : 0), 0);
    const projectPayload = buildEditableDanceProject(data, tools);
    return {
      id: identity.id,
      title: identity.title,
      choreographer: identity.choreographer,
      country: String((data.meta && data.meta.country) || '').trim(),
      level: levelDisplay(data),
      counts: deriveCounts(data),
      walls: deriveWalls(data),
      music: String((data.meta && data.meta.music) || '').trim(),
      format: tools.danceFormat,
      sequence: deriveSequenceString(data),
      sections: sectionCount,
      steps: stepCount,
      updatedAt: new Date().toISOString(),
      projectJson: JSON.stringify(projectPayload),
      snapshot: { data: projectPayload.data, phrasedTools: projectPayload.phrasedTools }
    };
  }

  function saveFeaturedSnapshot(){
    const data = readAppData();
    if (!hasDanceContent(data)) return;
    const entry = buildSnapshotEntry(data);
    const signature = JSON.stringify({ id: entry.id, counts: entry.counts, walls: entry.walls, level: entry.level, music: entry.music, format: entry.format, sequence: entry.sequence, projectJson: entry.projectJson, snapshot: entry.snapshot });
    if (signature === lastFeaturedSignature) return;
    lastFeaturedSignature = signature;
    let featured = readJson(FEATURED_KEY, []);
    if (!Array.isArray(featured)) featured = [];
    const existingIndex = featured.findIndex(item => item && item.id === entry.id);
    if (existingIndex >= 0) featured[existingIndex] = Object.assign({}, featured[existingIndex], entry);
    else featured.unshift(entry);
    featured.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    featured = featured.slice(0, 120);
    writeJson(FEATURED_KEY, featured);
  }

  function getFeaturedDances(){
    const featured = readJson(FEATURED_KEY, []);
    return Array.isArray(featured) ? featured : [];
  }

  function deleteSavedDance(id){
    const featured = getFeaturedDances().filter(item => item && item.id !== id);
    writeJson(FEATURED_KEY, featured);
  }

  function loadSavedDance(id){
    const entry = getFeaturedDances().find(item => item && item.id === id);
    if (!entry) return;
    if (restoreEditableDanceProject(entry.projectJson, entry.snapshot)) softRefreshAfterRestore();
  }



  function softRefreshAfterRestore(){
    try { window.dispatchEvent(new Event('storage')); } catch {}
    try { window.dispatchEvent(new CustomEvent('stepper:worksheet-loaded', { detail: { data: readAppData() || {} } })); } catch {}
    try { window.dispatchEvent(new CustomEvent('stepper-pdf-live-apply', { detail: readAppData() || {} })); } catch {}
    try { if (typeof window.__stepperRefreshWorksheetFromStorage === 'function') window.__stepperRefreshWorksheetFromStorage(); } catch {}
  }

  function getSavedForLater(){
    return readJson(SAVE_LATER_KEY, null);
  }

  function saveCurrentProjectForLater(){
    const data = readAppData();
    if (!hasDanceContent(data)) return false;
    const projectPayload = buildEditableDanceProject(data);
    const payload = {
      savedAt: new Date().toISOString(),
      projectJson: JSON.stringify(projectPayload),
      snapshot: {
        data: projectPayload.data,
        phrasedTools: projectPayload.phrasedTools
      }
    };
    writeJson(SAVE_LATER_KEY, payload);
    try { sessionStorage.setItem(SAVE_LATER_SESSION_KEY, 'ready'); } catch {}
    return true;
  }

  function maybeRestoreSavedForLaterOnBoot(){
    let payload = null;
    try { payload = getSavedForLater(); } catch {}
    if (!payload || (!payload.snapshot && !payload.projectJson)) return false;
    try {
      if (sessionStorage.getItem(SAVE_LATER_SESSION_KEY) === 'restored') return false;
    } catch {}

    let parsedProject = payload.projectJson;
    if (typeof parsedProject === 'string') {
      try { parsedProject = JSON.parse(parsedProject); } catch { parsedProject = null; }
    }
    const targetData = parsedProject && parsedProject.data ? parsedProject.data : (payload.snapshot && (payload.snapshot.data || payload.snapshot));
    const targetTools = parsedProject && parsedProject.phrasedTools ? parsedProject.phrasedTools : (payload.snapshot && payload.snapshot.phrasedTools ? payload.snapshot.phrasedTools : {});
    if (!targetData || typeof targetData !== 'object') return false;

    const currentData = readAppData();
    const currentTools = readStoredPhrasedTools();
    const same = JSON.stringify(currentData || {}) === JSON.stringify(targetData || {}) && JSON.stringify(currentTools || {}) === JSON.stringify(targetTools || {});
    if (!same) {
      writeAppData(targetData);
      writeStoredPhrasedTools(targetTools || {});
      try { sessionStorage.setItem(SAVE_LATER_SESSION_KEY, 'restored'); } catch {}
      softRefreshAfterRestore();
      return true;
    }
    try { sessionStorage.setItem(SAVE_LATER_SESSION_KEY, 'restored'); } catch {}
    return false;
  }

  function buildFeaturedSubmissionLink(source){
    const entry = source || buildSnapshotEntry(readAppData() || { meta:{} });
    const subject = `Step by Stepper Featured Dance Submission – ${entry.title}`;
    const to = getFeaturedRecipient();
    const body = [
      'Hello,',
      '',
      'Please review this dance for the Featured Dances section in Step by Stepper.',
      '(You must attach the PDF.)',
      '',
      `Dance Title: ${entry.title}`,
      `Choreographer: ${entry.choreographer}`,
      '',
      'Sent from Step by Stepper.'
    ].join('\n');
    return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function formatDate(iso){
    try { return new Date(iso).toLocaleString(); } catch { return 'Recently'; }
  }

  function ensureCustomStyles(){
    if (document.getElementById('stepper-phrased-tools-style')) return;
    const style = document.createElement('style');
    style.id = 'stepper-phrased-tools-style';
    style.textContent = `
      #root, #stepper-static-startup, #root button, #root input, #root select, #root textarea { font-family: var(--stepper-font-family, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif); }
      .stepper-extra-tab-icon, .stepper-setting-icon, .stepper-panel-icon { display:inline-flex; align-items:center; justify-content:center; width:1.45rem; height:1.45rem; }
      .stepper-extra-tab-icon svg, .stepper-setting-icon svg, .stepper-panel-icon svg { width:100%; height:100%; }
      .stepper-note-badge { display:inline-flex; align-items:center; justify-content:center; width:2rem; height:2rem; border-radius:.9rem; border:1px solid rgba(255,255,255,.1); box-shadow:0 10px 24px rgba(15,23,42,.18), inset 0 1px 0 rgba(255,255,255,.16); }
      .stepper-note-badge svg { width:1rem; height:1rem; }
      .stepper-note-badge.is-stepper { background:linear-gradient(180deg,#1f2a44 0%,#312e81 100%); color:#f8fafc; }
      .stepper-note-badge.is-gold { background:linear-gradient(180deg,#facc15 0%,#f59e0b 100%); color:#5b3200; border-color:rgba(180,83,9,.28); box-shadow:0 10px 24px rgba(180,83,9,.2), inset 0 1px 0 rgba(255,255,255,.32); }
      .stepper-part-pill { display:inline-flex; align-items:center; gap:.45rem; padding:.55rem .8rem; border-radius:999px; font-weight:800; font-size:.76rem; letter-spacing:.08em; text-transform:uppercase; }
      .stepper-mini-btn { border-radius:999px; padding:.55rem .9rem; font-weight:800; font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; border:1px solid rgba(99,102,241,.25); }
      .stepper-tools-tab { border-radius:999px; padding:.55rem .9rem; font-weight:800; font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; border:1px solid transparent; }
      .stepper-tools-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; }
      .stepper-field label { display:block; font-size:.68rem; font-weight:900; letter-spacing:.14em; text-transform:uppercase; margin-bottom:.45rem; }
      .stepper-field input, .stepper-field select { width:100%; border-radius:1rem; border:1px solid rgba(148,163,184,.35); padding:.85rem .95rem; background:rgba(255,255,255,.9); color:#111827; }
      .dark .stepper-field input, .dark .stepper-field select { background:rgba(23,23,23,.9); color:#f5f5f5; border-color:rgba(64,64,64,.9); }
      .stepper-font-choice { width:100%; text-align:left; border-radius:1.35rem; border:1px solid rgba(99,102,241,.18); padding:1rem 1rem .95rem; transition:transform .15s ease, border-color .15s ease, box-shadow .15s ease; }
      .stepper-font-choice:hover { transform:translateY(-1px); box-shadow:0 10px 24px rgba(79,70,229,.12); }
      .stepper-font-choice strong { display:block; font-size:1rem; line-height:1.15; }
      .stepper-font-choice span { display:block; margin-top:.3rem; font-size:.8rem; opacity:.8; }
      .stepper-font-choice[data-active="true"] { border-color:rgba(79,70,229,.72); box-shadow:0 0 0 2px rgba(99,102,241,.18); }
      .stepper-seq-row { display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:.65rem; align-items:center; }
      .stepper-danger-btn { border-radius:999px; padding:.55rem .75rem; font-weight:900; text-transform:uppercase; letter-spacing:.08em; font-size:.7rem; }
      #${MENU_ID} { position:fixed; z-index:9999; min-width:220px; border-radius:18px; padding:.55rem; box-shadow:0 18px 36px rgba(0,0,0,.28); }
      #${MENU_ID}[hidden] { display:none; }
      #${MENU_ID} button { width:100%; text-align:left; border-radius:14px; padding:.85rem .95rem; font-weight:800; }
      .stepper-section-header-partable { position:relative; }
      .stepper-section-part-btn { position:absolute; right:2.75rem; top:50%; transform:translateY(-50%); font-size:.58rem; letter-spacing:.12em; text-transform:uppercase; padding:.32rem .55rem; border-radius:999px; background:rgba(99,102,241,.14); color:#4f46e5; font-weight:900; border:0; }
      #${PREVIEW_NOTE_ID} { margin-top:1rem; }
      .stepper-help-fab { position:fixed; left:16px; bottom:16px; z-index:2147483500; width:50px; height:50px; border-radius:999px; border:0; background:#4f46e5; color:#fff; font-size:26px; font-weight:900; box-shadow:0 16px 28px rgba(0,0,0,.28); }
      body { background:#f3f4f6; }
      .dark body, body.dark { background:#0a0a0a; }
      .stepper-help-panel { position:fixed; left:16px; bottom:76px; z-index:2147483499; width:min(92vw, 360px); max-height:min(70vh, 520px); overflow:auto; border-radius:24px; padding:18px; box-shadow:0 18px 40px rgba(0,0,0,.28); }
      .stepper-help-panel[hidden] { display:none !important; }
      .stepper-help-panel h3 { margin:0 0 10px; font-size:1.05rem; font-weight:900; }
      .stepper-help-panel p { margin:.4rem 0; line-height:1.45; }
      .stepper-help-code { display:block; margin-top:6px; padding:8px 10px; border-radius:12px; font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:.82rem; }
      @media (max-width: 640px) {
        .stepper-seq-row { grid-template-columns:minmax(0,1fr) auto; }
        .stepper-seq-row .stepper-row-trash { grid-column:1 / -1; }
      }
    `;
    document.head.appendChild(style);
  }

  function applyFontSettings(){
    const upgradedFamily = getUpgradedFontFamily();
    if (upgradedFamily) {
      document.documentElement.style.setProperty('--stepper-font-family', upgradedFamily);
    }
  }

  function ensureInlineHost(){
    const host = document.getElementById('stepper-editor-inline-host');
    if (!host) return null;
    let stack = host.querySelector('div.space-y-5');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'space-y-5';
      while (host.firstChild) stack.appendChild(host.firstChild);
      host.appendChild(stack);
    }
    let panel = document.getElementById(PHR_PANEL_ID);
    if (!panel) {
      panel = document.createElement('section');
      panel.id = PHR_PANEL_ID;
      const settingsPanel = document.getElementById('stepper-inline-settings');
      if (settingsPanel && settingsPanel.parentNode === stack) stack.insertBefore(panel, settingsPanel);
      else stack.appendChild(panel);
    }
    return host;
  }

  function iconShoe(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h5.426a1 1 0 0 1 .863.496l1.064 1.823a3 3 0 0 0 1.896 1.407l4.677 1.114A4 4 0 0 1 21 14.73V17a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"></path><path d="m14 13 1-2"></path><path d="M8 18v-1a4 4 0 0 0-4-4H3"></path><path d="m10 12 1.5-3"></path></svg>';
  }
  function iconCog(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 8.4a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.97 4.1a1.7 1.7 0 0 0 1.03-1.56V2.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.33 1.82 1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z"></path></svg>';
  }
  function iconSpeaker(on){
    return on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.5 8.5a5 5 0 0 1 0 7"></path><path d="M18.5 5.5a9 9 0 0 1 0 13"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  }
  function iconMusic(on){
    return on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect><path d="M10 16V9l7-1.5V14"></path><circle cx="8" cy="16" r="2"></circle><circle cx="17" cy="14" r="2"></circle></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="19" height="19" rx="5"></rect><path d="M10 16V9l7-1.5V14"></path><circle cx="8" cy="16" r="2"></circle><circle cx="17" cy="14" r="2"></circle><line x1="5" y1="19" x2="19" y2="5"></line></svg>';
  }
  function iconSparkles(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"></path><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"></path><path d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z"></path></svg>';
  }
  function iconBell(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18H5.5a1.5 1.5 0 0 1-1.2-2.4L6 13.5V10a6 6 0 1 1 12 0v3.5l1.7 2.1A1.5 1.5 0 0 1 18.5 18H17"></path><path d="M10 21a2 2 0 0 0 4 0"></path></svg>';
  }
  function iconStepperMark(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16h5v-4h5V8h6"></path><circle cx="20" cy="8" r="2.2" fill="currentColor" stroke="none"></circle></svg>';
  }
  function renderWhatsNewBadge(iconSvg, tone='stepper'){
    const cls = tone === 'gold' ? 'stepper-note-badge is-gold' : 'stepper-note-badge is-stepper';
    return `<span class="${cls}">${iconSvg}</span>`;
  }

  function scrollToPhrasedPanel(){
    const panel = document.getElementById(PHR_PANEL_ID);
    if (!panel) return;
    panel.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  let lastFormattingField = null;

  function isTextEntryField(field){
    if (!field) return false;
    if (field instanceof HTMLTextAreaElement) return true;
    if (!(field instanceof HTMLInputElement)) return false;
    const type = String(field.type || 'text').toLowerCase();
    return !['button','checkbox','color','file','hidden','image','radio','range','reset','submit'].includes(type);
  }

  function rememberFormattingTarget(field){
    if (!isTextEntryField(field)) return;
    lastFormattingField = field;
    try {
      field.__stepperSelStart = typeof field.selectionStart === 'number' ? field.selectionStart : (field.value || '').length;
      field.__stepperSelEnd = typeof field.selectionEnd === 'number' ? field.selectionEnd : (field.value || '').length;
    } catch {}
  }

  function getFormattingTarget(){
    const active = document.activeElement;
    if (isTextEntryField(active)) {
      rememberFormattingTarget(active);
      return active;
    }
    if (isTextEntryField(lastFormattingField) && document.contains(lastFormattingField)) return lastFormattingField;
    return null;
  }

  function wrapSelectionWithMarkers(field, openMarker, closeMarker, forcedStart, forcedEnd){
    if (!field || typeof field.value !== 'string') return;
    const start = typeof forcedStart === 'number'
      ? forcedStart
      : (typeof field.selectionStart === 'number' ? field.selectionStart : (typeof field.__stepperSelStart === 'number' ? field.__stepperSelStart : field.value.length));
    const end = typeof forcedEnd === 'number'
      ? forcedEnd
      : (typeof field.selectionEnd === 'number' ? field.selectionEnd : (typeof field.__stepperSelEnd === 'number' ? field.__stepperSelEnd : field.value.length));
    const safeStart = Math.max(0, Math.min(start, field.value.length));
    const safeEnd = Math.max(safeStart, Math.min(end, field.value.length));
    const value = field.value || '';
    const selected = value.slice(safeStart, safeEnd);
    const replacement = openMarker + selected + closeMarker;
    field.value = value.slice(0, safeStart) + replacement + value.slice(safeEnd);
    const caretStart = safeStart + openMarker.length;
    const caretEnd = selected ? caretStart + selected.length : caretStart;
    field.__stepperSelStart = caretStart;
    field.__stepperSelEnd = caretEnd;
    field.dispatchEvent(new Event('input', { bubbles:true }));
    field.dispatchEvent(new Event('change', { bubbles:true }));
    requestAnimationFrame(() => {
      try {
        field.focus();
        field.setSelectionRange(caretStart, caretEnd);
        rememberFormattingTarget(field);
      } catch {}
    });
  }

  function applyFormattingMarker(openMarker, closeMarker){
    const field = getFormattingTarget();
    if (!field) return false;
    wrapSelectionWithMarkers(field, openMarker, closeMarker, field.__stepperSelStart, field.__stepperSelEnd);
    return true;
  }

  function ensureEditorFormattingShortcuts(){
    if (window.__stepperFormattingShortcutsWired) return;
    window.__stepperFormattingShortcutsWired = true;

    const schedulePreviewRefresh = (() => {
      let queued = false;
      return () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          patchPreviewSurface();
        });
      };
    })();

    const handleFormattingButton = (event) => {
      const button = event.target && event.target.closest ? event.target.closest('button,[role="button"]') : null;
      if (!button) return;
      const label = [button.getAttribute('aria-label'), button.getAttribute('title'), button.textContent]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      if (!label) return;
      let handled = false;
      if (/^(?:b|bold|format bold)$/.test(label)) handled = applyFormattingMarker('**', '**');
      else if (/^(?:i|italic|italics|format italic|format italics)$/.test(label)) handled = applyFormattingMarker('/*', '*/');
      else if (/^(?:u|underline|format underline)$/.test(label)) handled = applyFormattingMarker('_', '_');
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        schedulePreviewRefresh();
      }
    };

    document.addEventListener('focusin', (event) => rememberFormattingTarget(event.target), true);
    document.addEventListener('click', (event) => rememberFormattingTarget(event.target), true);
    document.addEventListener('keyup', (event) => rememberFormattingTarget(event.target), true);
    document.addEventListener('input', (event) => {
      rememberFormattingTarget(event.target);
      schedulePreviewRefresh();
    }, true);
    document.addEventListener('selectionchange', () => rememberFormattingTarget(document.activeElement), true);
    document.addEventListener('click', handleFormattingButton, true);
    document.addEventListener('keydown', (event) => {
      const isShortcut = (event.ctrlKey || event.metaKey) && !event.altKey;
      if (!isShortcut) return;
      const key = (event.key || '').toLowerCase();
      let handled = false;
      if (key === 'b') handled = applyFormattingMarker('**', '**');
      else if (key === 'i') handled = applyFormattingMarker('/*', '*/');
      else if (key === 'u') handled = applyFormattingMarker('_', '_');
      if (handled) {
        event.preventDefault();
        schedulePreviewRefresh();
      }
    });
  }

  function ensureHelpMenu(){
    let fab = document.getElementById('stepper-help-fab');
    let panel = document.getElementById('stepper-help-panel');
    const theme = themeClasses();
    if (!fab) {
      fab = document.createElement('button');
      fab.id = 'stepper-help-fab';
      fab.className = 'stepper-help-fab';
      fab.type = 'button';
      fab.setAttribute('aria-label','Help');
      fab.textContent = '?';
      document.body.appendChild(fab);
    }
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'stepper-help-panel';
      panel.className = 'stepper-help-panel';
      panel.hidden = true;
      document.body.appendChild(panel);
    }
    panel.className = `stepper-help-panel ${theme.shell}`;
    panel.innerHTML = `
      <h3>Help</h3>
      <p><strong>Why the page can jump:</strong> Step by Stepper re-syncs counts, parts, preview notes and saved-dance panels after big edits. This build calms that down, but a large update can still make it twitch for a moment.</p>
      <p><strong>Bolding</strong><span class="stepper-help-code ${theme.panel}">**Sample Text**</span></p>
      <p><strong>Italics</strong><span class="stepper-help-code ${theme.panel}">/*Sample Text*/</span></p>
      <p><strong>Underline</strong><span class="stepper-help-code ${theme.panel}">_Sample Text_</span></p>
      <p><strong>Computer shortcuts</strong><span class="stepper-help-code ${theme.panel}">Ctrl+B bold · Ctrl+I italics · Ctrl+U underline</span></p>
    `;
    if (!fab.__stepperHelpWired) {
      fab.__stepperHelpWired = true;
      fab.addEventListener('click', () => { panel.hidden = !panel.hidden; });
      document.addEventListener('click', (event) => {
        if (panel.hidden) return;
        if (event.target === fab || fab.contains(event.target) || panel.contains(event.target)) return;
        panel.hidden = true;
      });
    }
  }

  function renderSettingsPanel(){
    const panel = document.getElementById('stepper-inline-settings');
    if (!panel) return;
    const theme = themeClasses();
    const settings = getSettings();
    panel.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    panel.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-panel-icon">${iconCog()}</span> Settings</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-3xl border p-5 sm:p-6 ${theme.soft}">
          <div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle} mb-2">Font Style</div>
          <p class="text-sm leading-relaxed ${theme.subtle}">Font controls now live in the upgraded Settings tab only, so re-renders stop forcing the editor back to the old three-font presets.</p>
        </div>
        <button type="button" data-stepper-setting="sfx" class="rounded-3xl border w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 ${theme.soft}">
          <div><div class="text-lg font-black tracking-tight">SFX Sounds</div><p class="mt-1 text-sm ${theme.subtle}">Menu clicks, tab changes and all the little app noises.</p></div>
          <div class="flex items-center gap-3 shrink-0"><span class="stepper-setting-icon">${iconSpeaker(settings.sfxEnabled)}</span><span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">${settings.sfxEnabled ? 'On' : 'Off'}</span></div>
        </button>
        <button type="button" data-stepper-setting="thinking" class="rounded-3xl border w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 ${theme.soft}">
          <div><div class="text-lg font-black tracking-tight">Thinking Music</div><p class="mt-1 text-sm ${theme.subtle}">Loops the lobby track while you work without resetting every few seconds.</p></div>
          <div class="flex items-center gap-3 shrink-0"><span class="stepper-setting-icon">${iconMusic(settings.thinkingMusicEnabled)}</span><span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">${settings.thinkingMusicEnabled ? 'On' : 'Off'}</span></div>
        </button>
      </div>
    `;
    panel.querySelector('[data-stepper-setting="sfx"]').addEventListener('click', () => { const current = getSettings(); current.sfxEnabled = !current.sfxEnabled; saveSettings(current); renderSettingsPanel(); });
    panel.querySelector('[data-stepper-setting="thinking"]').addEventListener('click', () => { const current = getSettings(); current.thinkingMusicEnabled = !current.thinkingMusicEnabled; saveSettings(current); renderSettingsPanel(); });
  }

  function renderChoreoPanel(){
    const panel = document.getElementById('stepper-inline-choreography');
    if (!panel) return;
    panel.innerHTML = '';
    panel.style.display = 'none';
    return;
    const theme = themeClasses();
    const currentData = readAppData();
    const currentEntry = hasDanceContent(currentData) ? buildSnapshotEntry(currentData) : null;
    const featured = getFeaturedDances();
    const cards = featured.length ? featured.map(item => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-saved-dance-id="${escapeHtml(item.id)}">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 class="text-xl font-black tracking-tight">${escapeHtml(item.title)}</h3>
            <p class="mt-1 text-sm font-semibold ${theme.subtle}">${escapeHtml(item.choreographer)}${item.country ? ` (${escapeHtml(item.country)})` : ''}</p>
          </div>
          <span class="stepper-part-pill ${theme.dark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(item.level)}</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Counts</div><div class="mt-1 font-bold">${escapeHtml(item.counts)}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Walls</div><div class="mt-1 font-bold">${escapeHtml(item.walls)}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Format</div><div class="mt-1 font-bold">${escapeHtml(item.format === 'phrased' ? 'Phrased' : 'Regular')}</div></div>
          <div class="rounded-2xl border px-3 py-3 ${theme.panel}"><div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Steps</div><div class="mt-1 font-bold">${escapeHtml(String(item.steps || 0))}</div></div>
        </div>
        ${item.sequence ? `<p class="mt-4 text-sm leading-relaxed ${theme.subtle}"><strong class="${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">Sequence:</strong> ${escapeHtml(item.sequence)}</p>` : ''}
        ${item.music ? `<p class="mt-2 text-sm leading-relaxed ${theme.subtle}"><strong class="${theme.dark ? 'text-neutral-100' : 'text-neutral-900'}">Music:</strong> ${escapeHtml(item.music)}</p>` : ''}
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" data-action="load" class="stepper-mini-btn ${theme.button}">Load</button>
          <a href="${escapeHtml(buildFeaturedSubmissionLink(item))}" class="stepper-mini-btn ${theme.orange}">Gmail PDF</a>
          <button type="button" data-action="delete" class="stepper-danger-btn ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">🗑 Delete</button>
          <span class="text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Saved ${escapeHtml(formatDate(item.updatedAt))}</span>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 sm:p-8 text-center ${theme.soft}"><p class="text-lg font-bold">No saved dances yet.</p><p class="mt-2 ${theme.subtle}">Build a dance and it will save here automatically on this device.</p></div>`;
    panel.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    panel.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-panel-icon">${iconShoe()}</span> Choreography</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${theme.panel}">
          <p class="text-base sm:text-lg font-bold leading-relaxed">Dances you make with Step by Stepper are collected here automatically on this device. Use Gmail to send a copy out, and make sure you attach the PDF before you send it.</p>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <a href="${escapeHtml(buildFeaturedSubmissionLink(currentEntry || buildSnapshotEntry(currentData || { meta:{} })))}" class="stepper-mini-btn ${theme.orange}">Gmail current dance copy</a>
            <button type="button" data-action="save-for-later" class="stepper-mini-btn ${theme.button}">Save for later</button>
            <p class="text-sm ${theme.subtle}">The Gmail text now tells them to attach the PDF instead of dumping the whole dance in the body. Save for later locks this current project in so it comes back next time you open the page.</p>
          </div>
          ${(() => { const saved = getSavedForLater(); return saved && saved.savedAt ? `<p class="mt-3 text-xs font-semibold uppercase tracking-widest ${theme.subtle}">Saved for later ${escapeHtml(formatDate(saved.savedAt))}</p>` : ''; })()}
        </div>
        ${cards}
      </div>
    `;
    panel.querySelectorAll('[data-saved-dance-id]').forEach(card => {
      const id = card.getAttribute('data-saved-dance-id');
      const loadBtn = card.querySelector('[data-action="load"]');
      const deleteBtn = card.querySelector('[data-action="delete"]');
      if (loadBtn) loadBtn.addEventListener('click', () => loadSavedDance(id));
      if (deleteBtn) deleteBtn.addEventListener('click', () => {
        const entry = getFeaturedDances().find(item => item && item.id === id);
        const name = entry ? entry.title : 'this dance';
        if (confirm(`Delete saved dance \"${name}\"?`)) {
          deleteSavedDance(id);
          renderChoreoPanel();
        }
      });
    });
    const saveForLaterBtn = panel.querySelector('[data-action="save-for-later"]');
    if (saveForLaterBtn) saveForLaterBtn.addEventListener('click', () => {
      if (saveCurrentProjectForLater()) {
        alert('Current project saved for later. It will come back the next time you open Step by Stepper.');
        renderChoreoPanel();
      } else {
        alert('Build something first, then save it for later.');
      }
    });
  }

  function ensurePartDefaults(data){
    const tools = normalizePhrasedTools(data);
    writeStoredPhrasedTools(tools);
    return tools;
  }

  function addPartFromSection(sectionId){
    writePhrasedTools((tools, data) => {
      const sections = getMainSections(data);
      const section = sections.find(item => item && item.id === sectionId);
      if (!section) return tools;
      const label = alphaLabel(tools.parts.length);
      tools.danceFormat = 'phrased';
      tools.uiTab = 'parts';
      tools.parts.push({ id: 'part-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), label, title: String(section.name || '').trim(), sectionIds: [sectionId] });
      if (!tools.sequence.length) tools.sequence.push({ kind:'part', id: tools.parts[tools.parts.length - 1].id });
      return tools;
    });
    renderCustomPanels();
    scrollToPhrasedPanel();
  }

  function renderPhrasedPanel(){
    const panel = document.getElementById(PHR_PANEL_ID);
    if (!panel) return;
    const data = readAppData() || { meta:{}, sections:[], tags:[] };
    const tools = ensurePartDefaults(data);
    const theme = themeClasses();
    const sections = getMainSections(data);
    const tags = getTags(data);
    const options = [
      ...tools.parts.map(part => ({ value: `part:${part.id}`, label: `Part ${part.label}` })),
      ...tags.map(tag => ({ value: `tag:${tag.id}`, label: String(tag.name || 'Tag').trim() || 'Tag' }))
    ];
    const partsHtml = tools.parts.length ? tools.parts.map((part, index) => `
      <article class="rounded-3xl border p-5 sm:p-6 ${theme.soft}" data-part-id="${escapeHtml(part.id)}">
        <div class="stepper-tools-grid">
          <div class="stepper-field"><label>Part Label</label><input type="text" maxlength="8" data-part-field="label" value="${escapeHtml(part.label)}"></div>
          <div class="stepper-field"><label>Part Title</label><input type="text" maxlength="80" data-part-field="title" value="${escapeHtml(part.title)}" placeholder="Optional Part Title"></div>
        </div>
        <div class="mt-4">
          <div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Sections in this Part</div>
          <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${sections.map(section => {
              const checked = part.sectionIds.includes(section.id);
              return `<label class="rounded-2xl border px-4 py-3 ${theme.panel} flex items-center gap-3"><input type="checkbox" data-part-section="${escapeHtml(section.id)}" ${checked ? 'checked' : ''}><span class="font-semibold">${escapeHtml(String(section.name || 'Untitled Section').trim() || `Section ${index + 1}`)}</span></label>`;
            }).join('')}
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <span class="stepper-part-pill ${theme.dark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(part.label || alphaLabel(index))}</span>
          <span class="text-sm font-semibold ${theme.subtle}">${derivePartCount(part, data)} counts</span>
          <button type="button" data-action="remove-part" class="stepper-danger-btn ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">Remove Part</button>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 ${theme.soft}"><p class="font-bold">No Parts yet.</p><p class="mt-2 ${theme.subtle}">Right-click a section header and choose <strong>Add Part</strong>, or use the button below to make one manually.</p></div>`;

    const sequenceHtml = tools.sequence.length ? tools.sequence.map((item, index) => `
      <div class="stepper-seq-row" data-seq-index="${index}">
        <div class="stepper-field"><label>${index === 0 ? 'Sequence' : 'Next'}</label><select data-seq-select>${options.map(option => `<option value="${escapeHtml(option.value)}" ${option.value === `${item.kind}:${item.id}` ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></div>
        <button type="button" data-action="add-after" class="stepper-mini-btn ${theme.accent}">+</button>
        <button type="button" data-action="remove-seq" class="stepper-danger-btn stepper-row-trash ${theme.dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'}">Delete</button>
      </div>
    `).join('') : `<div class="rounded-3xl border p-6 ${theme.soft}"><p class="font-bold">No Sequence yet.</p><p class="mt-2 ${theme.subtle}">Pick a Part, press the plus button, and keep building the phrased order exactly like a CopperKnob sequence.</p></div>`;

    panel.className = `rounded-3xl border shadow-sm overflow-hidden ${theme.shell}`;
    panel.innerHTML = `
      <div class="px-6 py-5 border-b ${theme.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase flex items-center gap-2"><span class="stepper-panel-icon">${iconSparkles()}</span> Phrased Dance Tools</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${theme.panel}">
          <div class="stepper-tools-grid">
            <div class="stepper-field">
              <label for="stepper-dance-format">Dance Format</label>
              <select id="stepper-dance-format">
                <option value="regular" ${tools.danceFormat === 'regular' ? 'selected' : ''}>Regular</option>
                <option value="phrased" ${tools.danceFormat === 'phrased' ? 'selected' : ''}>Phrased</option>
              </select>
            </div>
            <div class="rounded-2xl border px-4 py-4 ${theme.soft}">
              <div class="text-[10px] font-black uppercase tracking-widest ${theme.subtle}">Auto Sheet Meta</div>
              <div class="mt-2 font-bold">Count: ${escapeHtml(deriveCounts(data))} · Wall: ${escapeHtml(deriveWalls(data))}</div>
              <p class="mt-1 text-sm ${theme.subtle}">Tags are left out of the count, matching phrased-sheet practice.</p>
            </div>
          </div>
        </div>
        ${tools.danceFormat === 'phrased' ? `
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" data-tools-tab="parts" class="stepper-tools-tab ${tools.uiTab !== 'sequence' ? theme.accent : theme.button}">Parts</button>
            ${tools.parts.length ? `<button type="button" data-tools-tab="sequence" class="stepper-tools-tab ${tools.uiTab === 'sequence' ? theme.accent : theme.button}">Sequence</button>` : ''}
            <button type="button" data-action="add-empty-part" class="stepper-mini-btn ${theme.orange}">Add Part</button>
            ${tools.sequence.length ? `<span class="text-xs font-black uppercase tracking-widest ${theme.subtle}">Sequence: ${escapeHtml(deriveSequenceString(data))}</span>` : ''}
          </div>
          ${tools.uiTab === 'sequence' && tools.parts.length ? `<div class="space-y-4">${sequenceHtml}</div>` : `<div class="space-y-4">${partsHtml}</div>`}
        ` : `<div class="rounded-3xl border p-6 ${theme.soft}"><p class="font-bold">Switch the dance to <strong>Phrased</strong> when you want editable Parts and a Sequence tab.</p><p class="mt-2 ${theme.subtle}">That matches common phrased sheets where Part A / B / C and Tags are sequenced separately.</p></div>`}
      </div>
    `;

    const formatSelect = panel.querySelector('#stepper-dance-format');
    if (formatSelect) formatSelect.addEventListener('change', (event) => {
      writePhrasedTools((tools) => {
        tools.danceFormat = event.target.value === 'phrased' ? 'phrased' : 'regular';
        if (tools.danceFormat !== 'phrased') tools.uiTab = 'parts';
        return tools;
      });
      renderCustomPanels();
    });

    panel.querySelectorAll('[data-tools-tab]').forEach(button => button.addEventListener('click', () => {
      const nextTab = button.getAttribute('data-tools-tab');
      writePhrasedTools((tools) => { tools.uiTab = nextTab === 'sequence' ? 'sequence' : 'parts'; return tools; });
      renderCustomPanels();
    }));

    const addEmpty = panel.querySelector('[data-action="add-empty-part"]');
    if (addEmpty) addEmpty.addEventListener('click', () => {
      writePhrasedTools((tools, currentData) => {
        const label = alphaLabel(tools.parts.length);
        const firstSection = getMainSections(currentData)[0];
        tools.parts.push({ id:'part-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), label, title:'', sectionIds:firstSection ? [firstSection.id] : [] });
        tools.danceFormat = 'phrased';
        tools.uiTab = 'parts';
        if (!tools.sequence.length) tools.sequence.push({ kind:'part', id:tools.parts[tools.parts.length - 1].id });
        return tools;
      });
      renderCustomPanels();
      scrollToPhrasedPanel();
    });

    panel.querySelectorAll('[data-part-id]').forEach(card => {
      const partId = card.getAttribute('data-part-id');
      const labelInput = card.querySelector('[data-part-field="label"]');
      const titleInput = card.querySelector('[data-part-field="title"]');
      if (labelInput) labelInput.addEventListener('input', (event) => {
        writePhrasedTools((tools) => { const part = tools.parts.find(item => item.id === partId); if (part) part.label = event.target.value || part.label; return tools; });
      });
      if (titleInput) titleInput.addEventListener('input', (event) => {
        writePhrasedTools((tools) => { const part = tools.parts.find(item => item.id === partId); if (part) part.title = event.target.value || ''; return tools; });
      });
      card.querySelectorAll('[data-part-section]').forEach(box => box.addEventListener('change', () => {
        writePhrasedTools((tools) => {
          const part = tools.parts.find(item => item.id === partId);
          if (!part) return tools;
          const ids = new Set(part.sectionIds);
          if (box.checked) ids.add(box.getAttribute('data-part-section'));
          else ids.delete(box.getAttribute('data-part-section'));
          part.sectionIds = Array.from(ids);
          return tools;
        });
        renderCustomPanels();
      }));
      const removeBtn = card.querySelector('[data-action="remove-part"]');
      if (removeBtn) removeBtn.addEventListener('click', () => {
        writePhrasedTools((tools) => {
          tools.parts = tools.parts.filter(item => item.id !== partId);
          tools.sequence = tools.sequence.filter(item => !(item.kind === 'part' && item.id === partId));
          if (!tools.parts.length) tools.uiTab = 'parts';
          return tools;
        });
        renderCustomPanels();
      });
    });

    panel.querySelectorAll('[data-seq-index]').forEach(row => {
      const index = Number(row.getAttribute('data-seq-index')) || 0;
      const select = row.querySelector('[data-seq-select]');
      if (select) select.addEventListener('change', (event) => {
        writePhrasedTools((tools) => {
          const [kind, id] = String(event.target.value || '').split(':');
          tools.sequence[index] = { kind, id };
          return tools;
        });
        renderCustomPanels();
      });
      const addAfter = row.querySelector('[data-action="add-after"]');
      if (addAfter) addAfter.addEventListener('click', () => {
        writePhrasedTools((tools) => {
          const fallback = tools.parts[0] ? { kind:'part', id:tools.parts[0].id } : (getTags(data)[0] ? { kind:'tag', id:getTags(data)[0].id } : null);
          if (fallback) tools.sequence.splice(index + 1, 0, fallback);
          return tools;
        });
        renderCustomPanels();
      });
      const removeSeq = row.querySelector('[data-action="remove-seq"]');
      if (removeSeq) removeSeq.addEventListener('click', () => {
        writePhrasedTools((tools) => { tools.sequence.splice(index, 1); return tools; });
        renderCustomPanels();
      });
    });
  }

  function renderCustomPanels(){
    ensureInlineHost();
    renderPhrasedPanel();
    renderChoreoPanel();
    renderSettingsPanel();
    wireManualCountsAndWallsOverrides();
    const syncedStats = syncAutoCountsAndWalls(false);
    if (syncedStats) {
      ensureAutoOption('Counts', syncedStats.counts);
      ensureAutoOption('Walls', syncedStats.walls);
      syncCountsWallsField('Counts', syncedStats.counts, syncedStats.autoCounts);
      syncCountsWallsField('Walls', syncedStats.walls, syncedStats.autoWalls);
    }
    saveFeaturedSnapshot();
    patchPreviewSurface();
  }

  function findFieldControlByText(labelText){
    const main = document.querySelector('main');
    if (!main) return null;
    const labels = Array.from(main.querySelectorAll('label, div, section'));
    const matcher = new RegExp('^' + labelText + '$', 'i');
    for (const node of labels) {
      const ownText = (node.firstChild && node.firstChild.textContent ? node.firstChild.textContent : node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!matcher.test(ownText)) continue;
      const control = node.querySelector('select, input');
      if (control) return control;
    }
    return null;
  }

  const AUTO_SELECT_VALUE = '__AUTO__';

  function ensureAutoOption(labelText, autoValue){
    const control = findFieldControlByText(labelText);
    if (!control || control.tagName !== 'SELECT') return null;
    let option = Array.from(control.options || []).find((entry) => String(entry.value) === AUTO_SELECT_VALUE);
    if (!option) {
      option = document.createElement('option');
      option.value = AUTO_SELECT_VALUE;
      control.insertBefore(option, control.firstChild || null);
    }
    option.textContent = `Auto (${String(autoValue || '').trim() || '-'})`;
    return control;
  }

  function syncCountsWallsField(labelText, value, autoEnabled){
    const control = ensureAutoOption(labelText, value) || findFieldControlByText(labelText);
    if (!control) return false;
    const nextValue = autoEnabled ? AUTO_SELECT_VALUE : String(value);
    if (String(control.value) === String(nextValue)) return true;
    control.__stepperAutoSyncing = true;
    control.value = String(nextValue);
    control.dispatchEvent(new Event('input', { bubbles:true }));
    control.dispatchEvent(new Event('change', { bubbles:true }));
    setTimeout(() => { control.__stepperAutoSyncing = false; }, 0);
    return true;
  }

  function trySyncFieldByText(labelText, value, autoEnabled){
    if (labelText === 'Counts' || labelText === 'Walls') {
      return syncCountsWallsField(labelText, value, !!autoEnabled);
    }
    const control = findFieldControlByText(labelText);
    if (!control) return false;
    if (String(control.value) === String(value)) return true;
    control.__stepperAutoSyncing = true;
    control.value = String(value);
    control.dispatchEvent(new Event('input', { bubbles:true }));
    control.dispatchEvent(new Event('change', { bubbles:true }));
    setTimeout(() => { control.__stepperAutoSyncing = false; }, 0);
    return true;
  }

  function syncAutoCountsAndWalls(forceWrite){
    const data = readAppData();
    if (!data) return null;
    data.meta = data.meta || {};
    let changed = false;
    if (typeof data.meta.autoCounts !== 'boolean') {
      data.meta.autoCounts = true;
      changed = true;
    }
    if (typeof data.meta.autoWalls !== 'boolean') {
      data.meta.autoWalls = true;
      changed = true;
    }
    const derivedCounts = String(deriveCounts(data));
    const derivedWalls = String(deriveWalls(data));
    let nextCounts = derivedCounts;
    let nextWalls = derivedWalls;
    if (data.meta.autoCounts === false) {
      nextCounts = String(data.meta.counts || '').trim() || derivedCounts;
    } else if (String(data.meta.counts || '') !== derivedCounts) {
      data.meta.counts = derivedCounts;
      changed = true;
    }
    if (data.meta.autoWalls === false) {
      nextWalls = String(data.meta.walls || '').trim() || derivedWalls;
    } else if (String(data.meta.walls || '') !== derivedWalls) {
      data.meta.walls = derivedWalls;
      changed = true;
    }
    if (changed || forceWrite) writeAppData(data);
    return { data, counts: nextCounts, walls: nextWalls, changed, autoCounts: data.meta.autoCounts !== false, autoWalls: data.meta.autoWalls !== false };
  }

  function wireManualCountsAndWallsOverrides(){
    const bind = (labelText, metaKey, autoKey, deriveFn) => {
      const control = ensureAutoOption(labelText, deriveFn(readAppData() || { meta:{}, sections:[], tags:[] })) || findFieldControlByText(labelText);
      if (!control || control.__stepperManualOverrideWired) return;
      control.__stepperManualOverrideWired = true;
      control.addEventListener('change', () => {
        if (control.__stepperAutoSyncing) return;
        setTimeout(() => {
          const data = readAppData();
          if (!data) return;
          data.meta = data.meta || {};
          const rawValue = String(control.value || '').trim();
          if (rawValue === AUTO_SELECT_VALUE) {
            data.meta[autoKey] = true;
            data.meta[metaKey] = String(deriveFn(data));
          } else {
            data.meta[metaKey] = rawValue;
            data.meta[autoKey] = false;
          }
          writeAppData(data);
          saveFeaturedSnapshot();
          const synced = syncAutoCountsAndWalls(true);
          if (synced) {
            syncCountsWallsField('Counts', synced.counts, synced.autoCounts);
            syncCountsWallsField('Walls', synced.walls, synced.autoWalls);
          }
        }, 0);
      });
    };
    bind('Counts', 'counts', 'autoCounts', deriveCounts);
    bind('Walls', 'walls', 'autoWalls', deriveWalls);
  }

  function wirePreviewAutoStats(){
    const sheetBtn = Array.from(document.querySelectorAll('button')).find((button) => ((button.textContent || '').trim() === 'Sheet'));
    if (!sheetBtn || sheetBtn.__stepperAutoStatsWired) return;
    sheetBtn.__stepperAutoStatsWired = true;
    sheetBtn.addEventListener('click', () => {
      const synced = syncAutoCountsAndWalls(true);
      if (!synced) return;
      syncCountsWallsField('Counts', synced.counts, synced.autoCounts);
      syncCountsWallsField('Walls', synced.walls, synced.autoWalls);
    }, true);
  }

  function applyPreviewInlineFormatting(root){
    if (!root) return;
    const leafs = Array.from(root.querySelectorAll('p, div, span, h1, h2, h3, h4, li')).filter(node => node.children.length === 0);
    leafs.forEach((node) => {
      if (node.closest('#' + PREVIEW_NOTE_ID)) return;
      const rawText = node.textContent || '';
      if (!/(\*\*[^*]+\*\*|\/\*[^*]+\*\/|\*\/[^*]+\/\*|_[^_]+_)/.test(rawText)) return;
      let html = escapeHtml(rawText);
      html = html.replace(/\*\*([^*][\s\S]*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\/\*([\s\S]*?)\*\//g, '<em>$1</em>');
      html = html.replace(/\*\/([\s\S]*?)\/\*/g, '<em>$1</em>');
      html = html.replace(/_([^_][\s\S]*?)_/g, '<u>$1</u>');
      if (node.innerHTML !== html) node.innerHTML = html;
    });
  }

  function patchPreviewAutoHeaderValues(root, counts, walls){
    if (!root) return;
    const normalize = (value) => String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
    const isAutoValue = (value) => /^_*(?:AUTO|__AUTO__)_*$/.test(normalize(value).toUpperCase());
    const leafs = Array.from(root.querySelectorAll('p, div, span, h1, h2, h3, h4, strong')).filter((node) => node.children.length === 0 && !node.closest('#' + PREVIEW_NOTE_ID));

    leafs.forEach((node) => {
      const text = normalize(node.textContent || '');
      if (/^COUNT:?\s*_*(?:AUTO|__AUTO__)_*$/.test(text.toUpperCase())) node.textContent = `COUNT: ${counts}`;
      if (/^WALL:?\s*_*(?:AUTO|__AUTO__)_*$/.test(text.toUpperCase())) node.textContent = `WALL: ${walls}`;
    });

    const tryPatchSibling = (labelRegex, value) => {
      const labelNode = leafs.find((node) => labelRegex.test(normalize(node.textContent || '').toUpperCase()));
      if (!labelNode) return false;
      let sibling = labelNode.nextElementSibling;
      while (sibling) {
        const siblingText = normalize(sibling.textContent || '');
        if (isAutoValue(siblingText)) {
          sibling.textContent = String(value);
          return true;
        }
        if (siblingText) break;
        sibling = sibling.nextElementSibling;
      }
      return false;
    };

    const countPatched = tryPatchSibling(/^COUNT:?$/, counts);
    const wallPatched = tryPatchSibling(/^WALL:?$/, walls);

    if (!countPatched || !wallPatched) {
      const autoLeafs = leafs.filter((node) => isAutoValue(node.textContent || ''));
      if (!countPatched && autoLeafs[0]) autoLeafs[0].textContent = String(counts);
      if (!wallPatched && autoLeafs[1]) autoLeafs[1].textContent = String(walls);
    }
  }

  function patchPreviewSurface(){
    const main = document.querySelector('main');
    const synced = syncAutoCountsAndWalls(false);
    const data = synced && synced.data ? synced.data : readAppData();
    if (!main || !data) return;
    wireManualCountsAndWallsOverrides();
    const showingEditor = !!main.querySelector('input[placeholder="Section Title..."]');
    const note = document.getElementById(PREVIEW_NOTE_ID);
    if (showingEditor) {
      if (note) note.remove();
      return;
    }
    const counts = synced ? synced.counts : deriveCounts(data);
    const walls = synced ? synced.walls : deriveWalls(data);
    const level = levelDisplay(data);
    const sequence = deriveSequenceString(data);
    const leafs = Array.from(main.querySelectorAll('p, div, span, h1, h2, h3')).filter(node => node.children.length === 0);
    const statsLine = leafs.find(node => /Count:\s*/i.test((node.textContent || '').trim()) && /Wall:/i.test((node.textContent || '').trim()));
    if (statsLine) statsLine.textContent = `Count: ${counts} | Wall: ${walls} | Level: ${level}`;
    patchPreviewAutoHeaderValues(main, counts, walls);
    let previewNote = document.getElementById(PREVIEW_NOTE_ID);
    if (!previewNote) {
      previewNote = document.createElement('section');
      previewNote.id = PREVIEW_NOTE_ID;
      previewNote.className = `rounded-3xl border px-5 py-5 ${themeClasses().soft}`;
      const titleBlock = main.firstElementChild;
      if (titleBlock) main.insertBefore(previewNote, titleBlock.nextSibling || titleBlock);
      else main.prepend(previewNote);
    }
    previewNote.className = `rounded-3xl border px-5 py-5 ${themeClasses().soft}`;
    previewNote.innerHTML = `
      <div class="flex flex-wrap items-center gap-3">
        <span class="stepper-part-pill ${themeClasses().dark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">${escapeHtml(normalizePhrasedTools(data).danceFormat === 'phrased' ? 'Phrased Dance' : 'Regular Dance')}</span>
        <span class="text-sm font-semibold ${themeClasses().subtle}">Auto Count ${escapeHtml(counts)} · Auto Wall ${escapeHtml(walls)}</span>
      </div>
      ${sequence ? `<p class="mt-3 text-sm leading-relaxed ${themeClasses().subtle}"><strong class="${themeClasses().dark ? 'text-neutral-100' : 'text-neutral-900'}">Sequence:</strong> ${escapeHtml(sequence)}</p>` : ''}
      ${normalizePhrasedTools(data).danceFormat === 'phrased' ? `<p class="mt-2 text-sm ${themeClasses().subtle}">Built in editable Parts and Sequence style, matching common phrased-sheet layout where A/B/C parts and Tags are sequenced separately.</p>` : ''}
    `;
    applyPreviewInlineFormatting(main);
    syncCountsWallsField('Counts', counts, synced ? synced.autoCounts : true);
    syncCountsWallsField('Walls', walls, synced ? synced.autoWalls : true);
  }

  function ensureMenu(){
    let menu = document.getElementById(MENU_ID);
    if (menu) return menu;
    menu = document.createElement('div');
    menu.id = MENU_ID;
    menu.hidden = true;
    document.body.appendChild(menu);
    document.addEventListener('click', () => { menu.hidden = true; contextMenuState = null; });
    window.addEventListener('scroll', () => { menu.hidden = true; contextMenuState = null; }, true);
    return menu;
  }

  function showPartMenu(x, y, sectionId, sectionName){
    const menu = ensureMenu();
    contextMenuState = { sectionId, sectionName };
    const dark = isDarkMode();
    menu.className = dark ? 'bg-neutral-950 border border-neutral-800 text-neutral-100' : 'bg-white border border-neutral-200 text-neutral-900';
    menu.innerHTML = `<button type="button">Add Part from ${escapeHtml(sectionName || 'this section')}</button>`;
    menu.style.left = Math.max(12, x) + 'px';
    menu.style.top = Math.max(12, y) + 'px';
    menu.hidden = false;
    const button = menu.querySelector('button');
    if (button) button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (contextMenuState) addPartFromSection(contextMenuState.sectionId);
      menu.hidden = true;
      contextMenuState = null;
    }, { once:true });
  }

  function decorateSectionHeaders(){
    const main = document.querySelector('main');
    const data = readAppData();
    if (!main || !data) return;
    const sections = getMainSections(data);
    const inputs = Array.from(main.querySelectorAll('input[placeholder="Section Title..."]'));
    inputs.forEach((input, index) => {
      const header = input.parentElement;
      const section = sections[index];
      if (!header || !section) return;
      header.classList.add('stepper-section-header-partable');
      let button = header.querySelector('.stepper-section-part-btn');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'stepper-section-part-btn';
        button.textContent = 'Part';
        header.appendChild(button);
      }
      if (!button.__stepperPartButtonWired) {
        button.__stepperPartButtonWired = true;
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          addPartFromSection(section.id);
        });
      }
    });
  }

  function injectWhatsNewNotes(){
    return;
  }

  const EDITED_STEP_MENU_ID = 'stepper-edited-step-menu';
  let editedStepMenuState = null;
  const editedStepIndices = new Set();

  function isEditorSurfaceVisible(){
    const main = document.querySelector('main');
    if (!main) return false;
    const titleField = main.querySelector('input[placeholder="Dance Title"]');
    const sectionField = main.querySelector('input[placeholder="Section Title..."]');
    const text = (main.textContent || '').replace(/\s+/g, ' ');
    return !!(titleField || sectionField || (text.includes('Dance Title') && text.includes('Choreographer') && text.includes('Country')));
  }

  function getEditorStepRows(){
    const main = document.querySelector('main');
    if (!main) return [];
    return Array.from(main.querySelectorAll('input[placeholder="Move Name"]')).map((input) => input.closest('.group.grid') || input.closest('[class*="group"]')).filter(Boolean);
  }

  function getStepRowIndex(row){
    if (!row) return -1;
    return getEditorStepRows().indexOf(row);
  }

  function getStepFieldsFromRow(row){
    if (!row) return null;
    const nameInput = row.querySelector('input[placeholder="Move Name"]');
    const descInput = row.querySelector('input[placeholder="Move details..."]');
    if (!nameInput || !descInput) return null;
    const countInput = row.querySelector('input[placeholder="1"]');
    const footSelect = row.querySelector('select');
    return {
      name: String(nameInput.value || '').trim(),
      description: String(descInput.value || '').trim(),
      count: String(countInput && countInput.value || '').trim(),
      foot: String(footSelect && footSelect.value || '').trim()
    };
  }

  function editedStepHasContent(row){
    const fields = getStepFieldsFromRow(row);
    return !!(fields && fields.name && fields.description);
  }

  function ensureEditedStepMenu(){
    let menu = document.getElementById(EDITED_STEP_MENU_ID);
    if (menu) return menu;
    menu = document.createElement('div');
    menu.id = EDITED_STEP_MENU_ID;
    menu.hidden = true;
    menu.style.position = 'fixed';
    menu.style.zIndex = '99999';
    menu.style.minWidth = '220px';
    menu.style.borderRadius = '16px';
    menu.style.boxShadow = '0 16px 38px rgba(0,0,0,.24)';
    menu.style.padding = '.45rem';
    menu.innerHTML = '<button type="button" data-stepper-send-edited-step="1" style="display:flex;width:100%;align-items:center;gap:.65rem;border:none;background:transparent;padding:.8rem .95rem;border-radius:12px;font-weight:800;text-align:left;cursor:pointer;">Send step to admin</button>';
    document.body.appendChild(menu);
    const close = () => {
      menu.hidden = true;
      editedStepMenuState = null;
    };
    document.addEventListener('pointerdown', (event) => {
      if (menu.hidden) return;
      if (!menu.contains(event.target)) close();
    });
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    const button = menu.querySelector('[data-stepper-send-edited-step="1"]');
    if (button && !button.__stepperEditedStepWired) {
      button.__stepperEditedStepWired = true;
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const row = editedStepMenuState && editedStepMenuState.row;
        close();
        if (!row) return;
        await sendEditedStepToAdmin(row);
      });
    }
    return menu;
  }

  function openEditedStepMenu(x, y, row){
    const menu = ensureEditedStepMenu();
    editedStepMenuState = { row };
    menu.className = isDarkMode() ? 'bg-neutral-950 border border-neutral-800 text-neutral-100' : 'bg-white border border-neutral-200 text-neutral-900';
    const maxX = Math.max(12, window.innerWidth - 252);
    const maxY = Math.max(12, window.innerHeight - 80);
    menu.style.left = Math.min(Math.max(12, x), maxX) + 'px';
    menu.style.top = Math.min(Math.max(12, y), maxY) + 'px';
    menu.hidden = false;
  }

  async function sendEditedStepToAdmin(row){
    const globals = window.StepByStepperGlobals || {};
    if (typeof globals.requestGlossaryStep !== 'function') {
      alert('Glossary+ suggestions are not ready yet.');
      return false;
    }
    const fields = getStepFieldsFromRow(row);
    if (!(fields && fields.name && fields.description)) {
      alert('That step needs both a name and description before it can be sent.');
      return false;
    }
    const payload = {
      name: fields.name,
      description: fields.description,
      counts: fields.count || '1',
      foot: fields.foot || 'Either',
      tags: 'Sent from edited step'
    };
    const ok = await globals.requestGlossaryStep(payload);
    if (ok) {
      const index = getStepRowIndex(row);
      if (index >= 0) editedStepIndices.delete(index);
      row.dataset.stepperEditedStep = '0';
    }
    return ok;
  }

  function installEditedStepContextMenu(){
    if (document.body.__stepperEditedStepContextMenuInstalled) return;
    document.body.__stepperEditedStepContextMenuInstalled = true;
    document.addEventListener('input', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !isEditorSurfaceVisible()) return;
      if (!(target.matches('input[placeholder="Move Name"]') || target.matches('input[placeholder="Move details..."]') || target.matches('input[placeholder="1"]') || target.matches('select'))) return;
      const row = target.closest('.group.grid') || target.closest('[class*="group"]');
      if (!row) return;
      const index = getStepRowIndex(row);
      if (index >= 0) editedStepIndices.add(index);
      row.dataset.stepperEditedStep = '1';
    }, true);
    document.addEventListener('contextmenu', (event) => {
      if (!isEditorSurfaceVisible()) return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const row = target.closest('.group.grid') || target.closest('[class*="group"]');
      if (!row) return;
      if (!row.querySelector('input[placeholder="Move Name"]') || !row.querySelector('input[placeholder="Move details..."]')) return;
      const index = getStepRowIndex(row);
      const isEdited = row.dataset.stepperEditedStep === '1' || (index >= 0 && editedStepIndices.has(index));
      if (!isEdited || !editedStepHasContent(row)) return;
      event.preventDefault();
      event.stopPropagation();
      openEditedStepMenu(event.clientX, event.clientY, row);
    }, true);
  }

  function boot(){
    if (maybeRestoreSavedForLaterOnBoot()) return;
    ensureCustomStyles();
    applyFontSettings();
    ensureInlineHost();
    renderCustomPanels();
    decorateSectionHeaders();
    injectWhatsNewNotes();
    ensureHelpMenu();
    ensureEditorFormattingShortcuts();
    wirePreviewAutoStats();
    installEditedStepContextMenu();

    let queued = false;
    const refresh = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        applyFontSettings();
        renderCustomPanels();
        decorateSectionHeaders();
        injectWhatsNewNotes();
        ensureHelpMenu();
        wirePreviewAutoStats();
        installEditedStepContextMenu();
      });
    };

    const mutationIsFromStepperEnhancements = (mutation) => {
      const nodes = [mutation.target, ...(mutation.addedNodes || []), ...(mutation.removedNodes || [])];
      return nodes.every((node) => {
        const el = node && node.nodeType === 1 ? node : (node && node.parentElement ? node.parentElement : null);
        if (!el) return true;
        return !!el.closest(
          '#' + PREVIEW_NOTE_ID +
          ', #' + INLINE_HOST_ID +
          ', #' + MENU_ID +
          ', .stepper-section-header-partable' +
          ', .stepper-section-part-btn'
        );
      });
    };

    const main = document.querySelector('main');
    if (main && !main.__stepperObserver) {
      main.__stepperObserver = new MutationObserver((mutations) => {
        if (!mutations.some((mutation) => !mutationIsFromStepperEnhancements(mutation))) return;
        refresh();
      });
      main.__stepperObserver.observe(main, { childList:true, subtree:true });
    }

    setInterval(() => {
      if (document.hidden) return;
      const mainEl = document.querySelector('main');
      if (!mainEl || mainEl.style.display === 'none') return;
      saveFeaturedSnapshot();
      patchPreviewSurface();
    }, 15000);

    const shouldRefreshForSettingsChange = (event) => {
      const detail = event && event.detail ? event.detail : {};
      const key = String(detail.key || '');
      return !key || key === '_all' || key === 'fontFamily' || key === 'fontSize' || key === 'dyslexiaFriendlyFont' || key === 'reduceMotion' || key === 'highContrastMode' || key === 'textSpacing' || key === 'tabSize';
    };

    window.addEventListener('storage', refresh);
    window.addEventListener('stepper-settings-changed', (event) => {
      if (!shouldRefreshForSettingsChange(event)) return;
      refresh();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
