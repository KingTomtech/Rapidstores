# 🏪 Rapid Stores and General Dealers Ltd - Digital Platform

## 📍 Location: Mansa, Zambia

A complete digital platform for a multi-sector Zambian business operating in retail, manufacturing (mattresses/foam), and supply & logistics.

---

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 📋 Default Admin Credentials

- **Phone**: +260970000000
- **Password**: admin123

⚠️ Change these in production!

---

## 🏗️ Architecture Overview

### Backend (Node.js + Express + SQLite)
- RESTful API
- JWT Authentication
- SQLite database (easy deployment)
- AI-powered features

### Frontend (React + Vite + TailwindCSS)
- Mobile-first design
- Optimized for low bandwidth
- WhatsApp integration
- Clean, fast UI

---

## 📦 Core Features Implemented

### ✅ MVP Features
1. **Product Catalog** - Browse by category, search, filter
2. **Shopping Cart** - Add/remove items, quantity management
3. **User Authentication** - Phone-based login/registration
4. **Order System** - Create orders, track status
5. **Admin Dashboard** - Manage products, orders, view analytics
6. **WhatsApp Integration** - Order via WhatsApp button
7. **Voucher System** - Discount codes
8. **AI Assistant** - Customer support chatbot

### 🤖 AI Features
- Customer Assistant (product Q&A)
- Product Recommendations
- Inventory Alerts
- Marketing Content Generator

---

## 📁 Project Structure

```
rapid-stores/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   ├── services/       # Business logic
│   │   ├── ai/             # AI agents
│   │   ├── utils/          # Utilities & seeders
│   │   └── server.js       # Entry point
│   ├── data/               # SQLite database
│   └── uploads/            # Product images
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (auth, cart)
│   │   ├── utils/          # API client
│   │   └── App.jsx         # Main app
│   └── public/             # Static assets
│
└── docs/
    └── ARCHITECTURE.md     # Full architecture docs
```

---

## 🔌 API Endpoints

### Public
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `GET /api/products/categories` - Get categories
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/orders/whatsapp` - Generate WhatsApp order

### Protected (Customer)
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add to cart
- `PUT /api/cart/items/:id` - Update cart
- `DELETE /api/cart/items/:id` - Remove from cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

### Admin Only
- `GET /api/admin/orders` - All orders
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/orders/admin/stats` - Dashboard stats
- `GET /api/orders/admin/analytics/sales` - Sales analytics

---

## 💳 Payment Integration (Ready)

The system is ready for mobile money integration:
- MTN Mobile Money
- Airtel Money
- Zamtel Kwacha
- Lenco Pay API

Configure in `.env`:
```
LENCO_API_KEY=your_key
LENCO_API_SECRET=your_secret
```

---

## 📱 WhatsApp Integration

Orders can be placed directly via WhatsApp:
- Pre-filled message with cart items
- Total amount
- Customer details

WhatsApp number configured in `.env`:
```
WHATSAPP_NUMBER=260970000000
```

---

## 🎨 Design System

### Colors
- Primary: `#16A34A` (Green)
- Secondary: `#F59E0B` (Amber)
- Accent: `#DC2626` (Red)

### Components
- Mobile-optimized navigation
- Product cards with stock indicators
- Responsive grid layouts
- Touch-friendly buttons

---

## 🔐 Security Features

- JWT token authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation
- CORS protection
- Rate limiting ready

---

## 📊 Database Schema

### Tables
- `users` - Customer & admin accounts
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Order line items
- `carts` - Shopping carts
- `cart_items` - Cart line items
- `vouchers` - Discount codes
- `inventory_alerts` - Low stock alerts

---

## 🚀 Deployment

### Option 1: Render/Railway (Recommended)
1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy!

### Option 2: VPS (Ubuntu)
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <your-repo>
cd rapid-stores

# Install & build
npm install --prefix backend
npm install --prefix frontend
npm run build --prefix frontend

# Run with PM2
npm install -g pm2
pm2 start backend/src/server.js --name rapid-api
```

---

## 📈 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Multi-vendor marketplace
- [ ] Subscription grocery boxes
- [ ] Delivery tracking system
- [ ] SMS notifications
- [ ] Email marketing
- [ ] Advanced analytics
- [ ] LLM-powered chatbot

---

## 📞 Support

For questions or issues:
- Email: admin@rapidstores.co.zm
- WhatsApp: +260970000000
- Location: Mansa, Zambia

---

## 📄 License

© 2025 Rapid Stores and General Dealers Ltd. All rights reserved.

---

Built with ❤️ for Zambia 🇿🇲
