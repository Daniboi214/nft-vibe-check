import { useState } from 'react'

function App() {
  const [slug, setSlug] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkVibe = async () => {
    if (!slug) return;
    setLoading(true)
    setResult(null)
    try {
      // REPLACE THIS URL WITH YOUR LIVE RAILWAY URL
      const response = await fetch('YOUR_RAILWAY_URL_HERE/vibe-check', {
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
    <div className="min-h-screen p-6 md:p-12 font-sans bg-gradient-to-br from-slate-900 via-[#0a1128] to-slate-950 text-slate-100 flex flex-col items-center">
      
      {/* Header Section */}
      <div className="max-w-3xl w-full text-center mb-10 mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
          OKX.AI Market Intelligence
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium tracking-wide">
          Institutional-Grade On-Chain Analytics & Sentiment Scoring
        </p>
      </div>

      {/* Main Search Card */}
      <div className="max-w-2xl w-full bg-slate-800/40 backdrop-blur-xl p-8 rounded-2xl border border-slate-700/50 shadow-2xl mb-8">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Target Collection
          </label>
          <input 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-600 rounded-lg p-4 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-500"
            placeholder="Enter collection name or paste OpenSea URL..."
          />
        </div>
        <button 
          onClick={checkVibe}
          disabled={loading || !slug}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-blue-900/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Running Analytics...
            </span>
          ) : 'Generate Intelligence Report'}
        </button>
      </div>

      {/* Error State */}
      {result && result.error && (
        <div className="max-w-2xl w-full bg-red-950/40 backdrop-blur-md p-6 rounded-xl border border-red-500/30 text-center">
          <h2 className="text-red-400 font-bold mb-2 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            System Exception
          </h2>
          <p className="text-red-200/80 text-sm">{result.error}</p>
        </div>
      )}

      {/* Success Results State */}
      {result && !result.error && (
        <div className="max-w-2xl w-full bg-slate-800/40 backdrop-blur-xl p-8 rounded-2xl border border-blue-500/20 shadow-2xl animate-fade-in">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-700/50 pb-6">
            <div>
              <h2 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Fundamental Score</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-white">{result.vibe_score}</span>
                <span className="text-slate-500 font-medium">/100</span>
              </div>
            </div>
            <div className="bg-blue-900/30 border border-blue-500/30 px-4 py-2 rounded-full">
              <span className="text-blue-300 font-semibold text-sm uppercase tracking-wide">{result.vibe_label}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3">Analyst Brief</h3>
            <p className="text-slate-200 leading-relaxed text-sm md:text-base bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
              {result.collector_take}
            </p>
          </div>

          <div>
            <h3 className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-3">Technical Indicators</h3>
            <div className="grid gap-2">
              {result.flags?.map((flag, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                  <div className="mt-0.5 min-w-[12px] h-[12px] rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                  </div>
                  <span className="text-slate-300 text-sm leading-snug">{flag}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default App