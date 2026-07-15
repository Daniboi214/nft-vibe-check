import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/vibe-check', async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) return res.json({ error: "STOP: GROQ_API_KEY is missing in Railway Variables." });
        if (!process.env.OPENSEA_API_KEY) return res.json({ error: "STOP: OPENSEA_API_KEY is missing in Railway Variables." });

        let finalSlug = req.body.collection_slug?.trim().toLowerCase().replace(/\s+/g, '-');
        if (!finalSlug) return res.json({ error: "STOP: No collection slug received." });
        
        if (finalSlug.includes('opensea.io')) {
            finalSlug = finalSlug.split('opensea.io/collection/')[1].split('/')[0].split('?')[0];
        }

        const osResponse = await fetch(`https://api.opensea.io/api/v2/collections/${finalSlug}`, {
            headers: { 'x-api-key': process.env.OPENSEA_API_KEY }
        });
        
        if (!osResponse.ok) return res.json({ error: `STOP: OpenSea API rejected the slug: ${finalSlug}` });
        const osData = await osResponse.json(); 

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const prompt = `
            You are a Lead Quantitative Web3 Analyst at an institutional crypto fund. Execute a rigorous, highly technical market analysis of this NFT project:
            Project Name: ${osData.name || finalSlug}
            On-Chain Data/Description: ${osData.description || 'No metadata provided.'}
            
            Return a JSON object with EXACTLY these keys: 
            "vibe_score": an integer from 0-100 reflecting risk-adjusted market positioning, underlying contract utility, and liquidity depth.
            "vibe_label": a technical categorization (e.g., "High-Conviction Blue-Chip", "Speculative Mid-Cap", "Illiquid Risk Asset").
            "collector_take": a comprehensive 4 to 5 sentence institutional thesis. Analyze floor volatility, volume velocity, tokenomics, and long-term viability using advanced crypto trading terminology. Do not use generic buzzwords; sound like a professional quant.
            "flags": an array of exactly 4 strings highlighting specific technical market indicators, bid/ask depth, or smart contract risk vectors.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ 
                role: "user", 
                content: prompt 
            }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });

        return res.json(JSON.parse(completion.choices[0].message.content));

    } catch (error) {
        // Sends the raw engine error straight to your frontend UI so we never have to guess again
        return res.json({ error: `FATAL BACKEND ERROR: ${error.message}` });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));