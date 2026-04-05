import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiClock } from 'react-icons/fi';

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
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for restaurants or dishes..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            className={`w-full pl-12 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-700 
              focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
              transition-all duration-200 ${isFocused ? 'shadow-lg' : 'shadow-sm'}`}
            autoComplete="off"
            autoFocus={autoFocus}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions */}
      {isFocused && (searchQuery || suggestions.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          {searchQuery ? (
            <>
              <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                Search for "{searchQuery}"
              </div>
              {suggestions.length > 0 ? (
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                      >
                        <FiSearch className="text-gray-400" />
                        <span className="truncate">{suggestion}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  No results found
                </div>
              )}
            </>
          ) : (
            <>
              <div className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                Recent searches
              </div>
              <ul className="py-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <FiClock className="text-gray-400" />
                        <span>{suggestion}</span>
                      </div>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Remove from recent searches
                        }}
                        aria-label="Remove from recent searches"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
