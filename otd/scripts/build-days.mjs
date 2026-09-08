#!/usr/bin/env node
// Reads crackunit's exported posts, groups them by MM-DD (from the `permalink`
// frontmatter, never the filename — see CLAUDE.md), and writes one JSON per
// day plus an index. Plain Node ESM, no dependencies.
//
// Usage: node build-days.mjs   (run with cwd = otd/, or set CRACKUNIT_DIR)

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SCRIPT_DIR = import.meta.dirname;
const OTD_DIR = path.resolve(SCRIPT_DIR, "..");
const CRACKUNIT_DIR = path.resolve(process.cwd(), process.env.CRACKUNIT_DIR || "..");
const POSTS_DIR = path.join(CRACKUNIT_DIR, "export/posts");
const DATA_DIR = path.join(OTD_DIR, "data");
const DAYS_DIR = path.join(DATA_DIR, "days");

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

async function ensureFile(file, initialContent) {
  if (!existsSync(file)) {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(initialContent, null, 2) + "\n");
  }
}

const pad2 = (n) => String(n).padStart(2, "0");

// Reuse of src/lib/posts.ts's permalinkParts: regex + decode rule.
const PERMALINK_RE = /^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/$/;

function normalizeApostrophe(s) {
  return s.replace(/[‘’]/g, "'");
}

