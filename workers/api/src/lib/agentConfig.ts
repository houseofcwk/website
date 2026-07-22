// agentConfig — loads the editable agent config (app identity, journeys, tools)
// from the Sanity Studio at runtime, so copy, trigger phrases, tool descriptions
// and scoring rules can be changed by publishing rather than deploying.
//
// Three layers, in order:
//   1. in-isolate memo, TTL seconds (default 60) — the common path, zero I/O
//   2. Sanity apicdn — edge-cached, typically single-digit ms
//   3. compiled fallback from src/data/assessment.ts — used when Sanity is
//      unreachable OR has no agentFlow documents yet
//
// Layer 3 is the important one: the live chat flow must not depend on Sanity
// being up. Same posture as getSiteSettings() on the site build.

import { QUESTIONS, ARCHETYPES, type ArchetypeKey } from '../../../../src/data/assessment';
import type {
  AgentConfig, RtApp, RtArchetype, RtFlow, RtOption, RtScoring, RtStep,
  RtTool, RtToolInput, StepRole, ToolHandlerKind,
} from './agentTypes';

const PROJECT_ID = '3fsa3jok';
const DATASET = 'production';
const API_VERSION = '2024-10-01';
const DEFAULT_TTL_SECONDS = 60;

// One request fetches all three document types. Drafts are excluded by the
// `!(_id in path("drafts.**"))` guard, so an in-progress edit in the Studio
// cannot reach a live visitor before it is published.
const QUERY = `{
  "app": *[_type == "agentApp" && !(_id in path("drafts.**"))][0]{
    workspace, app, slug, name, apiBase, scopes, contextPath
  },
  "flows": *[_type == "agentFlow" && !(_id in path("drafts.**"))]{
    key, title, enabled, intents, webhookPath, intro, steps, archetypes,
    resultTitleTemplate, resultTemplate, cta, scoring, optIn, messages, email,
    contextTemplate, memoryKey
  },
  "tools": *[_type == "agentTool" && !(_id in path("drafts.**"))]{
    name, enabled, description, inputs, handler, flowKey,
    responseTemplate, notTakenResponse, unidentifiedResponse
  }
}`;

// ── Normalisers ─────────────────────────────────────────────────────────────
// Every field is defensive. A document saved with a missing array or a null
// string is normal in Sanity (fields are optional until first filled), and it
// must never surface as `undefined` inside a handler.

const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' && v.trim() !== '' ? v : fallback;
const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;
const bool = (v: unknown, fallback: boolean): boolean =>
  typeof v === 'boolean' ? v : fallback;
const arr = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function normOption(raw: any): RtOption | null {
  const letter = str(raw?.letter).toUpperCase();
  if (!letter) return null;
  return { letter, text: str(raw?.text) };
}

function normStep(raw: any): RtStep | null {
  const id = str(raw?.id);
  const options = arr<any>(raw?.options).map(normOption).filter((o): o is RtOption => o !== null);
  if (!id || options.length === 0) return null;
  const role = str(raw?.role, 'tally') as StepRole;
  return {
    id,
    pillarLabel: str(raw?.pillarLabel),
    prompt: str(raw?.prompt),
    role: role === 'modifier' || role === 'info' ? role : 'tally',
    options,
  };
}

function normArchetype(raw: any): RtArchetype | null {
  const key = str(raw?.key);
  const letter = str(raw?.letter).toUpperCase();
  if (!key || !letter) return null;
  return {
    key,
    letter,
    level: num(raw?.level, 1),
    name: str(raw?.name, key),
    eyebrow: str(raw?.eyebrow),
    tagline: str(raw?.tagline),
    happening: str(raw?.happening),
    working: str(raw?.working),
    mindMine: str(raw?.mindMine),
    oneMove: str(raw?.oneMove),
    environment: str(raw?.environment),
  };
}

