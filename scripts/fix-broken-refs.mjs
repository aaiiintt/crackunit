// Five 2006-era posts carry image markup that predates the site working properly.
// Repair the recoverable ones; drop the references that never pointed at anything.
import { readFile, writeFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
let fixed = 0, dropped = 0, files = 0;

for await (const rel of glob("export/{posts,pages}/*.md", { cwd: ROOT })) {
  const file = path.join(ROOT, rel);
  const before = await readFile(file, "utf8");
  let s = before;

  // ![alt](</wp-content/... with spaces.png>)  ->  percent-encoded, no angle brackets
  s = s.replace(/!\[([^\]]*)\]\(<(\/wp-content\/[^>]+)>\)/g, (_m, alt, p) => {
    fixed++;
    return `![${alt}](${p.split("/").map(encodeURIComponent).join("/")})`;
  });

  // An <img> that lost its src in 2006: no image behind it, so drop the image and
  // keep any link that wrapped it.
  s = s.replace(/\[!\[[^\]]*\]\(Fuerzabruta\)\]\(([^)]+)\)/g, (_m, href) => {
    dropped++;
    return `[Fuerzabruta](${href})`;
  });

  // A local desktop path that was never served to anyone.
  s = s.replace(/!?\[[^\]]*\]\(file:\/\/\/[^)]*\)/g, () => { dropped++; return ""; });

  if (s !== before) { await writeFile(file, s); files++; }
}
console.log(`  repaired ${fixed} space-named image refs`);
console.log(`  dropped ${dropped} references that never resolved`);
console.log(`  touched ${files} files`);
