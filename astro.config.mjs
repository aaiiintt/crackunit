// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.crackunit.com",
  // WordPress served trailing slashes. Matching it means old links resolve
  // directly instead of taking a redirect hop.
  trailingSlash: "always",
  build: { format: "directory" },
  markdown: {
    // Post bodies contain hand-written HTML (embeds, old markup) that must survive.
    shikiConfig: { theme: "github-light", wrap: true },
  },
});
