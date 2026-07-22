import { defineType, defineField } from 'sanity';

/**
 * Scoring rules for a flow. Deliberately a bounded parameterisation, not a
 * scripting surface: tally the "tally" steps, break ties with one nominated
 * step, then optionally step the result down the level ladder when a "modifier"
 * step reports a level far below the tally.
 *
 * ⚠️ These rules change the result every visitor receives, with no test gate.
 * Use "Preview scoring" in the flow document before publishing a change.
 */
export const agentScoring = defineType({
  name: 'agentScoring',
  title: 'Scoring Rules',
  type: 'object',
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: 'tieBreakStepId',
      title: 'Tie-break step',
      type: 'string',
      description:
        'When two or more letters tie on count, the answer to THIS step wins if it is one of the tied letters. Leave blank to fall back to the lowest letter. (Currently q1 / Soul.)',
    }),
    defineField({
      name: 'modifierEnabled',
      title: 'Enable the level modifier',
      type: 'boolean',
      description:
        'When on, a "modifier"-role step can pull the result down the level ladder — the mindset-gap rule.',
      initialValue: true,
    }),
    defineField({
      name: 'modifierThreshold',
      title: 'Trigger when the gap is at least',
      type: 'number',
      description:
        'Levels. If the tallied archetype sits this many levels or more above the modifier step\'s answer, the drop applies. Current rule: 2.',
      initialValue: 2,
      hidden: ({ parent }) => !parent?.modifierEnabled,
      validation: (Rule) => Rule.integer().min(1).max(5),
    }),
    defineField({
      name: 'modifierDrop',
      title: 'Drop this many levels',
      type: 'number',
      description:
        'How far the result moves down when the rule fires. Never drops below level 1. Current rule: 1.',
      initialValue: 1,
      hidden: ({ parent }) => !parent?.modifierEnabled,
      validation: (Rule) => Rule.integer().min(1).max(4),
    }),
    defineField({
      name: 'gapNote',
      title: 'Mindset-gap note',
      type: 'text',
      rows: 3,
      description:
        'Appended to the result when the modifier fires. Supports {{archetype.*}} and {{raw.*}} tokens ({{raw.name}} is the archetype they scored before the drop).',
      hidden: ({ parent }) => !parent?.modifierEnabled,
    }),
  ],
});
