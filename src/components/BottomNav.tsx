// src/components/BottomNav.tsx
import { Link, useLocation } from "react-router-dom";
import { FaUser, FaStore } from "react-icons/fa";

export default function BottomNav() {
  const location = useLocation();

  const tabs = [
    { path: "/profile", label: "Perfil", icon: <FaUser size={20} /> },
    { path: "/marketplace", label: "Marketplace", icon: <FaStore size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {tabs.map(({ path, label, icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                active
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              <div className="relative flex items-center justify-center">
                {icon}
                {active && (
                  <span className="absolute -bottom-2 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse shadow-md"></span>
                )}
              </div>
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
