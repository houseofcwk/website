#!/usr/bin/env node
// Surgical patch: refresh stale "Agent+" branding on the productPage doc.
//
// Targets only the three fields that drifted after commit 053ad70
// (Agent+ -> Command Center). Leaves every other field untouched so any
// studio edits the team has made are preserved.
//
// Usage:
//   SANITY_WRITE_TOKEN=sk... node scripts/patch-product-page.mjs            # dry run
//   SANITY_WRITE_TOKEN=sk... node scripts/patch-product-page.mjs --apply    # write

import { createClient } from '@sanity/client';

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID ?? '3fsa3jok';
const DATASET = process.env.PUBLIC_SANITY_DATASET ?? 'production';
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const APPLY = process.argv.includes('--apply');

if (APPLY && !TOKEN) {
  console.error('SANITY_WRITE_TOKEN env var is required for --apply.');
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: '2024-10-01',
  token: TOKEN,
  useCdn: false,
});

const PATCH = {
  heroEyebrow: 'Command Center',
  seo: {
    title: 'CWK. Command Center | The Operating System for Entrepreneurs',
    description:
      'See inside the Command Center dashboard: daily actions, relationship tracking, AI strategy, pipeline management, and goal sprints. Built on the PLOS framework.',
  },
};

const before = await client.fetch('*[_id=="productPage"][0]{heroEyebrow,seo}');
console.log('\nCurrent productPage values:');
console.log('  heroEyebrow      =', JSON.stringify(before?.heroEyebrow));
console.log('  seo.title        =', JSON.stringify(before?.seo?.title));
console.log('  seo.description  =', JSON.stringify(before?.seo?.description));

console.log('\nPlanned patch:');
console.log('  heroEyebrow      =', JSON.stringify(PATCH.heroEyebrow));
console.log('  seo.title        =', JSON.stringify(PATCH.seo.title));
console.log('  seo.description  =', JSON.stringify(PATCH.seo.description));

if (!APPLY) {
  console.log('\nDRY RUN. Re-run with --apply to write to Sanity.\n');
  process.exit(0);
}

await client
  .patch('productPage')
  .set({
    heroEyebrow: PATCH.heroEyebrow,
    'seo.title': PATCH.seo.title,
    'seo.description': PATCH.seo.description,
  })
  .commit();

console.log('\n✓ productPage patched.');
