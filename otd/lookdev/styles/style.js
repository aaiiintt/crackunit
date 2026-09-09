// Part A: four style modules, tested against the same three beats.
//
// Each module answers the same questions differently — ground, type, the
// container things sit in, how a picture is treated, where the ink lands, and
// how repetition is done. beats.js supplies the content; nothing here invents
// any. Shared helpers first, then the modules in STYLES.
//
// Loaded by page.html after lib.js. See docs/on-this-day/LOOK.md.

// ---------- shared helpers ----------

const S = {
  // The day's ink, sampled from the day's own material: the dominant saturated
  // hue of the images the beat was given, set to a strength that works as ink.
  inkFrom(imgs, fallback = [20, 20, 20]) {
    const H = 36, weight = new Array(H).fill(0), sum = new Array(H).fill(0);
    for (const im of imgs) {
      if (!im || im.width < 2) continue;
      const c = OTD.clone(im); c.resize(64, Math.max(1, Math.round(64 * im.height / im.width))); c.loadPixels();
      for (let i = 0; i < c.pixels.length; i += 4) {
        const r = c.pixels[i], g = c.pixels[i + 1], b = c.pixels[i + 2];
        if (c.pixels[i + 3] < 128) continue;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 510;
        if (mx === mn || l < 0.12 || l > 0.93) continue;
        const sat = (mx - mn) / (mx + mn <= 255 ? mx + mn : 510 - mx - mn);
        if (sat < 0.22) continue;
        let h;
        if (mx === r) h = ((g - b) / (mx - mn) + 6) % 6; else if (mx === g) h = (b - r) / (mx - mn) + 2; else h = (r - g) / (mx - mn) + 4;
        h *= 60;
        const k = Math.floor(h / (360 / H)) % H;
        weight[k] += sat; sum[k] += h;
      }
    }
    let best = -1, bw = 0;
    for (let k = 0; k < H; k++) if (weight[k] > bw) { bw = weight[k]; best = k; }
    if (best < 0) return fallback;
    return S.hsbToRgb(S.bucketHue(sum, weight, best, H), 0.92, 0.78);
  },
  bucketHue(sum, weight, k, H) { return weight[k] > 0 ? (sum[k] / weight[k]) % 360 : k * (360 / H); },
  hsbToRgb(h, s, v) {
    const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0]; else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c]; else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  },

  // Stretch a picture to its own full tonal range. Without this a pale 2005
  // logo screens to almost nothing and a dark video frame screens to a solid
  // block: the halftone would say more about the exposure than the picture.
  normalise(img) {
    const o = OTD.clone(img); o.loadPixels();
    let mn = 255, mx = 0;
    for (let i = 0; i < o.pixels.length; i += 4) {
      if (o.pixels[i + 3] < 128) continue;
      const l = o.pixels[i] * 0.299 + o.pixels[i + 1] * 0.587 + o.pixels[i + 2] * 0.114;
      if (l < mn) mn = l; if (l > mx) mx = l;
    }
    const span = Math.max(24, mx - mn);
    for (let i = 0; i < o.pixels.length; i += 4) for (let k = 0; k < 3; k++)
      o.pixels[i + k] = Math.max(0, Math.min(255, (o.pixels[i + k] - mn) * 255 / span));
    o.updatePixels(); return o;
  },
  // A picture screened to two colours at a chosen coarseness, so the dot is
  // visible: the archive seen through a printing process, not a filter.
  screened(img, cells, dark, light = null) {
    const c = OTD.clone(img);
    const w = Math.max(8, Math.round(cells));
    c.resize(w, Math.max(1, Math.round(w * img.height / img.width)));
    return OTD.dither(S.normalise(c), dark, light);
  },
  // The largest size at which the whole text fits the box: a short post is set
  // large and a long one small, so the type size is decided by the day.
  fillSize(t, w, h, lead, setSize, maxPx = 120, minPx = 20) {
    for (let px = maxPx; px >= minPx; px -= 2) { setSize(px); if (OTD.wrap(t, w).length * px * lead <= h) return px; }
    setSize(minPx); return minPx;
  },
  // Fit a picture inside a rectangle, cropped to fill it. Returns nothing.
  cover(img, x, y, w, h, pixel = true) {
    const sc = Math.max(w / img.width, h / img.height);
    const dw = img.width * sc, dh = img.height * sc;
    drawingContext.save(); drawingContext.beginPath(); drawingContext.rect(x, y, w, h); drawingContext.clip();
    if (pixel) OTD.pixelated(true);
    image(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    OTD.pixelated(false); drawingContext.restore();
  },
  clip(x, y, w, h, fn) {
    drawingContext.save(); drawingContext.beginPath(); drawingContext.rect(x, y, w, h); drawingContext.clip();
    fn(); drawingContext.restore();
  },
  shadow(blur, dx, dy, alpha = 0.18) {
    drawingContext.shadowColor = `rgba(0,0,0,${alpha})`;
    drawingContext.shadowBlur = blur; drawingContext.shadowOffsetX = dx; drawingContext.shadowOffsetY = dy;
  },
  noShadow() { drawingContext.shadowColor = "rgba(0,0,0,0)"; drawingContext.shadowBlur = 0; drawingContext.shadowOffsetX = 0; drawingContext.shadowOffsetY = 0; },
  tracked(t, x, y, extra = 1.5) { let cx = x; for (const ch of String(t)) { text(ch, cx, y); cx += textWidth(ch) + extra; } return cx - x; },
  trackedWidth(t, extra = 1.5) { let w = 0; for (const ch of String(t)) w += textWidth(ch) + extra; return w; },

  // Greedy wrap, then draw justified: slack shared between the words, last line
  // flush left. The signature move of the Journal reference.
  justified(t, x, y, w, lineH, maxY = Infinity, from = 0) {
    const words = String(t).split(/\s+/).filter(Boolean);
    let i = from, yy = y;
    while (i < words.length && yy <= maxY) {
      const start = i; let ln = "";
      while (i < words.length) { const n = ln ? ln + " " + words[i] : words[i]; if (textWidth(n) <= w || !ln) { ln = n; i++; } else break; }
      const ws = words.slice(start, i), last = i >= words.length;
      if (ws.length > 1 && !last) {
        const slack = (w - ws.reduce((a, s) => a + textWidth(s), 0)) / (ws.length - 1);
        let cx = x; for (const s of ws) { text(s, cx, yy); cx += textWidth(s) + slack; }
      } else text(ln, x, yy);
      yy += lineH;
    }
    return { y: yy, next: i < words.length ? i : -1 };
  },
  // The largest size at which t wraps into at most `lines` lines inside w.
  fitBlock(t, w, lines, maxPx, minPx = 28, setSize) {
    for (let px = maxPx; px >= minPx; px -= 2) {
      setSize(px);
      const ls = OTD.wrap(t, w);
      // a word wider than the column still wraps to one line: check the width too
      if (ls.length <= lines && ls.every((l) => textWidth(l) <= w)) return px;
    }
    setSize(minPx); return minPx;
  },
  // The largest size at which the whole text fits a box, both ways: the old
  // version counted lines only, so a headline could run out of its own panel.
  fitBox(t, w, h, lead, maxPx, minPx, setSize) {
    for (let px = maxPx; px >= minPx; px -= 2) {
      setSize(px);
      const ls = OTD.wrap(t, w);
      if (ls.every((l) => textWidth(l) <= w) && ls.length * px * lead <= h) return px;
    }
    setSize(minPx); return minPx;
  },
  // The largest size at which one line fits a width, for a label that must not run out
  fitOne(t, w, maxPx, minPx, setSize) {
    for (let px = maxPx; px >= minPx; px -= 1) { setSize(px); if (textWidth(t) <= w) return px; }
    setSize(minPx); return minPx;
  },
  // ---------- looseness ----------
  // The four p5 pieces Iain picked are all off the grid: one thing enormous and
  // running out of the frame, the same thing tiny and marching off both edges,
  // type and picture overlapping with neither protected by a box, a swarm of
  // stickers at wildly different sizes, and a credit line in the gutter. These
  // are those moves, so each option can be loose in its own way.

  // One picture many times, mostly small and a few enormous, placed past the
  // edges so the frame crops it. Seeded, so a good one can be kept.
  pick(img, i) { return Array.isArray(img) ? img[i % img.length] : img; },
  // The first `giant` instances are drawn at full size and drawn first, so the
  // small ones land on top of them: the range is 20px to wider than the frame,
  // because a swarm that never leaves the canvas is just a pattern.
  swarm(imgs, o = {}) {
    const { n = 12, min = 22, max = 1180, x = -200, y = -200, w = OTD.W + 400, h = OTD.H + 400, rot = 0, bias = 3.4, giant = 1 } = o;
    for (let i = 0; i < n; i++) {
      const img = S.pick(imgs, Math.floor(random(99)));
      const t = i < giant ? 1 : Math.pow(random(), bias);
      const ww = min + t * (max - min), hh = ww * img.height / img.width;
      push(); translate(random(x, x + w), random(y, y + h));
      if (rot) rotate(random(-rot, rot));
      image(img, -ww / 2, -hh / 2, ww, hh); pop();
    }
  },
  // A row that starts before the left edge and ends after the right one
  march(imgs, y, size, o = {}) {
    const { gap = 5, angle = 0, phase = null } = o;
    const step = size + gap, x0 = (phase === null ? -random(step) : phase) - size;
    push();
    if (angle) { translate(OTD.W / 2, y); rotate(angle); translate(-OTD.W / 2, -y); }
    let k = 0;
    for (let x = x0; x < OTD.W + size; x += step, k++) { const img = S.pick(imgs, k); image(img, x, y, size, size * img.height / img.width); }
    pop();
  },
  // The browser's own bullet list, tiny and grey: a post's sentences as the
  // markup rendered them, which is furniture the archive already had.
  bullets(list, x, y, w, px, lead, maxY) {
    push(); noStroke(); S.arial(px); let yy = y;
    for (const t of list) {
      if (yy > maxY) break;
      fill(150); rect(x, yy - px * 0.5, 4, 4);
      fill(55);
      for (const ln of OTD.wrap(t, w - 24)) { if (yy > maxY) break; text(ln, x + 22, yy); yy += px * lead; }
      yy += 7;
    }
    pop(); return yy;
  },
  // One picture too big for the frame, anchored by a point rather than a box
  bleed(img, cx, cy, w) { const hh = w * img.height / img.width; image(img, cx - w / 2, cy - hh / 2, w, hh); },
  // Type set past the edge: wrapped at a width wider than the canvas, so the
  // longest line leaves the frame. Returns the y it finished at.
  giant(t, x, y, px, lead, wrapW, setSize, jitter = 0) {
    push(); setSize(px);
    let yy = y + px * 0.76;
    for (const ln of OTD.wrap(t, wrapW)) { text(ln, x + (jitter ? random(-jitter * 0.35, jitter) : 0), yy); yy += px * lead; }
    pop(); return yy;
  },
  giantSize(t, wrapW, targetH, lead, setSize, maxPx = 420, minPx = 54, firstFit = 0) {
    for (let px = maxPx; px >= minPx; px -= 4) {
      setSize(px);
      const ls = OTD.wrap(t, wrapW);
      if (ls.length * px * lead > targetH) continue;
      if (firstFit && textWidth(ls[0]) > firstFit) continue;
      return px;
    }
    setSize(minPx); return minPx;
  },
  // Type that has to be read is never clipped by the frame: no word loses
  // letters off the side. Lines are staggered by indenting from the left, so
  // the block still steps rather than sitting on a column, and the stagger is
  // taken out of the measured width before the size is chosen. Only type used
  // as pattern — a URL repeated, a numeral used as form — may run out, and it
  // uses `giant` directly.
  giantFit(t, x, y, h, lead, setSize, o = {}) {
    const { right = 44, jitter = 0, maxPx = 300, minPx = 20 } = o;
    const w = OTD.W - x - right - jitter;
    const px = S.fitBox(t, w, h, lead, maxPx, minPx, setSize);
    push(); setSize(px);
    let yy = y + px * 0.78;
    for (const ln of OTD.wrap(t, w)) { text(ln, x + (jitter ? random(0, jitter) : 0), yy); yy += px * lead; }
    pop();
    return { y: yy, px };
  },
  // Where the account signs itself, and where Giphy is credited. Both tiny,
  // both in the gutter, both in every one of the references.
  daymark(t) { push(); noStroke(); fill(0); S.arialB(15); S.tracked(OTD.caps(t), 46, 62, 1.9); pop(); },
  credit(parts) {
    push(); noStroke(); fill(0); S.arialB(12.5);
    S.tracked(OTD.caps(parts.filter(Boolean).join("  ·  ")), 46, OTD.H - 30, 1.1); pop();
  },
  anomaly(x, y, c = [255, 40, 0], r = 5) { push(); noStroke(); fill(c[0], c[1], c[2]); ellipse(x, y, r * 2, r * 2); pop(); },

  rule(x, y, w, weight = 1, c = 0) { push(); stroke(c); strokeWeight(weight); line(x, y, x + w, y); pop(); },
  cross(x, y, r = 6, weight = 1.6, c = 0) { push(); stroke(c); strokeWeight(weight); line(x - r, y - r, x + r, y + r); line(x + r, y - r, x - r, y + r); pop(); },
  // Draw something n times, receding: the back copy first so the front occludes.
  deepStack(n, dx, dy, drawOne) { for (let i = n - 1; i >= 0; i--) { push(); translate(dx * i, dy * i); drawOne(i, n); pop(); } },
  arial(px) { textFont(OTD.font.arial); textSize(px); },
  arialB(px) { textFont(OTD.font.arialBold); textSize(px); },
  courier(px) { textFont(OTD.font.courier); textSize(px); },
};