function normScoring(raw: any, steps: RtStep[]): RtScoring {
  // Default the tie-break to the first tallied step, matching the original
  // hand-written rule (Q1 / Soul wins ties).
  const firstTally = steps.find((s) => s.role === 'tally');
  return {
    tieBreakStepId: str(raw?.tieBreakStepId, firstTally?.id ?? ''),
    modifierEnabled: bool(raw?.modifierEnabled, true),
    modifierThreshold: num(raw?.modifierThreshold, 2),
    modifierDrop: num(raw?.modifierDrop, 1),
    gapNote: str(raw?.gapNote),
  };
}

function normFlow(raw: any): RtFlow | null {
  const key = str(raw?.key);
  const steps = arr<any>(raw?.steps).map(normStep).filter((s): s is RtStep => s !== null);
  const archetypes = arr<any>(raw?.archetypes)
    .map(normArchetype)
    .filter((a): a is RtArchetype => a !== null);
  // A flow with no steps or no outcomes cannot be driven; drop it rather than
  // serving a broken journey.
  if (!key || steps.length === 0 || archetypes.length === 0) return null;

  const ctaLabel = str(raw?.cta?.label);
  const ctaHref = str(raw?.cta?.href);

  return {
    key,
    title: str(raw?.title, key),
    enabled: bool(raw?.enabled, true),
    intents: arr<string>(raw?.intents).filter((s) => typeof s === 'string' && s.trim() !== ''),
    webhookPath: str(raw?.webhookPath, '/xray/flow'),
    intro: {
      title: str(raw?.intro?.title, 'Ready?'),
      body: str(raw?.intro?.body),
      beginLabel: str(raw?.intro?.beginLabel, 'Begin ▶'),
      skipLabel: str(raw?.intro?.skipLabel, 'Not now'),
    },
    steps,
    archetypes,
    resultTitleTemplate: str(raw?.resultTitleTemplate, 'You are {{archetype.name}}'),
    resultTemplate: str(raw?.resultTemplate),
    cta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : null,
    scoring: normScoring(raw?.scoring, steps),
    optIn: {
      emailLabel: str(raw?.optIn?.emailLabel, '📧 Email + save my result'),
      saveLabel: str(raw?.optIn?.saveLabel, '💾 Just save it'),
      skipLabel: str(raw?.optIn?.skipLabel, 'No thanks'),
      doneTitle: str(raw?.optIn?.doneTitle, 'Done ✓'),
      doneBody: str(raw?.optIn?.doneBody, 'Saved.'),
    },
    messages: {
      declined: str(raw?.messages?.declined, 'No rush. Whenever you want your read, just ask.'),
      optOut: str(raw?.messages?.optOut, 'Got it.'),
      invalidPick: str(raw?.messages?.invalidPick, 'Just tap one of the options 👇'),
      restart: str(raw?.messages?.restart, "Let's start fresh."),
    },
    email: {
      enabled: bool(raw?.email?.enabled, true),
      subjectTemplate: str(raw?.email?.subjectTemplate, 'Your result: {{archetype.name}}'),
      bodyTemplate: str(raw?.email?.bodyTemplate),
    },
    contextTemplate: str(raw?.contextTemplate),
    memoryKey: str(raw?.memoryKey, 'player_archetype'),
  };
}

function normToolInput(raw: any): RtToolInput | null {
  const key = str(raw?.key);
  if (!key) return null;
  const type = str(raw?.type, 'string');
  return {
    key,
    type: (['string', 'number', 'boolean', 'string[]'] as const).includes(type as any)
      ? (type as RtToolInput['type'])
      : 'string',
    description: str(raw?.description),
    enumValues: arr<string>(raw?.enumValues).filter((s) => typeof s === 'string'),
    required: bool(raw?.required, true),
  };
}

