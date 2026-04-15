import groq from 'groq';

// Shared SEO + image projections kept inline (GROQ has no fragments).
// Image dereferencing always pulls asset->{ url, metadata } so the static build
// can read width/height + LQIP without a follow-up request.

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0]{
    nav,
    footer,
    defaultSeo{
      title,
      description,
      ogImage{ ..., asset->{ url, metadata } }
    }
  }
`;

export const HOME_QUERY = groq`
  *[_type == "homePage"][0]{
    heroEyebrow,
    heroHeadline,
    wordFlipPhrases,
    heroSubtext,
    heroCta,
    pillars[]{ key, title, body },
    features[]{ id, headline, body, highlights },
    seo
  }
`;

export const PRODUCT_QUERY = groq`
  *[_type == "productPage"][0]{
    heroEyebrow,
    heroHeadline,
    heroSubtext,
    features[]{ id, headline, body, highlights },
    seo
  }
`;

export const ABOUT_QUERY = groq`
  *[_type == "aboutPage"][0]{
    heroHeadline,
    bio,
    stats[]{ value, label },
    seo
  }
`;

export const JOURNEY_QUERY = groq`
  *[_type == "journeyPage"][0]{
    heroEyebrow,
    heroHeadline,
    body,
    seo
  }
`;

export const BRAND_MIRROR_QUERY = groq`
  *[_type == "brandMirrorPage"][0]{
    heroEyebrow,
    heroHeadline,
    heroSubtext,
    body,
    quizCta,
    seo
  }
`;

export const SIDE_QUESTS_QUERY = groq`
  *[_type == "sideQuestsPage"][0]{
    heroEyebrow,
    heroHeadline,
    body,
    seo
  }
`;

// Card-level fields only — used by /work index grid.
export const CASE_LIST_QUERY = groq`
  *[_type == "caseStudy"] | order(order asc, publishedAt desc){
    "slug": slug.current,
    client,
    category,
    tagClass,
    cardDescription,
    cardStat,
    seo
  }
`;

// Slug-only list — feeds getStaticPaths() for the dynamic /work/[slug] route.
export const CASE_SLUGS_QUERY = groq`
  *[_type == "caseStudy" && defined(slug.current)][].slug.current
`;

// Full case study by slug. Inline images in body[] are auto-dereferenced.
export const CASE_BY_SLUG_QUERY = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    "slug": slug.current,
    client,
    category,
    tagClass,
    cardDescription,
    cardStat,
    headline,
    duration,
    result,
    resultLabel,
    stats[]{ value, label },
    body[]{
      ...,
      _type == "image" => { ..., asset->{ url, metadata } }
    },
    images[]{ ..., asset->{ url, metadata } },
    testimonial{ quote, author, role },
    publishedAt,
    seo
  }
`;

// Privacy / terms / future legal docs by slug.
export const LEGAL_QUERY = groq`
  *[_type == "legalPage" && slug.current == $slug][0]{
    title,
    updatedAt,
    body,
    seo
  }
`;
