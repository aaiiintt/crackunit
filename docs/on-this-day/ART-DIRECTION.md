# ART-DIRECTION.md, v2

## Status: locked, 2026-09-08. Stage 1 is closed.

v2 is the output of Stage 1: four rounds of look boards for 11-09 (9 November)
on the Mac, redlined by Iain. It replaces v1 (2026-09-07, the blue-and-magenta
Reels bible), which lives in git history at `e8457fb` and before. The brief it
answers: subtle but still crazy; a strange liminal 90s-to-2020s vibe; HD meets
MiniDisc; raytracing meets DV cams; **a digital deconstruction of the post, the
video, the tags and the images, by an agentic observer, shown as freeze frames.**

The reference implementation is `otd/lookdev/`: `lib.js` (the operations),
`decon/1.js` to `12.js` (the twelve slides for 11-09), `render.mjs`. Stage 2
turns those twelve sketches into recipes driven by any day's JSON. Nothing in
this document is aspirational; every value below is one the boards used.

## 1. The substrate

- **Format.** 1080 × 1350, rendered at device scale 2 (2160 × 2700) by Google
  Chrome through playwright-core. Up to **twelve** slides. Slide 1 works alone.
- **Grounds.** `WHITE #FFFFFF`, `PAPER #F1EEE8`, `BLACK #000000`, `SILVER #D9DAD6`.
  Nothing else is a ground.
- **Ink.** Black on light grounds, white on black.
- **Found colour.** Whatever the material carries: the DV frame's yellow, the
  freerice screenshot's greens, the 2005 masthead's pink, a sticker's orange.
  Never corrected, never tinted.
- **One accent per slide,** from `REC #FF1E00`, `HIGHLIGHTER #C8FF00`, `SAFETY
  #FFD400`, `AQUA #7FDBE6`, `LINK #0000EE`. Used for one thing: the dial's
  ticks, the highlighted line, the counter's block, a video id, the
  timestamps. Blue and magenta only when the material brings them.
- **Real material only.** Every pixel and every string traces to the day JSON
  (`bodyText`, `bodyHtml`, `sentences`, tags, categories, timestamps, wpIds),
  a capture (video frames, yt-dlp metadata and errors, Wayback pages), the
  surviving image, the raw source file, or the Giphy catalog. Copy is never
  written. The only furniture words are `on this day`, the date, the URL,
  `link in bio`, `recovered, web.archive.org`, `Powered by GIPHY`.
- **Degradation lives in the material.** Interlace, chroma bleed, scanlines,
  dither, pixelation, cropping, repetition: on frames, stickers, screenshots.
  Never blur or interlace on type. Type may be **pulled apart** as content (a
  list, a space, a huge word cropped by the card), which is an operation, not a
  degradation.
- **Composition.** More layers, more difference in size, more repetition: the
  same thing at 60 px and at 1400 px on one card; a frame twelve times in a
  strip; one thing cropped by the edge. Then, for the text screens, none of
  that: straight and editorial.
- **Readable at 270 px.** The contact sheet carries a 270 px column; the gate
  is that column.
- **Seeds.** A seed first picks a **mode** (a different composition of the same
  material), then varies placement, crop, which frame, which sticker frame and
  sizes within it. The same seed renders the same still. Seeds never vary the
  material. Five seeds for a review, three when iterating, one when posting
  (`lines.json[day].picks`).

## 2. Type

| Register | Face | Size | Use |
|---|---|---|---|
| The line, prose, huge words | Times New Roman | 150 px for the line; 36/46 for post text; 230 to 310 px for a word pulled out; 1500 to 1740 px for the date's number | Set plain, like a 2005 browser default: no tracking, no kerning tricks |
| Labels, headings | Arial Bold, caps | 11 to 18 px, letter-spacing .12 to .14 em; NOV at 150 px | Small caps labels with an optional white box; the text screens' headings under a 1 px rule |
| Metadata, timestamps, source | Courier New | 12 to 30 px; timestamps 26 to 40 px on the dial | The file, the timestamps, the permalinks, the Wayback urls |
| A quoted screen | VCR OSD Mono | 13 to 64 px, white with a 2 px black edge | Camcorder burn-in (`REC ●`, timecodes), the yt-dlp error, a video id |
| An LCD | DSEG7 | as needed | Not used in the locked carousel; kept for a day that has a device |

