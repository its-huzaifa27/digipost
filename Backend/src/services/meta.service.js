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
    async publishToFacebook(connection, message, imageUrl, scheduledTime) {
        try {
            const params = new URLSearchParams();
            params.append('access_token', connection.accessToken);

            if (scheduledTime) {
                params.append('published', 'false');
                params.append('scheduled_publish_time', scheduledTime);
            }

            if (imageUrl) {
                const photoUrl = `${FB_GRAPH_URL}/${connection.pageId}/photos`;
                params.append('url', imageUrl);
                params.append('caption', message);
                return await axios.post(photoUrl, params);
            } else {
                const url = `${FB_GRAPH_URL}/${connection.pageId}/feed`;
                params.append('message', message);
                return await axios.post(url, params);
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
            const containerParams = new URLSearchParams();
            containerParams.append('image_url', imageUrl);
            containerParams.append('caption', caption);
            containerParams.append('access_token', connection.accessToken);

            const containerResponse = await axios.post(
                `${FB_GRAPH_URL}/${connection.igBusinessId}/media`,
                containerParams
            );

            const creationId = containerResponse.data.id;

            // Step 1.5: Wait for Media to be Ready
            await this._waitForInstagramMedia(creationId, connection.accessToken);

            // Step 2: Publish Container
            const publishParams = new URLSearchParams();
            publishParams.append('creation_id', creationId);
            publishParams.append('access_token', connection.accessToken);

            const publishResponse = await axios.post(
                `${FB_GRAPH_URL}/${connection.igBusinessId}/media_publish`,
                publishParams
            );

            return publishResponse.data;

        } catch (error) {
            console.error(`IG Publish Error (${connection.pageName}):`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Polls the Instagram API to check if a media container is ready for publishing.
     */
    async _waitForInstagramMedia(creationId, accessToken) {
        let status = 'IN_PROGRESS';
        let attempts = 0;
        const maxAttempts = 12; // Increased slightly for safety

        while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
            attempts++;
            // Wait 3 seconds before checking
            await new Promise(resolve => setTimeout(resolve, 3000));

            try {
                const statusResponse = await axios.get(`${FB_GRAPH_URL}/${creationId}`, {
                    params: {
                        fields: 'status_code,status',
                        access_token: accessToken
                    }
                });

                status = statusResponse.data.status_code;
                console.log(`Instagram Media Status (${attempts}/${maxAttempts}):`, status);

                if (status === 'ERROR' || status === 'EXPIRED') {
                    throw new Error(`Instagram Media processing failed with status: ${status}`);
                }
            } catch (statusError) {
                console.warn("Failed to check IG status, retrying...", statusError.message);
            }
        }

        if (status !== 'FINISHED') {
            throw new Error("Instagram Media timed out processing. The image might be too large or invalid.");
        }
    }

    async scheduleInstagramPost(connection, caption, imageUrl, scheduledTime) {
        try {
            if (!imageUrl) {
                throw new Error("Instagram requires an image.");
            }

            const params = new URLSearchParams();
            params.append("image_url", imageUrl);
            params.append("caption", caption);
            params.append("is_published", "false");
            params.append("scheduled_publish_time", scheduledTime); // UNIX timestamp
            params.append("access_token", connection.accessToken);

            const res = await axios.post(
                `${FB_GRAPH_URL}/${connection.igBusinessId}/media`,
                params
            );

            const creationId = res.data.id;

            // CRITICAL: Wait for IG to fetch and process the image from Supabase 
            // before we return (and subsequently delete the image from Supabase).
            await this._waitForInstagramMedia(creationId, connection.accessToken);

            return res.data; // container id
        } catch (error) {
            console.error("IG Schedule Error:", error.response?.data || error.message);
            throw error;
        }
    }

}

export default new MetaService();
