import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import { supabase } from "../supabaseClient";

export default function Restos() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("search")?.toLowerCase() || "";
  const categoryQuery = searchParams.get("category")?.toLowerCase() || "";

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchRestaurants = async () => {
      try {
        const { data, error } = await supabase.from("restaurants").select("*");
        if (error) throw error;
        
        const formattedData = data.map(r => ({
          ...r,
          cuisine: r.cuisine_type,
          rating: Number(r.rating) || 0,
          votes: 100,
          priceForTwo: 500,
          deliveryTime: "30-40 min",
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

  const filteredRestaurants = restaurants.filter(restaurant => {
    if (searchQuery) {
      return (
        restaurant.restaurant_name?.toLowerCase().includes(searchQuery) ||
        restaurant.cuisine_type?.toLowerCase().includes(searchQuery)
      );
    }
    if (categoryQuery) {
      return restaurant.cuisine_type?.toLowerCase().includes(categoryQuery);
    }
    return true;
  });

  let pageTitle = "All Restaurants";
  if (searchQuery) pageTitle = `Search Results for "${searchQuery}"`;
  else if (categoryQuery) pageTitle = `Category: ${categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1)}`;

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 lg:px-8 py-8 min-h-[70vh]">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">{pageTitle}</h1>
          <p className="text-gray-600 mt-2 ml-4">
            {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} found.
          </p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} index={index} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
