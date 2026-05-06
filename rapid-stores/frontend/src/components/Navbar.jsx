import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const itemCount = getItemCount();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">🏪</span>
            <div>
              <h1 className="text-xl font-bold">Rapid Stores</h1>
              <p className="text-xs text-green-100">Mansa, Zambia</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="hover:text-green-200 transition">
              Products
            </Link>
            <Link to="/categories" className="hover:text-green-200 transition">
              Categories
            </Link>
            {isAdmin() && (
              <Link to="/admin" className="hover:text-green-200 transition">
                Admin
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative hover:text-green-200 transition">
              <span className="text-2xl">🛒</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 hover:text-green-200 transition">
                  <span className="w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center font-bold">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="hidden md:inline">{user.full_name || 'User'}</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100 rounded-t-lg">
                    My Orders
                  </Link>
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                    Profile
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-outline text-white border-white hover:bg-white hover:text-primary px-3 py-1 rounded">
                  Login
                </Link>
                <Link to="/register" className="btn-secondary px-3 py-1 rounded">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-2xl">☰</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
