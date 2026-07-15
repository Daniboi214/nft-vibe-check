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
        const completion = await groq.chat.completions.create({
            messages: [{ 
                role: "user", 
                content: `Analyze NFT: ${osData.name || finalSlug}. Return valid JSON with vibe_score (0-100), vibe_label, collector_take (2 sentences), and flags (array).` 
            }],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });

        return res.json(JSON.parse(completion.choices[0].message.content));

    } catch (error) {
        // THIS SENDS THE RAW ENGINE ERROR STRAIGHT TO YOUR FRONTEND UI
        return res.json({ error: `FATAL BACKEND ERROR: ${error.message}` });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));