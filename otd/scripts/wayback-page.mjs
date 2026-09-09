#!/usr/bin/env node
// Capture crackunit.com as the Wayback Machine holds it nearest to a day's
// posts: the homepage and every permalink that day, one screenshot each.
//
//   node scripts/wayback-page.mjs 11-09
//   node scripts/wayback-page.mjs 11-09 --force      # re-shoot existing
//
// CDX first (archive.org returns 503s and empty-200s under load, so an empty
// answer is believed only after two clean ones), then Google Chrome through
// playwright-core screenshots https://web.archive.org/web/<ts>/<url> at
// 1024 × 768, full page, with Wayback's toolbar hidden. Output:
//   otd/captures/MM-DD/wayback/<slug>-<ts>.png
//   otd/captures/MM-DD/wayback/wayback.json   { items: [{ slug, url, year, ts, file | none }] }
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = dirname(fileURLToPath(import.meta.url));
const otd = join(here, "..");
const args = process.argv.slice(2);
const day = args.find((a) => /^\d\d-\d\d$/.test(a));
if (!day) { console.error("usage: wayback-page.mjs MM-DD [--force]"); process.exit(2); }
const force = args.includes("--force");
const d = JSON.parse(readFileSync(join(otd, "data", "days", `${day}.json`), "utf8"));
const outDir = join(otd, "captures", day, "wayback");
mkdirSync(outDir, { recursive: true });
const statePath = join(outDir, "wayback.json");
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")) : { items: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// targets: the homepage per year, then each post
const targets = [];
for (const y of [...new Set(d.posts.map((p) => p.year))]) targets.push({ slug: `home-${y}`, url: "http://www.crackunit.com/", year: y, near: `${y}${day.replace("-", "")}120000` });
for (const p of d.posts) targets.push({ slug: `${p.year}-${p.slug}`, url: `http://www.crackunit.com${p.permalink}`, year: p.year, near: p.date.replace(/\D/g, "").slice(0, 14) });

async function cdx(url, year) {
  // nearest snapshot within a year either side, by timestamp distance
  const q = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&filter=statuscode:200&fl=timestamp,original&from=${year - 1}&to=${year + 1}&limit=400`;
  let empties = 0;
  for (let a = 1; a <= 5; a++) {
    try {
      const r = await fetch(q, { signal: AbortSignal.timeout(45000), headers: { "User-Agent": "crackunit-otd/0.1" } });
      if (r.status === 429 || r.status === 503) { await sleep(a * 8000); continue; }
      if (!r.ok) { await sleep(a * 3000); continue; }
      const rows = await r.json();
      if (!rows || rows.length < 2) { if (++empties >= 2) return []; await sleep(2500); continue; }
      return rows.slice(1).map(([ts, orig]) => ({ ts, orig }));
    } catch { await sleep(a * 4000); }
  }
  return null; // undecided
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
try {
  for (const t of targets) {
    const prev = state.items.find((i) => i.slug === t.slug);
    if (prev && !force && (prev.file ? existsSync(join(outDir, prev.file)) : prev.none)) { console.log(`${t.slug}: ${prev.file || "none"} (kept)`); continue; }
    process.stdout.write(`${t.slug}  ${t.url} … `);
    const hits = await cdx(t.url, t.year);
    const item = { slug: t.slug, url: t.url, year: t.year };
    if (hits === null) { item.undecided = true; console.log("cdx undecided"); }
    else if (hits.length === 0) { item.none = true; console.log("no snapshot within a year"); }
    else {
      const near = Number(String(t.near).padEnd(14, "0"));
      hits.sort((a, b) => Math.abs(Number(a.ts) - near) - Math.abs(Number(b.ts) - near));
      const { ts, orig } = hits[0];
      item.ts = ts; item.original = orig; item.snapshot = `https://web.archive.org/web/${ts}/${orig}`;
      try {
        await page.goto(item.snapshot, { waitUntil: "domcontentloaded", timeout: 90000 });
        await page.addStyleTag({ content: "#wm-ipp-base, #wm-ipp-print, #donato { display: none !important }" });
        await page.waitForTimeout(2500);
        item.file = `${t.slug}-${ts}.png`;
        await page.screenshot({ path: join(outDir, item.file), fullPage: true });
        item.title = await page.title();
        console.log(`${ts} → ${item.file}`);
      } catch (e) { item.error = String(e.message).split("\n")[0]; console.log(`shot failed: ${item.error}`); }
    }
    state.items = state.items.filter((i) => i.slug !== t.slug).concat(item);
    writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n");
    await sleep(1200);
  }
} finally { await browser.close(); }
console.log(`→ ${statePath}`);
