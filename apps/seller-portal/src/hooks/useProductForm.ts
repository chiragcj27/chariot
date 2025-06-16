import { useState } from 'react';
import { ImageFile } from '@/types/image';
import { ProductFormData } from '@/types/products/create/product.types';

export const useProductForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = async (formData: ProductFormData, selectedImages: ImageFile[]) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      let assetDetails = {
        file: "",
        fileType: formData.assetDetails?.fileType || "",
        fileSize: 0,
        fileUrl: ""
      };

      // If this is a digital product, upload the file to S3 first
      if (formData.type.toLowerCase() === "digital" && formData.assetDetails?.file instanceof File) {
        console.log('Starting digital product file upload');
        
        // Get signed URL for the digital product file
        const signedUrlResponse = await fetch('http://localhost:3001/api/assets/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: formData.assetDetails.file.name,
            fileType: formData.assetDetails.file.type,
            folder: 'digital-products',
          }),
        });

        if (!signedUrlResponse.ok) {
          const errorData = await signedUrlResponse.json();
          console.error('Failed to get upload URL for digital product:', errorData);
          throw new Error(errorData.message || 'Failed to get upload URL for digital product');
        }

        const { uploadUrl, url: fileUrl } = await signedUrlResponse.json();
        console.log('Received upload URL for digital product');

        // Upload the file to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': formData.assetDetails.file.type,
          },
          body: formData.assetDetails.file,
        });

        if (!uploadResponse.ok) {
          console.error('Failed to upload digital product file to S3');
          throw new Error('Failed to upload digital product file to S3');
        }

        
        // Set the asset details with the uploaded file information
        assetDetails = {
          file: formData.assetDetails.file.name,
          fileType: formData.assetDetails.file.type,
          fileSize: formData.assetDetails.file.size,
          fileUrl: fileUrl
        };
      }

      // Transform the form data to match backend expectations
      const transformedData = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        itemId: formData.itemId,
        type: formData.type.toLowerCase(),
        price: {
          amount: formData.price.amount,
          currency: formData.price.currency
        },
        discount: formData.discount ? {
          percentage: formData.discount.percentage
        } : undefined,
        theme: formData.theme,
        season: formData.season,
        occasion: formData.occasion,
        tags: formData.tags,
        featured: formData.featured,
        status: formData.status.toLowerCase(),
        seo: formData.seo,
        slug: formData.slug,
        sellerId: "6836b526b006389d4aa86559", // TODO: Get this from auth context
        // Add required fields for physical products
        ...(formData.type.toLowerCase() === "physical" && {
          stock: 0,
          dimensions: {
            length: 0,
            width: 0,
            height: 0,
            unit: "cm"
          },
          weight: {
            value: 0,
            unit: "kg"
          }
        }),
        // Add required fields for digital products
        ...(formData.type.toLowerCase() === "digital" && {
          kind: formData.kind,
          assetDetails: assetDetails,
        }),
        // Add required fields for service products
        ...(formData.type.toLowerCase() === "service" && {
          deliveryTime: formData.deliveryTime,
          revisions: formData.revisions,
          deliverables: formData.deliverables,
          requirements: formData.requirements,
          consultationRequired: formData.consultationRequired
        })
      };
      
      // 1. Create the product first
      const productResponse = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      const responseData = await productResponse.json();
      
      if (!productResponse.ok) {
        console.error('Product creation failed:', responseData);
        throw new Error(responseData.message || 'Failed to create product');
      }

      const { product } = responseData;
      
      // 2. Only upload images if there are any selected
      if (selectedImages.length > 0) {
        
        
        // Get signed URLs for all images
        const signedUrlPromises = selectedImages.map(async (image) => {
          console.log('Getting signed URL for image:', image.file.name);
          
          const response = await fetch('http://localhost:3001/api/assets/upload-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: image.file.name,
              fileType: image.file.type,
              folder: `products/${product._id}`,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to get upload URL:', errorData);
            throw new Error(errorData.message || 'Failed to get upload URL');
          }

          const data = await response.json();
          return data;
        });

        const signedUrls = await Promise.all(signedUrlPromises);

        // Upload each image to S3
        const uploadPromises = selectedImages.map(async (image, index) => {
          const { uploadUrl, url: fileUrl, key } = signedUrls[index];
          console.log('Uploading image to S3:', image.file.name, 'with URL:', uploadUrl);

          // Upload to S3
          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': image.file.type,
            },
            body: image.file,
          });

          if (!uploadResponse.ok) {
            console.error('Failed to upload image to S3:', image.file.name);
            throw new Error(`Failed to upload image ${image.file.name}`);
          }

          console.log('Creating product image record for:', image.file.name);
          
          // Create product image record
          const imageResponse = await fetch('http://localhost:3001/api/products/images', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: product._id,
              isMain: image.isMain,
              filename: key,
              originalname: image.file.name,
              mimetype: image.file.type,
              size: image.file.size,
              url: fileUrl,
              status: 'uploaded',
              imageType: 'product'
            }),
          });

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json();
            console.error('Failed to create product image record:', errorData);
            throw new Error(errorData.message || 'Failed to create product image record');
          }

          return imageResponse.json();
        });

        await Promise.all(uploadPromises);
        console.log('All images uploaded successfully');
      }

      return product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.error('Product creation error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createProduct,
    isSubmitting,
    error,
  };
}; 