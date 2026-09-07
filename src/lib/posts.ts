import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

/** All published posts, newest first. */
export async function allPosts(): Promise<Post[]> {
  const posts = await getCollection("posts");
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Split a stored permalink (/YYYY/MM/DD/slug/) back into route params. */
export function permalinkParts(permalink: string) {
  const m = permalink.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\/([^/]+)\/$/);
  if (!m) throw new Error(`Unexpected permalink shape: ${permalink}`);
  // Astro matches decoded request paths, but WordPress slugs are stored
  // percent-encoded (e.g. a curly apostrophe). Params must be decoded; the
  // stored permalink stays encoded for hrefs and canonicals.
  return { year: m[1], month: m[2], day: m[3], slug: decodeURIComponent(m[4]) };
}

export const PAGE_SIZE = 12;

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
