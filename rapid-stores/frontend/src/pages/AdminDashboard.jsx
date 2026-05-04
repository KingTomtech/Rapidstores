import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAdminOrders, updateOrderStatus } from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        getAdminStats(),
        getAdminOrders({ limit: 20 })
      ]);
      setStats(statsData);
      setOrders(ordersData.orders || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      alert('✅ Order updated!');
      loadDashboardData();
    } catch (error) {
      alert('❌ Failed to update order: ' + error.message);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">Admin access required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.full_name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-blue-50">
            <h3 className="text-sm text-gray-600 mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.total_orders || 0}</p>
          </div>
          <div className="card bg-yellow-50">
            <h3 className="text-sm text-gray-600 mb-1">Pending Orders</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pending_orders || 0}</p>
          </div>
          <div className="card bg-green-50">
            <h3 className="text-sm text-gray-600 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">ZMW {(stats?.total_revenue || 0).toFixed(2)}</p>
          </div>
          <div className="card bg-red-50">
            <h3 className="text-sm text-gray-600 mb-1">Low Stock Items</h3>
            <p className="text-3xl font-bold text-red-600">{stats?.low_stock_count || 0}</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        {stats?.low_stock_products?.length > 0 && (
          <div className="card mb-8 border-l-4 border-red-500">
            <h2 className="text-xl font-bold mb-4 text-red-600">⚠️ Low Stock Alerts</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Stock</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.low_stock_products.map(product => (
                    <tr key={product.id} className="border-b last:border-0">
                      <td className="py-2">{product.name}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          product.stock_quantity === 0 ? 'bg-red-100 text-red-600' :
                          product.stock_quantity < 5 ? 'bg-orange-100 text-orange-600' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {product.stock_quantity} units
                        </span>
                      </td>
                      <td className="py-2">
                        <button className="text-primary hover:underline text-sm">
                          Restock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Payment</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-sm">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{order.user?.full_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{order.phone_number}</div>
                      </div>
                    </td>
                    <td className="py-3 font-medium">
                      ZMW {order.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                        order.status === 'ready' ? 'bg-blue-100 text-blue-600' :
                        order.status === 'processing' ? 'bg-purple-100 text-purple-600' :
                        order.status === 'paid' ? 'bg-green-100 text-green-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-600' :
                        order.payment_status === 'failed' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {order.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {orders.length === 0 && (
            <p className="text-center text-gray-500 py-8">No orders yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/products" className="card hover:shadow-lg transition text-center">
            <span className="text-3xl mb-2 block">📦</span>
            <h3 className="font-bold">Manage Products</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove products</p>
          </a>
          <a href="/admin/vouchers" className="card hover:shadow-lg transition text-center">
            <span className="text-3xl mb-2 block">🎫</span>
            <h3 className="font-bold">Vouchers</h3>
            <p className="text-sm text-gray-600">Create discount codes</p>
          </a>
          <a href="/admin/analytics" className="card hover:shadow-lg transition text-center">
            <span className="text-3xl mb-2 block">📊</span>
            <h3 className="font-bold">Analytics</h3>
            <p className="text-sm text-gray-600">View sales reports</p>
          </a>
        </div>
      </div>
    </div>
  );
}
