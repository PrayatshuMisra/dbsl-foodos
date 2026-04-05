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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/20 backdrop-blur-md ${scrolled ? 'shadow-lg border-b border-gray-100/50' : 'border-b border-gray-100/30'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-pink-500 bg-clip-text text-transparent">
              FoodOS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-2 py-1 text-sm font-medium transition-colors ${isActive(link.path)
                    ? 'text-amber-500' // Active state color
                    : 'text-white hover:text-amber-400' // Changed to white
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
          <div className="flex items-center space-x-4 border-l border-white/20 pl-4">

            {/* Show cart only for customers */}
            {!user?.isOwner && (
              <Link
                to="/checkout"
                className="relative p-2 text-white hover:text-amber-400 hover:bg-white/10 rounded-full transition-colors"
              >
                <FiShoppingCart size={22} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/profile"
              className="p-2 text-white hover:text-amber-400 hover:bg-white/10 rounded-full transition-colors"
            >
              <FiUser size={22} />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white hover:text-amber-400 transition-colors"
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
            className="md:hidden overflow-hidden bg-white/90 backdrop-blur-md border-t border-gray-100/50 shadow-inner"
          >
            <div className="px-4 py-3">
              <SearchBar />
            </div>
            <nav className="flex flex-col space-y-2 px-4 py-2 pb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'text-gray-700 hover:bg-gray-100/50' // Kept gray for mobile dropdown readability against white bg
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