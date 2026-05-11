// Lifestyle Calculator handler — accepts the full result snapshot from the
// /lifestyle-calculator page, sends a copy of the user's lifestyle map to
// their inbox, and fires a team-copy email so the team has the lead.
//
// Persists each submission into the CONTACTS KV under a `lifestyle:` key
// prefix so we don't need a new KV namespace.
//
// Mirrors the waitlist + contact handler pattern: fire-and-forget side
// effects via ctx.waitUntil so a delivery failure never blocks the response.

import type { Env } from '../env';
import { json } from '../lib/cors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const RETENTION_SECONDS = 365 * 24 * 60 * 60;

interface IncomingPayload {
  email?: unknown;
  state?: unknown;
  summary?: unknown;
}

interface CalculatorState {
  ideaCategory: string;
  ideaType: string;
  archetype: string;
  monthlyGoal: number;
  offerPrice: number;
  hoursWeek: number;
  timeMonths: number;
  speed: string;
  s2l: number;
  l2s: number;
  mines: string[];
}

interface ResultSummary {
  headline: string;
  targetLine: string;
  weeklyLine: string;
  archetype: string;
  archetypeFeeling: string;
  nextMove: string;
  speed: string;
  minesActive: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function escapeHtml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}

function safeNumber(v: unknown): number {
  return typeof v === 'number' && isFinite(v) ? v : 0;
}

function safeString(v: unknown, max = 200): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function validateState(input: unknown): CalculatorState | null {
  if (!input || typeof input !== 'object') return null;
  const s = input as Record<string, unknown>;
  return {
    ideaCategory: safeString(s.ideaCategory, 20),
    ideaType: safeString(s.ideaType, 40),
    archetype: safeString(s.archetype, 20),
    monthlyGoal: safeNumber(s.monthlyGoal),
    offerPrice: safeNumber(s.offerPrice),
    hoursWeek: safeNumber(s.hoursWeek),
    timeMonths: safeNumber(s.timeMonths),
    speed: safeString(s.speed, 20),
    s2l: safeNumber(s.s2l),
    l2s: safeNumber(s.l2s),
    mines: Array.isArray(s.mines)
      ? s.mines.filter((x): x is string => typeof x === 'string').slice(0, 10)
      : [],
  };
}

function validateSummary(input: unknown): ResultSummary | null {
  if (!input || typeof input !== 'object') return null;
  const s = input as Record<string, unknown>;
  return {
    headline: safeString(s.headline, 240),
    targetLine: safeString(s.targetLine, 240),
    weeklyLine: safeString(s.weeklyLine, 240),
    archetype: safeString(s.archetype, 80),
    archetypeFeeling: safeString(s.archetypeFeeling, 600),
    nextMove: safeString(s.nextMove, 400),
    speed: safeString(s.speed, 80),
    minesActive: safeNumber(s.minesActive),
  };
}

