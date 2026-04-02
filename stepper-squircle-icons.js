/**
 * stepper-squircle-icons.js
 * ─────────────────────────────────────────────────────────────
 * Squircle (rounded-square) SVG icon system for Step-By-Stepper.
 * Replaces all emoji usage with crisp, theme-aware vector icons.
 *
 * Usage:
 *   var ic = window.__stepperIcons;
 *   someElement.innerHTML = ic.search + ' Search…';
 *   category.icon = ic.walking;
 *
 * Each icon is a self-contained inline SVG string at 1em size
 * that inherits text color via currentColor.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperIcons) return;

  /* ── Squircle wrapper ──
     bg  = background colour (with opacity built in)
     d   = SVG path(s) / shapes inside the 24×24 viewBox         */
  function sq(bg, d) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
      'width="1.15em" height="1.15em" style="display:inline-block;vertical-align:-0.2em;">' +
      '<rect x="1" y="1" width="22" height="22" rx="6.5" ry="6.5" fill="' + bg + '"/>' +
      d + '</svg>';
  }

  /* shorthand colours for squircle backgrounds */
  var B  = 'rgba(99,102,241,.15)';   /* indigo  – default / actions      */
  var G  = 'rgba(34,197,94,.15)';    /* green   – success / confirm      */
  var R  = 'rgba(239,68,68,.15)';    /* red     – danger / delete        */
  var Y  = 'rgba(234,179,8,.15)';    /* amber   – warning                */
  var P  = 'rgba(168,85,247,.15)';   /* purple  – specialty / premium    */
  var T  = 'rgba(20,184,166,.15)';   /* teal    – info                   */
  var O  = 'rgba(249,115,22,.15)';   /* orange  – fire / energy          */
  var S  = 'rgba(100,116,139,.15)';  /* slate   – neutral                */

  /* stroke / fill helper – uses currentColor by default */
  var c = 'currentColor';
  function p(d, fill) { return '<path d="' + d + '" fill="' + (fill || c) + '" fill-rule="evenodd"/>'; }
  function ps(d, stroke, sw) { return '<path d="' + d + '" fill="none" stroke="' + (stroke || c) + '" stroke-width="' + (sw || 1.6) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function ci(cx, cy, r, fill) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + (fill || c) + '"/>'; }

  /* ════════════════════════════════════════════════════════════
     STEP CATEGORY ICONS  (18)
     ════════════════════════════════════════════════════════════ */

  var icons = {};

  /* 🚶 Walking / Traveling – person walking */
  icons.walking = sq(B,
    ci(13, 6.5, 1.8) +
    ps('M12 10l-1.5 4.5 2 2.5M12 10l2 4-1.5 3M12 10l-3-1M12 10l2.5-.5'));

  /* 🌿 Vine – vine/leaf shape */
  icons.vine = sq(G,
    ps('M12 18V8M9 14c0-2.5 3-4 3-4s3 1.5 3 4M7.5 11c0-2 2.5-3 4.5-3M12 8c2 0 4.5 1 4.5 3'));

  /* 👆 Touch – pointing finger */
  icons.touch = sq(B,
    ps('M12 6v8M12 6c0-1 1.5-1.5 1.5 0v5M12 6c0-1-1.5-1.5-1.5 0v5M9 13l-.5 2c-.3 1.2.5 2 1.5 2h4c1 0 1.8-.8 1.5-2L15 13'));

  /* ↔️ Side Steps – horizontal arrows */
  icons.side = sq(B,
    ps('M6 12h12M6 12l3-3M6 12l3 3M18 12l-3-3M18 12l-3 3'));

  /* 🪨 Rock – rock shape */
  icons.rock = sq(S,
    ps('M6 16l2-4 3 1 2-5 3 3 2-1 1 6H5z'));

  /* ⚡ Triple – lightning bolt */
  icons.triple = sq(Y,
    p('M13 5l-5 8h4l-1 6 5-8h-4l1-6z'));

  /* 🔄 Turn – circular arrow */
  icons.turn = sq(B,
    ps('M17.5 12a5.5 5.5 0 1 1-2-4.2M17.5 12l-2.5-3M17.5 12l-3 1'));

  /* 🎷 Jazz – saxophone / jazz note */
  icons.jazz = sq(P,
    ps('M10 7c2 0 3 1 3 3v4c0 2-1 3-3 3') +
    ci(10, 17, 1.2) +
    ps('M13 10l2-3M13 12l2.5-1'));

  /* ✖️ Cross – X shape */
  icons.cross = sq(B,
    ps('M8 8l8 8M16 8l-8 8', c, 2));

  /* 🦵 Kick – leg kicking */
  icons.kick = sq(O,
    ps('M10 6v6l4 4M10 12l-2 5'));

  /* 👟 Stomp – shoe/foot print */
  icons.stomp = sq(B,
    ps('M8 10c0-2 1.5-3 4-3s4 1 4 3v3c0 2-1.5 3-4 3s-4-1-4-3z') +
    ps('M9.5 13h5'));

  /* ✨ Embellish – sparkle */
  icons.embellish = sq(P,
    p('M12 5l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z') +
    p('M17 14l.6 1.5 1.4.5-1.4.5-.6 1.5-.6-1.5-1.4-.5 1.4-.5.6-1.5z'));

  /* 💨 Slide – motion lines */
  icons.slide = sq(T,
    ps('M6 9h10M7 12h12M6 15h10'));

  /* 💃 Sway – dancer figure */
  icons.sway = sq(P,
    ci(12, 6.5, 1.8) +
    ps('M12 9c-2 3-3 5-1 8M12 9c2 3 3 5 1 8M9 13h6'));

  /* ⭐ Specialty – star */
  icons.specialty = sq(Y,
    p('M12 5l2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 15.7 7.8 18l.8-4.7L5.2 10l4.7-.7L12 5z'));

  /* 👏 Hold / Clap – two hands */
  icons.hold = sq(B,
    ps('M8 10l4 4 4-4M8 14l4 4 4-4'));

  /* 🤝 Together – handshake */
  icons.together = sq(G,
    ps('M6 13h3l2-2 2 2h1l2-2M14 11l4 2M8 12a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3'));

  /* 🎵 Syncopated – music notes */
  icons.syncopated = sq(P,
    ps('M9 17V8l8-2v9') +
    ci(7.5, 17, 1.5) +
    ci(15.5, 15, 1.5));

  /* ════════════════════════════════════════════════════════════
     UI ACTION ICONS
     ════════════════════════════════════════════════════════════ */

  /* 🔍 Search */
  icons.search = sq(B,
    ci(11, 11, 4, 'none') +
    '<circle cx="11" cy="11" r="4" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M14.5 14.5l3 3'));

  /* ➕ Add / Plus */
  icons.add = sq(G,
    ps('M12 7v10M7 12h10', c, 2));

  /* 🔄 Refresh */
  icons.refresh = sq(B,
    ps('M17 12a5 5 0 0 1-9 2M7 12a5 5 0 0 1 9-2') +
    ps('M17 8v4h-4M7 16v-4h4'));

  /* ✕ Close */
  icons.close = sq(S,
    ps('M8.5 8.5l7 7M15.5 8.5l-7 7', c, 1.8));

  /* ✅ / ✓ Check / Success */
  icons.check = sq(G,
    ps('M7 12.5l3.5 3.5 6.5-7', c, 2));

  /* ⚠️ Warning */
  icons.warning = sq(Y,
    ps('M12 6L5 18h14L12 6z') +
    ps('M12 11v3') + ci(12, 16, .9));

  /* 📤 Upload */
  icons.upload = sq(B,
    ps('M12 15V7M12 7l-3 3M12 7l3 3M6 17h12'));

  /* 📥 Download / Receive */
  icons.download = sq(B,
    ps('M12 5v8M12 13l-3-3M12 13l3-3M6 17h12'));

  /* 📩 Send (envelope + arrow) */
  icons.send = sq(B,
    ps('M5 8l7 4 7-4v8H5z') +
    ps('M5 8l7 4 7-4'));

  /* 📨 Mail / Pending mail */
  icons.mail = sq(T,
    ps('M5 8l7 4 7-4v8H5z') +
    ps('M5 8l7 4 7-4') +
    ci(17.5, 7, 2.5, 'rgba(99,102,241,.9)'));

  /* 📁 Folder */
  icons.folder = sq(B,
    ps('M5 8V17h14V10H12l-2-2H5z'));

  /* 📂 Folder Open */
  icons.folderOpen = sq(B,
    ps('M5 8V17h14V10H12l-2-2H5z') +
    ps('M5 17l2-5h14l-2 5'));

  /* 📄 Document */
  icons.document = sq(B,
    ps('M8 5h5l4 4v10H8V5z') +
    ps('M13 5v4h4'));

  /* 📋 Clipboard */
  icons.clipboard = sq(B,
    ps('M9 5h6M7 7h10v12H7z') +
    ps('M10 11h4M10 14h4'));

  /* 📖 Book */
  icons.book = sq(T,
    ps('M12 6C10 6 7 6.5 6 8v10c1-1.5 4-2 6-2s5 .5 6 2V8c-1-1.5-4-2-6-2z') +
    ps('M12 6v12'));

  /* ✏️ Edit / Pencil */
  icons.edit = sq(B,
    ps('M15 6l3 3-9 9H6v-3l9-9z') +
    ps('M13 8l3 3'));

  /* 🗑 Trash / Delete */
  icons.trash = sq(R,
    ps('M7 8h10M9 8V6h6v2M8 8v10h8V8') +
    ps('M10.5 11v4M13.5 11v4'));

  /* 💾 Save */
  icons.save = sq(B,
    ps('M6 6h10l2 2v10H6z') +
    ps('M9 6v4h5V6') +
    ps('M8 14h8'));

  /* 🔐 Lock */
  icons.lock = sq(S,
    ps('M8 11V9a4 4 0 0 1 8 0v2') +
    ps('M7 11h10v7H7z') +
    ci(12, 14.5, 1));

  /* 💡 Lightbulb / Tips */
  icons.lightbulb = sq(Y,
    ps('M12 5a4 4 0 0 0-3 6.5c.5 1 1 1.5 1 2.5h4c0-1 .5-1.5 1-2.5A4 4 0 0 0 12 5z') +
    ps('M10 16h4M10.5 18h3'));

  /* ⏳ Hourglass / Pending */
  icons.hourglass = sq(S,
    ps('M8 5h8M8 19h8M8 5c0 4 4 5 4 7s-4 3-4 7M16 5c0 4-4 5-4 7s4 3 4 7'));

  /* 🎉 Celebrate / Party */
  icons.celebrate = sq(P,
    ps('M8 18l3-10') +
    ps('M8 18c2-1 6-1 8 0') +
    ci(15, 7, 1) + ci(17, 10, .8) + ci(13, 5, .8) +
    ps('M11 8l1 2'));

  /* 💬 Chat / Speech bubble */
  icons.chat = sq(B,
    ps('M6 7h12v8H10l-3 3v-3H6z'));

  /* 👍 Thumbs up */
  icons.thumbsUp = sq(G,
    ps('M7 12v5h2M9 11l2-5c.5-1 2-1 2 .5V10h4c1 0 1.5.8 1.2 1.8l-1.5 5c-.2.7-.8 1.2-1.5 1.2H9'));

  /* 👎 Thumbs down */
  icons.thumbsDown = sq(R,
    ps('M7 7v5h2M9 13l2 5c.5 1 2 1 2-.5V14h4c1 0 1.5-.8 1.2-1.8l-1.5-5c-.2-.7-.8-1.2-1.5-1.2H9'));

  /* 📦 Archive / Box */
  icons.archive = sq(S,
    ps('M5 8h14v3H5zM6 11v7h12v-7') +
    ps('M10 13.5h4'));

  /* 🔥 Fire */
  icons.fire = sq(O,
    ps('M12 4c-3 4-5 6-3 9a4 4 0 0 0 6 0c2-3 0-5-3-9z') +
    ps('M12 13c-1 1.5-.5 3 1 3s2-1.5 1-3l-1-2-1 2z'));

  /* 🧠 Brain */
  icons.brain = sq(P,
    ps('M12 5c-2 0-4 1-4 3 0 1 .5 2 1 2.5-.5.5-1 1.5-1 2.5 0 2 2 3.5 4 3.5') +
    ps('M12 5c2 0 4 1 4 3 0 1-.5 2-1 2.5.5.5 1 1.5 1 2.5 0 2-2 3.5-4 3.5') +
    ps('M12 5v11.5'));

  /* ⬆️ Arrow Up */
  icons.arrowUp = sq(B,
    ps('M12 18V6M12 6l-4 4M12 6l4 4', c, 2));

  /* ⬇️ Arrow Down */
  icons.arrowDown = sq(B,
    ps('M12 6v12M12 18l-4-4M12 18l4-4', c, 2));

  /* ☀️ Sun / Light mode */
  icons.sun = sq(Y,
    ci(12, 12, 3) +
    ps('M12 5v-1M12 20v-1M5 12H4M20 12h-1M7.05 7.05l-.7-.7M17.66 17.66l-.71-.71M7.05 16.95l-.7.7M17.66 6.34l-.71.71'));

  /* 🌙 Moon / Dark mode */
  icons.moon = sq(B,
    ps('M15 5a7 7 0 1 0 0 14c-5 0-8-4-8-7s3-7 8-7z'));

  /* 🆕 New */
  icons.newBadge = sq(T,
    '<text x="12" y="15.5" text-anchor="middle" font-size="9" font-weight="800" fill="' + c + '">NEW</text>');

  /* ⭐ Star (also used for premium) */
  icons.star = sq(Y,
    p('M12 5l2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 15.7 7.8 18l.8-4.7L5.2 10l4.7-.7L12 5z'));

  /* 👥 People / Friends */
  icons.people = sq(B,
    ci(9, 8, 2.2) + ci(16, 8, 2) +
    ps('M5 16c0-2.5 2-4 4-4s4 1.5 4 4') +
    ps('M13 15c0-2 1.5-3.5 3-3.5s3 1.5 3 3.5'));

  /* 👋 Wave */
  icons.wave = sq(B,
    ps('M8 14l-1-5c-.3-1 .8-1.5 1.3-.7l1.5 4M10 8l-.5-3c-.2-1 .8-1.5 1.3-.5l1.2 4M12 7l-.3-2.5c-.2-1 1-1.5 1.3-.5l.8 3M14 7.5l-.2-2c-.1-1 1-1.3 1.2-.3l.5 2.5M15.5 10c1-.5 1.5.5 1 1.5l-2 4c-1 2-3 3-5 3-2.5 0-4-1.5-4.5-4'));

  /* 🤷 Shrug */
  icons.shrug = sq(S,
    ci(12, 7, 2) +
    ps('M12 10v4') +
    ps('M7 11l-1-2M17 11l1-2M9 17h6'));

  /* 🤗 Welcome / Hug */
  icons.welcome = sq(G,
    ci(12, 8, 2.5) +
    ps('M7 19c0-3 2.2-5 5-5s5 2 5 5') +
    ps('M7 13c-1-1-1-3 0-3M17 13c1-1 1-3 0-3'));

  /* 🎯 Target */
  icons.target = sq(B,
    ci(12, 12, 6, 'none') +
    '<circle cx="12" cy="12" r="6" fill="none" stroke="' + c + '" stroke-width="1.4"/>' +
    '<circle cx="12" cy="12" r="3" fill="none" stroke="' + c + '" stroke-width="1.4"/>' +
    ci(12, 12, 1));

  /* 📝 Note / Auto-detect */
  icons.note = sq(B,
    ps('M8 5h8v14H8z') +
    ps('M10 9h4M10 12h4M10 15h2'));

  /* 🔔 Notification bell */
  icons.bell = sq(B,
    ps('M12 4c-3 0-5 2.5-5 5v3l-1.5 2h13L17 12V9c0-2.5-2-5-5-5z') +
    ps('M10 16.5c0 1.1.9 2 2 2s2-.9 2-2'));

  /* 🔔 Notification bell with dot */
  icons.bellDot = sq(B,
    ps('M12 4c-3 0-5 2.5-5 5v3l-1.5 2h13L17 12V9c0-2.5-2-5-5-5z') +
    ps('M10 16.5c0 1.1.9 2 2 2s2-.9 2-2') +
    ci(16.5, 6.5, 2.5, '#ef4444'));

  /* 📋 Info */
  icons.info = sq(T,
    ci(12, 7, 1.2) +
    ps('M12 11v6') +
    ps('M10 17h4'));

  /* 🥇 Gold medal */
  icons.medalGold = sq(Y,
    ci(12, 11, 4.5) +
    '<text x="12" y="13.5" text-anchor="middle" font-size="7" font-weight="800" fill="' + c + '">1</text>' +
    ps('M9 6l-2-2M15 6l2-2'));

  /* 🥈 Silver medal */
  icons.medalSilver = sq(S,
    ci(12, 11, 4.5) +
    '<text x="12" y="13.5" text-anchor="middle" font-size="7" font-weight="800" fill="' + c + '">2</text>' +
    ps('M9 6l-2-2M15 6l2-2'));

  /* 🥉 Bronze medal */
  icons.medalBronze = sq(O,
    ci(12, 11, 4.5) +
    '<text x="12" y="13.5" text-anchor="middle" font-size="7" font-weight="800" fill="' + c + '">3</text>' +
    ps('M9 6l-2-2M15 6l2-2'));

  /* 💃🕺 Dancers */
  icons.dancers = sq(P,
    ci(9, 6.5, 1.5) + ci(15, 6.5, 1.5) +
    ps('M9 9c-1.5 2-2 5 0 8M9 9c1.5 2 2 5 0 8') +
    ps('M15 9c-1.5 2-2 5 0 8M15 9c1.5 2 2 5 0 8'));

  /* ⌘ Command key */
  icons.command = sq(S,
    ps('M8 8h8v8H8zM8 8c0-2-3-2-3 0s3 2 3 0M16 8c0-2 3-2 3 0s-3 2-3 0M8 16c0 2-3 2-3 0s3-2 3 0M16 16c0 2 3 2 3 0s-3-2-3 0'));

  /* 😛 Prank (tongue-out face) */
  icons.prank = sq(P,
    ci(12, 12, 7, 'none') +
    '<circle cx="12" cy="12" r="7" fill="none" stroke="' + c + '" stroke-width="1.4"/>' +
    ci(9.5, 10, 1) + ci(14.5, 10, 1) +
    ps('M10 15c1 1.5 3 1.5 4 0M12 15v2'));

  /* generic squircle placeholder */
  icons.generic = sq(S, ci(12, 12, 3));

  /* ════════════════════════════════════════════════════════════
     NOTIFICATION ICONS (specific event types)
     ════════════════════════════════════════════════════════════ */
  icons.notifFriendRequest = sq(B,
    ci(10, 8, 2) +
    ps('M6 16c0-2.2 1.8-4 4-4') +
    ps('M15 10v4M13 12h4'));

  icons.notifApproved = sq(G,
    ps('M7 12.5l3.5 3.5 6.5-7', c, 2.2));

  icons.notifRejected = sq(R,
    ps('M8 8l8 8M16 8l-8 8', c, 2.2));

  icons.notifDance = sq(P,
    ci(12, 7, 2) +
    ps('M12 10c-2 2.5-3 5-1 7.5M12 10c2 2.5 3 5 1 7.5'));

  icons.notifSystem = sq(T,
    ps('M12 6a2 2 0 0 1 2 2v4a2 2 0 0 1-4 0V8a2 2 0 0 1 2-2z') +
    ci(12, 17, 1.2));

  /* ════════════════════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════════════════════ */
  window.__stepperIcons = icons;
})();
