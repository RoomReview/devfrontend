import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectDirectory, 'dist');
const siteUrl = (process.env.VITE_SITE_URL || 'https://roomreview.co.uk').replace(/\/+$/, '');
const sitemapDataUrl = process.env.VITE_SITEMAP_DATA_URL?.trim();
const indexPath = path.join(outputDirectory, 'index.html');
const routes = [
  '/',
  '/about',
  '/contact',
  '/area-search',
  '/postcode-search',
  '/blog',
  '/pricing',
  '/data-sources',
  '/privacy',
  '/cookie-policy',
];
const urls = new Set(routes);
let prerenderPages = [];

if (sitemapDataUrl) {
  const response = await fetch(sitemapDataUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    throw new Error(`Sitemap data request failed with HTTP ${response.status}.`);
  }
  const payload = await response.json();
  if (!payload.success || !Array.isArray(payload.data?.pages)) {
    throw new Error('Sitemap data endpoint returned an invalid response.');
  }
  for (const page of payload.data.pages) {
    const route = page?.path;
    if (typeof route !== 'string' || !/^\/(?:[a-z0-9-]+\/?)*$/i.test(route)) {
      throw new Error('Sitemap data endpoint returned an invalid path.');
    }
    urls.add(route);
  }
  prerenderPages = payload.data.pages;
}

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');
const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
const urlSets = [];
const urlList = [...urls];
for (let index = 0; index < urlList.length; index += 50_000) {
  const entries = urlList.slice(index, index + 50_000)
    .map((route) => `  <url><loc>${escapeXml(new URL(route, `${siteUrl}/`).toString())}</loc></url>`)
    .join('\n');
  urlSets.push(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
}

await mkdir(outputDirectory, { recursive: true });
if (prerenderPages.length > 0) {
  const template = await readFile(indexPath, 'utf8');
  const seenPaths = new Set();
  const renderPage = ({ path: route, title, description, content }) => {
    if (
      typeof route !== 'string'
      || !/^\/(?:[a-z0-9-]+\/?)*$/i.test(route)
      || typeof title !== 'string'
      || typeof description !== 'string'
      || typeof content !== 'string'
    ) {
      throw new Error('Sitemap data endpoint returned an invalid prerender page.');
    }
    if (seenPaths.has(route)) throw new Error(`Duplicate prerender page path: ${route}`);
    seenPaths.add(route);

    const pageUrl = new URL(route, `${siteUrl}/`).toString();
    return template
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
      .replace(/<meta name="description" content="[^"]*" \/>/i, `<meta name="description" content="${escapeHtml(description)}" />`)
      .replace(/<link rel="canonical" href="[^"]*" \/>/i, `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`)
      .replace(
        '<div id="root"></div>',
        `<div id="root"><main><article><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p><p>${escapeHtml(content)}</p></article></main></div>`,
      );
  };

  let nextPage = 0;
  const workers = Array.from({ length: 16 }, async () => {
    while (nextPage < prerenderPages.length) {
      const page = prerenderPages[nextPage++];
      const html = renderPage(page);
      const routePath = new URL(page.path, `${siteUrl}/`).pathname.replace(/^\/+|\/+$/g, '');
      const destination = path.join(outputDirectory, routePath, 'index.html');
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, html);
    }
  });
  await Promise.all(workers);
}

if (urlSets.length === 1) {
  await writeFile(path.join(outputDirectory, 'sitemap.xml'), urlSets[0]);
} else {
  const sitemapNames = urlSets.map((content, index) => {
    const name = `sitemap-${index + 1}.xml`;
    return writeFile(path.join(outputDirectory, name), content).then(() => name);
  });
  const names = await Promise.all(sitemapNames);
  const entries = names.map((name) =>
    `  <sitemap><loc>${escapeXml(new URL(name, `${siteUrl}/`).toString())}</loc></sitemap>`,
  ).join('\n');
  await writeFile(
    path.join(outputDirectory, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`,
  );
}

const disallowIndexing = process.env.VITE_ROBOTS_ALLOW_CRAWLING === 'false';
const robotsContent = disallowIndexing
  ? 'User-agent: *\nDisallow: /\n'
  : `User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /admin\nDisallow: /login\nDisallow: /register\nDisallow: /verify-email\nDisallow: /email-verified\nDisallow: /forgot-password\nDisallow: /auth/\nDisallow: /reset-password\nDisallow: /password-reset-\nDisallow: /checkout/\nDisallow: /report/view\nDisallow: /investor-report/view\n\nUser-agent: OAI-SearchBot\nAllow: /\nDisallow: /account\nDisallow: /admin\nDisallow: /login\nDisallow: /register\nDisallow: /verify-email\nDisallow: /email-verified\nDisallow: /forgot-password\nDisallow: /auth/\nDisallow: /reset-password\nDisallow: /password-reset-\nDisallow: /checkout/\nDisallow: /report/view\nDisallow: /investor-report/view\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
await writeFile(path.join(outputDirectory, 'robots.txt'), robotsContent);
console.log(`Generated sitemap for ${urls.size} public URLs${sitemapDataUrl ? ' including borough, postcode, and article pages' : ''}.`);
