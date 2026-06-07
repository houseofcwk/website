// Lifestyle Calculator: static content + types.
// Drives the multi-step tool at /lifestyle-calculator. All copy lives here so
// the page itself stays presentational. No em-dashes anywhere (CWK-24).

export type CategoryKey = 'creative' | 'business' | 'other';
export type SpeedKey = 'turtle' | 'car' | 'rocket';
export type ArchetypeKey =
  | 'explorer'
  | 'committer'
  | 'builder'
  | 'operator'
  | 'sovereign';
export type MineKey =
  | 'visibility'
  | 'money'
  | 'imposter'
  | 'shiny'
  | 'validation';

export interface SubOption {
  id: string;
  label: string;
  desc: string;
}

export interface CategoryDef {
  key: CategoryKey;
  label: string;
  icon: string;            // Inline SVG path data
  desc: string;
  subOptions?: SubOption[];
}

export interface ArchetypeDef {
  key: ArchetypeKey;
  name: string;
  tag: string;             // "STAGE 01"
  stage: number;           // 1..5
  feeling: string;
  cost: string;
  next: string;
}

export interface MineDef {
  key: MineKey;
  label: string;
  desc: string;
  stat: string;
  fix: string;
}

export interface PersonRef {
  who: string;
  note: string;
  cost: string | null;
}

export interface SpeedPeople {
  list: PersonRef[];
  total: string;
  truth: string;
}

export interface PhaseStep {
  name: string;            // "PHASE 1"
  sub: string;             // "PROOF"
  time: string;            // "Days 1, 30"
  focus: string;
  tasks: string[];
}

// ---------------------------------------------------------------------------
//  Categories
// ---------------------------------------------------------------------------

export const CATEGORIES: CategoryDef[] = [
  {
    key: 'creative',
    label: 'Creative Services',
    icon: 'creative',
    desc: 'Design, photography, video, writing, music, content, and any service where the work is the art.',
  },
  {
    key: 'business',
    label: 'Business Services',
    icon: 'business',
    desc: 'Coaching, consulting, strategy, marketing, operations, legal, finance, and any service where the work is the thinking.',
  },
  {
    key: 'other',
    label: 'Other',
    icon: 'other',
    desc: 'Home services, trades, local services, or any other service business that does not fit the categories above.',
  },
];

// ---------------------------------------------------------------------------
//  Archetypes (where you are right now)
// ---------------------------------------------------------------------------

export const ARCHETYPES: ArchetypeDef[] = [
  {
    key: 'explorer',
    name: 'Explorer',
    tag: 'STAGE 01',
    stage: 1,
    feeling:
      'Wide open and slightly terrifying. You have something pulling at you but nothing proven yet. Some days feel like possibility. Other days feel like everyone else figured out something you have not.',
    cost: 'Mistaking preparation for progress.',
    next: 'Pick one thing. Pick one person. Have one real conversation before the week is over.',
  },
  {
    key: 'committer',
    name: 'Committer',
    tag: 'STAGE 02',
    stage: 2,
    feeling:
      'Motivated but impatient. You are doing the work. The evidence is just slow to arrive. You know what you want to build, you just cannot tell yet if the market agrees.',
    cost: 'Preparation replacing proof.',
    next: 'Ship the imperfect thing. Get real feedback from a real human before adjusting anything.',
  },
  {
    key: 'builder',
    name: 'Builder',
    tag: 'STAGE 03',
    stage: 3,
    feeling:
      'Busy and behind at the same time. You are doing a lot and some of it is working but you cannot tell which parts. There is a low-grade exhaustion underneath everything.',
    cost: 'No system underneath the revenue. Every good month feels like luck because without a system underneath it, it was.',
    next: 'Track every dollar that came in over the last 90 days. Write down exactly where each one came from.',
  },
  {
    key: 'operator',
    name: 'Operator',
    tag: 'STAGE 04',
    stage: 4,
    feeling:
      'The money anxiety is mostly gone but a new kind of weight has arrived. You are the answer to every question inside the business. You are good at your work but tired of being indispensable.',
    cost: 'Being the bottleneck in your own business. Every decision runs through you.',
    next: 'Write down every recurring decision you make in a week. Find the ones someone else could make with a clear process.',
  },
  {
    key: 'sovereign',
    name: 'Sovereign',
    tag: 'STAGE 05',
    stage: 5,
    feeling:
      'Spacious but searching. The urgency is gone and something quieter has taken its place. You are proud of what you built. You are also asking bigger questions about what comes next.',
    cost: 'Drift. When the urgency of survival is gone, decisions start getting made from habit or boredom instead of intention.',
    next: 'Write one sentence describing what you want this business to look like in three years.',
  },
];

