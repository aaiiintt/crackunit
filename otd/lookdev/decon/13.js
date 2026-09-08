// 13 · Come back tomorrow. The last slide: what the archive holds for the next
// date, in the day's own facts (how many posts, which years, their titles), set
// as wild as the type gets in this system — TOMORROW far larger than the card,
// cropped by three edges, the date inverted through it — with the GIF library
// embedded at every size around it. White. Accent: SAFETY behind the count.
function preload() { OTD.preload(); }
function setup() {
  createCanvas(1080, 1350);
  // as many stickers as the library will give, so the card can be papered in them
  for (const it of (OTD.giphy.items || []).filter((i) => i.keep !== false && (i.frames == null || i.frames <= 120)).slice(0, 24)) OTD.loadSticker(it);
}
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const S = OTD.seed(), t = OTD.tomorrow();
  const pool = (OTD.giphy.items || []).filter((i) => i.keep !== false && OTD.sticker(i) && OTD.sticker(i).width > 1);
  const frames = pool.flatMap((i) => OTD.gifFrames(OTD.sticker(i), 4));

  // the library, papered on: a loose wall, then singles at every size
  push(); tint(255, 120); OTD.wall(frames, 6, 8, { jitter: 30, order: "rand" }); noTint(); pop();
  for (let i = 0; i < 18; i++) { const f = random(frames), w = random([70, 110, 180, 260, 400, 620]); push(); translate(random(-100, 1080), random(-60, 1350)); rotate(random(-0.6, 0.6)); imageMode(CENTER); image(f, 0, 0, w, w * f.height / f.width); pop(); }

  // TOMORROW: whole on the card, or larger than it and cropped. The seed decides,
  // but never so large that the word stops being the word.
  const px = [150, 260, 360][S % 3];
  fill(0); OTD.arialCaps(px);
  const tw = textWidth("TOMORROW"), tx = tw <= 960 ? 60 : random(-(tw - 1080) - 40, 0);
  push(); translate(tx, 620 + random(-40, 40)); rotate(random(-0.03, 0.03)); text("TOMORROW", 0, 0); pop();
  // the date, inverted where it crosses
  blendMode(DIFFERENCE); fill(255);
  const [mm, dd] = t.day.split("-"), dateStr = `${Number(dd)} ${OTD.monthName(mm)}`;
  OTD.times(OTD.fitLine(dateStr, 960, 200, 90)); text(dateStr, 60, 880);
  blendMode(BLEND);

  // what is actually there, from tomorrow's own day file
  const n = t.posts.length;
  if (n) {
    fill(OTD.SAFETY); noStroke(); OTD.times(300); const nw = textWidth(String(n));
    rect(56, 1010, nw + 28, 230); fill(0); text(String(n), 70, 1220);
    const lx = 70 + nw + 44;
    OTD.arialCaps(20); const lab = OTD.caps(`posts · ${t.years.join(" · ")}`);
    fill(255); rect(lx - 8, 1096, textWidth(lab) + 16, 32); fill(0); text(lab, lx, 1120);
    OTD.times(34); let y = 1166;
    for (const p of t.posts.slice(0, 3)) { const w = textWidth(p.title); fill(255); rect(lx - 8, y - 28, w + 16, 40); fill(0); text(p.title, lx, y); y += 44; }
  } else { fill(0); OTD.times(64); text("nothing. the day after, then.", 60, 1150); }

  fill(0); OTD.label("come back tomorrow · otd.crackunit.com · powered by giphy", 60, 1350 - 56, 14, "#fff");
  OTD.done();
}
