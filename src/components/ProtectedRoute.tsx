import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    // User not authenticated, redirect to home page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;