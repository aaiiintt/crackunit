// Part A: three beats, drawn four ways. One sketch; page.html passes ?option=&beat=.
//
//   beat 1  the hook   11-09  the line, its post's recovered picture, the date
//   beat 2  the video  11-26  twelve frames of one video and its own metadata
//   beat 3  the post   11-09  a quote and the page the Wayback Machine still has
//
// The content is built once, from the day JSON and this repo's captures, and
// every element carries the post it belongs to. A beat never draws material
// from another post, and no word on any of these is written by us: the line,
// the quote, the titles, the permalinks, the timecodes, the video's own
// metadata and the archive's own URLs are all the archive's. Composition is
// per style, because a look is composition.

const Q = new URLSearchParams(location.search);
const OPT = (Q.get("option") || "A").toUpperCase();
const BEAT = Number(Q.get("beat") || 1);
let K = null, INK = [20, 20, 20], ST = null;

function preload() { OTD.preload(); }
function setup() { createCanvas(OTD.W, OTD.H); noLoop(); }

function draw() {
  if (!OTD.day || !OTD.day.posts || !OTD.allLoaded()) { setTimeout(() => redraw(), 90); return; }
  OTD.begin();
  ST = STYLES[OPT];
  if (!ST) return OTD.skip(`unknown option ${OPT}`);
  K = build();
  if (!K) return OTD.skip(`beat ${BEAT} has no material on ${OTD.day.day}`);
  INK = S.inkFrom(K.inkFrom, [20, 20, 20]);
  ST.paint();
  ({ 1: hook, 2: video, 3: post })[BEAT]();
  OTD.done();
}

// ---------- the content, with its provenance ----------

