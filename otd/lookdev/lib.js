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

  // ---------- loading ----------
  // p5's loadImage hands back a 1×1 placeholder until the file arrives, so `.width` is
  // no test of readiness. Every image goes through img(), which counts, and a sketch
  // begins draw() with: if (!OTD.allLoaded()) { setTimeout(() => redraw(), 80); return; }
  _pending: 0, _failed: [],
  img(url, ok, fail) { this._pending++; return loadImage(url, (i) => { this._pending--; ok && ok(i); }, (e) => { this._pending--; this._failed.push(url); fail && fail(e); }); },
  allLoaded() { return this._pending === 0; },

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
        this.frames[id] = (m.frames || []).map((f) => ({ ...f, img: this.img(base + f.file) }));
        if (m.thumb) this.images[`thumb:${id}`] = this.img(base + m.thumb);
      });
      if (id === "1odEmDYg4Y4") this.texts.unavailable = loadStrings(base + "unavailable.txt");
    }
    this.images.freerice = this.img("/public/wp-content/uploads/2007/11/freerice.jpg");
    // wayback captures, when wayback-page.mjs has run
    this.wb = { items: [] };
    loadJSON(`/otd/captures/${day}/wayback/wayback.json`, (j) => { this.wb = j; for (const it of j.items || []) if (it.file) it.img = this.img(`/otd/captures/${day}/wayback/${it.file}`); }, () => {});
    // images the archive lost that the Wayback Machine still had (wayback-page.mjs, by hand for now)
    this.rescued = {};
    for (const name of ["Picture1.jpg", "talkingPointMini_01.jpg", "hulger.jpg"]) this.rescued[name] = this.img(`/otd/captures/${day}/wayback/rescued-${name}`, null, () => { delete this.rescued[name]; });
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
  rescuedFor(src) { const img = this.rescued[String(src).split("/").pop()]; return img && img.width ? img : null; },
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
  stickers(query) { return ((this.giphy || {}).items || []).filter((i) => i.query === query && i.keep !== false); },
  stickerByMood(word, maxFrames = 80) { // catalog lookup by query, words or mood; seeded pick
    const w = String(word).toLowerCase();
    const all = ((this.giphy || {}).items || []).filter((i) => i.keep !== false && (i.frames == null || i.frames <= maxFrames) &&
      ([i.query, ...(i.words || []), i.mood || ""].some((x) => String(x).toLowerCase().includes(w))));
    return all.length ? all[(this.seed() - 1) % all.length] : null;
  },
  sentencesAll() { return this.posts().flatMap((p) => (p.sentences || []).map((s) => ({ s, post: p }))); },
  wayback() { return ((this.wb || {}).items || []).filter((i) => i.img && i.img.width); },
  waybackAll() { return (this.wb || {}).items || []; },
  loadSticker(item) { if (!this.stickerImgs[item.id]) this.stickerImgs[item.id] = this.img("/otd/public/" + item.file.replace(/^public\//, "")); return this.stickerImgs[item.id]; },
  luma(img) { // mean brightness of the opaque pixels, 0 to 1; a sticker near 1 is white and vanishes on a white ground
    const f = this.gifFrames(img, 1)[0]; f.loadPixels(); let n = 0, t = 0;
    for (let i = 0; i < f.pixels.length; i += 16) { if (f.pixels[i + 3] < 128) continue; n++; t += (f.pixels[i] * 0.299 + f.pixels[i + 1] * 0.587 + f.pixels[i + 2] * 0.114) / 255; }
    return n ? t / n : 1;
  },
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
  gifFrames(gif, max = 24) { // every frame of a loaded GIF as its own image, evenly thinned to max
    const n = (gif.numFrames && gif.numFrames()) || 1; if (n <= 1) return [gif];
    const out = [], step = Math.max(1, n / max);
    gif.pause();
    for (let k = 0; k < n && out.length < max; k += step) { gif.setFrame(Math.floor(k)); out.push(gif.get()); }
    return out;
  },
  strip(frames, x, y, size, n = frames.length, dir = "row", gap = 0) { // a row or column of frames at one size
    for (let i = 0; i < n; i++) {
      const f = frames[i % frames.length], w = size, h = size * f.height / f.width;
      if (dir === "row") image(f, x + i * (w + gap), y, w, h); else image(f, x, y + i * (h + gap), w, h);
    }
  },
  scales(img, sizes, area = { x: -200, y: -200, w: 1480, h: 1750 }) { // the same image at several widths, seeded placement, let the card crop it
    for (const w of sizes) { const h = w * img.height / img.width; image(img, random(area.x, area.x + area.w - w * 0.5), random(area.y, area.y + area.h - h * 0.5), w, h); }
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
  flowText(t, x, y, w, lineH, obstacles = [], maxY = Infinity) { // wrap around rectangles; returns the y after the last line, or null if it ran past maxY
    const words = String(t).split(/\s+/).filter(Boolean);
    let i = 0, yy = y;
    while (i < words.length) {
      if (yy > maxY) return null;
      // the usable span on this line: the widest gap left by obstacles that cross it
      const asc = textSize() * 0.8, cross = obstacles.filter((o) => yy - asc < o.y + o.h && yy > o.y);
      let spans = [[x, x + w]];
      for (const o of cross) spans = spans.flatMap(([a, b]) => (o.x >= b || o.x + o.w <= a) ? [[a, b]] : [[a, Math.min(b, o.x - 24)], [Math.max(a, o.x + o.w + 24), b]]).filter(([a, b]) => b - a > 120);
      if (!spans.length) { yy += lineH; continue; }
      const [a, b] = spans.reduce((m, sp) => (sp[1] - sp[0] > m[1] - m[0] ? sp : m));
      let line = "";
      while (i < words.length) { const n = line ? line + " " + words[i] : words[i]; if (textWidth(n) <= b - a || !line) { line = n; i++; } else break; }
      text(line, a, yy); yy += lineH;
    }
    return yy;
  },
  // The posts as text screens. Every post in date order, laid out once into up to
  // POST_SCREENS.length screens, each flowing around that screen's obstacles (fixed
  // here so every screen computes the same cut). Screen k draws its share and
  // returns the y after its last line. Whatever does not fit the last screen is cut.
  POST_SCREENS: [
    [{ x: 600, y: 120, w: 420, h: 340 }],        // 1: the surviving image, top right
    [{ x: 60, y: 620, w: 480, h: 360 }],         // 2: a DV frame, left, mid
    [{ x: 640, y: 560, w: 380, h: 420 }],        // 3: a sticker, right, mid
    [{ x: 600, y: 120, w: 420, h: 300 }],        // 4: a broken image, top right; ends with the link
  ],
  postsFlow(k, { x = 60, y0 = 120, w = 960, bottom = 1350 - 170, px = 36, lineH = 46 } = {}) {
    const screens = this.POST_SCREENS, headH = 56;
    let screen = 0, yy = y0, lastY = null;
    const span = (yTop, yBot) => { // the widest horizontal run free of this screen's obstacles between yTop and yBot
      let spans = [[x, x + w]];
      for (const o of screens[screen]) if (yTop < o.y + o.h && yBot > o.y) spans = spans.flatMap(([a, b]) => (o.x >= b || o.x + o.w <= a) ? [[a, b]] : [[a, Math.min(b, o.x - 24)], [Math.max(a, o.x + o.w + 24), b]]).filter(([a, b]) => b - a > 120);
      return spans.length ? spans.reduce((m, sp) => (sp[1] - sp[0] > m[1] - m[0] ? sp : m)) : [x, x + w];
    };
    const heading = (p) => { if (screen === k) { const [a, b] = span(yy - 4, yy + 30); push(); fill(0); stroke(0); strokeWeight(1); line(a, yy, b, yy); noStroke(); this.arialCaps(16); text(`${this.caps(p.title)} · ${p.year}`, a, yy + 26); pop(); } };
    const body = (p, yStart) => { push(); this.times(px); if (screen !== k) fill(0, 0); else fill(0); const r = this.flowText(p.bodyText, x, yStart, w, lineH, screens[screen], bottom); pop(); return r; };
    for (const p of this.posts()) {
      if (yy + headH + 3 * lineH > bottom) { screen++; yy = y0; if (screen >= screens.length) break; }
      heading(p);
      let endY = body(p, yy + headH + px * 0.8);
      if (endY === null) { screen++; yy = y0; if (screen >= screens.length) break; heading(p); endY = body(p, yy + headH + px * 0.8); if (endY === null) endY = bottom; }
      if (screen === k) lastY = endY;
      yy = endY + 28;
    }
    return lastY;
  },
  stamp(n, label, x, y, px = 420) { // a true number set like a counter, with what it is in Courier
    push(); this.times(px); text(String(n), x, y); this.courier(16); text(label, x + 6, y + 30); pop();
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
