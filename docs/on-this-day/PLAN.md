# on-this-day, plan v5

*Approved 2026-09-08. Replaces v4 and everything built under it: a fixed
thirteen-slide template that made every day look the same. v1 to v4 are in git
history (`git log -- docs/on-this-day/PLAN.md`).*

## Start here

**The repo.** `~/Code/crackunit` is Iain Tait's blog archive: 1,526 posts from
2005 to 2021, migrated from WordPress to Astro and served at crackunit.com. Read
the root `README.md` and `CLAUDE.md` first. The URL contract in `CLAUDE.md` is
absolute: every URL WordPress ever published must keep resolving, and
`export/live-urls.json` is never regenerated. You will not need to touch the
website. This work lives entirely in `otd/` and `docs/on-this-day/`.

**The project.** "on-this-day" resurfaces the archive one calendar date at a
time as an Instagram carousel, plus a landing page at otd.crackunit.com. It is
made for people who were reading blogs in 2005 and will recognise the names, but
the caption must leave a stranger able to follow.

**Read, in this order:** this file, then `docs/on-this-day/LOOK.md` (what is
settled about the look and what is open), then `references/round2/` (four
images: two on simplicity and a reduced palette, one on repetition as stacked
windows, one on monochrome), then `otd/README.md` (what is in the folder, how to
run it, and the traps that have already cost time).

**The state.** Everything before this plan was a rejected approach and has been
deleted. What survives is a toolbox, not a design: capture scripts, a p5
primitives library, a font set, a curated GIF library, the Astro teaser site,
and derived day data for all 366 days.

**The first job is Part A only** (§5). Four style options, three beats each, on
days we already know. Do not build the pipeline, the arcs or the treatments.
Produce one sheet of twelve renders plus each hook shown square-cropped, and
stop. Iain chooses one option, or names a mix.

**Hard rules.** Real material only: everything on screen comes from the archive
or its captures, and never from another post. No invented copy, ever. The words
that matter stay black; colour is per element, by meaning. Nothing renders
before its plan is written in text.

**Environment.** Runs on Iain's Mac, not a container: it needs the system fonts,
Google Chrome for playwright-core, and network for yt-dlp and web.archive.org.
Node 24, ffmpeg and yt-dlp are installed. A `.env` at the repo root holds
`GIPHY_API_KEY`; never print or commit it.

**Working style.** Show work early and in pictures. When something needs a
decision, say exactly what and stop rather than choosing and continuing. Commit
small, push to the working branch. Log cost to `docs/on-this-day/BUDGET.md` at
the end of each session.

---

## Context

Stage 1 and 2 produced a **fixed thirteen-slide template**. Every day renders the
same slides in the same order; a slide only drops out when its material is
missing, and the "variation" is seeds shuffling placement inside a slide that was
already decided. On a feed that reads as one post repeated forever. Iain,
2026-09-08: *"what you think is gonna happen in every day ends up looking exactly
the same on Instagram… you've stitched them together with the content roll in the
wrong place."*

The diagnosis is right. I put **design first and content second**: I designed
thirteen slides, then asked each day to fill them. It has to be the other way
round. The missing layer is the middle one, between knowing what a day contains
and drawing it.

Asked to find what else I had missed, five things, all of which change the build:

1. **No audience.** I restated the objective without one. Resolved below.
2. **Slide 1 was still a date card** — the template thinking surviving at the one
   slide that is the entire advert in a feed.
3. **I planned the day; the complaint was the feed.** Nothing remembered
   yesterday, and nothing let us look at the profile grid.
4. **No mechanism for truth.** The wrong-image-beside-the-wrong-post bug came
   from choosing material by slide position; assembling cards from a treatment
   makes that easier, not harder, and the plan enforced nothing.
5. **No platform reality.** The profile grid centre-crops to a square. Most
   people leave at slide 2. Nothing about phone legibility, alt text, slide
   count, or reposting other people's video frames.

New references in `references/round2/` also move the look somewhere simpler:
white or cream grounds, one ink, everything held in windows and labelled cards,
imagery duotoned or halftoned, repetition as deep stacks of windows.

