(function(){
  const STORAGE_KEY = 'stepper_ultrafast_v1';
  const CONTACT_EMAIL = 'Anthonytau4@gmail.com';
  const TURN_FRACTIONS = ['No turn','1/8','1/4','3/8','1/2','5/8','3/4','7/8','full'];

  const state = {
    tab: 'editor',
    dark: true,
    meta: {
      title:'', choreographer:'', level:'Beginner', counts:'32', walls:'4', music:'', type:'8-count', startFoot:'Right'
    },
    sections:[blankSection()],
    glossaryGroups: [],
    glossaryLoaded: false,
    glossaryLoading: false,
    glossaryError: '',
    glossarySearch: '',
    glossaryContext: null,
    modalOpen: false
  };

  function uid(){ return Math.random().toString(36).slice(2,10); }
  function blankStep(){ return { id:uid(), count:'', name:'', description:'', foot:'R', weight:true, note:'' }; }
  function blankSection(){ return { id:uid(), name:'', steps:[blankStep()] }; }

  function escapeHtml(v){ return String(v ?? '').replace(/[&<>\"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }
  function footLabel(v){ return v === 'L' ? 'Left' : v === 'R' ? 'Right' : v || ''; }
  function bellIcon(size=''){ return `<span class="icon-squircle ${size}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`; }

  function generateNextCount(lastCountStr='', templateCountStr='1', type='8-count'){
    const maxCount = type === 'waltz' ? 6 : 8;
    const matches = String(lastCountStr).match(/\d+/g);
    let lastNum = matches && matches.length ? parseInt(matches[matches.length-1],10) : 0;
    let nextStart = lastNum + 1;
    if (nextStart > maxCount) nextStart = 1;
    const templateMatches = String(templateCountStr).match(/\d+/g);
    if (!templateMatches || !templateMatches.length) return String(templateCountStr || '1');
    const templateStart = parseInt(templateMatches[0],10);
    const offset = nextStart - templateStart;
    return String(templateCountStr).replace(/\d+/g, m => {
      let n = parseInt(m,10) + offset;
      while(n > maxCount) n -= maxCount;
      while(n < 1) n += maxCount;
      return String(n);
    });
  }

  function save(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ dark: state.dark, meta: state.meta, sections: state.sections }));
    }catch(e){}
  }

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.dark === 'boolean') state.dark = parsed.dark;
      if (parsed.meta) state.meta = { ...state.meta, ...parsed.meta };
      if (Array.isArray(parsed.sections) && parsed.sections.length) state.sections = parsed.sections;
    }catch(e){}
  }

  function render(){
    document.documentElement.classList.toggle('dark', !!state.dark);
    document.body.innerHTML = appTemplate();
    bind();
  }

  function appTemplate(){
    return `<div class="app">
      <header class="topbar">
        <div class="brand">
          ${bellIcon('')}
          <div>
            <h1>Step by Stepper</h1>
            <p>Fast-load edition</p>
          </div>
        </div>
        <div class="tabs">
          <button class="tab ${state.tab==='editor'?'active':''}" data-tab="editor">Editor</button>
          <button class="tab ${state.tab==='preview'?'active':''}" data-tab="preview">Preview</button>
          <button class="tab ${state.tab==='whatsnew'?'active':''}" data-tab="whatsnew">What’s New</button>
          <button class="icon-btn" id="toggle-dark" aria-label="Toggle dark mode">${state.dark ? '☀️' : '🌙'}</button>
        </div>
      </header>
      <main class="main">
        ${state.tab==='editor' ? editorTemplate() : state.tab==='preview' ? previewTemplate() : whatsNewTemplate()}
      </main>
      ${state.modalOpen ? glossaryModalTemplate() : ''}
    </div>`;
  }

  function editorTemplate(){
    return `<div class="grid">
      <section class="card">
        <div class="card-head"><h2>Dance Information</h2></div>
        <div class="card-body grid meta">
          ${fieldTemplate('Dance Title','title',state.meta.title)}
          ${fieldTemplate('Choreographer','choreographer',state.meta.choreographer)}
          ${fieldTemplate('Music','music',state.meta.music)}
          ${selectTemplate('Level','level',state.meta.level,['Absolute Beginner','Beginner','Improver','Intermediate','Advanced'])}
          ${selectTemplate('Counts','counts',state.meta.counts,['16','24','32','48','64','96'])}
          ${selectTemplate('Walls','walls',state.meta.walls,['1','2','4'])}
          ${selectTemplate('Rhythm Type','type',state.meta.type,['8-count','waltz'])}
          ${selectTemplate('Start Foot','startFoot',state.meta.startFoot,['Right','Left'])}
        </div>
      </section>
      <div class="helper">Have I missed a step? Email me any steps you miss and will be on site soon! <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></div>
      ${state.sections.map((section, sectionIndex) => sectionTemplate(section, sectionIndex)).join('')}
      <div class="actions"><button class="btn" id="add-section">Add Section</button></div>
    </div>`;
  }

  function fieldTemplate(label,key,value){
    return `<div class="field"><label>${label}</label><input class="input" data-meta="${key}" value="${escapeHtml(value)}"></div>`;
  }
  function selectTemplate(label,key,value,options){
    return `<div class="field"><label>${label}</label><select class="select" data-meta="${key}">${options.map(o=>`<option ${o===value?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select></div>`;
  }

  function sectionTemplate(section, sectionIndex){
    return `<section class="card" data-section-id="${section.id}">
      <div class="card-head">
        <h3>Section ${sectionIndex+1}</h3>
        <div class="actions">
          <button class="btn-ghost open-glossary" data-section="${section.id}">Glossary</button>
          <button class="btn-danger delete-section" data-section="${section.id}">Delete</button>
        </div>
      </div>
      <div class="card-body">
        <div class="field"><label>Section Title</label><input class="input section-name" data-section="${section.id}" value="${escapeHtml(section.name)}" placeholder="Section title"></div>
        <div class="stack" style="margin-top:14px">
          ${section.steps.map((step, stepIndex) => stepRowTemplate(section.id, step, stepIndex)).join('')}
        </div>
        <div class="actions">
          <button class="btn" data-add-step="${section.id}">Add Step</button>
        </div>
      </div>
    </section>`;
  }

  function stepRowTemplate(sectionId, step, stepIndex){
    return `<div class="row" data-step-id="${step.id}" data-section-id="${sectionId}">
      <input class="input mini count" data-step-field="count" value="${escapeHtml(step.count)}" placeholder="1&2">
      <div class="desc">
        <input class="input mini name" data-step-field="name" value="${escapeHtml(step.name)}" placeholder="Move name">
        <textarea class="textarea" data-step-field="description" placeholder="Foot placement / step description">${escapeHtml(step.description)}</textarea>
      </div>
      <div class="stack">
        <select class="select mini foot" data-step-field="foot">
          ${['R','L','Both','None'].map(v=>`<option value="${v}" ${step.foot===v?'selected':''}>${v}</option>`).join('')}
        </select>
        <label class="small center" style="gap:8px"><input type="checkbox" data-step-field="weight" ${step.weight ? 'checked' : ''}>Wgt</label>
      </div>
      <button class="trash" data-delete-step="${step.id}" title="Delete">✕</button>
    </div>`;
  }

  function previewTemplate(){
    return `<section class="card preview-sheet">
      <h1>${escapeHtml(state.meta.title || 'Untitled Dance')}</h1>
      <div class="meta-strip">
        <div>Count<span>${escapeHtml(state.meta.counts)}</span></div>
        <div>Wall<span>${escapeHtml(state.meta.walls)}</span></div>
        <div>Level<span>${escapeHtml(state.meta.level)}</span></div>
        <div>Start Foot<span>${escapeHtml(state.meta.startFoot)}</span></div>
        <div>Choreographer<span>${escapeHtml(state.meta.choreographer || '-')}</span></div>
        <div>Music<span>${escapeHtml(state.meta.music || '-')}</span></div>
      </div>
      ${state.sections.map((section, i) => `<div class="preview-section"><h2>${escapeHtml(section.name || `Section ${i+1}`)}</h2>${section.steps.map(step => `<div class="preview-line"><div class="preview-count">${escapeHtml(step.count)}</div><div class="preview-body"><strong>${escapeHtml(step.name || 'Step')}:</strong> ${escapeHtml(step.description || '')} <span class="fine">[${escapeHtml(step.foot || '')}]</span></div></div>`).join('')}</div>`).join('')}
    </section>`;
  }

  function whatsNewTemplate(){
    const items = [
      'Rebuilt as plain JavaScript so it loads far faster than the React-heavy builds.',
      'Glossary stays outside the main app and only loads when you actually open it.',
      'The community can make this better together by sending an Email to me.',
      'Bell squircle kept lightweight so it does not drag startup down.',
      'Android-readable layout kept without stuffing everything into one massive file.'
    ];
    return `<section class="card"><div class="card-head"><h2>${bellIcon('')} What’s New</h2></div><div class="card-body"><div class="helper">The community can make this better together by sending an Email to me <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></div><div class="whatsnew-list">${items.map(item=>`<div class="note-item">${bellIcon('')}<div>${escapeHtml(item)}</div></div>`).join('')}</div></div></section>`;
  }

  function glossaryModalTemplate(){
    const query = state.glossarySearch.trim().toLowerCase();
    const results = !state.glossaryLoaded ? [] : filterGlossary(query);
    const sectionName = (state.sections.find(s=>s.id===state.glossaryContext?.sectionId)||{}).name || 'Section';
    return `<div class="modal-backdrop" id="modal-close-zone">
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-head">
          <div><strong>Smart Glossary</strong><div class="small">Insert into ${escapeHtml(sectionName)}</div></div>
          <button class="icon-btn" id="close-modal">✕</button>
        </div>
        <div class="modal-body">
          <div class="searchbar"><input id="glossary-search" placeholder="Search steps…" value="${escapeHtml(state.glossarySearch)}"></div>
          <div class="small" style="margin:10px 2px 14px">${state.glossaryLoading ? 'Loading glossary…' : state.glossaryError ? escapeHtml(state.glossaryError) : state.glossaryLoaded ? `Showing ${results.length} results` : 'Glossary ready when needed.'}</div>
          ${state.glossaryLoading ? '<div class="small center" style="padding:24px">Loading…</div>' : ''}
          ${!state.glossaryLoading && state.glossaryLoaded ? results.map(item => `<button class="result insert-glossary" data-step-name="${escapeHtml(item.name)}"><div><div><strong>${escapeHtml(item.name)}</strong> ${item.needsTurn ? '<span class="badge">turn</span>' : ''} ${item.foot && item.foot !== 'None' ? `<span class="badge">start ${escapeHtml(item.foot)}</span>` : ''}</div><div class="small">${escapeHtml(item.desc || '')}</div></div><div class="small">${escapeHtml(item.counts || '')}</div></button>`).join('') : ''}
        </div>
      </div>
    </div>`;
  }

  function bind(){
    document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.tab; render(); }));
    const darkBtn = document.getElementById('toggle-dark');
    if (darkBtn) darkBtn.addEventListener('click', () => { state.dark = !state.dark; save(); render(); });

    document.querySelectorAll('[data-meta]').forEach(el => el.addEventListener('input', () => { state.meta[el.dataset.meta] = el.value; save(); }));
    document.querySelectorAll('.section-name').forEach(el => el.addEventListener('input', () => { const sec = getSection(el.dataset.section); if (sec) sec.name = el.value; save(); }));
    document.querySelectorAll('[data-add-step]').forEach(btn => btn.addEventListener('click', () => addStep(btn.dataset.addStep)));
    document.querySelectorAll('.delete-section').forEach(btn => btn.addEventListener('click', () => { state.sections = state.sections.filter(s => s.id !== btn.dataset.section); if (!state.sections.length) state.sections = [blankSection()]; save(); render(); }));
    const addSectionBtn = document.getElementById('add-section');
    if (addSectionBtn) addSectionBtn.addEventListener('click', () => { state.sections.push(blankSection()); save(); render(); });

    document.querySelectorAll('.row').forEach(row => {
      const sec = getSection(row.dataset.sectionId);
      const step = sec && sec.steps.find(s => s.id === row.dataset.stepId);
      if (!step) return;
      row.querySelectorAll('[data-step-field]').forEach(el => {
        const field = el.dataset.stepField;
        const evt = el.tagName === 'SELECT' || el.type === 'checkbox' ? 'change' : 'input';
        el.addEventListener(evt, () => {
          step[field] = el.type === 'checkbox' ? el.checked : el.value;
          save();
        });
      });
    });
    document.querySelectorAll('[data-delete-step]').forEach(btn => btn.addEventListener('click', () => {
      const row = btn.closest('.row');
      const sec = getSection(row.dataset.sectionId);
      if (!sec) return;
      sec.steps = sec.steps.filter(s => s.id !== btn.dataset.deleteStep);
      if (!sec.steps.length) sec.steps = [blankStep()];
      save(); render();
    }));

    document.querySelectorAll('.open-glossary').forEach(btn => btn.addEventListener('click', async () => {
      state.glossaryContext = { sectionId: btn.dataset.section };
      state.modalOpen = true;
      render();
      await ensureGlossary();
      render();
      const input = document.getElementById('glossary-search');
      if (input) input.focus();
    }));

    const closeZone = document.getElementById('modal-close-zone');
    if (closeZone) closeZone.addEventListener('click', () => { state.modalOpen = false; render(); });
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) closeBtn.addEventListener('click', () => { state.modalOpen = false; render(); });
    const searchInput = document.getElementById('glossary-search');
    if (searchInput) searchInput.addEventListener('input', () => { state.glossarySearch = searchInput.value; const body = searchInput.closest('.modal-body'); if (body) { state.modalOpen = true; render(); } });
    document.querySelectorAll('.insert-glossary').forEach(btn => btn.addEventListener('click', () => insertGlossaryStep(btn.dataset.stepName)));
  }

  function getSection(id){ return state.sections.find(s => s.id === id); }
  function addStep(sectionId){
    const section = getSection(sectionId); if (!section) return;
    const last = section.steps[section.steps.length-1] || { count:'' };
    section.steps.push({ ...blankStep(), count: generateNextCount(last.count, '1', state.meta.type) });
    save(); render();
  }

  async function ensureGlossary(){
    if (state.glossaryLoaded || state.glossaryLoading) return;
    state.glossaryLoading = true; state.glossaryError = ''; render();
    try{
      const base = await loadGlossaryScript();
      const normalized = base.map(normalizeGlossaryEntry);
      state.glossaryGroups = groupGlossary(normalized);
      state.glossaryLoaded = true;
    }catch(e){
      state.glossaryError = 'Glossary failed to load.';
    }finally{
      state.glossaryLoading = false;
    }
  }

  let glossaryPromise = null;
  function loadGlossaryScript(){
    if (Array.isArray(window.STEPPER_BASE_GLOSSARY)) return Promise.resolve(window.STEPPER_BASE_GLOSSARY);
    if (glossaryPromise) return glossaryPromise;
    glossaryPromise = new Promise((resolve,reject)=>{
      const script = document.createElement('script');
      script.src = 'glossary-data.js';
      script.onload = () => resolve(window.STEPPER_BASE_GLOSSARY || []);
      script.onerror = () => reject(new Error('load failed'));
      document.head.appendChild(script);
    });
    return glossaryPromise;
  }

  function normalizeGlossaryEntry(entry){
    const out = { ...entry };
    if (/^Rock\b/i.test(out.name || '') && out.foot === 'L') out.desc = `Rock onto the left foot, then recover onto the right foot.`;
    if (/^Rock\b/i.test(out.name || '') && out.foot === 'R') out.desc = `Rock onto the right foot, then recover onto the left foot.`;
    out.groupKey = makeGroupKey(out.name || '');
    out.searchText = `${(out.name||'').toLowerCase()} ${(out.desc||'').toLowerCase()} ${String(out.foot||'').toLowerCase()} ${out.groupKey.toLowerCase()}`;
    return out;
  }

  function makeGroupKey(name){
    return String(name || '').replace(/\b(left|right)\b/ig,'').replace(/\s+/g,' ').trim() || String(name || '').trim();
  }

  function groupGlossary(entries){
    const groups = new Map();
    entries.forEach(item => {
      const key = item.groupKey;
      if (!groups.has(key)) groups.set(key, { key, counts:item.counts || '', needsTurn:!!item.needsTurn, searchText:'', variants:[] });
      const g = groups.get(key);
      g.searchText += ` ${item.searchText}`;
      g.variants.push(item);
      if (!g.counts && item.counts) g.counts = item.counts;
      if (item.needsTurn) g.needsTurn = true;
    });
    return Array.from(groups.values()).sort((a,b)=>a.key.localeCompare(b.key));
  }

  function filterGlossary(query){
    const list = query ? state.glossaryGroups.filter(g => g.searchText.includes(query)) : state.glossaryGroups.slice(0,120);
    return list.slice(0,180).map(group => {
      const predicted = state.meta.startFoot === 'Left' ? 'L' : 'R';
      const pick = group.variants.find(v => v.foot === predicted) || group.variants.find(v => v.foot === 'R') || group.variants.find(v => v.foot === 'L') || group.variants[0];
      return pick;
    });
  }

  function insertGlossaryStep(name){
    const section = getSection(state.glossaryContext.sectionId);
    if (!section) return;
    const item = filterGlossary(state.glossarySearch.trim().toLowerCase()).find(v => v.name === name) || state.glossaryGroups.flatMap(g=>g.variants).find(v=>v.name===name);
    if (!item) return;
    const last = section.steps[section.steps.length-1] || { count:'' };
    const newStep = {
      id: uid(),
      count: generateNextCount(last.count, item.counts || '1', state.meta.type),
      name: item.name,
      description: item.desc || '',
      foot: item.foot || 'R',
      weight: item.weight !== false,
      note: ''
    };
    if (section.steps.length === 1 && !section.steps[0].name && !section.steps[0].description) section.steps = [newStep];
    else section.steps.push(newStep);
    state.modalOpen = false;
    state.glossarySearch = '';
    save(); render();
  }

  load();
  render();
})();
