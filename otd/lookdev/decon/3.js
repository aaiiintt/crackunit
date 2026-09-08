// 3 · Text-ments. Every sentence from every post pulled out and repeated,
// Times from 22 to 220 px, overlapping, some inverting what they cross; the
// day's tags in among them small; one true number set like a counter, with
// what it is. White. Accent: SAFETY behind the number.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  OTD.begin(); background(OTD.WHITE);
  const S = OTD.seed();
  const all = OTD.sentencesAll();
  const numbers = OTD.numbers();
  const [num, what] = numbers[(S - 1) % numbers.length];
  const nx = random(-80, 300), ny = random(500, 1100);
  const sizes = [22, 22, 28, 36, 48, 64, 96, 140, 220];
  for (let i = 0; i < 28; i++) {
    const { s } = random(all); const px = random(sizes);
    OTD.times(px); const w = textWidth(s);
    const x = random(-w * 0.5, 1080 - w * 0.4), y = random(60, 1340);
    if (random() < 0.3) { blendMode(DIFFERENCE); fill(255); } else { blendMode(BLEND); fill(0); }
    text(s, x, y);
  }
  blendMode(BLEND);
  // the counter, on top of everything
  fill(OTD.SAFETY); noStroke(); OTD.times(440); rect(nx - 10, ny - 330, textWidth(String(num)) + 20, 360);
  fill(0); OTD.stamp(num, what, nx, ny, 440);
  OTD.arialCaps(14); fill(OTD.LINK);
  for (const t of OTD.tagsAll()) text(OTD.caps(t.tag), random(60, 900), random(80, 1320));
  fill(0); OTD.label(`${all.length} sentences · ${OTD.posts().length} posts · crackunit.com · ${OTD.dateWords()}`, 60, 1350 - 56, 12, "#fff");
  OTD.done();
}
