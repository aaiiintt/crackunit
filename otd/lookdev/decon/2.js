// 2 · The line, taken at its word. "Bill has bullets, Steve has space."
// The post's own sentences formatted the two ways the line names: as a
// bulleted list, and as one sentence alone in space. Formatting is the
// material; nothing is drawn but type, rules and bullets. White. Accent: one
// bullet in REC. Seeds pick the mode: two columns; the list huge and
// overflowing; the space version with the list tiny.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  OTD.begin(); background(OTD.WHITE);
  const S = OTD.seed(), mode = (S - 1) % 3;
  const theLine = OTD.line(); const [a, b] = theLine.split(/,\s*/);
  const post = OTD.hero(); const sents = (post.sentences || []).filter((x) => x !== theLine);
  const glyph = ["•", "•", "–", "▪", "◦"][S % 5];
  const listFont = S % 2 ? OTD.font.arial : OTD.font.times;
  const one = sents[(S - 1) % sents.length] || b;

  const list = (x, y, w, px, lh, hot = 0) => { // a bulleted list of the sentences
    push(); textFont(listFont); textSize(px); const ind = px * 1.6;
    sents.forEach((sn, i) => {
      fill(i === hot ? OTD.REC : 0); text(glyph, x, y); fill(0);
      for (const l of OTD.wrap(sn, w - ind)) { text(l, x + ind, y); y += lh; }
      y += lh * 0.4;
    }); pop(); return y;
  };
  if (mode === 0) { // two columns
    fill(0); OTD.times(64); text(a + ",", 60, 150); text(b, 560, 150);
    push(); stroke(0); strokeWeight(1); line(540, 60, 540, 1290); line(60, 190, 1020, 190); pop();
    list(60, 270, 440, 32, 42, floor(random(sents.length)));
    OTD.times(32); fill(0); const ls = OTD.wrap(one, 400); ls.forEach((l, i) => text(l, 560, 700 + i * 42));
  } else if (mode === 1) { // the list, huge, running off the card
    fill(0); OTD.times(150); text(a + ",", 60, 200);
    list(60, 420, 1400, 110, 128, floor(random(sents.length)));
  } else { // space
    fill(0); OTD.times(150); text(b, 60, 1350 - 200);
    OTD.times(32); const ls = OTD.wrap(one, 480); ls.forEach((l, i) => text(l, 300, 420 + i * 42));
    list(60, 120, 320, 12, 16, floor(random(sents.length)));
  }
  fill(0); OTD.courier(16); text(`${post.permalink} · ${post.date.replace("T", " ")} · ${sents.length} sentences`, 60, 1350 - 60);
  OTD.done();
}
