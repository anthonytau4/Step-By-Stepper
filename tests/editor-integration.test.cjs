const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const engine = require('../stepper-dance-engine.js');
const root = path.resolve(__dirname, '..');

function storage() {
  const data = new Map();
  return {getItem:key => data.get(key) || null, setItem:(key,value) => data.set(key,String(value)), removeItem:key => data.delete(key)};
}
function toolsContext() {
  const events = [], localStorage = storage();
  const window = { StepperDance:engine, addEventListener(){}, dispatchEvent(event){ events.push(event.type); } };
  const document = { head:{appendChild(){}}, documentElement:{}, createElement(){ return {}; }, addEventListener(){} };
  class Event { constructor(type) { this.type = type; } }
  const context = vm.createContext({window,document,localStorage,Event,CustomEvent:Event,MutationObserver:class {observe(){}},setTimeout(){},clearTimeout(){},console});
  vm.runInContext(fs.readFileSync(path.join(root,'stepper-dance-tools.js'),'utf8'), context);
  return { tools:window.__stepperDanceTools, localStorage, events };
}
test('live helper insertion uses its selected position, persists, and refreshes the sheet', () => {
  const {tools,localStorage,events} = toolsContext();
  localStorage.setItem('linedance_builder_data_v13',JSON.stringify({meta:{counts:'4',music:'My music'},sections:[{id:'main',steps:[{id:'one',type:'step',count:'1',name:'Step Right',foot:'R'},{id:'two',type:'step',count:'2',name:'Step Left',foot:'L'}]}]}));
  tools.setTarget({sectionId:'main',beforeStepId:'two'});
  const before = tools.revision();
  const result = tools.addSteps([{name:'Kick Ball Change',count:'1&2',foot:'L'}],{target:tools.selectedTarget(),revision:before});
  assert.equal(result.applied,true);
  assert.deepEqual(Array.from(tools.read().sections[0].steps, s => s.count),['1','2&3','4']);
  assert.equal(tools.read().meta.music,'My music');
  assert(events.includes('storage') && events.includes('stepper-data-changed'));
  assert.throws(() => tools.commit({meta:{},sections:[]},before),/sheet changed/);
});
test('an AI response for an older revision cannot overwrite newer edits', () => {
  const {tools,localStorage} = toolsContext();
  const revision = tools.revision();
  localStorage.setItem('linedance_builder_data_v13',JSON.stringify({meta:{title:'New title'},sections:[]}));
  assert.throws(() => tools.addSteps([{name:'Step Right',count:'1'}],{revision}),/sheet changed/);
  assert.equal(tools.read().meta.title,'New title');
});

test('drag mapping skips gaps and footer buttons and keeps main/tag identities', () => {
  const localStorage = storage();
  localStorage.setItem('linedance_builder_data_v13',JSON.stringify({sections:[{id:'main',steps:[{id:'real-step'}]}],tags:[{id:'tag',sections:[{id:'tag-section',steps:[{id:'tag-step'}]}]}]}));
  const makeRow = () => {
    const attributes = new Map(), handle = {setAttribute(){}};
    return {dataset:{},style:{},attributes,setAttribute(k,v){attributes.set(k,String(v));},removeAttribute(k){attributes.delete(k);},querySelector(selector){return selector === '.stepper-step-dragger' ? handle : {};}};
  };
  const mainRow = makeRow(), tagRow = makeRow();
  const gap = {querySelector(){return null;}};
  const heading = row => {
    const section = {dataset:{},children:[{}, {children:[gap,row,gap]}]};
    return {parentElement:{parentElement:section}};
  };
  const headings = [heading(mainRow),heading(tagRow)];
  const document = {readyState:'loading',addEventListener(){},querySelector(){return {querySelectorAll(){return headings;}};}};
  const window = {StepperDance:engine};
  vm.runInNewContext(fs.readFileSync(path.join(root,'stepper-step-select.js'),'utf8'),{window,document,localStorage,console});
  const mapped = window.__stepperStepSelect.mapDomSteps();
  assert.equal(mapped.rows.length,1);
  assert.equal(mapped.rows[0].length,1);
  assert.equal(mainRow.dataset.danceStepId,'real-step');
  assert.equal(mainRow.attributes.get('data-step-idx'),'0');
  assert.equal(tagRow.dataset.danceTagId,'tag');
  assert.equal(tagRow.dataset.danceSectionId,'tag-section');
  assert.equal(tagRow.attributes.has('data-section-idx'),false);
});

