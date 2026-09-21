import { readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/assets/', import.meta.url));
const budgetBytes = Number(process.env.JS_ENTRY_BUDGET_BYTES ?? 450 * 1024);
const files = [];
for (const entry of await readdir(dist)) {
  if (extname(entry) === '.js') files.push({ name: entry, bytes: (await stat(join(dist, entry))).size });
}
files.sort((a, b) => b.bytes - a.bytes);
console.table(files.map(({ name, bytes }) => ({ name, kilobytes: Math.round(bytes / 1024) })));
const entry = files.find(({ name }) => name.startsWith('index-'));
if (!entry) throw new Error('Built frontend entry chunk was not found');
console.log(`Entry chunk: ${Math.round(entry.bytes / 1024)} KB; budget: ${Math.round(budgetBytes / 1024)} KB`);
if (entry.bytes > budgetBytes) process.exitCode = 1;
