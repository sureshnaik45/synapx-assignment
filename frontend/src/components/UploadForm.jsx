import React from 'react';

const UploadForm = ({ onUpload, loading, file, setFile }) => {
  return (
    <div className="upload-section">
      <div className="file-input-wrapper">
        <input 
          type="file" 
          accept=".pdf,.txt" 
          onChange={(e) => setFile(e.target.files[0])} 
          disabled={loading}
          id="file-upload"
        />
      </div>
      
      <button 
        onClick={onUpload} 
        disabled={loading || !file}
        className={loading ? "btn-disabled" : "btn-primary"}
      >
        {loading ? (
          <span>⚙️ Analyzing Document...</span>
        ) : (
          <span>🚀 Process Claim</span>
        )}
      </button>
    </div>
  );
};

export default UploadForm;