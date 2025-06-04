import React from 'react';
import { notFound } from 'next/navigation';
import { mainCategories } from '@/data/categories';
import Image from 'next/image';
import Link from 'next/link';
import { menuService } from '@/services/menu.service';
import type { MenuItem, SubCategory, Category } from '@/services/menu.service';

interface ItemPageProps {
  params: {
    category: string;
    subcategory: string;
    item: string;
  };
}

export default async function ItemPage({ params }: ItemPageProps) {
  const { category: categorySlug, subcategory: subcategorySlug, item: itemSlug } = params;
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

  const subcategory = categoryData.subcategories.find(
    (subcat: SubCategory) => subcat.slug === subcategorySlug
  );

  if (!subcategory) {
    notFound();
  }

  const item = subcategory.items.find((item: MenuItem) => item.slug === itemSlug);

  if (!item) {
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
            <Link href={`/${categorySlug}`} className="hover:text-navy-900">
              {category.name}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${categorySlug}/${subcategorySlug}`} className="hover:text-navy-900">
              {subcategory.name}
            </Link>
          </li>
          <li>/</li>
          <li className="text-navy-900">{item.name}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-serif text-navy-900 mb-8">{item.name}</h1>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subcategory.items.map((product) => (
          <div key={product.id} className="group">
            <div className="bg-navy-50 rounded-lg overflow-hidden">
              <div className="aspect-square relative">
                <Image 
                  src={product.image?.url || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-medium text-navy-900 mb-2">{product.name}</h2>
                <p className="text-navy-700 mb-4">View product details and specifications</p>
                <button className="w-full bg-navy-900 text-cream py-3 rounded-md hover:bg-navy-800 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Related Items */}
      <div className="mt-12">
        <h2 className="text-2xl font-serif text-navy-900 mb-6">Related Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryData.featuredItems?.map((featuredItem) => (
            <Link 
              key={featuredItem.id}
              href={`/${categorySlug}/${subcategorySlug}/${featuredItem.slug}`}
              className="group"
            >
              <div className="bg-navy-50 rounded-lg overflow-hidden">
                <div className="aspect-square relative">
                  <Image 
                    src={featuredItem.image?.url || '/placeholder.jpg'}
                    alt={featuredItem.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-navy-900">{featuredItem.name}</h3>
                  <p className="text-navy-700">{featuredItem.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 