import { useState } from 'react'

function App() {
  const [project, setProject] = useState('Penguin Battle Royale')
  const [desc, setDesc] = useState('An entirely on-chain survival game where 8,888 penguins fight. Losers have their NFTs automatically burned from their wallets via a custom smart contract. The final surviving penguin absorbs the metadata and traits of all 8,887 fallen enemies to become the ultimate 1-of-1.')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkVibe = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('https://fabulous-alignment-production-1016.up.railway.app/vibe-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: project, description: desc })
      })
      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error(err)
      setResult({ error: "Frontend Network Error", details: err.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 font-mono max-w-4xl mx-auto bg-[#0f172a] text-white">
      <h1 className="text-3xl font-bold text-green-400 mb-2">Agent Vibe Checker //</h1>
      <p className="text-slate-400 mb-8">On-chain Service Provider for OKX.AI Trading Bots</p>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl mb-8">
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-1">Target Project</label>
          <input 
            value={project} onChange={(e) => setProject(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-green-400"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-1">Contract / Lore Description</label>
          <textarea 
            value={desc} onChange={(e) => setDesc(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white h-24 outline-none focus:border-green-400"
          />
        </div>
        <button 
          onClick={checkVibe}
          disabled={loading}
          className="bg-green-500 hover:bg-green-400 disabled:bg-slate-700 text-slate-900 font-bold py-2 px-6 rounded transition-colors"
        >
          {loading ? 'Analyzing On-chain...' : 'Run Vibe Check'}
        </button>
      </div>

      {/* ERROR STATE UI */}
      {result && result.error && (
        <div className="bg-red-950/50 p-6 rounded-lg border border-red-500/50 shadow-2xl">
          <h2 className="text-red-400 font-bold mb-2">⚠️ ENGINE ERROR</h2>
          <p className="text-white">{result.error}</p>
          <p className="text-slate-400 text-sm mt-2">{result.details}</p>
        </div>
      )}

      {/* SUCCESS STATE UI */}
      {result && !result.error && (
        <div className="bg-slate-900 p-6 rounded-lg border border-green-500/30 shadow-2xl">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-slate-400 text-sm">VIBE SCORE</h2>
              <div className="text-5xl font-bold text-white">{result.vibe_score}<span className="text-lg text-slate-500">/100</span></div>
            </div>
            <div className="text-right">
              <h2 className="text-slate-400 text-sm">CLASSIFICATION</h2>
              <div className="text-xl font-bold text-yellow-400 uppercase">{result.vibe_label}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-green-400 text-sm mb-2">{"// ALPHA GROUP TAKE"}</h3>
            <p className="text-slate-300 leading-relaxed italic border-l-2 border-slate-700 pl-4">{result.collector_take}</p>
          </div>

          <div>
            <h3 className="text-red-400 text-sm mb-2">{"// RISK FLAGS DETECTED"}</h3>
            <ul className="space-y-2">
              {result.flags?.map((flag, i) => (
                <li key={i} className="bg-red-950/30 text-red-300 p-2 rounded text-sm border border-red-900/50">
                  ⚠️ {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default App