---
name: crackunit-new-day
description: Make the on-this-day Reel, cover and landing page for one calendar day of the crackunit archive. Use whenever Iain says "new day", "do 09-14", "next day's post", "make tomorrow's", or asks to look at, pick, design, render or log a given date. Also use to log how a posted day performed on Instagram or TikTok. Covers the whole loop from looking at the day's posts to the upload checklist and the performance log.
---

# crackunit-new-day

One day, start to finish. The procedure is the product: every step writes to a file
in `otd/data/` so the next day starts from what the last day learned. Refine this
file whenever a step turns out wrong. Version at the bottom.

Read `docs/on-this-day/ART-DIRECTION.md` (the bible) before the first run in a
session. Sections are cited as `bible §n`. Run everything from the repo root.

Model routing: steps 1, 2 and 5 are taste and belong to Iain or a capable model.
Steps 0, 3, 4, 6, 7, 8 are grunt work for Sonnet. Step 9 is data entry.

## Inputs

A day as `MM-DD`. Nothing else. If the day is empty (26 of 366 are), say so and stop.

## Step 0. Look at the day

```bash
node otd/scripts/build-days.mjs          # idempotent, all days, ~2s
node otd/scripts/show-day.mjs 09-12      # the day's posts, media state, derived copy
```

Read every post that day, all years, in full. Short ones are the good ones. Note:
which posts have a local image, which have a video, which images are dead and on
what host (that becomes the true error copy), the tags, and any sentence that is
strange on its own.

## Step 1. Pick the hero, the line, the hook, the archetype

Write `otd/data/lines.json[MM-DD]` and, if the scored hero is not the pick,
`otd/data/hero-overrides.json[MM-DD]`.

- **Hero**: the post whose line is best. Media is a tiebreak, not the reason.
- **The line**: bible §11. The sentence strangest out of context. Quote exactly.
  Under 90 characters unless it is worth four lines of Times. Two sentences allowed
  when the second pays the first. Never rewrite. Never the boilerplate.
- **Hook**: bible §7. A question wants H2 (dialog with Yes/No). A video wants H4.
  A dead-media day wants A6 with H2. A local hero image wants H1 or H3.
- **Archetype**: bible §6, with the assignment rules at the end of §6. Many posts
  want A3 Cascade or A2 Sticker sheet. Few posts want A1, A4, A7. Never the same
  archetype two days running: check the previous day in `lines.json`.
- Write one sentence of `why`. The next person reads it.

## Step 2. Pick the track

Find the Official Charts week containing the hero's date (the Sunday that starts
it; Friday from July 2015). On the Mac:

```bash
node otd/scripts/fetch-charts.mjs 2007-09-09     # scrapes the Top 40, caches
```

Then choose **any single from that week's Top 40** that suits the line. Not
necessarily the No.1. A crane post over a ballad, a banner-click post over
something that sounds like a ringtone. Write the choice to
`otd/data/charts.json[week].pick` with `pickWhy`. Check it exists in Instagram's
music library before committing to it; if not, pick again. The runner-up goes in
`pickAlt`.

## Step 3. Check the derived copy

`show-day.mjs` prints the copy slots the build derived from the other posts that
day (bible §12). Read them. If a dialog is dull or a tag is wrong, override the
slot in `otd/data/copy-overrides.json[MM-DD]`. Every override must still be a
real quote from the archive. Nothing is written for the video.

## Step 4. Assets for the day

What the day already has:

- Hero image: if `image.state` is `local` or `rescued`, it is in
  `public/wp-content/`. If `dead`, the day has no hero image and the archetype
  must not need one (A6, A3, A4 with a video).
- Video: YouTube thumbnails are fetched at build time; Vimeo needs a manual
  thumbnail in `otd/public/thumbs/MM-DD.jpg` until the Vimeo lookup exists.
- Loops, specimens and GIFs: `otd/data/props.json` and
  `otd/public/giphy/manifest.json` list what exists, with size, fps and loop
  method. Reuse before ordering.
- Wayback capture for H6: `otd/public/wayback/YYYY.png`. If missing for that year,
  H6 is unavailable.

What the day still needs comes from one of two places. Do not fake an asset in
code; a CSS disc is not a disco ball.

**4a. Giphy first, for anything generic.** Giphy's sticker search returns
animated transparent GIFs, which is the crunchy fake-3D register the bible wants.
On the Mac, with `GIPHY_API_KEY` in `.env`:

```bash
node otd/scripts/fetch-giphy.mjs "goose" "disco ball" "spinning globe" --stickers --limit 12
node otd/scripts/fetch-giphy.mjs "windows 98" "dial up" --gifs --limit 8
```

Files land in `otd/public/giphy/<kind>/<query>/<id>.gif` with a manifest. Pick by
eye; note the chosen ids in `lines.json[MM-DD].assets`. GIFs play on the timeline
through `@remotion/gif` (`npm i @remotion/gif@<remotion version>` in `otd/`, same
version as `remotion`). "Powered by GIPHY" appears on the studio card and the site
footer whenever a Giphy asset is used; the manifest tracks that.

**4b. Order it from Iain, for anything specific.** When the design wants an asset
that Giphy cannot supply (the crackunit wordmark turning in chrome, a specimen
that matches the post, a loop in a particular palette), the skill writes an order
and stops until it is filled. Write `otd/orders/MM-DD.md`:

