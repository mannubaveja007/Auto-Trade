import React from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Building2,
  Package,
  MessageSquare,
  BarChart3,
  Settings,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button';

const navigation = [
  { name: 'Procurement', icon: ShoppingCart, id: 'procurement', description: 'Create and manage requests' },
  { name: 'Vendors', icon: Building2, id: 'vendors', description: 'Browse vendor network' },
  { name: 'Orders', icon: Package, id: 'orders', description: 'Track finalized orders' },
  { name: 'Negotiations', icon: MessageSquare, id: 'negotiations', description: 'Active conversations' },
  { name: 'Analytics', icon: BarChart3, id: 'analytics', description: 'Performance insights' },
];

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const { isDark, toggleTheme } = useTheme();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  const itemVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    },
    closed: { x: -20, opacity: 0 }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 lg:relative lg:translate-x-0"
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AutoTrade</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Procurement</p>
              </div>
            </motion.div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <motion.div
              initial="closed"
              animate="open"
              variants={{
                open: {
                  transition: { staggerChildren: 0.07, delayChildren: 0.2 }
                },
                closed: {
                  transition: { staggerChildren: 0.05, staggerDirection: -1 }
                }
              }}
            >
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <motion.div key={item.id} variants={itemVariants}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-soft'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 transition-colors ${
                        isActive
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <motion.div
                          className="w-2 h-2 bg-primary-500 rounded-full"
                          layoutId="activeIndicator"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
            <Button
              variant="ghost"
              onClick={toggleTheme}
              className="w-full justify-start text-gray-700 dark:text-gray-300"
            >
              {isDark ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 dark:text-gray-300"
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </Button>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">MC</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">McDonald's Corp</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium Account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default Sidebar;