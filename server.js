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
            Analyze the following NFT project based on its provided details. Provide an objective, detailed, and balanced assessment of its features, utility, and creative direction. 

            IMPORTANT RULES: 
            - Do not adopt a persona. Do not use first-person pronouns (I, we, my).
            - Do not make price predictions or give financial advice.
            - Maintain a strictly objective and neutral tone. State facts and observations clearly.
            - Avoid overly harsh criticism; if data is missing, simply state it as an area requiring more clarity.
            - Provide a thorough analysis. Do not be brief.

            Project Name: ${osData.name || finalSlug}
            Description: ${osData.description || 'No description provided.'}
            
            Return ONLY a valid JSON object with EXACTLY these keys: 
            "vibe_score": an integer from 0-100 reflecting the project's overall development, clarity of purpose, and available features based on the description.
            "vibe_label": a concise, objective label (e.g., "Established Ecosystem", "Art-Focused Collection", "Developing Utility", "Unclear Scope").
            "collector_take": A detailed 4 to 5 sentence objective analysis. Evaluate what the project offers, its thematic or technical focus, and its apparent goals. Keep the language clear, descriptive, and strictly analytical.
            "flags": an array of exactly 4 unique, collection-specific objective observations. DO NOT copy these examples. You MUST write new, custom flags based specifically on the actual description and name of ${osData.name || finalSlug} (e.g., if the description mentions gaming, flag the gaming utility; if it is blank, flag the lack of documentation).
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ 
                role: "user", 
                content: prompt 
            }],
            model: "llama-3.1-8b-instant",
            temperature: 0, // Forces the AI to give consistent, identical scores for the same collection
            response_format: { type: "json_object" }
        });

        return res.json(JSON.parse(completion.choices[0].message.content));

    } catch (error) {
        // Sends the raw engine error straight to your frontend UI so we never have to guess again
        return res.json({ error: `FATAL BACKEND ERROR: ${error.message}` });
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));