function routeContext(url, scriptPath) {
  const location = new URL(url), clicks = [], attributes = new Map(), intervals = [];
  const button = name => ({textContent:name,addEventListener(){},click(){clicks.push(name);}});
  const buttons = [button('Build'),button('Sheet'),button("What's New")];
  const music = button('Music');
  const document = {readyState:'complete',currentScript:{src:new URL(scriptPath,url).href},documentElement:{setAttribute:(k,v)=>attributes.set(k,v)},body:{setAttribute(){}},querySelectorAll(){return buttons;},getElementById(id){return id==='stepper-music-tab'?music:null;}};
  const history = {pushState(state,title,url){location.href=new URL(url,location).href;},replaceState(state,title,url){location.href=new URL(url,location).href;}};
  const window = {location,setTimeout(fn){fn();},setInterval(fn){intervals.push(fn);return intervals.length;},clearInterval(){},addEventListener(){}};
  const context = vm.createContext({window,document,history,location,URL,URLSearchParams,sessionStorage:storage(),MutationObserver:class {observe(){}},console});
  const source = fs.readFileSync(path.join(root,'stepper-route-paths.js'),'utf8').split('\n(function(){')[0];
  vm.runInContext(source,context);
  return {window,location,clicks,intervals};
}
test('music bootstrap opens Music and keeps the canonical route on a custom domain', () => {
  const {window,location,clicks} = routeContext('https://example.com/?stepperRoute=music','/stepper-route-paths.js');
  assert.equal(location.pathname,'/music/');
  assert.deepEqual(clicks,['Music']);
  assert.equal(window.__stepperRoutePaths.current(),'music');
});
test('music navigation respects a GitHub Pages project prefix', () => {
  const {window,location,clicks} = routeContext('https://example.github.io/Step-By-Stepper/?stepperRoute=music','/Step-By-Stepper/stepper-route-paths.js');
  assert.equal(location.pathname,'/Step-By-Stepper/music/');
  assert.deepEqual(clicks,['Music']);
  assert.equal(window.__stepperRoutePaths.paths.editor,'/Step-By-Stepper/editor/');
});
test('refreshing /music/index.html keeps Music selected', () => {
  const {location,clicks} = routeContext('https://example.com/music/index.html','/stepper-route-paths.js');
  assert.equal(location.pathname,'/music/');
  assert.deepEqual(clicks,['Music']);
});
test('all deployed editor entrypoints load the engine, UI, music and undo', () => {
  for (const entry of ['index.html','editor/index.html','sheet/index.html','featured-choreo/index.html','my-saved-dances/index.html','whats-new/index.html']) {
    const html = fs.readFileSync(path.join(root,entry),'utf8');
    const sources = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(match=>match[1].split('?')[0]);
    for (const script of ['stepper-dance-engine.js','stepper-dance-tools.js','stepper-music-tab.js','stepper-history-undo-redo.js']) {
      assert(sources.includes('./'+script),entry+' missing '+script);
      assert(fs.existsSync(path.join(root,script)));
    }
    assert(html.indexOf('src="./stepper-dance-engine.js') < html.indexOf('src="./stepper-google-admin.ai-hardstop.js'));
    assert(!sources.some(source=>source.startsWith('../stepper-')),entry+' escapes its asset base');
    for (const [index,match] of [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].entries()) {
      if (/application\/ld\+json|application\/json/.test(match[1]) || !match[2].trim()) continue;
      new vm.Script(match[2], {filename:entry+'#script-'+index});
    }
  }
});

test('all deployed entrypoints expose the same tab bundle and virtual routes have fallbacks', () => {
  const rootSources = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script[^>]*src="([^\"]+)"/g)]
    .map(match => path.basename(match[1].split('?')[0]));
  const expected = new Set(rootSources);
  for (const entry of ['editor/index.html','sheet/index.html','featured-choreo/index.html','my-saved-dances/index.html','whats-new/index.html']) {
    const sources = [...fs.readFileSync(path.join(root, entry), 'utf8').matchAll(/<script[^>]*src="([^\"]+)"/g)]
      .map(match => path.basename(match[1].split('?')[0]));
    assert.deepEqual(new Set(sources), expected, entry + ' tab bundle drifted from the main entrypoint');
  }
  for (const [route, title] of [['friends','Friends'],['glossary','Glossary'],['pdf-import','PDF Import'],['settings','Settings'],['templates','Templates'],['tips','Tips']]) {
    const shim = path.join(root, route, 'index.html');
    assert(fs.existsSync(shim), route + ' route fallback is missing');
    const html = fs.readFileSync(shim, 'utf8');
    assert.match(html, new RegExp('stepperRoute=' + route.replace('-', ''), 'i'), route + ' fallback does not select its tab');
    assert.match(html, new RegExp('Step by Stepper · ' + title));
  }
});
