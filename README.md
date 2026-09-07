# crackunit.com

Iain Tait's blog, 2005–2021. **1,526 posts**, migrated from WordPress to Astro in
September 2026 with every published URL preserved exactly.

Live at <https://www.crackunit.com>.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Site generator | **Astro 7** (static output) | 3,043 pages build in ~5s; no runtime, no database |
| Content | **Markdown in `export/`** | The archive is portable text in git, not trapped in a CMS schema |
| Media | **Files in `public/`** | 1,250 files, 170 MB. No CDN dependency — see *Why the images are local* |
| Hosting | **Vercel**, building from GitHub | The CLI aborts uploading 2,780 files; Vercel clones and builds instead |
| DNS | **Cloudflare**, grey-clouded | DNS only. Vercel terminates TLS and serves its own edge |

Node 24. No CSS framework, no client-side JS, no dependencies beyond Astro and
`@astrojs/rss` — the pages are static HTML with a single inline stylesheet.

---

## The one rule: URLs never change

WordPress published **2,902 URLs**. All 2,902 resolve on the new site, with no
redirect map. That is the whole point of the migration, and it is enforced by a
script rather than by care:

```bash
npm run build && node scripts/verify-links.mjs   # checks the built dist/
node scripts/verify-live.mjs                     # checks the deployed site
```

`export/live-urls.json` is the contract — a snapshot of the WordPress sitemap
taken before cutover. **Do not regenerate it.** It is the record of what the old
site published, and its only job is to be checked against.

Each post's `permalink` frontmatter field is authoritative for routing. It was
derived at export time and is not recomputed, because WordPress's URL date comes
from the post's *publish date*, which does not always match its filename.

---

## Layout

```
export/            The archive. Source of truth, read in place by Astro.
  posts/           1,526 Markdown files, one per post
  pages/           5 standalone pages
  taxonomy.json    tag/category/author name → slug (URLs use slugs, posts store names)
  live-urls.json   the 2,902-URL contract from WordPress
  wayback-state.json  what the Internet Archive did and did not have
public/            Media, served at the paths posts reference
src/
  content.config.ts   Collections; loads from export/ via the glob loader
  lib/posts.ts        Sorting, permalink parsing, date formatting
  lib/taxonomy.ts     name → slug bridge
  layouts/Base.astro  The entire design: one file, one inline stylesheet
  pages/              Routes (below)
scripts/           Migration and verification tooling
```

### Routes

| Route | Count | Notes |
|---|---|---|
| `/[year]/[month]/[day]/[slug]/` | 1,526 | Dated permalinks, exactly as WordPress had them |
| `/tag/[slug]/` | 1,367 | Bucketed once, not filtered per tag |
| `/category/[slug]/` | 12 | |
| `/type/[format]/` | 3 | `image`, `quote`, `video` — WordPress post-format archives, still indexed |
| `/author/[slug]/` | 1 | |
| `/[slug]/` | 5 | Root-level pages |
| `/`, `/page/[n]/` | — | Paginated index; page 1 is `/`, matching WordPress |
| `/archive/` | 1 | Every post by year. New — additive, not a preserved URL |
| `/feed/` | — | RSS. A `vercel.json` rewrite serves it at the original path, not a redirect |
| `/sitemap.xml` | — | Hand-rolled, ~20 lines, no integration needed |

---

## Working on it

```bash
npm install
npm run dev      # local dev server
npm run build    # static build into dist/
npm run verify   # assert the 2,902 URLs resolve in dist/
```

Deployment is automatic: **push to `main` and Vercel builds from GitHub.**

---

## Why the images are local

Almost no image on this blog was served from crackunit.com. They were proxied
through **Jetpack's Photon CDN** (`i0.wp.com/<original-host>/…`), including images
whose original hosts died years ago. Photon was the only thing still rendering
them, and it would have gone dark with the WordPress install — silently, some
time after the migration looked successful.

- **777** original uploads, pulled through the CDN rather than the failing origin
- **406** third-party images rescued: 373 still alive at the source, 33 recovered
  from the Internet Archive
- **561** references are unrecoverable. Skitch, Posterous and Photobucket account
  for nearly all of them; those services shut down years ago and the Archive has
  no capture. Listed in `export/unrecoverable.json`.

The media library API listed only a fraction of what posts actually referenced —
284 paths in post bodies were missing from it entirely. **Derive the media list
from post content, not the media endpoint.**

## Why 458 videos work again

342 posts embedded video with Flash `<object>` tags. Flash was removed from
browsers in 2020, so those had rendered as empty boxes for years — on WordPress
too. They are now modern iframes: **389 YouTube, 61 Vimeo, 6 SoundCloud, 2
Dailymotion**. 43 were dropped where the platform no longer exists (Flickr Flash
slideshows, SlideShare's ssplayer, DivShare, Break, blip.tv, PodTech, Brightcove).

Pages with a working embed went from 51 to 360.

---

## Scripts

These ran once during the migration. They are kept because they document how the
archive was produced, and because the Wayback recovery is still resumable.

| Script | What it did |
|---|---|
| `export-wp.mjs` | Pulled posts and pages from the WordPress REST API |
| `capture-sitemap.mjs` | Snapshotted the 2,902-URL contract before cutover |
| `fetch-taxonomy.mjs` | tag/category/author name → slug mapping |
| `fetch-media.mjs` | Downloaded uploads via the CDN |
| `rescue-thirdparty.mjs` | Localised third-party images still alive at source |
| `wayback-rescue.mjs` | Pass 1: recovered dead images from the Internet Archive |
| `wayback-verify.mjs` | Pass 2: re-checks misses, since archive.org returns throttled empties |
| `apply-wayback.mjs` | Points the Markdown at whatever was recovered |
| `rewrite-urls.mjs` | Photon and absolute URLs → local, root-relative paths |
| `fix-flash-embeds.mjs` | Flash `<object>` → iframes |
| `fix-media-names.mjs` | Decoded percent-encoded filenames on disk |
| `fix-broken-refs.mjs` | Repaired five 2006-era malformed image references |
| `verify-links.mjs` | URL contract against `dist/` |
| `verify-live.mjs` | URL contract against the deployed site |

## Known gaps

- **The apex does not redirect to `www`.** A `vercel.json` `has: host` redirect is
  deployed but does not fire; cause unknown. Both hostnames serve the site.
  Canonicals all point at `www`, so search consolidates correctly. Fix properly in
  Vercel → Settings → Domains → `crackunit.com` → *Redirect to* `www`, 308.
- **561 images are gone for good.** See `export/unrecoverable.json`.
- Two posts link to `.swf` files in prose. Those are historical links, deliberately
  left alone.
