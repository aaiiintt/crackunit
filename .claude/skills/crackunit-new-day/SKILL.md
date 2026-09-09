---
name: crackunit-new-day
description: Make the on-this-day carousel for one calendar day of the crackunit archive. Use whenever Iain asks for a carousel for a date, says "new day", "do 09-09", "make tomorrow's", or asks to look at, stock, conceptualise, compose, review, ship or log a given day. Also for planning a week.
---

# crackunit-new-day

One day, start to finish. Read `docs/on-this-day/PLAN.md` §3 (the flow),
`docs/on-this-day/LOOK.md` (the registers and what is settled) and
`otd/README.md` (the folder and its traps) before this. Everything runs from the
repo root, on the Mac.

**The rule this exists to enforce: the day's content decides the sequence.**
There is no fixed set of slides and no house style. Steps 1 to 4 happen before
any pixels, and step 4 is text Iain can argue with in two minutes.

## Inputs

A day as `MM-DD`, **month first**. `11-09` is 9 November; `09-11` is 11
September. **Say the date back in words before doing anything** — a UK reading
of the digits has caused confusion before. Twenty-six days have no posts at all;
those get the empty day's answer, not a crash.

---

## Step 1 · Look

```bash
npm run days --prefix otd                 # rebuild + validate all 366, idempotent
node otd/scripts/look.mjs MM-DD           # the inventory
node otd/scripts/frames.mjs MM-DD         # per video: frames, thumbnail, metadata
node otd/scripts/wayback-page.mjs MM-DD   # the site as web.archive.org holds it
node otd/scripts/look.mjs MM-DD           # again, now the captures exist
```

`look.mjs` prints the posts and their media state, the shape in numbers, the
arcs the day qualifies for, the registers its shape suggests, the ink sampled
from its own material, the stickers its own words already earn, and the proper
nouns the shelf has nothing for. It decides nothing. `--json` for the raw object.

## Step 2 · Read

**Read every post that day, all years, in full.** Short ones are usually the
good ones. Then write one line each:

- what actually happened that day
- the strangest sentence out of context
- what has died since, and what the Archive still had
- what a peer who was there would recognise without being told

No design thinking yet.

An image the archive lost may come back **only** from a Wayback snapshot
(`web.archive.org/web/<ts>id_/<url>`), saved as
`otd/captures/MM-DD/wayback/rescued-<name>` and labelled *recovered,
web.archive.org*. Never from anywhere else.

## Step 3 · Stock the shelf

**Before the treatment, not after.** A day whose sticker shelf is empty has no
swarm, and the composition collapses to type on white. The treatment cannot
spend material it does not have.

Take `look.mjs`'s list of names the shelf has nothing for, and for each **thing**
in the posts — objects, brands, institutions, places, formats — name it as
specifically as it can be named, then search that:

> **Search the object, never the concept.** `loop` returned bubbles and a
> recycle arrow, 0 of 8 usable. `techno` returned people dancing, 2 of 8. `bug`
> returned cockroaches and beetles, 6 of 8. `german tv` returned the ZDF logo, a
> wooden television and BERLIN lettering, 5 of 8. A genre word gives bodies; an
> abstraction gives nothing; a thing you could photograph on white, or a named
> institution or brand, gives the good stuff. `mirror ball` not `party`.
> `TR-909` not `drum machine`. Full evidence in `otd/README.md`.

```bash
node otd/scripts/fetch-giphy.mjs "<object>" "<object>" \
  --stickers --limit 8 --words "<the post's own words>" --for MM-DD
```

`--words` is what keeps this honest: the search is associative, but a sticker is
only ever *used* when one of its words is a word the post itself uses. Fetch
eight, expect to keep three. Show Iain the new ones and let him prune; `--sync`
follows his deletes.

## Step 4 · Treatment — **stop here**

Write `otd/data/treatments/MM-DD.json`, then **stop and show Iain**. Nothing
renders until he has read it and changed what he wants changed.

```json
{
  "day": "MM-DD",
  "arc":      { "name": "", "why": "why this arc and not the other one it qualifies for" },
  "register": { "name": "A · Sponsored | B · Journal | D · Duotone", "why": "" },
  "hook":     { "what": "", "post": "/permalink/", "material": "", "why": "" },
  "line":     { "text": "quoted exactly", "from": "/permalink/" },
  "ink":      { "hex": "", "from": "", "override": false },
  "density":  "SCARCE | MIDDLING | PLENTIFUL",
  "beats": [
    { "says": "", "post": "/permalink/", "material": "", "cards": ["statement", "swarm"] }
  ],
  "caption": "",
  "feed": { "differsFrom": ["", ""], "on": ["arc", "register"] }
}
```

