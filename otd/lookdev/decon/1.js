// 1 · The date. The nine posts' publish times laid on a twelve-hour dial; the
// day's number set far larger than the card; NOV and the two years as objects;
// a Giphy "november" sticker frozen on one frame, the one wrong thing.
// White ground. Accent: REC ticks. The 9 and the dial meet in DIFFERENCE blend,
// so the type stays crisp and inverts where they overlap.
function preload() { OTD.preload({ stickers: OTD_stickerPicks() }); }
function OTD_stickerPicks() { return []; } // filled after the manifest loads (see setup)
let stick = null;
function setup() {
  createCanvas(1080, 1350);
  const all = OTD.stickers("november").filter((s) => /november/i.test(s.title || ""));
  const pick = all[(window.SEED - 1) % all.length];
  stick = { item: pick, img: OTD.loadSticker(pick) };
}
function draw() {
  if (!stick.img.width) { setTimeout(() => redraw(), 60); return; }
  OTD.begin();
  background(OTD.WHITE);
  const S = OTD.seed();

  // the number, larger than the card
  const nineSize = 1500 + (S % 3) * 120;
  const nx = 140 + random(-220, 60), ny = 1180 + random(-80, 120);
  fill(0); OTD.times(nineSize); text("9", nx, ny);

  // the dial: twelve hours, hairline; the nine posts at their real times
  blendMode(DIFFERENCE);
  const cx = 540 + random(-60, 60), cy = 660 + random(-40, 80), R = 420 + random(-30, 30);
  stroke(255); strokeWeight(2); noFill(); circle(cx, cy, R * 2);
  for (let h = 0; h < 12; h++) { const a = -HALF_PI + h * TWO_PI / 12; line(cx + cos(a) * (R - 18), cy + sin(a) * (R - 18), cx + cos(a) * R, cy + sin(a) * R); }
  noStroke();
  // posts minutes apart would collide, so neighbours step outward; labels stay inside the card
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

  // the sticker, frozen
  const img = OTD.frozen(stick.img, floor(random(stick.img.numFrames ? stick.img.numFrames() : 1)));
  const sw = 420 + random(-60, 80), sh = sw * img.height / img.width;
  push(); translate(random(200, 760), random(320, 1000)); rotate(random(-0.5, 0.5)); imageMode(CENTER); image(img, 0, 0, sw, sh); pop();

  // the small true things
  fill(0); OTD.label("on this day · 09 · 11", 60, 76, 14);
  fill(0); OTD.courier(16); text(`crackunit.com · ${OTD.posts().length} posts · ${OTD.years().join(" · ")}`, 60, 1350 - 60);
  OTD.done();
}
