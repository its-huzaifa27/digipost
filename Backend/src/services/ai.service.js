import { GoogleGenerativeAI } from '@google/generative-ai';
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
}

export default new AIService();
