// Check every URL WordPress published against the live Vercel site.
import { readFile } from "node:fs/promises";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "..");
const urls = JSON.parse(await readFile(path.join(ROOT, "export/live-urls.json"), "utf8"));
const bad = [];
let done = 0;
const queue = [...urls];
await Promise.all(Array.from({ length: 12 }, async () => {
  while (queue.length) {
    const u = queue.pop();
    let code = 0;
    for (let a = 0; a < 2 && code !== 200; a++) {
      try {
        // Do NOT encodeURI here: these URLs are already percent-encoded, and
        // re-encoding turns %e2%80%99 into %25e2%2580%2599 — a different path.
        const r = await fetch(u, { redirect: "manual", signal: AbortSignal.timeout(25000) });
        code = r.status;
      } catch { code = 0; }
    }
    if (code !== 200) bad.push(`${code} ${new URL(u).pathname}`);
    if (++done % 250 === 0) process.stdout.write(`\r  ${done}/${urls.length} checked, ${bad.length} failing   `);
  }
}));
console.log(`\n  checked : ${urls.length}\n  200     : ${urls.length - bad.length}\n  FAILING : ${bad.length}`);
bad.slice(0, 20).forEach((b) => console.log(`    ${b}`));
process.exitCode = bad.length ? 1 : 0;
