const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface MenuStructure {
  _id: string;
  title: string;
  slug: string;
  featuredItems?: Array<{
    _id: string;
    title: string;
    price: number;
    image: string;
    slug: string;
    categoryId: string;
  }>;
  subCategories?: Array<{
    _id: string;
    title: string;
    slug: string;
    description: string;
    categoryId: string;
    items?: Array<{
      _id: string;
      title: string;
      slug: string;
      description: string;
      image: string;
      subCategoryId: string;
    }>;
  }>;
}

export const menuApi = {
  async getFullMenuStructure(): Promise<MenuStructure[]> {
    const response = await fetch(`${API_BASE_URL}/menu/structure`);
    if (!response.ok) {
      throw new Error('Failed to fetch menu structure');
    }
    return response.json();
  },

  async createCategory(data: {
    title: string;
    slug: string;
    featuredItems?: Array<{
      _id: string;
      title: string;
      price: number;
      image: string;
      slug: string;
      categoryId: string;
    }>;
  }): Promise<{ message: string; category: MenuStructure }> {
    const response = await fetch(`${API_BASE_URL}/menu/category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create category');
    }
    return response.json();
  },

  async createSubCategory(data: {
    title: string;
    slug: string;
    description?: string;
    categoryId: string;
  }): Promise<{ message: string; subCategory: NonNullable<MenuStructure['subCategories']>[number] }> {
    const response = await fetch(`${API_BASE_URL}/menu/subcategory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create subcategory');
    }
    return response.json();
  },

  async createItem(data: {
    title: string;
    description?: string;
    price?: number;
    image?: string;
    subCategoryId: string;
  }): Promise<NonNullable<NonNullable<MenuStructure['subCategories']>[number]['items']>[number]> {
    const response = await fetch(`${API_BASE_URL}/menu/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create item');
    }
    return response.json();
  },

  async createFeaturedItem(data: {
    title: string;
    price: number;
    image?: string;
    categoryId: string;
  }): Promise<NonNullable<MenuStructure['featuredItems']>[number]> {
    const response = await fetch(`${API_BASE_URL}/menu/featured-item`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create featured item');
    }
    return response.json();
  },

  async checkCategoryTitleUnique(title: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/menu/check-category-title/${encodeURIComponent(title)}`);
    if (!response.ok) {
      throw new Error('Failed to check category title uniqueness');
    }
    const data = await response.json();
    return data.isUnique;
  },

  async checkSubCategoryTitleUnique(title: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/menu/check-subcategory-title/${encodeURIComponent(title)}`);
    if (!response.ok) {
      throw new Error('Failed to check subcategory title uniqueness');
    }
    const data = await response.json();
    return data.isUnique;
  },

  async checkItemTitleUnique(title: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/menu/check-item-title/${encodeURIComponent(title)}`);
    if (!response.ok) {
      throw new Error('Failed to check item title uniqueness');
    }
    const data = await response.json();
    return data.isUnique;
  },
}; 