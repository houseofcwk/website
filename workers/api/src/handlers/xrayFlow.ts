// xrayFlow — the CWK "Player X-Ray" as an Omazy micro-app conversational flow.
//
// Implements the Omazy plugin-flow turn contract (RFC micro-app M4): the Omazy
// dispatcher POSTs each widget turn here (HMAC-signed); we drive the guided,
// button-based Player X-Ray, score it (reusing the site's assessment.ts — one
// source of truth), and return rfc2207 blocks. On opt-in we let Omazy run the
// OTP gate (require_verify), then save the archetype to the visitor's Omazy CRM
// record (Core API) and email the result (Resend).
//
// Contract:
//   in  { flow, event:'start'|'message'|'verified', app_id, session_id,
//         customer_id, message:{text}, state, identity:{email,verified} }
//   out { blocks[], state, done, require_verify?:{email} }
import type { Env } from '../env';
import { QUESTIONS, ARCHETYPES, score, type Letter, type ArchetypeKey } from '../../../../src/data/assessment';

const TOUR_URL = 'https://calendly.com/cwkexperience/experience-tour';
const CORE_API_BASE = 'https://mw.omazy.ai/api/v1';
const LETTERS: Letter[] = ['A', 'B', 'C', 'D', 'E'];

interface FlowState {
  phase?: 'await_begin' | 'q' | 'optin' | 'done';
  i?: number;
  ans?: Letter[];
  archetype?: ArchetypeKey;
  gap?: boolean;
  choice?: 'email' | 'save';
}
interface FlowReq {
  event: 'start' | 'message' | 'verified';
  session_id?: string;
  customer_id?: string | null;
  message?: { text?: string } | null;
  state?: FlowState;
  identity?: { email?: string | null; verified?: boolean };
}

const card = (title: string, subtitle?: string, buttons?: any[]) => ({ type: 'card', title, ...(subtitle ? { subtitle } : {}), ...(buttons ? { buttons } : {}) });
const text = (markdown: string) => ({ type: 'text', markdown });
const buttons = (bs: any[]) => ({ type: 'buttons', buttons: bs });
const pb = (label: string, payload: string) => ({ kind: 'postback', label, payload });
const urlBtn = (label: string, url: string) => ({ kind: 'url', label, url, target: '_blank' });

function reply(blocks: any[], state: FlowState, done = false, require_verify?: { email: string }) {
  return { blocks, state, done, ...(require_verify ? { require_verify } : {}) };
}

// One read → a card (pillar eyebrow + prompt) + A–E option buttons.
function questionBlocks(i: number) {
  const q = QUESTIONS[i];
  return [
    card(`Read ${i + 1}/5 · ${q.pillarLabel}`, q.prompt),
    buttons(q.options.map((o) => pb(`${o.letter} · ${o.text}`, o.letter))),
  ];
}

function resultBlocks(archetype: ArchetypeKey, gap: boolean) {
  const a = ARCHETYPES[archetype];
  const body =
    `**${a.eyebrow}**\n\n${a.tagline}\n\n` +
    `**What's happening:** ${a.happening}\n\n` +
    `**⚡ What's costing you:** ${a.mindMine}\n\n` +
    `**🎯 Your one move this week:** ${a.oneMove}\n\n` +
    `**🌱 Ideal next environment:** ${a.environment}` +
    (gap ? `\n\n**⚠️ Mindset gap:** your behaviour signals the next stage but the revenue reality isn't there yet. That's a finding, not a penalty — the work now is closing the gap.` : '');
  return [
    card(`You are ${a.name}`, a.tagline),
    text(body),
    buttons([urlBtn('Book an Experience Tour →', TOUR_URL)]),
    buttons([pb('📧 Email + save my result', 'email'), pb('💾 Just save it', 'save'), pb('No thanks', 'skip')]),
  ];
}