// ---------- A · Sponsored ----------
// Reference: "You May Also Like", Werkplaats Typografie. White, everything in a
// hairline box labelled above and closable, boxes overlapping, all type Arial
// bold and black, the ink reserved for the things that were once clickable.

const A = {
  name: "A · Sponsored", ground: [255, 255, 255], bodyFont: "arialB",
  paint() { background(255); },
  // A labelled box. Returns the content rect inside it.
  panel(x, y, w, h, label = "SPONSORED", ink) {
    push();
    S.arialB(13); fill(0); noStroke(); S.tracked(label, x, y - 9, 1.4);
    S.noShadow(); fill(255); stroke(0); strokeWeight(2); rect(x, y, w, h);
    pop();
    S.cross(x + w - 20, y + 20, 6, 1.8);
    return { x: x + 22, y: y + 24, w: w - 44, h: h - 48 };
  },
  headline(t, x, y, w, h, maxPx = 92) {
    push(); fill(0); noStroke();
    const px = S.fitBox(t, w, h, 1.06, maxPx, 24, (p) => S.arialB(p));
    let yy = y + px * 0.86;
    for (const ln of OTD.wrap(t, w)) { text(ln, x, yy); yy += px * 1.06; }
    pop(); return yy - px * 0.2;
  },
  body(t, x, y, w, px = 30, maxY = Infinity) {
    push(); fill(0); noStroke(); S.arialB(px);
    const r = OTD.flowText(t, x, y + px * 0.85, w, px * 1.22, [], maxY);
    pop(); return r.y;
  },
  picture(img, x, y, w, h, ink) { S.cover(S.screened(img, Math.min(200, Math.max(48, w / 5)), [0, 0, 0], [255, 255, 255]), x, y, w, h); },
  caption(lines, x, y, ink) {
    push(); noStroke(); S.arialB(20);
    fill(ink[0], ink[1], ink[2]); text(lines[0], x, y);
    fill(0); if (lines[1]) text(lines[1], x, y + 26);
    pop();
  },
  link(t, x, y, ink, px = 20) { push(); noStroke(); S.arialB(px); fill(ink[0], ink[1], ink[2]); text(t, x, y); pop(); },
  dateMark(day, ink) { push(); const w = 168, h = 54, x = OTD.W - w - 48, y = 44; A.panel(x, y, w, h, "ON THIS DAY", ink); S.arialB(26); fill(0); noStroke(); text(day, x + 22, y + 37); pop(); },
};

