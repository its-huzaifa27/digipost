import express from 'express';
import { connectPlatform, handleCallback } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/connect/:platform', connectPlatform);
router.get('/callback/:platform', handleCallback);

export default router;
