import { useEffect } from 'react';
import type { Room } from '@/lib/supabase';

interface RoomListJsonLdProps {
  rooms: Room[];
  maxItems?: number;
}

/**
 * Injects an ItemList of the currently displayed rooms as JSON-LD
 * so search engines can read listing names, prices and availability.
 * Updated automatically whenever the room list changes.
 */
const RoomListJsonLd = ({ rooms, maxItems = 30 }: RoomListJsonLdProps) => {
  useEffect(() => {
    if (!rooms.length) return;

    const data = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Rooms and rentals on HomeRentin',
      numberOfItems: rooms.length,
      itemListElement: rooms.slice(0, maxItems).map((room, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Accommodation',
          name: `${room.title} — KES ${room.price.toLocaleString()}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: room.location || 'Kisii',
            addressCountry: 'KE',
          },
          url: room.room_id
            ? `https://homerentin.netlify.app/room/${encodeURIComponent(room.room_id)}`
            : undefined,
          offers: {
            '@type': 'Offer',
            price: room.price,
            priceCurrency: 'KES',
            availability:
              room.status === 'vacant'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        },
      })),
    };

    let script = document.getElementById('room-list-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'room-list-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }, [rooms, maxItems]);

  return null;
};

export const SITE_ORIGIN = 'https://homerentin.netlify.app';
export const DEFAULT_TITLE = 'HomeRentin — Find Rooms & Rentals Near Campus';
export const DEFAULT_DESCRIPTION =
  'HomeRentin helps you find verified bedsitters, singles and apartments near campus in Kisii, Kenya. Compare prices, view photos and contact landlords instantly.';
export const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-banner.png`;

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Updates the document title, description, canonical URL, and social tags. */
export function usePageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) {
  const { title, description, path, image = DEFAULT_IMAGE } = opts;

  useEffect(() => {
    const url = `${SITE_ORIGIN}${path}`;
    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setMeta('meta[property="og:image"]', 'property', 'og:image', image);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, path, image]);
}

export default RoomListJsonLd;
