# Site Structure — CWK PLOS Website

> Full sitemap, page specifications, component inventory, and URL mapping.

---

## Sitemap

```
/                           → Homepage (with waitlist + product preview)
/about                      → About Kris (founder story)
/work                       → Portfolio grid (all case studies)
/work/[slug]                → Individual case study pages (8 articles)
/product                    → Agent+ prototype mockup intro page
/brand-mirror               → Brand Mirror diagnostic quiz
/side-quests                → Side quests / experiments
/api/waitlist               → Cloudflare Pages Function (email capture)
/404                        → Custom 404 page
```

### URL Mapping (Old → New)

| Current URL | New URL | Notes |
|-------------|---------|-------|
| `/` | `/` | Homepage — redesigned |
| `/aboutkris` | `/about` | Cleaner URL |
| `/krisjourneyarticle` | `/about` (anchor: `#journey`) | Merged into about page as timeline section |
| `/flexlink` | `/work` | Portfolio renamed to "Work" |
| `/thelabmiamicampusarticle` | `/work/the-lab-miami` | Content Collection slug |
| `/robdialarticle` | `/work/rob-dial` | Content Collection slug |
| `/spraycationmuraltour` | `/work/spraycation` | Content Collection slug |
| `/dawaarticle` | `/work/dawa` | Content Collection slug |
| `/stephyleearticle` | `/work/stephy-lee` | Content Collection slug |
| `/raasininthesunarticle` | `/work/raasin-in-the-sun` | Content Collection slug |
| `/beatstarsarticle` | `/work/pay-the-creators` | Content Collection slug |
| `/lifestapestryarticle` | `/work/lifes-tapestry` | Content Collection slug |
| `/brandmirrorlobby` | `/brand-mirror` | Lobby merged into quiz page |
| `/brandmirror` | `/brand-mirror` | Same page — intro + quiz |
| `/sidequests` | `/side-quests` | Kebab-case URL |

### Redirect Rules (for Cloudflare)

Old URLs should 301-redirect to new ones. Define in `public/_redirects`:

