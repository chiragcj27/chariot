import React, { useState } from 'react';
import { Diamond, Search, ShoppingBag, User } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const toggleMenu = (categoryId: string | null = null) => {
    if (categoryId === activeCategoryId) {
      setIsMenuOpen(false);
      setActiveCategoryId(null);
    } else {
      setIsMenuOpen(true);
      setActiveCategoryId(categoryId);
    }
  };

  return (
    <header className="relative z-50">
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <div className="space-y-1.5 p-1.5">
                <span className={`block w-6 h-0.5 bg-navy-900 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-navy-900 transition-opacity ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`block w-6 h-0.5 bg-navy-900 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Diamond className="h-8 w-8 text-navy-900" />
              <span className="ml-2 text-2xl font-serif tracking-wider text-navy-900">CHARIOT</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  className={`px-2 py-1 text-sm font-medium tracking-wide transition-colors relative
                    ${activeCategoryId === category.id ? 'text-navy-900' : 'text-navy-700 hover:text-navy-900'}
                    after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 
                    after:bg-navy-900 after:transform after:scale-x-0 after:transition-transform
                    ${activeCategoryId === category.id ? 'after:scale-x-100' : 'hover:after:scale-x-100'}`}
                  onClick={() => toggleMenu(category.id)}
                  onMouseEnter={() => toggleMenu(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </nav>

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

      {/* Mega Menu (Desktop) */}
      {isMenuOpen && (
        <div 
          className="hidden lg:block absolute w-full"
          onMouseLeave={() => setIsMenuOpen(false)}
        >
          <MegaMenu 
            categoryId={activeCategoryId} 
            onClose={() => setIsMenuOpen(false)} 
          />
        </div>
      )}

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
};

// Define your main categories based on the image
export const mainCategories = [
  { id: 'marketing', name: 'Marketing & Sales' },
  { id: 'design', name: 'Design Services' },
  { id: 'pos', name: 'Point of Sale' },
  { id: 'branding', name: 'Branding & Identity' },
  { id: 'collections', name: 'Collections' },
  { id: 'about', name: 'About Us' },
];