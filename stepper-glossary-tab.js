/**
 * stepper-glossary-tab.js
 * ─────────────────────────────────────────────────────────────
 * Dedicated Glossary / Step Dictionary tab for Step-By-Stepper.
 *
 * Provides a comprehensive visual UI for:
 *   - Browsing 100+ standard line-dance steps by category
 *   - Searching steps with fuzzy matching and search suggestions
 *   - Viewing detailed descriptions, foot/count info, difficulty,
 *     related steps, and transition guidance
 *   - One-click or batch-mode adding steps to the worksheet
 *   - Step disambiguation for ambiguous names
 *   - Favorites system with persistent star bookmarks
 *   - Configurable list/compact view toggle
 *   - Multi-axis sort (name, counts, category, favorites)
 *   - Quick stats bar with category breakdowns
 *   - Keyboard navigation and shortcuts
 *   - Print-friendly view and clipboard export
 *   - Recently viewed steps tracking
 *   - Step count summary and category progress
 *
 * Uses window.__stepperStepDictionary for the step database.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperGlossaryTabInstalled) return;
  window.__stepperGlossaryTabInstalled = true;
  var _ic = window.__stepperIcons || {};

  /* ── Constants ── */
  var PAGE_ID = 'stepper-glossary-page';
  var TAB_ID  = 'stepper-glossary-tab';

  var LS_KEY_DATA       = 'linedance_builder_data_v13';
  var LS_KEY_FAVORITES  = 'stepper_glossary_favorites_v1';
  var LS_KEY_VIEW_PREF  = 'stepper_glossary_view_pref_v1';
  var LS_KEY_SORT_PREF  = 'stepper_glossary_sort_pref_v1';

  var SORT_NAME_AZ       = 'name-az';
  var SORT_NAME_ZA       = 'name-za';
  var SORT_COUNTS_LO     = 'counts-lo';
  var SORT_COUNTS_HI     = 'counts-hi';
  var SORT_CATEGORY      = 'category';
  var SORT_FAVORITES     = 'favorites';

  var SORT_OPTIONS = [
    { key: SORT_NAME_AZ,   label: 'Name A-Z' },
    { key: SORT_NAME_ZA,   label: 'Name Z-A' },
    { key: SORT_COUNTS_LO, label: 'Counts (low-high)' },
    { key: SORT_COUNTS_HI, label: 'Counts (high-low)' },
    { key: SORT_CATEGORY,  label: 'Category' },
    { key: SORT_FAVORITES, label: 'Favorites first' }
  ];

  var VIEW_LIST    = 'list';
  var VIEW_COMPACT = 'compact';

  var SEARCH_SUGGESTIONS = [
    'vine', 'shuffle', 'coaster', 'jazz box', 'pivot', 'weave',
    'mambo', 'sailor', 'kick', 'stomp', 'rock', 'slide'
  ];

  var MAX_RECENTLY_VIEWED = 10;

  /* ── Local state ── */
  var glossaryState = {
    searchQuery: '',
    selectedCategory: null,
    expandedStep: null,
    recentlyAdded: {},
    favorites: loadJSON(LS_KEY_FAVORITES, {}),
    viewMode: loadString(LS_KEY_VIEW_PREF, VIEW_LIST),
    sortMode: loadString(LS_KEY_SORT_PREF, SORT_NAME_AZ),
    batchMode: false,
    batchSelected: {},
    recentlyViewed: [],
    searchFocused: false,
    showKeyboardHelp: false,
    showSortDropdown: false
  };

  /* ── Persistence helpers ── */
  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); }
    catch (e) { /* quota exceeded */ }
  }
  function loadString(key, fallback) {
    try { return localStorage.getItem(key) || fallback; }
    catch (e) { return fallback; }
  }
  function saveString(key, val) {
    try { localStorage.setItem(key, val); }
    catch (e) { /* quota exceeded */ }
  }

  /* ── Theme helper ── */
  function isDarkMode() {
    try {
      var data = JSON.parse(localStorage.getItem(LS_KEY_DATA) || 'null');
      return !!(data && data.isDarkMode);
    } catch (e) { return false; }
  }
  function themeClasses() {
    var dark = isDarkMode();
    return {
      dark: dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500',
      accent: dark ? 'bg-indigo-500/15 border-indigo-400/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-700',
      cardBg: dark ? 'background:#1a1a2e;border-color:#2d2d44;' : 'background:#ffffff;border-color:#e5e7eb;',
      inputBg: dark ? 'background:#111827;border-color:#374151;color:#f3f4f6;' : 'background:#ffffff;border-color:#d1d5db;color:#111827;',
      chipBg: dark ? 'background:#1f2937;border-color:#374151;color:#d1d5db;' : 'background:#f9fafb;border-color:#e5e7eb;color:#374151;',
      chipActive: 'background:#4f46e5;border-color:#4f46e5;color:#ffffff;',
      border: dark ? '#374151' : '#e5e7eb',
      barBg: dark ? '#1f2937' : '#e5e7eb',
      barFill: '#4f46e5',
      favActive: '#eab308',
      favInactive: dark ? '#4b5563' : '#d1d5db',
      successBg: dark ? 'background:#064e3b;border-color:#065f46;color:#6ee7b7;' : 'background:#ecfdf5;border-color:#a7f3d0;color:#065f46;',
      dangerBg: dark ? 'background:#7f1d1d;border-color:#991b1b;color:#fca5a5;' : 'background:#fef2f2;border-color:#fecaca;color:#991b1b;'
    };
  }
  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = String(text || '');
    return el.innerHTML;
  }

  /* ── Icon helper ── */
  function icon(name, fallback) {
    return _ic[name] || fallback || '';
  }

  /* ── Dictionary reference ── */
  function getDict() { return window.__stepperStepDictionary || null; }

  /* ── Favorites management ── */
  function isFavorite(stepName) {
    return !!glossaryState.favorites[stepName];
  }
  function toggleFavorite(stepName) {
    if (glossaryState.favorites[stepName]) {
      delete glossaryState.favorites[stepName];
    } else {
      glossaryState.favorites[stepName] = Date.now();
    }
    saveJSON(LS_KEY_FAVORITES, glossaryState.favorites);
  }
  function getFavoriteCount() {
    return Object.keys(glossaryState.favorites).length;
  }

  /* ── Recently viewed management ── */
  function trackRecentlyViewed(stepName) {
    var list = glossaryState.recentlyViewed;
    var idx = list.indexOf(stepName);
    if (idx !== -1) list.splice(idx, 1);
    list.unshift(stepName);
    if (list.length > MAX_RECENTLY_VIEWED) list.length = MAX_RECENTLY_VIEWED;
  }

  /* ── Difficulty estimation ── */
  function estimateDifficulty(step) {
    var counts = step.counts || 0;
    var cat = step.category || '';
    var advancedCats = ['syncopated', 'turn', 'jazz', 'specialty'];
    var intermediateCats = ['triple', 'cross', 'embellish', 'slide'];

    if (advancedCats.indexOf(cat) !== -1 || counts >= 6) return 'advanced';
    if (intermediateCats.indexOf(cat) !== -1 || counts >= 4) return 'intermediate';
    return 'beginner';
  }
  function difficultyColor(level) {
    if (level === 'advanced') return '#ef4444';
    if (level === 'intermediate') return '#eab308';
    return '#22c55e';
  }

  /* ── Worksheet helpers ── */
  function getWorksheetStepNames() {
    try {
      var data = JSON.parse(localStorage.getItem(LS_KEY_DATA) || 'null');
      if (!data || !data.sections) return {};
      var names = {};
      for (var s = 0; s < data.sections.length; s++) {
        var sec = data.sections[s];
        if (!sec.steps) continue;
        for (var t = 0; t < sec.steps.length; t++) {
          var st = sec.steps[t];
          if (st.name) {
            var key = st.name.toLowerCase();
            names[key] = (names[key] || 0) + 1;
          }
        }
      }
      return names;
    } catch (e) { return {}; }
  }

  /* ── Sorting ── */
  function sortSteps(steps, mode) {
    var copy = steps.slice();
    switch (mode) {
      case SORT_NAME_AZ:
        copy.sort(function (a, b) { return a.name.localeCompare(b.name); });
        break;
      case SORT_NAME_ZA:
        copy.sort(function (a, b) { return b.name.localeCompare(a.name); });
        break;
      case SORT_COUNTS_LO:
        copy.sort(function (a, b) { return (a.counts || 0) - (b.counts || 0) || a.name.localeCompare(b.name); });
        break;
      case SORT_COUNTS_HI:
        copy.sort(function (a, b) { return (b.counts || 0) - (a.counts || 0) || a.name.localeCompare(b.name); });
        break;
      case SORT_CATEGORY:
        copy.sort(function (a, b) { return (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name); });
        break;
      case SORT_FAVORITES:
        copy.sort(function (a, b) {
          var af = isFavorite(a.name) ? 0 : 1;
          var bf = isFavorite(b.name) ? 0 : 1;
          return af - bf || a.name.localeCompare(b.name);
        });
        break;
      default:
        break;
    }
    return copy;
  }

  /* ── Related steps (same category) ── */
  function getRelatedSteps(step, dict, limit) {
    if (!dict || !step) return [];
    var results = [];
    for (var i = 0; i < dict.STEPS.length; i++) {
      var s = dict.STEPS[i];
      if (s.name !== step.name && s.category === step.category) {
        results.push(s);
      }
      if (results.length >= (limit || 4)) break;
    }
    return results;
  }

  /* ── Transition suggestions ── */
  function getTransitionSuggestions(step, dict) {
    if (!dict || !step) return { before: [], after: [] };
    var cat = step.category || '';
    var beforeCats, afterCats;
    switch (cat) {
      case 'walking': beforeCats = ['touch', 'hold']; afterCats = ['vine', 'turn']; break;
      case 'vine':    beforeCats = ['walking', 'touch']; afterCats = ['touch', 'turn']; break;
      case 'touch':   beforeCats = ['walking', 'vine']; afterCats = ['walking', 'kick']; break;
      case 'turn':    beforeCats = ['vine', 'walking']; afterCats = ['touch', 'hold']; break;
      case 'jazz':    beforeCats = ['cross', 'touch']; afterCats = ['walking', 'vine']; break;
      case 'triple':  beforeCats = ['walking', 'rock']; afterCats = ['turn', 'touch']; break;
      case 'rock':    beforeCats = ['walking', 'vine']; afterCats = ['triple', 'turn']; break;
      case 'kick':    beforeCats = ['touch', 'walking']; afterCats = ['stomp', 'walking']; break;
      default:        beforeCats = ['walking', 'touch']; afterCats = ['walking', 'touch']; break;
    }
    var before = [];
    var after = [];
    for (var i = 0; i < dict.STEPS.length; i++) {
      var s = dict.STEPS[i];
      if (s.name === step.name) continue;
      if (before.length < 2 && beforeCats.indexOf(s.category) !== -1) before.push(s);
      if (after.length < 2 && afterCats.indexOf(s.category) !== -1) after.push(s);
      if (before.length >= 2 && after.length >= 2) break;
    }
    return { before: before, after: after };
  }

  /* ── Stats computation ── */
  function computeStats(dict) {
    if (!dict) return { total: 0, categories: 0, syncopated: 0, straight: 0, favorites: 0 };
    var catSet = {};
    var synco = 0;
    var straight = 0;
    for (var i = 0; i < dict.STEPS.length; i++) {
      var s = dict.STEPS[i];
      catSet[s.category] = true;
      if (s.category === 'syncopated') synco++;
      else straight++;
    }
    return {
      total: dict.STEPS.length,
      categories: Object.keys(catSet).length,
      syncopated: synco,
      straight: straight,
      favorites: getFavoriteCount()
    };
  }

  /* ── Category progress (how many of that category are on the worksheet) ── */
  function getCategoryProgress(catKey, dict) {
    if (!dict) return { added: 0, total: 0, percent: 0 };
    var worksheetNames = getWorksheetStepNames();
    var catSteps;
    if (catKey === 'straight') {
      catSteps = getStraightSteps(dict);
    } else if (catKey) {
      catSteps = dict.getAllSteps(catKey);
    } else {
      catSteps = dict.STEPS;
    }
    var total = catSteps.length;
    var added = 0;
    for (var i = 0; i < catSteps.length; i++) {
      if (worksheetNames[catSteps[i].name.toLowerCase()]) added++;
    }
    return { added: added, total: total, percent: total > 0 ? Math.round((added / total) * 100) : 0 };
  }

  /* ── Helpers for the virtual "straight" category ── */
  function getStraightSteps(dict) {
    return dict.STEPS.filter(function (s) { return s.category !== 'syncopated'; });
  }

  /* ── Count visualization (small bar) ── */
  function renderCountBar(counts, maxCounts, theme) {
    var pct = maxCounts > 0 ? Math.min(100, Math.round((counts / maxCounts) * 100)) : 0;
    return '<div style="display:flex;align-items:center;gap:6px;margin-top:6px;">' +
      '<span style="font-size:11px;font-family:monospace;min-width:22px;">' + counts + '</span>' +
      '<div style="flex:1;height:6px;border-radius:3px;background:' + theme.barBg + ';overflow:hidden;">' +
      '<div style="width:' + pct + '%;height:100%;border-radius:3px;background:' + theme.barFill + ';transition:width .3s;"></div>' +
      '</div></div>';
  }

  /* ── Step total count summary for visible steps ── */
  function computeTotalCounts(steps) {
    var total = 0;
    for (var i = 0; i < steps.length; i++) total += (steps[i].counts || 0);
    return total;
  }

  /* ── Clipboard copy helper ── */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      return;
    }
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
  }

  /* ── Format steps for clipboard export ── */
  function formatStepsForClipboard(steps, dict) {
    var lines = ['STEP DICTIONARY EXPORT', '═'.repeat(40), ''];
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      var cat = (dict.CATEGORIES[s.category] || {}).label || s.category || '';
      lines.push((i + 1) + '. ' + s.name);
      lines.push('   Counts: ' + s.counts + '  |  Foot: ' + s.feet + '  |  Category: ' + cat);
      if (s.description) lines.push('   ' + s.description);
      lines.push('');
    }
    lines.push('Total steps: ' + steps.length);
    lines.push('Total counts: ' + computeTotalCounts(steps));
    return lines.join('\n');
  }

  /* ── Print helper ── */
  function openPrintView(steps, dict) {
    var dark = isDarkMode();
    var bg = dark ? '#111' : '#fff';
    var fg = dark ? '#eee' : '#111';
    var html = '<!DOCTYPE html><html><head><title>Step Dictionary - Print View</title>';
    html += '<style>body{font-family:system-ui,-apple-system,sans-serif;padding:32px;background:' + bg + ';color:' + fg + ';max-width:800px;margin:0 auto;}';
    html += 'h1{font-size:22px;margin:0 0 4px;letter-spacing:0.04em;}';
    html += '.subtitle{font-size:12px;opacity:.6;margin:0 0 24px;}';
    html += 'table{width:100%;border-collapse:collapse;font-size:13px;}';
    html += 'th{text-align:left;padding:8px 12px;border-bottom:2px solid ' + (dark ? '#333' : '#ddd') + ';font-weight:800;text-transform:uppercase;letter-spacing:0.08em;font-size:11px;}';
    html += 'td{padding:8px 12px;border-bottom:1px solid ' + (dark ? '#222' : '#eee') + ';}';
    html += 'tr:hover td{background:' + (dark ? '#1a1a2e' : '#f9fafb') + ';}';
    html += '.mono{font-family:monospace;}';
    html += '@media print{body{background:#fff;color:#000;}th{border-color:#000;}td{border-color:#ccc;}tr:hover td{background:transparent;}}';
    html += '</style></head><body>';
    html += '<h1>Step Dictionary</h1>';
    html += '<p class="subtitle">' + steps.length + ' steps / ' + computeTotalCounts(steps) + ' total counts</p>';
    html += '<table><thead><tr><th>#</th><th>Step Name</th><th>Counts</th><th>Foot</th><th>Category</th><th>Description</th></tr></thead><tbody>';
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i];
      var cat = (dict.CATEGORIES[s.category] || {}).label || '';
      html += '<tr><td class="mono">' + (i + 1) + '</td><td><strong>' + escapeHtml(s.name) + '</strong></td>';
      html += '<td class="mono">' + s.counts + '</td><td>' + escapeHtml(s.feet) + '</td>';
      html += '<td>' + escapeHtml(cat) + '</td><td>' + escapeHtml(s.description || '') + '</td></tr>';
    }
    html += '</tbody></table></body></html>';

    var w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(function () { w.print(); }, 400);
    }
  }

  /* ════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */
  function renderGlossaryPage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) return;
    if (page.hidden || page.style.display === 'none') return;

    var dict = getDict();
    var theme = themeClasses();

    var html = '';
    html += '<div class="rounded-3xl border shadow-sm overflow-hidden ' + theme.shell + '" style="transition:all .3s ease;">';

    /* ── Header ── */
    html += renderHeader(dict, theme);

    /* ── Body ── */
    html += '<div class="p-5 sm:p-6">';

    if (!dict) {
      html += '<div style="text-align:center;padding:40px;">';
      html += '<p style="font-size:14px;opacity:.7;">Step dictionary is loading...</p>';
      html += '</div>';
    } else {
      html += renderQuickStats(dict, theme);
      html += renderToolbar(dict, theme);
      html += renderSearchBar(theme);
      html += renderSearchSuggestions(theme);
      html += renderCategoryChips(dict, theme);

      if (glossaryState.batchMode) {
        html += renderBatchBar(theme);
      }

      var visibleSteps = getVisibleSteps(dict);
      html += renderStepList(visibleSteps, dict, theme);
      html += renderStepCountSummary(visibleSteps, theme);
      html += renderRecentlyViewed(dict, theme);
    }

    html += '</div></div>';

    if (glossaryState.showKeyboardHelp) {
      html += renderKeyboardHelpOverlay(theme);
    }

    page.innerHTML = html;
    wireEvents(page);
  }

  /* ── Header ── */
  function renderHeader(dict, theme) {
    var html = '';
    html += '<div class="px-6 py-5 border-b ' + theme.panel + '">';
    html += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
    html += '<span style="font-size:28px;">' + icon('book') + '</span>';
    html += '<div style="flex:1;">';
    html += '<h2 style="font-size:20px;font-weight:900;margin:0;letter-spacing:0.01em;">Step Dictionary</h2>';
    html += '<p class="' + theme.subtle + '" style="font-size:12px;margin:2px 0 0;">' + (dict ? dict.STEPS.length : 0) + ' standard line-dance steps</p>';
    html += '</div>';

    /* Header actions */
    html += '<div style="display:flex;gap:6px;flex-shrink:0;">';
    html += '<button data-glossary-action="keyboard-help" title="Keyboard shortcuts" style="padding:6px;border-radius:8px;border:1px solid;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;' + theme.chipBg + '">' + icon('help') + '</button>';
    html += '<button data-glossary-action="print" title="Print step list" style="padding:6px;border-radius:8px;border:1px solid;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;' + theme.chipBg + '">' + icon('print') + '</button>';
    html += '<button data-glossary-action="copy" title="Copy to clipboard" style="padding:6px;border-radius:8px;border:1px solid;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .2s;' + theme.chipBg + '">' + icon('copy') + '</button>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  /* ── Quick stats bar ── */
  function renderQuickStats(dict, theme) {
    var stats = computeStats(dict);
    var chips = [
      { label: 'TOTAL STEPS', value: stats.total, ic: 'layers' },
      { label: 'CATEGORIES', value: stats.categories, ic: 'tag' },
      { label: 'STRAIGHT', value: stats.straight, ic: 'list' },
      { label: 'SYNCOPATED', value: stats.syncopated, ic: 'music' },
      { label: 'FAVORITES', value: stats.favorites, ic: 'star' }
    ];
    var html = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">';
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i];
      html += '<div style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;border:1px solid;font-size:11px;' + theme.chipBg + '">';
      html += '<span style="flex-shrink:0;">' + icon(c.ic) + '</span>';
      html += '<span style="text-transform:uppercase;letter-spacing:0.08em;font-weight:700;opacity:.6;">' + c.label + '</span>';
      html += '<span style="font-weight:900;font-family:monospace;">' + c.value + '</span>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  /* ── Toolbar (view toggle, sort, batch mode) ── */
  function renderToolbar(dict, theme) {
    var html = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;">';

    /* View toggle */
    html += '<div style="display:inline-flex;border-radius:10px;border:1px solid;overflow:hidden;' + theme.chipBg + '">';
    var listActive = glossaryState.viewMode === VIEW_LIST;
    html += '<button data-glossary-view="' + VIEW_LIST + '" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;font-size:11px;font-weight:800;cursor:pointer;border:none;transition:all .2s;' + (listActive ? theme.chipActive : theme.chipBg) + '">' + icon('list') + ' LIST</button>';
    html += '<button data-glossary-view="' + VIEW_COMPACT + '" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;font-size:11px;font-weight:800;cursor:pointer;border:none;transition:all .2s;' + (!listActive ? theme.chipActive : theme.chipBg) + '">' + icon('grid') + ' COMPACT</button>';
    html += '</div>';

    /* Sort dropdown */
    html += '<div style="position:relative;">';
    html += '<button data-glossary-action="toggle-sort" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:10px;border:1px solid;font-size:11px;font-weight:800;cursor:pointer;transition:all .2s;' + theme.chipBg + '">';
    html += icon('sort') + ' SORT';
    html += '</button>';
    if (glossaryState.showSortDropdown) {
      html += '<div style="position:absolute;top:100%;left:0;margin-top:4px;z-index:100;min-width:180px;border-radius:12px;border:1px solid;padding:4px;box-shadow:0 8px 24px rgba(0,0,0,.12);' + theme.cardBg + '">';
      for (var i = 0; i < SORT_OPTIONS.length; i++) {
        var opt = SORT_OPTIONS[i];
        var isActive = glossaryState.sortMode === opt.key;
        html += '<button data-glossary-sort="' + opt.key + '" style="display:flex;align-items:center;gap:8px;width:100%;padding:8px 12px;border:none;border-radius:8px;font-size:12px;font-weight:' + (isActive ? '800' : '600') + ';cursor:pointer;text-align:left;transition:all .15s;' + (isActive ? theme.chipActive : theme.chipBg) + '">';
        if (isActive) html += icon('check');
        html += escapeHtml(opt.label) + '</button>';
      }
      html += '</div>';
    }
    html += '</div>';

    /* Batch mode toggle */
    html += '<button data-glossary-action="toggle-batch" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:10px;border:1px solid;font-size:11px;font-weight:800;cursor:pointer;transition:all .2s;' + (glossaryState.batchMode ? theme.chipActive : theme.chipBg) + '">';
    html += icon('layers') + ' BATCH';
    html += '</button>';

    /* Spacer */
    html += '<div style="flex:1;"></div>';

    /* Current sort indicator */
    var currentSort = '';
    for (var j = 0; j < SORT_OPTIONS.length; j++) {
      if (SORT_OPTIONS[j].key === glossaryState.sortMode) { currentSort = SORT_OPTIONS[j].label; break; }
    }
    html += '<span class="' + theme.subtle + '" style="font-size:10px;text-transform:uppercase;letter-spacing:0.08em;">Sorted: ' + escapeHtml(currentSort) + '</span>';

    html += '</div>';
    return html;
  }

  /* ── Search bar ── */
  function renderSearchBar(theme) {
    var html = '<div style="position:relative;margin-bottom:12px;">';
    html += '<div style="position:absolute;left:14px;top:50%;transform:translateY(-50%);pointer-events:none;opacity:.5;">' + icon('search') + '</div>';
    html += '<input data-glossary-search type="text" placeholder="Search steps... (e.g. vine, shuffle, coaster)" value="' + escapeHtml(glossaryState.searchQuery) + '" ';
    html += 'style="width:100%;border-radius:14px;border:1px solid;padding:12px 18px 12px 42px;font-size:15px;outline:none;transition:border-color .2s,box-shadow .2s;' + theme.inputBg + '" />';
    if (glossaryState.searchQuery) {
      html += '<button data-glossary-action="clear-search" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);padding:4px;border:none;background:none;cursor:pointer;opacity:.5;transition:opacity .15s;" title="Clear search (Esc)">' + icon('close') + '</button>';
    }
    html += '</div>';
    return html;
  }

  /* ── Search suggestions ── */
  function renderSearchSuggestions(theme) {
    if (glossaryState.searchQuery || !glossaryState.searchFocused) return '';
    var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;">';
    html += '<span class="' + theme.subtle + '" style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;display:flex;align-items:center;gap:4px;margin-right:4px;">' + icon('trending') + ' POPULAR</span>';
    for (var i = 0; i < SEARCH_SUGGESTIONS.length; i++) {
      html += '<button data-glossary-suggestion="' + escapeHtml(SEARCH_SUGGESTIONS[i]) + '" style="padding:4px 10px;border-radius:999px;border:1px solid;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;' + theme.chipBg + '">' + escapeHtml(SEARCH_SUGGESTIONS[i]) + '</button>';
    }
    html += '</div>';
    return html;
  }

  /* ── Category chips ── */
  function renderCategoryChips(dict, theme) {
    var cats = dict.CATEGORIES;
    var keys = Object.keys(cats);
    var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px;">';

    /* "All" chip */
    var allActive = !glossaryState.selectedCategory;
    var allProgress = getCategoryProgress(null, dict);
    html += '<button data-glossary-cat="" style="display:inline-flex;align-items:center;gap:4px;padding:7px 14px;border-radius:999px;border:1px solid;font-size:12px;font-weight:800;cursor:pointer;transition:all .2s;' + (allActive ? theme.chipActive : theme.chipBg) + '">';
    html += icon('clipboard') + ' All';
    if (allProgress.added > 0) {
      html += ' <span style="opacity:.5;font-size:10px;font-family:monospace;">' + allProgress.percent + '%</span>';
    }
    html += '</button>';

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var cat = cats[key];
      var active = glossaryState.selectedCategory === key;
      var count = key === 'straight' ? getStraightSteps(dict).length : dict.getAllSteps(key).length;
      var progress = getCategoryProgress(key, dict);
      html += '<button data-glossary-cat="' + key + '" style="display:inline-flex;align-items:center;gap:4px;padding:7px 14px;border-radius:999px;border:1px solid;font-size:12px;font-weight:800;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;' + (active ? theme.chipActive : theme.chipBg) + '">';
      if (progress.added > 0 && !active) {
        html += '<span style="position:absolute;bottom:0;left:0;height:2px;background:' + theme.barFill + ';width:' + progress.percent + '%;transition:width .3s;"></span>';
      }
      html += (cat.icon || icon('sway')) + ' ' + escapeHtml(cat.label) + ' <span style="opacity:.6;font-size:10px;font-family:monospace;">(' + count + ')</span></button>';
    }
    html += '</div>';
    return html;
  }

  /* ── Batch action bar ── */
  function renderBatchBar(theme) {
    var count = Object.keys(glossaryState.batchSelected).length;
    var html = '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;padding:10px 16px;border-radius:12px;border:1px solid;' + (count > 0 ? theme.chipActive : theme.chipBg) + '">';
    html += '<span style="font-weight:800;font-size:12px;">' + icon('layers') + ' BATCH MODE</span>';
    html += '<span style="font-family:monospace;font-size:13px;">' + count + ' selected</span>';
    html += '<div style="flex:1;"></div>';
    if (count > 0) {
      html += '<button data-glossary-action="batch-add" style="padding:6px 14px;border-radius:8px;border:none;font-size:12px;font-weight:800;cursor:pointer;background:#22c55e;color:#fff;transition:all .15s;">' + icon('add') + ' Add All Selected</button>';
      html += '<button data-glossary-action="batch-clear" style="padding:6px 14px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;background:transparent;color:inherit;transition:all .15s;">' + icon('close') + ' Clear</button>';
    }
    html += '</div>';
    return html;
  }

  /* ── Get visible steps with all filters and sorting applied ── */
  function getVisibleSteps(dict) {
    var steps;
    if (glossaryState.searchQuery) {
      steps = dict.search(glossaryState.searchQuery);
    } else if (glossaryState.selectedCategory === 'straight') {
      steps = getStraightSteps(dict);
    } else if (glossaryState.selectedCategory) {
      steps = dict.getAllSteps(glossaryState.selectedCategory);
    } else {
      steps = dict.STEPS;
    }

    steps = sortSteps(steps, glossaryState.sortMode);
    return steps;
  }

  /* ── Step list ── */
  function renderStepList(steps, dict, theme) {
    if (!steps.length) {
      var html = '<div style="text-align:center;padding:32px;">';
      html += '<div style="font-size:48px;margin-bottom:12px;">' + icon('shrug') + '</div>';
      html += '<p class="' + theme.subtle + '" style="font-size:14px;">No steps found for "' + escapeHtml(glossaryState.searchQuery) + '"</p>';
      html += '<p class="' + theme.subtle + '" style="font-size:12px;margin-top:4px;">Try "vine", "shuffle", "coaster", or "jazz box"</p>';
      html += '</div>';
      return html;
    }

    var maxCounts = 0;
    for (var m = 0; m < steps.length; m++) {
      if (steps[m].counts > maxCounts) maxCounts = steps[m].counts;
    }

    var html;
    if (glossaryState.viewMode === VIEW_COMPACT) {
      html = renderCompactView(steps, dict, theme);
    } else {
      html = '<div style="display:grid;gap:8px;">';
      for (var i = 0; i < steps.length; i++) {
        html += renderStepCard(steps[i], theme, dict, maxCounts, i);
      }
      html += '</div>';
    }

    /* Stats footer */
    html += '<div style="text-align:center;margin-top:16px;padding:8px;">';
    html += '<span class="' + theme.subtle + '" style="font-size:12px;">Showing ' + steps.length + ' of ' + (dict ? dict.STEPS.length : 0) + ' steps</span>';
    html += '</div>';

    return html;
  }

  /* ── Compact (table) view ── */
  function renderCompactView(steps, dict, theme) {
    var html = '<div style="border-radius:12px;border:1px solid;overflow:hidden;' + theme.cardBg + '">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px;">';
    html += '<thead><tr style="border-bottom:2px solid ' + theme.border + ';">';
    if (glossaryState.batchMode) {
      html += '<th style="padding:8px 6px;text-align:center;width:32px;text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;"></th>';
    }
    html += '<th style="padding:8px 10px;text-align:center;width:28px;"></th>';
    html += '<th style="padding:8px 12px;text-align:left;text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;">STEP NAME</th>';
    html += '<th style="padding:8px 12px;text-align:center;text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;">COUNTS</th>';
    html += '<th style="padding:8px 12px;text-align:center;text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;">FOOT</th>';
    html += '<th style="padding:8px 12px;text-align:left;text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;">CATEGORY</th>';
    html += '<th style="padding:8px 12px;text-align:center;text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;">LEVEL</th>';
    html += '<th style="padding:8px 12px;text-align:center;width:60px;"></th>';
    html += '</tr></thead><tbody>';
    for (var i = 0; i < steps.length; i++) {
      html += renderCompactRow(steps[i], dict, theme, i);
    }
    html += '</tbody></table></div>';
    return html;
  }

  function renderCompactRow(step, dict, theme, index) {
    var cat = (dict.CATEGORIES[step.category] || {});
    var wasAdded = glossaryState.recentlyAdded[step.name];
    var fav = isFavorite(step.name);
    var difficulty = estimateDifficulty(step);
    var isSelected = !!glossaryState.batchSelected[step.name];
    var bgStyle = fav ? (theme.dark ? 'background:rgba(234,179,8,.06);' : 'background:rgba(234,179,8,.04);') : '';
    var html = '<tr data-glossary-step="' + escapeHtml(step.name) + '" style="cursor:pointer;border-bottom:1px solid ' + theme.border + ';transition:background .15s;' + bgStyle + '">';
    if (glossaryState.batchMode) {
      html += '<td style="padding:6px;text-align:center;"><input data-glossary-batch="' + escapeHtml(step.name) + '" type="checkbox"' + (isSelected ? ' checked' : '') + ' style="cursor:pointer;width:14px;height:14px;" /></td>';
    }
    html += '<td style="padding:6px 10px;text-align:center;">';
    html += '<button data-glossary-fav="' + escapeHtml(step.name) + '" style="border:none;background:none;cursor:pointer;padding:2px;transition:transform .15s;" title="' + (fav ? 'Remove from favorites' : 'Add to favorites') + '">';
    html += '<span style="color:' + (fav ? theme.favActive : theme.favInactive) + ';transition:color .2s;">' + icon('star') + '</span></button></td>';
    html += '<td style="padding:6px 12px;font-weight:700;">' + escapeHtml(step.name) + '</td>';
    html += '<td style="padding:6px 12px;text-align:center;font-family:monospace;font-weight:700;">' + step.counts + '</td>';
    html += '<td style="padding:6px 12px;text-align:center;">' + escapeHtml(step.feet) + '</td>';
    html += '<td style="padding:6px 12px;">' + (cat.icon || icon('sway')) + ' ' + escapeHtml(cat.label || '') + '</td>';
    html += '<td style="padding:6px 12px;text-align:center;"><span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:' + difficultyColor(difficulty) + '20;color:' + difficultyColor(difficulty) + ';">' + difficulty + '</span></td>';
    html += '<td style="padding:6px 12px;text-align:center;">';
    html += '<button data-glossary-add="' + escapeHtml(step.name) + '" style="padding:4px 10px;border-radius:8px;font-size:11px;font-weight:800;border:none;cursor:pointer;transition:all .15s;';
    if (wasAdded) {
      html += 'background:#22c55e;color:#fff;">' + icon('check') + '</button>';
    } else {
      html += 'background:#4f46e5;color:#fff;">' + icon('add') + '</button>';
    }
    html += '</td></tr>';
    return html;
  }

  /* ── Step card (list view) ── */
  function renderStepCard(step, theme, dict, maxCounts, index) {
    var isExpanded = glossaryState.expandedStep === step.name;
    var wasAdded = glossaryState.recentlyAdded[step.name];
    var cat = (dict.CATEGORIES[step.category] || {});
    var fav = isFavorite(step.name);
    var isSelected = glossaryState.batchMode && !!glossaryState.batchSelected[step.name];
    var difficulty = estimateDifficulty(step);

    var html = '';
    html += '<div data-glossary-step="' + escapeHtml(step.name) + '" data-glossary-index="' + index + '" style="border-radius:16px;border:1px solid;padding:14px 16px;cursor:pointer;transition:all .2s ease;' + theme.cardBg;
    if (isExpanded) html += 'box-shadow:0 8px 24px rgba(79,70,229,.12);border-color:#4f46e5!important;';
    if (fav && !isExpanded) html += (theme.dark ? 'border-left:3px solid #eab308;' : 'border-left:3px solid #eab308;');
    if (isSelected) html += (theme.dark ? 'background:#1e1b4b!important;' : 'background:#eef2ff!important;');
    html += '">';

    /* Top row */
    html += '<div style="display:flex;align-items:center;gap:10px;">';

    /* Batch checkbox */
    if (glossaryState.batchMode) {
      html += '<input data-glossary-batch="' + escapeHtml(step.name) + '" type="checkbox"' + (isSelected ? ' checked' : '') + ' style="cursor:pointer;width:16px;height:16px;flex-shrink:0;" />';
    }

    /* Favorite star */
    html += '<button data-glossary-fav="' + escapeHtml(step.name) + '" style="border:none;background:none;cursor:pointer;padding:2px;flex-shrink:0;transition:transform .15s;" title="' + (fav ? 'Remove from favorites' : 'Add to favorites') + '">';
    html += '<span style="color:' + (fav ? theme.favActive : theme.favInactive) + ';transition:color .2s;">' + icon('star') + '</span></button>';

    /* Category icon */
    html += '<span style="font-size:20px;flex-shrink:0;">' + (cat.icon || icon('sway')) + '</span>';

    /* Name, count, meta */
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="display:flex;align-items:center;gap:6px;">';
    html += '<span style="font-weight:800;font-size:14px;">' + escapeHtml(step.name) + '</span>';
    html += '<span style="display:inline-block;padding:1px 6px;border-radius:999px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;background:' + difficultyColor(difficulty) + '20;color:' + difficultyColor(difficulty) + ';">' + difficulty + '</span>';
    html += '</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:12px;display:flex;gap:10px;flex-wrap:wrap;margin-top:2px;">';
    html += '<span style="font-family:monospace;">' + step.counts + ' count' + (step.counts !== 1 ? 's' : '') + '</span>';
    html += '<span>Foot: ' + escapeHtml(step.feet) + '</span>';
    if (cat.label) html += '<span>' + escapeHtml(cat.label) + '</span>';
    html += '</div></div>';

    /* Add button */
    html += '<button data-glossary-add="' + escapeHtml(step.name) + '" class="stepper-google-cta" style="padding:8px 14px;border-radius:10px;font-size:12px;font-weight:800;white-space:nowrap;flex-shrink:0;';
    if (wasAdded) {
      html += 'background:#22c55e;color:#fff;border-color:#22c55e;">' + icon('check') + ' Added';
    } else {
      html += 'background:#4f46e5;color:#fff;border-color:#4f46e5;">' + icon('add') + ' Add';
    }
    html += '</button>';

    html += '</div>';

    /* Expanded details */
    if (isExpanded) {
      html += renderExpandedDetails(step, theme, dict, maxCounts);
    }

    html += '</div>';
    return html;
  }

  /* ── Expanded step details ── */
  function renderExpandedDetails(step, theme, dict, maxCounts) {
    var html = '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + theme.border + ';">';

    /* Description */
    html += '<p style="font-size:13px;line-height:1.6;margin:0 0 10px;">' + escapeHtml(step.description) + '</p>';

    /* Aliases */
    if (step.aliases && step.aliases.length) {
      html += '<p class="' + theme.subtle + '" style="font-size:11px;margin:0 0 10px;"><strong>Also known as:</strong> ' + step.aliases.map(function (a) { return escapeHtml(a); }).join(', ') + '</p>';
    }

    /* Detail grid */
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">';

    /* Count visualization */
    html += '<div style="border-radius:12px;border:1px solid;padding:10px 14px;' + theme.chipBg + '">';
    html += '<div style="text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:4px;">' + icon('hashtag') + ' COUNT VISUALIZATION</div>';
    html += renderCountBar(step.counts, maxCounts, theme);
    html += '</div>';

    /* Difficulty */
    var difficulty = estimateDifficulty(step);
    html += '<div style="border-radius:12px;border:1px solid;padding:10px 14px;' + theme.chipBg + '">';
    html += '<div style="text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:4px;">' + icon('target') + ' DIFFICULTY ESTIMATE</div>';
    html += '<div style="display:flex;align-items:center;gap:6px;">';
    html += '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + difficultyColor(difficulty) + ';"></span>';
    html += '<span style="font-size:13px;font-weight:700;text-transform:capitalize;">' + difficulty + '</span>';
    html += '</div>';
    var explanation = difficulty === 'advanced' ? 'Complex timing or technique required' :
                     difficulty === 'intermediate' ? 'Moderate coordination required' :
                     'Foundational step, great for new dancers';
    html += '<p class="' + theme.subtle + '" style="font-size:10px;margin:4px 0 0;">' + explanation + '</p>';
    html += '</div>';

    html += '</div>';

    /* Related steps */
    var related = getRelatedSteps(step, dict, 4);
    if (related.length) {
      html += '<div style="margin-top:10px;">';
      html += '<div style="text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:4px;">' + icon('layers') + ' RELATED STEPS</div>';
      html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
      for (var r = 0; r < related.length; r++) {
        html += '<button data-glossary-navigate="' + escapeHtml(related[r].name) + '" style="padding:4px 10px;border-radius:999px;border:1px solid;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;' + theme.chipBg + '">' + escapeHtml(related[r].name) + ' <span style="opacity:.5;font-family:monospace;">' + related[r].counts + '</span></button>';
      }
      html += '</div></div>';
    }

    /* Transition suggestions */
    var transitions = getTransitionSuggestions(step, dict);
    if (transitions.before.length || transitions.after.length) {
      html += '<div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
      if (transitions.before.length) {
        html += '<div style="border-radius:12px;border:1px solid;padding:10px 14px;' + theme.chipBg + '">';
        html += '<div style="text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:4px;">' + icon('play') + ' FLOWS WELL BEFORE</div>';
        for (var b = 0; b < transitions.before.length; b++) {
          html += '<div style="font-size:12px;margin-top:3px;"><button data-glossary-navigate="' + escapeHtml(transitions.before[b].name) + '" style="border:none;background:none;cursor:pointer;font-size:12px;font-weight:600;text-decoration:underline;text-underline-offset:2px;color:inherit;">' + escapeHtml(transitions.before[b].name) + '</button></div>';
        }
        html += '</div>';
      }
      if (transitions.after.length) {
        html += '<div style="border-radius:12px;border:1px solid;padding:10px 14px;' + theme.chipBg + '">';
        html += '<div style="text-transform:uppercase;letter-spacing:0.08em;font-size:10px;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:4px;">' + icon('play') + ' FLOWS WELL AFTER</div>';
        for (var a = 0; a < transitions.after.length; a++) {
          html += '<div style="font-size:12px;margin-top:3px;"><button data-glossary-navigate="' + escapeHtml(transitions.after[a].name) + '" style="border:none;background:none;cursor:pointer;font-size:12px;font-weight:600;text-decoration:underline;text-underline-offset:2px;color:inherit;">' + escapeHtml(transitions.after[a].name) + '</button></div>';
        }
        html += '</div>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /* ── Step count summary ── */
  function renderStepCountSummary(steps, theme) {
    if (!steps.length) return '';
    var total = computeTotalCounts(steps);
    var html = '<div style="margin-top:12px;padding:10px 16px;border-radius:12px;border:1px solid;display:flex;align-items:center;gap:8px;' + theme.chipBg + '">';
    html += '<span style="flex-shrink:0;">' + icon('zap') + '</span>';
    html += '<span style="font-size:12px;font-weight:700;">Total counts if all ' + steps.length + ' shown steps are added:</span>';
    html += '<span style="font-family:monospace;font-size:14px;font-weight:900;">' + total + '</span>';
    html += '</div>';
    return html;
  }

  /* ── Recently viewed section ── */
  function renderRecentlyViewed(dict, theme) {
    if (!glossaryState.recentlyViewed.length) return '';
    var html = '<div style="margin-top:20px;padding-top:16px;border-top:1px solid ' + theme.border + ';">';
    html += '<div style="text-transform:uppercase;letter-spacing:0.08em;font-size:11px;font-weight:800;margin-bottom:10px;display:flex;align-items:center;gap:6px;">' + icon('clock') + ' RECENTLY VIEWED</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    for (var i = 0; i < glossaryState.recentlyViewed.length; i++) {
      var name = glossaryState.recentlyViewed[i];
      html += '<button data-glossary-navigate="' + escapeHtml(name) + '" style="padding:5px 12px;border-radius:999px;border:1px solid;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;' + theme.chipBg + '">' + escapeHtml(name) + '</button>';
    }
    html += '</div></div>';
    return html;
  }

  /* ── Keyboard help overlay ── */
  function renderKeyboardHelpOverlay(theme) {
    var shortcuts = [
      { key: 'Enter', desc: 'Add first search result to worksheet' },
      { key: 'Escape', desc: 'Clear search / close overlay' },
      { key: '/', desc: 'Focus search bar' },
      { key: 'ArrowUp / ArrowDown', desc: 'Navigate expanded steps' },
      { key: 'f', desc: 'Toggle favorite on expanded step' },
      { key: 'b', desc: 'Toggle batch mode' }
    ];
    var html = '<div data-glossary-overlay style="position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);">';
    html += '<div style="width:400px;max-width:90vw;border-radius:16px;border:1px solid;padding:24px;box-shadow:0 16px 48px rgba(0,0,0,.2);' + theme.cardBg + '">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">';
    html += '<h3 style="font-size:16px;font-weight:900;margin:0;display:flex;align-items:center;gap:8px;">' + icon('key') + ' Keyboard Shortcuts</h3>';
    html += '<button data-glossary-action="close-help" style="border:none;background:none;cursor:pointer;padding:4px;">' + icon('close') + '</button>';
    html += '</div>';
    for (var i = 0; i < shortcuts.length; i++) {
      var s = shortcuts[i];
      html += '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid ' + theme.border + ';">';
      html += '<kbd style="display:inline-block;padding:3px 8px;border-radius:6px;border:1px solid;font-size:11px;font-family:monospace;font-weight:700;min-width:50px;text-align:center;' + theme.chipBg + '">' + escapeHtml(s.key) + '</kbd>';
      html += '<span style="font-size:13px;">' + escapeHtml(s.desc) + '</span>';
      html += '</div>';
    }
    html += '</div></div>';
    return html;
  }

  /* ════════════════════════════════════════════════════════════
     EVENT WIRING
     ════════════════════════════════════════════════════════════ */
  function wireEvents(page) {
    if (!page) return;

    /* Search input */
    var searchInput = page.querySelector('[data-glossary-search]');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        glossaryState.searchQuery = searchInput.value;
        glossaryState.expandedStep = null;
        renderGlossaryPage();
        refocusSearch();
      });
      searchInput.addEventListener('focus', function () {
        glossaryState.searchFocused = true;
        renderGlossaryPage();
        refocusSearch();
      });
      searchInput.addEventListener('blur', function () {
        setTimeout(function () {
          glossaryState.searchFocused = false;
          renderGlossaryPage();
        }, 200);
      });
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          addFirstSearchResult();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          glossaryState.searchQuery = '';
          glossaryState.searchFocused = false;
          renderGlossaryPage();
        }
      });
    }

    /* Search suggestions */
    page.querySelectorAll('[data-glossary-suggestion]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        glossaryState.searchQuery = btn.getAttribute('data-glossary-suggestion');
        glossaryState.expandedStep = null;
        renderGlossaryPage();
        refocusSearch();
      });
    });

    /* Clear search */
    var clearBtn = page.querySelector('[data-glossary-action="clear-search"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        glossaryState.searchQuery = '';
        renderGlossaryPage();
        refocusSearch();
      });
    }

    /* Category chips */
    page.querySelectorAll('[data-glossary-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-glossary-cat');
        glossaryState.selectedCategory = cat || null;
        glossaryState.expandedStep = null;
        renderGlossaryPage();
      });
    });

    /* View toggle */
    page.querySelectorAll('[data-glossary-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        glossaryState.viewMode = btn.getAttribute('data-glossary-view');
        saveString(LS_KEY_VIEW_PREF, glossaryState.viewMode);
        renderGlossaryPage();
      });
    });

    /* Sort dropdown toggle */
    var sortToggle = page.querySelector('[data-glossary-action="toggle-sort"]');
    if (sortToggle) {
      sortToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        glossaryState.showSortDropdown = !glossaryState.showSortDropdown;
        renderGlossaryPage();
      });
    }

    /* Sort option selection */
    page.querySelectorAll('[data-glossary-sort]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        glossaryState.sortMode = btn.getAttribute('data-glossary-sort');
        glossaryState.showSortDropdown = false;
        saveString(LS_KEY_SORT_PREF, glossaryState.sortMode);
        renderGlossaryPage();
      });
    });

    /* Close sort dropdown on outside click */
    if (glossaryState.showSortDropdown) {
      setTimeout(function () {
        var handler = function () {
          glossaryState.showSortDropdown = false;
          renderGlossaryPage();
          document.removeEventListener('click', handler, true);
        };
        document.addEventListener('click', handler, true);
      }, 0);
    }

    /* Batch mode toggle */
    var batchToggle = page.querySelector('[data-glossary-action="toggle-batch"]');
    if (batchToggle) {
      batchToggle.addEventListener('click', function () {
        glossaryState.batchMode = !glossaryState.batchMode;
        glossaryState.batchSelected = {};
        renderGlossaryPage();
      });
    }

    /* Batch checkboxes */
    page.querySelectorAll('[data-glossary-batch]').forEach(function (cb) {
      cb.addEventListener('change', function (e) {
        e.stopPropagation();
        var name = cb.getAttribute('data-glossary-batch');
        if (cb.checked) {
          glossaryState.batchSelected[name] = true;
        } else {
          delete glossaryState.batchSelected[name];
        }
        renderGlossaryPage();
      });
      cb.addEventListener('click', function (e) { e.stopPropagation(); });
    });

    /* Batch add all */
    var batchAdd = page.querySelector('[data-glossary-action="batch-add"]');
    if (batchAdd) {
      batchAdd.addEventListener('click', function () {
        var names = Object.keys(glossaryState.batchSelected);
        for (var i = 0; i < names.length; i++) {
          addStepToWorksheet(names[i], true);
        }
        glossaryState.batchSelected = {};
        renderGlossaryPage();
        setTimeout(function () {
          glossaryState.recentlyAdded = {};
          renderGlossaryPage();
        }, 2000);
      });
    }

    /* Batch clear */
    var batchClear = page.querySelector('[data-glossary-action="batch-clear"]');
    if (batchClear) {
      batchClear.addEventListener('click', function () {
        glossaryState.batchSelected = {};
        renderGlossaryPage();
      });
    }

    /* Favorite toggle */
    page.querySelectorAll('[data-glossary-fav]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var name = btn.getAttribute('data-glossary-fav');
        toggleFavorite(name);
        renderGlossaryPage();
      });
    });

    /* Step expand/collapse */
    page.querySelectorAll('[data-glossary-step]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('[data-glossary-add]')) return;
        if (e.target.closest('[data-glossary-fav]')) return;
        if (e.target.closest('[data-glossary-batch]')) return;
        if (e.target.closest('[data-glossary-navigate]')) return;
        var name = card.getAttribute('data-glossary-step');
        if (glossaryState.expandedStep === name) {
          glossaryState.expandedStep = null;
        } else {
          glossaryState.expandedStep = name;
          trackRecentlyViewed(name);
        }
        renderGlossaryPage();
      });
    });

    /* Navigate to step (related / recently viewed) */
    page.querySelectorAll('[data-glossary-navigate]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var name = btn.getAttribute('data-glossary-navigate');
        glossaryState.expandedStep = name;
        glossaryState.searchQuery = '';
        glossaryState.selectedCategory = null;
        trackRecentlyViewed(name);
        renderGlossaryPage();
        /* Scroll the expanded card into view */
        setTimeout(function () {
          var target = document.querySelector('[data-glossary-step="' + name + '"]');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      });
    });

    /* Add step to worksheet */
    page.querySelectorAll('[data-glossary-add]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var stepName = btn.getAttribute('data-glossary-add');
        addStepToWorksheet(stepName);
      });
    });

    /* Header actions */
    wireHeaderActions(page);

    /* Overlay close */
    var overlay = page.querySelector('[data-glossary-overlay]');
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          glossaryState.showKeyboardHelp = false;
          renderGlossaryPage();
        }
      });
    }
    var closeHelp = page.querySelector('[data-glossary-action="close-help"]');
    if (closeHelp) {
      closeHelp.addEventListener('click', function () {
        glossaryState.showKeyboardHelp = false;
        renderGlossaryPage();
      });
    }

    /* Global keyboard shortcuts (scoped to page) */
    wireKeyboardShortcuts();
  }

  function wireHeaderActions(page) {
    /* Print */
    var printBtn = page.querySelector('[data-glossary-action="print"]');
    if (printBtn) {
      printBtn.addEventListener('click', function () {
        var dict = getDict();
        if (!dict) return;
        var steps = getVisibleSteps(dict);
        openPrintView(steps, dict);
      });
    }

    /* Copy to clipboard */
    var copyBtn = page.querySelector('[data-glossary-action="copy"]');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var dict = getDict();
        if (!dict) return;
        var steps = getVisibleSteps(dict);
        var text = formatStepsForClipboard(steps, dict);
        copyToClipboard(text);
        /* Visual feedback */
        copyBtn.innerHTML = icon('check') + ' Copied';
        setTimeout(function () {
          copyBtn.innerHTML = icon('copy');
        }, 1500);
      });
    }

    /* Keyboard help */
    var helpBtn = page.querySelector('[data-glossary-action="keyboard-help"]');
    if (helpBtn) {
      helpBtn.addEventListener('click', function () {
        glossaryState.showKeyboardHelp = true;
        renderGlossaryPage();
      });
    }
  }

  var _keyboardHandlerBound = false;
  function wireKeyboardShortcuts() {
    if (_keyboardHandlerBound) return;
    _keyboardHandlerBound = true;

    document.addEventListener('keydown', function (e) {
      var page = document.getElementById(PAGE_ID);
      if (!page || page.hidden || page.style.display === 'none') return;

      var activeTag = (document.activeElement && document.activeElement.tagName) || '';
      var isInput = activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT';

      /* Escape closes keyboard help */
      if (e.key === 'Escape' && glossaryState.showKeyboardHelp) {
        glossaryState.showKeyboardHelp = false;
        renderGlossaryPage();
        return;
      }

      if (isInput) return;

      /* '/' focuses search */
      if (e.key === '/') {
        e.preventDefault();
        var search = page.querySelector('[data-glossary-search]');
        if (search) search.focus();
        return;
      }

      /* 'f' toggles favorite on expanded step */
      if (e.key === 'f' && glossaryState.expandedStep) {
        toggleFavorite(glossaryState.expandedStep);
        renderGlossaryPage();
        return;
      }

      /* 'b' toggles batch mode */
      if (e.key === 'b') {
        glossaryState.batchMode = !glossaryState.batchMode;
        glossaryState.batchSelected = {};
        renderGlossaryPage();
        return;
      }

      /* Arrow keys navigate steps */
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        var dict = getDict();
        if (!dict) return;
        var steps = getVisibleSteps(dict);
        if (!steps.length) return;

        var currentIdx = -1;
        if (glossaryState.expandedStep) {
          for (var i = 0; i < steps.length; i++) {
            if (steps[i].name === glossaryState.expandedStep) { currentIdx = i; break; }
          }
        }
        var nextIdx;
        if (e.key === 'ArrowDown') {
          nextIdx = currentIdx < steps.length - 1 ? currentIdx + 1 : 0;
        } else {
          nextIdx = currentIdx > 0 ? currentIdx - 1 : steps.length - 1;
        }
        glossaryState.expandedStep = steps[nextIdx].name;
        trackRecentlyViewed(steps[nextIdx].name);
        e.preventDefault();
        renderGlossaryPage();
        setTimeout(function () {
          var target = document.querySelector('[data-glossary-step="' + steps[nextIdx].name + '"]');
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
      }
    });
  }

  function refocusSearch() {
    var newInput = document.querySelector('#' + PAGE_ID + ' [data-glossary-search]');
    if (newInput) {
      newInput.focus();
      newInput.setSelectionRange(newInput.value.length, newInput.value.length);
    }
  }

  function addFirstSearchResult() {
    var dict = getDict();
    if (!dict || !glossaryState.searchQuery) return;
    var results = dict.search(glossaryState.searchQuery);
    if (results.length > 0) {
      addStepToWorksheet(results[0].name);
    }
  }

  /* ── Add step to worksheet ── */
  function addStepToWorksheet(stepName, skipFeedback) {
    var dict = getDict();
    if (!dict) return;

    var match = dict.findBestMatch(stepName);
    var step = (match && match.match) || null;
    if (!step) return;

    try {
      var data = JSON.parse(localStorage.getItem(LS_KEY_DATA) || 'null');
      if (!data || !data.sections || !data.sections.length) {
        data = data || { meta: {}, sections: [], tags: [] };
        data.sections = data.sections || [];
        if (!data.sections.length) {
          data.sections.push({
            id: 'sec_' + Math.random().toString(36).substring(2, 9),
            name: 'Section 1',
            steps: []
          });
        }
      }
      var lastSection = data.sections[data.sections.length - 1];
      var newStep = {
        id: 'step_' + Math.random().toString(36).substring(2, 11),
        type: 'step',
        count: String(step.counts),
        counts: '',
        name: step.name,
        description: step.description,
        foot: step.feet === 'Both' ? 'Both' : (step.feet === 'L' ? 'L' : (step.feet === 'R' ? 'R' : 'Either')),
        weight: step.feet !== 'Neither',
        showNote: false,
        note: ''
      };
      lastSection.steps.push(newStep);
      localStorage.setItem(LS_KEY_DATA, JSON.stringify(data));

      try { window.dispatchEvent(new StorageEvent('storage', { key: LS_KEY_DATA })); } catch (e) { /* noop */ }
      try { window.dispatchEvent(new CustomEvent('stepper-data-changed')); } catch (e) { /* noop */ }
      if (typeof window.__stepperRefreshWorksheetFromStorage === 'function') window.__stepperRefreshWorksheetFromStorage();
    } catch (e) {
      /* Silent failure */
    }

    /* Visual feedback */
    glossaryState.recentlyAdded[stepName] = true;
    if (!skipFeedback) {
      renderGlossaryPage();
      setTimeout(function () {
        delete glossaryState.recentlyAdded[stepName];
        renderGlossaryPage();
      }, 2000);
    }
  }

  /* ════════════════════════════════════════════════════════════
     STYLE INJECTION
     ════════════════════════════════════════════════════════════ */
  function ensureGlossaryStyles() {
    if (document.getElementById('stepper-glossary-tab-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-glossary-tab-style';
    style.textContent = [
      '#' + PAGE_ID + ' input:focus { border-color:rgba(99,102,241,.5)!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important; }',
      '#' + PAGE_ID + ' [data-glossary-cat]:hover { transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08); }',
      '#' + PAGE_ID + ' [data-glossary-step]:hover { border-color:rgba(99,102,241,.3)!important;box-shadow:0 4px 16px rgba(0,0,0,.06); }',
      '#' + PAGE_ID + ' [data-glossary-add]:hover { transform:scale(1.04); }',
      '#' + PAGE_ID + ' [data-glossary-fav]:hover { transform:scale(1.15); }',
      '#' + PAGE_ID + ' [data-glossary-navigate]:hover { opacity:.8; }',
      '#' + PAGE_ID + ' [data-glossary-suggestion]:hover { transform:translateY(-1px);box-shadow:0 2px 8px rgba(0,0,0,.06); }',
      '#' + PAGE_ID + ' [data-glossary-view]:hover { opacity:.9; }',
      '#' + PAGE_ID + ' [data-glossary-sort]:hover { opacity:.9; }',
      '#' + PAGE_ID + ' [data-glossary-action]:hover { opacity:.8;transform:scale(1.04); }',
      '#' + PAGE_ID + ' [data-glossary-action="clear-search"]:hover { opacity:1; }',
      '#' + PAGE_ID + ' tr[data-glossary-step]:hover td { background:rgba(99,102,241,.06); }',
      '#' + PAGE_ID + ' kbd { white-space:nowrap; }',
      '@media print { #' + PAGE_ID + ' [data-glossary-action], #' + PAGE_ID + ' [data-glossary-fav], #' + PAGE_ID + ' [data-glossary-add] { display:none!important; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ════════════════════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════════════════════ */
  window.__stepperGlossaryTab = {
    PAGE_ID: PAGE_ID,
    TAB_ID: TAB_ID,
    render: function () { ensureGlossaryStyles(); renderGlossaryPage(); },
    getState: function () { return glossaryState; },
    icon: function () {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    }
  };

})();
