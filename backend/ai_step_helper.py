#!/usr/bin/env python3
import json
import re
import sys
from copy import deepcopy
from hashlib import sha1
from typing import Any, Dict, List, Optional, Tuple

STEP_WORDS = {
    'step', 'steps', 'rock', 'recover', 'vine', 'grapevine', 'shuffle', 'triple', 'stomp', 'clap', 'kick', 'toe', 'heel', 'cross',
    'side', 'back', 'forward', 'turn', 'pivot', 'coaster', 'sailor', 'weave', 'mambo', 'swivel', 'skate', 'scuff', 'brush', 'hitch',
    'hop', 'touch', 'monterey', 'jazz', 'rumba', 'charleston', 'walk', 'lock', 'syncopated', 'drag', 'flick', 'hook', 'body roll',
    'sway', 'tap', 'point', 'boogie', 'chasse', 'ball', 'change', 'together', 'behind', 'forward', 'backward'
}
LEVELS = {'beginner': 'Beginner', 'improver': 'Improver', 'intermediate': 'Intermediate', 'advanced': 'Advanced'}
NUMBER_WORDS = {
    0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
    7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve'
}
WORD_TO_NUMBER = {word: number for number, word in NUMBER_WORDS.items()}
GENERIC_NAME_WORDS = {'', 'step', 'custom step', 'new step'}
DIRECTION_ALIASES = {
    'forward': 'forward', 'forwards': 'forward', 'fwd': 'forward', 'foward': 'forward',
    'back': 'back', 'backward': 'back', 'backwards': 'back', 'backwardd': 'back',
    'left': 'left', 'right': 'right', 'side': 'side'
}
RANDOM_GLOSSARY_RE = re.compile(r'\b(?:random(?:ly)?|any|whatever)\b.*\b(?:steps?|moves?|sequence|section|part)\b|\b(?:random(?:ly)?\s+put|pick|choose|give me)\b.*\b(?:steps?|moves?)\b', re.I)


def compact(value: Any) -> str:
    return re.sub(r'\s+', ' ', str(value or '')).strip()


def title_case(value: str) -> str:
    value = compact(value)
    if not value:
        return ''
    return re.sub(r'\b([a-z])', lambda m: m.group(1).upper(), value)


def normalize(value: Any) -> str:
    return re.sub(r'[^a-z0-9]+', ' ', compact(value).lower()).strip()


def truthy_text(value: Any) -> str:
    return compact(value)


def number_word(value: Any) -> str:
    try:
        num = int(str(value).strip())
    except Exception:
        return compact(value)
    return NUMBER_WORDS.get(num, str(num))


def replace_number_words(text: str) -> str:
    result = f' {compact(text).lower()} '
    for word, number in sorted(WORD_TO_NUMBER.items(), key=lambda item: len(item[0]), reverse=True):
        result = re.sub(rf'(?<![a-z]){re.escape(word)}(?![a-z])', str(number), result)
    return compact(result)


def normalize_motion_text(text: str) -> str:
    value = replace_number_words(text)
    for raw, fixed in DIRECTION_ALIASES.items():
        value = re.sub(rf'\b{re.escape(raw)}\b', fixed, value, flags=re.I)
    value = re.sub(r'\bto\s+the\s+side\b', 'side', value, flags=re.I)
    value = re.sub(r'\bwith\s+a\s+touch\b', 'with touch', value, flags=re.I)
    return compact(value)


def flip_foot(value: str) -> str:
    raw = truthy_text(value).upper()
    if raw == 'R':
        return 'L'
    if raw == 'L':
        return 'R'
    return ''


def count_range_label(start: int, total: int) -> str:
    if total <= 1:
        return str(start)
    return f'{start}-{start + total - 1}'


def parse_count_span(label: str) -> int:
    text = compact(label)
    if not text:
        return 1
    nums = [int(n) for n in re.findall(r'\d+', text)]
    if nums:
        if '&' in text:
            return max(1, nums[-1] - nums[0] + 1)
        if '-' in text:
            return max(1, nums[-1] - nums[0] + 1)
        if len(nums) == 1:
            return 1
        return max(1, nums[-1] - nums[0] + 1)
    return 1


