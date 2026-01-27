import { Sequelize, DataTypes, Op } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cronService from "./src/services/cron.service.js";
import Post from "./src/models/post.model.js";
import Client from "./src/models/client.model.js";
import PlatformConnection from "./src/models/platformConnection.model.js";
import metaService from "./src/services/meta.service.js";

// Mock metaService to avoid actual calls
metaService.publishToFacebook = async () => ({ id: "mock_fb_id" });
metaService.publishToInstagram = async () => ({ id: "mock_ig_id" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

async function runVerification() {
  console.log("🧪 Starting Verification...");

  // 1. Create a Fake Client & Connection & Post
  // We need real DB interaction for Sequelize to work, but we can clean up after.
  // Actually, let's just inspect the logic using a scheduled post.

  // Find an active client
  const client = await Client.findOne({ where: { isActive: true } });
  if (!client) {
    console.error("❌ No active client found. Cannot test.");
    process.exit(1);
  }
  console.log(`Found Active Client: ${client.name}`);

  // Create a Dummy Post
  const post = await Post.create({
    userId: "11111111-1111-1111-1111-111111111111", // Fake UUID
    clientId: client.id,
    content: "Test Post for Verification",
    status: "scheduled",
    scheduledAt: new Date(Date.now() - 10000), // Due 10s ago
    platforms: ["00000000-0000-0000-0000-000000000000"], // This will fail publishing, but testing status transition is key
  });
  console.log(`Created Test Post ID: ${post.id}`);

  // 2. Run the Cron Logic
  console.log("\n--- Running Cron Process ---");
  await cronService.processScheduledPosts();

  // 3. Verify Status
  const updatedPost = await Post.findByPk(post.id);
  console.log(`\nUpdated Post Status: ${updatedPost.status}`); // Should be 'failed' because fake connection

  if (updatedPost.status === "processing") {
    console.log("⚠️ Status stuck in processing? (Did it crash?)");
  } else if (
    updatedPost.status === "failed" ||
    updatedPost.status === "published"
  ) {
    console.log(
      "✅ Post processed successfully (transitioned out of scheduled).",
    );
  } else {
    console.log("❌ Post status unexpected.");
  }

  // Cleanup
  await post.destroy();
  console.log("🧹 Cleaned up test post.");
  process.exit(0);
}

runVerification();
