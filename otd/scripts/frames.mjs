#!/usr/bin/env node
// Grab frames and metadata from every video embedded in a day's posts.
//
//   node scripts/frames.mjs 11-09            # all videos that day
//   node scripts/frames.mjs 11-09 --ids 1odEmDYg4Y4   # just these
//   node scripts/frames.mjs 11-09 --even 12 --scene 24 --height 480
//
// Needs yt-dlp and ffmpeg on PATH (brew install yt-dlp ffmpeg). Written for the
// Mac; the cloud container cannot reach YouTube. UNTESTED at the time of writing:
// run it on one day and fix what breaks before trusting it.
//
// Output, per video: otd/captures/MM-DD/<slug>/video/<id>/
//   meta.json          yt-dlp -j, trimmed to the fields we use
//   thumb.jpg          the platform thumbnail
//   even/f-01-0m07s.jpg … evenly spaced frames, timecode in the name
//   scene/f-01-0m03s.jpg … scene-change frames (ffmpeg scene score > 0.3), capped
//   unavailable.txt    when yt-dlp fails: its error text, verbatim (a fragment too)
// and a manifest.json listing everything with timecodes in seconds.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const otd = join(here, "..");
const args = process.argv.slice(2);
const day = args.find((a) => /^\d\d-\d\d$/.test(a));
if (!day) { console.error("usage: frames.mjs MM-DD [--ids a,b] [--even 12] [--scene 24] [--height 480]"); process.exit(2); }
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i === -1 ? d : args[i + 1]; };
const onlyIds = opt("ids", "") ? opt("ids", "").split(",") : null;
const EVEN = Number(opt("even", 12));
const SCENE = Number(opt("scene", 24));
const HEIGHT = Number(opt("height", 480));

for (const tool of ["yt-dlp", "ffmpeg", "ffprobe"]) {
  if (spawnSync("which", [tool]).status !== 0) { console.error(`${tool} not on PATH (brew install yt-dlp ffmpeg)`); process.exit(1); }
}

const d = JSON.parse(readFileSync(join(otd, "data", "days", `${day}.json`), "utf8"));
const videos = (d.posts || []).filter((p) => p.video && (!onlyIds || onlyIds.includes(p.video.id)));
if (videos.length === 0) { console.log(`${day}: no videos${onlyIds ? " matching --ids" : ""}`); process.exit(0); }

const tc = (s) => { const m = Math.floor(s / 60), r = Math.round(s - m * 60); return `${m}m${String(r).padStart(2, "0")}s`; };
const urlFor = (v) => v.kind === "youtube" ? `https://www.youtube.com/watch?v=${v.id}`
  : v.kind === "vimeo" ? `https://vimeo.com/${v.id}` : v.kind === "dailymotion" ? `https://www.dailymotion.com/video/${v.id}` : null;

for (const p of videos) {
  const v = p.video; const url = urlFor(v);
  const dir = join(otd, "captures", day, p.slug, "video", v.id);
  mkdirSync(join(dir, "even"), { recursive: true }); mkdirSync(join(dir, "scene"), { recursive: true });
  const manifest = { id: v.id, kind: v.kind, url, post: p.permalink, frames: [] };
  if (!url) { writeFileSync(join(dir, "unavailable.txt"), `no fetch rule for kind ${v.kind}\n`); continue; }
  console.log(`\n${p.year} ${p.title}  ${url}`);

  // metadata
  let meta = null;
  try {
    const j = JSON.parse(execFileSync("yt-dlp", ["-j", "--no-warnings", url], { encoding: "utf8", maxBuffer: 64 << 20 }));
    meta = { id: j.id, title: j.title, uploader: j.uploader, channel: j.channel, upload_date: j.upload_date, duration: j.duration,
      view_count: j.view_count, like_count: j.like_count, width: j.width, height: j.height, fps: j.fps, thumbnail: j.thumbnail, webpage_url: j.webpage_url };
    writeFileSync(join(dir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");
    console.log(`  ${meta.title} · ${meta.uploader} · ${meta.duration}s · ${meta.view_count} views · uploaded ${meta.upload_date}`);
  } catch (e) {
    const msg = (e.stderr || e.message || String(e)).toString().trim();
    writeFileSync(join(dir, "unavailable.txt"), msg + "\n");
    manifest.unavailable = msg.split("\n").pop();
    writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
    console.log(`  unavailable: ${manifest.unavailable}`);
    continue;
  }

  // thumbnail
  try { execFileSync("yt-dlp", ["--no-warnings", "--skip-download", "--write-thumbnail", "--convert-thumbnails", "jpg", "-o", join(dir, "thumb"), url], { stdio: "ignore" }); } catch {}

  // download a small copy
  const tmp = join(dir, "source.mp4");
  if (!existsSync(tmp)) {
    try {
      execFileSync("yt-dlp", ["--no-warnings", "-f", `bv*[height<=${HEIGHT}]+ba/b[height<=${HEIGHT}]/b`, "--merge-output-format", "mp4", "-o", tmp, url], { stdio: "inherit" });
    } catch (e) { console.log("  download failed; frames skipped"); continue; }
  }
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", tmp], { encoding: "utf8" }).trim()) || meta.duration || 0;

  // evenly spaced frames
  for (let i = 0; i < EVEN; i++) {
    const t = ((i + 0.5) / EVEN) * dur;
    const f = `f-${String(i + 1).padStart(2, "0")}-${tc(t)}.jpg`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(t.toFixed(3)), "-i", tmp, "-frames:v", "1", "-q:v", "2", join(dir, "even", f)]);
    manifest.frames.push({ kind: "even", file: `even/${f}`, t: Number(t.toFixed(3)) });
  }
  // scene-change frames, with timestamps from showinfo
  const r = spawnSync("ffmpeg", ["-v", "info", "-y", "-i", tmp, "-vf", "select='gt(scene,0.3)',showinfo", "-vsync", "vfr", "-frames:v", String(SCENE), "-q:v", "2", join(dir, "scene", "s-%02d.jpg")], { encoding: "utf8" });
  const times = [...(r.stderr || "").matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1]));
  const sceneFiles = readdirSync(join(dir, "scene")).filter((f) => f.startsWith("s-")).sort();
  sceneFiles.forEach((f, i) => {
    const t = times[i] ?? null; const nf = t == null ? f : `f-${String(i + 1).padStart(2, "0")}-${tc(t)}.jpg`;
    if (nf !== f) { execFileSync("mv", [join(dir, "scene", f), join(dir, "scene", nf)]); }
    manifest.frames.push({ kind: "scene", file: `scene/${nf}`, t });
  });
  rmSync(tmp, { force: true });
  manifest.duration = dur; manifest.meta = meta;
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`  ${EVEN} even + ${sceneFiles.length} scene frames → ${dir}`);
}