// ---------------------------------------------------------------------------
//  Tools by speed and category
// ---------------------------------------------------------------------------

// EDIT (step 7): brand names removed. Recommended tools are now generic
// categories with price ranges. NOTE: price ranges below are sensible defaults
// (well-known SaaS bands) — confirm/replace with your preferred figures.
export interface RecommendedTool {
  label: string;
  price: string;
}
export const RECOMMENDED_TOOLS: RecommendedTool[] = [
  { label: 'Online scheduling and booking tool', price: '$0 to $30/month' },
  { label: 'Email marketing platform', price: '$30 to $100/month' },
  { label: 'Simple CRM or pipeline tracker', price: '$0 to $50/month' },
  { label: 'Invoicing and payments tool', price: '$0 to $25/month' },
  { label: 'Community or membership platform', price: '$25 to $100/month' },
];
export const RECOMMENDED_TOOLS_TOTAL =
  'Estimated total: $55 to $305/month depending on tools selected.';

// ---------------------------------------------------------------------------
//  Skills by category
// ---------------------------------------------------------------------------

// EDIT (step 1 cascade): re-keyed to the new service categories. NOTE: these
// bullets are drafted from the category descriptions — review/replace the copy.
export const SKILLS: Record<CategoryKey, string[]> = {
  creative: [
    'Packaging your craft into a clear, priced, productized offer.',
    'Building a portfolio and referral system that fills your calendar.',
    'Running discovery calls that scope the work and convert without pressure.',
    'Price anchoring: charging for the outcome, not the hours.',
  ],
  business: [
    'Writing thought-leadership content that attracts the right clients.',
    'Running sales conversations that qualify and close without pressure.',
    'Packaging expertise into a clear, priced, deliverable engagement.',
    'Positioning: making your offer clearly different, not just better.',
  ],
  other: [
    'Building a referral and review system that keeps the pipeline full.',
    'Marketing that brings the right people specifically to you.',
    'Quoting and scheduling work so margins stay healthy.',
    'Client retention: turning one-time work into recurring revenue.',
  ],
};

// ---------------------------------------------------------------------------
//  People you need by speed
// ---------------------------------------------------------------------------

export const PEOPLE: Record<SpeedKey, SpeedPeople> = {
  turtle: {
    list: [
      { who: 'Accountability partner', note: 'Free, a peer on the exact same path who holds you to your word.', cost: null },
      { who: 'Peer community', note: 'Others building what you are building so you are not alone in the gap.', cost: '$0 to $100/mo' },
    ],
    total: '~$0 to $200/month',
    truth:
      'The financial cost is low. The real cost is time, isolation, and the invisible blind spots nobody ever catches.',
  },
  car: {
    list: [
      { who: 'Mentor or business coach', note: 'Someone who has already done what you are trying to do.', cost: '$500 to $1,500/mo' },
      { who: 'Part-time virtual assistant', note: 'Removes admin work and creates protected time for revenue activity.', cost: '$300 to $800/mo' },
      { who: 'Peer mastermind or community', note: 'Real accountability with real people and real stakes.', cost: '$200 to $500/mo' },
    ],
    total: '~$1,000 to $2,800/month',
    truth:
      'The highest-ROI tier in this game. The right mentor compresses 12 months of costly mistakes into 30 days of borrowed experience.',
  },
  rocket: {
    list: [
      { who: 'Business coach or advisor', note: 'Operator-level experience. Not cheerleading, actual pattern recognition.', cost: '$2,000 to $5,000/mo' },
      { who: 'VA or OBM', note: 'Runs the back office so your hours are spent on revenue, not operations.', cost: '$1,000 to $2,500/mo' },
      { who: 'Specialist hire', note: 'Copywriter, designer, or ads manager. One key skill bought, not built.', cost: '$1,000 to $3,000/mo' },
      { who: 'Peer mastermind', note: 'People operating at the level you are building toward.', cost: '$500 to $1,500/mo' },
    ],
    total: '~$4,500 to $12,000/month',
    truth:
      'This is the investment profile of someone building fast. The cost is real. So is the speed gain and the avoided mistake tax.',
  },
};

