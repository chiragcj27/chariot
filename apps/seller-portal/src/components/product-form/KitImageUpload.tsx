'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload } from 'lucide-react';

interface KitImage {
  _id?: string;
  url: string;
  filename?: string;
  originalname?: string;
  size?: number;
  mimetype?: string;
}

interface KitImageUploadProps {
  images: KitImage[];
  onImagesChange: (images: KitImage[]) => void;
  maxImages?: number;
}

export default function KitImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5 
}: KitImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const newImages: KitImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Only image files are allowed');
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size must be less than 5MB');
        }

        // Create a preview URL (will be replaced with actual upload during form submission)
        const imageUrl = URL.createObjectURL(file);
        newImages.push({
          url: imageUrl,
          filename: file.name,
          originalname: file.name,
          size: file.size,
          mimetype: file.type
        });
      }

      onImagesChange([...images, ...newImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      // If the image has a filename (S3 key), delete it from S3
      if (imageToRemove.filename && !imageToRemove.url.startsWith('blob:')) {
        const deleteResponse = await fetch('/api/assets/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key: imageToRemove.filename }),
        });
        
        if (!deleteResponse.ok) {
          console.error('Failed to delete kit image from S3:', deleteResponse.statusText);
          // Still remove from UI even if S3 deletion fails
        } else {
          console.log('Kit image deleted from S3 successfully');
        }
      }
      
      // Remove from local state
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Error deleting kit image:', error);
      // Still remove from UI even if deletion fails
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        fileInput.files = files;
        handleFileSelect({ target: { files } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kit Images</CardTitle>
        <p className="text-sm text-gray-600">
          Upload images specific to this kit that will be displayed to customers.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Area */}
        {images.length < maxImages && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Choose Images'}
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                or drag and drop images here
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, GIF up to 5MB each. Max {maxImages} images.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image.url}
                    alt={`Kit image ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={300}
                    height={300}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
                {image._id && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Saved
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Image Count */}
        <div className="text-sm text-gray-500">
          {images.length} of {maxImages} kit images uploaded
        </div>
      </CardContent>
    </Card>
  );
} 