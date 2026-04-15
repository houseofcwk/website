# cwk-api (Cloudflare Worker)

The single API worker for houseofcwk.com. Owns `api.houseofcwk.com` via a
Custom Domain binding and dispatches to per-route handlers in
[`src/handlers/`](./src/handlers/).

Replaces the previous two-worker split (`cwk-waitlist-prod`, `cwk-contact-prod`).

## Endpoints

| Method | Path                  | Handler                                       |
|--------|-----------------------|-----------------------------------------------|
| POST   | `/waitlist`           | [handlers/waitlist.ts](./src/handlers/waitlist.ts) |
| POST   | `/contact`            | [handlers/contact.ts](./src/handlers/contact.ts)   |
| GET    | `/healthz`            | `{ "ok": true }`                              |
| GET    | `/contact/healthz`    | `{ "ok": true }` (kept for backward compat)   |
| OPTIONS| *                     | shared CORS preflight                         |

See the top-of-file comments in each handler for payload shape and per-route
behaviour (spam defenses, rate limits, response codes).

## Environment

Vars live in [`wrangler.toml`](./wrangler.toml); secrets are set out-of-band.

### Bindings

| Binding        | Type            | Purpose                                         |
|----------------|-----------------|-------------------------------------------------|
| `WAITLIST`     | KV              | Waitlist entries (key = lowercased email).      |
| `CONTACTS`     | KV              | Contact submissions (`submission:<uuid>`, 180d TTL). |
| `RATE_LIMIT`   | KV              | Contact rate-limit counters.                    |

The KV IDs in `wrangler.toml` reuse the production namespaces previously owned
by `cwk-waitlist-prod` and `cwk-contact-prod`, so all existing waitlist
entries + contact submissions carry over unchanged.

### Secrets (set via `wrangler secret put … --env production`)

| Secret             | Required for                                     |
|--------------------|--------------------------------------------------|
| `RESEND_API`       | Email delivery for both waitlist + contact.      |
| `TURNSTILE_SECRET` | Server-side Turnstile verification (contact).    |
| `HASH_SALT`        | Salt for SHA-256 IP hashing (contact rate limit).|

`TURNSTILE_SECRET` and `HASH_SALT` are optional — the handler falls back to a
constant salt and disables Turnstile verification when unset.

## Deploy

```sh
cd workers/api
npm ci
npm run typecheck
wrangler deploy --env production
```

If `cwk-waitlist-prod` still owns `api.houseofcwk.com` as a Custom Domain,
wrangler will prompt for the reassignment on first deploy — accept it. After
the new worker is live and verified (see root `workers/api/README.md`
verification section of the consolidation PR), delete the two old workers:

```sh
npx wrangler delete --name cwk-waitlist-prod
npx wrangler delete --name cwk-contact-prod
```

The GitHub Actions workflow at `.github/workflows/deploy.yml` deploys this
worker automatically on `push` to `main` via the `worker-api` job (alongside
the static Pages site).

## Layout

```
workers/api/
├── src/
│   ├── index.ts          # router
│   ├── env.ts            # shared Env interface
│   ├── lib/
│   │   ├── cors.ts       # corsHeaders(env), json(body, status, env, extra?)
│   │   └── sha256.ts     # sha256Hex(input)
│   └── handlers/
│       ├── waitlist.ts   # POST /waitlist — confirmation email
│       └── contact.ts    # POST /contact  — spam / rate limit / persist / notify
├── package.json
├── tsconfig.json
├── wrangler.toml
└── README.md
```

Handlers are intentionally self-contained — all the HTML email templates,
validation, and KV logic live inside each handler file. Only the truly
cross-cutting helpers (CORS + SHA-256) live in `lib/`.

## Logging

The contact handler redacts PII from Workers logs: only non-PII fields
(topic, timestamps, spam signal, truncated ipHash) may be logged. Raw IP,
`name`, `email`, and `message` must never appear in logs.
