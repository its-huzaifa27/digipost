import express from 'express';
import metaService from '../services/meta.service.js';
import PlatformConnection from '../models/platformConnection.model.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// 1. Get Auth URL
router.get('/auth-url', (req, res) => {
    const url = metaService.getAuthUrl();
    res.json({ url });
});

// 2. Handle Callback
router.post('/callback', authenticateToken, async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id; // From middleware

    if (!code) return res.status(400).json({ error: 'Code is required' });

    try {
        await metaService.exchangeCodeForToken(code, userId);
        res.json({ success: true, message: 'Facebook account connected successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Get Connected Pages
router.get('/pages', authenticateToken, async (req, res) => {
    try {
        const pages = await PlatformConnection.findAll({
            where: { userId: req.user.id, isActive: true },
            attributes: ['id', 'platform', 'pageName', 'platformUserId', 'pageId'] // Don't return accessToken
        });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

export default router;
