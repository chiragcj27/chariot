import React from 'react';
import { notFound } from 'next/navigation';
import { productService } from '@/services/product.service';
import ProductCard from '@/components/ProductCard';
import { Breadcrumb } from '@/components/ui/breadcrumb';

interface ItemPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    item: string;
  }>;
}

export const revalidate = 3600; // Revalidate every hour

async function ItemPage({ params }: ItemPageProps) {
  const { category, subcategory, item } = await params;
  console.log(category, subcategory, item);
  try {
    const { products, total, hasMore } = await productService.getProductsByItem(item);

    if (!products.length) {
      return notFound();
    }

    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: category, href: `/${category}` },
      { label: subcategory, href: `/${category}/${subcategory}` },
      { label: item, href: `/${category}/${subcategory}/${item}` },
    ];

    return (
      <div className="container mx-auto px-4">
        <div className="py-8">
          <Breadcrumb items={breadcrumbItems} />  
          
          <div className="mt-8">
            <h1 className="text-3xl font-bold mb-2 capitalize">
              {item}
            </h1>
            <p className="text-gray-600 mb-8">
              {total} products found
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id.toString()}
                  product={product}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button 
                  className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    // TODO: Implement pagination
                  }}
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return notFound();
  }
}

export default ItemPage;
