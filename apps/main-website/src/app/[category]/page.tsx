import React from 'react';
import { notFound } from 'next/navigation';
import { mainCategories } from '@/data/categories';
import Image from 'next/image';
import Link from 'next/link';
import { menuService } from '@/services/menu.service';
import type { Category } from '@/services/menu.service';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = params;
  const category = mainCategories.find(cat => cat.id === categorySlug);
  
  if (!category) {
    notFound();
  }

  const menuStructure = await menuService.getMenuStructure();
  const categoryData = menuStructure.categories.find(
    (cat: Category) => cat.slug === categorySlug
  );

  if (!categoryData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-navy-900 mb-8">{category.name}</h1>
      
      {/* Subcategories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {categoryData.subcategories.map((subcat) => (
          <Link 
            key={subcat.id}
            href={`/${categorySlug}/${subcat.slug}`}
            className="group"
          >
            <div className="bg-navy-50 rounded-lg p-6 hover:bg-navy-100 transition-colors">
              <h2 className="text-xl font-medium text-navy-900 mb-4">{subcat.name}</h2>
              <ul className="space-y-2">
                {subcat.items.slice(0, 4).map((item) => (
                  <li key={item.id} className="text-navy-700 hover:text-navy-900">
                    {item.name}
                  </li>
                ))}
                {subcat.items.length > 4 && (
                  <li className="text-navy-600 text-sm">
                    +{subcat.items.length - 4} more items
                  </li>
                )}
              </ul>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured Items */}
      <div className="mt-12">
        <h2 className="text-2xl font-serif text-navy-900 mb-6">Featured Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryData.featuredItems?.map((item) => (
            <div key={item.id} className="group">
              <div className="aspect-square relative overflow-hidden rounded-lg mb-3">
                <Image 
                  src={item.image?.url || '/placeholder.jpg'} 
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg font-medium text-navy-900">{item.name}</h3>
              <p className="text-navy-700">{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 