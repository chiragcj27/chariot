import useSWR from 'swr';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/swr';

// Types
export interface SubscriptionCard {
  _id?: string;
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  button: string;
  paypalPlanId: string;
  planKey: string;
  credits: number;
}

// Hook for fetching subscription cards
export function useSubscriptionCards() {
  const { data, error, isLoading, mutate } = useSWR<SubscriptionCard[]>(
    buildApiUrl(API_ENDPOINTS.subscriptionCards),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // Cache for 10 minutes - subscription cards don't change often
    }
  );

  // Sort cards by price (low to high)
  const sortedCards = data ? [...data].sort((a, b) => {
    const priceA = parseFloat(String(a.price || "0").replace(/[^0-9.]/g, ''));
    const priceB = parseFloat(String(b.price || "0").replace(/[^0-9.]/g, ''));
    return priceA - priceB;
  }) : [];

  return {
    cards: sortedCards,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}
