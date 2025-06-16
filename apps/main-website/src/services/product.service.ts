import { IProduct, ProductFilters, ProductResponse } from '@/types/product';

class ProductService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  async getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.subcategory) queryParams.append('subcategory', filters.subcategory);
    if (filters.item) queryParams.append('item', filters.item);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.featured) queryParams.append('featured', 'true');
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    // Add populate parameter to get image details
    queryParams.append('populate', 'images');

    const response = await fetch(`${this.baseUrl}/api/products?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  }

  async getProductsByItem(itemSlug: string, page: number = 1, limit: number = 12): Promise<ProductResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('populate', 'images');
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    const response = await fetch(`${this.baseUrl}/api/products/item/${itemSlug}?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    return response.json();
  }

  async getProductBySlug(slug: string): Promise<IProduct> {
    const response = await fetch(`${this.baseUrl}/api/products/slug/${slug}?populate=images`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const data = await response.json();
    console.log('Product data:', data);
    
    if (!data.product) {
      throw new Error('Product not found');
    }

    return data.product;
  }

  async getFeaturedProducts(limit: number = 4): Promise<IProduct[]> {
    const response = await this.getProducts({ featured: true, limit });
    return response.products;
  }
}

export const productService = new ProductService(); 