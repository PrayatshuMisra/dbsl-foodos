import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OwnerNav({ activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', name: 'Overview', path: '/owner/dashboard', icon: 'ri-dashboard-line' },
    { id: 'menu', name: 'Manage Menu', path: '/owner/menu', icon: 'ri-restaurant-line' },
    { id: 'analytics', name: 'Business Intelligence', path: '/owner/analytics', icon: 'ri-pie-chart-line' },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err) {
      console.log(err);
      navigate("/");
    }
  };

  const name = user?.user_metadata?.name || user?.email?.split('@')[0] || "Owner";
  const image = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80';

  return (
    <div className="flex w-1/4 flex-col py-8 px-6 glass-card shadow-lg h-fit sticky top-24">
      <div className="mb-10 text-center">
        <img
          src={image}
          alt="Owner"
          className="mx-auto mb-4 h-32 w-32 rounded-full border-4 border-amber-500 shadow-md object-cover"
        />
        <h1 className="text-xl font-bold text-white">{name}</h1>
        <p className="text-sm text-slate-400 mt-1">Restaurant Administrator</p>
      </div>

      <div className="flex flex-col gap-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`rounded-lg px-4 py-3 text-left font-medium transition-colors ${location.pathname === item.path
                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center gap-3">
              <i className={`${item.icon} text-lg`}></i>
              {item.name}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="mt-12 flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 font-medium text-white transition-colors hover:bg-white/20 border border-white/10"
      >
        <i className="ri-logout-box-r-line"></i>
        Log Out
      </button>
    </div>
  );
}
