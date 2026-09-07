import TurndownService from "turndown";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://www.crackunit.com";
const API = `${SITE}/wp-json/wp/v2`;
const OUT = path.resolve(import.meta.dirname, "../export");

const td = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
});
// Embeds have no text content — turndown would silently drop them. Keep as raw HTML.
td.keep(["iframe", "video", "audio", "embed", "object"]);
td.remove(["script", "style"]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchRange(resource, extra, offset, limit) {
  const url = `${API}/${resource}?per_page=${limit}&offset=${offset}${extra}`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return { ok: true, items: await res.json(), res };
      if (res.status === 400) return { ok: true, items: [], res }; // past the end
      if (attempt === 3) return { ok: false, status: res.status };
    } catch (e) {
      if (attempt === 3) return { ok: false, status: String(e.message) };
    }
    await sleep(attempt * 1500); // shared host — back off rather than retry hard
  }
}

// Offset paging with per-range retry. A single corrupt row (WP returns 500 for the
// whole page) must not abort the crawl, so failures are bisected down to size 10
// and only the failing chunk is skipped.
async function getAll(resource, extra = "") {
  const out = [];
  const skipped = [];
  const first = await fetchRange(resource, extra, 0, 100);
  if (!first.ok) throw new Error(`${resource}: cannot start (${first.status})`);
  const total = Number(first.res.headers.get("x-wp-total") || first.items.length);
  out.push(...first.items);

  for (let offset = 100; offset < total; offset += 100) {
    const r = await fetchRange(resource, extra, offset, 100);
    if (r.ok) {
      out.push(...r.items);
    } else {
      for (let sub = offset; sub < Math.min(offset + 100, total); sub += 10) {
        const s10 = await fetchRange(resource, extra, sub, 10);
        if (s10.ok) out.push(...s10.items);
        else skipped.push(`${resource}[${sub}..${sub + 9}] (${s10.status})`);
        await sleep(200);
      }
    }
    process.stdout.write(`\r  ${resource}: ${out.length}/${total}   `);
    await sleep(250);
  }
  process.stdout.write(`\r  ${resource}: ${out.length}/${total}   \n`);
  if (skipped.length) {
    console.warn(`  ! skipped ${skipped.length} chunk(s): ${skipped.join(", ")}`);
    globalThis.__skipped = (globalThis.__skipped || []).concat(skipped);
  }
  return out;
}

const decode = (s = "") =>
  s.replace(/&#(\d+);/g, (_, d) => String.fromCharCode(d))
   .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
   .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
   .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, " ");

const yaml = (v) => {
  if (Array.isArray(v)) return `[${v.map((x) => JSON.stringify(String(x))).join(", ")}]`;
  if (typeof v === "boolean" || typeof v === "number") return String(v);
  return JSON.stringify(String(v));
};

console.log("Fetching taxonomy and media...");
const cats = await getAll("categories");
const tags = await getAll("tags");
const media = await getAll("media");
const catById = new Map(cats.map((c) => [c.id, c]));
const tagById = new Map(tags.map((t) => [t.id, t]));
const mediaById = new Map(media.map((m) => [m.id, m]));

console.log("Fetching content...");
const posts = await getAll("posts", "&status=publish");
const pages = await getAll("pages", "&status=publish");

const manifest = [];
let embedCount = 0;

async function write(item, kind) {
  const d = new Date(item.date);
  const [yyyy, mm, dd] = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ];
  // The permalink is the contract with the old site — derive it, don't invent it.
  const permalink =
    kind === "post" ? `/${yyyy}/${mm}/${dd}/${item.slug}/` : `/${item.slug}/`;

  const html = item.content?.rendered || "";
  if (/<(iframe|video|audio|embed|object)\b/i.test(html)) embedCount++;
  const body = td.turndown(html).replace(/\n{3,}/g, "\n\n").trim();

  const fm = {
    title: decode(item.title?.rendered || "(untitled)"),
    date: item.date,
    slug: item.slug,
    permalink,
    wpId: item.id,
  };
  if (kind === "post") {
    fm.categories = (item.categories || []).map((id) => catById.get(id)?.name).filter(Boolean);
    fm.tags = (item.tags || []).map((id) => tagById.get(id)?.name).filter(Boolean);
    if (item.format && item.format !== "standard") fm.format = item.format;
  }
  let excerpt = decode((item.excerpt?.rendered || "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  // WordPress folds its "Continue reading" link into the excerpt — drop it, then
  // trim on a word boundary rather than mid-word.
  const truncated = /Continue reading|…|\.\.\.\s*$/i.test(excerpt);
  excerpt = excerpt.replace(/\s*(…|\.\.\.)?\s*Continue reading.*$/i, "").replace(/…+$/, "").trim();
  if (excerpt.length > 240) excerpt = excerpt.slice(0, 240).replace(/\s+\S*$/, "").replace(/[,.;:—-]+$/, "");
  if (excerpt) fm.excerpt = truncated ? excerpt + "…" : excerpt;
  if (item.featured_media && mediaById.has(item.featured_media)) {
    fm.featuredImage = mediaById.get(item.featured_media).source_url;
  }

  const front = Object.entries(fm).map(([k, v]) => `${k}: ${yaml(v)}`).join("\n");
  const dir = path.join(OUT, kind === "post" ? "posts" : "pages");
  await mkdir(dir, { recursive: true });
  // Percent-encoded slugs break Astro's deferred content modules. The filename is
  // cosmetic — `permalink` in the frontmatter is what routing uses — so sanitise it.
  const fileSlug = item.slug.replace(/%[0-9a-f]{2}/gi, "").replace(/[^a-z0-9._-]/gi, "-");
  await writeFile(path.join(dir, `${yyyy}-${mm}-${dd}-${fileSlug}.md`), `---\n${front}\n---\n\n${body}\n`);
  manifest.push({ permalink, kind, wpId: item.id, oldUrl: item.link });
}

for (const p of posts) await write(p, "post");
for (const p of pages) await write(p, "page");

// Media manifest — every upload URL, with sizes where WP reports them.
const uploads = media.map((m) => ({
  id: m.id,
  url: m.source_url,
  path: new URL(m.source_url).pathname,
  bytes: m.media_details?.filesize ?? null,
  mime: m.mime_type,
}));
const known = uploads.filter((u) => u.bytes).reduce((a, u) => a + u.bytes, 0);

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
await writeFile(path.join(OUT, "media.json"), JSON.stringify(uploads, null, 2));

console.log(`
  posts:       ${posts.length}
  pages:       ${pages.length}
  categories:  ${cats.length}
  tags:        ${tags.length}
  media:       ${uploads.length}  (${(known / 1048576).toFixed(1)} MB reported by WP across ${uploads.filter((u) => u.bytes).length})
  with embeds: ${embedCount} posts contain iframe/video/audio (kept as raw HTML)
  manifest:    ${manifest.length} URLs -> export/manifest.json
`);
