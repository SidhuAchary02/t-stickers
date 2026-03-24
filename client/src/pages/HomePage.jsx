import React, { useEffect, useState, useCallback } from 'react';
import StickerCard from '../components/StickerCard';
import { stickerAPI } from '../utils/api';
import { Loader } from 'lucide-react';

const HomePage = () => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  const loadFeed = useCallback(async (loadMore = false) => {
    try {
      setLoading(true);
      const newOffset = loadMore ? offset + LIMIT : 0;
      const response = await stickerAPI.getFeed(LIMIT, newOffset);

      const newStickers = response.data.stickers;
      setStickers(loadMore ? [...stickers, ...newStickers] : newStickers);
      setOffset(newOffset);
      setHasMore(newStickers.length === LIMIT);
      setError(null);
    } catch (err) {
      console.error('Feed error:', err);
      // Don't show error state if we already have stickers loaded
      if (stickers.length === 0) {
        setError(null);
        // Try to load anyway - fetch will be retried
      }
    } finally {
      setLoading(false);
    }
  }, [offset, stickers]);

  useEffect(() => {
    loadFeed();
  }, []);

  const handleLoadMore = () => {
    loadFeed(true);
  };

  if (loading && stickers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Latest Stickers</h1>
        <p className="text-gray-400 mt-1">Browse and save your favorite stickers</p>
      </div>

      {stickers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No stickers yet. Be the first to create one!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {stickers.map((sticker) => (
              <StickerCard key={sticker.id} sticker={sticker} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex items-center justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
