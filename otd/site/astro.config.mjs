// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://otd.crackunit.com",
  trailingSlash: "always",
  build: { format: "directory" },
});
