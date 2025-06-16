import React from 'react';
import { notFound } from 'next/navigation';
import { mainCategories } from '@/data/categories';
import Link from 'next/link';
import { menuService } from '@/services/menu.service';
import type { Category, SubCategory } from '@/services/menu.service';
import { ItemCard } from '@/components/ui/item-card';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface SubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const resolvedParams = await params;
  const { category: categorySlug, subcategory: subcategorySlug } = resolvedParams;
  
  const menuStructure = await menuService.getMenuStructure();
  const categoryData = menuStructure.categories.find(
    (cat: Category) => cat.slug.toLowerCase() === categorySlug.toLowerCase()
  );
  
  if (!categoryData) {
    notFound();
  }

  const subcategory = categoryData.subcategories.find(
    (subcat: SubCategory) => subcat.slug.toLowerCase() === subcategorySlug.toLowerCase()
  );

  if (!subcategory) {
    notFound();
  }

  const category = mainCategories.find(cat => cat.id === categoryData.slug) || categoryData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-navy-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: category.name, href: `/${categorySlug}` },
            { label: subcategory.name, href: `/${categorySlug}/${subcategorySlug}` }
          ]}
          className="mb-8"
        />

        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-navy-900 mb-4">
            {subcategory.name}
          </h1>
          <p className="text-navy-600 text-lg max-w-2xl mx-auto">
            Explore our curated collection of {subcategory.items.length} items in this category
          </p>
        </div>

        {/* Items Grid Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {subcategory.items.map((item) => (
              <ItemCard
                key={item.id}
                imageUrl={item.image?.url || '/placeholder.jpg'}
                title={item.name}
                description={item.description || ''}
                href={`/${categorySlug}/${subcategorySlug}/${item.slug}`}
              />
            ))}
          </div>
        </div>

        {/* Related Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-serif text-navy-900 mb-8 text-center">
            Related Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryData.subcategories
              .filter(subcat => subcat.slug !== subcategorySlug)
              .slice(0, 3)
              .map((relatedSubcat) => (
                <Link 
                  key={relatedSubcat.id}
                  href={`/${categorySlug}/${relatedSubcat.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl p-8 hover:bg-navy-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <h3 className="text-xl font-medium text-navy-900 mb-3">
                      {relatedSubcat.name}
                    </h3>
                    <p className="text-navy-600">
                      {relatedSubcat.items.length} items
                    </p>
                    <div className="mt-4 text-navy-500 group-hover:text-navy-900 transition-colors">
                      Explore Collection →
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 