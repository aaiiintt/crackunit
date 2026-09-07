import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { readFileSync } from "node:fs";

const ROOT = path.resolve(import.meta.dirname, "..");
const DEST = path.join(ROOT, "public");
const paths = JSON.parse(readFileSync(path.join(ROOT, "export/media-paths.json"), "utf8"));

// Pull through Photon rather than the origin: the shared host is already 500ing
// under crawl load, and the CDN holds the same bytes. ?ssl=1 with no resize = original.
const src = (p) => `https://i0.wp.com/www.crackunit.com${p}?ssl=1`;

let done = 0, skipped = 0, bytes = 0;
const failed = [];

async function grab(p) {
  // Decode for the filesystem: a browser requesting %20 looks for a real space.
  const out = path.join(DEST, decodeURIComponent(p));
  try { await access(out); skipped++; return; } catch {}
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(src(p));
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        await mkdir(path.dirname(out), { recursive: true });
        await writeFile(out, buf);
        bytes += buf.length; done++;
        return;
      }
      if (res.status === 404 && attempt === 3) { failed.push(`${p} (404)`); return; }
    } catch (e) {
      if (attempt === 3) { failed.push(`${p} (${e.message})`); return; }
    }
    await new Promise((r) => setTimeout(r, attempt * 1000));
  }
}

const queue = [...paths];
const workers = Array.from({ length: 6 }, async () => {
  while (queue.length) {
    await grab(queue.pop());
    if ((done + skipped) % 50 === 0) {
      process.stdout.write(`\r  ${done + skipped}/${paths.length}  (${(bytes / 1048576).toFixed(1)} MB)   `);
    }
  }
});
await Promise.all(workers);

console.log(`\n  downloaded : ${done}`);
console.log(`  already had: ${skipped}`);
console.log(`  total size : ${(bytes / 1048576).toFixed(1)} MB`);
console.log(`  failed     : ${failed.length}`);
if (failed.length) {
  await writeFile(path.join(ROOT, "export/media-failed.json"), JSON.stringify(failed, null, 2));
  console.log(`  -> export/media-failed.json`);
}
