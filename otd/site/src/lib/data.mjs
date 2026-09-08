// Reads otd/data in place (read-only). Never write here — a sibling agent
// owns otd/data.
import fs from "node:fs";
import path from "node:path";

// Astro/Vite bundles this module into dist/.prerender/chunks at build time,
// so import.meta.url is not a stable anchor. `astro build` and `astro dev`
// both run with cwd = the site project root, so anchor there instead.
export const OTD_ROOT = path.resolve(process.cwd(), "..");
export const DATA_DIR = path.join(OTD_ROOT, "data");
export const COVER_SRC_DIR = path.join(OTD_ROOT, "out", "cover");

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

let _index;
export function readIndex() {
  if (!_index) _index = readJSON(path.join(DATA_DIR, "index.json"));
  return _index;
}

let _lines;
export function readLines() {
  if (!_lines) _lines = readJSON(path.join(DATA_DIR, "lines.json"));
  return _lines;
}


export function readDay(mmdd) {
  return readJSON(path.join(DATA_DIR, "days", `${mmdd}.json`));
}

/** Days that actually have posts, in calendar order (index.json is already MM-DD sorted). */
export function daysWithPosts() {
  return readIndex().filter((d) => d.postCount > 0);
}


/** "8 September" from an MM-DD string. */
export function readableDate(mmdd) {
  const [mm, dd] = mmdd.split("-").map(Number);
  const d = new Date(Date.UTC(2001, mm - 1, dd));
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", timeZone: "UTC" });
}

export function monthName(mm) {
  const d = new Date(Date.UTC(2001, Number(mm) - 1, 1));
  return d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
}

/** True if a post's image is a local/rescued crackunit upload worth thumbnailing. */
export function hasLocalThumb(post) {
  return Boolean(
    post.image &&
      post.image.exists &&
      typeof post.image.src === "string" &&
      post.image.src.startsWith("/wp-content/"),
  );
}

export function thumbUrl(post) {
  return `https://www.crackunit.com${post.image.src}`;
}
