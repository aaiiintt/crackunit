#!/usr/bin/env node
// Write the upload checklist for one or more days: otd/out/checklist/MM-DD.md
//   node scripts/checklist.mjs 09-08 09-09
// Reads data/days, data/lines.json, data/charts.json and public/giphy/manifest.json.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const otd = join(here, "..");
const read = (p) => JSON.parse(readFileSync(join(otd, p), "utf8"));
const lines = read("data/lines.json");
const charts = read("data/charts.json");
const giphy = existsSync(join(otd, "public/giphy/manifest.json")) ? read("public/giphy/manifest.json") : null;
const days = process.argv.slice(2).filter((d) => /^\d\d-\d\d$/.test(d));
if (days.length === 0) { console.error("usage: checklist.mjs MM-DD..."); process.exit(2); }
mkdirSync(join(otd, "out", "checklist"), { recursive: true });

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
for (const day of days) {
  const d = read(`data/days/${day}.json`);
  const pick = lines[day];
  if (!pick || d.empty) { console.error(`${day}: no picks or empty day`); continue; }
  const hero = d.posts.find((p) => p.permalink === d.hero) || d.posts[d.heroIndex] || d.posts[0];
  const [mm, dd] = day.split("-").map(Number);
  const dateText = `${dd} ${monthNames[mm - 1]}`;
  const wk = charts._dayToWeek?.[day];
  const c = wk ? charts[wk] : null;
  const usedGiphy = (pick.assets || []).some((a) => /^giphy\//.test(a)) && giphy;
  const caption = [
    `“${pick.line}”`,
    `${dateText} ${hero.year}. From the crackunit archive, one day at a time.`,
    `Every post from this date, all years: link in bio.`,
    usedGiphy ? `Powered by GIPHY` : null,
  ].filter(Boolean).join("\n\n");

  const md = `# Upload checklist, ${day} (${dateText})

Hero: **${hero.title}** (${hero.year}) · ${hero.url}
Line: ${pick.line}
Hook ${pick.hook} · archetype ${pick.archetype}

## Files
- Video: \`otd/out/video/${day}.mp4\` (1080×1920, 60 fps, H.264)
- Cover: \`otd/out/cover/${day}.png\`
- Day page: https://otd.crackunit.com/${day}/

## Instagram (Creator account)
- [ ] Upload the MP4 as a Reel
- [ ] Cover: upload \`${day}.png\` (the profile grid crops to 4:5; date and line are inside it)
- [ ] Music: search the library for **${c?.pick ? `${c.pick.title}, ${c.pick.artist}` : "(no track picked)"}**${c?.pickAlt ? `; if missing, ${c.pickAlt.title}, ${c.pickAlt.artist}` : ""}${c && !c.verified ? " (chart week unverified; confirm on officialcharts.com)" : ""}
- [ ] Mix: original audio on (the SFX bed is at −6 dB), track over it
- [ ] Caption (below), no hashtags
- [ ] Bio link → https://otd.crackunit.com/${day}/
- [ ] Post, then note the time in \`data/performance.json\`

## TikTok
- [ ] Same MP4, same cover
- [ ] Music: same search; if unavailable, post with original audio only and note it
- [ ] Caption (below)

## Caption
${caption}

## After posting
- [ ] 48 h: views, likes, shares, saves, average watch, profile taps, link clicks → \`data/performance.json[${day}].ig.h48\`
- [ ] 7 d: same → \`.d7\`
- [ ] One line of notes: what stopped thumbs, what didn't

## Every post from this date (for the day page check)
${d.posts.map((p) => `- ${p.year} · ${p.title} · ${p.url}`).join("\n")}
`;
  writeFileSync(join(otd, "out", "checklist", `${day}.md`), md);
  console.log(`checklist ${day} → out/checklist/${day}.md`);
}
