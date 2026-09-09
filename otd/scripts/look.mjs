#!/usr/bin/env node
// Step 1 of the day procedure: what this day contains. Derived, never edited.
//
//   node otd/scripts/look.mjs 09-09
//   node otd/scripts/look.mjs 09-09 --json
//
// Prints the inventory the treatment is written against: every post and the
// state of its media, what died and what came back, the shape of the day in
// numbers, which arcs it qualifies for, which registers its shape suggests, the
// ink sampled from its own material, the stickers its own words already earn,
// and the proper nouns that have nothing on the shelf yet.
//
// Nothing here decides anything. It is the facts a treatment argues with.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const otd = join(here, "..");
const repo = join(otd, "..");
const args = process.argv.slice(2);
const day = args.find((a) => /^\d\d-\d\d$/.test(a));
const asJSON = args.includes("--json");
if (!day) { console.error("usage: look.mjs MM-DD [--json]"); process.exit(2); }

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [mm, dd] = day.split("-").map(Number);
const inWords = `${dd} ${MONTHS[mm - 1]}`;

const dayFile = join(otd, "data", "days", `${day}.json`);
if (!existsSync(dayFile)) { console.error(`no ${dayFile}. run: npm run days --prefix otd`); process.exit(1); }
const d = JSON.parse(readFileSync(dayFile, "utf8"));
const posts = d.posts || [];

// ---------- media, per post ----------
const imagesOf = (p) => [...String(p.bodyHtml || "").matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }));
const capDir = join(otd, "captures", day);
const rescued = existsSync(join(capDir, "wayback")) ? readdirSync(join(capDir, "wayback")).filter((f) => f.startsWith("rescued-")) : [];
const wbJSON = existsSync(join(capDir, "wayback", "wayback.json")) ? JSON.parse(readFileSync(join(capDir, "wayback", "wayback.json"), "utf8")) : null;

const rows = posts.map((p) => {
  const ims = imagesOf(p);
  const im = ims[0] || null;
  const live = im && p.image && p.image.exists && p.image.src === im.src;
  const back = im && rescued.includes(`rescued-${im.src.split("/").pop()}`);
  const vid = p.video && p.video.id ? p.video.id : null;
  let vdir = null, frames = 0, meta = null, gone = null;
  if (vid) {
    vdir = join(capDir, p.slug, "video", vid);
    const man = join(vdir, "manifest.json");
    if (existsSync(man)) {
      const m = JSON.parse(readFileSync(man, "utf8"));
      frames = (m.frames || []).length; meta = m.meta || null; gone = m.unavailable || null;
    }
  }
  return { post: p, ims, image: !im ? "none" : live ? "live" : back ? "recovered" : "dead",
    imageFile: im ? im.src : null, alt: im ? im.alt : null,
    video: !vid ? null : { id: vid, frames, meta, gone, captured: !!vdir && existsSync(vdir) } };
});

// ---------- shape ----------
const years = [...new Set(posts.map((p) => p.year))].sort();
const tags = [...new Set(posts.flatMap((p) => [...(p.tags || []), ...(p.categories || [])]))];
const chars = posts.reduce((n, p) => n + (p.bodyText || "").length, 0);
const nLive = rows.filter((r) => r.image === "live").length;
const nBack = rows.filter((r) => r.image === "recovered").length;
const nDead = rows.filter((r) => r.image === "dead").length;
const withVid = rows.filter((r) => r.video);
const nFrames = withVid.reduce((n, r) => n + r.video.frames, 0);
const nGone = withVid.filter((r) => r.video.gone).length;

// ---------- arcs ----------
const arcs = [];
if (posts.length === 0) arcs.push(["the empty", "no posts at all"]);
if (posts.length === 1) arcs.push(["the single", "one post: tell it whole and slowly"]);
if (posts.length && nDead + nGone > 0 && nLive + nBack + nFrames === 0) arcs.push(["the wreck", "nothing usable survives"]);
if (withVid.filter((r) => r.video.frames > 0).length >= 2) arcs.push(["the reel", "two or more videos with frames"]);
if (years.length >= 3 && posts.length === years.length) arcs.push(["the ladder", "one post a year across three or more years"]);
if (posts.length >= 9 || tags.length >= 15) arcs.push(["the list", `${posts.length} posts, ${tags.length} tags`]);
if (posts.length) arcs.push(["the claim", "the default: one assertion and its evidence"]);

