/* eslint-disable react/prop-types */
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import MenuSection from "../components/MenuSection";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import RatingSection from "../components/RatingSection";
import { supabase } from '../supabaseClient';

const Restaurant = () => {
  const [resto, setResto] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [isMenuLoading, setIsMenuLoading] = useState(true); 
  const [rating, setRating] = useState(0);

  const handleRatingChange = (newValue) => {
    setRating((newValue + resto.rating) / 2);
  };

  const location = useLocation();
  const { id } = location.state;

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsMenuLoading(true);
        
        // Fetch restaurant details
        const { data: restaurant, error: restError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('restaurant_id', id)
          .single();
          
        if (restError) throw restError;
        
        if (restaurant) {
          setResto({
            id: restaurant.restaurant_id,
            name: restaurant.restaurant_name,
            address: restaurant.location,
            contact_number: restaurant.contact_number,
            rating: Number(restaurant.rating) || 0,
            img_src: restaurant.image_url || 'https://via.placeholder.com/800x400'
          });
          setRating(Number(restaurant.rating));
        }

        // Fetch menu items
        const { data: items, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', id);
          
        if (itemsError) throw itemsError;
        
        const formattedItems = items.map(item => ({
          id: item.item_id,
          name: item.item_name,
          description: item.description,
          price: Number(item.price),
          img_src: item.image_url || 'https://via.placeholder.com/150',
          type: item.description?.toLowerCase().includes('veg') ? 'veg' : 'non-veg'
        }));
        
        setMenuItems(formattedItems);
      } catch (err) {
        console.error("Error fetching restaurant data:", err);
      } finally {
        setIsLoading(false);
        setIsMenuLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const [sortBy, setSortBy] = useState("default");

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const sortedMenuItems = [...menuItems].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "rating":
        return b.rating - a.rating;
      case "price":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen w-full bg-gray-50 pt-24 pb-12">
      <Navbar />
      <div className="mx-auto max-w-7xl w-[90%] overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
        {isLoading ? (
          // Show loading indicator while fetching restaurant details
          <div className="flex h-96 items-center justify-center text-xl font-semibold">
            Loading Restaurant Details...
          </div>
        ) : (
          <>
            <div className="relative mb-8 overflow-hidden border-b-2">
              <img
                className="h-96 w-full transform object-cover object-center transition-transform duration-300 ease-in-out hover:scale-110"
                src={resto.img_src}
                alt={resto.name}
              />
              <div className="absolute bottom-0 left-0 h-48 w-full bg-gradient-to-t from-gray-900 to-transparent"></div>
              <div className="absolute bottom-0 left-0 px-8 pb-6">
                <h2 className="text-5xl font-bold text-white mb-2">{resto.name}</h2>
                <div className="flex items-center gap-4 text-white/90">
                  <span className="flex items-center gap-1 bg-amber-500 px-3 py-1 rounded-full font-semibold text-sm">
                    <i className="ri-star-fill"></i> {resto.rating}
                  </span>
                  <span className="flex items-center gap-1"><i className="ri-phone-fill"></i> {resto.contact_number}</span>
                </div>
              </div>
            </div>

            <div className="flex">
              <div className="w-1/4 p-6">
                <div className="border-b-2 pb-24">
                  <label
                    className="mb-2 block text-lg font-bold text-gray-700"
                    htmlFor="sortOptions"
                  >
                    Sort by:
                  </label>
                  <select
                    className="w-full rounded border border-gray-300 px-3 py-2 leading-tight focus:border-gray-500 focus:outline-none"
                    id="sortOptions"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="default">Sort By:</option>
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                    <option value="price">Price</option>
                  </select>
                </div>

                <div className="mb-8 mt-8">
                  <div className="mb-6 rounded-lg bg-amber-50 shadow-sm border border-amber-100 p-4 text-center">
                    <h3 className="font-bold text-amber-700 mb-1">Rate this restaurant</h3>
                    <p className="text-3xl font-bold text-amber-600">
                      {rating ? rating.toFixed(1) : resto.rating?.toFixed(1)}
                    </p>
                  </div>
                </div>
                <RatingSection onRatingChange={handleRatingChange} />
              </div>

              <div className="w-3/4 border-l border-gray-200 p-6">
                <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <i className="ri-map-pin-2-fill text-amber-500"></i> Location
                  </h3>
                  <p className="text-gray-600">
                    {resto.address}
                  </p>
                </div>

                {isMenuLoading ? (
                  <div className="text-center text-lg font-semibold">
                    Loading Menu...
                  </div>
                ) : (
                  <MenuSection menuItems={sortedMenuItems} restoId={id}>{"Menu"}</MenuSection>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Restaurant;
