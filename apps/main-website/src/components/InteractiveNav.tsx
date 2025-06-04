'use client';

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMenu } from '@/hooks/useMenu';

export const InteractiveNav: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const { menuData, loading, error } = useMenu();

  if (loading) {
    return <div className="hidden lg:flex space-x-8">Loading...</div>;
  }

  if (error || !menuData) {
    return <div className="hidden lg:flex space-x-8">Error loading menu</div>;
  }

  const toggleMenu = (categoryId: string | null = null) => {
    if (categoryId === activeCategoryId) {
      setIsMenuOpen(false);
      setActiveCategoryId(null);
      setSelectedSubcategory(null);
    } else {
      setIsMenuOpen(true);
      setActiveCategoryId(categoryId);
      // Automatically select the first subcategory when a category is hovered
      if (categoryId) {
        const category = menuData.categories.find(cat => cat.id === categoryId);
        if (category && category.subcategories && category.subcategories.length > 0) {
          setSelectedSubcategory(category.subcategories[0].id);
        }
      }
    }
  };

  const activeCategory = activeCategoryId ? menuData.categories.find(cat => cat.id === activeCategoryId) : null;
  const selectedSubcategoryData = activeCategory?.subcategories.find(
    subcat => subcat.id === selectedSubcategory
  );

  return (
    <nav className="hidden lg:flex space-x-8">
      {menuData.categories.map((category) => (
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

      {/* Mega Menu */}
      {isMenuOpen && activeCategoryId && activeCategory && (
        <div 
          className="absolute top-full left-0 w-full bg-cream shadow-lg border-t border-navy-100 animate-fadeIn"
          onMouseLeave={() => {
            setIsMenuOpen(false);
            setSelectedSubcategory(null);
          }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-4 gap-8">
              {/* L2 categories */}
              <div className="col-span-1 border-r border-navy-100">
                <h3 className="text-lg font-serif text-navy-900 mb-4">{activeCategory.name}</h3>
                <ul className="space-y-2">
                  {activeCategory.subcategories.map((subcat) => (
                    <li key={subcat.id}>
                      <Link 
                        href={`/${activeCategory.slug}/${subcat.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center justify-between text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-3 py-2 rounded-md transition-colors group ${
                          selectedSubcategory === subcat.id ? 'bg-navy-50 text-navy-900' : ''
                        }`}
                        onMouseEnter={() => setSelectedSubcategory(subcat.id)}
                      >
                        <span>{subcat.name}</span>
                        <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* L3 items */}
              <div className="col-span-1 border-r border-navy-100">
                <h4 className="text-md font-medium text-navy-900 mb-4">Categories</h4>
                <ul className="space-y-1">
                  {selectedSubcategoryData?.items.map((item) => (
                    <li key={item.id}>
                      <Link 
                        href={`/${activeCategory.slug}/${selectedSubcategoryData.slug}/${item.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-3 py-1.5 rounded-md transition-colors text-sm transform hover:translate-x-1"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Featured Items */}
              {activeCategory.featuredItems && activeCategory.featuredItems.length > 0 && (
                <div className="col-span-2">
                  <h4 className="text-md font-medium text-navy-900 mb-4">Featured</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {activeCategory.featuredItems.map((item) => (
                      <Link 
                        key={item.id} 
                        href={`/${activeCategory.slug}/${selectedSubcategory}/${item.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="group cursor-pointer"
                      >
                        <div className="aspect-square relative overflow-hidden rounded-md mb-2 bg-navy-50">
                          {item.image?.url && (
                            <Image 
                              src={item.image.url} 
                              alt={item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/20 transition-colors duration-300" />
                        </div>
                        <h5 className="text-sm font-medium text-navy-900 group-hover:text-navy-700 transition-colors">{item.name}</h5>
                        {item.price && (
                          <p className="text-xs text-navy-700 group-hover:text-gold transition-colors">{item.price}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}; 