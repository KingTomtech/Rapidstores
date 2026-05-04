import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = (orderData) => {
  const {
    user_id,
    total_amount,
    payment_method,
    delivery_method,
    delivery_address,
    phone_number,
    whatsapp_order = false,
    voucher_code,
    discount_amount = 0
  } = orderData;

  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO orders (id, user_id, total_amount, payment_method, delivery_method, delivery_address, phone_number, whatsapp_order, voucher_code, discount_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    user_id,
    total_amount,
    payment_method || null,
    delivery_method || 'pickup',
    delivery_address || null,
    phone_number,
    whatsapp_order ? 1 : 0,
    voucher_code || null,
    discount_amount
  );

  return getOrderById(id);
};

export const getOrderById = (id) => {
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  return stmt.get(id);
};

export const getOrdersByUserId = (user_id) => {
  const stmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(user_id);
};

export const getAllOrders = (filters = {}) => {
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters.payment_status) {
    query += ' AND payment_status = ?';
    params.push(filters.payment_status);
  }

  if (filters.user_id) {
    query += ' AND user_id = ?';
    params.push(filters.user_id);
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params);
};

export const updateOrderStatus = (id, status) => {
  const stmt = db.prepare(`
    UPDATE orders 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(status, id);
  return getOrderById(id);
};

export const updatePaymentStatus = (id, payment_status) => {
  const stmt = db.prepare(`
    UPDATE orders 
    SET payment_status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(payment_status, id);
  return getOrderById(id);
};

export const addOrderItem = (order_id, product_id, quantity, price_at_purchase) => {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, order_id, product_id, quantity, price_at_purchase);
  return { id, order_id, product_id, quantity, price_at_purchase };
};

export const getOrderItems = (order_id) => {
  const stmt = db.prepare(`
    SELECT oi.*, p.name, p.image_url 
    FROM order_items oi 
    JOIN products p ON oi.product_id = p.id 
    WHERE oi.order_id = ?
  `);
  return stmt.all(order_id);
};

export const getSalesAnalytics = (days = 30) => {
  const stmt = db.prepare(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as order_count,
      SUM(total_amount) as total_sales,
      AVG(total_amount) as avg_order_value
    FROM orders 
    WHERE payment_status = 'completed'
    AND created_at >= datetime('now', '-' || ? || ' days')
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `);
  return stmt.all(days);
};

export const getBestSellingProducts = (limit = 10) => {
  const stmt = db.prepare(`
    SELECT 
      p.id,
      p.name,
      p.category,
      SUM(oi.quantity) as total_sold,
      SUM(oi.quantity * oi.price_at_purchase) as total_revenue
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.payment_status = 'completed'
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT ?
  `);
  return stmt.all(limit);
};

export const getTotalRevenue = () => {
  const stmt = db.prepare(`
    SELECT SUM(total_amount) as total 
    FROM orders 
    WHERE payment_status = 'completed'
  `);
  const result = stmt.get();
  return result?.total || 0;
};

export const getOrderStats = () => {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total_orders,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
      SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
      SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
    FROM orders
  `);
  return stmt.get();
};
