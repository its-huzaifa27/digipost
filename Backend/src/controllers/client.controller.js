import Client from '../models/client.model.js';
import User from '../models/user.model.js';

// Create a new client
export const createClient = async (req, res) => {
    try {
        const { 
            client_name, 
            industry, 
            brand_description, 
            instagram_enabled, 
            facebook_enabled, 
            twitter_enabled,
            linkedin_enabled,
            whatsapp_enabled,
            pinterest_enabled,
            tiktok_enabled
        } = req.body;

        // Ensure user is authenticated (added via middleware ideally, but checking request here)
        // Assuming auth middleware populates req.user
        // For now, if req.user is missing, we might need to rely on a passed moderator_id or handle unauthorized.
        // We will assume auth middleware is running.
        
        // Since we are using the simple auth from before which might not set req.user in a standardized way yet
        // Let's assume the frontend sends the token and the auth middleware decodes it to req.user.
        // If req.user.id is not available, we fail.
        
        // Note: We need to make sure the auth middleware is applied to this route.
        const moderator_id = req.user?.id; 

        if (!moderator_id) {
            return res.status(401).json({ error: 'Unauthorized: User ID missing from request' });
        }

        const newClient = await Client.create({
            moderator_id,
            client_name,
            industry,
            brand_description,
            instagram_enabled,
            facebook_enabled,
            twitter_enabled,
            linkedin_enabled,
            whatsapp_enabled,
            pinterest_enabled,
            tiktok_enabled
        });

        res.status(201).json({ message: 'Client created successfully', client: newClient });

    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Failed to create client' });
    }
};

// Get all clients for the logged-in moderator
export const getClients = async (req, res) => {
    try {
        const moderator_id = req.user?.id;

        if (!moderator_id) {
            // Check if we can get it from query (for debugging) or fail
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const clients = await Client.findAll({
            where: { moderator_id },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};
