# Deployment Guide — CWK PLOS Website

> Astro project setup and Cloudflare Pages deployment.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | JavaScript runtime |
| npm | 9+ | Package manager |
| Git | Any recent | Version control |
| Wrangler CLI | Latest | Cloudflare Pages deployment (optional — can use dashboard) |

### Accounts Required

1. **Cloudflare** — free tier account for Pages deployment
2. **GitHub** — repo is at `houseofcwk/cwk-plos-site`

---

## Project Scaffolding

When ready to build, scaffold the Astro project:

```bash
cd projects/cwk-plos-site
npm create astro@latest . -- --template minimal --typescript strict
```

### Required Integrations

```bash
npx astro add cloudflare    # Cloudflare Pages adapter
npx astro add react         # React for interactive islands (Brand Mirror quiz)
npx astro add sitemap       # Auto-generated sitemap.xml
```

### Astro Config

`astro.config.mjs` should include:

```javascript
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://houseofcwk.com',
  output: 'static',
  adapter: cloudflare(),
  integrations: [
    react(),
    sitemap(),
  ],
});
```

> **Note:** Use `output: 'static'` for fully static generation. Switch to `output: 'hybrid'` only if specific pages need SSR (e.g., dynamic Brand Mirror results).

---

## Local Development

```bash
npm install
npm run dev         # http://localhost:4321
```

### Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Astro dev server with HMR |
| `npm run build` | Build for production → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run astro check` | TypeScript type checking |

---

## Deployment to Cloudflare Pages

### Option A: Git Integration (Recommended)

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/) → **Workers & Pages** → **Create**
2. Select **Connect to Git** → authorize GitHub → select `houseofcwk/cwk-plos-site`
3. Configure build:

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (project root) |
| Node.js version | 20 |

4. Add environment variables:

| Variable | Value |
|----------|-------|
| `PUBLIC_SITE_URL` | `https://houseofcwk.com` |
| `PUBLIC_CF_ANALYTICS_TOKEN` | *(from Cloudflare Web Analytics)* |
| `NODE_VERSION` | `20` |

5. Click **Save and Deploy**

Every push to `main` will auto-deploy.

### Option B: Wrangler CLI

```bash
npm run build
npx wrangler pages deploy dist --project-name=cwk-plos-site
```

---

## Custom Domain Setup

### Connect `houseofcwk.com`

1. In Cloudflare Pages project settings → **Custom domains**
2. Add `houseofcwk.com` and `www.houseofcwk.com`
3. If the domain's DNS is already on Cloudflare, CNAME records are auto-configured
4. If not, add these DNS records:

```
CNAME   houseofcwk.com       cwk-plos-site.pages.dev
CNAME   www                  cwk-plos-site.pages.dev
```

5. Enable **Always Use HTTPS** in Cloudflare dashboard
6. Set up a page rule or redirect: `www.houseofcwk.com/*` → `https://houseofcwk.com/$1` (301)

---

## Cloudflare Web Analytics

1. Go to Cloudflare dashboard → **Web Analytics** → Add site
2. Copy the beacon token
3. Set as `PUBLIC_CF_ANALYTICS_TOKEN` in environment variables
4. Add the analytics script in `Base.astro` layout:

```html
<!-- Cloudflare Web Analytics -->
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "{PUBLIC_CF_ANALYTICS_TOKEN}"}'
></script>
```

This is cookie-free, privacy-first analytics. No consent banner needed.

---

## Redirects

Create `public/_redirects` for old URL compatibility:

```
/aboutkris                   /about                  301
/krisjourneyarticle          /about                  301
/flexlink                    /work                   301
/thelabmiamicampusarticle    /work/the-lab-miami     301
/robdialarticle              /work/rob-dial          301
/spraycationmuraltour        /work/spraycation       301
/dawaarticle                 /work/dawa              301
/stephyleearticle            /work/stephy-lee        301
/raasininthesunarticle       /work/raasin-in-the-sun 301
/beatstarsarticle            /work/pay-the-creators  301
/lifestapestryarticle        /work/lifes-tapestry    301
/brandmirrorlobby            /brand-mirror           301
/brandmirror                 /brand-mirror           301
/sidequests                  /side-quests            301
```

Cloudflare Pages reads `_redirects` from the output directory automatically.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | 95+ |
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 1.5s |
| Total Blocking Time | < 100ms |
| Cumulative Layout Shift | < 0.05 |
| Time to First Byte | < 100ms (edge) |

Astro's zero-JS default + Cloudflare's edge CDN should achieve these easily for all static pages. The Brand Mirror quiz page will have slightly higher TBT due to React hydration.

---

## SEO Checklist

- [ ] `sitemap.xml` auto-generated by `@astrojs/sitemap`
- [ ] `robots.txt` in `public/` allowing all crawlers
- [ ] Unique `<title>` and `<meta name="description">` per page
- [ ] Open Graph tags on every page
- [ ] Canonical URLs on every page
- [ ] JSON-LD structured data on homepage (Organization) and case studies (Article)
- [ ] `_redirects` file for old URL compatibility (301s)
- [ ] All images have `alt` text and use Astro's `<Image>` for optimization
- [ ] `<html lang="en">` set

---

## Production Checklist

Before going live:

- [ ] All pages render correctly with production build (`npm run build && npm run preview`)
- [ ] Brand Mirror quiz works end-to-end
- [ ] All old URLs redirect correctly (test each 301)
- [ ] Custom domain configured and SSL active
- [ ] Cloudflare Web Analytics token set
- [ ] OG images render correctly when shared on social media
- [ ] Mobile responsive on all pages (test 375px, 768px, 1024px)
- [ ] Favicon and apple-touch-icon configured
- [ ] `robots.txt` and `sitemap.xml` accessible
- [ ] Page speed audit passes targets above

---

## Resend Email Setup

### 1. Create a Resend account
Go to https://resend.com and create an account.

### 2. Verify your sending domain
In Resend dashboard: Domains → Add domain → `houseofcwk.com`
Add the DNS records Resend provides (SPF, DKIM, DMARC).

### 3. Create an API key
Resend → API Keys → Create API Key → name it "cwk-plos-production"
Save the key — you will only see it once.

### 4. Set secrets on the API Worker
APIs now live in `workers/api/` (a single consolidated worker —
`cwk-api-prod` — at `api.houseofcwk.com`). Only `RESEND_API` is a secret;
the rest are plain vars in `workers/api/wrangler.toml`.

```bash
cd workers/api
wrangler secret put RESEND_API       --env production
# Optional — only if you want contact-form spam defenses on full strength:
wrangler secret put TURNSTILE_SECRET --env production
wrangler secret put HASH_SALT        --env production
```

Values:
- `RESEND_API`: your Resend API key (re_...)
- `TURNSTILE_SECRET`: Cloudflare Turnstile site secret (for contact form)
- `HASH_SALT`: any random string; salts the SHA-256 IP hash used by the
  contact rate limiter. Rotating it invalidates existing rate-limit keys.

The `FROM_EMAIL`, `FROM_NAME`, `REPLY_TO_EMAIL`, `REPLY_TO_NAME`,
`CONTACT_INBOX_TO` values are plain `[vars]` / `[env.production.vars]` in
`workers/api/wrangler.toml` — edit the file and redeploy, no secret step
needed.

### 5. Local dev
Run the Astro dev server and the API worker independently:

```bash
# terminal 1 — static site
npm run dev

# terminal 2 — API worker with local KV
cd workers/api
wrangler dev
```
