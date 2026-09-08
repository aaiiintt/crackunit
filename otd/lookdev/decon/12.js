// 12 · The posts, screen four, the last. A recovered image placed by the
// layout; whatever did not fit is cut here; the link in bio and the Giphy
// credit close the carousel.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const gone = OTD.posts().flatMap((p) => OTD.images_(p).filter((i) => !i.exists && !/hulger/.test(i.src)));
  const g = gone[(OTD.seed() - 1) % gone.length];
  const { end, rect } = OTD.postsFlow(3);
  if (rect) {
    const r = OTD.rescuedFor(g.src);
    if (r) { const h = Math.min(rect.h, rect.w * r.height / r.width), w = h * r.width / r.height; OTD.pixelated(true); image(r, rect.x + rect.w - w, rect.y, w, h); OTD.pixelated(false); fill(0); OTD.label(`${g.alt} · recovered, web.archive.org`, rect.x, rect.y + h + 22, 11); }
    else OTD.brokenImage(g.alt, rect.x, rect.y, rect.w, rect.h);
  }
  fill(0); OTD.times(36);
  text(`otd.crackunit.com/${OTD.day.day}/ · link in bio`, 60, Math.max((end || 0) + 60, 1350 - 120));
  OTD.label("Powered by GIPHY", 60, 1350 - 60, 14);
  OTD.done();
}