async function verifyHmac(secret: string, raw: string, header: string | null): Promise<boolean> {
  if (!secret || !header) return false;
  const sig = header.startsWith('sha256=') ? header.slice(7) : header;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
  const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  // constant-time-ish compare
  if (hex.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

async function saveMemory(env: Env, customerId: string, archetype: ArchetypeKey, ans: Letter[]) {
  const token = (env as any).CORE_API_TOKEN as string | undefined;
  if (!token || !customerId) return;
  await fetch(`${CORE_API_BASE}/core/customers/${customerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ custom_fields: { player_archetype: archetype, player_xray_answers: ans.join(''), player_xray_at: new Date().toISOString() } }),
  }).catch(() => {});
}

async function emailResult(env: Env, to: string, archetype: ArchetypeKey) {
  if (!env.RESEND_API || !to) return;
  const a = ARCHETYPES[archetype];
  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
    <h2 style="color:#07090f">You are <span style="color:#fb3079">${a.name}</span></h2>
    <p style="color:#333"><em>${a.tagline}</em></p>
    <p><strong>What's happening:</strong> ${a.happening}</p>
    <p><strong>What's costing you:</strong> ${a.mindMine}</p>
    <p><strong>Your one move this week:</strong> ${a.oneMove}</p>
    <p><strong>Ideal next environment:</strong> ${a.environment}</p>
    <p style="margin-top:20px"><a href="${TOUR_URL}" style="background:#fb3079;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Book an Experience Tour →</a></p>
    <p style="color:#888;font-size:12px;margin-top:24px">CWK. Experience · Build. Learn. Earn. Play.</p></div>`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API}` },
    body: JSON.stringify({ from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`, to: [to], reply_to: env.REPLY_TO_EMAIL, subject: `Your CWK. Player X-Ray: you're ${a.name}`, html }),
  }).catch(() => {});
}

export async function handleXrayFlow(request: Request, env: Env): Promise<Response> {
  const raw = await request.text();
  const ok = await verifyHmac((env as any).XRAY_HMAC_SECRET, raw, request.headers.get('X-Omazy-Signature'));
  if (!ok) return new Response('bad signature', { status: 401 });

  let req: FlowReq;
  try { req = JSON.parse(raw); } catch { return new Response('bad json', { status: 400 }); }
  const st: FlowState = req.state || {};
  const msg = (req.message?.text || '').trim();
  const J = (o: unknown) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json' } });

  // START → intro.
  if (req.event === 'start') {
    return J(reply(
      [card('The Player X-Ray 🩺', "Five quick reads, under 2 minutes. No email needed to see your result. I'll tell you which player you are in the jungle."),
       buttons([pb('Begin ▶', 'begin'), pb('Not now', 'skip')])],
      { phase: 'await_begin' }));
  }

  // VERIFIED (post-OTP) → save + email + finish.
  if (req.event === 'verified') {
    const arch = st.archetype;
    if (arch) {
      if (req.customer_id) await saveMemory(env, req.customer_id, arch, st.ans || []);
      if (st.choice === 'email' && req.identity?.email) await emailResult(env, req.identity.email, arch);
    }
    return J(reply([card('Done, mi amor ✓', 'Saved. Whenever you\'re ready, the Experience Tour is your next door.', [urlBtn('Book the Experience Tour →', TOUR_URL)])], { phase: 'done' }, true));
  }

  // MESSAGE — drive the state machine.
  const lower = msg.toLowerCase();
  if (st.phase === 'await_begin') {
    if (lower === 'skip' || lower.includes('not now')) return J(reply([text("No rush 🌴 Whenever you want your read, just say \"player x-ray\".")], { phase: 'done' }, true));
    return J(reply(questionBlocks(0), { phase: 'q', i: 0, ans: [] }));
  }

  if (st.phase === 'q') {
    const letter = msg.toUpperCase() as Letter;
    if (!LETTERS.includes(letter)) {
      const i = st.i || 0;
      return J(reply([text('Just tap one of the options 👇'), ...questionBlocks(i)], st));
    }
    const ans = [...(st.ans || []), letter];
    const i = (st.i || 0) + 1;
    if (i < 5) return J(reply(questionBlocks(i), { phase: 'q', i, ans }));
    // scored
    const r = score(ans as [Letter, Letter, Letter, Letter, Letter]);
    return J(reply(resultBlocks(r.final, r.mindsetGap), { phase: 'optin', archetype: r.final, gap: r.mindsetGap, ans }));
  }

  if (st.phase === 'optin') {
    if (lower === 'skip' || lower.includes('no thanks')) return J(reply([text('Got it. Go make that one move this week 🎯')], { phase: 'done' }, true));
    const choice: 'email' | 'save' = lower === 'email' ? 'email' : 'save';
    // Hand off to Omazy's OTP gate; we finish on the 'verified' re-invoke.
    return J(reply([], { ...st, choice }, false, { email: req.identity?.email || '' }));
  }

  // Unknown state — restart cleanly.
  return J(reply([text("Let's start fresh — say \"player x-ray\" for your read 🌴")], { phase: 'done' }, true));
}
