import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const categoryFilter = searchParams.get('category');

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = categoryFilter ? { category: categoryFilter } : {};
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll(params),
        productsAPI.getCategories()
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Products</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input flex-grow"
          />
          <div className="flex gap-2 flex-wrap">
            <a href="/products" className={`px-4 py-2 rounded-lg ${!categoryFilter ? 'bg-primary text-white' : 'bg-gray-200'}`}>
              All
            </a>
            {categories.map(cat => (
              <a 
                key={cat} 
                href={`/products?category=${cat}`}
                className={`px-4 py-2 rounded-lg capitalize ${categoryFilter === cat ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                {cat.replace('_', ' ')}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
