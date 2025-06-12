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
        ...(formData.type.toLowerCase() === "digital" && formData.kind && {
          kind: formData.kind,
          assetDetails: formData.assetDetails,
          downloadLink: formData.downloadLink,
          downloadLinkExpiry: formData.downloadLinkExpiry
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
      
      console.log('Creating product with data:', JSON.stringify(transformedData, null, 2));
      
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
      console.log('Product created successfully:', product);

      // 2. Only upload images if there are any selected
      if (selectedImages.length > 0) {
        console.log('Starting image upload process for', selectedImages.length, 'images');
        
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
          console.log('Received upload data:', data);
          return data;
        });

        const signedUrls = await Promise.all(signedUrlPromises);
        console.log('Received signed URLs for all images:', signedUrls);

        // Upload each image to S3
        const uploadPromises = selectedImages.map(async (image, index) => {
          const { uploadUrl, url: fileUrl } = signedUrls[index];
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
              filename: image.file.name,
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