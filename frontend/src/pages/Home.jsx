import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiStar, FiTruck, FiShield, FiSearch } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RestaurantCard from '../components/RestaurantCard';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
// Sample categories - replace with your actual categories
const foodCategories = [
  { id: 1, name: 'Pizza', icon: '🍕', count: 45 },
  { id: 2, name: 'Burgers', icon: '🍔', count: 32 },
  { id: 3, name: 'Sushi', icon: '🍣', count: 28 },
  { id: 4, name: 'Pasta', icon: '🍝', count: 36 },
  { id: 5, name: 'Salads', icon: '🥗', count: 24 },
  { id: 6, name: 'Desserts', icon: '🍰', count: 18 },
];

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
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase.from('restaurants').select('*');
        if (error) throw error;
        // Extend database columns instead of completely reshaping
        const formattedData = data.map(r => ({
          ...r,
          cuisine: r.cuisine_type,
          rating: Number(r.rating) || 0,
          votes: 100, // mock
          priceForTwo: 500, // mock
          deliveryTime: '30-40 min',
          promoted: false
        }));
        setRestaurants(formattedData);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.restaurant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading delicious options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-r from-amber-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Delicious food, <span className="text-amber-500">delivered</span> to you
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
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
                  className="w-full px-6 py-4 pr-12 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-gray-800 border-gray-200"
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
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="w-full h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 0L0 0 598.97 114.72 1200 0z" fill="currentColor"></path>
          </svg>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Explore Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the best food from our wide selection of cuisines and categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {foodCategories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/restos?category=${encodeURIComponent(category.name)}`)}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-medium text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count} items</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Restaurants */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Restaurants</h2>
              <p className="text-gray-600">Most ordered from recently</p>
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Hungry? You're in the right place
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Download our app for exclusive offers and faster ordering
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                <path d="M10 5a1 1 0 100 2 1 1 0 000-2zm0 8a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              App Store
            </button>
            <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                <path d="M10 5a1 1 0 100 2 1 1 0 000-2zm0 8a1 1 0 100 2 1 1 0 000-2z"/>
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
