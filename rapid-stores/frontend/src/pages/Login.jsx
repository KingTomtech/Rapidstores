import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email && !phone) {
      setError('Please enter email or phone number');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter password');
      setLoading(false);
      return;
    }

    const result = await login(email, phone, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-6xl">🏪</span>
          <h1 className="text-3xl font-bold text-primary mt-2">Rapid Stores</h1>
          <p className="text-gray-600">Welcome back!</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Sign In</h2>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email or Phone */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Email or Phone Number
              </label>
              <input
                type="text"
                value={email || phone}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes('@')) {
                    setEmail(val);
                    setPhone('');
                  } else {
                    setPhone(val);
                    setEmail('');
                  }
                }}
                className="input"
                placeholder="+260... or email@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-primary font-medium hover:underline">
              Sign up
            </a>
          </p>

          {/* WhatsApp Login Hint */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: You can also order via WhatsApp without logging in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