// ---------------------------------------------------------------------------
//  Phases by archetype
// ---------------------------------------------------------------------------

export const PHASES: Record<ArchetypeKey, PhaseStep[]> = {
  explorer: [
    { name: 'PHASE 1', sub: 'PROOF', time: 'Days 1 to 30', focus: 'One real conversation. Nothing else matters yet.', tasks: ['Write one sentence: "I help [who] do [what]"', 'Post 3 times about what you already know', 'DM 5 real people who could use this today', 'Have 1 honest conversation before the week ends'] },
    { name: 'PHASE 2', sub: 'FIRST SALE', time: 'Month 1 to 3', focus: 'Name a price. Say it out loud. Get a yes.', tasks: ['Package what got validated into a real offer', 'Set a price. Start fair, then double it.', 'Ask someone to buy before it is ready', 'Deliver and collect your first real testimonial'] },
    { name: 'PHASE 3', sub: 'CONSISTENCY', time: 'Month 3 to 6', focus: 'Make the first thing happen three times in a row.', tasks: ['Build a weekly content habit on one platform only', 'Create a simple follow-up sequence for leads', 'Ask every client for one referral', 'Track where every dollar came from'] },
    { name: 'PHASE 4', sub: 'SYSTEM', time: 'Month 6+', focus: 'Remove yourself from the chaos. Build the machine.', tasks: ['Document your client onboarding start to finish', 'Build a repeatable sales script', 'Set revenue thresholds before the next hire', 'Decide what you are optimizing for now'] },
  ],
  committer: [
    { name: 'PHASE 1', sub: 'EVIDENCE', time: 'Days 1 to 30', focus: 'Stop preparing. Get a real answer from a real human.', tasks: ['Go live with the offer, imperfect is fine', 'Have 3 real sales conversations this week', 'Track every yes, every no, every reason', 'Do not adjust the offer until you have 5 nos with a reason'] },
    { name: 'PHASE 2', sub: 'FIRST YES', time: 'Month 1 to 2', focus: 'Close one sale. Everything else is still research.', tasks: ['Follow up on every past conversation', 'Ask directly: "Are you ready to start?"', 'Get paid, deliver, do not wait for perfect', 'Document the exact path from first contact to paying client'] },
    { name: 'PHASE 3', sub: 'REPEATABILITY', time: 'Month 2 to 5', focus: 'Was that first yes a pattern or a fluke?', tasks: ['Identify what your paying clients have in common', 'Build one piece of content around that exact profile', 'Run the same conversation 5 more times', 'Collect 3 real testimonials in writing'] },
    { name: 'PHASE 4', sub: 'MOMENTUM', time: 'Month 5+', focus: 'Turn the pattern into a process.', tasks: ['Create a simple outreach template that scales', 'Build a 3-email follow-up sequence', 'Get one referral from every satisfied client', 'Set monthly revenue minimums and reverse-engineer them'] },
  ],
  builder: [
    { name: 'PHASE 1', sub: 'AUDIT', time: 'Days 1 to 30', focus: 'Find out where your money actually comes from.', tasks: ['List every dollar that came in over the last 90 days', 'Write exactly where each one came from', 'Find the one source that produced the most', 'Stop doing the things that produced zero'] },
    { name: 'PHASE 2', sub: 'STRUCTURE', time: 'Month 1 to 3', focus: 'Build the minimum system that makes it repeatable.', tasks: ['Create a repeatable client acquisition process', 'Document your delivery so someone else could run it', 'Set one KPI you will track every single week', 'Identify the first thing to delegate off your plate'] },
    { name: 'PHASE 3', sub: 'DELEGATION', time: 'Month 3 to 6', focus: 'Get the first task off your plate. Then do it again.', tasks: ['Hire or contract for the most repetitive work', 'Write the process before handing it off', 'Review output weekly, do not ghost the handoff', 'Set a rule: when revenue hits X, I hire for Y'] },
    { name: 'PHASE 4', sub: 'STABILIZE', time: 'Month 6+', focus: 'Predictable months, not lucky ones.', tasks: ['Hit the same revenue target 3 months in a row', 'Know your average sales cycle to the day', 'Build a pipeline that fills 30 days ahead always', 'Run a monthly P&L. Know your real margin.'] },
  ],
  operator: [
    { name: 'PHASE 1', sub: 'DOCUMENT', time: 'Days 1 to 30', focus: 'Get recurring decisions out of your head and into writing.', tasks: ['List every recurring decision you make in a week', 'Find 3 that someone else could make with a clear process', 'Write one process doc, one page maximum', 'Let someone else make that call once this week'] },
    { name: 'PHASE 2', sub: 'DELEGATE', time: 'Month 1 to 3', focus: 'Hand one thing off fully. Not conditionally.', tasks: ['Pick the task you are most tired of', 'Write the process, hire the person, step back fully', 'Check in once a week max for the first month', 'Measure the output, not your comfort with the method'] },
    { name: 'PHASE 3', sub: 'REMOVE YOURSELF', time: 'Month 3 to 6', focus: 'The business runs 2 weeks without you in it.', tasks: ['Test it. Actually disappear for 3 days.', 'Fix every gap that surfaces without doing it yourself', 'Promote or hire someone to hold the center', 'Define what decisions truly require your specific judgment'] },
    { name: 'PHASE 4', sub: 'SCALE', time: 'Month 6+', focus: 'Build the version that does not need you to be indispensable.', tasks: ['Identify the next revenue lever: team, offer, or market', 'Build infrastructure for the next stage before you need it', 'Assess the leadership layer. Is it strong enough?', 'Set a 3-year vision and reverse-engineer it into quarters'] },
  ],
  sovereign: [
    { name: 'PHASE 1', sub: 'CLARITY', time: 'Days 1 to 30', focus: 'Define what the next chapter is actually for.', tasks: ['Write one sentence: what does this look like in 3 years?', 'Identify where you are deciding from habit, not intention', 'Separate what you love from what you are good at', 'Decide your actual role inside this thing going forward'] },
    { name: 'PHASE 2', sub: 'ENCODE', time: 'Month 1 to 3', focus: 'Turn what you built into something that outlasts your attention.', tasks: ['Document the core IP and systems that make this work', 'Build the leadership layer that can run it without you', 'Define success for the next generation of this work', 'Identify what you want to stop doing entirely'] },
    { name: 'PHASE 3', sub: 'NEW PLAY', time: 'Month 3 to 6', focus: 'Start the next game. Do not wait for the old one to end.', tasks: ['Identify the next asset you want to build', 'Run one low-stakes, full-attention experiment', 'Be honest about what you are building toward now', 'Protect the space that lets you operate at this level'] },
    { name: 'PHASE 4', sub: 'COMPOUND', time: 'Month 6+', focus: 'Build the system that makes expertise multiply.', tasks: ['Formalize your IP into transferable frameworks', 'Build or join a high-level peer network', 'Identify the next real inflection point for the business', 'Start asking what is possible, not just what is necessary'] },
  ],
};

