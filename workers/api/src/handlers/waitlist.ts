// Waitlist handler — PLOS signup capture. Persists to the WAITLIST KV and,
// on success, fires three fire-and-forget side effects:
//   1. Resend confirmation email to the user.
//   2. Slack webhook post to #plos-admin (if SLACK_WEBHOOK_URL set).
//   3. Resend team-copy email to WAITLIST_INBOX_TO (if both set).
//
// All three run inside ctx.waitUntil() so a delivery failure never blocks
// the 200 response back to the form.

import type { Env } from '../env';
import { json } from '../lib/cors';

interface WaitlistEntry {
  joinedAt: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

// ─── Email Template ───────────────────────────────────────────────────────────

function buildConfirmationEmail(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>You're on the list. | CWK. Experience</title>
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"
       style="background-color:#0A0A0A;padding:48px 20px 64px;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation"
             style="max-width:560px;width:100%;">

        <!-- Logo row -->
        <tr>
          <td style="padding-bottom:36px;">
            <span style="font-size:20px;font-weight:800;color:#FAFAF9;
                         letter-spacing:-0.5px;font-family:-apple-system,BlinkMacSystemFont,
                         'Segoe UI',Helvetica,Arial,sans-serif;">CWK.</span>
            <span style="font-size:10px;font-weight:700;color:#38B2F6;letter-spacing:2.5px;
                         text-transform:uppercase;margin-left:10px;
                         font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                         Helvetica,Arial,sans-serif;">Experience</span>
          </td>
        </tr>

        <!-- Main card -->
        <tr>
          <td style="background:#111111;border:1px solid rgba(56,178,246,0.18);
                     border-radius:12px;padding:48px 40px 44px;">

            <!-- Gradient accent bar -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="height:3px;background:linear-gradient(90deg,#38B2F6,#B721FF);
                           border-radius:2px;">&nbsp;</td>
              </tr>
            </table>

            <div style="height:28px;line-height:28px;">&nbsp;</div>

            <!-- Eyebrow -->
            <p style="margin:0 0 14px;font-size:10px;font-weight:700;letter-spacing:3px;
                      text-transform:uppercase;color:#38B2F6;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                      Helvetica,Arial,sans-serif;">
              PLOS · Personal Leverage OS
            </p>

            <!-- Headline -->
            <h1 style="margin:0 0 20px;font-size:34px;font-weight:800;color:#FAFAF9;
                       line-height:1.15;letter-spacing:-0.8px;
                       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                       Helvetica,Arial,sans-serif;">
              You're on the list.
            </h1>

            <!-- Body copy -->
            <p style="margin:0 0 14px;font-size:16px;color:#A8A29E;line-height:1.7;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                      Helvetica,Arial,sans-serif;">
              We've locked in your spot. When PLOS opens, you'll be among the first to get access. No scrambling, no waiting in line.
            </p>
            <p style="margin:0 0 36px;font-size:16px;color:#A8A29E;line-height:1.7;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                      Helvetica,Arial,sans-serif;">
              In the meantime, take a look at the work. See what's possible when infrastructure stops leaking and your business actually scales.
            </p>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="border-top:1px solid rgba(255,255,255,0.07);padding-bottom:32px;"></td>
              </tr>
            </table>

            <!-- Four Pillars row -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                   style="margin-bottom:36px;">
              <tr>
                <td width="25%" style="text-align:center;padding:0 6px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;
                            text-transform:uppercase;color:#38B2F6;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                            Helvetica,Arial,sans-serif;">Mind</p>
                  <p style="margin:0;font-size:11px;color:#57534E;line-height:1.5;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                            Helvetica,Arial,sans-serif;">Strategy &amp; clarity</p>
                </td>
                <td width="25%" style="text-align:center;padding:0 6px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;
                            text-transform:uppercase;color:#B721FF;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                            Helvetica,Arial,sans-serif;">Body</p>
                  <p style="margin:0;font-size:11px;color:#57534E;line-height:1.5;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                            Helvetica,Arial,sans-serif;">Systems &amp; ops</p>
                </td>
                <td width="25%" style="text-align:center;padding:0 6px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;
                            text-transform:uppercase;color:#FF4EF0;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                            Helvetica,Arial,sans-serif;">Soul</p>
                  <p style="margin:0;font-size:11px;color:#57534E;line-height:1.5;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                            Helvetica,Arial,sans-serif;">Legacy &amp; IP</p>
                </td>
                <td width="25%" style="text-align:center;padding:0 6px;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;
                            text-transform:uppercase;color:#38B2F6;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                            Helvetica,Arial,sans-serif;">Pocket</p>
                  <p style="margin:0;font-size:11px;color:#57534E;line-height:1.5;
                            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                            Helvetica,Arial,sans-serif;">Revenue &amp; deals</p>
                </td>
              </tr>
            </table>

            <!-- CTA button -->
            <a href="https://cwkexperience.com/work"
               style="display:inline-block;background:#38B2F6;color:#0A0A0A;
                      font-size:14px;font-weight:700;text-decoration:none;
                      padding:14px 28px;border-radius:8px;letter-spacing:0.2px;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                      Helvetica,Arial,sans-serif;">
              See The Work &rarr;
            </a>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top:32px;">
            <p style="margin:0 0 6px;font-size:12px;color:#44403C;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                      Helvetica,Arial,sans-serif;">
              Build. Learn. Earn. Play.
            </p>
            <p style="margin:0 0 10px;font-size:12px;color:#44403C;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                      Helvetica,Arial,sans-serif;">
              &copy; 2026 CWK. LLC. All rights reserved.
              &nbsp;&middot;&nbsp;
              <a href="https://cwkexperience.com"
                 style="color:#38B2F6;text-decoration:none;">cwkexperience.com</a>
              &nbsp;&middot;&nbsp;
              <a href="https://cwkexperience.com/privacy"
                 style="color:#57534E;text-decoration:none;">Privacy</a>
            </p>
            <p style="margin:0 0 4px;font-size:11px;color:#292524;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                      Helvetica,Arial,sans-serif;">
              You received this email because you joined the PLOS waitlist at
              <a href="https://cwkexperience.com" style="color:#292524;text-decoration:underline;">cwkexperience.com</a>.
            </p>
            <p style="margin:0;font-size:11px;color:#292524;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',
                      Helvetica,Arial,sans-serif;">
              CWK. LLC &middot; 447 Broadway, 2nd FL #2056 &middot; New York, NY 10013
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// ─── Email Delivery (Resend) ──────────────────────────────────────────────────

async function sendConfirmation(env: Env, recipientEmail: string): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API}`,
    },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: [recipientEmail],
      reply_to: `${env.REPLY_TO_NAME} <${env.REPLY_TO_EMAIL}>`,
      subject: "You're on the PLOS waitlist | CWK. Experience",
      html: buildConfirmationEmail(),
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@cwkexperience.com?subject=unsubscribe>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      text: [
        'CWK. Experience | PLOS Waitlist Confirmation',
        '============================================',
        '',
        "You're on the list.",
        '',
        "We've reserved your spot. When PLOS opens, you'll be among the first to get access. No scrambling, no waiting in line.",
        '',
        "In the meantime, take a look at the work. See what's possible when infrastructure stops leaking and your business actually scales.",
        '',
        'See the work: https://cwkexperience.com/work',
        '',
        '----',
        'PLOS · Personal Leverage OS',
        'Mind · Body · Soul · Pocket',
        '',
        'Build. Learn. Earn. Play.',
        '© 2026 CWK. LLC',
        'cwkexperience.com',
        '',
        'You received this email because you joined the PLOS waitlist at cwkexperience.com.',
        'To unsubscribe, reply with "unsubscribe" in the subject line.',
        '',
        'CWK. LLC · 447 Broadway, 2nd FL #2056 · New York, NY 10013',
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`Resend error ${response.status}: ${err}`);
  }
}

// ─── Slack notification ───────────────────────────────────────────────────────

async function sendSlackNotification(env: Env, email: string): Promise<void> {
  if (!env.SLACK_WEBHOOK_URL) return;

  const payload = {
    text: `New PLOS waitlist signup: ${email}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: 'New PLOS waitlist signup', emoji: true },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Email*\n${email}` },
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

// ─── Team-copy email (Resend) ─────────────────────────────────────────────────

function buildTeamNotificationEmail(email: string, joinedAt: string, environment: string): {
  html: string;
  text: string;
} {
  const safeEmail = email.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string));
  const safeJoined = joinedAt.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c] as string));

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>New PLOS waitlist signup</title></head>
<body style="margin:0;padding:24px;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#EEF0FF;">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid rgba(56,178,246,0.18);border-radius:12px;padding:32px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#38B2F6;">New PLOS waitlist signup</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${safeEmail}</h1>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;font-size:12px;color:#A8A29E;width:110px;">Email</td><td style="padding:6px 0;font-size:13px;color:#EEF0FF;">${safeEmail}</td></tr>
      <tr><td style="padding:6px 0;font-size:12px;color:#A8A29E;">Joined</td><td style="padding:6px 0;font-size:13px;color:#EEF0FF;">${safeJoined}</td></tr>
      <tr><td style="padding:6px 0;font-size:12px;color:#A8A29E;">Source</td><td style="padding:6px 0;font-size:13px;color:#EEF0FF;">cwkexperience.com</td></tr>
      <tr><td style="padding:6px 0;font-size:12px;color:#A8A29E;">Env</td><td style="padding:6px 0;font-size:13px;color:#EEF0FF;">${environment}</td></tr>
    </table>
  </div>
</body></html>`;

  const text = [
    'New PLOS waitlist signup',
    '========================',
    `Email:  ${email}`,
    `Joined: ${joinedAt}`,
    'Source: cwkexperience.com',
    `Env:    ${environment}`,
  ].join('\n');

  return { html, text };
}

