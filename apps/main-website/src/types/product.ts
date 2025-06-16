import { Types } from 'mongoose';

export type ProductType = 'physical' | 'digital' | 'service';

export interface ProductPrice {
  amount: number;
  currency: string;
}

export interface ProductDiscount {
  percentage: number;
}

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: ProductPrice;
  type: ProductType;
  categoryId?: Types.ObjectId;
  subCategoryId?: Types.ObjectId;
  itemId?: Types.ObjectId;
  featured?: boolean;
  discount?: ProductDiscount;
  tags: string[];
  images: Array<{
    _id: string;
    url: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  item?: string;
  type?: ProductType;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductResponse {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 