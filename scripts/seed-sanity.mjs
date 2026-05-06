#!/usr/bin/env node
// Seed the Sanity production dataset with the content currently rendered as
// hardcoded fallbacks across the site. Idempotent — uses deterministic _id
// values per doc, so repeated runs replace, never duplicate.
//
// Safety:
//   - Default mode is DRY-RUN. Real writes only with --apply.
//   - Write token never logged or echoed.
//   - Hardcoded fallbacks remain in the codebase; this seed lifts the
//     studio off zero, but the site keeps rendering even if the dataset
//     is later wiped.
//
// Usage:
//   SANITY_WRITE_TOKEN=sk... node scripts/seed-sanity.mjs            # dry run
//   SANITY_WRITE_TOKEN=sk... node scripts/seed-sanity.mjs --apply    # write

import { createClient } from '@sanity/client';

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

// ─── Content (mirrors hardcoded fallbacks in src/) ──────────────────────────

const SITE_SETTINGS = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  nav: [
    { _key: 'nav-cs', _type: 'navItem', label: 'Case Studies', href: '/case-studies' },
    { _key: 'nav-about', _type: 'navItem', label: 'About', href: '/about' },
    { _key: 'nav-plos', _type: 'navItem', label: 'PLOS', href: '/product' },
  ],
  footer: {
    tagline: 'CWK. gamifies your growth across Mind, Body, Soul, and Pocket.',
    socialProofCount: 0,
    links: [
      { _key: 'f-product', _type: 'footerLink', label: 'Agent+', href: '/product' },
      { _key: 'f-quiz', _type: 'footerLink', label: 'What Player Are You?', href: '/assessment' },
      { _key: 'f-cs', _type: 'footerLink', label: 'Case Studies', href: '/case-studies' },
      { _key: 'f-sq', _type: 'footerLink', label: 'Side Quests', href: '/side-quests' },
      { _key: 'f-about', _type: 'footerLink', label: 'About Kris', href: '/about' },
      { _key: 'f-contact', _type: 'footerLink', label: 'Contact', href: '/contact' },
      { _key: 'f-privacy', _type: 'footerLink', label: 'Privacy', href: '/privacy' },
      { _key: 'f-terms', _type: 'footerLink', label: 'Terms', href: '/terms' },
    ],
  },
  twitterHandle: '@cwkexperience',
  defaultSeo: {
    title: 'CWK. Experience | The Sports Agent for Entrepreneurs',
    description: 'CWK. is the long-term partner for entrepreneurs. We rep your career, install the operations, and manage your growth, all under one house.',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow, max-image-preview:large',
  },
  organization: {
    name: 'CWK. Experience',
    alternateName: ['CWK', 'CWK Experience', 'House of CWK'],
    slogan: 'The Sports Agent for Entrepreneurs',
    description: 'CWK. is the long-term partner for entrepreneurs. We rep your career, install the operations, and manage your growth, all under one house.',
    foundingDate: '2023',
    founderName: 'Kris San',
    founderJobTitle: 'Founder',
    founderSameAs: ['https://www.linkedin.com/in/krissan/'],
    addressLocality: 'Austin',
    addressRegion: 'TX',
    addressCountry: 'US',
    areaServed: 'Worldwide',
    knowsAbout: [
      'Personal Branding',
      'Thought Leadership',
      'Content Marketing',
      'Brand Positioning',
      'Creative Consulting',
      'Content Strategy',
      'Branding',
      'Systems',
    ],
  },
  faqs: [
    {
      _key: 'faq-1',
      _type: 'faqItem',
      question: 'What is CWK. Experience?',
      answer: 'CWK. Experience is the Sports Agent for Entrepreneurs. Founded by Kris San in 2023 and based in Austin, Texas, CWK. is a long-term partner that reps your career, installs the operations, and manages your growth across three levels: Sandbox, Power Ups, and Command Center.',
    },
    {
      _key: 'faq-2',
      _type: 'faqItem',
      question: 'What are the 3 Levels at CWK.?',
      answer: 'Level 1 Sandbox is for Explorers and Committers. Level 2 Power Ups is for Builders and Operators. Level 3 Command Center is for Operators becoming Sovereign.',
    },
    {
      _key: 'faq-3',
      _type: 'faqItem',
      question: 'What is a Power Up?',
      answer: 'A Power Up is a single, focused, Done With You transformation tool delivered in 45 minutes or less. CWK. ships 21 Power Ups across Identity, Systems, and Presence.',
    },
    {
      _key: 'faq-4',
      _type: 'faqItem',
      question: 'How is CWK. different from a coach or course?',
      answer: 'CWK. is not a coach, course, or mastermind. It is the infrastructure layer most founder businesses are missing, with a long-term partner that stays inside the business while it gets built.',
    },
  ],
  llmsTxt: '', // build script falls back to its bundled copy when this is blank
};

