import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { MapPin, BadgeCheck } from 'lucide-react';
import { roomsApi, type Room } from '@/lib/supabase';
import { usePageMeta } from '@/components/Seo';
import RoomListJsonLd from '@/components/Seo';
import RoomImage from '@/components/RoomImage';
import { LANDING_PAGES, filterRoomsForLanding } from '@/lib/landingPages';

/**
 * Public landing page for one keyword group, e.g. /bedsitters-for-rent-in-kisii.
 * The server serves a prerendered snapshot first; this takes over once JS loads.
 */
const LandingPage = ({ slug: slugProp }: { slug?: string }) => {
  const params = useParams();
  const slug = slugProp || params.slug || '';
  const def = LANDING_PAGES.find((d) => d.slug === slug);
  const [rooms, setRooms] = useState<Room[] | null>(null);

  usePageMeta({
    title: def?.title || 'HomeRentin',
    description: def?.description || 'Find verified rooms and rentals near campus in Kisii, Kenya.',
    path: `/${slug}`,
  });

  useEffect(() => {
    if (!def) return;
    let cancelled = false;
    roomsApi.getRooms({ verification: true }).then(({ data }) => {
      if (cancelled) return;
      setRooms(filterRoomsForLanding(def, (data as Room[]) || []));
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!def) return <Navigate to="/" replace />;

  const others = LANDING_PAGES.filter((d) => d.slug !== def.slug);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple top bar consistent with the main site */}
      <header className="bg-kisu-green text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">HomeRentin</Link>
          <Link to="/" className="text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors">
            All rooms
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">{def.h1}</h1>
        <p className="mt-3 text-gray-600 max-w-3xl">{def.intro}</p>

        {rooms === null ? (
          <div className="mt-10 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-kisu-green" aria-label="Loading" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-8 text-center max-w-lg">
            <p className="text-gray-700">{def.emptyMessage}</p>
            <Link
              to="/"
              className="mt-4 inline-block bg-kisu-green hover:bg-kisu-green-dark text-white rounded-lg px-5 py-2.5 font-medium transition-colors"
            >
              Browse all rooms
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm font-medium text-gray-500">
              {rooms.length} verified {rooms.length === 1 ? 'listing' : 'listings'} available now
            </p>
            <RoomListJsonLd rooms={rooms} />
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/room/${encodeURIComponent(room.room_id)}`}
                  className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-[4/3]">
                    <RoomImage
                      src={room.images?.[0] || null}
                      alt={room.title}
                      containerClassName="w-full h-full"
                      imgClassName="group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-gray-900 line-clamp-2">{room.title}</h2>
                      {room.verification && <BadgeCheck className="w-5 h-5 text-kisu-green shrink-0" />}
                    </div>
                    <p className="mt-1 text-lg font-bold text-kisu-green">
                      KES {room.price.toLocaleString()}<span className="text-xs font-normal text-gray-500">/month</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      {room.location || 'Kisii'}
                    </p>
                    <p className="mt-3 text-sm font-medium text-kisu-green group-hover:underline">View room →</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Internal links between landing pages help crawlers find every page */}
        <section className="mt-12 border-t border-gray-200 pt-6 pb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Popular searches in Kisii</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {others.map((d) => (
              <Link
                key={d.slug}
                to={`/${d.slug}`}
                className="text-sm bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-700 hover:border-kisu-green hover:text-kisu-green transition-colors"
              >
                {d.h1}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} HomeRentin — verified rooms near campus in Kisii
      </footer>
    </div>
  );
};

export default LandingPage;
