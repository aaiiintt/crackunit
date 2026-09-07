# ART-DIRECTION.md, on-this-day house style v1

Phase B deliverable. Written by Fable 5.1 with the 12 references and the archive in
context. This is the spec that the cheaper build sessions implement. It is not a mood
board. Where a value is given, use the value. Where this file and a build session's
instinct disagree, this file wins until Iain redlines it.

Read `PLAN.md` first for why. Refs are `../../references/crackunit-ref{1..12}.jpeg`.

Status of each section: **v1** means written from the refs and the archive, not yet
tested against a rendered still. Phase F look-dev will redline it. Expect the sizes
and frame counts to move by 10 to 20%. Expect the ideas not to.

---

## 0. One paragraph you can hold in your head

Every Reel is the opening titles of a film that is the day itself. One line from
the post, huge, in a 2006 system font, over a crunchy acid collage that moves like
a GIF while the camera moves like glass. The junk talks in dialog boxes, and only ever in sentences from the other posts on that date. The post
gets read on its own real page. The chart track is the score. crackunit.com is the
studio card. It loops. It is 12 seconds. It is deadpan.

---

## 1. Frame, grid, safe areas

| | |
|---|---|
| Master | 2160 × 3840, 60fps, sRGB, 16-bit intermediate if Remotion allows, else 8-bit PNG frames |
| Deliver | 1080 × 1920 H.264 High, 60fps, 10 Mbps target, 12 Mbps max, AAC 192k, 2-pass |
| Duration | 720 frames (12.0s). Hard maximum 720. Minimum 600. |
| Edit grid | Every cut on a multiple of 6 frames. Every layer arrival on a multiple of 3. |
| Design unit | All sizes below are at 1080 × 1920. Multiply by 2 for the 4K master. |

**Instagram covers the frame.** These areas hold nothing that must be read:

| Zone | Pixels at 1080 × 1920 | What Instagram puts there |
|---|---|---|
| Top | y 0 to 220 | Reels header, status bar |
| Bottom | y 1500 to 1920 | Caption, audio pill, like / comment / share row on some layouts |
| Right rail | x 940 to 1080 | Like, comment, share, more |

**Type safe area:** x 48 to 940, y 220 to 1500. The line, the date, the URL live
here. Junk can and should break out of it.

**Cover crop.** The profile grid shows a centre crop of the cover, 4:5, so
1080 × 1350 from y 285 to 1635. The cover's date and line must sit inside that.

---

## 2. Palette

Screen primaries and secondaries. Nothing muted. Nothing "warm". Skin, sky and
grass only ever arrive as found material inside a photo.

| Token | Hex | From refs | Role |
|---|---|---|---|
| `BLUE` | `#1A1AFF` | 1, 4, 7, 12 | The house ground. Default background for A1, A2, A4. |
| `MAGENTA` | `#FF1FCE` | 1, 2, 10 | Type on `BLUE`. Splats. The script word. |
| `ACID` | `#C8FF00` | 7, 8, 11 | Outlined caps. Blob bubbles. "delete delete". |
| `YELLOW` | `#FFE600` | 1, 7, 9 | Bitmap captions on `BLUE`. Price starbursts. Colour blocks. |
| `RED` | `#FF2A00` | 5, 9, 11 | Grid lines. Price tags. Censor bars. Blocks. |
| `CYAN` | `#00E5FF` | 7 | Gradient partner to `BLUE`. Rare. |
| `WHITE` | `#FFFFFF` | 3, 5, 9, 10 | Ground for A3, A7, A8. UI furniture. |
| `BLACK` | `#000000` | 12 | Ground for A6. Type on `WHITE`. |
| `LINK` | `#0000EE` | period | Underlined links in the page beat. |
| `VISITED` | `#551A8B` | period | Same. Use both in one paragraph. |
| `RAINBOW` | `#FF0000 #FF8A00 #FFE600 #00C800 #0064FF #7A00FF` | 2 | Six hard bars, no blending. The Web 2.0 gradient, unsmoothed. |

**Pairings that are allowed.** `MAGENTA` on `BLUE`. `YELLOW` on `BLUE`. `ACID`
outline on any photo. `BLACK` on `WHITE`. `WHITE` on `BLUE`. `RED` blocks on
`WHITE`. `BLUE`, `RED`, `YELLOW` blocks together on `WHITE` (ref 5, ref 9).

**Pairings that are banned.** `ACID` on `YELLOW`. `MAGENTA` on `RED`. Any two
colours mixed into a smooth gradient except `BLUE` to `CYAN` (ref 7).

**The one glossy element** per video takes its environment map from the collage
plane behind it, so it reflects `BLUE` and `MAGENTA` rather than a studio HDRI.
This is the only place the palette is ever "rendered" rather than flat.

**The unifying screen.** The collage plane (z = -600, see section 5) gets one of:
halftone dot 45° at 3.2 px pitch (ref 4), 1-bit Bayer 4 × 4 (ref 11), or none
(refs 3, 5, 9). Chosen per archetype below. Never applied to type, UI furniture or
the page beat.

---

## 3. Type

Principle: the 2006 system stack, rendered at 4K with perfect hinting. Plus one
condensed italic and one variable face. Fonts ship in `public/fonts/` in the new
repo. Impact, Times New Roman, Arial, Courier New and Brush Script MT are copied
from a Mac (`/System/Library/Fonts/Supplemental/`). The rest are open licence.

