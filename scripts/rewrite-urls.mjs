import { readFile, writeFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const counts = { photon: 0, directUpload: 0, internalLink: 0, files: 0 };

const files = [];
for await (const f of glob("export/{posts,pages}/*.md", { cwd: ROOT })) files.push(path.join(ROOT, f));

for (const file of files) {
  const before = await readFile(file, "utf8");
  let s = before;

  // Jetpack Photon -> local path. Drops ?resize/?ssl query so the original is served.
  s = s.replace(
    /https?:\/\/i\d\.wp\.com\/(?:www\.)?crackunit\.com(\/wp-content\/uploads\/[^\s\)"'<>\]]+)/g,
    (_m, p) => { counts.photon++; return p.split("?")[0]; }
  );
  // Direct upload URLs -> local path.
  s = s.replace(
    /https?:\/\/(?:www\.)?crackunit\.com(\/wp-content\/uploads\/[^\s\)"'<>\]]+)/g,
    (_m, p) => { counts.directUpload++; return p.split("?")[0]; }
  );
  // Internal post links -> root-relative, so preview deploys don't leak to the live site.
  s = s.replace(
    /https?:\/\/(?:www\.)?crackunit\.com(\/(?!wp-content)[^\s\)"'<>\]]*)/g,
    (_m, p) => { counts.internalLink++; return p; }
  );

  if (s !== before) { await writeFile(file, s); counts.files++; }
}

console.log(`  files rewritten     : ${counts.files} / ${files.length}`);
console.log(`  photon -> local     : ${counts.photon}`);
console.log(`  direct -> local     : ${counts.directUpload}`);
console.log(`  internal -> relative: ${counts.internalLink}`);
