import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiStar, FiTruck, FiShield, FiSearch } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RestaurantCard from '../components/RestaurantCard';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Premium images mapping for cuisines
const cuisineImages = {
  'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=600&auto=format&fit=crop',
  'Italian': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=600&auto=format&fit=crop',
  'American': 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop',
  'Japanese': 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=600&auto=format&fit=crop',
  'Mexican': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=600&auto=format&fit=crop',
  'Chinese': 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600&auto=format&fit=crop',
  'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=600&auto=format&fit=crop',
  'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
  'Healthy': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
  'BBQ': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1476224488691-b8958b99620e?q=80&w=600&auto=format&fit=crop'
};

const features = [
  {
    icon: <FiClock className="w-6 h-6 text-amber-500" />,
    title: 'Fast Delivery',
    description: 'Get your food delivered in under 30 minutes or get it for free.'
  },
  {
    icon: <FiStar className="w-6 h-6 text-amber-500" />,
    title: 'Top Rated',
    description: 'Only the best restaurants with 4.5+ star ratings.'
  },
  {
    icon: <FiTruck className="w-6 h-6 text-amber-500" />,
    title: 'Track Order',
    description: 'Real-time tracking of your order from kitchen to doorstep.'
  },
  {
    icon: <FiShield className="w-6 h-6 text-amber-500" />,
    title: 'Safe & Secure',
    description: 'Secure payments and contactless delivery options.'
  }
];

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/restos?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/restos');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        // Fetch Restaurants
        const { data: restData, error: restError } = await supabase.from('restaurants').select('*');
        if (restError) throw restError;
        
        const formattedData = restData.map(r => ({
          ...r,
          cuisine: r.cuisine_type,
          rating: Number(r.rating) || 0,
          votes: 100,
          priceForTwo: 500,
          deliveryTime: '30-40 min',
          promoted: false
        })).sort((a, b) => b.rating - a.rating);
        setRestaurants(formattedData);

        // Fetch Unique Cuisines (Dynamic Categories)
        const uniqueCuisines = [...new Set(restData.filter(r => r.cuisine_type).map(r => r.cuisine_type))];
        setCuisines(uniqueCuisines.slice(0, 8)); // Show top 8 categories

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.restaurant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading delicious options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />

      {/* Hero Section - Removed bg-amber-500/5 and backdrop-blur-sm to prevent visual division lines */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Delicious food, <span className="text-amber-500">delivered</span> to you
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
            >
              Order from your favorite restaurants and track your food in real-time. Fast, easy, and delicious meals at your doorstep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for restaurants or cuisines..."
                  className="w-full px-6 py-4 pr-12 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 glass-card bg-white/10 text-white border-white/20 placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600 transition-colors"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cravings Section */}
      <section className="py-16 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">Crave-worthy Collections</h2>
              <p className="text-slate-400 mt-2 font-medium">Handpicked cuisines for every appetite</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {cuisines.map((cuisine, index) => (
              <motion.div
                key={cuisine}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/restos?category=${encodeURIComponent(cuisine)}`)}
                className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-lg transition-all border border-white/10"
              >
                {/* Background Image */}
                <img 
                  src={cuisineImages[cuisine] || cuisineImages.default} 
                  alt={cuisine}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 p-5 w-full">
                  <h3 className="text-lg font-black text-white uppercase tracking-wider">{cuisine}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-0.5 w-6 bg-amber-500 transition-all group-hover:w-12"></span>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Explore Menu</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Restaurants */}
      <section className="py-12 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Popular Restaurants</h2>
              <p className="text-slate-400 mt-2">Most ordered from recently</p>
            </div>
            <button
              onClick={() => navigate('/restos')}
              className="text-amber-500 font-medium hover:underline"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.slice(0, 8).map((restaurant, index) => (
              <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center p-6 glass-card hover:shadow-xl transition-all border-white/10"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-500/10 backdrop-blur-sm border-y border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Hungry? You're in the right place
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Download our app for exclusive offers and faster ordering
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                <path d="M10 5a1 1 0 100 2 1 1 0 000-2zm0 8a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              App Store
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                <path d="M10 5a1 1 0 100 2 1 1 0 000-2zm0 8a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
              Google Play
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;