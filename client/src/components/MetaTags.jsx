import React, { useEffect } from 'react';

/**
 * MetaTags - Update document head with OpenGraph tags for social sharing
 * Used for WhatsApp and other social media previews
 */
export const MetaTags = ({
  title = 't-stickers',
  description = 'Check out this awesome talking sticker!',
  image = null,
  url = null,
  type = 'video.other'
}) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Helper to set or update meta tag
    const setMetaTag = (name, content, property = false) => {
      const attr = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Set standard meta tags
    setMetaTag('description', description);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:type', type, true);

    if (image) {
      // Ensure image is absolute URL - if it starts with storage domain, use it as-is
      // Otherwise, it might be relative or need adjustment
      const absoluteImage = image.startsWith('http') ? image : image;
      
      setMetaTag('og:image', absoluteImage, true);
      setMetaTag('og:image:type', 'image/png', true);
      setMetaTag('og:image:width', '512', true);
      setMetaTag('og:image:height', '512', true);
      setMetaTag('twitter:image', absoluteImage);
      setMetaTag('twitter:image:alt', title);
    }

    if (url) {
      setMetaTag('og:url', url, true);
    }

    // Twitter card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);

    return () => {
      // Cleanup is optional - meta tags can persist
    };
  }, [title, description, image, url, type]);

  return null; // This component doesn't render anything
};

export default MetaTags;