```markdown
# Asset order, 09-12

Draft: out/still/09-12-post.png (the crane frame; the order fills the empty right third)

| # | What | Size | Format | fps | Length | Loop | Key colour | Style, refs |
|---|---|---|---|---|---|---|---|---|
| 1 | Tower crane, low-poly, slowly turning, seen from below | 1024 × 1024 | GIF or PNG sequence, transparent | 12 | 3 s | rotation, 360° | #00FF00 | ref 12's globe; flat-shaded; no sky |
| 2 | "EBOR STREET" as a 3D chrome extrusion, spinning | 1024 × 512 | GIF, transparent | 24 | 2 s | rotation | #00FF00 | Impact-like caps; reflects blue |

Deliver to: otd/public/loops/09-12-01.gif, otd/public/loops/09-12-02.gif
Where it goes: item 1 at plane z −900, right of the line, 45% frame height; item 2 replaces the condensed-italic headline at the top.
```

Rules for an order: one row per asset; every column filled; size in pixels at
the asset's native resolution (1024 square for loops, 2048 long edge for stills,
per bible §13); the key colour so it can be keyed cleanly (`#FF00FF` for anything
green); the loop method so the timeline knows how to play it; a ref number or a
one-line style note; and the exact delivery path. Attach the draft still so the
order can be judged in place. Iain generates with whatever tool suits (Nano
Banana Pro for stills, an image-to-video model for loops, per bible §13) and
drops the files at the delivery paths. Then run `node otd/scripts/catalogue-props.mjs`
(to be written; until then, add the entry to `props.json` by hand) and continue at
Step 5. An unfilled order is a valid stopping point: say what is waiting and why.

## Step 5. Design the motion sequence

The archetype supplies the default beat sheet (bible §8) and camera path (§6).
Most days need nothing more. When a day needs its own timing, write a `sequence`
block in `lines.json[MM-DD]`:

```json
"sequence": {
  "hookFrames": 24,
  "payoff": "layerStack",
  "pageDwell": 180,
  "moves": ["mirrorTile@90", "chromaCycle@120"],
  "loop": "specimen-fall",
  "notes": "the crane enters from the top, exits the bottom of the studio card"
}
```

Only moves from bible §4. Only frame numbers on the 6-frame grid. If a move is
missing from the vocabulary, add it to the bible first, then use it.

## Step 6. Stills

```bash
cd otd
npx remotion still OnThisDay out/still/09-12-hook.png --props='{"day":"09-12"}' --frame=0   --scale=0.25
npx remotion still OnThisDay out/still/09-12-post.png --props='{"day":"09-12"}' --frame=150 --scale=0.25
npx remotion still OnThisDay out/still/09-12-page.png --props='{"day":"09-12"}' --frame=400 --scale=0.25
npx remotion still OnThisDay out/still/09-12-f719.png --props='{"day":"09-12"}' --frame=719 --scale=0.25
npx remotion still Cover     out/cover/09-12.png      --props='{"day":"09-12"}'
```

`--scale=0.25` gives the 270 px thumbnail directly, which is the legibility test.
Compare `-f719` with `-hook`: they must differ by one frame of motion only.

Downscale the hook still to 270 px wide and look at it. If the line cannot be
read, change the line, the size or the archetype. Do not proceed on a still that
fails bible §14.

## Step 7. Render and QA

```bash
cd otd
time npx remotion render OnThisDay out/video/09-12.mp4 --props='{"day":"09-12"}' --concurrency=4
```

Watch it on a phone. Play it three times for the loop seam. Check every gate in
bible §14 (cuts on 6s, one frame between f719 and f0, no flash over 3 per second,
page dwell ≥ 144 frames, sting lands). Write the render time to
`docs/on-this-day/BUDGET.md`.

## Step 8. Site and upload

```bash
cd otd/site && npm run build       # the day page reads otd/data/days/MM-DD.json
```

Upload checklist, kept in `otd/out/checklist/MM-DD.md` by the render:

- Instagram: **Creator account.** Upload the MP4. Choose the cover from
  `out/cover/MM-DD.png`. Add the music from the library: search
  `charts.json[week].pick.instagramSearch`; if missing, `pickAlt`. Caption: the
  line, the year, "link in bio". Set the bio link to the day page.
- TikTok: same file, same cover. TikTok's commercial music rules differ; use its
  library search with the same string, and if the track is unavailable there,
  post with the original SFX only and note it in the log.
- Site: confirm `otd.crackunit.com/MM-DD/` resolves and links every post that day.

## Step 9. Log performance

At 48 hours and at 7 days, write to `otd/data/performance.json[MM-DD]`:

```json
"09-12": {
  "posted": "2026-09-12",
  "ig":     { "h48": { "views": 0, "likes": 0, "shares": 0, "saves": 0, "avgWatchSec": 0, "profileTaps": 0, "linkClicks": 0 },
              "d7":  { } },
  "tiktok": { "h48": { }, "d7": { } },
  "notes": "what stopped thumbs, what didn't"
}
```

Every ten days, run `node otd/scripts/performance-report.mjs`: it groups by hook
type, archetype, line length, track era and post year, and prints what is
winning. Change this skill and the bible in response. That is the loop.

## What not to do

- Do not write copy. Quote the archive.
- Do not bake the track into the render. It gets muted.
- Do not skip the 270 px check. It is the whole thumb-stop.
- Do not add a dependency to the crackunit site. `otd/` has its own `package.json`.
- Do not regenerate `export/live-urls.json`, ever (CLAUDE.md).

## Version

- v0, 2026-09-07. Written during the first dry run (09-08 to 09-12). Steps 2, 4,
  8 and 9 reference scripts that do not exist yet: `fetch-charts.mjs`,
  `props.json`, `otd/site`, `performance-report.mjs`. `show-day.mjs` is written
  in the same dry run. Update this list as they land.
