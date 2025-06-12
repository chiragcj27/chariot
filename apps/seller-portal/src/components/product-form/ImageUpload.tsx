"use client";

import React, { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Star, GripVertical } from 'lucide-react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { ImageFile } from '@/types/image';

interface ImageUploadProps {
  onImagesSelected: (images: ImageFile[]) => void;
  selectedImages: ImageFile[];
}

export function ImageUpload({ onImagesSelected, selectedImages }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createPreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = files.map(file => ({
      file,
      previewUrl: createPreviewUrl(file),
      isMain: selectedImages.length === 0 // First image is main by default
    }));
    const updatedImages = [...selectedImages, ...newImages];
    onImagesSelected(updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...selectedImages];
    URL.revokeObjectURL(newImages[index].previewUrl);
    const removed = newImages.filter((_, i) => i !== index);
    
    // If we removed the main image and there are other images, make the first one main
    if (newImages[index].isMain && removed.length > 0) {
      removed[0].isMain = true;
    }
    
    onImagesSelected(removed);
  };

  const handleSetMainImage = (index: number) => {
    const updated = selectedImages.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    onImagesSelected(updated);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onImagesSelected(items);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length === 0) return;

    const newImages = files.map(file => ({
      file,
      previewUrl: createPreviewUrl(file),
      isMain: selectedImages.length === 0 // First image is main by default
    }));
    const updatedImages = [...selectedImages, ...newImages];
    onImagesSelected(updatedImages);
  }, [selectedImages, onImagesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-gray-600" />
          Product Images
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
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
          <p className="text-gray-600 mb-2">Upload product images</p>
          <p className="text-sm text-gray-500">Drag and drop or click to select files</p>
          <Button variant="outline" className="mt-4" onClick={handleButtonClick} type="button">
            Choose Files
          </Button>
        </div>

        {selectedImages.length > 0 && (
          <div className="mt-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="images">
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                  >
                    {selectedImages.map((image, index) => (
                      <Draggable key={index} draggableId={`image-${index}`} index={index}>
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="relative group"
                          >
                            <div className="aspect-square relative rounded-lg overflow-hidden">
                              <Image
                                src={image.previewUrl}
                                alt={`Preview ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover"
                                style={{ objectFit: 'cover' }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                            </div>
                            <div className="absolute top-2 right-2 flex gap-2">
                              <button
                                onClick={() => handleSetMainImage(index)}
                                className={`p-1 rounded-full transition-colors ${
                                  image.isMain 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-white/80 hover:bg-white text-gray-600'
                                }`}
                                title={image.isMain ? "Main image" : "Set as main image"}
                              >
                                <Star className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveImage(index)}
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
                            {image.isMain && (
                              <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                Main Image
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </CardContent>
    </Card>
  );
}