```
/aboutkris                   /about                  301
/krisjourneyarticle          /about#journey          301
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

---

## Page Specifications

### 1. Homepage (`/`)

**Purpose:** Communicate CWK positioning, build trust, drive to Brand Mirror quiz.

**Sections (top to bottom):**

| # | Section | Content | Component |
|---|---------|---------|-----------|
| 1 | **Navigation** | Logo + nav links (Work, About, Brand Mirror CTA) | `Header.astro` |
| 2 | **Hero** | Headline: "CWK. is like a sports agent for entrepreneurs." + subtext + CTA button (Brand Mirror) | `Hero.astro` |
| 3 | **Problem Statement** | "Most entrepreneurs between $150K–$5M are stuck..." — the pain points | `Section` |
| 4 | **What CWK Does** | Infrastructure partner positioning — not consultant, not agency | `Section` |
| 5 | **Four Pillars** | Mind / Body / Soul / Pocket cards with icons and descriptions | `PillarCard.astro` x4 |
| 6 | **Social Proof** | Key metrics from portfolio: "Revenue $1M→$5M", "Content 10x", etc. | `ProofBar.astro` |
| 7 | **Featured Work** | 3–4 featured case study cards with thumbnail, title, type, key results | `CaseStudyCard.astro` |
| 8 | **CTA Section** | "Find Your Bottleneck" → Brand Mirror | `CTABanner.astro` |
| 9 | **Waitlist** | Email capture: "Join the waitlist for Agent+" | `WaitlistForm.tsx` (React Island) |
| 10 | **Product Preview** | "See what's inside Agent+" → `/product` | `CTABanner.astro` |
| 11 | **Footer** | Links, copyright, privacy, CWK branding | `Footer.astro` |

**SEO:**
- Title: `CWK. Experience — The Sports Agent for Entrepreneurs`
- Description: `CWK installs the infrastructure that scales high-performing entrepreneurs. Long-term business management, not consulting.`

---

### 2. About Kris (`/about`)

**Purpose:** Build trust through Kris San's personal story and track record.

**Sections:**

| # | Section | Content |
|---|---------|---------|
| 1 | **Hero** | "My Why." statement with Kris photo |
| 2 | **Mission Statement** | "I exist to help exceptional people turn their creative power into a brand that sets them free." |
| 3 | **Journey Timeline** | 6 chapters: Puerto Rico → Austin (2010) → Waking Up (2015) → Direction (2019) → Building (2019–2025) → In Progress |
| 4 | **Key Engagement Spotlight** | Rob Dial story: videographer → content operations → $1M→$5M → clean exit |
| 5 | **CTA** | "See the work" → `/work` or "Find your bottleneck" → `/brand-mirror` |

**SEO:**
- Title: `About Kris San — Founder, CWK. Experience`
- Description: `From Caguas, Puerto Rico to building scalable operations for entrepreneurs. The story behind CWK.`

---

### 3. Work / Portfolio (`/work`)

**Purpose:** Showcase CWK's body of work with measurable results.

**Sections:**

| # | Section | Content |
|---|---------|---------|
| 1 | **Header** | "Brands Built For The Real World." + "A collection of work bridging education, community, tech, & art." |
| 2 | **Video Tour** | Embedded YouTube tour video (optional hero video) |
| 3 | **Case Study Grid** | 8 cards in responsive grid — thumbnail, title, type, 3 bullet results, "See More" link |
| 4 | **Side Quests Link** | Card linking to `/side-quests` |

**Data source:** Astro Content Collection (`src/content/work/*.md`)

**SEO:**
- Title: `Work — CWK. Experience`
- Description: `Case studies spanning creative founders, podcasts, non-profits, and builder hubs. Real results, real brands.`

---

### 4. Case Study Page (`/work/[slug]`)

**Purpose:** Deep dive into a single project with narrative, media, and results.

**Layout:** `Article.astro`

**Sections:**

| # | Section | Content |
|---|---------|---------|
| 1 | **Hero** | Project title, type, hero image |
| 2 | **Key Results** | 3 bullet results in a highlight bar |
| 3 | **Article Body** | Markdown content — narrative, images, embedded videos |
| 4 | **Next Project** | Link to next case study in sequence |
| 5 | **CTA** | "Ready to build?" → Brand Mirror or contact |

**Content Collection Schema:**

```typescript
const workCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    type: z.string(),                    // "Builder Hub", "Podcast", "Non-Profit", etc.
    thumbnail: z.string(),               // Path to thumbnail image
    heroImage: z.string().optional(),    // Path to hero image
    results: z.array(z.string()),        // ["Sales cycles shortened 20–30%", ...]
    videoUrl: z.string().optional(),     // YouTube embed URL
    order: z.number(),                   // Display order in grid
    featured: z.boolean().default(false),
    publishDate: z.date().optional(),
  }),
});
```

---

### 5. Brand Mirror (`/brand-mirror`)

**Purpose:** Primary lead magnet — free 2-min diagnostic quiz.

**Sections:**

| # | Section | Content |
|---|---------|---------|
| 1 | **Intro** | "The Brand Mirror — See where your brand is leaking in 2 minutes. Free, no email required." |
| 2 | **Quiz (React Island)** | 4-step form with radio options, progress indicator, forward/back navigation |
| 3 | **Results** | Personalized reflection based on answers (client-side logic) |

**Quiz Questions (from current site):**

1. **Emotional state:** Overwhelmed / Frustrated / Exhausted / Skeptical / Ready
2. **Revenue situation:** Volatile / Ceiling-stuck / Underpricing / Low margins / Founder-dependent
3. **Operational infrastructure:** Scattered systems / Manual processes / No compounding IP / Fragile authority / Leaking deals
4. **Team situation:** Solo / VAs can't delegate / Team no systems / Team + messy systems / Ready to scale

**Component:** `BrandMirror.tsx` — React island with `client:visible`

**SEO:**
- Title: `Brand Mirror — Find Your Bottleneck in 2 Minutes | CWK.`
- Description: `Free diagnostic quiz for entrepreneurs. See where your brand infrastructure is leaking. No email required.`

---

### 6. Side Quests (`/side-quests`)

**Purpose:** Showcase range, curiosity, and execution outside core client work.

**Sections:**

| # | Section | Content |
|---|---------|---------|
| 1 | **Intro** | "Side quests are short, self-initiated projects that showcase range, curiosity, and execution outside of core client work." |
| 2 | **Items** | Each with title, year, description, media (video embed or image), links |

**Items:**
- Experiential Content Vending Machine (2025) — video
- Life Lessons of a Creative Entrepreneur Podcast (2021–2022) — image + description
- Keep Austin Voting (2020) — video link + team credits
- Almost Real Things Advisory Board (2021–2023) — link + description

---

### 7. Product — Agent+ Mockup (`/product`)

**Purpose:** Showcase the CWK. Agent+ dashboard features through static prototype mockups. Drives waitlist signups.

**Sections:**

| # | Section | Content | Component |
|---|---------|---------|-----------|
| 1 | **Hero** | "Your Personal Operating System for Growth." + subtext + waitlist CTA | `ProductHero.astro` |
| 2 | **How It Works** | 3-step process: Diagnose → Install → Operate | `Section` |
| 3 | **Feature: Dashboard** | Mockup + description of daily command center | `FeatureShowcase.astro` + `MockDashboard.astro` |
| 4 | **Feature: Relationships** | Mockup + description of contact directory | `FeatureShowcase.astro` + `MockRelationships.astro` |
| 5 | **Feature: Pipeline** | Mockup + description of Kanban board | `FeatureShowcase.astro` + `MockPipeline.astro` |
| 6 | **Feature: Daily Actions** | Mockup + description of task system | `FeatureShowcase.astro` + `MockActions.astro` |
| 7 | **Feature: kaia AI Chat** | Mockup + description of AI assistant | `FeatureShowcase.astro` + `MockKaia.astro` |
| 8 | **Feature: Brand Destination** | Mockup + description of goal sprints | `FeatureShowcase.astro` + `MockDestination.astro` |
| 9 | **Bottom CTA** | Waitlist form (shared component) | `WaitlistForm.tsx` |

**Mockup Approach:** Static HTML/CSS glassmorphic cards (not screenshots). Built as Astro components with the brand design system. Responsive, fast-loading, on-brand.

**SEO:**
- Title: `CWK. Agent+ — The Operating System for Entrepreneurs`
- Description: `See inside the Agent+ dashboard: daily actions, relationship tracking, AI strategy, pipeline management, and goal sprints. Built for founders earning $150K–$5M.`

---

### 8. 404 Page

**Purpose:** Friendly error page that redirects users.

**Content:** CWK branding, "This page doesn't exist" message, links to homepage and work.

---

## Component Inventory

### Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| `Base` | `layouts/Base.astro` | HTML shell — `<head>`, fonts, analytics script, slot for content |
| `Article` | `layouts/Article.astro` | Case study article layout with hero, body, and footer |

### Global Components

| Component | File | Purpose |
|-----------|------|---------|
| `Header` | `components/Header.astro` | Sticky navigation — logo, nav links, Brand Mirror CTA button |
| `Footer` | `components/Footer.astro` | Logo, nav links, social links, copyright, legal links |
| `SEO` | `components/SEO.astro` | `<title>`, meta, OG, Twitter Card, canonical, JSON-LD |

### Section Components

| Component | File | Purpose |
|-----------|------|---------|
| `Hero` | `components/Hero.astro` | Homepage hero — headline, subtext, CTA |
| `PillarCard` | `components/PillarCard.astro` | Mind/Body/Soul/Pocket card with icon and description |
| `ProofBar` | `components/ProofBar.astro` | Horizontal stats row (key metrics) |
| `CaseStudyCard` | `components/CaseStudyCard.astro` | Portfolio card — thumbnail, title, type, results |
| `CTABanner` | `components/CTABanner.astro` | Full-width CTA section with gradient button |
| `TimelineItem` | `components/TimelineItem.astro` | Journey timeline entry for About page |

### Product Page Components

| Component | File | Purpose |
|-----------|------|---------|
| `ProductHero` | `components/ProductHero.astro` | Product page hero with headline and waitlist CTA |
| `FeatureShowcase` | `components/FeatureShowcase.astro` | Alternating text + mockup layout (reusable per feature) |
| `MockDashboard` | `components/mocks/MockDashboard.astro` | Static Player Dashboard preview |
| `MockRelationships` | `components/mocks/MockRelationships.astro` | Static Relationships Directory preview |
| `MockPipeline` | `components/mocks/MockPipeline.astro` | Static Pipeline Kanban preview |
| `MockActions` | `components/mocks/MockActions.astro` | Static Daily Actions preview |
| `MockKaia` | `components/mocks/MockKaia.astro` | Static kaia AI Chat preview |
| `MockDestination` | `components/mocks/MockDestination.astro` | Static Brand Destination preview |

### Interactive Components (React Islands)

| Component | File | Purpose |
|-----------|------|---------|
| `BrandMirror` | `components/BrandMirror.tsx` | Multi-step quiz with state management, results display |
| `WaitlistForm` | `components/WaitlistForm.tsx` | Email capture form with validation, honeypot, success/error states |

---

## Navigation Structure

### Desktop Header

```
[CWK. Logo]          Product    Work    About    [Brand Mirror →]
```

### Mobile Header

```
[CWK. Logo]                          [☰ Menu]
```

Mobile menu slides in with: Product, Work, About, Brand Mirror, Side Quests

### Footer

```
[CWK. Logo]

Product       Work          About          Brand Mirror
Side Quests   Privacy       Terms

© 2026 CWK. LLC — Build. Learn. Earn. Play.
```
