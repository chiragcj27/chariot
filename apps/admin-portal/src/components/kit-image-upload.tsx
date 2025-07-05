'use client';

import React, { useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Star, GripVertical, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { toast } from 'sonner';

interface KitImage {
  _id?: string;
  url: string;
  originalname: string;
  filename?: string;
  isMain: boolean;
  isCarousel: boolean;
  file?: File;
  previewUrl?: string;
}

interface KitImageUploadProps {
  onImagesChange: (images: KitImage[]) => void;
  images: KitImage[];
  kitId?: string;
}

export function KitImageUpload({ onImagesChange, images, kitId }: KitImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const uploadImageToS3 = async (file: File): Promise<{ url: string; key: string }> => {
    try {
      // Get upload URL
      const uploadUrlResponse = await fetch('/api/admin/assets/upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: 'kits',
        }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, key, url } = await uploadUrlResponse.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      return { url, key };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newImages: KitImage[] = [];

      for (const file of files) {
        const { url, key } = await uploadImageToS3(file);
        
        const newImage: KitImage = {
          url,
          originalname: file.name,
          filename: key,
          isMain: images.length === 0, // First image is main by default
          isCarousel: images.length > 0, // Subsequent images are carousel
          file,
          previewUrl: createPreviewUrl(file),
        };

        newImages.push(newImage);
      }

      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    const removedImage = newImages[index];
    
    // Revoke preview URL if it exists
    if (removedImage.previewUrl) {
      URL.revokeObjectURL(removedImage.previewUrl);
    }
    
    const removed = newImages.filter((_, i) => i !== index);
    
    // If we removed the main image and there are other images, make the first one main
    if (removedImage.isMain && removed.length > 0) {
      removed[0].isMain = true;
      removed[0].isCarousel = false;
    }
    
    onImagesChange(removed);
    toast.success('Image removed');
  };

  const handleSetMainImage = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isMain: i === index,
      isCarousel: i !== index,
    }));
    onImagesChange(updated);
    toast.success('Main image updated');
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onImagesChange(items);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    setUploading(true);
    try {
      const newImages: KitImage[] = [];

      for (const file of files) {
        const { url, key } = await uploadImageToS3(file);
        
        const newImage: KitImage = {
          url,
          originalname: file.name,
          filename: key,
          isMain: images.length === 0,
          isCarousel: images.length > 0,
          file,
          previewUrl: createPreviewUrl(file),
        };

        newImages.push(newImage);
      }

      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [images, onImagesChange]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const mainImage = images.find(img => img.isMain);
  const carouselImages = images.filter(img => img.isCarousel);

  return (
    <div className="space-y-6">
      {/* Main Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Main Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mainImage ? (
            <div className="relative group">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={mainImage.previewUrl || mainImage.url}
                  alt={mainImage.originalname}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
              </div>
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => handleRemoveImage(images.indexOf(mainImage))}
                  className="p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                Main Image
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No main image selected</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carousel Images Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-500" />
            Carousel Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {uploading ? 'Uploading...' : 'Upload carousel images'}
            </p>
            <p className="text-sm text-gray-500">Drag and drop or click to select files</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={handleButtonClick} 
              type="button"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </Button>
          </div>

          {carouselImages.length > 0 && (
            <div className="mt-6">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="carousel-images">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                    >
                      {carouselImages.map((image, index) => {
                        const globalIndex = images.indexOf(image);
                        return (
                          <Draggable key={globalIndex} draggableId={`image-${globalIndex}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="relative group"
                              >
                                <div className="aspect-square relative rounded-lg overflow-hidden">
                                  <Image
                                    src={image.previewUrl || image.url}
                                    alt={image.originalname}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                                </div>
                                <div className="absolute top-2 right-2 flex gap-2">
                                  <button
                                    onClick={() => handleSetMainImage(globalIndex)}
                                    className="p-1 bg-white/80 hover:bg-white text-gray-600 rounded-full"
                                    title="Set as main image"
                                  >
                                    <Star className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveImage(globalIndex)}
                                    className="p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-2 left-2 p-1 bg-white/80 text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 