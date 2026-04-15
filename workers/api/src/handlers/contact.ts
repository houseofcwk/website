// Contact handler — submission capture, layered spam defenses, KV rate
// limits, persistence, team notification email.
//
// Migrated from workers/contact/src/index.ts into the consolidated cwk-api
// worker. Behaviour byte-identical.
//
// Spam / abuse defenses (layered):
//   1. Honeypot field (silent 200)
//   2. Time-to-submit floor (reject <2s after page load)
//   3. Cloudflare Turnstile (server-side verify, if TURNSTILE_SECRET set)
//   4. Content heuristics (URL count, repeated runs)
//   5. Disposable email blocklist
//   6. KV rate limits — IP: 5/10min & 20/day; email: 3/day

import type { Env } from '../env';
import { json } from '../lib/cors';
import { sha256Hex } from '../lib/sha256';

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  role?: unknown;
  topic?: unknown;
  message?: unknown;
  consent?: unknown;
  website_url?: unknown;   // honeypot
  loadedAt?: unknown;      // client timestamp (ms)
  turnstileToken?: unknown;
}

interface StoredSubmission {
  id: string;
  createdAt: string;
  ipHash: string;
  userAgent: string;
  name: string;
  email: string;
  company: string;
  role: string;
  topic: string;
  message: string;
  status: 'new' | 'replied' | 'spam';
  spamSignal?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const ALLOWED_TOPICS = new Set(['general', 'partnership', 'press', 'support', 'other']);

const MIN_TIME_TO_SUBMIT_MS = 2_000;
const RETENTION_SECONDS = 180 * 24 * 60 * 60;            // 180 days
const RATE_LIMIT_WINDOW_10M = 10 * 60;
const RATE_LIMIT_WINDOW_24H = 24 * 60 * 60;
const RATE_LIMIT_IP_10M = 5;
const RATE_LIMIT_IP_24H = 20;
const RATE_LIMIT_EMAIL_24H = 3;
const MAX_URLS_IN_MESSAGE = 3;

// Small, non-exhaustive blocklist — configurable. Extend as needed.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'tempmail.com',
  'yopmail.com',
  '10minutemail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'fakeinbox.com',
  'throwawaymail.com',
  'maildrop.cc',
]);

const SPAM_SUBSTRINGS = [
  'viagra',
  'cialis',
  'casino',
  'crypto airdrop',
  'seo services',
  'buy followers',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') ?? '0.0.0.0';
}

// ─── Validation ───────────────────────────────────────────────────────────────

type FieldErrors = Partial<Record<'name' | 'email' | 'company' | 'role' | 'topic' | 'message' | 'consent', string>>;

interface Validated {
  name: string;
  email: string;
  company: string;
  role: string;
  topic: string;
  message: string;
}

function validate(body: ContactPayload): { ok: true; data: Validated } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  const name = str(body.name, 80);
  if (name.length < 2) errors.name = 'Please enter your name.';

  const email = str(body.email, 180).toLowerCase();
  if (!EMAIL_REGEX.test(email)) errors.email = 'Please enter a valid email address.';

  const company = str(body.company, 120);
  const role = str(body.role, 80);

  const topic = str(body.topic, 40).toLowerCase();
  if (!ALLOWED_TOPICS.has(topic)) errors.topic = 'Please choose a topic.';

  const message = str(body.message, 2000);
  if (message.length < 20) errors.message = 'Please share a bit more detail (20+ characters).';

  if (body.consent !== true && body.consent !== 'on' && body.consent !== 'true') {
    errors.consent = 'Please agree to the Privacy Policy.';
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, data: { name, email, company, role, topic, message } };
}

// ─── Spam heuristics ──────────────────────────────────────────────────────────

function contentHeuristicSpam(message: string): string | null {
  const urls = message.match(/https?:\/\/|www\./gi) ?? [];
  if (urls.length > MAX_URLS_IN_MESSAGE) return 'too_many_links';

  if (/(.)\1{15,}/.test(message)) return 'repeated_chars';

  const lower = message.toLowerCase();
  for (const s of SPAM_SUBSTRINGS) {
    if (lower.includes(s)) return 'spam_substring';
  }
  return null;
}

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1] ?? '';
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  try {
    const form = new FormData();
    form.append('secret', secret);
    form.append('response', token);
    form.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

// ─── Rate limiting (KV counters) ──────────────────────────────────────────────

interface RateLimitCheck {
  allowed: boolean;
  retryAfter?: number;
}

async function bumpCounter(
  env: Env,
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitCheck> {
  const raw = await env.RATE_LIMIT.get(key);
  const count = raw ? parseInt(raw, 10) || 0 : 0;
  if (count >= limit) {
    return { allowed: false, retryAfter: windowSec };
  }
  // TTL only matters when we first create the key; KV doesn't refresh on update.
  await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: windowSec });
  return { allowed: true };
}

async function checkRateLimits(env: Env, ipHash: string, email: string): Promise<RateLimitCheck> {
  const emailHash = await sha256Hex(`email:${email}`);

  const ip10 = await bumpCounter(env, `rl:ip10:${ipHash}`, RATE_LIMIT_IP_10M, RATE_LIMIT_WINDOW_10M);
  if (!ip10.allowed) return ip10;

  const ip24 = await bumpCounter(env, `rl:ip24:${ipHash}`, RATE_LIMIT_IP_24H, RATE_LIMIT_WINDOW_24H);
  if (!ip24.allowed) return ip24;

  const em24 = await bumpCounter(env, `rl:em24:${emailHash}`, RATE_LIMIT_EMAIL_24H, RATE_LIMIT_WINDOW_24H);
  if (!em24.allowed) return em24;

  return { allowed: true };
}