| Register | Face, file | Sizes at 1080 (cap height) | Tracking | Rules |
|---|---|---|---|---|
| **Serif** | Times New Roman Regular + Italic (`Times New Roman.ttf`). Redaction 50 (`Redaction-50.otf`) allowed only in the page beat | The line: 96 to 220 px cap. Window copy: 26 px. Site index: 64 px | −0.04em above 96 px, 0 below | The line is set in one block, ragged left, max 4 lines, never centred. Italic for anything quoted. |
| **Grotesk** | Arial Bold (`Arial Bold.ttf`) | Statements 72 to 140 px. Tile words 40 px | −0.02em | Caps. Outline treatment: `-webkit-text-stroke: 3px ACID` with transparent fill at 1080 (6 px at 4K), refs 8, 11. Solid fill on colour blocks, ref 5. |
| **Condensed italic** | Anton (`Anton-Regular.ttf`) with `skewX(-12deg)`. Swap for Druk Condensed Super Italic if licensed | 260 to 420 px cap | −0.01em | Always cropped by at least one frame edge (ref 1). Never fully visible. `MAGENTA` on `BLUE`. |
| **Mono** | Courier New Regular (`Courier New.ttf`) | URL 34 px. Timestamps 22 px. HTML texture 14 px. ASCII rows 40 px | 0 | Left aligned. Deliberately misaligned baseline between adjacent lines by 1 to 3 px. |
| **Bitmap** | W95FA (`W95FA.otf`) primary. Silkscreen (`Silkscreen-Regular.ttf`) for captions | Rendered at 11 px and scaled by integers: 22, 33, 44, 55 | 0 | `image-rendering: pixelated`. Never fractional scale. Never anti-aliased. Dialog copy at 33. Captions at 44 (ref 1). |
| **Script** | Brush Script MT (`Brush Script.ttf`) | 180 to 300 px | 0 | One word per video, maximum. `YELLOW` or `MAGENTA`. Sits over everything at z = -100. Refs 2, 11. |
| **Impact** | Impact (`Impact.ttf`). Fallback Anton | The year: 400 px. The number: 300 px | −0.03em | Only ever extruded in the R3F layer, 40 units deep, chrome material. Never flat. Never white. |
| **Variable** | Anybody (`Anybody[wdth,wght].ttf`) | CTA 80 px | 0 | `wdth` animates 50 to 150 over 18 frames on arrival, settles at 110. Weight 700. The only face whose letterforms move. |

**Legibility minimums.** Anything that must survive the 270 px thumbnail: cap
height ≥ 36 px at 1080, contrast ratio ≥ 4.5 against whatever is directly behind
it, and a 2 px `BLACK` or `WHITE` stroke if it sits on a photo. The line is always
tested at 25% scale before sign-off.

**Type is an object.** Every type element sits on a z-plane, occludes what is
behind it, and receives a hard drop shadow (no blur) of 6 px at 135° in `BLACK`
when on `BLUE`, `BLUE` when on `WHITE`. Ref 4's comic lettering, ref 7's yellow
caps.

**Permitted wrongness**, on purpose, one per video at most: forced justify with
rivers; an orphaned hyphen; double spaces after full stops; Comic Sans (`Comic
Sans MS.ttf`) at 33 px bitmap-style in a dialog; a `LINK` underline that is
`VISITED` on the second word.

**Arrival and departure.** Type arrives in 5 frames on `easeOutBack` (overshoot
1.7), a 2-frame overshoot then settle. Type leaves on a cut. Never a fade. Never a
slide-out.

---

## 4. Motion vocabulary

All at 60fps. All on the 6-frame edit grid. Names are used as-is in code.

| Move | Frames | Definition |
|---|---|---|
| `cut` | 0 | Hard cut. Both camera and content change. The default transition. |
| `kineticJump` | 6 | A cut where the camera lands 8% past its target and settles back in 6 frames, `easeOutBack` 1.4. Used to arrive at the line, the window, the page. |
| `sweep` | 18, 24 or 36 | Camera dolly + truck along a straight line between two planes, `easeOutExpo`. Nothing else moves during a sweep. Max two per video. |
| `cascade` | 4 per item | N windows or blocks appear 4 frames apart, each scaling from 96% to 100% in 3 frames, no easing. Ref 5. N between 6 and 14. |
| `layerStack` | 3 per item | Collage elements pop in 3 frames apart, no scale, no easing. Order: ground, mid, specimen, tags, type. |
| `frameBlend` | 6 | On a cut only: the 3 frames before the cut are held as semi-transparent planes (50%, 33%, 20%) over the 3 frames after it. Max two per video. Reads as a VHS blend, ref 1. |
| `chromaCycle` | 90 per 360° | `hue-rotate` on the collage plane texture. Type and UI unaffected. Max one full cycle per video. |
| `gradientMap` | 0, held 24 to 48 | Remap the post image through a two-tone ramp (`BLUE` to `MAGENTA`, or `BLACK` to `ACID`). Flip on a cut. |
| `mirrorTile` | 0, held 24 to 48 | Collage plane UVs mirrored 2 × 2 or 4 × 4 behind the line. Ref 10's symmetry, ref 3's doubled faces. |
| `feedbackTunnel` | 60 to 120 | Render-target feedback, previous frame drawn at 1.04× scale and 96% opacity under the current frame. The year or the specimen at the centre. A6 and H5 only. |
| `spriteHold` | native | Loops play at their catalogued fps (12 or 24) inside the 60fps comp. Remotion holds frames. Never interpolate. |
| `typeIn` | 5 | Described in section 3. |
| `slotDigits` | 48 | Each digit of the year spins as a vertical strip, decelerating (`easeOutQuart`), digits landing right-to-left 6 frames apart, final digit with a 3-frame bounce. H5. |
| `cursor` | 12 + 2 | Cursor moves on a 12-frame `easeInOutSine`, click is a 2-frame down state, the target reacts on the 3rd frame. Cursor is the Win98 arrow at 2× nearest-neighbour. |
| `layerStrobe` | 2 per layer | Alternate layers on alternate frames for up to 12 frames. **Limiter enforced in code: no more than 3 luminance flips per second, and never a full-frame flip.** |
| `loopReturn` | 30 | The final 30 frames bring the moving object to the exact state of frame 0 (position, velocity, scale). Motion-matched, never faded. |

---

## 5. The z-space and camera

One R3F scene. Units are pixels at 1080 × 1920 at z = 0. Camera FOV fixed at 35°
vertical so that dolly changes scale without wide-angle distortion. Camera never
rolls. Camera only dollies (z), trucks (x, y) and cuts.

