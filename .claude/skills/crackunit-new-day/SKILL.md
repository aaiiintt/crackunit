---
name: crackunit-new-day
description: Make the on-this-day carousel and landing page for one calendar day of the crackunit archive, or run the Stage 1 art-direction look boards. Use whenever Iain says "new day", "do 11-09", "next day's post", "make tomorrow's", "look boards", "lookdev", or asks to look at, pick, capture, draw, compose, review or log a given date. Also use to log how a posted day performed on Instagram or TikTok. Covers the whole loop from looking at the day's posts to the upload checklist and the performance log.
---

# crackunit-new-day

One day, start to finish, as a 5 to 8 image carousel cut from real archive
material. The procedure is the product: every step writes to a file in `otd/`
so the next day starts from what the last day learned. Refine this file
whenever a step turns out wrong. Version at the bottom.

Read `docs/on-this-day/PLAN.md` (v4) once per session. `ART-DIRECTION.md` is
the spec; its Stage 1 notes at the top are current, its v1 sections below are
retired. Run everything from the repo root, on the Mac (frames, Wayback, charts
and Giphy need the network the cloud container does not have).

**Gate:** while `ART-DIRECTION.md` says Stage 1 is open, only Steps 0 to 3 and
the look-board loop (L1 to L4) run. Steps 4 to 10 wait for the locked look.

Model routing: Steps 1, 4, L2 and L3 are taste and belong to Iain or a capable
model. Steps 0, 2, 3, 5, 8, 9 and L1 are grunt work for Sonnet. Step 10 is data
entry.

## Inputs

A day as `MM-DD`, month first: `11-09` is 9 November, `09-11` is 11
September. Everything downstream uses the same order (day JSON, `lines.json`,
captures, `otd.crackunit.com/MM-DD/`). Say the date in words back to Iain
before doing anything, so a UK reading of the digits is caught early. If the
day is empty (26 of 366 are), say so and stop.

## Step 0. Look at the day

```bash
npm run days --prefix otd            # build + validate all day JSON, idempotent
npm run day --prefix otd -- 11-09    # posts, media state, picks, derived copy
```

Read every post that day, all years, in full. Short ones are the good ones.
Note which posts have a surviving image, which have a video, which images are
gone (that becomes a broken-image box with its alt text), the tags, and any
sentence that is strange on its own.

## Step 1. Pick the line, the runner-up, the hero, and what to grab

Write `otd/data/lines.json[MM-DD]` and, if the scored hero is not the pick,
`otd/data/hero-overrides.json[MM-DD]`.

- **The line**: bible §11. Strangest out of context. Quote exactly. Under 90
  characters unless it earns four lines of Times. Never rewrite, never the
  boilerplate. Also a `runnerUp` from a different post.
- **Hero**: the post whose line is best.
- **Grab**: list the video ids to frame-grab (`grab: ["1odEmDYg4Y4", …]`) and
  the post with the best surviving image (`picture: "/2007/11/09/freericecom/"`).
- One sentence of `why`.

## Step 2. Pick the track

Chart week containing the hero's date (the Sunday that starts it; Friday from
July 2015). `node otd/scripts/fetch-charts.mjs YYYY-MM-DD` (Stage 2; until it
exists, look the week up on officialcharts.com by hand). Choose **any single from
that week's Top 40** that suits the line; write `charts.json[week].pick` with
`pickWhy`, and `pickAlt`. The track is caption text and optional in-app music.

## Step 3. Capture

```bash
node otd/scripts/frames.mjs 11-09          # yt-dlp + ffmpeg: frames, thumbnail, metadata per video
node otd/scripts/wayback-page.mjs 11-09    # crackunit.com as web.archive.org holds it nearest the day, one screenshot per page
node otd/scripts/capture.mjs 11-09         # Stage 2: page renders, crops, raw source
```

Wayback: the homepage usually exists near any date; permalinks often do not
(no snapshot within a year is a normal answer, and is material). Open the page
captures: an image the archive has lost is often still in the snapshot, and
`web.archive.org/web/<ts>id_/<original url>` returns the file. Save it as
`captures/MM-DD/wayback/rescued-<name>` and say "recovered, web.archive.org" on
the still. That is the only place a lost image may come from.

Open `otd/captures/MM-DD/`. Look at the frames. Note the ones with a face, a
title card, a moment, a colour, in `lines.json[MM-DD].frames` by filename.

What `frames.mjs` learned on 11-09: the default and iOS clients 403 or find no
formats; the **android client** works, and the script tries it fourth, so let it
run through. `yt-dlp -U` refuses when yt-dlp came from pip (`pip install -U
yt-dlp` instead). A terminated video writes `unavailable.txt`; keep it, the
error is material. A quick sheet of what came back:
`ffmpeg -pattern_type glob -i 'otd/captures/MM-DD/<slug>/video/<id>/even/*.jpg' -vf scale=240:-1,tile=4x3 sheet.jpg`.

## The look-board loop (Stage 1 only)

