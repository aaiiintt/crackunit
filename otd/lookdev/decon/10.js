// 10 · The posts, screen two. A Post-it Note Waterfall frame, interlaced,
// with its timecode, placed by the layout on the left.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const { rect } = OTD.postsFlow(1);
  if (rect) { const f = OTD.frames.vz7BcEfuTFc[6], img = OTD.interlace(OTD.chroma(f.img, 3), 3), h = rect.w * 3 / 4; image(img, rect.x, rect.y, rect.w, h); OTD.osd(`0:00:${String(Math.round(f.t)).padStart(2, "0")}`, rect.x + 14, rect.y + h - 14, 18); }
  OTD.done();
}
