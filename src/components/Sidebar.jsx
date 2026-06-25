import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Search, Clock, ShieldCheck, LogOut, User, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="md:w-64 w-full md:h-[100dvh] bg-sidebar border-t md:border-t-0 md:border-r border-border p-2 md:p-6 flex flex-row md:flex-col justify-between items-center md:items-stretch fixed bottom-0 md:relative z-50">
      <div className="w-full md:w-auto">
        <div className="hidden md:flex items-center gap-2 mb-10 text-accent font-semibold text-xl tracking-wide">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <ShieldCheck size={20} className="text-accent" />
          </div>
          RealifyLens
        </div>

        <nav className="flex flex-row md:flex-col justify-around md:justify-start gap-1 md:gap-2 w-full">
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => 
              `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all flex-1 md:flex-none ${
                isActive && window.location.pathname === '/dashboard' ? 'text-accent md:bg-accent md:text-white md:shadow-sm' : 'text-secondaryText hover:bg-black/5 hover:text-primaryText'
              }`
            }
          >
            <Home size={20} className="md:w-[18px] md:h-[18px]" />
            <span className="text-[10px] md:text-base font-medium">Dashboard</span>
          </NavLink>
          <NavLink 
            to="/dashboard/analysis" 
            className={({ isActive }) => 
              `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all flex-1 md:flex-none ${
                isActive ? 'text-accent md:bg-accent md:text-white md:shadow-sm' : 'text-secondaryText hover:bg-black/5 hover:text-primaryText'
              }`
            }
          >
            <Search size={20} className="md:w-[18px] md:h-[18px]" />
            <span className="text-[10px] md:text-base font-medium">Analysis</span>
          </NavLink>
          <NavLink 
            to="/dashboard/history" 
            className={({ isActive }) => 
              `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all flex-1 md:flex-none ${
                isActive ? 'text-accent md:bg-accent md:text-white md:shadow-sm' : 'text-secondaryText hover:bg-black/5 hover:text-primaryText'
              }`
            }
          >
            <Clock size={20} className="md:w-[18px] md:h-[18px]" />
            <span className="text-[10px] md:text-base font-medium">History</span>
          </NavLink>
        </nav>
      </div>

      <div className="hidden md:flex flex-col gap-4">
        {/* System Status */}
        <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-success animate-ping opacity-75"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-primaryText">System Active</span>
            <span className="text-xs text-secondaryText">All services online</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="glass-panel p-4 rounded-xl flex items-center justify-between group hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-orange-500/20 text-orange-500'}`}>
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <span className="text-sm font-semibold text-primaryText">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
        </button>

        {/* User Profile */}
        <div className="glass-panel p-4 rounded-xl flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
              <User size={18} className="text-accent" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-primaryText truncate">{user?.name || 'User'}</span>
              <span className="text-xs text-secondaryText truncate">{user?.email || ''}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 flex-shrink-0 text-secondaryText hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
