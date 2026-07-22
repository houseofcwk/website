// xrayFlow — the CWK "Player X-Ray" as an Omazy micro-app conversational flow.
//
// Implements the Omazy plugin-flow turn contract (RFC micro-app M4): the Omazy
// dispatcher POSTs each widget turn here (HMAC-signed); we drive the guided,
// button-based journey, score it, and return rfc2207 blocks. On opt-in we let
// Omazy run the OTP gate (require_verify), then save the archetype to the
// visitor's Omazy CRM record (Core API) and email the result (Resend).
//
// The turn contract lives here; every question, archetype, scoring rule and line
// of copy comes from the agentFlow document in the Sanity Studio (see
// lib/agentConfig.ts). This file no longer holds editable content — if you are
// changing wording, change it in the Studio.
import type { Env } from '../env';
import { getAgentConfig, getFlow, archetypeScope } from '../lib/agentConfig';
import { scoreFlow } from '../lib/agentScoring';
import { render, renderBlock } from '../lib/template';
import type { RtArchetype, RtFlow } from '../lib/agentTypes';
import {
  readSigned, json, flowReply, CoreClient,
  card, text, buttons, pb, urlBtn,
  type Block, type FlowRequest, type Identity,
} from '../omazy-sdk';

/** Endpoint default — used when the dispatcher does not name a flow. */
const DEFAULT_FLOW_KEY = 'cwk.player_xray';

interface FlowState {
  flow?: string;
  phase?: 'await_begin' | 'q' | 'optin' | 'done';
  i?: number;
  /** Answer letter keyed by step id. */
  ans?: Record<string, string>;
  archetype?: string;
  raw?: string;
  gap?: boolean;
  choice?: 'email' | 'save';
}

// One step → a card (pillar eyebrow + prompt) + one button per option.
function stepBlocks(flow: RtFlow, i: number): Block[] {
  const step = flow.steps[i];
  return [
    card(`Read ${i + 1}/${flow.steps.length} · ${step.pillarLabel}`, step.prompt),
    buttons(step.options.map((o) => pb(`${o.letter} · ${o.text}`, o.letter))),
  ];
}

function resultBlocks(flow: RtFlow, final: RtArchetype, raw: RtArchetype, gap: boolean): Block[] {
  const scope = archetypeScope(final, raw);
  const body = renderBlock(flow.resultTemplate, scope);
  const gapNote = gap ? renderBlock(flow.scoring.gapNote, scope) : '';

  return [
    card(render(flow.resultTitleTemplate, scope), final.tagline),
    text(gapNote ? `${body}\n\n${gapNote}` : body),
    ...(flow.cta ? [buttons([urlBtn(flow.cta.label, flow.cta.href)])] : []),
    buttons([
      pb(flow.optIn.emailLabel, 'email'),
      pb(flow.optIn.saveLabel, 'save'),
      pb(flow.optIn.skipLabel, 'skip'),
    ]),
  ];
}

async function saveMemory(
  env: Env, flow: RtFlow, customerId: string, archetype: string, ans: Record<string, string>,
) {
  // Serialise answers in step order so the stored string stays comparable
  // across sessions even if the Studio reorders steps later.
  const ordered = flow.steps.map((s) => ans[s.id] ?? '-').join('');
  await new CoreClient((env as any).CORE_API_TOKEN).patchCustomer(customerId, {
    [flow.memoryKey]: archetype,
    player_xray_answers: ordered,
    player_xray_at: new Date().toISOString(),
  });
}

/** Minimal markdown → HTML for the result email: paragraphs and **bold** only. */
function mdToHtml(md: string): string {
  return md
    .split(/\n{2,}/)
    .map((para) => {
      const html = para
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
      return `<p style="color:#333;line-height:1.55">${html}</p>`;
    })
    .join('');
}

