import type { Room } from '@/lib/supabase';

/**
 * SEO landing pages, one per keyword group people search for
 * ("houses for rent in Kisii", "bedsitters for rent in Kisii", ...).
 * Each page is prerendered at build time by scripts/generate-seo.mjs
 * and rendered live by src/pages/LandingPage.tsx — keep both configs
 * (here and in the script) in sync.
 */
export interface LandingPageDef {
  slug: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
  /** room_type values to include; empty array = all room types */
  roomTypes: string[];
  /** match these phrases in the room title (for types the DB has no column for) */
  titleKeywords?: string[];
  emptyMessage: string;
}

export const LANDING_PAGES: LandingPageDef[] = [
  {
    slug: 'houses-for-rent-in-kisii',
    h1: 'Houses for Rent in Kisii',
    title: 'Houses for Rent in Kisii — Verified Rentals from KES 4,000 | HomeRentin',
    description:
      'Browse verified rental houses in Kisii, Kenya. Bedsitters and single rooms near campus from KES 4,000 per month. View photos, compare prices and contact landlords instantly.',
    intro:
      'Every rental house on this page is verified by the HomeRentin team before it goes live — real photos, real prices, real landlords. New rooms are added continuously.',
    roomTypes: [],
    emptyMessage: 'No rental houses are available right now — new listings are added regularly, check back soon.',
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
    emptyMessage: 'No bedsitters are available right now — new listings are added regularly, check back soon.',
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
    emptyMessage: 'No single rooms are available right now — new listings are added regularly, check back soon.',
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
    emptyMessage: 'No apartments are listed yet — we add new properties regularly, check back soon or browse bedsitters and single rooms.',
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
    emptyMessage: 'No one-bedroom houses are listed yet — we add new properties regularly, check back soon or browse bedsitters and single rooms.',
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
    emptyMessage: 'No two-bedroom houses are listed yet — we add new properties regularly, check back soon or browse bedsitters and single rooms.',
  },
];

export function filterRoomsForLanding(def: LandingPageDef, rooms: Room[]): Room[] {
  let list = rooms.filter((r) => r.verification);
  if (def.roomTypes.length) {
    list = list.filter((r) => def.roomTypes.includes(r.room_type));
  }
  if (def.titleKeywords?.length) {
    list = list.filter((r) => {
      const title = (r.title || '').toLowerCase();
      return def.titleKeywords!.some((k) => title.includes(k));
    });
  }
  return list;
}
