import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import FooterCurvesSvg from '/assets/footerCurves.svg';

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
    <footer
      className="relative overflow-hidden pt-24 pb-10 font-sans"
      style={{
        backgroundImage: `url(${FooterCurvesSvg})`,
        backgroundSize: 'cover', // Ensures the SVG covers the footer area
        backgroundPosition: 'top center', // Aligns the top of the SVG (the waves) with the top of the footer
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto px-6 relative z-10 text-gray-900 mt-12 md:mt-24">
        {/* Added top margin to push content down below the wave graphic part of the SVG */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="mb-10 md:mb-0">
            <Link to="/" className="flex items-center mb-6">
              <span className="text-4xl lg:text-5xl font-extrabold text-amber-500 drop-shadow-sm bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm inline-block">
                FoodOS
              </span>
            </Link>
            <p className="mb-8 text-gray-800 leading-relaxed font-medium bg-white/50 p-4 rounded-xl backdrop-blur-sm">
              Delivering curated culinary experiences to your doorstep. Order local culinary favorites with streamlined efficiency.
            </p>
            <div className="flex space-x-6">
              {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="p-2 bg-white/80 rounded-full text-gray-800 hover:text-amber-500 hover:bg-white transition-all duration-200 shadow-sm"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-10 md:mb-0 bg-white/40 p-6 rounded-2xl backdrop-blur-sm shadow-sm border border-white/50">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-1 border-b-2 border-amber-500 w-fit">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "About Us", link: "/about" },
                { name: "Contact Us", link: "/contact" },
                { name: "FAQ", link: "/faq" },
                { name: "Privacy Policy", link: "/privacy-policy" },
                { name: "Terms & Conditions", link: "/terms" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.link}
                    className="text-gray-800 hover:text-amber-600 font-medium transition-colors duration-200 block"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mb-10 md:mb-0 bg-white/40 p-6 rounded-2xl backdrop-blur-sm shadow-sm border border-white/50">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-1 border-b-2 border-amber-500 w-fit">Contact Us</h3>
            <ul className="space-y-5">
              <li className="flex items-start">
                <div className="p-2 bg-white/80 rounded-lg shadow-sm mr-4 flex-shrink-0">
                  <FiMapPin className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-gray-800 font-medium leading-relaxed pt-1">
                  Academic Block 5 - CL4, Manipal Institute of Technology, Manipal, Karnataka 576104
                </span>
              </li>
              <li className="flex items-center">
                <div className="p-2 bg-white/80 rounded-lg shadow-sm mr-4 flex-shrink-0">
                  <FiMail className="w-5 h-5 text-amber-500" />
                </div>
                <a href="mailto:foodos@gmail.com" className="text-gray-800 font-medium hover:text-amber-600 transition-colors duration-200">
                  foodos@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="bg-white/40 p-6 rounded-2xl backdrop-blur-sm shadow-sm border border-white/50">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-1 border-b-2 border-amber-500 w-fit">Newsletter</h3>
            <p className="text-gray-800 font-medium mb-6 leading-relaxed">
              Subscribe to our curated culinary insights and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-5 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition shadow-inner"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] hover:-translate-y-0.5"
              >
                Subscribe
              </button>
              {isSubscribed && (
                <p className="text-green-700 text-sm mt-3 font-bold bg-green-100 p-2 rounded-lg border border-green-200">
                  Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-amber-500/20 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="text-gray-800 font-medium text-sm mb-5 md:mb-0 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm">
              &copy; {currentYear} FoodOS. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <span className="text-xs text-gray-800 font-bold bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm">We accept all major secure payment options</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}