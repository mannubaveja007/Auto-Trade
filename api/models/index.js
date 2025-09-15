// Data models for AutoTrade MVP

// Vendor model
class Vendor {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.categories = data.categories || []; // e.g., ["food-ingredients", "packaging", "maintenance"]
    this.rating = data.rating || 0;
    this.verified = data.verified || false;
    this.minOrderValue = data.minOrderValue || 0;
    this.paymentTerms = data.paymentTerms || "30 days"; // "NET 30", "COD", etc.
    this.createdAt = data.createdAt || new Date();
  }

  generateId() {
    return 'vendor_' + Math.random().toString(36).substr(2, 9);
  }
}

// Buyer model
class Buyer {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.companyName = data.companyName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.industry = data.industry; // "restaurant", "retail", "manufacturing"
    this.creditRating = data.creditRating || 'B';
    this.paymentHistory = data.paymentHistory || [];
    this.createdAt = data.createdAt || new Date();
  }

  generateId() {
    return 'buyer_' + Math.random().toString(36).substr(2, 9);
  }
}

// Procurement Request model
class ProcurementRequest {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.buyerId = data.buyerId;
    this.productName = data.productName;
    this.category = data.category;
    this.quantity = data.quantity;
    this.unit = data.unit; // "kg", "liters", "pieces"
    this.specifications = data.specifications || {};
    this.deliveryDate = data.deliveryDate;
    this.deliveryAddress = data.deliveryAddress;
    this.maxBudget = data.maxBudget;
    this.status = data.status || 'open'; // open, negotiating, awarded, completed, cancelled
    this.urgency = data.urgency || 'medium'; // low, medium, high
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  generateId() {
    return 'req_' + Math.random().toString(36).substr(2, 9);
  }
}

// Quote model for vendor responses
class Quote {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.requestId = data.requestId;
    this.vendorId = data.vendorId;
    this.unitPrice = data.unitPrice;
    this.totalPrice = data.totalPrice;
    this.deliveryDate = data.deliveryDate;
    this.paymentTerms = data.paymentTerms;
    this.notes = data.notes || '';
    this.status = data.status || 'pending'; // pending, accepted, rejected, countered
    this.validUntil = data.validUntil;
    this.createdAt = data.createdAt || new Date();
    this.negotiations = data.negotiations || []; // Array of negotiation messages
  }

  generateId() {
    return 'quote_' + Math.random().toString(36).substr(2, 9);
  }
}

// Negotiation Message model
class NegotiationMessage {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.quoteId = data.quoteId;
    this.sender = data.sender; // 'buyer', 'vendor', 'ai-agent'
    this.message = data.message;
    this.proposedChanges = data.proposedChanges || {}; // { price: 100, deliveryDate: "2024-01-15" }
    this.timestamp = data.timestamp || new Date();
  }

  generateId() {
    return 'msg_' + Math.random().toString(36).substr(2, 9);
  }
}

// Order model for finalized deals
class Order {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.requestId = data.requestId;
    this.quoteId = data.quoteId;
    this.buyerId = data.buyerId;
    this.vendorId = data.vendorId;
    this.finalPrice = data.finalPrice;
    this.deliveryDate = data.deliveryDate;
    this.paymentTerms = data.paymentTerms;
    this.status = data.status || 'confirmed'; // confirmed, shipped, delivered, paid, completed
    this.orderDate = data.orderDate || new Date();
    this.trackingInfo = data.trackingInfo || {};
  }

  generateId() {
    return 'order_' + Math.random().toString(36).substr(2, 9);
  }
}

module.exports = {
  Vendor,
  Buyer,
  ProcurementRequest,
  Quote,
  NegotiationMessage,
  Order
};