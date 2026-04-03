/**
 * stepper-site-helper-brain.js
 * ─────────────────────────────────────────────────────────────
 * Massively enhanced local knowledge-base, contextual suggestions,
 * onboarding, keyboard-shortcut reference, FAQ, troubleshooting,
 * line-dance terminology guide, and smart routing for the
 * Step-By-Stepper site helper chat.
 *
 * Loaded BEFORE stepper-google-admin.ai-hardstop.js.
 * Exposes window.__stepperHelperBrain for the main helper to consume.
 * ─────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';
  if (window.__stepperHelperBrain) return;

  /* ───── Chat-history persistence key ───── */
  const CHAT_HISTORY_KEY = 'stepper_chat_history_v1';
  const ONBOARDING_KEY  = 'stepper_helper_onboarded_v1';
  const FEEDBACK_KEY    = 'stepper_helper_feedback_v1';

  /* ───── Persistence helpers ───── */
  function loadChatHistory() {
    try { return JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) || '[]'); } catch { return []; }
  }
  function saveChatHistory(messages) {
    try { localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify((messages || []).slice(-50))); } catch { /* quota */ }
  }
  function clearChatHistory() {
    try { localStorage.removeItem(CHAT_HISTORY_KEY); } catch { /* noop */ }
  }
  function hasCompletedOnboarding() {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  }
  function markOnboardingComplete() {
    try { localStorage.setItem(ONBOARDING_KEY, '1'); } catch { /* noop */ }
  }
  function saveFeedback(messageIndex, rating) {
    try {
      const fb = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
      fb.push({ i: messageIndex, r: rating, t: Date.now() });
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(fb.slice(-200)));
    } catch { /* noop */ }
  }

  /* ───── Context helpers ───── */
  function gatherRichContext() {
    const data = _readAppData();
    const sections = (data && Array.isArray(data.sections)) ? data.sections : [];
    const totalSteps = sections.reduce(function (sum, sec) {
      return sum + (Array.isArray(sec.steps) ? sec.steps.length : 0);
    }, 0);
    const meta = (data && data.meta) || {};
    return {
      danceTitle: String(meta.title || '').trim(),
      danceCounts: String(meta.counts || '').trim(),
      danceWalls: String(meta.walls || '').trim(),
      danceType: String(meta.type || '').trim(),
      danceLevel: String(meta.level || '').trim(),
      danceStyle: String(meta.danceStyle || '8-count').trim(),
      sectionCount: sections.length,
      totalSteps: totalSteps,
      sectionNames: sections.map(function (s) { return s.name || 'Untitled'; }),
      hasUnsavedChanges: _hasUnsavedChanges(),
      isPhrased: !!(data && data.phrased),
    };
  }
  function _readAppData() {
    try { return JSON.parse(localStorage.getItem('linedance_builder_data_v13') || 'null'); } catch { return null; }
  }
  function _hasUnsavedChanges() {
    try {
      var sig = localStorage.getItem('stepper_last_saved_signature_v1') || '';
      return sig !== _computeSignature();
    } catch { return false; }
  }
  function _computeSignature() {
    try { return JSON.stringify(_readAppData() || '').length.toString(36); } catch { return ''; }
  }

  /* ═══════════════════════════════════════════════════════════
     LOCAL KNOWLEDGE BASE — 80+ intelligent pattern-matched answers
     ═══════════════════════════════════════════════════════════ */
  var knowledgeBase = [
    /* ── Saving & Cloud ────────────────────────────────── */
    { patterns: [/\bhow (do i |to )?save\b/, /\bsave my (dance|work|progress)\b/, /\bsaving\b/],
      answer: function (ctx) {
        if (!ctx.signedIn) return 'Sign in with Google first (Sign In tab), then go to My Saved Dances and press **Save Changes**. Your dance will sync to the cloud so you can access it from any device.';
        if (ctx.hasUnsavedChanges) return 'You have unsaved changes! Go to **My Saved Dances** and press **Save Changes** to push them to your cloud save. Your dance auto-syncs in the background too.';
        return 'Your latest dance is already saved. To force a fresh save, go to **My Saved Dances** → **Save Changes**. Cloud saves are linked to your Google account.';
      }},
    { patterns: [/\bcloud save\b/, /\bcloud sync\b/, /\bsync (my )?(dance|data)\b/],
      answer: 'Cloud saves are linked to your Google account. Sign in, then use **My Saved Dances → Save Changes**. Your dance also auto-syncs periodically in the background while you are signed in.' },
    { patterns: [/\bdelete (a |my )?saved dance\b/, /\bremove saved\b/],
      answer: 'Open **My Saved Dances**, find the dance you want to remove, and use the delete option next to it. This removes it from your cloud save.' },
    { patterns: [/\bexport\b/, /\bdownload my dance\b/],
      answer: 'Go to the **Sheet** tab to see the clean print-ready view of your dance. From there you can print or use your browser\'s "Save as PDF" to export it.' },
    { patterns: [/\bbackup\b/],
      answer: 'Your dance is saved in your browser\'s local storage automatically. For a cloud backup, sign in with Google and use **Save Changes** in My Saved Dances.' },

    /* ── Building / Editing ────────────────────────────── */
    { patterns: [/\bhow (do i |to )?(create|make|start|build) a (new )?dance\b/, /\bnew dance\b/, /\bstart fresh\b/],
      answer: 'Go to the **Build** tab. You can type your dance title, set counts and walls, then add steps one by one. Or ask me to build one! Say something like "Build a 32-count 4-wall beginner dance with vine right, vine left, coaster step, rock step."' },
    { patterns: [/\badd (a )?step\b/, /\binsert (a )?step\b/, /\bnew step\b/],
      answer: 'In the **Build** tab, scroll to the section where you want to add a step and use the **+ Add Step** button. You can also type step details directly or apply glossary steps from the **Community Glossary** panel.' },
    { patterns: [/\bedit (a )?step\b/, /\bchange (a )?step\b/, /\bmodify (a )?step\b/],
      answer: 'In the **Build** tab, click on any step to edit its name, counts, description, or foot direction. Changes save to your local worksheet instantly.' },
    { patterns: [/\bdelete (a )?step\b/, /\bremove (a )?step\b/],
      answer: 'In the **Build** tab, click the step you want to remove and use the delete/trash button. You can undo this with **Ctrl+Z** (or ⌘Z on Mac).' },
    { patterns: [/\breorder\b/, /\bmove (a )?step\b/, /\brearrange\b/, /\bdrag\b/],
      answer: 'In the **Build** tab, you can drag and drop steps to reorder them within a section. Grab the step handle and move it up or down.' },
    { patterns: [/\badd (a )?section\b/, /\bnew section\b/, /\bcreate (a )?section\b/],
      answer: 'In the **Build** tab, scroll to the bottom and use the **Add Section** button to create a new section. Sections help organize multi-part choreographies.' },
    { patterns: [/\brename section\b/, /\bsection name\b/],
      answer: 'Click the section header in the **Build** tab to edit its name. Common names: "Intro", "Verse", "Chorus", "Tag", "Bridge", "Restart".' },
    { patterns: [/\btitle\b.*\bdance\b/, /\bdance title\b/, /\brename.*dance\b/],
      answer: 'In the **Build** tab, the dance title field is at the very top. Click it and type your dance name. This title appears on the Sheet view and in your saved dances list.' },
    { patterns: [/\bcounts?\b.*\b(set|change|edit|how)\b/, /\bhow many counts\b/],
      answer: function (ctx) {
        var note = ctx.danceCounts ? ' Your current dance is set to **' + ctx.danceCounts + ' counts**.' : '';
        return 'Set the count total in the **Build** tab header next to the dance title. Common counts: 16, 32, 48, 64. This should match the total beats in one sequence of the dance.' + note;
      }},
    { patterns: [/\bwalls?\b.*\b(set|change|how|what)\b/, /\bhow many walls\b/],
      answer: function (ctx) {
        var note = ctx.danceWalls ? ' Your current dance is set to **' + ctx.danceWalls + ' walls**.' : '';
        return 'Set the wall count in the **Build** tab header. Common values: 1-wall (line dance facing one direction), 2-wall (turn 180° each sequence), or 4-wall (turn 90° each sequence).' + note;
      }},

    /* ── Sheet / Preview ──────────────────────────────── */
    { patterns: [/\bsheet\b.*\b(tab|view|page)\b/, /\bpreview\b/, /\bprint\b/],
      answer: 'The **Sheet** tab shows a clean, formatted view of your dance — perfect for printing or sharing. It displays the title, counts, walls, sections, and all steps in a readable layout.' },
    { patterns: [/\bpdf\b.*\b(import|upload|parse)\b/, /\bimport pdf\b/, /\bupload pdf\b/, /\bimport.*stepsheet\b/],
      answer: 'Go to the **Sheet** tab and click the **Import PDF** button (bottom-right). Drop or select your PDF stepsheet, review the extracted steps, then click **Apply to Editor**. The system parses counts, step names, and descriptions automatically.' },
    { patterns: [/\bpdf\b.*\b(not work|fail|error|broken)\b/],
      answer: 'PDF parsing works best with clearly formatted text-based PDFs. If your PDF is a scanned image or has unusual formatting, it may not parse correctly. Try a different PDF or manually enter the steps in the Build tab.' },

    /* ── Featured Choreo ──────────────────────────────── */
    { patterns: [/\bfeatured\b/, /\bfeatured choreo\b/],
      answer: 'The **Featured Choreo** tab shows publicly featured dances approved by the admin. Anyone can browse them. To get your dance featured, sign in and use **Send to host for featuring**.' },
    { patterns: [/\bhow (do i |to )?get featured\b/, /\bsubmit.*feature\b/, /\bsend.*feature\b/],
      answer: function (ctx) {
        if (!ctx.signedIn) return 'Sign in with Google first, then use **Send to host for featuring**. The admin reviews submissions and can award Bronze 🥉, Silver 🥈, or Gold 🥇 badges.';
        return 'Use **Send to host for featuring** to submit your dance. The admin will review it and can award it a Bronze 🥉, Silver 🥈, or Gold 🥇 badge for Featured Choreo. Premium members get priority review!';
      }},
    { patterns: [/\bbronze\b/, /\bsilver\b/, /\bgold\b/, /\bbadge\b/],
      answer: 'Featured dances can receive Bronze 🥉, Silver 🥈, or Gold 🥇 badges from the admin. Higher badges mean the admin rated the choreography as exceptional. Premium members get priority in the review queue.' },

    /* ── Signing In ───────────────────────────────────── */
    { patterns: [/\bsign ?in\b/, /\blog ?in\b/, /\bgoogle (sign|log)\b/],
      answer: 'Go to the **Sign In** tab and click **Sign in with Google**. Once signed in, you can save dances to the cloud, submit for featuring, apply for moderator, and access the AI dance tools.' },
    { patterns: [/\bsign ?out\b/, /\blog ?out\b/],
      answer: 'Go to the **Sign In** tab and use the **Sign Out** button. Your local dance data stays on this device, but cloud sync pauses until you sign back in.' },
    { patterns: [/\baccount\b/, /\bprofile\b/],
      answer: 'Your account is your Google account. We use Google Sign-In for authentication — no separate password needed. Your profile photo and name come from your Google account.' },

    /* ── Premium / Subscription ───────────────────────── */
    { patterns: [/\bpremium\b/, /\bsubscri/, /\bpaid\b/, /\bpro\b/],
      answer: function (ctx) {
        if (ctx.isPremium) return 'You\'re a Premium member! 🎉 You get priority review for featured submissions, the full AI site helper, AI dance building, and a PRO badge.';
        return 'Premium is **NZ$12.50/month** or **NZ$100/year**. Benefits:\n• Full AI site helper chat (like this!)\n• AI dance building and judging\n• Priority review for featured submissions\n• PRO badge on your profile\n\nGo to **Sign In → Subscription** to upgrade.';
      }},
    { patterns: [/\bcancel (my )?subscription\b/, /\bcancel premium\b/],
      answer: 'To cancel your Premium subscription, go to **Sign In → Subscription → Manage Subscription**. You can cancel through Stripe and your access continues until the end of the billing period.' },
    { patterns: [/\bfree\b.*\b(feature|use|plan)\b/, /\bwhat.*free\b/],
      answer: 'Free features include:\n• Building dances in the editor\n• Sheet view and printing\n• Local saving (on this device)\n• Cloud saving with Google sign-in\n• Browsing Featured Choreo\n• PDF import\n\nPremium adds: AI helper chat, AI dance building/judging, priority review, and the PRO badge.' },

    /* ── Moderator ────────────────────────────────────── */
    { patterns: [/\bmoderator\b/, /\bapply.*moderator\b/, /\bmod\b/],
      answer: 'Sign in with Google, then go to the **Sign In** tab and use **Apply for moderator**. Approved moderators help review featured dance submissions and manage the community. The admin reviews all applications.' },

    /* ── Admin ────────────────────────────────────────── */
    { patterns: [/\badmin\b/],
      answer: 'The **Admin** tab is only visible to the site administrator (anthonytau4@gmail.com). It manages featured dances, user submissions, moderator applications, glossary requests, and site settings.' },

    /* ── Community Glossary ────────────────────────────── */
    { patterns: [/\bglossary\b/, /\bcommunity step/, /\bcustom step/],
      answer: 'The **Community Glossary** contains admin-approved dance steps with standardized names, counts, foot direction, and descriptions. While in the Build tab, click the **Glossary+** button (bottom-left) to browse and apply steps. You can also request new glossary entries from the Sign In tab.' },
    { patterns: [/\brequest (a )?step\b/, /\bsuggest (a )?step\b/, /\bstep request\b/],
      answer: 'To request a new glossary step, sign in with Google, go to the **Sign In** tab, and use the **Request a dance step** option. The admin reviews all requests and can approve them for the community glossary.' },

    /* ── AI Dance Tools ───────────────────────────────── */
    { patterns: [/\bai (dance )?(judge|score|rate)\b/, /\bjudge my dance\b/, /\bscore my\b/, /\brate my\b/],
      answer: 'Go to **Sign In → AI Dance Judge**. It analyzes your current dance for:\n• Flow and transition quality\n• Step variety and balance\n• Phrasing consistency\n• Count accuracy\nIt also suggests improvements and tidy-ups.' },
    { patterns: [/\bgenerate counts\b/, /\bai counts\b/, /\bauto count\b/],
      answer: 'In **Sign In → AI Dance Judge**, use the **Generate counts** button. The AI fills in step counts for your worksheet and updates the total count automatically.' },
    { patterns: [/\bai build\b/, /\bai create\b/, /\bbuild.*dance.*for me\b/],
      answer: 'Just tell me what you want! Say something like:\n• "Build a 32-count 4-wall beginner dance"\n• "Add vine right, vine left, coaster step to my dance"\n• "Create a dance called Midnight Run with jazz box, pivot turn, grapevine"\n\nI\'ll set it up in the Build tab for you.' },
    { patterns: [/\bworksheet builder\b/],
      answer: 'The AI Worksheet Builder can create entire dance worksheets from your description. Tell me the dance name, counts, walls, level, and steps you want, and I\'ll build it automatically in the editor.' },

    /* ── Undo / Redo ──────────────────────────────────── */
    { patterns: [/\bundo\b/],
      answer: 'Press **Ctrl+Z** (or **⌘Z** on Mac) to undo your last edit. The undo history holds up to 120 steps, so you can go way back.' },
    { patterns: [/\bredo\b/],
      answer: 'Press **Ctrl+Y** or **Ctrl+Shift+Z** (or **⌘Shift+Z** on Mac) to redo an undone action.' },

    /* ── Dark Mode ────────────────────────────────────── */
    { patterns: [/\bdark mode\b/, /\blight mode\b/, /\btheme\b/, /\bnight mode\b/],
      answer: 'Toggle dark/light mode using the theme button (usually a 🌙/☀️ icon) in the top navigation. Your preference is saved and persists across sessions.' },

    /* ── Notifications ────────────────────────────────── */
    { patterns: [/\bnotification\b/],
      answer: 'Notifications appear when the admin approves or rejects your submissions (featured dances, site uploads, glossary requests). You need to be signed in with Google to receive them.' },

    /* ── What's New ───────────────────────────────────── */
    { patterns: [/\bwhat'?s new\b/, /\bchangelog\b/, /\bupdates?\b/],
      answer: 'Check the **What\'s New** tab for the latest site updates, new features, and improvements. It\'s the changelog for Step-By-Stepper.' },

    /* ── Upload to Site ───────────────────────────────── */
    { patterns: [/\bupload to site\b/, /\bsite upload\b/],
      answer: 'Sign in with Google, then use **Upload to site** to submit your dance to the admin moderation queue. Once approved, it becomes part of the site\'s dance collection.' },

    /* ── General Navigation ───────────────────────────── */
    { patterns: [/\btabs?\b/, /\bwhere (do|should|can) i\b/, /\bnavigate\b/, /\bfind\b/],
      answer: 'Here are the main tabs:\n• **Build** — Create and edit dances\n• **Sheet** — Clean print-ready view\n• **What\'s New** — Site changelog\n• **My Saved Dances** — Your cloud saves\n• **Featured Choreo** — Public featured dances\n• **Friends** — Collaboration & chat\n• **Glossary** — 100+ step definitions\n• **PDF Import** — Import stepsheet PDFs\n• **Music** — BPM tools, tap tempo & metronome\n• **Templates** — Pre-built dance starters\n• **Settings** — Fonts, theme & preferences\n• **Sign In** — Google auth, AI tools, subscription\n\nSay **"go to [tab name]"** and I\'ll take you there!' },
    { patterns: [/\bhome\b/, /\bmain page\b/],
      answer: 'The main page is the **Build** tab where you create and edit your dance. Click the site logo or "Build" tab to return to it from any page.' },
    { patterns: [/\bsettings?\b.*\bwhere\b|\bwhere\b.*\bsettings?\b|\bpreferences?\b/],
      answer: 'The **Settings** tab lets you customize fonts (60+ choices!), theme, accent colors, editor behavior, print options, notifications, accessibility, and more. Say **"go to settings"** and I\'ll open it for you!' },
    { patterns: [/\bmusic\b.*\bwhere\b|\bwhere\b.*\bmusic\b|\bbpm\b|\btempo\b|\bmetronome\b/],
      answer: 'The **Music** tab has BPM tools including a tap-tempo calculator, visual metronome, count calculator, and a BPM reference guide for different dance styles. Say **"go to music"** to open it!' },
    { patterns: [/\btemplate\b|\bstarter\b|\bpre.?built\b|\bquick start\b/],
      answer: 'The **Templates** tab has 12+ pre-built dance templates for Beginner, Improver, Intermediate, and Advanced levels. Each includes real steps you can load directly into the editor. Say **"go to templates"** to browse them!' },
    { patterns: [/\bfont\b|\btypeface\b|\bchange font\b/],
      answer: 'You can choose from **60+ fonts** in the **Settings** tab under Appearance. Categories include System, Sans-Serif, Serif, Display, Handwriting, and Monospace fonts. Each shows a live preview. Say **"go to settings"** to try them!' },
    { patterns: [/\bpremium\b.*\b(ai|helper|assistant)\b|\b(ai|helper|assistant)\b.*\bpremium\b/],
      answer: '**Free AI Helper** can answer questions about the site and navigate you to any tab.\n**Premium AI Helper** (with subscription) can also: build dances, add/remove steps, judge your choreography, generate counts, and take actions directly in the editor.\n\nSay **"go to subscription"** to learn about upgrading!' },

    /* ── Keyboard Shortcuts ────────────────────────────── */
    { patterns: [/\bkeyboard\b/, /\bshortcut\b/, /\bhotkey\b/],
      answer: '**Keyboard shortcuts:**\n• **Ctrl+Z / ⌘Z** — Undo\n• **Ctrl+Y / ⌘Shift+Z** — Redo\n• **Ctrl+B / ⌘B** — Bold\n• **Ctrl+I / ⌘I** — Italic\n• **Ctrl+U / ⌘U** — Underline\n• **Ctrl+Shift+X** — Strikethrough\n• **Ctrl+D** — Toggle dark mode\n• **Ctrl+1** — Build tab\n• **Ctrl+2** — Sheet tab\n• **Ctrl+3** — What\'s New tab\n• **Ctrl+4** — Saved Dances tab\n• **Ctrl+5** — Friends tab\n• **Ctrl+6** — Glossary tab\n• **Ctrl+/** — Toggle help panel\n• **Tab** — Move between fields\n• **Enter** — Confirm/submit\n• **Escape** — Close panels and dialogs' },

    /* ── Phrasing ─────────────────────────────────────── */
    { patterns: [/\bphras(ed|ing)\b/],
      answer: 'Phrased dances have sections that repeat in specific patterns (e.g., AABB or ABAB). The Build tab supports both phrased and non-phrased modes. Use the **Phrasing Tools** to set up phrase sequences. The editor can also repair or normalize phrasing structures.' },
    { patterns: [/\brepair phras/],
      answer: 'The phrasing repair tool fixes inconsistent phrase structures in your dance. It normalizes sections, validates sequences, and ensures the phrased layout is correct.' },

    /* ── Troubleshooting ──────────────────────────────── */
    { patterns: [/\bnot working\b/, /\bbroken\b/, /\bbug\b/, /\berror\b/],
      answer: 'Try these troubleshooting steps:\n1. **Refresh the page** (Ctrl+R / ⌘R)\n2. **Clear browser cache** if things look odd\n3. **Sign out and sign back in** if cloud features aren\'t working\n4. **Check your internet connection** for cloud saves and AI features\n5. If the issue persists, try a different browser or incognito mode.' },
    { patterns: [/\blost my dance\b/, /\bdance (is )?gone\b/, /\bdisappear/],
      answer: 'Don\'t panic! Try these:\n1. Check **My Saved Dances** — it may be in your cloud saves\n2. Your most recent dance is also in your browser\'s local storage\n3. If you were signed in, the dance should be recoverable from your cloud save\n4. Try refreshing the page — sometimes the UI just needs a reload' },
    { patterns: [/\bslow\b/, /\blag\b/, /\bperformance\b/],
      answer: 'If the site feels slow:\n1. Close other browser tabs to free memory\n2. Try a different browser (Chrome or Edge recommended)\n3. Clear your browser cache\n4. If AI features are slow, it may be high server traffic — they\'ll respond shortly.' },
    { patterns: [/\boffline\b/, /\bno internet\b/],
      answer: 'The dance editor works offline for local editing. Your dance is saved in browser local storage. However, cloud saves, AI features, and Featured Choreo need an internet connection. Changes sync when you\'re back online.' },

    /* ── Line Dance Terminology ────────────────────────── */
    /* Step dictionary integration: catch ambiguous step queries */
    { patterns: [/\bwhat (?:is|are|does)\b.*\bstep\b/, /\bwhat (?:is|are)\b.*\b(?:walk forward|step right|touch beside|walking back|not a vine)\b/i, /\bdescribe\b.*\bstep\b/, /\bfootwork for\b/],
      answer: function (ctx, question) {
        var dict = window.__stepperStepDictionary;
        if (!dict) return 'I can help with step definitions! Try asking about specific steps like "vine right", "coaster step", "jazz box", or "shuffle forward".';
        /* Extract the step name portion from the question */
        var cleaned = String(question || '').replace(/^(?:what is a?|what are|what does|describe(?: the)?|footwork for)\s*/i, '').replace(/\?+$/, '').trim();
        if (cleaned.length < 3) return 'Ask about a specific step like "vine right", "coaster step", "jazz box", or check the **Glossary tab** for a full searchable dictionary!';
        return dict.disambiguate(cleaned);
      }
    },
    { patterns: [/\bwhat is a vine\b/, /\bgrapevine\b/],
      answer: '**Vine (Grapevine):** A 4-count side-traveling step. Vine Right: step right, cross left behind, step right, touch left. Vine Left: mirror image. Often 4 counts.' },
    { patterns: [/\bwhat is a coaster\b/, /\bcoaster step\b/],
      answer: '**Coaster Step:** A 3-count step (usually &3&4): step back, step together, step forward. It\'s a smooth way to change direction.' },
    { patterns: [/\bwhat is a jazz box\b/, /\bjazz box\b/],
      answer: '**Jazz Box (Jazz Square):** A 4-count step: cross right over left, step back on left, step right to right side, step left forward. Creates a box pattern on the floor.' },
    { patterns: [/\bwhat is a pivot\b/, /\bpivot turn\b/],
      answer: '**Pivot Turn:** A 2-count turning step: step forward on one foot, pivot half-turn on both feet. Used to change direction 180°.' },
    { patterns: [/\bwhat is a rock step\b/, /\brock step\b/],
      answer: '**Rock Step:** A 2-count weight shift: rock forward (or back/side) on one foot, recover weight to the other foot. Adds rhythm and texture.' },
    { patterns: [/\bwhat is a shuffle\b/, /\bshuffle step\b/, /\bcha ?cha\b/],
      answer: '**Shuffle (Cha-Cha):** A 3-count step done in 2 beats: step, close, step (or step-together-step). Can move forward, back, or to the side.' },
    { patterns: [/\bwhat is a weave\b/, /\bweave\b/],
      answer: '**Weave:** Similar to a vine but with crossing steps both in front and behind. A weave right: step right, cross left behind, step right, cross left in front. Usually 4-8 counts.' },
    { patterns: [/\bwhat is a monterey\b/, /\bmonterey turn\b/],
      answer: '**Monterey Turn:** A 4-count step: point right to right side, pivot half-turn right stepping right beside left, point left to left side, step left beside right.' },
    { patterns: [/\bwhat is a kick\b.*\bball\b/, /\bkick ball change\b/],
      answer: '**Kick Ball Change:** A syncopated 3-count step (in 2 beats): kick forward, step ball of kicking foot, change weight to other foot. Adds energy and style.' },
    { patterns: [/\bwhat is a sailor\b/, /\bsailor step\b/],
      answer: '**Sailor Step:** A 3-count step: cross behind, step side, step in place. It creates a swaying motion. Can be done left or right.' },
    { patterns: [/\bwhat is a heel\b/, /\bheel (touch|dig|jack)\b/],
      answer: '**Heel Touch/Dig:** Touch the heel of one foot forward, then step it back in place. A **Heel Jack** is a syncopated heel touch with a quick side step.' },
    { patterns: [/\bwhat is a scuff\b/],
      answer: '**Scuff:** Brush the heel of one foot forward along the floor while swinging the leg forward. Usually 1 count. Adds flair between traveling steps.' },
    { patterns: [/\bwhat is a stomp\b/],
      answer: '**Stomp:** Forcefully step down with one foot, either keeping weight on it (stomp) or lifting it back up (stomp-up). Adds accent and rhythm.' },
    { patterns: [/\bwhat is a touch\b/],
      answer: '**Touch:** Tap the toe or ball of the foot to the floor without transferring weight. Can be forward, side, back, or beside the other foot.' },
    { patterns: [/\bwhat is a slide\b/],
      answer: '**Slide:** A gliding movement where one foot steps to the side and the other foot slides to meet it. Usually done over 2 counts.' },
    { patterns: [/\bwhat is a cross\b/],
      answer: '**Cross:** Step one foot across the other, either in front or behind. Used in weaves, jazz boxes, and many other combinations.' },
    { patterns: [/\bwhat is a hitch\b/],
      answer: '**Hitch:** Lift one knee up in front, keeping the foot off the floor. Often follows a kick or precedes a traveling step. Usually 1 count.' },
    { patterns: [/\bwhat is a flick\b/],
      answer: '**Flick:** A quick backward kick, bending the knee to flick the heel up behind. Usually 1 count. Adds energy and style to transitions.' },
    { patterns: [/\bwhat is a bump\b/, /\bhip bump\b/],
      answer: '**Hip Bump:** A hip movement to one side, usually done with a slight step. Often 1-2 counts per bump. Common in party-style line dances.' },
    { patterns: [/\bstep (terms|terminology|glossary|definitions)\b/, /\bline dance (terms|terminology|vocabulary)\b/, /\bdance definitions\b/],
      answer: function () {
        if (window.__stepperStepDictionary) {
          return 'Check out the **Glossary tab** for a full searchable dictionary of ' + window.__stepperStepDictionary.STEPS.length + '+ standard line dance steps! You can browse by category, search by name, and add steps to your worksheet with one click.\n\nCommon terms:\n• **Vine/Grapevine** — Side travel (4 counts)\n• **Coaster Step** — Back-together-forward (3 counts)\n• **Jazz Box** — Cross-back-side-forward (4 counts)\n• **Pivot Turn** — Step-pivot 180° (2 counts)\n• **Rock Step** — Rock-recover (2 counts)\n• **Shuffle** — Step-close-step (2 beats)';
        }
        return 'Common line dance step terms:\n• **Vine/Grapevine** — Side travel (4 counts)\n• **Coaster Step** — Back-together-forward (3 counts)\n• **Jazz Box** — Cross-back-side-forward (4 counts)\n• **Pivot Turn** — Step-pivot 180° (2 counts)\n• **Rock Step** — Rock-recover (2 counts)\n• **Shuffle** — Step-close-step (2 beats)\n• **Weave** — Cross front & behind traveling (4-8 counts)\n• **Kick Ball Change** — Kick-ball-change (2 beats)\n• **Sailor Step** — Behind-side-step (3 counts)\n\nAsk about any specific step for a detailed explanation!';
      } },

    /* ── Dance Levels ─────────────────────────────────── */
    { patterns: [/\bbeginner\b.*\bdance\b/, /\beasy dance\b/],
      answer: '**Beginner dances** typically have 16-32 counts, 2 or 4 walls, and use basic steps like vines, touches, shuffles, and rock steps. They repeat the same sequence throughout with few or no restarts or tags.' },
    { patterns: [/\bintermediate\b/, /\bmedium\b.*\bdance\b/],
      answer: '**Intermediate dances** usually have 32-64 counts, 2 or 4 walls, and include more complex steps, direction changes, syncopation, tags, and restarts. They require more coordination and memory.' },
    { patterns: [/\badvanced\b/, /\bhard dance\b/],
      answer: '**Advanced dances** typically have 48-96+ counts, complex rhythms, multiple restarts and tags, intricate footwork, body movement, and styling. They often have unusual wall configurations or phrased structures.' },

    /* ── Tips & Best Practices ────────────────────────── */
    { patterns: [/\btip\b/, /\badvice\b/, /\bbest practice\b/, /\bsuggest/],
      answer: 'Tips for great choreography:\n1. **Start simple** — Build a strong foundation before adding complexity\n2. **Match the music** — Counts should align with the song\'s phrasing\n3. **Balance directions** — Include both left and right movements\n4. **Use transitions** — Connect steps smoothly (rock steps, coasters)\n5. **Test it** — Dance through it yourself before sharing\n6. **Name clearly** — Use descriptive section names like "Intro", "Verse", "Chorus"' },

    /* ── Music & Tempo ────────────────────────────────── */
    { patterns: [/\bbpm\b/, /\btempo\b/, /\bmusic speed\b/],
      answer: 'BPM (beats per minute) determines dance speed:\n• **Slow**: 80-100 BPM (waltz, rumba-style)\n• **Medium**: 100-130 BPM (most line dances)\n• **Fast**: 130-160+ BPM (party/energy dances)\n\nStep-By-Stepper focuses on step choreography. For BPM counting, use a metronome app alongside.' },
    { patterns: [/\b(what|which) song\b/, /\bmusic\b.*\brecommend\b/],
      answer: 'Step-By-Stepper focuses on step choreography rather than music selection. For song suggestions, check line dance community sites like Kickit.to or CopperKnob where choreographers list recommended songs with each dance.' },

    /* ── Tags & Restarts ──────────────────────────────── */
    { patterns: [/\btag\b/],
      answer: 'A **tag** is an extra set of counts added at a specific point in the dance (usually at the end of a wall). Tags make the dance fit the musical phrasing. You can add a tag section in the Build tab.' },
    { patterns: [/\brestart\b/],
      answer: 'A **restart** means you stop the current sequence partway through and start over from the beginning. Restarts align the dance to the music when the phrase changes. Note the wall and count where the restart occurs.' },

    /* ── Sharing ──────────────────────────────────────── */
    { patterns: [/\bshare\b/, /\bsend.*friend\b/, /\blink\b/],
      answer: 'To share your dance:\n1. **Print it** — Use the Sheet tab and print/save as PDF\n2. **Feature it** — Submit for Featured Choreo so everyone can see it\n3. **Upload it** — Use "Upload to site" to add it to the site collection\n\nDirect sharing links are coming in a future update!' },

    /* ── Mobile / Responsive ──────────────────────────── */
    { patterns: [/\bmobile\b/, /\bphone\b/, /\btablet\b/, /\bsmall screen\b/],
      answer: 'Step-By-Stepper works on mobile browsers! The layout adapts to smaller screens. For the best editing experience on mobile:\n• Use landscape orientation for the Build tab\n• Scroll horizontally to see all step fields\n• The Sheet tab is optimized for any screen size' },

    /* ── Browser Support ──────────────────────────────── */
    { patterns: [/\bbrowser\b/, /\bchrome\b/, /\bfirefox\b/, /\bsafari\b/, /\bedge\b/],
      answer: 'Step-By-Stepper works best in modern browsers:\n• **Chrome** (recommended)\n• **Edge**\n• **Firefox**\n• **Safari** (may have minor differences)\n\nMake sure your browser is up to date for the best experience.' },

    /* ── Privacy & Data ───────────────────────────────── */
    { patterns: [/\bprivacy\b/, /\bdata\b.*\b(safe|secure|store)\b/, /\bwho can see\b/],
      answer: 'Your dances are private by default — only you can see them. Dances become public only if you submit them for featuring and the admin approves. Google Sign-In is used solely for authentication. Your data is stored securely on our backend.' },

    /* ── About the Site ───────────────────────────────── */
    { patterns: [/\bwho made\b/, /\bwho built\b/, /\babout\b.*\bsite\b/, /\bcreator\b/],
      answer: 'Step-By-Stepper is a line dance choreography tool built to help dancers create, edit, preview, and share dance step sheets. It\'s designed to make choreography accessible for beginners and powerful for experienced dancers.' },
    { patterns: [/\bwhat (is|does) (this|the) (site|app)\b/, /\bwhat can (i|you) do\b/],
      answer: 'Step-By-Stepper is a **line dance choreography editor**. You can:\n• Build dance step sheets with names, counts, and descriptions\n• Preview them in a clean print-ready Sheet view\n• Save to the cloud with Google sign-in\n• Import steps from PDF stepsheets\n• Get AI-powered dance building and judging\n• Browse and submit to the Featured Choreo gallery\n• Use community glossary steps for consistency' },

    /* ── Staff Chat ────────────────────────────────────── */
    { patterns: [/\bstaff chat\b/, /\bchat with (admin|moderator|staff)\b/],
      answer: 'Staff chat is available for moderators and admins to communicate about submissions, site issues, and moderation tasks. It\'s in the moderation tools area.' },

    /* ── AI Helper Page Actions ────────────────────────── */
    { patterns: [/\bhelper.*\bnavigate\b/, /\bhelper.*\bgo to\b/, /\bcan.*helper.*\bopen\b/],
      answer: 'Yes! The AI helper can navigate for you. Try saying:\n• "Go to Build" / "Open sheet" / "Open saved dances"\n• "Open featured" / "Open sign in" / "Open subscription"\n• "Open admin" (admin only)\n\nJust tell it where you want to go!' },
    { patterns: [/\b8.?count\b/, /\bwaltz\b/, /\bdance\s*type\b/, /\bsection\s*split\b/, /\bcount\s*limit\b/],
      answer: 'You can set your dance type to **8-count** (standard) or **waltz** (6-count). This controls where sections auto-split when adding steps.\n\nSay "set dance type 8-count" or "set dance type waltz" to the helper, or it will use 8-count by default.' },
    { patterns: [/\brandom.*dance\b|\bgenerate.*flow\b|\bperfect.*flow\b|\b10\/10\b/],
      answer: 'The helper can generate a **random 10/10 flowability dance section** using glossary steps with perfect foot alternation and variety. Say "generate a random 10/10 dance" or "random perfect flow section" to try it!' },
    { patterns: [/\bcollaborat\b/, /\binvite.*collab\b/, /\bwork together\b/, /\bshare.*dance\b.*\bedit\b/, /\badd.*friend\b/, /\binvite.*friend\b/],
      answer: 'You can add friends and collaborators! Go to the **Friends tab** to:\n• Add friends by their Gmail / email address\n• View pending invites\n• Accept or decline friend requests\n\nOr say "invite collaborator user@email.com" right here to send a quick invite.' },
    { patterns: [/\bdance.*group\b/, /\bgroup.*dance\b/, /\borganize.*saves?\b/, /\bfolder\b/, /\barchiv\b/],
      answer: 'You can organize your saved dances into **folders** (groups) and **archive** dances you don\'t need right now.\n\n• **Create a folder:** Say "create folder [name]"\n• **List folders:** Say "list folders"\n• **Archive a dance:** Say "archive this dance" — it hides from the main list but you can filter to see archived dances\n• **Move dances:** Use the group dropdown on each card in Saved Dances\n\nArchived dances are dimmed and hidden by default — click the "📦 Archived" filter button to see them.' },
    { patterns: [/\bsmart.*sav\b/, /\bduplicate.*saves?\b/, /\btoo many.*saves?\b/],
      answer: 'Smart saving is built in — when you save, the same dance ID updates in place instead of creating duplicates. Your cloud saves stay clean and organized automatically.' },
    { patterns: [/\bquick.*add\b.*\bstep\b|\badd.*to.*worksheet\b|\bput.*on.*sheet\b/],
      answer: 'You can quickly add steps to the worksheet by saying "add to worksheet [step name]" or "put on sheet coaster step". The helper adds it directly with smart section splitting!' },

    /* ── Catch-all helpful patterns ───────────────────── */
    { patterns: [/\bhelp\b/, /\bguide\b/, /\btutorial\b/, /\bhow (does|do).*work\b/],
      answer: 'I can help with:\n• **Building dances** — How to create, edit, add steps\n• **Saving & cloud sync** — Saving your work across devices\n• **Featuring dances** — How to submit and get featured\n• **PDF import** — Importing stepsheets from PDFs\n• **AI tools** — Dance building, judging, counting\n• **Dance terminology** — What steps mean and how they work\n• **Troubleshooting** — Common issues and fixes\n\nJust ask about anything specific!' },
    { patterns: [/\bthank/],
      answer: 'You\'re welcome! Happy dancing! 💃🕺 Let me know if you need anything else.' },
    { patterns: [/\bhello\b/, /\bhi\b/, /\bhey\b/],
      answer: function (ctx) {
        var greeting = ctx.signedIn ? 'Welcome back!' : 'Welcome to Step-By-Stepper!';
        var tip = ctx.totalSteps > 0
          ? ' You\'re working on "' + (ctx.danceTitle || 'Untitled') + '" with ' + ctx.totalSteps + ' steps.'
          : ' Start by building a dance in the **Build** tab, or ask me anything about the site.';
        return greeting + tip;
      }},
  ];

  /* ═══════════════════════════════════════════════════════════
     SMART ANSWER ENGINE
     ═══════════════════════════════════════════════════════════ */
  function findLocalAnswer(question, ctx) {
    var q = String(question || '').toLowerCase().trim();
    if (!q) return null;
    for (var i = 0; i < knowledgeBase.length; i++) {
      var entry = knowledgeBase[i];
      for (var j = 0; j < entry.patterns.length; j++) {
        if (entry.patterns[j].test(q)) {
          return typeof entry.answer === 'function' ? entry.answer(ctx, question) : entry.answer;
        }
      }
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════════════
     CONTEXTUAL QUICK-ACTION SUGGESTIONS
     ═══════════════════════════════════════════════════════════ */
  function getQuickSuggestions(ctx) {
    var page = String(ctx.currentTab || '').toLowerCase();
    var suggestions = [];

    /* Universal suggestions */
    if (!ctx.signedIn) {
      suggestions.push('How do I sign in?');
    }

    /* Page-specific suggestions */
    if (!page || page === 'main' || page === 'build') {
      if (ctx.totalSteps === 0) {
        suggestions.push('How do I create a new dance?');
        suggestions.push('Build me a beginner dance');
        suggestions.push('Generate a random 10/10 dance');
      } else {
        suggestions.push('How do I add a step?');
        if (ctx.hasUnsavedChanges) suggestions.push('Save my dance');
        suggestions.push('Judge my dance');
        suggestions.push('Generate a random section');
      }
      suggestions.push('What can you do?');
    }

    if (page === 'sheet') {
      suggestions.push('How do I import a PDF?');
      suggestions.push('How do I print my dance?');
    }

    if (page === 'saved' || page === 'my-saved-dances') {
      suggestions.push('List my saves');
      suggestions.push('Create a dance group');
      if (!ctx.signedIn) suggestions.push('How do I sign in?');
      else suggestions.push('Invite a collaborator');
    }

    if (page === 'featured' || page === 'featured-choreo') {
      suggestions.push('How do I get featured?');
      suggestions.push('What do the badges mean?');
    }

    if (page === 'signin' || page === 'sign-in') {
      if (!ctx.signedIn) {
        suggestions.push('How do I sign in?');
      } else {
        suggestions.push('What is Premium?');
        suggestions.push('How do I apply for moderator?');
        suggestions.push('AI Dance Judge');
      }
    }

    if (page === 'whats-new') {
      suggestions.push('What are the latest updates?');
    }

    if (page === 'friends') {
      suggestions.push('How do I invite a friend?');
      if (ctx.signedIn) suggestions.push('List my collaborators');
    }

    if (page === 'glossary') {
      suggestions.push('What is a vine?');
      suggestions.push('Dance step terminology');
    }

    if (page === 'pdfimport') {
      suggestions.push('How does PDF import work?');
      suggestions.push('What PDF formats are supported?');
    }

    /* General interest */
    if (suggestions.length < 4) {
      if (!suggestions.includes('Dance step terminology')) suggestions.push('Dance step terminology');
      if (!suggestions.includes('Tips for great choreography')) suggestions.push('Tips for great choreography');
    }

    return suggestions.slice(0, 4);
  }

  /* ═══════════════════════════════════════════════════════════
     ONBOARDING WELCOME MESSAGE
     ═══════════════════════════════════════════════════════════ */
  function getOnboardingMessage(ctx) {
    if (hasCompletedOnboarding()) return null;
    markOnboardingComplete();
    return {
      role: 'assistant',
      text: '👋 Welcome to Step-By-Stepper! I\'m your dance helper. Here\'s a quick start:\n\n' +
        '• **Build tab** — Create your dance step by step\n' +
        '• **Sheet tab** — Preview and print your dance\n' +
        '• **Glossary tab** — Browse 100+ standard dance steps\n' +
        '• **PDF Import tab** — Upload a stepsheet PDF\n' +
        '• **Friends tab** — Add friends & collaborate\n' +
        '• **Sign In** — Save to cloud, access AI tools\n' +
        '• **Featured Choreo** — Browse featured dances\n\n' +
        'I know all about line dance steps, site features, and choreography tips. Ask me anything!',
      isOnboarding: true
    };
  }

  /* ═══════════════════════════════════════════════════════════
     SIMPLE MARKDOWN RENDERER
     ═══════════════════════════════════════════════════════════ */
  function renderMarkdown(text) {
    if (!text) return '';
    var escaped = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic (simple pattern for broad browser compat — no lookbehind)
    escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Bullet lists
    escaped = escaped.replace(/^[•·]\s+(.+)$/gm, '<li>$1</li>');
    escaped = escaped.replace(/(<li>.*<\/li>\n?)+/g, function (match) {
      return '<ul style="margin:.3rem 0;padding-left:1.2rem;">' + match + '</ul>';
    });
    // Numbered lists
    escaped = escaped.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Line breaks
    escaped = escaped.replace(/\n/g, '<br>');
    return escaped;
  }

  /* ═══════════════════════════════════════════════════════════
     TYPING ANIMATION HTML
     ═══════════════════════════════════════════════════════════ */
  function typingIndicatorHtml() {
    return '<div style="display:flex;align-items:center;gap:4px;padding:4px 0;">' +
      '<span style="width:7px;height:7px;border-radius:50%;background:#6366f1;animation:stepperDot 1.4s infinite both;animation-delay:0s;"></span>' +
      '<span style="width:7px;height:7px;border-radius:50%;background:#6366f1;animation:stepperDot 1.4s infinite both;animation-delay:.2s;"></span>' +
      '<span style="width:7px;height:7px;border-radius:50%;background:#6366f1;animation:stepperDot 1.4s infinite both;animation-delay:.4s;"></span>' +
      '</div>';
  }

  /* Inject keyframes once */
  function injectHelperStyles() {
    if (document.getElementById('stepper-helper-brain-styles')) return;
    var style = document.createElement('style');
    style.id = 'stepper-helper-brain-styles';
    style.textContent = [
      '@keyframes stepperDot{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}',
      '@keyframes stepperFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}',
      '.stepper-helper-msg{animation:stepperFadeIn .25s ease-out both}',
      '.stepper-helper-chip{border:1px solid rgba(99,102,241,.2);background:#fff;color:#4f46e5;padding:6px 12px;border-radius:999px;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap}',
      '.stepper-helper-chip:hover{background:#4f46e5;color:#fff;border-color:#4f46e5;transform:scale(1.03)}',
      '.dark .stepper-helper-chip{background:#1e1b4b;color:#a5b4fc;border-color:rgba(99,102,241,.3)}',
      '.dark .stepper-helper-chip:hover{background:#4f46e5;color:#fff}',
      '.stepper-helper-feedback{display:inline-flex;gap:4px;margin-top:4px}',
      '.stepper-helper-fb-btn{border:none;background:transparent;cursor:pointer;font-size:14px;opacity:.45;padding:2px 4px;border-radius:6px;transition:all .15s}',
      '.stepper-helper-fb-btn:hover{opacity:1;background:rgba(99,102,241,.1)}',
      '.stepper-helper-fb-btn.voted{opacity:1}',
      '.dark .stepper-helper-panel{background:#1e1b4b !important;border-color:rgba(99,102,241,.25) !important}',
      '.dark .stepper-helper-panel .stepper-helper-msg-assistant{background:#312e81 !important;color:#e0e7ff !important;border-color:rgba(99,102,241,.2) !important}',
      '.dark .stepper-helper-panel .stepper-helper-msg-user{background:#4f46e5 !important;color:#fff !important}',
      '.dark .stepper-helper-panel input{background:#312e81 !important;color:#e0e7ff !important;border-color:rgba(99,102,241,.3) !important}',
      '.dark .stepper-helper-panel .stepper-helper-header{background:#312e81 !important}',
      '.dark .stepper-helper-panel .stepper-helper-empty{background:#312e81 !important;color:#a5b4fc !important;border-color:rgba(99,102,241,.2) !important}',
      '.stepper-helper-panel .stepper-helper-clear-btn{border:none;background:rgba(255,255,255,.18);color:#fff;border-radius:999px;padding:.25rem .55rem;font-size:11px;cursor:pointer;opacity:.7;transition:opacity .15s}',
      '.stepper-helper-panel .stepper-helper-clear-btn:hover{opacity:1}',
    ].join('\n');
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════════════ */
  window.__stepperHelperBrain = {
    findLocalAnswer:        findLocalAnswer,
    getQuickSuggestions:    getQuickSuggestions,
    getOnboardingMessage:   getOnboardingMessage,
    renderMarkdown:         renderMarkdown,
    typingIndicatorHtml:    typingIndicatorHtml,
    injectHelperStyles:     injectHelperStyles,
    gatherRichContext:      gatherRichContext,
    loadChatHistory:        loadChatHistory,
    saveChatHistory:        saveChatHistory,
    clearChatHistory:       clearChatHistory,
    saveFeedback:           saveFeedback,
    hasCompletedOnboarding: hasCompletedOnboarding,
  };

})();
