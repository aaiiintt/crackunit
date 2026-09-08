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
| 2026-09-08 | C, D2-lite, E, G, H (dry run) | Sonnet 5 subagents ×5 | est. $6 to $9 | Scaffold 146k tokens, data pipeline 169k, splitter fix 98k, site 141k, composition 369k (mixed in/out; Sonnet rates). Fable orchestration on top: see `/cost`. |
| 2026-09-07 | A + B | Fable 5.1 | fill from `/cost` | Plan v2, ART-DIRECTION v1, this file. A and B were done in one session because the references and the archive facts were already in context; a second session would have paid to re-load them. Expect $10 to $14 combined against a $22 cap. |

## Render time

Filled in at Phase G. Decides the batch strategy.

| Day | Archetype | Frames | Wall time | Machine |
|---|---|---|---|---|
| 09-12 | A1, CSS 3D, no loops | 720 | 2m 32s | 4-core cloud container, concurrency 4 |
