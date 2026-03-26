import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StickerPlayer from '../components/StickerPlayer';
import ShareButton from '../components/ShareButton';
import MetaTags from '../components/MetaTags';
import { stickerAPI, collectionAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Loader, ChevronLeft, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';

const ViewStickerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sticker, setSticker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [showCollectionMenu, setShowCollectionMenu] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = user && sticker && sticker.user_id === user.id;

  useEffect(() => {
    const loadSticker = async () => {
      try {
        setLoading(true);
        const response = await stickerAPI.getById(id);
        setSticker(response.data);
        setError(null);
      } catch (err) {
        console.error('Load sticker error:', err);
        setError('Failed to load sticker');
      } finally {
        setLoading(false);
      }
    };

    const loadCollections = async () => {
      if (!user) return;
      try {
        const response = await collectionAPI.getByUser(user.id);
        setCollections(response.data.collections || []);
      } catch (err) {
        console.warn('Load collections error:', err);
      }
    };

    loadSticker();
    loadCollections();
  }, [id, user]);

  const handleAddToCollection = async (collectionId) => {
    if (!sticker) return;

    try {
      setAddingToCollection(true);
      await collectionAPI.addSticker(collectionId, sticker.id);
      setSelectedCollectionId(collectionId);
      setTimeout(() => setShowCollectionMenu(false), 1000);
    } catch (error) {
      console.error('Add to collection error:', error);
    } finally {
      setAddingToCollection(false);
    }
  };

  const handleDeleteSticker = async () => {
    if (!confirm('Are you sure you want to delete this sticker? This cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await stickerAPI.delete(sticker.id);
      // Redirect to home after successful deletion
      navigate('/');
    } catch (error) {
      console.error('Delete sticker error:', error);
      alert('Failed to delete sticker');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-gray-500" size={32} />
      </div>
    );
  }

  if (error || !sticker) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-400 mb-6"
        >
          <ChevronLeft size={20} />
          Back to Feed
        </button>
        <div className="p-6 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg text-red-300">
          {error || 'Sticker not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <MetaTags
        title={sticker.name || `${sticker.duration}s Sticker`}
        description={`${sticker.duration}s talking sticker`}
        image={sticker.thumbnail_url}
        url={window.location.href}
        type="video.other"
      />
      
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-400 mb-6"
      >
        <ChevronLeft size={20} />
        Back to Feed
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Sticker Display */}
        <div className="md:col-span-2">
          <div className="bg-dark-secondary rounded-lg overflow-hidden aspect-square">
            <StickerPlayer videoUrl={sticker.video_url} />
          </div>
        </div>

        {/* Sticker Info & Actions */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white break-words">{sticker.name || 'Untitled Sticker'}</h1>
            <p className="text-gray-400 mt-1">by {sticker.creator_email?.split('@')[0] || 'Anonymous'}</p>
            <p className="text-xs text-gray-600 mt-2">
              {sticker.duration}s • {sticker.uses_count} plays
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-secondary p-4 rounded-lg">
              <p className="text-xs text-gray-500">Plays</p>
              <p className="text-xl font-bold">{sticker.uses_count}</p>
            </div>
            <div className="bg-dark-secondary p-4 rounded-lg">
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-xl font-bold">{sticker.duration}s</p>
            </div>
          </div>

          {/* Share Button */}
          <ShareButton stickerId={sticker.id} className="w-full justify-center" />

          {/* Add to Collection (if logged in and own stickers) */}
          {user && collections.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowCollectionMenu(!showCollectionMenu)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-dark-secondary hover:bg-dark-tertiary text-white rounded-lg transition-colors"
              >
                {selectedCollectionId ? (
                  <>
                    <BookmarkCheck size={16} />
                    Saved to Collection
                  </>
                ) : (
                  <>
                    <Bookmark size={16} />
                    Save to Collection
                  </>
                )}
              </button>

              {showCollectionMenu && (
                <div className="absolute bottom-full mb-2 w-full bg-dark-secondary border border-dark-tertiary rounded-lg overflow-hidden z-10">
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      onClick={() => handleAddToCollection(collection.id)}
                      disabled={addingToCollection}
                      className="w-full text-left px-4 py-2 hover:bg-dark-tertiary transition-colors disabled:opacity-50 text-sm"
                    >
                      {collection.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Copy URL */}
          <button
            onClick={() => {
              const url = `${window.location.origin}/s/${sticker.id}`;
              navigator.clipboard.writeText(url);
            }}
            className="w-full px-4 py-2 bg-dark-secondary hover:bg-dark-tertiary text-gray-300 rounded-lg transition-colors text-sm"
          >
            Copy Link
          </button>

          {/* Delete Button (only for owner) */}
          {isOwner && (
            <button
              onClick={handleDeleteSticker}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting...' : 'Delete Sticker'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStickerPage;
