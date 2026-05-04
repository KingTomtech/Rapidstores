# Rapid Stores and General Dealers Ltd - Platform Architecture

## 🏢 Business Overview
- **Location**: Mansa, Zambia
- **Founded**: 2018
- **Sectors**: Retail, Manufacturing (mattresses/foam), Supply & Logistics

## 🎯 System Goals
1. Mobile-first design for Zambian users
2. WhatsApp-first experience
3. Low bandwidth optimization
4. Mobile money integration (MTN, Airtel, Zamtel)
5. Simple, scalable architecture

---

## 🧱 Tech Stack

### Frontend
- **React** with Vite (fast builds, small bundle)
- **TailwindCSS** for styling (utility-first, small CSS footprint)
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management (lightweight)

### Backend
- **Node.js + Express** (familiar, easy to deploy)
- **SQLite** for development, **PostgreSQL** for production
- **JWT** for authentication
- **Multer** for file uploads

### Database Schema

#### Users Table
```sql
id (UUID, PK)
phone (VARCHAR, UNIQUE, INDEX)
name (VARCHAR)
email (VARCHAR, NULLABLE)
password_hash (VARCHAR, NULLABLE)
role (ENUM: 'customer', 'admin')
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Products Table
```sql
id (UUID, PK)
name (VARCHAR)
description (TEXT)
price (DECIMAL)
stock_quantity (INTEGER)
category (ENUM: 'groceries', 'electronics', 'furniture', 'mattresses', 'foam_products')
image_url (VARCHAR)
is_manufactured (BOOLEAN)
production_status (ENUM: 'not_applicable', 'pending', 'in_production', 'ready')
custom_options (JSON) -- for mattress sizes, etc.
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Orders Table
```sql
id (UUID, PK)
user_id (UUID, FK -> Users.id)
status (ENUM: 'pending', 'paid', 'processing', 'ready', 'delivered')
total_amount (DECIMAL)
payment_method (ENUM: 'mtn', 'airtel', 'zamtel', 'lenco', 'cash')
payment_status (ENUM: 'pending', 'completed', 'failed')
delivery_method (ENUM: 'pickup', 'delivery')
delivery_address (TEXT, NULLABLE)
phone_number (VARCHAR)
whatsapp_order (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### OrderItems Table
```sql
id (UUID, PK)
order_id (UUID, FK -> Orders.id)
product_id (UUID, FK -> Products.id)
quantity (INTEGER)
price_at_purchase (DECIMAL)
```

#### Vouchers Table
```sql
id (UUID, PK)
code (VARCHAR, UNIQUE, INDEX)
discount_type (ENUM: 'percentage', 'fixed')
discount_value (DECIMAL)
min_order_amount (DECIMAL)
max_uses (INTEGER)
current_uses (INTEGER)
is_active (BOOLEAN)
expires_at (TIMESTAMP, NULLABLE)
created_at (TIMESTAMP)
```

#### InventoryAlerts Table
```sql
id (UUID, PK)
product_id (UUID, FK -> Products.id)
threshold (INTEGER)
is_triggered (BOOLEAN)
created_at (TIMESTAMP)
```

---

## 🔌 API Structure

### Public Routes
```
GET  /api/products              - List all products (with filters)
GET  /api/products/:id          - Get single product
GET  /api/categories            - List categories
POST /api/auth/register         - Register user (phone-based)
POST /api/auth/login            - Login
POST /api/orders/whatsapp       - Generate WhatsApp order link
```

### Protected Routes (Customer)
```
GET  /api/cart                  - Get user cart
POST /api/cart/items            - Add to cart
PUT  /api/cart/items/:id        - Update cart item
DELETE /api/cart/items/:id      - Remove from cart
POST /api/orders                - Create order
GET  /api/orders                - Get user orders
GET  /api/orders/:id            - Get single order
POST /api/vouchers/validate     - Validate voucher code
```

### Admin Routes
```
GET    /api/admin/products             - List all products
POST   /api/admin/products             - Create product
PUT    /api/admin/products/:id         - Update product
DELETE /api/admin/products/:id         - Delete product
GET    /api/admin/orders               - List all orders
PUT    /api/admin/orders/:id           - Update order status
GET    /api/admin/analytics/sales      - Sales analytics
GET    /api/admin/analytics/products   - Best-selling products
POST   /api/admin/vouchers             - Create voucher
GET    /api/admin/vouchers             - List vouchers
PUT    /api/admin/vouchers/:id         - Toggle voucher status
GET    /api/admin/inventory/alerts     - Low stock alerts
POST   /api/admin/manufacturing/update - Update production status
```

### AI Routes
```
POST /api/ai/chat          - Customer assistant chat
POST /api/ai/recommend     - Product recommendations
POST /api/ai/inventory     - Inventory analysis
POST /api/ai/marketing     - Generate marketing content
```

---

## 📱 Frontend Pages

### Public Pages
- `/` - Home (featured products, categories)
- `/products` - Product catalog with filters
- `/products/:id` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/login` - Login/Register
- `/order-via-whatsapp` - WhatsApp order generator

### Customer Pages (Protected)
- `/profile` - User profile
- `/orders` - Order history
- `/orders/:id` - Order details

