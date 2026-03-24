import { supabase } from '../config/supabase.js';
import fs from 'fs';

/**
 * Upload file to Supabase Storage
 */
export const uploadToStorage = async (bucket, filePath, fileKey) => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const mimeType = getMimeType(filePath);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileKey, fileContent, {
        contentType: mimeType,
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileKey);

    return {
      path: data.path,
      fullPath: data.fullPath,
      url: publicData.publicUrl
    };
  } catch (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFromStorage = async (bucket, fileKey) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([fileKey]);

    if (error) throw error;
    return true;
  } catch (error) {
    throw new Error(`Storage deletion failed: ${error.message}`);
  }
};

/**
 * Get public URL for stored file
 */
export const getPublicUrl = (bucket, fileKey) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileKey);
  return data.publicUrl;
};

/**
 * Helper function to get MIME type from file extension
 */
const getMimeType = (filePath) => {
  const ext = filePath.toLowerCase().split('.').pop();
  const mimeTypes = {
    webm: 'video/webm',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    webp: 'image/webp'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};
