// Files were written using the raw URL pathname, so a filename containing a space
// landed on disk as "Picture%201.jpg". A browser requesting that path decodes it
// back to "Picture 1.jpg" and 404s. Decode the names on disk so they match.
import { rename, mkdir, writeFile, access } from "node:fs/promises";
import { glob } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
let renamed = 0, collided = 0;

const hits = [];
for await (const f of glob("public/**/*%*", { cwd: ROOT })) hits.push(f);

for (const rel of hits) {
  const from = path.join(ROOT, rel);
  const dir = path.dirname(from);
  const base = path.basename(from);
  let decoded;
  try { decoded = decodeURIComponent(base); } catch { continue; }
  if (decoded === base) continue;
  const to = path.join(dir, decoded);
  try { await access(to); collided++; continue; } catch {}
  await rename(from, to);
  renamed++;
}
console.log(`  renamed ${renamed} files to their decoded names (${collided} skipped: target existed)`);

// Three 2006 posts reference PNGs with spaces that were never in the media list.
const extra = [
  "/wp-content/uploads/2006/02/Picture 1.png",
  "/wp-content/uploads/2006/06/Picture 2.png",
  "/wp-content/uploads/2006/05/Picture 1.png",
];
let got = 0;
for (const p of extra) {
  const out = path.join(ROOT, "public", p);
  try { await access(out); got++; continue; } catch {}
  const r = await fetch(`https://i0.wp.com/www.crackunit.com${encodeURI(p)}?ssl=1`);
  if (!r.ok) { console.log(`  ! ${r.status} ${p}`); continue; }
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await r.arrayBuffer()));
  got++;
}
console.log(`  fetched ${got}/${extra.length} space-named PNGs`);
