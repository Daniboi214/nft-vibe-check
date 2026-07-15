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

        // --- THE INPUT CLEANER ---
        let finalSlug = rawInput.trim();
        
        // If they pasted a full OpenSea URL, extract just the slug
        if (finalSlug.includes('opensea.io/collection/')) {
            finalSlug = finalSlug.split('opensea.io/collection/')[1].split('/')[0].split('?')[0];
        } else {
            // If they typed a name with spaces, convert it to a standard slug format
            finalSlug = finalSlug.toLowerCase().replace(/\s+/g, '-');
        }
        // -------------------------

        // Fetch OpenSea Data using the cleaned slug
        const osResponse = await fetch(`https://api.opensea.io/api/v2/collections/${finalSlug}`, {
            headers: { 'x-api-key': process.env.OPENSEA_API_KEY }
        });

        if (!osResponse.ok) return res.status(404).json({ error: `Collection not found on OpenSea. Tried searching for: ${finalSlug}` });
        const osData = await osResponse.json();

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const ai = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

        const prompt = `
            You are a brutal Web3 Alpha Group Analyst. Analyze this project:
            Name: ${osData.name}
            Description: ${osData.description}
            
            Return ONLY a JSON object with these keys: 
            "vibe_score" (0-100), "vibe_label", "collector_take" (2 sentences), "flags" (array of strings).
            Do not include markdown or backticks.
        `;

        const result = await ai.generateContent(prompt);
        const responseText = result.response.text();
        const resultData = JSON.parse(responseText.replace(/```json|```/g, '').trim());
        
        res.json(resultData);

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Failed to process check", details: error.message });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));