# Sanity + Webhook Setup Runbook

One-time setup actions to take outside the codebase. Run in this order.

---

## 1. Confirm Sanity project access

- Project ID: `3fsa3jok`
- Organization ID: `ocjx5u09p`
- Dataset: `production`
- Studio (embedded): https://houseofcwk.com/studio

Open https://www.sanity.io/manage and verify you can see the project.

---

## 2. CORS origins (Sanity manage → API → CORS Origins)

Add (no credentials needed):

- `http://localhost:4321`
- `https://houseofcwk.com`
- `https://houseofcwk.pages.dev`

---

## 3. API worker — first-time deploy

```sh
cd workers/api

# 1. Authenticate wrangler if you haven't already.
npx wrangler login

# 2. Set Resend API secret (same value as the existing Pages secret).
#    Get the value from: wrangler pages secret list --project-name=houseofcwk
#    confirms the existing key — but you'll need to fetch the actual value
#    from Resend's dashboard since secrets aren't readable.
npx wrangler secret put RESEND_API --env production
# Paste the Resend API key when prompted.

# 3. (Optional) Contact-specific secrets:
npx wrangler secret put TURNSTILE_SECRET --env production   # if using Turnstile
npx wrangler secret put HASH_SALT        --env production   # salt for IP hashing

# 4. Bind the api.houseofcwk.com custom domain.
#    The first deploy registers the worker; the routes in wrangler.toml
#    declare custom_domain=true so Cloudflare provisions the cert.
npx wrangler deploy --env production

# 5. Smoke-test:
curl https://api.houseofcwk.com/healthz         # → {"ok":true}
curl https://api.houseofcwk.com/contact/healthz # → {"ok":true}
curl -X POST https://api.houseofcwk.com/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'             # → {"success":true}
```

If `api.houseofcwk.com` is not yet on Cloudflare, add it as a zone first
(or as a subdomain of an existing zone). The custom_domain route binding
will fail until the hostname resolves to a Cloudflare zone you control.

---

## 4. Drop the now-unused Basic Auth secrets on Pages

Middleware was deleted; these secrets are dead weight.

```sh
npx wrangler pages secret delete BASIC_AUTH_USER --project-name=houseofcwk --env production
npx wrangler pages secret delete BASIC_AUTH_PASS --project-name=houseofcwk --env production
```

(Optional — leaving them does no harm.)

---

## 5. GitHub fine-grained PAT for the Sanity webhook

1. Go to https://github.com/settings/personal-access-tokens/new
2. Token name: `sanity-webhook-cwk`
3. Resource owner: `houseofcwk`
4. Repository access: select **only** `cwk-plos-site`
5. Permissions:
   - **Actions: Read and write**
   - **Contents: Read** (auto-added)
6. Expiration: 1 year (set a calendar reminder to rotate)
7. Generate, copy the token. **You won't see it again.**

---

## 6. Sanity webhook (Sanity manage → API → Webhooks → Create webhook)

| Field        | Value                                                                                                              |
|--------------|--------------------------------------------------------------------------------------------------------------------|
| Name         | `github-actions-deploy`                                                                                            |
| Description  | Triggers a production rebuild on any published content change.                                                     |
| URL          | `https://api.github.com/repos/houseofcwk/cwk-plos-site/actions/workflows/deploy.yml/dispatches`                    |
| Dataset      | `production`                                                                                                       |
| Trigger on   | Create, Update, Delete (check all three)                                                                           |
| Filter       | `_type in ["siteSettings","homePage","productPage","aboutPage","journeyPage","brandMirrorPage","sideQuestsPage","caseStudy","legalPage"] && !(_id in path("drafts.**"))` |
| Projection   | `{ "ref": "main", "inputs": { "source": "sanity" } }`                                                              |
| HTTP method  | `POST`                                                                                                             |
| HTTP headers | `Authorization: Bearer <PAT_FROM_STEP_5>` <br> `Accept: application/vnd.github+json` <br> `X-GitHub-Api-Version: 2022-11-28` |
| API version  | `v2024-10-01`                                                                                                      |
| Enable       | ✅                                                                                                                 |

After save, click **"Attempt delivery"** with a sample payload to confirm
the call returns 204 (GitHub Actions success). Then watch GitHub →
Actions tab — a `workflow_dispatch` run should appear within seconds.

---

## 7. Seeding initial content

In Studio (https://houseofcwk.com/studio after first deploy, or
http://localhost:4321/studio locally):

1. Create the **Site Settings** singleton (nav, footer, default SEO).
2. Create the **Home**, **Product**, **About**, **Journey**, **Brand
   Mirror**, **Side Quests** singletons one at a time. Copy the existing
   hardcoded text from `src/pages/*.astro` until you're ready to rewrite.
3. Create the 8 **Case Studies** with slugs matching the existing files
   (`dawa, lifes-tapestry, pay-the-creators, raasin-in-the-sun, rob-dial,
   spraycation, stephy-lee, the-lab-miami`). When all 8 exist:
   - Delete the 8 hardcoded `src/pages/work/<slug>.astro` files.
   - Remove the `EXCLUDED_SLUGS` filter in `src/pages/work/[slug].astro`.
   - Push to main; the dynamic route picks up all of them.
4. Create the **Privacy** and **Terms** legal pages with slugs `privacy`
   and `terms`. Body field is Portable Text — paste from the hardcoded
   `<p>` blocks in `src/pages/{privacy,terms}.astro`.

Each publish fires the webhook → GitHub Actions → site rebuilds in ~2 min.

---

## 8. Cleanup pass (after Studio is fully seeded)

1. Remove every `HARDCODED_*` constant + fallback branch from
   `src/pages/*.astro`. The pattern is consistent — search for
   `HARDCODED_` and `data?.body ? (`.
2. Delete the 8 hardcoded case-study files (see step 7.3).
3. Optionally extend the `homePage` schema with the missing sections
   (mission, proof bar, featured work cards, product-preview tags,
   waitlist copy) and migrate those last hardcoded chunks of `index.astro`.
4. Drop the deprecated `@astrojs/cloudflare` from `package.json` if it's
   still listed (already removed in commit `705142b`, but verify).

---

## Architecture cheat-sheet

- **Pages** (Cloudflare Pages, project `houseofcwk`): pure static HTML,
  zero worker. Built in GitHub Actions; deployed via `wrangler pages
  deploy dist`.
- **Studio** (`/studio`): client-only React island, served as the same
  static `dist/studio/index.html` for any `/studio/*` path via the
  `_redirects` rewrite rule.
- **API** (Cloudflare Worker `cwk-api-prod`, source at `workers/api/`):
  bound to `api.houseofcwk.com`. Routes: `POST /waitlist`, `POST /contact`,
  `GET /healthz`, `GET /contact/healthz`. Reuses the KV namespaces from
  the prior waitlist + contact workers so existing entries carry over.
- **CMS** (Sanity, project `3fsa3jok`, dataset `production`): public-read
  dataset; the build queries it without a token. Webhook fires GitHub
  `workflow_dispatch` on any non-draft change to one of the 9 schema doc
  types.

## Files you'll touch most often

- `studio-schemas/*.ts` — schema changes. Hot-reloads in `npm run dev`.
- `src/lib/queries.ts` — projections. Update when adding schema fields.
- `src/pages/*.astro` — page templates. Always read from Sanity first.
