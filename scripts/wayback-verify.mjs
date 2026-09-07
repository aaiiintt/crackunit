// Pass 2: re-check every URL pass 1 recorded as "no-snapshot".
// archive.org returns 503s and empty-200s under load, so a single empty answer
// is not proof of absence — require two consecutive clean empties before believing it.
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const STATE = path.join(ROOT, "export/wayback-state.json");
const state = JSON.parse(await readFile(STATE, "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const retry = Object.entries(state).filter(([, v]) => v.skip === "no-snapshot" || v.skip === "fetch-failed");
console.log(`  re-checking ${retry.length} misses (single-threaded, confirming absence twice)`);

let recovered = 0, confirmed = 0, bytes = 0, n = 0;

async function cdxOnce(original) {
  const u = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(original)}` +
            `&output=json&filter=statuscode:200&collapse=digest&limit=3&fl=timestamp,original`;
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(60000) });
    if (r.status === 429 || r.status === 503) return { throttled: true };
    if (!r.ok) return { throttled: true };
    const rows = await r.json();
    return { rows: rows.length > 1 ? rows.slice(1) : [] };
  } catch { return { throttled: true }; }
}

// Only a clean 200 counts as evidence; throttled answers are retried, not believed.
async function cdxConfident(original) {
  let empties = 0;
  for (let a = 0; a < 6; a++) {
    const res = await cdxOnce(original);
    if (res.throttled) { await sleep(6000); continue; }
    if (res.rows.length) return res.rows[0];
    if (++empties >= 2) return null;
    await sleep(2500);
  }
  return null;
}

for (const [photonUrl, v] of retry) {
  const inner = photonUrl.replace(/^https?:\/\/i\d\.wp\.com\//, "");
  const host = inner.split("/")[0];
  const original = inner.replace(/[?&](w|h|resize|ssl|quality|strip|fit)=[^&]*/g, "").replace(/[?&]$/, "");

  const hit = await cdxConfident(original);
  if (!hit) { state[photonUrl] = { skip: "no-snapshot", confirmed: true }; confirmed++; }
  else {
    const [ts, orig] = hit;
    const full = orig.startsWith("http") ? orig : `http://${orig}`;
    const rel = `/wp-content/rescued/${host}${new URL(full).pathname}`;
    const out = path.join(ROOT, "public", rel);
    let ok = false;
    try { await access(out); ok = true; } catch {}
    if (!ok) {
      try {
        const r = await fetch(`https://web.archive.org/web/${ts}id_/${full}`, { signal: AbortSignal.timeout(90000) });
        if (r.ok) {
          const buf = Buffer.from(await r.arrayBuffer());
          if (buf.length > 100) {
            await mkdir(path.dirname(out), { recursive: true });
            await writeFile(out, buf); bytes += buf.length; ok = true;
          }
        }
      } catch {}
    }
    state[photonUrl] = ok ? { done: true, rel, ts, pass: 2 } : { skip: "fetch-failed", confirmed: true };
    if (ok) recovered++;
  }
  if (++n % 5 === 0) {
    await writeFile(STATE, JSON.stringify(state, null, 2));
    process.stdout.write(`\r  ${n}/${retry.length}  newly recovered ${recovered}  confirmed-gone ${confirmed}  (${(bytes/1048576).toFixed(1)} MB)   `);
  }
  await sleep(1200);
}

await writeFile(STATE, JSON.stringify(state, null, 2));
console.log(`\n  newly recovered on pass 2: ${recovered}`);
console.log(`  confirmed genuinely gone : ${confirmed}`);
