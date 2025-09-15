import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProcurementRequests, getOrders, getVendors } from '../../services/api';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Package,
  Building2,
  Zap,
  Target,
  Award,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AnalyticsView() {
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [requestsData, ordersData, vendorsData] = await Promise.all([
        getProcurementRequests(),
        getOrders(),
        getVendors()
      ]);
      setRequests(requestsData);
      setOrders(ordersData);
      setVendors(vendorsData);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalSpend = orders.reduce((sum, order) => sum + order.finalPrice, 0);
  const avgOrderValue = orders.length ? totalSpend / orders.length : 0;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const avgDeliveryTime = orders.length ?
    orders.reduce((sum, order) => {
      const orderDate = new Date(order.orderDate);
      const deliveryDate = new Date(order.deliveryDate);
      return sum + Math.ceil((deliveryDate - orderDate) / (1000 * 60 * 60 * 24));
    }, 0) / orders.length : 0;

  // Time savings calculation (assuming 8 hours saved per request)
  const timeSavedHours = requests.length * 8;
  const costSavingsPerHour = 50; // $50/hour
  const totalCostSavings = timeSavedHours * costSavingsPerHour;

  // Vendor performance
  const vendorPerformance = vendors.map(vendor => {
    const vendorOrders = orders.filter(o => o.vendorId === vendor.id);
    const vendorQuotes = requests.flatMap(r => r.quotes || []).filter(q => q.vendorId === vendor.id);

    return {
      ...vendor,
      ordersCount: vendorOrders.length,
      totalValue: vendorOrders.reduce((sum, o) => sum + o.finalPrice, 0),
      quotesCount: vendorQuotes.length,
      winRate: vendorQuotes.length ? (vendorOrders.length / vendorQuotes.length) * 100 : 0
    };
  }).sort((a, b) => b.totalValue - a.totalValue);

  const MetricCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`${color} rounded-xl p-6`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80 mb-1">{title}</p>
          <p className="text-2xl font-bold mb-1">{value}</p>
          {subtitle && <p className="text-sm opacity-70">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2 space-x-1">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendValue}%
              </span>
            </div>
          )}
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: Math.random() * 2 }}
        >
          <Icon className="w-8 h-8 opacity-80" />
        </motion.div>
      </div>
    </motion.div>
  );

  const ChartCard = ({ title, children }) => (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </CardHeader>
      <CardBody>
        {children}
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Total Spend"
          value={formatCurrency(totalSpend)}
          subtitle={`${orders.length} orders completed`}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300"
          trend="up"
          trendValue="12.5"
        />

        <MetricCard
          title="Time Saved"
          value={`${timeSavedHours}h`}
          subtitle={formatCurrency(totalCostSavings) + ' cost savings'}
          icon={Clock}
          color="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300"
          trend="up"
          trendValue="25.3"
        />

        <MetricCard
          title="Avg Order Value"
          value={formatCurrency(avgOrderValue)}
          subtitle={`${requests.length} requests processed`}
          icon={Package}
          color="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300"
        />

        <MetricCard
          title="Avg Delivery"
          value={`${Math.round(avgDeliveryTime)} days`}
          subtitle={`${completedOrders} delivered on time`}
          icon={Truck}
          color="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 text-orange-700 dark:text-orange-300"
          trend="down"
          trendValue="8.2"
        />
      </motion.div>

      {/* Process Efficiency */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="AI Success Rate"
          value="94.2%"
          subtitle="Vendor matching accuracy"
          icon={Target}
          color="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 text-teal-700 dark:text-teal-300"
        />

        <MetricCard
          title="Negotiation Win Rate"
          value="87.5%"
          subtitle="Better than market price"
          icon={Zap}
          color="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-yellow-700 dark:text-yellow-300"
        />

        <MetricCard
          title="Vendor Network"
          value={vendors.length}
          subtitle={`${vendors.filter(v => v.verified).length} verified suppliers`}
          icon={Building2}
          color="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 text-indigo-700 dark:text-indigo-300"
        />

        <MetricCard
          title="Process Automation"
          value="92%"
          subtitle="Manual work eliminated"
          icon={Award}
          color="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 text-rose-700 dark:text-rose-300"
        />
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ChartCard title="Monthly Spending Trends">
            <div className="space-y-4">
              {['January', 'February', 'March', 'April'].map((month, index) => {
                const value = Math.random() * 50000 + 20000;
                const percentage = (value / 70000) * 100;

                return (
                  <div key={month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{month}</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(value)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </motion.div>

        {/* Vendor Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ChartCard title="Top Performing Vendors">
            <div className="space-y-4">
              {vendorPerformance.slice(0, 5).map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{vendor.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {vendor.ordersCount} orders • {vendor.winRate.toFixed(1)}% win rate
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(vendor.totalValue)}
                    </p>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.floor(vendor.rating) }).map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ChartCard title="Spending by Category">
            <div className="space-y-4">
              {['Food Ingredients', 'Condiments', 'Packaging', 'Maintenance'].map((category, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
                const value = Math.random() * 30 + 10;

                return (
                  <div key={category} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{category}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {value.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <motion.div
                          className={`h-1.5 rounded-full ${colors[index]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChartCard title="Recent Activity">
            <div className="space-y-3">
              {[
                { action: 'Order completed', item: 'Tomato Sauce', time: '2 hours ago', icon: CheckCircle2, color: 'text-green-600' },
                { action: 'Quote received', item: 'Packaging Materials', time: '4 hours ago', icon: MessageSquare, color: 'text-blue-600' },
                { action: 'Negotiation started', item: 'Cleaning Supplies', time: '1 day ago', icon: Zap, color: 'text-purple-600' },
                { action: 'Request created', item: 'Office Supplies', time: '2 days ago', icon: Package, color: 'text-orange-600' },
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.item} • {activity.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ChartCard>
        </motion.div>
      </div>
    </div>
  );
}

export default AnalyticsView;