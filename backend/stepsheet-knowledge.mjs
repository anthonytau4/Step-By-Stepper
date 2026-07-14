/**
 * stepsheet-knowledge.mjs
 * ───────────────────────
 * A layout "knowledge base" distilled from the 100 most-danced line-dance
 * stepsheets (the Copperknob / linedancer.co.uk house style that the vast
 * majority of published sheets follow).
 *
 * It is used in two places:
 *   1. The heuristic PDF parser — shared step vocabulary, header-field
 *      patterns, count-notation normalisation and dance-feel detection, so
 *      the importer works well even when no AI provider is configured.
 *   2. The AI correction pass — an expert system prompt plus worked
 *      examples so the model *knows how a stepsheet is laid out* and can
 *      repair a messy extraction into clean, editor-ready JSON.
 *
 * Pure ESM with no external dependencies so it stays easy to unit-test.
 */

/* ── Canonical step vocabulary ─────────────────────────────────────────
 * The move names that open a step line on the overwhelming majority of
 * published sheets. Kept as data (not a regex) so both parser paths and the
 * AI prompt can share the exact same list. */
export const STEP_VOCABULARY = [
  'step', 'side', 'walk', 'rock', 'cross', 'behind', 'together', 'touch',
  'tap', 'point', 'heel', 'toe', 'kick', 'flick', 'hitch', 'hook',
  'shuffle', 'sailor', 'mambo', 'weave', 'vine', 'grapevine', 'nightclub',
  'lunge', 'lock', 'scissor', 'scissors', 'coaster', 'skate', 'pivot',
  'turn', 'paddle', 'charleston', 'monterey', 'stomp', 'stamp', 'swivel',
  'twinkle', 'roll', 'drag', 'brush', 'ball', 'hold', 'run', 'slide',
  'chasse', 'chasses', 'jazz', 'jazzbox', 'box', 'rocking', 'recover',
  'sway', 'sways', 'bump', 'bumps', 'kickball', 'ronde', 'rond', 'sweep',
  'unwind', 'triple', 'dorothy', 'diagonal', 'forward', 'back', 'basic',
  'rumba', 'cha', 'syncopated', 'wizard', 'diamond', 'boogie', 'fan',
  'apple', 'jack', 'anchor', 'prissy', 'camel', 'militaristic'
];

/* Move names that must appear as a whole word (short/ambiguous tokens). */
const WHOLE_WORD_ONLY = new Set(['box', 'fan', 'jack', 'run', 'cha', 'toe', 'ball']);

/**
 * Build the "does this line begin a step?" regex from STEP_VOCABULARY.
 * Anchored to the start of the line, case-insensitive.
 */
export function buildStepVocabularyRegex() {
  const parts = STEP_VOCABULARY.map((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return WHOLE_WORD_ONLY.has(word) ? `${escaped}\\b` : escaped;
  });
  return new RegExp(`^(?:${parts.join('|')})`, 'i');
}

/**
 * True when a raw line looks like the start of a step instruction: it either
 * begins with a count token (a digit, "&" or "a") or a known move name.
 */
export function looksLikeStepLine(line) {
  const value = String(line || '').trim();
  if (!value) return false;
  if (/^(?:counts?\s*)?[&aA]?\s*\d/.test(value)) return true;
  if (/^[&aA]\b/.test(value)) return true;
  return buildStepVocabularyRegex().test(value);
}

/* ── Header fields ─────────────────────────────────────────────────────
 * The metadata block sits at the very top of a sheet. Labels vary a lot in
 * punctuation and spacing, so every pattern is tolerant of ":" "-" "." and
 * multiple spaces. Order matters — more specific labels come first. */
export const HEADER_FIELD_PATTERNS = {
  choreographer: /^(?:choreograph(?:er|ed by|y)|choreo|scripted by|written by)\s*[:.\-–]?\s*(.+)$/i,
  music: /^(?:music|song|track|music\s*\/\s*song)\s*[:.\-–]?\s*(.+)$/i,
  level: /^(?:level|difficulty|standard)\s*[:.\-–]?\s*(.+)$/i,
  bpm: /^(?:bpm|beats\s*per\s*minute|tempo)\s*[:.\-–]?\s*(\d{2,3})/i
};

