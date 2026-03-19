(function(){
  if (window.__stepperEditorPhrasingRepairInstalled) return;
  window.__stepperEditorPhrasingRepairInstalled = true;

  const DATA_KEY = 'linedance_builder_data_v13';
  const TOOLS_KEY = 'stepper_current_phrased_tools_v1';
  const PANEL_ID = 'stepper-inline-phrased-tools';
  const HOST_ID = 'stepper-editor-inline-host';
  const SECTION_BUTTON_CLASS = 'stepper-repair-part-btn';

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
    try { window.dispatchEvent(new Event('storage')); } catch {}
    try { window.dispatchEvent(new CustomEvent('stepperphrasedchange')); } catch {}
  }

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function routeFromPath(){
    const attr = document.documentElement.getAttribute('data-stepper-route') || document.body?.getAttribute('data-stepper-route');
    if (attr) return attr;
    const path = String(window.location.pathname || '/').replace(/\/+$/,'') || '/';
    if (path === '/' || path === '/index.html' || path === '/editor' || path === '/Editor') return 'editor';
    if (path === '/sheet' || path === '/Sheet') return 'preview';
    if (path === '/whats-new') return 'whatsnew';
    if (path === '/my-saved-dances') return 'saveddances';
    if (path === '/featured-choreo') return 'featured';
    return 'editor';
  }

  function isEditorRoute(){
    return routeFromPath() === 'editor';
  }

  function isEditorSurfaceVisible(){
    const main = document.querySelector('main');
    if (!main) return false;
    if (main.style.display === 'none') return false;
    return !!(main.querySelector('input[placeholder="Dance Title"]') || main.querySelector('input[placeholder="Section Title..."]') || /Dance Title/.test(main.textContent || ''));
  }

  function currentData(){
    return readJson(DATA_KEY, { meta:{}, sections:[], tags:[] }) || { meta:{}, sections:[], tags:[] };
  }

  function alphaLabel(index){
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (index < letters.length) return letters[index];
    const major = Math.floor(index / letters.length);
    const minor = index % letters.length;
    return letters[minor] + String(major + 1);
  }

  function normalizeTools(data, supplied){
    const raw = supplied || readJson(TOOLS_KEY, {}) || {};
    const sections = Array.isArray(data && data.sections) ? data.sections : [];
    const tags = Array.isArray(data && data.tags) ? data.tags : [];
    const sectionIds = new Set(sections.map(section => section && section.id).filter(Boolean));
    const tagIds = new Set(tags.map(tag => tag && tag.id).filter(Boolean));
    const parts = Array.isArray(raw.parts) ? raw.parts.map((part, index) => ({
      id: part && part.id ? String(part.id) : 'part-' + alphaLabel(index).toLowerCase() + '-' + index,
      label: String((part && part.label) || alphaLabel(index)).trim() || alphaLabel(index),
      title: String((part && part.title) || '').trim(),
      sectionIds: Array.isArray(part && part.sectionIds) ? part.sectionIds.filter(id => sectionIds.has(id)) : []
    })) : [];
    const sequence = Array.isArray(raw.sequence) ? raw.sequence.filter(item => item && ((item.kind === 'part' && parts.some(part => part.id === item.id)) || (item.kind === 'tag' && tagIds.has(item.id)))) : [];
    return {
      danceFormat: raw.danceFormat === 'phrased' ? 'phrased' : 'regular',
      uiTab: raw.uiTab === 'sequence' ? 'sequence' : 'parts',
      parts,
      sequence
    };
  }

  function saveTools(next){
    writeJson(TOOLS_KEY, normalizeTools(currentData(), next));
  }

  function mutateTools(mutator){
    const data = currentData();
    const next = normalizeTools(data);
    const result = typeof mutator === 'function' ? mutator(clone(next), clone(data)) : next;
    saveTools(result || next);
  }

  function theme(){
    const dark = !!(currentData() && currentData().isDarkMode);
    return {
      dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/70 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500',
      accent: dark ? 'bg-indigo-500 text-neutral-950' : 'bg-indigo-600 text-white',
      button: dark ? 'bg-neutral-900 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      orange: dark ? 'bg-orange-500 text-neutral-950' : 'bg-orange-500 text-white',
      danger: dark ? 'bg-red-500/15 text-red-300 border border-red-400/20' : 'bg-red-50 text-red-700 border border-red-200'
    };
  }

  function ensureStyles(){
    if (document.getElementById('stepper-editor-phrasing-repair-style')) return;
    const style = document.createElement('style');
    style.id = 'stepper-editor-phrasing-repair-style';
    style.textContent = `
      #${PANEL_ID}[hidden]{display:none !important;}
      .stepper-repair-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;}
      .stepper-repair-field label{display:block;font-size:.68rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;margin-bottom:.45rem;}
      .stepper-repair-field input,.stepper-repair-field select{width:100%;border-radius:1rem;border:1px solid rgba(148,163,184,.35);padding:.85rem .95rem;background:rgba(255,255,255,.9);color:#111827;}
      .dark .stepper-repair-field input,.dark .stepper-repair-field select{background:rgba(23,23,23,.9);color:#f5f5f5;border-color:rgba(64,64,64,.9);}
      .stepper-repair-pill{display:inline-flex;align-items:center;gap:.45rem;padding:.55rem .8rem;border-radius:999px;font-weight:800;font-size:.76rem;letter-spacing:.08em;text-transform:uppercase;}
      .stepper-repair-mini{border-radius:999px;padding:.55rem .9rem;font-weight:800;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(99,102,241,.25);}
      .stepper-repair-tab{border-radius:999px;padding:.55rem .9rem;font-weight:800;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;border:1px solid transparent;}
      .${SECTION_BUTTON_CLASS}{margin-left:.6rem;border-radius:999px;padding:.35rem .7rem;font-size:.66rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;border:1px solid rgba(99,102,241,.25);background:rgba(99,102,241,.08);color:#4338ca;}
      .dark .${SECTION_BUTTON_CLASS}{background:rgba(99,102,241,.18);color:#c7d2fe;border-color:rgba(129,140,248,.28);}
      .stepper-repair-seq-row{display:flex;flex-wrap:wrap;align-items:end;gap:.8rem;}
    `;
    document.head.appendChild(style);
  }

  function ensureHost(){
    let host = document.getElementById(PANEL_ID);
    if (host) return host;
    let inlineHost = document.getElementById(HOST_ID);
    if (!inlineHost) {
      inlineHost = document.createElement('div');
      inlineHost.id = HOST_ID;
      inlineHost.className = 'max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-0 print:hidden';
      const main = document.querySelector('main');
      if (main && main.parentNode) main.parentNode.insertBefore(inlineHost, main);
      else document.body.appendChild(inlineHost);
    }
    let stack = inlineHost.querySelector('div.space-y-5');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'space-y-5';
      while (inlineHost.firstChild) stack.appendChild(inlineHost.firstChild);
      inlineHost.appendChild(stack);
    }
    host = document.createElement('section');
    host.id = PANEL_ID;
    stack.prepend(host);
    return host;
  }

  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
    const map = new Map((Array.isArray(data && data.sections) ? data.sections : []).map(section => [section.id, section]));
    return (Array.isArray(part && part.sectionIds) ? part.sectionIds : []).reduce((sum, sectionId) => sum + deriveSectionCount(map.get(sectionId), data), 0);
  }

  function sequenceLabel(item, tools, tags){
    if (!item) return '';
    if (item.kind === 'part') {
      const part = tools.parts.find(entry => entry.id === item.id);
      return part ? `Part ${part.label}` : 'Part';
    }
    const tag = tags.find(entry => entry.id === item.id);
    return tag ? String(tag.name || 'Tag').trim() || 'Tag' : 'Tag';
  }

  function deriveSequenceString(tools, tags){
    return (Array.isArray(tools.sequence) ? tools.sequence : []).map(item => sequenceLabel(item, tools, tags)).filter(Boolean).join(', ');
  }

  function render(){
    ensureStyles();
    const host = ensureHost();
    const inlineHost = document.getElementById(HOST_ID);
    if (!isEditorRoute() || !isEditorSurfaceVisible()) {
      if (host) {
        host.hidden = true;
        host.innerHTML = '';
      }
      if (inlineHost) inlineHost.hidden = true;
      return;
    }
    const data = currentData();
    const tools = normalizeTools(data);
    const palette = theme();
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const tags = Array.isArray(data.tags) ? data.tags : [];
    const options = [
      ...tools.parts.map(part => ({ value: `part:${part.id}`, label: `Part ${part.label}` })),
      ...tags.map(tag => ({ value: `tag:${tag.id}`, label: String(tag.name || 'Tag').trim() || 'Tag' }))
    ];

    const partsHtml = tools.parts.length ? tools.parts.map((part, index) => `
      <article class="rounded-3xl border p-5 sm:p-6 ${palette.soft}" data-stepper-repair-part="${escapeHtml(part.id)}">
        <div class="stepper-repair-grid">
          <div class="stepper-repair-field"><label>Part Label</label><input type="text" maxlength="8" data-field="label" value="${escapeHtml(part.label)}"></div>
          <div class="stepper-repair-field"><label>Part Title</label><input type="text" maxlength="80" data-field="title" value="${escapeHtml(part.title)}" placeholder="Optional Part Title"></div>
        </div>
        <div class="mt-4">
          <div class="text-[10px] font-black uppercase tracking-widest ${palette.subtle}">Sections in this Part</div>
          <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${sections.map(section => `
              <label class="rounded-2xl border px-4 py-3 ${palette.panel} flex items-center gap-3">
                <input type="checkbox" data-section-box="${escapeHtml(part.id)}::${escapeHtml(section.id)}" ${part.sectionIds.includes(section.id) ? 'checked' : ''}>
                <span class="font-semibold">${escapeHtml(String(section.name || `Section ${index + 1}`).trim())}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <span class="stepper-repair-pill ${palette.dark ? 'bg-indigo-900/40 text-indigo-200' : 'bg-indigo-100 text-indigo-700'}">Part ${escapeHtml(part.label || alphaLabel(index))}</span>
          <span class="text-sm font-semibold ${palette.subtle}">${derivePartCount(part, data)} counts</span>
          <button type="button" data-action="remove-part" data-part-id="${escapeHtml(part.id)}" class="stepper-repair-mini ${palette.danger}">Remove Part</button>
        </div>
      </article>
    `).join('') : `<div class="rounded-3xl border p-6 ${palette.soft}"><p class="font-bold">No Parts yet.</p><p class="mt-2 ${palette.subtle}">Tap a section's <strong>Part</strong> button or use <strong>Add Part</strong> here to start building Part A / Part B / Part C.</p></div>`;

    const sequenceHtml = tools.sequence.length ? tools.sequence.map((item, index) => `
      <div class="stepper-repair-seq-row" data-seq-row="${index}">
        <div class="stepper-repair-field" style="flex:1 1 260px;"><label>${index === 0 ? 'Sequence' : 'Next'}</label><select data-seq-select="${index}">${options.map(option => `<option value="${escapeHtml(option.value)}" ${option.value === `${item.kind}:${item.id}` ? 'selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select></div>
        <button type="button" data-action="add-after" data-seq-index="${index}" class="stepper-repair-mini ${palette.accent}">+</button>
        <button type="button" data-action="remove-seq" data-seq-index="${index}" class="stepper-repair-mini ${palette.danger}">Delete</button>
      </div>
    `).join('') : `<div class="rounded-3xl border p-6 ${palette.soft}"><p class="font-bold">No Sequence yet.</p><p class="mt-2 ${palette.subtle}">Build your Part A / Part B order here once you have parts ready.</p></div>`;

    host.hidden = false;
    host.className = `rounded-3xl border shadow-sm overflow-hidden ${palette.shell}`;
    host.innerHTML = `
      <div class="px-6 py-5 border-b ${palette.panel}">
        <h2 class="text-2xl font-black tracking-tight uppercase">Dance Phrasing</h2>
      </div>
      <div class="p-6 sm:p-8 space-y-5">
        <div class="rounded-2xl border p-5 ${palette.panel}">
          <div class="stepper-repair-grid">
            <div class="stepper-repair-field">
              <label for="stepper-repair-dance-format">Dance Format</label>
              <select id="stepper-repair-dance-format">
                <option value="regular" ${tools.danceFormat === 'regular' ? 'selected' : ''}>Regular</option>
                <option value="phrased" ${tools.danceFormat === 'phrased' ? 'selected' : ''}>Phrased</option>
              </select>
            </div>
            <div class="rounded-2xl border px-4 py-4 ${palette.soft}">
              <div class="text-[10px] font-black uppercase tracking-widest ${palette.subtle}">Phrased Summary</div>
              <div class="mt-2 font-bold">${tools.parts.length ? `${tools.parts.length} Part${tools.parts.length === 1 ? '' : 's'}` : 'No Parts yet'}</div>
              <p class="mt-1 text-sm ${palette.subtle}">${tools.sequence.length ? `Sequence: ${escapeHtml(deriveSequenceString(tools, tags))}` : 'Use Part A / Part B / Part C here, then build the order in Sequence.'}</p>
            </div>
          </div>
        </div>
        ${tools.danceFormat === 'phrased' ? `
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" data-tab="parts" class="stepper-repair-tab ${tools.uiTab !== 'sequence' ? palette.accent : palette.button}">Parts</button>
            <button type="button" data-tab="sequence" class="stepper-repair-tab ${tools.uiTab === 'sequence' ? palette.accent : palette.button}">Sequence</button>
            <button type="button" data-action="add-part" class="stepper-repair-mini ${palette.orange}">Add Part</button>
          </div>
          ${tools.uiTab === 'sequence' ? `<div class="space-y-4">${sequenceHtml}</div>` : `<div class="space-y-4">${partsHtml}</div>`}
        ` : `<div class="rounded-3xl border p-6 ${palette.soft}"><p class="font-bold">Switch this dance to <strong>Phrased</strong> to bring back the Part A / Part B / Part C tools.</p><p class="mt-2 ${palette.subtle}">Once phrased is on, you can build Parts and a separate Sequence again.</p></div>`}
      </div>
    `;

    if (inlineHost) inlineHost.hidden = false;

    const formatSelect = host.querySelector('#stepper-repair-dance-format');
    if (formatSelect) formatSelect.addEventListener('change', (event) => {
      mutateTools((next) => {
        next.danceFormat = event.target.value === 'phrased' ? 'phrased' : 'regular';
        if (next.danceFormat !== 'phrased') next.uiTab = 'parts';
        return next;
      });
      render();
      decorateSectionHeaders();
    });

    host.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
      const nextTab = button.getAttribute('data-tab') === 'sequence' ? 'sequence' : 'parts';
      mutateTools((next) => { next.uiTab = nextTab; return next; });
      render();
    }));

    const addPartBtn = host.querySelector('[data-action="add-part"]');
    if (addPartBtn) addPartBtn.addEventListener('click', () => {
      mutateTools((next, dataSnapshot) => {
        const firstSection = Array.isArray(dataSnapshot.sections) ? dataSnapshot.sections[0] : null;
        next.danceFormat = 'phrased';
        next.uiTab = 'parts';
        next.parts.push({ id:'part-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), label:alphaLabel(next.parts.length), title:'', sectionIds:firstSection ? [firstSection.id] : [] });
        if (!next.sequence.length && next.parts[0]) next.sequence.push({ kind:'part', id:next.parts[0].id });
        return next;
      });
      render();
      decorateSectionHeaders();
    });

    host.querySelectorAll('[data-stepper-repair-part]').forEach((card) => {
      const partId = card.getAttribute('data-stepper-repair-part');
      const labelInput = card.querySelector('[data-field="label"]');
      const titleInput = card.querySelector('[data-field="title"]');
      if (labelInput) labelInput.addEventListener('input', (event) => {
        mutateTools((next) => {
          const part = next.parts.find(item => item.id === partId);
          if (part) part.label = String(event.target.value || '').trim() || part.label;
          return next;
        });
      });
      if (titleInput) titleInput.addEventListener('input', (event) => {
        mutateTools((next) => {
          const part = next.parts.find(item => item.id === partId);
          if (part) part.title = String(event.target.value || '').trim();
          return next;
        });
      });
    });

    host.querySelectorAll('[data-section-box]').forEach((box) => box.addEventListener('change', () => {
      const [partId, sectionId] = String(box.getAttribute('data-section-box') || '').split('::');
      mutateTools((next) => {
        const part = next.parts.find(item => item.id === partId);
        if (!part) return next;
        const ids = new Set(Array.isArray(part.sectionIds) ? part.sectionIds : []);
        if (box.checked) ids.add(sectionId); else ids.delete(sectionId);
        part.sectionIds = Array.from(ids);
        return next;
      });
      render();
    }));

    host.querySelectorAll('[data-action="remove-part"]').forEach((button) => button.addEventListener('click', () => {
      const partId = button.getAttribute('data-part-id');
      mutateTools((next) => {
        next.parts = next.parts.filter(item => item.id !== partId);
        next.sequence = next.sequence.filter(item => !(item.kind === 'part' && item.id === partId));
        if (next.uiTab === 'sequence' && !next.sequence.length) next.uiTab = 'parts';
        return next;
      });
      render();
      decorateSectionHeaders();
    }));

    host.querySelectorAll('[data-seq-select]').forEach((select) => select.addEventListener('change', (event) => {
      const index = Number(select.getAttribute('data-seq-select')) || 0;
      mutateTools((next) => {
        const [kind, id] = String(event.target.value || '').split(':');
        next.sequence[index] = { kind, id };
        return next;
      });
      render();
    }));

    host.querySelectorAll('[data-action="add-after"]').forEach((button) => button.addEventListener('click', () => {
      const index = Number(button.getAttribute('data-seq-index')) || 0;
      mutateTools((next, dataSnapshot) => {
        const fallback = next.parts[0] ? { kind:'part', id:next.parts[0].id } : ((Array.isArray(dataSnapshot.tags) && dataSnapshot.tags[0]) ? { kind:'tag', id:dataSnapshot.tags[0].id } : null);
        if (fallback) next.sequence.splice(index + 1, 0, fallback);
        return next;
      });
      render();
    }));

    host.querySelectorAll('[data-action="remove-seq"]').forEach((button) => button.addEventListener('click', () => {
      const index = Number(button.getAttribute('data-seq-index')) || 0;
      mutateTools((next) => {
        next.sequence.splice(index, 1);
        if (next.uiTab === 'sequence' && !next.sequence.length) next.uiTab = 'parts';
        return next;
      });
      render();
    }));
  }

  function addPartFromSection(sectionId){
    mutateTools((next, dataSnapshot) => {
      const sections = Array.isArray(dataSnapshot.sections) ? dataSnapshot.sections : [];
      const section = sections.find(item => item && item.id === sectionId);
      if (!section) return next;
      next.danceFormat = 'phrased';
      next.uiTab = 'parts';
      next.parts.push({ id:'part-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7), label:alphaLabel(next.parts.length), title:String(section.name || '').trim(), sectionIds:[sectionId] });
      if (!next.sequence.length && next.parts[0]) next.sequence.push({ kind:'part', id:next.parts[0].id });
      return next;
    });
    render();
    decorateSectionHeaders();
  }

  function decorateSectionHeaders(){
    if (!isEditorRoute() || !isEditorSurfaceVisible()) return;
    const data = currentData();
    const sections = Array.isArray(data.sections) ? data.sections : [];
    const inputs = Array.from(document.querySelectorAll('main input[placeholder="Section Title..."]'));
    inputs.forEach((input, index) => {
      const header = input.parentElement;
      const section = sections[index];
      if (!header || !section) return;
      let button = header.querySelector('.' + SECTION_BUTTON_CLASS);
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = SECTION_BUTTON_CLASS;
        button.textContent = 'Part';
        header.appendChild(button);
      }
      if (!button.__stepperRepairWired) {
        button.__stepperRepairWired = true;
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          addPartFromSection(section.id);
        });
      }
    });
  }

  function scrubNonEditorMentions(){
    const route = routeFromPath();
    const inlineHost = document.getElementById(HOST_ID);
    if (route !== 'editor' && inlineHost) inlineHost.hidden = true;
    const whatsNew = document.getElementById('stepper-whatsnew-page');
    if (!whatsNew) return;
    whatsNew.querySelectorAll('article, .rounded-2xl, .rounded-3xl').forEach((node) => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (/\bEditor\b/i.test(text) || /right click an edited step/i.test(text) || /Glossary\+/i.test(text)) {
        if (route !== 'editor') node.remove();
      }
    });
  }

  function refresh(){
    try { render(); } catch {}
    try { decorateSectionHeaders(); } catch {}
    try { scrubNonEditorMentions(); } catch {}
  }

  function boot(){
    refresh();
    let queued = false;
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        refresh();
      });
    };
    const observer = new MutationObserver((mutations) => {
      if (mutations.some(m => m.addedNodes.length || m.removedNodes.length)) schedule();
    });
    observer.observe(document.documentElement || document.body, { childList:true, subtree:true });
    window.addEventListener('storage', schedule);
    window.addEventListener('popstate', schedule);
    window.addEventListener('stepperphrasedchange', schedule);
    setInterval(refresh, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
