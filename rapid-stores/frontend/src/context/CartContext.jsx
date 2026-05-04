import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0, item_count: 0 });
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage on mount (for guest users)
  useEffect(() => {
    const savedCart = localStorage.getItem('guest_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage when it changes (for guest users)
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      localStorage.setItem('guest_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existingItem = prev.items.find(item => item.product_id === product.id);
      
      let newItems;
      if (existingItem) {
        newItems = prev.items.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [...prev.items, {
          product_id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          category: product.category,
          stock_quantity: product.stock_quantity,
          quantity
        }];
      }

      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total: newTotal,
        item_count: newCount
      };
    });
  };

  const updateQuantity = (product_id, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(product_id);
    }

    setCart(prev => {
      const newItems = prev.items.map(item =>
        item.product_id === product_id
          ? { ...item, quantity }
          : item
      );

      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total: newTotal,
        item_count: newCount
      };
    });
  };

  const removeFromCart = (product_id) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.product_id !== product_id);
      const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total: newTotal,
        item_count: newCount
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0, item_count: 0 });
    localStorage.removeItem('guest_cart');
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
