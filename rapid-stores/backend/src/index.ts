import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { bearerAuth } from 'hono/bearer-auth';
import type { Env, User, Product, Order, Voucher } from '../types';
import { getSupabase, getCurrentUser, requireAdmin } from '../utils/supabase';
import { AIService } from '../ai/agents';

const app = new Hono<{ Bindings: Env; Variables: { user?: User } }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://rapid-stores.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Auth middleware helper
const optionalAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const supabase = getSupabase(c.env, token);
    const user = await getCurrentUser(supabase);
    if (user) {
      c.set('user', user);
    }
  }
  await next();
};

const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  const supabase = getSupabase(c.env, token);
  const user = await getCurrentUser(supabase);
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  c.set('user', user);
  await next();
};

const requireAdminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  const supabase = getSupabase(c.env, token);
  const user = await requireAdmin(supabase);
  
  if (!user) {
    return c.json({ error: 'Forbidden - Admin access required' }, 403);
  }
  
  c.set('user', user);
  await next();
};

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== PUBLIC ROUTES ====================

// Products
app.get('/api/products', optionalAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { search, category, minPrice, maxPrice } = c.req.query();
  
  let query = supabase.from('products').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice));
  }
  
  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice));
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  return c.json({ products: data || [] });
});

app.get('/api/products/:id', optionalAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) {
    return c.json({ error: 'Product not found' }, 404);
  }
  
  return c.json({ product: data });
});

app.get('/api/products/categories', async (c) => {
  const supabase = getSupabase(c.env);
  
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null);
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  const categories = [...new Set(data?.map(p => p.category))];
  return c.json({ categories });
});

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const { email, password, phone, full_name } = body;
  
  if (!email && !phone) {
    return c.json({ error: 'Email or phone is required' }, 400);
  }
  
  const { data, error } = await supabase.auth.signUp({
    email: email || `${phone}@sms.supabase.co`,
    password,
    data: {
      phone: phone || '',
      full_name: full_name || ''
    }
  });
  
  if (error) {
    return c.json({ error: error.message }, 400);
  }
  
  // Create profile
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      phone: phone || '',
      full_name: full_name || '',
      role: 'customer'
    });
  }
  
  return c.json({ 
    user: data.user,
    message: 'Registration successful. Please verify your email/phone.'
  });
});

app.post('/api/auth/login', async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  const { email, phone, password } = body;
  
  const identifier = email || `${phone}@sms.supabase.co`;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password
  });
  
  if (error) {
    return c.json({ error: error.message }, 401);
  }
  
  return c.json({
    user: data.user,
    session: data.session
  });
});

app.post('/api/auth/logout', async (c) => {
  const supabase = getSupabase(c.env);
  await supabase.auth.signOut();
  return c.json({ message: 'Logged out successfully' });
});

// ==================== CART ROUTES ====================

app.get('/api/cart', requireAuth, async (c) => {
  const supabase = getSupabase(c.env, c.get('user').id);
  const userId = c.get('user').id;
  
  // Get or create cart
  let { data: cart } = await supabase
    .from('carts')
    .select('*, cart_items(*)')
    .eq('user_id', userId)
    .single();
  
  if (!cart) {
    const { data: newCart } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();
    cart = newCart;
  }
  
  return c.json({ cart });
});

app.post('/api/cart/items', requireAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const userId = c.get('user').id;
  const { product_id, quantity } = await c.req.json();
  
  // Get cart
  let { data: cart } = await supabase
    .from('carts')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (!cart) {
    const { data: newCart } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select()
      .single();
    cart = newCart;
  }
  
  // Check if item exists
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('product_id', product_id)
    .single();
  
  if (existingItem) {
    const { data: updated } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single();
    return c.json({ item: updated });
  } else {
    const { data: newItem } = await supabase
      .from('cart_items')
      .insert({ cart_id: cart.id, product_id, quantity })
      .select()
      .single();
    return c.json({ item: newItem });
  }
});

app.put('/api/cart/items/:id', requireAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const { quantity } = await c.req.json();
  
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  return c.json({ item: data });
});

app.delete('/api/cart/items/:id', requireAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  
  await supabase.from('cart_items').delete().eq('id', id);
  
  return c.json({ message: 'Item removed' });
});

// ==================== ORDER ROUTES ====================

