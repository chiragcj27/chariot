import useSWR from 'swr';
import { buildApiUrl, API_ENDPOINTS, authFetcher } from '@/lib/swr';

// Types
export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  slug: string;
  sku: string;
  price?: {
    amount: number;
    currency: string;
  } | number;
  creditsCost?: number;
  images: ProductImage[];
  flipbookUrl?: string;
  category?: string;
  subcategory?: string;
  relatedProducts?: RelatedProduct[];
  type?: string;
  isKitProduct?: boolean;
}

export interface RelatedProduct {
  _id: string;
  name: string;
  description: string;
  slug: string;
  price?: {
    amount: number;
    currency: string;
  } | number;
  creditsCost?: number;
  images: ProductImage[];
  category?: string;
  subcategory?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ProductResponse {
  product: Product;
  relatedProducts: RelatedProduct[];
}

// Hook for fetching a single product by slug
export function useProduct(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<ProductResponse>(
    slug ? buildApiUrl(API_ENDPOINTS.productBySlug(slug)) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    product: data?.product,
    relatedProducts: data?.relatedProducts || [],
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

// Hook for fetching products by category and item
export function useProductsByCategory(categorySlug: string, itemSlug: string) {
  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    categorySlug && itemSlug 
      ? buildApiUrl(API_ENDPOINTS.productsByCategory(categorySlug, itemSlug))
      : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    products: data?.products || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 6,
    hasMore: data?.hasMore || false,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}

// Hook for checking product purchase status
export function useProductPurchaseStatus(productId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    productId ? buildApiUrl(API_ENDPOINTS.productPurchaseStatus(productId)) : null,
    authFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      shouldRetryOnError: (error) => {
        // Don't retry on auth errors
        return error.status !== 401;
      },
    }
  );

  return {
    isPurchased: data?.isPurchased || false,
    isLoading,
    isError: error,
    error,
    mutate,
  };
}
