# Rapid Stores Platform - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Cloudflare account (free)
- Supabase account (free)

---

## Step 1: Setup Supabase Database

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your region (recommend Africa/Cape Town for Zambia)
   - Set database password (save it!)

2. **Run Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy entire content from `docs/supabase-schema.sql`
   - Paste and run
   - Wait for success message

3. **Get Credentials**
   - Go to Settings → API
   - Copy:
     - Project URL (e.g., `https://xyzcompany.supabase.co`)
     - `anon` public key
     - `service_role` key (keep secret!)

4. **Create Admin User**
   - Go to Authentication → Users
   - Click "Add User"
   - Email: `admin@rapidstores.co.zm`
   - Password: `admin123` (change later!)
   - After creation, run this in SQL Editor:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@rapidstores.co.zm';
   ```

---

## Step 2: Setup Backend (Cloudflare Worker)

```bash
cd backend

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Set secrets (paste your Supabase credentials when prompted)
npx wrangler secret put SUPABASE_URL
# Enter: https://your-project.supabase.co

npx wrangler secret put SUPABASE_KEY
# Enter: your-service-role-key (NOT anon key!)

# Start development server
npm run dev
```

Backend running on: http://localhost:8787

Test it: Open http://localhost:8787/health in browser

---

## Step 3: Setup Frontend (React App)

Open new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8787" > .env.local

# Start development server
npm run dev
```

Frontend running on: http://localhost:5173

---

## Step 4: Test the Platform

1. **Open Browser**: http://localhost:5173
2. **Browse Products**: You should see sample products
3. **Login as Admin**:
   - Click "Login"
   - Email: `admin@rapidstores.co.zm`
   - Password: `admin123`
4. **Access Admin Dashboard**: Click your name → "Admin Dashboard"
5. **Test Features**:
   - View orders
   - Check low stock alerts
   - Add new product
   - Create voucher code

---

## Step 5: Deploy to Production

### Deploy Backend

```bash
cd backend

# Deploy to Cloudflare Workers
npm run deploy
```

Note the URL: `https://rapid-stores-api.your-subdomain.workers.dev`

### Deploy Frontend

```bash
cd frontend

# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=rapid-stores
```

Update `.env.local`:
```
VITE_API_URL=https://your-worker.workers.dev
```

Rebuild and redeploy.

---

## 📱 WhatsApp Configuration

Edit `backend/wrangler.toml`:

```toml
[vars]
WHATSAPP_NUMBER = "260970000000"  # Your business number
```

Redeploy backend after change.

---

## 🔧 Common Issues

### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS errors
- Ensure backend is running
- Check `wrangler.toml` has correct CORS origins

### Can't login
- Verify Supabase credentials are correct
- Check if admin user exists in Supabase dashboard
- Ensure RLS policies are active

### AI features not working
- Workers AI requires paid plan ($5/month minimum)
- For free tier, AI routes will return fallback responses

---

## 📊 Sample Data

The schema includes sample data:
- 15 products (mattresses, groceries, accessories)
- 3 voucher codes (WELCOME10, RAPID50, MATTRESS20)

To add more products:
1. Login as admin
2. Use API or create admin product management page
3. Or insert directly in Supabase SQL Editor

---

## 🎯 Next Steps

1. **Customize Branding**
   - Update logo in `frontend/src/components/Navbar.jsx`
   - Change colors in `tailwind.config.js`

2. **Add Real Products**
   - Replace sample products with actual inventory
   - Upload product images to Supabase Storage

3. **Configure Payments**
   - Integrate mobile money APIs (MTN, Airtel)
   - Add Lenco Pay integration

4. **Setup Domain**
   - Connect custom domain in Cloudflare Pages
   - Configure SSL (automatic with Cloudflare)

5. **Launch!**
   - Test thoroughly
   - Share WhatsApp link with customers
   - Monitor analytics

---

## 🆘 Need Help?

**Documentation**: See `docs/ARCHITECTURE.md`

**Supabase Docs**: https://supabase.com/docs

**Cloudflare Docs**: https://developers.cloudflare.com

**Hono Framework**: https://hono.dev/docs

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Admin user created with admin role
- [ ] Backend deployed to Cloudflare Workers
- [ ] Frontend deployed to Cloudflare Pages
- [ ] WhatsApp number configured
- [ ] Test order placed successfully
- [ ] Admin can manage products
- [ ] Mobile money integration ready (future)

---

**Built with ❤️ for Rapid Stores, Mansa, Zambia 🇿🇲**
