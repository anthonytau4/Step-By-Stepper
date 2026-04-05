/* ═══════════════════════════════════════════════════════════════════════════
   stepper-music-tab.js  –  Music Manager tab for Step-By-Stepper
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__stepperMusicTabInstalled) return;
  window.__stepperMusicTabInstalled = true;

  /* ── Constants ───────────────────────────────────────────────────────── */
  var PAGE_ID = 'stepper-music-page';
  var TAB_ID  = 'stepper-music-tab';
  var BUILDER_DATA_KEY = 'linedance_builder_data_v13';
  var MAX_TAP_SAMPLES = 8;          // taps kept for BPM average (balances accuracy vs responsiveness)
  var TAP_RESET_THRESHOLD_MS = 3000; // auto-reset if gap between taps exceeds this

  /* ── State ───────────────────────────────────────────────────────────── */
  var musicState = {
    tapTimestamps: [],
    tapBPM: 0,
    metronomeBPM: 0,
    metronomeRunning: false,
    metronomeInterval: null,
    metronomeBeat: false,
    audioUrl: '',
    audioName: '',
    audioDuration: 0,
    audioDetectedBpm: 0,
    audioStartOffset: 0,
    audioPlaybackRate: 1,
    audioAnalyzing: false
  };
  var _audioAnalysisBuffer = null;

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

  function loadBuilderData() {
    try { return JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || 'null') || {}; }
    catch (e) { return {}; }
  }

  function saveBuilderData(data) {
    try { localStorage.setItem(BUILDER_DATA_KEY, JSON.stringify(data)); }
    catch (e) { /* quota */ }
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

  function normalizeDetectedBpm(bpm) {
    var value = Number(bpm || 0);
    if (!value || !isFinite(value)) return 0;
    while (value < 70) value *= 2;
    while (value > 190) value /= 2;
    return value;
  }

  function estimateBpmFromAudioBuffer(audioBuffer) {
    if (!audioBuffer) return 0;
    var sampleRate = audioBuffer.sampleRate || 44100;
    var channels = Math.max(1, audioBuffer.numberOfChannels || 1);
    var length = Math.min(audioBuffer.length || 0, Math.floor(sampleRate * 90)); // analyze first 90s
    if (!length) return 0;

    var mono = new Float32Array(length);
    for (var c = 0; c < channels; c++) {
      var data = audioBuffer.getChannelData(c);
      for (var i = 0; i < length; i++) mono[i] += data[i] / channels;
    }

    var frameSize = 1024;
    var hop = 512;
    var envLength = Math.max(1, Math.floor((length - frameSize) / hop));
    var envelope = new Float32Array(envLength);
    var eIdx = 0;
    for (var start = 0; start + frameSize < length && eIdx < envLength; start += hop) {
      var sum = 0;
      for (var j = 0; j < frameSize; j++) {
        var v = mono[start + j];
        sum += v * v;
      }
      envelope[eIdx++] = Math.sqrt(sum / frameSize);
    }
    var frameRate = sampleRate / hop;
    var minLag = Math.floor(frameRate * 60 / 200); // 200 bpm
    var maxLag = Math.floor(frameRate * 60 / 60);  // 60 bpm
    if (maxLag <= minLag) return 0;

    var bestLag = 0;
    var bestCorr = -Infinity;
    for (var lag = minLag; lag <= maxLag; lag++) {
      var corr = 0;
      for (var k = 0; k + lag < eIdx; k++) corr += envelope[k] * envelope[k + lag];
      if (corr > bestCorr) {
        bestCorr = corr;
        bestLag = lag;
      }
    }
    if (!bestLag) return 0;
    var bpm = 60 * frameRate / bestLag;
    return normalizeDetectedBpm(bpm);
  }

  function detectBpmFromImportedAudio() {
    if (!_audioAnalysisBuffer) {
      _toast('Import an MP3 first.');
      return;
    }
    musicState.audioAnalyzing = true;
    renderMusicPage();
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      musicState.audioAnalyzing = false;
      renderMusicPage();
      _toast('BPM analysis needs Web Audio support.');
      return;
    }
    var ctx = new AudioCtx();
    ctx.decodeAudioData(_audioAnalysisBuffer.slice(0)).then(function (decoded) {
      var bpm = estimateBpmFromAudioBuffer(decoded);
      musicState.audioDetectedBpm = bpm ? Math.round(bpm) : 0;
      musicState.audioAnalyzing = false;
      try { ctx.close(); } catch (e) { /* ignore */ }
      if (musicState.audioDetectedBpm) {
        var data = loadBuilderData();
        if (!data.meta) data.meta = {};
        data.meta.bpm = String(musicState.audioDetectedBpm);
        saveBuilderData(data);
      }
      renderMusicPage();
      _toast(musicState.audioDetectedBpm ? ('Detected ~' + musicState.audioDetectedBpm + ' BPM') : 'Could not detect BPM clearly.');
    }).catch(function () {
      musicState.audioAnalyzing = false;
      try { ctx.close(); } catch (e) { /* ignore */ }
      renderMusicPage();
      _toast('Could not decode this audio file.');
    });
  }

  /* ── Style injection ─────────────────────────────────────────────────── */
  function ensureMusicStyles() {
    if (document.getElementById('stepper-music-tab-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-music-tab-style';
    style.textContent = [
      '#' + PAGE_ID + ' input:focus,#' + PAGE_ID + ' textarea:focus { border-color:rgba(99,102,241,.5)!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important;outline:none; }',
      '#' + PAGE_ID + ' button:hover { opacity:.88; }',
      '#' + PAGE_ID + ' .music-card { transition:transform .15s ease,box-shadow .15s ease; }',
      '#' + PAGE_ID + ' .music-card:hover { transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08); }',
      '@keyframes stepper-metro-pulse { 0%{transform:scale(1);opacity:.4;} 50%{transform:scale(1.25);opacity:1;} 100%{transform:scale(1);opacity:.4;} }',
      '@keyframes stepper-metro-flash { 0%{box-shadow:0 0 0 0 rgba(99,102,241,.7);} 70%{box-shadow:0 0 0 18px rgba(99,102,241,0);} 100%{box-shadow:0 0 0 0 rgba(99,102,241,0);} }',
      '@keyframes stepper-toast-in { from{opacity:0;transform:translateX(-50%) translateY(12px);} to{opacity:1;transform:translateX(-50%) translateY(0);} }',
      '#' + PAGE_ID + ' .metro-dot.active { animation:stepper-metro-pulse .3s ease,stepper-metro-flash .6s ease; }',
      '#' + PAGE_ID + ' .tap-btn:active { transform:scale(.93); }'
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

  /* ── BPM Reference Data ──────────────────────────────────────────────── */
  var BPM_GUIDE = [
    { dance: 'Cha Cha',           low: 120, high: 128, desc: 'Upbeat Latin rhythm with syncopated triple steps' },
    { dance: 'Waltz',             low: 84,  high: 96,  desc: '3/4 time signature, smooth and flowing' },
    { dance: 'Two Step',          low: 170, high: 180, desc: 'Quick-quick-slow-slow country partner dance' },
    { dance: 'West Coast Swing',  low: 108, high: 132, desc: 'Smooth slot dance with elastic feel' },
    { dance: 'Night Club 2-Step', low: 56,  high: 64,  desc: 'Slow romantic partner dance' },
    { dance: 'East Coast Swing',  low: 136, high: 144, desc: 'Bouncy triple-step swing dance' },
    { dance: 'Hustle',            low: 118, high: 122, desc: 'Disco-era partner dance, &1-2-3 timing' },
    { dance: 'Rumba',             low: 100, high: 108, desc: 'Slow Latin dance with Cuban hip motion' },
    { dance: 'Samba',             low: 96,  high: 104, desc: 'Brazilian rhythm with bounce action' },
    { dance: 'Polka',             low: 120, high: 130, desc: 'Lively hop-step-close-step pattern' },
    { dance: 'Bachata',           low: 128, high: 140, desc: 'Dominican hip-driven 4-beat pattern' },
    { dance: 'Foxtrot',           low: 120, high: 136, desc: 'Smooth ballroom dance, slow-slow-quick-quick' }
  ];

  /* ── Section Renderers ───────────────────────────────────────────────── */

  function renderMusicInfo(theme) {
    var data = loadBuilderData();
    var musicTitle = (data.meta && data.meta.music) || '';
    var artist = (data.meta && data.meta.artist) || '';
    var bpm = (data.meta && data.meta.bpm) || '';

    var html = '';
    html += '<div class="music-card rounded-2xl border p-5 ' + theme.panel + '" style="margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;flex-shrink:0;"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0;">Current Dance Music Info</h3>';
    html += '</div>';

    html += '<div style="display:grid;gap:14px;">';

    // Song Title
    html += '<div>';
    html += '<label style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">Song Title</label>';
    html += '<input data-music-field="music" type="text" value="' + escapeHtml(musicTitle) + '" placeholder="Enter song title…" ';
    html += 'style="width:100%;margin-top:4px;padding:10px 14px;border-radius:10px;border:1px solid;font-size:14px;' + theme.inputBg + '" />';
    html += '</div>';

    // Artist
    html += '<div>';
    html += '<label style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">Artist</label>';
    html += '<input data-music-field="artist" type="text" value="' + escapeHtml(artist) + '" placeholder="Enter artist name…" ';
    html += 'style="width:100%;margin-top:4px;padding:10px 14px;border-radius:10px;border:1px solid;font-size:14px;' + theme.inputBg + '" />';
    html += '</div>';

    // BPM
    html += '<div>';
    html += '<label style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">BPM (Beats Per Minute)</label>';
    html += '<input data-music-field="bpm" type="number" min="20" max="300" value="' + escapeHtml(String(bpm)) + '" placeholder="e.g. 128" ';
    html += 'style="width:100%;margin-top:4px;padding:10px 14px;border-radius:10px;border:1px solid;font-size:14px;' + theme.inputBg + '" />';
    html += '</div>';

    html += '</div>';

    // Save button
    html += '<div style="margin-top:16px;display:flex;gap:10px;">';
    html += '<button data-music-save style="padding:10px 24px;border-radius:10px;border:none;font-size:14px;font-weight:700;cursor:pointer;' + theme.btnPrimary + '">💾 Save Music Info</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderTapTempo(theme) {
    var html = '';
    html += '<div class="music-card rounded-2xl border p-5 ' + theme.panel + '" style="margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
    html += '<span style="font-size:20px;">🥁</span>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0;">Tap Tempo – BPM Detector</h3>';
    html += '</div>';

    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 16px;">Tap the button in time with the music. Averages the last 8 taps.</p>';

    // Display area
    html += '<div style="display:flex;align-items:center;gap:20px;margin-bottom:16px;flex-wrap:wrap;">';
    html += '<div style="text-align:center;">';
    html += '<div data-tap-bpm-display style="font-size:48px;font-weight:900;font-variant-numeric:tabular-nums;line-height:1;">' + (musicState.tapBPM ? Math.round(musicState.tapBPM) : '—') + '</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">BPM</div>';
    html += '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    html += '<button data-tap-btn class="tap-btn" style="padding:16px 36px;border-radius:14px;border:none;font-size:18px;font-weight:800;cursor:pointer;user-select:none;transition:transform .1s;' + theme.btnPrimary + '">🎵 TAP</button>';
    html += '<button data-tap-reset style="padding:8px 16px;border-radius:10px;border:none;font-size:12px;font-weight:700;cursor:pointer;' + theme.btnSecondary + '">Reset</button>';
    html += '</div>';
    html += '</div>';

    // Tap count and use button
    html += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">';
    html += '<span class="' + theme.subtle + '" style="font-size:13px;">Taps: <strong data-tap-count>' + musicState.tapTimestamps.length + '</strong></span>';
    if (musicState.tapBPM > 0) {
      html += '<button data-tap-use style="padding:8px 18px;border-radius:10px;border:none;font-size:13px;font-weight:700;cursor:pointer;background:#10b981;color:#fff;">✓ Use ' + Math.round(musicState.tapBPM) + ' BPM</button>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderBpmGuide(theme) {
    var html = '';
    html += '<div class="music-card rounded-2xl border p-5 ' + theme.panel + '" style="margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
    html += '<span style="font-size:20px;">📊</span>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0;">BPM Reference Guide</h3>';
    html += '</div>';

    html += '<div style="overflow-x:auto;">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:13px;">';
    html += '<thead>';
    html += '<tr style="border-bottom:2px solid ' + (theme.dark ? '#374151' : '#e5e7eb') + ';">';
    html += '<th style="text-align:left;padding:8px 12px;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">Dance Style</th>';
    html += '<th style="text-align:center;padding:8px 12px;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">BPM Range</th>';
    html += '<th style="text-align:left;padding:8px 12px;font-weight:800;font-size:11px;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">Description</th>';
    html += '</tr></thead><tbody>';

    for (var i = 0; i < BPM_GUIDE.length; i++) {
      var g = BPM_GUIDE[i];
      var rowBg = i % 2 === 0 ? (theme.dark ? 'background:rgba(255,255,255,.02);' : 'background:rgba(0,0,0,.015);') : '';
      html += '<tr style="border-bottom:1px solid ' + (theme.dark ? '#1f2937' : '#f3f4f6') + ';' + rowBg + '">';
      html += '<td style="padding:10px 12px;font-weight:700;">' + escapeHtml(g.dance) + '</td>';
      html += '<td style="padding:10px 12px;text-align:center;font-weight:600;font-variant-numeric:tabular-nums;">' + g.low + '–' + g.high + '</td>';
      html += '<td style="padding:10px 12px;" class="' + theme.subtle + '">' + escapeHtml(g.desc) + '</td>';
      html += '</tr>';
    }

    html += '</tbody></table>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderCountCalc(theme) {
    var data = loadBuilderData();
    var currentBpm = (data.meta && data.meta.bpm) ? Number(data.meta.bpm) : 0;

    var html = '';
    html += '<div class="music-card rounded-2xl border p-5 ' + theme.panel + '" style="margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
    html += '<span style="font-size:20px;">🔢</span>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0;">Count Calculator</h3>';
    html += '</div>';

    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 16px;">Calculate the total counts in a song based on BPM and duration.</p>';

    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">';

    // BPM input
    html += '<div>';
    html += '<label style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">BPM</label>';
    html += '<input data-calc-bpm type="number" min="20" max="300" value="' + (currentBpm || '') + '" placeholder="e.g. 128" ';
    html += 'style="width:100%;margin-top:4px;padding:10px 14px;border-radius:10px;border:1px solid;font-size:14px;' + theme.inputBg + '" />';
    html += '</div>';

    // Duration input
    html += '<div>';
    html += '<label style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">Duration (seconds)</label>';
    html += '<input data-calc-duration type="number" min="1" max="9999" placeholder="e.g. 180" ';
    html += 'style="width:100%;margin-top:4px;padding:10px 14px;border-radius:10px;border:1px solid;font-size:14px;' + theme.inputBg + '" />';
    html += '</div>';

    html += '</div>';

    // Calculate button
    html += '<div style="margin-top:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">';
    html += '<button data-calc-go style="padding:10px 24px;border-radius:10px;border:none;font-size:14px;font-weight:700;cursor:pointer;' + theme.btnPrimary + '">Calculate Counts</button>';
    html += '<div data-calc-result style="font-size:15px;font-weight:700;"></div>';
    html += '</div>';

    // Duration helper
    html += '<div style="margin-top:14px;padding:12px 14px;border-radius:10px;border:1px solid;' + (theme.dark ? 'background:rgba(99,102,241,.08);border-color:rgba(99,102,241,.2);' : 'background:#eef2ff;border-color:#c7d2fe;') + '">';
    html += '<div style="font-size:12px;font-weight:700;margin-bottom:6px;">⏱ Quick Duration Reference</div>';
    html += '<div style="font-size:12px;display:flex;gap:16px;flex-wrap:wrap;" class="' + theme.subtle + '">';
    html += '<span>2:30 = <strong>150s</strong></span>';
    html += '<span>3:00 = <strong>180s</strong></span>';
    html += '<span>3:30 = <strong>210s</strong></span>';
    html += '<span>4:00 = <strong>240s</strong></span>';
    html += '<span>4:30 = <strong>270s</strong></span>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderMetronome(theme) {
    var data = loadBuilderData();
    var currentBpm = (data.meta && data.meta.bpm) ? Number(data.meta.bpm) : 120;
    var activeBpm = musicState.metronomeBPM || currentBpm || 120;
    var running = musicState.metronomeRunning;

    var dotColor = theme.dark ? '#6366f1' : '#4f46e5';
    var dotInactive = theme.dark ? '#374151' : '#d1d5db';

    var html = '';
    html += '<div class="music-card rounded-2xl border p-5 ' + theme.panel + '" style="margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
    html += '<span style="font-size:20px;">⏱</span>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0;">Visual Metronome</h3>';
    html += '</div>';

    // BPM control
    html += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;flex-wrap:wrap;">';
    html += '<div>';
    html += '<label style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">Metronome BPM</label>';
    html += '<input data-metro-bpm type="number" min="20" max="300" value="' + activeBpm + '" ';
    html += 'style="width:120px;margin-top:4px;padding:10px 14px;border-radius:10px;border:1px solid;font-size:14px;display:block;' + theme.inputBg + '" />';
    html += '</div>';
    html += '<button data-metro-toggle style="padding:12px 28px;border-radius:12px;border:none;font-size:15px;font-weight:800;cursor:pointer;margin-top:18px;';
    if (running) {
      html += 'background:#ef4444;color:#fff;">';
      html += '⏹ Stop';
    } else {
      html += theme.btnPrimary + '">';
      html += '▶ Start';
    }
    html += '</button>';
    html += '</div>';

    // Visual beat display
    html += '<div style="display:flex;align-items:center;justify-content:center;gap:16px;padding:24px 0;">';
    for (var b = 0; b < 4; b++) {
      var isActive = running && musicState.metronomeBeat && b === 0;
      html += '<div data-metro-dot="' + b + '" class="metro-dot' + (isActive ? ' active' : '') + '" ';
      html += 'style="width:40px;height:40px;border-radius:50%;transition:all .1s ease;';
      if (isActive) {
        html += 'background:' + dotColor + ';box-shadow:0 0 20px ' + dotColor + ';';
      } else {
        html += 'background:' + dotInactive + ';';
      }
      html += '"></div>';
    }
    html += '</div>';

    // Beat counter
    html += '<div style="text-align:center;" class="' + theme.subtle + '">';
    html += '<span data-metro-status style="font-size:13px;font-weight:600;">' + (running ? 'Playing at ' + activeBpm + ' BPM' : 'Stopped') + '</span>';
    html += '</div>';

    // Tempo presets
    html += '<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">';
    var presets = [
      { label: 'Slow', bpm: 72 },
      { label: 'Moderate', bpm: 100 },
      { label: 'Medium', bpm: 120 },
      { label: 'Upbeat', bpm: 140 },
      { label: 'Fast', bpm: 170 }
    ];
    for (var p = 0; p < presets.length; p++) {
      html += '<button data-metro-preset="' + presets[p].bpm + '" style="padding:6px 14px;border-radius:8px;border:1px solid;font-size:12px;font-weight:600;cursor:pointer;' + theme.btnSecondary + '">';
      html += escapeHtml(presets[p].label) + ' (' + presets[p].bpm + ')';
      html += '</button>';
    }
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderAudioTools(theme) {
    var html = '';
    var effectiveBpm = musicState.audioDetectedBpm ? Math.round(musicState.audioDetectedBpm * musicState.audioPlaybackRate) : 0;
    html += '<div class="music-card rounded-2xl border p-5 ' + theme.panel + '" style="margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
    html += '<span style="font-size:20px;">🎧</span>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0;">MP3 Import, BPM & Tempo Tools</h3>';
    html += '</div>';
    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 14px;">Import an MP3, auto-detect BPM, trim silence at the beginning, and half/double playback tempo.</p>';
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">';
    html += '<input data-music-audio-file type="file" accept="audio/mpeg,audio/mp3,audio/*" />';
    html += '<button data-music-detect-bpm style="padding:8px 14px;border-radius:10px;border:none;font-size:12px;font-weight:700;cursor:pointer;' + theme.btnPrimary + '">' + (musicState.audioAnalyzing ? 'Analyzing…' : 'Detect BPM') + '</button>';
    html += '</div>';
    if (musicState.audioName) {
      html += '<div class="' + theme.subtle + '" style="font-size:12px;margin-bottom:8px;">Loaded: <strong>' + escapeHtml(musicState.audioName) + '</strong> · ' + (musicState.audioDuration ? musicState.audioDuration.toFixed(1) + 's' : '—') + '</div>';
    }
    if (musicState.audioUrl) {
      html += '<audio data-music-audio-player controls preload="metadata" style="width:100%;margin-bottom:10px;" src="' + escapeHtml(musicState.audioUrl) + '"></audio>';
      html += '<div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin-bottom:10px;">';
      html += '<label class="' + theme.subtle + '" style="font-size:12px;">Start Trim Offset (seconds):</label>';
      html += '<input data-music-start-offset type="number" min="0" step="0.1" value="' + escapeHtml(String(musicState.audioStartOffset || 0)) + '" style="width:120px;padding:8px 10px;border:1px solid;border-radius:10px;' + theme.inputBg + '" />';
      html += '</div>';
      html += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">';
      html += '<button data-music-play-trim style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;' + theme.btnPrimary + '">Play from Trim</button>';
      html += '<button data-music-half style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;' + theme.btnSecondary + '">½ Tempo</button>';
      html += '<button data-music-normal style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;' + theme.btnSecondary + '">1× Tempo</button>';
      html += '<button data-music-double style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;' + theme.btnSecondary + '">2× Tempo</button>';
      html += '</div>';
      html += '<div class="' + theme.subtle + '" style="font-size:12px;">Detected BPM: <strong>' + (musicState.audioDetectedBpm || '—') + '</strong> · Current Rate: <strong>' + musicState.audioPlaybackRate + '×</strong> · Effective BPM: <strong>' + (effectiveBpm || '—') + '</strong></div>';
    }
    html += '</div>';
    return html;
  }

  /* ── Main Render ─────────────────────────────────────────────────────── */
  function renderMusicPage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) return;
    if (page.hidden || page.style.display === 'none') return;

    var theme = themeClasses();

    var html = '';
    html += '<div class="rounded-3xl border shadow-sm overflow-hidden ' + theme.shell + '" style="transition:all .3s ease;">';

    // Header
    html += '<div class="px-6 py-5 border-b ' + theme.panel + '">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    html += '<div>';
    html += '<h2 style="font-size:20px;font-weight:900;margin:0;">Music Manager</h2>';
    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:4px 0 0;">Manage music info, detect BPM, and count beats for your dances</p>';
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Body
    html += '<div class="p-5 sm:p-6">';
    html += renderMusicInfo(theme);
    html += renderTapTempo(theme);
    html += renderAudioTools(theme);
    html += renderCountCalc(theme);
    html += renderMetronome(theme);
    html += renderBpmGuide(theme);
    html += '</div>';

    html += '</div>';

    page.innerHTML = html;
    attachMusicListeners(page);
  }

  /* ── Event Wiring ────────────────────────────────────────────────────── */
  function attachMusicListeners(page) {
    // Save music info
    var saveBtn = page.querySelector('[data-music-save]');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var data = loadBuilderData();
        if (!data.meta) data.meta = {};

        var titleInput = page.querySelector('[data-music-field="music"]');
        var artistInput = page.querySelector('[data-music-field="artist"]');
        var bpmInput = page.querySelector('[data-music-field="bpm"]');

        if (titleInput) data.meta.music = titleInput.value.trim();
        if (artistInput) data.meta.artist = artistInput.value.trim();
        if (bpmInput) data.meta.bpm = bpmInput.value.trim();

        saveBuilderData(data);
        _toast('Music info saved!');
      });
    }

    // Tap tempo
    var tapBtn = page.querySelector('[data-tap-btn]');
    if (tapBtn) {
      tapBtn.addEventListener('click', function () {
        var now = Date.now();
        musicState.tapTimestamps.push(now);

        // Keep last 8 taps
        if (musicState.tapTimestamps.length > MAX_TAP_SAMPLES) {
          musicState.tapTimestamps = musicState.tapTimestamps.slice(-MAX_TAP_SAMPLES);
        }

        // Need at least 2 taps for BPM
        if (musicState.tapTimestamps.length >= 2) {
          var stamps = musicState.tapTimestamps;
          var intervals = [];
          for (var i = 1; i < stamps.length; i++) {
            intervals.push(stamps[i] - stamps[i - 1]);
          }
          var avgInterval = 0;
          for (var j = 0; j < intervals.length; j++) {
            avgInterval += intervals[j];
          }
          avgInterval /= intervals.length;
          musicState.tapBPM = 60000 / avgInterval;
        }

        // Auto-reset if gap > 3 seconds from previous tap
        if (musicState.tapTimestamps.length >= 2) {
          var lastTwo = musicState.tapTimestamps.slice(-2);
          if (lastTwo[1] - lastTwo[0] > TAP_RESET_THRESHOLD_MS) {
            musicState.tapTimestamps = [now];
            musicState.tapBPM = 0;
          }
        }

        renderMusicPage();
      });
    }

    var fileInput = page.querySelector('[data-music-audio-file]');
    if (fileInput) {
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (musicState.audioUrl) {
          try { URL.revokeObjectURL(musicState.audioUrl); } catch (e) { /* ignore */ }
        }
        musicState.audioUrl = URL.createObjectURL(file);
        musicState.audioName = file.name || 'Imported audio';
        musicState.audioDuration = 0;
        musicState.audioDetectedBpm = 0;
        musicState.audioStartOffset = 0;
        musicState.audioPlaybackRate = 1;
        var reader = new FileReader();
        reader.onload = function () {
          _audioAnalysisBuffer = reader.result;
          detectBpmFromImportedAudio();
        };
        reader.readAsArrayBuffer(file);
        renderMusicPage();
      });
    }

    var detectBtn = page.querySelector('[data-music-detect-bpm]');
    if (detectBtn) detectBtn.addEventListener('click', function () { detectBpmFromImportedAudio(); });

    var player = page.querySelector('[data-music-audio-player]');
    if (player) {
      player.playbackRate = Number(musicState.audioPlaybackRate || 1);
      player.addEventListener('loadedmetadata', function () {
        musicState.audioDuration = Number(player.duration || 0);
        renderMusicPage();
      });
    }
    var startOffset = page.querySelector('[data-music-start-offset]');
    if (startOffset) {
      startOffset.addEventListener('change', function () {
        var n = Math.max(0, Number(startOffset.value || 0));
        musicState.audioStartOffset = n;
      });
    }
    var playTrim = page.querySelector('[data-music-play-trim]');
    if (playTrim) playTrim.addEventListener('click', function () {
      var p = page.querySelector('[data-music-audio-player]');
      if (!p) return;
      p.playbackRate = Number(musicState.audioPlaybackRate || 1);
      p.currentTime = Math.max(0, Number(musicState.audioStartOffset || 0));
      p.play().catch(function () { _toast('Could not play audio yet.'); });
    });
    var halfBtn = page.querySelector('[data-music-half]');
    if (halfBtn) halfBtn.addEventListener('click', function () { musicState.audioPlaybackRate = 0.5; renderMusicPage(); });
    var normalBtn = page.querySelector('[data-music-normal]');
    if (normalBtn) normalBtn.addEventListener('click', function () { musicState.audioPlaybackRate = 1; renderMusicPage(); });
    var doubleBtn = page.querySelector('[data-music-double]');
    if (doubleBtn) doubleBtn.addEventListener('click', function () { musicState.audioPlaybackRate = 2; renderMusicPage(); });

    // Tap reset
    var tapResetBtn = page.querySelector('[data-tap-reset]');
    if (tapResetBtn) {
      tapResetBtn.addEventListener('click', function () {
        musicState.tapTimestamps = [];
        musicState.tapBPM = 0;
        renderMusicPage();
      });
    }

    // Use tapped BPM
    var tapUseBtn = page.querySelector('[data-tap-use]');
    if (tapUseBtn) {
      tapUseBtn.addEventListener('click', function () {
        var roundedBpm = Math.round(musicState.tapBPM);
        var data = loadBuilderData();
        if (!data.meta) data.meta = {};
        data.meta.bpm = String(roundedBpm);
        saveBuilderData(data);
        _toast('BPM set to ' + roundedBpm + '!');
        renderMusicPage();
      });
    }

    // Count calculator
    var calcBtn = page.querySelector('[data-calc-go]');
    if (calcBtn) {
      calcBtn.addEventListener('click', function () {
        var bpmInput = page.querySelector('[data-calc-bpm]');
        var durInput = page.querySelector('[data-calc-duration]');
        var resultEl = page.querySelector('[data-calc-result]');
        if (!bpmInput || !durInput || !resultEl) return;

        var bpm = parseFloat(bpmInput.value);
        var duration = parseFloat(durInput.value);

        if (!bpm || bpm <= 0 || !duration || duration <= 0) {
          resultEl.innerHTML = '<span style="color:#ef4444;">Please enter valid BPM and duration</span>';
          return;
        }

        var totalBeats = Math.round((bpm / 60) * duration);
        var eightCounts = Math.floor(totalBeats / 8);
        var remainder = totalBeats % 8;

        var msg = '= <strong>' + totalBeats + ' total beats</strong>';
        msg += ' (' + eightCounts + ' eight-counts';
        if (remainder > 0) msg += ' + ' + remainder + ' beats';
        msg += ')';
        resultEl.innerHTML = msg;
      });
    }

    // Metronome toggle
    var metroToggle = page.querySelector('[data-metro-toggle]');
    if (metroToggle) {
      metroToggle.addEventListener('click', function () {
        if (musicState.metronomeRunning) {
          stopMetronome();
        } else {
          var bpmInput = page.querySelector('[data-metro-bpm]');
          var bpm = bpmInput ? parseFloat(bpmInput.value) : 120;
          if (!bpm || bpm < 20 || bpm > 300) bpm = 120;
          startMetronome(bpm);
        }
        renderMusicPage();
      });
    }

    // Metronome BPM input change while running
    var metroBpmInput = page.querySelector('[data-metro-bpm]');
    if (metroBpmInput) {
      metroBpmInput.addEventListener('change', function () {
        if (musicState.metronomeRunning) {
          var newBpm = parseFloat(metroBpmInput.value);
          if (newBpm && newBpm >= 20 && newBpm <= 300) {
            stopMetronome();
            startMetronome(newBpm);
            renderMusicPage();
          }
        }
      });
    }

    // Metronome presets
    var presetBtns = page.querySelectorAll('[data-metro-preset]');
    for (var i = 0; i < presetBtns.length; i++) {
      presetBtns[i].addEventListener('click', function () {
        var bpm = parseInt(this.getAttribute('data-metro-preset'), 10);
        musicState.metronomeBPM = bpm;
        if (musicState.metronomeRunning) {
          stopMetronome();
          startMetronome(bpm);
        }
        renderMusicPage();
      });
    }
  }

  /* ── Metronome Engine ────────────────────────────────────────────────── */
  var _beatIndex = 0;

  function startMetronome(bpm) {
    stopMetronome();
    musicState.metronomeBPM = bpm;
    musicState.metronomeRunning = true;
    _beatIndex = 0;

    var intervalMs = 60000 / bpm;

    function tick() {
      var page = document.getElementById(PAGE_ID);
      if (!page) { stopMetronome(); return; }

      var dots = page.querySelectorAll('[data-metro-dot]');
      var statusEl = page.querySelector('[data-metro-status]');

      // Reset all dots
      for (var d = 0; d < dots.length; d++) {
        var dark = isDarkMode();
        dots[d].style.background = dark ? '#374151' : '#d1d5db';
        dots[d].style.boxShadow = 'none';
        dots[d].classList.remove('active');
      }

      // Activate current beat
      var currentDot = dots[_beatIndex % 4];
      if (currentDot) {
        var dotColor = isDarkMode() ? '#6366f1' : '#4f46e5';
        var isDownbeat = (_beatIndex % 4 === 0);
        currentDot.style.background = isDownbeat ? '#f59e0b' : dotColor;
        currentDot.style.boxShadow = '0 0 20px ' + (isDownbeat ? '#f59e0b' : dotColor);
        currentDot.classList.add('active');
      }

      if (statusEl) {
        statusEl.textContent = 'Beat ' + ((_beatIndex % 4) + 1) + ' of 4 — ' + bpm + ' BPM';
      }

      _beatIndex++;
    }

    // Immediate first tick
    tick();
    musicState.metronomeInterval = setInterval(tick, intervalMs);
  }

  function stopMetronome() {
    if (musicState.metronomeInterval) {
      clearInterval(musicState.metronomeInterval);
      musicState.metronomeInterval = null;
    }
    musicState.metronomeRunning = false;
    musicState.metronomeBeat = false;
    _beatIndex = 0;
  }

  /* ── Public API ──────────────────────────────────────────────────────── */
  window.__stepperMusicTab = {
    PAGE_ID: PAGE_ID,
    TAB_ID:  TAB_ID,

    render: function () {
      ensurePage();
      ensureMusicStyles();
      renderMusicPage();
    },

    getState: function () {
      return musicState;
    },

    icon: function () {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    },

    stopMetronome: stopMetronome
  };

})();
