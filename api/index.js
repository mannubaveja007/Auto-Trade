require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./database/prisma-db');
const aiRoutes = require('./routes/ai-routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vendor routes
app.get('/vendors', async (req, res) => {
  try {
    const { category } = req.query;
    const vendors = category ? await db.getVendorsByCategory(category) : await db.getAllVendors();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

app.get('/vendors/:id', async (req, res) => {
  try {
    const vendor = await db.getVendorById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ error: 'Failed to fetch vendor' });
  }
});

// Procurement request routes
app.get('/requests', async (req, res) => {
  try {
    const { buyerId, status } = req.query;
    let requests;

    if (buyerId) {
      requests = await db.getProcurementRequestsByBuyer(buyerId);
    } else if (status) {
      requests = await db.getProcurementRequestsByStatus(status);
    } else {
      requests = await db.getAllProcurementRequests();
    }

    res.json(requests);
  } catch (error) {
    console.error('Error fetching procurement requests:', error);
    res.status(500).json({ error: 'Failed to fetch procurement requests' });
  }
});

app.get('/requests/:id', async (req, res) => {
  try {
    const request = await db.getProcurementRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Procurement request not found' });
    }
    res.json(request);
  } catch (error) {
    console.error('Error fetching procurement request:', error);
    res.status(500).json({ error: 'Failed to fetch procurement request' });
  }
});

app.post('/requests', async (req, res) => {
  try {
    const request = await db.addProcurementRequest(req.body);
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating procurement request:', error);
    res.status(500).json({ error: 'Failed to create procurement request' });
  }
});

app.delete('/requests/:id', async (req, res) => {
  try {
    await db.deleteProcurementRequest(req.params.id);
    res.json({ message: 'Procurement request deleted successfully' });
  } catch (error) {
    console.error('Error deleting procurement request:', error);
    res.status(500).json({ error: 'Failed to delete procurement request' });
  }
});

// Quote routes
app.get('/quotes', async (req, res) => {
  try {
    const { requestId, vendorId } = req.query;
    let quotes;

    if (requestId) {
      quotes = await db.getQuotesByRequest(requestId);
    } else if (vendorId) {
      quotes = await db.getQuotesByVendor(vendorId);
    } else {
      quotes = await db.getAllQuotes();
    }

    res.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

app.post('/quotes', async (req, res) => {
  try {
    const quote = await db.addQuote(req.body);
    res.status(201).json(quote);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// Negotiation routes
app.get('/negotiations/:quoteId', async (req, res) => {
  try {
    const negotiations = await db.getNegotiationMessages(req.params.quoteId);
    res.json(negotiations);
  } catch (error) {
    console.error('Error fetching negotiations:', error);
    res.status(500).json({ error: 'Failed to fetch negotiations' });
  }
});

// Order routes
app.get('/orders', async (req, res) => {
  try {
    const { buyerId, vendorId } = req.query;
    let orders;

    if (buyerId) {
      orders = await db.getOrdersByBuyer(buyerId);
    } else if (vendorId) {
      orders = await db.getOrdersByVendor(vendorId);
    } else {
      orders = await db.getAllOrders();
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const order = await db.addOrder(req.body);
    await db.updateProcurementRequestStatus(order.requestId, 'completed');
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Buyer routes
app.get('/buyers', async (req, res) => {
  try {
    const buyers = await db.getAllBuyers();
    res.json(buyers);
  } catch (error) {
    console.error('Error fetching buyers:', error);
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export the serverless function
module.exports.handler = serverless(app);