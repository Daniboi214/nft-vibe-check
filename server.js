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

    const inputContent = `
      ${SYSTEM_PROMPT}
      
      Now, evaluate this project:
      Project Name: ${project_name}
      Description: ${description || "not provided"}
      Links: ${links ? links.join(', ') : "not provided"}
    `;

    // Securely pull the key from Railway's environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing on Railway" });
    }

    // Direct endpoint using v1beta (where 3.5-flash resides)
    const targetUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';
    
    // Authenticate using the Bearer token header instead of the URL string
    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: inputContent }] }]
      })
    });

    const data = await apiResponse.json();
    
    if (data.error) {
      console.error("Google Endpoint Error:", data.error);
      return res.status(400).json({ error: data.error.message });
    }

    // Extract raw text response from Google's response payload
    let rawText = data.candidates[0].content.parts[0].text.trim();
    
    // Remove markdown code fences if added
    if (rawText.startsWith("```json")) rawText = rawText.substring(7);
    if (rawText.endsWith("```")) rawText = rawText.substring(0, rawText.length - 3);

    const result = JSON.parse(rawText.trim());
    return res.json(result);

  } catch (error) {
    console.error("Network Request Failure:", error);
    return res.status(500).json({ error: "internal server error during evaluation" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Direct API Vibe Check active on port ${PORT}`);
});