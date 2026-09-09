# otd — on this day

The project that resurfaces the crackunit archive one calendar date at a time.
The plan is `docs/on-this-day/PLAN.md`; the look is `docs/on-this-day/LOOK.md`;
the per-day procedure is the `crackunit-new-day` skill. This file is what is in
the folder, how to run it, and the traps that have already cost time.

## What is here

```
otd/
  scripts/          build-days, validate-days, show-day, frames, wayback-page,
                    fetch-giphy, giphy-sheet, checklist
  data/
    days/           366 derived day files, gitignored, rebuilt in ~2 s
    index.json      derived summary of all days, gitignored
    lines.json      editorial picks: the line, its runner-up, why. Committed.
    treatments/     one plan per day (Part B; does not exist yet)
  lookdev/
    lib.js          the primitives: loading, material ops, type, day facts
    render.mjs      Chrome via playwright-core; serves the repo root; contact sheets
    page.html       host page for a p5 sketch
    fonts.css       @font-face for the faces below
    vendor/p5.min.js  p5 1.11.3, pinned
  public/
    fonts/          the type. Mac system faces are gitignored (see below)
    giphy/          the sticker library, committed, with manifest.json + catalog.png
  captures/         per-day material, gitignored, regenerate with the scripts
  site/             the Astro link-in-bio teaser at otd.crackunit.com
  out/              renders, gitignored
```

## Running things

```bash
cd otd
npm install
npm run days                       # build + validate all 366 day files
node scripts/show-day.mjs 11-09    # what a day contains
node scripts/frames.mjs 11-09      # yt-dlp + ffmpeg: frames, thumbnail, metadata per video
node scripts/wayback-page.mjs 11-09  # crackunit.com as web.archive.org holds it, nearest that date
node scripts/fetch-giphy.mjs "word" --stickers --limit 8   # add to the library
node scripts/giphy-sheet.mjs       # redraw public/giphy/catalog.png
node scripts/fetch-giphy.mjs --sync    # after deleting GIFs by hand, the catalog follows
node lookdev/render.mjs            # render sketches, contact sheet
node lookdev/render.mjs --styles   # Part A: 4 style options × 3 beats → out/styles.png
cd site && npm run build           # the teaser site
```

Everything runs on the Mac, not in a container: it needs the system fonts,
Google Chrome for playwright-core, and network for yt-dlp and web.archive.org.
`.env` at the repo root holds `GIPHY_API_KEY`. Never print or commit it.

## Fonts

`public/fonts/` holds VCR OSD Mono (free), DSEG7 and DSEG14 (OFL), Anton,
Anybody and Silkscreen (OFL) — all committed. The Mac system faces are **copied
locally and gitignored**, because this repo is public and they are proprietary.
On a new machine:

```bash
cd otd && for f in "Times New Roman" "Times New Roman Italic" "Times New Roman Bold" \
  "Arial" "Arial Bold" "Courier New" "Courier New Bold" Impact "Brush Script"; do
  cp "/System/Library/Fonts/Supplemental/$f.ttf" public/fonts/; done
```

## The GIF library

`public/giphy/` is a curated shelf, committed, with `manifest.json` as its
catalog (`words`, `mood`, `usedOn`, `keep`) and `catalog.png` to look at. Iain
pruned it by hand: **photographic or drawn objects with real edges, period
lettering as an object, and the odd one.** Not vector clip-art, brand promos,
text prompts or blank shapes. Fetch eight for a word, expect to keep three.
Deleted GIFs are marked `keep: false` by `--sync` so they are never fetched
again. A sticker is only used when one of its `words` is a word the post itself
uses — its prose, title, alt text or tags (`OTD.ownWords`).

### Choosing what to search for

**Search the object, never the concept.** Lifting words straight out of a post
gives bad results, and this was measured, not guessed:

| query | what came back | keep |
|---|---|---|
| `loop` | bubbles, a recycle arrow, a black square, blood hearts | 0 of 8 |
| `techno` | people dancing at raves, "I ♥ TECHNO" in glitter type | 2 of 8 |
| `bug` | cockroach, beetle, ant, caterpillar, flies | 6 of 8 |
| `german tv` | the ZDF logo, BERLIN lettering, a wooden TV set | 5 of 8 |
| `puppet` | sock puppets, a monkey, a creepy clown | 5 of 8 |

A genre word returns bodies. An abstraction returns nothing. What works is a
**thing you could photograph on a white background** (`turntable`, `vinyl
record`, `cockroach`, `pocket watch`) or a **named institution, brand or
place**, which returns the period graphics that are the best material of all
(`german tv`, `myspace`, `ikea`, `1987`).

So the step is: read the post for the *things* in it, then name each thing as
specifically as it can be named — `mirror ball` not `party`, `Oscar statuette`
not `award`, `TR-909` not `drum machine` — and search that.

**Then tag it back.** The query is associative but the link to the archive has
to stay literal, so `--words` records the post's own words that earned it:

```bash
node scripts/fetch-giphy.mjs turntable "vinyl record" "mirror ball" \
  --stickers --limit 8 --words "techno,records,track,dance music" --for 11-26
```

Now the turntable is in the library *because* the post says "techno", and
`stickersFor` still only fires on a word the post actually used. Without
`--words` a sticker can only ever match a post that says its query verbatim,
which is how 11-26 ended up with nothing usable on the first pass.

## Traps that have already cost time

**The website's URL contract is absolute.** See the repo root `CLAUDE.md`.
Nothing in this folder touches `export/`, `src/` or `vercel.json`, and
`export/live-urls.json` is never regenerated.

**A post's date comes from its `permalink`, not its filename.** WordPress
derived the URL from the publish date and the two do not always agree.
`build-days.mjs` records the file it came from as `sourceFile`.

**p5 fills a loaded object *after* `preload` returns.** `loadJSON` and
`loadImage` hand back an empty object or a 1 × 1 placeholder, so `.width` is no
readiness test and a day's posts are not available in the same tick. Everything
day-dependent is registered inside the day JSON's callback; every image goes
through `OTD.img()` and a sketch waits on `OTD.allLoaded()`.

**p5's `loadJSON` and `loadStrings` hang the sketch when a file is missing.**
They decrement p5's preload counter only on success, so one 404 leaves the page
on "Loading…" forever with no error — which is what a day with no Wayback
capture used to do. Anything optional goes through `OTD.fetchJSON` /
`OTD.fetchText`, which are counted by `OTD.allLoaded()` instead. `loadImage`
and `loadFont` are fine; only use the p5 loaders for files that certainly exist.

**Chrome caps one screenshot at 16384 device pixels.** A tall contact sheet
silently wraps. `render.mjs` splits into `contact-1.png`, `contact-2.png`.

**yt-dlp: the default and iOS players fail on old videos, the android client
works.** `frames.mjs` tries four in order. `yt-dlp -U` refuses when yt-dlp came
from pip; use `pip install -U yt-dlp`. A terminated video writes
`unavailable.txt` — **keep it, the error text is material.**

**The Wayback Machine still holds images the archive lost.** The homepage
usually exists near any date; permalinks often do not, and "no snapshot within a
year" is a normal, useful answer. `web.archive.org/web/<ts>id_/<url>` returns
the original bytes: that is how three lost 2005 images came back. Save them as
`captures/MM-DD/wayback/rescued-<name>` and label them **recovered,
web.archive.org**. That is the only place a lost image may come from.

**ffmpeg on this Mac has no `drawtext`.** Label sheets with Chrome instead.

**`const line` shadows p5's `line()`.** So does `text`. Name locals carefully.

**Astro's content store lives in `node_modules/.astro`**, not `.astro`. To clear
it properly: `rm -rf node_modules/.astro .astro dist`.