def current_meta(dance: Optional[dict]) -> Dict[str, str]:
    data = (((dance or {}).get('snapshot') or {}).get('data') or {})
    meta = data.get('meta') if isinstance(data.get('meta'), dict) else {}
    result: Dict[str, str] = {}
    for key in ('title', 'counts', 'walls', 'level', 'type', 'startFoot'):
        value = truthy_text(meta.get(key))
        if value:
            result[key] = value
    return result


def expected_start_foot(dance: Optional[dict]) -> str:
    data = (((dance or {}).get('snapshot') or {}).get('data') or {})
    sections = data.get('sections') if isinstance(data.get('sections'), list) else []
    last_weight_foot = ''
    for section in sections:
        steps = section.get('steps') if isinstance(section, dict) and isinstance(section.get('steps'), list) else []
        for step in steps:
            if not isinstance(step, dict):
                continue
            if step.get('weight') is False:
                continue
            foot = truthy_text(step.get('foot')).upper()
            if foot in {'R', 'L'}:
                last_weight_foot = foot
    if last_weight_foot:
        return flip_foot(last_weight_foot)
    raw_start = truthy_text((((dance or {}).get('snapshot') or {}).get('data') or {}).get('meta', {}).get('startFoot')).lower()
    if raw_start == 'left':
        return 'L'
    if raw_start == 'right':
        return 'R'
    return ''


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


def extract_number_after(patterns: List[str], text: str) -> str:
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return match.group(1)
    return ''


