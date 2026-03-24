import express from 'express';
import { verifyAuth } from '../middleware/auth.js';
import {
  createNewCollection,
  getUserCollectionsController,
  addStickerToCollection,
  removeStickerFromCollection
} from '../controllers/collectionController.js';

const router = express.Router();

// POST /api/collection/create
router.post('/create', verifyAuth, createNewCollection);

// GET /api/collection/:userId
router.get('/:userId', getUserCollectionsController);

// POST /api/collection/add
router.post('/add', verifyAuth, addStickerToCollection);

// POST /api/collection/remove
router.post('/remove', verifyAuth, removeStickerFromCollection);

export default router;
