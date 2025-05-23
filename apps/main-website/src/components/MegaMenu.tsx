import React from 'react';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { mainCategories } from './Header';
import { menuData } from '../data/menuData';

interface MegaMenuProps {
  categoryId: string | null;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ categoryId }) => {
  const activeCategory = mainCategories.find(cat => cat.id === categoryId);
  
  if (!activeCategory || !categoryId) return null;
  
  const categoryData = menuData[categoryId];
  if (!categoryData) return null;

  return (
    <div className="absolute w-full bg-cream shadow-lg border-t border-navy-100 animate-fadeIn">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-4 gap-8">
          {/* L2 categories */}
          <div className="col-span-1 border-r border-navy-100">
            <h3 className="text-lg font-serif text-navy-900 mb-4">{activeCategory.name}</h3>
            <ul className="space-y-2">
              {categoryData.subcategories.map((subcat) => (
                <li key={subcat.id}>
                  <a 
                    href={`#${subcat.id}`}
                    className="flex items-center justify-between text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-3 py-2 rounded-md transition-colors group"
                  >
                    <span>{subcat.name}</span>
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* L3 items */}
          <div className="col-span-1 border-r border-navy-100">
            <h4 className="text-md font-medium text-navy-900 mb-4">Categories</h4>
            <ul className="space-y-1">
              {categoryData.subcategories[0].items.map((item) => (
                <li key={item.id}>
                  <a 
                    href={`#${item.id}`}
                    className="block text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-3 py-1.5 rounded-md transition-colors text-sm transform hover:translate-x-1"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Featured Items */}
          <div className="col-span-2">
            <h4 className="text-md font-medium text-navy-900 mb-4">Featured</h4>
            <div className="grid grid-cols-2 gap-4">
              {categoryData.featured.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="aspect-square relative overflow-hidden rounded-md mb-2 bg-navy-50">
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/20 transition-colors duration-300" />
                  </div>
                  <h5 className="text-sm font-medium text-navy-900 group-hover:text-navy-700 transition-colors">{item.name}</h5>
                  <p className="text-xs text-navy-700 group-hover:text-gold transition-colors">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Bottom Banner */}
        <div className="mt-8 pt-4 border-t border-navy-100">
          <div className="bg-navy-50 rounded-md p-4 text-center transform hover:scale-[1.01] transition-transform">
            <p className="text-navy-900 font-serif">Discover our newest collection – Eternal Radiance</p>
            <a href="#collection" className="inline-block mt-2 text-sm font-medium text-navy-900 hover:text-gold transition-colors">
              Shop Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};