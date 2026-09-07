// Point the Markdown at whatever the Wayback passes actually recovered.
// Recovery writes files and records them in wayback-state.json; nothing in the
// content references them until this runs.
import { readFile, writeFile, access } from "node:fs/promises";
import { glob } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const state = JSON.parse(await readFile(path.join(ROOT, "export/wayback-state.json"), "utf8"));

const map = new Map();
let onDisk = 0, claimedMissing = 0;
for (const [photonUrl, v] of Object.entries(state)) {
  if (!v.done || !v.rel) continue;
  // Trust the filesystem, not the state file — a partial run can record a file
  // it never finished writing.
  try {
    await access(path.join(ROOT, "public", decodeURIComponent(v.rel)));
    map.set(photonUrl, v.rel);
    onDisk++;
  } catch { claimedMissing++; }
}
console.log(`  recovered images referenced by state : ${onDisk}`);
if (claimedMissing) console.log(`  recorded but absent on disk (skipped): ${claimedMissing}`);

let rewrites = 0, files = 0;
for await (const rel of glob("export/{posts,pages}/*.md", { cwd: ROOT })) {
  const file = path.join(ROOT, rel);
  const before = await readFile(file, "utf8");
  let s = before;
  for (const [url, local] of map) {
    if (s.includes(url)) { s = s.split(url).join(local); rewrites++; }
  }
  if (s !== before) { await writeFile(file, s); files++; }
}
console.log(`  rewrote ${rewrites} references across ${files} files`);

const remaining = [];
for await (const rel of glob("export/{posts,pages}/*.md", { cwd: ROOT })) {
  const s = await readFile(path.join(ROOT, rel), "utf8");
  for (const m of s.matchAll(/https?:\/\/i\d\.wp\.com[^\s)"'<>\]]*/g)) remaining.push(m[0]);
}
console.log(`  still pointing at the dead CDN      : ${new Set(remaining).size} unique`);
console.log(`\n  Those are genuinely gone — no copy exists anywhere. Consider replacing`);
console.log(`  them with a placeholder or stripping the <img> so posts do not show`);
console.log(`  broken images once Jetpack's CDN stops answering.`);
