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
    <div className="w-64 h-screen bg-sidebar border-r border-border p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-10 text-accent font-semibold text-xl tracking-wide">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <ShieldCheck size={20} className="text-accent" />
          </div>
          RealifyLens
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive && window.location.pathname === '/' ? 'bg-accent text-white shadow-sm' : 'text-secondaryText hover:bg-black/5 hover:text-primaryText'
              }`
            }
          >
            <Home size={18} />
            <span className="font-medium">Dashboard</span>
          </NavLink>
          <NavLink 
            to="/analysis" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-accent text-white shadow-sm' : 'text-secondaryText hover:bg-black/5 hover:text-primaryText'
              }`
            }
          >
            <Search size={18} />
            <span className="font-medium">Analysis</span>
          </NavLink>
          <NavLink 
            to="/history" 
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive ? 'bg-accent text-white shadow-sm' : 'text-secondaryText hover:bg-black/5 hover:text-primaryText'
              }`
            }
          >
            <Clock size={18} />
            <span className="font-medium">History</span>
          </NavLink>
        </nav>
      </div>

      <div className="flex flex-col gap-4">
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
