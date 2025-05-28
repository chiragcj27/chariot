import { Router } from 'express';
import { menuController } from '../controllers/menu.controller';

const router: Router = Router();

// Get full menu structure
router.get('/structure', menuController.getFullMenuStructure);

// Create category
router.post('/category', menuController.createCategory);

// Delete category
router.delete('/category/:categoryId', menuController.deleteCategory);

// Delete subcategory
router.delete('/subcategory/:subCategoryId', menuController.deleteSubCategory);

// Delete item
router.delete('/item/:itemId', menuController.deleteItem);

// Create subcategory
router.post('/subcategory', menuController.createSubCategory);

// Create item(s)
router.post('/items', menuController.createItem);

// Check title uniqueness
router.get('/check-category-title/:title', menuController.checkCategoryTitleUnique);
router.get('/check-subcategory-title/:title', menuController.checkSubCategoryTitleUnique);
router.get('/check-item-title/:title', menuController.checkItemTitleUnique);

export default router; 