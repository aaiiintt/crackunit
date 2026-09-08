// 1 · The date, the cover. The nine posts' publish times on a twelve-hour
// dial, the day's number, NOV, the two years, a "november" sticker pulled into
// its frames. Seeds pick a mode, so the range is real: the monolith (the 9
// larger than the card, echoed in DIFFERENCE); the dial (huge, the 9 inside
// it, the times large); the sticker wall (the frames tiled under everything);
// the night (black ground, white type). Accent: REC ticks.
let cands = [];
function preload() { OTD.preload(); }
function setup() {
  createCanvas(1080, 1350);
  cands = OTD.monthSticker();
  for (const c of cands) OTD.loadSticker(c);
}
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin();
  const S = OTD.seed(), mode = (S - 1) % 4, night = mode === 3;
  background(night ? OTD.BLACK : OTD.WHITE);
  const ink = night ? 255 : 0, paper = night ? 0 : 255;
  const order = cands.map((c, i) => cands[(i + S - 1) % cands.length]);
  const stick = order.find((c) => (night ? OTD.luma(OTD.sticker(c)) > 0.25 : OTD.luma(OTD.sticker(c)) < 0.82)) || order[0];
  const frames = OTD.gifFrames(OTD.sticker(stick), 12), n = frames.length;
  const ts = OTD.timestamps().map((t) => ({ ...t, a: -HALF_PI + ((t.h % 12) + t.m / 60 + t.s / 3600) * TWO_PI / 12 })).sort((p, q) => p.a - q.a);

  if (mode === 2) { push(); tint(255, 90); OTD.wall(frames, 4, 8, { order: "seq" }); noTint(); pop(); }

  // the number
  const big = mode === 1 ? 420 : 1500 + (S % 3) * 120;
  const nx = mode === 1 ? 540 - 110 : 140 + random(-220, 60), ny = mode === 1 ? 660 + 150 : 1180 + random(-80, 120);
  fill(ink); OTD.times(big); text(String(OTD.mmdd().dayNum), nx, ny);
  if (mode === 0) { blendMode(DIFFERENCE); fill(255); const D = String(OTD.mmdd().dayNum); OTD.times(900); text(D, nx + random(300, 560), ny - random(300, 700)); OTD.times(300); text(D, random(60, 900), random(300, 1300)); blendMode(BLEND); }

  // the dial
  const cx = mode === 1 ? 540 : 540 + random(-60, 60), cy = mode === 1 ? 660 : 660 + random(-40, 80), R = mode === 1 ? 600 : 420 + random(-30, 30);
  if (mode === 0) blendMode(DIFFERENCE);
  stroke(mode === 0 ? 255 : ink); strokeWeight(mode === 1 ? 3 : 2); noFill(); circle(cx, cy, R * 2);
  for (let h = 0; h < 12; h++) { const a = -HALF_PI + h * TWO_PI / 12; line(cx + cos(a) * (R - 18), cy + sin(a) * (R - 18), cx + cos(a) * R, cy + sin(a) * R); }
  noStroke();
  let prev = -99, step = 0; const lab = mode === 1 ? 30 : 26;
  for (const t of ts) {
    step = t.a - prev < 0.42 ? step + 1 : 0; prev = t.a;
    const ox = cos(t.a), oy = sin(t.a);
    push(); blendMode(BLEND); stroke(OTD.REC); strokeWeight(mode === 1 ? 10 : 6); line(cx + ox * (R - 34), cy + oy * (R - 34), cx + ox * (R + 6), cy + oy * (R + 6)); pop();
    OTD.courier(lab); const tw = textWidth(t.hms);
    const al = ox < -0.2 ? RIGHT : ox > 0.2 ? LEFT : CENTER;
    const inside = mode === 1; // times inside the big dial
    let lx = cx + ox * (inside ? R - 60 : R + 40), ly = cy + oy * (inside ? R - 60 : R + 40) + step * (lab * 2.4) * (oy < 0 ? -1 : 1);
    lx = al === RIGHT ? max(60 + tw, lx) : al === LEFT ? min(1020 - tw, lx) : constrain(lx, 60 + tw / 2, 1020 - tw / 2);
    fill(mode === 0 ? 255 : ink); textAlign(inside ? (al === RIGHT ? LEFT : al === LEFT ? RIGHT : CENTER) : al, CENTER); text(t.hms, lx, ly);
    OTD.courier(lab * 0.6); text(`${t.post.year} · ${t.post.wpId}`, lx, ly + lab);
  }
  textAlign(LEFT, BASELINE);
  fill(mode === 0 ? 255 : ink); OTD.arialCaps(mode === 1 ? 90 : 150); text(OTD.mmdd().abbr, 60, mode === 1 ? 140 : 250);
  const ys = OTD.years(); OTD.times(mode === 1 ? 200 : 210);
  ys.forEach((y, i) => text(String(y), mode === 1 ? 60 + i * 500 : 1080 - 60 - textWidth(String(y)), mode === 1 ? 1350 - 50 : 1350 - 60 - (ys.length - 1 - i) * 200));
  blendMode(BLEND);

  // the sticker's frames
  if (mode !== 2) for (let i = 0; i < n; i++) { const a = -HALF_PI + (i + 0.5) * TWO_PI / n, f = frames[i], w = mode === 1 ? 90 : 150, h = w * f.height / f.width; push(); translate(cx + cos(a) * (R + (mode === 1 ? -170 : 150)), cy + sin(a) * (R + (mode === 1 ? -170 : 150))); rotate(a + HALF_PI); imageMode(CENTER); image(f, 0, 0, w, h); pop(); }
  const bigF = frames[floor(random(n))], bw = (mode === 2 ? 700 : 440) + random(-60, 80), bh = bw * bigF.height / bigF.width;
  push(); translate(random(240, 760), random(360, 980)); rotate(random(-0.5, 0.5)); imageMode(CENTER); image(bigF, 0, 0, bw, bh); pop();

  fill(ink); OTD.label(`on this day · ${OTD.mmdd().dd} · ${OTD.mmdd().mm}`, 60, 76, 14);
  OTD.courier(16); text(`crackunit.com · ${OTD.posts().length} posts · ${OTD.years().join(" · ")} · giphy ${stick.id} × ${n} · mode ${mode}`, 60, 1350 - 60);
  OTD.done();
}
