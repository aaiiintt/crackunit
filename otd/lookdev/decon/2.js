// 2 · The line. "Bill has bullets, Steve has space." set whole and crisp, then
// taken at its word three times over: the first half rebuilt from bullets at
// 150, 64 and 24 px, the second half left as the space it would take, each
// time. White. Accent: the largest set of bullets is REC; the rest are black.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  OTD.begin(); background(OTD.WHITE);
  const S = OTD.seed();
  const line = OTD.line(); const [a, b] = line.split(/,\s*/);
  const flip = S % 2 === 0;
  OTD.times(150); fill(0);
  const yTop = flip ? 1010 : 220; text(a + ",", 60, yTop); text(b, 60, yTop + 150);

  let y = flip ? 240 : 560;
  const rows = [[150, 0.14, 28, OTD.REC], [64, 0.25, 12, 0], [24, 0.45, 6, 0]];
  let counts = [];
  for (const [px, sf, dot, ink] of rows) {
    const pts = OTD.points(a, OTD.font.times, px, 60, y, sf);
    fill(ink); OTD.times(dot); textAlign(CENTER, CENTER); for (const p of pts) text("•", p.x, p.y); textAlign(LEFT, BASELINE);
    counts.push(pts.length);
    OTD.times(px); const bb = OTD.font.times.textBounds(b, 60, y, px), aw = textWidth(a + ", ");
    const bx = px === 150 ? 60 : 60 + aw, by = px === 150 ? y + px * 1.25 : y;
    const box = OTD.font.times.textBounds(b, bx, by, px);
    push(); stroke(0); strokeWeight(1); noFill(); rect(box.x + 0.5, box.y + 0.5, box.w, box.h); pop();
    fill(0); OTD.label(`${pts.length} bullets · ${Math.round(box.w)} × ${Math.round(box.h)} px of space`, px === 150 ? 60 : bx + box.w + 16, px === 150 ? box.y + box.h + 28 : by, 11);
    y += px === 150 ? px * 2.4 : px * 2.2;
  }
  fill(0); OTD.courier(16); text(`${OTD.hero().permalink} · ${OTD.hero().date.replace("T", " ")} · ${counts.join(" + ")} bullets`, 60, 1350 - 60);
  OTD.done();
}
