// 6 · Wayback. crackunit.com as web.archive.org holds it nearest the day,
// zoomed in: one masthead at 4× cropped by the card, one page at 2× cropped,
// the three lost images recovered from the same snapshots, the timestamps in
// Courier. Paper. Accent: LINK on the timestamps. Seeds pick which page leads.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.PAPER);
  const S = OTD.seed(), wb = OTD.wayback();
  const pick = (re) => wb.find((i) => re.test(i.slug));
  const lead = [pick(/home-2005/), pick(/presentation-zen/), pick(/home-2007/), pick(/technorati/)].filter(Boolean);
  const A = lead[(S - 1) % lead.length], B = lead[S % lead.length];
  // the lead page's top, at 4×
  const top = OTD.crop(A.img, 0, 0, A.img.width, 260);
  OTD.pixelated(true); image(top, random(-1800, -100), random(-200, 300), A.img.width * 4, 260 * 4); OTD.pixelated(false);
  // the second page, at 2×, cropped, lower
  const mid = OTD.crop(B.img, 0, 0, B.img.width, 600);
  image(mid, random(-800, 100), random(500, 800), B.img.width * 2, 600 * 2);
  // the recovered images, large, along the top of the timestamp block
  const items = OTD.waybackAll();
  OTD.courier(16); const listW = Math.max(...items.map((it) => textWidth(`${it.slug}  web.archive.org/web/00000000000000`))) + 24;
  const listH = items.length * 22 + 20, listY = 1350 - 56 - listH;
  let rx = 60, ry = listY - 300;
  for (const [name, img] of Object.entries(OTD.rescued)) if (img && img.width) { const w = 190 + random(0, 90), h = w * img.height / img.width; OTD.pixelated(true); image(img, rx, ry + (240 - h), w, h); OTD.pixelated(false); fill(0); OTD.courier(11); text(`${name} · recovered`, rx, ry + 258); rx += w + 26; }
  // the timestamps, on their own ground so they read over whatever is under them
  noStroke(); fill(OTD.PAPER); rect(48, listY - 8, listW, listH + 8);
  fill(OTD.LINK); OTD.courier(16); let y = listY + 14;
  for (const it of items) { text(`${it.slug}  ${it.ts ? `web.archive.org/web/${it.ts}` : it.none ? "no snapshot within a year" : "cdx undecided"}`, 60, y); y += 22; }
  fill(0); OTD.label(`crackunit.com · as the wayback machine holds it · ${A.ts}`, 60, 80, 12, "#fff");
  OTD.done();
}