// A tiny seeded LCG so a given MM-DD always produces the same ordering.
function makeRng(seedStr) {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  if (seed === 0) seed = 1;
  return function rng() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function seededShuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------------------------------------------------------------------------
// Frontmatter parsing
//
// export-wp.mjs writes every frontmatter value as a JSON literal on its own
// line (JSON.stringify for strings, bare for numbers/booleans, JSON arrays
// for arrays) — so JSON.parse per line is exact, no YAML library needed.
// ---------------------------------------------------------------------------

function parseFrontmatter(raw, filename) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${filename}: no frontmatter block found`);
  const [, fm, body] = m;
  const data = {};
  for (const line of fm.split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const valueRaw = line.slice(idx + 1).trim();
    try {
      data[key] = JSON.parse(valueRaw);
    } catch (e) {
      throw new Error(`${filename}: could not parse frontmatter line "${line}": ${e.message}`);
    }
  }
  return { data, body: body.replace(/\n+$/, "") };
}

// ---------------------------------------------------------------------------
// Image resolution
// ---------------------------------------------------------------------------

const FRIENDLY_HOST = {
  "img.skitch.com": "Skitch",
  "i92.photobucket.com": "Photobucket",
  "blip.tv": "Blip.tv",
  "static.slideshare.net": "SlideShare",
  "posterous.com": "Posterous",
  "ziki.com": "Ziki",
  "netvibes.com": "Netvibes",
  "counters.gigya.com": "Gigya",
  "feeds.feedburner.com": "FeedBurner",
  "blogshares.com": "BlogShares",
  "blog.zopa.com": "Zopa",
  "www.zopa.com": "Zopa",
  "www.gifbin.com": "GifBin",
};
function friendlyHost(host) {
  return FRIENDLY_HOST[host] || host;
}

function extractFirstImageSrc(body) {
  const m = body.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  return m ? m[1] : null;
}

function resolveImage(src, ctx) {
  if (!src) return null;
  const img = { src };
  if (src.startsWith("/")) {
    // Site-relative — the WordPress media path, possibly percent-encoded.
    // Decode before touching the filesystem (CLAUDE.md: "decode URL paths
    // before writing/reading media").
    const decodedPath = decodeURIComponent(src);
    const diskPath = path.join(CRACKUNIT_DIR, "public", decodedPath);
    img.exists = existsSync(diskPath);
    const rescuedMatch = src.match(/^\/wp-content\/rescued\/([^/]+)\//);
    if (rescuedMatch) {
      img.state = "rescued";
      img.rescuedHost = rescuedMatch[1];
    } else {
      img.state = "local";
      if (!ctx.mediaPathsSet.has(src) && !img.exists) {
        ctx.surprises.localNotInMediaPaths.push(src);
      }
    }
  } else {
    img.remote = true;
    if (ctx.unrecoverableSet.has(src)) {
      img.state = "dead";
      const inner = src.replace(/^https?:\/\/i\d\.wp\.com\//, "");
      const rawHost = inner.split("/")[0];
      img.deadHost = friendlyHost(rawHost);
      img.exists = false;
    } else {
      img.state = "remote";
      img.exists = true; // not proxied through Jetpack's dead CDN; assumed live
    }
  }
  return img;
}

// ---------------------------------------------------------------------------
// Video extraction
// ---------------------------------------------------------------------------

function extractVideo(body) {
  const m = body.match(/<iframe[^>]*\ssrc="([^"]+)"/i);
  if (!m) return null;
  const src = m[1].replace(/&amp;/g, "&");
  let host = "";
  try {
    host = new URL(src).hostname;
  } catch {
    /* malformed src, fall through to "other" */
  }
  if (/(^|\.)youtube\.com$/.test(host)) {
    const idm = src.match(/\/embed\/([^/?"&]+)/);
    const id = idm ? idm[1] : null;
    return { kind: "youtube", id, thumbnail: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null };
  }
  if (/(^|\.)vimeo\.com$/.test(host)) {
    const idm = src.match(/\/video\/(\d+)/);
    return { kind: "vimeo", id: idm ? idm[1] : null, thumbnail: null };
  }
  if (/(^|\.)soundcloud\.com$/.test(host)) {
    const um = src.match(/[?&]url=([^&]+)/);
    let id = null;
    if (um) {
      const decoded = decodeURIComponent(um[1]);
      const parts = decoded.split("/").filter(Boolean);
      id = parts[parts.length - 1] || null;
    }
    return { kind: "soundcloud", id, thumbnail: null };
  }
  if (/(^|\.)dailymotion\.com$/.test(host)) {
    const idm = src.match(/\/embed\/video\/([^/?"&]+)/);
    return { kind: "dailymotion", id: idm ? idm[1] : null, thumbnail: null };
  }
  return { kind: "other", id: null, thumbnail: null };
}

// ---------------------------------------------------------------------------
// Plain text + sentence splitting
// ---------------------------------------------------------------------------

const STRIP_LINES = new Set(
  [
    "Posted via web from crackunit's posterous",
    "Posted via email from crackunit's posterous",
  ].map(normalizeApostrophe)
);

function toPlainText(rawBody) {
  let s = rawBody;
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, ""); // strip images entirely
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1"); // links keep their text
  s = s.replace(/<[^>]+>/g, ""); // strip remaining HTML tags (iframes etc.)
  s = s.replace(/\\([*_~`])/g, "$1"); // unescape markdown escapes
  s = s.replace(/(\*\*|\*\*|__|_|~~|\*)/g, ""); // strip emphasis markers
  const lines = s.split("\n").map((l) => l.trim());
  const kept = [];
  for (const line of lines) {
    if (!line) continue;
    const norm = normalizeApostrophe(line);
    if (STRIP_LINES.has(norm)) continue;
    if (/^via\s+\S+$/i.test(line)) continue;
    kept.push(line);
  }
  return kept.join(" ").replace(/[ \t]+/g, " ").trim();
}

function isUrlOnly(s) {
  return /^(https?:\/\/|www\.)\S+$/i.test(s.trim());
}

