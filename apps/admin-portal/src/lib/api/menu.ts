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
  items?: Array<{
    _id: string;
    title: string;
    slug: string;
    description: string;
    image: string;
    categoryId: string;
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

  async createItem(data: {
    title: string;
    description?: string;
    price?: number;
    image?: string;
    categoryId: string;
  }): Promise<NonNullable<MenuStructure['items']>[number]> {
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

  async deleteCategory(categoryId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/menu/category/${categoryId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete category');
    }
    return response.json();
  },

  async deleteItem(itemId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/menu/item/${itemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
    return response.json();
  },

  async updateCategory(categoryId: string, data: {
    title?: string;
    slug?: string;
    featuredItems?: Array<{
      _id: string;
      title: string;
      price: number;
      image: string;
      slug: string;
      categoryId: string;
    }>;
  }): Promise<{ message: string; category: MenuStructure }> {
    const response = await fetch(`${API_BASE_URL}/menu/category/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update category');
    }
    return response.json();
  },

  async updateItem(itemId: string, data: {
    title?: string;
    slug?: string;
    description?: string;
    image?: string;
  }): Promise<{ message: string; item: NonNullable<MenuStructure['items']>[number] }> {
    const response = await fetch(`${API_BASE_URL}/menu/item/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update item');
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
}; 