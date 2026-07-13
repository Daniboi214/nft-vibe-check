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

    // OpenAI-compatible endpoint — this is the secret sauce that accepts AQ. keys perfectly!
    const targetUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    
    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // AQ. keys require standard Bearer auth on this endpoint
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash', // The OpenAI gateway maps this to the latest active engine
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: `Evaluate this project:
            Project Name: ${project_name}
            Description: ${description || "not provided"}
            Links: ${links ? links.join(', ') : "not provided"}` 
          }
        ],
        response_format: { type: "json_object" } // Enforce native JSON output at the gateway level
      })
    });

    const data = await apiResponse.json();
    
    if (data.error) {
      console.error("Google Endpoint Error:", data.error);
      return res.status(400).json({ error: data.error.message });
    }

    // Extract the raw text from the OpenAI response structure
    const rawText = data.choices[0].message.content.trim();
    const result = JSON.parse(rawText);
    return res.json(result);

  } catch (error) {
    console.error("Network Request Failure:", error);
    return res.status(500).json({ error: "internal server error during evaluation" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`OpenAI-compatible Vibe Check active on port ${PORT}`);
});