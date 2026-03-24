import React, { useEffect, useState } from 'react';
import { collectionAPI, stickerAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Loader, Plus, Trash2 } from 'lucide-react';
import StickerCard from '../components/StickerCard';

export const CollectionsPage = () => {
    const { user } = useAuth();
    const [collections, setCollections] = useState([]);
    const [userStickers, setUserStickers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [creatingCollection, setCreatingCollection] = useState(false);

    useEffect(() => {
        loadCollections();
        loadUserStickers();
    }, []);

    const loadUserStickers = async () => {
        if (!user) return;

        try {
            const response = await stickerAPI.getByUser(user.id);
            setUserStickers(response.data.stickers || []);
        } catch (err) {
            console.error('Load user stickers error:', err);
            setUserStickers([]);
        }
    };

    const loadCollections = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const response = await collectionAPI.getByUser(user.id);
            setCollections(response.data.collections || []);
            setError(null);
        } catch (err) {
            console.error('Load collections error:', err);
            setError('Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();

        if (!newCollectionName.trim()) {
            return;
        }

        try {
            setCreatingCollection(true);
            const response = await collectionAPI.create(newCollectionName);
            setCollections([...collections, response.data.collection]);
            setNewCollectionName('');
        } catch (error) {
            console.error('Create collection error:', error);
            alert('Failed to create collection');
        } finally {
            setCreatingCollection(false);
        }
    };

    const handleRemoveSticker = async (collectionId, stickerId) => {
        if (!confirm('Remove this sticker from the collection?')) return;

        try {
            await collectionAPI.removeSticker(collectionId, stickerId);
            setCollections(
                collections.map((c) =>
                    c.id === collectionId
                        ? { ...c, stickers: c.stickers.filter((s) => s.id !== stickerId) }
                        : c
                )
            );
        } catch (error) {
            console.error('Remove sticker error:', error);
            alert('Failed to remove sticker');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader className="animate-spin text-gray-500" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">My Sticker Packs</h1>
                <p className="text-gray-400 mt-1">Create and organize your sticker collections</p>
            </div>

            {/* My Created Stickers Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold mb-4">My Created Stickers</h2>
                {userStickers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No stickers created yet. <a href="/create" className="text-blue-500 hover:text-blue-400">Create one now!</a></p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {userStickers.map((sticker) => (
                            <StickerCard key={sticker.id} sticker={sticker} />
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg text-red-300 mb-6">
                    {error}
                </div>
            )}

            {/* My Collections Section */}
            <div>
                <h2 className="text-2xl font-bold mb-6">My Collections</h2>

                {/* Create collection form */}
                <form onSubmit={handleCreateCollection} className="mb-8 space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="New collection name..."
                            className="flex-1 px-4 py-2 bg-dark-secondary border border-dark-tertiary rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={creatingCollection}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            <Plus size={16} />
                            Create
                        </button>
                    </div>
                </form>
            </div>

            {/* Collections */}
            {collections.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400">No collections yet. Create one to get started!</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {collections.map((collection) => (
                        <div key={collection.id}>
                            <h2 className="text-2xl font-bold mb-4">{collection.name}</h2>

                            {collection.stickers.length === 0 ? (
                                <p className="text-gray-500 text-sm">No stickers in this collection yet</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {collection.stickers.map((sticker) => (
                                        <div key={sticker.id} className="relative group">
                                            <StickerCard sticker={sticker} />
                                            <button
                                                onClick={() => handleRemoveSticker(collection.id, sticker.id)}
                                                className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Remove from collection"
                                            >
                                                <Trash2 size={14} className="text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

}