**Decisions taken with Iain, 2026-09-08:**
- The per-day thinking lives in a **treatment file**: I draft, he approves the
  text before anything renders.
- The look is **not settled**. A **pre-project** first: options tried fast on
  days we already know.
- Colour is **per element, not per slide**, and the day's ink is derived from
  that day's own material.
- Audience: **peers first, legible to strangers.**
- The hook is **the strongest thing that day has**, chosen per day.
- Feed: **weekly planning and a memory constraint and a grid preview.**
- Provenance: **enforced in code, silently.**
- Keep the primitives in `otd/lookdev/lib.js`; **bin the thirteen sketches.**

---

## 1. The objective

Resurface the crackunit archive one calendar day at a time, so that someone
scrolling stops, reads something Iain wrote between 2005 and 2011, feels the
specific strangeness of that day, and goes to the archive.

**Who it is for:** people who were there. Advertising, design and web people who
remember 2005 blogs, for whom Russell Davies, Poke, Technorati and "anyone want a
piece of MySpace?" land without explanation. Composed for them, but never so
inside that a stranger bounces: **the slides play to the people who were there,
the caption does the explaining for everyone else.**

Three things it must be, in order:

1. **True.** Everything on screen comes from the archive or its captures. No
   invented copy, no faked assets, no material borrowed between posts.
2. **Different every day, and different across the week.** Not decorated
   differently: *shaped* differently. A day with one post and one photograph is
   not the same object as a day with nine posts, two dead videos and a lost
   image, and three consecutive posts must not read as siblings.
3. **Good-looking enough to earn the stop.** Simple, confident, coherent across
   the feed, with the variation coming from content rather than styling.

The failure mode already proved: a system that is true, good-looking and
identical every day. Point 2 is the one the architecture must protect.

## 2. The outputs, per day

| Output | Where | Who |
|---|---|---|
| **Treatment** — the day's plan in text: shape, hook, line, ink, beats | `otd/data/treatments/MM-DD.json` | I draft, Iain approves |
| **Carousel** — 5 to 8 slides, 1080 × 1350, plus a contact strip | `otd/out/carousel/MM-DD/` | rendered from the treatment |
| **Caption** — carries the context the slides do not | `otd/out/carousel/MM-DD/caption.md` | drafted with the treatment |
| **Alt text** — one line per slide, from its provenance | same folder | generated, checked |
| **Manifest** — every element and where it came from | `otd/out/carousel/MM-DD/provenance.json` | generated |
| **Day page** — the teaser that links to the real posts | `otd.crackunit.com/MM-DD/` | existing Astro site |
| **Checklist** | `otd/out/checklist/MM-DD.md` | `checklist.mjs` |
| **Performance** — 48 h and 7 d | `otd/data/performance.json` | Iain, later |

## 3. How a day gets made

Seven steps. Two are editorial, one is Iain's gate, the rest are automatic.
Nothing renders before step 4 is written and read.

```
  "it's the 10th of December"
             │
   1  LOOK        automatic   what this day contains
             │
   2  READ        editorial   the posts in full. no design thinking yet
             │
   3  STOCK       editorial   the objects this day names → the sticker library
             │
   4  TREATMENT   editorial   arc · register · hook · line · ink · beats · density
             │    → IAIN      ══ the gate. it is text. two minutes to change ══
             │
   5  COMPOSE     automatic   cards, placed by the register, at the day's density
             │
   6  REVIEW      IAIN        contact strip + the profile grid preview
             │                redlines go into the treatment, not the code
   7  SHIP       automatic    caption · alt text · day page · checklist · upload
```

### 1 · Look — what this day contains

```
inventory(day):
  posts[]     year, title, permalink, date, text, sentences, tags, categories
  media[]     per post: image  live | dead | recovered | none
                        video  alive(frames, yt-dlp meta) | terminated(error) | none
              captures: wayback page snapshots, rescued images
  shape       n_posts, n_years, span, chars, n_tags,
              n_live, n_dead, n_recovered, n_videos, n_frames, n_captures
  arcs        every arc whose precondition the shape satisfies
  ink         dominant saturated hue of the day's best surviving material
  shelf       stickers already in the library that this day's own words earn
  gaps        things the posts name that the shelf has no object for
```

