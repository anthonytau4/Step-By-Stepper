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
  var STUDIO_PROJECT_KEY = 'stepper_music_studio_project_v1';
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
    audioCurrentTime: 0,
    audioDetectedBpm: 0,
    audioStartOffset: 0,
    audioCountFeel: 1,
    audioVolume: 1,
    audioLoop: false,
    audioAnalyzing: false,
    studioOpen: false,
    studioFullPageOpen: false,
    tempoRampTimer: null,
    tempoRampConfig: null
  };
  var _audioAnalysisBuffer = null;
  var _lameLoadPromise = null;

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

  function getSession() {
    try { return JSON.parse(localStorage.getItem('stepper_google_auth_session_v2') || 'null'); }
    catch (e) { return null; }
  }

  function isPremiumSession() {
    var s = getSession() || {};
    var role = String(s.role || s.userRole || '').toLowerCase();
    if (role === 'admin' || role === 'moderator') return true;
    if (s.isPremium === true) return true;
    if (s.membership && s.membership.isPremium) return true;
    return false;
  }

  function saveBuilderData(data) {
    try { localStorage.setItem(BUILDER_DATA_KEY, JSON.stringify(data)); }
    catch (e) { /* quota */ }
  }

  function defaultStudioProject() {
    return {
      title: '',
      artist: '',
      bpm: '',
      level: '',
      counts: '',
      walls: '',
      introCounts: '',
      tagsRestarts: '',
      notes: '',
      sections: ['Intro', 'Verse 1', 'Chorus', 'Verse 2', 'Bridge', 'Finale'],
      regions: [
        { id: 'r1', label: 'Intro', start: 0, len: 16 },
        { id: 'r2', label: 'Verse', start: 16, len: 32 },
        { id: 'r3', label: 'Chorus', start: 48, len: 32 }
      ],
      selectedRegionId: 'r1'
    };
  }

  function loadStudioProject() {
    try {
      var raw = JSON.parse(localStorage.getItem(STUDIO_PROJECT_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return defaultStudioProject();
      var next = defaultStudioProject();
      Object.assign(next, raw);
      if (!Array.isArray(next.sections)) next.sections = defaultStudioProject().sections;
      if (!Array.isArray(next.regions) || !next.regions.length) next.regions = defaultStudioProject().regions;
      return next;
    } catch (e) {
      return defaultStudioProject();
    }
  }

  function saveStudioProject(project) {
    try { localStorage.setItem(STUDIO_PROJECT_KEY, JSON.stringify(project || defaultStudioProject())); }
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

  function isAndroidDevice() {
    try {
      var ua = String((navigator && navigator.userAgent) || '').toLowerCase();
      return ua.indexOf('android') !== -1;
    } catch (e) {
      return false;
    }
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

  function formatTime(seconds) {
    var total = Math.max(0, Number(seconds || 0));
    var mins = Math.floor(total / 60);
    var secs = Math.floor(total % 60);
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  }

  function formatSongArtistLine(song, artist) {
    var s = String(song || '').trim();
    var a = String(artist || '').trim();
    if (s && a) return s + ' - ' + a;
    return s || a || '';
  }

  function splitSongArtistLine(text) {
    var raw = String(text || '').trim();
    if (!raw) return { song: '', artist: '' };
    var parts = raw.split(/\s[-–—]\s/);
    if (parts.length >= 2) {
      return { song: String(parts[0] || '').trim(), artist: String(parts.slice(1).join(' - ') || '').trim() };
    }
    return { song: raw, artist: '' };
  }

  function stopTempoRamp() {
    if (musicState.tempoRampTimer) {
      clearInterval(musicState.tempoRampTimer);
      musicState.tempoRampTimer = null;
    }
    musicState.tempoRampConfig = null;
  }

  function _tempoRampDurationSeconds(player, cfg) {
    if (!cfg) return 0;
    if (cfg.fullSong) return Math.max(0.01, Number(player.duration || musicState.audioDuration || 0));
    return Math.max(0.01, Number(cfg.seconds || 0));
  }

  function applyTempoRampForPlayerTime(player) {
    var cfg = musicState.tempoRampConfig;
    if (!player || !cfg) return;
    var dur = _tempoRampDurationSeconds(player, cfg);
    var t = Math.max(0, Math.min(1, Number(player.currentTime || 0) / dur));
    player.playbackRate = cfg.from + (cfg.to - cfg.from) * t;
  }

  function ensureSpeedChangeWithoutPitchShift(player) {
    if (!player) return;
    try { player.preservesPitch = true; } catch (e) { /* ignore */ }
    try { player.mozPreservesPitch = true; } catch (e2) { /* ignore */ }
    try { player.webkitPreservesPitch = true; } catch (e3) { /* ignore */ }
  }

  function startTempoRamp(player, fromRate, toRate, seconds, fullSong) {
    if (!player) return;
    ensureSpeedChangeWithoutPitchShift(player);
    stopTempoRamp();
    var start = Math.max(0.5, Math.min(2.5, Number(fromRate || 1)));
    var end = Math.max(0.5, Math.min(2.5, Number(toRate || 1)));
    musicState.tempoRampConfig = {
      from: start,
      to: end,
      seconds: Math.max(1, Number(seconds || 1)),
      fullSong: !!fullSong
    };
    applyTempoRampForPlayerTime(player);
  }

  function normalizeDetectedBpm(bpm) {
    var value = Number(bpm || 0);
    if (!value || !isFinite(value)) return 0;
    while (value < 70) value *= 2;
    while (value > 190) value /= 2;
    return value;
  }

  function _readSynchsafeInt(b1, b2, b3, b4) {
    return ((b1 & 0x7f) << 21) | ((b2 & 0x7f) << 14) | ((b3 & 0x7f) << 7) | (b4 & 0x7f);
  }

  function parseId3Metadata(arrayBuffer) {
    try {
      var bytes = new Uint8Array(arrayBuffer || new ArrayBuffer(0));
      if (bytes.length < 10) return { title: '', artist: '' };
      if (String.fromCharCode(bytes[0], bytes[1], bytes[2]) !== 'ID3') return { title: '', artist: '' };
      var tagSize = _readSynchsafeInt(bytes[6], bytes[7], bytes[8], bytes[9]);
      var end = Math.min(bytes.length, 10 + tagSize);
      var offset = 10;
      var out = { title: '', artist: '' };
      while (offset + 10 <= end) {
        var id = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
        var size = (bytes[offset + 4] << 24) | (bytes[offset + 5] << 16) | (bytes[offset + 6] << 8) | bytes[offset + 7];
        if (!id.replace(/\u0000/g, '').trim() || size <= 0 || offset + 10 + size > end) break;
        if (id === 'TIT2' || id === 'TPE1') {
          var raw = bytes.slice(offset + 10, offset + 10 + size);
          var encoding = raw[0];
          var textBytes = raw.slice(1);
          var text = '';
          try {
            if (encoding === 1 || encoding === 2) text = new TextDecoder('utf-16').decode(textBytes);
            else text = new TextDecoder('latin1').decode(textBytes);
          } catch (e) {
            text = '';
          }
          text = String(text || '').replace(/\u0000/g, '').trim();
          if (id === 'TIT2' && text) out.title = text;
          if (id === 'TPE1' && text) out.artist = text;
        }
        offset += 10 + size;
      }
      return out;
    } catch (e) {
      return { title: '', artist: '' };
    }
  }

  function parseTitleArtistFromFilename(fileName) {
    var base = String(fileName || '')
      .replace(/\.[a-z0-9]{2,6}$/i, '')
      .replace(/[_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!base) return { title: '', artist: '' };
    var stripped = base
      .replace(/\[[^\]]+\]/g, ' ')
      .replace(/\([^)]+\)/g, ' ')
      .replace(/\b(official|audio|video|lyric|lyrics|hq|hd|remaster(ed)?|clean|explicit|version|edit)\b/ig, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    var splitters = [' - ', ' – ', ' — ', ' | ', ' by '];
    for (var i = 0; i < splitters.length; i++) {
      var sep = splitters[i];
      var idx = stripped.toLowerCase().indexOf(sep.trim().toLowerCase());
      if (idx > 0) {
        var parts = stripped.split(new RegExp(sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
        if (parts.length >= 2) {
          var left = String(parts[0] || '').trim();
          var right = String(parts.slice(1).join(' ') || '').trim();
          if (left && right) {
            // Most file naming conventions are "Artist - Song"
            return { artist: left, title: right };
          }
        }
      }
    }
    return { title: stripped, artist: '' };
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
        var proj = loadStudioProject();
        proj.bpm = String(musicState.audioDetectedBpm);
        saveStudioProject(proj);
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

  function _arrayBufferToWaveBlob(audioBuffer, gain) {
    var channels = Math.max(1, Number(audioBuffer.numberOfChannels || 1));
    var sampleRate = Number(audioBuffer.sampleRate || 44100);
    var length = Math.max(0, Number(audioBuffer.length || 0));
    var bytesPerSample = 2;
    var blockAlign = channels * bytesPerSample;
    var dataSize = length * blockAlign;
    var buffer = new ArrayBuffer(44 + dataSize);
    var view = new DataView(buffer);
    var offset = 0;
    var volume = Math.max(0, Math.min(2, Number(gain || 1)));

    function writeString(str) {
      for (var i = 0; i < str.length; i++) view.setUint8(offset++, str.charCodeAt(i));
    }
    function writeUint16(v) { view.setUint16(offset, v, true); offset += 2; }
    function writeUint32(v) { view.setUint32(offset, v, true); offset += 4; }

    writeString('RIFF');
    writeUint32(36 + dataSize);
    writeString('WAVE');
    writeString('fmt ');
    writeUint32(16);
    writeUint16(1);
    writeUint16(channels);
    writeUint32(sampleRate);
    writeUint32(sampleRate * blockAlign);
    writeUint16(blockAlign);
    writeUint16(16);
    writeString('data');
    writeUint32(dataSize);

    var channelData = [];
    for (var c = 0; c < channels; c++) channelData.push(audioBuffer.getChannelData(c));
    for (var iS = 0; iS < length; iS++) {
      for (var c2 = 0; c2 < channels; c2++) {
        var sample = (channelData[c2][iS] || 0) * volume;
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }
    return new Blob([view], { type: 'audio/wav' });
  }

  function ensureMp3EncoderLoaded() {
    if (window.lamejs && typeof window.lamejs.Mp3Encoder === 'function') {
      return Promise.resolve(window.lamejs);
    }
    return Promise.reject(new Error('MP3 encoder unavailable.'));
  }

  function _floatTo16BitPCM(input) {
    var output = new Int16Array(input.length);
    for (var i = 0; i < input.length; i++) {
      var s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }

  function encodeAudioBufferToMp3Blob(audioBuffer, kbps) {
    return ensureMp3EncoderLoaded().then(function (lamejs) {
      var channels = Math.max(1, Math.min(2, Number(audioBuffer.numberOfChannels || 1)));
      var sampleRate = Number(audioBuffer.sampleRate || 44100);
      var bitrate = Math.max(96, Math.min(320, Number(kbps || 192)));
      var mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
      var samplesL = _floatTo16BitPCM(audioBuffer.getChannelData(0));
      var samplesR = channels > 1 ? _floatTo16BitPCM(audioBuffer.getChannelData(1)) : null;
      var chunk = 1152;
      var out = [];
      for (var i = 0; i < samplesL.length; i += chunk) {
        var leftChunk = samplesL.subarray(i, i + chunk);
        var mp3buf = channels > 1
          ? mp3Encoder.encodeBuffer(leftChunk, samplesR.subarray(i, i + chunk))
          : mp3Encoder.encodeBuffer(leftChunk);
        if (mp3buf.length > 0) out.push(new Uint8Array(mp3buf));
      }
      var endBuf = mp3Encoder.flush();
      if (endBuf.length > 0) out.push(new Uint8Array(endBuf));
      return new Blob(out, { type: 'audio/mpeg' });
    });
  }

  function encodeAudioBufferToMp3ViaWebCodecs(audioBuffer, kbps) {
    return new Promise(function (resolve, reject) {
      try {
        if (typeof AudioEncoder === 'undefined' || typeof AudioData === 'undefined') {
          reject(new Error('WebCodecs is unavailable.'));
          return;
        }
        var channels = Math.max(1, Math.min(2, Number(audioBuffer.numberOfChannels || 1)));
        var sampleRate = Number(audioBuffer.sampleRate || 44100);
        var bitrate = Math.max(96000, Math.min(320000, Number(kbps || 192000)));
        AudioEncoder.isConfigSupported({
          codec: 'mp3',
          sampleRate: sampleRate,
          numberOfChannels: channels,
          bitrate: bitrate
        }).then(function (support) {
          if (!support || !support.supported) {
            reject(new Error('MP3 codec is not supported by WebCodecs.'));
            return;
          }
          var chunks = [];
          var encoder = new AudioEncoder({
            output: function (chunk) {
              var out = new Uint8Array(chunk.byteLength);
              chunk.copyTo(out);
              chunks.push(out);
            },
            error: function (err) { reject(err || new Error('WebCodecs MP3 encode failed.')); }
          });
          encoder.configure({
            codec: 'mp3',
            sampleRate: sampleRate,
            numberOfChannels: channels,
            bitrate: bitrate
          });

          var frameSize = 1152;
          var numFrames = Number(audioBuffer.length || 0);
          var timestampUs = 0;
          var frameDurUs = Math.round((frameSize / sampleRate) * 1e6);
          for (var i = 0; i < numFrames; i += frameSize) {
            var size = Math.min(frameSize, numFrames - i);
            var planar = new Float32Array(size * channels);
            for (var c = 0; c < channels; c++) {
              var src = audioBuffer.getChannelData(c).subarray(i, i + size);
              planar.set(src, c * size);
            }
            var audioData = new AudioData({
              format: 'f32-planar',
              sampleRate: sampleRate,
              numberOfFrames: size,
              numberOfChannels: channels,
              timestamp: timestampUs,
              data: planar
            });
            encoder.encode(audioData);
            audioData.close();
            timestampUs += frameDurUs;
          }
          encoder.flush().then(function () {
            encoder.close();
            if (!chunks.length) {
              reject(new Error('No MP3 data generated by WebCodecs.'));
              return;
            }
            resolve(new Blob(chunks, { type: 'audio/mpeg' }));
          }).catch(function (err) {
            try { encoder.close(); } catch (e) { /* ignore */ }
            reject(err || new Error('WebCodecs flush failed.'));
          });
        }).catch(function (err) {
          reject(err || new Error('WebCodecs support check failed.'));
        });
      } catch (err) {
        reject(err || new Error('WebCodecs MP3 path failed.'));
      }
    });
  }

  function encodeAudioBufferToMp3ViaRecorder(audioBuffer) {
    return new Promise(function (resolve, reject) {
      if (typeof MediaRecorder === 'undefined') {
        reject(new Error('MediaRecorder unavailable.'));
        return;
      }
      var mime = 'audio/mpeg';
      if (!MediaRecorder.isTypeSupported || !MediaRecorder.isTypeSupported(mime)) {
        reject(new Error('audio/mpeg recording is not supported in this browser.'));
        return;
      }
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        reject(new Error('Web Audio unavailable.'));
        return;
      }
      var liveCtx = new AudioCtx();
      var src = liveCtx.createBufferSource();
      src.buffer = audioBuffer;
      var gain = liveCtx.createGain();
      gain.gain.value = 1;
      var dest = liveCtx.createMediaStreamDestination();
      src.connect(gain);
      gain.connect(dest);
      var recorder = new MediaRecorder(dest.stream, { mimeType: mime });
      var chunks = [];
      recorder.ondataavailable = function (ev) {
        if (ev && ev.data && ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onerror = function () {
        try { liveCtx.close(); } catch (e1) { /* ignore */ }
        reject(new Error('Recorder failed.'));
      };
      recorder.onstop = function () {
        try { liveCtx.close(); } catch (e2) { /* ignore */ }
        if (!chunks.length) {
          reject(new Error('No MP3 data generated.'));
          return;
        }
        var outBlob = new Blob(chunks, { type: mime });
        isLikelyMp3Blob(outBlob).then(function (ok) {
          if (!ok) {
            reject(new Error('Browser recorder returned non-MP3 data.'));
            return;
          }
          resolve(outBlob);
        }).catch(function () {
          reject(new Error('Could not validate recorder MP3 output.'));
        });
      };
      recorder.start(100);
      src.start(0);
      src.onended = function () {
        if (recorder.state !== 'inactive') recorder.stop();
      };
    });
  }

  function isLikelyMp3Blob(blob) {
    if (!blob || typeof blob.arrayBuffer !== 'function') return Promise.resolve(false);
    return blob.arrayBuffer().then(function (ab) {
      var u8 = new Uint8Array(ab || new ArrayBuffer(0));
      if (u8.length < 4) return false;
      // ID3 header
      if (u8[0] === 0x49 && u8[1] === 0x44 && u8[2] === 0x33) return true;
      // MPEG frame sync (11111111 111xxxxx)
      return (u8[0] === 0xff) && ((u8[1] & 0xe0) === 0xe0);
    }).catch(function () {
      return false;
    });
  }

  function capturePitchPreservedWavFromPlayer(player, opts) {
    return new Promise(function (resolve, reject) {
      if (!player) {
        reject(new Error('Audio player is unavailable for pitch-preserved export.'));
        return;
      }
      if (typeof MediaRecorder === 'undefined') {
        reject(new Error('MediaRecorder is unavailable for pitch-preserved export.'));
        return;
      }
      if (!player.captureStream && !player.mozCaptureStream) {
        reject(new Error('This browser cannot capture audio playback for pitch-preserved export.'));
        return;
      }
      var stream = player.captureStream ? player.captureStream() : player.mozCaptureStream();
      if (!stream) {
        reject(new Error('Could not capture player stream for export.'));
        return;
      }
      var mimeChoices = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
      var mime = '';
      for (var m = 0; m < mimeChoices.length; m++) {
        if (!MediaRecorder.isTypeSupported || MediaRecorder.isTypeSupported(mimeChoices[m])) {
          mime = mimeChoices[m];
          break;
        }
      }
      if (!mime) {
        reject(new Error('No supported recorder format for pitch-preserved export.'));
        return;
      }

      var original = {
        currentTime: Number(player.currentTime || 0),
        playbackRate: Number(player.playbackRate || 1),
        volume: Number(player.volume || 1),
        paused: !!player.paused
      };
      var offset = Math.max(0, Number(opts.offsetSeconds || 0));
      var fromRate = Math.max(0.5, Math.min(2.5, Number(opts.fromRate || 1)));
      var toRate = Math.max(0.5, Math.min(2.5, Number(opts.toRate || fromRate)));
      var cfg = opts.cfg || null;
      var expectedSeconds = Math.max(0.2, Number(opts.expectedSeconds || 0.2));
      var outGain = Math.max(0, Math.min(1, Number(opts.volume || 1)));

      var chunks = [];
      var recorder = new MediaRecorder(stream, { mimeType: mime });
      var rampTimer = null;
      var stopTimer = null;
      var endedHandler = null;
      var finished = false;

      function cleanupAndRestore() {
        if (rampTimer) clearInterval(rampTimer);
        if (stopTimer) clearTimeout(stopTimer);
        if (endedHandler) player.removeEventListener('ended', endedHandler);
        try { player.pause(); } catch (e1) { /* ignore */ }
        try { player.currentTime = original.currentTime; } catch (e2) { /* ignore */ }
        try { player.playbackRate = original.playbackRate; } catch (e3) { /* ignore */ }
        try { player.volume = original.volume; } catch (e4) { /* ignore */ }
        if (!original.paused) {
          Promise.resolve(player.play()).catch(function () { /* ignore */ });
        }
        try {
          var tracks = stream.getTracks ? stream.getTracks() : [];
          tracks.forEach(function (t) { try { t.stop(); } catch (e5) { /* ignore */ } });
        } catch (e6) { /* ignore */ }
      }

      function finalizeBlob(rawBlob) {
        if (!rawBlob || !rawBlob.size) {
          reject(new Error('Pitch-preserved export produced empty audio.'));
          return;
        }
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
          reject(new Error('Web Audio decode is unavailable for WAV conversion.'));
          return;
        }
        var decodeCtx = new AudioCtx();
        rawBlob.arrayBuffer().then(function (ab) {
          return decodeCtx.decodeAudioData(ab);
        }).then(function (decoded) {
          var wavBlob = _arrayBufferToWaveBlob(decoded, 1);
          try { decodeCtx.close(); } catch (e7) { /* ignore */ }
          resolve(wavBlob);
        }).catch(function () {
          try { decodeCtx.close(); } catch (e8) { /* ignore */ }
          reject(new Error('Could not decode captured audio for WAV export.'));
        });
      }

      recorder.ondataavailable = function (ev) {
        if (ev && ev.data && ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.onerror = function () {
        if (finished) return;
        finished = true;
        cleanupAndRestore();
        reject(new Error('Recorder failed during pitch-preserved export.'));
      };
      recorder.onstop = function () {
        if (finished) return;
        finished = true;
        cleanupAndRestore();
        finalizeBlob(new Blob(chunks, { type: mime }));
      };

      var startMs = Date.now();
      function applyRate() {
        var elapsed = (Date.now() - startMs) / 1000;
        var nextRate = fromRate;
        if (cfg) {
          if (cfg.fullSong) {
            var t = Math.min(1, Math.max(0, elapsed / expectedSeconds));
            nextRate = fromRate + (toRate - fromRate) * t;
          } else {
            var rampSecs = Math.max(0.01, Math.min(expectedSeconds, Number(cfg.seconds || 1)));
            if (elapsed < rampSecs) {
              var r = Math.min(1, Math.max(0, elapsed / rampSecs));
              nextRate = fromRate + (toRate - fromRate) * r;
            } else {
              nextRate = toRate;
            }
          }
        }
        try { player.playbackRate = Math.max(0.5, Math.min(2.5, nextRate)); } catch (e9) { /* ignore */ }
      }

      try {
        player.preservesPitch = true;
        player.mozPreservesPitch = true;
        player.webkitPreservesPitch = true;
      } catch (e10) { /* ignore */ }
      try { player.currentTime = offset; } catch (e11) { /* ignore */ }
      player.volume = outGain;
      applyRate();
      recorder.start(100);
      endedHandler = function () {
        if (recorder.state !== 'inactive') recorder.stop();
      };
      player.addEventListener('ended', endedHandler, { once: true });
      rampTimer = setInterval(applyRate, 50);
      stopTimer = setTimeout(function () {
        if (recorder.state !== 'inactive') recorder.stop();
      }, Math.ceil((expectedSeconds + 0.25) * 1000));
      Promise.resolve(player.play()).catch(function () {
        if (recorder.state !== 'inactive') recorder.stop();
      });
    });
  }

  function exportEditedAudio() {
    if (!_audioAnalysisBuffer) {
      _toast('Import an MP3 first.');
      return;
    }
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      _toast('Export needs Web Audio support.');
      return;
    }
    var ctx = new AudioCtx();
    ctx.decodeAudioData(_audioAnalysisBuffer.slice(0)).then(function (decoded) {
      var offsetSeconds = Math.max(0, Number(musicState.audioStartOffset || 0));
      var channels = Math.max(1, decoded.numberOfChannels || 1);
      var player = document.querySelector('[data-music-audio-player]');
      var cfg = musicState.tempoRampConfig;
      var baseRate = player ? Math.max(0.5, Math.min(2.5, Number(player.playbackRate || 1))) : 1;
      var fromRate = cfg ? Math.max(0.5, Math.min(2.5, Number(cfg.from || baseRate || 1))) : baseRate;
      var toRate = cfg ? Math.max(0.5, Math.min(2.5, Number(cfg.to || fromRate || 1))) : fromRate;
      var sourceDuration = Math.max(0.01, Number(decoded.duration || 0) - offsetSeconds);
      var avgRate = Math.max(0.5, (fromRate + toRate) / 2);
      var estimatedOutSeconds = Math.max(0.2, sourceDuration / avgRate);
      var hasSpeedChange = Math.abs(fromRate - 1) > 0.001 || Math.abs(toRate - 1) > 0.001;
      if (hasSpeedChange && player) {
        return capturePitchPreservedWavFromPlayer(player, {
          offsetSeconds: offsetSeconds,
          expectedSeconds: estimatedOutSeconds,
          fromRate: fromRate,
          toRate: toRate,
          cfg: cfg,
          volume: Number(musicState.audioVolume || 1)
        }).then(function (wavBlob) {
          if (!wavBlob || !wavBlob.size) throw new Error('Export produced an empty WAV file.');
          var baseName = String(musicState.audioName || 'edited-track').replace(/\.[a-z0-9]{2,6}$/i, '');
          var a = document.createElement('a');
          a.href = URL.createObjectURL(wavBlob);
          a.download = baseName + '-edited.wav';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            try { URL.revokeObjectURL(a.href); } catch (e0) { /* ignore */ }
            a.remove();
          }, 0);
          _toast('Edited WAV exported (sped up + original pitch preserved).');
          try { ctx.close(); } catch (e1) { /* ignore */ }
        });
      }
      estimatedOutSeconds = Math.max(0.2, sourceDuration);
      var renderSampleRate = 44100;
      var offlineLen = Math.max(1, Math.ceil(renderSampleRate * estimatedOutSeconds));
      var OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!OfflineCtx) {
        _toast('Offline export is not supported in this browser.');
        try { ctx.close(); } catch (e1) { /* ignore */ }
        return;
      }
      var offline = new OfflineCtx(channels, offlineLen, renderSampleRate);
      var source = offline.createBufferSource();
      source.buffer = decoded;
      source.playbackRate.setValueAtTime(1, 0);
      var gainNode = offline.createGain();
      gainNode.gain.value = Math.max(0, Math.min(2, Number(musicState.audioVolume || 1)));
      source.connect(gainNode);
      gainNode.connect(offline.destination);
      source.start(0, offsetSeconds);
      var blobPromise = offline.startRendering().then(function (rendered) {
        return _arrayBufferToWaveBlob(rendered, 1);
      });
      return blobPromise.then(function (wavBlob) {
      if (!wavBlob || !wavBlob.size) throw new Error('Export produced an empty WAV file.');
      var baseName = String(musicState.audioName || 'edited-track').replace(/\.[a-z0-9]{2,6}$/i, '');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(wavBlob);
      a.download = baseName + '-edited.wav';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        try { URL.revokeObjectURL(a.href); } catch (e) { /* ignore */ }
        a.remove();
      }, 0);
      _toast('Edited WAV exported (original pitch preserved).');
      try { ctx.close(); } catch (e2) { /* ignore */ }
      });
    }).catch(function (err) {
      try { ctx.close(); } catch (e3) { /* ignore */ }
      _toast((err && err.message) ? ('Export failed: ' + err.message) : 'Could not export this audio file.');
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
      '#' + PAGE_ID + ' .tap-btn:active { transform:scale(.93); }',
      '#' + PAGE_ID + '.stepper-android-layout .music-card { border-radius:16px!important;padding:14px!important; }',
      '#' + PAGE_ID + '.stepper-android-layout .music-card:hover { transform:none;box-shadow:none; }',
      '#' + PAGE_ID + '.stepper-android-layout table { font-size:12px!important; }',
      '#' + PAGE_ID + '.stepper-android-layout button { max-width:100%; }',
      '@media (max-width:900px) { #' + PAGE_ID + '.stepper-android-layout [data-music-audio-file] { width:100%;max-width:100%; } }',
      '@media (max-width:900px) { #' + PAGE_ID + '.stepper-android-layout [data-music-compact-grid] { grid-template-columns:1fr!important; } }',
      '@media (max-width:900px) { #' + PAGE_ID + '.stepper-android-layout [data-music-compact-actions] { display:grid!important;grid-template-columns:1fr 1fr;gap:8px!important; } }',
      '@media (max-width:520px) { #' + PAGE_ID + '.stepper-android-layout [data-music-compact-actions] { grid-template-columns:1fr!important; } }',
      '@media (max-width:900px) { #' + PAGE_ID + '.stepper-android-layout [data-music-compact-actions] button { width:100%;padding:10px 8px!important;font-size:11px!important; } }',
      '@media (max-width:900px) { #' + PAGE_ID + '.stepper-android-layout [data-music-transport-wrap] { width:100%;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr)); } }',
      '@media (max-width:900px) { #' + PAGE_ID + '.stepper-android-layout [data-music-transport-wrap] button { width:100%; } }',
      '@media (max-width:900px) { #' + PAGE_ID + '.stepper-android-layout [data-music-header-actions] { flex-direction:column!important;align-items:stretch!important; } }'
      ,
      '@media (max-width:1200px) { #' + PAGE_ID + '.stepper-android-layout [data-music-compact-grid] { grid-template-columns:1fr!important; } }',
      '@media (max-width:1200px) { #' + PAGE_ID + '.stepper-android-layout [data-music-header-actions] { flex-direction:column!important;align-items:stretch!important; } }',
      '@media (max-width:1200px) { #' + PAGE_ID + '.stepper-android-layout [data-music-transport-wrap] { width:100%;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr)); } }',
      '@media (max-width:1200px) { #' + PAGE_ID + '.stepper-android-layout [data-music-transport-wrap] button { width:100%; } }'
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
    var musicTitleLine = formatSongArtistLine(musicTitle, artist);

    var html = '';
    html += '<div class="music-card rounded-2xl border p-5 ' + theme.panel + '" style="margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
    html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;flex-shrink:0;"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0;">Current Dance Music Info</h3>';
    html += '</div>';

    html += '<div style="display:grid;gap:14px;">';

    // Song Title
    html += '<div>';
    html += '<label style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;" class="' + theme.subtle + '">Song Title - Artist</label>';
    html += '<input data-music-field="music" type="text" value="' + escapeHtml(musicTitleLine) + '" placeholder="Song name - Artist name" ';
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

  function renderStudioFullPage(theme) {
    var p = loadStudioProject();
    var html = '';
    html += '<style>';
    html += '.studio-full-shell{min-height:78vh;max-width:100%;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;}';
    html += '.studio-full-header{padding:12px 14px;border-bottom:1px solid;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;}';
    html += '.studio-full-title{font-weight:900;max-width:100%;overflow-wrap:anywhere;}';
    html += '.studio-full-header-actions{display:flex;gap:8px;flex-wrap:wrap;}';
    html += '.studio-full-layout{display:grid;grid-template-columns:320px minmax(760px,1fr);min-height:68vh;min-width:1080px;}';
    html += '.studio-full-main{min-width:760px;}';
    html += '.studio-full-mixer{margin-top:10px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}';
    html += '.studio-full-header-actions{width:100%;}';
    html += '.studio-full-header-actions button{flex:1 1 160px;}';
    html += '@media (max-width:980px){.studio-full-layout{grid-template-columns:1fr;min-width:0;min-height:auto;}.studio-full-main{min-width:0;}.studio-full-aside{border-right:none!important;border-bottom:1px solid rgba(148,163,184,.28);} .studio-full-mixer{grid-template-columns:1fr;}.studio-full-header-actions button{flex:1 1 100%;}}';
    html += '</style>';
    html += '<div class="studio-full-shell rounded-3xl border ' + theme.shell + '">';
    html += '<div class="studio-full-header ' + theme.panel + '">';
    html += '<div class="studio-full-title">🎛 Step-By-Stepper Studio — Full Page</div>';
    html += '<div class="studio-full-header-actions">';
    html += '<button data-music-studio-back style="padding:8px 12px;border:none;border-radius:8px;cursor:pointer;' + theme.btnSecondary + '">Back to Music Tools</button>';
    html += '<button data-music-studio-save style="padding:8px 12px;border:none;border-radius:8px;cursor:pointer;' + theme.btnPrimary + '">Save Worksheet</button>';
    html += '</div></div>';
    html += '<div class="studio-full-layout">';
    html += '<aside class="studio-full-aside" style="border-right:1px solid ' + (theme.dark ? '#2d3748' : '#d1d5db') + ';padding:12px;' + (theme.dark ? 'background:#0f172a;' : 'background:#f8fafc;') + '">';
    html += '<div style="display:grid;gap:8px;">';
    html += '<input data-studio-field="title" value="' + escapeHtml(p.title || '') + '" placeholder="Dance Title" style="padding:8px 10px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<input data-studio-field="artist" value="' + escapeHtml(p.artist || '') + '" placeholder="Artist" style="padding:8px 10px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<input data-studio-field="bpm" value="' + escapeHtml(p.bpm || '') + '" placeholder="BPM" style="padding:8px 10px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<input data-studio-field="level" value="' + escapeHtml(p.level || '') + '" placeholder="Level" style="padding:8px 10px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<input data-studio-field="counts" value="' + escapeHtml(p.counts || '') + '" placeholder="Counts" style="padding:8px 10px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<input data-studio-field="walls" value="' + escapeHtml(p.walls || '') + '" placeholder="Walls" style="padding:8px 10px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<input data-studio-field="introCounts" value="' + escapeHtml(p.introCounts || '') + '" placeholder="Intro Counts" style="padding:8px 10px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<textarea data-studio-field="tagsRestarts" rows="3" placeholder="Tags / Restarts" style="padding:8px 10px;border:1px solid;border-radius:8px;' + theme.inputBg + '">' + escapeHtml(p.tagsRestarts || '') + '</textarea>';
    html += '<textarea data-studio-field="notes" rows="4" placeholder="Cue Notes" style="padding:8px 10px;border:1px solid;border-radius:8px;' + theme.inputBg + '">' + escapeHtml(p.notes || '') + '</textarea>';
    html += '</div></aside>';
    html += '<main class="studio-full-main" style="padding:12px;' + (theme.dark ? 'background:#111827;' : 'background:#ffffff;') + '">';
    html += '<div style="border:1px solid ' + (theme.dark ? '#374151' : '#cbd5e1') + ';border-radius:10px;padding:10px;margin-bottom:10px;' + (theme.dark ? 'background:#0f172a;' : 'background:#f8fafc;') + '">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">';
    html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;"><button data-music-transport-rewind style="padding:7px 10px;border:none;border-radius:8px;cursor:pointer;' + theme.btnSecondary + '">⏮</button><button data-music-transport-play style="padding:7px 12px;border:none;border-radius:8px;cursor:pointer;' + theme.btnPrimary + '">▶</button><button data-music-transport-pause style="padding:7px 12px;border:none;border-radius:8px;cursor:pointer;' + theme.btnSecondary + '">⏸</button><button data-music-metro-from-start style="padding:7px 12px;border:none;border-radius:8px;cursor:pointer;' + theme.btnPrimary + '">▶ + Metro</button></div>';
    html += '<div class="' + theme.subtle + '" style="font-size:12px;font-weight:700;"><span data-music-time>' + formatTime(musicState.audioCurrentTime) + ' / ' + formatTime(musicState.audioDuration) + '</span></div>';
    html += '</div>';
    if (musicState.audioUrl) html += '<audio data-music-audio-player preload="metadata" style="display:none;" src="' + escapeHtml(musicState.audioUrl) + '"></audio>';
    html += '<div style="display:grid;grid-template-columns:1fr auto auto;gap:8px;margin-top:10px;align-items:center;"><input data-music-scrub type="range" min="0" max="' + Math.max(1, Number((musicState.audioDuration || 1).toFixed(2))) + '" step="0.01" value="' + Math.max(0, Number((musicState.audioCurrentTime || 0).toFixed(2))) + '"><input data-music-volume type="range" min="0" max="1" step="0.01" value="' + Number(musicState.audioVolume || 1).toFixed(2) + '"><label style="font-size:12px;display:flex;gap:6px;align-items:center;" class="' + theme.subtle + '"><span>Loop</span><input data-music-loop type="checkbox" ' + (musicState.audioLoop ? 'checked' : '') + '></label></div>';
    html += '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed ' + (theme.dark ? '#334155' : '#cbd5e1') + ';display:flex;align-items:center;gap:8px;flex-wrap:wrap;">';
    html += '<span class="' + theme.subtle + '" style="font-size:11px;font-weight:700;">FUN TOOL · Tempo Ramp</span>';
    html += '<input data-studio-ramp-from type="number" step="0.05" min="0.5" max="2.5" value="1.00" style="width:74px;padding:6px 8px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<span class="' + theme.subtle + '" style="font-size:11px;">to</span>';
    html += '<input data-studio-ramp-to type="number" step="0.05" min="0.5" max="2.5" value="1.35" style="width:74px;padding:6px 8px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<span class="' + theme.subtle + '" style="font-size:11px;">over</span>';
    html += '<input data-studio-ramp-seconds type="number" step="0.5" min="1" value="12" style="width:74px;padding:6px 8px;border:1px solid;border-radius:8px;' + theme.inputBg + '">';
    html += '<span class="' + theme.subtle + '" style="font-size:11px;">sec</span>';
    html += '<label class="' + theme.subtle + '" style="font-size:11px;display:flex;gap:5px;align-items:center;"><input data-studio-ramp-full type="checkbox"> to full song</label>';
    html += '<button data-studio-ramp-start style="padding:6px 10px;border:none;border-radius:8px;cursor:pointer;' + theme.btnPrimary + '">Accelerate</button>';
    html += '<button data-studio-ramp-stop style="padding:6px 10px;border:none;border-radius:8px;cursor:pointer;' + theme.btnSecondary + '">Stop Ramp</button>';
    html += '</div>';
    html += '</div>';
    html += '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">';
    html += '<button data-studio-region-add style="padding:7px 10px;border:none;border-radius:8px;cursor:pointer;' + theme.btnPrimary + '">Add Region</button>';
    html += '<button data-studio-region-split style="padding:7px 10px;border:none;border-radius:8px;cursor:pointer;' + theme.btnSecondary + '">Split</button>';
    html += '<button data-studio-region-delete style="padding:7px 10px;border:none;border-radius:8px;cursor:pointer;' + theme.btnSecondary + '">Delete</button>';
    html += '<button data-studio-region-join style="padding:7px 10px;border:none;border-radius:8px;cursor:pointer;' + theme.btnSecondary + '">Join Next</button>';
    html += '</div>';
    html += '<div data-studio-timeline style="height:320px;border:1px solid ' + (theme.dark ? '#374151' : '#cbd5e1') + ';border-radius:10px;position:relative;overflow:hidden;' + (theme.dark ? 'background:#0b1220;' : 'background:#f8fafc;') + '">';
    var maxPos = 64;
    for (var i = 0; i < (p.regions || []).length; i++) {
      var rg = p.regions[i];
      maxPos = Math.max(maxPos, Number(rg.start || 0) + Number(rg.len || 0));
    }
    for (var tick = 0; tick <= maxPos; tick += 8) {
      var tLeft = (tick / maxPos) * 100;
      html += '<div style="position:absolute;left:' + tLeft + '%;top:0;bottom:0;width:1px;background:' + (theme.dark ? 'rgba(148,163,184,.18)' : 'rgba(148,163,184,.28)') + ';"></div>';
      html += '<div class="' + theme.subtle + '" style="position:absolute;left:' + tLeft + '%;top:4px;font-size:10px;transform:translateX(-50%);">' + tick + '</div>';
    }
    var introCounts = Math.max(0, Number(p.introCounts || 0));
    if (introCounts > 0) {
      var introLeft = Math.min(100, (introCounts / maxPos) * 100);
      html += '<div style="position:absolute;left:' + introLeft + '%;top:0;bottom:0;width:2px;background:#f59e0b;"></div>';
      html += '<div style="position:absolute;left:' + introLeft + '%;top:18px;transform:translateX(-50%);font-size:10px;background:#f59e0b;color:#111827;padding:1px 5px;border-radius:999px;">INTRO</div>';
    }
    for (var r = 0; r < (p.regions || []).length; r++) {
      var region = p.regions[r];
      var left = (Number(region.start || 0) / maxPos) * 100;
      var width = Math.max(6, (Number(region.len || 0) / maxPos) * 100);
      html += '<button data-studio-region-select="' + escapeHtml(region.id) + '" style="position:absolute;left:' + left + '%;top:52px;width:' + width + '%;height:54px;border-radius:8px;border:1px solid ' + (p.selectedRegionId === region.id ? '#f59e0b' : '#818cf8') + ';background:' + (p.selectedRegionId === region.id ? 'rgba(245,158,11,.28)' : 'rgba(99,102,241,.25)') + ';color:' + (theme.dark ? '#fff' : '#1f2937') + ';font-size:12px;cursor:grab;">' + escapeHtml(region.label || 'Region') + ' (' + Number(region.len || 0) + ')</button>';
    }
    html += '</div>';
    html += '<div class="studio-full-mixer">';
    html += '<div style="padding:8px;border:1px solid ' + (theme.dark ? '#374151' : '#cbd5e1') + ';border-radius:8px;' + (theme.dark ? 'background:#111827;' : 'background:#f8fafc;') + '"><div style="font-size:11px;font-weight:800;">DRUMS</div><div class="' + theme.subtle + '" style="font-size:11px;">Mute · Solo · Pan · Comp</div></div>';
    html += '<div style="padding:8px;border:1px solid ' + (theme.dark ? '#374151' : '#cbd5e1') + ';border-radius:8px;' + (theme.dark ? 'background:#111827;' : 'background:#f8fafc;') + '"><div style="font-size:11px;font-weight:800;">MUSIC TRACK</div><div class="' + theme.subtle + '" style="font-size:11px;">EQ · Volume · Reverb</div></div>';
    html += '<div style="padding:8px;border:1px solid ' + (theme.dark ? '#374151' : '#cbd5e1') + ';border-radius:8px;' + (theme.dark ? 'background:#111827;' : 'background:#f8fafc;') + '"><div style="font-size:11px;font-weight:800;">CUES / COUNTS</div><div class="' + theme.subtle + '" style="font-size:11px;">Markers · Automation · Notes</div></div>';
    html += '</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:12px;margin-top:10px;">GarageBand-style layout: transport, tracks, timeline, and mixer cards. Everything autosaves.</div>';
    html += '</main></div></div>';
    return html;
  }

  function renderAudioTools(theme) {
    var html = '';
    var effectiveBpm = musicState.audioDetectedBpm ? Math.round(musicState.audioDetectedBpm * musicState.audioCountFeel) : 0;
    var startCounts = effectiveBpm ? Math.round((effectiveBpm / 60) * Number(musicState.audioStartOffset || 0)) : 0;
    var startEights = Math.floor(startCounts / 8);
    var startRemainder = startCounts % 8;
    var premium = isPremiumSession();
    html += '<div class="music-card rounded-2xl border p-5 ' + theme.panel + '" style="margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">';
    html += '<span style="font-size:20px;">🎧</span>';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0;">MP3 Import, BPM & Tempo Tools</h3>';
    html += '</div>';
    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 14px;">Import an MP3, auto-detect BPM, trim silence at the beginning, and switch count feel without slowing the song.</p>';
    html += '<div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">';
    html += '<input data-music-audio-file type="file" accept="audio/mpeg,audio/mp3,audio/*" />';
    html += '<button data-music-detect-bpm style="padding:8px 14px;border-radius:10px;border:none;font-size:12px;font-weight:700;cursor:pointer;' + theme.btnPrimary + '">' + (musicState.audioAnalyzing ? 'Analyzing…' : 'Detect BPM') + '</button>';
    html += '</div>';
    if (musicState.audioName) {
      html += '<div class="' + theme.subtle + '" style="font-size:12px;margin-bottom:8px;">Loaded: <strong>' + escapeHtml(musicState.audioName) + '</strong> · ' + (musicState.audioDuration ? musicState.audioDuration.toFixed(1) + 's' : '—') + '</div>';
    }
    if (musicState.audioUrl) {
      html += '<audio data-music-audio-player preload="metadata" style="display:none;" src="' + escapeHtml(musicState.audioUrl) + '"></audio>';
      html += '<div style="margin-bottom:10px;border:1px solid;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(79,70,229,.18);' + theme.cardBg + '">';
      html += '<div style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px;' + (theme.dark ? 'background:linear-gradient(90deg,#131728,#1f1c3a);border-bottom:1px solid #2d2d44;' : 'background:linear-gradient(90deg,#eef2ff,#f8fafc);border-bottom:1px solid #e5e7eb;') + '">';
      html += '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">';
      html += '<button data-music-transport-rewind style="padding:7px 10px;border:none;border-radius:9px;cursor:pointer;' + theme.btnSecondary + '">⏮</button>';
      html += '<button data-music-transport-back style="padding:7px 10px;border:none;border-radius:9px;cursor:pointer;' + theme.btnSecondary + '">-5s</button>';
      html += '<button data-music-transport-play style="padding:7px 12px;border:none;border-radius:9px;cursor:pointer;' + theme.btnPrimary + '">▶</button>';
      html += '<button data-music-transport-pause style="padding:7px 12px;border:none;border-radius:9px;cursor:pointer;' + theme.btnSecondary + '">⏸</button>';
      html += '<button data-music-transport-forward style="padding:7px 10px;border:none;border-radius:9px;cursor:pointer;' + theme.btnSecondary + '">+5s</button>';
      html += '<button data-music-play-trim style="padding:7px 12px;border:none;border-radius:9px;cursor:pointer;' + theme.btnPrimary + '">Play from Trim</button>';
      html += '</div>';
      html += '<div style="display:flex;align-items:center;gap:10px;"><label style="display:flex;align-items:center;gap:6px;font-size:11px;" class="' + theme.subtle + '"><span>Loop</span><input data-music-loop type="checkbox" ' + (musicState.audioLoop ? 'checked' : '') + ' /></label><span style="font-size:12px;font-weight:700;" class="' + theme.subtle + '"><span data-music-time>' + formatTime(musicState.audioCurrentTime) + ' / ' + formatTime(musicState.audioDuration) + '</span></span></div>';
      html += '</div>';
      html += '<div style="padding:10px 12px;">';
      html += '<input data-music-scrub type="range" min="0" max="' + Math.max(1, Number((musicState.audioDuration || 1).toFixed(2))) + '" step="0.01" value="' + Math.max(0, Number((musicState.audioCurrentTime || 0).toFixed(2))) + '" style="width:100%;">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:10px;"><label class="' + theme.subtle + '" style="font-size:11px;">Volume</label><input data-music-volume type="range" min="0" max="1" step="0.01" value="' + Number(musicState.audioVolume || 1).toFixed(2) + '" style="flex:1;"></div>';
      html += '<div style="margin-top:10px;height:64px;border-radius:10px;' + (theme.dark ? 'background:#0f172a;' : 'background:#e2e8f0;') + ';display:flex;align-items:center;gap:2px;padding:8px;overflow:hidden;">';
      for (var w = 0; w < 140; w++) {
        var h = 8 + Math.round((Math.sin(w * 0.18) * 0.5 + Math.random() * 0.5 + 0.4) * 36);
        html += '<span style="display:inline-block;width:3px;height:' + h + 'px;border-radius:2px;background:' + (theme.dark ? '#38bdf8' : '#334155') + ';opacity:.7;"></span>';
      }
      html += '</div></div></div>';
      html += '<div style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin-bottom:10px;">';
      html += '<label class="' + theme.subtle + '" style="font-size:12px;">Start Trim Offset (seconds):</label>';
      html += '<input data-music-start-offset type="number" min="0" step="0.1" value="' + escapeHtml(String(musicState.audioStartOffset || 0)) + '" style="width:120px;padding:8px 10px;border:1px solid;border-radius:10px;' + theme.inputBg + '" />';
      html += '</div>';
      html += '<div data-music-compact-actions style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">';
      html += '<button data-music-play-trim style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;' + theme.btnPrimary + '">Play from Trim</button>';
      html += '<button data-music-metro-from-start style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;' + theme.btnPrimary + '">Play + Metronome from Start Spot</button>';
      html += '<button data-music-half style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;' + theme.btnSecondary + '">½ Counts</button>';
      html += '<button data-music-normal style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;' + theme.btnSecondary + '">1× Counts</button>';
      html += '<button data-music-double style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;' + theme.btnSecondary + '">2× Counts</button>';
      html += '<button data-music-export-edited style="padding:8px 14px;border:none;border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;background:#0ea5e9;color:#fff;">Export Edited WAV</button>';
      html += '</div>';
      html += '<div class="' + theme.subtle + '" style="font-size:11px;margin-top:2px;">Export creates a new edited WAV (trim + speed + volume) while keeping original pitch.</div>';
      html += '<div class="' + theme.subtle + '" style="font-size:12px;">Detected BPM: <strong>' + (musicState.audioDetectedBpm || '—') + '</strong> · Count Feel: <strong>' + musicState.audioCountFeel + '×</strong> · Effective Count BPM: <strong>' + (effectiveBpm || '—') + '</strong></div>';
      html += '<div class="' + theme.subtle + '" style="font-size:12px;margin-top:4px;">Start dance after <strong>' + (startCounts || 0) + ' counts</strong>';
      if (startCounts) html += ' (' + startEights + ' eight-counts' + (startRemainder ? (' + ' + startRemainder) : '') + ')';
      html += '</div>';
      html += '<div style="margin-top:12px;padding:12px;border-radius:12px;border:1px solid;' + (theme.dark ? 'background:rgba(79,70,229,.1);border-color:#3730a3;color:#c7d2fe;' : 'background:#eef2ff;border-color:#c7d2fe;color:#312e81;') + '">';
      html += '<div style="font-size:12px;font-weight:800;margin-bottom:8px;">🎛 Studio Mode</div>';
      html += '<button data-music-go-studio style="padding:10px 16px;border:none;border-radius:10px;cursor:pointer;font-size:13px;font-weight:800;' + (premium ? theme.btnPrimary : 'background:#9ca3af;color:#fff;') + '">' + (premium ? 'Open Full Studio' : 'Studio (Premium)') + '</button>';
      if (!premium) html += '<div style="font-size:11px;margin-top:6px;opacity:.9;">Upgrade to Premium to unlock the full edit studio.</div>';
      html += '</div>';
    }
    html += '</div>';
    if (musicState.studioOpen && premium) {
      html += '<div data-music-studio-close style="position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99998;display:flex;align-items:center;justify-content:center;padding:20px;">';
      html += '<div style="width:min(1400px,98vw);max-height:94vh;overflow:auto;border-radius:22px;border:1px solid;' + (theme.dark ? 'background:#101218;border-color:#2a2f3b;color:#e5e7eb;' : 'background:#f5f6f8;border-color:#d1d5db;color:#111827;') + '">';
      html += '<div style="padding:10px 14px;border-bottom:1px solid;' + (theme.dark ? 'border-color:#2a2f3b;background:#181b24;' : 'border-color:#d1d5db;background:#eceff3;') + ';display:flex;justify-content:space-between;align-items:center;"><div style="font-weight:900;letter-spacing:.04em;">🎛 STEP BY STEPPER STUDIO</div><button data-music-studio-close-btn style="padding:7px 12px;border:none;border-radius:9px;cursor:pointer;' + theme.btnSecondary + '">Close</button></div>';
      html += '<div data-music-header-actions style="padding:12px;border-bottom:1px solid;' + (theme.dark ? 'border-color:#2a2f3b;background:#1f2430;' : 'border-color:#d1d5db;background:#e5e7eb;') + ';display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">';
      html += '<div data-music-transport-wrap style="display:flex;gap:8px;"><button data-music-transport-rewind style="padding:7px 10px;border:none;border-radius:8px;' + theme.btnSecondary + '">⏮</button><button data-music-transport-play style="padding:7px 12px;border:none;border-radius:8px;' + theme.btnPrimary + '">▶</button><button data-music-transport-pause style="padding:7px 12px;border:none;border-radius:8px;' + theme.btnSecondary + '">⏸</button></div>';
      html += '<div style="font-size:12px;font-weight:800;">TRANSPORT · BPM ' + (effectiveBpm || '—') + ' · Start After ' + (startCounts || 0) + ' Counts</div>';
      html += '</div>';
      html += '<div data-music-compact-grid style="display:grid;grid-template-columns:300px 360px 1fr;gap:0;min-height:520px;">';
      html += '<div style="border-right:1px solid ' + (theme.dark ? '#2a2f3b' : '#d1d5db') + ';padding:14px;background:' + (theme.dark ? '#171a22' : '#f0f2f6') + ';"><div style="font-size:13px;font-weight:800;margin-bottom:10px;">CONTENT LIBRARY</div><div style="height:420px;border:1px solid ' + (theme.dark ? '#2a2f3b' : '#cbd5e1') + ';border-radius:10px;padding:10px;overflow:auto;"><div style="opacity:.8;font-size:12px;">Imported: ' + escapeHtml(musicState.audioName || 'No file') + '</div><div style="margin-top:12px;font-size:12px;">Trim Start: ' + Number(musicState.audioStartOffset || 0).toFixed(1) + 's</div></div></div>';
      html += '<div style="border-right:1px solid ' + (theme.dark ? '#2a2f3b' : '#d1d5db') + ';padding:14px;background:' + (theme.dark ? '#1c202b' : '#e9edf2') + ';"><div style="font-size:13px;font-weight:800;margin-bottom:10px;">TRACK PANEL</div><div style="height:420px;border:1px solid ' + (theme.dark ? '#2a2f3b' : '#cbd5e1') + ';border-radius:10px;padding:10px;"><div style="font-size:12px;">Audio 1</div><div style="margin-top:10px;height:8px;border-radius:999px;background:' + (theme.dark ? '#374151' : '#cbd5e1') + ';"><div style="width:55%;height:8px;border-radius:999px;background:#22c55e;"></div></div></div></div>';
      html += '<div style="padding:14px;background:' + (theme.dark ? '#141821' : '#f8fafc') + ';"><div style="font-size:13px;font-weight:800;margin-bottom:10px;">TIMELINE</div><div style="height:420px;border:1px solid ' + (theme.dark ? '#2a2f3b' : '#cbd5e1') + ';border-radius:10px;position:relative;overflow:hidden;">';
      html += '<div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0,transparent 48px,' + (theme.dark ? '#2f3442' : '#dbe2ea') + ' 49px,' + (theme.dark ? '#2f3442' : '#dbe2ea') + ' 50px);"></div>';
      html += '<div style="position:absolute;left:0;top:0;bottom:0;width:' + Math.max(2, Math.round((Number(musicState.audioStartOffset || 0) * 12))) + 'px;background:rgba(234,88,12,.35);"></div>';
      html += '<div style="position:absolute;left:0;right:0;bottom:0;height:100px;padding:10px;display:flex;gap:2px;align-items:flex-end;">';
      for (var s = 0; s < 120; s++) {
        var sh = 8 + Math.round((Math.sin(s * 0.2) * 0.5 + Math.random() * 0.5 + 0.4) * 58);
        html += '<span style="width:4px;height:' + sh + 'px;border-radius:2px;background:' + (theme.dark ? '#fbbf24' : '#f59e0b') + ';opacity:.85;"></span>';
      }
      html += '</div></div></div>';
      html += '</div>';
      html += '<div style="padding:14px;border-top:1px solid ' + (theme.dark ? '#2a2f3b' : '#d1d5db') + ';display:grid;grid-template-columns:repeat(3,minmax(220px,1fr));gap:10px;' + (theme.dark ? 'background:#121722;' : 'background:#f1f5f9;') + '">';
      html += '<div style="border:1px solid ' + (theme.dark ? '#2a2f3b' : '#cbd5e1') + ';border-radius:10px;padding:10px;"><div style="font-size:12px;font-weight:800;margin-bottom:6px;">Basic Audio Editing</div><div style="font-size:11px;opacity:.9;">Split at Playhead (⌘T) · Trim/Resize Regions · Delete Sections · Drag to Rearrange · Join Clips</div></div>';
      html += '<div style="border:1px solid ' + (theme.dark ? '#2a2f3b' : '#cbd5e1') + ';border-radius:10px;padding:10px;"><div style="font-size:12px;font-weight:800;margin-bottom:6px;">Advanced Edit & Mix</div><div style="font-size:11px;opacity:.9;">Flex Time · Pitch Correction · Automation Lanes (Vol/Pan/FX) · Visual EQ · Compression · Reverb/Delay · AU Plugins</div></div>';
      html += '<div style="border:1px solid ' + (theme.dark ? '#2a2f3b' : '#cbd5e1') + ';border-radius:10px;padding:10px;"><div style="font-size:12px;font-weight:800;margin-bottom:6px;">MIDI/Arrangement/Global</div><div style="font-size:11px;opacity:.9;">Piano Roll · Quantize · Velocity · Drummer Track · Arrangement Markers (Intro/Verse/Chorus) · Tempo/Key/Transpose · Fade Out</div></div>';
      html += '</div>';
      html += '<div style="padding:12px;border-top:1px solid ' + (theme.dark ? '#2a2f3b' : '#d1d5db') + ';font-size:12px;' + (theme.dark ? 'background:#181b24;' : 'background:#eceff3;') + '">SMART CONTROL EDITORS · Count-feel math (½ counts halves start counts, 2× counts doubles start counts) while song playback stays full speed.</div>';
      html += '</div></div>';
    }
    return html;
  }

  /* ── Main Render ─────────────────────────────────────────────────────── */
  function renderMusicPage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) return;
    if (page.hidden || page.style.display === 'none') return;

    var theme = themeClasses();

    var html = '';
    if (musicState.studioFullPageOpen) {
      page.innerHTML = renderStudioFullPage(theme);
      attachMusicListeners(page);
      return;
    }
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
    if (isAndroidDevice()) page.classList.add('stepper-android-layout');
    else page.classList.remove('stepper-android-layout');
    attachMusicListeners(page);
  }

  /* ── Event Wiring ────────────────────────────────────────────────────── */
  function attachMusicListeners(page) {
    var studioBackBtn = page.querySelector('[data-music-studio-back]');
    if (studioBackBtn) studioBackBtn.addEventListener('click', function () {
      musicState.studioFullPageOpen = false;
      renderMusicPage();
    });
    var studioSaveBtn = page.querySelector('[data-music-studio-save]');
    if (studioSaveBtn) studioSaveBtn.addEventListener('click', function () {
      var p = loadStudioProject();
      page.querySelectorAll('[data-studio-field]').forEach(function (el) {
        var k = el.getAttribute('data-studio-field');
        if (k) p[k] = el.value;
      });
      saveStudioProject(p);
      var data = loadBuilderData();
      if (!data.meta) data.meta = {};
      data.meta.music = p.title || data.meta.music || '';
      data.meta.artist = p.artist || data.meta.artist || '';
      data.meta.bpm = p.bpm || data.meta.bpm || '';
      saveBuilderData(data);
      _toast('Studio worksheet saved.');
    });
    page.querySelectorAll('[data-studio-field]').forEach(function (el) {
      el.addEventListener('input', function () {
        var p = loadStudioProject();
        var k = el.getAttribute('data-studio-field');
        if (k) p[k] = el.value;
        saveStudioProject(p);
        if (k === 'introCounts') renderMusicPage();
      });
    });
    page.querySelectorAll('[data-studio-region-select]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-studio-region-select');
        var p = loadStudioProject();
        p.selectedRegionId = id || '';
        saveStudioProject(p);
        renderMusicPage();
      });
      btn.addEventListener('mousedown', function (ev) {
        if (ev.button !== 0) return;
        ev.preventDefault();
        var id = btn.getAttribute('data-studio-region-select');
        var timeline = page.querySelector('[data-studio-timeline]');
        if (!id || !timeline) return;
        var rect = timeline.getBoundingClientRect();
        var project = loadStudioProject();
        var maxPos = 64;
        (project.regions || []).forEach(function (rg) { maxPos = Math.max(maxPos, Number(rg.start || 0) + Number(rg.len || 0)); });
        var idx = project.regions.findIndex(function (rg) { return rg.id === id; });
        if (idx < 0) return;
        var startX = ev.clientX;
        var originalStart = Number(project.regions[idx].start || 0);
        function onMove(moveEv) {
          var dx = moveEv.clientX - startX;
          var deltaCounts = Math.round((dx / rect.width) * maxPos);
          var nextStart = Math.max(0, originalStart + deltaCounts);
          project.regions[idx].start = nextStart;
          project.selectedRegionId = id;
          saveStudioProject(project);
          renderMusicPage();
        }
        function onUp() {
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        }
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      });
    });
    var addRegion = page.querySelector('[data-studio-region-add]');
    if (addRegion) addRegion.addEventListener('click', function () {
      var p = loadStudioProject();
      var end = 0;
      (p.regions || []).forEach(function (rg) { end = Math.max(end, Number(rg.start || 0) + Number(rg.len || 0)); });
      var id = 'r' + Date.now();
      p.regions.push({ id: id, label: 'New Section', start: end, len: 16 });
      p.selectedRegionId = id;
      saveStudioProject(p);
      renderMusicPage();
    });
    var splitRegion = page.querySelector('[data-studio-region-split]');
    if (splitRegion) splitRegion.addEventListener('click', function () {
      var p = loadStudioProject();
      var idx = (p.regions || []).findIndex(function (rg) { return rg.id === p.selectedRegionId; });
      if (idx < 0) return;
      var rg = p.regions[idx];
      if (Number(rg.len || 0) < 2) return;
      var firstLen = Math.max(1, Math.floor(Number(rg.len || 0) / 2));
      var secondLen = Math.max(1, Number(rg.len || 0) - firstLen);
      rg.len = firstLen;
      var newId = 'r' + (Date.now() + 1);
      p.regions.splice(idx + 1, 0, { id: newId, label: (rg.label || 'Section') + ' B', start: Number(rg.start || 0) + firstLen, len: secondLen });
      p.selectedRegionId = newId;
      saveStudioProject(p);
      renderMusicPage();
    });
    var delRegion = page.querySelector('[data-studio-region-delete]');
    if (delRegion) delRegion.addEventListener('click', function () {
      var p = loadStudioProject();
      var idx = (p.regions || []).findIndex(function (rg) { return rg.id === p.selectedRegionId; });
      if (idx < 0) return;
      p.regions.splice(idx, 1);
      p.selectedRegionId = (p.regions[0] && p.regions[0].id) || '';
      saveStudioProject(p);
      renderMusicPage();
    });
    var joinRegion = page.querySelector('[data-studio-region-join]');
    if (joinRegion) joinRegion.addEventListener('click', function () {
      var p = loadStudioProject();
      var idx = (p.regions || []).findIndex(function (rg) { return rg.id === p.selectedRegionId; });
      if (idx < 0 || idx >= p.regions.length - 1) return;
      p.regions[idx].len = Number(p.regions[idx].len || 0) + Number(p.regions[idx + 1].len || 0);
      p.regions[idx].label = String(p.regions[idx].label || 'Section') + ' + ' + String(p.regions[idx + 1].label || '');
      p.regions.splice(idx + 1, 1);
      saveStudioProject(p);
      renderMusicPage();
    });

    // Save music info
    var saveBtn = page.querySelector('[data-music-save]');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var data = loadBuilderData();
        if (!data.meta) data.meta = {};

        var titleInput = page.querySelector('[data-music-field="music"]');
        var artistInput = page.querySelector('[data-music-field="artist"]');
        var bpmInput = page.querySelector('[data-music-field="bpm"]');

        var songValue = titleInput ? titleInput.value.trim() : '';
        var artistValue = artistInput ? artistInput.value.trim() : '';
        var split = splitSongArtistLine(songValue);
        if (!artistValue && split.artist) artistValue = split.artist;
        if (split.song) songValue = split.song;
        data.meta.music = formatSongArtistLine(songValue, artistValue);
        data.meta.artist = artistValue;
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
        stopTempoRamp();
        musicState.audioUrl = URL.createObjectURL(file);
        musicState.audioName = file.name || 'Imported audio';
        musicState.audioDuration = 0;
        musicState.audioCurrentTime = 0;
        musicState.audioDetectedBpm = 0;
        musicState.audioStartOffset = 0;
        musicState.audioCountFeel = 1;
        musicState.audioVolume = 1;
        musicState.audioLoop = false;
        var reader = new FileReader();
        reader.onload = function () {
          _audioAnalysisBuffer = reader.result;
          var parsed = parseId3Metadata(reader.result);
          var parsedFromName = parseTitleArtistFromFilename(file.name || '');
          var data = loadBuilderData();
          if (!data.meta) data.meta = {};
          var importSong = '';
          var importArtist = '';
          if (parsed.title || parsed.artist) {
            importSong = parsed.title || '';
            importArtist = parsed.artist || '';
          } else {
            importSong = parsedFromName.title || '';
            importArtist = parsedFromName.artist || '';
          }
          if (importSong || importArtist) {
            data.meta.music = formatSongArtistLine(importSong, importArtist);
            data.meta.artist = importArtist;
          }
          saveBuilderData(data);
          var proj = loadStudioProject();
          proj.title = data.meta.music || proj.title;
          proj.artist = data.meta.artist || proj.artist;
          if (musicState.audioDetectedBpm) proj.bpm = String(musicState.audioDetectedBpm);
          saveStudioProject(proj);
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
      ensureSpeedChangeWithoutPitchShift(player);
      player.playbackRate = 1;
      player.volume = Math.max(0, Math.min(1, Number(musicState.audioVolume || 1)));
      player.loop = !!musicState.audioLoop;
      player.addEventListener('loadedmetadata', function () {
        var nextDuration = Number(player.duration || 0);
        if (Math.abs((musicState.audioDuration || 0) - nextDuration) > 0.05) {
          musicState.audioDuration = nextDuration;
          renderMusicPage();
        }
      });
      player.addEventListener('timeupdate', function () {
        musicState.audioCurrentTime = Number(player.currentTime || 0);
        applyTempoRampForPlayerTime(player);
        var scrubEl = page.querySelector('[data-music-scrub]');
        if (scrubEl && !scrubEl.matches(':active')) scrubEl.value = String(musicState.audioCurrentTime);
        var timeEl = page.querySelector('[data-music-time]');
        if (timeEl) timeEl.textContent = formatTime(musicState.audioCurrentTime) + ' / ' + formatTime(musicState.audioDuration || player.duration || 0);
      });
      player.addEventListener('ended', function () {
        musicState.audioCurrentTime = Number(player.currentTime || 0);
      });
    }
    page.querySelectorAll('[data-music-transport-play]').forEach(function (playBtn) {
      playBtn.addEventListener('click', function () {
        var p = page.querySelector('[data-music-audio-player]');
        if (!p) return;
        applyTempoRampForPlayerTime(p);
        p.play().catch(function () { _toast('Could not play audio yet.'); });
      });
    });
    page.querySelectorAll('[data-music-transport-pause]').forEach(function (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        var p = page.querySelector('[data-music-audio-player]');
        if (!p) return;
        p.pause();
      });
    });
    page.querySelectorAll('[data-music-transport-rewind]').forEach(function (rewindBtn) {
      rewindBtn.addEventListener('click', function () {
        var p = page.querySelector('[data-music-audio-player]');
        if (!p) return;
        p.currentTime = 0;
        musicState.audioCurrentTime = 0;
        applyTempoRampForPlayerTime(p);
      });
    });
    var backBtn = page.querySelector('[data-music-transport-back]');
    if (backBtn) backBtn.addEventListener('click', function () {
      var p = page.querySelector('[data-music-audio-player]');
      if (!p) return;
      p.currentTime = Math.max(0, Number(p.currentTime || 0) - 5);
      musicState.audioCurrentTime = Number(p.currentTime || 0);
      applyTempoRampForPlayerTime(p);
    });
    var forwardBtn = page.querySelector('[data-music-transport-forward]');
    if (forwardBtn) forwardBtn.addEventListener('click', function () {
      var p = page.querySelector('[data-music-audio-player]');
      if (!p) return;
      var maxT = Number(p.duration || musicState.audioDuration || 0);
      p.currentTime = Math.min(maxT || Number(p.currentTime || 0) + 5, Number(p.currentTime || 0) + 5);
      musicState.audioCurrentTime = Number(p.currentTime || 0);
      applyTempoRampForPlayerTime(p);
    });
    var scrub = page.querySelector('[data-music-scrub]');
    if (scrub) scrub.addEventListener('input', function () {
      var p = page.querySelector('[data-music-audio-player]');
      if (!p) return;
      var t = Math.max(0, Number(scrub.value || 0));
      p.currentTime = t;
      musicState.audioCurrentTime = t;
      applyTempoRampForPlayerTime(p);
      var timeEl = page.querySelector('[data-music-time]');
      if (timeEl) timeEl.textContent = formatTime(t) + ' / ' + formatTime(musicState.audioDuration || p.duration || 0);
    });
    var volume = page.querySelector('[data-music-volume]');
    if (volume) volume.addEventListener('input', function () {
      var p = page.querySelector('[data-music-audio-player]');
      var v = Math.max(0, Math.min(1, Number(volume.value || 1)));
      musicState.audioVolume = v;
      if (p) p.volume = v;
    });
    var loopToggle = page.querySelector('[data-music-loop]');
    if (loopToggle) loopToggle.addEventListener('change', function () {
      musicState.audioLoop = !!loopToggle.checked;
      var p = page.querySelector('[data-music-audio-player]');
      if (p) p.loop = musicState.audioLoop;
    });
    var rampStart = page.querySelector('[data-studio-ramp-start]');
    if (rampStart) rampStart.addEventListener('click', function () {
      var p = page.querySelector('[data-music-audio-player]');
      if (!p) { _toast('Import audio first.'); return; }
      var fromEl = page.querySelector('[data-studio-ramp-from]');
      var toEl = page.querySelector('[data-studio-ramp-to]');
      var secEl = page.querySelector('[data-studio-ramp-seconds]');
      var fullEl = page.querySelector('[data-studio-ramp-full]');
      var from = fromEl ? Number(fromEl.value || 1) : 1;
      var to = toEl ? Number(toEl.value || 1.25) : 1.25;
      var seconds = secEl ? Number(secEl.value || 8) : 8;
      var fullSong = !!(fullEl && fullEl.checked);
      if (p.paused) p.play().catch(function () { /* ignore */ });
      startTempoRamp(p, from, to, seconds, fullSong);
      _toast('Tempo ramp started: ' + from.toFixed(2) + '× → ' + to.toFixed(2) + '×' + (fullSong ? ' across full song' : (' over ' + seconds + 's')));
    });
    var rampStop = page.querySelector('[data-studio-ramp-stop]');
    if (rampStop) rampStop.addEventListener('click', function () {
      stopTempoRamp();
      var p = page.querySelector('[data-music-audio-player]');
      if (p) p.playbackRate = 1;
      _toast('Tempo ramp stopped.');
    });
    var startOffset = page.querySelector('[data-music-start-offset]');
    if (startOffset) {
      startOffset.addEventListener('change', function () {
        var n = Math.max(0, Number(startOffset.value || 0));
        musicState.audioStartOffset = n;
      });
    }
    page.querySelectorAll('[data-music-play-trim]').forEach(function (playTrim) {
      playTrim.addEventListener('click', function () {
        var p = page.querySelector('[data-music-audio-player]');
        if (!p) return;
        p.playbackRate = 1;
        p.currentTime = Math.max(0, Number(musicState.audioStartOffset || 0));
        musicState.audioCurrentTime = Number(p.currentTime || 0);
        applyTempoRampForPlayerTime(p);
        p.play().catch(function () { _toast('Could not play audio yet.'); });
      });
    });
    var metroFromStart = page.querySelector('[data-music-metro-from-start]');
    if (metroFromStart) metroFromStart.addEventListener('click', function () {
      var effective = musicState.audioDetectedBpm ? Math.round(musicState.audioDetectedBpm * musicState.audioCountFeel) : 0;
      if (!effective) {
        _toast('Detect BPM first.');
        return;
      }
      var p = page.querySelector('[data-music-audio-player]');
      if (p) {
        p.playbackRate = 1;
        p.currentTime = Math.max(0, Number(musicState.audioStartOffset || 0));
        musicState.audioCurrentTime = Number(p.currentTime || 0);
        applyTempoRampForPlayerTime(p);
        p.play().catch(function () { _toast('Could not start audio.'); });
      }
      var counts = Math.round((effective / 60) * Number(musicState.audioStartOffset || 0));
      startMetronome(effective, counts);
      renderMusicPage();
    });
    var halfBtn = page.querySelector('[data-music-half]');
    if (halfBtn) halfBtn.addEventListener('click', function () { musicState.audioCountFeel = 0.5; renderMusicPage(); });
    var normalBtn = page.querySelector('[data-music-normal]');
    if (normalBtn) normalBtn.addEventListener('click', function () { musicState.audioCountFeel = 1; renderMusicPage(); });
    var doubleBtn = page.querySelector('[data-music-double]');
    if (doubleBtn) doubleBtn.addEventListener('click', function () { musicState.audioCountFeel = 2; renderMusicPage(); });
    var goStudio = page.querySelector('[data-music-go-studio]');
    if (goStudio) goStudio.addEventListener('click', function () {
      if (!isPremiumSession()) {
        _toast('Studio mode is Premium only.');
        return;
      }
      musicState.studioFullPageOpen = true;
      renderMusicPage();
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
    });
    page.querySelectorAll('[data-music-studio-close],[data-music-studio-close-btn]').forEach(function (el) {
      el.addEventListener('click', function () {
        musicState.studioOpen = false;
        renderMusicPage();
      });
    });
    var exportEditedBtn = page.querySelector('[data-music-export-edited]');
    if (exportEditedBtn) exportEditedBtn.addEventListener('click', function () { exportEditedAudio(); });

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

  function startMetronome(bpm, startCounts) {
    stopMetronome();
    musicState.metronomeBPM = bpm;
    musicState.metronomeRunning = true;
    _beatIndex = Math.max(0, Number(startCounts || 0));

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
        var pre = Number(startCounts || 0);
        statusEl.textContent = 'Beat ' + ((_beatIndex % 4) + 1) + ' of 4 — ' + bpm + ' BPM' + (pre ? (' · start after ' + pre + ' counts') : '');
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

  if (!window.__stepperStudioStorageSyncInstalled) {
    window.__stepperStudioStorageSyncInstalled = true;
    window.addEventListener('storage', function (ev) {
      if (!ev || ev.key !== STUDIO_PROJECT_KEY || !ev.newValue) return;
      try {
        var p = JSON.parse(ev.newValue);
        if (!p || typeof p !== 'object') return;
        var data = loadBuilderData();
        if (!data.meta) data.meta = {};
        if (p.title) data.meta.music = p.title;
        if (p.artist) data.meta.artist = p.artist;
        if (p.bpm) data.meta.bpm = String(p.bpm);
        saveBuilderData(data);
        renderMusicPage();
      } catch (e) { /* ignore */ }
    });
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
