import { Router } from "express";
import { productController } from "../controllers/product.controller";

const router: Router = Router();

// Create a new product
router.post("/", productController.createProduct);

// Save product image
router.post("/images", productController.storeProductImage);

// Get all products
router.get("/", productController.getAllProducts);

// Get products by category
router.get("/category/:categoryId", productController.getProductsByCategory);

// Get products by subcategory
router.get("/subcategory/:subCategoryId", productController.getProductsBySubCategory);

// Get products by item
router.get("/item/:itemId", productController.getProductsByItem);

// Get products by category and subcategory
router.get("/category/:categoryId/subcategory/:subCategoryId", productController.getProductsByCategoryAndSubCategory);

// Get products by all levels (category, subcategory, and item)
router.get("/category/:categoryId/subcategory/:subCategoryId/item/:itemId", productController.getProductsByAllLevels);

export default router;


