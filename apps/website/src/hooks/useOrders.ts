import useSWR from 'swr';
import { buildApiUrl, API_ENDPOINTS, authFetcher } from '@/lib/swr';

// Types
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
  productInfo?: {
    type: 'physical' | 'digital' | 'service';
    isKitProduct?: boolean;
  };
}

export interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  items: OrderItem[];
  paymentBreakdown: {
    creditsUsed: number;
    creditsAmount: number;
    paypalAmount: number;
    totalAmount: number;
  };
}

export interface PendingOrder extends Order {
  timeRemaining: number;
  isExpired: boolean;
}

// Hook for fetching completed orders
export function useCompletedOrders() {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    buildApiUrl(API_ENDPOINTS.userOrders),
    authFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      shouldRetryOnError: (error) => {
        return error.status !== 401;
      },
    }
  );

  return {
    orders: data || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

// Hook for fetching all orders (including pending)
export function useAllOrders() {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    buildApiUrl(API_ENDPOINTS.userOrdersAll),
    authFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 15000, // Cache for 15 seconds - pending orders need frequent updates
      shouldRetryOnError: (error) => {
        return error.status !== 401;
      },
    }
  );

  return {
    orders: data || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}
