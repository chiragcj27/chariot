export interface MenuItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  onHover?: string;
  categoryId: string;
}

export interface MenuCategory {
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
  items?: MenuItem[];
}

export type MenuStructure = MenuCategory[]; 