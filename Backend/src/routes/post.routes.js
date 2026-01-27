import express from 'express';
import { createPost, upload, getScheduledPosts } from '../controllers/post.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// 'media' must match the FormData key sent from frontend
router.post('/create', authenticateToken, upload.array('media', 10), createPost);
router.get('/scheduled', authenticateToken, getScheduledPosts);

export default router;
