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

    // Official OpenAI compatibility endpoint
    const targetUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    
    const apiResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash', // The universally active, fully compatible ID
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
        response_format: { type: "json_object" }
      })
    });

    const data = await apiResponse.json();
    
    // Safely check if Google returned an error payload
    if (data.error) {
      console.error("Google AI Gateway Error:", data.error);
      return res.status(400).json({ error: data.error.message || "Google endpoint rejected key or payload" });
    }

    // Safely verify if choices exists before parsing
    if (!data.choices || data.choices.length === 0) {
      console.error("Malformed API response (no choices array):", data);
      return res.status(502).json({ error: "Empty or unexpected response from AI Gateway" });
    }

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
  console.log(`Vibe Check active on port ${PORT}`);
});