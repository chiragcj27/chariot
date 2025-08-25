'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Upload, Edit3 } from 'lucide-react';

interface KitImage {
  _id?: string;
  url: string;
  filename?: string;
  originalname?: string;
  size?: number;
  mimetype?: string;
  title?: string;
  description?: string;
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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
    
    // Close edit mode if we're editing this image
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    
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
        }
      }
      
      // Remove from local state (this automatically removes title and description)
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

  const updateImageMetadata = (index: number, title: string, description: string) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      title,
      description
    };
    onImagesChange(newImages);
  };

  const toggleEdit = (index: number) => {
    setEditingIndex(editingIndex === index ? null : index);
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

        {/* Image Preview Grid with Metadata */}
        {images.length > 0 && (
          <div className="space-y-6">
            <h4 className="font-medium text-sm text-gray-700">Uploaded Images ({images.length})</h4>
            {images.map((image, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Image Preview */}
                  <div className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={image.url}
                        alt={`Kit image ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={300}
                        height={300}
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                    {image._id && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Saved
                      </div>
                    )}
                    {/* Action buttons */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => toggleEdit(index)}
                        className="bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit title and description"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Section */}
                  <div className="md:col-span-2 space-y-3">
                    {editingIndex === index ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`image-title-${index}`} className="text-sm font-medium">
                            Image Title *
                          </Label>
                          <Input
                            id={`image-title-${index}`}
                            value={image.title || ''}
                            onChange={(e) => updateImageMetadata(index, e.target.value, image.description || '')}
                            placeholder="Enter a descriptive title for this image"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`image-description-${index}`} className="text-sm font-medium">
                            Image Description (Optional)
                          </Label>
                          <Textarea
                            id={`image-description-${index}`}
                            value={image.description || ''}
                            onChange={(e) => updateImageMetadata(index, image.title || '', e.target.value)}
                            placeholder="Describe what this image shows and its relevance to the kit (optional)"
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setEditingIndex(null)}
                            disabled={!image.title?.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingIndex(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="space-y-2">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Title:</Label>
                          <p className="text-sm text-gray-900 mt-1">
                            {image.title || (
                              <span className="text-red-500 italic">Title required - click edit to add</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Description:</Label>
                          <p className="text-sm text-gray-900 mt-1">
                            {image.description || (
                              <span className="text-gray-500 italic">No description provided</span>
                            )}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleEdit(index)}
                          className="mt-2"
                        >
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit Info
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
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