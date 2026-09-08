#!/usr/bin/env node
// Fetch animated GIFs and transparent stickers from Giphy into otd/public/giphy/.
//
//   node scripts/fetch-giphy.mjs goose "disco ball" "dial up" --stickers --limit 12
//   node scripts/fetch-giphy.mjs "windows 98" --gifs --limit 8 --rating g
//
// Reads GIPHY_API_KEY from the environment, or from a .env file in otd/ or the repo
// root (KEY=value lines; never committed, see .gitignore). Uses the public REST API
// (api.giphy.com/v1), not the React Native SDK, which wraps the same endpoints.
//
// Output: public/giphy/<kind>/<slug>/<id>.gif plus public/giphy/manifest.json with
// id, kind, query, title, width, height, frames (when Giphy reports them), url,
// and the Giphy attribution fields. Giphy's terms require "Powered by GIPHY"
// attribution wherever the GIFs are shown; the site footer and the video's
// studio card carry it when any Giphy asset is used (manifest.attribution).
//
// Re-running is cheap: files that exist are skipped. Sequential with a pause so
// the free-tier rate limit (42 requests per hour on a beta key) is respected.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const otd = join(here, "..");
const outRoot = join(otd, "public", "giphy");
const manifestPath = join(outRoot, "manifest.json");

function loadEnv() {
  if (process.env.GIPHY_API_KEY) return process.env.GIPHY_API_KEY;
  for (const f of [join(otd, ".env"), join(otd, "..", ".env")]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split("\n")) {
      const m = line.match(/^\s*GIPHY_API_KEY\s*=\s*["']?([^"'\s]+)/);
      if (m) return m[1];
    }
  }
  return null;
}

const args = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return dflt;
  const v = args[i + 1];
  return v && !v.startsWith("--") ? v : true;
};
const kinds = [];
if (args.includes("--stickers")) kinds.push("stickers");
if (args.includes("--gifs")) kinds.push("gifs");
if (kinds.length === 0) kinds.push("stickers");
const limit = Number(flag("limit", 10));
const rating = flag("rating", "g");
const queries = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].match(/^--(limit|rating)$/)));

if (queries.length === 0) {
  console.error('usage: fetch-giphy.mjs <query>... [--stickers] [--gifs] [--limit N] [--rating g|pg]');
  process.exit(2);
}
const key = loadEnv();
if (!key) {
  console.error("GIPHY_API_KEY not found in env, otd/.env or ../.env");
  process.exit(1);
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { attribution: "Powered by GIPHY", items: [] };
const have = new Set(manifest.items.map((it) => it.id));

for (const kind of kinds) {
  for (const q of queries) {
    const url = `https://api.giphy.com/v1/${kind}/search?api_key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&limit=${limit}&rating=${rating}&lang=en`;
    const res = await fetch(url, { headers: { "User-Agent": "crackunit-otd/0.1" } });
    if (!res.ok) {
      console.error(`${kind} "${q}": HTTP ${res.status}`);
      continue;
    }
    const { data } = await res.json();
    const dir = join(outRoot, kind, slug(q));
    mkdirSync(dir, { recursive: true });
    let n = 0;
    for (const g of data) {
      const orig = g.images?.original;
      if (!orig?.url) continue;
      const file = join(dir, `${g.id}.gif`);
      if (!existsSync(file)) {
        const r = await fetch(orig.url);
        if (!r.ok) { console.error(`  skip ${g.id}: HTTP ${r.status}`); continue; }
        writeFileSync(file, Buffer.from(await r.arrayBuffer()));
        await sleep(400);
      }
      if (!have.has(g.id)) {
        manifest.items.push({
          id: g.id, kind, query: q, title: g.title || "",
          width: Number(orig.width), height: Number(orig.height),
          frames: orig.frames ? Number(orig.frames) : null,
          bytes: orig.size ? Number(orig.size) : null,
          file: `giphy/${kind}/${slug(q)}/${g.id}.gif`,
          giphyUrl: g.url, user: g.user?.username || null, rating: g.rating,
        });
        have.add(g.id);
      }
      n++;
    }
    console.log(`${kind} "${q}": ${n} files in ${dir}`);
    await sleep(1500);
  }
}
manifest.items.sort((a, b) => a.file.localeCompare(b.file));
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`manifest: ${manifest.items.length} items → ${manifestPath}`);
