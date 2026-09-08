// 4 · The stills wall, pulled apart. Every frame from the day's two videos:
// a 1-bit dithered layer of all of them under a colour wall, one frame again
// at five scales from 60 to 1400 px, a flipbook strip of the twelve Post-it
// frames, six crops at 3× with their timecodes, the videos' own words as
// labels, two sentences from the posts. White under it all. Accent: REC.
const IDS = ["vz7BcEfuTFc", "cvs9kURU79s"];
let treated = null, dithered = null;
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  const ready = IDS.every((id) => OTD.frames[id] && OTD.frames[id].every((f) => f.img.width));
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const S = OTD.seed();
  const raw = IDS.flatMap((id) => OTD.frames[id].map((f) => ({ id, ...f })));
  if (!treated) { treated = raw.map((f) => ({ ...f, img: random() < 0.5 ? OTD.interlace(OTD.chroma(f.img, 3), 3) : OTD.interlace(f.img, 4) })); dithered = raw.map((f) => OTD.dither(f.img)); }
  OTD.wall(dithered, 12, 15, { order: "seq" });
  push(); tint(255, 235); OTD.wall(treated.map((f) => f.img), 4, 6, { x: random(-200, 0), y: random(-150, 0), w: 1300, h: 1500, order: S % 2 ? "seq" : "rand" }); noTint(); pop();
  const one = random(treated); OTD.scales(one.img, [60, 140, 320, 700, 1400]);
  const pi = treated.filter((f) => f.id === "vz7BcEfuTFc").map((f) => f.img);
  const sy = random(200, 1000); OTD.strip(pi, 0, sy, 90, 24, "row"); OTD.strip(pi, -45, sy + 68, 90, 24, "row");
  for (let i = 0; i < 6; i++) {
    const f = random(treated); const cw = random(300, 640), ch = cw * 3 / 4;
    const x = random(-100, 1080 - cw * 0.6), y = random(-60, 1350 - ch * 0.6);
    image(f.img, x, y, cw, ch); OTD.scanlines(x, y, cw, ch, 30, 4);
    if (i === 0) { OTD.osd("REC", x + 20, y + 40, 28); fill(OTD.REC); circle(x + 100, y + 31, 18); }
    OTD.osd(`0:00:${String(Math.round(f.t)).padStart(2, "0")}`, x + 20, y + ch - 16, 20);
  }
  for (const w of IDS.flatMap((id) => OTD.snippets(id))) { fill(0); OTD.label(w, random(40, 700), random(120, 1300), 16, "#fff"); }
  const say = OTD.posts().filter((p) => p.video && IDS.includes(p.video.id)).map((p) => random(p.sentences || [""]));
  OTD.times(96); const blocks = say.map((s) => OTD.wrap(s, 940)); const need = blocks.reduce((n, b) => n + b.length * 108 + 120, 0);
  let ty = random(160, Math.max(160, 1250 - need));
  for (const b of blocks) { OTD.times(96); for (const l of b) { fill(255); rect(56, ty - 82, textWidth(l) + 16, 108); fill(0); text(l, 64, ty); ty += 108; } ty += 120; }
  fill(0); OTD.label("crackunit.com · 9 november 2007 · 24 frames", 60, 1350 - 48, 14, "#fff");
  OTD.done();
}
