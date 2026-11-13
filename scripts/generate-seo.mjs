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
    select: 'room_id,title,price,location,room_type,status,additional_info,images,updated_at,verification',
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

  // Keyword landing pages (keep in sync with src/lib/landingPages.ts)
  const LANDING_PAGES = [
    {
      slug: 'houses-for-rent-in-kisii',
      h1: 'Houses for Rent in Kisii',
      title: 'Houses for Rent in Kisii — Verified Rentals from KES 4,000 | HomeRentin',
      description:
        'Browse verified rental houses in Kisii, Kenya. Bedsitters and single rooms near campus from KES 4,000 per month. View photos, compare prices and contact landlords instantly.',
      intro:
        'Every rental house on this page is verified by the HomeRentin team before it goes live — real photos, real prices, real landlords. New rooms are added continuously.',
      roomTypes: [],
      titleKeywords: [],
    },
    {
      slug: 'bedsitters-for-rent-in-kisii',
      h1: 'Bedsitters for Rent in Kisii',
      title: 'Bedsitters for Rent in Kisii — Verified Listings from KES 4,300 | HomeRentin',
      description:
        'Find verified bedsitters for rent in Kisii, Kenya. Compare prices, view real photos and contact landlords directly. Rooms near campus from KES 4,300 per month.',
      intro:
        'Looking for a bedsitter in Kisii? These verified bedsitters are near campus and priced for students. Every listing shows the real monthly rent — no hidden broker fees.',
      roomTypes: ['bedsitter'],
      titleKeywords: [],
    },
    {
      slug: 'single-rooms-for-rent-in-kisii',
      h1: 'Single Rooms for Rent in Kisii',
      title: 'Single Rooms for Rent in Kisii — Verified Listings from KES 4,000 | HomeRentin',
      description:
        'Find verified single rooms for rent in Kisii, Kenya. Compare prices, view real photos and contact landlords directly. Rooms near campus from KES 4,000 per month.',
      intro:
        'These verified single rooms in Kisii sit close to campus and are priced for students. Every listing shows the real monthly rent — no hidden broker fees.',
      roomTypes: ['single'],
      titleKeywords: [],
    },
    {
      slug: 'apartments-for-rent-in-kisii',
      h1: 'Apartments for Rent in Kisii',
      title: 'Apartments for Rent in Kisii — Verified Listings | HomeRentin',
      description:
        'Find verified apartments for rent in Kisii, Kenya. Compare prices, view real photos and contact landlords directly on HomeRentin.',
      intro:
        'Verified apartments for rent in Kisii, listed by real landlords. Every listing is checked by the HomeRentin team before it appears here.',
      roomTypes: ['apartment'],
      titleKeywords: [],
    },
    {
      slug: 'one-bedroom-houses-in-kisii',
      h1: 'One-Bedroom Houses for Rent in Kisii',
      title: 'One-Bedroom Houses for Rent in Kisii — Verified Listings | HomeRentin',
      description:
        'Find verified one-bedroom houses for rent in Kisii, Kenya. Compare prices, view real photos and contact landlords directly on HomeRentin.',
      intro:
        'Verified one-bedroom houses for rent in Kisii. Every listing is checked by the HomeRentin team before it appears here.',
      roomTypes: [],
      titleKeywords: ['one bedroom', '1 bedroom'],
    },
    {
      slug: 'two-bedroom-houses-in-kisii',
      h1: 'Two-Bedroom Houses for Rent in Kisii',
      title: 'Two-Bedroom Houses for Rent in Kisii — Verified Listings | HomeRentin',
      description:
        'Find verified two-bedroom houses for rent in Kisii, Kenya. Compare prices, view real photos and contact landlords directly on HomeRentin.',
      intro:
        'Verified two-bedroom houses for rent in Kisii. Every listing is checked by the HomeRentin team before it appears here.',
      roomTypes: [],
      titleKeywords: ['two bedroom', '2 bedroom'],
    },
  ];

  const EMPTY_MESSAGES = {
    'houses-for-rent-in-kisii': 'No rental houses are available right now — new listings are added regularly, check back soon.',
    'bedsitters-for-rent-in-kisii': 'No bedsitters are available right now — new listings are added regularly, check back soon.',
    'single-rooms-for-rent-in-kisii': 'No single rooms are available right now — new listings are added regularly, check back soon.',
    'apartments-for-rent-in-kisii': 'No apartments are listed yet — we add new properties regularly, check back soon or browse bedsitters and single rooms.',
    'one-bedroom-houses-in-kisii': 'No one-bedroom houses are listed yet — we add new properties regularly, check back soon or browse bedsitters and single rooms.',
    'two-bedroom-houses-in-kisii': 'No two-bedroom houses are listed yet — we add new properties regularly, check back soon or browse bedsitters and single rooms.',
  };

  for (const def of LANDING_PAGES) {
    const matches = rooms.filter((room) => {
      if (!room.verification) return false;
      if (def.roomTypes.length && !def.roomTypes.includes(room.room_type)) return false;
      if (def.titleKeywords.length) {
        const title = String(room.title || '').toLowerCase();
        if (!def.titleKeywords.some((k) => title.includes(k))) return false;
      }
      return true;
    });

    const pageUrl = `${baseUrl}/${def.slug}`;
    const roomLinks = matches
      .map((room) => {
        const code = safeRoomCode(room.room_id || '');
        if (!code) return '';
        const price = Number(room.price || 0).toLocaleString('en-KE');
        const location = room.location || 'Kisii';
        return `<li><a href="${baseUrl}/room/${code}">${escapeHtml(room.title)} — KES ${escapeHtml(price)} in ${escapeHtml(location)}</a></li>`;
      })
      .filter(Boolean)
      .join('\n        ');

    const bodyBlocks = [`<h1>${escapeHtml(def.h1)}</h1>`, `<p>${escapeHtml(def.intro)}</p>`];
    if (matches.length) {
      bodyBlocks.push(`<ul>\n        ${roomLinks}\n      </ul>`);
    } else {
      bodyBlocks.push(`<p>${escapeHtml(EMPTY_MESSAGES[def.slug] || 'No listings yet — check back soon.')}</p>`);
    }
    const otherLinks = LANDING_PAGES.filter((d) => d.slug !== def.slug)
      .map((d) => `<a href="${baseUrl}/${d.slug}">${escapeHtml(d.h1)}</a>`)
      .join(' · ');
    bodyBlocks.push(`<p>Popular searches in Kisii: ${otherLinks}</p>`);

    const snapshot = `<main id="seo-splash">\n        ${bodyBlocks.join('\n        ')}\n      </main>`;

    const itemListJsonLd = matches.length
      ? `<script id="room-jsonld" type="application/ld+json">${JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: def.h1,
          numberOfItems: matches.length,
          itemListElement: matches.slice(0, 30).map((room, index) => {
            const code = safeRoomCode(room.room_id || '');
            return {
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Accommodation',
                name: room.title,
                url: `${baseUrl}/room/${code}`,
                offers: { '@type': 'Offer', price: room.price, priceCurrency: 'KES' },
              },
            };
          }),
        }).replace(/</g, '\\u003c')}</script>\n  `
      : '';

    let html = shell
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(def.title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(def.description)}$2`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${pageUrl}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(def.title)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(def.description)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${pageUrl}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeHtml(def.title)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeHtml(def.description)}$2`)
      .replace(/<div id="root">[\s\S]*?<\/div>/, `<div id="root">${snapshot}</div>`);

    html = html.replace('</head>', `  ${itemListJsonLd}</head>`);

    const outDir = resolve(distDir, def.slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, 'index.html'), html);

    pages.push({ path: `/${def.slug}`, priority: '0.9', changefreq: 'daily', lastmod: today });
    console.log(`✓ Generated landing page /${def.slug} (${matches.length} listings)`);
  }

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
        <p>Browse by type: <a href="${baseUrl}/bedsitters-for-rent-in-kisii">Bedsitters for Rent in Kisii</a> · <a href="${baseUrl}/single-rooms-for-rent-in-kisii">Single Rooms for Rent in Kisii</a> · <a href="${baseUrl}/houses-for-rent-in-kisii">Houses for Rent in Kisii</a></p>
      </main>
    </div>`
    );
    writeFileSync(shellPath, home);
  }

  // Landing pages were added to `pages` after the first write — regenerate the sitemap
  const finalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
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
  writeFileSync(resolve(distDir, 'sitemap.xml'), finalSitemap);
}

console.log(`✓ SEO files generated for ${baseUrl} (${pages.length} URLs)`);
