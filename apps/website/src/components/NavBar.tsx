"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Fragment } from "react";

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
  const [isClosing, setIsClosing] = useState(false);
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

  // Handle close with animation
  const handleCloseMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 500); // match animation duration
  };

  const handleCategoryClick = (catId: string) => {
    setExpandedCategoryId(expandedCategoryId === catId ? null : catId);
  };

  return (
    <Fragment>
      <nav className="flex items-center bg-white px-8 py-2 border-b border-blue-200 justify-between h-16">
        <div className="flex items-center gap-16 w-full">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image src="/chariot.svg" alt="The Chariot Logo" width={70} height={70} />
          </Link>
        </div>
        {/* Navigation Links */}
        <div className="hidden md:flex gap-8">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/category/${cat.slug}`} className="text-lg font-secondary font-bold text-gray-800 hover:text-orange-400">
              {cat.title}
            </Link>
          ))}
        </div>
        </div>
        {/* Action Icons */}
        <div className="flex items-center gap-4">
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
          
          {/* Say Hi! Button */}
          <button
            className="bg-gray-200 hover:bg-gray-300 font-secondary px-6 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 whitespace-nowrap"
            aria-label="Say Hi!"
          >
            Say Hi! 👋
          </button>
          
          {/* Menu Icon */}
          <button
            className="text-gray-700 hover:text-orange-400 focus:outline-none transition-colors duration-200"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </nav>
      {/* Mobile Menu (dropdown style) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col md:hidden transition-all duration-500 ease-in-out">
          {/* Close Button */}
          <button
            className="absolute top-6 right-8 text-white text-3xl hover:text-orange-400 focus:outline-none"
            onClick={handleCloseMenu}
            aria-label="Close menu"
          >
            &times;
          </button>
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
      {isMenuOpen && (
        <div
          className={`fixed inset-0 z-50 bg-black bg-opacity-95 flex-col hidden md:flex transition-all duration-500 ease-in-out ${isClosing ? 'animate-curtain-up' : 'animate-curtain-drop'}`}
        >
          <div>
            {/* Logo */}
            <div className="absolute top-6 left-8 flex items-center gap-2">
              <Link href="/">
                <Image src="/chariot.svg" alt="The Chariot Logo" width={70} height={70}/>
              </Link>
            </div>
          {/* Close Button */}
          <button
            className="absolute top-6 right-8 text-white text-3xl hover:text-orange-400 focus:outline-none"
            onClick={handleCloseMenu}
            aria-label="Close menu"
          >
            &times;
          </button>
          </div>
          {/* Curtain Content */}
          <div className="flex flex-1 flex-col justify-cente items-center md:flex-row md:items-start md:justify-center gap-16 w-full max-w-6xl mx-auto mt-20">
            {/* Categories Columns */}
            {categories.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-16 flex-1">
                {categories.map((cat) => (
                  <div key={cat._id}>
                    <h2 className="text-white text-2xl font-semibold mb-4">{cat.title}</h2>
                    <ul className="space-y-2">
                      {Array.isArray(cat.items) && cat.items.length > 0 ? (
                        cat.items.map((item: CategoryItem) => (
                          <li key={item._id}>
                            <Link href={`/category/${cat.slug}/${item.slug}`} className="text-gray-300 font-secondary hover:text-orange-400 cursor-pointer" onClick={handleCloseMenu}>
                              {item.title}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">No items</li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            {/* Contact Column */}
            <div className="min-w-[180px]">
              <h2 className="text-white text-2xl font-semibold mb-4">Contact</h2>
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
      `}</style>
    </Fragment>
  );
}