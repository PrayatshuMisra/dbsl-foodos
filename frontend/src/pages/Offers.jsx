import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";

export default function Offers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    alert(`Coupon code ${code} copied!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-start justify-center p-8 pt-32 w-full">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Exclusive Offers</h1>
            <p className="text-gray-600 text-lg">Use these exciting codes to save huge on your next meal!</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center h-48 items-center border-2 border-dashed border-gray-200 rounded-2xl">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !coupons.length ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center w-full">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 text-4xl">
                 <i className="ri-ticket-2-line"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Offers right now</h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Check back later for discounts and promo codes on your favorite meals.
              </p>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coupons.map((coupon) => (
                  <div key={coupon.coupon_id} className="relative bg-white rounded-2xl flex shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="w-1/3 bg-gradient-to-br from-amber-400 to-orange-500 flex flex-col justify-center items-center p-4 text-white border-r-2 border-dashed border-amber-200">
                      <span className="text-3xl font-bold">
                        {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                      </span>
                      <span className="text-sm font-medium mt-1 tracking-wider uppercase">OFF</span>
                      
                      <div className="absolute top-1/2 -ml-6 -mt-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                      <div className="absolute top-1/2 left-1/3 -ml-3 -mt-3 w-6 h-6 bg-gray-50 rounded-full"></div>
                    </div>
                    <div className="w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-wider border-b border-gray-100 pb-2">{coupon.coupon_code}</h3>
                        <p className="text-sm text-gray-500 mt-2">
                          Min. order value: <strong className="text-gray-700">₹{coupon.minimum_order_value}</strong>
                        </p>
                        <p className="text-sm text-gray-500">
                          Valid until: <strong className="text-gray-700">{new Date(coupon.expiry_date).toLocaleDateString()}</strong>
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => copyToClipboard(coupon.coupon_code)}
                          className="text-amber-600 font-semibold text-sm hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors border border-amber-200"
                        >
                          COPY CODE
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
