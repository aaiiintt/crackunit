// 5 · The dead video. How Stuff Dates embedded 1odEmDYg4Y4; the account is
// terminated. yt-dlp's exact words inside the empty player; the post's
// questions about the funny bird sound; a Giphy bird, frozen mid-flap, is the
// only picture. Black ground. Accent: AQUA on the video id.
let bird = null;
function preload() { OTD.preload(); }
function setup() {
  createCanvas(1080, 1350);
  const all = OTD.stickers("bird").filter((s) => s.frames <= 80);
  const pick = all[(window.SEED - 1) % all.length];
  bird = { item: pick, img: OTD.loadSticker(pick) };
}
function draw() {
  if (!bird.img.width) { setTimeout(() => redraw(), 60); return; }
  OTD.begin(); background(OTD.BLACK);
  const S = OTD.seed();
  const post = OTD.posts().find((p) => p.video && p.video.id === "1odEmDYg4Y4");
  const err = (OTD.texts.unavailable || []).join(" ").trim();

  // the player, 16:9, empty
  const px = 60, py = 120 + random(0, 200), pw = 960, ph = 540;
  push(); stroke(255); strokeWeight(1); noFill(); rect(px + 0.5, py + 0.5, pw, ph); pop();
  OTD.vcr(24); fill(255); const lines = OTD.wrap(err, pw - 80); lines.forEach((l, i) => text(l, px + 40, py + 80 + i * 36));
  fill(OTD.AQUA); OTD.vcr(64); text(post.video.id, px + 40, py + ph - 48);

  // the questions, in the post's own words
  const qs = (post.sentences || []).filter((s) => /\?/.test(s)).slice(0, 3);
  OTD.times(64); fill(255); let y = py + ph + 130;
  for (const q of qs) for (const l of OTD.wrap(q, 960)) { text(l, 60, y); y += 70; }

  // the bird, frozen
  const img = OTD.frozen(bird.img, floor(random(img_frames(bird.img))));
  const bw = 300 + random(0, 260), bh = bw * img.height / img.width;
  push(); translate(random(300, 900), py + random(60, ph - 60)); rotate(random(-0.3, 0.3)); imageMode(CENTER); image(img, 0, 0, bw, bh); pop();

  fill(255); OTD.courier(16); text(`${post.permalink} · ${post.date.replace("T", " ")} · giphy ${bird.item.id}`, 60, 1350 - 60);
  OTD.done();
}
function img_frames(g) { return g.numFrames ? g.numFrames() : 1; }
