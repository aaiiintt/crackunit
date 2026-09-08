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

## Stage 1, round two: the redline and the pivot to p5 (2026-09-08)

Iain on the six HTML boards (round 1.5): closer, but very ordered, very "html
template". Wanted: a **digital deconstruction** of the post, the video, the
tags and the images, by an agentic observer pulling the post apart and showing
it to the world as freeze frames. The date is the anchor; go bonkers on the
intro slide. Keep showing the source; keep filling a page with stills and the
video's text. Kill the tape metaphor and the timings: posts are not songs.
Use p5.js. Show the Giphy API actually being used. No motion.

Decisions: one carousel, not three looks; each still rendered at three seeds
so the sheet shows real alternatives; type may be pulled apart as an operation
(content, not degradation); the Raytraced order is on hold.

What was built: `otd/lookdev/vendor/p5.min.js` (1.11.3), `page.html`, `lib.js`
(the observer's operations: real pixel interlace, chroma, Bayer dither, pixel
sort, frozen stickers, a wall, textToPoints, the broken-image box), `render.mjs`
extended for sketches, seeds and a grid sheet, and `decon/1.js` to `8.js`:
the date (the nine publish times on a twelve-hour dial, the 9 larger than the
card, a Giphy NOVEMBER sticker), the line (crisp, then rebuilt from 1,069
bullets and 959 × 136 px of space), the source (the file verbatim, its two
links set huge, the missing image as a browser box), the stills wall (24
frames, three crops at 3×, yt-dlp's words as labels), the dead video (the
error text in the empty player, a frozen bird), the tags (23 words sized by
count, stickers on the literal ones), the images (freerice at 2.5× echoed,
three broken boxes), the end. 24 renders in about 15 s.

Learned: Giphy "skype" returns PAW Patrol; "november" gives good pixel text
stickers; filter stickers by `frames` (a 198-frame GIF is slow to decode).
Labels for posts minutes apart collide on the dial; stagger vertically, not
radially. `build-days.mjs` does not surface image alt text; `lib.js` parses it
from `bodyHtml` (Stage 2: add `image.alt` to the day JSON).

## Stage 1, round three: pulling things apart, and the full text (2026-09-08)

Iain on round two: starting to take shape; best where lots of things are
layered; nothing yet truly pulls a video apart; do the same with GIFs; more
size difference, more layers, more repetition; pick the best seeds and evolve
them; and the carousel must also carry the posts' full text, simple and
legible, three or four screens, flowed around material, ending at the link in
bio. His sketch: on this day → date → stills → WAYBACK → text fragments with a
number → source with a GIF → picture → post text nicely formatted → more.

Decisions: all nine posts in order, cut at four screens; Wayback in; the date
monolith stays the cover; up to twelve slides; "text-ments" = sentences pulled
out and repeated with a real number; stickers may follow the day's mood, kept
in a committed library with a catalog; the otd site stays a teaser.

Built: the GIF library (`otd/public/giphy/`, 130 stickers, PAW Patrol pruned,
`manifest.json` with `words`/`mood`/`usedOn`/`keep`, `--restore`,
`giphy-sheet.mjs` → `catalog.png`); `wayback-page.mjs` (CDX nearest within a
year either side, Chrome screenshot, toolbar hidden); lib.js gained a loading
registry, `gifFrames`, `strip`, `scales`, `flowText`, `postsFlow`, `stamp`,
`luma`; twelve sketches. Seeds picked from round two: 1/s2, 2/s1, 3/s2 (now 8),
4/s3, 5/s3 (now 7), 6/s1 (folded into text-ments).

Found: the Wayback snapshot of the Presentation Zen page (2006-04-20) still
carried the PowerPoint logo the archive lost, and the 2006 and 2007 snapshots
had the Hulger phone and the TalkingPoint screengrab. All three are rescued
into `captures/11-09/wayback/rescued-*.jpg` and appear on the stills as
"recovered, web.archive.org". The homepage of 24 November 2005 has the pink
Crackunit.com masthead, now the Wayback slide's big material.

Learned: p5's `loadImage` returns a 1 × 1 placeholder, so `.width` is no
readiness test (a blank GIF slide); every image now goes through `OTD.img()`
and sketches wait on `allLoaded()`. `numFrames()` can be undefined on a GIF p5
did not parse as animated. A CDX nearest-match needs 14-digit timestamps on
both sides. ffmpeg on this Mac has no `drawtext`; the catalog sheet is laid out
by Chrome instead. Headings in the text screens must avoid the obstacles too,
not only the body. 3,810 characters of posts at 36 px is four screens with
material; How Stuff Dates is cut mid-sentence and Post-it and Zoo do not make
it, which the link in bio is for.

## The GIF library, pruned by hand (2026-09-08)

Iain deleted 83 of 135 stickers in the Finder; `fetch-giphy.mjs --sync` marked
them `keep: false` with `prunedBy`/`prunedOn` so they never return. The taste,
now in the skill's Step 8: photographic or drawn objects with edges, period
lettering as an object, the odd one; not vector clip-art, brand promos, text
prompts or blank shapes. Every post-it and every cartoon calendar went; every
rice bowl stayed. The survivors carry a `mood` field in the catalog. Slides 1,
5, 7 and 8 re-rendered from the pruned set without a change to the sketches.
The library is 84 MB, mostly a few long GIFs he kept (the cheetah at 198
frames, the round waterfall at 251).

