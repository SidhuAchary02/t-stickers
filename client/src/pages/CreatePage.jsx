import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSticker from '../components/CreateSticker';

const CreatePage = () => {
  const navigate = useNavigate();

  const handleSuccess = (sticker) => {
    setTimeout(() => {
      navigate(`/s/${sticker.id}`);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create a Sticker</h1>
        <p className="text-gray-400 mt-1">Upload video + audio and create your first talking sticker</p>
      </div>

      <CreateSticker onSuccess={handleSuccess} />
    </div>
  );
};

export default CreatePage;
