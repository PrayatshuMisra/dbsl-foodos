/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart({
  name,
  mobile,
  address,
  paymentOption,
}) {
  const { cartItems, restaurantId, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const [paymentSuccessfulAlert, setPaymentSuccessfulAlert] = useState(false);
  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleOpen = () => {
    setOpen(true);
  };
  const navigate = useNavigate();

  const increaseQuantity = (id) => updateQuantity(id, 1);
  const decreaseQuantity = (id) => updateQuantity(id, -1);

  const deleteItem = (id, name) => {
    let userConfirm = window.confirm(`Removing ${name}!`);
    if (userConfirm) {
      removeFromCart(id);
    }
  };

  const totalPrice = cartTotal;

  const handlePayment = async () => {
    if (!user) {
      alert("Please login to place an order");
      navigate("/login");
      return;
    }

    if (!address) {
      alert("Please provide an address before checking out");
      return;
    }

    handleOpen();

    try {
      // Map to JSON for RPC function
      const orderItems = cartItems.map((item) => ({
        item_id: item.id,
        quantity: item.quantity,
        subtotal: item.quantity * item.price
      }));

      // Call Supabase RPC
      const { data, error } = await supabase.rpc('place_order', {
        p_customer_id: user.id,
        p_restaurant_id: restaurantId,
        p_total_amount: totalPrice,
        p_delivery_address: address,
        p_payment_method: paymentOption,
        p_items: orderItems
      });

      if (error) throw error;
      
      setPaymentSuccessfulAlert(true);
      clearCart();
    } catch (error) {
      console.error("Error during handling payment:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setTimeout(() => {
        setOpen(false);
      }, 2000);
      
      if (paymentSuccessfulAlert) {
         setTimeout(() => {
           navigate("/home");
         }, 3000);
      } else {
        setTimeout(() => navigate("/home"), 3000); // go home anyways
      }
    }
  };

  return (
    <div className="h-fit">
      {paymentSuccessfulAlert && (
        <div className="absolute bottom-0 mb-4 w-full">
          <Alert
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            severity="success"
            variant="filled"
          >
            Payment was successful.
          </Alert>
        </div>
      )}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">Order Items</h2>
        <div className="space-y-4">
          {cartItems.length ? (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">₹{item.price} each</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <button 
                      onClick={() => decreaseQuantity(item.id)}
                      className="px-3 py-1 bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-medium min-w-[2rem] text-center">{item.quantity}</span>
                    <button 
                      onClick={() => increaseQuantity(item.id)}
                      className="px-3 py-1 bg-amber-50 text-amber-600 hover:bg-amber-100 font-medium transition-colors"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="w-20 text-right font-bold text-gray-900">
                    ₹{item.price * item.quantity}
                  </div>
                  
                  <button
                    onClick={() => deleteItem(item.id, item.name)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 text-2xl">
                 <i className="ri-shopping-bag-3-line"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Looks like you haven't added anything yet</p>
              <button
                onClick={() => navigate("/home")}
                className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-sm"
              >
                Browse Restaurants
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mb-8 rounded-xl bg-gray-50 border border-gray-100 p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900 border-l-4 border-amber-500 pl-3">Order Summary</h2>
        <div className="space-y-3 text-sm text-gray-600">
          {name && (
            <div className="flex justify-between">
              <span className="font-medium">Deliver to:</span> 
              <span className="text-gray-900">{name}</span>
            </div>
          )}
          {mobile && (
            <div className="flex justify-between">
              <span className="font-medium">Contact:</span> 
              <span className="text-gray-900">{mobile}</span>
            </div>
          )}
          {paymentOption && (
            <div className="flex justify-between">
              <span className="font-medium">Payment Method:</span> 
              <span className="text-gray-900">{paymentOption}</span>
            </div>
          )}
          
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="font-bold text-gray-900">₹{totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => handlePayment()}
        className={`w-full rounded-lg px-6 py-4 font-bold text-white transition-all transform ${
          cartItems.length
            ? "bg-amber-500 hover:bg-amber-600 hover:shadow-lg hover:-translate-y-0.5"
            : "bg-gray-300 cursor-not-allowed"
        }`}
        disabled={!cartItems.length}
      >
        Place Order • ₹{totalPrice}
      </button>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handleClose}
        className="h-full"
      >
        <CircularProgress color="warning" />
        <h1 className="ml-4 text-2xl">Processing...</h1>
      </Backdrop>
    </div>
  );
}
