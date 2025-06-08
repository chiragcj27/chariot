import { z } from 'zod';

export const productTypes = ["PHYSICAL", "DIGITAL", "SERVICE"] as const;
export const productStatuses = ["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"] as const;
export const currencies = ["USD", "EUR", "GBP", "INR"] as const;
export const digitalKinds = ["video", "audio", "image", "pdf", "document", "software", "template"] as const;
export const timeUnits = ["hours", "days", "weeks", "months"] as const;
export const fileTypes = ["mp4", "mp3", "jpg", "png", "pdf", "docx", "zip", "psd", "ai"] as const;

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
    amount: z.number().min(0, "Discount must be positive"),
    currency: z.string().min(1, "Currency is required")
  }),
  theme: z.string().optional(),
  season: z.string().optional(),
  occasion: z.string().optional(),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
  slug: z.string().min(1, "Slug is required"),
  images: z.array(z.instanceof(File)).optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.array(z.string()).optional()
  }).optional()
});

export const digitalProductSchema = baseProductSchema.extend({
  kind: z.string().min(1, "Digital product kind is required"),
  assetDetails: z.object({
    fileType: z.string().min(1, "File type is required"),
    previewFile: z.string().min(1, "Preview file is required")
  })
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

export const productSchema = z.discriminatedUnion("type", [
  baseProductSchema.extend({ type: z.literal("PHYSICAL") }),
  digitalProductSchema.extend({ type: z.literal("DIGITAL") }),
  serviceProductSchema.extend({ type: z.literal("SERVICE") })
]);

export type DigitalProductFormData = {
  type: "DIGITAL";
  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  itemId: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  price: { amount: number; currency: string };
  discount: { amount: number; currency: string };
  theme?: string;
  season?: string;
  occasion?: string;
  tags: string[];
  featured: boolean;
  slug: string;
  images?: File[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  kind: string;
  assetDetails: {
    fileType: string;
    previewFile: string;
  };
};

export type ServiceProductFormData = {
  type: "SERVICE";
  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  itemId: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  price: { amount: number; currency: string };
  discount: { amount: number; currency: string };
  theme?: string;
  season?: string;
  occasion?: string;
  tags: string[];
  featured: boolean;
  slug: string;
  images?: File[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  deliveryTime: {
    min: number;
    max: number;
    unit: string;
  };
  revisions: {
    allowed: number;
    cost: number;
    unit: string;
  };
  deliverables: string[];
  requirements: string[];
  consultationRequired: boolean;
};

export type PhysicalProductFormData = {
  type: "PHYSICAL";
  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  itemId: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  price: { amount: number; currency: string };
  discount: { amount: number; currency: string };
  theme?: string;
  season?: string;
  occasion?: string;
  tags: string[];
  featured: boolean;
  slug: string;
  images?: File[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
};

export type ProductFormData = ServiceProductFormData | DigitalProductFormData | PhysicalProductFormData;

export interface MenuStructure {
  _id: string;
  title: string;
  subCategories: {
    _id: string;
    title: string;
    items: {
      _id: string;
      title: string;
    }[];
  }[];
} 