
(function(){
  if (window.__stepperWhatsNewTransitionNoteInstalled) return;
  window.__stepperWhatsNewTransitionNoteInstalled = true;
  const NOTE_TEXT = 'New: the page switch now uses the Snake Steps GIF again on a full black screen without the extra flash, and the transition restarts cleanly from the start each time.';
  const noteId = 'stepper-transition-whats-new-note';

  function injectNote(){
    const roots = Array.from(document.querySelectorAll('div, section, article'));
    for (const root of roots) {
      if (root.querySelector && root.querySelector('#' + noteId)) continue;
      const text = (root.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text.includes("What's New")) continue;
      if (!text.includes('startup') && !text.includes('transition')) continue;
      const note = document.createElement('div');
      note.id = noteId;
      note.style.marginBottom = '12px';
      note.style.padding = '12px 14px';
      note.style.borderRadius = '16px';
      note.style.border = '2px solid rgba(99,102,241,.35)';
      note.style.background = 'rgba(99,102,241,.10)';
      note.style.fontWeight = '700';
      note.style.lineHeight = '1.35';
      note.textContent = NOTE_TEXT;
      root.prepend(note);
      return true;
    }
    return false;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries += 1;
    if (injectNote() || tries > 24) clearInterval(timer);
  }, 750);
})();
