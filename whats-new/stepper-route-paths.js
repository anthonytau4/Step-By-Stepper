(function(){
  if (window.__stepperSubpathRouteShimInstalled) return;
  window.__stepperSubpathRouteShimInstalled = true;
  function loadRootRouteHelper(){
    if (window.__stepperRoutePathsInstalled) return;
    var script = document.createElement('script');
    script.src = '../stepper-route-paths.js?v=20260612-autosave-cache-1';
    script.async = false;
    document.head.appendChild(script);
  }
  function readJson(key, fallback){ try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; } }
  function writeJson(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function cacheSession(){
    var session = readJson('stepper_google_auth_session_v2', null);
    if (session && session.credential) writeJson('stepper_google_signin_cache_v1', Object.assign({}, session, { cachedAt:new Date().toISOString() }));
  }
  function cacheDance(reason){
    var data = readJson('linedance_builder_data_v13', null);
    if (!data || !data.meta) return;
    var meta = data.meta || {};
    var sections = Array.isArray(data.sections) ? data.sections : [];
    var steps = sections.reduce(function(sum, section){ return sum + (section && Array.isArray(section.steps) ? section.steps.length : 0); }, 0);
    var title = String(meta.title || '').trim();
    var choreographer = String(meta.choreographer || '').trim();
    if (!title && !choreographer && !steps) return;
    title = title || 'Untitled Dance';
    choreographer = choreographer || 'Uncredited';
    var entry = { id:title.toLowerCase() + '|' + choreographer.toLowerCase(), title:title, choreographer:choreographer, country:String(meta.country || '').trim(), level:String(meta.level || 'Unlabelled').trim() || 'Unlabelled', counts:String(meta.counts || '-').trim() || '-', walls:String(meta.walls || '-').trim() || '-', music:String(meta.music || '').trim(), sections:sections.length, steps:steps, updatedAt:new Date().toISOString(), snapshot:{ data:data, phrasedTools:readJson('stepper_current_phrased_tools_v1', {}) } };
    var signature = JSON.stringify({ title:entry.title, choreographer:entry.choreographer, counts:entry.counts, walls:entry.walls, steps:entry.steps, sections:entry.sections, data:data });
    if (signature === String(localStorage.getItem('stepper_last_saved_signature_v1') || '')) return;
    var pending = readJson('stepper_pending_autosaves_v1', []);
    pending = (Array.isArray(pending) ? pending : []).filter(function(item){ return item && item.signature !== signature; });
    pending.unshift({ entry:entry, signature:signature, reason:String(reason || 'autosave'), autosavedAt:new Date().toISOString(), uploadAttempts:0 });
    writeJson('stepper_pending_autosaves_v1', pending.slice(0, 24));
  }
  cacheSession();
  loadRootRouteHelper();
  window.addEventListener('beforeunload', function(){ cacheSession(); cacheDance('before-close'); });
  window.addEventListener('storage', function(){ cacheSession(); cacheDance('local-change'); });
  setInterval(function(){ cacheSession(); cacheDance('subpath-index-autosave'); }, 6000);
})();
