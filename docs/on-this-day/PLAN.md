<!-- v4, approved 2026-09-08. v2 (the Remotion plan) and v3 (carousel rethink) are in git history: `git log -- docs/on-this-day/PLAN.md`. -->

# on-this-day, plan v4: art direction first

## Context

The Remotion Reels were laboured. The carousel rethink (5 to 8 stills cut from the
archive, video frames as material, a zine-maker's operation vocabulary) still
stands as the *format*. But Iain's last note is the real one: the look is wrong
before the pipeline is right, and I was swayed by the loudest refs into a
blue-and-magenta acid palette that most of the references do not have. The brief
now: **subtle but still crazy; a strange liminal 90s-to-2020s vibe; HD meets
MiniDisc; raytracing meets DV cams.** Stage 1 of the project is art direction and
looks, done on the Mac so video frames are available, and nothing is automated
until a look is signed off. First day: 11-09.

## What I got wrong, reading the twelve again

| Ref | Ground | Where the colour comes from | Type | What it is really doing |
|---|---|---|---|---|
| 1 Italika | electric blue | VHS stills of a blonde woman, 1990s Russian TV, chroma bleed | condensed italic + bitmap yellow | A 2020 poster made from 1990s tape. **HD layout over VHS material.** |
| 2 Take Me Higher | rainbow bars | 1970s TV stills, dithered cut-outs | script + Times in a Notepad | Found material carries all the colour |
| 3 SRY MB | **white** | cut-out people, a caution sign | red handwriting, Chinese | Sticker sheet. Quiet ground, loud pieces |
| 4 We're Fucked | blue + halftone | stickers | comic lettering | The one truly acid one |
| 5 CCA | **white** | primary blocks, a crying child | Times, Helvetica Bold, Mac OS X chrome | Restrained. System type, real UI, three primaries |
| 6 Index | **white** | tiny thumbnails only | Times | No colour at all. Refined |
| 7 Fish | cyan gradient | fish, Converse, caution signs | yellow extended caps | Loud, but the fish is a photo |
| 8 Goose | **paper**, scratched | XP Bliss, a goose | lime outlined caps | Physical. Scanned. One acid accent |
| 9 Strelka | **white** | red grid, primary blocks | condensed caps, mono | A system. Calm |
| 10 Splat | **white** | a pixel-mosaic face, a dog photo | Helvetica Bold, script | Magenta and blue as splats only |
| 11 2000 Visions | **white** | a dithered plant, a yellow-haired woman | script, outlined green, Helvetica | Y2K on white with acid accents |
| 12 Starfield | **black** | low-poly disco ball, XP dialogs | bitmap | 1999 CGI. Greys. Retro-render |

So: **seven neutral grounds** (white, paper, black), colour supplied by found
material, **one accent per piece** (red, lime, yellow), system type set with care,
and the crazy coming from *scale and wrongness*: a goose head at 70% of the frame,
a crying child in a QuickTime player, a caution sign as a sticker. Blue and
magenta are accents in three refs and grounds in two. They were never the system.

"HD meets MiniDisc, raytracing meets DV cams" names the actual mechanism in ref 1
and ref 12: a collision of **capture fidelities**. Crisp HD vector type and layout
against material that was captured badly and dated fast: DV interlace, VHS chroma,
webcam noise, 480i, 4:3 inside a modern frame, camcorder OSD, MiniDisc-era product
graphics and LCD readouts, 1996 raytraced chrome and checkerboards. **Liminal** is
the compositional half: a lot of nothing; one thing in the wrong place; dead-hour
light; two decades in the same frame with no explanation.

---

## Phase 0: move to the Mac (unchanged)

Branch `claude/on-this-day-plan-review-nr1p0f`, [PR #4](https://github.com/aaiiintt/crackunit/pull/4).

```bash
cd ~/Code/crackunit && git fetch origin && git checkout claude/on-this-day-plan-review-nr1p0f
brew install ffmpeg yt-dlp
npm ci && npm run build                     # the real site, for captures
cd otd && npm ci                            # after the Remotion cleanup, playwright-core only
cp /System/Library/Fonts/Supplemental/{Times\ New\ Roman,Arial\ Bold,Courier\ New,Impact}.ttf public/fonts/
# .env at the root holds GIPHY_API_KEY
```

First commit on the Mac: this plan into `docs/on-this-day/PLAN.md`, the Remotion
tree removed, the skill rewritten to point at Stage 1.

---

## Stage 1: art direction and looks

Nothing else happens until this is signed off. Output: `ART-DIRECTION.md` v2 with
the locked look and the operations that produce it. Method: name candidate
looks, make real boards from 11-09's real material, put them in front of Iain,
iterate, lock.

### 1.1 The common substrate (true of every candidate)

- **Grounds:** `WHITE #FFFFFF`, `PAPER #F1EEE8`, `BLACK #000000`, `SILVER #D9DAD6`.
  Nothing else is a ground.
- **Ink:** `BLACK` for type on light grounds; `WHITE` on dark.
- **Found colour:** whatever the material carries. A DV frame's orange. XP Bliss.
  The freerice.com screenshot's greens. Never corrected, never tinted to a brand.
- **One accent per slide,** from: `REC #FF1E00`, `HIGHLIGHTER #C8FF00`, `SAFETY
  #FFD400`, `AQUA #7FDBE6` (translucent plastic, MiniDisc era), `LINK #0000EE`.
  Blue and magenta only if the material brought them.
- **Type:** Times New Roman for the line and prose, set immaculately (real
  kerning, real hierarchy); Arial Bold caps at small sizes for labels; Courier
  New for metadata; a bitmap face where a screen is being quoted; plus two
  period display faces per look (below). HD-crisp always. Type is never degraded.
- **Degradation lives in the material only:** interlace comb, chroma bleed, 4:3
  pillarbox, timecode burn, inkjet banding, dither, low-poly. Applied to frames,
  photos, screenshots. Never to type, never to the whole slide.
- **Composition:** one dominant element, at most three, much empty ground. The
  12-column grid, hairline rules. Wrongness by scale (one thing far too big) or
  by placement (one thing where nothing should be), one per slide.
- **Format:** 1080 × 1350, 5 to 8 slides, slide 1 works alone.

### 1.2 Six candidate looks

Each is a mood, a method, and a material treatment. Three are primary because
they answer the brief literally; three are secondary and may lend a move.

**A · Camcorder** (DV cam meets HD). *Primary.*
White ground. Video frames and photos treated as DV: 4:3 pillarboxed inside the
frame, interlace comb on anything that moved, slight chroma bleed, and the
camcorder's own OSD burned in: `REC ●`, `SP`, `0:07:12`, `NOV 9 2005`, battery
glyph, in **VCR OSD Mono** (free) white with a black edge. Over and beside it,
Times at 150 px set perfectly, hairline rules, a small date stamp. The only red is
the REC dot. Liminal: the frame is small and alone in a white field, like a
still someone paused on. Refs 1, 5, 6. Display faces: VCR OSD Mono, Times.

**B · MiniDisc** (product graphics, 1998 to 2003). *Primary.*
Silver or white ground. The layout language of MD and Sony packaging and LCDs:
tiny bold sans labels in caps, engineering hairlines, spec-sheet tables, a
translucent `AQUA` shutter rectangle, LCD-segment numerals (**DSEG7**, free) for
times and dates, a debossed wordmark. The day is a disc: **the nine posts are the
TOC, with track numbers and lengths** (word count as minutes). Screenshots sit in
rounded-rect label windows. Subtle, clinical, and wrong because the "product" is
a blog from 2005. Refs 9, 5, 6. Display faces: DSEG7, Arial Bold caps.

**C · Raytraced** (1996 CGI meets 2024 HD). *Primary.*
Black or a generated 1996 render as ground: an empty raytraced room, chequered
floor, grey walls, one window of light, no people. In it, a DV frame mapped onto
a floating plane with a soft shadow, and a chrome sphere reflecting the freerice
screenshot. Over all of it, the line in Times, flat, crisp, *not* in perspective:
HD type refusing to join the render. Liminal by definition. Refs 12, 11. The
room and the sphere come as assets (an order to Iain, or Giphy/POV-Ray stock).
Display faces: Times, a bitmap face for a single Win95 label at most.

**D · Scanner** (printed in 2005, scanned in 2024). *Secondary.*
Paper ground with grain and a scanner's dust. Screenshots and frames treated as
inkjet printouts: banding, slight skew, a torn edge, tape. Then photographed in
HD. Highlighter as the accent, on the line's origin in a printed paragraph. Refs
8, 3, 10.

**E · Broadcast** (teletext, VHS OSD, 90s TV). *Secondary.*
Black ground, 4:3 safe-area rectangle drawn as a hairline, teletext mosaic type
rebuilt crisp in HD blocks, `PLAY ▶` OSD, a channel-ident emptiness. Colour is
teletext's eight, used one at a time. Refs 12, 1.

**F · Desktop** (the OS at 3 a.m.). *Secondary.*
Plain grey ground, one real Mac OS X Tiger or XP window, empty and enormous, a
screenshot inside it, the dock, icons at 4× so the pixels show, Lucida Grande and
Tahoma re-rendered crisp. Already half-explored and the one most likely to look
laboured; kept only for its window chrome as a device. Refs 5, 12, 2.

### 1.3 The boards

For each primary look, **three hand-composed stills** from 11-09's real material,
no templates, no pipeline: 1080 × 1350 HTML/CSS pages rendered in Chromium,
each a file in `otd/lookdev/<look>/<n>.html`, with a contact sheet. Nine stills,
then a second round on the two that survive, then a third on the one.

| Still | A · Camcorder | B · MiniDisc | C · Raytraced |
|---|---|---|---|
| 1 The line | A small pillarboxed Sueño Latino frame, interlaced, OSD `REC ● NOV 9 2005`, alone in the upper third of a white field. The line in Times 150 px below, ragged left. REC dot is the only colour. | Silver ground. Top-left caps label `ON THIS DAY · 09.11 · 2005`. The line in Times 150 px. Right column: `18:14:42` in DSEG7, `74 MIN`. Hairlines. Aqua shutter behind the date. | Generated empty raytraced room. The line flat in Times 150 px in HD white, centred, ignoring the perspective. One chrome sphere on the floor reflecting freerice.com. |
| 2 The picture | 12 DV frames in a 3 × 4 grid with timecode burn-ins and interlace; white gutters; under it "And the video has aged really really badly too." in Times 40. | The freerice.com screenshot in a rounded label window with MD groove lines; beside it the **TOC**: `01 Talking Point for Orange 2005 03:21` … nine tracks in Arial Bold caps 22 px. | A single DV frame mapped onto a floating plane in the room, soft shadow on the chequerboard, crisp timecode label beside it, "Anyone know what that funny bird sound is?" in Times 96. |
| 3 The others | A black tape label: `TAPE 1` and the eight other titles as an index in VCR OSD Mono with fake counter times; one frame from the Post-it Note Waterfall video, pillarboxed, small. | The source markdown of Presentation Zen as an LCD scroll? No: as a printed spec sheet in Courier with the line highlighted in `AQUA`. | The nine titles as a Win95 Explorer list floating in the room at 3×, pixels showing; nothing else. |

Rules for the boards: real material only (frames, screenshots, the raw source,
the post images; the broken-image box with its alt text where the file is gone);
one accent; nothing degraded but the material; and each still must survive at
270 px wide.

### 1.4 The review loop

1. Sonnet builds the nine stills from the table above and the substrate rules, on
   the Mac, after `capture.mjs`'s frame grab (Stage 2's script, built early in a
   minimal form: yt-dlp + ffmpeg, 12 even frames + scene frames + metadata).
2. Iain looks at the contact sheet, not the code. Redlines in text: what to keep,
   what to kill, what to mix. Round two: six stills. Round three: three.
3. Fable reviews once, at round two, against the brief and the refs.
4. Lock: `ART-DIRECTION.md` v2. It contains: the substrate (1.1), the chosen look
   (or mix) with literal values, the material treatments as named operations
   (interlace, pillarbox, OSD burn, LCD readout, plane-map, chrome-reflect,
   inkjet, tear), the type spec, and the slide grammar those operations produce.
   §2 to §9 of v1 are retired.

Gate: no Stage 2 code until v2 is signed. **Signed 2026-09-08** after four
rounds: the look is the twelve-slide deconstruction in `ART-DIRECTION.md` v2,
built as p5 sketches in `otd/lookdev/decon/`. Stage 1's rounds are logged in
`DRY-RUN.md`.

---

## Stage 2: the carousel pipeline (as planned in v3, implementing the locked look)

Mechanics unchanged from v3, condensed:

- `otd/scripts/capture.mjs MM-DD [--wayback]`: post-page renders and crops from
  the local build; the real image and raw source; per video, yt-dlp metadata +
  ffmpeg frames (even, scene, thumbnail) with timecodes; the YouTube watch page;
  Wayback captures of crackunit.com and the watch page when they exist. Manifest
  per post. `otd/captures/` gitignored.
- `otd/recipes/*.json` + `otd/scripts/compose.mjs MM-DD`: a slide is a recipe of
  pieces with operations (cut, multiply, transform, effect, type, place; sequence
  ops flipbook, zoom, storyboard, pull, echo). The op vocabulary from v3 stays,
  but the *effects* become the locked look's material treatments, not the acid
  set. Renders 1080 × 1350 via Chromium, plus `contact.png` and `caption.md`.
- Site cover from slide 1; checklist for carousels; `.gitignore` for captures.
- Skill v1: look at the day, pick the line and what to grab, capture, draw (choose
  or write recipes), compose, gate, redline, assets (Giphy or order), site and
  upload, log performance. Model routing as before.

Budget: Stage 1 about $6 of Sonnet and $4 of Fable across three rounds; Stage 2
about $12 of Sonnet.

---

## 11-09, the first day (material only; the design waits for Stage 1)

Nine posts, 2005 × 5 and 2007 × 4. One surviving image (freerice.jpg). Three 2005
images gone. Three YouTube videos: How Stuff Dates (1odEmDYg4Y4; a 2007 post
about a 1989 video ageing badly, the DV material of the day), Post-it Note
Waterfall (vz7BcEfuTFc), Zoo Advertising (cvs9kURU79s).

- Line: "Bill has bullets, Steve has space." (Presentation Zen, 2005).
  Runner-up: "Anyone know what that funny bird sound is?" (How Stuff Dates, 2007).
- Hero: Presentation Zen. Grab: all three videos.
- Track: week of Sunday 6 November 2005, picked on the Mac.

## Verification

```bash
# Stage 1, on the Mac
node otd/scripts/capture.mjs 11-09 --frames-only     # minimal: frames + metadata for the three videos
open otd/lookdev/contact.png                          # nine stills at 25%; the gate is Iain's eye
# each still: real material only · one accent · nothing degraded but the material · readable at 270 px

# Stage 2, after ART-DIRECTION v2 is signed
npm run build && node scripts/verify-links.mjs        # contract intact
node otd/scripts/capture.mjs 11-09 --wayback
node otd/scripts/compose.mjs 11-09 && open otd/out/carousel/11-09/contact.png
```

## Decisions taken

1. Stage 1 is art direction. No automation until a look is signed off.
2. The palette is neutral grounds, found colour, one accent. Blue and magenta are
   demoted to accents that arrive with the material.
3. Three primary looks are boarded: Camcorder, MiniDisc, Raytraced. Three
   secondary looks are on file for moves.
4. Boards are hand-composed from 11-09's real material, on the Mac, with frames.
5. The carousel format and the zine-operation vocabulary stand; their effects
   become the locked look's material treatments.
6. Remotion is removed from the tree.
