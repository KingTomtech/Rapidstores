import { Router } from 'express';
import { 
  createOrder, 
  getOrderById, 
  getOrdersByUserId, 
  getAllOrders, 
  updateOrderStatus,
  updatePaymentStatus,
  addOrderItem,
  getOrderItems,
  getSalesAnalytics,
  getBestSellingProducts,
  getTotalRevenue,
  getOrderStats
} from '../models/order.model.js';
import { getOrCreateCart, getCartItems, clearCart, getCartTotal } from '../models/cart.model.js';
import { validateVoucher, useVoucher } from '../models/voucher.model.js';
import { updateStock } from '../models/product.model.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Create order (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { payment_method, delivery_method, delivery_address, voucher_code } = req.body;
    
    // Get user's cart
    const cart = getOrCreateCart(req.user.id);
    const cartItems = getCartItems(cart.id);

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    let totalAmount = getCartTotal(cart.id);
    let discountAmount = 0;

    // Validate and apply voucher
    if (voucher_code) {
      const voucherResult = validateVoucher(voucher_code, totalAmount);
      if (!voucherResult.valid) {
        return res.status(400).json({ error: voucherResult.error });
      }
      discountAmount = voucherResult.discount;
      totalAmount = totalAmount - discountAmount;
    }

    // Create order
    const order = createOrder({
      user_id: req.user.id,
      total_amount: totalAmount,
      payment_method,
      delivery_method,
      delivery_address,
      phone_number: req.user.phone,
      whatsapp_order: false,
      voucher_code,
      discount_amount: discountAmount
    });

    // Add order items and update stock
    for (const item of cartItems) {
      addOrderItem(order.id, item.product_id, item.quantity, item.price);
      updateStock(item.product_id, -item.quantity); // Decrease stock
    }

    // Clear cart
    clearCart(cart.id);

    // Get order items for response
    const orderItems = getOrderItems(order.id);

    res.status(201).json({
      ...order,
      items: orderItems
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders (protected)
router.get('/', authMiddleware, (req, res) => {
  try {
    const orders = getOrdersByUserId(req.user.id);
    
    // Get items for each order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: getOrderItems(order.id)
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get single order (protected)
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const order = getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orderItems = getOrderItems(order.id);
    res.json({ ...order, items: orderItems });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Update order status (admin only)
router.put('/:id/status', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'processing', 'ready', 'delivered'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update payment status (admin only or webhook)
router.put('/:id/payment', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { payment_status } = req.body;
    const validStatuses = ['pending', 'completed', 'failed'];
    
    if (!payment_status || !validStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const order = updatePaymentStatus(req.params.id, payment_status);
    res.json(order);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Admin: Get all orders
router.get('/admin/all', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status, payment_status } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (payment_status) filters.payment_status = payment_status;

    const orders = getAllOrders(filters);
    
    // Get items for each order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: getOrderItems(order.id)
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Admin: Get sales analytics
router.get('/admin/analytics/sales', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const days = parseInt(req.query.days) || 30;
    const salesData = getSalesAnalytics(days);
    res.json(salesData);
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ error: 'Failed to get sales analytics' });
  }
});

// Admin: Get best selling products
router.get('/admin/analytics/products', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const limit = parseInt(req.query.limit) || 10;
    const products = getBestSellingProducts(limit);
    res.json(products);
  } catch (error) {
    console.error('Get best selling products error:', error);
    res.status(500).json({ error: 'Failed to get best selling products' });
  }
});

// Admin: Get dashboard stats
router.get('/admin/stats', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = getOrderStats();
    const totalRevenue = getTotalRevenue();
    
    res.json({
      ...stats,
      total_revenue: totalRevenue
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Validate voucher
router.post('/validate-voucher', authMiddleware, (req, res) => {
  try {
    const { code, amount } = req.body;
    
    if (!code || !amount) {
      return res.status(400).json({ error: 'Code and amount are required' });
    }

    const result = validateVoucher(code, amount);
    res.json(result);
  } catch (error) {
    console.error('Validate voucher error:', error);
    res.status(500).json({ error: 'Failed to validate voucher' });
  }
});

export default router;
