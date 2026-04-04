/**
 * stepper-notifications-tab.js
 * ─────────────────────────────────────────────────────────────
 * Dedicated Notifications tab for Step-By-Stepper.
 * Shows dance invites from friends and general notifications.
 * Integrates with the tab system in stepper-google-admin.ai-hardstop.js.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperNotificationsTabInstalled) return;
  window.__stepperNotificationsTabInstalled = true;

  var PAGE_ID = 'stepper-notifications-page';
  var TAB_ID  = 'stepper-notifications-tab';
  var BUILDER_DATA_KEY = 'linedance_builder_data_v13';
  var SESSION_KEY = 'stepper_google_auth_session_v2';
  var API_BASE_KEY = 'stepper_api_base_v1';
  var DEFAULT_BACKEND_BASE = 'https://step-by-stepper.onrender.com';

  var notifState = {
    items: [],
    loading: false,
    lastRefresh: 0,
    filter: 'all'  /* 'all' | 'unread' | 'invites' */
  };

  /* ── Helpers ── */
  function isDarkMode() {
    try { return !!(JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || 'null') || {}).isDarkMode; }
    catch (e) { return false; }
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch (e) { return null; }
  }

  function isSignedIn() {
    var s = getSession();
    return !!(s && s.credential);
  }

  function getApiBase() {
    try {
      var saved = localStorage.getItem(API_BASE_KEY);
      if (saved && /^https?:\/\//.test(saved)) return saved.replace(/\/+$/, '');
    } catch (e) { /* noop */ }
    return DEFAULT_BACKEND_BASE;
  }

  function authHeaders() {
    var h = { Accept: 'application/json', 'Content-Type': 'application/json' };
    var s = getSession();
    if (s && s.credential) h.Authorization = 'Bearer ' + s.credential;
    return h;
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = String(str || '');
    return d.innerHTML;
  }

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    var seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
    return d.toLocaleDateString();
  }

  function icon(name) {
    var icons = {
      bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
      dance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><path d="m4 17 4-4 2 4 4-7 4 7"/><path d="M8 21h8"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
      users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      checkAll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-9.5 9.5L10 17"/></svg>',
      inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>'
    };
    return icons[name] || '';
  }

  /* ── Fetch notifications from backend ── */
  function refreshNotifications() {
    if (!isSignedIn()) {
      notifState.items = [];
      notifState.loading = false;
      renderNotificationsPage();
      return;
    }
    notifState.loading = true;
    renderNotificationsPage();
    var base = getApiBase();
    fetch(base + '/api/notifications', {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: authHeaders()
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        notifState.items = Array.isArray(data.items) ? data.items : [];
        notifState.lastRefresh = Date.now();
        notifState.loading = false;
        renderNotificationsPage();
      })
      .catch(function () {
        notifState.loading = false;
        renderNotificationsPage();
      });
  }

  function markAsRead(ids) {
    if (!isSignedIn() || !ids.length) return;
    var base = getApiBase();
    fetch(base + '/api/notifications/mark-read', {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: authHeaders(),
      body: JSON.stringify({ ids: ids })
    })
      .then(function () {
        notifState.items = notifState.items.map(function (item) {
          if (ids.indexOf(item.id) !== -1) return Object.assign({}, item, { readAt: new Date().toISOString() });
          return item;
        });
        renderNotificationsPage();
      })
      .catch(function () { /* noop */ });
  }

  function markAllRead() {
    var unread = notifState.items.filter(function (n) { return !n.readAt; });
    if (unread.length) markAsRead(unread.map(function (n) { return n.id; }));
  }

  /* ── Filtered items ── */
  function getFilteredItems() {
    var items = notifState.items || [];
    if (notifState.filter === 'unread') return items.filter(function (n) { return !n.readAt; });
    if (notifState.filter === 'invites') return items.filter(function (n) { return n.kind === 'dance_invite' || n.kind === 'friend_request' || n.kind === 'collab_invite'; });
    return items;
  }

  /* ── Theme ── */
  function theme() {
    var dark = isDarkMode();
    var accent = 'var(--stepper-accent-color, #4f46e5)';
    return {
      dark: dark,
      bg: dark ? '#0a0a0a' : '#f9fafb',
      card: dark ? '#171717' : '#ffffff',
      border: dark ? '#262626' : '#e5e7eb',
      text: dark ? '#f5f5f5' : '#111827',
      subtle: dark ? '#a3a3a3' : '#6b7280',
      accent: accent,
      accentBg: dark ? 'rgba(99,102,241,.12)' : 'rgba(99,102,241,.06)',
      unreadBg: dark ? 'rgba(99,102,241,.08)' : 'rgba(99,102,241,.04)',
      dangerBg: dark ? 'rgba(239,68,68,.12)' : 'rgba(239,68,68,.06)',
      successBg: dark ? 'rgba(34,197,94,.12)' : 'rgba(34,197,94,.06)'
    };
  }

  /* ── Icon for notification kind ── */
  function kindIcon(kind) {
    switch (kind) {
      case 'dance_invite':
      case 'collab_invite': return icon('dance');
      case 'friend_request': return icon('users');
      case 'system':
      case 'update': return icon('bell');
      default: return icon('mail');
    }
  }

  function kindLabel(kind) {
    switch (kind) {
      case 'dance_invite': return 'Dance Invite';
      case 'collab_invite': return 'Collaboration';
      case 'friend_request': return 'Friend Request';
      case 'system': return 'System';
      case 'update': return 'Update';
      default: return 'Notice';
    }
  }

  /* ── Render ── */
  function renderNotificationsPage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) return;
    var t = theme();
    var filtered = getFilteredItems();
    var unreadCount = (notifState.items || []).filter(function (n) { return !n.readAt; }).length;
    var html = '';

    /* ── Header ── */
    html += '<div style="padding:24px 24px 0;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">';
    html += '<div style="display:flex;align-items:center;gap:12px;">';
    html += '<div style="width:40px;height:40px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:' + t.accentBg + ';color:' + t.accent + ';">';
    html += '<span style="width:22px;height:22px;">' + icon('bell') + '</span>';
    html += '</div>';
    html += '<div>';
    html += '<h2 style="font-size:22px;font-weight:900;letter-spacing:-.02em;margin:0;color:' + t.text + ';">Notifications</h2>';
    if (unreadCount > 0) {
      html += '<p style="font-size:12px;font-weight:700;color:' + t.accent + ';margin:2px 0 0;">' + unreadCount + ' unread</p>';
    }
    html += '</div></div>';
    if (unreadCount > 0) {
      html += '<button data-notif-action="mark-all-read" style="display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:12px;border:1px solid ' + t.border + ';background:' + t.card + ';color:' + t.subtle + ';font-size:12px;font-weight:700;cursor:pointer;transition:all .15s;">';
      html += '<span style="width:14px;height:14px;">' + icon('checkAll') + '</span> Mark all read</button>';
    }
    html += '</div>';

    /* ── Filter chips ── */
    html += '<div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">';
    var filters = [
      { id: 'all', label: 'All' },
      { id: 'unread', label: 'Unread' },
      { id: 'invites', label: 'Dance Invites' }
    ];
    for (var fi = 0; fi < filters.length; fi++) {
      var f = filters[fi];
      var active = notifState.filter === f.id;
      html += '<button data-notif-filter="' + f.id + '" style="padding:7px 16px;border-radius:999px;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;border:1.5px solid;cursor:pointer;transition:all .15s;';
      if (active) {
        html += 'background:' + t.accent + ';border-color:' + t.accent + ';color:#fff;';
      } else {
        html += 'background:transparent;border-color:' + t.border + ';color:' + t.subtle + ';';
      }
      html += '">' + escapeHtml(f.label) + '</button>';
    }
    html += '</div></div>';

    /* ── Content ── */
    if (!isSignedIn()) {
      html += '<div style="padding:60px 24px;text-align:center;">';
      html += '<div style="width:56px;height:56px;margin:0 auto 16px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:' + t.accentBg + ';color:' + t.accent + ';">';
      html += '<span style="width:28px;height:28px;">' + icon('bell') + '</span></div>';
      html += '<p style="font-size:18px;font-weight:900;color:' + t.text + ';margin:0 0 8px;">Sign in to see notifications</p>';
      html += '<p style="font-size:14px;color:' + t.subtle + ';margin:0;">Sign in from the Sign In tab to receive dance invites and updates from friends.</p>';
      html += '</div>';
    } else if (notifState.loading && notifState.items.length === 0) {
      html += '<div style="padding:60px 24px;text-align:center;">';
      html += '<div style="width:32px;height:32px;border:3px solid ' + t.border + ';border-top-color:' + t.accent + ';border-radius:50%;margin:0 auto 16px;animation:stepper-notif-spin 1s linear infinite;"></div>';
      html += '<p style="font-size:14px;font-weight:700;color:' + t.subtle + ';">Loading notifications...</p>';
      html += '</div>';
    } else if (filtered.length === 0) {
      html += '<div style="padding:60px 24px;text-align:center;">';
      html += '<div style="width:56px;height:56px;margin:0 auto 16px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:' + t.accentBg + ';color:' + t.accent + ';opacity:.5;">';
      html += '<span style="width:28px;height:28px;">' + icon('inbox') + '</span></div>';
      html += '<p style="font-size:16px;font-weight:800;color:' + t.text + ';margin:0 0 6px;">';
      html += notifState.filter === 'all' ? 'No notifications yet' : notifState.filter === 'unread' ? 'All caught up!' : 'No dance invites yet';
      html += '</p>';
      html += '<p style="font-size:13px;color:' + t.subtle + ';margin:0;">';
      html += notifState.filter === 'invites' ? 'When friends send you dance invites, they will appear here.' : 'Notifications from friends and the system will show up here.';
      html += '</p></div>';
    } else {
      html += '<div style="padding:0 16px 24px;">';
      for (var i = 0; i < filtered.length; i++) {
        var n = filtered[i];
        var isUnread = !n.readAt;
        html += '<div data-notif-id="' + escapeHtml(n.id || '') + '" style="display:flex;align-items:flex-start;gap:14px;padding:16px;border-radius:16px;margin-bottom:6px;border:1px solid ' + (isUnread ? 'color-mix(in srgb, ' + t.accent + ' 25%, ' + t.border + ')' : t.border) + ';background:' + (isUnread ? t.unreadBg : t.card) + ';cursor:pointer;transition:all .15s;">';

        /* Icon */
        var iconColor = n.kind === 'dance_invite' || n.kind === 'collab_invite' ? t.accent : t.subtle;
        html += '<div style="width:36px;height:36px;min-width:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:' + (isUnread ? t.accentBg : (t.dark ? '#262626' : '#f3f4f6')) + ';color:' + iconColor + ';">';
        html += '<span style="width:18px;height:18px;">' + kindIcon(n.kind) + '</span></div>';

        /* Content */
        html += '<div style="flex:1;min-width:0;">';
        html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">';
        html += '<span style="font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:3px 8px;border-radius:6px;background:' + t.accentBg + ';color:' + t.accent + ';">' + escapeHtml(kindLabel(n.kind)) + '</span>';
        if (isUnread) {
          html += '<span style="width:7px;height:7px;border-radius:50%;background:' + t.accent + ';flex:0 0 auto;"></span>';
        }
        html += '<span style="font-size:11px;color:' + t.subtle + ';margin-left:auto;white-space:nowrap;">' + timeAgo(n.createdAt || n.timestamp) + '</span>';
        html += '</div>';
        html += '<p style="font-size:14px;font-weight:800;color:' + t.text + ';margin:0 0 3px;line-height:1.4;">' + escapeHtml(n.title || 'Notification') + '</p>';
        html += '<p style="font-size:13px;color:' + t.subtle + ';margin:0;line-height:1.5;">' + escapeHtml(n.message || '') + '</p>';

        /* Action buttons for invites */
        if ((n.kind === 'dance_invite' || n.kind === 'friend_request' || n.kind === 'collab_invite') && !n.readAt) {
          html += '<div style="display:flex;gap:8px;margin-top:10px;">';
          html += '<button data-notif-accept="' + escapeHtml(n.id || '') + '" style="display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:10px;border:none;background:' + t.accent + ';color:#fff;font-size:12px;font-weight:800;cursor:pointer;transition:all .15s;">';
          html += '<span style="width:13px;height:13px;">' + icon('check') + '</span> Accept</button>';
          html += '<button data-notif-dismiss="' + escapeHtml(n.id || '') + '" style="display:flex;align-items:center;gap:5px;padding:6px 14px;border-radius:10px;border:1px solid ' + t.border + ';background:' + t.card + ';color:' + t.subtle + ';font-size:12px;font-weight:800;cursor:pointer;transition:all .15s;">';
          html += '<span style="width:13px;height:13px;">' + icon('x') + '</span> Dismiss</button>';
          html += '</div>';
        }

        html += '</div></div>';
      }
      html += '</div>';
    }

    page.innerHTML = html;
    page.style.background = t.bg;
    page.style.color = t.text;
    page.style.minHeight = '400px';
    wireNotificationEvents(page);
  }

  function wireNotificationEvents(page) {
    /* Filter chips */
    page.querySelectorAll('[data-notif-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        notifState.filter = btn.getAttribute('data-notif-filter') || 'all';
        renderNotificationsPage();
      });
    });

    /* Mark all read */
    var markAllBtn = page.querySelector('[data-notif-action="mark-all-read"]');
    if (markAllBtn) markAllBtn.addEventListener('click', markAllRead);

    /* Click on notification to mark as read */
    page.querySelectorAll('[data-notif-id]').forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('[data-notif-accept]') || e.target.closest('[data-notif-dismiss]')) return;
        var id = card.getAttribute('data-notif-id');
        if (id) markAsRead([id]);
      });
    });

    /* Accept button */
    page.querySelectorAll('[data-notif-accept]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-notif-accept');
        if (id) markAsRead([id]);
      });
    });

    /* Dismiss button */
    page.querySelectorAll('[data-notif-dismiss]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-notif-dismiss');
        if (id) markAsRead([id]);
      });
    });
  }

  /* ── Styles ── */
  function ensureNotificationsStyles() {
    if (document.getElementById('stepper-notifications-tab-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-notifications-tab-style';
    style.textContent = [
      '@keyframes stepper-notif-spin { to { transform:rotate(360deg); } }',
      '#' + PAGE_ID + ' * { box-sizing:border-box; }',
      '#' + PAGE_ID + ' button { cursor:pointer; }',
      '#' + PAGE_ID + ' button:hover { opacity:.85; }',
      '#' + PAGE_ID + ' [data-notif-id]:hover { transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08); }',
      '#' + PAGE_ID + ' [data-notif-accept]:hover { filter:brightness(1.1); }',
      '#' + PAGE_ID + ' [data-notif-dismiss]:hover { background:rgba(239,68,68,.08)!important;color:#ef4444!important;border-color:#ef4444!important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ════════════════════════════════════════════════════════════
     PUBLIC API
     ════════════════════════════════════════════════════════════ */
  window.__stepperNotificationsTab = {
    PAGE_ID: PAGE_ID,
    TAB_ID: TAB_ID,
    render: function () {
      ensureNotificationsStyles();
      renderNotificationsPage();
      if (isSignedIn() && Date.now() - notifState.lastRefresh > 30000) {
        refreshNotifications();
      }
    },
    refresh: refreshNotifications,
    getState: function () { return notifState; },
    getUnreadCount: function () {
      return (notifState.items || []).filter(function (n) { return !n.readAt; }).length;
    },
    icon: function () {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>';
    }
  };

})();
