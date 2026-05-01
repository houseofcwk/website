// Power Ups product line. Source: BIZ_02.1_POWER_UPS_ARCHITECTURE_V1.
// Bundle prices reconciled to the $44,500 complete-stack total: Brand $5,500
// + Sales $16,500 + Presence $22,500 (the bundle-box numbers in the source
// content disagreed with the overview / pricing summary; the consistent
// values are used here).

export type PowerUpCategory = 'identity' | 'systems' | 'presence';

export interface PowerUp {
  id: string;
  slug: string;
  category: PowerUpCategory;
  name: string;
  fix: string;
  notFor: string;
  bestMoment: string;
  price: string;
  prereq?: string[];
  tiers?: { name: string; timeline: string; description: string; price: string }[];
}

export interface Bundle {
  category: PowerUpCategory;
  name: string;
  tagline: string;
  includes: string[];
  differences: string[];
  engagement: string;
  price: string;
  individualTotal: string;
}

export const CATEGORY_META: Record<PowerUpCategory, {
  index: number;
  label: string;
  blurb: string;
  count: string;
  accent: string;
  bundle: string;
}> = {
  identity: {
    index: 1,
    label: 'IDENTITY',
    blurb: 'Who you are. What you stand for. How you show up.',
    count: '7 Power Ups',
    accent: '#00E5FF',
    bundle: 'Brand in a Box',
  },
  systems: {
    index: 2,
    label: 'SYSTEMS',
    blurb: 'How your business runs without you carrying all of it.',
    count: '9 Power Ups',
    accent: '#7B61FF',
    bundle: 'Sales in a Box',
  },
  presence: {
    index: 3,
    label: 'PRESENCE',
    blurb: 'How you show up in the market and get found.',
    count: '6 Power Ups',
    accent: '#FB3079',
    bundle: 'Presence in a Box',
  },
};

