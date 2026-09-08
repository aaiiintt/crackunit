#!/usr/bin/env node
// Render the Stage 1 look boards.
//
//   node otd/lookdev/render.mjs                        # every <look>/<n>.js sketch (and <n>.html page), 3 seeds
//   node otd/lookdev/render.mjs decon                  # one look
//   node otd/lookdev/render.mjs decon/4 --seed 7       # one still, one seed
//   node otd/lookdev/render.mjs --seeds 5              # more variants per still
//
// A still is either a p5 sketch <look>/<n>.js, hosted by page.html with
// vendor/p5.min.js and lib.js and rendered once per seed (window.SEED), or a
// hand-composed <look>/<n>.html page. Both are 1080 × 1350, rendered at device
// scale 2 (2160 × 2700) by Google Chrome through playwright-core, into
// otd/lookdev/out/<look>-<n>-s<seed>.png. Then out/contact.png: a grid, one
// row per still, one column per seed at 25%, plus seed 1 at 270 px wide (the
// readability gate), which is what Iain reviews.
//
// Pages are served from the repo root, so a still references material by
// root-absolute path: /otd/public/fonts/…, /otd/captures/11-09/…,
// /public/wp-content/…, /export/posts/…  (fonts.css next to this file).
// A sketch sets window.__rendered = true when its draw() has finished.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..");
const outDir = path.join(here, "out");
fs.mkdirSync(outDir, { recursive: true });

const W = 1080, H = 1350, SCALE = 2, CONTACT = 0.25, GATE = 270;
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i === -1 ? d : argv[i + 1]; };
const filter = argv.find((a) => !a.startsWith("--") && a !== opt("seed", null) && a !== opt("seeds", null)) || "";
const seeds = opt("seed", null) ? [Number(opt("seed"))] : Array.from({ length: Number(opt("seeds", 3)) }, (_, i) => i + 1);
const DAY = opt("day", "11-09");

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml", ".webp": "image/webp", ".ttf": "font/ttf", ".otf": "font/otf",
  ".woff": "font/woff", ".woff2": "font/woff2", ".md": "text/plain; charset=utf-8", ".json": "application/json", ".txt": "text/plain; charset=utf-8" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(repo, p);
  if (!file.startsWith(repo)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(data);
  });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

