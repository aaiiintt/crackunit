// Runs before `astro build` (npm "prebuild" lifecycle). Populates
// site/public/fonts and site/public/cover from otd/public and otd/out/cover,
// generating a flat BLUE placeholder cover for any day whose real cover
// hasn't rendered yet. Read-only against otd/data, otd/src, otd/scripts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { daysWithPosts, OTD_ROOT, COVER_SRC_DIR } from "../src/lib/data.mjs";
import { generatePlaceholderCover } from "../src/lib/png.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, "..");

const fontsSrc = path.join(OTD_ROOT, "public", "fonts");
const fontsDest = path.join(siteRoot, "public", "fonts");
fs.mkdirSync(fontsDest, { recursive: true });
if (fs.existsSync(fontsSrc)) {
  for (const f of fs.readdirSync(fontsSrc)) {
    fs.copyFileSync(path.join(fontsSrc, f), path.join(fontsDest, f));
  }
  console.log(`fonts: copied ${fs.readdirSync(fontsSrc).length} files`);
}

const coverDest = path.join(siteRoot, "public", "cover");
fs.mkdirSync(coverDest, { recursive: true });

let copied = 0;
let generated = 0;
for (const { day } of daysWithPosts()) {
  const realCover = path.join(COVER_SRC_DIR, `${day}.png`);
  const dest = path.join(coverDest, `${day}.png`);
  if (fs.existsSync(realCover)) {
    fs.copyFileSync(realCover, dest);
    copied++;
  } else {
    fs.writeFileSync(dest, generatePlaceholderCover(day));
    generated++;
  }
}
console.log(`covers: ${copied} copied from otd/out/cover, ${generated} placeholders generated`);
