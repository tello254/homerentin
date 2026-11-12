// Generates dist/sitemap.xml and dist/robots.txt at build time.
// Base URL comes from Netlify's URL env var (set automatically on deploy),
// falling back to the production site. Update DEFAULT_BASE_URL when you
// add a custom domain.
import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_BASE_URL = 'https://homerentin.netlify.app';
const baseUrl = (process.env.URL || process.env.SEO_BASE_URL || DEFAULT_BASE_URL)
  .replace(/\/+$/, ''); // strip trailing slash

const distDir = resolve(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  console.error('dist/ not found — run "vite build" first');
  process.exit(1);
}

// ---- Pages to index -------------------------------------------------------
// Static routes of the app. When listing detail pages are added
// (e.g. /room/:id), fetch verified rooms from Supabase here and append one
// <url> entry per listing.
const pages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
];

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const robots = `# HomeRentin — robots.txt
User-agent: *
Allow: /
Disallow: /admin

# Bots that read the page directly (social/preview crawlers)
User-agent: Googlebot
Allow: /
User-agent: Bingbot
Allow: /
User-agent: Twitterbot
Allow: /
User-agent: facebookexternalhit
Allow: /
User-agent: WhatsApp
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap);
writeFileSync(resolve(distDir, 'robots.txt'), robots);
console.log(`✓ SEO files generated for ${baseUrl}`);
