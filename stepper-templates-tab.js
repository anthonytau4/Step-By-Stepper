/* ═══════════════════════════════════════════════════════════════════════════
   stepper-templates-tab.js  –  Dance Templates tab for Step-By-Stepper
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__stepperTemplatesTabInstalled) return;
  window.__stepperTemplatesTabInstalled = true;

  /* ── Constants ───────────────────────────────────────────────────────── */
  var PAGE_ID = 'stepper-templates-page';
  var TAB_ID  = 'stepper-templates-tab';
  var BUILDER_DATA_KEY = 'linedance_builder_data_v13';

  /* ── State ───────────────────────────────────────────────────────────── */
  var templatesState = {
    filterLevel: 'all',
    filterStyle: 'all',
    searchQuery: '',
    previewIndex: -1
  };

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function isDarkMode() {
    try {
      var data = JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || 'null');
      return !!(data && data.isDarkMode);
    } catch (e) { return false; }
  }

  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = String(text || '');
    return el.innerHTML;
  }

  function themeClasses() {
    var dark = isDarkMode();
    return {
      dark: dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
                  : 'bg-white border-neutral-200 text-neutral-900',
      soft:  dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300'
                  : 'bg-white border-neutral-200 text-neutral-700',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500',
      accent: dark ? 'bg-indigo-500/15 border-indigo-400/30 text-indigo-200'
                   : 'bg-indigo-50 border-indigo-200 text-indigo-700',
      danger: dark ? 'bg-red-500/15 border-red-400/30 text-red-200'
                   : 'bg-red-50 border-red-200 text-red-700',
      success: dark ? 'bg-green-500/15 border-green-400/30 text-green-200'
                    : 'bg-green-50 border-green-200 text-green-700',
      warn: dark ? 'bg-amber-500/15 border-amber-400/30 text-amber-200'
                 : 'bg-amber-50 border-amber-200 text-amber-700',
      cardBg:  dark ? 'background:#1a1a2e;border-color:#2d2d44;'
                    : 'background:#ffffff;border-color:#e5e7eb;',
      inputBg: dark ? 'background:#111827;border-color:#374151;color:#f3f4f6;'
                    : 'background:#ffffff;border-color:#d1d5db;color:#111827;',
      btnPrimary: dark ? 'background:#6366f1;color:#fff;'
                       : 'background:#4f46e5;color:#fff;',
      btnSecondary: dark ? 'background:#374151;color:#e5e7eb;'
                         : 'background:#e5e7eb;color:#374151;'
    };
  }

  function _toast(msg) {
    if (window.__stepperStepSelect && window.__stepperStepSelect.showToast) {
      window.__stepperStepSelect.showToast(msg);
      return;
    }
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 22px;border-radius:12px;font-size:14px;font-weight:600;pointer-events:none;animation:stepper-toast-in .25s ease;'
      + (isDarkMode() ? 'background:#333;color:#e5e5e5;' : 'background:#1f2937;color:#fff;');
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2200);
    setTimeout(function () { t.remove(); }, 2600);
  }

  /* ── Style injection ─────────────────────────────────────────────────── */
  function ensureTemplatesStyles() {
    if (document.getElementById('stepper-templates-tab-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-templates-tab-style';
    style.textContent = [
      '#' + PAGE_ID + ' input:focus,#' + PAGE_ID + ' select:focus { border-color:rgba(99,102,241,.5)!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important;outline:none; }',
      '#' + PAGE_ID + ' .tpl-card { transition:transform .15s ease,box-shadow .15s ease;cursor:pointer; }',
      '#' + PAGE_ID + ' .tpl-card:hover { transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.1); }',
      '#' + PAGE_ID + ' button:hover { opacity:.88; }',
      '@keyframes stepper-toast-in { from{opacity:0;transform:translateX(-50%) translateY(12px);} to{opacity:1;transform:translateX(-50%) translateY(0);} }',
      '@keyframes stepper-tpl-fade-in { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }',
      '#' + PAGE_ID + ' .tpl-card { animation:stepper-tpl-fade-in .25s ease; }',
      '#' + PAGE_ID + ' .tpl-badge { display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.03em; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── Page element ────────────────────────────────────────────────────── */
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

  /* ── Template Data ───────────────────────────────────────────────────── */
  var TEMPLATES = [
    {
      title: 'Easy Grapevine',
      level: 'Beginner',
      style: '8-count',
      walls: 4,
      counts: 32,
      desc: 'Simple grapevines and touches — perfect for absolute beginners.',
      sections: [
        { name: 'Grapevine Right, Touch', counts: '1-8', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Cross Left Behind Right', count: '2' },
          { name: 'Step Right to Right Side', count: '3' },
          { name: 'Touch Left Beside Right', count: '4' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Cross Right Behind Left', count: '6' },
          { name: 'Step Left to Left Side', count: '7' },
          { name: 'Touch Right Beside Left', count: '8' }
        ]},
        { name: 'Forward Walks, Touch-Turn', counts: '1-8', steps: [
          { name: 'Walk Forward Right', count: '1' },
          { name: 'Walk Forward Left', count: '2' },
          { name: 'Walk Forward Right', count: '3' },
          { name: 'Touch Left Beside Right', count: '4' },
          { name: 'Walk Back Left', count: '5' },
          { name: 'Walk Back Right', count: '6' },
          { name: 'Walk Back Left', count: '7' },
          { name: 'Touch Right Beside Left', count: '8' }
        ]},
        { name: 'Side Touches', counts: '1-8', steps: [
          { name: 'Touch Right to Right Side', count: '1' },
          { name: 'Step Right Beside Left', count: '2' },
          { name: 'Touch Left to Left Side', count: '3' },
          { name: 'Step Left Beside Right', count: '4' },
          { name: 'Touch Right Forward', count: '5' },
          { name: 'Step Right Beside Left', count: '6' },
          { name: 'Touch Left Forward', count: '7' },
          { name: 'Step Left Beside Right', count: '8' }
        ]},
        { name: 'Quarter Turn & Stomps', counts: '1-8', steps: [
          { name: 'Step Forward Right', count: '1' },
          { name: 'Pivot Quarter Turn Left', count: '2' },
          { name: 'Step Forward Right', count: '3' },
          { name: 'Stomp Left Beside Right', count: '4' },
          { name: 'Stomp Right in Place', count: '5' },
          { name: 'Stomp Left in Place', count: '6' },
          { name: 'Stomp Right in Place', count: '7' },
          { name: 'Hold', count: '8' }
        ]}
      ]
    },
    {
      title: 'Back & Forth Shuffle',
      level: 'Beginner',
      style: '8-count',
      walls: 2,
      counts: 32,
      desc: 'Basic forward and back movement with shuffles and a half turn.',
      sections: [
        { name: 'Forward Shuffle, Rock Step', counts: '1-8', steps: [
          { name: 'Shuffle Forward Right-Left-Right', count: '1&2' },
          { name: 'Rock Forward Left', count: '3' },
          { name: 'Recover on Right', count: '4' },
          { name: 'Shuffle Back Left-Right-Left', count: '5&6' },
          { name: 'Rock Back Right', count: '7' },
          { name: 'Recover on Left', count: '8' }
        ]},
        { name: 'Vine Right, Vine Left', counts: '1-8', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Cross Left Behind Right', count: '2' },
          { name: 'Step Right to Right Side', count: '3' },
          { name: 'Touch Left Beside Right', count: '4' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Cross Right Behind Left', count: '6' },
          { name: 'Step Left to Left Side', count: '7' },
          { name: 'Touch Right Beside Left', count: '8' }
        ]},
        { name: 'Jazz Box', counts: '1-8', steps: [
          { name: 'Cross Right Over Left', count: '1' },
          { name: 'Step Back Left', count: '2' },
          { name: 'Step Right to Right Side', count: '3' },
          { name: 'Step Left Beside Right', count: '4' },
          { name: 'Cross Right Over Left', count: '5' },
          { name: 'Step Back Left', count: '6' },
          { name: 'Step Right to Right Side', count: '7' },
          { name: 'Step Left Beside Right', count: '8' }
        ]},
        { name: 'Walks & Half Turn', counts: '1-8', steps: [
          { name: 'Walk Forward Right', count: '1' },
          { name: 'Walk Forward Left', count: '2' },
          { name: 'Step Forward Right', count: '3' },
          { name: 'Pivot Half Turn Left', count: '4' },
          { name: 'Walk Forward Right', count: '5' },
          { name: 'Walk Forward Left', count: '6' },
          { name: 'Stomp Right Beside Left', count: '7' },
          { name: 'Hold', count: '8' }
        ]}
      ]
    },
    {
      title: 'Mini Stepper',
      level: 'Beginner',
      style: '8-count',
      walls: 4,
      counts: 16,
      desc: 'Minimal 16-count starter — great warm-up or teaching intro.',
      sections: [
        { name: 'Vine Right, Touch', counts: '1-8', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Cross Left Behind Right', count: '2' },
          { name: 'Step Right to Right Side', count: '3' },
          { name: 'Touch Left Beside Right', count: '4' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Cross Right Behind Left', count: '6' },
          { name: 'Step Left to Left Side', count: '7' },
          { name: 'Touch Right Beside Left', count: '8' }
        ]},
        { name: 'Forward & Back with Turn', counts: '1-8', steps: [
          { name: 'Walk Forward Right', count: '1' },
          { name: 'Walk Forward Left', count: '2' },
          { name: 'Step Forward Right', count: '3' },
          { name: 'Pivot Quarter Turn Left', count: '4' },
          { name: 'Walk Back Right', count: '5' },
          { name: 'Walk Back Left', count: '6' },
          { name: 'Stomp Right Beside Left', count: '7' },
          { name: 'Hold', count: '8' }
        ]}
      ]
    },
    {
      title: 'Cross Shuffle Flow',
      level: 'Improver',
      style: '8-count',
      walls: 4,
      counts: 32,
      desc: 'Introduces cross shuffles and side rocks for improver dancers.',
      sections: [
        { name: 'Cross Shuffle, Side Rock', counts: '1-8', steps: [
          { name: 'Cross Shuffle Right Over Left', count: '1&2' },
          { name: 'Rock Left to Left Side', count: '3' },
          { name: 'Recover on Right', count: '4' },
          { name: 'Cross Shuffle Left Over Right', count: '5&6' },
          { name: 'Rock Right to Right Side', count: '7' },
          { name: 'Recover on Left', count: '8' }
        ]},
        { name: 'Coaster Step, Walks', counts: '1-8', steps: [
          { name: 'Step Back Right', count: '1' },
          { name: 'Step Left Beside Right', count: '&' },
          { name: 'Step Forward Right', count: '2' },
          { name: 'Walk Forward Left', count: '3' },
          { name: 'Walk Forward Right', count: '4' },
          { name: 'Step Back Left', count: '5' },
          { name: 'Step Right Beside Left', count: '&' },
          { name: 'Step Forward Left', count: '6' },
          { name: 'Walk Forward Right', count: '7' },
          { name: 'Walk Forward Left', count: '8' }
        ]},
        { name: 'Vine with Turn, Touch', counts: '1-8', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Cross Left Behind Right', count: '2' },
          { name: 'Turn Quarter Right Stepping Right Forward', count: '3' },
          { name: 'Touch Left Beside Right', count: '4' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Cross Right Behind Left', count: '6' },
          { name: 'Turn Quarter Left Stepping Left Forward', count: '7' },
          { name: 'Touch Right Beside Left', count: '8' }
        ]},
        { name: 'Monterey Turn', counts: '1-8', steps: [
          { name: 'Point Right to Right Side', count: '1' },
          { name: 'Half Turn Right Stepping Right Beside Left', count: '2' },
          { name: 'Point Left to Left Side', count: '3' },
          { name: 'Step Left Beside Right', count: '4' },
          { name: 'Point Right to Right Side', count: '5' },
          { name: 'Step Right Beside Left', count: '6' },
          { name: 'Point Left to Left Side', count: '7' },
          { name: 'Step Left Beside Right', count: '8' }
        ]}
      ]
    },
    {
      title: 'Coaster & Pivot Combo',
      level: 'Improver',
      style: '8-count',
      walls: 2,
      counts: 48,
      desc: 'Coaster steps, pivot turns, and rocking chair combos across 48 counts.',
      sections: [
        { name: 'Forward Shuffle, Pivot Half', counts: '1-8', steps: [
          { name: 'Shuffle Forward Right-Left-Right', count: '1&2' },
          { name: 'Step Forward Left', count: '3' },
          { name: 'Pivot Half Turn Right', count: '4' },
          { name: 'Shuffle Forward Left-Right-Left', count: '5&6' },
          { name: 'Rock Forward Right', count: '7' },
          { name: 'Recover on Left', count: '8' }
        ]},
        { name: 'Coaster Step, Forward Locks', counts: '1-8', steps: [
          { name: 'Step Back Right', count: '1' },
          { name: 'Step Left Beside Right', count: '&' },
          { name: 'Step Forward Right', count: '2' },
          { name: 'Lock Step Forward Left-Right-Left', count: '3&4' },
          { name: 'Step Forward Right', count: '5' },
          { name: 'Lock Left Behind Right', count: '&' },
          { name: 'Step Forward Right', count: '6' },
          { name: 'Rock Forward Left', count: '7' },
          { name: 'Recover on Right', count: '8' }
        ]},
        { name: 'Rocking Chair', counts: '1-8', steps: [
          { name: 'Rock Forward Left', count: '1' },
          { name: 'Recover on Right', count: '2' },
          { name: 'Rock Back Left', count: '3' },
          { name: 'Recover on Right', count: '4' },
          { name: 'Cross Left Over Right', count: '5' },
          { name: 'Step Right to Right Side', count: '6' },
          { name: 'Step Left Behind Right', count: '7' },
          { name: 'Step Right to Right Side', count: '8' }
        ]},
        { name: 'Side Shuffles, Cross Touch', counts: '1-8', steps: [
          { name: 'Shuffle Right to Right Side', count: '1&2' },
          { name: 'Cross Rock Left Over Right', count: '3' },
          { name: 'Recover on Right', count: '4' },
          { name: 'Shuffle Left to Left Side', count: '5&6' },
          { name: 'Cross Rock Right Over Left', count: '7' },
          { name: 'Recover on Left', count: '8' }
        ]},
        { name: 'Turning Vine, Scuff', counts: '1-8', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Cross Left Behind Right', count: '2' },
          { name: 'Quarter Turn Right Step Right Forward', count: '3' },
          { name: 'Scuff Left Forward', count: '4' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Cross Right Behind Left', count: '6' },
          { name: 'Quarter Turn Left Step Left Forward', count: '7' },
          { name: 'Scuff Right Forward', count: '8' }
        ]},
        { name: 'Jazz Box with Quarter Turn', counts: '1-8', steps: [
          { name: 'Cross Right Over Left', count: '1' },
          { name: 'Step Back Left', count: '2' },
          { name: 'Quarter Turn Right Step Right to Right Side', count: '3' },
          { name: 'Step Left Beside Right', count: '4' },
          { name: 'Walk Forward Right', count: '5' },
          { name: 'Walk Forward Left', count: '6' },
          { name: 'Stomp Right Forward', count: '7' },
          { name: 'Hold', count: '8' }
        ]}
      ]
    },
    {
      title: 'Full Improver Routine',
      level: 'Improver',
      style: '8-count',
      walls: 4,
      counts: 64,
      desc: 'Complete 64-count improver dance with varied footwork patterns.',
      sections: [
        { name: 'Vine Right, Cross Shuffle', counts: '1-8', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Cross Left Behind Right', count: '2' },
          { name: 'Step Right to Right Side', count: '3' },
          { name: 'Touch Left Beside Right', count: '4' },
          { name: 'Cross Shuffle Left Over Right', count: '5&6' },
          { name: 'Rock Right to Right Side', count: '7' },
          { name: 'Recover on Left', count: '8' }
        ]},
        { name: 'Weave Left, Touch', counts: '1-8', steps: [
          { name: 'Cross Right Over Left', count: '1' },
          { name: 'Step Left to Left Side', count: '2' },
          { name: 'Cross Right Behind Left', count: '3' },
          { name: 'Step Left to Left Side', count: '4' },
          { name: 'Cross Right Over Left', count: '5' },
          { name: 'Step Left to Left Side', count: '6' },
          { name: 'Step Right Behind Left', count: '7' },
          { name: 'Touch Left Beside Right', count: '8' }
        ]},
        { name: 'Shuffles & Pivot Turn', counts: '1-8', steps: [
          { name: 'Shuffle Forward Left-Right-Left', count: '1&2' },
          { name: 'Step Forward Right', count: '3' },
          { name: 'Pivot Half Turn Left', count: '4' },
          { name: 'Shuffle Forward Right-Left-Right', count: '5&6' },
          { name: 'Rock Forward Left', count: '7' },
          { name: 'Recover on Right', count: '8' }
        ]},
        { name: 'Coaster Step, Kick Ball Change', counts: '1-8', steps: [
          { name: 'Step Back Left', count: '1' },
          { name: 'Step Right Beside Left', count: '&' },
          { name: 'Step Forward Left', count: '2' },
          { name: 'Kick Right Forward', count: '3' },
          { name: 'Step Right Beside Left', count: '&' },
          { name: 'Step Left in Place', count: '4' },
          { name: 'Walk Forward Right', count: '5' },
          { name: 'Walk Forward Left', count: '6' },
          { name: 'Step Forward Right', count: '7' },
          { name: 'Pivot Quarter Turn Left', count: '8' }
        ]},
        { name: 'Side Touches, Hip Bumps', counts: '1-8', steps: [
          { name: 'Touch Right to Right Side', count: '1' },
          { name: 'Step Right Beside Left', count: '2' },
          { name: 'Touch Left to Left Side', count: '3' },
          { name: 'Step Left Beside Right', count: '4' },
          { name: 'Step Right to Right Side with Hip Bump', count: '5' },
          { name: 'Hip Bump Right', count: '6' },
          { name: 'Step Left to Left Side with Hip Bump', count: '7' },
          { name: 'Hip Bump Left', count: '8' }
        ]},
        { name: 'Slide, Stomp, Touch', counts: '1-8', steps: [
          { name: 'Slide Right to Right Side', count: '1-2' },
          { name: 'Stomp Left Beside Right', count: '3' },
          { name: 'Hold', count: '4' },
          { name: 'Slide Left to Left Side', count: '5-6' },
          { name: 'Stomp Right Beside Left', count: '7' },
          { name: 'Hold', count: '8' }
        ]},
        { name: 'Heel Grind, Coaster', counts: '1-8', steps: [
          { name: 'Touch Right Heel Forward', count: '1' },
          { name: 'Grind Right Heel Turning Toe Right', count: '2' },
          { name: 'Step Right Beside Left', count: '3' },
          { name: 'Touch Left Heel Forward', count: '4' },
          { name: 'Step Left in Place', count: '5' },
          { name: 'Step Back Right', count: '6' },
          { name: 'Step Left Beside Right', count: '&' },
          { name: 'Step Forward Right', count: '7' },
          { name: 'Stomp Left Beside Right', count: '8' }
        ]},
        { name: 'Jazz Box Quarter Turn', counts: '1-8', steps: [
          { name: 'Cross Right Over Left', count: '1' },
          { name: 'Step Back Left', count: '2' },
          { name: 'Quarter Turn Right Step Right to Side', count: '3' },
          { name: 'Step Left Beside Right', count: '4' },
          { name: 'Walk Forward Right', count: '5' },
          { name: 'Walk Forward Left', count: '6' },
          { name: 'Stomp Right Forward', count: '7' },
          { name: 'Stomp Left Beside Right', count: '8' }
        ]}
      ]
    },
    {
      title: 'Sailor & Weave Mix',
      level: 'Intermediate',
      style: '8-count',
      walls: 4,
      counts: 32,
      desc: 'Sailor steps, weaves, and syncopated turns for intermediate dancers.',
      sections: [
        { name: 'Sailor Step, Sailor Quarter Turn', counts: '1-8', steps: [
          { name: 'Cross Right Behind Left', count: '1' },
          { name: 'Step Left to Left Side', count: '&' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Cross Left Behind Right', count: '3' },
          { name: 'Quarter Turn Right Step Right Forward', count: '&' },
          { name: 'Step Left Forward', count: '4' },
          { name: 'Rock Forward Right', count: '5' },
          { name: 'Recover on Left', count: '6' },
          { name: 'Shuffle Back Right-Left-Right', count: '7&8' }
        ]},
        { name: 'Weave Right, Side Rock', counts: '1-8', steps: [
          { name: 'Cross Left Over Right', count: '1' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Cross Left Behind Right', count: '3' },
          { name: 'Step Right to Right Side', count: '4' },
          { name: 'Cross Left Over Right', count: '5' },
          { name: 'Rock Right to Right Side', count: '6' },
          { name: 'Recover on Left', count: '7' },
          { name: 'Hold', count: '8' }
        ]},
        { name: 'Toe Struts, Pivot Half', counts: '1-8', steps: [
          { name: 'Touch Right Toe Forward', count: '1' },
          { name: 'Drop Right Heel', count: '2' },
          { name: 'Touch Left Toe Forward', count: '3' },
          { name: 'Drop Left Heel', count: '4' },
          { name: 'Step Forward Right', count: '5' },
          { name: 'Pivot Half Turn Left', count: '6' },
          { name: 'Step Forward Right', count: '7' },
          { name: 'Stomp Left Beside Right', count: '8' }
        ]},
        { name: 'Rolling Vine, Stomp-Up', counts: '1-8', steps: [
          { name: 'Quarter Turn Right Step Right Forward', count: '1' },
          { name: 'Half Turn Right Step Left Back', count: '2' },
          { name: 'Quarter Turn Right Step Right to Right Side', count: '3' },
          { name: 'Stomp Left Beside Right', count: '4' },
          { name: 'Stomp Left Up', count: '&' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Cross Right Behind Left', count: '6' },
          { name: 'Step Left to Left Side', count: '7' },
          { name: 'Touch Right Beside Left', count: '8' }
        ]}
      ]
    },
    {
      title: 'Syncopated Grooves',
      level: 'Intermediate',
      style: '8-count',
      walls: 2,
      counts: 48,
      desc: '48-count intermediate dance featuring syncopated rhythms and body rolls.',
      sections: [
        { name: 'Syncopated Vine, Hitch', counts: '1-8', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Cross Left Behind Right', count: '&' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Hitch Left Knee', count: '&' },
          { name: 'Step Left to Left Side', count: '3' },
          { name: 'Cross Right Behind Left', count: '&' },
          { name: 'Step Left to Left Side', count: '4' },
          { name: 'Hitch Right Knee', count: '&' },
          { name: 'Cross Right Over Left', count: '5' },
          { name: 'Step Left Back', count: '6' },
          { name: 'Step Right to Right Side', count: '7' },
          { name: 'Touch Left Beside Right', count: '8' }
        ]},
        { name: 'Paddle Turns, Shuffle', counts: '1-8', steps: [
          { name: 'Step Forward Left', count: '1' },
          { name: 'Paddle Quarter Turn Right', count: '2' },
          { name: 'Step Forward Left', count: '3' },
          { name: 'Paddle Quarter Turn Right', count: '4' },
          { name: 'Shuffle Forward Left-Right-Left', count: '5&6' },
          { name: 'Rock Forward Right', count: '7' },
          { name: 'Recover on Left', count: '8' }
        ]},
        { name: 'Coaster, Lock Steps', counts: '1-8', steps: [
          { name: 'Step Back Right', count: '1' },
          { name: 'Step Left Beside Right', count: '&' },
          { name: 'Step Forward Right', count: '2' },
          { name: 'Step Forward Left', count: '3' },
          { name: 'Lock Right Behind Left', count: '&' },
          { name: 'Step Forward Left', count: '4' },
          { name: 'Step Forward Right', count: '5' },
          { name: 'Lock Left Behind Right', count: '&' },
          { name: 'Step Forward Right', count: '6' },
          { name: 'Rock Forward Left', count: '7' },
          { name: 'Recover on Right', count: '8' }
        ]},
        { name: 'Hip Walk Back, Bump', counts: '1-8', steps: [
          { name: 'Hip Walk Back Left', count: '1' },
          { name: 'Hip Walk Back Right', count: '2' },
          { name: 'Hip Walk Back Left', count: '3' },
          { name: 'Touch Right Beside Left', count: '4' },
          { name: 'Hip Bump Right', count: '5' },
          { name: 'Hip Bump Left', count: '6' },
          { name: 'Hip Bump Right', count: '7' },
          { name: 'Hold', count: '8' }
        ]},
        { name: 'Cross Shuffle, Full Turn', counts: '1-8', steps: [
          { name: 'Cross Left Over Right', count: '1' },
          { name: 'Step Right to Right Side', count: '&' },
          { name: 'Cross Left Over Right', count: '2' },
          { name: 'Step Right to Right Side', count: '3' },
          { name: 'Half Turn Right Step Left Forward', count: '4' },
          { name: 'Half Turn Right Step Right Back', count: '5' },
          { name: 'Step Left to Left Side', count: '6' },
          { name: 'Stomp Right Beside Left', count: '7' },
          { name: 'Hold', count: '8' }
        ]},
        { name: 'Sway, Sailor Step', counts: '1-8', steps: [
          { name: 'Sway Right', count: '1' },
          { name: 'Sway Left', count: '2' },
          { name: 'Sway Right', count: '3' },
          { name: 'Hold', count: '4' },
          { name: 'Cross Right Behind Left', count: '5' },
          { name: 'Step Left to Left Side', count: '&' },
          { name: 'Step Right to Right Side', count: '6' },
          { name: 'Cross Left Behind Right', count: '7' },
          { name: 'Step Right to Right Side', count: '&' },
          { name: 'Step Left to Left Side', count: '8' }
        ]}
      ]
    },
    {
      title: 'Complex 64 Challenge',
      level: 'Intermediate',
      style: '8-count',
      walls: 4,
      counts: 64,
      desc: 'Challenging 64-count dance with rolling vines, full turns, and kick-ball-changes.',
      sections: [
        { name: 'Rolling Vine Right, Stomp', counts: '1-8', steps: [
          { name: 'Quarter Turn Right Step Right Forward', count: '1' },
          { name: 'Half Turn Right Step Left Back', count: '2' },
          { name: 'Quarter Turn Right Step Right to Side', count: '3' },
          { name: 'Stomp Left Beside Right', count: '4' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Cross Right Behind Left', count: '6' },
          { name: 'Quarter Turn Left Step Left Forward', count: '7' },
          { name: 'Scuff Right Forward', count: '8' }
        ]},
        { name: 'Rock, Full Spin, Coaster', counts: '1-8', steps: [
          { name: 'Rock Forward Right', count: '1' },
          { name: 'Recover on Left', count: '2' },
          { name: 'Full Turn Right Stepping Right-Left', count: '3-4' },
          { name: 'Step Back Right', count: '5' },
          { name: 'Step Left Beside Right', count: '&' },
          { name: 'Step Forward Right', count: '6' },
          { name: 'Step Forward Left', count: '7' },
          { name: 'Stomp Right Beside Left', count: '8' }
        ]},
        { name: 'Weave, Sailor Half Turn', counts: '1-8', steps: [
          { name: 'Cross Left Over Right', count: '1' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Cross Left Behind Right', count: '3' },
          { name: 'Step Right to Right Side', count: '4' },
          { name: 'Cross Left Behind Right', count: '5' },
          { name: 'Half Turn Left Step Right to Right Side', count: '&' },
          { name: 'Step Left Forward', count: '6' },
          { name: 'Rock Forward Right', count: '7' },
          { name: 'Recover on Left', count: '8' }
        ]},
        { name: 'Kick Ball Change, Cross Shuffle', counts: '1-8', steps: [
          { name: 'Kick Right Forward', count: '1' },
          { name: 'Step Right Beside Left', count: '&' },
          { name: 'Step Left in Place', count: '2' },
          { name: 'Kick Right Forward', count: '3' },
          { name: 'Step Right Beside Left', count: '&' },
          { name: 'Step Left in Place', count: '4' },
          { name: 'Cross Right Over Left', count: '5' },
          { name: 'Step Left to Left Side', count: '&' },
          { name: 'Cross Right Over Left', count: '6' },
          { name: 'Rock Left to Left Side', count: '7' },
          { name: 'Recover on Right', count: '8' }
        ]},
        { name: 'Forward Locks, Pivot', counts: '1-8', steps: [
          { name: 'Step Forward Left', count: '1' },
          { name: 'Lock Right Behind Left', count: '&' },
          { name: 'Step Forward Left', count: '2' },
          { name: 'Step Forward Right', count: '3' },
          { name: 'Pivot Half Turn Left', count: '4' },
          { name: 'Step Forward Right', count: '5' },
          { name: 'Lock Left Behind Right', count: '&' },
          { name: 'Step Forward Right', count: '6' },
          { name: 'Rock Forward Left', count: '7' },
          { name: 'Recover on Right', count: '8' }
        ]},
        { name: 'Monterey Turn, Swivels', counts: '1-8', steps: [
          { name: 'Point Right to Right Side', count: '1' },
          { name: 'Half Turn Right Step Right Beside Left', count: '2' },
          { name: 'Point Left to Left Side', count: '3' },
          { name: 'Step Left Beside Right', count: '4' },
          { name: 'Swivel Heels Right', count: '5' },
          { name: 'Swivel Heels Left', count: '6' },
          { name: 'Swivel Heels Right', count: '7' },
          { name: 'Stomp Left Beside Right', count: '8' }
        ]},
        { name: 'Toe Struts, Hip Sway', counts: '1-8', steps: [
          { name: 'Touch Right Toe Forward', count: '1' },
          { name: 'Drop Right Heel', count: '2' },
          { name: 'Touch Left Toe Forward', count: '3' },
          { name: 'Drop Left Heel', count: '4' },
          { name: 'Sway Hips Right', count: '5' },
          { name: 'Sway Hips Left', count: '6' },
          { name: 'Sway Hips Right', count: '7' },
          { name: 'Hold', count: '8' }
        ]},
        { name: 'Jazz Box Turn, Clap', counts: '1-8', steps: [
          { name: 'Cross Right Over Left', count: '1' },
          { name: 'Step Back Left', count: '2' },
          { name: 'Quarter Turn Right Step Right to Side', count: '3' },
          { name: 'Step Left Beside Right', count: '4' },
          { name: 'Walk Forward Right', count: '5' },
          { name: 'Walk Forward Left', count: '6' },
          { name: 'Stomp Right Forward', count: '7' },
          { name: 'Clap', count: '8' }
        ]}
      ]
    },
    {
      title: 'High Syncopation Express',
      level: 'Advanced',
      style: '8-count',
      walls: 4,
      counts: 64,
      desc: 'Fast syncopated footwork, rolling turns, hip-hop accents, and advanced combinations.',
      sections: [
        { name: 'Syncopated Cross Slides', counts: '1-8', steps: [
          { name: 'Cross Right Over Left', count: '1' },
          { name: 'Slide Left to Left Side', count: '&' },
          { name: 'Cross Right Over Left', count: '2' },
          { name: 'Step Left to Left Side', count: '&' },
          { name: 'Cross Right Behind Left', count: '3' },
          { name: 'Step Left to Left Side', count: '&' },
          { name: 'Cross Right Over Left', count: '4' },
          { name: 'Rock Left to Left Side', count: '5' },
          { name: 'Recover on Right', count: '6' },
          { name: 'Shuffle Back Left-Right-Left', count: '7&8' }
        ]},
        { name: 'Triple Full Turn, Coaster', counts: '1-8', steps: [
          { name: 'Half Turn Left Step Right Back', count: '1' },
          { name: 'Half Turn Left Step Left Forward', count: '2' },
          { name: 'Step Forward Right', count: '3' },
          { name: 'Pivot Half Turn Left', count: '4' },
          { name: 'Step Back Right', count: '5' },
          { name: 'Step Left Beside Right', count: '&' },
          { name: 'Step Forward Right', count: '6' },
          { name: 'Step Forward Left', count: '7' },
          { name: 'Stomp Right Beside Left', count: '8' }
        ]},
        { name: 'Sailor, Hitch, Kick Ball Change', counts: '1-8', steps: [
          { name: 'Cross Right Behind Left', count: '1' },
          { name: 'Step Left to Left Side', count: '&' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Hitch Left Knee', count: '3' },
          { name: 'Step Left Forward', count: '4' },
          { name: 'Kick Right Forward', count: '5' },
          { name: 'Step Right Beside Left', count: '&' },
          { name: 'Step Left in Place', count: '6' },
          { name: 'Step Forward Right', count: '7' },
          { name: 'Pivot Quarter Turn Left', count: '8' }
        ]},
        { name: 'Rolling Vine, Mambo', counts: '1-8', steps: [
          { name: 'Quarter Turn Right Step Right Forward', count: '1' },
          { name: 'Half Turn Right Step Left Back', count: '2' },
          { name: 'Quarter Turn Right Step Right to Side', count: '3' },
          { name: 'Touch Left Beside Right', count: '4' },
          { name: 'Rock Forward Left', count: '5' },
          { name: 'Recover on Right', count: '&' },
          { name: 'Step Left Beside Right', count: '6' },
          { name: 'Rock Back Right', count: '7' },
          { name: 'Recover on Left', count: '&' },
          { name: 'Step Right Beside Left', count: '8' }
        ]},
        { name: 'Hip Roll, Slide, Pop', counts: '1-8', steps: [
          { name: 'Body Roll Right', count: '1-2' },
          { name: 'Step Right to Right Side', count: '3' },
          { name: 'Drag Left Toward Right', count: '4' },
          { name: 'Pop Left Hip', count: '5' },
          { name: 'Pop Right Hip', count: '&' },
          { name: 'Pop Left Hip', count: '6' },
          { name: 'Step Left Forward', count: '7' },
          { name: 'Stomp Right Beside Left', count: '8' }
        ]},
        { name: 'Paddle Turn, Lock Backs', counts: '1-8', steps: [
          { name: 'Step Forward Left', count: '1' },
          { name: 'Paddle Eighth Turn Right', count: '&' },
          { name: 'Step Forward Left', count: '2' },
          { name: 'Paddle Eighth Turn Right', count: '&' },
          { name: 'Step Forward Left', count: '3' },
          { name: 'Paddle Eighth Turn Right', count: '&' },
          { name: 'Step Forward Left', count: '4' },
          { name: 'Step Back Right', count: '5' },
          { name: 'Lock Left Over Right', count: '&' },
          { name: 'Step Back Right', count: '6' },
          { name: 'Step Back Left', count: '7' },
          { name: 'Stomp Right Beside Left', count: '8' }
        ]},
        { name: 'Scissor Steps, Cross Touch', counts: '1-8', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Step Left Beside Right', count: '&' },
          { name: 'Cross Right Over Left', count: '2' },
          { name: 'Step Left to Left Side', count: '3' },
          { name: 'Step Right Beside Left', count: '&' },
          { name: 'Cross Left Over Right', count: '4' },
          { name: 'Point Right to Right Side', count: '5' },
          { name: 'Touch Right Beside Left', count: '6' },
          { name: 'Point Right to Right Side', count: '7' },
          { name: 'Stomp Right Beside Left', count: '8' }
        ]},
        { name: 'Advanced Combo Finish', counts: '1-8', steps: [
          { name: 'Hitch Right Knee', count: '1' },
          { name: 'Step Right Forward', count: '&' },
          { name: 'Step Left Forward', count: '2' },
          { name: 'Full Turn Right on Right Foot', count: '3-4' },
          { name: 'Walk Forward Left', count: '5' },
          { name: 'Walk Forward Right', count: '6' },
          { name: 'Stomp Left Forward', count: '7' },
          { name: 'Clap', count: '8' }
        ]}
      ]
    },
    {
      title: 'Beginner Waltz Sway',
      level: 'Beginner',
      style: 'Waltz',
      walls: 4,
      counts: 48,
      desc: 'Gentle 3/4 time waltz with basic balance steps, box steps, and sways.',
      sections: [
        { name: 'Forward Balance, Back Balance', counts: '1-6', steps: [
          { name: 'Step Forward Left', count: '1' },
          { name: 'Step Right Beside Left', count: '2' },
          { name: 'Hold', count: '3' },
          { name: 'Step Back Right', count: '4' },
          { name: 'Step Left Beside Right', count: '5' },
          { name: 'Hold', count: '6' }
        ]},
        { name: 'Left Box Step', counts: '1-6', steps: [
          { name: 'Step Forward Left', count: '1' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Close Left Beside Right', count: '3' },
          { name: 'Step Back Right', count: '4' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Close Right Beside Left', count: '6' }
        ]},
        { name: 'Sway Right-Left, Cross', counts: '1-6', steps: [
          { name: 'Sway Right', count: '1' },
          { name: 'Hold', count: '2' },
          { name: 'Hold', count: '3' },
          { name: 'Sway Left', count: '4' },
          { name: 'Hold', count: '5' },
          { name: 'Hold', count: '6' }
        ]},
        { name: 'Waltz Vine Right', counts: '1-6', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Cross Left Behind Right', count: '2' },
          { name: 'Step Right to Right Side', count: '3' },
          { name: 'Step Left to Left Side', count: '4' },
          { name: 'Cross Right Behind Left', count: '5' },
          { name: 'Step Left to Left Side', count: '6' }
        ]},
        { name: 'Forward Waltz Steps', counts: '1-6', steps: [
          { name: 'Step Forward Right', count: '1' },
          { name: 'Step Left Beside Right', count: '2' },
          { name: 'Hold', count: '3' },
          { name: 'Step Forward Left', count: '4' },
          { name: 'Step Right Beside Left', count: '5' },
          { name: 'Hold', count: '6' }
        ]},
        { name: 'Side Touches, Cross Over', counts: '1-6', steps: [
          { name: 'Touch Right to Right Side', count: '1' },
          { name: 'Hold', count: '2' },
          { name: 'Step Right Beside Left', count: '3' },
          { name: 'Touch Left to Left Side', count: '4' },
          { name: 'Hold', count: '5' },
          { name: 'Step Left Beside Right', count: '6' }
        ]},
        { name: 'Twinkle Left, Twinkle Right', counts: '1-6', steps: [
          { name: 'Cross Left Over Right', count: '1' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Step Left Beside Right', count: '3' },
          { name: 'Cross Right Over Left', count: '4' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Step Right Beside Left', count: '6' }
        ]},
        { name: 'Quarter Turn Box', counts: '1-6', steps: [
          { name: 'Step Forward Left', count: '1' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Close Left Beside Right', count: '3' },
          { name: 'Step Back Right with Quarter Turn Left', count: '4' },
          { name: 'Step Left to Left Side', count: '5' },
          { name: 'Close Right Beside Left', count: '6' }
        ]}
      ]
    },
    {
      title: 'Intermediate Waltz Flow',
      level: 'Intermediate',
      style: 'Waltz',
      walls: 2,
      counts: 48,
      desc: 'Flowing intermediate waltz with turning boxes, cross-body weaves, and twinkles.',
      sections: [
        { name: 'Turning Box Left', counts: '1-6', steps: [
          { name: 'Step Forward Left', count: '1' },
          { name: 'Quarter Turn Left Step Right to Right Side', count: '2' },
          { name: 'Close Left Beside Right', count: '3' },
          { name: 'Step Back Right', count: '4' },
          { name: 'Quarter Turn Left Step Left to Left Side', count: '5' },
          { name: 'Close Right Beside Left', count: '6' }
        ]},
        { name: 'Twinkle, Cross Sway', counts: '1-6', steps: [
          { name: 'Cross Left Over Right', count: '1' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Step Left Beside Right', count: '3' },
          { name: 'Cross Right Over Left', count: '4' },
          { name: 'Sway Left', count: '5' },
          { name: 'Sway Right', count: '6' }
        ]},
        { name: 'Waltz Weave Right', counts: '1-6', steps: [
          { name: 'Cross Left Over Right', count: '1' },
          { name: 'Step Right to Right Side', count: '2' },
          { name: 'Cross Left Behind Right', count: '3' },
          { name: 'Step Right to Right Side', count: '4' },
          { name: 'Cross Left Over Right', count: '5' },
          { name: 'Step Right to Right Side', count: '6' }
        ]},
        { name: 'Back Balance, Half Turn', counts: '1-6', steps: [
          { name: 'Step Back Left', count: '1' },
          { name: 'Step Right Beside Left', count: '2' },
          { name: 'Hold', count: '3' },
          { name: 'Step Forward Left', count: '4' },
          { name: 'Half Turn Left Step Right Back', count: '5' },
          { name: 'Step Left Beside Right', count: '6' }
        ]},
        { name: 'Forward Waltz, Slide', counts: '1-6', steps: [
          { name: 'Step Forward Right', count: '1' },
          { name: 'Step Left Beside Right', count: '2' },
          { name: 'Hold', count: '3' },
          { name: 'Slide Right to Right Side', count: '4' },
          { name: 'Drag Left Toward Right', count: '5' },
          { name: 'Close Left Beside Right', count: '6' }
        ]},
        { name: 'Cross Unwind, Balance', counts: '1-6', steps: [
          { name: 'Cross Left Over Right', count: '1' },
          { name: 'Unwind Half Turn Right', count: '2-3' },
          { name: 'Step Forward Right', count: '4' },
          { name: 'Step Left Beside Right', count: '5' },
          { name: 'Hold', count: '6' }
        ]},
        { name: 'Waltz Whisk, Sway', counts: '1-6', steps: [
          { name: 'Step Forward Left', count: '1' },
          { name: 'Step Right Beside Left', count: '2' },
          { name: 'Cross Left Behind Right', count: '3' },
          { name: 'Sway Right', count: '4' },
          { name: 'Hold', count: '5' },
          { name: 'Sway Left', count: '6' }
        ]},
        { name: 'Turning Vine, Touch', counts: '1-6', steps: [
          { name: 'Step Right to Right Side', count: '1' },
          { name: 'Cross Left Behind Right', count: '2' },
          { name: 'Quarter Turn Right Step Right Forward', count: '3' },
          { name: 'Step Left Forward', count: '4' },
          { name: 'Step Right Beside Left', count: '5' },
          { name: 'Touch Left Beside Right', count: '6' }
        ]}
      ]
    }
  ];

  /* ── Level/Style badge colors ────────────────────────────────────────── */
  function levelColor(level, dark) {
    switch (level) {
      case 'Beginner':     return dark ? 'background:rgba(34,197,94,.15);color:#86efac;' : 'background:#dcfce7;color:#166534;';
      case 'Improver':     return dark ? 'background:rgba(59,130,246,.15);color:#93c5fd;' : 'background:#dbeafe;color:#1e40af;';
      case 'Intermediate': return dark ? 'background:rgba(234,179,8,.15);color:#fde047;'  : 'background:#fef9c3;color:#854d0e;';
      case 'Advanced':     return dark ? 'background:rgba(239,68,68,.15);color:#fca5a5;'  : 'background:#fee2e2;color:#991b1b;';
      default:             return dark ? 'background:rgba(156,163,175,.15);color:#d1d5db;' : 'background:#f3f4f6;color:#374151;';
    }
  }

  function styleColor(st, dark) {
    if (st === 'Waltz') return dark ? 'background:rgba(168,85,247,.15);color:#d8b4fe;' : 'background:#f3e8ff;color:#6b21a8;';
    return dark ? 'background:rgba(99,102,241,.15);color:#a5b4fc;' : 'background:#eef2ff;color:#4338ca;';
  }

  /* ── Filter ──────────────────────────────────────────────────────────── */
  function filterTemplates() {
    var level = templatesState.filterLevel;
    var style = templatesState.filterStyle;
    var query = templatesState.searchQuery.toLowerCase().trim();

    return TEMPLATES.filter(function (tpl) {
      if (level !== 'all' && tpl.level !== level) return false;
      if (style !== 'all' && tpl.style !== style) return false;
      if (query && tpl.title.toLowerCase().indexOf(query) === -1
          && tpl.desc.toLowerCase().indexOf(query) === -1
          && tpl.level.toLowerCase().indexOf(query) === -1) return false;
      return true;
    });
  }

  /* ── Section Renderers ───────────────────────────────────────────────── */

  function renderFilters(theme) {
    var html = '';
    html += '<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:20px;">';

    // Search
    html += '<div style="flex:1;min-width:200px;">';
    html += '<input data-tpl-search type="text" value="' + escapeHtml(templatesState.searchQuery) + '" placeholder="🔍 Search templates…" ';
    html += 'style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid;font-size:14px;' + theme.inputBg + '" />';
    html += '</div>';

    // Level filter
    html += '<div>';
    html += '<select data-tpl-filter-level style="padding:10px 14px;border-radius:10px;border:1px solid;font-size:13px;font-weight:600;cursor:pointer;' + theme.inputBg + '">';
    var levels = ['all', 'Beginner', 'Improver', 'Intermediate', 'Advanced'];
    for (var i = 0; i < levels.length; i++) {
      var sel = (templatesState.filterLevel === levels[i]) ? ' selected' : '';
      var label = levels[i] === 'all' ? 'All Levels' : levels[i];
      html += '<option value="' + levels[i] + '"' + sel + '>' + escapeHtml(label) + '</option>';
    }
    html += '</select>';
    html += '</div>';

    // Style filter
    html += '<div>';
    html += '<select data-tpl-filter-style style="padding:10px 14px;border-radius:10px;border:1px solid;font-size:13px;font-weight:600;cursor:pointer;' + theme.inputBg + '">';
    var styles = ['all', '8-count', 'Waltz'];
    for (var j = 0; j < styles.length; j++) {
      var sel2 = (templatesState.filterStyle === styles[j]) ? ' selected' : '';
      var label2 = styles[j] === 'all' ? 'All Styles' : styles[j];
      html += '<option value="' + styles[j] + '"' + sel2 + '>' + escapeHtml(label2) + '</option>';
    }
    html += '</select>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderTemplateCard(tpl, index, theme) {
    var stepCount = 0;
    for (var s = 0; s < tpl.sections.length; s++) {
      stepCount += tpl.sections[s].steps.length;
    }

    var html = '';
    html += '<div class="tpl-card rounded-2xl border p-4" data-tpl-card="' + index + '" style="' + theme.cardBg + '">';

    // Header
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;gap:8px;">';
    html += '<h4 style="font-size:15px;font-weight:800;margin:0;line-height:1.3;">' + escapeHtml(tpl.title) + '</h4>';
    html += '<div style="display:flex;gap:4px;flex-shrink:0;">';
    html += '<span class="tpl-badge" style="' + levelColor(tpl.level, theme.dark) + '">' + escapeHtml(tpl.level) + '</span>';
    html += '<span class="tpl-badge" style="' + styleColor(tpl.style, theme.dark) + '">' + escapeHtml(tpl.style) + '</span>';
    html += '</div>';
    html += '</div>';

    // Meta row
    html += '<div style="display:flex;gap:14px;margin-bottom:10px;font-size:12px;font-weight:600;" class="' + theme.subtle + '">';
    html += '<span>🧱 ' + tpl.walls + '-Wall</span>';
    html += '<span>🔢 ' + tpl.counts + ' Counts</span>';
    html += '<span>👣 ' + stepCount + ' Steps</span>';
    html += '<span>📋 ' + tpl.sections.length + ' Sections</span>';
    html += '</div>';

    // Description
    html += '<p style="font-size:13px;margin:0 0 12px;line-height:1.5;" class="' + theme.subtle + '">' + escapeHtml(tpl.desc) + '</p>';

    // Actions
    html += '<div style="display:flex;gap:8px;">';
    html += '<button data-tpl-preview="' + index + '" style="padding:7px 16px;border-radius:8px;border:1px solid;font-size:12px;font-weight:700;cursor:pointer;' + theme.btnSecondary + '">👁 Preview</button>';
    html += '<button data-tpl-use="' + index + '" style="padding:7px 16px;border-radius:8px;border:none;font-size:12px;font-weight:700;cursor:pointer;' + theme.btnPrimary + '">📥 Use Template</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderGrid(theme) {
    var filtered = filterTemplates();

    if (filtered.length === 0) {
      var html = '';
      html += '<div style="text-align:center;padding:40px 20px;">';
      html += '<div style="font-size:40px;margin-bottom:12px;">🔍</div>';
      html += '<p style="font-size:15px;font-weight:700;margin:0;">No templates found</p>';
      html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:6px 0 0;">Try adjusting your filters or search query.</p>';
      html += '</div>';
      return html;
    }

    var html = '';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">';
    for (var i = 0; i < filtered.length; i++) {
      var realIndex = TEMPLATES.indexOf(filtered[i]);
      html += renderTemplateCard(filtered[i], realIndex, theme);
    }
    html += '</div>';
    return html;
  }

  function renderPreview(theme) {
    if (templatesState.previewIndex < 0 || templatesState.previewIndex >= TEMPLATES.length) return '';

    var tpl = TEMPLATES[templatesState.previewIndex];
    var html = '';

    // Overlay
    html += '<div data-tpl-overlay style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:9998;"></div>';

    // Modal
    html += '<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;width:92%;max-width:640px;max-height:85vh;overflow-y:auto;border-radius:20px;border:1px solid;padding:24px;' + theme.cardBg + (theme.dark ? 'color:#f3f4f6;background:#1a1a2e;' : 'color:#111827;background:#fff;') + '">';

    // Modal header
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">';
    html += '<h3 style="font-size:18px;font-weight:900;margin:0;">' + escapeHtml(tpl.title) + '</h3>';
    html += '<button data-tpl-close-preview style="padding:6px 12px;border-radius:8px;border:none;font-size:14px;font-weight:700;cursor:pointer;' + theme.btnSecondary + '">✕ Close</button>';
    html += '</div>';

    // Meta
    html += '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">';
    html += '<span class="tpl-badge" style="' + levelColor(tpl.level, theme.dark) + '">' + escapeHtml(tpl.level) + '</span>';
    html += '<span class="tpl-badge" style="' + styleColor(tpl.style, theme.dark) + '">' + escapeHtml(tpl.style) + '</span>';
    html += '<span class="tpl-badge" style="' + (theme.dark ? 'background:rgba(156,163,175,.15);color:#d1d5db;' : 'background:#f3f4f6;color:#374151;') + '">' + tpl.walls + '-Wall</span>';
    html += '<span class="tpl-badge" style="' + (theme.dark ? 'background:rgba(156,163,175,.15);color:#d1d5db;' : 'background:#f3f4f6;color:#374151;') + '">' + tpl.counts + ' Counts</span>';
    html += '</div>';

    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 16px;">' + escapeHtml(tpl.desc) + '</p>';

    // Sections
    for (var s = 0; s < tpl.sections.length; s++) {
      var sec = tpl.sections[s];
      html += '<div style="margin-bottom:14px;padding:12px 14px;border-radius:12px;border:1px solid;' + (theme.dark ? 'background:rgba(255,255,255,.03);border-color:#2d2d44;' : 'background:#f9fafb;border-color:#e5e7eb;') + '">';
      html += '<div style="font-size:13px;font-weight:800;margin-bottom:8px;">' + escapeHtml(sec.name) + ' <span class="' + theme.subtle + '" style="font-weight:600;">(' + escapeHtml(sec.counts) + ')</span></div>';

      for (var st = 0; st < sec.steps.length; st++) {
        var step = sec.steps[st];
        html += '<div style="display:flex;gap:10px;padding:4px 0;font-size:12px;border-bottom:1px solid ' + (theme.dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.04)') + ';">';
        html += '<span style="font-weight:700;min-width:36px;text-align:right;flex-shrink:0;font-variant-numeric:tabular-nums;" class="' + theme.subtle + '">' + escapeHtml(step.count) + '</span>';
        html += '<span>' + escapeHtml(step.name) + '</span>';
        html += '</div>';
      }
      html += '</div>';
    }

    // Use button
    html += '<div style="margin-top:16px;display:flex;gap:10px;">';
    html += '<button data-tpl-use-from-preview="' + templatesState.previewIndex + '" style="padding:10px 24px;border-radius:10px;border:none;font-size:14px;font-weight:700;cursor:pointer;flex:1;' + theme.btnPrimary + '">📥 Use This Template</button>';
    html += '<button data-tpl-close-preview style="padding:10px 24px;border-radius:10px;border:1px solid;font-size:14px;font-weight:700;cursor:pointer;' + theme.btnSecondary + '">Cancel</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  /* ── Apply Template ──────────────────────────────────────────────────── */
  function applyTemplate(index) {
    if (index < 0 || index >= TEMPLATES.length) return;
    var tpl = TEMPLATES[index];

    var confirmed = confirm('Load the "' + tpl.title + '" template?\n\nThis will replace your current dance data.');
    if (!confirmed) return;

    var data = loadBuilderData();

    // Build sections/steps for the editor format
    data.title = tpl.title;
    if (!data.meta) data.meta = {};
    data.meta.level = tpl.level;
    data.meta.walls = String(tpl.walls);
    data.meta.counts = String(tpl.counts);
    data.meta.style = tpl.style;

    // Build steps array
    var allSteps = [];
    for (var s = 0; s < tpl.sections.length; s++) {
      var sec = tpl.sections[s];
      allSteps.push({
        type: 'section',
        name: sec.name,
        counts: sec.counts
      });
      for (var st = 0; st < sec.steps.length; st++) {
        allSteps.push({
          type: 'step',
          name: sec.steps[st].name,
          count: sec.steps[st].count
        });
      }
    }

    data.steps = allSteps;

    // Save
    saveBuilderData(data);

    // Dispatch storage event for cross-tab/component sync
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: BUILDER_DATA_KEY,
        newValue: JSON.stringify(data)
      }));
    } catch (e) { /* older browsers */ }

    templatesState.previewIndex = -1;
    _toast('Template "' + tpl.title + '" loaded!');
    renderTemplatesPage();
  }

  function saveBuilderData(data) {
    try { localStorage.setItem(BUILDER_DATA_KEY, JSON.stringify(data)); }
    catch (e) { /* quota */ }
  }

  function loadBuilderData() {
    try { return JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || 'null') || {}; }
    catch (e) { return {}; }
  }

  /* ── Main Render ─────────────────────────────────────────────────────── */
  function renderTemplatesPage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) return;
    if (page.hidden || page.style.display === 'none') return;

    var theme = themeClasses();
    var filtered = filterTemplates();

    var html = '';
    html += '<div class="rounded-3xl border shadow-sm overflow-hidden ' + theme.shell + '" style="transition:all .3s ease;">';

    // Header
    html += '<div class="px-6 py-5 border-b ' + theme.panel + '">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;flex-shrink:0;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>';
    html += '<div>';
    html += '<h2 style="font-size:20px;font-weight:900;margin:0;">Dance Templates</h2>';
    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:4px 0 0;">Browse and load pre-built line dance choreography — ' + TEMPLATES.length + ' templates available</p>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Body
    html += '<div class="p-5 sm:p-6">';

    // Stats bar
    html += '<div style="display:flex;gap:16px;margin-bottom:16px;flex-wrap:wrap;">';
    var begCount = 0, impCount = 0, intCount = 0, advCount = 0, waltzCount = 0;
    for (var c = 0; c < TEMPLATES.length; c++) {
      if (TEMPLATES[c].level === 'Beginner') begCount++;
      if (TEMPLATES[c].level === 'Improver') impCount++;
      if (TEMPLATES[c].level === 'Intermediate') intCount++;
      if (TEMPLATES[c].level === 'Advanced') advCount++;
      if (TEMPLATES[c].style === 'Waltz') waltzCount++;
    }
    html += '<span style="font-size:12px;font-weight:600;" class="' + theme.subtle + '">📊 Showing ' + filtered.length + ' of ' + TEMPLATES.length + ' templates</span>';
    html += '<span style="font-size:12px;" class="' + theme.subtle + '">🟢 ' + begCount + ' Beginner</span>';
    html += '<span style="font-size:12px;" class="' + theme.subtle + '">🔵 ' + impCount + ' Improver</span>';
    html += '<span style="font-size:12px;" class="' + theme.subtle + '">🟡 ' + intCount + ' Intermediate</span>';
    html += '<span style="font-size:12px;" class="' + theme.subtle + '">🔴 ' + advCount + ' Advanced</span>';
    html += '<span style="font-size:12px;" class="' + theme.subtle + '">💜 ' + waltzCount + ' Waltz</span>';
    html += '</div>';

    // Filters
    html += renderFilters(theme);

    // Grid
    html += renderGrid(theme);

    html += '</div>';
    html += '</div>';

    // Preview overlay
    if (templatesState.previewIndex >= 0) {
      html += renderPreview(theme);
    }

    page.innerHTML = html;
    attachTemplateListeners(page);
  }

  /* ── Event Wiring ────────────────────────────────────────────────────── */
  function attachTemplateListeners(page) {
    // Search
    var searchInput = page.querySelector('[data-tpl-search]');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        templatesState.searchQuery = e.target.value;
        renderTemplatesPage();
        // Re-focus search after re-render
        var newInput = document.querySelector('#' + PAGE_ID + ' [data-tpl-search]');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        }
      });
    }

    // Level filter
    var levelSelect = page.querySelector('[data-tpl-filter-level]');
    if (levelSelect) {
      levelSelect.addEventListener('change', function (e) {
        templatesState.filterLevel = e.target.value;
        renderTemplatesPage();
      });
    }

    // Style filter
    var styleSelect = page.querySelector('[data-tpl-filter-style]');
    if (styleSelect) {
      styleSelect.addEventListener('change', function (e) {
        templatesState.filterStyle = e.target.value;
        renderTemplatesPage();
      });
    }

    // Preview buttons
    var previewBtns = page.querySelectorAll('[data-tpl-preview]');
    for (var i = 0; i < previewBtns.length; i++) {
      previewBtns[i].addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(this.getAttribute('data-tpl-preview'), 10);
        templatesState.previewIndex = idx;
        renderTemplatesPage();
      });
    }

    // Card click opens preview
    var cards = page.querySelectorAll('[data-tpl-card]');
    for (var k = 0; k < cards.length; k++) {
      cards[k].addEventListener('click', function (e) {
        // Don't trigger if clicking a button inside the card
        if (e.target.closest('button')) return;
        var idx = parseInt(this.getAttribute('data-tpl-card'), 10);
        templatesState.previewIndex = idx;
        renderTemplatesPage();
      });
    }

    // Use template buttons
    var useBtns = page.querySelectorAll('[data-tpl-use]');
    for (var j = 0; j < useBtns.length; j++) {
      useBtns[j].addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(this.getAttribute('data-tpl-use'), 10);
        applyTemplate(idx);
      });
    }

    // Use from preview
    var useFromPreview = page.querySelectorAll('[data-tpl-use-from-preview]');
    for (var m = 0; m < useFromPreview.length; m++) {
      useFromPreview[m].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-tpl-use-from-preview'), 10);
        applyTemplate(idx);
      });
    }

    // Close preview
    var closePreviewBtns = page.querySelectorAll('[data-tpl-close-preview]');
    for (var n = 0; n < closePreviewBtns.length; n++) {
      closePreviewBtns[n].addEventListener('click', function () {
        templatesState.previewIndex = -1;
        renderTemplatesPage();
      });
    }

    // Overlay click closes preview
    var overlay = page.querySelector('[data-tpl-overlay]');
    if (overlay) {
      overlay.addEventListener('click', function () {
        templatesState.previewIndex = -1;
        renderTemplatesPage();
      });
    }
  }

  /* ── Public API ──────────────────────────────────────────────────────── */
  window.__stepperTemplatesTab = {
    PAGE_ID: PAGE_ID,
    TAB_ID:  TAB_ID,

    render: function () {
      ensurePage();
      ensureTemplatesStyles();
      renderTemplatesPage();
    },

    getState: function () {
      return templatesState;
    },

    icon: function () {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>';
    },

    getTemplates: function () {
      return TEMPLATES;
    }
  };

})();
