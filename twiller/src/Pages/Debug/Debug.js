import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

const Debug = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [envVar, setEnvVar] = useState('');

  useEffect(() => {
    setApiUrl(API_BASE_URL);
    setEnvVar(process.env.REACT_APP_API_URL || 'NOT SET');
    
    // Test backend connection
    fetch(`${API_BASE_URL}/posts`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(`HTTP ${response.status}`);
      })
      .then(data => {
        setBackendStatus(`✅ Working! Found ${data.length} posts`);
      })
      .catch(error => {
        setBackendStatus(`❌ Failed: ${error.message}`);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Debug Info</h2>
      <div style={{ background: '#f0f0f0', padding: '15px', marginBottom: '10px' }}>
        <strong>API URL from config:</strong><br />
        {apiUrl}
      </div>
      <div style={{ background: '#f0f0f0', padding: '15px', marginBottom: '10px' }}>
        <strong>Environment Variable:</strong><br />
        {envVar}
      </div>
      <div style={{ background: '#f0f0f0', padding: '15px', marginBottom: '10px' }}>
        <strong>Backend Status:</strong><br />
        {backendStatus}
      </div>
      <div style={{ background: '#f0f0f0', padding: '15px' }}>
        <strong>All Environment Variables:</strong><br />
        {Object.keys(process.env)
          .filter(key => key.startsWith('REACT_APP_'))
          .map(key => `${key}: ${process.env[key]}`)
          .join('<br />')}
      </div>
    </div>
  );
};

export default Debug;