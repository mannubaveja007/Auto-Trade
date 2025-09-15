import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVendors } from '../../services/api';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import {
  Building2,
  Star,
  MapPin,
  Mail,
  Phone,
  Award,
  DollarSign,
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

export function VendorsView() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await getVendors();
      setVendors(data);
    } catch (err) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(vendors.flatMap(vendor => vendor.categories))];

  const filteredAndSortedVendors = vendors
    .filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || vendor.categories.includes(categoryFilter);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'minOrder':
          return a.minOrderValue - b.minOrderValue;
        default:
          return 0;
      }
    });

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  const VendorCard = ({ vendor, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card hover className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                {vendor.name.charAt(0)}
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <span>{vendor.name}</span>
                  {vendor.verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Award className="w-5 h-5 text-blue-500" />
                    </motion.div>
                  )}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    {getRatingStars(Math.floor(vendor.rating))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {vendor.rating}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div className="space-y-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {vendor.categories.slice(0, 3).map((category, idx) => (
                <motion.span
                  key={category}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium"
                >
                  {category}
                </motion.span>
              ))}
              {vendor.categories.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                  +{vendor.categories.length - 3} more
                </span>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              {vendor.email && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{vendor.email}</span>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{vendor.phone}</span>
                </div>
              )}
              {vendor.address && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{vendor.address}</span>
                </div>
              )}
            </div>

            {/* Business Info */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Min Order</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${vendor.minOrderValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Payment</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {vendor.paymentTerms}
                </p>
              </div>
            </div>

            {/* Stats */}
            {vendor.quotes && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {vendor.quotes.length} active quote{vendor.quotes.length !== 1 ? 's' : ''}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {vendor.orders?.length || 0} completed order{(vendor.orders?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className="flex space-x-2 mt-6">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </Button>
            <Button variant="primary" size="sm" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 col-span-full"
    >
      <motion.div
        className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Building2 className="w-8 h-8 text-gray-400" />
      </motion.div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No vendors found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Try adjusting your search terms or filters to find vendors that match your criteria.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
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
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
            <option value="minOrder">Lowest Min Order</option>
          </select>
        </div>

        <Button
          variant="outline"
          onClick={loadVendors}
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
            label: 'Total Vendors',
            value: vendors.length,
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            icon: Building2
          },
          {
            label: 'Verified',
            value: vendors.filter(v => v.verified).length,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-900/20',
            icon: Award
          },
          {
            label: 'Categories',
            value: categories.length,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            icon: Package
          },
          {
            label: 'Avg Rating',
            value: vendors.length ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1) : '0',
            color: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            icon: Star
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

      {/* Vendors Grid */}
      {filteredAndSortedVendors.length === 0 ? (
        <div className="grid grid-cols-1">
          <EmptyState />
        </div>
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAndSortedVendors.map((vendor, index) => (
              <VendorCard key={vendor.id} vendor={vendor} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default VendorsView;