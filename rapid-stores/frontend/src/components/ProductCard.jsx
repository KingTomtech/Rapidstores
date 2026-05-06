export default function ProductCard({ product, onAddToCart }) {
  const { name, description, price, category, stock_quantity, image_url, is_manufactured } = product;

  const inStock = stock_quantity > 0;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {is_manufactured ? '🛏️' : category === 'Groceries' ? '🛒' : '📦'}
          </div>
        )}
        
        {/* Manufactured Badge */}
        {is_manufactured && (
          <span className="absolute top-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded">
            🏭 Made by Rapid
          </span>
        )}

        {/* Stock Badge */}
        {!inStock && (
          <span className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <h3 className="font-bold text-lg mb-1 line-clamp-1">{name}</h3>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description}</p>
      
      {/* Category */}
      <span className="text-xs text-primary bg-green-50 px-2 py-1 rounded inline-block mb-2">
        {category}
      </span>

      {/* Price and Stock */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-bold text-primary">ZMW {price.toFixed(2)}</span>
        {inStock && (
          <span className="text-xs text-gray-500">{stock_quantity} in stock</span>
        )}
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => onAddToCart(product)}
        disabled={!inStock}
        className={`w-full py-2 rounded-lg font-medium transition-colors ${
          inStock
            ? 'bg-primary text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {inStock ? '🛒 Add to Cart' : '❌ Out of Stock'}
      </button>
    </div>
  );
}
