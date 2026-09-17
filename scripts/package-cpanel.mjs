import { createWriteStream } from "node:fs";
import { readFile, readdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import yazl from "yazl";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "out");
const destination = path.join(root, "cpanel-upload.zip");
const entries = [];

async function collect(directory, prefix = "") {
  const children = await readdir(directory, { withFileTypes: true });
  for (const child of children.sort((a, b) => a.name.localeCompare(b.name))) {
    const name = `${prefix}${child.name}`;
    const source = path.join(directory, child.name);
    if (child.isDirectory()) {
      entries.push({ name: `${name}/`, source, directory: true });
      await collect(source, `${name}/`);
    } else if (child.isFile()) {
      entries.push({ name, source, directory: false });
    } else {
      throw new Error(`Unexpected non-file in export: ${name}`);
    }
  }
}

await collect(output);
const files = new Set(entries.filter((entry) => !entry.directory).map((entry) => entry.name));
for (const required of [
  ".htaccess", "index.html", "404.html", "robots.txt", "sitemap.xml",
  "about/index.html", "contact/index.html", "fleet/index.html", "services/index.html",
]) {
  if (!files.has(required)) {
    throw new Error(`Missing ${required}. Run npm run build:cpanel with trailingSlash enabled.`);
  }
}

// Catch incomplete exports before upload: HTML/CSS must reference real assets.
let references = 0;
for (const entry of entries.filter((entry) => /\.(html|css)$/.test(entry.name))) {
  const content = await readFile(entry.source, "utf8");
  for (const match of content.matchAll(/\/_next\/static\/[^\s"'<>\\)]+/g)) {
    const asset = decodeURIComponent(match[0].split(/[?#]/)[0]).slice(1);
    if (!files.has(asset)) throw new Error(`${entry.name} references missing asset ${asset}`);
    references += 1;
  }
}

// Explicit POSIX modes matter even when building on Windows. Never inherit
// Windows' synthetic 0666/0777 modes into an archive extracted on cPanel.
const zip = new yazl.ZipFile();
zip.on("error", (error) => zip.outputStream.destroy(error));
const writing = pipeline(zip.outputStream, createWriteStream(`${destination}.tmp`));
for (const entry of entries) {
  if (entry.directory) {
    zip.addEmptyDirectory(entry.name, { mode: 0o40755 });
  } else {
    zip.addFile(entry.source, entry.name, { mode: 0o100644 });
  }
}
zip.end();
await writing;
await rename(`${destination}.tmp`, destination);
const archive = await stat(destination);
console.log(`Verified ${files.size} files and ${references} asset references.`);
console.log(`Created ${destination} (${(archive.size / 1024 / 1024).toFixed(2)} MB).`);
console.log("ZIP contents go directly into the domain's document root: files 0644, folders 0755.");
console.log("Upload instructions: CPANEL-DEPLOY.md. Do not upload the old public_html.zip.");
