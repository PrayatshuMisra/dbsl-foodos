import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiClock, FiArrowRight } from 'react-icons/fi';

// Mock recent searches - replace with actual data from localStorage
const mockRecentSearches = [
  'Pizza',
  'Sushi',
  'Burger',
  'Pasta',
  'Salad'
];

export default function SearchBar({ onSearch, className = '', autoFocus = false }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    // Generate suggestions based on input
    if (value.length > 0) {
      const filtered = mockRecentSearches
        .filter(item => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions(mockRecentSearches.slice(0, 3));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate('/fooditems', { state: { dishName: searchQuery } });
      }
      setSearchQuery('');
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    } else {
      navigate('/fooditems', { state: { dishName: suggestion } });
    }
    setSearchQuery('');
    setIsFocused(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions(mockRecentSearches.slice(0, 3));
  };

  return (
    <div className={`relative w-full max-w-3xl mx-auto ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          {/* Main Search Icon */}
          <FiSearch className={`absolute left-5 w-5 h-5 transition-colors duration-300 z-10 ${
            isFocused ? 'text-orange-500' : 'text-gray-400 group-hover:text-orange-400'
          }`} />
          
          <input
            type="text"
            placeholder="Search for restaurants or dishes..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            className={`w-full pl-14 pr-12 py-4 rounded-2xl border-2 transition-all duration-300
              focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500
              bg-white text-gray-900 placeholder-gray-400
              ${isFocused 
                ? 'border-orange-500 shadow-[0_8px_30px_rgb(249,115,22,0.12)]' 
                : 'border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md'
              }`}
            autoComplete="off"
            autoFocus={autoFocus}
          />
          
          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200 z-10"
              aria-label="Clear search"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {isFocused && (searchQuery || suggestions.length > 0) && (
        <div className="absolute z-50 w-full mt-3 bg-white rounded-2xl shadow-[0_20px_50px_rgb(249,115,22,0.1)] border border-orange-100 overflow-hidden transform opacity-100 translate-y-0 transition-all duration-200">
          <div className="p-3">
            {searchQuery ? (
              <>
                <div className="px-4 py-2 mb-1 text-[11px] font-bold tracking-widest text-orange-500 uppercase">
                  Search Results
                </div>
                {suggestions.length > 0 ? (
                  <ul className="flex flex-col gap-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-orange-50 flex items-center justify-between group transition-all duration-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-orange-100/50 rounded-xl group-hover:bg-orange-100 transition-colors">
                              <FiSearch className="text-orange-500 w-4 h-4" />
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                              {suggestion}
                            </span>
                          </div>
                          <FiArrowRight className="text-orange-500 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-10 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-50 mb-3">
                      <FiSearch className="w-6 h-6 text-orange-300" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">No results found</p>
                    <p className="text-sm text-gray-500">We couldn't find anything matching "{searchQuery}"</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="px-4 py-2 mb-1 text-[11px] font-bold tracking-widest text-orange-500 uppercase">
                  Recent Searches
                </div>
                <ul className="flex flex-col gap-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-orange-50 flex items-center justify-between group transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <FiClock className="text-orange-300 group-hover:text-orange-500 w-5 h-5 transition-colors" />
                          <span className="font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
                            {suggestion}
                          </span>
                        </div>
                        <div
                          role="button"
                          className="p-1.5 text-gray-300 hover:text-orange-600 hover:bg-orange-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Logic to remove from recent searches goes here
                          }}
                          title="Remove from history"
                        >
                          <FiX className="w-4 h-4" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}