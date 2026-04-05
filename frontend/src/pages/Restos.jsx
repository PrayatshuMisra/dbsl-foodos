import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RestaurantCard from "../components/RestaurantCard";
import { supabase } from "../supabaseClient";

export default function Restos() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <Navbar />
      
      <div className="container mx-auto px-4 lg:px-8 py-8 min-h-[70vh]">
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">All Restaurants</h1>
          <p className="text-gray-600 mt-2 ml-4">Find exactly what you're craving today.</p>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} index={index} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
