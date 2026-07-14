app.post('/vibe-check', async (req, res) => {
    try {
        const { collection_slug } = req.body;
        if (!collection_slug) return res.status(400).json({ error: "Missing collection_slug" });

        // Fetch collection details from OpenSea API v2
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

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
        });

        const resultData = JSON.parse(response.text.replace(/```json|```/g, '').trim());
        res.json(resultData);

    } catch (error) {
        res.status(500).json({ error: "Failed to process check", details: error.message });
    }
});