function splitSentences(text) {
  if (!text) return [];
  const norm = text.replace(/\.\.\.+/g, "…"); // collapse "..." to a single ellipsis char
  const re = /[^.!?…]+[.!?…]+(?:["'”’])?/g;
  const out = [];
  let m;
  let last = 0;
  while ((m = re.exec(norm))) {
    out.push(m[0].trim());
    last = re.lastIndex;
  }
  const rest = norm.slice(last).trim();
  if (rest) out.push(rest);
  return out.filter(Boolean).filter((s) => !isUrlOnly(s));
}

// ---------------------------------------------------------------------------
// Load one post
// ---------------------------------------------------------------------------

function loadPost(filename, raw, ctx) {
  const { data, body } = parseFrontmatter(raw, filename);
  const permalinkMatch = data.permalink && data.permalink.match(PERMALINK_RE);
  if (!permalinkMatch) {
    ctx.surprises.badPermalink.push({ filename, permalink: data.permalink });
    return null;
  }
  const [, yyyy, mm, dd] = permalinkMatch;
  const mmdd = `${mm}-${dd}`;

  const imgSrc = data.featuredImage || extractFirstImageSrc(body);
  const image = resolveImage(imgSrc, ctx);
  const video = extractVideo(body);
  const bodyText = toPlainText(body);
  const sentences = splitSentences(bodyText);
  if (sentences.length === 0 && bodyText.length > 0) {
    ctx.surprises.noSentences.push(data.permalink);
  }
  const hasFlash = /<object[\s>]/i.test(body) || /\.swf\b/i.test(body);

  return {
    title: data.title,
    permalink: data.permalink,
    url: `https://www.crackunit.com${data.permalink}`,
    date: data.date,
    year: Number(yyyy),
    slug: data.slug,
    wpId: data.wpId,
    excerpt: data.excerpt || "",
    categories: data.categories || [],
    tags: data.tags || [],
    format: data.format,
    image,
    video,
    bodyText,
    bodyHtml: body,
    bodyChars: bodyText.length,
    sentences,
    _hasFlash: hasFlash, // internal, stripped before writing to disk
    _mmdd: mmdd,
  };
}

// ---------------------------------------------------------------------------
// Hero scoring (PLAN.md, Part 5 / Phase C)
// ---------------------------------------------------------------------------

function scorePost(p) {
  let score = 0;
  if (p.image && p.image.exists) score += 3; // "local image" — physically present now, local or rescued
  if (p.video) score += 2;
  if (p.categories.some((c) => c !== "Uncategorized")) score += 1;
  if (p.tags.length > 0) score += 1;
  return score;
}

function pickHero(posts, override) {
  if (override) {
    const idx = posts.findIndex((p) => p.permalink === override);
    if (idx !== -1) return idx;
    // Override points at a permalink not in this day's posts — fall through
    // to scoring rather than crash, but this is worth surfacing.
  }
  let bestIdx = 0;
  let bestScore = -Infinity;
  let bestChars = -1;
  posts.forEach((p, i) => {
    const s = scorePost(p);
    if (s > bestScore || (s === bestScore && p.bodyChars > bestChars)) {
      bestScore = s;
      bestChars = p.bodyChars;
      bestIdx = i;
    }
  });
  return bestIdx;
}

// ---------------------------------------------------------------------------
// Copy derivation (ART-DIRECTION.md section 12)
// ---------------------------------------------------------------------------

function deriveDialogFrom(posts) {
  const out = [];
  for (const p of posts) {
    const exclam = p.sentences.find((s) => /^[A-Za-z']+!$/.test(s.trim()));
    for (const s of p.sentences) {
      const t = s.trim();
      if (t.length < 12 || t.length > 90) continue;
      if (!/[.?!…]$/.test(t)) continue;
      let button = "OK";
      if (exclam) button = exclam.trim();
      else if (t.endsWith("?")) button = ["Yes", "No"];
      out.push({ text: t, button, from: p.permalink });
    }
  }
  return out;
}

function deriveSearchFrom(posts) {
  return posts.map((p) => p.title.toLowerCase());
}

function deriveSubjectFrom(posts) {
  return posts.map((p) => p.title);
}

function deriveNotepadFrom(hero, posts, includeHeroExcerpt) {
  const out = [];
  if (includeHeroExcerpt && hero.excerpt) out.push(hero.excerpt);
  for (const p of posts) {
    if (p.bodyChars > 0 && p.bodyChars < 200) out.push(p.bodyText);
  }
  return out;
}

function deriveErrorsFrom(posts) {
  const out = [];
  for (const p of posts) {
    if (p.image && p.image.state === "dead") {
      out.push(`This image was on ${p.image.deadHost}. ${p.image.deadHost} is gone.`);
    } else if (p.image && p.image.state === "rescued") {
      out.push(`This image was on ${p.image.rescuedHost}. Rescued from the Wayback Machine.`);
    }
    if (p._hasFlash) {
      out.push("This was a Flash embed. Flash took it.");
    }
  }
  return [...new Set(out)];
}

function deriveTag(posts) {
  const set = new Set();
  for (const p of posts) {
    for (const t of [...p.categories, ...p.tags]) {
      if (t === "Uncategorized") continue;
      set.add(t);
    }
  }
  return [...set].sort((a, b) => a.length - b.length || a.localeCompare(b));
}

function deriveTile(posts, hero) {
  const exclamations = [];
  for (const p of posts) {
    for (const s of p.sentences) {
      const t = s.trim();
      if (t.endsWith("!")) exclamations.push(t);
    }
  }
  if (exclamations.length) {
    exclamations.sort((a, b) => a.length - b.length);
    const shortest = exclamations[0];
    const words = shortest
      .split(/\s+/)
      .filter((w) => (w.match(/[A-Za-z]/g) || []).length >= 3);
    if (words.length) {
      words.sort((a, b) => a.length - b.length);
      return words[0];
    }
    return shortest;
  }
  if (hero.tags.length) return hero.tags[0];
  return (hero.title || "").split(/\s+/)[0] || "";
}

function deriveStatus(hero) {
  const status = [
    hero.permalink,
    hero.date,
    `Post ID ${hero.wpId}`,
    hero.categories.filter((c) => c !== "Uncategorized").join(", "),
  ];
  const norm = normalizeApostrophe(hero.bodyHtml);
  for (const line of STRIP_LINES) {
    if (norm.includes(line)) {
      status.push(
        hero.bodyHtml.includes("Posted via email")
          ? "Posted via email from crackunit's posterous"
          : "Posted via web from crackunit's posterous"
      );
      break;
    }
  }
  return status;
}

function neighborMmdd(mmdd) {
  const [mm, dd] = mmdd.split("-").map(Number);
  const year = mm === 2 && dd === 29 ? 2000 : 2021; // a leap year only for 02-29
  const d = new Date(Date.UTC(year, mm - 1, dd));
  const fmt = (dt) => `${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
  const prev = new Date(d);
  prev.setUTCDate(d.getUTCDate() - 1);
  const next = new Date(d);
  next.setUTCDate(d.getUTCDate() + 1);
  return [fmt(prev), fmt(next)];
}

function buildCopy(mmdd, hero, allDayPosts, rng, byDay) {
  const nonHero = seededShuffle(
    allDayPosts.filter((p) => p.permalink !== hero.permalink),
    rng
  );
  const singlePostDay = nonHero.length === 0;

  let dialog = deriveDialogFrom(nonHero);
  let search = deriveSearchFrom(nonHero);
  let subject = deriveSubjectFrom(nonHero);
  let notepad = deriveNotepadFrom(hero, nonHero, true);

  if (singlePostDay) {
    // Single-post day: quote the hero's own other sentences.
    if (dialog.length === 0) dialog = deriveDialogFrom([hero]);
  }

  let borrowed = false;
  if (dialog.length === 0 || search.length === 0 || subject.length === 0 || notepad.length === 0) {
    const [prevMmdd, nextMmdd] = neighborMmdd(mmdd);
    const neighborPosts = [
      ...(byDay.get(prevMmdd) || []),
      ...(byDay.get(nextMmdd) || []),
    ];
    if (neighborPosts.length) {
      if (dialog.length === 0) {
        const d = deriveDialogFrom(neighborPosts);
        if (d.length) {
          dialog = d;
          borrowed = true;
        }
      }
      if (search.length === 0) {
        const s = deriveSearchFrom(neighborPosts);
        if (s.length) {
          search = s;
          borrowed = true;
        }
      }
      if (subject.length === 0) {
        const s = deriveSubjectFrom(neighborPosts);
        if (s.length) {
          subject = s;
          borrowed = true;
        }
      }
      if (notepad.length === 0) {
        const n = deriveNotepadFrom(hero, neighborPosts, false);
        if (n.length) {
          notepad = n;
          borrowed = true;
        }
      }
    }
  }

  const copy = {
    dialog,
    search,
    error: deriveErrorsFrom(allDayPosts),
    notepad,
    subject,
    tag: deriveTag(allDayPosts),
    tile: deriveTile(allDayPosts, hero),
    status: deriveStatus(hero),
  };
  if (borrowed) copy.borrowed = true;
  return copy;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`crackunit dir: ${CRACKUNIT_DIR}`);
  console.log(`posts dir:     ${POSTS_DIR}`);
  console.log(`data dir:      ${DATA_DIR}`);

  const unrecoverableSet = new Set(await readJson(path.join(CRACKUNIT_DIR, "export/unrecoverable.json")));
  const mediaPathsSet = new Set(await readJson(path.join(CRACKUNIT_DIR, "export/media-paths.json")));

  const heroOverridesFile = path.join(DATA_DIR, "hero-overrides.json");
  const copyOverridesFile = path.join(DATA_DIR, "copy-overrides.json");
  await ensureFile(heroOverridesFile, {});
  await ensureFile(copyOverridesFile, {});
  const heroOverrides = await readJson(heroOverridesFile, {});
  const copyOverrides = await readJson(copyOverridesFile, {});

  const surprises = {
    badPermalink: [],
    noSentences: [],
    localNotInMediaPaths: [],
  };
  const ctx = { unrecoverableSet, mediaPathsSet, surprises };

  const filenames = (await readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  const byDay = new Map(); // "MM-DD" -> Post[]
  let loaded = 0;
  for (const filename of filenames) {
    const raw = await readFile(path.join(POSTS_DIR, filename), "utf8");
    const post = loadPost(filename, raw, ctx);
    if (!post) continue;
    loaded++;
    if (!byDay.has(post._mmdd)) byDay.set(post._mmdd, []);
    byDay.get(post._mmdd).push(post);
  }
  // Chronological order within a day (year ascending) for a readable record.
  for (const posts of byDay.values()) {
    posts.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  await mkdir(DAYS_DIR, { recursive: true });

  const indexEntries = [];
  let daysWithPosts = 0;

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(2000, month, 0).getDate(); // 2000 is a leap year -> Feb has 29
    for (let day = 1; day <= daysInMonth; day++) {
      const mmdd = `${pad2(month)}-${pad2(day)}`;
      const posts = byDay.get(mmdd) || [];
      if (posts.length === 0) {
        await writeFile(
          path.join(DAYS_DIR, `${mmdd}.json`),
          JSON.stringify({ day: mmdd, empty: true, posts: [] }, null, 2) + "\n"
        );
        indexEntries.push({ day: mmdd, postCount: 0, hero: null });
        continue;
      }
      daysWithPosts++;
      const heroIndex = pickHero(posts, heroOverrides[mmdd]);
      const hero = posts[heroIndex];
      const rng = makeRng(mmdd);
      let copy = buildCopy(mmdd, hero, posts, rng, byDay);
      if (copyOverrides[mmdd]) {
        copy = { ...copy, ...copyOverrides[mmdd] };
      }

      const dayObj = {
        day: mmdd,
        empty: false,
        posts: posts.map(({ _hasFlash, _mmdd, ...rest }) => rest),
        hero: hero.permalink,
        heroIndex,
        line: "",
        copy,
      };
      await writeFile(path.join(DAYS_DIR, `${mmdd}.json`), JSON.stringify(dayObj, null, 2) + "\n");
      indexEntries.push({
        day: mmdd,
        postCount: posts.length,
        hero: { title: hero.title, year: hero.year, image: hero.image, video: hero.video },
      });
    }
  }

  await writeFile(path.join(DATA_DIR, "index.json"), JSON.stringify(indexEntries, null, 2) + "\n");

  console.log(`\nposts loaded       : ${loaded}`);
  console.log(`days with posts    : ${daysWithPosts}`);
  console.log(`days total written : ${indexEntries.length}`);
  if (surprises.badPermalink.length) {
    console.log(`\n! ${surprises.badPermalink.length} post(s) with unparseable permalink, skipped:`);
    for (const s of surprises.badPermalink.slice(0, 10)) console.log(`    ${s.filename}: ${s.permalink}`);
  }
  if (surprises.noSentences.length) {
    console.log(`\n! ${surprises.noSentences.length} post(s) with body text but zero sentences after splitting:`);
    for (const p of surprises.noSentences.slice(0, 10)) console.log(`    ${p}`);
  }
  if (surprises.localNotInMediaPaths.length) {
    console.log(
      `\n! ${surprises.localNotInMediaPaths.length} local image path(s) missing on disk and absent from media-paths.json:`
    );
    for (const p of surprises.localNotInMediaPaths.slice(0, 10)) console.log(`    ${p}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
