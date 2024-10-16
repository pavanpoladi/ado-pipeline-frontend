import React, { useEffect, useState } from 'react';
import msalInstance from './msalInstance';
import { loginRequest } from './authConfig';

const SignInButton = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [userName, setUserName] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [agentNodeSku, setAgentNodeSku] = useState('DEFAULT');
  const [pipelineRunUrl, setPipelineRunUrl] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await msalInstance.initialize();
      setIsInitialized(true);

      // Handle redirect after login
      const account = await msalInstance.handleRedirectPromise();
      if (account) {
        setUserName(account.name);
      }
    };
    initialize();
  }, []);

  const handleLogin = async () => {
    if (!isInitialized) {
      console.error('MSAL is not initialized');
      return;
    }
    try {
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      console.log('Login successful:', loginResponse);
      const account = msalInstance.getAllAccounts()[0];
      setUserName(account.name);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    msalInstance.logoutPopup();
    setUserName('');
    setPipelineRunUrl('');
    setTimestamp('');
    setIsLoading(false);
  };

  const triggerPipeline = async (e) => {
    e.preventDefault(); // Prevent form submission from causing a page reload
    setPipelineRunUrl(''); // Reset pipelineRunUrl
    setTimestamp(''); // Reset timestamp
    setIsLoading(true); //Reset loading state to true
    try {
      const response = await fetch('https://aio-ado-integration-ddarckbjhycdeec6.eastus2-01.azurewebsites.net/trigger-pipeline', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify({
            clusterName,
            agentNodeSku
        })
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Pipeline triggered successfully', data);
        setPipelineRunUrl(data.pipelineRunUrl);
        setTimestamp(data.timestamp);
      } else {
        const errorText = await response.text();
        console.log('clusterName:', clusterName);
        console.log('agentNodeSku:', agentNodeSku);
        console.error('Error triggering pipeline:', errorText);
      }
    } catch (error) {
      console.error('Error triggering pipeline:', error);
    } finally {
      setIsLoading(false); // Set loading state to false
    }
    
  };

  return (
    <div>
      {!userName ? (
        <button onClick={handleLogin} disabled={!isInitialized}>Sign In</button>
      ) : (
        <div>
          <p>Welcome, {userName}!</p>
          <button onClick={handleLogout}>Sign Out</button>
          <form onSubmit={triggerPipeline}>
            <div>
              <label>
                Cluster Name:
                <input
                  type="text"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label>
                Agent Node SKU:
                <input
                  type="text"
                  value={agentNodeSku}
                  onChange={(e) => setAgentNodeSku(e.target.value)}
                />
              </label>
            </div>
            <button type="submit">Trigger Pipeline</button>
          </form>
          {isLoading && !pipelineRunUrl && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p>Pipeline is being run...</p>
              <div className="loading-icon" style={{ marginLeft: '8px' }}></div> {/* Add your loading icon here */}
            </div>
          )}
          {pipelineRunUrl && (
            <div>
              <p>Timestamp: {timestamp}</p>
              <p>Pipeline Status: <a href={pipelineRunUrl} target="_blank" rel="noopener noreferrer">View Pipeline Run</a></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SignInButton;