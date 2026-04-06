import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, Upload, BookOpen, Sparkles, BookUser, CreditCard, User } from 'lucide-react';

const navItems = [
  { label: 'Home', path: '/home', icon: Home },
  { label: 'Health', path: '/health', icon: Heart },
  { label: 'Upload', path: '/upload', icon: Upload },
  { label: 'Resource Library', path: '/library', icon: BookOpen },
  { label: 'BioAge', path: '/bioage', icon: Sparkles },
  { label: 'Booking', path: '/booking', icon: BookUser },
  { label: 'Schedule', path: '/schedule', icon: CreditCard },
  { label: 'Profile', path: '/profile', icon: User },
];

export default function DashboardSidebar({ activePath }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = activePath || location.pathname;

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50">
      <div className="bg-gradient-to-b from-teal-400 via-teal-500 to-cyan-400 rounded-full p-3 shadow-2xl w-fit h-fit">
        <div className="flex flex-col items-center gap-6 py-12 px-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            const isTopSection = index < 3;

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                title={item.label}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all relative group ${
                  isActive ? 'bg-white shadow-lg scale-110' : 'hover:bg-white/20'
                }`}
              >
                <Icon
                  className={`w-7 h-7 ${
                    isActive
                      ? isTopSection ? 'text-teal-500' : 'text-gray-400'
                      : 'text-white'
                  }`}
                />
                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}