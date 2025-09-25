import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuotes } from '../../services/api';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import QuoteCard from './QuoteCard';
import NegotiationChat from './NegotiationChat';
import { formatCurrency } from '../../lib/utils';
import {
  MessageSquare,
  TrendingDown,
  Filter,
  SortDesc,
  RefreshCw,
  Zap,
  CheckCircle2,
  ArrowUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export function QuotesView({ requestId, request, onPayment, isAuthenticated, isTransferring }) {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price');
  const [showFinalized, setShowFinalized] = useState(false);

  useEffect(() => {
    if (requestId) {
      loadQuotes();
    }
  }, [requestId]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await getQuotes({ requestId });
      setQuotes(data);
      if (data.length > 0 && !selectedQuote) {
        setSelectedQuote(data[0]);
      }
    } catch (err) {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteUpdate = () => {
    loadQuotes();
  };

  const handleOrderCreated = (quote) => {
    // Show success animation and move to finalized section
    setShowFinalized(true);
    toast.success('🎉 Deal finalized! Moving to orders...');

    // Animate the transition
    setTimeout(() => {
      loadQuotes(); // Refresh to show updated status
    }, 1000);
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.totalPrice - b.totalPrice;
      case 'delivery':
        return new Date(a.deliveryDate) - new Date(b.deliveryDate);
      case 'rating':
        return b.vendor.rating - a.vendor.rating;
      default:
        return 0;
    }
  });

  const bestPriceQuote = sortedQuotes.reduce((best, current) =>
    current.totalPrice < best.totalPrice ? current : best,
    sortedQuotes[0]
  );

  const openQuotes = sortedQuotes.filter(q => q.status !== 'accepted');
  const finalizedQuotes = sortedQuotes.filter(q => q.status === 'accepted');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quotes for {request?.productName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {quotes.length} quote{quotes.length !== 1 ? 's' : ''} received •{' '}
            Best price: {bestPriceQuote ? formatCurrency(bestPriceQuote.totalPrice) : 'N/A'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="price">Sort by Price</option>
            <option value="delivery">Sort by Delivery</option>
            <option value="rating">Sort by Rating</option>
          </select>

          <Button
            variant="outline"
            onClick={loadQuotes}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Total Quotes',
            value: quotes.length,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: MessageSquare
          },
          {
            label: 'Best Price',
            value: bestPriceQuote ? formatCurrency(bestPriceQuote.totalPrice) : 'N/A',
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            icon: TrendingDown
          },
          {
            label: 'Active Negotiations',
            value: quotes.filter(q => q.negotiations?.length > 0).length,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            icon: Zap
          },
          {
            label: 'Finalized',
            value: finalizedQuotes.length,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            icon: CheckCircle2
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`${stat.bg} rounded-xl p-4`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quotes List */}
        <div className="xl:col-span-2 space-y-4">
          {/* Section Toggle */}
          <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setShowFinalized(false)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !showFinalized
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Open Quotes ({openQuotes.length})
            </button>
            <button
              onClick={() => setShowFinalized(true)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                showFinalized
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Finalized ({finalizedQuotes.length})
            </button>
          </div>

          {/* Quotes Grid */}
          <AnimatePresence mode="wait">
            {!showFinalized ? (
              <motion.div
                key="open"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {openQuotes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800"
                  >
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No open quotes
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All quotes have been finalized or AI agents are still working.
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {openQuotes.map((quote, index) => (
                      <motion.div
                        key={quote.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        layout
                      >
                        <QuoteCard
                          quote={quote}
                          isSelected={selectedQuote?.id === quote.id}
                          onSelect={() => setSelectedQuote(quote)}
                          onOrderCreated={handleOrderCreated}
                          isBestPrice={bestPriceQuote?.id === quote.id}
                          onPayment={onPayment}
                          isAuthenticated={isAuthenticated}
                          isTransferring={isTransferring}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="finalized"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {finalizedQuotes.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800"
                  >
                    <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No finalized orders yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Accepted quotes will appear here as finalized orders.
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {finalizedQuotes.map((quote, index) => (
                      <motion.div
                        key={`finalized-${quote.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl opacity-20"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <QuoteCard
                          quote={quote}
                          isSelected={selectedQuote?.id === quote.id}
                          onSelect={() => setSelectedQuote(quote)}
                          onOrderCreated={handleOrderCreated}
                          onPayment={onPayment}
                          isAuthenticated={isAuthenticated}
                          isTransferring={isTransferring}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Negotiation Chat */}
        <div className="xl:col-span-1">
          <AnimatePresence mode="wait">
            {selectedQuote ? (
              <motion.div
                key={selectedQuote.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <NegotiationChat
                  quote={selectedQuote}
                  onQuoteUpdate={handleQuoteUpdate}
                />
              </motion.div>
            ) : (
              <motion.div
                key="no-selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="h-[600px] flex items-center justify-center">
                  <CardBody>
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Select a quote to negotiate
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Choose a quote from the list to start or continue negotiations.
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default QuotesView;