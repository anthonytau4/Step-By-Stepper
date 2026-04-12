/* stepper-tips-tricks-tab.js – interactive 10-step stepsheet tutorial */
(function () {
  'use strict';
  if (window.__stepperTipsTabInstalled) return;
  window.__stepperTipsTabInstalled = true;

  var PAGE_ID = 'stepper-tips-page';
  var TAB_ID = 'stepper-tips-tab';
  var DATA_KEY = 'stepper_tips_tutorial_v1';

  var LESSONS = [
    { title: '1) Dance Header', tip: 'Use dance title + choreographer exactly as readers expect at the top.', example: 'Electric Slide — Ric Silver' },
    { title: '2) Type / Count / Wall / Level', tip: 'Follow Copperknob-style metadata blocks: type, count, wall, level.', example: 'Line Dance · 32 Count · 4 Wall · Improver' },
    { title: '3) Music Line', tip: 'Always use Song - Artist format for consistency.', example: 'Texas Hold \’Em - Beyoncé' },
    { title: '4) Intro', tip: 'Document intro counts and where the dance starts.', example: 'Intro: 16 counts, start on vocals' },
    { title: '5) Section Labels', tip: 'Group steps in chunks (Section 1/2/3/4) so dancers can reset mentally.', example: 'Section 1 (Counts 1-8)' },
    { title: '6) Clear Counts', tip: 'Write count numbers for every action block.', example: '1-2: Walk R, Walk L · 3&4: Shuffle R' },
    { title: '7) Direction / Rotation', tip: 'Mark turns and facing clearly to avoid ambiguity.', example: '5-6: 1/4 turn L, side rock R' },
    { title: '8) Tags / Restarts', tip: 'State exactly where tags/restarts happen (wall + count).', example: 'Restart on Wall 4 after count 16' },
    { title: '9) Ending / Styling', tip: 'Add optional ending notes and styling only after core steps are crystal clear.', example: 'Ending: Step forward and pose facing 12:00' },
    { title: '10) Publish-Ready Check', tip: 'Run quality check before sharing: readable, count-complete, and music aligned.', example: 'Checklist: metadata, counts, walls, restarts, ending' }
  ];

  var state = { step: 0, worksheet: '' };

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(DATA_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        state.step = Math.max(0, Math.min(LESSONS.length - 1, Number(saved.step || 0)));
        state.worksheet = String(saved.worksheet || '');
      }
    } catch (e) { /* ignore */ }
  }

  function save() {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function ensurePage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) {
      var host = document.querySelector('#stepper-google-admin-host .space-y-5');
      if (!host) return null;
      page = document.createElement('section');
      page.id = PAGE_ID;
      page.hidden = true;
      page.style.display = 'none';
      host.appendChild(page);
    }
    return page;
  }

  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = String(text || '');
    return el.innerHTML;
  }

  function gradeWorksheet(text) {
    var t = String(text || '').toLowerCase();
    var checks = [
      /count/.test(t),
      /wall/.test(t),
      /intro/.test(t),
      /restart|tag/.test(t),
      /section|1-8|9-16/.test(t),
      / - /.test(String(text || ''))
    ];
    var score = checks.filter(Boolean).length;
    var verdict = score >= 5 ? 'Excellent draft' : score >= 3 ? 'Good start' : 'Needs more structure';
    return { score: score, verdict: verdict };
  }

  function render() {
    var page = ensurePage();
    if (!page || page.hidden || page.style.display === 'none') return;
    var lesson = LESSONS[state.step];
    var g = gradeWorksheet(state.worksheet);
    var pct = Math.round(((state.step + 1) / LESSONS.length) * 100);

    var html = '';
    html += '<div class="rounded-3xl border border-neutral-200 bg-white p-6">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">';
    html += '<div><h2 style="margin:0;font-size:22px;font-weight:900;">📘 Tips and Tricks Interactive</h2><div style="font-size:12px;color:#64748b;">10-step tutorial inspired by current line-dance stepsheet publishing style.</div></div>';
    html += '<div style="font-size:12px;font-weight:700;color:#4338ca;">Progress ' + (state.step + 1) + '/10 · ' + pct + '%</div>';
    html += '</div>';
    html += '<div style="margin-top:14px;height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;"><div style="width:' + pct + '%;height:8px;background:#6366f1;"></div></div>';

    html += '<div style="margin-top:18px;padding:14px;border:1px solid #dbeafe;background:#eff6ff;border-radius:14px;">';
    html += '<div style="font-weight:900;font-size:16px;">' + escapeHtml(lesson.title) + '</div>';
    html += '<div style="margin-top:6px;font-size:13px;color:#334155;">' + escapeHtml(lesson.tip) + '</div>';
    html += '<div style="margin-top:8px;font-size:12px;color:#1d4ed8;"><strong>Example:</strong> ' + escapeHtml(lesson.example) + '</div>';
    html += '</div>';

    html += '<div style="margin-top:14px;display:grid;gap:8px;">';
    html += '<label style="font-size:12px;font-weight:800;color:#334155;">Practice worksheet</label>';
    html += '<textarea data-tips-worksheet rows="11" style="width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:12px;font-size:13px;">' + escapeHtml(state.worksheet) + '</textarea>';
    html += '<div style="font-size:12px;color:#334155;">AI Coach Score: <strong>' + g.score + '/6</strong> — ' + escapeHtml(g.verdict) + '.</div>';
    html += '</div>';

    html += '<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<button data-tips-prev style="padding:9px 14px;border:none;border-radius:10px;background:#e2e8f0;color:#334155;font-weight:700;">◀ Previous</button>';
    html += '<button data-tips-next style="padding:9px 14px;border:none;border-radius:10px;background:#4f46e5;color:#fff;font-weight:700;">Next ▶</button>';
    html += '<button data-tips-reset style="padding:9px 14px;border:none;border-radius:10px;background:#dc2626;color:#fff;font-weight:700;">Reset Tutorial</button>';
    html += '</div>';

    html += '</div>';
    page.innerHTML = html;

    var area = page.querySelector('[data-tips-worksheet]');
    if (area) area.addEventListener('input', function () { state.worksheet = area.value; save(); render(); });
    var prev = page.querySelector('[data-tips-prev]');
    if (prev) prev.addEventListener('click', function () { state.step = Math.max(0, state.step - 1); save(); render(); });
    var next = page.querySelector('[data-tips-next]');
    if (next) next.addEventListener('click', function () { state.step = Math.min(LESSONS.length - 1, state.step + 1); save(); render(); });
    var reset = page.querySelector('[data-tips-reset]');
    if (reset) reset.addEventListener('click', function () { state.step = 0; state.worksheet = ''; save(); render(); });
  }

  load();

  window.__stepperTipsTab = {
    PAGE_ID: PAGE_ID,
    TAB_ID: TAB_ID,
    render: function () { render(); },
    icon: function () {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
    }
  };
})();
