// 10 · The posts, screen two. Continues where screen one stopped; flows
// around a Post-it Note Waterfall frame, interlaced, with its timecode.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  const fr = OTD.frames.vz7BcEfuTFc || [];
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const o = OTD.POST_SCREENS[1][0], f = fr[6], img = OTD.interlace(OTD.chroma(f.img, 3), 3);
  image(img, o.x, o.y, o.w, o.w * 3 / 4); OTD.osd(`0:00:${String(Math.round(f.t)).padStart(2, "0")}`, o.x + 14, o.y + o.w * 3 / 4 - 14, 18);
  OTD.postsFlow(1);
  OTD.done();
}
