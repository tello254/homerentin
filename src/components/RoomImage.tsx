import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

interface RoomImageProps {
  src?: string | null;
  alt: string;
  /** classes for the wrapper, e.g. aspect ratio */
  containerClassName?: string;
  /** extra classes for the <img> itself, e.g. hover scale */
  imgClassName?: string;
  /** load immediately instead of lazily (for above-the-fold heroes) */
  eager?: boolean;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}

/**
 * Progressive room photo:
 * 1. shimmer placeholder so the area never sits blank-white
 * 2. the real image mounts immediately but stays heavily blurred, so
 *    partial downloads on slow networks read as a soft blur, not a
 *    harsh top-down slice, and it sharpens into focus when fully loaded
 * 3. the site's loading spinner sits on top until the image is ready
 */
const RoomImage = ({ src, alt, containerClassName = '', imgClassName = '', eager = false, onClick }: RoomImageProps) => {
  const url = src && String(src).trim() !== '' ? String(src) : '/placeholder.svg';
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  // reset when the source changes (e.g. carousel navigation)
  useEffect(() => {
    setStatus('loading');
  }, [url]);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${containerClassName}`}>
      {/* Bottom layer: shimmer while nothing has arrived yet */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" aria-hidden="true" />
      )}

      {/* The photo: blurred while downloading, sharpens on load */}
      <img
        src={url}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setStatus('loaded')}
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.src.endsWith('/placeholder.svg')) {
            img.src = '/placeholder.svg';
            setStatus('loading');
          } else {
            setStatus('error');
          }
        }}
        onClick={onClick}
        className={`w-full h-full object-cover transition-all duration-700 ${
          status === 'loaded' ? 'opacity-100 blur-0 scale-100' : 'opacity-100 blur-2xl scale-110'
        } ${imgClassName}`}
      />

      {/* Top layer: the same spinner the app uses while pages load */}
      {status === 'loading' && (
        <div className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="animate-spin rounded-full h-9 w-9 border-2 border-gray-200 border-t-kisu-green" />
        </div>
      )}

      {/* Permanent image failed to load entirely */}
      {status === 'error' && (
        <div className="absolute inset-0 z-[3] flex items-center justify-center text-gray-400" aria-label="No image available">
          <ImageOff className="w-8 h-8" />
        </div>
      )}
    </div>
  );
};

export default RoomImage;
