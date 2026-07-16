// xrayTool — the CWK "get_player_result" tool, exposed to Kai via the Omazy
// chat tool-calling primitive (RFC micro-app M6). When Kai decides it needs the
// visitor's Player X-Ray result mid-conversation, the Omazy dispatcher POSTs
// here (HMAC-signed); we read the archetype the visitor saved to their Omazy
// CRM record (Core API) and return a compact factual summary for the reply.
import type { Env } from '../env';
import { ARCHETYPES, type ArchetypeKey } from '../../../../src/data/assessment';
import { readSigned, json, CoreClient, type ToolRequest, type ToolResponse } from '../omazy-sdk';

function summarize(archetype: ArchetypeKey): string {
  const a = ARCHETYPES[archetype];
  if (!a) return `The visitor's saved Player X-Ray archetype is "${archetype}".`;
  return (
    `The visitor already took the Player X-Ray. Their archetype is **${a.name}** (${a.eyebrow}). ` +
    `Tagline: ${a.tagline} ` +
    `What's happening: ${a.happening} ` +
    `What's costing them: ${a.mindMine} ` +
    `Their one move this week: ${a.oneMove} ` +
    `Ideal next environment: ${a.environment} ` +
    `Use this to personalize your reply; do not dump it verbatim.`
  );
}

export async function handleXrayTool(request: Request, env: Env): Promise<Response> {
  const s = await readSigned<ToolRequest>(request, (env as any).XRAY_HMAC_SECRET);
  if (!s.ok) return new Response('unauthorized', { status: s.status });
  const req = s.body;

  if (req.tool && req.tool !== 'get_player_result') {
    return json<ToolResponse>({ content: `Unknown tool "${req.tool}".`, is_error: true });
  }
  if (!req.customer_id) {
    return json<ToolResponse>({ content: "The visitor hasn't been identified yet, so there's no saved Player X-Ray result. Invite them to take the Player X-Ray (say \"player x-ray\")." });
  }

  const core = new CoreClient((env as any).CORE_API_TOKEN);
  const customer = await core.getCustomer(req.customer_id);
  const arch = customer?.custom_fields?.player_archetype;
  if (typeof arch !== 'string') {
    return json<ToolResponse>({ content: "This visitor hasn't taken the Player X-Ray yet. Invite them to take it — it's five quick reads, under 2 minutes." });
  }
  return json<ToolResponse>({ content: summarize(arch as ArchetypeKey) });
}
