'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Product {
  _id: string;
  name: string;
  description: string;
  categoryId: {
    _id: string;
    title: string;
  };
  subCategoryId: {
    _id: string;
    title: string;
  };
  itemId: {
    _id: string;
    title: string;
  };
  type: 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
  price: {
    amount: number;
    currency: string;
  };
  discount?: {
    percentage: number;
  };
  theme?: string;
  season?: string;
  occasion?: string;
  tags: string[];
  featured: boolean;
  status: 'active' | 'inactive' | 'draft' | 'archived' | 'deleted' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  images: Array<{
    _id: string;
    url: string;
    isMain: boolean;
  }>;
  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
  slug: string;
}

interface Category {
  _id: string;
  title: string;
  subcategories: {
    _id: string;
    title: string;
    products: Product[];
  }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/products');
        const data = await response.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  // Group products by category and subcategory
  const groupedProducts = products.reduce((acc: Record<string, Category>, product) => {
    const categoryId = product.categoryId._id;
    const categoryTitle = product.categoryId.title;
    const subcategoryId = product.subCategoryId._id;
    const subcategoryTitle = product.subCategoryId.title;

    if (!acc[categoryId]) {
      acc[categoryId] = {
        _id: categoryId,
        title: categoryTitle,
        subcategories: []
      };
    }

    const category = acc[categoryId];
    let subcategory = category.subcategories.find(sub => sub._id === subcategoryId);

    if (!subcategory) {
      subcategory = {
        _id: subcategoryId,
        title: subcategoryTitle,
        products: []
      };
      category.subcategories.push(subcategory);
    }

    subcategory.products.push(product);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A hierarchical view of all your products organized by categories and subcategories.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a
            href="/dashboard/products/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Product
          </a>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {Object.values(groupedProducts).map((category) => (
              <li key={category._id}>
                <button
                  onClick={() => toggleCategory(category._id)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-center">
                    {expandedCategories.has(category._id) ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="ml-2 text-lg font-medium text-gray-900">{category.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {category.subcategories.reduce((total, sub) => total + sub.products.length, 0)} products
                  </span>
                </button>

                {expandedCategories.has(category._id) && (
                  <ul className="divide-y divide-gray-200 bg-gray-50">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory._id}>
                        <button
                          onClick={() => toggleSubcategory(subcategory._id)}
                          className="w-full px-8 py-3 flex items-center justify-between hover:bg-gray-100 focus:outline-none"
                        >
                          <div className="flex items-center">
                            {expandedSubcategories.has(subcategory._id) ? (
                              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            )}
                            <span className="ml-2 text-md font-medium text-gray-900">{subcategory.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{subcategory.products.length} products</span>
                        </button>

                        {expandedSubcategories.has(subcategory._id) && (
                          <div className="px-12 py-4 bg-white">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="relative px-6 py-3">
                                      <span className="sr-only">Actions</span>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {subcategory.products.map((product) => (
                                    <tr key={product._id}>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          {product.images.find(img => img.isMain)?.url && (
                                            <div className="flex-shrink-0 h-10 w-10 relative">
                                              <Image
                                                className="rounded-full object-cover"
                                                src={product.images.find(img => img.isMain)?.url || ''}
                                                alt={product.name}
                                                fill
                                                sizes="40px"
                                              />
                                            </div>
                                          )}
                                          <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            <div className="text-sm text-gray-500">{product.itemId.title}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.type}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.price.currency} {product.price.amount.toFixed(2)}
                                        {product.discount && (
                                          <span className="ml-2 text-xs text-red-600">
                                            -{product.discount.percentage}%
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                            product.status === 'active'
                                              ? 'bg-green-100 text-green-800'
                                              : product.status === 'inactive'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}
                                        >
                                          {product.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                          type="button"
                                          className="text-indigo-600 hover:text-indigo-900"
                                        >
                                          Edit
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 