// ─── Notification email ───────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildNotificationEmail(sub: StoredSubmission): { html: string; text: string } {
  const rows: Array<[string, string]> = [
    ['Name', sub.name],
    ['Email', sub.email],
    ['Company', sub.company || '—'],
    ['Role', sub.role || '—'],
    ['Topic', sub.topic],
    ['Submitted', sub.createdAt],
    ['Spam check', sub.spamSignal ?? 'passed'],
  ];

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>New contact submission</title></head>
<body style="margin:0;padding:24px;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#EEF0FF;">
  <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid rgba(0,229,255,0.18);border-radius:12px;padding:32px;">
    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#00E5FF;">New contact submission</p>
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${escapeHtml(sub.topic.toUpperCase())} — ${escapeHtml(sub.name)}</h1>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 0;font-size:12px;color:#A8A29E;width:110px;">${escapeHtml(k)}</td><td style="padding:6px 0;font-size:13px;color:#EEF0FF;">${escapeHtml(v)}</td></tr>`
        )
        .join('')}
    </table>
    <div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:16px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#7B61FF;">Message</p>
      <pre style="white-space:pre-wrap;word-wrap:break-word;font-family:inherit;font-size:14px;line-height:1.6;color:#EEF0FF;margin:0;">${escapeHtml(sub.message)}</pre>
    </div>
    <p style="margin-top:24px;font-size:11px;color:#57534E;">id: ${escapeHtml(sub.id)} · ip-hash: ${escapeHtml(sub.ipHash.slice(0, 12))}… · env: cwk-contact</p>
  </div>
</body></html>`;

  const text = [
    `New contact submission — ${sub.topic.toUpperCase()}`,
    '============================================',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Message:',
    sub.message,
    '',
    `id: ${sub.id}`,
    `ip-hash: ${sub.ipHash.slice(0, 12)}…`,
  ].join('\n');

  return { html, text };
}

async function sendNotification(env: Env, sub: StoredSubmission): Promise<void> {
  if (!env.RESEND_API) return;
  const { html, text } = buildNotificationEmail(sub);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API}`,
    },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: [env.CONTACT_INBOX_TO],
      reply_to: `${sub.name} <${sub.email}>`,
      subject: `[CWK Contact] ${sub.topic} — ${sub.name}`,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function handleContactPost(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (!env.CONTACTS || !env.RATE_LIMIT) return json({ ok: false, error: 'server_error' }, 500, env);

  let body: ContactPayload;
  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return json({ ok: false, error: 'invalid_request' }, 400, env);
  }

  // 1. Honeypot — silent 200.
  if (typeof body.website_url === 'string' && body.website_url.trim().length > 0) {
    return json({ ok: true, id: 'noop' }, 200, env);
  }

  // 2. Time-to-submit floor.
  const loadedAt = typeof body.loadedAt === 'number' ? body.loadedAt : 0;
  if (loadedAt > 0 && Date.now() - loadedAt < MIN_TIME_TO_SUBMIT_MS) {
    return json({ ok: false, error: 'spam_rejected' }, 400, env);
  }

  // 3. Validate fields.
  const v = validate(body);
  if (!v.ok) return json({ ok: false, error: 'validation_failed', fieldErrors: v.errors }, 422, env);
  const data = v.data;

  // 4. Disposable email blocklist.
  if (isDisposableEmail(data.email)) {
    return json({ ok: false, error: 'spam_rejected' }, 400, env);
  }

  // 5. Content heuristics.
  const heuristic = contentHeuristicSpam(data.message);
  if (heuristic) {
    return json({ ok: false, error: 'spam_rejected' }, 400, env);
  }

  // 6. Turnstile (if configured).
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
  const ip = getClientIp(request);
  if (env.TURNSTILE_SECRET) {
    const ok = turnstileToken ? await verifyTurnstile(turnstileToken, env.TURNSTILE_SECRET, ip) : false;
    if (!ok) return json({ ok: false, error: 'spam_rejected' }, 400, env);
  }

  // 7. Rate limits (IP + email).
  const ipHash = await sha256Hex(`${env.HASH_SALT ?? 'cwk'}:${ip}`);
  const rl = await checkRateLimits(env, ipHash, data.email);
  if (!rl.allowed) {
    return json(
      { ok: false, error: 'rate_limited' },
      429,
      env,
      rl.retryAfter ? { 'Retry-After': String(rl.retryAfter) } : {}
    );
  }

  // 8. Persist.
  const id = crypto.randomUUID();
  const submission: StoredSubmission = {
    id,
    createdAt: new Date().toISOString(),
    ipHash,
    userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? '',
    name: data.name,
    email: data.email,
    company: data.company,
    role: data.role,
    topic: data.topic,
    message: data.message,
    status: 'new',
  };

  try {
    await env.CONTACTS.put(`submission:${id}`, JSON.stringify(submission), {
      expirationTtl: RETENTION_SECONDS,
    });
  } catch {
    return json({ ok: false, error: 'server_error' }, 500, env);
  }

  // 9. Notification email — fire-and-forget.
  if (env.RESEND_API) {
    ctx.waitUntil(
      sendNotification(env, submission).catch(() => {
        // swallow — delivery failures should not leak to the client
      })
    );
  }

  return json({ ok: true, id }, 200, env);
}

