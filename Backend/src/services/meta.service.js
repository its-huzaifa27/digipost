import axios from 'axios';
import PlatformConnection from '../models/platformConnection.model.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const FB_GRAPH_URL = 'https://graph.facebook.com/v21.0';

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
                        fields: 'followers_count,media_count,username,name,profile_picture_url',
                        access_token: connection.accessToken
                    }
                });
                profileData = basicInfoResponse.data;
                console.log(`[IG_INSIGHTS] Profile fetch success: ${profileData.followers_count} followers`);
            } catch (profileErr) {
                console.error(`[IG_INSIGHTS] Profile fetch failed:`, profileErr.response?.data || profileErr.message);
                throw new Error(`Profile Error: ${profileErr.response?.data?.error?.message || profileErr.message}`);
            }

            // 2. Fetch Insights (Reach, Views, Interactions, etc.)
            let insightsData = [];

            // Block A: Metrics requiring 'total_value' (including views breakdown)
            try {
                const totalValueInsights = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}/insights`, {
                    params: {
                        metric: 'views,reach,total_interactions,accounts_engaged,profile_views',
                        period: 'day',
                        breakdown: 'follow_type',
                        metric_type: 'total_value',
                        access_token: connection.accessToken
                    }
                });
                insightsData = [...insightsData, ...(totalValueInsights.data.data || [])];
                console.log(`[IG_INSIGHTS] Block A (total_value) success`);
            } catch (errA) {
                console.warn(`[IG_INSIGHTS] Block A failed:`, errA.response?.data?.error?.message || errA.message);
                // Fallback for Block A without breakdown/total_value if needed
                try {
                    const fallbackA = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}/insights`, {
                        params: {
                            metric: 'reach,impressions',
                            period: 'day',
                            access_token: connection.accessToken
                        }
                    });
                    insightsData = [...insightsData, ...(fallbackA.data.data || [])];
                } catch (innerA) {
                    console.error(`[IG_INSIGHTS] Fallback A failed:`, innerA.message);
                }
            }

            // Block B: Metrics NOT using 'total_value' (follower_count, etc.)
            try {
                const standardInsights = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}/insights`, {
                    params: {
                        metric: 'follower_count,profile_links_taps',
                        period: 'day',
                        access_token: connection.accessToken
                    }
                });
                insightsData = [...insightsData, ...(standardInsights.data.data || [])];
                console.log(`[IG_INSIGHTS] Block B success`);
            } catch (errB) {
                console.warn(`[IG_INSIGHTS] Block B failed:`, errB.response?.data?.error?.message || errB.message);
            }

            // 3. Fetch Top Media
            let topMedia = [];
            try {
                const mediaResponse = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}/media`, {
                    params: {
                        fields: 'id,media_type,media_product_type,media_url,thumbnail_url,timestamp,caption,like_count,comments_count',
                        limit: 10,
                        access_token: connection.accessToken
                    }
                });

                const mediaList = mediaResponse.data.data || [];

                // Fetch insights for each media item to get views/impressions
                topMedia = await Promise.all(mediaList.map(async (media) => {
                    try {
                        let metricName = 'impressions'; // Default for IMAGE/CAROUSEL

                        // Determine metric based on type
                        if (media.media_product_type === 'REELS') {
                            metricName = 'plays';
                        } else if (media.media_type === 'VIDEO') {
                            metricName = 'video_views'; // Or 'plays' depending on API version, keeping 'video_views' as requested fallback
                        }

                        const mInsights = await axios.get(`${FB_GRAPH_URL}/${media.id}/insights`, {
                            params: {
                                metric: metricName,
                                access_token: connection.accessToken
                            }
                        });

                        const views = mInsights.data.data.find(i => i.name === metricName)?.values[0]?.value || 0;
                        return { ...media, views };
                    } catch (err) {
                        console.warn(`[IG_INSIGHTS] Media insight failed for ${media.id} (${media.media_type}/${media.media_product_type}):`, err.message);
                        return { ...media, views: 0 };
                    }
                }));
                console.log(`[IG_INSIGHTS] Top media fetch success`);
            } catch (mediaErr) {
                console.warn(`[IG_INSIGHTS] Top media fetch failed:`, mediaErr.message);
            }

            return {
                profile: profileData,
                insights: insightsData,
                topMedia: topMedia
            };

        } catch (error) {
            console.error(`[IG_INSIGHTS] Global catch:`, error.message);
            throw error;
        }
    }

    /**
     * Fetches Facebook Page Insights (Likes, Impressions, Engagement).
     */
    async getFacebookInsights(connection) {
        console.log(`[FB_INSIGHTS] Starting fetch for: ${connection.pageName} (${connection.pageId})`);

        try {
            // 1. Fetch Page Profile (Picture, Name, Total Likes)
            let profileData = {};
            try {
                const pageResponse = await axios.get(`${FB_GRAPH_URL}/${connection.pageId}`, {
                    params: {
                        fields: 'name,fan_count,picture{url}', // fan_count = Total Likes
                        access_token: connection.accessToken
                    }
                });
                profileData = {
                    name: pageResponse.data.name,
                    followers_count: pageResponse.data.fan_count, // Mapping to generic structure
                    profile_picture_url: pageResponse.data.picture?.data?.url
                };
                console.log(`[FB_INSIGHTS] Profile fetch success: ${profileData.followers_count} likes`);
            } catch (profileErr) {
                console.error(`[FB_INSIGHTS] Profile fetch failed:`, profileErr.response?.data || profileErr.message);
                throw new Error(`Facebook Profile Error: ${profileErr.response?.data?.error?.message || profileErr.message}`);
            }

            // 2. Fetch Insights (Impressions, Engaged Users)
            let insightsData = [];

            // Try fetching full stable set first
            try {
                const insightsResponse = await axios.get(`${FB_GRAPH_URL}/${connection.pageId}/insights`, {
                    params: {
                        // Updated stable metrics for v21.0 (removed page_views_total if deprecated, added page_impressions)
                        metric: 'page_impressions_unique,page_daily_active_users,page_impressions',
                        period: 'day',
                        access_token: connection.accessToken
                    }
                });
                insightsData = insightsResponse.data.data;
                console.log(`[FB_INSIGHTS] Insights fetch success (Full Set)`);
            } catch (insightsErr) {
                console.warn(`[FB_INSIGHTS] Full set fetch failed:`, insightsErr.response?.data || insightsErr.message);

                // Fallback: Try fetching just a single stable metric
                try {
                    console.log(`[FB_INSIGHTS] Attempting fallback fetch (page_impressions only)`);
                    const fallbackResponse = await axios.get(`${FB_GRAPH_URL}/${connection.pageId}/insights`, {
                        params: {
                            metric: 'page_impressions',
                            period: 'day',
                            access_token: connection.accessToken
                        }
                    });
                    insightsData = fallbackResponse.data.data;
                    console.log(`[FB_INSIGHTS] Fallback fetch success`);
                } catch (fallbackErr) {
                    console.error(`[FB_INSIGHTS] Fallback fetch failed:`, fallbackErr.response?.data || fallbackErr.message);
                    // We allow insights to be empty if both fail, but log the error
                    // throw new Error(`Facebook Insights Error: ${insightsErr.response?.data?.error?.message || insightsErr.message}`);
                }
            }

            // 3. Fetch Top Media (Page Posts)
            let topMedia = [];
            try {
                const feedResponse = await axios.get(`${FB_GRAPH_URL}/${connection.pageId}/feed`, {
                    params: {
                        fields: 'id,message,created_time,full_picture,likes.summary(true),comments.summary(true)',
                        limit: 10,
                        access_token: connection.accessToken
                    }
                });

                const feedData = feedResponse.data.data || [];

                topMedia = feedData.map(post => ({
                    id: post.id,
                    media_type: post.full_picture ? 'IMAGE' : 'TEXT',
                    media_url: post.full_picture || null,
                    thumbnail_url: post.full_picture || null,
                    timestamp: post.created_time,
                    caption: post.message || 'No caption',
                    like_count: post.likes?.summary?.total_count || 0,
                    comments_count: post.comments?.summary?.total_count || 0,
                    views: 0 // Facebook Feed API doesn't easily return view count per post for public
                }));

                console.log(`[FB_INSIGHTS] Posts fetch success: ${topMedia.length} posts`);
            } catch (feedErr) {
                console.warn(`[FB_INSIGHTS] Posts fetch failed:`, feedErr.response?.data || feedErr.message);
                // Don't throw, just return empty media
            }

            return {
                profile: profileData,
                insights: insightsData,
                topMedia: topMedia
            };

        } catch (error) {
            console.error(`[FB_INSIGHTS] Global catch:`, error.message);
            throw error;
        }
    }

}

export default new MetaService();
