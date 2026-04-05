import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CircularProgress from '@mui/material/CircularProgress';

export default function OwnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalDelivered: 0
  });

  // Security & fetching logic
  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.isOwner === false) {
      navigate('/');
      return;
    }

    if (user?.restaurantId) {
      fetchDashboardData(user.restaurantId);
    }
  }, [user, authLoading, navigate]);

  const fetchDashboardData = async (restaurantId) => {
    setLoading(true);
    try {
      // Fetch core orders
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          order_date,
          total_amount,
          order_status,
          delivery_address,
          customers (name, phone_number),
          order_details (
            quantity,
            subtotal,
            menu_items (item_name)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('order_date', { ascending: false });

      if (error) throw error;
      
      setOrders(orderData || []);
      
      // Calculate Stats
      let revenue = 0;
      let active = 0;
      let delivered = 0;
      
      (orderData || []).forEach(order => {
        if (order.order_status === 'Completed' || order.order_status === 'Dispatched') {
          revenue += Number(order.total_amount);
          delivered++;
        }
        if (order.order_status === 'Pending' || order.order_status === 'Preparing') {
          active++;
        }
      });
      
      setStats({
        totalRevenue: revenue,
        activeOrders: active,
        totalDelivered: delivered
      });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('order_id', orderId);
        
      if (error) throw error;
      
      // optimistic update
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, order_status: newStatus } : o));
      
      // Update stats based on action
      if (newStatus === 'Dispatched') {
        setStats(prev => ({
          ...prev,
          activeOrders: Math.max(0, prev.activeOrders - 1),
          totalDelivered: prev.totalDelivered + 1,
          totalRevenue: prev.totalRevenue + Number(orders.find(o => o.order_id === orderId)?.total_amount || 0)
        }));
      }
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <CircularProgress color="warning" size={60} />
      </div>
    );
  }

  // Generate chart data based on last 7 days from mock/actual orders
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 w-full">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">Owner Dashboard</h1>
            <p className="text-gray-600 mt-2 ml-4">Manage orders and view performance</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-500 text-2xl mr-4">
              <i className="ri-money-rupee-circle-line"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-2xl mr-4">
              <i className="ri-shopping-basket-line"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.activeOrders}</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 text-2xl mr-4">
              <i className="ri-truck-line"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Dispatched</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalDelivered}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column - Orders Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Live Orders Feed</h2>
              
              <div className="space-y-4">
                {orders.length === 0 ? (
                   <p className="text-gray-500 text-center py-8">No orders received yet.</p>
                ) : (
                  orders.map(order => (
                    <div key={order.order_id} className="border border-gray-100 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-gray-900">Order #{order.order_id}</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.order_status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                              order.order_status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {order.order_status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(order.order_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • 
                            {order.customers?.name} • 
                            {order.customers?.phone_number}
                          </p>
                        </div>
                        <h3 className="text-lg font-bold text-amber-500 border border-amber-200 bg-amber-50 px-3 py-1 rounded-lg">
                          ₹{order.total_amount}
                        </h3>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3 mb-4 text-sm">
                        <ul className="space-y-1">
                          {order.order_details?.map((detail, idx) => (
                            <li key={idx} className="flex justify-between text-gray-700">
                              <span>{detail.quantity}x {detail.menu_items?.item_name || 'Unknown Item'}</span>
                              <span className="text-gray-500">₹{detail.subtotal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        <i className="ri-map-pin-line mr-1"></i> {order.delivery_address}
                      </p>
                      
                      <div className="flex gap-3">
                        {order.order_status === 'Pending' && (
                          <button 
                            onClick={() => updateOrderStatus(order.order_id, 'Preparing')}
                            className="bg-amber-500 text-white px-4 py-2 rounded font-medium hover:bg-amber-600 transition-colors"
                          >
                            Accept & Prepare
                          </button>
                        )}
                        {order.order_status === 'Preparing' && (
                          <button 
                            onClick={() => updateOrderStatus(order.order_id, 'Dispatched')}
                            className="bg-green-500 text-white px-4 py-2 rounded font-medium hover:bg-green-600 transition-colors"
                          >
                            Dispatch Order
                          </button>
                        )}
                        {order.order_status !== 'Dispatched' && order.order_status !== 'Completed' && (
                          <button 
                            onClick={() => updateOrderStatus(order.order_id, 'Cancelled')}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Weekly Chart purely built with Tailwind CSS */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Weekly Volume (Mock)</h2>
              <div className="flex justify-between items-end h-48 mb-4 border-b border-gray-100 pb-2">
                {[45, 60, 30, 80, 50, 95, 75].map((height, i) => (
                  <div key={i} className="flex flex-col items-center w-8 group">
                    <div 
                      className="w-full bg-amber-400 group-hover:bg-amber-500 rounded-t-sm transition-all duration-300 relative"
                      style={{ height: `${height}%` }}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded font-medium transition-opacity">
                        {height}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs font-semibold text-gray-400">
                {chartDays.map(day => <span key={day}>{day}</span>)}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
