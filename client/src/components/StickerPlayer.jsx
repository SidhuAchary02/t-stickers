import React, { useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * StickerPlayer - Video player component for stickers
 * Features: Autoplay, loop, muted by default, tap to unmute
 */
export const StickerPlayer = ({ videoUrl, className = '', onTap = null }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleTap = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    onTap?.(!isMuted);
  };

  return (
    <div
      className={`relative w-full bg-black rounded-lg overflow-hidden cursor-pointer ${className}`}
      onClick={handleTap}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Sound indicator overlay */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-2 opacity-70 group-hover:opacity-100 transition-opacity">
        {isMuted ? (
          <VolumeX size={16} className="text-white" />
        ) : (
          <Volume2 size={16} className="text-white" />
        )}
      </div>

      {/* Tap hint for mobile */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20">
        <div className="text-white text-sm font-medium">Tap for sound</div>
      </div>
    </div>
  );
};

export default StickerPlayer;