### Admin Pages (Protected)
- `/admin/dashboard` - Overview, analytics
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/inventory` - Inventory tracking
- `/admin/vouchers` - Voucher management
- `/admin/manufacturing` - Production tracking
- `/admin/customers` - Customer list

---

## 🤖 AI Agent Modules

### 1. Customer Assistant
- **Purpose**: Answer product questions, check availability
- **Implementation**: Simple rule-based + keyword matching (Phase 1)
- **Future**: LLM integration for natural language

### 2. Sales Agent
- **Purpose**: Suggest bundles, upsell items
- **Logic**: 
  - If cart has mattress → suggest pillows, bed sheets
  - If cart has groceries over ZMW 500 → suggest bulk discount

### 3. Inventory Assistant
- **Purpose**: Alert low stock, suggest restocking
- **Logic**: 
  - Check stock_quantity < threshold
  - Send notification to admin dashboard

### 4. Marketing Agent
- **Purpose**: Generate WhatsApp statuses, promotional messages
- **Templates**:
  - Daily deals
  - New product announcements
  - Low stock clearance

---

## 💳 Payment Flow

### Mobile Money Integration
1. User selects payment method (MTN/Airtel/Zamtel)
2. System generates payment request via Lenco Pay API
3. User receives USSD prompt on phone
4. User enters PIN to confirm
5. Webhook confirms payment to backend
6. Order status updated to "paid"

### Lenco Pay API Endpoints
```
POST https://api.lencopay.co.zm/v1/payment/initiate
POST https://api.lencopay.co.zm/v1/payment/verify
GET  https://api.lencopay.co.zm/v1/payment/status/:transactionId
```

---

## 📲 WhatsApp Integration

### Order via WhatsApp Button
- Generates pre-filled message with:
  - Product names
  - Quantities
  - Total price
  - Customer phone number
- Opens WhatsApp with message ready to send

### Message Format
```
🛒 *New Order from Rapid Stores*

👤 Name: John Doe
📱 Phone: +26097XXXXXXX

📦 Items:
1. Foam Mattress (Single) x 2 - ZMW 1,200
2. Bed Sheets x 1 - ZMW 150

💰 Total: ZMW 1,350

📍 Delivery: Pickup at Mansa branch
```

### WhatsApp Number: `https://wa.me/260XXXXXXXXX?text=encoded_message`

---

## 🚀 Deployment Plan

### Phase 1: MVP (Week 1-2)
- [ ] Basic product catalog
- [ ] Cart + checkout
- [ ] User registration (phone-based)
- [ ] Admin panel (basic CRUD)
- [ ] WhatsApp order button
- [ ] Deploy to Render/Railway

### Phase 2: Payments (Week 3-4)
- [ ] Lenco Pay integration
- [ ] Mobile money USSD flow
- [ ] Payment webhooks
- [ ] Order status updates

### Phase 3: AI Features (Week 5-6)
- [ ] Customer assistant chatbot
- [ ] Product recommendations
- [ ] Inventory alerts
- [ ] Marketing message generator

### Phase 4: Advanced Features (Week 7-8)
- [ ] Manufacturing module
- [ ] Voucher system
- [ ] Analytics dashboard
- [ ] Delivery tracking

---

## 🔐 Security Measures

1. **Authentication**: JWT tokens with 7-day expiry
2. **Password Hashing**: bcrypt with salt rounds = 10
3. **Input Validation**: Joi schema validation
4. **Rate Limiting**: 100 requests per minute per IP
5. **CORS**: Restrict to frontend domain
6. **Environment Variables**: All secrets in .env
7. **SQL Injection Prevention**: Parameterized queries

---

## 📊 Analytics Dashboard

### Key Metrics
- Daily sales (ZMW)
- Orders count
- Average order value
- Best-selling products
- Customer retention rate
- Stock turnover rate

### Visualizations
- Line chart: Sales over time
- Bar chart: Products by category
- Pie chart: Payment method distribution
- Table: Recent orders

---

## 🌍 Local Optimization Strategies

1. **Image Optimization**: WebP format, lazy loading
2. **Code Splitting**: Load only necessary components
3. **Service Workers**: Cache products for offline viewing
4. **Minimal Dependencies**: Keep bundle size < 200KB
5. **CDN**: Use Cloudflare for static assets
6. **Database Indexing**: Optimize queries for phone lookups

---

## 📈 Future Expansion Roadmap

### Phase 5: Mobile App
- React Native app for Android/iOS
- Push notifications
- Offline mode

### Phase 6: Multi-vendor Marketplace
- Allow other sellers to list products
- Commission-based model
- Vendor dashboard

### Phase 7: Subscription Service
- Weekly/monthly grocery boxes
- Auto-renewal
- Customizable subscriptions

### Phase 8: External Integrations
- Accounting software (QuickBooks)
- SMS notifications
- Email marketing

---

## 🎨 Design System

### Colors
- Primary: #16A34A (Green - growth, trust)
- Secondary: #F59E0B (Amber - energy, warmth)
- Background: #FFFFFF (White)
- Text: #1F2937 (Dark gray)
- Accent: #DC2626 (Red - urgency, sales)

### Typography
- Headings: Inter Bold
- Body: Inter Regular
- Monospace: JetBrains Mono (for codes)

### Components
- Buttons: Rounded corners, bold colors
- Cards: Shadow, hover effects
- Forms: Large inputs, clear labels
- Navigation: Bottom nav for mobile, top nav for desktop

---

## ✅ Success Metrics

1. **User Adoption**: 500+ registered users in first month
2. **Order Volume**: 50+ orders per week
3. **Revenue**: ZMW 50,000+ monthly online sales
4. **Customer Satisfaction**: 4.5+ star rating
5. **System Uptime**: 99.5% availability
6. **Page Load Time**: < 3 seconds on 3G networks

---

*Document Version: 1.0*
*Last Updated: 2025*
*Author: AI Systems Architect*