/**
 * Bind count / wall numbers to their keyword within a (possibly packed)
 * metadata line. Handles both common layouts in a single left-to-right,
 * consuming pass so a field never steals the neighbouring field's number:
 *   "Count: 32  Wall: 4"   (label then value)
 *   "32 Count  4 Wall"     (value then label)
 * Fills only keys not already present in `found`.
 */
export function scanCountWall(line, found = {}) {
  const re = /(\d{1,3})\s*(counts?|walls?)\b|\b(counts?|walls?)\s*[:.\-–]?\s*(\d{1,3})/gi;
  let match;
  while ((match = re.exec(line))) {
    const numberFirst = match[1] !== undefined;
    const word = (numberFirst ? match[2] : match[3]).toLowerCase();
    const value = numberFirst ? match[1] : match[4];
    const key = word.startsWith('count') ? 'count' : 'wall';
    if (!found[key]) found[key] = String(value);
  }
  return found;
}

const LEVEL_KEYWORDS = /(absolute beginner|high beginner|beginner|improver|easy intermediate|intermediate|advanced|phrased|novice)/i;

function titleCaseWords(value) {
  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Pull the header/metadata fields out of the top of a stepsheet. Reads the
 * first `scanLines` lines for labelled fields, then falls back to loose,
 * anywhere-in-the-document matches for count / wall / level.
 *
 * Returns only the keys it actually found, so callers can merge without
 * clobbering values they already have.
 */
export function extractHeaderFields(lines, scanLines = 28) {
  const clean = (Array.isArray(lines) ? lines : String(lines || '').split('\n'))
    .map((line) => String(line || '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const found = {};
  const head = clean.slice(0, scanLines);

  for (const line of head) {
    for (const [key, pattern] of Object.entries(HEADER_FIELD_PATTERNS)) {
      if (found[key]) continue;
      const match = line.match(pattern);
      if (match) found[key] = String(match[1] || '').trim();
    }
    scanCountWall(line, found);
    if (!found.level) {
      const inline = line.match(LEVEL_KEYWORDS);
      // Only treat a bare level keyword as the level when the line is short,
      // so we don't grab "advanced" out of a step description.
      if (inline && line.length <= 60) found.level = titleCaseWords(inline[1]);
    }
  }

  const joined = clean.join('\n');
  if (!found.level) {
    const match = joined.match(LEVEL_KEYWORDS);
    if (match) found.level = titleCaseWords(match[1]);
  }
  if (found.level) found.level = titleCaseWords(found.level).slice(0, 60);
  return found;
}

/* ── Count-notation normalisation ──────────────────────────────────────
 * Sheets write counts many ways: "1-2", "1 & 2", "1&2&", "1,2,3", "3 a 4",
 * "1 – 2". Normalise the spacing so downstream count logic is consistent
 * while preserving the choreographer's intent (ranges, "&", "a"). */
export function normalizeCountNotation(value) {
  let raw = String(value || '').trim();
  if (!raw) return '';
  raw = raw.replace(/^counts?\s*/i, '');
  raw = raw
    .replace(/[–—]/g, '-')            // en/em dash → hyphen
    .replace(/\s*&\s*/g, ' & ')       // pad "&"
    .replace(/\s*-\s*/g, '-')         // tighten ranges: "1 - 2" → "1-2"
    .replace(/\s*,\s*/g, ', ')        // tidy comma lists
    .replace(/\b([aA])\b/g, ' a ')    // isolate "a" triples
    .replace(/\s+/g, ' ')
    .trim();
  return raw;
}

/* ── Dance-feel / phrasing detection ───────────────────────────────────
 * A waltz phrases in 6 (two bars of 3/4); everything else defaults to the
 * standard 8-count phrase. Detection looks at the title, music, level and a
 * sample of the body text. */
export function classifyDanceFeel({ title = '', music = '', level = '', rawText = '' } = {}) {
  const blob = `${title}\n${music}\n${level}\n${rawText}`.toLowerCase();
  if (/\bwaltz\b|\bvals\b|viennese|cross\s*step\s*waltz/.test(blob)) return 'Waltz';
  if (/\b6\s*\/\s*8\b|\b3\s*\/\s*4\b/.test(blob)) return 'Waltz';
  return '8-count';
}

/** Counts per phrase for a given dance feel. */
export function phraseCountsForFeel(feel) {
  return String(feel || '').trim().toLowerCase() === 'waltz' ? 6 : 8;
}

/**
 * Estimate how many counts a single step spans from its count label, so
 * sections can be split by accumulated beats rather than by an absolute
 * running total. This is what makes sectioning robust to sheets that
 * restart their counts every phrase (1-8, 1-8, ...) instead of numbering
 * straight through (1..32).
 *   "5"        -> 1     "1 & 2" -> 2 (two beats)
 *   "1-4"      -> 4     ""/"&a" -> 1 (never zero)
 */
export function countBeatsForStep(step) {
  const raw = String((step && (step.count || step.counts)) || '').trim();
  if (!raw) return 1;
  const rangeMatch = raw.match(/(\d+)\s*(?:-|–|—|to|through)\s*(\d+)/i);
  if (rangeMatch) {
    const span = Math.abs(Number(rangeMatch[2]) - Number(rangeMatch[1])) + 1;
    return span > 0 ? span : 1;
  }
  const tokens = raw.match(/\d+/g);
  return tokens && tokens.length ? tokens.length : 1;
}

/* ── AI correction knowledge ───────────────────────────────────────────
 * The layout guide is the "knowledge of the top 100 stepsheets" that the
 * model reads before repairing an extraction. */
export const STEPSHEET_LAYOUT_GUIDE = `HOW A LINE-DANCE STEPSHEET IS LAID OUT (the conventions shared by the most-danced published sheets):

1. HEADER BLOCK (top of the sheet, before any steps):
   - Title, usually the first line and often in capitals.
   - "Choreographer" / "Choreographed by" / "Choreo" — the author(s).
   - "Count" / "Counts" — the TOTAL number of counts in one wall (e.g. 32, 48, 64). Not the count of a single step.
   - "Wall" / "Walls" — how many walls the dance faces (1, 2 or 4).
   - "Level" — Absolute Beginner, Beginner, Improver, Intermediate, Advanced (sometimes "Phrased").
   - "Music" / "Song" — the track, sometimes with artist, album, BPM or running time.
   - These often appear on one packed line, e.g. "32 Count, 4 Wall, Improver level".

2. STEP BODY:
   - Steps are grouped into phrases of 8 counts (a WALTZ phrases in 6). A new 8-count phrase almost always starts a new logical block.
   - Each step line usually starts with its counts on the left: "1-2", "3&4", "5-6-7-8", "1,2,3", "1 & 2". "&" is a half-beat, "a" is a triple.
   - After the counts comes the description ("Step right to right side, cross left behind right"). The move name is the leading phrase of the description.
   - Foot is implied by the words Right/Left (R/RF vs L/LF).

3. SECTION / PART LABELS (not always present):
   - Some sheets label blocks: "Section 1", "A", "Part A", "[16 counts]", or a bold phrase heading. Phrased/part dances (AABB, ABAB...) name their parts.
   - When no labels exist, split strictly every 8 counts (6 for a waltz).

4. TAGS, RESTARTS & BRIDGES:
   - "Tag" = extra counts danced at a set point. "Restart" = begin the dance again from the top before finishing the wall. "Bridge" = a short linking section.
   - Often written inline or as their own line: "Restart here on walls 3 and 6", "Tag (4 counts): ...". Keep them as markers in order, do not turn them into normal steps.

5. WHAT TO IGNORE:
   - Page numbers, website URLs/footers, "Have fun!", contact details, and repeated running headers.`;

/**
 * Worked before→after examples. They teach the model the exact JSON shape
 * and the most common clean-ups (merged wrapped lines, count normalisation,
 * 8-count sectioning, tag/restart markers).
 */
export const CORRECTION_FEW_SHOTS = [
  {
    note: 'A plain 8-count block with wrapped description lines and a restart.',
    messy: [
      '1-2 Step right to right side, rock',
      'back on left',
      '3&4 Cross shuffle right over left',
      '5-6 Rock forward, recover',
      '7&8 Coaster step',
      'Restart here on wall 3'
    ].join('\n'),
    clean: {
      steps: [
        { counts: '1-2', count: '1-2', name: 'Side Rock', description: 'Step right to right side, rock back on left', foot: 'R' },
        { counts: '3&4', count: '3&4', name: 'Cross Shuffle', description: 'Cross shuffle right over left', foot: 'R' },
        { counts: '5-6', count: '5-6', name: 'Rock Recover', description: 'Rock forward, recover', foot: 'Either' },
        { counts: '7&8', count: '7&8', name: 'Coaster Step', description: 'Coaster step', foot: 'Either' }
      ],
      sections: [
        {
          title: '', kind: 'section', steps: [
            { counts: '1-2', count: '1-2', name: 'Side Rock', description: 'Step right to right side, rock back on left', foot: 'R' },
            { counts: '3&4', count: '3&4', name: 'Cross Shuffle', description: 'Cross shuffle right over left', foot: 'R' },
            { counts: '5-6', count: '5-6', name: 'Rock Recover', description: 'Rock forward, recover', foot: 'Either' },
            { counts: '7&8', count: '7&8', name: 'Coaster Step', description: 'Coaster step', foot: 'Either' },
            { marker: true, markerType: 'restart', description: 'Restart here on wall 3' }
          ]
        }
      ],
      danceFeel: '8-count',
      phraseCounts: 8
    }
  }
];

/**
 * The expert system prompt for the correction model.
 */
export function buildCorrectionSystemPrompt() {
  return [
    'You are an expert line-dance stepsheet parser. You have studied the layout of the 100 most-danced published stepsheets and you know exactly how they are structured.',
    'Your job: repair a rough, machine-extracted parse of one stepsheet into clean, accurate, editor-ready JSON.',
    'Stay strictly faithful to the supplied PDF text — never invent steps, counts, tags or metadata that the text does not support. When something is genuinely unknown, use an empty string.',
    'Output JSON ONLY. No markdown, no code fences, no commentary.',
    '',
    STEPSHEET_LAYOUT_GUIDE
  ].join('\n');
}

/**
 * The per-document user prompt: the schema, the reference examples, the raw
 * PDF text and the current heuristic parse to be corrected.
 */
export function buildCorrectionUserPrompt({ base, rawText, maxTextChars = 24000, maxBaseChars = 12000 } = {}) {
  const trimmedText = String(rawText || '').slice(0, maxTextChars);
  const baseJson = (() => {
    try { return JSON.stringify(base || {}).slice(0, maxBaseChars); }
    catch { return '{}'; }
  })();
  const examples = CORRECTION_FEW_SHOTS
    .map((ex, i) => `Example ${i + 1} (${ex.note})\nMESSY TEXT:\n${ex.messy}\nCORRECTED JSON:\n${JSON.stringify(ex.clean)}`)
    .join('\n\n');

  return [
    'Return a single JSON object with these keys:',
    '  title, choreographer, music, level, count, counts, wall, walls,',
    '  steps, sections, importLog, danceType, danceFeel, phraseCounts, partCount, sectionCount.',
    'Each step object: { counts, count, name, description, foot }.',
    '  - "count"/"counts": the beat label exactly as written (e.g. "1-2", "3&4"), tidily spaced.',
    '  - "name": the short move name (leading phrase of the description).',
    '  - "description": the full instruction, with wrapped lines merged back together.',
    '  - "foot": "R", "L", "Both" or "Either" based on the wording.',
    'Each section object: { title, kind, steps }. "kind" is "part" for a named part of a phrased dance, otherwise "section".',
    'Rules:',
    '  - "count"/"counts" at the top level (metadata) is the dance TOTAL count, not a single step.',
    '  - Split the steps into sections of one 8-count phrase each (6 counts for a waltz) unless the sheet gives explicit section/part labels.',
    '  - Preserve tags, restarts and bridges as markers in order: { marker: true, markerType: "tag"|"restart"|"bridge", description }.',
    '  - Drop page numbers, URLs, footers and running headers.',
    '',
    'REFERENCE EXAMPLES:',
    examples,
    '',
    'PDF TEXT:',
    trimmedText,
    '',
    'CURRENT HEURISTIC PARSE (correct and complete this):',
    baseJson
  ].join('\n');
}

/* ── Remaster knowledge ────────────────────────────────────────────────
 * The 5 stepsheet formats that cover almost every published line-dance
 * sheet. The remaster pass rewrites a messy/inconsistent dance into one
 * clean sheet that follows these conventions. */
export const TOP_5_STEPSHEET_FORMATS = `THE 5 MOST COMMON LINE-DANCE STEPSHEET FORMATS:

1. COPPERKNOB CLASSIC — a header block (Title, Choreographer, Count/Wall/Level, Music) then left-aligned count blocks ("1-2", "3&4", "5-6-7-8"), one action phrase per line, 8-count phrases with no explicit section labels.
2. SECTION-HEADED (Kickit style) — the same header block, then explicit section headings like "Section 1 (1-8)", "[9-16]" or a short bold title, each followed by its steps.
3. PHRASED / PART DANCE (AABBC...) — named parts ("Part A", "Part B"), a stated sequence, and Tags/Restarts/Bridges called out at their walls.
4. TWO-COLUMN — counts in a left column and the description on the right, sometimes with wall-facing notes; reads the same as classic once flattened.
5. WALTZ / 6-COUNT — phrases of 6 (1,2,3 / 4,5,6) in 3/4 timing, gentler cross/step/together wording.

REMASTERING RULES (apply regardless of the original format):
- Keep the choreography exactly as given — never add, remove or reorder moves. Only reformat, merge broken lines and clarify wording.
- Give every step a concise Title-Case move name plus a clean, full description.
- Normalise counts ("1 - 2" -> "1-2", "1&2" -> "1 & 2") and set foot (R/L/Both/Either) from the wording.
- Re-split into correct 8-count phrases (6 for a waltz) when the sections are uneven, unless the dance is clearly a named-part dance (then keep the parts).
- Keep Tags, Restarts and Bridges as markers in their original positions.`;

export function buildRemasterSystemPrompt() {
  return [
    'You are an expert line-dance stepsheet editor. You know the 5 most common stepsheet formats and how a clean, teachable sheet should read.',
    'Your job: take one existing dance (which may be messy, unevenly sectioned, or inconsistently worded) and REMASTER it into a single clean, correctly-formatted stepsheet.',
    'Never change the choreography itself — do not invent, drop or reorder steps. Only reformat, merge broken lines, normalise counts, name moves consistently, fix sectioning and clarify descriptions.',
    'Output JSON ONLY. No markdown, no code fences, no commentary.',
    '',
    TOP_5_STEPSHEET_FORMATS
  ].join('\n');
}

export function buildRemasterUserPrompt({ base, rawText, maxTextChars = 24000, maxBaseChars = 12000 } = {}) {
  const trimmedText = String(rawText || '').slice(0, maxTextChars);
  const baseJson = (() => {
    try { return JSON.stringify(base || {}).slice(0, maxBaseChars); }
    catch { return '{}'; }
  })();
  return [
    'Return a single JSON object with these keys:',
    '  title, choreographer, music, level, count, counts, wall, walls,',
    '  steps, sections, importLog, danceType, danceFeel, phraseCounts, partCount, sectionCount.',
    'Each step object: { counts, count, name, description, foot }.',
    'Each section object: { title, kind, steps }. "kind" is "part" for a named part, otherwise "section".',
    'Remaster the dance below into clean, consistent, correctly-sectioned form following the 5-format conventions.',
    'Preserve every move; only improve formatting, naming, counts, foot and section boundaries. Keep tags/restarts/bridges as markers in place.',
    '',
    'CURRENT DANCE (text form):',
    trimmedText,
    '',
    'CURRENT STRUCTURED PARSE (rebuild this cleaner):',
    baseJson
  ].join('\n');
}
