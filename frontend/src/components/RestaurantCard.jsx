import { motion } from 'framer-motion';
import { FiClock, FiStar, FiMapPin, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant, index }) => {
  // Generate a random rating between 3.5 and 5.0
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
  // Generate a random delivery time between 20-45 minutes
  const deliveryTime = Math.floor(Math.random() * 26) + 20;
  // Generate a random delivery fee between $1.99 and $5.99
  const deliveryFee = (Math.random() * 4 + 1.99).toFixed(2);
  // Generate a random number of ratings
  const ratingCount = Math.floor(Math.random() * 500) + 50;

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: 'easeOut'
      }
    }),
    hover: {
      y: -5,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }
  };

  return (
    <motion.div
      custom={index % 4} // Stagger animation based on index
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
    >
      <Link to={`/restaurant/${restaurant.restaurant_id || '1'}`} className="block" state={{ id: restaurant.restaurant_id }}>
        {/* Restaurant Image */}
        <div className="relative pb-[60%] overflow-hidden">
          <img
            src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'}
            alt={restaurant.restaurant_name}
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Favorite Button */}
          <button 
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-amber-50 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle favorite toggle
            }}
            aria-label="Add to favorites"
          >
            <FiHeart className="w-5 h-5 text-gray-400 group-hover:text-amber-500" />
          </button>
          
          {/* Rating Badge */}
          <div className="absolute bottom-3 left-3 bg-white text-amber-500 px-2 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md">
            <FiStar className="fill-current" />
            {restaurant.rating || rating}
          </div>
        </div>
        
        {/* Restaurant Info */}
        <div className="p-4">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-lg text-gray-900 truncate">
              {restaurant.restaurant_name || 'Restaurant Name'}
            </h3>
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full whitespace-nowrap">
              {restaurant.cuisine_type || 'International'}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <FiMapPin className="w-3.5 h-3.5 mr-1" />
            <span className="truncate">{restaurant.location || 'City, Country'}</span>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-600">
              <FiClock className="w-4 h-4 mr-1" />
              {restaurant.deliveryTime || deliveryTime + ' min'}
            </div>
            <div className="text-gray-600">
              ${deliveryFee} delivery
            </div>
            <div className="text-amber-500 font-medium">
              Open Now
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>{ratingCount}+ ratings</span>
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              Free delivery
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default RestaurantCard;
