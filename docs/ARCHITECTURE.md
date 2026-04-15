# Architecture — CWK PLOS Site

> `cwk-plos-site` · Astro 5 · Cloudflare Pages · houseofcwk.com

> **Note:** The diagrams below were drawn pre-Sanity (when the waitlist ran as
> an Astro API route under `_worker.js` SSR). Current truth:
> - Pages is **pure static** — no `_worker.js`, no Basic Auth middleware.
> - Content pages are built at deploy time from **Sanity**
>   (project `3fsa3jok`, dataset `production`).
> - APIs live in a **single consolidated Cloudflare Worker** at
>   [`workers/api/`](../workers/api/) (`cwk-api-prod`), bound to
>   `api.houseofcwk.com`. Handlers: `POST /waitlist`, `POST /contact`.
> - The `KV: WAITLIST` namespace is reused byte-for-byte; `CONTACTS` +
>   `RATE_LIMIT` KV are bound to the same worker.
>
> The sequence/structure diagrams below still capture the request shape
> correctly, but paths/bindings should be read as
> `api.houseofcwk.com/{waitlist,contact}` rather than `/api/waitlist`.

---

## High-Level System Architecture

```mermaid
graph TB
    subgraph VISITORS["Visitors"]
        Browser["Browser"]
    end

    subgraph CLOUDFLARE["Cloudflare Edge Network"]
        DNS["DNS<br/>houseofcwk.com"]
        WAF["WAF / DDoS"]
        Pages["Cloudflare Pages<br/>project: houseofcwk"]
        Analytics["CF Web Analytics"]

        subgraph WORKER["_worker.js (Astro SSR)"]
            MW["Middleware<br/>Basic Auth Gate"]
            Router["Astro Router"]
            SSR["SSR Pages"]
            API["API Routes<br/>api.houseofcwk.com/{waitlist,contact}"]
        end

        subgraph STORAGE["Cloudflare Storage"]
            KV_WL["KV: WAITLIST<br/>Email → JSON"]
            KV_SS["KV: SESSION"]
        end
    end

    subgraph EXTERNAL["External Services"]
        Resend["Resend API<br/>Transactional Email"]
        GitHub["GitHub Actions<br/>CI/CD"]
    end

    Browser -->|"HTTPS"| DNS
    DNS --> WAF --> Pages
    Pages --> WORKER
    MW -->|"/api/* bypass"| API
    MW -->|"auth check"| Router
    Router --> SSR
    API -->|"KV put/get"| KV_WL
    API -.->|"waitUntil"| Resend
    GitHub -->|"wrangler pages deploy"| Pages
    Pages -.->|"beacon"| Analytics
```

---

