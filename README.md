# AutoTrade MVP - AI-Powered B2B Procurement Platform

AutoTrade is an AI-powered B2B procurement platform that automates the traditional manual procurement process. Instead of employees spending hours emailing vendors and negotiating prices, AutoTrade uses AI agents to find vendors, negotiate deals, and manage the entire procurement workflow.

## 🚀 Features

- **AI Vendor Matching**: Automatically finds and contacts suitable vendors based on procurement requirements
- **Smart Negotiation**: AI agents handle price negotiations and terms discussions
- **Real-time Tracking**: Monitor procurement requests, quotes, and negotiations in real-time
- **Secure Transactions**: Built for enterprise-grade security and reliability
- **Multi-vendor Quotes**: Compare multiple vendor proposals side-by-side

## 🏗️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Prisma ORM
- **OpenAI GPT** for AI negotiations
- **Winston** for logging
- **Helmet** for security

### Frontend
- **React** with Vite
- **Modern CSS** with responsive design
- **Axios** for API calls
- **Date-fns** for date formatting

## 📋 Prerequisites

Before running the application, make sure you have:

- Node.js (v18 or higher)
- PostgreSQL database
- OpenAI API key (for AI features)

## 🛠️ Setup Instructions

### 1. Clone and Navigate
```bash
cd autotrade-mvp
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Edit .env file with your credentials:
# DATABASE_URL="postgresql://username:password@localhost:5432/autotrade_mvp"
# OPENAI_API_KEY="your_openai_api_key_here"
# PORT=3001
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create and migrate database
npx prisma migrate dev --name init

# The server will automatically seed sample data on first run
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Server will run on http://localhost:3001

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

**🎨 Premium Frontend Features:**
- Modern dashboard with smooth sidebar navigation
- Real-time chat-style negotiations with AI
- Animated quote cards with best price highlighting
- Dark mode toggle with system preference detection
- Toast notifications and micro-interactions
- Responsive design optimized for all devices

## 🎯 Demo Scenario: McDonald's Sauce Procurement

Here's how to test the AutoTrade MVP with a realistic B2B procurement scenario:

### Step 1: Create a Procurement Request
1. Go to http://localhost:3000
2. Click "Create Request" tab
3. Fill out the form:
   - **Company**: McDonald's Corp
   - **Product**: Tomato Sauce
   - **Category**: Food Ingredients
   - **Quantity**: 1000
   - **Unit**: Liters
   - **Delivery Date**: Pick a future date
   - **Max Budget**: 5000
   - **Urgency**: High
   - **Specifications**: "Food grade, no preservatives, organic preferred"

4. Click "Create Request & Find Vendors"

### Step 2: AI Vendor Matching
The system will automatically:
- Find suitable vendors in the "food-ingredients" category
- Generate personalized outreach messages
- Simulate vendor responses with realistic quotes
- Create initial quotes with competitive pricing

### Step 3: View and Compare Quotes
1. Click "All Requests" tab to see your procurement request
2. Click "View Quotes & Negotiations" to see vendor responses
3. Compare quotes from different vendors:
   - Fresh Ingredients Co
   - Premium Sauce Suppliers
   - Bulk Food Solutions

### Step 4: AI-Powered Negotiations
1. Click on any quote to select it
2. In the negotiations section, send messages like:
   - "Can you reduce the price to $2000?"
   - "Can you deliver by Friday instead?"
   - "Do you offer volume discounts?"

3. Watch as AI agents respond on behalf of vendors with realistic counter-offers

### Step 5: Accept Quote and Place Order
1. When satisfied with a quote, click "Accept Quote"
2. This creates an order and completes the procurement process

## 🔧 API Endpoints

### Procurement Requests
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get specific request

### Vendors
- `GET /api/vendors` - List all vendors
- `GET /api/vendors?category=food-ingredients` - Filter by category

### Quotes & Negotiations
- `GET /api/quotes?requestId=:id` - Get quotes for request
- `POST /api/negotiations` - Send negotiation message
- `GET /api/negotiations/:quoteId` - Get negotiation history

### AI Operations
- `POST /api/ai/match-vendors/:requestId` - Trigger AI vendor matching
- `POST /api/ai/negotiate/:quoteId` - AI negotiation handling

## 💡 Business Value Proposition

AutoTrade addresses the pain point of manual B2B procurement by:

1. **Time Savings**: Reduces 15-20 hours/week of manual procurement work
2. **Cost Reduction**: Saves $50,000-200,000/year in employee time costs
3. **Better Deals**: AI negotiation gets competitive pricing automatically
4. **Reduced Errors**: Eliminates manual mistakes in orders and pricing
5. **Cash Flow**: Faster procurement cycles improve cash flow management

## 🔮 Future Enhancements (Yellow Network Integration)

When integrated with Yellow Network's technology:

- **Private Transactions**: Sensitive pricing and supplier relationships stay confidential
- **Multi-chain Payments**: Pay vendors on their preferred blockchain (Polygon, Celo, Base)
- **State Channels**: Fast, cheap settlement for repeat orders
- **Tamper-proof Records**: Immutable audit trail for compliance
- **Cross-chain Settlement**: Seamless payments across different networks

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -h localhost -U your_username -d autotrade_mvp

# Reset database if needed
npx prisma migrate reset
```

### AI Features Not Working
- Ensure OPENAI_API_KEY is set in .env
- Check OpenAI API quota and billing
- AI features will gracefully degrade if API is unavailable

### Port Conflicts
- Backend: Change PORT in .env file
- Frontend: Change port in vite.config.js

## 📄 License

This is an MVP demonstration project. For production use, additional security, scalability, and compliance features would be required.

---

🤖 **AutoTrade MVP** - Revolutionizing B2B procurement with AI automation