import {
  createStickerRecord,
  getStickerById,
  getStickersFeed,
  getStickersByUserId,
  incrementUsesCount,
  deleteStickerRecord
} from '../services/databaseService.js';
import {
  processSticker,
  generateThumbnail,
  getVideoMetadata
} from '../services/ffmpegService.js';
import { uploadToStorage, deleteFromStorage } from '../services/storageService.js';
import {
  getTempDir,
  generateFilename,
  cleanupTempFile,
  validateFileSize,
  validateOutputSize,
  formatFileSize
} from '../utils/fileUtils.js';
import path from 'path';
import fs from 'fs';

/**
 * DELETE /api/sticker/:id
 * Delete a sticker (only owner can delete)
 */
export const deleteSticker = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get sticker to verify ownership
    const sticker = await getStickerById(id);

    if (!sticker) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    // Only owner can delete
    if (sticker.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized - you can only delete your own stickers' });
    }

    // Delete from storage
    const videoKey = `stickers/${req.user.id}/${sticker.video_url.split('/').pop()}`;
    const thumbnailKey = `stickers/${req.user.id}/thumbs/${sticker.thumbnail_url.split('/').pop()}`;

    try {
      await deleteFromStorage('t-stickers', videoKey);
      await deleteFromStorage('t-stickers', thumbnailKey);
    } catch (storageErr) {
      console.warn('Storage deletion warning:', storageErr);
      // Continue even if storage deletion fails
    }

    // Delete from database
    await deleteStickerRecord(id);

    res.json({ success: true, message: 'Sticker deleted' });
  } catch (error) {
    console.error('Delete sticker error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete sticker' });
  }
};

/**
 * POST /api/sticker/create
 * Create a new sticker from video + audio
 */
