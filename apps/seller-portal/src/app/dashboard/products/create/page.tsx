'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import ProductForm from '@/components/product-form/ProductForm';

interface ProductFormData {
  name: string;
  description: string;
  type: 'physical' | 'digital' | 'service';
  categoryId: string;
  itemId: string;
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
}

export default function CreateProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const uploadImageToS3 = async (file: File, uploadUrl: string) => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload to S3');
    }
  };

  const uploadImages = async (imageUrls: string[], productId: string) => {
    const imageIds: string[] = [];
    
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      
      // Skip if it's already an ObjectId (not a blob URL)
      if (!imageUrl.startsWith('blob:')) {
        imageIds.push(imageUrl);
        continue;
      }

      try {
        // Get the file from the blob URL
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `image-${i}.${blob.type.split('/')[1]}`, { type: blob.type });

        // Get upload URL from backend
        const uploadUrlResponse = await fetch('/api/assets/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            folder: 'products',
          }),
        });

        if (!uploadUrlResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, url, key } = await uploadUrlResponse.json();

        // Upload to S3
        await uploadImageToS3(file, uploadUrl);

        // Store image metadata to get ObjectId
        const imageResponse = await fetch('/api/products/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            filename: key.split('/').pop(),
            originalname: file.name,
            url: url,
            size: file.size,
            mimetype: file.type,
            productId: productId,
            isMain: i === 0, // First image is main
            isThumbnail: false,
            status: 'uploaded',
          }),
        });

        if (!imageResponse.ok) {
          throw new Error('Failed to store image metadata');
        }

        const { image } = await imageResponse.json();
        imageIds.push(image._id);
      } catch (error) {
        console.error('Error uploading image:', error);
        // Continue with other images
      }
    }
    
    return imageIds;
  };

  const handleSubmit = async (formData: ProductFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create product without images first
      const productDataWithoutImages = { ...formData, images: [] };
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productDataWithoutImages),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      // Upload images if any
      if (formData.images && formData.images.length > 0) {
        try {
          const imageUrls = formData.images
            .filter((img): img is string => typeof img === 'string');
          await uploadImages(imageUrls, data.product._id);
        } catch (imageError) {
          console.error('Error uploading images:', imageError);
          // Don't fail the entire process if images fail
        }
      }

      setSuccess('Product created successfully!');
      
      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push('/dashboard/products');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create New Product</h1>
        <p className="text-gray-600 mt-2">
          Fill out the form below to create a new product. All fields marked with * are required.
        </p>
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
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
} 