import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/products.routes.js';
import orderRoutes from './routes/orders.routes.js';
import cartRoutes from './routes/cart.routes.js';
import voucherRoutes from './routes/vouchers.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/ai', aiRoutes);

// WhatsApp order endpoint (public)
app.post('/api/orders/whatsapp', (req, res) => {
  try {
    const { items, customer_name, phone_number, total } = req.body;

    if (!items || !customer_name || !phone_number) {
      return res.status(400).json({ error: 'Items, customer name, and phone number are required' });
    }

    // Format WhatsApp message
    let message = `🛒 *New Order from Rapid Stores*\n\n`;
    message += `👤 Name: ${customer_name}\n`;
    message += `📱 Phone: ${phone_number}\n\n`;
    message += `📦 Items:\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name} x ${item.quantity} - ZMW ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n💰 Total: ZMW ${total.toFixed(2)}\n`;
    message += `\n📍 Delivery: Pickup at Mansa branch`;

    // Generate WhatsApp URL
    const whatsappNumber = process.env.WHATSAPP_NUMBER || '260970000000';
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    res.json({
      success: true,
      whatsapp_url: whatsappUrl,
      message: message
    });
  } catch (error) {
    console.error('WhatsApp order error:', error);
    res.status(500).json({ error: 'Failed to generate WhatsApp order' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Rapid Stores API'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Rapid Stores and General Dealers Ltd API',
    version: '1.0.0',
    location: 'Mansa, Zambia',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      cart: '/api/cart',
      vouchers: '/api/vouchers',
      ai: '/api/ai',
      whatsapp_order: '/api/orders/whatsapp'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🏪 Rapid Stores API Server                           ║
║   📍 Mansa, Zambia                                     ║
║                                                        ║
║   Server running on port ${PORT}                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                        ║
║   Ready to serve customers! 🚀                         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
});

export default app;
