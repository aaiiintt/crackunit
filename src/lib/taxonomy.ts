import raw from "../../export/taxonomy.json";

type Term = { id: number; name: string; slug: string; count: number };
const data = raw as { categories: Term[]; tags: Term[]; users: Term[] };

// Posts carry taxonomy *names*; the URLs WordPress published use *slugs*.
// These maps are the bridge, so /tag/<slug>/ keeps resolving exactly as before.
const bySlug = (list: Term[]) => new Map(list.map((t) => [t.slug, t]));
const byName = (list: Term[]) => new Map(list.map((t) => [t.name, t]));

export const categories = data.categories;
export const tags = data.tags;
export const authors = data.users;

export const categoryByName = byName(data.categories);
export const tagByName = byName(data.tags);
export const categoryBySlug = bySlug(data.categories);
export const tagBySlug = bySlug(data.tags);

export const slugForCategory = (name: string) => categoryByName.get(name)?.slug;
export const slugForTag = (name: string) => tagByName.get(name)?.slug;
