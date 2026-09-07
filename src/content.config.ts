import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// export/ is the raw dump from WordPress and stays the source of truth —
// the site reads it in place rather than keeping a second copy in src/.
const base = z.object({
  title: z.string(),
  date: z.coerce.date(),
  slug: z.string(),
  permalink: z.string(),
  wpId: z.number(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
});

export const collections = {
  posts: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./export/posts", deferRender: true }),
    schema: base.extend({
      categories: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      format: z.string().optional(),
    }),
  }),
  pages: defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./export/pages", deferRender: true }),
    schema: base,
  }),
};