| Plane | z | Holds | Rendered as |
|---|---|---|---|
| Screen | 0 | Date, URL, chyron, CTA. Never moves with the camera. | DOM layer over the canvas |
| Type | −100 | The line, statements, the script word | Canvas-texture plane, 2× resolution |
| Furniture | −300 | Dialogs, Notepad, search field, label tags | Canvas-texture planes, integer scaled |
| Collage | −600 | Cut-outs, photos, TV stills, unifying screen applied here | Textured planes, one per element, ±40 z jitter by seed |
| Loop | −900 | The fake-3D loop, the specimen that turns | PNG-sequence plane, `spriteHold` |
| Ground | −1400 | Flat colour, starfield, XP Bliss, rainbow bars, grid | One large plane |
| Page | −2400 | The real post page for the dwell beat | 4× resolution canvas plane, revealed by dolly |

The camera at rest sits at z = 1500 looking at the origin, which frames the type
plane at exactly 1080 wide. A `sweep` to the page beat dollies to z = −1400 so the
page plane fills the frame. Parallax between planes is the whole reason for the
space: a 200 px truck moves the line 12% and the ground 4%.

---

## 6. The eight archetypes

Each is a fixed arrangement of the planes above, a camera path in frames, a list of
what it accepts, and a loop mechanic. Diagrams are front view at 1080 × 1920, then
the beat-by-beat camera. `S` is the specimen or loop, `L` the line, `W` a window,
`T` label tags, `P` the post image, `#` the unifying screen on the collage plane.

### A1 · Hero (refs 1, 8)

```
+------------------------------+
| ITALIKA-style headline, cut  |  condensed italic, MAGENTA, cropped top and right
| off by the frame edge        |
|                              |
|        [ S  huge  ]          |  specimen 70% of frame height, hard-cut, at z -900
|        [           ]         |
|   L L L L L                  |  the line, Times, 4 lines max, ragged left
|   L L L                      |
|                              |
| caption in bitmap YELLOW     |  W95FA 44, bottom left, inside safe area
+------------------------------+
```

Ground `BLUE`. Screen: none. Jagged torn shapes from ref 8 in `RED` and `ACID` at
z −600 behind the specimen, two at most. Halftone on the collage plane.

Camera: f0 rest on the specimen at z 1100 (tight). f24 `kineticJump` back to rest z
1500 as the headline arrives. f90 `sweep` 24 to the line. f300 `sweep` 36 to the
page. f480 `cut` back to rest for the chyron. f600 `cut` to the studio card. f690
`loopReturn`.

Accepts hooks H1, H3, H7. Loop mechanic: the specimen enters at f0 falling from
above the frame at 14 px/frame; at f690 it is falling out of the bottom of the
studio card at the same rate; f719 it is exactly one frame above its f0 position.

### A2 · Sticker sheet (refs 3, 4)

```
+------------------------------+
| s  s   s    s   s  s   s     |  20 to 30 cut-outs in a loose 5-column grid,
|   s   [ S ]   s    s   s     |  no overlaps, each with a 4px WHITE sticker edge
| s   s    s   s  L L L L      |
|   s    s   s    L L  s  s    |  the line in Arial Bold comic-style, YELLOW,
| s  [P]  s   s    s    s      |  6px BLACK hard shadow, centre-ish
|   s    s   s  s   s    s     |
| s   s    s   s   s   s  s    |
+------------------------------+
```

Ground `BLUE`. Whole collage plane under a 45° halftone at 3.2 px, including the
stickers (ref 4). One `RED` circle and one `CENSORED` bar somewhere, always.

Camera: f0 top-down at rest, everything already placed, one sticker (the specimen)
turning at 12fps. f18 `layerStack` is not used here; instead f24 the line pops in.
f90 `sweep` 18 down into the post image sticker, which is the only unscreened
element. f300 `sweep` 36 into the page. f480 `cut` to rest. f600 studio card.

Accepts H1, H3, H5. Loop mechanic: the sticker sheet is scrolling up at 2 px/frame
throughout (a 1920 px tall sheet on a 3840 px repeat); f719 lands one frame before
f0's scroll offset.

### A3 · Cascade (refs 5)

```
+------------------------------+
| W   Hello, are you hiring?   |  Mac OS X window chrome, Times inside
|  W                           |  each window offset 28px right, 36px down
|   W                          |
|    W  [ the post as a        |
|        forum post: title,    |
|        + bullets ]           |
|     W                        |
| [BLOCK RED] THERE            |  Arial Bold WHITE on RED / BLUE / YELLOW blocks
|    [BLOCK BLUE]  IS A        |
|       [BLOCK YELLOW] BETTER  |  one word of the line per block
|          [BLOCK RED] WAY     |
+------------------------------+
```

