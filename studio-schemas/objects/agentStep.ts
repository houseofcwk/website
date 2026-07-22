import { defineType, defineField } from 'sanity';

/**
 * One step ("read") in an agent flow. `role` is what the scoring engine keys off:
 *   - tally    → the answer letter counts toward the archetype tally
 *   - modifier → the answer is NOT tallied; it feeds the level modifier rule
 *   - info     → neither; the step is asked but ignored by scoring
 */
export const agentStep = defineType({
  name: 'agentStep',
  title: 'Step',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'Step ID',
      type: 'string',
      description:
        'Stable identifier (e.g. q1). Referenced by the scoring rules and used as the analytics key — changing it after launch breaks both.',
      validation: (Rule) =>
        Rule.required().regex(/^[a-z0-9_]+$/, {
          name: 'lowercase, digits and underscores only',
        }),
    }),
    defineField({
      name: 'pillarLabel',
      title: 'Pillar Label',
      type: 'string',
      description: 'Shown as the card eyebrow, e.g. "Soul", "Revenue band".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'prompt',
      title: 'Prompt',
      type: 'text',
      rows: 3,
      description: 'The question the visitor is asked.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Scoring Role',
      type: 'string',
      description:
        'How the scoring engine treats this step. "Counts toward archetype" is the normal case; use "Feeds the level modifier" for the revenue-band style step.',
      options: {
        list: [
          { title: 'Counts toward archetype', value: 'tally' },
          { title: 'Feeds the level modifier', value: 'modifier' },
          { title: 'Asked but ignored by scoring', value: 'info' },
        ],
        layout: 'radio',
      },
      initialValue: 'tally',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'options',
      title: 'Options',
      type: 'array',
      of: [{ type: 'agentOption' }],
      description:
        'One option per archetype level, in ascending order. Every letter used here must exist in the Archetypes list below.',
      validation: (Rule) => Rule.required().min(2),
    }),
  ],
  preview: {
    select: { id: 'id', pillar: 'pillarLabel', prompt: 'prompt', role: 'role' },
    prepare: ({ id, pillar, prompt, role }) => ({
      title: `${id ?? '?'} · ${pillar ?? ''}`,
      subtitle: `${role === 'modifier' ? '⚖︎ modifier' : role === 'info' ? '· not scored' : '✓ tallied'} — ${prompt ?? ''}`,
    }),
  },
});
