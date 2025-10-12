import useSWR from 'swr';
import { buildApiUrl, API_ENDPOINTS, authFetcher } from '@/lib/swr';

// Types
export interface BuyerProfile {
  buyer: {
    _id: string;
    companyInformation?: {
      name: string;
      address: string;
      country: string;
      state: string;
      zipcode: string;
      telephone: string[];
      fax: string[];
      websiteUrl: string;
    };
    contactInformation?: {
      firstName: string;
      lastName: string;
      position: string;
      email: string;
      telephone: string[];
      fax: string[];
    };
    otherInformation?: {
      primaryMarketSegment: string;
      buyingOrganization: string;
      TaxId: string;
      JBT_id: string;
      DUNN: string;
    };
  };
}

// Hook for fetching buyer profile
export function useBuyerProfile() {
  const { data, error, isLoading, mutate } = useSWR<BuyerProfile>(
    buildApiUrl(API_ENDPOINTS.buyerProfile),
    authFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // Cache for 2 minutes
      shouldRetryOnError: (error) => {
        return error.status !== 401;
      },
    }
  );

  return {
    profile: data?.buyer,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}


