import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  FaExclamationTriangle,
  FaQuestionCircle,
  FaCheck,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useWalletConnection } from "../hooks/useWalletConnection";
import WalletModal from "./WalletModal";

const HeaderContainer = styled.header`
  background: var(--bg-secondary);
  border: 2px solid var(--border-neon);
  border-radius: 8px;
  box-shadow: var(--glow-cyan), inset 0 1px 0 rgba(125, 211, 252, 0.1);
  margin-top: 20px;
  margin-left: 20px;
  margin-right: 20px;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    margin: 10px;
    margin-top: 10px;
  }

  @media (max-width: 480px) {
    margin: 5px;
    margin-top: 5px;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  position: relative;
  z-index: 3;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    gap: 8px;
  }
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
  height: 40px;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    min-width: 120px;
    height: 36px;
    font-size: 13px;
    padding: 6px 12px;
  }

  @media (max-width: 480px) {
    min-width: 100px;
    height: 32px;
    font-size: 12px;
    padding: 4px 8px;
  }
`;

const TwitterButton = styled.button`
  background: var(--bg-elevated);
  border: 1px solid var(--border-cyan);
  color: var(--fg-primary);
  padding: 8px 12px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  min-width: 140px;

  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    min-width: 120px;
    height: 36px;
    font-size: 11px;
    padding: 6px 10px;
  }

  @media (max-width: 480px) {
    min-width: 100px;
    height: 32px;
    font-size: 10px;
    padding: 4px 8px;
  }
`;

const WalletInfo = styled.button`
  background: var(--bg-elevated);
  border: 1px solid var(--border-cyan);
  color: var(--fg-primary);
  padding: 8px 12px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  height: 40px;
  min-width: 140px;

  &:hover {
    border-color: var(--border-neon);
    box-shadow: var(--glow-cyan);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    min-width: 120px;
    height: 36px;
    font-size: 11px;
    padding: 6px 10px;
  }

  @media (max-width: 480px) {
    min-width: 100px;
    height: 32px;
    font-size: 10px;
    padding: 4px 8px;
  }
`;

const WalletAddress = styled.div`
  font-size: 10px;
  color: var(--fg-secondary);
  font-family: "Courier New", monospace;
  font-weight: 400;
`;


const ContractAddressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 1px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-wrap: wrap;
  position: relative;
`;

const ContractAddressText = styled.span`
  color: var(--fg-muted);
  font-size: 14px;
  font-weight: 500;
  font-family: "Courier New", monospace;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: var(--fg-primary);
  }

  @media (max-width: 768px) {
    font-size: 12px;
    word-break: break-all;
    line-height: 1.2;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const CheckMark = styled.span`
  color: var(--fg-success);
  font-size: 12px;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
`;

const ContractAddressLabel = styled.span`
  color: var(--fg-muted);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 12px;
    color: var(--fg-secondary);
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const CopySuccessMessage = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-secondary);
  border: 2px solid var(--fg-primary);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--fg-primary);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 0 20px rgba(125, 211, 252, 0.3);
  z-index: 1000;
  animation: fadeInOut 2s ease-in-out;

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
    20% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    80% {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid var(--border-cyan);
  border-top: 2px solid var(--fg-primary);
  border-radius: 50%;
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
    isConnected,
    isConnecting,
    error,
    connectWallet,
    connectToWallet,
    disconnectWallet,
    formatAddress,
    clearError,
    debugWalletStatus,
    currentWallet,
    availableWallets,
    isModalOpen,
    openWalletModal,
    closeWalletModal,
  } = useWalletConnection();

  // Track last sent user data to prevent duplicate sends
  const lastSentUserData = useRef(null);

  // Copy functionality state
  const [copySuccess, setCopySuccess] = useState(false);
  
  // State for responsive address display
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for responsive address display
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update user data when wallet connects/disconnects
  useEffect(() => {
    if (isConnected && walletAddress) {
      const userData = {
        username: walletAddress, // Use full wallet address as username
        id: walletAddress,
        avatar: null,
        walletAddress: walletAddress,
        isWalletUser: true, // Flag to identify wallet-connected users
      };

      // Only send if user data has actually changed
      if (
        !lastSentUserData.current ||
        lastSentUserData.current.username !== userData.username
      ) {
        lastSentUserData.current = userData;
        onUserLogin(userData);
      }
    } else if (!isConnected && lastSentUserData.current) {
      lastSentUserData.current = null;
      onUserLogin(null);
    }
  }, [isConnected, walletAddress, onUserLogin]);

  // Handle wallet connection
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // Handle wallet selection from modal
  const handleWalletSelect = async (wallet) => {
    try {
      await connectToWallet(wallet);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error("Wallet disconnection failed:", error);
    }
  };

  // Handle copy contract address to clipboard
  const handleCopyContractAddress = async () => {
    const contractAddress = "an4GkmSAp1USKddbS6vUVETmgmoCHNDQ1HeNhawpump";
    try {
      await navigator.clipboard.writeText(contractAddress);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = contractAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  // Function to truncate contract address for mobile display
  const truncateAddress = (address, startChars = 4, endChars = 4) => {
    if (!isMobile) {
      return address; // Show full address on desktop
    }
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}.....${address.slice(-endChars)}`;
  };

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <ContractAddressContainer>
              <ContractAddressLabel>
                CONTRACT ADDRESS:
              </ContractAddressLabel>
              <ContractAddressText
                onClick={handleCopyContractAddress}
                title="Click to copy contract address"
              >
                an4GkmSAp1USKddbS6vUVETmgmoCHNDQ1HeNhawpump
                <CheckMark show={copySuccess}>
                  <FaCheck />
                </CheckMark>
              </ContractAddressText>
            </ContractAddressContainer>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <span
              style={{
                color: "var(--fg-primary)",
                fontSize: isMobile ? "20px" : "24px",
                fontWeight: "600",
                letterSpacing: "1px",
              }}
            >
              USERHUB
            </span>
          </div>

          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: isMobile ? "8px" : "12px",
            flexWrap: isMobile ? "wrap" : "nowrap",
            justifyContent: isMobile ? "center" : "flex-end",
            width: isMobile ? "100%" : "auto"
          }}>
            <TwitterButton 
              onClick={() => window.open('https://x.com/userhubsol', '_blank')}
              title="Follow us on X (Twitter)"
            >
              <FaXTwitter />
            </TwitterButton>
            {isConnected && walletAddress ? (
              <WalletInfo>
                <WalletAddress>{formatAddress(walletAddress)}</WalletAddress>
              </WalletInfo>
            ) : null}
            <ConnectWalletButton
              onClick={
                isConnected ? handleDisconnectWallet : handleConnectWallet
              }
              disabled={isConnecting}
            >
              {isConnecting ? (
                <LoadingSpinner />
              ) : isConnected ? (
                "Disconnect"
              ) : availableWallets.length > 0 ? (
                `Connect ${availableWallets[0].name}`
              ) : (
                "Connect Wallet"
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


      <WalletModal
        isOpen={isModalOpen}
        onClose={closeWalletModal}
        availableWallets={availableWallets}
        onSelectWallet={handleWalletSelect}
        isConnecting={isConnecting}
        error={error}
      />
    </>
  );
}

export default Header;
