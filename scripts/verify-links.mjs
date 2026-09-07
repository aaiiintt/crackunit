// Asserts every URL WordPress currently publishes resolves in the built site.
// Static output, so this is a filesystem check — no server needed.
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIST = path.join(ROOT, "dist");
const live = JSON.parse(await readFile(path.join(ROOT, "export/live-urls.json"), "utf8"));

// Paths Vercel rewrites rather than emitting as directories.
const REWRITES = new Map([["/feed/", "/feed.xml"], ["/comments/feed/", "/feed.xml"]]);

const exists = async (p) => { try { await access(path.join(DIST, p)); return true; } catch { return false; } };

const missing = [];
let ok = 0;
for (const url of live) {
  const p = decodeURIComponent(new URL(url).pathname);
  const target = REWRITES.get(p) ?? path.posix.join(p, "index.html");
  if (await exists(target)) ok++;
  else missing.push({ url, expected: target });
}

console.log(`  live URLs checked : ${live.length}`);
console.log(`  resolve in build  : ${ok}`);
console.log(`  MISSING           : ${missing.length}`);
if (missing.length) {
  const byKind = {};
  for (const m of missing) {
    const p = new URL(m.url).pathname;
    const k = /^\/\d{4}\//.test(p) ? "post" : p.split("/")[1] || "root";
    (byKind[k] ??= []).push(p);
  }
  for (const [k, list] of Object.entries(byKind)) {
    console.log(`\n  ${k}: ${list.length}`);
    for (const p of list.slice(0, 8)) console.log(`    ${p}`);
    if (list.length > 8) console.log(`    ...and ${list.length - 8} more`);
  }
  process.exitCode = 1;
} else {
  console.log("\n  No link rot: every published URL resolves.");
}
