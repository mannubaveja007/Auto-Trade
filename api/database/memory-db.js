// Simple in-memory database for MVP
const { Vendor, Buyer, ProcurementRequest, Quote, NegotiationMessage, Order } = require('../models');

class MemoryDatabase {
  constructor() {
    this.vendors = new Map();
    this.buyers = new Map();
    this.procurementRequests = new Map();
    this.quotes = new Map();
    this.negotiationMessages = new Map();
    this.orders = new Map();

    this.initializeSampleData();
  }

  // Vendor operations
  addVendor(vendorData) {
    const vendor = new Vendor(vendorData);
    this.vendors.set(vendor.id, vendor);
    return vendor;
  }

  getVendor(id) {
    return this.vendors.get(id);
  }

  getAllVendors() {
    return Array.from(this.vendors.values());
  }

  getVendorsByCategory(category) {
    return Array.from(this.vendors.values()).filter(v => v.categories.includes(category));
  }

  // Buyer operations
  addBuyer(buyerData) {
    const buyer = new Buyer(buyerData);
    this.buyers.set(buyer.id, buyer);
    return buyer;
  }

  getBuyer(id) {
    return this.buyers.get(id);
  }

  getAllBuyers() {
    return Array.from(this.buyers.values());
  }

  // Procurement Request operations
  addProcurementRequest(requestData) {
    const request = new ProcurementRequest(requestData);
    this.procurementRequests.set(request.id, request);
    return request;
  }

  getProcurementRequest(id) {
    return this.procurementRequests.get(id);
  }

  getAllProcurementRequests() {
    return Array.from(this.procurementRequests.values());
  }

  getOpenProcurementRequests() {
    return Array.from(this.procurementRequests.values()).filter(r => r.status === 'open');
  }

  updateProcurementRequestStatus(id, status) {
    const request = this.procurementRequests.get(id);
    if (request) {
      request.status = status;
      request.updatedAt = new Date();
    }
    return request;
  }

  // Quote operations
  addQuote(quoteData) {
    const quote = new Quote(quoteData);
    this.quotes.set(quote.id, quote);
    return quote;
  }

  getQuote(id) {
    return this.quotes.get(id);
  }

  getQuotesByRequest(requestId) {
    return Array.from(this.quotes.values()).filter(q => q.requestId === requestId);
  }

  getQuotesByVendor(vendorId) {
    return Array.from(this.quotes.values()).filter(q => q.vendorId === vendorId);
  }

  updateQuoteStatus(id, status) {
    const quote = this.quotes.get(id);
    if (quote) {
      quote.status = status;
    }
    return quote;
  }

  // Negotiation Message operations
  addNegotiationMessage(messageData) {
    const message = new NegotiationMessage(messageData);
    this.negotiationMessages.set(message.id, message);

    // Add to quote's negotiations array
    const quote = this.quotes.get(message.quoteId);
    if (quote) {
      quote.negotiations.push(message);
    }

    return message;
  }

  getNegotiationsByQuote(quoteId) {
    return Array.from(this.negotiationMessages.values()).filter(m => m.quoteId === quoteId);
  }

  // Order operations
  addOrder(orderData) {
    const order = new Order(orderData);
    this.orders.set(order.id, order);
    return order;
  }

  getOrder(id) {
    return this.orders.get(id);
  }

  getAllOrders() {
    return Array.from(this.orders.values());
  }

  getOrdersByBuyer(buyerId) {
    return Array.from(this.orders.values()).filter(o => o.buyerId === buyerId);
  }

  getOrdersByVendor(vendorId) {
    return Array.from(this.orders.values()).filter(o => o.vendorId === vendorId);
  }

  // Initialize with sample data
  initializeSampleData() {
    // Sample vendors
    this.addVendor({
      name: "Fresh Ingredients Co",
      email: "sales@freshingredients.com",
      phone: "+1-555-0101",
      address: "123 Food Street, Chicago, IL",
      categories: ["food-ingredients", "condiments", "spices"],
      rating: 4.5,
      verified: true,
      minOrderValue: 500,
      paymentTerms: "NET 30"
    });

    this.addVendor({
      name: "Premium Sauce Suppliers",
      email: "orders@premiumsauce.com",
      phone: "+1-555-0102",
      address: "456 Sauce Ave, Los Angeles, CA",
      categories: ["food-ingredients", "condiments"],
      rating: 4.8,
      verified: true,
      minOrderValue: 1000,
      paymentTerms: "NET 15"
    });

    this.addVendor({
      name: "Bulk Food Solutions",
      email: "contact@bulkfood.com",
      phone: "+1-555-0103",
      address: "789 Industrial Blvd, Houston, TX",
      categories: ["food-ingredients", "packaging", "bulk-supplies"],
      rating: 4.2,
      verified: true,
      minOrderValue: 2000,
      paymentTerms: "NET 45"
    });

    // Sample buyer (McDonald's)
    this.addBuyer({
      companyName: "McDonald's Corp",
      email: "procurement@mcdonalds.com",
      phone: "+1-555-0201",
      address: "110 N Carpenter St, Chicago, IL",
      industry: "restaurant",
      creditRating: "AAA",
      paymentHistory: []
    });

    console.log("Sample data initialized:");
    console.log(`- ${this.vendors.size} vendors`);
    console.log(`- ${this.buyers.size} buyers`);
  }
}

module.exports = new MemoryDatabase();