import { API_URL } from '../config';

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  image?: {
    url: string;
  };
  price?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  items: MenuItem[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: SubCategory[];
  featuredItems?: MenuItem[];
}

export interface MenuStructure {
  categories: Category[];
}

interface ApiMenuItem {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  slug?: string;
  image?: { url: string };
  price?: string;
}

interface ApiSubCategory {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  slug?: string;
  items?: ApiMenuItem[];
}

interface ApiCategory {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  slug?: string;
  subCategories?: ApiSubCategory[];
  featuredItems?: ApiMenuItem[];
}

export const menuService = {
  async getMenuStructure(): Promise<MenuStructure> {
    try {
      const response = await fetch(`${API_URL}/api/menu/structure`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch menu structure: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate the response structure
      if (!data || !Array.isArray(data)) {
        console.error('Invalid API response structure:', data);
        throw new Error('Invalid menu structure received from API');
      }

      // Transform the data to match our expected structure
      const transformedData: MenuStructure = {
        categories: data.map((category: ApiCategory) => ({
          id: category._id || category.id || '',
          name: category.title || category.name || '',
          slug: category.slug?.toLowerCase().replace(/\s+/g, '-') || '',
          subcategories: (category.subCategories || []).map((subcat: ApiSubCategory) => ({
            id: subcat._id || subcat.id || '',
            name: subcat.title || subcat.name || '',
            slug: subcat.slug?.toLowerCase().replace(/\s+/g, '-') || '',
            items: (subcat.items || []).map((item: ApiMenuItem) => ({
              id: item._id || item.id || '',
              name: item.title || item.name || '',
              slug: item.slug?.toLowerCase().replace(/\s+/g, '-') || '',
              image: item.image ? { url: item.image.url } : undefined,
              price: item.price
            }))
          })),
          featuredItems: (category.featuredItems || []).map((item: ApiMenuItem) => ({
            id: item._id || item.id || '',
            name: item.title || item.name || '',
            slug: item.slug?.toLowerCase().replace(/\s+/g, '-') || '',
            image: item.image ? { url: item.image.url } : undefined,
            price: item.price
          }))
        }))
      };

      return transformedData;
    } catch (error) {
      console.error('Error in getMenuStructure:', error);
      throw error;
    }
  }
}; 