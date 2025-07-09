import { useState } from 'react';
import RoomCard from './RoomCard';
import RoomModal from './RoomModal';
import ImageModal from './ImageModal';
import { useRooms } from '@/hooks/useSupabase';
import type { Room } from '@/lib/supabase';

interface RoomListingsProps {
  filters: {
    roomType: string;
    area: string;
    priceRange: string;
  };
  searchQuery?: string;
  onBookmark?: (room: Room) => void;
  customRooms?: Room[];
  bookmarkedRooms?: Room[];
  showBookmarkButton?: boolean;
}

// Fallback placeholder rooms when database is not connected or empty
const placeholderRooms: Room[] = [
    {
      id: '1',
      room_id: '00200',
    title: 'Cozy Bedsitter Near Campus',
    price: 25000,
    time_from_campus: '10 minutes',
    distance_from_campus: '1.2 km',
    verification: true,
      status: 'vacant',
    room_type: 'bedsitter',
    location: 'Westlands, Nairobi',
    payment_type: 'monthly',
    floor: '2nd floor',
    interior_water_supply: true,
    ceiling: true,
    size: '15x20 feet',
    sink: true,
    working_toilet: true,
    flashable_toilets: true,
    security_rating: 4,
    wifi: true,
    additional_info: 'Near shopping center, quiet neighborhood, 24/7 security',
    landlord_phone: '+254700000001',
    position: 1,
    images: ['/placeholder.svg'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
    },
    {
      id: '2',
      room_id: '00201',
    title: 'Modern Studio Apartment',
    price: 45000,
    time_from_campus: '15 minutes',
    distance_from_campus: '2.1 km',
    verification: true,
      status: 'vacant',
    room_type: 'studio',
    location: 'Kilimani, Nairobi',
    payment_type: 'monthly',
    floor: '3rd floor',
    interior_water_supply: true,
    ceiling: true,
    size: '20x25 feet',
    sink: true,
    working_toilet: true,
    flashable_toilets: true,
    security_rating: 5,
    wifi: true,
    additional_info: 'Modern amenities, parking available, elevator access',
    landlord_phone: '+254700000002',
    position: 2,
    images: ['/placeholder.svg'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
    },
    {
      id: '3',
      room_id: '00202',
    title: 'Affordable Single Room',
    price: 18000,
    time_from_campus: '8 minutes',
    distance_from_campus: '0.8 km',
    verification: false,
    status: 'vacant',
    room_type: 'single',
    location: 'Hurlingham, Nairobi',
    payment_type: 'monthly',
    floor: '1st floor',
    interior_water_supply: false,
    ceiling: true,
    size: '12x15 feet',
    sink: false,
    working_toilet: true,
    flashable_toilets: false,
    security_rating: 3,
    wifi: false,
    additional_info: 'Basic accommodation, shared bathroom, budget-friendly',
    landlord_phone: '+254700000003',
    position: 3,
    images: ['/placeholder.svg'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
    },
    {
      id: '4',
      room_id: '00203',
    title: 'Luxury Apartment Complex',
    price: 65000,
    time_from_campus: '20 minutes',
    distance_from_campus: '3.5 km',
    verification: true,
      status: 'vacant',
    room_type: 'apartment',
    location: 'Lavington, Nairobi',
    payment_type: 'monthly',
    floor: '5th floor',
    interior_water_supply: true,
    ceiling: true,
    size: '25x30 feet',
    sink: true,
    working_toilet: true,
    flashable_toilets: true,
    security_rating: 5,
    wifi: true,
    additional_info: 'Luxury apartment with gym, swimming pool, and 24/7 concierge',
    landlord_phone: '+254700000004',
    position: 4,
    images: ['/placeholder.svg'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
    },
    {
      id: '5',
      room_id: '00204',
    title: 'Student Shared Room',
    price: 12000,
    time_from_campus: '5 minutes',
    distance_from_campus: '0.5 km',
    verification: true,
    status: 'vacant',
    room_type: 'shared',
    location: 'Campus Area, Nairobi',
    payment_type: 'monthly',
    floor: '1st floor',
    interior_water_supply: true,
    ceiling: true,
    size: '18x22 feet',
    sink: true,
    working_toilet: true,
    flashable_toilets: true,
    security_rating: 4,
    wifi: true,
    additional_info: 'Perfect for students, shared kitchen, study area available',
    landlord_phone: '+254700000005',
    position: 5,
    images: ['/placeholder.svg'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const RoomListings = ({ filters, searchQuery = '', onBookmark, customRooms, bookmarkedRooms, showBookmarkButton }: RoomListingsProps) => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Use custom rooms if provided, otherwise use Supabase data
  let rooms: Room[] = [];
  let loading = false;
  let error: string | null = null;

  if (customRooms) {
    // Use custom rooms (for bookmarks)
    rooms = customRooms;
  } else {
    // Use Supabase data only
    try {
      const supabaseData = useRooms({
        roomType: filters.roomType !== 'all' ? filters.roomType : undefined,
        priceRange: filters.priceRange !== 'all' ? filters.priceRange : undefined,
        area: filters.area !== 'all' ? filters.area : undefined
      });
      rooms = supabaseData.rooms;
      loading = supabaseData.loading;
      error = supabaseData.error;
    } catch (err) {
      rooms = [];
      error = 'Failed to fetch rooms';
    }
  }

  // Sort rooms by position
  const sortedRooms = [...rooms].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  // Filter rooms by search query (title search)
  const filteredRooms = searchQuery.trim() 
    ? sortedRooms.filter(room => 
        room.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedRooms;

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleImageClick = (room: Room) => {
    setSelectedRoom(room);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedRoom(null);
  };

  const handleBookmark = (room: Room) => {
    if (onBookmark) {
      onBookmark(room);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading rooms...</p>
      </div>
    );
  }

  // Show search results info
  if (searchQuery.trim() && filteredRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
        <p className="text-gray-500 mb-4">No rooms match your search for "{searchQuery}"</p>
      </div>
    );
  }

  // Show empty state if no rooms match filters
  if (filteredRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-gray-400 text-6xl mb-4">🏠</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
        <p className="text-gray-500">No rooms match your filters. Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Search results info */}
      {searchQuery.trim() && (
        <div className="px-4 py-3 bg-blue-50 border-b">
          <p className="text-sm text-blue-700">
            Found {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} for "{searchQuery}"
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-1 sm:px-2 md:px-4 max-w-full overflow-x-hidden">
        {filteredRooms.map((room) => (
          <RoomCard 
            key={room.id} 
            room={room} 
            onClick={() => handleRoomClick(room)}
            onBookmark={handleBookmark}
            onImageClick={handleImageClick}
            isBookmarked={bookmarkedRooms?.some(bookmarkedRoom => bookmarkedRoom.id === room.id)}
            showBookmarkButton={showBookmarkButton}
          />
        ))}
      </div>
      <RoomModal 
        room={selectedRoom}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      <ImageModal
        room={selectedRoom}
        isOpen={isImageModalOpen}
        onClose={handleCloseImageModal}
      />
    </div>
  );
};

export default RoomListings;
