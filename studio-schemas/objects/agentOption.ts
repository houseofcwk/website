import { defineType, defineField } from 'sanity';

/**
 * One A–E answer option inside an agent flow step. The `letter` is load-bearing:
 * it is both the postback payload the widget sends back and the key the scoring
 * engine tallies, so it must be unique within its step.
 */
export const agentOption = defineType({
  name: 'agentOption',
  title: 'Answer Option',
  type: 'object',
  fields: [
    defineField({
      name: 'letter',
      title: 'Letter',
      type: 'string',
      description:
        'The answer key. Also the value the scoring engine tallies and the payload the chat button sends back. Must be unique within this step.',
      options: {
        list: [
          { title: 'A', value: 'A' },
          { title: 'B', value: 'B' },
          { title: 'C', value: 'C' },
          { title: 'D', value: 'D' },
          { title: 'E', value: 'E' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Option Text',
      type: 'text',
      rows: 2,
      description: 'What the visitor reads on the button. Keep it under ~140 characters — long options wrap badly in the chat widget.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { letter: 'letter', text: 'text' },
    prepare: ({ letter, text }) => ({
      title: `${letter ?? '?'} · ${text ?? ''}`,
    }),
  },
});
