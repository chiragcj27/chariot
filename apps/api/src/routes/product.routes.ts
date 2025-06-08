import { Router } from "express";
import { productController } from "../controllers/product.controller";

const router: Router = Router();

// Create a new product
router.post("/", productController.createProduct);

// Get all products with pagination and filters
router.get("/", productController.getAllProducts);

// Get a single product by ID
router.get("/:id", productController.getProductById);

// Update a product
router.put("/:id", productController.updateProduct);

// Delete a product
router.delete("/:id", productController.deleteProduct);

// Get products by seller
router.get("/seller/:sellerId", productController.getProductsBySeller);

// Get featured products
router.get("/featured", productController.getFeaturedProducts);

// Search products
router.get("/search", productController.searchProducts);

// Update product status
router.patch("/:id/status", productController.updateProductStatus);

export default router;

