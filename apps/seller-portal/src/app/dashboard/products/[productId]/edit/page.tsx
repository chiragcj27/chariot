'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProductForm from '@/components/product-form/ProductForm';
import Link from 'next/link';

interface ProductFormData {
  name: string;
  description: string;
  type: 'physical' | 'digital' | 'service';
  categoryId?: string; // Made optional
  itemId?: string; // Made optional
  price?: {
    amount?: number;
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
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'rejected' | 'archived' | 'deleted';
  
  // Kit related fields
  isKitProduct?: boolean;
  kitId?: string;
  typeOfKit?: 'premium' | 'basic';
  
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
  
  // Images
  images: (string | { _id: string; url: string })[];
  previewFile?: { name: string; url: string; key: string } | null;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

        // Transform the product data to match the form structure
        const formData: ProductFormData = {
          name: data.product.name,
          description: data.product.description,
          type: data.product.type,
          categoryId: data.product.categoryId,
          itemId: data.product.itemId,
          price: data.product.price,
          creditsCost: data.product.creditsCost,
          discountedCreditsCost: data.product.discountedCreditsCost,
          discount: data.product.discount,
          theme: data.product.theme,
          season: data.product.season,
          occasion: data.product.occasion,
          tags: data.product.tags || [],
          featured: data.product.featured || false,
          status: data.product.status === 'rejected' ? 'draft' : data.product.status,
          stock: data.product.stock || 0,
          deliverables: data.product.deliverables || [],
          requirements: data.product.requirements || [],
          consultationRequired: data.product.consultationRequired || false,
          // Transform images from backend format to frontend format
          images: data.product.images ? data.product.images.map((img: unknown) => ({
            _id: (img as { _id: string })._id,
            url: (img as { url: string }).url
          })) : [],
          ...data.product
        };

        setProduct(formData);
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

  const handleSubmit = async (formData: ProductFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }

      // Check if the product was active or pending and inform about re-approval
      const wasActiveOrPending = product && (product.status === 'active' || product.status === 'pending');
      
      if (wasActiveOrPending) {
        setSuccess('Product updated successfully! It has been set to pending status and will require re-approval from admin.');
      } else {
        setSuccess('Product updated successfully!');
      }
      
      // Redirect to product detail page after a short delay
      setTimeout(() => {
        router.push(`/dashboard/products/${productId}`);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the product');
    } finally {
      setIsSaving(false);
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
        <Link href={`/dashboard/products/${productId}`}>
          <Button variant="outline">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Product
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
      <div>
        <Link href={`/dashboard/products/${productId}`}>
          <Button variant="outline" className="mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Product
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-2">
          Update your product information below. All fields marked with * are required.
        </p>
        
        {/* Notification for active/pending products that editing requires re-approval */}
        {(product.status === 'active' || product.status === 'pending') && (
          <Alert className="mt-4">
            <AlertDescription>
              <strong>Important:</strong> This product is currently {product.status}. After saving changes, it will be set to pending status and require re-approval from admin.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
} 