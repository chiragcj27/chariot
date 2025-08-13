'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Upload, FileText, FileArchive, File } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface KitFile {
  _id?: string;
  filename: string;
  originalname: string;
  url: string;
  size: number;
  mimetype: string;
  fileType: 'pdf' | 'document' | 'zip';
  pageCount?: number;
  documentType?: string;
  containsFiles?: number;
  isPreview?: boolean;
}

interface KitFileUploadProps {
  files: KitFile[];
  onFilesChange: (files: KitFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export default function KitFileUpload({ 
  files, 
  onFilesChange, 
  maxFiles = 10, 
  maxSize = 50 
}: KitFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const newFiles: KitFile[] = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Validate file type - only allow preview files (PDF, documents, not ZIP)
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const allowedExtensions = ['.pdf', '.doc', '.docx'];
        
        const isValidType = allowedTypes.includes(file.type) || 
          allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        if (!isValidType) {
          throw new Error(`File type not allowed: ${file.name}. Allowed: PDF, DOC, DOCX (ZIP files are uploaded separately as the main kit file)`);
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
          throw new Error(`File size must be less than ${maxSize}MB: ${file.name}`);
        }

        // Determine file type for our system
        let fileType: 'pdf' | 'document';
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          fileType = 'pdf';
        } else {
          fileType = 'document';
        }

        // 1. Request signed URL from backend (public bucket for preview files)
        const res = await fetch('/api/assets/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fileName: file.name, 
            fileType: file.type, 
            folder: 'kit-preview-files'
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
          console.error('S3 Upload failed:', {
            status: uploadRes.status,
            statusText: uploadRes.statusText,
            headers: Object.fromEntries(uploadRes.headers.entries())
          });
          
          if (uploadRes.status === 0) {
            throw new Error('CORS error: Unable to upload to S3. Please check S3 CORS configuration.');
          }
          
          throw new Error(`Failed to upload file to S3: ${uploadRes.status} ${uploadRes.statusText}`);
        }

        // 3. Create file object
        const kitFile: KitFile = {
          filename: key.split('/').pop() || file.name,
          originalname: file.name,
          url: url,
          size: file.size,
          mimetype: file.type,
          fileType: fileType,
          isPreview: true // Always true for preview files
        };

        // Add type-specific metadata
        if (fileType === 'pdf') {
          kitFile.pageCount = 0; // Could be extracted from PDF if needed
        } else if (fileType === 'document') {
          kitFile.documentType = file.type.includes('word') ? 'word' : 'other';
        }

        newFiles.push(kitFile);
      }

      onFilesChange([...files, ...newFiles]);
      toast.success(`${newFiles.length} preview file(s) uploaded successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = async (fileId: string, index: number) => {
    setIsDeleting(fileId);
    
    try {
      const fileToRemove = files[index];
      
      // Delete from S3 if the file has been uploaded (has a URL that's not a blob URL)
      if (fileToRemove.url && !fileToRemove.url.startsWith('blob:')) {
        // Extract the key from the URL or use the filename
        const urlParts = fileToRemove.url.split('/');
        const encodedKey = urlParts[urlParts.length - 1]; // Get the filename from the URL
        const key = decodeURIComponent(encodedKey); // Decode the URL-encoded key
        
        // Use the appropriate delete endpoint based on file type
        const deleteEndpoint = fileToRemove.fileType === 'zip' ? '/api/assets/delete-private' : '/api/assets/delete';
        
        const deleteResponse = await fetch(deleteEndpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key }),
        });
        
        if (!deleteResponse.ok) {
          console.error('Failed to delete file from S3:', deleteResponse.statusText);
          // Still remove from UI even if S3 deletion fails
        } else {
          console.log('File deleted from S3 successfully');
        }
      }

      // If file has an _id, it's already saved to database, so delete it
      if (fileId && !fileId.startsWith('temp-')) {
        const deleteResponse = await fetch(`/api/files/kit-files/${fileId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!deleteResponse.ok) {
          console.error('Failed to delete file from database:', deleteResponse.statusText);
          // Still remove from UI even if database deletion fails
        }
      }

      // Remove from local state
      const newFiles = files.filter((_, i) => i !== index);
      onFilesChange(newFiles);
      toast.success('File removed successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to remove file');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const fileInput = fileInputRef.current;
      if (fileInput) {
        fileInput.files = droppedFiles;
        handleFileSelect({ target: { files: droppedFiles } } as React.ChangeEvent<HTMLInputElement>);
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

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'zip':
        return <FileArchive className="h-6 w-6 text-blue-500" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'PDF';
      case 'zip':
        return 'ZIP';
      case 'document':
        return 'Document';
      default:
        return 'File';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kit Preview Files</CardTitle>
        <p className="text-sm text-gray-600">
          Upload preview files (PDFs, documents) that customers can see before purchasing. These files are stored publicly and serve as previews of the kit contents.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Area */}
        {files.length < maxFiles && (
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
                {isUploading ? 'Uploading...' : 'Choose Files'}
              </Button>
              <p className="mt-2 text-sm text-gray-500">
                or drag and drop files here
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOC, DOCX up to {maxSize}MB each. Max {maxFiles} files. (ZIP files are uploaded separately as the main kit file)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.zip,.doc,.docx,application/pdf,application/zip,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Files List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Uploaded Files ({files.length})</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.fileType)}
                  <div>
                    <p className="font-medium text-sm text-gray-900">{file.originalname}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{getFileTypeLabel(file.fileType)}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                      {file._id && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">Saved</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    Preview
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFile(file._id || `temp-${index}`, index)}
                    disabled={isDeleting === (file._id || `temp-${index}`)}
                  >
                    {isDeleting === (file._id || `temp-${index}`) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Preview Files:</strong> These files are stored publicly and can be viewed by anyone. They serve as previews of the kit contents. 
            The main kit ZIP file (containing all contents) is uploaded separately and stored securely.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 