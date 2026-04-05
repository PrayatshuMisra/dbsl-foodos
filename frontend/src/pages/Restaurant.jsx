import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import MenuSection from "../components/MenuSection";
import ReviewSystem from "../components/ReviewSystem";
import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { Star, MapPin, Clock, Heart, ArrowLeft, Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from "../context/AuthContext";

const Restaurant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resto, setResto] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const location = useLocation();
  const id = location.state?.id;

  useEffect(() => {
    if (!id) {
      navigate('/home');
      return;
    }

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
            img_src: restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80',
            cuisine: restaurant.cuisine_type || 'Indian'
          });
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

    const checkFavorite = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('favorites')
          .select('*')
          .eq('customer_id', user.id)
          .eq('restaurant_id', id)
          .maybeSingle();
        setIsFavorited(!!data);
      } catch (err) {
        console.warn('Favorite check failed');
      }
    };

    fetchData();
    checkFavorite();
  }, [id, user, navigate]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Please log in to save this restaurant.");
      return;
    }
    setFavLoading(true);
    try {
      if (isFavorited) {
        await supabase.from('favorites').delete().eq('customer_id', user.id).eq('restaurant_id', id);
        setIsFavorited(false);
      } else {
        await supabase.from('favorites').insert([{ customer_id: user.id, restaurant_id: id }]);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error("Action failed", err);
    } finally {
      setFavLoading(false);
    }
  };

  const [sortBy, setSortBy] = useState("default");

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!resto.name) {
    return (
      <div className="min-h-screen bg-transparent pt-24 pb-12 flex flex-col items-center justify-center text-center">
        <Navbar />
        <Info size={40} className="text-gray-400 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Restaurant Not Found</h3>
        <p className="text-gray-400 mb-8">This restaurant is currently unavailable or doesn't exist.</p>
        <Link to="/home" className="px-8 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] font-sans">
      <Navbar />

      {/* NEW HERO DESIGN: The "Floating Card" Approach
        Instead of a full-bleed banner, the restaurant info floats in a distinct card 
        OVER a blurred version of the restaurant image, providing clear separation from the rest of the page.
      */}
      <div className="relative pt-24 md:pt-32 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
        
        {/* Background - Blurred Image for ambiance */}
        <div className="absolute inset-0 z-0 overflow-hidden h-[400px]">
          <img
            src={resto.img_src}
            alt="background blur"
            className="w-full h-full object-cover opacity-20 blur-2xl scale-110"
          />
          {/* Gradient to fade the blur smoothly into the solid background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121212]"></div>
        </div>

        {/* Back Button */}
        <div className="relative z-20 mb-6">
          <Link to="/home" className="inline-flex items-center justify-center p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all border border-white/10">
            <ArrowLeft size={20} />
          </Link>
        </div>

        {/* Floating Restaurant Identity Card */}
        <div className="relative z-20 bg-[#1e1e1e] rounded-[2rem] p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 border border-white/5 shadow-2xl items-center md:items-start">
          
          {/* Left: Prominent Image */}
          <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10">
            <img
              src={resto.img_src}
              alt={resto.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Right: Info Content */}
          <div className="w-full md:w-2/3 flex flex-col justify-between h-full py-2">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">{resto.name}</h1>
                <button
                  onClick={handleToggleFavorite}
                  disabled={favLoading}
                  className={`hidden md:flex shrink-0 items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all border ${
                    isFavorited
                      ? 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Heart size={18} className={isFavorited ? 'fill-red-500' : ''} />
                  {isFavorited ? 'Saved' : 'Save'}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
                <span className="px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-sm font-bold border border-amber-500/20">
                  {resto.cuisine}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-white rounded-lg text-sm font-bold border border-white/5">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  {resto.rating?.toFixed(1) || 'NEW'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm font-medium border border-white/5">
                  <Clock size={16} /> 30-45 min
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg text-sm font-medium border border-white/5">
                  <MapPin size={16} /> {resto.address?.split(',')[0]}
                </span>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex gap-3 items-start md:items-center">
              <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5 md:mt-0" />
              <p className="text-sm font-medium text-green-100/90 leading-relaxed">
                Accepting orders now. Fresh ingredients and proper hygiene standards maintained.
              </p>
            </div>

            {/* Mobile Save Button */}
            <button
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`mt-6 w-full md:hidden flex justify-center items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all border ${
                isFavorited
                  ? 'bg-red-500/10 text-red-500 border-red-500/30'
                  : 'bg-white/5 text-gray-300 border-white/10'
              }`}
            >
              <Heart size={18} className={isFavorited ? 'fill-red-500' : ''} />
              {isFavorited ? 'Saved' : 'Save to Favorites'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main Column - Menu & Reviews */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-gray-800 gap-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">Menu</h2>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-400 hidden sm:block">Sort by</label>
                <select
                  className="bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 font-medium focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="default">Relevance</option>
                  <option value="name">A-Z</option>
                  <option value="price">Price: Low to High</option>
                </select>
              </div>
            </div>

            {isMenuLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-[#1e1e1e] rounded-2xl border border-white/5 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <MenuSection menuItems={sortedMenuItems} restoId={id} />
            )}

            <div className="mt-16">
              <ReviewSystem restaurantId={id} />
            </div>
          </div>

          {/* Sidebar - Restaurant Info */}
          <div className="w-full lg:w-1/3 xl:w-1/4">
            <div className="sticky top-28 space-y-6">
              
              <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-white/5 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Restaurant details</h3>

                <div className="space-y-6">
                  <div className="flex gap-4 text-gray-300">
                    <div className="mt-1 p-2 bg-[#2a2a2a] rounded-lg h-fit border border-white/5">
                      <MapPin size={20} className="shrink-0 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location</p>
                      <p className="text-sm leading-relaxed font-medium text-gray-200">{resto.address}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 text-gray-300">
                    <div className="mt-1 p-2 bg-[#2a2a2a] rounded-lg h-fit border border-white/5">
                      <Clock size={20} className="shrink-0 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Operating Hours</p>
                      <p className="text-sm font-medium text-gray-200">Mon - Sun: 10:00 AM - 11:00 PM</p>
                    </div>
                  </div>

                  <hr className="border-gray-800" />

                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Allergen Information</h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">
                      If you have allergies or dietary requirements, please add your specifications as special instructions during checkout.
                    </p>  
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Restaurant;