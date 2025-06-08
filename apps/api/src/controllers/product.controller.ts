import { Request, Response } from "express";
import { Product, DigitalProduct, ServiceProduct } from "@chariot/db";
import mongoose from "mongoose";

export const productController = {
  // Create a new product
  createProduct: async (req: Request, res: Response) => {
    try {
      const productData = req.body;
      const product = await Product.create(productData);
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

  // Get all products with pagination and filters
  getAllProducts: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const type = req.query.type as string;
      const categoryId = req.query.categoryId as string;
      const sellerId = req.query.sellerId as string;
      const itemId = req.query.itemId as string;

      const query: any = {};
      if (status) query.status = status;
      if (type) query.type = type;
      if (categoryId) query.categoryId = new mongoose.Types.ObjectId(categoryId);
      if (sellerId) query.sellerId = new mongoose.Types.ObjectId(sellerId);
      if (itemId) query.itemId = new mongoose.Types.ObjectId(itemId);

      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("categoryId")
        .populate("subCategoryId")
        .populate("itemId")
        .populate("sellerId")
        .populate("images");

      const total = await Product.countDocuments(query);

      res.status(200).json({
        message: "Products retrieved successfully",
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving products",
        error: errorMessage,
      });
    }
  },

  // Get a single product by ID
  getProductById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id)
        .populate("categoryId")
        .populate("subCategoryId")
        .populate("itemId")
        .populate("sellerId")
        .populate("images");

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product retrieved successfully",
        product,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving product",
        error: errorMessage,
      });
    }
  },

  // Update a product
  updateProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const product = await Product.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate("categoryId")
        .populate("subCategoryId")
        .populate("itemId")
        .populate("sellerId")
        .populate("images");

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product updated successfully",
        product,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error updating product",
        error: errorMessage,
      });
    }
  },

  // Delete a product
  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product deleted successfully",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error deleting product",
        error: errorMessage,
      });
    }
  },

  // Get products by seller
  getProductsBySeller: async (req: Request, res: Response) => {
    try {
      const { sellerId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const products = await Product.find({ sellerId: new mongoose.Types.ObjectId(sellerId) })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("categoryId")
        .populate("subCategoryId")
        .populate("itemId")
        .populate("images");

      const total = await Product.countDocuments({ sellerId: new mongoose.Types.ObjectId(sellerId) });

      res.status(200).json({
        message: "Seller products retrieved successfully",
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving seller products",
        error: errorMessage,
      });
    }
  },

  // Get featured products
  getFeaturedProducts: async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const products = await Product.find({ featured: true, status: "active" })
        .limit(limit)
        .populate("categoryId")
        .populate("subCategoryId")
        .populate("itemId")
        .populate("sellerId")
        .populate("images");

      res.status(200).json({
        message: "Featured products retrieved successfully",
        products,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving featured products",
        error: errorMessage,
      });
    }
  },

  // Search products
  searchProducts: async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tags: { $in: [new RegExp(query as string, "i")] } },
        ],
        status: "active",
      };

      const products = await Product.find(searchQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("categoryId")
        .populate("subCategoryId")
        .populate("itemId")
        .populate("sellerId")
        .populate("images");

      const total = await Product.countDocuments(searchQuery);

      res.status(200).json({
        message: "Products search completed successfully",
        products,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error searching products",
        error: errorMessage,
      });
    }
  },

  // Update product status
  updateProductStatus: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const product = await Product.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      res.status(200).json({
        message: "Product status updated successfully",
        product,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error updating product status",
        error: errorMessage,
      });
    }
  },
};
