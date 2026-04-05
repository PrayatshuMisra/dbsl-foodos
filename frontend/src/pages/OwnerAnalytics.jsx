import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OwnerNav from '../components/OwnerNav';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area, Legend
} from 'recharts';
import {
  FiTrendingUp,
  FiUsers,
  FiShoppingBag,
  FiCalendar,
  FiDownload,
  FiArrowUpRight,
  FiArrowDownRight
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';

export default function OwnerAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (authLoading) return;

    if (user?.restaurantId) {
      fetchAnalyticsData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          order_date,
          total_amount,
          customer_id,
          order_details (
            quantity,
            menu_items (item_name, category_id, menu_categories (category_name))
          )
        `)
        .eq('restaurant_id', user.restaurantId)
        .order('order_date', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const revenueData = useMemo(() => {
    const daily = {};
    orders.forEach(order => {
      const date = new Date(order.order_date).toLocaleDateString('en-US', { weekday: 'short' });
      daily[date] = (daily[date] || 0) + Number(order.total_amount);
    });
    return Object.entries(daily).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const dishData = useMemo(() => {
    const counter = {};
    orders.forEach(order => {
      order.order_details?.forEach(detail => {
        const name = detail.menu_items?.item_name || 'Unknown';
        counter[name] = (counter[name] || 0) + detail.quantity;
      });
    });
    return Object.entries(counter)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [orders]);

  const peakHoursData = useMemo(() => {
    const hours = Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.order_date).getHours();
      hours[hour]++;
    });

    // Transform to readable format (12 AM, 1 AM, etc.)
    return hours.map((count, hr) => ({
      name: hr === 0 ? '12 AM' : hr === 12 ? '12 PM' : hr > 12 ? `${hr - 12} PM` : `${hr} AM`,
      value: count,
      fullHour: hr
    })).filter(h => h.fullHour >= 8 && h.fullHour <= 23); // Only show operating hours 8 AM - 11 PM
  }, [orders]);

  const uniqueCustomers = useMemo(() => {
    const ids = new Set(orders.map(o => o.customer_id));
    return ids.size;
  }, [orders]);

  const customerLoyaltyData = useMemo(() => {
    const customerOrderCounts = {};
    orders.forEach(order => {
      customerOrderCounts[order.customer_id] = (customerOrderCounts[order.customer_id] || 0) + 1;
    });

    let returning = 0;
    let newCust = 0;
    Object.values(customerOrderCounts).forEach(count => {
      if (count > 1) returning++;
      else newCust++;
    });

    return [
      { name: 'Returning', value: returning },
      { name: 'New', value: newCust }
    ];
  }, [orders]);

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer ID', 'Total Amount', 'Status'];
    const rows = orders.map(o => [
      o.order_id,
      new Date(o.order_date).toLocaleString(),
      o.customer_id,
      o.total_amount,
      o.order_status
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FoodOS_Analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#F59E0B', '#F43F5E', '#10B981', '#3B82F6', '#8B5CF6'];

  const stats = [
    { name: 'Total Revenue', value: `₹${orders.reduce((acc, o) => acc + Number(o.total_amount), 0).toLocaleString()}`, icon: 'ri-money-rupee-circle-line', change: '+12.5%', color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Total Orders', value: orders.length, icon: 'ri-shopping-bag-line', change: '+8.2%', color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Avg. Order', value: `₹${orders.length ? Math.round(orders.reduce((acc, o) => acc + Number(o.total_amount), 0) / orders.length) : 0}`, icon: 'ri-funds-line', change: '-2.1%', color: 'text-amber-500', bg: 'bg-amber-50' },
    { name: 'Unique Customers', value: uniqueCustomers, icon: 'ri-user-heart-line', change: '+15.4%', color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  if (authLoading) return null;

  if (!authLoading && user && user.isOwner === false && !loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6 mt-20">
          <div className="glass-card shadow-xl p-12 text-center max-w-md">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              <FiXCircle />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400">You don't have permission to view business analytics. This area is reserved for restaurant partners.</p>
            <button
              onClick={() => window.location.href = '/home'}
              className="mt-8 bg-white/10 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-white/20 border border-white/10 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Navbar />
      <div className="mx-auto flex gap-6 pt-24 pb-12 w-[90%] max-w-7xl flex-grow font-outfit">
        <OwnerNav />
        <div className="w-[75%] space-y-8">
          {/* Header */}
          <div className="glass-card p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">Business Intelligence</h1>
              <p className="text-slate-400 mt-1 font-medium tracking-tight">Advanced sales analytics and growth insights</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-lg font-bold text-xs hover:bg-gray-800 transition-all shadow-sm"
              >
                <FiDownload /> Export CSV
              </button>
 <select
  value={timeRange}
  onChange={(e) => setTimeRange(e.target.value)}
  className="bg-black text-white border border-white/10 rounded-lg px-4 py-2.5 font-bold text-xs focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
>
  <option className="bg-gray-900 text-white" value="24h">Last 24 Hours</option>
  <option className="bg-gray-900 text-white" value="7d">Last 7 Days</option>
  <option className="bg-gray-900 text-white" value="30d">Last 30 Days</option>
</select>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(loading ? [1, 2, 3, 4] : stats).map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={loading ? i : stat.name}
                className="glass-card p-6 shadow-md flex items-center gap-4 overflow-hidden relative"
              >
                {loading ? (
                  <div className="w-full flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                    <div className="space-y-2 flex-grow">
                      <div className="h-2 w-12 bg-gray-100 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                      <i className={stat.icon}></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{stat.name}</p>
                      <h3 className="text-lg font-bold text-white">{stat.value}</h3>
                      <span className="text-[10px] font-bold text-green-400">{stat.change}</span>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6 shadow-lg min-h-[350px] relative overflow-hidden border-white/10">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Revenue Stream</h3>
              <div className="h-64 w-full">
                {loading ? (
                  <div className="w-full h-full bg-gray-50 animate-pulse rounded-lg flex flex-col justify-end p-4 gap-2">
                    <div className="h-[60%] w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-full flex gap-4">
                      {[1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="h-full flex-grow bg-gray-100 rounded"></div>)}
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="glass-card p-6 shadow-lg min-h-[350px] relative overflow-hidden border-white/10">
  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Popular Dishes</h3>
  <div className="h-64 w-full">
    {loading ? (
      <div className="space-y-4 pt-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-2 w-16 bg-white/20 rounded"></div>
            <div
              className="h-4 flex-grow bg-white/20 rounded mr-12"
              style={{ width: `${100 - i * 15}%` }}
            ></div>
          </div>
        ))}
      </div>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dishData} layout="vertical" margin={{ left: 20 }}>
          {/* Added white tick styling, but kept 'hide' just in case you want it hidden */}
          <XAxis 
            type="number" 
            hide 
            tick={{ fill: '#FFFFFF', fontSize: 10 }} 
          />
          
          {/* Changed fill color to #FFFFFF */}
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}
            width={80}
          />
          
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} 
            contentStyle={{ backgroundColor: '#1f2937', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} 
            itemStyle={{ color: '#fff' }}
          />
          
          <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
            {dishData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
</div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            <div className="glass-card p-6 shadow-lg flex flex-col min-h-[350px] border-white/10">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Hourly Order Traffic</h3>
              <div className="h-64 w-full">
                {loading ? (
                  <div className="w-full h-full bg-slate-800/50 animate-pulse rounded-lg flex items-end p-4 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="flex-grow bg-slate-700/50 rounded-t" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                    ))}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakHoursData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 'bold' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 'bold' }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0F172A', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                          color: '#fff' 
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Orders"
                        fill="#F59E0B" 
                        radius={[4, 4, 0, 0]} 
                        barSize={30}
                      >
                        {peakHoursData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value > 5 ? '#F59E0B' : '#D97706'} opacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-8 rounded-xl shadow-lg relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <i className="ri-flashlight-line text-9xl"></i>
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-2">
                  <i className="ri-magic-line"></i> AI Smart Insights
                </h3>
                <p className="text-sm font-medium leading-relaxed opacity-90">
                  "Peak ordering occurs between 7 PM and 9 PM. Your currently busiest dish is '{dishData[0]?.name || 'N/A'}'.
                  <br /><br />
                  <strong className="block text-white">Action Plan:</strong>
                  {customerLoyaltyData[0].value > customerLoyaltyData[1].value
                    ? "High customer retention! Launch a 'Loyalty Club' coupon to reward your regulars."
                    : "Lots of new faces! Offer a 'First Order' discount to convert them into regulars."}
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="relative z-10 w-fit mt-8 px-6 py-2.5 bg-white text-amber-600 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-xl shadow-amber-900/20"
              >
                Generate PDF Report
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
