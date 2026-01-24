import express from 'express';
import metaService from '../services/meta.service.js';
import PlatformConnection from '../models/platformConnection.model.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import Client from '../models/client.model.js';

const router = express.Router();

// 1. Get Auth URL
// This is safe to be public: it only returns the Meta OAuth URL (no secrets/tokens).
router.get('/auth-url', async (req, res) => {
    const url = metaService.getAuthUrl();
    res.json({ url });
});

// 2. Handle Callback
router.post('/callback', authenticateToken, async (req, res) => {
    const { code, clientId } = req.body;
    const userId = req.user.id; // From middleware

    if (!code) return res.status(400).json({ error: 'Code is required' });
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    console.log(`[MetaCallback] Processing for User: ${userId}, ClientID: ${clientId}`);

    try {
        // Ensure the selected client belongs to the logged-in user
        const client = await Client.findOne({ where: { id: clientId, userId } });
        console.log(`[MetaCallback] Client Lookup Result:`, client ? 'Found' : 'NOT FOUND');

        if (!client) return res.status(404).json({ error: 'Client not found' });

        await metaService.exchangeCodeForToken(code, userId, clientId);
        res.json({ success: true, message: 'Facebook account connected successfully!' });
    } catch (error) {
        // If the error comes from Facebook OAuth, return 400 so the frontend can show it
        const message = error.message || 'Failed to connect Facebook account';
        if (message.toLowerCase().includes('facebook') || message.toLowerCase().includes('oauth')) {
            return res.status(400).json({ error: message });
        }
        res.status(500).json({ error: message });
    }
});

// 3. Get Connected Pages
router.get('/pages', authenticateToken, async (req, res) => {
    const { clientId } = req.query;
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    try {
        const pages = await PlatformConnection.findAll({
            where: { clientId, userId: req.user.id, isActive: true },
            attributes: ['id', 'platform', 'pageName', 'platformUserId', 'pageId'] // Don't return accessToken
        });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pages' });
    }
});

// 4. Disconnect Accounts (Specific Platform or All)
router.post('/disconnect', authenticateToken, async (req, res) => {
    const { clientId, platform } = req.body;
    const userId = req.user.id;

    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    try {
        const query = { clientId, userId };
        if (platform) {
            query.platform = platform;
        }

        const deletedCount = await PlatformConnection.destroy({
            where: query
        });

        res.json({ success: true, message: 'Disconnected successfully', count: deletedCount });
    } catch (error) {
        console.error('Disconnect Error:', error);
        res.status(500).json({ error: 'Failed to disconnect accounts' });
    }
});

// 5. Get Instagram Insights
router.get('/insights/:connectionId', authenticateToken, async (req, res) => {
    const { connectionId } = req.params;
    const userId = req.user.id;

    try {
        const connection = await PlatformConnection.findOne({
            where: { id: connectionId, userId, isActive: true }
        });

        if (!connection) {
            return res.status(404).json({ error: 'Connection not found or access denied' });
        }

        let insights;
        if (connection.platform === 'facebook') {
            insights = await metaService.getFacebookInsights(connection);
        } else if (connection.platform === 'instagram') {
            insights = await metaService.getInstagramInsights(connection);
        } else {
            return res.status(400).json({ error: `Analytics not supported for platform: ${connection.platform}` });
        }

        res.json(insights);
    } catch (error) {
        console.error('Insights Fetch Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
