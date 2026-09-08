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
  // p5's loadJSON and loadStrings decrement its preload counter only when the
  // file arrives: one 404 leaves the sketch on "Loading…" forever, with no
  // error. Optional material is fetched instead and counted like an image, so a
  // day with no Wayback capture or no frames renders rather than hangs.
  fetchJSON(url, ok, fail) { this._get(url, (r) => r.json(), ok, fail); },
  fetchText(url, ok, fail) { this._get(url, (r) => r.text(), ok, fail); },
  _get(url, read, ok, fail) {
    this._pending++;
    fetch(url).then((r) => (r.ok ? read(r) : Promise.reject(new Error(`${r.status} ${url}`))))
      .then((v) => { ok && ok(v); })
      .catch((e) => { this._failed.push(url); fail && fail(e); })
      .finally(() => { this._pending--; });   // after ok(), so anything it starts is counted first
  },

  // ---------- data ----------
  preload(opts = {}) {
    const day = window.DAY || "11-09";
    this.sources = {};
    this.rescued = {};
    this.day = loadJSON(`/otd/data/days/${day}.json`, (d) => {
      const lost = new Set();
      for (const p of (d.posts || [])) {
        if (p.image && p.image.exists) this.images[p.image.src] = this.img("/public" + p.image.src);
        if (p.sourceFile) this.fetchText("/" + p.sourceFile, (t) => { this.sources[p.permalink] = t.split(/\r\n|\n|\r/); });
        // images the archive lost that the Wayback Machine still had: one try per
        // lost image, named by its file
        for (const m of String(p.bodyHtml || "").matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
          const src = m[1], name = src.split("/").pop();
          if (!/^https?:/.test(src) && !(p.image && p.image.exists && p.image.src === src) && !lost.has(name)) {
            lost.add(name);
            this.rescued[name] = this.img(`/otd/captures/${day}/wayback/rescued-${name}`, null, () => { delete this.rescued[name]; });
          }
        }
        if (!p.video || !p.video.id) continue;
        // this day's captures: the manifest, then its frames and thumbnail
        const base = `/otd/captures/${day}/${p.slug}/video/${p.video.id}/`;
        this.manifests[p.video.id] = { id: p.video.id, pending: true };
        this.fetchJSON(base + "manifest.json", (m) => {
          this.manifests[p.video.id] = m;
          this.frames[p.video.id] = (m.frames || []).map((f) => ({ ...f, img: this.img(base + f.file) }));
          if (m.thumb) this.images[`thumb:${p.video.id}`] = this.img(base + m.thumb);
        }, () => { this.manifests[p.video.id] = { id: p.video.id, missing: true }; });
      }
    });
    this.lines = loadJSON(`/otd/data/lines.json`);
    this.giphy = loadJSON(`/otd/public/giphy/manifest.json`);
    // tomorrow, for the last slide's tease
    const [mm, dd] = day.split("-").map(Number);
    const t = new Date(Date.UTC(2024, mm - 1, dd + 1));
    this.tomorrowDay = `${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
    this.tomorrowJSON = {};
    this.fetchJSON(`/otd/data/days/${this.tomorrowDay}.json`, (j) => { this.tomorrowJSON = j; });
    const F = "/otd/public/fonts/";
    this.font.times = loadFont(encodeURI(F + "Times New Roman.ttf"));
    this.font.timesItalic = loadFont(encodeURI(F + "Times New Roman Italic.ttf"));
    this.font.timesBold = loadFont(encodeURI(F + "Times New Roman Bold.ttf"));
    this.font.arial = loadFont(encodeURI(F + "Arial.ttf"));
    this.font.arialBold = loadFont(encodeURI(F + "Arial Bold.ttf"));
    this.font.courier = loadFont(encodeURI(F + "Courier New.ttf"));
    this.font.vcr = loadFont(F + "VCR_OSD_MONO.ttf");
    this.font.dseg = loadFont(F + "DSEG7Classic-Regular.ttf");
    // wayback captures, when wayback-page.mjs has run
    this.wb = { items: [] };
    this.fetchJSON(`/otd/captures/${day}/wayback/wayback.json`, (j) => { this.wb = j; for (const it of j.items || []) if (it.file) it.img = this.img(`/otd/captures/${day}/wayback/${it.file}`); });
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
  lineParts() { // the line in two halves: at its comma, else its dash or ellipsis, else the middle word
    const t = this.line();
    let i = t.indexOf(", ");
    if (i < 0) { const m = t.match(/[–—…:;]\s|\.\.\.\s/); if (m) i = m.index; }
    if (i < 0) { const words = t.split(" "); const half = Math.ceil(words.length / 2); return [words.slice(0, half).join(" "), words.slice(half).join(" ")]; }
    return [t.slice(0, i + (t[i] === "," ? 1 : 0)).trim(), t.slice(i + 1).trim()];
  },
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
  // A post's own material, in order of truth: its surviving image, the same image
  // recovered from the Wayback Machine, a frame from its own video, or a sticker
  // from the library whose word appears in its text. Never another post's.
  materialFor(post) {
    const im = this.images_(post)[0];
    if (im) {
      const live = this.images[im.src];
      if (live && live.width > 1) return { kind: "image", img: live, label: `${im.src.split("/").pop()} · ${post.year}` };
      const r = this.rescuedFor(im.src);
      if (r) return { kind: "recovered", img: r, label: `${im.alt || im.src.split("/").pop()} · recovered, web.archive.org` };
      return { kind: "broken", alt: im.alt || im.src.split("/").pop(), label: null };
    }
    if (post.video) {
      const fr = this.frames[post.video.id] || [];
      const usable = fr.filter((f) => f.img && f.img.width > 1);
      if (usable.length) { const f = usable[Math.floor(usable.length / 2)]; return { kind: "frame", img: this.interlace(this.chroma(f.img, 3), 3), label: null, tc: `0:00:${String(Math.round(f.t)).padStart(2, "0")}` }; }
      const err = this.manifests[post.video.id] && this.manifests[post.video.id].unavailable;
      if (err) return { kind: "gone", id: post.video.id, label: null };
    }
    const it = this.stickerFor(post);
    if (it) { const g = this.sticker(it); if (g && g.width > 1) return { kind: "sticker", img: this.frozen(g, Math.floor(random((g.numFrames && g.numFrames()) || 1))), label: `giphy ${it.id} · "${it.query}"` }; }
    return null;
  },
  // Everything the archive itself says about a post: its prose, its title, the
  // alt text it gave its own pictures, and the tags it filed itself under. A
  // sticker may only be used when one of these words is the post's own.
  ownWords(p) {
    return " " + [p.bodyText, p.title, ...(p.tags || []), ...(p.categories || []), ...this.images_(p).map((i) => i.alt)]
      .filter(Boolean).join(" ").toLowerCase() + " ";
  },
  stickersFor(post, max = 8) { // every library sticker whose word this post uses
    const t = this.ownWords(post);
    return ((this.giphy || {}).items || []).filter((i) => i.keep !== false && (i.frames == null || i.frames <= 80) &&
      [i.query, ...(i.words || [])].some((w) => w && w.length > 3 && new RegExp(`[^a-z]${String(w).toLowerCase()}[^a-z]`).test(t)))
      .slice(0, max);
  },
  stickerFor(post) { // one of them, seeded
    const hits = this.stickersFor(post, 99);
    return hits.length ? hits[(this.seed() - 1) % hits.length] : null;
  },
  drawMaterial(m, r) { // into the rectangle the layout reserved, bottom-aligned to its text
    if (!m) return;
    push();
    if (m.kind === "broken") this.brokenImage(m.alt, r.x, r.y, r.w, r.h);
    else if (m.kind === "gone") { noStroke(); fill(0); rect(r.x, r.y, r.w, r.w * 0.5625); fill(255); this.vcr(15); text(m.id, r.x + 14, r.y + r.w * 0.5625 - 14); fill(0); this.label("no longer available", r.x, r.y + r.w * 0.5625 + 24, 11); }
    else if (m.img) {
      const h = Math.min(r.h, r.w * m.img.height / m.img.width), w = h * m.img.width / m.img.height;
      const x = r.x + (r.w - w) / 2;
      if (m.kind === "image" || m.kind === "recovered") this.pixelated(true);
      image(m.img, x, r.y, w, h); this.pixelated(false);
      if (m.tc) this.osd(m.tc, x + 14, r.y + h - 14, 18);
      if (m.label) { fill(0); this.label(m.label, r.x, r.y + h + 24, 11); }
    }
    pop();
  },
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
  stickerByMood(word, maxFrames = 80, exclude = null) { // catalog lookup by query, words or mood; seeded pick; exclude is a regex on mood
    const w = String(word).toLowerCase();
    const all = ((this.giphy || {}).items || []).filter((i) => i.keep !== false && (i.frames == null || i.frames <= maxFrames) && !(exclude && exclude.test(i.mood || "")) &&
      ([i.query, ...(i.words || []), i.mood || ""].some((x) => String(x).toLowerCase().includes(w))));
    return all.length ? all[(this.seed() - 1) % all.length] : null;
  },
  // ---- the day's own facts, so a sketch never names a video, a file or a month ----
  mmdd() { const [mm, dd] = (this.day.day || "01-01").split("-"); return { mm, dd, month: this.monthName(mm), abbr: this.monthName(mm).slice(0, 3).toUpperCase(), dayNum: Number(dd) }; },
  dateWords() { const { dayNum, month } = this.mmdd(); return `${dayNum} ${month.toLowerCase()}`; },
  videos() { // posts whose video gave us frames
    return this.posts().filter((p) => p.video && (this.frames[p.video.id] || []).some((f) => f.img && f.img.width > 1));
  },
  goneVideos() { // posts whose video is gone, with yt-dlp's words
    return this.posts().filter((p) => p.video && (this.manifests[p.video.id] || {}).unavailable && !(this.frames[p.video.id] || []).some((f) => f.img && f.img.width > 1))
      .map((p) => ({ post: p, id: p.video.id, error: (this.manifests[p.video.id].unavailable || "").trim() }));
  },
  allFrames() { return this.videos().flatMap((p) => (this.frames[p.video.id] || []).filter((f) => f.img && f.img.width > 1).map((f) => ({ id: p.video.id, post: p, ...f }))); },
  heroSource() { return this.sources[this.hero().permalink] || []; },
  heroSourcePath() { return this.hero().sourceFile || ""; },
  numbers() { // true numbers from the day, biggest first: a counter needs no explanation but its own
    const out = [];
    for (const p of this.posts()) {
      const m = (this.manifests[(p.video || {}).id] || {}).meta;
      if (m && m.view_count) out.push([m.view_count, `views · ${m.title} · youtube`]);
      if (m && m.duration) out.push([m.duration, `seconds · ${m.title}`]);
    }
    out.push([this.hero().wpId, `wpId · ${this.hero().title}`]);
    out.push([this.posts().length, `posts · ${this.dateWords()}`]);
    out.push([this.tagsAll().length, `tags and categories · ${this.dateWords()}`]);
    out.push([this.sentencesAll().length, `sentences · ${this.dateWords()}`]);
    return out.filter(([n]) => n != null);
  },
  dayWords(max = 6) { // stickers from the library whose word is in the day's text, with the sentence that says it
    const seen = new Set(), out = [];
    for (const it of ((this.giphy || {}).items || [])) {
      if (it.keep === false) continue;
      for (const w of [it.query, ...(it.words || [])]) {
        if (!w || w.length < 4 || seen.has(w)) continue;
        const re = new RegExp(`[^a-z]${String(w).toLowerCase()}[^a-z]`);
        const hit = this.sentencesAll().find(({ s }) => re.test(" " + s.toLowerCase() + " "));
        if (hit) { seen.add(w); out.push({ word: w, item: it, sentence: hit.s, post: hit.post }); }
      }
    }
    return out.slice(0, max);
  },
  monthSticker() { // a sticker for the month, else period lettering, else anything that will show
    const { month } = this.mmdd();
    const by = (f) => ((this.giphy || {}).items || []).filter((i) => i.keep !== false && (i.frames == null || i.frames <= 40) && f(i));
    return by((i) => [i.query, ...(i.words || [])].some((w) => String(w).toLowerCase() === month.toLowerCase()))
      .concat(by((i) => /period type/.test(i.mood || ""))).concat(by(() => true));
  },
  skip(why) { window.__skip = why; window.__rendered = true; },
  tomorrow() { const d = this.tomorrowJSON || {}; return { day: this.tomorrowDay, posts: d.posts || [], years: [...new Set((d.posts || []).map((p) => p.year))].sort() }; },
  monthName(mm) { return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][Number(mm) - 1]; },
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
  // Wrap around rectangles, from word `from` onward. Returns { y, next }: the y
  // after the last line drawn, and the index of the first word that did not fit
  // (-1 when the text is finished), so the next screen can continue it.
  flowText(t, x, y, w, lineH, obstacles = [], maxY = Infinity, draw = true, from = 0) {
    const words = String(t).split(/\s+/).filter(Boolean);
    let i = from, yy = y;
    while (i < words.length) {
      if (yy > maxY) return { y: yy, next: i };
      // the usable span on this line: the widest gap left by obstacles that cross it
      const asc = textSize() * 0.8, cross = obstacles.filter((o) => yy - asc < o.y + o.h && yy > o.y);
      let spans = [[x, x + w]];
      for (const o of cross) spans = spans.flatMap(([a, b]) => (o.x >= b || o.x + o.w <= a) ? [[a, b]] : [[a, Math.min(b, o.x - 24)], [Math.max(a, o.x + o.w + 24), b]]).filter(([a, b]) => b - a > 120);
      if (!spans.length) { yy += lineH; continue; }
      const [a, b] = spans.reduce((m, sp) => (sp[1] - sp[0] > m[1] - m[0] ? sp : m));
      let line = "";
      while (i < words.length) { const n = line ? line + " " + words[i] : words[i]; if (textWidth(n) <= b - a || !line) { line = n; i++; } else break; }
      if (draw) text(line, a, yy);
      yy += lineH;
    }
    return { y: yy, next: -1 };
  },
  // The posts as text screens. Every post in date order, flowed across up to
  // SCREENS screens: a post that does not finish continues on the next screen
  // from the word it stopped at, so no line is drawn twice and no screen is left
  // half empty. Each post brings its OWN material (materialFor) beside the start
  // of its body, alternating sides. Screen k draws its share.
  SCREENS: 4,
  postsFlow(k, { x = 60, y0 = 120, w = 960, bottom = 1350 - 170, px = 36, lineH = 46, mw = 400, mh = 300 } = {}) {
    const headH = 56, gap = 30;
    let screen = 0, yy = y0, lastY = null, side = 0, used = 0;
    for (const p of this.posts()) {
      const m = this.materialFor(p);
      let from = 0, first = true;
      while (from >= 0 && screen < this.SCREENS) {
        const isHead = first;
        const bodyY = yy + (isHead ? headH + px * 0.8 : px * 0.8);
        if (bodyY + lineH * 2 > bottom) { screen++; yy = y0; continue; } // no room to start here
        // this post's material, on the screen where it starts, if its text can wrap round it
        let r = null;
        if (isHead && m) {
          push(); this.times(px); const wide = Math.ceil(textWidth(p.bodyText) / (w - mw - 24)) * lineH; pop();
          if (wide >= mh * 0.5 && bodyY - px * 0.8 - 4 + mh < bottom + 60) r = { x: side % 2 ? x : x + w - mw, y: bodyY - px * 0.8 - 4, w: mw, h: mh };
        }
        push(); this.times(px);
        if (screen === k) {
          if (isHead) { push(); fill(0); stroke(0); strokeWeight(1); line(x, yy, x + w, yy); noStroke(); this.arialCaps(16); text(`${this.caps(p.title)} · ${p.year}`, x, yy + 26); pop(); }
          fill(0);
        } else fill(0, 0);
        const res = this.flowText(p.bodyText, x, bodyY, w, lineH, r ? [r] : [], bottom, screen === k, from);
        pop();
        used = Math.max(used, screen);
        if (screen === k) { this.drawMaterial(m && isHead ? m : null, r); lastY = Math.max(lastY ?? 0, res.y, r ? r.y + r.h : 0); }
        from = res.next;
        if (from >= 0) { screen++; yy = y0; first = false; }   // continues on the next screen
        else { yy = res.y + gap; if (r) yy = Math.max(yy, r.y + r.h + gap); }
      }
      if (m) side++;
      if (screen >= this.SCREENS) break;
    }
    // { end: the y this screen finished at, or null if it drew nothing; last: this is the final screen with text }
    return { end: lastY, last: k >= used };
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