export const createSticker = async (req, res) => {
  let processedVideoPath = null;
  let thumbnailPath = null;
  let videoTempPath = null;
  let audioTempPath = null;

  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate file uploads
    if (!req.files || !req.files.video) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    // Extract sticker name from form data
    const stickerName = req.body.name || req.fields?.name?.[0] || 'Untitled Sticker';

    const videoFile = req.files.video[0];
    const audioFile = req.files.audio?.[0];
    const tempDir = getTempDir();

    // Validate file sizes
    if (!validateFileSize(videoFile.path, 100)) {
      cleanupTempFile(videoFile.path);
      return res.status(400).json({ error: 'Video exceeds 100MB limit' });
    }

    if (audioFile && !validateFileSize(audioFile.path, 50)) {
      cleanupTempFile(videoFile.path);
      cleanupTempFile(audioFile.path);
      return res.status(400).json({ error: 'Audio exceeds 50MB limit' });
    }

    // Store temp paths for cleanup
    videoTempPath = videoFile.path;
    audioTempPath = audioFile?.path;

    // Get video metadata
    const metadata = await getVideoMetadata(videoTempPath);
    const duration = Math.min(metadata.duration || 3, 6);

    // Process video with FFmpeg
    const processedFilename = generateFilename('mp4');
    processedVideoPath = path.join(tempDir, processedFilename);

    console.log('Processing sticker with FFmpeg...');
    await processSticker(videoTempPath, audioTempPath, processedVideoPath, duration);

    // Validate output size
    if (!validateOutputSize(processedVideoPath, 500)) {
      const size = fs.statSync(processedVideoPath).size / 1024;
      cleanupTempFile(processedVideoPath);
      return res.status(400).json({
        error: `Output file too large: ${formatFileSize(size)}. Target: <500KB`
      });
    }

    // Generate thumbnail
    const thumbnailFilename = generateFilename('png');
    thumbnailPath = path.join(tempDir, thumbnailFilename);
    console.log('Generating thumbnail...');
    await generateThumbnail(videoTempPath, thumbnailPath);

    // Upload to Supabase Storage
    const videoKey = `stickers/${req.user.id}/${processedFilename}`;
    const thumbnailKey = `stickers/${req.user.id}/thumbs/${thumbnailFilename}`;

    console.log('Uploading to storage...');
    const videoUpload = await uploadToStorage('t-stickers', processedVideoPath, videoKey);
    const thumbnailUpload = await uploadToStorage('t-stickers', thumbnailPath, thumbnailKey);

    // Create sticker record in database
    const sticker = await createStickerRecord(
      req.user.id,
      req.user.email,
      stickerName,
      videoUpload.url,
      thumbnailUpload.url,
      duration
    );

    // Cleanup temp files
    cleanupTempFile(videoTempPath);
    cleanupTempFile(audioTempPath);
    cleanupTempFile(processedVideoPath);
    cleanupTempFile(thumbnailPath);

    res.json({
      success: true,
      sticker: {
        id: sticker.id,
        video_url: sticker.video_url,
        thumbnail_url: sticker.thumbnail_url,
        duration: sticker.duration,
        share_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/s/${sticker.id}`
      }
    });
  } catch (error) {
    console.error('Sticker creation error:', error);

    // Cleanup on error
    cleanupTempFile(videoTempPath);
    cleanupTempFile(audioTempPath);
    cleanupTempFile(processedVideoPath);
    cleanupTempFile(thumbnailPath);

    res.status(500).json({
      error: error.message || 'Failed to create sticker'
    });
  }
};

/**
 * GET /api/sticker/:id
 * Get a single sticker
 */
export const getSticker = async (req, res) => {
  try {
    const { id } = req.params;

    const sticker = await getStickerById(id);

    if (!sticker) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    // Increment uses count (non-blocking)
    incrementUsesCount(id).catch(console.error);

    res.json({
      id: sticker.id,
      name: sticker.name || 'Untitled Sticker',
      video_url: sticker.video_url,
      thumbnail_url: sticker.thumbnail_url,
      duration: sticker.duration,
      uses_count: sticker.uses_count,
      created_at: sticker.created_at,
      creator_email: sticker.creator_email || sticker.users?.email || 'anonymous@t-stickers.local',
      creator: sticker.users?.email || 'Anonymous'
    });
  } catch (error) {
    console.error('Get sticker error:', error);
    res.status(500).json({ error: 'Failed to fetch sticker' });
  }
};

/**
 * GET /api/sticker/user/:userId
 * Get stickers created by a specific user
 */
export const getUserStickersController = async (req, res) => {
  try {
    const { userId } = req.params;

    const stickers = await getStickersByUserId(userId);

    res.json({
      stickers: stickers.map((s) => ({
        id: s.id,
        name: s.name || 'Untitled Sticker',
        video_url: s.video_url,
        thumbnail_url: s.thumbnail_url,
        duration: s.duration,
        uses_count: s.uses_count,
        created_at: s.created_at,
        creator_email: s.creator_email || s.users?.email || 'anonymous@t-stickers.local',
        creator: s.users?.email || 'Anonymous'
      }))
    });
  } catch (error) {
    console.error('Get user stickers error:', error);
    res.status(500).json({ error: 'Failed to fetch user stickers' });
  }
};

/**
 * GET /api/sticker/feed
 * Get stickers feed (paginated)
 */
export const getStickersFeedController = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    console.log('Fetching stickers feed:', { limit, offset });

    const stickers = await getStickersFeed(limit, offset);

    console.log('Feed result:', { count: stickers.length });

    res.json({
      stickers: stickers.map((s) => ({
        id: s.id,
        name: s.name || 'Untitled Sticker',
        video_url: s.video_url,
        thumbnail_url: s.thumbnail_url,
        duration: s.duration,
        uses_count: s.uses_count,
        created_at: s.created_at,
        creator_email: s.creator_email || s.users?.email || 'anonymous@t-stickers.local',
        creator: s.users?.email || 'Anonymous'
      })),
      pagination: {
        limit,
        offset,
        count: stickers.length
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch feed',
      details: error.message 
    });
  }
};
