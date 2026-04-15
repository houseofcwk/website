# cwk-contact (Cloudflare Worker)

Standalone Worker serving the `/contact` form submission endpoint for
houseofcwk.com. Mirrors the pattern of [`workers/waitlist`](../waitlist/).

## Endpoints

| Method | Path                  | Purpose                                   |
|--------|-----------------------|-------------------------------------------|
| POST   | `/contact`            | Submit contact form                       |
| GET    | `/contact/healthz`    | Health check → `{ "ok": true }`           |

Bound to the production hostname `api.houseofcwk.com` via `custom_domain`
routes defined in [`wrangler.toml`](./wrangler.toml).

## Request payload

```jsonc
{
  "name":    "Jane Doe",
  "email":   "jane@example.com",
  "company": "Acme",                // optional
  "role":    "COO",                 // optional
  "topic":   "partnership",         // general | partnership | press | support | other
  "message": "Hello, we'd like to…",
  "consent": true,                  // required
  "loadedAt": 1713200000000,        // ms epoch — time page rendered; enforces >2s floor
  "website_url": "",                // honeypot — must be empty
  "turnstileToken": "..."           // required if TURNSTILE_SECRET is set
}
```

Responses:

| Status | Body                                                       | Meaning                         |
|--------|------------------------------------------------------------|---------------------------------|
| 200    | `{ "ok": true, "id": "<uuid>" }`                           | Accepted (or honeypot bypass)   |
| 400    | `{ "ok": false, "error": "invalid_request" }`              | Bad JSON                        |
| 400    | `{ "ok": false, "error": "spam_rejected" }`                | Generic spam reject (no detail) |
| 422    | `{ "ok": false, "error": "validation_failed", "fieldErrors": {...} }` | Field-level errors  |
| 429    | `{ "ok": false, "error": "rate_limited" }` + `Retry-After` | Rate limit hit                  |
| 500    | `{ "ok": false, "error": "server_error" }`                 | Misconfigured bindings or KV I/O |

Note: all spam-check failures return `400 spam_rejected` with the same generic
message, so attackers can't fingerprint which defense tripped.

## Spam / abuse defenses (layered)

1. **Honeypot** — hidden `website_url` field. If populated, returns `200` so
   bots think they succeeded, then drops the payload.
2. **Time-to-submit floor** — client sends `loadedAt` (ms since page render);
   Worker rejects submissions under 2s old.
3. **Cloudflare Turnstile** — if `TURNSTILE_SECRET` is set, every submission
   must include a valid `turnstileToken` (verified server-side against
   `challenges.cloudflare.com`).
4. **Content heuristics** — reject when the message contains >3 URLs, runs of
   16+ repeated chars, or any known spam substrings.
5. **Disposable email blocklist** — `mailinator.com`, `guerrillamail.com`,
   `yopmail.com`, etc. Extend `DISPOSABLE_EMAIL_DOMAINS` in `src/index.ts`.
6. **Rate limits** (KV counters, keyed by salted SHA-256 hashes):
   - IP: 5 submissions / 10 min, 20 / day
   - Email: 3 / day

## Storage schema

Stored in the `CONTACTS` KV namespace under `submission:<uuid>` with a 180-day
TTL (Cloudflare expires the entry automatically — no cron sweep needed).

```ts
interface StoredSubmission {
  id: string;              // uuid
  createdAt: string;       // ISO-8601
  ipHash: string;          // SHA-256(HASH_SALT + ":" + ip) — raw IP never stored
  userAgent: string;       // capped at 300 chars
  name: string;
  email: string;
  company: string;
  role: string;
  topic: 'general'|'partnership'|'press'|'support'|'other';
  message: string;
  status: 'new'|'replied'|'spam';
  spamSignal?: string;
}
```

IP addresses are hashed with `HASH_SALT` (Worker secret) before storage; raw
IPs are never persisted.

## Environment — `wrangler.toml` vars

| Var                | Preview                              | Production              |
|--------------------|--------------------------------------|-------------------------|
| `ENVIRONMENT`      | `preview`                            | `production`            |
| `ALLOWED_ORIGIN`   | `https://houseofcwk.pages.dev`       | `https://houseofcwk.com`|
| `FROM_EMAIL`       | `hello@cwkexperience.com`               | same                    |
| `FROM_NAME`        | `CWK. Experience`                    | same                    |
| `REPLY_TO_EMAIL`   | `hello@cwkexperience.com`               | same                    |
| `REPLY_TO_NAME`    | `CWK. Team`                          | same                    |
| `CONTACT_INBOX_TO` | `hello@cwkexperience.com`               | same                    |

## Secrets — `wrangler secret put ... --env production`

| Secret             | Used for                                              |
|--------------------|-------------------------------------------------------|
| `RESEND_API`       | Team inbox notification email (Resend).               |
| `TURNSTILE_SECRET` | Server-side Turnstile verification (optional).        |
| `HASH_SALT`        | Salt for SHA-256 IP hashing. Rotate = invalidates rate-limit keys. |

## KV bindings

| Binding      | Purpose                                                    |
|--------------|------------------------------------------------------------|
| `CONTACTS`   | Persisted submissions (key `submission:<uuid>`, TTL 180d). |
| `RATE_LIMIT` | Throttle counters (keys `rl:ip10:*`, `rl:ip24:*`, `rl:em24:*`). |

Replace the `PLACEHOLDER_*_KV_ID` values in `wrangler.toml` with real
namespace IDs before the first production deploy:

```sh
wrangler kv:namespace create CONTACTS
wrangler kv:namespace create CONTACTS --preview
wrangler kv:namespace create RATE_LIMIT
wrangler kv:namespace create RATE_LIMIT --preview
```

## Deploy

```sh
# from workers/contact/
npm ci
npm run typecheck
wrangler deploy --env production
```

The GitHub Actions workflow `.github/workflows/deploy.yml` deploys this Worker
automatically on pushes to `main` (alongside the waitlist worker and the
static Pages site).

## Logging

Workers logs redact PII: only non-PII fields (topic, timestamps, spam signal,
truncated ipHash) should be logged. `message`, `name`, and `email` must never
appear in logs.
