import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  const addToCart = (item, restoId) => {
    // If they try to add from a different restaurant, clear cart or warn
    if (restaurantId !== null && restaurantId !== restoId) {
      if(window.confirm("Adding an item from a different restaurant will clear your cart. Do you want to continue?")) {
        setCartItems([{...item, quantity: 1}]);
        setRestaurantId(restoId);
      }
      return;
    }

    setRestaurantId(restoId);

    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i.id !== itemId));
    if (cartItems.length === 1) {
      setRestaurantId(null);
    }
  };
  
  const updateQuantity = (itemId, delta) => {
    setCartItems(prev => {
      return prev.map(i => {
        if (i.id === itemId) {
          const newQ = i.quantity + delta;
          return { ...i, quantity: newQ > 0 ? newQ : 1 };
        }
        return i;
      });
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, restaurantId, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
