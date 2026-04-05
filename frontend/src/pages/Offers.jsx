import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function Offers() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-8 pt-32">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg w-full">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 text-4xl">
             <i className="ri-ticket-2-line"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Current Offers</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We are cooking up some exciting deals for you! Check back later for discounts and promo codes on your favorite meals.
          </p>
          <Link 
            to="/restos"
            className="inline-block px-8 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-sm"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
