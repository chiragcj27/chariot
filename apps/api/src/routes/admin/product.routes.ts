import { Router } from "express";
import { adminProductController } from "../../controllers/admin/product.controller";
import { isAdmin } from "../../middleware/adminAuth";

const router = Router();

// Get all pending products
router.get("/pending", isAdmin, adminProductController.getPendingProducts);

// Approve a product
router.post("/:productId/approve", isAdmin, adminProductController.approveProduct);

// Reject a product
router.post("/:productId/reject", isAdmin, adminProductController.rejectProduct);

export default router; 