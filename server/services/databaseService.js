import { supabase, supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new sticker record
 */
export const createStickerRecord = async (userId, userEmail, stickerName, videoUrl, thumbnailUrl, duration) => {
  const id = uuidv4();
  const { data, error } = await supabaseAdmin.from('stickers').insert([
    {
      id,
      user_id: userId,
      name: stickerName || 'Untitled Sticker',
      creator_email: userEmail,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      duration: Math.min(Math.round(duration), 6),
      uses_count: 0,
      created_at: new Date().toISOString()
    }
  ]);

  if (error) {
    console.error('Database error creating sticker:', error);
    throw error;
  }
  
  // Return the created record with proper structure
  return {
    id,
    user_id: userId,
    name: stickerName || 'Untitled Sticker',
    creator_email: userEmail,
    video_url: videoUrl,
    thumbnail_url: thumbnailUrl,
    duration: Math.min(Math.round(duration), 6),
    uses_count: 0,
    created_at: new Date().toISOString()
  };
};

/**
 * Get a sticker by ID
 */
export const getStickerById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('stickers')
      .select(`
        id,
        user_id,
        name,
        creator_email,
        video_url,
        thumbnail_url,
        duration,
        uses_count,
        created_at,
        users(email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error in getStickerById:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching sticker:', error.message);
    throw error;
  }
};

/**
 * Get stickers feed (latest first, paginated)
 */
export const getStickersFeed = async (limit = 20, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('stickers')
      .select(`
        id,
        user_id,
        name,
        creator_email,
        video_url,
        thumbnail_url,
        duration,
        uses_count,
        created_at,
        users(email)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error in getStickersFeed:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching stickers feed:', error.message);
    // Return empty array as fallback - feed is public, don't fail hard
    return [];
  }
};

/**
 * Increment sticker uses count
 */
export const incrementUsesCount = async (stickerId) => {
  const { data, error } = await supabaseAdmin.rpc('increment_uses', {
    sticker_id: stickerId
  });

  if (error) throw error;
  return data;
};

/**
 * Create a collection
 */
export const createCollection = async (userId, name) => {
  const id = uuidv4();
  const { data, error } = await supabaseAdmin.from('collections').insert([
    {
      id,
      user_id: userId,
      name,
      created_at: new Date().toISOString()
    }
  ]);

  if (error) throw error;
  return { id, ...data[0] };
};

/**
 * Get user's collections
 */
export const getUserCollections = async (userId) => {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      id,
      user_id,
      name,
      created_at,
      collection_items(
        sticker_id,
        stickers(id, video_url, thumbnail_url, duration)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Add sticker to collection
 */
export const addToCollection = async (collectionId, stickerId) => {
  const id = uuidv4();
  const { data, error } = await supabaseAdmin.from('collection_items').insert([
    {
      id,
      collection_id: collectionId,
      sticker_id: stickerId
    }
  ]);

  if (error) throw error;
  return { id, ...data[0] };
};

/**
 * Remove sticker from collection
 */
export const removeFromCollection = async (collectionId, stickerId) => {
  const { data, error } = await supabase
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('sticker_id', stickerId);

  if (error) throw error;
  return data;
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create or update user profile
 */
export const upsertUser = async (userId, email) => {
  const { data, error } = await supabaseAdmin.from('users').upsert(
    [
      {
        id: userId,
        email,
        created_at: new Date().toISOString()
      }
    ],
    { onConflict: 'id' }
  ).select();

  if (error) throw error;
  return data?.[0] || { id: userId, email };
};
