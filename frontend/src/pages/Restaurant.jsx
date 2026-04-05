import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import MenuSection from "../components/MenuSection";
import ReviewSystem from "../components/ReviewSystem";
import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { Star, MapPin, Clock, Heart, ArrowLeft, Info } from 'lucide-react';
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
            cuisine: restaurant.cuisine_type || 'International'
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex h-screen items-center justify-center">
          <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!resto.name) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-12 flex flex-col items-center justify-center text-center">
        <Navbar />
        <Info size={32} className="text-gray-400 mb-4" />
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Restaurant Not Found</h3>
        <p className="text-gray-500 mb-6">This restaurant is currently unavailable.</p>
        <Link to="/home" className="px-6 py-2.5 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      {/* Hero Banner Section */}
      <div className="relative w-full h-[320px] md:h-[400px] bg-gray-900 mt-16 md:mt-0">
        <img
          src={resto.img_src}
          alt={resto.name}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Navigation overlaid on image */}
        <div className="absolute top-6 left-4 md:left-12 z-10">
          <Link to="/home" className="flex items-center gap-2 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors text-sm font-medium">
            <ArrowLeft size={18} />
          </Link>
        </div>
        
        {/* Restaurant Title Info overlaid */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 md:pb-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">{resto.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium opacity-90">
                <span>{resto.cuisine} • Restaurant</span>
                <span className="flex items-center gap-1.5">
                  <Star size={16} className="fill-current text-white" />
                  {resto.rating?.toFixed(1) || 'NEW'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={16} /> 30-45 min
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} /> {resto.address?.split(',')[0]}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleToggleFavorite}
              disabled={favLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                isFavorited 
                  ? 'bg-white text-gray-900' 
                  : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20'
              }`}
            >
              <Heart size={18} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
              {isFavorited ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Column - Menu & Reviews */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Menu</h2>
              
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-500 hidden sm:block">Sort by</label>
                <select
                  className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-gray-400 focus:ring-0"
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
                  <div key={i} className="h-32 bg-gray-100/50 rounded-xl animate-pulse"></div>
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
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">Restaurant info</h3>
                
                <div className="space-y-5">
                  <div className="flex gap-3 text-gray-600">
                    <MapPin size={20} className="shrink-0 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Address</p>
                      <p className="text-sm leading-relaxed">{resto.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 text-gray-600">
                    <Clock size={20} className="shrink-0 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Opening hours</p>
                      <p className="text-sm">Mon - Sun: 10:00 AM - 11:00 PM</p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Allergen Information</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      If you have allergies or dietary requirements, please add your specifications as special instructions during checkout.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 flex gap-4">
                <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Food safety and hygiene are our top priority. We ensure proper packaging and handling of all items.
                </p>
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
