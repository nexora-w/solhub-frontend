import React from 'react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import styled from 'styled-components';

const TestContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-cyan);
  border-radius: 8px;
  padding: 16px;
  color: var(--fg-primary);
  font-size: 12px;
  max-width: 300px;
  z-index: 1000;
`;

const TestButton = styled.button`
  background: var(--bg-elevated);
  border: 1px solid var(--border-neon);
  color: var(--fg-primary);
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  margin: 4px;
  
  &:hover {
    box-shadow: var(--glow-cyan);
  }
`;

const Status = styled.div`
  margin: 8px 0;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => props.connected ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)'};
  border: 1px solid ${props => props.connected ? 'var(--fg-success)' : 'var(--fg-error)'};
  color: ${props => props.connected ? 'var(--fg-success)' : 'var(--fg-error)'};
`;

const WalletTest = () => {
  const {
    walletAddress,
    walletBalance,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    signMessage,
    formatAddress
  } = useWalletConnection();

  const handleSignTest = async () => {
    try {
      const signature = await signMessage('Hello from SOLHUB!');
      console.log('Signature:', signature);
      alert('Message signed successfully! Check console for signature.');
    } catch (error) {
      console.error('Sign test failed:', error);
      alert('Sign test failed: ' + error.message);
    }
  };

  return (
    <TestContainer>
      <h4 style={{ margin: '0 0 8px 0', color: 'var(--fg-primary)' }}>Wallet Test</h4>
      
      <Status connected={isConnected}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </Status>
      
      {walletAddress && (
        <div>
          <div>Address: {formatAddress(walletAddress)}</div>
          <div>Username: {formatAddress(walletAddress)}</div>
          <div>Balance: {walletBalance} SOL</div>
        </div>
      )}
      
      {error && (
        <div style={{ color: 'var(--fg-error)', margin: '8px 0' }}>
          Error: {error}
        </div>
      )}
      
      <div>
        <TestButton 
          onClick={isConnected ? disconnectWallet : connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
        </TestButton>
        
        {isConnected && (
          <TestButton onClick={handleSignTest}>
            Test Sign
          </TestButton>
        )}
      </div>
    </TestContainer>
  );
};

export default WalletTest;
