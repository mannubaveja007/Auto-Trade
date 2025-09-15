const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../database/prisma-db');

class NegotiationAgent {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // Main function to handle vendor matching and outreach
  async matchAndContactVendors(requestId) {
    try {
      const request = await db.getProcurementRequest(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      // Find suitable vendors
      const suitableVendors = await db.getVendorsByCategory(request.category);

      console.log(`Found ${suitableVendors.length} vendors for category: ${request.category}`);

      // Contact each vendor with AI-generated outreach
      const contactPromises = suitableVendors.map(vendor =>
        this.contactVendorWithAI(request, vendor)
      );

      const results = await Promise.all(contactPromises);
      return results;

    } catch (error) {
      console.error('Error in vendor matching:', error);
      throw error;
    }
  }

  // AI-powered vendor outreach
  async contactVendorWithAI(request, vendor) {
    try {
      const outreachMessage = await this.generateVendorOutreach(request, vendor);

      // Simulate vendor response (in real app, this would be email/API call)
      const vendorResponse = await this.simulateVendorResponse(request, vendor);

      // Create initial quote based on vendor response
      const quote = await db.addQuote({
        requestId: request.id,
        vendorId: vendor.id,
        unitPrice: vendorResponse.unitPrice,
        totalPrice: vendorResponse.totalPrice,
        deliveryDate: vendorResponse.deliveryDate,
        paymentTerms: vendor.paymentTerms,
        notes: vendorResponse.notes,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      console.log(`Quote created for vendor ${vendor.name}: ${quote.id}`);

      return {
        vendor,
        outreachMessage,
        quote,
        vendorResponse
      };

    } catch (error) {
      console.error(`Error contacting vendor ${vendor.name}:`, error);
      return { vendor, error: error.message };
    }
  }

  // Generate AI outreach message to vendors
  async generateVendorOutreach(request, vendor) {
    const buyer = await db.getBuyer(request.buyerId);
    const prompt = `
Generate a professional B2B procurement outreach message. Context:

BUYER: ${buyer?.companyName}
VENDOR: ${vendor.name}
PRODUCT NEEDED: ${request.productName}
QUANTITY: ${request.quantity} ${request.unit}
DELIVERY DATE: ${request.deliveryDate}
BUDGET: Up to $${request.maxBudget}

Requirements:
- Professional tone
- Clear specifications
- Request for quote
- Mention urgency: ${request.urgency}
- Keep under 200 words

Write only the email body, no subject line.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating outreach:', error);
      return `Dear ${vendor.name},\n\nWe are interested in procuring ${request.quantity} ${request.unit} of ${request.productName}. Please provide your best quote for delivery by ${request.deliveryDate}.\n\nThank you.`;
    }
  }

  // Simulate vendor response (in real app, vendors would respond via portal/email)
  async simulateVendorResponse(request, vendor) {
    // Simulate realistic pricing based on vendor characteristics
    const basePrice = this.calculateBasePrice(request.productName, request.quantity);
    const vendorMultiplier = this.getVendorPriceMultiplier(vendor);
    const unitPrice = Math.round(basePrice * vendorMultiplier * 100) / 100;
    const totalPrice = Math.round(unitPrice * request.quantity * 100) / 100;

    // Simulate delivery date (some vendors are faster)
    const requestedDate = new Date(request.deliveryDate);
    const vendorDeliveryDays = vendor.rating > 4.5 ? 0 : Math.floor(Math.random() * 3) + 1;
    const deliveryDate = new Date(requestedDate.getTime() + vendorDeliveryDays * 24 * 60 * 60 * 1000);

    return {
      unitPrice,
      totalPrice,
      deliveryDate: deliveryDate.toISOString().split('T')[0],
      notes: this.generateVendorNotes(vendor),
      interested: this.isVendorInterested(request, vendor)
    };
  }

  // AI-powered negotiation
  async handleNegotiation(quoteId, negotiationMessage, sender) {
    try {
      const quote = await db.getQuote(quoteId);
      if (!quote) {
        throw new Error('Quote not found');
      }

      const request = quote.request;
      const vendor = quote.vendor;
      const buyer = request.buyer;

      // Add the negotiation message
      await db.addNegotiationMessage({
        quoteId,
        sender,
        message: negotiationMessage,
        timestamp: new Date()
      });

      // Generate AI response based on sender
      let aiResponse;
      if (sender === 'buyer') {
        // AI acts as vendor
        aiResponse = await this.generateVendorNegotiationResponse(
          quote, request, vendor, negotiationMessage
        );
      } else if (sender === 'vendor') {
        // AI acts as buyer agent
        aiResponse = await this.generateBuyerNegotiationResponse(
          quote, request, buyer, negotiationMessage
        );
      }

      if (aiResponse) {
        // Add AI response to negotiations
        const aiMessage = await db.addNegotiationMessage({
          quoteId,
          sender: sender === 'buyer' ? 'ai-vendor' : 'ai-buyer',
          message: aiResponse.message,
          proposedChanges: aiResponse.proposedChanges || {},
          timestamp: new Date()
        });

        // Update quote if there are proposed changes
        if (aiResponse.proposedChanges) {
          await db.updateQuote(quoteId, aiResponse.proposedChanges);
        }

        return aiMessage;
      }

    } catch (error) {
      console.error('Error in negotiation:', error);
      throw error;
    }
  }

  async generateVendorNegotiationResponse(quote, request, vendor, buyerMessage) {
    const prompt = `
You are representing ${vendor.name}, a B2B vendor. A buyer (${db.getBuyer(request.buyerId)?.companyName}) sent this negotiation message:

BUYER MESSAGE: "${buyerMessage}"

CURRENT QUOTE:
- Product: ${request.productName}
- Quantity: ${request.quantity} ${request.unit}
- Current Price: $${quote.totalPrice}
- Delivery: ${quote.deliveryDate}

VENDOR PROFILE:
- Rating: ${vendor.rating}/5
- Min Order: $${vendor.minOrderValue}
- Payment Terms: ${vendor.paymentTerms}

As the vendor, respond professionally. You can:
- Negotiate price (within 10-15% margin)
- Adjust delivery dates
- Modify payment terms
- Accept/counter-offer

Respond in JSON format:
{
  "message": "your response",
  "proposedChanges": {
    "totalPrice": 950.00,
    "deliveryDate": "2024-01-20"
  }
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return JSON.parse(response.text().trim());
    } catch (error) {
      console.error('Error generating vendor response:', error);
      return {
        message: "Thank you for your message. We'll review your request and get back to you shortly.",
        proposedChanges: {}
      };
    }
  }

  async generateBuyerNegotiationResponse(quote, request, buyer, vendorMessage) {
    const prompt = `
You are an AI procurement agent representing ${buyer?.companyName}. A vendor sent this message:

VENDOR MESSAGE: "${vendorMessage}"

PROCUREMENT REQUEST:
- Product: ${request.productName}
- Quantity: ${request.quantity} ${request.unit}
- Max Budget: $${request.maxBudget}
- Urgency: ${request.urgency}

CURRENT QUOTE:
- Total Price: $${quote.totalPrice}
- Delivery: ${quote.deliveryDate}

Your goal: Get the best deal while maintaining good vendor relationships.

Respond in JSON format:
{
  "message": "your response",
  "proposedChanges": {
    "totalPrice": 900.00
  }
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return JSON.parse(response.text().trim());
    } catch (error) {
      console.error('Error generating buyer response:', error);
      return {
        message: "Thank you for your quote. We're reviewing all proposals and will respond soon.",
        proposedChanges: {}
      };
    }
  }

  // Helper functions
  calculateBasePrice(productName, quantity) {
    // Simple pricing logic - in real app, use market data
    const priceMap = {
      'tomato sauce': 2.50,
      'ketchup': 3.00,
      'mustard': 2.80,
      'mayonnaise': 3.20,
      'barbecue sauce': 3.50
    };

    const basePrice = priceMap[productName.toLowerCase()] || 2.00;

    // Volume discount
    if (quantity > 1000) return basePrice * 0.9;
    if (quantity > 500) return basePrice * 0.95;
    return basePrice;
  }

  getVendorPriceMultiplier(vendor) {
    // Higher rated vendors can charge more
    if (vendor.rating >= 4.8) return 1.1;
    if (vendor.rating >= 4.5) return 1.05;
    if (vendor.rating >= 4.0) return 1.0;
    return 0.95;
  }

  generateVendorNotes(vendor) {
    const notes = [
      `Trusted supplier with ${vendor.rating}/5 rating`,
      `Minimum order value: $${vendor.minOrderValue}`,
      `Payment terms: ${vendor.paymentTerms}`,
      vendor.verified ? 'Verified vendor' : 'Verification pending'
    ];
    return notes.join('. ');
  }

  isVendorInterested(request, vendor) {
    // Simple logic - vendors interested if order meets minimum and they have capacity
    return request.quantity * 2.5 >= vendor.minOrderValue;
  }
}

module.exports = NegotiationAgent;