Ground `WHITE`. No screen. Windows from the furniture library, copy from the copy
bank (`subject`, `notepad`, `dialog`). The post image sits in a QuickTime player
window (ref 5's crying child), always with the grey controller bar.

Camera: f0 one window only, centred, the first line of the post inside it. f6 to
f60 `cascade` of 12 windows, camera trucking down 40 px per window. f90 the blocks
`cascade` in with the line spelled across them, one word per block. f300 `sweep`
36 into the QuickTime window, which becomes the page. f480 `cut` to rest, chyron in
an email compose window. f600 studio card as a final window with a close box.

Accepts H2, H6. Loop mechanic: the close box on the studio card window is clicked
by `cursor` at f696; every window closes in reverse cascade 2 frames apart; f719
leaves the single f0 window.

### A4 · Window (refs 2, 12)

```
+------------------------------+
|~~RAINBOW~~     [donut] [TV]  |  rainbow bars diagonal, TV stills, bananas,
|   [smiley]  Take               |  hard-cut, dithered, rotating at 12fps
|              Me     [bunny]  |  script word in MAGENTA over everything
|  [TV still]  Higher          |
|        +-------------------+ |
|        | Untitled - Notepad| |  Notepad window, real chrome, at z -300
|        |-------------------| |
|        | L L L L L L       | |  the line in Times 26px inside the window,
|        | L L L             | |  then title, date, URL, as a plain text file
|        | crackunit.com/... | |
|        +-------------------+ |
+------------------------------+
```

Ground `RAINBOW` bars at 30°. Collage plane under 1-bit Bayer. Everything is noise
except the window, which is pristine.

Camera: f0 tight on the Notepad, the line already there, cursor blinking (2 frames
on, 28 off; a real Notepad blink is 530ms, use 30 frames). f24 `kineticJump` back
to rest, the noise arriving by `layerStack` f24 to f60. f90 the script word
`typeIn`. f300 `sweep` 24 into the Notepad, which scrolls to reveal the whole post
body; this archetype's page beat is the Notepad itself. f480 `cut`; chyron as a
second, smaller window. f600 studio card as a Save dialog: "Save changes to 2007?".

Accepts H1, H2, H4. Loop mechanic: the Save dialog's [No] is clicked at f702; the
Notepad text clears line by line 2 frames each and the cursor is left blinking at
f719 exactly as at f0.

### A5 · Wallpaper (refs 7, 10, 11)

```
+------------------------------+
| FISH FISHFISH FISH FISHFISH  |  the tile word, Arial Bold outlined ACID,
| FISH FISHFISH FISH FISHFISH  |  40px, tiled edge to edge, mirrorTile'd
| FISH FISH  [ T ]  FISHFISH   |
| FISH   [ S turning  ]  FISH  |  specimen centre, 50% height, at 12fps
| [T]    [   at 12fps  ]  [T]  |  label tags from the post's WordPress tags,
| FISH   [             ] FISH  |  RED / BLUE / YELLOW boxes, W95FA 33
| FISH  $1.49  L L L L  FISH   |  price starburst; the line under the specimen
| FISH FISHFISH FISH FISHFISH  |
+------------------------------+
```

Ground `BLUE` to `CYAN` vertical gradient (ref 7), the only gradient allowed. Acid
green blob bubbles at z −600 drifting 1 px/frame. No screen on the collage; the
tile word is the texture.

Camera: f0 rest, the tile already scrolling, the specimen already turning. f24
`mirrorTile` 2 × 2 snaps on with the line. f90 `chromaCycle` starts on the collage
plane only. f300 `sweep` 36 through the specimen (it parts, the two halves slide
off) into the page. f480 `cut`. f600 studio card with the tile word behind at 20%.

Accepts H1, H3, H5. Loop mechanic: the tile scrolls diagonally at 3 px/frame and
the specimen turns at 360° per 240 frames; both are integer multiples of 720 so
f719 is one frame before f0 by construction.

### A6 · Starfield (ref 12)

```
+------------------------------+
| . *  .    . 000000000000 .   |  BLACK ground, 1999 starfield (2px WHITE dots)
|  .   [pixel sun starburst]   |  orange pixel sun, ref 12, behind the loop
|   [  low-poly disco ball  ]  |  the loop: low-poly sphere or globe, 24fps
| 00000000000 [ turning ] 0000 |  ASCII rows in Courier New 40px, WHITE,
|  ||||colour bars|||| .   .   |  scrolling 1px/frame; colour bars strip
|  +-----------------------+   |
|  | ! Does the ever-      |   |  Win98 dialog, copy bank `dialog`,
|  |   changing landscape  |   |  the [Yes] [No] is the loop point
|  |   scare you?  [No][Yes]   |
|  +-----------------------+   |
|  [ search: where do I ... ]  |  search field, copy bank `search`
+------------------------------+
```

Ground `BLACK` with stars. No screen; the dither is in the assets. The loop is
always an early-CGI object here (never the glossy one). Smiley avatar grid (ref 12)
allowed at z −300 as a second dialog.

Camera: f0 rest, the sphere turning, one dialog already open. f24 `cursor` to
[Yes]; click; the dialog closes and two more open by `cascade`. f90 `feedbackTunnel`
begins with the year at the centre in chrome Impact; the line arrives at f120 as a
dialog. f300 `sweep` 36 into a browser window at z −2400 which is the page. f480
`cut` back. f600 studio card as the final dialog with the URL as its title bar.

Accepts H2, H5, H6. Loop mechanic: the studio-card dialog's [OK] is clicked at
f702, it closes, and the f0 dialog opens by `cascade` at f714 with the cursor
returning to its f0 position by f719.

### A7 · Grid (ref 9)

```
+------------------------------+
| |    |    |    |    |    |   |  RED 1px grid, 108px cells, on WHITE
|-+----+----+----+----+----+-  |
| | [YELLOW block: date,     | |  blocks snap to cells, Arial Bold caps
| |  title in condensed]     | |
|-+----+----+----+----+----+-  |
| | [P]     | L L L L L       | |  post image in a cell; the line in
| |         | L L  (RED)      | |  Times, RED, across four cells
|-+----+----+----+----+----+-  |
| | mono metadata  | [BLUE    | |  Courier 22: date, tags, wpId
| | 14.06.2012     |  block]  | |
+------------------------------+
```

Ground `WHITE` with the grid. No screen. This is the calmest archetype and the one
the site inherits. Blocks in `RED`, `BLUE`, `YELLOW`, `BLACK` only. One specimen
allowed, small, inside a cell, as if it were a thumbnail.

Camera: f0 tight on one cell holding the line. f24 `kineticJump` back to rest as
blocks `cascade` onto the grid. f90 `sweep` 18 along a row. f300 `sweep` 36 into the
image cell, which is the real page. f480 `cut`. f600 studio card as a full-width
`BLACK` block.

Accepts H1, H5, H6. Loop mechanic: the grid itself scrolls up 1 cell (108 px) per
60 frames; over 720 frames that is 12 cells, which is exactly the visible height,
so f719 is one frame before f0.

### A8 · Splat (ref 10)

```
+------------------------------+
| ??????????????  [splat MAG]  |  ??? rows in Courier; magenta ink splats
|  so my future                |  Arial Bold, BLACK, the line, top left
|  depends on... me?           |
|      +--[selection]--+       |  selection rectangle with corner handles
|      | [ pixel      ]|       |  around a pixel-mosaic censor of the post
|      | [ mosaic P   ]|       |  image, 24px blocks
|      +---------------+       |
| [checkerboard] [ small photo |  transparency checkerboard patch; a small
|                  insert with |  bordered photo insert (the specimen)
|  ok ok ok ok ok  BLUE border]|  "ok ok ok" tile in W95FA 22
+------------------------------+
```

Ground `WHITE`. No screen. The splats are `MAGENTA` and `BLUE` at z −600, static.
The blue splatter is the only "3D-ish" thing; the loop plane is unused unless H3.

Camera: f0 rest, the mosaic in place, the selection rectangle absent. f6 the
selection rectangle is dragged by `cursor` from top-left to bottom-right over 24
frames, and as it closes the mosaic resolves to the real image in 6 steps of block
size (24, 16, 12, 8, 4, 1 px) 3 frames each. f90 the line `typeIn`. f300 `sweep`
36 into the resolved image, which is the page. f480 `cut`. f600 studio card inside
the selection rectangle.

Accepts H1, H3, H6. Loop mechanic: at f696 the cursor clicks outside the selection;
the image re-mosaics in the same 6 steps reversed; f719 is f0.

### Assignment

`data/days/MM-DD.json` gets an `archetype` field from a seeded pick weighted by the
day's material: A3, A4, A6 want a line with `confidence ≥ 0.7`; A2 wants ≥ 6 posts
that day (the stickers are the other posts' images); A8 wants a local image; A6
wants a year ≤ 2009; A7 is the fallback for anything. No archetype may run two days
in a row. `data/archetype-overrides.json` wins.

---

## 7. Hooks and their loop mechanics

Frame 0 is already odd. Something moves by frame 6. First cut by frame 30. The
promise is paid by frame 90. No logo, no "on this day", no date in the first
second.

| Hook | Frame 0 | By f30 | Paid by f90 | Loop mechanic | Archetypes |
|---|---|---|---|---|---|
| H1 The line | The line alone, Times, `MAGENTA` on `BLUE`, nothing else; the last word arrives by `typeIn` at f6 | `kineticJump` to the archetype | The line is now an object the camera has passed | The line's last word is deleted character by character from f704 and retyped at f0 | A1, A2, A4, A5, A7, A8 |
| H2 The dialog | Win98 error box, the line as its copy, cursor 200 px from [OK] | `cursor` reaches [OK] at f18, clicks; the box shatters into 8 rectangles that become the collage | The archetype is assembled from the pieces | The studio card is a dialog; its [OK] click reassembles the f0 box | A3, A4, A6 |
| H3 The specimen | One cut-out mid-fall, 14 px/frame, over that year's crackunit homepage | It lands on the post image at f24 with a 6-frame squash | The page and the specimen are both in the archetype | Infinite fall: the specimen exits the bottom at f690, is one frame above its f0 position at f719 | A1, A2, A5, A8 |
| H4 The artefact | 2006 YouTube player chrome, "This video is no longer available" | At f18 the thumbnail bursts through the player at 1.3× and settles | The player is a window in the archetype | The player's chrome is the studio card; at f708 the thumbnail shrinks back behind "no longer available" | A4 |
| H5 The number | "19 YEARS AGO" in chrome Impact, digits already spinning | `slotDigits` lands the year at f48 | Cut to the archetype with the year as a solid object | The digits spin up from the year to the current year from f672 and are mid-spin at f719 | A2, A5, A6, A7 |
| H6 The site | Wayback capture of crackunit.com that year, full frame, real, with the real browser chrome | `sweep` 24 through the browser chrome into the post link, which is the archetype | Inside | The studio card is the same capture's footer; `sweep` back out to the f0 framing over f690 to f719 | A3, A6, A7, A8 |
| H7 The wrong thing | The one glossy element rendered too beautifully, alone, on `BLACK`, turning | At f24 the junk arrives by `layerStack` and covers it | The glossy element is now one object among the noise | The junk leaves by reverse `layerStack` from f690; f719 is the glossy element alone | A1 |

The number in H5 is computed from the post year and the render date; the render
date is passed in props so a batch rendered in 2026 for posting in 2027 is still
right.

---

## 8. The beat sheet at 720 frames

| Frames | Beat | What must be true |
|---|---|---|
| 0 to 24 | Hook | Per section 7. Frame 0 is the thumbnail test frame. |
| 24 to 90 | Payoff | The archetype assembles by `layerStack` or `cascade`. The first `cut` is at 24 or 30. |
| 90 to 300 | The post | Title (Arial Bold, 72 px, `WHITE` with `BLACK` shadow, top of safe area), the line, the image or video thumbnail. One `sweep`. The glossy element, if the archetype has one, enters here and must visibly reflect or refract the collage. |
| 300 to 480 | The page | `sweep` 36 into the page plane. From f336 to f480 only the camera moves: a slow dolly of 60 px total. The post body is readable. Nothing else happens. This is the beat that earns the click. |
| 480 to 600 | The score | `cut` back to the archetype. Chyron on the Screen plane: "No.1 that week" in W95FA 33 over "TRACK by ARTIST" in Times 48, bottom of safe area. The two runners-up in Courier 22 beneath. |
| 600 to 690 | Studio card | Date in Anybody 80 (wdth animating), `crackunit.com` in Courier 34, "link in bio" in W95FA 33. The sting. Fixed positions: date at y 700, URL at y 820, "link in bio" at y 900, all left aligned at x 72. |
| 690 to 720 | Loop return | Per the archetype and hook. Frame 719 is one frame before frame 0. |

The page beat's page: the post body set in Times 16 px (32 px at the plane's 2×
resolution) inside a rebuild of that year's crackunit template from the Wayback
capture, 760 px column, `LINK` and `VISITED` underlines, the real post date and
categories in the template's own furniture. Images inline at their original size.
Comment count if the export has one. This is not a mock; it is the post as it was.

---

## 9. Sound

Rendered audio is SFX only, at −6 dB overall so the in-app track sits over it.
Every SFX is CC0 or recreated. No Microsoft, Apple, Skype or MSN samples.

| Event | Sound | Notes |
|---|---|---|
| `cut` | 1-frame click, 2 kHz, −18 dB | Every cut. It is the edit's metronome. |
| `kineticJump` | Camera shutter, short | |
| `sweep` | Air whoosh, pitched down 12 semitones, 18 to 36 frames | Length matches the sweep |
| `cascade` | Modem chirp per item, each a semitone higher | Ref 5 in sound |
| `layerStack` | Mouse click per layer | |
| `cursor` click | Two-tone click | |
| Dialog open | Recreated "chord" (three sine tones, 0.3s) | Not the Windows one; a cousin |
| Dialog close | Same, reversed | |
| `slotDigits` | Ratchet tick per digit step, thud on land | |
| `feedbackTunnel` | Rising noise sweep | |
| Loop specimen turning | A low vinyl-ish hum at 12fps stutter | Ties the sprite to a sound |
| The glossy element | Glass or liquid, one long tone | Mixed at −12 dB |
| Studio card | **The sting**: three notes, C5, G5, C6, 10 frames apart, square lead from a 1999 GM soundfont, 0.4s release | The series signature. Never changes. |
| Loop return | The sting's tail resolves into the hook's first click at f0 | Sound closes the loop |

Deliver the SFX bed as `audio/sfx/*.wav` at 48 kHz and a `data/sfx-map.json` that
maps move names to files, so the Remotion `<Audio>` calls are driven by the same
timeline as the picture.

---

## 10. The cover

A still, not frame 0. Rendered separately per day at 1080 × 1920 PNG.

```
+------------------------------+
|                              |  (top 285px: nothing essential)
| 07.09.2007                   |  Anybody 80, wdth 110, x 72, y 340
|                              |
| L L L L L L L L L            |  the line, Times, 140px cap, MAGENTA on
| L L L L L L                  |  BLUE, ragged left, x 72, max 4 lines,
| L L L                        |  vertically centred on y 960
|                              |
|            [ S ]             |  the specimen, small, bottom right,
|                              |  breaking the safe area on purpose
| crackunit.com                |  Courier 34, x 72, y 1500
|                              |  (bottom 285px: nothing essential)
+------------------------------+
```

Ground is always `BLUE`. The archetype's collage is behind at 30% opacity under a
halftone. The grid of 340 covers reads as a calendar because the date is always at
the same place and the line is always the same face. The cover is also the site
thumbnail and the Open Graph image for the day page.

---

## 11. The line-picker brief

For Phase D, Haiku 4.5, one request per post. System prompt, verbatim:

> You are choosing one sentence from a blog post written between 2005 and 2021 to
> be shown alone, very large, to someone who has not read the post and does not
> know what it is about. Pick the sentence that is strangest, funniest or most
> confident when read out of context. Prefer short sentences. Prefer first person.
> Prefer sentences that make a claim. Avoid sentences that only make sense with the
> image or video they refer to ("this is lovely" fails; "It's quite soft enough
> already." passes). Avoid sentences that are mainly a link or a name. Never
> rewrite; quote exactly, including punctuation. If no sentence qualifies, return
> the title. Also return two alternates, and a hook type from H1 to H7 using the
> rules given, and a confidence from 0 to 1 that a stranger would stop scrolling
> for this sentence.

Structured output: `{ line, alternates: [a, b], hookType, confidence, reason }`.
`reason` is one sentence and is only for the spot-check.

Worked examples, from real posts, with the expected answer:

| Post | Expected line | Hook | Why |
|---|---|---|---|
| 2007-03-22 if-theres-one-therapy-i-dont-need | It's quite soft enough already. | H1 | Confident, short, makes no sense alone, which is the point |
| 2010-01-03 strangest-video-compilation-ever | It's not even 8am and I've just had my groove totally freaked. | H2 | First person, a claim, a time; perfect dialog copy |
| 2006-10-04 email-is-for-old-people | Email is for old people. | H1 | The title beats the body; the body is a link |
| 2007-09-07 super-supermarkets | I don't know if I want my beans bigger? | H2 | A question, a specific noun, a 2007 concern |
| 2007-05-23 my-thought-for-the-day | I can't decide if it's true or not. It's eating me up inside. | H1 | Two sentences allowed when the second pays the first |
| 2007-09-14 internet-people-the-meta-viral | Job done. Absolutely superb. | H5 | Very short; pair with the number because there is little else |
| 2010-09-07 every-time-i-take-a-redeye-flight | "Like a lamb to the slaughter, gentlemen…" | H4 | Quoted, and the post has a video, so the artefact hook |
| 2007-05-04 ive-been-taxiblogged | So it's not a real cab, it's just a smut-cruiser. | H3 | Specific, a specimen suggests itself (a taxi) |
| 2009-04-01 theres-always-room-for-a-cat-video | It's had over 7m views. And it's just a video of a cat. | H4 | Two sentences, a number, a video |
| 2010-01-18 i-knew-my-day-was-going-to-be-bad… | VOID VOID VOID VOID | H1 | Body is Posterous boilerplate; the title contains a tile word |

Negative examples: "This made me swear aloud" needs its object. "via youtube.com"
is a link. "Posted via email from crackunit's posterous" is boilerplate and must
be stripped before the model sees the body.

Tone gate: lines containing strong swearing get `confidence` capped at 0.5 and a
`tone: "strong"` flag so Iain decides per day via `data/line-overrides.json`.

---

## 12. Copy bank: the junk quotes the archive

Nothing in the furniture is written for the video. Every dialog, search field,
Notepad, email subject, label tag, tile word and status bar quotes the archive,
verbatim, typos included. The hero post gets the line. **The other posts from that
date, across every year, get the furniture.** That is how a 12-second video about
one post still resurfaces everything Iain posted on that day.

There is no hand-written bank. `build-days.mjs` derives the copy per day from the
posts by the rules below and writes it to `data/days/MM-DD.json` as `copy`. No
model is involved. Iain can override any slot in `data/copy-overrides.json`.

### Derivation rules

| Slot | Source | Rule |
|---|---|---|
| `dialog` | Sentences from the day's non-hero posts | Sentences of 12 to 90 characters that make a claim or ask a question. Buttons: if the same post contains a one-word exclamation ("Whoop!", "totally!"), that is the button; otherwise the period default [OK]. Never [Yes] [No] unless the sentence is a question. |
| `search` | Titles of the day's posts | Lowercased, as typed into a search field. The hero's title is excluded because it appears in the post beat. |
| `error` | The post's actual media state | If the post's image is in `export/unrecoverable.json`, the error names the real dead host: *"This image was on Skitch. Skitch is gone."* If the embed was dropped in migration, *"This was a Flickr slideshow. Flash took it."* If a post is fine, no error box that day. The errors are true. |
| `notepad` | The hero post's `excerpt` frontmatter, or a non-hero post's whole body if under 200 characters | As is. The excerpt is Iain's own first paragraph as WordPress cut it, ellipsis included. |
| `subject` | Titles of non-hero posts | As is. No "Re:" or "Fwd:" added; if a title already reads like a subject line, it was always one. |
| `tag` | The day's WordPress tags and categories, from `taxonomy.json` names | Verbatim, including "street figther 2" and "www.makemineabuilders.com". Sorted by length, shortest first. Category names count ("Lovely Design", "Photos"). Never "Uncategorized". |
| `tile` | One word | The shortest word in the line with three or more letters, or the day's shortest exclamation ("Whoop!"), or the hero's first tag. |
| `status` | Real metadata | The permalink, the ISO timestamp from frontmatter, "Post ID 838" from `wpId`, the category, and, only on posts that carry it, the real boilerplate "Posted via email from crackunit's posterous". |

Fallbacks, in order: a single-post day quotes the hero's own other sentences; a
day still short of copy takes from the same date's posts one year either side and
flags `copy.borrowed: true` so the site can say so.

### Worked example, 09-07

The date has 8 posts, 2006 to 2020. Hero: Super Supermarkets (2007). The line:
*"I don't know if I want my beans bigger?"*

| Slot | Copy | From |
|---|---|---|
| dialog | All we need now is a bunch of different comparisons of comparison websites and we can compare them too. [OK] | Comparing Comparisons, 2008 |
| dialog | They melted. I think the message is pretty clear. [OK] | WWF Melting Men in Berlin, 2009 |
| dialog | It's a nice thought… [OK] | Starbucks Bring Drinks To Your Laptop, 2007 |
| dialog | When you see it you'll totally remember. [totally!] | Forget the Congestion Charge, 2008 |
| dialog | Only tonight I'm traveling on JetBlue and I will feel tired, hungry and destroyed when I arrive… [Whoop!] | 1988 BA advert, 2010 |
| search | notting hill lights | 2006 |
| search | forget the congestion charge | 2008 |
| search | ai lip sync magic | 2020 |
| error | This image was on static.flickr.com. Rescued from the Wayback Machine. | Notting Hill Lights, media state |
| notepad | Normally I'm a bit hurried or hassled going around the supermarket, but on Saturday I decided to have a bit of a wander… | Hero excerpt |
| notepad | This from their wi-fi login page: It's a nice thought… | Starbucks, whole body |
| subject | Every time I take a redeye flight I think about this 1988 BA advert | 2010 |
| subject | Starbucks Bring Drinks To Your Laptop | 2007 |
| tag | NHS · brand · design · car · web · games · Photos · wi-fi · fighting · Starbucks · paralysis · Notting Hill · Advertising · ecommerce · comparison · Lovely Design · street figther 2 · limited edition product · www.makemineabuilders.com | All 8 posts |
| tile | Whoop! | 2010 |
| status | /2007/09/07/super-supermarkets/ · 2007-09-07T10:12:38 · Post ID 838 · Culture, Lovely Design | Hero metadata |

Set in the A6 Starfield archetype, that is: a dialog asking whether we can compare
the comparisons, a search field looking for notting hill lights, a Notepad with the
supermarket paragraph, "paralysis" and "street figther 2" as label tags, and
"Whoop!" as the button that closes the loop. All of it his. None of it written.

### What the build script needs

- Sentence splitting that respects Iain's ellipses ("…") and quoted speech.
- The `excerpt` frontmatter, the `tags` and `categories` arrays, `wpId`, `date`,
  `permalink`, and a lookup into `export/unrecoverable.json` and
  `export/media-paths.json` for the media state.
- A strip list for boilerplate that must never be quoted as a sentence: "Posted
  via web from crackunit's posterous", "Posted via email from crackunit's
  posterous", "via youtube.com", "via boingboing.net" and the other `via` stubs.
  These are allowed only in the `status` slot, where they are true.
- Deterministic ordering (seeded by `MM-DD`) so a re-run gives the same video.

## 13. Asset lists for Phase D2

Every asset is generated on a flat key colour, keyed, crunched (64 to 256 colour
palette, 1-bit alpha with ordered dither), and catalogued. Default key is
`#00FF00`; anything green is keyed on `#FF00FF`. Stills are 2048 px on the long
edge. Loops are 1024 px square, 24fps, 2 to 4 seconds, and must loop.

### Specimens, stills (40)

| # | Specimen | Ref | Key | Note |
|---|---|---|---|---|
| 1 | Sardine, side on | 7 | green | Three sizes |
| 2 | Silver fish, mouth open, large | 7 | green | The hero fish |
| 3 | Goose head, beak open | 8 | green | Cropped at the neck |
| 4 | White duck, standing | 8 | magenta | Two poses |
| 5 | Pink iced donut with sprinkles | 2 | green | |
| 6 | Single banana | 2 | green | Also a bunch |
| 7 | White Converse hi-top, pair | 7 | green | Worn |
| 8 | Shark, mouth open, cartoon-real | 4 | green | |
| 9 | Coke can, 2006 design | 4 | green | |
| 10 | Cigarette packet, open | 4 | green | Generic brand |
| 11 | Playing cards, fanned | 4 | green | |
| 12 | Yellow caution A-frame, three copy variants | 3, 7 | green | "Caution wet floor" etc. |
| 13 | Smiley face, 3D-ish yellow | 2 | green | |
| 14 | Brown rabbit, sitting | 2 | green | |
| 15 | Chef's hat on a head, cropped | 3 | green | |
| 16 | Disco ball, photographic | 12 | green | |
| 17 | Red felt puppet creature, Teletubby-adjacent | 2 | green | Not a Teletubby |
| 18 | 1970s TV presenter still, VHS quality | 2 | green | Three variants |
| 19 | 1990s blonde woman, VHS chroma bleed, smiling | 1 | green | Two crops |
| 20 | 1980s TV camera on a pedestal | 2 | green | |
| 21 | Cucumber | 2 | green | |
| 22 | Lightning bolt, flat pink | 1 | green | Vector will do |
| 23 | Green outlined star, three sizes | 11 | magenta | Vector will do |
| 24 | Yellow star, solid | 11 | green | Vector will do |
| 25 | Price starburst, "$1.49" and blank | 7, 11 | green | Vector will do |
| 26 | Pixel no-smoking sign | 7 | green | |
| 27 | Pixel-art potted plant, dithered | 11 | magenta | |
| 28 | Mario-style question block | 11 | green | Generic, not Nintendo's |
| 29 | Orange pixel sun starburst | 12 | green | |
| 30 | Download cloud icon with arrow | 12 | green | Vector will do |
| 31 | Crying child, black and white still | 5 | green | Generic, not the ref's |
| 32 | Baby head, cut at the neck | 3 | green | |
| 33 | Suit torso, no head | 3 | green | For the composite body |
| 34 | Bare feet, walking | 3 | green | |
| 35 | Hand holding a glass | 3 | green | |
| 36 | Dog in a raincoat | 10 | green | |
| 37 | Chrome ball on a checkerboard, classic raytrace | 12 | green | Also the loop |
| 38 | Windows XP Bliss hill, wide | 8 | none | Ground, not keyed |
| 39 | 1999 starfield tile | 12 | none | Ground, not keyed |
| 40 | Paper grain with scratches | 8 | none | Overlay for A1 only |

### Loops, animated transparent (30)

80% crunchy early CGI. 20% glossy. All must loop; the `loop` column says how.

| # | Loop | Style | Ref | Key | Loop |
|---|---|---|---|---|---|
| 1 | Low-poly disco ball turning | crunchy | 12 | green | rotation, 360° |
| 2 | Low-poly Earth globe turning, flat-shaded | crunchy | 12 | green | rotation |
| 3 | Chrome ball on checkerboard, camera orbit | crunchy | 12 | green | orbit |
| 4 | Spinning "NEW!" starburst, extruded | crunchy | 7, 11 | green | rotation |
| 5 | Spinning 3D "@" sign, gold | crunchy | period | green | rotation |
| 6 | Rotating crackunit wordmark, extruded Impact, chrome | crunchy | house | green | rotation |
| 7 | Bryce-style glass pyramid on a plane, slow turn | crunchy | period | green | rotation |
| 8 | Poser-style figure waving, 12fps | crunchy | period | green | ping-pong |
| 9 | Dancing pixel plant, leaves waving | crunchy | 11 | magenta | ping-pong |
| 10 | Question block bouncing | crunchy | 11 | green | ping-pong |
| 11 | Pixel sun pulsing | crunchy | 12 | green | ping-pong |
| 12 | Smiley spinning on its axis | crunchy | 2 | green | rotation |
| 13 | Donut rotating, sprinkles visible | crunchy | 2 | green | rotation |
| 14 | Banana rotating | crunchy | 2 | green | rotation |
| 15 | Fish swimming in place, tail only | crunchy | 7 | green | ping-pong |
| 16 | Goose head honking, beak open and close | crunchy | 8 | green | ping-pong |
| 17 | Shark chomping | crunchy | 4 | green | ping-pong |
| 18 | Hourglass cursor flipping | crunchy | period | green | rotation |
| 19 | Beachball spinning, Mac OS X | crunchy | period | green | rotation |
| 20 | Dial-up progress bar filling, then reset | crunchy | period | green | cut on reset |
| 21 | Buffering spinner, 8 segments | crunchy | period | green | rotation |
| 22 | Windows logo flag waving, generic four-colour | crunchy | period | green | ping-pong |
| 23 | Rainbow bars scrolling diagonally | crunchy | 2 | none | scroll, tile |
| 24 | Colour bars test pattern with rolling glitch | crunchy | 12 | none | scroll |
| 25 | Liquid metal blob, breathing | **glossy** | brief | green | ping-pong |
| 26 | Glass donut, refractive, turning | **glossy** | brief | green | rotation |
| 27 | Gel letterforms "OK" wobbling | **glossy** | brief | green | ping-pong |
| 28 | Chrome sphere with the collage reflected (render in R3F, not generated) | glossy | brief | n/a | live |
| 29 | Soft-body cube dropping and settling | **glossy** | brief | green | cut on drop |
| 30 | Melting smiley, wax | **glossy** | brief | green | ping-pong |

Start with loops 1, 2, 3, 6, 9, 13, 16, 25, 26, 27. Those ten are enough for the
Phase F stills to be real.

---

## 14. Sign-off gates

Phase F does not end until every row is true for every archetype on the four test
days (09-07, 02-20, 09-25, and 03-22 as the single-post and H1 case).

- The hook still, downscaled to 270 px wide, has a readable line.
- The line, the date and the URL are inside the type safe area.
- Every colour on screen is in the palette table, or is inside a photo.
- Every typeface on screen is in the type table.
- Bitmap type is at an integer scale.
- The collage plane has the archetype's screen applied and nothing else has.
- The glossy element, if present, visibly reflects or refracts something in the
  collage.
- The cover's date and line sit inside the 4:5 centre crop.
- Nothing in the frame is a post-process over the render.

Phase G adds:

- Every cut is on a multiple of 6.
- Frame 719 differs from frame 0 by one frame of motion and nothing else.
- Played three times, the loop seam is not visible.
- Fewer than 3 luminance flips in any one second.
- The page beat holds ≥ 144 frames with only the camera moving.
- The sting lands on the studio card and resolves into the f0 click.
- Render time per video is measured and written to `BUDGET.md`.
