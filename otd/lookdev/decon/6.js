// 6 · The tags. Every tag and category on the day, sized by how often it was
// used, scattered and overlapping, some on their side. Tags are links, so
// they are LINK blue; categories are black. Giphy stickers frozen on the
// words that name a thing. White ground.
const PICS = { orange: "orange", "United Nations World Food Program": "rice", "San Francisco Zoo": "zoo" };
let stk = {};
function preload() { OTD.preload(); }
function setup() {
  createCanvas(1080, 1350);
  for (const [word, q] of Object.entries(PICS)) { const all = OTD.stickers(q).filter((s) => s.frames <= 60); const it = all[(window.SEED - 1) % all.length]; stk[word] = { item: it, img: OTD.loadSticker(it) }; }
}
function draw() {
  if (!Object.values(stk).every((s) => s.img.width)) { setTimeout(() => redraw(), 60); return; }
  OTD.begin(); background(OTD.WHITE);
  const S = OTD.seed();
  const cats = new Set(OTD.posts().flatMap((p) => p.categories || []));
  const all = OTD.tagsAll();
  const placed = [];
  for (const t of all) {
    const px = 36 + (t.n - 1) * 46 + random(-4, 4);
    OTD.arialCaps(px); const w = textWidth(OTD.caps(t.tag)), vert = random() < 0.22;
    const x = vert ? random(80, 1000) : random(-w * 0.3, 1080 - w * 0.7), y = vert ? random(100, 1300) : random(120, 1320);
    fill(cats.has(t.tag) && !OTD.posts().some((p) => (p.tags || []).includes(t.tag)) ? 0 : OTD.LINK);
    push(); translate(x, y); if (vert) rotate(-HALF_PI); text(OTD.caps(t.tag), 0, 0); pop();
    placed.push({ t, x, y, w, px, vert });
  }
  for (const p of placed) {
    const s = stk[p.t.tag]; if (!s) continue;
    const img = OTD.frozen(s.img, floor(random(s.img.numFrames ? s.img.numFrames() : 1)));
    const sw = 220 + random(0, 160), sh = sw * img.height / img.width;
    push(); imageMode(CENTER); image(img, p.vert ? p.x : p.x + p.w / 2, p.vert ? p.y - p.w / 2 : p.y - p.px * 0.35, sw, sh); pop();
  }
  fill(0); OTD.label(`${all.length} tags and categories · ${OTD.posts().length} posts · crackunit.com`, 60, 1350 - 56, 14, "#fff");
  OTD.done();
}
