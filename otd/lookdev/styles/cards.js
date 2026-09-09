// The card library. A card takes a register, a rectangle and some material,
// and does not know what day it is. Cards are written when a piece has been
// needed rather than invented ahead of time, so this file grows slowly.
//
// Loaded after style.js.

const CARDS = {

  // index — the day's posts, and where to read them.
  //
  // Every row is the archive's own: the post's publish date and its own title.
  // The only furniture is the URL and "link in bio", both of which LOOK.md
  // allows. Nothing here is written.
  //
  // The rows fill the card, so the size comes from the day: four posts are set
  // large, thirteen small. Measuring and drawing share one row height, or they
  // drift and the footer lands on the last title.
  //
  //   data = { dateWords, rows: [{ date, title, permalink }], years, url }
  index(reg, r, data, ink) {
    const { rows, url, years } = data;
    const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const stampOf = (iso) => { const [y, m, d] = iso.slice(0, 10).split("-"); return `${Number(d)} ${MON[Number(m) - 1]} ${y}`; };
    const count = `${rows.length} post${rows.length === 1 ? "" : "s"} · ${years.join(" · ")}`;
    const face = reg === "A" ? (px) => S.arialB(px) : (px) => S.arial(px);

    // the column the rows live in, and the space above and below them
    const pad = reg === "A" ? 24 : reg === "D" ? 18 : 0;
    const col = { x: r.x + pad, w: r.w - pad * 2 };
    const headH = 78, footH = reg === "B" ? 150 : 120;
    const top = r.y + headH, bodyH = r.h - headH - footH;

    const metaPx = (px) => Math.max(12, px * 0.32);
    const rowH = (o, px) => { face(px); return metaPx(px) * 1.9 + OTD.wrap(o.title, col.w).length * px * 1.02 + px * 0.5; };
    const totalAt = (px) => { push(); const t = rows.reduce((n, o) => n + rowH(o, px), 0); pop(); return t; };

    let px = 190;   // a one-post day sets its title enormous; thirteen shrink to fit
    while (px > 16 && totalAt(px) > bodyH) px -= 2;

    const drawRow = (y, o) => {
      push(); noStroke();
      fill(ink[0], ink[1], ink[2]); face(metaPx(px));
      text(stampOf(o.date), col.x, y + metaPx(px));
      fill(0); face(px);
      let yy = y + metaPx(px) * 1.9 + px * 0.82;
      for (const ln of OTD.wrap(o.title, col.w)) { text(ln, col.x, yy); yy += px * 1.02; }
      pop();
      return y + rowH(o, px);
    };

    // ---- the frame each register puts round it ----
    if (reg === "A") A.panel(r.x, r.y, r.w, r.h, "SPONSORED", ink);
    const winD = reg === "D" ? D.win(r.x, r.y, r.w, r.h, ink, `${data.dateWords} · ${count}`) : null;

    // ---- the head ----
    if (reg !== "D") {
      push(); noStroke(); fill(0); face(15); S.tracked(OTD.caps(count), col.x, r.y + 44, 1.8); pop();
      S.rule(col.x, r.y + 58, col.w, reg === "A" ? 2 : 1);
    }

    // ---- the rows ----
    let y = reg === "D" ? r.y + 62 : top;
    rows.forEach((o, i) => {
      if (reg === "B") { push(); noStroke(); fill(0); S.arial(12); text(String(i + 1), col.x - 26, y + metaPx(px)); pop(); }
      const next = drawRow(y, o);
      if (reg !== "B" && i < rows.length - 1) {
        push(); stroke(reg === "A" ? 0 : color(ink[0], ink[1], ink[2], 120)); strokeWeight(1);
        line(col.x, next - px * 0.24, col.x + col.w, next - px * 0.24); pop();
      }
      y = next;
    });

    // ---- where to read them ----
    const fy = r.y + r.h - footH + (reg === "B" ? 28 : 12);
    if (reg === "A") {
      const c = A.panel(col.x, fy, col.w, 86, "SPONSORED", ink);
      push(); noStroke(); fill(ink[0], ink[1], ink[2]); S.arialB(26); text(url, c.x, c.y + 22);
      fill(0); S.arialB(19); S.tracked("LINK IN BIO", c.x, c.y + 54, 2); pop();
    } else if (reg === "B") {
      B.inkCard(col.x, fy, Math.min(col.w, 440), 118, url, "link in bio", ink);
    } else {
      const f = D.win(col.x, fy, col.w, 88, ink);
      push(); noStroke(); fill(ink[0], ink[1], ink[2]); S.arial(25); text(url, f.x + 16, f.y + 24);
      fill(0); S.arial(19); S.tracked("LINK IN BIO", f.x + 16, f.y + 52, 2); pop();
    }
  },
};

window.CARDS = CARDS;
