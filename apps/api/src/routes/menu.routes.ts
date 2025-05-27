import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';

const router: Router = Router();

// Get full menu structure
router.get('/structure', menuController.getFullMenuStructure);

// Get items by subcategory ID
router.get('/subcategory/:subCategoryId/items', menuController.getItemsBySubCategoryId);

// Get items by subcategory slug
router.get('/subcategory/slug/:slug/items', menuController.getItemsBySubCategorySlug);

// Get subcategory by slug
router.get('/subcategory/slug/:slug', menuController.getSubCategoryBySlug);

// Create category
router.post('/category', menuController.createCategory);

// Get all category titles
router.get('/categories/titles', menuController.getAllCategoriesTitles);

// Get category ID by title
router.get('/category/title/:title', menuController.getCategoryIdByTitle);

// Create subcategory
router.post('/subcategory', menuController.createSubCategory);

// Get all subcategory titles
router.get('/subcategories/titles', menuController.getAllSubCategoriesTitles);

// Get subcategory ID by title
router.get('/subcategory/title/:title', menuController.getSubCategoryIdByTitle);

// Create item(s)
router.post('/items', menuController.createItem);

// Check title uniqueness
router.get('/check-category-title/:title', menuController.checkCategoryTitleUnique);
router.get('/check-subcategory-title/:title', menuController.checkSubCategoryTitleUnique);
router.get('/check-item-title/:title', menuController.checkItemTitleUnique);

export default router; 