// ── Email body (user copy) ────────────────────────────────────────────────
function buildUserEmail(summary: ResultSummary): string {
  const safeSummary = {
    headline: escapeHtml(summary.headline),
    targetLine: escapeHtml(summary.targetLine),
    weeklyLine: escapeHtml(summary.weeklyLine),
    archetype: escapeHtml(summary.archetype),
    archetypeFeeling: escapeHtml(summary.archetypeFeeling),
    nextMove: escapeHtml(summary.nextMove),
    speed: escapeHtml(summary.speed),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>Your Lifestyle Map | CWK. Experience</title>
</head>
<body style="margin:0;padding:0;background-color:#07090F;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#07090F;padding:40px 16px 64px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

      <!-- Logo -->
      <tr><td style="padding-bottom:28px;">
        <span style="font-size:20px;font-weight:800;color:#EEF0FF;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">CWK.</span>
        <span style="font-size:10px;font-weight:700;color:#00E5FF;letter-spacing:2.5px;text-transform:uppercase;margin-left:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Lifestyle Calculator</span>
      </td></tr>

      <!-- Card -->
      <tr><td style="background:#0B0E18;border:1px solid rgba(0,229,255,0.18);border-radius:14px;padding:36px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="height:3px;background:linear-gradient(90deg,#00E5FF,#7B61FF);border-radius:2px;">&nbsp;</td></tr></table>
        <div style="height:24px;line-height:24px;">&nbsp;</div>

        <p style="margin:0 0 12px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#FB3079;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">YOUR LIFESTYLE MAP</p>
        <h1 style="margin:0 0 18px;font-size:28px;font-weight:800;color:#EEF0FF;line-height:1.2;letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${safeSummary.headline}</h1>

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:8px 0 22px;">
          <tr>
            <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.07);font-size:13px;color:#A8A29E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;">
              <strong style="color:#00E5FF;font-weight:700;">Target:</strong> ${safeSummary.targetLine}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.07);font-size:13px;color:#A8A29E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;">
              <strong style="color:#00E5FF;font-weight:700;">Per week:</strong> ${safeSummary.weeklyLine}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.07);font-size:13px;color:#A8A29E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;">
              <strong style="color:#00E5FF;font-weight:700;">Pace:</strong> ${safeSummary.speed}
            </td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.07);border-bottom:1px solid rgba(255,255,255,0.07);font-size:13px;color:#A8A29E;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;line-height:1.6;">
              <strong style="color:#00E5FF;font-weight:700;">Stage:</strong> ${safeSummary.archetype}
            </td>
          </tr>
        </table>

        ${
          safeSummary.archetypeFeeling
            ? `<p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#FB3079;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">WHERE YOU ARE NOW</p>
               <p style="margin:0 0 22px;font-size:14px;color:#A8A29E;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${safeSummary.archetypeFeeling}</p>`
            : ''
        }

        ${
          safeSummary.nextMove
            ? `<div style="background:linear-gradient(135deg,rgba(0,229,255,0.08),rgba(123,97,255,0.04));border:1px solid rgba(0,229,255,0.22);border-radius:10px;padding:16px 18px;margin:0 0 22px;">
                 <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#00E5FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">YOUR ONE MOVE THIS WEEK</p>
                 <p style="margin:0;font-size:14px;color:#EEF0FF;line-height:1.6;font-weight:500;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">${safeSummary.nextMove}</p>
               </div>`
            : ''
        }

        ${
          summary.minesActive > 0
            ? `<p style="margin:0 0 22px;font-size:12px;color:#FF8888;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:rgba(255,68,68,0.04);border:1px solid rgba(255,68,68,0.2);border-left:3px solid #FF4444;border-radius:8px;padding:12px 14px;">${summary.minesActive} active mind ${summary.minesActive === 1 ? 'mine' : 'mines'} flagged. Address the inner work before scaling acquisition.</p>`
            : ''
        }

        <p style="margin:0 0 18px;font-size:13px;color:#A8A29E;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Ready to see the operating system behind these numbers? Take a free tour of CWK. HQ and meet the team that helps people execute on maps like this.</p>

        <a href="https://calendly.com/cwkexperience/experience-tour" style="display:inline-block;background:linear-gradient(90deg,#00E5FF,#7B61FF);color:#07090F;font-size:14px;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:8px;letter-spacing:0.2px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Tour CWK. HQ (Online) &rarr;</a>

      </td></tr>

      <!-- Footer -->
      <tr><td style="padding-top:28px;">
        <p style="margin:0 0 6px;font-size:12px;color:#44403C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">Build. Learn. Earn. Play.</p>
        <p style="margin:0 0 8px;font-size:12px;color:#44403C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">&copy; 2026 CWK. LLC. &nbsp;&middot;&nbsp; <a href="https://cwkexperience.com" style="color:#00E5FF;text-decoration:none;">cwkexperience.com</a> &nbsp;&middot;&nbsp; <a href="https://cwkexperience.com/privacy" style="color:#57534E;text-decoration:none;">Privacy</a></p>
        <p style="margin:0;font-size:11px;color:#292524;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">You received this because you used the Lifestyle Calculator at cwkexperience.com.</p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildUserText(summary: ResultSummary): string {
  return [
    'CWK. Experience | Your Lifestyle Map',
    '====================================',
    '',
    summary.headline,
    '',
    `Target:    ${summary.targetLine}`,
    `Per week:  ${summary.weeklyLine}`,
    `Pace:      ${summary.speed}`,
    `Stage:     ${summary.archetype}`,
    '',
    summary.archetypeFeeling ? `Where you are now: ${summary.archetypeFeeling}` : '',
    '',
    summary.nextMove ? `Your one move this week: ${summary.nextMove}` : '',
    '',
    summary.minesActive > 0
      ? `${summary.minesActive} active mind ${summary.minesActive === 1 ? 'mine' : 'mines'} flagged. Address the inner work first.`
      : '',
    '',
    'Tour CWK. HQ (Online): https://calendly.com/cwkexperience/experience-tour',
    '',
    '----',
    'Build. Learn. Earn. Play.',
    '(c) 2026 CWK. LLC',
  ].filter(Boolean).join('\n');
}

