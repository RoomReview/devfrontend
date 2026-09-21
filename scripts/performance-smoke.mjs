const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://localhost:5173';
const paths = ['/', '/postcode-search', '/account'];
const budgetMs = Number(process.env.SMOKE_P95_MS ?? 1500);

const samples = [];
for (const path of paths) {
  const started = performance.now();
  const response = await fetch(new URL(path, baseUrl));
  const elapsed = performance.now() - started;
  samples.push({ path, status: response.status, elapsed: Math.round(elapsed) });
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`);
}

const sorted = samples.map((sample) => sample.elapsed).sort((a, b) => a - b);
const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
console.table(samples);
console.log(`p95 page response: ${p95}ms (budget ${budgetMs}ms)`);
if (p95 > budgetMs) process.exitCode = 1;
