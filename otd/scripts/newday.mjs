#!/usr/bin/env node
// One day, end to end. Runs the capture chain and renders the carousel, then
// says what is still missing so the next step is obvious.
//
//   node scripts/newday.mjs 11-12              # capture, then render 3 seeds per slide
//   node scripts/newday.mjs 11-12 --final      # render the picked seeds into otd/out/carousel/
//   node scripts/newday.mjs 11-12 --skip-capture
//
// It never invents anything: the line, the hero and the picks are Iain's, in
// data/lines.json, and it stops and asks for them when they are not there.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const otd = join(here, "..");
const args = process.argv.slice(2);
const day = args.find((a) => /^\d\d-\d\d$/.test(a));
if (!day) { console.error("usage: newday.mjs MM-DD [--final] [--skip-capture] [--seeds N]"); process.exit(2); }
const final = args.includes("--final");
const seeds = (args.indexOf("--seeds") + 1) ? args[args.indexOf("--seeds") + 1] : "3";
const run = (cmd, a) => { console.log(`\n$ ${cmd} ${a.join(" ")}`); return spawnSync(cmd, a, { stdio: "inherit", cwd: otd }); };
const node = process.execPath;

// 0 · the day
run(node, ["scripts/build-days.mjs"]);
const dayFile = join(otd, "data", "days", `${day}.json`);
if (!existsSync(dayFile)) { console.error(`${day}: no day file`); process.exit(1); }
const d = JSON.parse(readFileSync(dayFile, "utf8"));
if (d.empty || !d.posts.length) { console.log(`${day}: no posts. 26 of 366 days are empty; pick another.`); process.exit(0); }
const [mm, dd] = day.split("-");
const month = ["January","February","March","April","May","June","July","August","September","October","November","December"][Number(mm) - 1];
console.log(`\n${day} is ${Number(dd)} ${month}: ${d.posts.length} posts, ${[...new Set(d.posts.map((p) => p.year))].join(", ")}.`);

// 1 · captures
if (!args.includes("--skip-capture")) {
  if (d.posts.some((p) => p.video)) run(node, ["scripts/frames.mjs", day]);
  run(node, ["scripts/wayback-page.mjs", day]);
}

// 2 · what the day still needs from Iain
const lines = JSON.parse(readFileSync(join(otd, "data", "lines.json"), "utf8"));
const pick = lines[day];
const missing = [];
if (!pick || !pick.line) missing.push(`a line (and hero) in data/lines.json["${day}"] — read the posts first: node scripts/show-day.mjs ${day}`);
if (pick && !pick.picks && final) missing.push(`picks in data/lines.json["${day}"].picks — render the seeds first, then choose`);
if (missing.length) { console.log("\nStill needed:"); for (const m of missing) console.log(`  · ${m}`); if (!pick || !pick.line) process.exit(0); }

// 3 · render
run(node, ["lookdev/render.mjs", "--day", day, ...(final ? ["--final"] : ["--seeds", seeds])]);
console.log(final ? `\nCarousel: otd/out/carousel/${day}/` : `\nSeeds: otd/lookdev/out/contact*.png — choose one per slide into data/lines.json["${day}"].picks, then rerun with --final`);
