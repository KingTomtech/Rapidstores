import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ in_stock: true }),
        productsAPI.getCategories()
      ]);
      setFeaturedProducts(productsRes.data.slice(0, 8));
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-green-600 text-white rounded-2xl p-8 mb-8">
        <div className="text-center md:text-left md:flex md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to Rapid Stores
            </h1>
            <p className="text-lg text-green-100 mb-6">
              Quality mattresses, groceries, and household essentials in Mansa, Zambia.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/products" className="btn-secondary px-6 py-3">
                Shop Now
              </Link>
              <a 
                href="https://wa.me/260970000000" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                💬 WhatsApp Us
              </a>
            </div>
          </div>
          <div className="text-6xl md:text-8xl opacity-50">🏪</div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(category => (
            <Link
              key={category}
              to={`/products?category=${category}`}
              className="card text-center py-6 hover:bg-green-50 transition-colors"
            >
              <div className="text-3xl mb-2">
                {category === 'mattresses' && '🛏️'}
                {category === 'groceries' && '🛒'}
                {category === 'furniture' && '🪑'}
                {category === 'foam_products' && '🧽'}
                {category === 'electronics' && '📱'}
              </div>
              <div className="font-semibold capitalize">{category.replace('_', ' ')}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-primary hover:underline">
            View All →
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-white rounded-xl p-8 mb-8 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Rapid Stores?</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🏭</div>
            <h3 className="font-semibold mb-2">Local Manufacturing</h3>
            <p className="text-sm text-gray-600">Quality mattresses made in Zambia</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-semibold mb-2">Best Prices</h3>
            <p className="text-sm text-gray-600">Affordable prices for everyone</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-semibold mb-2">Easy Ordering</h3>
            <p className="text-sm text-gray-600">Order online or via WhatsApp</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🚚</div>
            <h3 className="font-semibold mb-2">Fast Pickup</h3>
            <p className="text-sm text-gray-600">Ready for pickup in Mansa</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary text-white rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Need Bulk Supplies?</h2>
        <p className="mb-6">We offer special prices for bulk orders. Contact us today!</p>
        <a 
          href="https://wa.me/260970000000?text=Hello,%20I'm%20interested%20in%20bulk%20orders"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-secondary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
        >
          💬 Chat on WhatsApp
        </a>
      </section>
    </div>
  );
};

export default Home;
