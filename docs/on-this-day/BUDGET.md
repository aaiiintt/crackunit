# BUDGET.md, the $100 ledger

Every session ends with `/cost` and a line in the log below. A phase over its cap
stops and reports instead of pushing on. Caps are from `PLAN.md` Part 4.

## How to run a session

1. Start a fresh session. Do not resume the previous one.
2. Open with: `PLAN.md` Part 5 for your phase, `ART-DIRECTION.md`, and nothing else.
   Read the day JSONs with scripts and `head`, never whole.
3. Use the model in the table. Escalate to Opus 5 only for one stuck problem, once.
4. Downscale any image to 540 px before a model looks at it. Iain reviews stills.
5. End with `/cost`. Append the line. Commit `BUDGET.md` with the work.

Prices used for estimates, per million tokens: Fable 5.1 $10 in / $50 out, cache
read $0.25. Opus 5 $5 / $25. Sonnet 5 $2 / $10. Haiku 4.5 $1 / $5. Batch API is
half price.

## Caps

| Phase | Model | Cap | Status |
|---|---|---|---|
| A Review + plan | Fable 5.1 | $8 | done |
| B Creative bible | Fable 5.1 | $14 | done, in the same session as A |
| C Scaffold + data | Sonnet 5 | $10 | |
| D The line | Haiku 4.5 batch, Sonnet spot-check | $4 | |
| D2 Asset generation batch | Sonnet 5 | $4 | |
| E Procedural junk + R3F | Sonnet 5 | $12 | |
| F Look-dev stills | Sonnet 5, one Fable pass | $16 | |
| G Motion + first render | Sonnet 5 | $14 | |
| H Site | Sonnet 5 | $8 | |
| I Batch tooling + QA | Sonnet 5 | $4 | |
| Reserve | | $6 | |
| **Total** | | **$100** | |

## Log

| Date | Phase | Model | Cost | Notes |
|---|---|---|---|---|
| 2026-09-08 | Stage 1, round three (Mac) | Fable 5.1, one Explore agent | fill from `/cost`; est. $8 to $12 | GIF library and catalog, wayback-page.mjs, lib.js ops, twelve sketches, 36 renders reviewed. Reviewing sheets at 1500 px is the main cost. |
| 2026-09-08 | Stage 1, round two (Mac) | Fable 5.1, one Explore agent | fill from `/cost`; est. $6 to $9 | Plan for p5, lib.js, eight sketches, 24 renders reviewed at 700 px. |
| 2026-09-08 | Stage 1, session one (Mac) | Fable 5.1, no subagents | fill from `/cost`; est. $4 to $6 | First hour (pull, fonts, frames, render.mjs) plus six of the nine look boards and the Raytraced asset order. Rendering is 5 s for six stills; the cost is reading refs and material, and reviewing stills at 800 px. |
| 2026-09-08 | C, D2-lite, E, G, H (dry run) | Sonnet 5 subagents ×5 | est. $6 to $9 | Scaffold 146k tokens, data pipeline 169k, splitter fix 98k, site 141k, composition 369k (mixed in/out; Sonnet rates). Fable orchestration on top: see `/cost`. |
| 2026-09-07 | A + B | Fable 5.1 | fill from `/cost` | Plan v2, ART-DIRECTION v1, this file. A and B were done in one session because the references and the archive facts were already in context; a second session would have paid to re-load them. Expect $10 to $14 combined against a $22 cap. |

## Render time

Filled in at Phase G. Decides the batch strategy.

| Day | Archetype | Frames | Wall time | Machine |
|---|---|---|---|---|
| 09-12 | A1, CSS 3D, no loops | 720 | 2m 32s (round one), 2m 15s (round two) | 4-core cloud container, concurrency 4 |
| 09-08 | A6 | 720 | 1m 19s | same |
| 09-09 | A4 | 720 | 1m 43s | same |
| 09-10 | A7 | 720 | 1m 33s | same |
| 09-11 | A3 | 720 | 1m 17s | same |

Five days: about 9 minutes of machine time. All 340 would be roughly 9 hours on this box before loops and R3F are added. Render only the days being posted.
