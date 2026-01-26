import Client from '../models/client.model.js';
import PlatformConnection from '../models/platformConnection.model.js';

// Create a new client
export const createClient = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        // Accept both legacy snake_case (frontend) and camelCase (model) inputs
        const name = req.body.client_name ?? req.body.name;
        const industry = req.body.industry ?? null;
        const brandDescription = req.body.brand_description ?? req.body.brandDescription ?? null;

        const instagramEnabled = !!(req.body.instagram_enabled ?? req.body.instagramEnabled);
        const facebookEnabled = !!(req.body.facebook_enabled ?? req.body.facebookEnabled);
        const twitterEnabled = !!(req.body.twitter_enabled ?? req.body.twitterEnabled);
        const linkedinEnabled = !!(req.body.linkedin_enabled ?? req.body.linkedinEnabled);
        const whatsappEnabled = !!(req.body.whatsapp_enabled ?? req.body.whatsappEnabled);
        const pinterestEnabled = !!(req.body.pinterest_enabled ?? req.body.pinterestEnabled);
        const tiktokEnabled = !!(req.body.tiktok_enabled ?? req.body.tiktokEnabled);

        if (!name || String(name).trim().length < 2) {
            return res.status(400).json({ error: 'Client name is required' });
        }

        const newClient = await Client.create({
            userId,
            name: String(name).trim(),
            industry,
            brandDescription,
            instagramEnabled,
            facebookEnabled,
            twitterEnabled,
            linkedinEnabled,
            whatsappEnabled,
            pinterestEnabled,
            tiktokEnabled
        });

        res.status(201).json({
            message: 'Client created successfully',
            client: {
                id: newClient.id,
                client_name: newClient.name,
                industry: newClient.industry,
                brand_description: newClient.brandDescription,
                instagram_enabled: newClient.instagramEnabled,
                facebook_enabled: newClient.facebookEnabled,
                twitter_enabled: newClient.twitterEnabled,
                linkedin_enabled: newClient.linkedinEnabled,
                whatsapp_enabled: newClient.whatsappEnabled,
                pinterest_enabled: newClient.pinterestEnabled,
                tiktok_enabled: newClient.tiktokEnabled,
                createdAt: newClient.createdAt,
                updatedAt: newClient.updatedAt
            }
        });

    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Failed to create client' });
    }
};

// Get all clients for the logged-in moderator
export const getClients = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const clients = await Client.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [{ model: PlatformConnection }]
        });

        // Return in a frontend-friendly legacy shape (snake_case) while we transition
        const response = clients.map((c) => {
            const connections = c.PlatformConnections || [];
            const isConnected = (platform) =>
                connections.some((pc) => pc.platform === platform && pc.isActive);

            return {
                id: c.id,
                client_name: c.name,
                industry: c.industry,
                brand_description: c.brandDescription,
                instagram_enabled: c.instagramEnabled || isConnected('instagram'),
                facebook_enabled: c.facebookEnabled || isConnected('facebook'),
                twitter_enabled: c.twitterEnabled || isConnected('twitter'),
                linkedin_enabled: c.linkedinEnabled || isConnected('linkedin'),
                whatsapp_enabled: c.whatsappEnabled,
                pinterest_enabled: c.pinterestEnabled,
                tiktok_enabled: c.tiktokEnabled,
                // Service Status
                is_active: c.isActive,
                // Per-client connection details for UI display (no tokens returned)
                connections: connections
                    .filter((pc) => pc.isActive)
                    .map((pc) => ({
                        id: pc.id,
                        platform: pc.platform,
                        pageName: pc.pageName,
                        pageId: pc.pageId,
                        platformUserId: pc.platformUserId,
                        igBusinessId: pc.igBusinessId
                    })),
                createdAt: c.createdAt,
                updatedAt: c.updatedAt
            };
        });

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};

// Update Client Status (Pause/Resume)
export const updateClientStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ error: 'isActive must be a boolean' });
        }

        const client = await Client.findOne({ where: { id, userId } });

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        client.isActive = isActive;
        await client.save();

        res.status(200).json({
            message: `Client services ${isActive ? 'resumed' : 'suspended'}.`,
            client: {
                id: client.id,
                isActive: client.isActive
            }
        });

    } catch (error) {
        console.error('Error updating client status:', error);
        res.status(500).json({ error: 'Failed to update client status' });
    }
};
