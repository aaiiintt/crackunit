#!/usr/bin/env node
// Render the Stage 1 look boards.
//
//   node otd/lookdev/render.mjs                        # every <look>/<n>.js sketch (and <n>.html page), 3 seeds
//   node otd/lookdev/render.mjs styles                 # one look
//   node otd/lookdev/render.mjs styles/2 --seed 7      # one still, one seed
//   node otd/lookdev/render.mjs --seeds 5              # more variants per still
//   node otd/lookdev/render.mjs --pick                  # seed 1 only, quick
//   node otd/lookdev/render.mjs --final                 # the picked seed per slide (lines.json[day].picks) → otd/out/carousel/<day>/NN.png + contact.png
//   node otd/lookdev/render.mjs --styles                # Part A: 4 style options × 3 beats → out/styles/ and out/styles.png
//
// A still is either a p5 sketch <look>/<n>.js, hosted by page.html with
// vendor/p5.min.js and lib.js and rendered once per seed (window.SEED), or a
// hand-composed <look>/<n>.html page. Both are 1080 × 1350, rendered at device
// scale 2 (2160 × 2700) by Google Chrome through playwright-core, into
// otd/lookdev/out/<look>-<n>-s<seed>.png. Then out/contact.png: a grid, one
// row per still, one column per seed at 25%, plus seed 1 at 270 px wide (the
// readability gate), which is what Iain reviews. A sheet taller than Chrome's
// 16384 px screenshot limit is written as contact-1.png, contact-2.png, …
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
const filter = argv.find((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--"))) || "";
const seeds = argv.includes("--pick") ? [1] : opt("seed", null) ? [Number(opt("seed"))] : Array.from({ length: Number(opt("seeds", 3)) }, (_, i) => i + 1);
const DAY = opt("day", "11-09");
const FINAL = argv.includes("--final");
const STYLES_MODE = argv.includes("--styles");
const picks = FINAL ? (JSON.parse(fs.readFileSync(path.join(repo, "otd", "data", "lines.json"), "utf8"))[DAY] || {}).picks || {} : null;
if (FINAL && !Object.keys(picks).length) { console.error(`no picks for ${DAY} in otd/data/lines.json`); process.exit(1); }
const finalDir = path.join(repo, "otd", "out", "carousel", DAY);
if (FINAL) fs.mkdirSync(finalDir, { recursive: true });

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

// ---------------------------------------------------------------- Part A
// Four style options against the same three beats, so we compare styles and
// not compositions. Beats 1 and 3 are 11-09, whose material we know; beat 2 is
// 11-26, five videos across five years, the archive's best test of repetition.
const OPTIONS = [["A", "A · SPONSORED"], ["B", "B · JOURNAL"], ["C", "C · WINDOWS"], ["D", "D · DUOTONE"]];
// --on MM-DD renders every beat against a day nobody tuned for, which is the
// only cheap test of whether these compositions are fitted to two known days.
const ON = opt("on", null);
const BEATS = [{ n: 1, day: ON || "11-09", name: "the hook" }, { n: 2, day: ON || "11-26", name: "the video" }, { n: 3, day: ON || "11-09", name: "the post" }];

async function renderStyles() {
  const dir = path.join(outDir, ON ? `styles-${ON}` : "styles");
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const t0 = Date.now();
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.log(`  page error: ${e.message}`));
    page.on("requestfailed", (r) => console.log(`  missing: ${r.url().replace(base, "")}`));
    for (const [opt] of OPTIONS) for (const b of BEATS) {
      const url = `${base}/otd/lookdev/page.html?sketch=/otd/lookdev/styles/beats.js&pre=/otd/lookdev/styles/style.js&seed=1&day=${b.day}&option=${opt}&beat=${b.n}`;
      const png = path.join(dir, `${opt}${b.n}.png`);
      await page.goto(url, { waitUntil: "load" });
      try { await page.waitForFunction(() => window.__rendered === true || window.__error, null, { timeout: 60000 }); }
      catch { console.log(`  ${opt}${b.n}: timed out waiting for window.__rendered`); }
      const err = await page.evaluate(() => window.__error || null);
      if (err) console.log(`  ${opt}${b.n}: ${err}`);
      const why = await page.evaluate(() => window.__skip || null);
      if (why) { console.log(`  ${opt}${b.n} skipped: ${why}`); continue; }
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: png, clip: { x: 0, y: 0, width: W, height: H } });
      console.log(`${opt}${b.n}  ${b.day}  →  ${path.relative(repo, png)}`);
    }

    // the sheet: a row per option, a column per beat, then the four covers as
    // the profile grid crops them
    const CW = 420, CH = Math.round(CW * H / W), SQ = 300, gap = 22;
    const cell = (opt, b) => `<figure><img src="${base}/otd/lookdev/out/${ON ? `styles-${ON}` : "styles"}/${opt}${b.n}.png"><figcaption>${b.n} · ${b.name} · ${b.day}</figcaption></figure>`;
    const html = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;background:#9a9a9a;font:13px/1.4 "Arial Bold",Arial,sans-serif;font-weight:700;color:#fff;letter-spacing:.05em;text-transform:uppercase;padding:${gap}px}
      h1{font-size:19px;margin:6px 0 18px;letter-spacing:.14em}
      h2{font-size:15px;margin:0 0 8px;letter-spacing:.14em;border-top:2px solid #fff;padding-top:8px}
      .row{display:flex;gap:${gap}px;margin-bottom:${gap + 8}px}
      figure{margin:0;width:${CW}px}
      figure img{display:block;width:${CW}px;height:${CH}px;outline:1px solid #000}
      figcaption{margin-top:7px;font-size:11.5px;color:#eee}
      .crops{display:flex;gap:${gap}px}
      .crops figure{width:${SQ}px}
      .crop{width:${SQ}px;height:${SQ}px;overflow:hidden;outline:1px solid #000}
      .crop img{display:block;width:${SQ}px;height:${Math.round(SQ * H / W)}px;margin-top:${-Math.round((SQ * H / W - SQ) / 2)}px;outline:0}
    </style>
    <h1>on this day · part a · four style options, three beats</h1>
    ${OPTIONS.map(([opt, label]) => `<h2>${label}</h2><div class="row">${BEATS.map((b) => cell(opt, b)).join("")}</div>`).join("")}
    <h2>the cover as the profile grid crops it · beat 1, centre square</h2>
    <div class="crops">${OPTIONS.map(([opt, label]) => `<figure><div class="crop"><img src="${base}/otd/lookdev/out/${ON ? `styles-${ON}` : "styles"}/${opt}1.png"></div><figcaption>${label}</figcaption></figure>`).join("")}</div>`;
    const sheet = await ctx.newPage();
    await sheet.setViewportSize({ width: 3 * CW + 2 * gap + gap * 2, height: 800 });
    await sheet.setContent(html, { waitUntil: "networkidle" });
    await sheet.screenshot({ path: path.join(outDir, ON ? `styles-${ON}.png` : "styles.png"), fullPage: true });
    await sheet.screenshot({ path: path.join(outDir, ON ? `styles-${ON}.jpg` : "styles.jpg"), type: "jpeg", quality: 78, fullPage: true });
    console.log(`sheet  →  otd/lookdev/out/${ON ? `styles-${ON}` : "styles"}.png (+ .jpg)   (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  } finally { await browser.close(); }
}

if (STYLES_MODE) { await renderStyles(); server.close(); process.exit(0); }

// One card, drawn in each register, so a new card is judged on its own before
// it is spent on a day:  node otd/lookdev/render.mjs --card index --day 09-09
async function renderCard(name, day) {
  const dir = path.join(outDir, "cards");
  fs.mkdirSync(dir, { recursive: true });
  const regs = ["A", "B", "D"];
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.log(`  page error: ${e.message}`));
    for (const reg of regs) {
      const url = `${base}/otd/lookdev/page.html?sketch=/otd/lookdev/styles/card.js&pre=/otd/lookdev/styles/style.js,/otd/lookdev/styles/cards.js&seed=1&day=${day}&card=${name}&register=${reg}`;
      const png = path.join(dir, `${name}-${day}-${reg}.png`);
      await page.goto(url, { waitUntil: "load" });
      try { await page.waitForFunction(() => window.__rendered === true || window.__error, null, { timeout: 60000 }); }
      catch { console.log(`  ${reg}: timed out`); }
      const err = await page.evaluate(() => window.__error || null);
      if (err) console.log(`  ${reg}: ${err}`);
      const why = await page.evaluate(() => window.__skip || null);
      if (why) { console.log(`  ${reg} skipped: ${why}`); continue; }
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: png, clip: { x: 0, y: 0, width: W, height: H } });
      console.log(`${name} ${day} ${reg}  →  ${path.relative(repo, png)}`);
    }
    const CW = 460, CH = Math.round(CW * H / W), gap = 22;
    const html = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;background:#9a9a9a;font:13px/1.4 "Arial Bold",Arial,sans-serif;font-weight:700;color:#fff;letter-spacing:.06em;text-transform:uppercase;padding:${gap}px}
      h1{font-size:17px;margin:4px 0 16px;letter-spacing:.14em}
      .row{display:flex;gap:${gap}px}figure{margin:0;width:${CW}px}
      img{display:block;width:${CW}px;height:${CH}px;outline:1px solid #000}
      figcaption{margin-top:7px;font-size:11.5px;color:#eee}
    </style><h1>card · ${name} · ${day}</h1><div class="row">${regs.map((r) => `<figure><img src="${base}/otd/lookdev/out/cards/${name}-${day}-${r}.png"><figcaption>${r}</figcaption></figure>`).join("")}</div>`;
    const sheet = await ctx.newPage();
    await sheet.setViewportSize({ width: 3 * CW + 2 * gap + gap * 2, height: 600 });
    await sheet.setContent(html, { waitUntil: "networkidle" });
    await sheet.screenshot({ path: path.join(outDir, `card-${name}-${day}.png`), fullPage: true });
    console.log(`sheet  →  otd/lookdev/out/card-${name}-${day}.png`);
  } finally { await browser.close(); }
}

const CARD = opt("card", null);
if (CARD) { await renderCard(CARD, opt("day", "09-09")); server.close(); process.exit(0); }

// A whole day, from its treatment:  node otd/lookdev/render.mjs --compose 09-09
// One image per beat into otd/out/carousel/<day>/, plus a contact strip and the
// square crop of the cover as the profile grid will take it.
async function compose(day) {
  const tPath = path.join(repo, "otd", "data", "treatments", `${day}.json`);
  if (!fs.existsSync(tPath)) { console.error(`no treatment at otd/data/treatments/${day}.json — write it first (step 4)`); process.exit(1); }
  const T = JSON.parse(fs.readFileSync(tPath, "utf8"));
  const sketch = path.join(here, "days", `${day}.js`);
  if (!fs.existsSync(sketch)) { console.error(`no composition at otd/lookdev/days/${day}.js`); process.exit(1); }
  const out = path.join(repo, "otd", "out", "carousel", day);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const beats = T.beats || [];
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => console.log(`  page error: ${e.message}`));
    page.on("requestfailed", (r) => console.log(`  missing: ${r.url().replace(base, "")}`));
    const made = [];
    for (let i = 0; i < beats.length; i++) {
      const url = `${base}/otd/lookdev/page.html?sketch=/otd/lookdev/days/${day}.js&pre=/otd/lookdev/styles/style.js,/otd/lookdev/styles/cards.js&seed=1&day=${day}&beat=${i + 1}`;
      const png = path.join(out, `${String(i + 1).padStart(2, "0")}.png`);
      await page.goto(url, { waitUntil: "load" });
      try { await page.waitForFunction(() => window.__rendered === true || window.__error, null, { timeout: 60000 }); }
      catch { console.log(`  beat ${i + 1}: timed out`); }
      const err = await page.evaluate(() => window.__error || null);
      if (err) console.log(`  beat ${i + 1}: ${err}`);
      const why = await page.evaluate(() => window.__skip || null);
      if (why) { console.log(`  beat ${i + 1} skipped: ${why}`); continue; }
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: png, clip: { x: 0, y: 0, width: W, height: H } });
      made.push({ n: i + 1, file: path.basename(png), says: beats[i].says, cards: (beats[i].cards || []).join(" + ") });
      console.log(`  ${String(i + 1).padStart(2, "0")}  ${(beats[i].cards || []).join(" + ").padEnd(22)} ${beats[i].says}`);
    }
    const CW = 300, CH = Math.round(CW * H / W), gap = 16, SQ = 300;
    const html = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;background:#9a9a9a;font:12px/1.35 "Arial Bold",Arial,sans-serif;font-weight:700;color:#fff;letter-spacing:.05em;padding:${gap}px}
      h1{font-size:16px;margin:4px 0 14px;letter-spacing:.13em;text-transform:uppercase}
      h2{font-size:12px;margin:18px 0 8px;letter-spacing:.13em;text-transform:uppercase;border-top:2px solid #fff;padding-top:8px}
      .row{display:flex;gap:${gap}px;flex-wrap:wrap}figure{margin:0;width:${CW}px}
      img{display:block;width:${CW}px;height:${CH}px;outline:1px solid #000}
      figcaption{margin-top:6px;font-size:10.5px;color:#eee;text-transform:none;letter-spacing:0}
      .crop{width:${SQ}px;height:${SQ}px;overflow:hidden;outline:1px solid #000}
      .crop img{width:${SQ}px;height:${Math.round(SQ * H / W)}px;margin-top:${-Math.round((SQ * H / W - SQ) / 2)}px;outline:0}
    </style><h1>${day} · ${T.arc.name} · ${T.register.name} · ${T.density} · ${T.ink.hex}</h1>
    <div class="row">${made.map((m) => `<figure><img src="${base}/otd/out/carousel/${day}/${m.file}"><figcaption><b>${m.n} · ${m.cards}</b><br>${m.says}</figcaption></figure>`).join("")}</div>
    <h2>the cover as the profile grid crops it</h2>
    <div class="row"><figure style="width:${SQ}px"><div class="crop"><img src="${base}/otd/out/carousel/${day}/01.png"></div></figure></div>`;
    const sheet = await ctx.newPage();
    await sheet.setViewportSize({ width: 4 * CW + 5 * gap, height: 900 });
    await sheet.setContent(html, { waitUntil: "networkidle" });
    await sheet.screenshot({ path: path.join(out, "contact.png"), fullPage: true });
    console.log(`\n${made.length} slides  →  otd/out/carousel/${day}/   contact.png`);
  } finally { await browser.close(); }
}

const COMPOSE = opt("compose", null);
if (COMPOSE) { await compose(COMPOSE); server.close(); process.exit(0); }


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
    for (const seed of FINAL ? [Number(picks[String(n)] || 1)] : sketch ? seeds : [1]) {
      const url = sketch ? `${base}/otd/lookdev/page.html?sketch=/otd/lookdev/${look}/${f}&seed=${seed}&day=${DAY}` : `${base}/otd/lookdev/${look}/${f}`;
      const png = FINAL ? path.join(finalDir, `slide-${String(n).padStart(2, "0")}.png`) : path.join(outDir, `${look}-${n}-s${seed}.png`);
      stills.push({ look, n, id: `${id} s${seed}`, sketch, seed, url, png });
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
      // a slide the day has no material for takes itself out of the carousel
      const why = await page.evaluate(() => window.__skip || null);
      if (why) { console.log(`${s.id}  skipped: ${why}`); fs.rmSync(s.png, { force: true }); continue; }
    } else {
      await page.waitForLoadState("networkidle");
    }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: s.png, clip: { x: 0, y: 0, width: W, height: H } });
    console.log(`${s.id}  →  ${path.relative(repo, s.png)}`);
  }

  if (FINAL) { // renumber over the slides that actually rendered, then the carousel in order at 25%
    for (const f of fs.readdirSync(finalDir)) if (/^\d\d\.png$/.test(f)) fs.rmSync(path.join(finalDir, f));
    const made = fs.readdirSync(finalDir).filter((f) => /^slide-\d\d\.png$/.test(f)).sort();
    const order = [];
    made.forEach((f, i) => { const to = `${String(i + 1).padStart(2, "0")}.png`; fs.renameSync(path.join(finalDir, f), path.join(finalDir, to)); order.push({ to, from: Number(f.match(/\d\d/)[0]) }); });
    const files = order.map((o) => o.to);
    const cw = W * SCALE * CONTACT, ch = H * SCALE * CONTACT, gap = 24, label = 44;
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#888;font:14px/1 "Arial Bold","Arial",sans-serif;font-weight:700;color:#fff;letter-spacing:.06em}.row{display:flex;gap:${gap}px;padding:${gap}px}figure{margin:0;width:${cw}px}img{display:block;width:${cw}px;height:${ch}px;outline:1px solid #000}figcaption{height:${label}px;line-height:${label}px}</style><div class="row">${files.map((f, i) => `<figure><img src="${base}/otd/out/carousel/${DAY}/${f}"><figcaption>${DAY} · ${f.replace(".png", "")} (${order[i].from})</figcaption></figure>`).join("")}</div>`;
    const cpage = await ctx.newPage();
    await cpage.setViewportSize({ width: Math.ceil(files.length * (cw + gap) + gap), height: Math.ceil(ch + label + gap * 2) });
    await cpage.setContent(html, { waitUntil: "networkidle" });
    await cpage.screenshot({ path: path.join(finalDir, "contact.png"), fullPage: true });
    console.log(`final: ${files.length} slides  →  otd/out/carousel/${DAY}/   (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  } else {
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
  const rowH = ch + label + gap, MAXH = 16000 / SCALE; // Chrome caps one screenshot at 16384 device px; beyond that the capture wraps
  const perSheet = Math.max(1, Math.floor((MAXH - gap) / rowH));
  const rows = [...rowsMap.entries()];
  const sheets = []; for (let i = 0; i < rows.length; i += perSheet) sheets.push(rows.slice(i, i + perSheet));
  const cpage = await ctx.newPage();
  for (const [si, chunk] of sheets.entries()) {
    const html = `<!doctype html><meta charset="utf-8"><style>
      body{margin:0;background:#888;font:14px/1 "Arial Bold","Arial",sans-serif;font-weight:700;color:#fff;letter-spacing:.06em}
      .row{display:flex;gap:${gap}px;padding:${gap}px ${gap}px 0;align-items:flex-start}
      figure{margin:0;width:${cw}px}
      img{display:block;width:${cw}px;height:${ch}px;outline:1px solid #000}
      .gate{width:${GATE}px;margin-left:${gap}px}
      .gate img{width:${GATE}px;height:${gateH}px}
      figcaption{height:${label}px;line-height:${label}px;text-transform:uppercase}
    </style>${chunk.map(([rk, fl]) => `<div class="row">${fl.map((f) => `<figure><img src="/otd/lookdev/out/${f}"><figcaption>${f.replace(".png", "").replace(/-(\d+)-s(\d+)$/, " · $1 · seed $2")}</figcaption></figure>`).join("")}<figure class="gate"><img src="/otd/lookdev/out/${fl[0]}"><figcaption>${GATE} px</figcaption></figure></div>`).join("")}<div style="height:${gap}px"></div>`;
    await cpage.setViewportSize({ width: Math.ceil(cols * (cw + gap) + gap * 2 + GATE), height: Math.ceil(chunk.length * rowH + gap) });
    await cpage.setContent(html.replace(/src="\//g, `src="${base}/`), { waitUntil: "networkidle" });
    const name = sheets.length === 1 ? "contact.png" : `contact-${si + 1}.png`;
    await cpage.screenshot({ path: path.join(outDir, name), fullPage: true });
  }
  if (sheets.length > 1) fs.rmSync(path.join(outDir, "contact.png"), { force: true }); else for (const f of fs.readdirSync(outDir)) if (/^contact-\d+\.png$/.test(f)) fs.rmSync(path.join(outDir, f));
  console.log(`contact: ${files.length} renders in ${rowsMap.size} rows  →  otd/lookdev/out/${sheets.length === 1 ? "contact.png" : `contact-1..${sheets.length}.png`}   (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
} finally {
  await browser.close();
  server.close();
}
