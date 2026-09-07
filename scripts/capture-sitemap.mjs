import { writeFile } from "node:fs/promises";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "..");
const SITE = "https://www.crackunit.com";

const idx = await (await fetch(`${SITE}/wp-sitemap.xml`)).text();
const maps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const urls = new Set();
for (const m of maps) {
  const xml = await (await fetch(m)).text();
  for (const u of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(u[1]);
  process.stdout.write(`\r  ${urls.size} URLs from ${maps.indexOf(m) + 1}/${maps.length} sitemaps   `);
  await new Promise((r) => setTimeout(r, 400));
}
const list = [...urls].sort();
await writeFile(path.join(ROOT, "export/live-urls.json"), JSON.stringify(list, null, 2));
const byKind = {};
for (const u of list) {
  const p = new URL(u).pathname;
  const kind = /^\/\d{4}\/\d{2}\/\d{2}\//.test(p) ? "post"
    : p.startsWith("/category/") ? "category"
    : p.startsWith("/tag/") ? "tag"
    : p.startsWith("/author/") ? "author"
    : p === "/" ? "home" : "page/other";
  byKind[kind] = (byKind[kind] || 0) + 1;
}
console.log(`\n  total: ${list.length}`);
for (const [k, v] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) console.log(`    ${String(v).padStart(5)}  ${k}`);
