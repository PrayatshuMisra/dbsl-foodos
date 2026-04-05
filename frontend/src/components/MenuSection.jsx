/* eslint-disable react/prop-types */
import { useState } from "react";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import StarIcon from "@mui/icons-material/Star";
import { yellow } from "@mui/material/colors";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import { useCart } from "../context/CartContext";

const MenuItem = ({ item, restoId }) => {
  const [open, setOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart } = useCart();

  const handleClick = () => {
    handleAddToCart();
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleAddToCart = () => {
    setIsAdded(true);
    addToCart(item, restoId);
  };

  return (
    <div className="mb-4 flex flex-col md:flex-row md:items-center rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow gap-4">
      <img
        src={item.img_src}
        alt={item.name}
        className="h-24 w-24 md:h-20 md:w-20 rounded-lg object-cover"
      />
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{item.description}</p>
        <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
          <span className="flex items-center bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs gap-1">
            {item.rating} <StarIcon sx={{ fontSize: 14 }} />
          </span>
          {item.type === 'veg' ? (
            <span className="flex items-center text-green-600 text-xs gap-1 ml-2 border border-green-200 px-1 rounded">
               <span className="w-2 h-2 rounded-full bg-green-500"></span> Veg
            </span>
          ) : (
            <span className="flex items-center text-red-600 text-xs gap-1 ml-2 border border-red-200 px-1 rounded">
               <span className="w-2 h-2 rounded-full bg-red-500"></span> Non-Veg
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between md:justify-end md:gap-6 mt-2 md:mt-0">
        <p className="text-xl font-bold text-gray-900">
          ₹{item.price}{" "}
        </p>
        <Tooltip title={isAdded ? "" : "Add to cart"}>
          <button
            className={`flex items-center gap-2 rounded-lg px-6 py-2 font-bold transition-all ${isAdded
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
              }`}
            onClick={handleClick}
            disabled={isAdded}
          >
            {isAdded ? (
              <span><i className="ri-check-line mr-1"></i> Added</span>
            ) : (
              <span>Add</span>
            )}
          </button>
        </Tooltip>
        <Snackbar
          open={open}
          autoHideDuration={2000}
          onClose={handleClose}
          message={`${item.name} was added to Cart`}
        />
      </div>
    </div>
  );
};

const MenuSection = ({ menuItems, restoId, children }) => {
  return (
    <div className="w-full">
      <h2 className="my-8 text-3xl font-semibold ">{children}</h2>
      {menuItems ? (
        menuItems.map((item, index) => <MenuItem key={index} item={item} restoId={restoId} />)
      ) : (
        <h1 className="text-black">Menu not added yet.</h1>
      )}
    </div>
  );
};

export default MenuSection;
