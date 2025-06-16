'use client';

import React, { useState } from 'react';
import { Diamond, Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { InteractiveNav } from './InteractiveNav';
import { MobileMenu } from './MobileMenu';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top announcement bar */}
      <div className="bg-navy-900 text-cream py-2 px-4 text-center text-sm">
        <p>Free shipping on all orders over $150 • Limited time offer</p>
      </div>
      
      {/* Main header */}
      <div className="bg-cream border-b border-navy-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu button */}
            <button 
              className="lg:hidden flex items-center"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <div className="space-y-1.5 p-1.5">
                <span className="block w-6 h-0.5 bg-navy-900"></span>
                <span className="block w-6 h-0.5 bg-navy-900"></span>
                <span className="block w-6 h-0.5 bg-navy-900"></span>
              </div>
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Diamond className="h-8 w-8 text-navy-900" />
              <span className="ml-2 text-2xl font-serif tracking-wider text-navy-900">CHARIOT</span>
            </Link>

            {/* Desktop Navigation */}
            <InteractiveNav />

            {/* Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-navy-700 hover:text-navy-900 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-navy-700 hover:text-navy-900 transition-colors">
                <User className="h-5 w-5" />
              </button>
              <button className="p-2 text-navy-700 hover:text-navy-900 transition-colors relative">
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-navy-900 text-cream rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  2
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
};