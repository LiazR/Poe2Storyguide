import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "content");
const dest = path.join(root, "public", "content");
const watch = process.argv.includes("--watch");

function sync() {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log("[content] synced -> public/content/");
}

sync();

if (watch) {
  let timer = null;
  fs.watch(src, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(sync, 150);
  });

  const vite = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["vite"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });

  vite.on("exit", (code) => process.exit(code ?? 0));
  process.on("SIGINT", () => vite.kill("SIGINT"));
  process.on("SIGTERM", () => vite.kill("SIGTERM"));
}
