import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const formatPrice = (price) => `ZMW ${price.toFixed(2)}`;

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-6">Start shopping to add items to your cart.</p>
        <Link to="/products" className="btn-primary inline-block">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.item_count} items)</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.product_id} className="card flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-2xl">📦</span>
                )}
              </div>
              
              <div className="flex-grow">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{item.category.replace('_', ' ')}</p>
                <p className="text-primary font-bold mt-1">{formatPrice(item.price)}</p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button 
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕ Remove
                </button>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-8 h-8 rounded border flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}

          <button 
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="card h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="text-green-600">Free (Pickup)</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(cart.total)}</span>
            </div>
          </div>

          <Link to="/checkout" className="btn-primary w-full block text-center mb-3">
            Proceed to Checkout
          </Link>

          <a
            href={`https://wa.me/260970000000?text=${encodeURIComponent(
              `Hi, I want to order:\n${cart.items.map(i => `- ${i.name} x${i.quantity}`).join('\n')}\n\nTotal: ${formatPrice(cart.total)}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full block text-center"
          >
            💬 Order via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default Cart;
