import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, Plus, Sun, Moon } from 'lucide-react';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

export function Header({ onMenuClick, activeTab, onCreateNew }) {
  const getHeaderTitle = (tab) => {
    const titles = {
      procurement: 'Procurement Requests',
      vendors: 'Vendor Network',
      orders: 'Order Management',
      negotiations: 'Active Negotiations',
      analytics: 'Analytics & Insights',
    };
    return titles[tab] || 'Dashboard';
  };

  const getHeaderDescription = (tab) => {
    const descriptions = {
      procurement: 'Manage your procurement requests and let AI find the best vendors',
      vendors: 'Browse and connect with verified suppliers in our network',
      orders: 'Track your finalized orders and delivery status',
      negotiations: 'Monitor ongoing price negotiations and communications',
      analytics: 'View performance metrics and cost savings analytics',
    };
    return descriptions[tab] || 'Welcome to AutoTrade AI Procurement Platform';
  };

  return (
    <motion.header
      className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div>
            <motion.h1
              className="text-2xl font-bold text-gray-900 dark:text-white"
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getHeaderTitle(activeTab)}
            </motion.h1>
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400 mt-1"
              key={`${activeTab}-desc`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {getHeaderDescription(activeTab)}
            </motion.p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Create New Button */}
          {activeTab === 'procurement' && (
            <Button
              onClick={onCreateNew}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Request</span>
            </Button>
          )}

          {/* Notifications */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
              />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;