/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import OrderList from "../components/OrderList";
import { CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { mockOrders } from "../data/mockData";

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
        {["profile", "orderHistory"].map((tab) => (
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
              {tab === "profile" ? (
                <i className="ri-user-line text-lg"></i>
              ) : (
                <i className="ri-history-line text-lg"></i>
              )}
              {tab === "profile" ? "Profile Info" : "Order History"}
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
  const [isEditing, setIsEditing] = useState(false);
  const [userID, setUserID] = useState("");
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState("");
  const [orderData, setOrderData] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const { user, signOut } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!user) {
      navigate("/");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const table = user.isOwner ? 'restaurant_owners' : 'customers';
        const idField = user.isOwner ? 'owner_id' : 'customer_id';
        
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq(idField, user.id)
          .single();

        if (data) {
          setUserID(user.id);
          setName(data.name || user.user_metadata?.name || "User Name");
          setMobileNumber(data.phone_number || data.contact_number || user.user_metadata?.phone_number || "");
          setAddress(data.address || "");
          setImage(data.image_url || "");
          setIsLoading(false);
        } else {
          // Fallback if record not found
          setName(user.user_metadata?.name || "User Name");
          setMobileNumber(user.user_metadata?.phone_number || "");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === "orderHistory" && orderData.length === 0) {
      // Use mock data instead of API call
      setOrderData(mockOrders);
      setIsLoadingOrders(false);
    }
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
          {activeTab === "profile" ? (
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
          ) : (
            <OrderHistory orderData={orderData} isLoadingOrders={isLoadingOrders} />
          )}
        </div>
      </div>
    </div>
  );
}