export const POWER_UPS: PowerUp[] = [
  // ── Identity ──────────────────────────────────────────────
  {
    id: '1.1',
    slug: 'identity-who',
    category: 'identity',
    name: 'The WHO — Your Person',
    fix: 'You do not have a messaging problem. You have a people problem. You are trying to speak to everyone and landing with no one. This Power Up locks in exactly who you are built for so every decision after this gets easier.',
    notFor: 'You have zero clients or revenue. You need market validation before this Power Up can do its job.',
    bestMoment: 'The moment you realize your best clients share a profile and your worst clients share a different one. That tension is the signal.',
    price: '$597',
  },
  {
    id: '1.2',
    slug: 'positioning-statement',
    category: 'identity',
    name: 'The Positioning Statement',
    fix: 'You cannot explain what you do in one sentence without rambling. Or you say it but nobody reacts. This Power Up gives you one clean, specific, memorable statement that does the work before you do.',
    notFor: 'You are still figuring out your offer. Lock the offer first before you try to position it.',
    bestMoment: 'The moment someone asks what you do and your answer changes every time. That inconsistency is costing you deals.',
    price: '$597',
  },
  {
    id: '1.3',
    slug: 'the-offer-identity',
    category: 'identity',
    name: 'The Offer',
    fix: 'You have a service but not a product. People do not know what they are buying, what they get, or what it costs. This Power Up turns what you do into a clean, sellable offer with a name, a scope, and a price that holds.',
    notFor: 'You are not yet delivering paid work. Get clients first, then productize.',
    bestMoment: 'The moment you realize you are re-explaining your service in every sales conversation because nothing is documented or packaged.',
    price: '$597',
  },
  {
    id: '1.4',
    slug: 'filtration-system',
    category: 'identity',
    name: 'The Filtration System',
    fix: 'You keep closing the wrong clients and paying for it in scope creep, low margins, and founder frustration. This Power Up builds the system that filters out the wrong people before they get in the door.',
    notFor: 'You have never had a client. You need experience with real buyers before you can build a filter.',
    bestMoment: 'The moment you finish a project and think this person was never right for us. That is the signal.',
    price: '$597',
    prereq: ['The WHO', 'The Offer'],
  },
  {
    id: '1.5',
    slug: 'messaging-pillars',
    category: 'identity',
    name: 'The Messaging Pillars',
    fix: 'Your content is inconsistent. One week you talk about one thing, next week something else. Nobody knows what you stand for. This Power Up gives you three to five core pillars that every piece of content connects back to.',
    notFor: 'You do not have a positioning statement yet. Build that first or your pillars will be built on sand.',
    bestMoment: 'The moment you open a blank page to write and have no idea where to start. That blank page is the symptom.',
    price: '$597',
  },
  {
    id: '1.6',
    slug: 'voice-tone-guide',
    category: 'identity',
    name: 'The Voice and Tone Guide',
    fix: 'You sound different everywhere. Your LinkedIn sounds corporate. Your DMs sound casual. Nothing feels like the same person. This Power Up locks in how you sound so your brand is recognizable in any format.',
    notFor: 'You are a solo operator with no plans to delegate writing. This Power Up matters most when voice needs to be transferable.',
    bestMoment: 'The moment you read something a team member wrote and it sounds nothing like you. That gap is the problem.',
    price: '$597',
    prereq: ['The Positioning Statement'],
  },
  {
    id: '1.7',
    slug: 'visual-identity',
    category: 'identity',
    name: 'The Visual Identity',
    fix: 'You look different everywhere. No consistent colors, fonts, or visual language. Your brand feels amateur even when your work is exceptional. This Power Up delivers a complete visual identity system so you look like what you are worth.',
    notFor: 'You have not defined your positioning or voice yet. Visual identity built without that foundation will need to be rebuilt.',
    bestMoment: 'The moment you feel embarrassed sending someone to your website because the visuals do not match the quality of your work.',
    price: '$597',
  },

  // ── Systems ───────────────────────────────────────────────
  {
    id: '2.1',
    slug: 'systems-who',
    category: 'systems',
    name: 'The WHO — Your Person',
    fix: 'You cannot build a sales system for everyone. This Power Up locks in exactly who you are selling to so every other sales component works harder and faster.',
    notFor: 'You have zero clients or revenue. Get market validation before locking your WHO.',
    bestMoment: 'The moment your sales conversations feel completely different depending on who you are talking to and you cannot figure out why.',
    price: '$597',
  },
  {
    id: '2.2',
    slug: 'the-offer-systems',
    category: 'systems',
    name: 'The Offer',
    fix: 'A sales system built around a vague offer will fail every time. This Power Up makes your offer clean, specific, and sellable so the rest of your sales infrastructure has something solid to work with.',
    notFor: 'You have never delivered paid work. Productize after you have delivered at least twice.',
    bestMoment: 'The moment you realize your proposal conversations start from scratch every single time.',
    price: '$597',
  },
  {
    id: '2.3',
    slug: 'advertising-method',
    category: 'systems',
    name: 'The Advertising Method',
    fix: 'You are not getting in front of enough people consistently. This Power Up uses the Hormozi Core Four framework to identify the right one or two advertising methods for where you are right now and builds the execution recipe around that choice. Do this. For this long. With metrics and checkpoints built in.',
    notFor: 'You do not have a defined offer or buyer yet. Build those first or the advertising plan will target the wrong person.',
    bestMoment: 'The moment you realize you are doing random acts of marketing with no system and no way to measure what is working.',
    price: '$597',
    prereq: ['The WHO', 'The Offer'],
  },
  {
    id: '2.4',
    slug: 'customer-journey-map',
    category: 'systems',
    name: 'The Customer Journey Map',
    fix: 'This is CMO-level work. A complete map of how your buyer moves from stranger to closed deal. How they find you. What creates interest. Why they buy. When they are in highest pain. What language resonates. How long the sales journey takes for your specific buyer.',
    notFor: 'You have never closed a paid client. You cannot map a journey you have not witnessed. Get clients first.',
    bestMoment: 'The moment you realize every sales conversation feels different and you have no idea what is actually moving people toward yes.',
    price: '$2,000',
  },
  {
    id: '2.5',
    slug: 'sales-assets',
    category: 'systems',
    name: 'The Sales Assets',
    fix: 'You have nothing to send someone after a conversation. This Power Up builds the three core assets that do the selling between conversations: a pricing calculator, a visualized customer journey, and a before-and-after transformation capture.',
    notFor: 'You do not have a defined offer or a clear customer journey. Build those first.',
    bestMoment: 'The moment you finish a great call and have nothing to send that does justice to what you just discussed.',
    price: '$3,000',
    prereq: ['The WHO', 'The Offer', 'The Customer Journey Map'],
  },
  {
    id: '2.6',
    slug: 'sales-script',
    category: 'systems',
    name: 'The Sales Script',
    fix: 'You are winging the conversation. The words come out differently every time. This Power Up installs the Hormozi Closer Script customized to your specific business, your specific buyer, and your specific offer. You leave with a script you can use in the next conversation.',
    notFor: 'You do not have a defined offer or customer journey. The script is only as strong as the clarity behind it.',
    bestMoment: 'The moment you finish a call that felt great and still did not close.',
    price: '$1,000',
  },
  {
    id: '2.7',
    slug: 'booking-system',
    category: 'systems',
    name: 'The Booking System',
    fix: 'People want to work with you but there is no clean way to get on your calendar and pay. This Power Up installs the full booking infrastructure: Calendly, Zoom integrated, Stripe connected. Plus the process walkthrough. Includes one tech lifeline after delivery.',
    notFor: 'You do not have an offer with a defined price. You cannot set up a booking system for something that is not packaged.',
    bestMoment: 'The moment a warm lead asks how to book you and you send them a confusing back and forth instead of a clean link.',
    price: '$1,500',
    prereq: ['The Offer'],
  },
  {
    id: '2.8',
    slug: 'crm-setup',
    category: 'systems',
    name: 'The CRM Setup',
    fix: 'Every relationship lives in your head and your inbox. Nothing is tracked. Deals die because you forgot to follow up. This Power Up installs a mega basic CRM template and maps the habit of what to do and when. The tool is not the point. The behavior is.',
    notFor: 'You have fewer than 10 active relationships to manage. Build the manual habit first before you systematize it.',
    bestMoment: 'The moment you realize a warm lead went cold and you cannot remember the last time you reached out.',
    price: '$1,000',
  },
  {
    id: '2.9',
    slug: 'follow-up-system',
    category: 'systems',
    name: 'The Follow Up System',
    fix: 'You track contacts but you still do not follow up. Tracking and following up are two different things. This Power Up builds the tagging system inside your CRM that tells you exactly who needs follow up and when. Plus the weekly rhythm that makes sure it actually gets done.',
    notFor: 'You do not have a CRM set up yet. Build that first.',
    bestMoment: 'The moment you look at your CRM and realize you have no idea who is warm, who is cold, and who you should have called three weeks ago.',
    price: '$1,500',
    prereq: ['The CRM Setup'],
  },

  // ── Presence ──────────────────────────────────────────────
  {
    id: '3.1',
    slug: 'facebook-makeover',
    category: 'presence',
    name: 'The Facebook Makeover',
    fix: 'Your Facebook presence is costing you trust before anyone talks to you. This Power Up delivers a complete Facebook makeover: visual enhancements, a crash course on managing the platform, a documented process you can hand off, and 30 days of content with a posting calendar at 2 posts per week.',
    notFor: 'You have not completed Brand in a Box. Visual and voice identity must be locked before any platform makeover.',
    bestMoment: 'The moment you feel uncertain about what someone finds when they search you on Facebook.',
    price: '$1,000',
    prereq: ['Brand in a Box'],
  },
  {
    id: '3.2',
    slug: 'instagram-makeover',
    category: 'presence',
    name: 'The Instagram Makeover',
    fix: 'Your Instagram presence is costing you trust before anyone talks to you. This Power Up delivers a complete Instagram makeover: visual enhancements, a crash course on managing the platform, a documented process you can hand off, and 30 days of mixed-media content with a posting calendar at 3 posts per week.',
    notFor: 'You have not completed Brand in a Box. Visual and voice identity must be locked before any platform makeover.',
    bestMoment: 'The moment you feel uncertain about what someone finds when they search you on Instagram.',
    price: '$2,000',
    prereq: ['Brand in a Box'],
  },
  {
    id: '3.3',
    slug: 'linkedin-makeover',
    category: 'presence',
    name: 'The LinkedIn Makeover',
    fix: 'Your LinkedIn presence is costing you trust before anyone talks to you. This Power Up delivers a complete LinkedIn makeover: visual enhancements, a crash course on managing the platform, a documented process you can hand off, and 30 days of content with a posting calendar at 3 posts per week.',
    notFor: 'You have not completed Brand in a Box. Visual and voice identity must be locked before any platform makeover.',
    bestMoment: 'The moment you feel uncertain about what someone finds when they search you on LinkedIn.',
    price: '$2,000',
    prereq: ['Brand in a Box'],
  },
  {
    id: '3.4',
    slug: 'tiktok-makeover',
    category: 'presence',
    name: 'The TikTok Makeover',
    fix: 'Your TikTok presence is costing you trust before anyone talks to you. This Power Up delivers a complete TikTok makeover: visual enhancements, a crash course on managing the platform, a documented process you can hand off, and 30 days of raw selfie video content with a posting calendar at 3 videos per week.',
    notFor: 'You have not completed Brand in a Box. Visual and voice identity must be locked before any platform makeover.',
    bestMoment: 'The moment you feel uncertain about what someone finds when they search you on TikTok.',
    price: '$2,000',
    prereq: ['Brand in a Box'],
  },
  {
    id: '3.5',
    slug: 'youtube-makeover',
    category: 'presence',
    name: 'The YouTube Makeover',
    fix: 'Your YouTube presence is costing you trust before anyone talks to you. This Power Up delivers a complete YouTube makeover: visual enhancements, a crash course on managing the channel, a documented process you can hand off, and 30 days of video content with a posting calendar at 1 video per week.',
    notFor: 'You have not completed Brand in a Box. Visual and voice identity must be locked before any platform makeover.',
    bestMoment: 'The moment you feel uncertain about what someone finds when they search you on YouTube.',
    price: '$4,000',
    prereq: ['Brand in a Box'],
  },
  {
    id: '3.6',
    slug: 'digital-home',
    category: 'presence',
    name: 'The Digital Home',
    fix: 'Your website is your hardest-working sales asset, or it should be. Most founders have a digital home that does not reflect the quality of their work. This Power Up builds your website from scratch at the tier that matches where you are and where you are going.',
    notFor: 'You have not completed Brand in a Box. The website is built from your identity. Without that locked, the site will not accurately represent who you are.',
    bestMoment: 'The moment you feel embarrassed sending someone to your website because the visuals do not match the quality of your work.',
    price: 'From TBD',
    prereq: ['Brand in a Box'],
    tiers: [
      { name: 'Tier 1 — Basic', timeline: '14 days', description: 'Clean, functional website. The digital home that does the job. Core pages built. Mobile ready. Brand applied. You go live with something you are proud to send.', price: 'TBD' },
      { name: 'Tier 2 — Medium', timeline: '30 days', description: 'More depth, more pages, more intentional design. Additional sections, stronger user journey, elevated visual execution. Built to convert, not just impress.', price: 'TBD' },
      { name: 'Tier 3 — Wild',   timeline: '60 days', description: 'Full custom experience. Animations, interactions, a digital world that stops someone in their tracks. Built for founders who want their website to be a statement.', price: 'TBD' },
    ],
  },
];

