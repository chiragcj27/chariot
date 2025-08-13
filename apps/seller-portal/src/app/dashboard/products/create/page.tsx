'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import ProductForm from '@/components/product-form/ProductForm';

// Type definitions for kit components
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

  const uploadKitImages = async (kitImages: KitImage[], productId: string) => {
    const imageIds: string[] = [];
    
    for (let i = 0; i < kitImages.length; i++) {
      const kitImage = kitImages[i];
      
      // Skip if it's already an ObjectId (not a blob URL)
      if (!kitImage.url.startsWith('blob:')) {
        imageIds.push(kitImage._id || kitImage.url);
        continue;
      }

      try {
        // Get the file from the blob URL
        const response = await fetch(kitImage.url);
        const blob = await response.blob();
        const file = new File([blob], kitImage.filename || `kit-image-${i}.${blob.type.split('/')[1]}`, { type: blob.type });

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
            folder: 'kit-images',
          }),
        });

        if (!uploadUrlResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, url, key } = await uploadUrlResponse.json();

        // Upload to S3
        await uploadImageToS3(file, uploadUrl);

        // Store kit image metadata to get ObjectId (create in Image collection)
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
            isMain: false,
            isThumbnail: false,
            status: 'uploaded',
            imageType: 'kitProduct' // Mark as kit product image
          }),
        });

        if (!imageResponse.ok) {
          throw new Error('Failed to store kit image metadata');
        }

        const { image } = await imageResponse.json();
        imageIds.push(image._id);
      } catch (error) {
        console.error('Error uploading kit image:', error);
        // Continue with other images
      }
    }
    
    return imageIds;
  };

  const uploadKitFiles = async (kitFiles: KitFile[], productId: string) => {
    const fileIds: string[] = [];
    
    for (let i = 0; i < kitFiles.length; i++) {
      const kitFile = kitFiles[i];
      
      // If it's already uploaded to S3, create database record
      if (!kitFile.url.startsWith('blob:')) {
        try {
          // Create database record for already uploaded file
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

          if (!fileResponse.ok) {
            throw new Error('Failed to store kit preview file metadata');
          }

          const { file: savedFile } = await fileResponse.json();
          fileIds.push(savedFile._id);
        } catch (error) {
          console.error('Error creating database record for kit preview file:', error);
          // Continue with other files
        }
        continue;
      }

      try {
        // Get the file from the blob URL
        const response = await fetch(kitFile.url);
        const blob = await response.blob();
        const file = new File([blob], kitFile.originalname || `kit-file-${i}`, { type: kitFile.mimetype });

        // Get upload URL from backend (public bucket for preview files)
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

        if (!uploadUrlResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, url, key } = await uploadUrlResponse.json();

        // Upload to S3
        await uploadImageToS3(file, uploadUrl);

        // Store file metadata to get ObjectId
        const fileResponse = await fetch('/api/files/kit-preview-files', {
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
            fileType: kitFile.fileType,
            productId: productId,
            pageCount: kitFile.pageCount,
            documentType: kitFile.documentType,
            isPreview: true,
            status: 'uploaded',
          }),
        });

        if (!fileResponse.ok) {
          throw new Error('Failed to store kit preview file metadata');
        }

        const { file: savedFile } = await fileResponse.json();
        fileIds.push(savedFile._id);
      } catch (error) {
        console.error('Error uploading kit preview file:', error);
        // Continue with other files
      }
    }
    
    return fileIds;
  };

  const uploadKitMainFile = async (kitMainFile: KitMainFile, productId: string) => {
    try {
      // If it's already uploaded to S3, create database record
      if (!kitMainFile.url.startsWith('blob:')) {
        try {
          // Create database record for already uploaded file
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

          if (!fileResponse.ok) {
            throw new Error('Failed to store kit main file metadata');
          }

          return kitMainFile.key;
        } catch (error) {
          console.error('Error creating database record for kit main file:', error);
          throw error;
        }
      }

      // Get the file from the blob URL
      const response = await fetch(kitMainFile.url);
      const blob = await response.blob();
      const file = new File([blob], kitMainFile.name, { type: 'application/zip' });

      // Get upload URL from backend (private bucket for main file)
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

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, url, key } = await uploadUrlResponse.json();

      // Upload to S3
      await uploadImageToS3(file, uploadUrl);

      // Store file metadata to get ObjectId
      const fileResponse = await fetch('/api/files/kit-main-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          filename: key.split('/').pop(),
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

      if (!fileResponse.ok) {
        throw new Error('Failed to store kit main file metadata');
      }

      return key;
    } catch (error) {
      console.error('Error uploading kit main file:', error);
      throw error;
    }
  };

  const handleSubmit = async (formData: ProductFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Clean the form data before sending
      const cleanedFormData = { ...formData, images: [] };
      
      // For kit products, remove categoryId and itemId
      if (cleanedFormData.isKitProduct) {
        delete cleanedFormData.categoryId;
        delete cleanedFormData.itemId;
      } else {
        // For non-kit products, remove empty categoryId and itemId
        if (!cleanedFormData.categoryId || cleanedFormData.categoryId === '') {
          delete cleanedFormData.categoryId;
        }
        if (!cleanedFormData.itemId || cleanedFormData.itemId === '') {
          delete cleanedFormData.itemId;
        }
        // Remove empty kitId for non-kit products
        if (!cleanedFormData.kitId || cleanedFormData.kitId === '') {
          delete cleanedFormData.kitId;
        }
      }
      
      // For digital products, ensure zipFile data is included
      if (cleanedFormData.type === 'digital' && cleanedFormData.zipFile) {
        // Keep the zipFile data as is - it contains the key needed for deletion
      }
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(cleanedFormData),
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

      // Upload kit images if any
      if (formData.isKitProduct && formData.kitImages && formData.kitImages.length > 0) {
        try {
          await uploadKitImages(formData.kitImages, data.product._id);
        } catch (kitImageError) {
          console.error('Error uploading kit images:', kitImageError);
          // Don't fail the entire process if kit images fail
        }
      }

      // Upload kit files if any
      if (formData.isKitProduct && formData.kitFiles && formData.kitFiles.length > 0) {
        try {
          await uploadKitFiles(formData.kitFiles, data.product._id);
        } catch (kitFileError) {
          console.error('Error uploading kit files:', kitFileError);
          // Don't fail the entire process if kit files fail
        }
      }

      // Upload kit main file if any
      if (formData.isKitProduct && formData.kitMainFile) {
        try {
          await uploadKitMainFile(formData.kitMainFile, data.product._id);
        } catch (kitMainFileError) {
          console.error('Error uploading kit main file:', kitMainFileError);
          // Don't fail the entire process if kit main file fails
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