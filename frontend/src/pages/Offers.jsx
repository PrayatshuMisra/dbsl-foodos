import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { FiCopy, FiCheckCircle } from 'react-icons/fi';

export default function Offers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate("/");
      return;
    }

    const fetchCoupons = async () => {
      try {
        const { data, error } = await supabase.from("coupons").select("*");
        if (data) setCoupons(data);
      } catch (err) {
        console.error("Error fetching coupons:", err);
      }
      setIsLoading(false);
    };

    fetchCoupons();
  }, [user, navigate]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-grow flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full relative">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>

        <div className="max-w-5xl w-full relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white-900 mb-4 tracking-tight drop-shadow-sm">
              Exclusive <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Offers</span>
            </h1>
            <p className="text-white-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Use these handpicked codes to save big on your next delicious meal!
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center h-64 items-center bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !coupons.length ? (
            <div className="bg-white p-12 md:p-16 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center w-full max-w-2xl mx-auto transform transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 text-4xl shadow-inner">
                <i className="ri-ticket-2-line"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">No Active Offers right now</h2>
              <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                We're cooking up some great deals. Check back later for discounts and promo codes on your favorite meals.
              </p>
              <button
                onClick={() => navigate('/home')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-sm"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
              {coupons.map((coupon) => (
                <div
                  key={coupon.coupon_id}
                  className="relative bg-white rounded-3xl flex shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  {/* Left Ticket Stub */}
                  <div className="w-[35%] bg-gradient-to-br from-amber-500 to-orange-500 flex flex-col justify-center items-center p-4 md:p-6 text-white relative">

                    {/* Top/Bottom cutout circles for authentic ticket look */}
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full z-10 shadow-inner"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full z-10 shadow-inner"></div>

                    {/* Dashed line separating left/right */}
                    <div className="absolute right-0 top-4 bottom-4 w-[2px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.6)_50%,transparent_50%)] bg-[length:2px_12px]"></div>

                    <span className="text-3xl md:text-4xl font-black drop-shadow-md">
                      {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                    </span>
                    <span className="text-xs md:text-sm font-bold mt-1 tracking-widest uppercase text-amber-100">
                      OFF
                    </span>

                    {/* Decorative subtle pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_2px,transparent_2px)] bg-[length:16px_16px]"></div>
                  </div>

                  {/* Right Ticket Body */}
                  <div className="w-[65%] p-6 md:p-8 flex flex-col justify-between bg-white relative">

                    {/* "NEW" badge if expiry is far away - mock logic */}
                    <div className="absolute top-4 right-4 px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-wider rounded-md">
                      Active
                    </div>

                    <div className="pr-12">
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1 tracking-wider uppercase border-b-2 border-gray-100 pb-3 inline-block">
                        {coupon.coupon_code}
                      </h3>

                      <div className="space-y-1.5 mt-4">
                        <p className="text-sm font-medium text-gray-500 flex justify-between">
                          <span>Min Order:</span>
                          <strong className="text-gray-900">₹{coupon.minimum_order_value}</strong>
                        </p>
                        <p className="text-sm font-medium text-gray-500 flex justify-between">
                          <span>Valid Until:</span>
                          <strong className="text-gray-900">{new Date(coupon.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => copyToClipboard(coupon.coupon_code)}
                        className={`flex items-center gap-2 font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-300 ${copiedCode === coupon.coupon_code
                            ? 'bg-green-500 text-white shadow-md'
                            : 'text-amber-600 bg-amber-50 hover:bg-amber-100 active:bg-amber-200'
                          }`}
                      >
                        {copiedCode === coupon.coupon_code ? (
                          <>
                            <FiCheckCircle className="w-4 h-4" />
                            COPIED
                          </>
                        ) : (
                          <>
                            <FiCopy className="w-4 h-4" />
                            COPY CODE
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}