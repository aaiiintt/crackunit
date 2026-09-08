// 11 · The posts, screen three. The Hulger phone, the image the post had in
// 2005, recovered from the Wayback Machine, placed by the layout.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const { rect } = OTD.postsFlow(2);
  const r = OTD.rescued["hulger.jpg"];
  if (rect) {
    if (r) { const w = rect.w, h = w * r.height / r.width; OTD.pixelated(true); image(r, rect.x, rect.y + (rect.h - h) / 2, w, h); OTD.pixelated(false); fill(0); OTD.label("hulger phone · hulger.jpg · recovered, web.archive.org", rect.x, rect.y + rect.h + 22, 11); }
    else OTD.brokenImage("hulger phone", rect.x, rect.y, rect.w, rect.h);
  }
  OTD.done();
}
