import groq from 'groq';

// Shared SEO + image projections kept inline (GROQ has no fragments).
// Image dereferencing always pulls asset->{ url, metadata } so the static build
// can read width/height + LQIP without a follow-up request.

// Standard projection for the seo object — used everywhere we attach SEO to a doc.
const SEO_PROJECTION = `seo{
  title,
  description,
  canonicalUrl,
  ogType,
  twitterCard,
  robots,
  ogImage{ alt, asset->{ url, metadata } }
}`;

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0]{
    nav,
    footer,
    twitterHandle,
    defaultSeo{
      title,
      description,
      canonicalUrl,
      ogType,
      twitterCard,
      robots,
      ogImage{ alt, asset->{ url, metadata } }
    },
    organization{
      name,
      alternateName,
      slogan,
      description,
      foundingDate,
      founderName,
      founderJobTitle,
      founderSameAs,
      addressLocality,
      addressRegion,
      addressCountry,
      areaServed,
      knowsAbout
    },
    faqs[]{ question, answer },
    llmsTxt,
    analytics{ gtmId, metaPixelId, tiktokPixelId, linkedinPartnerId }
  }
`;

export const HOME_QUERY = groq`
  *[_type == "homePage"][0]{
    heroEyebrow,
    heroTopline,
    wordFlipPhrases,
    heroHeadline,
    heroTitle,
    heroSubheadline,
    heroSubtext,
    heroCta,
    pillars[]{ key, title, body },
    features[]{ id, headline, body, highlights },
    googleReviews[]{
      author,
      rating,
      text,
      relativeTime,
      authorUrl,
      "profilePhotoUrl": profilePhoto.asset->url
    },
    googleReviewsAggregateRating,
    googleReviewsTotalCount,
    ${SEO_PROJECTION}
  }
`;

export const PRODUCT_QUERY = groq`
  *[_type == "productPage"][0]{
    heroEyebrow,
    heroHeadline,
    heroSubtext,
    features[]{ id, headline, body, highlights },
    ${SEO_PROJECTION}
  }
`;

export const ABOUT_QUERY = groq`
  *[_type == "aboutPage"][0]{
    heroHeadline,
    bio,
    stats[]{ value, label },
    ${SEO_PROJECTION}
  }
`;

export const JOURNEY_QUERY = groq`
  *[_type == "journeyPage"][0]{
    heroEyebrow,
    heroHeadline,
    body,
    ${SEO_PROJECTION}
  }
`;

export const SIDE_QUESTS_QUERY = groq`
  *[_type == "sideQuestsPage"][0]{
    heroEyebrow,
    heroHeadline,
    body,
    ${SEO_PROJECTION}
  }
`;

// Card-level fields only — used by /case-studies index grid.
export const CASE_LIST_QUERY = groq`
  *[_type == "caseStudy"] | order(order asc, publishedAt desc){
    "slug": slug.current,
    client,
    category,
    medium,
    cardDescription,
    cardImage{ ..., asset->{ url, metadata } },
    cardThumbnail{ ..., asset->{ url, metadata } },
    cardSurface,
    cardAccent,
    cardStat,
    ${SEO_PROJECTION}
  }
`;

// Slug-only list — feeds getStaticPaths() for /case-studies/[slug].
export const CASE_SLUGS_QUERY = groq`
  *[_type == "caseStudy" && defined(slug.current)][].slug.current
`;

// Full case study by slug. Inline images and gallery images in body[] are auto-dereferenced.
export const CASE_BY_SLUG_QUERY = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    "slug": slug.current,
    client,
    category,
    medium,
    cardDescription,
    cardImage{ ..., asset->{ url, metadata } },
    cardThumbnail{ ..., asset->{ url, metadata } },
    cardSurface,
    cardAccent,
    cardStat,
    headline,
    duration,
    result,
    resultLabel,
    stats[]{ value, label },
    body[]{
      ...,
      _type == "image" => { ..., asset->{ url, metadata } },
      _type == "gallery" => { ..., images[]{ ..., asset->{ url, metadata } } }
    },
    images[]{ ..., asset->{ url, metadata } },
    testimonial{ quote, author, role },
    publishedAt,
    ${SEO_PROJECTION}
  }
`;

// Privacy / terms / future legal docs by slug.
export const LEGAL_QUERY = groq`
  *[_type == "legalPage" && slug.current == $slug][0]{
    title,
    updatedAt,
    body,
    ${SEO_PROJECTION}
  }
`;