// ---------------------------------------------------------------------------
//  Mind Mines
// ---------------------------------------------------------------------------

export const MINES: MineDef[] = [
  {
    key: 'visibility',
    label: 'Fear of visibility',
    desc: 'Posting publicly, being seen, putting your name on something. It feels exposing.',
    stat: '61% of founders delete their first draft before ever posting.',
    fix: 'The fix is not confidence. It is volume. Post badly enough times that it stops feeling dangerous, because it stops being novel.',
  },
  {
    key: 'money',
    label: 'Money ceiling',
    desc: 'Charging what your work is worth feels wrong, greedy, or genuinely out of reach.',
    stat: 'Service providers undercharge by 20 to 40% in their first year on average.',
    fix: 'Your rate is not your worth. But it becomes your ceiling if you do not change it first. Price the transformation, not your time.',
  },
  {
    key: 'imposter',
    label: 'Imposter syndrome',
    desc: 'You wonder if you are the right person for this, even with real proof that you are.',
    stat: '70% of high achievers experience regular imposter syndrome.',
    fix: 'It does not go away by thinking harder. It goes away the moment your first client says "this changed everything." You earn your way out of it.',
  },
  {
    key: 'shiny',
    label: 'Shiny object syndrome',
    desc: 'You start strong, then pivot. The next idea always looks more promising than this one.',
    stat: 'The average entrepreneur pivots 3 to 5 times before committing. Each costs 3 to 6 months of compounding.',
    fix: 'Picking wrong and learning fast is 4x more effective than picking perfect and waiting. One idea. One offer. One year.',
  },
  {
    key: 'validation',
    label: 'Need for external validation',
    desc: 'You need someone to say it is good before you move. Silence stops you cold.',
    stat: 'Founders waiting for external validation take 2x longer to reach first revenue.',
    fix: 'The only validation that actually moves the game is a paid invoice. Everything before that is noise dressed up as preparation.',
  },
];

