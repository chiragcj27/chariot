export interface FilterValue {
  id: string;
  name: string;
  value: string;
}

export interface Filter {
  id: string;
  name: string;
  values: FilterValue[];
}

export interface MenuItem {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  onHover?: string;
  categoryId: string;
  filters?: Filter[];
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