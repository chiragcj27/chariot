'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProductForm from '@/components/product-form/ProductForm';
import Link from 'next/link';

interface KitImage {
  _id?: string;
  url: string;
  filename?: string;
  originalname?: string;
  size?: number;
  mimetype?: string;
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

interface KitMainFile {
  name: string;
  url: string;
  key: string;
  size: number;
}

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
  kitDescription?: string;
  kitInstructions?: string;
  kitContents?: string[];
  kitImages?: KitImage[];
  kitFiles?: KitFile[];
  kitMainFile?: KitMainFile | null;
  
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
  zipFile?: {
    name: string;
    url: string;
    key: string;
    size: number;
  } | null;
  
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
          // SEO
          seo: data.product.seo || { metaTitle: '', metaDescription: '', metaKeywords: [] },
          stock: data.product.stock || 0,
          deliverables: data.product.deliverables || [],
          requirements: data.product.requirements || [],
          consultationRequired: data.product.consultationRequired || false,
          // Transform images from backend format to frontend format
          images: data.product.images ? data.product.images.map((img: { _id: string; url: string }) => ({
            _id: img._id,
            url: img.url
          })) : [],
          // Kit-specific fields (populated from backend)
          isKitProduct: data.product.isKitProduct,
          kitId: data.product.kitId,
          typeOfKit: data.product.typeOfKit,
          kitDescription: data.product.kitDescription || '',
          kitInstructions: data.product.kitInstructions || '',
          kitContents: data.product.kitContents || [],
          kitImages: data.product.kitImages ? data.product.kitImages.map((img: KitImage & { filename?: string; originalname?: string; size?: number; mimetype?: string }) => ({
            _id: img._id,
            url: img.url,
            filename: img.filename,
            originalname: img.originalname,
            size: img.size,
            mimetype: img.mimetype
          })) : [],
          kitFiles: data.product.kitFiles || [],
          kitMainFile: data.product.kitMainFile || null,
          previewFile: data.product.previewFile || null,
          zipFile: data.product.zipFile || null,
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
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      if (!imageUrl.startsWith('blob:')) continue;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `image-${i}.${blob.type.split('/')[1]}`, { type: blob.type });

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
      if (!uploadUrlResponse.ok) throw new Error('Failed to get upload URL');

      const { uploadUrl, url, key } = await uploadUrlResponse.json();
      await uploadImageToS3(file, uploadUrl);

      const imageResponse = await fetch('/api/products/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          filename: key,
          originalname: file.name,
          url: url,
          size: file.size,
          mimetype: file.type,
          productId: productId,
          isMain: i === 0,
          isThumbnail: false,
          status: 'uploaded',
        }),
      });
      if (!imageResponse.ok) throw new Error('Failed to store image metadata');
    }
  };

  const uploadKitImages = async (kitImages: KitImage[], productId: string) => {
    for (let i = 0; i < kitImages.length; i++) {
      const kitImage = kitImages[i];
      if (!kitImage.url.startsWith('blob:')) continue;

      const response = await fetch(kitImage.url);
      const blob = await response.blob();
      const file = new File([blob], kitImage.filename || `kit-image-${i}.${blob.type.split('/')[1]}`, { type: blob.type });

      const uploadUrlResponse = await fetch('/api/assets/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: 'kit-images',
        }),
      });
      if (!uploadUrlResponse.ok) throw new Error('Failed to get upload URL');

      const { uploadUrl, url, key } = await uploadUrlResponse.json();
      await uploadImageToS3(file, uploadUrl);

      const imageResponse = await fetch('/api/products/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          filename: key,
          originalname: file.name,
          url: url,
          size: file.size,
          mimetype: file.type,
          productId: productId,
          isMain: false,
          isThumbnail: false,
          status: 'uploaded',
          imageType: 'kitProduct'
        }),
      });
      if (!imageResponse.ok) throw new Error('Failed to store kit image metadata');
    }
  };

  const uploadKitFiles = async (kitFiles: KitFile[], productId: string) => {
    for (let i = 0; i < kitFiles.length; i++) {
      const kitFile = kitFiles[i];
      if (!kitFile.url.startsWith('blob:')) {
        // Create DB record if not already
        const fileResponse = await fetch('/api/files/kit-preview-files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            filename: kitFile.filename,
            originalname: kitFile.originalname,
            url: kitFile.url,
            size: kitFile.size,
            mimetype: kitFile.mimetype,
            fileType: kitFile.fileType,
            productId: productId,
            pageCount: kitFile.pageCount,
            documentType: kitFile.documentType,
            isPreview: true,
            status: 'uploaded',
          }),
        });
        if (!fileResponse.ok) throw new Error('Failed to store kit preview file metadata');
        continue;
      }

      const response = await fetch(kitFile.url);
      const blob = await response.blob();
      const file = new File([blob], kitFile.originalname || `kit-file-${i}`, { type: kitFile.mimetype });

      const uploadUrlResponse = await fetch('/api/assets/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: 'kit-preview-files',
        }),
      });
      if (!uploadUrlResponse.ok) throw new Error('Failed to get upload URL');

      const { uploadUrl, url, key } = await uploadUrlResponse.json();
      await uploadImageToS3(file, uploadUrl);

      const fileResponse = await fetch('/api/files/kit-preview-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          filename: key,
          originalname: file.name,
          url: url,
          size: file.size,
          mimetype: file.type,
          fileType: kitFile.fileType,
          productId: productId,
          pageCount: kitFile.pageCount,
          documentType: kitFile.documentType,
          isPreview: true,
          status: 'uploaded',
        }),
      });
      if (!fileResponse.ok) throw new Error('Failed to store kit preview file metadata');
    }
  };

  const uploadKitMainFile = async (kitMainFile: KitMainFile, productId: string) => {
    if (!kitMainFile) return;

    if (!kitMainFile.url.startsWith('blob:')) {
      const fileResponse = await fetch('/api/files/kit-main-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          filename: kitMainFile.name,
          originalname: kitMainFile.name,
          url: kitMainFile.url,
          key: kitMainFile.key,
          size: kitMainFile.size,
          mimetype: 'application/zip',
          fileType: 'zip',
          productId: productId,
          containsFiles: 0,
          isPreview: false,
          status: 'uploaded',
        }),
      });
      if (!fileResponse.ok) throw new Error('Failed to store kit main file metadata');
      return;
    }

    const response = await fetch(kitMainFile.url);
    const blob = await response.blob();
    const file = new File([blob], kitMainFile.name, { type: 'application/zip' });

    const uploadUrlResponse = await fetch('/api/assets/upload-zip-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        folder: 'kit-main-files',
      }),
    });
    if (!uploadUrlResponse.ok) throw new Error('Failed to get upload URL');

    const { uploadUrl, url, key } = await uploadUrlResponse.json();
    await uploadImageToS3(file, uploadUrl);

    const fileResponse = await fetch('/api/files/kit-main-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        filename: key,
        originalname: file.name,
        url: url,
        key: key,
        size: file.size,
        mimetype: file.type,
        fileType: 'zip',
        productId: productId,
        containsFiles: 0,
        isPreview: false,
        status: 'uploaded',
      }),
    });
    if (!fileResponse.ok) throw new Error('Failed to store kit main file metadata');
  };

  const handleSubmit = async (formData: ProductFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Update core fields first
      const response = await fetch(`/api/products/${productId}`, {
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

      // Upload newly added product images (blob URLs only)
      const imageUrls = formData.images
        .filter((img): img is string => typeof img === 'string');
      if (imageUrls.length > 0) {
        await uploadImages(imageUrls, productId);
      }

      // Upload newly added kit images
      if (formData.isKitProduct && formData.kitImages && formData.kitImages.length > 0) {
        const newKitImages = formData.kitImages.filter(img => img.url.startsWith('blob:'));
        if (newKitImages.length > 0) {
          await uploadKitImages(newKitImages, productId);
        }
      }

      // Upload newly added kit preview files
      if (formData.isKitProduct && formData.kitFiles && formData.kitFiles.length > 0) {
        const newKitFiles = formData.kitFiles.filter(file => file.url.startsWith('blob:'));
        if (newKitFiles.length > 0) {
          await uploadKitFiles(newKitFiles as KitFile[], productId);
        }
      }

      // Upload or set kit main file
      if (formData.isKitProduct && formData.kitMainFile) {
        const isNewMain = formData.kitMainFile.url.startsWith('blob:');
        if (isNewMain) {
          await uploadKitMainFile(formData.kitMainFile, productId);
        }
      }

      // Success messaging
      const wasActiveOrPending = product && (product.status === 'active' || product.status === 'pending');
      if (wasActiveOrPending) {
        setSuccess('Product updated successfully! It has been set to pending status and will require re-approval from admin.');
      } else {
        setSuccess('Product updated successfully!');
      }

      setTimeout(() => {
        router.push(`/dashboard/products/${productId}`);
      }, 2000);
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