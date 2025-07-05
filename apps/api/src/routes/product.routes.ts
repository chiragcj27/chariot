import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { landingController } from "../controllers/landing.controller";
import { isSeller } from "../middleware/sellerAuth";

const router: Router = Router();

// Create a new product
router.post("/", isSeller, productController.createProduct);

// Save product image
router.post("/images", isSeller, productController.storeProductImage);

// Get all products
router.get("/", productController.getAllProducts);

// Get featured products
router.get("/featured", landingController.getFeaturedProducts);

// Get products by category slug
router.get("/category/:categorySlug", productController.getProductsByCategory);

// Get products by item slug
router.get("/item/:itemSlug", productController.getProductsByItem);

// Get products by category and item slugs
router.get("/category/:categorySlug/item/:itemSlug", productController.getProductsByCategoryAndItem);

// Get product by slug (requires category and item context)
router.get("/category/:categorySlug/item/:itemSlug/product/:productSlug", productController.getProductBySlug);

// Update product
router.put("/:productId", isSeller, productController.updateProduct);

// Delete product
router.delete("/:productId", isSeller, productController.deleteProduct);

// Admin approval/rejection routes
router.put("/:productId/approve", productController.approveProduct);
router.put("/:productId/reject", productController.rejectProduct);

export default router;


