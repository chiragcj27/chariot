import { FacebookIcon, InstagramIcon, LinkedinIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Category {
  _id: string;
  slug: string;
  title: string;
  items?: CategoryItem[];
}

interface CategoryItem {
  _id: string;
  slug: string;
  title: string;
}

export default function Footer() {
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
  }, [API_URL]);
  return (
    <footer className="bg-seafoam min-w-full text-gray-800">
      {/* Main Footer Content */}
      <div className="mx-4 sm:mx-12 lg:mx-24 py-8 sm:py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-4 col-span-2 sm:space-y-6 sm:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-semibold text-gray-900">Chariot</h3>
              <p className="text-base font-secondary text-gray-700 leading-relaxed">
              Empowering jewelry businesses with innovative solutions and cutting-edge technology. Building the future, one project at a time.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="sr-only">Instagram</span>
                  <InstagramIcon/>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="sr-only">Facebook</span>
                  <FacebookIcon/>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <LinkedinIcon/>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Quick Links</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link href="/" className="text-base font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-base font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                    About Us
                  </Link>
                </li>
                {/* <li>
                  <Link href="/services" className="text-base font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-base font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                    Help
                  </Link>
                </li> */}
                <li>
                  <Link href="/contact" className="text-base font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Services</h3>
              <ul className="space-y-2 sm:space-y-3">
                {categories.map((category) => (
                  <li key={category._id}>
                    <Link href={`/category/${category.slug}`} className="text-base font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                      {category.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Contact Us</h3>
              <div className="space-y-3 sm:space-y-4">
                
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:Customercare@thechariot.net" className="text-base font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                  Customercare@thechariot.net
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+1234567890" className="text-base font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                    (123) 456-7890
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-seafoam bg-seafoam">
        <div className="mx-4 sm:mx-12 lg:mx-24 py-4 sm:py-6 lg:py-8">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-base font-secondary text-gray-700 text-center md:text-left">
                © 2025 Chariot. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-base">
                <Link href="/privacy" className="font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                  Terms of Service
                </Link>
                {/* <Link href="/cookies" className="font-secondary text-gray-700 hover:text-gray-900 transition-colors">
                  Cookie Policy
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
