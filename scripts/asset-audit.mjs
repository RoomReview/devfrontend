import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, resolve } from 'node:path';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const localAssetRoot = fileURLToPath(new URL('../src/assets/', import.meta.url));
const imageRoot = fileURLToPath(new URL('../../img/', import.meta.url));
const limitBytes = Number(process.env.IMAGE_MAX_BYTES ?? 500 * 1024);
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const files = new Set();

async function walkAssets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walkAssets(path);
    else if (imageExtensions.has(extname(entry.name).toLowerCase())) files.add(path);
  }
}

async function walkSource(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'assets') await walkSource(path);
      continue;
    }
    if (!/\.(tsx?|jsx?|css)$/.test(entry.name)) continue;

    const source = await readFile(path, 'utf8');
    for (const match of source.matchAll(/@img\/([^'"]+\.(?:png|jpe?g|webp|avif))/gi)) {
      files.add(resolve(imageRoot, match[1]));
    }
  }
}

await Promise.all([walkAssets(localAssetRoot), walkSource(sourceRoot)]);
const assets = await Promise.all([...files].map(async (path) => ({ path, bytes: (await stat(path)).size })));
assets.sort((a, b) => b.bytes - a.bytes);
console.table(assets.slice(0, 20).map(({ path, bytes }) => ({ path, kilobytes: Math.round(bytes / 1024) })));
const oversized = assets.filter(({ bytes }) => bytes > limitBytes);
console.log(`${oversized.length} image assets exceed ${Math.round(limitBytes / 1024)} KB`);
if (oversized.length > 0) process.exitCode = 1;
