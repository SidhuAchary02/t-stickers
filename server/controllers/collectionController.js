import {
  createCollection,
  getUserCollections,
  addToCollection,
  removeFromCollection
} from '../services/databaseService.js';

/**
 * POST /api/collection/create
 * Create a new collection
 */
export const createNewCollection = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collection = await createCollection(req.user.id, name.trim());

    res.json({
      success: true,
      collection: {
        id: collection.id,
        name: collection.name,
        created_at: collection.created_at
      }
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'Failed to create collection' });
  }
};

/**
 * GET /api/collection/:userId
 * Get user's collections
 */
export const getUserCollectionsController = async (req, res) => {
  try {
    const { userId } = req.params;

    const collections = await getUserCollections(userId);

    res.json({
      collections: collections.map((c) => ({
        id: c.id,
        name: c.name,
        created_at: c.created_at,
        stickers: c.collection_items.map((item) => ({
          id: item.stickers?.id,
          video_url: item.stickers?.video_url,
          thumbnail_url: item.stickers?.thumbnail_url,
          duration: item.stickers?.duration
        }))
      }))
    });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
};

/**
 * POST /api/collection/add
 * Add sticker to collection
 */
export const addStickerToCollection = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { collectionId, stickerId } = req.body;

    if (!collectionId || !stickerId) {
      return res.status(400).json({ error: 'Collection ID and sticker ID are required' });
    }

    await addToCollection(collectionId, stickerId);

    res.json({ success: true });
  } catch (error) {
    console.error('Add to collection error:', error);
    res.status(500).json({ error: 'Failed to add sticker to collection' });
  }
};

/**
 * POST /api/collection/remove
 * Remove sticker from collection
 */
export const removeStickerFromCollection = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { collectionId, stickerId } = req.body;

    if (!collectionId || !stickerId) {
      return res.status(400).json({ error: 'Collection ID and sticker ID are required' });
    }

    await removeFromCollection(collectionId, stickerId);

    res.json({ success: true });
  } catch (error) {
    console.error('Remove from collection error:', error);
    res.status(500).json({ error: 'Failed to remove sticker from collection' });
  }
};