// ---------- B · Journal ----------
// Reference: "XXIX". A body of the archive's own prose, justified, as the
// ground; cards float over it and crop it; numbered notes down the margin; one
// flat card in the day's ink.

const B = {
  name: "B · Journal", ground: [242, 241, 238], bodyFont: "arial",
  paint() { background(242, 241, 238); },
  // The bed: the post's real text, justified, running the full column, black.
  bed(t, x, y, w, px = 42, maxY = OTD.H - 60) {
    push(); fill(0); noStroke(); S.arial(px);
    S.justified(t, x, y + px * 0.85, w, px * 1.28, maxY);
    pop();
  },
  card(x, y, w, h, fillC = [232, 231, 228]) {
    push(); S.shadow(38, 6, 12, 0.22); noStroke(); fill(fillC[0], fillC[1], fillC[2]); rect(x, y, w, h); S.noShadow(); pop();
    return { x: x + 34, y: y + 30, w: w - 68, h: h - 60 };
  },
  inkCard(x, y, w, h, small, more, ink) {
    push(); S.shadow(30, 5, 10, 0.2); noStroke(); fill(ink[0], ink[1], ink[2]); rect(x, y, w, h); S.noShadow();
    fill(0); S.arial(25);
    let yy = y + 44; for (const ln of OTD.wrap(small, w - 56)) { text(ln, x + 28, yy); yy += 31; }
    const px = S.fitOne(more, w - 84, 22, 12, (v) => S.arial(v));
    const by = y + h - 30;
    text(more, x + 28, by);
    const ax = x + 28 + textWidth(more) + 14, ay = by - px * 0.5;   // Arial has no ↘, so draw it
    stroke(0); strokeWeight(2); noFill();
    line(ax, ay - 6, ax + 12, ay + 6); line(ax + 12, ay + 6, ax + 3, ay + 6); line(ax + 12, ay + 6, ax + 12, ay - 3);
    pop();
  },
  headline(t, x, y, w, h, maxPx = 96) {
    push(); fill(0); noStroke();
    const px = S.fitBox(t, w, h, 1.02, maxPx, 26, (p) => S.arial(p));
    let yy = y + px * 0.84;
    for (const ln of OTD.wrap(t, w)) { text(ln, x, yy); yy += px * 1.02; }
    pop(); return yy;
  },
  notes(items, x, y, w = 150) {
    push(); noStroke(); let yy = y;
    items.forEach((t, i) => {
      fill(0); S.arial(13); text(String(i + 1), x, yy);
      S.arial(12.5); yy += 15;
      for (const ln of OTD.wrap(t, w)) { text(ln, x, yy); yy += 15; }
      yy += 26;
    });
    pop();
  },
  picture(img, x, y, w, h, ink) { S.cover(img, x, y, w, h); },
  dateMark(day, ink) { push(); noStroke(); fill(0); S.arial(15); S.tracked(day, 48, 62, 2.2); pop(); },
};

