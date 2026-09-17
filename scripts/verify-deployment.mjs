import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const exportDir = resolve(dirname(fileURLToPath(import.meta.url)), "../out");
const mimeTypes = {
  ".html": ["text/html"],
  ".css": ["text/css"],
  ".js": ["application/javascript", "text/javascript", "application/x-javascript"],
  ".json": ["application/json"],
  ".txt": ["text/plain", "text/x-component"],
  ".woff": ["font/woff", "application/font-woff"],
  ".woff2": ["font/woff2", "application/font-woff2"],
  ".ttf": ["font/ttf", "application/x-font-ttf"],
  ".otf": ["font/otf", "application/x-font-opentype"],
  ".webp": ["image/webp"],
  ".avif": ["image/avif"],
  ".png": ["image/png"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".gif": ["image/gif"],
  ".svg": ["image/svg+xml"],
  ".ico": ["image/x-icon", "image/vnd.microsoft.icon"],
};

async function filesIn(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${prefix}${entry.name}`;
    if (entry.isDirectory()) result.push(...await filesIn(join(directory, entry.name), `${path}/`));
    else if (entry.isFile()) result.push(path);
  }
  return result.sort();
}

function nextReferences(html) {
  return [...new Set(html.match(/\/_next\/[^"'<>\\\s?#]+/g) ?? [])].sort();
}

function htmlIdentity(html) {
  return JSON.stringify({
    title: html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "",
    canonical: html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1] ?? "",
    assets: nextReferences(html),
  });
}

async function main() {
  if (process.argv.length !== 3) throw new Error("Usage: node scripts/verify-deployment.mjs https://your-domain.com");
  const base = new URL(process.argv[2]);
  if (!["http:", "https:"].includes(base.protocol)
    || base.pathname !== "/" || base.search || base.hash || base.username || base.password) {
    throw new Error("Usage: node scripts/verify-deployment.mjs https://your-domain.com (domain root only)");
  }
  const files = await filesIn(exportDir).catch((error) => {
    if (error.code === "ENOENT") throw new Error("Local out/ export is missing. Run npm run build:cpanel first.");
    throw error;
  });
  if (!files.includes("index.html")) throw new Error("Local out/index.html is missing; rebuild the export first.");
  const available = new Set(files);
  const selected = new Set(files.filter((file) => file.startsWith("_next/") || /\.(html|txt)$/.test(file)));
  for (const file of [...selected].filter((name) => /\.(html|css)$/.test(name))) {
    const content = await readFile(join(exportDir, file), "utf8");
    for (const match of content.matchAll(/["'(\s](\/[^"'<>\s\\?#),]+)/g)) {
      const reference = decodeURIComponent(match[1].slice(1));
      if (available.has(reference)) selected.add(reference);
    }
  }
  const checks = [...selected].sort().map((file) => {
    const route = file.endsWith("index.html") ? file.slice(0, -10) : file;
    return { file, url: new URL(route.split("/").map(encodeURIComponent).join("/"), base).href };
  });
  const totals = {};
  for (const { file } of checks) {
    const type = extname(file) || "other";
    totals[type] = (totals[type] ?? 0) + 1;
  }
  console.log(`Checking ${checks.length} deployed files/routes against ${exportDir}`);
  console.log(Object.entries(totals).map(([type, count]) => `${type}: ${count}`).join(", "));
  let cursor = 0;
  const failures = [];
  async function worker() {
    while (cursor < checks.length) {
      const check = checks[cursor++];
      try {
        const response = await fetch(check.url, {
          signal: AbortSignal.timeout(12_000),
          headers: { "Cache-Control": "no-cache" },
        });
        if (!response.ok) {
          await response.body?.cancel();
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const type = extname(check.file);
        const mime = (response.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
        const expectedMime = mimeTypes[type];
        if ((expectedMime && !expectedMime.includes(mime)) || (type !== ".html" && mime === "text/html")) {
          await response.body?.cancel();
          throw new Error(`wrong Content-Type ${mime || "(missing)"}; expected ${expectedMime?.join(" or ") ?? "a static file"}`);
        }
        const actual = Buffer.from(await response.arrayBuffer());
        const expected = await readFile(join(exportDir, check.file));
        if (type === ".html") {
          if (htmlIdentity(actual.toString()) !== htmlIdentity(expected.toString())) {
            throw new Error("HTML belongs to a different build/route (title, canonical, or Next.js assets differ)");
          }
        } else if (!actual.equals(expected)) {
          throw new Error(`content differs from local export (${actual.length} deployed bytes; ${expected.length} expected)`);
        }
      } catch (error) {
        failures.push({ ...check, reason: error.name === "TimeoutError" ? "request exceeded 12 seconds" : error.message });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, checks.length) }, worker));
  if (failures.length) {
    for (const failure of failures.slice(0, 30)) console.error(`FAIL ${failure.url}\n  ${failure.reason}`);
    if (failures.length > 30) console.error(`... ${failures.length - 30} additional failures omitted.`);
    console.error(`FAILED: ${failures.length}/${checks.length} checks. Upload this build's complete archive and check server permissions/rules for failed URLs.`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: all ${checks.length} checks passed; deployed pages and assets match this export.`);
  }
}

main().catch((error) => {
  console.error(`Deployment verification failed: ${error.message}`);
  process.exitCode = 1;
});
