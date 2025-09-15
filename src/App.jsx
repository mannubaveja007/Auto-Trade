import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

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
          />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">
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