app.post('/api/orders', requireAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const user = c.get('user');
  const { payment_method, delivery_address, notes, voucher_code } = await c.req.json();
  
  // Get cart with items
  const { data: cart } = await supabase
    .from('carts')
    .select('*, cart_items(*, product:products(*))')
    .eq('user_id', user.id)
    .single();
  
  if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
    return c.json({ error: 'Cart is empty' }, 400);
  }
  
  // Calculate total
  let total = cart.cart_items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  
  // Apply voucher if provided
  let discount = 0;
  if (voucher_code) {
    const { data: voucher } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', voucher_code)
      .eq('is_active', true)
      .single();
    
    if (voucher) {
      if (voucher.discount_type === 'percentage') {
        discount = total * (voucher.discount_value / 100);
      } else {
        discount = voucher.discount_value;
      }
      
      // Update voucher usage
      await supabase
        .from('vouchers')
        .update({ current_uses: voucher.current_uses + 1 })
        .eq('id', voucher.id);
    }
  }
  
  total -= discount;
  
  // Create order
  const { data: order } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total_amount: total,
      payment_method: payment_method || 'mobile_money',
      payment_status: 'pending',
      status: 'pending',
      phone_number: user.phone,
      delivery_address,
      notes
    })
    .select()
    .single();
  
  // Create order items
  const orderItems = cart.cart_items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.product.price
  }));
  
  await supabase.from('order_items').insert(orderItems);
  
  // Clear cart
  await supabase.from('cart_items').delete().eq('cart_id', cart.id);
  
  // Generate WhatsApp message
  const whatsappMsg = generateWhatsAppMessage(order, cart.cart_items, total, c.env.WHATSAPP_NUMBER);
  
  return c.json({ 
    order,
    whatsapp_url: `https://wa.me/${c.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMsg)}`
  });
});

app.get('/api/orders', requireAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const userId = c.get('user').id;
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  return c.json({ orders: data || [] });
});

app.get('/api/orders/:id', requireAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const userId = c.get('user').id;
  
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, product:products(*))')
    .eq('id', id)
    .eq('user_id', userId)
    .single();
  
  if (error || !data) {
    return c.json({ error: 'Order not found' }, 404);
  }
  
  return c.json({ order: data });
});

