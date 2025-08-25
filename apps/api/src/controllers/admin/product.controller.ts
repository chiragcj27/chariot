import { Request, Response } from "express";
import { Product, KitProduct, DigitalProduct, PdfFile } from "@chariot/db";
import { heyzineService } from "../../services/heyzine.service";

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

      // Validate ObjectId format
      if (!productId || productId.length !== 24) {
        return res.status(400).json({
          message: "Invalid product ID format",
        });
      }

      // First, get the product with all its data
      const product = await Product.findById(productId)
        .populate('kitFiles')
        .populate('kitMainFile');

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // Check if product has PDF preview files for flipbook generation
      let flipbookUrl: string | undefined; // Legacy single URL
      let flipbookGenerated = false;
      let flipbookUrls: { fileId: string; url: string; fileName: string }[] = []; // Multiple URLs

      // Type assertion to handle product properties
      const productData = product as any; // Using any for now to handle the populated fields

      // Check for kit products with PDF preview files
      if (productData.isKitProduct && productData.kitFiles && productData.kitFiles.length > 0) {
        // Find PDF preview files
        const pdfPreviewFiles = productData.kitFiles.filter((file: any) => 
          file.fileType === 'pdf' && file.isPreview === true
        );

        if (pdfPreviewFiles.length > 0) {
          console.log(`Generating flipbooks for kit product ${productId} with ${pdfPreviewFiles.length} PDF preview files`);
          
          // Generate flipbook for each PDF preview file
          for (const pdfFile of pdfPreviewFiles) {
            try {
                             console.log(`Generating flipbook for PDF file: ${pdfFile.originalname || pdfFile.filename} (${pdfFile.url})`);

              // Generate flipbook using Heyzine service
              const heyzineResponse = await heyzineService.generateFlipbook(pdfFile.url);
              
              if (heyzineResponse.success && heyzineResponse.url) {
                                 flipbookUrls.push({
                   fileId: pdfFile._id?.toString() || '',
                   url: heyzineResponse.url,
                   fileName: pdfFile.originalname || pdfFile.filename || 'Unknown file'
                 });
                flipbookGenerated = true;
                                 console.log(`Flipbook generated successfully for ${pdfFile.originalname || pdfFile.filename}: ${heyzineResponse.url}`);
                             } else {
                 console.warn(`Heyzine service failed for file ${pdfFile.originalname || pdfFile.filename}:`, heyzineResponse.error);
               }
                         } catch (flipbookError) {
               console.error(`Error generating flipbook for file ${pdfFile.originalname || pdfFile.filename}:`, flipbookError);
              // Continue with other files even if one fails
            }
          }

          // Set the first flipbook URL as the legacy single URL for backward compatibility
          if (flipbookUrls.length > 0) {
            flipbookUrl = flipbookUrls[0]?.url;
          }
        } else {
          console.log(`No PDF preview files found for kit product ${productId}`);
        }
      }
      // Check for digital products with PDF preview files
      else if (productData.type === 'digital' && productData.previewFile) {
        try {
          console.log(`Generating flipbook for digital product ${productId} with preview file`);
          console.log(`Using PDF file: ${productData.previewFile.name} (${productData.previewFile.url})`);

          // Generate flipbook using Heyzine service
          const heyzineResponse = await heyzineService.generateFlipbook(productData.previewFile.url);
          
          if (heyzineResponse.success && heyzineResponse.url) {
            flipbookUrl = heyzineResponse.url;
            flipbookGenerated = true;
            // Add to flipbookUrls array for consistency
            flipbookUrls.push({
              fileId: 'preview-file',
              url: heyzineResponse.url,
              fileName: productData.previewFile.name
            });
            console.log(`Flipbook generated successfully: ${flipbookUrl}`);
          } else {
            console.warn(`Heyzine service failed for product ${productId}:`, heyzineResponse.error);
          }
        } catch (flipbookError) {
          console.error(`Error generating flipbook for product ${productId}:`, flipbookError);
          // Continue with product approval even if flipbook generation fails
        }
      } else {
        console.log(`No PDF preview files found for product ${productId}`);
      }

      // Update product with approval and flipbook URL if generated
      const updateData: any = {
        status: 'active',
        isAdminApproved: true,
        isAdminRejected: false,
        adminApprovedAt: new Date(),
        adminRejectedAt: null,
        adminRejectionReason: null,
      };

      // Add flipbook URLs if generated
      if (flipbookUrl) {
        updateData.flipbookUrl = flipbookUrl; // Legacy single URL
      }
      if (flipbookUrls.length > 0) {
        updateData.flipbookUrls = flipbookUrls; // Multiple URLs
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({
          message: "Product not found during update",
        });
      }

      res.status(200).json({
        message: "Product approved successfully",
        product: updatedProduct,
        flipbookGenerated,
        flipbookUrl: flipbookUrl || null, // Legacy single URL
        flipbookUrls: flipbookUrls, // Multiple URLs
      });
    } catch (error: unknown) {
      console.error("Error in approveProduct:", error);
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
        .populate('sellerId', 'name email role')
        .populate('categoryId', 'title slug')
        .populate('itemId', 'title slug description filters')
        .populate('images')
        .populate('kitImages')
        .populate('kitFiles')
        .populate('kitMainFile');

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
            filter.status = 'rejected';
            filter.isAdminRejected = true;
            break;
          default:
            // If status is not recognized, don't filter by status
            break;
        }
      }
      
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const products = await Product.find(filter)
        .populate('sellerId', 'name email role')
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