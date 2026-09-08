// 8 · The source, with a GIF. The hero post's file, verbatim, in Courier on
// paper, the line highlighted wherever it appears, even across a wrap; the two
// links inside it pulled out and set so large they leave the card; the image
// the post had, recovered from the Wayback Machine, next to the broken box the
// browser shows today; a PowerPoint sticker's frames down the right margin at
// four sizes. Accent: HIGHLIGHTER.
let src = null, stk = null;
function preload() { OTD.preload(); src = loadStrings("/export/posts/2005-11-09-presentation-zen.md"); }
function setup() { createCanvas(1080, 1350); const it = OTD.stickerByMood("powerpoint", 40); stk = it ? { it, img: OTD.loadSticker(it) } : null; }
function draw() {
  if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  OTD.begin(); background(OTD.PAPER);
  const S = OTD.seed(), line = OTD.line();
  const links = [...new Set([...src.join("\n").matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1].replace(/^https?:\/\//, "").replace(/\/$/, "")))];
  const imgs = [...src.join("\n").matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }));

  fill(0); OTD.times(150 + (S % 3) * 30);
  links.forEach((l, i) => { push(); translate(random(-400, 200), 330 + i * random(300, 420)); rotate(random(-0.08, 0.08)); text(l, 0, 0); pop(); });

  // the file, wrapped; the line highlighted by its words so a wrap does not lose it
  OTD.courier(22); const lh = 30, maxW = 700, x = 60; let y = 110;
  const lw = line.split(" ");
  for (const raw of src) {
    for (const seg of raw.length ? OTD.wrap(raw, maxW) : [""]) {
      const words = seg.split(" ");
      // longest run of whole words that is a substring of the line, at least two words
      let best = null;
      for (let i = 0; i < words.length; i++) for (let j = words.length; j > i + 1; j--) { const run = words.slice(i, j).join(" "); if (line.includes(run)) { if (!best || run.length > best.run.length) best = { i, j, run }; break; } }
      if (best) { const pre = words.slice(0, best.i).join(" ") + (best.i ? " " : ""); fill(OTD.HIGHLIGHTER); rect(x + textWidth(pre) - 4, y - 22, textWidth(best.run) + 8, 30); }
      fill(0); text(seg, x, y); y += lh;
    }
  }

  // the image: recovered, and as the browser shows it now
  for (const im of imgs) {
    const w = 360 + random(0, 200), h = w * 0.72, bx = random(420, 1080 - w + 80), by = random(700, 1350 - h - 40);
    OTD.brokenImage(im.alt, bx, by, w, h);
    const r = OTD.rescuedFor(im.src);
    if (r) { OTD.pixelated(true); image(r, bx + w - 240, by + 40, 220, 220 * r.height / r.width); OTD.pixelated(false); fill(0); OTD.label(`${im.src.split("/").pop()} · recovered, web.archive.org 2006`, bx + 12, by + h - 16, 10); }
  }
  // the sticker's frames down the right margin
  if (stk) { const fr = OTD.gifFrames(stk.img, 8); let yy = 60; for (const w of [40, 80, 160, 320]) { OTD.strip(fr, 1080 - 40 - w, yy, w, Math.min(fr.length, 4), "col", 6); yy += 4 * (w * fr[0].height / fr[0].width + 6) + 20; } }

  fill(0); OTD.label(`source · export/posts/2005-11-09-presentation-zen.md · ${src.length} lines${stk ? ` · giphy ${stk.it.id}` : ""}`, 60, 1350 - 56, 12);
  OTD.done();
}
