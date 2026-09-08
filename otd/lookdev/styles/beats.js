// Part A round 2: three beats, drawn four ways, off the grid.
//
//   beat 1  the hook   11-09  the line at the size of the frame, and what it had
//   beat 2  the video  11-26  one video pulled into frames and repeated
//   beat 3  the post   11-09  a quote, the page, and the post's own bullet list
//
// Round 1 was too tidy: a sentence inside a hairline box, everything aligned.
// The moves here come from Iain's own p5 pieces — one thing enormous and
// leaving the frame, the same thing tiny and marching off both edges, a swarm
// of stickers at wildly different sizes, type and picture overlapping with
// neither protected — laid over round 2's reduced palette rather than instead
// of it.
//
// Still true of every element: it belongs to the post it sits beside, no word
// is written by us, and a sticker is only used when its word is one the post
// itself uses — its prose, title, alt text or tags.

const Q = new URLSearchParams(location.search);
const OPT = (Q.get("option") || "A").toUpperCase();
const BEAT = Number(Q.get("beat") || 1);
let K = null, INK = [20, 20, 20], asked = false;

function preload() { OTD.preload(); }
function setup() { createCanvas(OTD.W, OTD.H); noLoop(); }

function draw() {
  // two settles: the day's own material has to be in before we can tell which
  // post this beat is about, and only then can we ask for its stickers
  if (!OTD.day || !OTD.day.posts || !OTD.allLoaded()) { setTimeout(() => redraw(), 90); return; }
  if (!asked) {
    asked = true;
    const p = subject();
    if (p) for (const it of OTD.stickersFor(p, 6)) OTD.loadSticker(it);
    setTimeout(() => redraw(), 90); return;
  }
  OTD.begin();
  if (!STYLES[OPT]) return OTD.skip(`unknown option ${OPT}`);
  K = build();
  if (!K) return OTD.skip(`beat ${BEAT} has no material on ${OTD.day.day}`);
  INK = S.inkFrom(K.inkFrom, [20, 20, 20]);
  STYLES[OPT].paint();
  ({ 1: hook, 2: video, 3: post })[BEAT]();
  S.daymark(`on this day · ${OTD.mmdd().dayNum} ${OTD.monthName(OTD.mmdd().mm)}`);
  S.credit(K.creditLine);
  OTD.done();
}

// ---------- the content, with its provenance ----------

function subject() { // the one post this beat is about
  const posts = OTD.posts();
  if (BEAT !== 2) return OTD.hero();
  const live = posts.filter((p) => p.video && (OTD.frames[p.video.id] || []).some((f) => f.img && f.img.width > 1));
  if (!live.length) return null;
  const n = (p) => OTD.frames[p.video.id].filter((f) => f.img && f.img.width > 1).length;
  const area = (p) => { const m = (OTD.manifests[p.video.id] || {}).meta || {}; return (m.width || 0) * (m.height || 0); };
  return live.sort((a, b) => n(b) - n(a) || area(b) - area(a))[0];
}

