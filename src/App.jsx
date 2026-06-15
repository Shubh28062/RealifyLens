import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Analysis from './components/Analysis';
import History from './components/History';
import Login from './components/Login';

import { AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const DashboardLayout = () => {
  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 h-screen overflow-y-auto">
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
