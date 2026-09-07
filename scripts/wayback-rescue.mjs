import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const STATE = path.join(ROOT, "export/wayback-state.json");

// Tracking pixels and dead ad/badge chrome — no value in an archive.
const JUNK = /^(counters\.gigya\.com|feeds\.feedburner\.com|blogshares\.com|ziki\.com|netvibes\.com|static\.slideshare\.net)$/;

const dead = JSON.parse(await readFile(path.join(ROOT, "export/unrecoverable.json"), "utf8"));

let state = {};
try { state = JSON.parse(await readFile(STATE, "utf8")); } catch {}

const targets = [];
for (const photonUrl of dead) {
  const inner = photonUrl.replace(/^https?:\/\/i\d\.wp\.com\//, "");
  const host = inner.split("/")[0];
  // Photon's own sizing params are not part of the original URL.
  const original = inner.replace(/[?&](w|h|resize|ssl|quality|strip|fit)=[^&]*/g, "").replace(/[?&]$/, "");
  if (JUNK.test(host)) { state[photonUrl] = { skip: "junk" }; continue; }
  if (/[\\]/.test(original)) { state[photonUrl] = { skip: "malformed" }; continue; }
  if (state[photonUrl]?.done || state[photonUrl]?.skip) continue;
  targets.push({ photonUrl, host, original });
}

console.log(`  ${targets.length} to attempt (${dead.length} dead total, ${Object.keys(state).length} already resolved/skipped)`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let found = 0, missing = 0, bytes = 0, done = 0;

async function cdx(original) {
  const u = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(original)}` +
            `&output=json&filter=statuscode:200&collapse=digest&limit=3&fl=timestamp,original`;
  for (let a = 1; a <= 4; a++) {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(45000) });
      if (r.status === 429 || r.status === 503) { await sleep(a * 8000); continue; }
      if (!r.ok) return null;
      const rows = await r.json();
      return rows.length > 1 ? rows[1] : null; // row 0 is the header
    } catch { await sleep(a * 4000); }
  }
  return null;
}

async function grab({ photonUrl, host, original }) {
  const hit = await cdx(original);
  if (!hit) { state[photonUrl] = { skip: "no-snapshot" }; missing++; return; }
  const [ts, orig] = hit;
  const rel = `/wp-content/rescued/${host}${new URL(orig.startsWith("http") ? orig : `http://${orig}`).pathname}`;
  const out = path.join(ROOT, "public", decodeURIComponent(rel));
  try { await access(out); state[photonUrl] = { done: true, rel }; found++; return; } catch {}

  // id_ returns the original bytes, without Wayback's HTML/asset rewriting.
  const snap = `https://web.archive.org/web/${ts}id_/${orig}`;
  for (let a = 1; a <= 3; a++) {
    try {
      const r = await fetch(snap, { signal: AbortSignal.timeout(60000) });
      if (r.status === 429 || r.status === 503) { await sleep(a * 8000); continue; }
      if (!r.ok) break;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 100) break; // placeholder/error body, not a real image
      await mkdir(path.dirname(out), { recursive: true });
      await writeFile(out, buf);
      bytes += buf.length; found++;
      state[photonUrl] = { done: true, rel, ts };
      return;
    } catch { await sleep(a * 3000); }
  }
  state[photonUrl] = { skip: "fetch-failed" };
  missing++;
}

const queue = [...targets];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) {
    await grab(queue.pop());
    if (++done % 10 === 0) {
      await writeFile(STATE, JSON.stringify(state, null, 2));
      process.stdout.write(`\r  ${done}/${targets.length}  found ${found}  missing ${missing}  (${(bytes/1048576).toFixed(1)} MB)   `);
    }
    await sleep(700); // be a good citizen with archive.org
  }
}));

await writeFile(STATE, JSON.stringify(state, null, 2));
console.log(`\n  recovered: ${found}\n  not archived: ${missing}\n  bytes: ${(bytes/1048576).toFixed(1)} MB`);
