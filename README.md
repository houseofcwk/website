# CWK. PLOS — Product Website

[![Deploy to Cloudflare Pages](https://github.com/houseofcwk/cwk-plos-site/actions/workflows/deploy.yml/badge.svg)](https://github.com/houseofcwk/cwk-plos-site/actions/workflows/deploy.yml)
[![Astro](https://img.shields.io/badge/Astro-5.6-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-live-F38020?logo=cloudflare&logoColor=white)](https://houseofcwk.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)

> **"The sports agent for entrepreneurs."**

The official product website for **CWK. Experience** — long-term business management for high-performing entrepreneurs ($150K–$5M). Built on Astro, deployed globally via Cloudflare Pages.

**Live site:** [houseofcwk.com](https://houseofcwk.com)

---

## Deployment

| Environment | URL | Trigger |
|-------------|-----|---------|
| Production | [houseofcwk.com](https://houseofcwk.com) | Push to `main` |
| Preview | `*.houseofcwk.pages.dev` | Pull request |

Deploys are automatic via GitHub Actions → `cloudflare/wrangler-action@v3`. Build time is typically under 30 seconds.

### Build locally

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # Production build → dist/
npm run preview    # Preview dist/ locally
```

### Preview with Cloudflare bindings (KV + secrets)

```bash
npm run build
cp .dev.vars.example .dev.vars   # fill in RESEND_API and other secrets
npx wrangler pages dev dist --kv WAITLIST
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro 5](https://astro.build) — static output, islands architecture |
| Interactivity | [React 19](https://react.dev) islands via `client:visible` |
| Styling | Vanilla CSS — custom dark-mode design system (no utility framework) |
| Edge functions | Cloudflare Pages Functions (`src/functions/`) |
| Storage | Cloudflare KV — waitlist email deduplication |
| Email | [Resend](https://resend.com) — transactional confirmation emails |
| Sitemap | `@astrojs/sitemap` — auto-generated at `/sitemap-index.xml` |
| Analytics | Cloudflare Web Analytics — privacy-first, no cookie banner |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com) |

---

## Project Structure

```
src/
├── components/
│   ├── Header.astro          # Fixed nav with backdrop blur
│   ├── Footer.astro          # Logo, nav columns, legal
│   ├── SEO.astro             # OG tags, Twitter Card, canonical URL
│   ├── WaitlistForm.tsx      # React island — 5-state waitlist form
│   └── mocks/               # Static glassmorphic UI mockups
│       ├── MockDashboard.astro
│       ├── MockRelationships.astro
│       ├── MockPipeline.astro
│       ├── MockActions.astro
│       ├── MockKaia.astro
│       └── MockDestination.astro
├── functions/
│   └── api/waitlist.ts       # POST handler — KV dedup + Resend email
├── layouts/
│   └── Base.astro            # HTML shell, ambient orbs, noise overlay
├── middleware.ts             # HTTP Basic Auth (pre-launch gate)
└── pages/
    ├── index.astro           # Homepage — hero → pillars → proof → waitlist
    ├── product.astro         # Agent+ product page — 6 feature showcases
    └── 404.astro             # Custom 404

public/
├── og-image.svg             # 1200×630 branded OG image (SVG)
├── robots.txt               # Allow all, sitemap link
└── _redirects               # 13 × 301 redirects from old URLs

docs/
├── DESIGN.md                # Full design system — tokens, components, patterns
├── SITE_STRUCTURE.md        # Sitemap, page specs, component inventory
├── WEBSITE_CONTENT.md       # All page copy
└── DEPLOYMENT_GUIDE.md      # Cloudflare Pages setup, KV binding, Resend config
```

---

## Waitlist API

`POST /api/waitlist` — handled by `src/functions/api/waitlist.ts`

| Response | Meaning |
|----------|---------|
| `200` | Email stored in KV; confirmation sent via Resend |
| `409` | Email already on the waitlist |
| `422` | Invalid email format |
| `500` | Server error |

Duplicate detection uses Cloudflare KV (`WAITLIST` namespace). Confirmation email fires via `context.waitUntil()` — non-blocking, fire-and-forget.

---

## Environment Variables

Copy `.env.example` → `.env` for public vars. Copy `.dev.vars.example` → `.dev.vars` for secrets (never committed).

| Variable | Where set | Purpose |
|----------|-----------|---------|
| `PUBLIC_SITE_URL` | `.env` / CF Pages | Canonical site URL |
| `PUBLIC_CF_ANALYTICS_TOKEN` | `.env` / CF Pages | Web Analytics token |
| `RESEND_API` | CF Pages secret | Resend API key |
| `FROM_EMAIL` | CF Pages secret | `waitlist@houseofcwk.com` |
| `FROM_NAME` | CF Pages secret | Sender display name |
| `REPLY_TO_EMAIL` | CF Pages secret | `kris@houseofcwk.com` |
| `REPLY_TO_NAME` | CF Pages secret | Reply-to display name |
| `WAITLIST` | CF Pages KV binding | KV namespace (not an env var) |

Set secrets via Wrangler:
```bash
wrangler pages secret put RESEND_API --project-name=houseofcwk
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) | AI coding context — conventions, patterns, constraints |
| [CONTEXT.md](CONTEXT.md) | Product context — what we're building and why |
| [docs/DESIGN.md](docs/DESIGN.md) | Design system — colors, typography, glassmorphism, components |
| [docs/SITE_STRUCTURE.md](docs/SITE_STRUCTURE.md) | Sitemap, page specs, component inventory |
| [docs/WEBSITE_CONTENT.md](docs/WEBSITE_CONTENT.md) | All page copy |
| [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | CF Pages setup, KV bindings, Resend, custom domain |

---

## Related Projects

| Project | Repo | Relationship |
|---------|------|-------------|
| Platform Monorepo | [houseofcwk/platform](https://github.com/houseofcwk/platform) | Parent repo — this project is a submodule |
| CWK Agent+ Dashboard | [CWK-Experience/cwk-exp-main](https://github.com/CWK-Experience/cwk-exp-main) | Internal app — site links to it for client login |

---

*Build. Learn. Earn. Play. — CWK. LLC*
