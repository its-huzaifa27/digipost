import express from 'express';
import aiService from '../services/ai.service.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/generate', authenticateToken, async (req, res) => {
    const { topic } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    try {
        const result = await aiService.generatePostContent(topic);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
