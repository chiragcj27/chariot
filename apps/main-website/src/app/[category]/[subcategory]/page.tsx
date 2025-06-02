import React from 'react';
import { notFound } from 'next/navigation';
import { menuData } from '@/data/menuData';
import { mainCategories } from '@/data/categories';
import Image from 'next/image';
import Link from 'next/link';

interface SubcategoryPageProps {
  params: {
    category: string;
    subcategory: string;
  };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { category: categoryId, subcategory: subcategoryId } = await params;
  const category = mainCategories.find(cat => cat.id === categoryId);
  const categoryData = menuData[categoryId];
  
  if (!category || !categoryData) {
    notFound();
  }

  const subcategory = categoryData.subcategories.find(
    subcat => subcat.id === subcategoryId
  );

  if (!subcategory) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-navy-600 mb-8">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-navy-900">Home</Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${categoryId}`} className="hover:text-navy-900">
              {category.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-navy-900">{subcategory.name}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-serif text-navy-900 mb-8">{subcategory.name}</h1>

      {/* L3 Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {subcategory.items.map((item) => (
          <Link 
            key={item.id}
            href={`/${categoryId}/${subcategoryId}/${item.id}`}
            className="group"
          >
            <div className="bg-navy-50 rounded-lg p-6 hover:bg-navy-100 transition-colors">
              <h2 className="text-xl font-medium text-navy-900 mb-4">{item.name}</h2>
              <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                <Image 
                  src={categoryData.featured[0].image} // Using featured image as placeholder
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-navy-700">View Products →</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Related Categories */}
      <div className="mt-12">
        <h2 className="text-2xl font-serif text-navy-900 mb-6">Related Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryData.subcategories
            .filter(subcat => subcat.id !== subcategoryId)
            .slice(0, 3)
            .map((relatedSubcat) => (
              <Link 
                key={relatedSubcat.id}
                href={`/${categoryId}/${relatedSubcat.id}`}
                className="group"
              >
                <div className="bg-navy-50 rounded-lg p-6 hover:bg-navy-100 transition-colors">
                  <h3 className="text-lg font-medium text-navy-900">{relatedSubcat.name}</h3>
                  <p className="text-navy-700 mt-2">
                    {relatedSubcat.items.length} items
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
} 