const HOME_PAGE = {
  _id: 'homePage',
  _type: 'homePage',
  heroEyebrow: 'Personal Leverage OS',
  heroHeadline: 'CWK. is like a',
  wordFlipPhrases: ['partner', 'operator', 'architect', 'co-founder', 'infrastructure'],
  heroCta: { label: 'Join Waitlist', href: '#waitlist' },
  pillars: [
    { _key: 'p-mind', _type: 'pillarBlock', key: 'mind', title: 'Mind', body: 'Strategic clarity, decision frameworks, mental performance, and clearing psychological blockers that stop growth.' },
    { _key: 'p-body', _type: 'pillarBlock', key: 'body', title: 'Body', body: 'The operational systems required for the body to be nurtured through access to nutrition and regular fitness habits.' },
    { _key: 'p-soul', _type: 'pillarBlock', key: 'soul', title: 'Soul', body: 'Legacy building, IP development, thought leadership positioning, and turning your expertise into community building.' },
    { _key: 'p-pocket', _type: 'pillarBlock', key: 'pocket', title: 'Pocket', body: 'Revenue systems, opportunity sourcing, deal structuring, and building the financial engine that funds your vision.' },
  ],
  seo: {
    title: 'CWK. Experience | The Sports Agent for Entrepreneurs',
    description: 'CWK. is the long-term partner for entrepreneurs. We rep your career, install the operations, and manage your growth, all under one house.',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow, max-image-preview:large',
  },
};

const PRODUCT_PAGE = {
  _id: 'productPage',
  _type: 'productPage',
  heroEyebrow: 'Agent+ Dashboard',
  heroHeadline: 'Your Personal Operating System for Growth.',
  features: [
    {
      _key: 'feat-dashboard', _type: 'featureBlock', id: 'dashboard',
      headline: 'Your daily command center.',
      body: 'Every morning, your dashboard shows exactly what to focus on. Tasks assigned by your Brand Guide, tagged to the four systems, with progress tracking that builds streaks and momentum.',
      highlights: [
        'Time-of-day personalized greeting',
        "Today's Actions with system tags (codify, create, connect, convert)",
        'Progress tracking with streak counter',
        'Pipeline and relationship snapshot at a glance',
      ],
    },
    {
      _key: 'feat-relationships', _type: 'featureBlock', id: 'relationships',
      headline: 'Every relationship. One place.',
      body: 'Stop losing track of who you know and when you last spoke to them. The Relationships Directory is your living CRM: searchable, filterable, and built for follow-through.',
      highlights: [
        'Full contact directory with search and filters',
        'Stage-based organization (Aware to Advocate)',
        'Last touchpoint tracking with dormancy alerts',
        'Detail panel with full relationship history',
      ],
    },
    {
      _key: 'feat-pipeline', _type: 'featureBlock', id: 'pipeline',
      headline: 'Watch deals move, not die.',
      body: "Your pipeline is not a spreadsheet. It's a visual board that shows where every opportunity sits, what needs attention, and what's about to close.",
      highlights: [
        'Visual Kanban with 5 pipeline stages',
        'Drag-and-drop deal management',
        'Stage-level metrics and conversion tracking',
        'Dormant contact alerts',
      ],
    },
    {
      _key: 'feat-actions', _type: 'featureBlock', id: 'actions',
      headline: 'Three actions. Every day. Compounding.',
      body: 'Your Brand Guide assigns your daily actions based on where you are in the PLOS framework. Each task is tagged to a system and explained with context so you know why it matters.',
      highlights: [
        'Daily task cards with context and purpose',
        'System tags: codify, create, connect, convert',
        'One-click status cycling',
        'Completion streaks with milestone badges',
      ],
    },
    {
      _key: 'feat-kaia', _type: 'featureBlock', id: 'kaia',
      headline: 'Your AI-powered brand strategist.',
      body: 'KAIA is trained on the CWK. framework and your specific data. Ask about your next move, get clarity on a decision, or pressure-test an idea. KAIA responds in real time with streaming intelligence.',
      highlights: [
        'Real-time streaming responses',
        'Grounded in CWK. PLOS methodology',
        'Context-aware: knows your stage, tasks, and goals',
        'Available 24/7 inside the dashboard',
      ],
    },
    {
      _key: 'feat-destination', _type: 'featureBlock', id: 'destination',
      headline: '60-120 day goal sprints with real milestones.',
      body: "Brand Destinations are structured goal sprints designed by your Brand Guide. Each has clear milestones, a progress bar, and badge rewards. You always know where you are and what's next.",
      highlights: [
        'Named goal sprints (60-120 days)',
        'Visual progress bar with milestone markers',
        'Badge system for completed milestones',
        'Clear phase descriptions and next steps',
      ],
    },
  ],
  seo: {
    title: 'CWK. Agent+ | The Operating System for Entrepreneurs',
    description: 'See inside the Agent+ dashboard: daily actions, relationship tracking, AI strategy, pipeline management, and goal sprints. Built on the PLOS framework.',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow, max-image-preview:large',
  },
};

