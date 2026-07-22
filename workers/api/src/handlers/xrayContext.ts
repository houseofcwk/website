// xrayContext — the CWK context-provider for Omazy (RFC micro-app M7). On every
// widget turn the Omazy context Builder POSTs the visitor's app-memory here
// (HMAC-signed); if they've completed a flow we return a compact ambient context
// line so Kai ALWAYS knows their archetype — no tool call needed. The memory
// arrives in the request (core already holds it), so there is no Core API
// round-trip; we only map the saved key to prose.
//
// This line is injected into EVERY turn's prompt, so it is the one piece of
// config with a per-turn token cost. It is edited as `contextTemplate` on the
// agentFlow document; leaving that blank disables ambient context for the flow.
import type { Env } from '../env';
import { getAgentConfig, archetypeScope } from '../lib/agentConfig';
import { renderBlock } from '../lib/template';
import { readSigned, json, type ContextRequest, type ContextResponse } from '../omazy-sdk';

export async function handleXrayContext(request: Request, env: Env): Promise<Response> {
  const s = await readSigned<ContextRequest>(request, (env as any).XRAY_HMAC_SECRET);
  if (!s.ok) return new Response('unauthorized', { status: s.status });

  const memory = s.body.memory ?? {};
  const cfg = await getAgentConfig(env);

  // Each enabled flow contributes its own line, keyed off the memory field it
  // writes. Today that is one flow; the loop is what makes a second journey a
  // Studio change rather than a code change.
  const blocks: string[] = [];
  for (const flow of cfg.flows) {
    if (!flow.enabled || !flow.contextTemplate) continue;
    const saved = memory[flow.memoryKey];
    if (typeof saved !== 'string') continue;
    const archetype = flow.archetypes.find((a) => a.key === saved);
    if (!archetype) continue;
    blocks.push(renderBlock(flow.contextTemplate, archetypeScope(archetype)));
  }

  return json<ContextResponse>({ context: blocks.join('\n\n') });
}
