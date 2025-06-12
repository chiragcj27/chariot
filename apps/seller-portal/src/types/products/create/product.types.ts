import { z } from 'zod';

// API Response Types
export interface CategoryItem {
  _id: string;
  title: string;
  price: number;
  description: string;
  image: {
    _id: string;
    url: string;
    imageType: string;
  };
}

export interface SubCategory {
  _id: string;
  title: string;
  items: CategoryItem[];
}

export interface Category {
  _id: string;
  title: string;
  subCategories: SubCategory[];
}

export type CategoriesResponse = Category[];

// Form validation schemas
export const baseProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  subCategoryId: z.string().min(1, "Please select a subcategory"),
  itemId: z.string().min(1, "Please select an item"),
  type: z.enum(["PHYSICAL", "DIGITAL", "SERVICE"]),
  price: z.object({
    amount: z.number().min(0, "Price must be positive"),
    currency: z.string().min(1, "Currency is required")
  }),
  discount: z.object({
    percentage: z.number().min(0).max(100, "Discount percentage must be between 0 and 100"),
  }).optional(),
  theme: z.string().optional(),
  season: z.string().optional(),
  occasion: z.string().optional(),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
  slug: z.string().min(1, "Slug is required"),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.array(z.string()).optional()
  }).optional()
});

export const digitalProductSchema = baseProductSchema.extend({
  kind: z.string().min(1, "Digital product kind is required"),
  assetDetails: z.object({
    file: z.string().min(1, "File is required"),
    fileType: z.string().min(1, "File type is required"),
    fileSize: z.number().min(0, "File size must be positive"),
    fileUrl: z.string().url("Valid file URL is required")
  }),
  downloadLink: z.string().url("Valid download link is required"),
  downloadLinkExpiry: z.date()
});

export const serviceProductSchema = baseProductSchema.extend({
  deliveryTime: z.object({
    min: z.number().min(1, "Minimum delivery time is required"),
    max: z.number().min(1, "Maximum delivery time is required"),
    unit: z.string().min(1, "Time unit is required")
  }),
  revisions: z.object({
    allowed: z.number().min(0, "Number of revisions must be positive"),
    cost: z.number().min(0, "Revision cost must be positive"),
    unit: z.string().min(1, "Cost unit is required")
  }),
  deliverables: z.array(z.string()).min(1, "At least one deliverable is required"),
  requirements: z.array(z.string()).min(1, "At least one requirement is required"),
  consultationRequired: z.boolean().default(false)
});

export type ProductFormData = z.infer<typeof baseProductSchema> & {
  // Digital product fields
  kind?: string;
  assetDetails?: {
    file: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  };
  downloadLink?: string;
  downloadLinkExpiry?: Date;
  // Service product fields
  deliveryTime?: {
    min: number;
    max: number;
    unit: string;
  };
  revisions?: {
    allowed: number;
    cost: number;
    unit: string;
  };
  deliverables?: string[];
  requirements?: string[];
  consultationRequired?: boolean;
};