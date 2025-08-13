'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ProductImage {
  _id: string;
  url: string;
  alt?: string;
}

interface KitImage {
  _id: string;
  url: string;
  alt?: string;
}

interface KitFile {
  _id?: string;
  filename: string;
  originalname: string;
  url: string;
  size: number;
  mimetype: string;
  fileType: 'pdf' | 'document' | 'zip';
  pageCount?: number;
  documentType?: string;
  containsFiles?: number;
  isPreview?: boolean;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  type: 'physical' | 'digital' | 'service';
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'rejected';
  price?: {
    amount: number;
    currency: string;
  };
  creditsCost?: number;
  discountedCreditsCost?: number;
  discount?: {
    percentage: number;
  };
  images: ProductImage[];
  // Kit-related fields
  isKitProduct?: boolean;
  kitId?: string;
  typeOfKit?: 'premium' | 'basic';
  kitImages?: KitImage[];
  kitFiles?: KitFile[];
  kitMainFile?: {
    name: string;
    url: string;
    key: string;
    size: number;
  };
  createdAt: string;
  isAdminApproved: boolean;
  isAdminRejected: boolean;
  adminRejectionReason?: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Add Pagination type
interface Pagination {
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  currentPage: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/products?${params}`, {
        credentials: 'include'
      });
      const data: ProductsResponse = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete product');
      }

      // Refresh the products list
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const getStatusBadge = (status: string, isApproved: boolean, isRejected: boolean) => {
    if (isRejected) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string, isKitProduct?: boolean) => {
    if (isKitProduct) {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700">Kit Product</Badge>;
    }
    
    switch (type) {
      case 'physical':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Physical</Badge>;
      case 'digital':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Digital</Badge>;
      case 'service':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">Service</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <Link href="/dashboard/products/create">
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {product.isKitProduct && product.kitImages && product.kitImages.length > 0 ? (
                <Image
                  src={product.kitImages[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  width={400}
                  height={225}
                />
              ) : product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  width={400}
                  height={225}
                />
              ) : (
                <div className="text-gray-400 text-sm">No image</div>
              )}
            </div>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                <div className="flex gap-1">
                  {getTypeBadge(product.type, product.isKitProduct)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(product.status, product.isAdminApproved, product.isAdminRejected)}
                <div className="flex flex-col text-xs">
                  {product.price && product.price.amount > 0 && (
                    <span className="font-medium text-gray-900">
                      ${product.price.amount} {product.price.currency}
                    </span>
                  )}
                  {product.creditsCost && product.creditsCost > 0 && (
                    <span className="text-gray-600">
                      {product.creditsCost} credits
                    </span>
                  )}
                  {!product.price?.amount && !product.creditsCost && (
                    <span className="text-gray-500">No pricing</span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {product.description}
              </p>
              
              {product.isAdminRejected && product.adminRejectionReason && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription className="text-xs">
                    <strong>Rejection Reason:</strong> {product.adminRejectionReason}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Link href={`/dashboard/products/${product._id}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <EyeIcon className="h-3 w-3" />
                    View
                  </Button>
                </Link>
                <Link href={`/dashboard/products/${product._id}/edit`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <PencilIcon className="h-3 w-3" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(product._id)}
                >
                  <TrashIcon className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <PlusIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first product</p>
            <Link href="/dashboard/products/create">
              <Button>Create Product</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 