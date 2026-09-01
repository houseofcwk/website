// Content for /business-support and its three stage pages.
//
// These pages are the destination of a printed QR code
// (resources/design/qr/cwk-qr-business-support.png, which encodes
// /businesssupport and is redirected in public/_redirects).
//
// They are deliberately closed rooms: no site nav, no footer links, no
// cross-links back into the marketing site. The only ways out are the CWK.
// logo and the options the page itself puts in front of the visitor. Keep it
// that way when editing (issue #240).

export const WHATSAPP_NUMBER = '15124872555';
export const WHATSAPP_DISPLAY = '(512) 487-2555';
export const EMAIL = 'hello@cwkexperience.com';

// Calendly event used everywhere else on the site for the Experience Tour.
// The stage pages embed it inline rather than sending people off-site.
export const TOUR_URL = 'https://calendly.com/cwkexperience/experience-tour';

// Brand-matched inline embed: CWK ink background, off-white text, cyan accent.
// hide_gdpr_banner keeps Calendly's own banner from stacking on ours.
export const TOUR_EMBED_URL =
  `${TOUR_URL}?hide_gdpr_banner=1&background_color=0b0e18&text_color=eef0ff&primary_color=00e5ff`;

/** WhatsApp deep link carrying a stage-aware first message. */
export function whatsappHref(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export type StageKey = 'stage-one' | 'stage-two' | 'stage-three';
export type StageAccent = 'cyan' | 'purple' | 'green';

export interface Stage {
  key: StageKey;
  /** 1-based. Drives the "one of three" progress dots. */
  index: number;
  ordinal: string;
  accent: StageAccent;
  /** The sentence a visitor picks on the chooser. */
  where: string;
  chooserCta: string;
  headline: string;
  lede: string;
  videoId: string;
  /** The video's real title on the CWK. Experience channel, kept for the record. */
  videoTitle: string;
  /** Badge in the corner of the video frame. Rendered uppercase. */
  badge: string;
  cover: string;
  /**
   * Line under the video frame. Null renders no caption bar at all, which is
   * where all three stages sit: the caption repeated the title burned into
   * the thumbnail and the headline directly above it.
   */
  caption: string | null;
  tourSub: string;
  whatsappMessage: string;
  seoTitle: string;
  seoDescription: string;
}

export const landing = {
  eyebrow: 'Business Support',
  headline: 'Business support for small businesses.',
  lede: 'There is no one size fits all in business.',
  chooseLabel: 'Choose your support level',
  seoTitle: 'Business Support for Small Businesses | CWK. Experience',
  seoDescription:
    'Three ways in, depending on where your business is today. Start with a free training, then talk to a real person at CWK.',
};

export const stages: Stage[] = [
  {
    key: 'stage-one',
    index: 1,
    ordinal: 'One',
    accent: 'cyan',
    where: "I don't have a business yet.",
    chooserCta: 'Free training: what starting actually takes',
    headline: "Whatever you decide after this, you'll know what it actually takes.",
    lede:
      'The real picture from someone who has been through it, before you quit anything or spend a dollar.',
    videoId: 'c6uYEegkBfA',
    videoTitle: 'Starting or Thinking About A Business',
    badge: 'Free training',
    cover: '/images/business-support/stage-one-cover.webp',
    caption: null,
    tourSub: 'Talk it through with a person before you commit to anything',
    whatsappMessage:
      "Hi CWK. I watched the Stage One training. I'm thinking about starting a business.",
    seoTitle: 'Stage One: Thinking About Starting a Business | CWK.',
    seoDescription:
      'Free training on what starting a business actually takes, before you quit anything or spend a dollar. Then book a free Experience Tour with CWK.',
  },
  {
    key: 'stage-two',
    index: 2,
    ordinal: 'Two',
    accent: 'purple',
    where: "I have a business. It's not making enough yet.",
    chooserCta: 'Free training: see exactly what is in the way',
    headline: "You have a business. It's just not where you want it to be yet.",
    lede:
      "That's fixable, and it's more common than anyone admits. This training shows you what is actually in the way.",
    videoId: 'mVQomEthEQQ',
    videoTitle: 'Making Some Money But Want More',
    badge: 'Free training',
    cover: '/images/business-support/stage-two-cover.webp',
    caption: null,
    tourSub: "Bring your numbers and we'll build a plan around where you actually are",
    whatsappMessage:
      'Hi CWK. I watched the Stage Two training. I have a business and I want it earning more.',
    seoTitle: 'Stage Two: Make Your Business Earn More | CWK.',
    seoDescription:
      "Free training on why your business isn't earning enough yet and what to fix first. Then book a free Experience Tour with CWK.",
  },
  {
    key: 'stage-three',
    index: 3,
    ordinal: 'Three',
    accent: 'green',
    where: "I have a business that's ready to scale.",
    // Labelled as the booking, though the card still routes to the stage page:
    // the training plays first and the calendar sits under it. Kris's call.
    chooserCta: 'Book a Free Experience Tour',
    headline: "You're already doing this. Now you need a partner who can carry the next level.",
    lede:
      'More money and less stress, without putting more on your plate. See how the partnership runs, then book a tour.',
    videoId: 't0JwVqQsAAo',
    videoTitle: 'Growing and want DFY support',
    badge: 'Done for you support',
    cover: '/images/business-support/stage-three-cover.webp',
    caption: null,
    tourSub: "See if we're the right fit for your next stage",
    whatsappMessage:
      'Hi CWK. I watched the Stage Three training. I want to talk about done-for-you support.',
    seoTitle: 'Stage Three: Done-For-You Business Support | CWK.',
    seoDescription:
      'Free training on what done-for-you support looks like when your business is ready to scale. Then book a free Experience Tour with CWK.',
  },
];

export const stageByKey: Record<StageKey, Stage> = Object.fromEntries(
  stages.map((s) => [s.key, s]),
) as Record<StageKey, Stage>;
