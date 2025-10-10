import { useState, useEffect, useCallback } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';

// Helper function to detect available wallets
const getAvailableWallets = () => {
  if (typeof window === 'undefined') return [];
  
  const wallets = [];
  
  // Check for Phantom
  if (window.solana?.isPhantom) {
    wallets.push({ name: 'Phantom', provider: window.solana });
  }
  
  // Check for Solflare
  if (window.solflare?.isSolflare) {
    wallets.push({ name: 'Solflare', provider: window.solflare });
  }
  
  // Check for Backpack
  if (window.backpack?.isBackpack) {
    wallets.push({ name: 'Backpack', provider: window.backpack });
  }
  
  // Check for Sollet
  if (window.sollet) {
    wallets.push({ name: 'Sollet', provider: window.sollet });
  }
  
  // Check for Slope
  if (window.Slope) {
    wallets.push({ name: 'Slope', provider: window.Slope });
  }
  
  // Check for generic Solana wallet (fallback)
  if (window.solana && !wallets.find(w => w.provider === window.solana)) {
    wallets.push({ name: 'Generic Solana Wallet', provider: window.solana });
  }
  
  return wallets;
};

// Helper function to get the best available wallet
const getBestWallet = () => {
  const wallets = getAvailableWallets();
  if (wallets.length === 0) return null;
  
  // Prefer Phantom if available, otherwise use the first available wallet
  const phantom = wallets.find(w => w.name === 'Phantom');
  return phantom || wallets[0];
};

