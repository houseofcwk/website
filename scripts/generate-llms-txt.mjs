#!/usr/bin/env node
// Writes public/llms.txt at build time.
//
// Source of truth (in priority order):
//   1. siteSettings.llmsTxt in Sanity (editorial control)
//   2. LLMS_TXT_FALLBACK below (hardcoded)
//
// CRITICAL: this script must NEVER fail the build. Sanity unreachable, dataset
// empty, or any other error -> log and write the fallback. The build continues.

import { createClient } from '@sanity/client';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT_PATH = resolve(__dirname, '..', 'public', 'llms.txt');

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID ?? '3fsa3jok';
const DATASET = process.env.PUBLIC_SANITY_DATASET ?? 'production';

const LLMS_TXT_FALLBACK = `# CWK. Experience

> The Sports Agent for Entrepreneurs. CWK. is the long-term partner who reps your career, installs the operations, and manages your growth, all under one house. Personal Leverage OS for founders going from $0 to $1M.

CWK. Experience is a business management firm founded by Kris San in 2023, headquartered in Austin, Texas. CWK. is not a coach, course, or consultant. It is the infrastructure layer most founder businesses are missing, plus a long-term partner that stays inside the business while it gets built. CWK. works with high-agency founders and creatives committed to building a meaningful body of work that feeds mind, body, soul, and pocket.

The CWK. ecosystem has three Levels and four Pillars.

Levels:
- Level 1, Sandbox: for Explorers and Committers figuring out their lane.
- Level 2, Power Ups: for Builders and Operators installing missing pieces across Brand, Sales, and Presence. 21 Power Ups, Done With You in 45 minutes or less, sold individually or as Brand in a Box, Sales in a Box, or Presence in a Box.
- Level 3, Command Center: for Operators becoming Sovereign. The full infrastructure layer with PLOS (data), Kaia (AI agent), and a Human Pod.

Pillars: Mind, Body, Soul, Pocket.

## Core pages

- [Home](https://cwkexperience.com/): The Sports Agent for Entrepreneurs. The infrastructure layer for founders.
- [About Kris](https://cwkexperience.com/about): Founder Kris San's why and origin story.
- [Kris's Journey](https://cwkexperience.com/about/journey): Six-chapter picture story from Puerto Rico to Austin.
- [Side Quests](https://cwkexperience.com/side-quests): Other body of work. Keep Austin Voting, Almost Real Things advisory, Experiential Vending Machine, Life Lessons of a Creative Entrepreneur podcast.
- [What Player Are You?](https://cwkexperience.com/assessment): Free 2-minute founder archetype assessment.

## The 3 Levels

- [Level 2, Power Ups](https://cwkexperience.com/power-ups): The 21 Power Ups across Brand, Sales, and Presence.
- [Product preview](https://cwkexperience.com/product): The Personal Leverage OS dashboard preview.

## Case studies

- [DAWA](https://cwkexperience.com/case-studies/dawa)
- [Pay The Creators Podcast](https://cwkexperience.com/case-studies/pay-the-creators)
- [Rob Dial](https://cwkexperience.com/case-studies/rob-dial)
- [Spraycation](https://cwkexperience.com/case-studies/spraycation)
- [Stephy Lee](https://cwkexperience.com/case-studies/stephy-lee)
- [The LAB Miami](https://cwkexperience.com/case-studies/the-lab-miami)

## Contact

- Founder: Kris San. https://www.linkedin.com/in/krissan/
- Location: Austin, TX, US
`;

async function fetchLlmsBody() {
  try {
    const sanity = createClient({
      projectId: PROJECT_ID,
      dataset: DATASET,
      apiVersion: '2024-10-01',
      useCdn: true,
    });
    const result = await sanity.fetch(`*[_type == "siteSettings"][0]{ llmsTxt }`);
    const body = result?.llmsTxt;
    if (typeof body === 'string' && body.trim().length > 0) {
      return { source: 'sanity', body: body.trim() + '\n' };
    }
  } catch (err) {
    console.warn('[llms.txt] Sanity fetch failed, using hardcoded fallback:', err?.message ?? err);
  }
  return { source: 'fallback', body: LLMS_TXT_FALLBACK };
}

(async () => {
  const { source, body } = await fetchLlmsBody();
  try {
    mkdirSync(dirname(OUT_PATH), { recursive: true });
    writeFileSync(OUT_PATH, body, 'utf8');
    console.log(`[llms.txt] Wrote public/llms.txt (${body.length} bytes, source=${source}).`);
  } catch (err) {
    // Even the write failure should not crash the build — log and exit 0.
    console.warn('[llms.txt] Write failed (continuing build):', err?.message ?? err);
  }
})();
