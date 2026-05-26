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
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      description: 'Main hero headline (line 1).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Hero Subheadline',
      type: 'string',
      description: 'Second headline line (rendered in cyan beneath the headline).',
    }),
    defineField({
      name: 'heroSubtext',
      title: 'Hero Subtext',
      type: 'blockContent',
      description: 'Optional rich-text paragraph under the headline.',
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
