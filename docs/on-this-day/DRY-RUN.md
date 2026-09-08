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