## Request Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant CF as Cloudflare Edge
    participant MW as Middleware
    participant R as Astro Router
    participant API as api.houseofcwk.com/{waitlist,contact}
    participant KV as KV Store
    participant RS as Resend

    B->>CF: GET /work
    CF->>MW: Route request
    alt Basic Auth secrets set
        MW->>MW: Validate Authorization header
    end
    MW->>R: Pass to router
    R->>B: SSR HTML response

    Note over B,RS: Waitlist Submission
    B->>CF: POST api.houseofcwk.com/{waitlist,contact} {email}
    CF->>MW: Route request
    MW->>API: /api/* bypass auth
    API->>KV: WAITLIST.get(email)
    alt New email
        API->>KV: WAITLIST.put(email, {joinedAt})
        API-->>RS: waitUntil → sendConfirmation()
        API->>B: 200 {success: true}
    else Already exists
        API->>B: 409 {error: "already_on_list"}
    end
```

---

## Project Structure

```mermaid
graph LR
    subgraph ROOT["cwk-plos-site/"]
        CONFIG["Config<br/>astro.config.mjs<br/>wrangler.toml<br/>tsconfig.json<br/>package.json"]
        PUBLIC["public/<br/>favicon.svg<br/>og-image.svg<br/>robots.txt<br/>_redirects"]
        DOCS["docs/<br/>ARCHITECTURE.md<br/>DEPLOYMENT_GUIDE.md<br/>DESIGN.md<br/>SITE_STRUCTURE.md<br/>WEBSITE_CONTENT.md"]
        CONTENTS["contents/<br/>Markdown source copy"]
        CI[".github/workflows/<br/>deploy.yml"]
    end

    subgraph SRC["src/"]
        LAYOUTS["layouts/<br/>Base.astro<br/>CaseStudy.astro"]
        COMPONENTS["components/<br/>Header · Footer · SEO<br/>WaitlistForm.tsx<br/>WaitlistModal.tsx<br/>BrandMirrorQuiz.tsx"]
        MOCKS["components/mocks/<br/>MockDashboard<br/>MockRelationships<br/>MockPipeline<br/>MockActions<br/>MockKaia<br/>MockDestination"]
        PAGES["pages/<br/>(file-based routing)"]
        STYLES["styles/<br/>global.css"]
        MIDDLEWARE["middleware.ts"]
        SHIMS["shims/<br/>react-dom-server-edge.mjs"]
        API_DIR["pages/api/<br/>waitlist.ts"]
    end

    ROOT --- SRC
    PAGES --- API_DIR
    COMPONENTS --- MOCKS
```

---

## Page & Route Map

```mermaid
graph TD
    subgraph SITE["houseofcwk.com"]
        HOME["/ <br/>Homepage"]
        ABOUT["About"]
        AB_IDX["/about"]
        AB_JRN["/about/journey"]
        WORK["Work"]
        WK_IDX["/work"]
        WK_CS1["/work/the-lab-miami"]
        WK_CS2["/work/rob-dial"]
        WK_CS3["/work/spraycation"]
        WK_CS4["/work/dawa"]
        WK_CS5["/work/stephy-lee"]
        WK_CS6["/work/raasin-in-the-sun"]
        WK_CS7["/work/pay-the-creators"]
        WK_CS8["/work/lifes-tapestry"]
        BM["Brand Mirror"]
        BM_IDX["/brand-mirror"]
        BM_QZ["/brand-mirror/quiz"]
        PRODUCT["/product"]
        SIDEQUESTS["/side-quests"]
        PRIVACY["/privacy"]
        TERMS["/terms"]
        ERR404["/404"]
        API_WL["api.houseofcwk.com/{waitlist,contact}<br/>POST · OPTIONS"]
    end

    HOME --- ABOUT
    ABOUT --- AB_IDX & AB_JRN
    HOME --- WORK
    WORK --- WK_IDX
    WK_IDX --- WK_CS1 & WK_CS2 & WK_CS3 & WK_CS4 & WK_CS5 & WK_CS6 & WK_CS7 & WK_CS8
    HOME --- BM
    BM --- BM_IDX & BM_QZ
    HOME --- PRODUCT & SIDEQUESTS
    HOME --- PRIVACY & TERMS
    HOME --- API_WL
    HOME -.- ERR404
```

### Legacy Redirects (301)

| Old Path | New Path |
|----------|----------|
| `/aboutkris` | `/about` |
| `/krisjourneyarticle` | `/about` |
| `/flexlink` | `/work` |
| `/thelabmiamicampusarticle` | `/work/the-lab-miami` |
| `/robdialarticle` | `/work/rob-dial` |
| `/spraycationmuraltour` | `/work/spraycation` |
| `/dawaarticle` | `/work/dawa` |
| `/stephyleearticle` | `/work/stephy-lee` |
| `/raasininthesunarticle` | `/work/raasin-in-the-sun` |
| `/beatstarsarticle` | `/work/pay-the-creators` |
| `/lifestapestryarticle` | `/work/lifes-tapestry` |
| `/brandmirrorlobby` | `/brand-mirror` |
| `/brandmirror` | `/brand-mirror` |

---

## Component Architecture

```mermaid
graph TD
    subgraph LAYOUTS["Layouts"]
        BASE["Base.astro<br/>HTML shell · head · fonts · analytics"]
        CS_LAYOUT["CaseStudy.astro<br/>Article layout wrapper"]
    end

    subgraph ASTRO_COMP["Astro Components (zero JS)"]
        HEADER["Header.astro<br/>Global nav"]
        FOOTER["Footer.astro<br/>Global footer"]
        SEO["SEO.astro<br/>Meta · OG · Twitter Cards"]
    end

    subgraph REACT_ISLANDS["React Islands (hydrated)"]
        QUIZ["BrandMirrorQuiz.tsx<br/>client:visible"]
        FORM["WaitlistForm.tsx<br/>client:visible"]
        MODAL["WaitlistModal.tsx<br/>client:visible"]
    end

    subgraph MOCK_COMP["Mock Components (static)"]
        M_DASH["MockDashboard"]
        M_REL["MockRelationships"]
        M_PIPE["MockPipeline"]
        M_ACT["MockActions"]
        M_KAIA["MockKaia"]
        M_DEST["MockDestination"]
    end

    BASE --> HEADER & FOOTER & SEO
    CS_LAYOUT --> BASE
    BASE --> REACT_ISLANDS
    BASE --> MOCK_COMP
```

---

## Deployment Resource Map

```mermaid
graph TB
    subgraph GITHUB["GitHub · houseofcwk/cwk-plos-site"]
        REPO["Source Repository"]
        GHA["GitHub Actions<br/>deploy.yml"]
    end

    subgraph BUILD["Build Pipeline"]
        INSTALL["npm ci"]
        CHECK["astro check"]
        BUNDLE["astro build<br/>→ dist/"]
    end

    subgraph CF_ACCOUNT["Cloudflare Account<br/>ID: 1e48d0c..."]
        subgraph CF_PAGES["Cloudflare Pages<br/>project: houseofcwk"]
            PROD_DEPLOY["Production<br/>main branch<br/>houseofcwk.com"]
            PREVIEW_DEPLOY["Preview<br/>PR branches<br/>*.houseofcwk.pages.dev"]
        end

        subgraph CF_KV["Workers KV"]
            KV_WL_PROD["WAITLIST (prod)<br/>c025d8ee..."]
            KV_WL_PREV["WAITLIST (preview)<br/>1ed95845..."]
            KV_SS_PROD["SESSION (prod)<br/>5d2d5155..."]
            KV_SS_PREV["SESSION (preview)<br/>db599f73..."]
        end

        CF_DNS["Cloudflare DNS<br/>houseofcwk.com"]
        CF_WAF["WAF + DDoS Protection"]
        CF_ANA["Web Analytics"]
    end

    subgraph SECRETS["Secrets (Pages Dashboard)"]
        S1["CLOUDFLARE_API_TOKEN<br/>(GitHub Actions)"]
        S2["RESEND_API<br/>(email delivery)"]
        S3["BASIC_AUTH_USER<br/>(optional gate)"]
        S4["BASIC_AUTH_PASS<br/>(optional gate)"]
    end

    subgraph ENV_VARS["Environment Variables"]
        direction LR
        EV_PREV["Preview<br/>ENVIRONMENT=preview<br/>PUBLIC_SITE_URL=*.pages.dev"]
        EV_PROD["Production<br/>ENVIRONMENT=production<br/>PUBLIC_SITE_URL=houseofcwk.com"]
    end

    subgraph EXTERNAL_SVC["External Services"]
        RESEND_SVC["Resend<br/>Transactional Email API"]
        DOMAIN["houseofcwk.com<br/>Custom Domain"]
    end

    REPO -->|"push main"| GHA
    REPO -->|"pull_request"| GHA
    GHA --> INSTALL --> CHECK --> BUNDLE
    BUNDLE -->|"wrangler pages deploy<br/>--branch=main"| PROD_DEPLOY
    BUNDLE -->|"wrangler pages deploy<br/>--branch=$HEAD_REF"| PREVIEW_DEPLOY

    PROD_DEPLOY --> KV_WL_PROD & KV_SS_PROD
    PREVIEW_DEPLOY --> KV_WL_PREV & KV_SS_PREV

    CF_DNS --> CF_WAF --> CF_PAGES
    PROD_DEPLOY -.-> CF_ANA
    PROD_DEPLOY -.-> RESEND_SVC
    CF_DNS --- DOMAIN
```

---

## CI/CD Pipeline

```mermaid
graph LR
    subgraph TRIGGER["Triggers"]
        PUSH["push → main"]
        PR["pull_request → main"]
    end

    subgraph STEPS["Job: deploy"]
        S1["actions/checkout@v4"]
        S2["setup-node@v4<br/>Node 20 + npm cache"]
        S3["npm ci"]
        S4["npm run build<br/>(astro check && astro build)"]
    end

    subgraph DEPLOY["Deploy"]
        D_PROD["wrangler pages deploy dist<br/>--project-name=houseofcwk<br/>--branch=main"]
        D_PREV["wrangler pages deploy dist<br/>--project-name=houseofcwk<br/>--branch=$HEAD_REF"]
    end

    PUSH --> S1 --> S2 --> S3 --> S4
    PR --> S1
    S4 -->|"push to main"| D_PROD
    S4 -->|"pull request"| D_PREV
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Astro 5 | SSR-capable static-first framework |
| **Output mode** | `output: 'server'` | Full SSR via Cloudflare Workers |
| **Adapter** | `@astrojs/cloudflare` | Generates `_worker.js` for Pages |
| **Islands** | React 19 + `@astrojs/react` | Interactive components (quiz, forms) |
| **Sitemap** | `@astrojs/sitemap` | Auto-generated `sitemap-index.xml` |
| **Language** | TypeScript (strict) | Type safety across all source files |
| **Styling** | Scoped CSS + `global.css` variables | Brand design system tokens |
| **Edge runtime** | Cloudflare Pages (Workers) | Global edge deployment |
| **KV storage** | Cloudflare Workers KV | Waitlist emails, sessions |
| **Email** | Resend API | Transactional confirmation emails |
| **CI/CD** | GitHub Actions | Automated build + deploy |
| **DNS / CDN** | Cloudflare | DNS, WAF, DDoS, caching |
| **Analytics** | Cloudflare Web Analytics | Privacy-first, no-cookie analytics |
| **Assets** | Git LFS | Large images tracked via `.gitattributes` |

---

## Runtime Configuration

### Environment Split

| Variable | Preview | Production |
|----------|---------|------------|
| `ENVIRONMENT` | `preview` | `production` |
| `PUBLIC_SITE_URL` | `https://houseofcwk.pages.dev` | `https://houseofcwk.com` |
| `FROM_EMAIL` | `hello@houseofcwk.com` | `hello@houseofcwk.com` |
| `FROM_NAME` | `CWK. Experience` | `CWK. Experience` |
| `REPLY_TO_EMAIL` | `hello@cwkexperience.com` | `hello@cwkexperience.com` |
| `REPLY_TO_NAME` | `Kris San — CWK.` | `Kris San — CWK.` |

### Secrets (set via `wrangler pages secret put`)

| Secret | Purpose |
|--------|---------|
| `RESEND_API` | Resend API key for confirmation emails |
| `BASIC_AUTH_USER` | Optional HTTP Basic Auth username (preview gating) |
| `BASIC_AUTH_PASS` | Optional HTTP Basic Auth password (preview gating) |

---

## Monorepo Context

```mermaid
graph TD
    subgraph PLATFORM["houseofcwk/platform (monorepo)"]
        PLOS["projects/cwk-plos-site<br/>Astro · Cloudflare Pages<br/>houseofcwk.com"]
        EXP["projects/cwk-exp-main<br/>(submodule · read-only)<br/>Agent+ Dashboard · Vercel"]
        GH_CFG[".github/<br/>project-config.json"]
    end

    subgraph BOARD["GitHub Projects Board<br/>houseofcwk/projects/1"]
        ISSUES["Issues & Tasks"]
    end

    PLOS -.->|"links to"| EXP
    PLOS --> BOARD
    GH_CFG --> BOARD
```

The PLOS marketing site is the public-facing presence for CWK. It links to but is architecturally independent from the Agent+ Dashboard application (`cwk-exp-main`), which is a React SPA deployed to Vercel and mounted as a read-only Git submodule in the platform monorepo.
