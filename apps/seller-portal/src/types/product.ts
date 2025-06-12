export interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  itemId: string;
  type: 'physical' | 'digital' | 'service';
  price: {
    amount: number;
    currency: string;
  };
  discount: {
    percentage: number;
  } | null;
  tags: string[];
  featured: boolean;
  status: 'active' | 'inactive' | 'draft' | 'archived' | 'deleted' | 'pending' | 'rejected';
  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
  slug: string;
  images: string[];
} 