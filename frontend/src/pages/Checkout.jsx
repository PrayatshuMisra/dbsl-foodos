/* eslint-disable react/prop-types */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Cart from "../components/Cart";
import { CircularProgress } from "@mui/material";
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [paymentOption, setPaymentOption] = useState("Cash on Delivery");
  const [isLoading, setIsLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [saveThisAddress, setSaveThisAddress] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      if (user) {
        try {
          const [profileRes, addrRes] = await Promise.all([
            supabase.from('customers').select('*').eq('customer_id', user.id).single(),
            supabase.from('customer_addresses').select('*').eq('customer_id', user.id)
          ]);

          if (profileRes.data) {
            setName(profileRes.data.name || "");
            setMobile(profileRes.data.phone_number || "");
            if (!addrRes.data?.length) {
              setAddress(profileRes.data.address || "");
            }
          }

          if (addrRes.data) {
            setSavedAddresses(addrRes.data);
            const defaultAddr = addrRes.data.find(a => a.is_default);
            if (defaultAddr) setAddress(defaultAddr.address_text);
          }
        } catch (e) {
          console.error("Error fetching data", e);
        }
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user]);

  const handleSaveAddress = async () => {
    if (!address || isSavingAddress) return;
    setIsSavingAddress(true);
    try {
      const { error } = await supabase.from('customer_addresses').insert([{
        customer_id: user.id,
        address_label: 'Other',
        address_text: address,
        is_default: savedAddresses.length === 0
      }]);
      if (error) throw error;

      const { data } = await supabase.from('customer_addresses').select('*').eq('customer_id', user.id);
      setSavedAddresses(data || []);
      setSaveThisAddress(false);
      alert("Address saved successfully!");
    } catch (err) {
      alert("Failed to save address");
    } finally {
      setIsSavingAddress(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent pt-24 pb-12">
      <Navbar />

      <div className="mx-auto flex flex-col lg:flex-row gap-6 w-[95%] max-w-7xl">
        {!(name || mobile || address) && isLoading ? (
          <div className="mx-auto flex items-center justify-center h-64">
            <CircularProgress color="warning" size={60} />
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: Form */}
            <div className="w-full lg:w-[60%] glass-card p-6 shadow-lg border-white/10">
              <div className="mb-6 border-b border-white/5 pb-6">
                <h2 className="mb-4 text-lg font-bold text-white border-l-4 border-amber-500 pl-3">Personal Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Full Name</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white/10 text-white transition-colors placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-400">Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white/10 text-white transition-colors placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6 border-b border-white/5 pb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-white border-l-4 border-amber-500 pl-3">Delivery Address</h2>
                  {savedAddresses.length > 0 && (
                    <div className="flex gap-2">
                      {savedAddresses.slice(0, 3).map(addr => (
                        <button
                          key={addr.address_id}
                          onClick={() => setAddress(addr.address_text)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${address === addr.address_text
                              ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-amber-500 hover:text-amber-500'
                            }`}
                        >
                          {addr.address_label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  placeholder="Enter your full delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-24 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white/10 text-white transition-colors resize-none mb-3 placeholder:text-slate-500"
                ></textarea>

                {!savedAddresses.find(a => a.address_text === address) && address && (
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={saveThisAddress}
                      onChange={(e) => setSaveThisAddress(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-amber-600 transition-colors">Save this address for later</span>
                  </label>
                )}

                {saveThisAddress && (
                  <button
                    onClick={handleSaveAddress}
                    disabled={isSavingAddress}
                    className="mt-3 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 underline"
                  >
                    {isSavingAddress ? 'Saving...' : 'Confirm Save'}
                  </button>
                )}
              </div>

              <div>
                <h2 className="mb-4 text-lg font-bold text-white border-l-4 border-amber-500 pl-3">Payment Options</h2>
                <select
                  value={paymentOption}
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white/10 text-white transition-colors cursor-pointer appearance-none"
                >
                  <option className="bg-gray-900" value="Cash on Delivery">Cash on Delivery</option>
                  <option className="bg-gray-900" value="GPay">GPay / UPI</option>
                  <option className="bg-gray-900" value="PayTM">PayTM</option>
                  <option className="bg-gray-900" value="Credit Card">Credit/Debit Card</option>
                </select>
              </div>
            </div>

            {/* RIGHT COLUMN: Cart Summary */}
            {/* FIX: Changed overflow-hidden to overflow-y-auto and added scrollbar styles */}
            <div className="w-full lg:w-[40%] glass-card p-6 h-fit lg:sticky top-24 lg:max-h-[calc(100vh-120px)] flex flex-col shadow-lg border-white/10 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <CircularProgress color="warning" size={60} />
                </div>
              ) : (
                <Cart
                  name={name}
                  mobile={mobile}
                  address={address}
                  paymentOption={paymentOption}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Checkout;