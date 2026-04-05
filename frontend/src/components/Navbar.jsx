import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX, FiPieChart } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user } = useAuth();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = user?.isOwner 
    ? [
        { name: 'Dashboard', path: '/owner/dashboard' },
        { name: 'Restaurants', path: '/restos' },
      ]
    : [
        { name: 'Home', path: '/home' },
        { name: 'Restaurants', path: '/restos' },
        { name: 'Offers', path: '/offers' },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-white border-b border-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
              FoodOS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-2 py-1 text-sm font-medium transition-colors ${
                  isActive(link.path) 
                    ? 'text-amber-500' 
                    : 'text-gray-600 hover:text-amber-500'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.span 
                    layoutId="activeNav"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4 border-l border-gray-200 pl-4">
            
            {/* Show cart only for customers */}
            {!user?.isOwner && (
              <Link 
                to="/checkout" 
                className="relative p-2 text-gray-600 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
              >
                <FiShoppingCart size={22} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            <Link 
              to="/profile" 
              className="p-2 text-gray-600 hover:text-amber-500 hover:bg-amber-50 rounded-full transition-colors"
            >
              <FiUser size={22} />
            </Link>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-amber-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-3">
              <SearchBar />
            </div>
            <nav className="flex flex-col space-y-2 px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-amber-50 text-amber-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
