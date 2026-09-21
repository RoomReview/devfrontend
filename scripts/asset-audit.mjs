import { readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join } from 'node:path';

const root = fileURLToPath(new URL('../src/assets/', import.meta.url));
const limitBytes = Number(process.env.IMAGE_MAX_BYTES ?? 500 * 1024);
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (imageExtensions.has(extname(entry.name).toLowerCase())) files.push(path);
  }
}

await walk(root);
const assets = await Promise.all(files.map(async (path) => ({ path, bytes: (await stat(path)).size })));
assets.sort((a, b) => b.bytes - a.bytes);
console.table(assets.slice(0, 20).map(({ path, bytes }) => ({ path, kilobytes: Math.round(bytes / 1024) })));
const oversized = assets.filter(({ bytes }) => bytes > limitBytes);
console.log(`${oversized.length} image assets exceed ${Math.round(limitBytes / 1024)} KB`);
if (oversized.length > 0) process.exitCode = 1;
