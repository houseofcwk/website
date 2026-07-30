// Content for the /front-desk landing page.
//
// Built from the design handoff "Front Desk Landing" (hifi). Copy follows the
// handoff word for word with one exception: em dashes are rewritten as commas,
// colons or full stops, per docs/DESIGN.md ("No em dashes. Em dashes are not
// part of the CWK. voice.").
//
// Every figure and testimonial below is a placeholder and is labelled as one in
// the UI. They must be replaced or removed before the page goes public.

// FLAG FOR KRIS: deposit CTAs point at /contact until the payment link exists.
// Swap this one constant for the Stripe (or equivalent) checkout URL.
export const DEPOSIT_HREF = '/contact';
export const TOUR_HREF = 'https://calendly.com/cwkexperience/experience-tour';
export const DEPOSIT_AMOUNT = '$1,000';

/** A/B switches from the handoff's State table. Move to Sanity to test live. */
export const flags = {
  showUrgencyBar: true,
  proofStrip: 'logos' as 'logos' | 'metrics',
  testimonialLayout: 'featured' as 'featured' | 'grid',
};

export type Accent = 'cyan' | 'purple' | 'green' | 'pink' | 'amber';

export interface Stat {
  label: string;
  value: string;
  hint: string;
}

export const ticker = [
  { bonus: true, text: 'Bonus active: 3 months of maintenance free' },
  { bonus: false, text: `A ${DEPOSIT_AMOUNT} deposit holds your onboarding call this week` },
  { bonus: false, text: 'Pricing and bonuses change with the season' },
];

export const hero = {
  badge: 'Open 24 / 7',
  titleTop: 'Your first impression happens',
  titleShine: 'before they meet you.',
  ctaPrimary: `Pay ${DEPOSIT_AMOUNT} and skip the line`,
  ctaSecondary: 'Or book a free 20-minute Experience Tour first',
  note: 'Your deposit locks your onboarding call this week.',
  disclaimer: 'Placeholder metrics. Replace with your own numbers.',
};

export const heroProof = [
  { value: '47s', cyan: false, label: 'Book and pay, start to finish' },
  { value: '11/18', cyan: true, label: 'Bookings that start after hours' },
  { value: '7 days', cyan: false, label: 'Deposit to live, on average' },
];

// ── Video slots ────────────────────────────────────────────────────────────
// No footage shipped with the handoff, so every slot renders as a labelled
// placeholder frame. To go live, set `embedUrl` and swap the placeholder for
// the player: poster + click-to-play, lazy iframe, never autoplay with sound.
export const tour = {
  eyebrow: 'The two-minute tour',
  title: 'Watch a lead land at 11:40pm, and pay before you wake up.',
  lede: 'One take, no slides. The desk answers, quotes the pack, takes payment and puts it on your calendar.',
  tag: 'Full walkthrough',
  duration: '2:14',
  caption: 'Video placeholder. Drop your walkthrough or embed here.',
  embedUrl: null as string | null,
};

export const chapters: Array<{
  time: string;
  accent: Accent;
  title: string;
  body: string;
  embedUrl: string | null;
}> = [
  { time: '0:47', accent: 'cyan', title: 'Booked and paid in 47 seconds', body: 'A first-timer picks Sunday 6:30 and buys the 10-pack.', embedUrl: null },
  { time: '1:05', accent: 'purple', title: 'A lead at 11:40pm', body: 'The receptionist answers, routes and holds the spot.', embedUrl: null },
  { time: '0:52', accent: 'green', title: 'Sunday is your busiest hour', body: 'Reading the week and deciding what to open next.', embedUrl: null },
];

export const proof = {
  label: 'Running the desk for teachers, makers and corner shops',
  // Placeholder plates. Replace with monochrome client SVGs at ~24-28px optical height.
  plateCount: 6,
  metrics: [
    { label: 'Desks running', value: '212', hint: 'Across 9 service categories' },
    { label: 'Answered after hours', value: '61%', hint: 'Of all new leads' },
    { label: 'Paid before the job', value: '92%', hint: 'Deposit or full pack' },
    { label: 'Days to live', value: '7', hint: 'From deposit to open' },
  ] satisfies Stat[],
};

