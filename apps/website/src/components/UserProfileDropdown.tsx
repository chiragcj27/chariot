'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { useStore } from '@/store/store';

const UserProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { setIsMenuOpen} = useStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  };

  if (!user) {
    return (
      <>
        {/* Login/Signup buttons - visible only on lg+ screens */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-4">
          <Button
            type="button"
            onClick={() => {setIsMenuOpen(false);router.push('/login')} }
            className={`text-gray-700 center w-[clamp(5.25rem,8vw,7rem)] h-[clamp(1.50rem,3vw,2.25rem)] text-[clamp(0.75rem,1.5vw,0.8rem)] border-2 border-[#FCA17A] focus:outline-none transition-colors duration-200 px-2 py-2 rounded-md bg-[#FFFFFF] hover:bg-[#FFC1A0]`}
          >
            LOG IN
          </Button>
          <Button
            type="button"
            onClick={() => {setIsMenuOpen(false);router.push('/signup')} }
            className={`text-gray-700 center w-[clamp(5.25rem,8vw,7rem)] h-[clamp(1.50rem,3vw,2.25rem)] text-[clamp(0.75rem,1.5vw,0.8rem)] border-2 border-[#FCA17A] focus:outline-none transition-colors duration-200 px-2 py-2 rounded-md bg-[#FFFFFF] hover:bg-[#FFC1A0]`}
          >
            SIGN UP
          </Button>
        </div>
        
        {/* Profile icon - visible only on screens smaller than lg */}
        <div className="lg:hidden flex justify-center items-center">
          <button
            onClick={() => router.push('/auth')}
            className="text-[#FCA17A] hover:text-orange-400 focus:outline-none transition-colors duration-200"
            aria-label="User Profile"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {setIsMenuOpen(false);setIsDropdownOpen(!isDropdownOpen)} }
        className="flex items-center space-x-2 text-gray-700 hover:text-orange-400 focus:outline-none transition-colors duration-200"
        aria-label="User Profile"
      >
        <div className="w-8 h-8 bg-[#FFBC9F] rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#FFBC9F] rounded-full flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                {user.userAccountId && (
                  <p className="text-xs text-gray-500">ID: {user.userAccountId}</p>
                )}
                <p className="text-xs text-[#FCA17A] font-medium">
                  Credits: {user.credits.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => {setIsMenuOpen(false);setIsDropdownOpen(false)} }
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>
            
            <Link
              href="/orders"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => {setIsMenuOpen(false);setIsDropdownOpen(false)} }
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Orders
            </Link>

            

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={() => {setIsMenuOpen(false);handleLogout()} }
              className="flex items-center w-full px-4 py-2 text-sm text-[#FCA17A] hover:bg-red-50 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown; 