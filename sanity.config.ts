import { defineConfig } from 'sanity';
// In Sanity v5, `deskTool` was renamed to `structureTool` (same feature).
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './studio-schemas';

const SINGLETONS = [
  'siteSettings',
  'homePage',
  'productPage',
  'aboutPage',
  'journeyPage',
  'sideQuestsPage',
] as const;

type SingletonId = (typeof SINGLETONS)[number];

export default defineConfig({
  name: 'cwk-plos-studio',
  title: 'CWK. Experience',
  basePath: '/studio',
  projectId: '3fsa3jok',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings'),
              ),
            S.divider(),
            S.listItem()
              .title('Home')
              .child(
                S.document()
                  .schemaType('homePage')
                  .documentId('homePage'),
              ),
            S.listItem()
              .title('Product')
              .child(
                S.document()
                  .schemaType('productPage')
                  .documentId('productPage'),
              ),
            S.listItem()
              .title('About')
              .child(
                S.document()
                  .schemaType('aboutPage')
                  .documentId('aboutPage'),
              ),
            S.listItem()
              .title('Journey')
              .child(
                S.document()
                  .schemaType('journeyPage')
                  .documentId('journeyPage'),
              ),
            S.listItem()
              .title('Side Quests')
              .child(
                S.document()
                  .schemaType('sideQuestsPage')
                  .documentId('sideQuestsPage'),
              ),
            S.divider(),
            S.documentTypeListItem('caseStudy').title('Case Studies'),
            S.documentTypeListItem('legalPage').title('Legal Pages'),
          ]),
    }),
    visionTool({ defaultApiVersion: '2024-10-01' }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(
        ({ schemaType }) => !SINGLETONS.includes(schemaType as SingletonId),
      ),
  },
  document: {
    // Remove "Duplicate" / "Delete" from singletons via new-document menu filter
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter(
          (item) => !SINGLETONS.includes(item.templateId as SingletonId),
        );
      }
      return prev;
    },
    actions: (prev, { schemaType }) => {
      if (SINGLETONS.includes(schemaType as SingletonId)) {
        return prev.filter(
          ({ action }) =>
            action !== 'delete' &&
            action !== 'duplicate' &&
            action !== 'unpublish',
        );
      }
      return prev;
    },
  },
});
