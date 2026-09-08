// 9 · The posts, screen 1 of four. Every post from the day in date order,
// a small caps heading under a hairline, the body in Times 36 on 46, wrapping
// round that post's own material: its surviving image, the same image recovered
// from the Wayback Machine, a frame from its own video, or a sticker whose word
// is in its text. Sides alternate. White. No accent.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const end = OTD.postsFlow(0);
  OTD.done();
}
