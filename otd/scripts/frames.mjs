#!/usr/bin/env node
// Grab frames and metadata from every video embedded in a day's posts.
//
//   node scripts/frames.mjs 11-09                       # all videos that day
//   node scripts/frames.mjs 11-09 --ids vz7BcEfuTFc     # just these
//   node scripts/frames.mjs 11-09 --even 12 --scene 24 --height 480 --update
//
// Needs yt-dlp and ffmpeg on PATH (brew install yt-dlp ffmpeg). YouTube changes
// its player often; when downloads 403, the first fix is `yt-dlp -U` (or
// `--update` here). When the video still cannot be downloaded, the script falls
// back to YouTube's storyboard sprite sheets, which are served from i.ytimg.com
// without the player challenge, and cuts them into timecoded frames.
//
// Output, per video: otd/captures/MM-DD/<slug>/video/<id>/
//   meta.json           yt-dlp -j, trimmed to the fields we use
//   thumb.jpg           the platform thumbnail
//   even/f-01-0m07s.jpg evenly spaced frames from the video, timecode in the name
//   scene/f-01-0m03s.jpg scene-change frames (ffmpeg scene score > 0.3), capped
//   storyboard/f-01-0m02s.jpg  frames cut from the storyboard sprites (fallback)
//   unavailable.txt     when yt-dlp fails outright: its error text, verbatim
//   manifest.json       everything above with timecodes in seconds and `source`

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const otd = join(here, "..");
const args = process.argv.slice(2);
const day = args.find((a) => /^\d\d-\d\d$/.test(a));
if (!day) { console.error("usage: frames.mjs MM-DD [--ids a,b] [--even 12] [--scene 24] [--height 480] [--update]"); process.exit(2); }
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const onlyIds = opt("ids", "") ? opt("ids", "").split(",") : null;
const EVEN = Number(opt("even", 12));
const SCENE = Number(opt("scene", 24));
const HEIGHT = Number(opt("height", 480));

for (const tool of ["yt-dlp", "ffmpeg", "ffprobe"]) {
  if (spawnSync("which", [tool]).status !== 0) { console.error(`${tool} not on PATH (brew install yt-dlp ffmpeg)`); process.exit(1); }
}
if (args.includes("--update")) spawnSync("yt-dlp", ["-U"], { stdio: "inherit" });
const ytVersion = spawnSync("yt-dlp", ["--version"], { encoding: "utf8" }).stdout.trim();
console.log(`yt-dlp ${ytVersion}  (if downloads 403, try: yt-dlp -U, or brew upgrade yt-dlp)`);

const dayFile = join(otd, "data", "days", `${day}.json`);
if (!existsSync(dayFile)) {
  console.log("day JSON missing; running build-days.mjs first");
  execFileSync(process.execPath, [join(here, "build-days.mjs")], { stdio: "inherit" });
}
const d = JSON.parse(readFileSync(dayFile, "utf8"));
const videos = (d.posts || []).filter((p) => p.video && (!onlyIds || onlyIds.includes(p.video.id)));
if (videos.length === 0) { console.log(`${day}: no videos${onlyIds ? " matching --ids" : ""}`); process.exit(0); }

const tc = (s) => { const m = Math.floor(s / 60), r = Math.round(s - m * 60); return `${m}m${String(r).padStart(2, "0")}s`; };
const pad = (n) => String(n).padStart(2, "0");
const urlFor = (v) => v.kind === "youtube" ? `https://www.youtube.com/watch?v=${v.id}`
  : v.kind === "vimeo" ? `https://vimeo.com/${v.id}` : v.kind === "dailymotion" ? `https://www.dailymotion.com/video/${v.id}` : null;
const run = (cmd, a, opts = {}) => spawnSync(cmd, a, { encoding: "utf8", maxBuffer: 256 << 20, ...opts });