export const audiences: Array<{ n: string; accent: Accent; title: string; body: string }> = [
  { n: '01', accent: 'cyan', title: 'Teachers & coaches', body: 'Lessons, packs and rebooks that fill themselves.' },
  { n: '02', accent: 'purple', title: 'Community builders', body: 'Gatherings and sign-ups without the group chat.' },
  { n: '03', accent: 'green', title: 'Corner shops', body: 'A counter that never closes, even on Sunday.' },
  { n: '04', accent: 'pink', title: 'Mobile & delivery', body: 'Orders and drop-offs booked while you drive.' },
  { n: '05', accent: 'amber', title: 'Side hustles', body: 'Runs on its own while you work the day job.' },
];

export const audienceFootnote =
  'Tutors · trainers · cleaners · detailers · studios · clinics · salons';

export const withoutItems = [
  'Calls and texts pile up while you work.',
  'People leave when no one answers fast.',
  'You chase payments after the job is done.',
  'Your nights off are not really off.',
];

export const withItems = [
  'People book and buy themselves, day and night.',
  'Every lead gets a warm answer in seconds.',
  'You get paid up front, before you start.',
  'Your time goes back to the work you love.',
];

export const parts = {
  desk: {
    eyebrow: 'Part one',
    title: 'The Front Desk',
    body: 'Your storefront that is always open. People pick a time, choose a service or a pack, and pay, all on their own, in under a minute. No phone tag. No invoices. The money lands before the first appointment.',
    checks: [
      'Pick a time and book in seconds',
      'Pay up front, or buy a multi-pack',
      'Rebook with one tap, come back again',
    ],
  },
  reception: {
    eyebrow: 'Part two',
    title: 'The Receptionist',
    body: 'The friendly front door of your business. Like a five star hotel, it greets every call, text and message, then points each person to the right place, answers the easy questions, and books them in, so nothing slips through.',
    checks: [
      'Greets every new lead in seconds',
      'Routes them to the right service or answer',
      'Hands you only the people who need you',
    ],
  },
  insights: {
    eyebrow: 'Part three',
    title: 'The Insights',
    body: 'It reads what is happening so you always know your next move. When people book. What they buy. What they skip. That kind of reporting used to cost enterprise money. Here it comes with the desk.',
    checks: [
      'See your busiest hours before you guess',
      'Know which pack actually sells',
      'One weekly note, in plain words',
    ],
  },
};

export const insightStats: Stat[] = [
  { label: 'Booked', value: '18', hint: 'This week' },
  { label: 'Packs sold', value: '4', hint: 'Up from 2' },
  { label: 'After hours', value: '11', hint: 'Answered by the desk' },
];

export const featuredTestimonial = {
  tag: 'Video story',
  duration: '1:38',
  quote: 'I stopped losing the Sunday-night people. That was the whole business, and I never knew it.',
  name: 'Client Name',
  role: 'Piano teacher · placeholder city',
  caption: 'Video placeholder. Drop the clip or embed here.',
  embedUrl: null as string | null,
};

export const resultCards: Array<{
  tag: 'green' | 'cyan';
  tagText: string;
  quote: string;
  name: string;
  role: string;
}> = [
  { tag: 'green', tagText: '+$4.2k / month', quote: 'Packs sell themselves now. I used to talk people into them on the phone. Badly.', name: 'Client Name', role: 'Mobile detailer · placeholder city' },
  { tag: 'cyan', tagText: '18 bookings / week', quote: 'My phone is quiet and my calendar is full. I did not think both were possible.', name: 'Client Name', role: 'Yoga studio · placeholder city' },
];

export const gridTestimonials = [
  { quote: 'I stopped losing the Sunday-night people.', name: 'Client Name', role: 'Piano teacher' },
  { quote: 'Packs sell themselves now.', name: 'Client Name', role: 'Mobile detailer' },
  { quote: 'My phone is quiet and my calendar is full.', name: 'Client Name', role: 'Yoga studio' },
];

export const compactQuotes = [
  { quote: 'Onboarding was one conversation. I sent nothing, built nothing.', who: 'Client Name · Cleaning crew' },
  { quote: 'Deposits up front changed my whole month. No more chasing.', who: 'Client Name · Tutor' },
  { quote: 'It answers nicer than I do at midnight. Honestly.', who: 'Client Name · Barber' },
];

export const results: Stat[] = [
  { label: 'More money', value: '+31%', hint: 'Revenue collected up front' },
  { label: 'Less stress', value: '0', hint: 'Missed calls after hours' },
  { label: 'Time back', value: '6 hrs', hint: 'Admin returned each week' },
  { label: 'Repeat rate', value: '2.4×', hint: 'Rebooks per client' },
];

