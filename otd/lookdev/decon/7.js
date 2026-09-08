// 7 · The images. What is left of the day's four images: one survives
// (freerice.jpg, 425 px wide in 2007, shown at 2.5× with its pixels), three
// are gone and are drawn the way a browser draws a missing image, with their
// alt text, one of them the size the picture wished it was. Silver ground.
function preload() { OTD.preload(); }
function setup() { createCanvas(1080, 1350); }
function draw() {
  if (!OTD.images.freerice.width) { setTimeout(() => redraw(), 60); return; }
  OTD.begin(); background(OTD.SILVER);
  const S = OTD.seed();
  const gone = OTD.posts().flatMap((p) => OTD.images_(p).filter((i) => !i.exists).map((i) => ({ ...i, post: p })));
  const fr = OTD.images.freerice;

  // the survivor, at 2.5×, pixels showing, echoed
  const w = fr.width * 2.5, h = fr.height * 2.5;
  const x = random(-300, 60), y = random(60, 500);
  OTD.pixelated(true); OTD.echo(fr, x, y, w, h, 3, 40 + S * 10, 24, 0.5); OTD.pixelated(false);

  // the gone, as boxes with alt text
  const big = floor(random(gone.length));
  gone.forEach((g, i) => {
    const bw = i === big ? 820 + random(0, 200) : 220 + random(0, 120), bh = bw * (i === big ? 0.72 : random(0.6, 1));
    OTD.brokenImage(g.alt, random(0, 1080 - bw * 0.6), random(500, 1350 - bh * 0.5), bw, bh);
  });

  fill(0); OTD.label(`4 images · 1 remains · ${gone.map((g) => g.src.split("/").pop()).join(" · ")}`, 60, 1350 - 56, 14);
  OTD.done();
}
