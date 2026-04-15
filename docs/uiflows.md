---
title: UI Flows — RFC-101 & RFC-201
audience: Designer (UX/UI)
purpose: Single-source list of every GitHub issue under RFC-101 (PLOS 30-day Bootcamp MVP) and RFC-201 (Brand Destination MVP), with the basic description needed to design screens, components, and the end-to-end user experience flow.
source: github.com/houseofcwk/cwk-plos-site (issues filtered by label `RFC-101` and `RFC-201`)
generated: 2026-04-16
---

# UI Flows — RFC-101 & RFC-201

This document inventories every GitHub issue tagged `RFC-101` and `RFC-201` so the design team can build the UI and full user-experience flow without having to crawl issues individually. Each entry lists the issue number, the title as it appears on GitHub, and a basic description focused on what the designer needs to know (purpose, screens, layout, components, states).

Two epics are covered:

- **RFC-101 — PLOS 30-day Bootcamp MVP** (epic [#27](https://github.com/houseofcwk/cwk-plos-site/issues/27)) — the foundation app: auth, dashboard, daily actions, relationships, generic destinations, notifications, navigation, design system, and deploy. 14 task issues + 1 epic.
- **RFC-201 — Brand Destination MVP on Cloudflare** (epic [#13](https://github.com/houseofcwk/cwk-plos-site/issues/13)) — the visible product layer that *extends* RFC-101: the Airport-themed Brand Destination experience (gates, checkpoints, mind-mines, power-ups, milestones, final boss, MBSP scorecard, timeline). 12 task issues + 1 epic.

RFC-201 builds on top of RFC-101. Where the two overlap (e.g. the Home Dashboard's Destination column), the RFC-201 issue notes how it extends or swaps the RFC-101 baseline.

---

## RFC-101 — PLOS 30-day Bootcamp MVP

### #27 · [RFC-101] Epic — PLOS 30-day Bootcamp MVP (foundation for RFC-201)

The umbrella epic for the 30-day Bootcamp app. Defines the product surface the designer must cover end-to-end: authenticated app shell, sidebar nav, Home dashboard, Daily Actions, Brand Destinations (generic), Relationships, Pipeline, Notifications, dark theme/design system. Every other RFC-101 issue rolls up to this epic. Treat this as the "table of contents" for the entire bootcamp app and the foundation that RFC-201 plugs into.

### #31 · [RFC-101] T-01 Authentication system (email/password, Google OAuth, recovery)

The first surface a new user touches. Design needs: sign-in screen, sign-up screen, "Continue with Google" button placement, forgot-password flow (email entry → check-inbox state → reset-password screen → success), session-expired re-auth modal, and the post-auth redirect into the Home Dashboard. Include error states for invalid credentials, locked accounts, and OAuth failure. Establishes the unauthenticated visual identity (logo lockup, background treatment) that should match the dark design system from T-13.

### #41 · [RFC-101] T-02 Client / Guide mode toggle — role-based UI switching

A single user account can act in two roles: **Client** (the founder using the app on themselves) and **Guide** (a coach viewing/operating on a client's workspace). Design needs: a clear mode-switcher in the top bar or sidebar, a workspace picker visible in Guide mode, role badge so the user always knows which mode they are in, and visual treatment differences (e.g. accent color or banner) for Guide-mode views. Permissions: Guide-mode hides certain personal settings; show the right empty/disabled states.

### #34 · [RFC-101] T-03 Home Dashboard — greeting, 3-column layout, stats

The first screen post-login. Three-column layout at desktop, stacked at ≤900px in this order: **Today's Actions → Relationships → Brand Destination**. Top of page is a greeting header (time-of-day greeting, date, total open-action count). Each column has its own empty state with a "start here" CTA: "You're all caught up. Add one →", "Add your first contact →", "Pick a destination from the library →". Components: `<GreetingHeader>`, `<ActionsColumn>` (top-5 open actions, "see all" link, optimistic check-off), `<RelationshipsColumn>` (Total/Active/Dormant tiles + Aware→Advocate stage progress bars), `<DestinationColumn>` (active destination card with sprint title, days-left, current milestone badge, overall progress bar). Loading skeletons required. The Destination column must be modular — RFC-201 #24 swaps it for the Sovereignty Scorecard variant. Render correctly at 375 / 768 / 1024 / 1280 / 1536.

### #30 · [RFC-101] T-04 Database schema & API layer

Backend foundation — no direct UI. Designer impact: defines the entities and fields that will appear in the UI (users, workspaces, actions, contacts, destinations, milestones, notifications). Use this issue as the data dictionary when designing forms, list columns, and detail screens so field names and constraints (required, max-length, enums) match the API.

### #33 · [RFC-101] T-05 Daily Actions engine — CRUD, ACTION tagging, subtasks

The to-do system that powers the Today's Actions column and the full `/actions` page. Design needs: action list view (today / overdue / upcoming filters), inline create row, action detail panel/modal with title, due date, ACTION tag (e.g. CALL / EMAIL / DRAFT / FOLLOW-UP), notes, subtasks checklist, optional link to a Relationship or Destination. Drag-to-reorder, optimistic check-off (instant strike-through with rollback on error), bulk actions (select multiple → mark done / reschedule / delete). Empty state on /actions: "Nothing today — add an action to get moving." Mobile: single-column with swipe-to-complete.

### #35 · [RFC-101] T-06 Brand Destination framework — templates, milestones, progress

The generic (non-Airport-themed) destination engine that ships in RFC-101 and gets specialized in RFC-201. Design needs: a destination detail page with sprint title, total duration, days-remaining counter, overall progress bar, and a vertical milestone timeline. Each template has a defined set of milestones with a target order; the UI must show locked / unlocked / in-progress / completed states. Provide a "Start this destination" confirmation flow from the library (T-07) and a "Mark milestone reached" interaction. RFC-201 #24 replaces this view for Brand Destinations specifically; this generic version still ships for any non-brand sprints.

### #37 · [RFC-101] T-07 Destination Library — card grid, template browsing

The catalog screen where a user picks a destination template to start. Design needs: responsive card grid (3 cols desktop, 2 tablet, 1 mobile), each card shows template name, short pitch, duration in days, milestone count, and a category tag. Filter rail or chips for category; search input. Card hover/active state; "Start" CTA on each card opens a confirmation modal. Empty/loading skeletons. When a workspace already has an active destination, decide and design the "you have an active destination" state on the card CTA (disabled? swap? confirm-replace?).

### #36 · [RFC-101] T-08 Milestone tracking — 7-state status, badges, timeline

Visual language for milestone progress used inside the destination detail page (T-06) and on the Home Dashboard's destination column. Design needs: a 7-state status system (e.g. *Locked, Available, In Progress, Blocked, Skipped, Reached, Verified* — confirm names with PM) each with its own badge color, icon, and label. Timeline component: vertical list at desktop, horizontal scroll at mobile. State transitions need an animated check/celebrate moment when a milestone moves to Reached.

### #38 · [RFC-101] T-09 Relationships module — contacts, 5-stage engagement

The CRM-lite surface. Design needs: contacts list (`/relationships`) with search, filters by stage (Aware / Explore / Engaged / Active / Advocate), bulk select. Contact detail page with avatar, name, company, channel handles (email, phone, LinkedIn), engagement stage selector (5-stage progress slider with visual current-state), notes/timeline, linked actions and linked destination. Add-contact modal. Stage-change confirmation with optional reason. Drives the Relationships column on Home Dashboard.

### #39 · [RFC-101] T-10 Pipeline view — deal stats, dormant flags, kanban

A kanban-style sales-pipeline screen separate from Relationships. Design needs: column-per-stage kanban board with draggable deal cards (deal title, contact, value, last-touched date, dormant flag if no activity in N days), per-column stat header (count + total value), filter bar (owner, dormant only, value range, date range). Card detail modal/side-panel. Mobile: collapsed columns or stage-tab switcher (kanban doesn't fit small screens — design a dedicated mobile pattern).

### #40 · [RFC-101] T-11 Notifications system — in-app notification center

In-app notifications surfaced through a bell icon in the top bar. Design needs: bell icon with unread badge, dropdown panel anchored to the bell with grouped-by-day notifications (each row: icon, title, snippet, timestamp, mark-read), "see all" link to a full `/notifications` page, mark-all-as-read action, empty state, settings link to choose categories. Toast/snackbar pattern for live in-session notifications. Categories include: action due, milestone reached, contact went dormant, scorecard alert (RFC-201).

### #32 · [RFC-101] T-12 Sidebar navigation — Main + Progress sections

The persistent left-rail navigation that frames the entire app. Design needs: collapsed (icon-only) and expanded (icon + label) states with smooth toggle, two visually distinct sections — **Main** (Home, Actions, Relationships, Pipeline, Destinations) and **Progress** (Scorecard, Timeline, History — these light up once RFC-201 ships). Active state, hover state, badge for unread (Notifications). Workspace switcher at top, user/account menu at bottom. Mobile: full-screen drawer with swipe-to-close. Coordinate with T-02 mode toggle placement.

### #29 · [RFC-101] T-13 Dark theme & design system — tokens, components

The shared design system. Designer-owned. Deliverables: token set (colors, spacing, radii, shadows, typography scale, motion durations & easings) — dark-only for MVP. Type system using DM Sans for UI and Agrandir for hero/display. Component library: buttons (primary/secondary/ghost/destructive + sizes), inputs, selects, checkboxes, radio, toggle, tabs, modal, drawer, toast, badge, card, table, progress bar, skeleton, avatar, tooltip. Define focus states for accessibility, disabled states, and motion guidelines for hover/press/enter/exit. This system underwrites every other RFC-101 and RFC-201 issue.

### #28 · [RFC-101] T-14 Deployment & DevOps — CI/CD, hosting, env config

No direct UI. Designer impact: confirm any environment-specific UI affordances (e.g. a "preview / staging" banner, feature-flag indicator) and the basic-auth gate that wraps the houseofcwk.com staging domain. Make sure brand assets, favicons, OG images, and 404 / 500 / maintenance screens are designed and shipped as part of the deploy pipeline.

---

## RFC-201 — Brand Destination MVP

### #13 · [RFC-201] Epic — Brand Destination MVP on Cloudflare (Workers + D1 + R2)

The umbrella epic for the Brand Destination feature: the visible, themed product that turns the generic destination framework from RFC-101 into the CWK Airport experience. Defines the full vocabulary (gates, checkpoints, mind-mines, power-ups, milestones, final boss, MBSP scorecard, journey timeline) the designer must give visual form to. All other RFC-201 issues roll up here.

### #24 · [RFC-201] Frontend: Brand Destination dashboard (gate selection → arrival)

The flagship UX for RFC-201 — the only screen most users will see. End-to-end flow across five screens:

1. **Gate Selection (empty state)** — shown when no active destination. Hero: "Choose your destination." 5 gate cards laid out as a horizontal flight path (Gate 01 → Gate 05). Each card: number, name, focus, outcome, one-line mission, "Select Gate →" CTA.
2. **Pre-Flight Checklist** — gate header + 3–4 pre-flight checkpoint items + "BOARD THE PLANE →" CTA, enabled only when all pre-flight items are checked.
3. **In-Flight Dashboard** (the main view) — desktop 3-column grid, mobile stacked:
   - **Left rail:** Sovereignty Scorecard — four circular meters (Mind / Body / Soul / Pocket) with Red/Yellow/Green states; polls every 30s.
   - **Center:** tabs for **Checkpoints** (toggle rows, hover shows pillar deltas), **Mind Mines** (encounter/mitigate actions, encounter counts), **Power-Ups** (activate cards, cooldown grayed-out state), **Milestones** (mark-reached + optional proof asset upload via R2 presign), **Final Boss** (description, pass condition, Engage → Resolve CTA).
   - **Right rail:** Timeline — reverse-chronological journey events grouped by day; click to expand payload.
4. **Arrival / Grounded** — full-screen terminal state. Success-green for *arrived*, muted-red for *grounded*. Shows final pillar scores + days from `started_at` to `arrived_at`. CTA: "Start next destination."
5. **History** — list of all past destinations for this workspace with their final outcomes.

Asset upload component: drop-zone → presign → PUT to R2 → finalize → render. Every API call needs both error and loading states. Responsive at 375 / 768 / 1024 / 1280. Full keyboard flow + focus trap inside modals. Behind a `ff_brand_destination` feature flag; ships first as a preview at `/preview/brand-destination` inside cwk-plos-site before porting to Agent+.

### #14 · [RFC-201] D1 schema + migrations for Brand Destination domain

Backend schema. No direct UI. Designer impact: defines the canonical fields/enums for destinations, gates, checkpoints, mind-mines, power-ups, milestones, scorecards, and journey events that will surface in the dashboard (#24). Use as the data dictionary when designing forms, hover states, and detail panels.

### #15 · [RFC-201] brand-destination Worker: bootstrap, auth, workspace scoping, CORS

API plumbing. No direct UI. Designer impact: confirms that everything in the dashboard is **workspace-scoped** — the workspace switcher (RFC-101 T-12) must drive which destination loads. Auth-required states must redirect cleanly through RFC-101 T-01.

### #16 · [RFC-201] Gate content library: Sanity schemas + D1 seed pipeline

Content modeling. Designer impact (significant): every gate, checkpoint, mind-mine, power-up, milestone, and final-boss copy/icon comes from Sanity. Designer needs to: (a) define the visual fields each Sanity schema requires (icon, color, illustration, hero image, etc.) so the schema can include them, (b) provide the seed art/illustrations for the 5 gates and their content, (c) confirm a `isPreFlight: boolean` on `bdCheckpoint` for the Pre-Flight Checklist screen.

### #17 · [RFC-201] API: destination lifecycle (start / board / abandon / arrive)

Drives the state machine the dashboard renders. Designer impact: design the confirmation modals and toasts for each transition — **Start Destination** (from Gate Selection card CTA), **Board the Plane** (from Pre-Flight), **Abandon Destination** (destructive — needs strong confirmation copy + warning about losing progress), **Arrive** (celebratory animation + transition to Arrival screen). Each transition produces a journey event that appears in the Timeline.

### #18 · [RFC-201] API: checkpoint / mind-mine / power-up / milestone state transitions

Drives the toggles, encounter/mitigate buttons, activate buttons, and mark-reached actions on the In-Flight dashboard tabs. Designer impact: design the optimistic-update visuals for each (instant check, instant gray-out for cooldown, instant timeline-row insert) and the rollback/error toast pattern when the API fails. Hover states on checkpoints must reveal the per-pillar deltas that this transition will apply to the scorecard.

### #19 · [RFC-201] API: Final Boss engagement + resolve + arrive gating

The endgame interaction. Designer impact: design the Final Boss card (boss description, pass condition, current state), the **Engage** state (CTA flips to **Resolve**, perhaps with a timer or progress indicator), and the resolve flow (success → triggers Arrival screen; failure → returns to dashboard with feedback). The final boss gates arrival, so the Arrive CTA must communicate that "you must defeat the final boss to arrive."

### #20 · [RFC-201] API: Sovereignty Scorecard compute + pillar rollup (MBSP)

Powers the four circular meters in the left rail of the In-Flight dashboard. Designer impact: design the four pillar meters (Mind, Body, Soul, Pocket — MBSP) with three threshold states (Red / Yellow / Green), define the visual transition between states, design the per-pillar drill-down (tap a meter → see the checkpoints/mind-mines/power-ups contributing to that pillar's score). The scorecard polls every 30s — design the refresh affordance (subtle pulse, last-updated timestamp).

### #21 · [RFC-201] R2 integration: SOP asset uploads with presigned URLs

The proof-upload mechanic on milestones. Designer impact: design the asset-upload component end-to-end — drag-and-drop zone, click-to-pick fallback, file-type/size guidance, upload progress bar, success thumbnail, error state, multi-file handling, and the "view attached proof" affordance on a completed milestone (image preview / video player / file link). Must work for files up to 50 MB.

### #22 · [RFC-201] Journey event log + timeline read API + typed payloads

Powers the right-rail Timeline on the In-Flight dashboard. Designer impact: design a reverse-chronological timeline with day-grouped headers, per-event icons + colors (different visual for checkpoint-hit vs mind-mine-encountered vs power-up-activated vs milestone-reached vs boss-engaged vs scorecard-alert), expand-on-click row to show the typed payload, infinite scroll or "load older" pagination, empty state for new destinations, and a "no recent activity" intermediate state.

### #23 · [RFC-201] Scheduled Worker: scorecard decay, nudges, Gate 05 timer, R2 sweep

Background automation that produces user-visible side effects. Designer impact: design the **scorecard decay** visual (a meter quietly dropping over time + tooltip explaining "your score decays without recent activity"), the **nudge notifications** (in the Notifications center from RFC-101 T-11 and possibly an in-dashboard banner — define copy patterns), and the **Gate 05 timer** (a visible countdown on the Gate 05 dashboard with urgency states as the deadline approaches).

### #25 · [RFC-201] Observability, rate limiting, abuse protection, security review

Mostly backend. Designer impact: design the user-facing rate-limit / abuse messages — a calm "you're moving fast, give us a moment" toast or modal rather than a generic error, and any account-locked / suspicious-activity surface. Make sure error messaging across the app is consistent with the design-system patterns from RFC-101 T-13.

---

## How to use this document

- Each section maps 1:1 to a GitHub issue. Click the issue number to read the full spec, acceptance criteria, and discussion.
- Designers should use this as the **inventory of screens and components to design**. Anything not listed here is out of scope for RFC-101 / RFC-201.
- The expected end-to-end UX flow for a new user touches: T-01 (auth) → T-03 (Home Dashboard empty state) → T-07 (Destination Library) → RFC-201 #24 Gate Selection → Pre-Flight → In-Flight → Arrival, with T-05 (Actions) and T-09 (Relationships) used in parallel throughout, and T-11 Notifications surfacing async events.
- When in doubt about copy, fields, or behaviour, defer to the source GitHub issue — this file is a designer-facing index, not a spec replacement.
