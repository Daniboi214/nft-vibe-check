import Express from 'express';

const app = Express();
app.use(Express.json());

const SYSTEM_PROMPT = `
You are an advanced on-chain NFT researcher and native Web3 collector. Your task is to evaluate incoming crypto/NFT project data and provide a raw, honest "vibe check" evaluation.

You MUST respond ONLY with a single, valid JSON object containing exactly these four keys. Do not include any markdown backticks, markdown formatting, or introductory text. Just the raw JSON object.

JSON Keys Required:
1. "vibe_score": (Integer from 0 to 100) based on concept originality, mechanics, and collector appeal.
2. "vibe_label": (String, 2-3 words max) describing the project state (e.g., "genuine sleeper", "hype-driven", "thin concept").
3. "collector_take": (String) 2-4 sentences written entirely in lowercase, first-person collector voice (using "i think", "honestly"). Avoid generic AI filler or hype.
4. "flags": (Array of strings) short phrases highlighting potential risks or missing details.

CRITICAL STYLISTIC DIRECTIVES:
- Everything in the "collector_take" text must be lowercase.
- Keep it grounded like an individual Discord/Alpha group analyst.
`;

app.post('/vibe-check', async (req, res) => {
  try {
    const { project_name, description, links } = req.body;

    if (!project_name) {
      return res.status(400).json({ error: "project_name is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing on Railway" });
    }

    // The foolproof method: Native endpoint with the key strictly inside the URL string
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
        // We explicitly DO NOT include an 'Authorization' header to avoid the OAuth trap
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          { 
            role: "user",
            parts: [{ text: `Evaluate this project:\nProject Name: ${project_name}\nDescription: ${description || "not provided"}\nLinks: ${links ? links.join(', ') : "not provided"}` }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json" // Forces Gemini to always return strict JSON
        }
      })
    });

    const data = await apiResponse.json();
    
    // Safely check if Google rejected the request
    if (data.error) {
      console.error("Google API Error:", data.error);
      return res.status(400).json({ error: data.error.message || "Google endpoint rejected the request" });
    }

    // Safely check if the response is valid
    if (!data.candidates || data.candidates.length === 0) {
      return res.status(502).json({ error: "Empty response from Gemini API" });
    }

    // Extract JSON from the native Gemini response structure
    const rawText = data.candidates[0].content.parts[0].text.trim();
    const result = JSON.parse(rawText);
    return res.json(result);

  } catch (error) {
    console.error("Evaluation Error:", error);
    return res.status(500).json({ error: "internal server error during evaluation" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Native Vibe Check active on port ${PORT}`);
});