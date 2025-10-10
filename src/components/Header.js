import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useWalletConnection } from '../hooks/useWalletConnection';

const HeaderContainer = styled.header`
  background: var(--bg-secondary);
  border: 2px solid var(--border-neon);
  border-radius: 8px;
  box-shadow: var(--glow-cyan), inset 0 1px 0 rgba(125, 211, 252, 0.1);
  margin: 20px;
  overflow: hidden;
  position: relative;
  animation: terminalBoot 2s ease-out;
`;

const TerminalHeader = styled.div`
  background: linear-gradient(90deg, var(--bg-elevated) 0%, rgba(0, 255, 65, 0.1) 100%);
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-neon);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TerminalDots = styled.div`
  display: flex;
  gap: 6px;
`;

const TerminalDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--fg-error);
  box-shadow: 0 0 5px currentColor;
  
  &:nth-child(2) {
    background: var(--fg-warning);
  }
  
  &:nth-child(3) {
    background: var(--fg-primary);
  }
`;

const TerminalTitle = styled.div`
  margin-left: 12px;
  font-size: 12px;
  color: var(--fg-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  position: relative;
  z-index: 3;
`;

const AsciiArt = styled.pre`
  font-size: 12px;
  line-height: 1;
  color: var(--fg-secondary);
  text-shadow: var(--glow-cyan);
  white-space: pre;
  animation: flicker 8s infinite;
  pointer-events: none;
  margin: 0;
`;

const HeaderLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CopyBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  padding: 0 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-neon);
  border-radius: 2px;
  color: var(--fg-primary);
  font-size: 10px;
  letter-spacing: 0.5px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(125, 211, 252, 0.15);
  user-select: none;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--glow-cyan);
    transform: translateY(-1px);
  }
`;

const HeaderLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  padding: 0 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-neon);
  border-radius: 2px;
  color: var(--fg-primary);
  text-decoration: none;
  box-shadow: 0 0 10px rgba(125, 211, 252, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--glow-cyan);
    transform: translateY(-1px);
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NetworkStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
`;

const LiveBalance = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
`;

const ConnectWalletButton = styled.button`
  background: var(--bg-elevated);
  border: 1px solid var(--border-cyan);
  color: var(--fg-primary);
  padding: 8px 16px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateY(-1px);
  }
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const WalletAddress = styled.div`
  font-size: 10px;
  color: var(--fg-secondary);
  font-family: 'Courier New', monospace;
  background: var(--bg-elevated);
  padding: 2px 6px;
  border-radius: 2px;
  border: 1px solid var(--border-cyan);
`;

const WalletBalance = styled.div`
  font-size: 10px;
  color: var(--fg-primary);
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-cyan);
  border-top: 2px solid var(--fg-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--bg-secondary);
  border: 2px solid var(--fg-error);
  border-radius: 8px;
  padding: 12px 16px;
  color: var(--fg-error);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--fg-error);
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin-left: 8px;
  
  &:hover {
    opacity: 0.7;
  }
`;

function Header({ user, onUserLogin, connectedUsers }) {
  const {
    walletAddress,
    walletBalance,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    formatAddress,
    clearError
  } = useWalletConnection();

  // Track last sent user data to prevent duplicate sends
  const lastSentUserData = useRef(null);

  // Update user data when wallet connects/disconnects
  useEffect(() => {
    if (isConnected && walletAddress) {
      const userData = {
        username: walletAddress, // Use full wallet address as username
        id: walletAddress,
        avatar: null,
        walletAddress: walletAddress,
        balance: parseFloat(walletBalance) || 0,
        isWalletUser: true // Flag to identify wallet-connected users
      };
      
      // Only send if user data has actually changed
      if (!lastSentUserData.current || 
          lastSentUserData.current.username !== userData.username ||
          lastSentUserData.current.balance !== userData.balance) {
        lastSentUserData.current = userData;
        onUserLogin(userData);
      }
    } else if (!isConnected && lastSentUserData.current) {
      lastSentUserData.current = null;
      onUserLogin(null);
    }
  }, [isConnected, walletAddress, walletBalance, onUserLogin]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: 'var(--fg-muted)', fontSize: '14px', fontWeight: '500' }}>
              CONTACT ADDRESS
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <span style={{ 
              color: 'var(--fg-primary)', 
              fontSize: '24px', 
              fontWeight: '600',
              letterSpacing: '1px'
            }}>
              SOLHUB
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isConnected && walletAddress ? (
              <WalletInfo>
                <WalletAddress>{formatAddress(walletAddress)}</WalletAddress>
                <WalletBalance>{walletBalance} SOL</WalletBalance>
              </WalletInfo>
            ) : null}
            <ConnectWalletButton 
              onClick={isConnected ? handleDisconnectWallet : handleConnectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <LoadingSpinner />
              ) : isConnected ? (
                'Disconnect'
              ) : (
                'Connect Wallet'
              )}
            </ConnectWalletButton>
          </div>
        </HeaderContent>
      </HeaderContainer>

      {error && (
        <ErrorMessage>
          <FaExclamationTriangle />
          {error}
          <CloseButton onClick={clearError}>×</CloseButton>
        </ErrorMessage>
      )}
    </>
  );
}

export default Header;
