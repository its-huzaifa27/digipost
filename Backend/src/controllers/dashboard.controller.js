import Client from '../models/client.model.js';
import User from '../models/user.model.js';
import PlatformConnection from '../models/platformConnection.model.js';

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { clientId } = req.query;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // 1. Fetch Clients with their Platform Connections
        const clients = await Client.findAll({
            where: { userId },
            include: [{
                model: PlatformConnection,
                attributes: ['platform', 'isActive']
            }]
        });

        // 2. Calculate Stats (Skeleton for now)
        let stats = {
            totalPosts: 0,
            engagementRate: 0,
            viralScore: 0,
            followers: 0,
            trendData: [
                { name: 'Mon', value: 0 },
                { name: 'Tue', value: 0 },
                { name: 'Wed', value: 0 },
                { name: 'Thu', value: 0 },
                { name: 'Fri', value: 0 },
                { name: 'Sat', value: 0 },
                { name: 'Sun', value: 0 },
            ]
        };

        // Format clients to include a simple 'platforms' map for the frontend
        const formattedClients = clients.map(c => {
            const platforms = {};
            if (c.PlatformConnections) {
                c.PlatformConnections.forEach(pc => {
                    if (pc.isActive) {
                        platforms[pc.platform] = { connected: true };
                    }
                });
            }

            return {
                id: c.id,
                name: c.name,
                industry: c.industry,
                isActive: c.isActive,
                platforms: platforms // { instagram: { connected: true }, ... }
            };
        });

        res.json({
            stats,
            clients: formattedClients
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};
