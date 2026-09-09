/* Shared, side-effect-free worksheet operations. Used by the editor and Node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StepperDance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const text = value => String(value == null ? '' : value).trim();
  const foot = value => /^(r|rf|right)$/i.test(text(value)) ? 'R' : /^(l|lf|left)$/i.test(text(value)) ? 'L' : null;
  const other = value => value === 'R' ? 'L' : value === 'L' ? 'R' : null;
  const word = value => value === 'R' ? 'Right' : value === 'L' ? 'Left' : 'unknown';
  const id = () => 'step-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  const isStep = step => step && step.type !== 'marker' && !!text(step.name || step.description || step.desc);
  const sectionSize = data => /waltz|3-count|6-count/i.test(text(data.meta?.type) + ' ' + text(data.meta?.danceStyle)) ? 6 : 8;

  function locations(data) {
    const list = (data.sections || []).map((section, sectionIndex) => ({ section, sectionIndex, tagId: null }));
    (data.tags || []).forEach(tag => (tag.sections || []).forEach((section, sectionIndex) => list.push({ section, sectionIndex, tagId: tag.id })));
    return list;
  }
  function locate(data, target) {
    return locations(data).find(item => item.section.id === target.sectionId && (item.tagId || null) === (target.tagId || null));
  }

  // Stored count labels are positions: a row labelled "8" occupies ONE beat.
  // A glossary's standalone "4" is a duration; convert it only at insertion.
  function countInfo(label) {
    const source = text(label).replace(/[–—]/g, '-').replace(/\band\b/gi, '&');
    if (!source || !/^(?:[\d\s&ae,\-]+)$/.test(source)) return null;
    const nums = (source.match(/\d+/g) || []).map(Number);
    if (!nums.length) return /^[&a]$/.test(source) ? { source, first: null, span: source === '&' ? .5 : 1 / 3 } : null;
    if (nums.some((n, i) => n < 1 || (i && n <= nums[i - 1]))) return null;
    return { source, first: nums[0], span: nums[nums.length - 1] - nums[0] + 1 };
  }
  function countSpan(step) { return countInfo(step?.count ?? step?.counts)?.span ?? null; }
  function sectionTiming(section) {
    const rows = (section.steps || []).filter(isStep);
    return rows.map((step, index) => {
      const info = countInfo(step.count ?? step.counts);
      if (!info) throw new Error('Give "' + (step.name || 'this step') + '" a count before rearranging it.');
      const next = text(rows[index + 1]?.count);
      const after = text(rows[index + 2]?.count);
      if (next === '&') info.span -= after === 'a' ? 2 / 3 : .5;
      else if (next === 'a') info.span -= 1 / 3;
      if (info.source === '&' && next === 'a') info.span = 1 / 3;
      return { step, ...info };
    });
  }
  function renumberSection(section, timing) {
    let cursor = 0;
    const byId = new Map((timing || sectionTiming(section)).map(row => [row.step.id, row]));
    for (const step of section.steps || []) {
      if (!isStep(step)) continue;
      const row = byId.get(step.id);
      if (!row) throw new Error('The step timing changed. Check its counts and try again.');
      if (row.first == null) {
        if (Math.abs(cursor % 1) < .001) throw new Error('Move the whole syncopated group together, including its numbered count.');
        step.count = row.source;
      } else {
        if (Math.abs(cursor - Math.round(cursor)) > .001) throw new Error('Move the whole syncopated group together, including & or a.');
        const shift = Math.round(cursor) + 1 - row.first;
        step.count = row.source.replace(/\d+/g, number => String(Number(number) + shift));
      }
      if ('counts' in step) step.counts = step.count;
      cursor += row.span;
    }
    return Math.round(cursor * 1000) / 1000;
  }
  function renumber(data) {
    locations(data).forEach(({ section }) => renumberSection(section));
    return data;
  }
  function newStep(value, positional) {
    const step = { ...clone(value), id: id(), type: 'step' };
    step.description = text(step.description || step.desc);
    let label = text(step.count ?? step.counts) || '1';
    if (!positional && /^\d+$/.test(label) && Number(label) > 1) label = '1-' + label;
    if (!countInfo(label)) throw new Error('The helper returned an invalid count for ' + (step.name || 'a step') + '.');
    step.count = label;
    return step;
  }
  function insert(data, values, target) {
    const next = clone(data);
    next.sections ||= [];
    if (!next.sections.length) next.sections.push({ id: id(), name: 'Section 1', steps: [] });
    const location = target ? locate(next, target) : locations(next).filter(item => !item.tagId).at(-1);
    if (!location) throw new Error('That section no longer exists. Select an insertion point again.');
    const section = location.section;
    section.steps ||= [];
    let index = section.steps.length;
    if (target?.beforeStepId) {
      index = section.steps.findIndex(step => step.id === target.beforeStepId);
      if (index < 0) throw new Error('That insertion point changed. Select it again.');
    } else if (target?.afterStepId) {
      index = section.steps.findIndex(step => step.id === target.afterStepId);
      if (index < 0) throw new Error('That insertion point changed. Select it again.');
      index++;
    }
    const existing = sectionTiming(section);
    const positional = values.length > 1 && values.every((value, index) => text(value.count) === String(index + 1) && actions(value)?.length === 1);
    const added = values.map(value => newStep(value, positional));
    const addedTiming = sectionTiming({ steps: added });
    // Continue full helper builds in normal phrase-sized sections. Inserting at
    // an explicit gap preserves the author's existing section boundaries.
    if (!target) {
      let active = section, used = existing.reduce((sum, row) => sum + row.span, 0);
      for (const row of addedTiming) {
        if (used > 0 && used + row.span > sectionSize(next)) {
          active = { id: id(), name: 'Section ' + (next.sections.length + 1), steps: [] };
          next.sections.push(active);
          used = 0;
        }
        active.steps.push(row.step);
        used += row.span;
      }
      next.sections.slice(next.sections.indexOf(section)).forEach(item => renumberSection(item, existing.concat(addedTiming)));
      return { data: next, addedIds: added.map(step => step.id) };
    }
    section.steps.splice(index, 0, ...added);
    renumberSection(section, existing.concat(addedTiming));
    return { data: next, addedIds: added.map(step => step.id) };
  }
  function move(data, source, destination) {
    const next = clone(data);
    const from = locate(next, source)?.section;
    const to = locate(next, destination)?.section;
    if (!from || !to) throw new Error('The section changed. Try dragging the step again.');
    const index = (from.steps || []).findIndex(step => step.id === source.stepId);
    if (index < 0) throw new Error('The step changed. Try dragging it again.');
    const timing = sectionTiming(from).concat(from === to ? [] : sectionTiming(to));
    let at = destination.beforeStepId ? to.steps.findIndex(step => step.id === destination.beforeStepId) : to.steps.length;
    if (at < 0) throw new Error('The drop position changed. Try again.');
    if (from === to && (at === index || at === index + 1)) return next;
    const [step] = from.steps.splice(index, 1);
    if (from === to && index < at) at--;
    to.steps.splice(at, 0, step);
    renumberSection(from, timing);
    if (from !== to) renumberSection(to, timing);
    return next;
  }

  const FOOT_RE = /\b(right|left|RF|LF|R|L)\b/i;
  function clauseAction(clause, fallbackFoot) {
    let source = text(clause).replace(/^\(?\d+[&a]?\)?\s*[:.)-]?\s*/, '');
    const match = source.match(FOOT_RE);
    const moving = foot(match?.[1]) || fallbackFoot;
    if (/^(hold|pause|clap|snap)\b/i.test(source)) return { kind: 'stay', foot: null, source };
    if (/^(hop)\b/i.test(source)) return { kind: 'support', foot: moving, source };
    if (/^(pivot|turn|swivel|twist|unwind|heel grind|sweep)/i.test(source)) {
      if (/^sweep/i.test(source)) return { kind: 'free', foot: moving, transfer: false, source };
      // A turn can be made on the supporting foot. Its exit weight must be stated.
      const end = source.match(/(?:weight|recover|ending|finish)(?:\s+\w+){0,3}\s+(right|left|R|L)\b/i);
      return end ? { kind: 'stay', foot: null, end: foot(end[1]), source } : null;
    }
    if (/^(touch|tap|point|kick|brush|scuff|hitch|flick|hook|stomp[- ]?up)\b/i.test(source)) {
      return moving ? { kind: 'free', foot: moving, transfer: false, source } : null;
    }
    if (/^(step|walk|cross|rock|recover|stomp|close|press|skate|place)\b/i.test(source)) {
      return moving ? { kind: 'free', foot: moving, transfer: !/no weight|without (?:taking |transferring )?weight/i.test(source), source } : null;
    }
    return null;
  }
  function namedActions(step) {
    const name = text(step.name).toLowerCase();
    // Variations with turns or extra actions need their explicit description.
    if (/\d|turn|rolling|hold|scuff|hitch|stomp|touch.*step/i.test(name)) return null;
    const r = foot(name.match(FOOT_RE)?.[1]) || foot(step.foot);
    if (!r) return null;
    const l = other(r), R = word(r), L = word(l);
    if (/^(?:grape)?vine\b/.test(name)) return [`Step ${R} to ${R.toLowerCase()} side`, `Cross ${L} behind ${R}`, `Step ${R} to ${R.toLowerCase()} side`, `Touch ${L} beside ${R}`];
    if (/coaster/.test(name)) return [`Step ${R} back`, `Step ${L} beside ${R}`, `Step ${R} forward`];
    if (/kick[- ]?ball[- ]?change/.test(name)) return [`Kick ${R} forward`, `Step ${R} ball beside ${L}`, `Step ${L} in place`];
    if (/sailor/.test(name)) return [`Cross ${R} behind ${L}`, `Step ${L} to side`, `Step ${R} to side`];
    if (/shuffle|chasse|triple step/.test(name)) {
      const direction = /back/.test(name) ? 'back' : /right|left|side|chasse/.test(name) ? 'to side' : 'forward';
      return [`Step ${R} ${direction}`, `Step ${L} beside ${R}`, `Step ${R} ${direction}`];
    }
    if (/rock.*recover|rock step/.test(name)) return [`Rock ${R} ${/back/.test(name) ? 'back' : 'forward'}`, `Recover ${L}`];
    if (/mambo/.test(name)) return [`Rock ${R} forward`, `Recover ${L}`, `Step ${R} beside ${L}`];
    if (/jazz box/.test(name)) return [`Cross ${R} over ${L}`, `Step ${L} back`, `Step ${R} to side`, `Step ${L} forward`];
    if (/step touch|side touch/.test(name)) return [`Step ${R} to side`, `Touch ${L} beside ${R}`];
    return null;
  }
  function actions(step) {
    const description = text(step.description || step.desc);
    let clauses = description ? description.split(/\s*[,;\n]\s*|\s+then\s+|\s+and\s+(?=(?:step|touch|cross|rock|recover|kick|point|hold)\b)/i).map(clause => clause.replace(/^then\s+/i, '')).filter(Boolean) : [];
    const simpleName = !description || description.replace(/[.!]$/, '').toLowerCase() === text(step.name).toLowerCase();
    if (simpleName) clauses = namedActions(step) || (clauses.length ? clauses : [text(step.name)]);
    let previous = null;
    const result = [];
    for (const clause of clauses) {
      // Do not silently ignore a second action inside an unseparated clause.
      const verbs = clause.match(/\b(step|walk|cross|rock|recover|touch|kick|hitch|scuff|brush|point|hop)\b/gi) || [];
      if (verbs.length > 1) return null;
      const action = clauseAction(clause, /^recover\b/i.test(clause) ? other(previous) : foot(step.foot));
      if (!action) return null;
      if (action.foot) previous = action.foot;
      result.push(action);
    }
    if (result.length === 1 && simpleName && step.weight === false && result[0].kind === 'free') result[0].transfer = false;
    return result.length ? result : null;
  }
  function initialWeight(data) { return foot(data.meta?.startWeight) || other(foot(data.meta?.startFoot) || 'R'); }
  function entries(sections, tagId) {
    return (sections || []).flatMap(section => (section.steps || []).map(step => ({ step, sectionId: section.id, sectionName: section.name, tagId: tagId || null })));
  }
  function openingFoot(list) {
    for (const { step } of list) {
      if (!isStep(step)) continue;
      const movement = actions(step);
      if (!movement) return null;
      const first = movement.find(action => action.kind !== 'stay');
      if (!first) continue;
      return first?.kind === 'free' ? first.foot : null;
    }
    return null;
  }
  function validate(data, phrasing) {
    const issues = [], trace = [];
    const add = (entry, code, message, severity = 'error') => issues.push({ code, message, severity, sectionId: entry?.sectionId, stepId: entry?.step?.id, tagId: entry?.tagId || null, count: entry?.step?.count });
    let main = entries(data.sections);
    const declaredPhrased = phrasing?.danceFormat === 'phrased';
    if (declaredPhrased && phrasing.sequence?.length) {
      main = phrasing.sequence.flatMap(item => item.kind === 'tag'
        ? entries((data.tags || []).find(tag => tag.id === item.id)?.sections, item.id)
        : entries((phrasing.parts || []).find(part => part.id === item.id)?.sectionIds?.flatMap(sectionId => (data.sections || []).filter(section => section.id === sectionId))));
    } else if (declaredPhrased) add(null, 'phrase-order', 'Set the phrase order to check transitions between parts.', 'warning');
    const firstFoot = openingFoot(main);
    function walk(list, start, repeatFoot, branch) {
      let weight = start;
      for (const entry of list) {
        const step = entry.step;
        if (step.type === 'marker') {
          if (step.markerType === 'restart' && repeatFoot && weight === repeatFoot) add(entry, 'restart-weight', 'This restart leaves weight on ' + word(weight) + ', which must move on count 1.');
          else if (step.markerType === 'restart' && !weight) add(entry, 'restart-unknown', 'The weight at this restart needs checking.', 'warning');
          else if (step.markerType !== 'restart') {
            const tag = (data.tags || []).find(tag => tag.id === step.tagId);
            if (tag && !branch) {
              const exit = walk(entries(tag.sections, tag.id), weight, null, true);
              if (exit !== weight) {
                add(entry, 'tag-transition', 'This tag changes the exit weight. Check both tagged and ordinary walls.', 'warning');
                weight = null;
              }
            } else add(entry, 'tag-placement', 'Link this tag to its section to check the transition.', 'warning');
          }
          continue;
        }
        if (!isStep(step)) continue;
        const before = weight, movement = actions(step);
        if (!movement) {
          add(entry, 'unknown-footwork', 'Describe each action in "' + (step.name || 'this step') + '" with Right or Left and its weight transfer.', 'warning');
          weight = foot(step.weightAfter);
        } else {
          const describedFoot = movement.find(action => action.foot)?.foot;
          if (foot(step.foot) && describedFoot && foot(step.foot) !== describedFoot) add(entry, 'foot-label', 'The foot label says ' + word(foot(step.foot)) + ', but the description starts with ' + word(describedFoot) + '.');
          for (const action of movement) {
            if (action.kind === 'free' && weight === action.foot) add(entry, 'weighted-foot', word(action.foot) + ' must move but still holds the weight (' + action.source + ').');
            if (action.kind === 'support' && weight && weight !== action.foot) add(entry, 'hop-support', 'A hop must use the supporting foot, currently ' + word(weight) + '.');
            if (action.kind !== 'stay' && !weight) add(entry, 'unknown-entry', 'The weight before "' + action.source + '" is not established.', 'warning');
            if (action.transfer || action.kind === 'support') weight = action.foot;
            if (action.end) weight = action.end;
          }
        }
        trace.push({ ...entry, before, after: weight });
      }
      if (repeatFoot && weight === repeatFoot) add(list.at(-1), 'repeat-weight', 'The dance ends with weight on ' + word(weight) + '. Count 1 needs that foot free.');
      else if (repeatFoot && !weight) add(list.at(-1), 'repeat-unknown', 'The final weight is unclear; the repeat needs checking.', 'warning');
      return weight;
    }
    const endWeight = walk(main, initialWeight(data), declaredPhrased && !phrasing?.sequence?.length ? null : firstFoot, false);
    for (const tag of data.tags || []) {
      if (trace.some(entry => entry.tagId === tag.id)) continue;
      const list = entries(tag.sections, tag.id);
      if (list.some(entry => isStep(entry.step))) {
        if (!foot(tag.startWeight)) add(list[0], 'tag-entry', 'Set the entry weight or place ' + (tag.name || 'this tag') + ' in the dance to verify its entry.', 'warning');
        walk(list, foot(tag.startWeight), null, true);
      }
    }
    let totalCounts = 0;
    for (const location of locations(data)) {
      const section = clone(location.section);
      try {
        const duration = renumberSection(section);
        if (!location.tagId) totalCounts += duration;
        section.steps.forEach((step, index) => {
          const original = location.section.steps[index];
          if (isStep(original) && text(step.count).replace(/\s/g, '') !== text(original.count).replace(/\s/g, '').replace(/[–—]/g, '-').replace(/and/gi, '&')) add({ step: original, sectionId: section.id, tagId: location.tagId }, 'count-position', 'Count should be ' + step.count + ' at this position.');
        });
      } catch (error) { add({ sectionId: section.id, tagId: location.tagId }, 'count-unknown', error.message, 'warning'); }
    }
    if (!declaredPhrased && Number(data.meta?.counts) && totalCounts !== Number(data.meta.counts)) add(null, 'count-total', totalCounts + ' counts written; the header says ' + data.meta.counts + '.', 'warning');
    return { issues, trace, endWeight, firstFoot, totalCounts, valid: !issues.some(issue => issue.severity === 'error'), complete: !issues.length };
  }

  function repair(data, phrasing) {
    const next = clone(data), changes = [];
    // Repair each action, then carry its real exit weight through the rest of the sheet.
    // Unknown actions break certainty; never invent a continuation through them.
    function repairSequence(sections, start, tagId) {
      let weight = start;
      for (const entry of entries(sections, tagId)) {
        const step = entry.step;
        if (step.type === 'marker') { if (step.markerType !== 'restart') weight = null; continue; }
        if (!isStep(step)) continue;
        const movement = actions(step);
        if (!movement) { weight = foot(step.weightAfter); continue; }
        let changed = !!(foot(step.foot) && movement.find(action => action.foot)?.foot && foot(step.foot) !== movement.find(action => action.foot).foot);
        for (const action of movement) {
          const corrected = action.kind === 'free' && weight === action.foot ? other(weight) : action.kind === 'support' && weight && weight !== action.foot ? weight : null;
          if (corrected) {
            action.source = FOOT_RE.test(action.source) ? action.source.replace(FOOT_RE, word(corrected)) : action.source + ' with ' + word(corrected);
            action.foot = corrected;
            changed = true;
          }
          if (action.transfer || action.kind === 'support') weight = action.foot;
          if (action.end) weight = action.end;
        }
        if (changed) {
          const before = clone(step);
          step.description = movement.map(action => action.source).join(', ');
          step.foot = movement.find(action => action.foot)?.foot || step.foot;
          step.name = step.description;
          if ('desc' in step) step.desc = step.description;
          changes.push({ stepId: step.id, before, after: clone(step), reason: 'Freed the moving foot and continued the weight through the following actions.' });
        }
      }
    }
    repairSequence(next.sections, initialWeight(next), null);
    for (const tag of next.tags || []) repairSequence(tag.sections, foot(tag.startWeight), tag.id);
    // A restart is another repeat boundary. Free the opening foot there, then
    // rewrite the normal-wall continuation using the new exit weight.
    if (phrasing?.danceFormat !== 'phrased') {
      const restartIssues = validate(next, phrasing).issues.filter(issue => issue.code === 'restart-weight' && !issue.tagId);
      for (const issue of restartIssues) {
        const list = entries(next.sections);
        const boundary = list.findIndex(entry => entry.step.id === issue.stepId);
        for (let index = boundary - 1; index >= 0; index--) {
          const step = list[index].step;
          if (!isStep(step)) continue;
          const movement = actions(step);
          if (!movement) break;
          const last = movement.findLastIndex(action => action.transfer);
          if (last < 0) continue;
          const before = clone(step);
          const moving = movement[last].foot;
          movement[last].source = 'Touch ' + word(moving) + ' beside ' + word(other(moving)) + ' without weight';
          step.description = movement.map(action => action.source).join(', ');
          step.name = step.description;
          if ('desc' in step) step.desc = step.description;
          if (movement.length === 1) step.weight = false;
          changes.push({ stepId: step.id, before, after: clone(step), reason: 'Freed the opening foot at the restart and adjusted the continuation.' });
          repairSequence(next.sections, initialWeight(next), null);
          break;
        }
      }
    }
    let checked = validate(next, phrasing);
    // Preserve the beat: a final step can become a touch when that restores the repeat.
    if (!phrasing || phrasing.danceFormat !== 'phrased') {
      if (checked.issues.some(issue => issue.code === 'repeat-weight')) {
        const candidates = checked.trace.filter(entry => !entry.tagId).reverse();
        for (const entry of candidates) {
          const movement = actions(entry.step);
          if (!movement) break;
          const last = movement.findLastIndex(action => action.transfer);
          if (last < 0) continue;
          const trial = clone(next);
          const step = locate(trial, entry).section.steps.find(step => step.id === entry.step.id);
          movement[last] = { source: 'Touch ' + word(movement[last].foot) + ' beside ' + word(other(movement[last].foot)) + ' without weight' };
          step.description = movement.map(action => action.source).join(', ');
          step.name = step.description;
          if ('desc' in step) step.desc = step.description;
          if (movement.length === 1) step.weight = false;
          const result = validate(trial, phrasing);
          if (result.issues.filter(issue => issue.severity === 'error').length < checked.issues.filter(issue => issue.severity === 'error').length && !result.issues.some(issue => issue.code === 'repeat-weight')) {
            changes.push({ stepId: step.id, before: clone(entry.step), after: clone(step), reason: 'Kept the final count and freed the opening foot for the next wall.' });
            Object.assign(next, trial);
          }
          break;
        }
      }
    }
    locations(next).forEach(({ section }) => { try { renumberSection(section); } catch (_) { /* Keep ambiguous rhythms flagged. */ } });
    checked = validate(next, phrasing);
    return { data: next, changes, validation: checked };
  }
  return { clone, foot, other, word, isStep, locations, locate, countInfo, countSpan, sectionTiming, renumberSection, renumber, sectionSize, insert, move, namedActions, actions, initialWeight, validate, repair };
});
