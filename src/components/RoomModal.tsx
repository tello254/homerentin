import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, MapPin, Phone, MessageCircle, Star, Clock, Ruler, Wifi, Droplets, Shield, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Room } from '@/lib/supabase';

interface RoomModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated?: boolean;
}

const RoomModal = ({ room, isOpen, onClose, isAuthenticated = false }: RoomModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  if (!room) return null;

  const nextImage = () => {
    setImageLoading(true);
    setCurrentImageIndex((prev) => 
      prev === room.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setImageLoading(true);
    setCurrentImageIndex((prev) => 
      prev === 0 ? room.images.length - 1 : prev - 1
    );
  };

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

  const handleContact = () => {
    // Guests must sign in before calling
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    // Use the room's landlord phone if available, otherwise fallback
    const phone = room.landlord_phone || '+254703209997';
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = () => {
    // Guests must sign in before messaging on WhatsApp
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    const message = `Hi There!!, i am interested in the house id \"${room.room_id}\" please can you help me acquire it?`;
    window.open(`https://wa.me/254182544098?text=${encodeURIComponent(message)}`, '_blank');
  };

  const authPrompt = (
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
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{room.title}</DialogTitle>
        </DialogHeader>
        
        {/* Image Carousel */}
        <div className="relative">
          <div className="w-full h-64 flex items-center justify-center relative">
          <img
            src={room.images && room.images.length > 0 ? room.images[currentImageIndex] : '/placeholder.svg'}
            alt={room.title}
              className={`w-full h-64 object-cover transition-all duration-300 ${imageLoading ? 'blur-md scale-105' : ''}`}
              onLoad={() => setImageLoading(false)}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
                setImageLoading(false);
              }}
              style={{ display: imageLoading ? 'block' : 'block' }}
          />
          {/* Multiple Diagonal Watermarks */}
          <div className="pointer-events-none select-none absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
            {[
              { pos: 0.18, top: '32%', fontSize: '1.2rem' }, // first (higher, smaller)
              { pos: 0.5, top: '60%', fontSize: '1.5rem' }, // middle (lower, a bit larger)
              { pos: 0.82, top: '20%', fontSize: '1rem' }, // third (even higher, smallest)
            ].map(({ pos, top, fontSize }, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: `${pos * 100}%`,
                  top,
                  transform: 'translate(-50%, -50%) rotate(-25deg)',
                  fontSize,
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
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
          
          {room.images && room.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {room.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {room.verification && (
              <Badge variant="secondary" className="bg-blue-100/80 text-blue-600 text-xs px-2 py-1 border border-blue-200">
                <Star className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge className={`text-xs px-2 py-1 ${getStatusColor(room.status)}`}>
              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className={`text-xs px-2 py-1 ${getRoomTypeColor(room.room_type)}`}>
              {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)}
            </Badge>
          </div>
        </div>
        
        {/* Room Details */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Room ID: {room.room_id || 'N/A'}
                </span>
              </div>
              <h2 className="font-bold text-xl">{room.title}</h2>
            </div>
            <div className="flex flex-col items-end">
            <span className="text-kisu-green font-bold text-xl">KES {room.price.toLocaleString()}</span>
              {room.deposit && room.deposit > 0 && (
                <>
                  <span className="text-orange-500 font-semibold text-sm mt-2 whitespace-nowrap">
                    Deposit: KES {room.deposit.toLocaleString()}
                  </span>
                  <span className="block text-xs text-orange-400 font-normal mt-1">
                    (this is the amount you pay before moving in,<br/>paid only once and is not part of the month's rental fee)
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{room.location}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              <span>{room.distance_from_campus}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{room.time_from_campus}</span>
            </div>
          </div>

          {/* Room Features */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">Room Features:</h3>
            <div className="flex flex-wrap gap-2">
              {room.wifi && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Wifi className="w-3 h-3" />
                  WiFi
                </Badge>
              )}
              {room.interior_water_supply && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  Water
                </Badge>
              )}
              {room.working_toilet && (
                <Badge variant="outline" className="text-xs">Toilet</Badge>
              )}
              {room.sink && (
                <Badge variant="outline" className="text-xs">Sink</Badge>
              )}
              {room.ceiling && (
                <Badge variant="outline" className="text-xs">Ceiling</Badge>
              )}
              {room.flashable_toilets && (
                <Badge variant="outline" className="text-xs">Flashable Toilets</Badge>
              )}
              {room.security_rating && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Security: {room.security_rating}/5
                </Badge>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">Details:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Size:</span> {room.size}</p>
              <p><span className="font-medium">Floor:</span> {room.floor}</p>
              <p><span className="font-medium">Payment:</span> {room.payment_type}</p>
              {room.terms && (
                <p><span className="font-medium">Terms:</span> {room.terms}</p>
              )}
              {room.additional_info && (
                <p><span className="font-medium">Additional Info:</span> {room.additional_info}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleContact}
              className="flex-1 bg-kisu-green text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-kisu-green-dark transition-colors"
            >
              <Phone className="w-4 h-4" />
              Contact
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
      {authPrompt}
    </>
  );
};

export default RoomModal;
