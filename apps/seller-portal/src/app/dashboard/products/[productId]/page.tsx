'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import Image from 'next/image';

interface ProductImage {
  _id: string;
  url: string;
  alt?: string;
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
  theme?: string;
  season?: string;
  occasion?: string;
  tags: string[];
  featured: boolean;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
  isAdminApproved: boolean;
  isAdminRejected: boolean;
  adminRejectionReason?: string;
  
  // Physical product specific
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  stock: number;
  
  // Digital product specific
  kind?: string;
  assetDetails?: {
    file: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  };
  previewFile?: {
    name: string;
    url: string;
    key: string;
  };
  
  // Service product specific
  deliveryTime?: {
    min: number;
    max: number;
    unit: string;
  };
  revisions?: {
    allowed: number;
    cost: number;
    unit: string;
  };
  deliverables: string[];
  requirements: string[];
  consultationRequired: boolean;
  
  // SEO
  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.productId as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch product');
        }

        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleDelete = async () => {
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

      router.push('/dashboard/products');
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'physical':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Physical</Badge>;
      case 'digital':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Digital</Badge>;
      case 'service':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Service</Badge>;
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

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/dashboard/products">
          <Button variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>Product not found</AlertDescription>
        </Alert>
        <Link href="/dashboard/products">
          <Button variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/dashboard/products">
            <Button variant="outline" className="mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            {getTypeBadge(product.type)}
            {getStatusBadge(product.status, product.isAdminApproved, product.isAdminRejected)}
            {product.featured && <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Featured</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/products/${product._id}/edit`}>
            <Button variant="outline" className="flex items-center gap-1">
              <PencilIcon className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex items-center gap-1 text-red-600 hover:text-red-700"
            onClick={handleDelete}
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {product.isAdminRejected && product.adminRejectionReason && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Rejection Reason:</strong> {product.adminRejectionReason}
          </AlertDescription>
        </Alert>
      )}

      {/* Notification for active/pending products that editing requires re-approval */}
      {(product.status === 'active' || product.status === 'pending') && (
        <Alert>
          <AlertDescription>
            <strong>Note:</strong> Editing this product will require re-approval from admin. The product will be set to pending status after saving changes.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {product.images && product.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.images.map((image: ProductImage, index: number) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={image.url}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={300}
                        height={300}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </CardContent>
          </Card>

          {/* Product Type Specific Details */}
          {product.type === 'physical' && (
            <Card>
              <CardHeader>
                <CardTitle>Physical Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stock Quantity</label>
                    <p className="text-lg font-semibold">{product.stock}</p>
                  </div>
                </div>
                {product.dimensions && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dimensions</label>
                    <p className="text-lg">
                      {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} {product.dimensions.unit}
                    </p>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Weight</label>
                    <p className="text-lg">{product.weight.value} {product.weight.unit}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {product.type === 'digital' && (
            <Card>
              <CardHeader>
                <CardTitle>Digital Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.kind && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Product Kind</label>
                    <p className="text-lg font-semibold capitalize">{product.kind}</p>
                  </div>
                )}
                {product.assetDetails && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">File Type</label>
                      <p className="text-lg">{product.assetDetails.fileType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">File Size</label>
                      <p className="text-lg">{product.assetDetails.fileSize} MB</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {product.type === 'service' && (
            <Card>
              <CardHeader>
                <CardTitle>Service Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.deliveryTime && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivery Time</label>
                    <p className="text-lg">
                      {product.deliveryTime.min} - {product.deliveryTime.max} {product.deliveryTime.unit}
                    </p>
                  </div>
                )}
                {product.revisions && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Revisions</label>
                    <p className="text-lg">
                      {product.revisions.allowed} revisions included, additional at ${product.revisions.cost} {product.revisions.unit}
                    </p>
                  </div>
                )}
                {product.deliverables && product.deliverables.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Deliverables</label>
                    <ul className="list-disc list-inside space-y-1">
                      {product.deliverables.map((deliverable, index) => (
                        <li key={index} className="text-lg">{deliverable}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.requirements && product.requirements.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Requirements</label>
                    <ul className="list-disc list-inside space-y-1">
                      {product.requirements.map((requirement, index) => (
                        <li key={index} className="text-lg">{requirement}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Consultation Required</label>
                  <p className="text-lg">{product.consultationRequired ? 'Yes' : 'No'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Information */}
          {product.seo && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.seo.metaTitle && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Meta Title</label>
                    <p className="text-lg">{product.seo.metaTitle}</p>
                  </div>
                )}
                {product.seo.metaDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Meta Description</label>
                    <p className="text-lg">{product.seo.metaDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Information */}
              {product.price && product.price.amount > 0 ? (
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-2xl font-bold text-gray-900">
                    ${product.price.amount} {product.price.currency}
                  </p>
                  {product.discount && product.discount.percentage > 0 && (
                    <p className="text-sm text-green-600">
                      {product.discount.percentage}% discount available
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-sm text-gray-500">No price set</p>
                </div>
              )}

              {/* Credits Information */}
              {product.creditsCost && product.creditsCost > 0 ? (
                <div>
                  <label className="text-sm font-medium text-gray-500">Credits Cost</label>
                  <p className="text-lg font-semibold">{product.creditsCost} credits</p>
                  {product.discountedCreditsCost && product.discountedCreditsCost > 0 && (
                    <p className="text-sm text-green-600">
                      Discounted: {product.discountedCreditsCost} credits
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-500">Credits Cost</label>
                  <p className="text-sm text-gray-500">No credits set</p>
                </div>
              )}

              {/* Pricing Type Summary */}
              <div className="pt-2 border-t">
                <label className="text-sm font-medium text-gray-500">Pricing Type</label>
                <p className="text-sm text-gray-700">
                  {product.price && product.price.amount > 0 && product.creditsCost && product.creditsCost > 0
                    ? 'Price + Credits'
                    : product.price && product.price.amount > 0
                    ? 'Price Only'
                    : product.creditsCost && product.creditsCost > 0
                    ? 'Credits Only'
                    : 'No pricing set'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.theme && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Theme</label>
                  <p className="text-lg">{product.theme}</p>
                </div>
              )}
              {product.season && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Season</label>
                  <p className="text-lg">{product.season}</p>
                </div>
              )}
              {product.occasion && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Occasion</label>
                  <p className="text-lg">{product.occasion}</p>
                </div>
              )}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="text-lg">{new Date(product.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p className="text-lg">{new Date(product.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 