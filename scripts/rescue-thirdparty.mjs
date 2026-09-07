import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { glob } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const probe = JSON.parse(await readFile(path.join(ROOT, "export/photon-probe.json"), "utf8"));
const alive = probe.filter((r) => [200, 206].includes(r.status));

// Where a rescued image lands. Same-domain legacy paths (e.g. /wp-content/image_well/)
// keep their original path; genuinely third-party images are namespaced by host.
function localPath(url, host) {
  const inner = decodeURIComponent(url).replace(/^https?:\/\/i\d\.wp\.com\//, "");
  const rest = inner.slice(host.length).split("?")[0];
  if (/(^|\.)crackunit\.com$/.test(host)) return rest;
  return `/wp-content/rescued/${host}${rest}`;
}

const map = new Map();
let ok = 0, bytes = 0;
const failed = [];
const queue = [...alive];

await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    const { url, host } = queue.pop();
    const rel = localPath(url, host);
    const out = path.join(ROOT, "public", decodeURIComponent(rel));
    map.set(url, rel);
    try { await access(out); ok++; continue; } catch {}
    // Ask for the original, not the resized derivative.
    const bare = url.split("?")[0];
    let saved = false;
    for (const candidate of [bare, url]) {
      try {
        const res = await fetch(candidate);
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        if (!buf.length) continue;
        await mkdir(path.dirname(out), { recursive: true });
        await writeFile(out, buf);
        bytes += buf.length; ok++; saved = true;
        break;
      } catch {}
    }
    if (!saved) failed.push(url);
    process.stdout.write(`\r  rescued ${ok}/${alive.length} (${(bytes / 1048576).toFixed(1)} MB)   `);
  }
}));

console.log(`\n  rescued: ${ok}, failed: ${failed.length}, ${(bytes / 1048576).toFixed(1)} MB`);

// Rewrite the markdown to point at the rescued copies.
let rewrites = 0, filesTouched = 0;
const files = [];
for await (const f of glob("export/{posts,pages}/*.md", { cwd: ROOT })) files.push(path.join(ROOT, f));
for (const file of files) {
  const before = await readFile(file, "utf8");
  let s = before;
  for (const [url, rel] of map) {
    if (s.includes(url)) { s = s.split(url).join(rel); rewrites++; }
  }
  if (s !== before) { await writeFile(file, s); filesTouched++; }
}
console.log(`  rewrote ${rewrites} references across ${filesTouched} files`);

await writeFile(
  path.join(ROOT, "export/unrecoverable.json"),
  JSON.stringify(probe.filter((r) => ![200, 206].includes(r.status)).map((r) => r.url), null, 2)
);
console.log(`  ${probe.length - alive.length} dead URLs -> export/unrecoverable.json`);
