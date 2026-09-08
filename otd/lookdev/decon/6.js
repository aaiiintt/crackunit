// 6 · Wayback. crackunit.com as web.archive.org holds it nearest the day: the
// homepage of 24 November 2005 and of August 2007, and the Presentation Zen
// page of April 2006, cropped and repeated at several scales, the 2005
// masthead at 3× so its pixels show; the Wayback timestamps in Courier; the
// three lost images, recovered. Paper. Accent: LINK.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.PAPER);
  const wb = OTD.wayback();
  const pick = (re) => wb.find((i) => re.test(i.slug));
  const home05 = pick(/home-2005/), zen = pick(/presentation-zen/);
  for (const it of wb) for (const w of [180, 360, 720]) { const h = Math.min(it.img.height * w / it.img.width, 1200); const crop = OTD.crop(it.img, 0, 0, it.img.width, Math.min(it.img.height, h * it.img.width / w)); image(crop, random(-100, 1080 - w * 0.6), random(-50, 1350 - h * 0.5), w, h); }
  if (home05) { const top = OTD.crop(home05.img, 0, 0, 1024, 140); OTD.pixelated(true); image(top, random(-900, -200), random(60, 400), 1024 * 3, 140 * 3); OTD.pixelated(false); }
  if (zen) { const w = 560, h = Math.min(zen.img.height * w / zen.img.width, 740); const crop = OTD.crop(zen.img, 0, 0, zen.img.width, h * zen.img.width / w); const zx = random(60, 460), zy = random(300, 560); image(crop, zx, zy, w, h); push(); noFill(); stroke(OTD.LINK); strokeWeight(4); rect(zx, zy, w, h); pop(); }
  let rx = 60; for (const [name, img] of Object.entries(OTD.rescued)) if (img && img.width) { OTD.pixelated(true); image(img, rx, 1060, 240, 240 * img.height / img.width); OTD.pixelated(false); fill(0); OTD.courier(12); text(`${name} · recovered`, rx, 1060 + 240 * img.height / img.width + 18); rx += 270; }
  fill(OTD.LINK); OTD.courier(14); let y = 1350 - 56 - 12 * 20;
  for (const it of OTD.waybackAll()) { text(`${it.slug}  ${it.ts ? `web.archive.org/web/${it.ts}` : it.none ? "no snapshot within a year" : "cdx undecided"}`, 60, y); y += 20; }
  fill(0); OTD.label("crackunit.com · as the wayback machine holds it", 60, 1350 - 40, 12, "#fff");
  OTD.done();
}