- **arc** — from `look.mjs`'s candidates. Days qualify for two; choosing is the
  editorial act, and the `why` is the record of it.
- **register** — chosen by what carries the day: *words* → B, *pictures or their
  absence* → D, *things, links, a list* → A. It is not a house style.
- **hook** — the single strongest thing the day has. **Slide 1, and never a date
  card.** A sentence, a survivor, a wall of broken boxes, a number, one frame.
  It must survive the square centre-crop of the profile grid.
- **line** — quoted exactly, never rewritten. `otd/data/lines.json` holds picks
  already made for eight days.
- **density** — from `look.mjs`. **The less a day has, the bigger and more
  repeated it gets**: scarce means one instance wider than the frame and a
  fortyfold scale range; plentiful means the quantity is already the density.
- **beats** — five to eight, ordered, each naming its post, its material and its
  cards. Slide 2 is where most people leave: it rewards the swipe rather than
  continuing an introduction.
- **caption** — the slides play to people who were there; the caption leaves a
  stranger able to follow.
- **feed** — must differ on **at least two of arc / register / ink** from each of
  the previous two days. Three consecutive days must not read as siblings.

**The cards** — composable pieces, not slide templates. Each takes a rectangle
and some material and does not know what day it is:

`statement` · `swarm` · `march` · `stack` · `wall` · `window` · `broken` ·
`bullets` · `quote` · `page` · `tags` · `source` · `tomorrow`
(described in `PLAN.md` §3.)

## Step 5 · Compose

**Honest state: `cards.js` and `compose.mjs` do not exist yet.** Until they do,
compose the day by writing its sketch against the shared vocabulary in
`otd/lookdev/styles/style.js` — the register modules `A` / `B` / `D`, and
`S.swarm`, `S.march`, `S.bleed`, `S.giant`, `S.bullets`, `S.screened`,
`S.credit`, `S.daymark`, `S.anomaly` — following the treatment's beats.

Do this for the first handful of days. **The card library is written from what
actually recurs, not invented ahead of it.** When a piece has been needed three
times, promote it into `cards.js`; when the beats walk themselves, that is
`compose.mjs`.

**Do not copy `otd/lookdev/styles/beats.js`.** It is Part A's comparison rig:
twelve compositions with coordinates fitted to two days I knew. Rendered against
09-08 they collapse. Mining them rebuilds the template with better tools.

Provenance holds regardless: a card draws only material belonging to its beat's
post. Write `provenance.json` with every element's source, and generate the alt
text from it.

## Step 6 · Review

Contact strip, plus the last eight covers as a profile grid. **Redlines go into
the treatment, not the code**, and it re-renders in seconds. Change code only
when a *card* is wrong, and then fix it for every day, not this one.

## Step 7 · Ship

```bash
cd otd/site && npm run build          # slide 1 becomes the day's cover
node otd/scripts/checklist.mjs MM-DD
```

Instagram, Creator account: carousel in order, caption from `caption.md`, alt
text per slide, bio link to `otd.crackunit.com/MM-DD/`. TikTok photo mode: the
same files. Then 48 hours and 7 days into `otd/data/performance.json[MM-DD]`.
Every ten days, group by arc, register and day shape, and change this file in
response. That is the loop.

## Planning a week

Draft seven treatments in one sitting so the week has a deliberate rhythm: loud,
quiet, dense, single, wrecked. Render per day.

## What not to do

- Do not write copy. Quote the archive.
- Do not give a post another post's material.
- Do not build a fixed sequence, or a house style. That is the failure this replaces.
- Do not tint the words that matter. Colour is per element, by meaning.
- Do not fake an asset in code.
- Do not render before the treatment is written and seen.
- Do not skip step 3. An empty shelf is why 09-08 collapsed into type on white.
- Do not auto-publish an unapproved day. A missed day beats a wrong one.
- Do not add a dependency to the crackunit site. `otd/` has its own package.json.
- Do not print or commit `GIPHY_API_KEY`.
- Do not regenerate `export/live-urls.json`, ever (root `CLAUDE.md`).

## Version

- v3, 2026-09-09. Rewritten for PLAN.md §3: seven steps, with stocking the shelf
  its own step before the treatment, registers chosen per day, and density
  derived and inverted. Exists: `build-days`, `validate-days`, `show-day`,
  `look`, `frames`, `wayback-page`, `fetch-giphy`, `giphy-sheet`, `checklist`.
  Still to come: `cards.js`, `compose`, `grid`, `week`.
- v0 to v2 are in git history.
