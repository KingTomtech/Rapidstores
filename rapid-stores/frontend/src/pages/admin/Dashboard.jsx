import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, productsAPI } from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, ordersRes, lowStockRes] = await Promise.all([
        ordersAPI.getStats(),
        ordersAPI.getAllAdmin({}),
        productsAPI.getLowStock(10)
      ]);
      setStats(statsRes.data);
      setRecentOrders(ordersRes.data.slice(0, 5));
      setLowStock(lowStockRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `ZMW ${parseFloat(amount).toFixed(2)}`;

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">{stats?.total_orders || 0}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats?.pending || 0}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{stats?.paid || 0}</div>
          <div className="text-sm text-gray-600">Paid</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{stats?.delivered || 0}</div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600">{formatCurrency(stats?.total_revenue || 0)}</div>
          <div className="text-sm text-gray-600">Revenue</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-primary text-sm hover:underline">View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-semibold">Order #{order.id.slice(0, 8)}</div>
                    <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(order.total_amount)}</div>
                    <span className={`badge ${
                      order.status === 'delivered' ? 'badge-success' :
                      order.status === 'pending' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Low Stock Alerts</h2>
            <Link to="/admin/products" className="text-primary text-sm hover:underline">Manage →</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-green-600 text-center py-8">✓ All products well stocked</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map(product => (
                <div key={product.id} className="flex justify-between items-center border-b pb-2">
                  <div className="font-semibold">{product.name}</div>
                  <span className="badge badge-danger">{product.stock_quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/products" className="btn-primary">Manage Products</Link>
          <Link to="/admin/orders" className="btn-secondary">View Orders</Link>
          <a href="https://wa.me/260970000000" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600">
            💬 WhatsApp Business
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
