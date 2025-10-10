import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connection, setConnection] = useState(null);
  const [publicKey, setPublicKey] = useState(null);

  // Initialize connection to Solana cluster
  useEffect(() => {
    const initConnection = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { Connection, clusterApiUrl } = await import('@solana/web3.js');
        const solanaConnection = new Connection(
          clusterApiUrl('devnet'), // Using devnet for development
          'confirmed'
        );
        setConnection(solanaConnection);
      } catch (error) {
        console.error('Failed to initialize Solana connection:', error);
      }
    };

    initConnection();
  }, []);

  // Check if wallet is already connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.solana?.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          if (response.publicKey) {
            setPublicKey(response.publicKey);
            setWalletAddress(response.publicKey.toString());
            setIsConnected(true);
            await fetchBalance(response.publicKey);
          }
        } catch (error) {
          // Wallet not connected, this is normal
          console.log('No existing wallet connection');
        }
      }
    };

    checkWalletConnection();
  }, []);

  // Fetch wallet balance
  const fetchBalance = useCallback(async (pubKey) => {
    if (!connection || !pubKey) return;

    try {
      const balance = await connection.getBalance(pubKey);
      setWalletBalance((balance / 1e9).toFixed(4)); // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [connection]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!window.solana?.isPhantom) {
      throw new Error('Phantom wallet not found! Please install Phantom wallet.');
    }

    setIsConnecting(true);
    try {
      const response = await window.solana.connect();
      const pubKey = response.publicKey;
      
      setPublicKey(pubKey);
      setWalletAddress(pubKey.toString());
      setIsConnected(true);
      
      await fetchBalance(pubKey);
      
      return {
        publicKey: pubKey,
        address: pubKey.toString(),
        balance: walletBalance
      };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalance, walletBalance]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      if (window.solana?.disconnect) {
        await window.solana.disconnect();
      }
      
      setPublicKey(null);
      setWalletAddress(null);
      setWalletBalance(null);
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }, []);

  // Sign message
  const signMessage = useCallback(async (message) => {
    if (!publicKey || !window.solana) {
      throw new Error('Wallet not connected');
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await window.solana.signMessage(encodedMessage, 'utf8');
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }, [publicKey]);

  // Send transaction
  const sendTransaction = useCallback(async (transaction) => {
    if (!publicKey || !window.solana) {
      throw new Error('Wallet not connected');
    }

    try {
      const signature = await window.solana.sendTransaction(transaction, connection);
      return signature;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }, [publicKey, connection]);

  // Format address for display
  const formatAddress = useCallback((address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, []);

  const value = {
    // State
    walletAddress,
    walletBalance,
    isConnected,
    isConnecting,
    connection,
    publicKey,
    
    // Actions
    connectWallet,
    disconnectWallet,
    signMessage,
    sendTransaction,
    fetchBalance,
    formatAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
