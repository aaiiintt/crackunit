// 7 · The dead video. How Stuff Dates embedded 1odEmDYg4Y4; the account is
// terminated. yt-dlp's exact words inside the empty player, and again small,
// three times, in the black; the post's questions about the funny bird sound;
// a Giphy bird pulled into its frames as a strip across the player, one frame
// held large. Black ground. Accent: AQUA on the video id.
let bird = null;
function preload() { OTD.preload(); }
let gone = null;
function setup() {
  createCanvas(1080, 1350);
  gone = OTD.goneVideos()[0] || null;
  if (!gone) return;
  // a photographic creature for the post's own words, else any photographic sticker
  const words = OTD.dayWords(12).map((w) => w.word);
  const photo = ((OTD.giphy.items || [])).filter((s) => s.keep !== false && s.frames <= 80 && /photo/.test(s.mood || ""));
  const named = photo.filter((s) => words.some((w) => [s.query, ...(s.words || [])].includes(w)));
  const pool = named.length ? named : photo;
  const pick = pool[(window.SEED - 1) % pool.length];
  bird = { item: pick, img: OTD.loadSticker(pick) };
}
function draw() {
  if (!gone) return OTD.skip("no video of that day is gone");
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.BLACK);
  const S = OTD.seed();
  const post = gone.post, err = gone.error;
  const frames = OTD.gifFrames(bird.img, 16), n = frames.length;

  const px = 60, py = 120 + random(0, 160), pw = 960, ph = 540;
  push(); stroke(255); strokeWeight(1); noFill(); rect(px + 0.5, py + 0.5, pw, ph); pop();
  OTD.vcr(24); fill(255); OTD.wrap(err, pw - 80).forEach((l, i) => text(l, px + 40, py + 80 + i * 36));
  fill(OTD.AQUA); OTD.vcr(64); text(gone.id, px + 40, py + ph - 48);
  // the bird, as frames, across the player
  OTD.strip(frames, px, py + ph - 200, Math.floor(pw / n), n, "row");
  // the error again, small, in the dark
  OTD.vcr(13); fill(255, 150); for (let i = 0; i < 3; i++) text(err, random(-400, 200), random(py + ph + 40, 1300));
  // the questions
  const qs = (post.sentences || []).filter((s) => /\?/.test(s)).slice(0, 3);
  OTD.times(64); fill(255); let y = py + ph + 130;
  for (const q of qs) for (const l of OTD.wrap(q, 960)) { text(l, 60, y); y += 70; }
  // one frame, held, large
  const big = frames[floor(random(n))]; const bw = 320 + random(0, 260), bh = bw * big.height / big.width;
  push(); translate(random(300, 900), py + random(60, ph - 60)); rotate(random(-0.3, 0.3)); imageMode(CENTER); image(big, 0, 0, bw, bh); pop();
  fill(255); OTD.courier(16); text(`${post.permalink} · ${post.date.replace("T", " ")} · giphy ${bird.item.id} × ${n}`, 60, 1350 - 60);
  OTD.done();
}
