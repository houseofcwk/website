// omazy-sdk — a thin, dependency-free client for building an Omazy micro-app on
// a Cloudflare Worker (or any fetch-capable runtime). One file, copy-paste it
// into your Worker as the starting template.
//
// It covers the three Omazy micro-app primitives (all HMAC-signed via
// X-Omazy-Signature), plus a typed Core API client:
//   - Conversational FLOW   (app owns a multi-step in-chat flow)
//   - TOOL calling           (the agent calls your function mid-answer)
//   - CONTEXT provider       (you inject ambient context into the agent's prompt)
//
// The whole security model: every core→app request is signed with your install's
// shared secret. Verify it with verifySignature (or use readSigned, which does
// the verify + JSON parse for you and hands back a typed body).

// ── Auth ────────────────────────────────────────────────────────────────────

/** Constant-time-ish HMAC-SHA256 verification of the X-Omazy-Signature header. */
export async function verifySignature(secret: string, raw: string, header: string | null): Promise<boolean> {
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

export type Signed<T> = { ok: true; raw: string; body: T } | { ok: false; status: 401 | 400 };

/**
 * Verify the request signature and parse its JSON body. Returns a discriminated
 * result: on failure, `status` is the HTTP code you should return.
 *
 *   const s = await readSigned<ToolRequest>(request, env.XRAY_HMAC_SECRET);
 *   if (!s.ok) return new Response('unauthorized', { status: s.status });
 *   // s.body is your typed request
 */
export async function readSigned<T>(request: Request, secret: string): Promise<Signed<T>> {
  const raw = await request.text();
  if (!(await verifySignature(secret, raw, request.headers.get('X-Omazy-Signature')))) return { ok: false, status: 401 };
  try {
    return { ok: true, raw, body: JSON.parse(raw) as T };
  } catch {
    return { ok: false, status: 400 };
  }
}

/** JSON Response helper. Generic so `json<ToolResponse>({…})` type-checks the body. */
export const json = <T = unknown>(obj: T, init?: ResponseInit): Response =>
  new Response(JSON.stringify(obj), { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });

// ── Shared shapes ───────────────────────────────────────────────────────────

export interface Identity {
  email?: string | null;
  verified?: boolean;
}

/** rfc2207 message blocks the widget/app renders. */
export type Block =
  | { type: 'card'; title: string; subtitle?: string; buttons?: Button[] }
  | { type: 'text'; markdown: string }
  | { type: 'buttons'; buttons: Button[] };
export type Button =
  | { kind: 'postback'; label: string; payload: string }
  | { kind: 'url'; label: string; url: string; target?: string };

// Block builders.
export const card = (title: string, subtitle?: string, buttons?: Button[]): Block => ({ type: 'card', title, ...(subtitle ? { subtitle } : {}), ...(buttons ? { buttons } : {}) });
export const text = (markdown: string): Block => ({ type: 'text', markdown });
export const buttons = (bs: Button[]): Block => ({ type: 'buttons', buttons: bs });
export const pb = (label: string, payload: string): Button => ({ kind: 'postback', label, payload });
export const urlBtn = (label: string, url: string): Button => ({ kind: 'url', label, url, target: '_blank' });

// ── Primitive contracts (core → app) ────────────────────────────────────────

/** FLOW: app owns a multi-step in-chat flow. */
export interface FlowRequest<S = any> {
  flow?: string;
  event: 'start' | 'message' | 'verified';
  app_id?: string;
  session_id?: string;
  customer_id?: string | null;
  message?: { text?: string } | null;
  state?: S;
  identity?: Identity;
}
export interface FlowResponse<S = any> {
  blocks: Block[];
  state: S;
  done?: boolean;
  require_verify?: { email: string };
}
export const flowReply = <S>(blocks: Block[], state: S, done = false, require_verify?: { email: string }): FlowResponse<S> =>
  ({ blocks, state, done, ...(require_verify ? { require_verify } : {}) });

/** TOOL: the agent calls your function; you return content it weaves into the reply. */
export interface ToolRequest {
  tool?: string;
  input?: unknown;
  app_id?: string;
  session_id?: string;
  customer_id?: string | null;
  identity?: Identity;
}
export interface ToolResponse {
  content: string;
  is_error?: boolean;
}

/** CONTEXT: you get the visitor's app-memory and return ambient prompt context. */
export interface ContextRequest {
  app_id?: string;
  session_id?: string;
  customer_id?: string | null;
  identity?: Identity;
  memory?: Record<string, unknown> | null;
}
export interface ContextResponse {
  context: string;
  required?: boolean;
  section?: string;
}

// ── Core API client ─────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

/**
 * Typed client for the Omazy Core API, authenticated with your per-install
 * token (cai_…). Scope-gated server-side: reads need core:read, memory writes
 * need memory:write, posting messages needs core:write.
 */
export class CoreClient {
  constructor(private token: string, private base = 'https://mw.omazy.ai/api/v1') {}

  private async req(path: string, init: RequestInit): Promise<Response | null> {
    if (!this.token) return null;
    return fetch(`${this.base}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}`, ...(init.headers || {}) },
    }).catch(() => null);
  }

  /** GET a customer scoped to this install's workspace (null on any failure). */
  async getCustomer(id: string): Promise<Customer | null> {
    if (!id) return null;
    const res = await this.req(`/core/customers/${id}`, { method: 'GET' });
    if (!res || !res.ok) return null;
    const body = (await res.json().catch(() => null)) as any;
    return (body?.data ?? body) as Customer | null;
  }

  /** Merge-write the visitor's memory (custom_fields). Best-effort. */
  async patchCustomer(id: string, custom_fields: Record<string, unknown>): Promise<void> {
    if (!id) return;
    await this.req(`/core/customers/${id}`, { method: 'PATCH', body: JSON.stringify({ custom_fields }) });
  }

  /** Post message blocks into a conversation as the app/bot. Best-effort. */
  async postMessage(conversationId: string, blocks: Block[]): Promise<void> {
    if (!conversationId) return;
    await this.req(`/core/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ blocks }) });
  }
}
