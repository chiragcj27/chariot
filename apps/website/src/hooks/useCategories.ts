import useSWR from 'swr';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/swr';

// Types
export interface CategoryItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    filename: string;
    originalname: string;
    size: number;
    mimetype: string;
    bucket: string;
    imageType: string;
    status: string;
  };
  onHover?: {
    url: string;
    filename: string;
    originalname: string;
    size: number;
    mimetype: string;
    bucket: string;
    imageType: string;
    status: string;
  };
}

export interface Category {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  items?: CategoryItem[];
}

// Hook for fetching menu structure (categories)
export function useMenuStructure() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    buildApiUrl(API_ENDPOINTS.menuStructure),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes - categories don't change often
    }
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

// Hook for fetching a specific category by slug
export function useCategory(slug: string) {
  const { categories, isLoading, isError, error, mutate } = useMenuStructure();
  
  const category = categories.find(c => c.slug === slug);

  return {
    category,
    isLoading,
    isError,
    error,
    mutate,
  };
}
