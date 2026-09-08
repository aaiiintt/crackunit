# LOOK.md

What is settled about how this looks, and what is still open. Short on purpose:
the long specs that preceded this one were locking a template.

**Status: §1 and §2 settled, the card library open.** Part A ran and Iain chose
three registers, used per day rather than one house style. What is still open is
the card library and how a composition is chosen from a day's shape, which is
Part B.

## 1. Settled

**Format.** 1080 × 1350, rendered at device scale 2 by Google Chrome through
playwright-core. Five to eight slides. The profile grid centre-crops the cover
to a square, so whatever makes slide 1 work must survive that crop.

**Real material only.** Everything on screen comes from the archive or its
captures: post text, the raw source file, tags and categories, publish times and
post ids, surviving images, images recovered from the Wayback Machine, video
frames, yt-dlp's own metadata and error text, page captures, and stickers from
the library whose word appears in that day's text. **A post never borrows
another post's material.** Copy is never written; the only furniture words are
the date, the URL, `link in bio`, `recovered, web.archive.org`,
`no longer available`, `come back tomorrow`, and the Giphy credit.

**Type.** One grotesk for structure, labels and headlines. Times New Roman for
the archive's own prose, set plainly, like a 2005 browser default. Courier for
metadata, permalinks and timestamps. Type is never blurred, interlaced or
degraded; pulling type apart as content — a list, a space, a word cropped by the
frame — is composition, not degradation.

**Colour is per element, not per slide.** The day has an **ink**, sampled from
its own material: the dominant non-neutral colour of a surviving image, else a
Wayback capture, else a video frame; snapped to something with the contrast and
saturation to work as an ink, and recorded in the treatment so it can be
overridden. It is not a wash.

| Element | Treatment |
|---|---|
| The line, post text, headings | **Black. Always.** Never tinted. |
| Material that is gone: dead images, terminated videos, error text | The ink, flattened — duotone or halftone — so absence reads as a colour state |
| Material that survives: live images, frames | Its own found colour, or the ink, as the day's idea asks |
| Links, permalinks, URLs, anything once clickable | The ink, as ink |
| Structure: window chrome, rules, labels | Black hairlines; the ink only where it carries meaning |

Two days sharing an ink still read differently, because the ink lands on
different things.

**The hook.** Slide 1 is not a date card. It is the strongest single thing the
day has, chosen per day, and the date is a small mark in a fixed position.

**Gates.** Readable at 270 px wide. A minimum type size judged at phone scale.
The cover legible after a square crop. Alt text per slide, from provenance.

## 2. The registers

Part A ran twice. Round 1 was too tidy — a sentence in a hairline box — and
round 2 rebuilt it on the moves in Iain's own p5 pieces: one thing enormous and
leaving the frame, the same thing tiny and marching off both edges, a swarm at
every scale, type and picture overlapping with neither protected, the day mark
and the Giphy credit in the gutter, and one small anomaly.

**Iain, after round 2: "mostly happy with A, B and D — and could imagine them on
different days."** So the option is not a house style. It is a **register**,
chosen per day by what carries that day:

| register | ground | type | the move | the day it suits |
|---|---|---|---|---|
| **A · Sponsored** | white | Arial bold, black | labelled boxes, unaligned and overlapping, captions under everything, ink on links only | things carry it: many short posts, links out, a list, a day about advertising |
| **B · Journal** | off-white | grotesk, the post's own prose as the ground at whatever size fills the page | cards float over the bed and crop it, numbered notes in the margin | words carry it: one long post, a strong claim, a day that is mostly text |
| **D · Duotone** | cream | grotesk, one weight | every picture halftoned into the day's ink, held in thin outlined windows | pictures carry it: two or more videos, a surviving image, or every image dead |

**C · Windows is not a register.** Its browser-window stack was the strongest
single move in Part A, so the proposal is that it survives as a **card** — the
same window repeated in depth, each copy holding its own frame — available
inside any register, drawn in that register's palette. *Proposed, not yet
agreed.*

**Scale.** Sticker and picture instances run from about twenty pixels to wider
than the 1080 frame. A swarm that never leaves the canvas is a pattern, not a
swarm. How far apart the extremes are is set by the day's density (`PLAN.md`
§3): the less a day has, the bigger and more repeated it gets.

**Stickers.** A sticker is used only when one of its `words` is a word the post
itself uses — its prose, title, alt text or tags. The search that put it in the
library is associative and names an object; the link back to the archive is
literal. See `otd/README.md`.

## 3. Rejected, so it is not tried again

Blue-and-magenta acid grounds. Sixty-frames-a-second motion. HTML and CSS boards
that read as web templates. Any "track / timing / table of contents" metaphor:
these are posts, not songs. A fixed slide sequence of any length — the failure
this whole plan replaces. Type rebuilt from dots: fun, illegible. Faked assets
in code. Invented copy of any kind.
