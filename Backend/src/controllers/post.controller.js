import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Post from '../models/post.model.js';
import PlatformConnection from '../models/platformConnection.model.js';
import metaService from '../services/meta.service.js';
import { supabase } from '../config/supabase.js';

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

export const upload = multer({ storage: storage });

export const createPost = async (req, res) => {
    const userId = req.user.id; // From middleware
    const { caption, platforms: platformsJson, scheduledTime, clientId } = req.body;
    const platforms = JSON.parse(platformsJson || '[]');
    const file = req.file;

    console.log("Create Post Request:", { userId, clientId, caption, platforms, file: file?.filename, scheduledTime });

    if (!clientId) {
        return res.status(400).json({ error: "clientId is required" });
    }

    if (!file && platforms.length > 0) {
        // IG requires image, FB API is better with it usually
    }

    let uploadedFilePath = null; // To track for deletion
    let imageUrl = null;
    if (file) {
        try {
            // Upload to Supabase
            const fileExt = path.extname(file.originalname);
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;
            uploadedFilePath = fileName; // Store path for cleanup

            // Read file from disk
            const fileBuffer = fs.readFileSync(file.path);

            const { data, error } = await supabase.storage
                .from('uploads')
                .upload(uploadedFilePath, fileBuffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error("Supabase Upload Error:", error);
                throw new Error(`Image upload failed: ${error.message}`);
            }

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('uploads')
                .getPublicUrl(uploadedFilePath);

            imageUrl = publicUrlData.publicUrl;
            console.log("✅ Image uploaded to Supabase:", imageUrl);

            // Clean up local file
            fs.unlinkSync(file.path);

        } catch (uploadError) {
            console.error("Upload process failed:", uploadError);
            // Fallback? Or fail? Failed upload means we can't post to IG/FB properly.
            return res.status(500).json({ error: "Failed to upload image to storage." });
        }
    }

    try {
        // 1. Create Post Record (Pending)
        const post = await Post.create({
            userId,
            clientId,
            content: caption,
            mediaUrl: imageUrl,
            mediaType: file ? (file.mimetype.startsWith('video') ? 'video' : 'image') : 'text',
            platforms: platforms,
            status: 'pending'
        });

        const results = {};

        // 2. Publish to selected platforms
        for (const platformId of platforms) {
            // platformId is 'facebook' or 'instagram' (but better to pass the CONNECTION ID if possible)
            // But frontend currently sends 'facebook'/'instagram' strings.
            // We need to find the specific connection.

            // Strategy: Find connection by platform name for this user AND client.
            const connection = await PlatformConnection.findOne({
                where: { userId, clientId, platform: platformId, isActive: true }
            });

            if (!connection) {
                results[platformId] = { success: false, error: 'No connected account found.' };
                continue;
            }

            try {
                let response;
                if (platformId === 'facebook') {
                    response = await metaService.publishToFacebook(connection, caption, imageUrl, scheduledTime);
                } else if (platformId === 'instagram') {
                    // Instagram-specific check for image
                    if (!imageUrl) throw new Error("Instagram requires an image.");

                    if (scheduledTime) {
                        // Use the new scheduling method
                        response = await metaService.scheduleInstagramPost(connection, caption, imageUrl, scheduledTime);
                    } else {
                        // Regular publish
                        response = await metaService.publishToInstagram(connection, caption, imageUrl);
                    }
                }
                results[platformId] = {
                    success: true,
                    response: response?.data || response,
                    scheduledTime: scheduledTime || null
                };
            } catch (err) {
                const errorDetail = err.response?.data || err.message;
                console.error(`Publish failed for ${platformId}:`, errorDetail);
                results[platformId] = { success: false, error: errorDetail };
            }
        }

        // 3. Transient Cleanup: Remove image from Supabase after posting
        if (uploadedFilePath) {
            console.log("🧹 Cleaning up transient image from Supabase...");
            const { error: deleteError } = await supabase.storage
                .from('uploads')
                .remove([uploadedFilePath]);

            if (deleteError) {
                console.error("⚠️ Failed to cleanup image:", deleteError);
            } else {
                console.log("✨ Image deleted from Supabase (Transient Mode).");
            }
        }

        // 4. Update Post Record
        post.results = results;
        if (scheduledTime) {
            post.scheduledAt = new Date(scheduledTime * 1000);
        }

        // Determine overall status
        const failures = Object.values(results).filter(r => !r.success).length;
        const successes = Object.values(results).filter(r => r.success).length;

        if (failures === 0 && successes > 0) {
            post.status = scheduledTime ? 'scheduled' : 'published';
        } else if (successes === 0 && failures > 0) {
            post.status = 'failed';
        } else {
            post.status = 'partial'; // Mixed
        }

        await post.save();

        res.json({ success: true, post, results });

    } catch (error) {
        console.error('Create Post Logic Error:', error);
        res.status(500).json({ error: error.message });
    }
};
