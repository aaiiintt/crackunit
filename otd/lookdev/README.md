# lookdev

Stage 1 of on-this-day: the look boards. Nine hand-composed stills for 11-09,
three per primary look, from real material only. No templates, no pipeline.
The brief, the substrate, the six looks and the nine-still table are in
`docs/on-this-day/ART-DIRECTION.md` (Stage 1 notes at the top) and
`docs/on-this-day/PLAN.md` §1.

```
lookdev/
  README.md
  render.mjs           renders every <look>/<n>.html at 1080×1350 (device scale 2) into out/, plus out/contact.png
  camcorder/1.html 2.html 3.html
  minidisc/1.html 2.html 3.html
  raytraced/1.html 2.html 3.html
  fonts.css            @font-face for the substrate's faces (all in ../public/fonts)
  assets/              ordered assets (the raytraced room, the chrome sphere); see ../orders/11-09.md
  out/                 gitignored
```

`render.mjs` serves the **repo root**, so a still references material by
root-absolute path: `/otd/public/fonts/…`, `/otd/captures/11-09/…`,
`/public/wp-content/…`, `/export/posts/…`. A still that needs an ordered asset
declares `<meta name="requires" content="/otd/lookdev/assets/room-1996.png">`
and is skipped, with a note, until the file exists.

```bash
node otd/lookdev/render.mjs              # all stills + contact.png
node otd/lookdev/render.mjs minidisc     # one look
node otd/lookdev/render.mjs camcorder/2  # one still (contact.png still shows everything rendered so far)
```

Fonts, in `otd/public/fonts/` (done 2026-09-08):

- VCR OSD Mono (`VCR_OSD_MONO.ttf`), free, dafont.com/vcr-osd-mono. Committed.
- DSEG7 Classic Regular and Bold, DSEG14 Classic (`DSEG*.ttf`), OFL, github.com/keshikan/DSEG v0.46. Committed.
- Times New Roman (+ Italic, Bold), Arial (+ Bold), Courier New (+ Bold), Impact, Brush Script: copied from
  `/System/Library/Fonts/Supplemental/` and **gitignored** (the repo is public; they are proprietary). Re-copy on a new Mac:
  `cd otd && for f in "Times New Roman" "Times New Roman Italic" "Times New Roman Bold" "Arial" "Arial Bold" "Courier New" "Courier New Bold" Impact "Brush Script"; do cp "/System/Library/Fonts/Supplemental/$f.ttf" public/fonts/; done`

Material for 11-09 the boards need:

- `frames.mjs 11-09` for the three videos. **How Stuff Dates (1odEmDYg4Y4, the
  Sueño Latino video) is terminated**; its error text is the material. Post-it
  Note Waterfall (vz7BcEfuTFc, 480×360, 15 fps, a dim conference stage: the
  camcorder footage of the day) and Zoo Advertising (cvs9kURU79s, 320×240, a
  flat cream card) gave 12 even frames each via the android player client.
- `public/wp-content/uploads/2007/11/freerice.jpg` (the one surviving image).
- `export/posts/2005-11-09-presentation-zen.md` (the raw source).
- A generated empty raytraced room for look C: order it from Iain per the skill's
  Step 8, 2160 × 2700, 1996 POV-Ray/Bryce feel, chequered floor, grey walls, one
  window of light, no people, no text. Plus a chrome sphere on transparent.

Rules for every still: real material only; one accent; nothing degraded but the
material; type HD-crisp; survives at 270 px wide.
