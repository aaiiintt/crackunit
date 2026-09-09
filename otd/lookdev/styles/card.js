// One card, drawn full-frame in one register, so a new card can be judged on
// its own before it goes into a day. page.html passes ?card=&register=&day=.

const Q = new URLSearchParams(location.search);
const REG = (Q.get("register") || "D").toUpperCase();
const CARD = Q.get("card") || "index";
let asked = false;

function preload() { OTD.preload(); }
function setup() { createCanvas(OTD.W, OTD.H); noLoop(); }

function draw() {
  if (!OTD.day || !OTD.day.posts || !OTD.allLoaded()) { setTimeout(() => redraw(), 90); return; }
  if (!asked) { asked = true; setTimeout(() => redraw(), 60); return; }
  OTD.begin();
  const posts = OTD.posts();
  if (!posts.length) return OTD.skip(`${OTD.day.day} has no posts`);
  const ink = S.inkFrom(inkSources(), [20, 20, 20]);
  STYLES[REG].paint();
  const data = {
    dateWords: `${OTD.mmdd().dayNum} ${OTD.monthName(OTD.mmdd().mm)}`.toUpperCase(),
    rows: posts.map((p) => ({ year: p.year, date: p.date, title: p.title, permalink: p.permalink })),
    years: [...new Set(posts.map((p) => p.year))].sort(),
    url: `otd.crackunit.com/${OTD.day.day}`,
  };
  CARDS[CARD](REG, { x: 74, y: 150, w: OTD.W - 148, h: OTD.H - 260 }, data, ink);
  S.daymark(`on this day · ${OTD.mmdd().dayNum} ${OTD.monthName(OTD.mmdd().mm)}`);
  S.credit([`crackunit.com`, `${posts.length} post${posts.length === 1 ? "" : "s"}`, data.years.join(" ")]);
  OTD.done();
}

function inkSources() {
  const out = [];
  for (const p of OTD.posts()) {
    const im = OTD.images_(p)[0];
    if (im && OTD.images[im.src] && OTD.images[im.src].width > 1) out.push(OTD.images[im.src]);
    else if (im && OTD.rescuedFor(im.src)) out.push(OTD.rescuedFor(im.src));
    if (p.video) for (const f of (OTD.frames[p.video.id] || [])) if (f.img && f.img.width > 1) out.push(f.img);
  }
  for (const w of OTD.wayback()) out.push(w.img);
  return out.slice(0, 8);
}
