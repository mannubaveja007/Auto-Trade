import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProcurementRequests } from '../../services/api';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  TrendingDown,
  Zap,
  Building2,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

export function NegotiationsView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveNegotiations();
  }, []);

  const loadActiveNegotiations = async () => {
    try {
      setLoading(true);
      const data = await getProcurementRequests();
      // Filter to only show requests with active quotes/negotiations
      const activeRequests = data.filter(request =>
        request.quotes && request.quotes.length > 0
      );
      setRequests(activeRequests);
    } catch (err) {
      toast.error('Failed to load negotiations');
    } finally {
      setLoading(false);
    }
  };

  const totalQuotes = requests.reduce((sum, req) => sum + (req.quotes?.length || 0), 0);
  const totalNegotiations = requests.reduce((sum, req) =>
    sum + (req.quotes?.reduce((qSum, quote) => qSum + (quote.negotiations?.length || 0), 0) || 0), 0
  );
  const acceptedQuotes = requests.reduce((sum, req) =>
    sum + (req.quotes?.filter(q => q.status === 'accepted').length || 0), 0
  );

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <motion.div
        className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MessageSquare className="w-8 h-8 text-gray-400" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No active negotiations
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Create procurement requests to start receiving quotes and begin negotiations with vendors.
      </p>
    </motion.div>
  );

  const NegotiationCard = ({ request, index }) => {
    const activeQuotes = request.quotes?.filter(q => q.status === 'pending' || q.status === 'countered') || [];
    const bestQuote = request.quotes?.reduce((best, current) =>
      current.totalPrice < best.totalPrice ? current : best,
      request.quotes[0]
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        layout
      >
        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {request.productName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {request.productName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {request.quantity} {request.unit} • {request.buyer?.companyName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Best Offer</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {bestQuote ? formatCurrency(bestQuote.totalPrice) : 'N/A'}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardBody>
            <div className="space-y-4">
              {/* Quote Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {request.quotes?.length || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Quotes</p>
                </div>

                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {activeQuotes.length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
                </div>

                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {request.quotes?.filter(q => q.status === 'accepted').length || 0}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Accepted</p>
                </div>
              </div>

              {/* Top Vendors */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Active Quotes</h4>
                {activeQuotes.slice(0, 3).map((quote) => (
                  <motion.div
                    key={quote.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {quote.vendor?.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(quote.totalPrice)}
                      </span>
                      {quote.negotiations && quote.negotiations.length > 0 && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-2 h-2 bg-green-500 rounded-full"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}

                {activeQuotes.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                    No active negotiations
                  </p>
                )}
              </div>

              {/* Recent Activity */}
              {request.quotes?.some(q => q.negotiations?.length > 0) && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Recent Activity</h4>
                  <div className="space-y-1">
                    {request.quotes
                      ?.flatMap(quote => quote.negotiations?.map(neg => ({ ...neg, vendor: quote.vendor })) || [])
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .slice(0, 2)
                      .map((activity, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <Zap className="w-3 h-3" />
                          <span>
                            {activity.sender === 'buyer' ? 'You' : activity.vendor?.name || 'Vendor'} sent a message
                          </span>
                          <span>•</span>
                          <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Active Requests',
            value: requests.length,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: Package
          },
          {
            label: 'Total Quotes',
            value: totalQuotes,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            icon: MessageSquare
          },
          {
            label: 'Messages Exchanged',
            value: totalNegotiations,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            icon: Zap
          },
          {
            label: 'Deals Closed',
            value: acceptedQuotes,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            icon: CheckCircle2
          }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
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

      {/* Active Negotiations */}
      {requests.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Active Negotiations
          </h2>
          {requests.map((request, index) => (
            <NegotiationCard key={request.id} request={request} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default NegotiationsView;