import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaWallet, FaCheck } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: var(--bg-secondary);
  border: 2px solid var(--border-neon);
  border-radius: 12px;
  box-shadow: var(--glow-cyan), inset 0 1px 0 rgba(125, 211, 252, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
  
  @keyframes modalSlideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  background: linear-gradient(90deg, var(--bg-elevated) 0%, rgba(0, 255, 65, 0.1) 100%);
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-neon);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: var(--fg-primary);
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--fg-muted);
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--fg-primary);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const WalletList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const WalletOption = styled.button`
  background: var(--bg-elevated);
  border: 2px solid var(--border-cyan);
  border-radius: 8px;
  padding: 16px;
  color: var(--fg-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  font-family: inherit;
  
  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      border-color: var(--border-cyan);
      box-shadow: none;
    }
  }
`;

const WalletIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-elevated) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-cyan);
  box-shadow: 0 0 10px rgba(125, 211, 252, 0.2);
`;

const WalletInfo = styled.div`
  flex: 1;
`;

const WalletName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--fg-primary);
  margin-bottom: 4px;
`;

const WalletStatus = styled.div`
  font-size: 12px;
  color: var(--fg-muted);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusIcon = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.available ? 'var(--fg-success)' : 'var(--fg-error)'};
  box-shadow: 0 0 4px currentColor;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
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
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid var(--fg-error);
  border-radius: 6px;
  padding: 12px;
  color: var(--fg-error);
  font-size: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NoWalletsMessage = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: var(--fg-muted);
`;

const NoWalletsTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--fg-primary);
`;

const NoWalletsText = styled.div`
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 16px;
`;

const InstallLink = styled.a`
  color: var(--fg-primary);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid var(--border-cyan);
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--fg-secondary);
    border-bottom-color: var(--fg-secondary);
  }
`;

const WalletModal = ({ 
  isOpen, 
  onClose, 
  availableWallets, 
  onSelectWallet, 
  isConnecting, 
  error 
}) => {
  if (!isOpen) return null;

  const handleWalletSelect = (wallet) => {
    if (!isConnecting) {
      onSelectWallet(wallet);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isConnecting) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Select Wallet</ModalTitle>
          <CloseButton onClick={onClose} disabled={isConnecting}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalContent>
          {error && (
            <ErrorMessage>
              <FaTimes />
              {error}
            </ErrorMessage>
          )}
          
          {availableWallets.length === 0 ? (
            <NoWalletsMessage>
              <NoWalletsTitle>No Wallets Detected</NoWalletsTitle>
              <NoWalletsText>
                To connect your wallet, please install one of the supported Solana wallets:
              </NoWalletsText>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <InstallLink href="https://phantom.app/" target="_blank" rel="noopener noreferrer">
                  Install Phantom
                </InstallLink>
                <InstallLink href="https://solflare.com/" target="_blank" rel="noopener noreferrer">
                  Install Solflare
                </InstallLink>
                <InstallLink href="https://backpack.app/" target="_blank" rel="noopener noreferrer">
                  Install Backpack
                </InstallLink>
              </div>
            </NoWalletsMessage>
          ) : (
            <WalletList>
              {availableWallets.map((wallet, index) => (
                <WalletOption
                  key={index}
                  onClick={() => handleWalletSelect(wallet)}
                  disabled={isConnecting}
                >
                  <WalletIcon>
                    <FaWallet />
                  </WalletIcon>
                  <WalletInfo>
                    <WalletName>{wallet.name}</WalletName>
                    <WalletStatus>
                      <StatusIcon available={true} />
                      Available
                    </WalletStatus>
                  </WalletInfo>
                  {isConnecting && (
                    <LoadingSpinner />
                  )}
                </WalletOption>
              ))}
            </WalletList>
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default WalletModal;