function normTool(raw: any): RtTool | null {
  const name = str(raw?.name);
  const description = str(raw?.description);
  // A tool the model has no description for is worse than no tool at all — it
  // gets called at random. Drop it.
  if (!name || !description) return null;
  const handler = str(raw?.handler, 'player_result') as ToolHandlerKind;
  return {
    name,
    enabled: bool(raw?.enabled, true),
    description,
    inputs: arr<any>(raw?.inputs).map(normToolInput).filter((i): i is RtToolInput => i !== null),
    handler: handler === 'static' ? 'static' : 'player_result',
    flowKey: str(raw?.flowKey),
    responseTemplate: str(raw?.responseTemplate),
    notTakenResponse: str(raw?.notTakenResponse, "This visitor hasn't taken it yet."),
    unidentifiedResponse: str(
      raw?.unidentifiedResponse,
      "The visitor hasn't been identified yet, so there's no saved result.",
    ),
  };
}

const DEFAULT_SCOPES = ['core:read', 'memory:write'];

function normApp(raw: any): RtApp {
  const scopes = arr<string>(raw?.scopes).filter((s) => typeof s === 'string' && s.trim() !== '');
  return {
    workspace: str(raw?.workspace, 'cwk'),
    app: str(raw?.app, 'cwk'),
    slug: str(raw?.slug, 'cwk'),
    name: str(raw?.name, 'CWK Player X-Ray'),
    apiBase: str(raw?.apiBase, 'https://api.cwkexperience.com').replace(/\/+$/, ''),
    // An app document saved with no scopes would silently strip the manifest's
    // permissions; fall back to the minimum this app has always requested.
    scopes: scopes.length > 0 ? scopes : DEFAULT_SCOPES,
    contextPath: str(raw?.contextPath, '/xray/context'),
  };
}

// ── Compiled fallback ───────────────────────────────────────────────────────
// Built from src/data/assessment.ts — the same module the site's /assessment
// page uses. Reproduces the copy the handlers shipped with before the config
// existed, so falling back is invisible to a visitor mid-flow.

const ARCHETYPE_ORDER: ArchetypeKey[] = ['explorer', 'committer', 'builder', 'operator', 'sovereign'];

const FALLBACK_RESULT_TEMPLATE = [
  '**{{archetype.eyebrow}}**',
  '',
  '{{archetype.tagline}}',
  '',
  "**What's happening:** {{archetype.happening}}",
  '',
  "**⚡ What's costing you:** {{archetype.mindMine}}",
  '',
  '**🎯 Your one move this week:** {{archetype.oneMove}}',
  '',
  '**🌱 Ideal next environment:** {{archetype.environment}}',
].join('\n');

const FALLBACK_GAP_NOTE =
  "**⚠️ Mindset gap:** your behaviour signals the next stage but the revenue reality isn't there yet. That's a finding, not a penalty — the work now is closing the gap.";

const FALLBACK_CONTEXT_TEMPLATE = [
  '## What you know about this visitor',
  'They have already taken the CWK Player X-Ray. Their archetype is **{{archetype.name}}** ({{archetype.eyebrow}}) — "{{archetype.tagline}}" Their recommended one move: {{archetype.oneMove}} Ideal next environment: {{archetype.environment}}',
  'Personalize naturally around this. Do not re-run the X-Ray or restate it verbatim unless they ask.',
].join('\n');

const FALLBACK_TOOL_TEMPLATE = [
  'The visitor already took the Player X-Ray. Their archetype is **{{archetype.name}}** ({{archetype.eyebrow}}).',
  'Tagline: {{archetype.tagline}}',
  "What's happening: {{archetype.happening}}",
  "What's costing them: {{archetype.mindMine}}",
  'Their one move this week: {{archetype.oneMove}}',
  'Ideal next environment: {{archetype.environment}}',
  'Use this to personalize your reply; do not dump it verbatim.',
].join('\n');

