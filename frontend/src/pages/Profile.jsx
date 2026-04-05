/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderList from "../components/OrderList";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import CurrentOrders from "../components/CurrentOrders";
import ErrorBoundary from "../components/ErrorBoundary";

function Sidebar({ activeTab, handleTabChange, handleLogout, name, image }) {
  return (
    <div className="flex w-1/4 flex-col py-8 px-6 bg-white border border-gray-100 shadow-sm rounded-xl ml-4">
      <div className="mb-10 text-center">
        <img
          src={image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'}
          alt="User"
          className="mx-auto mb-4 h-32 w-32 rounded-full border-4 border-amber-500 shadow-md object-cover"
        />
        <h1 className="text-xl font-bold text-gray-900">{name || "User Name"}</h1>
        <p className="text-sm text-gray-500 mt-1">FoodOS Member</p>
      </div>

      <div className="flex flex-col gap-3">
        {[
          { id: "profile", label: "Profile Info", icon: "ri-user-line" },
          { id: "addresses", label: "Manage Addresses", icon: "ri-map-pin-line" },
          { id: "favorites", label: "Favorites", icon: "ri-heart-line" },
          { id: "currentOrders", label: "Live Tracking", icon: "ri-truck-line" },
          { id: "orderHistory", label: "Order History", icon: "ri-history-line" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`rounded-lg px-4 py-3 text-left font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            <div className="flex items-center gap-3">
              <i className={`${tab.icon} text-lg`}></i>
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-800"
      >
        <i className="ri-logout-box-r-line"></i>
        Log Out
      </button>
    </div>
  );
}

function ProfileForm({ name, setName, mobileNumber, setMobileNumber, address, setAddress, isEditing, setIsEditing }) {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // Mock profile update - just simulate success
      setTimeout(() => {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("An error occurred while updating the profile.");
      setLoading(false);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    setIsEditing((prev) => !prev);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto h-full rounded-xl bg-white p-8 border border-gray-100 shadow-sm"
    >
      <h2 className="mb-6 text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Personal Information</h2>
      <div className="space-y-6 max-w-2xl">
        {[
          { label: "Full Name", value: name, setValue: setName, id: "name" },
          { label: "Mobile Number", value: mobileNumber, setValue: setMobileNumber, id: "mobileNumber" },
          {
            label: "Delivery Address",
            value: address || (isEditing ? "" : "No address provided yet"),
            setValue: setAddress,
            id: "address",
          },
        ].map(({ label, value, setValue, id }) => (
          <div key={id} className="">
            <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor={id}>
              {label}
            </label>
            {id === "address" ? (
               <textarea
                className={`w-full appearance-none rounded-lg border ${isEditing ? 'border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 transition-colors focus:outline-none min-h-[100px]`}
                id={id}
                name={id}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditing}
              />
            ) : (
              <input
                className={`w-full appearance-none rounded-lg border ${isEditing ? 'border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500' : 'border-gray-200 bg-gray-50'} px-4 py-3 text-gray-700 transition-colors focus:outline-none`}
                id={id}
                type="text"
                name={id}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isEditing}
              />
            )}
          </div>
        ))}
      </div>

      {success && <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700 border border-green-200">{success}</div>}
      {error && <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">{error}</div>}

      <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
        {!isEditing ? (
          <button
            className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
            onClick={handleClick}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              className={`rounded-lg px-6 py-3 font-medium text-white transition-colors ${loading
                ? "cursor-not-allowed bg-amber-400"
                : "bg-amber-500 hover:bg-amber-600"
                }`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
              onClick={handleClick}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
}

function AddressManager({ user }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', text: '' });

  const fetchAddresses = async () => {
    setLoading(true);
    const { data } = await supabase.from('customer_addresses').select('*').eq('customer_id', user.id);
    setAddresses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAddresses(); }, [user]);

  const addAddress = async () => {
    if (!newAddr.text) return;
    await supabase.from('customer_addresses').insert([{ 
      customer_id: user.id, 
      address_label: newAddr.label, 
      address_text: newAddr.text,
      is_default: addresses.length === 0
    }]);
    setNewAddr({ label: 'Home', text: '' });
    setIsAdding(false);
    fetchAddresses();
  };

  const deleteAddress = async (id) => {
    await supabase.from('customer_addresses').delete().eq('address_id', id);
    fetchAddresses();
  };

  return (
    <div className="h-full rounded-xl bg-white p-8 border border-gray-100 shadow-sm overflow-y-auto">
       <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
          <button 
            onClick={() => setIsAdding(true)}
            className="text-xs font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 underline"
          >
            + Add New
          </button>
       </div>

       {isAdding && (
         <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 mb-6 space-y-4">
            <div>
               <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5">Label (e.g. Home, Work)</label>
               <input 
                type="text" value={newAddr.label} onChange={e => setNewAddr({...newAddr, label: e.target.value})}
                className="w-full bg-white border border-amber-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
               />
            </div>
            <div>
               <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5">Full Address</label>
               <textarea 
                value={newAddr.text} onChange={e => setNewAddr({...newAddr, text: e.target.value})}
                className="w-full bg-white border border-amber-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px]"
               />
            </div>
            <div className="flex gap-3">
               <button onClick={addAddress} className="flex-grow bg-amber-500 text-white rounded-lg py-2.5 font-bold text-xs uppercase tracking-widest shadow-sm">Save Address</button>
               <button onClick={() => setIsAdding(false)} className="px-6 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600">Cancel</button>
            </div>
         </div>
       )}

       <div className="space-y-4">
          {loading ? [1,2].map(i => <div key={i} className="h-24 bg-gray-50 rounded-xl animate-pulse"></div>) : 
           addresses.length === 0 ? <p className="text-gray-400 italic text-center py-10">No saved addresses yet.</p> :
           addresses.map(addr => (
             <div key={addr.address_id} className="p-5 border border-gray-100 rounded-xl flex justify-between items-start group hover:border-amber-200 transition-all">
                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                      <i className="ri-map-pin-2-line text-xl"></i>
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        {addr.address_label}
                        {addr.is_default && <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase">Default</span>}
                      </h4>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-md mt-1">{addr.address_text}</p>
                   </div>
                </div>
                <button onClick={() => deleteAddress(addr.address_id)} className="text-gray-300 hover:text-red-500 transition-colors">
                   <i className="ri-delete-bin-line"></i>
                </button>
             </div>
           ))
          }
       </div>
    </div>
  );
}

function FavoritesList({ user }) {
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('favorites')
      .select('*, restaurants(*)')
      .eq('customer_id', user.id);
    setFavs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFavs(); }, [user]);

  const removeFav = async (id) => {
    await supabase.from('favorites').delete().eq('favorite_id', id);
    fetchFavs();
  };

  return (
    <div className="h-full rounded-xl bg-white p-8 border border-gray-100 shadow-sm overflow-y-auto">
       <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">My Favorites</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? [1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse"></div>) :
           favs.length === 0 ? <p className="text-gray-400 italic text-center py-10 col-span-full">No favorites yet.</p> :
           favs.map(fav => (
             <div key={fav.favorite_id} className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
                <img src={fav.restaurants?.image_url} className="w-full h-32 object-cover opacity-80 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent flex flex-col justify-end p-4">
                   <h4 className="text-white font-bold text-lg leading-tight">{fav.restaurants?.restaurant_name}</h4>
                   <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{fav.restaurants?.cuisine_type}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFav(fav.favorite_id); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur rounded-full text-white hover:bg-white hover:text-red-500 flex items-center justify-center transition-all"
                >
                   <i className="ri-heart-fill"></i>
                </button>
                <div className="absolute inset-0 cursor-pointer" onClick={() => navigate('/restaurant', { state: { id: fav.restaurant_id } })}></div>
             </div>
           ))
          }
       </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [orderData, setOrderData] = useState([]);
  
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    urlTab === "currentOrders" ? "currentOrders" : "profile"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const { user, signOut } = useAuth();
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeOrderStatus, setActiveOrderStatus] = useState("Pending");

  // ⚡ STABLE PERSISTENT TRACKING: Fetch actual active order from DB on mount
  useEffect(() => {
    if (!user) return;

    const fetchActiveOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('order_id, order_status, total_amount, dispatched_at')
          .eq('customer_id', user.id)
          .in('order_status', ['Pending', 'Confirmed', 'Preparing', 'Dispatched'])
          .order('order_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          setActiveOrder({ id: data.order_id, total: data.total_amount, dispatchedAt: data.dispatched_at });
          setActiveOrderStatus(data.order_status);
          
          // Switch to tracker tab only if specifically opening profile from cart or if an order exists
          if (urlTab === "currentOrders" || !urlTab) {
             setActiveTab("currentOrders");
          }
        }
      } catch (err) {
        console.error('Active order recovery error:', err);
      }
    };

    fetchActiveOrder();
  }, [user, urlTab]);

  useEffect(() => {
    if (activeOrder?.id) {
      // Realtime listener for status changes
      const channel = supabase
        .channel(`active-order-${activeOrder.id}`)
        .on(
          'postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `order_id=eq.${activeOrder.id}` }, 
          (payload) => {
            console.log('Order update received:', payload.new.order_status);
            setActiveOrderStatus(payload.new.order_status);
            
            // If dispatched, update the local object too so the map has the timestamp
            if (payload.new.dispatched_at) {
              setActiveOrder(prev => ({ ...prev, dispatchedAt: payload.new.dispatched_at }));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeOrder]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!user) {
      // Only redirect if auth is fully resolved and there's definitively no user
      const timer = setTimeout(() => navigate("/"), 100);
      return () => clearTimeout(timer);
    }

    // ✅ Instant load from user_metadata — no spinner wait
    setName(user.user_metadata?.name || user.email?.split('@')[0] || "User");
    setMobileNumber(user.user_metadata?.phone_number || "");
    setIsLoading(false);

    // Background fetch for extra fields (address) from DB
    const fetchExtraProfile = async () => {
      try {
        const table   = user.isOwner ? 'restaurant_owners' : 'customers';
        const idField = user.isOwner ? 'owner_id' : 'customer_id';
        
        const { data } = await supabase
          .from(table)
          .select('name, phone_number, address')
          .eq(idField, user.id)
          .maybeSingle();

        if (data) {
          if (data.name)         setName(data.name);
          if (data.phone_number) setMobileNumber(data.phone_number);
          if (data.address)      setAddress(data.address);
        }
      } catch (err) {
        console.warn('Background profile fetch failed:', err.message);
      }
    };

    fetchExtraProfile();
  }, [user, navigate]);

  const fetchOrderHistory = async () => {
    if (!user) return;
    setIsLoadingOrders(true);
    try {
      console.log('Fetching orders for user:', user.id);
      
      const { data, error } = await supabase
        .from('orders')
        .select('order_id, total_amount, order_status, order_date, delivery_address')
        .eq('customer_id', user.id)
        .order('order_date', { ascending: false });
      
      console.log('Orders response:', { data, error, count: data?.length });
      
      if (error) throw error;

      const normalized = (data || []).map(o => ({
        ORDER_ID: o.order_id,
        ORDER_TIMESTAMP: new Date(o.order_date).toLocaleString(),
        STATUS: o.order_status || 'Pending',
        TOTAL_AMOUNT: Number(o.total_amount),
        items: []
      }));
      setOrderData(normalized);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrderData([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'orderHistory') {
      fetchOrderHistory();
    }
  };
  
  const handleLiveOrderComplete = async () => {
    // Order status was already updated to 'delivered' inside CurrentOrders
    setActiveOrder(null);
    // Refresh order history from DB so the delivered order shows up
    await fetchOrderHistory();
    setActiveTab('orderHistory');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.log(err);
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress color="warning" size={100} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <div className="mx-auto flex gap-6 pt-24 pb-12 w-[90%] max-w-7xl">
        <Sidebar activeTab={activeTab} handleTabChange={handleTabChange} handleLogout={handleLogout} name={name} image={image} />
        <div className="w-[75%] h-[calc(100vh-160px)]">
          <ErrorBoundary onReset={() => setActiveTab('profile')}>
            {activeTab === "profile" && (
              <ProfileForm
                name={name}
                setName={setName}
                mobileNumber={mobileNumber}
                setMobileNumber={setMobileNumber}
                address={address}
                setAddress={setAddress}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            )}

            {activeTab === "addresses" && (
              <AddressManager user={user} />
            )}

            {activeTab === "favorites" && (
              <FavoritesList user={user} />
            )}
            
            {activeTab === "currentOrders" && (
              activeOrder ? (
                activeOrderStatus === "Dispatched" ? (
                  <CurrentOrders
                    orderId={activeOrder.id}
                    orderTotal={activeOrder.total}
                    onOrderComplete={handleLiveOrderComplete}
                    dispatchedAt={activeOrder.dispatchedAt}
                  />
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6 relative">
                       <i className="ri-restaurant-line text-4xl animate-pulse"></i>
                       <div className="absolute inset-0 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-500 max-w-sm">The restaurant is currently preparing your delicious meal. We'll start live tracking as soon as it's dispatched!</p>
                    <div className="mt-8 px-6 py-2 bg-amber-100 text-amber-700 rounded-full text-xs font-black uppercase tracking-widest">
                       Status: {activeOrderStatus}
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-3xl mb-4">
                    <i className="ri-truck-line"></i>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Orders</h2>
                  <p className="text-gray-500">Your live delivery tracker will appear here after you place an order.</p>
                </div>
              )
            )}
            
            {activeTab === "orderHistory" && (
              <OrderList orderData={orderData} isLoadingOrders={isLoadingOrders} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
