import mongoose, { model, Model, Schema, Types } from "mongoose";

export enum ProductType {
  PHYSICAL = "physical",
  DIGITAL = "digital",
  SERVICE = "service",
}

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DRAFT = "draft",
  ARCHIVED = "archived",
  DELETED = "deleted",
  PENDING = "pending",
  REJECTED = "rejected",
}

export interface IProduct {
  name: string;
  description: string;
  categoryId: Types.ObjectId;
  subCategoryId: Types.ObjectId;
  itemId: Types.ObjectId;
  type: ProductType;

  price: {
    amount: number;
    currency: string;
  };

  discount?: {
    percentage: number;
  };

  theme?: string;
  season?: string;
  occasion?: string;

  tags: string[];
  featured: boolean;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;

  images: Types.ObjectId[]; 

  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };

  slug: string;

  isAdminApproved: boolean;
  isAdminRejected: boolean;
  adminRejectionReason: string;
  adminApprovedAt: Date;
  adminRejectedAt: Date;
  sellerId: Types.ObjectId;
}

const baseProductSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ProductType),
      required: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
    },
    discount: {
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      }
    },
    theme: {
      type: String,
    },
    season: {
      type: String,
    },
    occasion: {
      type: String,
    },
    tags: {
      type: [String],
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    images: {
      type: [Schema.Types.ObjectId],
      ref: "Image",
      required: false,
    },
    seo: {
      metaTitle: {
        type: String,
      },
      metaDescription: {
        type: String,
      },
      metaKeywords: {
        type: [String],
      },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    isAdminApproved: {
      type: Boolean,
      default: false,
    },
    isAdminRejected: {
      type: Boolean,
      default: false,
    },
    adminRejectionReason: {
      type: String,
    },
    adminApprovedAt: {
      type: Date,
    },
    adminRejectedAt: {
      type: Date,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "type",
  }
);

// Clear existing models if they exist
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}
if (mongoose.models.physical) {
  delete mongoose.models.physical;
}
if (mongoose.models.digital) {
  delete mongoose.models.digital;
}
if (mongoose.models.service) {
  delete mongoose.models.service;
}

// Check if model exists before creating
export const Product = model<IProduct>("Product", baseProductSchema);

interface IPhysicalProduct extends IProduct {
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  stock: number;
}

const physicalProductSchema = new mongoose.Schema<IPhysicalProduct>({
  dimensions: {
    length: {
      type: Number,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    unit: {
      type: String,
    },
  },
  weight: {
    value: {
      type: Number,
    },
    unit: {
      type: String,
    },
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Check if model exists before creating discriminator
export const PhysicalProduct = Product.discriminator<IPhysicalProduct>(
  "physical",
  physicalProductSchema
);

interface IDigitalProduct extends IProduct {
  kind: string;
  assetDetails: {
    file: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  };
}

const digitalProductSchema = new mongoose.Schema<IDigitalProduct>({
  kind: {
    type: String,
    required: true,
  },
  assetDetails: {
    file: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
  },

});

// Check if model exists before creating discriminator
export const DigitalProduct = Product.discriminator<IDigitalProduct>(
  "digital",
  digitalProductSchema
);

interface IServiceProduct extends IProduct {
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
}

const serviceProductSchema = new mongoose.Schema<IServiceProduct>({
  deliveryTime: {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  revisions: {
    allowed: {
      type: Number,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  deliverables: {
    type: [String],
  },
  requirements: {
    type: [String],
  },
  consultationRequired: {
    type: Boolean,
    default: false,
  },
});

// Check if model exists before creating discriminator
export const ServiceProduct = Product.discriminator<IServiceProduct>(
  "service",
  serviceProductSchema
);