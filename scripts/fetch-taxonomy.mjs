import { writeFile } from "node:fs/promises";
import path from "node:path";
const API = "https://www.crackunit.com/wp-json/wp/v2";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The taxonomy endpoints ignore an out-of-range `offset` and re-serve the first
// page, so the loop must be bounded by x-wp-total, not by an empty response.
async function all(kind) {
  const out = [];
  let total = Infinity;
  for (let offset = 0; offset < total; offset += 100) {
    let ok = false;
    for (let a = 1; a <= 3; a++) {
      try {
        const r = await fetch(`${API}/${kind}?per_page=100&offset=${offset}`);
        if (r.ok) {
          if (total === Infinity) total = Number(r.headers.get("x-wp-total") || 0);
          const batch = await r.json();
          if (!batch.length) { total = out.length; break; }
          out.push(...batch.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t.count })));
          ok = true;
          break;
        }
        if (r.status === 400) { total = out.length; ok = true; break; }
      } catch {}
      await sleep(a * 1500);
    }
    if (!ok) break;
    process.stdout.write(`\r  ${kind}: ${out.length}/${total === Infinity ? "?" : total}   `);
    await sleep(250);
  }
  // Belt and braces: dedupe by id in case a page was re-served.
  const seen = new Map(out.map((t) => [t.id, t]));
  process.stdout.write(`\r  ${kind}: ${seen.size} unique\n`);
  return [...seen.values()];
}

const categories = await all("categories");
const tags = await all("tags");
const users = await all("users");
await writeFile(
  path.resolve(import.meta.dirname, "../export/taxonomy.json"),
  JSON.stringify({ categories, tags, users }, null, 2)
);
console.log(`  categories ${categories.length}, tags ${tags.length}, authors ${users.length}`);
console.log("  authors:", users.map((u) => `${u.name} -> /author/${u.slug}/`).join(", "));
