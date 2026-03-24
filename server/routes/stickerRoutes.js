import express from 'express';
import multer from 'multer';
import { verifyAuth } from '../middleware/auth.js';
import {
  createSticker,
  getSticker,
  getStickersFeedController,
  getUserStickersController
} from '../controllers/stickerController.js';
import { getTempDir } from '../utils/fileUtils.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: getTempDir(),
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      cb(null, `${timestamp}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4',
      'video/quicktime',
      'image/gif',
      'audio/mpeg',
      'audio/wav',
      'audio/mp4',
      'audio/webp'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  }
});

// POST /api/sticker/create
router.post(
  '/create',
  verifyAuth,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  createSticker
);

// GET /api/sticker/feed
router.get('/feed', getStickersFeedController);

// GET /api/sticker/user/:userId
router.get('/user/:userId', getUserStickersController);

// GET /api/sticker/:id
router.get('/:id', getSticker);

export default router;
