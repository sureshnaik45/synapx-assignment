import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/claims/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to process claim. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (route) => {
    if (!route) return '#64748b';
    const r = route.toLowerCase();
    if (r.includes('fast')) return '#10b981';
    if (r.includes('investigation') || r.includes('fraud')) return '#ef4444';
    if (r.includes('specialist') || r.includes('standard')) return '#f59e0b';
    return '#eab308';
  };

  return (
    <div className="app-container">
      <div className="card">
        <header className="header">
          <h1>Synapx FNOL Agent</h1>
          <p>Autonomous Insurance Claim Processor</p>
        </header>

        <div className="upload-section">
          <label htmlFor="file-upload" className="upload-box">
            <div className="icon">📂</div>
            <span className="upload-text">
              {file ? file.name : "Click to Upload File"}
            </span>
            <input 
              id="file-upload" 
              type="file" 
              onChange={handleFileChange} 
              accept=".pdf,.txt,.doc,.docx" 
            />
          </label>
        </div>

        <button 
          className="process-btn" 
          onClick={handleUpload} 
          disabled={loading || !file}
        >
          {loading ? "Processing..." : "Process Claim"}
        </button>

        {error && <div className="error-msg">{error}</div>}

        {result && (
          <div className="result-container">
            <div className="status-badge" style={{ backgroundColor: getStatusColor(result.recommendedRoute) }}>
              {result.recommendedRoute}
            </div>
            
            <div className="reasoning-box">
              <h3>Reasoning</h3>
              <p>{result.reasoning}</p>
            </div>

            {result.missingFields && result.missingFields.length > 0 && (
               <div className="missing-alert">
                 ⚠️ Missing: {result.missingFields.join(', ')}
               </div>
            )}

            <details className="raw-data">
              <summary>View Extracted Data</summary>
              <pre>{JSON.stringify(result.extractedFields, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;