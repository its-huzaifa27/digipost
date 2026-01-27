import cron from "node-cron";
import { Op } from "sequelize";
import Post from "../models/post.model.js";
import PlatformConnection from "../models/platformConnection.model.js";
import metaService from "./meta.service.js";

import Client from "../models/client.model.js";

class CronService {
  constructor() {
    this.job = null;
  }

  start() {
    console.log(
      "⏳ Cron Service started: Checking for scheduled posts every 1 minute.",
    );

    // Run every minute
    this.job = cron.schedule("* * * * *", async () => {
      // Prevent overlapping executions
      if (this.isJobRunning) {
        console.log("[Cron] Previous job still running, skipping this tick.");
        return;
      }

      this.isJobRunning = true;
      try {
        await this.processScheduledPosts();
      } finally {
        this.isJobRunning = false;
      }
    });
  }

  async processScheduledPosts() {
    try {
      const now = new Date();

      // 1. Find posts that are 'scheduled' and due
      // AND belong to an Active Client
      const posts = await Post.findAll({
        where: {
          status: "scheduled",
          scheduledAt: {
            [Op.lte]: now, // Posts due now OR in the past (catch-up)
          },
        },
        include: [
          {
            model: Client,
            where: { isActive: true }, // Only process if client is active
            required: true, // Inner Join (Post MUST have an active Client)
          },
        ],
      });

      if (posts.length === 0) return;

      console.log(`[Cron] Found ${posts.length} scheduled posts to publish.`);

      // 2. Mark them as 'processing' immediately to prevent other workers/crons picking them up
      // Note: In a distributed system, we'd want row locking or atomic updates.
      // For this single-instance setup, this + isJobRunning is sufficient.
      const postIds = posts.map((p) => p.id);
      await Post.update({ status: "processing" }, { where: { id: postIds } });

      // Reload posts to ensure we have the objects with the new status (though we really just need the data we already fetched)
      // Actually, we can just iterate the 'posts' array since we already hold the objects.
      // But let's act on the objects we have.

      for (const post of posts) {
        // Double Check: Ensure client is STILL active (race condition or query join safety)
        const client = await Client.findOne({ where: { id: post.clientId } });
        if (!client || !client.isActive) {
          console.warn(
            `[Cron] SKIPPING Post ${post.id} because Client ${client?.name || "Unknown"} is SUSPENDED/Inactive.`,
          );
          // Revert status to scheduled? Or fail it? Let's leave it as processing for manual intervention or fail it.
          // Better: Fail it so it doesn't get stuck.
          post.status = "failed";
          post.results = { error: "Client suspended during processing" };
          await post.save();
          continue;
        }

        await this.publishPost(post);
      }
    } catch (error) {
      console.error("[Cron] Error processing scheduled posts:", error);
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

    for (const connectionId of platforms) {
      try {
        // Find connection for this user/client by ID
        const connection = await PlatformConnection.findOne({
          where: {
            id: connectionId,
            userId: post.userId,
            clientId: post.clientId,
            isActive: true,
          },
        });

        if (!connection) {
          throw new Error(`No active connection found for ID: ${connectionId}`);
        }

        const platformId = connection.platform;

        // Publish based on platform
        let response;
        if (platformId === "facebook") {
          // Standard Publish (Live)
          response = await metaService.publishToFacebook(
            connection,
            post.content,
            post.mediaUrl,
          );
        } else if (platformId === "instagram") {
          // Standard Publish (Live) - NO Scheduling params
          response = await metaService.publishToInstagram(
            connection,
            post.content,
            post.mediaUrl,
          );
        } else {
          // Add other platforms here
          console.warn(
            `[Cron] Platform ${platformId} not supported yet in cron.`,
          );
          continue;
        }

        results[connectionId] = {
          success: true,
          publishedAt: new Date(),
          response: response,
        };
        successCount++;
      } catch (error) {
        console.error(
          `[Cron] Failed to publish post ${post.id} to ${connectionId}:`,
          error.message,
        );
        results[connectionId] = {
          success: false,
          error: error.message || "Unknown error",
        };
        failureCount++;
      }
    }

    // Update Post Status
    // We need to re-fetch the post or use update to ensure we are saving the correct state
    // purely on the object instance.
    if (successCount > 0 && failureCount === 0) {
      post.status = "published";
    } else if (successCount > 0 && failureCount > 0) {
      post.status = "partial";
    } else {
      post.status = "failed";
    }

    post.results = results;
    await post.save();
    console.log(`[Cron] Finished Post ${post.id}. Status: ${post.status}`);
  }
}

export default new CronService();