// Download strategies, in order. YouTube's player challenge varies by client.
const strategies = (url, out) => [
  { name: "default", a: ["-f", `b[height<=${HEIGHT}]/bv*[height<=${HEIGHT}]+ba/b`, "--merge-output-format", "mp4"] },
  { name: "ios client", a: ["--extractor-args", "youtube:player_client=ios", "-f", `b[height<=${HEIGHT}]/b`] },
  { name: "mweb client", a: ["--extractor-args", "youtube:player_client=mweb", "-f", `b[height<=${HEIGHT}]/b`] },
  { name: "android + ipv4, no cache", a: ["--extractor-args", "youtube:player_client=android", "--force-ipv4", "--rm-cache-dir", "-f", "b"] },
].map((s) => ({ ...s, a: ["--no-warnings", "--no-playlist", ...s.a, "-o", out, url] }));

function framesFromVideo(tmp, dir, manifest, meta) {
  const dur = Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", tmp]).stdout.trim()) || meta?.duration || 0;
  for (let i = 0; i < EVEN; i++) {
    const t = ((i + 0.5) / EVEN) * dur;
    const f = `f-${pad(i + 1)}-${tc(t)}.jpg`;
    run("ffmpeg", ["-v", "error", "-y", "-ss", t.toFixed(3), "-i", tmp, "-frames:v", "1", "-q:v", "2", join(dir, "even", f)]);
    manifest.frames.push({ kind: "even", file: `even/${f}`, t: Number(t.toFixed(3)) });
  }
  const r = run("ffmpeg", ["-v", "info", "-y", "-i", tmp, "-vf", "select='gt(scene,0.3)',showinfo", "-vsync", "vfr", "-frames:v", String(SCENE), "-q:v", "2", join(dir, "scene", "s-%02d.jpg")]);
  const times = [...(r.stderr || "").matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]));
  const files = readdirSync(join(dir, "scene")).filter((f) => f.startsWith("s-")).sort();
  files.forEach((f, i) => {
    const t = times[i] ?? null; const nf = t == null ? f : `f-${pad(i + 1)}-${tc(t)}.jpg`;
    if (nf !== f) run("mv", [join(dir, "scene", f), join(dir, "scene", nf)]);
    manifest.frames.push({ kind: "scene", file: `scene/${nf}`, t });
  });
  manifest.duration = dur;
  return { even: EVEN, scene: files.length };
}

// Fallback: YouTube storyboard sprites (format ids sb0/sb1/sb2). yt-dlp writes an
// .mhtml whose parts are the sprite JPEGs; each sprite is a rows×columns grid.
function framesFromStoryboard(url, dir, manifest, formats) {
  const sbs = (formats || []).filter((f) => /^sb\d/.test(f.format_id) && f.rows && f.columns).sort((a, b) => (b.width || 0) - (a.width || 0));
  if (sbs.length === 0) return 0;
  const sb = sbs[0];
  const mhtml = join(dir, "storyboard.mhtml");
  const r = run("yt-dlp", ["--no-warnings", "--no-playlist", "-f", sb.format_id, "-o", mhtml, url]);
  if (r.status !== 0 || !existsSync(mhtml)) return 0;
  const raw = readFileSync(mhtml, "latin1");
  const boundary = (raw.match(/boundary="?([^"\r\n]+)"?/) || [])[1];
  if (!boundary) return 0;
  const parts = raw.split(`--${boundary}`).filter((p) => /Content-Type:\s*image\/jpeg/i.test(p));
  mkdirSync(join(dir, "storyboard"), { recursive: true });
  const tileW = Math.round((sb.width || 0) / sb.columns) || 160, tileH = Math.round((sb.height || 0) / sb.rows) || 90;
  const fragDur = sb.fragments?.[0]?.duration || (manifest.duration && parts.length ? manifest.duration / parts.length : 0);
  const perTile = fragDur ? fragDur / (sb.rows * sb.columns) : 0;
  let n = 0;
  parts.forEach((part, pi) => {
    const body = part.split(/\r?\n\r?\n/).slice(1).join("\n\n").replace(/\s+/g, "");
    const sprite = join(dir, "storyboard", `sprite-${pad(pi + 1)}.jpg`);
    writeFileSync(sprite, Buffer.from(body, "base64"));
    for (let rI = 0; rI < sb.rows && n < SCENE; rI++) for (let cI = 0; cI < sb.columns && n < SCENE; cI++) {
      const idx = pi * sb.rows * sb.columns + rI * sb.columns + cI;
      const t = perTile ? idx * perTile : null;
      if (manifest.duration && t != null && t > manifest.duration) break;
      const f = `f-${pad(n + 1)}-${t == null ? "x" : tc(t)}.jpg`;
      const cut = run("ffmpeg", ["-v", "error", "-y", "-i", sprite, "-vf", `crop=${tileW}:${tileH}:${cI * tileW}:${rI * tileH}`, "-q:v", "2", join(dir, "storyboard", f)]);
      if (cut.status === 0 && existsSync(join(dir, "storyboard", f))) { manifest.frames.push({ kind: "storyboard", file: `storyboard/${f}`, t, tile: [tileW, tileH] }); n++; }
    }
  });
  rmSync(mhtml, { force: true });
  return n;
}