- **L1. Build.** The carousel is up to twelve freeze frames: the date as the
  cover, the deconstructions (the line, text-ments, the stills wall, a GIF pulled
  apart, Wayback, the dead video, the source), then the posts in full across up
  to four text screens (Times 36 on 46, flowed round one piece of material each,
  cut at the fourth, ending with the link in bio). From `ART-DIRECTION.md` Stage
  1 notes (the substrate) and this day's captures, hand-compose each still as a p5.js sketch in
  `otd/lookdev/<look>/<n>.js` using the observer's operations in
  `otd/lookdev/lib.js` (see `otd/lookdev/README.md`), and render it with
  `node otd/lookdev/render.mjs` at three seeds into `otd/lookdev/out/` with a
  `contact.png` grid (rows: stills; columns: seeds; last column 270 px). No
  templates, no pipeline. Real material only. One accent. Interlace and blur
  never on type. Stickers from Giphy where a real word names a thing
  (`fetch-giphy.mjs`, Step 8), frozen on one frame, never animated.
- **L2. Review.** Iain looks at `contact.png`. Redlines in text: keep, kill, mix.
- **L3. Iterate.** Round two builds the survivors; round three the one.
- **L4. Lock.** Write `ART-DIRECTION.md` v2: the substrate, the chosen look with
  literal values, the material treatments as named operations, the type spec,
  the slide grammar. Close the gate. Then Stage 2 code.

## Step 4. Draw

The default slide grammar and recipe library are in the bible (post-lock). Most
days need nothing more. When this day wants its own sequence, write
`lines.json[MM-DD].slides`: an ordered list of recipes with pieces and named
operations (cut, multiply, transform, effect, type, place; sequence ops
flipbook, zoom, storyboard, pull, echo). One sentence of `why` per departure.
Only operations from the bible. If a move is missing, add it to the bible first.

## Step 5. Compose

```bash
node otd/scripts/compose.mjs 11-09     # otd/out/carousel/11-09/01..08.png, contact.png, caption.md
```

## Step 6. Gates, per slide

One dominant element, at most three. The line readable at 270 px wide. Date
stamp in its fixed place. Only the substrate's grounds, ink and one accent
outside found material. Every element traceable to a capture, a frame, an image,
the raw source, a web page, or the three set-type slots. Nothing degraded but the
material. At least one multiply or effect op per slide; at least two pulls per
carousel. Slide 1 works alone.

## Step 7. Redline and re-compose

Until Step 6 passes. Iain sees the contact sheet, not the code.

## Step 8. Assets, only if a slide wants what the archive cannot supply

- The GIF library first: `otd/public/giphy/` with `manifest.json` as its catalog
  (`words`, `mood`, `usedOn`, `keep`) and `catalog.png` to look at (`node
  otd/scripts/giphy-sheet.mjs`). Stickers may be chosen for a word in the day's
  text or for its mood; every use is a frozen frame or the GIF pulled into its
  frames, never animation. Add to the library with `node otd/scripts/fetch-giphy.mjs
  "query" --stickers` (key in `.env`); mark junk `keep: false` so it is not
  fetched twice; add the day to `usedOn`. "Powered by GIPHY" on the last slide
  and the site footer when used.
- Order from Iain for anything specific: write `otd/orders/MM-DD.md` (what, size,
  format, fps, length, loop, key colour, style ref, delivery path, the draft
  still). An unfilled order is a valid stopping point.

## Step 9. Site, checklist, upload

```bash
cd otd/site && npm run build            # slide 1 becomes the day's cover
node otd/scripts/checklist.mjs 11-09    # otd/out/checklist/11-09.md
```

Instagram, Creator account: carousel of the slides in order; slide 1 is the
cover; caption from `caption.md`; music from the library if the track is there;
bio link to `otd.crackunit.com/MM-DD/`. TikTok photo mode: same files.

## Step 10. Log performance

48 h and 7 d into `otd/data/performance.json[MM-DD]` (views, likes, shares,
saves, profile taps, link clicks, a line of notes). Every ten days,
`node otd/scripts/performance-report.mjs` groups by look, line length, post year
and whether the day had video frames. Change this skill and the bible in
response. That is the loop.

## What not to do

- Do not write copy. Quote the archive.
- Do not fake an asset in code. A CSS disc is not a disco ball.
- Do not degrade type or a whole slide. Degradation is a property of material.
- Do not tint material to a brand colour. Found colour stays found.
- Do not automate before the look is locked.
- Do not add a dependency to the crackunit site. `otd/` has its own `package.json`.
- Do not regenerate `export/live-urls.json`, ever (CLAUDE.md).

## Version

- v1.3, 2026-09-08 (Mac). Round three: twelve slides with the posts' full text
  on four screens; the GIF library and catalog; `wayback-page.mjs` and the
  rescued-image rule; more layers, sizes and repetition per Iain's redline.
- v1.2, 2026-09-08 (Mac). Round two: the HTML boards read as web templates and
  the tape/track metaphor was rejected (posts are not songs). Stage 1 is now a
  p5.js deconstruction carousel with seeded variants; L1 rewritten.
- v1.1, 2026-09-08 (Mac). Stage 1 in progress: `lookdev/render.mjs` exists
  (serves the repo root; stills declare ordered assets with a `requires` meta
  and are skipped until they arrive). Six of nine boards built; the Raytraced
  three wait on `otd/orders/11-09.md`. Step 3 notes on yt-dlp clients.
- v1, 2026-09-08. Rewritten for carousels and Stage 1 art direction after the
  Remotion dry run (09-08 to 09-12) was judged laboured. Scripts that exist:
  `build-days`, `validate-days`, `show-day`, `checklist`, `fetch-giphy`,
  `frames` (works on the Mac). Scripts that do not yet exist: `capture`,
  `compose`, `fetch-charts`, `performance-report`.
- v0, 2026-09-07. The Remotion version. In git history.
