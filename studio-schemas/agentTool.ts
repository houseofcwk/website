import { defineType, defineField } from 'sanity';

/**
 * agentTool — a function the agent (Kai) can call mid-answer.
 *
 * Two halves, and the split matters:
 *   - The MODEL-FACING half (name, description, arguments, response templates)
 *     is fully editable here and takes effect within the config TTL, no deploy.
 *   - The DATA half is a named handler in the worker
 *     (workers/api/src/lib/toolHandlers.ts). A tool that needs a data source the
 *     worker cannot already reach still needs a small code change; this document
 *     cannot invent one.
 */
export const agentTool = defineType({
  name: 'agentTool',
  title: 'Agent Tool',
  type: 'document',
  groups: [
    { name: 'model', title: 'What the model sees', default: true },
    { name: 'response', title: 'Response copy' },
    { name: 'wiring', title: 'Wiring' },
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Tool Name',
      type: 'string',
      group: 'model',
      description:
        'The function name the model calls, e.g. get_player_result. Lowercase with underscores. Renaming a live tool invalidates any prompt that references it by name.',
      validation: (Rule) =>
        Rule.required().regex(/^[a-z][a-z0-9_]*$/, {
          name: 'lowercase identifier (letters, digits, underscores)',
        }),
    }),
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      group: 'model',
      description: 'Off removes the tool from the manifest and makes the endpoint refuse calls.',
      initialValue: true,
    }),
    defineField({
      name: 'description',
      title: 'Description (model-facing)',
      type: 'text',
      rows: 6,
      group: 'model',
      description:
        'The highest-leverage field in this document. This text is the ONLY thing the model uses to decide whether to call the tool — so name the trigger conditions explicitly ("Call this whenever the visitor asks about their player type, their result, their archetype…") rather than describing what the tool returns.',
      validation: (Rule) => Rule.required().min(40).warning('Short descriptions cause the model to under-call the tool. Spell out when it should fire.'),
    }),
    defineField({
      name: 'inputs',
      title: 'Arguments',
      type: 'array',
      group: 'model',
      of: [{ type: 'agentToolInput' }],
      description:
        'Leave empty for a no-argument tool. Compiled to JSON Schema automatically — you never write JSON here.',
    }),
    defineField({
      name: 'handler',
      title: 'Data Handler',
      type: 'string',
      group: 'wiring',
      description:
        'Which worker function fetches the data. Adding a new option here requires a code change in workers/api/src/lib/toolHandlers.ts.',
      options: {
        list: [
          { title: 'Player result — reads the visitor\'s saved archetype', value: 'player_result' },
          { title: 'Static — returns the success template with no lookup', value: 'static' },
        ],
        layout: 'radio',
      },
      initialValue: 'player_result',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'flowKey',
      title: 'Reads from flow',
      type: 'string',
      group: 'wiring',
      description:
        'Which flow\'s saved result this tool reads (e.g. cwk.player_xray). Determines which archetype list the response templates resolve against.',
      initialValue: 'cwk.player_xray',
      hidden: ({ parent }) => parent?.handler !== 'player_result',
    }),
    defineField({
      name: 'responseTemplate',
      title: 'Response — result found',
      type: 'text',
      rows: 8,
      group: 'response',
      description:
        'What the tool hands back to the model. Tokens: {{archetype.name}}, {{archetype.eyebrow}}, {{archetype.tagline}}, {{archetype.happening}}, {{archetype.mindMine}}, {{archetype.oneMove}}, {{archetype.environment}}. End with an instruction — the model treats this as source material, so tell it not to recite verbatim.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'notTakenResponse',
      title: 'Response — visitor has no saved result',
      type: 'text',
      rows: 3,
      group: 'response',
      description: 'Returned when the visitor is known but has not completed the flow.',
    }),
    defineField({
      name: 'unidentifiedResponse',
      title: 'Response — visitor not identified',
      type: 'text',
      rows: 3,
      group: 'response',
      description: 'Returned when there is no customer record on the session yet, so nothing can be looked up.',
    }),
  ],
  preview: {
    select: { name: 'name', enabled: 'enabled', description: 'description' },
    prepare: ({ name, enabled, description }) => ({
      title: `${enabled === false ? '○ ' : '● '}${name ?? 'untitled tool'}`,
      subtitle: description,
    }),
  },
});
