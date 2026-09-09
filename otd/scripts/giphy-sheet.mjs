#!/usr/bin/env node
// Draw the GIF library: the first frame of every catalogued item, tiled and
// labelled by query, id and frame count, into public/giphy/catalog.png, so an
// agent or Iain can see what is on the shelf. ffmpeg cuts the first frames;
// Google Chrome (playwright-core) lays out and screenshots the sheet.
//
//   node scripts/giphy-sheet.mjs            # everything with keep !== false
//   node scripts/giphy-sheet.mjs --all      # junk too
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "public", "giphy");
const cat = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
const all = process.argv.includes("--all");
const items = cat.items.filter((i) => (all || i.keep !== false) && existsSync(join(root, i.file.replace(/^giphy\//, ""))));
const tmp = mkdtempSync(join(tmpdir(), "giphy-sheet-"));
const T = 180, COLS = 8;
const cells = [];
for (const it of items) {
  const src = join(root, it.file.replace(/^giphy\//, ""));
  const out = join(tmp, `${it.id}.png`);
  try { execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-frames:v", "1", "-vf", `scale=${T}:${T}:force_original_aspect_ratio=decrease`, out]); cells.push({ it, out }); }
  catch (e) { console.error(`skip ${it.id}: ${String(e.message).split("\n")[0]}`); }
}
const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;background:#9a9a9a;font:11px/1.3 Arial,sans-serif;color:#fff}
  .g{display:grid;grid-template-columns:repeat(${COLS},${T}px);gap:8px;padding:8px}
  figure{margin:0;width:${T}px}
  .i{width:${T}px;height:${T}px;display:flex;align-items:center;justify-content:center;background:#888;background-image:linear-gradient(45deg,#7f7f7f 25%,transparent 25%,transparent 75%,#7f7f7f 75%),linear-gradient(45deg,#7f7f7f 25%,transparent 25%,transparent 75%,#7f7f7f 75%);background-size:16px 16px;background-position:0 0,8px 8px}
  img{max-width:${T}px;max-height:${T}px;display:block}
  figcaption{height:30px;overflow:hidden;padding-top:3px;word-break:break-all}
  b{display:block;color:#000}
</style><div class="g">${cells.map(({ it, out }) => `<figure><div class="i"><img src="${pathToFileURL(out).href}"></div><figcaption><b>${it.query}</b>${it.id} · ${it.frames ?? "?"}f · ${it.width}×${it.height}${it.keep === false ? " · JUNK" : ""}</figcaption></figure>`).join("")}</div>`;
const page_ = join(tmp, "sheet.html");
writeFileSync(page_, html);
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: COLS * (T + 8) + 8, height: 800 } });
  await page.goto(pathToFileURL(page_).href, { waitUntil: "networkidle" });
  await page.screenshot({ path: join(root, "catalog.png"), fullPage: true });
} finally { await browser.close(); rmSync(tmp, { recursive: true, force: true }); }
console.log(`${cells.length} items → public/giphy/catalog.png`);
