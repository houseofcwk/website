import { defineType, defineField } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  // @ts-expect-error legacy Sanity v3 field used to lock singletons
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'heroEyebrow',
      title: 'Hero Eyebrow',
      type: 'string',
      description: 'Small label shown above the hero headline.',
    }),
    defineField({
      name: 'heroTopline',
      title: 'Hero Topline',
      type: 'string',
      description: 'Static white line above the flip-word (e.g. "CWK. is like a").',
    }),
    defineField({
      name: 'wordFlipPhrases',
      title: 'Word-Flip Phrases',
      type: 'array',
      description: 'Cyan rotating phrases under the topline (e.g. partner, operator, architect).',
      of: [{ type: 'string' }],
      validation: (Rule) =>
        Rule.min(2).warning('Add at least two phrases or the flip animation will not run.'),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline (legacy — same as Topline)',
      type: 'string',
      description: 'Kept for backwards compatibility. The Topline field above is the canonical source; this is only read as a fallback for older docs.',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      description: 'Secondary title shown below the flip headline (e.g. "Guiding founders through the jungle from $0 to $1M.").',
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Hero Subtitle',
      type: 'string',
      description: 'Muted body line below the title (e.g. "CWK. installs the system that makes good months repeat.").',
    }),
    defineField({
      name: 'heroSubtext',
      title: 'Hero Subtext (Rich Text, optional)',
      type: 'blockContent',
      description: 'Optional rich-text paragraph. Only used if you need formatting beyond the plain Subtitle field.',
    }),
    defineField({
      name: 'heroCta',
      title: 'Hero Call-to-Action',
      type: 'ctaButton',
    }),
    defineField({
      name: 'pillars',
      title: 'Four Pillars',
      type: 'array',
      description:
        'Must contain exactly four pillars: Mind, Body, Soul, Pocket.',
      of: [{ type: 'pillarBlock' }],
      validation: (Rule) =>
        Rule.required()
          .length(4)
          .error('Home page requires exactly four pillars.'),
    }),
    defineField({
      name: 'features',
      title: 'Feature Sections',
      type: 'array',
      of: [{ type: 'featureBlock' }],
    }),
    defineField({
      name: 'googleReviews',
      title: 'Google Reviews (curated)',
      type: 'array',
      description:
        'Manually copied from the public Google Maps page. Section auto-hides if this is empty. Refresh quarterly.',
      of: [{ type: 'googleReview' }],
    }),
    defineField({
      name: 'googleReviewsAggregateRating',
      title: 'Aggregate Rating',
      type: 'number',
      description:
        'Average star rating shown in the section header (e.g. 5, 4.9). Optional.',
      validation: (Rule) => Rule.min(0).max(5),
    }),
    defineField({
      name: 'googleReviewsTotalCount',
      title: 'Total Review Count',
      type: 'number',
      description:
        'Total number of Google reviews shown in the section header. Optional.',
      validation: (Rule) => Rule.min(0).integer(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Home Page' }),
  },
});
