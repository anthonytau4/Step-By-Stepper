#!/usr/bin/env python3
import json
import re
import sys
from typing import Any, Dict, List, Optional

STEP_WORDS = {
    'step','steps','rock','recover','vine','grapevine','shuffle','triple','stomp','clap','kick','toe','heel','cross',
    'side','back','forward','turn','pivot','coaster','sailor','weave','mambo','swivel','skate','scuff','brush','hitch',
    'hop','touch','monterey','jazz','rumba','charleston','walk','lock','syncopated','drag','flick','hook','body roll',
    'sway','tap','point','boogie'
}
LEVELS = {'beginner':'Beginner','improver':'Improver','intermediate':'Intermediate','advanced':'Advanced'}


def compact(value: Any) -> str:
    return re.sub(r'\s+', ' ', str(value or '')).strip()


def title_case(value: str) -> str:
    value = compact(value)
    if not value:
        return ''
    def repl(match: re.Match[str]) -> str:
        return match.group(1).upper()
    return re.sub(r'\b([a-z])', repl, value)


def normalize(value: Any) -> str:
    return re.sub(r'[^a-z0-9]+', ' ', compact(value).lower()).strip()


def truthy_text(value: Any) -> str:
    return compact(value)


def current_meta(dance: Optional[dict]) -> Dict[str, str]:
    data = (((dance or {}).get('snapshot') or {}).get('data') or {})
    meta = data.get('meta') if isinstance(data.get('meta'), dict) else {}
    result = {}
    for key in ('title','counts','walls','level','type'):
        text = truthy_text(meta.get(key))
        if text:
            result[key] = text
    return result


