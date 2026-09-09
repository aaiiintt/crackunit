// 09-09 · the claim · D · Duotone · ink #c79710 · MIDDLING
//
// Composed against the treatment at otd/data/treatments/09-09.json, which owns
// the register, the ink and the order. Redlines go there, not here.
//
// The day: four posts, 2008 and 2009. One image dead, one video's twelve frames
// alive, one post with no media at all. In 2009 Iain watched a video die
// overnight and left the corpse in on purpose, asking how long the others had.
// This is that question and its answer.

const Q = new URLSearchParams(location.search);
const BEAT = Number(Q.get("beat") || 1);
let T = null, asked = false, INK = [199, 151, 16], REG = "D";

function preload() { OTD.preload(); }
function setup() { createCanvas(OTD.W, OTD.H); noLoop(); }

function draw() {
  if (!OTD.day || !OTD.day.posts || !OTD.allLoaded()) { setTimeout(() => redraw(), 90); return; }
  if (!asked) {
    asked = true;
    OTD.fetchJSON(`/otd/data/treatments/${OTD.day.day}.json`, (j) => { T = j; });
    for (const p of OTD.posts()) for (const it of OTD.stickersFor(p, 6)) OTD.loadSticker(it);
    setTimeout(() => redraw(), 90); return;
  }
  if (!T) { setTimeout(() => redraw(), 90); return; }
  OTD.begin();
  REG = (T.register.name || "D").trim()[0];
  INK = hexRGB(T.ink.hex);
  STYLES[REG].paint();
  const fn = BEATS[BEAT - 1];
  if (!fn) return OTD.skip(`09-09 has no beat ${BEAT}`);
  fn();
  S.daymark(`on this day · ${OTD.mmdd().dayNum} ${OTD.monthName(OTD.mmdd().mm)}`);
  OTD.done();
}

const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const post = (slug) => OTD.posts().find((p) => p.slug === slug);
const bootlegs = () => post("super-lovely-bootlegs");
const ramsay = () => post("1433") || OTD.posts().find((p) => /ramsay/i.test(p.title));
const player = () => post("nice-music-player-widget-affiliate");
const freak = () => post("i-dont-normally-post-this-kind-of-thing");
const clean = (t) => String(t).replace(/\\([\[\]])/g, "$1");
const framesOf = (p) => (OTD.frames[(p.video || {}).id] || []).filter((f) => f.img && f.img.width > 1);
const stills = (p, n = 6) => OTD.stickersFor(p, 4).flatMap((it) => { const g = OTD.sticker(it); return g && g.width > 1 ? OTD.gifFrames(g, n) : []; });
const inked = (img, cells) => S.screened(img, cells, INK, null);
const credit = (p) => {
  const its = OTD.stickersFor(p, 4);
  return its.length ? [`giphy ${its[0].id}${its.length > 1 ? ` +${its.length - 1}` : ""}`, [...new Set(its.map((i) => `"${i.query}"`))].join(" "), "powered by giphy"]
    : [`crackunit.com${p.permalink}`];
};

// the sentence the whole day turns on
const theLine = () => (bootlegs().sentences || []).find((s) => /how long the others/i.test(s)) || T.line.text;

