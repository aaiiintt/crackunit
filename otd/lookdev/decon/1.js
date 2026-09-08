// 1 · The date, the cover. The nine posts' publish times on a twelve-hour
// dial; the day's number set far larger than the card and echoed twice more
// in DIFFERENCE, so it inverts where it crosses itself; NOV and the two years
// as objects; a Giphy "november" sticker pulled into its frames and laid round
// the dial, with one frame held large. White. Accent: REC ticks.
let cands = [];
function preload() { OTD.preload(); }
function setup() {
  createCanvas(1080, 1350);
  cands = OTD.stickers("november").filter((s) => /november/i.test(s.title || "") && (s.frames == null || s.frames <= 40));
  for (const c of cands) OTD.loadSticker(c);
}
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const S = OTD.seed();
  // a sticker that will show on white: skip the white ones
  const order = cands.map((c, i) => cands[(i + S - 1) % cands.length]);
  const stick = order.find((c) => OTD.luma(OTD.sticker(c)) < 0.82) || order[0];
  const frames = OTD.gifFrames(OTD.sticker(stick), 12);

  // the number, three times
  const nx = 140 + random(-220, 60), ny = 1180 + random(-80, 120);
  fill(0); OTD.times(1500 + (S % 3) * 120); text("9", nx, ny);
  blendMode(DIFFERENCE); fill(255);
  OTD.times(900); text("9", nx + random(300, 560), ny - random(300, 700));
  OTD.times(300); text("9", random(60, 900), random(300, 1300));

  // the dial
  const cx = 540 + random(-60, 60), cy = 660 + random(-40, 80), R = 420 + random(-30, 30);
  stroke(255); strokeWeight(2); noFill(); circle(cx, cy, R * 2);
  for (let h = 0; h < 12; h++) { const a = -HALF_PI + h * TWO_PI / 12; line(cx + cos(a) * (R - 18), cy + sin(a) * (R - 18), cx + cos(a) * R, cy + sin(a) * R); }
  noStroke();
  const ts = OTD.timestamps().map((t) => ({ ...t, a: -HALF_PI + ((t.h % 12) + t.m / 60 + t.s / 3600) * TWO_PI / 12 })).sort((p, q) => p.a - q.a);
  let prev = -99, step = 0;
  for (const t of ts) {
    step = t.a - prev < 0.42 ? step + 1 : 0; prev = t.a;
    const ox = cos(t.a), oy = sin(t.a);
    push(); blendMode(BLEND); stroke(OTD.REC); strokeWeight(6); line(cx + ox * (R - 34), cy + oy * (R - 34), cx + ox * (R + 6), cy + oy * (R + 6)); pop();
    OTD.courier(26); const tw = textWidth(t.hms);
    const al = ox < -0.2 ? RIGHT : ox > 0.2 ? LEFT : CENTER;
    let lx = cx + ox * (R + 40), ly = cy + oy * (R + 40) + step * 62 * (oy < 0 ? -1 : 1);
    lx = al === RIGHT ? max(60 + tw, lx) : al === LEFT ? min(1020 - tw, lx) : constrain(lx, 60 + tw / 2, 1020 - tw / 2);
    fill(255); textAlign(al, CENTER); text(t.hms, lx, ly);
    OTD.courier(16); text(`${t.post.year} · ${t.post.wpId}`, lx, ly + 26);
  }
  textAlign(LEFT, BASELINE);
  fill(255); OTD.arialCaps(150); text("NOV", 60, 250);
  OTD.times(210); const ys = OTD.years(); ys.forEach((y, i) => text(String(y), 1080 - 60 - textWidth(String(y)), 1350 - 60 - (ys.length - 1 - i) * 200));
  blendMode(BLEND);

  // the sticker's frames, round the dial, and one held large
  const n = frames.length;
  for (let i = 0; i < n; i++) {
    const a = -HALF_PI + (i + 0.5) * TWO_PI / n, f = frames[i], w = 130, h = w * f.height / f.width;
    push(); translate(cx + cos(a) * (R + 150), cy + sin(a) * (R + 150)); rotate(a + HALF_PI); imageMode(CENTER); image(f, 0, 0, w, h); pop();
  }
  const big = frames[floor(random(n))], bw = 440 + random(-60, 80), bh = bw * big.height / big.width;
  push(); translate(random(240, 760), random(360, 980)); rotate(random(-0.5, 0.5)); imageMode(CENTER); image(big, 0, 0, bw, bh); pop();

  fill(0); OTD.label("on this day · 09 · 11", 60, 76, 14);
  OTD.courier(16); text(`crackunit.com · ${OTD.posts().length} posts · ${OTD.years().join(" · ")} · giphy ${stick.id} × ${n}`, 60, 1350 - 60);
  OTD.done();
}
