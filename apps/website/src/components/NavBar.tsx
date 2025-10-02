"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Fragment } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from "@/contexts/CartContext";
import UserProfileDropdown from './UserProfileDropdown';
import { useStore } from "@/store/store";

interface Category {
  _id: string;
  slug: string;
  title: string;
  items?: CategoryItem[];
}

// Add type for item
interface CategoryItem {
  _id: string;
  slug: string;
  title: string;
}

export default function NavBar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const { isMenuOpen, setIsMenuOpen } = useStore();
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const { getTotalItems } = useCart();

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${API_URL}/api/menu/structure`);
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, [API_URL]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup in case component unmounts while menu is open
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Handle close with animation
  const handleCloseMenu = () => {
    setTimeout(() => {
      setIsMenuOpen(false);
    }, 500); // match animation duration
  };

  const handleCategoryClick = (catId: string) => {
    setExpandedCategoryId(expandedCategoryId === catId ? null : catId);
  };

  return (
    <Fragment>
      <nav className={`sticky top-0 z-50 flex items-center  ${isMenuOpen ? 'bg-[#CFDAE9]' : 'bg-white'} ${isMenuOpen ? '' : 'shadow-md'} transition-colors duration-800 px-[clamp(1rem,4vw,2rem)] py-[clamp(0.5rem,1.5vw,0.75rem)] justify-between h-[clamp(3.5rem,8vw,4rem)]`}>
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-[clamp(1rem,4vw,2rem)]">
          {/* Logo */}
          <div className="flex items-center z-50 gap-2">
            <Link href="/">
              <Image 
                src="/chariot.svg" 
                alt="The Chariot Logo" 
                width={114} 
                height={66} 
                className="w-[clamp(4rem,8vw,4.375rem)] h-[clamp(4rem,8vw,4.375rem)]"
              />
            </Link>
          </div>
          {/* Navigation Links (fade) */}
          <div className={`hidden lg:flex gap-[clamp(1rem,3vw,2rem)] transition-opacity duration-500 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {categories.map((cat) => (
              <Link key={cat._id} href={`/category/${cat.slug}`} className="text-[clamp(1rem,1.8vw,1.125rem)] font-secondary font-medium text-gray-800 hover:text-[#FA7035] transition-colors duration-200 whitespace-nowrap">
                {cat.title}
              </Link>
            ))}
          </div>
        </div>
        {/* Right: Icons + Say Hi + Menu Icon */}
        <div className="flex items-center gap-[clamp(0.75rem,2vw,1rem)]">
          {/* Action Icons (fade) */}
          <div className={`flex items-center gap-[clamp(0.75rem,2vw,1rem)] transition-opacity duration-500 `}>
            {/* User Profile Dropdown */}
            <UserProfileDropdown />
            {/* Wishlist Icon */}
            {/* <button
              className="text-gray-700 hover:text-orange-400 focus:outline-none transition-colors duration-200"
              aria-label="Wishlist"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button> */}
            {/* Cart Icon */}
            <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="group relative text-gray-700 group-hover:text-[#FA7035] focus:outline-none transition-colors duration-200">
              <svg width="30" height="27" viewBox="0 0 30 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.6001 17.1501H23.0001C23.8801 17.1501 24.6001 17.8476 24.6001 18.7001C24.6001 19.5526 23.8801 20.2501 23.0001 20.2501H7.0001C6.1201 20.2501 5.4001 19.5526 5.4001 18.7001V3.2001H2.2001C1.3201 3.2001 0.600098 2.5026 0.600098 1.6501C0.600098 0.797598 1.3201 0.100098 2.2001 0.100098H7.0001C7.8801 0.100098 8.6001 0.797598 8.6001 1.6501V4.7501H29.4001L23.0001 15.6001H8.6001V17.1501ZM7.8001 21.8001C9.1281 21.8001 10.2001 22.8386 10.2001 24.1251C10.2001 25.4116 9.1281 26.4501 7.8001 26.4501C6.4721 26.4501 5.4001 25.4116 5.4001 24.1251C5.4001 22.8386 6.4721 21.8001 7.8001 21.8001ZM22.2001 21.8001C23.5281 21.8001 24.6001 22.8386 24.6001 24.1251C24.6001 25.4116 23.5281 26.4501 22.2001 26.4501C20.8721 26.4501 19.8001 25.4116 19.8001 24.1251C19.8001 22.8386 20.8721 21.8001 22.2001 21.8001Z" fill="#FFCCB6"/>
              </svg>

              {getTotalItems() > 0 && (
                <span className={`absolute -top-2 -right-2 bg-[#FCA17A] group-hover:bg-orange-400 ${isMenuOpen ? 'text-black' : 'text-white'} text-[clamp(0.625rem,1.5vw,0.75rem)] rounded-full h-[clamp(1rem,2.5vw,1.25rem)] w-[clamp(1rem,2.5vw,1.25rem)] flex items-center justify-center min-w-[1rem] min-h-[1rem]`}>
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>
          {/* Say Hi! Button (no fade) */}
          {/* <button
            className="bg-gray-200 hover:bg-gray-300 z-50 font-secondary px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
            aria-label="Say Hi!"
          >
            Say Hi! 👋
          </button> */}
          {/* Menu Icon (no fade) */}
          <button
            className="relative w-[clamp(1.5rem,3vw,2rem)] h-[clamp(1.5rem,3vw,2rem)] z-[100] flex flex-col justify-center items-center group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <span
              className={`absolute w-[clamp(1.125rem,2.5vw,1.5rem)] h-0.5 transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 bg-black group-hover:bg-[#FA7035]' : '-translate-y-1.5 bg-black group-hover:bg-orange-400'
              }`}
            />
            <span
              className={`absolute w-[clamp(1.125rem,2.5vw,1.5rem)] h-0.5 transition-all duration-300 ${
                isMenuOpen ? 'opacity-0 bg-black group-hover:bg-[#FA7035]' : 'bg-black group-hover:bg-orange-400'
              }`}
            />
            <span
              className={`absolute w-[clamp(1.125rem,2.5vw,1.5rem)] h-0.5 transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 bg-black group-hover:bg-[#FA7035]' : 'translate-y-1.5 bg-black group-hover:bg-orange-400'
              }`}
            />
          </button>
        </div>
      </nav>
      {/* Mobile Menu (dropdown style) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col lg:hidden transition-all duration-500 ease-in-out">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 z-60 w-8 h-8 flex items-center justify-center text-white hover:text-[#FA7035] transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="flex flex-col mt-[clamp(5rem,12vw,6rem)] px-[clamp(1rem,4vw,2rem)] gap-[clamp(0.75rem,2vw,1rem)] overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat._id}>
                <button
                  className="w-full text-left text-white text-[clamp(1.125rem,3vw,1.25rem)] font-semibold flex justify-between items-center py-2"
                  onClick={() => handleCategoryClick(cat._id)}
                >
                  {cat.title}
                  <span className="text-[clamp(1rem,2.5vw,1.125rem)]">{expandedCategoryId === cat._id ? '-' : '+'}</span>
                </button>
                {expandedCategoryId === cat._id && (
                  <ul className="pl-[clamp(0.75rem,2vw,1rem)] mt-2 space-y-2">
                    {Array.isArray(cat.items) && cat.items.length > 0 ? (
                      cat.items.map((item: CategoryItem) => (
                        <li key={item._id}>
                          <Link
                            href={`/category/${cat.slug}/${item.slug}`}
                            className="text-gray-300 font-secondary hover:text-[#FA7035] cursor-pointer text-[clamp(0.875rem,2.2vw,1rem)] block py-1"
                            onClick={handleCloseMenu}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic text-[clamp(0.875rem,2.2vw,1rem)]">No items</li>
                    )}
                  </ul>
                )}
              </div>
            ))}
            {/* Contact Section */}
            <div className="mt-[clamp(1.5rem,4vw,2rem)]">
              <h2 className="text-white text-[clamp(1.125rem,3vw,1.25rem)] font-semibold mb-2">Contact</h2>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 font-secondary hover:text-[#FA7035] text-[clamp(0.875rem,2.2vw,1rem)]">Email</a></li>
                <li><a href="#" className="text-gray-300 font-secondary hover:text-[#FA7035] text-[clamp(0.875rem,2.2vw,1rem)]">LinkedIn</a></li>
                <li><a href="#" className="text-gray-300 font-secondary hover:text-[#FA7035] text-[clamp(0.875rem,2.2vw,1rem)]">Twitter</a></li>
                <li><a href="#" className="text-gray-300 font-secondary hover:text-[#FA7035] text-[clamp(0.875rem,2.2vw,1rem)]">Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Curtain Drop Menu Overlay */}
      <AnimatePresence>
      {isMenuOpen && (
        <motion.div
        initial={{
          height: 0,
          borderBottomLeftRadius: '50% 10%',
          borderBottomRightRadius: '50% 10%',
        }}
        animate={{
          height: '100vh',
          borderBottomLeftRadius: '0%',
          borderBottomRightRadius: '0%',
        }}
        exit={{
          height: 0,
          borderBottomLeftRadius: '50% 10%',
          borderBottomRightRadius: '50% 10%',
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="fixed top-0 left-0 w-full z-40 bg-gradient-to-b from-[#CFDAE9] to-white text-black flex flex-col overflow-hidden"
      >
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-[clamp(1rem,4vw,2rem)] pb-[clamp(1rem,4vw,2rem)] mt-[clamp(4.5rem,10vw,5rem)] relative z-10 scrollbar-hide">
          {/* Main Layout: 4-Column Grid */}
          <div className="w-full max-w-7xl mx-auto">
            {/* Categories Grid - 4 Columns including Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[clamp(1.5rem,4vw,2rem)]">
              {/* First 6 Categories */}
              {categories.slice(0, 6).map((cat, index) => (
                <motion.div 
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="space-y-[clamp(0.75rem,2vw,1rem)]"
                >
                  <h2 className="text-black text-[clamp(1.125rem,2.5vw,1.25rem)] font-bold tracking-wide border-b border-gray-700 pb-2">
                    {cat.title}
                  </h2>
                  <ul className="space-y-2">
                    {Array.isArray(cat.items) && cat.items.length > 0 ? (
                      cat.items.map((item: CategoryItem, itemIndex) => (
                        <motion.li 
                          key={item._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index * 0.1) + (itemIndex * 0.05), duration: 0.3 }}
                        >
                          <Link 
                            href={`/category/${cat.slug}/${item.slug}`} 
                            className="text-gray-900 text-[clamp(0.875rem,2vw,1rem)] font-medium hover:text-[#FA7035] cursor-pointer transition-colors duration-200 flex items-center group"
                            onClick={handleCloseMenu}
                          >
                            <span className="w-1.5 h-1.5 bg-[#FA7035] rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                            {item.title}
                          </Link>
                        </motion.li>
                      ))
                    ) : (
                      <motion.li 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="text-gray-900 italic text-[clamp(0.875rem,2vw,1rem)]"
                      >
                        No items
                      </motion.li>
                    )}
                  </ul>
                </motion.div>
              ))}

              {/* Contact Section as 4th Column */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="space-y-[clamp(0.75rem,2vw,1rem)]"
              >
                <h2 className="text-black text-[clamp(1.125rem,2.5vw,1.25rem)] font-bold tracking-wide border-b border-gray-700 pb-2">
                  Contact
                </h2>
                <ul className="space-y-2">
                  {['Email', 'LinkedIn', 'Twitter', 'Instagram'].map((platform, index) => (
                    <motion.li 
                      key={platform}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + (index * 0.1), duration: 0.3 }}
                    >
                      <a 
                        href="#" 
                        className="text-gray-900 text-[clamp(0.875rem,2vw,1rem)] font-medium hover:text-[#FA7035] cursor-pointer transition-colors duration-200 flex items-center group"
                      >
                        <span className="w-1.5 h-1.5 bg-[#FA7035] rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                        {platform}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
        </motion.div>
        )}
        </AnimatePresence>
      <style jsx global>{`
        @keyframes curtain-drop {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes curtain-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0; }
        }
        .animate-curtain-drop {
          animation: curtain-drop 0.5s cubic-bezier(0.77,0,0.175,1) forwards;
        }
        .animate-curtain-up {
          animation: curtain-up 0.5s cubic-bezier(0.77,0,0.175,1) forwards;
        }
        
        /* Hide scrollbar for webkit browsers */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </Fragment>
  );
}