def extract_meta(text: str, existing: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    meta = dict(existing or {})
    text = normalize_motion_text(text)
    title = extract_title(text)
    if title:
        meta['title'] = title
    count_value = extract_number_after([r'\b(\d{1,3})\s*counts?\b', r'\bcounts?\s*[:=-]\s*(\d{1,3})\b'], text)
    if count_value:
        meta['counts'] = count_value
    walls_value = extract_number_after([r'\b(\d{1,2})\s*walls?\b', r'\bwalls?\s*[:=-]\s*(\d{1,2})\b'], text)
    if walls_value:
        meta['walls'] = walls_value
        meta['type'] = f"{meta['walls']}-Wall"
    for raw, pretty in LEVELS.items():
        if re.search(rf'\b{re.escape(raw)}\b', text, re.I):
            meta['level'] = pretty
            break
    return meta


def count_label_from_text(text: str) -> str:
    text = compact(text)
    patterns = [
        r'\bcounts?\s*[:=-]\s*([0-9][^\n.,;]*)',
        r'\b(?:use|put|set|on)\s+counts?\s*([0-9][^\n.,;]*)',
        r'\b((?:\d+\s*[&,-]\s*)+\d+)\b',
        r'\b(\d+\s*&\s*\d+)\b',
        r'\(([^)]*\d[^)]*)\)\s*$',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            value = compact(match.group(1).replace(' to ', '-'))
            value = re.sub(r'\bcounts?\b', '', value, flags=re.I).strip(' .,:;-')
            if re.search(r'\d', value):
                return value
    return ''


def strip_count_label(text: str) -> str:
    text = compact(text)
    text = re.sub(r'\bcounts?\s*[:=-]\s*[^\n]+$', '', text, flags=re.I).strip()
    text = re.sub(r'\(([^)]*\d[^)]*)\)\s*$', '', text).strip()
    text = re.sub(r'\b((?:\d+\s*[&,-]\s*)+\d+)\b\s*$', '', text).strip()
    text = re.sub(r'\b(?:use|put|set|on)\s+counts?\b\s*$', '', text, flags=re.I).strip()
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


def extract_explicit_step_name(text: str) -> str:
    patterns = [
        r'\b(?:step called|step named|name the step|call the step)\s+["“]?([^"”\n,.!?]+)',
        r'\b(?:custom step called|custom step named)\s+["“]?([^"”\n,.!?]+)',
        r'\bstep name\s*[:=-]\s*["“]?([^"”\n]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return title_case(match.group(1))
    return ''


def parse_repeated_walk(body: str) -> Optional[Dict[str, Any]]:
    text = normalize_motion_text(body)
    patterns = [
        r'^walk\s*(?:x\s*)?(\d+)\s*(?:times?)?\s*(forward|back|left|right|side)?(?:\s+with\s+touch)?$',
        r'^walk\s+(\d+)\s*(?:times?)?\s*(forward|back|left|right|side)?(?:\s+with\s+touch)?$',
        r'^walk\s+(forward|back|left|right|side)\s+(\d+)\s*(?:times?)?(?:\s+with\s+touch)?$',
        r'^(\d+)\s+walks?\s+(forward|back|left|right|side)(?:\s+with\s+touch)?$',
    ]
    for pattern in patterns:
        match = re.match(pattern, text, re.I)
        if not match:
            continue
        groups = match.groups()
        if groups[0].isdigit():
            repeats = int(groups[0])
            direction = compact(groups[1] or '') or 'forward'
        else:
            direction = compact(groups[0] or '') or 'forward'
            repeats = int(groups[1])
        touch = bool(re.search(r'\bwith\s+touch\b', text, re.I))
        if repeats > 0:
            return {'repeats': repeats, 'direction': direction, 'touch': touch}
    walk_touch = re.match(r'^walk\s*x\s*(\d+)\s+with\s+touch$', text, re.I)
    if walk_touch:
        return {'repeats': int(walk_touch.group(1)), 'direction': 'forward', 'touch': True}
    return None


def infer_count_from_body(body: str) -> str:
    lowered = normalize_motion_text(body)
    repeated_walk = parse_repeated_walk(lowered)
    if repeated_walk:
        base = int(repeated_walk['repeats'])
        return count_range_label(1, base + (1 if repeated_walk['touch'] else 0))
    if re.search(r'\b(?:grapevine|vine)\b', lowered):
        return '1-4'
    if re.search(r'rock\s+back(?:,|\s+)recover', lowered):
        return '1-2'
    if re.search(r'\b(?:coaster|sailor|shuffle|triple step|triple|chasse|kick ball change|mambo)\b', lowered):
        return '1&2'
    if re.search(r'\b(?:jazz box|rumba box|monterey|charleston)\b', lowered):
        return '1-4'
    if re.search(r'\b(?:step touch|side touch|touch side|heel touch|toe touch|tap touch|step tap|pivot)\b', lowered):
        return '1-2'
    return ''


def infer_step_name(body: str, explicit_name: str = '') -> Tuple[str, bool]:
    if explicit_name:
        return title_case(explicit_name), True
    body = normalize_motion_text(body)
    lowered = body.lower()
    if not body:
        return '', False
    repeated_walk = parse_repeated_walk(body)
    if repeated_walk:
        direction = repeated_walk['direction'].title() if repeated_walk['direction'] != 'side' else 'Side'
        suffix = ' with a Touch' if repeated_walk['touch'] else ''
        return f"Walk {direction} x{repeated_walk['repeats']}{suffix}", True
    patterns = [
        (r'^(?:grapevine|vine)\s+(right|left)$', lambda m: (f"Grapevine {m.group(1).title()}", True)),
        (r'^rock\s+back(?:,|\s+)recover$', lambda m: ('Rock Back Recover', True)),
        (r'^coaster(?:\s+step)?$', lambda m: ('Coaster Step', True)),
        (r'^sailor(?:\s+step)?$', lambda m: ('Sailor Step', True)),
        (r'^jazz\s+box$', lambda m: ('Jazz Box', True)),
        (r'^rumba\s+box$', lambda m: ('Rumba Box', True)),
        (r'^kick\s+ball\s+change$', lambda m: ('Kick Ball Change', True)),
        (r'^step\s+touch$', lambda m: ('Step Touch', True)),
        (r'^side\s+touch$', lambda m: ('Side Touch', True)),
        (r'^step\s+lock\s+step$', lambda m: ('Step Lock Step', True)),
        (r'^shuffle\s+(forward|back|left|right)$', lambda m: (f"Shuffle {m.group(1).title()}", True)),
        (r'^pivot(?:\s+\d+)?(?:\s*(?:1/4|1/2|1/8|quarter|half))?\s*(left|right)?$', lambda m: ('Pivot Turn', True)),
    ]
    for pattern, builder in patterns:
        match = re.match(pattern, lowered, re.I)
        if match:
            return builder(match)
    if len(body.split()) <= 6 and looks_like_step(body):
        name = title_case(body)
        name = re.sub(r'\bX(\d+)\b', r'x\1', name)
        return name, True
    if len(body.split()) <= 9 and looks_like_step(body):
        return title_case(' '.join(body.split()[:6])), False
    return '', False


def build_walk_step_sequence(repeats: int, direction: str, start_foot: str = '') -> str:
    actual_direction = {
        'forward': 'forward',
        'back': 'back',
        'left': 'left',
        'right': 'right',
        'side': 'side'
    }.get(direction, 'forward')
    parts: List[str] = []
    for index in range(repeats):
        if start_foot in {'R', 'L'}:
            foot = start_foot if index % 2 == 0 else flip_foot(start_foot)
            foot_label = 'right' if foot == 'R' else 'left'
        else:
            foot_label = 'right/left' if index % 2 == 0 else 'left/right'
        if actual_direction == 'side':
            parts.append(f"step {foot_label} to the side")
        elif actual_direction == 'left':
            parts.append(f"step {foot_label} left")
        elif actual_direction == 'right':
            parts.append(f"step {foot_label} right")
        elif actual_direction == 'back':
            parts.append(f"step {foot_label} back")
        else:
            parts.append(f"step {foot_label} forward")
    return ', '.join(parts)


def phrase_to_instruction(phrase: str, start_foot: str = '') -> str:
    text = normalize_motion_text(phrase).strip(' .')
    lowered = text.lower()
    if not text:
        return ''
    repeated_walk = parse_repeated_walk(text)
    if repeated_walk:
        sequence = build_walk_step_sequence(repeated_walk['repeats'], repeated_walk['direction'], start_foot)
        if repeated_walk['touch']:
            return f"{sequence}, then touch beside with no weight change"
        return sequence
    if lowered in {'touch', 'tap'}:
        return 'finish with a touch and no weight change'
    if lowered == 'rock back recover':
        return 'rock back onto the stepping foot and recover back onto the other foot'
    if lowered in {'coaster', 'coaster step'}:
        return 'step back, step together, then step forward'
    if lowered in {'sailor', 'sailor step'}:
        return 'cross behind, step to the side, then recover onto the other foot'
    if lowered == 'jazz box':
        return 'cross over, step back, step to the side, then step forward'
    if lowered == 'rumba box':
        return 'step to the side, close, step forward, hold or touch to finish'
    if lowered == 'kick ball change':
        return 'kick, step onto the ball of the foot, then change weight back'
    if re.match(r'(?:grapevine|vine)\s+(right|left)$', lowered):
        direction = re.match(r'(?:grapevine|vine)\s+(right|left)$', lowered).group(1)
        return f"step {direction}, cross behind, step {direction}, then touch to finish"
    if lowered in {'step touch', 'side touch'}:
        start = 'step to the side' if lowered == 'side touch' else 'step'
        return f"{start}, then touch beside with no weight"
    if lowered == 'step lock step':
        return 'step forward, lock the free foot in behind, then step forward again'
    if re.match(r'shuffle\s+(forward|back|left|right)$', lowered):
        direction = re.match(r'shuffle\s+(forward|back|left|right)$', lowered).group(1)
        return f"shuffle {direction} with quick triple-step timing"
    if re.match(r'pivot(?:\s+\d+)?(?:\s*(?:1/4|1/2|1/8|quarter|half))?\s*(left|right)?$', lowered):
        direction = re.match(r'pivot(?:\s+\d+)?(?:\s*(?:1/4|1/2|1/8|quarter|half))?\s*(left|right)?$', lowered).group(1) or 'the stated direction'
        return f"step forward and pivot {direction} before recovering your weight"
    text = re.sub(r'\bx\s*(\d+)\b', lambda m: f" {number_word(m.group(1))} times", text, flags=re.I)
    text = re.sub(r'\btouch\b', 'touch with no weight', text, flags=re.I)
    text = re.sub(r'\bbrush\b', 'brush the foot forward', text, flags=re.I)
    text = re.sub(r'\bscuff\b', 'scuff the heel forward', text, flags=re.I)
    return compact(text)


def infer_step_description(body: str, count: str, start_foot: str = '') -> str:
    text = normalize_motion_text(body)
    lowered = text.lower()
    repeated_walk = parse_repeated_walk(text)
    if repeated_walk:
        sentence = build_walk_step_sequence(repeated_walk['repeats'], repeated_walk['direction'], start_foot)
        sentence = sentence[0].upper() + sentence[1:]
        if repeated_walk['touch']:
            return f"{sentence}, then touch beside with no weight change."
        return f"{sentence}."
    if 'rock back recover' in lowered or 'rock back, recover' in lowered:
        return 'Rock back onto the stepping foot and recover back onto the other foot.'
    if re.search(r'\b(?:grapevine|vine)\b', lowered):
        direction = 'right' if 'right' in lowered else ('left' if 'left' in lowered else 'to the side')
        return f"Step {direction}, cross behind, step {direction}, then touch or step to finish."
    if 'coaster' in lowered:
        return 'Step back, step together, then step forward.'
    if 'sailor' in lowered:
        return 'Cross behind, step to the side, then recover onto the other foot.'
    if 'jazz box' in lowered:
        return 'Cross over, step back, step to the side, then step forward.'
    if 'rumba box' in lowered:
        return 'Step to the side, close, step forward, then hold or touch to finish.'
    if 'kick ball change' in lowered:
        return 'Kick, step onto the ball of the foot, then change weight back.'
    if 'pivot' in lowered:
        return 'Step forward and pivot the stated amount before recovering your weight.'
    if re.search(r'\b(?:step touch|side touch)\b', lowered):
        return 'Step, then touch beside with no weight change.'
    phrases = [compact(part) for part in re.split(r'\bwith\b|,|\band\b', text, flags=re.I) if compact(part)]
    if len(phrases) > 1:
        instructions = [phrase_to_instruction(part, start_foot) for part in phrases if phrase_to_instruction(part, start_foot)]
        if instructions:
            sentence = ', then '.join(instructions)
            sentence = sentence[0].upper() + sentence[1:]
            if not sentence.endswith('.'):
                sentence += '.'
            return sentence
    sentence = phrase_to_instruction(text, start_foot)
    sentence = sentence[0].upper() + sentence[1:] if sentence else 'Custom step.'
    if not sentence.endswith('.'):
        sentence += '.'
    return sentence


def weight_change_count(body: str, count_label: str = '') -> int:
    text = normalize_motion_text(body)
    repeated_walk = parse_repeated_walk(text)
    if repeated_walk:
        return int(repeated_walk['repeats'])
    if re.search(r'rock\s+back(?:,|\s+)recover', text):
        return 2
    if re.search(r'\b(?:coaster|sailor|shuffle|triple step|triple|chasse|kick ball change|mambo)\b', text):
        return 3
    if re.search(r'\b(?:grapevine|vine|jazz box|rumba box|monterey|charleston)\b', text):
        return 4
    if re.search(r'\b(?:step touch|side touch|touch side|heel touch|toe touch|tap touch)\b', text):
        return 1
    if re.search(r'\bpivot\b', text):
        return 2
    return max(1, parse_count_span(count_label))


def estimate_next_expected_foot(current_start: str, body: str, count_label: str = '') -> str:
    if current_start not in {'R', 'L'}:
        return ''
    changes = weight_change_count(body, count_label)
    return flip_foot(current_start) if changes % 2 == 1 else current_start


def glossary_step_from_item(item: dict, source: str = '', fallback_start_foot: str = '') -> Dict[str, Any]:
    count = truthy_text(item.get('counts') or item.get('count')) or '1'
    foot = truthy_text(item.get('foot')).upper()
    foot = foot if foot in {'R', 'L'} else fallback_start_foot
    return {
        'name': truthy_text(item.get('name')) or infer_step_name(source or truthy_text(item.get('name')))[0] or 'Custom Step',
        'description': truthy_text(item.get('description') or item.get('desc')) or infer_step_description(source or truthy_text(item.get('name')), count, foot),
        'count': count,
        'foot': foot,
        'fromGlossary': True,
        'source': source or truthy_text(item.get('name')),
        'needsName': False,
        'needsCount': False,
    }


def glossary_similarity(body: str, item: dict) -> float:
    target = normalize(body)
    name = normalize(item.get('name'))
    if not target or not name:
        return 0.0
    if target == name:
        return 1.0
    if target in name or name in target:
        return 0.92
    target_words = set(target.split())
    name_words = set(name.split())
    overlap = len(target_words & name_words)
    if not overlap:
        return 0.0
    return overlap / max(len(target_words), len(name_words))


def best_glossary_match(body: str, glossary: List[dict], current_start: str = '') -> Optional[dict]:
    best_item = None
    best_score = 0.0
    for item in glossary:
        if not isinstance(item, dict):
            continue
        score = glossary_similarity(body, item)
        if score <= 0.72:
            continue
        foot = truthy_text(item.get('foot')).upper()
        if current_start in {'R', 'L'}:
            if foot == current_start:
                score += 0.08
            elif foot and foot != current_start:
                score -= 0.05
        if score > best_score:
            best_score = score
            best_item = item
    return best_item


def random_request_target_counts(prompt: str, dance_meta: Dict[str, str]) -> int:
    normalized = normalize_motion_text(prompt)
    match = re.search(r'\b(\d{1,3})\s*counts?\b', normalized, re.I)
    if match:
        return max(2, int(match.group(1)))
    existing = truthy_text(dance_meta.get('counts'))
    if existing.isdigit():
        return min(16, max(2, int(existing)))
    return 8


def random_request_target_steps(prompt: str) -> int:
    normalized = normalize_motion_text(prompt)
    match = re.search(r'\b(\d{1,2})\s*(?:steps?|moves?)\b', normalized, re.I)
    if match:
        return max(1, min(8, int(match.group(1))))
    return 0


def deterministic_noise(seed: str) -> float:
    digest = sha1(seed.encode('utf-8')).hexdigest()
    return (int(digest[:8], 16) % 1000) / 1000.0


def build_random_glossary_sequence(prompt: str, glossary: List[dict], dance: Optional[dict], dance_meta: Dict[str, str]) -> List[Dict[str, Any]]:
    pool = [item for item in glossary if isinstance(item, dict) and truthy_text(item.get('name'))]
    if not pool:
        return []
    remaining = random_request_target_counts(prompt, dance_meta)
    target_steps = random_request_target_steps(prompt)
    current_start = expected_start_foot(dance)
    results: List[Dict[str, Any]] = []
    prev_name = ''
    guard = 0
    while pool and remaining > 0 and guard < 12 and (not target_steps or len(results) < target_steps):
        guard += 1
        scored: List[Tuple[float, dict]] = []
        for item in pool:
            name = truthy_text(item.get('name'))
            count_label = truthy_text(item.get('counts') or item.get('count')) or '1'
            span = parse_count_span(count_label)
            foot = truthy_text(item.get('foot')).upper()
            score = 0.0
            if span <= remaining:
                score += 3.0
            else:
                score -= (span - remaining) * 2.2
            if current_start in {'R', 'L'}:
                if foot == current_start:
                    score += 3.0
                elif foot in {'R', 'L'} and foot != current_start:
                    score -= 1.4
                else:
                    score += 1.5
            elif foot in {'R', 'L'}:
                score += 0.5
            else:
                score += 1.0
            if normalize(name) == normalize(prev_name):
                score -= 3.5
            score += deterministic_noise(f"{prompt}|{name}|{len(results)}")
            scored.append((score, item))
        scored.sort(key=lambda pair: pair[0], reverse=True)
        if not scored:
            break
        best = scored[0][1]
        step = glossary_step_from_item(best, truthy_text(best.get('name')), current_start)
        results.append(step)
        prev_name = step['name']
        span = parse_count_span(step['count'])
        remaining = max(0, remaining - span)
        start_for_item = step['foot'] or current_start
        current_start = estimate_next_expected_foot(start_for_item, step['source'], step['count']) if start_for_item else ''
        if target_steps and len(results) >= target_steps:
            break
        if not target_steps and remaining <= 0:
            break
    return results


def split_steps(text: str, glossary: List[dict], dance: Optional[dict] = None, dance_meta: Optional[Dict[str, str]] = None) -> List[Dict[str, Any]]:
    source = compact(text)
    if not source:
        return []
    if RANDOM_GLOSSARY_RE.search(source):
        return build_random_glossary_sequence(source, glossary, dance, dance_meta or {})
    explicit_step_name = extract_explicit_step_name(source)
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
    single_token = len(raw_tokens) == 1
    current_start = expected_start_foot(dance)
    for token in raw_tokens:
        explicit_count = count_label_from_text(token)
        body = strip_count_label(token) or token
        if not body:
            continue
        matched = glossary_map.get(normalize(body))
        if not matched:
            matched = best_glossary_match(body, glossary, current_start)
        if matched:
            step = glossary_step_from_item(matched, body, current_start)
            step['count'] = explicit_count or step['count'] or infer_count_from_body(body) or '1'
            results.append(step)
            start_for_item = step['foot'] or current_start
            current_start = estimate_next_expected_foot(start_for_item, step['source'], step['count']) if start_for_item else current_start
            continue
        if not looks_like_step(body) and single_token:
            continue
        inferred_name, confident_name = infer_step_name(body, explicit_step_name if single_token else '')
        inferred_count = explicit_count or infer_count_from_body(body)
        needs_name = single_token and normalize(inferred_name) in GENERIC_NAME_WORDS
        if single_token and not confident_name and not inferred_name and looks_like_step(body):
            needs_name = True
        needs_count = single_token and not inferred_count
        fallback_name = title_case(' '.join(body.split()[:6])) if not needs_name else ''
        step_name = inferred_name or fallback_name
        foot = current_start if current_start in {'R', 'L'} else ''
        results.append({
            'name': step_name,
            'description': infer_step_description(body, inferred_count, foot),
            'count': inferred_count,
            'foot': foot,
            'fromGlossary': False,
            'source': body,
            'needsName': needs_name,
            'needsCount': needs_count,
        })
        if current_start in {'R', 'L'}:
            current_start = estimate_next_expected_foot(current_start, body, inferred_count)
    return results


def apply_follow_up_to_pending_steps(steps: List[Dict[str, Any]], prompt: str, dance: Optional[dict] = None) -> List[Dict[str, Any]]:
    updated = deepcopy(steps or [])
    if len(updated) != 1:
        return updated
    step = updated[0]
    explicit_name = extract_explicit_step_name(prompt)
    explicit_count = count_label_from_text(prompt)
    source = truthy_text(step.get('source')) or truthy_text(step.get('name')) or truthy_text(prompt)
    fallback_start = expected_start_foot(dance)
    if explicit_name:
        step['name'] = title_case(explicit_name)
        step['needsName'] = False
    elif step.get('needsName') and compact(prompt) and not re.search(r'\b(count|wall|dance|title|level|step pattern|steps?)\b', prompt, re.I):
        candidate = compact(re.sub(r'^(?:call it|name it|step name\s*[:=-])\s*', '', prompt, flags=re.I))
        if candidate and len(candidate.split()) <= 6:
            step['name'] = title_case(candidate)
            step['needsName'] = False
    if explicit_count:
        step['count'] = explicit_count
        step['needsCount'] = False
    elif step.get('needsCount'):
        inferred = infer_count_from_body(source)
        if inferred:
            step['count'] = inferred
            step['needsCount'] = False
    if normalize(step.get('name')) in GENERIC_NAME_WORDS:
        inferred_name, confident = infer_step_name(source)
        if inferred_name:
            step['name'] = inferred_name
            step['needsName'] = not confident and step.get('needsName', False)
    step['description'] = infer_step_description(source, truthy_text(step.get('count')), truthy_text(step.get('foot')).upper() or fallback_start)
    return updated


def needs_new_dance(text: str, dance_meta: Dict[str, str]) -> bool:
    lowered = compact(text).lower()
    if re.search(r'\b(new dance|new worksheet|fresh dance|fresh worksheet|start a dance|create a dance|build a dance)\b', lowered):
        return True
    if re.search(r'\b(make|create|build)\b.*\bdance\b', lowered):
        return True
    if re.search(r'\b(?:called|named|titled|title it|name it|call it)\b', lowered) and not dance_meta.get('title'):
        return True
    return False


def build_follow_up(needs: List[str], steps: List[Dict[str, Any]]) -> str:
    labels = {
        'title': 'dance name',
        'counts': 'counts',
        'walls': 'walls',
        'steps': 'step pattern',
        'step_name': 'step name',
        'step_count': 'step counts',
    }
    readable = [labels.get(item, item) for item in needs]
    if len(readable) == 1:
        joined = readable[0]
    else:
        joined = ', '.join(readable[:-1]) + ' and ' + readable[-1]
    example_steps = ', '.join(step.get('name') or 'Custom Step' for step in steps[:3]) or 'vine right, vine left, rock back recover, coaster step'
    return f"I can build that, but I still need the {joined}. Send it like: Name: Midnight Run. Counts: 32. Walls: 4. Steps: {example_steps}."


def plan_reply(meta: Dict[str, str], steps: List[Dict[str, Any]], section_name: str) -> str:
    bits: List[str] = [f"Done. I added {len(steps)} step{'s' if len(steps) != 1 else ''} to {section_name}."]
    if meta.get('title'):
        bits.append(f"Dance name set to {meta['title']}.")
    if meta.get('counts'):
        bits.append(f"Counts set to {meta['counts']}.")
    if meta.get('walls'):
        bits.append(f"Walls set to {meta['walls']}.")
    names = ', '.join(step['name'] for step in steps[:6] if truthy_text(step.get('name')))
    if names:
        bits.append(f"Added: {names}{', …' if len(steps) > 6 else '.'}")
    custom_count = sum(1 for step in steps if not step.get('fromGlossary'))
    if custom_count:
        bits.append(f"{custom_count} of those step{'s were' if custom_count != 1 else ' was'} added as custom worksheet step{'s' if custom_count != 1 else ''} rather than glossary matches.")
    return ' '.join(bits)


def main() -> None:
    payload = json.loads(sys.stdin.read() or '{}')
    prompt = truthy_text(payload.get('prompt'))
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
    current_steps = split_steps(prompt, glossary, dance, meta) if looks_like_step(prompt) or RANDOM_GLOSSARY_RE.search(prompt) or bool(re.search(r'\b(add|insert|put|use|steps?|section|sequence|random(?:ly)?)\b', prompt, re.I)) else []
    if pending_steps:
        steps = apply_follow_up_to_pending_steps(pending_steps, prompt, dance)
        if current_steps:
            steps.extend(current_steps)
    else:
        steps = split_steps(merged_prompt, glossary, dance, meta)

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
    if len(steps) == 1 and not steps[0].get('fromGlossary'):
        if steps[0].get('needsName'):
            missing.append('step_name')
        if steps[0].get('needsCount'):
            missing.append('step_count')

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
        response['reply'] = build_follow_up(missing, steps)
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
