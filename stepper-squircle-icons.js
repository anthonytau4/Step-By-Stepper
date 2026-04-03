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
     EXTENDED UI ICONS (40)
     ════════════════════════════════════════════════════════════ */

  /* # Hashtag – counts / numbers */
  icons.hashtag = sq(S,
    ps('M10 5.5l-1 13M15 5.5l-1 13M6 9.5h12M6 14.5h12', c, 1.8));

  /* ↕ Sort – up/down sort arrows */
  icons.sort = sq(S,
    ps('M9 17V7M9 7l-3 3M9 7l3 3', c, 1.8) +
    ps('M15 7v10M15 17l-3-3M15 17l3-3', c, 1.8));

  /* ▽ Filter – funnel */
  icons.filter = sq(S,
    ps('M5.5 6.5h13l-5 6v4l-3 2v-6z', c, 1.8));

  /* ⧉ Copy – overlapping rectangles */
  icons.copy = sq(B,
    ps('M10 5.5h7.5v7.5H10z') +
    ps('M6.5 9h7.5v7.5H6.5z'));

  /* 🔗 Link – chain link */
  icons.link = sq(B,
    ps('M10 8H8.5a4 4 0 0 0 0 8H10') +
    ps('M14 8h1.5a4 4 0 0 1 0 8H14') +
    ps('M10 12h4'));

  /* 🕐 Clock – clock face */
  icons.clock = sq(S,
    '<circle cx="12" cy="12" r="6.5" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M12 8v4.5l3 2'));

  /* 📅 Calendar – calendar page */
  icons.calendar = sq(S,
    ps('M7 7h10v11H7z') +
    ps('M7 10.5h10') +
    ps('M9.5 5v3.5M14.5 5v3.5'));

  /* 📌 Pin – pushpin */
  icons.pin = sq(Y,
    '<circle cx="12" cy="8" r="2.8" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M12 10.8v7.2') +
    ps('M9 13.5h6'));

  /* 🔖 Bookmark – bookmark ribbon */
  icons.bookmark = sq(Y,
    ps('M8 4.5h8v15l-4-3-4 3V4.5z', c, 1.8));

  /* ❤ Heart – heart shape */
  icons.heart = sq(R,
    p('M12 18.5l-.8-.7C7 14 5 11.8 5 9.2 5 7 6.8 5.2 9 5.2c1.2 0 2.4.6 3 1.4.6-.8 1.8-1.4 3-1.4 2.2 0 4 1.8 4 4.2 0 2.6-2 4.8-6.2 8.4l-.8.7z'));

  /* 🛡 Shield – admin / security */
  icons.shield = sq(B,
    ps('M12 4.5L6 7.5v4c0 4 2.5 6.5 6 8.5 3.5-2 6-4.5 6-8.5v-4L12 4.5z', c, 1.8));

  /* 🌐 Globe – earth */
  icons.globe = sq(T,
    '<circle cx="12" cy="12" r="6.5" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M5.5 12h13') +
    ps('M12 5.5c-2.5 2-3.5 4-3.5 6.5s1 4.5 3.5 6.5') +
    ps('M12 5.5c2.5 2 3.5 4 3.5 6.5s-1 4.5-3.5 6.5'));

  /* ⚙ Settings – gear */
  icons.settings = sq(S,
    '<circle cx="12" cy="12" r="3" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M12 5v2M12 17v2M5 12h2M17 12h2M7.4 7.4l1.5 1.5M15.1 15.1l1.5 1.5M7.4 16.6l1.5-1.5M15.1 8.9l1.5-1.5', c, 2));

  /* ⤢ Expand – maximize arrows */
  icons.expand = sq(S,
    ps('M9 5H5v4M15 5h4v4M5 15v4h4M19 15v4h-4', c, 1.8));

  /* ⤡ Collapse – minimize arrows */
  icons.collapse = sq(S,
    ps('M5 9h4V5M15 5v4h4M5 15h4v4M15 19v-4h4', c, 1.8));

  /* ☰ List – bullet lines */
  icons.list = sq(S,
    ci(7, 7.5, 1) + ci(7, 12, 1) + ci(7, 16.5, 1) +
    ps('M10 7.5h7M10 12h7M10 16.5h7'));

  /* ⊞ Grid – four squares */
  icons.grid = sq(S,
    ps('M5.5 5.5h5v5h-5zM13.5 5.5h5v5h-5zM5.5 13.5h5v5h-5zM13.5 13.5h5v5h-5z', c, 1.6));

  /* ▶ Play – play triangle */
  icons.play = sq(G,
    p('M8 5.5v13l9.5-6.5z'));

  /* ⏸ Pause – pause bars */
  icons.pause = sq(S,
    ps('M8 6.5h2v11H8zM14 6.5h2v11h-2z', c, 1.8));

  /* ♪ Music – music note */
  icons.music = sq(P,
    ps('M14 5.5v9.5') +
    '<circle cx="11" cy="16.5" r="2.3" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M14 5.5l3.5-1.5'));

  /* 🖨 Print – printer */
  icons.print = sq(S,
    ps('M8 15H6V10h12v5h-2') +
    ps('M8 10V5h8v5') +
    ps('M8 13h8v5.5H8z'));

  /* ↗ Export – box with arrow out */
  icons.export = sq(B,
    ps('M12 14V4.5M12 4.5l-3 3M12 4.5l3 3') +
    ps('M7 9v9h10V9'));

  /* ↙ Import – box with arrow in */
  icons.import = sq(B,
    ps('M12 4.5v9.5M12 14l-3-3M12 14l3-3') +
    ps('M7 9v9h10V9'));

  /* ↺ Undo – counter-clockwise arrow */
  icons.undo = sq(B,
    ps('M17 8H9a4.5 4.5 0 0 0 0 9h5', c, 1.8) +
    ps('M12 5l-3 3 3 3'));

  /* ↻ Redo – clockwise arrow */
  icons.redo = sq(B,
    ps('M7 8h8a4.5 4.5 0 0 1 0 9h-5', c, 1.8) +
    ps('M12 5l3 3-3 3'));

  /* 👤+ User Plus – person with plus */
  icons.userPlus = sq(G,
    ci(9, 8, 2.2) +
    ps('M5 17c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5') +
    ps('M17.5 9v4M15.5 11h4'));

  /* 👤✓ User Check – person with checkmark */
  icons.userCheck = sq(G,
    ci(9, 8, 2.2) +
    ps('M5 17c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5') +
    ps('M15 11l1.5 1.5 3-3'));

  /* ⊘ Block – circle with diagonal line */
  icons.block = sq(R,
    '<circle cx="12" cy="12" r="6.5" fill="none" stroke="' + c + '" stroke-width="1.8"/>' +
    ps('M7.5 16.5l9-9', c, 1.8));

  /* 💬 Message – chat bubble with lines */
  icons.message = sq(B,
    ps('M6 7h12v8H10l-3 3v-3H6z') +
    ps('M9 10h6M9 13h4'));

  /* 👥👥 Group – multiple people */
  icons.group = sq(P,
    ci(12, 7, 2) + ci(7, 9, 1.7) + ci(17, 9, 1.7) +
    ps('M8.5 18c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5') +
    ps('M4 17.5c0-1.5 1.2-2.8 3-3') +
    ps('M20 17.5c0-1.5-1.2-2.8-3-3'));

  /* 🏆 Trophy – trophy cup */
  icons.trophy = sq(Y,
    ps('M8 5h8v4a4 4 0 0 1-8 0V5z') +
    ps('M6 5v2a2 2 0 0 0 2 2M18 5v2a2 2 0 0 1-2 2') +
    ps('M12 13v3M9 17.5h6'));

  /* 📈 Trending – trending up line */
  icons.trending = sq(G,
    ps('M5 17l5-5 3 3 6-8', c, 2) +
    ps('M15 7h4v4'));

  /* ⚡ Zap – lightning bolt */
  icons.zap = sq(Y,
    ps('M13 5l-5 7h4l-1 7 6-9h-5z', c, 1.8));

  /* % Percent – percentage symbol */
  icons.percent = sq(S,
    '<circle cx="9" cy="8.5" r="2" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    '<circle cx="15" cy="15.5" r="2" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M16 6.5L8 17.5', c, 1.6));

  /* ? Help – question mark in circle */
  icons.help = sq(T,
    '<circle cx="12" cy="12" r="6.5" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M10 10a2.5 2.5 0 0 1 4.5 1c0 1.5-2.5 2-2.5 3') +
    ci(12, 16.5, .8));

  /* 🔑 Key – key shape */
  icons.key = sq(Y,
    '<circle cx="9" cy="12" r="3" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M12 12h6M18 12v2M15.5 12v1.5'));

  /* 🏷 Tag – label */
  icons.tag = sq(B,
    ps('M5 12l7.5-7H18v5.5L10.5 18 5 12z', c, 1.8) +
    ci(15.5, 8.5, 1.2));

  /* ☰☰ Layers – stacked layers */
  icons.layers = sq(B,
    ps('M12 6l7 4-7 4-7-4 7-4z') +
    ps('M5 13l7 4 7-4') +
    ps('M5 16l7 4 7-4'));

  /* 🗄 Database – cylinder */
  icons.database = sq(S,
    ps('M7 7c0-1.5 2.2-2.5 5-2.5s5 1 5 2.5') +
    ps('M7 7v10c0 1.5 2.2 2.5 5 2.5s5-1 5-2.5V7') +
    ps('M7 12c0 1.5 2.2 2.5 5 2.5s5-1 5-2.5'));

  /* ⊕ Crosshair – target reticle */
  icons.crosshair = sq(B,
    '<circle cx="12" cy="12" r="5" fill="none" stroke="' + c + '" stroke-width="1.6"/>' +
    ps('M12 5v3M12 16v3M5 12h3M16 12h3') +
    ci(12, 12, 1));

  /* ════════════════════════════════════════════════════════════
     MENU BAR ICONS (File, Edit, View, Format, etc.)
     ════════════════════════════════════════════════════════════ */

  /* 📄 File menu – page with fold */
  icons.fileMenu = sq(B,
    ps('M7 4h6.5l4.5 4.5V20H7V4z') +
    ps('M13.5 4v4.5H18') +
    ps('M9.5 12h5M9.5 15h3'));

  /* ✏️ Edit menu – pencil on paper */
  icons.editMenu = sq(B,
    ps('M7 17.5h10') +
    ps('M14 6.5l3 3-7.5 7.5H6.5V14L14 6.5z') +
    ps('M12 8.5l3 3'));

  /* 👁 View menu – eye */
  icons.viewMenu = sq(T,
    ps('M4.5 12c1.5-3.5 4.2-5.5 7.5-5.5s6 2 7.5 5.5c-1.5 3.5-4.2 5.5-7.5 5.5s-6-2-7.5-5.5z') +
    '<circle cx="12" cy="12" r="2.8" fill="none" stroke="' + c + '" stroke-width="1.5"/>' +
    ci(12, 12, 1.2));

  /* ¶ Format menu – pilcrow / text style */
  icons.formatMenu = sq(P,
    '<text x="7" y="17" font-size="13" font-weight="900" font-family="Georgia,serif" fill="' + c + '">A</text>' +
    ps('M14.5 6h3M14.5 6v12') +
    ps('M13 18h6'));

  /* ⊞ Insert menu – plus in box */
  icons.insertMenu = sq(G,
    ps('M6 6h12v12H6z') +
    ps('M12 9v6M9 12h6', c, 2));

  /* 🔧 Tools menu – wrench */
  icons.toolsMenu = sq(S,
    ps('M8.5 15.5l-2.5 2.5 2 2 2.5-2.5') +
    ps('M14.5 5.5a4 4 0 0 0-5 5l-1 1 5-5a4 4 0 0 0 5 5l-5-5') +
    ps('M17 7l-5 5'));

  /* 🧩 Extensions menu – puzzle piece */
  icons.extensionsMenu = sq(O,
    ps('M7 10h2.5c0-1.2 1-2.2 2.5-2.2s2.5 1 2.5 2.2H17v4h-2.5c0 1.2-1 2.2-2.5 2.2s-2.5-1-2.5-2.2H7V10z'));

  /* ❓ Help menu – question in circle */
  icons.helpMenu = sq(T,
    '<circle cx="12" cy="12" r="7" fill="none" stroke="' + c + '" stroke-width="1.5"/>' +
    ps('M10 10a2.5 2.5 0 0 1 4 1c0 1.5-2 2-2 3') +
    ci(12, 16.8, .9));

  /* ════════════════════════════════════════════════════════════
     CHAT / MESSAGING ICONS (read receipts, badges)
     ════════════════════════════════════════════════════════════ */

  /* ✓ Single check – sent */
  icons.checkSingle = sq(S,
    ps('M8 12l3 3 5-6', c, 1.8));

  /* ✓✓ Double check – delivered */
  icons.checkDouble = sq(B,
    ps('M5.5 12l3 3 5-6', c, 1.6) +
    ps('M9.5 12l3 3 5-6', c, 1.6));

  /* ✓✓ Double check blue – read */
  icons.checkRead = sq(G,
    ps('M5.5 12l3 3 5-6', 'rgba(34,197,94,.9)', 1.8) +
    ps('M9.5 12l3 3 5-6', 'rgba(34,197,94,.9)', 1.8));

  /* 🛡✓ Admin badge – shield with star */
  icons.badgeAdmin = sq(R,
    ps('M12 4L6 7.5v4c0 4 2.5 6.5 6 8.5 3.5-2 6-4.5 6-8.5v-4L12 4z', c, 1.5) +
    p('M12 8.5l1.2 2.4 2.6.4-1.9 1.9.5 2.6L12 14.5l-2.4 1.3.5-2.6-1.9-1.9 2.6-.4L12 8.5z'));

  /* 🛡 Moderator badge – shield with checkmark */
  icons.badgeMod = sq(B,
    ps('M12 4L6 7.5v4c0 4 2.5 6.5 6 8.5 3.5-2 6-4.5 6-8.5v-4L12 4z', c, 1.5) +
    ps('M9 12l2 2 4-4', c, 2));

  /* 👑 Crown – owner/creator badge */
  icons.crown = sq(Y,
    ps('M5 16h14') +
    ps('M5 16l2-7 3 3 2-5 2 5 3-3 2 7', c, 1.6));

  /* 🔹 Member badge – diamond */
  icons.badgeMember = sq(S,
    p('M12 5l5 7-5 7-5-7 5-7z'));

  /* ════════════════════════════════════════════════════════════
     DETAILED ACTION ICONS (menu items)
     ════════════════════════════════════════════════════════════ */

  /* 📄+ New document */
  icons.newDoc = sq(G,
    ps('M8 4h5l4 4v11H8V4z') +
    ps('M13 4v4h4') +
    ps('M16 12v4M14 14h4'));

  /* 📂 Open – folder open */
  icons.open = sq(B,
    ps('M5 8V17h14V10H12l-2-2H5z') +
    ps('M5 17l2-5h14l-2 5'));

  /* 💾 Save As – floppy with arrow */
  icons.saveAs = sq(B,
    ps('M6 6h9l3 3v9H6z') +
    ps('M9 6v4h5V6') +
    ps('M15 14l2 2-2 2'));

  /* 📧 Email / Share */
  icons.email = sq(B,
    ps('M5 7h14v10H5z') +
    ps('M5 7l7 5 7-5'));

  /* ✂ Cut – scissors */
  icons.cut = sq(R,
    '<circle cx="9" cy="16" r="2" fill="none" stroke="' + c + '" stroke-width="1.5"/>' +
    '<circle cx="15" cy="16" r="2" fill="none" stroke="' + c + '" stroke-width="1.5"/>' +
    ps('M9 14l3-5 3 5M12 9V5'));

  /* 📋 Paste */
  icons.paste = sq(B,
    ps('M10 4h4M7 6h10v13H7z') +
    ps('M10 10h4M10 13h4'));

  /* 🔎+ Zoom In */
  icons.zoomIn = sq(B,
    '<circle cx="11" cy="11" r="4.5" fill="none" stroke="' + c + '" stroke-width="1.5"/>' +
    ps('M14.5 14.5l3.5 3.5') +
    ps('M9 11h4M11 9v4'));

  /* 🔎- Zoom Out */
  icons.zoomOut = sq(B,
    '<circle cx="11" cy="11" r="4.5" fill="none" stroke="' + c + '" stroke-width="1.5"/>' +
    ps('M14.5 14.5l3.5 3.5') +
    ps('M9 11h4'));

  /* ⛶ Fullscreen */
  icons.fullscreen = sq(S,
    ps('M5 9V5h4M15 5h4v4M5 15v4h4M19 15v4h-4', c, 1.8));

  /* 📏 Ruler – ruler tool */
  icons.ruler = sq(S,
    ps('M6 6l12 12M6 10l2-2M10 6l2-2M10 14l2-2M14 10l2-2M14 18l2-2M18 14l2-2', c, 1.4));

  /* 🔤 Spelling – A with underline */
  icons.spelling = sq(T,
    '<text x="12" y="14" text-anchor="middle" font-size="10" font-weight="800" fill="' + c + '">Aa</text>' +
    ps('M6 17h12', '#ef4444', 1.8));

  /* 🔢 Word Count */
  icons.wordCount = sq(S,
    '<text x="12" y="14" text-anchor="middle" font-size="9" font-weight="800" fill="' + c + '">123</text>' +
    ps('M7 17h10'));

  /* 📐 Alignment – left align */
  icons.alignLeft = sq(S,
    ps('M6 7h12M6 10.5h8M6 14h10M6 17.5h6', c, 1.6));

  /* 📐 Alignment – center align */
  icons.alignCenter = sq(S,
    ps('M6 7h12M8 10.5h8M7 14h10M9 17.5h6', c, 1.6));

  /* 📐 Alignment – right align */
  icons.alignRight = sq(S,
    ps('M6 7h12M10 10.5h8M8 14h10M12 17.5h6', c, 1.6));

  /* B Bold */
  icons.bold = sq(S,
    '<text x="12" y="16" text-anchor="middle" font-size="12" font-weight="900" fill="' + c + '">B</text>');

  /* I Italic */
  icons.italic = sq(S,
    '<text x="12" y="16" text-anchor="middle" font-size="12" font-weight="700" font-style="italic" fill="' + c + '">I</text>');

  /* U Underline */
  icons.underline = sq(S,
    '<text x="12" y="14.5" text-anchor="middle" font-size="11" font-weight="700" fill="' + c + '">U</text>' +
    ps('M8 17.5h8', c, 1.5));

  /* S Strikethrough */
  icons.strikethrough = sq(S,
    '<text x="12" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="' + c + '">S</text>' +
    ps('M7 12h10', c, 1.5));

  /* 🖼 Image – photo frame */
  icons.image = sq(T,
    ps('M6 6h12v12H6z') +
    ci(10, 10, 1.5) +
    ps('M6 16l3.5-4 2.5 3 3-4 3 5'));

  /* 📊 Table – grid */
  icons.table = sq(B,
    ps('M6 6h12v12H6z') +
    ps('M6 10h12M6 14h12M10 6v12M14 6v12', c, 1.2));

  /* ¶ Paragraph */
  icons.paragraph = sq(S,
    ps('M10 4h7M13 4v16M10 4a3 3 0 0 0 0 6h3'));

  /* ∞ Special Characters */
  icons.specialChar = sq(P,
    ps('M5 12c0-2 1.5-4 3.5-4s3.5 2 3.5 4-1.5 4-3.5 4S5 14 5 12z') +
    ps('M12 12c0-2 1.5-4 3.5-4s3.5 2 3.5 4-1.5 4-3.5 4S12 14 12 12z'));

  /* 📊 Chart – bar chart */
  icons.chart = sq(G,
    ps('M6 18h12') +
    ps('M8 18v-6M11 18v-9M14 18v-5M17 18v-11', c, 2.2));

  /* 🧮 Calculator */
  icons.calculator = sq(S,
    ps('M7 4h10v16H7z') +
    ps('M9 7h6v3H9z') +
    ci(9.5, 13, .8) + ci(12, 13, .8) + ci(14.5, 13, .8) +
    ci(9.5, 16, .8) + ci(12, 16, .8) + ci(14.5, 16, .8));

  /* ════════════════════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════════════════════ */
  window.__stepperIcons = icons;
})();
