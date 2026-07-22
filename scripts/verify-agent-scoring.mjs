#!/usr/bin/env node
// Verify the config-driven scoring engine against the original hand-written
// rule in src/data/assessment.ts, across the ENTIRE answer space (5^5 = 3125
// combinations). Both the archetype and the mindset-gap flag must match on
// every single one.
//
// Why this exists: moving scoring into the Studio made the rule editable, and
// an editable scoring rule ships with no test gate. This is the gate for the
// one case that must never regress — the compiled default. It does not (and
// cannot) validate a rule an editor later changes in Sanity; it validates that
// the engine faithfully reproduces the baseline it replaced.
//
// Usage: npm run verify:scoring

import { score, QUESTIONS } from '../src/data/assessment.ts';
import { fallbackConfig } from '../workers/api/src/lib/agentConfig.ts';
import { scoreFlow } from '../workers/api/src/lib/agentScoring.ts';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const flow = fallbackConfig().flows[0];
const stepIds = QUESTIONS.map((q) => q.id);

let checked = 0;
const failures = [];

for (const a of LETTERS)
  for (const b of LETTERS)
    for (const c of LETTERS)
      for (const d of LETTERS)
        for (const e of LETTERS) {
          const tuple = [a, b, c, d, e];
          const expected = score(tuple);
          const answers = Object.fromEntries(stepIds.map((id, i) => [id, tuple[i]]));
          const actual = scoreFlow(flow, answers);
          checked++;

          if (!actual) {
            failures.push({ tuple: tuple.join(''), reason: 'engine returned null' });
            continue;
          }
          if (actual.final.key !== expected.final) {
            failures.push({
              tuple: tuple.join(''),
              reason: `final: expected ${expected.final}, got ${actual.final.key}`,
            });
          }
          if (actual.raw.key !== expected.raw) {
            failures.push({
              tuple: tuple.join(''),
              reason: `raw: expected ${expected.raw}, got ${actual.raw.key}`,
            });
          }
          if (actual.gap !== expected.mindsetGap) {
            failures.push({
              tuple: tuple.join(''),
              reason: `mindsetGap: expected ${expected.mindsetGap}, got ${actual.gap}`,
            });
          }
        }

console.log(`Checked ${checked} answer combinations against src/data/assessment.ts`);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} mismatch(es):\n`);
  for (const f of failures.slice(0, 20)) console.error(`  ${f.tuple}  ${f.reason}`);
  if (failures.length > 20) console.error(`  … and ${failures.length - 20} more`);
  process.exit(1);
}

console.log('✓ Config-driven scoring matches the compiled rule on every combination.');
