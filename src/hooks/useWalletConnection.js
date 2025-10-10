import { useState, useEffect, useCallback } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';

export const useWalletConnection = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connection, setConnection] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState(null);

  // Fetch wallet balance
  const fetchBalance = useCallback(async (pubKey) => {
    if (!connection || !pubKey) return;

    try {
      const balance = await connection.getBalance(pubKey);
      setWalletBalance((balance / 1e9).toFixed(4)); // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setError('Failed to fetch wallet balance');
    }
  }, [connection]);

  // Initialize Solana connection
  useEffect(() => {
    const initConnection = () => {
      try {
        // Check if we're in browser environment
        if (typeof window === 'undefined') return;

        const solanaConnection = new Connection(
          clusterApiUrl('devnet'), // Using devnet for development
          'confirmed'
        );
        setConnection(solanaConnection);
      } catch (error) {
        console.error('Failed to initialize Solana connection:', error);
        setError('Failed to initialize Solana connection');
      }
    };

    initConnection();
  }, []);

  // Check for existing wallet connection
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window === 'undefined' || !window.solana?.isPhantom) {
        return;
      }

      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setPublicKey(response.publicKey);
          setWalletAddress(response.publicKey.toString());
          setIsConnected(true);
          await fetchBalance(response.publicKey);
        }
      } catch (error) {
        // No existing connection, this is normal
        console.log('No existing wallet connection found');
      }
    };

    checkExistingConnection();
  }, [fetchBalance]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined') {
      setError('Wallet connection not available in this environment');
      return;
    }

    if (!window.solana?.isPhantom) {
      setError('Phantom wallet not found! Please install Phantom wallet from https://phantom.app');
      return;
    }

    setIsConnecting(true);
    setError(null);

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
      setError(error.message || 'Failed to connect wallet');
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
      setError(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setError('Failed to disconnect wallet');
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
      setError('Failed to sign message');
      throw error;
    }
  }, [publicKey]);

  // Send transaction
  const sendTransaction = useCallback(async (transaction) => {
    if (!publicKey || !window.solana || !connection) {
      throw new Error('Wallet not connected or connection not available');
    }

    try {
      const signature = await window.solana.sendTransaction(transaction, connection);
      return signature;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      setError('Failed to send transaction');
      throw error;
    }
  }, [publicKey, connection]);

  // Format address for display
  const formatAddress = useCallback((address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    walletAddress,
    walletBalance,
    isConnected,
    isConnecting,
    connection,
    publicKey,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    signMessage,
    sendTransaction,
    fetchBalance,
    formatAddress,
    clearError,
  };
};
