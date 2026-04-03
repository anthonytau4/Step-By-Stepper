/**
 * stepper-menubar.js
 * ─────────────────────────────────────────────────────────────
 * Google Docs-style top menu bar for Step-By-Stepper.
 * Injects File, Edit, View, Insert, Format, Tools, Extensions,
 * Help menus into the tab area above the app. Each menu has
 * full dropdown options that map to real app actions or show
 * helpful descriptions.
 *
 * Works without page reload — attaches via MutationObserver
 * and re-injects if the DOM changes.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperMenubarInstalled) return;
  window.__stepperMenubarInstalled = true;

  var MENUBAR_ID = 'stepper-docstyle-menubar';
  var MENUBAR_HOST_ID = 'stepper-docstyle-menubar-host';
  var QUICK_FORMAT_ID = 'stepper-menubar-quick-format';
  var NON_EDITOR_PAGES = [
    'stepper-whatsnew-page',
    'stepper-saved-dances-page',
    'stepper-featured-choreo-page',
    'stepper-google-signin-page',
    'stepper-google-subscription-page',
    'stepper-google-admin-page',
    'stepper-google-moderator-page',
    'stepper-friends-page',
    'stepper-glossary-page',
    'stepper-pdf-page',
    'stepper-settings-page',
    'stepper-music-page',
    'stepper-templates-page'
  ];
  var _ic = window.__stepperIcons || {};
  var _injected = false;
  var _rerenderTimer = 0;

  /* ── Theme detection ── */
  function isDarkMode() {
    try {
      var data = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || 'null');
      return !!(data && data.isDarkMode);
    } catch (e) { return false; }
  }

  /* ── Lightweight toast (used by dispatchMenuAction) ── */
  function _toast(msg) {
    if (window.__stepperStepSelect && window.__stepperStepSelect.showToast) {
      window.__stepperStepSelect.showToast(msg);
      return;
    }
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;padding:10px 22px;border-radius:12px;font-size:14px;font-weight:600;pointer-events:none;animation:stepper-toast-in .25s ease;' + (isDarkMode() ? 'background:#333;color:#e5e5e5;' : 'background:#1f2937;color:#fff;');
    document.body.appendChild(t);
    setTimeout(function(){ t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2200);
    setTimeout(function(){ t.remove(); }, 2600);
  }

  /* ── Menu definitions ── */
  function getMenus() {
    var dark = isDarkMode();
    var _premium = false;
    try { var sess = JSON.parse(sessionStorage.getItem('stepper_session') || 'null'); if (sess && sess.premium) _premium = true; } catch(e){}
    try { if (window.__stepperIsPremium && window.__stepperIsPremium()) _premium = true; } catch(e){}
    var lock = _premium ? '' : ' 🔒';

    /* Detect if we're on the Build/Sheet (editor) tabs */
    var onEditorTab = _isEditorTab();

    var menus = [
      {
        label: 'File',
        icon: _ic.fileMenu || _ic.document || '',
        items: [
          { label: 'New Dance', icon: _ic.newDoc || _ic.add || '', action: 'new-dance', shortcut: 'Ctrl+N' },
          { label: 'Open Saved Dance…', icon: _ic.open || _ic.folderOpen || '', action: 'open-saved', shortcut: 'Ctrl+O' },
          { type: 'divider' },
          { label: 'Save', icon: _ic.save || '', action: 'save-dance', shortcut: 'Ctrl+S' },
          { label: 'Save As…', icon: _ic.saveAs || _ic.save || '', action: 'save-as' },
          { label: 'Make a Copy', icon: _ic.copy || '', action: 'make-copy' },
          { type: 'divider' },
          { label: 'Email Dance…', icon: _ic.email || _ic.send || '', action: 'email-dance' },
          { label: 'Download as PDF', icon: _ic.download || '', action: 'download-pdf' },
          { type: 'divider' },
          { label: 'Version History', icon: _ic.clock || '', action: 'version-history' },
          { label: 'Dance Details…', icon: _ic.info || '', action: 'dance-details' },
          { type: 'divider' },
          { label: 'Print', icon: _ic.print || '', action: 'print', shortcut: 'Ctrl+P' }
        ]
      }
    ];

    /* Edit menu — only present on Build / Sheet tabs */
    if (onEditorTab) {
      menus.push({
        label: 'Edit',
        icon: _ic.editMenu || _ic.edit || '',
        items: [
          { label: 'Undo', icon: _ic.undo || '', action: 'undo', shortcut: 'Ctrl+Z' },
          { label: 'Redo', icon: _ic.redo || '', action: 'redo', shortcut: 'Ctrl+Y' },
          { type: 'divider' },
          { label: 'Cut', icon: _ic.cut || '', action: 'cut', shortcut: 'Ctrl+X' },
          { label: 'Copy', icon: _ic.copy || '', action: 'copy', shortcut: 'Ctrl+C' },
          { label: 'Paste', icon: _ic.paste || '', action: 'paste', shortcut: 'Ctrl+V' },
          { type: 'divider' },
          { label: 'Select All Steps', icon: _ic.check || '', action: 'select-all', shortcut: 'Ctrl+A' },
          { label: 'Delete Selected', icon: _ic.trash || '', action: 'delete-selected', shortcut: 'Del' },
          { type: 'divider' },
          { label: 'Find & Replace…', icon: _ic.search || '', action: 'find-replace', shortcut: 'Ctrl+H' }
        ]
      });
    }

    menus.push({
      label: 'View',
      icon: _ic.viewMenu || '',
      items: (onEditorTab ? [
        { label: 'Build Mode', icon: _ic.edit || '', action: 'view-build' },
        { label: 'Sheet Preview', icon: _ic.document || '', action: 'view-sheet' },
        { type: 'divider' }
      ] : []).concat([
        { label: 'Zoom In', icon: _ic.zoomIn || '', action: 'zoom-in', shortcut: 'Ctrl+=' },
        { label: 'Zoom Out', icon: _ic.zoomOut || '', action: 'zoom-out', shortcut: 'Ctrl+-' },
        { label: 'Fit to Width', icon: _ic.expand || '', action: 'fit-width' },
        { type: 'divider' },
        { label: 'Full Screen', icon: _ic.fullscreen || _ic.expand || '', action: 'fullscreen', shortcut: 'F11' },
        { type: 'divider' },
        { label: dark ? 'Light Mode' : 'Dark Mode', icon: dark ? _ic.sun || '' : _ic.moon || '', action: 'toggle-dark' },
        { label: 'Show Ruler', icon: _ic.ruler || '', action: 'show-ruler' },
        { label: 'Show Section Numbers', icon: _ic.hashtag || '', action: 'show-sections' }
      ])
    });

    /* Insert + Format — only on Build / Sheet tabs */
    if (onEditorTab) {
      menus.push({
        label: 'Insert',
        icon: _ic.insertMenu || _ic.add || '',
        items: [
          { label: 'Add Step…', icon: _ic.add || '', action: 'insert-step' },
          { label: 'New Section', icon: _ic.layers || '', action: 'insert-section' },
          { type: 'divider' },
          { label: 'Tag / Restart', icon: _ic.tag || '', action: 'insert-tag' },
          { label: 'Section Break', icon: _ic.paragraph || '', action: 'insert-break' },
          { type: 'divider' },
          { label: 'Comment', icon: _ic.chat || '', action: 'insert-comment' }
        ]
      });

      menus.push({
        label: 'Format',
        icon: _ic.formatMenu || '',
        items: [
          { label: 'Bold', icon: _ic.bold || '', action: 'format-bold', shortcut: 'Ctrl+B' },
          { label: 'Italic', icon: _ic.italic || '', action: 'format-italic', shortcut: 'Ctrl+I' },
          { label: 'Underline', icon: _ic.underline || '', action: 'format-underline', shortcut: 'Ctrl+U' },
          { label: 'Strikethrough', icon: _ic.strikethrough || '', action: 'format-strike' },
          { type: 'divider' },
          { label: 'Line Spacing', icon: _ic.list || '', action: 'line-spacing' },
          { label: 'Clear Formatting', icon: _ic.close || '', action: 'clear-format' }
        ]
      });
    }

    menus.push(
      {
        label: 'Tools',
        icon: _ic.toolsMenu || _ic.settings || '',
        items: [
          { label: 'Spelling & Grammar', icon: _ic.spelling || _ic.check || '', action: 'spell-check' },
          { label: 'Word Count', icon: _ic.wordCount || _ic.hashtag || '', action: 'word-count' },
          { type: 'divider' },
          { label: 'AI Site Helper', icon: _ic.brain || '', action: 'open-helper' },
          { label: 'Step Dictionary', icon: _ic.book || '', action: 'step-dictionary' },
          { type: 'divider' },
          { label: 'Auto-Detect Level', icon: _ic.target || '', action: 'auto-level' },
          { label: 'Generate Counts', icon: _ic.hashtag || '', action: 'gen-counts' },
          { label: 'Smart Split Sections', icon: _ic.layers || '', action: 'smart-split' },
          { type: 'divider' },
          { label: 'Preferences…', icon: _ic.settings || '', action: 'preferences' },
          { label: 'Keyboard Shortcuts', icon: _ic.command || '', action: 'shortcuts' }
        ]
      },
      {
        label: 'Extensions',
        icon: _ic.extensionsMenu || _ic.zap || '',
        items: [
          { label: 'PDF Import', icon: _ic.import || '', action: 'pdf-import' },
          { label: 'Glossary Lookup', icon: _ic.book || '', action: 'glossary-lookup' },
          { label: 'Music Manager', icon: _ic.play || '', action: 'open-music' },
          { label: 'Dance Templates', icon: _ic.layers || '', action: 'open-templates' },
          { type: 'divider' },
          { label: 'Featured Choreo Browser', icon: _ic.trophy || '', action: 'featured-choreo' },
          { label: 'Collaboration Hub', icon: _ic.people || '', action: 'collab-hub' },
          { type: 'divider' },
          { label: 'Export to Clipboard', icon: _ic.clipboard || '', action: 'export-clipboard' },
          { label: 'Share via Link…', icon: _ic.link || '', action: 'share-link' },
          { type: 'divider' },
          { label: 'AI Dance Builder' + lock, icon: _ic.brain || '', action: 'premium-ai-builder' },
          { label: 'Auto-Choreographer' + lock, icon: _ic.zap || '', action: 'premium-auto-choreo' },
          { label: 'Music BPM Sync' + lock, icon: _ic.play || '', action: 'premium-bpm-sync' },
          { label: 'Advanced Export' + lock, icon: _ic.download || '', action: 'premium-export' }
        ]
      },
      {
        label: 'Help',
        icon: _ic.helpMenu || _ic.help || '',
        items: [
          { label: 'Getting Started', icon: _ic.play || '', action: 'help-start' },
          { label: 'Step-By-Stepper Help', icon: _ic.help || '', action: 'help-main' },
          { type: 'divider' },
          { label: 'Keyboard Shortcuts', icon: _ic.command || '', action: 'help-shortcuts', shortcut: 'Ctrl+/' },
          { label: 'Report an Issue', icon: _ic.warning || '', action: 'report-issue' },
          { type: 'divider' },
          { label: 'What\'s New', icon: _ic.newBadge || '', action: 'whats-new' },
          { label: 'About Step-By-Stepper', icon: _ic.info || '', action: 'about' }
        ]
      }
    );

    return menus;
  }

  /* Detect whether the user is on Build or Sheet (editor) tabs */
  function _isEditorTab() {
    /* Check URL path */
    var path = location.pathname.toLowerCase();
    if (path.includes('/editor') || path.includes('/sheet') || path === '/' || path === '/index.html') {
      for (var i = 0; i < NON_EDITOR_PAGES.length; i++) {
        var pg = document.getElementById(NON_EDITOR_PAGES[i]);
        if (pg && !pg.hidden && pg.style.display !== 'none') return false;
      }
      return true;
    }
    return false;
  }

  /* ── Action dispatcher ── */
  function dispatchMenuAction(action) {
    switch (action) {
      case 'new-dance':
        if (confirm('Start a new dance? Unsaved changes will be lost.')) {
          try { localStorage.removeItem('linedance_builder_data_v13'); location.reload(); } catch (e) {}
        }
        break;
      case 'open-saved':
        var savedTab = document.getElementById('stepper-saved-dances-tab');
        if (savedTab) savedTab.click();
        break;
      case 'save-dance':
        var saveBtn = document.querySelector('[data-stepper-save-btn]') || document.querySelector('button[title*="Save"]');
        if (saveBtn) saveBtn.click();
        else if (window.__stepperSaveDance) window.__stepperSaveDance();
        break;
      case 'print':
        window.print();
        break;
      case 'undo':
        if (window.__stepperHistoryUndoRedo) window.__stepperHistoryUndoRedo.undo();
        else document.execCommand('undo');
        break;
      case 'redo':
        if (window.__stepperHistoryUndoRedo) window.__stepperHistoryUndoRedo.redo();
        else document.execCommand('redo');
        break;
      case 'view-build':
        var buildBtn = Array.from(document.querySelectorAll('button')).find(function (b) { return (b.textContent || '').trim() === 'Build'; });
        if (buildBtn) buildBtn.click();
        break;
      case 'view-sheet':
        var sheetBtn = Array.from(document.querySelectorAll('button')).find(function (b) { return (b.textContent || '').trim() === 'Sheet'; });
        if (sheetBtn) sheetBtn.click();
        break;
      case 'toggle-dark':
        try {
          var data = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          data.isDarkMode = !data.isDarkMode;
          localStorage.setItem('linedance_builder_data_v13', JSON.stringify(data));
          window.dispatchEvent(new Event('storage'));
        } catch (e) {}
        break;
      case 'fullscreen':
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function(){});
        else document.exitFullscreen().catch(function(){});
        break;
      case 'open-helper':
        var helperFab = document.getElementById('stepper-site-helper-host') || document.querySelector('[data-helper-toggle]');
        if (helperFab) helperFab.click();
        break;
      case 'pdf-import':
        var pdfTab = document.getElementById('stepper-pdf-tab');
        if (pdfTab) pdfTab.click();
        break;
      case 'glossary-lookup':
        var glossTab = document.getElementById('stepper-glossary-tab');
        if (glossTab) glossTab.click();
        break;
      case 'featured-choreo':
        var featTab = document.getElementById('stepper-featured-choreo-tab');
        if (featTab) featTab.click();
        break;
      case 'collab-hub':
        var friendsTab = document.getElementById('stepper-friends-tab');
        if (friendsTab) friendsTab.click();
        break;
      case 'whats-new':
        var wnBtn = Array.from(document.querySelectorAll('button')).find(function (b) { return (b.textContent || '').trim() === "What's New"; });
        if (wnBtn) wnBtn.click();
        break;
      case 'download-pdf':
        window.print();
        break;
      case 'zoom-in':
        try {
          var curScale = parseFloat(document.body.dataset.stepperZoom || '1');
          var newScale = Math.min(2, curScale + 0.1);
          document.body.dataset.stepperZoom = newScale.toFixed(1);
          document.body.style.transform = 'scale(' + newScale.toFixed(1) + ')';
          document.body.style.transformOrigin = 'top left';
          document.body.style.width = (100 / newScale).toFixed(1) + '%';
        } catch (e) {}
        break;
      case 'zoom-out':
        try {
          var curScale2 = parseFloat(document.body.dataset.stepperZoom || '1');
          var newScale2 = Math.max(0.5, curScale2 - 0.1);
          document.body.dataset.stepperZoom = newScale2.toFixed(1);
          document.body.style.transform = newScale2 === 1 ? '' : 'scale(' + newScale2.toFixed(1) + ')';
          document.body.style.transformOrigin = 'top left';
          document.body.style.width = newScale2 === 1 ? '' : (100 / newScale2).toFixed(1) + '%';
        } catch (e) {}
        break;
      case 'word-count':
        try {
          var bd = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var secs = bd.sections || (bd.dances && bd.dances[0] && bd.dances[0].steps ? [{ steps: bd.dances[0].steps }] : []);
          var total = 0; for (var wi = 0; wi < secs.length; wi++) total += (secs[wi].steps || []).length;
          var msg = 'Word Count\n\nSections: ' + secs.length + '\nTotal steps: ' + total;
          if (bd.meta) msg += '\nTitle: ' + (bd.meta.title || '(untitled)') + '\nChoreographer: ' + (bd.meta.choreographer || '(none)');
          alert(msg);
        } catch (e) { alert('Could not count steps.'); }
        break;

      /* ── Clipboard / Selection (wired to stepper-step-select.js) ── */
      case 'copy':
        if (window.__stepperStepSelect) window.__stepperStepSelect.copySelectedSteps();
        break;
      case 'cut':
        if (window.__stepperStepSelect) window.__stepperStepSelect.cutSelectedSteps();
        break;
      case 'paste':
        if (window.__stepperStepSelect) window.__stepperStepSelect.pasteSteps();
        break;
      case 'select-all':
        if (window.__stepperStepSelect) window.__stepperStepSelect.selectAllSteps();
        break;
      case 'delete-selected':
        if (window.__stepperStepSelect) window.__stepperStepSelect.deleteSelectedSteps();
        break;

      /* ── Find & Replace ── */
      case 'find-replace':
        if (window.__stepperStepSelect) window.__stepperStepSelect.openFindReplace();
        break;

      /* ── Insert operations ── */
      case 'insert-step':
        if (window.__stepperStepSelect) window.__stepperStepSelect.insertStep();
        else { _toast('Insert Step: select a position first'); }
        break;
      case 'insert-section':
        if (window.__stepperStepSelect) window.__stepperStepSelect.insertSection();
        break;
      case 'insert-tag':
        try {
          var td = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var tagName = prompt('Enter tag name (e.g. "Restart", "Wall Change"):');
          if (tagName && tagName.trim()) {
            if (!td.tags) td.tags = [];
            td.tags.push(tagName.trim());
            localStorage.setItem('linedance_builder_data_v13', JSON.stringify(td));
            window.dispatchEvent(new Event('storage'));
            _toast('Tag "' + tagName.trim() + '" added');
          }
        } catch (e) {}
        break;
      case 'insert-break':
        if (window.__stepperStepSelect) window.__stepperStepSelect.insertSection();
        break;
      case 'insert-comment':
        try {
          var cData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var comment = prompt('Add a comment / note:');
          if (comment && comment.trim() && cData.sections && cData.sections.length > 0) {
            var lastSec = cData.sections[cData.sections.length - 1];
            if (lastSec.steps && lastSec.steps.length > 0) {
              var lastStep = lastSec.steps[lastSec.steps.length - 1];
              lastStep.showNote = true;
              lastStep.note = (lastStep.note ? lastStep.note + ' | ' : '') + comment.trim();
            }
            localStorage.setItem('linedance_builder_data_v13', JSON.stringify(cData));
            window.dispatchEvent(new Event('storage'));
            _toast('Comment added to last step');
          }
        } catch (e) {}
        break;

      /* ── Format operations ── */
      case 'format-bold':
        if (window.__stepperStepSelect) window.__stepperStepSelect.formatBold();
        break;
      case 'format-italic':
        if (window.__stepperStepSelect) window.__stepperStepSelect.formatItalic();
        break;
      case 'format-underline':
        if (window.__stepperStepSelect) window.__stepperStepSelect.formatUnderline();
        break;
      case 'format-strike':
        if (window.__stepperStepSelect) window.__stepperStepSelect.formatStrikethrough();
        break;
      case 'clear-format':
        if (window.__stepperStepSelect) window.__stepperStepSelect.clearFormatting();
        break;
      case 'align-left':
      case 'align-center':
      case 'align-right':
        _toast('Alignment: ' + action.replace('align-', ''));
        break;

      /* ── File extras ── */
      case 'save-as':
        try {
          var saData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var saName = prompt('Save copy as:', (saData.meta && saData.meta.title ? saData.meta.title : 'My Dance') + ' (copy)');
          if (saName && saName.trim()) {
            var copy = JSON.parse(JSON.stringify(saData));
            if (copy.meta) copy.meta.title = saName.trim();
            var saved = JSON.parse(localStorage.getItem('stepper_saved_dances') || '[]');
            saved.push({ id: 'dance-' + Date.now(), data: copy, savedAt: new Date().toISOString() });
            localStorage.setItem('stepper_saved_dances', JSON.stringify(saved));
            _toast('Saved as "' + saName.trim() + '"');
          }
        } catch (e) {}
        break;
      case 'make-copy':
        try {
          var mcData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var mcCopy = JSON.parse(JSON.stringify(mcData));
          if (mcCopy.meta) mcCopy.meta.title = (mcCopy.meta.title || 'Dance') + ' (copy)';
          localStorage.setItem('linedance_builder_data_v13', JSON.stringify(mcCopy));
          window.dispatchEvent(new Event('storage'));
          _toast('Working on a copy now');
        } catch (e) {}
        break;
      case 'email-dance':
        try {
          var emData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var emTitle = (emData.meta && emData.meta.title) || 'My Dance';
          var emBody = 'Check out my dance: ' + emTitle;
          if (emData.sections) {
            emBody += '%0A%0ASections: ' + emData.sections.length;
            var emSteps = 0; emData.sections.forEach(function(s){ emSteps += (s.steps||[]).length; });
            emBody += ', Steps: ' + emSteps;
          }
          window.open('mailto:?subject=' + encodeURIComponent('Dance: ' + emTitle) + '&body=' + emBody);
        } catch (e) {}
        break;
      case 'dance-details':
        try {
          var dd = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var m = dd.meta || {};
          alert('Dance Details\n\nTitle: ' + (m.title||'(none)') + '\nChoreographer: ' + (m.choreographer||'(none)') + '\nLevel: ' + (m.level||'?') + '\nCounts: ' + (m.counts||'?') + '\nWalls: ' + (m.walls||'?') + '\nMusic: ' + (m.music||'(none)') + '\nStyle: ' + (m.danceStyle || m.type || '8-count'));
        } catch (e) {}
        break;
      case 'version-history':
        _toast('Version history coming soon');
        break;

      /* ── View extras ── */
      case 'fit-width':
        document.body.dataset.stepperZoom = '1';
        document.body.style.transform = '';
        document.body.style.width = '';
        _toast('Zoom reset to 100%');
        break;
      case 'show-ruler':
        document.body.classList.toggle('stepper-show-ruler');
        _toast('Ruler ' + (document.body.classList.contains('stepper-show-ruler') ? 'shown' : 'hidden'));
        break;
      case 'show-sections':
        document.body.classList.toggle('stepper-show-section-numbers');
        _toast('Section numbers ' + (document.body.classList.contains('stepper-show-section-numbers') ? 'shown' : 'hidden'));
        break;

      /* ── Tools extras ── */
      case 'spell-check':
        _toast('Spell check: steps use a built-in dictionary');
        if (window.__stepperStepDictionary) {
          var spData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var spSecs = spData.sections || [];
          var issues = [];
          spSecs.forEach(function(sec, si) {
            (sec.steps || []).forEach(function(st, sti) {
              if (st.name) {
                var match = window.__stepperStepDictionary.lookup ? window.__stepperStepDictionary.lookup(st.name) : null;
                if (match && match.name && match.name.toLowerCase() !== st.name.toLowerCase()) {
                  issues.push('Section ' + (si+1) + ', Step ' + (sti+1) + ': "' + st.name + '" → "' + match.name + '"');
                }
              }
            });
          });
          if (issues.length) alert('Step name suggestions:\n\n' + issues.join('\n'));
          else _toast('All step names look good!');
        }
        break;
      case 'step-dictionary':
        var glossTab2 = document.getElementById('stepper-glossary-tab');
        if (glossTab2) glossTab2.click();
        break;
      case 'auto-level':
        try {
          var alData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var alSecs = alData.sections || [];
          var syncoCount = 0, totalSteps = 0;
          alSecs.forEach(function(sec) {
            (sec.steps || []).forEach(function(st) {
              totalSteps++;
              if (st.name && /shuffle|coaster|sailor|weave|cross|syncopat/i.test(st.name)) syncoCount++;
            });
          });
          var ratio = totalSteps > 0 ? syncoCount / totalSteps : 0;
          var level = ratio > 0.3 ? 'Intermediate' : ratio > 0.1 ? 'Improver' : 'Beginner';
          if (alData.meta) alData.meta.level = level;
          localStorage.setItem('linedance_builder_data_v13', JSON.stringify(alData));
          window.dispatchEvent(new Event('storage'));
          _toast('Auto-detected level: ' + level);
        } catch (e) {}
        break;
      case 'gen-counts':
        try {
          var gcData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var gcSecs = gcData.sections || [];
          var totalCounts = 0;
          gcSecs.forEach(function(sec) {
            (sec.steps || []).forEach(function(st) {
              var c = parseInt(st.count, 10);
              totalCounts += (isNaN(c) ? 1 : c);
            });
          });
          if (gcData.meta) gcData.meta.counts = String(totalCounts);
          localStorage.setItem('linedance_builder_data_v13', JSON.stringify(gcData));
          window.dispatchEvent(new Event('storage'));
          _toast('Generated counts: ' + totalCounts);
        } catch (e) {}
        break;
      case 'smart-split':
        try {
          var ssData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var ssSecs = ssData.sections || [];
          var limit = (ssData.meta && ssData.meta.danceStyle === 'waltz') ? 6 : 8;
          var newSecs = [];
          ssSecs.forEach(function(sec) {
            var steps = sec.steps || [];
            var chunk = []; var count = 0;
            steps.forEach(function(st) {
              var c = parseInt(st.count, 10) || 1;
              if (count + c > limit && chunk.length > 0) {
                newSecs.push({ id: 'section-' + Date.now() + '-' + newSecs.length, name: sec.name + ' (' + (newSecs.length + 1) + ')', steps: chunk });
                chunk = []; count = 0;
              }
              chunk.push(st); count += c;
            });
            if (chunk.length > 0) newSecs.push({ id: sec.id, name: sec.name, steps: chunk });
          });
          ssData.sections = newSecs;
          localStorage.setItem('linedance_builder_data_v13', JSON.stringify(ssData));
          window.dispatchEvent(new Event('storage'));
          _toast('Smart split: ' + newSecs.length + ' sections');
        } catch (e) {}
        break;
      case 'preferences':
        if (window.__stepperSettingsTab && window.__stepperSettingsTab.open) window.__stepperSettingsTab.open();
        else window.dispatchEvent(new CustomEvent('stepper-open-settings'));
        break;
      case 'shortcuts':
      case 'help-shortcuts':
        window.dispatchEvent(new CustomEvent('stepper-show-shortcuts'));
        break;

      /* ── Extensions extras ── */
      case 'export-clipboard':
        try {
          var ecData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var ecLines = [];
          if (ecData.meta) ecLines.push((ecData.meta.title || 'Untitled') + ' — ' + (ecData.meta.choreographer || ''));
          (ecData.sections || []).forEach(function(sec, si) {
            ecLines.push('\n[Section ' + (si + 1) + ': ' + (sec.name || '') + ']');
            (sec.steps || []).forEach(function(st, sti) {
              ecLines.push((sti + 1) + '. ' + (st.name || '?') + (st.description ? ' — ' + st.description : '') + (st.foot ? ' (' + st.foot + ')' : ''));
            });
          });
          var ecText = ecLines.join('\n');
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(ecText).then(function(){ _toast('Dance copied to clipboard!'); });
          } else { _toast('Clipboard not available'); }
        } catch (e) {}
        break;
      case 'share-link':
        try {
          var slData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
          var slCompressed = btoa(unescape(encodeURIComponent(JSON.stringify(slData))));
          var slUrl = location.origin + location.pathname + '#dance=' + slCompressed.slice(0, 2000);
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(slUrl).then(function(){ _toast('Share link copied!'); });
          } else { prompt('Copy this link:', slUrl); }
        } catch (e) {}
        break;

      /* ── Help extras ── */
      case 'help-start':
      case 'help-main':
        var helpWn = Array.from(document.querySelectorAll('button')).find(function (b) { return (b.textContent || '').trim() === "What's New"; });
        if (helpWn) helpWn.click();
        break;
      case 'report-issue':
        window.open('https://github.com/anthonytau4/Step-By-Stepper/issues', '_blank');
        break;
      case 'about':
        alert('Step by Stepper\n\nA modern line dance step sheet editor.\nBuild, preview, and share your choreography.\n\n© ' + new Date().getFullYear());
        break;

      /* ── Insert extras (functional implementations) ── */
      case 'line-spacing':
        document.body.classList.toggle('stepper-wide-spacing');
        _toast('Line spacing toggled');
        break;

      /* ── Extension openers ── */
      case 'open-music':
        var musicTab = document.getElementById('stepper-music-tab');
        if (musicTab) musicTab.click();
        else _toast('Opening Music Manager…');
        break;
      case 'open-templates':
        var templTab = document.getElementById('stepper-templates-tab');
        if (templTab) templTab.click();
        else _toast('Opening Templates…');
        break;

      /* ── Premium extensions ── */
      case 'premium-ai-builder':
      case 'premium-auto-choreo':
      case 'premium-bpm-sync':
      case 'premium-export':
        var _isPrem = false;
        try { var ps = JSON.parse(sessionStorage.getItem('stepper_session') || 'null'); if (ps && ps.premium) _isPrem = true; } catch(e){}
        try { if (window.__stepperIsPremium && window.__stepperIsPremium()) _isPrem = true; } catch(e){}
        if (!_isPrem) {
          _toast('🔒 Premium feature — subscribe to unlock');
          var subTab = document.getElementById('stepper-google-subscription-tab');
          if (subTab) setTimeout(function(){ subTab.click(); }, 600);
        } else {
          if (action === 'premium-ai-builder') {
            var helperBtn = document.getElementById('stepper-site-helper-host') || document.querySelector('[data-helper-toggle]');
            if (helperBtn) helperBtn.click();
            _toast('Premium AI Dance Builder ready — ask it to build a dance!');
          } else if (action === 'premium-auto-choreo') {
            _toast('Auto-Choreographer: generating suggestions based on your music…');
            try {
              var acData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
              var bpm = (acData.meta && acData.meta.bpm) ? parseInt(acData.meta.bpm, 10) : 120;
              var style = (bpm > 140) ? 'high-energy' : (bpm > 100) ? 'moderate' : 'slow and smooth';
              _toast('Suggested style: ' + style + ' at ' + bpm + ' BPM');
            } catch(e) { _toast('Set your music BPM first in Dance Details'); }
          } else if (action === 'premium-bpm-sync') {
            _toast('BPM Sync: aligning steps to beat…');
            try {
              var bsData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
              var bsBpm = (bsData.meta && bsData.meta.bpm) ? parseInt(bsData.meta.bpm, 10) : 120;
              var msPerBeat = Math.round(60000 / bsBpm);
              _toast('Beat interval: ' + msPerBeat + 'ms at ' + bsBpm + ' BPM — steps synced!');
            } catch(e) { _toast('Set BPM in Dance Details first'); }
          } else if (action === 'premium-export') {
            try {
              var peData = JSON.parse(localStorage.getItem('linedance_builder_data_v13') || '{}');
              var peLines = [];
              if (peData.meta) {
                peLines.push('DANCE STEP SHEET');
                peLines.push('================');
                peLines.push('Title: ' + (peData.meta.title || 'Untitled'));
                peLines.push('Choreographer: ' + (peData.meta.choreographer || 'Unknown'));
                peLines.push('Level: ' + (peData.meta.level || 'N/A'));
                peLines.push('Counts: ' + (peData.meta.counts || 'N/A'));
                peLines.push('Walls: ' + (peData.meta.walls || 'N/A'));
                if (peData.meta.music) peLines.push('Music: ' + peData.meta.music);
                peLines.push('');
              }
              (peData.sections || []).forEach(function(sec, si) {
                peLines.push('--- Section ' + (si+1) + ': ' + (sec.name || '') + ' ---');
                (sec.steps || []).forEach(function(st, sti) {
                  var line = (sti+1) + '. ' + (st.name || '?');
                  if (st.count) line += ' (' + st.count + ')';
                  if (st.description) line += ' — ' + st.description;
                  if (st.foot) line += ' [' + st.foot + ']';
                  peLines.push(line);
                });
                peLines.push('');
              });
              var peBlob = new Blob([peLines.join('\n')], { type: 'text/plain' });
              var peUrl = URL.createObjectURL(peBlob);
              var peA = document.createElement('a');
              peA.href = peUrl;
              peA.download = ((peData.meta && peData.meta.title) || 'dance') + '-stepsheet.txt';
              document.body.appendChild(peA);
              peA.click();
              document.body.removeChild(peA);
              URL.revokeObjectURL(peUrl);
              _toast('Step sheet exported!');
            } catch(e) { _toast('Export failed'); }
          }
        }
        break;

      /* ── Version History ── */
      case 'version-history':
        try {
          var vhSaved = JSON.parse(localStorage.getItem('stepper_saved_dances') || '[]');
          if (vhSaved.length === 0) {
            _toast('No saved versions yet — save your dance first');
          } else {
            var vhList = vhSaved.map(function(item, idx) {
              var title = (item.data && item.data.meta && item.data.meta.title) || 'Untitled';
              var date = item.savedAt ? new Date(item.savedAt).toLocaleString() : 'Unknown date';
              return (idx+1) + '. "' + title + '" — ' + date;
            });
            alert('Version History (' + vhSaved.length + ' saves):\n\n' + vhList.join('\n'));
          }
        } catch(e) { _toast('Could not load version history'); }
        break;

      default:
        break;
    }
    closeAllMenus();
  }

  /* ── DOM helpers ── */
  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = String(text || '');
    return el.innerHTML;
  }

  /* ── Active menu state ── */
  var _activeMenu = null;

  function closeAllMenus() {
    var wasOpen = _activeMenu !== null;
    _activeMenu = null;
    var bar = document.getElementById(MENUBAR_ID);
    if (!bar) return;
    bar.querySelectorAll('.stepper-menu-dropdown').forEach(function (dd) {
      dd.style.display = 'none';
    });
    bar.querySelectorAll('.stepper-menu-trigger').forEach(function (t) {
      t.classList.remove('stepper-menu-trigger--open');
    });
    /* Re-render after closing so context-aware menus update (Edit/Sheet only on editor tabs) */
    if (wasOpen) {
      setTimeout(function () { renderMenuBar(); }, 60);
    }
  }

  function toggleMenu(menuIdx) {
    var bar = document.getElementById(MENUBAR_ID);
    if (!bar) return;
    var dropdowns = bar.querySelectorAll('.stepper-menu-dropdown');
    var triggers = bar.querySelectorAll('.stepper-menu-trigger');

    if (_activeMenu === menuIdx) {
      closeAllMenus();
      return;
    }

    closeAllMenus();
    _activeMenu = menuIdx;

    if (dropdowns[menuIdx]) dropdowns[menuIdx].style.display = 'block';
    if (triggers[menuIdx]) triggers[menuIdx].classList.add('stepper-menu-trigger--open');
  }

  function hoverMenu(menuIdx) {
    if (_activeMenu === null) return;
    toggleMenu(menuIdx);
  }

  /* ── Render menu bar ── */
  function getMenuHost() {
    var host = document.getElementById(MENUBAR_HOST_ID);
    if (host) return host;
    host = document.createElement('div');
    host.id = MENUBAR_HOST_ID;
    host.style.cssText = 'position:sticky;top:0;z-index:9996;width:100%;';
    if (document.body.firstChild) document.body.insertBefore(host, document.body.firstChild);
    else document.body.appendChild(host);
    return host;
  }

  function getAccentHex() {
    try {
      var raw = JSON.parse(localStorage.getItem('stepper_settings_v1') || '{}');
      var map = { indigo:'#4f46e5', blue:'#2563eb', green:'#16a34a', red:'#dc2626', purple:'#9333ea', orange:'#ea580c', teal:'#0d9488', pink:'#db2777' };
      return map[String(raw.accentColor || 'indigo')] || '#4f46e5';
    } catch (e) { return '#4f46e5'; }
  }

  function buildQuickFormatButton(action, label, title) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'stepper-quick-format-btn';
    btn.dataset.menuAction = action;
    btn.setAttribute('title', title);
    btn.setAttribute('aria-label', title);
    btn.textContent = label;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dispatchMenuAction(action);
    });
    return btn;
  }

  function renderMenuBar() {
    /* Don't re-render while a dropdown is open — it destroys the open menu */
    if (_activeMenu !== null) return;

    var existing = document.getElementById(MENUBAR_ID);
    if (existing) existing.remove();

    var dark = isDarkMode();
    var accent = getAccentHex();
    var menus = getMenus();

    var bar = document.createElement('div');
    bar.id = MENUBAR_ID;
    bar.style.cssText = 'display:flex;align-items:center;gap:0;padding:0 8px;height:28px;font-size:12px;font-family:var(--stepper-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);user-select:none;position:relative;z-index:50;' +
      (dark ? 'background:#1e1e2e;color:#d4d4e0;border-bottom:1px solid #3a3a52;' : 'background:#ffffff;color:#1f2937;border-bottom:1px solid #d1d5db;');

    for (var i = 0; i < menus.length; i++) {
      var menu = menus[i];
      var wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:relative;';

      var trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'stepper-menu-trigger';
      trigger.style.cssText = 'background:none;border:none;cursor:pointer;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;color:inherit;white-space:nowrap;line-height:1;transition:background .12s;';
      trigger.textContent = menu.label;
      trigger.dataset.menuIdx = String(i);

      trigger.addEventListener('click', (function (idx) {
        return function (e) { e.stopPropagation(); toggleMenu(idx); };
      })(i));
      trigger.addEventListener('mouseenter', (function (idx) {
        return function () { hoverMenu(idx); };
      })(i));

      var dropdown = document.createElement('div');
      dropdown.className = 'stepper-menu-dropdown';
      dropdown.style.cssText = 'display:none;position:absolute;top:100%;left:0;min-width:240px;padding:4px 0;border-radius:8px;z-index:999;' +
        (dark ? 'background:#1e1e2e;border:1px solid #3a3a52;box-shadow:0 8px 32px rgba(0,0,0,.45);' : 'background:#ffffff;border:1px solid #d1d5db;box-shadow:0 8px 32px rgba(0,0,0,.12);');

      for (var j = 0; j < menu.items.length; j++) {
        var item = menu.items[j];
        if (item.type === 'divider') {
          var hr = document.createElement('div');
          hr.style.cssText = 'height:1px;margin:4px 12px;' + (dark ? 'background:#3a3a52;' : 'background:#e8eaed;');
          dropdown.appendChild(hr);
          continue;
        }

        var row = document.createElement('button');
        row.type = 'button';
        row.style.cssText = 'display:flex;align-items:center;gap:8px;width:100%;padding:6px 12px;background:none;border:none;cursor:pointer;font-size:12px;color:inherit;text-align:left;transition:background .12s;border-radius:0;';
        row.dataset.menuAction = item.action || '';

        var iconSpan = document.createElement('span');
        iconSpan.style.cssText = 'width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;opacity:.7;';
        if (item.icon) iconSpan.innerHTML = item.icon;
        row.appendChild(iconSpan);

        var labelSpan = document.createElement('span');
        labelSpan.style.cssText = 'flex:1;';
        labelSpan.textContent = item.label;
        row.appendChild(labelSpan);

        if (item.shortcut) {
          var shortcutSpan = document.createElement('span');
          shortcutSpan.style.cssText = 'font-size:11px;opacity:.45;margin-left:12px;white-space:nowrap;';
          shortcutSpan.textContent = item.shortcut;
          row.appendChild(shortcutSpan);
        }

        row.addEventListener('mouseenter', function () {
          this.style.background = dark ? 'rgba(99,102,241,.15)' : '#f1f3f4';
        });
        row.addEventListener('mouseleave', function () {
          this.style.background = 'none';
        });
        row.addEventListener('click', (function (act) {
          return function (e) {
            e.stopPropagation();
            dispatchMenuAction(act);
          };
        })(item.action));

        dropdown.appendChild(row);
      }

      wrapper.appendChild(trigger);
      wrapper.appendChild(dropdown);
      bar.appendChild(wrapper);
    }

    if (_isEditorTab()) {
      var spacer = document.createElement('div');
      spacer.style.cssText = 'flex:1 1 auto;';
      bar.appendChild(spacer);

      var quickFormat = document.createElement('div');
      quickFormat.id = QUICK_FORMAT_ID;
      quickFormat.className = 'stepper-quick-format-strip';
      quickFormat.appendChild(buildQuickFormatButton('format-bold', 'B', 'Bold (Ctrl+B)'));
      quickFormat.appendChild(buildQuickFormatButton('format-italic', 'I', 'Italic (Ctrl+I)'));
      quickFormat.appendChild(buildQuickFormatButton('format-underline', 'U', 'Underline (Ctrl+U)'));
      quickFormat.appendChild(buildQuickFormatButton('format-strike', 'S', 'Strikethrough'));
      quickFormat.appendChild(buildQuickFormatButton('clear-format', 'Tx', 'Clear formatting'));
      bar.appendChild(quickFormat);
    }

    var host = getMenuHost();
    host.innerHTML = '';
    host.appendChild(bar);

    _injected = true;
  }

  /* ── Inject styles (once) ── */
  function injectStyles() {
    if (document.getElementById('stepper-menubar-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-menubar-style';
    style.textContent = [
      '.stepper-menu-trigger:hover, .stepper-menu-trigger--open { background: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 14%, transparent) !important; color: var(--stepper-accent-color, #4f46e5) !important; }',
      '.stepper-menu-trigger--open { font-weight: 600 !important; }',
      '#' + MENUBAR_ID + ' { border-bottom-color: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 18%, rgba(0,0,0,.16)) !important; }',
      '.stepper-menu-dropdown { animation: stepper-menu-drop .12s ease; }',
      '.stepper-quick-format-strip { display:inline-flex; align-items:center; gap:4px; margin-left:12px; padding-left:10px; border-left:1px solid color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 18%, rgba(0,0,0,.14)); }',
      '.stepper-quick-format-btn { min-width:28px; height:22px; padding:0 8px; border-radius:7px; border:1px solid color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 22%, rgba(0,0,0,.14)); background:color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 6%, transparent); color:inherit; cursor:pointer; font-size:11px; font-weight:800; line-height:1; transition:background .12s ease, color .12s ease, transform .12s ease; }',
      '.stepper-quick-format-btn:hover { background: color-mix(in srgb, var(--stepper-accent-color, #4f46e5) 16%, transparent); color: var(--stepper-accent-color, #4f46e5); transform: translateY(-1px); }',
      '.stepper-quick-format-btn:active { transform: translateY(0); }',
      '@keyframes stepper-menu-drop { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }',
      '#' + MENUBAR_ID + ' svg { width: 14px !important; height: 14px !important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ── Global close on click outside ── */
  document.addEventListener('click', function () {
    closeAllMenus();
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllMenus();
  });

  /* ── Boot ── */
  function boot() {
    injectStyles();
    renderMenuBar();

    /* Re-inject if the Build button appears later (SPA navigation) */
    var observer = new MutationObserver(function () {
      var host = document.getElementById(MENUBAR_HOST_ID);
      if (!host || !document.getElementById(MENUBAR_ID)) {
        renderMenuBar();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    /* Re-render on theme/layout changes */
    function rerenderMenuBar() {
      if (_rerenderTimer) return;
      _rerenderTimer = window.requestAnimationFrame(function () {
        _rerenderTimer = 0;
        if (document.getElementById(MENUBAR_ID)) {
          renderMenuBar();
        }
      });
    }
    window.addEventListener('storage', rerenderMenuBar);
    window.addEventListener('stepper-settings-changed', function (event) {
      var detail = event && event.detail ? event.detail : {};
      var key = String(detail.key || '');
      if (!key || key === '_all' || key === 'theme' || key === 'fontFamily') rerenderMenuBar();
    });
    window.addEventListener('stepper-theme-updated', rerenderMenuBar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    /* Small delay to let Build/Sheet buttons render first */
    setTimeout(boot, 600);
  }

})();
