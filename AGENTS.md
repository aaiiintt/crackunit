# AGENTS.md

Two projects live here. Work out which one you are in before you touch
anything.

| | |
|---|---|
| **crackunit.com** | Iain Tait's blog archive, 1,526 posts, 2005–2021, WordPress → Astro. `README.md`, `CLAUDE.md`, `src/`, `export/`, `public/`, `scripts/`. **Stable. Do not change it unless asked.** |
| **on-this-day** | Resurfaces that archive one calendar date at a time as an Instagram carousel, plus a landing page at otd.crackunit.com. Everything in `otd/` and `docs/on-this-day/`. **This is where the work is.** |

Working branch: `claude/on-this-day-plan-review-nr1p0f`.

---

## The rules that are not negotiable

1. **Every URL WordPress published must keep resolving.** `export/live-urls.json`
   is the contract, 2,902 URLs, snapshotted before cutover. **Never regenerate
   it.** After anything touching routing, content filenames or `vercel.json`:
   `npm run build && node scripts/verify-links.mjs`. Full detail in `CLAUDE.md`.
2. **Real material only.** Everything on a slide comes from the archive or its
   captures: post text, titles, tags, permalinks, publish dates, surviving
   images, images recovered from the Wayback Machine, video frames, yt-dlp's own
   metadata and error text, page captures, and stickers. **A post never borrows
   another post's material.** Copy is never written. The only furniture words
   allowed are the date, the URL, `link in bio`, `recovered, web.archive.org`,
   `no longer available`, `come back tomorrow`, and the Giphy credit.
3. **The day's content decides the sequence.** There is no fixed slide list and
   no house style. A fixed sequence was built once, rejected, and deleted; see
   `docs/on-this-day/PLAN.md` "Context".
4. **Nothing renders before its treatment is written and Iain has read it.**
5. **Never commit secrets.** `.env` at the repo root holds `GIPHY_API_KEY`.
   Never print it, never commit it.
6. **No new dependencies without asking.** `otd/` has one (`playwright-core`).
   The website has two. Prefer twenty lines of plain code.

---

## Read these, in this order

1. `docs/on-this-day/PLAN.md` — the objective, the outputs, **§3 is the flow**
2. `docs/on-this-day/LOOK.md` — the three registers, what is settled, what is rejected
3. `otd/README.md` — the folder, how to run it, the traps
4. `.claude/skills/crackunit-new-day/SKILL.md` — the per-day procedure
5. `references/round2/` — the four images the look is built from

---

## Making a new day

Invoke the **`crackunit-new-day`** skill. Seven steps; **stop at step 4**.

```bash
# 1 LOOK — what the day contains. decides nothing.
npm run days --prefix otd
node otd/scripts/look.mjs 09-09
node otd/scripts/frames.mjs 09-09        # yt-dlp + ffmpeg, per video
node otd/scripts/wayback-page.mjs 09-09  # the site as the Archive holds it
node otd/scripts/look.mjs 09-09          # again, now the captures exist

# 2 READ — every post that day, all years, in full. no design thinking.

# 3 STOCK — the objects the posts name, into the sticker library
node otd/scripts/fetch-giphy.mjs "chef hat" "film reel" \
  --stickers --limit 8 --words "ramsay,chef,films,video" --for 09-09

# 4 TREATMENT — otd/data/treatments/09-09.json, then STOP AND SHOW IAIN

# 5 COMPOSE
node otd/lookdev/render.mjs --compose 09-09     # → otd/out/carousel/09-09/

# 6 REVIEW — contact.png. redlines go into the treatment, not the code.
# 7 SHIP — caption, alt text, day page, checklist, upload, log
```

**Step 4 is the gate and the whole point.** The treatment is text: arc,
register, hook, line, ink, density, beats, caption. Iain reads it in two
minutes and changes it. A render costs an hour of his attention; a treatment
costs two minutes of it.

**Choosing sticker searches is a skill, not a lookup.** Search the *object*,
never the concept. Measured: `loop` → 0 of 8 usable, `techno` → 2 of 8 (it
returns people dancing), `bug` → 6 of 8, `german tv` → 5 of 8. Name the thing
as specifically as it can be named — `mirror ball` not `party`, `TR-909` not
`drum machine` — and tag it back to the post's own words with `--words`, which
is what keeps provenance honest. Full evidence in `otd/README.md`.

---

## Developing the code

```
otd/
  scripts/
    build-days.mjs      366 day files from export/. idempotent.
    validate-days.mjs   asserts them
    look.mjs            STEP 1. inventory, arcs, registers, ink, shelf, gaps
    frames.mjs          yt-dlp + ffmpeg per video
    wayback-page.mjs    web.archive.org captures
    fetch-giphy.mjs     the sticker library. --words, --for, --sync, --restore
    giphy-sheet.mjs     redraws public/giphy/catalog.png
    show-day.mjs        older, terser than look.mjs
    checklist.mjs       the upload checklist
  data/
    days/               derived, gitignored, rebuilt in ~2s
    treatments/         one plan per day. THE SOURCE OF TRUTH for a day.
    lines.json          editorial picks for eight days. committed.
  lookdev/
    lib.js              OTD: loading, material ops, day facts. day-agnostic.
    styles/style.js     S + the registers A / B / D. the shared vocabulary.
    styles/cards.js     CARDS. `index`, `tomorrow`. grows slowly, on demand.
    styles/beats.js     Part A's comparison rig. DO NOT MINE. see below.
    styles/card.js      draws one card alone, in each register
    days/MM-DD.js       one day's composition, driven by its treatment
    render.mjs          Chrome via playwright-core. serves the repo root.
    page.html           hosts a sketch. ?sketch= &pre= &day= &seed= plus its own
  public/fonts          Mac system faces are GITIGNORED (proprietary, public repo)
  public/giphy          the curated library + manifest.json. committed.
  captures/             per-day material. gitignored. regenerate with the scripts.
  site/                 the Astro teaser at otd.crackunit.com
  out/                  renders. gitignored.
```

