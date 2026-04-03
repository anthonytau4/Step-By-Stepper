/**
 * stepper-cool-extras.js
 * ──────────────────────
 * Adds polish & power-user features to the Step-By-Stepper line-dance
 * choreography editor:
 *
 *  1. Command Palette  (Ctrl+K)
 *  2. Animated Page Transitions
 *  3. Particle Ambient Background
 *  4. Status Bar
 *  5. Confetti on Save
 *  6. Theme Presets
 *  7. Keyboard Shortcuts Overlay  (Ctrl+/)
 *  8. Scroll Progress Indicator
 *  9. Focus Mode  (Ctrl+Shift+F)
 * 10. Smooth Scroll
 *
 * Pattern: IIFE with install guard, CSS-in-JS, dark mode from localStorage.
 * Responsive: works on 1920px desktops and 360px phones.
 * z-index range: 10200–10500 (above hamburger 9999–10001 & step-select 9990–9999).
 *
 * Public API → window.__stepperCoolExtras
 */
(function () {
  /* ── Install guard ─────────────────────────────────────────────── */
  if (window.__stepperCoolExtrasInstalled) return;
  window.__stepperCoolExtrasInstalled = true;

  /* ── Helpers ────────────────────────────────────────────────────── */
  const STORAGE_KEY = 'linedance_builder_data_v13';
  const THEME_KEY  = 'stepper_theme_preset';
  const FOCUS_KEY  = 'stepper_focus_mode';

  /** Read the builder JSON from localStorage (or null). */
  function readBuilderData() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
    catch (_) { return null; }
  }

  /** Is dark mode currently active? */
  function isDark() {
    const d = readBuilderData();
    return d ? !!d.isDarkMode : false;
  }

  /** True when the user prefers reduced motion. */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ── CSS injection ─────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.id = 'stepper-cool-extras-styles';
  document.head.appendChild(styleEl);

  function injectCSS() {
    const dark = isDark();
    /* colour tokens */
    const bg        = dark ? 'rgba(30,30,46,.82)'  : 'rgba(255,255,255,.82)';
    const border    = dark ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.10)';
    const text      = dark ? '#cdd6f4' : '#1e1e2e';
    const subtext   = dark ? '#a6adc8' : '#6c6f85';
    const inputBg   = dark ? 'rgba(49,50,68,.6)'   : 'rgba(239,241,245,.6)';
    const hoverBg   = dark ? 'rgba(69,71,90,.55)'   : 'rgba(220,224,232,.55)';
    const accentClr = dark ? '#b4befe' : '#7287fd';
    const overlayBg = dark ? 'rgba(17,17,27,.55)'   : 'rgba(76,79,105,.25)';
    const statusBg  = dark ? 'rgba(30,30,46,.88)'   : 'rgba(239,241,245,.88)';

    styleEl.textContent = `
/* ── Command Palette ─────────────────────────────────────── */
.stepper-cmd-overlay {
  position: fixed; inset: 0; z-index: 10450;
  background: ${overlayBg};
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 18vh;
  opacity: 0; transition: opacity .18s ease-out;
  pointer-events: none;
}
.stepper-cmd-overlay.open { opacity: 1; pointer-events: auto; }
.stepper-cmd-box {
  width: min(560px, calc(100vw - 32px));
  max-height: 65vh;
  background: ${bg};
  border: 1px solid ${border};
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,.28);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  display: flex; flex-direction: column;
  overflow: hidden;
  transform: translateY(10px) scale(.97);
  transition: transform .2s ease-out, opacity .2s ease-out;
  opacity: 0;
  color: ${text};
}
.stepper-cmd-overlay.open .stepper-cmd-box {
  transform: translateY(0) scale(1); opacity: 1;
}
.stepper-cmd-search-wrap {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-bottom: 1px solid ${border};
}
.stepper-cmd-search-wrap svg { flex-shrink: 0; color: ${subtext}; }
.stepper-cmd-input {
  flex: 1; border: none; outline: none;
  background: transparent; font-size: 15px;
  color: ${text}; caret-color: ${accentClr};
}
.stepper-cmd-input::placeholder { color: ${subtext}; }
.stepper-cmd-list {
  list-style: none; margin: 0; padding: 6px;
  overflow-y: auto; flex: 1;
}
.stepper-cmd-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px; cursor: pointer;
  min-height: 44px; box-sizing: border-box;
  transition: background .12s;
}
.stepper-cmd-item.active,
.stepper-cmd-item:hover { background: ${hoverBg}; }
.stepper-cmd-item-icon {
  width: 22px; height: 22px; display: flex;
  align-items: center; justify-content: center;
  flex-shrink: 0; color: ${subtext};
}
.stepper-cmd-item-label { flex: 1; font-size: 14px; }
.stepper-cmd-item-cat {
  font-size: 11px; color: ${subtext}; margin-right: 4px;
  text-transform: uppercase; letter-spacing: .5px;
}
.stepper-cmd-item-shortcut {
  font-size: 11px; color: ${subtext}; background: ${inputBg};
  padding: 2px 7px; border-radius: 5px; white-space: nowrap;
}
.stepper-cmd-empty {
  text-align: center; padding: 24px; color: ${subtext}; font-size: 14px;
}

/* ── Keyboard Shortcuts Overlay ──────────────────────────── */
.stepper-shortcuts-overlay {
  position: fixed; inset: 0; z-index: 10460;
  background: ${overlayBg};
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .18s ease-out;
  pointer-events: none;
}
.stepper-shortcuts-overlay.open { opacity: 1; pointer-events: auto; }
.stepper-shortcuts-box {
  width: min(700px, calc(100vw - 32px));
  max-width: calc(100vw - 24px);
  max-height: 80vh;
  background: ${bg};
  border: 1px solid ${border};
  border-radius: 14px;
  box-shadow: 0 16px 48px rgba(0,0,0,.28);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  display: flex; flex-direction: column;
  overflow: hidden; color: ${text};
  transform: scale(.97); opacity: 0;
  transition: transform .2s ease-out, opacity .2s ease-out;
}
.stepper-shortcuts-overlay.open .stepper-shortcuts-box {
  transform: scale(1); opacity: 1;
}
.stepper-shortcuts-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px; border-bottom: 1px solid ${border};
}
.stepper-shortcuts-header h2 {
  margin: 0; font-size: 17px; font-weight: 600;
}
.stepper-shortcuts-close {
  background: none; border: none; cursor: pointer;
  font-size: 22px; line-height: 1; color: ${subtext};
  min-width: 44px; min-height: 44px;
  display: flex; align-items: center; justify-content: center;
}
.stepper-shortcuts-filter-wrap {
  padding: 10px 18px; border-bottom: 1px solid ${border};
}
.stepper-shortcuts-filter {
  width: 100%; border: none; outline: none;
  background: ${inputBg}; font-size: 14px;
  color: ${text}; padding: 8px 12px;
  border-radius: 8px; box-sizing: border-box;
}
.stepper-shortcuts-filter::placeholder { color: ${subtext}; }
.stepper-shortcuts-body {
  padding: 14px 18px 18px; overflow-y: auto; flex: 1;
}
.stepper-sc-category { margin-bottom: 16px; }
.stepper-sc-category-title {
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .8px; color: ${accentClr}; margin-bottom: 8px;
}
.stepper-sc-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px;
}
.stepper-sc-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 0; min-height: 32px;
}
.stepper-sc-label { font-size: 13px; color: ${text}; }
.stepper-sc-keys { font-size: 12px; color: ${subtext};
  background: ${inputBg}; padding: 2px 8px; border-radius: 5px;
}

/* ── Status Bar ──────────────────────────────────────────── */
.stepper-status-bar {
  position: fixed; left: 0; right: 0;
  bottom: max(0px, env(safe-area-inset-bottom));
  height: 28px; z-index: 10300;
  background: ${statusBg};
  border-top: 1px solid ${border};
  backdrop-filter: blur(12px) saturate(1.3);
  -webkit-backdrop-filter: blur(12px) saturate(1.3);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 14px;
  font-size: 12px; color: ${subtext};
  transition: transform .25s ease-out;
  padding-left: max(14px, env(safe-area-inset-left));
  padding-right: max(14px, env(safe-area-inset-right));
}
.stepper-status-bar.hidden { transform: translateY(100%); pointer-events: none; }
.stepper-status-left,
.stepper-status-center,
.stepper-status-right { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stepper-status-left   { flex: 1; text-align: left; }
.stepper-status-center { flex: 2; text-align: center; }
.stepper-status-right  { flex: 1; text-align: right; display: flex;
  align-items: center; justify-content: flex-end; gap: 6px; }
.stepper-status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #a6e3a1; display: inline-block;
}

/* ── Scroll Progress ─────────────────────────────────────── */
.stepper-scroll-progress {
  position: fixed; top: 0; left: 0; height: 3px;
  z-index: 10200; pointer-events: none;
  background: linear-gradient(90deg, #7287fd, #b4befe);
  width: 0%; transition: width .15s linear;
}

/* ── Focus Mode pill ─────────────────────────────────────── */
.stepper-focus-pill {
  position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
  z-index: 10500; padding: 6px 18px;
  border-radius: 20px; cursor: pointer;
  font-size: 13px; font-weight: 500;
  background: ${bg}; color: ${text};
  border: 1px solid ${border};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0,0,0,.18);
  opacity: 0; pointer-events: none;
  transition: opacity .25s ease-out;
  min-height: 44px; display: flex; align-items: center;
}
html.stepper-focus-mode .stepper-focus-pill { opacity: 1; pointer-events: auto; }
html.stepper-focus-mode .stepper-status-bar,
html.stepper-focus-mode .hamburger-btn,
html.stepper-focus-mode [class*="hamburger"],
html.stepper-focus-mode .stepper-menubar { opacity: 0 !important; pointer-events: none !important; }
html.stepper-focus-mode body {
  box-shadow: inset 0 0 120px 40px rgba(0,0,0,.12);
}

/* ── Confetti canvas ─────────────────────────────────────── */
#stepper-confetti-canvas {
  position: fixed; inset: 0; z-index: 10400;
  pointer-events: none;
}

/* ── Particle canvas ─────────────────────────────────────── */
#stepper-particle-canvas {
  position: fixed; inset: 0; z-index: -1;
  pointer-events: none;
}

/* ── Smooth scroll ───────────────────────────────────────── */
html.stepper-smooth-scroll { scroll-behavior: smooth; }

/* ── Page transition helper class ────────────────────────── */
.stepper-page-exit {
  transition: opacity .2s ease-out, transform .2s ease-out;
  opacity: .95; transform: translateY(-4px);
}
.stepper-page-enter {
  transition: opacity .2s ease-out, transform .2s ease-out;
  opacity: 1; transform: translateY(0);
}

/* ── Responsive: mobile ≤480px ───────────────────────────── */
@media (max-width: 480px) {
  .stepper-status-bar { height: 24px; font-size: 11px; }
  .stepper-status-center,
  .stepper-status-right { display: none !important; }
  .stepper-sc-grid { grid-template-columns: 1fr; }
}

/* ── Reduced motion ──────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .stepper-cmd-overlay,
  .stepper-cmd-box,
  .stepper-shortcuts-overlay,
  .stepper-shortcuts-box,
  .stepper-scroll-progress,
  .stepper-focus-pill,
  .stepper-page-exit,
  .stepper-page-enter,
  .stepper-status-bar { transition: none !important; }
  html.stepper-smooth-scroll { scroll-behavior: auto; }
}
`;
  }

  injectCSS();

  // Re-inject CSS when dark mode may have changed (poll every 4s).
  setInterval(() => { injectCSS(); }, 4000);

  /* ================================================================
   * 1. COMMAND PALETTE  (Ctrl+K)
   * ============================================================= */
  const COMMANDS = [
    /* Navigation */
    { id:'nav-build',     label:'Go to Build',        cat:'Navigation', icon:'🏗️', shortcut:'',          action(){ navigateTo('build');       }},
    { id:'nav-sheet',     label:'Go to Sheet',        cat:'Navigation', icon:'📄', shortcut:'',          action(){ navigateTo('sheet');       }},
    { id:'nav-whatsnew',  label:"Go to What's New",   cat:'Navigation', icon:'🆕', shortcut:'',          action(){ navigateTo('whatsnew');    }},
    { id:'nav-saved',     label:'Go to Saved Dances', cat:'Navigation', icon:'💾', shortcut:'',          action(){ navigateTo('saved');       }},
    { id:'nav-featured',  label:'Go to Featured',     cat:'Navigation', icon:'⭐', shortcut:'',          action(){ navigateTo('featured');    }},
    { id:'nav-glossary',  label:'Go to Glossary',     cat:'Navigation', icon:'📖', shortcut:'',          action(){ navigateTo('glossary');    }},
    { id:'nav-pdf',       label:'Go to PDF Import',   cat:'Navigation', icon:'📑', shortcut:'',          action(){ navigateTo('pdf');         }},
    { id:'nav-friends',   label:'Go to Friends',      cat:'Navigation', icon:'👥', shortcut:'',          action(){ navigateTo('friends');     }},
    { id:'nav-settings',  label:'Go to Settings',     cat:'Navigation', icon:'⚙️', shortcut:'',          action(){ navigateTo('settings');    }},
    { id:'nav-signin',    label:'Sign In',            cat:'Navigation', icon:'🔑', shortcut:'',          action(){ navigateTo('signin');      }},
    /* Edit */
    { id:'edit-find',     label:'Find & Replace',     cat:'Edit',       icon:'🔍', shortcut:'Ctrl+H',    action(){ triggerKey('h', true);     }},
    { id:'edit-selectall',label:'Select All',          cat:'Edit',       icon:'☑️', shortcut:'Ctrl+A',    action(){ document.execCommand('selectAll'); }},
    { id:'edit-new',      label:'New Dance',           cat:'Edit',       icon:'✨', shortcut:'',          action(){ fireCustom('stepper-new-dance');   }},
    { id:'edit-save',     label:'Save',                cat:'Edit',       icon:'💾', shortcut:'Ctrl+S',    action(){ fireCustom('stepper-save');        }},
    { id:'edit-print',    label:'Print',               cat:'Edit',       icon:'🖨️', shortcut:'Ctrl+P',   action(){ window.print();                   }},
    /* View */
    { id:'view-dark',     label:'Toggle Dark Mode',   cat:'View',       icon:'🌙', shortcut:'',          action(){ fireCustom('stepper-toggle-dark'); }},
    { id:'view-full',     label:'Fullscreen',          cat:'View',       icon:'⛶',  shortcut:'F11',       action(){ toggleFullscreen();                }},
    { id:'view-focus',    label:'Focus Mode',          cat:'View',       icon:'🎯', shortcut:'Ctrl+Shift+F', action(){ toggleFocusMode();             }},
    /* Tools */
    { id:'tool-helper',   label:'Open Helper',         cat:'Tools',      icon:'🤖', shortcut:'',          action(){ fireCustom('stepper-open-helper'); }},
    { id:'tool-shortcuts',label:'Keyboard Shortcuts',  cat:'Tools',      icon:'⌨️', shortcut:'Ctrl+/',   action(){ showShortcuts();                   }},
  ];

  /** Simple fuzzy match: every char of query appears in order in target. */
  function fuzzy(query, target) {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    let qi = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) qi++;
    }
    return qi === q.length;
  }

  /** Navigate using the app's routing system or fallback. */
  function navigateTo(page) {
    const ev = new CustomEvent('stepper-navigate', { detail: { page } });
    document.dispatchEvent(ev);
  }

  function fireCustom(name) { document.dispatchEvent(new CustomEvent(name)); }

  function triggerKey(key, ctrl) {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key, ctrlKey: !!ctrl, bubbles: true
    }));
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function(){});
    } else {
      document.exitFullscreen().catch(function(){});
    }
  }

  /* Build DOM */
  const cmdOverlay = document.createElement('div');
  cmdOverlay.className = 'stepper-cmd-overlay';
  cmdOverlay.setAttribute('role', 'dialog');
  cmdOverlay.setAttribute('aria-label', 'Command palette');
  cmdOverlay.innerHTML = [
    '<div class="stepper-cmd-box">',
    '  <div class="stepper-cmd-search-wrap">',
    '    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"',
    '         stroke="currentColor" stroke-width="2" stroke-linecap="round">',
    '      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    '    </svg>',
    '    <input class="stepper-cmd-input" placeholder="Type a command…"',
    '           aria-label="Search commands" autocomplete="off" spellcheck="false"/>',
    '  </div>',
    '  <ul class="stepper-cmd-list" role="listbox"></ul>',
    '</div>'
  ].join('\n');
  document.body.appendChild(cmdOverlay);

  const cmdInput = cmdOverlay.querySelector('.stepper-cmd-input');
  const cmdList  = cmdOverlay.querySelector('.stepper-cmd-list');
  let cmdActiveIdx = 0;
  let cmdFiltered  = [];

  function renderCmdList(query) {
    cmdFiltered = query
      ? COMMANDS.filter(function(c) { return fuzzy(query, c.label) || fuzzy(query, c.cat); })
      : COMMANDS.slice();
    cmdActiveIdx = 0;
    if (!cmdFiltered.length) {
      cmdList.innerHTML = '<li class="stepper-cmd-empty">No matching commands</li>';
      return;
    }
    cmdList.innerHTML = cmdFiltered.map(function(c, i) {
      return [
        '<li class="stepper-cmd-item' + (i === 0 ? ' active' : '') + '"',
        '    role="option" data-idx="' + i + '">',
        '  <span class="stepper-cmd-item-icon">' + c.icon + '</span>',
        '  <span class="stepper-cmd-item-label">' + c.label + '</span>',
        '  <span class="stepper-cmd-item-cat">' + c.cat + '</span>',
        c.shortcut ? '  <span class="stepper-cmd-item-shortcut">' + c.shortcut + '</span>' : '',
        '</li>'
      ].join('');
    }).join('');
  }

  function highlightCmd(idx) {
    var items = cmdList.querySelectorAll('.stepper-cmd-item');
    items.forEach(function(el, i) { el.classList.toggle('active', i === idx); });
    if (items[idx]) items[idx].scrollIntoView({ block: 'nearest' });
    cmdActiveIdx = idx;
  }

  function execCmd(idx) {
    if (cmdFiltered[idx]) {
      closeCommandPalette();
      cmdFiltered[idx].action();
    }
  }

  function openCommandPalette() {
    injectCSS(); // refresh colours
    renderCmdList('');
    cmdInput.value = '';
    cmdOverlay.classList.add('open');
    // Defer focus so transition can begin
    requestAnimationFrame(function() { cmdInput.focus(); });
  }

  function closeCommandPalette() {
    cmdOverlay.classList.remove('open');
  }

  /* Events */
  cmdInput.addEventListener('input', function() { renderCmdList(this.value.trim()); });
  cmdInput.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightCmd(Math.min(cmdActiveIdx + 1, cmdFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightCmd(Math.max(cmdActiveIdx - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execCmd(cmdActiveIdx);
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  });
  cmdList.addEventListener('click', function(e) {
    var item = e.target.closest('.stepper-cmd-item');
    if (item) execCmd(Number(item.dataset.idx));
  });
  cmdOverlay.addEventListener('click', function(e) {
    if (e.target === cmdOverlay) closeCommandPalette();
  });

  /* Ctrl+K global shortcut */
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      cmdOverlay.classList.contains('open') ? closeCommandPalette() : openCommandPalette();
    }
  });

  /* ================================================================
   * 2. ANIMATED PAGE TRANSITIONS
   * ============================================================= */
  (function initPageTransitions() {
    if (prefersReducedMotion()) return;

    var lastRoute = document.documentElement.getAttribute('data-stepper-route');
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.attributeName !== 'data-stepper-route') return;
        var newRoute = document.documentElement.getAttribute('data-stepper-route');
        if (newRoute === lastRoute) return;
        lastRoute = newRoute;
        animatePageTransition();
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    function animatePageTransition() {
      var main = document.querySelector('main') || document.querySelector('.main-content') || document.body;
      // Phase 1: exit
      main.classList.add('stepper-page-exit');
      main.classList.remove('stepper-page-enter');
      setTimeout(function() {
        // Phase 2: enter
        main.classList.remove('stepper-page-exit');
        main.style.opacity = '0.95';
        main.style.transform = 'translateY(4px)';
        // Force reflow
        void main.offsetHeight;
        main.classList.add('stepper-page-enter');
        main.style.opacity = '';
        main.style.transform = '';
        setTimeout(function() { main.classList.remove('stepper-page-enter'); }, 220);
      }, 200);
    }
  })();

  /* ================================================================
   * 3. PARTICLE AMBIENT BACKGROUND
   * ============================================================= */
  (function initParticles() {
    if (prefersReducedMotion()) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'stepper-particle-canvas';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var particles = [];
    var PARTICLE_COUNT = 25;
    var frameCount = 0;
    var running = true;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Seed particles
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 1 + Math.random() * 2,               // radius 1–3px
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: 0.2 + Math.random() * 0.3
      });
    }

    // Pause when tab not visible
    document.addEventListener('visibilitychange', function() {
      running = !document.hidden;
      if (running) requestAnimationFrame(draw);
    });

    function draw() {
      if (!running) return;
      frameCount++;
      // Only update every 3rd frame to be gentle on mobile
      if (frameCount % 3 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        var dark = isDark();
        particles.forEach(function(p) {
          p.x += p.vx;
          p.y += p.vy;
          // Wrap around
          if (p.x < -5) p.x = canvas.width + 5;
          if (p.x > canvas.width + 5) p.x = -5;
          if (p.y < -5) p.y = canvas.height + 5;
          if (p.y > canvas.height + 5) p.y = -5;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          if (dark) {
            // Soft indigo glow
            ctx.fillStyle = 'rgba(180,190,254,' + p.opacity + ')';
            ctx.shadowColor = 'rgba(180,190,254,0.4)';
            ctx.shadowBlur = 6;
          } else {
            // Light gray circle
            ctx.fillStyle = 'rgba(140,143,161,' + p.opacity + ')';
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ================================================================
   * 4. STATUS BAR
   * ============================================================= */
  var statusBar = document.createElement('div');
  statusBar.className = 'stepper-status-bar';
  statusBar.innerHTML = [
    '<span class="stepper-status-left"></span>',
    '<span class="stepper-status-center"></span>',
    '<span class="stepper-status-right">',
    '  <span class="stepper-status-dot" title="Saved"></span>',
    '  <span class="stepper-status-saved-text">Saved</span>',
    '</span>'
  ].join('');
  document.body.appendChild(statusBar);

  var statusHidden = false;

  function updateStatusBar() {
    var data = readBuilderData();
    if (!data) return;

    var sections  = data.sections || [];
    var meta      = data.meta || {};
    var secIdx    = 1;
    var stepIdx   = 1;
    var totalSteps = 0;

    sections.forEach(function(s) {
      totalSteps += (s.steps ? s.steps.length : 0);
    });

    var leftText = 'Section ' + secIdx + '/' + sections.length +
                   ' \u00B7 Step ' + stepIdx + '/' + totalSteps;
    var centerText = meta.title || meta.name || 'Untitled Dance';
    var darkIcon = isDark() ? '🌙' : '☀️';

    statusBar.querySelector('.stepper-status-left').textContent   = leftText;
    statusBar.querySelector('.stepper-status-center').textContent = centerText;
    var right = statusBar.querySelector('.stepper-status-right');
    right.querySelector('.stepper-status-saved-text').textContent = darkIcon + ' Saved';
  }

  updateStatusBar();
  setInterval(updateStatusBar, 3000);

  function toggleStatusBar() {
    statusHidden = !statusHidden;
    statusBar.classList.toggle('hidden', statusHidden);
  }

  /* Ctrl+B to toggle */
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !e.shiftKey) {
      e.preventDefault();
      toggleStatusBar();
    }
  });

  /* ================================================================
   * 5. CONFETTI
   * ============================================================= */
  function confetti() {
    var canvas = document.createElement('canvas');
    canvas.id = 'stepper-confetti-canvas';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    var COLORS = ['#f38ba8','#a6e3a1','#89b4fa','#f9e2af',
                  '#cba6f7','#fab387','#94e2d5','#f2cdcd'];
    var pieces = [];
    for (var i = 0; i < 60; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -10 - Math.random() * canvas.height * 0.3,
        w: 4 + Math.random() * 4,
        h: 4 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * 360,
        rv: (Math.random() - 0.5) * 8
      });
    }

    var start = Date.now();
    function frame() {
      if (Date.now() - start > 3000) {
        canvas.remove();
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function(p) {
        p.x += p.vx;
        p.vy += 0.12; // gravity
        p.y += p.vy;
        p.rot += p.rv;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Fire confetti on save (storage event for builder data) */
  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEY && e.newValue) {
      confetti();
    }
  });

  /* ================================================================
   * 6. THEME PRESETS
   * ============================================================= */
  var THEMES = {
    default:      { accent:'#7287fd', accentSoft:'rgba(114,135,253,.12)', gradient:'linear-gradient(135deg,#eff1f5 0%,#e6e9ef 100%)', border:'rgba(114,135,253,.25)' },
    neon:         { accent:'#00ff87', accentSoft:'rgba(0,255,135,.10)',   gradient:'linear-gradient(135deg,#0a0a1a 0%,#1a0a2e 100%)', border:'rgba(0,255,135,.30)'   },
    sunset:       { accent:'#ff6b6b', accentSoft:'rgba(255,107,107,.12)', gradient:'linear-gradient(135deg,#fff5f5 0%,#ffe8cc 100%)', border:'rgba(255,107,107,.25)' },
    ocean:        { accent:'#0ea5e9', accentSoft:'rgba(14,165,233,.10)', gradient:'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)', border:'rgba(14,165,233,.25)'  },
    forest:       { accent:'#22c55e', accentSoft:'rgba(34,197,94,.10)',  gradient:'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)', border:'rgba(34,197,94,.25)'   },
    midnight:     { accent:'#a78bfa', accentSoft:'rgba(167,139,250,.12)', gradient:'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)', border:'rgba(167,139,250,.30)' },
    'cotton-candy':{ accent:'#f472b6', accentSoft:'rgba(244,114,182,.12)', gradient:'linear-gradient(135deg,#fdf2f8 0%,#fce7f3 100%)', border:'rgba(244,114,182,.25)' }
  };

  function applyTheme(name) {
    var t = THEMES[name];
    if (!t) return;
    var root = document.documentElement;
    root.style.setProperty('--stepper-accent',        t.accent);
    root.style.setProperty('--stepper-accent-soft',    t.accentSoft);
    root.style.setProperty('--stepper-bg-gradient',    t.gradient);
    root.style.setProperty('--stepper-border-accent',  t.border);
    localStorage.setItem(THEME_KEY, name);
  }

  function setTheme(name)    { applyTheme(name); }
  function getThemes()       { return Object.keys(THEMES); }
  function getCurrentTheme() { return localStorage.getItem(THEME_KEY) || 'default'; }

  // Restore saved theme on load
  applyTheme(getCurrentTheme());

  /* ================================================================
   * 7. KEYBOARD SHORTCUTS OVERLAY  (Ctrl+/)
   * ============================================================= */
  var SHORTCUT_DATA = {
    Navigation: [
      { label:'Command Palette',    keys:'Ctrl+K'       },
      { label:'Go to Build',        keys:'—'            },
      { label:'Go to Sheet',        keys:'—'            },
      { label:'Go to Settings',     keys:'—'            },
    ],
    Editing: [
      { label:'Save',               keys:'Ctrl+S'       },
      { label:'Undo',               keys:'Ctrl+Z'       },
      { label:'Redo',               keys:'Ctrl+Y'       },
      { label:'Find & Replace',     keys:'Ctrl+H'       },
      { label:'Select All',         keys:'Ctrl+A'       },
    ],
    Selection: [
      { label:'Select Step Up',     keys:'Shift+↑'      },
      { label:'Select Step Down',   keys:'Shift+↓'      },
      { label:'Multi-select',       keys:'Ctrl+Click'   },
    ],
    Formatting: [
      { label:'Bold',               keys:'Ctrl+B'       },
      { label:'Italic',             keys:'Ctrl+I'       },
    ],
    View: [
      { label:'Toggle Dark Mode',   keys:'—'            },
      { label:'Fullscreen',         keys:'F11'          },
      { label:'Focus Mode',         keys:'Ctrl+Shift+F' },
      { label:'Toggle Status Bar',  keys:'Ctrl+B'       },
    ],
    Tools: [
      { label:'Keyboard Shortcuts', keys:'Ctrl+/'       },
      { label:'Open Helper',        keys:'—'            },
      { label:'Print',              keys:'Ctrl+P'       },
    ]
  };

  var scOverlay = document.createElement('div');
  scOverlay.className = 'stepper-shortcuts-overlay';
  scOverlay.setAttribute('role', 'dialog');
  scOverlay.setAttribute('aria-label', 'Keyboard shortcuts');
  scOverlay.innerHTML = [
    '<div class="stepper-shortcuts-box">',
    '  <div class="stepper-shortcuts-header">',
    '    <h2>Keyboard Shortcuts</h2>',
    '    <button class="stepper-shortcuts-close" aria-label="Close">&times;</button>',
    '  </div>',
    '  <div class="stepper-shortcuts-filter-wrap">',
    '    <input class="stepper-shortcuts-filter" placeholder="Filter shortcuts…"',
    '           aria-label="Filter shortcuts" autocomplete="off" spellcheck="false"/>',
    '  </div>',
    '  <div class="stepper-shortcuts-body"></div>',
    '</div>'
  ].join('\n');
  document.body.appendChild(scOverlay);

  var scBody   = scOverlay.querySelector('.stepper-shortcuts-body');
  var scFilter = scOverlay.querySelector('.stepper-shortcuts-filter');

  function renderShortcuts(query) {
    var q = (query || '').toLowerCase();
    var html = '';
    Object.keys(SHORTCUT_DATA).forEach(function(cat) {
      var items = SHORTCUT_DATA[cat].filter(function(s) {
        if (!q) return true;
        return s.label.toLowerCase().indexOf(q) !== -1 ||
               s.keys.toLowerCase().indexOf(q)  !== -1;
      });
      if (!items.length) return;
      html += '<div class="stepper-sc-category">';
      html += '<div class="stepper-sc-category-title">' + cat + '</div>';
      html += '<div class="stepper-sc-grid">';
      items.forEach(function(s) {
        html += '<div class="stepper-sc-row">';
        html += '  <span class="stepper-sc-label">' + s.label + '</span>';
        html += '  <span class="stepper-sc-keys">' + s.keys + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    });
    scBody.innerHTML = html || '<p style="text-align:center;padding:24px;opacity:.6">No shortcuts found</p>';
  }

  function showShortcuts() {
    injectCSS();
    scFilter.value = '';
    renderShortcuts('');
    scOverlay.classList.add('open');
    requestAnimationFrame(function() { scFilter.focus(); });
  }

  function hideShortcuts() {
    scOverlay.classList.remove('open');
  }

  scFilter.addEventListener('input', function() { renderShortcuts(this.value.trim()); });
  scOverlay.querySelector('.stepper-shortcuts-close').addEventListener('click', hideShortcuts);
  scOverlay.addEventListener('click', function(e) { if (e.target === scOverlay) hideShortcuts(); });
  scOverlay.addEventListener('keydown', function(e) { if (e.key === 'Escape') hideShortcuts(); });

  /* Ctrl+/ and CustomEvent triggers */
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === '?')) {
      e.preventDefault();
      scOverlay.classList.contains('open') ? hideShortcuts() : showShortcuts();
    }
  });
  document.addEventListener('stepper-show-shortcuts', function() { showShortcuts(); });

  /* ================================================================
   * 8. SCROLL PROGRESS INDICATOR
   * ============================================================= */
  var scrollBar = document.createElement('div');
  scrollBar.className = 'stepper-scroll-progress';
  document.body.appendChild(scrollBar);

  function updateScrollProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ================================================================
   * 9. FOCUS MODE  (Ctrl+Shift+F)
   * ============================================================= */
  var focusPill = document.createElement('div');
  focusPill.className = 'stepper-focus-pill';
  focusPill.textContent = '✕  Exit Focus Mode';
  focusPill.setAttribute('role', 'button');
  focusPill.setAttribute('tabindex', '0');
  document.body.appendChild(focusPill);

  function setFocusMode(on) {
    document.documentElement.classList.toggle('stepper-focus-mode', on);
    sessionStorage.setItem(FOCUS_KEY, on ? '1' : '');
  }

  function toggleFocusMode() {
    var isOn = document.documentElement.classList.contains('stepper-focus-mode');
    setFocusMode(!isOn);
  }

  focusPill.addEventListener('click', function() { setFocusMode(false); });
  focusPill.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFocusMode(false); }
  });

  // Restore focus mode from session
  if (sessionStorage.getItem(FOCUS_KEY) === '1') setFocusMode(true);

  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      toggleFocusMode();
    }
  });

  /* ================================================================
   * 10. SMOOTH SCROLL
   * ============================================================= */
  if (!prefersReducedMotion()) {
    document.documentElement.classList.add('stepper-smooth-scroll');
  }

  /* ================================================================
   * PUBLIC API
   * ============================================================= */
  window.__stepperCoolExtras = {
    openCommandPalette:  openCommandPalette,
    closeCommandPalette: closeCommandPalette,
    confetti:            confetti,
    setTheme:            setTheme,
    getThemes:           getThemes,
    getCurrentTheme:     getCurrentTheme,
    toggleFocusMode:     toggleFocusMode,
    toggleStatusBar:     toggleStatusBar,
    showShortcuts:       showShortcuts,
    hideShortcuts:       hideShortcuts
  };

})();
