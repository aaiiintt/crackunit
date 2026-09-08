// 12 · The posts, screen four, the last. Flows around one of the images the
// archive lost, recovered from the Wayback Machine, or its broken box if the
// recovery failed; whatever did not fit is cut here; the link in bio and the
// Giphy credit close the carousel.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const gone = OTD.posts().flatMap((p) => OTD.images_(p).filter((i) => !i.exists));
  const pick = gone.filter((i) => !/hulger/.test(i.src)); const g = pick[(OTD.seed() - 1) % pick.length], o = OTD.POST_SCREENS[3][0];
  const r = OTD.rescuedFor(g.src);
  if (r) { const h = Math.min(o.h, o.w * r.height / r.width), w = h * r.width / r.height; OTD.pixelated(true); image(r, o.x + o.w - w, o.y, w, h); OTD.pixelated(false); fill(0); OTD.label(`${g.alt} · recovered, web.archive.org`, o.x, o.y + h + 24, 12); }
  else OTD.brokenImage(g.alt, o.x, o.y, o.w, o.h);
  const end = OTD.postsFlow(3);
  fill(0); OTD.times(36);
  text(`otd.crackunit.com/${OTD.day.day}/ · link in bio`, 60, Math.max((end || 0) + 40, 1350 - 120));
  OTD.label("Powered by GIPHY", 60, 1350 - 60, 14);
  OTD.done();
}