// ---------- registers ----------
const regs = [];
if (withVid.filter((r) => r.video.frames > 0).length >= 2 || nLive + nBack >= 1 || (posts.length && nLive + nBack === 0)) regs.push(["D · Duotone", "pictures, or the absence of them, carry it"]);
if (chars > 3000 || posts.length === 1) regs.push(["B · Journal", "words carry it"]);
if (posts.length >= 5 || tags.length >= 15) regs.push(["A · Sponsored", "things carry it: many short posts, links out"]);

// ---------- density ----------
const shelfAll = existsSync(join(otd, "public", "giphy", "manifest.json"))
  ? (JSON.parse(readFileSync(join(otd, "public", "giphy", "manifest.json"), "utf8")).items || []).filter((i) => i.keep !== false) : [];
const ownWords = (p) => " " + [p.bodyText, p.title, ...(p.tags || []), ...(p.categories || []), ...imagesOf(p).map((i) => i.alt)].filter(Boolean).join(" ").toLowerCase() + " ";
const dayText = posts.map(ownWords).join(" ");
const shelf = shelfAll.filter((i) => [i.query, ...(i.words || [])].some((w) => w && w.length > 3 && new RegExp(`[^a-z]${String(w).toLowerCase()}[^a-z]`).test(dayText)));
// The day's OWN pictures dominate. The shelf is potential, not material, so it
// is capped: a big library must not make a day with no surviving image look rich.
const own = nLive + nBack + nFrames;
const material = own + Math.min(shelf.length, 6);
const density = material <= 8 ? "SCARCE — amplify: range 40:1, one instance wider than the frame, swarm 12-16"
  : material <= 20 ? "MIDDLING — range 15:1, one thing leaves the frame, swarm 8-12"
  : "PLENTIFUL — let it speak: range 6:1, little past the edge, swarm 4-6";

