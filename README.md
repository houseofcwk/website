# CWK. PLOS — Product Website

> **"The sports agent for entrepreneurs."**
> The official product website for CWK Experience and the Personal Lifestyle Operating System (PLOS).

**Live:** TBD (Cloudflare Pages)
**Replaces:** [cwkexperience.com](https://cwkexperience.com/) (currently hosted on a page builder)

---

## What This Is

The public-facing marketing and product website for **CWK. Experience** — a long-term business management partner for high-performing entrepreneurs ($150K–$5M). The site communicates the brand identity, showcases the portfolio, hosts the Brand Mirror diagnostic quiz, and drives qualified leads into the CWK ecosystem.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Astro** | Static-first with islands architecture for interactive components. Fast, SEO-optimized, content-focused. |
| Styling | **CSS** (global + scoped) | Matches CWK dark-mode brand system. No utility framework — custom design language. |
| Content | **Astro Content Collections** | Markdown/MDX for case studies, articles, and portfolio pieces. |
| Interactive | **Astro Islands** (React or Vanilla) | Brand Mirror quiz, contact forms, and any dynamic components. |
| Deployment | **Cloudflare Pages** | Edge-deployed globally. Fast builds, free tier, custom domains. |
| Analytics | **Cloudflare Web Analytics** | Privacy-first, no cookie banners needed. |

## Project Status

**Phase: Planning** — documentation and content architecture complete. Astro project not yet scaffolded.

## Getting Started

Once the Astro project is scaffolded:

```bash
cd projects/cwk-plos-site
npm install
npm run dev         # Start dev server at localhost:4321
npm run build       # Build for production
npm run preview     # Preview production build locally
```

## Documentation

| Document | Purpose |
|----------|---------|
| [AGENTS.md](AGENTS.md) | AI coding context — conventions, patterns, and rules |
| [CONTEXT.md](CONTEXT.md) | Product context — what we're building and why |
| [docs/DESIGN.md](docs/DESIGN.md) | Full design system from brand PDFs (colors, typography, components) |
| [docs/SITE_STRUCTURE.md](docs/SITE_STRUCTURE.md) | Full sitemap, page specs, and component inventory |
| [docs/WEBSITE_CONTENT.md](docs/WEBSITE_CONTENT.md) | All page copy ready for implementation |
| [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Cloudflare Pages deployment setup |
| [contents/](contents/) | Page content files mirroring every cwkexperience.com page |

## Related Projects

| Project | Repo | Relationship |
|---------|------|-------------|
| CWK Agent+ Dashboard | [cwk-exp-main](https://github.com/CWK-Experience/cwk-exp-main) | Internal app — the site links to it for client login |
| Platform Monorepo | [platform](https://github.com/houseofcwk/platform) | Parent repo that orchestrates all CWK projects |

---

*Build. Learn. Earn. Play. — CWK. LLC*
