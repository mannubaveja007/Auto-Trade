import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProcurementRequests, deleteProcurementRequest } from '../../services/api';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate, formatCurrency, getUrgencyColor } from '../../lib/utils';
import {
  RefreshCw,
  Package,
  Calendar,
  DollarSign,
  Building2,
  Filter,
  Search,
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export function ProcurementList({ onRequestSelected }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await getProcurementRequests();
      if (error) {
        throw new Error(error.message);
      }
      setRequests(data || []);
    } catch (err) {
      toast.error('Failed to load procurement requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId, e) => {
    e.stopPropagation(); // Prevent card click

    if (!window.confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await deleteProcurementRequest(requestId);
      if (error) {
        throw new Error(error.message);
      }
      setRequests(requests.filter(request => request.id !== requestId));
      toast.success('Request deleted successfully');
    } catch (err) {
      toast.error('Failed to delete request');
    }
  };

  const filteredAndSortedRequests = requests
    .filter(request => {
      const matchesSearch = request.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.buyer?.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'urgent':
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        case 'budget':
          return (b.maxBudget || 0) - (a.maxBudget || 0);
        default:
          return 0;
      }
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'negotiating': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

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
        <Package className="w-8 h-8 text-gray-400" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No procurement requests yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Get started by creating your first procurement request. Our AI will help you find the best vendors and negotiate prices automatically.
      </p>
      <Button className="flex items-center space-x-2">
        <Package className="w-4 h-4" />
        <span>Create First Request</span>
      </Button>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="negotiating">Negotiating</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="urgent">Most Urgent</option>
            <option value="budget">Highest Budget</option>
          </select>
        </div>

        <Button
          variant="outline"
          onClick={loadRequests}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Requests', value: requests.length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Open', value: requests.filter(r => r.status === 'open').length, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Negotiating', value: requests.filter(r => r.status === 'negotiating').length, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Completed', value: requests.filter(r => r.status === 'completed').length, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`${stat.bg} rounded-lg p-4`}
          >
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Requests List */}
      {filteredAndSortedRequests.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div className="space-y-4">
          <AnimatePresence>
            {filteredAndSortedRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <Card hover className="cursor-pointer" onClick={() => onRequestSelected?.(request)}>
                  <CardBody>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {request.productName}
                          </h3>
                          <Badge variant={request.status} animate>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(request.status)}
                              <span>{request.status}</span>
                            </span>
                          </Badge>
                          <div className={`text-sm font-medium ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency.toUpperCase()} PRIORITY
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Building2 className="w-4 h-4" />
                            <span>{request.buyer?.companyName}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Package className="w-4 h-4" />
                            <span>{request.quantity} {request.unit}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(request.deliveryDate)}</span>
                          </div>

                          {request.maxBudget && (
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                              <DollarSign className="w-4 h-4" />
                              <span>Max {formatCurrency(request.maxBudget)}</span>
                            </div>
                          )}
                        </div>

                        {request.quotes && request.quotes.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-3 flex items-center space-x-2"
                          >
                            <div className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                              {request.quotes.length} quote{request.quotes.length !== 1 ? 's' : ''} received
                            </div>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-green-500 rounded-full"
                            />
                          </motion.div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View Details</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          onClick={(e) => handleDeleteRequest(request.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default ProcurementList;