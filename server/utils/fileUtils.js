import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a temporary directory for file processing
 */
export const getTempDir = () => {
  const tempDir = path.join(os.tmpdir(), 'stickers-processing');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

/**
 * Generate unique filename
 */
export const generateFilename = (extension) => {
  return `${uuidv4()}.${extension}`;
};

/**
 * Clean up temporary files
 */
export const cleanupTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(`Failed to clean up temp file ${filePath}:`, error.message);
  }
};

/**
 * Validate file is within size limit
 */
export const validateFileSize = (filePath, maxSizeMB = 100) => {
  const stats = fs.statSync(filePath);
  const fileSizeMB = stats.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
};

/**
 * Validate output file size
 */
export const validateOutputSize = (filePath, maxSizeKB = 500) => {
  const stats = fs.statSync(filePath);
  const fileSizeKB = stats.size / 1024;
  return fileSizeKB <= maxSizeKB;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
