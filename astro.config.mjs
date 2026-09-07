// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.crackunit.com",
  // WordPress served trailing slashes. Matching it means old links resolve
  // directly instead of taking a redirect hop.
  trailingSlash: "always",
  build: { format: "directory" },
  // The v0 preview is served through a dynamic cross-origin proxy in development.
  // Allow that host so the preview can request the Astro dev server without a 403.
  security: {
    allowedDomains: [{}],
  },
  markdown: {
    // Post bodies contain hand-written HTML (embeds, old markup) that must survive.
    shikiConfig: { theme: "github-light", wrap: true },
  },
});
