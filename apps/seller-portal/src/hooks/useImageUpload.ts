import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3001';

interface ImageFile {
  file: File;
  previewUrl: string;
  isMain: boolean;
}

interface UploadProgress {
  [key: string]: number;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (images: ImageFile[], productId: string) => {
    setIsUploading(true);
    setError(null);
    
    
    try {
      // Get signed URLs for all images
      const signedUrlPromises = images.map(async (image) => {
        const response = await axios.post(`${API_BASE_URL}/api/assets/upload-url`, {
          fileName: image.file.name,
          fileType: image.file.type,
          folder: `products/${productId}`
        });
        return {
          ...image,
          signedUrl: response.data.uploadUrl,
          key: response.data.key
        };
      });

      const imagesWithUrls = await Promise.all(signedUrlPromises);

      // Upload each image to S3
      const uploadPromises = imagesWithUrls.map(async (image) => {
        try {
          await axios.put(image.signedUrl, image.file, {
            headers: {
              'Content-Type': image.file.type
            },
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.loaded / (progressEvent.total || 1);
              setUploadProgress(prev => ({
                ...prev,
                [image.file.name]: progress
              }));
            }
          });

          // Create product image record
          await axios.post('/api/products/images', {
            productId,
            key: image.key,
            isMain: image.isMain,
            originalName: image.file.name,
            mimeType: image.file.type,
            size: image.file.size
          });

          return image;
        } catch (err) {
          console.error(`Error uploading ${image.file.name}:`, err);
          throw err;
        }
      });

      await Promise.all(uploadPromises);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
      return false;
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  return {
    uploadImages,
    isUploading,
    uploadProgress,
    error
  };
}; 