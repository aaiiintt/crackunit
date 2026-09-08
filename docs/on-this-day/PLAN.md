<!-- Status: approved 2026-09-07. Phase A deliverable. Read this before ART-DIRECTION.md. -->

# on-this-day, plan v2

A review of v1, and the plan that replaces it. v1 is a good *production* plan. It is
not yet a plan for work that could win at CICLOPE, and it spends the budget in the
wrong places. v2 keeps v1's spine (video per day, JSON per day, link-in-bio site,
sibling repo, R3F, one house style) and adds the three things that were missing:
a creative system, a hook discipline, and a token ledger.

## Context

crackunit.com is a 1,526-post archive, 96% of it 2005–2010, with no front door.
on-this-day gives it one: a daily Instagram Reel resurfacing what Iain posted on this
date, and a landing page that turns the scroll into a click. Iain reviewed v1 and
said: close, but not confident it reaches prize-level motion and typography, and the
hook thinking is missing. Budget is $100 of tokens. Fable 5.1 plans; cheaper models
build.

Facts established this session (read-only, from the repo):

| | |
|---|---|
| Posts / days with posts | 1,526 / 340 (31 days have one post, 42 have eight or more, max 13) |
| Body length | p10 94 chars · p50 445 · p90 1,590. **244 posts are under 170 chars.** 99 are under 60. |
| Media | 752 posts reference a local image · 358 have an iframe embed · `featuredImage` frontmatter exists on some posts |
| Years | 2006: 267 · 2007: 405 · 2008: 342 · 2009: 207 · 2010: 152. Everything else is a trickle. |
| Existing OTD work | `src/pages/on-this-day.astro` + `src/components/OnThisDay.astro` already exist on `main` (merged from v0 PRs) and ship client-side JS, contrary to CLAUDE.md. Not this project's problem, but v1's "crackunit stays untouched, no client JS" is already not true. Leave it alone. |
| References | Now at `references/crackunit-ref1..12.jpeg` on branch `claude/on-this-day-plan-review-nr1p0f`. All 12 reviewed for this plan (Part 2, "What the references actually say"). Copy them into `crackunit-otd/references/` when the new repo exists. |

Facts established from outside:

| | |
|---|---|
| CICLOPE 2026 | Berlin, 6–8 October. Judged on **Direction, Editing, Animation, VFX, Sound Design** (plus Ideas / Entertainment sections). Craft categories. Two of those five (Editing, Sound Design) are absent from v1. |
| Instagram music | Copyrighted audio baked into an upload is detected and **muted**. Licensed tracks work only when added inside the app from Instagram's library, and only on a **Personal or Creator** account; Business accounts get the royalty-free collection only. v1's "chart track in the video" cannot be rendered in. |
| Remotion skills | `npx skills add remotion-dev/skills` is real; 12 skills including `remotion-best-practices`, `remotion-render`, `remotion-docs`. remotion.dev itself is blocked from this session; verify `@remotion/three` API through `/remotion-docs` after install. |
| Model prices | Fable 5.1 $10 in / $50 out per MTok (cache read $0.25) · Opus 5 $5 / $25 · Sonnet 5 $2 / $10 · Haiku 4.5 $1 / $5 |

---

## Part 1, Review of v1

### Keep, unchanged

Sibling repo · one video per calendar day · JSON per day drives both video and site ·
`permalink` is the date authority · hero scoring with manual override · one house
style, era lives in the material · R3F for layered z-planes with a moving camera ·
master 4K, deliver 1080×1920 at 8–12 Mbps · videos never in git · `otd.crackunit.com`
as a separate Vercel project · Official Charts scrape with the robots.txt reading and
Wikipedia cross-check · Wayback captures of crackunit's own homepage per year.

### Seven findings

**1. It has no idea, only a style.** "8–12 archetypes filled with seeded-random junk"
is a content farm with good taste. A jury asks what the piece *is*. 340 videos need
one sentence that describes all of them. v1 has a mood board where the concept
should be.

