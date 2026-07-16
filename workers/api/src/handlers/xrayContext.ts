// xrayContext — the CWK context-provider for Omazy (RFC micro-app M7). On every
// widget turn the Omazy context Builder POSTs the visitor's app-memory here
// (HMAC-signed); if they've taken the Player X-Ray we return a compact ambient
// context line so Kai ALWAYS knows their archetype — no tool call needed. The
// memory arrives in the request (core already holds it), so there's no Core API
// round-trip; we only map the archetype key to prose (ARCHETYPES lives here).
//
// Turn contract (core -> app, HMAC-signed via X-Omazy-Signature):
//   in  { app_id, session_id, customer_id, identity:{verified}, memory:{...custom_fields} }
//   out { context: "markdown", required?: bool }
import type { Env } from '../env';
import { ARCHETYPES, type ArchetypeKey } from '../../../../src/data/assessment';

interface CtxReq {
  memory?: Record<string, unknown> | null;
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
  const raw = await request.text();
  const ok = await verifyHmac((env as any).XRAY_HMAC_SECRET, raw, request.headers.get('X-Omazy-Signature'));
  if (!ok) return new Response('bad signature', { status: 401 });

  let req: CtxReq;
  try { req = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }
  const J = (o: unknown) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } });

  const arch = req.memory?.player_archetype;
  if (typeof arch !== 'string') {
    return J({ context: '' }); // hasn't taken the X-Ray — nothing ambient to add
  }
  return J({ context: contextBlock(arch as ArchetypeKey) });
}
