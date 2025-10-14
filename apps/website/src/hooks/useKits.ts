import useSWR from 'swr';
import { buildApiUrl, API_ENDPOINTS } from '@/lib/swr';

// Product types for kit products
export interface ProductImage {
  _id: string;
  url: string;
  originalname?: string;
  filename?: string;
}

export interface ProductFile {
  _id: string;
  url: string;
  originalname?: string;
  filename?: string;
  fileType?: string;
}

export interface KitImageMetadataItem {
  imageId: string;
  title: string;
  description?: string;
}

export interface KitFileMetadataItem {
  fileId: string;
  title: string;
  description?: string;
}

export interface FlipbookUrlItem {
  fileId: string;
  url: string;
  fileName: string;
}

export interface KitProduct {
  _id: string;
  name: string;
  description: string;
  slug: string;
  typeOfKit?: 'premium' | 'basic';
  price?: {
    amount: number;
    currency: string;
  };
  creditsCost?: number;
  discountedCreditsCost?: number;
  kitDescription?: string;
  kitInstructions?: string;
  kitContents?: string[];
  images: ProductImage[];
  kitImages?: ProductImage[];
  kitFiles?: ProductFile[];
  kitImageMetadata?: KitImageMetadataItem[];
  kitFileMetadata?: KitFileMetadataItem[];
  flipbookUrls?: FlipbookUrlItem[];
  kitColorHex?: string;
}

export interface KitProductsResponse {
  products: KitProduct[];
}

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

// Hook for fetching kit products by kit slug
export function useKitProducts(kitSlug: string) {
  const { data, error, isLoading, mutate } = useSWR<KitProductsResponse>(
    kitSlug ? buildApiUrl(API_ENDPOINTS.kitProducts(kitSlug)) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // Cache for 2 minutes
    }
  );

  return {
    products: data?.products || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}
