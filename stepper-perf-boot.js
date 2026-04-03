(function(){
  if (window.__stepperPerfBootInstalled) return;
  window.__stepperPerfBootInstalled = true;

  var BUFFERED_KEYS = new Set([
    'linedance_builder_data_v13',
    'stepper_save_for_later_v1',
    'stepper_save_for_later_session_v1',
    'stepper_current_phrased_tools_v1',
    'stepper_sound_settings_v1',
    'stepper_google_frontend_profile_v1',
    'stepper_cloud_saves_frontend_v1',
    'stepper_featured_choreo_v1'
  ]);
  var pending = new Map();
  var flushTimer = 0;
  var original = {
    setItem: Storage.prototype.setItem,
    getItem: Storage.prototype.getItem,
    removeItem: Storage.prototype.removeItem,
    clear: Storage.prototype.clear
  };

  function isBufferedStore(store, key){
    return typeof window !== 'undefined' && store === window.localStorage && BUFFERED_KEYS.has(String(key || ''));
  }
  function flushKey(key){
    if (!pending.has(key)) return;
    var value = pending.get(key);
    pending.delete(key);
    try { original.setItem.call(window.localStorage, key, value); } catch (e) {}
  }
  function flushAll(){
    if (!pending.size) return;
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = 0; }
    Array.from(pending.keys()).forEach(flushKey);
  }
  function scheduleFlush(){
    if (flushTimer) return;
    flushTimer = window.setTimeout(function(){ flushTimer = 0; flushAll(); }, 350);
  }

  Storage.prototype.setItem = function(key, value){
    var strKey = String(key || '');
    var strValue = String(value == null ? '' : value);
    if (isBufferedStore(this, strKey)) {
      pending.set(strKey, strValue);
      scheduleFlush();
      return;
    }
    return original.setItem.call(this, strKey, strValue);
  };
  Storage.prototype.getItem = function(key){
    var strKey = String(key || '');
    if (isBufferedStore(this, strKey) && pending.has(strKey)) return pending.get(strKey);
    return original.getItem.call(this, strKey);
  };
  Storage.prototype.removeItem = function(key){
    var strKey = String(key || '');
    pending.delete(strKey);
    return original.removeItem.call(this, strKey);
  };
  Storage.prototype.clear = function(){
    pending.clear();
    return original.clear.call(this);
  };

  window.addEventListener('pagehide', flushAll);
  window.addEventListener('beforeunload', flushAll);
  document.addEventListener('visibilitychange', function(){ if (document.hidden) flushAll(); });
  window.__stepperFlushBufferedStorage = flushAll;
  window.__stepperLowPowerMode = true;
})();
