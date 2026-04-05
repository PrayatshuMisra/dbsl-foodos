import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OwnerNav from '../components/OwnerNav';
import { 
  FiShoppingBag, 
  FiCheckCircle, 
  FiClock, 
  FiAlertCircle, 
  FiMapPin,
  FiPhone,
  FiTrendingUp,
  FiXCircle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import CurrentOrders from '../components/CurrentOrders';

export default function OwnerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Pending');
  const [trackedOrderId, setTrackedOrderId] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (user?.restaurantId) {
      fetchOrders();
      
      const channel = supabase
        .channel(`restaurant-${user.restaurantId}`)
        .on(
          'postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'orders', 
            filter: `restaurant_id=eq.${user.restaurantId}` 
          }, 
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false); 
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          order_date,
          total_amount,
          order_status,
          delivery_address,
          dispatched_at,
          customers (name, phone_number),
          order_details (
            quantity,
            subtotal,
            menu_items (item_name)
          )
        `)
        .eq('restaurant_id', user.restaurantId)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const updates = { order_status: status };
      if (status === 'Dispatched') {
        updates.dispatched_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('order_id', orderId);

      if (error) throw error;
      
      // Auto-open monitor for dispatching
      if (status === 'Dispatched') {
        setTrackedOrderId(orderId);
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.order_date).toDateString() === today);
    return [
      { label: 'Revenue Today', value: `₹${todayOrders.reduce((acc, o) => acc + Number(o.total_amount), 0)}`, icon: 'ri-money-rupee-circle-line', color: 'text-green-500', bg: 'bg-green-50' },
      { label: 'Orders Today', value: todayOrders.length, icon: 'ri-shopping-bag-line', color: 'text-amber-500', bg: 'bg-amber-50' },
      { label: 'Active Orders', value: orders.filter(o => ['Pending', 'Confirmed', 'Preparing'].includes(o.order_status)).length, icon: 'ri-time-line', color: 'text-blue-500', bg: 'bg-blue-50' },
      { label: 'Cancellations', value: orders.filter(o => o.order_status === 'Cancelled').length, icon: 'ri-close-circle-line', color: 'text-red-500', bg: 'bg-red-50' }
    ];
  }, [orders]);

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'Pending') return ['Pending', 'Confirmed', 'Preparing'].includes(o.order_status);
    if (activeTab === 'Dispatched') return o.order_status === 'Dispatched';
    if (activeTab === 'Completed') return o.order_status === 'Completed';
    return true;
  });

  if (!authLoading && user && user.isOwner === false && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6 mt-20">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-md">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
              <FiXCircle />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500">You don't have permission to access the owner dashboard. This area is reserved for restaurant partners.</p>
            <button 
              onClick={() => window.location.href = '/home'}
              className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="mx-auto flex gap-6 pt-24 pb-12 w-[90%] max-w-7xl flex-grow font-outfit">
        <OwnerNav />
        <div className="w-[75%] space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">Dashboard Overview</h1>
              <p className="text-gray-500 mt-1 font-medium tracking-tight">Real-time restaurant performance and order management</p>
            </div>
            <div className="flex bg-gray-100 p-1.5 rounded-xl gap-2">
               {['Pending', 'Dispatched', 'Completed'].map(tab => (
                 <button
                   key={tab}
                   onClick={() => {
                     setActiveTab(tab);
                     setTrackedOrderId(null);
                   }}
                   className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                     activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                   }`}
                 >
                   {tab === 'Pending' ? 'Live Orders' : tab}
                 </button>
               ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(loading ? [1,2,3,4] : stats).map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={loading ? i : stat.label}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden"
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
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                      <h3 className="text-xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Main Feed */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-grow min-h-[500px]">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <i className="ri-list-check-2 text-amber-500"></i> {trackedOrderId ? 'Delivery Monitor' : 'Order Stream'}
               </h3>
               {trackedOrderId && (
                 <button 
                   onClick={() => setTrackedOrderId(null)}
                   className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest flex items-center gap-1"
                 >
                   <i className="ri-arrow-left-line"></i> Back to Stream
                 </button>
               )}
            </div>

            <div className="p-6">
              {trackedOrderId ? (
                <div className="h-[500px]">
                   <CurrentOrders 
                    orderId={trackedOrderId} 
                    orderTotal={orders.find(o => o.order_id === trackedOrderId)?.total_amount}
                    onOrderComplete={() => {
                      setTrackedOrderId(null);
                      fetchOrders();
                    }}
                    dispatchedAt={orders.find(o => o.order_id === trackedOrderId)?.dispatched_at}
                   />
                </div>
              ) : loading ? (
                <div className="space-y-4">
                   {[1,2,3].map(i => (
                     <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex justify-between animate-pulse">
                        <div className="flex gap-4">
                           <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                           <div className="space-y-2">
                              <div className="h-4 w-32 bg-gray-200 rounded"></div>
                              <div className="h-2 w-48 bg-gray-200 rounded"></div>
                           </div>
                        </div>
                        <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="space-y-4">
                   <AnimatePresence mode="popLayout">
                    {filteredOrders.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 text-gray-400 font-medium italic"
                      >
                         No {activeTab.toLowerCase()} orders right now.
                      </motion.div>
                    ) : (
                      filteredOrders.map(order => (
                        <motion.div 
                          layout
                          key={order.order_id}
                          className="bg-gray-50 rounded-xl p-5 border border-gray-100 group transition-all hover:bg-white hover:shadow-md"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4">
                               <div className="w-12 h-12 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                                  #{order.order_id}
                               </div>
                               <div>
                                  <h4 className="font-bold text-gray-900">{order.customers?.name || 'Guest'}</h4>
                                  <p className="text-xs text-gray-500 font-medium">
                                     {new Date(order.order_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • 
                                     {order.delivery_address}
                                  </p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-bold text-amber-600">₹{order.total_amount}</p>
                               <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                 order.order_status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                 order.order_status === 'Preparing' ? 'bg-blue-100 text-blue-600' :
                                 'bg-green-100 text-green-600'
                               }`}>
                                 {order.order_status}
                               </span>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-4 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                             <div className="flex-grow">
                                <ul className="flex flex-wrap gap-2">
                                  {order.order_details?.map((detail, idx) => (
                                    <li key={idx} className="text-xs font-bold text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-100">
                                       {detail.quantity}x {detail.menu_items?.item_name}
                                    </li>
                                  ))}
                                </ul>
                             </div>
                             
                             <div className="flex gap-2">
                                {order.order_status === 'Pending' && (
                                  <button 
                                    onClick={() => updateStatus(order.order_id, 'Preparing')}
                                    className="px-6 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold uppercase transition-all hover:bg-amber-600"
                                  >
                                     Accept Order
                                  </button>
                                )}
                                {['Confirmed', 'Preparing'].includes(order.order_status) && (
                                  <button 
                                    onClick={() => updateStatus(order.order_id, 'Dispatched')}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold uppercase transition-all hover:bg-blue-600"
                                  >
                                     Dispatch
                                  </button>
                                )}
                                {order.order_status === 'Dispatched' && (
                                  <div className="flex gap-2">
                                     <button 
                                       onClick={() => setTrackedOrderId(order.order_id)}
                                       className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase transition-all hover:bg-gray-200 flex items-center gap-2"
                                     >
                                       <i className="ri-map-pin-line text-amber-500"></i> Monitor
                                     </button>
                                     <button 
                                       onClick={() => updateStatus(order.order_id, 'Completed')}
                                       className="px-6 py-2 bg-green-500 text-white rounded-lg text-xs font-bold uppercase transition-all hover:bg-green-600"
                                     >
                                       Complete
                                     </button>
                                  </div>
                                )}
                                {order.order_status !== 'Cancelled' && order.order_status !== 'Completed' && (
                                   <button 
                                     onClick={() => updateStatus(order.order_id, 'Cancelled')}
                                     className="px-4 py-2 text-gray-400 hover:text-red-500 font-bold transition-colors text-xs"
                                   >
                                      Cancel
                                   </button>
                                )}
                             </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