async function sendTeamNotification(env: Env, email: string, joinedAt: string): Promise<void> {
  if (!env.RESEND_API || !env.WAITLIST_INBOX_TO) return;
  const { html, text } = buildTeamNotificationEmail(email, joinedAt, env.ENVIRONMENT);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API}`,
    },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: [env.WAITLIST_INBOX_TO],
      reply_to: email,
      subject: `[CWK Waitlist] new signup: ${email}`,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function handleWaitlistPost(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.WAITLIST) return json({ error: 'server_error' }, 500, env);

  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_request' }, 400, env);
  }

  const rawEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) return json({ error: 'invalid_email' }, 422, env);

  try {
    const existing = await env.WAITLIST.get(rawEmail);
    if (existing !== null) return json({ error: 'already_on_list' }, 409, env);

    const entry: WaitlistEntry = { joinedAt: new Date().toISOString() };
    await env.WAITLIST.put(rawEmail, JSON.stringify(entry));

    // Fire-and-forget side effects — don't block the response on delivery.
    // Each call swallows its own failure so one outage doesn't kill the rest.
    if (env.RESEND_API) {
      ctx.waitUntil(sendConfirmation(env, rawEmail).catch(() => {}));
      ctx.waitUntil(sendTeamNotification(env, rawEmail, entry.joinedAt).catch(() => {}));
    }
    if (env.SLACK_WEBHOOK_URL) {
      ctx.waitUntil(sendSlackNotification(env, rawEmail).catch(() => {}));
    }

    return json({ success: true }, 200, env);
  } catch {
    return json({ error: 'server_error' }, 500, env);
  }
}

