import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // @ts-expect-error legacy Sanity v3 field used to lock singletons
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'nav',
      title: 'Primary Navigation',
      type: 'array',
      description: 'Links shown in the site header.',
      of: [
        {
          type: 'object',
          name: 'navItem',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Link',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        },
      ],
    }),
    defineField({
      name: 'footer',
      title: 'Footer',
      type: 'object',
      fields: [
        defineField({
          name: 'tagline',
          title: 'Tagline',
          type: 'string',
          description: 'Short line shown in the footer.',
        }),
        defineField({
          name: 'socialProofCount',
          title: 'Social Proof Count',
          type: 'number',
          description:
            'Used in social-proof copy ("Join X founders…"). Plain integer.',
        }),
        defineField({
          name: 'links',
          title: 'Footer Links',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'footerLink',
              fields: [
                defineField({
                  name: 'label',
                  title: 'Label',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'href',
                  title: 'Link',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
              ],
              preview: { select: { title: 'label', subtitle: 'href' } },
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seo',
      description:
        'Fallback SEO used when a page does not specify its own.',
    }),
    defineField({
      name: 'twitterHandle',
      title: 'Twitter / X Handle',
      type: 'string',
      description:
        'Used for the twitter:site meta tag. Include the leading "@", e.g. @cwkexperience.',
    }),
    defineField({
      name: 'organization',
      title: 'Organization (Schema.org)',
      type: 'organizationSchema',
      description:
        'Drives the site-wide Organization JSON-LD. Missing fields fall back to hardcoded values.',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs (FAQPage JSON-LD)',
      type: 'array',
      of: [{ type: 'faqItem' }],
      description:
        'Powers the FAQPage structured data on the home page (and /about/faq when it ships).',
    }),
    defineField({
      name: 'llmsTxt',
      title: 'llms.txt body',
      type: 'text',
      rows: 18,
      description:
        'Plain text served at /llms.txt for LLM crawlers. Edit here and re-deploy. Falls back to hardcoded copy when blank.',
    }),
    defineField({
      name: 'analytics',
      title: 'Analytics & Ad Pixels',
      type: 'object',
      description:
        'Tracking / ad-pixel IDs. These are PUBLIC IDs (they ship to the browser), safe to store here. Leave a field blank to disable that pixel. Changes go live on the next site deploy — publishing this document triggers a rebuild.',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'gtmId',
          title: 'Google Tag Manager Container ID',
          type: 'string',
          description: 'e.g. GTM-XXXXXXX. Loads the GTM container; manage individual tags inside GTM.',
        }),
        defineField({
          name: 'metaPixelId',
          title: 'Meta (Facebook) Pixel ID',
          type: 'string',
          description: 'Numeric ID from Meta Events Manager → Data sources.',
        }),
        defineField({
          name: 'tiktokPixelId',
          title: 'TikTok Pixel ID',
          type: 'string',
          description: 'From TikTok Ads Manager → Assets → Events → Web events.',
        }),
        defineField({
          name: 'linkedinPartnerId',
          title: 'LinkedIn Partner ID',
          type: 'string',
          description: 'Numeric Partner ID from LinkedIn Campaign Manager → Insight Tag.',
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
});
