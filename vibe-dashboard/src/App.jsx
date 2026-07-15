import { useState } from 'react'

function App() {
  const [slug, setSlug] = useState('pudgypenguins')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkVibe = async () => {
    setLoading(true)
    setResult(null)
    try {
      // REPLACE 'YOUR_RAILWAY_URL_HERE' WITH YOUR ACTUAL URL!
      const response = await fetch('https://fabulous-alignment-production-1016.up.railway.app/vibe-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_slug: slug })
      })
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setResult({ error: "Network Error", details: err.message })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 font-mono max-w-4xl mx-auto bg-[#0f172a] text-white">
      <h1 className="text-3xl font-bold text-green-400 mb-2">Agent Vibe Checker //</h1>
      <p className="text-slate-400 mb-8">On-chain Service Provider for OKX.AI Trading Bots</p>

      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl mb-8">
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-1">NFT Collection Slug</label>
          <input 
            value={slug} onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-green-400"
            placeholder="e.g. pudgypenguins"
          />
        </div>
        <button 
          onClick={checkVibe}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 disabled:bg-slate-700 text-slate-900 font-bold py-2 px-6 rounded transition-colors"
        >
          {loading ? 'Analyzing On-chain...' : 'Run Vibe Check'}
        </button>
      </div>

      {result && result.error && (
        <div className="bg-red-950/50 p-6 rounded-lg border border-red-500/50">
          <h2 className="text-red-400 font-bold">⚠️ ENGINE ERROR</h2>
          <p>{result.error}</p>
        </div>
      )}

      {result && !result.error && (
        <div className="bg-slate-900 p-6 rounded-lg border border-green-500/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-slate-400 text-xs uppercase">Vibe Score</h2>
              <div className="text-4xl font-bold">{result.vibe_score}/100</div>
            </div>
            <div className="text-right text-yellow-400 font-bold uppercase">{result.vibe_label}</div>
          </div>
          <p className="text-slate-300 italic mb-6 border-l-2 border-slate-700 pl-4">{result.collector_take}</p>
          <ul className="space-y-2">
            {result.flags?.map((flag, i) => (
              <li key={i} className="text-red-300 text-sm bg-red-950/30 p-2 rounded">⚠️ {flag}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default App