const BEATS = [
  // 1 · the question, over what is left of the answer
  () => {
    const F = framesOf(bootlegs());
    if (F.length) {
      OTD.wall(F.map((f) => inked(f.img, 150)), 3, 4, { x: -40, y: -40, w: OTD.W + 80, h: OTD.H + 80, jitter: 10 });
      push(); noStroke(); fill(247, 244, 237, 120); rect(0, 0, OTD.W, OTD.H); pop();
    }
    push(); fill(0); noStroke();
    S.giantFit(theLine(), 42, 250, 760, 0.98, (v) => S.arial(v), { maxPx: 200, jitter: 70 });
    pop();
    push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(22);
    text(`${bootlegs().title} · ${bootlegs().year}`, 44, 1206);
    text(bootlegs().permalink, 44, 1238); pop();
    S.anomaly(880, 1120, INK);
    S.credit(credit(bootlegs()));
  },

  // 2 · the reveal: this was written in 2009
  () => {
    const F = framesOf(bootlegs());
    if (F.length) { push(); S.bleed(inked(F[9 % F.length].img, 210), 840, 1090, 1120); pop(); }
    const edit = clean((bootlegs().bodyText.match(/EDIT:[\s\S]*$/) || [bootlegs().bodyText])[0]);
    // the swarm goes under the window, or it eats the words
    if (stills(bootlegs()).length) S.swarm(stills(bootlegs()).map((f) => inked(f, 90)), { n: 9, rot: 0.3, max: 700 });
    const w = D.win(52, 150, 700, 700, INK, `${bootlegs().permalink} · ${bootlegs().date.slice(0, 10)}`, [247, 244, 237]);
    push(); fill(0); noStroke();
    const px = S.fitBox(edit, w.w - 72, w.h - 80, 1.26, 58, 20, (v) => S.arial(v));
    let y = w.y + 40 + px * 0.8;
    for (const ln of OTD.wrap(edit, w.w - 72)) { text(ln, w.x + 36, y); y += px * 1.26; }
    pop();
    const cap = D.win(52, 872, 700, 74, INK);
    push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(23);
    text(`${bootlegs().title} · ${bootlegs().year}`, cap.x + 16, cap.y + 28); pop();
    S.credit(credit(bootlegs()));
  },

  // 3 · one that did not last
  () => {
    const p = ramsay(), im = OTD.images_(p)[0];
    if (stills(p).length) S.swarm(stills(p).map((f) => inked(f, 100)), { n: 12, rot: 0.34 });
    push();
    OTD.brokenImage(im ? im.alt : "", 96, 300, 620, 470);
    pop();
    push(); fill(0); noStroke();
    S.giantFit(p.title, 44, 848, 300, 0.96, (v) => S.arial(v), { maxPx: 170, jitter: 56 });
    pop();
    const meta = D.win(44, 1150, OTD.W - 88, 106, INK);
    push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(21);
    text(`${im ? im.src : ""} · no longer available`, meta.x + 16, meta.y + 26);
    text(`${p.permalink} · ${p.year}`, meta.x + 16, meta.y + 54); pop();
    S.anomaly(742, 262, INK);
    S.credit(credit(p));
  },

  // 4 · 2008's idea of the future of music, as a list it wrote itself
  () => {
    const p = player();
    const items = (p.bodyText.match(/\d\.\s[^0-9]+?(?=\s\d\.\s|$)/g) || p.sentences || []).map((t) => t.trim());
    push(); fill(0); noStroke();
    S.giantFit(p.title, 44, 150, 260, 0.96, (v) => S.arial(v), { maxPx: 130, jitter: 50 });
    pop();
    push(); S.bullets(items, 56, 470, 700, 24, 1.44, 1120); pop();
    if (stills(p).length) S.march(stills(p).map((f) => inked(f, 80)), 1146, 118, { gap: 6, angle: -0.02 });
    push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(22);
    text(`${p.permalink} · ${p.year}`, 46, 1104); pop();
    S.credit(credit(p));
  },

  // 5 · seventy-five characters, whole, alone
  () => {
    const p = freak();
    push(); fill(0); noStroke();
    S.giantFit(p.bodyText, 44, 300, 720, 1.0, (v) => S.arial(v), { maxPx: 210, jitter: 76 });
    pop();
    push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(23);
    text(`${p.title} · ${p.year}`, 46, 1160);
    text(`${p.permalink} · no image, no video, ${p.bodyText.length} characters`, 46, 1194); pop();
    S.anomaly(560, 1052, INK);
    S.credit([`crackunit.com${p.permalink}`]);
  },

  // 6 · the one that lasted, with yt-dlp's own record of it
  () => {
    const p = bootlegs(), F = framesOf(p);
    const m = (OTD.manifests[p.video.id] || {}).meta || {};
    push(); translate(28, 190); rotate(-0.03);
    const cols = 3, cw = 336, ch = 268;
    F.slice(0, 12).forEach((f, i) => {
      const r = D.win((i % cols) * (cw + 8), Math.floor(i / cols) * (ch + 8), cw, ch, INK,
        `0:${String(Math.floor(f.t / 60)).padStart(2, "0")}:${String(Math.round(f.t % 60)).padStart(2, "0")}`);
      D.picture(f.img, r.x + 10, r.y + 10, r.w - 20, r.h - 20, INK);
    });
    pop();
    const w = D.win(560, 1082, 470, 200, INK, m.id || p.video.id);
    push(); fill(0); noStroke(); S.arial(21); let y = w.y + 30;
    for (const t of [m.title, m.uploader, m.upload_date, `${m.view_count} views`, `${m.duration}s`].filter(Boolean)) {
      for (const ln of OTD.wrap(String(t), w.w - 36)) { if (y > w.y + w.h - 14) break; text(ln, w.x + 18, y); y += 26; }
    } pop();
    push(); noStroke(); fill(INK[0], INK[1], INK[2]); S.arial(22);
    text(`${p.title} · ${p.year}`, 46, 1120);
    text(p.permalink, 46, 1152); pop();
    S.credit([`youtube.com/watch?v=${p.video.id}`, m.uploader || "", `${F.length} frames`]);
  },

  // 7 · what this day contains, and where to read it
  () => {
    const posts = OTD.posts();
    CARDS.index(REG, { x: 74, y: 150, w: OTD.W - 148, h: OTD.H - 260 }, {
      dateWords: `${OTD.mmdd().dayNum} ${OTD.monthName(OTD.mmdd().mm)}`.toUpperCase(),
      rows: posts.map((p) => ({ date: p.date, title: p.title, permalink: p.permalink })),
      years: [...new Set(posts.map((p) => p.year))].sort(),
      url: `otd.crackunit.com/${OTD.day.day}`,
    }, INK);
    S.credit([`crackunit.com`, `${posts.length} posts`, [...new Set(posts.map((p) => p.year))].sort().join(" ")]);
  },

  // 8 · come back tomorrow
  () => {
    const t = OTD.tomorrow();
    if (stills(bootlegs()).length) S.swarm(stills(bootlegs()).map((f) => inked(f, 90)), { n: 13, rot: 0.34 });
    const [mm, dd] = t.day.split("-");
    CARDS.tomorrow(REG, { x: 52, y: 220, w: OTD.W - 104, h: OTD.H - 400 }, {
      dateWords: `${Number(dd)} ${OTD.monthName(mm)}`,
      count: `${t.posts.length} post${t.posts.length === 1 ? "" : "s"}${t.years.length ? ` · ${t.years.join(" · ")}` : ""}`,
      url: `otd.crackunit.com/${t.day}`,
    }, INK);
    S.credit(credit(bootlegs()));
  },
];
