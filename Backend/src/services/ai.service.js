import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

class AIService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.genAI = null;
        this.model = null;

        if (this.apiKey) {
            console.log("✅ AI Service initialized with API Key.");
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });

            // DEBUG: List available models to check what the key has access to
            this.listModels();
        } else {
            console.warn("⚠️ GEMINI_API_KEY is missing in .env. AI features will not work.");
        }
    }

    async listModels() {
        try {
            console.log("🔍 Checking available AI models...");
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
            const data = await response.json();
            if (data.models) {
                console.log("✨ Available Models:", data.models.map(m => m.name));
            } else {
                console.error("❌ Could not list models. Error:", data);
            }
        } catch (error) {
            console.error("❌ Failed to list models:", error.message);
        }
    }

    async generatePostContent(topic) {
        if (!this.model) {
            console.error("❌ AI Model not initialized. Check GEMINI_API_KEY.");
            throw new Error("AI Service is not configured. Missing API Key.");
        }

        console.log(`🤖 Generating content for topic: "${topic}"`);

        try {
            const prompt = `
            You are a professional social media manager.
            Generate a creative and engaging social media post about: "${topic}".
            
            Return the response in the following JSON format ONLY:
            {
                "caption": "write a catchy caption here with emojis",
                "hashtags": "#hashtag1 #hashtag2 #hashtag3"
            }
            Do not add markdown formatting or code blocks. Just the raw JSON string.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up potentially dirty JSON (sometimes models wrap in ```json ... ```)
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(cleanText);

        } catch (error) {
            console.error("AI Generation Error:", error);
            throw new Error("Failed to generate content. Please try again.");
        }
    }

    async generateImage(prompt) {
        if (!this.apiKey) {
            throw new Error("AI Service is not configured. Missing API Key.");
        }

        console.log(`🎨 Generating image for prompt: "${prompt}"`);

        try {
            // Use Gemini 2.0 Flash Exp for Image Generation via generateContent
            // This model supports "text-to-image" via the standard API but requires specific response handling
            // The output is usually in `server-sent events` or simple response if not streaming
            // We need to request image generation in the content part? No, usually just the prompt?
            // Actually, for Gemini 2.0 image gen, we should check if the SDK supports it directly or if we need a specific format.
            // But let's try the simplest SDK approach first for 'gemini-2.0-flash-exp-image-generation'

            const imageModel = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            // Note: Use the base model 'gemini-2.0-flash-exp' which typically includes image gen capabilities if enabled
            // OR explicitly 'gemini-2.0-flash-exp-image-generation' if that is the distinct endpoint.
            // Based on user list: 'models/gemini-2.0-flash-exp-image-generation' exists. Let's target it.

            const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

            // IMPORTANT: Unofficial/Experimental image gen via Gemini 2.0 might require asking for it in the prompt explicitly?
            // Or typically it involves tool use.
            // HOWEVER, since 'imagen-3.0' is billed, and the user has 'gemini-2.0-flash-exp', let's TRY to see if it responds to "Generate an image of..."
            // If the model refuses ("I cannot generate images"), then we are stuck without billing.
            // But let's try a direct REST call to the `predict` endpoint of `imagen-4.0-fast-generate-001` which might be cheaper/free?
            // The user list had `imagen-4.0-fast-generate-001`.

            // LET'S TRY 'imagen-4.0-fast-generate-001' with the PREDICT endpoint first, as "Fast" models are often the free tier ones.
            const fastModelName = "imagen-3.0-generate-001"; // Let's fallback to 3.0 which is often free in beta? 
            // actually user list didn't have 3.0.

            // OKAY, let's try 'gemini-2.0-flash-exp' via SDK, but asking for JSON might not give an image.
            // Standard Gemini 2.0 Image gen via API is not yet fully documented for "free tier" simple usage without tools.

            // RE-ATTEMPT: The error "not supported for predict" means use SDK `generateContent`.
            // Let's use the SDK to call that model.

            const modelGen = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await modelGen.generateContent(prompt);
            const response = await result.response;

            // Check if there are inline images? 
            // Gemini usually returns text.

            // ALTERNATIVE: Use `imagen-4.0-fast-generate-001` with the PREVIOUS predict code.
            // Maybe "Fast" is the key.
            // Let's try that first as it retains the base64 logic.
            const fastImagenParams = {
                modelName: "imagen-3.0-generate-001", // Often the default free one in typical setups, despite listing
                // If user list says "imagen-4.0-fast-generate-001", use it.
            };

            // ... Changing strategy to try the "Fast" Imagen model ...
            const modelName = "imagen-3.0-generate-001"; // Trying a widely available one
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${this.apiKey}`;

            const requestBody = {
                instances: [{ prompt: prompt }],
                parameters: { sampleCount: 1 }
            };

            const apiRes = await axios.post(url, requestBody, { headers: { 'Content-Type': 'application/json' } });

            if (apiRes.data.predictions) {
                return apiRes.data.predictions[0].bytesBase64Encoded;
            }
            throw new Error("No image returned.");

        } catch (error) {
            console.error("AI Image Gen Error:", error.response?.data || error);
            throw new Error(`Failed to generate image: ${error.message}`);
        }
    }
}

export default new AIService();
