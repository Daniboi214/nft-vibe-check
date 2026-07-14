import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

// 1. Enable standard CORS for all routes
app.use(cors());

// 2. Explicitly handle the OPTIONS preflight requests for all routes
app.options('/vibe-check', cors());

// 3. Parse incoming JSON requests
app.use(express.json());

// Initialize the Google Gen AI client using your environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/vibe-check', async (req, res) => {
    try {
        const { project_name, description } = req.body;

        if (!project_name || !description) {
            return res.status(400).json({ error: "Missing project_name or description in the request body." });
        }

        const prompt = `
You are a brutal, highly analytical Web3 Alpha Group Analyst. Your job is to analyze the following crypto/NFT project and provide a "Vibe Check" risk assessment.
You must return your assessment EXCLUSIVELY as a valid JSON object. Do not include markdown formatting, backticks, or any other text.

Project Name: ${project_name}
Description: ${description}

Analyze the smart contract mechanics, tokenomics, lore, and team structure described. Look for red flags like: impossible APY, rugs, anonymous teams, auto-burns, or overpromises. Look for green flags like: real-world utility, audits, and sustainable yield.

Return a JSON object with EXACTLY the following four keys:
- "vibe_score": A number from 0 to 100 (100 being extremely safe, 0 being a guaranteed scam).
- "vibe_label": A string classification (choose exactly one: "ESTABLISHED", "EMERGING", "UNPROVEN", or "HIGH RISK").
- "collector_take": A 2-3 sentence brutally honest, insider "alpha group" take on the project.
- "flags": An array of strings, where each string is a specific security/market risk red flag detected (if it's safe, return an empty array or positive notes).
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Clean up any markdown blocks (e.g., ```json ... ```) the model might return to prevent parsing errors
        let cleanJson = response.text.replace(/```json/gi, '').replace(/```/gi, '').trim();
        
        const resultData = JSON.parse(cleanJson);
        
        // Send the structured JSON back to your React frontend
        res.json(resultData);

    } catch (error) {
        console.error("Vibe Check Error:", error);
        res.status(500).json({ 
            error: "Failed to process the on-chain vibe check.",
            details: error.message 
        });
    }
});

// Railway injects a PORT environment variable automatically. Fallback to 3000 for local testing.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Vibe Check engine is live and listening on port ${PORT}`);
});