/* Live worksheet insertion points and reviewable count/weight repairs. */
(function () {
  'use strict';
  if (window.__stepperDanceTools || !window.StepperDance) return;
  const engine = window.StepperDance;
  const KEY = 'linedance_builder_data_v13';
  const PHRASES = 'stepper_current_phrased_tools_v1';
  let target = null, preview = null, undo = null, timer, signature = '';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { meta: {}, sections: [], tags: [] }; } catch (_) { return { meta: {}, sections: [], tags: [] }; } };
  const phrasing = () => { try { return JSON.parse(localStorage.getItem(PHRASES)) || {}; } catch (_) { return {}; } };
  const revision = () => JSON.stringify({ data: read(), phrasing: phrasing() });
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  function commit(data, expected) {
    if (expected && expected !== revision()) throw new Error('The sheet changed. Check it again before applying these edits.');
    const history = window.__stepperHistoryUndoRedo || window.StepByStepperHistory;
    if (history?.snapshot) history.snapshot();
    localStorage.setItem(KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('stepper-data-changed'));
    if (history?.snapshot) history.snapshot();
    if (history?.queueSnapshot) history.queueSnapshot(0);
    schedule();
  }
  function selectedTarget() { return target ? engine.clone(target) : null; }
  function addSteps(steps, options = {}) {
    let data = read();
    if (options.revision && options.revision !== revision()) throw new Error('The sheet changed while the helper was working. Ask it again using the updated sheet.');
    data.meta ||= {};
    for (const key of ['title', 'counts', 'walls', 'type', 'level', 'startFoot']) if (options.meta?.[key]) data.meta[key] = options.meta[key];
    let insertion = options.target === undefined ? selectedTarget() : options.target;
    if (options.createSection) {
      const section = { id: 'section-' + Date.now(), name: 'Section ' + ((data.sections || []).length + 1), steps: [] };
      data.sections ||= [];
      data.sections.push(section);
      insertion = { sectionId: section.id, tagId: null };
    }
    const result = engine.insert(data, steps, insertion);
    commit(result.data);
    if (insertion) target = { sectionId: insertion.sectionId, tagId: insertion.tagId, afterStepId: result.addedIds.at(-1) };
    const report = engine.validate(result.data, phrasing());
    const errors = report.issues.filter(issue => issue.severity === 'error').length;
    return { applied: true, message: 'Added ' + steps.length + ' step' + (steps.length === 1 ? '' : 's') + ' at the selected position and updated the counts.' + (errors ? ' The dance check found ' + errors + ' issue' + (errors === 1 ? '' : 's') + '; use Help me to review repairs.' : '') };
  }
  function help() {
    const base = revision();
    preview = { ...engine.repair(read(), phrasing()), revision: base };
    signature = '';
    render();
    document.getElementById('stepper-dance-check')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return { handled: true, message: preview.changes.length ? 'I prepared ' + preview.changes.length + ' footwork repair' + (preview.changes.length === 1 ? '' : 's') + '. Review the changes in Dance check, then use Apply repairs.' : 'I checked the counts and weight. See Dance check for anything that still needs clearer footwork or placement.' };
  }
  function summary() {
    const report = engine.validate(read(), phrasing());
    return report.issues.length ? report.issues.map(issue => (issue.count ? 'Count ' + issue.count + ': ' : '') + issue.message).join('\n') : 'No count or weight conflicts found in the described footwork.';
  }
  function render() {
    const main = document.querySelector('main');
    const editor = main?.querySelector('input[placeholder="Section Title..."]');
    const old = document.getElementById('stepper-dance-check');
    if (!editor || main.hidden || main.style.display === 'none') { if (old) old.hidden = true; return; }
    const data = read(), currentRevision = revision();
    if (preview && preview.revision !== currentRevision) preview = null;
    const nextSignature = currentRevision + JSON.stringify(target) + !!preview + !!undo;
    if (old && !old.hidden && nextSignature === signature) return;
    signature = nextSignature;
    const panel = old || document.createElement('section');
    panel.id = 'stepper-dance-check';
    panel.className = 'print:hidden';
    panel.hidden = false;
    if (!old) main.prepend(panel);
    const report = engine.validate(data, phrasing());
    const gaps = [{ label: 'End of main dance', value: null }];
    engine.locations(data).forEach(({ section, sectionIndex, tagId }) => {
      const name = (tagId ? (data.tags.find(tag => tag.id === tagId)?.name || 'Tag') + ' / ' : '') + (section.name || 'Section ' + (sectionIndex + 1));
      gaps.push({ label: name + ' — start', value: { sectionId: section.id, tagId, beforeStepId: section.steps?.[0]?.id } });
      (section.steps || []).forEach(step => gaps.push({ label: name + ' — after ' + (step.count || '') + ' ' + (step.name || step.markerType || 'blank row'), value: { sectionId: section.id, tagId, afterStepId: step.id } }));
    });
    let selected = gaps.findIndex(gap => JSON.stringify(gap.value) === JSON.stringify(target));
    if (selected < 0) { selected = 0; target = null; }
    const changedCounts = preview && JSON.stringify(preview.data) !== JSON.stringify(data);
    panel.innerHTML = '<h2>Dance check</h2><div class="stepper-check-controls">' +
      '<label>Starting weight<select data-start-weight><option value="L">Left foot (Right free)</option><option value="R">Right foot (Left free)</option></select></label>' +
      '<label>Add helper steps at<select data-insertion>' + gaps.map((gap, index) => '<option value="' + index + '">' + esc(gap.label) + '</option>').join('') + '</select></label></div>' +
      '<p role="status">' + esc(report.totalCounts + ' counts written. ' + (report.issues.length ? report.issues.length + ' item(s) to check.' : 'No count or weight conflicts found.')) + '</p>' +
      '<ul>' + report.issues.map(issue => '<li><strong>' + esc((issue.tagId ? 'Tag · ' : '') + (issue.count ? 'Count ' + issue.count + ': ' : '')) + '</strong>' + esc(issue.message) + '</li>').join('') + '</ul>' +
      '<button type="button" data-help>Help me</button>' +
      (preview ? '<div class="stepper-repair-preview"><h3>Proposed repairs</h3>' + (preview.changes.length ? '<ol>' + preview.changes.map(change => '<li><div><strong>' + esc(change.before.count) + '</strong> ' + esc(change.before.description || change.before.name) + '</div><div>→ ' + esc(change.after.description) + '</div></li>').join('') + '</ol>' : '<p>No automatic footwork repairs are available. Count positions can still be corrected where their timing is clear.</p>') +
      '<p>' + esc(preview.validation.issues.length + ' item(s) will still need checking after these repairs.') + '</p>' +
      '<button type="button" data-apply' + (changedCounts ? '' : ' disabled') + '>Apply repairs</button> <button type="button" data-cancel>Cancel</button></div>' : '') +
      (undo ? ' <button type="button" data-undo>Undo last repair</button>' : '') + '<p data-check-message role="status"></p>';
    panel.querySelector('[data-start-weight]').value = engine.initialWeight(data);
    panel.querySelector('[data-insertion]').value = String(selected);
    panel.querySelector('[data-insertion]').onchange = event => { target = gaps[Number(event.target.value)].value; schedule(); };
    panel.querySelector('[data-start-weight]').onchange = event => { const next = read(); next.meta ||= {}; next.meta.startWeight = event.target.value; commit(next); };
    panel.querySelector('[data-help]').onclick = help;
    panel.querySelector('[data-cancel]')?.addEventListener('click', () => { preview = null; signature = ''; render(); });
    panel.querySelector('[data-apply]')?.addEventListener('click', () => {
      try { const before = read(); commit(preview.data, preview.revision); undo = { data: before, revision: revision() }; preview = null; signature = ''; render(); }
      catch (error) { panel.querySelector('[data-check-message]').textContent = error.message; }
    });
    panel.querySelector('[data-undo]')?.addEventListener('click', () => {
      try { commit(undo.data, undo.revision); undo = null; signature = ''; render(); }
      catch (error) { panel.querySelector('[data-check-message]').textContent = 'The sheet has newer edits. Use the normal Undo control to preserve them.'; }
    });
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(render, 180); }
  const style = document.createElement('style');
  style.textContent = '#stepper-dance-check{border:1px solid #6366f1;padding:16px;margin-bottom:20px;background:var(--stepper-check-bg,#fff);color:var(--stepper-check-text,#171717);font-size:1rem} .dark #stepper-dance-check{--stepper-check-bg:#171717;--stepper-check-text:#fafafa} #stepper-dance-check h2,#stepper-dance-check h3{font-weight:800;margin-bottom:10px} .stepper-check-controls{display:flex;flex-wrap:wrap;gap:12px} .stepper-check-controls label{flex:1;min-width:180px;font-size:.875rem} .stepper-check-controls select{display:block;width:100%;padding:8px;border:1px solid #737373;background:inherit;color:inherit} #stepper-dance-check button{border:1px solid #6366f1;padding:10px 14px;margin-top:10px;font-weight:700} #stepper-dance-check button:disabled{opacity:.5} #stepper-dance-check ul,#stepper-dance-check ol{padding-left:20px;list-style:disc} #stepper-dance-check li{margin:8px 0} .stepper-repair-preview{border-top:1px solid #737373;margin-top:12px;padding-top:12px}';
  document.head.appendChild(style);
  window.__stepperDanceTools = { addSteps, help, summary, read, phrasing, revision, commit, selectedTarget, setTarget(value) { target = value; schedule(); } };
  window.addEventListener('storage', schedule);
  window.addEventListener('stepper-data-changed', schedule);
  window.addEventListener('stepperphrasedchange', schedule);
  document.addEventListener('focusin', event => {
    const row = event.target.closest?.('[data-dance-step-id]');
    if (row) { target = { sectionId: row.dataset.danceSectionId, tagId: row.dataset.danceTagId || null, afterStepId: row.dataset.danceStepId }; schedule(); }
  });
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  schedule();
})();
