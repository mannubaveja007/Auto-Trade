require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const winston = require('winston');

const db = require('./database/prisma-db');
const aiRoutes = require('./routes/ai-routes');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

function createApp() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
  }
  app.use(express.json());

  // Routes - always use /api prefix for consistency
  app.use('/api/ai', aiRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vendor routes
  app.get('/api/vendors', async (req, res) => {
    try {
      const { category } = req.query;
      const vendors = category ? await db.getVendorsByCategory(category) : await db.getAllVendors();
      res.json(vendors);
    } catch (error) {
      logger.error('Error fetching vendors:', error);
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  });

  app.get('/api/vendors/:id', async (req, res) => {
    try {
      const vendor = await db.getVendorById(req.params.id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      res.json(vendor);
    } catch (error) {
      logger.error('Error fetching vendor:', error);
      res.status(500).json({ error: 'Failed to fetch vendor' });
    }
  });

  app.post('/api/vendors', async (req, res) => {
    try {
      const vendor = await db.addVendor(req.body);
      res.status(201).json(vendor);
    } catch (error) {
      logger.error('Error creating vendor:', error);
      res.status(500).json({ error: 'Failed to create vendor' });
    }
  });

  // Buyer routes
  app.get('/api/buyers', async (req, res) => {
    try {
      const buyers = await db.getAllBuyers();
      res.json(buyers);
    } catch (error) {
      logger.error('Error fetching buyers:', error);
      res.status(500).json({ error: 'Failed to fetch buyers' });
    }
  });

  app.get('/api/buyers/:id', async (req, res) => {
    try {
      const buyer = await db.getBuyer(req.params.id);
      if (!buyer) {
        return res.status(404).json({ error: 'Buyer not found' });
      }
      res.json(buyer);
    } catch (error) {
      logger.error('Error fetching buyer:', error);
      res.status(500).json({ error: 'Failed to fetch buyer' });
    }
  });

  // Procurement Request routes
  app.get('/api/requests', async (req, res) => {
    try {
      const { status, buyerId } = req.query;
      let requests;

      if (buyerId) {
        requests = await db.getProcurementRequestsByBuyer(buyerId);
      } else if (status) {
        requests = await db.getProcurementRequestsByStatus(status);
      } else {
        requests = await db.getAllProcurementRequests();
      }

      if (status && !buyerId) {
        requests = requests.filter(r => r.status === status);
      }

      res.json(requests);
    } catch (error) {
      logger.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  });

  app.get('/api/requests/:id', async (req, res) => {
    try {
      const request = await db.getProcurementRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: 'Request not found' });
      }
      res.json(request);
    } catch (error) {
      logger.error('Error fetching request:', error);
      res.status(500).json({ error: 'Failed to fetch request' });
    }
  });

  app.post('/api/requests', async (req, res) => {
    try {
      const request = await db.addProcurementRequest(req.body);
      logger.info('New procurement request created:', { requestId: request.id, buyerId: request.buyerId });
      res.status(201).json(request);
    } catch (error) {
      logger.error('Error creating request:', error);
      res.status(500).json({ error: 'Failed to create request' });
    }
  });

  app.delete('/api/requests/:id', async (req, res) => {
    try {
      await db.deleteProcurementRequest(req.params.id);
      res.json({ message: 'Procurement request deleted successfully' });
    } catch (error) {
      logger.error('Error deleting procurement request:', error);
      res.status(500).json({ error: 'Failed to delete procurement request' });
    }
  });

  // Quote routes
  app.get('/api/quotes', async (req, res) => {
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
      logger.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  app.post('/api/quotes', async (req, res) => {
    try {
      const quote = await db.addQuote(req.body);
      logger.info('New quote created:', { quoteId: quote.id, vendorId: quote.vendorId });
      res.status(201).json(quote);
    } catch (error) {
      logger.error('Error creating quote:', error);
      res.status(500).json({ error: 'Failed to create quote' });
    }
  });

  // Negotiation routes
  app.get('/api/negotiations/:quoteId', async (req, res) => {
    try {
      const negotiations = await db.getNegotiationMessages(req.params.quoteId);
      res.json(negotiations);
    } catch (error) {
      logger.error('Error fetching negotiations:', error);
      res.status(500).json({ error: 'Failed to fetch negotiations' });
    }
  });

  app.post('/api/negotiations', async (req, res) => {
    try {
      const message = await db.addNegotiationMessage(req.body);
      logger.info('New negotiation message:', { messageId: message.id, quoteId: message.quoteId });
      res.status(201).json(message);
    } catch (error) {
      logger.error('Error creating negotiation message:', error);
      res.status(500).json({ error: 'Failed to create negotiation message' });
    }
  });

  // Order routes
  app.get('/api/orders', async (req, res) => {
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
      logger.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const order = await db.addOrder(req.body);
      await db.updateProcurementRequestStatus(order.requestId, 'completed');
      logger.info('New order created:', { orderId: order.id, buyerId: order.buyerId, vendorId: order.vendorId });
      res.status(201).json(order);
    } catch (error) {
      logger.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Error handling middleware
  app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}

module.exports = { createApp, logger };