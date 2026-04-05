import Home from "./pages/Home";
import LoginRegisterForm from "./pages/LoginRegisterForm";
import Checkout from "./pages/Checkout";
import FoodItems from "./pages/FoodItems";
import Restos from "./pages/Restos";
import Offers from "./pages/Offers";
import About from "./pages/About";
import Tracking from "./pages/Tracking";
import Profile from "./pages/Profile";
import Restaurant from "./pages/Restaurant";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerMenu from "./pages/OwnerMenu";
import OwnerAnalytics from "./pages/OwnerAnalytics";
import Admin from "./pages/Admin";
import { Routes, Route, useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <div className={`app-container ${!isAuthPage ? 'global-bg' : ''}`}>
      <Routes>
        <Route index element={<LoginRegisterForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LoginRegisterForm />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/fooditems/*" element={<FoodItems />} />
        <Route path="/restos" element={<Restos />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/about" element={<About />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/restaurant/*" element={<Restaurant />} />
        
        {/* Owner Portal Standalone Routes */}
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/menu" element={<OwnerMenu />} />
        <Route path="/owner/analytics" element={<OwnerAnalytics />} />

        <Route path="/admin/add/restaurant" element={<Admin />} />
        <Route path="/*" element={<Home />} />
      </Routes>
    </div>
  );
}