async function sendUserEmail(env: Env, recipient: string, summary: ResultSummary): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API}`,
    },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: [recipient],
      reply_to: `${env.REPLY_TO_NAME} <${env.REPLY_TO_EMAIL}>`,
      subject: 'Your Lifestyle Map | CWK.',
      html: buildUserEmail(summary),
      text: buildUserText(summary),
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@cwkexperience.com?subject=unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

// ── Team copy ─────────────────────────────────────────────────────────────
function buildTeamEmail(email: string, summary: ResultSummary, state: CalculatorState, env: string): { html: string; text: string } {
  const e = escapeHtml(email);
  const rows: Array<[string, string]> = [
    ['Email', email],
    ['Headline', summary.headline],
    ['Target', summary.targetLine],
    ['Per week', summary.weeklyLine],
    ['Pace', summary.speed],
    ['Stage', summary.archetype],
    ['Category', `${state.ideaCategory} / ${state.ideaType}`],
    ['Hours/week', String(state.hoursWeek)],
    ['Mines active', String(summary.minesActive)],
    ['Env', env],
  ];

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>New lifestyle calculator submission</title></head>
<body style="margin:0;padding:24px;background:#07090F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#EEF0FF;">
  <div style="max-width:560px;margin:0 auto;background:#0B0E18;border:1px solid rgba(0,229,255,0.18);border-radius:12px;padding:28px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#00E5FF;">New lifestyle calculator submission</p>
    <h1 style="margin:0 0 18px;font-size:20px;font-weight:800;letter-spacing:-0.4px;">${e}</h1>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      ${rows.map(([k, v]) => `<tr><td style="padding:6px 0;font-size:12px;color:#A8A29E;width:120px;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:6px 0;font-size:13px;color:#EEF0FF;">${escapeHtml(v)}</td></tr>`).join('')}
    </table>
  </div>
</body></html>`;

  const text = [
    'New lifestyle calculator submission',
    '====================================',
    ...rows.map(([k, v]) => `${k}: ${v}`),
  ].join('\n');

  return { html, text };
}

async function sendTeamEmail(env: Env, recipientEmail: string, summary: ResultSummary, state: CalculatorState): Promise<void> {
  const inbox = env.WAITLIST_INBOX_TO ?? env.CONTACT_INBOX_TO;
  if (!inbox) return;
  const { html, text } = buildTeamEmail(recipientEmail, summary, state, env.ENVIRONMENT);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API}`,
    },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: [inbox],
      reply_to: recipientEmail,
      subject: `[CWK Calculator] ${recipientEmail}`,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

// ── Slack ─────────────────────────────────────────────────────────────────
async function sendSlackNotification(env: Env, email: string, summary: ResultSummary, state: CalculatorState): Promise<void> {
  if (!env.SLACK_WEBHOOK_URL) return;
  const payload = {
    text: `New Lifestyle Calculator submission: ${email}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'Lifestyle Calculator submission', emoji: true } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Email*\n${email}` },
          { type: 'mrkdwn', text: `*Stage*\n${summary.archetype || 'N/A'}` },
          { type: 'mrkdwn', text: `*Target*\n${summary.targetLine}` },
          { type: 'mrkdwn', text: `*Pace*\n${summary.speed || 'N/A'}` },
          { type: 'mrkdwn', text: `*Category*\n${state.ideaCategory} / ${state.ideaType}` },
          { type: 'mrkdwn', text: `*Mines active*\n${summary.minesActive}` },
        ],
      },
    ],
  };
  const res = await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Slack webhook error ${res.status}: ${err}`);
  }
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function handleLifestyleCalculatorPost(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  if (!env.CONTACTS) return json({ error: 'server_error' }, 500, env);

  let body: IncomingPayload;
  try {
    body = (await request.json()) as IncomingPayload;
  } catch {
    return json({ error: 'invalid_request' }, 400, env);
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
    return json({ error: 'invalid_email' }, 422, env);
  }

  const state = validateState(body.state);
  const summary = validateSummary(body.summary);
  if (!state || !summary) {
    return json({ error: 'invalid_payload' }, 422, env);
  }

  const id = crypto.randomUUID();
  const submission = {
    id,
    createdAt: new Date().toISOString(),
    email: rawEmail,
    state,
    summary,
  };

  try {
    await env.CONTACTS.put(`lifestyle:${id}`, JSON.stringify(submission), {
      expirationTtl: RETENTION_SECONDS,
    });
  } catch {
    // KV write failure is recoverable: still send the user their map.
  }

  if (env.RESEND_API) {
    ctx.waitUntil(sendUserEmail(env, rawEmail, summary).catch((e) => {
      console.error('[lifestyleCalculator] sendUserEmail failed:', e instanceof Error ? e.message : e);
    }));
    ctx.waitUntil(sendTeamEmail(env, rawEmail, summary, state).catch((e) => {
      console.error('[lifestyleCalculator] sendTeamEmail failed:', e instanceof Error ? e.message : e);
    }));
  } else {
    console.warn('[lifestyleCalculator] RESEND_API not set — skipping email sends. Set the secret with: wrangler secret put RESEND_API --env production');
  }
  if (env.SLACK_WEBHOOK_URL) {
    ctx.waitUntil(sendSlackNotification(env, rawEmail, summary, state).catch((e) => {
      console.error('[lifestyleCalculator] sendSlackNotification failed:', e instanceof Error ? e.message : e);
    }));
  }

  return json({ success: true }, 200, env);
}
