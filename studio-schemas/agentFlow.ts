import { defineType, defineField } from 'sanity';

/**
 * agentFlow — a guided, button-driven journey the app owns inside the chat.
 *
 * The worker drives the turn contract (start → steps → result → opt-in → OTP →
 * verified) and this document supplies everything else: trigger phrases, the
 * steps, the archetypes, the scoring rules, and every line of copy along the
 * way. Published changes go live within the config TTL — no deploy.
 */
export const agentFlow = defineType({
  name: 'agentFlow',
  title: 'Agent Flow (Journey)',
  type: 'document',
  groups: [
    { name: 'trigger', title: 'Trigger', default: true },
    { name: 'steps', title: 'Steps' },
    { name: 'results', title: 'Results' },
    { name: 'scoring', title: 'Scoring' },
    { name: 'copy', title: 'Copy & opt-in' },
    { name: 'agent', title: 'Agent awareness' },
  ],
  fields: [
    // ── Trigger ────────────────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      group: 'trigger',
      description: 'For your reference in this list only. Not shown to visitors.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'key',
      title: 'Flow Key',
      type: 'string',
      group: 'trigger',
      description:
        'Registered with Omazy as the flow key, e.g. cwk.player_xray. Changing it after install orphans the registration.',
      validation: (Rule) =>
        Rule.required().regex(/^[a-z][a-z0-9_.]*$/, {
          name: 'lowercase, dots and underscores only',
        }),
    }),
    defineField({
      name: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      group: 'trigger',
      description: 'Off removes the flow from the manifest and makes the webhook decline to start it.',
      initialValue: true,
    }),
    defineField({
      name: 'intents',
      title: 'Trigger Phrases',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'trigger',
      description:
        'What a visitor can say to start this flow. Matched before the model answers, so add the natural paraphrases people actually type — "what player am i", "run the x-ray". Cheap to add; each one is a phrase the model no longer has to guess at.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'webhookPath',
      title: 'Webhook Path',
      type: 'string',
      group: 'trigger',
      description: 'Resolved against the API base in Agent App. Rarely changes.',
      initialValue: '/xray/flow',
      validation: (Rule) => Rule.required(),
    }),

    // ── Steps ──────────────────────────────────────────────────────────────
    defineField({
      name: 'intro',
      title: 'Intro Card',
      type: 'object',
      group: 'steps',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'body', title: 'Body', type: 'text', rows: 3 }),
        defineField({ name: 'beginLabel', title: 'Begin button', type: 'string', initialValue: 'Begin ▶' }),
        defineField({ name: 'skipLabel', title: 'Decline button', type: 'string', initialValue: 'Not now' }),
      ],
    }),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [{ type: 'agentStep' }],
      group: 'steps',
      description: 'Asked in order. Every step must offer the same set of letters as the archetype list.',
      validation: (Rule) => Rule.required().min(1),
    }),

    // ── Results ────────────────────────────────────────────────────────────
    defineField({
      name: 'archetypes',
      title: 'Archetypes',
      type: 'array',
      of: [{ type: 'agentArchetype' }],
      group: 'results',
      description: 'The possible outcomes, ordered by level.',
      validation: (Rule) => Rule.required().min(2),
    }),
    defineField({
      name: 'resultTitleTemplate',
      title: 'Result — card title',
      type: 'string',
      group: 'results',
      initialValue: 'You are {{archetype.name}}',
      description: 'Supports {{archetype.*}} tokens.',
    }),
    defineField({
      name: 'resultTemplate',
      title: 'Result — body',
      type: 'text',
      rows: 12,
      group: 'results',
      description:
        'Markdown, rendered in the chat. Tokens: {{archetype.name}}, {{archetype.eyebrow}}, {{archetype.tagline}}, {{archetype.happening}}, {{archetype.working}}, {{archetype.mindMine}}, {{archetype.oneMove}}, {{archetype.environment}}. The mindset-gap note (Scoring tab) is appended automatically when it fires.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cta',
      title: 'Result CTA',
      type: 'ctaButton',
      group: 'results',
      description: 'The button shown under the result. Use a full URL for the booking link.',
    }),

    // ── Scoring ────────────────────────────────────────────────────────────
    defineField({
      name: 'scoring',
      title: 'Scoring Rules',
      type: 'agentScoring',
      group: 'scoring',
      description:
        '⚠️ These rules decide the result every visitor receives and there is no test gate on a publish. Change one thing at a time, and use the revision history to roll back if the outcome distribution shifts.',
    }),

    // ── Copy & opt-in ──────────────────────────────────────────────────────
    defineField({
      name: 'optIn',
      title: 'Opt-in',
      type: 'object',
      group: 'copy',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'emailLabel', title: 'Email + save button', type: 'string', initialValue: '📧 Email + save my result' }),
        defineField({ name: 'saveLabel', title: 'Save only button', type: 'string', initialValue: '💾 Just save it' }),
        defineField({ name: 'skipLabel', title: 'Decline button', type: 'string', initialValue: 'No thanks' }),
        defineField({ name: 'doneTitle', title: 'Confirmation title', type: 'string', initialValue: 'Done ✓' }),
        defineField({ name: 'doneBody', title: 'Confirmation body', type: 'text', rows: 2 }),
      ],
    }),
    defineField({
      name: 'messages',
      title: 'Interstitial messages',
      type: 'object',
      group: 'copy',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: 'declined',
          title: 'Visitor declines at the intro',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'optOut',
          title: 'Visitor declines to save the result',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'invalidPick',
          title: 'Visitor types instead of tapping',
          type: 'string',
          initialValue: 'Just tap one of the options 👇',
        }),
        defineField({
          name: 'restart',
          title: 'Unrecognised state',
          type: 'text',
          rows: 2,
          description: 'Shown when the flow state is stale or unreadable and it has to bail out cleanly.',
        }),
      ],
    }),
    defineField({
      name: 'email',
      title: 'Result email',
      type: 'object',
      group: 'copy',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'enabled', title: 'Send the result email', type: 'boolean', initialValue: true }),
        defineField({
          name: 'subjectTemplate',
          title: 'Subject',
          type: 'string',
          initialValue: 'Your CWK. Player X-Ray: you\'re {{archetype.name}}',
        }),
        defineField({
          name: 'bodyTemplate',
          title: 'Body',
          type: 'text',
          rows: 10,
          description:
            'Markdown-ish; wrapped in the CWK email shell before sending. Same {{archetype.*}} tokens as the result body.',
        }),
      ],
    }),

    // ── Agent awareness ────────────────────────────────────────────────────
    defineField({
      name: 'contextTemplate',
      title: 'Ambient context line',
      type: 'text',
      rows: 8,
      group: 'agent',
      description:
        'Injected into EVERY turn of the conversation once the visitor has a saved result, so the agent always knows their archetype without calling a tool. It costs tokens on every single turn — keep it tight, and write it as instruction ("Personalize naturally around this. Do not restate it verbatim.") rather than as data. Blank disables ambient context for this flow.',
    }),
    defineField({
      name: 'memoryKey',
      title: 'Memory key',
      type: 'string',
      group: 'agent',
      description:
        'The custom_fields key the result is saved under on the visitor\'s CRM record. Changing it makes every previously saved result unreadable.',
      initialValue: 'player_archetype',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', key: 'key', enabled: 'enabled', steps: 'steps' },
    prepare: ({ title, key, enabled, steps }) => ({
      title: `${enabled === false ? '○ ' : '● '}${title ?? key ?? 'untitled flow'}`,
      subtitle: `${key ?? ''} · ${steps?.length ?? 0} steps`,
    }),
  },
});
