import Express from 'express';

const app = Express();
app.use(Express.json());

const API_KEY = "AIzaSyBlSfbQjMfQ9EoOHjXIlUXh_EX4SuRFdVY";

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

    // Talk directly to Google's API over the web, bypassing the broken SDK entirely
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: inputContent }] }]
      })
    });

    const data = await apiResponse.json();
    
    if (data.error) {
      console.error("Google Endpoint Error:", data.error);
      return res.status(400).json({ error: data.error.message });
    }

    // Extract the raw text response from the raw Google structure
    let rawText = data.candidates[0].content.parts[0].text.trim();
    
    // Clean up markdown syntax if the AI included it
    if (rawText.startsWith("```json")) rawText = rawText.substring(7);
    if (rawText.endsWith("```")) rawText = rawText.substring(0, rawText.length - 3);

    const result = JSON.parse(rawText.trim());
    return res.json(result);

  } catch (error) {
    console.error("Direct Network Request Failure:", error);
    return res.status(500).json({ error: "internal server error during evaluation" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Direct API Vibe Check active on port ${PORT}`);
});