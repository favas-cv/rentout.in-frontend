import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route guard for admin (staff) users.
 * Checks that the user is authenticated and has `is_staff` flag true.
 */
const AdminProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth() || {};
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  // user may be null if not logged in
  if (!user || !user.is_staff) {
    // redirect to auth page, preserving the intended location
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
