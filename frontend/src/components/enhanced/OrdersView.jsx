import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders } from '../../services/api';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate, formatCurrency } from '../../lib/utils';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';

export function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = order.request?.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.orderDate) - new Date(a.orderDate);
        case 'oldest':
          return new Date(a.orderDate) - new Date(b.orderDate);
        case 'value':
          return b.finalPrice - a.finalPrice;
        case 'delivery':
          return new Date(a.deliveryDate) - new Date(b.deliveryDate);
        default:
          return 0;
      }
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <Clock className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const OrderCard = ({ order, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card hover className="cursor-pointer">
        <CardBody>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {order.request?.productName?.charAt(0) || 'O'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.request?.productName}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={order.status} animate>
                      <span className="flex items-center space-x-1">
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </span>
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Order #{order.id.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Vendor</p>
                    <p>{order.vendor?.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Total Price</p>
                    <p className="text-green-600 dark:text-green-400 font-semibold">
                      {formatCurrency(order.finalPrice)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Delivery Date</p>
                    <p>{formatDate(order.deliveryDate)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Truck className="w-4 h-4" />
                  <div>
                    <p className="font-medium">Payment Terms</p>
                    <p>{order.paymentTerms}</p>
                  </div>
                </div>
              </div>

              {order.trackingInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500"
                >
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Tracking:</strong> {JSON.stringify(order.trackingInfo)}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
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
        <Package className="w-8 h-8 text-gray-400" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No orders yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Your finalized orders will appear here. Start by creating procurement requests and accepting vendor quotes.
      </p>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
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
              placeholder="Search orders..."
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
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="value">Highest Value</option>
            <option value="delivery">Earliest Delivery</option>
          </select>
        </div>

        <Button
          variant="outline"
          onClick={loadOrders}
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
          {
            label: 'Total Orders',
            value: orders.length,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: Package
          },
          {
            label: 'Total Value',
            value: formatCurrency(orders.reduce((sum, order) => sum + order.finalPrice, 0)),
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            icon: DollarSign
          },
          {
            label: 'In Transit',
            value: orders.filter(o => o.status === 'shipped').length,
            color: 'text-orange-600 dark:text-orange-400',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            icon: Truck
          },
          {
            label: 'Completed',
            value: orders.filter(o => o.status === 'completed').length,
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

      {/* Orders List */}
      {filteredAndSortedOrders.length === 0 ? (
        <EmptyState />
      ) : (
        <motion.div className="space-y-4">
          <AnimatePresence>
            {filteredAndSortedOrders.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default OrdersView;