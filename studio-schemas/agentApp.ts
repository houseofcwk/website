import { defineType, defineField } from 'sanity';

/**
 * agentApp — the install-level identity of the CWK micro-app on Omazy.
 * Singleton. These fields, plus every enabled agentFlow and agentTool, are
 * what GET https://api.cwkexperience.com/agent/manifest renders. The manifest
 * is generated from here rather than hand-maintained on the Omazy side.
 */
export const agentApp = defineType({
  name: 'agentApp',
  title: 'Agent App',
  type: 'document',
  // @ts-expect-error legacy Sanity v3 field used to lock singletons
  __experimental_actions: ['update', 'publish'],
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'access', title: 'Access' },
  ],
  fields: [
    defineField({
      name: 'workspace',
      title: 'Workspace',
      type: 'string',
      group: 'identity',
      description: 'Omazy workspace slug.',
      initialValue: 'cwk',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'app',
      title: 'App',
      type: 'string',
      group: 'identity',
      initialValue: 'cwk',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'string',
      group: 'identity',
      initialValue: 'cwk',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      title: 'Display Name',
      type: 'string',
      group: 'identity',
      description: 'Shown in the Omazy install list.',
      initialValue: 'CWK Player X-Ray',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'apiBase',
      title: 'API Base URL',
      type: 'url',
      group: 'identity',
      description:
        'Origin the flow / tool / context endpoints are built from. Every path in the manifest is resolved against this.',
      initialValue: 'https://api.cwkexperience.com',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'scopes',
      title: 'Scopes',
      type: 'array',
      group: 'access',
      of: [{ type: 'string' }],
      description:
        'Requested Core API scopes. Grant the minimum: core:read to look a visitor up, memory:write to save their result, core:write only if the app posts messages on its own.',
      options: {
        list: [
          { title: 'core:read — read customer records', value: 'core:read' },
          { title: 'memory:write — save to customer memory', value: 'memory:write' },
          { title: 'core:write — post messages as the app', value: 'core:write' },
        ],
      },
      initialValue: ['core:read', 'memory:write'],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'contextPath',
      title: 'Context Provider Path',
      type: 'string',
      group: 'access',
      description:
        'Endpoint the context builder POSTs to on every turn. Blank disables the context provider entirely (the app then relies on tool calls alone).',
      initialValue: '/xray/context',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Agent App', subtitle: 'Install identity + scopes' }),
  },
});
