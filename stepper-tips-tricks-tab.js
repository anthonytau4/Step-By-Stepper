/* stepper-tips-tricks-tab.js – interactive stepsheet tutorial + docs template */
(function () {
  'use strict';
  if (window.__stepperTipsTabInstalled) return;
  window.__stepperTipsTabInstalled = true;

  var PAGE_ID = 'stepper-tips-page';
  var TAB_ID = 'stepper-tips-tab';
  var DATA_KEY = 'stepper_tips_tutorial_v2';

  var GOLDEN_TEMPLATE = [
    '# Song name - Artist name',
    '',
    '## Dance Header',
    '- Choreographer:',
    '- Date:',
    '- Level:',
    '- Type:',
    '- Counts / Walls:',
    '',
    '## Music & Timing',
    '- Music: Song name - Artist name',
    '- Intro: __ counts (start after vocals/instrumental cue)',
    '- Tempo / BPM:',
    '',
    '## Section 1 (Counts 1-8)',
    '1-2:',
    '3&4:',
    '5-6:',
    '7&8:',
    '',
    '## Section 2 (Counts 9-16)',
    '9-10:',
    '11&12:',
    '13-14:',
    '15&16:',
    '',
    '## Section 3 (Counts 17-24)',
    '17-18:',
    '19&20:',
    '21-22:',
    '23&24:',
    '',
    '## Section 4 (Counts 25-32)',
    '25-26:',
    '27&28:',
    '29-30:',
    '31&32:',
    '',
    '## Restarts / Tags',
    '- Restart:',
    '- Tag:',
    '',
    '## Finish / Teaching Notes',
    '- Ending:',
    '- Teaching cues:'
  ].join('\n');

  var GOLDEN_EXAMPLE = [
    'What\'s Golden - Jurassic 5',
    'Line Dance • 32 Count • 4 Wall • Improver',
    'Intro: 16 counts',
    'Section 1 (1-8): Walk, walk, shuffle, rock recover',
    'Section 2 (9-16): Side, touch, side, touch, quarter turn setup',
    'Restart: Wall 4 after count 16',
    'Ending: Face 12:00 and hold'
  ].join('\n');

  var LESSONS = [
    { title: '1) Header format', objective: 'Start every sheet as “Song name - Artist name” then metadata.', focus: 'This is the first thing dancers/teachers scan.', checklist: ['Song - Artist on first line', 'Choreographer listed', 'Level + type + counts/walls listed'] },
    { title: '2) Core metadata', objective: 'Use a consistent docs layout for level, type, counts, walls, intro, BPM.', focus: 'Good sheets are skim-friendly and standardized.', checklist: ['Counts/walls present', 'Intro counts present', 'BPM or tempo note present'] },
    { title: '3) Section architecture', objective: 'Break choreography into 8-count sections with explicit headers.', focus: 'Sections reduce teaching confusion and memory load.', checklist: ['Section 1..n headings', 'Counts shown in each section', 'No missing count range'] },
    { title: '4) Count writing style', objective: 'Write actions exactly on counts, including & counts.', focus: 'Precise count mapping is the heart of a usable sheet.', checklist: ['Uses 1-2 / 3&4 style', 'No vague phrasing', 'Turn direction specified'] },
    { title: '5) Turns & facing', objective: 'Always specify rotation and final facing.', focus: 'Ambiguity in turns breaks choreography quickly.', checklist: ['Turn fraction listed', 'Direction L/R listed', 'Facing cue included where needed'] },
    { title: '6) Restarts + tags', objective: 'Document restarts and tags with wall and count references.', focus: 'This is where most sheets fail learners if omitted.', checklist: ['Restart wall + count', 'Tag contents defined', 'Placement is explicit'] },
    { title: '7) Teaching cues', objective: 'Add human coaching notes that help dancers execute phrasing.', focus: 'Great sheets teach, not just list moves.', checklist: ['At least 2 cue notes', 'One musical cue', 'One body/weight cue'] },
    { title: '8) Polish pass', objective: 'Ensure style consistency and readable spacing before publishing.', focus: 'Presentation quality boosts trust and usability.', checklist: ['Consistent punctuation', 'Consistent section style', 'No giant text blocks'] },
    { title: '9) Self-review with score', objective: 'Use AI Coach score to validate structure completeness.', focus: 'A pass/fail gate prevents broken uploads.', checklist: ['Score >= 10/12 target', 'Critical fields complete', 'Draft reads naturally'] },
    { title: '10) Publish-ready final', objective: 'Finalize a clean docs-format sheet using the template and example.', focus: 'You should end with a complete, reusable draft.', checklist: ['Template fully filled', 'Music line matches format', 'Restarts/tags finalized'] }
  ];

  var state = { step: 0, worksheet: GOLDEN_TEMPLATE };

  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = String(text || '');
    return el.innerHTML;
  }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(DATA_KEY) || 'null');
      if (!saved || typeof saved !== 'object') return;
      state.step = Math.max(0, Math.min(LESSONS.length - 1, Number(saved.step || 0)));
      state.worksheet = String(saved.worksheet || GOLDEN_TEMPLATE);
    } catch (e) { /* ignore */ }
  }

  function save() {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function ensurePage() {
    var page = document.getElementById(PAGE_ID);
    if (page) return page;
    var host = document.querySelector('#stepper-google-admin-host .space-y-5');
    if (!host) return null;
    page = document.createElement('section');
    page.id = PAGE_ID;
    host.appendChild(page);
    return page;
  }

  function gradeWorksheet(text) {
    var raw = String(text || '');
    var t = raw.toLowerCase();
    var checks = [
      /^#?\s*.+\s-\s.+/m.test(raw),
      /choreographer:/i.test(raw),
      /counts\s*\/\s*walls|count.*wall|wall.*count/i.test(raw),
      /intro\s*:/i.test(raw),
      /section\s*1|counts\s*1-8/i.test(raw),
      /\d+\s*[-&]\s*\d+\s*:/.test(raw),
      /turn|1\/4|1\/2|3\/4|facing/i.test(raw),
      /restart/i.test(raw),
      /tag/i.test(raw),
      /teaching cues|cue/i.test(raw),
      /music\s*:\s*.+\s-\s.+/i.test(raw),
      /ending\s*:/i.test(raw)
    ];
    var score = checks.filter(Boolean).length;
    var verdict = score >= 11 ? 'Publish ready' : score >= 8 ? 'Strong draft' : score >= 5 ? 'Good start' : 'Needs structure';
    return { score: score, total: checks.length, verdict: verdict };
  }

  function renderChecklist(items) {
    var out = '';
    for (var i = 0; i < items.length; i++) {
      out += '<li style="margin:3px 0;">' + escapeHtml(items[i]) + '</li>';
    }
    return out;
  }

  function render() {
    var page = ensurePage();
    if (!page) return;
    var lesson = LESSONS[state.step];
    var grade = gradeWorksheet(state.worksheet);
    var pct = Math.round(((state.step + 1) / LESSONS.length) * 100);

    var html = '';
    html += '<div class="rounded-3xl border border-neutral-200 bg-white p-4 sm:p-6" style="display:grid;gap:14px;">';
    html += '<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-end;flex-wrap:wrap;">';
    html += '<div><h2 style="margin:0;font-size:24px;font-weight:900;">📘 Tips and Tricks Interactive</h2><div style="font-size:12px;color:#64748b;">Step-by-step docs-format trainer based on a “What\'s Golden” style sheet flow.</div></div>';
    html += '<div style="font-size:12px;font-weight:800;color:#3730a3;">Step ' + (state.step + 1) + '/10 · ' + pct + '%</div>';
    html += '</div>';
    html += '<div style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden;"><div style="height:8px;width:' + pct + '%;background:#4f46e5;"></div></div>';

    html += '<div style="display:grid;grid-template-columns:1.2fr .8fr;gap:12px;align-items:start;">';
    html += '<section style="border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#f8fafc;">';
    html += '<h3 style="margin:0 0 6px;font-size:17px;font-weight:900;">' + escapeHtml(lesson.title) + '</h3>';
    html += '<p style="margin:0 0 8px;font-size:13px;"><strong>Goal:</strong> ' + escapeHtml(lesson.objective) + '</p>';
    html += '<p style="margin:0 0 8px;font-size:13px;color:#334155;"><strong>Why it matters:</strong> ' + escapeHtml(lesson.focus) + '</p>';
    html += '<ul style="margin:0;padding-left:18px;font-size:12px;color:#334155;">' + renderChecklist(lesson.checklist) + '</ul>';
    html += '</section>';

    html += '<section style="border:1px solid #dbeafe;border-radius:14px;padding:12px;background:#eff6ff;">';
    html += '<h4 style="margin:0 0 6px;font-size:14px;font-weight:900;color:#1d4ed8;">Reference snippet (What\'s Golden style)</h4>';
    html += '<pre style="margin:0;white-space:pre-wrap;font-size:11px;line-height:1.5;color:#0f172a;">' + escapeHtml(GOLDEN_EXAMPLE) + '</pre>';
    html += '</section>';
    html += '</div>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start;">';
    html += '<section style="border:1px solid #cbd5e1;border-radius:12px;padding:10px;">';
    html += '<div style="font-size:12px;font-weight:900;margin-bottom:6px;">Your worksheet (docs format)</div>';
    html += '<textarea data-tips-worksheet rows="18" style="width:100%;padding:12px;border:1px solid #cbd5e1;border-radius:10px;font-size:12px;line-height:1.45;">' + escapeHtml(state.worksheet) + '</textarea>';
    html += '<div style="margin-top:8px;font-size:12px;">AI Coach Score: <strong>' + grade.score + '/' + grade.total + '</strong> — ' + escapeHtml(grade.verdict) + '.</div>';
    html += '</section>';

    html += '<section style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#fafafa;">';
    html += '<div style="font-size:12px;font-weight:900;margin-bottom:6px;">Golden docs template</div>';
    html += '<pre style="margin:0;white-space:pre-wrap;font-size:11px;line-height:1.45;color:#334155;max-height:365px;overflow:auto;">' + escapeHtml(GOLDEN_TEMPLATE) + '</pre>';
    html += '<button data-tips-load-template style="margin-top:8px;padding:8px 12px;border:none;border-radius:9px;background:#0ea5e9;color:#fff;font-weight:700;font-size:12px;">Load template into worksheet</button>';
    html += '</section>';
    html += '</div>';

    html += '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<button data-tips-prev style="padding:9px 14px;border:none;border-radius:10px;background:#e2e8f0;color:#334155;font-weight:800;">◀ Previous</button>';
    html += '<button data-tips-next style="padding:9px 14px;border:none;border-radius:10px;background:#4f46e5;color:#fff;font-weight:800;">Next ▶</button>';
    html += '<button data-tips-reset style="padding:9px 14px;border:none;border-radius:10px;background:#dc2626;color:#fff;font-weight:800;">Reset</button>';
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
    if (reset) reset.addEventListener('click', function () { state.step = 0; state.worksheet = GOLDEN_TEMPLATE; save(); render(); });
    var loadTemplate = page.querySelector('[data-tips-load-template]');
    if (loadTemplate) loadTemplate.addEventListener('click', function () { state.worksheet = GOLDEN_TEMPLATE; save(); render(); });
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