Derived, never edited. `look.mjs` prints it.

### 2 · Read — the day, before any design

Read every post in full and write one line each:

- what actually happened that day
- the strangest sentence out of context
- what has died since, and what the Archive still had
- what a peer who was there would recognise without being told

### 3 · Stock the shelf — before design, not after

A day whose shelf is empty has no swarm, and the composition collapses to type
on white. This step is what stops that, and it happens **before** the treatment
so the treatment knows what it can spend.

```
for each post:
  things = the objects, brands, institutions, places and formats it names
           (nouns you could photograph. not verbs, not concepts, not feelings)
  for each thing:
    query = the most specific name for it
            "mirror ball" not "party" · "TR-909" not "drum machine"
    if library has nothing for it:
      fetch-giphy <query> --words "<the post's own words>" --for <day>
prune to the keepers          # eight fetched, three kept, is normal
```

The query is associative; the link back to the archive stays literal. See
`otd/README.md` for the evidence on what searches well and what does not.

### 4 · Treatment — the gate

The day's plan as text, with one line of why for each choice. Iain reads it and
changes it before anything renders.

```
treatment(day) = {
  arc        one of the candidates, chosen and justified
  register   A · Sponsored | B · Journal | D · Duotone     (below)
  hook       the single strongest thing this day has, which becomes slide 1:
             a sentence · a survivor · a wall of broken boxes · a number · one frame
  line       the words that carry the day
  ink        the sampled one, or an override
  density    how loud this day is                          (below)
  beats[]    ordered, each: { says, post, material, cards[] }
  caption    the context the slides do not carry
}

assert differs_on_two_of(arc, register, ink) from each of the last two days
```

**Registers.** The option is not a house style; it is chosen per day by what
carries that day.

```
register(inventory):
  D · Duotone     pictures carry it — two or more videos, a surviving image, or
                  every image dead, since absence reads as a colour state
  B · Journal     words carry it — one long post, a strong single claim, or a
                  day that is mostly text
  A · Sponsored   things carry it — many short posts, links out, a list, or a
                  day about advertising
```

**Density.** How far apart the biggest and smallest instance of a thing are,
how many, how far off-square, how far past the edge. It is derived, and the
rule is an inversion:

```
density(inventory):
  material = n_live + n_recovered + n_frames + shelf.length
  scarce   → amplify:  scale range 40:1, the largest instance wider than the
                       frame, swarm 12-16, hard bleed, deep rotation
  plentiful→ let it speak: scale range 6:1, little past the edge, swarm 4-6,
                       the quantity is already the density
```

**The less a day has, the bigger and more repeated it gets.** A day with one
photograph shows that photograph at two thousand pixels and at twenty on the
same slide. A day with nine posts and twelve frames does not need amplifying.

### 5 · Compose — mechanical

```
for each beat:
  cards = beat.cards
  for each card:
    refuse unless card.material belongs to beat.post      # provenance, in code
    draw it: the register's ground, type and chrome
             the day's ink on each element by what it means
             the day's density for scale range, count, rotation, bleed
write provenance.json
render slides + contact strip + grid preview
```

**The cards.** Composable pieces, not slide templates. Each takes a rectangle
and some material and does not know what day it is.

| card | what it is |
|---|---|
| `statement` | the line at the size of the frame, lines staggered, bleeding |
| `swarm` | one thing at every scale from a speck to wider than the canvas |
| `march` | a row of one thing running off both edges |
| `stack` | the same window repeated in depth, each copy holding its own frame |
| `wall` | a grid of frames, in the ink |
| `window` | one thing framed, carrying its real URL |
| `broken` | the browser's box for an image that is gone, with its alt text |
| `bullets` | the post's sentences as the browser's own list, tiny and grey |
| `quote` | one sentence pulled out |
| `page` | a Wayback capture, whole |
| `tags` | the tag field |
| `source` | the raw markdown the post is stored as |
| `index` | the day's posts — each one's own date and title — and where to read them: `otd.crackunit.com/MM-DD` and *link in bio*. The rows fill the card, so one post is set enormous and thirteen small |
| `tomorrow` | the tease |

