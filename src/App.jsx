import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Web3 Imports
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { polygonAmoy, sepolia } from 'viem/chains';
import {
  createTransferMessage,
  createECDSAMessageSigner,
  createAuthRequestMessage,
  RPCMethod,
  TransferResponse
} from '@erc7824/nitrolite';

// Chain configuration - can switch between polygonAmoy and sepolia
const SUPPORTED_CHAINS = {
  polygonAmoy: {
    chain: polygonAmoy,
    name: 'Polygon Amoy Testnet',
    nativeToken: 'POL',
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorer: 'https://amoy.polygonscan.com'
  },
  sepolia: {
    chain: sepolia,
    name: 'Ethereum Sepolia Testnet',
    nativeToken: 'ETH',
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorer: 'https://sepolia.etherscan.io'
  }
};

// Helper function to get current chain config
const getCurrentChainConfig = (chainKey) => SUPPORTED_CHAINS[chainKey] || SUPPORTED_CHAINS.polygonAmoy;
import { webSocketService } from './lib/websocket';
import { useTransfer } from './hooks/useTransfer';
import { getJWT, storeJWT, removeJWT, getSessionKey, storeSessionKey, removeSessionKey } from './lib/utils';
import { users } from './data/users';

// Enhanced Components
import ProcurementRequestForm from './components/enhanced/ProcurementRequestForm';
import ProcurementList from './components/enhanced/ProcurementList';
import QuotesView from './components/enhanced/QuotesView';
import OrdersView from './components/enhanced/OrdersView';
import VendorsView from './components/enhanced/VendorsView';
import NegotiationsView from './components/enhanced/NegotiationsView';
import AnalyticsView from './components/enhanced/AnalyticsView';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

