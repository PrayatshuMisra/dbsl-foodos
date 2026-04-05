// LoginRegisterForm.jsx
import { useState, useEffect } from "react";
import Login from "../components/Login";
import Register from "../components/Register";
import DishCardView from "../components/DishCardView";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginRegisterForm() {
  const [isRegistered, setIsRegistered] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.isOwner) {
        navigate("/owner/dashboard");
      } else {
        navigate("/home");
      }
    }
  }, [user, navigate]);

  const handleAlreadyHaveAccountClick = () => {
    setIsRegistered(!isRegistered);
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-sans p-4 md:p-8"
      // Added background image here
      style={{
        backgroundImage: 'url("/assets/site-bg.avif")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Black Overlay over the background image */}
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      {/* Background Layered Waves - Made fully opaque, darker, and removed mix-blend-screen */}
      <svg
        className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <path fill="#92400e" fillOpacity="1" d="M0,0L1440,0L1440,320C1344,288,1152,224,960,213.3C768,203,576,245,384,298.7C192,352,96,416,48,448L0,480Z"></path>
        <path fill="#b45309" fillOpacity="1" d="M0,0L1440,0L1440,192C1344,160,1152,96,960,117.3C768,139,576,245,384,277.3C192,309,96,267,48,245.3L0,224Z"></path>
        <path fill="#d97706" fillOpacity="1" d="M0,0L1440,0L1440,128C1344,160,1152,224,960,234.7C768,245,576,203,384,181.3C192,160,96,160,48,160L0,160Z"></path>
        <path fill="#f59e0b" fillOpacity="1" d="M0,0L1440,0L1440,64C1344,96,1152,160,960,160C768,160,576,96,384,85.3C192,75,96,117,48,138.7L0,160Z"></path>
      </svg>

      {/* Main Glassmorphism Split Card */}
      <div
        className="relative z-10 w-full max-w-5xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-white/20 backdrop-blur-sm"
      >
        {/* Left Side: Dish Images */}
        <div className="hidden md:flex w-[45%] relative overflow-hidden bg-gray-900">
          <div className="absolute inset-0 w-full h-full">
            <DishCardView />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">

          {/* Decorative subtle blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          {/* Brand Header */}
          <div className="text-center mb-10 relative z-10">
            <Link to="/home" className="inline-block transition-transform hover:scale-105 duration-300">
              <h1 className="text-4xl lg:text-5xl font-black text-amber-500 mb-3 tracking-tight drop-shadow-sm">
                FoodOS
              </h1>
            </Link>
            <p className="text-gray-500 font-medium">
              {isRegistered ? "Welcome back! Sign in to continue." : "Create an account to get started."}
            </p>
          </div>

          {/* Dynamic Form Component */}
          <div className="relative z-10 w-full flex-grow flex items-center justify-center">
            {isRegistered ? <Login /> : <Register onSuccess={() => setIsRegistered(true)} />}
          </div>

          {/* Toggle between Login and Register */}
          <div className="mt-10 pt-6 border-t border-gray-100 text-center relative z-10">
            <p className="text-gray-600 text-sm">
              {isRegistered ? "Don't have an account? " : "Already have an account? "}
              <button
                className="text-amber-500 font-bold hover:text-amber-600 transition-colors ml-1 focus:outline-none hover:underline underline-offset-4"
                onClick={handleAlreadyHaveAccountClick}
              >
                {isRegistered ? "Register here" : "Login here"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}