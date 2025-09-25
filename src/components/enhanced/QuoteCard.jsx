import React, { useState, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder } from '../../services/api';
import { Card, CardHeader, CardBody, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate, formatCurrency } from '../../lib/utils';
import { users } from '../../data/users';
import {
  Star,
  Calendar,
  DollarSign,
  Truck,
  Award,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingDown,
  TrendingUp,
  Crown,
  CreditCard,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuoteCard = memo(function QuoteCard({ quote, isSelected, onSelect, onOrderCreated, isBestPrice = false, onPayment, isAuthenticated, isTransferring }) {
  const [accepting, setAccepting] = useState(false);
  const [paymentMode, setPaymentMode] = useState('traditional'); // 'traditional' or 'crypto'

  const orderData = useMemo(() => ({
    requestId: quote.requestId,
    quoteId: quote.id,
    buyerId: quote.request.buyerId,
    vendorId: quote.vendorId,
    finalPrice: quote.totalPrice,
    deliveryDate: quote.deliveryDate,
    paymentTerms: quote.paymentTerms
  }), [quote]);

  const vendorUser = useMemo(() => {
    return users.find(user => user.id === quote.vendorId);
  }, [quote.vendorId]);

  const handleCryptoPayment = useCallback(async () => {
    if (!onPayment || !vendorUser) {
      toast.error('Payment not available');
      return;
    }

    try {
      // Convert price to USDC (simplified - normally you'd use proper conversion rates)
      const usdcAmount = (quote.totalPrice / 1000).toFixed(2); // Assuming 1 USDC = $1000 for demo
      await onPayment(vendorUser.walletAddress, usdcAmount);

      // Also create the order in the system
      handleAcceptQuote();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  }, [onPayment, vendorUser, quote.totalPrice]);

  const handleAcceptQuote = useCallback(async () => {
    setAccepting(true);
    try {
      const result = await createOrder(orderData);

      if (result.error) {
        toast.error(result.error.message || 'Failed to place order');
        return;
      }

      toast.success('Order placed successfully! 🎉');

      if (onOrderCreated) {
        onOrderCreated(quote);
      }
    } catch (err) {
      toast.error(err.userMessage || 'Failed to place order');
    } finally {
      setAccepting(false);
    }
  }, [orderData, quote, onOrderCreated]);

  const handleSelect = useCallback(() => {
    if (onSelect) {
      onSelect(quote);
    }
  }, [quote, onSelect]);

  const getStatusIcon = () => {
    switch (quote.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'countered':
        return <Zap className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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

  const cardVariants = {
    unselected: {
      scale: 1,
      boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07)',
    },
    selected: {
      scale: 1.02,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    bestPrice: {
      scale: 1.02,
      boxShadow: '0 0 0 2px #10b981, 0 20px 25px -5px rgba(16, 185, 129, 0.2)',
    }
  };

  const getAnimationVariant = () => {
    if (isBestPrice) return 'bestPrice';
    if (isSelected) return 'selected';
    return 'unselected';
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      animate={getAnimationVariant()}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative"
    >
      {/* Best Price Badge */}
      <AnimatePresence>
        {isBestPrice && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0, rotate: 180 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="absolute -top-3 -right-3 z-10"
          >
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
              <Crown className="w-3 h-3" />
              <span>Best Price</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card
        hover={false}
        className={`cursor-pointer transition-all duration-300 ${
          isSelected
            ? 'ring-2 ring-primary-500 ring-opacity-50'
            : ''
        } ${
          isBestPrice
            ? 'ring-2 ring-green-500 ring-opacity-50 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10'
            : ''
        }`}
        onClick={handleSelect}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                {quote.vendor.name.charAt(0)}
              </motion.div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {quote.vendor.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {getRatingStars(Math.floor(quote.vendor.rating))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {quote.vendor.rating}/5
                  </span>
                  {quote.vendor.verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Award className="w-4 h-4 text-blue-500" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={quote.status} animate>
                <span className="flex items-center space-x-1">
                  {getStatusIcon()}
                  <span>{quote.status}</span>
                </span>
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <div className="space-y-4">
            {/* Price Section */}
            <motion.div
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Price</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(quote.totalPrice)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(quote.unitPrice)} per unit
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                  className="text-green-500"
                >
                  <DollarSign className="w-8 h-8" />
                </motion.div>
              </div>
            </motion.div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <div>
                  <p className="font-medium">Delivery</p>
                  <p>{formatDate(quote.deliveryDate)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Truck className="w-4 h-4" />
                <div>
                  <p className="font-medium">Payment</p>
                  <p>{quote.paymentTerms}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {quote.notes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.2 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border-l-4 border-blue-500"
              >
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Vendor Notes:</strong> {quote.notes}
                </p>
              </motion.div>
            )}

            {/* Negotiations Count */}
            {quote.negotiations && quote.negotiations.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-500 dark:text-gray-400">
                  {quote.negotiations.length} message{quote.negotiations.length !== 1 ? 's' : ''} exchanged
                </span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              </motion.div>
            )}
          </div>
        </CardBody>

        <CardFooter>
          <div className="space-y-3 w-full">
            {/* Payment Mode Toggle */}
            {quote.status !== 'accepted' && (
              <div className="flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                  onClick={() => setPaymentMode('traditional')}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    paymentMode === 'traditional'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <CreditCard className="w-3 h-3 inline mr-1" />
                  Traditional
                </button>
                <button
                  onClick={() => setPaymentMode('crypto')}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    paymentMode === 'crypto'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Wallet className="w-3 h-3 inline mr-1" />
                  Crypto Pay
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                {isSelected ? 'Selected' : 'Select Quote'}
              </Button>

              <AnimatePresence>
                {quote.status !== 'accepted' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex-1"
                  >
                    {paymentMode === 'traditional' ? (
                      <Button
                        variant="success"
                        loading={accepting}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptQuote();
                        }}
                        className="w-full"
                      >
                        {accepting ? 'Processing...' : 'Accept Quote'}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        loading={accepting || isTransferring}
                        disabled={!isAuthenticated || !vendorUser}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCryptoPayment();
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        {isTransferring ? (
                          'Paying...'
                        ) : !isAuthenticated ? (
                          'Connect Wallet'
                        ) : (
                          <>
                            <Wallet className="w-4 h-4 mr-2" />
                            Pay {((quote.totalPrice / 1000).toFixed(2))} USDC
                          </>
                        )}
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {quote.status === 'accepted' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1"
                >
                  <Button variant="success" disabled className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accepted
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Crypto Payment Info */}
            {paymentMode === 'crypto' && quote.status !== 'accepted' && vendorUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Pay to: {vendorUser.name}
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {vendorUser.walletAddress.slice(0, 6)}...{vendorUser.walletAddress.slice(-4)}
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Instant payment • No fees • Blockchain secured
                </div>
              </motion.div>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
});

export default QuoteCard;