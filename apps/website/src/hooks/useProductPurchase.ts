import { useProductPurchaseStatus } from './useProducts';

interface PurchaseStatus {
  isPurchased: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useProductPurchase(productId: string): PurchaseStatus {
  const { isPurchased, isLoading, error } = useProductPurchaseStatus(productId);

  return { 
    isPurchased, 
    isLoading, 
    error: error ? (error.message || 'Failed to check purchase status') : null 
  };
} 