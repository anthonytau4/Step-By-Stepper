/**
 * stepper-glossary-tab.js
 * ─────────────────────────────────────────────────────────────
 * Dedicated Glossary / Step Dictionary tab for Step-By-Stepper.
 * Provides a full visual UI for:
 *   • Browsing 100+ standard line-dance steps by category
 *   • Searching steps with fuzzy matching
 *   • Viewing detailed descriptions, foot/count info
 *   • One-click adding steps to the worksheet
 *   • Step disambiguation for ambiguous names
 *
 * Uses window.__stepperStepDictionary for the step database.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperGlossaryTabInstalled) return;
  window.__stepperGlossaryTabInstalled = true;

  /* ── Constants ── */
  var PAGE_ID = 'stepper-glossary-page';
  var TAB_ID  = 'stepper-glossary-tab';

  /* ── Local state ── */
  var glossaryState = {
    searchQuery: '',
    selectedCategory: null,
    expandedStep: null,
    recentlyAdded: {}
  };

  /* ── Theme helper ── */
  function isDarkMode() {
    try {
      var data = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || 'null');
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
      chipActive: 'background:#4f46e5;border-color:#4f46e5;color:#ffffff;'
    };
  }
  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = String(text || '');
    return el.innerHTML;
  }

  /* ── Dictionary reference ── */
  function getDict() { return window.__stepperStepDictionary || null; }

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
    html += '<div class="px-6 py-5 border-b ' + theme.panel + '">';
    html += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">';
    html += '<span style="font-size:28px;">📖</span>';
    html += '<div style="flex:1;">';
    html += '<h2 style="font-size:20px;font-weight:900;margin:0;">Step Dictionary</h2>';
    html += '<p class="' + theme.subtle + '" style="font-size:12px;margin:2px 0 0;">' + (dict ? dict.STEPS.length : 0) + ' standard line-dance steps</p>';
    html += '</div></div></div>';

    /* ── Body ── */
    html += '<div class="p-5 sm:p-6">';

    if (!dict) {
      html += '<div style="text-align:center;padding:40px;">';
      html += '<p style="font-size:14px;opacity:.7;">Step dictionary is loading…</p>';
      html += '</div>';
    } else {
      /* Search bar */
      html += '<div style="margin-bottom:16px;">';
      html += '<input data-glossary-search type="text" placeholder="🔍 Search steps… (e.g. vine, shuffle, coaster)" value="' + escapeHtml(glossaryState.searchQuery) + '" ';
      html += 'style="width:100%;border-radius:14px;border:1px solid;padding:12px 18px;font-size:15px;outline:none;transition:border-color .2s,box-shadow .2s;' + theme.inputBg + '" />';
      html += '</div>';

      /* Category chips */
      html += renderCategoryChips(dict, theme);

      /* Step list */
      html += renderStepList(dict, theme);
    }

    html += '</div></div>';

    page.innerHTML = html;
    wireEvents(page);
  }

  function renderCategoryChips(dict, theme) {
    var cats = dict.CATEGORIES;
    var keys = Object.keys(cats);
    var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px;">';

    /* All chip */
    var allActive = !glossaryState.selectedCategory;
    html += '<button data-glossary-cat="" style="display:inline-flex;align-items:center;gap:4px;padding:7px 14px;border-radius:999px;border:1px solid;font-size:12px;font-weight:800;cursor:pointer;transition:all .2s;' + (allActive ? theme.chipActive : theme.chipBg) + '">';
    html += '📋 All</button>';

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var cat = cats[key];
      var active = glossaryState.selectedCategory === key;
      var count = dict.getAllSteps(key).length;
      html += '<button data-glossary-cat="' + key + '" style="display:inline-flex;align-items:center;gap:4px;padding:7px 14px;border-radius:999px;border:1px solid;font-size:12px;font-weight:800;cursor:pointer;transition:all .2s;' + (active ? theme.chipActive : theme.chipBg) + '">';
      html += cat.icon + ' ' + escapeHtml(cat.label) + ' <span style="opacity:.6;">(' + count + ')</span></button>';
    }
    html += '</div>';
    return html;
  }

  function renderStepList(dict, theme) {
    var steps;
    if (glossaryState.searchQuery) {
      steps = dict.search(glossaryState.searchQuery);
    } else if (glossaryState.selectedCategory) {
      steps = dict.getAllSteps(glossaryState.selectedCategory);
    } else {
      steps = dict.STEPS;
    }

    if (!steps.length) {
      var html = '<div style="text-align:center;padding:32px;">';
      html += '<div style="font-size:48px;margin-bottom:12px;">🤷</div>';
      html += '<p class="' + theme.subtle + '" style="font-size:14px;">No steps found for "' + escapeHtml(glossaryState.searchQuery) + '"</p>';
      html += '<p class="' + theme.subtle + '" style="font-size:12px;margin-top:4px;">Try "vine", "shuffle", "coaster", or "jazz box"</p>';
      html += '</div>';
      return html;
    }

    var html = '<div style="display:grid;gap:8px;">';
    for (var i = 0; i < steps.length; i++) {
      html += renderStepCard(steps[i], theme, dict);
    }
    html += '</div>';

    /* Stats footer */
    html += '<div style="text-align:center;margin-top:16px;padding:8px;">';
    html += '<span class="' + theme.subtle + '" style="font-size:12px;">Showing ' + steps.length + ' of ' + dict.STEPS.length + ' steps</span>';
    html += '</div>';

    return html;
  }

  function renderStepCard(step, theme, dict) {
    var isExpanded = glossaryState.expandedStep === step.name;
    var wasAdded = glossaryState.recentlyAdded[step.name];
    var cat = (dict.CATEGORIES[step.category] || {});

    var html = '';
    html += '<div data-glossary-step="' + escapeHtml(step.name) + '" style="border-radius:16px;border:1px solid;padding:14px 16px;cursor:pointer;transition:all .2s ease;' + theme.cardBg;
    if (isExpanded) html += 'box-shadow:0 8px 24px rgba(79,70,229,.12);border-color:#4f46e5!important;';
    html += '">';

    /* Top row */
    html += '<div style="display:flex;align-items:center;gap:10px;">';

    /* Category icon */
    html += '<span style="font-size:20px;flex-shrink:0;">' + (cat.icon || '💃') + '</span>';

    /* Name & count */
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-weight:800;font-size:14px;">' + escapeHtml(step.name) + '</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:12px;display:flex;gap:10px;flex-wrap:wrap;margin-top:2px;">';
    html += '<span>' + step.counts + ' count' + (step.counts !== 1 ? 's' : '') + '</span>';
    html += '<span>Foot: ' + escapeHtml(step.feet) + '</span>';
    if (cat.label) html += '<span>' + escapeHtml(cat.label) + '</span>';
    html += '</div></div>';

    /* Add button */
    html += '<button data-glossary-add="' + escapeHtml(step.name) + '" class="stepper-google-cta" style="padding:8px 14px;border-radius:10px;font-size:12px;font-weight:800;white-space:nowrap;flex-shrink:0;';
    if (wasAdded) {
      html += 'background:#22c55e;color:#fff;border-color:#22c55e;">✓ Added';
    } else {
      html += 'background:#4f46e5;color:#fff;border-color:#4f46e5;">+ Add';
    }
    html += '</button>';

    html += '</div>';

    /* Expanded details */
    if (isExpanded) {
      html += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid ' + (theme.dark ? '#374151' : '#e5e7eb') + ';">';
      html += '<p style="font-size:13px;line-height:1.6;margin:0 0 8px;">' + escapeHtml(step.description) + '</p>';
      if (step.aliases && step.aliases.length) {
        html += '<p class="' + theme.subtle + '" style="font-size:11px;margin:0;"><strong>Also known as:</strong> ' + step.aliases.map(function (a) { return escapeHtml(a); }).join(', ') + '</p>';
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  /* ════════════════════════════════════════════════════════════
     EVENT WIRING
     ════════════════════════════════════════════════════════════ */
  function wireEvents(page) {
    if (!page) return;

    /* Search */
    var searchInput = page.querySelector('[data-glossary-search]');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        glossaryState.searchQuery = searchInput.value;
        glossaryState.expandedStep = null;
        renderGlossaryPage();
        /* Re-focus and restore cursor position */
        var newInput = document.querySelector('#' + PAGE_ID + ' [data-glossary-search]');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        }
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

    /* Step expand/collapse */
    page.querySelectorAll('[data-glossary-step]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('[data-glossary-add]')) return;
        var name = card.getAttribute('data-glossary-step');
        glossaryState.expandedStep = glossaryState.expandedStep === name ? null : name;
        renderGlossaryPage();
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
  }

  /* ── Add step to worksheet ── */
  function addStepToWorksheet(stepName) {
    var dict = getDict();
    if (!dict) return;

    var match = dict.findBestMatch(stepName);
    var step = (match && match.match) || null;
    if (!step) return;

    /* Use the existing helper infrastructure to add the step */
    try {
      var data = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || 'null');
      if (!data || !data.sections || !data.sections.length) {
        /* Create a default section if none exist */
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
      localStorage.setItem('linedance_builder_data_v13', JSON.stringify(data));

      /* Trigger refresh */
      try { window.dispatchEvent(new StorageEvent('storage', { key: 'linedance_builder_data_v13' })); } catch (e) { /* noop */ }
      try { window.dispatchEvent(new CustomEvent('stepper-data-changed')); } catch (e) { /* noop */ }
      if (typeof window.__stepperRefreshWorksheetFromStorage === 'function') window.__stepperRefreshWorksheetFromStorage();
    } catch (e) {
      /* Silent failure */
    }

    /* Visual feedback */
    glossaryState.recentlyAdded[stepName] = true;
    renderGlossaryPage();
    setTimeout(function () {
      delete glossaryState.recentlyAdded[stepName];
      renderGlossaryPage();
    }, 2000);
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
      '#' + PAGE_ID + ' [data-glossary-add]:hover { transform:scale(1.04); }'
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
