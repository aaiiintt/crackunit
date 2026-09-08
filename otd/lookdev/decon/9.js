// 9 · The posts, screen one of four. Every post from the day in date order,
// a small caps heading under a hairline, the body in Times 36 on 46, wrapped
// round one piece of material the layout places at the start of a post. White.
// Screen one carries the surviving image.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const { rect } = OTD.postsFlow(0);
  if (rect) { const fr = OTD.images.freerice, h = Math.min(rect.h, rect.w * fr.height / fr.width), w = h * fr.width / fr.height; OTD.pixelated(true); image(fr, rect.x + rect.w - w, rect.y, w, h); OTD.pixelated(false); fill(0); OTD.label("freerice.jpg · 2007", rect.x + rect.w - w, rect.y + h + 24, 12); }
  OTD.done();
}