function App() {
  const [activeTab, setActiveTab] = useState('procurement');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Web3 Hooks
  const { address, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  // App State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionKey, setSessionKey] = useState(null);
  const [balance, setBalance] = useState('0');

  // Transfer state
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null);

  // Use transfer hook
  const { handleTransfer: transferFn } = useTransfer(sessionKey, isAuthenticated);

  const handleRequestCreated = (request) => {
    setShowCreateForm(false);
    setSelectedRequest(request);
    // Auto-switch to negotiations tab to see the AI agents working
    setTimeout(() => {
      setActiveTab('negotiations');
    }, 1000);
  };

  const handleRequestSelected = (request) => {
    setSelectedRequest(request);
    setActiveTab('negotiations');
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
  };

  // Get current chain info
  const getCurrentChainInfo = () => {
    if (chainId === polygonAmoy.id) {
      return { name: 'Polygon Amoy Testnet', nativeToken: 'POL' };
    } else if (chainId === sepolia.id) {
      return { name: 'Ethereum Sepolia Testnet', nativeToken: 'ETH' };
    }
    return { name: 'Unknown Network', nativeToken: 'ETH' };
  };

  const authenticate = async () => {
    try {
      if (!isConnected || !address) {
        alert('Please connect your wallet first');
        return;
      }

      console.log('Starting authentication flow...');

      console.log('🔐 Requesting MetaMask signature...');
      const message = `Sign in to Procurement dApp\nAddress: ${address}\nTimestamp: ${Date.now()}`;

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      console.log('✅ MetaMask signature obtained:', signature);

      // Create a proper session key with private key for transfers
      const sessionSigner = createECDSAMessageSigner();
      const sessionKey = {
        address: sessionSigner.address,
        privateKey: sessionSigner.privateKey,
        userAddress: address,
        signature: signature,
        message: message
      };

      storeSessionKey(sessionKey);
      setSessionKey(sessionKey);
      setIsAuthenticated(true);
      setBalance('1000.00'); // Set a demo balance

      console.log('Authentication successful!');
    } catch (error) {
      console.error('Authentication failed:', error);
      alert(`Authentication failed: ${error.message}`);
    }
  };

  const handleChainSwitch = (chainName) => {
    if (chainName === 'polygonAmoy') {
      switchChain({ chainId: polygonAmoy.id });
    } else if (chainName === 'sepolia') {
      switchChain({ chainId: sepolia.id });
    }
  };

  // Handle support function for PostList
  const handleSupport = async (recipient, amount) => {
    setIsTransferring(true);
    setTransferStatus('Sending support...');

    const result = await transferFn(recipient, amount);

    if (result.success) {
        setTransferStatus('Support sent!');
    } else {
        setIsTransferring(false);
        setTransferStatus(null);
        if (result.error) {
            alert(result.error);
        }
    }
  };

  // WebSocket message handler
  useEffect(() => {
    const handleMessage = (response) => {
      console.log('Received WebSocket message:', response);

      const method = response.method;

      // Handle authentication responses
      if (method === RPCMethod.Auth || method === 'auth') {
        console.log('Authentication successful:', response.params);
        // Authentication is handled directly in authenticate function
      }

      // Handle session responses
      if (method === RPCMethod.Session || method === 'session') {
        console.log('Session established:', response.params);
        setIsAuthenticated(true);
      }

      // Handle balance updates
      if (method === RPCMethod.Balance || method === 'balance') {
        console.log('Balance update:', response.params);
        if (response.params.balances?.usdc) {
          setBalance(response.params.balances.usdc);
        }
      }

      // Handle transfer responses
      if (response.method === RPCMethod.Transfer) {
        const transferResponse = response;
        console.log('Transfer completed:', transferResponse.params);

        setIsTransferring(false);
        setTransferStatus(null);

        alert('Transfer completed successfully!');
      }

      // Handle error responses
      if (response.method === RPCMethod.Error) {
        console.error('RPC Error:', response.params);

        if (isTransferring) {
          setIsTransferring(false);
          setTransferStatus(null);
          alert(`Transfer failed: ${response.params.error}`);
        } else {
          // Other errors (like auth failures)
          removeJWT();
          removeSessionKey();
          alert(`Error: ${response.params.error}`);
          setIsAuthAttempted(false);
        }
      }
    };

    webSocketService.addMessageHandler(handleMessage);

    return () => {
      webSocketService.removeMessageHandler(handleMessage);
    };
  }, [isTransferring]);

  // Reset authentication when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setIsAuthenticated(false);
      setSessionKey(null);
      setBalance('0');
      removeJWT();
      removeSessionKey();
    }
  }, [isConnected]);

  const renderContent = () => {
    if (showCreateForm) {
      return (
        <motion.div
          key="create-form"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <ProcurementRequestForm
            onRequestCreated={handleRequestCreated}
            onClose={() => setShowCreateForm(false)}
          />
        </motion.div>
      );
    }

    switch (activeTab) {
      case 'procurement':
        return (
          <motion.div
            key="procurement"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <ProcurementList onRequestSelected={handleRequestSelected} />
          </motion.div>
        );

      case 'vendors':
        return (
          <motion.div
            key="vendors"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <VendorsView />
          </motion.div>
        );

      case 'orders':
        return (
          <motion.div
            key="orders"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <OrdersView />
          </motion.div>
        );

      case 'negotiations':
        return (
          <motion.div
            key="negotiations"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {selectedRequest ? (
              <QuotesView
                requestId={selectedRequest.id}
                request={selectedRequest}
                onPayment={handleSupport}
                isAuthenticated={isAuthenticated}
                isTransferring={isTransferring}
              />
            ) : (
              <NegotiationsView />
            )}
          </motion.div>
        );

      case 'analytics':
        return (
          <motion.div
            key="analytics"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <AnalyticsView />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Header */}
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            activeTab={activeTab}
            onCreateNew={handleCreateNew}
            account={address}
            isAuthenticated={isAuthenticated}
            balance={balance}
            onAuthenticate={authenticate}
            chainInfo={getCurrentChainInfo()}
            onSwitchChain={handleChainSwitch}
            currentChain={chainId === polygonAmoy.id ? 'polygonAmoy' : 'sepolia'}
          />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Transfer Status */}
            {transferStatus && (
              <div className="transfer-status mb-4 p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-lg text-center font-medium">
                {transferStatus}
              </div>
            )}

            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                {renderContent()}
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Toast Notifications */}
        <ToastProvider />
      </div>
    </ThemeProvider>
  );
}

export default App;