import mongoose, { Model, Schema, Types } from "mongoose";

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
  type: string;

  sellerId: Types.ObjectId;

  price: {
    amount: number;
    currency: string;
  };

  discount?: {
    amount: number;
    currency: string;
  };

  theme?: string;
  season?: string;
  occasion?: string;

  tags: string[];
  featured: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  images: Types.ObjectId[]; 

  seo?: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };

  slug: string;
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
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
      amount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        required: true,
      },
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
      required: true,
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
  },
  {
    timestamps: true,
    discriminatorKey: "type",
  }
);

export const Product = mongoose.model<IProduct>("Product", baseProductSchema);

interface IDigitalProduct extends IProduct {
  kind: string; // video, audio, image, pdf, etc.

  assetDetails: {
    file: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  };

  downloadLink: string;
  downloadLinkExpiry: Date;
}

const digitalProductSchema = new mongoose.Schema<IDigitalProduct>(
  {
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
    downloadLink: {
      type: String,
      required: true,
    },
    downloadLinkExpiry: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    discriminatorKey: "kind",
  }
);

export const DigitalProduct = Product.discriminator<IDigitalProduct>(
  "DigitalProduct",
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
  deliverables: [String];
  requirements: [String];
  consultaionRequired: boolean;
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
  consultaionRequired: {
    type: Boolean,
    default: false,
  },
});

export const ServiceProduct = Product.discriminator<IServiceProduct>(
  "ServiceProduct",
  serviceProductSchema
);