for (const p of videos) {
  const v = p.video; const url = urlFor(v);
  const dir = join(otd, "captures", day, p.slug, "video", v.id);
  for (const sub of ["even", "scene"]) mkdirSync(join(dir, sub), { recursive: true });
  const manifest = { id: v.id, kind: v.kind, url, post: p.permalink, source: "none", frames: [] };
  const save = () => writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  if (!url) { writeFileSync(join(dir, "unavailable.txt"), `no fetch rule for kind ${v.kind}\n`); manifest.unavailable = `no fetch rule for ${v.kind}`; save(); continue; }
  console.log(`\n${p.year} ${p.title}  ${url}`);

  // metadata (also carries the format list for the storyboard fallback)
  let meta = null, formats = [];
  const mj = run("yt-dlp", ["-j", "--no-warnings", "--no-playlist", url]);
  if (mj.status === 0) {
    const j = JSON.parse(mj.stdout);
    formats = j.formats || [];
    meta = { id: j.id, title: j.title, uploader: j.uploader, channel: j.channel, upload_date: j.upload_date, duration: j.duration,
      view_count: j.view_count, like_count: j.like_count, width: j.width, height: j.height, fps: j.fps, thumbnail: j.thumbnail, webpage_url: j.webpage_url };
    writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
    manifest.meta = meta; manifest.duration = j.duration || 0;
    console.log(`  ${meta.title} · ${meta.uploader} · ${meta.duration}s · ${meta.view_count} views · uploaded ${meta.upload_date}`);
  } else {
    const msg = (mj.stderr || mj.stdout || "yt-dlp failed").trim();
    writeFileSync(join(dir, "unavailable.txt"), msg + "\n");
    manifest.unavailable = msg.split("\n").filter(Boolean).pop();
    save();
    console.log(`  unavailable: ${manifest.unavailable}`);
    continue;
  }

  // thumbnail
  run("yt-dlp", ["--no-warnings", "--no-playlist", "--skip-download", "--write-thumbnail", "--convert-thumbnails", "jpg", "-o", join(dir, "thumb"), url]);
  if (existsSync(join(dir, "thumb.jpg"))) manifest.thumb = "thumb.jpg";

  // video download, several strategies
  const tmp = join(dir, "source.mp4");
  let got = existsSync(tmp) ? "existing" : null;
  if (!got) {
    for (const s of strategies(url, tmp)) {
      process.stdout.write(`  download (${s.name})… `);
      const r = run("yt-dlp", s.a);
      if (r.status === 0 && existsSync(tmp)) { got = s.name; console.log("ok"); break; }
      const err = (r.stderr || "").trim().split("\n").filter(Boolean).pop() || "failed";
      console.log(err.slice(0, 120));
      rmSync(tmp, { force: true });
    }
  }
  if (got) {
    const c = framesFromVideo(tmp, dir, manifest, meta);
    rmSync(tmp, { force: true });
    manifest.source = "video";
    console.log(`  ${c.even} even + ${c.scene} scene frames from the video → ${dir}`);
  } else {
    const n = framesFromStoryboard(url, dir, manifest, formats);
    if (n > 0) { manifest.source = "storyboard"; console.log(`  video blocked; ${n} frames cut from YouTube's storyboard sprites → ${dir}/storyboard`); }
    else { manifest.source = manifest.thumb ? "thumbnail" : "none"; console.log(`  video blocked and no storyboard; ${manifest.thumb ? "thumbnail only" : "nothing"}. Try: yt-dlp -U`); }
  }
  save();
}
