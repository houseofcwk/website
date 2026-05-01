---
name: cwk-page-edit
description: Standard workflow for editing pages on the CWK website (case studies, about, journey, etc.). Use when the user asks to update copy, swap an image, add/remove a section, change a stat, restructure a body, or apply edits annotated on a screenshot. Triggers: "edit page", "update case study", "let's work on /about", "let's edit /case-studies/<slug>", any annotated screenshot of a page on houseofcwk.com.
---

# CWK page-edit workflow

Every page edit on the CWK website (`houseofcwk/website` repo) follows the same loop. This skill captures it so each new task starts in the right rhythm.

## The loop

1. **File a GitHub issue first** — even for tiny edits.
2. **Convert any new images to WebP** via `magick`.
3. **Apply the edit** — usually by editing `src/data/caseStudies.ts` or the relevant page in `src/pages/`.
4. **Build + spot-check** — `npm run build` and `rg` against `dist/` to verify the rendered HTML.
5. **Commit with `Closes #N`** in the message, push to `main`.
6. **Post a validation-summary comment** on the issue.
7. **If anything still needs Kris's input** (missing assets, ambiguous instructions), post a separate "For Kris" checklist comment with checkbox items.

## Filing the issue

Use `gh issue create --body-file -` with a heredoc so backticks and code blocks survive. Inline `$(cat <<EOF...)` inside double quotes runs backticks through shell expansion and breaks formatting.

```bash
gh issue create --repo houseofcwk/website --title "<page>: <one-line summary>" --body-file - <<'BODY'
## Source
- Notion: ISS-CWK-NS-XX (when supplied)
- Asset folder: `~/htdocs/cwk/resources/Documents/case-study/<NAME>/` (or about-kris, etc.)
- Owner: Mosthofa Imran

## Task
<one paragraph describing the change>

## Image inserts / Body edits / Video changes
<bulleted list, screenshot annotations broken out cleanly>

## Acceptance
- All listed inserts and edits land.
- `npm run build` passes.
- Lightbox / cover-aspect / bullet rules from the standing rules below still apply.
BODY
```

## Image processing

Convert source files to WebP before referencing them. Output goes to `public/images/case-studies/<slug>/` for case studies, or `public/images/<page-key>/` for other pages. Always use `magick` (libheif handles HEIC).

```bash
mkdir -p public/images/case-studies/<slug>
SRC="/Users/imran/htdocs/cwk/resources/Documents/case-study/<NAME>"
DST="public/images/case-studies/<slug>"

# Body / hero images: max 1600 wide
magick "$SRC/<file>.png" -resize '1600x>' -quality 82 "$DST/<name>.webp"

# Gallery thumbnails (when in 2/3-up grid): max 1200 wide
magick "$SRC/<file>.png" -resize '1200x>' -quality 82 "$DST/<name>.webp"

# HEIC (iPhone export)
magick "$SRC/<file>.HEIC" -resize '1600x>' -quality 82 "$DST/<name>.webp"

# Crop with `-crop WxH+X+Y +repage` if the source has a header (e.g. WhatsApp screenshots).
```

For background videos (about-kris page pattern):

```bash
# MP4 (H.264, no audio, faststart)
ffmpeg -y -i "$SRC/loop.mp4" -an -vf "scale=1280:-2" \
  -c:v libx264 -preset slow -crf 28 -movflags +faststart -pix_fmt yuv420p \
  public/videos/<page>/loop.mp4

# WebM (VP9)
ffmpeg -y -i "$SRC/loop.mp4" -an -vf "scale=1280:-2" \
  -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 \
  public/videos/<page>/loop.webm

# Poster frame
ffmpeg -y -ss 0.5 -i "$SRC/loop.mp4" -frames:v 1 -vf "scale=1280:-2" \
  public/videos/<page>/poster.jpg
```

## Editing the data file

Most case-study edits flow through [src/data/caseStudies.ts](../../../src/data/caseStudies.ts). The `body[]` array is Portable Text with these helpers + custom block types:

- `h2('...')`, `h3('...')` — section headings
- `p('...')` — paragraph
- `bullet('...')` — bullet list item (level 1)
- `quote('...', 'Author')` — callout block, tone `quote`
- `yt('https://www.youtube.com/embed/<id>?rel=0', 'Title')` — video embed (also accepts `youtu.be/...` and `/shorts/...` URLs via the helper in [src/lib/portableText.tsx](../../../src/lib/portableText.tsx))
- Image: `{ _type: 'image', src: '/images/...', alt: '...', caption?: '...' }`
- Gallery: `{ _type: 'gallery', columns: 1 | 2 | 3, images: [{ src, alt, caption? }] }`
- Inline link: hand-craft a `_type: 'block'` with `markDefs` and spans referencing the markDef key

Card-level fields driving both the index card AND the page hero cover:

- `cardImage` (path) + `cardImageAlt`
- `cardSurface` (enum from the type)
- `cardAccent` (hex colour)
- `cardStat: { num, label }`
- `tagline?` — optional italic-cyan subtitle under the headline (used on DAWA for the acronym)

Stats grid: `stats: [{ value, label }, ...]` — accepts 3 or 4 tiles cleanly.

## Verifying after build

After `npm run build`, spot-check the rendered HTML. Always grep `dist/<page>/index.html` for the changes:

