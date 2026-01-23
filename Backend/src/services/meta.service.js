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
            'instagram_manage_insights',
            'instagram_content_publish',
            'public_profile'
        ].join(',');

        return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&state=random_state_string&scope=${encodeURIComponent(scopes)}`;
    }

    /**
     * Exchanges the short-lived code from the frontend for a Long-Lived User Access Token.
     */
    async exchangeCodeForToken(code, userId, clientId = null) {
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

            // Check for errors in token response
            if (tokenResponse.data.error) {
                console.error('Facebook Token Exchange Error:', tokenResponse.data.error);
                throw new Error(`Facebook OAuth Error: ${tokenResponse.data.error.message || 'Failed to exchange code for token'}`);
            }

            const shortLivedToken = tokenResponse.data.access_token;
            if (!shortLivedToken) {
                throw new Error('No access token received from Facebook');
            }

            // 2. Exchange for Long-Lived User Token (lasts 60 days)
            const longLivedResponse = await axios.get(`${FB_GRAPH_URL}/oauth/access_token`, {
                params: {
                    grant_type: 'fb_exchange_token',
                    client_id: process.env.FACEBOOK_CLIENT_ID,
                    client_secret: process.env.FACEBOOK_CLIENT_SECRET,
                    fb_exchange_token: shortLivedToken,
                },
            });

            // Check for errors in long-lived token response
            if (longLivedResponse.data.error) {
                console.error('Facebook Long-Lived Token Exchange Error:', longLivedResponse.data.error);
                throw new Error(`Facebook OAuth Error: ${longLivedResponse.data.error.message || 'Failed to exchange for long-lived token'}`);
            }

            const longLivedToken = longLivedResponse.data.access_token;
            if (!longLivedToken) {
                throw new Error('No long-lived access token received from Facebook');
            }

            // 3. Fetch User's Pages and their Tokens
            await this.fetchAndSavePages(longLivedToken, userId, clientId);

            return { success: true };

        } catch (error) {
            console.error('OAuth Exchange Error:', error.response?.data || error.message);
            // Extract specific error message from Facebook response if available
            const fbError = error.response?.data?.error?.message;
            if (fbError) {
                throw new Error(`Facebook Error: ${fbError}`);
            }
            throw new Error(`Failed to connect Facebook account: ${error.message}`);
        }
    }

    /**
     * Uses the User Token to find all Pages they manage and stores them.
     */
    async fetchAndSavePages(userAccessToken, userId, clientId = null) {
        try {
            const response = await axios.get(`${FB_GRAPH_URL}/me/accounts`, {
                params: {
                    access_token: userAccessToken,
                    fields: 'id,name,access_token,instagram_business_account',
                },
            });

            // Check for Facebook API errors
            if (response.data.error) {
                console.error('Facebook API Error:', response.data.error);
                throw new Error(`Facebook API Error: ${response.data.error.message || 'Unknown error'}`);
            }

            // Handle case where user has no pages or response structure is different
            const pages = response.data?.data || [];

            if (!Array.isArray(pages)) {
                console.error('Unexpected Facebook API response structure:', response.data);
                throw new Error('Invalid response from Facebook API');
            }

            if (pages.length === 0) {
                console.warn('User has no Facebook pages to connect');
                return; // No pages to save, but this is not an error
            }

            for (const page of pages) {
                // Save Facebook Page Connection
                await PlatformConnection.upsert({
                    clientId: clientId,
                    userId: userId, // Keep userId for history/audit, but clientId establishes the ownership scope
                    platform: 'facebook',
                    pageId: page.id,
                    pageName: page.name,
                    accessToken: page.access_token, // This is a Page Access Token (never expires mostly)
                    isActive: true,
                });

                // Check for linked Instagram Business Account
                if (page.instagram_business_account) {
                    await PlatformConnection.upsert({
                        clientId: clientId,
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


    /**
     * Fetches Instagram Insights (Followers, Reach, Impressions).
     */
    async getInstagramInsights(connection) {
        console.log(`[IG_INSIGHTS] Starting fetch for: ${connection.pageName} (${connection.igBusinessId})`);

        try {
            if (!connection.igBusinessId) {
                throw new Error("This connection is not linked to an Instagram Business account.");
            }

            // 1. Fetch Basic Info (Total Followers)
            let profileData = {};
            try {
                const basicInfoResponse = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}`, {
                    params: {
                        fields: 'followers_count,media_count,username,name',
                        access_token: connection.accessToken
                    }
                });
                profileData = basicInfoResponse.data;
                console.log(`[IG_INSIGHTS] Profile fetch success: ${profileData.followers_count} followers`);
            } catch (profileErr) {
                console.error(`[IG_INSIGHTS] Profile fetch failed:`, profileErr.response?.data || profileErr.message);
                // Continue despite profile failure? Or throw? Let's throw for now as it's critical
                throw new Error(`Profile Error: ${profileErr.response?.data?.error?.message || profileErr.message}`);
            }

            // 2. Fetch Insights (Reach, follower_count)
            let insightsData = [];
            try {
                const insightsResponse = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}/insights`, {
                    params: {
                        metric: 'reach,follower_count',
                        period: 'day',
                        access_token: connection.accessToken
                    }
                });
                insightsData = insightsResponse.data.data;
                console.log(`[IG_INSIGHTS] Insights fetch success (reach, follower_count)`);
            } catch (insightsErr) {
                console.error(`[IG_INSIGHTS] Insights fetch failed:`, insightsErr.response?.data || insightsErr.message);
                throw new Error(`Insights Error: ${insightsErr.response?.data?.error?.message || insightsErr.message}`);
            }

            return {
                profile: profileData,
                insights: insightsData
            };

        } catch (error) {
            console.error(`[IG_INSIGHTS] Global catch:`, error.message);
            throw error; // Rethrow to let the route handle it
        }
    }

}

export default new MetaService();
