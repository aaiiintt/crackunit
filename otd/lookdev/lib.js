// The observer's operations. Loaded by page.html before every sketch.
//
// A sketch calls OTD.preload() inside preload(), OTD.begin() at the top of
// draw() (seeds, fonts), composes by hand, and ends with OTD.done().
// Material ops return new p5.Images and never touch type. Type ops draw crisp
// text from loadFont'ed .ttf files, which is what makes textToPoints possible.
// Nothing here lays anything out; every sketch places every element itself.

const OTD = {
  W: 1080, H: 1350,
  WHITE: "#FFFFFF", PAPER: "#F1EEE8", BLACK: "#000000", SILVER: "#D9DAD6",
  REC: "#FF1E00", HIGHLIGHTER: "#C8FF00", SAFETY: "#FFD400", AQUA: "#7FDBE6", LINK: "#0000EE",
  font: {}, frames: {}, manifests: {}, stickerImgs: {}, day: null, lines: null, giphy: null, images: {}, texts: {},

  // ---------- data ----------
  preload(opts = {}) {
    const day = window.DAY || "11-09";
    this.day = loadJSON(`/otd/data/days/${day}.json`);
    this.lines = loadJSON(`/otd/data/lines.json`);
    this.giphy = loadJSON(`/otd/public/giphy/manifest.json`);
    const F = "/otd/public/fonts/";
    this.font.times = loadFont(encodeURI(F + "Times New Roman.ttf"));
    this.font.timesItalic = loadFont(encodeURI(F + "Times New Roman Italic.ttf"));
    this.font.timesBold = loadFont(encodeURI(F + "Times New Roman Bold.ttf"));
    this.font.arial = loadFont(encodeURI(F + "Arial.ttf"));
    this.font.arialBold = loadFont(encodeURI(F + "Arial Bold.ttf"));
    this.font.courier = loadFont(encodeURI(F + "Courier New.ttf"));
    this.font.vcr = loadFont(F + "VCR_OSD_MONO.ttf");
    this.font.dseg = loadFont(F + "DSEG7Classic-Regular.ttf");
    // captures: every video that day; manifests first, frames from a second pass via loadJSON callback
    for (const [slug, id] of opts.videos || [["post-it-note-waterfall", "vz7BcEfuTFc"], ["zoo-advertising", "cvs9kURU79s"], ["how-stuff-dates", "1odEmDYg4Y4"]]) {
      const base = `/otd/captures/${day}/${slug}/video/${id}/`;
      this.manifests[id] = loadJSON(base + "manifest.json", (m) => {
        this.frames[id] = (m.frames || []).map((f) => ({ ...f, img: loadImage(base + f.file) }));
        if (m.thumb) this.images[`thumb:${id}`] = loadImage(base + m.thumb);
      });
      if (id === "1odEmDYg4Y4") this.texts.unavailable = loadStrings(base + "unavailable.txt");
    }
    this.images.freerice = loadImage("/public/wp-content/uploads/2007/11/freerice.jpg");
    for (const s of opts.stickers || []) this.loadSticker(s);
  },
  begin() {
    randomSeed(window.SEED || 1); noiseSeed(window.SEED || 1);
    pixelDensity(1); noLoop();
    textFont(this.font.times); textAlign(LEFT, BASELINE); noStroke();
  },
  done() { window.__rendered = true; },
  seed() { return window.SEED || 1; },

  posts() { return this.day.posts || []; },
  picks() { return (this.lines || {})[this.day.day] || {}; },
  hero() { const h = this.picks().hero || this.day.hero; return this.posts().find((p) => p.permalink === h) || this.posts()[0]; },
  others() { const h = this.hero(); return this.posts().filter((p) => p !== h); },
  line() { return this.picks().line || ""; },
  runnerUp() { return this.picks().runnerUp || ""; },
  years() { return [...new Set(this.posts().map((p) => p.year))].sort(); },
  timestamps() { return this.posts().map((p) => ({ post: p, hms: p.date.slice(11, 19), h: +p.date.slice(11, 13), m: +p.date.slice(14, 16), s: +p.date.slice(17, 19) })); },
  tagsAll() {
    const c = new Map();
    for (const p of this.posts()) for (const t of [...(p.tags || []), ...(p.categories || [])]) c.set(t, (c.get(t) || 0) + 1);
    return [...c.entries()].map(([tag, n]) => ({ tag, n })).sort((a, b) => b.n - a.n || a.tag.localeCompare(b.tag));
  },
  images_(p) { // every markdown image in the raw body: { alt, src, exists }
    return [...(p.bodyHtml || "").matchAll(/!\[([^\]]*)\]\(([^)\s]+)\)/g)].map((m) => ({ alt: m[1], src: m[2], exists: p.image && p.image.src === m[2] ? p.image.exists : false }));
  },
  alt(p) { const i = this.images_(p)[0]; return i ? i.alt : ""; },
  snippets(id) { // the video's own words, from yt-dlp
    const m = this.manifests[id] || {}, x = m.meta || {};
    const out = [];
    if (x.title) out.push(x.title); if (x.uploader) out.push(x.uploader);
    if (x.view_count != null) out.push(`${x.view_count} views`);
    if (x.upload_date) out.push(x.upload_date);
    if (x.width) out.push(`${x.width}×${x.height} ${x.fps}fps`);
    if (x.duration) out.push(`${x.duration}s`);
    out.push(id);
    if (m.unavailable) out.push(m.unavailable);
    return out;
  },
  stickers(query) { return ((this.giphy || {}).items || []).filter((i) => i.query === query); },
  loadSticker(item) { if (!this.stickerImgs[item.id]) this.stickerImgs[item.id] = loadImage("/otd/public/" + item.file.replace(/^public\//, "")); return this.stickerImgs[item.id]; },
  sticker(item) { return this.stickerImgs[item.id]; },

  // ---------- material (pixels only) ----------
  clone(img) { const o = createImage(img.width, img.height); o.copy(img, 0, 0, img.width, img.height, 0, 0, img.width, img.height); return o; },
  interlace(img, shift = 3) { // odd rows offset horizontally: the comb of a paused DV field
    const o = this.clone(img); o.loadPixels(); img.loadPixels();
    const w = img.width, h = img.height;
    for (let y = 1; y < h; y += 2) for (let x = 0; x < w; x++) {
      const sx = Math.min(w - 1, Math.max(0, x - shift)), si = 4 * (y * w + sx), di = 4 * (y * w + x);
      o.pixels[di] = img.pixels[si] * 0.82; o.pixels[di + 1] = img.pixels[si + 1] * 0.82; o.pixels[di + 2] = img.pixels[si + 2] * 0.82; o.pixels[di + 3] = 255;
    }
    o.updatePixels(); return o;
  },
  chroma(img, dx = 4) { // red right, blue left, luma stays: VHS colour-under bleed
    const o = this.clone(img); o.loadPixels(); img.loadPixels();
    const w = img.width, h = img.height;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = 4 * (y * w + x), r = 4 * (y * w + Math.max(0, x - dx)), b = 4 * (y * w + Math.min(w - 1, x + dx));
      o.pixels[i] = img.pixels[r]; o.pixels[i + 2] = img.pixels[b + 2];
    }
    o.updatePixels(); return o;
  },
  dither(img, dark = [0, 0, 0], light = null) { // ordered 4×4 Bayer to two colours; light = null means transparent
    const B = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
    const o = createImage(img.width, img.height); o.loadPixels(); img.loadPixels();
    const w = img.width, h = img.height;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = 4 * (y * w + x), l = (img.pixels[i] * 0.299 + img.pixels[i + 1] * 0.587 + img.pixels[i + 2] * 0.114) / 255;
      const on = l < (B[y % 4][x % 4] + 0.5) / 16;
      const c = on ? dark : light;
      if (c) { o.pixels[i] = c[0]; o.pixels[i + 1] = c[1]; o.pixels[i + 2] = c[2]; o.pixels[i + 3] = img.pixels[i + 3]; } else o.pixels[i + 3] = 0;
    }
    o.updatePixels(); return o;
  },
  sortRows(img, threshold = 0.5) { // pixel sort: within each row, bright runs sorted by luma
    const o = this.clone(img); o.loadPixels();
    const w = img.width, h = img.height;
    const lum = (i) => o.pixels[i] * 0.299 + o.pixels[i + 1] * 0.587 + o.pixels[i + 2] * 0.114;
    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        while (x < w && lum(4 * (y * w + x)) / 255 < threshold) x++;
        let x0 = x; while (x < w && lum(4 * (y * w + x)) / 255 >= threshold) x++;
        if (x - x0 > 2) {
          const run = []; for (let k = x0; k < x; k++) { const i = 4 * (y * w + k); run.push([o.pixels[i], o.pixels[i + 1], o.pixels[i + 2], lum(i)]); }
          run.sort((a, b) => a[3] - b[3]);
          run.forEach((px, j) => { const i = 4 * (y * w + x0 + j); o.pixels[i] = px[0]; o.pixels[i + 1] = px[1]; o.pixels[i + 2] = px[2]; });
        }
      }
    }
    o.updatePixels(); return o;
  },
  posterize(img, levels = 4) { const o = this.clone(img); o.filter(POSTERIZE, levels); return o; },
  grey(img) { const o = this.clone(img); o.filter(GRAY); return o; },
  frozen(gif, frame) { // hold an animated sticker on one frame
    if (gif && gif.numFrames && gif.numFrames() > 1) { gif.pause(); gif.setFrame(Math.max(0, Math.min(gif.numFrames() - 1, Math.floor(frame)))); }
    return gif;
  },
  scanlines(x, y, w, h, alpha = 40, period = 2) { push(); noStroke(); fill(0, alpha); for (let yy = y; yy < y + h; yy += period) rect(x, yy, w, 1); pop(); },
  pixelated(on = true) { drawingContext.imageSmoothingEnabled = !on; },
  pillarbox(img, x, y, w, h) { // 4:3 material centred in a 16:9 black player
    push(); noStroke(); fill(0); rect(x, y, w, h); const iw = h * img.width / img.height; image(img, x + (w - iw) / 2, y, iw, h); pop();
  },
  echo(img, x, y, w, h, n = 4, dx = 24, dy = 0, fade = 0.55) {
    push(); for (let i = n - 1; i >= 0; i--) { tint(255, 255 * Math.pow(fade, i)); image(img, x + dx * i, y + dy * i, w, h); } noTint(); pop();
  },
  crop(img, sx, sy, sw, sh) { const o = createImage(sw, sh); o.copy(img, sx, sy, sw, sh, 0, 0, sw, sh); return o; },

  // ---------- composition ----------
  wall(images, cols, rows, opts = {}) { // fill the whole card, no gutters, seeded picks; returns the cells for later use
    const { x = 0, y = 0, w = this.W, h = this.H, jitter = 0, order = "seq" } = opts;
    const cw = w / cols, ch = h / rows, cells = [];
    let k = Math.floor(random(images.length));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const img = order === "seq" ? images[(k++) % images.length] : random(images);
      const jx = jitter ? random(-jitter, jitter) : 0, jy = jitter ? random(-jitter, jitter) : 0;
      image(img, x + c * cw + jx, y + r * ch + jy, cw, ch);
      cells.push({ img, x: x + c * cw, y: y + r * ch, w: cw, h: ch, r, c });
    }
    return cells;
  },
  registration(alpha = 30) { // the 12-column grid and hairlines, faint
    push(); stroke(0, alpha); strokeWeight(1); const m = 60, g = 20, cw = (this.W - 2 * m - 11 * g) / 12;
    for (let i = 0; i <= 12; i++) { const x = m + i * (cw + g) - (i ? g : 0); line(x, 0, x, this.H); }
    line(0, m, this.W, m); line(0, this.H - m, this.W, this.H - m); pop();
  },

  // ---------- type (never degraded) ----------
  times(px) { textFont(this.font.times); textSize(px); textStyle(NORMAL); },
  timesItalic(px) { textFont(this.font.timesItalic); textSize(px); },
  arialCaps(px) { textFont(this.font.arialBold); textSize(px); },
  courier(px) { textFont(this.font.courier); textSize(px); },
  vcr(px) { textFont(this.font.vcr); textSize(px); },
  dseg(px) { textFont(this.font.dseg); textSize(px); },
  caps(s) { return String(s).toUpperCase(); },
  fitLine(t, maxW, maxPx, minPx = 40) { // largest size at which t fits on one line
    for (let px = maxPx; px >= minPx; px -= 2) { textSize(px); if (textWidth(t) <= maxW) return px; }
    textSize(minPx); return minPx;
  },
  wrap(t, maxW) { // greedy wrap at the current font and size
    const words = t.split(/\s+/), lines = []; let cur = "";
    for (const w of words) { const n = cur ? cur + " " + w : w; if (textWidth(n) <= maxW || !cur) cur = n; else { lines.push(cur); cur = w; } }
    if (cur) lines.push(cur); return lines;
  },
  points(t, font, px, x, y, sampleFactor = 0.2) { return font.textToPoints(t, x, y, px, { sampleFactor, simplifyThreshold: 0 }); },
  label(t, x, y, px = 14, bg = null, ink = 0) { // Arial Bold caps, optional box
    push(); this.arialCaps(px); const w = textWidth(this.caps(t)) + px, h = px * 1.8;
    if (bg) { noStroke(); fill(bg); rect(x, y - h * 0.72, w, h); }
    fill(ink); text(this.caps(t), x + px / 2, y); pop(); return { w, h };
  },
  osd(t, x, y, px = 22) { // camcorder burn-in: VCR OSD Mono, white with a black edge
    push(); this.vcr(px); fill(0); for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-2, -2], [2, 2], [-2, 2], [2, -2]]) text(t, x + dx, y + dy); fill(255); text(t, x, y); pop();
  },
  brokenImage(alt, x, y, w, h) { // the browser's box for an image that is gone: hairline, the icon, the alt text
    push(); stroke(0); strokeWeight(1); fill(255); rect(x + 0.5, y + 0.5, w - 1, h - 1);
    noStroke(); fill(0); rect(x + 12, y + 12, 16, 16); fill(255); rect(x + 15, y + 15, 10, 10); fill(0); rect(x + 18, y + 18, 4, 4);
    this.times(Math.max(14, Math.min(28, h / 4))); text(alt, x + 36, y + 12 + textSize() * 0.8); pop();
  },
};
window.OTD = OTD;
