import React, { useState } from 'react';
import './App.css';

// --- YOUR LIVE RAILWAY BACKEND ---
const API_URL = 'https://fabulous-alignment-production-1016.up.railway.app/vibe-check'; 

function App() {
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const runAnalysis = async () => {
    if (!slug.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_slug: slug })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Failed to connect to the backend engine.");
    } finally {
      setLoading(false);
    }
  };

  const getGlowClass = (score) => {
    if (score >= 80) return 'glow-green';
    if (score >= 50) return 'glow-amber';
    return 'glow-red';
  };

  return (
    <div className="container">
      <div className="header">
        <h1>PULSE<span style={{ color: '#3b82f6' }}>.</span></h1>
        <p>INSTITUTIONAL ON-CHAIN ANALYSIS</p>
      </div>

      <div className="search-box">
        <input 
          type="text" 
          className="search-input data-font" 
          placeholder="Enter OpenSea Collection Slug (e.g., pudgypenguins)" 
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
        />
        <button 
          className="analyze-btn data-font" 
          onClick={runAnalysis} 
          disabled={loading}
        >
          {loading ? 'WAIT' : 'ANALYZE'}
        </button>
      </div>

      {loading && (
        <div className="loading data-font">
          <div className="spinner"></div>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>QUERYING SMART CONTRACTS...</p>
        </div>
      )}

      {error && (
        <div className="error data-font">
          {error}
        </div>
      )}

      {result && (
        <div className="dashboard">
          <div className="glass-panel score-card">
            <h2 className="section-title">VIBE SCORE</h2>
            <div className={`score-value data-font ${getGlowClass(result.vibe_score)}`}>
              {result.vibe_score}
            </div>
            <div className="vibe-label data-font">
              {result.vibe_label}
            </div>
          </div>

          <div className="glass-panel">
            <h2 className="section-title">QUANTITATIVE TAKE</h2>
            <p className="analysis-text">{result.collector_take}</p>
            
            <h2 className="section-title">TECHNICAL FLAGS</h2>
            <div className="flags-container">
              {result.flags.map((flag, index) => (
                <span key={index} className="flag-chip data-font">
                  &gt; {flag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;