const ABOUT_PAGE = {
  _id: 'aboutPage',
  _type: 'aboutPage',
  heroHeadline: 'My Why.',
  // Bio + stats intentionally omitted; the page falls back to hardcoded
  // markup until editorial chooses to migrate the long bio + quote block.
  seo: {
    title: 'About Kris San | CWK. Experience',
    description: 'Kris San is the founder of CWK. Experience, the sports agent for entrepreneurs. Long-term business management, not consulting.',
    ogType: 'profile',
    twitterCard: 'summary_large_image',
    robots: 'index, follow, max-image-preview:large',
  },
};

const JOURNEY_PAGE = {
  _id: 'journeyPage',
  _type: 'journeyPage',
  heroEyebrow: 'The Journey',
  heroHeadline: "A bit of where I've been.",
  // body intentionally omitted; chapters render from hardcoded array.
  seo: {
    title: "Kris's Journey | CWK. Experience",
    description: "A bit of where I've been: Kris San from Caguas, Puerto Rico to Austin, TX, chapter by chapter.",
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'index, follow, max-image-preview:large',
  },
};

const SIDE_QUESTS_PAGE = {
  _id: 'sideQuestsPage',
  _type: 'sideQuestsPage',
  heroEyebrow: 'Side Quests',
  heroHeadline: 'Welcome to my Side Quests.',
  seo: {
    title: 'Side Quests | CWK. Experience',
    description: 'Short, self-initiated projects that showcase range, curiosity, and execution outside of core client work.',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow, max-image-preview:large',
  },
};

const LEGAL_PRIVACY = {
  _id: 'legalPage-privacy',
  _type: 'legalPage',
  title: 'Privacy Policy',
  slug: { _type: 'slug', current: 'privacy' },
  updatedAt: '2026-04-01',
  // body kept blank; the page falls back to its hardcoded long-form copy.
  seo: {
    title: 'Privacy Policy | CWK. Experience',
    description: 'How CWK. LLC collects, uses, and protects your information.',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow, max-image-preview:large',
  },
};

const LEGAL_TERMS = {
  _id: 'legalPage-terms',
  _type: 'legalPage',
  title: 'Terms of Service',
  slug: { _type: 'slug', current: 'terms' },
  updatedAt: '2026-04-01',
  seo: {
    title: 'Terms of Service | CWK. Experience',
    description: 'Terms governing use of cwkexperience.com and CWK. Experience services.',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    robots: 'index, follow, max-image-preview:large',
  },
};

