import { Request, Response } from "express";
import { s3Service } from "../services/s3.service";

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
      const userId = req.user?.id; // From auth middleware

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

      // Get the product to find the ZIP file key
      const { DigitalProduct } = await import("@chariot/db");
      const product = await DigitalProduct.findById(productId) as any;
      
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      // Check if product has a ZIP file
      if (!product.zipFile?.key) {
        return res.status(404).json({
          message: "Digital product file not found"
        });
      }

      // TODO: Check if user has purchased this product
      // This will be implemented when we create the order system
      // For now, we'll just check if the user is authenticated
      
      const downloadData = await s3Service.getDigitalProductDownloadUrl(productId, userId, product.zipFile.key);
      res.status(200).json(downloadData);
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