# Rapid Stores Digital Platform

## 🏪 Business Overview

**Rapid Stores and General Dealers Ltd** is a multi-sector business in Mansa, Zambia, operating since 2018 in:
- General Retail (household goods, essentials)
- Manufacturing (foam mattresses, spring mattresses, divan bases)
- Supply & Logistics (transportation, bulk supply)

---

## 🚀 Architecture Overview

### Serverless Stack on Cloudflare + Supabase

```
┌─────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES                         │
│                  Frontend Hosting                           │
│              (React + Vite + TailwindCSS)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   CLOUDFLARE WORKERS                        │
│                  Backend API (Hono)                         │
│            ┌──────────────┬──────────────┐                 │
│            │  Workers AI  │   R2 Bucket  │                 │
│            │  (LLAMA 3)   │   (Images)   │                 │
│            └──────────────┴──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                               │
│          ┌─────────────────────────────────┐                │
│          │  PostgreSQL Database            │                │
│          │  - Auth (Email/Phone)           │                │
│          │  - Real-time subscriptions      │                │
│          │  - Row Level Security           │                │
│          └─────────────────────────────────┘                │
│          ┌─────────────────────────────────┐                │
│          │  Storage (Product Images)       │                │
│          └─────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
rapid-stores/
├── backend/                    # Cloudflare Worker (Hono API)
│   ├── src/
│   │   ├── index.ts           # Main entry point & routes
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Supabase client, helpers
│   │   ├── ai/                # AI agents (chat, recommendations)
│   │   └── middleware/        # Auth middleware
│   ├── package.json
│   └── wrangler.toml          # Cloudflare config
│
├── frontend/                   # React SPA (Cloudflare Pages)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context (Auth, Cart)
│   │   ├── utils/             # API client
│   │   └── App.jsx            # Main app component
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── docs/
    └── supabase-schema.sql    # Database schema
```

---

## 🗄️ Database Schema (Supabase)

### Core Tables

1. **profiles** - User profiles with roles
2. **products** - Product catalog with manufacturing flag
3. **carts** & **cart_items** - Shopping cart system
4. **orders** & **order_items** - Order management
5. **vouchers** - Discount code system
6. **manufacturing_orders** - Custom manufacturing tracking

### Key Features
- Row Level Security (RLS) for data protection
- Automatic profile creation on signup
- Triggers for updated_at timestamps
- Indexes for performance optimization

---

## 🔌 API Endpoints

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/categories` | Get all categories |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/orders/whatsapp` | Generate WhatsApp order |

### Protected Routes (Customer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/:id` | Update cart item |
| DELETE | `/api/cart/items/:id` | Remove from cart |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get user's orders |
| POST | `/api/vouchers/validate` | Validate voucher code |

### Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | Get all orders |
| PUT | `/api/orders/:id/status` | Update order status |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/analytics/sales` | Sales analytics |
| POST | `/api/admin/vouchers` | Create voucher |
| GET | `/api/admin/vouchers` | List vouchers |

### AI Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Customer support chat |
| POST | `/api/ai/recommendations` | Product recommendations |
| GET | `/api/ai/inventory-alerts` | Low stock alerts |
| POST | `/api/ai/marketing-content` | Generate marketing copy |

---

## 🤖 AI Features

### 1. Customer Assistant
- Powered by Llama-3-8B via Workers AI
- Answers product questions
- Provides order status info
- Zambian context-aware responses

### 2. Sales Agent
- Analyzes cart contents
- Suggests complementary products
- Creates bundle recommendations

### 3. Inventory Assistant
- Monitors stock levels
- Generates priority alerts
- Suggests restocking actions

### 4. Marketing Agent
- Creates WhatsApp status updates
- Generates promotional messages
- Writes product highlights

---

## 💳 Payment Integration

### Supported Methods
1. **Mobile Money** (MTN, Airtel, Zamtel)
2. **Voucher Codes**
3. **Cash on Delivery/Pickup**

### Integration Flow
```
1. User places order → Status: "pending"
2. Select payment method
3. For mobile money:
   - Initiate payment via provider API
   - Webhook confirms payment
   - Order status → "paid"
4. For vouchers:
   - Validate code
   - Apply discount
   - Mark as paid
```

---

## 📱 WhatsApp Integration

### Order via WhatsApp Flow
1. User adds items to cart (or uses local cart without login)
2. Clicks "Order via WhatsApp" button
3. System generates pre-filled message:
   ```
   🛒 New Order #abc123
   
   - Single Foam Mattress x1 = ZMW 450.00
   - Foam Pillow x2 = ZMW 170.00
   
   Total: ZMW 620.00
   
   📞 Phone: +260970000000
   📍 Address: Mansa
   💳 Payment: Mobile Money
   
   Please confirm my order! Thank you.
   ```
4. Opens WhatsApp with message ready to send

---

## 🎨 Design System

### Colors
- **Primary**: `#16A34A` (Green) - Trust, growth
- **Secondary**: `#F59E0B` (Amber) - Energy, warmth
- **Accent**: `#DC2626` (Red) - Urgency, alerts