**2. It never touches the copy.** Sensational typography is 60% copywriting. v1 sets
"post title, date, URL" and calls type a register. The archive's oddness is in its
sentences ("It's quite soft enough already." / "It's not even 8am and I've just had my
groove totally freaked."), written in 2007 with total confidence. The hook is a line
of type, chosen per day, and nothing in v1 chooses it.

**3. The hook is backwards.** v1's beat structure opens with "acid collage
establishes". On Reels that is a second of noise before anything happens. The
thumb-stop must be on frame 0, and the first cut before frame 30.

**4. Music can't be baked in.** See table above. This is decisive: the render must be
sound-designed with SFX and hard cuts, the chart track is added in-app from the
library, and the edit is built to a fixed frame grid rather than a track. It also
means the account must be Creator, not Business.

**5. No editing or sound discipline.** Both are CICLOPE categories. "Sudden kinetic
jumps" without a grid reads as random at 60fps. There is no sound layer at all.

**6. The asset library is unfunded and mis-specified.** ~150 4096px PNGs, Houdini
fluid sims, ProRes 4444 loops, nobody named to make them. Iain's correction: the
"3D" doesn't have to be 3D. **Generated animated transparent loops that look 3D but
aren't** are the hyper-rendered layer, made by image/video models outside the token
budget. The flat junk (dialogs, grids, bars, cursors) stays procedural in code.
Real-time R3F does only what it is good at: the camera, the z-planes, chrome text,
and refraction over the collage. Fluid sims are cut. Part 3 has the new pipeline.

**7. 20 seconds is too long and too expensive.** Agreed by Iain. 10–12s, and the
loop must be *satisfying*, not merely seamless. See "The loop" in Part 2.

Two smaller corrections: the plan should say **CICLOPE**, and the "four type
registers" need actual faces and rules, not adjectives.

---

## Part 2, The creative system (what v1 was missing)

### What the references actually say

Read against the 12 images rather than v1's summary of them:

- **The glossy 3D layer is barely there.** Nine refs are flat acid collage. The only
  3D is ref 12's low-poly disco-ball globe on a 1999 starfield, and ref 2's hard-cut
  cutouts. The premium reads from *exact composition and sharp rendering*, not from
  chrome. So the hyper layer is **80% crunchy early-CGI fake 3D** (low-poly spheres,
  Bryce landscapes, Poser figures, dithered plants, Mario blocks, ref 12's sun)
  and **20% one glossy element per video** for the collision. This is exactly
  Iain's "animated transparent GIFs that look 3D" and it makes R3F's job smaller.
- **The information lives inside the UI furniture** (refs 2, 5, 12). The Notepad
  window carries the real event details; the dialogs carry the poetry. This is a
  first-class archetype, not decoration.
- **Copy is the oddness.** "where do I even stand in life" in a search field. "Does
  the ever changing & evolving landscape of the online age scare you? No / Yes."
  "I am not the creator of myself, I occur to myself." "SORRY... MY BAD." "well if
  the shoe FISH." Deadpan, existential, in system UI. The plan needs a **copy
  bank** for the junk to speak with, separate from the post's line (below).
- **Repetition as texture** (refs 7, 10, 11, 12): FISH FISHFISH · ok ok ok · delete
  delete delete · 0000000. A word tiled until it is wallpaper. Cheap and strong.
- **Label tags** (refs 5, 7): small coloured boxes of caps. The posts' WordPress
  tags ("brand", "NHS", "paralysis", "street figther 2") are exactly this material.
- **One unifying screen** (refs 2, 4, 11): a heavy halftone or 1-bit dither over the
  whole collage plane makes disparate junk one object. Applied to the collage
  layer only, never to type or UI, so it stays a material and not a post-process.
- **Composition falls into eight patterns**, which become the archetypes (table
  below). Portrait posters throughout, which suits 9:16.
- **Palette is screen primaries and secondaries, nothing muted:** electric blue
  (refs 1, 4, 7, 12), magenta (1, 2, 10), acid green (7, 8, 11), yellow (1, 7, 9),
  white ground (3, 5, 9, 10), black starfield (12), rainbow bars (2), and red /
  blue / yellow blocks on white (5, 9). Skin tones, sky and grass appear only as
  *found* material (XP Bliss in ref 8, VHS blonde in ref 1).
- **Type in the refs**: Times (2, 5, 6) · Helvetica/Arial Bold, often outlined (5, 8,
  10, 11) · a condensed italic display face cropped off the frame edge (1) ·
  bitmap UI face (1, 12) · brush script (2, 11) · comic lettering (4) · yellow
  extended caps with outline (7). The 2006 system stack covers nearly all of it.

Eight archetypes, each traced to references:

| # | Archetype | From | Composition | Camera |
|---|---|---|---|---|
| A1 | **Hero** | 1, 8 | One specimen huge; headline cropped off the frame edge; bitmap caption; jagged torn shapes | Slow push on the specimen, one kinetic jump to the caption |
| A2 | **Sticker sheet** | 3, 4 | Flat ground; 20–30 objects in a loose grid, no overlap; halftone unifier; headline centre | Top-down, then a fast dive into one sticker which is the post image |
| A3 | **Cascade** | 5 | OS windows stacking on a rhythm; the message spelled word-by-word across primary colour blocks | Each window a layer 3–4 frames apart; camera tracks the cascade down |
| A4 | **Window** | 2, 12 | The post lives in a Notepad or dialog; rainbow bars, donuts and TV stills behind | Camera arrives through the noise and settles on the window |
| A5 | **Wallpaper** | 7, 10, 11 | The line tiled as texture; label tags from the post's tags; the specimen centre | Mirror tile behind, specimen rotates at 12fps, camera at 60 |
| A6 | **Starfield** | 12 | Black; low-poly object; ASCII rows; colour bars; dialogs asking questions | Object turns; dialogs pop on the grid; the Yes/No is the loop point |
| A7 | **Grid** | 9 | Visible red grid on white; colour blocks aligned; mono metadata | The page beat. Camera pushes into one cell which is the real post |
| A8 | **Splat** | 10 | White; pixel-mosaic censor; ink splats; transparency checkerboard; selection handles; bordered photo insert | Selection rectangle drags across, the mosaic resolves into the post image |

### The conceit

**A title sequence for a day that already happened.**

Every Reel is the opening titles of a film that is the day itself. The date is the
title. The hero post is the star. The chart track is the score. crackunit.com is the
studio card. Title design gives the series its ritual (fixed positions, fixed order,
fixed sting) and gives each day its licence to be different inside that ritual. A
juror can say it in one breath.

### The engine: the line

Every day has **one line** pulled from the hero post, chosen for oddness out of
context. It is the first thing on screen and the biggest thing on screen. Everything
else is weather. Selection is a cheap-model pass (Part 4, phase D) with a manual
override file; the rule for the picker is *"the sentence that is strangest when read
alone by someone who doesn't know what it's about."* Fallback when no sentence
qualifies: the title, set as a question.

### The copy: the junk quotes the archive

The refs put their oddest copy in the system UI. Ours does the same, but the
system UI only ever quotes crackunit. The hero post gets the line. **Every other
post from that date, across all years, gets the furniture**: their sentences become
the dialogs, their titles the search fields and email subjects, their real
WordPress tags the label boxes, their excerpts the Notepad, their real media state
the error boxes ("This image was on Skitch. Skitch is gone."). Nothing is written
for the video; `build-days.mjs` derives it all from the posts by fixed rules, and
`data/copy-overrides.json` lets Iain swap any slot. So a 12-second video about one
post still surfaces everything posted on that day. Rules, sources and a worked
example for 09-07 are in `ART-DIRECTION.md` section 12.

### The hook taxonomy, how a thumb stops

Every day gets one hook type. Frame 0 is already odd; something moves by frame 6;
first cut by frame 30; the promise is paid by frame 90 (1.5s). No logo, no "on this
day", no date in the first second. Those are categories, not hooks.

| # | Hook | Frame 0 | Payoff | When assigned |
|---|---|---|---|---|
| H1 | **The line** | The line alone, Redaction serif, electric blue, nothing else | Cut to the collage on frame 24; the line stays and becomes an object the camera flies past | Line score high |
| H2 | **The dialog** | Win98 error box, real cursor, our copy: *"crackunit.com says: [the line]"* [OK] | Cursor clicks OK at frame 18; the dialog shatters into the collage | Line score high, post is short |
| H3 | **The specimen** | One absurd cut-out (goose, donut, Converse) mid-fall at 60fps over that year's crackunit homepage | It lands on the post's image, which is the next layer | Post has a strong local image |
| H4 | **The artefact** | 2006 YouTube player: *"This video is no longer available"* | It becomes available; the real thumbnail bursts through the player | Post has a video embed |
| H5 | **The number** | *"19 YEARS AGO"* in chrome, the digits spinning like a slot machine 2026→2007 | Lands on the year; cut to the title | Sparse post, weak line |
| H6 | **The site** | Wayback capture of crackunit.com that year, full-frame, real | Camera crashes through the browser chrome into the post | Any year 2005–2012 with a good capture |
| H7 | **The wrong thing** | Something rendered too beautifully: the *Argus Lite* headline in liquid chrome, a sub-surface gel donut with the title embossed | The junk arrives and ruins it | Days that need the contrast stated hardest |

Two structural rules that are also hooks:

- **The loop.** Below.
- **The cover.** Each day renders a cover still (not frame 0) designed as a poster:
  date top-left, line centre, always. The profile grid becomes a 340-poster wall that
  reads as a calendar. The same still is the site thumbnail.

### The loop

Reels loop automatically. A loop that *lands* is watched twice, and the second
watch is where the line gets read. Rules:

- **The loop point is a motion match, never a fade.** The object in motion at
  frame 719 is the same object, same velocity, at frame 0. The specimen that falls
  out of the bottom of the studio card is the specimen falling in from the top of
  the hook. The OK button clicked at the end is the dialog appearing at the start.
  Each hook type in the taxonomy gets its own loop mechanic in the bible.
- **The sting resolves into the hook's first transient.** Sound closes the loop as
  much as picture does.
- **The chyron and the studio card leave on the cut that brings the hook.** No
  dead frames either side of the seam.
- **Test: play it three times.** If the third pass reveals the seam, it fails.
- The in-app music track will not loop with the picture; Instagram cuts it wherever
  the clip ends. Accept this. The picture loop carries it.

### Psychedelic overload, the moves

Iain's steer: **crunchy but premium psychedelic overload**. The crunch is in the
assets (8-bit palettes, dithered alpha edges, 12–24fps sprite motion). The premium
is in the container (60fps camera, exact edit grid, hinted type, real refraction).
Named moves, all cheap in R3F or CSS on a textured plane, all on the 6-frame grid:

| Move | What | Cost |
|---|---|---|
| **Chroma cycle** | Hue-rotate the whole collage layer 360° over 90 frames while type stays fixed | CSS filter on the plane texture |
| **Gradient map** | Remap the post's own image through an acid two-tone ramp, flip ramp on a cut | Small shader |
| **Mirror tile** | Kaleidoscope the collage 4× or 8× behind the line for one beat | UV maths |
| **Feedback tunnel** | Render-target feedback zoom, the classic video-feedback spiral, with the year at the centre | R3F render target |
| **Asset rate ≠ render rate** | Sprites hold at 12 or 24fps while the camera moves at 60. This *is* the contrast the brief asks for, stated in one frame | Free |
| **Layer strobe** | Layers stack on alternate frames | Free. **Hard limit: fewer than 3 flashes per second, no full-frame flashes.** Instagram flags flashing content and it is a photosensitivity risk. |

### The typographic system

Principle: **the 2006 system font stack, rendered at 4K with perfect hinting.**
Times New Roman, Courier New, Impact, the Windows UI bitmap face. These are period
material, free of charge, and setting them like Rudnick sets Times is the joke
and the craft at once. Plus one hero face and one variable face for the modern layer.

| Register | Face | Role | Rule |
|---|---|---|---|
| Serif | **Times New Roman** (refs 2, 5, 6). **Redaction** optional for the dwell beat only | The line, the window copy, the site index | Huge. ≥40% of frame height. Tight tracking (−0.04em). Italic allowed. |
| Grotesk | **Arial Bold** / Helvetica Bold (refs 5, 8, 10, 11), frequently **outlined** via text-stroke in acid green or yellow | Statements, "delete delete", the spelled-across-blocks message | Caps. Outline is a treatment, not a face. |
| Condensed italic | **Anton** skewed 12°, or a licensed Druk Condensed Italic if Iain has one (ref 1) | The headline cropped off the frame edge | Always cropped by at least one edge. |
| Mono | **Courier New** | URLs, timestamps, the post's own HTML as texture, ASCII rows | Never centred. Left-ragged, mis-aligned by design. |
| Bitmap | **W95FA** (free recreation of the Win95 UI face) or **Silkscreen** (refs 1, 12) | UI furniture copy, dialog text, chyrons, captions | Integer scaling only, nearest-neighbour. Never anti-aliased. |
| Script | **Brush Script MT** (system; refs 2, 11) | One word per video at most ("Visions", "Higher") | Yellow or magenta. Over everything. |
| Impact | **Impact** (ship the .ttf; **Anton** fallback) | The year, the number, extruded chrome letterforms | 3D only. Never flat. Reflects the collage. |
| Variable | **Anybody** (free, width axis 50–150) | CTA, transitions | Width axis animates at 60fps. The only face that *moves* internally. |

Rules for all registers:

- One dominant type element per frame. Type is an **object**: it has z-depth,
  occludes things, and casts shadow onto the junk. Never "beside" an image.
- Arrival: 4–6 frame ease with a 2-frame overshoot. Departure: by cut, never by fade.
- Legibility gate: **the line must be readable at 25% scale** (a 270px-wide
  thumbnail). Minimum cap height 36px at 1080 for anything that must survive the grid.
- Permitted wrongness (period vernacular, used on purpose): forced justification,
  orphaned hyphens, double spaces, link-blue underlines and visited-purple, Comic Sans
  once per video at most.
- The readable-post beat is the **real page**: the post body set in Times 16px inside
  a rebuild of that year's crackunit template (from the Wayback capture), on a
  high-res canvas plane the camera pushes into and dwells on for ≥180 frames. This
  is the beat that earns the click, and it is also where "era is content" lives.

### The format

**60fps, 10–12s (600–720 frames), 1080×1920 delivered, 4K mastered.** Beat sheet at 720:

| Frames | Beat | Notes |
|---|---|---|
| 0–24 | Hook | Per taxonomy. Frame 0 odd, motion by 6 |
| 24–90 | Payoff / kinetic jump | The first cut. Collage arrives in layers, 3–4 frames apart |
| 90–300 | The post | Title, line, image or video thumbnail. One sweep, one jump. The hyper element enters here and must refract or reflect the collage |
| 300–480 | The page | Push into the real page. Dwell. Nothing else moves except the camera |
| 480–600 | The score | *"In the charts that week: [track], No. [n]"* as a chyron. Any single from that week's Top 40, chosen to suit the line, not necessarily the No.1. Typography beat, because the audio arrives in-app |
| 600–690 | Studio card | Date, `crackunit.com/on-this-day` or "link in bio", the sting |
| 690–720 | Loop return | Back to frame-0 state |

### Sound

Rendered audio is **SFX only**, and it is a category CICLOPE judges:

- A fixed 3-note **sting** for the studio card. The series' signature.
- Cuts land on transients: recreated dial-up hits, modem chirps, MSN-nudge-alikes,
  Windows-alike chimes, camera shutters. Recreate or source CC0; do not lift
  Microsoft's or Microsoft-era proprietary sounds.
- The hyper element has its own sound (glass, liquid) mixed under the junk.
- Left in the render at −6 dB so the in-app track sits over it.

The chart track: JSON stores the top 3 for that week plus a search string for the
Instagram library. Iain picks whichever the library has when posting. The site links
each track out (Wikipedia chart page, attributed, plus a YouTube/Spotify search link).

### Craft rules for a jury

- **One idea per video.** One line, one specimen, one hyper element. Maximalism in
  texture, minimalism in ideas.
- **Edit grid.** Every cut on a multiple of 6 frames; layer stacks 3–4 frames apart.
  60fps reads as *fast* only when it is also *exact*.
- **The fusion is physical.** Chrome uses the collage as its environment map. Glass
  refracts the type behind it. This is the whole thesis, and it is cheap in R3F.
- **No post-process.** No grain overlay, no fake compression. Degradation lives in
  assets only (v1 already got this right).
- **Series discipline.** Fixed positions for date, URL, sting, cover layout. 340
  pieces must read as one body of work.
- **Tone.** Iain's call. Default: deadpan. The oddness is in the 2007 confidence, not
  in swearing at the viewer.

---

## Part 3, Asset pipeline

Iain's correction accepted: the hyper-rendered layer is **generated fake-3D
animated loops with transparency**, not simulated 3D. Tokens pay for specs, prompt
batches, and the catalogue tooling. Generation itself is outside the $100 and costs
pennies per asset.

| Tier | What | How | Cost |
|---|---|---|---|
| 0 Procedural | Halftone, dither, scanlines, checkerboard, colour bars, grids, starbursts, censor bars, arrows, selection handles, cursors, **Win95/98 dialog**, progress bars, 404, Notepad, simplified browser chrome | React/SVG/canvas components in `src/junk/`. Vector; camera pushes in for free | Tokens (Phase E) |
| 1 Captured | Wayback homepage captures 2005–2012; the post's own images and YouTube thumbnails (already local); the post's own HTML | `scripts/fetch-wayback-shots.mjs`; `build-days.mjs` | Tokens (Phase C) |
| 2 Generated stills | ~40 cut-out specimens straight from the refs: fish and sardines, goose and ducks, donuts, bananas, Converse, shark, Coke can, cigarettes, playing cards, caution A-frames, smiley, bunny, chef's hat, disco ball, Teletubby-adjacent creatures, 70s TV stills, VHS blonde; Web 2.0 junk marks (BETA badges, gloss buttons, ribbons, reflections) | Nano Banana Pro via the `nano-banana-pro-prompting` skill on a flat key colour, then keyed | Sonnet writes the batch (Phase D2); Iain runs it |
| **3 Generated loops** | **~30 fake-3D animated transparent loops.** 80% crunchy early-CGI (ref 12's low-poly disco ball and globe, Bryce-style spinning objects, Poser figures, dithered plants, a Mario block, a chrome-ball-on-checkerboard, a spinning "NEW!" starburst, a 3D "@", a rotating crackunit wordmark). 20% glossy (one liquid-metal blob, one glass donut, one gel letterform set) for the collision | Image-to-video (Veo / Kling / Runway, Iain's choice) from a Tier-2 still on a flat key colour; keyed; looped; catalogued | Sonnet writes the batch (Phase D2); Iain runs it |
| 4 Real-time R3F | The camera and z-planes; extruded Impact letterforms in chrome; a glass slab that refracts the collage behind it; the feedback tunnel | R3F + drei in Remotion | Tokens (Phase E) |
| 5 Deferred | True fluid sim, SSS renders | Later, if ever | **Cut.** |

**Container, not GIF.** GIF is the *look* Iain wants (256 colours, 1-bit alpha,
crunchy edges) but a poor container (huge, no true alpha, no 60fps). The pipeline:

1. Generate on a flat key colour at 24fps, 2–4s, square or 4:5.
2. Key to alpha with ffmpeg (`chromakey` + `despill`), then **apply the crunch on
   purpose**: quantise to a 64–256 colour palette and threshold the alpha to 1-bit
   with ordered dither. Degradation lives in the asset, per the brief.
3. Make it loop: prefer models that accept a start frame = end frame; otherwise
   ping-pong for symmetric motion (blobs, wobbles) or crossfade the last 12 frames
   for rotations. Log which method each loop used.
4. Store as **PNG sequence** (bulletproof in Remotion via `<Img>` per frame,
   keeps the 1-bit alpha exact) plus a WebM VP9-alpha preview for the catalogue.
   Confirm `<OffthreadVideo transparent>` support via `/remotion-docs` before
   considering WebM as the primary.
5. Catalogue in `data/props.json`: id, kind (specimen / loop / mark / texture),
   era tag, native fps, loop method, size, dominant hue, "hero" or "junk". The
   archetypes pick from this by tag and seed.

**Asset rate ≠ render rate.** Loops play at their native 12–24fps inside a 60fps
composition. Remotion holds frames automatically. This is the contrast made
literal: the thing moves like a GIF, the world around it moves like glass.

Fonts: Redaction, W95FA, Silkscreen, Anton, Anybody are free; Impact and the
Microsoft core faces need a .ttf copied from a Mac for the Linux render box.

---

## Part 4, Model routing and the $100 ledger

### Principles

- **Fable writes specs; cheaper models execute specs.** Fable is used three times:
  this plan, the creative bible, one review of the look-dev stills. Never in a build
  loop.
- **Fresh context per phase.** Each session opens with the bible plus one phase card
  from this file, not the previous session's history.
- **Never load big files into context.** Day JSONs, the content store, render logs:
  scripts and `head` only.
- **Iain's eyes review stills, not model vision.** If a model must look at a frame,
  downscale to 540px first.
- **`BUDGET.md` in the new repo** is the ledger. Every session ends with `/cost`
  logged against its phase. A phase over cap stops and reports.

### Ledger

Session cost estimates assume Claude Code's cached-context behaviour: a Fable
planning session (~150k context, 40 turns, 40k output) runs about $6–8; a Sonnet
build session (~120k context, 60 turns) about $3–4; Opus about double Sonnet.

| Phase | Model | Cap | What comes out |
|---|---|---|---|
| A This review + plan | Fable 5.1 | $8 | This file |
| B Creative bible | Fable 5.1, one session, `xhigh`, with the 12 refs in context (downscaled to ~700px, once) | $14 | `ART-DIRECTION.md`: palette values, type spec, the 8 ref-traced archetypes as z-plane diagrams + camera paths, motion vocabulary with frame counts, hook taxonomy, beat sheet, sound spec, cover spec, line-picker brief, **copy derivation rules**, specimen and loop lists |
| C Scaffold + data | Sonnet 5 | $10 | Remotion project, R3F wired, `build-days.mjs`, `validate-days.mjs`, `fetch-charts.mjs`, `fetch-wayback-shots.mjs`, contact sheet |
| D The line + hook assignment | Haiku 4.5 batch; Sonnet spot-checks 30 | $4 | `data/lines/MM-DD.json`: line, hook type, confidence; `data/line-overrides.json` |
| D2 Asset generation batch | Sonnet 5 | $4 | Prompt sheets for ~40 stills and ~30 loops (per the nano-banana skill, with key-colour and loop instructions), `scripts/key-and-crunch.sh`, `scripts/catalogue-props.mjs` |
| E Procedural junk + R3F layer | Sonnet 5 (escalate one stuck problem to Opus 5) | $12 | `src/junk/*` (dialogs, Notepad, search field, label tags, colour bars, ASCII rows, selection handles, splats, checkerboard, grid), `src/hyper/*`, loop playback component, each with a `remotion still` fixture |
| F Look-dev stills, 3 rounds | Sonnet 5 drives; Iain redlines; **one** Fable pass on round 2 | $16 | 3 stills × 8 archetypes signed off; legibility gate passed |
| G Motion + first render | Sonnet 5 | $14 | One day end to end, timed, approved; cover render; SFX bed |
| H Site | Sonnet 5 | $8 | `site/` Astro build, 340 pages + index, deployed |
| I Batch tooling + QA | Sonnet 5 | $4 | Render queue script, per-day manifest, upload checklist |
| Reserve | | $6 | Overruns; a second Opus escalation |
| **Total** | | **$100** | |

If F overruns, cut archetypes from 8 to 5 before spending reserve. Five excellent
compositions beat twelve adequate ones, and the hook taxonomy already supplies the
variety.

---

## Part 5, Phases (revised order)

v1 went data → art direction → assets → video → site. v2 puts the bible first so
every cheap session has a spec, then builds the cheap-to-iterate things (procedural
assets, stills) before anything expensive (motion, renders).

### Phase B, Creative bible (Fable)

Input: this file, the 12 references (once committed), the contact sheet from Phase C
if it exists yet (it need not; the bible can be written against the measured facts
above and the sample posts).

Output `ART-DIRECTION.md`, with literal values:

1. Palette: hex values for electric blue, magenta, acid green, yellow, white, black,
   the rainbow-bar ramp, and the primary block set; which grounds pair with which
   type colours; how the one glossy element relates (env-mapped from the collage).
2. Type: the table in Part 2 made concrete, with sizes at 1080 and 4K, tracking per
   face, the outline treatment spec, and the legibility minimums.
3. **The 8 archetypes from the references** (A1–A8 in Part 2), each a z-plane
   diagram (ASCII is fine) with: where the junk sits, where the fake-3D loop sits,
   where the readable text sits, the camera path in frame counts, which hook types
   and loop mechanics it accepts, and which refs it answers to.
4. Motion vocabulary: kinetic jump, sweep, cascade, layer stack, frame-blend glitch,
   the psychedelic moves, loop return; each with frame counts on the 6-frame grid.
5. Hook taxonomy, cover spec, sound spec, beat sheet: as in Part 2, tuned.
6. The line-picker brief: a one-paragraph instruction plus 10 worked examples from
   real posts, for Phase D's cheap model.
7. **The copy rules**: how each furniture slot quotes the day's other posts (no written copy), for
   Iain to edit. The specimen list and loop list for Phase D2, traced to refs.

### Phase C, Scaffold + data (Sonnet)

```bash
npx create-video --yes --blank crackunit-otd
cd crackunit-otd && npm install
npx skills add remotion-dev/skills
```

Then `/remotion-docs` to confirm `@remotion/three` setup (the `angle` renderer in
config and for server renders; `<Sequence layout="none">` inside `<ThreeCanvas>`),
and add `@remotion/three three @react-three/fiber @react-three/drei @types/three`.
These five are the only new dependencies, in the new repo only.

- `scripts/build-days.mjs`: reads `../crackunit/export/posts/*.md` via
  `CRACKUNIT_DIR`, groups by `MM-DD` **from `permalink`**, writes
  `data/days/MM-DD.json`. Per post: title, permalink, absolute URL, date, excerpt,
  categories, tags, `featuredImage` or first inline image (resolved against
  crackunit's `public/`, remote or dead flagged), first iframe → `{kind, id,
  thumbnail}`, plain-text body, **and the raw HTML body** (Tier-1 asset). Hero
  scoring as v1, plus `+2` if a Phase-D line exists with high confidence.
  `data/hero-overrides.json`. Empty days flagged.
- `scripts/validate-days.mjs`: every JSON parses; every permalink appears in
  crackunit's `export/live-urls.json`; every local image exists.
- `scripts/fetch-charts.mjs`: as v1 (Sunday snap, Friday from July 2015, cached
  per week, sequential with backoff, honest UA, Wikipedia cross-check). Output adds
  `instagramSearch` strings for the top 3.
- `scripts/fetch-wayback-shots.mjs`: one capture per year 2005–2012, resumable via
  a state file in the style of crackunit's `wayback-state.json`.
- Contact sheet: a **plain HTML file** (`out/contact-sheet.html`) of 12 real days,
  opened locally. Not an Artifact; no tokens spent rendering it into chat.

Reuse from crackunit: `permalinkParts` in `src/lib/posts.ts` (regex + the decode
rule), the sequential-with-backoff fetch pattern in `scripts/wayback-rescue.mjs`,
the frontmatter shape in `src/content.config.ts`.

### Phase D, The line (Haiku batch)

One request per hero post (body + title + the picker brief from the bible), Haiku
4.5, batch API at half price, structured output: `{line, hookType, confidence,
alternates[2]}`. Run on the 340 hero posts first (~$1), then on all 1,526 if the
override rate is low (~$3). Sonnet spot-checks 30 against Iain's picks. Manual
overrides in `data/line-overrides.json` always win.

### Phase D2, Asset generation batch (Sonnet; Iain generates)

Sonnet, using the `nano-banana-pro-prompting` skill, writes two prompt sheets from
the bible's specimen list and palette: ~40 stills and ~30 loops, each on a named
flat key colour, each with a loop instruction. Plus `scripts/key-and-crunch.sh`
(ffmpeg key, despill, palette quantise, 1-bit dithered alpha, PNG sequence + WebM
preview) and `scripts/catalogue-props.mjs` (writes `data/props.json` from the
folder). Iain runs the generation and drops results into `assets/raw/`. Start with
10 loops, not 30: enough for Phase F stills to be real.

### Phase E, Procedural junk + R3F layer (Sonnet)

- `src/junk/`: one React component per Tier-0 device, each with props for copy,
  colour and seed, each with a `remotion still` fixture so it can be eyeballed alone.
  Win98 dialog first: it is a hook (H2) and the legibility test bed.
- `src/loops/`: the PNG-sequence player (native fps → 60fps hold, seeded start
  offset, loop method aware) as a textured plane in the R3F scene.
- `src/hyper/`: extruded-Impact chrome text, one glass slab with
  `MeshTransmissionMaterial` refracting the collage behind it, the feedback tunnel.
  One fixture each proving the collage is visibly reflected or refracted.
- `src/moves/`: chroma cycle, gradient map, mirror tile, layer strobe (with the
  flash limiter enforced in code, not by convention).
- `src/text/`: the five registers as components with the bible's rules baked in
  (sizes, tracking, integer scaling for bitmap, the 4–6 frame arrival).
- `src/page/`: the real-page rebuild for the dwell beat, from the Wayback capture.

### Phase F, Look-dev stills (Sonnet drives, Iain redlines, Fable reviews once)

Three stills per archetype (hook frame, post frame, page frame) on the four test
days, via `npx remotion still`. Contact-sheeted into one HTML page per round. Iain
redlines in text; Sonnet applies. Round 2 gets one Fable pass against the bible.
The legibility gate: every hook still downscaled to 270px wide, line still readable.
**Sign-off here before any motion work.**

### Phase G, Motion + first render (Sonnet)

Archetypes get their camera paths and the motion vocabulary. SFX bed assembled. One
day (09-07) rendered end to end at delivery spec, cover still rendered, both watched
on a phone. Render timed; that number decides the batch strategy. Loop return
checked by playing it twice.

### Phase H, Site (Sonnet)

`site/` as v1: ~340 pages at `/MM-DD/`, index using ref 6's mechanic, ref 9's grid
as structure, cover still as thumbnail, hero post, the line, the 3 tracks with
outbound links and attribution, links to every post from that date, large CTA.
Mobile-first; the maximalism must survive a phone. Own Vercel project on a subdomain.

### Phase I, Batch tooling + QA (Sonnet)

Render queue that renders only the days about to be posted (not all 340 up front),
writes `out/manifest.json`, and produces a per-day upload checklist: file, cover,
the 3 track search strings, the site link to paste. Instagram account confirmed as
**Creator** before the first post.

---

## Verification

```bash
# Data: builds and is internally valid
cd ~/Code/crackunit-otd
node scripts/build-days.mjs && node scripts/validate-days.mjs

# crackunit is provably untouched
cd ~/Code/crackunit && npm run build && node scripts/verify-links.mjs

# Stills gate (Phase F), the hook frame must read at 25% scale
cd ~/Code/crackunit-otd
npx remotion still src/index.ts OnThisDay out/look/09-07-hook.png --props='{"day":"09-07","frame":0}'

# One day end to end (Phase G), timed, watched on a phone, played twice for the loop
time npx remotion render OnThisDay out/video/09-07.mp4 --props='{"day":"09-07"}' --gl=angle
npx remotion still OnThisDay out/cover/09-07.png --props='{"day":"09-07","cover":true}'

# Site
cd site && npm run build && npx serve dist

# Budget: every session ends with /cost appended to BUDGET.md
```

Test days: **09-07** (8 posts, 2006–2020), **02-20** and **09-25** (densest), one
single-post day. Add **03-22** ("It's quite soft enough already.") as the H1 test and
**01-03** ("groove totally freaked") as the H2 test.

---

## Decisions Iain owns (assumptions until told otherwise)

1. **Instagram account is Creator.** Confirmed by Iain 2026-09-07. Had it been Business, the chart tracks are off
   the table entirely and the score beat becomes a chyron with no audio behind it.
2. **References are on this branch now**; copy them into `crackunit-otd/references/`
   when the new repo exists. Whether they stay in the crackunit repo is Iain's call
   (they're not needed by the site build; a `references/` folder is harmless).
3. **Tone: deadpan.** The 2007 voice is the joke. No "WE'RE FUCKED!" register by
   default; Iain can switch it on per day via the overrides file.
4. **The hyper layer is generated fake-3D loops**, keyed and crunched on purpose.
   Real-time R3F does camera, chrome type, one refracting slab, the tunnel. No sims.
5. **10–12 seconds, motion-matched loop.** Agreed.
6. **8 archetypes, falling back to 5** if Phase F overruns.
