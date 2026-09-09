const { test } = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../stepper-dance-engine.js');
const step = (id, count, description, foot = 'R', extra = {}) => ({ id, type:'step', count, name:description, description, foot, ...extra });
const dance = (steps, meta = {}) => ({ meta:{ startFoot:'Right', ...meta }, sections:[{ id:'main', name:'Main', steps }], tags:[] });
const errors = data => engine.validate(data).issues.filter(issue => issue.severity === 'error');

test('stored single labels describe one beat, including count 8', () => {
  assert.equal(engine.countSpan({ count:'8' }), 1);
  assert.equal(engine.countSpan({ count:'5&6' }), 2);
  assert.equal(engine.countSpan({ count:'1&a2' }), 2);
  assert.equal(engine.countSpan({ count:'1&a' }), 1);
});
test('inserts a glossary duration at the selected gap and shifts following rhythm labels', () => {
  const input = dance([step('a','1&2','Coaster'), step('b','3-4','Rock')]);
  const result = engine.insert(input, [{ name:'Vine', count:'4', foot:'R' }], { sectionId:'main', beforeStepId:'b' });
  assert.deepEqual(result.data.sections[0].steps.map(s => s.count), ['1&2','3-6','7-8']);
  assert.deepEqual(input.sections[0].steps.map(s => s.count), ['1&2','3-4']);
});
test('moving a syncopated row preserves rhythm, IDs and unrelated metadata', () => {
  const input = dance([step('a','1&2','Coaster'), step('b','3-4','Rock')], { music:'Keep this', walls:'4' });
  const result = engine.move(input, { sectionId:'main', stepId:'a' }, { sectionId:'main' });
  assert.deepEqual(result.sections[0].steps.map(s => [s.id,s.count]), [['b','1-2'],['a','3&4']]);
  assert.equal(result.meta.music, 'Keep this');
  assert.equal(input.sections[0].steps[0].id, 'a');
});
test('supports dropping into an empty section without deleting section identity', () => {
  const input = dance([step('a','8','Step Right forward')]);
  input.sections.push({ id:'empty', name:'Keep my title', steps:[] });
  const result = engine.move(input, { sectionId:'main', stepId:'a' }, { sectionId:'empty' });
  assert.equal(result.sections[0].steps.length, 0);
  assert.equal(result.sections[1].name, 'Keep my title');
  assert.equal(result.sections[1].steps[0].count, '1');
});
test('insertion and movement can target tag sections by stable IDs', () => {
  const input = dance([step('a','1','Step Right forward')]);
  input.tags = [{ id:'tag', sections:[{ id:'tag-section', steps:[] }] }];
  const result = engine.move(input, { sectionId:'main', stepId:'a' }, { sectionId:'tag-section', tagId:'tag' });
  assert.equal(result.tags[0].sections[0].steps[0].id, 'a');
  const added = engine.insert(result, [{ name:'Touch', count:'1', foot:'L' }], { sectionId:'tag-section', tagId:'tag', afterStepId:'a' });
  assert.equal(added.data.tags[0].sections[0].steps[1].count, '2');
});
test('stale insertion anchors and invalid counts cannot partly modify a sheet', () => {
  const input = dance([step('a','1','Step Right forward')]);
  assert.throws(() => engine.insert(input, [{name:'Walk',count:'1'}], {sectionId:'main',afterStepId:'deleted'}), /changed/);
  assert.throws(() => engine.insert(input, [{name:'Walk',count:'x'}]), /invalid count/);
  assert.equal(input.sections[0].steps.length, 1);
});
test('standalone & and a subdivisions retain their timing', () => {
  const input = dance([step('a','1','Kick R'),step('b','&','Step R'),step('c','2','Step L')]);
  engine.renumber(input);
  assert.deepEqual(input.sections[0].steps.map(s => s.count), ['1','&','2']);
  assert.equal(engine.validate(input).totalCounts, 2);
  assert.throws(() => engine.move(input,{sectionId:'main',stepId:'b'},{sectionId:'main',beforeStepId:'a'}), /whole syncopated/);
  const rolling = dance([step('a','1','Step R'),step('b','&','Step L'),step('c','a','Step R'),step('d','2','Step L')]);
  assert.equal(engine.validate(rolling).totalCounts, 2);
});
test('marker rows move without acquiring count labels or affecting the total', () => {
  const marker = { id:'restart', type:'marker', markerType:'restart', wall:'3' };
  const input = dance([step('a','1','Step R'),step('b','2','Step L'),marker]);
  const result = engine.move(input,{sectionId:'main',stepId:'restart'},{sectionId:'main',beforeStepId:'a'});
  assert.equal(result.sections[0].steps[0].count, undefined);
  assert.equal(engine.validate(result).totalCounts, 2);
});
test('catches attempts to step or kick with the supporting foot', () => {
  const input = dance([step('a','1','Step Right forward'),step('b','2','Kick Right forward')]);
  assert(errors(input).some(issue => issue.code === 'weighted-foot' && issue.stepId === 'b'));
});
test('touch, kick, scuff, hold and brush do not transfer weight', () => {
  for (const action of ['Touch','Kick','Scuff','Brush']) {
    const input = dance([step('a','1',action+' Right forward'), step('b','2','Hold'), step('c','3','Step Right forward'),step('d','4','Step Left forward','L')]);
    assert.equal(errors(input).length, 0, action);
  }
});
test('a hop on the supporting foot is possible', () => {
  assert.equal(errors(dance([step('a','1','Hop Right')], { startWeight:'R' })).length, 0);
});
test('explicit pivot exit weight is carried into the next action', () => {
  const input = dance([step('a','1-2','Step Right forward, pivot half turn ending weight on Left'),step('b','3','Step Right forward'),step('c','4','Step Left forward','L')]);
  assert.equal(errors(input).length, 0);
});
test('grapevine ends on the leading foot while kick-ball-change ends on the other', () => {
  const vine = dance([step('a','1-4','','R',{ name:'Vine Right' })]);
  assert.equal(engine.validate(vine).endWeight, 'R');
  const kick = dance([step('a','1&2','','R',{ name:'Kick Ball Change' })]);
  assert.equal(engine.validate(kick).endWeight, 'L');
  assert.equal(errors(kick).length, 0);
});
test('tracks weight across section boundaries instead of resetting each section', () => {
  const input = dance([step('a','1','Step Right forward')]);
  input.sections.push({ id:'next', steps:[step('b','1','Step Right forward')] });
  assert(errors(input).some(issue => issue.stepId === 'b' && issue.code === 'weighted-foot'));
});
test('repairs a conflict and rewrites subsequent actions to follow the changed exit weight', () => {
  const input = dance([step('a','1','Step Right forward'),step('b','2','Step Right forward'),step('c','3','Step Left back','L'),step('d','4','Step Right back')]);
  const repaired = engine.repair(input);
  assert.equal(repaired.changes.length, 3);
  assert.deepEqual(repaired.data.sections[0].steps.map(s => s.foot), ['R','L','R','L']);
  assert.equal(errors(repaired.data).length, 0);
  assert.equal(input.sections[0].steps[1].description, 'Step Right forward');
});
test('internal conflicts inside a multi-action row are detected and repaired', () => {
  const input = dance([step('a','1-2','Step Right forward, step Right back')]);
  const repaired = engine.repair(input);
  assert.match(repaired.data.sections[0].steps[0].description, /step Left back/);
  assert.equal(errors(repaired.data).length, 0);
});
test('end repair frees the opening foot without adding or removing counts', () => {
  const input = dance([step('a','1','Step Right forward'),step('b','2','Step Left forward','L'),step('c','3','Step Right forward')]);
  assert(errors(input).some(issue => issue.code === 'repeat-weight'));
  const repaired = engine.repair(input);
  assert.equal(repaired.validation.endWeight, 'L');
  assert.equal(repaired.validation.totalCounts, 3);
  assert.equal(repaired.data.sections[0].steps[2].weight, false);
  assert.equal(errors(repaired.data).length, 0);
});
test('left-leading dances receive the same repeat check', () => {
  const input = dance([step('a','1','Step Left forward','L')], { startFoot:'Left' });
  const repaired = engine.repair(input);
  assert.equal(repaired.validation.firstFoot, 'L');
  assert.equal(repaired.validation.endWeight, 'R');
});
test('unclear custom actions cannot be reported as a verified dance', () => {
  const input = dance([step('a','1-4','Spiral and leap dramatically'),step('b','5','Step Right forward')]);
  assert.equal(engine.validate(input).complete, false);
  assert(engine.validate(input).issues.some(issue => issue.code === 'unknown-footwork'));
  assert(engine.repair(input).validation.issues.some(issue => issue.severity === 'warning'));
});
test('a restart checks the opening foot at its actual position', () => {
  const input = dance([step('a','1','Step Right forward'),{id:'r',type:'marker',markerType:'restart'},step('b','2','Step Left forward','L')]);
  assert(errors(input).some(issue => issue.code === 'restart-weight'));
  assert.equal(errors(engine.repair(input).data).length, 0);
});
test('a full helper build continues into correctly numbered sections', () => {
  const input = dance([]);
  const result = engine.insert(input, Array.from({length:4}, () => ({name:'Vine Right',foot:'R',count:'4'})));
  assert.equal(result.data.sections.length, 2);
  assert.deepEqual(result.data.sections.map(section => section.steps.map(step => step.count)), [['1-4','5-8'],['1-4','5-8']]);
});
test('numbered atomic AI rows do not turn count positions into durations', () => {
  const result = engine.insert(dance([]), [step('a','1','Step R'),step('b','2','Step L','L')]);
  assert.equal(engine.validate(result.data).totalCounts, 2);
});
test('a leading hold does not hide the repeat weight conflict', () => {
  assert(errors(dance([step('a','1','Hold'),step('b','2','Step Right')])).some(issue => issue.code === 'repeat-weight'));
});
test('tags without a known entry remain flagged and are still checked internally', () => {
  const input = dance([]);
  input.tags = [{id:'tag',name:'Tag 1',sections:[{id:'ts',steps:[step('a','1','Step Right'),step('b','2','Step Right')]}]}];
  const report = engine.validate(input);
  assert(report.issues.some(issue => issue.code === 'tag-entry'));
  assert(report.issues.some(issue => issue.code === 'weighted-foot' && issue.tagId === 'tag'));
});
test('phrased checks follow the declared order including repeated parts', () => {
  const input = dance([step('a','1','Step Right')]);
  input.sections.push({id:'second',steps:[step('b','1','Step Left','L')]});
  const phrasing = {danceFormat:'phrased',parts:[{id:'A',sectionIds:['main']},{id:'B',sectionIds:['second']}],sequence:[{kind:'part',id:'B'},{kind:'part',id:'A'}]};
  assert(engine.validate(input,phrasing).issues.some(issue => issue.code === 'weighted-foot' && issue.stepId === 'b'));
});
test('waltz count renumbering preserves six-count phrases', () => {
  const input = dance([step('a','1-3','Walk'),step('b','4-6','Walk')],{type:'Waltz',counts:'6'});
  const result = engine.move(input,{sectionId:'main',stepId:'a'},{sectionId:'main'});
  assert.deepEqual(result.sections[0].steps.map(s => s.count), ['1-3','4-6']);
  assert.equal(engine.sectionSize(result), 6);
});
