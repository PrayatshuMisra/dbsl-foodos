/* eslint-disable react/prop-types */

import { useState, useEffect } from "react";
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
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const { data } = await supabase.from('customers').select('*').eq('customer_id', user.id).single();
          if (data) {
            setName(data.name || "");
            setMobile(data.phone_number || "");
            setAddress(data.address || "");
          }
        } catch(e) {
          console.error("Error fetching profile", e);
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="min-h-screen w-full bg-gray-50 pt-24 pb-12">
      <Navbar />

      <div className="mx-auto flex flex-col md:flex-row gap-6 w-[90%] max-w-7xl">
        {!(name || mobile || address) && isLoading ? (
          <div className="mx-auto flex items-center justify-center h-64">
            <CircularProgress color="warning" size={60} />
          </div>
        ) : (
          <>
            <div className="w-full md:w-[60%] bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">Personal Details</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Mobile Number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="mb-4 text-xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">Delivery Address</h2>
                <textarea
                  placeholder="Enter your full delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-28 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>
              <div>
                <h2 className="mb-4 text-xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">Payment Options</h2>
                <select
                  value={paymentOption}
                  onChange={(e) => setPaymentOption(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors cursor-pointer appearance-none"
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="GPay">GPay / UPI</option>
                  <option value="PayTM">PayTM</option>
                  <option value="Credit Card">Credit/Debit Card</option>
                </select>
              </div>
            </div>

            <div className="w-full md:w-[40%] bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit sticky top-28">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <CircularProgress color="warning" size={100} />
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
