import { defineType, defineField } from 'sanity';

export const featureBlock = defineType({
  name: 'featureBlock',
  title: 'Feature Block',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'Anchor ID',
      type: 'string',
      description:
        'Stable reference / anchor link. Short lowercase token (e.g. "dashboard").',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      description: 'Short bullet points shown alongside the feature.',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: { title: 'headline', subtitle: 'body' },
  },
});