```bash
echo "=== Stats ==="
rg -o 'csd-stat-(value|label)[^>]*>[^<]+' dist/case-studies/<slug>/index.html
echo "=== Section headings in order ==="
rg -o '<h2[^>]*>[^<]+' dist/case-studies/<slug>/index.html
echo "=== Image references ==="
rg -o '/images/case-studies/<slug>/[a-z0-9-]+\.webp' dist/case-studies/<slug>/index.html | sort -u
echo "=== Videos in order ==="
rg -o '/embed/[A-Za-z0-9_-]+' dist/case-studies/<slug>/index.html
echo "=== Inline links ==="
rg -o 'href="https?://[^"]*"' dist/case-studies/<slug>/index.html | head -10
```

## Commit + close

```bash
git add <changed files> && git commit -m "$(cat <<'EOF'
<page>: <short summary>

<paragraph(s) describing what changed and why>

Closes #N
EOF
)" && git push origin main
```

`Closes #N` auto-closes the issue when pushed to `main`. The Cloudflare Pages workflow runs automatically.

## Validation-summary comment

Always post on the issue after the push lands. Use `gh issue comment N --body-file -` with the same heredoc pattern so backticks survive.

```bash
gh issue comment N --repo houseofcwk/website --body-file - <<'COMMENT'
## Validation Summary

Closed via <commit-sha> on main.

### What shipped
- <bullet per change, plain English>

### Image processing (when relevant)
| Asset | Source | Output | Size |
|---|---|---|---|
| ... | ... | ... | ... |

Total: **X KB across N files** (vs ~Y MB of source).

### Validation
- `npm run build`: 23 pages, 0 errors.
- `dist/<page>/index.html`:
  - <spot-check 1> ✓
  - <spot-check 2> ✓
- Lightbox from #108 picks up new images automatically.
- Cover-image fix from #111 keeps natural aspect ratio.
COMMENT
```

## "For Kris" comment (when user input is needed)

Post a separate comment when the task hits ambiguity or missing assets. Use checkbox items so progress is visible, and group by what's needed.

```bash
gh issue comment N --repo houseofcwk/website --body-file - <<'COMMENT'
## For Kris — missing content + edit suggestions

@mosthofaimran — single checklist for this page.

### 1. Imagery still needed
- [ ] **<asset name>** — context for where it goes; suggested filename `<name>.png` so the conversion pass picks it up automatically.

### 2. Copy / decisions to confirm
- [ ] **<question>** — current default and why; how to override.

### 3. Standing rules I applied automatically
- **CWK-24 (no em dashes in copy):** ...
- **Image lightbox (#108):** every new image is click-to-enlarge.
- **Web-ready imagery:** all source files converted to WebP at q=82.
COMMENT
```

If the imagery section later gets resolved, edit the comment in place via the GH API to mark items `[x]` resolved with a commit reference rather than posting a new comment.

```bash
gh api -X PATCH repos/houseofcwk/website/issues/comments/<id> --field body=@/dev/stdin <<'COMMENT'
... updated body ...
COMMENT
```

## Standing rules to apply automatically

These are global QA gates. Don't ask the user to remind you.

- **CWK-24 — no em dashes in copy.** When copying body content from the original cwkexperience.com article, replace `—` with comma, period, colon, semicolon, parens, or en dash (`–`) per context. The standing rule is in `~/.claude/projects/-Users-imran-htdocs-cwk-projects-website/memory/feedback_no_em_dashes.md`.
- **Image lightbox (#108).** Every body image and hero cover on `/case-studies/<slug>` opens in the lightbox automatically. No extra wiring needed for new images. The journey page has its own scoped `<dialog id="jr-lightbox">` with the same UX.
- **Cover-image aspect ratio (#111).** `.csd-cover-inner img` uses `width: 100%; height: auto; max-height: 85vh; object-fit: contain` — portrait covers render at natural aspect ratio without cropping. Don't reintroduce a forced `aspect-ratio: 16/9`.
- **Single-column gallery (#112).** Use `columns: 1` for galleries when source images have varying aspect ratios or you want them stacked one per row. The `.cs-gallery--cols-1` rule keeps natural aspect inside an 80vh envelope.
- **Reduced motion.** Always honor `@media (prefers-reduced-motion: reduce)` for new animations / video / hover transforms.

## File-rooted references (don't hold these in memory; verify before recommending)

- Layout shell: [src/pages/case-studies/[slug].astro](../../../src/pages/case-studies/[slug].astro)
- Data + helpers: [src/data/caseStudies.ts](../../../src/data/caseStudies.ts)
- Portable Text renderer: [src/lib/portableText.tsx](../../../src/lib/portableText.tsx)
- Sanity schema (caseStudy + blockContent): [studio-schemas/caseStudy.ts](../../../studio-schemas/caseStudy.ts), [studio-schemas/objects/blockContent.ts](../../../studio-schemas/objects/blockContent.ts)
- About page: [src/pages/about/index.astro](../../../src/pages/about/index.astro)
- Journey page: [src/pages/about/journey.astro](../../../src/pages/about/journey.astro)
- Header / Footer / homepage components: [src/components/](../../../src/components/)
- Redirects: [public/_redirects](../../../public/_redirects)

## Things NOT to do

- Don't `git stash` mid-task. The stash/pop cycle has corrupted Astro files in this repo before (truncated trailing tags). Use targeted `Edit` calls instead.
- Don't bypass the issue step. "It's just a one-line edit" still gets an issue + commit reference + validation comment. The trail is the value.
- Don't generate Drive image URLs from the task PDF. The user supplies images by dropping them into `~/htdocs/cwk/resources/Documents/case-study/<NAME>/` — work from the local folder, not the Drive links.
- Don't create new files (CLAUDE.md, README, planning docs) unless the user asks. Keep the work in code + GitHub issue threads.
- Don't add Co-Authored-By or other AI attribution to commits. The repo's git-commit-hygiene hook strips them, but writing them in the first place is friction.
