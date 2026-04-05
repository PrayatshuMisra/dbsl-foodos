import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import { supabase } from "../supabaseClient";
import {
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";

export default function Restos() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [activeCuisine, setActiveCuisine] = useState(
    searchParams.get("cuisine") || "All"
  );
  const [minRating, setMinRating] = useState(
    Number(searchParams.get("rating")) || 0
  );
  const [priceRange, setPriceRange] = useState(
    searchParams.get("price") || "All"
  );
  const [sortBy, setSortBy] = useState("default");

  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const categoryQuery = searchParams.get("category")?.toLowerCase() || "";

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from("restaurants").select("*");
        if (error) throw error;

        const formattedData = data.map((r) => ({
          ...r,
          cuisine: r.cuisine_type,
          rating: Number(r.rating) || 0,
          votes: Math.floor(Math.random() * 500) + 50,
          priceForTwo: Math.floor(Math.random() * 1200) + 300,
          deliveryTime: `${Math.floor(Math.random() * 20) + 20}-${Math.floor(
            Math.random() * 20
          ) + 40} min`,
        }));

        setRestaurants(formattedData);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const cuisines = useMemo(() => {
    const caps = new Set(["All"]);
    restaurants.forEach((r) => {
      if (r.cuisine_type) caps.add(r.cuisine_type);
    });
    return Array.from(caps);
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((restaurant) => {
        // Search logic
        const matchesSearch =
          !searchQuery ||
          restaurant.restaurant_name?.toLowerCase().includes(searchQuery) ||
          restaurant.cuisine_type?.toLowerCase().includes(searchQuery);

        // Category logic (from URL)
        const matchesCategory =
          !categoryQuery ||
          restaurant.cuisine_type?.toLowerCase().includes(categoryQuery);

        // Cuisine filter
        const matchesCuisine =
          activeCuisine === "All" ||
          restaurant.cuisine_type === activeCuisine;

        // Rating filter
        const matchesRating = restaurant.rating >= minRating;

        // Price filter
        const matchesPrice =
          priceRange === "All" ||
          (priceRange === "Low" && restaurant.priceForTwo <= 500) ||
          (priceRange === "Mid" &&
            restaurant.priceForTwo > 500 &&
            restaurant.priceForTwo <= 1000) ||
          (priceRange === "High" && restaurant.priceForTwo > 1000);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesCuisine &&
          matchesRating &&
          matchesPrice
        );
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price-low") return a.priceForTwo - b.priceForTwo;
        if (sortBy === "price-high") return b.priceForTwo - a.priceForTwo;
        return 0;
      });
  }, [
    restaurants,
    searchQuery,
    categoryQuery,
    activeCuisine,
    minRating,
    priceRange,
    sortBy,
  ]);

  let pageTitle = "All Restaurants";
  if (searchQuery) pageTitle = `Search Results for "${searchQuery}"`;
  else if (categoryQuery)
    pageTitle = `Category: ${
      categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1)
    }`;

  return (
    <div className="min-h-screen bg-transparent pt-24">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-8 py-8 min-h-[70vh]">
        {/* Header and Search Summary */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-orange-400 mt-2 font-medium">
              Discover the best food & drinks in your area
            </p>
          </div>
          <div className="text-orange-500 font-semibold uppercase tracking-widest text-xs">
            {filteredRestaurants.length} results found
          </div>
        </div>

        {/* BLACK GLASSMORPHISM FILTER BAR */}
        <div className="sticky top-24 z-30 mb-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl shadow-black/30 px-6 py-4 flex flex-wrap gap-3 items-center">
          {/* Filter Label */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-slate-200 backdrop-blur-md">
            <SlidersHorizontal size={16} />
            <span className="text-sm font-bold">Filters</span>
          </div>

          {/* Cuisine Select */}
          <select
            value={activeCuisine}
            onChange={(e) => setActiveCuisine(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/10 rounded-full text-sm font-semibold text-white backdrop-blur-md hover:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all cursor-pointer"
          >
            <option className="bg-black text-white" value="All">
              All Cuisines
            </option>
            {cuisines
              .filter((c) => c !== "All")
              .map((c) => (
                <option className="bg-black text-white" key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          {/* Rating Filter */}
          <div className="flex gap-1 bg-white/10 border border-white/10 p-1 rounded-full backdrop-blur-md">
            {[0, 3, 4, 4.5].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  minRating === r
                    ? "bg-white text-amber-600 shadow-md"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {r === 0 ? "Any" : `${r}+`}{" "}
                <Star size={10} className="inline ml-0.5 fill-current" />
              </button>
            ))}
          </div>

          {/* Price Filter */}
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/10 rounded-full text-sm font-semibold text-white backdrop-blur-md hover:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all cursor-pointer"
          >
            <option className="bg-black text-white" value="All">
              Any Price
            </option>
            <option className="bg-black text-white" value="Low">
              Under ₹500
            </option>
            <option className="bg-black text-white" value="Mid">
              ₹500 - ₹1000
            </option>
            <option className="bg-black text-white" value="High">
              Above ₹1000
            </option>
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              Sort by
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/10 text-white rounded-full text-xs font-bold backdrop-blur-md hover:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all cursor-pointer"
            >
              <option className="bg-black text-white" value="default">
                Relevance
              </option>
              <option className="bg-black text-white" value="rating">
                Top Rated
              </option>
              <option className="bg-black text-white" value="price-low">
                Price: Low to High
              </option>
              <option className="bg-black text-white" value="price-high">
                Price: High to Low
              </option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="glass-card overflow-hidden shadow-sm border-white/10"
              >
                <div className="bg-white/5 aspect-[4/3] w-full animate-pulse"></div>
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-white/5 rounded-full w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded-full w-1/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.restaurant_id}
                restaurant={restaurant}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-32 h-32 bg-amber-50 rounded-full flex items-center justify-center mb-8 relative">
              <Search size={48} className="text-amber-500/30" />
              <div className="absolute inset-0 border-2 border-dashed border-amber-200 rounded-full animate-[spin_10s_linear_infinite]"></div>
            </div>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">
              No matching restaurants
            </h3>
            <p className="text-slate-400 max-w-sm mb-10 font-medium">
              We couldn't find anything matching your current filters. Try
              broadening your search or clearing the selection.
            </p>
            <button
              onClick={() => {
                setActiveCuisine("All");
                setMinRating(0);
                setPriceRange("All");
                setSearchParams({});
              }}
              className="px-10 py-4 bg-gray-900 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-amber-600 transition-all shadow-xl shadow-gray-200 active:scale-95"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}