All faces load from `otd/public/fonts/` through `loadFont`, which is what makes
`textToPoints` and exact `textBounds` available.

## 3. The operations (lib.js), with the values the boards used

Material, pixels only:
- **interlace(img, 3 to 4)**: odd rows copied and shifted, darkened to 82%.
- **chroma(img, 3)**: red shifted right, blue shifted left, luma kept.
- **scanlines(x, y, w, h, alpha 30, period 4)** on a crop at 3×.
- **dither(img)**: ordered 4 × 4 Bayer to 1-bit; a dithered wall under a
  colour wall (`tint(255, 235)`).
- **pixelated(on)**: nearest-neighbour when a 425 px image is shown at 2.5× or
  a 1024 px page at 4×.
- **gifFrames(gif, 12 to 30)**: every frame of a sticker as its own image.
  **frozen(gif, k)**: one frame held. Never animation.
- **luma(img)**: mean brightness of the opaque pixels; below .82 to sit on
  white, above .25 to sit on black.

Composition:
- **wall(images, cols, rows)**: edge to edge, no gutters: 6 × 10 of 4:3 frames,
  12 × 15 dithered, 4 × 8 sticker frames at `tint(255, 90)`.
- **strip(frames, x, y, size, n, dir)**: a row of 24 at 90 px, a column of 12 at
  80 px, a row of 20 at 54 px.
- **scales(img, [60, 140, 320, 700, 1400])**: the same frame at five widths,
  seeded placement, the card crops it.
- **crop(img, …)** then **image()** at 2× to 4×: a masthead's top 260 px at 4×.
- **echo(img, n 3, dx 40 to 90, dy 24, fade .5)** on the surviving image.
- Six crops at 3× (300 to 640 px wide) over a wall, each with `osd` timecode;
  one with `REC ●`.
- The dial: a 12-hour circle (R 420 or 600), a REC tick at each post's publish
  time, the time in Courier beside it; neighbours minutes apart step
  vertically by 62 px.
- **DIFFERENCE** blend where the date's number and the dial cross, so the type
  inverts and stays crisp.

Type:
- **flowText(text, x, y, w, lineH, obstacles)**: greedy wrap, each line cut by
  the rectangles it crosses, 24 px gutter.
- **postsFlow(k)**: every post in date order across up to four screens (Times
  36 on 46, x 60, width 960, bottom at 1180); the layout places one piece of
  material per screen at the start of a post's body (right 420 × 300, left
  460 × 345, right 380 × 380, right 420 × 300) so the heading sits above it;
  whatever does not fit the fourth screen is cut.
- **stamp(n, label)**: a true number in Times 440 on a SAFETY block, its meaning
  in Courier 16 beneath.
- **points(text)**: `textToPoints`; retired from the carousel after round three
  (illegible), kept as an op.
- **label(text, x, y, px, box)**, **osd(text)**, **brokenImage(alt, x, y, w, h)**:
  the browser's box, white with a 1 px rule and the icon, the alt text in Times.
- **highlight across a wrap**: the longest run of whole words in a wrapped
  segment that is a substring of the line, HIGHLIGHTER behind it.

## 4. The carousel grammar (twelve slides)