// ---------- C · Windows ----------
// Reference: "CCA Career Expo". White, browser windows repeated in deep offset
// stacks — the stack is the hero — primaries in the windows behind, marginalia
// set vertically down both edges, the archive's own words in black at the front.

const C = {
  name: "C · Windows", ground: [255, 255, 255], bodyFont: "arialB",
  PRIMARY: [[34, 34, 204], [232, 50, 42], [79, 214, 43], [255, 212, 0]],
  paint() { background(255); },
  chromeH: 44,
  // A browser window with real chrome and the real URL. Returns the content rect.
  win(x, y, w, h, url, shadow = true) {
    push();
    if (shadow) S.shadow(22, 3, 6, 0.22);
    noStroke(); fill(255); rect(x, y, w, h);
    S.noShadow();
    stroke(150); strokeWeight(1); noFill(); rect(x + 0.5, y + 0.5, w - 1, h - 1);
    noStroke(); fill(238); rect(x + 1, y + 1, w - 2, C.chromeH - 1);
    stroke(150); line(x, y + C.chromeH, x + w, y + C.chromeH);
    noStroke();
    for (let i = 0; i < 3; i++) { fill(190); ellipse(x + 20 + i * 15, y + C.chromeH / 2, 9, 9); }
    fill(120); S.arialB(15);
    text("←  →  ↻", x + 74, y + C.chromeH / 2 + 5);
    fill(255); stroke(170); strokeWeight(1); rect(x + 142, y + 9, Math.max(40, w - 158), C.chromeH - 18, 3);
    noStroke(); fill(90); S.courier(14);
    S.clip(x + 148, y, Math.max(20, w - 172), C.chromeH, () => text(url, x + 152, y + C.chromeH / 2 + 5));
    pop();
    return { x, y: y + C.chromeH, w, h: h - C.chromeH };
  },
  // The move: one window drawn n times, receding up and left, each copy showing
  // its own frame, so the repetition carries the material rather than decorating.
  stack(x, y, w, h, n, url, drawOne, dx = -22, dy = -18) {
    S.deepStack(n, dx, dy, (i) => { const r = C.win(x, y, w, h, url, i === 0); S.clip(r.x, r.y, r.w, r.h, () => drawOne(i, r)); });
  },
  headline(t, x, y, w, h, maxPx = 118) {
    push(); fill(0); noStroke();
    const up = OTD.caps(t);
    const px = S.fitBox(up, w, h, 0.98, maxPx, 26, (p) => S.arialB(p));
    let yy = y + px * 0.82;
    for (const ln of OTD.wrap(up, w)) { text(ln, x, yy); yy += px * 0.98; }
    pop(); return yy;
  },
  body(t, x, y, w, px = 28, maxY = Infinity) {
    push(); fill(0); noStroke(); S.arialB(px);
    const r = OTD.flowText(t, x, y + px * 0.85, w, px * 1.2, [], maxY); pop(); return r.y;
  },
  picture(img, x, y, w, h, ink) { S.cover(img, x, y, w, h); },
  margin(t, side, ink) { // tiny type set vertically down an edge, as the reference does
    push(); noStroke(); fill(0); S.courier(11.5);
    if (side === "left") { translate(26, OTD.H - 52); rotate(-HALF_PI); } else { translate(OTD.W - 22, 52); rotate(HALF_PI); }
    S.tracked(t, 0, 0, 0.6); pop();
  },
  dateMark(day, ink) { push(); const w = 256, h = 100; const r = C.win(OTD.W - w - 40, 38, w, h, "crackunit.com"); const c = C.PRIMARY[0]; noStroke(); fill(c[0], c[1], c[2]); rect(r.x + 1, r.y, r.w - 2, r.h - 1); fill(255); S.arialB(32); text(OTD.caps(day), r.x + 18, r.y + 40); pop(); },
};

