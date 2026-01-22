
import cron from 'node-cron';
import { Op } from 'sequelize';
import Post from '../models/post.model.js';
import PlatformConnection from '../models/platformConnection.model.js';
import metaService from './meta.service.js';

class CronService {
    constructor() {
        this.job = null;
    }

    start() {
        console.log('⏳ Cron Service started: Checking for scheduled posts every 1 minute.');
        
        // Run every minute
        this.job = cron.schedule('* * * * *', async () => {
            await this.processScheduledPosts();
        });
    }

    async processScheduledPosts() {
        try {
            const now = new Date();
            
            // 1. Find posts that are 'scheduled' and due
            const posts = await Post.findAll({
                where: {
                    status: 'scheduled',
                    scheduledAt: {
                        [Op.lte]: now
                    }
                }
            });

            if (posts.length === 0) return;

            console.log(`[Cron] Found ${posts.length} scheduled posts to publish.`);

            for (const post of posts) {
                await this.publishPost(post);
            }

        } catch (error) {
            console.error('[Cron] Error processing scheduled posts:', error);
        }
    }

    /**
     * Publishes a single post to its target platforms.
     */
    async publishPost(post) {
        console.log(`[Cron] Publishing Post ID: ${post.id}`);
        const platforms = post.platforms || [];
        const results = post.results || {};
        let successCount = 0;
        let failureCount = 0;

        // Mark as processing (optional, to avoid race conditions if cron takes > 1 min)
        // ideally we might want a 'processing' status, but for now we trust logic speed.

        for (const platformId of platforms) {
            try {
                // Find connection for this user/client/platform
                const connection = await PlatformConnection.findOne({
                    where: {
                        userId: post.userId,
                        clientId: post.clientId,
                        platform: platformId,
                        isActive: true
                    }
                });

                if (!connection) {
                    throw new Error(`No active connection found for ${platformId}`);
                }

                // Publish based on platform
                let response;
                if (platformId === 'facebook') {
                    // Standard Publish (Live)
                    response = await metaService.publishToFacebook(connection, post.content, post.mediaUrl);
                } else if (platformId === 'instagram') {
                    // Standard Publish (Live) - NO Scheduling params
                    response = await metaService.publishToInstagram(connection, post.content, post.mediaUrl);
                } else {
                   // Add other platforms here
                   console.warn(`[Cron] Platform ${platformId} not supported yet in cron.`);
                   continue;
                }

                results[platformId] = {
                    success: true,
                    publishedAt: new Date(),
                    response: response
                };
                successCount++;

            } catch (error) {
                console.error(`[Cron] Failed to publish post ${post.id} to ${platformId}:`, error.message);
                results[platformId] = {
                    success: false,
                    error: error.message || 'Unknown error'
                };
                failureCount++;
            }
        }

        // Update Post Status
        if (successCount > 0 && failureCount === 0) {
            post.status = 'published';
        } else if (successCount > 0 && failureCount > 0) {
            post.status = 'partial';
        } else {
            post.status = 'failed';
        }
        
        post.results = results;
        await post.save();
        console.log(`[Cron] Finished Post ${post.id}. Status: ${post.status}`);
    }
}

export default new CronService();
