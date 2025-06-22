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

// Get products by subcategory slug
router.get("/subcategory/:subCategorySlug", productController.getProductsBySubCategory);

// Get products by item slug
router.get("/item/:itemSlug", productController.getProductsByItem);

// Get products by category and subcategory slugs
router.get("/category/:categorySlug/subcategory/:subCategorySlug", productController.getProductsByCategoryAndSubCategory);

// Get products by all levels (category, subcategory, and item slugs)
router.get("/category/:categorySlug/subcategory/:subCategorySlug/item/:itemSlug", productController.getProductsByAllLevels);

// Get product by slug
router.get("/slug/:slug", productController.getProductBySlug);

export default router;


