'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-400"></div>
    </div>
  )
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Show loading spinner while checking authentication
  if (loading) {
    return <>{fallback}</>;
  }

  // Redirect to home if not authenticated
  if (!user) {
    router.push('/');
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute; 