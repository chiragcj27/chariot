import { Request, Response } from "express";
import { Product, PhysicalProduct, DigitalProduct, ServiceProduct } from "@chariot/db/src/models/product.model";
import { Image, ProductImage } from "@chariot/db/src/models/image.model";
import mongoose from "mongoose";

export const productController = {
  // Create a new product
  createProduct: async (req: Request, res: Response) => {
    try {
      const productData = req.body;
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
      product.images.push(image._id);
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
      const products = await Product.find()
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
        .populate('images');
      
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
      const { categoryId } = req.params;
      
      const products = await Product.find({ categoryId })
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
        .populate('images');
      
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

  getProductsBySubCategory: async (req: Request, res: Response) => {
    try {
      const { subCategoryId } = req.params;
      
      const products = await Product.find({ subCategoryId })
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
        .populate('images');
      
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

  getProductsByItem: async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      
      const products = await Product.find({ itemId })
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
        .populate('images');
      
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

  getProductsByCategoryAndSubCategory: async (req: Request, res: Response) => {
    try {
      const { categoryId, subCategoryId } = req.params;
      
      const products = await Product.find({ 
        categoryId,
        subCategoryId 
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
        .populate('images');
      
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

  getProductsByAllLevels: async (req: Request, res: Response) => {
    try {
      const { categoryId, subCategoryId, itemId } = req.params;
      
      const products = await Product.find({ 
        categoryId,
        subCategoryId,
        itemId
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
        .populate('images');
      
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
  }
}