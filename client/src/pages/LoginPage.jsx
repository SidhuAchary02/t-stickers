import React from 'react';
import { Navigate } from 'react-router-dom';
import GoogleLogin from '../components/GoogleLogin';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold">t-stickers</h1>
          <p className="mt-2 text-gray-400">Create fun looping video stickers with audio</p>
        </div>

        <div className="mt-8 space-y-6">
          <GoogleLogin onSuccess={() => window.location.href = '/'} />

          <div className="space-y-4 text-sm text-gray-500">
            <h2 className="font-semibold text-gray-400">How it works:</h2>
            <ul className="space-y-2 text-left">
              <li>✨ Upload a video or GIF (max 10 sec)</li>
              <li>🔊 Add audio (optional)</li>
              <li>🎬 We'll process it into a perfect sticker</li>
              <li>📲 Share via WhatsApp or link</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