function fallbackFlow(): RtFlow {
  const steps: RtStep[] = QUESTIONS.map((q) => ({
    id: q.id,
    pillarLabel: q.pillarLabel,
    prompt: q.prompt,
    role: q.scored ? 'tally' : 'modifier',
    options: q.options.map((o) => ({ letter: o.letter, text: o.text })),
  }));
  const archetypes: RtArchetype[] = ARCHETYPE_ORDER.map((k) => {
    const a = ARCHETYPES[k];
    return {
      key: a.key, letter: a.letter, level: a.level, name: a.name, eyebrow: a.eyebrow,
      tagline: a.tagline, happening: a.happening, working: a.working,
      mindMine: a.mindMine, oneMove: a.oneMove, environment: a.environment,
    };
  });
  return {
    key: 'cwk.player_xray',
    title: 'Player X-Ray',
    enabled: true,
    intents: [
      'player x-ray', 'player xray', 'what player am i',
      'which player are you', 'run the x-ray', 'take the player x-ray',
    ],
    webhookPath: '/xray/flow',
    intro: {
      title: 'The Player X-Ray 🩺',
      body: "Five quick reads, under 2 minutes. No email needed to see your result. I'll tell you which player you are in the jungle.",
      beginLabel: 'Begin ▶',
      skipLabel: 'Not now',
    },
    steps,
    archetypes,
    resultTitleTemplate: 'You are {{archetype.name}}',
    resultTemplate: FALLBACK_RESULT_TEMPLATE,
    cta: { label: 'Book an Experience Tour →', href: 'https://calendly.com/cwkexperience/experience-tour' },
    scoring: {
      tieBreakStepId: 'q1',
      modifierEnabled: true,
      modifierThreshold: 2,
      modifierDrop: 1,
      gapNote: FALLBACK_GAP_NOTE,
    },
    optIn: {
      emailLabel: '📧 Email + save my result',
      saveLabel: '💾 Just save it',
      skipLabel: 'No thanks',
      doneTitle: 'Done, mi amor ✓',
      doneBody: "Saved. Whenever you're ready, the Experience Tour is your next door.",
    },
    messages: {
      declined: 'No rush 🌴 Whenever you want your read, just say "player x-ray".',
      optOut: 'Got it. Go make that one move this week 🎯',
      invalidPick: 'Just tap one of the options 👇',
      restart: "Let's start fresh — say \"player x-ray\" for your read 🌴",
    },
    email: {
      enabled: true,
      subjectTemplate: "Your CWK. Player X-Ray: you're {{archetype.name}}",
      bodyTemplate: [
        "**What's happening:** {{archetype.happening}}",
        "**What's costing you:** {{archetype.mindMine}}",
        '**Your one move this week:** {{archetype.oneMove}}',
        '**Ideal next environment:** {{archetype.environment}}',
      ].join('\n\n'),
    },
    contextTemplate: FALLBACK_CONTEXT_TEMPLATE,
    memoryKey: 'player_archetype',
  };
}

/**
 * The compiled config, built from src/data/assessment.ts. Served whenever
 * Sanity is unreachable or unseeded — and exported so scripts/seed-agent-config.mjs
 * can push exactly this content into the Studio, guaranteeing the seeded
 * documents reproduce what is live today rather than an approximation of it.
 */
export function fallbackConfig(): AgentConfig {
  return {
    app: normApp(null),
    flows: [fallbackFlow()],
    tools: [{
      name: 'get_player_result',
      enabled: true,
      description:
        'Look up THIS visitor\'s saved "Player X-Ray" result — their player archetype and personalized guidance. Call this whenever the visitor asks about their player type, their result, their archetype, or refers to having taken the X-Ray. Takes no arguments.',
      inputs: [],
      handler: 'player_result',
      flowKey: 'cwk.player_xray',
      responseTemplate: FALLBACK_TOOL_TEMPLATE,
      notTakenResponse:
        "This visitor hasn't taken the Player X-Ray yet. Invite them to take it — it's five quick reads, under 2 minutes.",
      unidentifiedResponse:
        'The visitor hasn\'t been identified yet, so there\'s no saved Player X-Ray result. Invite them to take the Player X-Ray (say "player x-ray").',
    }],
    source: 'fallback',
    loadedAt: Date.now(),
  };
}

// ── Loader ──────────────────────────────────────────────────────────────────

let memo: AgentConfig | null = null;

function ttlMs(env: any): number {
  const raw = Number(env?.AGENT_CONFIG_TTL);
  return (Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TTL_SECONDS) * 1000;
}

