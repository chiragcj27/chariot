import useSWR from 'swr';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/swr';

// Types
export interface KitImage {
  _id: string;
  url: string;
  originalname: string;
}

export interface Kit {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: KitImage;
  onHoverImage?: KitImage;
  mainImage?: KitImage;
  carouselImages?: KitImage[];
  testimonials?: string[];
  createdAt?: string;
  updatedAt?: string;
}


// Hook for fetching all kits
export function useKits() {
  const { data, error, isLoading, mutate } = useSWR<Kit[]>(
    buildApiUrl(API_ENDPOINTS.kits),
    {
      revalidateOnFocus: false,
      dedupingInterval: 120000, // Cache for 2 minutes
    }
  );

  return {
    kits: data || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

// Hook for fetching a single kit by slug
export function useKit(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<Kit>(
    slug ? buildApiUrl(API_ENDPOINTS.kitBySlug(slug)) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    kit: data,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}
