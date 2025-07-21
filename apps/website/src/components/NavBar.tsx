"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Fragment } from "react";
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
      <nav className="flex items-center bg-white px-8 py-2 shadow-md justify-between h-16">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center z-50 gap-2">
            <Link href="/">
              <Image src="/chariot.svg" alt="The Chariot Logo" width={70} height={70} />
            </Link>
          </div>
          {/* Navigation Links (fade) */}
          <div className={`hidden md:flex gap-8 transition-opacity duration-500 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {categories.map((cat) => (
              <Link key={cat._id} href={`/category/${cat.slug}`} className="text-lg font-secondary font-medium text-gray-800 hover:text-[#FCA17A]">
                {cat.title}
              </Link>
            ))}
          </div>
        </div>
        {/* Right: Icons + Say Hi + Menu Icon */}
        <div className="flex items-center gap-4">
          {/* Action Icons (fade) */}
          <div className={`flex items-center gap-4 transition-opacity duration-500 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {/* Profile Icon */}
            <button
              className="text-gray-700 hover:text-orange-400 focus:outline-none transition-colors duration-200"
              aria-label="Profile"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            {/* Wishlist Icon */}
            <button
              className="text-gray-700 hover:text-orange-400 focus:outline-none transition-colors duration-200"
              aria-label="Wishlist"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            {/* Cart Icon */}
            <button
              className="text-gray-700 hover:text-orange-400 focus:outline-none transition-colors duration-200"
              aria-label="Shopping cart"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </button>
          </div>
          {/* Say Hi! Button (no fade) */}
          <button
            className="bg-gray-200 hover:bg-gray-300 z-50 font-secondary px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
            aria-label="Say Hi!"
          >
            Say Hi! 👋
          </button>
          {/* Menu Icon (no fade) */}
          <button
            className="relative w-8 h-8 z-[100] flex flex-col justify-center items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span
              className={`absolute w-6 h-0.5 transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 bg-white' : '-translate-y-1.5 bg-black'
              }`}
            />
            <span
              className={`absolute w-6 h-0.5 transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 bg-white' : 'translate-y-1.5 bg-black'
              }`}
            />
          </button>
        </div>
      </nav>
      {/* Mobile Menu (dropdown style) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col md:hidden transition-all duration-500 ease-in-out">
          <div className="flex flex-col mt-24 px-8 gap-4 overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat._id}>
                <button
                  className="w-full text-left text-white text-xl font-semibold flex justify-between items-center"
                  onClick={() => handleCategoryClick(cat._id)}
                >
                  {cat.title}
                  <span>{expandedCategoryId === cat._id ? '-' : '+'}</span>
                </button>
                {expandedCategoryId === cat._id && (
                  <ul className="pl-4 mt-2 space-y-2">
                    {Array.isArray(cat.items) && cat.items.length > 0 ? (
                      cat.items.map((item: CategoryItem) => (
                        <li key={item._id}>
                          <Link
                            href={`/category/${cat.slug}/${item.slug}`}
                            className="text-gray-300 font-secondary hover:text-orange-400 cursor-pointer"
                            onClick={handleCloseMenu}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic">No items</li>
                    )}
                  </ul>
                )}
              </div>
            ))}
            {/* Contact Section */}
            <div className="mt-8">
              <h2 className="text-white text-xl font-semibold mb-2">Contact</h2>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 font-secondary hover:text-orange-400">Email</a></li>
                <li><a href="#" className="text-gray-300 font-secondary hover:text-orange-400">LinkedIn</a></li>
                <li><a href="#" className="text-gray-300 font-secondary hover:text-orange-400">Twitter</a></li>
                <li><a href="#" className="text-gray-300 font-secondary hover:text-orange-400">Instagram</a></li>
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
        className="fixed top-0 left-0 w-full z-40 bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 mt-18 relative z-10 scrollbar-hide">
          {/* Main Layout: 4-Column Grid */}
          <div className="w-full max-w-7xl mx-auto">
            {/* Categories Grid - 4 Columns including Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* First 6 Categories */}
              {categories.slice(0, 6).map((cat, index) => (
                <motion.div 
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="space-y-3"
                >
                  <h2 className="text-white text-xl font-bold tracking-wide border-b border-gray-700 pb-2">
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
                            className="text-gray-300 text-base font-medium hover:text-orange-400 cursor-pointer transition-colors duration-200 flex items-center group"
                            onClick={handleCloseMenu}
                          >
                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                            {item.title}
                          </Link>
                        </motion.li>
                      ))
                    ) : (
                      <motion.li 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="text-gray-500 italic text-base"
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
                className="space-y-3"
              >
                <h2 className="text-white text-xl font-bold tracking-wide border-b border-gray-700 pb-2">
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
                        className="text-gray-300 text-base font-medium hover:text-orange-400 cursor-pointer transition-colors duration-200 flex items-center group"
                      >
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
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