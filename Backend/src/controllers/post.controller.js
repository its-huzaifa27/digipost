import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Post from '../models/post.model.js';
import PlatformConnection from '../models/platformConnection.model.js';
import metaService from '../services/meta.service.js';

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
    const { caption, platforms: platformsJson } = req.body;
    const platforms = JSON.parse(platformsJson || '[]');
    const file = req.file;

    console.log("Create Post Request:", { userId, caption, platforms, file: file?.filename });

    let imageUrl = null;
    if (file) {
        const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
        imageUrl = `${baseUrl}/uploads/${file.filename}`;

        // FIX: Facebook cannot access localhost. Use a placeholder for dev testing.
        if (imageUrl.includes('localhost')) {
            console.log("⚠️ Localhost detected. Swapping with public placeholder image for Facebook API.");
            imageUrl = 'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1000&q=80';
        }
    }

    try {
        // 1. Create Post Record (Pending)
        const post = await Post.create({
            userId,
            content: caption,
            mediaUrl: imageUrl,
            mediaType: file ? (file.mimetype.startsWith('video') ? 'video' : 'image') : 'text',
            platforms: platforms,
            status: 'pending'
        });

        const results = {};

        // 2. Publish to selected platforms
        for (const platformId of platforms) {
            // Strategy: Find connection by platform name for this user.
            const connection = await PlatformConnection.findOne({
                where: { userId, platform: platformId, isActive: true }
            });

            if (!connection) {
                results[platformId] = { success: false, error: 'No connected account found.' };
                continue;
            }

            try {
                let response;
                if (platformId === 'facebook') {
                    response = await metaService.publishToFacebook(connection, caption, imageUrl);
                } else if (platformId === 'instagram') {
                    // Instagram-specific check for image
                    if (!imageUrl) throw new Error("Instagram requires an image.");
                    response = await metaService.publishToInstagram(connection, caption, imageUrl);
                }
                results[platformId] = { success: true, response: response?.data || response };
            } catch (err) {
                console.error(`Publish failed for ${platformId}:`, err.message);
                results[platformId] = { success: false, error: err.message };
            }
        }

        // 3. Update Post Record
        post.results = results;

        // Determine overall status
        const failures = Object.values(results).filter(r => !r.success).length;
        const successes = Object.values(results).filter(r => r.success).length;

        if (failures === 0 && successes > 0) post.status = 'published';
        else if (successes === 0 && failures > 0) post.status = 'failed';
        else post.status = 'partial'; // Mixed

        await post.save();

        res.json({ success: true, post, results });

    } catch (error) {
        console.error('Create Post Logic Error:', error);
        res.status(500).json({ error: error.message });
    }
};
