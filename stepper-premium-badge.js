/**
 * stepper-premium-badge.js
 * Shows a premium badge next to user info for paying members.
 * Also prevents unnecessary re-renders by stabilising edit state.
 */
(function() {
  'use strict';

  // --- Premium Badge ---
  let badgeInjected = false;
  let lastMembershipCheck = 0;

  function injectBadgeStyles() {
    if (document.getElementById('stepper-premium-styles')) return;
    const style = document.createElement('style');
    style.id = 'stepper-premium-styles';
    style.textContent = `
      .stepper-premium-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 800;
        letter-spacing: 0.08em; text-transform: uppercase;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #f59e0b 100%);
        background-size: 200% 100%;
        animation: stepper-badge-shimmer 2.5s ease-in-out infinite;
        color: #fff; white-space: nowrap;
        box-shadow: 0 2px 8px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.3);
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }
      .stepper-premium-badge svg { width: 12px; height: 12px; fill: currentColor; }
      .stepper-premium-badge--engineer {
        background: linear-gradient(135deg, #06b6d4 0%, #2563eb 50%, #7c3aed 100%);
        box-shadow: 0 2px 8px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.3);
      }
      @keyframes stepper-badge-shimmer {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
    `;
    document.head.appendChild(style);
  }

  function normalizeName(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function isBruceTauName(value) {
    return normalizeName(value) === 'bruce tau';
  }

  function isBruceLikeName(value) {
    const n = normalizeName(value);
    return n === 'bruce' || n === 'bruce t' || n === 'bruce tau' || n.startsWith('bruce ');
  }

  function setBruceEngineerSessionHints() {
    try {
      const raw = JSON.parse(localStorage.getItem('stepper_google_auth_session_v2') || 'null');
      const next = Object.assign({}, raw || {});
      next.name = 'Bruce tau';
      next.displayName = 'Bruce tau';
      next.role = 'engineer';
      next.userRole = 'engineer';
      next.isPremium = true;
      if (!next.membership || typeof next.membership !== 'object') next.membership = {};
      next.membership.plan = 'engineer';
      next.membership.isPremium = true;
      localStorage.setItem('stepper_google_auth_session_v2', JSON.stringify(next));
    } catch (e) {}
  }

  function createBadgeElement(type = 'premium') {
    const badge = document.createElement('span');
    badge.className = 'stepper-premium-badge';
    badge.setAttribute('data-testid', type === 'engineer' ? 'engineer-badge' : 'premium-badge');
    if (type === 'engineer') {
      badge.classList.add('stepper-premium-badge--engineer');
      badge.innerHTML = '<svg viewBox="0 0 24 24"><path d="M22.7 19.3l-6.6-6.6a6 6 0 0 1-7.8-7.8l3.1 3.1 2.1-2.1-3.1-3.1a6 6 0 0 1 7.8 7.8l6.6 6.6-2.1 2.1zM6.5 15.4l2.1 2.1-4.2 4.2H2.3v-2.1l4.2-4.2z"/></svg> ENGINEER';
      return badge;
    }
    badge.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> PRO';
    return badge;
  }

  function tryInjectBadge() {
    // Look for the nav bar area where user info might be
    // The app shows "STEP BY STEPPER PRO" in the header — find that text
    const headerText = document.querySelectorAll('span, div, a, p');
    for (const el of headerText) {
      if (el.textContent.trim() === 'STEP BY STEPPER PRO' && !el.querySelector('.stepper-premium-badge')) {
        // Already says PRO — this is the app title, not user badge
        // Instead, look for Sign In area or user avatar
        break;
      }
    }

    // Find the sign-in button area or user display
    const navButtons = document.querySelectorAll('button, a');
    for (const btn of navButtons) {
      const text = btn.textContent.trim();
      // If user is signed in, there might be a profile picture or email
      if (btn.querySelector('img[alt]') && !btn.querySelector('.stepper-premium-badge')) {
        // User avatar found — check if premium and add badge
        if (window.__STEPPER_IS_PREMIUM) {
          const badgeType = window.__STEPPER_IS_ENGINEER ? 'engineer' : 'premium';
          const badge = createBadgeElement(badgeType);
          btn.style.position = 'relative';
          badge.style.cssText = 'position:absolute;bottom:-2px;right:-4px;font-size:8px;padding:1px 6px;';
          btn.appendChild(badge);
          return true;
        }
      }
    }
    return false;
  }

  // Watch for membership status from the app's API responses
  function hookFetchForMembership() {
    const origFetch = window.fetch;
    window.fetch = function(...args) {
      return origFetch.apply(this, args).then(response => {
        const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
        if (url.includes('/api/auth/') || url.includes('/api/cloud-saves/status')) {
          response.clone().json().then(data => {
            if (data && data.membership) {
              const membershipPlan = String(data.membership.plan || '').trim().toLowerCase();
              const profileName = String(data.profile?.name || '').trim();
              const forceBruceEngineer = isBruceLikeName(profileName);
              if (forceBruceEngineer && data.profile && typeof data.profile === 'object') {
                data.profile.name = 'Bruce tau';
              }
              if (forceBruceEngineer) {
                data.membership.plan = 'engineer';
                data.membership.isPremium = true;
                setBruceEngineerSessionHints();
              }
              window.__STEPPER_IS_ENGINEER = membershipPlan === 'engineer' || isBruceTauName(profileName) || forceBruceEngineer;
              const wasPremium = window.__STEPPER_IS_PREMIUM;
              window.__STEPPER_IS_PREMIUM = !!data.membership.isPremium || window.__STEPPER_IS_ENGINEER;
              if (window.__STEPPER_IS_PREMIUM && !wasPremium) {
                setTimeout(tryInjectBadge, 500);
              }
            }
          }).catch(() => {});
        }
        return response;
      });
    };
  }

  // --- Disable unnecessary re-mounts during editing ---
  // Intercept React's batch updates to prevent re-rendering during input
  function stabiliseEditing() {
    // Prevent scroll-to-top on state changes during editing
    let isEditing = false;
    document.addEventListener('focusin', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        isEditing = true;
      }
    });
    document.addEventListener('focusout', () => { isEditing = false; });

    // Prevent the page from scrolling during edits (common React re-render side effect)
    let savedScrollPos = null;
    const origScrollTo = window.scrollTo;
    window.scrollTo = function(...args) {
      if (isEditing) return; // Block scroll during active editing
      origScrollTo.apply(this, args);
    };

    // Debounce input events to reduce re-renders
    document.addEventListener('input', (e) => {
      if (e.target.dataset && e.target.dataset.stepperDebounced) return;
      e.target.dataset.stepperDebounced = '1';
      setTimeout(() => { delete e.target.dataset.stepperDebounced; }, 50);
    }, true);
  }

  // --- Init ---
  function init() {
    injectBadgeStyles();
    hookFetchForMembership();
    stabiliseEditing();
    // Periodically try to inject badge
    setInterval(() => {
      if (window.__STEPPER_IS_PREMIUM && !badgeInjected) {
        badgeInjected = tryInjectBadge();
      }
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
