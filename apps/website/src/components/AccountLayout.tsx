'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const [userAccountId, setUserAccountId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetchUserAccountId();
  }, []);

  const fetchUserAccountId = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/buyers/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserAccountId(data.buyer.userAccountId || 'N/A');
      }
    } catch (error) {
      console.error('Error fetching user account ID:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    { href: '/profile', label: 'Account', key: 'account' },
    { href: '/orders', label: 'Orders', key: 'orders' },
  ];

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {/* Main Title */}
        <div className="pt-8 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-medium font-balgin-regular text-[#FA7035] text-center">My Account</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="w-full md:min-w-64 md:w-64 bg-gray-100 p-4 sm:p-6 rounded-lg md:sticky md:top-24 h-fit">
              <h2 className="font-bold text-gray-900 mb-4">
                Account ID: {userAccountId || 'Loading...'}
              </h2>
              <hr className="border-gray-300 mb-4" />
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`block font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-orange-600 px-3 py-2 rounded-md'
                        : 'text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md hover:bg-orange-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <button 
                  onClick={handleLogout}
                  className="block text-gray-600 hover:text-orange-600 px-3 py-2 rounded-md hover:bg-orange-50 font-medium w-full text-left transition-colors"
                >
                  Log Out
                </button>
              </nav>
            </div>

             {/* Main Content with Lazy Loading */}
             <div className="flex-1 min-w-0 p-4 sm:p-8 mt-6 md:mt-0 overflow-hidden">
               <Suspense fallback={
                 <div className="flex items-center justify-center min-h-[400px]">
                   <div className="text-center">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                     <p className="mt-2 text-gray-600">Loading content...</p>
                   </div>
                 </div>
               }>
                 {children}
               </Suspense>
             </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AccountLayout;
