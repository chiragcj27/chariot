import React from 'react';
import { notFound } from 'next/navigation';
import { menuData } from '@/data/menuData';
import { mainCategories } from '@/data/categories';
import Image from 'next/image';
import Link from 'next/link';

interface ItemPageProps {
  params: {
    category: string;
    subcategory: string;
    item: string;
  };
}

// Mock product data - replace with your actual product data
const mockProducts = [
  {
    id: '1',
    name: 'Classic Design',
    price: '$299',
    image: 'https://images.pexels.com/photos/10017559/pexels-photo-10017559.jpeg',
    description: 'A timeless design that never goes out of style.',
    features: ['High-quality materials', 'Handcrafted', 'Lifetime warranty']
  },
  {
    id: '2',
    name: 'Modern Collection',
    price: '$399',
    image: 'https://images.pexels.com/photos/11656901/pexels-photo-11656901.jpeg',
    description: 'Contemporary design with modern aesthetics.',
    features: ['Premium finish', 'Unique design', 'Limited edition']
  },
  {
    id: '3',
    name: 'Premium Series',
    price: '$499',
    image: 'https://images.pexels.com/photos/12929510/pexels-photo-12929510.jpeg',
    description: 'Our highest quality collection with premium features.',
    features: ['Luxury materials', 'Exclusive design', 'Premium packaging']
  }
];

export default async function ItemPage({ params }: ItemPageProps) {
  const resolvedParams = await params;
  const category = mainCategories.find(cat => cat.id === resolvedParams.category);
  const categoryData = menuData[resolvedParams.category];
  
  if (!category || !categoryData) {
    notFound();
  }

  const subcategory = categoryData.subcategories.find(
    subcat => subcat.id === resolvedParams.subcategory
  );

  if (!subcategory) {
    notFound();
  }

  const item = subcategory.items.find(item => item.id === resolvedParams.item);

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
            <Link href={`/${resolvedParams.category}`} className="hover:text-navy-900">
              {category.name}
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href={`/${resolvedParams.category}/${resolvedParams.subcategory}`} className="hover:text-navy-900">
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
        {mockProducts.map((product) => (
          <div key={product.id} className="group">
            <div className="bg-navy-50 rounded-lg overflow-hidden">
              <div className="aspect-square relative">
                <Image 
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-medium text-navy-900 mb-2">{product.name}</h2>
                <p className="text-navy-700 mb-4">{product.description}</p>
                <p className="text-lg font-medium text-navy-900 mb-4">{product.price}</p>
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-navy-700">
                      <span className="w-1.5 h-1.5 bg-navy-900 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="w-full bg-navy-900 text-cream py-3 rounded-md hover:bg-navy-800 transition-colors">
                  Add to Cart
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
          {categoryData.featured.map((featuredItem) => (
            <Link 
              key={featuredItem.id}
              href={`/${resolvedParams.category}/${resolvedParams.subcategory}/${featuredItem.id}`}
              className="group"
            >
              <div className="bg-navy-50 rounded-lg overflow-hidden">
                <div className="aspect-square relative">
                  <Image 
                    src={featuredItem.image}
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