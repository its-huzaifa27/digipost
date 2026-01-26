import axios from 'axios';
import PlatformConnection from '../models/platformConnection.model.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const FB_GRAPH_URL = 'https://graph.facebook.com/v22.0';

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
    /**
     * Publishes a post to Facebook.
     */
    async publishToFacebook(connection, message, mediaUrls, scheduledTime) {
        try {
            const params = new URLSearchParams();
            params.append('access_token', connection.accessToken);

            // Normalize input to array
            const media = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrls ? [mediaUrls] : []);

            if (scheduledTime) {
                params.append('published', 'false');
                params.append('scheduled_publish_time', scheduledTime);
            }

            if (media.length === 0) {
                // Text only
                const url = `${FB_GRAPH_URL}/${connection.pageId}/feed`;
                params.append('message', message);
                return await axios.post(url, params);
            } else if (media.length === 1) {
                const fileUrl = media[0];
                if (this._isVideo(fileUrl)) {
                    // --- Single Video Post ---
                    const videoUrl = `${FB_GRAPH_URL}/${connection.pageId}/videos`;
                    params.append('file_url', fileUrl);
                    params.append('description', message); // FB Videos use 'description', not 'message'/'caption'
                    return await axios.post(videoUrl, params);
                } else {
                    // --- Single Photo Post ---
                    const photoUrl = `${FB_GRAPH_URL}/${connection.pageId}/photos`;
                    params.append('url', fileUrl);
                    params.append('caption', message);
                    return await axios.post(photoUrl, params);
                }
            } else {
                // Multi-Photo Post (Carousel/Album)
                // Note: FB API organic albums are typically images. Mixed/Video albums are complex/limited via API.
                // We will treat this as an Image Album for now.

                // 1. Upload each photo as unpublished
                const mediaIds = await Promise.all(media.map(async (img) => {
                    const uploadParams = new URLSearchParams();
                    uploadParams.append('access_token', connection.accessToken);
                    uploadParams.append('url', img);
                    uploadParams.append('published', 'false'); // Important: Don't publish yet

                    const res = await axios.post(`${FB_GRAPH_URL}/${connection.pageId}/photos`, uploadParams);
                    return res.data.id;
                }));

                // 2. Publish Feed Post with attached_media
                const feedUrl = `${FB_GRAPH_URL}/${connection.pageId}/feed`;
                params.append('message', message);

                // Format: [{"media_fbid":"ID1"}, {"media_fbid":"ID2"}]
                const attachedMedia = mediaIds.map(id => ({ media_fbid: id }));
                params.append('attached_media', JSON.stringify(attachedMedia));

                return await axios.post(feedUrl, params);
            }
        } catch (error) {
            console.error(`FB Publish Error (${connection.pageName}):`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Publishes a post to Instagram (2-Step Flow).
     * Supports: Single Video (Reels), Single Image, Carousel (Images/Videos).
     */
    async publishToInstagram(connection, caption, mediaUrls) {
        try {
            // Normalize input
            const media = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrls ? [mediaUrls] : []);

            if (media.length === 0) {
                throw new Error("Instagram requires at least one image/video.");
            }

            if (media.length === 1) {
                // --- Single Media Flow (Image or Reel) ---
                const fileUrl = media[0];
                const isVideo = this._isVideo(fileUrl);

                const containerParams = new URLSearchParams();
                containerParams.append('caption', caption);
                containerParams.append('access_token', connection.accessToken);

                if (isVideo) {
                    containerParams.append('media_type', 'REELS'); // Valid for v19.0+ for single video
                    containerParams.append('video_url', fileUrl);
                } else {
                    containerParams.append('image_url', fileUrl);
                }

                const containerResponse = await axios.post(
                    `${FB_GRAPH_URL}/${connection.igBusinessId}/media`,
                    containerParams
                );

                const creationId = containerResponse.data.id;

                // CRITICAL: Wait for processing (especially for Video/Reels)
                await this._waitForInstagramMedia(creationId, connection.accessToken);

                const publishParams = new URLSearchParams();
                publishParams.append('creation_id', creationId);
                publishParams.append('access_token', connection.accessToken);

                const publishResponse = await axios.post(
                    `${FB_GRAPH_URL}/${connection.igBusinessId}/media_publish`,
                    publishParams
                );
                return publishResponse.data;

            } else {
                // --- Carousel Flow ---
                // 1. Create Item Containers (is_carousel_item=true)
                const itemIds = await Promise.all(media.map(async (url) => {
                    const isVideo = this._isVideo(url);
                    const itemParams = new URLSearchParams();

                    itemParams.append('is_carousel_item', 'true');
                    itemParams.append('access_token', connection.accessToken);

                    if (isVideo) {
                        itemParams.append('media_type', 'VIDEO');
                        itemParams.append('video_url', url);
                    } else {
                        // media_type default is usually image, but image_url implies it
                        itemParams.append('image_url', url);
                    }

                    const res = await axios.post(`${FB_GRAPH_URL}/${connection.igBusinessId}/media`, itemParams);
                    return res.data.id;
                }));

                // 2. Wait for ALL items to be ready
                // This is absolutely required for Carousels containing videos, and safe for images.
                for (const itemId of itemIds) {
                    await this._waitForInstagramMedia(itemId, connection.accessToken);
                }

                // 3. Create Carousel Container
                const carouselParams = new URLSearchParams();
                carouselParams.append('media_type', 'CAROUSEL');
                carouselParams.append('caption', caption);
                carouselParams.append('children', itemIds.join(',')); // Comma-separated IDs
                carouselParams.append('access_token', connection.accessToken);

                const carouselContainerResponse = await axios.post(
                    `${FB_GRAPH_URL}/${connection.igBusinessId}/media`,
                    carouselParams
                );

                const carouselId = carouselContainerResponse.data.id;

                // 4. Publish Carousel
                const publishParams = new URLSearchParams();
                publishParams.append('creation_id', carouselId);
                publishParams.append('access_token', connection.accessToken);

                return (await axios.post(`${FB_GRAPH_URL}/${connection.igBusinessId}/media_publish`, publishParams)).data;
            }
        } catch (error) {
            console.error(`IG Publish Error (${connection.pageName}):`, error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Helper to detect video files based on extension.
     */
    _isVideo(url) {
        if (!url) return false;
        // Basic check for common video extensions
        return url.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i) !== null;
    }


    /**
     * Polls the Instagram API to check if a media container is ready for publishing.
     */
    async _waitForInstagramMedia(creationId, accessToken) {
        let status = 'IN_PROGRESS';
        let attempts = 0;
        const maxAttempts = 60; // 60 attempts * 5s = 5 minutes max wait

        while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
            attempts++;
            // Wait 5 seconds before checking
            await new Promise(resolve => setTimeout(resolve, 5000));

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
     * Fetches Instagram Insights with tiered fallbacks for Views.
     * Solves "0 Views" bug by checking Field -> Plays Metric -> Reach Metric.
     */
    async getInstagramInsights(connection) {
        console.log(`[IG_INSIGHTS] Starting fetch for: ${connection.pageName}`);

        try {
            if (!connection.igBusinessId) throw new Error("No IG Business ID linked.");

            // 1. Fetch Profile
            let profileData = {};
            try {
                const profileRes = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}`, {
                    params: {
                        fields: 'followers_count,media_count,username,name,profile_picture_url',
                        access_token: connection.accessToken
                    }
                });
                profileData = profileRes.data;
            } catch (err) { console.error('[IG_INSIGHTS] Profile Fetch Error:', err.message); }

            // 2. Account Insights (v22.0 Safe)
            let insightsData = [];
            const commonParams = { period: 'day', access_token: connection.accessToken };

            // Helper to fetch account metrics safely
            const fetchAccountMetric = async (metric, type = null) => {
                try {
                    const params = { ...commonParams, metric };
                    if (type) params.metric_type = type; // v22 Requirement
                    const res = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}/insights`, { params });
                    return res.data.data || [];
                } catch (e) {
                    // console.warn(`[IG_INSIGHTS] Metric ${metric} failed: ${e.response?.data?.error?.message}`);
                    return [];
                }
            };

            insightsData.push(...await fetchAccountMetric('reach'));
            insightsData.push(...await fetchAccountMetric('views,total_interactions,accounts_engaged,profile_views,website_clicks', 'total_value'));
            insightsData.push(...await fetchAccountMetric('follower_count')); // Might fail on small acts

            // Demographics with breakdown
            try {
                const demoRes = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}/insights`, {
                    params: {
                        metric: 'follower_demographics',
                        period: 'lifetime',
                        metric_type: 'total_value',
                        breakdown: 'age,gender,country,city',
                        access_token: connection.accessToken
                    }
                });
                insightsData.push(...(demoRes.data.data || []));
            } catch (e) { /* Ignore demo fails */ }

            // 3. Media Insights (The "0 Views" Fix)
            let topMedia = [];
            try {
                // Step A: Get the list with the 'ig_play_count' field
                const mediaResponse = await axios.get(`${FB_GRAPH_URL}/${connection.igBusinessId}/media`, {
                    params: {
                        fields: 'id,media_type,media_product_type,media_url,thumbnail_url,timestamp,caption,like_count,comments_count,ig_play_count',
                        limit: 10,
                        access_token: connection.accessToken
                    }
                });

                const mediaList = mediaResponse.data.data || [];

                topMedia = await Promise.all(mediaList.map(async (media) => {
                    let views = 0;
                    let saved = 0;

                    // --- VIEW COUNT STRATEGY ---

                    // CASE 1: REELS & VIDEOS
                    if (media.media_type === 'VIDEO' || media.media_product_type === 'REELS') {
                        // Priority 1: Field 'ig_play_count' (Fastest)
                        if (media.ig_play_count !== undefined) {
                            views = media.ig_play_count;
                        }
                        // Priority 2: Metric 'plays' (Reliable Fallback)
                        else {
                            try {
                                const playsRes = await axios.get(`${FB_GRAPH_URL}/${media.id}/insights`, {
                                    params: { metric: 'plays', access_token: connection.accessToken }
                                });
                                views = playsRes.data.data?.[0]?.values?.[0]?.value || 0;
                                console.log(`[IG_DEBUG] Recovered Views via 'plays' metric for ${media.id}: ${views}`);
                            } catch (err) {
                                // Priority 3: Metric 'reach' (Last Resort)
                                try {
                                    const reachRes = await axios.get(`${FB_GRAPH_URL}/${media.id}/insights`, {
                                        params: { metric: 'reach', access_token: connection.accessToken }
                                    });
                                    views = reachRes.data.data?.[0]?.values?.[0]?.value || 0;
                                } catch (e) { /* Give up */ }
                            }
                        }
                    }

                    // CASE 2: IMAGES & CAROUSELS
                    else {
                        let viewSuccess = false;

                        // Priority 1: Metric 'views' (New Standard for v22+)
                        try {
                            const viewsRes = await axios.get(`${FB_GRAPH_URL}/${media.id}/insights`, {
                                params: { metric: 'views', access_token: connection.accessToken }
                            });
                            // Check deep structure safely
                            const val = viewsRes.data.data?.[0]?.values?.[0]?.value;
                            if (val !== undefined) {
                                views = val;
                                viewSuccess = true;
                                console.log(`[IG_DEBUG] Views via 'views' metric for Image ${media.id}: ${views}`);
                            }
                        } catch (e) { /* Ignore */ }

                        // Priority 2: Metric 'impressions' (Deprecated but might work for old media)
                        if (!viewSuccess) {
                            try {
                                const impRes = await axios.get(`${FB_GRAPH_URL}/${media.id}/insights`, {
                                    params: { metric: 'impressions', access_token: connection.accessToken }
                                });
                                views = impRes.data.data?.[0]?.values?.[0]?.value || 0;
                                viewSuccess = true;
                            } catch (e) { /* Expected failure in v22 */ }
                        }

                        // Priority 3: Metric 'reach' (Safe Fallback)
                        if (!viewSuccess) {
                            try {
                                const reachRes = await axios.get(`${FB_GRAPH_URL}/${media.id}/insights`, {
                                    params: { metric: 'reach', access_token: connection.accessToken }
                                });
                                views = reachRes.data.data?.[0]?.values?.[0]?.value || 0;
                                console.log(`[IG_DEBUG] Views via 'reach' for Image ${media.id}: ${views}`);
                            } catch (e) {
                                console.warn(`[IG_DEBUG] Failed all View metrics for Image ${media.id}`);
                            }
                        }
                    }

                    // --- SAVED COUNT ---
                    try {
                        const savedRes = await axios.get(`${FB_GRAPH_URL}/${media.id}/insights`, {
                            params: { metric: 'saved', access_token: connection.accessToken }
                        });
                        saved = savedRes.data.data?.[0]?.values?.[0]?.value || 0;
                    } catch (e) { /* Ignore */ }

                    return {
                        ...media,
                        views: views, // This will now hold Field OR Plays OR Reach
                        saved: saved
                    };
                }));

            } catch (mediaErr) {
                console.error('[IG_INSIGHTS] Fatal Media List Error:', mediaErr.message);
            }

            return { profile: profileData, insights: insightsData, topMedia: topMedia };

        } catch (error) {
            console.error('[IG_INSIGHTS] Critical Failure:', error.message);
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
                        // Updated stable metrics for v21.0
                        // Added: page_fan_adds (New Likes), page_post_engagements
                        metric: 'page_impressions_unique,page_daily_active_users,page_impressions,page_fan_adds,page_post_engagements',
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