export const BUNDLES: Bundle[] = [
  {
    category: 'identity',
    name: 'Brand in a Box',
    tagline: 'Full Identity. 30 Days. Concierge Progression.',
    includes: [
      'The WHO — Your Person',
      'The Positioning Statement',
      'The Offer',
      'The Filtration System',
      'The Messaging Pillars',
      'The Voice and Tone Guide',
      'The Visual Identity',
    ],
    differences: [
      'Guided sequence across all 7 sessions',
      'Hand-holding between each Power Up',
      'Implementation guide connecting all 7',
      '30 days of accountability starting at onboarding',
      'Real-time adjustments as identity deploys',
      'You leave with a complete Identity OS',
    ],
    engagement: '30 days. Clock starts at onboarding. Sessions in weeks 1 and 2. Implementation and accountability weeks 3 and 4.',
    price: '$5,500',
    individualTotal: '$4,179',
  },
  {
    category: 'systems',
    name: 'Sales in a Box',
    tagline: 'Full Sales System. 30 Days. Concierge Progression.',
    includes: [
      'The WHO — Your Person',
      'The Offer',
      'The Advertising Method',
      'The Customer Journey Map',
      'The Sales Assets',
      'The Sales Script',
      'The Booking System',
      'The CRM Setup',
      'The Follow Up System',
    ],
    differences: [
      'Guided sequence across all 9 sessions',
      'Hand-holding between each Power Up',
      'Implementation guide connecting all 9',
      '30 days of accountability from first execution',
      'Clock starts at first advertising execution or first booking attempt',
      'Real-time data collection and adjustments',
      'You leave with a complete sales system running',
    ],
    engagement: '30 days. Clock starts at first advertising execution or first booking attempt. Sessions in weeks 1 and 2. Execution and accountability weeks 3 and 4.',
    price: '$16,500',
    individualTotal: '$12,191',
  },
  {
    category: 'presence',
    name: 'Presence in a Box',
    tagline: 'All 5 Platforms. 30 Days. Concierge Progression.',
    includes: [
      'The Facebook Makeover',
      'The Instagram Makeover',
      'The LinkedIn Makeover',
      'The TikTok Makeover',
      'The YouTube Makeover',
    ],
    differences: [
      'All 5 platforms under one concierge engagement',
      '3 posts per week standard across platforms',
      'Facebook at 2 per week. YouTube at 1 per week.',
      'Ongoing support for the full 30 days',
      'Real-time data collection and performance adjustments',
      'Accountability baked in, not available in individual Power Ups',
      '30 days starts at first post going live',
    ],
    engagement: '30 days. Clock starts at first post going live. Production and delivery weeks 1 and 2. Posting begins week 3. Accountability and real-time adjustments week 4.',
    price: '$22,500',
    individualTotal: '$11,000',
  },
];

export const COMPLETE_STACK_PRICE = '$44,500';