def extract_title(text: str) -> str:
    patterns = [
        r'\b(?:called|named|titled)\s+["“]?([^"”\n,.!?]+)',
        r'\b(?:call it|name it|title it)\s+["“]?([^"”\n.!?]+)',
        r'\b(?:dance name|name)\s*[:=-]\s*["“]?([^"”\n]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            title = compact(match.group(1))
            title = re.sub(r',\s*\d+\s*walls?\b.*$', '', title, flags=re.I)
            return title_case(title)
    cleaned = compact(text)
    if cleaned and len(cleaned.split()) <= 5 and not re.search(r'\b(count|wall|step|dance|add|make|create|build|section|beginner|improver|intermediate|advanced)\b', cleaned, re.I):
        return title_case(cleaned)
    return ''


def extract_meta(text: str, existing: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    meta = dict(existing or {})
    text = compact(text)
    title = extract_title(text)
    if title:
        meta['title'] = title
    count_match = re.search(r'\b(\d{1,3})\s*counts?\b', text, re.I)
    if count_match:
        meta['counts'] = count_match.group(1)
    walls_match = re.search(r'\b(\d{1,2})\s*walls?\b', text, re.I)
    if walls_match:
        meta['walls'] = walls_match.group(1)
        meta['type'] = f"{meta['walls']}-Wall"
    for raw, pretty in LEVELS.items():
        if re.search(rf'\b{re.escape(raw)}\b', text, re.I):
            meta['level'] = pretty
            break
    return meta


def count_label_from_text(text: str) -> str:
    text = compact(text)
    patterns = [
        r'\b((?:\d+\s*[&,-]\s*)+\d+)\b',
        r'\b(\d+\s*&\s*\d+)\b',
        r'\bcounts?\s*[:=-]\s*([^\n]+)$',
        r'\(([^)]*\d[^)]*)\)\s*$'
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            value = compact(match.group(1).replace(' to ', '-'))
            if re.search(r'\d', value):
                return value
    return ''


def strip_count_label(text: str) -> str:
    text = compact(text)
    text = re.sub(r'\bcounts?\s*[:=-]\s*[^\n]+$', '', text, flags=re.I).strip()
    text = re.sub(r'\(([^)]*\d[^)]*)\)\s*$', '', text).strip()
    text = re.sub(r'\b((?:\d+\s*[&,-]\s*)+\d+)\b\s*$', '', text).strip()
    return compact(text.strip(' .,-'))


def clean_token(token: str) -> str:
    value = compact(token)
    value = re.sub(r'^[\-•*]+\s*', '', value)
    value = re.sub(r'^\d+[.)]\s*', '', value)
    value = re.sub(r'^(?:please\s+)?(?:can you\s+)?(?:help me\s+)?(?:add|put in|put|insert|make|create|build|write|give me|use|do)\s+', '', value, flags=re.I)
    value = re.sub(r'^(?:a|an|the)\s+', '', value, flags=re.I)
    value = re.sub(r'\b(?:for the dance|to the dance|into the dance|to the worksheet|into the worksheet|please|thanks|babes)\b', '', value, flags=re.I)
    return compact(value.strip(' .'))


def looks_like_step(text: str) -> bool:
    lowered = normalize(text)
    return any(word in lowered for word in STEP_WORDS) or bool(re.search(r'\bx\d+\b', text, re.I))


def infer_step_name(body: str) -> str:
    body = compact(body)
    if not body:
        return 'Custom Step'
    m = re.match(r'(.+?)\s+x\s*(\d+)\s+with\s+a\s+touch$', body, re.I)
    if m:
        name = title_case(f"{compact(m.group(1))} x{m.group(2)} with a Touch")
        return re.sub(r'\bX(\d+)\b', r'x\1', name)
    body = re.sub(r'\bto (?:the )?(?:right|left)\b', lambda mm: mm.group(0).title(), body, flags=re.I)
    return title_case(' '.join(body.split()[:6]))


def infer_step_description(body: str, count: str) -> str:
    text = compact(body)
    lowered = text.lower()
    if re.search(r'walk\s*x\s*3\s+with\s+a\s+touch', lowered):
        return 'Walk for three steps, then touch on the final count.'
    if re.search(r'walk\s*x\s*\d+\s+with\s+a\s+touch', lowered):
        times = re.search(r'walk\s*x\s*(\d+)', lowered)
        count_word = times.group(1) if times else 'several'
        return f'Walk for {count_word} steps, then touch on the final count.'
    if 'rock back recover' in lowered or 'rock back, recover' in lowered:
        return 'Rock back onto the stepping foot and recover back onto the other foot.'
    if 'coaster' in lowered:
        return 'Step back, step together, step forward.'
    if 'grapevine' in lowered or lowered.startswith('vine '):
        direction = 'right' if 'right' in lowered else ('left' if 'left' in lowered else 'to the side')
        return f'Step {direction}, cross behind, step {direction}, then touch or step to finish.'
    if 'sailor' in lowered:
        return 'Cross behind, step to the side, then recover onto the other foot.'
    if 'jazz box' in lowered:
        return 'Cross over, step back, step to the side, then step forward.'
    if 'pivot' in lowered:
        return 'Step forward and pivot the stated amount before recovering your weight.'
    if 'touch' in lowered and not count:
        return title_case(text) + '.'
    sentence = text[0].upper() + text[1:] if text else 'Custom step.'
    if not sentence.endswith('.'):
        sentence += '.'
    return sentence


def split_steps(text: str, glossary: List[dict]) -> List[Dict[str, Any]]:
    source = compact(text)
    if not source:
        return []
    label_match = re.search(r'\b(?:steps?|sequence|section)\s*[:\-]\s*([\s\S]+)$', source, re.I)
    if label_match:
        source = compact(label_match.group(1))
    else:
        with_match = re.search(r'\b(?:dance|worksheet|section|part)\b.*?\bwith\b\s+(.+)$', source, re.I)
        if with_match:
            source = compact(with_match.group(1))
        else:
            verb_match = re.search(r'\b(?:add|insert|put in|put|use|write|make|build|create)\b\s+(.+)$', source, re.I)
            if verb_match:
                source = compact(verb_match.group(1))
    source = re.sub(r'\band then\b', ',', source, flags=re.I)
    source = re.sub(r'\bafter that\b', ',', source, flags=re.I)
    source = re.sub(r'\bthen\b', ',', source, flags=re.I)
    source = source.replace('|', ',')
    raw_tokens = [clean_token(part) for part in re.split(r'[\n;,]+', source) if clean_token(part)]
    glossary_map = {normalize(item.get('name')): item for item in glossary if isinstance(item, dict) and normalize(item.get('name'))}
    results: List[Dict[str, Any]] = []
    for token in raw_tokens:
      count = count_label_from_text(token)
      body = strip_count_label(token) or token
      if not body:
        continue
      matched = glossary_map.get(normalize(body))
      if matched:
        results.append({
          'name': truthy_text(matched.get('name')) or infer_step_name(body),
          'description': truthy_text(matched.get('description') or matched.get('desc')) or infer_step_description(body, count),
          'count': count or truthy_text(matched.get('counts') or matched.get('count')) or '1',
          'foot': truthy_text(matched.get('foot')),
          'fromGlossary': True,
        })
        continue
      if not looks_like_step(body) and len(raw_tokens) == 1:
        continue
      results.append({
        'name': infer_step_name(body),
        'description': infer_step_description(body, count),
        'count': count or '1',
        'foot': '',
        'fromGlossary': False,
      })
    return results


def needs_new_dance(text: str, dance_meta: Dict[str, str]) -> bool:
    lowered = compact(text).lower()
    if re.search(r'\b(new dance|new worksheet|fresh dance|fresh worksheet|start a dance|create a dance|build a dance)\b', lowered):
        return True
    if re.search(r'\b(make|create|build)\b.*\bdance\b', lowered):
        return True
    return not dance_meta.get('title') and bool(re.search(r'\b(\d{1,3}\s*counts?|\d\s*walls?|beginner|improver|intermediate|advanced)\b', lowered))


def build_follow_up(needs: List[str], meta: Dict[str, str], steps: List[Dict[str, Any]]) -> str:
    labels = {
        'title': 'dance name',
        'counts': 'counts',
        'walls': 'walls',
        'steps': 'step pattern',
    }
    readable = [labels.get(item, item) for item in needs]
    if len(readable) == 1:
        joined = readable[0]
    else:
        joined = ', '.join(readable[:-1]) + ' and ' + readable[-1]
    example_steps = ', '.join(step['name'] for step in steps[:3]) or 'vine right, vine left, rock back recover, coaster step'
    return (
        f"I can build that, but I still need the {joined}. "
        f"Send it like: Name: Midnight Run. Counts: 32. Walls: 4. Steps: {example_steps}."
    )


def plan_reply(meta: Dict[str, str], steps: List[Dict[str, Any]], section_name: str) -> str:
    bits: List[str] = [f"Done. I added {len(steps)} step{'s' if len(steps) != 1 else ''} to {section_name}."]
    if meta.get('title'):
        bits.append(f"Dance name set to {meta['title']}.")
    if meta.get('counts'):
        bits.append(f"Counts set to {meta['counts']}.")
    if meta.get('walls'):
        bits.append(f"Walls set to {meta['walls']}.")
    names = ', '.join(step['name'] for step in steps[:6])
    if names:
        bits.append(f"Added: {names}{', …' if len(steps) > 6 else '.'}")
    custom_count = sum(1 for step in steps if not step.get('fromGlossary'))
    if custom_count:
        bits.append(f"{custom_count} of those step{'s were' if custom_count != 1 else ' was'} added as custom worksheet step{'s' if custom_count != 1 else ''} rather than glossary matches.")
    return ' '.join(bits)


def main() -> None:
    payload = json.loads(sys.stdin.read() or '{}')
    prompt = truthy_text(payload.get('prompt'))
    history = payload.get('history') if isinstance(payload.get('history'), list) else []
    pending = payload.get('pending') if isinstance(payload.get('pending'), dict) else {}
    dance = payload.get('dance') if isinstance(payload.get('dance'), dict) else {}
    glossary = payload.get('approvedGlossary') if isinstance(payload.get('approvedGlossary'), list) else []

    dance_meta = current_meta(dance)
    pending_prompt = truthy_text(pending.get('prompt'))
    merged_prompt = compact(f"{pending_prompt} {prompt}") if pending_prompt else prompt
    pending_meta = pending.get('meta') if isinstance(pending.get('meta'), dict) else {}
    extracted_meta = extract_meta(merged_prompt, {})
    apply_meta = {k: v for k, v in {**pending_meta, **extracted_meta}.items() if truthy_text(v)}
    meta = {k: v for k, v in {**dance_meta, **pending_meta, **extracted_meta}.items() if truthy_text(v)}

    pending_steps = [step for step in pending.get('steps', []) if isinstance(step, dict)] if isinstance(pending.get('steps'), list) else []
    current_steps = split_steps(prompt, glossary) if looks_like_step(prompt) or bool(re.search(r'\b(add|insert|put|use|steps?|section|sequence)\b', prompt, re.I)) else []
    if pending_steps:
        steps = pending_steps + current_steps
    else:
        steps = split_steps(merged_prompt, glossary)

    create_new = needs_new_dance(merged_prompt, dance_meta)
    missing: List[str] = []
    if create_new and not truthy_text(meta.get('title')):
        missing.append('title')
    if create_new and not truthy_text(meta.get('counts')):
        missing.append('counts')
    if create_new and not truthy_text(meta.get('walls')):
        missing.append('walls')
    if not steps:
        missing.append('steps')

    wants_new_section = bool(re.search(r'\b(new section|add a section|another section|new part|add a part)\b', merged_prompt, re.I))
    section_name = 'Section 1'
    snapshot = (((dance or {}).get('snapshot') or {}).get('data') or {})
    sections = snapshot.get('sections') if isinstance(snapshot.get('sections'), list) else []
    if sections:
        section_name = f"Section {len(sections) + (1 if wants_new_section else 0)}" if wants_new_section else truthy_text((sections[-1] or {}).get('name')) or f"Section {len(sections)}"

    response: Dict[str, Any] = {
        'ok': True,
        'reply': '',
        'applyNow': False,
        'needsFollowUp': bool(missing),
        'missingFields': missing,
        'pending': None,
        'meta': apply_meta,
        'steps': steps,
        'resetDance': create_new,
        'createSection': wants_new_section,
    }

    if missing:
        response['reply'] = build_follow_up(missing, meta, steps)
        response['pending'] = {
            'type': 'worksheet-build',
            'prompt': merged_prompt,
            'meta': apply_meta,
            'steps': steps,
            'needs': missing,
        }
    else:
        response['applyNow'] = True
        response['reply'] = plan_reply(response['meta'], steps, section_name)

    sys.stdout.write(json.dumps(response))


if __name__ == '__main__':
    main()
