const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// This single line turns off all security blockers so your frontend can connect easily.
app.use(cors());
app.use(express.json());

// Initialize AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ai = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

// The Vibe Check Route
app.post('/vibe-check', async (req, res) => {
    try {
        const { collection_slug } = req.body;
        if (!collection_slug) return res.status(400).json({ error: "Missing collection_slug" });

        // Fetch OpenSea Data
        const osResponse = await fetch(`https://api.opensea.io/api/v2/collections/${collection_slug}`, {
            headers: { 'x-api-key': process.env.OPENSEA_API_KEY }
        });

        if (!osResponse.ok) return res.status(404).json({ error: "Collection not found on OpenSea" });
        const osData = await osResponse.json();

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