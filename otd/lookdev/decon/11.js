// 11 · The posts, screen three. Flows around the Hulger phone: the image the
// post had in 2005, which the archive lost and the Wayback Machine still held.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  const r = OTD.rescued["hulger.jpg"];
  if (r && !r.width) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const o = OTD.POST_SCREENS[2][0];
  if (r) { const w = o.w, h = w * r.height / r.width; OTD.pixelated(true); image(r, o.x, o.y + (o.h - h) / 2, w, h); OTD.pixelated(false); fill(0); OTD.label("hulger phone · hulger.jpg · recovered, web.archive.org", o.x, o.y + o.h + 24, 12); }
  else OTD.brokenImage("hulger phone", o.x, o.y, o.w, o.h);
  OTD.postsFlow(2);
  OTD.done();
}