| # | Slide | Ground | Accent | Modes (by seed) |
|---|---|---|---|---|
| 1 | **The date**, the cover. The day's number larger than the card; the posts' publish times on a twelve-hour dial; the month in Arial caps; the years; a "month" sticker's frames | white or black | REC ticks | monolith (the number echoed in DIFFERENCE), dial (R 600, the number inside), sticker wall, night |
| 2 | **The line**, taken at its word. The hero post's sentences formatted the way the line names | white | one bullet REC | two columns; the list huge and overflowing; the space version |
| 3 | **Text-ments.** Every sentence from every post repeated at nine sizes (22 to 220), some in DIFFERENCE; the tags small in LINK; a true number as a counter | white | SAFETY | which number |
| 4 | **The stills wall.** Every video frame: dithered wall under colour wall, one frame at five scales, a flipbook strip, six crops at 3× with timecodes, yt-dlp's words as labels, two sentences at 96 px in white boxes | white | REC | wall order, which frame, where the text sits |
| 5 | **The GIF, pulled apart.** One sticker chosen for a word in the day, exploded: every frame edge to edge, one frame 20× in a row, one at 1200 px, a column of twelve, its sentence | white | REC dot | which word (puma, waterfall, synth, rice bowl, geek) |
| 6 | **Wayback.** crackunit.com as web.archive.org holds it nearest the day: one masthead at 4× cropped, one page at 2×, the recovered images, the timestamps | paper | LINK | which page leads |
| 7 | **The dead video.** The empty 16:9 player with yt-dlp's exact words, the id, the post's questions, a filmic bird's frames as a strip and one held | black | AQUA | which bird, which frame |
| 8 | **The source, with a GIF.** The hero post's file verbatim in Courier 30, the line highlighted, its links at 230 to 310 px leaving the card, the lost image as the browser's box with the recovered original beside it, a sticker's frames down the margin at four sizes | paper | HIGHLIGHTER | link size, placements |
| 9 to 12 | **The posts.** Every post in date order, headings in Arial caps 16 under a rule, Times 36 on 46, one piece of material per screen placed by the layout (the surviving image, a DV frame, a recovered image, a recovered image), cut at the fourth; the last screen ends `otd.crackunit.com/MM-DD/ · link in bio` and `Powered by GIPHY` | white | none | none; the text screens do not vary |

A day with fewer posts drops text screens; a day with no video drops 4 and 7
(or 7 becomes the missing image); a day with no Wayback snapshot shows the CDX
answer verbatim. The order stays.

## 5. Stickers

The GIF library is `otd/public/giphy/` with `manifest.json` as its catalog
(`words`, `mood`, `usedOn`, `keep`) and `catalog.png` to look at. Iain's taste,
from his hand prune of 2026-09-08: **photographic or drawn objects with real
edges; period lettering as an object; the odd one.** Not vector clip-art, brand
promos, text prompts or blank shapes. A sticker is chosen for a word in the
day's text or for its mood; it appears frozen on one frame or pulled into its
frames, never animated; it may have nothing to do with the post, which is the
point (the puma on Zoo advertising). `Powered by GIPHY` on the last slide.

## 6. Recovered images

An image the archive has lost may come back only from the Wayback Machine:
`wayback-page.mjs` captures the pages; the file itself from
`web.archive.org/web/<ts>id_/<original url>` into
`captures/MM-DD/wayback/rescued-<name>`. It is shown at its real pixels,
labelled `recovered, web.archive.org`. A lost image with no snapshot is the
browser's broken box with its alt text.

## 7. Gates, per slide

Real material only; one accent; a substrate ground; interlace and blur never on
type; readable at 270 px; the same seed renders byte-identical twice; slide 1
works alone; the text screens carry every post in order until the cut and end
with the link in bio.

## 8. What Stage 1 rejected, so it is not tried again

Blue-and-magenta acid grounds. 60 fps Remotion motion. HTML/CSS boards that
read as web templates. The MiniDisc metaphor and any "track / timing / TOC"
artifice: posts are not songs. The camcorder as a look on its own (its
treatments survive as operations). The line rebuilt from `textToPoints`
bullets: fun, illegible. Fake assets in CSS. Invented copy.
