// 3 · The source. The hero post's file, verbatim, in Courier on paper; the two
// links inside it pulled out and set so large they leave the card; the image
// that is gone drawn as the browser draws it, with its alt text. Accent:
// HIGHLIGHTER on the line.
let src = null;
function preload() { OTD.preload(); src = loadStrings("/export/posts/2005-11-09-presentation-zen.md"); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  OTD.begin(); background(OTD.PAPER);
  const S = OTD.seed();
  const line = OTD.line();
  const links = [...src.join("\n").matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1].replace(/^https?:\/\//, "").replace(/\/$/, ""));
  const imgs = [...src.join("\n").matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }));

  // the links, huge, cropped by the card
  fill(0); OTD.times(150 + (S % 3) * 30);
  const u = [...new Set(links)];
  u.forEach((l, i) => { push(); translate(random(-400, 200), 330 + i * random(300, 420)); rotate(random(-0.08, 0.08)); text(l, 0, 0); pop(); });

  // the file, wrapped, with the line highlighted
  OTD.courier(22); const lh = 30, maxW = 700; let y = 110; const x = 60;
  for (const raw of src) {
    const parts = raw.length ? OTD.wrap(raw, maxW) : [""];
    for (const seg of parts) {
      const k = seg.indexOf(line);
      if (k >= 0) { const w0 = textWidth(seg.slice(0, k)), w1 = textWidth(line); fill(OTD.HIGHLIGHTER); rect(x + w0 - 4, y - 22, w1 + 8, 30); }
      fill(0); text(seg, x, y); y += lh;
    }
  }

  // the missing image, as the browser shows it
  for (const im of imgs) { const w = 360 + random(0, 240), h = w * 0.7; OTD.brokenImage(im.alt, random(420, 1080 - w + 80), random(700, 1350 - h - 40), w, h); }

  fill(0); OTD.label(`source · export/posts/2005-11-09-presentation-zen.md · ${src.length} lines`, 60, 1350 - 56, 14);
  OTD.done();
}
