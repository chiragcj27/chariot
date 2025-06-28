'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

const menuItems = [
  {
    label: 'Marketing Service',
    dropdown: [
      { label: 'SEO', href: '#' },
      { label: 'Content Marketing', href: '#' },
      { label: 'Social Media', href: '#' },
      { label: 'Email Marketing', href: '#' },
    ],
  },
  {
    label: 'Design Service',
    dropdown: [
      { label: 'Logo Design', href: '#' },
      { label: 'UI/UX', href: '#' },
      { label: 'Branding', href: '#' },
      { label: 'Print Design', href: '#' },
    ],
  },
  {
    label: 'Point of Sale',
    dropdown: [
      { label: 'POS Software', href: '#' },
      { label: 'Hardware', href: '#' },
      { label: 'Integrations', href: '#' },
    ],
  },
  {
    label: 'Brand & Identity',
    dropdown: [
      { label: 'Brand Strategy', href: '#' },
      { label: 'Identity Design', href: '#' },
      { label: 'Voice & Tone', href: '#' },
    ],
  },
];

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  return (
    <nav className="w-full border-b border-black/80 bg-seafoam">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/file.svg" alt="Chariot Logo" height={36} width={36} className="mr-4" />
        </Link>
        
        {/* Desktop Navigation Menu */}
        <div className="hidden md:block">
          <NavigationMenu className="w-full" viewport={false}>
            <NavigationMenuList className="gap-10 w-full justify-start">
              {menuItems.map((item, idx) => (
                <NavigationMenuItem key={item.label} className="relative">
                  <NavigationMenuTrigger className="font-semibold hover:text-gray-700 focus:outline-none transition-colors duration-200 bg-transparent border-none shadow-none hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:hover:bg-transparent data-[state=open]:focus:bg-transparent focus-visible:ring-0 focus-visible:outline-none">
                    {item.label}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="absolute left-0 top-full mt-2 z-50">
                    <ul className="grid w-52 gap-1 p-2 bg-white border border-gray-200 shadow-lg rounded">
                      {item.dropdown.map((option, optionIdx) => (
                        <li key={option.label}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={option.href}
                              className="block px-4 py-3 text-sm  hover:text-black transition-all duration-200 cursor-pointer transform hover:translate-x-1 hover:shadow-sm relative overflow-hidden group bg-transparent border-none shadow-none focus:bg-sunrise/30 focus:text-black focus-visible:ring-0 focus-visible:outline-none"
                              style={{
                                animationDelay: `${optionIdx * 50}ms`,
                                animation: 'slideInFromLeft 0.3s ease-out forwards'
                              }}
                            >
                              <span className="relative z-10">{option.label}</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-sunrise/20 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Hamburger Icon */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-black transition-all"></span>
          <span className="block w-6 h-0.5 bg-black transition-all"></span>
          <span className="block w-6 h-0.5 bg-black transition-all"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 animate-fade-in">
          <ul className="flex flex-col gap-2">
            {menuItems.map((item, idx) => (
              <li key={item.label} className="relative">
                <button
                  className="w-full text-left font-semibold py-2 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                  onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                >
                  {item.label}
                </button>
                {/* Dropdown */}
                <div className="transition-all duration-200 ease-out">
                  {openDropdown === idx && (
                    <ul className="pl-4 border-l border-gray-200 animate-dropdown">
                      {item.dropdown.map((option, optionIdx) => (
                        <li key={option.label}>
                          <Link
                            href={option.href}
                            className="block px-2 py-2 text-sm hover:bg-sunrise/30 hover:text-black transition-all duration-200 cursor-pointer transform hover:translate-x-1 hover:shadow-sm relative overflow-hidden group"
                            style={{
                              animationDelay: `${optionIdx * 100}ms`,
                              animation: 'slideInFromLeft 0.3s ease-out forwards'
                            }}
                          >
                            <span className="relative z-10">{option.label}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-sunrise/20 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-dropdown {
          animation: fadeInDown 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </nav>
  );
}

// Add custom animations for fade-in and dropdown in your global CSS:
// .animate-fade-in { @apply animate-fadeIn; }
// .animate-dropdown { @apply animate-fadeInDown; }
// You can define these with Tailwind's keyframes in your tailwind.config.js if not already present.