## 4. The architecture

```
inventory   what this day is           (data, computed)     look.mjs
   ↓
shelf       what it can be drawn with  (assets, fetched)    fetch-giphy.mjs
   ↓
treatment   what we will do with it    (text, editorial)    data/treatments/MM-DD.json
   ↓
cards       the pieces we can draw     (code, visual)       lookdev/cards.js
   ↓
compose     the slides                 (code, mechanical)   scripts/compose.mjs
```

The inversion that matters: steps 1 to 4 happen before any pixels, and the
treatment is prose a human can argue with in two minutes.

### Worked example · 05-10

```
1 LOOK      1 post · 2008 · 98 characters · 1 live image · 0 video · 2 tags
            arcs: the single
            ink:  sampled from SP_googlerules.jpg
            shelf: nothing. gaps: google, list, blog
2 READ      "I reckon there's some gems in this list. Stollen mercilessly from
             the most excellent Core 77 Blog." — a link post, and a typo that
             has been sitting there since 2008
3 STOCK     things: Google, a list, a blog, Core77
            queries: "google logo 2008", "notepad", "rss icon", "bookmark"
            → fetch, tagged --words "google,list,blog"
4 TREATMENT arc: the single. register: B · Journal, because 98 characters set
            to fill the page is the whole joke. hook: the misspelling, set at
            the size of the frame. density: SCARCE → amplify hard.
            beats: [statement · the typo] [page · the Google list, whole]
                   [swarm · the list at forty scales] [bullets · both sentences]
                   [window · the permalink] [tomorrow]
5 COMPOSE   six slides
6 REVIEW    against 05-08 and 05-09: arc differs, register differs. pass.
```

`12-10`, Iain's own example date, has **no posts at all** — one of 26 such days.
That branch is still unanswered and is flagged in §4 below.

### The hook
Slide 1 is not a date card. It is **the strongest single thing the day has**, and
which thing that is, is a treatment decision: a sentence set large, a surviving
photograph, a wall of broken image boxes, a number, one video frame. The date
demotes to a small mark in a fixed position, which is also what makes the account
recognisable in a grid. Slide 2 is chosen knowing that is where most people
leave: it must reward the swipe rather than continue an introduction.

### Colour, per element
The day has an **ink**, sampled from its own material: the dominant non-neutral
colour of a surviving image, else a Wayback capture, else a video frame; snapped
to something with enough contrast and saturation to work as an ink, and recorded
in the treatment so it can be overridden. It is not a wash. **The words that
matter stay black.** The ink lands on elements according to what they mean:

| Element | Treatment |
|---|---|
| The line, post text, headings | Black. Always. Never tinted. |
| Material that is *gone* (dead images, terminated videos, error text) | The ink, flattened: duotone or halftone, so absence reads as a colour state |
| Material that *survives* (live images, frames) | Its own found colour, or the ink, as the day's idea asks |
| Links, permalinks, URLs, anything once clickable | The ink, as ink |
| Structure: window chrome, rules, labels | Black hairlines; the ink only where it carries meaning |

Two days sharing an ink still read differently, because the ink lands on
different things.

### Provenance, enforced
Every card records the permalink or capture path its material came from.
**Compose refuses a card whose material does not belong to its beat's post**, so
the wrong-image bug becomes impossible rather than merely unlikely. A
`provenance.json` is written per day listing every element and its source, and
the alt text is generated from it. No annotated review sheet: the enforcement is
silent, and the manifest is there when something needs tracing.

### Feed memory
Each treatment records its arc, ink and rhythm. A day must **differ on at least
two of those three from each of the previous two days**, checked when the
treatment is written. `node otd/scripts/grid.mjs` renders the last nine covers as
a 3 × 3 grid at profile scale, which is the view Iain actually judges.

