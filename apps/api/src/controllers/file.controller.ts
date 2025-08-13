import { Request, Response } from "express";
import { File, PdfFile, DocumentFile, ZipFile, Product } from "@chariot/db";
import { s3Service } from "../services/s3.service";
import mongoose from "mongoose";

export const fileController = {
  // Store kit preview file metadata (public bucket - for display)
  storeKitPreviewFile: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // Validate required fields
      if (!data.filename || !data.originalname || !data.url || !data.size || !data.mimetype || !data.productId) {
        return res.status(400).json({
          message: "Missing required fields",
          required: ['filename', 'originalname', 'url', 'size', 'mimetype', 'productId']
        });
      }

      // Validate file type - only allow preview files (PDF, images, documents, not ZIP)
      const allowedTypes = ['pdf', 'document'];
      if (!allowedTypes.includes(data.fileType)) {
        return res.status(400).json({
          message: "Invalid file type for preview. Only PDF and documents allowed.",
          allowedTypes
        });
      }

      // Validate status if provided
      if (data.status && !['pending', 'uploaded', 'failed'].includes(data.status)) {
        return res.status(400).json({
          message: "Invalid status value",
          validStatuses: ['pending', 'uploaded', 'failed']
        });
      }

      let file;

      // Create the appropriate file type based on fileType
      switch (data.fileType) {
        case 'pdf':
          file = new PdfFile({
            ...data,
            fileType: "pdf",
            productId: new mongoose.Types.ObjectId(data.productId),
            pageCount: data.pageCount,
            isPreview: true, // Always true for preview files
            filename: data.filename,
            originalname: data.originalname,
            url: data.url,
            size: data.size,
            mimetype: data.mimetype,
            status: data.status || 'pending'
          });
          break;
        case 'document':
          file = new DocumentFile({
            ...data,
            fileType: "document",
            productId: new mongoose.Types.ObjectId(data.productId),
            documentType: data.documentType || 'other',
            isPreview: true, // Always true for preview files
            filename: data.filename,
            originalname: data.originalname,
            url: data.url,
            size: data.size,
            mimetype: data.mimetype,
            status: data.status || 'pending'
          });
          break;
        default:
          return res.status(400).json({
            message: "Unsupported file type for preview"
          });
      }

      await file.save();

      // Add file to product's kitFiles array (preview files)
      const product = await Product.findById(data.productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // Check if product is a kit product
      if (!product.isKitProduct) {
        return res.status(400).json({
          message: "Preview files can only be added to kit products",
        });
      }

      // Add file to kitFiles array
      const kitProduct = product as any;
      if (!kitProduct.kitFiles) {
        kitProduct.kitFiles = [];
      }
      kitProduct.kitFiles.push(file._id as mongoose.Types.ObjectId);
      await kitProduct.save();

      res.status(201).json({
        message: "Kit preview file created successfully",
        file,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error creating kit preview file",
        error: errorMessage
      });
    }
  },

  // Store kit main ZIP file metadata (private bucket - for download)
  storeKitMainFile: async (req: Request, res: Response) => {
    try {
      const data = req.body;
      
      // Validate required fields
      if (!data.filename || !data.originalname || !data.url || !data.size || !data.mimetype || !data.productId) {
        return res.status(400).json({
          message: "Missing required fields",
          required: ['filename', 'originalname', 'url', 'size', 'mimetype', 'productId']
        });
      }

      // Only allow ZIP files for main kit file
      if (data.fileType !== 'zip') {
        return res.status(400).json({
          message: "Main kit file must be a ZIP file"
        });
      }

      // Validate status if provided
      if (data.status && !['pending', 'uploaded', 'failed'].includes(data.status)) {
        return res.status(400).json({
          message: "Invalid status value",
          validStatuses: ['pending', 'uploaded', 'failed']
        });
      }

      // Create ZIP file (main kit file)
      const file = new ZipFile({
        ...data,
        fileType: "zip",
        productId: new mongoose.Types.ObjectId(data.productId),
        containsFiles: data.containsFiles,
        isPreview: false, // Always false for main files
        filename: data.filename,
        originalname: data.originalname,
        url: data.url,
        size: data.size,
        mimetype: data.mimetype,
        status: data.status || 'pending'
      });

      await file.save();

      // Update product with main kit file (similar to digital product zipFile)
      const product = await Product.findById(data.productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // Check if product is a kit product
      if (!product.isKitProduct) {
        return res.status(400).json({
          message: "Main kit file can only be added to kit products",
        });
      }

      // Store main kit file reference (similar to digital product zipFile)
      (product as any).kitMainFile = {
        name: data.originalname,
        url: data.url,
        key: data.key || data.filename,
        size: data.size
      };

      await product.save();

      res.status(201).json({
        message: "Kit main file created successfully",
        file,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error creating kit main file",
        error: errorMessage
      });
    }
  },

  // Get kit files for a product
  getKitFiles: async (req: Request, res: Response) => {
    try {
      const { productId } = req.params;

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          message: "Valid product ID is required"
        });
      }

      const product = await Product.findById(productId).populate('kitFiles');
      
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (!product.isKitProduct) {
        return res.status(400).json({
          message: "This product is not a kit product"
        });
      }

      res.status(200).json({
        message: "Kit files retrieved successfully",
        files: (product as any).kitFiles || []
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error retrieving kit files",
        error: errorMessage
      });
    }
  },

  // Delete a kit file
  deleteKitFile: async (req: Request, res: Response) => {
    try {
      const { fileId, productId } = req.params;

      if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({
          message: "Valid file ID is required"
        });
      }

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          message: "Valid product ID is required"
        });
      }

      const file = await File.findById(fileId);
      if (!file) {
        return res.status(404).json({
          message: "File not found"
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (!product.isKitProduct) {
        return res.status(400).json({
          message: "This product is not a kit product"
        });
      }

      // Remove file from product's kitFiles array
      const kitProduct = product as any;
      if (kitProduct.kitFiles) {
        kitProduct.kitFiles = kitProduct.kitFiles.filter(
          (id: mongoose.Types.ObjectId) => id.toString() !== fileId
        );
        await kitProduct.save();
      }

      // Delete the file
      await File.findByIdAndDelete(fileId);

      res.status(200).json({
        message: "Kit file deleted successfully"
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        message: "Error deleting kit file",
        error: errorMessage
      });
    }
  },

  // Get kit main file download URL (similar to digital product download)
  getKitMainFileDownloadUrl: async (req: Request, res: Response) => {
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

      // Get the product to find the main kit file
      const product = await Product.findById(productId) as any;
      
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      if (!product.isKitProduct) {
        return res.status(400).json({
          message: "This product is not a kit product"
        });
      }

      // Check if product has a main kit file
      if (!product.kitMainFile?.key) {
        return res.status(404).json({
          message: "Kit main file not found"
        });
      }

      // TODO: Check if user has purchased this kit product
      // This will be implemented when we create the order system
      // For now, we'll just check if the user is authenticated
      
      const downloadData = await s3Service.getDigitalProductDownloadUrl(productId, userId, product.kitMainFile.key);
      res.status(200).json(downloadData);
    } catch (error) {
      console.error('Error in getKitMainFileDownloadUrl:', error);
      res.status(500).json({
        message: "Error generating download URL",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  }
}; 