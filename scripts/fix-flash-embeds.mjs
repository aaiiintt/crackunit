// 2008-era posts embed video with Flash <object> tags. Flash died in 2020, so these
// render an empty box — they were broken on the old WordPress site too. Rewrite the
// ones whose platform still exists into modern iframes; drop the ones that cannot work.
//
// The identifier is searched for across the WHOLE object block, not a single extracted
// URL: these blocks are wildly inconsistent. Some put the id in the movie URL, some
// only in flashvars, and roughly a fifth lead with allowFullScreen/quality so taking
// the first value="..." attribute yields "true".
import { readFile, writeFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
const frame = (src, extra = "") =>
  `<iframe src="${src}" loading="lazy" allowfullscreen${extra}></iframe>`;

function convert(block) {
  const b = decode(block);

  let m = b.match(/youtube\.com\/v\/([A-Za-z0-9_-]{6,})/);
  if (m) return { kind: "youtube", html: frame(`https://www.youtube.com/embed/${m[1]}`) };

  m = b.match(/\bclip_id=(\d+)/);           // covers moogaloop URLs and flashvars alike
  if (m) return { kind: "vimeo", html: frame(`https://player.vimeo.com/video/${m[1]}`) };

  m = b.match(/dailymotion\.com\/swf\/(?:video\/)?([A-Za-z0-9]+)/);
  if (m) return { kind: "dailymotion", html: frame(`https://www.dailymotion.com/embed/video/${m[1]}`) };

  m = b.match(/player\.soundcloud\.com\/player\.swf\?url=([^&"]+)/);
  if (m) return {
    kind: "soundcloud",
    html: frame(`https://w.soundcloud.com/player/?url=${m[1]}&visual=false`,
                ' style="height:166px;aspect-ratio:auto"'),
  };

  // Flickr Flash slideshows (the v= is an API version, not a photoset), SlideShare's
  // ssplayer, and a graveyard of dead services: nothing to recover.
  const host = (b.match(/value="https?:\/\/([^/"]+)/) || [])[1] || "unknown";
  return { kind: `dropped:${host}`, html: "" };
}

const counts = {};
let files = 0;
for await (const rel of glob("export/posts/*.md", { cwd: ROOT })) {
  const file = path.join(ROOT, rel);
  const before = await readFile(file, "utf8");
  const after = before
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/g, (block) => {
      const { kind, html } = convert(block);
      counts[kind] = (counts[kind] || 0) + 1;
      return html;
    })
    .replace(/\n{3,}/g, "\n\n");
  if (after !== before) { await writeFile(file, after); files++; }
}

const restored = Object.entries(counts).filter(([k]) => !k.startsWith("dropped"));
const dropped = Object.entries(counts).filter(([k]) => k.startsWith("dropped"));
console.log(`  rewrote ${files} files`);
console.log(`\n  RESTORED (${restored.reduce((a, [, n]) => a + n, 0)}):`);
restored.sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`    ${String(n).padStart(4)}  ${k}`));
console.log(`\n  DROPPED (${dropped.reduce((a, [, n]) => a + n, 0)}) — platform gone or id unrecoverable:`);
dropped.sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(`    ${String(n).padStart(4)}  ${k.replace("dropped:", "")}`));
