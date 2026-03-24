import React, { useRef, useState } from 'react';
import { Upload, Play, Loader } from 'lucide-react';
import StickerPlayer from './StickerPlayer';
import TrimSlider from './TrimSlider';
import { stickerAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

/**
 * CreateSticker - Full sticker creation flow
 * Video upload → Audio upload → Preview → Submit
 */
export const CreateSticker = ({ onSuccess = null }) => {
  const { user } = useAuth();

  // File inputs
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // State
  const [stickerName, setStickerName] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [duration, setDuration] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle video upload
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        'video/mp4',
        'video/quicktime',
        'image/gif'
      ];
      if (!validTypes.includes(file.type)) {
        setError('Invalid video format. Please use MP4, MOV, or GIF.');
        return;
      }

      setVideoFile(file);
      setError(null);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  // Handle audio upload
  const handleAudioChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/mp4'
      ];
      if (!validTypes.includes(file.type)) {
        setError('Invalid audio format. Please use MP3, WAV, or M4A.');
        return;
      }

      setAudioFile(file);
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Please select a video');
      return;
    }

    if (!user) {
      setError('You must be logged in');
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      // Create form data
      const formData = new FormData();
      formData.append('name', stickerName || 'Untitled Sticker');
      formData.append('video', videoFile);
      if (audioFile) {
        formData.append('audio', audioFile);
      }

      // Submit to backend
      const response = await stickerAPI.create(formData);
      const { sticker } = response.data;

      setSuccess(sticker);

      // Reset form
      setTimeout(() => {
        setStickerName('');
        setVideoFile(null);
        setAudioFile(null);
        setVideoPreview(null);
        setDuration(3);

        if (onSuccess) {
          onSuccess(sticker);
        }
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setError(
        error.response?.data?.error ||
        error.message ||
        'Failed to create sticker'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-dark-secondary rounded-lg text-center space-y-4">
        <h2 className="text-2xl font-bold text-green-500">✨ Sticker Created!</h2>
        <p className="text-gray-400">Your sticker has been processed and uploaded.</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Share URL:</p>
          <code className="block bg-dark p-2 rounded text-xs text-gray-300 break-all">
            {success.share_url}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(success.share_url);
              alert('URL copied to clipboard!');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            Copy URL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Sticker Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Sticker Name
        </label>
        <input
          type="text"
          placeholder="E.g., 'Happy Greeting', 'Dance Move', 'Funny Reaction'"
          value={stickerName}
          onChange={(e) => setStickerName(e.target.value)}
          maxLength="50"
          className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">{stickerName.length}/50 characters</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error alert */}
        {error && (
          <div className="p-4 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Video upload */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">Upload Video or GIF</label>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="w-full p-8 border-2 border-dashed border-gray-600 hover:border-gray-400 rounded-lg flex flex-col items-center justify-center gap-3 transition-colors"
          >
            <Upload size={32} className="text-gray-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-300">
                {videoFile ? videoFile.name : 'Click to select video'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Max 10 seconds, up to 100MB</p>
            </div>
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*,image/gif"
            onChange={handleVideoChange}
            className="hidden"
          />
        </div>

        {/* Audio upload (optional) */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300">Upload Audio (Optional)</label>
          <button
            type="button"
            onClick={() => audioInputRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-lg flex flex-col items-center justify-center gap-3 transition-colors"
          >
            <Upload size={24} className="text-gray-600" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">
                {audioFile ? audioFile.name : 'Click to select audio'}
              </p>
              <p className="text-xs text-gray-600 mt-1">MP3, WAV, or M4A</p>
            </div>
          </button>
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioChange}
            className="hidden"
          />
        </div>

        {/* Video preview */}
        {videoPreview && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Preview</label>
            <div className="bg-dark-secondary rounded-lg overflow-hidden">
              <StickerPlayer videoUrl={videoPreview} />
            </div>
          </div>
        )}

        {/* Duration slider */}
        {videoPreview && (
          <TrimSlider
            minDuration={2}
            maxDuration={6}
            value={duration}
            onChange={setDuration}
          />
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!videoFile || isProcessing}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Play size={18} />
              <span>Create Sticker</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateSticker;
