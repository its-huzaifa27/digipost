import axios from 'axios';
import PlatformConnection from '../models/platformConnection.model.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const FB_GRAPH_URL = 'https://graph.facebook.com/v19.0';

class MetaService {
    // --------------------------------------------------------------------------
    // 1. OAuth Flow
    // --------------------------------------------------------------------------

    /**
     * Generates the URL for the user to log in with Facebook and grant permissions.
     */
    getAuthUrl() {
        // Permissions:
        // - pages_manage_posts: To post to FB Pages
        // - pages_read_engagement: To read page info
        // - instagram_basic: To read IG connection
        // - instagram_content_publish: To post to IG
        // - public_profile: Basic info
        const scopes = [
            'pages_manage_posts',
            'pages_read_engagement',
            'instagram_basic',
            'instagram_content_publish',
            'public_profile'
        ].join(',');

        return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&state=random_state_string&scope=${encodeURIComponent(scopes)}`;
    }

    /**
     * Exchanges the short-lived code from the frontend for a Long-Lived User Access Token.
     */
    async exchangeCodeForToken(code, userId) {
        try {
            // 1. Get Short-Lived User Token
            const tokenResponse = await axios.get(`${FB_GRAPH_URL}/oauth/access_token`, {
                params: {
                    client_id: process.env.FACEBOOK_CLIENT_ID,
                    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
                    redirect_uri: process.env.REDIRECT_URI,
                    code: code,
                },
            });

            const shortLivedToken = tokenResponse.data.access_token;

            // 2. Exchange for Long-Lived User Token (lasts 60 days)
            const longLivedResponse = await axios.get(`${FB_GRAPH_URL}/oauth/access_token`, {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: process.env.FACEBOOK_CLIENT_ID,
                    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
                    fb_exchange_token: shortLivedToken,
                },
            });

            const longLivedToken = longLivedResponse.data.access_token;

            // 3. Fetch User's Pages and their Tokens
            await this.fetchAndSavePages(longLivedToken, userId);

            return { success: true };

        } catch (error) {
            console.error('OAuth Exchange Error:', error.response?.data || error.message);
            throw new Error('Failed to connect Facebook account.');
        }
    }

    /**
     * Uses the User Token to find all Pages they manage and stores them.
     */
    async fetchAndSavePages(userAccessToken, userId) {
        try {
            const response = await axios.get(`${FB_GRAPH_URL}/me/accounts`, {
                params: {
                    access_token: userAccessToken,
                    fields: 'id,name,access_token,instagram_business_account',
                },
            });

            const pages = response.data.data;

            for (const page of pages) {
                // Save Facebook Page Connection
                await PlatformConnection.upsert({
                    userId: userId,
                    platform: 'facebook',
                    pageId: page.id,
                    pageName: page.name,
                    accessToken: page.access_token, // This is a Page Access Token (never expires mostly)
                    isActive: true,
                });

                // Check for linked Instagram Business Account
                if (page.instagram_business_account) {
                    await PlatformConnection.upsert({
                        userId: userId,
                        platform: 'instagram',
                        pageId: page.id, // Linked to this FB Page
                        igBusinessId: page.instagram_business_account.id,
                        pageName: `IG: ${page.name}`, // Simplified naming
                        accessToken: page.access_token, // IG uses the FB Page Token
                        isActive: true,
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching pages:', error.response?.data || error.message);
            throw error;
        }
    }

    // --------------------------------------------------------------------------
    // 2. Posting Logic
    // --------------------------------------------------------------------------

    /**
     * Publishes a post to Facebook.
     */
    async publishToFacebook(connection, message, imageUrl) {
        try {
            const url = `${FB_GRAPH_URL}/${connection.pageId}/feed`;
            const payload = {
                message: message,
                access_token: connection.accessToken,
            };

            if (imageUrl) {
                // If image, posting to /photos endpoint is often better, or use 'link'/'url' param on feed
                // For simplicity consistent with user flow:
                // If it's a photo post:
                const photoUrl = `${FB_GRAPH_URL}/${connection.pageId}/photos`;
                return await axios.post(photoUrl, {
                    url: imageUrl,
                    caption: message,
                    access_token: connection.accessToken
                });
            } else {
                return await axios.post(url, payload);
            }
        } catch (error) {
            console.error(`FB Publish Error (${connection.pageName}):`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Publishes a post to Instagram (2-Step Flow).
     */
    async publishToInstagram(connection, caption, imageUrl) {
        try {
            if (!imageUrl) {
                throw new Error("Instagram requires an image.");
            }

            // Step 1: Create Container
            const containerResponse = await axios.post(`${FB_GRAPH_URL}/${connection.igBusinessId}/media`, null, {
                params: {
                    image_url: imageUrl,
                    caption: caption,
                    access_token: connection.accessToken,
                },
            });

            const creationId = containerResponse.data.id;

            // Step 2: Publish Container
            const publishResponse = await axios.post(`${FB_GRAPH_URL}/${connection.igBusinessId}/media_publish`, null, {
                params: {
                    creation_id: creationId,
                    access_token: connection.accessToken,
                },
            });

            return publishResponse.data;

        } catch (error) {
            console.error(`IG Publish Error (${connection.pageName}):`, error.response?.data || error.message);
            throw error;
        }
    }
}

export default new MetaService();
