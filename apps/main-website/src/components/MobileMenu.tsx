import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { mainCategories } from './Header';
import { menuData } from '../data/menuData';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      setActiveCategory(null);
      setActiveSubcategory(null);
    } else {
      setActiveCategory(categoryId);
      setActiveSubcategory(null);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    if (activeSubcategory === subcategoryId) {
      setActiveSubcategory(null);
    } else {
      setActiveSubcategory(subcategoryId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-cream lg:hidden animate-slideIn">
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-navy-100">
          <h2 className="text-lg font-serif text-navy-900">Menu</h2>
          <button onClick={onClose} className="p-2 text-navy-900">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-navy-100">
            {mainCategories.map((category) => (
              <li key={category.id} className="py-1">
                <button
                  className="flex justify-between items-center w-full p-4 text-left text-navy-900 font-medium"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <span>{category.name}</span>
                  {activeCategory === category.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                
                {activeCategory === category.id && menuData[category.id] && (
                  <div className="pl-4 pr-2 pb-2">
                    <ul className="divide-y divide-navy-50">
                      {menuData[category.id].subcategories.map((subcat) => (
                        <li key={subcat.id} className="py-1">
                          <button
                            className="flex justify-between items-center w-full p-3 text-left text-navy-800 text-sm"
                            onClick={() => handleSubcategoryClick(subcat.id)}
                          >
                            <span>{subcat.name}</span>
                            {activeSubcategory === subcat.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                          
                          {activeSubcategory === subcat.id && (
                            <ul className="pl-4 py-1 space-y-1">
                              {subcat.items.map((item) => (
                                <li key={item.id}>
                                  <a
                                    href={`#${item.id}`}
                                    className="block p-2 text-navy-700 hover:text-navy-900 text-sm"
                                  >
                                    {item.name}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-navy-100">
          <div className="flex flex-col space-y-2">
            <a href="#account" className="block w-full py-2 px-4 text-center bg-navy-50 text-navy-900 rounded-md">
              Sign In / Register
            </a>
            <a href="#cart" className="block w-full py-2 px-4 text-center bg-navy-900 text-cream rounded-md">
              View Cart (2)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};