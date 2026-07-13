import Express from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const app = Express();
app.use(Express.json());

// Initialize the Gemini Client with your live API Key
const ai = new GoogleGenAI({ apiKey: "AIzaSyBlSfbQjMfQ9EoOHjXIlUXh_EX4SuRFdVY" });

// Define the rigid JSON schema for the output
const vibeCheckSchema = {
  type: Type.OBJECT,
  properties: {
    vibe_score: { 
      type: Type.INTEGER, 
      description: "a rough composite signal from 0 to 100 based on concept originality, clarity of mechanics, narrative strength, and collector appeal." 
    },
    vibe_label: { 
      type: Type.STRING, 
      description: "a short tag, 2-3 words max, describing the project state (e.g., 'genuine sleeper', 'hype-driven', 'mechanically interesting', 'thin concept')." 
    },
    collector_take: { 
      type: Type.STRING, 
      description: "2-4 sentences written entirely in lowercase, first-person collector voice. use cause-and-effect reasoning, natural hedges like 'i think' or 'honestly', and avoid generic AI filler or hype." 
    },
    flags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "list of short strings highlighting potential risks, missing data, or things worth double-checking." 
    }
  },
  required: ["vibe_score", "vibe_label", "collector_take", "flags"]
};

const SYSTEM_PROMPT = `
You are an advanced on-chain NFT researcher and native Web3 collector. Your task is to evaluate incoming crypto/NFT project data and provide a raw, honest "vibe check" evaluation.

CRITICAL STYLISTIC DIRECTIVES:
1. Tone: Writing must be entirely lowercase. Use a calm, analytical, conversational tone.
2. Voice: Speak from the perspective of an experienced individual collector (first person: "i think", "honestly", "i'm looking at"). 
3. Logic: Focus on cause-and-effect reasoning. Explain WHY a mechanic or art style works or fails.
4. Bans: Strictly avoid generic AI filler, balanced parallel sentence structures, and hollow marketing hype. Do not use overused CT slang (like "gmi", "to the moon", "lfg"). Keep it grounded. Use concrete specifics over vague commentary.

SCORING RUBRIC (0-100):
- 90-100: Exceptional originality, airtight mechanics (clear supply, smart distribution, sustainable royalties), strong core narrative, and clear collector appeal.
- 70-89: Solid project with real potential, but has slight friction (e.g., derivative aesthetic elements, unproven team, or missing minor details).
- 40-69: Average, uninspired, or highly derivative. Feels like a generic PFP copycat or a "thin concept" that relies purely on temporary hype.
- 0-39: High-risk, broken links, completely opaque mechanics, or clear red flags.
`;

app.post('/vibe-check', async (req, res) => {
  try {
    const { project_name, description, links } = req.body;

    if (!project_name) {
      return res.status(400).json({ error: "project_name is required" });
    }

    const inputContent = `
      Project Name: ${project_name}
      Description: ${description || "not provided"}
      Links: ${links ? links.join(', ') : "not provided"}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: inputContent,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: vibeCheckSchema,
        temperature: 0.7,
      }
    });

    const result = JSON.parse(response.text);
    return res.json(result);

  } catch (error) {
    console.error("Vibe Check Error:", error);
    return res.status(500).json({ error: "internal server error during evaluation" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NFT Vibe Check service running on port ${PORT}`);
});