// ---------- what the posts name that the shelf has nothing for ----------
const STOP = new Set("the and but for with from that this then they them there here what when which while your you our his her its into over under about after before some most very just like more than been have has had was were are is a an of in on to it i im ive at be by or as if so no not now new all one two out up down off can will would could should really thing things think know see saw look looked make made get got go going went day days time times good great best".split(" "));
const names = new Map();
for (const p of posts) {
  for (const m of String(p.bodyText || "").matchAll(/\b([A-Z][a-zA-Z0-9'’&.-]{2,})\b/g)) {
    const w = m[1];
    if (STOP.has(w.toLowerCase())) continue;
    names.set(w, (names.get(w) || 0) + 1);
  }
  for (const t of [...(p.tags || []), ...(p.categories || [])]) if (t !== "Uncategorized") names.set(t, (names.get(t) || 0) + 1);
}
const covered = new Set(shelf.flatMap((i) => [i.query, ...(i.words || [])].map((w) => String(w).toLowerCase())));
const gaps = [...names.entries()].filter(([w]) => !covered.has(w.toLowerCase())).sort((a, b) => b[1] - a[1]).map(([w, n]) => `${w}${n > 1 ? ` ×${n}` : ""}`);

// ---------- the ink, from the day's own best surviving material ----------
function sampleInk() {
  const candidates = [];
  for (const r of rows) {
    if (r.image === "live") candidates.push(join(repo, "public", r.imageFile));
    if (r.image === "recovered") candidates.push(join(capDir, "wayback", `rescued-${r.imageFile.split("/").pop()}`));
  }
  for (const r of withVid) if (r.video.frames) {
    const even = join(capDir, r.post.slug, "video", r.video.id, "even");
    if (existsSync(even)) { const f = readdirSync(even).sort(); if (f.length) candidates.push(join(even, f[Math.floor(f.length / 2)])); }
  }
  if (wbJSON) for (const it of wbJSON.items || []) if (it.file) candidates.push(join(capDir, "wayback", it.file));
  for (const file of candidates) {
    if (!existsSync(file)) continue;
    const r = spawnSync("ffmpeg", ["-v", "quiet", "-i", file, "-vf", "scale=24:24", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { maxBuffer: 1 << 20 });
    if (r.status !== 0 || !r.stdout || !r.stdout.length) continue;
    const px = r.stdout, W = new Array(36).fill(0), H = new Array(36).fill(0);
    for (let i = 0; i + 2 < px.length; i += 3) {
      const [R, G, B] = [px[i], px[i + 1], px[i + 2]];
      const mx = Math.max(R, G, B), mn = Math.min(R, G, B), l = (mx + mn) / 510;
      if (mx === mn || l < 0.12 || l > 0.93) continue;
      const sat = (mx - mn) / (mx + mn <= 255 ? mx + mn : 510 - mx - mn);
      if (sat < 0.22) continue;
      let h = mx === R ? ((G - B) / (mx - mn) + 6) % 6 : mx === G ? (B - R) / (mx - mn) + 2 : (R - G) / (mx - mn) + 4;
      h *= 60;
      const k = Math.floor(h / 10) % 36;
      W[k] += sat; H[k] += h;
    }
    let best = -1, bw = 0;
    for (let k = 0; k < 36; k++) if (W[k] > bw) { bw = W[k]; best = k; }
    if (best < 0) continue;
    const hue = H[best] / W[best], s = 0.92, v = 0.78;
    const c = v * s, x = c * (1 - Math.abs(((hue / 60) % 2) - 1)), m2 = v - c;
    let [R2, G2, B2] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
    const hex = "#" + [R2, G2, B2].map((u) => Math.round((u + m2) * 255).toString(16).padStart(2, "0")).join("");
    return { hex, from: file.replace(repo + "/", "") };
  }
  return null;
}
const ink = sampleInk();

const inv = { day, inWords, posts: rows.length, years, tags, chars, nLive, nBack, nDead,
  videos: withVid.length, nFrames, nGone, captures: { wayback: !!wbJSON, rescued: rescued.length },
  arcs, registers: regs, density, material, ink, shelf: shelf.map((i) => i.query), gaps };

if (asJSON) { console.log(JSON.stringify({ ...inv, rows: rows.map((r) => ({ ...r, post: r.post.permalink })) }, null, 2)); process.exit(0); }

const L = (s = "") => console.log(s);
L(`\n  ${inWords.toUpperCase()}   ·   ${day}   ·   ${posts.length} post${posts.length === 1 ? "" : "s"}   ·   ${years.join(" ") || "—"}\n`);
if (!posts.length) { L("  no posts at all. this is one of 26 such days: the empty day's answer applies.\n"); process.exit(0); }
for (const r of rows) {
  const p = r.post;
  const im = r.image === "none" ? "" : `  img:${r.image}${r.alt ? ` "${r.alt}"` : ""}`;
  const vd = !r.video ? "" : !r.video.captured ? `  video:NOT CAPTURED ${r.video.id}`
    : r.video.gone ? `  video:GONE ${r.video.id}` : `  video:${r.video.frames}fr ${r.video.id}`;
  L(`  ${p.year}  ${p.title}`);
  L(`        ${p.permalink}   ${String((p.bodyText || "").length).padStart(5)} chars${im}${vd}`);
}
L(`\n  SHAPE   ${chars} chars · ${tags.length} tags · images ${nLive} live / ${nBack} recovered / ${nDead} dead · ${withVid.length} video${withVid.length === 1 ? "" : "s"} (${nFrames} frames, ${nGone} gone)`);
L(`  CAPTURES  wayback ${wbJSON ? "yes" : "NOT RUN"} · rescued images ${rescued.length}`);
L(`\n  ARCS`); for (const [a, why] of arcs) L(`    ${a.padEnd(12)} ${why}`);
L(`\n  REGISTERS`); for (const [a, why] of regs) L(`    ${a.padEnd(14)} ${why}`);
L(`\n  DENSITY   ${own} of its own + ${Math.min(shelf.length, 6)} shelf → ${density}`);
L(`\n  INK       ${ink ? `${ink.hex}   from ${ink.from}` : "none — no saturated material. black, or override in the treatment."}`);
L(`\n  SHELF     ${shelf.length ? [...new Set(shelf.map((i) => i.query))].join(", ") : "EMPTY — nothing on this day's words. stock it before writing the treatment."}`);
L(`\n  NAMES THE SHELF HAS NOTHING FOR`);
L(`    ${gaps.slice(0, 24).join(" · ") || "—"}`);
L(`\n  next: read every post in full, then stock the shelf (step 3), then write the treatment.\n`);
