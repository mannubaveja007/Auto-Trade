const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import your routes
const aiRoutes = require('./routes/ai-routes');
const db = require('./database/prisma-db');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vendor routes
app.get('/api/vendors', async (req, res) => {
  try {
    const { category } = req.query;
    const vendors = category ? await db.getVendorsByCategory(category) : await db.getAllVendors();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// Export the serverless function
module.exports.handler = serverless(app);