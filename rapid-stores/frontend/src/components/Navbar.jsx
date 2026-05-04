import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart } = useCart();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold flex items-center space-x-2">
            <span>🏪</span>
            <div>
              <div>RAPID STORES</div>
              <div className="text-xs text-green-200">General Dealers Ltd</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="hover:text-green-200 transition-colors">
              Products
            </Link>
            <Link to="/products?category=mattresses" className="hover:text-green-200 transition-colors">
              Mattresses
            </Link>
            <Link to="/products?category=groceries" className="hover:text-green-200 transition-colors">
              Groceries
            </Link>
            
            {/* Cart */}
            <Link to="/cart" className="relative hover:text-green-200 transition-colors">
              🛒 Cart
              {cart.item_count > 0 && (
                <span className="absolute -top-2 -right-3 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.item_count}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="hover:text-green-200 transition-colors">
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="hover:text-green-200 transition-colors">
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="hover:text-green-200 transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link to="/products" className="block hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
              Products
            </Link>
            <Link to="/products?category=mattresses" className="block hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
              Mattresses
            </Link>
            <Link to="/products?category=groceries" className="block hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
              Groceries
            </Link>
            <Link to="/cart" className="block hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
              🛒 Cart ({cart.item_count})
            </Link>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="block hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <Link to="/profile" className="block hover:text-green-200" onClick={() => setMobileMenuOpen(false)}>
                  Profile
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block hover:text-green-200">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block btn-secondary inline-block" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
