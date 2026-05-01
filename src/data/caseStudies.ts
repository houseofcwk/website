// Hardcoded fallback dataset for the 10 case studies surfaced on /case-studies.
// Sanity is the source of truth in production; this file backs the build whenever
// a case study has not yet been authored in the CMS or the request to Sanity fails.

export type CardSurface =
  | 'charcoal'
  | 'marble-light'
  | 'marble-stone'
  | 'wood'
  | 'holographic'
  | 'crimson'
  | 'isometric-dark'
  | 'glow-blue'
  | 'glass';

export interface PtSpan {
  _type: 'span';
  text: string;
  marks?: string[];
}

export interface PtBlock {
  _type: 'block';
  style: 'normal' | 'h2' | 'h3' | 'blockquote';
  listItem?: 'bullet' | 'number';
  level?: number;
  children: PtSpan[];
  markDefs?: unknown[];
}

export interface PtImage {
  _type: 'image';
  src: string;
  alt: string;
  caption?: string;
}

export interface PtGallery {
  _type: 'gallery';
  columns?: 1 | 2 | 3;
  images: { src: string; alt: string; caption?: string }[];
}

export interface PtVideoEmbed {
  _type: 'videoEmbed';
  url: string;
  title?: string;
  caption?: string;
}

export interface PtCallout {
  _type: 'callout';
  tone?: 'info' | 'success' | 'warn' | 'quote';
  text: string;
  attribution?: string;
}

export type PtBlockAny = PtBlock | PtImage | PtGallery | PtVideoEmbed | PtCallout;

export interface CaseStudy {
  slug: string;
  client: string;
  tagline?: string;
  category: string;
  medium: string;
  cardSurface: CardSurface;
  cardAccent: string;
  cardImage?: string;
  cardImageAlt?: string;
  cardDescription: string;
  cardStat: { num: string; label: string };
  order: number;
  headline: string;
  duration?: string;
  result?: string;
  resultLabel?: string;
  stats?: { value: string; label: string }[];
  body: PtBlockAny[];
  testimonial?: { quote: string; author: string; role?: string };
  seo?: { title?: string; description?: string };
}

// ── helpers ──────────────────────────────────────────────────────────────────

const p = (text: string): PtBlock => ({
  _type: 'block',
  style: 'normal',
  children: [{ _type: 'span', text }],
});
const h2 = (text: string): PtBlock => ({
  _type: 'block',
  style: 'h2',
  children: [{ _type: 'span', text }],
});
const h3 = (text: string): PtBlock => ({
  _type: 'block',
  style: 'h3',
  children: [{ _type: 'span', text }],
});
const quote = (text: string, attribution?: string): PtCallout => ({
  _type: 'callout',
  tone: 'quote',
  text,
  attribution,
});
const bullet = (text: string): PtBlock => ({
  _type: 'block',
  style: 'normal',
  listItem: 'bullet',
  level: 1,
  children: [{ _type: 'span', text }],
});
const yt = (url: string, title?: string, caption?: string): PtVideoEmbed => ({
  _type: 'videoEmbed',
  url,
  title,
  caption,
});