// Case studies: card-level metadata only. Rich `body` portable text and
// per-study images are deferred to a follow-up migration.
const CASE_STUDIES = [
  {
    slug: 'spraycation', client: 'SPRAYCATION', tagline: null,
    category: 'EXPERIENTIAL', medium: 'EXPERIENTIAL',
    cardSurface: 'isometric-dark', cardAccent: '#00E5FF',
    cardDescription: 'Built brand foundation and operational backbone for a female-led art movement.',
    cardStat: { num: '5', label: 'City National Tour' }, order: 1,
    headline: 'Building an Experiential Campaign While in Motion',
    duration: '8 months',
    stats: [
      { value: '5 murals', label: 'Tour' },
      { value: '8 months', label: 'Live build' },
      { value: '2025', label: 'Foundation Built' },
    ],
  },
  {
    slug: 'dawa', client: 'DAWA', tagline: 'Diversity Awareness & Wellness in Action',
    category: 'NON-PROFIT', medium: 'NON-PROFIT',
    cardSurface: 'glass', cardAccent: '#00E5FF',
    cardDescription: "Found the organization's anchor phrase, built its content system, and co-built an education program from zero.",
    cardStat: { num: '100%', label: 'Messaging Clarity' }, order: 2,
    headline: 'How DAWA Found Its Anchor', duration: 'Nearly 2 years',
    result: '100%', resultLabel: 'Messaging clarity',
    stats: [
      { value: '100%', label: 'Messaging clarity' },
      { value: '8-person', label: 'Led Major Campaign' },
      { value: '2 years', label: 'Active building' },
    ],
  },
  {
    slug: 'stephy-lee', client: 'Stephy Lee', tagline: null,
    category: 'CREATIVE FOUNDER', medium: 'CREATIVE',
    cardSurface: 'marble-light', cardAccent: '#00E5FF',
    cardDescription: "Protected an artist's brand during crisis and secured strategic booking.",
    cardStat: { num: 'SXSW', label: 'Booking Secured' }, order: 3,
    headline: "How Stephy Lee's Career Moved Forward During the Hardest Time of Her Life",
    stats: [
      { value: '$30K', label: 'Raised' },
      { value: 'SXSW', label: 'Stage secured' },
      { value: '2', label: 'Albums released post-accident' },
    ],
  },
  {
    slug: 'lifes-tapestry', client: "Life's Tapestry", tagline: null,
    category: 'DIGITAL PROPERTY', medium: 'DIGITAL PROPERTY',
    cardSurface: 'wood', cardAccent: '#E0A878',
    cardDescription: 'Launched a digital property for a 64-year-old first-time writer; 25+ editions and a growing audience.',
    cardStat: { num: '25+', label: 'Editions Published' }, order: 4,
    headline: "CWK. Builds a Digital Home for a Writer's Life's Work",
    stats: [
      { value: '1', label: 'Lifelong Dream Come True' },
      { value: '47', label: 'Real Subscribers' },
      { value: '25+', label: 'Published Editions' },
      { value: 'Year 1', label: 'Foundation built' },
    ],
  },
  {
    slug: 'pay-the-creators', client: 'Pay the Creators (BeatStars)', tagline: null,
    category: 'PODCAST', medium: 'PODCAST',
    cardSurface: 'crimson', cardAccent: '#FB3079',
    cardDescription: 'Renamed and repositioned a podcast to align with brand mission.',
    cardStat: { num: '1', label: 'Costly Mistake Avoided' }, order: 5,
    headline: 'Naming the Anchor and Building the Podcast Foundation',
    stats: [
      { value: '7', label: 'Episodes Built' },
      { value: '1', label: 'Name saved' },
      { value: '∞', label: 'IP juice added' },
    ],
  },
  {
    slug: 'rob-dial', client: 'Rob Dial', tagline: null,
    category: 'PODCAST HOST', medium: 'PODCAST',
    cardSurface: 'charcoal', cardAccent: '#00E5FF',
    cardDescription: 'Scaled a one-person media role into a full content operation.',
    cardStat: { num: '10x', label: 'Content Output' }, order: 6,
    headline: 'How a One-Person Media Role Became a Scalable Content Operation',
    stats: [
      { value: '10x', label: 'Content Output' },
      { value: '$1M to $5M', label: 'Revenue Growth' },
      { value: '84', label: 'Pieces / Month' },
    ],
  },
  {
    slug: 'the-lab-miami', client: 'The LAB Miami', tagline: null,
    category: 'BUILDER HUB', medium: 'LAB/HUB',
    cardSurface: 'glow-blue', cardAccent: '#38B2F6',
    cardDescription: 'Content infrastructure and positioning clarity for an innovation campus.',
    cardStat: { num: '30%', label: 'Faster Sales Cycles' }, order: 7,
    headline: 'The LAB Miami Builds the Foundation for Its Next Chapter With CWK.',
    stats: [
      { value: '30%', label: 'Faster Sales Cycles' },
      { value: '50%', label: 'Faster Content Creation' },
      { value: 'Team', label: 'Alignment Achieved' },
    ],
  },
  {
    slug: 'raasin-in-the-sun', client: 'Raasin in the Sun', tagline: null,
    category: 'NON-PROFIT', medium: 'NON-PROFIT',
    cardSurface: 'marble-stone', cardAccent: '#FB3079',
    cardDescription: 'Documented public art, secured grants, and a placemaking movement.',
    cardStat: { num: '6-fig', label: 'Grants Secured' }, order: 8,
    headline: 'Building the Media Foundation of a Creative Placemaking Movement',
    stats: [
      { value: '6-fig', label: 'Grants Secured' },
      { value: '9', label: 'High Impact Projects' },
      { value: '3 years', label: 'Engagement' },
    ],
  },
  {
    slug: 'agent-plus', client: 'CWK. Agent+', tagline: null,
    category: 'AGENT+ INTERFACE', medium: 'PLATFORM',
    cardSurface: 'holographic', cardAccent: '#7B61FF',
    cardDescription: "See what's inside CWK Agent+, the operating system we built for entrepreneurs.",
    cardStat: { num: '3', label: 'Key Dashboards' }, order: 99,
    headline: 'The Operating System We Built To Manage Growth',
    stats: [
      { value: '3', label: 'Dashboards' },
      { value: '4', label: 'Pillars: Mind / Body / Soul / Pocket' },
      { value: '1', label: 'Source of truth' },
    ],
  },
  {
    slug: 'brand-destination', client: 'Brand Destination', tagline: null,
    category: 'PLATFORM ACCESS', medium: 'PLATFORM ACCESS',
    cardSurface: 'glass', cardAccent: '#00E5FF',
    cardDescription: 'A deep dive into the CWK platform layer that gamifies the founder journey.',
    cardStat: { num: '4', label: 'Primary Actions' }, order: 100,
    headline: 'Brand Destination: Gates, Checkpoints, and the Final Boss',
    stats: [
      { value: '5', label: 'Gates' },
      { value: '4', label: 'Pillars: Mind / Body / Soul / Pocket' },
      { value: '1', label: 'Final boss' },
    ],
  },
];

