import React, { useState, useEffect } from 'react';
import { getProcurementRequests } from '../services/api';
import { format } from 'date-fns';

function ProcurementList({ onRequestSelected }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      console.error('Failed to load requests:', err);
      setError('Failed to load procurement requests');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'open': return 'status-badge status-open';
      case 'negotiating': return 'status-badge status-negotiating';
      case 'completed': return 'status-badge status-completed';
      case 'cancelled': return 'status-badge status-cancelled';
      default: return 'status-badge';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case 'high': return '#d32f2f';
      case 'medium': return '#f57c00';
      case 'low': return '#388e3c';
      default: return '#666';
    }
  };

  if (loading) {
    return <div className="loading">Loading procurement requests...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="empty-state">
        <p>No procurement requests found. Create your first request to get started!</p>
      </div>
    );
  }

  return (
    <div className="procurement-list">
      <div className="requests-header">
        <h3>Total Requests: {requests.length}</h3>
        <button onClick={loadRequests} className="btn btn-secondary btn-small">
          Refresh
        </button>
      </div>

      <div className="requests-grid grid grid-2">
        {requests.map(request => (
          <div key={request.id} className="card fade-in">
            <div className="card-header">
              <h4 className="card-title">{request.productName}</h4>
              <span className={getStatusBadgeClass(request.status)}>
                {request.status}
              </span>
            </div>

            <div className="card-body">
              <div className="request-details">
                <div className="detail-row">
                  <span className="label">Company:</span>
                  <span className="value">{request.buyer?.companyName}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Quantity:</span>
                  <span className="value">{request.quantity} {request.unit}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Category:</span>
                  <span className="value">{request.category}</span>
                </div>

                <div className="detail-row">
                  <span className="label">Delivery Date:</span>
                  <span className="value">{formatDate(request.deliveryDate)}</span>
                </div>

                {request.maxBudget && (
                  <div className="detail-row">
                    <span className="label">Max Budget:</span>
                    <span className="value">${request.maxBudget.toLocaleString()}</span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="label">Urgency:</span>
                  <span
                    className="value urgency-indicator"
                    style={{ color: getUrgencyColor(request.urgency), fontWeight: 'bold' }}
                  >
                    {request.urgency.toUpperCase()}
                  </span>
                </div>

                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">{formatDate(request.createdAt)}</span>
                </div>

                {request.quotes && request.quotes.length > 0 && (
                  <div className="detail-row">
                    <span className="label">Quotes Received:</span>
                    <span className="value quotes-count">
                      {request.quotes.length} quote{request.quotes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="request-actions">
                <button
                  onClick={() => onRequestSelected && onRequestSelected(request)}
                  className="btn btn-primary btn-small"
                >
                  View Quotes & Negotiations
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .requests-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .requests-header h3 {
          margin: 0;
          color: #333;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          padding: 0.25rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .label {
          font-weight: 600;
          color: #666;
          flex: 1;
        }

        .value {
          flex: 1;
          text-align: right;
          color: #333;
        }

        .quotes-count {
          color: #667eea;
          font-weight: 600;
        }

        .request-actions {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
          font-size: 1.1rem;
        }

        .urgency-indicator {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

export default ProcurementList;