// 12 · The posts, screen 4 of four. Every post from the day in date order,
// a small caps heading under a hairline, the body in Times 36 on 46, wrapping
// round that post's own material: its surviving image, the same image recovered
// from the Wayback Machine, a frame from its own video, or a sticker whose word
// is in its text. Sides alternate. White. No accent.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const end = OTD.postsFlow(3);
  fill(0); OTD.times(36);
  text(`otd.crackunit.com/${OTD.day.day}/ · link in bio`, 60, Math.max((end || 0) + 60, 1350 - 120));
  OTD.label("Powered by GIPHY", 60, 1350 - 60, 14);
  OTD.done();
}
