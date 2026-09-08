// 5 · The GIF, pulled apart. One sticker from the library, chosen for a word
// in the day (puma, waterfall, synth, rice, geek), exploded into its frames:
// every frame edge to edge, one frame twenty times in a row, one frame at
// 1200 px cropped by the card, a column of the first twelve, the sentence it
// belongs to. White. Accent: REC on one.
const WORDS = ["puma", "waterfall", "synth", "rice bowl", "geek"];
const SAY = { puma: /Zoo/i, waterfall: /Guinness|Mentos/i, synth: /bird sound|machine/i, "rice bowl": /rice|vocabulary/i, geek: /geek/i };
let stk = null;
function preload() { OTD.preload(); }
function setup() {
  createCanvas(1080, 1350);
  const word = WORDS[(window.SEED - 1) % WORDS.length];
  const it = OTD.stickerByMood(word, 120, /pixel|glitch|typo|type/) || OTD.stickerByMood(word, 400) || OTD.stickerByMood("photo", 120);
  stk = it ? { word, it, img: OTD.loadSticker(it) } : null;
}
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.WHITE);
  const frames = OTD.gifFrames(stk.img, 30), n = frames.length;
  const cols = n >= 20 ? 6 : n >= 9 ? 4 : 3, rows = Math.ceil(1350 / (1080 / cols) * (frames[0].height / frames[0].width)) + 1;
  push(); tint(255, 200); OTD.wall(frames, cols, rows, { order: "seq" }); noTint(); pop();
  const k = floor(random(n)); const sy = random(150, 1000);
  OTD.strip([frames[k]], 0, sy, 54, 20, "row"); OTD.strip([frames[(k + 3) % n]], 27, sy + 60, 54, 20, "row");
  const big = frames[(k + 7) % n]; const bw = 1200, bh = bw * big.height / big.width;
  image(big, random(-500, 200), random(-300, 600), bw, bh);
  OTD.strip(frames, 1080 - 60 - 80, 60, 80, Math.min(n, 12), "col", 4);
  const sent = OTD.sentencesAll().find(({ s }) => SAY[stk.word].test(s)) || OTD.sentencesAll()[0];
  OTD.times(56); let ty = random(700, 1150);
  for (const l of OTD.wrap(sent.s, 860)) { fill(255); rect(56, ty - 48, textWidth(l) + 16, 64); fill(0); text(l, 64, ty); ty += 64; }
  fill(OTD.REC); circle(80 + k * 54, sy - 16, 12);
  fill(0); OTD.label(`giphy ${stk.it.id} · ${n} of ${stk.img.numFrames ? stk.img.numFrames() : 1} frames · "${stk.word}" · ${stk.it.title}`, 60, 1350 - 48, 12, "#fff");
  OTD.done();
}