// WhatsApp order endpoint (no auth required)
app.post('/api/orders/whatsapp', async (c) => {
  const { items, customer_name, phone, delivery_address } = await c.req.json();
  
  if (!items || items.length === 0 || !phone) {
    return c.json({ error: 'Invalid order data' }, 400);
  }
  
  const total = items.reduce((sum: number, item: any) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  const message = `🛒 *New Order from ${customer_name}*\n\n` +
    items.map((item: any) => `- ${item.name} x${item.quantity} = ZMW ${(item.price * item.quantity).toFixed(2)}`).join('\n') +
    `\n\n*Total: ZMW ${total.toFixed(2)}*\n\n` +
    `📞 Phone: ${phone}\n` +
    `📍 Address: ${delivery_address || 'Pickup'}`;
  
  const whatsappUrl = `https://wa.me/${c.env.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  
  return c.json({ whatsapp_url: whatsappUrl, message });
});

// ==================== VOUCHER ROUTES ====================

app.post('/api/vouchers/validate', async (c) => {
  const supabase = getSupabase(c.env);
  const { code, order_amount } = await c.req.json();
  
  const { data: voucher, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();
  
  if (error || !voucher) {
    return c.json({ valid: false, error: 'Invalid voucher code' });
  }
  
  // Check expiration
  if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    return c.json({ valid: false, error: 'Voucher expired' });
  }
  
  // Check max uses
  if (voucher.max_uses && voucher.current_uses >= voucher.max_uses) {
    return c.json({ valid: false, error: 'Voucher fully redeemed' });
  }
  
  // Check minimum order amount
  if (voucher.min_order_amount && order_amount < voucher.min_order_amount) {
    return c.json({ 
      valid: false, 
      error: `Minimum order amount: ZMW ${voucher.min_order_amount}` 
    });
  }
  
  // Calculate discount
  let discount = 0;
  if (voucher.discount_type === 'percentage') {
    discount = order_amount * (voucher.discount_value / 100);
  } else {
    discount = voucher.discount_value;
  }
  
  return c.json({ 
    valid: true, 
    discount,
    discount_type: voucher.discount_type,
    discount_value: voucher.discount_value
  });
});

// ==================== ADMIN ROUTES ====================

// Admin: Get all orders
app.get('/api/admin/orders', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { status, limit = '50' } = c.req.query();
  
  let query = supabase
    .from('orders')
    .select('*, user:profiles(full_name, phone)')
    .order('created_at', { ascending: false })
    .limit(parseInt(limit));
  
  if (status) {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  return c.json({ orders: data || [] });
});

// Admin: Update order status
app.put('/api/orders/:id/status', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const { status, payment_status } = await c.req.json();
  
  const updateData: any = {};
  if (status) updateData.status = status;
  if (payment_status) updateData.payment_status = payment_status;
  
  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  return c.json({ order: data });
});

// Admin: Manage products
app.post('/api/admin/products', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  
  const { data, error } = await supabase
    .from('products')
    .insert(body)
    .select()
    .single();
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  return c.json({ product: data });
});

app.put('/api/admin/products/:id', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  const body = await c.req.json();
  
  const { data, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  return c.json({ product: data });
});

app.delete('/api/admin/products/:id', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { id } = c.req.param();
  
  await supabase.from('products').delete().eq('id', id);
  
  return c.json({ message: 'Product deleted' });
});

// Admin: Dashboard stats
app.get('/api/admin/stats', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  
  // Total orders
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
  
  // Pending orders
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');
  
  // Total revenue (paid orders)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('payment_status', 'paid');
  
  const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
  
  // Low stock products
  const { data: lowStock } = await supabase
    .from('products')
    .select('id, name, stock_quantity')
    .lt('stock_quantity', 10);
  
  return c.json({
    total_orders: totalOrders || 0,
    pending_orders: pendingOrders || 0,
    total_revenue: totalRevenue,
    low_stock_count: lowStock?.length || 0,
    low_stock_products: lowStock || []
  });
});

// Admin: Sales analytics
app.get('/api/admin/analytics/sales', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const { days = '30' } = c.req.query();
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  
  const { data } = await supabase
    .from('orders')
    .select('total_amount, created_at, payment_status')
    .gte('created_at', startDate.toISOString())
    .eq('payment_status', 'paid');
  
  // Group by date
  const salesByDate: Record<string, number> = {};
  data?.forEach(order => {
    const date = order.created_at.split('T')[0];
    salesByDate[date] = (salesByDate[date] || 0) + order.total_amount;
  });
  
  return c.json({
    period_days: parseInt(days),
    total_sales: Object.values(salesByDate).reduce((a, b) => a + b, 0),
    daily_sales: salesByDate
  });
});

// Admin: Manage vouchers
app.post('/api/admin/vouchers', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();
  
  const { data, error } = await supabase
    .from('vouchers')
    .insert(body)
    .select()
    .single();
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  return c.json({ voucher: data });
});

app.get('/api/admin/vouchers', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  
  const { data, error } = await supabase
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    return c.json({ error: error.message }, 500);
  }
  
  return c.json({ vouchers: data || [] });
});

// ==================== AI ROUTES ====================

app.post('/api/ai/chat', optionalAuth, async (c) => {
  const { message, context } = await c.req.json();
  const aiService = new AIService(c.env.AI);
  
  const response = await aiService.chat(message, context);
  
  return c.json({ response });
});

app.post('/api/ai/recommendations', optionalAuth, async (c) => {
  const { cart_items, viewed_products } = await c.req.json();
  const aiService = new AIService(c.env.AI);
  
  const recommendations = await aiService.recommendProducts(cart_items, viewed_products);
  
  return c.json({ recommendations });
});

app.get('/api/ai/inventory-alerts', requireAdminAuth, async (c) => {
  const supabase = getSupabase(c.env);
  const aiService = new AIService(c.env.AI);
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .lt('stock_quantity', 20);
  
  const alerts = await aiService.generateInventoryAlerts(products || []);
  
  return c.json({ alerts });
});

app.post('/api/ai/marketing-content', requireAdminAuth, async (c) => {
  const { type, products, campaign_goal } = await c.req.json();
  const aiService = new AIService(c.env.AI);
  
  const content = await aiService.generateMarketingContent(type, products, campaign_goal);
  
  return c.json({ content });
});

// Helper function
function generateWhatsAppMessage(order: any, items: any[], total: number, whatsappNumber: string): string {
  const itemList = items.map((item: any) => 
    `- ${item.product.name} x${item.quantity} = ZMW ${(item.product.price * item.quantity).toFixed(2)}`
  ).join('\n');
  
  return `🛒 *New Order #${order.id.slice(0, 8)}*\n\n` +
    `${itemList}\n\n` +
    `*Total: ZMW ${total.toFixed(2)}*\n\n` +
    `📞 Phone: ${order.phone_number}\n` +
    `📍 Address: ${order.delivery_address || 'Pickup'}\n` +
    `💳 Payment: ${order.payment_method}\n\n` +
    `Please confirm my order! Thank you.`;
}

export default app;
