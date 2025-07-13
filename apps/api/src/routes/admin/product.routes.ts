import { Router } from "express";
import { adminProductController } from "../../controllers/admin/product.controller";
import { isAdmin } from "../../middleware/adminAuth";

const router = Router();

// Get all pending products
router.get("/pending", isAdmin, adminProductController.getPendingProducts);

// List products with optional seller and name search
router.get("/", isAdmin, adminProductController.listProducts);

// Approve a product
router.post("/:productId/approve", isAdmin, adminProductController.approveProduct);

// Reject a product
router.post("/:productId/reject", isAdmin, adminProductController.rejectProduct);

// Update related products for a product
router.patch("/:productId/related-products", isAdmin, adminProductController.updateRelatedProducts);

// Get a single product by ID
router.get("/:productId", isAdmin, adminProductController.getProductById);

export default router; 