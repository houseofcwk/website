// Hardcoded SEO/AEO fallback values. The site MUST render fully even if Sanity
// is empty or unreachable. Every consumer reads from Sanity and falls through
// to these values when fields are missing.

export const SITE_URL = 'https://cwkexperience.com';
export const TWITTER_HANDLE = '@cwkexperience';
export const DEFAULT_OG_IMAGE = '/og/cwk-default-1200x630.jpg';
export const LEGACY_OG_IMAGE = '/og-image.jpg'; // pre-existing default; kept as final fallback

export const DEFAULT_OG_TYPE = 'website';
export const DEFAULT_TWITTER_CARD = 'summary_large_image';
export const DEFAULT_ROBOTS = 'index, follow, max-image-preview:large';

export interface OrganizationFallback {
  name: string;
  alternateName: string[];
  url: string;
  logo: string;
  description: string;
  slogan: string;
  foundingDate: string;
  founder: { name: string; jobTitle: string; sameAs: string[] };
  address: { addressLocality: string; addressRegion: string; addressCountry: string };
  areaServed: string;
  knowsAbout: string[];
}

export const ORGANIZATION_FALLBACK: OrganizationFallback = {
  name: 'CWK. Experience',
  alternateName: ['CWK', 'CWK Experience', 'House of CWK'],
  url: SITE_URL,
  logo: `${SITE_URL}/og/cwk-logo.png`,
  description:
    'CWK. is the long-term partner for entrepreneurs. We rep your career, install the operations, and manage your growth, all under one house.',
  slogan: 'The Sports Agent for Entrepreneurs',
  foundingDate: '2023',
  founder: {
    name: 'Kris San',
    jobTitle: 'Founder',
    sameAs: ['https://www.linkedin.com/in/krissan/'],
  },
  address: {
    addressLocality: 'Austin',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
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
};

export interface FaqFallback {
  question: string;
  answer: string;
}

export const FAQS_FALLBACK: FaqFallback[] = [
  {
    question: 'What is CWK. Experience?',
    answer:
      'CWK. Experience is the Sports Agent for Entrepreneurs. Founded by Kris San in 2023 and based in Austin, Texas, CWK. is a long-term partner that reps your career, installs the operations, and manages your growth across three levels: Sandbox, Power Ups, and Command Center.',
  },
  {
    question: 'What are the 3 Levels at CWK.?',
    answer:
      'Level 1 Sandbox is for Explorers and Committers. Level 2 Power Ups is for Builders and Operators. Level 3 Command Center is for Operators becoming Sovereign.',
  },
  {
    question: 'What is a Power Up?',
    answer:
      'A Power Up is a single, focused, Done With You transformation tool delivered in 45 minutes or less. CWK. ships 21 Power Ups across Identity, Systems, and Presence.',
  },
  {
    question: 'How is CWK. different from a coach or course?',
    answer:
      'CWK. is not a coach, course, or mastermind. It is the infrastructure layer most founder businesses are missing, with a long-term partner that stays inside the business while it gets built.',
  },
];

// Note: the llms.txt fallback body lives in scripts/generate-llms-txt.mjs
// (sole consumer is the build script). Sanity-managed body at
// siteSettings.llmsTxt overrides it when present.