// ---------- D · Duotone ----------
// Reference: "Ettore Grotesk". Cream, thin outlined windows drawn in the ink,
// every picture halftoned into the ink, one weight of grotesk, the archive's own
// words in black, repetition as a shallow stack of the same card.

const D = {
  name: "D · Duotone", ground: [247, 244, 237], bodyFont: "arial",
  paint() { background(247, 244, 237); },
  win(x, y, w, h, ink, title = null, fillC = null) {
    push();
    noStroke(); if (fillC) { fill(fillC[0], fillC[1], fillC[2]); rect(x, y, w, h); } else { fill(247, 244, 237); rect(x, y, w, h); }
    stroke(ink[0], ink[1], ink[2]); strokeWeight(1.6); noFill(); rect(x + 0.8, y + 0.8, w - 1.6, h - 1.6);
    line(x, y + 30, x + w, y + 30);
    noStroke(); fill(ink[0], ink[1], ink[2]);
    for (let i = 0; i < 3; i++) ellipse(x + 15 + i * 12, y + 15, 6.5, 6.5);
    if (title) { S.arial(15); text(title, x + 58, y + 20); }
    pop();
    return { x: x + 1, y: y + 31, w: w - 2, h: h - 32 };
  },
  headline(t, x, y, w, h, maxPx = 86) {
    push(); fill(0); noStroke();
    const px = S.fitBox(t, w, h, 1.08, maxPx, 24, (p) => S.arial(p));
    let yy = y + px * 0.84;
    for (const ln of OTD.wrap(t, w)) { text(ln, x, yy); yy += px * 1.08; }
    pop(); return yy;
  },
  body(t, x, y, w, px = 28, maxY = Infinity) {
    push(); fill(0); noStroke(); S.arial(px);
    const r = OTD.flowText(t, x, y + px * 0.85, w, px * 1.28, [], maxY); pop(); return r.y;
  },
  picture(img, x, y, w, h, ink) { S.cover(S.screened(img, Math.min(190, Math.max(52, w / 4.5)), ink, null), x, y, w, h); },
  // A pixel grid built from the picture itself, not invented: its own luma, coarse.
  grid(img, x, y, w, h, cols, ink) {
    const rows = Math.max(1, Math.round(cols * h / w));
    const c0 = OTD.clone(img); c0.resize(cols, rows);
    const c = S.normalise(c0); c.loadPixels();
    const lum = [];
    for (let i = 0; i < cols * rows; i++) { const j = 4 * i; lum.push((c.pixels[j] * 0.299 + c.pixels[j + 1] * 0.587 + c.pixels[j + 2] * 0.114) / 255); }
    // threshold at the picture's own mean, so a grid always reads as a pattern
    const t = lum.reduce((a, b) => a + b, 0) / Math.max(1, lum.length);
    push(); stroke(ink[0], ink[1], ink[2], 90); strokeWeight(1); const cw = w / cols, ch = h / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      if (lum[r * cols + k] < t) { noStroke(); fill(ink[0], ink[1], ink[2]); rect(x + k * cw, y + r * ch, cw, ch); stroke(ink[0], ink[1], ink[2], 90); }
      noFill(); rect(x + k * cw, y + r * ch, cw, ch);
    }
    pop();
  },
  // The reference's repetition: the same card offset, its text stepping down in size.
  cardStack(x, y, w, h, n, ink, drawOne, dx = -14, dy = -14) {
    S.deepStack(n, dx, dy, (i) => { const r = D.win(x, y, w, h, ink); S.clip(r.x, r.y, r.w, r.h, () => drawOne(i, r)); });
  },
  dateMark(day, ink) { push(); const w = 176, h = 74; const r = D.win(OTD.W - w - 48, 44, w, h, ink); noStroke(); fill(0); S.arial(26); text(day, r.x + 18, r.y + 30); pop(); },
};

const STYLES = { A, B, C, D };
window.S = S; window.STYLES = STYLES;