### Arcs
A small library, each with a precondition against the inventory and a beat
structure, sized against a survey of all 366 days so it covers what the archive
contains rather than what 11-09 happened to be:

| Arc | Precondition | Days it fits | Shape |
|---|---|---|---|
| **The single** | one post | 31 | Told whole and slowly: the post, its picture, its source, its silence |
| **The wreck** | every image dead, or no usable media | ~40 | Broken boxes, alt text, what Wayback still had, the one survivor |
| **The reel** | two or more videos | 91 | Frame stacks; the video is the day |
| **The ladder** | three or more years, one post each | ~50 | The same date walking forward through time |
| **The list** | nine or more posts, or 15+ tags | 26 / 137 | Density: everything at once, then three things pulled out |
| **The claim** | default, a strong opinionated line | ~150 | One assertion, its evidence, what happened next |
| **The empty** | no posts | 26 | Below |

An arc suggests a length and a rhythm; the treatment may depart with a reason.
Days often qualify for two, and choosing is the editorial act the treatment
records.

**Twenty-six days have no posts at all** — including 12-10, the date in Iain's
own example, and a heavy cluster across Christmas and New Year. That needs a
deliberate answer: one slide saying the archive is empty on this date and
offering the nearest day, or skipping the date. Worth settling early; it recurs
every fortnight on average.

### The archive, surveyed

| | |
|---|---|
| Posts per day | median 4, max 13; 31 days have one, 26 have nine or more |
| Years per day | 58 days one year, 117 two, 165 three or more; widest span 16 years (02-07, 2006 to 2021) |
| Live image | 285 days · **Video** 208 days (91 with two or more) · **A dead image** 190 days |
| Media rot | 31 days where every image is dead; 25 days with posts but nothing usable; only 4 genuinely text-only |
| Text | median 2,313 characters; 104 days over 4,000; longest 16,053 (03-17) |
| Tags | median 11; 137 days with 15 or more; most 56 (09-17) |

Eight days maximally different in shape, the test set for Part B: **05-10** (one
post, one picture, 98 characters), **02-20** (thirteen posts, 7,975 characters),
**09-08** (four posts, every image dead), **11-26** (five posts, five videos, one
per year 2006 to 2010), **02-07** (sixteen-year span), **03-17** (16,053
characters), **09-17** (56 tags), **08-11** (one post, no text, dead image).

### Platform constraints, built in
- **The profile grid centre-crops 1080 × 1350 to a square.** The hook must survive
  that crop: a square safe zone in the centre, checked automatically, with the
  date mark inside it.
- **Slide 2 is where people leave.** It carries a reward, not a continuation.
- **Five to eight slides.** Long enough to tell it, short enough to finish.
- **Minimum type size** enforced as a gate, judged at the size a phone renders it,
  not at full resolution.
- **Alt text per slide**, generated from provenance, since the archive audience
  includes people using screen readers and it is also good practice.
- **Third-party material**: video frames belong to other people. Frames are used
  as commentary on a post that already embedded them, always credited with the
  video's own title, uploader and id, which the captures already record. Giphy
  keeps its required credit. Worth a conscious decision rather than drift.

---

## 5. Part A: the pre-project, first

Before any of the above is built, settle the look. **Four options, the same three
beats, days we already know**, so we compare styles rather than compositions.

The three beats:
1. **The hook** — the strongest thing the day has, not a date card.
2. **The video** — several frames of one video, testing the repetition idea.
3. **The post** — a quote and the page it came from.

11-09 supplies beats 1 and 3 and we know it well. Its videos are both terminated,
so beat 2 uses **11-26**: five videos across five consecutive years, the best test
the archive has for stacked frames.

