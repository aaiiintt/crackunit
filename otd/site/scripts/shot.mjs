// Serves dist/ with a tiny dependency-free static server, then screenshots
// /09-12/ and / at 390x844 (iPhone-width) via the sandboxed Chromium build.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(here, "..");
const distDir = path.join(siteRoot, "dist");
const outDir = path.join(siteRoot, "out");
fs.mkdirSync(outDir, { recursive: true });

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
};

function serve(req, res) {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  let filePath = path.join(distDir, p);
  if (!filePath.startsWith(distDir)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Astro's format:"directory" 404 lives at dist/404.html
      fs.readFile(path.join(distDir, "404.html"), (e2, data2) => {
        if (e2) {
          res.writeHead(404);
          res.end("not found");
        } else {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(data2);
        }
      });
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(serve);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;
console.log(`serving dist/ at ${base}`);

const executablePath = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
let browser;
try {
  browser = await chromium.launch({ executablePath, headless: true });
} catch (err) {
  console.error("playwright-core could not launch the pinned Chromium build:");
  console.error(err.message);
  server.close();
  process.exit(1);
}

const shots = [
  { path: "/09-12/", out: "shot-09-12.png" },
  { path: "/", out: "shot-index.png" },
];

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  for (const s of shots) {
    await page.goto(base + s.path, { waitUntil: "networkidle" });
    const dest = path.join(outDir, s.out);
    await page.screenshot({ path: dest });
    console.log(`wrote ${dest}`);
  }
} finally {
  await browser.close();
  server.close();
}
