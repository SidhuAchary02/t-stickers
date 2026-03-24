import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Process and combine video + audio into a compressed MP4 sticker
 * @param {string} videoPath - Path to input video file
 * @param {string} audioPath - Path to input audio file (optional)
 * @param {string} outputPath - Path for output MP4 file
 * @param {number} maxDuration - Maximum duration in seconds (default 6)
 * @returns {Promise<string>} - Path to processed output file
 */
export const processSticker = (videoPath, audioPath = null, outputPath, maxDuration = 6) => {
  return new Promise((resolve, reject) => {
    try {
      let command = ffmpeg(videoPath);

      // Add audio input if provided
      if (audioPath && fs.existsSync(audioPath)) {
        command = command.input(audioPath);
      }

      command
        .videoFilter('scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x000000')
        .fps(15) // 15fps to reduce file size
        .videoBitrate('300k')
        .videoCodec('libx264')
        .outputOptions('-pix_fmt', 'yuv420p')
        .audioCodec('aac')
        .audioBitrate('64k')
        .duration(maxDuration)
        .output(outputPath)
        .on('end', () => {
          console.log(`[FFmpeg] Successfully processed sticker: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error(`[FFmpeg] Processing error: ${err.message}`);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .run();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate thumbnail from video
 * @param {string} videoPath - Path to input video
 * @param {string} outputPath - Path for output thumbnail
 * @returns {Promise<string>} - Path to generated thumbnail
 */
export const generateThumbnail = (videoPath, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg(videoPath)
        .on('filenames', (filenames) => {
          console.log('Will generate ' + filenames.join(', '));
        })
        .on('end', () => {
          resolve(outputPath);
        })
        .on('error', (err) => {
          reject(new Error(`Thumbnail generation failed: ${err.message}`));
        })
        .screenshots({
          count: 1,
          folder: path.dirname(outputPath),
          filename: path.basename(outputPath),
          size: '512x512'
        });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get video metadata (duration, codec info)
 * @param {string} videoPath - Path to video file
 * @returns {Promise<object>} - Video metadata
 */
export const getVideoMetadata = (videoPath) => {
  return new Promise((resolve, reject) => {
    try {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          const duration = metadata.format.duration;
          resolve({ duration });
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
