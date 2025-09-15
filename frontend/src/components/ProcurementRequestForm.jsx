import React, { useState, useEffect } from 'react';
import { createProcurementRequest, getBuyers, triggerVendorMatching } from '../services/api';

function ProcurementRequestForm({ onRequestCreated }) {
  const [formData, setFormData] = useState({
    buyerId: '',
    productName: '',
    category: '',
    quantity: '',
    unit: '',
    deliveryDate: '',
    deliveryAddress: '',
    maxBudget: '',
    urgency: 'medium',
    specifications: ''
  });

  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadBuyers();
  }, []);

  const loadBuyers = async () => {
    try {
      const buyersData = await getBuyers();
      setBuyers(buyersData);
      if (buyersData.length > 0) {
        setFormData(prev => ({ ...prev, buyerId: buyersData[0].id }));
      }
    } catch (error) {
      console.error('Failed to load buyers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare data for submission
      const requestData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        maxBudget: formData.maxBudget ? parseFloat(formData.maxBudget) : null,
        specifications: formData.specifications ? JSON.parse(`{"description": "${formData.specifications}"}`) : null
      };

      // Create the procurement request
      const request = await createProcurementRequest(requestData);

      setMessage({
        type: 'success',
        text: `Procurement request created successfully! ID: ${request.id}`
      });

      // Trigger AI vendor matching
      try {
        const matchingResult = await triggerVendorMatching(request.id);
        setMessage({
          type: 'success',
          text: `Request created and AI agents contacted ${matchingResult.results.length} vendors!`
        });
      } catch (aiError) {
        console.error('AI matching failed:', aiError);
        setMessage({
          type: 'success',
          text: 'Request created! AI vendor matching will be available once the backend is properly configured.'
        });
      }

      // Reset form
      setFormData({
        buyerId: buyers.length > 0 ? buyers[0].id : '',
        productName: '',
        category: '',
        quantity: '',
        unit: '',
        deliveryDate: '',
        deliveryAddress: '',
        maxBudget: '',
        urgency: 'medium',
        specifications: ''
      });

      // Notify parent component
      if (onRequestCreated) {
        onRequestCreated(request);
      }

    } catch (error) {
      console.error('Failed to create request:', error);
      setMessage({
        type: 'error',
        text: 'Failed to create procurement request. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate tomorrow's date as default delivery date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="procurement-form fade-in">
      {message.text && (
        <div className={`${message.type === 'error' ? 'error-message' : 'success-message'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="buyerId">Company</label>
          <select
            id="buyerId"
            name="buyerId"
            value={formData.buyerId}
            onChange={handleChange}
            required
          >
            <option value="">Select Company</option>
            {buyers.map(buyer => (
              <option key={buyer.id} value={buyer.id}>
                {buyer.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="productName">Product Name</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., Tomato Sauce"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="food-ingredients">Food Ingredients</option>
              <option value="condiments">Condiments</option>
              <option value="spices">Spices</option>
              <option value="packaging">Packaging</option>
              <option value="bulk-supplies">Bulk Supplies</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="1000"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            >
              <option value="">Select Unit</option>
              <option value="kg">Kilograms</option>
              <option value="liters">Liters</option>
              <option value="pieces">Pieces</option>
              <option value="boxes">Boxes</option>
              <option value="gallons">Gallons</option>
              <option value="tons">Tons</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deliveryDate">Delivery Date</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              min={getTomorrowDate()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxBudget">Max Budget ($)</label>
            <input
              type="number"
              id="maxBudget"
              name="maxBudget"
              value={formData.maxBudget}
              onChange={handleChange}
              placeholder="5000"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deliveryAddress">Delivery Address</label>
          <input
            type="text"
            id="deliveryAddress"
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
            placeholder="123 Main St, Chicago, IL 60601"
          />
        </div>

        <div className="form-group">
          <label htmlFor="urgency">Urgency</label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="specifications">Additional Specifications</label>
          <textarea
            id="specifications"
            name="specifications"
            value={formData.specifications}
            onChange={handleChange}
            placeholder="Any specific requirements, quality standards, certifications needed..."
            rows="3"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating Request & Finding Vendors...' : 'Create Request & Find Vendors'}
        </button>
      </form>
    </div>
  );
}

export default ProcurementRequestForm;