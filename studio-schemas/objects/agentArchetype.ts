import { defineType, defineField } from 'sanity';

/**
 * One archetype (result) a flow can land on. `letter` binds it to the answer
 * options; `level` is the ordinal the modifier rule steps up and down.
 *
 * The prose fields are addressable from any template as {{archetype.<field>}} —
 * e.g. {{archetype.oneMove}} — in the result blocks, the tool response, the
 * ambient context line and the result email.
 */
export const agentArchetype = defineType({
  name: 'agentArchetype',
  title: 'Archetype',
  type: 'object',
  fields: [
    defineField({
      name: 'key',
      title: 'Key',
      type: 'string',
      description:
        'Stable identifier stored on the visitor\'s CRM record (custom_fields.player_archetype). Changing it orphans every result already saved.',
      validation: (Rule) =>
        Rule.required().regex(/^[a-z0-9_]+$/, {
          name: 'lowercase, digits and underscores only',
        }),
    }),
    defineField({
      name: 'letter',
      title: 'Letter',
      type: 'string',
      description: 'The answer letter that tallies to this archetype.',
      options: {
        list: ['A', 'B', 'C', 'D', 'E'].map((v) => ({ title: v, value: v })),
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'number',
      description:
        'Ordinal position, 1 = earliest stage. The level modifier moves a result up or down this ladder, so levels must be unique and contiguous.',
      validation: (Rule) => Rule.required().integer().min(1),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g. "Builder". Available as {{archetype.name}}.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'e.g. "Stage 03 · Proof without structure". {{archetype.eyebrow}}',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      rows: 2,
      description: 'One-line summary. {{archetype.tagline}}',
    }),
    defineField({
      name: 'happening',
      title: 'What is actually happening',
      type: 'text',
      rows: 4,
      description: '{{archetype.happening}}',
    }),
    defineField({
      name: 'working',
      title: 'What is working',
      type: 'text',
      rows: 4,
      description: '{{archetype.working}}',
    }),
    defineField({
      name: 'mindMine',
      title: 'What is costing you',
      type: 'text',
      rows: 4,
      description: '{{archetype.mindMine}}',
    }),
    defineField({
      name: 'oneMove',
      title: 'One move this week',
      type: 'text',
      rows: 3,
      description: 'The single action. {{archetype.oneMove}}',
    }),
    defineField({
      name: 'environment',
      title: 'Ideal next environment',
      type: 'text',
      rows: 3,
      description: '{{archetype.environment}}',
    }),
  ],
  preview: {
    select: { name: 'name', letter: 'letter', level: 'level', eyebrow: 'eyebrow' },
    prepare: ({ name, letter, level, eyebrow }) => ({
      title: `${letter ?? '?'} · L${level ?? '?'} · ${name ?? ''}`,
      subtitle: eyebrow,
    }),
  },
});
