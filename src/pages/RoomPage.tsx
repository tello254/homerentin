import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { roomsApi, type Room } from '@/lib/supabase';
import { usePageMeta } from '@/components/Seo';

const RoomPage = () => {
  const { roomId = '' } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    roomsApi.getRoomByCode(decodeURIComponent(roomId)).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data) {
        setRoom(null);
        setMissing(true);
      } else {
        setRoom(data as Room);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  const title = room
    ? `${room.title} — KES ${room.price.toLocaleString()} | HomeRentin`
    : missing
      ? 'Room not found | HomeRentin'
      : 'Room listing | HomeRentin';
  const description = room
    ? `${room.room_type} in ${room.location || 'Kisii'} for KES ${room.price.toLocaleString()}. ${room.distance_from_campus ? `${room.distance_from_campus} from campus. ` : ''}${room.additional_info || 'View photos and contact the landlord on HomeRentin.'}`.slice(0, 160)
    : 'This HomeRentin listing could not be found.';
  const image = room?.images?.find((src) => src.startsWith('http')) ;

  usePageMeta({
    title,
    description,
    path: `/room/${encodeURIComponent(roomId)}`,
    image,
  });

  useEffect(() => {
    if (!room) return;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Accommodation',
      name: room.title,
      description: room.additional_info || description,
      url: `https://homerentin.netlify.app/room/${encodeURIComponent(room.room_id)}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: room.location || 'Kisii',
        addressRegion: 'Kisii County',
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
    };
    let script = document.getElementById('room-jsonld') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'room-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
    return () => {
      script?.remove();
    };
  }, [room, description]);

  const callLandlord = () => {
    const phone = room?.landlord_phone || '+254703209997';
    window.location.href = `tel:${phone}`;
  };

  const openWhatsApp = () => {
    if (!room) return;
    const message = `Hi There!!, i am interested in the house id "${room.room_id}" please can you help me acquire it?`;
    window.open(`https://wa.me/254182544098?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-kisu-green text-white px-4 py-3">
        <Link to="/" className="text-sm font-medium underline-offset-2 hover:underline">
          All rooms
        </Link>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading && <p className="text-gray-600">Loading listing…</p>}
        {missing && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h1>
            <p className="text-gray-600 mb-4">This room is unavailable or has not been verified yet.</p>
            <Link to="/" className="text-kisu-green font-medium">Browse rooms in Kisii</Link>
          </div>
        )}
        {room && (
          <article>
            <img
              src={room.images?.[0] || '/placeholder.svg'}
              alt={room.title}
              className="w-full aspect-[4/3] object-cover rounded-xl bg-gray-100 mb-4"
            />
            <p className="text-sm text-gray-500 mb-1">ID {room.room_id}</p>
            <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
            <p className="text-kisu-green text-xl font-bold mt-2">KES {room.price.toLocaleString()}</p>
            <p className="flex items-center text-gray-700 mt-2">
              <MapPin className="w-4 h-4 mr-1" />
              {room.location || 'Kisii'} · {room.room_type} · {room.status}
            </p>
            {(room.distance_from_campus || room.time_from_campus) && (
              <p className="text-gray-600 mt-1">
                {room.distance_from_campus} from campus
                {room.time_from_campus ? ` · ${room.time_from_campus}` : ''}
              </p>
            )}
            {room.additional_info && (
              <p className="text-gray-700 mt-4 leading-relaxed">{room.additional_info}</p>
            )}
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={callLandlord}
                className="flex-1 bg-kisu-green text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Contact
              </button>
              <button
                type="button"
                onClick={openWhatsApp}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default RoomPage;
