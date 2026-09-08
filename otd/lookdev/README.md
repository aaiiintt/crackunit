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
  fonts -> ../public/fonts
  material -> ../captures/11-09    (frames, screenshots, raw source; gitignored, regenerate with frames.mjs and capture.mjs)
  out/                 gitignored
```

Fonts still to fetch on the Mac, into `otd/public/fonts/`:

- VCR OSD Mono (camcorder on-screen display), free, dafont.com/vcr-osd-mono
- DSEG7 Classic and DSEG14 (LCD segment numerals), free, github.com/keshikan/DSEG
- Times New Roman, Arial Bold, Courier New from `/System/Library/Fonts/Supplemental/`

Material for 11-09 the boards need:

- `frames.mjs 11-09` for the three videos: How Stuff Dates (1odEmDYg4Y4, the
  Sueño Latino video, 1989), Post-it Note Waterfall (vz7BcEfuTFc), Zoo
  Advertising (cvs9kURU79s).
- `public/wp-content/uploads/2007/11/freerice.jpg` (the one surviving image).
- `export/posts/2005-11-09-presentation-zen.md` (the raw source).
- A generated empty raytraced room for look C: order it from Iain per the skill's
  Step 8, 2160 × 2700, 1996 POV-Ray/Bryce feel, chequered floor, grey walls, one
  window of light, no people, no text. Plus a chrome sphere on transparent.

Rules for every still: real material only; one accent; nothing degraded but the
material; type HD-crisp; survives at 270 px wide.
