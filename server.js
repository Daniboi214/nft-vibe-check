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
            You are a helpful and honest NFT reviewer. Look at the details of this NFT project and explain what is good and what might be risky about it in simple, everyday English. 
            
            IMPORTANT RULES: 
            - Do not make price predictions.
            - Do not use confusing financial jargon.
            - Focus only on the quality, safety, and utility of the project based on its description.

            Project Name: ${osData.name || finalSlug}
            Description: ${osData.description || 'No description provided.'}
            
            Return ONLY a valid JSON object with EXACTLY these keys: 
            "vibe_score": a number from 0-100 rating the overall quality and trustworthiness of the project.
            "vibe_label": a short, simple label (e.g., "Looks Solid", "A Bit Risky", "Needs More Info", "Established Project").
            "collector_take": a 2 to 3 sentence simple summary of the project's pros and cons. Explain what the project is trying to do and if it seems reliable, using plain words.
            "flags": an array of 3 or 4 short strings highlighting simple observations (e.g., "Clear roadmap", "No description available", "Standard art project", "Strong community focus").
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