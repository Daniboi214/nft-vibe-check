# PULSE. 
**Institutional On-Chain Analysis & AI Vibe Check**

Pulse is a sleek, AI-powered terminal designed to cut through the noise of the Web3 space. By combining live on-chain data with strictly deterministic LLM analysis, Pulse delivers instant, objective evaluations of NFT collections to help traders manage risk without the emotion.

### 🔗 [Live Demo](https://nft-vibe-check-5vgc.vercel.app/)

---

## ⚡ Features
- **The Vibe Score:** A deterministic 0-100 rating based on utility, community focus, and development clarity.
- **Quantitative Take:** A strictly objective, AI-generated thesis eliminating market hype and financial jargon.
- **Dynamic Technical Flags:** Custom risk-management indicators identifying red flags or strong utility based on the contract's actual description.
- **Glassmorphic UI:** Premium, dark-mode terminal aesthetics built for institutional traders.

## 🛠 Tech Stack
- **Frontend:** React.js / Pure CSS (Glassmorphism design)
- **Backend:** Node.js / Express
- **AI Engine:** Groq API (Llama-3.1-8b-instant) running at `temperature: 0` for consistent, deterministic scoring.
- **Data Layer:** OpenSea API 
- **Hosting:** Vercel (Unified Serverless Deployment)

## 🚀 How to Run Locally
Run the following commands in your terminal to clone the project, install all dependencies, set up your environment variables, and start the app:
```bash
git clone INSERT_YOUR_GITHUB_REPO_URL_HERE
cd your-folder-name
npm install
echo "GROQ_API_KEY=your_groq_api_key" > .env
echo "OPENSEA_API_KEY=your_opensea_api_key" >> .env
npm start

