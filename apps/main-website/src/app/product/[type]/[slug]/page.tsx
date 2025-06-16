import React from 'react';
import { notFound } from 'next/navigation';
import { productService } from '@/services/product.service';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ProductType } from '@/types/product';
import PhysicalProductLayout from '@/components/product-layouts/PhysicalProductLayout';
import DigitalProductLayout from '@/components/product-layouts/DigitalProductLayout';
import ServiceProductLayout from '@/components/product-layouts/ServiceProductLayout';

interface ProductPageProps {
  params: Promise<{
    type: ProductType;
    slug: string;
  }>;
}

export const revalidate = 3600; // Revalidate every hour

async function ProductPage({ params }: ProductPageProps) {
  const { type, slug } = await params;

  try {
    const product = await productService.getProductBySlug(slug);

    // Verify that the product type matches the URL
    if (product.type !== type) {
      return notFound();
    }

    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: product.name, href: `/product/${type}/${slug}` },
    ];

    // Render different layouts based on product type
    const renderProductLayout = () => {
      switch (type) {
        case 'physical':
          return <PhysicalProductLayout product={product} />;
        case 'digital':
          return <DigitalProductLayout product={product} />;
        case 'service':
          return <ServiceProductLayout product={product} />;
        default:
          return notFound();
      }
    };

    return (
      <div className="container mx-auto px-4 py-8 ">
        <Breadcrumb className="dark:text-cream" items={breadcrumbItems} />
        {renderProductLayout()}
      </div>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return notFound();
  }
}

export default ProductPage; 