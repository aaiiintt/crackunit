// 9 · The posts, screen one of four. Every post from the day in date order,
// title and year as a small caps heading under a hairline, the body in Times
// 36 on 46, flowed around one piece of material per screen. Simple, legible on
// a phone. White. No accent. Screen one flows around the surviving image.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const o = OTD.POST_SCREENS[0][0], fr = OTD.images.freerice, ih = o.w * fr.height / fr.width;
  OTD.pixelated(true); image(fr, o.x, o.y, o.w, ih); OTD.pixelated(false);
  fill(0); OTD.label("freerice.jpg · 2007", o.x, o.y + ih + 26, 12);
  OTD.postsFlow(0);
  OTD.done();
}
