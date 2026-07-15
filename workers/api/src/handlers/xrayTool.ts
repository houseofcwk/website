// xrayTool — the CWK "get_player_result" tool, exposed to Kai via the Omazy
// chat tool-calling primitive (RFC micro-app M6). When Kai decides it needs the
// visitor's Player X-Ray result mid-conversation, the Omazy dispatcher POSTs
// here (HMAC-signed); we read the archetype the visitor saved to their Omazy
// CRM record (Core API) and return a compact factual summary the model can
// weave into its reply.
//
// Turn contract (core -> app, HMAC-signed via X-Omazy-Signature):
//   in  { tool, input, app_id, session_id, customer_id, identity:{verified} }
//   out { content, is_error? }
import type { Env } from '../env';
import { ARCHETYPES, type ArchetypeKey } from '../../../../src/data/assessment';

const CORE_API_BASE = 'https://mw.omazy.ai/api/v1';

interface ToolReq {
  tool?: string;
  input?: unknown;
  customer_id?: string | null;
}

async function verifyHmac(secret: string, raw: string, header: string | null): Promise<boolean> {
  if (!secret || !header) return false;
  const sig = header.startsWith('sha256=') ? header.slice(7) : header;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hex.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

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

async function fetchArchetype(env: Env, customerId: string): Promise<ArchetypeKey | null> {
  const token = (env as any).CORE_API_TOKEN as string | undefined;
  if (!token) return null;
  const res = await fetch(`${CORE_API_BASE}/core/customers/${customerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);
  if (!res || !res.ok) return null;
  const body = (await res.json().catch(() => null)) as any;
  const cf = body?.data?.custom_fields ?? body?.custom_fields;
  const arch = cf?.player_archetype;
  return typeof arch === 'string' ? (arch as ArchetypeKey) : null;
}

export async function handleXrayTool(request: Request, env: Env): Promise<Response> {
  const raw = await request.text();
  const ok = await verifyHmac((env as any).XRAY_HMAC_SECRET, raw, request.headers.get('X-Omazy-Signature'));
  if (!ok) return new Response('bad signature', { status: 401 });

  let req: ToolReq;
  try { req = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }
  const J = (o: unknown) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } });

  if (req.tool && req.tool !== 'get_player_result') {
    return J({ content: `Unknown tool "${req.tool}".`, is_error: true });
  }

  if (!req.customer_id) {
    return J({ content: "The visitor hasn't been identified yet, so there's no saved Player X-Ray result. Invite them to take the Player X-Ray (say \"player x-ray\")." });
  }

  const arch = await fetchArchetype(env, req.customer_id);
  if (!arch) {
    return J({ content: "This visitor hasn't taken the Player X-Ray yet. Invite them to take it — it's five quick reads, under 2 minutes." });
  }
  return J({ content: summarize(arch) });
}
