import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, "dist");
const indexPath = join(distDir, "index.html");

let html = readFileSync(indexPath, "utf8");

html = html.replace(
  /<link rel="stylesheet" crossorigin href="\.\/(assets\/[^\"]+\.css)">/g,
  (_, href) => {
    const css = readFileSync(join(distDir, href), "utf8");
    return `<style>${css}</style>`;
  },
);

html = html.replace(
  /<script type="module" crossorigin src="\.\/(assets\/[^\"]+\.js)"><\/script>/g,
  (_, src) => {
    const js = readFileSync(join(distDir, src), "utf8");
    return `<script type="module">${js}</script>`;
  },
);

writeFileSync(indexPath, html, "utf8");
console.log("[offline] inlined assets into dist/index.html");
