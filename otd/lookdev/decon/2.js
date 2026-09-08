// 2 · The line. "Bill has bullets, Steve has space." set whole and crisp; then
// taken at its word: the first half rebuilt from bullets (textToPoints, each
// point a • glyph), the second half left as the space it would have taken.
// White ground. Accent: the bullets are REC.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  OTD.begin(); background(OTD.WHITE);
  const S = OTD.seed();
  const line = OTD.line();
  const [a, b] = line.split(/,\s*/); // "Bill has bullets" / "Steve has space."
  const flip = S % 2 === 0;           // seeds swap the crisp and the taken-apart

  // the whole line, crisp
  OTD.times(150); fill(0);
  const yTop = flip ? 1010 : 250;
  text(a + ",", 60, yTop); text(b, 60, yTop + 150);

  // the first half as bullets
  const yA = flip ? 300 : 620;
  const sf = [0.12, 0.2, 0.3][S % 3];
  const pts = OTD.points(a, OTD.font.times, 150, 60, yA, sf);
  fill(OTD.REC); OTD.times(sf < 0.2 ? 30 : sf < 0.3 ? 22 : 16);
  textAlign(CENTER, CENTER); for (const p of pts) text("•", p.x, p.y); textAlign(LEFT, BASELINE);

  // the second half as the space it takes
  OTD.times(150); const bw = textWidth(b), bb = OTD.font.times.textBounds(b, 60, yA + 190, 150);
  push(); stroke(0); strokeWeight(1); noFill(); rect(bb.x + 0.5, bb.y + 0.5, bb.w, bb.h); pop();
  fill(0); OTD.label(`${Math.round(bb.w)} × ${Math.round(bb.h)} px of space`, bb.x, bb.y + bb.h + 30, 14);
  OTD.label(`${pts.length} bullets`, 60, yA + 40, 14);

  fill(0); OTD.courier(16); text(`${OTD.hero().permalink} · ${OTD.hero().date.replace("T", " ")}`, 60, 1350 - 60);
  OTD.done();
}
