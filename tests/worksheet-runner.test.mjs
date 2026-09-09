import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { runWorksheetProcess } from '../backend/worksheet-runner.mjs';

test('the actual Python worksheet helper receives stdin and completes', async () => {
  const result = await runWorksheetProcess(fileURLToPath(new URL('../backend/ai_step_helper.py', import.meta.url)), {
    prompt:'Build a new dance. Name: Test Dance. Counts: 8. Walls: 4. Steps: vine right, vine left.',
    history:[], approvedGlossary:[], dance:{ expectedStartFoot:'R' }
  });
  assert.equal(typeof result, 'object');
  assert(result.reply);
  const steps = result.steps || result.pending?.steps;
  assert(steps?.length >= 2, JSON.stringify(result));
  assert.match(steps[0].description, /Right/);
  assert.match(steps[1].description, /Left/);
});
test('missing Python executable rejects without hanging', async () => {
  await assert.rejects(runWorksheetProcess('missing.py', {}, '/no-such-python'));
});