| Option | From | Ground | Type | Colour | The move |
|---|---|---|---|---|---|
| **A · Sponsored** | *You May Also Like* | white | Arial/Helvetica, black | ink on links only | Everything in labelled boxes with a close ×; cards overlap; captions under images |
| **B · Journal** | *XXIX* | off-white | grotesk headlines over a justified text bed | one flat colour card | A body of type as ground, cards floating over it, numbered margin notes |
| **C · Windows** | *CCA Career Expo* | white | grotesk caps | primaries | Browser windows repeated in deep offset stacks; the stack is the hero |
| **D · Duotone** | *Ettore Grotesk* | cream | grotesk, one weight | ink on everything but the words | Every image halftoned into the day's ink, held in plain windows |

Each option is a **style module** (grounds, type scale, window chrome, image
treatment, where the ink lands) plus the three beats drawn in it: twelve renders,
on one sheet, plus each hook shown square-cropped as it would appear in the grid.

No arcs, no treatments, no pipeline. One question answered with pictures: **which
of these do we want to live in?**

## 6. Part B: the system, after the look is chosen

Each shown before the next starts:

1. **`look.mjs`** — the inventory, printed. Cheap and immediately useful.
2. **`docs/on-this-day/ARCS.md`** — the arc library written as prose first,
   grounded in the survey, reviewed as text before any code.
3. **`cards.js`** — the card library in the chosen style, built on the surviving
   primitives in `lib.js`.
4. **Treatment schema, provenance enforcement, `compose.mjs`.**
5. **Eight days end to end**, the maximally-different set above, reviewed
   together as a feed rather than one at a time.

## 7. Operating model

Not a design question, but unplanned until now and it decides whether this
survives contact with a Tuesday.

- **Cadence**: treatments drafted a week at a time, rendering per day. A week of
  drafts is one sitting.
- **Cost**: recorded per week in `BUDGET.md`, which I had been keeping and
  dropped. A week of treatments plus renders should be a known number before we
  commit to doing this all year.
- **When nobody approves**: the day does not post. No auto-publish of an
  unapproved treatment. A missed day is better than a wrong one.
- **What is automated**: inventory, capture, render, checklist, grid. **What is
  never automated**: the line, the hook, the arc, the ink override.

## 8. What survives, and what was deleted

**Deleted 2026-09-08**, with the cleanup: the thirteen fixed sketches
(`otd/lookdev/decon/`), the Remotion and raytraced asset orders (`otd/orders/`),
the weekly chart track (`data/charts.json` and its references in `show-day.mjs`
and the teaser site), the hero and copy override files, `otd/FONTS.md`, and
`DRY-RUN.md`, whose still-true traps moved into `otd/README.md`. The old
ART-DIRECTION spec became `LOOK.md`.

**Kept, as a toolbox.** `otd/lookdev/lib.js` primitives: `flowText`,
`gifFrames`, `dither`, `img`/`allLoaded`, `materialFor`, `wayback`,
`rescuedFor`, `stickerFor`, `mmdd`/`numbers`/`dayWords`, the fonts. The capture
scripts `frames.mjs`, `wayback-page.mjs`, `fetch-giphy.mjs`, `giphy-sheet.mjs`
and the pruned GIF library. `build-days.mjs` and the day JSON including
`sourceFile`. `render.mjs`'s server and contact-sheet machinery. The
recovered-image rule. `data/lines.json`, stripped to the real editorial work:
eight days of chosen lines, which a treatment can start from.

**Honest note.** Everything described in earlier commits as "the look is locked"
was locking the wrong thing. The operations are sound; the grammar built on them
was a template.

## 9. Verification

Part A:
```bash
node otd/lookdev/render.mjs --styles          # 4 options × 3 beats, one sheet, plus square crops
open otd/lookdev/out/styles.png
```

Part B, per step: `look.mjs` matches the day JSON; `ARCS.md` reviewed as text; a
treatment renders in under ten seconds; compose refuses a deliberately
mismatched card; the type-size and square-crop gates fail loudly when broken.

The end test: **the eight maximally-different days, rendered, laid side by side,
that a stranger would not guess came from the same generator** — and the nine
most recent covers as a profile grid that does not read as a pattern. If they
look like siblings, the arc library is too thin, and that is the thing to fix,
not the styling.

---
