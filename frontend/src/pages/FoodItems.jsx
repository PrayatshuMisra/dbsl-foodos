import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MenuSection from "../components/MenuSection";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { searchDishes } from "../data/mockData";

export default function FoodItems() {
  const location = useLocation();
  const state = location.state;
  const desiredDishName = state?.dishName;
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use mock search instead of API call
    const searchResults = searchDishes(desiredDishName);
    setData(searchResults);
    setIsLoading(false);
  }, [desiredDishName]);

  return (
    <div className="h-screen w-full bg-top bg-no-repeat ">
      <Navbar />
      <div className="bg-blur2 container mx-auto rounded p-8">
        {isLoading ? (
          <div className="text-center text-xl">Loading...</div>
        ) : (
          <>
            <MenuSection menuItems={data}>
              <div className="mb-4 text-2xl">{`Search results for ${desiredDishName}`}</div>
            </MenuSection>
            {!data.length && (
              <h1 className="mt-4 text-center text-3xl">{`No results found for ${desiredDishName}`}</h1>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
