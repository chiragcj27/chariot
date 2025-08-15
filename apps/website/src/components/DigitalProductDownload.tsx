'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface DigitalProductDownloadProps {
  productId: string;
  productName: string;
  isPurchased: boolean; // This will be determined by the order system
  className?: string;
}

export default function DigitalProductDownload({ 
  productId, 
  productName, 
  isPurchased, 
  className = "" 
}: DigitalProductDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!isPurchased) {
      setError('You need to purchase this product to download it');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      // Get the download URL from our API
      const response = await fetch(`${API_URL}/api/assets/digital-product/${productId}/download`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 401) {
          setError('Please log in to download this product');
          return;
        }
        
        if (response.status === 403) {
          setError('You need to purchase this product to download it');
          return;
        }
        
        throw new Error(errorData.message || 'Failed to get download URL');
      }

      const { downloadUrl } = await response.json();

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${productName}.zip`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download product');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isPurchased) {
    return (
      <div className={className}>
        <Button 
          variant="outline" 
          disabled 
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Purchase Required
        </Button>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Purchase this product to download the digital files
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleDownload}
        disabled={isDownloading}
        className="w-full"
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Preparing Download...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download Digital Product
          </>
        )}
      </Button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Download link expires in 5 minutes for security
      </p>
    </div>
  );
} 