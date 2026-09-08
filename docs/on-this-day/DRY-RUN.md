# Dry run, 09-08 to 09-12

What happened when the plan met the archive. Kept as a running log; newest at the
bottom of each section. Iain's feedback goes into `ART-DIRECTION.md` and the
`crackunit-new-day` skill, not here.

## What was built (2026-09-08)

- `otd/`: Remotion 4.0.522 project inside this repo (sibling repo later). CSS 3D
  camera and z-planes, not R3F: no glossy element exists yet, so nothing needs
  WebGL. Chromium from Playwright at `/opt/pw-browsers/chromium-1194/…` with
  `Config.setChromeMode('chrome-for-testing')`, because the default headless-shell
  mode is gone from that Chrome build.
- `otd/scripts/build-days.mjs` and `validate-days.mjs`: 366 day files from
  `export/`, permalink-dated, hero scored, copy derived from the other posts that
  day per bible §12. Idempotent. Every permalink checked against
  `export/live-urls.json`. `show-day.mjs MM-DD` prints a day.
- `otd/data/lines.json`, `hero-overrides.json`, `charts.json`: the five days'
  editorial picks, by hand.
- `otd/src/`: five archetypes (A1, A3, A4, A6, A7), three hooks (H1, H2, H4), the
  full beat sheet, cover, synthesised SFX bed (`scripts/make-sfx.mjs`, raw PCM,
  no samples available offline).
- `otd/site/`: Astro, 342 pages in 1.6 s, phone-first on the A7 grid.
- `.claude/skills/crackunit-new-day/SKILL.md`: the per-day procedure.

## Measured

| | |
|---|---|
| Render, 720 frames at 1080×1920, CSS 3D, no loops | 2 m 32 s on a 4-core container |
| Site build, 342 pages | 1.6 s |
| Day JSON, 366 files | about 2 s |
| Days with posts | 340; 31 single-post; 42 with eight or more |

## Round-one stills: what was wrong

Scale, almost entirely. The line rendered at about 15% of frame height against a
40% spec; hooks read as thin type on empty ground at 270 px. H4 showed a Notepad
instead of the dead YouTube player. The page beat did not dolly in far enough to
read. Frame 719 did not match frame 0. The cover, by contrast, worked first time
(date, line, URL, the photo tinted blue). Round-two redline sent; see the commit
after this one.

## Round-two stills: pass, with three redlines for round three

Root cause of round one: the line's arrival animation applied a 0.7 scale that was
still in force on frame 0, and the loop interpolations ended at frame 719 rather
than 720. Fixed with a canvas-measured autofit (220 to 140 px, never truncates),
hook-scale furniture, a deeper page dolly, and loop return to 720. All five hooks
read at 270 px. 09-12's frame 719 is frame 0 with the photo one frame off the top.
Second 09-12 render: 2 m 15 s.

Round three, not blocking the dry run:

1. The line starts at x 0 on 09-12; it should sit at the 48 px safe margin.
2. The page beat dollies past the "crackunit" header; the header is the era
   signal and should stay in frame at the start of the dwell.
3. 09-11's hook window sets the line at 64 px, under the 36 px cap-height minimum
   at thumbnail scale; 96 px fits the window.
4. 09-09's player copy is small at 270 px; the "no longer available" line could be
   the bitmap register at 44 instead of the player's own grey.

## Blocked in this container, works on the Mac

- officialcharts.com, Wikipedia, web.archive.org, i.ytimg.com, vimeo.com are all
  denied by the egress proxy. So: chart picks came from web search and are marked
  `verified: false`; no Wayback captures (H6 unavailable); no YouTube or Vimeo
  thumbnails (H4 bursts the post title through the player instead).
- Fonts: Times New Roman, Arial Bold, Courier New, Impact, Brush Script MT need
  their `.ttf` copied from a Mac into `otd/public/fonts/`. Liberation faces stand
  in. W95FA needs downloading. See `otd/FONTS.md`.
- No generated loops or specimens yet (bible §13). A CSS conic-gradient disc
  stands in for the disco ball in A6.

## Decisions taken during the run

- The track is any single from that week's Top 40, chosen to suit the line. Not
  necessarily the No.1. (Iain, 2026-09-08.)
- Copy is never written. Every furniture line quotes the other posts from that
  date. The first draft had an invented copy bank; it was wrong and is gone.
