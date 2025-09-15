const { PrismaClient } = require('@prisma/client');

class PrismaDatabase {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('Connected to PostgreSQL database via Prisma');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  // Vendor operations
  async addVendor(vendorData) {
    return await this.prisma.vendor.create({
      data: vendorData
    });
  }

  async getVendor(id) {
    return await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        quotes: true,
        orders: true
      }
    });
  }

  async getAllVendors() {
    return await this.prisma.vendor.findMany({
      include: {
        quotes: true,
        orders: true
      }
    });
  }

  async getVendorsByCategory(category) {
    return await this.prisma.vendor.findMany({
      where: {
        categories: {
          has: category
        }
      },
      include: {
        quotes: true
      }
    });
  }

  // Buyer operations
  async addBuyer(buyerData) {
    return await this.prisma.buyer.create({
      data: buyerData
    });
  }

  async getBuyer(id) {
    return await this.prisma.buyer.findUnique({
      where: { id },
      include: {
        procurementRequests: true,
        orders: true
      }
    });
  }

  async getAllBuyers() {
    return await this.prisma.buyer.findMany({
      include: {
        procurementRequests: true,
        orders: true
      }
    });
  }

  // Procurement Request operations
  async addProcurementRequest(requestData) {
    // Convert deliveryDate string to Date object if needed
    if (typeof requestData.deliveryDate === 'string') {
      requestData.deliveryDate = new Date(requestData.deliveryDate);
    }

    return await this.prisma.procurementRequest.create({
      data: requestData,
      include: {
        buyer: true,
        quotes: true
      }
    });
  }

  async getProcurementRequest(id) {
    return await this.prisma.procurementRequest.findUnique({
      where: { id },
      include: {
        buyer: true,
        quotes: {
          include: {
            vendor: true,
            negotiations: true
          }
        },
        orders: true
      }
    });
  }

  async getAllProcurementRequests() {
    return await this.prisma.procurementRequest.findMany({
      include: {
        buyer: true,
        quotes: {
          include: {
            vendor: true
          }
        }
      }
    });
  }

  async getOpenProcurementRequests() {
    return await this.prisma.procurementRequest.findMany({
      where: { status: 'open' },
      include: {
        buyer: true,
        quotes: {
          include: {
            vendor: true
          }
        }
      }
    });
  }

  async updateProcurementRequestStatus(id, status) {
    return await this.prisma.procurementRequest.update({
      where: { id },
      data: { status }
    });
  }

  // Quote operations
  async addQuote(quoteData) {
    // Convert deliveryDate string to Date object if needed
    if (typeof quoteData.deliveryDate === 'string') {
      quoteData.deliveryDate = new Date(quoteData.deliveryDate);
    }
    if (typeof quoteData.validUntil === 'string') {
      quoteData.validUntil = new Date(quoteData.validUntil);
    }

    return await this.prisma.quote.create({
      data: quoteData,
      include: {
        vendor: true,
        request: true
      }
    });
  }

  async getQuote(id) {
    return await this.prisma.quote.findUnique({
      where: { id },
      include: {
        vendor: true,
        request: {
          include: {
            buyer: true
          }
        },
        negotiations: {
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    });
  }

  async getQuotesByRequest(requestId) {
    return await this.prisma.quote.findMany({
      where: { requestId },
      include: {
        vendor: true,
        negotiations: true
      }
    });
  }

  async getQuotesByVendor(vendorId) {
    return await this.prisma.quote.findMany({
      where: { vendorId },
      include: {
        request: {
          include: {
            buyer: true
          }
        },
        negotiations: true
      }
    });
  }

  async getAllQuotes() {
    return await this.prisma.quote.findMany({
      include: {
        vendor: true,
        request: {
          include: {
            buyer: true
          }
        },
        negotiations: true
      }
    });
  }

  async updateQuoteStatus(id, status) {
    return await this.prisma.quote.update({
      where: { id },
      data: { status }
    });
  }

  async updateQuote(id, data) {
    return await this.prisma.quote.update({
      where: { id },
      data
    });
  }

  // Negotiation Message operations
  async addNegotiationMessage(messageData) {
    return await this.prisma.negotiationMessage.create({
      data: messageData,
      include: {
        quote: {
          include: {
            vendor: true,
            request: {
              include: {
                buyer: true
              }
            }
          }
        }
      }
    });
  }

  async getNegotiationsByQuote(quoteId) {
    return await this.prisma.negotiationMessage.findMany({
      where: { quoteId },
      orderBy: {
        timestamp: 'asc'
      }
    });
  }

  // Order operations
  async addOrder(orderData) {
    // Convert deliveryDate string to Date object if needed
    if (typeof orderData.deliveryDate === 'string') {
      orderData.deliveryDate = new Date(orderData.deliveryDate);
    }

    return await this.prisma.order.create({
      data: orderData,
      include: {
        buyer: true,
        vendor: true,
        request: true,
        quote: true
      }
    });
  }

  async getOrder(id) {
    return await this.prisma.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        vendor: true,
        request: true,
        quote: true
      }
    });
  }

  async getAllOrders() {
    return await this.prisma.order.findMany({
      include: {
        buyer: true,
        vendor: true,
        request: true
      }
    });
  }

  async getOrdersByBuyer(buyerId) {
    return await this.prisma.order.findMany({
      where: { buyerId },
      include: {
        vendor: true,
        request: true
      }
    });
  }

  async getOrdersByVendor(vendorId) {
    return await this.prisma.order.findMany({
      where: { vendorId },
      include: {
        buyer: true,
        request: true
      }
    });
  }

  // Seed database with sample data
  async seedDatabase() {
    try {
      // Check if data already exists
      const vendorCount = await this.prisma.vendor.count();
      if (vendorCount > 0) {
        console.log('Database already has data, skipping seed');
        return;
      }

      // Create sample vendors
      const vendor1 = await this.addVendor({
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

      const vendor2 = await this.addVendor({
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

      const vendor3 = await this.addVendor({
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

      // Create sample buyer
      const buyer = await this.addBuyer({
        companyName: "McDonald's Corp",
        email: "procurement@mcdonalds.com",
        phone: "+1-555-0201",
        address: "110 N Carpenter St, Chicago, IL",
        industry: "restaurant",
        creditRating: "AAA",
        paymentHistory: []
      });

      console.log('Database seeded successfully!');
      console.log(`Created 3 vendors and 1 buyer`);

      return { vendors: [vendor1, vendor2, vendor3], buyer };

    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
}

module.exports = new PrismaDatabase();