---
name: crackunit-new-day
description: Make the on-this-day carousel and landing page for one calendar day of the crackunit archive. Use whenever Iain says "new day", "do 11-09", "next day's post", "make tomorrow's", or asks to look at, conceptualise, compose, review or log a given date. Also use to plan a week of days, or to log how a posted day performed on Instagram.
---

# crackunit-new-day

One day, start to finish. The plan is `docs/on-this-day/PLAN.md`; the look is
`docs/on-this-day/LOOK.md`; the folder is `otd/README.md`. Read those before
this. Everything runs from the repo root on the Mac.

**The rule this procedure exists to enforce: the day's content decides the
sequence.** There is no fixed set of slides. Steps 1 and 2 happen before any
pixels, and step 2's output is text a human can argue with.

## Inputs

A day as `MM-DD`, **month first**: `11-09` is 9 November, `09-11` is 11
September. Say the date back in words before doing anything, so a UK reading of
the digits is caught early. Twenty-six days have no posts; those get the empty
day's answer, not a crash.

## Step 1 · Look

```bash
npm run days --prefix otd            # rebuild + validate the day files, idempotent
node otd/scripts/show-day.mjs MM-DD  # the inventory
node otd/scripts/frames.mjs MM-DD    # per video: frames, thumbnail, metadata
node otd/scripts/wayback-page.mjs MM-DD   # the site as web.archive.org holds it
```

Then **read every post that day, all years, in full**. Short ones are the good
ones. Note what survives, what died, what came back from Wayback, which videos
are gone, the year span, the tags, and any sentence that is strange out of
context. No design thinking yet.

An image the archive lost may come back **only** from a Wayback snapshot
(`web.archive.org/web/<ts>id_/<url>`), saved as
`otd/captures/MM-DD/wayback/rescued-<name>` and labelled *recovered,
web.archive.org*. Never from anywhere else.

## Step 2 · Conceptualise

Decide, and write it to `otd/data/treatments/MM-DD.json`:

- **shape** — the arc, from `docs/on-this-day/ARCS.md`, with one sentence of why
  this day is that shape rather than the other one it qualifies for.
- **hook** — the strongest single thing the day has. This is slide 1. It is not
  a date card. It must survive a square crop, because the profile grid crops it.
- **line** — quoted exactly, never rewritten. `otd/data/lines.json` holds picks
  already made for some days.
- **ink** — sampled from the day's own material, and where it lands. The words
  that matter stay black.
- **beats** — the ordered slides, each naming a card and the material it uses.
  Five to eight. Slide 2 is where people leave: it rewards the swipe.
- **caption** — the slides play to people who were there; the caption leaves a
  stranger able to follow.

**Check the feed, not just the day.** The arc, ink and rhythm must differ on at
least two of three from each of the previous two days. `node
otd/scripts/grid.mjs` shows the last nine covers as a profile grid.

**Stop here and show Iain the treatment.** It is text, it takes two minutes to
read, and it is cheaper to argue with than a render.

## Step 3 · Compose

```bash
node otd/scripts/compose.mjs MM-DD   # otd/out/carousel/MM-DD/
```

Provenance is enforced: a card whose material does not belong to its beat's post
is refused. `provenance.json` records every element's source, and the alt text
comes from it.

## Step 4 · Review

Look at the contact strip and the profile grid. **Redlines go into the
treatment, not the code**, and it re-renders in seconds. Change code only when a
*card* is wrong, and then fix the card for every day, not this one.

## Step 5 · Ship

```bash
cd otd/site && npm run build         # slide 1 becomes the day's cover
node otd/scripts/checklist.mjs MM-DD
```

Instagram, Creator account: carousel in order, caption from `caption.md`, alt
text per slide, bio link to `otd.crackunit.com/MM-DD/`. TikTok photo mode: the
same files.

## Step 6 · Log

48 hours and 7 days into `otd/data/performance.json[MM-DD]`. Every ten days,
group by arc, hook type and day shape, and change this file and `ARCS.md` in
response. That is the loop.

## Planning a week

Draft seven treatments in one sitting so the week has a deliberate rhythm: loud,
quiet, dense, single, wrecked. Render per day.

## What not to do

- Do not write copy. Quote the archive.
- Do not give a post another post's material.
- Do not build a fixed sequence. That is the failure this replaces.
- Do not tint the words that matter. Colour is per element, by meaning.
- Do not fake an asset in code.
- Do not render before the treatment is written and seen.
- Do not auto-publish an unapproved day. A missed day beats a wrong one.
- Do not add a dependency to the crackunit site. `otd/` has its own package.json.
- Do not regenerate `export/live-urls.json`, ever (root `CLAUDE.md`).

## Version

- v2, 2026-09-08. Rewritten for plan v5: content decides the sequence. The
  thirteen-slide loop, the Stage-1 gate, the look-board loop and the chart track
  are gone. Scripts that exist: `build-days`, `validate-days`, `show-day`,
  `frames`, `wayback-page`, `fetch-giphy`, `giphy-sheet`, `checklist`. Scripts
  Part B adds: `look`, `week`, `compose`, `grid`, `performance-report`.
- v0 and v1 are in git history.
