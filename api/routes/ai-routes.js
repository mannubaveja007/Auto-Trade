const express = require('express');
const router = express.Router();
const NegotiationAgent = require('../ai/negotiation-agent');

const agent = new NegotiationAgent();

// Trigger AI vendor matching for a request
router.post('/match-vendors/:requestId', async (req, res) => {
  try {
    const results = await agent.matchAndContactVendors(req.params.requestId);
    res.json({
      success: true,
      message: `Contacted ${results.length} vendors`,
      results: results.map(r => ({
        vendor: r.vendor.name,
        quoteId: r.quote?.id,
        error: r.error
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle negotiation message
router.post('/negotiate/:quoteId', async (req, res) => {
  try {
    const { message, sender } = req.body;
    const aiResponse = await agent.handleNegotiation(req.params.quoteId, message, sender);
    res.json(aiResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;