import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Room } from '@/lib/supabase';

interface ImageModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal = ({ room, isOpen, onClose }: ImageModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);

  if (!isOpen || !room) return null;

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

  const goToImage = (index: number) => {
    setImageLoading(true);
    setCurrentImageIndex(index);
  };

  const handleClose = () => {
    setCurrentImageIndex(0);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close modal when clicking on the backdrop (outside the image)
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    // Prevent closing when clicking on the image itself
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
          aria-label="Close image modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image container */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Image counter at top left */}
          {room.images.length > 1 && (
            <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full select-none">
              {currentImageIndex + 1} / {room.images.length}
            </div>
          )}
          <div className="w-full h-full flex items-center justify-center relative">
            <img
              src={room.images[currentImageIndex] || '/placeholder.svg'}
              alt={`${room.title} - Image ${currentImageIndex + 1}`}
              className={`max-w-full max-h-full object-contain cursor-pointer transition-all duration-300 ${imageLoading ? 'blur-md scale-105' : ''}`}
              onClick={handleImageClick}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
                setImageLoading(false);
              }}
              style={{ display: imageLoading ? 'block' : 'block' }}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Navigation arrows */}
          {room.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Navigation dots */}
          {room.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {room.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentImageIndex
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 