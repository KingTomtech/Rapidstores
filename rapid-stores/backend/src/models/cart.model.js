import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const getOrCreateCart = (user_id = null, session_id = null) => {
  let cart;
  
  if (user_id) {
    const stmt = db.prepare('SELECT * FROM carts WHERE user_id = ?');
    cart = stmt.get(user_id);
  } else if (session_id) {
    const stmt = db.prepare('SELECT * FROM carts WHERE session_id = ?');
    cart = stmt.get(session_id);
  }

  if (!cart) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO carts (id, user_id, session_id)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, user_id || null, session_id || null);
    cart = { id, user_id, session_id };
  }

  return cart;
};

export const getCartById = (id) => {
  const stmt = db.prepare('SELECT * FROM carts WHERE id = ?');
  return stmt.get(id);
};

export const getCartItems = (cart_id) => {
  const stmt = db.prepare(`
    SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity, p.category
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = ?
  `);
  return stmt.all(cart_id);
};

export const addCartItem = (cart_id, product_id, quantity = 1) => {
  // Check if item already exists
  const existingStmt = db.prepare('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?');
  const existing = existingStmt.get(cart_id, product_id);

  if (existing) {
    const updateStmt = db.prepare(`
      UPDATE cart_items 
      SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
      WHERE cart_id = ? AND product_id = ?
    `);
    updateStmt.run(quantity, cart_id, product_id);
  } else {
    const id = uuidv4();
    const insertStmt = db.prepare(`
      INSERT INTO cart_items (id, cart_id, product_id, quantity)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(id, cart_id, product_id, quantity);
  }

  return getCartItems(cart_id);
};

export const updateCartItem = (cart_id, product_id, quantity) => {
  if (quantity <= 0) {
    return removeCartItem(cart_id, product_id);
  }

  const stmt = db.prepare(`
    UPDATE cart_items 
    SET quantity = ?, updated_at = CURRENT_TIMESTAMP
    WHERE cart_id = ? AND product_id = ?
  `);
  stmt.run(quantity, cart_id, product_id);
  return getCartItems(cart_id);
};

export const removeCartItem = (cart_id, product_id) => {
  const stmt = db.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?');
  stmt.run(cart_id, product_id);
  return getCartItems(cart_id);
};

export const clearCart = (cart_id) => {
  const stmt = db.prepare('DELETE FROM cart_items WHERE cart_id = ?');
  stmt.run(cart_id);
  return [];
};

export const getCartTotal = (cart_id) => {
  const items = getCartItems(cart_id);
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const mergeCarts = (sourceCartId, targetCartId) => {
  const sourceItems = getCartItems(sourceCartId);
  
  for (const item of sourceItems) {
    addCartItem(targetCartId, item.product_id, item.quantity);
  }

  // Delete source cart
  const deleteStmt = db.prepare('DELETE FROM cart_items WHERE cart_id = ?');
  deleteStmt.run(sourceCartId);
  
  const deleteCartStmt = db.prepare('DELETE FROM carts WHERE id = ?');
  deleteCartStmt.run(sourceCartId);

  return getCartItems(targetCartId);
};
