import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/vibe-check', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY || !process.env.OPENSEA_API_KEY) {
            return res.status(500).json({ error: "Server missing API Keys" });
        }

        let rawInput = req.body.collection_slug;
        if (!rawInput) return res.status(400).json({ error: "Missing collection input" });

        let finalSlug = rawInput.trim();
        if (finalSlug.includes('opensea.io/collection/')) {
            finalSlug = finalSlug.split('opensea.io/collection/')[1].split('/')[0].split('?')[0];
        } else {
            finalSlug = finalSlug.toLowerCase().replace(/\s+/g, '-');
        }

        const osResponse = await fetch(`https://api.opensea.io/api/v2/collections/${finalSlug}`, {
            headers: { 'x-api-key': process.env.OPENSEA_API_KEY }
        });

        if (!osResponse.ok) return res.status(404).json({ error: `Collection not found on OpenSea. Tried searching for: ${finalSlug}` });
        const osData = await osResponse.json();

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const ai = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            You are a professional Web3 Quantitative Analyst providing institutional-grade research. Analyze this NFT project:
            Name: ${osData.name}
            Description: ${osData.description}
            
            Return ONLY a JSON object with these keys: 
            "vibe_score" (0-100, representing overall market health, utility, and fundamentals), 
            "vibe_label" (e.g., "Strong Fundamentals", "High Risk", "Speculative", "Established Blue-Chip"), 
            "collector_take" (2 sentences of objective, professional analysis regarding its market positioning and long-term viability), 
            "flags" (array of strings highlighting potential risks, liquidity concerns, or positive technical indicators).
            Do not include markdown or backticks.
        `;

        const result = await ai.generateContent(prompt);
        const responseText = result.response.text();
        const resultData = JSON.parse(responseText.replace(/```json|```/g, '').trim());
        
        res.json(resultData);

    } catch (error) {
        console.error("Backend Error:", error);
        
        // Gracefully handle Gemini 503 Overload Errors
        if (error.status === 503 || (error.message && error.message.includes('503'))) {
            return res.status(503).json({ 
                error: "The AI analysis engine is currently experiencing a high volume of requests. Please try again in a few moments." 
            });
        }

        // Generic error fallback
        res.status(500).json({ error: "Failed to process check", details: error.message });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));