(function(){
  if (window.__stepperUndoRedoInstalled) return;
  window.__stepperUndoRedoInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const PHR_TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  const MAX_HISTORY = 120;
  const TOOLBAR_ID = 'stepper-history-toolbar';
  const STORAGE_EVENT_NAME = 'stepper-history-applied';
  const UNDO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" height="24" width="24" aria-hidden="true"><path d="M10.2069 5.20703 7.41397 8h7.08593c3.0375 0 5.5 2.4624 5.5 5.5 0 3.0375 -2.4624 5.5 -5.5 5.5H6.99991v-2h7.49999c1.933 0 3.5 -1.567 3.5 -3.5s-1.567 -3.5 -3.5 -3.5H7.41397l2.79293 2.7929 -1.41403 1.4141 -4.5 -4.49997c-0.39048 -0.39053 -0.39051 -1.02355 0 -1.41406l4.5 -4.5z"/></svg>';
  const REDO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" height="24" width="24" aria-hidden="true"><path d="M19.707 8.29285c0.3905 0.39051 0.3905 1.02353 0 1.41406l-5.5 5.49999 -1.414 -1.4141 3.7929 -3.79292H7V19.9999H5V8.99988c0.00004 -0.51764 0.39336 -0.94379 0.89746 -0.99512L6 7.99988h10.5859L12.793 4.20691l1.414 -1.41406z"/></svg>';

  let undoStack = [];
  let redoStack = [];
  let lastSignature = '';
  let suppressHistory = false;
  let snapshotTimer = null;
  let refreshTimer = null;

  function safeParse(raw, fallback){
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function readState(){
    const data = safeParse(localStorage.getItem(DATA_KEY), null);
    const phrasedTools = safeParse(localStorage.getItem(PHR_TOOLS_KEY), {});
    if (!data || typeof data !== 'object') return null;
    return {
      data,
      phrasedTools: phrasedTools && typeof phrasedTools === 'object' ? phrasedTools : {}
    };
  }

  function getSignature(state){
    try {
      return JSON.stringify(state || null);
    } catch {
      return '';
    }
  }

  function isMeaningfulState(state){
    return !!(state && state.data && typeof state.data === 'object');
  }

  function queueSnapshot(delay){
    if (snapshotTimer) clearTimeout(snapshotTimer);
    snapshotTimer = setTimeout(() => {
      snapshotTimer = null;
      pushSnapshot();
    }, typeof delay === 'number' ? delay : 80);
  }

  function trimHistory(){
    if (undoStack.length > MAX_HISTORY) undoStack = undoStack.slice(undoStack.length - MAX_HISTORY);
    if (redoStack.length > MAX_HISTORY) redoStack = redoStack.slice(redoStack.length - MAX_HISTORY);
  }

  function pushSnapshot(force){
    if (suppressHistory) return false;
    const state = readState();
    if (!isMeaningfulState(state)) return false;
    const signature = getSignature(state);
    if (!signature) return false;
    if (!force && signature === lastSignature) return false;
    undoStack.push(clone(state));
    redoStack = [];
    lastSignature = signature;
    trimHistory();
    updateButtons();
    return true;
  }

  function writeJson(key, value){
    if (value == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  }

  function applyState(state, mode){
    if (!isMeaningfulState(state)) return false;
    suppressHistory = true;
    try {
      writeJson(DATA_KEY, clone(state.data));
      writeJson(PHR_TOOLS_KEY, clone(state.phrasedTools || {}));
      lastSignature = getSignature(state);
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT_NAME, { detail: { mode: mode || 'apply' } }));
      scheduleRefresh();
      updateButtons();
      return true;
    } finally {
      setTimeout(() => { suppressHistory = false; }, 0);
    }
  }

  function undo(){
    if (undoStack.length < 2) return false;
    const current = undoStack.pop();
    if (current) redoStack.push(clone(current));
    const previous = undoStack[undoStack.length - 1];
    trimHistory();
    return applyState(clone(previous), 'undo');
  }

  function redo(){
    if (!redoStack.length) return false;
    const next = redoStack.pop();
    if (!next) return false;
    undoStack.push(clone(next));
    trimHistory();
    return applyState(clone(next), 'redo');
  }

  function isTextEntryElement(node){
    if (!(node instanceof HTMLElement)) return false;
    if (node.isContentEditable) return true;
    const tag = String(node.tagName || '').toUpperCase();
    if (tag === 'TEXTAREA') return true;
    if (tag !== 'INPUT') return false;
    const type = String(node.getAttribute('type') || 'text').toLowerCase();
    return !['button','submit','reset','checkbox','radio','range','file','color','hidden','image'].includes(type);
  }

  function isEditorSurfaceVisible(){
    const main = document.querySelector('main');
    if (!main) return false;
    if (main.hidden || main.style.display === 'none') return false;
    const text = String(main.textContent || '').replace(/\s+/g, ' ');
    return text.includes('Dance Title') && text.includes('Choreographer') && text.includes('Country');
  }

  function ensureStyles(){
    if (document.getElementById('stepper-history-toolbar-style')) return;
    const style = document.createElement('style');
    style.id = 'stepper-history-toolbar-style';
    style.textContent = `
      #${TOOLBAR_ID}{
        display:flex;
        align-items:center;
        gap:.75rem;
        justify-content:flex-end;
        margin:0 0 1rem;
      }
      #${TOOLBAR_ID}[hidden]{display:none!important;}
      #${TOOLBAR_ID} .stepper-history-btn{
        width:46px;
        height:46px;
        border-radius:14px;
        border:1px solid rgba(99,102,241,.18);
        display:inline-flex;
        align-items:center;
        justify-content:center;
        background:#ffffff;
        color:#111827;
        box-shadow:0 8px 24px rgba(15,23,42,.08);
        transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease, background .18s ease;
      }
      #${TOOLBAR_ID} .stepper-history-btn:hover{
        transform:translateY(-1px);
        box-shadow:0 12px 28px rgba(15,23,42,.14);
      }
      #${TOOLBAR_ID} .stepper-history-btn:disabled{
        opacity:.38;
        cursor:not-allowed;
        transform:none;
        box-shadow:none;
      }
      #${TOOLBAR_ID} .stepper-history-btn svg{
        width:22px;
        height:22px;
      }
      .dark #${TOOLBAR_ID} .stepper-history-btn,
      body.dark #${TOOLBAR_ID} .stepper-history-btn,
      html.dark #${TOOLBAR_ID} .stepper-history-btn{
        background:#171717;
        color:#f5f5f5;
        border-color:#404040;
      }
    `;
    document.head.appendChild(style);
  }

  function findToolbarAnchor(){
    const main = document.querySelector('main');
    if (!main) return null;
    const firstSectionTitle = main.querySelector('input[placeholder="Section Title..."]');
    const firstSectionCard = firstSectionTitle ? firstSectionTitle.closest('.rounded-3xl, .rounded-2xl, .border, .shadow-sm') : null;
    if (firstSectionCard && firstSectionCard.parentNode === main.querySelector('div.space-y-8, div.space-y-6, div.space-y-5')) return firstSectionCard;
    if (firstSectionCard) return firstSectionCard;
    const addSectionButton = Array.from(main.querySelectorAll('button')).find((button) => /Add Main Section/i.test(button.textContent || ''));
    return addSectionButton ? addSectionButton.closest('div') : null;
  }

  function ensureToolbar(){
    ensureStyles();
    let toolbar = document.getElementById(TOOLBAR_ID);
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = TOOLBAR_ID;
      toolbar.innerHTML = `
        <button type="button" class="stepper-history-btn" data-history-action="undo" title="Undo (Ctrl+Z)" aria-label="Undo">${UNDO_SVG}</button>
        <button type="button" class="stepper-history-btn" data-history-action="redo" title="Redo (Ctrl+Y)" aria-label="Redo">${REDO_SVG}</button>
      `;
      toolbar.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-history-action]');
        if (!button || button.disabled) return;
        if (button.getAttribute('data-history-action') === 'undo') undo();
        else redo();
      });
    }
    const anchor = findToolbarAnchor();
    if (anchor && toolbar.parentNode !== anchor.parentNode) {
      anchor.parentNode.insertBefore(toolbar, anchor);
    } else if (anchor && toolbar.nextSibling !== anchor) {
      anchor.parentNode.insertBefore(toolbar, anchor);
    } else if (!toolbar.parentNode) {
      const main = document.querySelector('main');
      if (main) main.insertBefore(toolbar, main.firstChild || null);
    }
    toolbar.hidden = !isEditorSurfaceVisible();
    updateButtons();
    return toolbar;
  }

  function updateButtons(){
    const toolbar = document.getElementById(TOOLBAR_ID);
    if (!toolbar) return;
    const undoBtn = toolbar.querySelector('[data-history-action="undo"]');
    const redoBtn = toolbar.querySelector('[data-history-action="redo"]');
    if (undoBtn) undoBtn.disabled = undoStack.length < 2;
    if (redoBtn) redoBtn.disabled = redoStack.length < 1;
    toolbar.hidden = !isEditorSurfaceVisible();
  }

  function scheduleRefresh(){
    if (refreshTimer) cancelAnimationFrame(refreshTimer);
    refreshTimer = requestAnimationFrame(() => {
      refreshTimer = null;
      ensureToolbar();
      updateButtons();
    });
  }

  function installStorageHooks(){
    try {
      const proto = Storage && Storage.prototype;
      if (proto && !proto.__stepperHistoryWrapped) {
        const nativeSetItem = proto.setItem;
        proto.setItem = function(key, value){
          const result = nativeSetItem.apply(this, arguments);
          if (!suppressHistory && (String(key) === DATA_KEY || String(key) === PHR_TOOLS_KEY)) queueSnapshot(70);
          return result;
        };
        proto.__stepperHistoryWrapped = true;
      }
    } catch {}
  }

  function findTabButton(label){
    if (label === 'Saved Dances') return document.getElementById('stepper-saved-dances-tab') || Array.from(document.querySelectorAll('button')).find(function(b){ return (b.textContent||'').trim() === 'My Saved Dances'; });
    if (label === 'Friends') return document.getElementById('stepper-friends-tab');
    if (label === 'Glossary') return document.getElementById('stepper-glossary-tab');
    return Array.from(document.querySelectorAll('button')).find(function(b){ return (b.textContent||'').trim() === label; });
  }

  function installKeyboardShortcuts(){
    if (document.body && document.body.__stepperHistoryKeyWired) return;
    if (document.body) document.body.__stepperHistoryKeyWired = true;
    document.addEventListener('keydown', (event) => {
      if (!isEditorSurfaceVisible()) {
        /* Global shortcuts that work on any page */
        if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
        const key = String(event.key || '').toLowerCase();
        if (key === '1') { event.preventDefault(); const b = findTabButton('Build'); if (b) b.click(); return; }
        if (key === '2') { event.preventDefault(); const b = findTabButton('Sheet'); if (b) b.click(); return; }
        if (key === '3') { event.preventDefault(); const b = findTabButton("What's New"); if (b) b.click(); return; }
        return;
      }
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const key = String(event.key || '').toLowerCase();
      if (isTextEntryElement(event.target)) return;
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault();
        redo();
      } else if (key === 'd' && !event.shiftKey) {
        /* Ctrl+D = Toggle dark mode */
        event.preventDefault();
        try {
          const dataKey = 'linedance_builder_data_v13';
          const raw = localStorage.getItem(dataKey);
          const data = raw ? JSON.parse(raw) : {};
          data.isDarkMode = !data.isDarkMode;
          localStorage.setItem(dataKey, JSON.stringify(data));
          window.dispatchEvent(new Event('storage'));
        } catch {}
      } else if (key >= '1' && key <= '6') {
        event.preventDefault();
        const tabs = ['Build', 'Sheet', "What's New", 'Saved Dances', 'Friends', 'Glossary'];
        const b = findTabButton(tabs[parseInt(key, 10) - 1]);
        if (b) b.click();
      } else if (key === '/') {
        /* Ctrl+/ = Toggle help panel */
        event.preventDefault();
        const helpPanel = document.getElementById('stepper-help-panel');
        if (helpPanel) helpPanel.hidden = !helpPanel.hidden;
      } else if (key === 'escape') {
        /* Escape = Close open panels */
        const helpPanel = document.getElementById('stepper-help-panel');
        if (helpPanel && !helpPanel.hidden) { helpPanel.hidden = true; event.preventDefault(); }
      }
    }, true);
  }

  function boot(){
    installStorageHooks();
    installKeyboardShortcuts();
    pushSnapshot(true);
    ensureToolbar();

    const main = document.querySelector('main');
    if (main && !main.__stepperHistoryObserver) {
      main.__stepperHistoryObserver = new MutationObserver(() => scheduleRefresh());
      main.__stepperHistoryObserver.observe(main, { childList:true, subtree:true, attributes:true });
    }

    window.addEventListener('storage', () => {
      if (!suppressHistory) queueSnapshot(120);
      scheduleRefresh();
    });
    window.addEventListener(STORAGE_EVENT_NAME, scheduleRefresh);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') scheduleRefresh();
    });
    setInterval(() => {
      if (document.hidden) return;
      const main = document.querySelector('main');
      if (!main || main.style.display === 'none') return;
      if (!suppressHistory) queueSnapshot(0);
      scheduleRefresh();
    }, 12000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();

  window.StepByStepperHistory = {
    undo,
    redo,
    snapshot: pushSnapshot
  };
})();
