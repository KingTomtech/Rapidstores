import { useState } from 'react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const formatPrice = (price) => {
    return `ZMW ${price.toFixed(2)}`;
  };

  return (
    <div className="card flex flex-col h-full">
      {/* Product Image */}
      <div className="relative pb-[75%] bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}
        
        {/* Badges */}
        {product.is_manufactured && (
          <span className="absolute top-2 left-2 badge badge-info">
            🏭 Manufactured
          </span>
        )}
        {product.stock_quantity === 0 && (
          <span className="absolute top-2 right-2 badge badge-danger">
            Out of Stock
          </span>
        )}
        {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
          <span className="absolute top-2 right-2 badge badge-warning">
            Low Stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-grow">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-primary font-bold text-xl">{formatPrice(product.price)}</span>
          {product.stock_quantity > 0 && (
            <span className="text-xs text-gray-500">{product.stock_quantity} in stock</span>
          )}
        </div>
      </div>

      {/* Add to Cart */}
      {product.stock_quantity > 0 ? (
        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              -
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button 
              onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              +
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`w-full py-2 rounded-lg font-semibold transition-colors ${
              added 
                ? 'bg-green-500 text-white' 
                : 'btn-primary'
            }`}
          >
            {added ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      ) : (
        <button disabled className="w-full py-2 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed">
          Out of Stock
        </button>
      )}
    </div>
  );
};

export default ProductCard;
