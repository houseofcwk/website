#!/usr/bin/env node
// One-shot Sanity content patch for the houseofcwk.com -> cwkexperience.com
// domain migration. Updates the two documents that reference the old domain
// or twitter handle in CMS content.
//
// Found by full-export grep (28 docs in production dataset, 2 hits):
//   - siteSettings.twitterHandle: @houseofcwk -> @cwkexperience
//   - legalPage-terms.seo.description: Terms governing use of houseofcwk.com... -> cwkexperience.com...
//
// Usage:
//   SANITY_WRITE_TOKEN=sk... node scripts/migrate-domain-sanity.mjs            # dry run
//   SANITY_WRITE_TOKEN=sk... node scripts/migrate-domain-sanity.mjs --apply    # write

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

const PATCHES = [
  {
    id: 'siteSettings',
    set: { twitterHandle: '@cwkexperience' },
    note: 'siteSettings.twitterHandle -> @cwkexperience',
  },
  {
    id: 'legalPage-terms',
    set: {
      'seo.description':
        'Terms governing use of cwkexperience.com and CWK. Experience services.',
    },
    note: 'legalPage-terms.seo.description -> cwkexperience.com',
  },
];

console.log(`mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}  project=${PROJECT_ID}  dataset=${DATASET}`);
console.log(`patches: ${PATCHES.length}\n`);

for (const p of PATCHES) {
  console.log(`- ${p.note}`);
  for (const [path, value] of Object.entries(p.set)) {
    console.log(`    ${path}: ${JSON.stringify(value)}`);
  }
  if (APPLY) {
    let patch = client.patch(p.id);
    for (const [path, value] of Object.entries(p.set)) {
      patch = patch.set({ [path]: value });
    }
    await patch.commit();
    console.log('    ✓ committed');
  }
}

console.log(`\n${APPLY ? 'done.' : 'dry-run complete. re-run with --apply to write.'}`);
