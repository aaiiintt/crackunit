# Working in this repo

crackunit.com — 1,526 posts migrated from WordPress to Astro. Read `README.md`
first for the architecture. This file is the things that will waste your time.

## The contract

**Every URL WordPress published must keep resolving.** `export/live-urls.json`
holds all 2,902 of them, snapshotted before cutover.

- **Never regenerate `live-urls.json`.** It is evidence of what the old site
  published. The WordPress install is being decommissioned; once it is gone this
  file is the only record.
- After any change touching routing, content filenames or `vercel.json`:
  ```bash
  npm run build && node scripts/verify-links.mjs
  ```
- Before claiming a deployment is good, check the *live* site too. A filesystem
  check is not a live check — see the trap below.

## Traps that have already cost time

**Astro's content store lives in `node_modules/.astro/data-store.json`**, not
`.astro/`. Deleting `.astro` alone leaves stale entries and produces build errors
referencing files that no longer exist. Clear both:
```bash
rm -rf node_modules/.astro .astro dist
```

**Percent-encoded characters in `.md` filenames break the deferred content module
resolver** (`Rolldown failed to resolve import "astro:content-layer-deferred-module?…"`).
Filenames are cosmetic — routing uses the `permalink` frontmatter — so sanitise
them. `export-wp.mjs` already does.

**`getStaticPaths` params must be decoded; hrefs must stay encoded.** Astro matches
decoded request paths, but WordPress slugs are stored percent-encoded. Three posts
and two tags contain curly apostrophes and em dashes. Decode with
`decodeURIComponent` for `params`, and use the stored `permalink` verbatim for
`href` and canonicals so they match the sitemap.

**Do not `encodeURI()` a URL from `live-urls.json`.** They are already encoded;
re-encoding turns `%e2%80%99` into `%25e2%2580%2599` and produces phantom 404s.
This cost two false alarms — once reporting a broken site that was fine, once
"explaining" it as cache warming, which it also wasn't.

**Decode URL paths before writing media to disk.** Writing `Picture%201.jpg`
literally means a browser requesting that path — which decodes to `Picture 1.jpg` —
gets a 404. This silently broke 56 files.

**The `permalink` frontmatter is authoritative, not the filename.** WordPress
derives a post's URL from its publish date, which does not always match the date
in the filename.

## Deployment

**Push to `main`.** Vercel builds from GitHub.

Do not deploy with `vercel deploy` from the CLI — it aborts partway through
uploading 2,780 files and 170 MB. The GitHub integration clones and builds
server-side instead.

## Conventions

- Design is **one file**: `src/layouts/Base.astro`, with an inline stylesheet.
  There is no CSS framework and no client-side JavaScript. Keep it that way unless
  there is a real reason not to.
- No new dependencies without asking. The site has two.
- Tag archives are bucketed once in `getStaticPaths`, not filtered per tag —
  there are 1,367 of them and filtering 1,526 posts each time is quadratic.
- `export/` is the source of truth and is read in place. Do not copy content into
  `src/`.

## If you are re-running migration scripts

They are idempotent but they hit the live WordPress site, which runs on a shared
host that returns 500s under sustained crawling. Fetch sequentially with backoff.
**Once GreenGeeks is cancelled they cannot run at all** — the source will be gone.

`wayback-rescue.mjs` and `wayback-verify.mjs` are resumable via
`export/wayback-state.json`; re-running skips what is already resolved.
