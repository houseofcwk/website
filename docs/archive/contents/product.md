# Product — CWK. Agent+ Dashboard

> **New route:** `/product`
> **Purpose:** Prototype mockup intro page showcasing the Agent+ platform features.
> **Tone:** Premium, architectural, product-forward. This is the "what you get" page.

---

## Hero

**Eyebrow:** THE PLATFORM

**Headline:**
Your Personal Operating System for Growth.

**Subtext:**
CWK. Agent+ is the command center that manages your career infrastructure across Mind, Body, Soul, and Pocket. One dashboard. Every system. Nothing falls through.

**CTA:**
Join the Waitlist → (scrolls to waitlist or links to `/#waitlist`)

---

## How It Works

**Eyebrow:** HOW IT WORKS

Three steps. One system. Total clarity.

### Step 1: Diagnose
Take the Brand Mirror. See exactly where your infrastructure is leaking: revenue, operations, authority, or team.

### Step 2: Install
Your Brand Guide builds the playbook. Systems get installed. Processes get documented. Nothing stays in your head.

### Step 3: Operate
Log in daily. Execute your actions. Track your relationships. Watch your momentum compound.

---

## Feature Showcase

**Eyebrow:** INSIDE THE DASHBOARD

### Feature 1: Player Dashboard

**Mockup description:** Dark glassmorphic interface showing a greeting ("Good morning, Alex"), Today's Actions panel with task cards tagged by system (codify/create/connect/convert), progress dots, and a streak counter. Sidebar shows relationship stats and pipeline snapshot.

**Headline:** Your daily command center.

**Body:**
Every morning, your dashboard shows exactly what to focus on. Tasks assigned by your Brand Guide, tagged to the four systems, with progress tracking that builds streaks and momentum.

**Key highlights:**
- Time-of-day personalized greeting
- Today's Actions with system tags (codify, create, connect, convert)
- Progress tracking with streak counter
- Pipeline and relationship snapshot at a glance

---

### Feature 2: Relationships Directory

**Mockup description:** Dark interface with a searchable, filterable directory of contacts. Each row shows name, company, tags (client/partner/prospect), and last touchpoint date. Detail panel slides open on click.

**Headline:** Every relationship. One place.

**Body:**
Stop losing track of who you know and when you last spoke to them. The Relationships Directory is your living CRM: searchable, filterable, and built for follow-through.

**Key highlights:**
- Full contact directory with search and filters
- Stage-based organization (Aware → Advocate)
- Last touchpoint tracking with dormancy alerts
- Detail panel with full relationship history

---

### Feature 3: Pipeline Kanban

**Mockup description:** Dark Kanban board with columns: Aware, Exploring, Engaged, Active, Advocate. Glass cards represent deals/contacts, draggable between stages. Summary stats at the top.

**Headline:** Watch deals move, not die.

**Body:**
Your pipeline is not a spreadsheet. It's a visual board that shows where every opportunity sits, what needs attention, and what's about to close.

**Key highlights:**
- Visual Kanban with 5 pipeline stages
- Drag-and-drop deal management
- Stage-level metrics and conversion tracking
- Dormant contact alerts

---

### Feature 4: Daily Actions

**Mockup description:** Clean task interface with today's actions listed as cards. Each card has a title, context ("why this matters"), and a system tag pill. Click to cycle: pending → complete → skipped.

**Headline:** Three actions. Every day. Compounding.

**Body:**
Your Brand Guide assigns your daily actions based on where you are in the PLOS framework. Each task is tagged to a system and explained with context so you know why it matters, not just what to do.

**Key highlights:**
- Daily task cards with context and purpose
- System tags: codify, create, connect, convert
- One-click status cycling
- Completion streaks with milestone badges

---

### Feature 5: kaia AI Chat

**Mockup description:** Dark chat interface with streaming message bubbles. kaia responds with brand-aware guidance, referencing the user's PLOS data. Typing indicator and smooth scroll.

**Headline:** Your AI-powered brand strategist.

**Body:**
kaia is trained on the CWK. framework and your specific data. Ask about your next move, get clarity on a decision, or pressure-test an idea. kaia responds in real time with streaming intelligence.

**Key highlights:**
- Real-time streaming responses
- Grounded in CWK. PLOS methodology
- Context-aware: knows your stage, tasks, and goals
- Available 24/7 inside the dashboard

---

### Feature 6: Brand Destination

**Mockup description:** A goal sprint card showing the active destination name, progress bar at 65%, milestone checklist with earned/pending badges, and a description of the current phase.

**Headline:** 60-120 day goal sprints with real milestones.

**Body:**
Brand Destinations are structured goal sprints designed by your Brand Guide. Each has clear milestones, a progress bar, and badge rewards. You always know where you are and what's next.

**Key highlights:**
- Named goal sprints (60-120 days)
- Visual progress bar with milestone markers
- Badge system for completed milestones
- Clear phase descriptions and next steps

---

## Waitlist CTA (Bottom)

**Eyebrow:** READY?

**Headline:**
This is the infrastructure your business has been missing.

**Subtext:**
CWK. Agent+ is currently in private beta. Join the waitlist to be first in line.

**Form:**
- Email input + "Join the Waitlist →" button
- Same component as homepage waitlist (`WaitlistForm.tsx`)

---

## Implementation Notes

### Page Architecture
- **Route:** `/product` → `src/pages/product.astro`
- **Layout:** `Base.astro`
- **Static page** with no Content Collection dependency
- Feature sections alternate layout: text-left/mockup-right, then text-right/mockup-left
- Each feature mockup is a static glassmorphic card with representative UI elements built in CSS/HTML (not screenshots)

### Mockup Approach
Build each feature preview as a self-contained Astro component with static HTML/CSS that represents the dashboard UI. This ensures:
- Consistent brand design system (glassmorphic cards, correct colors, DM Sans)
- Fast load (no images to optimize, pure CSS)
- Responsive (collapses gracefully on mobile)
- On-brand atmosphere (orbs, noise overlay inherited from layout)

### Components Needed
| Component | File | Type | Purpose |
|-----------|------|------|---------|
| `ProductHero` | `components/ProductHero.astro` | Astro | Hero section with headline and CTA |
| `FeatureShowcase` | `components/FeatureShowcase.astro` | Astro | Alternating text + mockup layout |
| `MockDashboard` | `components/mocks/MockDashboard.astro` | Astro | Static Player Dashboard preview |
| `MockRelationships` | `components/mocks/MockRelationships.astro` | Astro | Static Relationships preview |
| `MockPipeline` | `components/mocks/MockPipeline.astro` | Astro | Static Kanban preview |
| `MockActions` | `components/mocks/MockActions.astro` | Astro | Static Daily Actions preview |
| `MockKaia` | `components/mocks/MockKaia.astro` | Astro | Static AI Chat preview |
| `MockDestination` | `components/mocks/MockDestination.astro` | Astro | Static Brand Destination preview |
| `WaitlistForm` | `components/WaitlistForm.tsx` | React Island | Email capture form (shared with homepage) |
