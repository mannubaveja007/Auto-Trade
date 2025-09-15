import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNegotiations, sendNegotiationMessage } from '../../services/api';
import { Card, CardHeader, CardBody } from '../ui/Card';
import Button from '../ui/Button';
import { formatDateTime, formatCurrency } from '../../lib/utils';
import {
  Send,
  User,
  Bot,
  Building2,
  Zap,
  CheckCircle,
  Clock,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export function NegotiationChat({ quote, onQuoteUpdate }) {
  const [negotiations, setNegotiations] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (quote) {
      loadNegotiations();
    }
  }, [quote]);

  useEffect(() => {
    scrollToBottom();
  }, [negotiations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadNegotiations = async () => {
    try {
      const data = await getNegotiations(quote.id);
      setNegotiations(data);
    } catch (err) {
      toast.error('Failed to load negotiations');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    setMessage('');
    setSending(true);
    setTyping(true);

    try {
      await sendNegotiationMessage(quote.id, userMessage, 'buyer');

      // Simulate AI thinking time
      setTimeout(async () => {
        await loadNegotiations();
        setTyping(false);
        if (onQuoteUpdate) {
          onQuoteUpdate();
        }
      }, 1500);

    } catch (err) {
      toast.error('Failed to send message');
      setTyping(false);
    } finally {
      setSending(false);
    }
  };

  const getSenderInfo = (sender) => {
    switch (sender) {
      case 'buyer':
        return {
          name: 'You',
          icon: User,
          color: 'bg-primary-500',
          textColor: 'text-primary-700 dark:text-primary-300',
          bgColor: 'bg-primary-50 dark:bg-primary-900/20',
          align: 'justify-end'
        };
      case 'vendor':
      case 'ai-vendor':
        return {
          name: quote?.vendor?.name || 'Vendor',
          icon: Building2,
          color: 'bg-purple-500',
          textColor: 'text-purple-700 dark:text-purple-300',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          align: 'justify-start'
        };
      case 'ai-agent':
      case 'ai-buyer':
        return {
          name: 'AI Assistant',
          icon: Bot,
          color: 'bg-green-500',
          textColor: 'text-green-700 dark:text-green-300',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          align: 'justify-end'
        };
      default:
        return {
          name: 'System',
          icon: MessageSquare,
          color: 'bg-gray-500',
          textColor: 'text-gray-700 dark:text-gray-300',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          align: 'justify-start'
        };
    }
  };

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-end space-x-2">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const MessageBubble = ({ negotiation, index }) => {
    const senderInfo = getSenderInfo(negotiation.sender);
    const Icon = senderInfo.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className={`flex ${senderInfo.align} mb-4`}
      >
        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
          senderInfo.align === 'justify-end' ? 'flex-row-reverse space-x-reverse' : ''
        }`}>
          <motion.div
            className={`w-8 h-8 ${senderInfo.color} rounded-full flex items-center justify-center`}
            whileHover={{ scale: 1.1 }}
          >
            <Icon className="w-4 h-4 text-white" />
          </motion.div>

          <div className="space-y-1">
            <div className={`${senderInfo.bgColor} rounded-2xl px-4 py-3 ${
              senderInfo.align === 'justify-end' ? 'rounded-br-sm' : 'rounded-bl-sm'
            }`}>
              <p className={`text-sm ${senderInfo.textColor} leading-relaxed`}>
                {negotiation.message}
              </p>

              {negotiation.proposedChanges && Object.keys(negotiation.proposedChanges).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Proposed Changes
                    </span>
                  </div>
                  {Object.entries(negotiation.proposedChanges).map(([key, value]) => (
                    <div key={key} className="text-xs bg-white dark:bg-gray-800 rounded-lg px-2 py-1 mb-1">
                      <span className="font-medium capitalize">{key}:</span>{' '}
                      <span className="text-green-600 dark:text-green-400">
                        {key.includes('Price') ? formatCurrency(value) : value}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <div className={`text-xs text-gray-500 dark:text-gray-400 px-2 ${
              senderInfo.align === 'justify-end' ? 'text-right' : 'text-left'
            }`}>
              <span className="font-medium">{senderInfo.name}</span> • {formatDateTime(negotiation.timestamp)}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const QuickReplies = () => {
    const suggestions = [
      "Can you reduce the price by 10%?",
      "What about faster delivery?",
      "Do you offer volume discounts?",
      "Can you match competitor pricing?",
      "What are your payment terms?"
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMessage(suggestion)}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {suggestion}
          </motion.button>
        ))}
      </motion.div>
    );
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Negotiation with {quote?.vendor?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current offer: {formatCurrency(quote?.totalPrice)} • {quote?.status}
              </p>
            </div>
          </div>

          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center space-x-2 text-green-600 dark:text-green-400"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">AI Active</span>
          </motion.div>
        </div>
      </CardHeader>

      <CardBody className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1 mb-4">
          {negotiations.length === 0 && !typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Start the conversation
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Send a message to begin negotiating with the vendor
              </p>
              <QuickReplies />
            </motion.div>
          )}

          <AnimatePresence>
            {negotiations.map((negotiation, index) => (
              <MessageBubble
                key={negotiation.id}
                negotiation={negotiation}
                index={index}
              />
            ))}

            {typing && <TypingIndicator />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your negotiation message..."
                disabled={sending}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={!message.trim() || sending}
              loading={sending}
              className="px-6 py-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {negotiations.length === 0 && (
            <QuickReplies />
          )}
        </form>
      </CardBody>
    </Card>
  );
}

export default NegotiationChat;