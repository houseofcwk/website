// xrayContext — the CWK context-provider for Omazy (RFC micro-app M7). On every
// widget turn the Omazy context Builder POSTs the visitor's app-memory here
// (HMAC-signed); if they've taken the Player X-Ray we return a compact ambient
// context line so Kai ALWAYS knows their archetype — no tool call needed. The
// memory arrives in the request (core already holds it), so there's no Core API
// round-trip; we only map the archetype key to prose (ARCHETYPES lives here).
import type { Env } from '../env';
import { ARCHETYPES, type ArchetypeKey } from '../../../../src/data/assessment';
import { readSigned, json, type ContextRequest, type ContextResponse } from '../omazy-sdk';

// A tight one-block line — this is injected into EVERY turn's prompt, so keep
// it compact. Kai uses it to personalize; it must not be dumped verbatim.
function contextBlock(archetype: ArchetypeKey): string {
  const a = ARCHETYPES[archetype];
  if (!a) return '';
  return (
    `## What you know about this visitor\n` +
    `They have already taken the CWK Player X-Ray. Their archetype is **${a.name}** (${a.eyebrow}) — "${a.tagline}" ` +
    `Their recommended one move: ${a.oneMove} ` +
    `Ideal next environment: ${a.environment}\n` +
    `Personalize naturally around this. Do not re-run the X-Ray or restate it verbatim unless they ask.`
  );
}

export async function handleXrayContext(request: Request, env: Env): Promise<Response> {
  const s = await readSigned<ContextRequest>(request, (env as any).XRAY_HMAC_SECRET);
  if (!s.ok) return new Response('unauthorized', { status: s.status });

  const arch = s.body.memory?.player_archetype;
  const resp: ContextResponse =
    typeof arch === 'string' ? { context: contextBlock(arch as ArchetypeKey) } : { context: '' };
  return json(resp);
}
