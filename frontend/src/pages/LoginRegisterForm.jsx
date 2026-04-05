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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-amber-50 overflow-hidden font-sans">
      
      {/* Background Layered Waves (Inspired by provided image) */}
      <svg
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-80"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
      >
        <path fill="#fde68a" fillOpacity="1" d="M0,0L1440,0L1440,320C1344,288,1152,224,960,213.3C768,203,576,245,384,298.7C192,352,96,416,48,448L0,480Z"></path>
        <path fill="#fca5a5" fillOpacity="0.4" d="M0,0L1440,0L1440,192C1344,160,1152,96,960,117.3C768,139,576,245,384,277.3C192,309,96,267,48,245.3L0,224Z"></path>
        <path fill="#fbbf24" fillOpacity="1" d="M0,0L1440,0L1440,128C1344,160,1152,224,960,234.7C768,245,576,203,384,181.3C192,160,96,160,48,160L0,160Z"></path>
        <path fill="#f59e0b" fillOpacity="1" d="M0,0L1440,0L1440,64C1344,96,1152,160,960,160C768,160,576,96,384,85.3C192,75,96,117,48,138.7L0,160Z"></path>
      </svg>

      {/* Main Glassmorphism Split Card */}
      <div 
        className="relative z-10 w-full max-w-5xl bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden border border-white/50 flex flex-col md:flex-row min-h-[600px] animate-fade-in-up"
      >
        
        {/* Left Side: Dish Images (Restored) */}
        <div className="hidden md:flex w-1/2 relative overflow-hidden bg-amber-500/10">
           {/* DishCardView is absolutely positioned, so it will fill this relative container perfectly */}
           <div className="absolute inset-0 w-full h-full">
             <DishCardView />
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-center bg-white/50">
          
          {/* Brand Header */}
          <div className="text-center mb-8">
            <Link to="/home" className="inline-block">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mb-2">
                FoodOS
              </h1>
            </Link>
            <p className="text-gray-500 font-medium">
              {isRegistered ? "Welcome back! Sign in to continue." : "Create an account to get started."}
            </p>
          </div>

          {/* Dynamic Form Component inside Card */}
          <div className="min-h-[300px]">
            {isRegistered ? <Login /> : <Register onSuccess={() => setIsRegistered(true)} />}
          </div>

          {/* Toggle between Login and Register */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              {isRegistered ? "Don't have an account? " : "Already have an account? "}
              <button
                className="text-amber-600 font-bold hover:text-amber-700 transition-colors ml-1 focus:outline-none"
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