function caseStudyDoc(c) {
  return {
    _id: `caseStudy-${c.slug}`,
    _type: 'caseStudy',
    slug: { _type: 'slug', current: c.slug },
    client: c.client,
    tagline: c.tagline ?? undefined,
    category: c.category,
    medium: c.medium,
    cardSurface: c.cardSurface,
    cardAccent: c.cardAccent,
    cardDescription: c.cardDescription,
    cardStat: c.cardStat,
    order: c.order,
    headline: c.headline,
    duration: c.duration ?? undefined,
    result: c.result ?? undefined,
    resultLabel: c.resultLabel ?? undefined,
    stats: (c.stats ?? []).map((s, i) => ({
      _key: `stat-${i}`, _type: 'statItem', value: s.value, label: s.label,
    })),
    seo: {
      title: `${c.client} | CWK. Case Study`,
      description: c.cardDescription,
      ogType: 'article',
      twitterCard: 'summary_large_image',
      robots: 'index, follow, max-image-preview:large',
    },
  };
}

// ─── Run ────────────────────────────────────────────────────────────────────

const docs = [
  SITE_SETTINGS,
  HOME_PAGE,
  PRODUCT_PAGE,
  ABOUT_PAGE,
  JOURNEY_PAGE,
  SIDE_QUESTS_PAGE,
  LEGAL_PRIVACY,
  LEGAL_TERMS,
  ...CASE_STUDIES.map(caseStudyDoc),
];

console.log(`\n╭─ Sanity seed plan (${docs.length} docs) ─────────────────────────────────────`);
for (const d of docs) {
  console.log(`│ ${d._type.padEnd(18)} ${d._id}`);
}
console.log(`╰──────────────────────────────────────────────────────────────────────`);

if (!APPLY) {
  console.log('\nDRY RUN. Re-run with --apply to write to Sanity.');
  console.log('Required: SANITY_WRITE_TOKEN env var (Editor role).\n');
  process.exit(0);
}

console.log(`\nWriting to project=${PROJECT_ID} dataset=${DATASET}...\n`);

let ok = 0, failed = 0;
for (const doc of docs) {
  try {
    await client.createOrReplace(doc);
    console.log(`✓ ${doc._id}`);
    ok++;
  } catch (err) {
    console.error(`✗ ${doc._id}: ${err?.message ?? err}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} ok, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
