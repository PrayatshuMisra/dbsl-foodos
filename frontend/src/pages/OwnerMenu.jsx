import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OwnerNav from '../components/OwnerNav';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle, 
  FiXCircle,
  FiFilter
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';

export default function OwnerMenu() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'promotions'
  
  // Coupon State
  const [coupons, setCoupons] = useState([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    coupon_code: '',
    discount_type: 'PERCENTAGE',
    discount_value: '',
    minimum_order_value: 0,
    expiry_date: '',
    is_active: true
  });
  
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    price: '',
    category_id: '',
    availability_status: true,
    image_url: ''
  });

  useEffect(() => {
    if (authLoading) return;

    if (user?.restaurantId) {
      fetchMenuData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catsRes, couponsRes] = await Promise.all([
        supabase.from('menu_items').select('*, menu_categories(category_name)').eq('restaurant_id', user.restaurantId),
        supabase.from('menu_categories').select('*').eq('restaurant_id', user.restaurantId),
        supabase.from('coupons').select('*').eq('restaurant_id', user.restaurantId)
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (catsRes.error) throw catsRes.error;

      setItems(itemsRes.data || []);
      setCategories(catsRes.data || []);
      setCoupons(couponsRes.data || []);
    } catch (err) {
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...couponFormData,
        restaurant_id: user.restaurantId,
        coupon_code: couponFormData.coupon_code.toUpperCase()
      };
      
      let error;
      if (editingCoupon) {
        ({ error } = await supabase.from('coupons').update(payload).eq('coupon_id', editingCoupon.coupon_id));
      } else {
        ({ error } = await supabase.from('coupons').insert([payload]));
      }

      if (error) throw error;
      setIsCouponModalOpen(false);
      fetchMenuData();
    } catch (err) {
      alert('Coupon save failed: ' + err.message);
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await supabase.from('coupons').delete().eq('coupon_id', id);
    fetchMenuData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 🟢 Fix: Sanitize payload to remove joined objects (like menu_categories) 
      // which are not actual columns in the menu_items table.
      const sanitizedData = { ...formData };
      delete sanitizedData.menu_categories;
      delete sanitizedData.category_name; // Just in case it's there

      const payload = {
        ...sanitizedData,
        restaurant_id: user.restaurantId,
        price: Number(formData.price)
      };

      let error;
      if (editingItem) {
        ({ error } = await supabase.from('menu_items').update(payload).eq('item_id', editingItem.item_id));
      } else {
        ({ error } = await supabase.from('menu_items').insert([payload]));
      }

      if (error) throw error;
      
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({
        item_name: '',
        description: '',
        price: '',
        category_id: '',
        availability_status: true,
        image_url: ''
      });
      fetchMenuData();
    } catch (err) {
      alert('Failed to save item: ' + err.message);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const { error } = await supabase.from('menu_items').delete().eq('item_id', id);
      if (error) throw error;
      fetchMenuData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ availability_status: !item.availability_status })
        .eq('item_id', item.item_id);
      if (error) throw error;
      fetchMenuData();
    } catch (err) {
      alert('Update failed');
    }
  };

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
            <p className="text-gray-500">You don't have permission to manage menus. This area is reserved for restaurant partners.</p>
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
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-grow">
              <div className="flex gap-4 mb-2">
                 {['menu', 'promotions'].map(t => (
                   <button 
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
                      activeTab === t ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200' : 'bg-white border-gray-200 text-gray-400 hover:border-amber-500 hover:text-amber-500'
                    }`}
                   >
                     {t}
                   </button>
                 ))}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {activeTab === 'menu' ? 'Menu Management' : 'Promotion Control'}
              </h1>
              <p className="text-gray-500 mt-1 font-medium tracking-tight">
                {activeTab === 'menu' ? "Add and customize your restaurant's digital menu cards" : "Create exclusive offers and discounts for your customers"}
              </p>
            </div>
            <button 
              onClick={() => {
                if (activeTab === 'menu') {
                  setEditingItem(null);
                  setFormData({ item_name: '', description: '', price: '', category_id: categories[0]?.category_id || '', availability_status: true, image_url: '' });
                  setIsModalOpen(true);
                } else {
                  setEditingCoupon(null);
                  setCouponFormData({ coupon_code: '', discount_type: 'PERCENTAGE', discount_value: '', minimum_order_value: 0, expiry_date: '', is_active: true });
                  setIsCouponModalOpen(true);
                }
              }}
              className="bg-amber-500 text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-amber-600 transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <FiPlus size={18} />
              {activeTab === 'menu' ? 'Add Dish' : 'Create Coupon'}
            </button>
          </div>

          {/* Control Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-lg border border-gray-200 flex-grow max-w-md focus-within:ring-2 focus-within:ring-amber-500 transition-all">
              <FiSearch size={18} className="text-gray-400" />
              <input type="text" placeholder="Search your menu..." className="bg-transparent border-none outline-none text-sm font-medium w-full" />
            </div>
            <button className="px-4 py-2.5 bg-gray-50 text-gray-600 rounded-lg font-bold text-xs flex items-center gap-2 border border-gray-200 hover:bg-white transition-all">
              <FiFilter size={14} /> All Categories
            </button>
          </div>

          {activeTab === 'menu' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                    <div className="h-44 bg-gray-100"></div>
                    <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="h-4 w-24 bg-gray-100 rounded"></div>
                          <div className="h-4 w-12 bg-gray-100 rounded"></div>
                        </div>
                        <div className="h-8 w-full bg-gray-100 rounded"></div>
                        <div className="h-10 w-full bg-gray-100 rounded"></div>
                    </div>
                  </div>
                ))
              ) : items.map((item) => (
                <motion.div 
                  layout
                  key={item.item_id}
                  className={`group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 ${!item.availability_status && 'opacity-70'}`}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 flex gap-2 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300">
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setFormData(item);
                          setIsModalOpen(true);
                        }}
                        className="w-9 h-9 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center text-gray-600 hover:text-amber-600 transition-colors"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button 
                        onClick={() => deleteItem(item.item_id)}
                        className="w-9 h-9 bg-white/90 backdrop-blur shadow-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${item.availability_status ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                          {item.availability_status ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 truncate pr-2">{item.item_name}</h3>
                      <span className="font-bold text-gray-900">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium line-clamp-2 min-h-[32px]">
                      {item.description || "No description provided."}
                    </p>
                    
                    <button 
                      onClick={() => toggleAvailability(item)}
                      className={`w-full py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest border transition-all ${
                        item.availability_status 
                        ? 'border-gray-200 text-gray-500 hover:bg-gray-50' 
                        : 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {item.availability_status ? 'Mark Sold Out' : 'Restock Item'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {coupons.map(coupon => (
                 <div key={coupon.coupon_id} className="bg-white p-6 rounded-xl border border-dashed border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500 text-white flex items-center justify-center translate-x-4 -translate-y-4 rotate-45 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:rotate-0 transition-all duration-300">
                       <i className="ri-ticket-2-line"></i>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                             {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                          </span>
                          <h3 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">{coupon.coupon_code}</h3>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={() => { setEditingCoupon(coupon); setCouponFormData(coupon); setIsCouponModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                          >
                             <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => deleteCoupon(coupon.coupon_id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                             <FiTrash2 size={16} />
                          </button>
                       </div>
                    </div>
                    <div className="space-y-1">
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-tight flex items-center gap-2">
                          <i className="ri-shopping-bag-line text-amber-500"></i> Min Order: ₹{coupon.minimum_order_value}
                       </p>
                       <p className="text-xs text-gray-500 font-bold uppercase tracking-tight flex items-center gap-2">
                          <i className="ri-calendar-event-line text-amber-500"></i> Expires: {new Date(coupon.expiry_date).toLocaleDateString()}
                       </p>
                    </div>
                 </div>
               ))}
               {coupons.length === 0 && (
                 <div className="col-span-full py-20 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-400 font-medium italic">No active promotions. Start by creating your first coupon!</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-8"
             >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingItem ? 'Update Dish' : 'Create New Dish'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="space-y-4">
                      <div>
                         <label className="text-xs font-bold text-gray-700 mb-1.5 block">Item Name</label>
                         <input 
                           required type="text"
                           className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                           value={formData.item_name}
                           onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-gray-700 mb-1.5 block">Price (₹)</label>
                           <input 
                             required type="number"
                             className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                             value={formData.price}
                             onChange={(e) => setFormData({...formData, price: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-700 mb-1.5 block">Category</label>
                           <select 
                             required
                             className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                             value={formData.category_id}
                             onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                           >
                              {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                           </select>
                        </div>
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-700 mb-1.5 block">Description</label>
                         <textarea 
                           className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 transition-all outline-none h-24 resize-none"
                           value={formData.description}
                           onChange={(e) => setFormData({...formData, description: e.target.value})}
                         />
                      </div>
                      <div>
                         <label className="text-xs font-bold text-gray-700 mb-1.5 block">Image Link</label>
                         <input 
                           type="url"
                           className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                           value={formData.image_url}
                           onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="pt-6 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-grow py-3 rounded-lg font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-grow bg-gray-900 text-white rounded-lg font-bold text-sm py-3 hover:bg-gray-800 transition-all shadow-md"
                      >
                        {editingItem ? 'Save Updates' : 'Add to Menu'}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Coupon Modal */}
      <AnimatePresence>
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsCouponModalOpen(false)}
               className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-8"
             >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingCoupon ? 'Update Offer' : 'Create New Offer'}
                </h2>

                <form onSubmit={handleCouponSubmit} className="space-y-4">
                   <div className="space-y-4">
                      <div>
                         <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-widest">Coupon Code</label>
                         <input 
                           required type="text"
                           placeholder="E.G. WELCOME50"
                           className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-black uppercase focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                           value={couponFormData.coupon_code}
                           onChange={(e) => setCouponFormData({...couponFormData, coupon_code: e.target.value})}
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-widest">Discount Type</label>
                           <select 
                             className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                             value={couponFormData.discount_type}
                             onChange={(e) => setCouponFormData({...couponFormData, discount_type: e.target.value})}
                           >
                              <option value="PERCENTAGE">Percentage (%)</option>
                              <option value="FLAT">Flat Amount (₹)</option>
                           </select>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-widest">Value</label>
                           <input 
                             required type="number"
                             className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                             value={couponFormData.discount_value}
                             onChange={(e) => setCouponFormData({...couponFormData, discount_value: e.target.value})}
                           />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-widest">Min Order (₹)</label>
                           <input 
                             required type="number"
                             className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                             value={couponFormData.minimum_order_value}
                             onChange={(e) => setCouponFormData({...couponFormData, minimum_order_value: Number(e.target.value)})}
                           />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-widest">Expiry Date</label>
                           <input 
                             required type="date"
                             className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                             value={couponFormData.expiry_date}
                             onChange={(e) => setCouponFormData({...couponFormData, expiry_date: e.target.value})}
                           />
                        </div>
                      </div>
                   </div>

                   <div className="pt-6 flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setIsCouponModalOpen(false)}
                        className="flex-grow py-3 rounded-lg font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-grow bg-gray-900 text-white rounded-lg font-bold text-sm py-3 hover:bg-gray-800 transition-all shadow-md"
                      >
                        {editingCoupon ? 'Update Offer' : 'Launch Offer'}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
