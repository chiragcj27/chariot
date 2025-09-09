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
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsPurchased(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/products/${productId}/purchase-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Purchase status response:', data);
          setIsPurchased(data.isPurchased);
        } else if (response.status === 401) {
          // User not authenticated
          console.log('User not authenticated for purchase status check');
          setIsPurchased(false);
        } else {
          // Other error
          console.error('Failed to check purchase status, status:', response.status);
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