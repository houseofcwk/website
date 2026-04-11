# CONTEXT.md — CWK PLOS Website

## What We're Building

A production-grade marketing and product website for **CWK. Experience** — replacing the current site hosted on a page builder ([cwkexperience.com](https://cwkexperience.com/)) with a fast, SEO-optimized, developer-owned Astro site deployed to Cloudflare Pages.

## Why We're Rebuilding

The current site is hosted on a drag-and-drop page builder. It works but has limitations:

- **Performance:** Heavy runtime, slow load times, no image optimization
- **SEO:** Limited control over meta tags, structured data, and URL structure
- **Content management:** No clean way to manage case studies as structured content
- **Brand control:** Difficult to implement the precise CWK dark-mode design system
- **Developer velocity:** Can't version control, can't iterate with code, can't automate

The new Astro site solves all of these: ships zero JS by default, gives full control over HTML/CSS/SEO, and deploys to Cloudflare's edge network for sub-100ms TTFB globally.

## What the Site Needs to Do

### Primary Goals
1. **Communicate the CWK value proposition** — "sports agent for entrepreneurs" positioning, the four pillars, the PLOS framework
2. **Build credibility** — portfolio of real work with measurable results
3. **Convert visitors** — Brand Mirror quiz as the primary lead magnet (free, no email)
4. **Establish Kris San's authority** — founder story, body of work, journey

### Conversion Flow
```
Visitor lands → Reads positioning → Sees proof (portfolio)
             → Explores product mockup (/product)
             → Takes Brand Mirror quiz (free, 2 min)
             → Gets reflection/results
             → Joins waitlist for Agent+ (email capture)
             → Next step: contact or early access
```

### Key Audiences
- **Primary:** Entrepreneurs earning $150K–$5M with infrastructure problems
- **Secondary:** Creative founders, fractional execs, non-profits needing brand infrastructure

## New Features (In Progress)

### Waitlist (Homepage)
Email capture form on the homepage for Agent+ early access. Submits to a Cloudflare Pages Function that stores emails in Cloudflare KV. Implemented as a React Island (`WaitlistForm.tsx`) with client-side validation and honeypot spam prevention. Shared between the homepage and the product page.

### Product Mockup Page (`/product`)
A dedicated page showcasing the Agent+ dashboard through static prototype mockups built in HTML/CSS (not screenshots). Each feature (Dashboard, Relationships, Pipeline, Daily Actions, kaia AI Chat, Brand Destination) gets a glassmorphic card that visually represents the interface. Alternating left/right layout. Ends with a waitlist CTA. Purpose: let prospects see the product before it launches.

---

## What Exists Today (Current Site Pages)

| Current URL | Page | Content |
|-------------|------|---------|
| `/` | Homepage | Hero, mission statement, four pillars, CTAs |
| `/aboutkris` | About Kris | Why statement, journey link |
| `/krisjourneyarticle` | Kris Journey | 6-chapter timeline (Puerto Rico → Austin → Present) |
| `/flexlink` | Portfolio | 8 case studies + side quests in card grid |
| `/brandmirrorlobby` | Brand Mirror Lobby | Intro + CTA to start quiz |
| `/brandmirror` | Brand Mirror Quiz | 4-question diagnostic quiz |
| `/sidequests` | Side Quests | Vending machine, podcast, Keep Austin Voting, ART board |
| `/thelabmiamicampusarticle` | Case Study: The LAB Miami | Full article with video |
| `/robdialarticle` | Case Study: Rob Dial | Full article with video |
| `/spraycationmuraltour` | Case Study: SPRAYCATION | Article |
| `/dawaarticle` | Case Study: DAWA | Article |
| `/stephyleearticle` | Case Study: Stephy Lee | Article |
| `/raasininthesunarticle` | Case Study: Raasin | Article |
| `/beatstarsarticle` | Case Study: Pay The Creators | Article |
| `/lifestapestryarticle` | Case Study: Life's Tapestry | Article |

## Brand Identity Summary

### Positioning
"CWK. is like a sports agent for entrepreneurs." Long-term business management partner (not consultant, not agency, not coach). Acquires stake in founder's future.

### Four Pillars
- **Mind:** Strategic clarity, decision frameworks, mental performance
- **Body:** Operational systems, time/energy optimization
- **Soul:** Legacy building, IP development, thought leadership
- **Pocket:** Revenue systems, opportunity sourcing, deal structuring

### Design Language
- Dark obsidian base (`#0A0A0A`)
- Signature blue→purple action gradient (`#38B2F6` → `#B721FF`)
- Inter (body) + DM Sans (display) typography
- Authoritative, precise, premium — PE firm meets gamified growth

### Full Identity Reference
See [`/docs/IDENTITY.md`](https://github.com/houseofcwk/platform/blob/main/docs/IDENTITY.md) in the platform monorepo for complete brand identity, founder bio, portfolio details, design specs, and competitive positioning.

## Architecture Decisions

1. **Astro over Next.js** — this is a content/marketing site, not a web app. Astro ships zero JS by default, has first-class Markdown support, and is purpose-built for content sites.

2. **Cloudflare Pages over Vercel** — edge-deployed globally, generous free tier, Cloudflare ecosystem (analytics, WAF, DNS) already aligned with the CWK infrastructure direction.

3. **Content Collections for case studies** — case studies are structured content with typed frontmatter (title, client, type, results, images). This enables filtering, sorting, and type-safe access.

4. **React islands for interactivity** — the Brand Mirror quiz needs client-side state. Use React as an Astro island (`client:visible`) rather than making the whole site a React app.

5. **Global CSS over Tailwind** — the CWK brand has a precise, documented design system. Custom CSS variables match 1:1 with the brand spec. No need for utility classes.

6. **TypeScript** — type safety for content schemas, component props, and any interactive logic.

## Relationship to Other Projects

```
houseofcwk/platform (monorepo)
├── projects/cwk-exp-main     → CWK Agent+ Dashboard (React SPA, Vercel)
├── projects/cwk-plos-site    → This project (Astro, Cloudflare Pages)
└── docs/IDENTITY.md          → Shared brand identity source of truth
```

The PLOS website links to the Agent+ Dashboard for authenticated client access but is otherwise a fully independent static site.
