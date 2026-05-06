import { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as addToCartAPI, updateCartItem as updateAPI, removeFromCart as removeAPI } from '../utils/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const data = await getCart();
      setCart(data.cart);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const data = await addToCartAPI(productId, quantity);
      await refreshCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      await updateAPI(itemId, quantity);
      await refreshCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await removeAPI(itemId);
      await refreshCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const clearCart = async () => {
    setCart(null);
  };

  const getCartTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
