import { defineType, defineField } from 'sanity';

/**
 * One argument on an agent tool. Compiled into JSON Schema at serve time so
 * editors never hand-write JSON Schema — see workers/api/src/lib/agentConfig.ts
 * (compileInputSchema). A tool with no inputs serves the no-argument schema.
 */
export const agentToolInput = defineType({
  name: 'agentToolInput',
  title: 'Tool Argument',
  type: 'object',
  fields: [
    defineField({
      name: 'key',
      title: 'Argument Name',
      type: 'string',
      description: 'The JSON key the model must supply, e.g. "archetype_key".',
      validation: (Rule) =>
        Rule.required().regex(/^[a-z_][a-z0-9_]*$/, {
          name: 'lowercase identifier (letters, digits, underscores)',
        }),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Text (string)', value: 'string' },
          { title: 'Number', value: 'number' },
          { title: 'True / false (boolean)', value: 'boolean' },
          { title: 'List of text (array of strings)', value: 'string[]' },
        ],
        layout: 'radio',
      },
      initialValue: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description:
        'Written for the model, not the visitor. Say what the value means and where it comes from — this is how the model decides what to pass.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'enumValues',
      title: 'Allowed values',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Optional. When set, the model may only choose from these — the single most effective way to stop it inventing values.',
    }),
    defineField({
      name: 'required',
      title: 'Required',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { key: 'key', type: 'type', required: 'required' },
    prepare: ({ key, type, required }) => ({
      title: `${key ?? '?'}: ${type ?? 'string'}`,
      subtitle: required ? 'required' : 'optional',
    }),
  },
});