// stills: <look>/<n>.html, sorted look then number
const looks = fs.readdirSync(here, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== "out").map((d) => d.name).sort();
const stills = [];
for (const look of looks) {
  if (look === "vendor") continue;
  for (const f of fs.readdirSync(path.join(here, look)).filter((f) => /^\d+\.(js|html)$/.test(f)).sort((a, b) => parseInt(a) - parseInt(b))) {
    const n = parseInt(f), id = `${look}/${n}`, sketch = f.endsWith(".js");
    if (filter && id !== filter && look !== filter) continue;
    // a still may declare its ordered assets (html: <meta name="requires" content="/a, /b">; js: // requires: /a, /b); skip it until they exist
    const src = fs.readFileSync(path.join(here, look, f), "utf8");
    const req = (src.match(/<meta name="requires" content="([^"]+)"/) || src.match(/\/\/\s*requires:\s*(.+)/) || [])[1];
    const missing = req ? req.split(",").map((s) => s.trim()).filter((s) => !fs.existsSync(path.join(repo, s))) : [];
    if (missing.length) { console.log(`${id}  waiting for ${missing.join(", ")}  (see otd/orders/)`); continue; }
    for (const seed of sketch ? seeds : [1]) {
      const url = sketch ? `${base}/otd/lookdev/page.html?sketch=/otd/lookdev/${look}/${f}&seed=${seed}&day=${DAY}` : `${base}/otd/lookdev/${look}/${f}`;
      stills.push({ look, n, id: `${id} s${seed}`, sketch, seed, url, png: path.join(outDir, `${look}-${n}-s${seed}.png`) });
    }
  }
}
if (stills.length === 0) { console.error(`no stills${filter ? ` matching ${filter}` : ""} in ${here}`); server.close(); process.exit(1); }

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`  page error: ${e.message}`));
  page.on("requestfailed", (r) => console.log(`  missing: ${r.url().replace(base, "")}`));
  page.on("response", (r) => { if (r.status() >= 400) console.log(`  ${r.status()}: ${r.url().replace(base, "")}`); });
  const t0 = Date.now();
  for (const s of stills) {
    await page.goto(s.url, { waitUntil: "load" });
    if (s.sketch) {
      try { await page.waitForFunction(() => window.__rendered === true || window.__error, null, { timeout: 60000 }); }
      catch { console.log(`  ${s.id}: timed out waiting for window.__rendered`); }
      const err = await page.evaluate(() => window.__error || null);
      if (err) console.log(`  ${s.id}: ${err}`);
    } else {
      await page.waitForLoadState("networkidle");
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: s.png, clip: { x: 0, y: 0, width: W, height: H } });
    console.log(`${s.id}  →  ${path.relative(repo, s.png)}`);
  }

  // contact sheet: every rendered still in out/, one row per still, one column per seed at 25%, then seed 1 at 270 px
  const files = fs.readdirSync(outDir).filter((f) => /^[a-z]+-\d+-s\d+\.png$/.test(f));
  const key = (f) => { const m = f.match(/^([a-z]+)-(\d+)-s(\d+)\.png$/); return { look: m[1], n: Number(m[2]), seed: Number(m[3]) }; };
  const rowsMap = new Map();
  for (const f of files.sort((a, b) => { const A = key(a), B = key(b); return A.look.localeCompare(B.look) || A.n - B.n || A.seed - B.seed; })) {
    const k = key(f); const rk = `${k.look}-${k.n}`;
    if (!rowsMap.has(rk)) rowsMap.set(rk, []);
    rowsMap.get(rk).push(f);
  }
  const cw = W * SCALE * CONTACT, ch = H * SCALE * CONTACT, gap = 24, label = 44, gateH = Math.round(GATE * H / W);
  const cols = Math.max(...[...rowsMap.values()].map((r) => r.length));
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#888;font:14px/1 "Arial Bold","Arial",sans-serif;font-weight:700;color:#fff;letter-spacing:.06em}
    .row{display:flex;gap:${gap}px;padding:${gap}px ${gap}px 0;align-items:flex-start}
    figure{margin:0;width:${cw}px}
    img{display:block;width:${cw}px;height:${ch}px;outline:1px solid #000}
    .gate{width:${GATE}px;margin-left:${gap}px}
    .gate img{width:${GATE}px;height:${gateH}px}
    figcaption{height:${label}px;line-height:${label}px;text-transform:uppercase}
  </style>${[...rowsMap.entries()].map(([rk, fl]) => `<div class="row">${fl.map((f) => `<figure><img src="/otd/lookdev/out/${f}"><figcaption>${f.replace(".png", "").replace(/-(\d+)-s(\d+)$/, " · $1 · seed $2")}</figcaption></figure>`).join("")}<figure class="gate"><img src="/otd/lookdev/out/${fl[0]}"><figcaption>${GATE} px</figcaption></figure></div>`).join("")}<div style="height:${gap}px"></div>`;
  const cpage = await ctx.newPage();
  await cpage.setViewportSize({ width: Math.ceil(cols * (cw + gap) + gap * 2 + GATE), height: Math.ceil(rowsMap.size * (ch + label + gap) + gap) });
  await cpage.setContent(html.replace(/src="\//g, `src="${base}/`), { waitUntil: "networkidle" });
  await cpage.screenshot({ path: path.join(outDir, "contact.png"), fullPage: true });
  console.log(`contact: ${files.length} renders in ${rowsMap.size} rows  →  otd/lookdev/out/contact.png   (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
} finally {
  await browser.close();
  server.close();
}
