import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Analysis from './components/Analysis';
import History from './components/History';
import Login from './components/Login';

import { ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';
import { AuthContext } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const MobileHeader = () => {
  const { logout } = React.useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-sidebar border-b border-border z-40">
      <div className="flex items-center gap-2 text-accent font-semibold text-lg">
        <ShieldCheck size={20} className="text-accent" /> RealifyLens
      </div>
      <div className="flex items-center gap-5">
        <button onClick={toggleTheme} className="text-secondaryText hover:text-accent">
          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button onClick={() => logout()} className="text-secondaryText hover:text-red-500">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-background overflow-hidden font-sans relative">
        <MobileHeader />
        <Sidebar />
        <div className="flex-1 h-full overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<MainContent />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/history" element={<History />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
