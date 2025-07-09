"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Category {
  _id: string;
  title: string;
  slug: string;
}

export default function NavBar() {
  const [categories, setCategories] = useState<Category[]>([]);
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
  }, []);

  return (
    <nav className="flex items-center bg-white px-8 py-2 border-b border-blue-200 justify-between h-16">
      <div className="flex items-center gap-16 w-full">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image src="/logo.svg" alt="The Chariot Logo" width={60} height={60} />
        </Link>
        <span className="text-sm text-orange-400 font-light tracking-wide">THE CHARIOT</span>
      </div>
      {/* Navigation Links */}
      <div className="flex gap-8">
        {categories.map((cat) => (
          <Link key={cat._id} href={`/category/${cat.slug}`} className="text-lg font-secondary font-medium text-gray-800 hover:text-orange-400">
            {cat.title}
          </Link>
        ))}
      </div>
      </div>
      {/* Menu Icon */}
      <button className="text-gray-700 hover:text-orange-400 focus:outline-none">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </nav>
  );
}