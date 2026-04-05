/* eslint-disable react/prop-types */
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import MenuSection from "../components/MenuSection";
import ReviewSystem from "../components/ReviewSystem";
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { Star, Phone, MapPin, Clock, Info, ShieldCheck, Heart, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Restaurant = () => {
  const [resto, setResto] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [isMenuLoading, setIsMenuLoading] = useState(true); 
  const [rating, setRating] = useState(0);

  const location = useLocation();
  const { id } = location.state;

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsMenuLoading(true);
        
        // Fetch restaurant details
        const { data: restaurant, error: restError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('restaurant_id', id)
          .single();
          
        if (restError) throw restError;
        
        if (restaurant) {
          setResto({
            id: restaurant.restaurant_id,
            name: restaurant.restaurant_name,
            address: restaurant.location,
            contact_number: restaurant.contact_number,
            rating: Number(restaurant.rating) || 0,
            img_src: restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
            cuisine: restaurant.cuisine_type || 'International'
          });
          setRating(Number(restaurant.rating));
        }

        // Fetch menu items
        const { data: items, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', id);
          
        if (itemsError) throw itemsError;
        
        const formattedItems = items.map(item => ({
          id: item.item_id,
          name: item.item_name,
          description: item.description,
          price: Number(item.price),
          img_src: item.image_url || 'https://via.placeholder.com/150',
          type: item.description?.toLowerCase().includes('veg') ? 'veg' : 'non-veg'
        }));
        
        setMenuItems(formattedItems);
      } catch (err) {
        console.error("Error fetching restaurant data:", err);
      } finally {
        setIsLoading(false);
        setIsMenuLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const [sortBy, setSortBy] = useState("default");

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const sortedMenuItems = [...menuItems].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <Navbar />
      
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !resto.name ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] py-20 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Info size={40} className="text-red-500" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Restaurant Not Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
            We couldn't find the restaurant you're looking for. It might have been removed or the link is broken.
          </p>
          <Link 
            to="/home"
            className="px-8 py-3.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg hover:shadow-orange-200/50"
          >
            Explore Other Restaurants
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Breadcrumb / Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link to="/restos" className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-600 font-bold text-xs uppercase tracking-widest transition-colors text-decoration-none">
              <ChevronLeft size={16} /> Back to Restaurants
            </Link>
          </motion.div>

          {/* Professional Branding Hero Section */}
          <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border border-amber-100/50 shadow-sm mb-12 flex flex-col md:flex-row">
            {/* Left: Branding & Info */}
            <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {resto.cuisine}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-gray-600 font-bold text-[10px] uppercase tracking-wider border border-white/40">
                    <ShieldCheck size={12} className="text-green-500" /> Professional Verified
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
                  {resto.name}
                </h1>
                
                <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-lg">
                  Authentic {resto.cuisine} culinary experience. Crafted by the finest chefs in {resto.address.split(',')[0] || 'the area'}.
                </p>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="bg-white/80 p-4 rounded-2xl border border-white/40 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-sm shadow-amber-200">
                      <Star size={18} className="fill-current" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Rating</p>
                      <p className="text-lg font-black text-gray-900">{resto.rating?.toFixed(1) || '0.0'}</p>
                    </div>
                  </div>

                  <div className="bg-white/80 p-4 rounded-2xl border border-white/40 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Time</p>
                      <p className="text-lg font-black text-gray-900">35 min</p>
                    </div>
                  </div>

                  <div className="bg-white/80 p-4 rounded-2xl border border-white/40 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Support</p>
                      <p className="text-sm font-black text-gray-900">Contact</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Stunning Visual Representation */}
            <div className="w-full md:w-[40%] h-[300px] md:h-auto relative overflow-hidden group">
              <img
                className="absolute inset-0 h-full w-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                src={resto.img_src}
                alt={resto.name}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-transparent to-transparent hidden md:block"></div>
              <button className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all shadow-lg">
                <Heart size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Column */}
            <div className="lg:col-span-3 space-y-8">
              {/* Refined Navigation & Filter Card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-28">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                   Menu Filters
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 block">
                      Refine Display
                    </label>
                    <select
                      className="w-full bg-white rounded-lg border border-gray-100 px-4 py-2.5 font-bold text-gray-700 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer transition-shadow hover:shadow-sm"
                      id="sortOptions"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="default">Default Relevance</option>
                      <option value="name">Alphabetical (A-Z)</option>
                      <option value="price">Price: Lowest First</option>
                    </select>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="p-4 bg-white rounded-xl border border-gray-100 flex items-center gap-3">
                       <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                          <MapPin size={16} />
                       </div>
                       <div>
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Location</p>
                         <p className="text-xs font-bold text-gray-800 truncate w-32">{resto.address}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Column */}
            <div className="lg:col-span-9">
              {/* Menu Section */}
              <div className="mb-20">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Explore Menu</h2>
                  <div className="h-1 bg-amber-100 flex-grow mx-8 rounded-full hidden md:block"></div>
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-300"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-200"></span>
                  </div>
                </div>

                {isMenuLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <MenuSection menuItems={sortedMenuItems} restoId={id}>{"Signature Dishes"}</MenuSection>
                )}
              </div>

              {/* Review Section */}
              <ReviewSystem restaurantId={id} />
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Restaurant;
