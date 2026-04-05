import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // Handle subscription logic here
      console.log('Subscribed with:', email);
      setIsSubscribed(true);
      setEmail('');
      // Reset subscription message after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center mb-6">
              <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-pink-500 bg-clip-text text-transparent">
                FoodOS
              </span>
            </Link>
            <p className="mb-6 text-gray-400">
              Delivering delicious meals to your doorstep. Order from your favorite restaurants with just a few clicks.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <FiFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <FiTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <FiInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-amber-400 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mb-8 md:mb-0">
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FiMapPin className="w-5 h-5 text-amber-400 mt-1 mr-3 flex-shrink-0" />
                <span>123 Food Street, Cuisine City, FC 12345</span>
              </li>
              <li className="flex items-center">
                <FiMail className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                <a href="mailto:hello@foodos.com" className="hover:text-amber-400 transition-colors">
                  hello@foodos.com
                </a>
              </li>
              <li className="flex items-center">
                <FiPhone className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-amber-400 transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Subscribe
              </button>
              {isSubscribed && (
                <p className="text-green-400 text-sm mt-2">
                  Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {currentYear} FoodOS. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <img 
                src="/payment-methods.png" 
                alt="Payment Methods" 
                className="h-6" 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<span class="text-xs text-gray-500">We accept all major credit cards</span>';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
