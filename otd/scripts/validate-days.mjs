#!/usr/bin/env node
// Validates otd/data/days/*.json against crackunit's own record of what it
// published. Plain Node ESM, no dependencies.
//
// - every day file parses as JSON
// - every post permalink appears in crackunit's export/live-urls.json
//   (compared as stored strings — CLAUDE.md: never encodeURI a URL from
//   live-urls.json, it is already encoded)
// - every image.exists: true path exists on disk

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const SCRIPT_DIR = import.meta.dirname;
const OTD_DIR = path.resolve(SCRIPT_DIR, "..");
const CRACKUNIT_DIR = path.resolve(process.cwd(), process.env.CRACKUNIT_DIR || "..");
const DAYS_DIR = path.join(OTD_DIR, "data/days");

async function main() {
  const liveUrls = new Set(JSON.parse(await readFile(path.join(CRACKUNIT_DIR, "export/live-urls.json"), "utf8")));

  const files = (await readdir(DAYS_DIR)).filter((f) => f.endsWith(".json"));
  let daysChecked = 0;
  let postsChecked = 0;
  let daysWithPosts = 0;
  const parseErrors = [];
  const missingUrls = [];
  const missingImages = [];

  for (const file of files) {
    daysChecked++;
    let day;
    const raw = await readFile(path.join(DAYS_DIR, file), "utf8");
    try {
      day = JSON.parse(raw);
    } catch (e) {
      parseErrors.push({ file, error: e.message });
      continue;
    }
    if (day.empty) continue;
    daysWithPosts++;
    for (const post of day.posts) {
      postsChecked++;
      if (!liveUrls.has(post.url)) {
        missingUrls.push({ day: day.day, permalink: post.permalink, url: post.url });
      }
      if (post.image && post.image.exists === true && post.image.src && post.image.src.startsWith("/")) {
        const diskPath = path.join(CRACKUNIT_DIR, "public", decodeURIComponent(post.image.src));
        if (!existsSync(diskPath)) {
          missingImages.push({ day: day.day, permalink: post.permalink, src: post.image.src });
        }
      }
    }
  }

  console.log(`day files checked   : ${daysChecked}`);
  console.log(`days with posts     : ${daysWithPosts}`);
  console.log(`posts checked       : ${postsChecked}`);
  console.log(`parse errors        : ${parseErrors.length}`);
  console.log(`permalinks not live : ${missingUrls.length}`);
  console.log(`images.exists lying : ${missingImages.length}`);

  let ok = true;
  if (parseErrors.length) {
    ok = false;
    console.log("\n! JSON parse errors:");
    for (const e of parseErrors.slice(0, 10)) console.log(`    ${e.file}: ${e.error}`);
  }
  if (missingUrls.length) {
    ok = false;
    console.log("\n! Permalinks not found in live-urls.json:");
    for (const m of missingUrls.slice(0, 10)) console.log(`    ${m.day}  ${m.url}`);
    if (missingUrls.length > 10) console.log(`    ...and ${missingUrls.length - 10} more`);
  }
  if (missingImages.length) {
    ok = false;
    console.log("\n! image.exists:true but not on disk:");
    for (const m of missingImages.slice(0, 10)) console.log(`    ${m.day}  ${m.src}`);
    if (missingImages.length > 10) console.log(`    ...and ${missingImages.length - 10} more`);
  }

  if (ok) {
    console.log("\nAll checks passed.");
  } else {
    console.log("\nVALIDATION FAILED.");
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
