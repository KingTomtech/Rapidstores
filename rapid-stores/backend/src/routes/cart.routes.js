import { Router } from 'express';
import { getOrCreateCart, getCartItems, addCartItem, updateCartItem, removeCartItem, clearCart, getCartTotal } from '../models/cart.model.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get or create cart and get items (protected)
router.get('/', authMiddleware, (req, res) => {
  try {
    const cart = getOrCreateCart(req.user.id);
    const items = getCartItems(cart.id);
    const total = getCartTotal(cart.id);

    res.json({
      cart_id: cart.id,
      items,
      total,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
});

// Add item to cart (protected)
router.post('/items', authMiddleware, (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const cart = getOrCreateCart(req.user.id);
    const items = addCartItem(cart.id, product_id, quantity);
    const total = getCartTotal(cart.id);

    res.json({
      cart_id: cart.id,
      items,
      total,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity (protected)
router.put('/items/:product_id', authMiddleware, (req, res) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    const cart = getOrCreateCart(req.user.id);
    const items = updateCartItem(cart.id, product_id, quantity);
    const total = getCartTotal(cart.id);

    res.json({
      cart_id: cart.id,
      items,
      total,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart (protected)
router.delete('/items/:product_id', authMiddleware, (req, res) => {
  try {
    const { product_id } = req.params;

    const cart = getOrCreateCart(req.user.id);
    const items = removeCartItem(cart.id, product_id);
    const total = getCartTotal(cart.id);

    res.json({
      cart_id: cart.id,
      items,
      total,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0)
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart (protected)
router.delete('/', authMiddleware, (req, res) => {
  try {
    const cart = getOrCreateCart(req.user.id);
    clearCart(cart.id);

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

export default router;
