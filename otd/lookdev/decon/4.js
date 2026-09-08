// 4 · The stills wall. Every frame from the day's two surviving videos fills
// the card edge to edge, interlaced; three crops at 3× dropped on top; the
// videos' own words (yt-dlp metadata) and two sentences from the posts as
// crisp labels. White under it all. Accent: one REC burn-in.
const IDS = ["vz7BcEfuTFc", "cvs9kURU79s"];
let treated = null;
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  const ready = IDS.every((id) => OTD.frames[id] && OTD.frames[id].every((f) => f.img.width));
  if (!ready) { setTimeout(() => redraw(), 80); return; }
  OTD.begin();
  background(OTD.WHITE);
  const S = OTD.seed();
  const raw = IDS.flatMap((id) => OTD.frames[id].map((f) => ({ id, ...f })));
  if (!treated) treated = raw.map((f) => ({ ...f, img: random() < 0.5 ? OTD.interlace(OTD.chroma(f.img, 3), 3) : OTD.interlace(f.img, 4) }));

  // the wall: 6 × 10 cells of 4:3
  const cols = 6, rows = 10;
  const cells = OTD.wall(treated.map((f) => f.img), cols, rows, { order: S % 2 ? "seq" : "rand" });

  // three crops at 3×, seeded, one of them the card's wrongness
  for (let i = 0; i < 3; i++) {
    const f = random(treated);
    const cw = 540, ch = 405;
    const x = random(-100, 1080 - 440), y = random(-60, 1350 - 345);
    image(f.img, x, y, cw, ch);
    OTD.scanlines(x, y, cw, ch, 30, 4);
    if (i === 0) { OTD.osd("REC", x + 24, y + 48, 32); fill(OTD.REC); circle(x + 118, y + 38, 22); }
    OTD.osd(`0:00:${String(Math.round(f.t)).padStart(2, "0")}`, x + 24, y + ch - 20, 24);
  }

  // the videos' own words, as labels
  const words = IDS.flatMap((id) => OTD.snippets(id));
  for (const w of words) {
    const x = random(40, 700), y = random(120, 1300);
    fill(0); OTD.label(w, x, y, 18, "#fff");
  }
  // two sentences from the posts, found by slug
  const say = [];
  for (const p of OTD.posts()) if (p.video && IDS.includes(p.video.id) && p.sentences && p.sentences.length) say.push(random(p.sentences));
  let ty = 180 + random(0, 700);
  for (const s of say) {
    OTD.times(56); const lines = OTD.wrap(s, 900);
    for (const l of lines) { const w = textWidth(l); fill(255); rect(56, ty - 48, w + 16, 66); fill(0); text(l, 64, ty); ty += 66; }
    ty += 120;
  }
  fill(0); OTD.label("crackunit.com · 9 november 2007", 60, 1350 - 48, 14, "#fff");
  OTD.done();
}
