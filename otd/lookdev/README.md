# lookdev

Stage 1 of on-this-day. Round three (2026-09-08): a **digital deconstruction** of
one day, 11-09, as a carousel of twelve freeze frames, each a hand-composed
p5.js sketch rendered at several seeds: the date, the line, text-ments, the
stills wall, a GIF pulled apart, Wayback, the dead video, the source, then the
posts in full across four text screens that flow around material and end at the
link in bio. The brief, the substrate and the plan
are in `docs/on-this-day/PLAN.md` and `ART-DIRECTION.md` (Stage 1 notes); the
round-two redline and the p5 plan are in `docs/on-this-day/DRY-RUN.md`.
Round one's HTML boards (Camcorder, MiniDisc) are in git history at `489e938`.

```
lookdev/
  README.md
  render.mjs        renders every <look>/<n>.js sketch (or <n>.html page) at 1080×1350, device scale 2, N seeds; out/contact.png grid
  page.html         the host page: fonts.css, vendor/p5.min.js, lib.js, then ?sketch=…&seed=…&day=…
  lib.js            the observer's operations: data, material (pixels only), composition, type
  fonts.css         @font-face for the substrate's faces (../public/fonts)
  vendor/p5.min.js  p5 1.11.3, pinned, committed (a file, not an npm dependency)
  decon/1.js … 12.js the twelve freeze frames for 11-09 (9 to 12 are the text screens; OTD.postsFlow lays the posts out once so every screen agrees on the cut)
  assets/           ordered assets (the raytraced room; on hold, see ../orders/11-09.md)
  out/              gitignored: decon-<n>-s<seed>.png and contact.png
```

```bash
node otd/lookdev/render.mjs                 # every sketch, 3 seeds, then the contact grid
node otd/lookdev/render.mjs decon/4 --seed 7  # one still, one seed
node otd/lookdev/render.mjs --seeds 5       # more variants per still
node otd/lookdev/render.mjs --pick          # seed 1 only: the carousel as it would post
open otd/lookdev/out/contact.png            # rows: stills; columns: seeds at 25%; last column seed 1 at 270 px
```

## Writing a sketch

A sketch is plain p5 (global mode). `preload()` calls `OTD.preload()`, which
loads the day JSON, `lines.json`, the Giphy manifest, the fonts as `loadFont`
(so `textToPoints` works), the capture manifests and every frame, the
surviving image and the terminated video's error text. `draw()` starts with
`OTD.begin()` (seeds `random` and `noise` from `window.SEED`, `noLoop`) and
ends with `OTD.done()`. Frames and stickers load asynchronously; a sketch that
needs them checks `.width` and reschedules `redraw()` until they are there.
Material is served from the repo root by root-absolute path.

The same seed renders the same still. Seeds vary placement, crop, which frame,
which sticker frame, sizes within bounds. They never vary the material.

## The observer's operations (lib.js)

- Loading: every image goes through `img()`, which counts; a sketch begins
  `draw()` with `if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }`
  (p5 hands back a 1 × 1 placeholder until a file arrives, so `.width` is no test).
- Material, pixels only, never type: `interlace(img, shift)`, `chroma(img, dx)`,
  `dither(img)` (ordered Bayer, 1-bit), `sortRows(img, threshold)` (pixel sort),
  `posterize`, `grey`, `frozen(gif, frame)` (a sticker held on one frame),
  `gifFrames(gif, max)` (every frame as its own image), `luma(img)` (to skip
  white stickers on white), `scanlines`, `pixelated(on)`, `pillarbox`, `echo`, `crop`.
- Composition: `wall(images, cols, rows, opts)` fills the card edge to edge;
  `strip(frames, x, y, size, n, dir)` a row or column of frames; `scales(img,
  sizes)` the same image at several widths; `registration()` the grid, faint.
- Type, crisp: `times`, `timesItalic`, `arialCaps`, `courier`, `vcr`, `dseg`,
  `fitLine`, `wrap`, `points(text, font, px, x, y, sampleFactor)` (textToPoints),
  `label` (Arial Bold caps, optional box), `osd` (camcorder burn-in),
  `brokenImage(alt, x, y, w, h)` (the browser's box for an image that is gone),
  `flowText(text, x, y, w, lineH, obstacles)` (wraps around rectangles),
  `postsFlow(k)` (the posts across `POST_SCREENS`), `stamp(n, label)` (a counter).
- Data: `posts`, `hero`, `others`, `line`, `runnerUp`, `years`, `timestamps`,
  `tagsAll`, `sentencesAll`, `images_(post)` (every markdown image with alt and
  whether it exists), `rescuedFor(src)` (the lost image, if Wayback had it),
  `snippets(videoId)` (yt-dlp's words), `wayback()` (page captures),
  `stickers(query)`, `stickerByMood(word)`, `loadSticker`, `sticker`.

## Material for 11-09

- Frames: Post-it Note Waterfall (vz7BcEfuTFc, 480×360, 15 fps) and Zoo
  Advertising (cvs9kURU79s, 320×240), 12 even frames each via `frames.mjs`.
  How Stuff Dates (1odEmDYg4Y4) is terminated; `unavailable.txt` is the material.
- `public/wp-content/uploads/2007/11/freerice.jpg`, the one surviving image;
  three 2005 images gone (alt text parsed from the raw markdown).
- `export/posts/2005-11-09-presentation-zen.md`, the raw source.
- The GIF library, `otd/public/giphy/`: committed, with `manifest.json` as its
  catalog (`words`, `mood`, `usedOn`, `keep`) and `catalog.png` drawn by
  `node otd/scripts/giphy-sheet.mjs`. Add to it with `fetch-giphy.mjs <query>…`;
  rebuild a fresh clone's folder with `fetch-giphy.mjs --restore`.
- Wayback captures, `otd/captures/11-09/wayback/` (gitignored), from
  `node otd/scripts/wayback-page.mjs 11-09`: the homepage and each permalink as
  web.archive.org holds them nearest the day, plus the three lost 2005 images
  rescued by hand from the same snapshots (`rescued-*.jpg`).

## Fonts, in `otd/public/fonts/`

- VCR OSD Mono (`VCR_OSD_MONO.ttf`), free, dafont.com/vcr-osd-mono. Committed.
- DSEG7 Classic Regular and Bold, DSEG14 Classic, OFL, github.com/keshikan/DSEG v0.46. Committed.
- Times New Roman (+ Italic, Bold), Arial (+ Bold), Courier New (+ Bold), Impact, Brush Script: copied from
  `/System/Library/Fonts/Supplemental/` and **gitignored** (the repo is public). Re-copy on a new Mac:
  `cd otd && for f in "Times New Roman" "Times New Roman Italic" "Times New Roman Bold" "Arial" "Arial Bold" "Courier New" "Courier New Bold" Impact "Brush Script"; do cp "/System/Library/Fonts/Supplemental/$f.ttf" public/fonts/; done`

Rules for every still: real material only; one accent; neutral ground; interlace
and blur never on type (pulling type apart is an operation, not degradation);
survives at 270 px wide; the same seed renders the same still.