- Instagram account is Creator. (Iain, 2026-09-07.)
- OS chrome greys are allowed as found material (bible §2 furniture exception).
- The line autoscales 220 to 140 px cap and is never truncated (bible §3).
- Derived day JSON stays out of git; it is regenerated in seconds.

## To do, in order

1. Round-two stills pass the §14 gates; render all five; real covers into the site.
2. Site index rows show the day number as well as the hero title; thumbnails
   resolve only once the site is live (they point at crackunit.com).
3. On the Mac: copy the fonts; run `fetch-charts.mjs` (to be written) for the
   three weeks; fetch the YouTube thumbnail for 09-09; re-render.
4. Generate the first ten loops (bible §13) and drop them in `otd/public/loops/`;
   A6's disco ball is the first to replace.
5. Move `otd/` to the sibling repo `crackunit-otd` once the dry run is posted, so
   crackunit keeps its three dependencies.
6. Write `performance-report.mjs` after the first week of posts.
7. On the Mac, with the Giphy key in `.env`: `fetch-giphy.mjs` for goose, disco
   ball, spinning globe, dial up, windows 98 (stickers), then `npm i
   @remotion/gif@4.0.522` in `otd/` and replace A6's CSS disc with a real GIF.
8. Asset orders: the skill's Step 4b format is live; the first order is the
   crackunit wordmark turning in chrome (bible §13, loop 6).

## Verdict on the Reels, and the pivot (2026-09-08)

Iain: the animations are trashy, slow and laboured, not authentic design from any
time or place. Agreed. The stills worked; the motion did not, and the motion was
where invented material lived. Decision: no Remotion. Each day becomes a 5 to 8
image carousel cut from real archive material, including frames grabbed from the
posts' YouTube videos. And before any pipeline: **Stage 1, art direction**, on
the Mac, because the palette drifted to blue and magenta when seven of the twelve
references sit on white, paper or black. The brief is now "subtle but still crazy;
liminal 90s-to-2020s; HD meets MiniDisc; raytracing meets DV cams". Plan v4 has
the corrected reading of the refs, six candidate looks and the nine look boards
for 11-09. The Remotion tree is removed from `otd/` and lives in history.

## Stage 1, session one on the Mac (2026-09-08)

- Fonts: Mac faces copied (gitignored), VCR OSD Mono and DSEG fetched and
  committed. `otd/lookdev/fonts.css` declares them.
- `frames.mjs 11-09`: the Sueño Latino video (How Stuff Dates) is terminated,
  so the day's planned DV material is an error message. The Post-it Note
  Waterfall clip (480×360, 15 fps, two men in lab coats on a dim conference
  stage) is the camcorder footage instead; the Zoo ad is a flat cream card.
  Default and iOS yt-dlp clients fail; android works.
- `lookdev/render.mjs`: 1080 × 1350 at device scale 2 through Google Chrome,
  labelled contact sheet, about 5 s for six stills.
- Boards: A1 to A3 (Camcorder) and B1 to B3 (MiniDisc) built from real
  material only. Material treatments that now exist as CSS and can be named in
  v2: **pillarbox** (4:3 in a 16:9 black player), **interlace** (odd field
  masked and shifted 3 to 4 px, plus a 50% scanline veil), **chroma bleed** (a
  blurred, saturated copy in `color` blend, shifted 4 to 5 px), **OSD burn**
  (VCR OSD Mono, white, 2 px black edge), **LCD readout** (DSEG7 with the
  ghost `88:88:88` at 8% behind), **label window** (rounded white window on
  concentric groove hairlines), **shutter** (AQUA at 72%), **deboss** (ground-
  coloured type with a dark/light 1 px offset), **spec sheet** (Courier 24 on a
  white sheet, one `mark`).
- Departures from the nine-still table, all forced by the material: A1 and A3
  use Post-it frames, not Sueño Latino; A2's twelve frames are Post-it frames
  under the How Stuff Dates sentence; A3's counter times are the posts' real
  publish times, not invented ones; B2 puts the TOC under the label window
  rather than beside it (the longest title does not fit beside a 600 px
  window at 22 px caps).
- C1 to C3 (Raytraced) are written against `otd/lookdev/assets/room-1996.png`
  and `chrome-sphere.png` and render when the order in `otd/orders/11-09.md`
  is filled. Unfilled at the end of the session.
- Stopped at the gate: Iain reviews `otd/lookdev/out/contact.png`.
