// agentTypes — the runtime shape of the agent config, after normalisation.
//
// This is what the handlers program against. It is intentionally NOT the raw
// Sanity document shape: agentConfig.ts normalises Studio documents into these
// types (filling defaults, coercing missing arrays, dropping malformed rows) so
// a half-filled document in the Studio can never reach a handler as `undefined`.

export interface RtOption {
  letter: string;
  text: string;
}

export type StepRole = 'tally' | 'modifier' | 'info';

export interface RtStep {
  id: string;
  pillarLabel: string;
  prompt: string;
  role: StepRole;
  options: RtOption[];
}

export interface RtArchetype {
  key: string;
  letter: string;
  level: number;
  name: string;
  eyebrow: string;
  tagline: string;
  happening: string;
  working: string;
  mindMine: string;
  oneMove: string;
  environment: string;
}

export interface RtScoring {
  tieBreakStepId: string;
  modifierEnabled: boolean;
  modifierThreshold: number;
  modifierDrop: number;
  gapNote: string;
}

export interface RtFlow {
  key: string;
  title: string;
  enabled: boolean;
  intents: string[];
  webhookPath: string;
  intro: { title: string; body: string; beginLabel: string; skipLabel: string };
  steps: RtStep[];
  archetypes: RtArchetype[];
  resultTitleTemplate: string;
  resultTemplate: string;
  cta: { label: string; href: string } | null;
  scoring: RtScoring;
  optIn: {
    emailLabel: string;
    saveLabel: string;
    skipLabel: string;
    doneTitle: string;
    doneBody: string;
  };
  messages: {
    declined: string;
    optOut: string;
    invalidPick: string;
    restart: string;
  };
  email: { enabled: boolean; subjectTemplate: string; bodyTemplate: string };
  contextTemplate: string;
  memoryKey: string;
}

export type ToolHandlerKind = 'player_result' | 'static';

export interface RtToolInput {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'string[]';
  description: string;
  enumValues: string[];
  required: boolean;
}

export interface RtTool {
  name: string;
  enabled: boolean;
  description: string;
  inputs: RtToolInput[];
  handler: ToolHandlerKind;
  flowKey: string;
  responseTemplate: string;
  notTakenResponse: string;
  unidentifiedResponse: string;
}

export interface RtApp {
  workspace: string;
  app: string;
  slug: string;
  name: string;
  apiBase: string;
  scopes: string[];
  contextPath: string;
}

export interface AgentConfig {
  app: RtApp;
  flows: RtFlow[];
  tools: RtTool[];
  /** Where this config came from — surfaced on /agent/manifest for debugging. */
  source: 'sanity' | 'fallback';
  /** Epoch ms the config was loaded. */
  loadedAt: number;
}