export const truth = {
  eyebrow: 'The truth',
  title: 'Nobody stays up at night thinking about you.',
  lede: 'The big companies get the systems, the support, the tools that make it all run. The small business owner is left to figure it out alone.',
  ledeStrong: 'We build for you. All day. Systems that carry the weight, so you make more, stress less, and stop being the only reason things move.',
};

export const beliefs: Array<{ accent: Accent; title: string; body: string }> = [
  { accent: 'cyan', title: 'It reads your numbers', body: 'When people book, what they buy, what they skip. That insight used to cost enterprise money. Now it is yours.' },
  { accent: 'purple', title: 'We do not have to be here', body: 'We could build for the giants. We choose you, on purpose, every day.' },
  { accent: 'pink', title: 'We pick who we work with', body: 'Your standard. Your care. How you treat the people you serve. We work with the ones who take it seriously.' },
];

export type Milestone = 'proposed' | 'met' | 'mapped' | 'launched';

export const steps: Array<{ n: string; milestone: Milestone; title: string; body: string }> = [
  { n: '01', milestone: 'proposed', title: 'Deposit', body: `Pay ${DEPOSIT_AMOUNT}. You skip the line and we book your onboarding this week.` },
  { n: '02', milestone: 'met', title: 'Onboarding', body: 'You talk. We pull your business logic into the system. This is the fun part.' },
  { n: '03', milestone: 'mapped', title: 'Build', body: 'We install your Front Desk and Receptionist. You do nothing.' },
  { n: '04', milestone: 'launched', title: 'Live', body: 'It goes to work, and 3 months of maintenance are free.' },
];

export const inclusions = [
  'Booking pages for every service',
  'Checkout, deposits and multi-packs',
  'Receptionist across text, chat and DMs',
  'Reminders, rebooks and no-show nudges',
  'Weekly insight note in plain words',
  'Your voice and rules, not a template',
  'Onboarding call this week',
  '3 months of maintenance free',
];

export const promise = {
  title: 'Our promise, in one line',
  body: 'If your desk is not live within 14 days of onboarding, your deposit comes back.',
  caveat: 'Placeholder terms. Confirm before publishing.',
};

export const priceCard = {
  bonusTag: 'Season bonus active',
  spots: '3 spots this week',
  amount: DEPOSIT_AMOUNT,
  unit: 'deposit',
  body: 'Holds your onboarding call this week and comes off your build. Remaining balance quoted after onboarding.',
  caveat: 'Placeholder pricing.',
  rows: [
    { label: 'Onboarding call', value: 'This week', green: false },
    { label: 'Build time', value: '~7 days', green: false },
    { label: 'Maintenance', value: '3 months free', green: true },
    { label: 'Contract', value: 'None', green: false },
  ],
  foot: 'Pricing and bonuses change with the season.',
};

export const faqs = [
  { q: 'Do I need to be technical?', a: 'No. You talk once at onboarding and we build the rest. Placeholder answer. Replace with your real copy.' },
  { q: 'What happens after the deposit?', a: 'You get a booking link for your onboarding call this week, then a build window of about seven days. Placeholder answer.' },
  { q: 'Does it work with the tools I already use?', a: 'Calendar, payments and your phone number stay yours. Placeholder answer. List the integrations you support.' },
  { q: 'Will it sound like a robot?', a: 'It speaks in your words, with your rules, and hands off to you when a person needs a person. Placeholder answer.' },
  { q: 'What does it cost after the deposit?', a: 'Placeholder pricing. Add your build price and monthly figure here so nobody has to guess.' },
  { q: 'Why do you pick who you work with?', a: 'Because this is more than the money. We work with owners who take care of the people they serve. Placeholder answer.' },
];

export const finalCta = {
  eyebrow: 'Get in front of the line',
  title: 'Start today.',
  sub: `Pay the ${DEPOSIT_AMOUNT} deposit and lock your onboarding call this week. The bonus of 3 months of maintenance free is on while the season lasts.`,
  primary: `Pay ${DEPOSIT_AMOUNT} and skip the line`,
  secondary: 'Book a free 20-minute tour',
  foot: 'Prefer to look first? The tour is 20 minutes and there is no pitch at the end.',
};
