import { Request, Response } from "express";
import { Product } from "@chariot/db";

export const adminProductController = {
  // Get all pending products
  getPendingProducts: async (req: Request, res: Response) => {
    try {
      const pendingProducts = await Product.find({
        status: 'pending',
        isAdminApproved: false,
        isAdminRejected: false
      }).populate('sellerId', 'name email');

      res.status(200).json({
        message: "Pending products retrieved successfully",
        products: pendingProducts,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving pending products",
        error: errorMessage,
      });
    }
  },

  // Approve a product
  approveProduct: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params; 

      const product = await Product.findByIdAndUpdate(
        productId,
        {
          status: 'active',
          isAdminApproved: true,
          isAdminRejected: false,
          adminApprovedAt: new Date(),
          adminRejectedAt: null,
          adminRejectionReason: null
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
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

  // Reject a product
  rejectProduct: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({
          message: "Rejection reason is required",
        });
      }

      const product = await Product.findByIdAndUpdate(
        productId,
        {
          status: 'REJECTED',
          isAdminApproved: false,
          isAdminRejected: true,
          adminApprovedAt: null,
          adminRejectedAt: new Date(),
          adminRejectionReason: reason
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
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

  // Update related products for a product
  updateRelatedProducts: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const { relatedProductsId } = req.body;
      if (!Array.isArray(relatedProductsId)) {
        return res.status(400).json({ message: "relatedProductsId must be an array of product IDs" });
      }
      const product = await Product.findByIdAndUpdate(
        productId,
        { relatedProductsId },
        { new: true }
      );
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(200).json({
        message: "Related products updated successfully",
        product,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error updating related products",
        error: errorMessage,
      });
    }
  },

  // Get a single product by ID
  getProductById: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      const product = await Product.findById(productId)
        .populate('sellerId', 'name email')
        .populate('categoryId', 'title slug')
        .populate('itemId', 'title slug')
        .populate('images');

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
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving product",
        error: errorMessage,
      });
    }
  },

  // List products with optional seller, name, and status search
  listProducts: async (req: Request, res: Response) => {
    try {
      const { sellerId, name, status, page = 1, limit = 20 } = req.query;
      const filter: any = {};
      
      if (sellerId) {
        filter.sellerId = sellerId;
      }
      if (name) {
        filter.name = { $regex: name, $options: 'i' };
      }
      if (status) {
        // Handle different status values
        switch (status.toString().toLowerCase()) {
          case 'pending':
            filter.status = 'pending';
            filter.isAdminApproved = false;
            filter.isAdminRejected = false;
            break;
          case 'active':
            filter.status = 'active';
            filter.isAdminApproved = true;
            break;
          case 'rejected':
            filter.status = 'REJECTED';
            filter.isAdminRejected = true;
            break;
          default:
            // If status is not recognized, don't filter by status
            break;
        }
      }
      
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const products = await Product.find(filter)
        .populate('sellerId', 'name email')
        .sort({ createdAt: -1 }) // Sort by newest first
        .skip(skip)
        .limit(parseInt(limit as string));
      const total = await Product.countDocuments(filter);
      
      res.status(200).json({
        message: "Products retrieved successfully",
        products,
        pagination: {
          currentPage: parseInt(page as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
          totalProducts: total,
          hasNext: skip + products.length < total,
          hasPrev: parseInt(page as string) > 1,
        },
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving products",
        error: errorMessage,
      });
    }
  }
}; 