// ── case studies ─────────────────────────────────────────────────────────────

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'rob-dial',
    client: 'Rob Dial',
    category: 'PODCAST HOST',
    medium: 'PODCAST',
    cardSurface: 'charcoal',
    cardAccent: '#00E5FF',
    cardImage: '/images/case-studies/rob-dial/hero-01.webp',
    cardImageAlt: 'Rob Dial — The Mindset Mentor podcast portrait',
    cardDescription: 'Scaled a one-person media role into a full content operation.',
    cardStat: { num: '10x', label: 'Content Output' },
    order: 1,
    headline: 'How a One-Person Media Role Became a Scalable Content Operation',
    duration: '3.5 years · Aug 2019 – Jan 2023',
    result: '10x',
    resultLabel: 'Content output',
    stats: [
      { value: '10x', label: 'Content Output' },
      { value: '$1M → $5M', label: 'Revenue Growth' },
      { value: '84', label: 'Pieces / Month' },
    ],
    body: [
      h2('From Creative Role to Operational Ownership'),
      p('In August 2019, I was hired by Rob Dial. The engagement lasted 3.5 years. The role was simple on paper: personal videographer. The vision was bigger: be the DRock to his Gary V.'),
      p('The expectation was clear: produce, no matter what. These conditions forged me.'),
      p('What started as a videographer role evolved into full ownership of content operations: planning, production, hiring, systems, and delivery.'),

      {
        _type: 'image',
        src: '/images/case-studies/rob-dial/hero-02.webp',
        alt: 'Rob Dial in production with the team',
      },

      h2('Early Output: Viral Content at Scale'),
      p('The first phase focused on short-form, viral talking-head videos, one per week.'),
      p('From there, the work escalated quickly. By late 2019, we moved into the second phase: weekly produced narrative pieces with a lesson attached.'),
      p('Every week. No missed deadlines. Including during the pandemic.'),
      p('Scripts. Casting. Locations. Production. Editing. Most of it ran out of my apartment.'),
      p('This continued for 7 months until we were forced to pivot.'),

      {
        _type: 'gallery',
        columns: 1,
        images: [
          { src: '/images/case-studies/rob-dial/gallery1-01.webp', alt: 'Rob Dial production moment 01' },
          { src: '/images/case-studies/rob-dial/gallery1-02.webp', alt: 'Rob Dial production moment 02' },
          { src: '/images/case-studies/rob-dial/gallery1-03.webp', alt: 'Rob Dial production moment 03' },
          { src: '/images/case-studies/rob-dial/gallery1-04.webp', alt: 'Rob Dial production moment 04' },
        ],
      },

      h2('The Pivot: Podcast as the Engine'),
      p('Scripted short films became too difficult with social distancing, so we pivoted to producing just the podcast. That meant:'),
      bullet('Building a studio'),
      bullet('Designing sets'),
      bullet('Multi-camera recording'),
      bullet('Editing long-form and short-form assets'),
      bullet('Creating a repeatable content pipeline'),
      p('The result: 84 pieces of video content produced from 4 podcast episodes.'),
      p('This became the core media engine.'),

      {
        _type: 'gallery',
        columns: 1,
        images: [
          { src: '/images/case-studies/rob-dial/gallery2-01.webp', alt: 'Rob Dial podcast studio 01' },
          { src: '/images/case-studies/rob-dial/gallery2-02.webp', alt: 'Rob Dial podcast studio 02' },
          { src: '/images/case-studies/rob-dial/gallery2-03.webp', alt: 'Rob Dial podcast studio 03' },
          { src: '/images/case-studies/rob-dial/gallery2-04.webp', alt: 'Rob Dial podcast studio 04' },
          { src: '/images/case-studies/rob-dial/gallery2-05.webp', alt: 'Rob Dial podcast studio 05' },
          { src: '/images/case-studies/rob-dial/gallery2-06.webp', alt: 'Rob Dial podcast studio 06' },
        ],
      },

      h2('Building The Team While Shipping'),
      p('As volume increased, I built the team. At peak, the media operation included five people.'),
      p('I handled:'),
      bullet('Vetting'),
      bullet('Hiring'),
      bullet('Role definition'),
      bullet('Quality of Operations'),
      p('No formal training systems existed, so everything ran on execution, speed, and trust. It was trial by fire. And it worked.'),

      h2('A Clean Exit'),
      p("By early 2023, the operation was stable. The media machine was running. The team was in place. The systems didn't require me anymore."),
      p('So I replaced myself and exited cleanly in January 2023.'),

      {
        _type: 'image',
        src: '/images/case-studies/rob-dial/closing.webp',
        alt: 'Rob Dial — closing moment',
      },

      yt('https://www.youtube.com/embed/MUJjfJDyZhA?rel=0', 'The Mindset Mentor Podcast | Rob Dial'),
    ],
  },

  {
    slug: 'the-lab-miami',
    client: 'The LAB Miami',
    category: 'BUILDER HUB',
    medium: 'LAB/HUB',
    cardSurface: 'glow-blue',
    cardAccent: '#38B2F6',
    cardImage: '/images/work/lab-miami.webp',
    cardImageAlt: 'The LAB Miami innovation campus',
    cardDescription: 'Content infrastructure and positioning clarity for an innovation campus.',
    cardStat: { num: '30%', label: 'Faster Sales Cycles' },
    order: 2,
    headline: 'The LAB Miami Builds the Foundation for Its Next Chapter With CWK.',
    result: '30%',
    resultLabel: 'Faster sales cycles',
    stats: [
      { value: '30%', label: 'Faster Sales Cycles' },
      { value: '50%', label: 'Faster Content Creation' },
      { value: 'Team', label: 'Alignment Achieved' },
    ],
    body: [
      h2('Wynwood, Miami'),
      p('Builder Hub for founders, technologists, investors, and creators.'),

      {
        _type: 'image',
        src: '/images/case-studies/the-lab-miami/hero-01.webp',
        alt: 'The LAB Miami innovation campus',
      },

      h2('More Than Just Content'),
      p('Over the past few months, The LAB Miami has been quietly doing the work most brands skip: building infrastructure before scaling visibility.'),
      p('What began as a fast-moving request to produce social media content turned into something more strategic. Instead of producing one-off videos, the focus shifted to clarity, systems, and long-term brand foundation.'),
      p('Our work together introduced a clear signal: this is a campus built for serious builders. Short scenes, real people, and the energy of the space were used to create familiarity and credibility, not just hype.'),
      yt('https://www.youtube.com/embed/1aZxVWz4Whs?rel=0', 'The LAB Miami Campus Event Trailer'),

      h2('Clear Positioning'),
      p("Through synthesis and messaging work, the LAB's direction was sharpened into three defining pillars:"),
      bullet('A globally connected innovation campus'),
      bullet('Rooted in Wynwood'),
      bullet('Built for founders, technologists, investors, and creators'),
      p('This clarity now guides future content, partnerships, and programming.'),
      yt('https://www.youtube.com/embed/t6229C3Hp2Y?rel=0', "The LAB Miami: Elevating What's Possible"),

      h2('Content as Infrastructure'),
      p('Rather than scattered posts, the work focused on creating reusable, editorial-style content. Assets were built to support multiple campaigns, future announcements, and long-term visibility, reducing the need to constantly start from scratch.'),

      quote("We don't just produce content, events, and workshops. We orchestrate perception in alignment with your true impact."),

      yt('https://www.youtube.com/embed/zEFW0QsgUgE?rel=0', 'The LAB Miami Short'),
      yt('https://www.youtube.com/embed/Mb-dtTGdFBY?rel=0', 'Dax Interview at The LAB Miami'),
    ],
  },

  {
    slug: 'raasin-in-the-sun',
    client: 'Raasin in the Sun',
    category: 'NON-PROFIT',
    medium: 'NON-PROFIT',
    cardSurface: 'marble-stone',
    cardAccent: '#FB3079',
    cardDescription: 'Documented public art, secured grants, and a placemaking movement.',
    cardStat: { num: '6-fig', label: 'Grants Secured' },
    order: 3,
    headline: 'Building the Media Foundation of a Creative Placemaking Movement',
    duration: '2019–2022',
    result: '6-fig',
    resultLabel: 'Grants secured',
    stats: [
      { value: '6-fig', label: 'Grants Secured' },
      { value: '9', label: 'High Impact Projects' },
      { value: '3 years', label: 'Engagement' },
    ],
    body: [
      h2('Overview'),
      p('Raasin in the Sun is a creative placemaking nonprofit founded by Raasin McIntosh, an Olympian and community builder based in Austin, Texas. I worked with the organization for roughly three years as Head of Content, building the media and documentation foundation for its most formative projects. This was my entry point into telling stories behind large-scale public art.'),

      h2('Key Projects Documented'),
      h3('The Alley Project'),
      p('Transforming a dirty alley into a cultural event space.'),
      yt('https://www.youtube.com/embed/OrwPvL4qWec?rel=0', '12th and Chicon Alley Beautification Initiative Recap'),

      h3('The Delco Project'),
      p('A home-beautification initiative culminating in a $5,000 donation.'),
      yt('https://www.youtube.com/embed/V9JQMOpFup8?rel=0', 'The Delco Project Documentary By Kris San'),

      h3('Colores de la Cultura'),
      p('A street mural celebrating Latina identity by two well-known Latina muralists.'),
      yt('https://www.youtube.com/embed/DIGzsqbQ2bk?rel=0', 'San Marcos Street Mural Promo'),
      yt('https://www.youtube.com/embed/JEl_VcoLOiA?rel=0', 'The Making of the San Marcos Street Mural Project'),

      h3('Juneteenth with Rev. Dixon'),
      p('A mobile storytelling project documenting East Austin history.'),
      yt('https://www.youtube.com/embed/sYyFhCRiDbs?rel=0', "Ridin' W/ Rev. Dixon in Honor of Juneteenth"),

      h3('Rise of Masontown'),
      p('A major mural and documentary on Black land ownership and industrial Austin.'),
      yt('https://www.youtube.com/embed/AgMQZw7dGnY?rel=0', 'The Rise of Masontown — Meet the Team'),

      h3('The Story Behind Six Square'),
      p("A documentary capturing the origin and mission of Six Square, a cultural organization preserving Black history in Central East Austin."),
      yt('https://www.youtube.com/embed/M_iHJmAo3Q8?rel=0', 'The Story Behind Six Square: A Black Cultural Organization in East Austin'),

      h3('Be Well Murals'),
      p('A 2020 mural series that later won Best of Austin.'),
      yt('https://www.youtube.com/embed/JbU9nAI8xig?rel=0', 'Be Well Murals Austin'),

      h3('Walls Unite'),
      p('A large-scale warehouse restoration and outdoor art gallery.'),
      yt('https://www.youtube.com/embed/exzS8OMDNOs?rel=0', 'Walls Unite — Raasin in the Sun Phase I Programming Event'),

      h3('The Master Plan: Where It All Began'),
      p('Examining gentrification and environmental racism in East Austin since 1928.'),
      yt('https://www.youtube.com/embed/or_Z2BwYl50?rel=0', 'The Master Plan: Where It All Began'),

      h2('Impact'),
      bullet('Helped secure multiple six-figure grants, including funding tied directly to documentary work.'),
      bullet("Elevated Raasin in the Sun's visibility and credibility across Austin."),
      bullet('Built a repeatable model for pairing public art, storytelling, and funding.'),
      bullet('Established Raasin McIntosh as a leading voice in creative placemaking.'),

      h2('What This Case Proves'),
      p('Raasin in the Sun is where I learned how to produce meaning, not just content.'),
    ],
  },

  {
    slug: 'stephy-lee',
    client: 'Stephy Lee',
    category: 'CREATIVE FOUNDER',
    medium: 'CREATIVE',
    cardSurface: 'marble-light',
    cardAccent: '#00E5FF',
    cardImage: '/images/case-studies/stephy-lee/hero-01.webp',
    cardImageAlt: 'Stephy Lee, creative founder and music artist',
    cardDescription: "Protected an artist's brand during crisis and secured strategic booking.",
    cardStat: { num: 'SXSW', label: 'Booking Secured' },
    order: 4,
    headline: "How Stephy Lee's Career Moved Forward During the Hardest Time of Her Life",
    duration: '2021–2024',
    result: '$30K',
    resultLabel: 'Raised during recovery',
    stats: [
      { value: '$30K', label: 'Raised' },
      { value: 'SXSW', label: 'Stage secured' },
      { value: '2', label: 'Albums released post-accident' },
    ],
    body: [
      h2('The Setup'),
      p('On April 24, 2021, Stephy Lee was ten minutes from home.'),
      p('She had just finished the second show of a four-date Texas tour, opening for established acts, with real momentum.'),
      p('What followed could have ended her career. Instead, it became the foundation for her most defining chapter.'),
      p('While Stephy Lee was fighting for her life, we had to find a way to protect the brand from sinking into irrelevancy.'),
      p('That work began immediately. By May 1, 2021, the first piece of media documenting what happened was released.'),
      yt('https://www.youtube.com/embed/S581bcAIc7M?rel=0', 'Stephy Lee and her team go through a traumatic experience'),

      h2('Brand Protection Under Extreme Constraint'),
      p('Stephy Lee was bedridden for five months. She could not walk. She could not use the bathroom on her own. Her life had permanently changed.'),
      p('Our strategy was simple and disciplined: document with intention and speed. Media production during this period included:'),
      bullet('A documentary chronicling the accident and recovery'),
      bullet('A series of music videos reflecting the emotional and physical reality of survival'),
      bullet('Structured narrative assets that allowed people to understand the depth of what had happened without exploiting it'),
      p("These positioning assets preserved Stephy Lee's identity as an artist while creating space for the public to support her recovery. Through this work, $30,000 was raised, meaningful support, even if it barely dented the medical costs involved."),
      p('The objective was never virality. It was continuity.'),
      yt('https://www.youtube.com/embed/6jwohv2JHRk?rel=0', 'Stephy Lee Mini-Documentary On Accident'),

      h2('While Bedridden, She Wrote an Album'),
      p('I Hope We All Make It was released in 2022, 18 months after the accident. It was her pain captured.'),
      {
        _type: 'image',
        src: '/images/case-studies/stephy-lee/album-cover.webp',
        alt: 'I Hope We All Make It — Stephy Lee album cover',
      },
      {
        _type: 'gallery',
        columns: 1,
        images: [
          { src: '/images/case-studies/stephy-lee/reviews-01.webp', alt: 'Press review of I Hope We All Make It (1)' },
          { src: '/images/case-studies/stephy-lee/reviews-02.webp', alt: 'Press review of I Hope We All Make It (2)' },
          { src: '/images/case-studies/stephy-lee/reviews-03.webp', alt: 'Press review of I Hope We All Make It (3)' },
        ],
      },

      h2('Re-Entering the World, Deliberately'),
      p('Her first post-accident live performance happened 18 months later:'),
      bullet('She could barely walk, needing a cane for assistance'),
      bullet('Her second album had just launched'),
      {
        _type: 'gallery',
        columns: 2,
        images: [
          { src: '/images/case-studies/stephy-lee/almost-real-01.webp', alt: 'Almost Real Things performance, image 1', caption: 'Almost Real Things performance' },
          { src: '/images/case-studies/stephy-lee/almost-real-02.webp', alt: 'Almost Real Things performance, image 2', caption: 'Almost Real Things performance' },
        ],
      },

      h2('Four Years of Intentional Moves'),
      p('Her second performance was Sound Unseen, a curated show that placed her in front of an audience aligned with both her music and her story.'),
      p('The strategy relied solely on:'),
      bullet('Content: narrative, documentation, and media assets'),
      bullet('Events: live moments designed to move her career forward'),
      p("Each move built on the last, allowing Stephy Lee's story to deepen without becoming static."),
      {
        _type: 'gallery',
        columns: 1,
        images: [
          { src: '/images/case-studies/stephy-lee/soundunseen-01.webp', alt: 'Sound Unseen performance — Stephy Lee on stage', caption: 'Picture by Jay Ibarra at Sound Unseen' },
          { src: '/images/case-studies/stephy-lee/soundunseen-02.webp', alt: 'Sound Unseen performance — close-up', caption: 'Picture by Jay Ibarra at Sound Unseen' },
          { src: '/images/case-studies/stephy-lee/soundunseen-03.webp', alt: 'Sound Unseen group photo', caption: 'Picture by Jay Ibarra at Sound Unseen, Left to Right: Kris, Becky, Stephy Lee, Dash' },
        ],
      },

      h2('The Calculated Move'),
      p('The goal was to get her on one of the biggest stages in the world: SXSW.'),
      p("This would be Stephy Lee's first major stage performance since the accident."),
      p('The plan was simple: host an intimate 45-minute concert at the biggest non-profit in Austin supporting BIPOC creatives and community frontliners. Invite the founder. He runs a full SXSW showcase. If he liked what he saw, maybe she would get offered a slot.'),
      p('Nothing was guaranteed. For all we know, he could hate it.'),
      {
        _type: 'gallery',
        columns: 2,
        images: [
          { src: '/images/case-studies/stephy-lee/dawa-studios-01.webp', alt: 'Performance at DAWA Studios, image 1', caption: 'Performance at DAWA Studios' },
          { src: '/images/case-studies/stephy-lee/dawa-studios-02.webp', alt: 'Performance at DAWA Studios, image 2', caption: 'Performance at DAWA Studios' },
        ],
      },
      p('And in this case, the plan paid off.'),
      p("By the end of the night, she was invited to open for DAWA at SXSW 2024. That made her an official SXSW artist. It put her on the stage at Stubb's, a legendary stage in Austin."),
      {
        _type: 'image',
        src: '/images/case-studies/stephy-lee/sxsw-2024.webp',
        alt: 'Stephy Lee at SXSW 2024',
        caption: 'SXSW 2024',
      },

      h2('What Comes Next'),
      p("Stephy Lee's third album debuts on 02.26.26 in honor of Capi, her producer who did not make it from the accident."),
      p('R.I.P Capi.'),
      yt('https://www.youtube.com/embed/NGSAOOCiykI?rel=0', 'Stephy Lee | Anxiety, first music video after the accident'),
      yt('https://www.youtube.com/embed/qCTKPYBWkqU?rel=0', 'Stephy Lee | Second music video after the accident'),
    ],
  },

  {
    slug: 'spraycation',
    client: 'SPRAYCATION',
    category: 'EXPERIENTIAL',
    medium: 'EXPERIENTIAL',
    cardSurface: 'isometric-dark',
    cardAccent: '#00E5FF',
    cardImage: '/images/case-studies/spraycation/gallery-03.webp',
    cardImageAlt: 'Zuzu standing in front of the You Are Magic SPRAYCATION mural',
    cardDescription: 'Built brand foundation and operational backbone for a female-led art movement.',
    cardStat: { num: '6 Cities', label: 'Implemented' },
    order: 5,
    headline: 'Building an Experiential Campaign While in Motion',
    duration: 'Jan–Nov 2025',
    result: '4 murals',
    resultLabel: 'Tour',
    stats: [
      { value: '4 murals', label: 'Tour' },
      { value: '8 months', label: 'Live build' },
      { value: '2025', label: 'Foundation Built' },
    ],
    body: [
      h2('SPRAYCATION'),
      p('SPRAYCATION is a female-led experiential art movement built around large-scale public murals, storytelling, and creative action.'),
      p('The tour for 2025 centered on a single message, You Are Magic: a call to reclaim creative power, occupy public space, and choose yourself.'),
      p('CWK. began working with Zuzu in January 2025. The tour launched in June and ran through November.'),
      yt('https://www.youtube.com/embed/indEyPSLvlI?rel=0', 'SPRAYCATION Mural Tour 2025 Kick-off'),

      {
        _type: 'gallery',
        columns: 2,
        images: [
          { src: '/images/case-studies/spraycation/gallery-01.webp', alt: 'SPRAYCATION mural artist at work' },
          { src: '/images/case-studies/spraycation/gallery-02.webp', alt: 'SPRAYCATION mural reveal event' },
          { src: '/images/case-studies/spraycation/gallery-03.webp', alt: 'SPRAYCATION large-scale public mural' },
          { src: '/images/case-studies/spraycation/gallery-04.webp', alt: 'SPRAYCATION tour moment' },
        ],
      },

      h2('The Work'),
      p("CWK.'s role was to build the brand foundation and operational backbone while the tour was already in motion."),
      bullet('Centered the entire tour around a single narrative.'),
      bullet('Hired and coordinated an operations team in real time.'),
      bullet('Created backend systems for sales, customer service, and partners.'),
      bullet('Designed repeatable processes and templates.'),
      bullet('Supported Zuzu in the mural reveal events in select cities.'),
      p('Everything was built under live conditions.'),

      {
        _type: 'image',
        src: '/images/case-studies/spraycation/zoom-cover.webp',
        alt: 'SPRAYCATION campaign cover',
      },

      h2('The Result'),
      p('SPRAYCATION moved from an ambitious art idea to a repeatable, fundable experiential brand. The tour proved the message holds across cities, the model works beyond one-off murals, and the experience can be packaged, sold, and scaled.'),
      p('2024 proved the concept. 2025 refined the narrative. 2026 is built for scale.'),

      h2('Credibility'),
      {
        _type: 'gallery',
        columns: 2,
        images: [
          { src: '/images/case-studies/spraycation/credibility-01.webp', alt: 'SPRAYCATION press / partner credibility 01' },
          { src: '/images/case-studies/spraycation/credibility-02.webp', alt: 'SPRAYCATION press / partner credibility 02' },
          { src: '/images/case-studies/spraycation/credibility-03.webp', alt: 'SPRAYCATION press / partner credibility 03' },
          { src: '/images/case-studies/spraycation/credibility-04.webp', alt: 'SPRAYCATION press / partner credibility 04' },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        markDefs: [{ _key: 'zuzu', _type: 'link', href: 'https://www.instagram.com/zuzubee/' }],
        children: [
          { _type: 'span', text: "Follow Zuzu's work on " },
          { _type: 'span', text: 'Instagram', marks: ['zuzu'] },
          { _type: 'span', text: '.' },
        ],
      },
    ],
  },

  {
    slug: 'agent-plus',
    client: 'CWK. Agent+',
    category: 'AGENT+ INTERFACE',
    medium: 'PLATFORM',
    cardSurface: 'holographic',
    cardAccent: '#7B61FF',
    cardDescription: "See what's inside CWK Agent+, the operating system we built for entrepreneurs.",
    cardStat: { num: '3', label: 'Key Dashboards' },
    order: 6,
    headline: 'The Operating System We Built To Manage Growth',
    result: '3',
    resultLabel: 'Key dashboards',
    stats: [
      { value: '3', label: 'Dashboards' },
      { value: '4', label: 'Pillars: Mind / Body / Soul / Pocket' },
      { value: '1', label: 'Source of truth' },
    ],
    body: [
      h2('Why we built it'),
      p('Every entrepreneur we worked with hit the same wall: scattered tools, fragmented authority, deals leaking because nothing tied the work together. Agent+ is the system that catches everything in one place.'),

      h2('What it does'),
      bullet('Player Dashboard: greeting, top actions, relationships, brand destination at a glance.'),
      bullet('Relationship Health: every contact mapped Aware → Advocate, with dormant flags before deals go cold.'),
      bullet('Visual Deals: pipeline view with stage stats, value, and last-touched date.'),
      bullet('Priority Actions: the next move, surfaced based on commitments and momentum.'),

      h2('Where to see it'),
      p('Agent+ ships as the platform behind CWK. A live preview is on the product page; full access opens with the PLOS waitlist.'),
    ],
  },

  {
    slug: 'lifes-tapestry',
    client: "Life's Tapestry",
    category: 'DIGITAL PROPERTY',
    medium: 'DIGITAL PROPERTY',
    cardSurface: 'wood',
    cardAccent: '#E0A878',
    cardImage: '/images/case-studies/lifes-tapestry/hero-01.webp',
    cardImageAlt: "Titi Lee with Kris in front of CWK Consulting screen, sharing thanks for Life's Tapestry",
    cardDescription: "Launched a digital property for a 64-year-old first-time writer; 25+ editions and a growing audience.",
    cardStat: { num: '25+', label: 'Editions Published' },
    order: 7,
    headline: "CWK. Builds a Digital Home for a Writer's Life's Work",
    result: '47',
    resultLabel: 'Real subscribers',
    stats: [
      { value: '1', label: 'Lifelong Dream Come True' },
      { value: '47', label: 'Real Subscribers' },
      { value: '25+', label: 'Published Editions' },
      { value: 'Year 1', label: 'Foundation built' },
    ],
    body: [
      h2('The Story'),
      p("A 64-year-old woman with no technical background and no publishing system launched a digital property called Life's Tapestry, a place where her stories now live, grow, and reach dozens of readers every week."),
      p("When she came to CWK., she wasn't trying to build a business. She had simply waited her whole life to write, and this was her moment. She had one social account, no brand, no platform, and no way to turn her ideas into something sustainable."),
      p("CWK. stepped in to build what she didn't have: a home for her intellectual property. Instead of chasing followers or pushing monetization, the focus was on building a digital property: a place designed to hold her stories, grow an audience, and support future income when she is ready."),

      h2('Results'),
      p('As of January 2026:'),
      bullet('25+ published editions'),
      bullet('47 real subscribers'),
      bullet('Readers who comment, reply, and wait for the next story'),
      p("This isn't content. It's a growing body of work with an audience attached. Year one was about building the foundation. The monetization can come later, because the digital property now exists."),

      h2('The Bigger Picture'),
      p("Life's Tapestry shows what happens when a lifelong dream is given real structure. A place for meaningful work to live and compound."),

      h2('Watch Us Launch Phase 1'),
      yt('https://www.youtube.com/embed/3KmCJKIPsz4?rel=0', "BTS of Building Life's Tapestry Blog"),
    ],
  },

  {
    slug: 'pay-the-creators',
    client: 'Pay the Creators (BeatStars)',
    category: 'PODCAST',
    medium: 'PODCAST',
    cardSurface: 'crimson',
    cardAccent: '#FB3079',
    cardDescription: 'Renamed and repositioned a podcast to align with brand mission.',
    cardStat: { num: '1st', label: 'Identity Set Created' },
    order: 8,
    headline: 'Naming the Anchor and Building the Podcast Foundation',
    result: '1',
    resultLabel: 'Costly mistake stopped',
    stats: [
      { value: '7', label: 'Episodes Built' },
      { value: '1', label: 'Name saved' },
      { value: '∞', label: 'IP juice added' },
    ],
    body: [
      {
        _type: 'image',
        src: '/images/case-studies/pay-the-creators/hero-01.webp',
        alt: 'Pay the Creators Podcast — opening hero',
      },

      h2('The Setup'),
      {
        _type: 'block',
        style: 'normal',
        markDefs: [{ _key: 'beatstars', _type: 'link', href: 'https://www.beatstars.com' }],
        children: [
          { _type: 'span', text: '' },
          { _type: 'span', text: 'BeatStars', marks: ['beatstars'] },
          { _type: 'span', text: ' is a global marketplace for buying and selling music beats, founded by Abe Batshon.' },
        ],
      },
      p('Abe came to me with a simple request: produce a podcast.'),

      {
        _type: 'image',
        src: '/images/case-studies/pay-the-creators/hero-02.webp',
        alt: 'Pay the Creators Podcast — production still',
      },

      h2('Avoiding a Costly Mistake'),
      p('The original name was The Self-Made Podcast. I told him no.'),
      p("No one is self-made. That name worked against BeatStars' core mission. BeatStars exists to protect creators and help them get paid. A podcast called Self-Made diluted that position."),
      p('The show was renamed Pay the Creators Podcast.'),
      {
        _type: 'block',
        style: 'normal',
        markDefs: [{ _key: 'ptc', _type: 'link', href: 'https://paythecreators.com' }],
        children: [
          { _type: 'span', text: "That single decision aligned the podcast with the brand's point of view and gave the IP juice. Visit " },
          { _type: 'span', text: 'paythecreators.com', marks: ['ptc'] },
          { _type: 'span', text: '.' },
        ],
      },
      yt('https://www.youtube.com/embed/4B9ZH5rMHMU?rel=0', 'Pay The Creators Podcast Intro'),

      h2('The Work'),
      p('Although I was hired strictly for production, I built the foundational structure of the podcast, including:'),
      bullet('Show positioning and first-layer identity'),
      bullet('End-to-end production'),
      bullet('Crew hiring'),
      bullet('Location sourcing (Warm Audio Studios)'),
      bullet('A repeatable operational setup for recording and release'),
      p('We produced the first 7 episodes and established a format that could continue without my involvement.'),

      {
        _type: 'gallery',
        columns: 1,
        images: [
          { src: '/images/case-studies/pay-the-creators/gallery-01.webp', alt: 'Pay the Creators Podcast moment 01' },
          { src: '/images/case-studies/pay-the-creators/gallery-02.webp', alt: 'Pay the Creators Podcast moment 02' },
          { src: '/images/case-studies/pay-the-creators/gallery-03.webp', alt: 'Pay the Creators Podcast moment 03' },
        ],
      },

      yt('https://www.youtube.com/embed/DdPKPvg74Ro?rel=0', '🎹 Is Producing Enough? #beatstars #paythecreators #podcast #producer #musicproducer #beatmaker'),

      h2('What This Case Proves'),
      p("This wasn't just about producing episodes. It was about:"),
      bullet('Stopping the wrong idea early'),
      bullet("Anchoring intellectual property to the brand's truth"),
      bullet('Building foundations that last beyond the original creator'),
      p("Sometimes the most valuable contribution isn't what's in the contract. It's protecting the client's best interest."),
    ],
  },

  {
    slug: 'brand-destination',
    client: 'Brand Destination',
    category: 'PLATFORM ACCESS',
    medium: 'PLATFORM ACCESS',
    cardSurface: 'glass',
    cardAccent: '#00E5FF',
    cardDescription: 'A deep dive into the CWK platform layer that gamifies the founder journey.',
    cardStat: { num: '4', label: 'Primary Actions' },
    order: 9,
    headline: 'Brand Destination: Gates, Checkpoints, and the Final Boss',
    result: '4',
    resultLabel: 'Primary actions',
    stats: [
      { value: '5', label: 'Gates' },
      { value: '4', label: 'Pillars: Mind / Body / Soul / Pocket' },
      { value: '1', label: 'Final boss' },
    ],
    body: [
      h2('Why we built it'),
      p('Founders fall off the path because the path is invisible. Brand Destination makes the journey visible. Each gate is a stage of growth, each checkpoint is a deliverable, each mind-mine is a blocker to clear, each power-up is a system that compounds. The final boss is the goal you set when you started.'),

      h2('How it works'),
      bullet('Gate Selection: choose the destination that fits the chapter you are in.'),
      bullet('Pre-Flight: check the prerequisites before boarding.'),
      bullet('In-Flight: track Sovereignty Scorecard, checkpoints, and timeline live.'),
      bullet('Arrival: ship, score, and start the next destination.'),

      h2('The thesis'),
      p('Game mechanics are not gimmicks. They are the only proven way to keep a person attached to a long, hard journey. Brand Destination borrows the structure and applies it to building a business.'),
    ],
  },

  {
    slug: 'dawa',
    client: 'DAWA',
    tagline: 'Diversity Awareness & Wellness in Action',
    category: 'NON-PROFIT',
    medium: 'NON-PROFIT',
    cardSurface: 'glass',
    cardAccent: '#00E5FF',
    cardImage: '/images/case-studies/dawa/cover.webp',
    cardImageAlt: 'DAWA Diversity Awareness & Wellness in Action',
    cardDescription: "Found the organization's anchor phrase, built its content system, and co-built an education program from zero.",
    cardStat: { num: '100%', label: 'Messaging Clarity' },
    order: 10,
    headline: 'How DAWA Found Its Anchor',
    duration: 'Nearly 2 years',
    result: '100%',
    resultLabel: 'Messaging clarity',
    stats: [
      { value: '100%', label: 'Messaging clarity' },
      { value: '8-person', label: 'Led Major Campaign' },
      { value: '2 years', label: 'Active building' },
    ],
    body: [
      {
        _type: 'image',
        src: '/images/case-studies/dawa/board-of-directors.webp',
        alt: "DAWA's founding board of directors",
      },

      h2('The Starting Point'),
      p("Kris joined DAWA's founding board of directors in early 2023. The organization was growing. The mission was strong. The impact was real. But the messaging was scattered. Too many programs. Too many definitions. No clear center of gravity. That was the root problem. DAWA had already been making headlines, but without a unified narrative to anchor its momentum."),

      {
        _type: 'image',
        src: '/images/case-studies/dawa/kris-tech-shirt.webp',
        alt: 'Kris holding the "community is the greatest technology" shirt',
        caption: 'The main narrative when the work started',
      },

      h2('Naming the Heartbeat'),
      p("The phrase Giving to the Givers already existed inside DAWA. It just wasn't leading."),
      p('CWK. identified it as the heartbeat of the organization: the one idea expansive enough to hold everything DAWA stood for. From there, the work was simple but relentless: reinforce it everywhere across communications, programming, events, visuals, and decision-making.'),

      h2('A Working Board'),
      p("DAWA operated with 4 staff members and a working board. Kris wasn't advising from a distance. She was building inside the organization."),
      p('The biggest push was the 5-year anniversary. With a short runway, a temporary content and communications department was built from scratch. An 8-person team was assembled in two weeks. Roles were defined. Campaigns were executed. Content output accelerated.'),
      p("Before this, DAWA didn't have a real content system. After it, they had a social media engine."),

      {
        _type: 'gallery',
        columns: 3,
        images: [
          { src: '/images/case-studies/dawa/gallery-01.webp', alt: 'DAWA program moment 01' },
          { src: '/images/case-studies/dawa/gallery-02.webp', alt: 'DAWA program moment 02' },
          { src: '/images/case-studies/dawa/gallery-03.webp', alt: 'DAWA program moment 03' },
          { src: '/images/case-studies/dawa/gallery-04.webp', alt: 'DAWA program moment 04' },
          { src: '/images/case-studies/dawa/gallery-05.webp', alt: 'DAWA program moment 05' },
          { src: '/images/case-studies/dawa/gallery-06.webp', alt: 'DAWA program moment 06' },
        ],
      },

      h2('Training, Teams, and Talent'),
      p("The work wasn't just external. Internal leadership was trained and developed, including vendors and a key team member, building capacity that would outlast the engagement."),
      {
        _type: 'image',
        src: '/images/case-studies/dawa/training.webp',
        alt: 'DAWA internal training session',
      },

      h2('Programs Built From Zero'),
      p('An education and internship program was co-built from scratch in collaboration with local universities including the University of Texas. Interns were placed into a live campaign environment with real responsibilities. The program proved DAWA could operate as a training and development platform, not just a non-profit.'),
      {
        _type: 'image',
        src: '/images/case-studies/dawa/internship.webp',
        alt: 'DAWA internship program cohort',
      },

      h2('A Clean Close'),
      p('The chapter with DAWA ended after nearly two years of active building, following the 5-year anniversary. The handoff was clean. The narrative was anchored. Systems were in place. Leadership was stronger.'),
      {
        _type: 'gallery',
        columns: 2,
        images: [
          { src: '/images/case-studies/dawa/closing-01.webp', alt: 'DAWA closing moment 01' },
          { src: '/images/case-studies/dawa/closing-02.webp', alt: 'DAWA closing moment 02' },
        ],
      },
      yt('https://www.youtube.com/embed/WpHozkkSssE?rel=0', 'DAWA | Original Testimonials'),
      yt('https://www.youtube.com/embed/o5QB1gYgIgY?rel=0', 'DAWA Testimonial Trailer'),
    ],
  },
];

export const CASE_STUDIES_BY_SLUG: Record<string, CaseStudy> = Object.fromEntries(
  CASE_STUDIES.map((c) => [c.slug, c]),
);
