import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { allPosts } from "../lib/posts";
import { categories, tags, authors } from "../lib/taxonomy";

// Hand-rolled rather than pulling in an integration: it is ~20 lines and this
// site's URL set is known exactly.
export async function GET(context: APIContext) {
  const site = context.site!.href.replace(/\/$/, "");
  const posts = await allPosts();
  const pages = await getCollection("pages");
  const formats = [...new Set(posts.map((p) => p.data.format).filter(Boolean))] as string[];

  const urls: Array<{ loc: string; lastmod?: string }> = [
    { loc: "/" },
    { loc: "/archive/" },
    ...posts.map((p) => ({ loc: p.data.permalink, lastmod: p.data.date.toISOString() })),
    ...pages.map((p) => ({ loc: p.data.permalink })),
    ...categories.map((c) => ({ loc: `/category/${c.slug}/` })),
    ...tags.map((t) => ({ loc: `/tag/${t.slug}/` })),
    ...authors.map((a) => ({ loc: `/author/${a.slug}/` })),
    ...formats.map((f) => ({ loc: `/type/${f}/` })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
