import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProducts, getCategories, createWhatsAppOrder } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useState(() => {
    loadData();
  });

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData.products || []);
      setCategories(categoriesData.categories || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If not logged in, redirect to login or offer WhatsApp order
      const proceed = confirm('Would you like to login to add to cart, or continue with WhatsApp order?');
      if (proceed) {
        navigate('/login');
      } else {
        // Add to local cart for WhatsApp order
        let localCart = JSON.parse(localStorage.getItem('local_cart') || '[]');
        localCart.push({ ...product, quantity: 1 });
        localStorage.setItem('local_cart', JSON.stringify(localCart));
        alert('Item added! Continue shopping or checkout via WhatsApp.');
      }
      return;
    }

    const result = await addToCart(product.id);
    if (result.success) {
      alert('✅ Added to cart!');
    } else {
      alert('❌ Failed to add to cart');
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  const featuredProducts = products.filter(p => p.is_manufactured).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-green-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Rapid Stores 🇿🇲
          </h1>
          <p className="text-xl mb-6">
            Quality Products, Manufacturing & Supply in Mansa, Zambia
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/products" className="btn-secondary px-6 py-3 rounded-lg font-medium">
              Shop Now
            </Link>
            <button
              onClick={async () => {
                const localCart = JSON.parse(localStorage.getItem('local_cart') || '[]');
                if (localCart.length === 0 && products.length > 0) {
                  // Create sample order from first product
                  const sampleItems = products.slice(0, 2).map(p => ({
                    name: p.name,
                    price: p.price,
                    quantity: 1
                  }));
                  const result = await createWhatsAppOrder({
                    items: sampleItems,
                    customer_name: 'Customer',
                    phone: '+260...',
                    delivery_address: 'Mansa'
                  });
                  window.open(result.whatsapp_url, '_blank');
                } else {
                  const items = localCart.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1
                  }));
                  const result = await createWhatsAppOrder({
                    items,
                    customer_name: 'Customer',
                    phone: '+260...',
                    delivery_address: 'Mansa'
                  });
                  window.open(result.whatsapp_url, '_blank');
                }
              }}
              className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              📱 Order via WhatsApp
            </button>
          </div>
        </div>
      </section>

      {/* Categories Quick Links */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full font-medium transition ${
                !selectedCategory
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Manufacturing Products */}
      {featuredProducts.length > 0 && (
        <section className="py-8 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">🏭 Made by Rapid Stores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">
            {selectedCategory || 'All'} Products
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Rapid Stores?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <span className="text-5xl mb-4 block">🚚</span>
              <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick delivery within Mansa and surrounding areas</p>
            </div>
            <div className="text-center p-6">
              <span className="text-5xl mb-4 block">💰</span>
              <h3 className="font-bold text-lg mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive prices on all products</p>
            </div>
            <div className="text-center p-6">
              <span className="text-5xl mb-4 block">📱</span>
              <h3 className="font-bold text-lg mb-2">Easy Ordering</h3>
              <p className="text-gray-600">Order online or via WhatsApp - your choice!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
