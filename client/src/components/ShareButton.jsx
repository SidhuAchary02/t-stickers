import React from 'react';
import { Share2 } from 'lucide-react';

/**
 * ShareButton - WhatsApp share functionality
 */
export const ShareButton = ({ stickerId, className = '' }) => {
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/s/${stickerId}`;
    const message = encodeURIComponent(`😂 Tap to hear this 👇\n${shareUrl}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${className}`}
    >
      <Share2 size={16} />
      <span className="text-sm font-medium">Share on WhatsApp</span>
    </button>
  );
};

export default ShareButton;
