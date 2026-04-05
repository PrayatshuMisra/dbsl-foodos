/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import Alert from "@mui/material/Alert";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { generateReceipt } from '../utils/pdfGenerator';

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

  // Special Instructions State
  const [itemInstructions, setItemInstructions] = useState({});

  // Coupon & Billing State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Billing Constants
  const DELIVERY_FEE = cartTotal > 0 ? 40 : 0;
  const PLATFORM_FEE = cartTotal > 0 ? 5 : 0;
  const GST_RATE = 0.05;
  const itemTotal = cartTotal;
  const gstAmount = itemTotal * GST_RATE;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "PERCENTAGE") {
      discountAmount = itemTotal * (appliedCoupon.discount_value / 100);
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  const grandTotal = Math.max(0, itemTotal + gstAmount + DELIVERY_FEE + PLATFORM_FEE - discountAmount).toFixed(2);

  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponInput) return;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_code', couponInput.toUpperCase())
      .single();

    if (error || !coupon) {
      setCouponError("Invalid coupon code.");
      return;
    }

    if (new Date(coupon.expiry_date) < new Date()) {
      setCouponError("This coupon has expired.");
      return;
    }

    if (itemTotal < coupon.minimum_order_value) {
      setCouponError(`Add items worth ₹${(coupon.minimum_order_value - itemTotal).toFixed(2)} more to use this coupon.`);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponInput("");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };
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
      const newInst = { ...itemInstructions };
      delete newInst[id];
      setItemInstructions(newInst);
    }
  };

  const updateInstruction = (id, val) => {
    setItemInstructions(prev => ({ ...prev, [id]: val }));
  };

  const handlePayment = async () => {
    if (!user) {
      alert("Please login to place an order");
      navigate("/");
      return;
    }

    if (!address) {
      alert("Please provide an address before checking out");
      return;
    }

    handleOpen();

    try {
      const orderItems = cartItems.map((item) => ({
        item_id: item.id,
        quantity: item.quantity,
        subtotal: item.quantity * item.price,
        instructions: itemInstructions[item.id] || ""
      }));

      const { data, error } = await supabase.rpc('place_order', {
        p_customer_id: user.id,
        p_restaurant_id: restaurantId,
        p_total_amount: parseFloat(grandTotal),
        p_delivery_address: address,
        p_payment_method: paymentOption,
        p_items: orderItems
      });

      if (error) throw error;

      setPaymentSuccessfulAlert(true);

      generateReceipt({
        orderId: data || Math.floor(Math.random() * 100000),
        customerName: name,
        phone: mobile,
        address: address,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        itemTotal: itemTotal,
        deliveryFee: DELIVERY_FEE,
        platformFee: PLATFORM_FEE,
        gstAmount: gstAmount,
        discountAmount: discountAmount,
        grandTotal: grandTotal,
        paymentMethod: paymentOption,
      });

      clearCart();

      const newOrderId = data?.order_id || data;
      const orderForTracking = {
        id: newOrderId,
        total: grandTotal,
        items: cartItems.map(item => ({
          name: item.name, quantity: item.quantity,
          price: item.price, subtotal: item.price * item.quantity
        }))
      };

      setTimeout(() => {
        setOpen(false);
        navigate('/profile?tab=currentOrders', { state: { activeOrder: orderForTracking } });
      }, 2000);

    } catch (error) {
      console.error('Error during handling payment:', error);
      alert('Checkout failed. Please try again.');
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {paymentSuccessfulAlert && (
        <div className="absolute top-0 right-0 z-50 mb-4 w-full">
          <Alert
            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
            severity="success"
            variant="filled"
          >
            Order Confirmed! Your receipt is downloading...
          </Alert>
        </div>
      )}

      {/* ITEMS LIST - Natural Flowing */}
      <div className="mb-6">
        <h2 className="mb-4 text-lg font-bold text-white border-l-4 border-amber-500 pl-3">
          Order Items
        </h2>

        {/* Removed the scrolling restrictions. Items will stack naturally here */}
        <div className="space-y-3">
          {cartItems.length ? (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 gap-3">
                  <div className="flex-1 w-full sm:w-auto">
                    <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">₹{item.price} each</p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="flex items-center bg-white/5 rounded-lg border border-white/10 shadow-sm overflow-hidden h-8">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="px-2.5 h-full text-amber-500 hover:bg-white/10 font-medium transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 font-medium min-w-[2rem] text-center text-sm text-white">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.id)}
                        className="px-2.5 h-full text-amber-500 hover:bg-white/10 font-medium transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-16 text-right font-bold text-white text-sm">
                      ₹{item.price * item.quantity}
                    </div>

                    <button
                      onClick={() => deleteItem(item.id, item.name)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>

                <div className="px-3.5 pb-3.5 border-t border-white/5 pt-2.5 bg-black/20">
                  <div className="flex items-center gap-2 mb-1.5">
                    <i className="ri-edit-line text-[10px] text-amber-500"></i>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Special Note</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, no onions..."
                    value={itemInstructions[item.id] || ""}
                    onChange={(e) => updateInstruction(item.id, e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[11px] font-medium text-slate-300 placeholder:text-slate-500 placeholder:italic focus:ring-0"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-500 text-xl">
                <i className="ri-shopping-bag-3-line"></i>
              </div>
              <h3 className="text-md font-medium text-white mb-1">Your cart is empty</h3>
              <p className="text-xs text-slate-400 mb-4">Looks like you haven't added anything yet</p>
              <button
                onClick={() => navigate("/home")}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
              >
                Browse Restaurants
              </button>
            </div>
          )}
        </div>
      </div>

      {/* COUPON SECTION */}
      {cartItems.length > 0 && (
        <div className="mb-6 rounded-xl bg-white/5 border border-white/10 shadow-sm p-4 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
          <h2 className="mb-3 text-sm font-bold text-white flex items-center gap-2">
            <i className="ri-ticket-2-line text-amber-500 text-lg"></i> Offers
          </h2>
          {appliedCoupon ? (
            <div className="flex justify-between items-center bg-green-500/10 text-green-400 p-3 rounded-lg border border-green-500/20">
              <div>
                <strong className="block text-sm">'{appliedCoupon.coupon_code}' applied!</strong>
                <span className="text-xs text-green-400/80">You saved ₹{discountAmount.toFixed(2)}</span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-red-400 text-xs font-semibold hover:text-red-300 transition-colors"
              >
                REMOVE
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon Code"
                  className="flex-grow rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold uppercase transition-colors placeholder:text-slate-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg font-medium text-xs hover:bg-amber-600 transition-colors"
                >
                  APPLY
                </button>
              </div>
              {couponError && (
                <p className="text-red-400 text-xs mt-1.5 font-medium">{couponError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUMMARY SECTION */}
      <div className="mb-6 rounded-xl bg-white/5 border border-white/10 p-5">
        <h2 className="mb-4 text-sm font-bold text-white border-l-4 border-amber-500 pl-3">Order Summary</h2>
        <div className="space-y-2.5 text-sm text-slate-300 font-medium">
          <div className="flex justify-between items-center">
            <span>Item Total</span>
            <span className="text-white">₹{itemTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Delivery Fee</span>
            <span className="text-white">₹{DELIVERY_FEE.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Platform Fee</span>
            <span className="text-white">₹{PLATFORM_FEE.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>GST & Charges</span>
            <span className="text-white">₹{gstAmount.toFixed(2)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between items-center text-green-400">
              <span>Discount ({appliedCoupon.coupon_code})</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="pt-4 mt-3 border-t border-white/10 border-dashed flex justify-between items-center text-base">
            <span className="font-bold text-white">Grand Total</span>
            <span className="font-extrabold text-amber-500 text-lg">₹{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* PLACE ORDER BUTTON */}
      <button
        onClick={() => handlePayment()}
        className={`w-full rounded-xl px-4 py-3.5 font-bold text-white transition-all transform ${cartItems.length
            ? "bg-amber-500 hover:bg-amber-600 hover:shadow-lg hover:-translate-y-0.5"
            : "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
          }`}
        disabled={!cartItems.length}
      >
        Place Order • ₹{grandTotal}
      </button>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
        onClick={handleClose}
        className="h-full backdrop-blur-sm"
      >
        <CircularProgress color="warning" />
        <h1 className="ml-4 text-xl font-bold tracking-wide">Processing...</h1>
      </Backdrop>
    </div>
  );
}