// ---------------------------------------------------------------------------
//  Speed copy
// ---------------------------------------------------------------------------

export interface SpeedDef {
  key: SpeedKey;
  label: string;
  time: string;
  desc: string;
}

export const SPEEDS: SpeedDef[] = [
  {
    key: 'turtle',
    label: 'Turtle',
    time: '18 to 36 months',
    desc: 'Slow and steady. Lower pressure. The risk is losing momentum before the results ever appear.',
  },
  {
    key: 'car',
    label: 'Car',
    time: '9 to 18 months',
    desc: 'Focused and consistent. Real momentum compounds when time is protected, not leftover.',
  },
  {
    key: 'rocket',
    label: 'Rocket Ship',
    time: '3 to 9 months',
    desc: 'All in. High investment of time, money, and energy. The math only works if the hours are real.',
  },
];

// EDIT (step 5): months now derive from the Speed pick (outer range), since the
// "Months to hit your goal" input was removed. Turtle 36 / Car 18 / Rocket 9.
export const SPEED_MONTHS: Record<SpeedKey, number> = {
  turtle: 36,
  car: 18,
  rocket: 9,
};

// Hero summary SPEED stat (step 7): emoji + the speed's headline range (SPEEDS.time).
export const SPEED_EMOJI: Record<SpeedKey, string> = {
  turtle: '🐢',
  car: '🚗',
  rocket: '🚀',
};

export const SPEED_TOOL_COST: Record<SpeedKey, string> = {
  turtle: 'Low to zero',
  car: 'Moderate, $50 to $200/mo',
  rocket: 'Significant, $300 to $800/mo',
};

// EDIT (step 7): the "Time to goal" solo column now matches the speed's headline
// range (e.g. Rocket Ship -> "3 to 9 months"); "with right people" is faster.
export const SPEED_TIME_LABELS: Record<SpeedKey, { solo: string; supported: string }> = {
  turtle: { solo: '18 to 36 months', supported: '12 to 24 months' },
  car: { solo: '9 to 18 months', supported: '6 to 12 months' },
  rocket: { solo: '3 to 9 months', supported: '2 to 6 months' },
};

// ---------------------------------------------------------------------------
//  Saved state shape (used by localStorage + email API)
// ---------------------------------------------------------------------------

export interface CalculatorState {
  ideaCategory: CategoryKey | '';
  ideaType: string;
  archetype: ArchetypeKey | '';
  monthlyGoal: number;
  offerPrice: number;
  hoursWeek: number;
  timeMonths: number;
  speed: SpeedKey | '';
  s2l: number;
  l2s: number;
  mines: MineKey[];
}