export const useWalletConnection = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connection, setConnection] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState(null);
  const [currentWallet, setCurrentWallet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        if (typeof window === 'undefined') {
          console.log('❌ Not in browser environment');
          return;
        }

        console.log('🌐 Browser environment detected');
        console.log('💰 window.solana available:', !!window.solana);
        console.log('💰 Detected wallets:', getAvailableWallets());

        const solanaConnection = new Connection(
          clusterApiUrl('devnet'), // Using devnet for development
          'confirmed'
        );
        setConnection(solanaConnection);
        console.log('✅ Solana connection initialized');
      } catch (error) {
        console.error('❌ Failed to initialize Solana connection:', error);
        setError('Failed to initialize Solana connection');
      }
    };

    initConnection();
  }, []);

  // Check for existing wallet connection
  useEffect(() => {
    const checkExistingConnection = async () => {
      console.log('🔍 Checking for existing wallet connection...');
      console.log('🌐 window available:', typeof window !== 'undefined');
      
      const availableWallets = getAvailableWallets();
      console.log('💰 Available wallets:', availableWallets.map(w => w.name));
      
      if (availableWallets.length === 0) {
        console.log('❌ No Solana wallets detected, skipping auto-connection');
        return;
      }

      // Check if user explicitly disconnected (don't auto-reconnect)
      const wasExplicitlyDisconnected = localStorage.getItem('wallet_explicitly_disconnected');
      console.log('🚫 Explicitly disconnected flag:', wasExplicitlyDisconnected);
      if (wasExplicitlyDisconnected === 'true') {
        console.log('⏭️ Wallet was explicitly disconnected, skipping auto-reconnection');
        return;
      }

      // Try to auto-connect with the best available wallet
      const bestWallet = getBestWallet();
      if (!bestWallet) {
        console.log('❌ No suitable wallet found for auto-connection');
        return;
      }

      setCurrentWallet(bestWallet);
      console.log('🎯 Using wallet:', bestWallet.name);

      try {
        console.log('🔄 Attempting auto-connection with onlyIfTrusted...');
        const response = await bestWallet.provider.connect({ onlyIfTrusted: true });
        console.log('✅ Auto-connection response:', response);
        if (response.publicKey) {
          console.log('🔑 Auto-connected with public key:', response.publicKey.toString());
          setPublicKey(response.publicKey);
          setWalletAddress(response.publicKey.toString());
          setIsConnected(true);
          await fetchBalance(response.publicKey);
        }
      } catch (error) {
        // No existing connection, this is normal
        console.log('ℹ️ No existing wallet connection found (this is normal)');
        console.log('ℹ️ Auto-connection error:', error.message);
      }
    };

    checkExistingConnection();
  }, [fetchBalance]);

  // Open wallet selection modal
  const openWalletModal = useCallback(() => {
    console.log('🔗 Opening wallet selection modal...');
    
    if (typeof window === 'undefined') {
      const errorMsg = 'Wallet connection not available in this environment';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    const availableWallets = getAvailableWallets();
    console.log('💰 Available wallets:', availableWallets.map(w => w.name));
    
    if (availableWallets.length === 0) {
      const errorMsg = 'No Solana wallets detected! Please install a Solana wallet like Phantom, Solflare, or Backpack.';
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    setError(null);
    setIsModalOpen(true);
  }, []);

  // Close wallet selection modal
  const closeWalletModal = useCallback(() => {
    setIsModalOpen(false);
    setError(null);
  }, []);

  // Connect to specific wallet
  const connectToWallet = useCallback(async (wallet) => {
    console.log('🔗 Connecting to wallet:', wallet.name);
    
    setCurrentWallet(wallet);
    setIsConnecting(true);
    setError(null);
    setIsModalOpen(false);

    try {
      console.log('📞 Calling wallet.connect()...');
      const response = await wallet.provider.connect();
      console.log('✅ Wallet connection response:', response);
      
      const pubKey = response.publicKey;
      console.log('🔑 Public key received:', pubKey.toString());
      
      setPublicKey(pubKey);
      setWalletAddress(pubKey.toString());
      setIsConnected(true);
      
      // Clear the explicit disconnect flag since user is connecting
      localStorage.removeItem('wallet_explicitly_disconnected');
      console.log('🧹 Cleared explicit disconnect flag');
      
      await fetchBalance(pubKey);
      console.log('💰 Balance fetched successfully');
      
      return {
        publicKey: pubKey,
        address: pubKey.toString(),
        balance: walletBalance,
        walletName: wallet.name
      };
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to connect wallet';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        if (error.code === 4001) {
          errorMessage = 'User rejected the connection request';
        } else {
          errorMessage = `Connection failed with code: ${error.code}`;
        }
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setIsConnecting(false);
      console.log('🏁 Wallet connection process completed');
    }
  }, [fetchBalance, walletBalance]);

  // Legacy connect wallet function (for backward compatibility)
  const connectWallet = useCallback(async () => {
    // Check if there's only one wallet available, connect directly
    const availableWallets = getAvailableWallets();
    if (availableWallets.length === 1) {
      return await connectToWallet(availableWallets[0]);
    }
    
    // Otherwise, show the modal
    openWalletModal();
  }, [connectToWallet, openWalletModal]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      // Try to disconnect from the current wallet if it has a disconnect method
      if (currentWallet?.provider?.disconnect) {
        console.log('🔌 Disconnecting from wallet:', currentWallet.name);
        await currentWallet.provider.disconnect();
      }
      
      setPublicKey(null);
      setWalletAddress(null);
      setWalletBalance(null);
      setIsConnected(false);
      setError(null);
      setCurrentWallet(null);
      
      // Set flag to prevent auto-reconnection on page refresh
      localStorage.setItem('wallet_explicitly_disconnected', 'true');
      console.log('✅ Wallet disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setError('Failed to disconnect wallet');
      throw error;
    }
  }, [currentWallet]);

  // Sign message
  const signMessage = useCallback(async (message) => {
    if (!publicKey || !currentWallet?.provider) {
      throw new Error('Wallet not connected');
    }

    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await currentWallet.provider.signMessage(encodedMessage, 'utf8');
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      setError('Failed to sign message');
      throw error;
    }
  }, [publicKey, currentWallet]);

  // Send transaction
  const sendTransaction = useCallback(async (transaction) => {
    if (!publicKey || !currentWallet?.provider || !connection) {
      throw new Error('Wallet not connected or connection not available');
    }

    try {
      const signature = await currentWallet.provider.sendTransaction(transaction, connection);
      return signature;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      setError('Failed to send transaction');
      throw error;
    }
  }, [publicKey, currentWallet, connection]);

  // Format address for display
  const formatAddress = useCallback((address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Debug wallet status
  const debugWalletStatus = useCallback(() => {
    console.log('🔍 === WALLET DEBUG STATUS ===');
    console.log('🌐 Window available:', typeof window !== 'undefined');
    
    const availableWallets = getAvailableWallets();
    console.log('💰 Available wallets:', availableWallets.map(w => w.name));
    console.log('🎯 Current wallet:', currentWallet?.name || 'None');
    
    // Show details for each available wallet
    availableWallets.forEach(wallet => {
      console.log(`📱 ${wallet.name}:`, {
        isConnected: wallet.provider.isConnected,
        publicKey: wallet.provider.publicKey?.toString(),
        hasConnect: typeof wallet.provider.connect === 'function',
        hasDisconnect: typeof wallet.provider.disconnect === 'function',
        hasSignMessage: typeof wallet.provider.signMessage === 'function',
        hasSendTransaction: typeof wallet.provider.sendTransaction === 'function'
      });
    });
    
    console.log('🔗 Local isConnected state:', isConnected);
    console.log('🔑 Local walletAddress:', walletAddress);
    console.log('💰 Local walletBalance:', walletBalance);
    console.log('🚫 Explicitly disconnected flag:', localStorage.getItem('wallet_explicitly_disconnected'));
    console.log('🔍 === END WALLET DEBUG ===');
  }, [isConnected, walletAddress, walletBalance, currentWallet]);

  return {
    // State
    walletAddress,
    walletBalance,
    isConnected,
    isConnecting,
    connection,
    publicKey,
    error,
    currentWallet,
    availableWallets: getAvailableWallets(),
    isModalOpen,
    
    // Actions
    connectWallet,
    connectToWallet,
    disconnectWallet,
    signMessage,
    sendTransaction,
    fetchBalance,
    formatAddress,
    clearError,
    debugWalletStatus,
    openWalletModal,
    closeWalletModal,
  };
};
