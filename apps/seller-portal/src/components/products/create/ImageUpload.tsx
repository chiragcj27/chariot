import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { Control, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { ProductFormData } from '@/types/products/create/product.types';
import Image from 'next/image';

interface ImageUploadProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  control,
  setValue
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviewImages: string[] = [];
      const newFiles: File[] = [];

      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviewImages.push(reader.result as string);
            setPreviewImages([...previewImages, ...newPreviewImages]);
          };
          reader.readAsDataURL(file);
          newFiles.push(file);
        }
      });

      // Update form state with new files
      const currentImages = (control._formValues.images as File[]) || [];
      setValue('images', [...currentImages, ...newFiles]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newPreviewImages = [...previewImages];
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);

    // Update form state
    const currentImages = (control._formValues.images as File[]) || [];
    const newFiles = [...currentImages];
    newFiles.splice(index, 1);
    setValue('images', newFiles);
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescription>
          Upload images for your product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Upload product images</p>
          <p className="text-sm text-gray-500">
            Accepted file types: JPG, PNG, GIF
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={handleChooseFiles}
            type="button"
          >
            Choose Files
          </Button>
        </div>

        {previewImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative group">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={128}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 