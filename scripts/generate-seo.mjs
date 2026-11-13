// Generates dist/sitemap.xml, dist/robots.txt, and one HTML shell per
// verified room so each listing has its own title, description, and URL.
// Base URL comes from Netlify's URL env var (set automatically on deploy),
// falling back to the production site. Update DEFAULT_BASE_URL when you
// add a custom domain.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_BASE_URL = 'https://homerentin.netlify.app';
const SUPABASE_URL = 'https://cmeqhzuagqjqamgmbutx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtZXFoenVhZ3FqcWFtZ21idXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5ODIyNjgsImV4cCI6MjA2NjU1ODI2OH0.pgNEPH46pZV6gb_NvO7BWsMb1bCGwZXU6h8kY4kV9Bs';

const baseUrl = (process.env.URL || process.env.SEO_BASE_URL || DEFAULT_BASE_URL)
  .replace(/\/+$/, '');

const distDir = resolve(process.cwd(), 'dist');
if (!existsSync(distDir)) {
  console.error('dist/ not found — run "vite build" first');
  process.exit(1);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeRoomCode(code) {
  return /^[A-Za-z0-9_-]+$/.test(code) ? code : '';
}

async function fetchVerifiedRooms() {
  const query = new URLSearchParams({
    select: 'room_id,title,price,location,room_type,status,additional_info,images,updated_at',
    verification: 'eq.true',
    order: 'updated_at.desc',
  });
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rooms?${query}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase rooms request failed (${response.status})`);
  }
  const rooms = await response.json();
  return Array.isArray(rooms) ? rooms : [];
}

let rooms = [];
try {
  rooms = await fetchVerifiedRooms();
  console.log(`✓ Loaded ${rooms.length} verified rooms for the sitemap`);
} catch (error) {
  console.warn(`! Could not load rooms for the sitemap: ${error.message}`);
}

const today = new Date().toISOString().slice(0, 10);
const pages = [{ path: '/', priority: '1.0', changefreq: 'daily', lastmod: today }];

for (const room of rooms) {
  const code = safeRoomCode(room.room_id || '');
  if (!code) continue;
  pages.push({
    path: `/room/${code}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: (room.updated_at || today).slice(0, 10),
  });
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
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
Disallow: /login

Sitemap: ${baseUrl}/sitemap.xml
`;

writeFileSync(resolve(distDir, 'sitemap.xml'), sitemap);
writeFileSync(resolve(distDir, 'robots.txt'), robots);

const shellPath = resolve(distDir, 'index.html');
if (existsSync(shellPath)) {
  const shell = readFileSync(shellPath, 'utf8');
  for (const room of rooms) {
    const code = safeRoomCode(room.room_id || '');
    if (!code) continue;
    const location = room.location || 'Kisii';
    const price = Number(room.price || 0).toLocaleString('en-KE');
    const title = `${room.title} — KES ${price} | HomeRentin`;
    const description = `${room.room_type || 'Room'} in ${location} for KES ${price}. ${room.additional_info || 'View photos and contact the landlord on HomeRentin.'}`.slice(0, 160);
    const pageUrl = `${baseUrl}/room/${code}`;
    const image = Array.isArray(room.images) && String(room.images[0] || '').startsWith('http')
      ? room.images[0]
      : `${baseUrl}/newlogo-homerentinn.png`;
    const snapshot = `<article id="seo-splash">
        <h1>${escapeHtml(room.title)}</h1>
        <p>KES ${escapeHtml(price)} · ${escapeHtml(room.room_type || 'room')} · ${escapeHtml(location)}</p>
        <p>${escapeHtml(description)}</p>
        <p><a href="${baseUrl}/">More rooms near campus in Kisii</a></p>
      </article>`;
    const jsonLd = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Accommodation',
      name: room.title,
      description,
      url: pageUrl,
      image,
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressCountry: 'KE',
      },
      offers: {
        '@type': 'Offer',
        price: room.price,
        priceCurrency: 'KES',
      },
    }).replace(/</g, '\\u003c');

    let html = shell
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${pageUrl}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${pageUrl}$2`)
      .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escapeHtml(image)}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
      .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${escapeHtml(image)}$2`)
      .replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${snapshot}</div>`);

    if (!html.includes('id="room-jsonld"')) {
      html = html.replace('</head>', `<script id="room-jsonld" type="application/ld+json">${jsonLd}</script>\n  </head>`);
    }

    const outDir = resolve(distDir, 'room', code);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, 'index.html'), html);
  }

  const listingLinks = rooms
    .map((room) => {
      const code = safeRoomCode(room.room_id || '');
      if (!code) return '';
      const price = Number(room.price || 0).toLocaleString('en-KE');
      const location = room.location || 'Kisii';
      return `          <li><a href="${baseUrl}/room/${code}">${escapeHtml(room.title)} — KES ${escapeHtml(price)} in ${escapeHtml(location)}</a></li>`;
    })
    .filter(Boolean)
    .join('\n');

  if (listingLinks) {
    const home = shell.replace(
      /<div id="root">[\s\S]*?<\/div>/,
      `<div id="root">
      <main id="seo-splash">
        <h1>HomeRentin — Find Rooms and Rentals Near Campus in Kisii</h1>
        <p>Verified bedsitters, singles and apartments near campus in Kisii, Kenya. Compare prices, view photos and contact landlords instantly.</p>
        <ul>
${listingLinks}
        </ul>
      </main>
    </div>`
    );
    writeFileSync(shellPath, home);
  }
}

console.log(`✓ SEO files generated for ${baseUrl} (${pages.length} URLs)`);