## Stage 1, round four: Iain's twelve-page redline (2026-09-08)

The redline, from `~/Documents/crackunit-otd-notes.pdf`, and what was done:

1. **Date**: likes 1 and 3, but seeds barely differ; wants significant change
   each render and to see the range. Seeds now pick a **mode** (monolith,
   dial, sticker wall, night on black) before varying within it; five seeds
   rendered per slide so the range is visible.
2. **Line**: bullets made of bullets is fun but illegible and not versatile;
   should have been about • bullets, spaces and formatting. Rebuilt: the
   post's own sentences as a bulleted list beside one sentence alone in
   space; modes: two columns, the list huge and overflowing, the space one.
3. **Text-ments**: too much but OK. Kept.
4. **Stills wall**: liked; big text bigger (96 px), the block sized to fit.
   "The background textures are ace."
5. **GIF**: all good seeds; the middle one unclear; the puma jarring but cool.
   Stickers whose mood is pixel, glitch or type are excluded at frame scale,
   with a fallback so a word never comes back empty.
6. **Wayback**: liked, too much on one screen, no blue border, "cool when you
   zoom in". Now one masthead at 4× cropped, one page at 2×, the recovered
   images, the timestamps; no border; seeds pick the leading page.
7. **Dead video**: close; the filmic bird. Only stickers with mood `photo`.
8. **Source**: "love these"; zoom in closer; seed 3 best. Courier 30, links at
   230 to 310 px cropped harder, the recovered logo larger.
9. **Text screen 1**: "going straight and editorial like this is great".
10. **Text screen 2**: the wrap must be intentional or editorial. Editorial:
    `postsFlow` now places each screen's material itself, at the start of a
    post's body, so the heading sits above and the text wraps round it.
11. Fine. 12. "Why the date again at the end?" A stale sheet; slide 12 is the
    fourth text screen with the link in bio.

Learned: Chrome caps one screenshot at 16384 device px, so a five-seed sheet
wraps at the bottom; `render.mjs` now writes `contact-1.png, contact-2.png`
when a sheet would exceed it. A local `const line` shadows p5's `line()`.

## Stage 1 closed: the look is locked (2026-09-08)

Iain: "I'm pretty happy with everything rn", and left the seed picks to me.
Picked, into `lines.json["11-09"].picks`: 1/s1 the monolith cover, 2/s3 the
space version (the joke without the explanation), 3/s2 the zoo ad's 18,891
views, 4/s1, 5/s1 the puma, 6/s1 the 2005 masthead, 7/s3 and 8/s3 (Iain's
own picks), 9 to 12/s1.

`render.mjs --final` reads those picks and writes the carousel to
`otd/out/carousel/11-09/01..12.png` with a contact strip, in five seconds.
One fix while picking: the Wayback slide's timestamp list collided with the
recovered images, so it sits on its own paper ground.

`ART-DIRECTION.md` v2 is written and the gate in the skill is closed: the
substrate, the type table, every operation with the values the boards used,
the twelve-slide grammar, the sticker taste, the recovered-image rule, the
per-slide gates, and a list of what Stage 1 rejected so it is not tried again.
Stage 2 (capture.mjs, compose.mjs, the recipe library) can start.

## After the lock: three fixes and a thirteenth slide (2026-09-08)

Iain, on the picked carousel: the images relate to the wrong things on the last
four slides, Russell Davies repeats, and there should be a final "come back
tomorrow" slide with crazy GIF embeddings and wild type.

1. **Wrong images.** The text screens placed material by screen, not by post,
   so 2007's freerice sat beside a 2005 post. `materialFor(post)` now gives a
   post its own: its surviving image, the same image recovered from Wayback, a
   frame from its own video, the black box for a video that is gone, or a
   sticker whose word is in that post's text (Technorati gets a geek). Never
   another post's.
2. **The repetition.** `flowText` drew lines as it went and only then reported
   that it had overflowed, so a post that did not fit was drawn twice: once
   partially, once whole. It now takes a `draw` flag and a start word, and
   returns where it stopped, so `postsFlow` measures first and **continues** a
   post on the next screen from the word it reached. Screens fill; nothing
   repeats. Seven of the nine posts now fit, against six before.
3. Also found: p5's `loadJSON` fills its object after `preload` returns, so the
   per-post image loads had to move into its callback. freerice was showing as
   a broken box because of it.
4. **Slide 13, come back tomorrow.** Reads the next date's own day file: for
   11-10, six posts across 2005, 2007 and 2010, led by Sorrell vs. Murdoch and
   Bouncy Balls. `TOMORROW` in Arial Bold caps, three sizes by seed, whole or
   cropped but never illegible; the date inverted through it; the library
   papered on as a tinted wall of frames plus eighteen singles from 70 to
   620 px. Seed 3 picked.
