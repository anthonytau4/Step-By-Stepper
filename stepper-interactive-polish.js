/* Step by Stepper — Interactive Polish
   Adds delight around the existing editor without changing choreography data. */
(function () {
  'use strict';

  if (window.__stepperInteractivePolishInstalled) return;
  window.__stepperInteractivePolishInstalled = true;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var storageKey = 'stepper-studio-spark';
  var studioOn = false;
  var dock;
  var panel;
  var trigger;
  var toast;
  var metrics = { sections: 0, rows: 0, filled: 0, unfinished: 0 };
  var rowStates = new WeakMap();
  var updateTimer = 0;
  var closeTimer = 0;

  function safeVibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern || 9);
  }

  function injectStyles() {
    if (document.getElementById('stepper-interactive-polish-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-interactive-polish-style';
    style.textContent = [
      ':root{--sp-x:50vw;--sp-y:30vh;}',
      '#stepper-play-glow{position:fixed;inset:0;z-index:2147480000;pointer-events:none;opacity:.12;background:radial-gradient(360px circle at var(--sp-x) var(--sp-y),rgba(99,102,241,.22),transparent 72%);transition:opacity .3s ease;}',
      'body.stepper-studio-spark #stepper-play-glow{opacity:.38;background:radial-gradient(360px circle at var(--sp-x) var(--sp-y),rgba(129,140,248,.3),transparent 72%),radial-gradient(520px circle at calc(100vw - var(--sp-x)) 24%,rgba(236,72,153,.12),transparent 74%);}',
      '#stepper-play-dock{--sp-bg:rgba(255,255,255,.97);--sp-bg-2:#f8fafc;--sp-text:#111827;--sp-muted:#64748b;--sp-line:rgba(15,23,42,.14);--sp-accent:#4f46e5;--sp-accent-2:#7c3aed;position:fixed;left:max(14px,env(safe-area-inset-left));bottom:max(14px,env(safe-area-inset-bottom));z-index:2147482000;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;color:var(--sp-text);}',
      '.dark #stepper-play-dock{--sp-bg:rgba(17,24,39,.97);--sp-bg-2:#0f172a;--sp-text:#f8fafc;--sp-muted:#94a3b8;--sp-line:rgba(255,255,255,.14);--sp-accent:#818cf8;--sp-accent-2:#c084fc;}',
      '#stepper-play-trigger{min-height:48px;display:flex;align-items:center;gap:.6rem;padding:.65rem .8rem;border:1px solid var(--sp-line);border-radius:0;background:var(--sp-bg);color:var(--sp-text);box-shadow:0 14px 36px rgba(15,23,42,.2);font:inherit;font-weight:850;cursor:pointer;touch-action:manipulation;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;}',
      '#stepper-play-trigger:hover,#stepper-play-trigger[aria-expanded="true"]{transform:translateY(-2px);border-color:var(--sp-accent);box-shadow:0 18px 46px rgba(79,70,229,.2);}',
      '.stepper-play-trigger-icon{width:30px;height:30px;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--sp-accent) 45%,transparent);background:color-mix(in srgb,var(--sp-accent) 13%,transparent);color:var(--sp-accent);font-size:1rem;}',
      '.stepper-play-trigger-copy{display:grid;text-align:left;line-height:1.05;}',
      '.stepper-play-trigger-copy small{margin-top:.22rem;color:var(--sp-muted);font-size:.68rem;font-weight:750;}',
      '#stepper-play-panel{position:absolute;left:0;bottom:calc(100% + 10px);width:min(430px,calc(100vw - 28px));max-height:min(720px,calc(100vh - 88px));overflow:auto;border:1px solid var(--sp-line);border-radius:0;background:var(--sp-bg);box-shadow:0 24px 70px rgba(15,23,42,.28);opacity:0;transform:translateY(10px) scale(.985);transform-origin:left bottom;transition:opacity .18s ease,transform .18s ease;}',
      '#stepper-play-panel.is-open{opacity:1;transform:translateY(0) scale(1);}',
      '.stepper-play-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:1rem 1rem .85rem;border-bottom:1px solid var(--sp-line);}',
      '.stepper-play-head strong{display:block;font-size:1rem;}.stepper-play-head span{display:block;margin-top:.18rem;color:var(--sp-muted);font-size:.75rem;line-height:1.35;}',
      '#stepper-play-close{width:38px;height:38px;display:grid;place-items:center;flex:0 0 auto;border:1px solid var(--sp-line);border-radius:0;background:transparent;color:var(--sp-text);font:inherit;font-size:1.2rem;cursor:pointer;}',
      '.stepper-play-pulse{padding:1rem;border-bottom:1px solid var(--sp-line);background:linear-gradient(135deg,color-mix(in srgb,var(--sp-accent) 9%,transparent),transparent 62%);}',
      '.stepper-play-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem;}',
      '.stepper-play-metric{padding:.75rem .65rem;border:1px solid var(--sp-line);background:var(--sp-bg-2);text-align:center;}',
      '.stepper-play-metric strong{display:block;color:var(--sp-text);font-size:1.15rem;line-height:1;}.stepper-play-metric span{display:block;margin-top:.35rem;color:var(--sp-muted);font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;}',
      '.stepper-play-meter{height:7px;margin-top:.75rem;border:1px solid var(--sp-line);background:color-mix(in srgb,var(--sp-muted) 10%,transparent);overflow:hidden;}',
      '#stepper-play-meter-fill{height:100%;width:0;background:linear-gradient(90deg,var(--sp-accent),var(--sp-accent-2));transition:width .32s ease;}',
      '#stepper-play-pulse-copy{margin-top:.55rem;color:var(--sp-muted);font-size:.75rem;line-height:1.4;}',
      '.stepper-play-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem;padding:1rem;}',
      '.stepper-play-action{min-height:46px;display:flex;align-items:center;justify-content:flex-start;gap:.55rem;padding:.68rem .72rem;border:1px solid var(--sp-line);border-radius:0;background:var(--sp-bg-2);color:var(--sp-text);font:inherit;font-size:.78rem;font-weight:800;text-align:left;cursor:pointer;touch-action:manipulation;transition:transform .16s ease,border-color .16s ease,background .16s ease;}',
      '.stepper-play-action:hover{transform:translateY(-2px);border-color:var(--sp-accent);background:color-mix(in srgb,var(--sp-accent) 10%,var(--sp-bg-2));}',
      '.stepper-play-action b{width:27px;height:27px;display:grid;place-items:center;flex:0 0 auto;border:1px solid color-mix(in srgb,var(--sp-accent) 38%,transparent);color:var(--sp-accent);font-size:.72rem;}',
      '.stepper-play-wide{grid-column:1/-1;}',
      '.stepper-play-footer{display:grid;gap:.55rem;padding:0 1rem 1rem;}',
      '#stepper-play-studio[aria-pressed="true"]{border-color:var(--sp-accent);background:linear-gradient(135deg,color-mix(in srgb,var(--sp-accent) 18%,var(--sp-bg-2)),color-mix(in srgb,var(--sp-accent-2) 12%,var(--sp-bg-2)));}',
      '.stepper-play-truth{color:var(--sp-muted);font-size:.68rem;line-height:1.45;}',
      '#stepper-play-toast{position:absolute;left:0;bottom:calc(100% + 10px);max-width:min(360px,calc(100vw - 28px));padding:.7rem .85rem;border:1px solid var(--sp-line);background:var(--sp-bg);color:var(--sp-text);box-shadow:0 14px 36px rgba(15,23,42,.2);font-size:.76rem;font-weight:800;opacity:0;transform:translateY(6px);pointer-events:none;transition:opacity .18s ease,transform .18s ease;}',
      '#stepper-play-toast.show{opacity:1;transform:translateY(0);}',
      '.stepper-play-ripple{position:fixed;z-index:2147482500;width:12px;height:12px;border:2px solid rgba(99,102,241,.7);border-radius:50%;pointer-events:none;transform:translate(-50%,-50%) scale(.25);animation:stepper-play-ripple .58s ease-out forwards;}',
      '@keyframes stepper-play-ripple{to{opacity:0;transform:translate(-50%,-50%) scale(5.5);}}',
      '.stepper-play-spark{position:fixed;left:0;top:0;z-index:2147483000;pointer-events:none;color:#6366f1;font-size:.9rem;text-shadow:0 0 12px rgba(99,102,241,.65);animation:stepper-play-spark .72s cubic-bezier(.33,1,.68,1) forwards;}',
      '.dark .stepper-play-spark{color:#c084fc;}',
      '@keyframes stepper-play-spark{0%{opacity:0;transform:translate(var(--sx),var(--sy)) scale(.2) rotate(0)}18%{opacity:1}100%{opacity:0;transform:translate(calc(var(--sx) + var(--sdx)),calc(var(--sy) + var(--sdy))) scale(1.05) rotate(170deg)}}',
      '.stepper-play-row-complete{animation:stepper-play-row-pulse .7s ease-out;}',
      '@keyframes stepper-play-row-pulse{0%,100%{box-shadow:inherit}35%{box-shadow:0 0 0 3px rgba(99,102,241,.25),0 12px 34px rgba(99,102,241,.15)}}',
      'body.stepper-studio-spark main{background-image:radial-gradient(circle at 12% 20%,rgba(99,102,241,.035),transparent 34%),radial-gradient(circle at 88% 72%,rgba(236,72,153,.025),transparent 30%);}',
      'body:has(dialog[open]) #stepper-play-dock{opacity:.35;pointer-events:none;}',
      'body:has(#stepper-static-startup:not([hidden])) #stepper-play-dock{opacity:0;pointer-events:none;transform:translateY(10px);}',
      '@media(max-width:640px){#stepper-play-dock{left:max(9px,env(safe-area-inset-left));bottom:max(9px,env(safe-area-inset-bottom));}.stepper-play-trigger-copy>span{display:none;}#stepper-play-trigger{padding:.55rem;}.stepper-play-trigger-copy small{font-size:.64rem;}#stepper-play-panel{width:calc(100vw - 18px);max-height:calc(100dvh - 76px);}.stepper-play-actions{grid-template-columns:1fr;}.stepper-play-wide{grid-column:auto;}}',
      '@media(prefers-reduced-motion:reduce){#stepper-play-glow,.stepper-play-spark,.stepper-play-ripple,.stepper-play-row-complete{animation:none!important;transition:none!important;}#stepper-play-panel{transition:none!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function addGlow() {
    if (document.getElementById('stepper-play-glow')) return;
    var glow = document.createElement('div');
    glow.id = 'stepper-play-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
  }

  function createDock() {
    if (document.getElementById('stepper-play-dock')) return;
    dock = document.createElement('aside');
    dock.id = 'stepper-play-dock';
    dock.setAttribute('aria-label', 'Interactive editor tools');
    dock.innerHTML =
      '<button id="stepper-play-trigger" type="button" aria-expanded="false" aria-controls="stepper-play-panel">' +
        '<span class="stepper-play-trigger-icon" aria-hidden="true">✦</span>' +
        '<span class="stepper-play-trigger-copy"><span>Quick actions</span><small id="stepper-play-trigger-count">0 moves</small></span>' +
      '</button>' +
      '<section id="stepper-play-panel" hidden aria-label="Quick actions panel">' +
        '<div class="stepper-play-head"><div><strong>Choreography pulse</strong><span>Live numbers from the fields currently visible in your editor.</span></div><button id="stepper-play-close" type="button" aria-label="Close quick actions">×</button></div>' +
        '<div class="stepper-play-pulse">' +
          '<div class="stepper-play-metrics">' +
            '<div class="stepper-play-metric"><strong id="stepper-play-sections">0</strong><span>Sections</span></div>' +
            '<div class="stepper-play-metric"><strong id="stepper-play-filled">0</strong><span>Moves filled</span></div>' +
            '<div class="stepper-play-metric"><strong id="stepper-play-unfinished">0</strong><span>Need fields</span></div>' +
          '</div>' +
          '<div class="stepper-play-meter" aria-hidden="true"><div id="stepper-play-meter-fill"></div></div>' +
          '<p id="stepper-play-pulse-copy">Add move names and details to fill the pulse.</p>' +
        '</div>' +
        '<div class="stepper-play-actions">' +
          '<button class="stepper-play-action" type="button" data-stepper-target="Build"><b>B</b>Build</button>' +
          '<button class="stepper-play-action" type="button" data-stepper-target="Sheet"><b>S</b>Sheet</button>' +
          '<button class="stepper-play-action" type="button" data-stepper-target="Templates"><b>T</b>Templates</button>' +
          '<button class="stepper-play-action" type="button" data-stepper-target="Music"><b>♫</b>Music</button>' +
          '<button class="stepper-play-action" type="button" data-stepper-target="PDF Import"><b>PDF</b>PDF Import</button>' +
          '<button class="stepper-play-action" type="button" data-stepper-target="Glossary"><b>G</b>Glossary</button>' +
          '<button class="stepper-play-action stepper-play-wide" id="stepper-play-next" type="button"><b>→</b>Jump to next unfinished field</button>' +
        '</div>' +
        '<div class="stepper-play-footer">' +
          '<button class="stepper-play-action stepper-play-wide" id="stepper-play-studio" type="button" aria-pressed="false"><b>✦</b><span>Studio Spark mode</span></button>' +
          '<p class="stepper-play-truth">The pulse only counts visible sections and filled move fields. It does not grade choreography, promise correctness, or change saved data. Shortcut: Ctrl/⌘ + K.</p>' +
        '</div>' +
      '</section>' +
      '<div id="stepper-play-toast" role="status" aria-live="polite"></div>';
    document.body.appendChild(dock);
    panel = document.getElementById('stepper-play-panel');
    trigger = document.getElementById('stepper-play-trigger');
    toast = document.getElementById('stepper-play-toast');
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toast.classList.remove('show');
    }, 1900);
  }

  function openPanel() {
    if (!panel || !trigger) return;
    window.clearTimeout(closeTimer);
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(function () {
      panel.classList.add('is-open');
    });
    scheduleUpdate();
  }

  function closePanel() {
    if (!panel || !trigger || panel.hidden) return;
    panel.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    closeTimer = window.setTimeout(function () {
      panel.hidden = true;
    }, reducedMotion ? 0 : 190);
  }

  function togglePanel() {
    if (!panel || panel.hidden) openPanel();
    else closePanel();
  }

  function getRows() {
    return Array.prototype.map.call(
      document.querySelectorAll('input[placeholder="Move Name"]'),
      function (input) {
        return input.closest('.group.grid') || input.closest('[class*="group"]') || input.parentElement;
      }
    ).filter(function (row, index, rows) {
      return row && rows.indexOf(row) === index;
    });
  }

  function rowFields(row) {
    return {
      name: row && row.querySelector('input[placeholder="Move Name"]'),
      details: row && row.querySelector('input[placeholder="Move details..."]')
    };
  }

  function rowIsFilled(row) {
    var fields = rowFields(row);
    return !!(fields.name && fields.details && fields.name.value.trim() && fields.details.value.trim());
  }

  function readMetrics() {
    var rows = getRows();
    var filled = rows.filter(rowIsFilled).length;
    var sections = document.querySelectorAll('input[placeholder="Section Title..."]').length;
    return {
      sections: sections,
      rows: rows.length,
      filled: filled,
      unfinished: Math.max(rows.length - filled, 0)
    };
  }

  function updatePulse() {
    window.clearTimeout(updateTimer);
    metrics = readMetrics();
    var percent = metrics.rows ? Math.round((metrics.filled / metrics.rows) * 100) : 0;
    var sectionEl = document.getElementById('stepper-play-sections');
    var filledEl = document.getElementById('stepper-play-filled');
    var unfinishedEl = document.getElementById('stepper-play-unfinished');
    var countEl = document.getElementById('stepper-play-trigger-count');
    var meter = document.getElementById('stepper-play-meter-fill');
    var copy = document.getElementById('stepper-play-pulse-copy');
    if (sectionEl) sectionEl.textContent = String(metrics.sections);
    if (filledEl) filledEl.textContent = String(metrics.filled);
    if (unfinishedEl) unfinishedEl.textContent = String(metrics.unfinished);
    if (countEl) countEl.textContent = metrics.rows ? metrics.filled + '/' + metrics.rows + ' moves filled' : '0 visible moves';
    if (meter) meter.style.width = percent + '%';
    if (copy) {
      if (!metrics.rows) copy.textContent = 'Open Build to see the live choreography pulse.';
      else if (!metrics.unfinished) copy.textContent = 'Every visible move has both a name and details.';
      else copy.textContent = metrics.unfinished + ' visible move' + (metrics.unfinished === 1 ? '' : 's') + ' still need a name or details.';
    }
    getRows().forEach(function (row) {
      if (!rowStates.has(row)) rowStates.set(row, rowIsFilled(row));
    });
  }

  function scheduleUpdate() {
    window.clearTimeout(updateTimer);
    updateTimer = window.setTimeout(updatePulse, 90);
  }

  function spawnSpark(x, y, dx, dy) {
    if (reducedMotion) return;
    var spark = document.createElement('span');
    spark.className = 'stepper-play-spark';
    spark.textContent = Math.random() > .45 ? '✦' : '·';
    spark.style.setProperty('--sx', x + 'px');
    spark.style.setProperty('--sy', y + 'px');
    spark.style.setProperty('--sdx', dx + 'px');
    spark.style.setProperty('--sdy', dy + 'px');
    document.body.appendChild(spark);
    window.setTimeout(function () { spark.remove(); }, 760);
  }

  function burst(x, y, amount) {
    for (var i = 0; i < amount; i += 1) {
      var angle = Math.PI * 2 * i / amount + Math.random() * .28;
      var distance = 25 + Math.random() * 48;
      spawnSpark(x, y, Math.cos(angle) * distance, Math.sin(angle) * distance);
    }
  }

  function ripple(x, y) {
    if (reducedMotion) return;
    var ring = document.createElement('span');
    ring.className = 'stepper-play-ripple';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    document.body.appendChild(ring);
    window.setTimeout(function () { ring.remove(); }, 620);
  }

  function applyStudioMode(on, celebrate) {
    studioOn = !!on;
    document.body.classList.toggle('stepper-studio-spark', studioOn);
    var button = document.getElementById('stepper-play-studio');
    if (button) {
      button.setAttribute('aria-pressed', String(studioOn));
      var label = button.querySelector('span');
      if (label) label.textContent = studioOn ? 'Studio Spark mode on' : 'Studio Spark mode';
    }
    try { localStorage.setItem(storageKey, studioOn ? 'on' : 'off'); } catch (_) {}
    if (studioOn && celebrate && button) {
      var rect = button.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
      safeVibrate([10, 30, 10]);
    }
  }

  function findExistingButton(label) {
    return Array.prototype.find.call(document.querySelectorAll('button'), function (button) {
      if (button.closest('#stepper-play-dock')) return false;
      var text = (button.textContent || '').trim();
      return (text === label || text.indexOf(label + ' ') === 0 || text.indexOf(label + ' (') === 0) && button.offsetParent !== null;
    }) || null;
  }

  function openExisting(label) {
    var button = findExistingButton(label);
    if (!button) {
      showToast(label + ' is not ready on this screen yet.');
      return;
    }
    closePanel();
    button.click();
    showToast('Opened ' + label + '.');
  }

  function nextUnfinished() {
    var row = getRows().find(function (candidate) { return !rowIsFilled(candidate); });
    if (!row) {
      showToast(metrics.rows ? 'Every visible move has both fields filled.' : 'Open Build to find move fields.');
      return;
    }
    var fields = rowFields(row);
    var target = fields.name && !fields.name.value.trim() ? fields.name : fields.details;
    closePanel();
    window.setTimeout(function () {
      if (!target) return;
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      target.focus({ preventScroll: true });
      safeVibrate(7);
    }, 210);
  }

  function celebrateFilledRow(row) {
    if (!row) return;
    var rect = row.getBoundingClientRect();
    row.classList.remove('stepper-play-row-complete');
    void row.offsetWidth;
    row.classList.add('stepper-play-row-complete');
    burst(rect.left + rect.width / 2, Math.max(18, rect.top + Math.min(rect.height / 2, 60)), 12);
    safeVibrate(12);
    showToast('Move fields filled.');
    window.setTimeout(function () {
      row.classList.remove('stepper-play-row-complete');
    }, 760);
  }

  function maybeCelebrateSheet() {
    var latest = readMetrics();
    if (!latest.filled) return;
    var x = window.innerWidth / 2;
    var y = Math.min(window.innerHeight * .35, 280);
    burst(x, y, 20);
    safeVibrate([8, 24, 8]);
  }

  function wireEvents() {
    trigger.addEventListener('click', togglePanel);
    document.getElementById('stepper-play-close').addEventListener('click', closePanel);
    document.getElementById('stepper-play-next').addEventListener('click', nextUnfinished);
    document.getElementById('stepper-play-studio').addEventListener('click', function () {
      applyStudioMode(!studioOn, true);
    });

    dock.querySelectorAll('[data-stepper-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        openExisting(button.getAttribute('data-stepper-target'));
      });
    });

    document.addEventListener('pointermove', function (event) {
      document.documentElement.style.setProperty('--sp-x', event.clientX + 'px');
      document.documentElement.style.setProperty('--sp-y', event.clientY + 'px');
    }, { passive: true });

    document.addEventListener('pointerdown', function (event) {
      var button = event.target.closest && event.target.closest('button,[role="button"]');
      if (!button) return;
      ripple(event.clientX, event.clientY);
      if (studioOn) spawnSpark(event.clientX, event.clientY, (Math.random() - .5) * 32, -24 - Math.random() * 20);
    }, { passive: true });

    document.addEventListener('click', function (event) {
      var button = event.target.closest && event.target.closest('button');
      if (button && !button.closest('#stepper-play-dock') && (button.textContent || '').trim() === 'Sheet') {
        window.setTimeout(maybeCelebrateSheet, 80);
      }
      if (!panel.hidden && !dock.contains(event.target)) closePanel();
    }, true);

    document.addEventListener('input', function (event) {
      var target = event.target;
      if (!(target instanceof HTMLElement)) return;
      var row = target.closest('.group.grid') || target.closest('[class*="group"]');
      if (row && row.querySelector('input[placeholder="Move Name"]')) {
        var before = rowStates.get(row) === true;
        var now = rowIsFilled(row);
        rowStates.set(row, now);
        if (now && !before && event.isTrusted) celebrateFilledRow(row);
      }
      scheduleUpdate();
    }, true);

    document.addEventListener('change', scheduleUpdate, true);

    document.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        togglePanel();
      }
      if (event.key === 'Escape' && panel && !panel.hidden) closePanel();
    });

    var mainObserver = new MutationObserver(scheduleUpdate);
    var attachObserver = function () {
      var main = document.querySelector('main');
      if (main && !main.__stepperPlayObserved) {
        main.__stepperPlayObserved = true;
        mainObserver.observe(main, { childList: true, subtree: true });
      }
    };
    attachObserver();
    window.setInterval(function () {
      attachObserver();
      updatePulse();
    }, 1300);
  }

  function boot() {
    injectStyles();
    addGlow();
    createDock();
    wireEvents();
    try {
      applyStudioMode(localStorage.getItem(storageKey) === 'on', false);
    } catch (_) {
      applyStudioMode(false, false);
    }
    updatePulse();
    window.setTimeout(updatePulse, 500);
    window.setTimeout(updatePulse, 1400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
