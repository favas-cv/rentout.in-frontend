import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to auth page, saving the current location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (user?.is_staff) {
    // Redirect staff members to admin home
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
