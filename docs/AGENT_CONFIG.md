# Agent config — editing journeys and tools from the Studio

The in-chat agent (Kai) runs three things on our side, all served by the
`cwk-api` worker: a **journey** (the guided Player X-Ray), a **tool** the model
can call mid-answer, and an **ambient context line** injected into every turn.

Until now all three were hardcoded, so changing a question, a tool description
or a CTA link meant a code change plus a `wrangler deploy`. They now read from
the Sanity Studio at runtime. Publishing is the deploy.

---

## Where to edit

[/studio](https://cwkexperience.com/studio) → the three **🤖 Agent** entries at
the bottom of the content list.

| Document | What it controls |
| --- | --- |
| **🤖 Agent · App** | Install identity: workspace, slug, API base, Core API scopes. Singleton. |
| **🤖 Agent · Journeys** | The guided flows. Trigger phrases, steps, archetypes, scoring rules, every line of copy, the result email, the ambient context line. |
| **🤖 Agent · Tools** | The functions Kai can call. Name, description, arguments, response copy. |

Changes go live **within 60 seconds** of publishing (the worker memoises the
config per isolate; see `AGENT_CONFIG_TTL`). Drafts are excluded from the query,
so an in-progress edit cannot reach a visitor before you hit Publish.

---

## The fields that matter most

**`Description` on a tool** is the single highest-leverage field in the system.
It is the *only* thing the model uses to decide whether to call the tool. Write
it as trigger conditions, not as a summary of the return value:

> ✅ "Call this whenever the visitor asks about their player type, their result,
> their archetype, or refers to having taken the X-Ray."
>
> ❌ "Returns the visitor's archetype."

**`Trigger Phrases` on a journey** are matched *before* the model answers, so
each one is a phrase the model no longer has to interpret. They are cheap — add
the paraphrases people actually type.

**`Ambient context line`** is injected into **every turn** of every conversation
once a visitor has a saved result. It is the one field with a recurring token
cost, so keep it tight, and phrase it as instruction ("Personalize naturally
around this. Do not restate it verbatim.") rather than as data to recite.

**Response templates** use `{{token}}` substitution. Available everywhere an
archetype is in scope:

```
{{archetype.name}}        {{archetype.eyebrow}}     {{archetype.tagline}}
{{archetype.happening}}   {{archetype.working}}     {{archetype.mindMine}}
{{archetype.oneMove}}     {{archetype.environment}}
```

Inside the mindset-gap note, `{{raw.*}}` is also available — the archetype the
visitor scored *before* the modifier dropped them.

An unknown or misspelled token renders as an empty string. A typo degrades a
sentence; it never breaks a turn.

---

## ⚠️ Scoring rules

The **Scoring** tab on a journey is editable, and it decides the result every
visitor receives. There is **no test gate on a publish**. Specifically:

- `npm run verify:scoring` proves the engine reproduces the *compiled baseline*
  across all 3125 answer combinations. It runs in `prebuild`.
- It cannot validate a rule you change in the Studio. Nothing can, automatically.

So: change one knob at a time, and check the outcome distribution afterwards.
Sanity keeps full revision history on the document — use it to roll back.

The rule the engine implements:

1. Tally the answer letters from every step with role **"Counts toward archetype"**.
2. Highest count wins. On a tie, the answer to the **tie-break step** wins if it
   is one of the tied letters; otherwise the lowest level wins.
3. If the **level modifier** is on and a step with role **"Feeds the level
   modifier"** reports a level at least *threshold* below the tallied result,
   drop the result by *drop* levels (never below level 1) and append the
   mindset-gap note.

Current values reproduce the original hand-written rule: tie-break `q1` (Soul),
threshold 2, drop 1.

---

## The manifest

The Omazy install manifest is **generated**, not hand-maintained:

```bash
curl -H "Authorization: Bearer $AGENT_ADMIN_TOKEN" \
  https://api.cwkexperience.com/agent/manifest
```

| Query param | Effect |
| --- | --- |
| `?fresh=1` | Bypass the 60s memo — verify a publish immediately |
| `?debug=1` | Add `_source`, `_loadedAt`, and per-flow/tool counts |

`_source` is the field to check when something looks stale:

- `"sanity"` — the Studio is driving the agent.
- `"fallback"` — Sanity was unreachable *or* has no published journeys, and the
  worker is serving the compiled config from `src/data/assessment.ts`. The chat
  still works; it is just not reading your edits.

Paste the output into the Omazy install when you add or rename a tool or flow.
Copy changes need no manifest update — only the shape does (tool names,
arguments, trigger phrases, endpoints).

---

## Setup

**One-time secret** (gates the manifest endpoint):

```bash
cd workers/api
wrangler secret put AGENT_ADMIN_TOKEN --env production
```

**Seed the Studio** so it opens on the copy that is already live rather than
empty forms. Dry-run first:

```bash
npm run seed:agent                                        # dry run
SANITY_WRITE_TOKEN=sk... npm run seed:agent -- --apply    # write
```

The seed content comes from `fallbackConfig()` in
[`workers/api/src/lib/agentConfig.ts`](../workers/api/src/lib/agentConfig.ts),
which is derived from `src/data/assessment.ts` — so the seeded documents
reproduce exactly what the worker serves today.

`--apply` uses `createOrReplace`. Re-running it **overwrites Studio edits** to
those three documents. Seed once; after that, edit in the Studio.

### ⚠️ Never put a dot in a document `_id`

Sanity reads `prefix.id` as a *non-published variant* of `id` — the same
mechanism behind `drafts.` and `versions.`. Anonymous reads only return
published documents, so a dotted `_id`:

- writes successfully and returns a normal commit ack,
- reads back fine **with a token**,
- and is **invisible to the worker**, which reads the CDN anonymously.

The failure is silent in every direction that is easy to check. The seed script
now generates hyphenated ids (`agentFlow-cwk-player-xray`) and verifies the
result with an **anonymous** CDN read, because an authenticated readback sees
documents the agent never will.

If `/agent/manifest?debug=1` reports `"_source": "fallback"` while the Studio
clearly has content, check the document ids first.

---

## Architecture

```
Sanity Studio  ──publish──▶  Sanity apicdn
                                  │
                                  │ GROQ, one request, drafts excluded
                                  ▼
                          lib/agentConfig.ts
                          ├─ memo (60s, per isolate)
                          └─ fallback: src/data/assessment.ts
                                  │
             ┌────────────────────┼────────────────────┐
             ▼                    ▼                    ▼
      handlers/xrayFlow    handlers/xrayTool   handlers/xrayContext
        POST /xray/flow      POST /xray/tool     POST /xray/context
```

The fallback is the load-bearing part: **a Sanity outage degrades editability,
not the live chat.** Same posture as `getSiteSettings()` on the site build.

`lib/agentConfig.ts` normalises Studio documents into the runtime types in
`lib/agentTypes.ts` — filling defaults, coercing missing arrays, and dropping
malformed rows — so a half-filled document can never reach a handler as
`undefined`. A journey with no steps, or a tool with no description, is dropped
rather than served broken.

---

## Adding a new tool

The model-facing half is a Studio change. The data half may not be.

1. **Studio** → 🤖 Agent · Tools → create. Fill in the name, description and
   arguments. Set **Data Handler**.
2. If the tool reads a data source the worker cannot already reach, add a case
   to `handleXrayTool` in
   [`workers/api/src/handlers/xrayTool.ts`](../workers/api/src/handlers/xrayTool.ts)
   and a matching option to the `handler` field's list in
   [`studio-schemas/agentTool.ts`](../studio-schemas/agentTool.ts). This is the
   one part the Studio cannot invent.
3. Fetch `/agent/manifest?fresh=1` and paste it into the Omazy install — a new
   tool changes the manifest shape, so it must be re-registered.

Adding a new **journey** needs no code at all: create the document, fill in the
steps and archetypes, then re-register the manifest for the new flow key.

---

## Known gap: the `/assessment` web page

[`src/pages/assessment.astro`](../src/pages/assessment.astro) — the web version
of the same quiz — still reads `src/data/assessment.ts` at build time. It does
**not** follow Studio edits.

So editing a question in the Studio changes the in-chat journey but not the web
page, and the two drift. Until that is closed, either keep the two in sync by
hand, or treat the Studio as authoritative for chat only.

Closing it means making the page build-time Sanity-driven: a prebuild step that
writes the published journey to a generated JSON, and an overlay in
`assessment.ts` that prefers it. The Sanity → GitHub Actions rebuild webhook
already exists ([sanity-webhook.md](sanity-webhook.md)) — its GROQ filter would
need `agentFlow` added to the document-type list. Note that this also makes
`score()` config-driven, which requires reworking `verify-agent-scoring.mjs`,
since that script currently uses `score()` as its reference implementation.
