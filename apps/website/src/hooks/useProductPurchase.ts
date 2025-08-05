import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface PurchaseStatus {
  isPurchased: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useProductPurchase(productId: string): PurchaseStatus {
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        // TODO: Replace with actual API call to check purchase status
        // This will be implemented when we create the order system
        // For now, we'll just check if the user is authenticated
        
        const response = await fetch(`${API_URL}/api/products/${productId}/purchase-status`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsPurchased(data.isPurchased);
        } else if (response.status === 401) {
          // User not authenticated
          setIsPurchased(false);
        } else {
          // Other error
          setError('Failed to check purchase status');
        }
      } catch (err) {
        console.error('Error checking purchase status:', err);
        setError('Failed to check purchase status');
      } finally {
        setIsLoading(false);
      }
    };

    checkPurchaseStatus();
  }, [productId]);

  return { isPurchased, isLoading, error };
} 