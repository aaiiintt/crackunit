#!/usr/bin/env node
// Render the Stage 1 look boards.
//
//   node otd/lookdev/render.mjs                 # every <look>/<n>.html
//   node otd/lookdev/render.mjs camcorder       # one look
//   node otd/lookdev/render.mjs camcorder/2     # one still
//
// Each still is a hand-composed 1080 × 1350 page, rendered at device scale 2
// (2160 × 2700) by Google Chrome through playwright-core, into
// otd/lookdev/out/<look>-<n>.png. Then out/contact.png: every still at 25%
// in a row, labelled, which is what Iain reviews.
//
// Pages are served from the repo root, so a still references material by
// root-absolute path: /otd/public/fonts/…, /otd/captures/11-09/…,
// /public/wp-content/…, /export/posts/…  (fonts.css next to this file).

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..", "..");
const outDir = path.join(here, "out");
fs.mkdirSync(outDir, { recursive: true });

const W = 1080, H = 1350, SCALE = 2, CONTACT = 0.25;
const filter = process.argv[2] || "";

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
for (const look of looks) for (const f of fs.readdirSync(path.join(here, look)).filter((f) => /^\d+\.html$/.test(f)).sort((a, b) => parseInt(a) - parseInt(b))) {
  const id = `${look}/${parseInt(f)}`;
  if (filter && id !== filter && look !== filter) continue;
  // a still may declare <meta name="requires" content="/path, /path"> for ordered assets; skip it until they exist
  const req = (fs.readFileSync(path.join(here, look, f), "utf8").match(/<meta name="requires" content="([^"]+)"/) || [])[1];
  const missing = req ? req.split(",").map((s) => s.trim()).filter((s) => !fs.existsSync(path.join(repo, s))) : [];
  if (missing.length) { console.log(`${id}  waiting for ${missing.join(", ")}  (see otd/orders/)`); continue; }
  stills.push({ look, n: parseInt(f), id, url: `${base}/otd/lookdev/${look}/${f}`, png: path.join(outDir, `${look}-${parseInt(f)}.png`) });
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
    await page.goto(s.url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: s.png, clip: { x: 0, y: 0, width: W, height: H } });
    console.log(`${s.id}  →  ${path.relative(repo, s.png)}`);
  }

  // contact sheet: every rendered still (not just the filtered ones) at 25%, in a row, labelled
  const all = fs.readdirSync(outDir).filter((f) => /^[a-z]+-\d+\.png$/.test(f)).sort((a, b) => {
    const [la, na] = a.replace(".png", "").split("-"), [lb, nb] = b.replace(".png", "").split("-");
    return la.localeCompare(lb) || Number(na) - Number(nb);
  });
  const cw = W * SCALE * CONTACT, ch = H * SCALE * CONTACT, gap = 24, label = 44;
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#888;font:14px/1 "Arial Bold","Arial",sans-serif;font-weight:700;color:#fff;letter-spacing:.06em}
    .row{display:flex;gap:${gap}px;padding:${gap}px}
    figure{margin:0;width:${cw}px}
    img{display:block;width:${cw}px;height:${ch}px;outline:1px solid #000}
    figcaption{height:${label}px;line-height:${label}px;text-transform:uppercase}
  </style><div class="row">${all.map((f) => `<figure><img src="/otd/lookdev/out/${f}"><figcaption>${f.replace(".png", "").replace("-", " · ")}</figcaption></figure>`).join("")}</div>`;
  const cpage = await ctx.newPage();
  await cpage.setViewportSize({ width: Math.ceil(all.length * (cw + gap) + gap), height: Math.ceil(ch + label + gap * 2) });
  await cpage.setContent(html.replace(/src="\//g, `src="${base}/`), { waitUntil: "networkidle" });
  await cpage.screenshot({ path: path.join(outDir, "contact.png"), fullPage: true });
  console.log(`contact: ${all.length} stills  →  otd/lookdev/out/contact.png   (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
} finally {
  await browser.close();
  server.close();
}