function build() {
  const posts = OTD.posts();
  if (BEAT === 2) {
    // the day's best surviving video: most frames, then the largest picture
    const live = posts.filter((p) => p.video && (OTD.frames[p.video.id] || []).some((f) => f.img && f.img.width > 1));
    if (!live.length) return null;
    const n = (p) => OTD.frames[p.video.id].filter((f) => f.img && f.img.width > 1).length;
    const area = (p) => { const m = (OTD.manifests[p.video.id] || {}).meta || {}; return (m.width || 0) * (m.height || 0); };
    live.sort((a, b) => n(b) - n(a) || area(b) - area(a));
    const p = live[0];
    const frames = OTD.frames[p.video.id].filter((f) => f.img && f.img.width > 1);
    const meta = (OTD.manifests[p.video.id] || {}).meta || {};
    return {
      post: p, frames, meta, inkFrom: frames.filter((_, i) => i % 2 === 0).map((f) => f.img),
      title: p.title, permalink: p.permalink, year: p.year, body: p.bodyText,
      lines: [meta.title, meta.uploader, meta.upload_date, `${meta.view_count} views`, `${meta.duration}s`, `${meta.width}×${meta.height} ${meta.fps}fps`, meta.id].filter(Boolean),
      url: (meta.webpage_url || `https://www.youtube.com/watch?v=${p.video.id}`).replace(/^https?:\/\//, ""),
    };
  }
  // beats 1 and 3: the day's hero post, its own picture, its own capture
  const p = OTD.hero();
  if (!p) return null;
  const im = OTD.images_(p)[0] || null;
  const alive = im && OTD.images[im.src];
  const pic = !im ? null
    : alive && alive.width > 1 ? { img: alive, state: "live", what: im.alt, note: `${p.year}` }
    : OTD.rescuedFor(im.src) ? { img: OTD.rescuedFor(im.src), state: "recovered", what: im.alt, note: "recovered, web.archive.org" }
    : null;
  const wb = OTD.waybackAll().find((w) => w.img && w.img.width > 1 && w.url && w.url.includes(p.permalink));
  const sentences = p.sentences || [];
  return {
    post: p, pic, wb, title: p.title, permalink: p.permalink, year: p.year, body: p.bodyText,
    theLine: OTD.line() || sentences[0] || "",
    quote: sentences.slice(1).sort((a, b) => b.length - a.length)[0] || p.bodyText,
    rest: sentences.slice(1).join(" "),
    inkFrom: [pic && pic.img, wb && wb.img].filter(Boolean),
  };
}

const mark = () => `${OTD.mmdd().dayNum} ${OTD.mmdd().abbr}`;
const stamp = () => `${OTD.mmdd().dayNum} ${OTD.monthName(OTD.mmdd().mm)} ${K.year}`;
const picLabel = () => K.pic ? `${K.pic.what} · ${K.pic.note}` : "";

// ================= BEAT 1 · the hook =================
// The strongest single thing the day has, set to survive the square crop.

function hook() { ({ A: hookA, B: hookB, C: hookC, D: hookD })[OPT](); }

function hookA() {
  const h = A.panel(56, 206, 812, 396, "SPONSORED", INK);
  A.headline(K.theLine, h.x, h.y, h.w, h.h, 100);
  if (K.pic) {
    const b = A.panel(452, 566, 552, 508, "SPONSORED", INK);
    A.picture(K.pic.img, b.x, b.y, b.w, b.h - 82, INK);
    A.caption([K.pic.what, K.pic.note], b.x, b.y + b.h - 46, INK);
  }
  const t = A.panel(140, 1090, 800, 196, "SPONSORED", INK);
  A.body(K.rest, t.x, t.y - 6, t.w, 27, t.y + t.h - 20);
  const c = A.panel(60, 812, 372, 208, "SPONSORED", INK);
  push(); fill(0); noStroke(); S.arialB(30);
  let yy = c.y + 28; for (const ln of OTD.wrap(K.title, c.w)) { text(ln, c.x, yy); yy += 36; } pop();
  A.link(K.permalink, c.x, c.y + c.h - 26, INK, 19);
  A.dateMark(mark(), INK);
}

function hookB() {
  // the bed is set to the size that makes this post fill the page: a short post
  // is huge, a long one small, so the day decides the type
  const bx = 56, by = 150, bw = 796, bh = OTD.H - by - 66;
  push(); fill(0); noStroke();
  const px = S.fillSize(K.body, bw, bh, 1.3, (v) => S.arial(v), 92, 26);
  S.justified(K.body, bx, by + px * 0.84, bw, px * 1.3, by + bh);
  pop();
  const card = B.card(178, 372, 700, 404);
  B.headline(K.theLine, card.x, card.y, card.w, card.h, 96);
  B.inkCard(56, 214, 330, 236, `${K.title} · ${stamp()}`, K.permalink, INK);
  if (K.pic) {
    const x = 96, y = 852, w = 388, hh = 340;
    push(); S.shadow(32, 6, 11, 0.22); noStroke(); fill(255); rect(x, y, w, hh); S.noShadow(); pop();
    B.picture(K.pic.img, x + 16, y + 16, w - 32, hh - 76, INK);
    push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(17); text(picLabel(), x + 16, y + hh - 24); pop();
  }
  B.notes([K.quote, picLabel() || K.permalink, K.permalink], 892, 372, 142);
  B.dateMark(`${mark()} · ${K.year}`, INK);
}

function hookC() {
  C.stack(300, 336, 700, 448, K.pic ? 10 : 1, K.permalink, (i, r) => {
    if (i === 0) { noStroke(); fill(255); rect(r.x, r.y, r.w, r.h); C.headline(K.theLine, r.x + 32, r.y + 30, r.w - 64, r.h - 62, 112); }
    else {
      const c = C.PRIMARY[i % C.PRIMARY.length];
      noStroke(); fill(c[0], c[1], c[2]); rect(r.x, r.y, r.w, r.h);
      if (K.pic) C.picture(K.pic.img, r.x + r.w * 0.32, r.y, r.w * 0.68, r.h);
    }
  });
  if (K.pic) {
    C.stack(96, 856, 470, 300, 5, picLabel(), (i, r) => {
      const c = C.PRIMARY[(i + 1) % C.PRIMARY.length];
      noStroke(); fill(c[0], c[1], c[2]); rect(r.x, r.y, r.w, r.h);
      C.picture(K.pic.img, r.x + 1, r.y, r.w - 2, r.h - 1, INK);
    }, -20, -16);
  }
  const t = C.win(608, 900, 400, 356, K.permalink);
  noStroke(); fill(255); rect(t.x + 1, t.y, t.w - 2, t.h - 1);
  push(); fill(0); noStroke(); S.arialB(27);
  let yy = t.y + 40; for (const ln of OTD.wrap(K.title, t.w - 44)) { text(ln, t.x + 22, yy); yy += 33; }
  pop();
  C.body(K.rest, t.x + 22, yy + 4, t.w - 44, 21, t.y + t.h - 24);
  C.margin(`${K.permalink}  ·  crackunit.com`, "left", INK);
  C.margin(picLabel() || K.title, "right", INK);
  C.dateMark(mark(), INK);
}

function hookD() {
  const w1 = D.win(64, 176, 724, 404, INK, K.permalink);
  D.headline(K.theLine, w1.x + 34, w1.y + 26, w1.w - 68, w1.h - 52, 96);
  if (K.pic) {
    const w2 = D.win(536, 552, 476, 448, INK, K.pic.note);
    D.picture(K.pic.img, w2.x + 20, w2.y + 20, w2.w - 40, w2.h - 40, INK);
    const w3 = D.win(64, 636, 428, 364, INK, `${K.pic.img.width}×${K.pic.img.height}`);
    D.grid(K.pic.img, w3.x + 18, w3.y + 18, w3.w - 36, w3.h - 36, 18, INK);
  }
  const w4 = D.win(64, 1032, 948, 254, INK, `${K.title} · ${stamp()}`);
  D.body(K.rest, w4.x + 26, w4.y + 16, w4.w - 52, 27, w4.y + w4.h - 46);
  push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(21); text(K.permalink, w4.x + 26, w4.y + w4.h - 18); pop();
  D.dateMark(mark(), INK);
}

// ================= BEAT 2 · the video =================
// One video's frames, repeated: the test of whether repetition can carry a day.

function video() { ({ A: videoA, B: videoB, C: videoC, D: videoD })[OPT](); }
const tcOf = (f) => `0:${String(Math.floor(f.t / 60)).padStart(2, "0")}:${String(Math.round(f.t % 60)).padStart(2, "0")}`;

function videoA() {
  const h = A.panel(56, 142, 812, 268, "SPONSORED", INK);
  A.headline(K.title, h.x, h.y, h.w, h.h - 46, 72);
  A.link(K.url, h.x, h.y + h.h - 2, INK, 19);
  const spots = [[40, 452, 300], [356, 430, 330], [700, 486, 320], [64, 806, 316], [396, 830, 330], [742, 866, 300]];
  spots.forEach(([x, y, w], i) => {
    const f = K.frames[i % K.frames.length];
    const ih = w * f.img.height / f.img.width;
    const b = A.panel(x, y, w, ih + 84, "SPONSORED", INK);
    A.picture(f.img, b.x, b.y, b.w, b.w * f.img.height / f.img.width, INK);
    A.caption([tcOf(f), K.meta.id], b.x, b.y + b.w * f.img.height / f.img.width + 32, INK);
  });
  const m = A.panel(56, 1196, 420, 108, "SPONSORED", INK);
  push(); fill(0); noStroke(); S.arialB(21);
  text(`${K.meta.uploader}`, m.x, m.y + 20); text(`${K.meta.view_count} views · ${K.meta.duration}s`, m.x, m.y + 52); pop();
  A.dateMark(mark(), INK);
}

function videoB() {
  const bx = 56, by = 150, bw = 796, bh = OTD.H - by - 66;
  push(); fill(0); noStroke();
  const px = S.fillSize(K.body, bw, bh, 1.3, (v) => S.arial(v), 76, 24);
  S.justified(K.body, bx, by + px * 0.84, bw, px * 1.3, by + bh);
  pop();
  const shots = [[80, 262, 300], [318, 388, 336], [560, 300, 300], [130, 700, 344], [424, 812, 328], [600, 690, 260], [232, 1050, 300], [548, 1046, 306]];
  shots.forEach(([x, y, w], i) => {
    const f = K.frames[i % K.frames.length], ih = w * f.img.height / f.img.width;
    push(); S.shadow(28, 5, 10, 0.24); noStroke(); fill(255); rect(x, y, w, ih + 52); S.noShadow(); pop();
    B.picture(f.img, x + 12, y + 12, w - 24, ih - 24, INK);
    push(); noStroke(); fill(0); S.arial(15); text(tcOf(f), x + 12, y + ih + 30); pop();
  });
  B.inkCard(56, 190, 316, 214, `${K.meta.view_count} views · ${K.meta.duration}s`, K.meta.id, INK);
  B.notes(K.lines.slice(0, 4), 892, 288, 142);
  B.dateMark(`${mark()} · ${K.year}`, INK);
}

function videoC() {
  C.headline(K.title, 56, 158, 960, 186, 92);
  C.stack(300, 528, 700, 462, K.frames.length, K.url, (i, r) => {
    const f = K.frames[i % K.frames.length];
    const c = C.PRIMARY[i % C.PRIMARY.length];
    noStroke(); fill(c[0], c[1], c[2]); rect(r.x, r.y, r.w, r.h);
    C.picture(f.img, r.x + r.w * 0.28, r.y, r.w * 0.72, r.h - 1, INK);
  }, -26, -16);
  const m = C.win(56, 1012, 396, 250, K.meta.id);
  noStroke(); fill(255); rect(m.x + 1, m.y, m.w - 2, m.h - 1);
  push(); fill(0); noStroke(); S.arialB(20); let yy = m.y + 34;
  for (const t of K.lines) { text(t.length > 32 ? t.slice(0, 31) + "…" : t, m.x + 20, yy); yy += 28; } pop();
  C.stack(516, 1036, 496, 226, 4, K.permalink, (i, r) => {
    const f = K.frames[(K.frames.length - 1 - i + K.frames.length) % K.frames.length];
    const c = C.PRIMARY[(i + 2) % C.PRIMARY.length];
    noStroke(); fill(c[0], c[1], c[2]); rect(r.x, r.y, r.w, r.h);
    C.picture(f.img, r.x + r.w * 0.24, r.y, r.w * 0.76, r.h - 1, INK);
  }, -22, -18);
  C.margin(`${K.permalink}  ·  ${stamp()}`, "left", INK);
  C.margin(`${K.meta.title}  ·  ${K.meta.uploader}`, "right", INK);
  C.dateMark(mark(), INK);
}

function videoD() {
  const w1 = D.win(64, 146, 616, 414, INK, K.meta.id);
  D.picture(K.frames[0].img, w1.x + 18, w1.y + 18, w1.w - 36, w1.h - 36, INK);
  const w3 = D.win(700, 146, 312, 414, INK, `${K.meta.width}×${K.meta.height}`);
  D.grid(K.frames[Math.floor(K.frames.length / 2)].img, w3.x + 16, w3.y + 16, w3.w - 32, w3.h - 32, 14, INK);
  const cols = 4, gx = 64, gy = 592, cw = 234, ch = 198;
  for (let i = 0; i < Math.min(12, K.frames.length); i++) {
    const f = K.frames[i], x = gx + (i % cols) * (cw + 6), y = gy + Math.floor(i / cols) * (ch + 6);
    const r = D.win(x, y, cw, ch, INK, tcOf(f));
    D.picture(f.img, r.x + 9, r.y + 9, r.w - 18, r.h - 18, INK);
  }
  push(); noStroke(); S.arial(25); fill(0);
  let yy = 1238; for (const ln of OTD.wrap(K.title, 700)) { text(ln, 64, yy); yy += 32; }
  S.arial(20); fill(INK[0], INK[1], INK[2]);
  text(`${K.meta.uploader} · ${K.meta.view_count} views · ${K.meta.duration}s`, 64, yy + 2);
  pop();
  D.dateMark(mark(), INK);
}

// ================= BEAT 3 · the post =================
// A quote and the page it came from, as web.archive.org still holds it.

function post() { ({ A: postA, B: postB, C: postC, D: postD })[OPT](); }

function postA() {
  const h = A.panel(56, 144, 812, 384, "SPONSORED", INK);
  A.headline(K.quote, h.x, h.y, h.w, h.h, 66);
  if (K.wb) {
    const b = A.panel(324, 566, 680, 704, "SPONSORED", INK);
    S.cover(K.wb.img, b.x, b.y, b.w, b.h - 76, false);
    A.caption([`web.archive.org/web/${K.wb.ts}`, K.wb.url.replace(/^https?:\/\//, "")], b.x, b.y + b.h - 42, INK);
  }
  const c = A.panel(48, 700, 300, 214, "SPONSORED", INK);
  push(); fill(0); noStroke(); S.arialB(28);
  let yy = c.y + 26; for (const ln of OTD.wrap(K.title, c.w)) { text(ln, c.x, yy); yy += 34; } pop();
  A.link(K.permalink, c.x, c.y + c.h - 26, INK, 17);
  const t = A.panel(48, 986, 300, 288, "SPONSORED", INK);
  A.body(K.body, t.x, t.y - 8, t.w, 22, t.y + t.h - 12);
  A.dateMark(mark(), INK);
}

function postB() {
  const bx = 56, by = 150, bw = 796, bh = OTD.H - by - 66;
  push(); fill(0); noStroke();
  const px = S.fillSize(K.body, bw, bh, 1.3, (v) => S.arial(v), 92, 26);
  S.justified(K.body, bx, by + px * 0.84, bw, px * 1.3, by + bh);
  pop();
  const card = B.card(150, 232, 712, 366);
  B.headline(K.quote, card.x, card.y, card.w, card.h, 62);
  if (K.wb) {
    const x = 96, y = 650, w = 604, hh = 606;
    push(); S.shadow(36, 7, 13, 0.26); noStroke(); fill(255); rect(x, y, w, hh); S.noShadow(); pop();
    S.cover(K.wb.img, x + 16, y + 16, w - 32, hh - 72, false);
    push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(17); text(`web.archive.org/web/${K.wb.ts}`, x + 16, y + hh - 24); pop();
  }
  B.inkCard(716, 940, 300, 240, `${K.title} · ${stamp()}`, K.permalink, INK);
  B.notes([K.theLine, K.permalink], 892, 640, 142);
  B.dateMark(`${mark()} · ${K.year}`, INK);
}

function postC() {
  C.headline(K.quote, 56, 152, 956, 236, 56);
  if (K.wb) {
    C.stack(268, 520, 736, 700, 6, K.wb.snapshot ? K.wb.snapshot.replace(/^https?:\/\//, "") : K.permalink, (i, r) => {
      if (i === 0) { noStroke(); fill(255); rect(r.x, r.y, r.w, r.h); S.cover(K.wb.img, r.x + 1, r.y, r.w - 2, r.h - 1, false); }
      else { const c = C.PRIMARY[i % C.PRIMARY.length]; noStroke(); fill(c[0], c[1], c[2]); rect(r.x, r.y, r.w, r.h); }
    }, -28, -22);
  }
  const t = C.win(48, 940, 372, 316, K.permalink);
  noStroke(); fill(255); rect(t.x + 1, t.y, t.w - 2, t.h - 1);
  push(); fill(0); noStroke(); S.arialB(26);
  let yy = t.y + 38; for (const ln of OTD.wrap(K.title, t.w - 40)) { text(ln, t.x + 20, yy); yy += 32; } pop();
  push(); noStroke(); S.courier(17); fill(0); text(stamp(), t.x + 20, yy + 8); pop();
  C.body(K.theLine, t.x + 20, yy + 26, t.w - 40, 23, t.y + t.h - 20);
  C.margin(`${K.permalink}  ·  crackunit.com`, "left", INK);
  C.margin(K.wb ? `recovered, web.archive.org · ${K.wb.ts}` : K.title, "right", INK);
  C.dateMark(mark(), INK);
}

function postD() {
  // the reference's repetition: the same card, offset, its words stepping down
  D.cardStack(84, 146, 640, 372, 4, INK, (i, r) => {
    if (i > 0) return;
    push(); fill(0); noStroke();
    let yy = r.y + 44;
    for (const px of [34, 23, 15]) {
      S.arial(px);
      for (const ln of OTD.wrap(K.quote, r.w - 56)) { if (yy > r.y + r.h - 12) break; text(ln, r.x + 28, yy); yy += px * 1.24; }
      yy += 14;
    }
    pop();
  });
  if (K.wb) {
    const w2 = D.win(376, 560, 636, 700, INK, `web.archive.org/web/${K.wb.ts}`);
    D.picture(K.wb.img, w2.x + 18, w2.y + 18, w2.w - 36, w2.h - 36, INK);
    const w3 = D.win(64, 560, 278, 278, INK, String(K.year));
    D.grid(K.wb.img, w3.x + 14, w3.y + 14, w3.w - 28, w3.h - 28, 16, INK);
  }
  const w4 = D.win(64, 880, 278, 380, INK, K.title);
  D.body(K.body, w4.x + 18, w4.y + 12, w4.w - 36, 19, w4.y + w4.h - 44);
  push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(16); text(K.permalink, w4.x + 18, w4.y + w4.h - 16); pop();
  D.dateMark(mark(), INK);
}