function build() {
  const p = subject();
  if (!p) return null;
  // this post's stickers, each as the set of stills the GIF actually is
  const stick = OTD.stickersFor(p, 6).map((it) => {
    const g = OTD.sticker(it);
    return g && g.width > 1 ? { it, frames: OTD.gifFrames(g, 8) } : null;
  }).filter(Boolean);
  const first = stick[0] || null;
  const queries = [...new Set(stick.map((s) => s.it.query))];
  const creditLine = first
    ? [`giphy ${first.it.id}${stick.length > 1 ? ` +${stick.length - 1}` : ""}`,
       `${stick.reduce((n, s) => n + s.frames.length, 0)} frames`,
       queries.map((q) => `"${q}"`).join(" "), "powered by giphy"]
    : [`crackunit.com${p.permalink}`];

  const common = { post: p, stick, creditLine, title: p.title, permalink: p.permalink, year: p.year, body: p.bodyText };

  if (BEAT === 2) {
    const frames = OTD.frames[p.video.id].filter((f) => f.img && f.img.width > 1);
    const meta = (OTD.manifests[p.video.id] || {}).meta || {};
    return { ...common, frames, meta, inkFrom: frames.filter((_, i) => i % 2 === 0).map((f) => f.img),
      lines: [meta.title, meta.uploader, meta.upload_date, `${meta.view_count} views`, `${meta.duration}s`, `${meta.width}×${meta.height} ${meta.fps}fps`, meta.id].filter(Boolean),
      url: (meta.webpage_url || `https://www.youtube.com/watch?v=${p.video.id}`).replace(/^https?:\/\//, "") };
  }
  const im = OTD.images_(p)[0] || null;
  const alive = im && OTD.images[im.src];
  const pic = !im ? null
    : alive && alive.width > 1 ? { img: alive, what: im.alt, note: String(p.year) }
    : OTD.rescuedFor(im.src) ? { img: OTD.rescuedFor(im.src), what: im.alt, note: "recovered, web.archive.org" } : null;
  const wb = OTD.waybackAll().find((w) => w.img && w.img.width > 1 && w.url && w.url.includes(p.permalink));
  const sent = p.sentences || [];
  return { ...common, pic, wb, sentences: sent,
    theLine: OTD.line() || sent[0] || "",
    quote: sent.slice(1).sort((a, b) => b.length - a.length)[0] || p.bodyText,
    rest: sent.slice(1).join(" "),
    inkFrom: [pic && pic.img, wb && wb.img].filter(Boolean) };
}

const stamp = () => `${OTD.mmdd().dayNum} ${OTD.monthName(OTD.mmdd().mm)} ${K.year}`;
// every still of every sticker this post's own words earned, pooled, so a
// swarm is a mix rather than one image over and over
const sfr = (i = 0) => (K.stick[i % Math.max(1, K.stick.length)] || {}).frames || null;
const pool = () => { const all = K.stick.flatMap((s) => s.frames); return all.length ? all : null; };
const picLabel = () => K.pic ? `${K.pic.what} · ${K.pic.note}` : "";
const inked = (img, cells) => S.screened(img, cells, INK, null);
const bw = (img, cells) => S.screened(img, cells, [0, 0, 0], [255, 255, 255]);

// ================= BEAT 1 · the hook =================
// Not a sentence in a box. The line at the size of the frame, the one picture
// the post still has at every scale from a speck to bigger than the canvas.

function hook() { ({ A: hookA, B: hookB, C: hookC, D: hookD })[OPT](); }

function hookA() {
  if (K.pic) { const big = bw(K.pic.img, 150); push(); S.bleed(big, 300, 620, 1180); pop(); }
  if (pool()) S.swarm(pool(), { n: 14, min: 30, max: 330, rot: 0.34 });
  push(); fill(0); noStroke();
  const px = S.giantSize(K.theLine, OTD.W * 1.22, 780, 0.94, (v) => S.arialB(v), 260);
  S.giant(K.theLine, 44, 232, px, 0.94, OTD.W * 1.22, (v) => S.arialB(v), 96);
  pop();
  push(); translate(556, 968); rotate(-0.045);
  const c = A.panel(0, 0, 468, 214, "SPONSORED", INK);
  fill(0); noStroke(); S.arialB(30);
  let yy = c.y + 26; for (const ln of OTD.wrap(K.title, c.w)) { text(ln, c.x, yy); yy += 36; }
  A.link(K.permalink, c.x, c.y + c.h - 20, INK, 19);
  pop();
  if (K.pic) S.march(bw(K.pic.img, 60), 1216, 62, { gap: 4, angle: -0.02 });
  push(); noStroke(); fill(0); S.courier(17); text(picLabel(), 46, 1180); pop();
  S.anomaly(196, 892);
}

function hookB() {
  push(); fill(0); noStroke(); S.arial(30);
  S.justified(K.body, 44, 190, 700, 40, 470);
  pop();
  if (K.pic) { push(); S.bleed(K.pic.img, 210, 1090, 880); pop(); }
  if (pool()) S.swarm(pool(), { n: 13, min: 34, max: 340, rot: 0.28, y: 260, h: 1140 });
  push(); fill(0); noStroke();
  const px = S.giantSize(K.theLine, OTD.W * 1.18, 620, 0.96, (v) => S.arial(v), 250);
  S.giant(K.theLine, 40, 520, px, 0.96, OTD.W * 1.18, (v) => S.arial(v), 96);
  pop();
  push(); translate(716, 208); rotate(0.06); B.inkCard(0, 0, 318, 218, `${K.title} · ${stamp()}`, K.permalink, INK); pop();
  B.notes([picLabel() || K.permalink, K.permalink], 892, 470, 142);
  S.anomaly(858, 640);
}

function hookC() {
  push(); translate(690, 340); rotate(-0.13); translate(-690, -340);
  C.stack(320, 200, 760, 470, 13, K.permalink, (i, r) => {
    const c = C.PRIMARY[i % C.PRIMARY.length];
    noStroke(); fill(c[0], c[1], c[2]); rect(r.x, r.y, r.w, r.h);
    if (K.pic && i > 0) C.picture(K.pic.img, r.x + r.w * 0.3, r.y, r.w * 0.7, r.h);
    if (i === 0) { fill(255); rect(r.x, r.y, r.w, r.h); if (K.pic) C.picture(K.pic.img, r.x + r.w * 0.42, r.y + 10, r.w * 0.58, r.h - 20); }
  }, -30, -24);
  pop();
  if (pool()) S.swarm(pool(), { n: 11, min: 38, max: 280, rot: 0.38, y: 540, h: 820 });
  push(); fill(0); noStroke();
  const px = S.giantSize(OTD.caps(K.theLine), OTD.W * 1.2, 560, 0.9, (v) => S.arialB(v), 210);
  S.giant(OTD.caps(K.theLine), 40, 700, px, 0.9, OTD.W * 1.2, (v) => S.arialB(v), 96);
  pop();
  if (K.pic) S.march(K.pic.img, 1236, 58, { gap: 5 });
  C.margin(`${K.permalink}  ·  crackunit.com`, "left", INK);
  C.margin(picLabel() || K.title, "right", INK);
  S.anomaly(902, 1148);
}

function hookD() {
  if (K.pic) { push(); S.bleed(inked(K.pic.img, 170), 830, 900, 1080); pop(); }
  if (pool()) S.swarm(pool().map((f) => inked(f, 90)), { n: 14, min: 28, max: 320, rot: 0.32 });
  push(); fill(0); noStroke();
  const px = S.giantSize(K.theLine, OTD.W * 1.16, 620, 1.0, (v) => S.arial(v), 230);
  S.giant(K.theLine, 44, 200, px, 1.0, OTD.W * 1.16, (v) => S.arial(v), 96);
  pop();
  if (K.pic) { const w3 = D.win(44, 872, 300, 300, INK, `${K.pic.img.width}×${K.pic.img.height}`); D.grid(K.pic.img, w3.x + 12, w3.y + 12, w3.w - 24, w3.h - 24, 16, INK); }
  if (K.pic) S.march(inked(K.pic.img, 60), 1216, 56, { gap: 6, angle: 0.015 });
  push(); noStroke(); S.arial(21); fill(0); text(`${K.title} · ${stamp()}`, 44, 826);
  fill(INK[0], INK[1], INK[2]); text(K.permalink, 44, 852); pop();
  S.anomaly(400, 780, INK);
}

// ================= BEAT 2 · the video =================

function video() { ({ A: videoA, B: videoB, C: videoC, D: videoD })[OPT](); }
const tcOf = (f) => `0:${String(Math.floor(f.t / 60)).padStart(2, "0")}:${String(Math.round(f.t % 60)).padStart(2, "0")}`;

function videoA() {
  const F = K.frames;
  push(); S.bleed(bw(F[2].img, 260), 760, 400, 1240); pop();
  if (pool()) S.swarm(pool(), { n: 13, min: 34, max: 300, rot: 0.32 });
  push(); fill(0); noStroke();
  const px = S.giantSize(K.title, OTD.W * 1.15, 320, 0.94, (v) => S.arialB(v), 150);
  S.giant(K.title, 40, 128, px, 0.94, OTD.W * 1.15, (v) => S.arialB(v), 96);
  pop();
  [[26, 520, 296, -0.05], [372, 640, 268, 0.04], [676, 486, 300, -0.02], [120, 866, 280, 0.05], [438, 934, 300, -0.04], [742, 830, 286, 0.03]]
    .forEach(([x, y, w, a], i) => {
      const f = F[(i * 2 + 1) % F.length];
      push(); translate(x, y); rotate(a);
      const b = A.panel(0, 0, w, w * f.img.height / f.img.width + 78, "SPONSORED", INK);
      A.picture(f.img, b.x, b.y, b.w, b.w * f.img.height / f.img.width, INK);
      A.caption([tcOf(f), K.meta.id], b.x, b.y + b.w * f.img.height / f.img.width + 30, INK);
      pop();
    });
  S.march(F.map((f) => bw(f.img, 72)), 1232, 96, { gap: 3 });
  push(); fill(0); noStroke(); S.arialB(19); text(`${K.meta.uploader} · ${K.meta.view_count} views · ${K.meta.duration}s`, 46, 1196); pop();
  S.anomaly(646, 1128);
}

function videoB() {
  const F = K.frames;
  push(); tint(255, 90); S.bleed(F[7 % F.length].img, 700, 500, 1500); noTint(); pop();
  push(); fill(0); noStroke(); S.arial(32);
  S.justified(K.body, 44, 150, 720, 43, 560);
  pop();
  if (pool()) S.swarm(pool(), { n: 13, min: 32, max: 310, rot: 0.3 });
  [[62, 300, 286, -0.06], [330, 430, 320, 0.03], [630, 316, 290, -0.03], [104, 704, 328, 0.05], [430, 836, 310, -0.05], [714, 660, 296, 0.04], [206, 1046, 300, 0.02]]
    .forEach(([x, y, w, a], i) => {
      const f = F[i % F.length], ih = w * f.img.height / f.img.width;
      push(); translate(x, y); rotate(a);
      S.shadow(28, 5, 10, 0.24); noStroke(); fill(255); rect(0, 0, w, ih + 50); S.noShadow();
      B.picture(f.img, 12, 12, w - 24, ih - 24, INK);
      noStroke(); fill(0); S.arial(15); text(tcOf(f), 12, ih + 30);
      pop();
    });
  push(); translate(700, 1180); rotate(-0.05); B.inkCard(0, 0, 330, 150, `${K.meta.view_count} views · ${K.meta.duration}s`, K.meta.id, INK); pop();
  B.notes(K.lines.slice(0, 3), 892, 200, 142);
  S.anomaly(556, 268);
}

function videoC() {
  const F = K.frames;
  push(); translate(600, 700); rotate(-0.1); translate(-600, -700);
  C.stack(340, 470, 780, 500, F.length, K.url, (i, r) => {
    const f = F[i % F.length], c = C.PRIMARY[i % C.PRIMARY.length];
    noStroke(); fill(c[0], c[1], c[2]); rect(r.x, r.y, r.w, r.h);
    C.picture(f.img, r.x + r.w * 0.26, r.y, r.w * 0.74, r.h - 1, INK);
  }, -32, -22);
  pop();
  if (pool()) S.swarm(pool(), { n: 12, min: 36, max: 300, rot: 0.36, y: 660, h: 700 });
  push(); fill(0); noStroke();
  const px = S.giantSize(OTD.caps(K.title), OTD.W * 1.2, 300, 0.92, (v) => S.arialB(v), 150);
  S.giant(OTD.caps(K.title), 40, 118, px, 0.92, OTD.W * 1.2, (v) => S.arialB(v), 96);
  pop();
  S.march(F.map((f) => f.img), 1180, 108, { gap: 4, angle: -0.018 });
  push(); fill(0); noStroke(); S.arialB(18);
  let yy = 1258; for (const t of K.lines.slice(0, 2)) { text(t, 46, yy); yy += 24; } pop();
  C.margin(`${K.permalink}  ·  ${stamp()}`, "left", INK);
  C.margin(`${K.meta.title}  ·  ${K.meta.uploader}`, "right", INK);
  S.anomaly(1002, 1104);
}

function videoD() {
  const F = K.frames;
  push(); S.bleed(inked(F[4 % F.length].img, 240), 780, 340, 1240); pop();
  if (pool()) S.swarm(pool().map((f) => inked(f, 90)), { n: 13, min: 30, max: 300, rot: 0.34 });
  push(); translate(24, 636); rotate(-0.05);
  const cols = 4, cw = 236, ch = 200;
  for (let i = 0; i < Math.min(12, F.length); i++) {
    const f = F[i], x = (i % cols) * (cw + 6), y = Math.floor(i / cols) * (ch + 6);
    const r = D.win(x, y, cw, ch, INK, tcOf(f));
    D.picture(f.img, r.x + 9, r.y + 9, r.w - 18, r.h - 18, INK);
  }
  pop();
  push(); fill(0); noStroke();
  const px = S.giantSize(K.title, OTD.W * 1.18, 300, 0.98, (v) => S.arial(v), 140);
  S.giant(K.title, 40, 128, px, 0.98, OTD.W * 1.18, (v) => S.arial(v), 96);
  pop();
  S.march(F.map((f) => inked(f.img, 70)), 1256, 92, { gap: 4 });
  push(); noStroke(); S.arial(20); fill(INK[0], INK[1], INK[2]);
  text(`${K.meta.uploader} · ${K.meta.view_count} views · ${K.meta.duration}s · ${K.meta.id}`, 44, 1236); pop();
  S.anomaly(922, 466, INK);
}

// ================= BEAT 3 · the post =================
// The post as the browser rendered it: its sentences as a bullet list, one of
// them pulled out at the size of the frame, and the page the Archive still has.

function post() { ({ A: postA, B: postB, C: postC, D: postD })[OPT](); }

function postA() {
  if (K.wb) { push(); tint(255, 210); S.bleed(K.wb.img, 800, 800, 1080); noTint(); pop(); }
  push(); noStroke(); S.bullets(K.sentences, 46, 176, 480, 16, 1.4, 620); pop();
  if (pool()) S.swarm(pool(), { n: 12, min: 32, max: 300, rot: 0.32 });
  push(); fill(0); noStroke();
  const px = S.giantSize(K.quote, OTD.W * 1.14, 400, 0.96, (v) => S.arialB(v), 120);
  S.giant(K.quote, 40, 660, px, 0.96, OTD.W * 1.14, (v) => S.arialB(v), 96);
  pop();
  push(); translate(44, 1082); rotate(-0.035);
  const c = A.panel(0, 0, 430, 176, "SPONSORED", INK);
  fill(0); noStroke(); S.arialB(27); text(K.title, c.x, c.y + 24);
  A.link(K.permalink, c.x, c.y + 62, INK, 18);
  noStroke(); fill(0); S.arialB(16); text(`web.archive.org/web/${K.wb ? K.wb.ts : ""}`, c.x, c.y + 104);
  pop();
  S.anomaly(690, 592);
}

function postB() {
  push(); fill(0); noStroke(); S.arial(30);
  S.justified(K.body, 44, 154, 700, 40, 430);
  pop();
  if (K.wb) { push(); translate(470, 620); rotate(0.045); S.shadow(40, 8, 14, 0.26); noStroke(); fill(255); rect(0, 0, 620, 720); S.noShadow(); S.cover(K.wb.img, 16, 16, 588, 660, false); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(17); text(`web.archive.org/web/${K.wb.ts}`, 16, 700); pop(); }
  if (pool()) S.swarm(pool(), { n: 12, min: 34, max: 330, rot: 0.3 });
  push(); fill(0); noStroke();
  const px = S.giantSize(K.quote, OTD.W * 1.12, 340, 0.98, (v) => S.arial(v), 116);
  S.giant(K.quote, 38, 470, px, 0.98, OTD.W * 1.12, (v) => S.arial(v), 96);
  pop();
  push(); noStroke(); S.bullets(K.sentences, 46, 900, 400, 15, 1.4, 1240); pop();
  B.notes([K.theLine, K.permalink], 892, 172, 142);
  S.anomaly(866, 852);
}

function postC() {
  if (K.wb) {
    push(); translate(560, 760); rotate(0.085); translate(-560, -760);
    C.stack(300, 520, 800, 780, 6, K.wb.snapshot ? K.wb.snapshot.replace(/^https?:\/\//, "") : K.permalink, (i, r) => {
      if (i === 0) { noStroke(); fill(255); rect(r.x, r.y, r.w, r.h); S.cover(K.wb.img, r.x + 1, r.y, r.w - 2, r.h - 1, false); }
      else { const c = C.PRIMARY[i % C.PRIMARY.length]; noStroke(); fill(c[0], c[1], c[2]); rect(r.x, r.y, r.w, r.h); }
    }, -34, -26);
    pop();
  }
  if (pool()) S.swarm(pool(), { n: 11, min: 38, max: 280, rot: 0.36 });
  push(); fill(0); noStroke();
  const px = S.giantSize(OTD.caps(K.quote), OTD.W * 1.16, 330, 0.9, (v) => S.arialB(v), 108);
  S.giant(OTD.caps(K.quote), 38, 116, px, 0.9, OTD.W * 1.16, (v) => S.arialB(v), 96);
  pop();
  push(); noStroke(); S.bullets(K.sentences.slice(0, 3), 46, 486, 380, 15, 1.4, 640); pop();
  C.margin(`${K.permalink}  ·  crackunit.com`, "left", INK);
  C.margin(K.wb ? `recovered, web.archive.org · ${K.wb.ts}` : K.title, "right", INK);
  S.anomaly(468, 452);
}

function postD() {
  if (K.wb) { push(); S.bleed(inked(K.wb.img, 200), 700, 830, 1160); pop(); }
  if (pool()) S.swarm(pool().map((f) => inked(f, 90)), { n: 13, min: 30, max: 300, rot: 0.34 });
  push(); fill(0); noStroke();
  const px = S.giantSize(K.quote, OTD.W * 1.12, 360, 1.0, (v) => S.arial(v), 116);
  S.giant(K.quote, 42, 150, px, 1.0, OTD.W * 1.12, (v) => S.arial(v), 96);
  pop();
  push(); translate(40, 588); rotate(-0.02);
  D.cardStack(0, 0, 470, 300, 4, INK, (i, r) => {
    if (i > 0) return;
    push(); fill(0); noStroke(); S.arial(17);
    let yy = r.y + 28; for (const ln of OTD.wrap(K.body, r.w - 48)) { if (yy > r.y + r.h - 14) break; text(ln, r.x + 24, yy); yy += 23; } pop();
  }, -13, -13);
  pop();
  if (K.wb) { const w3 = D.win(742, 596, 268, 268, INK, String(K.year)); D.grid(K.wb.img, w3.x + 12, w3.y + 12, w3.w - 24, w3.h - 24, 16, INK); }
  push(); noStroke(); S.arial(21); fill(0); text(`${K.title} · ${stamp()}`, 44, 1214);
  fill(INK[0], INK[1], INK[2]); text(K.wb ? `web.archive.org/web/${K.wb.ts}` : K.permalink, 44, 1244); pop();
  S.anomaly(636, 508, INK);
}
