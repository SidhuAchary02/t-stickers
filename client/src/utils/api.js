import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Add Supabase auth session to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error('Failed to get session token:', error);
  }
  return config;
});

// Auth API
export const authAPI = {
  callback: (data) => apiClient.post('/auth/callback', data),
  getProfile: () => apiClient.get('/auth/profile'),
  logout: () => apiClient.post('/auth/logout')
};

// Sticker API
export const stickerAPI = {
  create: (formData) =>
    apiClient.post('/sticker/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getById: (id) => apiClient.get(`/sticker/${id}`),
  getFeed: (limit = 20, offset = 0) =>
    apiClient.get('/sticker/feed', { params: { limit, offset } }),
  getByUser: (userId) => apiClient.get(`/sticker/user/${userId}`)
};

// Collection API
export const collectionAPI = {
  create: (name) => apiClient.post('/collection/create', { name }),
  getByUser: (userId) => apiClient.get(`/collection/${userId}`),
  addSticker: (collectionId, stickerId) =>
    apiClient.post('/collection/add', { collectionId, stickerId }),
  removeSticker: (collectionId, stickerId) =>
    apiClient.post('/collection/remove', { collectionId, stickerId })
};

export default apiClient;
