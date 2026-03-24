import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import { authCallback, getProfile, logout } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/callback
router.post('/callback', authCallback);

// GET /api/auth/profile
router.get('/profile', verifyAuth, getProfile);

// POST /api/auth/logout
router.post('/logout', logout);

export default router;
