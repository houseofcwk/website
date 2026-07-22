#!/usr/bin/env node
// Seed the Sanity dataset with the agent config (App / Journeys / Tools) that
// the worker currently compiles in as its fallback.
//
// The point is that the Studio opens on the copy that is ALREADY live, not on
// empty forms — an editor's first act is a tweak, not a transcription. The
// content comes from workers/api/src/lib/agentConfig.ts → fallbackConfig(),
// which is itself derived from src/data/assessment.ts, so seeding cannot drift
// from what the worker serves when Sanity is unreachable.
//
// Safety:
//   - Default mode is DRY-RUN. Real writes only with --apply.
//   - Deterministic _id per doc, so repeated runs replace, never duplicate.
//   - --apply uses createOrReplace: it OVERWRITES any edits already made in the
//     Studio for these three documents. Re-seed only to reset to the compiled
//     baseline.
//   - Write token never logged.
//
// Usage:
//   node scripts/seed-agent-config.mjs                                  # dry run
//   SANITY_WRITE_TOKEN=sk... node scripts/seed-agent-config.mjs --apply # write

import { createClient } from '@sanity/client';
import { fallbackConfig } from '../workers/api/src/lib/agentConfig.ts';

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID ?? '3fsa3jok';
const DATASET = process.env.PUBLIC_SANITY_DATASET ?? 'production';
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const APPLY = process.argv.includes('--apply');

if (APPLY && !TOKEN) {
  console.error('SANITY_WRITE_TOKEN env var is required for --apply.');
  console.error('Generate at https://www.sanity.io/manage/project/3fsa3jok/api → Tokens (role: Editor).');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-10-01',
  token: TOKEN,
  useCdn: false,
});

// ─── Runtime shape → Sanity document shape ──────────────────────────────────
// Array members need a stable _key; named object types need an explicit _type.
// Keys are derived from content (step id, archetype key) rather than generated,
// so a re-seed does not churn every array item in the document history.

const keyed = (items, keyOf) => items.map((item, i) => ({ _key: keyOf(item, i), ...item }));

// ⚠️ Document _ids must NOT contain a dot. Sanity reads `prefix.id` as a
// non-published variant of `id` (the same mechanism behind `drafts.` and
// `versions.`), and anonymous reads only see published documents. A dotted id
// writes and reads back fine with a token, then is invisible to the worker —
// which reads the CDN anonymously. Hyphens only.
const docId = (prefix, name) => `${prefix}-${name.replace(/[^a-z0-9]+/gi, '-')}`;

function toFlowDoc(flow) {
  return {
    _id: docId('agentFlow', flow.key),
    _type: 'agentFlow',
    key: flow.key,
    title: flow.title,
    enabled: flow.enabled,
    intents: flow.intents,
    webhookPath: flow.webhookPath,
    intro: flow.intro,
    steps: keyed(
      flow.steps.map((s) => ({
        _type: 'agentStep',
        id: s.id,
        pillarLabel: s.pillarLabel,
        prompt: s.prompt,
        role: s.role,
        options: keyed(
          s.options.map((o) => ({ _type: 'agentOption', letter: o.letter, text: o.text })),
          (o) => `opt-${o.letter}`,
        ),
      })),
      (s) => `step-${s.id}`,
    ),
    archetypes: keyed(
      flow.archetypes.map((a) => ({ _type: 'agentArchetype', ...a })),
      (a) => `arch-${a.key}`,
    ),
    resultTitleTemplate: flow.resultTitleTemplate,
    resultTemplate: flow.resultTemplate,
    cta: flow.cta ? { _type: 'ctaButton', ...flow.cta } : undefined,
    scoring: { _type: 'agentScoring', ...flow.scoring },
    optIn: flow.optIn,
    messages: flow.messages,
    email: flow.email,
    contextTemplate: flow.contextTemplate,
    memoryKey: flow.memoryKey,
  };
}

function toToolDoc(tool) {
  return {
    _id: docId('agentTool', tool.name),
    _type: 'agentTool',
    name: tool.name,
    enabled: tool.enabled,
    description: tool.description,
    inputs: keyed(
      tool.inputs.map((i) => ({ _type: 'agentToolInput', ...i })),
      (i) => `in-${i.key}`,
    ),
    handler: tool.handler,
    flowKey: tool.flowKey,
    responseTemplate: tool.responseTemplate,
    notTakenResponse: tool.notTakenResponse,
    unidentifiedResponse: tool.unidentifiedResponse,
  };
}

function toAppDoc(app) {
  return { _id: 'agentApp', _type: 'agentApp', ...app };
}

// ─── Run ────────────────────────────────────────────────────────────────────

const cfg = fallbackConfig();
const docs = [
  toAppDoc(cfg.app),
  ...cfg.flows.map(toFlowDoc),
  ...cfg.tools.map(toToolDoc),
];

console.log(`Project ${PROJECT_ID} · dataset ${DATASET}`);
console.log(`${docs.length} documents to seed:\n`);
for (const doc of docs) {
  const detail =
    doc._type === 'agentFlow'
      ? `${doc.steps.length} steps, ${doc.archetypes.length} archetypes, ${doc.intents.length} intents`
      : doc._type === 'agentTool'
        ? `${doc.inputs.length} args, handler=${doc.handler}`
        : `scopes: ${doc.scopes.join(', ')}`;
  console.log(`  ${doc._type.padEnd(10)} ${doc._id.padEnd(34)} ${detail}`);
}

if (!APPLY) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply to seed.');
  process.exit(0);
}

const tx = client.transaction();
for (const doc of docs) tx.createOrReplace(doc);
const res = await tx.commit({ returnDocuments: false });

// Verify by reading back ANONYMOUSLY — the same unauthenticated CDN path the
// worker uses. An authenticated readback is not a valid check: it sees drafts
// and non-published variants that the worker never will, so it reports success
// on documents the agent cannot actually load.
const acked = new Set((res?.results ?? []).map((r) => r.id));
const anonQuery = `*[_id in [${docs.map((d) => JSON.stringify(d._id)).join(',')}]]._id`;
const anonRes = await fetch(
  `https://${PROJECT_ID}.api.sanity.io/v2024-10-01/data/query/${DATASET}?query=${encodeURIComponent(anonQuery)}`,
).then((r) => r.json());
const visible = anonRes.result ?? [];
const missing = docs.filter((d) => !visible.includes(d._id));

if (missing.length > 0) {
  console.error('\n✗ Seed incomplete — documents are not publicly readable.');
  console.error(`  Acknowledged by commit:   ${acked.size}/${docs.length}`);
  console.error(`  Visible to anonymous CDN: ${visible.length}/${docs.length}`);
  console.error(`  Missing: ${missing.map((d) => d._id).join(', ')}`);
  console.error('  A dot in an _id will do this — Sanity hides `prefix.id` from public reads.');
  process.exit(1);
}
console.log(`\n✓ Seeded ${docs.length} documents (verified via anonymous CDN read).`);
console.log('  Open /studio → 🤖 Agent to edit.');
console.log('  Verify the worker is serving them: GET /agent/manifest?fresh=1&debug=1 → "_source": "sanity"');
