import React, { useEffect, useState } from 'react';
import msalInstance from './msalInstance';
import { loginRequest } from './authConfig';

const SignInButton = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [userName, setUserName] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [agentNodeSku, setAgentNodeSku] = useState('DEFAULT');
  const [releaseRole, setReleaseRole] = useState('CommonInfra');
  const [releaseAction, setReleaseAction] = useState('CREATE_AND_DEPLOY');
  const [pipelineRunUrl, setPipelineRunUrl] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clusterNameError, setClusterNameError] = useState('');

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

  const validateClusterName = (name) => {
    const regex = /^[a-z][a-z0-9-]*$/;
    return regex.test(name);
  };

  const triggerPipeline = async (e) => {
    e.preventDefault(); // Prevent form submission from causing a page reload
    if (!validateClusterName(clusterName)) {
      setClusterNameError('Cluster name must start with a lowercase letter and can only contain lowercase letters, numbers, and hyphens.');
      return;
    }
    setClusterNameError(''); // Clear error message if valid
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
            agentNodeSku,
            releaseRole,
            releaseAction
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
                  onChange={(e) => {
                    setClusterName(e.target.value);
                    if (validateClusterName(e.target.value)) {
                      setClusterNameError(''); // Clear error message if valid
                    }
                  }}
                />
              </label>
              {clusterNameError && <p style={{ color: 'red', fontSize: '12px', fontWeight: 'normal' }}>{clusterNameError}</p>}
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
            <div>
            <label>
                TEAM:
                <select value={releaseRole} onChange={(e) => setReleaseRole(e.target.value)}>
                  <option value="CommonInfra">CommonInfra (Default)</option>
                  <option value="Akri">Akri</option>
                  <option value="MQ">MQ</option>
                  <option value="OPCUA">OPCUA</option>
                  <option value="ADR">ADR</option>
                  <option value="DOE">DOE</option>
                  <option value="Infra-INT">Infra-INT</option>
                  <option value="Infra-Release">Infra-Release</option>
                  <option value="Atlas">Atlas</option>
                  <option value="AIO-Private-RP">AIO-Private-RP</option>
                  <option value="ADRState">ADRState</option>
                </select>
              </label>
            </div>
            <div>
              <label>
                Action:
                <select value={releaseAction} onChange={(e) => setReleaseAction(e.target.value)}>
                  <option value="CREATE_AND_DEPLOY">Create and Deploy (Default)</option>
                  <option value="CREATE">Create</option>
                  <option value="DEPLOY">Deploy</option>
                </select>
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