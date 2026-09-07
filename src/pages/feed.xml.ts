import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { allPosts } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = (await allPosts()).slice(0, 25);
  return rss({
    title: "Crack Unit",
    description: "Iain Tait's blog, since 2005.",
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      link: p.data.permalink,
      description: p.data.excerpt ?? "",
      categories: [...p.data.categories, ...p.data.tags].slice(0, 12),
    })),
    customData: "<language>en-gb</language>",
  });
}
