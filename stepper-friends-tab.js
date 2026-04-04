/**
 * stepper-friends-tab.js
 * ─────────────────────────────────────────────────────────────
 * Dedicated Friends tab for Step-By-Stepper.
 * Provides a full visual UI for:
 *   • Adding friends via Gmail / email address
 *   • Viewing friend list
 *   • Pending invites (sent & received)
 *   • Accept / decline invitations
 *   • Remove friends
 *   • Quick-share dances with friends
 *
 * Integrates with the existing collaboration backend endpoints
 * and the tab system in stepper-google-admin.ai-hardstop.js.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperFriendsTabInstalled) return;
  window.__stepperFriendsTabInstalled = true;

  var _ic = window.__stepperIcons || {};

  /* ── Constants ── */
  var PAGE_ID = 'stepper-friends-page';
  var TAB_ID  = 'stepper-friends-tab';
  var FRIENDS_KEY = 'stepper_friends_v1';
  var PENDING_KEY = 'stepper_friends_pending_v1';
  var BLOCKED_KEY = 'stepper_friends_blocked_v1';
  var FAVORITES_KEY = 'stepper_friends_favorites_v1';
  var GROUPS_KEY = 'stepper_friends_groups_v1';
  var REACTIONS_KEY = 'stepper_friends_message_reactions_v1';
  var BUILDER_DATA_KEY = 'linedance_builder_data_v13';

  /* ── Local state ── */
  var friendsState = {
    friends: [],
    pendingSent: [],
    pendingReceived: [],
    loading: false,
    inviteEmail: '',
    searchQuery: '',
    lastRefresh: 0,
    error: null,
    success: null,
    activeView: 'list',  /* 'list' | 'pending' | 'add' | 'chat' | 'groups' | 'groupchat' | 'staffchat' */
    chatFriend: null,     /* currently chatting friend object */
    chatMessages: [],
    chatText: '',
    chatLoading: false,
    blockedFriends: [],
    favoriteFriends: [],
    groupChats: [],
    activeGroupChat: null,
    groupChatMessages: [],
    groupChatText: '',
    groupChatLoading: false,
    showingProfile: null,
    invitingToDance: null,
    createGroupName: '',
    createGroupMembers: [],
    staffChatMessages: [],
    staffChatText: '',
    staffChatLoading: false,
    myRole: 'member'
  };

  /* ── Persistence ── */
  function saveFriendsLocal(friends) {
    try { localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends || [])); } catch (e) { /* quota */ }
  }
  function loadFriendsLocal() {
    try { return JSON.parse(localStorage.getItem(FRIENDS_KEY) || '[]'); } catch (e) { return []; }
  }
  function savePendingLocal(pending) {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify(pending || [])); } catch (e) { /* quota */ }
  }
  function loadPendingLocal() {
    try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch (e) { return []; }
  }
  function loadBlocked() { try { return JSON.parse(localStorage.getItem(BLOCKED_KEY) || '[]'); } catch (e) { return []; } }
  function saveBlocked(list) { try { localStorage.setItem(BLOCKED_KEY, JSON.stringify(list || [])); } catch (e) { /* quota */ } }
  function loadFavorites() { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); } catch (e) { return []; } }
  function saveFavorites(list) { try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(list || [])); } catch (e) { /* quota */ } }
  function loadGroups() { try { return JSON.parse(localStorage.getItem(GROUPS_KEY) || '[]'); } catch (e) { return []; } }
  function saveGroups(list) { try { localStorage.setItem(GROUPS_KEY, JSON.stringify(list || [])); } catch (e) { /* quota */ } }
  function loadReactions() { try { return JSON.parse(localStorage.getItem(REACTIONS_KEY) || '{}'); } catch (e) { return {}; } }
  function saveReactions(map) { try { localStorage.setItem(REACTIONS_KEY, JSON.stringify(map || {})); } catch (e) { /* quota */ } }

  /* Load persisted blocked/favorites/groups into state */
  friendsState.blockedFriends = loadBlocked();
  friendsState.favoriteFriends = loadFavorites();
  friendsState.groupChats = loadGroups();

  /* ── Theme helper (re-use from admin) ── */
  function isDarkMode() {
    try {
      var data = JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || 'null');
      return !!(data && data.isDarkMode);
    } catch (e) { return false; }
  }
  function themeClasses() {
    var dark = isDarkMode();
    return {
      dark: dark,
      shell: dark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-neutral-50 border-neutral-200 text-neutral-900',
      panel: dark ? 'bg-neutral-950 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900',
      soft: dark ? 'bg-neutral-900/80 border-neutral-800 text-neutral-300' : 'bg-white border-neutral-200 text-neutral-700',
      subtle: dark ? 'text-neutral-400' : 'text-neutral-500',
      accent: dark ? 'bg-indigo-500/15 border-indigo-400/30 text-indigo-200' : 'bg-indigo-50 border-indigo-200 text-indigo-700',
      danger: dark ? 'bg-red-500/15 border-red-400/30 text-red-200' : 'bg-red-50 border-red-200 text-red-700',
      success: dark ? 'bg-green-500/15 border-green-400/30 text-green-200' : 'bg-green-50 border-green-200 text-green-700',
      cardBg: dark ? 'background:#1a1a2e;border-color:#2d2d44;' : 'background:#ffffff;border-color:#e5e7eb;',
      inputBg: dark ? 'background:#111827;border-color:#374151;color:#f3f4f6;' : 'background:#ffffff;border-color:#d1d5db;color:#111827;'
    };
  }

  function escapeHtml(text) {
    var el = document.createElement('span');
    el.textContent = String(text || '');
    return el.innerHTML;
  }

  function makeReactionKey(scope, msg, fallbackIndex) {
    var id = (msg && (msg.id || msg._id || msg.messageId)) || '';
    var sender = (msg && (msg.senderEmail || msg.senderName)) || '';
    var stamp = (msg && (msg.createdAt || msg.timestamp)) || '';
    var text = (msg && msg.text) || '';
    return [
      String(scope || 'chat'),
      String(id || fallbackIndex || ''),
      String(sender),
      String(stamp),
      String(text).slice(0, 64)
    ].join('|');
  }

  function renderReactionChips(msgKey) {
    var reactions = loadReactions();
    var map = reactions[msgKey] || {};
    var parts = [];
    for (var emoji in map) {
      if (!Object.prototype.hasOwnProperty.call(map, emoji)) continue;
      if (!map[emoji]) continue;
      parts.push('<button type="button" data-friends-react="' + escapeHtml(msgKey) + '" data-friends-emoji="' + escapeHtml(emoji) + '" style="border:none;background:' + 'rgba(99,102,241,.12);' + 'cursor:pointer;padding:2px 7px;border-radius:999px;font-size:11px;font-weight:700;line-height:1.35;">' + emoji + ' ' + map[emoji] + '</button>');
    }
    return parts.join('');
  }

  function renderReactionPicker(msgKey) {
    var emojis = ['👍', '❤️', '😂', '🔥', '👏'];
    var out = '';
    for (var i = 0; i < emojis.length; i++) {
      out += '<button type="button" data-friends-react="' + escapeHtml(msgKey) + '" data-friends-emoji="' + escapeHtml(emojis[i]) + '" style="border:none;background:transparent;cursor:pointer;padding:2px 4px;border-radius:7px;font-size:12px;opacity:.85;">' + emojis[i] + '</button>';
    }
    return out;
  }

  function addReaction(msgKey, emoji) {
    if (!msgKey || !emoji) return;
    var reactions = loadReactions();
    if (!reactions[msgKey]) reactions[msgKey] = {};
    var current = Number(reactions[msgKey][emoji] || 0);
    if (current > 0) reactions[msgKey][emoji] = 0;
    else reactions[msgKey][emoji] = 1;
    if (!reactions[msgKey][emoji]) delete reactions[msgKey][emoji];
    if (!Object.keys(reactions[msgKey]).length) delete reactions[msgKey];
    saveReactions(reactions);
    renderFriendsPage();
  }

  /* ── Session helper ── */
  function getSession() {
    try { return JSON.parse(localStorage.getItem('stepper_google_auth_session_v2') || 'null'); } catch (e) { return null; }
  }
  function isSignedIn() {
    var s = getSession();
    return !!(s && s.credential);
  }
  function getProfile() {
    var s = getSession();
    return (s && s.profile) || {};
  }
  function getApiBase() {
    return window.STEPPER_API_BASE || localStorage.getItem('stepper_api_base_v1') || 'https://step-by-stepper.onrender.com';
  }

  /* ── API helpers ── */
  function authHeaders() {
    var s = getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (s && s.credential ? s.credential : '')
    };
  }

  function apiFetch(path, opts) {
    var base = getApiBase().replace(/\/+$/, '');
    var url = base + path;
    return fetch(url, Object.assign({ mode: 'cors', credentials: 'omit' }, opts || {}))
      .then(function (r) { return r.json(); });
  }

  /* ── Normalize friend item: derive .name and .email for "the other person" ── */
  function normalizeFriendItem(f) {
    var copy = {};
    for (var k in f) { if (Object.prototype.hasOwnProperty.call(f, k)) copy[k] = f[k]; }
    if (copy.direction === 'sent') {
      copy.name = copy.toDisplayName || copy.toName || copy.toEmail || '';
      copy.email = copy.toEmail || '';
    } else {
      copy.name = copy.fromDisplayName || copy.fromName || copy.fromEmail || '';
      copy.email = copy.fromEmail || '';
    }
    return copy;
  }

  /* ── Data refresh ── */
  function refreshFriends() {
    if (!isSignedIn()) return Promise.resolve();
    friendsState.loading = true;
    renderFriendsPage();

    return apiFetch('/api/friends/list', { headers: authHeaders() })
      .then(function (data) {
        var items = (data && Array.isArray(data.items)) ? data.items : [];
        items = items.map(normalizeFriendItem);
        friendsState.friends = items.filter(function (f) { return f.status === 'accepted'; });
        friendsState.pendingSent = items.filter(function (f) { return f.status === 'invited' && f.direction === 'sent'; });
        friendsState.pendingReceived = items.filter(function (f) { return f.status === 'invited' && f.direction === 'received'; });
        saveFriendsLocal(friendsState.friends);
        savePendingLocal(friendsState.pendingSent.concat(friendsState.pendingReceived));
        friendsState.lastRefresh = Date.now();
        friendsState.error = null;
      })
      .catch(function (err) {
        /* Fallback to local cache */
        friendsState.friends = loadFriendsLocal();
        var pending = loadPendingLocal();
        friendsState.pendingSent = pending.filter(function (p) { return p.direction === 'sent'; });
        friendsState.pendingReceived = pending.filter(function (p) { return p.direction === 'received'; });
        friendsState.error = 'Could not reach the server. Showing cached data.';
      })
      .finally(function () {
        friendsState.loading = false;
        renderFriendsPage();
      });
  }

  /* ── Invite friend ── */
  function sendInvite(email) {
    if (!isSignedIn()) {
      friendsState.error = 'Please sign in with Google first.';
      renderFriendsPage();
      return;
    }
    var trimmed = String(email || '').trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      friendsState.error = 'Please enter a valid email address.';
      renderFriendsPage();
      return;
    }

    /* Duplicate prevention */
    var alreadyFriend = friendsState.friends.some(function (f) { return (f.email || '').toLowerCase() === trimmed; });
    if (alreadyFriend) {
      friendsState.error = trimmed + ' is already your friend!';
      renderFriendsPage();
      return;
    }
    var alreadySent = friendsState.pendingSent.some(function (f) { return (f.email || '').toLowerCase() === trimmed; });
    if (alreadySent) {
      friendsState.error = 'You already sent a friend invite to ' + trimmed + '.';
      renderFriendsPage();
      return;
    }
    var alreadyReceived = friendsState.pendingReceived.some(function (f) { return (f.email || '').toLowerCase() === trimmed; });
    if (alreadyReceived) {
      friendsState.error = trimmed + ' already sent you an invite! Check your Pending tab.';
      renderFriendsPage();
      return;
    }

    friendsState.loading = true;
    friendsState.error = null;
    friendsState.success = null;
    renderFriendsPage();

    apiFetch('/api/friends/add', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email: trimmed })
    })
      .then(function (data) {
        if (data && data.ok) {
          friendsState.success = 'Friend invite sent to ' + trimmed + '!';
          friendsState.inviteEmail = '';
          refreshFriends();
        } else {
          friendsState.error = (data && data.error) || 'Could not send invite.';
        }
      })
      .catch(function () {
        friendsState.error = 'Could not send the invite. The server might be down.';
      })
      .finally(function () {
        friendsState.loading = false;
        renderFriendsPage();
      });
  }

  /* ── Respond to invite ── */
  function respondToInvite(inviteId, accept) {
    if (!isSignedIn()) return;
    friendsState.loading = true;
    renderFriendsPage();

    apiFetch('/api/friends/respond', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ friendId: inviteId, accept: !!accept })
    })
      .then(function () {
        friendsState.success = accept ? 'Friend request accepted!' : 'Friend request declined.';
        refreshFriends();
      })
      .catch(function () {
        friendsState.error = 'Could not respond to the invite.';
        friendsState.loading = false;
        renderFriendsPage();
      });
  }

  /* ── Remove friend ── */
  function removeFriend(friendId) {
    if (!isSignedIn()) return;
    friendsState.loading = true;
    renderFriendsPage();

    apiFetch('/api/friends/remove', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ friendId: friendId })
    })
      .then(function () {
        friendsState.success = 'Friend removed.';
        refreshFriends();
      })
      .catch(function () {
        friendsState.error = 'Could not remove friend.';
        friendsState.loading = false;
        renderFriendsPage();
      });
  }

  /* ── Chat helpers ── */
  function openChat(friend) {
    friendsState.chatFriend = friend;
    friendsState.chatMessages = [];
    friendsState.chatText = '';
    friendsState.chatLoading = true;
    friendsState.activeView = 'chat';
    renderFriendsPage();
    loadChatMessages(friend.id);
  }

  function loadChatMessages(friendId) {
    if (!isSignedIn()) return;
    apiFetch('/api/friends/chat?friendId=' + encodeURIComponent(friendId), { headers: authHeaders() })
      .then(function (data) {
        friendsState.chatMessages = (data && Array.isArray(data.messages)) ? data.messages : [];
        /* Mark messages as read after loading */
        markChatAsRead(friendId);
      })
      .catch(function () {
        friendsState.error = 'Could not load chat messages.';
      })
      .finally(function () {
        friendsState.chatLoading = false;
        renderFriendsPage();
        scrollChatToBottom();
      });
  }

  function sendChatMessage(text) {
    if (!isSignedIn() || !friendsState.chatFriend) return;
    var trimmed = String(text || '').trim();
    if (!trimmed) return;
    friendsState.chatLoading = true;
    renderFriendsPage();

    apiFetch('/api/friends/chat', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ friendId: friendsState.chatFriend.id, text: trimmed })
    })
      .then(function (data) {
        friendsState.chatMessages = (data && Array.isArray(data.messages)) ? data.messages : [];
        friendsState.chatText = '';
      })
      .catch(function () {
        friendsState.error = 'Could not send message.';
      })
      .finally(function () {
        friendsState.chatLoading = false;
        renderFriendsPage();
        scrollChatToBottom();
      });
  }

  function scrollChatToBottom() {
    setTimeout(function () {
      var chatBox = document.querySelector('[data-friends-chat-messages]');
      if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }, 50);
  }

  /* ── Read receipts ── */
  var _readReceiptTimer = null;
  function markChatAsRead(friendId) {
    if (!isSignedIn() || !friendId) return;
    /* Debounce: only fire if user stays in this chat for 500ms */
    clearTimeout(_readReceiptTimer);
    _readReceiptTimer = setTimeout(function () {
      apiFetch('/api/friends/chat/read', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ friendId: friendId })
      })
        .then(function (data) {
          if (data && Array.isArray(data.messages)) {
            friendsState.chatMessages = data.messages;
            renderFriendsPage();
          }
        })
        .catch(function () { /* silent */ });
    }, 500);
  }

  function renderMessageStatus(msg, isMe) {
    if (!isMe) return '';
    var status = msg.status || 'sent';
    var statusIcon = '';
    var statusLabel = '';
    if (status === 'read') {
      statusIcon = (_ic.checkRead || '<span style="color:#22c55e;">✓✓</span>');
      statusLabel = 'Read';
    } else if (status === 'delivered') {
      statusIcon = (_ic.checkDouble || '<span style="opacity:.6;">✓✓</span>');
      statusLabel = 'Delivered';
    } else {
      statusIcon = (_ic.checkSingle || '<span style="opacity:.5;">✓</span>');
      statusLabel = 'Sent';
    }
    return '<span style="display:inline-flex;align-items:center;gap:3px;margin-left:4px;" title="' + statusLabel + '">' +
      '<span style="font-size:10px;opacity:.6;">' + statusLabel + '</span>' +
      '<span style="width:14px;height:14px;display:inline-flex;align-items:center;">' + statusIcon + '</span></span>';
  }

  /* ── Role badge helper ── */
  function renderRoleBadge(role) {
    if (!role) return '';
    var r = String(role).toLowerCase();
    if (r === 'admin') {
      return '<span style="display:inline-flex;align-items:center;gap:2px;padding:1px 6px;border-radius:6px;font-size:9px;font-weight:900;letter-spacing:.3px;background:rgba(239,68,68,.15);color:#ef4444;margin-left:4px;vertical-align:middle;" title="Admin">' + (_ic.badgeAdmin || '🛡') + ' ADMIN</span>';
    }
    if (r === 'moderator') {
      return '<span style="display:inline-flex;align-items:center;gap:2px;padding:1px 6px;border-radius:6px;font-size:9px;font-weight:900;letter-spacing:.3px;background:rgba(99,102,241,.15);color:#6366f1;margin-left:4px;vertical-align:middle;" title="Moderator">' + (_ic.badgeMod || '🛡') + ' MOD</span>';
    }
    return '';
  }

  /* ── Detect own role ── */
  function fetchMyRole() {
    if (!isSignedIn()) return;
    apiFetch('/api/user/me', { headers: authHeaders() })
      .then(function (data) {
        if (data && data.role) {
          friendsState.myRole = data.role;
        }
      })
      .catch(function () { /* silent */ });
  }

  /* ── Staff/Moderator Chat ── */
  function loadStaffChat() {
    if (!isSignedIn()) return;
    friendsState.staffChatLoading = true;
    renderFriendsPage();
    apiFetch('/api/staff-chat', { headers: authHeaders() })
      .then(function (data) {
        friendsState.staffChatMessages = (data && Array.isArray(data.messages)) ? data.messages : [];
      })
      .catch(function () {
        friendsState.error = 'Could not load staff chat.';
      })
      .finally(function () {
        friendsState.staffChatLoading = false;
        renderFriendsPage();
        scrollChatToBottom();
      });
  }

  function sendStaffMessage(text) {
    if (!isSignedIn()) return;
    var trimmed = String(text || '').trim();
    if (!trimmed) return;
    friendsState.staffChatLoading = true;
    renderFriendsPage();
    apiFetch('/api/staff-chat', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text: trimmed })
    })
      .then(function (data) {
        friendsState.staffChatMessages = (data && Array.isArray(data.messages)) ? data.messages : [];
        friendsState.staffChatText = '';
      })
      .catch(function () {
        friendsState.error = 'Could not send staff message.';
      })
      .finally(function () {
        friendsState.staffChatLoading = false;
        renderFriendsPage();
        scrollChatToBottom();
      });
  }

  /* ── Block / Favorite / Profile helpers ── */
  function toggleBlock(friendId) {
    var idx = friendsState.blockedFriends.indexOf(friendId);
    if (idx !== -1) { friendsState.blockedFriends.splice(idx, 1); }
    else { friendsState.blockedFriends.push(friendId); }
    saveBlocked(friendsState.blockedFriends);
    renderFriendsPage();
  }
  function toggleFavorite(friendId) {
    var idx = friendsState.favoriteFriends.indexOf(friendId);
    if (idx !== -1) { friendsState.favoriteFriends.splice(idx, 1); }
    else { friendsState.favoriteFriends.push(friendId); }
    saveFavorites(friendsState.favoriteFriends);
    renderFriendsPage();
  }
  function isBlocked(friendId) { return friendsState.blockedFriends.indexOf(friendId) !== -1; }
  function isFavorite(friendId) { return friendsState.favoriteFriends.indexOf(friendId) !== -1; }
  function showProfile(friend) { friendsState.showingProfile = friend; renderFriendsPage(); }
  function hideProfile() { friendsState.showingProfile = null; renderFriendsPage(); }

  /* ── Invite to Dance / Project ── */
  function showInviteToDance(friend) {
    friendsState.invitingToDance = friend;
    renderFriendsPage();
  }
  function hideInviteToDance() {
    friendsState.invitingToDance = null;
    renderFriendsPage();
  }
  function sendDanceInvite(friend, danceId) {
    if (!isSignedIn()) return;
    var base = getApiBase().replace(/\/+$/, '');
    /* Include current dance JSON so the invited person gets the dance data */
    var currentDanceJson = null;
    try {
      var data = JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || 'null');
      if (data) currentDanceJson = data;
    } catch (e) { /* ignore */ }
    fetch(base + '/api/collaborators/invite', {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: authHeaders(),
      body: JSON.stringify({ danceId: danceId, email: friend.email, danceData: currentDanceJson })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.ok) {
          friendsState.success = 'Dance invite sent to ' + (friend.name || friend.email) + '!';
        } else {
          friendsState.error = (data && data.error) || 'Could not send dance invite.';
        }
        friendsState.invitingToDance = null;
        renderFriendsPage();
      })
      .catch(function () {
        friendsState.error = 'Could not send the dance invite. Server might be down.';
        friendsState.invitingToDance = null;
        renderFriendsPage();
      });
  }

  /* ── Group chat functions ── */
  function createGroupChat(name, memberIds) {
    if (!name || !name.trim()) { friendsState.error = 'Please enter a group name.'; renderFriendsPage(); return; }
    if (!memberIds || memberIds.length < 1) { friendsState.error = 'Add at least one friend to the group.'; renderFriendsPage(); return; }
    var group = {
      id: 'group-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      name: name.trim(),
      members: memberIds,
      createdAt: new Date().toISOString(),
      messages: []
    };
    friendsState.groupChats.push(group);
    saveGroups(friendsState.groupChats);
    friendsState.createGroupName = '';
    friendsState.createGroupMembers = [];
    friendsState.success = 'Group "' + group.name + '" created!';
    friendsState.activeView = 'groups';
    renderFriendsPage();
  }
  function openGroupChat(groupId) {
    var group = friendsState.groupChats.find(function (g) { return g.id === groupId; });
    if (!group) return;
    friendsState.activeGroupChat = group;
    friendsState.groupChatMessages = group.messages || [];
    friendsState.groupChatText = '';
    friendsState.activeView = 'groupchat';
    renderFriendsPage();
  }
  function sendGroupMessage(text) {
    if (!friendsState.activeGroupChat) return;
    var trimmed = String(text || '').trim();
    if (!trimmed) return;
    var profile = getProfile();
    var msg = {
      id: 'gmsg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      senderName: profile.name || profile.email || 'You',
      senderEmail: (profile.email || '').toLowerCase(),
      text: trimmed,
      createdAt: new Date().toISOString()
    };
    friendsState.activeGroupChat.messages = friendsState.activeGroupChat.messages || [];
    friendsState.activeGroupChat.messages.push(msg);
    friendsState.groupChatMessages = friendsState.activeGroupChat.messages;
    friendsState.groupChatText = '';
    saveGroups(friendsState.groupChats);
    renderFriendsPage();
    scrollChatToBottom();
  }
  function deleteGroupChat(groupId) {
    friendsState.groupChats = friendsState.groupChats.filter(function (g) { return g.id !== groupId; });
    saveGroups(friendsState.groupChats);
    if (friendsState.activeGroupChat && friendsState.activeGroupChat.id === groupId) {
      friendsState.activeGroupChat = null;
      friendsState.activeView = 'groups';
    }
    friendsState.success = 'Group deleted.';
    renderFriendsPage();
  }

  /* ════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */
  function renderFriendsPage() {
    var page = document.getElementById(PAGE_ID);
    if (!page) return;
    if (page.hidden || page.style.display === 'none') return;

    var theme = themeClasses();
    var signedIn = isSignedIn();
    var profile = getProfile();

    var html = '';
    html += '<div class="rounded-3xl border shadow-sm overflow-hidden ' + theme.shell + '" style="transition:all .3s ease;">';

    /* ── Header ── */
    html += '<div class="px-6 py-5 border-b ' + theme.panel + '">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">';
    html += '<div style="display:flex;align-items:center;gap:10px;">';
    html += '<span style="font-size:28px;">' + _ic.people + '</span>';
    html += '<div>';
    html += '<h2 style="font-size:20px;font-weight:900;margin:0;">Friends</h2>';
    if (signedIn && profile.name) {
      html += '<p class="' + theme.subtle + '" style="font-size:12px;margin:2px 0 0;">' + escapeHtml(profile.email || profile.name) + '</p>';
    }
    html += '</div></div>';
    if (signedIn) {
      html += '<button data-friends-refresh class="stepper-google-cta" style="font-size:12px;padding:8px 14px;border-radius:10px;">' + _ic.refresh + ' Refresh</button>';
    }
    html += '</div></div>';

    /* ── Body ── */
    html += '<div class="p-5 sm:p-6" style="min-height:200px;">';

    if (!signedIn) {
      html += renderSignInPrompt(theme);
    } else {
      /* Sub-navigation */
      html += renderSubNav(theme);

      /* Alerts */
      if (friendsState.error) {
        html += '<div class="' + theme.danger + '" style="border:1px solid;border-radius:14px;padding:12px 16px;margin-bottom:16px;font-size:13px;display:flex;align-items:center;gap:8px;">';
        html += '<span>' + _ic.warning + '</span><span>' + escapeHtml(friendsState.error) + '</span>';
        html += '<button data-friends-dismiss-error style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:16px;opacity:.6;">' + _ic.close + '</button>';
        html += '</div>';
      }
      if (friendsState.success) {
        html += '<div class="' + theme.success + '" style="border:1px solid;border-radius:14px;padding:12px 16px;margin-bottom:16px;font-size:13px;display:flex;align-items:center;gap:8px;">';
        html += '<span>' + _ic.check + '</span><span>' + escapeHtml(friendsState.success) + '</span>';
        html += '<button data-friends-dismiss-success style="margin-left:auto;background:none;border:none;cursor:pointer;font-size:16px;opacity:.6;">' + _ic.close + '</button>';
        html += '</div>';
      }

      /* Loading */
      if (friendsState.loading) {
        html += '<div style="text-align:center;padding:24px;"><div class="stepper-friends-spinner"></div><p style="margin-top:10px;font-size:13px;opacity:.7;">Loading…</p></div>';
      }

      /* Views */
      if (friendsState.activeView === 'add') {
        html += renderAddFriend(theme);
      } else if (friendsState.activeView === 'pending') {
        html += renderPendingInvites(theme);
      } else if (friendsState.activeView === 'chat') {
        html += renderChatView(theme);
      } else if (friendsState.activeView === 'groups') {
        html += renderGroupsView(theme);
      } else if (friendsState.activeView === 'groupchat') {
        html += renderGroupChatView(theme);
      } else if (friendsState.activeView === 'staffchat') {
        html += renderStaffChatView(theme);
      } else {
        html += renderFriendsList(theme);
      }
    }

    html += '</div>';

    /* Overlays */
    if (friendsState.showingProfile) {
      html += renderProfileOverlay(theme);
    }
    if (friendsState.invitingToDance) {
      html += renderDanceInviteOverlay(theme);
    }

    html += '</div>';

    page.innerHTML = html;
    wireEvents(page);
  }

  function renderSignInPrompt(theme) {
    var html = '';
    html += '<div style="text-align:center;padding:40px 20px;">';
    html += '<div style="font-size:64px;margin-bottom:16px;">' + _ic.lock + '</div>';
    html += '<h3 style="font-size:18px;font-weight:800;margin:0 0 8px;">Sign In to Connect</h3>';
    html += '<p class="' + theme.subtle + '" style="font-size:14px;max-width:360px;margin:0 auto 20px;">Sign in with your Google account to add friends, send dance invites, and collaborate on choreography together.</p>';
    html += '<button data-friends-goto-signin class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:14px;font-weight:800;">Sign In with Google</button>';
    html += '</div>';
    return html;
  }

  function renderSubNav(theme) {
    var chatIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    var groupIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
    var views = [
      { key: 'list', label: 'My Friends', icon: _ic.people, count: friendsState.friends.length },
      { key: 'pending', label: 'Pending', icon: _ic.mail, count: friendsState.pendingSent.length + friendsState.pendingReceived.length },
      { key: 'add', label: 'Add Friend', icon: _ic.add, count: 0 },
      { key: 'chat', label: 'Chat', icon: chatIcon, count: 0 },
      { key: 'groups', label: 'Groups', icon: groupIcon, count: friendsState.groupChats.length }
    ];
    /* Staff chat visible to admins/moderators */
    var role = String(friendsState.myRole || '').toLowerCase();
    if (role === 'admin' || role === 'moderator') {
      views.push({ key: 'staffchat', label: 'Staff Chat', icon: (_ic.shield || '🛡'), count: 0 });
    }
    var html = '<div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">';
    for (var i = 0; i < views.length; i++) {
      var v = views[i];
      var active = friendsState.activeView === v.key;
      var bgStyle = active
        ? 'background:#4f46e5;color:#fff;border-color:#4f46e5;box-shadow:0 4px 12px rgba(79,70,229,.25);'
        : (theme.dark ? 'background:#1f2937;border-color:#374151;color:#d1d5db;' : 'background:#f9fafb;border-color:#e5e7eb;color:#374151;');
      html += '<button data-friends-view="' + v.key + '" style="display:flex;align-items:center;gap:6px;padding:10px 16px;border-radius:12px;border:1px solid;font-weight:800;font-size:13px;cursor:pointer;transition:all .2s ease;' + bgStyle + '">';
      html += '<span>' + v.icon + '</span><span>' + escapeHtml(v.label) + '</span>';
      if (v.count > 0) {
        html += '<span style="background:' + (active ? 'rgba(255,255,255,.25)' : 'rgba(79,70,229,.12)') + ';padding:2px 8px;border-radius:999px;font-size:11px;font-weight:900;">' + v.count + '</span>';
      }
      html += '</button>';
    }
    html += '</div>';
    return html;
  }

  function renderAddFriend(theme) {
    var html = '';
    html += '<div class="' + theme.soft + '" style="border:1px solid;border-radius:18px;padding:24px;margin-bottom:16px;">';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0 0 4px;">Add a Friend by Email</h3>';
    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 16px;">Enter your friend\'s Gmail or email address. They\'ll get a notification to accept your friend request.</p>';

    html += '<div style="display:flex;gap:10px;align-items:stretch;flex-wrap:wrap;">';
    html += '<input data-friends-email type="email" placeholder="friend@gmail.com" value="' + escapeHtml(friendsState.inviteEmail) + '" ';
    html += 'style="flex:1 1 220px;border-radius:12px;border:1px solid;padding:12px 16px;font-size:15px;outline:none;transition:border-color .2s,box-shadow .2s;' + theme.inputBg + '" />';
    html += '<button data-friends-send-invite class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:12px;font-weight:800;white-space:nowrap;">';
    html += _ic.send + ' Send Invite</button>';
    html += '</div>';

    /* Quick tips */
    html += '<div style="margin-top:16px;padding:14px;border-radius:12px;' + (theme.dark ? 'background:#1e293b;' : 'background:#f0f4ff;') + '">';
    html += '<p style="font-size:12px;font-weight:700;margin:0 0 6px;opacity:.8;">' + _ic.lightbulb + ' Tips</p>';
    html += '<ul style="font-size:12px;margin:0;padding-left:18px;opacity:.7;line-height:1.7;">';
    html += '<li>Your friend needs a Step-By-Stepper account to accept</li>';
    html += '<li>Use the same email they use to sign in with Google</li>';
    html += '<li>Friends can collaborate on dances together in real-time</li>';
    html += '</ul></div>';

    html += '</div>';
    return html;
  }

  function renderFriendsList(theme) {
    var html = '';
    var friends = friendsState.friends;

    /* Filter out blocked friends */
    var visibleFriends = friends.filter(function (f) { return !isBlocked(f.id); });
    var blockedCount = friends.length - visibleFriends.length;

    /* Search bar */
    if (friends.length > 3) {
      html += '<div style="margin-bottom:16px;">';
      html += '<input data-friends-search type="text" placeholder="Search friends…" value="' + escapeHtml(friendsState.searchQuery) + '" ';
      html += 'style="width:100%;border-radius:12px;border:1px solid;padding:10px 16px;font-size:14px;outline:none;' + theme.inputBg + '" />';
      html += '</div>';
    }

    /* Filter */
    var filtered = visibleFriends;
    if (friendsState.searchQuery) {
      var q = friendsState.searchQuery.toLowerCase();
      filtered = visibleFriends.filter(function (f) {
        return (f.name || '').toLowerCase().indexOf(q) !== -1 || (f.email || '').toLowerCase().indexOf(q) !== -1;
      });
    }

    /* Sort: favorites first, then alphabetical */
    filtered.sort(function (a, b) {
      var aFav = isFavorite(a.id) ? 0 : 1;
      var bFav = isFavorite(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      var aName = (a.name || a.email || '').toLowerCase();
      var bName = (b.name || b.email || '').toLowerCase();
      return aName < bName ? -1 : (aName > bName ? 1 : 0);
    });

    if (!filtered.length) {
      html += '<div style="text-align:center;padding:32px 16px;">';
      if (!friends.length) {
        html += '<div style="font-size:56px;margin-bottom:12px;">' + _ic.welcome + '</div>';
        html += '<h3 style="font-size:16px;font-weight:800;margin:0 0 6px;">No Friends Yet</h3>';
        html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 16px;">Add your first friend to start collaborating on line dances!</p>';
        html += '<button data-friends-view="add" class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:12px;font-weight:800;">' + _ic.add + ' Add Your First Friend</button>';
      } else {
        html += '<p class="' + theme.subtle + '" style="font-size:14px;">No friends match "' + escapeHtml(friendsState.searchQuery) + '"</p>';
      }
      html += '</div>';
      return html;
    }

    /* Friend cards */
    html += '<div style="display:grid;gap:10px;">';
    for (var i = 0; i < filtered.length; i++) {
      var f = filtered[i];
      html += renderFriendCard(f, theme);
    }
    html += '</div>';

    /* Blocked count */
    if (blockedCount > 0) {
      html += '<div style="text-align:center;margin-top:16px;">';
      html += '<p class="' + theme.subtle + '" style="font-size:12px;margin:0;">' + blockedCount + ' blocked friend' + (blockedCount > 1 ? 's' : '') + ' hidden. ';
      html += '<span style="color:#4f46e5;font-size:12px;font-weight:700;">Click a friend\'s profile to unblock.</span>';
      html += '</p></div>';
    }

    return html;
  }

  function renderFriendCard(friend, theme) {
    var html = '';
    var initial = String(friend.name || friend.email || '?').charAt(0).toUpperCase();
    var colors = ['#4f46e5','#7c3aed','#db2777','#ea580c','#059669','#0891b2','#6366f1'];
    var bgColor = colors[initial.charCodeAt(0) % colors.length];
    var fav = isFavorite(friend.id);

    html += '<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:16px;border:1px solid;transition:all .2s ease;' + theme.cardBg + '">';

    /* Avatar - clickable for profile */
    html += '<div data-friends-profile-open="' + escapeHtml(friend.id || '') + '" style="width:44px;height:44px;border-radius:999px;background:' + bgColor + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;flex-shrink:0;cursor:pointer;" title="View profile">';
    if (friend.picture) {
      html += '<img src="' + escapeHtml(friend.picture) + '" alt="" style="width:44px;height:44px;border-radius:999px;object-fit:cover;" />';
    } else {
      html += initial;
    }
    html += '</div>';

    /* Info - clickable for profile */
    html += '<div style="flex:1;min-width:0;cursor:pointer;" data-friends-profile-open="' + escapeHtml(friend.id || '') + '">';
    html += '<div style="font-weight:800;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">';
    if (fav) {
      html += '<span style="color:#eab308;margin-right:4px;" title="Favorite">&#9733;</span>';
    }
    html += escapeHtml(friend.name || 'Friend') + '</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(friend.email || '') + '</div>';
    html += '</div>';

    /* Actions */
    html += '<div style="display:flex;align-items:center;gap:6px;">';
    html += '<span style="width:8px;height:8px;border-radius:999px;background:#22c55e;display:inline-block;" title="Connected"></span>';
    html += '<button data-friends-invite-dance="' + escapeHtml(friend.id || '') + '" title="Invite to dance" style="background:none;border:none;cursor:pointer;font-size:14px;opacity:.5;transition:opacity .2s;">&#x1F57A;</button>';
    html += '<button data-friends-chat-open="' + escapeHtml(friend.id || '') + '" title="Chat" style="background:none;border:none;cursor:pointer;font-size:16px;opacity:.5;transition:opacity .2s;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>';
    html += '<button data-friends-remove="' + escapeHtml(friend.id || friend.email || '') + '" title="Remove friend" style="background:none;border:none;cursor:pointer;font-size:16px;opacity:.4;transition:opacity .2s;">' + _ic.close + '</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderPendingInvites(theme) {
    var html = '';
    var received = friendsState.pendingReceived;
    var sent = friendsState.pendingSent;

    /* Received */
    html += '<h3 style="font-size:14px;font-weight:800;margin:0 0 10px;">' + _ic.download + ' Received Invites</h3>';
    if (!received.length) {
      html += '<div class="' + theme.soft + '" style="border:1px solid;border-radius:14px;padding:20px;text-align:center;margin-bottom:20px;">';
      html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0;">No pending invites to review.</p>';
      html += '</div>';
    } else {
      html += '<div style="display:grid;gap:10px;margin-bottom:20px;">';
      for (var i = 0; i < received.length; i++) {
        html += renderInviteCard(received[i], theme, true);
      }
      html += '</div>';
    }

    /* Sent */
    html += '<h3 style="font-size:14px;font-weight:800;margin:0 0 10px;">' + _ic.upload + ' Sent Invites</h3>';
    if (!sent.length) {
      html += '<div class="' + theme.soft + '" style="border:1px solid;border-radius:14px;padding:20px;text-align:center;">';
      html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0;">No pending sent invites.</p>';
      html += '</div>';
    } else {
      html += '<div style="display:grid;gap:10px;">';
      for (var j = 0; j < sent.length; j++) {
        html += renderInviteCard(sent[j], theme, false);
      }
      html += '</div>';
    }

    return html;
  }

  function renderInviteCard(invite, theme, isReceived) {
    var html = '';
    var name = invite.name || invite.email || 'Someone';

    html += '<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:16px;border:1px solid;' + theme.cardBg + '">';

    /* Avatar placeholder */
    var initial = String(name).charAt(0).toUpperCase();
    html += '<div style="width:40px;height:40px;border-radius:999px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;flex-shrink:0;">' + initial + '</div>';

    /* Info */
    html += '<div style="flex:1;min-width:0;">';
    html += '<div style="font-weight:800;font-size:14px;">' + escapeHtml(name) + '</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:12px;">' + escapeHtml(invite.email || '') + '</div>';
    html += '</div>';

    /* Actions */
    if (isReceived) {
      html += '<div style="display:flex;gap:6px;">';
      html += '<button data-friends-accept="' + escapeHtml(invite.id || '') + '" class="stepper-google-cta" style="background:#22c55e;color:#fff;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:800;">' + _ic.check + ' Accept</button>';
      html += '<button data-friends-decline="' + escapeHtml(invite.id || '') + '" class="stepper-google-cta" style="padding:8px 14px;border-radius:10px;font-size:12px;font-weight:800;' + (theme.dark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#6b7280;') + '">' + _ic.close + ' Decline</button>';
      html += '</div>';
    } else {
      html += '<span style="font-size:12px;font-weight:700;padding:6px 12px;border-radius:999px;' + (theme.dark ? 'background:#374151;color:#9ca3af;' : 'background:#f3f4f6;color:#9ca3af;') + '">' + _ic.hourglass + ' Pending</span>';
    }

    html += '</div>';
    return html;
  }

  function renderChatView(theme) {
    var html = '';
    var friend = friendsState.chatFriend;
    var profile = getProfile();
    var myEmail = (profile.email || '').toLowerCase();

    if (!friend) {
      /* Show friend picker */
      var friends = friendsState.friends;
      html += '<div class="' + theme.soft + '" style="border:1px solid;border-radius:18px;padding:24px;margin-bottom:16px;">';
      html += '<h3 style="font-size:16px;font-weight:800;margin:0 0 8px;">Select a Friend to Chat With</h3>';
      if (!friends.length) {
        html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0;">Add some friends first to start chatting!</p>';
      } else {
        html += '<div style="display:grid;gap:8px;">';
        for (var i = 0; i < friends.length; i++) {
          var f = friends[i];
          var displayName = escapeHtml(f.name || f.toName || f.fromName || f.email || f.toEmail || f.fromEmail || 'Friend');
          var displayEmail = escapeHtml(f.email || f.toEmail || f.fromEmail || '');
          html += '<button data-friends-chat-start="' + escapeHtml(f.id || '') + '" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:14px;border:1px solid;cursor:pointer;text-align:left;transition:all .2s ease;' + theme.cardBg + '">';
          html += '<div style="width:36px;height:36px;border-radius:999px;background:#4f46e5;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:15px;flex-shrink:0;">' + displayName.charAt(0).toUpperCase() + '</div>';
          html += '<div style="flex:1;min-width:0;"><div style="font-weight:800;font-size:13px;">' + displayName + '</div>';
          html += '<div class="' + theme.subtle + '" style="font-size:11px;">' + displayEmail + '</div></div>';
          html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;opacity:.4;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
          html += '</button>';
        }
        html += '</div>';
      }
      html += '</div>';
      return html;
    }

    /* Chat with specific friend */
    var friendName = escapeHtml(friend.name || friend.toName || friend.fromName || friend.email || friend.toEmail || friend.fromEmail || 'Friend');

    html += '<div style="display:flex;flex-direction:column;height:400px;border:1px solid;border-radius:18px;overflow:hidden;' + theme.cardBg + '">';

    /* Chat header */
    html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid;' + (theme.dark ? 'border-color:#2d2d44;background:#1e1e2e;' : 'border-color:#e5e7eb;background:#f9fafb;') + '">';
    html += '<button data-friends-chat-back style="background:none;border:none;cursor:pointer;font-size:18px;opacity:.6;transition:opacity .2s;">&larr;</button>';
    html += '<div style="width:32px;height:32px;border-radius:999px;background:#4f46e5;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;flex-shrink:0;">' + friendName.charAt(0).toUpperCase() + '</div>';
    html += '<div style="font-weight:800;font-size:14px;">' + friendName + '</div>';
    html += '</div>';

    /* Messages area */
    html += '<div data-friends-chat-messages style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;">';
    if (friendsState.chatLoading) {
      html += '<div style="text-align:center;padding:20px;"><div class="stepper-friends-spinner"></div></div>';
    } else if (!friendsState.chatMessages.length) {
      html += '<div style="text-align:center;padding:40px 16px;opacity:.5;font-size:13px;">No messages yet. Say hello!</div>';
    } else {
      for (var j = 0; j < friendsState.chatMessages.length; j++) {
        var msg = friendsState.chatMessages[j];
        var msgKey = makeReactionKey('chat:' + ((friend && friend.id) || ''), msg, j);
        var isMe = (msg.senderEmail || '').toLowerCase() === myEmail;
        var align = isMe ? 'flex-end' : 'flex-start';
        var bubbleBg = isMe ? 'background:#4f46e5;color:#fff;' : (theme.dark ? 'background:#2d2d44;color:#e5e7eb;' : 'background:#f0f0f0;color:#1f2937;');
        html += '<div style="display:flex;justify-content:' + align + ';">';
        html += '<div style="max-width:75%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.5;word-wrap:break-word;' + bubbleBg + '">';
        html += escapeHtml(msg.text || '');
        html += '<div style="font-size:10px;opacity:.6;margin-top:4px;display:flex;align-items:center;gap:3px;flex-wrap:wrap;justify-content:' + (isMe ? 'flex-end' : 'flex-start') + ';">';
        html += escapeHtml(msg.senderName || '') + renderRoleBadge(msg.senderRole) + ' &middot; ' + formatTime(msg.createdAt);
        html += renderMessageStatus(msg, isMe);
        html += '</div>';
        html += '<div style="margin-top:4px;display:flex;align-items:center;gap:4px;flex-wrap:wrap;justify-content:' + (isMe ? 'flex-end' : 'flex-start') + ';">';
        html += renderReactionChips(msgKey);
        html += '<span style="opacity:.75;display:inline-flex;align-items:center;">' + renderReactionPicker(msgKey) + '</span>';
        html += '</div>';
        html += '</div></div>';
      }
    }
    html += '</div>';

    /* Input area */
    html += '<div style="display:flex;gap:8px;padding:12px 16px;border-top:1px solid;' + (theme.dark ? 'border-color:#2d2d44;background:#1e1e2e;' : 'border-color:#e5e7eb;background:#f9fafb;') + '">';
    html += '<input data-friends-chat-input type="text" placeholder="Type a message…" value="' + escapeHtml(friendsState.chatText) + '" ';
    html += 'style="flex:1;border-radius:12px;border:1px solid;padding:10px 14px;font-size:13px;outline:none;' + theme.inputBg + '" />';
    html += '<button data-friends-chat-send class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:12px;font-weight:800;font-size:13px;white-space:nowrap;">Send</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  /* ── Groups view ── */
  function renderGroupsView(theme) {
    var html = '';
    var groups = friendsState.groupChats;

    html += '<div class="' + theme.soft + '" style="border:1px solid;border-radius:18px;padding:24px;margin-bottom:16px;">';
    html += '<h3 style="font-size:16px;font-weight:800;margin:0 0 4px;">Create New Group</h3>';
    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 14px;">Start a group chat with your friends.</p>';

    html += '<div style="margin-bottom:12px;">';
    html += '<input data-friends-group-name type="text" placeholder="Group name…" value="' + escapeHtml(friendsState.createGroupName) + '" ';
    html += 'style="width:100%;border-radius:12px;border:1px solid;padding:10px 16px;font-size:14px;outline:none;box-sizing:border-box;' + theme.inputBg + '" />';
    html += '</div>';

    var friends = friendsState.friends.filter(function (f) { return !isBlocked(f.id); });
    if (friends.length) {
      html += '<div style="margin-bottom:12px;max-height:160px;overflow-y:auto;display:grid;gap:6px;">';
      for (var i = 0; i < friends.length; i++) {
        var f = friends[i];
        var checked = friendsState.createGroupMembers.indexOf(f.id) !== -1;
        var checkBg = checked
          ? 'background:#4f46e5;color:#fff;border-color:#4f46e5;'
          : (theme.dark ? 'background:#1f2937;border-color:#374151;color:#d1d5db;' : 'background:#f9fafb;border-color:#e5e7eb;color:#374151;');
        html += '<div data-friends-group-member="' + escapeHtml(f.id) + '" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;border:1px solid;cursor:pointer;font-size:13px;transition:all .2s ease;user-select:none;' + checkBg + '">';
        html += '<span style="font-weight:700;">' + (checked ? '&#9745;' : '&#9744;') + '</span>';
        html += '<span>' + escapeHtml(f.name || f.email || 'Friend') + '</span>';
        html += '</div>';
      }
      html += '</div>';
    } else {
      html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 12px;">Add some friends first to create a group.</p>';
    }

    html += '<button data-friends-create-group class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:12px;font-weight:800;font-size:13px;">Create Group</button>';
    html += '</div>';

    /* Existing groups */
    if (groups.length) {
      html += '<h3 style="font-size:14px;font-weight:800;margin:0 0 10px;">Your Groups</h3>';
      html += '<div style="display:grid;gap:10px;">';
      for (var j = 0; j < groups.length; j++) {
        var g = groups[j];
        var lastMsg = (g.messages && g.messages.length) ? g.messages[g.messages.length - 1] : null;
        html += '<div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:16px;border:1px solid;' + theme.cardBg + '">';
        html += '<div style="width:44px;height:44px;border-radius:999px;background:#7c3aed;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;flex-shrink:0;">' + escapeHtml(g.name.charAt(0).toUpperCase()) + '</div>';
        html += '<div style="flex:1;min-width:0;cursor:pointer;" data-friends-group-open="' + escapeHtml(g.id) + '">';
        html += '<div style="font-weight:800;font-size:14px;">' + escapeHtml(g.name) + '</div>';
        html += '<div class="' + theme.subtle + '" style="font-size:12px;">' + g.members.length + ' member' + (g.members.length !== 1 ? 's' : '');
        if (lastMsg) {
          html += ' &middot; ' + escapeHtml((lastMsg.senderName || '').split(' ')[0]) + ': ' + escapeHtml(lastMsg.text.length > 30 ? lastMsg.text.slice(0, 30) + '…' : lastMsg.text);
        }
        html += '</div></div>';
        html += '<div style="display:flex;gap:6px;">';
        html += '<button data-friends-group-open="' + escapeHtml(g.id) + '" class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:8px 14px;border-radius:10px;font-size:12px;font-weight:800;">Open</button>';
        html += '<button data-friends-group-delete="' + escapeHtml(g.id) + '" style="background:none;border:none;cursor:pointer;font-size:16px;opacity:.4;" title="Delete group">' + _ic.close + '</button>';
        html += '</div></div>';
      }
      html += '</div>';
    } else {
      html += '<div style="text-align:center;padding:20px;">';
      html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0;">No groups yet. Create one above!</p>';
      html += '</div>';
    }

    return html;
  }

  /* ── Group chat view ── */
  function renderGroupChatView(theme) {
    var html = '';
    var group = friendsState.activeGroupChat;
    var profile = getProfile();
    var myEmail = (profile.email || '').toLowerCase();

    if (!group) {
      friendsState.activeView = 'groups';
      return renderGroupsView(theme);
    }

    html += '<div style="display:flex;flex-direction:column;height:400px;border:1px solid;border-radius:18px;overflow:hidden;' + theme.cardBg + '">';

    /* Header */
    html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid;' + (theme.dark ? 'border-color:#2d2d44;background:#1e1e2e;' : 'border-color:#e5e7eb;background:#f9fafb;') + '">';
    html += '<button data-friends-group-back style="background:none;border:none;cursor:pointer;font-size:18px;opacity:.6;transition:opacity .2s;">&larr;</button>';
    html += '<div style="width:32px;height:32px;border-radius:999px;background:#7c3aed;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;flex-shrink:0;">' + escapeHtml(group.name.charAt(0).toUpperCase()) + '</div>';
    html += '<div style="flex:1;min-width:0;"><div style="font-weight:800;font-size:14px;">' + escapeHtml(group.name) + '</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:11px;">' + group.members.length + ' member' + (group.members.length !== 1 ? 's' : '') + '</div></div>';
    html += '</div>';

    /* Messages */
    html += '<div data-friends-chat-messages style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;">';
    var msgs = friendsState.groupChatMessages;
    if (!msgs.length) {
      html += '<div style="text-align:center;padding:40px 16px;opacity:.5;font-size:13px;">No messages yet. Say hello to the group!</div>';
    } else {
      for (var i = 0; i < msgs.length; i++) {
        var msg = msgs[i];
        var isMe = (msg.senderEmail || '').toLowerCase() === myEmail;
        var align = isMe ? 'flex-end' : 'flex-start';
        var bubbleBg = isMe ? 'background:#4f46e5;color:#fff;' : (theme.dark ? 'background:#2d2d44;color:#e5e7eb;' : 'background:#f0f0f0;color:#1f2937;');
        html += '<div style="display:flex;justify-content:' + align + ';">';
        html += '<div style="max-width:75%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.5;word-wrap:break-word;' + bubbleBg + '">';
        html += escapeHtml(msg.text || '');
        html += '<div style="font-size:10px;opacity:.6;margin-top:4px;display:flex;align-items:center;gap:3px;flex-wrap:wrap;justify-content:' + (isMe ? 'flex-end' : 'flex-start') + ';">';
        html += escapeHtml(msg.senderName || '') + renderRoleBadge(msg.senderRole || msg.role) + ' &middot; ' + formatTime(msg.createdAt);
        html += renderMessageStatus(msg, isMe);
        html += '</div>';
        html += '</div></div>';
      }
    }
    html += '</div>';

    /* Input */
    html += '<div style="display:flex;gap:8px;padding:12px 16px;border-top:1px solid;' + (theme.dark ? 'border-color:#2d2d44;background:#1e1e2e;' : 'border-color:#e5e7eb;background:#f9fafb;') + '">';
    html += '<input data-friends-group-input type="text" placeholder="Type a message…" value="' + escapeHtml(friendsState.groupChatText) + '" ';
    html += 'style="flex:1;border-radius:12px;border:1px solid;padding:10px 14px;font-size:13px;outline:none;' + theme.inputBg + '" />';
    html += '<button data-friends-group-send class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:12px;font-weight:800;font-size:13px;white-space:nowrap;">Send</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  /* ── Staff / Moderator Chat view ── */
  function renderStaffChatView(theme) {
    var html = '';
    var profile = getProfile();
    var myEmail = (profile.email || '').toLowerCase();
    var myRole = String(friendsState.myRole || '').toLowerCase();

    html += '<div style="display:flex;flex-direction:column;height:440px;border:1px solid;border-radius:18px;overflow:hidden;' + theme.cardBg + '">';

    /* Header */
    html += '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid;' + (theme.dark ? 'border-color:#2d2d44;background:#1e1e2e;' : 'border-color:#e5e7eb;background:#f9fafb;') + '">';
    html += '<button data-friends-staffchat-back style="background:none;border:none;cursor:pointer;font-size:18px;opacity:.6;transition:opacity .2s;">&larr;</button>';
    html += '<div style="width:32px;height:32px;border-radius:999px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0;">' + (_ic.shield || '🛡') + '</div>';
    html += '<div style="flex:1;min-width:0;"><div style="font-weight:800;font-size:14px;">Staff Chat</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:11px;">Admins &amp; Moderators only</div></div>';
    html += renderRoleBadge(myRole);
    html += '</div>';

    /* Messages */
    html += '<div data-friends-chat-messages style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;">';
    if (friendsState.staffChatLoading) {
      html += '<div style="text-align:center;padding:20px;"><div class="stepper-friends-spinner"></div></div>';
    } else if (!friendsState.staffChatMessages.length) {
      html += '<div style="text-align:center;padding:40px 16px;opacity:.5;font-size:13px;">No staff messages yet. Start the conversation!</div>';
    } else {
      for (var i = 0; i < friendsState.staffChatMessages.length; i++) {
        var msg = friendsState.staffChatMessages[i];
        var isMe = (msg.email || '').toLowerCase() === myEmail;
        var align = isMe ? 'flex-end' : 'flex-start';
        var bubbleBg = isMe ? 'background:#4f46e5;color:#fff;' : (theme.dark ? 'background:#2d2d44;color:#e5e7eb;' : 'background:#f0f0f0;color:#1f2937;');
        html += '<div style="display:flex;justify-content:' + align + ';">';
        html += '<div style="max-width:75%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.5;word-wrap:break-word;' + bubbleBg + '">';
        html += escapeHtml(msg.text || '');
        html += '<div style="font-size:10px;opacity:.6;margin-top:4px;display:flex;align-items:center;gap:3px;flex-wrap:wrap;justify-content:' + (isMe ? 'flex-end' : 'flex-start') + ';">';
        html += escapeHtml(msg.name || '') + renderRoleBadge(msg.role) + ' &middot; ' + formatTime(msg.createdAt);
        html += '</div>';
        html += '</div></div>';
      }
    }
    html += '</div>';

    /* Input */
    html += '<div style="display:flex;gap:8px;padding:12px 16px;border-top:1px solid;' + (theme.dark ? 'border-color:#2d2d44;background:#1e1e2e;' : 'border-color:#e5e7eb;background:#f9fafb;') + '">';
    html += '<input data-friends-staff-input type="text" placeholder="Message staff…" value="' + escapeHtml(friendsState.staffChatText) + '" ';
    html += 'style="flex:1;border-radius:12px;border:1px solid;padding:10px 14px;font-size:13px;outline:none;' + theme.inputBg + '" />';
    html += '<button data-friends-staff-send class="stepper-google-cta" style="background:#4f46e5;color:#fff;padding:10px 16px;border-radius:12px;font-weight:800;font-size:13px;white-space:nowrap;">Send</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  /* ── Profile overlay ── */
  function renderProfileOverlay(theme) {
    var friend = friendsState.showingProfile;
    if (!friend) return '';
    var initial = String(friend.name || friend.email || '?').charAt(0).toUpperCase();
    var colors = ['#4f46e5','#7c3aed','#db2777','#ea580c','#059669','#0891b2','#6366f1'];
    var bgColor = colors[initial.charCodeAt(0) % colors.length];
    var fav = isFavorite(friend.id);
    var blocked = isBlocked(friend.id);

    var html = '';
    html += '<div data-friends-profile-close style="position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:100;display:flex;align-items:center;justify-content:center;border-radius:24px;">';
    html += '<div style="width:320px;max-width:90%;border-radius:20px;padding:28px;text-align:center;position:relative;' + (theme.dark ? 'background:#1e1e2e;color:#e5e7eb;' : 'background:#fff;color:#1f2937;') + 'box-shadow:0 20px 60px rgba(0,0,0,.25);" onclick="event.stopPropagation();">';

    /* Close */
    html += '<button data-friends-profile-close style="position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;font-size:18px;opacity:.5;">' + _ic.close + '</button>';

    /* Avatar */
    html += '<div style="width:72px;height:72px;border-radius:999px;background:' + bgColor + ';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:30px;margin:0 auto 12px;">';
    if (friend.picture) {
      html += '<img src="' + escapeHtml(friend.picture) + '" alt="" style="width:72px;height:72px;border-radius:999px;object-fit:cover;" />';
    } else {
      html += initial;
    }
    html += '</div>';

    html += '<div style="font-weight:900;font-size:18px;margin-bottom:2px;">' + escapeHtml(friend.name || 'Friend') + '</div>';
    html += '<div class="' + theme.subtle + '" style="font-size:13px;margin-bottom:18px;">' + escapeHtml(friend.email || '') + '</div>';

    /* Action buttons */
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';

    /* Favorite */
    html += '<button data-friends-favorite="' + escapeHtml(friend.id) + '" class="stepper-google-cta" style="width:100%;padding:10px;border-radius:12px;font-weight:800;font-size:13px;' + (fav ? 'background:#eab308;color:#fff;' : (theme.dark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#374151;')) + '">';
    html += (fav ? '&#9733; Unfavorite' : '&#9734; Favorite') + '</button>';

    /* Block */
    html += '<button data-friends-block="' + escapeHtml(friend.id) + '" class="stepper-google-cta" style="width:100%;padding:10px;border-radius:12px;font-weight:800;font-size:13px;' + (blocked ? 'background:#ef4444;color:#fff;' : (theme.dark ? 'background:#374151;color:#d1d5db;' : 'background:#f3f4f6;color:#374151;')) + '">';
    html += (blocked ? '&#x1F6AB; Unblock' : '&#x1F6AB; Block') + '</button>';

    /* Invite to Dance */
    html += '<button data-friends-invite-dance="' + escapeHtml(friend.id || '') + '" class="stepper-google-cta" style="width:100%;padding:10px;border-radius:12px;font-weight:800;font-size:13px;background:#7c3aed;color:#fff;">';
    html += '&#x1F57A; Invite to Dance</button>';

    /* Chat */
    html += '<button data-friends-profile-chat="' + escapeHtml(friend.id || '') + '" class="stepper-google-cta" style="width:100%;padding:10px;border-radius:12px;font-weight:800;font-size:13px;background:#4f46e5;color:#fff;">';
    html += '&#x1F4AC; Chat</button>';

    html += '</div>';
    html += '</div></div>';
    return html;
  }

  /* ── Dance invite overlay ── */
  function renderDanceInviteOverlay(theme) {
    var friend = friendsState.invitingToDance;
    if (!friend) return '';

    /* Build a dance entry from the currently-loaded dance in localStorage */
    var dances = [];
    try {
      var data = JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || 'null');
      if (data && data.meta) {
        var meta = data.meta;
        var title = String(meta.title || '').trim() || 'Untitled Dance';
        var choreographer = String(meta.choreographer || '').trim() || 'Uncredited';
        dances.push({
          id: title.toLowerCase() + '|' + choreographer.toLowerCase(),
          title: title,
          choreographer: choreographer
        });
      }
    } catch (e) { /* ignore */ }

    var html = '';
    html += '<div data-friends-invite-close style="position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:100;display:flex;align-items:center;justify-content:center;border-radius:24px;">';
    html += '<div style="width:360px;max-width:90%;border-radius:20px;padding:28px;position:relative;' + (theme.dark ? 'background:#1e1e2e;color:#e5e7eb;' : 'background:#fff;color:#1f2937;') + 'box-shadow:0 20px 60px rgba(0,0,0,.25);" onclick="event.stopPropagation();">';

    /* Close */
    html += '<button data-friends-invite-close style="position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;font-size:18px;opacity:.5;">' + _ic.close + '</button>';

    html += '<h3 style="font-size:16px;font-weight:900;margin:0 0 4px;">Invite ' + escapeHtml(friend.name || friend.email || 'Friend') + '</h3>';
    html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0 0 16px;">Send them a collaboration invite for your current dance.</p>';

    if (!dances.length) {
      html += '<div style="text-align:center;padding:20px;">';
      html += '<p class="' + theme.subtle + '" style="font-size:13px;margin:0;">No dance loaded. Create or load a dance first!</p>';
      html += '</div>';
    } else {
      html += '<div style="max-height:240px;overflow-y:auto;display:grid;gap:8px;">';
      for (var i = 0; i < dances.length; i++) {
        var d = dances[i];
        var danceName = d.title || ('Dance #' + (i + 1));
        var subtitle = d.choreographer && d.choreographer !== 'Uncredited' ? ' by ' + d.choreographer : '';
        html += '<button data-friends-send-dance-invite="' + escapeHtml(String(d.id)) + '" style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:14px;border:1px solid;cursor:pointer;text-align:left;font-size:13px;font-weight:700;transition:all .2s ease;' + theme.cardBg + '">';
        html += '<span>&#x1F57A;</span><span style="flex:1;">' + escapeHtml(danceName) + escapeHtml(subtitle) + '</span>';
        html += '<span style="font-size:11px;opacity:.6;">Send</span>';
        html += '</button>';
      }
      html += '</div>';
    }

    html += '</div></div>';
    return html;
  }

  function formatTime(isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      var now = new Date();
      var sameDay = d.toDateString() === now.toDateString();
      if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  /* ════════════════════════════════════════════════════════════
     EVENT WIRING
     ════════════════════════════════════════════════════════════ */
  function wireEvents(page) {
    if (!page) return;

    /* View switching */
    page.querySelectorAll('[data-friends-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var newView = btn.getAttribute('data-friends-view') || 'list';
        friendsState.activeView = newView;
        friendsState.error = null;
        friendsState.success = null;
        if (newView === 'staffchat') loadStaffChat();
        renderFriendsPage();
      });
    });

    /* Refresh */
    var refreshBtn = page.querySelector('[data-friends-refresh]');
    if (refreshBtn) refreshBtn.addEventListener('click', function () { refreshFriends(); });

    /* Dismiss alerts */
    var dismissErr = page.querySelector('[data-friends-dismiss-error]');
    if (dismissErr) dismissErr.addEventListener('click', function () { friendsState.error = null; renderFriendsPage(); });
    var dismissSuc = page.querySelector('[data-friends-dismiss-success]');
    if (dismissSuc) dismissSuc.addEventListener('click', function () { friendsState.success = null; renderFriendsPage(); });

    /* Send invite */
    var sendBtn = page.querySelector('[data-friends-send-invite]');
    var emailInput = page.querySelector('[data-friends-email]');
    if (sendBtn && emailInput) {
      sendBtn.addEventListener('click', function () { sendInvite(emailInput.value); });
      emailInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendInvite(emailInput.value); });
      emailInput.addEventListener('input', function () { friendsState.inviteEmail = emailInput.value; });
      /* Focus the input */
      setTimeout(function () { emailInput.focus(); }, 100);
    }

    /* Search */
    var searchInput = page.querySelector('[data-friends-search]');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        friendsState.searchQuery = searchInput.value;
        renderFriendsPage();
      });
    }

    /* Accept / Decline */
    page.querySelectorAll('[data-friends-accept]').forEach(function (btn) {
      btn.addEventListener('click', function () { respondToInvite(btn.getAttribute('data-friends-accept'), true); });
    });
    page.querySelectorAll('[data-friends-decline]').forEach(function (btn) {
      btn.addEventListener('click', function () { respondToInvite(btn.getAttribute('data-friends-decline'), false); });
    });

    /* Remove */
    page.querySelectorAll('[data-friends-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (confirm('Remove this friend?')) removeFriend(btn.getAttribute('data-friends-remove'));
      });
    });

    /* Go to sign-in */
    var signinBtn = page.querySelector('[data-friends-goto-signin]');
    if (signinBtn) {
      signinBtn.addEventListener('click', function () {
        var tab = document.getElementById('stepper-google-signin-tab');
        if (tab) tab.click();
      });
    }

    /* Chat - open from friend card */
    page.querySelectorAll('[data-friends-chat-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fId = btn.getAttribute('data-friends-chat-open');
        var friend = friendsState.friends.find(function (f) { return f.id === fId; });
        if (friend) openChat(friend);
      });
    });

    /* Chat - pick from list */
    page.querySelectorAll('[data-friends-chat-start]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fId = btn.getAttribute('data-friends-chat-start');
        var friend = friendsState.friends.find(function (f) { return f.id === fId; });
        if (friend) openChat(friend);
      });
    });

    /* Chat - back button */
    var chatBack = page.querySelector('[data-friends-chat-back]');
    if (chatBack) chatBack.addEventListener('click', function () {
      friendsState.chatFriend = null;
      friendsState.chatMessages = [];
      renderFriendsPage();
    });

    /* Chat - send message */
    var chatSend = page.querySelector('[data-friends-chat-send]');
    var chatInput = page.querySelector('[data-friends-chat-input]');
    if (chatSend && chatInput) {
      chatSend.addEventListener('click', function () { sendChatMessage(chatInput.value); });
      chatInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendChatMessage(chatInput.value); });
      chatInput.addEventListener('input', function () { friendsState.chatText = chatInput.value; });
      if (friendsState.chatFriend) setTimeout(function () { chatInput.focus(); }, 100);
    }

    page.querySelectorAll('[data-friends-react]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        addReaction(btn.getAttribute('data-friends-react'), btn.getAttribute('data-friends-emoji'));
      });
    });

    /* Profile overlay close */
    page.querySelectorAll('[data-friends-profile-close]').forEach(function (el) {
      el.addEventListener('click', function () { hideProfile(); });
    });

    /* Toggle favorite */
    page.querySelectorAll('[data-friends-favorite]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleFavorite(btn.getAttribute('data-friends-favorite'));
      });
    });

    /* Toggle block */
    page.querySelectorAll('[data-friends-block]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleBlock(btn.getAttribute('data-friends-block'));
      });
    });

    /* Show profile */
    page.querySelectorAll('[data-friends-profile-open]').forEach(function (el) {
      el.addEventListener('click', function () {
        var fId = el.getAttribute('data-friends-profile-open');
        var friend = friendsState.friends.find(function (f) { return f.id === fId; });
        if (friend) showProfile(friend);
      });
    });

    /* Dance invite - open overlay */
    page.querySelectorAll('[data-friends-invite-dance]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var fId = btn.getAttribute('data-friends-invite-dance');
        var friend = friendsState.friends.find(function (f) { return f.id === fId; });
        if (friend) showInviteToDance(friend);
      });
    });

    /* Dance invite - close overlay */
    page.querySelectorAll('[data-friends-invite-close]').forEach(function (el) {
      el.addEventListener('click', function () { hideInviteToDance(); });
    });

    /* Send dance invite */
    page.querySelectorAll('[data-friends-send-dance-invite]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var danceId = btn.getAttribute('data-friends-send-dance-invite');
        if (friendsState.invitingToDance) sendDanceInvite(friendsState.invitingToDance, danceId);
      });
    });

    /* Chat from profile */
    page.querySelectorAll('[data-friends-profile-chat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var fId = btn.getAttribute('data-friends-profile-chat');
        var friend = friendsState.friends.find(function (f) { return f.id === fId; });
        if (friend) {
          friendsState.showingProfile = null;
          openChat(friend);
        }
      });
    });

    /* Group chat - create */
    var createGroupBtn = page.querySelector('[data-friends-create-group]');
    if (createGroupBtn) {
      createGroupBtn.addEventListener('click', function () {
        createGroupChat(friendsState.createGroupName, friendsState.createGroupMembers);
      });
    }

    /* Group chat - open */
    page.querySelectorAll('[data-friends-group-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openGroupChat(btn.getAttribute('data-friends-group-open'));
      });
    });

    /* Group chat - delete */
    page.querySelectorAll('[data-friends-group-delete]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (confirm('Delete this group?')) deleteGroupChat(btn.getAttribute('data-friends-group-delete'));
      });
    });

    /* Group chat - send message */
    var groupSend = page.querySelector('[data-friends-group-send]');
    var groupInput = page.querySelector('[data-friends-group-input]');
    if (groupSend && groupInput) {
      groupSend.addEventListener('click', function () { sendGroupMessage(groupInput.value); });
      groupInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendGroupMessage(groupInput.value); });
      groupInput.addEventListener('input', function () { friendsState.groupChatText = groupInput.value; });
      if (friendsState.activeGroupChat) setTimeout(function () { groupInput.focus(); }, 100);
    }

    /* Group chat - back */
    var groupBack = page.querySelector('[data-friends-group-back]');
    if (groupBack) groupBack.addEventListener('click', function () {
      friendsState.activeGroupChat = null;
      friendsState.groupChatMessages = [];
      friendsState.activeView = 'groups';
      renderFriendsPage();
    });

    /* Group name input */
    var groupNameInput = page.querySelector('[data-friends-group-name]');
    if (groupNameInput) {
      groupNameInput.addEventListener('input', function () {
        friendsState.createGroupName = groupNameInput.value;
      });
    }

    /* Group member toggle */
    page.querySelectorAll('[data-friends-group-member]').forEach(function (el) {
      el.addEventListener('click', function () {
        var mId = el.getAttribute('data-friends-group-member');
        var idx = friendsState.createGroupMembers.indexOf(mId);
        if (idx !== -1) { friendsState.createGroupMembers.splice(idx, 1); }
        else { friendsState.createGroupMembers.push(mId); }
        renderFriendsPage();
      });
    });

    /* Staff chat - send message */
    var staffSend = page.querySelector('[data-friends-staff-send]');
    var staffInput = page.querySelector('[data-friends-staff-input]');
    if (staffSend && staffInput) {
      staffSend.addEventListener('click', function () { sendStaffMessage(staffInput.value); });
      staffInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') sendStaffMessage(staffInput.value); });
      staffInput.addEventListener('input', function () { friendsState.staffChatText = staffInput.value; });
      setTimeout(function () { staffInput.focus(); }, 100);
    }

    /* Staff chat - back */
    var staffBack = page.querySelector('[data-friends-staffchat-back]');
    if (staffBack) staffBack.addEventListener('click', function () {
      friendsState.activeView = 'list';
      renderFriendsPage();
    });
  }

  /* ════════════════════════════════════════════════════════════
     STYLE INJECTION
     ════════════════════════════════════════════════════════════ */
  function ensureFriendsStyles() {
    if (document.getElementById('stepper-friends-tab-style')) return;
    var style = document.createElement('style');
    style.id = 'stepper-friends-tab-style';
    style.textContent = [
      '@keyframes stepper-friends-spin { to { transform: rotate(360deg); } }',
      '.stepper-friends-spinner { width:28px;height:28px;border:3px solid rgba(99,102,241,.15);border-top-color:#4f46e5;border-radius:50%;animation:stepper-friends-spin .7s linear infinite;margin:0 auto; }',
      '#' + PAGE_ID + ' input:focus { border-color:rgba(99,102,241,.5)!important;box-shadow:0 0 0 3px rgba(99,102,241,.12)!important; }',
      '#' + PAGE_ID + ' [data-friends-view]:hover { transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08); }',
      '#' + PAGE_ID + ' [data-friends-remove]:hover { opacity:1!important; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ════════════════════════════════════════════════════════════
     PUBLIC API — called by stepper-google-admin.ai-hardstop.js
     ════════════════════════════════════════════════════════════ */
  window.__stepperFriendsTab = {
    PAGE_ID: PAGE_ID,
    TAB_ID: TAB_ID,
    render: function () {
      ensureFriendsStyles();
      renderFriendsPage();
      /* Auto-refresh from backend when data is stale (>30 s) */
      if (isSignedIn() && Date.now() - friendsState.lastRefresh > 30000) {
        refreshFriends();
      }
      /* Fetch role once (not on every refresh cycle) */
      if (isSignedIn() && friendsState.myRole === 'member' && !friendsState._roleFetched) {
        friendsState._roleFetched = true;
        fetchMyRole();
      }
    },
    refresh: refreshFriends,
    getState: function () { return friendsState; },
    /** Send a dance-collaboration invite to a friend (by email) for the current project. */
    sendCurrentDanceInvite: function (email) {
      if (!isSignedIn()) return;
      var base = getApiBase().replace(/\/+$/, '');
      var currentDanceJson = null;
      var danceId = '';
      try {
        var data = JSON.parse(localStorage.getItem(BUILDER_DATA_KEY) || 'null');
        if (data && data.meta) {
          currentDanceJson = data;
          var title = String(data.meta.title || '').trim() || 'Untitled Dance';
          var choreographer = String(data.meta.choreographer || '').trim() || 'Uncredited';
          danceId = title.toLowerCase() + '|' + choreographer.toLowerCase();
        }
      } catch (e) { /* ignore */ }
      if (!danceId) return;
      fetch(base + '/api/collaborators/invite', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: authHeaders(),
        body: JSON.stringify({ danceId: danceId, email: email, danceData: currentDanceJson })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.ok) {
            friendsState.success = 'Dance invite sent to ' + escapeHtml(email) + '!';
          } else {
            friendsState.error = (data && data.error) || 'Could not send dance invite.';
          }
          renderFriendsPage();
        })
        .catch(function () {
          friendsState.error = 'Could not send the dance invite. Server might be down.';
          renderFriendsPage();
        });
    },
    getFriends: function () { return friendsState.friends || []; },
    icon: function () {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
    }
  };

})();
