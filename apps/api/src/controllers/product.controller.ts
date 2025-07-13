import { Request, Response } from "express";
import { Product, PhysicalProduct, DigitalProduct, ServiceProduct, Image, ProductImage, Menu, Item } from "@chariot/db";
import { ProductStatus } from "@chariot/db";
import mongoose from "mongoose";
import { s3Service } from "../services/s3.service";

// Utility function to create URL-friendly slugs
const createSlug = (str: string): string => {
  return str
    .toLowerCase()
    // Replace special characters with spaces
    .replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' ')
    // Replace multiple spaces with a single hyphen
    .replace(/\s+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Remove any non-alphanumeric characters except hyphens
    .replace(/[^a-z0-9-]/g, '');
};

export const productController = {
  // Create a new product
  createProduct: async (req: Request, res: Response) => {
    try {
      // Generate slug from product name
      const slug = createSlug(req.body.name);
      
      const productData = {
        ...req.body,
        sellerId: req.user.userId,
        slug: slug,
        status: 'pending',
        isAdminApproved: false,
        isAdminRejected: false
      };
      let product;

      // Use the appropriate model based on product type
      switch (productData.type) {
        case "physical":
          product = await PhysicalProduct.create(productData);
          break;
        case "digital":
          product = await DigitalProduct.create(productData);
          break;
        case "service":
          product = await ServiceProduct.create(productData);
          break;
        default:
          throw new Error(`Invalid product type: ${productData.type}`);
      }

      res.status(201).json({
        message: "Product created successfully",
        product,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error creating product",
        error: errorMessage,
      });
    }
  },

  storeProductImage: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      // Validate required fields
      if (!data.filename || !data.originalname || !data.url || !data.size || !data.mimetype || !data.productId) {
        return res.status(400).json({
          message: "Missing required fields",
          required: ['filename', 'originalname', 'url', 'size', 'mimetype', 'productId']
        });
      }

      // Validate status if provided
      if (data.status && !['pending', 'uploaded', 'failed'].includes(data.status)) {
        return res.status(400).json({
          message: "Invalid status value",
          validStatuses: ['pending', 'uploaded', 'failed']
        });
      }

      const image = new ProductImage({
        ...data,
        imageType: "product",
        productId: new mongoose.Types.ObjectId(data.productId),
        isMain: data.isMain || false,
        isThumbnail: data.isThumbnail || false,
        filename: data.filename,
        originalname: data.originalname,
        url: data.url,
        size: data.size,
        mimetype: data.mimetype,
        status: data.status || 'pending'
      });
      await image.save();

      const product = await Product.findById(data.productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      product.images.push(image._id as mongoose.Types.ObjectId);
      await product.save();

      res.status(201).json({
        message: "Product image created successfully",
        image,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error creating product image",
        error: errorMessage
      });
    }
  },

  getAllProducts: async (req: Request, res: Response) => {
    try {
      const products = await Product.find({
        status: 'active',
        isAdminApproved: true
      }).populate(
        {
          path: 'categoryId',
          model: 'Menu'
        }).populate({
          path: 'itemId',
          model: 'Item'
        }).populate('images');

      res.status(200).json({
        message: "Products retrieved successfully",
        products,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving products",
        error: errorMessage,
      });
    }
  },

  // Get seller's own products
  getSellerProducts: async (req: Request, res: Response) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const filter: any = { sellerId: req.user.userId };
      
      if (status && status !== 'all') {
        filter.status = status;
      }

      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate({
            path: 'categoryId',
            model: 'Menu'
          })
          .populate({
            path: 'itemId',
            model: 'Item'
          })
          .populate('images')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Product.countDocuments(filter)
      ]);

      res.status(200).json({
        message: "Seller products retrieved successfully",
        products,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalProducts: total,
          hasNext: skip + products.length < total,
          hasPrev: Number(page) > 1,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving seller products",
        error: errorMessage,
      });
    }
  },

  getProductsByCategory: async (req: Request, res: Response) => {
    try {
      const { categorySlug } = req.params;
      const { page = 1, limit = 12 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const category = await Menu.findOne({ slug: categorySlug });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const [products, total] = await Promise.all([
        Product.find({ categoryId: category._id })
          .populate({
            path: 'categoryId',
            model: 'Menu'
          })
          .populate({
            path: 'itemId',
            model: 'Item'
          })
          .populate('images')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Product.countDocuments({ categoryId: category._id })
      ]);
      
      res.status(200).json({
        message: "Products retrieved successfully",
        products,
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + products.length < total
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving products",
        error: errorMessage,
      });
    }
  },

  getProductsByItem: async (req: Request, res: Response) => {
    try {
      const { itemSlug } = req.params;
      const { page = 1, limit = 12 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const item = await Item.findOne({ slug: itemSlug });
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const [products, total] = await Promise.all([
        Product.find({ itemId: item._id })
          .populate({
            path: 'categoryId',
            model: 'Menu'
          })
          .populate({
            path: 'itemId',
            model: 'Item'
          })
          .populate('images')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Product.countDocuments({ itemId: item._id })
      ]);
      
      res.status(200).json({
        message: "Products retrieved successfully",
        products,
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + products.length < total
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving products",
        error: errorMessage,
      });
    }
  },

  getProductsByCategoryAndItem: async (req: Request, res: Response) => {
    try {
      const { categorySlug, itemSlug } = req.params;
      const { page = 1, limit = 12 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const [category, item] = await Promise.all([
        Menu.findOne({ slug: categorySlug }),
        Item.findOne({ slug: itemSlug })
      ]);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const [products, total] = await Promise.all([
        Product.find({
          categoryId: category._id,
          itemId: item._id
        })
          .populate({
            path: 'categoryId',
            model: 'Menu'
          })
          .populate({
            path: 'itemId',
            model: 'Item'
          })
          .populate('images')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Product.countDocuments({
          categoryId: category._id,
          itemId: item._id
        })
      ]);
      
      res.status(200).json({
        message: "Products retrieved successfully",
        products,
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + products.length < total
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving products",
        error: errorMessage,
      });
    }
  },

  getProductBySlug: async (req: Request, res: Response) => {
    try {
      const { categorySlug, itemSlug, productSlug } = req.params;
      
      const [category, item] = await Promise.all([
        Menu.findOne({ slug: categorySlug }),
        Item.findOne({ slug: itemSlug })
      ]);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const product = await Product.findOne({
        slug: productSlug,
        categoryId: category._id,
        itemId: item._id
      })
        .populate({
          path: 'categoryId',
          model: 'Menu'
        })
        .populate({
          path: 'itemId',
          model: 'Item'
        })
        .populate('images');

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({
        message: "Product retrieved successfully",
        product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving product",
        error: errorMessage,
      });
    }
  },

  // Get product by ID (for sellers to view their own products)
  getProductById: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      const product = await Product.findOne({
        _id: productId,
        sellerId: req.user.userId
      })
        .populate({
          path: 'categoryId',
          model: 'Menu'
        })
        .populate({
          path: 'itemId',
          model: 'Item'
        })
        .populate('images');

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({
        message: "Product retrieved successfully",
        product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving product",
        error: errorMessage,
      });
    }
  },

  updateProduct: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const updateData = req.body;
      
      console.log('Updating product:', productId);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const product = await Product.findById(productId).populate('images');
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      console.log('Current product status:', product.status);
      console.log('Current product images:', product.images);
      
      // Allow editing of all products, but set to pending for re-approval if not already draft/rejected
      const wasActiveOrPending = ["active", "pending"].includes(product.status);
      
      // If product was active or pending, set it to pending for re-approval
      if (wasActiveOrPending) {
        product.status = 'pending' as any;
        product.isAdminApproved = false;
        product.isAdminRejected = false;
        product.adminRejectionReason = '';
      }

      // Handle image cleanup if images are being updated
      if (updateData.images && Array.isArray(updateData.images)) {
        console.log('Processing images update');
        console.log('Current images:', product.images);
        console.log('New images:', updateData.images);
        
        // For now, just keep the existing images and don't delete any
        // This prevents the image deletion issue
        delete updateData.images;
      }

      // Handle digital asset cleanup if asset is being updated
      if (product.type === 'digital' && updateData.assetDetails) {
        const currentAssetFile = (product as any).assetDetails?.file;
        const newAssetFile = updateData.assetDetails.file;
        
        // If the asset file is being changed, delete the old one
        if (currentAssetFile && newAssetFile && currentAssetFile !== newAssetFile) {
          try {
            await s3Service.deleteAsset(currentAssetFile);
          } catch (s3Error) {
            console.error('Error deleting old digital asset from S3:', s3Error);
          }
        }
      }

      // Only allow status change to pending (resubmit for approval)
      if (updateData.status && updateData.status.toLowerCase() === 'pending') {
        product.status = 'pending' as any; // ProductStatus;
        product.isAdminApproved = false;
        product.isAdminRejected = false;
        product.adminRejectionReason = '';
      }
      
      // Update fields individually to avoid issues with Object.assign
      const fieldsToUpdate = [
        'name', 'description', 'type', 'categoryId', 'itemId', 'price', 
        'creditsCost', 'discountedCreditsCost', 'discount', 'theme', 'season', 
        'occasion', 'tags', 'featured', 'stock', 'deliverables', 'requirements', 
        'consultationRequired', 'seo', 'dimensions', 'weight', 
        'kind', 'assetDetails', 'deliveryTime', 'revisions', 'isKitProduct', 
        'kitId', 'typeOfKit'
      ];
      
      fieldsToUpdate.forEach(field => {
        if (updateData[field] !== undefined) {
          console.log(`Updating field ${field}:`, updateData[field]);
          (product as any)[field] = updateData[field];
        }
      });
      
      console.log('Saving product with data:', JSON.stringify(product.toObject(), null, 2));
      
      await product.save();
      console.log('Product saved successfully');
      
      res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
      console.error('Error updating product:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({ message: "Error updating product", error: errorMessage });
    }
  },

  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId).populate('images');

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete associated images from S3 and database
      if (product.images && product.images.length > 0) {
        for (const imageId of product.images) {
          const image = await Image.findById(imageId);
          if (image) {
            try {
              await s3Service.deleteAsset(image.filename);
            } catch (s3Error) {
              console.error('Error deleting image from S3:', s3Error);
            }
            await Image.findByIdAndDelete(imageId);
          }
        }
      }

      // Delete digital product asset if it exists
      if (product.type === 'digital' && (product as any).assetDetails?.file) {
        try {
          await s3Service.deleteAsset((product as any).assetDetails.file);
        } catch (s3Error) {
          console.error('Error deleting digital asset from S3:', s3Error);
        }
      }

      // Delete the product
      await Product.findByIdAndDelete(productId);

      res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error deleting product",
        error: errorMessage,
      });
    }
  },

  approveProduct: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      const product = await Product.findByIdAndUpdate(
        productId,
        {
          isAdminApproved: true,
          isAdminRejected: false,
          adminRejectionReason: null,
          adminApprovedAt: new Date(),
          status: 'ACTIVE'
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({
        message: "Product approved successfully",
        product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error approving product",
        error: errorMessage,
      });
    }
  },

  rejectProduct: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const product = await Product.findByIdAndUpdate(
        productId,
        {
          isAdminApproved: false,
          isAdminRejected: true,
          adminRejectionReason: reason,
          adminRejectedAt: new Date(),
          status: 'REJECTED'
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.status(200).json({
        message: "Product rejected successfully",
        product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error rejecting product",
        error: errorMessage,
      });
    }
  },
};