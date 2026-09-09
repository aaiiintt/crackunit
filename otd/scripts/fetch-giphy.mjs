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
// Output: public/giphy/<kind>/<slug>/<id>.gif plus public/giphy/manifest.json,
// the library's catalog: id, kind, query, title, width, height, frames (when
// Giphy reports them), url, the Giphy attribution fields, and three fields kept
// by hand so agents can find things again: `words` (the query and any word the
// sticker was chosen for), `mood` (free text), `usedOn` (days, "MM-DD"), and
// `keep` (false for junk that stays catalogued so it is not fetched twice).
// The folder is the library; it is committed. `--restore` re-downloads every
// catalogued item by id for a fresh clone. `--sync` reconciles the catalog with
// the folder after Iain has deleted GIFs by hand: each missing file is marked
// `keep: false`, `prunedBy: "iain"`, `prunedOn: <date>`, and the cut is printed
// by query so the next fetch can learn from it. `giphy-sheet.mjs` draws the catalog. Giphy's terms require "Powered by GIPHY"
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
const queries = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].match(/^--(limit|rating|words|for)$/)));
// The query names an object; `words` are the post's own words that earned it.
// Search "turntable", tag it "techno, records" — the search is associative, the
// link back to the archive stays literal, and stickerFor still only fires on a
// word the post itself uses.
const extraWords = String(flag("words", "") || "").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean);
const fetchedFor = String(flag("for", "") || "").split(",").map((w) => w.trim()).filter(Boolean);
const restore = args.includes("--restore");
const sync = args.includes("--sync");

if (sync) { // Iain pruned by hand; the catalog follows
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  const cut = [], kept = [];
  for (const it of manifest.items) {
    const present = existsSync(join(outRoot, it.file.replace(/^giphy\//, "")));
    if (!present && it.keep !== false) { it.keep = false; it.prunedBy = "iain"; it.prunedOn = today; cut.push(it); }
    else if (present && it.keep !== false) kept.push(it);
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  const byQ = (list) => { const m = new Map(); for (const it of list) m.set(it.query, (m.get(it.query) || 0) + 1); return m; };
  const c = byQ(cut), k = byQ(kept);
  console.log(`pruned ${cut.length}, kept ${kept.length}\n`);
  for (const q of new Set([...c.keys(), ...k.keys()].sort())) console.log(`${q.padEnd(14)} kept ${String(k.get(q) || 0).padStart(2)}  cut ${String(c.get(q) || 0).padStart(2)}`);
  if (cut.length) { console.log("\ncut:"); for (const it of cut) console.log(`  ${it.query.padEnd(14)} ${it.id.padEnd(22)} ${it.frames ?? "?"}f  ${it.title}`); }
  process.exit(0);
}

if (queries.length === 0 && !restore) {
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

if (restore) { // rebuild the folder from the catalog, by id
  let n = 0;
  for (const it of manifest.items) {
    const file = join(outRoot, it.file.replace(/^giphy\//, ""));
    if (existsSync(file) || it.keep === false) continue;
    const res = await fetch(`https://api.giphy.com/v1/gifs/${it.id}?api_key=${encodeURIComponent(key)}`, { headers: { "User-Agent": "crackunit-otd/0.1" } });
    if (!res.ok) { console.error(`  ${it.id}: HTTP ${res.status}`); await sleep(1500); continue; }
    const { data } = await res.json();
    const url = data?.images?.original?.url;
    if (!url) { console.error(`  ${it.id}: no original`); continue; }
    const r = await fetch(url);
    if (!r.ok) { console.error(`  ${it.id}: HTTP ${r.status}`); continue; }
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, Buffer.from(await r.arrayBuffer())); n++;
    await sleep(600);
  }
  console.log(`restored ${n} files from the catalog`);
  process.exit(0);
}

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
          words: [...new Set([q, ...extraWords])], mood: "", usedOn: [], keep: true,
          ...(fetchedFor.length ? { fetchedFor } : {}),
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