### Typography
- Font: Inter (clean, modern, readable on mobile)
- Base size: 14px on mobile, 16px on desktop

### Mobile-First Optimizations
- Touch-friendly buttons (min 44px height)
- Responsive grid layouts
- Lazy loading images
- Minimal JavaScript bundle
- Offline-capable (future PWA)

---

## 🔐 Security

### Authentication
- Supabase Auth (JWT tokens)
- Email or phone-based login
- Password hashing (bcrypt)

### Authorization
- Role-based access control (customer/admin)
- Row Level Security (RLS) on all tables
- Protected API routes

### Data Protection
- HTTPS everywhere
- CORS restrictions
- Input validation (Zod schemas)
- SQL injection prevention (parameterized queries)

---

## 🚀 Deployment Guide

### Prerequisites
1. Cloudflare account (free tier works)
2. Supabase account (free tier works)
3. Node.js 18+

### Step 1: Setup Supabase

1. Create new project at [supabase.com](https://supabase.com)
2. Run SQL schema from `docs/supabase-schema.sql`
3. Note your:
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJhbG...`
   - Service Role Key: `eyJhbG...` (keep secret!)

4. Create admin user:
   ```sql
   -- Via Supabase Auth UI or SQL
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@rapidstores.co.zm';
   ```

### Step 2: Deploy Backend (Cloudflare Worker)

```bash
cd backend

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Set secrets
npx wrangler secret put SUPABASE_URL
# Enter: https://your-project.supabase.co

npx wrangler secret put SUPABASE_KEY
# Enter: your-service-role-key

# Deploy
npm run deploy
```

Note the deployed URL: `https://rapid-stores-api.your-subdomain.workers.dev`

### Step 3: Deploy Frontend (Cloudflare Pages)

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local (for development)
echo "VITE_API_URL=https://your-worker.workers.dev" > .env.local

# Build
npm run build

# Deploy to Pages
npx wrangler pages deploy dist --project-name=rapid-stores
```

Or connect GitHub repo for automatic deployments.

### Step 4: Configure Environment

Update `backend/wrangler.toml`:
```toml
[vars]
WHATSAPP_NUMBER = "260970000000"
CURRENCY = "ZMW"
```

Update frontend `.env`:
```
VITE_API_URL=https://your-worker.workers.dev
```

---

## 📊 Monitoring & Analytics

### Built-in Analytics
- Order statistics dashboard
- Sales trends (daily/weekly/monthly)
- Low stock alerts
- Best-selling products

### External Tools (Optional)
- Cloudflare Analytics
- Supabase Dashboard
- Google Analytics (frontend)

---

## 🔄 Development Workflow

### Local Development

**Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:8787
```

**Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Database Migrations
```bash
# Generate new migration
npx wrangler d1 migrations generate rapid-db migration_name

# Apply locally
npx wrangler d1 migrations apply rapid-db --local

# Apply to production
npx wrangler d1 migrations apply rapid-db --remote
```

---

## 📈 Future Enhancements

### Phase 2
- [ ] Full delivery tracking system
- [ ] SMS notifications (via Twilio/Africa's Talking)
- [ ] Email marketing integration
- [ ] Multi-vendor marketplace
- [ ] Subscription grocery boxes

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Advanced AI chatbot with memory
- [ ] Integration with external vendors
- [ ] Loyalty points system
- [ ] Advanced analytics dashboard

---

## 🆘 Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure backend CORS allows your frontend domain
- Check `wrangler.toml` and `index.ts` CORS settings

**2. Authentication Failures**
- Verify Supabase URL and keys are correct
- Check RLS policies in Supabase dashboard

**3. AI Not Working**
- Ensure Workers AI is enabled on your Cloudflare plan
- Check AI binding in `wrangler.toml`

**4. Database Connection Issues**
- Verify Supabase project is active
- Check network connectivity

---

## 📞 Support

**Rapid Stores and General Dealers Ltd**
- 📍 Location: Mansa, Zambia
- 📞 Phone: +260 970 000 000
- 📧 Email: admin@rapidstores.co.zm

**Technical Support**
- GitHub Issues
- Email: tech@rapidstores.co.zm

---

## 📄 License

© 2025 Rapid Stores and General Dealers Ltd. All rights reserved.

Built with ❤️ for Zambia 🇿🇲
