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
        {["profile", "currentOrders", "orderHistory"].map((tab) => (
          <button
            key={tab}
            className={`rounded-lg px-4 py-3 text-left font-medium transition-colors ${
              activeTab === tab
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => handleTabChange(tab)}
          >
            <div className="flex items-center gap-3">
              {tab === "profile" && <i className="ri-user-line text-lg"></i>}
              {tab === "currentOrders" && <i className="ri-truck-line text-lg"></i>}
              {tab === "orderHistory" && <i className="ri-history-line text-lg"></i>}
              
              {tab === "profile" && "Profile Info"}
              {tab === "currentOrders" && "Live Tracking"}
              {tab === "orderHistory" && "Order History"}
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

function OrderHistory({ orderData, isLoadingOrders }) {
  return (
    <div className="h-full overflow-auto rounded-xl bg-white p-8 border border-gray-100 shadow-sm">
      <h2 className="mb-6 border-b border-gray-100 pb-4 text-2xl font-bold text-gray-900">Order History</h2>
      {isLoadingOrders ? (
        <div className="mt-8 flex items-center justify-center">
          <CircularProgress color="warning" size={50} />
        </div>
      ) : orderData.length ? (
        <OrderList orderData={orderData} />
      ) : (
        <h1 className="ml-4">No orders made yet</h1>
      )}
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
              <OrderHistory orderData={orderData} isLoadingOrders={isLoadingOrders} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
