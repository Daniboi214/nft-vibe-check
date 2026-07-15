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
            You are an optimistic and insightful Web3 community analyst. Review this NFT project and provide a thoughtful, detailed, and positive analysis of its vision, art, and community potential in simple, everyday English. 

            IMPORTANT RULES: 
            - Write a detailed and engaging review. Do not be too brief.
            - Focus heavily on the positive aspects, creative vision, and potential utility. Frame any missing information constructively.
            - Do not make price predictions or use confusing financial jargon.

            Project Name: ${osData.name || finalSlug}
            Description: ${osData.description || 'No description provided.'}
            
            Return ONLY a valid JSON object with EXACTLY these keys: 
            "vibe_score": a number from 0-100 rating the overall quality, creativity, and community appeal of the project (lean towards fair, encouraging scores).
            "vibe_label": a short, encouraging label (e.g., "Great Community Focus", "Creative Vision", "Solid Potential", "Awesome Art Style").
            "collector_take": A detailed, 4 to 5 sentence engaging paragraph. Thoroughly explain the project's unique appeal, what makes it interesting, and why a collector would enjoy being part of this community. Keep the grammar natural and easy to read.
            "flags": an array of exactly 4 short, mostly positive or neutral strings highlighting specific features (e.g., "Strong creative direction", "Focuses on community building", "Accessible to new collectors").
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