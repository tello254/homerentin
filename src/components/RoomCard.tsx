import { MapPin, Phone, MessageCircle, Star, Clock, Ruler, Bookmark, Info, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Room } from '@/lib/supabase';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
  onBookmark?: (room: Room) => void;
  onImageClick?: (room: Room) => void;
  isBookmarked?: boolean;
  showBookmarkButton?: boolean;
}

const RoomCard = ({ room, onClick, onBookmark, onImageClick, isBookmarked, showBookmarkButton = true }: RoomCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vacant':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'bedsitter':
        return 'bg-purple-100 text-purple-800';
      case 'single':
        return 'bg-blue-100 text-blue-800';
      case 'apartment':
        return 'bg-indigo-100 text-indigo-800';
      case 'studio':
        return 'bg-pink-100 text-pink-800';
      case 'shared':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Make phone call to the specified number
    window.location.href = 'tel:+254756600218';
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hi, I'm interested in the ${room.room_type} at ${room.location} for KES ${room.price.toLocaleString()}`;
    window.open(`https://wa.me/254756600218?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleFullInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(); // This will open the modal with full information
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) {
      onBookmark(room);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(room);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden mb-4 mx-4 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="relative">
        <img
          src={room.images && room.images.length > 0 ? room.images[0] : '/placeholder.svg'}
          alt={room.title}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={handleImageClick}
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute top-2 left-2">
          {room.verification && (
            <div className="flex items-center gap-1 text-blue-500 text-xs font-medium bg-blue-100/80 px-2 py-1 rounded-full">
              <Shield className="w-4 h-4" />
              Verified
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={`text-xs px-2 py-1 ${getStatusColor(room.status)}`}>
            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        {/* First Row: Title and Price */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg flex-1 mr-2">{room.title}</h3>
          <span className="text-kisu-green font-bold text-lg">KES {room.price.toLocaleString()}</span>
        </div>
        
        {/* Second Row: Full Information and Bookmark Buttons */}
        <div className="flex justify-between items-center mb-3">
          <Badge 
            onClick={handleFullInfo}
            className="bg-gray-100 text-gray-700 border border-blue-500 text-xs px-3 py-1 cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            Full Information
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
              ID: {room.room_id || 'N/A'}
            </span>
            {showBookmarkButton && (
              <Badge 
                onClick={handleBookmark}
                className={`text-xs px-2 py-1 cursor-pointer transition-colors flex items-center gap-1 ${
                  isBookmarked 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-green-200 hover:text-green-700'
                }`}
                aria-label={isBookmarked ? "Unbookmark this room" : "Bookmark this room"}
              >
                <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-current' : ''}`} />
              </Badge>
            )}
          </div>
        </div>
        
        {/* Third Row: Location and Room Type */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{room.location}</span>
          </div>
          <Badge className={`text-xs px-2 py-1 ${getRoomTypeColor(room.room_type)}`}>
            {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)}
          </Badge>
        </div>
        
        {/* Fourth Row: Contact and WhatsApp Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleContact}
            className="flex-1 bg-kisu-green text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-kisu-green-dark transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            Contact
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
