import { Order, PaymentStatus, OrderStatus } from "@chariot/db";
import mongoose from "mongoose";

export interface PurchaseVerificationResult {
  hasPurchased: boolean;
  orderId?: string;
  orderNumber?: string;
  purchaseDate?: Date;
  downloadCount?: number;
  lastDownloadDate?: Date;
}

export const purchaseVerificationService = {
  /**
   * Verify if a user has purchased a specific digital product or kit product
   */
  async verifyPurchase(userId: string, productId: string): Promise<PurchaseVerificationResult> {
    try {
      // Find orders where the user has purchased this product
      // Allow more flexible status checking - any order that's not cancelled or refunded
      const order = await Order.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        "items.productId": new mongoose.Types.ObjectId(productId),
        paymentStatus: PaymentStatus.COMPLETED,
        status: { $nin: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
      }).sort({ createdAt: -1 }); // Get the most recent purchase

      if (!order) {
        return {
          hasPurchased: false
        };
      }

      // Find the specific item in the order
      const orderItem = order.items.find(item => 
        item.productId.toString() === productId
      );

      if (!orderItem) {
        return {
          hasPurchased: false
        };
      }
      return {
        hasPurchased: true,
        orderId: (order._id as unknown as mongoose.Types.ObjectId).toString(),
        orderNumber: order.orderNumber,
        purchaseDate: order.createdAt,
        downloadCount: 0, // TODO: Implement download tracking
        lastDownloadDate: undefined // TODO: Implement download tracking
      };
    } catch (error) {
      console.error('[Purchase Verification] Error verifying purchase:', error);
      throw new Error('Failed to verify purchase');
    }
  },

  /**
   * Get all digital products and kit products purchased by a user
   */
  async getUserDigitalProducts(userId: string): Promise<Array<{
    productId: string;
    productName: string;
    productType: 'digital' | 'kit';
    orderId: string;
    orderNumber: string;
    purchaseDate: Date;
    downloadCount: number;
    lastDownloadDate?: Date;
  }>> {
    try {
      const orders = await Order.find({
        userId: new mongoose.Types.ObjectId(userId),
        paymentStatus: PaymentStatus.COMPLETED,
        status: { $nin: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
      }).populate('items.productId');

      const downloadableProducts: Array<{
        productId: string;
        productName: string;
        productType: 'digital' | 'kit';
        orderId: string;
        orderNumber: string;
        purchaseDate: Date;
        downloadCount: number;
        lastDownloadDate?: Date;
      }> = [];

      for (const order of orders) {
        for (const item of order.items) {
          // Check if this is a digital product or kit product
          if (item.productId && typeof item.productId === 'object' && 'type' in item.productId) {
            const product = item.productId as any;
            if (product.type === 'digital' || product.type === 'kit') {
              downloadableProducts.push({
                productId: product._id.toString(),
                productName: item.productName,
                productType: product.type,
                orderId: (order._id as unknown as mongoose.Types.ObjectId).toString(),
                orderNumber: order.orderNumber,
                purchaseDate: order.createdAt,
                downloadCount: 0, // TODO: Implement download tracking
                lastDownloadDate: undefined // TODO: Implement download tracking
              });
            }
          }
        }
      }

      return downloadableProducts;
    } catch (error) {
      console.error('Error getting user downloadable products:', error);
      throw new Error('Failed to get user downloadable products');
    }
  },

  /**
   * Log a download attempt for security and analytics
   */
  async logDownload(userId: string, productId: string, orderId: string, ipAddress?: string): Promise<void> {
    try {
      // TODO: Implement download logging
      // This could be stored in a separate collection for analytics
    } catch (error) {
      console.error('Error logging download:', error);
      // Don't throw error as this is not critical for the download process
    }
  }
};
