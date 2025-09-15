import React, { useState, useEffect } from 'react';
import { getQuotes, getNegotiations, sendNegotiationMessage, createOrder } from '../services/api';
import { format } from 'date-fns';

function QuotesList({ requestId }) {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [negotiations, setNegotiations] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (requestId) {
      loadQuotes();
    }
  }, [requestId]);

  useEffect(() => {
    if (selectedQuote) {
      loadNegotiations();
    }
  }, [selectedQuote]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await getQuotes({ requestId });
      setQuotes(data);
      if (data.length > 0 && !selectedQuote) {
        setSelectedQuote(data[0]);
      }
    } catch (err) {
      console.error('Failed to load quotes:', err);
      setError('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const loadNegotiations = async () => {
    if (!selectedQuote) return;

    try {
      const data = await getNegotiations(selectedQuote.id);
      setNegotiations(data);
    } catch (err) {
      console.error('Failed to load negotiations:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedQuote) return;

    setSendingMessage(true);
    try {
      await sendNegotiationMessage(selectedQuote.id, newMessage, 'buyer');
      setNewMessage('');
      // Reload negotiations to see the conversation
      await loadNegotiations();
      // Reload quotes to see updated prices
      await loadQuotes();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send negotiation message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAcceptQuote = async (quote) => {
    try {
      const orderData = {
        requestId: quote.requestId,
        quoteId: quote.id,
        buyerId: quote.request.buyerId,
        vendorId: quote.vendorId,
        finalPrice: quote.totalPrice,
        deliveryDate: quote.deliveryDate,
        paymentTerms: quote.paymentTerms
      };

      await createOrder(orderData);
      alert('Order placed successfully!');
      await loadQuotes(); // Refresh to show updated status
    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Failed to place order');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const getQuoteStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-badge status-open';
      case 'accepted': return 'status-badge status-completed';
      case 'rejected': return 'status-badge status-cancelled';
      case 'countered': return 'status-badge status-negotiating';
      default: return 'status-badge';
    }
  };

  const getSenderBadgeClass = (sender) => {
    switch (sender) {
      case 'buyer': return 'sender-buyer';
      case 'vendor': return 'sender-vendor';
      case 'ai-agent':
      case 'ai-vendor':
      case 'ai-buyer': return 'sender-ai';
      default: return 'sender-default';
    }
  };

  if (loading) {
    return <div className="loading">Loading quotes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (quotes.length === 0) {
    return (
      <div className="empty-state">
        <p>No quotes received yet. Our AI agents are still working on finding vendors for this request.</p>
      </div>
    );
  }

  return (
    <div className="quotes-container">
      <div className="quotes-section">
        <h3>Quotes Received ({quotes.length})</h3>
        <div className="quotes-grid grid grid-2">
          {quotes.map(quote => (
            <div
              key={quote.id}
              className={`card quote-card ${selectedQuote?.id === quote.id ? 'selected' : ''}`}
              onClick={() => setSelectedQuote(quote)}
            >
              <div className="card-header">
                <h4 className="card-title">{quote.vendor.name}</h4>
                <span className={getQuoteStatusClass(quote.status)}>
                  {quote.status}
                </span>
              </div>

              <div className="card-body">
                <div className="quote-details">
                  <div className="detail-row">
                    <span className="label">Unit Price:</span>
                    <span className="value">${quote.unitPrice}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Total Price:</span>
                    <span className="value total-price">${quote.totalPrice.toLocaleString()}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Delivery:</span>
                    <span className="value">{formatDate(quote.deliveryDate)}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Payment:</span>
                    <span className="value">{quote.paymentTerms}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Vendor Rating:</span>
                    <span className="value">⭐ {quote.vendor.rating}/5</span>
                  </div>

                  {quote.notes && (
                    <div className="quote-notes">
                      <strong>Notes:</strong> {quote.notes}
                    </div>
                  )}
                </div>

                <div className="quote-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptQuote(quote);
                    }}
                    className="btn btn-success btn-small"
                    disabled={quote.status === 'accepted'}
                  >
                    {quote.status === 'accepted' ? 'Accepted' : 'Accept Quote'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedQuote && (
        <div className="negotiations-section">
          <h3>Negotiations - {selectedQuote.vendor.name}</h3>

          <div className="negotiations-container">
            <div className="negotiations-messages">
              {negotiations.length === 0 ? (
                <p className="no-negotiations">No negotiations yet. Start the conversation below!</p>
              ) : (
                negotiations.map(message => (
                  <div
                    key={message.id}
                    className={`negotiation-message ${getSenderBadgeClass(message.sender)}`}
                  >
                    <div className="message-header">
                      <span className="sender">
                        {message.sender === 'buyer' ? '👨‍💼 Buyer' :
                         message.sender === 'vendor' ? '🏭 Vendor' :
                         '🤖 AI Agent'}
                      </span>
                      <span className="timestamp">{formatDateTime(message.timestamp)}</span>
                    </div>
                    <div className="message-content">
                      {message.message}
                    </div>
                    {message.proposedChanges && Object.keys(message.proposedChanges).length > 0 && (
                      <div className="proposed-changes">
                        <strong>Proposed Changes:</strong>
                        <ul>
                          {Object.entries(message.proposedChanges).map(([key, value]) => (
                            <li key={key}>{key}: {value}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="negotiation-form">
              <div className="form-group">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send a negotiation message (e.g., 'Can you reduce the price to $2000?' or 'Can you deliver by Friday?')"
                  rows="3"
                  disabled={sendingMessage}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sendingMessage || !newMessage.trim()}
              >
                {sendingMessage ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .quotes-container {
          display: grid;
          gap: 2rem;
        }

        .quote-card {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quote-card:hover {
          border-color: #667eea;
        }

        .quote-card.selected {
          border: 2px solid #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .total-price {
          font-weight: bold;
          color: #28a745;
          font-size: 1.1em;
        }

        .quote-notes {
          margin-top: 1rem;
          padding: 0.75rem;
          background-color: #f8f9fa;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #666;
        }

        .negotiations-container {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .negotiations-messages {
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 1rem;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 1rem;
        }

        .no-negotiations {
          text-align: center;
          color: #666;
          font-style: italic;
        }

        .negotiation-message {
          margin-bottom: 1rem;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #ddd;
        }

        .sender-buyer {
          background-color: #e3f2fd;
          border-left-color: #2196f3;
        }

        .sender-vendor {
          background-color: #f3e5f5;
          border-left-color: #9c27b0;
        }

        .sender-ai {
          background-color: #e8f5e8;
          border-left-color: #4caf50;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .sender {
          font-weight: bold;
        }

        .timestamp {
          color: #666;
        }

        .message-content {
          line-height: 1.5;
        }

        .proposed-changes {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .proposed-changes ul {
          margin: 0.5rem 0 0 0;
          padding-left: 1rem;
        }

        .negotiation-form {
          border-top: 1px solid #eee;
          padding-top: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
}

export default QuotesList;