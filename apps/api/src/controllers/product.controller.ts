import { Request, Response } from "express";
import { Product, PhysicalProduct, DigitalProduct, ServiceProduct, Image, ProductImage, Menu, SubCategory, Item } from "@chariot/db";
import mongoose from "mongoose";

export const productController = {
  // Create a new product
  createProduct: async (req: Request, res: Response) => {
    try {
      const productData = {
        ...req.body,
        status: 'PENDING',
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
        status: 'ACTIVE',
        isAdminApproved: true
      }).populate(
        {
          path: 'categoryId',
          model: 'Menu'
        }).populate({
          path: 'subCategoryId',
          model: 'SubCategory'
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
            path: 'subCategoryId',
            model: 'SubCategory'
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

  getProductsBySubCategory: async (req: Request, res: Response) => {
    try {
      const { subCategorySlug } = req.params;
      const { page = 1, limit = 12 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const subCategory = await SubCategory.findOne({ slug: subCategorySlug });
      if (!subCategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      const [products, total] = await Promise.all([
        Product.find({ subCategoryId: subCategory._id })
          .populate({
            path: 'categoryId',
            model: 'Menu'
          })
          .populate({
            path: 'subCategoryId',
            model: 'SubCategory'
          })
          .populate({
            path: 'itemId',
            model: 'Item'
          })
          .populate('images')
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }),
        Product.countDocuments({ subCategoryId: subCategory._id })
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
            path: 'subCategoryId',
            model: 'SubCategory'
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
      console.log("products", products);
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

  getProductsByCategoryAndSubCategory: async (req: Request, res: Response) => {
    try {
      const { categorySlug, subCategorySlug } = req.params;
      const { page = 1, limit = 12 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const [category, subCategory] = await Promise.all([
        Menu.findOne({ slug: categorySlug }),
        SubCategory.findOne({ slug: subCategorySlug })
      ]);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (!subCategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      const [products, total] = await Promise.all([
        Product.find({ 
          categoryId: category._id,
          subCategoryId: subCategory._id 
        })
          .populate({
            path: 'categoryId',
            model: 'Menu'
          })
          .populate({
            path: 'subCategoryId',
            model: 'SubCategory'
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
          subCategoryId: subCategory._id 
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

  getProductsByAllLevels: async (req: Request, res: Response) => {
    try {
      const { categorySlug, subCategorySlug, itemSlug } = req.params;
      const { page = 1, limit = 12 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const [category, subCategory, item] = await Promise.all([
        Menu.findOne({ slug: categorySlug }),
        SubCategory.findOne({ slug: subCategorySlug }),
        Item.findOne({ slug: itemSlug })
      ]);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      if (!subCategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const [products, total] = await Promise.all([
        Product.find({ 
          categoryId: category._id,
          subCategoryId: subCategory._id,
          itemId: item._id
        })
          .populate({
            path: 'categoryId',
            model: 'Menu'
          })
          .populate({
            path: 'subCategoryId',
            model: 'SubCategory'
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
          subCategoryId: subCategory._id,
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
      const { slug } = req.params;
      const product = await Product.findOne({ slug }).populate({
        path: 'categoryId',
        model: 'Menu'
      }).populate({
        path: 'subCategoryId',
        model: 'SubCategory'
      }).populate({
        path: 'itemId',
        model: 'Item'
      }).populate('images');
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({
        message: "Product retrieved successfully",
        product: product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving product",
        error: errorMessage,
      });
    }
  }
};