async function emailResult(env: Env, flow: RtFlow, to: string, final: RtArchetype) {
  if (!env.RESEND_API || !to || !flow.email.enabled) return;
  const scope = archetypeScope(final);
  const cta = flow.cta
    ? `<p style="margin-top:20px"><a href="${flow.cta.href}" style="background:#fb3079;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">${flow.cta.label}</a></p>`
    : '';
  const html = `<div style="font-family:system-ui,sans-serif;max-width:560px">
    <h2 style="color:#07090f">You are <span style="color:#fb3079">${final.name}</span></h2>
    <p style="color:#333"><em>${final.tagline}</em></p>
    ${mdToHtml(renderBlock(flow.email.bodyTemplate, scope))}
    ${cta}
    <p style="color:#888;font-size:12px;margin-top:24px">CWK. Experience · Build. Learn. Earn. Play.</p></div>`;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.RESEND_API}` },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: [to],
      reply_to: env.REPLY_TO_EMAIL,
      subject: render(flow.email.subjectTemplate, scope),
      html,
    }),
  }).catch(() => {});
}

export async function handleXrayFlow(request: Request, env: Env): Promise<Response> {
  const s = await readSigned<FlowRequest<FlowState>>(request, (env as any).XRAY_HMAC_SECRET);
  if (!s.ok) return new Response('unauthorized', { status: s.status });
  const req = s.body;
  const st: FlowState = req.state || {};

  const cfg = await getAgentConfig(env);
  const flow = getFlow(cfg, req.flow || st.flow || DEFAULT_FLOW_KEY);
  if (!flow) {
    // Disabled or unknown flow — end the turn cleanly rather than 500ing into
    // the widget. The dispatcher reads `done` as "hand back to the model".
    return json(flowReply<FlowState>([], { phase: 'done' }, true));
  }

  const msg = (req.message?.text || '').trim();
  const reply = (blocks: Block[], state: FlowState, done = false, require_verify?: { email: string }) =>
    json(flowReply(blocks, { ...state, flow: flow.key }, done, require_verify));
  const findArchetype = (key?: string) => flow.archetypes.find((a) => a.key === key) ?? null;

  // START → intro.
  if (req.event === 'start') {
    return reply(
      [card(flow.intro.title, flow.intro.body),
       buttons([pb(flow.intro.beginLabel, 'begin'), pb(flow.intro.skipLabel, 'skip')])],
      { phase: 'await_begin' });
  }

  // VERIFIED (post-OTP) → save + email + finish.
  if (req.event === 'verified') {
    const final = findArchetype(st.archetype);
    if (final) {
      if (req.customer_id) await saveMemory(env, flow, req.customer_id, final.key, st.ans || {});
      if (st.choice === 'email' && req.identity?.email) await emailResult(env, flow, req.identity.email, final);
    }
    const done = flow.cta
      ? card(flow.optIn.doneTitle, flow.optIn.doneBody, [urlBtn(flow.cta.label, flow.cta.href)])
      : card(flow.optIn.doneTitle, flow.optIn.doneBody);
    return reply([done], { phase: 'done' }, true);
  }

  // MESSAGE — drive the state machine.
  const lower = msg.toLowerCase();

  if (st.phase === 'await_begin') {
    if (lower === 'skip' || lower === flow.intro.skipLabel.toLowerCase()) {
      return reply([text(flow.messages.declined)], { phase: 'done' }, true);
    }
    return reply(stepBlocks(flow, 0), { phase: 'q', i: 0, ans: {} });
  }

  if (st.phase === 'q') {
    const i = st.i ?? 0;
    const step = flow.steps[i];
    // The step list can change under an in-flight session when the Studio is
    // republished mid-conversation. Bail out rather than mis-indexing.
    if (!step) return reply([text(flow.messages.restart)], { phase: 'done' }, true);

    const letter = msg.toUpperCase();
    if (!step.options.some((o) => o.letter === letter)) {
      return reply([text(flow.messages.invalidPick), ...stepBlocks(flow, i)], st);
    }

    const ans = { ...(st.ans || {}), [step.id]: letter };
    const next = i + 1;
    if (next < flow.steps.length) return reply(stepBlocks(flow, next), { phase: 'q', i: next, ans });

    const outcome = scoreFlow(flow, ans);
    if (!outcome) return reply([text(flow.messages.restart)], { phase: 'done' }, true);
    return reply(
      resultBlocks(flow, outcome.final, outcome.raw, outcome.gap),
      { phase: 'optin', archetype: outcome.final.key, raw: outcome.raw.key, gap: outcome.gap, ans },
    );
  }

  if (st.phase === 'optin') {
    if (lower === 'skip' || lower === flow.optIn.skipLabel.toLowerCase()) {
      return reply([text(flow.messages.optOut)], { phase: 'done' }, true);
    }
    const choice: 'email' | 'save' = lower === 'email' ? 'email' : 'save';
    // Hand off to Omazy's OTP gate; we finish on the 'verified' re-invoke.
    const identity: Identity = req.identity || {};
    return reply([], { ...st, choice }, false, { email: identity.email || '' });
  }

  // Unknown state — restart cleanly.
  return reply([text(flow.messages.restart)], { phase: 'done' }, true);
}
