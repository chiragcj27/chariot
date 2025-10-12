import { SWRConfiguration } from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Default fetcher function for SWR
export const fetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object
    (error as Error & { info?: unknown; status?: number }).info = await response.json().catch(() => ({}));
    (error as Error & { info?: unknown; status?: number }).status = response.status;
    throw error;
  }
  
  return response.json();
};

// Authenticated fetcher function for SWR
export const authFetcher = async (url: string) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Authentication expired');
    }
    
    const error = new Error('An error occurred while fetching the data.');
    (error as Error & { info?: unknown; status?: number }).info = await response.json().catch(() => ({}));
    (error as Error & { info?: unknown; status?: number }).status = response.status;
    throw error;
  }
  
  return response.json();
};

// SWR configuration
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors except 408, 429
    if (error.status >= 400 && error.status < 500) {
      return error.status === 408 || error.status === 429;
    }
    return true;
  },
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string) => {
  return `${API_URL}${endpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  // Products
  products: '/api/products',
  productBySlug: (slug: string) => `/api/products/slug/${slug}`,
  productsByCategory: (categorySlug: string, itemSlug: string) => 
    `/api/products/category/${categorySlug}/item/${itemSlug}`,
  productPurchaseStatus: (productId: string) => `/api/products/${productId}/purchase-status`,
  
  // Categories
  menuStructure: '/api/menu/structure',
  
  // Kits
  kits: '/api/kits',
  kitBySlug: (slug: string) => `/api/kits/slug/${slug}`,
  
  // Orders
  userOrders: '/api/orders/user/orders',
  userOrdersAll: '/api/orders/user/orders/all',
  
  // Subscription Cards
  subscriptionCards: '/api/subscription-cards',
  
  // Buyers/Auth
  buyerProfile: '/api/buyers/profile',
  buyerLogin: '/api/buyers/login',
  buyerRegister: '/api/buyers/register',
  
  // PayPal
  paypalConfirm: '/api/subscribe/confirm',
} as const;
