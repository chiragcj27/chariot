"use client";

import React, { useState } from 'react';
import { Control, Controller, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Upload, X, CheckCircle2 } from 'lucide-react';
import { ProductFormData } from '@/types/products/create/product.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface DigitalProductFieldsProps {
  control: Control<ProductFormData>;
  digitalKinds: string[];
  fileTypes: string[];
  setValue: (name: "assetDetails.fileSize" | "assetDetails.fileUrl", value: number | string) => void;
}

export function DigitalProductFields({
  control,
  digitalKinds,
  fileTypes,
  setValue
}: DigitalProductFieldsProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Watch the selected file type
  const selectedFileType = useWatch({
    control,
    name: "assetDetails.fileType"
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, onChange: (value: File | null) => void) => {
    const file = event.target.files?.[0] || null;
    handleFile(file, onChange);
  };

  const handleFile = (file: File | null, onChange: (value: File | null) => void) => {
    if (file) {
      // Check if the file extension matches the selected file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== selectedFileType?.toLowerCase()) {
        alert(`Please select a file with .${selectedFileType} extension`);
        return;
      }

      setPreviewFile(file);
      onChange(file);
      
      // Create preview URL for the file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Set file size
      setValue("assetDetails.fileSize", file.size);
      
      // Set a temporary fileUrl (will be updated after upload)
      setValue("assetDetails.fileUrl", url);
    }
  };

  const handleRemoveFile = (onChange: (value: null) => void) => {
    setPreviewFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onChange(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, onChange: (value: File | null) => void) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file, onChange);
  };

  return (
    <Card className="shadow-lg border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Digital Product Details
        </CardTitle>
        <CardDescription>
          Configure digital asset and download settings
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="kind">Digital Product Kind *</Label>
            <Controller
              name="kind"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select kind" />
                  </SelectTrigger>
                  <SelectContent>
                    {digitalKinds.map((kind) => (
                      <SelectItem key={kind} value={kind}>
                        {kind.charAt(0).toUpperCase() + kind.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileType">File Type *</Label>
            <Controller
              name="assetDetails.fileType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label htmlFor="previewFile">Preview File</Label>
          <Controller
            name="assetDetails.file"
            control={control}
            render={({ field: { onChange } }) => (
              <div className="space-y-4">
                <div
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-colors",
                    isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300",
                    !selectedFileType && "opacity-50 cursor-not-allowed"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, onChange)}
                >
                  <div className="flex flex-col items-center justify-center gap-4">
                    {previewFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">File selected</span>
                        </div>
                        <span className="text-sm text-gray-500">{previewFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            {selectedFileType ? (
                              <>Drop your .{selectedFileType} file here or click to browse</>
                            ) : (
                              "Select a file type first"
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedFileType ? `Only .${selectedFileType} files are allowed` : ""}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <Input
                    type="file"
                    id="previewFile"
                    onChange={(e) => handleFileChange(e, onChange)}
                    accept={selectedFileType ? `.${selectedFileType}` : undefined}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={!selectedFileType}
                  />
                  {previewFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveFile(onChange)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {previewUrl && (
                  <div className="mt-4">
                    <Label>Selected File:</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                      {previewFile?.type.startsWith('image/') ? (
                        <div className="flex justify-center">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            width={300}
                            height={200}
                            className="max-w-full h-auto max-h-48 object-contain rounded-lg shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-gray-500 p-4">
                          <FileText className="h-8 w-8" />
                          <div className="text-center">
                            <p className="font-medium">{previewFile?.name}</p>
                            <p className="text-sm text-gray-400">
                              {previewFile?.size ? `${(previewFile.size / 1024).toFixed(1)} KB` : ''}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}