```bash
node otd/lookdev/render.mjs --compose 09-09          # a whole day from its treatment
node otd/lookdev/render.mjs --card index --day 09-09 # one card, in all three registers
node otd/lookdev/render.mjs --styles                 # Part A's four options (historical)
node otd/lookdev/render.mjs --styles --on 09-08      # any sheet against an untuned day
```

**The layering, and where to make a change:**

| you want to change | change |
|---|---|
| what a day says or shows, its order, its register, its ink | its **treatment** |
| how one piece looks everywhere | `styles/cards.js` or `styles/style.js` |
| how one day is arranged | `lookdev/days/MM-DD.js` |
| what the day's facts are | nothing — `look.mjs` is derived |

**The card library grows on demand.** A piece becomes a card when it has been
needed three times, not before. `index` and `tomorrow` are in; the rest of a
day is still hand-composed in `days/MM-DD.js`. That is deliberate: inventing the
library ahead of use is how the last system went wrong.

---

## The biggest pitfalls

**Do not mine `styles/beats.js`.** It is Part A's comparison rig: twelve
compositions with coordinates fitted to two days we knew well. Rendered against
09-08 — four posts, every image dead — all four collapse into the same big
sentence on white. Reuse the *vocabulary* in `style.js`, never the arrangements.

**An empty sticker shelf collapses a composition.** Swarms, marches and bleeds
all draw stickers. A day whose posts earn nothing from the library renders as
type on a blank ground. Stock the shelf (step 3) **before** writing the
treatment, or the treatment will spend material that is not there.

**p5's `loadJSON` and `loadStrings` hang the sketch when a file is missing.**
They decrement p5's preload counter only on success, so one 404 leaves the page
on "Loading…" forever with no error. Anything optional goes through
`OTD.fetchJSON` / `OTD.fetchText`, counted by `OTD.allLoaded()`. `loadImage`
and `loadFont` are fine.

**p5 fills a loaded object *after* `preload` returns.** `loadImage` hands back a
1 × 1 placeholder, so `.width` is no readiness test. Every image goes through
`OTD.img()`; every sketch waits on `OTD.allLoaded()`.

**Two settles, not one.** You cannot know which post a beat is about until the
day's captures have loaded, and you cannot ask for that post's stickers until
you know. Wait for `allLoaded()`, *then* request stickers, *then* wait again.
Getting this wrong silently renders a day with no stickers.

**Type is never clipped.** A word must not lose letters off the frame, and
nothing may be drawn over words that have to be read. Use `S.giantFit`, which
measures against the frame and staggers by indenting from the left. Only type
used as pattern may run out. Draw swarms *under* the windows that hold words.

**Measuring and drawing must share one function.** The `index` card estimated
row heights one way and drew them another; on a thirteen-post day the footer
landed on the last two titles. If you compute a fit, draw with the same maths.

**A post's date comes from its `permalink`, not its filename.** WordPress
derived the URL from the publish date and the two do not always agree.

**Chrome caps one screenshot at 16384 device pixels.** A taller sheet silently
wraps. `render.mjs` splits contact sheets.

**yt-dlp: the default and iOS players fail on old videos; the android client
works.** `frames.mjs` tries four in order. A terminated video writes
`unavailable.txt` — **keep it, the error text is material.**

**The Wayback Machine is the only place a lost image may come from.** Save as
`captures/MM-DD/wayback/rescued-<name>` and label it *recovered,
web.archive.org*.

**`const line` shadows p5's `line()`.** So does `text`. Name locals carefully.

**ffmpeg on this Mac has no `drawtext`.** Label sheets with Chrome instead.

**Astro's content store is in `node_modules/.astro`**, not `.astro`. Clear both.

---

## Environment

Runs on Iain's Mac, not in a container. Needs the system fonts, Google Chrome
for playwright-core, and network for yt-dlp and web.archive.org. Node 24;
ffmpeg and yt-dlp installed. Fonts on a new machine: see `otd/README.md`.

## Working with Iain

He is the art director. Given a plan in text he will redirect it in two minutes;
given a rendered system he has to reject weeks of work. **Show the smallest
thing that answers the open question, early, in pictures.** When a decision
appears mid-task, say exactly what it is and stop rather than choosing and
carrying on. When you are asked to plan, say what is missing from the plan as
well as what is in it. Do not describe anything as locked while the question it
answers is open.

## Known open questions

- **Twenty-six days have no posts at all**, including 12-10. No answer yet:
  a slide saying the archive is empty and offering the nearest day, or skip.
- The rest of the card library, `grid.mjs` (the profile-grid preview) and
  `week.mjs` (seven inventories side by side) are unwritten.
- The feed-memory check — a day must differ on two of arc / register / ink from
  each of the previous two — is specified but not enforced in code.
