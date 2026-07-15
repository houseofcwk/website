// cwk-api — single Cloudflare Worker serving api.cwkexperience.com.
// Internally dispatches to per-route handlers in ./handlers/.

import type { Env } from './env';
import { corsHeaders } from './lib/cors';
import { handleWaitlistPost } from './handlers/waitlist';
import { handleContactPost } from './handlers/contact';
import { handleGoogleReviewsGet } from './handlers/googleReviews';
import { handleLifestyleCalculatorPost } from './handlers/lifestyleCalculator';
import { handleXrayFlow } from './handlers/xrayFlow';

type Method = 'GET' | 'POST' | 'OPTIONS' | string;

function methodNotAllowed(allow: string, env: Env): Response {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: allow, ...corsHeaders(env) },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method as Method;

    // ── Health checks (open, no CORS negotiation needed) ──────────────────
    if (pathname === '/healthz' || pathname === '/contact/healthz') {
      return Response.json({ ok: true });
    }

    // ── CORS preflight, shared across all POST routes ─────────────────────
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    // ── Waitlist ─────────────────────────────────────────────────────────
    if (pathname === '/waitlist') {
      if (method === 'POST') return handleWaitlistPost(request, env, ctx);
      return methodNotAllowed('POST, OPTIONS', env);
    }

    // ── Contact ──────────────────────────────────────────────────────────
    if (pathname === '/contact') {
      if (method === 'POST') return handleContactPost(request, env, ctx);
      return methodNotAllowed('POST, OPTIONS', env);
    }

    // ── Google reviews ──────────────────────────────────────────────────
    if (pathname === '/google-reviews') {
      if (method === 'GET') return handleGoogleReviewsGet(request, env, ctx);
      return methodNotAllowed('GET, OPTIONS', env);
    }

    // ── Lifestyle calculator ────────────────────────────────────────────
    if (pathname === '/lifestyle-calculator') {
      if (method === 'POST') return handleLifestyleCalculatorPost(request, env, ctx);
      return methodNotAllowed('POST, OPTIONS', env);
    }
    // ── Player X-Ray micro-app flow (Omazy plugin-flow webhook; HMAC-auth) ──
    if (pathname === '/xray/flow') {
      if (method === 'POST') return handleXrayFlow(request, env);
      return methodNotAllowed('POST', env);
    }

    return new Response('Not Found', { status: 404 });
  },
};
