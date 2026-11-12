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

export default RoomListJsonLd;
