'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, FileArchive, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ZipFile {
  name: string;
  url: string;
  key: string;
  size: number;
}

interface ZipUploadProps {
  zipFile: ZipFile | null | undefined;
  onZipFileChange: (zipFile: ZipFile | null) => void;
  maxSize?: number; // in MB
}

export default function ZipUpload({ zipFile, onZipFileChange, maxSize = 100 }: ZipUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
      setError('Only ZIP files are allowed');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Request signed URL from backend
      const res = await fetch('/api/assets/upload-zip-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileName: file.name, 
          fileType: file.type, 
          folder: 'digital-products' 
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get upload URL');
      }

      const { uploadUrl, key, url } = await res.json();

      // 2. Upload file to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // 3. Store file info
      const zipFileData: ZipFile = {
        name: file.name,
        url: url,
        key: key,
        size: file.size
      };

      onZipFileChange(zipFileData);
      toast.success('ZIP file uploaded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload ZIP file');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeZipFile = async () => {
    console.log('removeZipFile called, zipFile:', zipFile);
    setIsDeleting(true);
    
    // If there's a current ZIP file with a key, delete it from S3
    if (zipFile?.key) {
      console.log('Attempting to delete ZIP file with key:', zipFile.key);
      try {
        // Delete from private S3 bucket
        const deleteResponse = await fetch('/api/assets/delete-private', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: zipFile.key,
          }),
        });
        
        console.log('Delete response status:', deleteResponse.status);
        console.log('Delete response ok:', deleteResponse.ok);
        
        if (!deleteResponse.ok) {
          const errorData = await deleteResponse.json();
          console.error('Failed to delete ZIP file from S3:', deleteResponse.statusText, errorData);
          toast.error('Failed to delete ZIP file from storage');
          // Still remove from form state even if S3 deletion fails
        } else {
          const successData = await deleteResponse.json();
          console.log('Delete successful:', successData);
          toast.success('ZIP file removed successfully');
        }
      } catch (error) {
        console.error('Error deleting ZIP file from S3:', error);
        toast.error('Error deleting ZIP file from storage');
        // Still remove from form state even if S3 deletion fails
      }
    } else {
      console.log('No ZIP file key found, just removing from form state');
      toast.success('ZIP file removed successfully');
    }
    
    // Remove from form state
    onZipFileChange(null);
    setIsDeleting(false);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Product File (ZIP)</CardTitle>
        <p className="text-sm text-gray-600">
          Upload the final ZIP file containing your digital product. This file will be available for download to customers who purchase this product.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {zipFile ? (
          // Show uploaded file
          <div className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileArchive className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{zipFile.name}</p>
                  <p className="text-sm text-green-700">{formatFileSize(zipFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(zipFile.url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeZipFile()}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Upload area
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
                {isUploading ? 'Uploading...' : 'Choose ZIP File'}
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                or drag and drop ZIP file here
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ZIP files only, max {maxSize}MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Security Notice:</strong> This file will be stored securely and only accessible to customers who have purchased this product. 
            The file will be protected against unauthorized downloads.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 