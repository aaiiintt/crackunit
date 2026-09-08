#!/usr/bin/env node
// Print one day: posts, media state, hero, editorial picks, derived copy. Usage: node scripts/show-day.mjs MM-DD
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const day = process.argv[2];
if (!/^\d\d-\d\d$/.test(day || "")) { console.error("usage: show-day.mjs MM-DD"); process.exit(2); }
const f = join(here, "..", "data", "days", `${day}.json`);
if (!existsSync(f)) { console.error(`no ${f}; run build-days.mjs`); process.exit(1); }
const d = JSON.parse(readFileSync(f, "utf8"));
const lines = JSON.parse(readFileSync(join(here, "..", "data", "lines.json"), "utf8"))[day];
const charts = JSON.parse(readFileSync(join(here, "..", "data", "charts.json"), "utf8"));
console.log(`# ${day}  ${d.empty ? "EMPTY" : d.posts.length + " posts"}`);
for (const p of d.posts || []) {
  const img = p.image ? `${p.image.state}${p.image.deadHost ? ":" + p.image.deadHost : ""}` : "no image";
  const vid = p.video ? p.video.kind : "";
  console.log(`${p.permalink === d.hero ? "★" : " "} ${p.year}  ${p.title}  [${img}${vid ? " · " + vid : ""}]  ${p.bodyChars}ch`);
  for (const s of (p.sentences || []).slice(0, 6)) console.log(`      · ${s}`);
}
if (lines) {
  console.log(`\n## picks\nline: ${lines.line}\nhook: ${lines.hook}  archetype: ${lines.archetype}\nwhy: ${lines.why}`);
  const wk = charts._dayToWeek?.[day];
  if (wk && charts[wk]?.pick) console.log(`track: ${charts[wk].pick.title}, ${charts[wk].pick.artist} (week ${wk}${charts[wk].verified ? "" : ", unverified"})`);
} else console.log("\n## picks: none yet (add to data/lines.json)");
console.log("\n## copy" + (d.copy?.borrowed ? " (borrowed from adjacent days)" : ""));
for (const [slot, v] of Object.entries(d.copy || {})) {
  if (slot === "borrowed") continue;
  const items = Array.isArray(v) ? v : [v];
  console.log(`${slot} (${items.length})`);
  for (const it of items.slice(0, 8)) console.log(`   ${typeof it === "string" ? it : `${it.text} [${it.button}]  ← ${it.from ?? ""}`}`);
}
