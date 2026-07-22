// xrayTool — the agent-callable tools endpoint, exposed to Kai via the Omazy
// chat tool-calling primitive (RFC micro-app M6). When Kai decides it needs one
// of the app's tools mid-conversation, the Omazy dispatcher POSTs here
// (HMAC-signed) with the tool name; we resolve it against the agentTool
// documents in the Studio and return the rendered content for the reply.
//
// The model-facing surface — name, description, arguments, response copy — is
// editable in the Studio. The data lookup is a named handler below; adding a
// tool that reads a NEW data source is the one change that still needs code.
import type { Env } from '../env';
import { getAgentConfig, getFlow, getTool, archetypeScope } from '../lib/agentConfig';
import { renderBlock } from '../lib/template';
import type { AgentConfig, RtTool } from '../lib/agentTypes';
import { readSigned, json, CoreClient, type ToolRequest, type ToolResponse } from '../omazy-sdk';

/**
 * player_result — read the archetype the visitor saved to their Omazy CRM
 * record during the flow this tool is bound to, and render the tool's response
 * template against it.
 */
async function playerResult(
  env: Env, cfg: AgentConfig, tool: RtTool, customerId: string | null | undefined,
): Promise<ToolResponse> {
  if (!customerId) return { content: tool.unidentifiedResponse };

  const flow = getFlow(cfg, tool.flowKey) ?? cfg.flows[0];
  if (!flow) return { content: tool.notTakenResponse };

  const customer = await new CoreClient((env as any).CORE_API_TOKEN).getCustomer(customerId);
  const saved = customer?.custom_fields?.[flow.memoryKey];
  if (typeof saved !== 'string') return { content: tool.notTakenResponse };

  const archetype = flow.archetypes.find((a) => a.key === saved);
  if (!archetype) {
    // A result saved under a key the flow no longer defines — the archetype was
    // renamed or removed in the Studio after this visitor took it. Report the
    // raw key rather than claiming they never took it.
    return { content: `The visitor's saved result is "${saved}", which no longer maps to a current archetype.` };
  }

  return { content: renderBlock(tool.responseTemplate, archetypeScope(archetype)) };
}

export async function handleXrayTool(request: Request, env: Env): Promise<Response> {
  const s = await readSigned<ToolRequest>(request, (env as any).XRAY_HMAC_SECRET);
  if (!s.ok) return new Response('unauthorized', { status: s.status });
  const req = s.body;

  const cfg = await getAgentConfig(env);
  // A missing tool name means a single-tool install; fall back to the only
  // enabled tool so existing registrations keep working.
  const enabled = cfg.tools.filter((t) => t.enabled);
  const tool = req.tool ? getTool(cfg, req.tool) : enabled.length === 1 ? enabled[0] : null;

  if (!tool) {
    return json<ToolResponse>({ content: `Unknown tool "${req.tool ?? ''}".`, is_error: true });
  }

  if (tool.handler === 'static') {
    return json<ToolResponse>({ content: tool.responseTemplate });
  }

  return json<ToolResponse>(await playerResult(env, cfg, tool, req.customer_id));
}
