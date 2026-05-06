import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';

// Placeholder pages
const Register = () => <div className="p-8 text-center">Register Page - Coming Soon</div>;
const Products = () => <div className="p-8 text-center">Products Page - Coming Soon</div>;
const Cart = () => <div className="p-8 text-center">Cart Page - Coming Soon</div>;
const Orders = () => <div className="p-8 text-center">Orders Page - Coming Soon</div>;
const AdminDashboard = () => <div className="p-8 text-center">Admin Dashboard - Coming Soon</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
            
            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8 mt-12">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="mb-4">
                  <span className="text-3xl">🏪</span>
                  <h2 className="text-xl font-bold mt-2">Rapid Stores and General Dealers Ltd</h2>
                  <p className="text-gray-400">Mansa, Zambia</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h3 className="font-bold mb-2">Contact</h3>
                    <p className="text-sm text-gray-400">📞 +260 970 000 000</p>
                    <p className="text-sm text-gray-400">📧 info@rapidstores.co.zm</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Business Hours</h3>
                    <p className="text-sm text-gray-400">Mon-Sat: 8:00 AM - 6:00 PM</p>
                    <p className="text-sm text-gray-400">Sunday: 9:00 AM - 1:00 PM</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Payment Methods</h3>
                    <p className="text-sm text-gray-400">💵 Cash</p>
                    <p className="text-sm text-gray-400">📱 Mobile Money (MTN, Airtel, Zamtel)</p>
                  </div>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-sm text-gray-400">
                    © 2025 Rapid Stores. All rights reserved. | Built with ❤️ for Zambia 🇿🇲
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
