import { defineType, defineField } from 'sanity';

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'social', title: 'Social' },
    { name: 'crawler', title: 'Crawler' },
    { name: 'internal', title: 'Internal (not shipped)' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Meta Title',
      type: 'string',
      group: 'core',
      description:
        'Appears in the browser tab and in search results. Aim for ~60 characters.',
      validation: (Rule) => Rule.max(70).warning('Keep under ~70 characters.'),
    }),
    defineField({
      name: 'description',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      group: 'core',
      description:
        'Appears below the title in search results. Aim for ~155 characters. Should echo the live H1 + subhead.',
      validation: (Rule) =>
        Rule.max(200).warning('Keep under ~160 characters for best results.'),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL (override)',
      type: 'url',
      group: 'core',
      description:
        'Optional. Leave blank to default to the page\'s own URL on cwkexperience.com.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      group: 'social',
      description:
        '1200x630 JPG, under 300KB. Falls back to the default OG image in Site Settings.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'ogType',
      title: 'Open Graph Type',
      type: 'string',
      group: 'social',
      description: 'website by default. article for case studies. profile for the About page.',
      options: {
        list: [
          { title: 'website', value: 'website' },
          { title: 'article', value: 'article' },
          { title: 'profile', value: 'profile' },
        ],
        layout: 'radio',
      },
      initialValue: 'website',
    }),
    defineField({
      name: 'twitterCard',
      title: 'Twitter Card',
      type: 'string',
      group: 'social',
      options: {
        list: [
          { title: 'summary_large_image (default)', value: 'summary_large_image' },
          { title: 'summary', value: 'summary' },
        ],
        layout: 'radio',
      },
      initialValue: 'summary_large_image',
    }),
    defineField({
      name: 'robots',
      title: 'Robots',
      type: 'string',
      group: 'crawler',
      description:
        'Default for content pages. Use "noindex" only for thank-you / utility pages.',
      options: {
        list: [
          { title: 'index, follow, max-image-preview:large (default)', value: 'index, follow, max-image-preview:large' },
          { title: 'index, follow, noarchive (dynamic results)', value: 'index, follow, noarchive' },
          { title: 'noindex, nofollow', value: 'noindex, nofollow' },
        ],
        layout: 'radio',
      },
      initialValue: 'index, follow, max-image-preview:large',
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords (internal QA only)',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'internal',
      description:
        'Used to QA H1/H2/body alignment. Not emitted as a meta tag (Google ignores it).',
    }),
    defineField({
      name: 'titleRationale',
      title: 'Title Rationale (internal)',
      type: 'text',
      rows: 2,
      group: 'internal',
      description: 'Why this title was chosen. Editorial note. Does not ship.',
    }),
  ],
});
