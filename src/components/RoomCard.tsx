import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Bookmark, Info, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import RoomImage from '@/components/RoomImage';
import type { Room } from '@/lib/supabase';

interface RoomCardProps {
  room: Room;
  onClick: () => void;
  onBookmark?: (room: Room) => void;
  onImageClick?: (room: Room) => void;
  isBookmarked?: boolean;
  showBookmarkButton?: boolean;
  showVerificationStatus?: boolean;
  isAuthenticated?: boolean;
}

const RoomCard = ({ room, onClick, onBookmark, onImageClick, isBookmarked, showBookmarkButton = true, showVerificationStatus = false, isAuthenticated = false }: RoomCardProps) => {
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
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
    // Guests must sign in before calling
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    // Make phone call to the specified number
    window.location.href = 'tel:+254703209997';
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Guests must sign in before messaging on WhatsApp
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    const message = `Hi There!!, i am interested in the house id \"${room.room_id}\" please can you help me acquire it?`;
    window.open(`https://wa.me/254182544098?text=${encodeURIComponent(message)}`, '_blank');
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

  let verificationLabel = '';
  let verificationColor = '';
  if (showVerificationStatus) {
    if (room.verification) {
      verificationLabel = 'Approved';
      verificationColor = 'bg-green-100 text-green-800 border-green-400';
    } else if (room.status === 'pending') {
      verificationLabel = 'Pending';
      verificationColor = 'bg-yellow-100 text-yellow-800 border-yellow-400';
    } else if (!['vacant', 'occupied', 'maintenance', 'pending'].includes(room.status)) {
      // Any status not in the allowed list is considered Denied
      verificationLabel = 'Denied';
      verificationColor = 'bg-red-100 text-red-800 border-red-400';
    } else {
      verificationLabel = 'Pending';
      verificationColor = 'bg-yellow-100 text-yellow-800 border-yellow-400';
    }
  }

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden mb-4 w-full cursor-pointer transition-shadow [content-visibility:auto] [contain-intrinsic-size:auto_380px]"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        <RoomImage
          src={room.images && room.images.length > 0 ? room.images[0] : null}
          alt={room.title}
          containerClassName="absolute inset-0"
          imgClassName="cursor-pointer"
          onClick={handleImageClick}
        />
        {/* Multiple Diagonal Watermarks */}
        <div className="pointer-events-none select-none absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
          {[
            { pos: 0.2, top: '40%' }, // first (higher)
            { pos: 0.5, top: '55%' }, // middle (lower)
            { pos: 0.8, top: '30%' }, // third (even higher)
          ].map(({ pos, top }, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                left: `${pos * 100}%`,
                top,
                transform: 'translate(-50%, -50%) rotate(-25deg)',
                fontSize: '1.1rem',
                color: 'rgba(0,0,0,0.13)',
                fontWeight: 700,
                letterSpacing: 2,
                textShadow: '0 1px 4px rgba(0,0,0,0.10)',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                WebkitTextStroke: '1px rgba(255,255,255,0.25)',
                border: 'none',
                pointerEvents: 'none',
              }}
            >
              HOMERENTIN
            </span>
          ))}
        </div>
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
          <h3 className="font-semibold text-lg flex-1 mr-2">
            {room.room_id ? (
              <Link
                to={`/room/${encodeURIComponent(room.room_id)}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {room.title}
              </Link>
            ) : (
              room.title
            )}
          </h3>
          <div className="flex flex-col items-end">
            <span className="text-kisu-green font-bold text-lg">KES {room.price.toLocaleString()}</span>
            {room.deposit !== undefined && room.deposit !== null && (
              <span className="text-orange-500 font-semibold text-sm mt-1">Deposit: KES {room.deposit.toLocaleString()}</span>
            )}
          </div>
        </div>
        
        {/* Second Row: Full Information and Bookmark Buttons */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
          <Badge 
            onClick={handleFullInfo}
            className="bg-gray-100 text-gray-700 border border-blue-500 text-xs px-3 py-1 cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            Full Information
          </Badge>
            {showVerificationStatus && (
              <Badge className={`ml-2 border text-xs px-2 py-1 ${verificationColor}`}>{verificationLabel}</Badge>
            )}
          </div>
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

      {/* Sign-in prompt shown when guests try to contact a landlord */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Sign in to contact landlords</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 text-center">
            Browsing is free! Create a free account or log in to call or WhatsApp landlords about this room.
          </p>
          <div className="flex gap-2 mt-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/login" onClick={() => setShowAuthPrompt(false)}>Log In</Link>
            </Button>
            <Button asChild className="flex-1 bg-kisu-green hover:bg-kisu-green-dark text-white">
              <Link to="/login" onClick={() => setShowAuthPrompt(false)}>Sign Up</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomCard;
