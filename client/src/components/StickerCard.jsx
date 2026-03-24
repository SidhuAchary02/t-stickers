import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StickerPlayer from './StickerPlayer';

/**
 * StickerCard - Feed item component
 * Shows sticker thumbnail with basic info
 */
export const StickerCard = ({
  sticker,
  onClick = null
}) => {
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick(sticker);
    }
  };

  return (
    <Link to={`/s/${sticker.id}`}>
      <div
        className="relative rounded-lg overflow-hidden bg-dark-secondary hover:bg-dark-tertiary transition-colors cursor-pointer group"
        onClick={handleCardClick}
      >
        {/* Thumbnail or placeholder */}
        <div className="aspect-square bg-dark-tertiary relative">
          {!imageError && sticker.thumbnail_url ? (
            <img
              src={sticker.thumbnail_url}
              alt="Sticker"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-dark-secondary">
              <span className="text-gray-500 text-sm">No preview</span>
            </div>
          )}

          {/* Duration badge */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs text-white">
            {sticker.duration}s
          </div>

          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
            <div className="w-12 h-12 rounded-full bg-white bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center">
              <div className="w-0 h-0 border-l-6 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1" />
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="p-2">
          <p className="text-xs text-gray-400">{sticker.creator || 'Anonymous'}</p>
          <p className="text-xs text-gray-500">
            {new Date(sticker.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default StickerCard;
