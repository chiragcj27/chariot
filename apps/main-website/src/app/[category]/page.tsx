import React from 'react';
import { notFound } from 'next/navigation';
import { menuService } from '@/services/menu.service';
import type { Category } from '@/services/menu.service';
import { HoverEffect } from '@/components/ui/card-hover-effect';
import { BoxReveal } from '@/components/magicui/box-reveal';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { AuroraBackground } from '@/components/ui/aurora-background';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = params;
  const menuStructure = await menuService.getMenuStructure();
  const categoryData = menuStructure.categories.find(
    (cat: Category) => cat.slug === categorySlug
  );

  if (!categoryData) {
    notFound();
  }

  return (
    <AuroraBackground className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <BoxReveal>
            <h1 className="text-5xl font-serif text-navy-600 dark:text-blue-100 mb-4">{categoryData.name}</h1>
          </BoxReveal>
        </div>
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb className="dark:text-cream"
            items={[
              {
                label: categoryData.name,
                href: `/${categorySlug}`
              }
            ]}
          />
        </div>
        
        {/* Separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-200 dark:via-orange-700 to-transparent" />
        
        {/* Subcategories Grid */}
        <HoverEffect
          items={categoryData.subcategories.map((subcat) => ({
            title: subcat.name,
            description: subcat.items.slice(0, 4).map(item => `• ${item.name}`).join('\n') + 
              (subcat.items.length > 4 ? `\n+${subcat.items.length - 4} more items` : ''),
            link: `/${categorySlug}/${subcat.slug}`
          }))}
        />
      </div>
    </AuroraBackground>
  );
} 