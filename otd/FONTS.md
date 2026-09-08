# Font mapping — dry run

What ART-DIRECTION.md section 3 ("Type") asks for, against what is actually
available in this sandbox. Sandbox has no internet access beyond
`fonts.googleapis.com` / `fonts.gstatic.com` and `registry.npmjs.org` — none
of the Mac-only faces can be fetched here. `fc-list` output backing this is
from this box, not the target render machine.

| Bible register | Bible face | Status here | What's actually loaded |
|---|---|---|---|
| Serif | Times New Roman Regular + Italic | **Needs Mac copy.** Not installed, not downloadable (proprietary, MS core fonts). | `Liberation Serif` (`fc-list`: `/usr/share/fonts/truetype/liberation/LiberationSerif-*.ttf`). Metric-compatible with Times New Roman — same line breaks, different letterforms. |
| Serif (page beat only) | Redaction 50 | Not sourced this pass. Out of scope for the dry run. | — |
| Grotesk | Arial Bold | **Needs Mac copy.** Not installed, not downloadable. | `Liberation Sans` (`LiberationSans-Bold.ttf`), metric-compatible with Arial. |
| Condensed italic | Anton (skewX -12deg) | **Available.** Open licence, downloaded from Google Fonts. | `Anton-Regular.woff2` in `public/fonts/`. Skew is applied in CSS, not baked into the file. |
| Mono | Courier New Regular | **Needs Mac copy.** Not installed, not downloadable. | `Liberation Mono` (`LiberationMono-Regular.ttf`), metric-compatible with Courier New. |
| Bitmap | W95FA (primary) | **Needs external copy.** Not on this box, not a Mac system font either — it's a third-party pixel-font redistribution (dafont/FontStruct-style), not part of Apple's Supplemental set. Needs sourcing separately from a real device/archive. | Not substituted; left absent for this dry run. |
| Bitmap | Silkscreen (captions) | **Available.** Open licence, downloaded from Google Fonts. | `Silkscreen-Regular.woff2` in `public/fonts/`. |
| Script | Brush Script MT | **Needs Mac copy.** Not installed, not downloadable. | No fallback substituted (no Liberation equivalent exists for a script face) — left absent for this dry run; the real build should not silently fall back to a non-script face for this register, since the bible calls out this as a one-word, high-visibility element. |
| Impact | Impact | **Needs Mac copy.** Not installed, not downloadable. | Bible's own documented fallback: Anton (already downloaded above). |
| Variable | Anybody (wdth+wght) | **Available.** True variable font — one file carries both axes. | `Anybody-Variable.woff2` in `public/fonts/`. `font-weight: 100 900`, `font-stretch: 50% 150%` (Google's actual served range; the bible's animated range of wdth 50→150, wght 700 fits inside it). |

## To do before this stops being a dry run

Six faces need a `.ttf` pulled from a real Mac's
`/System/Library/Fonts/Supplemental/`, per ART-DIRECTION.md section 3:

- `Times New Roman.ttf`
- `Arial Bold.ttf`
- `Courier New.ttf`
- `Impact.ttf`
- `Brush Script.ttf`
- `W95FA.otf` (not actually a Mac font — source from wherever the reference
  archive keeps it; flagged here only because the build brief grouped it
  with the other Mac-sourced faces)

Copy them into `otd/public/fonts/` under the filenames `src/fonts.ts`
expects, and add matching `FontFace` calls there. Nothing else in this
scaffold needs to change — the fallback stack (`Liberation Serif` /
`Liberation Sans` / `Liberation Mono`) is already wired up and can just stay
as the `font-family` fallback after the real face, e.g.
`"Times New Roman", "Liberation Serif", serif`.

## How the two Google Fonts were actually fetched

`fonts.googleapis.com/css2` truncates a variable font to a single static
instance unless the full axis range is requested explicitly. For Anybody,
Google's served range turned out to be `wdth: 50–150`, `wght: 100–900` (the
bible's own `wdth 25..151` guess doesn't match what's actually hosted — 25
and 151 both 400). Confirmed by binary-searching the css2 endpoint:

```
https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900&display=swap
```

That request's `latin` `@font-face` block points at a single woff2 with
`font-weight: 100 900; font-stretch: 50% 150%` — genuinely variable on both
axes in one file, which is what got saved as `Anybody-Variable.woff2`.