async function fetchFromSanity(env: any): Promise<AgentConfig | null> {
  const projectId = str(env?.SANITY_PROJECT_ID, PROJECT_ID);
  const dataset = str(env?.SANITY_DATASET, DATASET);
  const url = `https://${projectId}.apicdn.sanity.io/v${API_VERSION}/data/query/${dataset}?query=${encodeURIComponent(QUERY)}`;

  const res = await fetch(url, { headers: { Accept: 'application/json' } }).catch(() => null);
  if (!res || !res.ok) return null;
  const body = (await res.json().catch(() => null)) as any;
  const result = body?.result;
  if (!result) return null;

  const flows = arr<any>(result.flows).map(normFlow).filter((f): f is RtFlow => f !== null);
  // No published flows means the Studio hasn't been seeded — the compiled
  // config is the better answer, not an empty one.
  if (flows.length === 0) return null;

  return {
    app: normApp(result.app),
    flows,
    tools: arr<any>(result.tools).map(normTool).filter((t): t is RtTool => t !== null),
    source: 'sanity',
    loadedAt: Date.now(),
  };
}

/**
 * The agent config. Memoised per isolate for AGENT_CONFIG_TTL seconds (60 by
 * default), so a Studio publish goes live within roughly a minute. Pass
 * `{ fresh: true }` to bypass the memo — used by /agent/manifest?fresh=1 to
 * verify a publish immediately.
 *
 * Never throws and never returns null: on any failure the compiled fallback is
 * served, so a Sanity outage degrades editability, not the live chat.
 */
export async function getAgentConfig(env: any, opts?: { fresh?: boolean }): Promise<AgentConfig> {
  if (!opts?.fresh && memo && Date.now() - memo.loadedAt < ttlMs(env)) return memo;
  const fetched = await fetchFromSanity(env).catch(() => null);
  memo = fetched ?? fallbackConfig();
  return memo;
}

export function getFlow(cfg: AgentConfig, key: string): RtFlow | null {
  return cfg.flows.find((f) => f.key === key && f.enabled) ?? null;
}

export function getTool(cfg: AgentConfig, name: string): RtTool | null {
  return cfg.tools.find((t) => t.name === name && t.enabled) ?? null;
}

/** Scope object every template renders against, for one archetype outcome. */
export function archetypeScope(archetype: RtArchetype, raw?: RtArchetype) {
  return { archetype, raw: raw ?? archetype };
}

/** Compile a tool's argument list into JSON Schema for the manifest. */
export function compileInputSchema(tool: RtTool): Record<string, unknown> {
  if (tool.inputs.length === 0) {
    return { type: 'object', properties: {}, additionalProperties: false };
  }
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const input of tool.inputs) {
    const base: Record<string, unknown> =
      input.type === 'string[]'
        ? { type: 'array', items: { type: 'string' } }
        : { type: input.type };
    base.description = input.description;
    if (input.enumValues.length > 0) {
      if (input.type === 'string[]') base.items = { type: 'string', enum: input.enumValues };
      else base.enum = input.enumValues;
    }
    properties[input.key] = base;
    if (input.required) required.push(input.key);
  }
  return {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
    additionalProperties: false,
  };
}

/** Render the Omazy install manifest from the config. */
export function buildManifest(cfg: AgentConfig): Record<string, unknown> {
  const { app } = cfg;
  return {
    workspace: app.workspace,
    app: app.app,
    slug: app.slug,
    name: app.name,
    scopes: app.scopes,
    flows: cfg.flows
      .filter((f) => f.enabled)
      .map((f) => ({
        key: f.key,
        webhook: `${app.apiBase}${f.webhookPath}`,
        intents: f.intents,
      })),
    tools: cfg.tools
      .filter((t) => t.enabled)
      .map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: compileInputSchema(t),
        endpoint: `${app.apiBase}/xray/tool`,
      })),
    ...(app.contextPath
      ? { context_provider: { endpoint: `${app.apiBase}${app.contextPath}` } }
      : {}),
  };
}
