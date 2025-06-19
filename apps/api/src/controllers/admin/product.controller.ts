import { Request, Response } from "express";
import { Product } from "@chariot/db";

export const adminProductController = {
  // Get all pending products
  getPendingProducts: async (req: Request, res: Response) => {
    try {
      const pendingProducts = await Product.find({
        status: 'PENDING',
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
      const adminId = req.user._id; // Assuming you have user info in request from auth middleware

      const product = await Product.findByIdAndUpdate(
        productId,
        {
          status: 'ACTIVE',
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
      const adminId = req.user._id; // Assuming you have user info in request from auth middleware

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
  }
}; 