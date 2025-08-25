import { Request, Response } from "express";
import { s3Service } from "../services/s3.service";
import { purchaseVerificationService } from "../services/purchaseVerification.service";

export const assetController = {
  async getUploadUrl(req: Request, res: Response) {
    try {
      const { fileName, fileType, folder } = req.body;

      if (!fileName || !fileType || !folder) {
        return res.status(400).json({
          message: "File name and file type are required"
        });
      }

      const uploadData = await s3Service.getUploadUrl(fileName, fileType, folder);
      res.status(200).json(uploadData);
    } catch (error) {
      console.error('Error in getUploadUrl:', error);
      res.status(500).json({
        message: "Error generating upload URL",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  },

  async getZipUploadUrl(req: Request, res: Response) {
    try {
      const { fileName, fileType, folder } = req.body;

      if (!fileName || !fileType || !folder) {
        return res.status(400).json({
          message: "File name and file type are required"
        });
      }

      // Validate that it's a ZIP file
      if (fileType !== 'application/zip' && !fileName.endsWith('.zip')) {
        return res.status(400).json({
          message: "Only ZIP files are allowed for digital products"
        });
      }

      const uploadData = await s3Service.getZipUploadUrl(fileName, fileType, folder);
      res.status(200).json(uploadData);
    } catch (error) {
      console.error('Error in getZipUploadUrl:', error);
      res.status(500).json({
        message: "Error generating ZIP upload URL",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  },

  async deleteAsset(req: Request, res: Response) {
    try {
      const { key } = req.body;
      const deleteResponse = await s3Service.deleteAsset(key);
      res.status(200).json({
        message: "Asset deleted successfully",
        deleteResponse
      });
    } catch (error) {
      console.error('Error in deleteAsset:', error);
      res.status(500).json({
        message: "Error deleting asset",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  },

  async deletePrivateAsset(req: Request, res: Response) {
    try {
      const { key } = req.body;
      const deleteResponse = await s3Service.deletePrivateAsset(key);
      res.status(200).json({
        message: "Private asset deleted successfully",
        deleteResponse
      });
    } catch (error) {
      console.error('Error in deletePrivateAsset:', error);
      res.status(500).json({
        message: "Error deleting private asset",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  },

  async getDigitalProductDownloadUrl(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const userId = req.user?.userId; // From auth middleware
      const ipAddress = req.ip || req.connection.remoteAddress;

      if (!userId) {
        return res.status(401).json({
          message: "Authentication required"
        });
      }

      if (!productId) {
        return res.status(400).json({
          message: "Product ID is required"
        });
      }

      // Get the product to find the ZIP file key (check both digital and kit products)
      const { Product, DigitalProduct, KitProduct } = await import("@chariot/db");
      let product = await DigitalProduct.findById(productId) as any;
      let productType = 'digital';
      let zipFileKey = null;
      let productName = null;

      // If not found as digital product, check if it's a kit product
      if (!product) {
        product = await KitProduct.findById(productId) as any;
        if (product) {
          productType = 'kit';
          zipFileKey = product.kitMainFile?.key;
          productName = product.name;
        }
      } else {
        zipFileKey = product.zipFile?.key;
        productName = product.name;
      }
      
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      // Check if product has a ZIP file
      if (!zipFileKey) {
        return res.status(404).json({
          message: `${productType === 'digital' ? 'Digital product' : 'Kit'} file not found`
        });
      }

      // Verify purchase using the purchase verification service
      const purchaseVerification = await purchaseVerificationService.verifyPurchase(userId, productId);

      if (!purchaseVerification.hasPurchased) {
        return res.status(403).json({
          message: "You need to purchase this product to download it"
        });
      }

      // Log the download attempt for security
      if (purchaseVerification.orderId) {
        await purchaseVerificationService.logDownload(userId, productId, purchaseVerification.orderId, ipAddress);
      }
      
      const downloadData = await s3Service.getDigitalProductDownloadUrl(productId, userId, zipFileKey);
      
      // Add purchase information to the response
      res.status(200).json({
        ...downloadData,
        productType,
        productName,
        purchaseInfo: {
          orderNumber: purchaseVerification.orderNumber,
          purchaseDate: purchaseVerification.purchaseDate,
          downloadCount: purchaseVerification.downloadCount
        }
      });
    } catch (error) {
      console.error('Error in getDigitalProductDownloadUrl:', error);
      res.status(500).json({
        message: "Error generating download URL",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  }

}; 